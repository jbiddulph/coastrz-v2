'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Squares2X2Icon, 
  TagIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

export default function AdminSidebar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg h-screen fixed left-0 top-0 overflow-y-auto flex flex-col">
      <div className="p-4 flex-grow">
        <Link href="/" className="flex items-center text-xl font-bold text-primary dark:text-white mb-8">
          <span className="text-2xl mr-2">🛍️</span>
          <span className="font-cooper-std">Admin</span>
        </Link>

        <nav className="space-y-2">
          <Link
            href="/admin/products"
            className={`flex items-center px-4 py-2 rounded-lg ${
              isActive('/admin/products')
                ? 'bg-primary text-white'
                : 'text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Squares2X2Icon className="h-5 w-5 mr-3" />
            Products
          </Link>

          <Link
            href="/admin/categories"
            className={`flex items-center px-4 py-2 rounded-lg ${
              isActive('/admin/categories')
                ? 'bg-primary text-white'
                : 'text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <TagIcon className="h-5 w-5 mr-3" />
            Categories
          </Link>

          <Link
            href="/admin/orders"
            className={`flex items-center px-4 py-2 rounded-lg ${
              isActive('/admin/orders')
                ? 'bg-primary text-white'
                : 'text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <ShoppingBagIcon className="h-5 w-5 mr-3" />
            Orders
          </Link>
        </nav>
      </div>

      {/* Bottom section with profile, theme toggle, and logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/admin/profile"
          className="flex items-center px-4 py-2 rounded-lg text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mb-2"
        >
          <UserCircleIcon className="h-5 w-5 mr-3" />
          Profile
        </Link>

        <button
          onClick={toggleTheme}
          className="flex items-center w-full px-4 py-2 rounded-lg text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mb-2"
        >
          {isDark ? (
            <SunIcon className="h-5 w-5 mr-3" />
          ) : (
            <MoonIcon className="h-5 w-5 mr-3" />
          )}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
} 