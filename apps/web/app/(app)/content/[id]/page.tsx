'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, GlassCard, Icon } from '@/components/ui';
import { useAuth } from '@/stores/auth';
import { contentApi } from '@/lib/content-api';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { InteractiveSubtitle } from '@/components/video/InteractiveSubtitle';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ContentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const token = useAuth((s) => s.accessToken);

  const { data, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentApi.get(token!, id),
    enabled: !!token,
  });

  if (isLoading || !data) {
    return <p className="font-body-md text-outline">Loading…</p>;
  }

  const videoSrc = data.youtubeUrl ?? '';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/my-content"
          className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low"
          aria-label="Back"
        >
          <Icon name="arrow_back" />
        </Link>
        <div>
          <h1 className="font-headline-lg text-on-surface">{data.title}</h1>
          <p className="font-label-sm text-outline-variant">
            {data.level} · {data.cues.length} cues
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-12 lg:col-span-8">
          {videoSrc ? (
            <VideoPlayer src={videoSrc} cues={data.cues} />
          ) : (
            <GlassCard className="flex h-64 items-center justify-center rounded-lg">
              <p className="font-body-md text-outline">
                Uploaded video playback comes in a later sprint.
              </p>
            </GlassCard>
          )}
        </div>

        <div className="col-span-12 lg:col-span-4">
          <GlassCard className="h-full rounded-lg p-4">
            <h3 className="mb-3 px-2 font-headline-md text-on-surface">Subtitles</h3>
            {data.cues.length > 0 ? (
              <InteractiveSubtitle cues={data.cues} bilingual />
            ) : (
              <SubtitleUpload contentId={id} />
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function SubtitleUpload({ contentId }: { contentId: string }) {
  const token = useAuth((s) => s.accessToken)!;
  const qc = useQueryClient();
  const [raw, setRaw] = useState('');

  const attach = useMutation({
    mutationFn: () => contentApi.attachSubtitle(token, contentId, raw, 'en'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content', contentId] }),
  });

  const onPickFile = async (file: File) => {
    const text = await file.text();
    setRaw(text);
  };

  return (
    <div className="space-y-4 px-2 py-6 text-center">
      <Icon name="subtitles" className="text-4xl text-outline-variant" />
      <p className="font-body-md text-outline">
        Upload an <code className="font-mono">.srt</code> or{' '}
        <code className="font-mono">.vtt</code> file to enable interactive subtitles.
      </p>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/60 px-4 py-2 font-label-bold text-primary shadow-sm hover:bg-surface-bright/80">
        <Icon name="upload_file" />
        Choose file
        <input
          type="file"
          accept=".srt,.vtt,text/plain"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onPickFile(f);
          }}
        />
      </label>
      {raw && (
        <>
          <p className="font-label-sm text-outline">{raw.length} characters loaded.</p>
          <Button onClick={() => attach.mutate()} disabled={attach.isPending} size="sm">
            {attach.isPending ? 'Parsing…' : 'Attach subtitles'}
          </Button>
        </>
      )}
      {attach.isError && (
        <p className="font-label-sm text-error">
          {(attach.error as Error).message}
        </p>
      )}
    </div>
  );
}
