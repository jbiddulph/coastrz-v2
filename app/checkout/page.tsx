import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { DeliveryAddressForm, DeliveryAddressFormData } from '@/components/DeliveryAddressForm';
import { redirect } from 'next/navigation';
import { Database } from '@/types/supabase';

interface CartItem {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  cost: number;
  quantity: number;
  size?: string;
  color?: string;
  gender?: "male" | "female" | "unisex";
}

interface ProductImage {
  image_url: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  cost: number;
  size: string | null;
  color: string | null;
  gender: "male" | "female" | "unisex" | null;
  product_images: ProductImage[];
}

interface CartItemWithProduct {
  quantity: number;
  products: Product;
}

async function getCartItems(): Promise<CartItem[]> {
  const cookieStore = cookies();
  const supabase = createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get cart items from the database if user is logged in
    if (user) {
      const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select(`
          quantity,
          products (
            id,
            name,
            description,
            cost,
            size,
            color,
            gender,
            product_images (
              image_url
            )
          )
        `)
        .eq('user_id', user.id)
        .returns<CartItemWithProduct[]>();

      if (error) throw error;

      return cartItems.map(item => ({
        id: item.products.id,
        name: item.products.name,
        description: item.products.description,
        image_url: item.products.product_images?.[0]?.image_url,
        cost: item.products.cost,
        size: item.products.size || undefined,
        color: item.products.color || undefined,
        gender: item.products.gender || undefined,
        quantity: item.quantity
      }));
    }
    
    // Get cart items from cookies if user is not logged in
    const cartCookie = cookieStore.get('cart');
    if (cartCookie) {
      return JSON.parse(cartCookie.value);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }
}

export default async function CheckoutPage() {
  const cartItems = await getCartItems();
  
  if (!cartItems || cartItems.length === 0) {
    redirect('/cart');
  }

  const totalAmount = cartItems.reduce(
    (sum: number, item: CartItem) => sum + item.cost * item.quantity,
    0
  );

  async function handleDeliveryAddress(data: DeliveryAddressFormData) {
    'use server';

    const shippingAddress = {
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      address_line1: data.address_line1,
      address_line2: data.address_line2,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      country: data.country,
    };

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          shippingAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      redirect(`https://checkout.stripe.com/c/pay/${data.sessionId}`);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {cartItems.map((item: CartItem) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <div className="text-sm text-gray-500">
                    <p>Quantity: {item.quantity}</p>
                    {item.size && <p>Size: {item.size}</p>}
                    {item.color && <p>Color: {item.color}</p>}
                    {item.gender && <p>Gender: {item.gender}</p>}
                  </div>
                </div>
                <p className="font-medium">£{(item.cost * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center font-bold">
                <p>Total</p>
                <p>£{totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
          <Suspense fallback={<div>Loading...</div>}>
            <DeliveryAddressForm onSubmit={handleDeliveryAddress} />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 