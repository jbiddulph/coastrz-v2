'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message. Please try again later.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-cooper-std text-primary mb-8">Contact Us</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold text-primary mb-4">Get in Touch</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Have a question or feedback? We'd love to hear from you. Fill out the form
            below and we'll get back to you as soon as possible.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-primary mb-2">Location</h3>
              <p className="text-gray-600 dark:text-gray-300">
              Vintage Emporium<br />Tarmount Studios<br />2 Tarmount Ln,<br /> Shoreham-by-Sea<br /> BN43 6DA
              </p>
            </div>

            {/* <div>
              <h3 className="text-lg font-semibold text-primary mb-2">Email</h3>
              <p className="text-gray-600 dark:text-gray-300">
                info@yourstore.com
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-primary mb-2">Phone</h3>
              <p className="text-gray-600 dark:text-gray-300">
                +44 (0) 123 456 7890
              </p>
            </div> */}
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-hover-primary text-white font-medium py-3 px-6 rounded-md transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 