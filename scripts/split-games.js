/**
 * Generate src/data/games-light.json from games.json by stripping fields only
 * used on the GamePlayer detail page. Home/grid/leaderboard code imports the
 * light file, so heavy text (full descriptions, lore, tips, controls, Korean
 * translations) drops out of the main bundle and only loads on /play/{slug}.
 *
 * Run before tsc + vite build (and on `npm run dev` via predev) so the light
 * file never goes stale relative to games.json.
 */

import { readFileSync, writeFileSync } from 'fs';

const HEAVY_FIELDS = new Set([
  'descriptionKo',
  'fullDescription',
  'fullDescriptionKo',
  'controls',
  'controlsKo',
  'tips',
  'tipsKo',
  'lore',
  'loreKo',
  'featuresKo',
]);

const games = JSON.parse(readFileSync('src/data/games.json', 'utf-8'));

const light = games.map((game) => {
  const out = {};
  for (const [k, v] of Object.entries(game)) {
    if (!HEAVY_FIELDS.has(k)) out[k] = v;
  }
  return out;
});

writeFileSync('src/data/games-light.json', JSON.stringify(light, null, 2) + '\n');

const fullSize = readFileSync('src/data/games.json').length;
const lightSize = readFileSync('src/data/games-light.json').length;
console.log(
  `games-light.json: ${lightSize} bytes (vs full ${fullSize} bytes, ` +
  `${Math.round((1 - lightSize / fullSize) * 100)}% smaller).`
);
