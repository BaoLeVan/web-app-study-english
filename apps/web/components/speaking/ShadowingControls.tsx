'use client';

import { useEffect } from 'react';
import { Icon, Toggle } from '@/components/ui';
import { usePlayerStore } from '@/stores/player';
import type { SubtitleCueRow } from '@/lib/content-api';

interface ShadowingControlsProps {
  cues: SubtitleCueRow[];
  enabled: boolean;
  onToggle: (next: boolean) => void;
  /** Called when the player auto-pauses at the end of a cue. */
  onCueEnd?: (cue: SubtitleCueRow) => void;
}

/**
 * Watches the player position and auto-pauses just past each cue's endMs when
 * shadowing mode is on. We give the player a small grace window past endMs
 * so we don't miss a cue that ends between two 250 ms progress ticks.
 */
export function ShadowingControls({
  cues,
  enabled,
  onToggle,
  onCueEnd,
}: ShadowingControlsProps) {
  const currentMs = usePlayerStore((s) => s.currentMs);
  const playing = usePlayerStore((s) => s.playing);
  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const requestSeek = usePlayerStore((s) => s.requestSeek);
  const activeIdx = usePlayerStore((s) => s.activeCueIndex);

  useEffect(() => {
    if (!enabled || !playing) return;
    const active = activeIdx >= 0 ? cues[activeIdx] : null;
    if (!active) return;
    // Stop the moment we cross the cue boundary.
    if (currentMs >= active.endMs - 50) {
      setPlaying(false);
      onCueEnd?.(active);
    }
  }, [enabled, playing, currentMs, activeIdx, cues, setPlaying, onCueEnd]);

  const stepCue = (delta: -1 | 1) => {
    const target = Math.min(Math.max(activeIdx + delta, 0), cues.length - 1);
    const cue = cues[target];
    if (cue) requestSeek(cue.startMs);
  };

  const replayCue = () => {
    const cue = cues[activeIdx];
    if (cue) {
      requestSeek(cue.startMs);
      setPlaying(true);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-white/60 bg-white/60 p-3 backdrop-blur-md">
      <div className="flex items-center gap-2 pr-3">
        <Toggle checked={enabled} onChange={onToggle} aria-label="Toggle shadowing mode" />
        <span className="font-label-bold text-on-surface">Shadowing</span>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => stepCue(-1)}
          className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low"
          aria-label="Previous cue"
        >
          <Icon name="skip_previous" />
        </button>
        <button
          onClick={replayCue}
          className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low"
          aria-label="Replay current cue"
        >
          <Icon name="replay" />
        </button>
        <button
          onClick={() => stepCue(1)}
          className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low"
          aria-label="Next cue"
        >
          <Icon name="skip_next" />
        </button>
      </div>
      <p className="ml-auto font-label-sm text-outline">
        {enabled
          ? 'Auto-pauses after each cue so you can repeat it.'
          : 'Turn on to pause after every sentence.'}
      </p>
    </div>
  );
}
