import type { SortType } from '@/entities/product/model/types';
import type { DropdownOption } from '@/shared/ui/Dropdown/Dropdown';

export type CatalogView = 'small' | 'large';

export const CATALOG_VIEWS: CatalogView[] = ['large', 'small'];

export const SORT_OPTIONS: DropdownOption<SortType>[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'popular', label: 'Popular' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
];

export const PAGE_SIZE_OPTIONS: DropdownOption<'12' | '24' | '48'>[] = [
  { value: '12', label: '12' },
  { value: '24', label: '24' },
  { value: '48', label: '48' },
];
