'use client';

import { useTheme } from '@/contexts/ThemeContext';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-cooper-std text-primary mb-8">About Us</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg mb-6">
          Welcome to our store! We are passionate about delivering high-quality products
          and exceptional customer service.
        </p>

        <h2 className="text-2xl font-semibold text-primary mt-8 mb-4">Our Story</h2>
        <p className="mb-6">
          Founded with a vision to provide unique and quality products, we have grown
          from a small local shop to an online destination for discerning customers.
        </p>

        <h2 className="text-2xl font-semibold text-primary mt-8 mb-4">Our Mission</h2>
        <p className="mb-6">
          We strive to offer a carefully curated selection of products while providing
          an exceptional shopping experience for our customers.
        </p>

        <h2 className="text-2xl font-semibold text-primary mt-8 mb-4">Our Values</h2>
        <ul className="list-disc pl-6 mb-6">
          <li className="mb-2">Quality and authenticity in every product</li>
          <li className="mb-2">Exceptional customer service</li>
          <li className="mb-2">Sustainable and responsible business practices</li>
          <li className="mb-2">Community engagement and support</li>
        </ul>
      </div>
    </div>
  );
} 