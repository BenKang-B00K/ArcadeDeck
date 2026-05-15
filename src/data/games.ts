import gamesData from './games.json';

export interface LeaderboardConfig {
  title: string;
  primaryLabel: string;
  primaryUnit: string;
  secondaryLabel: string;
  secondaryUnit: string;
  dualSort: boolean;
  subSortAsc: boolean;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  subScore?: number;
  date: string;
}

// Game text (title, description, fullDescription, controls, tips, lore,
// features) lives in src/i18n/locales/{lang}.json under games[id]. Resolve
// via getLocalizedString / getLocalizedArray.
export interface Game {
  id: string;
  slug: string;
  thumbnail: string;
  pageBg?: string;
  genres: string[];
  gameUrl: string;
  aspectRatio?: string;
  status?: string;
  isOriginal?: boolean;
  language?: string;
  badge?: string;
  leaderboard?: LeaderboardConfig;
}

const allGames: Game[] = gamesData as Game[];

export const games: Game[] = allGames.filter(g => g.status !== 'IN PRODUCTION');
