// Player sprite atlas builder.
// Renders each animation frame to an offscreen canvas using a Skin from skins.js.
//
// Public API:
//   PlayerSprite.SPR_W, SPR_H, SPR_OFFX, SPR_OFFY  — sprite dimensions / body anchor
//   PlayerSprite.roundRectPath(ctx, x, y, w, h, r) — shared path helper
//   PlayerSprite.build(skin) → {
//     idle: [...frames],
//     run:  [...frames],
//     jump: frame,
//     fall: frame,
//     dead: frame,
//   }
(() => {
  const W = (window.OneJump = window.OneJump || {});

  const SPR_W = 72, SPR_H = 80;
  const SPR_OFFX = 18, SPR_OFFY = 24;
  const BODY_W = 36, BODY_H = 44;

  function roundRectPath(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  function rgba(rgb, a) {
    return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
  }

  // Render one sprite frame for given skin + frame opts.
  // opts: { t, mouth, eyeOff, antBob, capeWave, squash, stretch, dead, blink }
  function renderSprite(skin, opts) {
    const { t, mouth, eyeOff, antBob, capeWave, squash, stretch, dead, blink, motion = 0 } = opts;
    const cv = document.createElement('canvas');
    cv.width = SPR_W; cv.height = SPR_H;
    const c = cv.getContext('2d');

    const bx = SPR_OFFX, by = SPR_OFFY;
    const bw = BODY_W, bh = BODY_H;
    const cx = bx + bw/2, cy = by + bh/2;

    // squash/stretch transform
    const sx = (squash + (1/stretch)) / 2;
    const sy = stretch;
    c.save();
    c.translate(cx, cy);
    // dead-sprite rotation handled live in drawPlayer (animated)
    c.scale(sx, sy);
    c.translate(-cx, -cy);

    // aura
    const auraR = bw * skin.aura.radiusMul;
    const aura = c.createRadialGradient(cx, cy, 4, cx, cy, auraR);
    aura.addColorStop(0, rgba(skin.aura.rgb, skin.aura.alpha0 + t * skin.aura.alphaT));
    aura.addColorStop(1, rgba(skin.aura.rgb, 0));
    c.fillStyle = aura;
    c.beginPath();
    c.arc(cx, cy, auraR, 0, Math.PI * 2);
    c.fill();

    // motion streaks (trail behind body on left = backward of motion)
    if (!dead && motion > 0) {
      c.strokeStyle = `rgba(255,255,255,${0.55 * motion})`;
      c.lineWidth = 1.5;
      c.lineCap = 'round';
      const baseX = bx - 4;
      c.beginPath();
      c.moveTo(baseX, by + 12); c.lineTo(baseX - 8 * motion, by + 12);
      c.moveTo(baseX + 2, by + 24); c.lineTo(baseX - 10 * motion, by + 24);
      c.moveTo(baseX, by + 36); c.lineTo(baseX - 7 * motion, by + 36);
      c.stroke();
      c.lineCap = 'butt';
    }

    // cape — attached at upper-back (left side), trailing left-down (motion is rightward)
    if (!dead && skin.cape) {
      c.fillStyle = skin.cape.color;
      c.beginPath();
      c.moveTo(bx + 6, by + 8);
      // dramatic trailing curve back-left
      c.quadraticCurveTo(bx - 14 + capeWave, by + 20, bx - 12 + capeWave, by + 38);
      c.quadraticCurveTo(bx - 4 + capeWave * 0.5, by + 30, bx + 4, by + 28);
      c.lineTo(bx + 10, by + 10);
      c.closePath();
      c.fill();
      // sheen streak
      c.fillStyle = skin.cape.sheen;
      c.beginPath();
      c.moveTo(bx - 2 + capeWave, by + 16);
      c.quadraticCurveTo(bx - 8 + capeWave, by + 26, bx - 6 + capeWave, by + 34);
      c.lineTo(bx - 2 + capeWave, by + 32);
      c.quadraticCurveTo(bx - 4 + capeWave, by + 24, bx + 0 + capeWave, by + 18);
      c.closePath();
      c.fill();
    }

    // skin VFX (behind body — bolts/flames radiating outward)
    if (!dead && skin.accessories && skin.accessories.vfx) {
      drawSkinVfx(c, skin.accessories.vfx, bx, by, bw, bh, opts);
    }

    // body — diagonal gradient: bright top-right (front), dark bottom-left (back)
    const bodyGrd = c.createLinearGradient(bx + bw, by, bx, by + bh);
    bodyGrd.addColorStop(0,   skin.body.fill[0]);
    bodyGrd.addColorStop(0.5, skin.body.fill[1]);
    bodyGrd.addColorStop(1,   skin.body.fill[2]);
    c.fillStyle = bodyGrd;
    roundRectPath(c, bx, by, bw, bh, skin.body.radius);
    c.fill();
    c.lineWidth = 2;
    c.strokeStyle = skin.body.outline;
    c.stroke();

    // leading-edge (right-side) rim highlight
    c.fillStyle = skin.body.highlight;
    roundRectPath(c, bx + 14, by + 4, bw - 18, 6, 3);
    c.fill();
    // vertical rim on leading right side
    c.fillStyle = skin.body.highlight;
    roundRectPath(c, bx + bw - 6, by + 8, 3, bh - 18, 1.5);
    c.fill();

    // tiny nose / core gem (between eyes and mouth)
    const coreY = by + 22;
    const coreR = skin.core.baseR + t * 0.3;
    const coreGrd = c.createRadialGradient(cx - 0.7, coreY - 0.7, 0.5, cx, coreY, coreR + 1);
    coreGrd.addColorStop(0,   skin.core.fill[0]);
    coreGrd.addColorStop(0.4, skin.core.fill[1]);
    coreGrd.addColorStop(1,   skin.core.fill[2]);
    c.fillStyle = coreGrd;
    c.beginPath();
    c.arc(cx, coreY, coreR, 0, Math.PI * 2);
    c.fill();

    // antenna — leans BACK (left) like windswept by forward motion
    if (skin.antenna) {
      const antTipX = cx - 5;
      const antTipY = by - 10 + antBob;
      c.strokeStyle = skin.antenna.stroke;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(cx, by + 2);
      c.quadraticCurveTo(cx - 2, by - 6 + antBob, antTipX, antTipY);
      c.stroke();
      c.fillStyle = skin.antenna.halo;
      c.beginPath();
      c.arc(antTipX, antTipY, 5, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = skin.antenna.bulb;
      c.beginPath();
      c.arc(antTipX, antTipY, 2.5, 0, Math.PI * 2);
      c.fill();
    }

    // eyes
    const eyeY = by + 14;
    if (dead) {
      c.lineWidth = 2;
      c.strokeStyle = skin.eyes.deadX;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(bx + 7, eyeY - 2);  c.lineTo(bx + 13, eyeY + 2);
      c.moveTo(bx + 13, eyeY - 2); c.lineTo(bx + 7, eyeY + 2);
      c.moveTo(bx + 23, eyeY - 2); c.lineTo(bx + 29, eyeY + 2);
      c.moveTo(bx + 29, eyeY - 2); c.lineTo(bx + 23, eyeY + 2);
      c.stroke();
      c.lineCap = 'butt';
    } else if (blink) {
      c.strokeStyle = skin.eyes.pupil;
      c.lineWidth = 2;
      c.lineCap = 'round';
      c.beginPath();
      // happy curved blinks
      c.moveTo(bx + 6, eyeY + 1);
      c.quadraticCurveTo(bx + 10, eyeY - 3, bx + 14, eyeY + 1);
      c.moveTo(bx + 22, eyeY + 1);
      c.quadraticCurveTo(bx + 26, eyeY - 3, bx + 30, eyeY + 1);
      c.stroke();
      c.lineCap = 'butt';
    } else {
      const eL = bx + 10, eR = bx + 26;
      // big round eyes
      c.fillStyle = skin.eyes.sclera;
      c.beginPath(); c.arc(eL, eyeY, 5, 0, Math.PI*2); c.fill();
      c.beginPath(); c.arc(eR, eyeY, 5, 0, Math.PI*2); c.fill();
      // pupils gaze forward (right) — +1.2 px forward offset
      const gazeX = 1.2;
      c.fillStyle = skin.eyes.pupil;
      c.beginPath(); c.arc(eL + gazeX, eyeY + eyeOff + 0.5, 2.8, 0, Math.PI*2); c.fill();
      c.beginPath(); c.arc(eR + gazeX, eyeY + eyeOff + 0.5, 2.8, 0, Math.PI*2); c.fill();
      // sparkle on leading (right) side of pupil
      c.fillStyle = '#fff';
      c.beginPath(); c.arc(eL + gazeX + 1, eyeY - 1 + eyeOff, 1.2, 0, Math.PI*2); c.fill();
      c.beginPath(); c.arc(eR + gazeX + 1, eyeY - 1 + eyeOff, 1.2, 0, Math.PI*2); c.fill();
      // back-side glint
      c.beginPath(); c.arc(eL - 1.2, eyeY + 1.5 + eyeOff, 0.5, 0, Math.PI*2); c.fill();
      c.beginPath(); c.arc(eR - 1.2, eyeY + 1.5 + eyeOff, 0.5, 0, Math.PI*2); c.fill();
    }

    // cheek blush (skip on dead/blink for cleanliness... actually keep on blink)
    if (!dead && skin.blush) {
      c.fillStyle = skin.blush;
      c.beginPath(); c.ellipse(bx + 6,  eyeY + 7, 3, 1.8, 0, 0, Math.PI*2); c.fill();
      c.beginPath(); c.ellipse(bx + 30, eyeY + 7, 3, 1.8, 0, 0, Math.PI*2); c.fill();
    }

    // mouth — small + cute
    c.strokeStyle = skin.mouth.stroke;
    c.lineWidth = 1.8;
    c.lineCap = 'round';
    c.beginPath();
    if (mouth === 'smile') {
      // little 'w' smile
      c.moveTo(bx + 14, by + 31);
      c.quadraticCurveTo(bx + 16, by + 34, cx, by + 33);
      c.quadraticCurveTo(bx + 20, by + 34, bx + 22, by + 31);
    } else if (mouth === 'open') {
      c.fillStyle = skin.mouth.open;
      c.beginPath(); c.ellipse(cx, by + 33, 3.2, 3, 0, 0, Math.PI*2); c.fill();
      // tongue dot
      c.fillStyle = 'rgba(255,120,140,0.85)';
      c.beginPath(); c.arc(cx, by + 34.2, 1.4, 0, Math.PI*2); c.fill();
      c.beginPath();
    } else if (mouth === 'flat') {
      c.moveTo(bx + 15, by + 33);
      c.lineTo(bx + 21, by + 33);
    } else { // 'up' — small frown
      c.moveTo(bx + 15, by + 33);
      c.quadraticCurveTo(cx, by + 30, bx + 21, by + 33);
    }
    c.stroke();
    c.lineCap = 'butt';

    // accessories drawn over body (helm covers head, weapon held at side)
    if (skin.accessories) {
      if (skin.accessories.helm)   drawHelm  (c, skin.accessories.helm,   bx, by, bw, bh, opts);
      if (skin.accessories.weapon && !dead) drawWeapon(c, skin.accessories.weapon, bx, by, bw, bh, opts);
    }

    c.restore();
    return cv;
  }

  // ============================================================
  // Accessory renderers — extend skin schema with accessories.{helm,weapon,vfx}
  // ============================================================

  function drawHelm(c, helm, bx, by, bw, bh, opts) {
    const cx = bx + bw / 2;
    const outline = helm.outline || '#0a1428';
    const color = helm.color || '#a8b0c0';
    if (helm.type === 'winged') {
      // dome
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + 4, by + 9);
      c.quadraticCurveTo(cx, by - 11, bx + bw - 4, by + 9);
      c.lineTo(bx + bw - 4, by + 12);
      c.lineTo(bx + 4, by + 12);
      c.closePath();
      c.fill();
      c.lineWidth = 1.5;
      c.strokeStyle = outline;
      c.stroke();
      // central rim band
      c.fillStyle = helm.accent || '#ffd860';
      c.fillRect(bx + 4, by + 8, bw - 8, 2);
      // dome highlight
      c.fillStyle = helm.highlight || 'rgba(255,255,255,0.45)';
      c.beginPath();
      c.ellipse(cx + 5, by - 2, 4, 2, 0.3, 0, Math.PI * 2);
      c.fill();
      // wings
      const wing = helm.accent || '#ffd860';
      c.fillStyle = wing;
      // left (back) wing
      c.beginPath();
      c.moveTo(bx + 8, by + 4);
      c.quadraticCurveTo(bx - 8, by - 1, bx - 5, by + 9);
      c.quadraticCurveTo(bx - 1, by + 6, bx + 8, by + 8);
      c.closePath();
      c.fill();
      c.lineWidth = 1;
      c.strokeStyle = outline;
      c.stroke();
      // right (front) wing
      c.beginPath();
      c.moveTo(bx + bw - 8, by + 4);
      c.quadraticCurveTo(bx + bw + 8, by - 1, bx + bw + 5, by + 9);
      c.quadraticCurveTo(bx + bw + 1, by + 6, bx + bw - 8, by + 8);
      c.closePath();
      c.fill();
      c.stroke();
      // wing detail strokes
      c.strokeStyle = outline;
      c.lineWidth = 0.6;
      c.beginPath();
      c.moveTo(bx + 4, by + 5); c.lineTo(bx - 2, by + 6);
      c.moveTo(bx + 4, by + 7); c.lineTo(bx - 2, by + 8);
      c.moveTo(bx + bw - 4, by + 5); c.lineTo(bx + bw + 2, by + 6);
      c.moveTo(bx + bw - 4, by + 7); c.lineTo(bx + bw + 2, by + 8);
      c.stroke();
    } else if (helm.type === 'horned') {
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + 6, by + 11);
      c.quadraticCurveTo(cx, by - 5, bx + bw - 6, by + 11);
      c.lineTo(bx + bw - 6, by + 13);
      c.lineTo(bx + 6, by + 13);
      c.closePath();
      c.fill();
      c.strokeStyle = outline;
      c.lineWidth = 1.5;
      c.stroke();
      // horns
      c.fillStyle = helm.accent || '#fff8d8';
      c.beginPath();
      c.moveTo(bx + 8, by + 1);
      c.quadraticCurveTo(bx + 2, by - 9, bx, by - 4);
      c.lineTo(bx + 6, by + 5);
      c.closePath();
      c.fill(); c.stroke();
      c.beginPath();
      c.moveTo(bx + bw - 8, by + 1);
      c.quadraticCurveTo(bx + bw - 2, by - 9, bx + bw, by - 4);
      c.lineTo(bx + bw - 6, by + 5);
      c.closePath();
      c.fill(); c.stroke();
    } else if (helm.type === 'twistedHorns') {
      // Loki-style — long curving horns sweeping back, ornamental cap base
      const accent = helm.accent || '#ffd060';
      const horn = helm.horn || accent;
      // base cap
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + 6, by + 11);
      c.quadraticCurveTo(cx, by - 5, bx + bw - 6, by + 11);
      c.lineTo(bx + bw - 6, by + 13);
      c.lineTo(bx + 6, by + 13);
      c.closePath();
      c.fill();
      c.strokeStyle = outline;
      c.lineWidth = 1.5;
      c.stroke();
      // gold band at forehead
      c.fillStyle = accent;
      c.fillRect(bx + 6, by + 10, bw - 12, 2);
      c.lineWidth = 0.7;
      c.strokeStyle = outline;
      c.strokeRect(bx + 6, by + 10, bw - 12, 2);
      // left curving horn (sweep up-back-down)
      c.fillStyle = horn;
      c.beginPath();
      c.moveTo(bx + 8, by + 2);
      c.quadraticCurveTo(bx - 6, by - 9, bx - 7, by + 2);
      c.quadraticCurveTo(bx - 2, by - 4, bx + 4, by + 5);
      c.closePath();
      c.fill();
      c.strokeStyle = outline;
      c.lineWidth = 1.1;
      c.stroke();
      // ridges along left horn
      c.strokeStyle = outline;
      c.lineWidth = 0.5;
      c.beginPath();
      c.moveTo(bx + 5, by); c.lineTo(bx, by - 3);
      c.moveTo(bx + 3, by + 2); c.lineTo(bx - 3, by);
      c.moveTo(bx + 1, by + 4); c.lineTo(bx - 5, by + 1);
      c.stroke();
      // right curving horn (mirror)
      c.fillStyle = horn;
      c.beginPath();
      c.moveTo(bx + bw - 8, by + 2);
      c.quadraticCurveTo(bx + bw + 6, by - 9, bx + bw + 7, by + 2);
      c.quadraticCurveTo(bx + bw + 2, by - 4, bx + bw - 4, by + 5);
      c.closePath();
      c.fill();
      c.strokeStyle = outline;
      c.lineWidth = 1.1;
      c.stroke();
      c.strokeStyle = outline;
      c.lineWidth = 0.5;
      c.beginPath();
      c.moveTo(bx + bw - 5, by); c.lineTo(bx + bw, by - 3);
      c.moveTo(bx + bw - 3, by + 2); c.lineTo(bx + bw + 3, by);
      c.moveTo(bx + bw - 1, by + 4); c.lineTo(bx + bw + 5, by + 1);
      c.stroke();
    } else if (helm.type === 'circlet') {
      // golden circlet — Wukong's headband, simple gold band w/ ornamental side tips + center gem
      const accent = helm.accent || '#a06010';
      const gem = helm.gem;
      // side ornaments first (curved tips outside band)
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + 2, by + 6);
      c.quadraticCurveTo(bx - 5, by + 3, bx - 2, by + 11);
      c.lineTo(bx + 3, by + 10);
      c.closePath();
      c.fill();
      c.lineWidth = 1;
      c.strokeStyle = outline;
      c.stroke();
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + bw - 2, by + 6);
      c.quadraticCurveTo(bx + bw + 5, by + 3, bx + bw + 2, by + 11);
      c.lineTo(bx + bw - 3, by + 10);
      c.closePath();
      c.fill();
      c.stroke();
      // band — wraps forehead
      const bandGrd = c.createLinearGradient(0, by + 6, 0, by + 11);
      bandGrd.addColorStop(0, '#fff8c0');
      bandGrd.addColorStop(0.5, color);
      bandGrd.addColorStop(1, accent);
      c.fillStyle = bandGrd;
      c.fillRect(bx + 2, by + 6, bw - 4, 5);
      c.lineWidth = 1.2;
      c.strokeStyle = outline;
      c.strokeRect(bx + 2, by + 6, bw - 4, 5);
      // top edge sheen
      c.fillStyle = 'rgba(255,255,255,0.55)';
      c.fillRect(bx + 3, by + 6, bw - 6, 1);
      // groove line
      c.strokeStyle = accent;
      c.lineWidth = 0.6;
      c.beginPath();
      c.moveTo(bx + 3, by + 9.5); c.lineTo(bx + bw - 3, by + 9.5);
      c.stroke();
      // optional center gem
      if (gem) {
        c.fillStyle = gem;
        c.beginPath();
        c.arc(bx + bw/2, by + 8.5, 2, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = outline;
        c.lineWidth = 0.7;
        c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.7)';
        c.beginPath();
        c.arc(bx + bw/2 - 0.7, by + 7.8, 0.6, 0, Math.PI * 2);
        c.fill();
      }
    } else if (helm.type === 'leafCrown') {
      // ring of leaves around head
      const leafColor = color;
      const accent = helm.accent || '#1a5a18';
      const band = helm.band || '#4a8030';
      // band base
      c.fillStyle = band;
      c.fillRect(bx + 4, by + 8, bw - 8, 3);
      c.lineWidth = 1;
      c.strokeStyle = outline;
      c.strokeRect(bx + 4, by + 8, bw - 8, 3);
      // leaves
      const leaves = 5;
      for (let i = 0; i < leaves; i++) {
        const tt = i / (leaves - 1);
        const lx = bx + 6 + tt * (bw - 12);
        const ly = by + 8 - Math.sin(tt * Math.PI) * 7;
        c.save();
        c.translate(lx, ly);
        c.rotate((tt - 0.5) * 0.7);
        c.fillStyle = leafColor;
        c.beginPath();
        c.moveTo(0, 1);
        c.quadraticCurveTo(-3.5, -5, 0, -11);
        c.quadraticCurveTo(3.5, -5, 0, 1);
        c.closePath();
        c.fill();
        c.lineWidth = 0.8;
        c.strokeStyle = accent;
        c.stroke();
        // vein
        c.beginPath();
        c.moveTo(0, 0); c.lineTo(0, -10);
        c.stroke();
        c.restore();
      }
      // small berry/flower center accent
      if (helm.berry) {
        c.fillStyle = helm.berry;
        c.beginPath();
        c.arc(cx, by - 1, 1.6, 0, Math.PI * 2);
        c.fill();
      }
    } else if (helm.type === 'jackal') {
      const accent = helm.accent || '#ffd060';
      // nemes headcloth base
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + 2, by + 14);
      c.quadraticCurveTo(cx, by - 1, bx + bw - 2, by + 14);
      c.lineTo(bx + bw - 2, by + 16);
      c.lineTo(bx + 2, by + 16);
      c.closePath();
      c.fill();
      c.lineWidth = 1.5;
      c.strokeStyle = outline;
      c.stroke();
      // gold forehead band
      c.fillStyle = accent;
      c.fillRect(bx + 2, by + 11, bw - 4, 2);
      // ear stripes (gold accent across band)
      c.fillStyle = outline;
      for (let i = 0; i < 3; i++) c.fillRect(bx + 6 + i * 8, by + 11, 1, 2);
      // left jackal ear
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + 5, by + 4);
      c.lineTo(bx + 1, by - 10);
      c.lineTo(bx + 12, by + 1);
      c.closePath();
      c.fill(); c.stroke();
      // inner ear
      c.fillStyle = helm.innerEar || '#c83060';
      c.beginPath();
      c.moveTo(bx + 6, by + 2);
      c.lineTo(bx + 3, by - 6);
      c.lineTo(bx + 10, by + 1);
      c.closePath();
      c.fill();
      // right jackal ear
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + bw - 5, by + 4);
      c.lineTo(bx + bw - 1, by - 10);
      c.lineTo(bx + bw - 12, by + 1);
      c.closePath();
      c.fill(); c.stroke();
      c.fillStyle = helm.innerEar || '#c83060';
      c.beginPath();
      c.moveTo(bx + bw - 6, by + 2);
      c.lineTo(bx + bw - 3, by - 6);
      c.lineTo(bx + bw - 10, by + 1);
      c.closePath();
      c.fill();
      // uraeus jewel
      if (helm.jewel) {
        c.fillStyle = helm.jewel;
        c.beginPath();
        c.arc(cx, by + 5, 1.8, 0, Math.PI * 2);
        c.fill();
        c.lineWidth = 0.8;
        c.strokeStyle = outline;
        c.stroke();
      }
    } else if (helm.type === 'crown') {
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + 4, by + 11);
      c.lineTo(bx + 6, by - 4);
      c.lineTo(bx + 12, by + 5);
      c.lineTo(cx, by - 8);
      c.lineTo(bx + bw - 12, by + 5);
      c.lineTo(bx + bw - 6, by - 4);
      c.lineTo(bx + bw - 4, by + 11);
      c.closePath();
      c.fill();
      c.strokeStyle = outline;
      c.lineWidth = 1.5;
      c.stroke();
      // gem dots
      c.fillStyle = helm.accent || '#ff5577';
      c.beginPath(); c.arc(bx + 6, by - 4, 1.2, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(cx, by - 8, 1.6, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(bx + bw - 6, by - 4, 1.2, 0, Math.PI * 2); c.fill();
    }
  }

  function drawWeapon(c, weapon, bx, by, bw, bh, opts) {
    const outline = weapon.outline || '#0a1428';
    if (weapon.type === 'hammer') {
      // Mjolnir — runic stone head, leather-wrapped haft
      const handle = weapon.handle || '#5a3818';
      const head = weapon.head || '#9ca8bc';
      const accent = weapon.accent || '#ffd060';
      const swing = (opts.antBob || 0) * 0.3;
      const hx = bx + bw + 2;
      const hy = by + 22 + swing;
      // haft (tapered)
      const haftGrd = c.createLinearGradient(hx - 2, 0, hx + 2, 0);
      haftGrd.addColorStop(0, handle);
      haftGrd.addColorStop(0.5, '#7a5828');
      haftGrd.addColorStop(1, handle);
      c.fillStyle = haftGrd;
      roundRectPath(c, hx - 1.4, hy + 4, 3, 17, 1);
      c.fill();
      c.lineWidth = 1;
      c.strokeStyle = outline;
      c.stroke();
      // leather wrap (3 bands)
      c.fillStyle = '#3a1a08';
      for (let i = 0; i < 3; i++) c.fillRect(hx - 1.4, hy + 8 + i * 4, 3, 1);
      // pommel knob
      c.fillStyle = accent;
      c.beginPath(); c.arc(hx, hy + 22, 1.6, 0, Math.PI * 2); c.fill();
      c.strokeStyle = outline; c.lineWidth = 0.8; c.stroke();
      // head — cuboid with bevel
      const headGrd = c.createLinearGradient(0, hy - 5, 0, hy + 6);
      headGrd.addColorStop(0, '#e8eef4');
      headGrd.addColorStop(0.5, head);
      headGrd.addColorStop(1, '#3a4858');
      c.fillStyle = headGrd;
      roundRectPath(c, hx - 8, hy - 6, 16, 12, 2);
      c.fill();
      c.lineWidth = 1.3;
      c.strokeStyle = outline;
      c.stroke();
      // bevel chamfer lines
      c.strokeStyle = 'rgba(0,0,0,0.45)';
      c.lineWidth = 0.7;
      c.beginPath();
      c.moveTo(hx - 7, hy - 4); c.lineTo(hx + 7, hy - 4);
      c.moveTo(hx - 7, hy + 4); c.lineTo(hx + 7, hy + 4);
      c.stroke();
      // glowing rune line
      c.strokeStyle = accent;
      c.lineWidth = 0.9;
      c.beginPath();
      c.moveTo(hx - 4, hy - 1); c.lineTo(hx - 1, hy + 1);
      c.lineTo(hx - 1, hy - 1); c.lineTo(hx + 2, hy + 1);
      c.lineTo(hx + 2, hy - 1); c.lineTo(hx + 4, hy + 1);
      c.stroke();
      // edge highlight
      c.fillStyle = 'rgba(255,255,255,0.55)';
      c.fillRect(hx - 6, hy - 5, 12, 1);
    } else if (weapon.type === 'sword') {
      // sword — fullered blade, ornate cross-guard, gem pommel
      const blade = weapon.blade || '#dde8f0';
      const guard = weapon.accent || '#ffd060';
      const grip = weapon.grip || '#5a3818';
      const hx = bx + bw + 3;
      const hy = by + 4;
      // blade — diamond-cross-section silhouette
      const bGrd = c.createLinearGradient(hx - 3, 0, hx + 3, 0);
      bGrd.addColorStop(0, '#7a8898');
      bGrd.addColorStop(0.4, blade);
      bGrd.addColorStop(0.6, '#fff');
      bGrd.addColorStop(1, '#5a6878');
      c.fillStyle = bGrd;
      c.beginPath();
      c.moveTo(hx, hy);
      c.lineTo(hx + 2.3, hy + 4);
      c.lineTo(hx + 2.3, hy + 22);
      c.lineTo(hx, hy + 26);
      c.lineTo(hx - 2.3, hy + 22);
      c.lineTo(hx - 2.3, hy + 4);
      c.closePath();
      c.fill();
      c.strokeStyle = outline; c.lineWidth = 1; c.stroke();
      // fuller groove
      c.strokeStyle = 'rgba(0,0,0,0.4)';
      c.lineWidth = 0.6;
      c.beginPath();
      c.moveTo(hx, hy + 3); c.lineTo(hx, hy + 22);
      c.stroke();
      // edge sheen
      c.strokeStyle = 'rgba(255,255,255,0.55)';
      c.lineWidth = 0.5;
      c.beginPath();
      c.moveTo(hx - 1.6, hy + 5); c.lineTo(hx - 1.6, hy + 21);
      c.stroke();
      // cross-guard (with curved arms)
      c.fillStyle = guard;
      c.beginPath();
      c.moveTo(hx - 6, hy + 26);
      c.quadraticCurveTo(hx - 5, hy + 24, hx - 2, hy + 25);
      c.lineTo(hx + 2, hy + 25);
      c.quadraticCurveTo(hx + 5, hy + 24, hx + 6, hy + 26);
      c.lineTo(hx + 6, hy + 28);
      c.lineTo(hx - 6, hy + 28);
      c.closePath();
      c.fill();
      c.strokeStyle = outline; c.lineWidth = 0.9; c.stroke();
      // central rivet
      c.fillStyle = '#fff';
      c.beginPath(); c.arc(hx, hy + 27, 0.8, 0, Math.PI * 2); c.fill();
      // grip (wrapped)
      c.fillStyle = grip;
      c.fillRect(hx - 1.2, hy + 28, 2.4, 6);
      c.strokeStyle = outline; c.lineWidth = 0.8;
      c.strokeRect(hx - 1.2, hy + 28, 2.4, 6);
      // wrap stripes
      c.strokeStyle = 'rgba(0,0,0,0.5)';
      c.lineWidth = 0.5;
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.moveTo(hx - 1.2, hy + 30 + i * 1.5);
        c.lineTo(hx + 1.2, hy + 30 + i * 1.5);
        c.stroke();
      }
      // pommel — gem ball
      const pGrd = c.createRadialGradient(hx - 0.5, hy + 33.5, 0.3, hx, hy + 34.5, 2);
      pGrd.addColorStop(0, '#fff');
      pGrd.addColorStop(1, guard);
      c.fillStyle = pGrd;
      c.beginPath(); c.arc(hx, hy + 35, 1.8, 0, Math.PI * 2); c.fill();
      c.strokeStyle = outline; c.lineWidth = 0.9; c.stroke();
    } else if (weapon.type === 'trident') {
      // trident — barbed prongs, ornate crossbar, gripped haft
      const pole = weapon.handle || '#2c4860';
      const prong = weapon.head || '#dde8f0';
      const accent = weapon.accent || '#7df';
      const hx = bx + bw + 3;
      const hy = by + 2;
      // shaft
      const sGrd = c.createLinearGradient(hx - 1.5, 0, hx + 1.5, 0);
      sGrd.addColorStop(0, pole);
      sGrd.addColorStop(0.5, '#5a8098');
      sGrd.addColorStop(1, pole);
      c.fillStyle = sGrd;
      roundRectPath(c, hx - 1.2, hy + 8, 2.4, 28, 1);
      c.fill();
      c.lineWidth = 1; c.strokeStyle = outline; c.stroke();
      // grip wrap
      c.strokeStyle = 'rgba(0,0,0,0.5)';
      c.lineWidth = 0.5;
      for (let i = 0; i < 4; i++) {
        c.beginPath();
        c.moveTo(hx - 1.2, hy + 22 + i * 2.5);
        c.lineTo(hx + 1.2, hy + 22 + i * 2.5);
        c.stroke();
      }
      // pommel
      c.fillStyle = accent;
      c.beginPath(); c.arc(hx, hy + 37, 1.4, 0, Math.PI * 2); c.fill();
      c.strokeStyle = outline; c.lineWidth = 0.8; c.stroke();
      // ornate crossbar (filigree shape)
      c.fillStyle = accent;
      c.beginPath();
      c.moveTo(hx - 6, hy + 7);
      c.quadraticCurveTo(hx - 4, hy + 5, hx, hy + 6);
      c.quadraticCurveTo(hx + 4, hy + 5, hx + 6, hy + 7);
      c.lineTo(hx + 6, hy + 9);
      c.quadraticCurveTo(hx + 4, hy + 8, hx, hy + 9);
      c.quadraticCurveTo(hx - 4, hy + 8, hx - 6, hy + 9);
      c.closePath();
      c.fill();
      c.strokeStyle = outline; c.lineWidth = 0.8; c.stroke();
      // center prong (long, barbed)
      c.fillStyle = prong;
      c.beginPath();
      c.moveTo(hx, hy - 7);
      c.lineTo(hx - 1.6, hy + 6);
      c.lineTo(hx + 1.6, hy + 6);
      c.closePath();
      c.fill();
      c.strokeStyle = outline; c.lineWidth = 1; c.stroke();
      // center barb
      c.beginPath();
      c.moveTo(hx - 1.6, hy - 1);
      c.lineTo(hx - 3, hy + 1);
      c.lineTo(hx - 1.6, hy + 1);
      c.closePath(); c.fill(); c.stroke();
      c.beginPath();
      c.moveTo(hx + 1.6, hy - 1);
      c.lineTo(hx + 3, hy + 1);
      c.lineTo(hx + 1.6, hy + 1);
      c.closePath(); c.fill(); c.stroke();
      // left prong (curved barb)
      c.beginPath();
      c.moveTo(hx - 6, hy + 1);
      c.quadraticCurveTo(hx - 8, hy - 3, hx - 4.5, hy + 6);
      c.lineTo(hx - 3.2, hy + 6);
      c.quadraticCurveTo(hx - 4.5, hy + 1, hx - 4.5, hy + 1);
      c.closePath();
      c.fill(); c.stroke();
      // right prong
      c.beginPath();
      c.moveTo(hx + 6, hy + 1);
      c.quadraticCurveTo(hx + 8, hy - 3, hx + 4.5, hy + 6);
      c.lineTo(hx + 3.2, hy + 6);
      c.quadraticCurveTo(hx + 4.5, hy + 1, hx + 4.5, hy + 1);
      c.closePath();
      c.fill(); c.stroke();
      // tip glow
      const glow = c.createRadialGradient(hx, hy - 7, 0.3, hx, hy - 7, 4);
      glow.addColorStop(0, accent);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = glow;
      c.beginPath(); c.arc(hx, hy - 7, 4, 0, Math.PI * 2); c.fill();
    } else if (weapon.type === 'dagger') {
      // dagger — curved blade, winged guard, gem pommel
      const blade = weapon.blade || '#dde8f0';
      const guard = weapon.accent || '#a8e070';
      const grip = weapon.handle || '#3a2008';
      const hx = bx + bw + 3;
      const hy = by + 12;
      // blade — slightly curved
      const bGrd = c.createLinearGradient(hx - 2, 0, hx + 2, 0);
      bGrd.addColorStop(0, '#7a8898');
      bGrd.addColorStop(0.5, blade);
      bGrd.addColorStop(1, '#5a6878');
      c.fillStyle = bGrd;
      c.beginPath();
      c.moveTo(hx, hy);
      c.quadraticCurveTo(hx + 2.5, hy + 6, hx + 1.8, hy + 14);
      c.lineTo(hx - 1.8, hy + 14);
      c.quadraticCurveTo(hx - 1.5, hy + 6, hx, hy);
      c.closePath();
      c.fill();
      c.strokeStyle = outline; c.lineWidth = 0.9; c.stroke();
      // edge sheen
      c.strokeStyle = 'rgba(255,255,255,0.6)';
      c.lineWidth = 0.5;
      c.beginPath();
      c.moveTo(hx + 1, hy + 4); c.quadraticCurveTo(hx + 1.5, hy + 8, hx + 1, hy + 13);
      c.stroke();
      // winged crossguard (flared)
      c.fillStyle = guard;
      c.beginPath();
      c.moveTo(hx - 4, hy + 14);
      c.quadraticCurveTo(hx - 5, hy + 13, hx - 3, hy + 14.5);
      c.lineTo(hx + 3, hy + 14.5);
      c.quadraticCurveTo(hx + 5, hy + 13, hx + 4, hy + 14);
      c.lineTo(hx + 4, hy + 16);
      c.lineTo(hx - 4, hy + 16);
      c.closePath();
      c.fill();
      c.strokeStyle = outline; c.lineWidth = 0.8; c.stroke();
      // grip wrap
      c.fillStyle = grip;
      c.fillRect(hx - 1, hy + 16, 2, 5);
      c.strokeRect(hx - 1, hy + 16, 2, 5);
      c.strokeStyle = 'rgba(0,0,0,0.5)';
      c.lineWidth = 0.4;
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.moveTo(hx - 1, hy + 17 + i * 1.4);
        c.lineTo(hx + 1, hy + 17 + i * 1.4);
        c.stroke();
      }
      // gem pommel
      const pgrd = c.createRadialGradient(hx - 0.4, hy + 21.5, 0.2, hx, hy + 22, 2);
      pgrd.addColorStop(0, '#fff');
      pgrd.addColorStop(1, guard);
      c.fillStyle = pgrd;
      c.beginPath(); c.arc(hx, hy + 22, 1.6, 0, Math.PI * 2); c.fill();
      c.strokeStyle = outline; c.lineWidth = 0.8; c.stroke();
    } else if (weapon.type === 'staff') {
      // staff — orb in claw, decorative bands, glow
      const pole = weapon.handle || '#5a3818';
      const bulb = weapon.accent || '#7df';
      const hx = bx + bw + 3;
      const hy = by + 2;
      // shaft
      const sGrd = c.createLinearGradient(hx - 1.5, 0, hx + 1.5, 0);
      sGrd.addColorStop(0, pole);
      sGrd.addColorStop(0.5, '#a07840');
      sGrd.addColorStop(1, pole);
      c.fillStyle = sGrd;
      roundRectPath(c, hx - 1.2, hy + 8, 2.4, 28, 1);
      c.fill();
      c.lineWidth = 1; c.strokeStyle = outline; c.stroke();
      // grip wraps
      c.strokeStyle = 'rgba(0,0,0,0.5)';
      c.lineWidth = 0.5;
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.moveTo(hx - 1.2, hy + 22 + i * 3);
        c.lineTo(hx + 1.2, hy + 22 + i * 3);
        c.stroke();
      }
      // pommel
      c.fillStyle = bulb;
      c.beginPath(); c.arc(hx, hy + 37, 1.4, 0, Math.PI * 2); c.fill();
      c.strokeStyle = outline; c.lineWidth = 0.8; c.stroke();
      // claw mount (3 prongs cradling orb)
      c.fillStyle = pole;
      c.strokeStyle = outline;
      c.lineWidth = 0.8;
      c.beginPath();
      c.moveTo(hx - 4, hy + 8);
      c.quadraticCurveTo(hx - 4, hy + 2, hx - 2, hy);
      c.lineTo(hx - 2, hy + 6);
      c.lineTo(hx - 3, hy + 8);
      c.closePath();
      c.fill(); c.stroke();
      c.beginPath();
      c.moveTo(hx + 4, hy + 8);
      c.quadraticCurveTo(hx + 4, hy + 2, hx + 2, hy);
      c.lineTo(hx + 2, hy + 6);
      c.lineTo(hx + 3, hy + 8);
      c.closePath();
      c.fill(); c.stroke();
      // outer glow halo
      const halo = c.createRadialGradient(hx, hy + 1, 1, hx, hy + 1, 8);
      halo.addColorStop(0, bulb);
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      c.save();
      c.globalAlpha = 0.5;
      c.fillStyle = halo;
      c.beginPath(); c.arc(hx, hy + 1, 8, 0, Math.PI * 2); c.fill();
      c.restore();
      // orb (glowing ball)
      const bulbGrd = c.createRadialGradient(hx - 1.5, hy - 0.5, 0.3, hx, hy + 1, 5);
      bulbGrd.addColorStop(0, '#ffffff');
      bulbGrd.addColorStop(0.5, bulb);
      bulbGrd.addColorStop(1, '#1a1838');
      c.fillStyle = bulbGrd;
      c.beginPath(); c.arc(hx, hy + 1, 4, 0, Math.PI * 2); c.fill();
      c.strokeStyle = outline; c.lineWidth = 0.9; c.stroke();
      // orb sparkle
      c.fillStyle = '#fff';
      c.beginPath(); c.arc(hx - 1.6, hy - 0.5, 0.7, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(hx + 1.5, hy + 2, 0.4, 0, Math.PI * 2); c.fill();
    }
  }

  function drawSkinVfx(c, vfx, bx, by, bw, bh, opts) {
    const t = opts.t || 0;
    const cx = bx + bw / 2, cy = by + bh / 2;
    if (vfx.type === 'lightning') {
      const color = vfx.color || '#fff8a0';
      const seed = Math.floor(t * 7);
      c.lineCap = 'round';
      c.lineWidth = 1.5;
      // halo flash
      const halo = c.createRadialGradient(cx, cy, bw * 0.4, cx, cy, bw * 1.1);
      halo.addColorStop(0, 'rgba(255,248,160,0)');
      halo.addColorStop(0.7, `rgba(255,248,160,${0.18 + t * 0.2})`);
      halo.addColorStop(1, 'rgba(255,248,160,0)');
      c.fillStyle = halo;
      c.beginPath(); c.arc(cx, cy, bw * 1.1, 0, Math.PI * 2); c.fill();
      // bolts
      const bolts = 4;
      for (let i = 0; i < bolts; i++) {
        const a = (i / bolts) * Math.PI * 2 + seed * 0.4;
        const r0 = bw * 0.5;
        const r1 = bw * (0.95 + ((seed + i) % 3) * 0.08);
        const x0 = cx + Math.cos(a) * r0;
        const y0 = cy + Math.sin(a) * r0;
        const x1 = cx + Math.cos(a) * r1;
        const y1 = cy + Math.sin(a) * r1;
        const mx = (x0 + x1) / 2 + Math.sin(seed * 1.3 + i) * 3.5;
        const my = (y0 + y1) / 2 + Math.cos(seed * 1.7 + i) * 3.5;
        // outer glow stroke
        c.strokeStyle = `rgba(255,248,160,0.35)`;
        c.lineWidth = 3;
        c.beginPath(); c.moveTo(x0, y0); c.lineTo(mx, my); c.lineTo(x1, y1); c.stroke();
        // core stroke
        c.strokeStyle = color;
        c.lineWidth = 1.4;
        c.beginPath(); c.moveTo(x0, y0); c.lineTo(mx, my); c.lineTo(x1, y1); c.stroke();
        // tip spark
        c.fillStyle = '#fff';
        c.beginPath(); c.arc(x1, y1, 1.6, 0, Math.PI * 2); c.fill();
      }
      c.lineCap = 'butt';
    } else if (vfx.type === 'fire') {
      const color = vfx.color || '#ff8040';
      const hot = vfx.hot || '#ffe080';
      // warm halo
      const halo = c.createRadialGradient(cx, cy + 6, bw * 0.4, cx, cy + 6, bw * 1.0);
      halo.addColorStop(0, 'rgba(255,160,40,0)');
      halo.addColorStop(0.6, `rgba(255,140,40,${0.18 + t * 0.18})`);
      halo.addColorStop(1, 'rgba(255,80,20,0)');
      c.fillStyle = halo;
      c.beginPath(); c.arc(cx, cy + 6, bw, 0, Math.PI * 2); c.fill();
      // bottom flames
      for (let i = 0; i < 5; i++) {
        const x = bx + 6 + i * (bw - 12) / 4;
        const h = 5 + Math.sin(t * 6 + i * 1.7) * 5;
        const grd = c.createLinearGradient(x, by + bh, x, by + bh + h + 5);
        grd.addColorStop(0, hot);
        grd.addColorStop(0.4, color);
        grd.addColorStop(1, 'rgba(255,80,20,0)');
        c.fillStyle = grd;
        c.beginPath();
        c.moveTo(x - 3, by + bh);
        c.quadraticCurveTo(x, by + bh + h + 5, x + 3, by + bh);
        c.closePath();
        c.fill();
      }
      // side licks
      for (let i = 0; i < 2; i++) {
        const dir = i === 0 ? -1 : 1;
        const sx = (i === 0 ? bx : bx + bw) + dir * (3 + Math.sin(t * 5 + i) * 2);
        const sy = by + bh - 8;
        const sz = 3 + Math.sin(t * 7 + i * 2) * 1.5;
        const g = c.createRadialGradient(sx, sy, 0.5, sx, sy, sz);
        g.addColorStop(0, hot);
        g.addColorStop(1, 'rgba(255,80,20,0)');
        c.fillStyle = g;
        c.beginPath(); c.arc(sx, sy, sz, 0, Math.PI * 2); c.fill();
      }
      // rising embers
      for (let i = 0; i < 3; i++) {
        const phase = (t * 2 + i / 3) % 1;
        const ex = bx + 8 + ((i * 13 + Math.floor(t * 4)) % (bw - 16));
        const ey = by + bh - phase * (bh + 6);
        const ea = 1 - phase;
        c.fillStyle = `rgba(255,220,120,${ea * 0.9})`;
        c.fillRect(ex, ey, 1.4, 1.4);
      }
    } else if (vfx.type === 'water') {
      const color = vfx.color || '#7df';
      const ring = c.createRadialGradient(cx, cy, bw * 0.55, cx, cy, bw * 1.05);
      ring.addColorStop(0, 'rgba(120,220,255,0)');
      ring.addColorStop(0.7, `rgba(120,220,255,${0.22 + t * 0.15})`);
      ring.addColorStop(1, 'rgba(80,180,240,0)');
      c.fillStyle = ring;
      c.beginPath(); c.arc(cx, cy, bw * 1.05, 0, Math.PI * 2); c.fill();
      // bubbles
      for (let i = 0; i < 5; i++) {
        const a = t * 3 + i * 1.3;
        const r = bw * (0.6 + Math.sin(t * 5 + i) * 0.2);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a * 1.4) * (bh * 0.5);
        const sz = 1.5 + Math.sin(t * 7 + i * 1.7) * 1;
        c.fillStyle = 'rgba(220,240,255,0.7)';
        c.beginPath(); c.arc(x, y, Math.abs(sz) + 0.5, 0, Math.PI * 2); c.fill();
        c.strokeStyle = color;
        c.lineWidth = 0.7;
        c.stroke();
      }
      // splash droplets at base
      for (let i = 0; i < 3; i++) {
        const x = bx + 8 + i * (bw - 16) / 2 + Math.sin(t * 4 + i) * 3;
        const y = by + bh - 1 + Math.sin(t * 6 + i * 2) * 2;
        c.fillStyle = color;
        c.beginPath(); c.arc(x, y, 1.3, 0, Math.PI * 2); c.fill();
      }
    } else if (vfx.type === 'darkfire') {
      const color = vfx.color || '#9040ff';
      const hot = vfx.hot || '#ff60c0';
      const halo = c.createRadialGradient(cx, cy + 4, bw * 0.4, cx, cy + 4, bw * 1.0);
      halo.addColorStop(0, 'rgba(120,40,200,0)');
      halo.addColorStop(0.6, `rgba(140,60,220,${0.22 + t * 0.18})`);
      halo.addColorStop(1, 'rgba(40,8,80,0)');
      c.fillStyle = halo;
      c.beginPath(); c.arc(cx, cy + 4, bw, 0, Math.PI * 2); c.fill();
      for (let i = 0; i < 5; i++) {
        const x = bx + 6 + i * (bw - 12) / 4;
        const h = 5 + Math.sin(t * 6 + i * 1.7) * 5;
        const grd = c.createLinearGradient(x, by + bh, x, by + bh + h + 5);
        grd.addColorStop(0, hot);
        grd.addColorStop(0.4, color);
        grd.addColorStop(1, 'rgba(40,8,80,0)');
        c.fillStyle = grd;
        c.beginPath();
        c.moveTo(x - 3, by + bh);
        c.quadraticCurveTo(x, by + bh + h + 5, x + 3, by + bh);
        c.closePath();
        c.fill();
      }
      // upward dark sparks
      for (let i = 0; i < 4; i++) {
        const phase = (t * 1.8 + i / 4) % 1;
        const ex = bx + 6 + ((i * 11 + Math.floor(t * 3)) % (bw - 12));
        const ey = by + bh - phase * (bh + 6);
        const ea = 1 - phase;
        c.fillStyle = `rgba(200,120,255,${ea * 0.85})`;
        c.fillRect(ex, ey, 1.5, 1.5);
      }
    } else if (vfx.type === 'gold') {
      const color = vfx.color || '#ffd060';
      const halo = c.createRadialGradient(cx, cy, bw * 0.5, cx, cy, bw * 1.0);
      halo.addColorStop(0, 'rgba(255,220,120,0)');
      halo.addColorStop(0.7, `rgba(255,210,90,${0.22 + t * 0.18})`);
      halo.addColorStop(1, 'rgba(220,160,40,0)');
      c.fillStyle = halo;
      c.beginPath(); c.arc(cx, cy, bw, 0, Math.PI * 2); c.fill();
      // orbiting sparkles
      for (let i = 0; i < 6; i++) {
        const a = t * 3 + i * (Math.PI * 2 / 6);
        const r = bw * (0.7 + Math.sin(t * 4 + i) * 0.18);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a * 1.2) * (bh * 0.5);
        const sz = 1 + Math.abs(Math.sin(t * 8 + i)) * 1.4;
        c.fillStyle = `rgba(255,240,180,${Math.min(1, sz / 2)})`;
        c.beginPath(); c.arc(x, y, sz + 0.4, 0, Math.PI * 2); c.fill();
        if (sz > 1.4) {
          c.fillStyle = color;
          c.fillRect(x - 4, y - 0.4, 8, 0.8);
          c.fillRect(x - 0.4, y - 4, 0.8, 8);
        }
      }
    } else if (vfx.type === 'shadow') {
      const color = vfx.color || '#c080ff';
      const ringColor = vfx.ring || 'rgba(140,60,200,';
      // dark aura ring
      const ring = c.createRadialGradient(cx, cy, bw * 0.5, cx, cy, bw * 1.05);
      ring.addColorStop(0, 'rgba(80,30,120,0)');
      ring.addColorStop(0.7, ringColor + (0.28 + t * 0.18) + ')');
      ring.addColorStop(1, 'rgba(80,30,120,0)');
      c.fillStyle = ring;
      c.beginPath(); c.arc(cx, cy, bw * 1.05, 0, Math.PI * 2); c.fill();
      // 5 wisps orbiting
      const wisps = 5;
      for (let i = 0; i < wisps; i++) {
        const a = t * 4 + i * (Math.PI * 2 / wisps);
        const r = bw * (0.7 + Math.sin(t * 3 + i) * 0.18);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.85;
        const sz = 2.4 + Math.sin(t * 6 + i * 1.7) * 1.2;
        const g = c.createRadialGradient(x, y, 0.4, x, y, sz);
        g.addColorStop(0, color);
        g.addColorStop(0.5, 'rgba(160,80,220,0.5)');
        g.addColorStop(1, 'rgba(120,60,180,0)');
        c.fillStyle = g;
        c.beginPath(); c.arc(x, y, sz, 0, Math.PI * 2); c.fill();
      }
      // trailing dark sparkle
      c.fillStyle = '#fff';
      for (let i = 0; i < 2; i++) {
        const a = t * 5 + i * Math.PI;
        const r = bw * 0.92;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.7;
        c.beginPath(); c.arc(x, y, 0.8, 0, Math.PI * 2); c.fill();
      }
    } else if (vfx.type === 'leaf') {
      const color = vfx.color || '#a8e070';
      const dark = vfx.vein || '#1a5a18';
      // soft green halo
      const halo = c.createRadialGradient(cx, cy, bw * 0.45, cx, cy, bw * 1.0);
      halo.addColorStop(0, 'rgba(160,255,140,0)');
      halo.addColorStop(0.7, `rgba(140,220,120,${0.18 + t * 0.12})`);
      halo.addColorStop(1, 'rgba(80,180,80,0)');
      c.fillStyle = halo;
      c.beginPath(); c.arc(cx, cy, bw, 0, Math.PI * 2); c.fill();
      // orbiting leaves
      for (let i = 0; i < 5; i++) {
        const a = t * 2.5 + i * (Math.PI * 2 / 5);
        const x = cx + Math.cos(a) * (bw * 0.75);
        const y = cy + Math.sin(a * 1.2) * (bh * 0.5);
        c.save();
        c.translate(x, y);
        c.rotate(a + Math.PI / 4);
        c.fillStyle = color;
        c.beginPath();
        c.moveTo(0, 2);
        c.quadraticCurveTo(-3, -2, 0, -5);
        c.quadraticCurveTo(3, -2, 0, 2);
        c.closePath();
        c.fill();
        // vein
        c.strokeStyle = dark;
        c.lineWidth = 0.5;
        c.beginPath();
        c.moveTo(0, 2); c.lineTo(0, -5);
        c.stroke();
        c.restore();
      }
      // floating petals
      for (let i = 0; i < 2; i++) {
        const a = t * 4 + i * Math.PI;
        const x = cx + Math.cos(a) * (bw * 0.6);
        const y = cy + Math.sin(a) * (bh * 0.4) - 2;
        c.fillStyle = vfx.petal || '#ff89ab';
        c.beginPath(); c.arc(x, y, 1.4, 0, Math.PI * 2); c.fill();
      }
    } else if (vfx.type === 'sunburst') {
      // radiating rays + bright halo (sun god vibe — no upward flames like fire)
      const color = vfx.color || '#ffd060';
      const ray = vfx.ray || '#fff8c0';
      const halo = c.createRadialGradient(cx, cy, bw * 0.4, cx, cy, bw * 1.2);
      halo.addColorStop(0, ray);
      halo.addColorStop(0.4, `rgba(255,210,90,${0.3 + t * 0.2})`);
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      c.save();
      c.globalAlpha = 0.55;
      c.fillStyle = halo;
      c.beginPath(); c.arc(cx, cy, bw * 1.2, 0, Math.PI * 2); c.fill();
      c.restore();
      c.strokeStyle = ray;
      c.lineCap = 'round';
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + t * 0.5;
        const r1 = bw * 0.55;
        const r2 = bw * (1.0 + Math.sin(t * 3 + i) * 0.12);
        c.lineWidth = i % 2 === 0 ? 2 : 1;
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        c.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
        c.stroke();
      }
      c.lineCap = 'butt';
      // tip sparkles
      for (let i = 0; i < 4; i++) {
        const a = t * 1.5 + i * (Math.PI / 2);
        const r = bw * 0.95;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        c.fillStyle = '#fff';
        c.fillRect(x - 1, y - 1, 2, 2);
      }
      // inner ring outline
      c.strokeStyle = color;
      c.lineWidth = 0.8;
      c.beginPath();
      c.arc(cx, cy, bw * 0.55, 0, Math.PI * 2);
      c.stroke();
    } else if (vfx.type === 'petals') {
      // drifting flower petals — pink/red, dark vein (Persephone, Aphrodite vibe)
      const color = vfx.color || '#ff89ab';
      const dark = vfx.dark || '#a82060';
      const halo = c.createRadialGradient(cx, cy, bw * 0.4, cx, cy, bw * 1.0);
      halo.addColorStop(0, 'rgba(255,180,210,0)');
      halo.addColorStop(0.7, `rgba(255,140,180,${0.18 + t * 0.12})`);
      halo.addColorStop(1, 'rgba(180,40,100,0)');
      c.fillStyle = halo;
      c.beginPath(); c.arc(cx, cy, bw, 0, Math.PI * 2); c.fill();
      const petals = 6;
      for (let i = 0; i < petals; i++) {
        const phase = t * 1.5 + i * (Math.PI * 2 / petals);
        const r = bw * 0.7 + Math.sin(t * 2 + i) * 4;
        const x = cx + Math.cos(phase) * r;
        const y = cy + Math.sin(phase * 1.2) * (bh * 0.5);
        const rot = phase * 1.5;
        c.save();
        c.translate(x, y);
        c.rotate(rot);
        const petalGrd = c.createLinearGradient(0, -3, 0, 3);
        petalGrd.addColorStop(0, '#fff');
        petalGrd.addColorStop(0.5, color);
        petalGrd.addColorStop(1, dark);
        c.fillStyle = petalGrd;
        c.beginPath();
        c.moveTo(0, -3.5);
        c.quadraticCurveTo(2.5, 0, 0, 3.5);
        c.quadraticCurveTo(-2.5, 0, 0, -3.5);
        c.closePath();
        c.fill();
        c.strokeStyle = dark;
        c.lineWidth = 0.4;
        c.beginPath();
        c.moveTo(0, -3); c.lineTo(0, 3);
        c.stroke();
        c.restore();
      }
      // sparkles
      for (let i = 0; i < 3; i++) {
        const a = t * 2 + i * 2.1;
        const x = cx + Math.cos(a) * bw * 0.85;
        const y = cy + Math.sin(a) * bh * 0.6;
        c.fillStyle = `rgba(255,255,255,${0.5 + Math.sin(t * 4 + i) * 0.5})`;
        c.beginPath(); c.arc(x, y, 1, 0, Math.PI * 2); c.fill();
      }
    } else if (vfx.type === 'mischief') {
      // trickster phantoms + magic dust (Loki)
      const color = vfx.color || '#60ff80';
      const dust = vfx.dust || '#ffd060';
      const halo = c.createRadialGradient(cx, cy, bw * 0.4, cx, cy, bw * 1.05);
      halo.addColorStop(0, 'rgba(120,255,160,0)');
      halo.addColorStop(0.6, `rgba(80,220,120,${0.18 + t * 0.15})`);
      halo.addColorStop(1, 'rgba(20,80,40,0)');
      c.fillStyle = halo;
      c.beginPath(); c.arc(cx, cy, bw * 1.05, 0, Math.PI * 2); c.fill();
      // 2 phantom outlines
      for (let i = 0; i < 2; i++) {
        const phase = t * 1.2 + i * Math.PI;
        const offX = Math.cos(phase) * bw * 0.55;
        const offY = Math.sin(phase * 1.5) * 4;
        c.save();
        c.globalAlpha = 0.3 + Math.abs(Math.sin(t * 3 + i)) * 0.2;
        c.strokeStyle = color;
        c.lineWidth = 1;
        c.beginPath();
        c.arc(cx + offX, cy + offY, bw * 0.32, 0, Math.PI * 2);
        c.stroke();
        c.fillStyle = 'rgba(120,255,160,0.12)';
        c.fill();
        c.restore();
      }
      // swirling dust
      for (let i = 0; i < 6; i++) {
        const a = t * 3 + i * 1.1;
        const r = bw * 0.7 + Math.sin(t * 4 + i) * 4;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a * 1.4) * (bh * 0.5);
        c.fillStyle = i % 2 === 0 ? color : dust;
        const sz = 0.8 + Math.sin(t * 6 + i) * 0.5;
        c.fillRect(x - sz/2, y - sz/2, sz, sz);
      }
      // occasional zigzag flicker
      if ((Math.floor(t * 4) % 5) === 0) {
        c.strokeStyle = dust;
        c.lineWidth = 0.7;
        c.beginPath();
        c.moveTo(cx + bw * 0.4, cy - bh * 0.3);
        c.lineTo(cx + bw * 0.55, cy - bh * 0.1);
        c.lineTo(cx + bw * 0.45, cy + bh * 0.05);
        c.stroke();
      }
    } else if (vfx.type === 'rune') {
      // floating Norse runes (Tyr — war/justice)
      const color = vfx.color || '#dde8f0';
      const halo = c.createRadialGradient(cx, cy, bw * 0.45, cx, cy, bw * 1.0);
      halo.addColorStop(0, 'rgba(120,180,255,0)');
      halo.addColorStop(0.7, `rgba(140,200,255,${0.18 + t * 0.12})`);
      halo.addColorStop(1, 'rgba(40,80,160,0)');
      c.fillStyle = halo;
      c.beginPath(); c.arc(cx, cy, bw, 0, Math.PI * 2); c.fill();
      const runes = [
        // Tiwaz
        (rx, ry, sz) => {
          c.beginPath();
          c.moveTo(rx, ry - sz); c.lineTo(rx, ry + sz);
          c.moveTo(rx - sz*0.5, ry - sz*0.5); c.lineTo(rx, ry - sz);
          c.moveTo(rx + sz*0.5, ry - sz*0.5); c.lineTo(rx, ry - sz);
          c.stroke();
        },
        // Algiz
        (rx, ry, sz) => {
          c.beginPath();
          c.moveTo(rx, ry - sz); c.lineTo(rx, ry + sz);
          c.moveTo(rx - sz*0.7, ry - sz*0.4); c.lineTo(rx, ry);
          c.moveTo(rx + sz*0.7, ry - sz*0.4); c.lineTo(rx, ry);
          c.stroke();
        },
        // Sowilo (lightning S)
        (rx, ry, sz) => {
          c.beginPath();
          c.moveTo(rx - sz*0.5, ry - sz);
          c.lineTo(rx + sz*0.4, ry - sz*0.2);
          c.lineTo(rx - sz*0.3, ry + sz*0.3);
          c.lineTo(rx + sz*0.5, ry + sz);
          c.stroke();
        },
        // Ansuz
        (rx, ry, sz) => {
          c.beginPath();
          c.moveTo(rx - sz*0.4, ry - sz); c.lineTo(rx - sz*0.4, ry + sz);
          c.moveTo(rx - sz*0.4, ry - sz*0.6); c.lineTo(rx + sz*0.5, ry - sz*0.2);
          c.moveTo(rx - sz*0.4, ry - sz*0.1); c.lineTo(rx + sz*0.5, ry + sz*0.3);
          c.stroke();
        },
      ];
      c.lineCap = 'round';
      for (let i = 0; i < runes.length; i++) {
        const phase = t * 1.0 + i * (Math.PI * 2 / runes.length);
        const r = bw * 0.78;
        const rx = cx + Math.cos(phase) * r;
        const ry = cy + Math.sin(phase * 1.2) * (bh * 0.5);
        const sz = 3.5;
        const fade = 0.55 + Math.sin(t * 2 + i) * 0.3;
        // glow stroke
        c.strokeStyle = `rgba(120,200,255,${fade * 0.85})`;
        c.lineWidth = 2.6;
        runes[i](rx, ry, sz);
        // core stroke
        c.strokeStyle = color;
        c.lineWidth = 1;
        runes[i](rx, ry, sz);
      }
      c.lineCap = 'butt';
    } else if (vfx.type === 'cloud') {
      // golden somersault cloud puffs (Wukong vibe — fluffy spirals)
      const color = vfx.color || '#ffd060';
      const trim = vfx.trim || '#a06010';
      // halo
      const halo = c.createRadialGradient(cx, cy, bw * 0.4, cx, cy, bw * 1.0);
      halo.addColorStop(0, 'rgba(255,230,140,0)');
      halo.addColorStop(0.7, `rgba(255,210,90,${0.18 + t * 0.12})`);
      halo.addColorStop(1, 'rgba(180,120,40,0)');
      c.fillStyle = halo;
      c.beginPath(); c.arc(cx, cy, bw, 0, Math.PI * 2); c.fill();
      // 5 cloud puffs orbiting
      const puffs = 5;
      for (let i = 0; i < puffs; i++) {
        const phase = t * 1.2 + i * (Math.PI * 2 / puffs);
        const r = bw * (0.7 + Math.sin(t * 2 + i) * 0.1);
        const px = cx + Math.cos(phase) * r;
        const py = cy + Math.sin(phase * 1.3) * (bh * 0.5);
        // fluffy 3-circle cloud
        c.fillStyle = color;
        c.beginPath();
        c.arc(px - 2.2, py + 0.5, 2.0, 0, Math.PI * 2);
        c.arc(px,       py - 1.2, 2.6, 0, Math.PI * 2);
        c.arc(px + 2.2, py + 0.5, 2.0, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = trim;
        c.lineWidth = 0.6;
        c.stroke();
        // inner highlight
        c.fillStyle = 'rgba(255,255,220,0.6)';
        c.beginPath();
        c.arc(px - 1, py - 1.5, 0.8, 0, Math.PI * 2);
        c.fill();
      }
      // small spinning sparkles
      for (let i = 0; i < 3; i++) {
        const a = t * 3 + i * 2.1;
        const x = cx + Math.cos(a) * bw * 0.95;
        const y = cy + Math.sin(a) * bh * 0.55;
        c.fillStyle = `rgba(255,250,200,${0.6 + Math.sin(t * 5 + i) * 0.4})`;
        c.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);
      }
    } else if (vfx.type === 'foxfire') {
      // kitsune spirit flames — pale blue-orange teardrops
      const color = vfx.color || '#80b8ff';
      const hot = vfx.hot || '#fff8c0';
      const trim = vfx.trim || '#3060a0';
      // ethereal halo
      const halo = c.createRadialGradient(cx, cy, bw * 0.45, cx, cy, bw * 1.05);
      halo.addColorStop(0, 'rgba(140,200,255,0)');
      halo.addColorStop(0.6, `rgba(140,200,255,${0.22 + t * 0.15})`);
      halo.addColorStop(1, 'rgba(40,80,160,0)');
      c.fillStyle = halo;
      c.beginPath(); c.arc(cx, cy, bw * 1.05, 0, Math.PI * 2); c.fill();
      // 5 floating spirit flames
      const flames = 5;
      for (let i = 0; i < flames; i++) {
        const phase = t * 1.6 + i * (Math.PI * 2 / flames);
        const r = bw * (0.65 + Math.sin(t * 3 + i) * 0.12);
        const fx = cx + Math.cos(phase) * r;
        const fy = cy + Math.sin(phase * 1.2) * (bh * 0.55);
        const sz = 2.2 + Math.sin(t * 4 + i * 1.7) * 0.8;
        // teardrop flame body
        c.save();
        c.translate(fx, fy);
        c.rotate(phase * 0.5);
        const fGrd = c.createRadialGradient(0, sz * 0.3, 0.2, 0, 0, sz * 1.4);
        fGrd.addColorStop(0, hot);
        fGrd.addColorStop(0.5, color);
        fGrd.addColorStop(1, 'rgba(20,40,100,0)');
        c.fillStyle = fGrd;
        c.beginPath();
        c.moveTo(0, -sz * 1.6);
        c.quadraticCurveTo(sz * 1.1, 0, 0, sz * 1.2);
        c.quadraticCurveTo(-sz * 1.1, 0, 0, -sz * 1.6);
        c.closePath();
        c.fill();
        // inner core
        c.fillStyle = hot;
        c.beginPath();
        c.arc(0, sz * 0.2, sz * 0.4, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
      // tiny trailing sparkle dust
      for (let i = 0; i < 4; i++) {
        const a = t * 3 + i * 1.5;
        const x = cx + Math.cos(a) * bw * 0.95;
        const y = cy + Math.sin(a) * bh * 0.6;
        c.fillStyle = `rgba(220,240,255,${0.5 + Math.sin(t * 6 + i) * 0.5})`;
        c.fillRect(x - 0.5, y - 0.5, 1, 1);
      }
    } else if (vfx.type === 'feather') {
      // floating feathers + wind streaks (sky / bird god vibe — Horus, Quetzal)
      const color = vfx.color || '#ffd060';
      const trim = vfx.trim || '#a06010';
      // wind streaks
      for (let i = 0; i < 4; i++) {
        const phase = (t * 1.2 + i / 4) % 1;
        const sx = cx + Math.cos(t + i) * bw * 0.6;
        const sy = cy - phase * bh + i * 4;
        c.strokeStyle = `rgba(255,220,140,${(1 - phase) * 0.5})`;
        c.lineWidth = 0.8;
        c.beginPath();
        c.moveTo(sx, sy); c.lineTo(sx + 4, sy + 2);
        c.stroke();
      }
      // feathers orbiting
      const feathers = 4;
      for (let i = 0; i < feathers; i++) {
        const phase = t * 1.5 + i * (Math.PI * 2 / feathers);
        const r = bw * 0.8;
        const x = cx + Math.cos(phase) * r;
        const y = cy + Math.sin(phase * 1.4) * (bh * 0.5);
        const rot = phase + 0.5;
        c.save();
        c.translate(x, y);
        c.rotate(rot);
        // quill
        c.strokeStyle = trim;
        c.lineWidth = 0.6;
        c.beginPath();
        c.moveTo(0, -5); c.lineTo(0, 5);
        c.stroke();
        // body
        c.fillStyle = color;
        c.beginPath();
        c.moveTo(0, -5);
        c.quadraticCurveTo(3, 0, 1, 5);
        c.quadraticCurveTo(-3, 0, 0, -5);
        c.closePath();
        c.fill();
        c.strokeStyle = trim;
        c.lineWidth = 0.5;
        c.stroke();
        // barb lines
        c.strokeStyle = trim;
        c.lineWidth = 0.3;
        for (let j = -3; j <= 3; j++) {
          c.beginPath();
          c.moveTo(0, j); c.lineTo(j > 0 ? 1.2 : -1.2, j + 0.5);
          c.stroke();
        }
        c.restore();
      }
    } else if (vfx.type === 'frost') {
      // drifting snowflakes + ice crystal halo (winter / ice deity)
      const color = vfx.color || '#dceeff';
      const crystal = vfx.crystal || '#a0d8ff';
      const haze = vfx.haze || 'rgba(180,220,255,';
      // cold halo
      const halo = c.createRadialGradient(cx, cy, bw * 0.3, cx, cy, bw * 1.05);
      halo.addColorStop(0, haze + '0)');
      halo.addColorStop(0.6, haze + (0.18 + t * 0.12) + ')');
      halo.addColorStop(1, haze + '0)');
      c.fillStyle = halo;
      c.beginPath(); c.arc(cx, cy, bw * 1.05, 0, Math.PI * 2); c.fill();
      // ice crystal shards orbiting
      const shards = 4;
      for (let i = 0; i < shards; i++) {
        const phase = t * 0.9 + i * (Math.PI * 2 / shards);
        const r = bw * 0.85;
        const x = cx + Math.cos(phase) * r;
        const y = cy + Math.sin(phase) * (bh * 0.55);
        const rot = phase * 0.5;
        c.save();
        c.translate(x, y);
        c.rotate(rot);
        c.strokeStyle = crystal;
        c.lineWidth = 1.0;
        c.lineCap = 'round';
        for (let k = 0; k < 3; k++) {
          const a = (k / 3) * Math.PI;
          c.beginPath();
          c.moveTo(-Math.cos(a) * 3, -Math.sin(a) * 3);
          c.lineTo(Math.cos(a) * 3, Math.sin(a) * 3);
          c.stroke();
          // tip barbs
          const tx = Math.cos(a) * 3, ty = Math.sin(a) * 3;
          c.beginPath();
          c.moveTo(tx, ty);
          c.lineTo(tx - Math.cos(a + 0.6) * 1.2, ty - Math.sin(a + 0.6) * 1.2);
          c.moveTo(tx, ty);
          c.lineTo(tx - Math.cos(a - 0.6) * 1.2, ty - Math.sin(a - 0.6) * 1.2);
          c.stroke();
        }
        // core dot
        c.fillStyle = '#fff';
        c.beginPath(); c.arc(0, 0, 1.0, 0, Math.PI * 2); c.fill();
        c.lineCap = 'butt';
        c.restore();
      }
      // falling snowflakes
      for (let i = 0; i < 6; i++) {
        const ph = (t * 0.5 + i / 6) % 1;
        const sx = cx + Math.sin(t * 1.3 + i * 1.7) * bw * 0.7 + (i - 3) * 2;
        const sy = cy - bh * 0.7 + ph * bh * 1.6;
        const a = (1 - Math.abs(ph - 0.5) * 2) * 0.7;
        c.fillStyle = `rgba(255,255,255,${a})`;
        c.beginPath(); c.arc(sx, sy, 0.9, 0, Math.PI * 2); c.fill();
      }
    } else if (vfx.type === 'raven') {
      // circling black ravens + storm-grey haze (Odin's Huginn/Muninn)
      const color = vfx.color || '#0a0612';
      const accent = vfx.accent || '#ffd060';
      const haze = vfx.haze || 'rgba(80,90,120,';
      // storm haze
      const halo = c.createRadialGradient(cx, cy, bw * 0.3, cx, cy, bw * 1.1);
      halo.addColorStop(0, haze + '0)');
      halo.addColorStop(0.6, haze + (0.18 + t * 0.15) + ')');
      halo.addColorStop(1, haze + '0)');
      c.fillStyle = halo;
      c.beginPath(); c.arc(cx, cy, bw * 1.1, 0, Math.PI * 2); c.fill();
      // ravens orbiting
      const ravens = 3;
      for (let i = 0; i < ravens; i++) {
        const phase = t * 1.6 + i * (Math.PI * 2 / ravens);
        const r = bw * 0.85;
        const x = cx + Math.cos(phase) * r;
        const y = cy + Math.sin(phase * 1.2) * (bh * 0.55);
        const flap = Math.sin(t * 8 + i * 1.7);
        c.save();
        c.translate(x, y);
        c.rotate(Math.cos(phase) * 0.3);
        // body
        c.fillStyle = color;
        c.beginPath();
        c.ellipse(0, 0, 3, 1.6, 0, 0, Math.PI * 2);
        c.fill();
        // head
        c.beginPath();
        c.arc(2.4, -0.6, 1.2, 0, Math.PI * 2);
        c.fill();
        // beak
        c.fillStyle = accent;
        c.beginPath();
        c.moveTo(3.4, -0.6); c.lineTo(4.6, -0.2); c.lineTo(3.4, 0.2);
        c.closePath(); c.fill();
        // wings (flapping)
        c.fillStyle = color;
        c.beginPath();
        c.moveTo(-0.5, 0);
        c.quadraticCurveTo(-2, -3 - flap * 1.5, -4, -1 - flap * 0.6);
        c.quadraticCurveTo(-2, 0.5, -0.5, 0);
        c.closePath(); c.fill();
        c.beginPath();
        c.moveTo(0.5, 0);
        c.quadraticCurveTo(1.5, -2.5 - flap, 2.5, -0.5 - flap * 0.5);
        c.quadraticCurveTo(1.5, 0.4, 0.5, 0);
        c.closePath(); c.fill();
        // eye glow
        c.fillStyle = accent;
        c.beginPath(); c.arc(2.6, -0.8, 0.4, 0, Math.PI * 2); c.fill();
        c.restore();
      }
      // drifting feather wisps
      for (let i = 0; i < 3; i++) {
        const ph = (t * 0.6 + i / 3) % 1;
        const fx = cx + Math.cos(t * 0.7 + i * 2) * bw * 0.5;
        const fy = cy - 6 + ph * bh * 1.2;
        c.fillStyle = `rgba(20,16,28,${(1 - ph) * 0.5})`;
        c.beginPath();
        c.ellipse(fx, fy, 1.4, 0.5, t + i, 0, Math.PI * 2);
        c.fill();
      }
    } else if (vfx.type === 'web') {
      // Anansi — silk strands radiating + descending spider on a thread + drifting silk motes
      const silk = vfx.silk || 'rgba(220,210,180,';
      const spider = vfx.spider || '#1a0a04';
      const accent = vfx.accent || '#a01818';
      c.lineCap = 'round';
      // radial silk strands (fan from above)
      c.lineWidth = 0.6;
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i - 2.5) * 0.34 + Math.sin(t * 1.1 + i) * 0.04;
        const r0 = bw * 0.18;
        const r1 = bw * 1.05;
        const x0 = cx + Math.cos(a) * r0;
        const y0 = cy + Math.sin(a) * r0 - 2;
        const x1 = cx + Math.cos(a) * r1;
        const y1 = cy + Math.sin(a) * r1;
        c.strokeStyle = silk + '0.45)';
        c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
      }
      // concentric web arcs (upper half)
      c.lineWidth = 0.5;
      for (let k = 0; k < 3; k++) {
        const r = bw * (0.42 + k * 0.22);
        c.strokeStyle = silk + (0.32 - k * 0.08) + ')';
        c.beginPath();
        c.arc(cx, cy - 2, r, Math.PI + 0.3, 2 * Math.PI - 0.3);
        c.stroke();
      }
      // descending spider on thread
      const ph = (t * 0.55) % 1;
      const sx = cx + Math.cos(t * 0.8) * bw * 0.22;
      const sy = by - 4 + ph * (bh + 8);
      c.strokeStyle = silk + '0.7)';
      c.lineWidth = 0.5;
      c.beginPath(); c.moveTo(sx, by - 4); c.lineTo(sx, sy); c.stroke();
      // legs (thin curves)
      c.strokeStyle = spider;
      c.lineWidth = 0.6;
      for (let l = 0; l < 4; l++) {
        const off = (l - 1.5) * 0.6;
        const ly = sy + off * 0.5;
        c.beginPath();
        c.moveTo(sx - 0.5, ly);
        c.quadraticCurveTo(sx - 2.4, ly - 0.4 + off, sx - 3.4, ly + 1.4);
        c.stroke();
        c.beginPath();
        c.moveTo(sx + 0.5, ly);
        c.quadraticCurveTo(sx + 2.4, ly - 0.4 + off, sx + 3.4, ly + 1.4);
        c.stroke();
      }
      // body
      c.fillStyle = spider;
      c.beginPath(); c.ellipse(sx, sy + 1.4, 1.7, 1.2, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(sx, sy - 0.4, 1.0, 0, Math.PI * 2); c.fill();
      // red mark
      c.fillStyle = accent;
      c.beginPath(); c.arc(sx, sy + 1.3, 0.5, 0, Math.PI * 2); c.fill();
      // drifting silk motes
      for (let i = 0; i < 3; i++) {
        const mph = (t * 0.4 + i / 3) % 1;
        const dx = cx + Math.cos(t * 0.9 + i * 2) * bw * 0.55;
        const dy = cy - bh * 0.4 + mph * bh * 0.95;
        c.fillStyle = silk + ((1 - mph) * 0.55) + ')';
        c.fillRect(dx, dy, 1, 1);
      }
      c.lineCap = 'butt';
    } else if (vfx.type === 'chakra') {
      // Sudarshana — spinning bladed discus + golden halo + counter-orbit sparks
      const color = vfx.color || '#ffd060';
      const blade = vfx.blade || '#fff8c0';
      const ring = vfx.ring || 'rgba(255,210,90,';
      // halo
      const halo = c.createRadialGradient(cx, cy, bw * 0.4, cx, cy, bw * 1.05);
      halo.addColorStop(0, ring + '0)');
      halo.addColorStop(0.7, ring + (0.22 + t * 0.18) + ')');
      halo.addColorStop(1, ring + '0)');
      c.fillStyle = halo;
      c.beginPath(); c.arc(cx, cy, bw * 1.05, 0, Math.PI * 2); c.fill();
      // spinning discus
      const rot = t * 4;
      const spokes = 8;
      const ro = bw * 0.92;
      const ri = bw * 0.68;
      c.save();
      c.translate(cx, cy);
      c.rotate(rot);
      c.strokeStyle = color;
      c.lineWidth = 1.4;
      c.beginPath(); c.arc(0, 0, ro, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = blade;
      c.lineWidth = 0.7;
      c.beginPath(); c.arc(0, 0, ri, 0, Math.PI * 2); c.stroke();
      // outward blade teeth
      for (let i = 0; i < spokes; i++) {
        const a = (i / spokes) * Math.PI * 2;
        const x0 = Math.cos(a) * ro;
        const y0 = Math.sin(a) * ro;
        const x1 = Math.cos(a + 0.2) * (ro + 3);
        const y1 = Math.sin(a + 0.2) * (ro + 3);
        const x2 = Math.cos(a - 0.2) * (ro + 3);
        const y2 = Math.sin(a - 0.2) * (ro + 3);
        c.fillStyle = blade;
        c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.lineTo(x2, y2); c.closePath(); c.fill();
        // spoke
        c.strokeStyle = color;
        c.lineWidth = 0.6;
        c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * ri, Math.sin(a) * ri); c.stroke();
      }
      // hub
      c.fillStyle = blade;
      c.beginPath(); c.arc(0, 0, 2, 0, Math.PI * 2); c.fill();
      c.fillStyle = color;
      c.beginPath(); c.arc(0, 0, 1, 0, Math.PI * 2); c.fill();
      c.restore();
      // counter-rotating sparks
      for (let i = 0; i < 4; i++) {
        const a = -t * 2.5 + i * (Math.PI / 2);
        const r = bw * (1.02 + Math.sin(t * 3 + i) * 0.05);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.85;
        c.fillStyle = blade;
        c.beginPath(); c.arc(x, y, 1.2, 0, Math.PI * 2); c.fill();
      }
    } else if (vfx.type === 'lotus') {
      // blooming lotus + drifting petals + soft pink halo
      const color = vfx.color || '#ff8ab0';
      const inner = vfx.inner || '#fff0c0';
      const trim = vfx.trim || '#a04060';
      const halo = c.createRadialGradient(cx, cy, bw * 0.3, cx, cy, bw * 1.0);
      halo.addColorStop(0, 'rgba(255,200,220,0)');
      halo.addColorStop(0.7, `rgba(255,180,210,${0.2 + t * 0.12})`);
      halo.addColorStop(1, 'rgba(255,180,210,0)');
      c.fillStyle = halo;
      c.beginPath(); c.arc(cx, cy, bw, 0, Math.PI * 2); c.fill();
      const petals = 8;
      const open = 0.95 + Math.sin(t * 1.5) * 0.08;
      c.save();
      c.translate(cx, cy);
      c.rotate(t * 0.4);
      // outer petals
      for (let i = 0; i < petals; i++) {
        const a = (i / petals) * Math.PI * 2;
        c.save();
        c.rotate(a);
        c.fillStyle = color;
        c.strokeStyle = trim;
        c.lineWidth = 0.4;
        c.beginPath();
        c.moveTo(0, 0);
        c.quadraticCurveTo(2.2, -3 * open, 0, -6 * open);
        c.quadraticCurveTo(-2.2, -3 * open, 0, 0);
        c.closePath();
        c.fill(); c.stroke();
        c.restore();
      }
      // inner petals (offset, lighter)
      for (let i = 0; i < petals; i++) {
        const a = (i / petals) * Math.PI * 2 + Math.PI / petals;
        c.save();
        c.rotate(a);
        c.fillStyle = inner;
        c.beginPath();
        c.moveTo(0, 0);
        c.quadraticCurveTo(1.4, -2 * open, 0, -4 * open);
        c.quadraticCurveTo(-1.4, -2 * open, 0, 0);
        c.closePath();
        c.fill();
        c.restore();
      }
      // pistil
      c.fillStyle = inner;
      c.beginPath(); c.arc(0, 0, 1.4, 0, Math.PI * 2); c.fill();
      c.fillStyle = trim;
      c.beginPath(); c.arc(0, 0, 0.6, 0, Math.PI * 2); c.fill();
      c.restore();
      // drifting petals
      for (let i = 0; i < 4; i++) {
        const phase = (t * 0.5 + i / 4) % 1;
        const px = cx + Math.cos(t * 0.7 + i * 1.7) * bw * 0.7;
        const py = cy - bh * 0.3 + Math.sin(t * 0.9 + i) * 4 - phase * 2;
        const prot = t + i;
        c.save();
        c.translate(px, py);
        c.rotate(prot);
        c.fillStyle = `rgba(255,160,200,${(1 - phase) * 0.55 + 0.25})`;
        c.beginPath();
        c.moveTo(0, -2.2);
        c.quadraticCurveTo(1.6, 0, 0, 2.2);
        c.quadraticCurveTo(-1.6, 0, 0, -2.2);
        c.closePath();
        c.fill();
        c.restore();
      }
    } else if (vfx.type === 'eclipse') {
      // dark sun disc + corona flares + sparse stars (lunar/eclipse deities)
      const corona = vfx.corona || '#ffd860';
      const dark = vfx.dark || '#0a0010';
      const halo = vfx.halo || 'rgba(60,30,80,';
      const grad = c.createRadialGradient(cx, cy, bw * 0.3, cx, cy, bw * 1.1);
      grad.addColorStop(0, halo + '0)');
      grad.addColorStop(0.6, halo + (0.3 + t * 0.18) + ')');
      grad.addColorStop(1, halo + '0)');
      c.fillStyle = grad;
      c.beginPath(); c.arc(cx, cy, bw * 1.1, 0, Math.PI * 2); c.fill();
      c.fillStyle = dark;
      c.beginPath(); c.arc(cx, cy, bw * 0.55, 0, Math.PI * 2); c.fill();
      c.strokeStyle = corona;
      c.lineWidth = 1.4;
      c.beginPath(); c.arc(cx, cy, bw * 0.58, 0, Math.PI * 2); c.stroke();
      const flares = 12;
      for (let i = 0; i < flares; i++) {
        const a = (i / flares) * Math.PI * 2 + t * 0.3;
        const len = bw * (0.18 + Math.abs(Math.sin(t * 2 + i * 1.3)) * 0.2);
        const r0 = bw * 0.6;
        const r1 = bw * 0.6 + len;
        c.strokeStyle = `rgba(255,220,140,${0.5 + Math.sin(t * 3 + i) * 0.3})`;
        c.lineWidth = 0.7;
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        c.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        c.stroke();
      }
      for (let i = 0; i < 5; i++) {
        const a = i * 1.7 + t * 0.2;
        const r = bw * (0.95 + Math.sin(t + i) * 0.05);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.85;
        const tw = 0.6 + Math.abs(Math.sin(t * 4 + i * 1.7)) * 0.6;
        c.fillStyle = `rgba(255,255,255,${tw})`;
        c.fillRect(x - 0.5, y - 0.5, 1, 1);
      }
    } else if (vfx.type === 'starfield') {
      // nebula swirl + tiered stars + constellation lines + shooting star + gold sparks
      const star = vfx.color || '#fff8c0';
      const dust = vfx.dust || 'rgba(160,180,255,';
      const accent = vfx.accent || '#ffd860';
      const nebColor = vfx.nebula || 'rgba(120,80,200,';
      // 1. drifting nebula cloud
      const neb = c.createRadialGradient(cx + Math.cos(t * 0.3) * 4, cy - 4, bw * 0.2, cx, cy, bw * 1.18);
      neb.addColorStop(0, nebColor + '0.32)');
      neb.addColorStop(0.45, `rgba(80,100,200,${0.22 + t * 0.1})`);
      neb.addColorStop(1, 'rgba(20,10,40,0)');
      c.fillStyle = neb;
      c.beginPath(); c.arc(cx, cy, bw * 1.18, 0, Math.PI * 2); c.fill();
      // 2. cosmic dust haze
      const halo = c.createRadialGradient(cx, cy, bw * 0.3, cx, cy, bw * 1.0);
      halo.addColorStop(0, dust + '0)');
      halo.addColorStop(0.7, dust + (0.22 + t * 0.12) + ')');
      halo.addColorStop(1, dust + '0)');
      c.fillStyle = halo;
      c.beginPath(); c.arc(cx, cy, bw, 0, Math.PI * 2); c.fill();
      // 3. background micro stars (depth layer)
      for (let i = 0; i < 12; i++) {
        const a = i * 0.523 + t * 0.15;
        const r = bw * (0.4 + ((i * 7) % 11) / 17);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a * 1.3 + i) * (bh * 0.5);
        const tw = 0.3 + Math.abs(Math.sin(t * 3 + i * 0.7)) * 0.5;
        c.fillStyle = `rgba(220,220,255,${tw})`;
        c.fillRect(x, y, 0.8, 0.8);
      }
      // 4. 5 large bright stars w/ glow + 8-point shape
      const stars = 5;
      const starPos = [];
      for (let i = 0; i < stars; i++) {
        const a = t * 0.5 + i * (Math.PI * 2 / stars);
        const r = bw * (0.78 + Math.sin(t * 0.7 + i * 1.3) * 0.12);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a * 1.1) * (bh * 0.55);
        starPos.push({ x: x, y: y });
        const tw = 0.7 + Math.abs(Math.sin(t * 3 + i * 1.7)) * 0.5;
        const sg = c.createRadialGradient(x, y, 0.5, x, y, 5);
        sg.addColorStop(0, `rgba(255,240,180,${tw * 0.7})`);
        sg.addColorStop(1, 'rgba(255,240,180,0)');
        c.fillStyle = sg;
        c.beginPath(); c.arc(x, y, 5, 0, Math.PI * 2); c.fill();
        c.fillStyle = star;
        c.globalAlpha = Math.min(1, tw);
        c.beginPath();
        const sz = 2.2 * tw;
        c.moveTo(x, y - sz);
        c.lineTo(x + 0.8, y - 0.8);
        c.lineTo(x + sz, y);
        c.lineTo(x + 0.8, y + 0.8);
        c.lineTo(x, y + sz);
        c.lineTo(x - 0.8, y + 0.8);
        c.lineTo(x - sz, y);
        c.lineTo(x - 0.8, y - 0.8);
        c.closePath();
        c.fill();
        if (tw > 1.0) {
          c.fillStyle = `rgba(255,255,255,${(tw - 1.0) * 1.5})`;
          c.fillRect(x - sz * 1.5, y - 0.3, sz * 3, 0.6);
          c.fillRect(x - 0.3, y - sz * 1.5, 0.6, sz * 3);
        }
        c.globalAlpha = 1;
      }
      // 5. constellation lines
      c.strokeStyle = 'rgba(180,200,255,0.28)';
      c.lineWidth = 0.5;
      c.beginPath();
      for (let i = 0; i < stars; i++) {
        const a = starPos[i], b = starPos[(i + 1) % stars];
        c.moveTo(a.x, a.y); c.lineTo(b.x, b.y);
      }
      c.stroke();
      // 6. shooting star streak (cyclic)
      const sPhase = (t * 0.35) % 1;
      if (sPhase < 0.7) {
        const sx = bx - 4 + sPhase * (bw + 12);
        const sy = by + 6 + sPhase * (bh * 0.4);
        const sa = sPhase < 0.15 ? sPhase / 0.15 : sPhase > 0.55 ? (0.7 - sPhase) / 0.15 : 1;
        c.lineCap = 'round';
        c.strokeStyle = `rgba(255,240,180,${sa * 0.8})`;
        c.lineWidth = 1.2;
        c.beginPath(); c.moveTo(sx - 8, sy - 3); c.lineTo(sx, sy); c.stroke();
        c.strokeStyle = `rgba(255,200,140,${sa * 0.4})`;
        c.lineWidth = 0.6;
        c.beginPath(); c.moveTo(sx - 14, sy - 5); c.lineTo(sx - 6, sy - 2); c.stroke();
        c.fillStyle = `rgba(255,255,220,${sa})`;
        c.beginPath(); c.arc(sx, sy, 1.5, 0, Math.PI * 2); c.fill();
        c.lineCap = 'butt';
      }
      // 7. gold accent sparkles (Egyptian flair)
      for (let i = 0; i < 4; i++) {
        const a = -t * 0.8 + i * (Math.PI / 2);
        const r = bw * 0.95;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.85;
        const tw = 0.5 + Math.abs(Math.sin(t * 5 + i * 1.3)) * 0.5;
        c.fillStyle = accent;
        c.globalAlpha = tw;
        c.fillRect(x - 0.5, y - 0.5, 1, 1);
        if (tw > 0.7) {
          c.fillRect(x - 2, y - 0.3, 4, 0.6);
          c.fillRect(x - 0.3, y - 2, 0.6, 4);
        }
        c.globalAlpha = 1;
      }
    } else if (vfx.type === 'sandstorm') {
      // swirling dust ribbons + sand grains + floor scuff (desert deities)
      const sand = vfx.color || '#d8a060';
      const dust = vfx.dust || 'rgba(200,150,80,';
      const halo = c.createRadialGradient(cx, cy, bw * 0.4, cx, cy, bw * 1.05);
      halo.addColorStop(0, dust + '0)');
      halo.addColorStop(0.6, dust + (0.25 + t * 0.18) + ')');
      halo.addColorStop(1, dust + '0)');
      c.fillStyle = halo;
      c.beginPath(); c.arc(cx, cy, bw * 1.05, 0, Math.PI * 2); c.fill();
      c.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const a0 = t * 1.5 + i * (Math.PI * 2 / 3);
        c.strokeStyle = dust + (0.4 + Math.sin(t * 2 + i) * 0.2) + ')';
        c.lineWidth = 1.2;
        c.beginPath();
        for (let k = 0; k <= 8; k++) {
          const a = a0 + k * 0.4;
          const r = bw * (0.4 + k * 0.08);
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r * 0.7;
          if (k === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.stroke();
      }
      c.lineCap = 'butt';
      for (let i = 0; i < 10; i++) {
        const a = t * 2 + i * 1.7;
        const r = bw * (0.3 + ((i * 13 + Math.floor(t * 30)) % 70) / 100);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.7 + Math.sin(t * 3 + i) * 2;
        c.fillStyle = `rgba(255,200,120,${0.5 + Math.sin(t * 5 + i) * 0.3})`;
        c.fillRect(x, y, 1, 1);
      }
      for (let i = 0; i < 3; i++) {
        const x = bx + 4 + i * (bw - 8) / 2;
        const y = by + bh - 1;
        const w = 4 + Math.sin(t * 3 + i) * 2;
        c.fillStyle = sand;
        c.globalAlpha = 0.5;
        c.fillRect(x - w / 2, y, w, 1);
        c.globalAlpha = 1;
      }
    } else if (vfx.type === 'bramble') {
      // twin twisting thorny vines + thorn spikes + small flowers (forest/hunt)
      const vine = vfx.color || '#3a5828';
      const thorn = vfx.thorn || '#1a3018';
      const flower = vfx.flower || '#ff80a0';
      const halo = c.createRadialGradient(cx, cy, bw * 0.3, cx, cy, bw * 1.0);
      halo.addColorStop(0, 'rgba(80,140,80,0)');
      halo.addColorStop(0.7, `rgba(60,110,60,${0.18 + t * 0.12})`);
      halo.addColorStop(1, 'rgba(60,110,60,0)');
      c.fillStyle = halo;
      c.beginPath(); c.arc(cx, cy, bw, 0, Math.PI * 2); c.fill();
      c.lineCap = 'round';
      c.strokeStyle = vine;
      c.lineWidth = 1.2;
      for (let v = 0; v < 2; v++) {
        const dir = v === 0 ? 1 : -1;
        const phase = t * 1.2 + v * Math.PI;
        c.beginPath();
        for (let k = 0; k <= 12; k++) {
          const a = phase + k * 0.6 * dir;
          const r = bw * (0.3 + k * 0.06);
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r * 0.8;
          if (k === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.stroke();
        for (let k = 2; k <= 12; k += 2) {
          const a = phase + k * 0.6 * dir;
          const r = bw * (0.3 + k * 0.06);
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r * 0.8;
          const ta = a + Math.PI / 2;
          c.fillStyle = thorn;
          c.beginPath();
          c.moveTo(x, y);
          c.lineTo(x + Math.cos(ta) * 2, y + Math.sin(ta) * 2);
          c.lineTo(x + Math.cos(a) * 1.5, y + Math.sin(a) * 1.5);
          c.closePath(); c.fill();
        }
      }
      c.lineCap = 'butt';
      for (let i = 0; i < 3; i++) {
        const a = t * 0.5 + i * (Math.PI * 2 / 3);
        const r = bw * 0.85;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.7;
        c.fillStyle = flower;
        for (let p = 0; p < 5; p++) {
          const pa = (p / 5) * Math.PI * 2;
          c.beginPath();
          c.arc(x + Math.cos(pa) * 0.8, y + Math.sin(pa) * 0.8, 0.7, 0, Math.PI * 2);
          c.fill();
        }
        c.fillStyle = '#ffd860';
        c.beginPath(); c.arc(x, y, 0.6, 0, Math.PI * 2); c.fill();
      }
    } else if (vfx.type === 'mirror') {
      // orbiting reflective shards + smoking dark haze (Tezcatlipoca / mirror gods)
      const shard = vfx.color || '#80a8c0';
      const glow = vfx.glow || '#dcecff';
      const dark = vfx.dark || 'rgba(40,30,60,';
      const halo = c.createRadialGradient(cx, cy, bw * 0.3, cx, cy, bw * 1.05);
      halo.addColorStop(0, dark + '0)');
      halo.addColorStop(0.6, dark + (0.32 + t * 0.18) + ')');
      halo.addColorStop(1, dark + '0)');
      c.fillStyle = halo;
      c.beginPath(); c.arc(cx, cy, bw * 1.05, 0, Math.PI * 2); c.fill();
      const shards = 6;
      for (let i = 0; i < shards; i++) {
        const a = t * 1.2 + i * (Math.PI * 2 / shards);
        const r = bw * (0.75 + Math.sin(t * 1.5 + i) * 0.15);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.8;
        const rot = a + t;
        c.save();
        c.translate(x, y);
        c.rotate(rot);
        c.fillStyle = shard;
        c.beginPath();
        c.moveTo(-2, -1.5);
        c.lineTo(2.5, -0.5);
        c.lineTo(0.5, 2);
        c.closePath();
        c.fill();
        c.strokeStyle = glow;
        c.lineWidth = 0.5;
        c.stroke();
        c.fillStyle = glow;
        c.beginPath();
        c.moveTo(-1, -1);
        c.lineTo(1, -0.5);
        c.lineTo(0, 0.5);
        c.closePath();
        c.fill();
        c.restore();
      }
      for (let i = 0; i < 3; i++) {
        const phase = (t * 0.5 + i / 3) % 1;
        const x = cx + Math.cos(t + i * 2) * bw * 0.4;
        const y = cy - phase * bh;
        const r = 2 + Math.sin(t * 2 + i) * 1;
        const a = (1 - phase) * 0.5;
        c.fillStyle = `rgba(80,60,100,${a})`;
        c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
      }
    }
  }

  function buildAnim(count, fn) {
    const arr = [];
    for (let i = 0; i < count; i++) arr.push(fn(i));
    return arr;
  }

  // Build full atlas for a skin.
  function build(skin) {
    return {
      skinId: skin.id,
      idle: buildAnim(8, i => {
        const phase = i / 8;
        const breath = Math.sin(phase * Math.PI * 2);
        return renderSprite(skin, {
          t: 0.5 + 0.5 * Math.sin(phase * Math.PI * 2),
          mouth: 'smile',
          eyeOff: 0,
          antBob: breath * 1.5,
          capeWave: breath * 1.5,
          squash: 1 - breath * 0.02,
          stretch: 1 + breath * 0.02,
          dead: false,
          blink: i === 4,
        });
      }),
      run: buildAnim(8, i => {
        const phase = i / 8;
        const bob = Math.sin(phase * Math.PI * 2);
        return renderSprite(skin, {
          t: 0.5 + 0.5 * Math.sin(phase * Math.PI * 4),
          mouth: 'smile',
          eyeOff: bob > 0.5 ? -1 : 0,
          antBob: -bob * 3,
          capeWave: -bob * 4,
          squash: 1 - Math.abs(bob) * 0.06,
          stretch: 1 + Math.abs(bob) * 0.04,
          dead: false,
          blink: false,
          motion: 0.6 + Math.abs(bob) * 0.4,
        });
      }),
      jump: renderSprite(skin, {
        t: 1, mouth: 'open', eyeOff: -1, antBob: -4, capeWave: -6,
        squash: 0.9, stretch: 1.18, dead: false, blink: false,
        motion: 0.8,
      }),
      fall: renderSprite(skin, {
        t: 0.6, mouth: 'flat', eyeOff: 2, antBob: 3, capeWave: 5,
        squash: 1.05, stretch: 0.95, dead: false, blink: false,
        motion: 0.5,
      }),
      dead: renderSprite(skin, {
        t: 0.2, mouth: 'up', eyeOff: 0, antBob: 0, capeWave: 0,
        squash: 1, stretch: 1, dead: true, blink: false,
      }),
    };
  }

  W.PlayerSprite = {
    SPR_W, SPR_H, SPR_OFFX, SPR_OFFY,
    BODY_W, BODY_H,
    roundRectPath,
    renderSprite,
    build,
  };
})();
