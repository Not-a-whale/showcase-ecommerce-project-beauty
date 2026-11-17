import 'server-only';

import { publicFetch } from '@/shared/api/public-fetch';
import { buildProductsPath, PRODUCTS_TAG } from './products.path';
import type { ProductsPage, ProductsQuery } from '../model/types';

export function getProductsServer(
  query: ProductsQuery,
): Promise<ProductsPage> {
  return publicFetch<ProductsPage>(buildProductsPath(query), {
    revalidate: 60,
    tags: [PRODUCTS_TAG],
  });
}
