import { PRODUCTS_PAGE_LIMIT } from '@/entities/product/model/constants';
import { PAGE_SIZE_OPTIONS } from './view';

const ALLOWED_LIMITS = PAGE_SIZE_OPTIONS.map((option) => Number(option.value));

export function parseLimit(value: string | undefined): number {
  const limit = Number(value);
  return ALLOWED_LIMITS.includes(limit) ? limit : PRODUCTS_PAGE_LIMIT;
}
