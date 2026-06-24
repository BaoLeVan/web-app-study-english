'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, GlassCard, Icon } from '@/components/ui';
import { useAuth } from '@/stores/auth';
import { contentApi, type SubtitleCueRow } from '@/lib/content-api';
import { dictationApi } from '@/lib/dictation-api';
import { usePlayerStore } from '@/stores/player';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { ShadowingControls } from '@/components/speaking/ShadowingControls';
import { FillInTheBlank } from '@/components/dictation/FillInTheBlank';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function WritingDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const token = useAuth((s) => s.accessToken);

  const content = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentApi.get(token!, id),
    enabled: !!token,
  });

  const accuracy = useQuery({
    queryKey: ['dictation-accuracy', id],
    queryFn: () => dictationApi.accuracy(token!, id),
    enabled: !!token,
  });

  if (content.isLoading || !content.data) {
    return <p className="font-body-md text-outline">Loading…</p>;
  }

  const videoSrc = content.data.youtubeUrl ?? '';
  const cues = content.data.cues;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/writing"
          className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low"
          aria-label="Back"
        >
          <Icon name="arrow_back" />
        </Link>
        <div className="flex-1">
          <h1 className="font-headline-lg text-on-surface">{content.data.title}</h1>
          <p className="font-label-sm text-outline-variant">
            {content.data.level} · {cues.length} sentences
            {accuracy.data && accuracy.data.total > 0 && (
              <>
                {' · '}
                {accuracy.data.correct}/{accuracy.data.total} correct (
                {Math.round((accuracy.data.correct / accuracy.data.total) * 100)}%)
              </>
            )}
          </p>
        </div>
      </div>

      <WritingWorkspace videoSrc={videoSrc} cues={cues} contentId={id} />
    </div>
  );
}

function WritingWorkspace({
  videoSrc,
  cues,
  contentId,
}: {
  videoSrc: string;
  cues: SubtitleCueRow[];
  contentId: string;
}) {
  const qc = useQueryClient();
  const activeIdx = usePlayerStore((s) => s.activeCueIndex);
  const requestSeek = usePlayerStore((s) => s.requestSeek);
  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const [shadowing, setShadowing] = useState(true);

  const activeCue = activeIdx >= 0 ? cues[activeIdx] : null;

  const onCorrect = () => {
    void qc.invalidateQueries({ queryKey: ['dictation-accuracy', contentId] });
  };

  const replayCue = () => {
    if (activeCue) {
      requestSeek(activeCue.startMs);
      setPlaying(true);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-gutter">
      <div className="col-span-12 space-y-4 lg:col-span-8">
        {videoSrc ? (
          <VideoPlayer src={videoSrc} cues={cues} />
        ) : (
          <GlassCard className="flex h-64 items-center justify-center rounded-lg">
            <p className="font-body-md text-outline">
              Uploaded video playback comes in a later sprint.
            </p>
          </GlassCard>
        )}

        <ShadowingControls cues={cues} enabled={shadowing} onToggle={setShadowing} />

        {/* Dictation panel */}
        <GlassCard className="rounded-lg p-6" glow="secondary">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-label-bold uppercase tracking-wider text-outline">
              Fill in the blanks
            </p>
            <Button variant="secondary" size="sm" onClick={replayCue} disabled={!activeCue}>
              <Icon name="replay" />
              Replay
            </Button>
          </div>
          {activeCue ? (
            <FillInTheBlank
              key={activeCue.id}
              cueId={activeCue.id}
              cueText={activeCue.text}
              mode="WRITING"
              onCorrect={onCorrect}
            />
          ) : (
            <p className="font-body-md text-outline">
              Press play — the current sentence will appear here as blanks.
            </p>
          )}
        </GlassCard>
      </div>

      <div className="col-span-12 lg:col-span-4">
        <GlassCard className="h-full rounded-lg p-4">
          <h3 className="mb-3 px-2 font-headline-md text-on-surface">All sentences</h3>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-2">
            {cues.map((cue, i) => (
              <button
                key={cue.id}
                onClick={() => {
                  requestSeek(cue.startMs);
                  setPlaying(true);
                }}
                className={`w-full rounded-md px-3 py-2 text-left font-body-md transition-colors ${
                  i === activeIdx
                    ? 'bg-primary-fixed/60 text-on-surface ambient-glow-primary'
                    : 'text-outline-variant hover:bg-surface-container-low'
                }`}
              >
                <span className="mr-2 font-label-bold text-primary">{i + 1}.</span>
                {cue.text}
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
