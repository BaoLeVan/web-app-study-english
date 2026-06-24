'use client';

import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { usePlayerStore } from '@/stores/player';

const RATES = [0.5, 0.75, 1, 1.25, 1.5];

/** Pill row letting the user slow the video down for easier listening. */
export function PlaybackRateControl() {
  const rate = usePlayerStore((s) => s.playbackRate);
  const setRate = usePlayerStore((s) => s.setPlaybackRate);

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3 py-1.5 backdrop-blur-md">
      <Icon name="speed" className="text-on-surface-variant" />
      <div className="flex gap-1">
        {RATES.map((r) => (
          <button
            key={r}
            onClick={() => setRate(r)}
            className={cn(
              'rounded-full px-3 py-1 font-label-bold transition-all',
              rate === r
                ? 'bg-gradient-to-r from-primary to-secondary-container text-white shadow-sm'
                : 'text-on-surface-variant hover:text-primary',
            )}
          >
            {r}x
          </button>
        ))}
      </div>
    </div>
  );
}
