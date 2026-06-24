import { scoreSpeech } from './speech.scorer';

describe('scoreSpeech', () => {
  const ref = 'The quick brown fox jumps over the lazy dog';
  const naturalDuration = (ref.split(' ').length / 150) * 60_000; // 150 wpm

  it('returns a perfect-ish score for a verbatim transcript', () => {
    const r = scoreSpeech({
      referenceText: ref,
      transcript: ref,
      durationMs: naturalDuration,
    });
    expect(r.completenessScore).toBe(100);
    expect(r.accuracyScore).toBe(100);
    expect(r.fluencyScore).toBe(100);
    expect(r.words.every((w) => w.errorType === 'None')).toBe(true);
  });

  it('marks missing words as Omission and lowers completeness', () => {
    const r = scoreSpeech({
      referenceText: 'hello beautiful world',
      transcript: 'hello world',
      durationMs: 2000,
    });
    const omitted = r.words.find((w) => w.errorType === 'Omission');
    expect(omitted?.word).toBe('beautiful');
    expect(r.completenessScore).toBeCloseTo(66.7, 0);
  });

  it('marks unfamiliar extra words as Insertion', () => {
    const r = scoreSpeech({
      referenceText: 'hello world',
      transcript: 'hello cruel world',
      durationMs: 2000,
    });
    const inserted = r.words.find((w) => w.errorType === 'Insertion');
    expect(inserted?.word).toBe('cruel');
  });

  it('labels close-but-not-equal words as Mispronunciation', () => {
    // "elephant" -> "olifant" has 4 edits over 8 chars => 0.5 similarity, which
    // sits below the 0.6 match threshold and gets flagged as a mispronunciation
    // (still aligned to the same reference slot — not omitted, not inserted).
    const r = scoreSpeech({
      referenceText: 'elephant',
      transcript: 'olifant',
      durationMs: 1000,
    });
    expect(r.words[0]?.errorType).toBe('Mispronunciation');
    expect(r.words[0]?.accuracyScore).toBeGreaterThan(30);
    expect(r.words[0]?.accuracyScore).toBeLessThan(100);
  });

  it('penalises very slow speech', () => {
    const r = scoreSpeech({
      referenceText: 'hello world',
      transcript: 'hello world',
      durationMs: 10_000, // 12 wpm — glacial
    });
    expect(r.fluencyScore).toBeLessThan(50);
  });

  it('is case- and punctuation-insensitive', () => {
    const r = scoreSpeech({
      referenceText: "Hello, world!",
      transcript: 'hello world',
      durationMs: 1500,
    });
    expect(r.accuracyScore).toBe(100);
    expect(r.completenessScore).toBe(100);
  });

  it('returns zero accross the board when transcript is empty', () => {
    const r = scoreSpeech({
      referenceText: 'hello world',
      transcript: '',
      durationMs: 2000,
    });
    expect(r.completenessScore).toBe(0);
    expect(r.words.every((w) => w.errorType === 'Omission')).toBe(true);
  });
});
