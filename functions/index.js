/**
 * ArcadeDeck — anti-cheat score submission.
 *
 * Flow:
 *   1. Game iframe mounts → client calls `mintScoreToken({gameId})`.
 *      Server returns an HMAC-signed token containing {gameId, sessionId, issuedAt}.
 *   2. Game finishes → client calls `submitScore({gameId, name, score, subScore?, token})`.
 *      Server verifies signature + minimum play time + score bounds, then upserts
 *      leaderboards via the admin SDK (bypasses Firestore rules).
 *
 * Secret setup (one-time):
 *   firebase functions:secrets:set ARCADEDECK_HMAC_SECRET
 *   # paste a 32+ char random string when prompted
 *
 * Deploy:
 *   firebase deploy --only functions --project ultragames-website
 *
 * After deploying, flip Firestore rules to deny client writes on `leaderboards`
 * (see firestore.rules.anticheat.example) and update GamePlayer to call
 * `submitScore` instead of `addDoc` / `updateDoc`. Until that flip, the
 * existing direct-write path keeps working — these functions are dormant.
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const crypto = require('crypto');
const path = require('path');

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ region: 'us-central1', maxInstances: 50 });

// Lazy-load games config (copied in by predeploy hook).
let _gamesConfig = null;
function getGamesConfig() {
  if (_gamesConfig) return _gamesConfig;
  try {
    _gamesConfig = require(path.join(__dirname, 'games-config.json'));
  } catch {
    _gamesConfig = [];
  }
  return _gamesConfig;
}

const SECRET_NAME = 'ARCADEDECK_HMAC_SECRET';
const MAX_TOKEN_AGE_MS = 30 * 60 * 1000; // 30 min — covers long sessions
const DEFAULT_MIN_PLAY_MS = 3000;        // overrideable per-game (future)
const MAX_SCORE = 10_000_000;
const MAX_NAME_LEN = 30;

function sign(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function makeToken(gameId, secret) {
  const issuedAt = Date.now();
  const sessionId = crypto.randomBytes(16).toString('hex');
  const payload = JSON.stringify({ gameId, sessionId, issuedAt });
  const sig = sign(payload, secret);
  return Buffer.from(payload).toString('base64url') + '.' + sig;
}

function verifyToken(token, secret) {
  const parts = String(token || '').split('.');
  if (parts.length !== 2) return null;
  const [b64, sig] = parts;
  let payload;
  try { payload = Buffer.from(b64, 'base64url').toString('utf-8'); } catch { return null; }
  const expected = sign(payload, secret);
  if (sig.length !== expected.length) return null;
  let ok = false;
  try {
    ok = crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return null;
  }
  if (!ok) return null;
  try { return JSON.parse(payload); } catch { return null; }
}

exports.mintScoreToken = onCall({ secrets: [SECRET_NAME], cors: true }, (req) => {
  const gameId = String(req.data?.gameId ?? '');
  if (!gameId) throw new HttpsError('invalid-argument', 'gameId required');
  const secret = process.env[SECRET_NAME];
  if (!secret) throw new HttpsError('failed-precondition', 'HMAC secret missing');
  return { token: makeToken(gameId, secret) };
});

exports.submitScore = onCall({ secrets: [SECRET_NAME], cors: true }, async (req) => {
  const { gameId, name, score, subScore, token } = req.data || {};

  if (typeof gameId !== 'string' || !gameId) {
    throw new HttpsError('invalid-argument', 'gameId required');
  }
  if (typeof name !== 'string' || name.length === 0 || name.length > MAX_NAME_LEN) {
    throw new HttpsError('invalid-argument', 'invalid name');
  }
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > MAX_SCORE) {
    throw new HttpsError('invalid-argument', 'score out of range');
  }
  if (typeof token !== 'string') {
    throw new HttpsError('invalid-argument', 'token required');
  }

  const secret = process.env[SECRET_NAME];
  if (!secret) throw new HttpsError('failed-precondition', 'HMAC secret missing');

  const decoded = verifyToken(token, secret);
  if (!decoded) throw new HttpsError('permission-denied', 'invalid token');
  if (decoded.gameId !== gameId) throw new HttpsError('permission-denied', 'gameId mismatch');

  const elapsed = Date.now() - Number(decoded.issuedAt || 0);
  if (elapsed > MAX_TOKEN_AGE_MS) throw new HttpsError('deadline-exceeded', 'token expired');
  if (elapsed < DEFAULT_MIN_PLAY_MS) {
    throw new HttpsError('failed-precondition', 'submitted too quickly');
  }

  const sub = (typeof subScore === 'number' && Number.isFinite(subScore) && subScore >= 0)
    ? subScore : 0;

  // Upsert by (gameId, name) — same semantics as the direct-write path.
  const existing = await db.collection('leaderboards')
    .where('gameId', '==', gameId)
    .where('name', '==', name)
    .limit(1)
    .get();

  const payload = {
    gameId,
    name,
    score,
    subScore: sub,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (existing.empty) {
    const ref = await db.collection('leaderboards').add(payload);
    return { ok: true, action: 'created', id: ref.id };
  }
  await existing.docs[0].ref.set(payload, { merge: true });
  return { ok: true, action: 'updated', id: existing.docs[0].id };
});

// ─────────────────────────────────────────────────────────────────────────────
// Podium aggregate — denormalized read cache for /aggregates/podium and
// /leaderboardCache/{gameId}. Triggered on any leaderboards/* write.
// Drops Home-page Firestore reads from ~72 to 1.
// ─────────────────────────────────────────────────────────────────────────────

async function rebuildGameCache(gameId) {
  const cfg = getGamesConfig().find((g) => g.id === gameId);
  const dualSort = cfg?.leaderboard?.dualSort ?? false;
  const subSortAsc = cfg?.leaderboard?.subSortAsc ?? false;
  const subDir = subSortAsc ? 'asc' : 'desc';

  let q = db.collection('leaderboards')
    .where('gameId', '==', gameId)
    .orderBy('score', 'desc');
  if (dualSort) q = q.orderBy('subScore', subDir);
  const snap = await q.limit(3).get();

  const top3 = snap.docs.map((d) => {
    const x = d.data();
    return {
      name: String(x.name || ''),
      score: Number(x.score || 0),
      subScore: Number(x.subScore || 0),
    };
  });

  await db.collection('leaderboardCache').doc(gameId).set({
    gameId,
    top3,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return top3;
}

async function rebuildGlobalPodium() {
  const allSnap = await db.collection('leaderboardCache').get();
  const playerPoints = {};
  allSnap.docs.forEach((d) => {
    const top3 = (d.data().top3 || []);
    top3.forEach((p, i) => {
      const points = i === 0 ? 3 : i === 1 ? 2 : 1;
      if (!playerPoints[p.name]) {
        playerPoints[p.name] = {
          name: p.name,
          totalPoints: 0,
          medals: { gold: 0, silver: 0, bronze: 0 },
        };
      }
      playerPoints[p.name].totalPoints += points;
      if (i === 0) playerPoints[p.name].medals.gold += 1;
      else if (i === 1) playerPoints[p.name].medals.silver += 1;
      else if (i === 2) playerPoints[p.name].medals.bronze += 1;
    });
  });
  const podium = Object.values(playerPoints)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 10);

  await db.collection('aggregates').doc('podium').set({
    podium,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

exports.onLeaderboardWrite = onDocumentWritten('leaderboards/{docId}', async (event) => {
  const before = event.data?.before?.exists ? event.data.before.data() : null;
  const after = event.data?.after?.exists ? event.data.after.data() : null;
  const affected = new Set();
  if (before?.gameId) affected.add(String(before.gameId));
  if (after?.gameId) affected.add(String(after.gameId));
  if (affected.size === 0) return;

  // Failsafe: a single failure (quota / permission / transient) must not
  // explode the whole rebuild. Recompute what we can and continue.
  for (const gameId of affected) {
    try {
      await rebuildGameCache(gameId);
    } catch (err) {
      console.error(`[onLeaderboardWrite] rebuildGameCache(${gameId}) failed:`, err?.code || err?.message || err);
    }
  }
  try {
    await rebuildGlobalPodium();
  } catch (err) {
    console.error('[onLeaderboardWrite] rebuildGlobalPodium failed:', err?.code || err?.message || err);
  }
});

// Manual rebuild — call once after deploy to seed both caches.
exports.rebuildAggregates = onCall({ cors: true }, async () => {
  const games = getGamesConfig();
  for (const g of games) {
    if (!g?.leaderboard) continue;
    await rebuildGameCache(g.id);
  }
  await rebuildGlobalPodium();
  return { ok: true, rebuilt: games.filter((g) => g.leaderboard).length };
});
