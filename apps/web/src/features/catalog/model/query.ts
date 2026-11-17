import { isSortType } from '@/entities/product/model/sort';
import type { ProductsQuery } from '@/entities/product/model/types';
import { parseLimit } from './limit';

export function parseCatalogQuery(
  get: (key: string) => string | null,
): ProductsQuery {
  const sort = get('sort');

  const sale = get('sale');

  return {
    sort: isSortType(sort) ? sort : undefined,
    category: get('category') ?? undefined,
    sale: sale === '1' || sale === 'true' ? true : undefined,
    search: get('search') ?? undefined,
    limit: parseLimit(get('limit') ?? undefined),
  };
}

const PRESERVED_ON_SEARCH = ['sort', 'limit'] as const;

// a new search keeps the user's sort/page-size but drops category/sale — a fresh
// search starts over, a category pick merely refines whatever's already there
export function buildSearchUrl(
  currentParams: URLSearchParams,
  search: string,
): string {
  const params = new URLSearchParams();
  for (const key of PRESERVED_ON_SEARCH) {
    const value = currentParams.get(key);
    if (value) params.set(key, value);
  }
  params.set('search', search);
  return `/collection?${params.toString()}`;
}
