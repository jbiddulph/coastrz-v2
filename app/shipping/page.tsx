'use client';

import { useTheme } from '@/contexts/ThemeContext';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-cooper-std text-primary mb-8">Shipping Information</h1>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">Delivery Options</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-neutral p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-primary mb-3">Standard Delivery</h3>
              <p className="text-secondary mb-2">3-5 working days</p>
              <p className="text-secondary mb-2">£4.99</p>
              <p className="text-sm text-secondary-light">Free for orders over £50</p>
            </div>
            <div className="bg-neutral p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-primary mb-3">Express Delivery</h3>
              <p className="text-secondary mb-2">1-2 working days</p>
              <p className="text-secondary mb-2">£7.99</p>
              <p className="text-sm text-secondary-light">Order by 2pm for next day delivery</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">Shipping Policy</h2>
          <ul className="list-disc pl-6 space-y-3 text-secondary">
            <li>We ship to all UK addresses including Northern Ireland</li>
            <li>Orders are processed and shipped Monday-Friday</li>
            <li>You will receive a tracking number once your order is dispatched</li>
            <li>We use trusted courier services for all deliveries</li>
            <li>Additional charges may apply for remote areas</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">International Shipping</h2>
          <p className="text-secondary mb-4">
            We currently ship to the following regions:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-neutral p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-primary mb-3">European Union</h3>
              <p className="text-secondary mb-2">5-7 working days</p>
              <p className="text-secondary mb-2">From £9.99</p>
            </div>
            <div className="bg-neutral p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-primary mb-3">Rest of World</h3>
              <p className="text-secondary mb-2">7-14 working days</p>
              <p className="text-secondary mb-2">From £14.99</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-primary mb-4">Need Help?</h2>
          <p className="text-secondary">
            If you have any questions about shipping or delivery, please contact our customer service team:
          </p>
          <ul className="mt-4 space-y-2 text-secondary">
            <li>Email: support@mcpstore.com</li>
            <li>Phone: 0800 123 4567</li>
            <li>Hours: Monday-Friday, 9am-5pm GMT</li>
          </ul>
        </section>
      </div>
    </div>
  );
} 