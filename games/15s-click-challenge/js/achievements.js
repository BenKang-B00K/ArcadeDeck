// Achievement definitions, progress checks, and DOM rendering.

import { loadStats, loadAchievements, saveAchievements, loadTop5 } from './storage.js';
import { svgIcon } from './icons.js';

// `icon` is a key into ICONS (js/icons.js), rendered via svgIcon().
export const ACHIEVEMENTS = [
  // Beginner
  { id: 'first_blood',    icon: 'target',        name: 'First Blood',      desc: 'Score your first hit' },
  { id: 'first_clear',    icon: 'check-circle',  name: 'First Clear',       desc: 'Pass a round for the first time' },
  { id: 'play_5',         icon: 'gamepad',       name: 'Getting Hooked',    desc: 'Play 5 rounds' },
  { id: 'play_25',        icon: 'joystick',      name: 'Regular',           desc: 'Play 25 rounds' },
  { id: 'play_100',       icon: 'dumbbell',      name: 'Grinder',           desc: 'Play 100 rounds' },

  // Score
  { id: 'score_10',       icon: 'hash',          name: 'Double Digits',     desc: 'Score 10+ hits in one round' },
  { id: 'score_15',       icon: 'zap',           name: 'Speed Demon',       desc: 'Score 15+ hits in one round' },
  { id: 'score_20',       icon: 'flame',         name: 'On Fire',           desc: 'Score 20+ hits in one round' },
  { id: 'score_25',       icon: 'sparkles',      name: 'Unstoppable',       desc: 'Score 25+ hits in one round' },
  { id: 'score_30',       icon: 'comet',         name: 'Godlike',           desc: 'Score 30+ hits in one round' },

  // Level milestones (based on level actually played, not next level)
  { id: 'level_3',        icon: 'sprout',        name: 'Sprout',            desc: 'Reach level 3' },
  { id: 'level_5',        icon: 'star',          name: 'Rising Star',       desc: 'Reach level 5' },
  { id: 'level_10',       icon: 'star-fill',     name: 'Veteran',           desc: 'Reach level 10' },
  { id: 'level_15',       icon: 'medal',         name: 'Elite',             desc: 'Reach level 15' },
  { id: 'level_20',       icon: 'crown',         name: 'Champion',          desc: 'Reach level 20' },
  { id: 'level_30',       icon: 'swords',        name: 'Dragon',            desc: 'Reach level 30' },
  { id: 'level_50',       icon: 'orbit',         name: 'Beyond',            desc: 'Reach level 50' },

  // Precision & skill
  { id: 'no_miss',        icon: 'gem',           name: 'Perfect Round',     desc: 'Pass with zero misses (1+ hit)' },
  { id: 'perfect_3',      icon: 'hexagon',       name: 'Flawless Trio',     desc: 'Get 3 cumulative perfect rounds' },
  { id: 'perfect_10',     icon: 'trophy',        name: 'Perfectionist',     desc: 'Get 10 cumulative perfect rounds' },
  { id: 'accuracy_90',    icon: 'crosshair',     name: 'Sharpshooter',      desc: 'Finish a round with 90%+ accuracy (5+ hits)' },

  // Clutch & risky
  { id: 'close_call',     icon: 'hourglass',     name: 'Close Call',        desc: 'Pass with less than 1s remaining' },
  { id: 'close_01',       icon: 'skull',         name: 'By a Thread',       desc: 'Pass with less than 0.3s remaining' },
  { id: 'survivor',       icon: 'shield',        name: 'Survivor',          desc: 'Pass after getting 3+ misses' },
  { id: 'survivor_5',     icon: 'anchor',        name: 'Iron Will',         desc: 'Pass after getting 5+ misses' },
  { id: 'comeback',       icon: 'rotate-ccw',    name: 'Comeback',          desc: 'Pass a round right after failing one' },

  // Streaks
  { id: 'streak_3',       icon: 'link',          name: 'Hat Trick',         desc: 'Pass 3 rounds in a row' },
  { id: 'streak_5',       icon: 'infinity',      name: 'Hot Streak',        desc: 'Pass 5 rounds in a row' },
  { id: 'streak_10',      icon: 'rocket',        name: 'Unstoppable Run',   desc: 'Pass 10 rounds in a row' },

  // Cumulative
  { id: 'total_100',      icon: 'bar-chart',     name: 'Centurion',         desc: 'Score 100 total hits across all games' },
  { id: 'total_500',      icon: 'trending-up',   name: 'Half a Grand',      desc: 'Score 500 total hits' },
  { id: 'total_1000',     icon: 'mountain',      name: 'Millennial',        desc: 'Score 1000 total hits' },
  { id: 'miss_50',        icon: 'eye-off',       name: 'Oops',              desc: 'Accumulate 50 total misses' },

  // Fun / hidden
  { id: 'zero_score',     icon: 'ghost',         name: 'Spectator',         desc: 'Finish a round with 0 hits' },
  { id: 'all_miss',       icon: 'tornado',       name: 'Stormtrooper',      desc: 'Get 5+ misses and 0 hits in one round' },
  { id: 'high_level_fail',icon: 'trending-down', name: 'Humbled',           desc: 'Fail at level 10 or higher' },
  { id: 'sound_toggle',   icon: 'volume-x',      name: 'Silence is Golden', desc: 'Toggle the sound off' },
];

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
  _toastEl.innerHTML = `${svgIcon(ach.icon)} ${escapeHtml(ach.name)} Unlocked!`;
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
    listEl.innerHTML = '<div class="top5-empty">No records yet — play a round!</div>';
    return;
  }
  listEl.innerHTML = records.map((r, i) => {
    const score = Number(r.score) || 0;
    const level = Number(r.level) || 0;
    const date  = escapeHtml(r.date || '');
    return `<li class="top5-row${i === 0 ? ' top5-first' : ''}">
       <span class="top5-score">${score}<span class="top5-unit">pts</span></span>
       <span class="top5-level">Lv ${level}</span>
       <span class="top5-date">${date}</span>
     </li>`;
  }).join('');
}

export function renderAchievements(listEl) {
  if (!listEl) return;
  const ach = loadAchievements();
  const total = ACHIEVEMENTS.length;
  const unlocked = ACHIEVEMENTS.filter(a => ach[a.id]).length;
  const pct = Math.round((unlocked / total) * 100);
  listEl.innerHTML =
    `<div class="ach-progress">
       <div class="ach-progress-meta">
         <span class="ach-progress-count">${unlocked} / ${total} unlocked</span>
         <span class="ach-progress-pct">${pct}%</span>
       </div>
       <div class="ach-progress-bar"><div class="ach-progress-fill" style="transform:scaleX(${(pct/100).toFixed(4)})"></div></div>
     </div>` +
    `<div class="ach-grid">` +
    ACHIEVEMENTS.map(a => {
      const done = ach[a.id];
      const name = done ? a.name : '???';
      return `<div class="ach-item${done ? ' unlocked' : ''}" title="${name} — ${a.desc}">
        <span class="ach-icon">${svgIcon(a.icon)}</span>
        <div class="ach-body">
          <div class="ach-name">${name}</div>
          <div class="ach-desc">${a.desc}</div>
        </div>
      </div>`;
    }).join('') +
    `</div>`;
}
