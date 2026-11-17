'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, m } from 'framer-motion';
import { ProductCard } from '@/entities/product/ui/ProductCard';
import { ProductCardSkeleton } from '@/entities/product/ui/ProductCardSkeleton';
import { buildSearchUrl } from '@/features/catalog/model/query';
import { useAddToCart } from '@/features/cart/model/use-add-to-cart';
import { CrossIcon } from '@/shared/ui/icons/CrossIcon';
import { SEARCH_MIN_LENGTH, SEARCH_PREVIEW_LIMIT, useProductSearch } from '../model/use-product-search';
import styles from './SearchOverlay.module.scss';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const screenMotion = {
  initial: { clipPath: 'inset(0 0 100% 0)' },
  animate: { clipPath: 'inset(0 0 0% 0)', transition: { duration: 0.45, ease: EASE } },
  exit: { clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.35, ease: EASE } },
};

const blockMotion = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.15, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const resultMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.12 } },
};

function SearchResults({ value, onPick }: { value: string; onPick: () => void }) {
  const { data, isFetching, enabled, term } = useProductSearch(value);
  const addToCart = useAddToCart();
  const items = data?.items ?? [];
  const showSkeleton = enabled && !data && isFetching;

  return (
    <div className={styles.results} aria-live="polite">
      <AnimatePresence mode="popLayout" initial={false}>
        {showSkeleton
          ? Array.from({ length: SEARCH_PREVIEW_LIMIT }, (_, i) => (
              <m.div key={`sk-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProductCardSkeleton />
              </m.div>
            ))
          : items.map((product, index) => (
              <m.div
                key={product.id}
                layout="position"
                {...resultMotion}
                transition={{ duration: 0.25, ease: EASE, delay: Math.min(index, 8) * 0.04 }}
                onClick={onPick}
              >
                <ProductCard product={product} onAdd={addToCart} />
              </m.div>
            ))}
      </AnimatePresence>

      {enabled && data && items.length === 0 && (
        <p className={styles.empty}>Nothing found for &ldquo;{term}&rdquo;</p>
      )}
    </div>
  );
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!open) return;
    setValue('');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = value.trim();
    if (q.length < SEARCH_MIN_LENGTH) return;
    router.push(buildSearchUrl(new URLSearchParams(window.location.search), q));
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <m.div className={styles.screen} role="dialog" aria-modal="true" aria-label="Search" {...screenMotion}>
          <m.form className={styles.block} onSubmit={handleSubmit} {...blockMotion}>
            <input
              type="search"
              name="search"
              className={styles.input}
              placeholder="Search"
              autoComplete="off"
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <button type="button" className={styles.close} aria-label="Close search" onClick={onClose}>
              <CrossIcon />
            </button>
          </m.form>

          <SearchResults value={value} onPick={onClose} />
        </m.div>
      )}
    </AnimatePresence>
  );
}
