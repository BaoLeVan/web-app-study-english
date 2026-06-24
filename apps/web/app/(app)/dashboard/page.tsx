'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { GlassCard, Icon } from '@/components/ui';
import { useAuth } from '@/stores/auth';
import { usersApi } from '@/lib/users-api';
import { progressApi } from '@/lib/progress-api';

const QUICK_START = [
  { title: 'Speaking', href: '/speaking', minutes: 20, gradient: 'from-primary-fixed to-secondary-fixed', icon: 'mic' },
  { title: 'Writing', href: '/writing', minutes: 15, gradient: 'from-primary-fixed to-tertiary-fixed', icon: 'edit_note' },
  { title: 'Listening', href: '/listening', minutes: 17, gradient: 'from-tertiary-fixed to-secondary-fixed', icon: 'hearing' },
];

const WORD_SETS = [
  { title: 'Books and Library', gradient: 'mesh-card-1', icon: 'menu_book' },
  { title: 'Countries and Cities', gradient: 'mesh-card-2', icon: 'public' },
  { title: 'Time & Schedule', gradient: 'mesh-card-3', icon: 'schedule' },
];

export default function DashboardPage() {
  const token = useAuth((s) => s.accessToken);
  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: () => usersApi.me(token!),
    enabled: !!token,
  });
  const progressQuery = useQuery({
    queryKey: ['progress'],
    queryFn: () => progressApi.me(token!),
    enabled: !!token,
  });

  const me = meQuery.data;
  const progress = progressQuery.data;

  return (
    <div className="grid grid-cols-12 gap-gutter">
      {/* Left column */}
      <div className="col-span-12 flex flex-col gap-8 lg:col-span-8">
        {/* Word Sets */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-headline-lg text-on-surface">Word Sets</h2>
            <Link href="/vocabulary" className="font-label-bold text-primary hover:underline">
              See all
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-card-gap">
            {WORD_SETS.map((ws) => (
              <Link
                key={ws.title}
                href="/vocabulary"
                className={`group relative h-[180px] cursor-pointer overflow-hidden rounded-[24px] p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${ws.gradient}`}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-80 transition-transform duration-500 group-hover:scale-110">
                  <span className="material-symbols-outlined text-[64px] text-white/60 drop-shadow-xl">
                    {ws.icon}
                  </span>
                </div>
                <h3 className="absolute bottom-4 left-4 right-4 font-label-bold text-[14px] text-white">
                  {ws.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        {/* Daily Review CTA */}
        <GlassCard glow="primary" className="rounded-lg p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="mb-2 font-label-bold uppercase tracking-wider text-primary">
                Daily review
              </p>
              <h3 className="mb-2 font-headline-lg text-on-surface">
                {progress?.dueCount ?? 0}{' '}
                {progress?.dueCount === 1 ? 'word' : 'words'} waiting for you
              </h3>
              <p className="font-body-md text-outline">
                Practice now to keep your streak alive
                {progress?.currentStreak ? ` (${progress.currentStreak} days strong)` : ''}.
              </p>
            </div>
            <Link
              href="/vocabulary/review"
              className="rounded-full bg-gradient-to-r from-primary to-secondary-container px-6 py-3 font-label-bold text-white shadow-[0_4px_14px_0_rgba(94,65,208,0.39)] transition-all hover:-translate-y-0.5"
            >
              Start review
            </Link>
          </div>
        </GlassCard>
      </div>

      {/* Right column */}
      <div className="col-span-12 flex flex-col gap-8 lg:col-span-4">
        {/* Profile card */}
        <GlassCard className="relative mt-12 rounded-lg px-8 pb-6 pt-16 text-center">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-primary-fixed to-secondary-container p-1 shadow-xl">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white font-display text-[34px] text-on-surface">
              {(me?.firstName?.[0] ?? 'A').toUpperCase()}
            </div>
          </div>
          <h2 className="mb-1 font-headline-md text-on-surface">
            {me ? `${me.firstName} ${me.lastName}` : 'Loading…'}
          </h2>
          <p className="mb-6 font-body-md text-outline">{me?.email ?? ''}</p>
          <div className="flex justify-center gap-8 border-t border-surface-dim pt-6">
            <div>
              <p className="mb-1 font-label-sm uppercase tracking-wider text-outline">Words</p>
              <p className="font-display text-[28px] text-on-surface">
                {progress?.totalWords ?? 0}
              </p>
            </div>
            <div className="w-[1px] bg-surface-dim" />
            <div>
              <p className="mb-1 font-label-sm uppercase tracking-wider text-outline">Streak</p>
              <p className="font-display text-[28px] text-on-surface">
                {progress?.currentStreak ?? 0}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Quick Start */}
        <section>
          <h2 className="mb-6 font-headline-lg text-on-surface">Quick Start</h2>
          <div className="flex flex-col gap-4">
            {QUICK_START.map((qs, i) => (
              <Link
                key={qs.title}
                href={qs.href}
                className="glass-card group flex w-full items-center gap-4 rounded-md p-4 text-left transition-shadow hover:ambient-glow-primary"
                style={{ marginLeft: `${i * 16}px` }}
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${qs.gradient} p-2 shadow-inner`}
                >
                  <Icon name={qs.icon} className="text-2xl text-on-surface/70" />
                </div>
                <div>
                  <h4 className="font-label-bold text-[14px] text-on-surface transition-colors group-hover:text-primary">
                    {qs.title}
                  </h4>
                  <p className="font-label-sm text-outline">{qs.minutes} min</p>
                </div>
                <Icon
                  name="arrow_forward"
                  className="ml-auto -translate-x-2 text-outline opacity-0 transition-all group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100"
                />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
