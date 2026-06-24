import { parseSubtitle } from './subtitle.parser';

describe('parseSubtitle', () => {
  it('parses a minimal SRT block', () => {
    const srt = `1
00:00:01,500 --> 00:00:03,000
Hello world

2
00:00:04,000 --> 00:00:05,250
How are you?`;
    const cues = parseSubtitle(srt);
    expect(cues).toEqual([
      { index: 1, startMs: 1500, endMs: 3000, text: 'Hello world' },
      { index: 2, startMs: 4000, endMs: 5250, text: 'How are you?' },
    ]);
  });

  it('strips a WEBVTT header and parses with dot separators', () => {
    const vtt = `WEBVTT

00:00:00.000 --> 00:00:02.000
First line

00:00:02.500 --> 00:00:04.000
Second line`;
    expect(parseSubtitle(vtt)).toEqual([
      { index: 1, startMs: 0, endMs: 2000, text: 'First line' },
      { index: 2, startMs: 2500, endMs: 4000, text: 'Second line' },
    ]);
  });

  it('strips inline HTML/VTT tags from cue text', () => {
    const srt = `1
00:00:01,000 --> 00:00:02,000
<i>Italic</i> and <c.yellow>colored</c> text`;
    expect(parseSubtitle(srt)[0]?.text).toBe('Italic and colored text');
  });

  it('joins multi-line cue text with single spaces', () => {
    const srt = `1
00:00:01,000 --> 00:00:02,000
line one
line two`;
    expect(parseSubtitle(srt)[0]?.text).toBe('line one line two');
  });

  it('skips malformed blocks without throwing', () => {
    const srt = `garbage

1
00:00:01,000 --> 00:00:02,000
ok

2
nonsense without timing
text`;
    const cues = parseSubtitle(srt);
    expect(cues).toHaveLength(1);
    expect(cues[0]?.text).toBe('ok');
  });

  it('handles Windows CRLF line endings', () => {
    const srt = '1\r\n00:00:01,000 --> 00:00:02,000\r\nhi';
    expect(parseSubtitle(srt)[0]?.text).toBe('hi');
  });
});
