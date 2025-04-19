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

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      requiredEnvVars.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: {
          message: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}`,
        },
      }),
      { status: 400 }
    );
  }

  // Create Supabase client with service role key
  const supabase = createClient(
    requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL,
    requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY
  );

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      try {
        // Update order status to confirmed
        const { error: orderError } = await supabase
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('stripe_session_id', session.id);

        if (orderError) {
          console.error('Error updating order status:', orderError);
          throw orderError;
        }

        // For guest checkouts, create order in database
        if (!session.customer) {
          // Create order logic here
        }

        // Update delivery address
        const shippingAddress = (session as any).shipping_details?.address;
        if (shippingAddress) {
          const { error: addressError } = await supabase
            .from('delivery_addresses')
            .update({
              line1: shippingAddress.line1 || '',
              line2: shippingAddress.line2 || '',
              city: shippingAddress.city || '',
              state: shippingAddress.state || '',
              postal_code: shippingAddress.postal_code || '',
              country: shippingAddress.country || '',
            })
            .eq('order_id', session.metadata?.order_id);

          if (addressError) {
            console.error('Error updating delivery address:', addressError);
            throw addressError;
          }
        }
      } catch (error) {
        console.error('Error processing checkout.session.completed:', error);
        throw error;
      }
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;

      if (!orderId) {
        throw new Error('No order ID in session metadata');
      }

      try {
        // Update order status to expired
        const { error: orderError } = await supabase
          .from('orders')
          .update({ 
            status: 'expired',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        if (orderError) {
          console.error('Error updating order status to expired:', orderError);
          throw orderError;
        }
      } catch (error) {
        console.error('Error processing checkout.session.expired:', error);
        throw error;
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
} 