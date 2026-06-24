import { extractYouTubeId } from './youtube';

describe('extractYouTubeId', () => {
  const cases: Array<[string, string | null]> = [
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ?t=15', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['not a url', null],
    ['https://example.com/watch?v=tooShort', null],
  ];
  it.each(cases)('extracts id from %s', (input, expected) => {
    expect(extractYouTubeId(input)).toBe(expected);
  });
});
