// Achievement definitions, progress checks, and DOM rendering.

import { loadStats, loadAchievements, saveAchievements, loadTop5 } from './storage.js';
import { svgIcon } from './icons.js';
import { t, LANG } from './i18n.js';

// `icon` is a key into ICONS (js/icons.js), rendered via svgIcon().
// Name/description text lives in js/i18n.js as `ach_<id>` / `ach_<id>_d`.
export const ACHIEVEMENTS = [
  // Beginner
  { id: 'first_blood',    icon: 'target' },
  { id: 'first_clear',    icon: 'check-circle' },
  { id: 'play_5',         icon: 'gamepad' },
  { id: 'play_25',        icon: 'joystick' },
  { id: 'play_100',       icon: 'dumbbell' },

  // Score
  { id: 'score_10',       icon: 'hash' },
  { id: 'score_15',       icon: 'zap' },
  { id: 'score_20',       icon: 'flame' },
  { id: 'score_25',       icon: 'sparkles' },
  { id: 'score_30',       icon: 'comet' },

  // Level milestones (based on level actually played, not next level)
  { id: 'level_3',        icon: 'sprout' },
  { id: 'level_5',        icon: 'star' },
  { id: 'level_10',       icon: 'star-fill' },
  { id: 'level_15',       icon: 'medal' },
  { id: 'level_20',       icon: 'crown' },
  { id: 'level_30',       icon: 'swords' },
  { id: 'level_50',       icon: 'orbit' },

  // Precision & skill
  { id: 'no_miss',        icon: 'gem' },
  { id: 'perfect_3',      icon: 'hexagon' },
  { id: 'perfect_10',     icon: 'trophy' },
  { id: 'accuracy_90',    icon: 'crosshair' },

  // Clutch & risky
  { id: 'close_call',     icon: 'hourglass' },
  { id: 'close_01',       icon: 'skull' },
  { id: 'survivor',       icon: 'shield' },
  { id: 'survivor_5',     icon: 'anchor' },
  { id: 'comeback',       icon: 'rotate-ccw' },

  // Streaks
  { id: 'streak_3',       icon: 'link' },
  { id: 'streak_5',       icon: 'infinity' },
  { id: 'streak_10',      icon: 'rocket' },

  // Cumulative
  { id: 'total_100',      icon: 'bar-chart' },
  { id: 'total_500',      icon: 'trending-up' },
  { id: 'total_1000',     icon: 'mountain' },
  { id: 'miss_50',        icon: 'eye-off' },

  // Fun / hidden
  { id: 'zero_score',     icon: 'ghost' },
  { id: 'all_miss',       icon: 'tornado' },
  { id: 'high_level_fail',icon: 'trending-down' },
  { id: 'sound_toggle',   icon: 'volume-x' },
];

const num = new Intl.NumberFormat(LANG);
const pctFmt = new Intl.NumberFormat(LANG, { style: 'percent' });
const dateFmt = new Intl.DateTimeFormat(LANG, { dateStyle: 'short' });

const TOAST_VISIBLE_MS = 2200;
const TOAST_GAP_MS = 400;

let _toastEl = null;
const _toastQueue = [];
let _toastBusy = false;

