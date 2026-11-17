'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getProductsClient } from '@/entities/product/api/products.api';
import { productsKeys } from '@/entities/product/model/query-keys';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';

export const SEARCH_MIN_LENGTH = 2;
export const SEARCH_PREVIEW_LIMIT = 8;

export function useProductSearch(term: string) {
  const debounced = useDebouncedValue(term.trim(), 250);
  const enabled = debounced.length >= SEARCH_MIN_LENGTH;

  const query = useQuery({
    queryKey: productsKeys.search(debounced),
    queryFn: () => getProductsClient({ search: debounced, limit: SEARCH_PREVIEW_LIMIT }),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  return { ...query, term: debounced, enabled };
}
