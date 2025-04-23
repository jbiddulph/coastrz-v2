import { create } from 'zustand';
import { CartItem } from '@/types/types';
import { StateCreator } from 'zustand';

interface CartState {
  items: CartItem[];
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  total: 0,
  addItem: (item: CartItem) =>
    set((state) => {
      const existingItem = state.items.find((i) => i.id === item.id);
      if (existingItem) {
        const updatedItems = state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
        return {
          items: updatedItems,
          total: updatedItems.reduce((sum, i) => sum + i.cost * i.quantity, 0),
        };
      }
      const newItems = [...state.items, { ...item, quantity: 1 }];
      return {
        items: newItems,
        total: newItems.reduce((sum, i) => sum + i.cost * i.quantity, 0),
      };
    }),
  removeItem: (productId: string) =>
    set((state) => {
      const newItems = state.items.filter((i) => i.id !== productId);
      return {
        items: newItems,
        total: newItems.reduce((sum, i) => sum + i.cost * i.quantity, 0),
      };
    }),
  updateQuantity: (productId: string, quantity: number) =>
    set((state) => {
      if (quantity < 1) {
        const newItems = state.items.filter((i) => i.id !== productId);
        return {
          items: newItems,
          total: newItems.reduce((sum, i) => sum + i.cost * i.quantity, 0),
        };
      }
      const newItems = state.items.map((i) =>
        i.id === productId ? { ...i, quantity } : i
      );
      return {
        items: newItems,
        total: newItems.reduce((sum, i) => sum + i.cost * i.quantity, 0),
      };
    }),
  clearCart: () => set({ items: [], total: 0 }),
})); 