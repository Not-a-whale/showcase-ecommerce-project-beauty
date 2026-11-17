import { useEffect } from 'react';
import { create } from 'zustand';

import type { AuthResponse, AuthUser } from '@/features/auth/model/types';
import { setAuthHint } from './auth-hint';

export enum AuthStatus {
  Idle = 'idle',
  Authenticated = 'authenticated',
  Unauthenticated = 'unauthenticated',
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  status: AuthStatus;
  setAuth: (user: AuthUser, token: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  status: AuthStatus.Idle,
  setAuth: (user, token) => {
    setAuthHint(true);
    set({ user, accessToken: token, status: AuthStatus.Authenticated });
  },
  clear: () => {
    setAuthHint(false);
    set({ user: null, accessToken: null, status: AuthStatus.Unauthenticated });
  },
}));

export const useUser = (authResponse: AuthResponse) => {
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    setAuth(authResponse.user, authResponse.accessToken);
  }, [authResponse, setAuth]);
};

export const useIsAuthenticated = () => {
  return useAuthStore((state) => state.status === AuthStatus.Authenticated);
};
