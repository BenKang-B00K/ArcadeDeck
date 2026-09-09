// Lv1:40% Lv2:33% Lv3:17% Lv4:10%
export function rndLevel() {
  const r = Math.random();
  if (r < 0.40) return 1;
  if (r < 0.73) return 2;
  if (r < 0.90) return 3;
  return 4;
}

// Load persisted gem counts (11 levels). Fallback to zeros.
const _savedCounts = (() => {
  try { return JSON.parse(localStorage.getItem('gmCounts') || 'null'); } catch (e) { return null; }
})();
const _initialCounts = (_savedCounts && Array.isArray(_savedCounts) && _savedCounts.length === 11) ? _savedCounts : new Array(11).fill(0);

export const S = {
  score: 0,
  best: +(localStorage.getItem('gmBest') || 0),
  legendaryCount: +(localStorage.getItem('gmLegendary') || _initialCounts[10] || 0),
  gemCounts: _initialCounts,
  gameOver: false,
  lastDrop: 0,
  nextLevel: 1,
  mouseX: 200,
  ballMap: new Map(),
  mergeQueue: [],
  mergingIds: new Set(),
  particles: [],
  rings: [],
  flashes: [],
  popups: [],
  announcements: [],
  combos: [],
  screenShakes: [],
  currentTier: 0,
  lastMergeTime: 0,
  comboCount: 0,
  goTick: 0,
  guideContainer: null,
};

export function addGemCount(level) {
  if (!level || level < 1 || level > 11) return;
  S.gemCounts[level - 1] = (S.gemCounts[level - 1] || 0) + 1;
  // Keep legendaryCount in sync
  if (level === 11) {
    S.legendaryCount = S.gemCounts[10];
    localStorage.setItem('gmLegendary', S.legendaryCount);
  }
  localStorage.setItem('gmCounts', JSON.stringify(S.gemCounts));
  // Notify UI listeners
  try { document.dispatchEvent(new CustomEvent('gemCountsChanged', { detail: { level } })); } catch (e) {}
}
