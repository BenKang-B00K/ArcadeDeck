// obstacle-draw.js — rendering for obstacle subsystem.
// Pure draw layer: no state, no mutation of obstacles. Reads o.* + env helpers.

export function createObstacleDrawer(env) {
  const { ctx, W, getTimeMs, player } = env;

  function roundRect(x, y, w, h, r, fill) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
  }

  function jaggedPath(x0, y0, x1, y1, segs, jitter, seed) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    for (let i = 1; i < segs; i++) {
      const t = i / segs;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;
      const j = (Math.sin(seed + i * 12.9898) * 43758.5453 % 1);
      const offN = (j - Math.floor(j) - 0.5) * 2;
      const dx = x1 - x0, dy = y1 - y0;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len;
      ctx.lineTo(x + nx * offN * jitter, y + ny * offN * jitter);
    }
    ctx.lineTo(x1, y1);
  }

  function drawBar(o, c0, c1, c2, glow) {
    const grd = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.h);
    grd.addColorStop(0, c0);
    grd.addColorStop(0.5, c1);
    grd.addColorStop(1, c2);
    ctx.fillStyle = grd;
    ctx.shadowColor = glow;
    ctx.shadowBlur = 16;
    roundRect(o.x, o.y, o.w, o.h, 5, true);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(o.x + 4, o.y + 2, o.w - 8, 1.5);
  }

  function drawSpike(o, points, big) {
    ctx.save();
    ctx.translate(o.x + o.w / 2, o.y + o.h / 2);
    ctx.rotate(o.spin || 0);
    const grd = ctx.createRadialGradient(0, 0, 2, 0, 0, o.w / 2);
    if (big) {
      grd.addColorStop(0, '#ffe2ff');
      grd.addColorStop(0.5, '#ff7adb');
      grd.addColorStop(1, '#7a1a66');
      ctx.shadowColor = 'rgba(255, 130, 220, 0.9)';
    } else {
      grd.addColorStop(0, '#fff4c8');
      grd.addColorStop(0.5, '#ffcc66');
      grd.addColorStop(1, '#cc7a1a');
      ctx.shadowColor = 'rgba(255, 200, 80, 0.85)';
    }
    ctx.fillStyle = grd;
    ctx.shadowBlur = big ? 22 : 14;
    ctx.beginPath();
    const s = o.w / 2;
    const inner = big ? 0.55 : 0.45;
    for (let i = 0; i < points * 2; i++) {
      const ang = (i / (points * 2)) * Math.PI * 2;
      const r = i % 2 === 0 ? s : s * inner;
      ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
    }
    ctx.closePath();
    ctx.fill();
    if (big) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.arc(0, 0, o.w * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  function drawLaser(o) {
    const timeMs = getTimeMs();
    const grd = ctx.createLinearGradient(o.x, o.y, o.x + o.w, o.y);
    grd.addColorStop(0, '#3a4a6a');
    grd.addColorStop(1, '#1a2235');
    ctx.fillStyle = grd;
    ctx.shadowColor = 'rgba(120, 180, 255, 0.5)';
    ctx.shadowBlur = 10;
    roundRect(o.x, o.y, o.w, o.h, 4, true);
    ctx.shadowBlur = 0;
    const dir = o.side === 'R' ? -1 : 1;
    const ex = dir > 0 ? o.x + o.w - 2 : o.x + 2;
    const ey = o.y + o.h / 2;
    const beamY = ey - o.beamW / 2;
    const beamX = dir > 0 ? ex : 0;
    const beamW = dir > 0 ? W - ex : ex;

    if (o.phase !== 'fire') {
      ctx.strokeStyle = 'rgba(255, 100, 100, 0.18)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(dir > 0 ? W : 0, ey);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (o.phase === 'warn') {
      const pulse = 0.55 + Math.sin(o.t * 0.045) * 0.4;
      ctx.fillStyle = `rgba(255, 60, 60, ${0.08 * pulse})`;
      ctx.fillRect(beamX, beamY - 2, beamW, o.beamW + 4);
      const dashOff = (timeMs * 0.06) % 14;
      ctx.strokeStyle = `rgba(255, 90, 90, ${pulse})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = -dashOff;
      ctx.shadowColor = '#ff4040';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(beamX, beamY); ctx.lineTo(beamX + beamW, beamY);
      ctx.moveTo(beamX, beamY + o.beamW); ctx.lineTo(beamX + beamW, beamY + o.beamW);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.setLineDash([]);
      ctx.lineDashOffset = 0;
      ctx.strokeStyle = `rgba(255, 200, 200, ${pulse * 0.7})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(beamX, ey); ctx.lineTo(beamX + beamW, ey); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(255, ${60 + pulse * 80}, 60, 1)`;
      ctx.shadowColor = '#ff3030';
      ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(ex, ey, 4 + pulse * 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    } else if (o.phase === 'fire') {
      const bg = ctx.createLinearGradient(0, beamY, 0, beamY + o.beamW);
      bg.addColorStop(0, 'rgba(255, 80, 80, 0.35)');
      bg.addColorStop(0.5, '#ffeeee');
      bg.addColorStop(1, 'rgba(255, 80, 80, 0.35)');
      ctx.fillStyle = bg;
      ctx.shadowColor = '#ff4040';
      ctx.shadowBlur = 24;
      ctx.fillRect(beamX, beamY, beamW, o.beamW);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(ex, ey, 6, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(120, 180, 255, 0.6)';
      ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawHoming(o) {
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    ctx.save();
    ctx.translate(cx, cy);
    const grd = ctx.createRadialGradient(0, 0, 2, 0, 0, o.w / 2);
    grd.addColorStop(0, '#fff');
    grd.addColorStop(0.4, '#ff7a7a');
    grd.addColorStop(1, '#6a0a0a');
    ctx.fillStyle = grd;
    ctx.shadowColor = '#ff3030';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, 0, o.w / 2 * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-7, 0); ctx.lineTo(7, 0);
    ctx.moveTo(0, -7); ctx.lineTo(0, 7);
    ctx.stroke();
    ctx.restore();
  }

  function drawRotor(o) {
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(o.angle);
    const grd = ctx.createLinearGradient(-o.w/2, 0, o.w/2, 0);
    grd.addColorStop(0, '#9aff8a');
    grd.addColorStop(0.5, '#39d06a');
    grd.addColorStop(1, '#0a4a28');
    ctx.fillStyle = grd;
    ctx.shadowColor = 'rgba(120, 255, 140, 0.6)';
    ctx.shadowBlur = 14;
    roundRect(-o.w / 2, -o.h / 2, o.w, o.h, 5, true);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a3a1a';
    ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawSaw(o) {
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    const r = o.w / 2;
    ctx.strokeStyle = 'rgba(180, 180, 200, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(W, cy);
    ctx.stroke();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(o.spin);
    ctx.shadowColor = 'rgba(200, 220, 255, 0.8)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#d8dde8';
    ctx.beginPath();
    const teeth = 14;
    for (let i = 0; i < teeth * 2; i++) {
      const ang = (i / (teeth * 2)) * Math.PI * 2;
      const rr = i % 2 === 0 ? r : r * 0.7;
      ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    const hg = ctx.createRadialGradient(0, 0, 2, 0, 0, r * 0.45);
    hg.addColorStop(0, '#fff');
    hg.addColorStop(1, '#7a8aa0');
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a2030';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawSwarmUnit(o) {
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    ctx.save();
    ctx.translate(cx, cy);
    const grd = ctx.createRadialGradient(-2, -2, 1, 0, 0, o.w / 2);
    grd.addColorStop(0, '#ffe0a0');
    grd.addColorStop(0.5, '#ff6a3c');
    grd.addColorStop(1, '#3a0a00');
    ctx.fillStyle = grd;
    ctx.shadowColor = '#ff5520';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, 0, o.w / 2 * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawBomb(o) {
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    if (o.state === 'tick') {
      const k = o.stateT / o.fuse;
      ctx.strokeStyle = `rgba(255, 120, 60, ${0.15 + k * 0.3})`;
      ctx.setLineDash([4, 5]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, o.maxR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      const pulse = 1 + Math.sin(o.stateT * (0.015 + k * 0.04)) * 0.18;
      const r = (o.w / 2) * pulse;
      const grd = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, r);
      grd.addColorStop(0, '#fff');
      grd.addColorStop(0.4, '#ffb020');
      grd.addColorStop(1, '#5a1a00');
      ctx.fillStyle = grd;
      ctx.shadowColor = '#ff5020';
      ctx.shadowBlur = 14 + k * 14;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff7c0';
      ctx.beginPath(); ctx.arc(cx + 4, cy - r - 2, 2 + Math.random(), 0, Math.PI * 2); ctx.fill();
    } else if (o.state === 'boom') {
      const prog = o.stateT / o.boomDur;
      const r = o.maxR * prog;
      const grd = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
      grd.addColorStop(0, `rgba(255, 240, 200, ${1 - prog})`);
      grd.addColorStop(0.6, `rgba(255, 140, 60, ${0.7 * (1 - prog)})`);
      grd.addColorStop(1, 'rgba(120, 30, 0, 0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(255, 200, 120, ${1 - prog})`;
      ctx.lineWidth = 3 * (1 - prog) + 1;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    }
  }

  function drawFrag(o) {
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    ctx.globalAlpha = Math.min(1, o.life * 1.4);
    ctx.strokeStyle = 'rgba(255, 180, 80, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - o.vx * 2, cy - o.vy * 2);
    ctx.lineTo(cx, cy);
    ctx.stroke();
    const grd = ctx.createRadialGradient(cx, cy, 1, cx, cy, 6);
    grd.addColorStop(0, '#fff8c0');
    grd.addColorStop(0.5, '#ff9020');
    grd.addColorStop(1, '#5a1500');
    ctx.fillStyle = grd;
    ctx.shadowColor = '#ff6a20';
    ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawSpinner(o) {
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    ctx.save();
    ctx.translate(cx, cy);

    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = '#ffb060';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, o.armLen, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    const sweepDir = o.vAng > 0 ? 1 : -1;
    for (let i = 0; i < o.arms; i++) {
      const baseAng = o.angle + i * Math.PI;
      ctx.save();
      ctx.rotate(baseAng - sweepDir * 0.35);
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = '#ffb060';
      roundRect(0, -o.armW / 2, o.armLen, o.armW, 4, true);
      ctx.globalAlpha = 1;
      ctx.restore();

      ctx.save();
      ctx.rotate(baseAng);
      const grd = ctx.createLinearGradient(0, 0, o.armLen, 0);
      grd.addColorStop(0, '#e8e0c8');
      grd.addColorStop(0.5, '#c08838');
      grd.addColorStop(1, '#5a2810');
      ctx.fillStyle = grd;
      ctx.shadowColor = 'rgba(255, 180, 80, 0.7)';
      ctx.shadowBlur = 12;
      roundRect(0, -o.armW / 2, o.armLen, o.armW, 4, true);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffd060';
      ctx.beginPath();
      ctx.moveTo(o.armLen, -o.armW / 2 - 4);
      ctx.lineTo(o.armLen + 10, 0);
      ctx.lineTo(o.armLen, o.armW / 2 + 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    const hg = ctx.createRadialGradient(0, 0, 1, 0, 0, 8);
    hg.addColorStop(0, '#ffe8b0');
    hg.addColorStop(1, '#8a5020');
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawPendulum(o) {
    const ax = o.anchorX;
    const ay = o.y + 8;
    const wx = ax + Math.sin(o.angle) * o.armLen;
    const wy = ay + Math.cos(o.angle) * o.armLen;
    ctx.fillStyle = '#3a3548';
    roundRect(ax - 10, o.y, 20, 8, 3, true);
    ctx.fillStyle = '#1a1a25';
    ctx.beginPath(); ctx.arc(ax, ay, 4, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(Math.atan2(wy - ay, wx - ax) - Math.PI / 2);
    const grd = ctx.createLinearGradient(0, 0, 0, o.armLen);
    grd.addColorStop(0, '#9aa0b0');
    grd.addColorStop(1, '#5a5566');
    ctx.fillStyle = grd;
    ctx.shadowColor = 'rgba(180, 180, 220, 0.4)';
    ctx.shadowBlur = 8;
    roundRect(-o.armW / 2, 0, o.armW, o.armLen, 3, true);
    ctx.shadowBlur = 0;
    ctx.restore();
    ctx.save();
    ctx.translate(wx, wy);
    const wg = ctx.createRadialGradient(-4, -4, 2, 0, 0, o.weightR);
    wg.addColorStop(0, '#ffe2b8');
    wg.addColorStop(0.4, '#d06a30');
    wg.addColorStop(1, '#3a0f00');
    ctx.fillStyle = wg;
    ctx.shadowColor = '#ff7a30';
    ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.arc(0, 0, o.weightR, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff6c0';
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * o.weightR * 0.7, Math.sin(a) * o.weightR * 0.7, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawLightning(o) {
    const timeMs = getTimeMs();
    const beamY = o.y + o.h / 2;
    const gx = o.gapCx - o.gapW / 2;
    const gx2 = o.gapCx + o.gapW / 2;
    const drawGapMarker = (alpha) => {
      ctx.fillStyle = `rgba(125, 255, 176, ${alpha * 0.18})`;
      ctx.fillRect(gx, beamY - o.beamH, o.gapW, o.beamH * 2);
      ctx.strokeStyle = `rgba(160, 255, 200, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(gx, beamY - o.beamH); ctx.lineTo(gx, beamY + o.beamH);
      ctx.moveTo(gx2, beamY - o.beamH); ctx.lineTo(gx2, beamY + o.beamH);
      ctx.stroke();
      ctx.setLineDash([]);
    };
    if (o.phase === 'warn') {
      const pulse = 0.5 + Math.sin(o.t * 0.04) * 0.4;
      ctx.strokeStyle = `rgba(180, 220, 255, ${pulse})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.lineDashOffset = -(timeMs * 0.05) % 12;
      ctx.beginPath();
      ctx.moveTo(0, beamY); ctx.lineTo(gx, beamY);
      ctx.moveTo(gx2, beamY); ctx.lineTo(W, beamY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineDashOffset = 0;
      drawGapMarker(0.5 + pulse * 0.3);
    } else if (o.phase === 'fire') {
      const drawSeg = (x1, x2) => {
        const bg = ctx.createLinearGradient(0, beamY - o.beamH, 0, beamY + o.beamH);
        bg.addColorStop(0, 'rgba(120, 180, 255, 0)');
        bg.addColorStop(0.5, 'rgba(220, 240, 255, 0.85)');
        bg.addColorStop(1, 'rgba(120, 180, 255, 0)');
        ctx.fillStyle = bg;
        ctx.shadowColor = '#80b0ff';
        ctx.shadowBlur = 22;
        ctx.fillRect(x1, beamY - o.beamH, x2 - x1, o.beamH * 2);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#aad0ff';
        ctx.shadowBlur = 14;
        jaggedPath(x1, beamY, x2, beamY, 18, 9, o.jagSeed + timeMs * 0.01);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(180, 220, 255, 0.6)';
        ctx.lineWidth = 1;
        jaggedPath(x1, beamY, x2, beamY, 18, 14, o.jagSeed + 100 + timeMs * 0.013);
        ctx.stroke();
        ctx.shadowBlur = 0;
      };
      drawSeg(0, gx);
      drawSeg(gx2, W);
      drawGapMarker(0.85);
    } else {
      ctx.strokeStyle = 'rgba(150, 180, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 8]);
      ctx.beginPath();
      ctx.moveTo(0, beamY); ctx.lineTo(gx, beamY);
      ctx.moveTo(gx2, beamY); ctx.lineTo(W, beamY);
      ctx.stroke();
      ctx.setLineDash([]);
      drawGapMarker(0.35);
    }
  }

  function drawBouncer(o) {
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(o.spin);
    const grd = ctx.createRadialGradient(-3, -3, 2, 0, 0, o.w / 2);
    grd.addColorStop(0, '#fff');
    grd.addColorStop(0.4, '#80ffd0');
    grd.addColorStop(1, '#10503a');
    ctx.fillStyle = grd;
    ctx.shadowColor = '#40e0a0';
    ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.arc(0, 0, o.w / 2 * 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(20, 60, 40, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.arc(0, 0, o.w / 2 * 0.55, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawGate(o) {
    const lx = o.gateCenter - o.gapW / 2;
    const rx = o.gateCenter + o.gapW / 2;
    const lpiece = { x: 0,  y: o.y, w: lx,     h: o.h };
    const rpiece = { x: rx, y: o.y, w: W - rx, h: o.h };
    drawBar(lpiece, '#7adfff', '#3aa8e0', '#0a3a5a', 'rgba(100, 200, 255, 0.7)');
    drawBar(rpiece, '#7adfff', '#3aa8e0', '#0a3a5a', 'rgba(100, 200, 255, 0.7)');
    ctx.fillStyle = 'rgba(180, 230, 255, 0.6)';
    ctx.fillRect(lx - 2, o.y, 2, o.h);
    ctx.fillRect(rx,    o.y, 2, o.h);
  }

  function drawChanger(o) {
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    const t = o.t || 0;
    for (let i = 0; i < 3; i++) {
      const ph = ((t * 0.0009) + i / 3) % 1;
      const r = 10 + ph * 38;
      ctx.strokeStyle = `rgba(210, 150, 255, ${(1 - ph) * 0.7})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.005);
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, o.w / 2);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.35, '#d080ff');
    g.addColorStop(1, '#3a0066');
    ctx.fillStyle = g;
    ctx.shadowColor = '#c060ff'; ctx.shadowBlur = 22;
    ctx.beginPath(); ctx.arc(0, 0, o.w / 2 * 0.72, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const a0 = i * Math.PI / 2;
      ctx.beginPath();
      for (let j = 0; j <= 10; j++) {
        const tt = j / 10;
        const rr = tt * o.w / 2 * 0.62;
        const aa = a0 + tt * 1.6;
        const x = Math.cos(aa) * rr, y = Math.sin(aa) * rr;
        if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
    const pulse = 0.5 + Math.sin(t * 0.008) * 0.5;
    ctx.fillStyle = `rgba(230, 200, 255, ${0.7 + pulse * 0.3})`;
    ctx.font = 'bold 11px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#c060ff'; ctx.shadowBlur = 10;
    ctx.fillText('SCREEN', cx, cy - o.w / 2 - 12);
    ctx.fillText('CHANGER', cx, cy + o.w / 2 + 18);
    ctx.shadowBlur = 0;
  }

  function drawCrusher(o) {
    const dir = o.side === 'L' ? 1 : -1;
    const tailX = o.side === 'L' ? 0 : W;
    const headX = dir > 0 ? o.x + o.w : o.x;
    const railEndX = dir > 0 ? o.x : o.x + o.w;
    ctx.strokeStyle = '#5a5566';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tailX, o.y + 10);       ctx.lineTo(railEndX, o.y + 10);
    ctx.moveTo(tailX, o.y + o.h - 10); ctx.lineTo(railEndX, o.y + o.h - 10);
    ctx.stroke();
    if (o.shadowA > 0) {
      const farX = dir > 0 ? W - 5 : 0;
      ctx.fillStyle = `rgba(255, 80, 80, ${o.shadowA * 0.55})`;
      ctx.fillRect(farX, o.y, 5, o.h);
      ctx.strokeStyle = `rgba(255, 100, 100, ${o.shadowA})`;
      ctx.lineWidth = 1; ctx.setLineDash([5, 4]);
      ctx.beginPath();
      if (dir > 0) {
        ctx.moveTo(o.x + o.w, o.y);       ctx.lineTo(W, o.y);
        ctx.moveTo(o.x + o.w, o.y + o.h); ctx.lineTo(W, o.y + o.h);
      } else {
        ctx.moveTo(o.x, o.y);       ctx.lineTo(0, o.y);
        ctx.moveTo(o.x, o.y + o.h); ctx.lineTo(0, o.y + o.h);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
    const grd = ctx.createLinearGradient(o.x, 0, o.x + o.w, 0);
    grd.addColorStop(0, '#a8a8b8'); grd.addColorStop(0.5, '#5a5a68'); grd.addColorStop(1, '#1a1a22');
    ctx.fillStyle = grd;
    ctx.shadowColor = 'rgba(255, 120, 80, 0.55)'; ctx.shadowBlur = 14;
    roundRect(o.x, o.y, o.w, o.h, 4, true);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#d8d8e0';
    const teeth = 8;
    const th = o.h / teeth;
    for (let i = 0; i < teeth; i++) {
      ctx.beginPath();
      ctx.moveTo(headX, o.y + i * th);
      ctx.lineTo(headX + dir * 10, o.y + (i + 0.5) * th);
      ctx.lineTo(headX, o.y + (i + 1) * th);
      ctx.closePath(); ctx.fill();
    }
  }

  function drawPortal(o) {
    const aY = o.y + o.yOff;
    const drawRing = (px, py, hue) => {
      ctx.save();
      ctx.translate(px, py);
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `hsla(${hue}, 95%, 65%, ${0.85 - i * 0.22})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = `hsl(${hue}, 100%, 60%)`; ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.ellipse(0, 0, o.ringR - i * 3, (o.ringR - i * 3) * 0.42, o.ringSpin * (i % 2 ? -1 : 1), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.fillStyle = `hsla(${hue}, 100%, 80%, 0.45)`;
      ctx.beginPath();
      ctx.ellipse(0, 0, o.ringR * 0.55, o.ringR * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    drawRing(o.aX, aY, 210);
    drawRing(o.bX, aY, 30);
    const g = ctx.createRadialGradient(o.ballX - 2, o.ballY - 2, 1, o.ballX, o.ballY, o.ballR);
    g.addColorStop(0, '#fff'); g.addColorStop(0.5, '#ff80d0'); g.addColorStop(1, '#400020');
    ctx.fillStyle = g;
    ctx.shadowColor = '#ff40a0'; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(o.ballX, o.ballY, o.ballR, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawWormTunnel(o) {
    const ch = o.channelW;
    const amp = o.amp;
    const freq = o.freq;
    const segs = Math.max(24, Math.floor(o.h / 18));
    const ctrX = (yy) => W / 2 + Math.sin((yy - o.y) * freq + o.phase) * amp;
    const wallGrd = ctx.createLinearGradient(0, 0, W, 0);
    wallGrd.addColorStop(0, '#2a1a4e');
    wallGrd.addColorStop(0.5, '#3a2a5e');
    wallGrd.addColorStop(1, '#2a1a4e');
    ctx.fillStyle = wallGrd;
    ctx.shadowColor = 'rgba(180, 120, 255, 0.45)'; ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(0, o.y);
    for (let i = 0; i <= segs; i++) {
      const yy = o.y + (i / segs) * o.h;
      const cx = ctrX(yy);
      ctx.lineTo(cx - ch / 2, yy);
    }
    ctx.lineTo(0, o.y + o.h); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(W, o.y);
    for (let i = 0; i <= segs; i++) {
      const yy = o.y + (i / segs) * o.h;
      const cx = ctrX(yy);
      ctx.lineTo(cx + ch / 2, yy);
    }
    ctx.lineTo(W, o.y + o.h); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(200, 150, 255, 0.95)';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(180, 120, 255, 0.7)'; ctx.shadowBlur = 12;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      for (let i = 0; i <= segs; i++) {
        const yy = o.y + (i / segs) * o.h;
        const cx = ctrX(yy);
        const px = cx + side * ch / 2;
        if (i === 0) ctx.moveTo(px, yy); else ctx.lineTo(px, yy);
      }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 220, 255, 0.4)';
    const dots = Math.max(8, Math.floor(o.h / 60));
    for (let i = 0; i < dots; i++) {
      const yy = o.y + (i + 0.5) / dots * o.h;
      const cx = ctrX(yy);
      ctx.beginPath();
      ctx.arc(cx, yy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawStalactite(o) {
    const mountY = o.y;
    ctx.fillStyle = '#3a3548';
    roundRect(o.anchorX - o.mountW / 2, mountY - 10, o.mountW, 12, 3, true);
    ctx.fillStyle = '#1a1a25';
    ctx.fillRect(o.anchorX - o.mountW / 2 + 4, mountY - 8, o.mountW - 8, 3);
    if (o.phase === 'warn') {
      const timeMs = getTimeMs();
      const pulse = 0.5 + Math.sin(timeMs * 0.018) * 0.4;
      ctx.fillStyle = `rgba(255, 80, 80, ${0.08 + pulse * 0.12})`;
      ctx.fillRect(o.anchorX - o.triggerW / 2, mountY, o.triggerW, o.maxFall);
      ctx.strokeStyle = `rgba(255, 100, 100, ${pulse})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 5]);
      ctx.shadowColor = '#ff4040'; ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(o.anchorX - o.triggerW / 2, mountY); ctx.lineTo(o.anchorX - o.triggerW / 2, mountY + o.maxFall);
      ctx.moveTo(o.anchorX + o.triggerW / 2, mountY); ctx.lineTo(o.anchorX + o.triggerW / 2, mountY + o.maxFall);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.setLineDash([]);
    }
    const sy = mountY + o.yOff;
    ctx.save();
    ctx.translate(o.anchorX, sy);
    const grd = ctx.createLinearGradient(0, 0, 0, o.spikeH);
    grd.addColorStop(0, '#b8b0c8'); grd.addColorStop(0.5, '#7a6a8a'); grd.addColorStop(1, '#3a2a4a');
    ctx.fillStyle = grd;
    ctx.shadowColor = 'rgba(180, 140, 255, 0.65)'; ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(-o.spikeW / 2, 0);
    ctx.lineTo(o.spikeW / 2, 0);
    ctx.lineTo(0, o.spikeH);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.moveTo(-2, 0); ctx.lineTo(2, 0); ctx.lineTo(0, o.spikeH * 0.85);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawBoomerang(o) {
    ctx.fillStyle = '#3a3548';
    roundRect(o.anchorX - 6, o.y - 4, 12, 28, 3, true);
    ctx.fillStyle = '#1a1a25';
    ctx.beginPath(); ctx.arc(o.anchorX, o.y + 10, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255, 200, 80, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(o.anchorX, o.y + 10); ctx.lineTo(o.bx, o.by);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.save();
    ctx.translate(o.bx, o.by);
    ctx.rotate(o.spin);
    const grd = ctx.createLinearGradient(-o.size, 0, o.size, 0);
    grd.addColorStop(0, '#ffe8a0'); grd.addColorStop(0.5, '#ffaa30'); grd.addColorStop(1, '#7a3a0a');
    ctx.fillStyle = grd;
    ctx.shadowColor = '#ffaa40'; ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(-o.size, -o.size * 0.35);
    ctx.lineTo(-o.size * 0.2, -o.size * 0.55);
    ctx.lineTo(o.size * 0.35, 0);
    ctx.lineTo(-o.size * 0.2, o.size * 0.55);
    ctx.lineTo(-o.size, o.size * 0.35);
    ctx.lineTo(-o.size * 0.35, 0);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath(); ctx.arc(-o.size * 0.3, -o.size * 0.15, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawSpikeCurtain(o) {
    const dirX = o.side === 'L' ? 1 : -1;
    const baseY = o.baseY;
    const halfW = o.tipW / 2;
    const tipX = o.baseX + dirX * o.tipLen;
    const x0 = o.baseX, x1 = tipX;
    const grd = ctx.createLinearGradient(x0, 0, x1, 0);
    grd.addColorStop(0, '#5a0a20');
    grd.addColorStop(0.5, '#d04060');
    grd.addColorStop(1, '#ff90b0');
    ctx.fillStyle = grd;
    ctx.shadowColor = 'rgba(255, 80, 120, 0.65)'; ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(o.baseX, baseY - halfW);
    ctx.lineTo(o.baseX, baseY + halfW);
    ctx.lineTo(tipX, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.moveTo(o.baseX, baseY - 2);
    ctx.lineTo(o.baseX, baseY + 2);
    ctx.lineTo(o.baseX + dirX * o.tipLen * 0.85, baseY);
    ctx.closePath();
    ctx.fill();
  }

  function drawYoyo(o) {
    const dirX = o.side === 'L' ? 1 : -1;
    const ay = o.y + o.ballR;
    // anchor mount on wall
    ctx.fillStyle = '#3a3548';
    if (o.side === 'L') roundRect(0, ay - 14, 10, 28, 3, true);
    else roundRect(o.anchorX - 10, ay - 14, 10, 28, 3, true);
    ctx.fillStyle = '#1a1a25';
    ctx.beginPath(); ctx.arc(o.anchorX, ay, 4, 0, Math.PI * 2); ctx.fill();
    // rope
    ctx.strokeStyle = 'rgba(200, 200, 220, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(o.anchorX, ay);
    ctx.lineTo(o.ballX, o.ballY);
    ctx.stroke();
    // ball
    ctx.save();
    ctx.translate(o.ballX, o.ballY);
    ctx.rotate(o.spin);
    const grd = ctx.createRadialGradient(-3, -3, 2, 0, 0, o.ballR);
    grd.addColorStop(0, '#fff'); grd.addColorStop(0.4, '#ff80a0'); grd.addColorStop(1, '#5a1030');
    ctx.fillStyle = grd;
    ctx.shadowColor = '#ff5080'; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.arc(0, 0, o.ballR, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(40, 10, 20, 0.7)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * o.ballR * 0.5, Math.sin(a) * o.ballR * 0.5);
      ctx.lineTo(Math.cos(a) * o.ballR * 0.9, Math.sin(a) * o.ballR * 0.9);
      ctx.stroke();
    }
    ctx.fillStyle = '#1a0010';
    ctx.beginPath(); ctx.arc(0, 0, o.ballR * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawSliderArrows(o) {
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    const cy = o.y + o.h / 2;
    const dir = Math.sign(o.vx);
    for (let i = 0; i < 2; i++) {
      const ax = o.x + o.w / 2 + dir * (i * 8 + 4);
      ctx.beginPath();
      ctx.moveTo(ax, cy - 4);
      ctx.lineTo(ax + dir * 5, cy);
      ctx.lineTo(ax, cy + 4);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawBlinkerOpen(o, timeMs) {
    ctx.strokeStyle = 'rgba(140, 255, 180, 0.85)';
    ctx.lineWidth = 2;
    const dashOff = (timeMs * 0.04) % 12;
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = -dashOff;
    ctx.shadowColor = 'rgba(140, 255, 180, 0.7)';
    ctx.shadowBlur = 8;
    ctx.strokeRect(o.x + 1, o.y + 1, o.w - 2, o.h - 2);
    ctx.shadowBlur = 0;
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    const cx = o.x + o.w / 2;
    const bob = Math.sin(timeMs * 0.006) * 3;
    const cy = o.y - 14 + bob;
    ctx.fillStyle = 'rgba(160, 255, 200, 0.95)';
    ctx.shadowColor = 'rgba(140, 255, 180, 0.8)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.lineTo(cx + 10, cy);
    ctx.lineTo(cx, cy + 8);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawChaserEye(o) {
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    const eyeOff = Math.max(-6, Math.min(6, (player.x - cx) * 0.05));
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath(); ctx.arc(cx + eyeOff * 0.3, cy, 2, 0, Math.PI * 2); ctx.fill();
  }

  function drawGrowBarArrows(o) {
    const cy = o.y + o.h / 2;
    ctx.fillStyle = 'rgba(255, 240, 200, 0.7)';
    ctx.beginPath();
    ctx.moveTo(o.x - 6, cy);
    ctx.lineTo(o.x, cy - 5);
    ctx.lineTo(o.x, cy + 5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(o.x + o.w + 6, cy);
    ctx.lineTo(o.x + o.w, cy - 5);
    ctx.lineTo(o.x + o.w, cy + 5);
    ctx.closePath();
    ctx.fill();
  }

  function drawAll(obstacles) {
    const timeMs = getTimeMs();
    for (const o of obstacles) {
      ctx.globalAlpha = o.appear;
      switch (o.kind) {
        case 'bar': drawBar(o, '#ff7a96', '#ff4a6e', '#8b1a3c', 'rgba(255, 80, 120, 0.7)'); break;
        case 'slider':
          drawBar(o, '#8affc4', '#39e08c', '#106648', 'rgba(80, 255, 160, 0.7)');
          drawSliderArrows(o);
          break;
        case 'blinker':
          if (o.blinkPhase == null) drawBar(o, '#8b95ad', '#4a5670', '#1f2535', 'rgba(140,160,200,0.5)');
          else if (o.active)        drawBar(o, '#c9a4ff', '#9a6cff', '#3e1f7a', 'rgba(150, 100, 255, 0.7)');
          else                      drawBlinkerOpen(o, timeMs);
          break;
        case 'chaser':
          drawBar(o, '#ffb38a', '#ff7438', '#7a2f0c', 'rgba(255, 120, 60, 0.8)');
          drawChaserEye(o);
          break;
        case 'changer':    drawChanger(o); break;
        case 'spike':      drawSpike(o, 8); break;
        case 'bigSpike':   drawSpike(o, 12, true); break;
        case 'laser':      drawLaser(o); break;
        case 'homing':     drawHoming(o); break;
        case 'rotor':      drawRotor(o); break;
        case 'shrinker':   if (o.w > 0) drawBar(o, '#ffd56b', '#ff9a2c', '#7a4810', 'rgba(255, 180, 60, 0.7)'); break;
        case 'saw':        drawSaw(o); break;
        case 'swarm':      drawSwarmUnit(o); break;
        case 'bomb':       drawBomb(o); break;
        case 'spinner':    drawSpinner(o); break;
        case 'gate':       drawGate(o); break;
        case 'frag':       drawFrag(o); break;
        case 'pendulum':   drawPendulum(o); break;
        case 'lightning':  drawLightning(o); break;
        case 'bouncer':    drawBouncer(o); break;
        case 'wormTunnel': drawWormTunnel(o); break;
        case 'crusher':    drawCrusher(o); break;
        case 'portal':     drawPortal(o); break;
        case 'stalactite':   drawStalactite(o); break;
        case 'boomerang':    drawBoomerang(o); break;
        case 'spikeCurtain': drawSpikeCurtain(o); break;
        case 'yoyo':         drawYoyo(o); break;
        case 'growBar':
          drawBar(o, '#ffce6b', '#ff9028', '#7a3a08', 'rgba(255, 160, 40, 0.7)');
          drawGrowBarArrows(o);
          break;
      }
    }
    ctx.globalAlpha = 1;
  }

  return { drawAll };
}
