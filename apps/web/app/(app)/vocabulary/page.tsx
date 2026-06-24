'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateWordSchema, type CreateWordDto } from '@repo/types';
import { Button, Chip, GlassCard, Icon, PillInput } from '@/components/ui';
import { useAuth } from '@/stores/auth';
import { vocabularyApi, type UserWord } from '@/lib/vocabulary-api';

const GRADIENTS = ['mesh-card-1', 'mesh-card-2', 'mesh-card-3'];

export default function VocabularyPage() {
  const token = useAuth((s) => s.accessToken);
  const [search, setSearch] = useState('');
  const [topicId, setTopicId] = useState<string | undefined>(undefined);
  const [showAdd, setShowAdd] = useState(false);

  const topicsQuery = useQuery({
    queryKey: ['topics'],
    queryFn: () => vocabularyApi.topics(token!),
    enabled: !!token,
  });

  const wordsQuery = useQuery({
    queryKey: ['words', search, topicId],
    queryFn: () => vocabularyApi.list(token!, { search, topicId }),
    enabled: !!token,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-on-surface">Word Sets</h1>
          <p className="font-body-md text-outline-variant">
            {wordsQuery.data?.length ?? 0} words in your personal store.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/vocabulary/review">
            <Button variant="secondary">
              <Icon name="psychology" />
              Review now
            </Button>
          </Link>
          <Button onClick={() => setShowAdd(true)}>
            <Icon name="add" />
            Add word
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <Icon
            name="search"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search words…"
            className="w-full rounded-full border border-white/60 bg-white/60 py-2.5 pl-11 pr-4 font-body-md text-on-surface shadow-sm outline-none backdrop-blur-md focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <Chip active={!topicId} onClick={() => setTopicId(undefined)}>
          All
        </Chip>
        {topicsQuery.data?.map((t) => (
          <Chip key={t.id} active={topicId === t.id} onClick={() => setTopicId(t.id)}>
            {t.name}
          </Chip>
        ))}
      </div>

      {/* Grid */}
      {wordsQuery.isLoading ? (
        <p className="font-body-md text-outline">Loading…</p>
      ) : wordsQuery.data && wordsQuery.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-card-gap md:grid-cols-2 lg:grid-cols-3">
          {wordsQuery.data.map((w, i) => (
            <WordCard key={w.id} word={w} gradient={GRADIENTS[i % GRADIENTS.length]!} />
          ))}
        </div>
      ) : (
        <EmptyState onAdd={() => setShowAdd(true)} />
      )}

      {showAdd && <AddWordModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function WordCard({ word, gradient }: { word: UserWord; gradient: string }) {
  const due =
    word.schedule && new Date(word.schedule.nextReviewAt).getTime() <= Date.now();
  return (
    <div
      className={`group relative h-56 cursor-pointer overflow-hidden rounded-lg shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl ${gradient}`}
    >
      <div className="absolute inset-0 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm" />
      <div className="relative z-10 flex h-full flex-col justify-between p-6">
        <div className="flex items-start justify-between">
          <span className="material-symbols-outlined text-[44px] text-white/70 drop-shadow-xl">
            {word.topic?.icon ?? 'menu_book'}
          </span>
          {due && (
            <span className="rounded-full bg-white/30 px-3 py-1 font-label-bold text-[11px] uppercase tracking-wider text-white backdrop-blur-sm">
              Due
            </span>
          )}
        </div>
        <div>
          <h3 className="mb-1 font-headline-md leading-tight text-white">{word.term}</h3>
          {word.ipa && <p className="font-label-sm text-white/80">{word.ipa}</p>}
          <p className="mt-1 font-body-md text-white/90 line-clamp-2">{word.meaningVi}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <GlassCard className="flex flex-col items-center rounded-lg p-12 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-fixed to-secondary-fixed">
        <Icon name="library_books" className="text-3xl text-primary" />
      </div>
      <h3 className="mb-2 font-headline-md text-on-surface">No words yet</h3>
      <p className="mb-6 font-body-md text-outline">
        Add your first word manually, or capture one while watching a video.
      </p>
      <Button onClick={onAdd}>
        <Icon name="add" />
        Add your first word
      </Button>
    </GlassCard>
  );
}

function AddWordModal({ onClose }: { onClose: () => void }) {
  const token = useAuth((s) => s.accessToken)!;
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateWordDto>({ resolver: zodResolver(CreateWordSchema) });

  const create = useMutation({
    mutationFn: (dto: CreateWordDto) => vocabularyApi.create(token, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['words'] });
      onClose();
    },
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <GlassCard
        className="w-full max-w-lg rounded-lg p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-headline-lg text-on-surface">Add a word</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-outline hover:bg-surface-container-low"
            aria-label="Close"
          >
            <Icon name="close" />
          </button>
        </div>
        <form
          onSubmit={handleSubmit((v) => create.mutate(v))}
          className="space-y-5"
        >
          <PillInput
            label="Term"
            placeholder="e.g. resilient"
            error={errors.term?.message}
            {...register('term')}
          />
          <PillInput
            label="Phonetic (IPA)"
            placeholder="/rɪˈzɪl.i.ənt/"
            error={errors.ipa?.message}
            {...register('ipa')}
          />
          <PillInput
            label="Meaning (Vietnamese)"
            placeholder="kiên cường"
            error={errors.meaningVi?.message}
            {...register('meaningVi')}
          />
          <PillInput
            label="Context / Example"
            placeholder="She remained resilient through the crisis."
            error={errors.context?.message}
            {...register('context')}
          />
          {create.isError && (
            <p className="rounded-md bg-error-container/50 px-4 py-2 font-label-sm text-on-error-container">
              {(create.error as Error).message}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Saving…' : 'Add to my store'}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
