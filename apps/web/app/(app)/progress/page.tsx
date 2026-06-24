'use client';

import { useQuery } from '@tanstack/react-query';
import { GlassCard, Icon, ProgressBar } from '@/components/ui';
import { useAuth } from '@/stores/auth';
import { progressApi, type ProgressSummary } from '@/lib/progress-api';

export default function ProgressPage() {
  const token = useAuth((s) => s.accessToken);
  const { data, isLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: () => progressApi.me(token!),
    enabled: !!token,
  });

  if (isLoading || !data) {
    return <p className="font-body-md text-outline">Loading…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-on-surface">Statistics &amp; Progress</h1>
          <p className="font-body-md text-on-surface-variant">
            Track your language learning journey.
          </p>
        </div>
      </div>

      <SummaryCards data={data} />
      <StreakCard data={data} />
      <AchievementsRow data={data} />
    </div>
  );
}

function SummaryCards({ data }: { data: ProgressSummary }) {
  const cards = [
    {
      label: 'Lessons Completed',
      value: data.lessonsDone,
      icon: 'school',
      glow: 'primary' as const,
      bg: 'bg-primary-container',
      iconText: 'text-primary',
    },
    {
      label: 'Words Learned',
      value: data.wordsLearned,
      icon: 'translate',
      glow: 'secondary' as const,
      bg: 'bg-secondary-container',
      iconText: 'text-on-secondary-container',
    },
    {
      label: 'Current Streak',
      value: `${data.currentStreak} ${data.currentStreak === 1 ? 'Day' : 'Days'}`,
      icon: 'local_fire_department',
      glow: 'tertiary' as const,
      bg: 'bg-tertiary-container',
      iconText: 'text-on-tertiary-container',
    },
    {
      label: 'Total Points',
      value: data.totalPoints,
      icon: 'star',
      glow: undefined,
      bg: 'bg-surface-container-highest',
      iconText: 'text-on-surface',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <GlassCard
          key={c.label}
          glow={c.glow}
          className="flex flex-col justify-between rounded-lg p-6"
        >
          <div className="mb-4 flex items-start justify-between">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.bg}`}>
              <Icon name={c.icon} className={c.iconText} filled />
            </div>
          </div>
          <div>
            <p className="mb-1 font-body-md text-outline">{c.label}</p>
            <h3 className="font-display text-[28px] text-on-surface">{c.value}</h3>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function StreakCard({ data }: { data: ProgressSummary }) {
  const targetStreak = 30;
  const streakPct = (data.currentStreak / targetStreak) * 100;
  return (
    <GlassCard className="rounded-lg p-8">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-headline-md text-on-surface">Daily Goals</h3>
        <span className="rounded-full bg-surface-container-low px-3 py-1 font-label-bold text-primary">
          {data.dueCount} {data.dueCount === 1 ? 'word' : 'words'} due
        </span>
      </div>
      <div className="space-y-6">
        <div>
          <div className="mb-2 flex justify-between">
            <span className="flex items-center gap-2 font-body-md text-on-surface-variant">
              <Icon name="local_fire_department" className="text-primary" filled />
              30-Day Streak
            </span>
            <span className="font-label-bold text-primary">
              {data.currentStreak} / {targetStreak}
            </span>
          </div>
          <ProgressBar value={streakPct} />
          <p className="mt-2 font-label-sm text-outline">
            Longest streak ever: {data.longestStreak} {data.longestStreak === 1 ? 'day' : 'days'}.
          </p>
        </div>
        <div>
          <div className="mb-2 flex justify-between">
            <span className="flex items-center gap-2 font-body-md text-on-surface-variant">
              <Icon name="library_books" className="text-tertiary" filled />
              Vocabulary Store
            </span>
            <span className="font-label-bold text-tertiary">{data.totalWords} words</span>
          </div>
          <ProgressBar
            value={Math.min(100, (data.totalWords / 500) * 100)}
            fillClassName="bg-gradient-to-r from-tertiary to-tertiary-fixed-dim"
          />
          <p className="mt-2 font-label-sm text-outline">Next milestone: 500 words.</p>
        </div>
      </div>
    </GlassCard>
  );
}

function AchievementsRow({ data }: { data: ProgressSummary }) {
  return (
    <div>
      <h3 className="mb-4 font-headline-md text-on-surface">Recent Achievements</h3>
      {data.achievements.length === 0 ? (
        <GlassCard className="rounded-lg p-8 text-center">
          <Icon name="emoji_events" className="mb-3 text-4xl text-outline-variant" />
          <p className="font-body-md text-outline">
            Keep practicing — achievements will unlock as you progress.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {data.achievements.map((a) => (
            <GlassCard
              key={a.code}
              className="flex cursor-pointer items-center gap-4 rounded-lg p-4 transition-transform hover:-translate-y-1"
            >
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-200 to-yellow-500 p-1 shadow-lg">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                  <Icon name={a.icon} className="text-2xl text-yellow-500" filled />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-on-surface">{a.title}</h4>
                <p className="mt-1 font-label-sm text-outline-variant">{a.description}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
