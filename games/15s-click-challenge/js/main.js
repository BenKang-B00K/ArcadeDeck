// Click-target game entry: state, target, VFX, render loop, input.

import {
  migrate,
  getHighscore, setHighscore,
  getLevel, setLevel,
  getSoundPref, setSoundPref,
  addRecord, updateStats,
} from './storage.js';

import {
  initAudio, playSfx, startBgm, stopBgm, setMuted, unlockAudio, pauseAudio,
} from './audio.js';

import {
  initAchievementsUI, unlockAchievement, checkAchievements,
  renderTop5, renderAchievements,
} from './achievements.js';

import { svgIcon } from './icons.js';
import { t, LANG, applyI18n } from './i18n.js';

migrate();
applyI18n();  // before the first resizeCanvas(): translated header/HUD text changes the height left for the canvas
// Canvas can't read CSS vars → reuse the resolved body stack (incl. the per-language CJK fallbacks).
const FONT = getComputedStyle(document.body).fontFamily;

// --- DOM refs ---
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha: true });
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const highEl = document.getElementById('highscore');
const levelEl = document.getElementById('level');
const startBtn = document.getElementById('start');
const overlay = document.getElementById('start-overlay');
const countdownEl = document.getElementById('countdown');
const resultOverlay = document.getElementById('result-overlay');
const resultEyebrowEl = document.getElementById('result-eyebrow');
const resultTitleEl = document.getElementById('result-title');
const resultConfettiEl = document.getElementById('result-confetti');
const resultMsgEl = document.getElementById('result-msg');
const resultScoreEl = document.getElementById('result-score');
const soundToggleEl = document.getElementById('sound-toggle');
const guideToggle = document.getElementById('guide-toggle');
const guideOverlay = document.getElementById('guide-overlay');
const guideClose = document.getElementById('guide-close');
const recordsToggle = document.getElementById('records-toggle');
const recordsOverlay = document.getElementById('records-overlay');
const recordsClose = document.getElementById('records-close');
const top5ListEl = document.getElementById('top5-list');
const achievementsListEl = document.getElementById('achievements-list');
const achievementToast = document.getElementById('achievement-toast');

initAchievementsUI(achievementToast);

// --- Canvas sizing ---
let CANVAS_W = 640;
let CANVAS_H = 480;
const gameWrap = canvas.parentElement;
const container = document.querySelector('.container');

function resizeCanvas() {
  // dpr capped at 2: dpr-3 phones would push ~2.2× the fill-rate for no visible gain.
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const wrapW = gameWrap.clientWidth || 640;
  if (wrapW < 1) return;
  const vh = window.innerHeight || 480;
  // Height left once header/HUD/padding are laid out, so the page never scrolls inside the
  // portal frame (16:9 / 9:16 / 1:1). offsetHeight includes the canvas border, style.height doesn't.
  const fitH = vh - (container.offsetHeight - canvas.offsetHeight) - (canvas.offsetHeight - canvas.clientHeight);
  const w = Math.max(120, Math.round(wrapW - (canvas.offsetWidth - canvas.clientWidth)));
  // 0.55·vh keeps the desktop look; 2·w caps very tall portrait fields.
  // floor + 1px slack: offsetHeight is rounded, fractional layouts (DPR 1.25) would overflow by 1px.
  const h = Math.max(120, Math.floor(Math.min(vh * 0.55, fitH - 1, w * 2)));
  // Assigning canvas.width clears + reallocs the backing store; skip no-op resizes
  // (mobile fires `resize` on URL-bar show/hide, often mid-round).
  if (w === CANVAS_W && h === CANVAS_H && canvas.width === w * dpr) return;
  CANVAS_W = w;
  CANVAS_H = h;

  canvas.width = CANVAS_W * dpr;
  canvas.height = CANVAS_H * dpr;
  canvas.style.width = CANVAS_W + 'px';
  canvas.style.height = CANVAS_H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (target && target.glowGrad) {
    const margin = target.r + 6;
    target.x = Math.max(margin, Math.min(CANVAS_W - margin, target.x));
    target.y = Math.max(margin, Math.min(CANVAS_H - margin, target.y));
    rebuildTargetGradients();
  }
}
window.addEventListener('resize', resizeCanvas);

// --- Constants ---
const START_SECONDS = 15;
const MOVE_INTERVAL = 1000;   // base move interval at level 1
const BASE_RADIUS = 32;
const MIN_RADIUS = 20;
const MIN_HIT_RADIUS = 22;
const MISS_PENALTY = 0.5;
const FADE_START_S = 5;        // ball starts fading when this much round time is left
const MIN_TARGET_ALPHA = 0.3;  // ball opacity at 0s
const GRAVITY = 180;           // particle fall, px/s²
const SNAP_K = 11.9;           // 1/s: trail fade + target scale settle (e^-k·dt)
const SETTLE_K = 9.75;         // 1/s: float-text scale + screen-shake decay
const SPARK_DAMPING = 0.0067;  // fraction of spark velocity kept per second

