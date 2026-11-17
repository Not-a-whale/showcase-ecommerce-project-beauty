import 'server-only';

import { publicFetch } from '@/shared/api/public-fetch';
import { CATEGORIES_PATH, CATEGORIES_TAG } from './categories.path';
import type { Category } from '../model/types';

export function getCategoriesServer(): Promise<Category[]> {
  return publicFetch<Category[]>(CATEGORIES_PATH, {
    revalidate: 3600,
    tags: [CATEGORIES_TAG],
  });
}
