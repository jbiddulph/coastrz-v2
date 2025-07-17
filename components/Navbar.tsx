'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { items, isMounted } = useCart();
  const { theme } = useTheme();
  const pathname = usePathname();
  
  // Don't render navbar on admin routes
  const isAdminRoute = pathname?.startsWith('/admin');
  if (isAdminRoute) {
    return null;
  }

  const isDarkMode = theme === 'dark';

  const menuItems = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
  ];

  return (
    <nav 
      className="shadow-md transition-colors duration-200" 
      style={{ 
        backgroundColor: 'var(--color-bg-secondary)',
        borderBottom: '2px solid var(--color-secondary)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center text-2xl font-bold text-primary">
                <span className="text-2xl" style={{ zIndex: 111, marginTop: '14px' }}><img src="/images/coastrz_logo.png" alt="Coastrz" /></span>{' '}
                {/* <span className="font-cooper-std">Shop</span> */}
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:border-white' 
                      : 'text-secondary hover:text-primary hover:border-primary'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            <Link href="/cart" className="relative p-2 text-secondary hover:text-primary transition-colors">
              <ShoppingBagIcon className="h-6 w-6" />
              {isMounted && items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            <Link 
              href="/login" 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isDarkMode 
                  ? 'text-white bg-gray-700 hover:bg-gray-600' 
                  : 'text-white bg-primary hover:bg-hover-primary'
              }`}
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 