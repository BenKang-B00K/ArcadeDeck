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

// Display name for a genre in the active locale (`genre_{slug}` UI key), English name as fallback.
export function genreName(t: (key: string, fallback: string) => string, genre: string): string {
  return t(`genre_${genreSlug(genre)}`, genre);
}

// Chip icons in public/images/genre/. Genres without an entry render a text-only chip.
const GENRE_ICON: Record<string, string> = {
  Action: 'sword', Arcade: 'rocket', Casual: 'fruit', Puzzle: 'puzzle-piece', Strategy: 'chess-knight',
  Survival: 'zombie-hand', Roguelike: 'skull', Party: 'dice', PvP: 'crown', Educational: 'brain', 'Local Co-op': 'soccer-ball',
  'Tower Defense': 'tower', Idle: 'hourglass', RPG: 'shield', Tycoon: 'coins', Simulation: 'gear',
  'Auto Battler': 'auto-battler', 'Loadout Grid-Auto-Battle': 'auto-battler', 'Travel Planner': 'suitcase', Rhythm: 'music-note',
};
export function genreIcon(genre: string): string | null {
  const n = GENRE_ICON[genre];
  return n ? `${import.meta.env.BASE_URL}images/genre/${n}.svg` : null;
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
