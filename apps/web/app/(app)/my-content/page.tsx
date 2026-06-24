'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IngestContentSchema, type IngestContentDto } from '@repo/types';
import { Button, GlassCard, Icon, PillInput } from '@/components/ui';
import { useAuth } from '@/stores/auth';
import { contentApi, type ContentSummary } from '@/lib/content-api';

export default function MyContentPage() {
  const token = useAuth((s) => s.accessToken);
  const [showAdd, setShowAdd] = useState(false);

  const list = useQuery({
    queryKey: ['contents'],
    queryFn: () => contentApi.list(token!),
    enabled: !!token,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-on-surface">My Content</h1>
          <p className="font-body-md text-outline-variant">
            Paste a YouTube link or upload a video, then attach subtitles.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Icon name="add" />
          Add content
        </Button>
      </div>

      {list.isLoading ? (
        <p className="font-body-md text-outline">Loading…</p>
      ) : list.data && list.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-card-gap md:grid-cols-2 lg:grid-cols-3">
          {list.data.map((c) => (
            <ContentCard key={c.id} content={c} />
          ))}
        </div>
      ) : (
        <EmptyState onAdd={() => setShowAdd(true)} />
      )}

      {showAdd && <AddContentModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function ContentCard({ content }: { content: ContentSummary }) {
  return (
    <Link href={`/content/${content.id}`}>
      <GlassCard className="group h-full cursor-pointer rounded-lg p-6 transition-transform hover:-translate-y-1">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-fixed to-secondary-fixed">
            <Icon
              name={content.type === 'YOUTUBE' ? 'smart_display' : 'upload_file'}
              className="text-primary"
            />
          </div>
          <span className="rounded-full bg-surface-container-high px-3 py-1 font-label-bold text-[11px] uppercase tracking-wider text-on-surface-variant">
            {content.level}
          </span>
        </div>
        <h3 className="mb-2 font-headline-md text-on-surface line-clamp-2">{content.title}</h3>
        <p className="font-label-sm text-outline">
          {content._count?.cues
            ? `${content._count.cues} subtitle ${content._count.cues === 1 ? 'cue' : 'cues'}`
            : 'No subtitles yet'}
        </p>
      </GlassCard>
    </Link>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <GlassCard className="flex flex-col items-center rounded-lg p-12 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-fixed to-tertiary-fixed">
        <Icon name="video_library" className="text-3xl text-primary" />
      </div>
      <h3 className="mb-2 font-headline-md text-on-surface">No content yet</h3>
      <p className="mb-6 font-body-md text-outline">
        Add a YouTube video and we'll let you click any word in the subtitles to look it up.
      </p>
      <Button onClick={onAdd}>
        <Icon name="add" />
        Add your first video
      </Button>
    </GlassCard>
  );
}

function AddContentModal({ onClose }: { onClose: () => void }) {
  const token = useAuth((s) => s.accessToken)!;
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IngestContentDto>({
    resolver: zodResolver(IngestContentSchema),
    defaultValues: { type: 'YOUTUBE' },
  });

  const ingest = useMutation({
    mutationFn: (dto: IngestContentDto) => contentApi.ingest(token, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contents'] });
      onClose();
    },
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <GlassCard
        className="w-full max-w-lg rounded-lg p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-headline-lg text-on-surface">Add a YouTube video</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-outline hover:bg-surface-container-low"
            aria-label="Close"
          >
            <Icon name="close" />
          </button>
        </div>
        <form
          onSubmit={handleSubmit((v) => ingest.mutate(v))}
          className="space-y-5"
        >
          <input type="hidden" value="YOUTUBE" {...register('type')} />
          <PillInput
            label="Title"
            placeholder="e.g. TED Talk: How language shapes thought"
            error={errors.title?.message}
            {...register('title')}
          />
          <PillInput
            label="YouTube URL"
            icon="link"
            placeholder="https://youtube.com/watch?v=..."
            error={errors.youtubeUrl?.message}
            {...register('youtubeUrl')}
          />
          <div className="space-y-2">
            <label className="pl-4 font-label-sm uppercase tracking-wider text-outline-variant">
              Level
            </label>
            <select
              className="w-full rounded-full border border-white/60 bg-surface-bright/50 px-6 py-3 font-body-md text-on-surface shadow-inner outline-none focus:ring-2 focus:ring-primary/50"
              {...register('level')}
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
          {ingest.isError && (
            <p className="rounded-md bg-error-container/50 px-4 py-2 font-label-sm text-on-error-container">
              {(ingest.error as Error).message}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={ingest.isPending}>
              {ingest.isPending ? 'Adding…' : 'Add'}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
