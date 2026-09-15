// Personal bests + Deck Level. Everything here is localStorage-only: no
// network, no accounts, nothing to cheat against but yourself.
//
// ponytail: primary score only — games also post `subScore`, but a single
// number is enough for a personal best. Widen if a game needs a tiebreak.
import { games } from '../data/games';
import { readStreak } from './streak';

// Sanity ceiling for a score arriving over postMessage from a game frame.
export const MAX_SCORE = 1e12;

const PLAYED_KEY = 'played_games';
const pbKey = (id: string) => `pb_${id}`;

/** 0 = unranked, 1 = bronze, 2 = silver, 3 = gold. */
export type Tier = 0 | 1 | 2 | 3;

// Badge class (shared with the streak badges in MyGames.css) + the ui key its
// label lives under. Index by Tier.
export const TIER_META = [
  null,
  { cls: 'tier-bronze', key: 'tierBronze', en: 'Bronze' },
  { cls: 'tier-silver', key: 'tierSilver', en: 'Silver' },
  { cls: 'tier-gold', key: 'tierGold', en: 'Gold' },
] as const;

export const XP_PER_GAME_PLAYED = 10;
export const XP_PER_TIER = 25;
export const XP_PER_STREAK_DAY = 5;
export const XP_PER_LEVEL = 100;

export function readPB(id: string): number {
  try {
    const n = Number(localStorage.getItem(pbKey(id)));
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

/** Stores `score` when it beats the current best. Returns true if it did. */
export function savePB(id: string, score: number): boolean {
  if (!Number.isFinite(score) || score <= 0 || score <= readPB(id)) return false;
  try {
    localStorage.setItem(pbKey(id), String(score));
  } catch {
    // storage full / private mode — the run just doesn't stick
  }
  return true;
}

export function readPlayed(): string[] {
  try {
    const list: unknown = JSON.parse(localStorage.getItem(PLAYED_KEY) || '[]');
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/** Uncapped play history, unlike `recently_played` which keeps the last 5. */
export function recordPlayed(id: string): void {
  const list = readPlayed();
  if (list.includes(id)) return;
  try {
    localStorage.setItem(PLAYED_KEY, JSON.stringify([...list, id]));
  } catch {
    // ignore
  }
}

/** Mastery tier for a game, from its `scoreTiers` knob in games.json. */
export function tierOf(id: string, pb: number = readPB(id)): Tier {
  const tiers = games.find(g => g.id === id)?.scoreTiers;
  if (!tiers || pb <= 0) return 0;
  return tiers.filter(t => pb >= t).length as Tier;
}

/** Score needed for the next tier, or null when already gold / unranked game. */
export function nextTierAt(id: string, pb: number = readPB(id)): number | null {
  const tiers = games.find(g => g.id === id)?.scoreTiers;
  if (!tiers) return null;
  return tiers.find(t => pb < t) ?? null;
}

export interface DeckStats {
  level: number;
  xp: number;
  xpIntoLevel: number;
  played: number;
  total: number;
  mastered: number;
  bestStreak: number;
}

export function deckStats(): DeckStats {
  const played = readPlayed();
  const bestStreak = readStreak().best;
  let tierXp = 0;
  let mastered = 0;
  for (const g of games) {
    const tier = tierOf(g.id);
    tierXp += tier * XP_PER_TIER;
    if (tier === 3) mastered++;
  }
  const xp =
    played.length * XP_PER_GAME_PLAYED + tierXp + bestStreak * XP_PER_STREAK_DAY;
  return {
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    xp,
    xpIntoLevel: xp % XP_PER_LEVEL,
    played: played.length,
    total: games.length,
    mastered,
    bestStreak,
  };
}

export function formatScore(n: number): string {
  return n.toLocaleString();
}
