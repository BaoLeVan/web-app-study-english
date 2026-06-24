import { api } from './api';
import type { SpeechAssessment } from '@repo/types';

export interface SpeakingAttemptRow {
  id: string;
  cueId: string;
  accuracyScore: number | null;
  fluencyScore: number | null;
  completenessScore: number | null;
  pronunciationScore: number | null;
  createdAt: string;
  cue: { text: string };
}

interface AssessResponse {
  attempt: SpeakingAttemptRow;
  assessment: SpeechAssessment;
}

export const speakingApi = {
  recent: (token: string) => api<SpeakingAttemptRow[]>('/speaking/attempts', { token }),
  /**
   * Score a Web Speech API transcript against a cue's reference text. No
   * audio is sent — the transcript is captured client-side and the duration
   * is measured client-side too, so this is a tiny JSON POST.
   */
  assess: (
    token: string,
    cueId: string,
    payload: { transcript: string; durationMs: number },
  ) =>
    api<AssessResponse>(`/speaking/cues/${cueId}/assess`, {
      method: 'POST',
      body: payload,
      token,
    }),
};
