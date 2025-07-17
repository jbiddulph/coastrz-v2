'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const faqs: FAQItem[] = [
    {
      category: 'orders',
      question: 'How do I track my order?',
      answer: 'Once your order is dispatched, you will receive a confirmation email with a tracking number. You can use this number to track your order on our website or directly through the courier\'s website.'
    },
    {
      category: 'orders',
      question: 'Can I modify or cancel my order?',
      answer: 'You can modify or cancel your order within 1 hour of placing it. After this time, please contact our customer service team for assistance.'
    },
    {
      category: 'shipping',
      question: 'How long will delivery take?',
      answer: 'Standard delivery takes 3-5 working days within the UK. Express delivery is available for next-day delivery if ordered before 2pm Monday-Friday.'
    },
    {
      category: 'shipping',
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship to most countries worldwide. International delivery typically takes 5-14 working days depending on the destination.'
    },
    {
      category: 'returns',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for unused items in their original condition. Please visit our Returns page for detailed information.'
    },
    {
      category: 'returns',
      question: 'How do I return an item?',
      answer: 'To return an item, log into your account, select the order containing the item you wish to return, and follow the return instructions. You can also visit our Returns page for step-by-step guidance.'
    },
    {
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit and debit cards, PayPal, Apple Pay, and Google Pay.'
    },
    {
      category: 'payment',
      question: 'Is my payment information secure?',
      answer: 'Yes, all payments are processed securely through Stripe. We never store your card details on our servers.'
    }
  ];

  const categories = ['all', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  const filteredFaqs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-cooper-std text-primary mb-8">Frequently Asked Questions</h1>
      
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                activeCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-neutral text-secondary hover:bg-primary-light'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredFaqs.map((faq, index) => (
          <div
            key={index}
            className="border border-secondary-border rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-neutral"
            >
              <span className="text-lg font-medium text-secondary">{faq.question}</span>
              <span className="text-primary ml-4">
                {activeIndex === index ? '−' : '+'}
              </span>
            </button>
            {activeIndex === index && (
              <div className="px-6 py-4 bg-neutral">
                <p className="text-secondary">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-neutral rounded-lg">
        <h2 className="text-2xl font-semibold text-primary mb-4">Still Have Questions?</h2>
        <p className="text-secondary mb-4">
          Can't find the answer you're looking for? Please use our <Link href="/contact" className="text-primary hover:text-primary-dark underline">contact form</Link>.
        </p>
        {/* <div className="space-y-2 text-secondary">
          <p>Email: support@mcpstore.com</p>
          <p>Phone: 0800 123 4567</p>
          <p>Hours: Monday-Friday, 9am-5pm GMT</p>
        </div> */}
      </div>
    </div>
  );
} 