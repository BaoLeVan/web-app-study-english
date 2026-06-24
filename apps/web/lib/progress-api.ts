import { api } from './api';

export interface ProgressSummary {
  lessonsDone: number;
  wordsLearned: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  totalWords: number;
  dueCount: number;
  achievements: Array<{
    code: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }>;
}

export interface ProgressSeries {
  days: Array<{
    day: string;
    reviews: number;
    dictation: number;
    speaking: number;
  }>;
}

export const progressApi = {
  me: (token: string) => api<ProgressSummary>('/progress/me', { token }),
  series: (token: string, days = 30) =>
    api<ProgressSeries>(`/progress/series?days=${days}`, { token }),
};

export const notificationsApi = {
  test: (token: string) =>
    api<{ ok: boolean; reason?: string }>('/notifications/test', {
      method: 'POST',
      token,
    }),
};
