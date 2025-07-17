import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

interface CartItem {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  cost: number;
  quantity: number;
  size?: string;
  color?: string;
  is_custom: boolean;
  design_image_url?: string;
}

interface ShippingAddress {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  email?: string;
}

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil' as any,
});

// Get environment variables
const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
} as const;

// Check required environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`${key} is not set`);
  }
});

// Create Supabase client with service role
const supabaseAdmin = createClient(
  requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL,
  requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      throw new Error('NEXT_PUBLIC_BASE_URL is not set in environment variables');
    }

    const body = await req.json();
    const { items, shippingAddress } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Please provide items to purchase' },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Please provide a shipping address' },
        { status: 400 }
      );
    }

    // Create regular client for auth check
    const supabase = createClient(
      requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    let userId = null;

    // Try to get the current user, but don't require it
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    } catch (error) {
      console.log('No authenticated user, proceeding as guest');
    }

    // Calculate total amount
    const totalAmount = items.reduce(
      (sum: number, item: CartItem) => sum + item.cost * item.quantity,
      0
    );

    // Create order record first to get the order ID using service role client
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          user_id: userId,
          status: 'pending',
          total_amount: totalAmount,
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error('Failed to create order');
    }

    const orderId = orderData.id;

    // Create delivery address record using service role client
    const { error: addressError } = await supabaseAdmin
      .from('delivery_addresses')
      .insert([
        {
          order_id: orderId,
          ...shippingAddress
        },
      ]);

    if (addressError) {
      console.error('Error creating delivery address:', addressError);
      throw new Error('Failed to create delivery address');
    }

    // Create order items using service role client
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(
        items.map((item: CartItem) => ({
          order_id: orderId,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.cost,
          design_image_url: item.is_custom ? item.design_image_url : null
        }))
      );

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw new Error('Failed to create order items');
    }

    // Update product quantities and status
    for (const item of items) {
      // Skip stock updates for custom products
      if (item.is_custom) continue;

      // Get current product data
      const { data: productData, error: productError } = await supabaseAdmin
        .from('products')
        .select('quantity')
        .eq('id', item.id)
        .single();

      if (productError) {
        console.error('Error fetching product:', productError);
        continue;
      }

      const newQuantity = (productData.quantity || 0) - item.quantity;
      const newStatus = newQuantity <= 0 ? 'sold_out' : 'in_stock';

      // Update product
      const { error: updateError } = await supabaseAdmin
        .from('products')
        .update({ 
          quantity: newQuantity,
          status: newStatus
        })
        .eq('id', item.id);

      if (updateError) {
        console.error('Error updating product:', updateError);
      }
    }

    // Handle order cancellation
    const handleOrderCancellation = async (orderId: string) => {
      // Get order items
      const { data: orderItems, error: orderItemsError } = await supabaseAdmin
        .from('order_items')
        .select('product_id')
        .eq('order_id', orderId);

      if (orderItemsError) {
        console.error('Error fetching order items:', orderItemsError);
        return;
      }

      // Restore each product's status and quantity
      for (const item of orderItems) {
        const { error: updateError } = await supabaseAdmin
          .from('products')
          .update({ 
            quantity: 1,
            status: 'in_stock'
          })
          .eq('id', item.product_id);

        if (updateError) {
          console.error('Error restoring product:', updateError);
        }
      }

      // Update order status to cancelled
      const { error: orderUpdateError } = await supabaseAdmin
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (orderUpdateError) {
        console.error('Error updating order status:', orderUpdateError);
      }
    };

    try {
      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map((item: CartItem) => ({
          price_data: {
            currency: 'gbp',
            product_data: {
              name: item.name,
              description: [
                item.description,
                item.size && `Size: ${item.size}`,
                item.color && `Color: ${item.color}`,
              ].filter(Boolean).join(' | '),
              images: item.image_url ? [item.image_url] : [],
              metadata: {
                product_id: item.id,
                size: item.size,
                color: item.color,
              }
            },
            unit_amount: Math.round(item.cost * 100), // Convert to pence
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB'], // Add more countries as needed
        },
        customer_email: userId ? undefined : shippingAddress.email,
        metadata: {
          order_id: orderId,
          user_id: userId || 'guest'
        },
        payment_intent_data: {
          metadata: {
            order_id: orderId,
            user_id: userId || 'guest'
          }
        }
      });

      // Update order with session ID
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ stripe_session_id: session.id })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order with session ID:', updateError);
        throw new Error('Failed to update order with session ID');
      }

      return NextResponse.json({ sessionId: session.id });
    } catch (stripeError: any) {
      console.error('Stripe error details:', {
        message: stripeError.message,
        type: stripeError.type,
        code: stripeError.code,
        param: stripeError.param,
      });
      throw stripeError;
    }
  } catch (error: any) {
    console.error('Error creating checkout session:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: error.message || 'Error creating checkout session' },
      { status: 500 }
    );
  }
} 