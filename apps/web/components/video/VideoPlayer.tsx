'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { usePlayerStore } from '@/stores/player';
import type { SubtitleCueRow } from '@/lib/content-api';

// react-player ships an SSR-incompatible default — load on the client only.
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface VideoPlayerProps {
  /** YouTube URL or direct file URL. */
  src: string;
  cues: SubtitleCueRow[];
}

/**
 * Reusable player: keeps PlayerStore in sync (currentMs, duration, playing,
 * activeCueIndex) so any sibling — InteractiveSubtitle, ShadowingControls
 * (Sprint 5), FillInTheBlank (Sprint 6) — can read & drive playback.
 */
export function VideoPlayer({ src, cues }: VideoPlayerProps) {
  const playerRef = useRef<unknown>(null);

  const playing = usePlayerStore((s) => s.playing);
  const rate = usePlayerStore((s) => s.playbackRate);
  const seekToMs = usePlayerStore((s) => s.seekToMs);

  const setCurrentMs = usePlayerStore((s) => s.setCurrentMs);
  const setDurationMs = usePlayerStore((s) => s.setDurationMs);
  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const setActiveCueIndex = usePlayerStore((s) => s.setActiveCueIndex);
  const requestSeek = usePlayerStore((s) => s.requestSeek);

  // Honor imperative seek requests from the subtitle list / shadowing.
  useEffect(() => {
    if (seekToMs == null) return;
    const player = playerRef.current as { seekTo?: (s: number, type?: string) => void } | null;
    player?.seekTo?.(seekToMs / 1000, 'seconds');
    requestSeek(null);
  }, [seekToMs, requestSeek]);

  return (
    <div className="overflow-hidden rounded-lg shadow-lg" style={{ aspectRatio: '16/9' }}>
      <ReactPlayer
        ref={playerRef as never}
        url={src}
        width="100%"
        height="100%"
        controls
        playing={playing}
        playbackRate={rate}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onDuration={(d: number) => setDurationMs(Math.round(d * 1000))}
        onProgress={(p: { playedSeconds: number }) => {
          const ms = Math.round(p.playedSeconds * 1000);
          setCurrentMs(ms);
          const idx = findActiveCue(cues, ms);
          setActiveCueIndex(idx);
        }}
        progressInterval={250}
        config={{ youtube: { playerVars: { rel: 0, modestbranding: 1 } } }}
      />
    </div>
  );
}

/**
 * Binary search would be nice on long subtitles, but linear is fine for the
 * typical 100–500-cue range and avoids edge cases with overlapping cues.
 */
function findActiveCue(cues: SubtitleCueRow[], ms: number): number {
  for (let i = 0; i < cues.length; i++) {
    const c = cues[i]!;
    if (ms >= c.startMs && ms < c.endMs) return i;
  }
  return -1;
}
