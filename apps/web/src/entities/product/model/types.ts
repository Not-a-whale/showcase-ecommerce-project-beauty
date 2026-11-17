export type { Product, SortType, ProductsQuery } from '@ecommerce/shared-types';

import type { Product } from '@ecommerce/shared-types';

export interface ProductsPage {
  items: Product[];
  nextCursor: string | null;
}
