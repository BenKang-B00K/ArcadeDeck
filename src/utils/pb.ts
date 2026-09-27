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

/** 31 tiers: Bronze 1–10, Silver 1–10, Gold 1–10, then Diamond. 0 = unranked. */
export const TIERS = 31;
const DIVISIONS = 10;
/** First tier of the Gold band — reaching it counts as "mastered". */
export const MASTERED_TIER = 21;

// Badge class (shared with the streak badges in MyGames.css) + the ui key the
// band's label lives under.
const BANDS = [
  { cls: 'tier-bronze', key: 'tierBronze', en: 'Bronze' },
  { cls: 'tier-silver', key: 'tierSilver', en: 'Silver' },
  { cls: 'tier-gold', key: 'tierGold', en: 'Gold' },
  { cls: 'tier-diamond', key: 'tierDiamond', en: 'Diamond' },
] as const;

// Tier each `scoreTiers` anchor sits on: Bronze 1, Silver 1, Gold 1, Gold 10,
// Diamond. Thresholds in between are linear.
const ANCHOR_TIER = [1, 11, 21, 30, 31];

/** `div` is the 1–10 division inside a band; Diamond has none. */
export interface TierMeta { cls: string; key: string; en: string; div?: number }

/** Band class + label parts for a tier; null when unranked or out of range. */
export function tierMeta(tier: number): TierMeta | null {
  if (tier < 1 || tier > TIERS) return null;
  if (tier === TIERS) return { ...BANDS[3] };
  return { ...BANDS[Math.floor((tier - 1) / DIVISIONS)], div: ((tier - 1) % DIVISIONS) + 1 };
}

/** "Gold 7" / "Diamond" — band name via the ui lookup, division appended. */
export const tierLabel = (m: TierMeta, t: (key: string, en: string) => string) =>
  m.div ? `${t(m.key, m.en)} ${m.div}` : t(m.key, m.en);

/** The 31 score thresholds for a game, expanded from its 5 anchors. */
export function tierThresholds(id: string): number[] | null {
  const a = games.find(g => g.id === id)?.scoreTiers;
  if (!a) return null;
  return Array.from({ length: TIERS }, (_, i) => {
    const t = i + 1;
    const s = Math.min(ANCHOR_TIER.length - 2, ANCHOR_TIER.filter(at => at <= t).length - 1);
    const [t0, t1] = [ANCHOR_TIER[s], ANCHOR_TIER[s + 1]];
    return Math.ceil(a[s] + (a[s + 1] - a[s]) * (t - t0) / (t1 - t0));
  });
}

export const XP_PER_GAME_PLAYED = 10;
export const XP_PER_TIER = 5;
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

/** Mastery tier (0–30) for a game, from its `scoreTiers` knob in games.json. */
export function tierOf(id: string, pb: number = readPB(id)): number {
  const tiers = tierThresholds(id);
  if (!tiers || pb <= 0) return 0;
  return tiers.filter(t => pb >= t).length;
}

/** Score needed for the next tier, or null when already Diamond / unranked game. */
export function nextTierAt(id: string, pb: number = readPB(id)): number | null {
  return tierThresholds(id)?.find(t => pb < t) ?? null;
}

/** Progress inside the current tier band, 0–100. Diamond → 100; no tiers → 0. */
export function tierProgress(id: string, pb: number = readPB(id)): number {
  const tiers = tierThresholds(id);
  if (!tiers) return 0;
  const tier = tierOf(id, pb);
  const next = tiers[tier];
  if (next === undefined) return 100;
  const floor = tier > 0 ? tiers[tier - 1] : 0;
  return Math.min(100, Math.max(0, ((pb - floor) / (next - floor)) * 100));
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
    if (tier >= MASTERED_TIER) mastered++;
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

// Last global rank fetched by utils/leaderboard.ts — read here so Home can
// paint it without loading Firestore.
export const RANK_KEY = 'lb_rank';

export function readCachedRank(): number | null {
  try {
    const n = Number(localStorage.getItem(RANK_KEY));
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function formatScore(n: number): string {
  return n.toLocaleString();
}