const timeFmt = new Intl.NumberFormat(LANG, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// Debug: ?fps=30 caps the update rate — gameplay must come out identical at any rate.
const DEBUG_FPS = Number(new URLSearchParams(window.location.search).get('fps')) || 0;

// --- State ---
// All round timers below are seconds, advanced by the render loop's clamped dt: a hidden tab
// stops rAF, so the round pauses instead of running out in the background.
let score = 0;
let misses = 0;
let highscore = getHighscore();
let level = getLevel();
let timeLeft = START_SECONDS;
let running = false;
let moveLeft = 0;      // s until the target auto-moves
let countdownTimer = null;  // pre-round 3-2-1 UI only (not gameplay)
let _lastTime = 0;

// Clears the countdown so a stale one can't fire after restart/teardown.
function clearAllTimers() {
  if (countdownTimer != null) { clearInterval(countdownTimer); countdownTimer = null; }
}

const target = {
  x: 100, y: 100, r: 30, scale: 1, hitR: 0,
  glowGrad: null, bodyGrad: null, specGrad: null, shadowGrad: null,
  ringR: 0, ringStart: 0, ringLife: 0, ringTTL: 0,
};

// --- VFX state ---
const particles = [];
const ripples = [];
const floats = [];
const ghosts = [];
const sparks = [];
const bgStars = [];
let shake = 0;
let _globalTime = 0;

// Camera-punch zoom (separate from shake; both applied to canvas.style.transform)
let _punchAt = -1e9;
let _punchScale = 1;
const PUNCH_MS = 180;

// Combo system: chained hits within COMBO_WINDOW_S drive VFX intensity.
let combo = 0;
let comboLeft = 0;  // s left in the combo window
const COMBO_WINDOW_S = 1.5;
function bumpCombo() {
  combo++;
  comboLeft = COMBO_WINDOW_S;
}
function resetCombo() {
  combo = 0;
  comboLeft = 0;
}
function comboTier() { return Math.min(5, Math.floor(combo / 3)); } // 0..5
function comboColor(tier) {
  return ['#ffffff','#ffd6ea','#9cfffa','#b58bff','#ffd86b','#ff5e7a'][tier];
}

// Level-up celebration trigger: fires once per round when score first crosses required.
let _passedThisRound = false;

for (let i = 0; i < 30; i++) {
  bgStars.push({
    x: Math.random(), y: Math.random(),
    size: 0.5 + Math.random() * 1.5,
    speed: 0.012 + Math.random() * 0.024,  // canvas heights per second
    phase: Math.random() * Math.PI * 2,
    alpha: 0.15 + Math.random() * 0.25,
  });
}

// --- postMessage parent origin resolver ---
// Returns a validated http(s) origin string, or null if none can be determined.
// Never falls back to '*' — refuse to broadcast cross-origin messages without a target.
// Priority: ?host= URL param → document.referrer → window.location.origin.
function getParentOrigin() {
  const host = new URLSearchParams(window.location.search).get('host');
  for (const candidate of [host, document.referrer, window.location.origin]) {
    if (!candidate) continue;
    try {
      const o = new URL(candidate).origin;   // opaque origins serialize as 'null' → rejected below
      if (/^https?:\/\//.test(o)) return o;
    } catch (e) { console.warn('getParentOrigin: bad candidate', candidate, e); }
  }
  return null;
}

// --- Level math ---
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function getLevelRadius() {
  const tier = Math.floor((level - 1) / 5);
  return Math.max(MIN_RADIUS, BASE_RADIUS - tier * 4);
}

function getRequiredScore() {
  if (level <= 5)  return 10;
  if (level <= 10) return 8;
  if (level <= 15) return 7;
  return 6;
}

function getMoveInterval() {
  // 7% reduction per level, floor at 300ms (reached ~level 16).
  return Math.max(300, Math.round(MOVE_INTERVAL * 0.93 ** (level - 1)));
}

// --- Target ---
function rebuildTargetGradients() {
  const glow = ctx.createRadialGradient(target.x, target.y, target.r * 0.2, target.x, target.y, target.r * 6);
  glow.addColorStop(0,   'rgba(255,110,120,0.25)');
  glow.addColorStop(0.4, 'rgba(150,90,220,0.08)');
  glow.addColorStop(1,   'rgba(0,0,0,0)');
  target.glowGrad = glow;

  // Sphere shading in local (translated) space: light source top-left, dark rim bottom-right.
  // Inner circle must lie inside the outer one or the gradient renders as a cone.
  const r = target.r;
  const body = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
  body.addColorStop(0,    '#fff4f2');
  body.addColorStop(0.3,  '#ff9aa8');
  body.addColorStop(0.75, '#ff5e6e');
  body.addColorStop(1,    '#7a1f36');
  target.bodyGrad = body;

  const spec = ctx.createRadialGradient(-r * 0.38, -r * 0.42, 0, -r * 0.38, -r * 0.42, r * 0.4);
  spec.addColorStop(0, 'rgba(255,255,255,0.85)');
  spec.addColorStop(1, 'rgba(255,255,255,0)');
  target.specGrad = spec;

  // Circular; drawn under a scale(1, 0.32) so it becomes a soft contact-shadow ellipse.
  const shadow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.9);
  shadow.addColorStop(0, 'rgba(0,0,0,0.45)');
  shadow.addColorStop(1, 'rgba(0,0,0,0)');
  target.shadowGrad = shadow;
}

function placeTarget() {
  const baseR = getLevelRadius();
  target.r = Math.max(MIN_RADIUS, Math.round(baseR + (Math.random() * 2 - 1)));
  target.hitR = Math.max(MIN_HIT_RADIUS, Math.round(target.r * 1.25));

  const margin = target.r + 6;
  const maxX = Math.max(margin, CANVAS_W - margin);
  const maxY = Math.max(margin, CANVAS_H - margin);
  const prevX = target.x;
  const prevY = target.y;

  if (level >= 11) {
    const minDist = Math.min(CANVAS_W, CANVAS_H) * 0.4;
    for (let attempt = 0; attempt < 20; attempt++) {
      target.x = rand(margin, maxX);
      target.y = rand(margin, maxY);
      const dx = target.x - prevX;
      const dy = target.y - prevY;
      if (Math.sqrt(dx * dx + dy * dy) >= minDist) break;
    }
  } else if (level >= 6 && Math.random() < 0.5) {
    const cx = CANVAS_W / 2, cy = CANVAS_H / 2;
    const zoneW = CANVAS_W * 0.15, zoneH = CANVAS_H * 0.15;
    for (let attempt = 0; attempt < 20; attempt++) {
      target.x = rand(margin, maxX);
      target.y = rand(margin, maxY);
      if (Math.abs(target.x - cx) > zoneW || Math.abs(target.y - cy) > zoneH) break;
    }
  } else {
    target.x = rand(margin, maxX);
    target.y = rand(margin, maxY);
  }
  target.scale = 1;

  // Motion trail: ghosts spaced along old → new position so the jump reads kinetically.
  if (running) {
    const tdx = target.x - prevX;
    const tdy = target.y - prevY;
    const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
    if (tdist > 30) {
      const steps = Math.min(5, Math.floor(tdist / 50));
      for (let i = 1; i <= steps; i++) {
        const t = i / (steps + 1);
        spawnGhost(prevX + tdx * t, prevY + tdy * t, target.r * (1 - t * 0.35), 0.35 * (1 - t * 0.4));
      }
    }
  }

  target.ringStart = target.r * 4;
  target.ringR = target.ringStart;
  target.ringLife = 0;
  target.ringTTL = getMoveInterval() / 1000;  // s

  rebuildTargetGradients();
}

// --- VFX spawners ---
// Units: velocities/growth px/s, life/ttl/delay s.
const BASE_PALETTE = ['#ff5e7a','#ffb86b','#9cfffa','#b58bff','#ffd6f0','#fff'];
const HOT_PALETTE  = ['#ffd86b','#ffaa66','#fffbe5','#ff5e7a','#ffd6ea'];

function spawnParticles(x, y, count = 28, tier = 0) {
  const palette = tier >= 3 ? HOT_PALETTE : BASE_PALETTE;
  const speedBoost = 1 + tier * 0.15;
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 300 + 90) * speedBoost;
    const big = Math.random() < 0.25;
    particles.push({
      x, y,
      vx: Math.cos(a) * speed * (big ? 0.6 : 1),
      vy: Math.sin(a) * speed * (big ? 0.6 : 1),
      life: 0,
      ttl: big ? 0.83 + Math.random() * 0.5 : 0.47 + Math.random() * 0.53,
      size: big ? 2.5 + Math.random() * 2.5 : 0.8 + Math.random() * 2.2,
      color: palette[Math.floor(Math.random() * palette.length)],
      star: Math.random() < (0.3 + tier * 0.05),
    });
  }
}
function spawnRipple(x, y, tier = 0) {
  ripples.push({ x, y, r: 0, alpha: 0.8, color: '255,160,200', growth: 210 + tier * 36 });
  ripples.push({ x, y, r: 0, alpha: 0.5, color: '150,200,255', delay: 0.067, growth: 180 + tier * 30 });
  if (tier >= 3) {
    ripples.push({ x, y, r: 0, alpha: 0.7, color: '255,216,107', delay: 0.133, growth: 240 + tier * 30 });
  }
}
function spawnFloat(x, y, text, color, scale = 1.6) {
  floats.push({
    x, y, vy: -72 - Math.random() * 36, alpha: 1, text,
    color: color || '#fff', life: 0, ttl: 0.92, scale,
  });
}
function spawnGhost(x, y, r, alpha = 0.5) {
  ghosts.push({ x, y, r, alpha, life: 0, ttl: 0.5 });
}
// Radial spark lines — short streaks flying outward; brighter at high combo.
function spawnSparkLines(x, y, count = 8, tier = 0) {
  const color = tier >= 2 ? '#ffd86b' : '#ffffff';
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const speed = 360 + Math.random() * 240 + tier * 120;
    sparks.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0, ttl: 0.3 + tier * 0.033,
      color,
    });
  }
}
// Red ripple + cross-shaped debris on miss.
function spawnMissBurst(x, y) {
  ripples.push({ x, y, r: 0, alpha: 0.7, color: '255,80,90', growth: 240 });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const speed = 180 + Math.random() * 120;
    particles.push({
      x, y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      life: 0, ttl: 0.43 + Math.random() * 0.17,
      size: 1.4 + Math.random() * 0.8,
      color: '#ff5e6e',
      star: false,
    });
  }
}
// One-shot celebration when the player crosses required score mid-round.
function spawnLevelUpBurst() {
  const cx = CANVAS_W / 2, cy = CANVAS_H / 2;
  spawnParticles(cx, cy, 60, 5);
  spawnSparkLines(cx, cy, 16, 4);
  ripples.push({ x: cx, y: cy, r: 0, alpha: 1.0, color: '255,216,107', growth: 360 });
  ripples.push({ x: cx, y: cy, r: 0, alpha: 0.7, color: '255,255,255', delay: 0.1, growth: 300 });
  spawnFloat(cx, cy - 36, t('cleared'), '#ffd86b', 2.4);
  playSfx('clear');
  shake = 14;
  cameraPunch(1.06);
}

