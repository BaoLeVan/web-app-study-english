import { computeSrs } from './srs.algorithm';

describe('computeSrs (SM-2 variant)', () => {
  const fresh = { intervalDays: 0, easeFactor: 2.5, repetitions: 0 };

  it('schedules a freshly remembered word for tomorrow (1 day)', () => {
    const r = computeSrs(fresh, 'REMEMBERED');
    expect(r.intervalDays).toBe(1);
    expect(r.repetitions).toBe(1);
  });

  it('follows the 1 -> 3 -> 7-ish progression on repeated REMEMBERED', () => {
    let s = computeSrs(fresh, 'REMEMBERED'); // 1d, rep1, ease2.6
    expect(s.intervalDays).toBe(1);
    s = computeSrs(s, 'REMEMBERED'); // rep1 -> 3d
    expect(s.intervalDays).toBe(3);
    s = computeSrs(s, 'REMEMBERED'); // 3 * ~2.7 -> 8
    expect(s.intervalDays).toBeGreaterThanOrEqual(7);
  });

  it('resets interval to 1 day and lowers ease when FORGOT', () => {
    let s = computeSrs(fresh, 'REMEMBERED');
    s = computeSrs(s, 'REMEMBERED');
    s = computeSrs(s, 'REMEMBERED'); // interval grown
    const forgot = computeSrs(s, 'FORGOT');
    expect(forgot.intervalDays).toBe(1);
    expect(forgot.repetitions).toBe(0);
    expect(forgot.easeFactor).toBeLessThan(s.easeFactor);
  });

  it('never lets ease drop below the 1.3 floor', () => {
    let s = { intervalDays: 1, easeFactor: 1.3, repetitions: 0 };
    s = computeSrs(s, 'FORGOT');
    expect(s.easeFactor).toBeGreaterThanOrEqual(1.3);
  });
});
