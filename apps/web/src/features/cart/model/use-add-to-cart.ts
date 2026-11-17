'use client';

import { useCallback } from 'react';
import type { Product } from '@/entities/product/model/types';
import { useCartStore } from '@/entities/cart/model/cart.store';
import { useFlyToCartStore } from './fly-to-cart.store';

export function useAddToCart() {
  const add = useCartStore((s) => s.add);
  const launch = useFlyToCartStore((s) => s.launch);

  return useCallback(
    (product: Product, mediaEl: HTMLElement | null) => {
      const img = mediaEl?.querySelector('img');
      if (img && img.currentSrc) launch(img.currentSrc, img.getBoundingClientRect());
      add(product.id);
    },
    [add, launch],
  );
}
