import { api } from './api';
import type { CreateWordDto, ReviewAnswerDto } from '@repo/types';

export interface Topic {
  id: string;
  name: string;
  icon: string | null;
}

export interface UserWord {
  id: string;
  term: string;
  ipa: string | null;
  meaningVi: string;
  imageUrl: string | null;
  audioUrl: string | null;
  context: string | null;
  topicId: string | null;
  topic?: Topic | null;
  createdAt: string;
  schedule?: {
    intervalDays: number;
    repetitions: number;
    nextReviewAt: string;
    lastResult: 'REMEMBERED' | 'FORGOT' | null;
  } | null;
}

export const vocabularyApi = {
  topics: (token: string) => api<Topic[]>('/vocabulary/topics', { token }),
  list: (token: string, params: { search?: string; topicId?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.search) qs.set('search', params.search);
    if (params.topicId) qs.set('topicId', params.topicId);
    const q = qs.toString();
    return api<UserWord[]>(`/vocabulary/words${q ? `?${q}` : ''}`, { token });
  },
  create: (token: string, dto: CreateWordDto) =>
    api<UserWord>('/vocabulary/words', { method: 'POST', body: dto, token }),
  remove: (token: string, id: string) =>
    api<{ ok: true }>(`/vocabulary/words/${id}`, { method: 'DELETE', token }),
};

export const srsApi = {
  queue: (token: string, newLimit = 10) =>
    api<UserWord[]>(`/srs/queue?newLimit=${newLimit}`, { token }),
  review: (token: string, dto: ReviewAnswerDto) =>
    api('/srs/review', { method: 'POST', body: dto, token }),
};
