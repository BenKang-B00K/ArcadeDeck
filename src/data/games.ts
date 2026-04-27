import lightData from './games-light.json';

export interface LeaderboardConfig {
  title: string;
  primaryLabel: string;
  primaryUnit: string;
  secondaryLabel: string;
  secondaryUnit: string;
  dualSort: boolean;
  subSortAsc: boolean;
}

// Light fields: bundled with the main chunk so the Home grid, search, and
// leaderboard code render without a network round-trip.
export interface GameLight {
  id: string;
  slug: string;
  title: string;
  titleKo?: string;
  description: string;
  thumbnail: string;
  genres: string[];
  gameUrl: string;
  aspectRatio?: string;
  status?: string;
  isOriginal?: boolean;
  language?: string;
  badge?: string;
  features?: string[];
  leaderboard?: LeaderboardConfig;
}

// Heavy fields: only the GamePlayer page renders these. Loaded lazily via
// loadGameDetails so the Home bundle stays small.
export interface GameDetailFields {
  descriptionKo?: string;
  // Optional because GamePlayer first renders with light data then hydrates
  // detail fields once games.json (chunked) finishes loading.
  fullDescription?: string;
  fullDescriptionKo?: string;
  controls?: string;
  controlsKo?: string;
  tips?: string;
  tipsKo?: string;
  lore?: string;
  loreKo?: string;
  featuresKo?: string[];
}

export type Game = GameLight & GameDetailFields;

const allGames: GameLight[] = lightData as GameLight[];

export const games: GameLight[] = allGames.filter(g => g.status !== 'IN PRODUCTION');

let detailCache: Game[] | null = null;

export async function loadAllGameDetails(): Promise<Game[]> {
  if (detailCache) return detailCache;
  const mod = await import('./games.json');
  detailCache = (mod.default as Game[]).filter(g => g.status !== 'IN PRODUCTION');
  return detailCache;
}

export async function loadGameDetails(predicate: (g: Game) => boolean): Promise<Game | undefined> {
  const all = await loadAllGameDetails();
  return all.find(predicate);
}
