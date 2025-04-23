import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
} as const;

// Create Supabase admin client
const supabaseAdmin = createClient(
  requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL,
  requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get order items
    const { data: orderItems, error: orderItemsError } = await supabaseAdmin
      .from('order_items')
      .select('product_id')
      .eq('order_id', orderId);

    if (orderItemsError) {
      console.error('Error fetching order items:', orderItemsError);
      return NextResponse.json(
        { error: 'Failed to fetch order items' },
        { status: 500 }
      );
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
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: error.message || 'Error cancelling order' },
      { status: 500 }
    );
  }
} 