// CSS-transform zoom punch (combined with shake in render loop).
function cameraPunch(scale = 1.04) {
  _punchScale = scale;
  _punchAt = performance.now();
}

function spawnHitEffects(x, y) {
  const tier = comboTier();
  spawnGhost(x, y, target.r);
  spawnParticles(x, y, 22 + tier * 6, tier);
  spawnSparkLines(x, y, 6 + tier * 2, tier);
  spawnRipple(x, y, tier);
  const text = combo >= 3 ? `+${combo}!` : '+1';
  spawnFloat(x, y, text, comboColor(tier), 1.6 + tier * 0.18);
  playSfx('hit', 1 + tier * 0.05);
  shake = 8 + tier * 1.5;
  target.scale = 1.8 + tier * 0.08;
  cameraPunch(1.02 + tier * 0.008);
  scheduleAutoMove();
}

// Counted down in updateAndDraw; firing there keeps moves on the same paused/clamped clock as the round.
function scheduleAutoMove() {
  moveLeft = getMoveInterval() / 1000;
}

// --- HUD ---
let _prevScore = score;
let _prevTime = Math.ceil(timeLeft);

function animatePop(el, from = 1.15) {
  el.animate([{ transform: `scale(${from})` }, { transform: 'scale(1)' }], { duration: 220, easing: 'cubic-bezier(.2,.9,.2,1)' });
}

