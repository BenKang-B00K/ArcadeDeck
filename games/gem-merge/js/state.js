// Storage: ArcadeDeck serves every game from one origin → keys carry the slug. Blocked storage
// (privacy mode / sandboxed frame) throws on access → treat as empty, game still runs.
const KEY = 'gem-merge:';
export function load(k) { try { return localStorage.getItem(KEY + k); } catch (e) { return null; } }
export function save(k, v) { try { localStorage.setItem(KEY + k, v); } catch (e) {} }

// saveVersion 2: keys moved from legacy 'gm*' (v1) to the slug prefix. Copies once, old keys left in place.
const SAVE_VERSION = 2;
if (+load('saveVersion') < SAVE_VERSION) {
  for (const k of ['Best', 'Counts', 'Legendary', 'Ach', 'Lang']) {
    let v = null; try { v = localStorage.getItem('gm' + k); } catch (e) {}
    if (v !== null && load(k.toLowerCase()) === null) save(k.toLowerCase(), v);
  }
  save('saveVersion', SAVE_VERSION);
}

// Lifetime gem counts (11 levels). Corrupt/missing → zeros, seeded from legacy 'legendary' key.
let _counts = null;
try { _counts = JSON.parse(load('counts')); } catch (e) {}
if (!Array.isArray(_counts) || _counts.length !== 11) {
  _counts = new Array(11).fill(0);
  _counts[10] = +load('legendary') || 0;
}

export const S = {
  score: 0,
  best: +load('best') || 0,
  gemCounts: _counts,
  gameOver: false,
  lastDrop: -Infinity,
  nextLevel: 1,
  nextAngle: 0,
  mouseX: 200,
  ballMap: new Map(),
  mergeQueue: [],
  mergingIds: new Set(),
  particles: [],
  rings: [],
  flashes: [],
  popups: [],
  trails: [],
  announcements: [],
  combos: [],
  screenShakes: [],
  fxTimers: [],
  currentTier: 0,
  lastMergeTime: -Infinity,
  comboCount: 0,
  goTick: 0,
  guideContainer: null,
};

export function addGemCount(level) {
  S.gemCounts[level - 1]++;
  save('counts', JSON.stringify(S.gemCounts));
}
