import { create } from 'zustand';

export interface Flight {
  id: number;
  src: string;
  from: { left: number; top: number; width: number; height: number };
}

interface FlyToCartState {
  target: HTMLElement | null;
  flights: Flight[];
  setTarget: (el: HTMLElement | null) => void;
  launch: (src: string, from: DOMRect) => void;
  land: (id: number) => void;
}

let nextId = 1;

export const useFlyToCartStore = create<FlyToCartState>()((set) => ({
  target: null,
  flights: [],
  setTarget: (el) => set({ target: el }),
  launch: (src, from) =>
    set((state) => ({
      flights: [
        ...state.flights,
        { id: nextId++, src, from: { left: from.left, top: from.top, width: from.width, height: from.height } },
      ],
    })),
  land: (id) => set((state) => ({ flights: state.flights.filter((f) => f.id !== id) })),
}));
