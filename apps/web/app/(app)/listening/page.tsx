'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button, Chip, GlassCard, Icon } from '@/components/ui';
import { useAuth } from '@/stores/auth';
import { contentApi, type ContentSummary, type Level } from '@/lib/content-api';

const LEVELS: Array<{ value: Level | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All levels' },
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

export default function ListeningPage() {
  const token = useAuth((s) => s.accessToken);
  const [filter, setFilter] = useState<Level | 'ALL'>('ALL');

  const list = useQuery({
    queryKey: ['contents'],
    queryFn: () => contentApi.list(token!),
    enabled: !!token,
  });

  const ready = (list.data ?? []).filter((c) => (c._count?.cues ?? 0) > 0);
  const filtered = filter === 'ALL' ? ready : ready.filter((c) => c.level === filter);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-on-surface">Active Listening</h1>
          <p className="font-body-md text-outline-variant">
            Train your ear — adjust speed and subtitle visibility to match your level.
          </p>
        </div>
        <Link href="/my-content">
          <Button variant="secondary">
            <Icon name="video_library" />
            Manage content
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {LEVELS.map((lv) => (
          <Chip key={lv.value} active={filter === lv.value} onClick={() => setFilter(lv.value)}>
            {lv.label}
          </Chip>
        ))}
      </div>

      {list.isLoading ? (
        <p className="font-body-md text-outline">Loading…</p>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-card-gap md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <ListeningCard key={c.id} content={c} />
          ))}
        </div>
      ) : (
        <Empty />
      )}
    </div>
  );
}

function ListeningCard({ content }: { content: ContentSummary }) {
  return (
    <Link href={`/listening/${content.id}`}>
      <GlassCard
        glow="tertiary"
        className="group h-full cursor-pointer rounded-lg p-6 transition-transform hover:-translate-y-1"
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-tertiary-fixed-dim to-primary-fixed">
            <Icon name="hearing" className="text-tertiary" filled />
          </div>
          <span className="rounded-full bg-surface-container-high px-3 py-1 font-label-bold text-[11px] uppercase tracking-wider text-on-surface-variant">
            {content.level}
          </span>
        </div>
        <h3 className="mb-2 font-headline-md text-on-surface line-clamp-2">{content.title}</h3>
        <p className="font-label-sm text-outline">
          {content._count?.cues} sentence{content._count?.cues === 1 ? '' : 's'}
        </p>
      </GlassCard>
    </Link>
  );
}

function Empty() {
  return (
    <GlassCard className="flex flex-col items-center rounded-lg p-12 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-tertiary-fixed to-primary-fixed">
        <Icon name="hearing" className="text-3xl text-tertiary" filled />
      </div>
      <h3 className="mb-2 font-headline-md text-on-surface">No content at this level</h3>
      <p className="mb-6 font-body-md text-outline">
        Add a video and tag it with a level to start listening practice.
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
