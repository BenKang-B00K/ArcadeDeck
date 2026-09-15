import { W, H, WT, DROP_Y, COOLDOWN, GEMS, GEM_GAP } from './config.js';
import { S } from './state.js';
import { app, layerGuide } from './renderer.js';
import { createBall } from './balls.js';
import { gemOutline } from './gems.js';
import { spawnDropTrail } from './fx.js';
import { playDrop } from './audio.js';
import { checkAchievements } from './achievements.js';

export function drawGuide() {
  layerGuide.removeChildren();
  if (S.gameOver) return;
  const gem = GEMS[S.nextLevel - 1];
  S.nextAngle = Math.random() * Math.PI * 2; // preview and the dropped gem share this orientation
  S.guideContainer = new PIXI.Container();

  const lineGfx = new PIXI.Graphics();
  for (let dy = gem.r + 8; dy < H - WT - DROP_Y; dy += 10) {
    lineGfx.lineStyle(1, 0xffffff, 0.06 + 0.04 * Math.sin(dy * 0.1));
    lineGfx.moveTo(0, dy); lineGfx.lineTo(0, dy + 5);
  }
  S.guideContainer.addChild(lineGfx);

  const circ = new PIXI.Graphics();
  circ.lineStyle(2, gem.color, 0.82);
  circ.beginFill(gem.color, 0.18); circ.drawPolygon(gemOutline(S.nextLevel).flat()); circ.endFill();
  circ.rotation = S.nextAngle;
  S.guideContainer.addChild(circ);

  const shineHint = new PIXI.Graphics();
  shineHint.beginFill(0xffffff, 0.15);
  shineHint.drawEllipse(-gem.r*0.22, -gem.r*0.26, gem.r*0.34, gem.r*0.20); shineHint.endFill();
  S.guideContainer.addChild(shineHint);

  const lbl = new PIXI.Text(S.nextLevel < 11 ? String(S.nextLevel) : '★', {
    fontFamily: 'Arial Black, Arial', fontWeight: 'bold',
    fontSize: Math.max(10, gem.r * 0.5), fill: gem.color, alpha: 0.88,
  });
  lbl.anchor.set(0.5);
  S.guideContainer.addChild(lbl);
  S.guideContainer.x = clampX(S.mouseX); S.guideContainer.y = DROP_Y;
  layerGuide.addChild(S.guideContainer);
}

function clampX(x) {
  const r = GEMS[S.nextLevel - 1].r + GEM_GAP;
  return Math.max(WT + r, Math.min(W - WT - r, x));
}

function toCanvasX(clientX) {
  const rect = app.view.getBoundingClientRect();
  return (clientX - rect.left) * (W / rect.width);
}

function dropBall() {
  if (S.gameOver) return;
  const now = Date.now();
  if (now - S.lastDrop < COOLDOWN) return;
  S.lastDrop = now;
  
  const gem = GEMS[S.nextLevel - 1];
  playDrop(S.nextLevel);
  spawnDropTrail(createBall(clampX(S.mouseX), DROP_Y, S.nextLevel, S.nextAngle), gem.color, gem.r);
  S.nextLevel = 1;
  drawGuide();
  checkAchievements();
}

// Pointer Events cover mouse, touch and pen alike; PIXI sets touch-action:none on the canvas so the
// browser never turns a drag into a scroll/zoom. Touch pointers are implicitly captured, so a finger
// that slides off the canvas still drops on release — same as the old touchend behaviour.
function aim(e) {
  if (!e.isPrimary) return;
  S.mouseX = toCanvasX(e.clientX);
  if (S.guideContainer) S.guideContainer.x = clampX(S.mouseX);
}
app.view.addEventListener('pointerdown', aim);
app.view.addEventListener('pointermove', aim);
app.view.addEventListener('pointerup', (e) => {
  if (!e.isPrimary || e.button !== 0) return;
  aim(e); dropBall();
});
