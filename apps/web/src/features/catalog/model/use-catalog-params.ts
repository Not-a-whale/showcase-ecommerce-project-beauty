'use client';

import { useMemo, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PRODUCTS_PAGE_LIMIT } from '@/entities/product/model/constants';
import type { ProductsQuery } from '@/entities/product/model/types';
import { parseCatalogQuery } from './query';

type ParamKey = 'sort' | 'category' | 'sale' | 'search' | 'limit';

const DEFAULTS: Partial<Record<ParamKey, string>> = {
  sort: 'newest',
  limit: String(PRODUCTS_PAGE_LIMIT),
};

export function useCatalogParams(): {
  query: ProductsQuery;
  isPending: boolean;
  setParam: (key: ParamKey, value: string | undefined) => void;
} {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const searchParamsString = searchParams.toString();

  const query = useMemo(
    () => parseCatalogQuery((key) => searchParams.get(key)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- searchParams itself is a new object every render; its string form is the real identity
    [searchParamsString],
  );

  const setParam = (key: ParamKey, value: string | undefined) => {
    const params = new URLSearchParams(searchParamsString);
    const isDefault = value !== undefined && DEFAULTS[key] === value;

    if (value === undefined || isDefault) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    // a new search is a fresh start; a category pick refines the existing search
    if (key === 'search' && value !== undefined) {
      params.delete('category');
      params.delete('sale');
    }

    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  return { query, isPending, setParam };
}
