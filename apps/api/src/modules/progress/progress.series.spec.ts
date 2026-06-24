import { bucketByDay, dayKey, dayKeysBetween, startOfDay } from './progress.series';

describe('startOfDay', () => {
  it('preserves date but zeroes time', () => {
    const d = new Date('2026-06-25T13:42:11.500');
    const s = startOfDay(d);
    expect(s.getFullYear()).toBe(2026);
    expect(s.getMonth()).toBe(5);
    expect(s.getDate()).toBe(25);
    expect(s.getHours()).toBe(0);
  });
});

describe('dayKey', () => {
  it('formats as YYYY-MM-DD with zero padding', () => {
    expect(dayKey(new Date('2026-03-07T11:00:00'))).toBe('2026-03-07');
  });
});

describe('dayKeysBetween', () => {
  it('returns inclusive ascending day keys', () => {
    const keys = dayKeysBetween(new Date('2026-06-22T00:00:00'), new Date('2026-06-25T23:00:00'));
    expect(keys).toEqual(['2026-06-22', '2026-06-23', '2026-06-24', '2026-06-25']);
  });

  it('handles same-day from/to as a single bucket', () => {
    const keys = dayKeysBetween(new Date('2026-06-25'), new Date('2026-06-25'));
    expect(keys).toEqual(['2026-06-25']);
  });
});

describe('bucketByDay', () => {
  const keys = ['2026-06-23', '2026-06-24', '2026-06-25'];
  it('counts rows into the right day bucket', () => {
    const rows = [
      { createdAt: new Date('2026-06-23T10:00:00') },
      { createdAt: new Date('2026-06-24T10:00:00') },
      { createdAt: new Date('2026-06-24T22:00:00') },
    ];
    expect(bucketByDay(rows, keys)).toEqual({
      '2026-06-23': 1,
      '2026-06-24': 2,
      '2026-06-25': 0,
    });
  });
  it('ignores rows outside the requested range', () => {
    const rows = [{ createdAt: new Date('2025-01-01') }];
    expect(bucketByDay(rows, keys)).toEqual({
      '2026-06-23': 0,
      '2026-06-24': 0,
      '2026-06-25': 0,
    });
  });
});
