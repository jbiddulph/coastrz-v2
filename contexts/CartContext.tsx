'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '@/types/types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  isMounted: boolean;
}

// Provide a default context value to prevent null errors during SSR
const defaultContextValue: CartContextType = {
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  total: 0,
  isMounted: false,
};

const CartContext = createContext<CartContextType>(defaultContextValue);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Load cart from localStorage on mount
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
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

  useEffect(() => {
    // Calculate total whenever items change
    const newTotal = items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
    setTotal(newTotal);
  }, [items]);

  const addItem = (product: Product) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        const cartItem: CartItem = {
          id: product.id,
          name: product.name,
          description: product.description || undefined,
          image_url: product.image_url || undefined,
          cost: product.cost,
          quantity: 1,
          size: product.size || undefined,
          color: product.color || undefined,
          is_custom: product.is_custom,
          design_image_url: undefined
        };
        return [...prevItems, cartItem];
      }
    });
  };

  const removeItem = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      total,
      isMounted
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    // Return default values if context is not available (during SSR)
    return defaultContextValue;
  }
  return context;
} 