/**
 * Pure helpers mirroring apps/api/src/modules/dictation/dictation.logic.ts.
 * We duplicate (not import) because the client needs to render the masked
 * cue and validate inputs locally for snappy UX — but the server validation
 * stays the source of truth for what gets persisted.
 */

const SEED_PRIME = 2654435761;

export interface Token {
  text: string;
  isWord: boolean;
}

export function tokenize(text: string): Token[] {
  const out: Token[] = [];
  const re = /[A-Za-z][A-Za-z'-]*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), isWord: false });
    out.push({ text: m[0]!, isWord: true });
    last = m.index + m[0]!.length;
  }
  if (last < text.length) out.push({ text: text.slice(last), isWord: false });
  return out;
}

function seededRand(seed: number, max: number): number {
  const x = Math.imul(seed | 0, SEED_PRIME) >>> 0;
  return x % max;
}

export function pickBlanks(
  cueText: string,
  opts: { ratio?: number; seed?: number } = {},
): number[] {
  const ratio = opts.ratio ?? 0.3;
  const seed = opts.seed ?? 0;
  const tokens = tokenize(cueText);
  const candidates: number[] = [];
  tokens.forEach((t, i) => {
    if (t.isWord && t.text.length >= 3) candidates.push(i);
  });
  if (candidates.length === 0) return [];

  const target = Math.max(1, Math.round(candidates.length * ratio));
  const out: number[] = [];
  const pool = [...candidates];
  let s = seed;
  for (let k = 0; k < target && pool.length > 0; k++) {
    s = (s + 1) | 0;
    const idx = seededRand(s, pool.length);
    out.push(pool[idx]!);
    pool.splice(idx, 1);
  }
  return out.sort((a, b) => a - b);
}

export function isCorrect(expected: string, actual: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z']/g, '');
  return norm(expected) === norm(actual);
}

export function hintMask(expected: string, revealedChars: number): string {
  const out: string[] = [];
  let lettersShown = 0;
  for (const ch of expected) {
    if (/[A-Za-z]/.test(ch)) {
      out.push(lettersShown < revealedChars ? ch : '_');
      lettersShown++;
    } else {
      out.push(ch);
    }
  }
  return out.join('');
}
