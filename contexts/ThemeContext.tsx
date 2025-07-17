'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// Provide a default context value to prevent null errors during SSR
const defaultContextValue: ThemeContextType = {
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
};

const ThemeContext = createContext<ThemeContextType>(defaultContextValue);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // On mount, read the theme from localStorage or system preference
    try {
      const savedTheme = localStorage.getItem('theme') as Theme;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedTheme) {
        setThemeState(savedTheme);
      } else if (prefersDark) {
        setThemeState('dark');
      }
    } catch (error) {
      console.warn('Could not read theme from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      // Update document class and CSS variables
      document.documentElement.classList.toggle('dark', theme === 'dark');
      
      // Set CSS custom properties
      if (theme === 'dark') {
        document.documentElement.style.setProperty('--color-bg-main', '#1a1a1a');
        document.documentElement.style.setProperty('--color-bg-secondary', '#2d2d2d');
        document.documentElement.style.setProperty('--color-text-primary', '#ffffff');
        document.documentElement.style.setProperty('--color-text-secondary', '#e5e5e5');
        document.documentElement.style.setProperty('--color-border', '#404040');
      } else {
        document.documentElement.style.setProperty('--color-bg-main', '#ffffff');
        document.documentElement.style.setProperty('--color-bg-secondary', '#f9fafb');
        document.documentElement.style.setProperty('--color-text-primary', '#111827');
        document.documentElement.style.setProperty('--color-text-secondary', '#6b7280');
        document.documentElement.style.setProperty('--color-border', '#d1d5db');
      }
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.warn('Could not save theme to localStorage:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return default values if context is not available (during SSR)
    return defaultContextValue;
  }
  return context;
} 