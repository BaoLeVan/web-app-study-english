/** Pure date-bucketing helpers for /progress/series. */

export function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

/** Format a Date as YYYY-MM-DD in local time (matches what the UI labels). */
export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** All YYYY-MM-DD keys for the inclusive [from, to] range. */
export function dayKeysBetween(from: Date, to: Date): string[] {
  const out: string[] = [];
  const cur = startOfDay(from);
  const end = startOfDay(to);
  while (cur.getTime() <= end.getTime()) {
    out.push(dayKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

/**
 * Count rows by their createdAt day. Rows whose createdAt falls outside the
 * provided day key set are silently ignored — caller decides the range.
 */
export function bucketByDay<T extends { createdAt: Date }>(
  rows: T[],
  keys: string[],
): Record<string, number> {
  const buckets: Record<string, number> = Object.fromEntries(keys.map((k) => [k, 0]));
  for (const r of rows) {
    const k = dayKey(r.createdAt);
    if (k in buckets) buckets[k]! += 1;
  }
  return buckets;
}
