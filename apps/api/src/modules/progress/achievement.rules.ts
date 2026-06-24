/**
 * Pure achievement-unlock rules.
 *
 * Each rule is a (code, predicate) pair. We keep the rule list extensible so
 * Sprint 7 ships a small set tied to features we've already built — Vocab,
 * SRS, Speaking, Streak — and later sprints can add more without touching
 * persistence code.
 */

export interface UnlockStats {
  wordsLearned: number;
  currentStreak: number;
  totalPoints: number;
  speakingAttempts: number;
  dictationCorrect: number;
}

export interface AchievementRule {
  code: string;
  isUnlocked: (stats: UnlockStats) => boolean;
}

export const RULES: AchievementRule[] = [
  {
    code: 'first_word',
    isUnlocked: (s) => s.wordsLearned >= 1,
  },
  {
    code: 'vocab_50',
    isUnlocked: (s) => s.wordsLearned >= 50,
  },
  {
    code: 'vocab_200',
    isUnlocked: (s) => s.wordsLearned >= 200,
  },
  {
    code: 'streak_7',
    isUnlocked: (s) => s.currentStreak >= 7,
  },
  {
    code: 'streak_30',
    isUnlocked: (s) => s.currentStreak >= 30,
  },
  {
    code: 'first_speak',
    isUnlocked: (s) => s.speakingAttempts >= 1,
  },
  {
    code: 'dictation_50',
    isUnlocked: (s) => s.dictationCorrect >= 50,
  },
  {
    code: 'points_1000',
    isUnlocked: (s) => s.totalPoints >= 1000,
  },
];

/** Returns the codes that should be unlocked *now* given the stats. */
export function evaluate(stats: UnlockStats): string[] {
  return RULES.filter((r) => r.isUnlocked(stats)).map((r) => r.code);
}
