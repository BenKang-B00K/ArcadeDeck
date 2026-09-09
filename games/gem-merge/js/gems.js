import { GEMS } from './config.js';

export function scaleColor(hex, f) {
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

function gfxPoly(gfx, pts) {
  gfx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) gfx.lineTo(pts[i][0], pts[i][1]);
  gfx.closePath();
}

function polyFill(c, pts, col, alpha) {
  const g = new PIXI.Graphics();
  g.beginFill(col, alpha); gfxPoly(g, pts); g.endFill();
  c.addChild(g);
}

function fanFacets(c, pts, colors, alpha) {
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const g = new PIXI.Graphics();
    g.beginFill(colors[i % colors.length], alpha);
    g.moveTo(0, 0); g.lineTo(pts[i][0], pts[i][1]);
    g.lineTo(pts[(i+1)%n][0], pts[(i+1)%n][1]);
    g.closePath(); g.endFill(); c.addChild(g);
  }
}

function addStar(container, cx, cy, size, color, alpha) {
  const nib = size * 0.10;
  const pts = [
    [cx, cy - size], [cx + nib, cy - nib],
    [cx + size, cy], [cx + nib, cy + nib],
    [cx, cy + size], [cx - nib, cy + nib],
    [cx - size, cy], [cx - nib, cy - nib],
  ];
  const g = new PIXI.Graphics();
  g.beginFill(color, alpha);
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath(); g.endFill();
  container.addChild(g);
}

function shine(c, ex, ey, rw, rh) {
  const g = new PIXI.Graphics();
  g.beginFill(0xffffff, 0.44); g.drawEllipse(ex, ey, rw, rh); g.endFill();
  c.addChild(g);
}

function outlinePoly(c, pts, col, alpha, lw) {
  const g = new PIXI.Graphics();
  g.lineStyle(lw || 1.5, col, alpha || 0.8);
  gfxPoly(g, pts); c.addChild(g);
}

// Lv1: TRILLIANT
function drawGem1(c, r, col, cD, cM, cL, cB) {
  const pts = nGonPts(3, r, -Math.PI / 2);
  fanFacets(c, pts, [cL, cD, cM], 0.92);
  outlinePoly(c, pts, cL, 0.80);
  polyFill(c, nGonPts(3, r * 0.44, -Math.PI / 2), cB, 0.80);
  shine(c, pts[0][0]*0.28, pts[0][1]*0.30, r*0.22, r*0.11);
}

// Lv2: RHOMBUS
function drawGem2(c, r, col, cD, cM, cL, cB) {
  const pts = [[0,-r],[r*0.58,0],[0,r],[-r*0.58,0]];
  fanFacets(c, pts, [cL, cD, cM, cL], 0.92);
  outlinePoly(c, pts, cL, 0.80);
  polyFill(c, [[0,-r*0.42],[r*0.26,0],[0,r*0.42],[-r*0.26,0]], cB, 0.80);
  shine(c, -r*0.08, -r*0.28, r*0.18, r*0.10);
}

// Lv3: PENTAGON
function drawGem3(c, r, col, cD, cM, cL, cB) {
  const A0 = -Math.PI / 2;
  const pts = nGonPts(5, r, A0);
  fanFacets(c, pts, [cL, cD, cM, cD, cL], 0.92);
  outlinePoly(c, pts, cL, 0.78);
  polyFill(c, nGonPts(5, r * 0.44, A0), cB, 0.80);
  polyFill(c, nGonPts(5, r * 0.22, A0), cB, 0.55);
  const sh = pts[0]; shine(c, sh[0]*0.28, sh[1]*0.28, r*0.20, r*0.11);
}

// Lv4: 4-POINTED STAR
function drawGem4(c, r, col, cD, cM, cL, cB) {
  const pts = starPts(4, r, r * 0.34, -Math.PI / 4);
  fanFacets(c, pts, [cL, cD], 0.92);
  outlinePoly(c, pts, cL, 0.80);
  polyFill(c, starPts(4, r*0.38, r*0.13, -Math.PI/4), cB, 0.80);
  shine(c, -r*0.22, -r*0.22, r*0.20, r*0.10);
}

// Lv5: HEXAGON
function drawGem5(c, r, col, cD, cM, cL, cB) {
  const A0 = -Math.PI / 6;
  const pts = nGonPts(6, r, A0);
  fanFacets(c, pts, [cL, cM, cD], 0.92);
  outlinePoly(c, pts, cL, 0.82);
  polyFill(c, nGonPts(6, r * 0.46, A0), cB, 0.80);
  polyFill(c, nGonPts(6, r * 0.24, A0), cB, 0.55);
  shine(c, -r*0.15, -r*0.28, r*0.24, r*0.12);
}

