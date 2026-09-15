import { readFileSync, existsSync, readdirSync } from 'fs';

const games = JSON.parse(readFileSync('src/data/games.json', 'utf-8'));
const enLocale = JSON.parse(readFileSync('src/i18n/locales/en.json', 'utf-8'));
const enGames = enLocale.games || {};

let errors = 0;
let warnings = 0;

function error(gameLabel, msg) {
  console.error(`  ERROR  [${gameLabel}] ${msg}`);
  errors++;
}

function warn(gameLabel, msg) {
  console.warn(`  WARN   [${gameLabel}] ${msg}`);
  warnings++;
}

// ── 1. Collect all known genres from existing games ──
const knownGenres = new Set();
for (const g of games) {
  if (g.genres) g.genres.forEach(genre => knownGenres.add(genre));
}

// ── 2. Check for duplicate IDs and slugs ──
const ids = new Set();
const slugs = new Set();

for (const g of games) {
  const label = g.slug || g.id || '(unknown)';

  if (ids.has(g.id)) error(label, `Duplicate id: "${g.id}"`);
  else ids.add(g.id);

  if (slugs.has(g.slug)) error(label, `Duplicate slug: "${g.slug}"`);
  else slugs.add(g.slug);
}

// ── 3. Validate each game ──
// Structural fields live in games.json. Translatable text lives in en.json.
const requiredStructural = ['id', 'slug', 'thumbnail', 'genres', 'gameUrl', 'status'];
const requiredEnText = ['title', 'description', 'fullDescription'];
const validStatuses = ['PLAYABLE', 'IN PRODUCTION'];
const validAspectRatios = ['16/9', '9/16', '4/3', '3/4', '1/1'];
const validPlatforms = ['PC', 'MOBILE', 'BOTH'];

for (const g of games) {
  const label = g.slug || g.id || '(unknown)';

  // Required structural fields on games.json
  for (const field of requiredStructural) {
    if (g[field] === undefined || g[field] === null || g[field] === '') {
      error(label, `Missing required structural field: "${field}"`);
    }
  }

  // Slug format
  if (g.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(g.slug)) {
    error(label, `Invalid slug format: "${g.slug}" (use lowercase, hyphens only)`);
  }

  // Status
  if (g.status && !validStatuses.includes(g.status)) {
    error(label, `Invalid status: "${g.status}" (must be ${validStatuses.join(' or ')})`);
  }

  // Platform (input support, drives the PC Only / Mobile Only card badge)
  if (!g.platform) {
    warn(label, `Missing platform (one of ${validPlatforms.join(', ')})`);
  } else if (!validPlatforms.includes(g.platform)) {
    error(label, `Invalid platform: "${g.platform}" (must be ${validPlatforms.join(', ')})`);
  }

  // Aspect ratio
  if (g.aspectRatio && !validAspectRatios.includes(g.aspectRatio)) {
    warn(label, `Unusual aspectRatio: "${g.aspectRatio}" (common: ${validAspectRatios.join(', ')})`);
  }

  // Thumbnail file exists
  if (g.thumbnail && !g.thumbnail.startsWith('http')) {
    const thumbPath = `public/${g.thumbnail}`;
    if (!existsSync(thumbPath)) {
      error(label, `Thumbnail not found: "${thumbPath}"`);
    }
  }

  // Genres not empty
  if (g.genres && g.genres.length === 0) {
    error(label, `genres array is empty`);
  }

  // Genre typo detection
  if (g.genres) {
    for (const genre of g.genres) {
      if (!knownGenres.has(genre)) {
        warn(label, `New genre: "${genre}" (not used by other games — typo?)`);
      }
    }
  }

  // English text coverage in en.json
  const enEntry = enGames[g.id];
  if (!enEntry) {
    error(label, `Missing en.json entry for id "${g.id}"`);
  } else {
    for (const field of requiredEnText) {
      if (!enEntry[field] || (typeof enEntry[field] === 'string' && enEntry[field].trim() === '')) {
        error(label, `Missing required en.json field: "${field}"`);
      }
    }
  }

  // en.json features copy must agree with the structural platform field
  const enFeatures = enGames[g.id]?.features ?? [];
  const claimsPcOnly = enFeatures.some(f => f.startsWith('PC Only'));
  if (claimsPcOnly && g.platform !== 'PC') {
    error(label, `en.json features say "PC Only" but platform is "${g.platform}"`);
  }
  if (!claimsPcOnly && g.platform === 'PC') {
    warn(label, `platform is "PC" but en.json features do not say so`);
  }

  // Personal-best tiers: ascending, positive, bronze/silver/gold. The values
  // themselves are a tuning knob — only the shape is checked here.
  if (g.scoreTiers !== undefined) {
    const tiers = g.scoreTiers;
    if (!Array.isArray(tiers) || tiers.length !== 3) {
      error(label, `scoreTiers must be 3 numbers [bronze, silver, gold]`);
    } else if (!tiers.every(t => typeof t === 'number' && Number.isFinite(t) && t > 0)) {
      error(label, `scoreTiers must all be positive numbers: ${JSON.stringify(tiers)}`);
    } else if (!(tiers[0] < tiers[1] && tiers[1] < tiers[2])) {
      error(label, `scoreTiers must ascend: ${JSON.stringify(tiers)}`);
    } else if (!enGames[g.id]?.scoreLabel) {
      warn(label, `scoreTiers set but en.json has no scoreLabel (the score's name)`);
    }
  }

  // gameUrl basic check
  if (g.gameUrl && !g.gameUrl.startsWith('http')) {
    error(label, `gameUrl must start with http: "${g.gameUrl}"`);
  }

  // Language field check
  if (g.language && !['KO', 'EN', 'KO/EN', 'EN/KO', 'EN/KO/JA'].includes(g.language)) {
    warn(label, `Unusual language value: "${g.language}" (common: KO, EN, KO/EN)`);
  }
}

