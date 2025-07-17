'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const { theme } = useTheme();
  const pathname = usePathname();
  
  // Don't render footer on admin routes
  const isAdminRoute = pathname?.startsWith('/admin');
  if (isAdminRoute) {
    return null;
  }

  const isDarkMode = theme === 'dark';

  return (
    <footer 
      className="py-8 transition-colors duration-200" 
      style={{ backgroundColor: 'var(--color-bg-secondary)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img src="/images/coastrz_footer_logo.png" alt="Coastrz" className="h-8" />
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
              Design and order your own custom coasters. High-quality, personalized coasters for your home or business.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/products" 
                  className={`text-sm hover:text-primary transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  Products
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className={`text-sm hover:text-primary transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className={`text-sm hover:text-primary transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  href="/faq" 
                  className={`text-sm hover:text-primary transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/shipping" 
                  className={`text-sm hover:text-primary transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link 
                  href="/returns" 
                  className={`text-sm hover:text-primary transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  Returns
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className={`text-sm hover:text-primary transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8" style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              © 2024 Coastrz. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link 
                href="/privacy" 
                className={`text-sm hover:text-primary transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className={`text-sm hover:text-primary transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 