import { apiFetch, refreshOnce } from '@/shared/api/fetch-client';
import type { LoginRequest, SignupRequest } from '@ecommerce/shared-types';
import type { AuthResponse, AuthUser } from '../model/types';

export function login(body: LoginRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', { method: 'POST', body });
}

export function signup(body: SignupRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: body,
  });
}

export function refresh(): Promise<AuthResponse> {
  return refreshOnce();
}

export function getMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/me', {
    method: 'GET',
  });
}

export function logout(): Promise<void> {
  return apiFetch<void>('/auth/logout', {
    method: 'POST',
  });
}
