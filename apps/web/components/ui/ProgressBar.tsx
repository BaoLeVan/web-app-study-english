import { cn } from '@/lib/cn';

interface ProgressBarProps {
  /** 0–100 */
  value: number;
  className?: string;
  /** Tailwind gradient/bg classes for the filled portion. */
  fillClassName?: string;
  /** Track height. */
  height?: 'sm' | 'md' | 'lg';
}

const heights = { sm: 'h-1.5', md: 'h-3', lg: 'h-4' } as const;

/** design.md: thick rounded-cap bars; unfilled = low-opacity track. */
export function ProgressBar({
  value,
  className,
  fillClassName = 'bg-gradient-to-r from-primary to-secondary-container',
  height = 'md',
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn('w-full overflow-hidden rounded-full bg-surface-dim', heights[height], className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={cn('h-full rounded-full transition-all', fillClassName)} style={{ width: `${pct}%` }} />
    </div>
  );
}
