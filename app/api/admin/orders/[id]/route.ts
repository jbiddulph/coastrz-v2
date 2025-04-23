import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        delivery_addresses!order_id (
          *
        ),
        order_items (
          *,
          product:products (
            name,
            image_url
          )
        )
      `)
      .eq('id', params.id)
      .single();

    if (orderError) {
      console.error('Order Error:', orderError);
      throw orderError;
    }

    if (!orderData) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Transform delivery_addresses from array to single object
    if (Array.isArray(orderData.delivery_addresses) && orderData.delivery_addresses.length > 0) {
      orderData.delivery_addresses = orderData.delivery_addresses[0];
    }

    // Fetch user email if user_id exists
    if (orderData.user_id) {
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('id', orderData.user_id)
        .single();

      if (!userError && userData) {
        orderData.user_email = userData.email;
      }
    }

    console.log('Order Data:', orderData); // Add this for debugging

    return NextResponse.json(orderData);
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // First update the order
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id);

    if (updateError) throw updateError;

    // If the order is being cancelled, restore product quantities
    if (status === 'cancelled') {
      // Get order items
      const { data: orderItems, error: orderItemsError } = await supabaseAdmin
        .from('order_items')
        .select('product_id')
        .eq('order_id', params.id);

      if (orderItemsError) {
        console.error('Error fetching order items:', orderItemsError);
      } else {
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
      }
    }

    // Then fetch the complete updated order data
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        delivery_addresses!order_id (
          *
        ),
        order_items (
          *,
          product:products (
            name,
            image_url
          )
        )
      `)
      .eq('id', params.id)
      .single();

    if (orderError) throw orderError;

    // Transform delivery_addresses from array to single object
    if (Array.isArray(orderData.delivery_addresses) && orderData.delivery_addresses.length > 0) {
      orderData.delivery_addresses = orderData.delivery_addresses[0];
    }

    // Fetch user email if user_id exists
    if (orderData.user_id) {
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('id', orderData.user_id)
        .single();

      if (!userError && userData) {
        orderData.user_email = userData.email;
      }
    }

    return NextResponse.json(orderData);
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: error.message || 'Error updating order' },
      { status: 500 }
    );
  }
} 