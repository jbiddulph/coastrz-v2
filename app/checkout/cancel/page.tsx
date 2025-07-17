'use client';

import { useRouter } from 'next/navigation';
import { XCircleIcon } from '@heroicons/react/24/solid';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export default function CheckoutCancel() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-neutral p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <XCircleIcon className="h-16 w-16 text-danger mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-secondary mb-4 font-cooper-std">Checkout Cancelled</h1>
        <p className="text-secondary-light mb-6">
          Your checkout process was cancelled. No charges were made to your account.
        </p>
        <button
          onClick={() => router.push('/products')}
          className="px-6 py-2 bg-primary text-neutral rounded-lg hover:bg-hover-primary transition-colors"
        >
          Return to Products
        </button>
      </div>
    </div>
  );
} 