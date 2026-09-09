import { GEMS, W, H } from './config.js';
import { S } from './state.js';
import { layerFX } from './renderer.js';

export function spawnDropEffect(x, y, color) {
  const container = document.getElementById('game-container');
  const canvas = container.querySelector('canvas');
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  // 캔버스의 실제 렌더링 크기 대비 논리적 좌표(W=400)의 비율 계산
  const scale = rect.width / W;

  // 컨테이너 내부에서의 캔버스 시작점 (패딩 등 고려)
  const offsetX = rect.left - containerRect.left;
  const offsetY = rect.top - containerRect.top;

  // 최종 시각적 좌표
  const vx = offsetX + (x * scale);
  const vy = offsetY + (y * scale);

  const div = document.createElement('div');
  div.className = 'drop-effect';
  div.style.left = `${vx}px`;
  div.style.top  = `${vy}px`;
  
  // 가로 중앙 정렬: SVG 너비가 24이므로 -12px
  div.style.marginLeft = '-12px';

  const colStr = '#' + color.toString(16).padStart(6, '0');
  div.innerHTML = `
    <svg width="24" height="100" viewBox="0 0 24 80" style="overflow:visible; display:block;">
      <defs>
        <linearGradient id="grad-${Date.now()}-${Math.random()}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${colStr};stop-opacity:0" />
          <stop offset="100%" style="stop-color:${colStr};stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <path d="M12 0 L24 80 L12 65 L0 80 Z" fill="url(#grad-${Date.now()}-${Math.random()})" />
    </svg>
  `;

  container.appendChild(div);
  setTimeout(() => div.remove(), 600);
}

export function burst(x, y, color, level) {
  const useDiamond = level >= 6;
  const count      = 10 + Math.min(level * 2, 16);
  const hiColor    = GEMS[Math.min(level - 1, 10)].hi;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i / count) + Math.random() * 0.5;
    const speed = 1.5 + Math.random() * (2.5 + level * 0.25);
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
      gfx, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed-1.8,
      alpha: 1, decay: 0.028 + Math.random()*0.025,
      rot: useDiamond ? (Math.random()-0.5)*0.18 : 0,
    });
  }
}

export function tickParticles() {
  for (let i = S.particles.length - 1; i >= 0; i--) {
    const p = S.particles[i];
    p.gfx.x += p.vx; p.gfx.y += p.vy; p.vy += 0.18;
    p.gfx.rotation += p.rot; p.alpha -= p.decay;
    p.gfx.alpha = Math.max(0, p.alpha);
    if (p.alpha <= 0) { layerFX.removeChild(p.gfx); p.gfx.destroy(); S.particles.splice(i,1); }
  }
}

export function spawnRing(x, y, color, baseR) {
  const g = new PIXI.Graphics();
  g.lineStyle(2.5, color, 0.9); g.drawCircle(0,0,baseR);
  g.x = x; g.y = y; layerFX.addChild(g);
  S.rings.push({ gfx: g, alpha: 0.9, scale: 1, decay: 0.044 });
}

export function tickRings() {
  for (let i = S.rings.length-1; i >= 0; i--) {
    const r = S.rings[i]; r.scale += 0.09; r.gfx.scale.set(r.scale);
    r.alpha -= r.decay; r.gfx.alpha = Math.max(0, r.alpha);
    if (r.alpha <= 0) { layerFX.removeChild(r.gfx); r.gfx.destroy(); S.rings.splice(i,1); }
  }
}

export function spawnFlash(x, y) {
  const g = new PIXI.Graphics();
  g.beginFill(0xffffff, 0.78); g.drawCircle(0,0,14); g.endFill();
  g.x = x; g.y = y; layerFX.addChild(g);
  S.flashes.push({ gfx: g, alpha: 0.78, scale: 1, decay: 0.075, growth: 0.30 });
}

export function tickFlashes() {
  for (let i = S.flashes.length-1; i >= 0; i--) {
    const f = S.flashes[i]; f.scale += f.growth; f.gfx.scale.set(f.scale);
    f.alpha -= f.decay; f.gfx.alpha = Math.max(0, f.alpha);
    if (f.alpha <= 0) { layerFX.removeChild(f.gfx); f.gfx.destroy(); S.flashes.splice(i,1); }
  }
}

export function spawnScorePopup(x, y, pts) {
  const t = new PIXI.Text(`+${pts}`, {
    fontFamily: 'Arial Black, Arial', fontWeight: 'bold', fontSize: 18,
    fill: [0xffd93d, 0xffb347], fillGradientType: 1,
    dropShadow: true, dropShadowColor: 0x000000,
    dropShadowDistance: 2, dropShadowAlpha: 0.7,
  });
  t.anchor.set(0.5, 1); t.x = x; t.y = y - 8; layerFX.addChild(t);
  S.popups.push({ gfx: t, vy: -1.6, alpha: 1, decay: 0.02 });
}

export function tickPopups() {
  for (let i = S.popups.length-1; i >= 0; i--) {
    const p = S.popups[i]; p.gfx.y += p.vy; p.vy *= 0.94;
    p.alpha -= p.decay; p.gfx.alpha = Math.max(0, p.alpha);
    if (p.alpha <= 0) { layerFX.removeChild(p.gfx); p.gfx.destroy(); S.popups.splice(i,1); }
  }
}
