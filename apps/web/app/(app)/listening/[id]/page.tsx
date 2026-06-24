'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { GlassCard, Icon } from '@/components/ui';
import { useAuth } from '@/stores/auth';
import { contentApi, type SubtitleCueRow } from '@/lib/content-api';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { InteractiveSubtitle } from '@/components/video/InteractiveSubtitle';
import { PlaybackRateControl } from '@/components/video/PlaybackRateControl';
import { SubtitleVisibility, type SubtitleMode } from '@/components/video/SubtitleVisibility';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ListeningDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const token = useAuth((s) => s.accessToken);

  const content = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentApi.get(token!, id),
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
          href="/listening"
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

      <ListeningWorkspace videoSrc={videoSrc} cues={cues} />
    </div>
  );
}

function ListeningWorkspace({
  videoSrc,
  cues,
}: {
  videoSrc: string;
  cues: SubtitleCueRow[];
}) {
  const [subtitleMode, setSubtitleMode] = useState<SubtitleMode>('en');

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

        <div className="flex flex-wrap items-center gap-3">
          <PlaybackRateControl />
          <SubtitleVisibility mode={subtitleMode} onChange={setSubtitleMode} />
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4">
        <GlassCard className="h-full rounded-lg p-4">
          <h3 className="mb-3 px-2 font-headline-md text-on-surface">Subtitles</h3>
          {subtitleMode === 'off' ? (
            <div className="flex h-32 items-center justify-center text-center">
              <p className="font-body-md text-outline">
                Subtitles hidden — turn them back on to read along.
              </p>
            </div>
          ) : (
            <InteractiveSubtitle cues={cues} bilingual={subtitleMode === 'bilingual'} />
          )}
        </GlassCard>
      </div>
    </div>
  );
}
