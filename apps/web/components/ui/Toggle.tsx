import { cn } from '@/lib/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  'aria-label'?: string;
}

/** Custom toggle switch — ported from profile.html peer-checked pattern. */
export function Toggle({ checked, onChange, id, ...rest }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={rest['aria-label']}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        checked ? 'bg-primary' : 'bg-surface-dim',
      )}
    >
      <span
        className={cn(
          'absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white shadow transition-transform',
          checked && 'translate-x-full',
        )}
      />
    </button>
  );
}