// red → yellow → green as time remaining grows; shared by HUD and the in-ball timer
const timeColor = (t) => `hsl(${Math.round(120 * t / START_SECONDS)} 100% 70%)`;

// Runs every frame: write DOM only on change (textContent replaces the text node even when equal).
function updateHUD() {
  if (levelEl.textContent != level) levelEl.textContent = level;
  if (score !== _prevScore) { scoreEl.textContent = score; animatePop(scoreEl); _prevScore = score; }
  const tStr = timeFmt.format(timeLeft);
  if (timeEl.textContent !== tStr) {
    timeEl.textContent = tStr;
    timeEl.style.color = timeColor(timeLeft);
  }
  const tCeil = Math.ceil(timeLeft);
  if (tCeil !== _prevTime) { animatePop(timeEl); _prevTime = tCeil; }
  if (highEl.textContent != highscore) highEl.textContent = highscore;
}

// --- End-of-round messaging ---
// DOM confetti over the playfield for the cleared card (canvas is cleared while !running).
const CONFETTI_PALETTE = ['#ffd86b', '#ff5e7a', '#9cfffa', '#b58bff', '#fff', '#ffb347'];
function spawnConfetti(count = 48) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const el = document.createElement('i');
    el.style.cssText =
      `--x:${(Math.random() * 100).toFixed(1)}%;` +
      `--dx:${((Math.random() - 0.5) * 120).toFixed(0)}px;` +
      `--w:${(5 + Math.random() * 6).toFixed(0)}px;--h:${(8 + Math.random() * 8).toFixed(0)}px;` +
      `--c:${CONFETTI_PALETTE[i % CONFETTI_PALETTE.length]};` +
      `--t:${(1.6 + Math.random() * 1.2).toFixed(2)}s;--delay:${(Math.random() * 0.6).toFixed(2)}s;`;
    frag.appendChild(el);
  }
  resultConfettiEl.replaceChildren(frag);
}

