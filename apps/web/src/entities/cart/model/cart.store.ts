import { create } from 'zustand';

interface CartState {
  items: Record<string, number>;
  count: number;
  add: (productId: string, quantity?: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const countOf = (items: Record<string, number>) =>
  Object.values(items).reduce((sum, qty) => sum + qty, 0);

export const useCartStore = create<CartState>()((set) => ({
  items: {},
  count: 0,
  add: (productId, quantity = 1) =>
    set((state) => {
      const items = { ...state.items, [productId]: (state.items[productId] ?? 0) + quantity };
      return { items, count: countOf(items) };
    }),
  remove: (productId) =>
    set((state) => {
      const items = { ...state.items };
      delete items[productId];
      return { items, count: countOf(items) };
    }),
  clear: () => set({ items: {}, count: 0 }),
}));

export const useCartCount = () => useCartStore((state) => state.count);
