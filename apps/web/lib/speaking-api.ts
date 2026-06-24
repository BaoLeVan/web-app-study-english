import type { SpeechAssessment } from '@repo/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

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
  status: (token: string) =>
    fetch(`${API_URL}/speaking/status`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json() as Promise<{ azureConfigured: boolean }>),

  recent: (token: string) =>
    fetch(`${API_URL}/speaking/attempts`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json() as Promise<SpeakingAttemptRow[]>),

  /** Upload a WAV blob recorded with useRecorder() to score it. */
  assess: async (
    token: string,
    cueId: string,
    audio: Blob,
  ): Promise<AssessResponse> => {
    const fd = new FormData();
    fd.append('audio', audio, 'recording.wav');
    const res = await fetch(`${API_URL}/speaking/cues/${cueId}/assess`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    return res.json() as Promise<AssessResponse>;
  },
};
