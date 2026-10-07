import { GEMS, W, H, WT } from './config.js';
import { S } from './state.js';
import { layerFX } from './renderer.js';
import { playLand } from './audio.js';

const MAX_PARTICLES = 400;
const FX_GRAVITY = 648; // px/s²

// Speed streak trailing above a freshly dropped gem; follows the body, stretches with fall speed
export function spawnDropTrail(body, color, r) {
  const g = new PIXI.Graphics();
  const N = 10, seg = Math.min(r * 0.6, 12), w0 = r * 0.9, top = -r * 0.4;
  for (let i = 0; i < N; i++) {
    const k = 1 - i / N, y = top - (i + 1) * seg;
    g.beginFill(color, 0.7 * k);     g.drawRect(-w0 * k / 2, y, w0 * k, seg);     g.endFill();
    g.beginFill(0xffffff, 0.45 * k); g.drawRect(-w0 * k / 6, y, w0 * k / 3, seg); g.endFill();
  }
  g.x = body.position.x; g.y = body.position.y; layerFX.addChild(g);
  S.trails.push({ gfx: g, body, color, r, alpha: 1, decay: 0, age: 0 });
}

// mult scales particle count (combo); total live particles capped so cascades can't pile up
export function burst(x, y, color, level, mult = 1) {
  const useDiamond = level >= 6;
  const count      = Math.min(Math.round((10 + Math.min(level * 2, 16)) * mult), MAX_PARTICLES - S.particles.length);
  const hiColor    = GEMS[Math.min(level - 1, 10)].hi;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i / count) + Math.random() * 0.5;
    const speed = 90 + Math.random() * (150 + level * 15); // px/s
    const r     = 2   + Math.random() * (2   + level * 0.15);
    const col   = i % 3 === 0 ? hiColor : color;
    const gfx   = new PIXI.Graphics();
    if (useDiamond) {
      gfx.beginFill(col, 0.9);
      gfx.moveTo(0,-r*1.7); gfx.lineTo(r,0); gfx.lineTo(0,r*1.7); gfx.lineTo(-r,0);
      gfx.closePath(); gfx.endFill();
      gfx.beginFill(0xffffff, 0.35);
      gfx.moveTo(0,-r*1.7); gfx.lineTo(r*0.5,-r*0.3); gfx.lineTo(0,0); gfx.lineTo(-r*0.5,-r*0.3);
      gfx.closePath(); gfx.endFill();
    } else {
      gfx.beginFill(col); gfx.drawCircle(0,0,r); gfx.endFill();
    }
    gfx.x = x; gfx.y = y; layerFX.addChild(gfx);
    S.particles.push({
      gfx, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed-108,
      alpha: 1, decay: 1.68 + Math.random()*1.5,
      rot: useDiamond ? (Math.random()-0.5)*10.8 : 0,
    });
  }
}

// sy < 1 flattens the ring into an ellipse (landing puff)
export function spawnRing(x, y, color, baseR, sy = 1) {
  const g = new PIXI.Graphics();
  g.lineStyle(2.5, color, 0.9); g.drawCircle(0,0,baseR);
  g.x = x; g.y = y; layerFX.addChild(g);
  S.rings.push({ gfx: g, alpha: 0.9, scale: 1, decay: 2.64, sy });
}

export function spawnFlash(x, y, r = 14) {
  const g = new PIXI.Graphics();
  g.beginFill(0xffffff, 0.78); g.drawCircle(0,0,r); g.endFill();
  g.x = x; g.y = y; layerFX.addChild(g);
  S.flashes.push({ gfx: g, alpha: 0.78, scale: 1, decay: 4.5, growth: 18 });
}

export function spawnScorePopup(x, y, pts) {
  const t = new PIXI.Text(`+${pts}`, {
    fontFamily: 'Arial Black, Arial', fontWeight: 'bold', fontSize: 18 + Math.min(pts / 10, 10),
    fill: [0xffd93d, 0xffb347], fillGradientType: 1,
    dropShadow: true, dropShadowColor: 0x000000,
    dropShadowDistance: 2, dropShadowAlpha: 0.7,
  });
  t.anchor.set(0.5, 1); t.y = y - 8; layerFX.addChild(t);
  t.x = Math.max(WT + t.width / 2, Math.min(W - WT - t.width / 2, x)); // keep off the walls
  S.popups.push({ gfx: t, vy: -96, alpha: 1, decay: 1.2 });
}

// One-shot FX share a lifecycle: step() moves it, alpha decays, gfx destroyed at 0.
// All rates are per second (decay = alpha lost/s); dt in seconds.
export function tickFade(list, dt, step) {
  for (let i = list.length - 1; i >= 0; i--) {
    const p = list[i]; step(p);
    p.alpha -= p.decay * dt; p.gfx.alpha = Math.max(0, p.alpha);
    if (p.alpha <= 0) { layerFX.removeChild(p.gfx); p.gfx.destroy(); list.splice(i, 1); }
  }
}

export function tickFX(dt) {
  // Delayed FX (legendary waves) count down on game dt, not setTimeout
  for (let i = S.fxTimers.length - 1; i >= 0; i--) {
    const x = S.fxTimers[i];
    if ((x.t -= dt) <= 0) { S.fxTimers.splice(i, 1); x.fn(); }
  }
  tickFade(S.particles, dt, p => {
    p.vy += FX_GRAVITY * dt;
    p.gfx.x += p.vx * dt; p.gfx.y += p.vy * dt; p.gfx.rotation += p.rot * dt;
    if (p.gfx.y > H || p.gfx.x < 0 || p.gfx.x > W) p.alpha = 0; // off-canvas: cull (top excluded, gravity brings them back)
  });
  tickFade(S.rings,   dt, r => r.gfx.scale.set(r.scale += 5.4 * dt, r.scale * r.sy));
  tickFade(S.flashes, dt, f => f.gfx.scale.set(f.scale += f.growth * dt));
  tickFade(S.popups,  dt, p => { p.gfx.y += p.vy * dt; p.vy *= 0.024 ** dt; }); // keeps 2.4% of speed per second
  tickFade(S.trails,  dt, p => {
    const b = p.body, e = S.ballMap.get(b.id);
    if (e) { p.gfx.x = e.sprite.x; p.gfx.y = e.sprite.y; } // follow the interpolated sprite, not the raw body
    p.gfx.scale.y = 1 + Math.max(0, b.velocity.y) * 0.12;
    // alive while still falling; first landing (or merge-away) latches the fast fade and puffs once
    if (!p.decay && !((b.velocity.y > 0.6 || (p.age += dt) < 0.1) && e)) {
      p.decay = 4.8;
      if (e) { spawnRing(b.position.x, b.position.y + p.r * 0.7, p.color, p.r * 0.5, 0.35); playLand(p.r); }
    }
  });
}
