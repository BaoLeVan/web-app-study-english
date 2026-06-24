import { api } from './api';

interface RecordDto {
  blankIndex: number;
  expected: string;
  userInput: string;
  correct: boolean;
  hintsUsed: number;
  mode: 'WRITING' | 'LISTENING';
}

export interface DictationAttempt {
  id: string;
  cueId: string;
  mode: 'WRITING' | 'LISTENING';
  userInput: string;
  correct: boolean;
  hintsUsed: number;
  createdAt: string;
}

export const dictationApi = {
  record: (token: string, cueId: string, dto: RecordDto) =>
    api<DictationAttempt>(`/dictation/cues/${cueId}`, {
      method: 'POST',
      body: dto,
      token,
    }),
  accuracy: (token: string, contentId: string) =>
    api<{ total: number; correct: number }>(
      `/dictation/content/${contentId}/accuracy`,
      { token },
    ),
};
