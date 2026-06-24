'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button, GlassCard, Icon } from '@/components/ui';
import { useAuth } from '@/stores/auth';
import { contentApi, type ContentSummary } from '@/lib/content-api';

export default function SpeakingPage() {
  const token = useAuth((s) => s.accessToken);

  const list = useQuery({
    queryKey: ['contents'],
    queryFn: () => contentApi.list(token!),
    enabled: !!token,
  });

  const ready = (list.data ?? []).filter((c) => (c._count?.cues ?? 0) > 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-on-surface">Speaking &amp; Shadowing</h1>
          <p className="font-body-md text-outline-variant">
            Pick a video with subtitles, shadow each sentence, and get scored.
          </p>
        </div>
        <Link href="/my-content">
          <Button variant="secondary">
            <Icon name="video_library" />
            Manage content
          </Button>
        </Link>
      </div>

      {list.isLoading ? (
        <p className="font-body-md text-outline">Loading…</p>
      ) : ready.length > 0 ? (
        <div className="grid grid-cols-1 gap-card-gap md:grid-cols-2 lg:grid-cols-3">
          {ready.map((c) => (
            <SpeakingCard key={c.id} content={c} />
          ))}
        </div>
      ) : (
        <Empty />
      )}
    </div>
  );
}

function SpeakingCard({ content }: { content: ContentSummary }) {
  return (
    <Link href={`/speaking/${content.id}`}>
      <GlassCard
        glow="primary"
        className="group h-full cursor-pointer rounded-lg p-6 transition-transform hover:-translate-y-1"
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary-container">
            <Icon name="mic" className="text-white" filled />
          </div>
          <span className="rounded-full bg-surface-container-high px-3 py-1 font-label-bold text-[11px] uppercase tracking-wider text-on-surface-variant">
            {content.level}
          </span>
        </div>
        <h3 className="mb-2 font-headline-md text-on-surface line-clamp-2">{content.title}</h3>
        <p className="font-label-sm text-outline">
          {content._count?.cues} sentence{content._count?.cues === 1 ? '' : 's'} ready
        </p>
      </GlassCard>
    </Link>
  );
}

function Empty() {
  return (
    <GlassCard className="flex flex-col items-center rounded-lg p-12 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-fixed to-secondary-fixed">
        <Icon name="mic" className="text-3xl text-primary" filled />
      </div>
      <h3 className="mb-2 font-headline-md text-on-surface">No content ready</h3>
      <p className="mb-6 font-body-md text-outline">
        Add a video and attach an SRT/VTT — sentences are sliced automatically and you can
        start shadowing right away.
      </p>
      <Link href="/my-content">
        <Button>
          <Icon name="add" />
          Add a video
        </Button>
      </Link>
    </GlassCard>
  );
}
