import { GEMS, GEM_GAP } from './config.js';

function scaleColor(hex, f) {
  const r = Math.min(255, ((hex >> 16) & 0xff) * f | 0);
  const g = Math.min(255, ((hex >>  8) & 0xff) * f | 0);
  const b = Math.min(255,  (hex        & 0xff) * f | 0);
  return (r << 16) | (g << 8) | b;
}

function nGonPts(n, r, a0) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = a0 + Math.PI * 2 * i / n;
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return pts;
}

function starPts(n, outerR, innerR, a0) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = a0 + Math.PI * i / n;
    pts.push([Math.cos(a) * (i % 2 === 0 ? outerR : innerR),
              Math.sin(a) * (i % 2 === 0 ? outerR : innerR)]);
  }
  return pts;
}

// Vertical ellipse, starting at the bottom tip
function ellipsePts(n, rx, ry) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = Math.PI * 2 * i / n;
    pts.push([Math.sin(t) * rx, Math.cos(t) * ry]);
  }
  return pts;
}

// Superellipse (cushion), corners at 45°
function cushionPts(n, R, e) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = Math.PI * 2 * i / n + Math.PI / 4;
    const cos = Math.cos(t), sin = Math.sin(t);
    pts.push([Math.sign(cos) * Math.pow(Math.abs(cos), e) * R,
              Math.sign(sin) * Math.pow(Math.abs(sin), e) * R]);
  }
  return pts;
}

// Outline of each gem in local px — drives both the sprite and the physics body
const OUTLINES = [
  r => nGonPts(3, r, -Math.PI / 2),
  r => [[0,-r],[r*0.58,0],[0,r],[-r*0.58,0]],
  r => nGonPts(5, r, -Math.PI / 2),
  r => starPts(4, r, r * 0.34, -Math.PI / 4),
  r => nGonPts(6, r, -Math.PI / 6),
  r => ellipsePts(32, r * 0.60, r),
  r => starPts(6, r, r * 0.42, -Math.PI / 2),
  r => nGonPts(8, r, -Math.PI / 8),
  r => starPts(8, r, r * 0.44, -Math.PI / 8),
  r => cushionPts(48, r * 0.76, 0.78),
  r => starPts(12, r, r * 0.54, -Math.PI / 12),
];

export const gemOutline = level => OUTLINES[level - 1](GEMS[level - 1].r);

export function gemVerts(level) {
  const k = 1 + GEM_GAP / GEMS[level - 1].r;
  return gemOutline(level).map(([x, y]) => ({ x: x * k, y: y * k }));
}

function gfxPoly(gfx, pts) {
  gfx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) gfx.lineTo(pts[i][0], pts[i][1]);
  gfx.closePath();
}

function fill(g, pts, col, alpha) {
  g.beginFill(col, alpha); gfxPoly(g, pts); g.endFill();
}

function addStar(g, cx, cy, size, color, alpha) {
  const nib = size * 0.10;
  fill(g, [
    [cx, cy - size], [cx + nib, cy - nib],
    [cx + size, cy], [cx + nib, cy + nib],
    [cx, cy + size], [cx - nib, cy + nib],
    [cx - size, cy], [cx - nib, cy - nib],
  ], color, alpha);
}

// Fake light from the upper-left: facets facing it brighten, facets facing away darken
const LX = -0.55, LY = -0.83;
const lit = (col, nx, ny) => scaleColor(col, 0.95 + 0.45 * (nx * LX + ny * LY));

// Cut-gem look shared by every shape: shaded crown facets between the outline and a
// smaller "table" polygon, flat bright table with a lighter core, facet lines, bright rim, glassy shine.
function drawGem(g, pts, r, col) {
  const n = pts.length;
  const inner = pts.map(([x, y]) => [x * 0.55, y * 0.55]);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const mx = (pts[i][0] + pts[j][0]) / 2, my = (pts[i][1] + pts[j][1]) / 2, len = Math.hypot(mx, my) || 1;
    fill(g, [inner[i], pts[i], pts[j], inner[j]], lit(col, mx / len, my / len), 1);
  }
  fill(g, inner, scaleColor(col, 1.18), 1);
  fill(g, inner.map(([x, y]) => [x * 0.55, y * 0.55]), scaleColor(col, 1.4), 0.9);
  // lower-right depth shadow over the table
  fill(g, inner.map(([x, y]) => [x + r * 0.05, y + r * 0.06]), 0x000000, 0.10);
  g.lineStyle(0.8, 0xffffff, 0.18);
  for (let i = 0; i < n; i++) { g.moveTo(inner[i][0], inner[i][1]); g.lineTo(pts[i][0], pts[i][1]); }
  g.lineStyle(1.2, 0xffffff, 0.22); gfxPoly(g, inner);
  g.lineStyle(1.5, scaleColor(col, 1.6), 0.9); gfxPoly(g, pts);
  g.lineStyle(0);
  g.beginFill(0xffffff, 0.42); g.drawEllipse(-r * 0.22, -r * 0.27, r * 0.26, r * 0.13); g.endFill();
}

export function makeBallSprite(level) {
  const { r, color: col, hi } = GEMS[level - 1];
  const c = new PIXI.Container();

  const glowGfx = new PIXI.Graphics();
  glowGfx.beginFill(col, level >= 10 ? 0.28 : 0.15);
  glowGfx.drawCircle(0, 0, r + 8 + (level >= 10 ? 6 : 0));
  glowGfx.endFill();
  c.addChild(glowGfx);
  c.glowRef = glowGfx;

  const g = new PIXI.Graphics();
  drawGem(g, OUTLINES[level - 1](r), r, col);
  if (level >= 7) {
    addStar(g, -r * 0.34, r * 0.28, r * 0.14, 0xffffff, 0.5);
    addStar(g,  r * 0.30, -r * 0.28, r * 0.13, hi, 0.6);
  }
  if (level >= 10) { g.lineStyle(1.8, hi, 0.45); g.drawCircle(0, 0, r + 3); g.lineStyle(0); }
  if (level === 11) {
    g.lineStyle(0.8, 0xffffff, 0.2);
    for (let i = 0; i < 12; i++) {
      const a = Math.PI * 2 * i / 12;
      g.moveTo(Math.cos(a) * r * 0.42, Math.sin(a) * r * 0.42);
      g.lineTo(Math.cos(a) * r * 0.88, Math.sin(a) * r * 0.88);
    }
    g.lineStyle(0);
    addStar(g,  r * 0.44, r * 0.36, r * 0.24, 0xffffff, 0.8);
    addStar(g, -r * 0.08, r * 0.44, r * 0.14, 0xffffff, 0.55);
  }
  c.addChild(g);

  const label = new PIXI.Text(level < 11 ? String(level) : '★', {
    fontFamily: 'Arial Black, Arial', fontWeight: '900',
    fontSize: Math.max(12, r * 0.5), fill: 0xffffff,
    stroke: scaleColor(col, 0.25), strokeThickness: Math.max(2, r * 0.07), lineJoin: 'round',
    dropShadow: true, dropShadowColor: 0x000000, dropShadowBlur: 4, dropShadowDistance: 1, dropShadowAlpha: 0.6,
  });
  label.resolution = 3; // rasterize glyphs at 3x, downsampled on screen → crisp edges at every gem size
  label.anchor.set(0.5);
  c.addChild(label);
  return c;
}
