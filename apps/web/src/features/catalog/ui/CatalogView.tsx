'use client';

import { useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { PRODUCTS_PAGE_LIMIT } from '@/entities/product/model/constants';
import type { Category } from '@/entities/category/model/types';
import type { CatalogView as CatalogViewMode } from '../model/view';
import { useCatalogParams } from '../model/use-catalog-params';
import { CatalogToolbar } from './CatalogToolbar';
import { PageSizeSelect } from './PageSizeSelect';
import { ProductGrid } from './ProductGrid';
import styles from './CatalogView.module.scss';

interface CatalogViewProps {
  categories: Category[];
}

export function CatalogView({ categories }: CatalogViewProps) {
  const { query, isPending, setParam } = useCatalogParams();
  const [view, setView] = useState<CatalogViewMode>('small');

  return (
    <>
      <CatalogToolbar
        sort={query.sort ?? 'newest'}
        category={query.category}
        categories={categories}
        view={view}
        onSortChange={(sort) => setParam('sort', sort)}
        onCategoryChange={(category) => setParam('category', category)}
        onViewChange={setView}
      />

      <AnimatePresence initial={false}>
        {(query.search || query.sale) && (
          <m.div
            key="filter-notice"
            className={styles.searchNotice}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.searchNoticeInner}>
              <span>
                {query.search ? (
                  <>Results for &ldquo;{query.search}&rdquo;</>
                ) : (
                  'On sale'
                )}
              </span>
              <button
                type="button"
                className={styles.clear}
                aria-label={query.search ? 'Clear search' : 'Clear sale filter'}
                onClick={() => setParam(query.search ? 'search' : 'sale', undefined)}
              >
                &times;
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <ProductGrid query={query} view={view} isPending={isPending} />

      <PageSizeSelect
        pageSize={query.limit ?? PRODUCTS_PAGE_LIMIT}
        onPageSizeChange={(limit) => setParam('limit', String(limit))}
      />
    </>
  );
}
