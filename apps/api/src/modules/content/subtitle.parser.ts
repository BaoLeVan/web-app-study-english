/**
 * Parse SRT or WebVTT subtitle text into normalized cues.
 *
 * Why we have our own parser instead of a dependency:
 *  - keeps the API tree dep-free for a piece of logic we want to unit-test
 *  - we need *exactly* the SubtitleCue shape from @repo/types
 *  - real-world subtitle files have ragged formatting; we want to control how
 *    forgiving we are (e.g. accept either "," or "." as the ms separator).
 */

import type { SubtitleCue } from '@repo/types';

const TIME_RE =
  /(?<h>\d{1,2}):(?<m>\d{2}):(?<s>\d{2})[.,](?<ms>\d{1,3})\s*-->\s*(?<eh>\d{1,2}):(?<em>\d{2}):(?<es>\d{2})[.,](?<ems>\d{1,3})/;

function toMs(h: string, m: string, s: string, ms: string): number {
  return (
    Number(h) * 3_600_000 +
    Number(m) * 60_000 +
    Number(s) * 1_000 +
    Number(ms.padEnd(3, '0'))
  );
}

export function parseSubtitle(raw: string): SubtitleCue[] {
  // Normalize Windows line endings + strip a leading WebVTT header.
  let text = raw.replace(/\r\n?/g, '\n').trim();
  if (text.startsWith('WEBVTT')) {
    const firstBlank = text.indexOf('\n\n');
    text = firstBlank >= 0 ? text.slice(firstBlank + 2) : '';
  }

  const blocks = text.split(/\n\s*\n/);
  const cues: SubtitleCue[] = [];
  let index = 0;

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    // SRT often has a numeric index on the first line; WebVTT may have a hint.
    // Either way the time line is the first one matching TIME_RE.
    const timeLineIdx = lines.findIndex((l) => TIME_RE.test(l));
    if (timeLineIdx < 0) continue;

    const m = TIME_RE.exec(lines[timeLineIdx]!);
    if (!m?.groups) continue;
    const { h, m: mm, s, ms, eh, em, es, ems } = m.groups;
    const startMs = toMs(h!, mm!, s!, ms!);
    const endMs = toMs(eh!, em!, es!, ems!);
    if (endMs <= startMs) continue;

    const textLines = lines.slice(timeLineIdx + 1);
    if (textLines.length === 0) continue;
    const cueText = textLines.join(' ').replace(/<[^>]+>/g, '').trim();
    if (!cueText) continue;

    index += 1;
    cues.push({ index, startMs, endMs, text: cueText });
  }

  return cues;
}
