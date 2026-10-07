// Storage layer for click-target game. All keys prefixed `ct_`.

const KEYS = {
  high:  'ct_high',
  level: 'ct_level',
  sound: 'ct_sound',
  top5:  'ct_top5',
  ach:   'ct_ach',
  stats: 'ct_stats',
};

const LEGACY_HIGH = 'click-target-high';

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn('storage setItem failed', key, e);
  }
}

function safeGetJSON(key, fallback) {
  const raw = localStorage.getItem(key);
  if (raw == null) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : parsed;
  } catch (e) {
    console.warn('storage parse failed', key, e);
    return fallback;
  }
}

export function migrate() {
  try {
    const legacy = localStorage.getItem(LEGACY_HIGH);
    if (legacy != null && localStorage.getItem(KEYS.high) == null) {
      localStorage.setItem(KEYS.high, legacy);
      localStorage.removeItem(LEGACY_HIGH);
    }
  } catch (e) { console.warn('storage migrate failed', e); }
}

export function getHighscore() {
  return Math.max(0, parseInt(localStorage.getItem(KEYS.high), 10) || 0);
}
export function setHighscore(v) { safeSet(KEYS.high, String(v)); }

export function getLevel() {
  return Math.max(1, parseInt(localStorage.getItem(KEYS.level), 10) || 1);
}
export function setLevel(v) { safeSet(KEYS.level, String(v)); }

export function getSoundPref() { return localStorage.getItem(KEYS.sound) !== '0'; }
export function setSoundPref(on) { safeSet(KEYS.sound, on ? '1' : '0'); }

export function loadTop5() {
  const arr = safeGetJSON(KEYS.top5, []);
  return Array.isArray(arr) ? arr : [];
}
function saveTop5(rs) { safeSet(KEYS.top5, JSON.stringify(rs)); }
export function addRecord(score, level) {
  const rs = loadTop5();
  // Local calendar date as YYYY-MM-DD (toISOString alone is UTC → KST rounds before 09:00 got yesterday).
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  rs.push({ score, level, date: d.toISOString().slice(0, 10) });
  rs.sort((a, b) => b.score - a.score || b.level - a.level);
  if (rs.length > 5) rs.length = 5;
  saveTop5(rs);
  return rs;
}

export function loadStats() {
  const obj = safeGetJSON(KEYS.stats, {});
  return obj && typeof obj === 'object' ? obj : {};
}
function saveStats(st) { safeSet(KEYS.stats, JSON.stringify(st)); }
export function updateStats(finalScore, ms, passed, finalLevel) {
  const st = loadStats();
  st.games     = (st.games || 0) + 1;
  st.totalHits = (st.totalHits || 0) + finalScore;
  st.totalMiss = (st.totalMiss || 0) + ms;
  st.streak    = passed ? (st.streak || 0) + 1 : 0;
  st.maxStreak = Math.max(st.maxStreak || 0, st.streak);
  st.maxScore  = Math.max(st.maxScore || 0, finalScore);
  st.maxLevel  = Math.max(st.maxLevel || 0, finalLevel);
  st.perfectRounds = (st.perfectRounds || 0) + (passed && ms === 0 && finalScore >= 1 ? 1 : 0);
  saveStats(st);
  return st;
}

export function loadAchievements() {
  const obj = safeGetJSON(KEYS.ach, {});
  return obj && typeof obj === 'object' ? obj : {};
}
export function saveAchievements(ach) { safeSet(KEYS.ach, JSON.stringify(ach)); }