// → locale key of the rank; its message is `${key}Msg`.
function computeLevel(s, required) {
  if (s <= 0) return 'rankNone';
  const ratio = required > 0 ? s / required : 0;
  if (ratio < 0.4) return 'rankBeginner';
  if (ratio < 0.7) return 'rankSkilled';
  if (ratio < 1.0) return 'rankSharp';
  if (ratio < 1.5) return 'rankLegend';
  return 'rankImmortal';
}

function setStartLabel() {
  startBtn.textContent = level > 1 ? t('startLevel', level) : t('start');
}

function endGame() {
  running = false;
  clearAllTimers();
  startBtn.disabled = false;
  stopBgm();

  const required = getRequiredScore();
  const passed = score >= required;
  const finalTimeRemaining = timeLeft;
  const playedLevel = level;
  playSfx(passed ? 'win' : 'fail');

  if (passed) {
    level = playedLevel + 1;
  } else {
    const milestone = Math.floor((playedLevel - 1) / 5) * 5 + 1;
    level = Math.max(1, milestone);
  }
  setLevel(level);

  if (score > highscore) {
    highscore = score;
    setHighscore(highscore);
  }
  updateHUD();

  addRecord(score, playedLevel);
  updateStats(score, misses, passed, playedLevel);
  checkAchievements(score, playedLevel, misses, finalTimeRemaining, passed);

  const rank = computeLevel(score, required);
  resultOverlay.classList.toggle('cleared', passed);
  resultEyebrowEl.textContent = passed ? t('eyebrowCleared', playedLevel, t(rank)) : t('eyebrow', playedLevel);
  resultTitleEl.textContent = passed ? t('congrats') : t(rank);
  resultMsgEl.textContent = t(`${rank}Msg`);
  resultScoreEl.textContent = t('resultScore', score, required, level);
  if (passed) spawnConfetti();
  resultOverlay.show();
  resultOverlay.addEventListener('close', () => {
    resultConfettiEl.replaceChildren();
    setStartLabel();
    startBtn.style.display = 'inline-block';
  }, { once: true });
  setTimeout(() => resultOverlay.close(), 2500);  // click-to-dismiss wired below

  const parentOrigin = getParentOrigin();
  if (parentOrigin) {
    try {
      window.parent.postMessage(
        { type: 'GAME_OVER', score: Number(level), subScore: score },
        parentOrigin
      );
    } catch (e) { console.warn('postMessage GAME_OVER failed', e); }
  } else {
    console.warn('postMessage GAME_OVER skipped: no validated parent origin');
  }

  overlay.classList.remove('active');
}

function startGame() {
  clearAllTimers();
  score = 0;
  misses = 0;
  timeLeft = START_SECONDS;
  running = true;
  _lastTime = 0;
  startBtn.disabled = true;
  canvas.classList.remove('urgent');
  ghosts.length = 0;
  sparks.length = 0;
  resetCombo();
  _passedThisRound = false;
  placeTarget();
  updateHUD();
  startBgm();
  scheduleAutoMove();  // timeLeft / moveLeft tick down in updateAndDraw
}

// --- Input ---
let shakeOx = 0, shakeOy = 0;

// rect already reflects the shake/punch CSS transform, so no manual offset here.
function canvasPosFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (CANVAS_W / rect.width),
    y: (e.clientY - rect.top)  * (CANVAS_H / rect.height),
  };
}

function onCanvasClick(e) {
  if (!running) return;
  const pos = canvasPosFromEvent(e);
  const dx = pos.x - target.x;
  const dy = pos.y - target.y;
  const hitR = target.hitR || target.r;
  if (dx*dx + dy*dy <= hitR * hitR) {
    score += 1;
    bumpCombo();
    spawnHitEffects(target.x, target.y);
    if (!_passedThisRound && score >= getRequiredScore()) {
      _passedThisRound = true;
      spawnLevelUpBurst();
    }
    placeTarget();
  } else {
    misses++;
    timeLeft = Math.max(0, timeLeft - MISS_PENALTY);  // 0 → round ends next frame
    playSfx('miss');
    const hadCombo = combo;
    resetCombo();
    spawnFloat(pos.x, pos.y, t('missPenalty', MISS_PENALTY), '#ff5e6e');
    if (hadCombo >= 3) spawnFloat(pos.x, pos.y - 20, t('comboLost'), '#ff8a96', 1.4);
    spawnMissBurst(pos.x, pos.y);
    shake = hadCombo >= 3 ? 7 : 5;
  }
  updateHUD();
}

