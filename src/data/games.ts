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
  // Input support, audited against each game's build: 'PC' needs a keyboard or
  // right-click, 'MOBILE' is touch-only, 'BOTH' works with taps and a mouse.
  platform?: 'PC' | 'MOBILE' | 'BOTH';
  isOriginal?: boolean;
  language?: string;
  badge?: string;
  // Spotlighted in the Home "Featured Game" section. Flip here, never by id in code.
  featured?: boolean;
  // Storefront link for a game that also has a paid PC release. Renders a
  // secondary CTA under Play Now and feeds JSON-LD `sameAs`.
  steamUrl?: string;
  lastUpdated?: string;
  // Auto-enter fullscreen on PLAY click. Defaults to true when omitted; set
  // false for games that misbehave or look worse in fullscreen.
  autoFullscreen?: boolean;
  // Personal-best anchors, non-decreasing: [Bronze 1, Silver 1, Gold 1,
  // Gold 10, Diamond]. utils/pb.ts expands them into 31 tiers (10 divisions
  // per band, linear between anchors, one Diamond on top). Stage-capped games
  // repeat the cap so a full clear is Diamond. Only games whose build posts a
  // GAME_OVER score have these. Tuning knob — raise or lower per game as real
  // scores come in; omit to show the best with no tier.
  // The score's name (e.g. "Depth", "Waves") is `scoreLabel` in en.json.
  scoreTiers?: number[];
}

const allGames: Game[] = gamesData as Game[];

export const games: Game[] = allGames.filter(g => g.status !== 'IN PRODUCTION');

// Touch-only device (phone/tablet): no hover, coarse pointer. Evaluated once —
// input type does not change while the page is open.
export const TOUCH_ONLY: boolean =
  typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches;

// `games` minus the ones this device cannot play (PC-only on touch, mobile-only
// on desktop). Browse surfaces (grids, related, random) use this; lookups by
// id/slug (player, blog links, PB) keep using `games` so shared links still open.
export const deviceGames: Game[] = games.filter(g =>
  TOUCH_ONLY ? g.platform !== 'PC' : g.platform !== 'MOBILE',
);

// ponytail: genre → hue; unknown genre falls back to violet (260)
export const GENRE_HUE: Record<string, number> = {
  'Tower Defense': 25, Survival: 0, Strategy: 210, Idle: 45, RPG: 280, Casual: 330,
  Arcade: 190, 'Local Co-op': 140, Action: 10, Roguelike: 300, PvP: 355, Tycoon: 60,
  Simulation: 170, 'Auto Battler': 235, 'Loadout Grid-Auto-Battle': 235,
};
