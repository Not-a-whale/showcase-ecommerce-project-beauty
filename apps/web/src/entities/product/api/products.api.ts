import { apiFetch } from '@/shared/api/fetch-client';
import { buildProductsPath } from './products.path';
import type { ProductsPage, ProductsQuery } from '../model/types';

export function getProductsClient(
  query: ProductsQuery,
): Promise<ProductsPage> {
  return apiFetch<ProductsPage>(buildProductsPath(query));
}
