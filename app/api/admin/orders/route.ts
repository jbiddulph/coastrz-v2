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

export async function GET() {
  try {
    const { data: ordersData, error: ordersError } = await supabaseAdmin
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
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    // Fetch user emails for the orders
    const userIds = ordersData
      ?.map(order => order.user_id)
      .filter(id => id != null) as string[];

    if (userIds.length > 0) {
      const { data: usersData, error: usersError } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .in('id', userIds);

      if (usersError) throw usersError;

      // Map user emails to orders
      const ordersWithEmails = ordersData?.map(order => ({
        ...order,
        user_email: usersData?.find(user => user.id === order.user_id)?.email
      }));

      return NextResponse.json(ordersWithEmails);
    }

    return NextResponse.json(ordersData);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching orders' },
      { status: 500 }
    );
  }
} 