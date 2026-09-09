// Click-target game entry: state, target, VFX, render loop, input.

import {
  migrate,
  getHighscore, setHighscore,
  getLevel, setLevel,
  getSoundPref, setSoundPref,
  addRecord, updateStats,
} from './storage.js';

import {
  initAudio, playHit, startBgm, stopBgm, setMuted, unlockAudio,
} from './audio.js';

import {
  initAchievementsUI, unlockAchievement, checkAchievements,
  renderTop5, renderAchievements,
} from './achievements.js';

migrate();

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
const resultTitleEl = document.getElementById('result-title');
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

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const wrapW = gameWrap.clientWidth || 640;
  if (wrapW < 1) return;
  const maxH = (window.innerHeight || 480) * 0.55;
  const aspect = Math.max(0.5, Math.min(4 / 3, wrapW / maxH));
  CANVAS_W = Math.max(200, Math.round(wrapW));
  CANVAS_H = Math.max(150, Math.round(wrapW / aspect));

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
window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 150));

// --- Constants ---
const START_SECONDS = 15;
const MOVE_INTERVAL = 1000;   // base move interval at level 1
const BASE_RADIUS = 32;
const MIN_RADIUS = 20;
const MIN_HIT_RADIUS = 22;
const MISS_PENALTY = 0.5;

// --- State ---
let score = 0;
let misses = 0;
let highscore = getHighscore();
let level = getLevel();
let timeLeft = START_SECONDS;
let running = false;
let timerId = null;
let autoMoveTimer = null;
let countdownTimer = null;
let _endAt = 0;
let _lastTime = 0;

// Clears all timers/intervals so a stale round can't fire after restart/teardown.
function clearAllTimers() {
  if (timerId != null) { clearInterval(timerId); timerId = null; }
  if (autoMoveTimer != null) { clearTimeout(autoMoveTimer); autoMoveTimer = null; }
  if (countdownTimer != null) { clearInterval(countdownTimer); countdownTimer = null; }
  if (comboTimerId != null) { clearTimeout(comboTimerId); comboTimerId = null; }
}

