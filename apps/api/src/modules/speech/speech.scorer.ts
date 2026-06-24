import type { SpeechAssessment, WordScore } from '@repo/types';

/**
 * Compare a transcribed string against a reference sentence and produce
 * the same SpeechAssessment shape Azure Pronunciation Assessment used to
 * return — so the frontend ScoreCard renders unchanged.
 *
 * Algorithm: Wagner-Fischer alignment between reference and hypothesis
 * tokens, where token "equality" is fuzzy via Levenshtein similarity. This
 * lets us distinguish three error types the caller cares about:
 *   - Omission       : reference token has no aligned hypothesis token
 *   - Insertion      : hypothesis token has no aligned reference token
 *   - Mispronunciation: aligned but similarity below MATCH_THRESHOLD
 *
 * Fluency is a coarse heuristic: compare measured words-per-minute against
 * a "natural" target band. The browser passes the recording duration so
 * we don't need server-side audio analysis.
 */

const MATCH_THRESHOLD = 0.6; // 0-1 token similarity above which we call it a match
const TARGET_WPM_LOW = 110;
const TARGET_WPM_HIGH = 200;

export interface ScoreInput {
  referenceText: string;
  transcript: string;
  durationMs: number;
}

export function scoreSpeech(input: ScoreInput): SpeechAssessment {
  const refTokens = tokenize(input.referenceText);
  const hypTokens = tokenize(input.transcript);

  if (refTokens.length === 0) {
    return emptyAssessment();
  }

  const ops = align(refTokens, hypTokens);

  // Walk the edit path to label every reference token.
  const words: WordScore[] = [];
  for (const op of ops) {
    if (op.kind === 'match' || op.kind === 'sub') {
      const sim = similarity(op.ref!, op.hyp!);
      const accuracy = Math.round(sim * 100);
      const errorType: WordScore['errorType'] =
        sim >= MATCH_THRESHOLD ? 'None' : 'Mispronunciation';
      words.push({ word: op.ref!, accuracyScore: accuracy, errorType });
    } else if (op.kind === 'del') {
      // Reference token with no aligned hypothesis token => user skipped it.
      words.push({ word: op.ref!, accuracyScore: 0, errorType: 'Omission' });
    } else {
      // Insertion: extra word in the user's speech, not in reference.
      words.push({ word: op.hyp!, accuracyScore: 0, errorType: 'Insertion' });
    }
  }

  const refWordCount = refTokens.length;
  const matched = words.filter((w) => w.errorType === 'None').length;
  const accuracySum = words
    .filter((w) => w.errorType === 'None' || w.errorType === 'Mispronunciation')
    .reduce((s, w) => s + w.accuracyScore, 0);
  const accuracyDen = words.filter(
    (w) => w.errorType === 'None' || w.errorType === 'Mispronunciation',
  ).length;

  const accuracyScore = accuracyDen > 0 ? accuracySum / accuracyDen : 0;
  const completenessScore = (matched / refWordCount) * 100;
  const fluencyScore = scoreFluency(refWordCount, input.durationMs);
  const pronunciationScore =
    0.6 * accuracyScore + 0.2 * fluencyScore + 0.2 * completenessScore;

  return {
    accuracyScore: round(accuracyScore),
    fluencyScore: round(fluencyScore),
    completenessScore: round(completenessScore),
    pronunciationScore: round(pronunciationScore),
    words,
  };
}

interface EditOp {
  kind: 'match' | 'sub' | 'del' | 'ins';
  ref?: string;
  hyp?: string;
}

/**
 * Wagner-Fischer with fuzzy token equality. Cost matrix is built in O(n*m);
 * we backtrack to get the edit script the caller needs.
 */
function align(ref: string[], hyp: string[]): EditOp[] {
  const n = ref.length;
  const m = hyp.length;
  // dp[i][j] = min edit cost aligning ref[..i] with hyp[..j]
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i]![0] = i;
  for (let j = 0; j <= m; j++) dp[0]![j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const sim = similarity(ref[i - 1]!, hyp[j - 1]!);
      const subCost = sim >= MATCH_THRESHOLD ? 0 : 1;
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,           // deletion
        dp[i]![j - 1]! + 1,           // insertion
        dp[i - 1]![j - 1]! + subCost, // substitution / match
      );
    }
  }

  const ops: EditOp[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const sim = similarity(ref[i - 1]!, hyp[j - 1]!);
      const subCost = sim >= MATCH_THRESHOLD ? 0 : 1;
      if (dp[i]![j] === dp[i - 1]![j - 1]! + subCost) {
        ops.push({
          kind: subCost === 0 ? 'match' : 'sub',
          ref: ref[i - 1],
          hyp: hyp[j - 1],
        });
        i--;
        j--;
        continue;
      }
    }
    if (i > 0 && dp[i]![j] === dp[i - 1]![j]! + 1) {
      ops.push({ kind: 'del', ref: ref[i - 1] });
      i--;
      continue;
    }
    ops.push({ kind: 'ins', hyp: hyp[j - 1] });
    j--;
  }
  return ops.reverse();
}

/** Lowercased, punctuation-stripped, whitespace-collapsed word array. */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z'\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/** Normalized Levenshtein similarity in 0..1. */
function similarity(a: string, b: string): number {
  if (a === b) return 1;
  const longest = Math.max(a.length, b.length);
  if (longest === 0) return 1;
  return 1 - levenshtein(a, b) / longest;
}

function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const prev = new Array(b.length + 1).fill(0).map((_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prevDiag = prev[0]!;
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const stash = prev[j]!;
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      prev[j] = Math.min(prev[j]! + 1, prev[j - 1]! + 1, prevDiag + cost);
      prevDiag = stash;
    }
  }
  return prev[b.length]!;
}

/**
 * Map measured WPM to a 0-100 band. We grade the *gap* from the target
 * range — perfect inside the band, dropping linearly outside.
 */
function scoreFluency(wordCount: number, durationMs: number): number {
  if (durationMs <= 0 || wordCount === 0) return 0;
  const wpm = (wordCount / (durationMs / 1000)) * 60;
  if (wpm >= TARGET_WPM_LOW && wpm <= TARGET_WPM_HIGH) return 100;
  if (wpm < TARGET_WPM_LOW) {
    return Math.max(0, 100 - ((TARGET_WPM_LOW - wpm) / TARGET_WPM_LOW) * 100);
  }
  // Faster than the band: penalise but more gently — natives often exceed 200.
  return Math.max(0, 100 - ((wpm - TARGET_WPM_HIGH) / TARGET_WPM_HIGH) * 80);
}

function emptyAssessment(): SpeechAssessment {
  return {
    accuracyScore: 0,
    fluencyScore: 0,
    completenessScore: 0,
    pronunciationScore: 0,
    words: [],
  };
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
