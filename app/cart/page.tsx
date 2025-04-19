'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import ShoppingCart from '@/components/ShoppingCart';
import Navbar from '@/components/Navbar';

export default function CartPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-main">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-secondary hover:text-primary mb-6 transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Continue Shopping
        </button>

        <div className="bg-white rounded-lg shadow-lg">
          <ShoppingCart />
        </div>
      </div>
    </div>
  );
} 