import type { ProductsQuery } from '../model/types';

export const PRODUCTS_TAG = 'products';

export function buildProductsPath(query: ProductsQuery): string {
  const params = new URLSearchParams();

  if (query.categoryId) params.set('categoryId', query.categoryId);
  if (query.category) params.set('category', query.category);
  if (query.sale) params.set('sale', '1');
  if (query.sort) params.set('sort', query.sort);
  if (query.search) params.set('search', query.search);
  if (query.cursor) params.set('cursor', query.cursor);
  if (query.limit !== undefined) params.set('limit', String(query.limit));

  const qs = params.toString();
  return qs ? `/products?${qs}` : '/products';
}
