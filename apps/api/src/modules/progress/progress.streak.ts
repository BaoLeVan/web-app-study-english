/** Pure streak math — extracted so unit tests don't need a Prisma client. */

export function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Given the user's last-active timestamp and current streak, return the new
 * streak after a review at `now`:
 *   - never active before  -> 1
 *   - active earlier today -> unchanged (one review per day already counted)
 *   - active yesterday     -> +1 (streak continues)
 *   - any larger gap       -> reset to 1
 *
 * "Yesterday" is computed from local-server midnights; we explicitly DO NOT
 * try to be timezone-aware here — the scheduler already runs in server local
 * time, and v1 stores reminder times the same way.
 */
export function nextStreak(
  prev: { currentStreak: number; lastActiveAt: Date | null },
  now: Date,
): number {
  if (!prev.lastActiveAt) return 1;
  const today = startOfDay(now).getTime();
  const last = startOfDay(prev.lastActiveAt).getTime();
  if (last === today) return prev.currentStreak;
  if (last === today - ONE_DAY_MS) return prev.currentStreak + 1;
  return 1;
}
