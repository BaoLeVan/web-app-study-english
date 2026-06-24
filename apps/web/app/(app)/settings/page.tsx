'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, GlassCard, Icon, PillInput, ProgressBar, Toggle } from '@/components/ui';
import { useAuth } from '@/stores/auth';
import { useLogout } from '@/lib/session';
import { usersApi, type UserProfile } from '@/lib/users-api';
import { subscribeToPush, unsubscribeFromPush } from '@/lib/push';

export default function SettingsPage() {
  const token = useAuth((s) => s.accessToken);
  const logout = useLogout();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => usersApi.me(token!),
    enabled: !!token,
  });

  if (isLoading || !data) {
    return <p className="font-body-md text-outline">Loading…</p>;
  }

  return (
    <div className="grid grid-cols-12 gap-gutter">
      {/* Left: profile + goals */}
      <div className="col-span-12 flex flex-col gap-gutter lg:col-span-4">
        <ProfileCard profile={data} />
        <DailyGoalsCard profile={data} />
      </div>

      {/* Right: account + preferences */}
      <div className="col-span-12 flex flex-col gap-gutter lg:col-span-8">
        <AccountSettingsCard profile={data} token={token!} onSaved={() => qc.invalidateQueries({ queryKey: ['me'] })} />
        <PreferencesGrid profile={data} token={token!} onChanged={() => qc.invalidateQueries({ queryKey: ['me'] })} />
        <div className="flex justify-end">
          <Button variant="secondary" onClick={logout}>
            <Icon name="logout" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProfileCard({ profile }: { profile: UserProfile }) {
  const initial = profile.firstName[0]?.toUpperCase() ?? 'A';
  return (
    <GlassCard className="relative flex flex-col items-center overflow-hidden rounded-lg p-8 text-center">
      <div className="absolute inset-x-0 top-0 h-32 opacity-30" style={{
        backgroundImage:
          'radial-gradient(at 40% 20%, hsla(28,100%,74%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%)',
        backgroundColor: '#e6deff',
      }} />
      <div className="relative z-10 mb-6 mt-4 h-32 w-32 rounded-full bg-white/50 p-2 shadow-[0_0_40px_rgba(119,92,235,0.2)] backdrop-blur-sm">
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary-fixed to-secondary-container font-display text-[44px] text-on-surface">
          {initial}
        </div>
      </div>
      <h2 className="relative z-10 mb-1 font-headline-lg text-on-surface">
        {profile.firstName} {profile.lastName}
      </h2>
      <p className="relative z-10 mb-8 font-body-md text-outline">{profile.email}</p>
      <div className="relative z-10 flex w-full border-t border-surface-dim/50 pt-6">
        <div className="flex-1 border-r border-surface-dim/50 text-center">
          <p className="mb-1 font-label-sm uppercase tracking-wider text-outline-variant">Lessons</p>
          <p className="font-display text-[32px] font-bold text-on-surface">
            {profile.progress?.lessonsDone ?? 0}
          </p>
        </div>
        <div className="flex-1 text-center">
          <p className="mb-1 font-label-sm uppercase tracking-wider text-outline-variant">Words</p>
          <p className="font-display text-[32px] font-bold text-on-surface">
            {profile.progress?.wordsLearned ?? 0}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

function DailyGoalsCard({ profile }: { profile: UserProfile }) {
  const streak = profile.progress?.currentStreak ?? 0;
  return (
    <GlassCard className="rounded-lg p-8">
      <h3 className="mb-6 font-headline-md text-on-surface">Daily Goals</h3>
      <div className="space-y-6">
        <div>
          <div className="mb-2 flex justify-between">
            <span className="flex items-center gap-2 font-body-md text-on-surface-variant">
              <Icon name="local_fire_department" className="text-primary" />
              Day Streak
            </span>
            <span className="font-label-bold text-primary">{streak} / 30</span>
          </div>
          <ProgressBar value={(streak / 30) * 100} />
        </div>
        <div>
          <div className="mb-2 flex justify-between">
            <span className="flex items-center gap-2 font-body-md text-on-surface-variant">
              <Icon name="school" className="text-tertiary" />
              Lessons Today
            </span>
            <span className="font-label-bold text-tertiary">0 / 10</span>
          </div>
          <ProgressBar
            value={0}
            fillClassName="bg-gradient-to-r from-tertiary to-tertiary-fixed-dim"
          />
        </div>
      </div>
    </GlassCard>
  );
}

function AccountSettingsCard({
  profile,
  token,
  onSaved,
}: {
  profile: UserProfile;
  token: string;
  onSaved: () => void;
}) {
  const [firstName] = useState(profile.firstName);
  const [lastName] = useState(profile.lastName);
  const [reminderTime, setReminderTime] = useState(profile.settings?.reminderTime ?? '20:00');

  const save = useMutation({
    mutationFn: () => usersApi.updateSettings(token, { reminderTime }),
    onSuccess: onSaved,
  });

  return (
    <GlassCard className="rounded-lg p-8">
      <h3 className="mb-8 font-headline-md text-on-surface">Account Settings</h3>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <PillInput label="First Name" defaultValue={firstName} readOnly />
          <PillInput label="Last Name" defaultValue={lastName} readOnly />
        </div>
        <PillInput label="Email Address" icon="mail" type="email" value={profile.email} readOnly />

        <div className="space-y-2">
          <label
            htmlFor="reminder"
            className="pl-4 font-label-sm uppercase tracking-wider text-outline-variant"
          >
            Daily Reminder Time
          </label>
          <div className="relative">
            <Icon
              name="schedule"
              className="absolute left-5 top-1/2 -translate-y-1/2 text-outline-variant"
            />
            <input
              id="reminder"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full rounded-full border border-white/60 bg-surface-bright/50 py-3 pl-12 pr-6 font-body-md text-on-surface shadow-inner outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <p className="pl-4 font-label-sm text-outline">
            We'll send a push notification at this time to remind you to review.
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={() => save.mutate()} disabled={save.isPending} size="lg">
          {save.isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </GlassCard>
  );
}

function PreferencesGrid({
  profile,
  token,
  onChanged,
}: {
  profile: UserProfile;
  token: string;
  onChanged: () => void;
}) {
  const [pushOn, setPushOn] = useState(profile.settings?.notificationsEnabled ?? false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPushOn(profile.settings?.notificationsEnabled ?? false);
  }, [profile.settings?.notificationsEnabled]);

  const togglePush = async (next: boolean) => {
    setBusy(true);
    try {
      if (next) {
        const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapid) {
          alert('Web Push not configured (missing VAPID public key).');
          return;
        }
        const sub = await subscribeToPush(vapid);
        if (!sub) return;
        await usersApi.subscribePush(token, sub as never);
        setPushOn(true);
      } else {
        await unsubscribeFromPush();
        await usersApi.unsubscribePush(token);
        setPushOn(false);
      }
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
      <GlassCard className="flex items-center justify-between rounded-lg p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container">
            <Icon name="translate" className="text-on-primary-container" />
          </div>
          <div>
            <h4 className="font-body-lg font-bold text-on-surface">Native Language</h4>
            <p className="font-body-md text-on-surface-variant">
              {profile.settings?.nativeLang === 'vi' ? 'Vietnamese' : profile.settings?.nativeLang}
            </p>
          </div>
        </div>
        <Icon name="chevron_right" className="text-outline-variant" />
      </GlassCard>

      <GlassCard className="flex items-center justify-between rounded-lg p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container">
            <Icon name="notifications_active" className="text-on-secondary-container" />
          </div>
          <div>
            <h4 className="font-body-lg font-bold text-on-surface">Push Notifications</h4>
            <p className="font-body-md text-on-surface-variant">
              {pushOn ? 'On' : 'Off'}
            </p>
          </div>
        </div>
        <Toggle
          checked={pushOn}
          onChange={togglePush}
          aria-label="Toggle push notifications"
          id={busy ? 'push-busy' : undefined}
        />
      </GlassCard>
    </div>
  );
}
