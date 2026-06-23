import { cn } from '@/lib/cn';

interface ChipProps {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

/** Filter/category chip — pill, used for Levels (Beginner/Intermediate/Advanced) & topics. */
export function Chip({ active, onClick, children, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-1.5 font-label-bold transition-all',
        active
          ? 'bg-gradient-to-r from-primary to-secondary-container text-white shadow-sm'
          : 'border border-white/50 bg-white/60 text-on-surface-variant backdrop-blur-md hover:text-primary',
        className,
      )}
    >
      {children}
    </button>
  );
}
