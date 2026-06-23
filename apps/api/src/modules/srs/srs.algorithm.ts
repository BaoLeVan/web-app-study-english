import type { ReviewResult } from '@repo/types';

export interface SrsState {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
}

export interface SrsUpdate extends SrsState {
  /** Days until the next review (== intervalDays). */
  nextIntervalDays: number;
}

const MIN_EASE = 1.3;

/**
 * SM-2 variant tuned for a binary "Remembered / Forgot" grade.
 *
 * REMEMBERED:
 *   rep 0 -> 1 day, rep 1 -> 3 days, rep >=2 -> round(prev * ease).
 *   ease nudged up by +0.1.
 * FORGOT:
 *   reset repetitions & interval to "tomorrow" (1 day), ease penalised by -0.2
 *   (floored at 1.3) so chronically-forgotten words resurface faster.
 *
 * The 1d -> 3d -> 7d... progression in the plan falls out of ease ~2.3-2.5.
 */
export function computeSrs(state: SrsState, result: ReviewResult): SrsUpdate {
  let { intervalDays, easeFactor, repetitions } = state;

  if (result === 'FORGOT') {
    repetitions = 0;
    intervalDays = 1;
    easeFactor = Math.max(MIN_EASE, easeFactor - 0.2);
  } else {
    if (repetitions === 0) intervalDays = 1;
    else if (repetitions === 1) intervalDays = 3;
    else intervalDays = Math.round(intervalDays * easeFactor);
    repetitions += 1;
    easeFactor = easeFactor + 0.1;
  }

  return { intervalDays, easeFactor, repetitions, nextIntervalDays: intervalDays };
}

/** Add whole days to a date without mutating the input. */
export function addDays(from: Date, days: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}
