import { GEMS, DANGER_Y } from './config.js';
import { S, rndLevel } from './state.js';
import { engine, Body, Events } from './physics.js';
import { burst, spawnRing, spawnFlash, spawnScorePopup } from './fx.js';
import { showTierAnnouncement, checkTier, registerCombo, triggerEdgeFlash, triggerScorePop, triggerLegendarySequence } from './celebration.js';
import { createBall, removeBall } from './balls.js';
import { layerGuide, layerFX, bgOverlay } from './renderer.js';
import { drawGuide } from './input.js';
import { drawNextUI, collectLegendaryGem } from './ui.js';
import { playMerge, playLegendary } from './audio.js';

/* ── Merge collision listener */
Events.on(engine, 'collisionStart', ({ pairs }) => {
  for (const pair of pairs) {
    const { bodyA, bodyB } = pair;
    const bA = S.ballMap.get(bodyA.id), bB = S.ballMap.get(bodyB.id);
    if (!bA || !bB || bA.level !== bB.level) continue;
    if (bA.level === 11) continue; // Lv11 gems live in the vault — cannot merge
    if (S.mergingIds.has(bodyA.id) || S.mergingIds.has(bodyB.id)) continue;
    S.mergingIds.add(bodyA.id); S.mergingIds.add(bodyB.id);
    S.mergeQueue.push({
      idA: bodyA.id, idB: bodyB.id, level: bA.level,
      px: (bodyA.position.x + bodyB.position.x) / 2,
      py: (bodyA.position.y + bodyB.position.y) / 2,
    });
  }
});

Events.on(engine, 'afterUpdate', () => {
  if (!S.mergeQueue.length) return;
  for (const { idA, idB, px, py, level } of S.mergeQueue) {
    if (!S.ballMap.has(idA) || !S.ballMap.has(idB)) continue;
    const color = GEMS[level-1].color, baseR = GEMS[level-1].r;

    if (level === 10) {
      // Two Lv10 gems → Lv11 legendary gem goes straight to vault
      burst(px, py, color, level);
      spawnRing(px, py, color, baseR);
      spawnFlash(px, py);
      removeBall(idA); removeBall(idB);
      playLegendary();
      const pts = 200;
      addScore(pts, GEMS[10].color);
      spawnScorePopup(px, py, pts);
      registerCombo(px, py);
      triggerLegendarySequence(px, py);
      collectLegendaryGem();
    } else {
      burst(px, py, color, level);
      spawnRing(px, py, color, baseR);
      spawnFlash(px, py);
      removeBall(idA); removeBall(idB);
      const nb = createBall(px, py, level + 1);
      Body.setVelocity(nb, { x: 0, y: -1.5 });
      const pts = GEMS[level-1].score;
      playMerge(level);
      addScore(pts, color);
      spawnScorePopup(px, py, pts);
      registerCombo(px, py);
    }
  }
  S.mergeQueue.length = 0; S.mergingIds.clear();
});

export function addScore(pts, color) {
  S.score += pts;
  if (S.score > S.best) { S.best = S.score; localStorage.setItem('gmBest', S.best); }
  document.getElementById('score').textContent = S.score.toLocaleString();
  document.getElementById('best').textContent  = S.best.toLocaleString();
  triggerScorePop();
  triggerEdgeFlash(color || 0xa29bfe);
  checkTier(S.score);
}

export function checkGameOver() {
  const now = Date.now();
  for (const [, e] of S.ballMap) {
    if (now - e.born < 1800) continue;
    const spd = Math.hypot(e.body.velocity.x, e.body.velocity.y);
    if (spd < 0.4 && e.body.position.y - GEMS[e.level-1].r < DANGER_Y) {
      doGameOver(); return;
    }
  }
}

export function doGameOver() {
  if (S.gameOver) return;
  S.gameOver = true;
  layerGuide.removeChildren(); S.guideContainer = null;
  document.getElementById('final-score').textContent = S.score.toLocaleString();
  document.getElementById('overlay').classList.remove('hidden');
  if (window.parent) {
    // ArcadeDeck 통합 전송 규격
    const currentMainPoints = S.best;
    let currentExtraStats = 0;
    for (const [, e] of S.ballMap) { currentExtraStats += e.level; }
    window.parent.postMessage({
      type: 'GAME_OVER',
      score: currentMainPoints,
      subScore: currentExtraStats
    }, '*');
  }
}

export function restart() {
  for (const id of [...S.ballMap.keys()]) removeBall(id);
  S.mergeQueue.length = 0; S.mergingIds.clear();
  [...S.particles, ...S.rings, ...S.flashes, ...S.popups, ...S.announcements, ...S.combos].forEach(p => {
    layerFX.removeChild(p.gfx); p.gfx.destroy();
  });
  S.particles.length = S.rings.length = S.flashes.length = S.popups.length = 0;
  S.announcements.length = S.combos.length = S.screenShakes.length = 0;
  S.score = 0; S.gameOver = false; S.lastDrop = 0;
  S.comboCount = 0; S.lastMergeTime = 0;
  S.currentTier = 0;
  document.body.className = '';
  bgOverlay.clear(); bgOverlay.alpha = 0;
  document.getElementById('score').textContent = '0';
  document.getElementById('overlay').classList.add('hidden');
  S.nextLevel = rndLevel(); drawGuide(); drawNextUI();
}
