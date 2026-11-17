'use client';

import { Dropdown } from '@/shared/ui/Dropdown/Dropdown';
import { PAGE_SIZE_OPTIONS } from '../model/view';
import styles from './PageSizeSelect.module.scss';

interface PageSizeSelectProps {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
}

export function PageSizeSelect({ pageSize, onPageSizeChange }: PageSizeSelectProps) {
  const sizeValue = String(pageSize) as (typeof PAGE_SIZE_OPTIONS)[number]['value'];

  return (
    <div className={styles.panel}>
      <Dropdown
        ariaLabel="Products per page"
        value={sizeValue}
        options={PAGE_SIZE_OPTIONS}
        onChange={(value) => onPageSizeChange(Number(value))}
        placement="top"
        className={styles.dropdown}
      />
    </div>
  );
}
