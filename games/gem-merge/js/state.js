// Lifetime gem counts (11 levels). Corrupt/missing → zeros, seeded from legacy 'gmLegendary' key.
let _counts = null;
try { _counts = JSON.parse(localStorage.getItem('gmCounts')); } catch (e) {}
if (!Array.isArray(_counts) || _counts.length !== 11) {
  _counts = new Array(11).fill(0);
  _counts[10] = +localStorage.getItem('gmLegendary') || 0;
}

export const S = {
  score: 0,
  best: +(localStorage.getItem('gmBest') || 0),
  gemCounts: _counts,
  gameOver: false,
  lastDrop: 0,
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
  lastMergeTime: 0,
  comboCount: 0,
  goTick: 0,
  guideContainer: null,
};

export function addGemCount(level) {
  S.gemCounts[level - 1]++;
  localStorage.setItem('gmCounts', JSON.stringify(S.gemCounts));
}
