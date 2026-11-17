import { useAuthStore } from '@/features/auth/model/auth.store';
import type { AuthResponse } from '@/features/auth/model/types';
import { API_URL } from './config';
import { ApiError } from './errors';

export { ApiError } from './errors';

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown };

const NO_REFRESH_PATHS = ['/auth/refresh', '/auth/login', '/auth/signup'];

async function rawFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
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

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T;
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

let refreshPromise: Promise<AuthResponse> | null = null;

export function refreshOnce(): Promise<AuthResponse> {
  if (!refreshPromise) {
    refreshPromise = rawFetch<AuthResponse>('/auth/refresh', {
      method: 'POST',
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function withAuthHeader(
  headers: RequestOptions['headers'],
  token: string | null,
): RequestOptions['headers'] {
  if (!token) {
    return headers;
  }
  return { ...headers, Authorization: `Bearer ${token}` };
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const accessToken = useAuthStore.getState().accessToken;
  const headers = withAuthHeader(options.headers, accessToken);

  try {
    return await rawFetch<T>(path, { ...options, headers });
  } catch (err) {
    if (
      !(err instanceof ApiError) ||
      err.status !== 401 ||
      NO_REFRESH_PATHS.includes(path)
    ) {
      throw err;
    }

    const refreshed = await refreshOnce().catch((refreshErr) => {
      useAuthStore.getState().clear();
      throw refreshErr instanceof ApiError ? refreshErr : err;
    });
    useAuthStore.getState().setAuth(refreshed.user, refreshed.accessToken);

    return rawFetch<T>(path, {
      ...options,
      headers: withAuthHeader(options.headers, refreshed.accessToken),
    });
  }
}
