'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">500</h1>
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
          Something went wrong!
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          An error occurred while loading this page.
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          <Link 
            href="/"
            className="inline-block bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
} 