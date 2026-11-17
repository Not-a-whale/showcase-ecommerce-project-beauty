import type { SortType } from './types';

const SORT_VALUES: SortType[] = [
  'price_asc',
  'price_desc',
  'newest',
  'oldest',
  'popular',
];

export function isSortType(value: unknown): value is SortType {
  return typeof value === 'string' && SORT_VALUES.includes(value as SortType);
}
