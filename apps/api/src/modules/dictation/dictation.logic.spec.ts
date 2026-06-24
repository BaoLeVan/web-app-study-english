import { hintMask, isCorrect, pickBlanks, tokenize } from './dictation.logic';

describe('tokenize', () => {
  it('separates words from spaces and punctuation', () => {
    const toks = tokenize("hello, world!");
    expect(toks.map((t) => t.text)).toEqual(['hello', ', ', 'world', '!']);
    expect(toks.map((t) => t.isWord)).toEqual([true, false, true, false]);
  });
});

describe('pickBlanks', () => {
  const cue = 'The quick brown fox jumps over the lazy dog';

  it('picks roughly the requested ratio of content words', () => {
    const idxs = pickBlanks(cue, { ratio: 0.3, seed: 1 });
    // 7 candidates (length>=3): quick brown fox jumps over lazy dog -> 30% ≈ 2
    expect(idxs.length).toBeGreaterThanOrEqual(2);
    expect(idxs.length).toBeLessThanOrEqual(3);
  });

  it('never blanks short words like "the"', () => {
    const idxs = pickBlanks(cue, { ratio: 0.9, seed: 7 });
    const toks = tokenize(cue);
    for (const i of idxs) expect(toks[i]!.text.length).toBeGreaterThanOrEqual(3);
  });

  it('is stable for the same (cue, seed) pair', () => {
    const a = pickBlanks(cue, { ratio: 0.4, seed: 42 });
    const b = pickBlanks(cue, { ratio: 0.4, seed: 42 });
    expect(a).toEqual(b);
  });

  it('returns different picks for different seeds', () => {
    const a = pickBlanks(cue, { ratio: 0.4, seed: 1 });
    const b = pickBlanks(cue, { ratio: 0.4, seed: 99 });
    expect(a).not.toEqual(b);
  });

  it('always blanks at least one word when content words exist', () => {
    expect(pickBlanks('Hi there', { ratio: 0.01 }).length).toBeGreaterThanOrEqual(1);
  });
});

describe('isCorrect', () => {
  it('ignores case and trailing punctuation', () => {
    expect(isCorrect('Quick', 'quick')).toBe(true);
    expect(isCorrect("don't", "DON'T")).toBe(true);
    expect(isCorrect('world', 'world,')).toBe(true);
  });
  it('rejects wrong answers', () => {
    expect(isCorrect('quick', 'slow')).toBe(false);
    expect(isCorrect('quick', '')).toBe(false);
  });
});

describe('hintMask', () => {
  it('reveals only the requested prefix letters, masking the rest', () => {
    expect(hintMask('quick', 1)).toBe('q____');
    expect(hintMask('quick', 3)).toBe('qui__');
    expect(hintMask('quick', 5)).toBe('quick');
  });
  it("keeps apostrophes and dashes visible without counting them", () => {
    expect(hintMask("don't", 1)).toBe("d__'_");
  });
});
