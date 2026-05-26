/**
 * Forum Seed Script
 *
 * One-shot script to populate the empty `forum_threads` Firestore collection
 * with 8 substantive tutorial/Q&A threads backdated across the past 30 days.
 *
 * Setup:
 *   1. Download a Firebase Admin service account key from
 *      Firebase Console -> Project Settings -> Service Accounts -> Generate new private key
 *   2. Save it as `serviceAccountKey.json` at the repo root (gitignored — see below)
 *   3. npm install --save-dev firebase-admin
 *   4. node scripts/seed-forum.js
 *
 * Note: `.gitignore` already covers `service-account*.json` and `*-firebase-adminsdk-*.json`.
 * `serviceAccountKey.json` is NOT covered by those globs — either rename the download to
 * `service-account.json`, or add `serviceAccountKey.json` to `.gitignore` before running.
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// ── Locate service account key ────────────────────────────────────────────────
const KEY_CANDIDATES = ['serviceAccountKey.json', 'service-account.json'];
let keyPath = null;
for (const name of KEY_CANDIDATES) {
  const p = path.resolve(__dirname, '..', name);
  if (fs.existsSync(p)) { keyPath = p; break; }
}
if (!keyPath) {
  console.error('❌ No service account key found. Place one of these at the repo root:');
  KEY_CANDIDATES.forEach(n => console.error(`   - ${n}`));
  process.exit(1);
}

const serviceAccount = require(keyPath);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// ── Date helpers ──────────────────────────────────────────────────────────────
// Anchor today at 2026-05-25 12:00 UTC for deterministic backdating.
// (Using new Date() works too — the offset is what matters.)
const NOW = new Date();
function daysAgo(n, hourOffset = 14) {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(hourOffset, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 0);
  return d;
}

// ── Thread content ────────────────────────────────────────────────────────────
const THREADS = [
  {
    daysAgo: 28,
    category: 'general',
    nickname: 'DeckMaster',
    title: 'Welcome to the ArcadeDeck Player Forum — read this first',
    body:
`Hey everyone, welcome to the forum! A quick orientation so your first post lands well:

• Four categories — General (announcements, meta), Game Talk (strategy, scores, bugs), Suggestions (feature requests), Off-Topic (anything else).
• Your nickname is the same one used on the leaderboards — it's stored locally in your browser and shared across the site. If you want to change it, head to "My Games" and update it there.
• Threads are ordered by latest activity, so a good reply on an old thread bumps it back to the top. Don't be afraid to revive an older discussion if you have something to add.
• Keep titles descriptive — "Tank Battle controls on mobile" beats "help". It makes the forum searchable for the next player who hits the same question.

Looking forward to seeing what builds, runs, and ideas you share. Let's keep it useful and friendly.`,
  },
  {
    daysAgo: 25,
    category: 'games',
    nickname: 'TileQueen',
    title: 'Gem Merge: optimal merge order for 100k+ runs',
    body:
`After a few hundred runs I think I've finally cracked a consistent 100k+ Gem Merge strategy. Sharing in case it helps someone push for a top-3 spot.

Core idea: merges in the bottom-right corner first, always. The board fills from the top, so reserving the bottom-right for your highest-tier gem means you never accidentally block your own merge chain.

Priority order:
1. Match same-tier pairs immediately, even if a 3-chain is "close". Time pressure punishes hesitation more than it rewards perfect chains.
2. Keep two rows clear at the top at all times. If you're down to one clear row, stop merging mid-tier and clear surface gems first.
3. Save your highest-tier gem for a "panic clear" — it triggers a board-wide reaction that buys you 8–10 seconds of breathing room.

One thing worth noting for leaderboard chasers: the leaderboard sorts by score descending, but ties break on move count ascending (lower = better). So if you're trying to dethrone someone at the same score, fewer moves wins. I've started ignoring small merges entirely in late-game to keep the count down.

Curious what others are doing — anyone running a completely different opening?`,
  },
  {
    daysAgo: 22,
    category: 'suggestions',
    nickname: 'ScoreHunter',
    title: 'Feature request: per-game friend leaderboards',
    body:
`The global Hall of Fame is great but it's a bit demoralizing competing against the top 0.1% of players on every single game. What I'd love to see: a "friends" leaderboard scoped per game.

Concrete proposal:
• Add a "friends" tab on each game's leaderboard panel.
• Friends list is stored locally (just nicknames) — no accounts needed, keeps the privacy-light approach the site already has.
• Adding a friend = paste their exact nickname; it shows up in your filtered view going forward.
• Optional: a small "+" button next to nicknames in the global leaderboard to add directly.

Why this matters: the current scoring is winner-take-all at the top, and there's no middle ground for casual players to feel competitive. A friends view turns every game into a mini-tournament with your own group. It's also retention gold — people come back to check if their friend beat their score.

Would this be hard to add given the current Firestore schema? Happy to hear from anyone who knows the codebase whether this is a weekend project or a redesign.`,
  },
  {
    daysAgo: 18,
    category: 'games',
    nickname: 'NeonRunner',
    title: 'Tank Battle controls on touch devices — am I missing something?',
    body:
`Playing Tank Battle on my phone and I can't figure out the control scheme. On desktop it's arrow keys to move, space to fire — clear. On mobile I see a virtual joystick on the left but no fire button anywhere I can find. Tapping doesn't seem to do anything reliably.

A few things I've tried:
• Tap-and-hold on the right side of the screen — sometimes fires, sometimes doesn't.
• Two-finger tap — nothing.
• Tilting the device — definitely nothing.

Is the fire button hidden behind some onboarding screen I skipped? Or is touch fire actually broken on certain devices? I'm on a recent Android phone in Chrome, latest version.

If anyone's gotten Tank Battle working smoothly on mobile, would love to hear how. And if it's a known bug, happy to file a proper report somewhere — just point me at the right place.`,
  },
  {
    daysAgo: 14,
    category: 'games',
    nickname: 'GhostBlade',
    title: 'Mythic Defenders wave 30+ build that actually works',
    body:
`Most "tier list" guides for Mythic Defenders fall apart around wave 25 because they assume you can afford max-tier towers everywhere. You can't. Here's a build I've taken to wave 38 consistently on hard.

Map setup (works on the standard maze map):
• Corner positions 1 & 4: Frost towers, upgraded to tier 2 only. Their job is slowing, not damage. Tier 3 is a trap — the damage upgrade is wasted on slow-tier units.
• Mid-lane positions 2 & 3: Lightning towers, max tier. These are your DPS backbone. Splash damage cleans up the slowed waves.
• Back position 5: Single max-tier Cannon. Save this for the boss waves (every 5th wave). The slow projectile is a liability against fast units but devastating against bosses.

Resource pacing:
• Don't upgrade past tier 2 on anything until you've placed all 5 towers. The early-wave income loss from skipping placements is bigger than the per-tower damage gain.
• Save 200g going into every 5th wave — you'll want to drop an emergency Frost mid-wave if the boss starts breaking through.

Wave 30+ specifically: the armored units start ignoring slow effects. This is when the Cannon earns its keep — switch your manual targeting to the heavy units and let the Lightnings clean up the rest.

What's working for other people past wave 30? Curious if there's a Poison build that scales better — I've never made it work.`,
  },
  {
    daysAgo: 10,
    category: 'general',
    nickname: 'RetroFan88',
    title: 'How does the monthly Hall of Fame ranking work?',
    body:
`I've been climbing leaderboards on a few games but I'm not 100% sure how the monthly Hall of Fame is calculated. Read through what I could find — sharing my understanding in case I have it wrong, and so newer players have a reference.

What I think happens:
• Every game's leaderboard is independent and tracks the all-time top scores.
• On the last day of each month, the system looks at the top 3 players for every game.
• Points are awarded per game: 1st place = 3 points, 2nd = 2 points, 3rd = 1 point.
• Those points are summed across all games per player nickname.
• The top 3 total-points players become that month's Hall of Fame entry.

So if you're trying to climb the Hall of Fame, the optimal play isn't necessarily to grind one game to the top — it's to land in the top 3 on as many games as possible. A 3rd-place finish on 10 games (10 pts) beats two 1st-place finishes on different games (6 pts).

Also important: the rankings snapshot happens at end of month. Scores set after the snapshot count for the following month, not the current one.

Anyone from the team able to confirm I've got this right? Or correct me where I'm off.`,
  },
  {
    daysAgo: 6,
    category: 'suggestions',
    nickname: 'PixelPilot',
    title: 'Dark mode toggle for the player profile page?',
    body:
`Small thing but it bugs me — most of the site is dark themed but a few pages (looking at the profile / My Games view especially) feel lighter than the rest. Could we get a proper dark mode toggle that applies consistently across every page, or at least bring the lighter pages in line with the main dark theme?

Two suggestions, in order of preference:
1. Site-wide dark mode toggle in the navbar, persisted to localStorage. Defaults to dark (since most of the site already is).
2. If a toggle is too much work, just darken the inconsistent pages to match.

Bonus points: respect the user's `prefers-color-scheme` system setting as the initial default, then let the toggle override.

Not urgent — just a polish item. Site looks great overall.`,
  },
  {
    daysAgo: 2,
    category: 'off-topic',
    nickname: 'ComboKing',
    title: "What's your favorite retro arcade cabinet?",
    body:
`Slightly off-topic from the games here but curious what the community grew up on. For me it was Metal Slug 3 on the Neo Geo cabinet at my local pizza place — the way the spritework still holds up 25 years later is genuinely incredible.

Honorable mentions:
• Time Crisis 2 — the foot pedal cover mechanic was years ahead of its time.
• Tekken 3 — first fighting game I ever finished without continuing. Still remember the cabinet smelling faintly of cigarettes.
• Marvel vs Capcom 2 — the soundtrack alone deserves a Hall of Fame entry.

What's the cabinet that made you fall in love with arcade games? Bonus points if you can still find it standing somewhere.`,
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log(`Seeding ${THREADS.length} threads into forum_threads...`);
  for (const t of THREADS) {
    const date = daysAgo(t.daysAgo);
    const ts = admin.firestore.Timestamp.fromDate(date);
    const ref = await db.collection('forum_threads').add({
      title: t.title,
      body: t.body,
      category: t.category,
      nickname: t.nickname,
      replyCount: 0,
      createdAt: ts,
      lastActivity: ts,
    });
    console.log(`  ✓ [${t.category}] ${t.title} — ${date.toISOString().slice(0, 10)} (${ref.id})`);
  }
  console.log(`Done. ${THREADS.length} threads created.`);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
