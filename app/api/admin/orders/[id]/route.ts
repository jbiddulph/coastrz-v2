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
        delivery_addresses (*),
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

    if (!orderData) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
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

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (orderError) throw orderError;

    return NextResponse.json(orderData);
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: error.message || 'Error updating order' },
      { status: 500 }
    );
  }
} 