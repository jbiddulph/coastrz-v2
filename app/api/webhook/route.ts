import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Get environment variables with type assertion since we check their existence
const requiredEnvVars = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
} as const;

// Check all required environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`${key} is not set`);
  }
});

const stripe = new Stripe(requiredEnvVars.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil' as any,
});

// Create Supabase admin client
const supabaseAdmin = createClient(
  requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL,
  requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      requiredEnvVars.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;

      if (!orderId) {
        throw new Error('No order ID in session metadata');
      }

      // Get order items for this order
      const { data: orderItems, error: orderItemsError } = await supabaseAdmin
        .from('order_items')
        .select('product_id')
        .eq('order_id', orderId);

      if (orderItemsError) {
        throw orderItemsError;
      }

      // Mark each product as sold out
      const productIds = orderItems.map(item => item.product_id);
      const { error: updateError } = await supabaseAdmin
        .from('products')
        .update({ status: 'sold_out' })
        .in('id', productIds);

      if (updateError) {
        throw updateError;
      }

      // Update order status to completed
      const { error: orderUpdateError } = await supabaseAdmin
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId);

      if (orderUpdateError) {
        throw orderUpdateError;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
} 