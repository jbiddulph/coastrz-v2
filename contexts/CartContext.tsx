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
        setItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    // Calculate total whenever items change
    const newTotal = items.reduce((sum, item) => sum + item.cost * item.quantity, 0);
    setTotal(newTotal);
    
    // Save to localStorage
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [items, isMounted]);

  const addItem = (product: Product) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // If item exists, increment quantity
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      // If item doesn't exist, add it with quantity 1
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
      
      return [...currentItems, cartItem];
    });
  };

  const removeItem = (productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Provide a default context value during SSR
  const contextValue: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    isMounted
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  return context;
} 