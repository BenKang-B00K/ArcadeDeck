// Seed N fake players into the Firestore `leaderboard` collection through the
// public client SDK (same rules path as the site — no admin key needed).
//
//   node scripts/seed-leaderboard.mjs [count=100]
import { initializeApp } from 'firebase/app';
import { doc, getFirestore, serverTimestamp, writeBatch } from 'firebase/firestore/lite';
import { randomUUID } from 'node:crypto';

const app = initializeApp({
  apiKey: 'AIzaSyDFwB-Yt7ARcMZoPD6-1vI892PXyLEvdcU',
  projectId: 'ultragames-website',
});
const db = getFirestore(app);

const ADJ = ['Neon', 'Shadow', 'Pixel', 'Turbo', 'Iron', 'Lunar', 'Crimson', 'Silent', 'Frost', 'Ember',
  'Vortex', 'Rogue', 'Hyper', 'Astro', 'Blaze', 'Ghost', 'Nova', 'Storm', 'Zen', 'Wild'];
const NOUN = ['Fox', 'Wolf', 'Raven', 'Knight', 'Pilot', 'Ninja', 'Drifter', 'Tiger', 'Viper', 'Mage',
  'Ronin', 'Hawk', 'Panda', 'Comet', 'Golem', 'Racer', 'Sage', 'Titan', 'Otter', 'Lynx'];

const GAMES = 28;
const count = Number(process.argv[2]) || 100;
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

const seen = new Set();
const rows = [];
while (rows.length < count) {
  let nick = `${ADJ[rnd(0, ADJ.length - 1)]}${NOUN[rnd(0, NOUN.length - 1)]}`;
  if (Math.random() < 0.5) nick += rnd(1, 99);
  if (seen.has(nick)) continue;
  seen.add(nick);
  // Long-tail XP: most players low, a few high.
  const xp = Math.floor(30 + 2500 * Math.random() ** 2.2);
  const played = Math.min(GAMES, Math.max(1, Math.round(xp / 60) + rnd(0, 3)));
  const mastered = Math.min(played, Math.floor(xp / 300) + (Math.random() < 0.3 ? 1 : 0));
  rows.push({ nickname: nick, xp, level: Math.floor(xp / 100) + 1, played, mastered });
}

for (let i = 0; i < rows.length; i += 50) {
  const batch = writeBatch(db);
  for (const r of rows.slice(i, i + 50)) {
    batch.set(doc(db, 'leaderboard', randomUUID()), { ...r, updatedAt: serverTimestamp() });
  }
  await batch.commit();
  console.log(`wrote ${Math.min(i + 50, rows.length)}/${rows.length}`);
}
console.log('top 5:', rows.sort((a, b) => b.xp - a.xp).slice(0, 5).map(r => `${r.nickname} ${r.xp}`).join(', '));
