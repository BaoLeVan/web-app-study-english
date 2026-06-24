'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setSession: (s: { accessToken: string; refreshToken: string; user: AuthUser }) => void;
  clear: () => void;
}

/**
 * Persists tokens to localStorage. Production-grade auth would prefer
 * httpOnly cookies, but our API already accepts Bearer headers and this keeps
 * Sprint 1 friction low. Middleware reads the same key to gate routes.
 */
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: ({ accessToken, refreshToken, user }) =>
        set({ accessToken, refreshToken, user }),
      clear: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: 'linguoflow.auth' },
  ),
);
