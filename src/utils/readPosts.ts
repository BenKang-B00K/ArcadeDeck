// Which blog posts this browser has opened. localStorage-only: per-device,
// never uploaded, same shape as the personal-best storage in pb.ts.
const KEY = 'read_posts';

// A post stops being "NEW" once it is this old, so a first-time visitor does
// not get a wall of badges.
const NEW_DAYS = 30;

export function readPosts(): Set<string> {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) || '[]');
    return new Set(Array.isArray(raw) ? raw.filter((s): s is string => typeof s === 'string') : []);
  } catch {
    return new Set();
  }
}

export function markPostRead(slug: string): void {
  try {
    const set = readPosts();
    if (set.has(slug)) return;
    set.add(slug);
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    // Private mode / storage blocked — posts just never show as read.
  }
}

export const isRecentPost = (date: string): boolean =>
  Date.now() - new Date(`${date}T00:00:00Z`).getTime() < NEW_DAYS * 86400000;
