import { readFileSync, existsSync } from 'fs';

const games = JSON.parse(readFileSync('src/data/games.json', 'utf-8'));

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
const requiredFields = ['id', 'slug', 'title', 'description', 'fullDescription', 'thumbnail', 'genres', 'gameUrl', 'status'];
const koFields = ['titleKo', 'descriptionKo', 'fullDescriptionKo', 'controlsKo', 'tipsKo', 'featuresKo'];
const validStatuses = ['PLAYABLE', 'IN PRODUCTION'];
const validAspectRatios = ['16/9', '9/16', '4/3', '3/4', '1/1'];

for (const g of games) {
  const label = g.slug || g.id || '(unknown)';

  // Required fields
  for (const field of requiredFields) {
    if (g[field] === undefined || g[field] === null || g[field] === '') {
      error(label, `Missing required field: "${field}"`);
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

  // Korean translation check
  for (const field of koFields) {
    const enField = field.replace('Ko', '');
    if (g[enField] && !g[field]) {
      warn(label, `Missing Korean translation: "${field}"`);
    }
  }

  // features vs featuresKo length mismatch
  if (g.features && g.featuresKo && g.features.length !== g.featuresKo.length) {
    warn(label, `features (${g.features.length}) and featuresKo (${g.featuresKo.length}) have different lengths`);
  }

  // Leaderboard config validation
  if (g.leaderboard) {
    const lb = g.leaderboard;
    const lbRequired = ['title', 'primaryLabel', 'dualSort'];
    for (const field of lbRequired) {
      if (lb[field] === undefined || lb[field] === null) {
        error(label, `Leaderboard missing field: "${field}"`);
      }
    }
    if (lb.dualSort && !lb.secondaryLabel) {
      warn(label, `dualSort is true but secondaryLabel is empty`);
    }
  }

  // gameUrl basic check
  if (g.gameUrl && !g.gameUrl.startsWith('http')) {
    error(label, `gameUrl must start with http: "${g.gameUrl}"`);
  }

  // Language field check
  if (g.language && !['KO', 'EN', 'KO/EN', 'EN/KO'].includes(g.language)) {
    warn(label, `Unusual language value: "${g.language}" (common: KO, EN, KO/EN)`);
  }
}

// ── 4. Summary ──
console.log('');
console.log(`  Validated ${games.length} games.`);
if (errors > 0) console.error(`  ${errors} error(s) found.`);
if (warnings > 0) console.warn(`  ${warnings} warning(s) found.`);
if (errors === 0 && warnings === 0) console.log('  All checks passed!');
console.log('');

process.exit(errors > 0 ? 1 : 0);
