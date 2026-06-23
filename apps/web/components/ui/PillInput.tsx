import { forwardRef } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';

interface PillInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Material Symbols icon name shown inside the field on the left. */
  icon?: string;
  error?: string;
}

/** design.md: pill-shaped input, inner shadow (recessed into glass surface). */
export const PillInput = forwardRef<HTMLInputElement, PillInputProps>(
  ({ label, icon, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="pl-4 font-label-sm uppercase tracking-wider text-outline-variant"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <Icon
              name={icon}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-outline-variant"
            />
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-full border border-white/60 bg-surface-bright/50 py-3 font-body-md text-on-surface shadow-inner outline-none transition-all placeholder:text-outline-variant focus:border-transparent focus:ring-2 focus:ring-primary/50',
              icon ? 'pl-12 pr-6' : 'px-6',
              error && 'border-error/60 focus:ring-error/40',
              className,
            )}
            aria-invalid={!!error}
            {...props}
          />
        </div>
        {error && <p className="pl-4 font-label-sm text-error">{error}</p>}
      </div>
    );
  },
);
PillInput.displayName = 'PillInput';
