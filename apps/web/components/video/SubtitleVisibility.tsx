'use client';

import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

export type SubtitleMode = 'off' | 'en' | 'bilingual';

interface SubtitleVisibilityProps {
  mode: SubtitleMode;
  onChange: (mode: SubtitleMode) => void;
}

const OPTIONS: Array<{ value: SubtitleMode; icon: string; label: string }> = [
  { value: 'off', icon: 'subtitles_off', label: 'Off' },
  { value: 'en', icon: 'subtitles', label: 'English' },
  { value: 'bilingual', icon: 'translate', label: 'Bilingual' },
];

/** Toggles subtitle visibility for Active Listening: off / English only / EN+VI. */
export function SubtitleVisibility({ mode, onChange }: SubtitleVisibilityProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/60 p-1 backdrop-blur-md">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex items-center gap-1 rounded-full px-3 py-1 font-label-bold transition-all',
            mode === opt.value
              ? 'bg-gradient-to-r from-primary to-secondary-container text-white shadow-sm'
              : 'text-on-surface-variant hover:text-primary',
          )}
          aria-label={opt.label}
        >
          <Icon name={opt.icon} style={{ fontSize: 18 }} />
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
