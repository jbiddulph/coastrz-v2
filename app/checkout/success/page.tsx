'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import Navbar from '@/components/Navbar';

export default function CheckoutSuccess() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-neutral p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-secondary mb-4 font-cooper-std">Payment Successful!</h1>
          <p className="text-secondary-light mb-6">
            Thank you for your purchase. Your order has been processed successfully.
          </p>
          <Link 
            href="/"
            className="inline-block px-6 py-2 bg-primary text-neutral rounded-lg hover:bg-hover-primary transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </>
  );
} 