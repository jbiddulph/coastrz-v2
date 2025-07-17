'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types/types';

interface CartItem {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  cost: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isMounted: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Load cart from localStorage on mount
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        }
      }
    } catch (error) {
      console.warn('Could not load cart from localStorage:', error);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever items change
    if (isMounted) {
      try {
        localStorage.setItem('cart', JSON.stringify(items));
      } catch (error) {
        console.warn('Could not save cart to localStorage:', error);
      }
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
          cost: product.cost,
          quantity,
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
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Provide default values during SSR
  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isMounted,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    // Return default values if context is not available (during SSR)
    return {
      items: [],
      addItem: () => {},
      removeItem: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      isMounted: false,
    };
  }
  return context;
} 