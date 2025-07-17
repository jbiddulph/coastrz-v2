'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import { DeliveryAddressForm, type DeliveryAddressFormData } from '@/app/components/DeliveryAddressForm';
import { Database } from '@/types/supabase';

// Force dynamic rendering to prevent static generation errors
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
  product_images: ProductImage[];
}

interface CartItemWithProduct {
  quantity: number;
  products: Product;
}

export default function CheckoutPage() {
  const { items: cartItems } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      router.push('/cart');
    }
  }, [cartItems, router]);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="mb-4">Please add some items to your cart before checkout.</p>
          <button 
            onClick={() => router.push('/products')}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-hover-primary transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = cartItems.reduce(
    (sum: number, item: CartItem) => sum + item.cost * item.quantity,
    0
  );

  async function handleDeliveryAddress(data: DeliveryAddressFormData) {
    setLoading(true);

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

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = `https://checkout.stripe.com/c/pay/${responseData.sessionId}`;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to create checkout session. Please try again.');
    } finally {
      setLoading(false);
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
          <DeliveryAddressForm onSubmit={handleDeliveryAddress} />
          {loading && (
            <div className="mt-4 text-center">
              <p>Creating checkout session...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 