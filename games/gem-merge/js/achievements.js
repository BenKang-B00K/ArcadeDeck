import { S } from './state.js';
import { t } from './i18n.js';

// [id, icon, unlocked?]. Lifetime counts come from S.gemCounts; score/combo are per-run.
export const ACH = [
  ['merge1',    '✨', () => S.gemCounts[1] >= 1],
  ['lv5',       '🔷', () => S.gemCounts[4] >= 1],
  ['lv8',       '🔶', () => S.gemCounts[7] >= 1],
  ['lv10',      '💠', () => S.gemCounts[9] >= 1],
  ['legend',    '💎', () => S.gemCounts[10] >= 1],
  ['legend5',   '👑', () => S.gemCounts[10] >= 5],
  ['combo3',    '⚡', () => S.comboCount >= 3],
  ['combo5',    '🔥', () => S.comboCount >= 5],
  ['score500',  '🏅', () => S.score >= 500],
  ['score1200', '🏆', () => S.score >= 1200],
  ['score3000', '🌟', () => S.score >= 3000],
  ['drops1k',   '🎯', () => S.gemCounts[0] >= 1000],
];

let unlocked = [];
try { unlocked = JSON.parse(localStorage.getItem('gmAch')) || []; } catch (e) {}
if (!Array.isArray(unlocked)) unlocked = [];
export const isUnlocked = id => unlocked.includes(id);
export const unlockedCount = () => unlocked.length;

// Call after anything that changes score / combo / gem counts (merge loop, drop)
export function checkAchievements() {
  for (const [id, icon, test] of ACH) {
    if (unlocked.includes(id) || !test()) continue;
    unlocked.push(id);
    localStorage.setItem('gmAch', JSON.stringify(unlocked));
    toastQueue.push([id, icon]);
  }
  showNextToast();
}

// One toast at a time; leaving display:none restarts the CSS keyframes
const toastQueue = [];
function showNextToast() {
  const el = document.getElementById('ach-toast');
  if (!toastQueue.length || !el.classList.contains('hidden')) return;
  const [id, icon] = toastQueue.shift();
  document.getElementById('ach-toast-icon').textContent  = icon;
  document.getElementById('ach-toast-title').textContent = t('ach')[id][0];
  document.getElementById('ach-btn').textContent = `🏆${unlockedCount()}`;
  el.classList.remove('hidden');
  el.addEventListener('animationend', () => { el.classList.add('hidden'); showNextToast(); }, { once: true });
}