const target = {
  x: 100, y: 100, r: 30, scale: 1, hitR: 0,
  glowGrad: null, bodyGrad: null,
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

// Combo system: chained hits within COMBO_WINDOW_MS drive VFX intensity.
let combo = 0;
let comboTimerId = null;
const COMBO_WINDOW_MS = 1500;
function bumpCombo() {
  combo++;
  clearTimeout(comboTimerId);
  comboTimerId = setTimeout(() => { combo = 0; }, COMBO_WINDOW_MS);
}
function resetCombo() {
  combo = 0;
  clearTimeout(comboTimerId);
  comboTimerId = null;
}
function comboTier() { return Math.min(5, Math.floor(combo / 3)); } // 0..5
function comboColor(tier) {
  return ['#ffffff','#ffd6ea','#9cfffa','#b58bff','#ffd86b','#ff5e7a'][Math.min(tier, 5)];
}

// Level-up celebration trigger: fires once per round when score first crosses required.
let _passedThisRound = false;

for (let i = 0; i < 30; i++) {
  bgStars.push({
    x: Math.random(), y: Math.random(),
    size: 0.5 + Math.random() * 1.5,
    speed: 0.0002 + Math.random() * 0.0004,
    phase: Math.random() * Math.PI * 2,
    alpha: 0.15 + Math.random() * 0.25,
  });
}

// --- postMessage parent origin resolver ---
// Returns a validated http(s) origin string, or null if none can be determined.
// Never falls back to '*' — refuse to broadcast cross-origin messages without a target.
function isValidHttpOrigin(o) {
  try {
    const u = new URL(o);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    if (!u.hostname || u.hostname === 'null') return false;
    return u.origin === o;
  } catch (e) { return false; }
}
function getParentOrigin() {
  try {
    const host = new URLSearchParams(window.location.search).get('host');
    if (host) {
      const o = new URL(host).origin;
      if (isValidHttpOrigin(o)) return o;
    }
  } catch (e) { console.warn('getParentOrigin: host param parse failed', e); }
  try {
    if (document.referrer) {
      const o = new URL(document.referrer).origin;
      if (isValidHttpOrigin(o)) return o;
    }
  } catch (e) { console.warn('getParentOrigin: referrer parse failed', e); }
  try {
    if (window.location.origin && isValidHttpOrigin(window.location.origin)) {
      return window.location.origin;
    }
  } catch (e) { console.warn('getParentOrigin: window.origin failed', e); }
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
  const minInterval = 300;
  const reduction = 0.93;
  const mult = Math.pow(reduction, Math.max(0, Number(level) - 1));
  return Math.max(minInterval, Math.round(MOVE_INTERVAL * mult));
}

// --- Target ---
function rebuildTargetGradients() {
  const glow = ctx.createRadialGradient(target.x, target.y, target.r * 0.2, target.x, target.y, target.r * 6);
  glow.addColorStop(0,   'rgba(255,110,120,0.25)');
  glow.addColorStop(0.4, 'rgba(150,90,220,0.08)');
  glow.addColorStop(1,   'rgba(0,0,0,0)');
  target.glowGrad = glow;

  const body = ctx.createRadialGradient(0, 0, 0, target.r * 0.8, 0, target.r);
  body.addColorStop(0,    '#fff9f6');
  body.addColorStop(0.25, '#ffdfe5');
  body.addColorStop(1,    '#ff5e6e');
  target.bodyGrad = body;
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

  const interval = getMoveInterval();
  target.ringStart = target.r * 4;
  target.ringR = target.ringStart;
  target.ringLife = 0;
  target.ringTTL = (interval / 1000) * 60;

  rebuildTargetGradients();
}

// --- VFX spawners ---
const BASE_PALETTE = ['#ff5e7a','#ffb86b','#9cfffa','#b58bff','#ffd6f0','#fff'];
const HOT_PALETTE  = ['#ffd86b','#ffaa66','#fffbe5','#ff5e7a','#ffd6ea'];

function spawnParticles(x, y, count = 28, tier = 0) {
  const palette = tier >= 3 ? HOT_PALETTE : BASE_PALETTE;
  const speedBoost = 1 + tier * 0.15;
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 5 + 1.5) * speedBoost;
    const big = Math.random() < 0.25;
    particles.push({
      x, y,
      vx: Math.cos(a) * speed * (big ? 0.6 : 1),
      vy: Math.sin(a) * speed * (big ? 0.6 : 1),
      life: 0,
      ttl: big ? 50 + Math.random() * 30 : 28 + Math.random() * 32,
      size: big ? 2.5 + Math.random() * 2.5 : 0.8 + Math.random() * 2.2,
      color: palette[Math.floor(Math.random() * palette.length)],
      star: Math.random() < (0.3 + tier * 0.05),
    });
  }
}
function spawnRipple(x, y, tier = 0) {
  ripples.push({ x, y, r: 0, alpha: 0.8, color: '255,160,200', growth: 3.5 + tier * 0.6 });
  ripples.push({ x, y, r: 0, alpha: 0.5, color: '150,200,255', delay: 4, growth: 3.0 + tier * 0.5 });
  if (tier >= 3) {
    ripples.push({ x, y, r: 0, alpha: 0.7, color: '255,216,107', delay: 8, growth: 4.0 + tier * 0.5 });
  }
}
function spawnFloat(x, y, text, color, scale = 1.6) {
  floats.push({
    x, y, dy: -1.2 - Math.random() * 0.6, alpha: 1, text,
    color: color || '#fff', life: 0, ttl: 55, scale,
  });
}
function spawnGhost(x, y, r, alpha = 0.5) {
  ghosts.push({ x, y, r, alpha, life: 0, ttl: 30 });
}
// Radial spark lines — short streaks flying outward; brighter at high combo.
function spawnSparkLines(x, y, count = 8, tier = 0) {
  const color = tier >= 2 ? '#ffd86b' : '#ffffff';
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const speed = 6 + Math.random() * 4 + tier * 2;
    sparks.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0, ttl: 18 + tier * 2,
      color,
    });
  }
}
// Red ripple + cross-shaped debris on miss.
function spawnMissBurst(x, y) {
  ripples.push({ x, y, r: 0, alpha: 0.7, color: '255,80,90', growth: 4.0 });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const speed = 3 + Math.random() * 2;
    particles.push({
      x, y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      life: 0, ttl: 26 + Math.random() * 10,
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
  ripples.push({ x: cx, y: cy, r: 0, alpha: 1.0, color: '255,216,107', growth: 6 });
  ripples.push({ x: cx, y: cy, r: 0, alpha: 0.7, color: '255,255,255', delay: 6, growth: 5 });
  spawnFloat(cx, cy - 36, 'CLEARED!', '#ffd86b', 2.4);
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
  playHit(1 + tier * 0.05);
  shake = 8 + tier * 1.5;
  target.scale = 1.8 + tier * 0.08;
  cameraPunch(1.02 + tier * 0.008);
  scheduleAutoMove();
}

function scheduleAutoMove() {
  clearTimeout(autoMoveTimer);
  autoMoveTimer = setTimeout(() => {
    if (!running) return;
    placeTarget();
    scheduleAutoMove();
  }, getMoveInterval());
}

// --- HUD ---
let _prevScore = score;
let _prevTime = Math.ceil(timeLeft);

function hexToRgb(hex) {
  hex = hex.replace('#','');
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbStr(rgb) { return `rgb(${Math.round(rgb[0])},${Math.round(rgb[1])},${Math.round(rgb[2])})`; }
function mixColors(a, b, t) {
  const ra = hexToRgb(a), rb = hexToRgb(b);
  return rgbStr([ra[0] + (rb[0] - ra[0]) * t, ra[1] + (rb[1] - ra[1]) * t, ra[2] + (rb[2] - ra[2]) * t]);
}
function timeColor(fraction) {
  fraction = Math.max(0, Math.min(1, fraction));
  return fraction > 0.5
    ? mixColors('#ffd86b', '#6eff88', (fraction - 0.5) * 2)
    : mixColors('#ff5e6e', '#ffd86b', fraction * 2);
}

function animatePop(el) {
  if (!el) return;
  el.classList.remove('hud-pop');
  void el.offsetWidth; // restart CSS transition on rapid changes
  el.classList.add('hud-pop');
  clearTimeout(el._popTimer);
  el._popTimer = setTimeout(() => el.classList.remove('hud-pop'), 260);
}

function updateHUD() {
  if (levelEl) levelEl.textContent = level;
  scoreEl.textContent = score;
  if (score !== _prevScore) { animatePop(scoreEl); _prevScore = score; }
  const tCeil = Math.ceil(timeLeft);
  timeEl.textContent = timeLeft.toFixed(1);
  timeEl.style.color = timeColor(Math.max(0, Math.min(1, timeLeft / START_SECONDS)));
  if (tCeil !== _prevTime) { animatePop(timeEl); _prevTime = tCeil; }
  highEl.textContent = highscore;
}

// --- End-of-round messaging ---
function computeLevel(s, required) {
  if (s <= 0) return { title: 'No Hits',      msg: 'Give it another go — warm up and aim for a few hits!' };
  const ratio = required > 0 ? s / required : 0;
  if (ratio < 0.4)  return { title: 'Beginner',     msg: 'Not bad — practice will improve your speed and accuracy.' };
  if (ratio < 0.7)  return { title: 'Skilled',      msg: 'Nice work — you have good aim!' };
  if (ratio < 1.0)  return { title: 'Sharpshooter', msg: 'So close! Just a couple more clicks next round.' };
  if (ratio < 1.5)  return { title: 'Legendary',    msg: 'Amazing — you dominated the 15 seconds!' };
  return { title: 'Immortal', msg: 'Inhuman reflexes. Truly unstoppable.' };
}

function endGame() {
  running = false;
  clearAllTimers();
  startBtn.disabled = false;
  stopBgm();

  const required = getRequiredScore();
  const passed = score >= required;
  const finalTimeRemaining = timeLeft;
  const playedLevel = Number(level);

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

  const result = computeLevel(score, required);
  if (resultOverlay) {
    resultTitleEl.textContent = result.title;
    resultMsgEl.textContent = result.msg;
    resultScoreEl.textContent = `Clicks: ${score}/${required}  |  Next: Level ${level}`;
    resultOverlay.style.display = 'flex';
    resultOverlay.classList.add('active');
    resultOverlay.setAttribute('aria-hidden', 'false');
    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      resultOverlay.classList.remove('active');
      resultOverlay.setAttribute('aria-hidden', 'true');
      resultOverlay.style.display = 'none';
      resultOverlay.removeEventListener('click', dismiss);
      startBtn.textContent = `Start Level ${level}`;
      startBtn.style.display = 'inline-block';
    };
    resultOverlay.addEventListener('click', dismiss);
    setTimeout(dismiss, 2500);
  } else {
    startBtn.textContent = `Start Level ${level}`;
    startBtn.style.display = 'inline-block';
  }

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

  if (overlay) overlay.classList.remove('active');
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

  _endAt = performance.now() + START_SECONDS * 1000;
  timerId = setInterval(() => {
    timeLeft = Math.max(0, (_endAt - performance.now()) / 1000);
    canvas.classList.toggle('urgent', timeLeft <= 5 && timeLeft > 0);
    if (timeLeft <= 0) {
      timeLeft = 0;
      canvas.classList.remove('urgent');
      endGame();
      return;
    }
    updateHUD();
  }, 50);
  scheduleAutoMove();
}

// --- Input ---
let shakeOx = 0, shakeOy = 0;

function canvasPosFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const x = (clientX - rect.left + shakeOx) * (CANVAS_W / rect.width);
  const y = (clientY - rect.top  + shakeOy) * (CANVAS_H / rect.height);
  return { x, y };
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
    _endAt -= MISS_PENALTY * 1000;
    const hadCombo = combo;
    resetCombo();
    spawnFloat(pos.x, pos.y, `-${MISS_PENALTY}s`, '#ff5e6e');
    if (hadCombo >= 3) spawnFloat(pos.x, pos.y - 20, 'COMBO LOST', '#ff8a96', 1.4);
    spawnMissBurst(pos.x, pos.y);
    shake = hadCombo >= 3 ? 7 : 5;
  }
  updateHUD();
}

