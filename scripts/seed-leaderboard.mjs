// Fake players in the Firestore `leaderboard` collection, written through the
// public client SDK (same rules path as the site — no admin key needed).
//
//   node scripts/seed-leaderboard.mjs [count=100]   add N new fake players
//   node scripts/seed-leaderboard.mjs update        advance the existing fakes
//
// Fake doc ids live in scripts/.leaderboard-bots.json — gitignored, because the
// table is public but which rows are fake shouldn't be. Lose it and `update`
// has nothing to advance. Stats follow the real Deck XP rules in
// src/utils/pb.ts (10 XP per game played, 5 per tier, Gold 1 = mastered), so
// fakes sit on the same 5-point grid as real players.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase/app';
import { collection, doc, getDocs, getFirestore, serverTimestamp, writeBatch } from 'firebase/firestore/lite';
import games from '../src/data/games.json' with { type: 'json' };

const app = initializeApp({
  apiKey: 'AIzaSyDFwB-Yt7ARcMZoPD6-1vI892PXyLEvdcU',
  projectId: 'ultragames-website',
});
const db = getFirestore(app);

const BOTS = new URL('./.leaderboard-bots.json', import.meta.url);
const bots = existsSync(BOTS) ? JSON.parse(readFileSync(BOTS, 'utf8')) : [];

const ADJ = ['Neon', 'Shadow', 'Pixel', 'Turbo', 'Iron', 'Lunar', 'Crimson', 'Silent', 'Frost', 'Ember',
  'Vortex', 'Rogue', 'Hyper', 'Astro', 'Blaze', 'Ghost', 'Nova', 'Storm', 'Zen', 'Wild'];
const NOUN = ['Fox', 'Wolf', 'Raven', 'Knight', 'Pilot', 'Ninja', 'Drifter', 'Tiger', 'Viper', 'Mage',
  'Ronin', 'Hawk', 'Panda', 'Comet', 'Golem', 'Racer', 'Sage', 'Titan', 'Otter', 'Lynx'];

const GAMES = games.length;
const SCORED = games.filter(g => g.scoreTiers).length;
const MASTERED_XP = 21 * 5; // Gold 1 on one game
const XP_CAP = GAMES * 10 + SCORED * 31 * 5; // every game played at Diamond
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

// Snap raw stats onto what the real formula can produce.
function fit({ xp, played, mastered }) {
  xp = Math.min(XP_CAP, Math.ceil(xp / 5) * 5);
  played = Math.max(1, Math.min(played, GAMES, Math.floor(xp / 10)));
  mastered = Math.max(0, Math.min(mastered, played, SCORED, Math.floor((xp - played * 10) / MASTERED_XP)));
  return { xp, level: Math.floor(xp / 100) + 1, played, mastered };
}

function check(r, prevXp = 0) {
  const ok = r.xp % 5 === 0 && r.xp >= prevXp && r.level === Math.floor(r.xp / 100) + 1
    && r.played >= 1 && r.played <= GAMES && r.played * 10 + r.mastered * MASTERED_XP <= r.xp;
  if (!ok) throw new Error(`bad row ${JSON.stringify(r)}`);
}

async function write(rows) {
  for (let i = 0; i < rows.length; i += 50) {
    const batch = writeBatch(db);
    for (const { id, ...r } of rows.slice(i, i + 50)) {
      batch.set(doc(db, 'leaderboard', id), { ...r, updatedAt: serverTimestamp() });
    }
    await batch.commit();
    console.log(`wrote ${Math.min(i + 50, rows.length)}/${rows.length}`);
  }
}

const top5 = rows => [...rows].sort((a, b) => b.xp - a.xp).slice(0, 5).map(r => `${r.nickname} ${r.xp}`).join(', ');

if (process.argv[2] === 'update') {
  const ids = new Set(bots);
  const now = Date.now();
  const rows = [];
  const all = [];
  for (const d of (await getDocs(collection(db, 'leaderboard'))).docs) {
    if (!ids.has(d.id)) continue;
    const r = d.data();
    const days = (now - (r.updatedAt?.toMillis() ?? now)) / 864e5;
    // ponytail: flat 60% of fakes play between runs, the rest idle like churned
    // players; per-bot activity rates if the table starts to look too uniform.
    const next = fit(Math.random() < 0.6 ? {
      xp: r.xp + 5 * rnd(1, 2 + Math.round(days * (1 + r.xp / 400))),
      played: r.played + rnd(0, Math.ceil(days / 3)),
      mastered: r.mastered + (Math.random() < 0.3 ? 1 : 0),
    } : r);
    check(next, r.xp);
    const row = { id: d.id, nickname: r.nickname, ...next };
    all.push(row);
    // Untouched idle rows keep their old updatedAt, so their next active run catches up.
    if (['xp', 'level', 'played', 'mastered'].some(k => r[k] !== next[k])) rows.push(row);
  }
  console.log(`${all.length}/${bots.length} fakes found, ${rows.length} changed`);
  await write(rows);
  console.log('top 5:', top5(all));
} else {
  const count = Number(process.argv[2]) || 100;
  const seen = new Set();
  const rows = [];
  while (rows.length < count) {
    let nick = `${ADJ[rnd(0, ADJ.length - 1)]}${NOUN[rnd(0, NOUN.length - 1)]}`;
    if (Math.random() < 0.5) nick += rnd(1, 99);
    if (seen.has(nick)) continue;
    seen.add(nick);
    // Long-tail XP: most players low, a few high.
    const xp = 30 + 2500 * Math.random() ** 2.2;
    const row = fit({ xp, played: Math.round(xp / 60) + rnd(0, 3), mastered: Math.floor(xp / 300) + (Math.random() < 0.3 ? 1 : 0) });
    check(row);
    rows.push({ id: randomUUID(), nickname: nick, ...row });
  }
  // Record ids before writing so a failed batch can't orphan rows we can't find again.
  writeFileSync(BOTS, JSON.stringify([...bots, ...rows.map(r => r.id)]) + '\n');
  await write(rows);
  console.log('top 5:', top5(rows));
}
