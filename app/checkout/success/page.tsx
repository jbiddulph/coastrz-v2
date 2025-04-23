'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { Navbar } from '@/components/Navbar';

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const sessionId = searchParams?.get('session_id');
        if (!sessionId) {
          setError('No session ID found');
          setIsVerifying(false);
          return;
        }

        const response = await fetch(`/api/verify-session?session_id=${sessionId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify payment');
        }

        // If verification successful, clear the cart
        clearCart();
        setIsVerifying(false);
      } catch (err: any) {
        console.error('Error verifying session:', err);
        setError(err.message || 'Failed to verify payment');
        setIsVerifying(false);
      }
    };

    verifySession();
  }, [searchParams, clearCart]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {isVerifying ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-lg text-gray-600">Verifying your payment...</p>
            </div>
          ) : error ? (
            <div className="bg-white shadow sm:rounded-lg p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-red-600 mb-4">
                  {error}
                </h3>
                <Link
                  href="/cart"
                  className="inline-block bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
                >
                  Return to Cart
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow sm:rounded-lg p-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Thank you for your order!
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Your payment has been successfully processed.
                </p>
                <Link
                  href="/"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 