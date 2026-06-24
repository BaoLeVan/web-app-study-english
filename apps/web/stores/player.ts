'use client';

import { create } from 'zustand';

/**
 * Player state shared across the VideoPlayer and the InteractiveSubtitle.
 * Kept tiny — anything feature-specific (Shadowing auto-pause, Dictation
 * input) lives in feature-local state, not here.
 */
interface PlayerState {
  /** Current playback position in ms (updated on every progress tick). */
  currentMs: number;
  durationMs: number;
  playing: boolean;
  playbackRate: number;
  /** Cue index of the cue currently visible to the user (-1 if none). */
  activeCueIndex: number;
  setCurrentMs: (ms: number) => void;
  setDurationMs: (ms: number) => void;
  setPlaying: (playing: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setActiveCueIndex: (idx: number) => void;
  /** Imperative seek requested by the subtitle list — read by the player. */
  seekToMs: number | null;
  requestSeek: (ms: number | null) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentMs: 0,
  durationMs: 0,
  playing: false,
  playbackRate: 1,
  activeCueIndex: -1,
  seekToMs: null,
  setCurrentMs: (ms) => set({ currentMs: ms }),
  setDurationMs: (ms) => set({ durationMs: ms }),
  setPlaying: (playing) => set({ playing }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
  setActiveCueIndex: (activeCueIndex) => set({ activeCueIndex }),
  requestSeek: (seekToMs) => set({ seekToMs }),
}));
