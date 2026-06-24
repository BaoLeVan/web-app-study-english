'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui';
import { NAV_ITEMS } from './nav-items';

/**
 * Dark high-contrast sidebar (260px), rounded-r-[3rem].
 * Active item uses the "cut-out" inverted-radius tab — see .sidebar-active-tab
 * in globals.css and the original dashboard.html / profile.html markup.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-full w-sidebar-width flex-col overflow-hidden rounded-r-[3rem] bg-inverse-surface py-8 shadow-xl lg:flex">
      {/* Brand */}
      <div className="mb-12 flex items-center gap-3 px-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary-container text-white shadow-lg shadow-primary/20">
          <Icon name="language" filled />
        </div>
        <div>
          <h1 className="font-display text-[24px] leading-tight text-primary-fixed">LinguoFlow</h1>
          <p className="font-label-sm text-outline-variant">Master English</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 font-body-md transition-all duration-300',
                active
                  ? 'sidebar-active-tab'
                  : 'ml-4 rounded-l-full px-6 py-3 text-outline-variant hover:bg-primary/10 hover:text-primary-fixed',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon name={item.icon} filled={active} className={active ? 'text-primary' : ''} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA */}
      <div className="mt-auto px-6">
        <div className="relative overflow-hidden rounded-md border border-outline/20 bg-inverse-surface/50 p-4 text-center">
          <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-gradient-to-bl from-primary/20 to-transparent" />
          <h3 className="mb-1 font-label-bold text-primary-fixed">Upgrade to Pro</h3>
          <p className="mb-4 font-label-sm text-outline-variant">Unlock premium features.</p>
          <button className="w-full rounded-full bg-gradient-to-r from-primary to-secondary-container py-2 font-label-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl">
            TRY NOW
          </button>
        </div>
      </div>
    </aside>
  );
}
