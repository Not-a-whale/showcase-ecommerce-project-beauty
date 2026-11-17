import type { ProductsQuery } from './types';

export const productsKeys = {
  list: (query: ProductsQuery) => ['products', 'list', query] as const,
  search: (term: string) => ['products', 'search', term] as const,
};
