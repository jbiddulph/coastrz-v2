'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types/types';
import { getActualPrice } from '@/utils/utils';

interface CartItem {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  cost: number;
  quantity: number;
  min_quantity: number;
  size?: string;
  color?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  isMounted: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Default values for SSR
const defaultCartContext: CartContextType = {
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  total: 0,
  isMounted: false,
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        }
      } catch (error) {
        console.error('Error parsing saved cart:', error);
      }
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      // Save cart to localStorage
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isMounted]);

  const addItem = (product: Product, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          description: product.description || undefined,
          image_url: product.image_url || undefined,
          cost: getActualPrice(product),
          quantity,
          min_quantity: product.min_quantity,
          size: product.size || undefined,
          color: product.color || undefined,
        };
        return [...prevItems, newItem];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems(prevItems => {
      const item = prevItems.find(item => item.id === id);
      if (!item) return prevItems;
      
      const minQty = item.min_quantity || 1;
      
      if (quantity <= 0 || quantity < minQty) {
        // If trying to go below minimum, either remove or set to minimum
        if (quantity <= 0) {
          return prevItems.filter(item => item.id !== id);
        } else {
          return prevItems.map(item =>
            item.id === id ? { ...item, quantity: minQty } : item
          );
        }
      } else {
        return prevItems.map(item =>
          item.id === id ? { ...item, quantity } : item
        );
      }
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);

  const contextValue: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    isMounted,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  
  // Return default values during SSR or if context is not available
  if (context === undefined) {
    return defaultCartContext;
  }
  
  return context;
} 