import { cn } from '@/lib/cn';

interface IconProps {
  /** Material Symbols Outlined ligature name, e.g. "dashboard". */
  name: string;
  filled?: boolean;
  className?: string;
}

/** Material Symbols Outlined icon (font loaded in app/layout.tsx). */
export function Icon({ name, filled, className }: IconProps) {
  return (
    <span className={cn('material-symbols-outlined', filled && 'is-filled', className)} aria-hidden>
      {name}
    </span>
  );
}
