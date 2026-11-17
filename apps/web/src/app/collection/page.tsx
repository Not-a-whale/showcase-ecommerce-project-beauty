import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/shared/api/query-client';
import { getProductsServer } from '@/entities/product/api/products.api.server';
import { getCategoriesServer } from '@/entities/category/api/categories.api.server';
import { productsKeys } from '@/entities/product/model/query-keys';
import { parseCatalogQuery } from '@/features/catalog/model/query';
import type { ProductsPage } from '@/entities/product/model/types';
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs/Breadcrumbs';
import { CollectionBanner } from '@/features/catalog/ui/CollectionBanner';
import { CatalogView } from '@/features/catalog/ui/CatalogView';

type CollectionSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: CollectionSearchParams;
}) {
  const params = await searchParams;

  const query = parseCatalogQuery((key) => {
    const value = params[key];
    return typeof value === 'string' ? value : (value?.[0] ?? null);
  });

  const queryClient = getQueryClient();
  const [categories] = await Promise.all([
    getCategoriesServer(),
    queryClient.prefetchInfiniteQuery({
      queryKey: productsKeys.list(query),
      queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
        getProductsServer({ ...query, cursor: pageParam }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage: ProductsPage) =>
        lastPage.nextCursor ?? undefined,
    }),
  ]);

  return (
    <>
      <CollectionBanner title="All products" />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Collection', href: '/collection' },
        ]}
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={null}>
          <CatalogView categories={categories} />
        </Suspense>
      </HydrationBoundary>
    </>
  );
}
