// Global leaderboard: one Firestore doc per browser, ranked by Deck XP (the
// only number comparable across games). Row is upserted whenever XP or the
// nickname changes; rank = players with more XP + 1 (aggregation query, so
// ~1 read regardless of table size).
//
// ponytail: no auth — the doc id is an unguessable UUID but rules cannot tie
// it to a caller, so any row is overwritable by anyone who reads the table.
// Add Firebase anonymous auth + `request.auth.uid == playerId` rules if
// vandalism shows up.
import {
  collection, doc, getCount, getDocs, limit, orderBy, query,
  serverTimestamp, setDoc, where,
} from 'firebase/firestore/lite';
import { db } from '../firebase';
import { readNickname } from '../hooks/useNickname';
import { RANK_KEY, deckStats, readCachedRank } from './pb';
import { safeRead, safeWrite } from './firestoreCircuit';

const ID_KEY = 'lb_player_id';
const SYNC_KEY = 'lb_synced';
export const TOP_N = 10;

export interface LbRow {
  id: string;
  nickname: string;
  xp: number;
  level: number;
  mastered: number;
}

const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const set = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } };

export function playerId(): string {
  let id = get(ID_KEY);
  if (!id) {
    id = typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    set(ID_KEY, id);
  }
  return id;
}

/** Upserts this player's row when XP or nickname changed since the last push. */
export async function syncLeaderboard(): Promise<void> {
  const { xp, level, played, mastered } = deckStats();
  if (xp <= 0) return; // never played — no row
  const nickname = readNickname();
  const key = `${xp}|${nickname}`;
  if (get(SYNC_KEY) === key) return;
  const w = await safeWrite(() => setDoc(doc(db, 'leaderboard', playerId()), {
    nickname, xp, level, played, mastered, updatedAt: serverTimestamp(),
  }));
  if (w.ok) set(SYNC_KEY, key);
}

/** Global rank (1-based, ties share) or null when unranked / offline. */
export async function fetchMyRank(): Promise<number | null> {
  if (!get(SYNC_KEY)) return null;
  const { xp } = deckStats();
  const snap = await safeRead(
    () => getCount(query(collection(db, 'leaderboard'), where('xp', '>', xp))),
    null,
  );
  if (!snap) return readCachedRank();
  const rank = snap.data().count + 1;
  set(RANK_KEY, String(rank));
  return rank;
}

export async function fetchTop(): Promise<LbRow[]> {
  const snap = await safeRead(
    () => getDocs(query(collection(db, 'leaderboard'), orderBy('xp', 'desc'), limit(TOP_N))),
    null,
  );
  if (!snap) return [];
  return snap.docs.map(d => {
    const v = d.data();
    return {
      id: d.id,
      nickname: String(v.nickname ?? ''),
      xp: Number(v.xp) || 0,
      level: Number(v.level) || 1,
      mastered: Number(v.mastered) || 0,
    };
  });
}
