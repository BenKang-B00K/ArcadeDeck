/**
 * One-shot migration:
 *   - Reads src/data/games.json (current shape: structural + EN text + *Ko text).
 *   - Splits text fields out into src/i18n/locales/en.json `games` block.
 *   - Writes new structural-only games.json (no title/description/etc., no *Ko).
 *   - Drops *Ko (user retranslates after en.json is finalized).
 *   - Backs originals up to *.bak.json next to source files.
 *
 * Re-runnable safely: it always rewrites both files from current games.json.
 * Delete this script + the .bak files after the refactor lands and you have
 * confirmed the build is healthy.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GAMES_PATH = path.join(ROOT, 'src/data/games.json');
const EN_PATH = path.join(ROOT, 'src/i18n/locales/en.json');

const TEXT_FIELDS = ['title', 'description', 'fullDescription', 'controls', 'tips', 'lore', 'features'];
const KO_FIELDS = ['titleKo', 'descriptionKo', 'fullDescriptionKo', 'controlsKo', 'tipsKo', 'loreKo', 'featuresKo'];
const ALL_TEXT = new Set([...TEXT_FIELDS, ...KO_FIELDS]);

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n');
}

function backup(p) {
  const bak = p.replace(/\.json$/, '.bak.json');
  if (!fs.existsSync(bak)) {
    fs.copyFileSync(p, bak);
    console.log(`  backup → ${path.relative(ROOT, bak)}`);
  } else {
    console.log(`  backup exists, skipping → ${path.relative(ROOT, bak)}`);
  }
}

console.log('Backing up originals…');
backup(GAMES_PATH);
backup(EN_PATH);

const games = readJson(GAMES_PATH);
const en = readJson(EN_PATH);

console.log(`Read ${games.length} games from games.json.`);

en.games = en.games || {};

let touchedEn = 0;
const newGames = games.map((g) => {
  const enEntry = {};
  for (const f of TEXT_FIELDS) {
    if (g[f] !== undefined) enEntry[f] = g[f];
  }
  en.games[g.id] = enEntry;
  touchedEn++;

  const structural = {};
  for (const [k, v] of Object.entries(g)) {
    if (!ALL_TEXT.has(k)) structural[k] = v;
  }
  return structural;
});

writeJson(GAMES_PATH, newGames);
writeJson(EN_PATH, en);

console.log(`Wrote structural games.json (${newGames.length} entries).`);
console.log(`Wrote en.json with ${touchedEn} game blocks (overwrote any drifted text).`);
console.log('Done. Inspect diffs, then delete *.bak.json files when satisfied.');
