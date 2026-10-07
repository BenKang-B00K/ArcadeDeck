// obstacle-draw.js — rendering for obstacle subsystem.
// Pure draw layer: no state, no mutation of obstacles. Reads o.* + env helpers.
//
// Visual language: every solid obstacle = glow halo → extruded side faces → gradient top face → detail → dark rim.
// The dark rim (outline()) is what keeps shapes crisp against their own glow.
// Light comes from the top-left (specular dots, lit facets); solids are thin slabs whose side faces hang
// DEPTH px down-right. Side faces are drawn outside the hitbox only — a few px of forgiveness, never a lie.

export function createObstacleDrawer(env) {
  const { ctx, W, getTimeMs, player, changerSign } = env;   // changerSign: localized [above, below] label

  const RIM = 'rgba(8, 6, 22, 0.75)';
  const DEPTH_X = 2, DEPTH_Y = 6;

  function rrPath(x, y, w, h, r) {
    const p = new Path2D();
    p.roundRect(x, y, w, h, r);
    return p;
  }
  // Fills a rounded rect and returns its Path2D so outline()/stripes() can reuse it.
  function roundRect(x, y, w, h, r) {
    const p = rrPath(x, y, w, h, r);
    ctx.fill(p);
    return p;
  }

  // '#rrggbb' scaled by k → 'rgb()'
  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    return `rgb(${(n >> 16 & 255) * k | 0},${(n >> 8 & 255) * k | 0},${(n & 255) * k | 0})`;
  }

  // Side faces: sweep Path2D p along the depth vector in 4 slices, before the top face is filled.
  // `ang` = the rotation already applied to ctx, undone here so thickness always hangs down-right on
  // screen while the shape spins. The glow rides on the first slice so it never tints the side faces.
  // k scales the depth (thin discs).
  function extrude(p, color, ang = 0, glow = null, blur = 0, k = 1) {
    const c = Math.cos(ang) * k / 4, s = Math.sin(ang) * k / 4;
    const dx = DEPTH_X * c + DEPTH_Y * s, dy = DEPTH_Y * c - DEPTH_X * s;
    ctx.save();
    ctx.fillStyle = color;
    if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = blur; }
    for (let i = 0; i < 4; i++) {
      ctx.translate(dx, dy);
      ctx.fill(p);
      ctx.shadowBlur = 0;
    }
    outline(1.5, p);
    ctx.restore();
  }

  // Stroke the dark rim. Pass a Path2D, or omit to use the live path right after a fill.
  function outline(w = 2, p) {
    ctx.shadowBlur = 0;
    ctx.lineWidth = w;
    ctx.strokeStyle = RIM;
    p ? ctx.stroke(p) : ctx.stroke();
  }

  // Specular highlight: thin light line inset from the top edge of a rect.
  function specLine(x, y, w, a = 0.45) {
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fillRect(x + 5, y + 2.5, Math.max(0, w - 10), 1.5);
  }

  // Diagonal stripes clipped to Path2D p.
  function stripes(p, x, y, w, h, color, step = 18, lw = 5) {
    ctx.save();
    ctx.clip(p);
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.beginPath();
    for (let sx = x - h; sx < x + w + h; sx += step) {
      ctx.moveTo(sx, y + h + 2);
      ctx.lineTo(sx + h + 2, y - 2);
    }
    ctx.stroke();
    ctx.restore();
  }

  function starPath(points, rOut, rIn) {
    const p = new Path2D();
    for (let i = 0; i < points * 2; i++) {
      const ang = (i / (points * 2)) * Math.PI * 2;
      const r = i % 2 === 0 ? rOut : rIn;
      p.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
    }
    p.closePath();
    return p;
  }

  // Raised-pyramid shading for a star drawn in a frame rotated by `ang`: each half-point facet is
  // lightened or darkened by how much its outer edge faces the top-left light (in world space, so the
  // shading rolls around as the star spins).
  function facetStar(points, rOut, rIn, ang, lit, dark) {
    const c = Math.cos(ang), s = Math.sin(ang);
    const lx = -(c + s) * Math.SQRT1_2, ly = (s - c) * Math.SQRT1_2;   // world (-1,-1)/√2 in local frame
    const n = points * 2;
    for (let i = 0; i < n; i++) {
      const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2;
      const r0 = i % 2 ? rIn : rOut, r1 = i % 2 ? rOut : rIn;
      const x0 = Math.cos(a0) * r0, y0 = Math.sin(a0) * r0;
      const x1 = Math.cos(a1) * r1, y1 = Math.sin(a1) * r1;
      let nx = y1 - y0, ny = x0 - x1;
      if (nx * (x0 + x1) + ny * (y0 + y1) < 0) { nx = -nx; ny = -ny; }
      const l = (nx * lx + ny * ly) / Math.hypot(nx, ny);
      ctx.fillStyle = l > 0 ? `rgba(255,255,255,${l * lit})` : `rgba(0,0,0,${-l * dark})`;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(x0, y0); ctx.lineTo(x1, y1); ctx.closePath();
      ctx.fill();
    }
  }

  // Glossy sphere: body gradient + rim + specular dot. Path left live for callers.
  function orb(r, c0, c1, c2, glow, blur) {
    const grd = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
    grd.addColorStop(0, c0);
    grd.addColorStop(0.45, c1);
    grd.addColorStop(1, c2);
    ctx.fillStyle = grd;
    ctx.shadowColor = glow;
    ctx.shadowBlur = blur;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    outline(1.5);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath(); ctx.ellipse(-r * 0.38, -r * 0.42, r * 0.22, r * 0.14, -0.6, 0, Math.PI * 2); ctx.fill();
  }

  // Green "go here" band between x0 and x1 (lightning gap, laser pocket): faint fill + dashed edges.
  function safeZone(x0, x1, cy, hh, a) {
    ctx.fillStyle = `rgba(125, 255, 176, ${a * 0.18})`;
    ctx.fillRect(Math.min(x0, x1), cy - hh, Math.abs(x1 - x0), hh * 2);
    ctx.strokeStyle = `rgba(160, 255, 200, ${a})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x0, cy - hh); ctx.lineTo(x0, cy + hh);
    ctx.moveTo(x1, cy - hh); ctx.lineTo(x1, cy + hh);
    ctx.stroke();
    ctx.setLineDash([]);
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
    const { x, y, w, h } = o;
    if (w <= 0) return;
    const p = rrPath(x, y, w, h, 5);
    extrude(p, shade(c2, 0.8), 0, glow, 14);
    const grd = ctx.createLinearGradient(x, y, x, y + h);
    grd.addColorStop(0, c0);
    grd.addColorStop(0.5, c1);
    grd.addColorStop(1, c2);
    ctx.fillStyle = grd;
    ctx.fill(p);
    if (w > 30) stripes(p, x, y, w, h, 'rgba(0,0,0,0.16)');
    // end caps
    ctx.save();
    ctx.clip(p);
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(x, y, 7, h);
    ctx.fillRect(x + w - 7, y, 7, h);
    ctx.restore();
    outline(2, p);
    specLine(x, y, w);
  }

  function drawSpike(o, points, big) {
    ctx.save();
    ctx.translate(o.x + o.w / 2, o.y + o.h / 2);
    const spin = o.spin || 0;
    ctx.rotate(spin);
    const s = o.w / 2;
    const inner = big ? 0.55 : 0.45;
    const p = starPath(points, s, s * inner);
    extrude(p, big ? '#4a0c3e' : '#6a3608', spin,
      big ? 'rgba(255, 130, 220, 0.9)' : 'rgba(255, 200, 80, 0.85)', big ? 20 : 12);
    const grd = ctx.createRadialGradient(0, 0, 2, 0, 0, s);
    if (big) {
      grd.addColorStop(0, '#ffe2ff');
      grd.addColorStop(0.5, '#ff7adb');
      grd.addColorStop(1, '#7a1a66');
    } else {
      grd.addColorStop(0, '#fff4c8');
      grd.addColorStop(0.5, '#ffcc66');
      grd.addColorStop(1, '#cc7a1a');
    }
    ctx.fillStyle = grd;
    ctx.fill(p);
    facetStar(points, s, s * inner, spin, 0.5, 0.45);
    outline(big ? 2.5 : 1.5, p);
    // core
    ctx.fillStyle = big ? '#5a0a4a' : '#8a4a0a';
    ctx.beginPath(); ctx.arc(0, 0, s * (big ? 0.14 : 0.16), 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath(); ctx.arc(-s * 0.05, -s * 0.05, s * (big ? 0.06 : 0.07), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // Dark steel wall/ceiling mount with depth.
  function mountBlock(x, y, w, h) {
    const p = rrPath(x, y, w, h, 3);
    extrude(p, '#15131e');
    ctx.fillStyle = '#3a3548';
    ctx.fill(p);
    outline(1.5, p);
    specLine(x - 3, y - 1, w + 6, 0.25);
  }

  // Raised round cap (hubs, bolts) at the origin, drawn unrotated: extruded disc + domed face.
  function hubCap(r, side, hi, lo) {
    const p = new Path2D();
    p.arc(0, 0, r, 0, Math.PI * 2);
    extrude(p, side);
    const g = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
    g.addColorStop(0, hi);
    g.addColorStop(1, lo);
    ctx.fillStyle = g;
    ctx.fill(p);
    outline(1.5, p);
    ctx.fillStyle = side;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2); ctx.fill();
  }

  function drawLaser(o) {
    const timeMs = getTimeMs();
    const dir = o.side === 'R' ? -1 : 1;
    const ex = dir > 0 ? o.x + o.w - 2 : o.x + 2;
    const ey = o.y + o.h / 2;
    const beamY = ey - o.beamW / 2;
    const beamX = Math.min(ex, o.beamEnd);
    const beamW = Math.abs(o.beamEnd - ex);
    const firing = o.phase === 'fire';

    // safe pocket past the beam's end — brightest while the laser warns
    safeZone(o.beamEnd, dir > 0 ? W : 0, ey, o.beamW + 6, o.phase === 'warn' ? 0.9 : 0.4);

    // turret housing
    const hp = rrPath(o.x, o.y, o.w, o.h, 4);
    extrude(hp, '#0c101c', 0, 'rgba(120, 180, 255, 0.5)', 10);
    const grd = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.h);
    grd.addColorStop(0, '#4a5a7e');
    grd.addColorStop(0.5, '#2a3450');
    grd.addColorStop(1, '#151b2c');
    ctx.fillStyle = grd;
    ctx.fill(hp);
    outline(2, hp);
    specLine(o.x, o.y, o.w, 0.3);
    // vents
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    for (let i = 0; i < 3; i++) ctx.fillRect(o.x + 6, o.y + 8 + i * 6, o.w - 12, 2);
    // lens socket
    ctx.fillStyle = '#0a0d18';
    ctx.beginPath(); ctx.arc(ex, ey, 7, 0, Math.PI * 2); ctx.fill();

    if (o.phase !== 'fire') {
      ctx.strokeStyle = 'rgba(255, 100, 100, 0.18)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(o.beamEnd, ey);
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
      // muzzle flare
      const fl = ctx.createRadialGradient(ex, ey, 1, ex, ey, 16);
      fl.addColorStop(0, '#ffffff');
      fl.addColorStop(0.4, 'rgba(255, 180, 180, 0.8)');
      fl.addColorStop(1, 'rgba(255, 80, 80, 0)');
      ctx.fillStyle = fl;
      ctx.beginPath(); ctx.arc(ex, ey, 16, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(120, 180, 255, 0.6)';
      ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI * 2); ctx.fill();
    }
    // beam stop: a floating catcher node so the beam visibly ends instead of fading into the pocket
    ctx.save();
    ctx.translate(o.beamEnd, ey);
    orb(6, firing ? '#fff' : '#d8e4ff', firing ? '#ff6a6a' : '#5a6a9a', firing ? '#5a0808' : '#151b2c',
      firing ? '#ff4040' : 'rgba(120, 180, 255, 0.5)', firing ? 16 : 6);
    ctx.restore();
  }

  function drawHoming(o) {
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    const r = o.w / 2 * 0.9;
    const timeMs = getTimeMs();
    ctx.save();
    ctx.translate(cx, cy);
    // exhaust tail (moves down, so tail points up)
    const tail = ctx.createLinearGradient(0, -r, 0, -r * 3.2);
    tail.addColorStop(0, 'rgba(255, 120, 80, 0.75)');
    tail.addColorStop(1, 'rgba(255, 120, 80, 0)');
    ctx.fillStyle = tail;
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, -r * 0.6);
    ctx.lineTo(0, -r * 3.2);
    ctx.lineTo(r * 0.55, -r * 0.6);
    ctx.closePath(); ctx.fill();
    // targeting reticle
    ctx.save();
    ctx.rotate(timeMs * 0.003);
    ctx.strokeStyle = 'rgba(255, 90, 90, 0.7)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.7, i * Math.PI / 2 + 0.25, i * Math.PI / 2 + Math.PI / 2 - 0.25);
      ctx.stroke();
    }
    ctx.restore();
    orb(r, '#fff', '#ff6a6a', '#5a0808', '#ff3030', 14);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, 0); ctx.lineTo(r * 0.6, 0);
    ctx.moveTo(0, -r * 0.6); ctx.lineTo(0, r * 0.6);
    ctx.stroke();
    ctx.restore();
  }

  function drawRotor(o) {
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(o.angle);
    const p = rrPath(-o.w / 2, -o.h / 2, o.w, o.h, 5);
    extrude(p, '#083a1f', o.angle, 'rgba(120, 255, 140, 0.6)', 14);
    const grd = ctx.createLinearGradient(0, -o.h / 2, 0, o.h / 2);
    grd.addColorStop(0, '#9aff8a');
    grd.addColorStop(0.5, '#39d06a');
    grd.addColorStop(1, '#0a4a28');
    ctx.fillStyle = grd;
    ctx.fill(p);
    stripes(p, -o.w / 2, -o.h / 2, o.w, o.h, 'rgba(0,0,0,0.14)');
    outline(2, p);
    specLine(-o.w / 2, -o.h / 2, o.w, 0.4);
    // rivets along the blade
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    for (const px of [-o.w * 0.35, o.w * 0.35]) {
      ctx.beginPath(); ctx.arc(px, 0, 2.5, 0, Math.PI * 2); ctx.fill();
    }
    // hub: raised bolt cap
    ctx.rotate(-o.angle);
    hubCap(o.h * 0.42, '#123a20', '#e8ffe8', '#2a6a3a');
    ctx.restore();
  }

  function drawSaw(o) {
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    const r = o.w / 2;
    // rail
    ctx.strokeStyle = 'rgba(180, 180, 200, 0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    ctx.strokeStyle = 'rgba(20, 20, 40, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(o.spin);
    // hooked teeth blade
    const teeth = 12;
    const step = Math.PI * 2 / teeth;
    const grd = ctx.createLinearGradient(-r, -r, r, r);
    grd.addColorStop(0, '#f4f6ff');
    grd.addColorStop(0.5, '#aeb6c8');
    grd.addColorStop(1, '#5a6478');
    const bp = new Path2D();
    for (let i = 0; i < teeth; i++) {
      const a0 = i * step;
      bp.lineTo(Math.cos(a0) * r, Math.sin(a0) * r);
      bp.lineTo(Math.cos(a0 + step * 0.62) * r * 0.7, Math.sin(a0 + step * 0.62) * r * 0.7);
    }
    bp.closePath();
    extrude(bp, '#3a4458', o.spin, 'rgba(200, 220, 255, 0.8)', 16, 0.5);
    ctx.fillStyle = grd;
    ctx.fill(bp);
    outline(2, bp);
    // brushed ring + bolt holes
    ctx.strokeStyle = 'rgba(30, 36, 56, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#1a2030';
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + Math.PI / 4;
      ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.46, Math.sin(a) * r * 0.46, r * 0.07, 0, Math.PI * 2); ctx.fill();
    }
    ctx.rotate(-o.spin);
    hubCap(r * 0.32, '#1a2030', '#fff', '#6a7a90');
    ctx.restore();
  }

  function drawSwarmUnit(o) {
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    ctx.save();
    ctx.translate(cx, cy);
    orb(o.w / 2 * 0.9, '#ffe0a0', '#ff6a3c', '#3a0a00', '#ff5520', 12);
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
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
    for (let i = 0; i < 2; i++) {
      const baseAng = o.angle + i * Math.PI;
      ctx.save();
      ctx.rotate(baseAng - sweepDir * 0.35);
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = '#ffb060';
      roundRect(0, -o.armW / 2, o.armLen, o.armW, 4);
      ctx.globalAlpha = 1;
      ctx.restore();

      ctx.save();
      ctx.rotate(baseAng);
      const p = rrPath(0, -o.armW / 2, o.armLen, o.armW, 4);
      p.moveTo(o.armLen - 2, -o.armW / 2 - 4);   // blade tip, part of the slab
      p.lineTo(o.armLen + 12, 0);
      p.lineTo(o.armLen - 2, o.armW / 2 + 4);
      p.closePath();
      extrude(p, '#3a1a08', baseAng, 'rgba(255, 180, 80, 0.7)', 12);
      const grd = ctx.createLinearGradient(0, -o.armW / 2, 0, o.armW / 2);
      grd.addColorStop(0, '#ffe6b0');
      grd.addColorStop(0.5, '#c08838');
      grd.addColorStop(1, '#5a2810');
      ctx.fillStyle = grd;
      ctx.fill(p);
      stripes(p, 0, -o.armW / 2, o.armLen, o.armW, 'rgba(0,0,0,0.14)');
      outline(2, p);
      specLine(0, -o.armW / 2, o.armLen, 0.35);
      // blade tip
      ctx.fillStyle = '#ffd060';
      ctx.beginPath();
      ctx.moveTo(o.armLen - 2, -o.armW / 2 - 4);
      ctx.lineTo(o.armLen + 12, 0);
      ctx.lineTo(o.armLen - 2, o.armW / 2 + 4);
      ctx.closePath();
      ctx.fill();
      outline(1.5);
      ctx.restore();
    }

    hubCap(11, '#3a2010', '#ffe8b0', '#8a5020');
    ctx.restore();
  }

  function drawPendulum(o) {
    const ax = o.anchorX;
    const ay = o.y + 8;
    const wx = ax + Math.sin(o.angle) * o.armLen;
    const wy = ay + Math.cos(o.angle) * o.armLen;
    // mount
    mountBlock(ax - 12, o.y, 24, 8);
    ctx.fillStyle = '#1a1a25';
    ctx.beginPath(); ctx.arc(ax, ay, 4, 0, Math.PI * 2); ctx.fill();
    // arm
    ctx.save();
    ctx.translate(ax, ay);
    const armAng = Math.atan2(wy - ay, wx - ax) - Math.PI / 2;
    ctx.rotate(armAng);
    const ap = rrPath(-o.armW / 2, 0, o.armW, o.armLen, 3);
    extrude(ap, '#24222e', armAng, 'rgba(180, 180, 220, 0.4)', 8);
    const grd = ctx.createLinearGradient(-o.armW / 2, 0, o.armW / 2, 0);
    grd.addColorStop(0, '#c8ccd8');
    grd.addColorStop(0.5, '#8a90a0');
    grd.addColorStop(1, '#4a4858');
    ctx.fillStyle = grd;
    ctx.fill(ap);
    outline(1.5, ap);
    ctx.restore();
    // mace head
    ctx.save();
    ctx.translate(wx, wy);
    const R = o.weightR;
    const mp = starPath(8, R * 1.45, R * 0.85);
    extrude(mp, '#3a1406', 0, '#ff7a30', 16);
    ctx.fillStyle = '#8a3a18';
    ctx.fill(mp);
    facetStar(8, R * 1.45, R * 0.85, 0, 0.35, 0.45);
    outline(1.5, mp);
    orb(R, '#ffe2b8', '#d06a30', '#3a0f00', '#ff7a30', 0);
    ctx.restore();
  }

  function drawLightning(o) {
    const timeMs = getTimeMs();
    const beamY = o.y + o.h / 2;
    const gx = o.gapCx - o.gapW / 2;
    const gx2 = o.gapCx + o.gapW / 2;
    const drawGapMarker = (alpha) => safeZone(gx, gx2, beamY, o.beamH, alpha);
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
    const r = o.w / 2 * 0.9;
    orb(r, '#fff', '#80ffd0', '#10503a', '#40e0a0', 16);
    // seam lines spin; the highlight (light) stays top-left
    ctx.rotate(o.spin);
    ctx.strokeStyle = 'rgba(10, 50, 35, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.95, r * 0.4, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.4, r * 0.95, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function drawGate(o) {
    const lx = o.gateCenter - o.gapW / 2;
    const rx = o.gateCenter + o.gapW / 2;
    const lpiece = { x: 0,  y: o.y, w: lx,     h: o.h };
    const rpiece = { x: rx, y: o.y, w: W - rx, h: o.h };
    drawBar(lpiece, '#7adfff', '#3aa8e0', '#0a3a5a', 'rgba(100, 200, 255, 0.7)');
    drawBar(rpiece, '#7adfff', '#3aa8e0', '#0a3a5a', 'rgba(100, 200, 255, 0.7)');
    ctx.fillStyle = 'rgba(180, 230, 255, 0.85)';
    ctx.fillRect(lx - 3, o.y, 3, o.h);
    ctx.fillRect(rx,     o.y, 3, o.h);
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
    outline(1.5);
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
    ctx.fillText(changerSign[0], cx, cy - o.w / 2 - 12);
    ctx.fillText(changerSign[1], cx, cy + o.w / 2 + 18);
    ctx.shadowBlur = 0;
  }

  function drawCrusher(o) {
    const dir = o.side === 'L' ? 1 : -1;
    const tailX = o.side === 'L' ? 0 : W;
    const headX = dir > 0 ? o.x + o.w : o.x;
    const railEndX = dir > 0 ? o.x : o.x + o.w;
    // piston rods: chrome cylinders
    for (const ry of [o.y + 12, o.y + o.h - 12]) {
      const rg = ctx.createLinearGradient(0, ry - 3, 0, ry + 3);
      rg.addColorStop(0, '#e8e6f0'); rg.addColorStop(0.45, '#8a8598'); rg.addColorStop(1, '#2a2636');
      ctx.fillStyle = rg;
      ctx.fillRect(Math.min(tailX, railEndX), ry - 3, Math.abs(railEndX - tailX), 6);
    }
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
    // head block: hazard-striped steel
    const p = rrPath(o.x, o.y, o.w, o.h, 4);
    extrude(p, '#4a3004', 0, 'rgba(255, 160, 60, 0.55)', 14);
    const grd = ctx.createLinearGradient(o.x, 0, o.x + o.w, 0);
    grd.addColorStop(0, '#ffd34a'); grd.addColorStop(0.5, '#e0a820'); grd.addColorStop(1, '#8a5a08');
    ctx.fillStyle = grd;
    ctx.fill(p);
    stripes(p, o.x, o.y, o.w, o.h, 'rgba(20, 16, 30, 0.85)', 22, 9);
    outline(2, p);
    // teeth
    ctx.fillStyle = '#e8e8f0';
    const teeth = 8;
    const th = o.h / teeth;
    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      ctx.moveTo(headX, o.y + i * th);
      ctx.lineTo(headX + dir * 10, o.y + (i + 0.5) * th);
      ctx.lineTo(headX, o.y + (i + 1) * th);
      ctx.closePath();
    }
    ctx.fill();
    outline(1.5);
    // lower facet of each tooth in shade → pyramids
    ctx.fillStyle = 'rgba(30, 26, 50, 0.45)';
    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      ctx.moveTo(headX, o.y + (i + 0.5) * th);
      ctx.lineTo(headX + dir * 10, o.y + (i + 0.5) * th);
      ctx.lineTo(headX, o.y + (i + 1) * th);
      ctx.closePath();
    }
    ctx.fill();
  }

  function drawPortal(o) {
    const aY = o.y + o.ringR;
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
    ctx.save();
    ctx.translate(o.ballX, o.ballY);
    orb(o.ballR, '#fff', '#ff80d0', '#400020', '#ff40a0', 14);
    ctx.restore();
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
    for (const side of [-1, 1]) {
      const edge = side < 0 ? 0 : W;
      const wp = new Path2D();
      wp.moveTo(edge, o.y);
      for (let i = 0; i <= segs; i++) {
        const yy = o.y + (i / segs) * o.h;
        wp.lineTo(ctrX(yy) + side * ch / 2, yy);
      }
      wp.lineTo(edge, o.y + o.h);
      wp.closePath();
      extrude(wp, '#140c2a', 0, 'rgba(180, 120, 255, 0.45)', 18);
      ctx.fillStyle = wallGrd;
      ctx.fill(wp);
    }
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
    mountBlock(o.anchorX - o.mountW / 2, mountY - 10, o.mountW, 12);
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
    // crystal cone: lit left facet, shaded right facet
    const hw = o.spikeW / 2;
    const cone = new Path2D();
    cone.moveTo(-hw, 0); cone.lineTo(hw, 0); cone.lineTo(0, o.spikeH); cone.closePath();
    ctx.fillStyle = '#6a5a80';
    ctx.shadowColor = 'rgba(180, 140, 255, 0.65)'; ctx.shadowBlur = 14;
    ctx.fill(cone);
    ctx.shadowBlur = 0;
    const lg = ctx.createLinearGradient(-hw, 0, 0, o.spikeH);
    lg.addColorStop(0, '#f0eaff'); lg.addColorStop(1, '#9a8ab4');
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.moveTo(-hw, 0); ctx.lineTo(0, 0); ctx.lineTo(0, o.spikeH); ctx.closePath(); ctx.fill();
    const dg = ctx.createLinearGradient(0, 0, hw, o.spikeH);
    dg.addColorStop(0, '#6a5a84'); dg.addColorStop(1, '#2a1e3a');
    ctx.fillStyle = dg;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(hw, 0); ctx.lineTo(0, o.spikeH); ctx.closePath(); ctx.fill();
    outline(2, cone);
    ctx.restore();
  }

  function drawBoomerang(o) {
    mountBlock(o.anchorX - 6, o.y - 4, 12, 28);
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
    const bp = new Path2D();
    bp.moveTo(-o.size, -o.size * 0.35);
    bp.lineTo(-o.size * 0.2, -o.size * 0.55);
    bp.lineTo(o.size * 0.35, 0);
    bp.lineTo(-o.size * 0.2, o.size * 0.55);
    bp.lineTo(-o.size, o.size * 0.35);
    bp.lineTo(-o.size * 0.35, 0);
    bp.closePath();
    extrude(bp, '#4a2006', o.spin, '#ffaa40', 16);
    const grd = ctx.createLinearGradient(-o.size, -o.size, o.size, o.size);
    grd.addColorStop(0, '#fff0c0'); grd.addColorStop(0.5, '#ffaa30'); grd.addColorStop(1, '#7a3a0a');
    ctx.fillStyle = grd;
    ctx.fill(bp);
    outline(1.5, bp);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.ellipse(-o.size * 0.35, -o.size * 0.18, o.size * 0.22, o.size * 0.08, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawSpikeCurtain(o) {
    const dirX = o.side === 'L' ? 1 : -1;
    const baseY = o.baseY;
    const halfW = o.tipW / 2;
    const tipX = o.baseX + dirX * o.tipLen;
    const p = new Path2D();
    p.moveTo(o.baseX, baseY - halfW);
    p.lineTo(o.baseX, baseY + halfW);
    p.lineTo(tipX, baseY);
    p.closePath();
    extrude(p, '#3a0614', 0, 'rgba(255, 80, 120, 0.65)', 12);
    // blade: lit upper facet, shaded lower facet, meeting at the ridge
    const up = ctx.createLinearGradient(0, baseY - halfW, 0, baseY);
    up.addColorStop(0, '#ffc0d4'); up.addColorStop(1, '#e05070');
    ctx.fillStyle = up;
    ctx.beginPath(); ctx.moveTo(o.baseX, baseY - halfW); ctx.lineTo(o.baseX, baseY); ctx.lineTo(tipX, baseY); ctx.closePath(); ctx.fill();
    const lo = ctx.createLinearGradient(0, baseY, 0, baseY + halfW);
    lo.addColorStop(0, '#a02848'); lo.addColorStop(1, '#4a0818');
    ctx.fillStyle = lo;
    ctx.beginPath(); ctx.moveTo(o.baseX, baseY); ctx.lineTo(o.baseX, baseY + halfW); ctx.lineTo(tipX, baseY); ctx.closePath(); ctx.fill();
    outline(2, p);
  }

  function drawYoyo(o) {
    const ay = o.y + o.ballR;
    // anchor mount on wall
    mountBlock(o.side === 'L' ? 0 : o.anchorX - 10, ay - 14, 10, 28);
    ctx.fillStyle = '#1a1a25';
    ctx.beginPath(); ctx.arc(o.anchorX, ay, 4, 0, Math.PI * 2); ctx.fill();
    // chain
    ctx.strokeStyle = 'rgba(200, 200, 220, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(o.anchorX, ay);
    ctx.lineTo(o.ballX, o.ballY);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(20, 20, 40, 0.6)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(o.anchorX, ay);
    ctx.lineTo(o.ballX, o.ballY);
    ctx.stroke();
    ctx.setLineDash([]);
    // spiked ball
    ctx.save();
    ctx.translate(o.ballX, o.ballY);
    ctx.rotate(o.spin);
    const R = o.ballR;
    const sp = starPath(10, R * 1.35, R * 0.88);
    extrude(sp, '#3a0818', o.spin, '#ff5080', 16);
    ctx.fillStyle = '#7a1838';
    ctx.fill(sp);
    facetStar(10, R * 1.35, R * 0.88, o.spin, 0.4, 0.45);
    outline(1.5, sp);
    ctx.rotate(-o.spin);   // ball shading stays lit from the top-left
    orb(R, '#fff', '#ff80a0', '#5a1030', '#ff5080', 0);
    ctx.fillStyle = '#1a0010';
    ctx.beginPath(); ctx.arc(0, 0, R * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawSliderArrows(o) {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
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
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx, cy, 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath(); ctx.arc(cx + eyeOff * 0.4, cy, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx + eyeOff * 0.4 - 1, cy - 1, 1, 0, Math.PI * 2); ctx.fill();
  }

  function drawGrowBarArrows(o) {
    const cy = o.y + o.h / 2;
    ctx.fillStyle = 'rgba(255, 240, 200, 0.85)';
    ctx.beginPath();
    ctx.moveTo(o.x - 7, cy);
    ctx.lineTo(o.x, cy - 6);
    ctx.lineTo(o.x, cy + 6);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(o.x + o.w + 7, cy);
    ctx.lineTo(o.x + o.w, cy - 6);
    ctx.lineTo(o.x + o.w, cy + 6);
    ctx.closePath();
    ctx.fill();
  }

  function drawAll(obstacles) {
    const timeMs = getTimeMs();
    ctx.lineJoin = 'round';
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
        case 'shrinker':   drawBar(o, '#ffd56b', '#ff9a2c', '#7a4810', 'rgba(255, 180, 60, 0.7)'); break;
        case 'saw':        drawSaw(o); break;
        case 'swarm':      drawSwarmUnit(o); break;
        case 'spinner':    drawSpinner(o); break;
        case 'gate':       drawGate(o); break;
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
    ctx.lineJoin = 'miter';
  }

  return { drawAll };
}
