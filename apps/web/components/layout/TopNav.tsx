'use client';

import { Icon } from '@/components/ui';

/** Glassmorphic top bar (80px) — search left, actions + avatar right. */
export function TopNav() {
  return (
    <header className="fixed right-0 top-0 z-40 flex h-20 w-[calc(100%-260px)] items-center justify-between border-b border-white/20 bg-surface/70 px-container-padding shadow-sm backdrop-blur-xl">
      {/* Left: nav arrows + search */}
      <div className="flex flex-1 items-center gap-4">
        <div className="flex gap-2 text-outline">
          <button className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low">
            <Icon name="chevron_left" />
          </button>
          <button className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low">
            <Icon name="chevron_right" />
          </button>
        </div>
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
        <button className="relative rounded-full bg-white p-2 text-primary shadow-sm transition-colors hover:bg-surface-container-low">
          <Icon name="notifications" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" />
        </button>
        <button className="rounded-full bg-white p-2 text-primary shadow-sm transition-colors hover:bg-surface-container-low">
          <Icon name="help" />
        </button>
        <div className="ml-2 h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-surface-container-highest shadow-sm">
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-fixed to-secondary-container font-label-bold text-white">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
