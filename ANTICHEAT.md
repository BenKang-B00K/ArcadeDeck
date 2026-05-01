# Anti-Cheat Score Submission — Migration Guide

Server-side score validation via Cloud Functions + HMAC tokens. Until you deploy the functions and flip the rules, the existing direct-Firestore-write path stays in production. Nothing here is live yet — the new code is dormant.

## What changed in the repo

| File | Status |
|---|---|
| `functions/index.js` | New. `mintScoreToken` + `submitScore` callable functions. |
| `functions/package.json` | New. Pinned `firebase-admin` + `firebase-functions`. |
| `firebase.json` | Added `functions` section. Functions deploy when explicitly requested. |
| `firestore.rules.anticheat.example` | New. Drop-in replacement for `firestore.rules` once the client is migrated. |

## What protections this adds

- **Per-session HMAC token** minted server-side at game start. Token contains `{gameId, sessionId, issuedAt}` and is signed with `ARCADEDECK_HMAC_SECRET` (server-only).
- **Minimum play time**: submissions rejected if elapsed < 3 seconds (`DEFAULT_MIN_PLAY_MS` in `functions/index.js`). Bump per-game by extending the function to read `games.json` `leaderboard.minPlayMs`.
- **Token expiry**: 30 minutes. Replays after that hard-fail.
- **gameId binding**: token issued for game A cannot submit a score against game B.
- **Server-enforced score bounds**: `[0, 10_000_000]` regardless of client claims.
- **Rules flip blocks direct writes**: with the new rules, only the function (admin SDK, which bypasses rules) can mutate `leaderboards`.

What this does NOT defend against:
- A determined attacker who scripts the full game loop and waits ≥3s between mint and submit. Mitigation: per-game `minPlayMs`, plus per-IP rate limit (Firestore counters or App Check).
- A compromised game iframe. Iframes are owned by the developer (you), so risk is internal.

## Deployment steps

### 1. Verify Blaze (pay-as-you-go) plan

Cloud Functions require Blaze. Free tier covers typical ArcadeDeck volume (functions free tier: 2M invocations/month).

### 2. Set the HMAC secret

```bash
cd functions && npm install && cd ..
firebase functions:secrets:set ARCADEDECK_HMAC_SECRET --project ultragames-website
# Paste a 32+ char random string. Generate one with:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Deploy functions

```bash
firebase deploy --only functions --project ultragames-website
```

Test from the Firebase console (`Functions` → `mintScoreToken` → `Test the function` with `{"gameId":"21"}`). Should return `{token: "..."}`.

### 4. Update the client (`src/pages/GamePlayer.tsx`)

Replace the direct Firestore write in `handleGameComplete` with the callable function. Mint a token at game start (or on first iframe mount) and store it in component state:

```ts
import { getFunctions, httpsCallable } from 'firebase/functions';

// At iframe mount:
const fn = getFunctions();
const mint = httpsCallable(fn, 'mintScoreToken');
const { data } = await mint({ gameId: id });
setSessionToken((data as { token: string }).token);

// In handleGameComplete, replace addDoc/updateDoc with:
const submit = httpsCallable(fn, 'submitScore');
await submit({ gameId: id, name: nickname, score, subScore: currentSubScore, token: sessionToken });
// Then re-fetch leaderboard as today.
```

The leaderboard query path stays unchanged — clients still read `leaderboards` directly.

### 5. Flip Firestore rules

```bash
cp firestore.rules.anticheat.example firestore.rules
firebase deploy --only firestore:rules --project ultragames-website
```

Direct client writes to `leaderboards` will start failing immediately. The function path keeps working because admin SDK bypasses rules.

### 6. Verify

- Open a game, play, submit a score. Should succeed.
- Open devtools, run `firebase.firestore().collection('leaderboards').add({...})`. Should fail with `permission-denied`.
- Try replaying an old token (mint at T=0, sleep 31 minutes, submit). Should fail with `deadline-exceeded`.

## Rollback

If something breaks post-flip, restore the old rules:

```bash
git checkout HEAD~1 -- firestore.rules
firebase deploy --only firestore:rules --project ultragames-website
```

The functions can stay deployed (they're idle if nothing calls them).

## Future hardening

1. Per-game `minPlayMs` from `games.json` (1s for click-challenge, 60s for survival, etc.).
2. Per-IP rate limit via Firestore counters (`rateLimits/{ip}` doc, increment + check).
3. Firebase App Check (reCAPTCHA v3 / DeviceCheck) — blocks non-browser traffic at the Function level.
4. Iframe-side proof: include a short-lived nonce in the postMessage score event so the parent can sign on behalf of the iframe. Requires updating each game's submit code.
