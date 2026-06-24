import { nextStreak, startOfDay } from './progress.streak';

const at = (iso: string) => new Date(iso);

describe('nextStreak', () => {
  const now = at('2026-06-24T10:00:00');

  it('starts at 1 when there is no prior activity', () => {
    expect(nextStreak({ currentStreak: 0, lastActiveAt: null }, now)).toBe(1);
  });

  it('keeps the streak unchanged when the user was already active today', () => {
    expect(
      nextStreak({ currentStreak: 5, lastActiveAt: at('2026-06-24T02:00:00') }, now),
    ).toBe(5);
  });

  it('increments the streak when the last activity was yesterday', () => {
    expect(
      nextStreak({ currentStreak: 5, lastActiveAt: at('2026-06-23T22:00:00') }, now),
    ).toBe(6);
  });

  it('resets to 1 when a day was missed', () => {
    expect(
      nextStreak({ currentStreak: 12, lastActiveAt: at('2026-06-22T22:00:00') }, now),
    ).toBe(1);
  });
});

describe('startOfDay', () => {
  it('zeroes out hours/minutes/seconds/ms', () => {
    const sod = startOfDay(at('2026-06-24T17:42:11.500'));
    expect(sod.getHours()).toBe(0);
    expect(sod.getMinutes()).toBe(0);
    expect(sod.getSeconds()).toBe(0);
    expect(sod.getMilliseconds()).toBe(0);
  });
});