// Lv6: MARQUISE
function drawGem6(c, r, col, cD, cM, cL, cB) {
  const N = 32;
  const outerPts = [], innerPts = [];
  for (let i = 0; i < N; i++) {
    const t = Math.PI * 2 * i / N;
    outerPts.push([Math.sin(t)*r*0.60, Math.cos(t)*r]);
    innerPts.push([Math.sin(t)*r*0.26, Math.cos(t)*r*0.48]);
  }
  const gL = new PIXI.Graphics();
  gL.beginFill(cD, 0.92); gL.moveTo(0, -r);
  for (let i = 0; i <= N/2; i++) gL.lineTo(outerPts[i][0], outerPts[i][1]);
  gL.closePath(); gL.endFill(); c.addChild(gL);
  const gR = new PIXI.Graphics();
  gR.beginFill(cL, 0.92); gR.moveTo(0, -r);
  for (let i = N/2; i < N; i++) gR.lineTo(outerPts[i][0], outerPts[i][1]);
  gR.lineTo(outerPts[0][0], outerPts[0][1]); gR.closePath(); gR.endFill(); c.addChild(gR);
  const mO = new PIXI.Graphics(); mO.lineStyle(1.5, cL, 0.80);
  mO.moveTo(outerPts[0][0], outerPts[0][1]);
  for (let i = 1; i < outerPts.length; i++) mO.lineTo(outerPts[i][0], outerPts[i][1]);
  mO.closePath(); c.addChild(mO);
  const tg = new PIXI.Graphics(); tg.beginFill(cB, 0.80);
  tg.moveTo(innerPts[0][0], innerPts[0][1]);
  for (let i = 1; i < innerPts.length; i++) tg.lineTo(innerPts[i][0], innerPts[i][1]);
  tg.closePath(); tg.endFill(); c.addChild(tg);
  shine(c, -r*0.08, -r*0.32, r*0.14, r*0.22);
}

// Lv7: 6-POINTED STAR
function drawGem7(c, r, col, cD, cM, cL, cB) {
  const pts = starPts(6, r, r * 0.42, -Math.PI / 2);
  fanFacets(c, pts, [cL, cD], 0.92);
  outlinePoly(c, pts, cL, 0.78);
  polyFill(c, nGonPts(6, r * 0.38, -Math.PI / 6), cB, 0.80);
  shine(c, -r*0.20, -r*0.28, r*0.22, r*0.12);
  addStar(c, r*0.32, -r*0.30, r*0.14, 0xffffff, 0.55);
}

// Lv8: OCTAGON
function drawGem8(c, r, col, cD, cM, cL, cB) {
  const pts = nGonPts(8, r, -Math.PI / 8);
  fanFacets(c, pts, [cL, cM, cD, cM], 0.92);
  outlinePoly(c, pts, cL, 0.82);
  polyFill(c, nGonPts(8, r * 0.52, -Math.PI / 8), cB, 0.72);
  polyFill(c, nGonPts(8, r * 0.28, -Math.PI / 8), cB, 0.60);
  shine(c, -r*0.22, -r*0.28, r*0.26, r*0.13);
  addStar(c, -r*0.32, r*0.28, r*0.14, 0xffffff, 0.48);
}

// Lv9: 8-POINTED STAR
function drawGem9(c, r, col, cD, cM, cL, cB, hi) {
  const pts = starPts(8, r, r * 0.44, -Math.PI / 8);
  fanFacets(c, pts, [cL, cD], 0.92);
  outlinePoly(c, pts, cL, 0.78);
  polyFill(c, nGonPts(8, r * 0.36, -Math.PI / 8), cB, 0.80);
  shine(c, -r*0.20, -r*0.26, r*0.22, r*0.12);
  addStar(c, -r*0.34, r*0.28, r*0.15, 0xffffff, 0.52);
  addStar(c,  r*0.30, -r*0.28, r*0.13, hi, 0.60);
}

// Lv10: CUSHION CUT
function drawGem10(c, r, col, cD, cM, cL, cB, hi) {
  const N = 48;
  const pts = [];
  for (let i = 0; i < N; i++) {
    const t = Math.PI * 2 * i / N;
    const cos = Math.cos(t + Math.PI/4), sin = Math.sin(t + Math.PI/4);
    pts.push([
      Math.sign(cos) * Math.pow(Math.abs(cos), 0.78) * r * 0.76,
      Math.sign(sin) * Math.pow(Math.abs(sin), 0.78) * r * 0.76,
    ]);
  }
  fanFacets(c, pts, [cL, cM, cD, cM], 0.92);
  const mO = new PIXI.Graphics(); mO.lineStyle(1.5, cL, 0.82);
  mO.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) mO.lineTo(pts[i][0], pts[i][1]);
  mO.closePath(); c.addChild(mO);
  const tg = new PIXI.Graphics(); tg.beginFill(cB, 0.78);
  const tPts = pts.map(([x,y]) => [x*0.48, y*0.48]);
  tg.moveTo(tPts[0][0], tPts[0][1]);
  for (let i = 1; i < tPts.length; i++) tg.lineTo(tPts[i][0], tPts[i][1]);
  tg.closePath(); tg.endFill(); c.addChild(tg);
  const ring = new PIXI.Graphics(); ring.lineStyle(1.8, hi, 0.45); ring.drawCircle(0,0,r+3); c.addChild(ring);
  shine(c, -r*0.22, -r*0.24, r*0.28, r*0.14);
  addStar(c, -r*0.35, r*0.30, r*0.16, 0xffffff, 0.52);
  addStar(c,  r*0.32, -r*0.28, r*0.20, hi, 0.65);
}