export function initAchievementsUI(toastEl) {
  _toastEl = toastEl;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function drainToastQueue() {
  if (_toastQueue.length === 0) { _toastBusy = false; return; }
  _toastBusy = true;
  const ach = _toastQueue.shift();
  if (!_toastEl) { drainToastQueue(); return; }
  _toastEl.innerHTML = `${svgIcon(ach.icon)} ${escapeHtml(t('achUnlocked', t(`ach_${ach.id}`)))}`;
  _toastEl.classList.add('show');
  setTimeout(() => {
    _toastEl.classList.remove('show');
    setTimeout(drainToastQueue, TOAST_GAP_MS);
  }, TOAST_VISIBLE_MS);
}

function showAchievementToast(ach) {
  _toastQueue.push(ach);
  if (!_toastBusy) drainToastQueue();
}

export function unlockAchievement(id) {
  const ach = loadAchievements();
  if (ach[id]) return;
  ach[id] = true;
  saveAchievements(ach);
  const def = ACHIEVEMENTS.find(a => a.id === id);
  if (def) showAchievementToast(def);
}

export function checkAchievements(finalScore, finalLevel, ms, timeRemaining, passed) {
  const st = loadStats();  // already updated for this round

  if (finalScore >= 1)  unlockAchievement('first_blood');
  if (finalScore >= 10) unlockAchievement('score_10');
  if (finalScore >= 15) unlockAchievement('score_15');
  if (finalScore >= 20) unlockAchievement('score_20');
  if (finalScore >= 25) unlockAchievement('score_25');
  if (finalScore >= 30) unlockAchievement('score_30');

  if (passed) unlockAchievement('first_clear');

  if (finalLevel >= 3)  unlockAchievement('level_3');
  if (finalLevel >= 5)  unlockAchievement('level_5');
  if (finalLevel >= 10) unlockAchievement('level_10');
  if (finalLevel >= 15) unlockAchievement('level_15');
  if (finalLevel >= 20) unlockAchievement('level_20');
  if (finalLevel >= 30) unlockAchievement('level_30');
  if (finalLevel >= 50) unlockAchievement('level_50');

  if (passed && ms === 0 && finalScore >= 1) unlockAchievement('no_miss');
  if (finalScore >= 5 && ms + finalScore > 0) {
    const accuracy = finalScore / (finalScore + ms);
    if (accuracy >= 0.9) unlockAchievement('accuracy_90');
  }

  if (passed && timeRemaining < 1   && timeRemaining >= 0) unlockAchievement('close_call');
  if (passed && timeRemaining < 0.3 && timeRemaining >= 0) unlockAchievement('close_01');
  if (passed && ms >= 3) unlockAchievement('survivor');
  if (passed && ms >= 5) unlockAchievement('survivor_5');

  if (passed && st.streak === 1 && st.games > 1) unlockAchievement('comeback');  // prev round failed

  if (finalScore === 0) unlockAchievement('zero_score');
  if (finalScore === 0 && ms >= 5) unlockAchievement('all_miss');
  if (!passed && finalLevel >= 10) unlockAchievement('high_level_fail');

  if (st.games >= 5)   unlockAchievement('play_5');
  if (st.games >= 25)  unlockAchievement('play_25');
  if (st.games >= 100) unlockAchievement('play_100');

  if (st.totalHits >= 100)  unlockAchievement('total_100');
  if (st.totalHits >= 500)  unlockAchievement('total_500');
  if (st.totalHits >= 1000) unlockAchievement('total_1000');

  if (st.totalMiss >= 50) unlockAchievement('miss_50');

  if (st.perfectRounds >= 3)  unlockAchievement('perfect_3');
  if (st.perfectRounds >= 10) unlockAchievement('perfect_10');

  if (st.streak >= 3)  unlockAchievement('streak_3');
  if (st.streak >= 5)  unlockAchievement('streak_5');
  if (st.streak >= 10) unlockAchievement('streak_10');
}

export function renderTop5(listEl) {
  if (!listEl) return;
  const records = loadTop5();
  if (records.length === 0) {
    listEl.innerHTML = `<div class="top5-empty">${escapeHtml(t('top5Empty'))}</div>`;
    return;
  }
  listEl.innerHTML = records.map((r, i) => {
    const score = Number(r.score) || 0;
    const level = Number(r.level) || 0;
    const d = new Date(`${r.date}T00:00`);  // stored as YYYY-MM-DD; parse as local midnight
    const date = isNaN(d) ? '' : escapeHtml(dateFmt.format(d));
    return `<li class="top5-row${i === 0 ? ' top5-first' : ''}">
       <span class="top5-score">${num.format(score)}<span class="top5-unit">${escapeHtml(t('pts', score))}</span></span>
       <span class="top5-level">${escapeHtml(t('lv', level))}</span>
       <span class="top5-date">${date}</span>
     </li>`;
  }).join('');
}

export function renderAchievements(listEl) {
  if (!listEl) return;
  const ach = loadAchievements();
  const total = ACHIEVEMENTS.length;
  const unlocked = ACHIEVEMENTS.filter(a => ach[a.id]).length;
  const ratio = unlocked / total;
  listEl.innerHTML =
    `<div class="ach-progress">
       <div class="ach-progress-meta">
         <span class="ach-progress-count">${escapeHtml(t('achProgress', unlocked, total))}</span>
         <span class="ach-progress-pct">${pctFmt.format(ratio)}</span>
       </div>
       <div class="ach-progress-bar"><div class="ach-progress-fill" style="transform:scaleX(${ratio.toFixed(4)})"></div></div>
     </div>` +
    `<div class="ach-grid">` +
    ACHIEVEMENTS.map(a => {
      const done = ach[a.id];
      const name = escapeHtml(done ? t(`ach_${a.id}`) : '???');
      const desc = escapeHtml(t(`ach_${a.id}_d`));
      return `<div class="ach-item${done ? ' unlocked' : ''}" title="${name} — ${desc}">
        <span class="ach-icon">${svgIcon(a.icon)}</span>
        <div class="ach-body">
          <div class="ach-name">${name}</div>
          <div class="ach-desc">${desc}</div>
        </div>
      </div>`;
    }).join('') +
    `</div>`;
}
