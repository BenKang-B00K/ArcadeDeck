import { games } from '../data/games';

// Slugify a genre name for URLs. Lower-cases, replaces whitespace with `-`,
// strips non-alphanumeric (except hyphens). Stable across builds.
export function genreSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// Every distinct genre that appears on at least one playable game, alpha-sorted.
export function listGenres(): string[] {
  const set = new Set<string>();
  for (const g of games) {
    for (const genre of g.genres) set.add(genre);
  }
  return Array.from(set).sort();
}

// Resolve a slug back to its display-form genre name. Returns null when the
// slug doesn't match any current genre.
export function genreFromSlug(slug: string): string | null {
  const target = slug.toLowerCase();
  for (const g of listGenres()) {
    if (genreSlug(g) === target) return g;
  }
  return null;
}
