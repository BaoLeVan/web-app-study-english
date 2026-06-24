'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, GlassCard, Icon } from '@/components/ui';
import { useAuth } from '@/stores/auth';
import { srsApi, type UserWord } from '@/lib/vocabulary-api';

export default function ReviewPage() {
  const token = useAuth((s) => s.accessToken);
  const qc = useQueryClient();

  const queueQuery = useQuery({
    queryKey: ['srs-queue'],
    queryFn: () => srsApi.queue(token!),
    enabled: !!token,
  });

  const [cards, setCards] = useState<UserWord[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [counts, setCounts] = useState({ remembered: 0, forgot: 0 });

  useEffect(() => {
    if (queueQuery.data) {
      setCards(queueQuery.data);
      setIndex(0);
      setFlipped(false);
      setCounts({ remembered: 0, forgot: 0 });
    }
  }, [queueQuery.data]);

  const review = useMutation({
    mutationFn: (p: { userWordId: string; result: 'REMEMBERED' | 'FORGOT' }) =>
      srsApi.review(token!, p),
  });

  const current = cards[index];
  const isDone = !queueQuery.isLoading && cards.length > 0 && index >= cards.length;
  const isEmpty = !queueQuery.isLoading && cards.length === 0;

  const answer = async (result: 'REMEMBERED' | 'FORGOT') => {
    if (!current) return;
    await review.mutateAsync({ userWordId: current.id, result });
    setCounts((c) => ({
      remembered: c.remembered + (result === 'REMEMBERED' ? 1 : 0),
      forgot: c.forgot + (result === 'FORGOT' ? 1 : 0),
    }));
    setFlipped(false);
    setIndex((i) => i + 1);
  };

  if (queueQuery.isLoading) {
    return <p className="font-body-md text-outline">Loading queue…</p>;
  }

  if (isEmpty) {
    return (
      <GlassCard className="mx-auto max-w-xl rounded-lg p-12 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-tertiary-fixed to-primary-fixed">
          <Icon name="task_alt" className="text-3xl text-primary" filled />
        </div>
        <h2 className="mb-2 font-headline-md text-on-surface">Nothing to review</h2>
        <p className="mb-6 font-body-md text-outline">
          Add words to your store and we'll schedule them for spaced repetition.
        </p>
        <Link href="/vocabulary">
          <Button>Back to vocabulary</Button>
        </Link>
      </GlassCard>
    );
  }

  if (isDone) {
    return (
      <GlassCard className="mx-auto max-w-xl rounded-lg p-12 text-center" glow="primary">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary-container">
          <Icon name="emoji_events" className="text-3xl text-white" filled />
        </div>
        <h2 className="mb-2 font-headline-md text-on-surface">Session complete</h2>
        <p className="mb-6 font-body-md text-outline">
          {counts.remembered} remembered · {counts.forgot} to revisit tomorrow.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/vocabulary">
            <Button variant="secondary">Back to vocabulary</Button>
          </Link>
          <Button onClick={() => qc.invalidateQueries({ queryKey: ['srs-queue'] })}>
            Reload queue
          </Button>
        </div>
      </GlassCard>
    );
  }

  if (!current) return null;

  const progress = ((index + 1) / cards.length) * 100;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between font-label-sm text-outline-variant">
          <span>
            Card {index + 1} of {cards.length}
          </span>
          <span>
            {counts.remembered} remembered · {counts.forgot} forgot
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-dim">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary-container transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <GlassCard
        className="cursor-pointer rounded-lg p-12 text-center transition-transform hover:scale-[1.01]"
        glow={flipped ? 'secondary' : 'primary'}
        onClick={() => setFlipped((f) => !f)}
      >
        {flipped ? (
          <div className="space-y-4">
            <p className="font-label-bold uppercase tracking-wider text-outline">
              Meaning
            </p>
            <h2 className="font-display text-on-surface" style={{ fontSize: 32 }}>
              {current.meaningVi}
            </h2>
            {current.context && (
              <p className="font-body-lg italic text-on-surface-variant">
                "{current.context}"
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-label-bold uppercase tracking-wider text-outline">Term</p>
            <h2 className="font-display text-on-surface" style={{ fontSize: 44 }}>
              {current.term}
            </h2>
            {current.ipa && (
              <p className="font-headline-md text-outline-variant">{current.ipa}</p>
            )}
            <p className="font-body-md text-outline">Tap the card to reveal the meaning</p>
          </div>
        )}
      </GlassCard>

      {/* Answer buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => answer('FORGOT')}
          disabled={review.isPending}
          className="group flex flex-col items-center gap-2 rounded-lg border border-error/30 bg-error-container/40 p-6 transition-all hover:bg-error-container/70 disabled:opacity-50"
        >
          <Icon name="close" className="text-2xl text-on-error-container" />
          <span className="font-label-bold text-on-error-container">Forgot</span>
          <span className="font-label-sm text-on-error-container/70">Show again tomorrow</span>
        </button>
        <button
          onClick={() => answer('REMEMBERED')}
          disabled={review.isPending}
          className="group flex flex-col items-center gap-2 rounded-lg border border-primary/30 bg-primary-fixed/60 p-6 transition-all hover:bg-primary-fixed/80 disabled:opacity-50"
        >
          <Icon name="check" className="text-2xl text-primary" />
          <span className="font-label-bold text-primary">Remembered</span>
          <span className="font-label-sm text-primary/70">Schedule further out</span>
        </button>
      </div>
    </div>
  );
}
