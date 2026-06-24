import { api } from './api';
import type { PushSubscriptionDto, UpdateSettingsDto } from '@repo/types';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  settings: {
    nativeLang: string;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    reminderTime: string;
    notificationsEnabled: boolean;
  } | null;
  progress: {
    lessonsDone: number;
    wordsLearned: number;
    currentStreak: number;
    longestStreak: number;
    totalPoints: number;
  } | null;
}

export const usersApi = {
  me: (token: string) => api<UserProfile>('/users/me', { token }),
  updateSettings: (token: string, dto: UpdateSettingsDto) =>
    api('/users/me/settings', { method: 'PATCH', body: dto, token }),
  subscribePush: (token: string, dto: PushSubscriptionDto) =>
    api('/users/me/push', { method: 'POST', body: dto, token }),
  unsubscribePush: (token: string) => api('/users/me/push', { method: 'DELETE', token }),
};
