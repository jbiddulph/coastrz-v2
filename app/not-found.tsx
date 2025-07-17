'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

export default function NotFound() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4" style={{ color: isDarkMode ? 'var(--color-secondary)' : 'var(--color-secondary)' }}>
          Page Not Found
        </h2>
        <p className="text-secondary-light mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link 
          href="/"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-hover-primary transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
} 