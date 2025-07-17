'use client';

export const dynamic = 'force-dynamic';

export default function GlobalError({ error, reset }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">500</h1>
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
          Something went wrong!
        </h2>
        <p className="text-gray-600 mb-8">
          An error occurred while loading this page.
        </p>
        <button
          onClick={reset}
          className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}