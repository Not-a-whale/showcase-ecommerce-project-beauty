'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { LazyMotion, MotionConfig, domMax } from 'framer-motion';
import { type ReactNode } from 'react';
import { getQueryClient } from '@/shared/api/query-client';
import { ThemeProvider } from '@/shared/theme/ThemeProvider';
import { AuthInitializer } from '@/features/auth/ui/AuthInitializer';

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      <LazyMotion features={domMax} strict>
        <MotionConfig reducedMotion="user">
          <ThemeProvider>{children}</ThemeProvider>
        </MotionConfig>
      </LazyMotion>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
