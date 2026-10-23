'use client';
import { useEffect, useRef } from 'react';
import { refresh } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/model/auth.store';

export function AuthInitializer() {
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    refresh()
      .then((res) => useAuthStore.getState().setAuth(res.user, res.accessToken))
      .catch(() => useAuthStore.getState().clear());
  }, []);

  return null;
}