// --- Render loop ---
function updateAndDraw(now) {
  if (!_lastTime) { _lastTime = now; requestAnimationFrame(updateAndDraw); return; }
  const dt = Math.min((now - _lastTime) / 1000, 0.1);
  _lastTime = now;
  const s = dt * 60;

  ctx.globalCompositeOperation = 'source-over';
  const trailAlpha = 1 - Math.pow(1 - 0.18, s);
  ctx.fillStyle = `rgba(6,8,18,${trailAlpha.toFixed(4)})`;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  _globalTime += dt;

  if (!running) {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    requestAnimationFrame(updateAndDraw);
    return;
  }

  // Background stars — brightness scales with combo for reactive feel.
  ctx.globalCompositeOperation = 'lighter';
  const starBoost = 1 + Math.min(0.8, combo * 0.08);
  for (const star of bgStars) {
    star.y -= star.speed * s * (1 + Math.min(0.5, combo * 0.05));
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
    g.life += s;
    g.alpha -= 0.025 * s;
    if (g.alpha <= 0 || g.life > g.ttl) { ghosts[i] = ghosts[ghosts.length - 1]; ghosts.pop(); continue; }
    ctx.globalAlpha = g.alpha * 0.4;
    ctx.strokeStyle = 'rgba(255,160,200,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(g.x, g.y, g.r * (1 + g.life * 0.02), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    i++;
  }

  // Glow
  if (target.glowGrad) {
    const glowPulse = 1 + 0.15 * Math.sin(_globalTime * 4);
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(_globalTime * 3);
    ctx.fillStyle = target.glowGrad;
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.r * 5 * glowPulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Shrinking ring
  if (target.ringTTL > 0 && target.ringLife < target.ringTTL) {
    target.ringLife += s;
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
    p.x += p.vx * s;
    p.y += p.vy * s;
    p.vy += 0.05 * s;
    p.life += s;
    const t = 1 - p.life / p.ttl;
    if (t <= 0) { particles[i] = particles[particles.length - 1]; particles.pop(); continue; }
    ctx.globalAlpha = Math.pow(t, 1.1);
    ctx.fillStyle = p.color;
    const rad = Math.max(0.5, p.size * (0.5 + t * 0.5));
    if (p.star) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.life * 0.1);
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
    if (r.delay && r.delay > 0) { r.delay -= s; i++; continue; }
    const growth = (r.growth != null ? r.growth : 3.5) + score * 0.06;
    r.r += growth * s;
    r.alpha -= 0.022 * s;
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
    sp.life += s;
    sp.x += sp.vx * s;
    sp.y += sp.vy * s;
    sp.vx *= Math.pow(0.92, s);
    sp.vy *= Math.pow(0.92, s);
    const t = 1 - sp.life / sp.ttl;
    if (t <= 0) { sparks[i] = sparks[sparks.length - 1]; sparks.pop(); continue; }
    ctx.globalAlpha = t;
    ctx.strokeStyle = sp.color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(sp.x, sp.y);
    ctx.lineTo(sp.x - sp.vx * 0.6, sp.y - sp.vy * 0.6);
    ctx.stroke();
    i++;
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  // Floats
  for (let i = 0; i < floats.length; ) {
    const f = floats[i];
    f.y += f.dy * s;
    f.alpha -= 0.022 * s;
    f.life += s;
    if (f.scale > 1) f.scale += (1 - f.scale) * (1 - Math.pow(0.85, s));
    if (f.alpha <= 0 || f.life > f.ttl) { floats[i] = floats[floats.length - 1]; floats.pop(); continue; }
    ctx.save();
    ctx.globalAlpha = Math.max(0, f.alpha);
    const fSize = Math.round(16 * (f.scale || 1));
    ctx.font = `bold ${fSize}px system-ui, Arial`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillText(f.text, f.x + 1, f.y + 1);
    ctx.fillStyle = f.color || '#fff';
    ctx.fillText(f.text, f.x, f.y);
    ctx.restore();
    i++;
  }

  // Target
  target.scale += (1 - target.scale) * (1 - Math.pow(1 - 0.18, s));

  if (shake > 0) {
    shakeOx = (Math.random() * 2 - 1) * shake;
    shakeOy = (Math.random() * 2 - 1) * shake;
    shake *= Math.pow(0.85, s);
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

  const pulseR = target.r * (1.3 + 0.12 * Math.sin(_globalTime * 5));
  ctx.strokeStyle = `rgba(255,130,160,${(0.15 + 0.1 * Math.sin(_globalTime * 5)).toFixed(2)})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = target.bodyGrad || '#ff5e6e';
  ctx.beginPath();
  ctx.arc(0, 0, target.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255,110,130,0.9)';
  ctx.beginPath();
  ctx.arc(0, 0, target.r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(-target.r * 0.3, -target.r * 0.35, target.r * 0.28, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(target.r * 0.15, target.r * 0.2, target.r * 0.1, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fill();

  ctx.restore();

  requestAnimationFrame(updateAndDraw);
}

// --- UI wiring ---
let _lastFocusedBeforeModal = null;
function setModalState(el, show) {
  if (!el) return;
  el.classList.toggle('active', show);
  el.setAttribute('aria-hidden', show ? 'false' : 'true');
}
function openModal(el, focusEl) {
  if (!el) return;
  _lastFocusedBeforeModal = document.activeElement;
  setModalState(el, true);
  if (focusEl && typeof focusEl.focus === 'function') {
    try { focusEl.focus(); } catch (e) { console.warn('modal focus failed', e); }
  }
}
function closeModal(el) {
  if (!el) return;
  setModalState(el, false);
  if (_lastFocusedBeforeModal && typeof _lastFocusedBeforeModal.focus === 'function') {
    try { _lastFocusedBeforeModal.focus(); } catch (e) { console.warn('restore focus failed', e); }
  }
  _lastFocusedBeforeModal = null;
}

function toggleGuide(show) {
  if (show) openModal(guideOverlay, guideClose);
  else closeModal(guideOverlay);
}
if (guideToggle) guideToggle.addEventListener('click', () => toggleGuide(true));
if (guideClose)  guideClose.addEventListener('click', () => toggleGuide(false));
if (guideOverlay) guideOverlay.addEventListener('click', (e) => {
  if (e.target === guideOverlay) toggleGuide(false);
});

function toggleRecords(show) {
  if (!recordsOverlay) return;
  if (show) {
    renderTop5(top5ListEl);
    renderAchievements(achievementsListEl);
    openModal(recordsOverlay, recordsClose);
  } else {
    closeModal(recordsOverlay);
  }
}
if (recordsToggle) recordsToggle.addEventListener('click', () => toggleRecords(true));
if (recordsClose)  recordsClose.addEventListener('click', () => toggleRecords(false));
if (recordsOverlay) recordsOverlay.addEventListener('click', (e) => {
  if (e.target === recordsOverlay) toggleRecords(false);
});

// Esc closes any open modal.
window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (guideOverlay && guideOverlay.classList.contains('active')) toggleGuide(false);
  else if (recordsOverlay && recordsOverlay.classList.contains('active')) toggleRecords(false);
});

// Sound toggle
let soundEnabled = getSoundPref();
function updateSoundUI() {
  if (!soundToggleEl) return;
  soundToggleEl.textContent = soundEnabled ? '🔊' : '🔇';
  soundToggleEl.classList.toggle('muted', !soundEnabled);
  soundToggleEl.setAttribute('aria-pressed', (!soundEnabled).toString());
}
function setSoundEnabled(v) {
  soundEnabled = !!v;
  setSoundPref(soundEnabled);
  setMuted(!soundEnabled);
  updateSoundUI();
}
if (soundToggleEl) soundToggleEl.addEventListener('click', () => {
  setSoundEnabled(!soundEnabled);
  if (!soundEnabled) unlockAchievement('sound_toggle');
});

// Init audio & apply saved sound pref
initAudio();
try { setSoundEnabled(soundEnabled); } catch (e) { console.warn('initial setSoundEnabled failed', e); updateSoundUI(); }

// Canvas input — prevent double-fire on mobile (touchstart + click)
let lastTouchTime = 0;
let lastInputTime = 0;
const INPUT_THROTTLE = 60;
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (e.touches.length > 1) return;
  const now = Date.now();
  if (now - lastInputTime < INPUT_THROTTLE) return;
  lastInputTime = now;
  lastTouchTime = now;
  onCanvasClick(e);
}, { passive: false });
canvas.addEventListener('click', (e) => {
  if (Date.now() - lastTouchTime < 500) return;
  const now = Date.now();
  if (now - lastInputTime < INPUT_THROTTLE) return;
  lastInputTime = now;
  onCanvasClick(e);
});
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// Start button → countdown → startGame
startBtn.addEventListener('click', () => {
  if (running || countdownTimer != null) return; // re-entry guard
  unlockAudio();
  overlay.classList.add('active');
  startBtn.style.display = 'none';
  if (countdownEl) {
    countdownEl.style.display = 'flex';
    let t = 2;
    countdownEl.textContent = t;
    countdownTimer = setInterval(() => {
      t--;
      if (t > 0) {
        countdownEl.textContent = t;
      } else {
        clearInterval(countdownTimer);
        countdownTimer = null;
        countdownEl.style.display = 'none';
        overlay.classList.remove('active');
        startBtn.textContent = 'Start';
        startGame();
      }
    }, 1000);
  } else {
    overlay.classList.remove('active');
    startBtn.textContent = 'Start';
    startGame();
  }
});

// Initialize view
resizeCanvas();
if (level > 1) startBtn.textContent = `Start Level ${level}`;
highEl.textContent = highscore;
updateHUD();
requestAnimationFrame(updateAndDraw);
