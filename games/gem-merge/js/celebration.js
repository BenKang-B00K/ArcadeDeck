import { W, H, WT, TIERS, COMBO_WINDOW, hexStr } from './config.js';
import { S } from './state.js';
import { layerFX, rebuildOverlay } from './renderer.js';
import { playCombo } from './audio.js';
import { burst, spawnRing, spawnFlash, tickFade } from './fx.js';

function showTierAnnouncement(tier) {
  const isMax = (tier === -1);
  const label = isMax ? '👑 LEGENDARY MAX!' : TIERS[tier].label;
  if (!label) return;
  const txt = new PIXI.Text(label, {
    fontFamily: 'Arial Black, Arial', fontWeight: 'bold',
    fontSize: isMax ? 32 : 26, align: 'center',
    fill: isMax ? [0xf9ca24, 0xffeaa7, 0xf9ca24] : [0xffd93d, 0xffb347, 0xff6b6b],
    fillGradientType: 1,
    stroke: 0x000000, strokeThickness: isMax ? 4 : 3,
    dropShadow: true, dropShadowColor: 0x000000,
    dropShadowDistance: 3, dropShadowAlpha: 0.8,
  });
  txt.anchor.set(0.5); txt.x = W / 2; txt.y = H / 2;
  txt.scale.set(0.4); layerFX.addChild(txt);
  // decay stays 0 through grow/hold; set when fade starts
  S.announcements.push({ gfx: txt, phase: 'grow', holdTimer: 0, alpha: 1, decay: 0 });

  const burstColor = isMax ? 0xf9ca24 : TIERS[tier].overlay;
  const count = isMax ? 40 : 20;
  for (let i = 0; i < count; i++) {
    const angle = Math.PI * 2 * i / count;
    const speed = (isMax ? 5 : 3) + Math.random() * 4;
    const r = (isMax ? 5 : 4) + Math.random() * 4;
    const g = new PIXI.Graphics();
    g.beginFill(burstColor, 0.9);
    g.drawCircle(0, 0, r); g.endFill();
    g.x = W/2; g.y = H/2; layerFX.addChild(g);
    S.particles.push({ gfx: g, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed-2,
      alpha: 1, decay: 0.018, rot: 0 });
  }
}

export function tickAnnouncements() {
  tickFade(S.announcements, a => {
    if (a.phase === 'grow') {
      a.gfx.scale.set(Math.min(1.2, a.gfx.scale.x + 0.07));
      if (a.gfx.scale.x >= 1.2) a.phase = 'hold';
    } else if (a.phase === 'hold') {
      if (++a.holdTimer > 55) { a.phase = 'fade'; a.decay = 0.022; }
    } else {
      a.gfx.y -= 0.4;
    }
  });
}

export function checkTier(newScore) {
  let tier = 0;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (newScore >= TIERS[i].min) { tier = i; break; }
  }
  if (tier !== S.currentTier) {
    S.currentTier = tier;
    rebuildOverlay(tier);
    document.body.className = TIERS[tier].cls;
    showTierAnnouncement(tier);
  }
}

export function registerCombo(px, py) {
  const now = Date.now();
  if (now - S.lastMergeTime < COMBO_WINDOW) {
    S.comboCount++;
    if (S.comboCount >= 2) {
      spawnComboText(px, py, S.comboCount);
      playCombo(S.comboCount);
    }
    if (S.comboCount >= 3) S.screenShakes.push({ frames: 12, intensity: 3 + S.comboCount * 0.5 });
  } else {
    S.comboCount = 1;
  }
  S.lastMergeTime = now;
}

function spawnComboText(x, y, count) {
  const labels = ['', '', 'COMBO!', 'COMBO ×3!', 'COMBO ×4!! 🔥', 'COMBO ×5!!! ⚡'];
  const label  = labels[Math.min(count, labels.length - 1)] || `COMBO ×${count}!!!`;
  const size   = count >= 4 ? 22 : 18;
  const txt = new PIXI.Text(label, {
    fontFamily: 'Arial Black, Arial', fontWeight: 'bold', fontSize: size,
    fill: [0xff6b6b, 0xffd93d], fillGradientType: 1,
    stroke: 0x000000, strokeThickness: 2,
    dropShadow: true, dropShadowDistance: 2, dropShadowAlpha: 0.7,
  });
  txt.anchor.set(0.5, 1);
  txt.y = y - 38; layerFX.addChild(txt);
  txt.x = Math.max(WT + txt.width / 2, Math.min(W - WT - txt.width / 2, x)); // keep off the walls
  S.combos.push({ gfx: txt, vy: -2, alpha: 1, decay: 0.016 });
}

export function tickCombos() {
  tickFade(S.combos, p => { p.gfx.y += p.vy; p.vy *= 0.93; });
}

// Restart a CSS animation class on el; class is removed again when it ends.
export function replayAnim(el, cls) {
  el.classList.remove(cls);
  // Double rAF avoids the forced synchronous reflow of void el.offsetWidth
  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.classList.add(cls);
    el.addEventListener('animationend', () => el.classList.remove(cls), { once: true });
  }));
}

export function triggerEdgeFlash(hexColor) {
  const el = document.getElementById('game-container');
  el.style.setProperty('--flash-color', hexStr(hexColor));
  replayAnim(el, 'edge-flash');
}

export function triggerScorePop() {
  replayAnim(document.getElementById('score'), 'score-pop');
}

export function triggerLegendarySequence(px, py) {
  const gold = 0xf9ca24;
  const cream = 0xfff5b6;

  // 6-wave burst + rings: progressive build-up
  for (let i = 0; i < 6; i++) {
    S.fxTimers.push(setTimeout(() => {
      burst(px, py, gold, 11);
      if (i < 4) burst(px, py, cream, 9);
      spawnRing(px, py, gold,  20 + i * 25);
      if (i % 2 === 0) spawnRing(px, py, 0xffffff, 14 + i * 18);
      spawnFlash(px, py);
    }, i * 130));
  }

  S.screenShakes.push({ frames: 30, intensity: 9 });

  // Pixi-layer announcement text
  showTierAnnouncement(-1);

  // CSS cinematic overlay: leaving display:none restarts its keyframes
  const cinematic = document.getElementById('legendary-cinematic');
  cinematic.classList.remove('hidden');
  cinematic.addEventListener('animationend', () => cinematic.classList.add('hidden'), { once: true });
}