// ── 4. Orphaned en.json entries (text without matching game) ──
const liveIds = new Set(games.map(g => g.id));
for (const id of Object.keys(enGames)) {
  if (id.startsWith('_')) continue; // doc / _comment keys
  if (!liveIds.has(id)) {
    warn(`en.json:${id}`, `en.json games block has no matching games.json entry`);
  }
}

// ── 4b. **keyword** markup (renderRich in GameInfoTabs / rich() in prerender) ──
// A highlight must sit inside one sentence on one line, and never in fields
// that render as plain text (title, description, controls).
const SENT = /(?<=[.!?])\s+|(?<=[。！？])\s*|\n/;
const RICH_FIELDS = ['fullDescription', 'tips', 'lore', 'objectives'];
const NO_RICH = ['title', 'description', 'controls'];
const locales = readdirSync('src/i18n/locales')
  .filter(f => /^[a-z]{2}\.json$/.test(f))
  .map(f => [f.slice(0, 2), JSON.parse(readFileSync(`src/i18n/locales/${f}`, 'utf-8')).games || {}]);
for (const [lang, block] of locales) {
  for (const [id, entry] of Object.entries(block)) {
    if (id.startsWith('_')) continue;
    for (const f of NO_RICH) {
      if (String(entry[f] ?? '').includes('**')) error(`${lang}.json:${id}.${f}`, 'no ** markup allowed here');
    }
    for (const f of RICH_FIELDS) {
      const v = entry[f];
      if (typeof v !== 'string' || !v) continue;
      const label = `${lang}.json:${id}.${f}`;
      for (const piece of v.split(SENT)) {
        if ((piece.match(/\*\*/g) || []).length % 2) error(label, `** unbalanced or spans a sentence/line: "${piece.trim().slice(0, 60)}"`);
      }
      const n = (v.match(/\*\*(.+?)\*\*/g) || []).length;
      if (n > 10) warn(label, `${n} highlights (max 10)`);
      if (n === 0 && String(enGames[id]?.[f] ?? '').includes('**')) warn(label, `en has highlights, ${lang} has none`);
    }
  }
}

// ── 5. Summary ──
console.log('');
console.log(`  Validated ${games.length} games.`);
if (errors > 0) console.error(`  ${errors} error(s) found.`);
if (warnings > 0) console.warn(`  ${warnings} warning(s) found.`);
if (errors === 0 && warnings === 0) console.log('  All checks passed!');
console.log('');

process.exit(errors > 0 ? 1 : 0);
