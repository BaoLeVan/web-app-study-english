'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { SpeechAssessment } from '@repo/types';
import { Button, GlassCard, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useAuth } from '@/stores/auth';
import { contentApi, type SubtitleCueRow } from '@/lib/content-api';
import { speakingApi } from '@/lib/speaking-api';
import { useRecorder } from '@/lib/useRecorder';
import { usePlayerStore } from '@/stores/player';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { InteractiveSubtitle } from '@/components/video/InteractiveSubtitle';
import { ShadowingControls } from '@/components/speaking/ShadowingControls';
import { ScoreCard } from '@/components/speaking/ScoreCard';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SpeakingDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const token = useAuth((s) => s.accessToken);

  const content = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentApi.get(token!, id),
    enabled: !!token,
  });
  const status = useQuery({
    queryKey: ['speaking-status'],
    queryFn: () => speakingApi.status(token!),
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
          href="/speaking"
          className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low"
          aria-label="Back"
        >
          <Icon name="arrow_back" />
        </Link>
        <div>
          <h1 className="font-headline-lg text-on-surface">{content.data.title}</h1>
          <p className="font-label-sm text-outline-variant">
            {content.data.level} · {cues.length} sentences
          </p>
        </div>
      </div>

      <SpeakingWorkspace
        videoSrc={videoSrc}
        cues={cues}
        azureConfigured={status.data?.azureConfigured ?? false}
      />
    </div>
  );
}

function SpeakingWorkspace({
  videoSrc,
  cues,
  azureConfigured,
}: {
  videoSrc: string;
  cues: SubtitleCueRow[];
  azureConfigured: boolean;
}) {
  const token = useAuth((s) => s.accessToken)!;
  const activeIdx = usePlayerStore((s) => s.activeCueIndex);
  const [shadowing, setShadowing] = useState(true);
  const [assessment, setAssessment] = useState<{
    cueText: string;
    result: SpeechAssessment;
  } | null>(null);

  const recorder = useRecorder();

  const assess = useMutation({
    mutationFn: async (params: { cueId: string; cueText: string; audio: Blob }) => {
      const res = await speakingApi.assess(token, params.cueId, params.audio);
      return { cueText: params.cueText, result: res.assessment };
    },
    onSuccess: (data) => setAssessment(data),
  });

  const activeCue = activeIdx >= 0 ? cues[activeIdx] : null;

  const handleRecord = async () => {
    if (recorder.isRecording) {
      const blob = await recorder.stop();
      if (!blob || !activeCue) return;
      assess.mutate({ cueId: activeCue.id, cueText: activeCue.text, audio: blob });
    } else {
      setAssessment(null);
      await recorder.start();
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

        <ShadowingControls
          cues={cues}
          enabled={shadowing}
          onToggle={setShadowing}
        />

        {/* Recorder panel */}
        <GlassCard className="rounded-lg p-6" glow={recorder.isRecording ? 'secondary' : undefined}>
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-label-bold uppercase tracking-wider text-outline">
                Repeat this sentence
              </p>
              <p className="font-headline-md text-on-surface">
                {activeCue?.text ?? 'Press play to start.'}
              </p>
            </div>
            <button
              onClick={handleRecord}
              disabled={!activeCue || !recorder.isSupported || assess.isPending}
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-all',
                recorder.isRecording
                  ? 'bg-error animate-pulse'
                  : 'bg-gradient-to-br from-primary to-secondary-container hover:-translate-y-0.5',
                'disabled:opacity-40',
              )}
              aria-label={recorder.isRecording ? 'Stop recording' : 'Start recording'}
            >
              <Icon name={recorder.isRecording ? 'stop' : 'mic'} filled />
            </button>
          </div>
          {!recorder.isSupported && (
            <p className="font-label-sm text-error">Microphone not supported in this browser.</p>
          )}
          {recorder.error && (
            <p className="font-label-sm text-error">{recorder.error}</p>
          )}
          {!azureConfigured && (
            <p className="font-label-sm text-outline-variant">
              Scoring is disabled — recording will still work for self-practice.
            </p>
          )}
          {assess.isPending && (
            <p className="mt-2 font-label-sm text-primary">Scoring with Azure…</p>
          )}
          {assess.isError && (
            <p className="mt-2 font-label-sm text-error">
              {(assess.error as Error).message}
            </p>
          )}
        </GlassCard>

        {assessment && (
          <ScoreCard assessment={assessment.result} referenceText={assessment.cueText} />
        )}
      </div>

      <div className="col-span-12 lg:col-span-4">
        <GlassCard className="h-full rounded-lg p-4">
          <h3 className="mb-3 px-2 font-headline-md text-on-surface">Subtitles</h3>
          <InteractiveSubtitle cues={cues} />
        </GlassCard>
      </div>
    </div>
  );
}
