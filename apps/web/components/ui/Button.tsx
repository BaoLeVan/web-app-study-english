import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-label-bold transition-all disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50';

const variants: Record<Variant, string> = {
  // design.md: Primary = pill, Purple→Pink gradient, white text
  primary:
    'bg-gradient-to-r from-primary to-secondary-container text-white shadow-[0_4px_14px_0_rgba(94,65,208,0.39)] hover:shadow-[0_6px_20px_rgba(94,65,208,0.23)] hover:-translate-y-0.5',
  // design.md: Secondary = semi-transparent white, 1px white border (ghost-glass)
  secondary:
    'bg-white/60 border border-white/60 text-primary backdrop-blur-md shadow-sm hover:bg-surface-bright/80',
  ghost: 'text-on-surface-variant hover:bg-surface-container-low',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-label-sm',
  md: 'px-6 py-2.5 text-label-bold',
  lg: 'px-8 py-3 text-label-bold',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
