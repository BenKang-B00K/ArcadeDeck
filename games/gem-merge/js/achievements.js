import { GEMS, hexStr } from './config.js';
import { S, load, save } from './state.js';
import { t } from './i18n.js';
import { icon } from './icons.js';

const sum = a => a.reduce((x, y) => x + y, 0);

const gemCol = lv => hexStr(GEMS[lv - 1].color);

// [id, color, icon name, unlock test]. Names/descriptions live in i18n under `ach`.
export const ACHIEVEMENTS = [
  ['firstMerge',  '#ffd93d',  'sparkle', () => S.gemCounts[1] >= 1],
  ['combo3',      '#ffd93d',  'bolt',    () => S.comboCount >= 3],
  ['combo5',      '#ff6348',  'flame',   () => S.comboCount >= 5],
  ['lv5',         gemCol(5),  'hexagon', () => S.gemCounts[4] >= 1],
  ['lv7',         gemCol(7),  'star6',   () => S.gemCounts[6] >= 1],
  ['lv9',         gemCol(9),  'star8',   () => S.gemCounts[8] >= 1],
  ['lv10',        gemCol(10), 'cushion', () => S.gemCounts[9] >= 1],
  ['legendary',   gemCol(11), 'gem',     () => S.gemCounts[10] >= 1],
  ['legendary3',  '#f9ca24',  'crown',   () => S.gemCounts[10] >= 3],
  ['legendary10', '#ffb347',  'trophy',  () => S.gemCounts[10] >= 10],
  ['score500',    '#cd7f32',  'medal',   () => S.score >= 500],
  ['score1000',   '#c8d0d8',  'medal',   () => S.score >= 1000],
  ['score2000',   '#ffd700',  'medal',   () => S.score >= 2000],
  ['gems1000',    '#00cec9',  'layers',  () => sum(S.gemCounts) >= 1000],
];

export const achIcon = ([, color, name]) => icon(name, color, 'ach-icon');

// Unlocked ids persist in storage; corrupt/missing → none
let unlocked = new Set();
try { unlocked = new Set(JSON.parse(load('ach')) || []); } catch (e) {}

export const isUnlocked = id => unlocked.has(id);
export const unlockedCount = () => unlocked.size;

// Run after every merge batch: unlock anything newly earned, one toast each
export function checkAchievements() {
  for (const a of ACHIEVEMENTS) {
    const [id, , , test] = a;
    if (unlocked.has(id) || !test()) continue;
    unlocked.add(id);
    save('ach', JSON.stringify([...unlocked]));
    showToast(a);
  }
}

function showToast(a) {
  const el = document.createElement('div');
  el.className = 'ach-toast';
  el.innerHTML = `${achIcon(a)}<div><small>${t('achToast')}</small><b>${t('ach')[a[0]][0]}</b></div>`;
  el.addEventListener('animationend', () => el.remove(), { once: true });
  document.getElementById('ach-toasts').appendChild(el);
}