// --- Render loop ---
function updateAndDraw(now) {
  // _lastTime = 0 (round start / tab hidden) → this frame only re-syncs the clock: dt = 0 after a pause.
  if (!_lastTime) { _lastTime = now; requestAnimationFrame(updateAndDraw); return; }
  if (DEBUG_FPS && now - _lastTime < 1000 / DEBUG_FPS - 1) { requestAnimationFrame(updateAndDraw); return; }
  const dt = Math.min((now - _lastTime) / 1000, 0.1);
  _lastTime = now;

  // Trail fade + target scale settle share one exponential rate (1/s).
  const snap = 1 - Math.exp(-SNAP_K * dt);

  ctx.globalCompositeOperation = 'source-over';
  const trailAlpha = snap;
  ctx.fillStyle = `rgba(6,8,18,${trailAlpha.toFixed(4)})`;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  _globalTime += dt;

  // Gameplay clock: round time, combo window and auto-move all accumulate the same clamped dt.
  if (running) {
    timeLeft = Math.max(0, timeLeft - dt);
    canvas.classList.toggle('urgent', timeLeft <= 5 && timeLeft > 0);
    if (timeLeft <= 0) {
      endGame();
    } else {
      if (comboLeft > 0 && (comboLeft -= dt) <= 0) combo = 0;
      if ((moveLeft -= dt) <= 0) { placeTarget(); scheduleAutoMove(); }
      updateHUD();
    }
  }
  if (!running) {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    requestAnimationFrame(updateAndDraw);
    return;
  }

  // Ball fades in the final seconds; digits fade less so the timer stays readable.
  const fadeT = Math.min(1, timeLeft / FADE_START_S);
  const wantAlpha = MIN_TARGET_ALPHA + (1 - MIN_TARGET_ALPHA) * fadeT;
  const textAlpha = 0.7 + 0.3 * fadeT;
  // The canvas is never cleared (trail fill above), so a translucent ball accumulates frame over frame
  // toward S = a / (1 - (1-a)(1-trailAlpha)). Invert so the *visible* opacity equals wantAlpha.
  const ballAlpha = wantAlpha >= 1 ? 1 : trailAlpha * wantAlpha / (1 - (1 - trailAlpha) * wantAlpha);

  // Background stars — brightness scales with combo for reactive feel.
  ctx.globalCompositeOperation = 'lighter';
  const starBoost = 1 + Math.min(0.8, combo * 0.08);
  for (const star of bgStars) {
    star.y -= star.speed * dt * (1 + Math.min(0.5, combo * 0.05));
    if (star.y < -0.02) star.y += 1.04;
    const twinkle = 0.5 + 0.5 * Math.sin(_globalTime * 3 + star.phase);
    ctx.globalAlpha = star.alpha * twinkle * starBoost;
    ctx.fillStyle = combo >= 9 ? '#ffe7a8' : '#c7d0ff';
    ctx.beginPath();
    ctx.arc(star.x * CANVAS_W, star.y * CANVAS_H, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  // Ghosts
  for (let i = 0; i < ghosts.length; ) {
    const g = ghosts[i];
    g.life += dt;
    g.alpha -= 1.5 * dt;
    if (g.alpha <= 0 || g.life > g.ttl) { ghosts[i] = ghosts[ghosts.length - 1]; ghosts.pop(); continue; }
    ctx.globalAlpha = g.alpha * 0.4;
    ctx.strokeStyle = 'rgba(255,160,200,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(g.x, g.y, g.r * (1 + g.life * 1.2), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    i++;
  }

  // Glow
  if (target.glowGrad) {
    const glowPulse = 1 + 0.15 * Math.sin(_globalTime * 4);
    ctx.globalAlpha = (0.7 + 0.3 * Math.sin(_globalTime * 3)) * ballAlpha;
    ctx.fillStyle = target.glowGrad;
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.r * 5 * glowPulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Shrinking ring
  if (target.ringTTL > 0 && target.ringLife < target.ringTTL) {
    target.ringLife += dt;
    const progress = Math.min(1, target.ringLife / target.ringTTL);
    target.ringR = target.ringStart + (target.r - target.ringStart) * progress;
    const ringAlpha = progress > 0.8 ? (1 - progress) * 5 : 0.6;
    const rCol = Math.round(110 + 145 * progress);
    const gCol = Math.round(220 * (1 - progress));
    const bCol = Math.round(255 * (1 - progress * 0.6));
    ctx.strokeStyle = `rgba(${rCol},${gCol},${bCol},${ringAlpha.toFixed(2)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(target.x, target.y, Math.max(target.r, target.ringR), 0, Math.PI * 2);
    ctx.stroke();
  }

  // Particles
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < particles.length; ) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += GRAVITY * dt;
    p.life += dt;
    const lifeT = 1 - p.life / p.ttl;
    if (lifeT <= 0) { particles[i] = particles[particles.length - 1]; particles.pop(); continue; }
    ctx.globalAlpha = Math.pow(lifeT, 1.1);
    ctx.fillStyle = p.color;
    const rad = Math.max(0.5, p.size * (0.5 + lifeT * 0.5));
    if (p.star) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.life * 6);  // rad/s
      ctx.beginPath();
      for (let j = 0; j < 8; j++) {
        const angle = (j / 8) * Math.PI * 2;
        const dist = j % 2 === 0 ? rad * 2.5 : rad * 0.8;
        const method = j === 0 ? 'moveTo' : 'lineTo';
        ctx[method](Math.cos(angle) * dist, Math.sin(angle) * dist);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    i++;
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  // Ripples (per-ripple growth rate so big rings expand faster)
  for (let i = 0; i < ripples.length; ) {
    const r = ripples[i];
    if (r.delay && r.delay > 0) { r.delay -= dt; i++; continue; }
    const growth = (r.growth != null ? r.growth : 210) + score * 3.6;
    r.r += growth * dt;
    r.alpha -= 1.32 * dt;
    if (r.alpha <= 0) { ripples[i] = ripples[ripples.length - 1]; ripples.pop(); continue; }
    ctx.strokeStyle = `rgba(${r.color || '255,160,200'},${r.alpha.toFixed(3)})`;
    ctx.lineWidth = r.color === '150,200,255' ? 1 : 2;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
    ctx.stroke();
    i++;
  }

  // Spark lines — short streaks rendered as fading line segments.
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < sparks.length; ) {
    const sp = sparks[i];
    sp.life += dt;
    sp.x += sp.vx * dt;
    sp.y += sp.vy * dt;
    const keep = Math.pow(SPARK_DAMPING, dt);
    sp.vx *= keep;
    sp.vy *= keep;
    const lifeT = 1 - sp.life / sp.ttl;
    if (lifeT <= 0) { sparks[i] = sparks[sparks.length - 1]; sparks.pop(); continue; }
    ctx.globalAlpha = lifeT;
    ctx.strokeStyle = sp.color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(sp.x, sp.y);
    ctx.lineTo(sp.x - sp.vx * 0.01, sp.y - sp.vy * 0.01);  // tail = 10ms of travel
    ctx.stroke();
    i++;
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  // Floats
  for (let i = 0; i < floats.length; ) {
    const f = floats[i];
    f.y += f.vy * dt;
    f.alpha -= 1.32 * dt;
    f.life += dt;
    if (f.scale > 1) f.scale += (1 - f.scale) * (1 - Math.exp(-SETTLE_K * dt));
    if (f.alpha <= 0 || f.life > f.ttl) { floats[i] = floats[floats.length - 1]; floats.pop(); continue; }
    ctx.save();
    ctx.globalAlpha = Math.max(0, f.alpha);
    const fSize = Math.round(16 * (f.scale || 1));
    ctx.font = `bold ${fSize}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillText(f.text, f.x + 1, f.y + 1);
    ctx.fillStyle = f.color || '#fff';
    ctx.fillText(f.text, f.x, f.y);
    ctx.restore();
    i++;
  }

  // Target
  target.scale += (1 - target.scale) * snap;

  if (shake > 0) {
    shakeOx = (Math.random() * 2 - 1) * shake;
    shakeOy = (Math.random() * 2 - 1) * shake;
    shake *= Math.exp(-SETTLE_K * dt);
    if (shake < 0.4) { shake = 0; shakeOx = 0; shakeOy = 0; }
  }

  // Combined CSS transform: shake offset + zoom punch decay.
  const punchAge = now - _punchAt;
  const punchFactor = punchAge < PUNCH_MS ? (1 - punchAge / PUNCH_MS) : 0;
  const curScale = 1 + (_punchScale - 1) * punchFactor;
  if (shake > 0 || punchFactor > 0) {
    canvas.style.transform = `translate(${shakeOx.toFixed(2)}px, ${shakeOy.toFixed(2)}px) scale(${curScale.toFixed(4)})`;
  } else if (canvas.style.transform) {
    canvas.style.transform = '';
  }

  ctx.save();
  ctx.translate(target.x, target.y);
  ctx.scale(target.scale, target.scale);
  ctx.globalAlpha = ballAlpha;  // cleared by restore()
  const r = target.r;

  const pulseR = r * (1.3 + 0.12 * Math.sin(_globalTime * 5));
  ctx.strokeStyle = `rgba(255,130,160,${(0.15 + 0.1 * Math.sin(_globalTime * 5)).toFixed(2)})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
  ctx.stroke();

  // Contact shadow (squashed circular gradient → soft ellipse)
  ctx.save();
  ctx.translate(0, r * 0.95);
  ctx.scale(1, 0.32);
  ctx.fillStyle = target.shadowGrad || 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Sphere body
  ctx.fillStyle = target.bodyGrad || '#ff5e6e';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Rim light on the shadowed side
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(255,200,220,0.35)';
  ctx.beginPath();
  ctx.arc(0, 0, r - 1, -0.15 * Math.PI, 0.65 * Math.PI);
  ctx.stroke();

  // Soft specular
  ctx.fillStyle = target.specGrad || 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.arc(-r * 0.38, -r * 0.42, r * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Round timer in the center. Dark outline is load-bearing: near 0s the hsl fill is red on a red sphere.
  const fs = Math.round(r * 1.05);
  const secs = Math.ceil(timeLeft);
  ctx.globalAlpha = textAlpha;
  ctx.font = `900 ${fs}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = fs * 0.14;
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.strokeText(secs, 0, fs * 0.05);
  ctx.fillStyle = timeColor(timeLeft);
  ctx.fillText(secs, 0, fs * 0.05);

  ctx.restore();

  requestAnimationFrame(updateAndDraw);
}

// --- UI wiring ---
// Modals are native <dialog>: showModal() gives Esc, focus trap/restore, backdrop and a11y for free.
guideToggle.addEventListener('click', () => guideOverlay.showModal());
guideClose.addEventListener('click', () => guideOverlay.close());
recordsToggle.innerHTML = svgIcon('trophy');
recordsToggle.addEventListener('click', () => {
  renderTop5(top5ListEl);
  renderAchievements(achievementsListEl);
  recordsOverlay.showModal();
});
recordsClose.addEventListener('click', () => recordsOverlay.close());
// Backdrop click closes: the card is the dialog's only child, so a click whose target is the
// dialog itself landed outside the card. Result overlay covers the playfield → any tap dismisses.
for (const dlg of [guideOverlay, recordsOverlay]) {
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
}
resultOverlay.addEventListener('click', () => resultOverlay.close());

// Sound toggle
let soundEnabled = getSoundPref();
function updateSoundUI() {
  soundToggleEl.innerHTML = svgIcon(soundEnabled ? 'volume' : 'volume-x');
  soundToggleEl.classList.toggle('muted', !soundEnabled);
  soundToggleEl.setAttribute('aria-pressed', (!soundEnabled).toString());
}
function setSoundEnabled(v) {
  soundEnabled = !!v;
  setSoundPref(soundEnabled);
  setMuted(!soundEnabled);
  updateSoundUI();
}
soundToggleEl.addEventListener('click', () => {
  setSoundEnabled(!soundEnabled);
  if (!soundEnabled) unlockAchievement('sound_toggle');
});

// Init audio & apply saved sound pref
initAudio();
setSoundEnabled(soundEnabled);

// Canvas input — pointerdown unifies mouse/touch/pen with no double-fire (touch-action:none in CSS).
// No isPrimary check: two-thumb alternating taps overlap, and the second finger is non-primary.
canvas.addEventListener('pointerdown', (e) => {
  if (e.button === 0) onCanvasClick(e);
});
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// Start button → countdown → startGame
startBtn.addEventListener('click', () => {
  if (running || countdownTimer != null) return; // re-entry guard
  unlockAudio();
  overlay.classList.add('active');
  startBtn.style.display = 'none';
  countdownEl.style.display = 'flex';
  let n = 3;
  const showDigit = (v) => { countdownEl.textContent = v; animatePop(countdownEl, 1.6); playSfx('tick'); };
  showDigit(n);
  countdownTimer = setInterval(() => {
    n--;
    if (n > 0) { showDigit(n); return; }
    clearInterval(countdownTimer);
    countdownTimer = null;
    overlay.classList.remove('active');  // before startGame: .countdown then inherits pointer-events:none
    startGame();
    // "GO!" flashes over the live round. No timer: clearAllTimers()/re-entry guard stay unaffected.
    countdownEl.textContent = t('go');
    playSfx('go');
    countdownEl.animate(
      [{ transform: 'scale(1.6)', opacity: 1 }, { transform: 'scale(1)', opacity: 1, offset: 0.35 }, { opacity: 0 }],
      { duration: 550 }
    ).onfinish = () => { countdownEl.style.display = 'none'; };
  }, 1000);
});

// Pause: rAF stops while hidden; zeroing the clock makes the first frame back a dt = 0 re-sync
// instead of a clamped 0.1s jump. Audio is suspended for the same span.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) _lastTime = 0;
  pauseAudio(document.hidden);
});

// Initialize view
resizeCanvas();
setStartLabel();
highEl.textContent = highscore;
updateHUD();
requestAnimationFrame(updateAndDraw);
