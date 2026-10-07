import { GEMS, DANGER_Y, COMBO_TIER_CAP } from './config.js';
import { S, save } from './state.js';
import { engine, Body, Events, now } from './physics.js';
import { burst, spawnRing, spawnFlash, spawnScorePopup } from './fx.js';
import { checkTier, registerCombo, triggerEdgeFlash, triggerScorePop, triggerLegendarySequence } from './celebration.js';
import { createBall, removeBall } from './balls.js';
import { layerGuide, layerFX, bgOverlay } from './renderer.js';
import { drawGuide } from './input.js';
import { collectLegendaryGem } from './ui.js';
import { playMerge, playLegendary } from './audio.js';
import { checkAchievements } from './achievements.js';
import { fmtNum } from './i18n.js';

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
    const gem = GEMS[level - 1];
    // Two Lv10 gems → Lv11 legendary gem goes straight to vault
    const legendary = level === 10;

    registerCombo(px, py);
    burst(px, py, gem.color, level, 1 + 0.35 * Math.min(S.comboCount - 1, 4)); // combo → denser burst
    spawnRing(px, py, gem.color, gem.r);
    spawnFlash(px, py, Math.max(14, gem.r * 0.35));
    if (level >= 7) S.screenShakes.push({ time: 0.13, intensity: 2 + level * 0.4 });
    removeBall(idA); removeBall(idB);
    if (legendary) playLegendary();
    else { playMerge(level); Body.setVelocity(createBall(px, py, level + 1), { x: 0, y: -1.5 }); }

    const pts = legendary ? 200 : gem.score;
    addScore(pts, legendary ? GEMS[10].color : gem.color);
    spawnScorePopup(px, py, pts);
    // combo ×N → next spawn becomes Lv N (never downgrades an earned upgrade)
    if (S.comboCount >= 2) { S.nextLevel = Math.max(S.nextLevel, Math.min(S.comboCount, COMBO_TIER_CAP)); drawGuide(); }
    if (legendary) { triggerLegendarySequence(px, py); collectLegendaryGem(); }
  }
  S.mergeQueue.length = 0; S.mergingIds.clear();
  checkAchievements();
});

function addScore(pts, color) {
  S.score += pts;
  if (S.score > S.best) { S.best = S.score; save('best', S.best); }
  document.getElementById('score').textContent = fmtNum(S.score);
  document.getElementById('best').textContent  = fmtNum(S.best);
  triggerScorePop();
  triggerEdgeFlash(color);
  checkTier(S.score);
}

export function checkGameOver() {
  const tNow = now();
  for (const [, e] of S.ballMap) {
    if (tNow - e.born < 1800) continue;
    const spd = Math.hypot(e.body.velocity.x, e.body.velocity.y);
    if (spd < 0.4 && e.body.bounds.min.y < DANGER_Y) {
      doGameOver(); return;
    }
  }
}

function doGameOver() {
  if (S.gameOver) return;
  S.gameOver = true;
  layerGuide.removeChildren(); S.guideContainer = null;
  document.getElementById('final-score').textContent = fmtNum(S.score);
  document.getElementById('overlay').classList.remove('hidden');
  if (window.parent) {
    // ArcadeDeck 통합 전송 규격
    const currentMainPoints = S.score;
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
  [...S.particles, ...S.rings, ...S.flashes, ...S.popups, ...S.trails, ...S.announcements, ...S.combos].forEach(p => {
    layerFX.removeChild(p.gfx); p.gfx.destroy();
  });
  S.particles.length = S.rings.length = S.flashes.length = S.popups.length = S.trails.length = 0;
  S.announcements.length = S.combos.length = S.screenShakes.length = 0;
  S.fxTimers.length = 0;
  S.score = 0; S.gameOver = false; S.lastDrop = -Infinity;
  S.comboCount = 0; S.lastMergeTime = -Infinity;
  S.currentTier = 0;
  document.body.className = '';
  bgOverlay.clear(); bgOverlay.alpha = 0;
  document.getElementById('score').textContent = '0';
  document.getElementById('overlay').classList.add('hidden');
  S.nextLevel = 1; drawGuide();
}
