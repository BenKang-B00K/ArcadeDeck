import gamesData from './games.json';

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
  lastUpdated?: string;
  // Auto-enter fullscreen on PLAY click. Defaults to true when omitted; set
  // false for games that misbehave or look worse in fullscreen.
  autoFullscreen?: boolean;
}

const allGames: Game[] = gamesData as Game[];

export const games: Game[] = allGames.filter(g => g.status !== 'IN PRODUCTION');
