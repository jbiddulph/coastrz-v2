'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { getStripe } from '@/utils/stripe';
import { XMarkIcon } from '@heroicons/react/24/solid';
import ShippingAddressForm from './ShippingAddressForm';

interface ShippingAddress {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export default function ShoppingCart() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);

  const handleCheckout = async (address: ShippingAddress) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          items,
          shippingAddress: address 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error during checkout');
      }

      const { sessionId } = data;

      // Redirect to Stripe checkout
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : 'Error during checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShippingSubmit = (address: ShippingAddress) => {
    setShippingAddress(address);
    handleCheckout(address);
  };

  if (items.length === 0) {
    return (
      <div className="p-4 text-center text-secondary-light">
        Your cart is empty
      </div>
    );
  }

  if (showShippingForm) {
    return (
      <div className="p-4">
        <ShippingAddressForm
          onSubmit={handleShippingSubmit}
          onCancel={() => setShowShippingForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-secondary">Shopping Cart</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 bg-neutral rounded-lg p-4 shadow-sm"
          >
            <div className="w-16 h-16 relative flex-shrink-0">
              <img
                src={item.image_url || '/placeholder.png'}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover rounded-md"
              />
            </div>
            <div className="flex-grow">
              <h3 className="font-medium text-secondary">{item.name}</h3>
              <p className="text-sm text-secondary-light">£{item.cost.toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                className="w-16 p-1 border border-secondary-border rounded text-center"
              />
              <button
                onClick={() => removeItem(item.id)}
                className="p-1 text-danger hover:text-hover-danger"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-secondary-border pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-medium text-secondary">Total:</span>
          <span className="text-xl font-bold text-primary">£{total.toFixed(2)}</span>
        </div>
        <button
          onClick={() => setShowShippingForm(true)}
          disabled={isLoading}
          className="w-full py-3 bg-primary text-neutral rounded-lg hover:bg-hover-primary transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Proceed to Checkout'}
        </button>
      </div>
    </div>
  );
} 