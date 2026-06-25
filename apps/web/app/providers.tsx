'use client';

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '@/lib/api';
import { useSessionSync } from '@/lib/session';
import { useAuth } from '@/stores/auth';

function SessionMirror() {
  useSessionSync();
  return null;
}

function clearSessionAndRedirect() {
  useAuth.getState().clear();
  // Clear cookie manually since useLogout is a hook (can't call here)
  document.cookie = 'lf_access=; Path=/; Max-Age=0; SameSite=Lax';
  window.location.href = '/login';
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, refetchOnWindowFocus: false },
        },
        queryCache: new QueryCache({
          onError: (error) => {
            if (error instanceof ApiError && error.status === 401) {
              clearSessionAndRedirect();
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            if (error instanceof ApiError && error.status === 401) {
              clearSessionAndRedirect();
            }
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionMirror />
      {children}
    </QueryClientProvider>
  );
}