// Lv11: LEGENDARY
function drawGem11(c, r, col, cD, cM, cL, cB, hi) {
  const pts = starPts(12, r, r * 0.54, -Math.PI / 12);
  fanFacets(c, pts, [cL, cD], 0.92);
  const mO = new PIXI.Graphics(); mO.lineStyle(1.5, hi, 0.88); gfxPoly(mO, pts); c.addChild(mO);
  const g1 = new PIXI.Graphics(); g1.beginFill(cB, 0.78); g1.drawCircle(0,0,r*0.42); g1.endFill(); c.addChild(g1);
  const g2 = new PIXI.Graphics(); g2.beginFill(scaleColor(hi,1.5), 0.70); g2.drawCircle(0,0,r*0.24); g2.endFill(); c.addChild(g2);
  const r1 = new PIXI.Graphics(); r1.lineStyle(1.6, hi, 0.50); r1.drawCircle(0,0,r+4); c.addChild(r1);
  const r2 = new PIXI.Graphics(); r2.lineStyle(1.0, 0xffffff, 0.28); r2.drawCircle(0,0,r*0.42); c.addChild(r2);
  const fL = new PIXI.Graphics(); fL.lineStyle(0.8, 0xffffff, 0.20);
  for (let i = 0; i < 12; i++) {
    const a = Math.PI * 2 * i / 12;
    fL.moveTo(Math.cos(a)*r*0.42, Math.sin(a)*r*0.42);
    fL.lineTo(Math.cos(a)*r*0.88, Math.sin(a)*r*0.88);
  }
  c.addChild(fL);
  shine(c, -r*0.22, -r*0.28, r*0.36, r*0.20);
  addStar(c,  r*0.44,  r*0.36, r*0.24, 0xffffff, 0.80);
  addStar(c, -r*0.38, -r*0.34, r*0.18, hi, 0.72);
  addStar(c, -r*0.08,  r*0.44, r*0.14, 0xffffff, 0.55);
}

export function makeBallSprite(level) {
  const gem = GEMS[level - 1];
  const r   = gem.r;
  const col = gem.color;
  const hi  = gem.hi;
  const c   = new PIXI.Container();

  const cD = scaleColor(col, 0.38);
  const cM = scaleColor(col, 0.72);
  const cL = scaleColor(col, 1.44);
  const cB = scaleColor(col, 1.82);

  const glowGfx = new PIXI.Graphics();
  glowGfx.beginFill(col, level >= 10 ? 0.28 : 0.15);
  glowGfx.drawCircle(0, 0, r + 8 + (level >= 10 ? 6 : 0));
  glowGfx.endFill();
  c.addChild(glowGfx);
  c.glowRef = glowGfx;

  if      (level ===  1) drawGem1 (c, r, col, cD, cM, cL, cB);
  else if (level ===  2) drawGem2 (c, r, col, cD, cM, cL, cB);
  else if (level ===  3) drawGem3 (c, r, col, cD, cM, cL, cB);
  else if (level ===  4) drawGem4 (c, r, col, cD, cM, cL, cB);
  else if (level ===  5) drawGem5 (c, r, col, cD, cM, cL, cB);
  else if (level ===  6) drawGem6 (c, r, col, cD, cM, cL, cB);
  else if (level ===  7) drawGem7 (c, r, col, cD, cM, cL, cB);
  else if (level ===  8) drawGem8 (c, r, col, cD, cM, cL, cB);
  else if (level ===  9) drawGem9 (c, r, col, cD, cM, cL, cB, hi);
  else if (level === 10) drawGem10(c, r, col, cD, cM, cL, cB, hi);
  else if (level === 11) drawGem11(c, r, col, cD, cM, cL, cB, hi);

  const label = new PIXI.Text(level < 11 ? String(level) : '★', {
    fontFamily: 'Arial Black, Arial', fontWeight: 'bold',
    fontSize: Math.max(11, r * 0.48), fill: 0xffffff,
    dropShadow: true, dropShadowColor: scaleColor(col, 0.22),
    dropShadowDistance: 2, dropShadowAlpha: 0.88,
  });
  label.anchor.set(0.5);
  c.addChild(label);
  return c;
}
