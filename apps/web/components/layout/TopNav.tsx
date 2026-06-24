'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@/components/ui';
import { useAuth } from '@/stores/auth';
import { usersApi } from '@/lib/users-api';

/** Glassmorphic top bar (80px) — search left, actions + avatar right. */
export function TopNav() {
  const token = useAuth((s) => s.accessToken);
  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => usersApi.me(token!),
    enabled: !!token,
  });

  const initial = (me?.firstName?.[0] ?? '?').toUpperCase();

  return (
    <header className="fixed right-0 top-0 z-40 hidden h-20 w-[calc(100%-260px)] items-center justify-between border-b border-white/20 bg-surface/70 px-container-padding shadow-sm backdrop-blur-xl lg:flex">
      {/* Left: search */}
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-64 rounded-full border border-white bg-white/50 shadow-inner backdrop-blur-md transition-all focus-within:ring-2 focus-within:ring-primary/50">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            className="w-full rounded-full border-none bg-transparent py-2 pl-10 pr-4 font-body-md placeholder:text-outline focus:ring-0"
            placeholder="Search..."
            type="text"
          />
        </div>
      </div>

      {/* Right: actions + avatar */}
      <div className="flex items-center gap-4">
        <Link
          href="/vocabulary/review"
          className="relative rounded-full bg-white p-2 text-primary shadow-sm transition-colors hover:bg-surface-container-low"
          aria-label="Open review queue"
        >
          <Icon name="notifications" />
        </Link>
        <button className="rounded-full bg-white p-2 text-primary shadow-sm transition-colors hover:bg-surface-container-low">
          <Icon name="help" />
        </button>
        <Link
          href="/settings"
          className="ml-2 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-primary-fixed to-secondary-container font-label-bold text-white shadow-sm"
          aria-label="Open settings"
        >
          {initial}
        </Link>
      </div>
    </header>
  );
}
