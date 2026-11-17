import 'server-only';

import { API_URL } from './config';
import { ApiError } from './errors';

type PublicFetchOptions = {
  revalidate?: number | false;
  tags?: string[];
};

export async function publicFetch<T>(
  path: string,
  { revalidate, tags }: PublicFetchOptions = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate, tags },
  });

  if (!res.ok) {
    let errBody: unknown;
    try {
      errBody = await res.json();
    } catch {
      errBody = undefined;
    }
    throw new ApiError(res.status, `API ${res.status} on ${path}`, errBody);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}
