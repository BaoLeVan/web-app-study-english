'use client';

import { useEffect } from 'react';
import { useAuth, type AuthUser } from '@/stores/auth';

const COOKIE = 'lf_access';

function setCookie(value: string | null) {
  if (typeof document === 'undefined') return;
  if (value) {
    // 7 days; SameSite=Lax so the middleware sees it on top-level navigations.
    document.cookie = `${COOKIE}=${value}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  } else {
    document.cookie = `${COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
}

/** Mirror the persisted access token into a cookie for middleware to read. */
export function useSessionSync() {
  const token = useAuth((s) => s.accessToken);
  useEffect(() => {
    setCookie(token);
  }, [token]);
}

interface SessionPayload {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export function useLogin() {
  const setSession = useAuth((s) => s.setSession);
  return (p: SessionPayload) => {
    setCookie(p.accessToken);
    setSession(p);
  };
}

export function useLogout() {
  const clear = useAuth((s) => s.clear);
  return () => {
    setCookie(null);
    clear();
  };
}
