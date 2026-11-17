'use client';
import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { AnimatePresence, m } from 'framer-motion';
import { getProductsClient } from '@/entities/product/api/products.api';
import { productsKeys } from '@/entities/product/model/query-keys';
import { PRODUCTS_PAGE_LIMIT } from '@/entities/product/model/constants';
import type { ProductsQuery } from '@/entities/product/model/types';
import { ProductCard } from '@/entities/product/ui/ProductCard';
import { ProductCardSkeleton } from '@/entities/product/ui/ProductCardSkeleton';
import { useDelayedFlag } from '@/shared/lib/use-delayed-flag';
import { useAddToCart } from '@/features/cart/model/use-add-to-cart';
import type { CatalogView } from '../model/view';
import styles from './ProductGrid.module.scss';

interface ProductGridProps {
  query: ProductsQuery;
  view?: CatalogView;
  isPending?: boolean;
}

const STAGGER = 0.035;
const MAX_STAGGER_ITEMS = 12;

const cardMotion = {
  layout: 'position' as const,
  initial: { opacity: 0, y: 18, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.14 } },
};

const skeletonMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export function ProductGrid({ query, view = 'small', isPending = false }: ProductGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const limit = query.limit ?? PRODUCTS_PAGE_LIMIT;
  const showPendingSkeleton = useDelayedFlag(isPending, 120);
  const addToCart = useAddToCart();

  const {
    data,
    status,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: productsKeys.list(query),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      getProductsClient({ ...query, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: '400px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === 'error') {
    return (
      <p role="alert" className={styles.state}>
        Could not load products: {error.message}
      </p>
    );
  }

  const pages = data?.pages ?? [];
  const products = pages.flatMap((page) => page.items);
  const showSkeletonGrid = status === 'pending' || showPendingSkeleton;
  const skeletonCount = showSkeletonGrid ? Math.min(Math.max(products.length, limit), 48) : 0;
  const nextPageSkeletons = isFetchingNextPage ? Math.min(limit, 8) : 0;

  if (!showSkeletonGrid && products.length === 0) {
    return <p className={styles.state}>No products found.</p>;
  }

  return (
    <>
      <div className={styles.grid} data-view={view} aria-busy={showSkeletonGrid || isFetchingNextPage}>
        <AnimatePresence mode="popLayout" initial={false}>
          {showSkeletonGrid
            ? Array.from({ length: skeletonCount }, (_, i) => (
                <m.div key={`skeleton-${i}`} {...skeletonMotion}>
                  <ProductCardSkeleton />
                </m.div>
              ))
            : pages.flatMap((page, pageIndex) =>
                page.items.map((product, index) => (
                  <m.div
                    key={product.id}
                    {...cardMotion}
                    transition={{
                      duration: 0.28,
                      ease: [0.22, 1, 0.36, 1],
                      delay: Math.min(index, MAX_STAGGER_ITEMS) * STAGGER,
                      layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                    }}
                    data-page={pageIndex}
                  >
                    <ProductCard product={product} onAdd={addToCart} />
                  </m.div>
                )),
              )}
        </AnimatePresence>

        {Array.from({ length: nextPageSkeletons }, (_, i) => (
          <ProductCardSkeleton key={`next-${i}`} />
        ))}
      </div>

      <div ref={sentinelRef} className={styles.sentinel} aria-hidden />

      {hasNextPage && !isFetchingNextPage && !showSkeletonGrid && (
        <div className={styles.more}>
          <button type="button" className={styles.moreButton} onClick={() => fetchNextPage()}>
            Load more
          </button>
        </div>
      )}
    </>
  );
}
