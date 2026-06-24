'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui';

/** Mobile bottom nav — 5 primary destinations, active item floats above the bar. */
const ITEMS = [
  { label: 'Home', href: '/dashboard', icon: 'home' },
  { label: 'Words', href: '/vocabulary', icon: 'menu_book' },
  { label: 'Speak', href: '/speaking', icon: 'mic' },
  { label: 'Listen', href: '/listening', icon: 'hearing' },
  { label: 'Me', href: '/settings', icon: 'person' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around bg-inverse-surface/90 px-4 shadow-[0_-10px_20px_rgba(0,0,0,0.1)] backdrop-blur-2xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center px-3 py-2 transition-all',
              active
                ? 'mt-[-8px] scale-110 rounded-xl bg-surface px-4 text-primary shadow-lg'
                : 'text-outline-variant hover:text-surface-bright',
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon name={item.icon} filled={active} />
            <span className="mt-1 font-label-sm">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
