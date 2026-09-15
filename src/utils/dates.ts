// Blog/post dates. Stored as bare `YYYY-MM-DD`, so they are pinned to UTC to
// keep the rendered day from drifting a day back west of Greenwich.
// ponytail: one formatter, month width is the only knob anyone has needed.
export const formatPostDate = (
  iso: string,
  lang: string,
  month: 'long' | 'short' = 'long',
): string =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString(lang === 'en' ? 'en-US' : lang, {
    year: 'numeric',
    month,
    day: 'numeric',
    timeZone: 'UTC',
  });

// Relative stamp for comments and forum posts; falls back to an absolute date
// past a week, where "8d ago" stops being useful.
export function timeAgo(date: Date): string {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return 'Just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return date.toLocaleDateString();
}
