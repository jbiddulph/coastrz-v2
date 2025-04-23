'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBagIcon, Bars3Icon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { items } = useCart();
  const itemCount = items.length;

  const menuItems = [
    { name: 'All Products', href: '/' },
    // { name: 'New Arrivals', href: '/?sort=new' },
    // { name: 'Featured', href: '/?sort=featured' },
    // { name: 'Sale', href: '/?sort=sale' },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center text-2xl font-bold text-primary">
                <span className="text-2xl"><img src="/images/cef_logo.png" alt="Cissie Ednas Fancies" /></span>{' '}
                {/* <span className="font-cooper-std">Shop</span> */}
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-secondary hover:text-primary border-b-2 border-transparent hover:border-primary"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/cart"
              className="p-2 text-secondary hover:text-primary relative"
            >
              <ShoppingBagIcon className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            <Link
              href="/login"
              className="p-2 text-secondary hover:text-primary"
            >
              <UserIcon className="h-6 w-6" />
            </Link>

            <div className="sm:hidden">
              <button
                type="button"
                className="p-2 text-secondary hover:text-primary"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-base font-medium text-secondary hover:text-primary hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
} 