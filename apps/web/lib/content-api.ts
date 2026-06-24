import { api } from './api';
import type { IngestContentDto } from '@repo/types';

export type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface ContentSummary {
  id: string;
  title: string;
  type: 'YOUTUBE' | 'UPLOAD';
  youtubeUrl: string | null;
  fileKey: string | null;
  level: Level;
  durationMs: number | null;
  createdAt: string;
  _count?: { cues: number };
}

export interface SubtitleCueRow {
  id: string;
  index: number;
  startMs: number;
  endMs: number;
  text: string;
  textVi: string | null;
}

export interface ContentDetail extends ContentSummary {
  cues: SubtitleCueRow[];
  subtitles: Array<{ id: string; lang: string }>;
}

export const contentApi = {
  list: (token: string) => api<ContentSummary[]>('/content', { token }),
  get: (token: string, id: string) => api<ContentDetail>(`/content/${id}`, { token }),
  ingest: (token: string, dto: IngestContentDto) =>
    api<ContentSummary>('/content', { method: 'POST', body: dto, token }),
  attachSubtitle: (token: string, id: string, raw: string, lang: 'en' | 'vi' = 'en') =>
    api<{ cueCount: number }>(`/content/${id}/subtitle`, {
      method: 'POST',
      body: { lang, raw },
      token,
    }),
  remove: (token: string, id: string) =>
    api<{ ok: true }>(`/content/${id}`, { method: 'DELETE', token }),
};

export interface DictionaryDef {
  term: string;
  ipa?: string;
  audioUrl?: string;
  definitions: Array<{
    partOfSpeech: string;
    definition: string;
    example?: string;
  }>;
}

export const dictionaryApi = {
  lookup: (token: string, term: string) =>
    api<DictionaryDef>(`/dictionary/lookup?term=${encodeURIComponent(term)}`, { token }),
};
