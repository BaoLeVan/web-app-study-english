import { cn } from '@/lib/cn';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional ambient colored glow (Elevation Level 2). */
  glow?: 'primary' | 'secondary' | 'tertiary' | 'pink';
}

const glowMap = {
  primary: 'ambient-glow-primary',
  secondary: 'ambient-glow-secondary',
  tertiary: 'ambient-glow-tertiary',
  pink: 'ambient-glow-pink',
} as const;

/** Elevation Level 1/2 surface — white 70% glass, blur, soft shadow. */
export function GlassCard({ glow, className, children, ...props }: GlassCardProps) {
  return (
    <div className={cn('glass-card rounded-lg', glow && glowMap[glow], className)} {...props}>
      {children}
    </div>
  );
}
