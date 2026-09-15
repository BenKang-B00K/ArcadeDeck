import { W, H, WT, DANGER_Y, TIERS } from './config.js';

export const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export const app = new PIXI.Application({
  width: W, height: H,
  backgroundColor: 0x0d0d20,
  antialias: !isMobile,
  resolution: Math.min(window.devicePixelRatio || 1, 2),
  autoDensity: true,
  powerPreference: 'high-performance',
});
document.getElementById('game-container').appendChild(app.view);

const layerBG    = new PIXI.Container();
export const layerBalls = new PIXI.Container();
export const layerFX    = new PIXI.Container();
export const layerGuide = new PIXI.Container();
app.stage.addChild(layerBG, layerBalls, layerFX, layerGuide);

// ── Play field
const bgField = new PIXI.Graphics();
bgField.beginFill(0x0b0b20);
bgField.drawRect(WT, 0, W - WT * 2, H - WT);
bgField.endFill();
layerBG.addChild(bgField);

// ── Tier overlay (pulsing colored tint, redrawn on tier change)
export const bgOverlay = new PIXI.Graphics();
bgOverlay.alpha = 0;
layerBG.addChild(bgOverlay);

export function rebuildOverlay(tier) {
  bgOverlay.clear();
  if (tier === 0) return;
  bgOverlay.beginFill(TIERS[tier].overlay, TIERS[tier].overlayMax);
  bgOverlay.drawRect(WT, 0, W - WT * 2, H - WT);
  bgOverlay.endFill();
}

// ── Gradient overlay (canvas texture)
{
  const gc = document.createElement('canvas');
  gc.width = 2; gc.height = H;
  const gctx = gc.getContext('2d');
  const grd  = gctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0,    'rgba(30,0,70,0.55)');
  grd.addColorStop(0.28, 'rgba(0,0,0,0.04)');
  grd.addColorStop(0.75, 'rgba(0,0,0,0.02)');
  grd.addColorStop(1,    'rgba(0,0,40,0.40)');
  gctx.fillStyle = grd; gctx.fillRect(0, 0, 2, H);
  const gs = new PIXI.Sprite(PIXI.Texture.from(gc));
  gs.x = WT; gs.y = 0; gs.width = W - WT * 2; gs.height = H;
  layerBG.addChild(gs);
}

// ── Static starfield
const starGfx = new PIXI.Graphics();
for (let i = 0; i < 70; i++) {
  starGfx.beginFill(0xffffff, 0.1 + Math.random() * 0.32);
  starGfx.drawCircle(
    WT + 4 + Math.random() * (W - WT * 2 - 8),
    DANGER_Y + 10 + Math.random() * (H - WT - DANGER_Y - 10),
    0.4 + Math.random() * 0.9
  );
  starGfx.endFill();
}
layerBG.addChild(starGfx);

// ── Twinkling stars
export const twinkles = [];
const TWINKLE_COUNT = isMobile ? 6 : 16;
for (let i = 0; i < TWINKLE_COUNT; i++) {
  const tg = new PIXI.Graphics();
  tg.beginFill(0xffffff, 1);
  tg.drawCircle(
    WT + 6 + Math.random() * (W - WT * 2 - 12),
    DANGER_Y + 20 + Math.random() * (H - WT - DANGER_Y - 20),
    0.7 + Math.random() * 1.3
  );
  tg.endFill();
  layerBG.addChild(tg);
  twinkles.push({ gfx: tg, phase: Math.random() * Math.PI * 2, spd: 0.5 + Math.random() * 1.6 });
}

// ── Wall gem decorations
const wDecGfx = new PIXI.Graphics();
[
  [WT * 0.5, 165, 0x6c5ce7], [WT * 0.5, 330, 0x00cec9], [WT * 0.5, 490, 0xfd79a8],
  [W-WT*0.5, 240, 0x1e90ff], [W-WT*0.5, 395, 0xffd93d], [W-WT*0.5, 540, 0x2ed573],
].forEach(([dx, dy, dc]) => {
  const s = 5;
  wDecGfx.beginFill(dc, 0.5);
  wDecGfx.moveTo(dx, dy - s*1.7); wDecGfx.lineTo(dx + s, dy);
  wDecGfx.lineTo(dx, dy + s*1.7); wDecGfx.lineTo(dx - s, dy);
  wDecGfx.closePath(); wDecGfx.endFill();
  wDecGfx.lineStyle(0.8, 0xffffff, 0.3);
  wDecGfx.moveTo(dx, dy - s*1.7); wDecGfx.lineTo(dx + s, dy);
  wDecGfx.lineTo(dx, dy + s*1.7); wDecGfx.lineTo(dx - s, dy);
  wDecGfx.closePath(); wDecGfx.lineStyle(0);
});
layerBG.addChild(wDecGfx);

// ── Danger line
const dangerGfx = new PIXI.Graphics();
dangerGfx.lineStyle(1.5, 0xff4757, 0.65);
for (let dx = WT; dx < W - WT; dx += 10) {
  dangerGfx.moveTo(dx, DANGER_Y);
  dangerGfx.lineTo(Math.min(dx + 6, W - WT), DANGER_Y);
}
layerBG.addChild(dangerGfx);

const dangerTxt = new PIXI.Text('▲ DANGER', {
  fontFamily: 'Arial', fontSize: 9, fill: 0xff4757, alpha: 0.65,
});
dangerTxt.x = WT + 4; dangerTxt.y = DANGER_Y - dangerTxt.height - 3;
layerBG.addChild(dangerTxt);

// ── Walls
const wallGfx = new PIXI.Graphics();
wallGfx.beginFill(0x080818);
wallGfx.drawRect(0,      0,      WT, H);
wallGfx.drawRect(W - WT, 0,      WT, H);
wallGfx.drawRect(0,      H - WT, W,  WT);
wallGfx.endFill();
wallGfx.lineStyle(1.5, 0x4a90d9, 0.35);
wallGfx.moveTo(WT,     0);      wallGfx.lineTo(WT,     H - WT);
wallGfx.moveTo(W - WT, 0);      wallGfx.lineTo(W - WT, H - WT);
wallGfx.moveTo(WT,     H - WT); wallGfx.lineTo(W - WT, H - WT);
layerBG.addChild(wallGfx);
