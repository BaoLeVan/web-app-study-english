/** Extract a YouTube video id from any common URL format. Returns null when invalid. */
export function extractYouTubeId(url: string): string | null {
  const trimmed = url.trim();
  // youtu.be/<id>
  const short = /youtu\.be\/([A-Za-z0-9_-]{11})/.exec(trimmed);
  if (short) return short[1]!;
  // youtube.com/watch?v=<id>
  const watch = /[?&]v=([A-Za-z0-9_-]{11})/.exec(trimmed);
  if (watch) return watch[1]!;
  // youtube.com/embed/<id> or youtube.com/shorts/<id>
  const embed = /youtube\.com\/(?:embed|shorts)\/([A-Za-z0-9_-]{11})/.exec(trimmed);
  if (embed) return embed[1]!;
  // Bare 11-char id
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return null;
}
