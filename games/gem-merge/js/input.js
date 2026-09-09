import { W, H, WT, DROP_Y, COOLDOWN, GEMS } from './config.js';
import { S, rndLevel } from './state.js';
import { app, layerGuide } from './renderer.js';
import { createBall } from './balls.js';
import { drawNextUI } from './ui.js';
import { spawnDropEffect } from './fx.js';
import { playDrop } from './audio.js';

export function drawGuide() {
  layerGuide.removeChildren();
  if (S.gameOver) return;
  const gem = GEMS[S.nextLevel - 1];
  S.guideContainer = new PIXI.Container();

  const lineGfx = new PIXI.Graphics();
  for (let dy = gem.r + 8; dy < H - WT - DROP_Y; dy += 10) {
    lineGfx.lineStyle(1, 0xffffff, 0.06 + 0.04 * Math.sin(dy * 0.1));
    lineGfx.moveTo(0, dy); lineGfx.lineTo(0, dy + 5);
  }
  S.guideContainer.addChild(lineGfx);

  const ay = H - WT - DROP_Y;
  const arrowGfx = new PIXI.Graphics();
  arrowGfx.beginFill(gem.color, 0.45);
  arrowGfx.moveTo(-5, ay-9); arrowGfx.lineTo(5, ay-9); arrowGfx.lineTo(0, ay);
  arrowGfx.closePath(); arrowGfx.endFill();
  S.guideContainer.addChild(arrowGfx);

  const circ = new PIXI.Graphics();
  circ.lineStyle(2, gem.color, 0.82);
  circ.beginFill(gem.color, 0.18); circ.drawCircle(0,0,gem.r); circ.endFill();
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

export function clampX(x) {
  const r = GEMS[S.nextLevel - 1].r;
  return Math.max(WT + r, Math.min(W - WT - r, x));
}

function toCanvasX(clientX) {
  const rect = app.view.getBoundingClientRect();
  return (clientX - rect.left) * (W / rect.width);
}

export function dropBall() {
  if (S.gameOver) return;
  const now = Date.now();
  if (now - S.lastDrop < COOLDOWN) return;
  S.lastDrop = now;
  
  const x = clampX(S.mouseX);
  const color = GEMS[S.nextLevel - 1].color;
  spawnDropEffect(x, DROP_Y, color);
  playDrop(S.nextLevel);

  createBall(x, DROP_Y, S.nextLevel);
  S.nextLevel = rndLevel();
  drawGuide(); drawNextUI();
}

app.view.addEventListener('mousemove', (e) => {
  S.mouseX = toCanvasX(e.clientX);
  if (S.guideContainer) S.guideContainer.x = clampX(S.mouseX);
});
app.view.addEventListener('click', dropBall);
app.view.addEventListener('touchmove', (e) => {
  e.preventDefault();
  S.mouseX = toCanvasX(e.touches[0].clientX);
  if (S.guideContainer) S.guideContainer.x = clampX(S.mouseX);
}, { passive: false });
app.view.addEventListener('touchend', (e) => {
  e.preventDefault();
  S.mouseX = toCanvasX(e.changedTouches[0].clientX);
  dropBall();
}, { passive: false });
