import { create } from 'zustand';
import type { MenuItem } from '../lib/api';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalAmount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (menuItem) => {
    const existing = get().items.find(i => i.menuItem.id === menuItem.id);
    if (existing) {
      get().updateQuantity(menuItem.id, existing.quantity + 1);
    } else {
      set(state => ({ items: [...state.items, { menuItem, quantity: 1 }] }));
    }
  },
  removeItem: (itemId) => {
    set(state => ({ items: state.items.filter(i => i.menuItem.id !== itemId) }));
  },
  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set(state => ({
      items: state.items.map(i =>
        i.menuItem.id === itemId ? { ...i, quantity: Math.min(quantity, i.menuItem.maxPerOrder) } : i
      ),
    }));
  },
  clearCart: () => set({ items: [] }),
  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalAmount: () => get().items.reduce((sum, i) => sum + Number(i.menuItem.price) * i.quantity, 0),
}));
