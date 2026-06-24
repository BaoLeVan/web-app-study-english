import { evaluate } from './achievement.rules';

describe('achievement evaluate', () => {
  const base = {
    wordsLearned: 0,
    currentStreak: 0,
    totalPoints: 0,
    speakingAttempts: 0,
    dictationCorrect: 0,
  };

  it('returns empty for a brand-new user', () => {
    expect(evaluate(base)).toEqual([]);
  });

  it('unlocks first_word at 1 word learned', () => {
    expect(evaluate({ ...base, wordsLearned: 1 })).toContain('first_word');
  });

  it('unlocks vocab_50 and vocab_200 cumulatively', () => {
    const r = evaluate({ ...base, wordsLearned: 250 });
    expect(r).toEqual(expect.arrayContaining(['first_word', 'vocab_50', 'vocab_200']));
  });

  it('streak gates trigger at exact thresholds', () => {
    expect(evaluate({ ...base, currentStreak: 7 })).toContain('streak_7');
    expect(evaluate({ ...base, currentStreak: 30 })).toContain('streak_30');
    expect(evaluate({ ...base, currentStreak: 6 })).not.toContain('streak_7');
  });

  it('first_speak fires on the first attempt', () => {
    expect(evaluate({ ...base, speakingAttempts: 1 })).toContain('first_speak');
  });

  it('points_1000 only fires above the threshold', () => {
    expect(evaluate({ ...base, totalPoints: 999 })).not.toContain('points_1000');
    expect(evaluate({ ...base, totalPoints: 1000 })).toContain('points_1000');
  });
});
