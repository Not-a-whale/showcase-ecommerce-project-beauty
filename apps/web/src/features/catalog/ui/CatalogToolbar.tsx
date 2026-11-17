'use client';

import Image from 'next/image';
import type { SortType } from '@/entities/product/model/types';
import type { Category } from '@/entities/category/model/types';
import { Dropdown } from '@/shared/ui/Dropdown/Dropdown';
import { type CatalogView, SORT_OPTIONS } from '../model/view';
import styles from './CatalogToolbar.module.scss';

const ALL_CATEGORIES = 'all';

interface CatalogToolbarProps {
  sort: SortType;
  category?: string;
  categories: Category[];
  view: CatalogView;
  onSortChange: (sort: SortType) => void;
  onCategoryChange: (category: string | undefined) => void;
  onViewChange: (view: CatalogView) => void;
}

export function CatalogToolbar({
  sort,
  category,
  categories,
  view,
  onSortChange,
  onCategoryChange,
  onViewChange,
}: CatalogToolbarProps) {
  const categoryOptions = [
    { value: ALL_CATEGORIES, label: 'Products' },
    ...categories.map((c) => ({ value: c.slug, label: c.name })),
  ];

  return (
    <div className={styles.toolbar}>
      <div className={styles.sorting}>
        <label className={styles.sorter}>
          <span className={styles.sorterText}>sort by:</span>
          <Dropdown
            ariaLabel="Sort by"
            value={sort}
            options={SORT_OPTIONS}
            onChange={onSortChange}
            className={styles.dropdown}
          />
        </label>

        <label className={styles.sorter}>
          <span className={styles.sorterText}>category:</span>
          <Dropdown
            ariaLabel="Category"
            value={category ?? ALL_CATEGORIES}
            options={categoryOptions}
            onChange={(value) => onCategoryChange(value === ALL_CATEGORIES ? undefined : value)}
            className={styles.dropdown}
          />
        </label>
      </div>

      <div className={styles.views} role="group" aria-label="Grid density">
        <button
          type="button"
          className={styles.viewButton}
          aria-label="Large tiles"
          aria-pressed={view === 'large'}
          onClick={() => onViewChange('large')}
        >
          <Image src="/icons/grid-2.svg" alt="" width={12} height={12} />
        </button>
        <button
          type="button"
          className={styles.viewButton}
          aria-label="Small tiles"
          aria-pressed={view === 'small'}
          onClick={() => onViewChange('small')}
        >
          <Image src="/icons/grid-3.svg" alt="" width={12} height={12} />
        </button>
      </div>
    </div>
  );
}
