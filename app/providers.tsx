'use client';

import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CartProvider } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial render, render children without contexts to prevent errors
  if (!mounted) {
    return (
      <>
        {children}
        <Toaster position="bottom-right" />
      </>
    );
  }

  // Only render contexts after component has mounted on client
  return (
    <ThemeProvider>
      <CartProvider>
        {children}
        <Toaster position="bottom-right" />
      </CartProvider>
    </ThemeProvider>
  );
} 