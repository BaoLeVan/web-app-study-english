import { cn } from '@/lib/cn';

interface IconProps {
  /** Material Symbols Outlined ligature name, e.g. "dashboard". */
  name: string;
  filled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Material Symbols Outlined icon (font loaded in app/layout.tsx). */
export function Icon({ name, filled, className, style }: IconProps) {
  return (
    <span
      className={cn('material-symbols-outlined', filled && 'is-filled', className)}
      style={style}
      aria-hidden
    >
      {name}
    </span>
  );
}
