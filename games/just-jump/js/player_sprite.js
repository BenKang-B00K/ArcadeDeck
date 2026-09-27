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
  // atlas supersample: frames are drawn at up to ~3.3 device px per sprite px
  // (2x start-screen preview × camera × dpr), so 1x atlases upscale blurry.
  // ponytail: fixed 3x (~4MB/skin); index.html caps atlas cache size.
  const RES = 3;

  function roundRectPath(c, x, y, w, h, r) {
    c.beginPath();
    c.roundRect(x, y, w, h, Math.max(0, r)); // native throws on negative radius
  }

  function rgba(rgb, a) {
    return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
  }

  // Render one sprite frame for given skin + frame opts.
  // opts: { t, mouth, eyeOff, antBob, capeWave, squash, stretch, dead, blink, feet }
  //   feet: [lx, ly, rx, ry] per-foot offsets (run cycle / tuck / dangle)
  function renderSprite(skin, opts) {
    const { t, mouth, eyeOff, antBob, capeWave, squash, stretch, dead, blink, motion = 0, feet = [0, 0, 0, 0] } = opts;
    const cv = document.createElement('canvas');
    cv.width = SPR_W * RES; cv.height = SPR_H * RES;
    const c = cv.getContext('2d');
    c.scale(RES, RES);

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
    // feet — tucked behind body bottom so body overlaps their tops
    c.fillStyle = skin.body.fill[2];
    c.strokeStyle = skin.body.outline;
    c.lineWidth = 1.6;
    for (let i = 0; i < 2; i++) {
      const fx = bx + (i ? 25 : 11) + feet[i * 2];
      const fy = by + bh - 1 + feet[i * 2 + 1];
      c.beginPath();
      c.ellipse(fx, fy, 5.5, 3.6, 0, 0, Math.PI * 2);
      c.fill(); c.stroke();
    }

    c.fillStyle = bodyGrd;
    roundRectPath(c, bx, by, bw, bh, skin.body.radius);
    c.fill();
    // shading inside body: aura-tinted back-light rim (keeps dark skins readable)
    // + bottom occlusion for volume
    c.save();
    c.clip();
    const ao = c.createLinearGradient(0, by + bh * 0.55, 0, by + bh);
    ao.addColorStop(0, 'rgba(0,0,0,0)');
    ao.addColorStop(1, 'rgba(0,0,0,0.28)');
    c.fillStyle = ao;
    c.fillRect(bx, by, bw, bh);
    c.lineWidth = 5;
    c.strokeStyle = rgba(skin.aura.rgb, 0.6);
    roundRectPath(c, bx - 2, by + 1, bw, bh, skin.body.radius);
    c.stroke();
    c.restore();
    roundRectPath(c, bx, by, bw, bh, skin.body.radius);
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
      c.strokeStyle = skin.body.outline;
      c.lineWidth = 1;
      c.beginPath(); c.arc(eL, eyeY, 5, 0, Math.PI*2); c.fill(); c.stroke();
      c.beginPath(); c.arc(eR, eyeY, 5, 0, Math.PI*2); c.fill(); c.stroke();
      // pupils gaze forward (right) — +1.2 px forward offset
      const gazeX = 1.2;
      // iris ring tinted by skin (eyes.iris, else aura hue) — per-skin personality
      c.fillStyle = skin.eyes.iris || rgba(skin.aura.rgb.map(v => Math.round(v * 0.7)), 1);
      c.beginPath(); c.arc(eL + gazeX, eyeY + eyeOff + 0.5, 3.4, 0, Math.PI*2); c.fill();
      c.beginPath(); c.arc(eR + gazeX, eyeY + eyeOff + 0.5, 3.4, 0, Math.PI*2); c.fill();
      c.fillStyle = skin.eyes.pupil;
      c.beginPath(); c.arc(eL + gazeX, eyeY + eyeOff + 0.5, 2.1, 0, Math.PI*2); c.fill();
      c.beginPath(); c.arc(eR + gazeX, eyeY + eyeOff + 0.5, 2.1, 0, Math.PI*2); c.fill();
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
    } else if (helm.type === 'sunDisk') {
      // Ra — glowing solar disk cradled by horns, rearing uraeus cobra
      const accent = helm.accent || '#a04008';
      const dy = by - 9;
      // cradling horns
      c.strokeStyle = helm.horn || '#fff0c0';
      c.lineWidth = 2.2;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(cx - 4, by + 4); c.quadraticCurveTo(cx - 13, dy + 2, cx - 7, dy - 6);
      c.moveTo(cx + 4, by + 4); c.quadraticCurveTo(cx + 13, dy + 2, cx + 7, dy - 6);
      c.stroke();
      c.lineCap = 'butt';
      // disk glow + body
      const glow = c.createRadialGradient(cx, dy, 2, cx, dy, 13);
      glow.addColorStop(0, 'rgba(255,240,160,0.7)');
      glow.addColorStop(1, 'rgba(255,200,60,0)');
      c.fillStyle = glow;
      c.beginPath(); c.arc(cx, dy, 13, 0, Math.PI * 2); c.fill();
      const disk = c.createRadialGradient(cx - 2, dy - 2, 1, cx, dy, 7);
      disk.addColorStop(0, '#fff8d0');
      disk.addColorStop(0.5, color);
      disk.addColorStop(1, accent);
      c.fillStyle = disk;
      c.beginPath(); c.arc(cx, dy, 7, 0, Math.PI * 2); c.fill();
      c.lineWidth = 1.2; c.strokeStyle = outline; c.stroke();
      // headband
      c.fillStyle = color;
      c.fillRect(bx + 3, by + 5, bw - 6, 4);
      c.strokeRect(bx + 3, by + 5, bw - 6, 4);
      // uraeus cobra on brow
      c.fillStyle = helm.cobra || '#40c070';
      c.beginPath();
      c.moveTo(cx - 2, by + 6);
      c.quadraticCurveTo(cx - 3, by, cx, by - 1);
      c.quadraticCurveTo(cx + 3, by, cx + 2, by + 6);
      c.closePath();
      c.fill(); c.lineWidth = 0.8; c.stroke();
    } else if (helm.type === 'falcon') {
      // Horus — falcon hood with forward hooked beak + eye-of-Horus marking
      const accent = helm.accent || '#c08020';
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + 1, by + 12);
      c.quadraticCurveTo(bx + 2, by - 7, cx + 4, by - 6);
      c.quadraticCurveTo(bx + bw + 1, by - 5, bx + bw - 1, by + 8);
      c.lineTo(bx + bw - 1, by + 10);
      c.lineTo(bx + 1, by + 12);
      c.closePath();
      c.fill();
      c.lineWidth = 1.5; c.strokeStyle = outline; c.stroke();
      // feather scallops on crown
      c.strokeStyle = accent; c.lineWidth = 1;
      c.beginPath();
      for (let i = 0; i < 4; i++) {
        const fx = bx + 6 + i * 6;
        c.moveTo(fx, by + 2); c.quadraticCurveTo(fx + 3, by + 6, fx + 6, by + 2);
      }
      c.stroke();
      // hooked beak jutting forward (motion is rightward)
      c.fillStyle = helm.beak || '#ffd060';
      c.beginPath();
      c.moveTo(bx + bw - 3, by - 1);
      c.quadraticCurveTo(bx + bw + 9, by - 1, bx + bw + 7, by + 7);
      c.quadraticCurveTo(bx + bw + 4, by + 4, bx + bw - 2, by + 6);
      c.closePath();
      c.fill(); c.lineWidth = 1.1; c.strokeStyle = outline; c.stroke();
      // eye-of-Horus tear line under the front eye
      c.strokeStyle = outline; c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(bx + 22, by + 20); c.lineTo(bx + 21, by + 24); c.quadraticCurveTo(bx + 20, by + 27, bx + 17, by + 26);
      c.stroke();
    } else if (helm.type === 'plume') {
      // Athena — Corinthian dome with tall arcing horsehair crest
      const crest = helm.crest || '#d83040';
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + 3, by + 11);
      c.quadraticCurveTo(cx, by - 9, bx + bw - 3, by + 11);
      c.lineTo(bx + bw - 3, by + 13);
      c.lineTo(bx + 3, by + 13);
      c.closePath();
      c.fill();
      c.lineWidth = 1.5; c.strokeStyle = outline; c.stroke();
      // brow ridge
      c.fillStyle = helm.accent || '#ffd060';
      c.fillRect(bx + 3, by + 10, bw - 6, 2);
      // crest — thick arc sweeping front→back
      c.fillStyle = crest;
      c.beginPath();
      c.moveTo(bx + bw - 6, by);
      c.quadraticCurveTo(cx + 2, by - 20, bx - 8, by - 4);
      c.quadraticCurveTo(bx - 4, by + 4, bx + 4, by + 1);
      c.quadraticCurveTo(cx, by - 10, bx + bw - 9, by + 2);
      c.closePath();
      c.fill();
      c.lineWidth = 1.2; c.strokeStyle = outline; c.stroke();
      // bristle strokes
      c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 0.7;
      c.beginPath();
      for (let i = 0; i < 5; i++) {
        const u = i / 4, px = bx + bw - 8 - u * 32, py = by - 2 - Math.sin(u * Math.PI) * 9;
        c.moveTo(px, py); c.lineTo(px - 1.5, py + 3);
      }
      c.stroke();
    } else if (helm.type === 'featherHeaddress') {
      // Quetzalcoatl — fan of long quetzal feathers over a jade band
      const accent = helm.accent || '#ffd060';
      const tip = helm.tip || '#2080ff';
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI / 2 + (i - 3) * 0.3;
        const len = 15 - Math.abs(i - 3) * 1.5;
        const fx = cx + Math.cos(a) * len, fy = by + 4 + Math.sin(a) * len;
        c.fillStyle = i % 2 ? accent : color;
        c.beginPath();
        c.ellipse((cx + fx) / 2, (by + 4 + fy) / 2, len / 2 + 1, 2.6, a, 0, Math.PI * 2);
        c.fill();
        c.lineWidth = 0.8; c.strokeStyle = outline; c.stroke();
        c.fillStyle = tip;
        c.beginPath(); c.arc(fx, fy, 1.6, 0, Math.PI * 2); c.fill();
      }
      c.fillStyle = helm.band || '#a04008';
      c.fillRect(bx + 3, by + 4, bw - 6, 5);
      c.lineWidth = 1.2; c.strokeStyle = outline;
      c.strokeRect(bx + 3, by + 4, bw - 6, 5);
      c.fillStyle = helm.jade || '#60e0a0';
      for (let i = 0; i < 3; i++) {
        c.beginPath(); c.arc(bx + 10 + i * 8, by + 6.5, 1.5, 0, Math.PI * 2); c.fill();
      }
    } else if (helm.type === 'catEars') {
      // Bastet — rounded cat ears, gold hoop earring, jeweled brow
      const accent = helm.accent || '#ffd060';
      const inner = helm.innerEar || '#ff80a0';
      for (const s of [-1, 1]) {
        const ex = cx + s * 11;
        c.fillStyle = color;
        c.beginPath();
        c.moveTo(ex - 6, by + 5);
        c.quadraticCurveTo(ex + s * 1, by - 12, ex + s * 5, by - 7);
        c.quadraticCurveTo(ex + s * 7, by, ex + 6 * s, by + 5);
        c.closePath();
        c.fill();
        c.lineWidth = 1.3; c.strokeStyle = outline; c.stroke();
        c.fillStyle = inner;
        c.beginPath();
        c.moveTo(ex - 3, by + 3);
        c.quadraticCurveTo(ex + s * 1, by - 7, ex + s * 3.5, by - 4);
        c.quadraticCurveTo(ex + s * 4.5, by, ex + 3 * s, by + 3);
        c.closePath();
        c.fill();
      }
      // gold hoop on front ear
      c.strokeStyle = accent; c.lineWidth = 1.2;
      c.beginPath(); c.arc(cx + 16, by + 3, 2.4, 0, Math.PI * 2); c.stroke();
      // brow circlet + jewel
      c.fillStyle = accent;
      c.fillRect(bx + 4, by + 6, bw - 8, 2);
      if (helm.jewel) {
        c.fillStyle = helm.jewel;
        c.beginPath(); c.arc(cx, by + 7, 2, 0, Math.PI * 2); c.fill();
        c.lineWidth = 0.8; c.strokeStyle = outline; c.stroke();
      }
    } else if (helm.type === 'starTiara') {
      // Ishtar — gold tiara crowned by her 8-pointed star
      const accent = helm.accent || '#1a3878';
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + 4, by + 10); c.quadraticCurveTo(cx, by + 1, bx + bw - 4, by + 10);
      c.lineTo(bx + bw - 4, by + 7); c.quadraticCurveTo(cx, by - 3, bx + 4, by + 7);
      c.closePath();
      c.fill(); c.lineWidth = 1.2; c.strokeStyle = outline; c.stroke();
      const star = (sx, sy, ro, ri, n) => {
        c.beginPath();
        for (let i = 0; i < n * 2; i++) {
          const r = i % 2 ? ri : ro, a = -Math.PI / 2 + i * Math.PI / n;
          c.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r);
        }
        c.closePath();
      };
      const sg = c.createRadialGradient(cx, by - 6, 0, cx, by - 6, 11);
      sg.addColorStop(0, 'rgba(255,240,180,0.6)'); sg.addColorStop(1, 'rgba(255,220,120,0)');
      c.fillStyle = sg;
      c.beginPath(); c.arc(cx, by - 6, 11, 0, Math.PI * 2); c.fill();
      c.fillStyle = color;
      star(cx, by - 6, 8, 3, 8);
      c.fill(); c.lineWidth = 1; c.stroke();
      c.fillStyle = accent;
      c.beginPath(); c.arc(cx, by - 6, 2, 0, Math.PI * 2); c.fill();
      c.fillStyle = color;
      star(bx + 8, by + 3, 3.5, 1.4, 4); c.fill(); c.stroke();
      star(bx + bw - 8, by + 3, 3.5, 1.4, 4); c.fill(); c.stroke();
    } else if (helm.type === 'mukuta') {
      // Vishnu — tall tiered conical crown with jewels and finial
      const accent = helm.accent || '#1a3878';
      const gem = helm.gem || '#ff4060';
      const tiers = [[bw - 8, by + 11, 6], [bw - 14, by + 5, 6], [bw - 20, by - 1, 6], [bw - 26, by - 7, 6]];
      for (const [tw, ty, th] of tiers) {
        const tg = c.createLinearGradient(0, ty - th, 0, ty);
        tg.addColorStop(0, '#fff8d0'); tg.addColorStop(1, color);
        c.fillStyle = tg;
        c.beginPath();
        c.moveTo(cx - tw / 2, ty); c.lineTo(cx - tw / 2 + 2, ty - th);
        c.lineTo(cx + tw / 2 - 2, ty - th); c.lineTo(cx + tw / 2, ty);
        c.closePath();
        c.fill(); c.lineWidth = 1; c.strokeStyle = outline; c.stroke();
        c.fillStyle = accent;
        c.fillRect(cx - tw / 2 + 1, ty - 1.5, tw - 2, 1);
      }
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(cx - 3, by - 13); c.quadraticCurveTo(cx, by - 22, cx + 3, by - 13);
      c.closePath(); c.fill(); c.stroke();
      c.fillStyle = gem;
      for (const [gx, gy, gr] of [[cx, by + 8, 2], [cx, by + 2, 1.6], [cx, by - 4, 1.3], [cx - 9, by + 8, 1.2], [cx + 9, by + 8, 1.2]]) {
        c.beginPath(); c.arc(gx, gy, gr, 0, Math.PI * 2); c.fill();
      }
    } else if (helm.type === 'tieredHorns') {
      // Marduk — Mesopotamian cylinder cap wrapped by stacked horn pairs
      const accent = helm.accent || '#a01818';
      const horn = helm.horn || '#fff0c0';
      c.fillStyle = accent;
      c.beginPath();
      c.moveTo(bx + 7, by + 11); c.lineTo(bx + 9, by - 10);
      c.quadraticCurveTo(cx, by - 14, bx + bw - 9, by - 10);
      c.lineTo(bx + bw - 7, by + 11);
      c.closePath();
      c.fill(); c.lineWidth = 1.3; c.strokeStyle = outline; c.stroke();
      c.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const hy = by + 8 - i * 7;
        c.strokeStyle = outline; c.lineWidth = 3;
        c.beginPath();
        c.moveTo(cx, hy + 1); c.quadraticCurveTo(bx + 4, hy + 1, bx + 5 - i, hy - 5);
        c.moveTo(cx, hy + 1); c.quadraticCurveTo(bx + bw - 4, hy + 1, bx + bw - 5 + i, hy - 5);
        c.stroke();
        c.strokeStyle = horn; c.lineWidth = 1.6;
        c.stroke();
      }
      c.lineCap = 'butt';
      // feathered top fringe
      c.fillStyle = color;
      for (let i = 0; i < 5; i++) {
        c.beginPath(); c.ellipse(bx + 11 + i * 3.5, by - 12, 1.6, 3, 0, 0, Math.PI * 2); c.fill();
      }
    } else if (helm.type === 'starVeil') {
      // Nut — night-sky veil draped over the head, dotted with stars
      const veil = color;
      c.fillStyle = veil;
      c.beginPath();
      c.moveTo(bx - 3, by + 34);
      c.quadraticCurveTo(bx - 4, by + 6, bx + 4, by);
      c.quadraticCurveTo(cx, by - 9, bx + bw - 4, by);
      c.quadraticCurveTo(bx + bw + 4, by + 6, bx + bw + 3, by + 30);
      c.lineTo(bx + bw - 1, by + 30);
      c.quadraticCurveTo(bx + bw, by + 12, bx + bw - 5, by + 8);
      c.quadraticCurveTo(cx, by + 3, bx + 5, by + 8);
      c.quadraticCurveTo(bx, by + 12, bx + 1, by + 34);
      c.closePath();
      c.fill(); c.lineWidth = 1.2; c.strokeStyle = outline; c.stroke();
      c.strokeStyle = helm.accent || '#ffd860'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(bx + 5, by + 8); c.quadraticCurveTo(cx, by + 3, bx + bw - 5, by + 8); c.stroke();
      c.fillStyle = '#fff';
      for (const [sx, sy, r] of [[bx + 6, by + 1, 0.9], [cx - 3, by - 3, 1.1], [cx + 7, by - 1, 0.8], [bx - 1, by + 16, 0.8], [bx + bw + 1, by + 12, 0.9], [bx, by + 26, 0.7], [bx + bw + 1, by + 23, 0.7]]) {
        c.beginPath(); c.arc(sx, sy, r, 0, Math.PI * 2); c.fill();
      }
    } else if (helm.type === 'spiderCap') {
      // Anansi — skull cap with splayed spider legs + cluster of eyes
      const eye = helm.eye || '#ff3030';
      // jointed legs: up to a knee, then down to a foot — 3 per side
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath();
      for (let i = 0; i < 3; i++) {
        const ly = by + 2 + i * 4;
        c.moveTo(bx + 8, ly); c.lineTo(bx - 1 - i, ly - 7 + i * 2); c.lineTo(bx - 5 + i, ly + 5);
        c.moveTo(bx + bw - 8, ly); c.lineTo(bx + bw + 1 + i, ly - 7 + i * 2); c.lineTo(bx + bw + 5 - i, ly + 5);
      }
      c.strokeStyle = helm.accent || '#ffd060'; c.lineWidth = 3.2;
      c.stroke();
      c.strokeStyle = outline; c.lineWidth = 2;
      c.stroke();
      c.lineCap = 'butt'; c.lineJoin = 'miter';
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + 5, by + 9); c.quadraticCurveTo(cx, by - 11, bx + bw - 5, by + 9);
      c.closePath();
      c.fill(); c.lineWidth = 1.3; c.strokeStyle = outline; c.stroke();
      c.fillStyle = eye;
      for (const [ex, ey, r] of [[cx - 3, by + 2, 1.5], [cx + 3, by + 2, 1.5], [cx - 6, by + 5, 1], [cx + 6, by + 5, 1], [cx - 2, by - 2, 0.9], [cx + 2, by - 2, 0.9]]) {
        c.beginPath(); c.arc(ex, ey, r, 0, Math.PI * 2); c.fill();
      }
      c.strokeStyle = helm.accent || '#ffd060'; c.lineWidth = 0.8;
      c.beginPath(); c.moveTo(bx + 6, by + 8); c.quadraticCurveTo(cx, by + 4, bx + bw - 6, by + 8); c.stroke();
    } else if (helm.type === 'furHood') {
      // Sedna — parka hood framing the face with puffy fur trim
      const fur = helm.fur || '#fff';
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx - 3, by + 22);
      c.quadraticCurveTo(bx - 5, by - 8, cx, by - 8);
      c.quadraticCurveTo(bx + bw + 5, by - 8, bx + bw + 3, by + 22);
      c.lineTo(bx + bw - 1, by + 22);
      c.quadraticCurveTo(bx + bw, by + 3, cx, by + 3);
      c.quadraticCurveTo(bx, by + 3, bx + 1, by + 22);
      c.closePath();
      c.fill(); c.lineWidth = 1.2; c.strokeStyle = outline; c.stroke();
      c.fillStyle = fur;
      for (let i = 0; i <= 10; i++) {
        const a = Math.PI + i * Math.PI / 10;
        const fx = cx + Math.cos(a) * 17, fy = by + 13 + Math.sin(a) * 12;
        c.beginPath(); c.arc(fx, fy, 3, 0, Math.PI * 2); c.fill();
      }
      c.strokeStyle = 'rgba(0,40,80,0.25)'; c.lineWidth = 0.6;
      c.beginPath(); c.arc(cx, by + 13, 17, Math.PI, 0); c.stroke();
    } else if (helm.type === 'goggleMask') {
      // Tlaloc — ringed goggle eyes, curled-lip fangs, feather crest
      const ring = helm.accent || '#a0e8d0';
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + 4, by + 7); c.quadraticCurveTo(cx, by - 7, bx + bw - 4, by + 7);
      c.closePath(); c.fill(); c.lineWidth = 1.2; c.strokeStyle = outline; c.stroke();
      for (let i = 0; i < 5; i++) {
        c.fillStyle = i % 2 ? ring : (helm.feather || '#40c0ff');
        c.beginPath(); c.ellipse(bx + 9 + i * 4.5, by - 3 - Math.sin(i / 4 * Math.PI) * 3, 1.8, 4.5, (i - 2) * 0.25, 0, Math.PI * 2);
        c.fill();
      }
      c.strokeStyle = outline; c.lineWidth = 4;
      c.beginPath(); c.arc(bx + 10, by + 14, 6.8, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.arc(bx + 26, by + 14, 6.8, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = ring; c.lineWidth = 2.4;
      c.beginPath(); c.arc(bx + 10, by + 14, 6.8, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.arc(bx + 26, by + 14, 6.8, 0, Math.PI * 2); c.stroke();
      // fangs under mouth
      c.fillStyle = '#fff';
      c.beginPath();
      c.moveTo(cx - 5, by + 35); c.lineTo(cx - 3.5, by + 39); c.lineTo(cx - 2, by + 35);
      c.moveTo(cx + 2, by + 35); c.lineTo(cx + 3.5, by + 39); c.lineTo(cx + 5, by + 35);
      c.fill(); c.lineWidth = 0.7; c.strokeStyle = outline; c.stroke();
    } else if (helm.type === 'wanderHat') {
      // Odin the Wanderer — wide-brim hat + eyepatch over the back eye
      c.fillStyle = color;
      c.beginPath();
      c.ellipse(cx + 1, by + 5, 24, 4.5, -0.08, 0, Math.PI * 2);
      c.fill(); c.lineWidth = 1.3; c.strokeStyle = outline; c.stroke();
      c.beginPath();
      c.moveTo(bx + 6, by + 4);
      c.quadraticCurveTo(bx + 7, by - 14, cx + 2, by - 13);
      c.quadraticCurveTo(bx + bw - 5, by - 12, bx + bw - 6, by + 4);
      c.closePath();
      c.fill(); c.stroke();
      c.fillStyle = helm.accent || '#ffd060';
      c.fillRect(bx + 7, by, bw - 13, 2.5);
      // eyepatch (back eye = left)
      c.strokeStyle = outline; c.lineWidth = 1;
      c.beginPath(); c.moveTo(bx + 1, by + 8); c.lineTo(bx + 30, by + 20); c.stroke();
      c.fillStyle = helm.patch || '#1a1a28';
      c.beginPath(); c.ellipse(bx + 10.5, by + 14.5, 5.8, 5.2, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    } else if (helm.type === 'flameHair') {
      // Pele — living lava hair, tongues flicker with frame phase
      const hot = helm.hot || '#ffe080';
      const flick = (opts.antBob || 0) * 0.6;
      const tongues = [[-14, 8, 0.9], [-7, 13, 1], [0, 16, 1.1], [7, 13, 1], [14, 8, 0.9]];
      for (const [col, s] of [[color, 1], [hot, 0.55]]) {
        c.fillStyle = col;
        for (const [ox, h, k] of tongues) {
          const fx = cx + ox, hh = h * s * k + (ox % 2 ? flick : -flick);
          c.beginPath();
          c.moveTo(fx - 4.5 * s, by + 7);
          c.quadraticCurveTo(fx - 4 * s, by + 2 - hh * 0.5, fx - 3, by + 4 - hh);
          c.quadraticCurveTo(fx + 5 * s, by + 2 - hh * 0.4, fx + 4.5 * s, by + 7);
          c.closePath(); c.fill();
        }
      }
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + 3, by + 11); c.quadraticCurveTo(cx, by - 2, bx + bw - 3, by + 11);
      c.lineTo(bx + bw - 3, by + 7); c.quadraticCurveTo(cx, by - 5, bx + 3, by + 7);
      c.closePath(); c.fill();
      c.lineWidth = 1; c.strokeStyle = outline; c.stroke();
    } else if (helm.type === 'sunHalo') {
      // Amaterasu — radiant half-halo above head + kanzashi hairpins
      const accent = helm.accent || '#c83030';
      c.strokeStyle = color; c.lineWidth = 1.6;
      c.beginPath();
      for (let i = 0; i <= 8; i++) {
        const a = Math.PI + i * Math.PI / 8;
        c.moveTo(cx + Math.cos(a) * 16, by + 8 + Math.sin(a) * 16);
        c.lineTo(cx + Math.cos(a) * 22, by + 8 + Math.sin(a) * 22);
      }
      c.stroke();
      c.strokeStyle = outline; c.lineWidth = 3.5;
      c.beginPath(); c.arc(cx, by + 8, 15, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
      c.strokeStyle = color; c.lineWidth = 2;
      c.stroke();
      c.fillStyle = accent;
      c.fillRect(bx + 5, by + 4, bw - 10, 3);
      c.lineWidth = 0.8; c.strokeStyle = outline; c.strokeRect(bx + 5, by + 4, bw - 10, 3);
      // hairpins with dangling beads
      for (const s of [-1, 1]) {
        const px = cx + s * 12;
        c.strokeStyle = helm.band || '#ffd060'; c.lineWidth = 1.2;
        c.beginPath(); c.moveTo(px, by + 5); c.lineTo(px + s * 4, by - 3); c.stroke();
        c.fillStyle = accent;
        c.beginPath(); c.arc(px + s * 4, by - 3, 1.8, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(px + s * 1, by + 10, 1.1, 0, Math.PI * 2); c.fill();
      }
    } else if (helm.type === 'shadowCowl') {
      // Shadow — deep hooded cowl, pointed tip flopping back, purple edge glow
      const glow = helm.accent || '#c080ff';
      const droop = (opts.antBob || 0) * 1.5;
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + 3, by + 20);
      c.quadraticCurveTo(bx, by - 6, cx - 2, by - 10);
      c.quadraticCurveTo(bx + bw + 2, by - 8, bx + bw + 1, by + 16);
      c.quadraticCurveTo(bx + bw - 4, by + 6, cx + 2, by + 9);
      c.quadraticCurveTo(bx + 8, by + 6, bx + 3, by + 20);
      c.closePath();
      c.fill();
      c.lineWidth = 1.4; c.strokeStyle = outline; c.stroke();
      // trailing pointed tip flopping back
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx - 1, by - 5);
      c.quadraticCurveTo(bx - 14, by - 8 + droop, bx - 10, by + 3 + droop);
      c.quadraticCurveTo(bx - 4, by, bx + 2, by - 3);
      c.closePath();
      c.fill(); c.stroke();
      // purple rim glow along the hood's edge
      c.strokeStyle = glow; c.lineWidth = 1.1; c.globalAlpha = 0.75;
      c.beginPath();
      c.moveTo(bx + 3, by + 19); c.quadraticCurveTo(bx, by - 5, cx - 2, by - 9);
      c.quadraticCurveTo(bx + bw + 1, by - 7, bx + bw, by + 15);
      c.stroke();
      c.globalAlpha = 1;
    } else if (helm.type === 'coralCrown') {
      // Poseidon — branching coral crown with pearls and a shell centerpiece
      const pearl = helm.pearl || '#fff8f0';
      c.fillStyle = helm.band || '#0a3858';
      c.fillRect(bx + 4, by + 9, bw - 8, 3);
      c.lineWidth = 1; c.strokeStyle = outline; c.strokeRect(bx + 4, by + 9, bw - 8, 3);
      // branching coral limbs
      c.strokeStyle = color; c.lineCap = 'round'; c.lineWidth = 2.4;
      c.beginPath();
      c.moveTo(bx + 9, by + 9); c.lineTo(bx + 6, by - 2); c.lineTo(bx + 2, by - 8);
      c.moveTo(bx + 6, by - 2); c.lineTo(bx + 10, by - 7);
      c.moveTo(cx, by + 9); c.lineTo(cx - 2, by - 4); c.lineTo(cx - 6, by - 10);
      c.moveTo(cx - 2, by - 4); c.lineTo(cx + 4, by - 9);
      c.moveTo(bx + bw - 9, by + 9); c.lineTo(bx + bw - 6, by - 2); c.lineTo(bx + bw - 2, by - 8);
      c.moveTo(bx + bw - 6, by - 2); c.lineTo(bx + bw - 10, by - 7);
      c.stroke();
      c.strokeStyle = outline; c.lineWidth = 0.9;
      c.stroke();
      c.lineCap = 'butt';
      // small shell fan at the crown's front
      c.fillStyle = helm.shell || '#ffd8c0';
      c.beginPath();
      c.moveTo(cx, by + 8);
      for (let i = 0; i <= 4; i++) {
        const a = Math.PI * 0.65 + i * (Math.PI * 0.3 / 4);
        c.lineTo(cx + Math.cos(a) * 6, by + 8 - Math.sin(a) * 6);
      }
      c.closePath(); c.fill(); c.lineWidth = 0.8; c.strokeStyle = outline; c.stroke();
      // pearls at the branch tips
      c.fillStyle = pearl;
      for (const [px, py, r] of [[bx + 4, by - 7, 1.5], [cx - 5, by - 9, 1.7], [bx + bw - 3, by - 7, 1.5]]) {
        c.beginPath(); c.arc(px, py, r, 0, Math.PI * 2); c.fill();
        c.lineWidth = 0.7; c.strokeStyle = outline; c.stroke();
      }
    } else if (helm.type === 'skullCrown') {
      // Kali — dark diadem with small white skulls, red gem centerpiece
      const gem = helm.gem || '#ff3060';
      const skull = helm.skull || '#f0ead8';
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + 3, by + 12); c.quadraticCurveTo(cx, by + 3, bx + bw - 3, by + 12);
      c.lineTo(bx + bw - 3, by + 8); c.quadraticCurveTo(cx, by - 1, bx + 3, by + 8);
      c.closePath();
      c.fill(); c.lineWidth = 1.2; c.strokeStyle = outline; c.stroke();
      // small skulls along the band
      for (const sx of [bx + 8, bx + 17, bx + bw - 17, bx + bw - 8]) {
        c.fillStyle = skull;
        c.beginPath(); c.arc(sx, by + 4, 2.6, 0, Math.PI * 2); c.fill();
        c.lineWidth = 0.6; c.strokeStyle = outline; c.stroke();
        c.fillStyle = outline;
        c.fillRect(sx - 1.6, by + 5.2, 1, 1.2); c.fillRect(sx + 0.6, by + 5.2, 1, 1.2);
      }
      // central red gem
      c.fillStyle = gem;
      c.beginPath(); c.arc(cx, by, 2.6, 0, Math.PI * 2); c.fill();
      c.lineWidth = 0.9; c.strokeStyle = outline; c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.6)';
      c.beginPath(); c.arc(cx - 0.8, by - 0.8, 0.8, 0, Math.PI * 2); c.fill();
    } else if (helm.type === 'wolfPelt') {
      // Skadi — wolf-head pelt hood: snout forward, ears on top, fur ruff
      const fur = helm.fur || '#fff';
      const inner = helm.innerEar || '#a0d8ff';
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx, by + 16); c.quadraticCurveTo(bx - 2, by - 4, cx - 4, by - 8);
      c.quadraticCurveTo(bx + bw + 4, by - 6, bx + bw + 2, by + 12);
      c.lineTo(bx + bw - 2, by + 12);
      c.quadraticCurveTo(bx + bw, by, cx, by - 2);
      c.quadraticCurveTo(bx + 2, by, bx + 4, by + 16);
      c.closePath();
      c.fill(); c.lineWidth = 1.3; c.strokeStyle = outline; c.stroke();
      // forward-jutting snout
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + bw - 2, by + 6);
      c.quadraticCurveTo(bx + bw + 14, by + 4, bx + bw + 13, by + 11);
      c.quadraticCurveTo(bx + bw + 4, by + 12, bx + bw - 4, by + 11);
      c.closePath();
      c.fill(); c.stroke();
      c.fillStyle = outline;
      c.beginPath(); c.arc(bx + bw + 12, by + 8, 1, 0, Math.PI * 2); c.fill();
      // ears on top
      for (const s of [-1, 1]) {
        c.fillStyle = color;
        c.beginPath();
        c.moveTo(cx + s * 4, by - 6); c.lineTo(cx + s * 2, by - 17); c.lineTo(cx + s * 10, by - 8);
        c.closePath(); c.fill(); c.lineWidth = 1.1; c.strokeStyle = outline; c.stroke();
        c.fillStyle = inner;
        c.beginPath();
        c.moveTo(cx + s * 4.5, by - 8); c.lineTo(cx + s * 3, by - 14); c.lineTo(cx + s * 8, by - 8.5);
        c.closePath(); c.fill();
      }
      // fur ruff along the hood edge
      c.fillStyle = fur;
      for (let i = 0; i <= 4; i++) {
        c.beginPath(); c.arc(bx + 2 + i * 8, by + 15, 2, 0, Math.PI * 2); c.fill();
      }
    } else if (helm.type === 'petasos') {
      // Hermes — low wide-brimmed traveler's hat with small wings at the sides
      const wing = helm.accent || '#80e0ff';
      c.fillStyle = color;
      c.beginPath();
      c.ellipse(cx, by + 8, 21, 4, 0, 0, Math.PI * 2);
      c.fill(); c.lineWidth = 1.2; c.strokeStyle = outline; c.stroke();
      c.beginPath();
      c.moveTo(bx + 8, by + 7);
      c.quadraticCurveTo(bx + 9, by - 6, cx, by - 6);
      c.quadraticCurveTo(bx + bw - 9, by - 6, bx + bw - 8, by + 7);
      c.closePath();
      c.fill(); c.stroke();
      c.fillStyle = wing;
      c.fillRect(bx + 9, by + 4, bw - 18, 1.5);
      // small wings sprouting from the brim
      for (const s of [-1, 1]) {
        const wx = cx + s * 20;
        c.fillStyle = wing;
        c.beginPath();
        c.moveTo(wx, by + 8);
        c.quadraticCurveTo(wx + s * 9, by + 2, wx + s * 8, by + 10);
        c.quadraticCurveTo(wx + s * 3, by + 9, wx, by + 8);
        c.closePath(); c.fill();
        c.lineWidth = 0.9; c.strokeStyle = outline; c.stroke();
        c.lineWidth = 0.5;
        c.beginPath();
        c.moveTo(wx + s * 2, by + 6); c.lineTo(wx + s * 7, by + 4);
        c.moveTo(wx + s * 2, by + 8); c.lineTo(wx + s * 7, by + 7);
        c.stroke();
      }
    } else if (helm.type === 'nasalHelm') {
      // Tyr — Norse spangenhelm: conical dome, riveted bands, thin nose guard
      const accent = helm.accent || '#a01818';
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + 4, by + 12);
      c.quadraticCurveTo(bx + 5, by - 3, cx, by - 10);
      c.quadraticCurveTo(bx + bw - 5, by - 3, bx + bw - 4, by + 12);
      c.lineTo(bx + bw - 4, by + 14);
      c.lineTo(bx + 4, by + 14);
      c.closePath();
      c.fill(); c.lineWidth = 1.4; c.strokeStyle = outline; c.stroke();
      // riveted brow band + crown seam
      c.fillStyle = accent;
      c.fillRect(bx + 4, by + 9, bw - 8, 2);
      c.strokeStyle = accent; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(cx, by - 9); c.lineTo(cx, by + 9); c.stroke();
      c.fillStyle = helm.rivet || '#e8e8e8';
      for (const rx of [bx + 6, bx + 14, cx, bx + bw - 14, bx + bw - 6]) {
        c.beginPath(); c.arc(rx, by + 10, 0.9, 0, Math.PI * 2); c.fill();
      }
      // thin nose guard down between the eyes
      c.fillStyle = color;
      c.fillRect(cx - 1.3, by + 10, 2.6, 11);
      c.lineWidth = 0.9; c.strokeStyle = outline;
      c.strokeRect(cx - 1.3, by + 10, 2.6, 11);
    } else if (helm.type === 'triskelCrown') {
      // Lugh — gold Celtic band with a triskelion medallion and small sun rays
      const accent = helm.accent || '#1a5828';
      c.fillStyle = color;
      c.fillRect(bx + 3, by + 6, bw - 6, 4);
      c.lineWidth = 1.1; c.strokeStyle = outline; c.strokeRect(bx + 3, by + 6, bw - 6, 4);
      c.fillStyle = 'rgba(255,255,255,0.5)';
      c.fillRect(bx + 4, by + 6, bw - 8, 1);
      // small sun rays above the band
      c.strokeStyle = color; c.lineWidth = 1.2;
      c.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = Math.PI + i * Math.PI / 4;
        c.moveTo(cx + Math.cos(a) * 6, by + 6 + Math.sin(a) * 6);
        c.lineTo(cx + Math.cos(a) * 10, by + 6 + Math.sin(a) * 10);
      }
      c.stroke();
      // triskelion medallion, front-center
      c.fillStyle = accent;
      c.beginPath(); c.arc(cx, by + 8, 3.4, 0, Math.PI * 2); c.fill();
      c.lineWidth = 0.9; c.strokeStyle = outline; c.stroke();
      c.strokeStyle = color; c.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const a = i * (Math.PI * 2 / 3) - Math.PI / 2;
        c.beginPath();
        c.arc(cx + Math.cos(a) * 1.4, by + 8 + Math.sin(a) * 1.4, 1.6, a, a + Math.PI * 1.3);
        c.stroke();
      }
    } else if (helm.type === 'braidCrown') {
      // Freyja — braided hair crown ringed with small flowers
      c.strokeStyle = color; c.lineWidth = 5; c.lineCap = 'round';
      c.beginPath();
      c.moveTo(bx + 3, by + 11);
      c.quadraticCurveTo(cx, by + 2, bx + bw - 3, by + 11);
      c.stroke();
      c.lineCap = 'butt';
      // braid cross-hatch texture
      c.strokeStyle = outline; c.lineWidth = 0.8;
      c.beginPath();
      for (let i = 0; i <= 6; i++) {
        const t = i / 6, px = bx + 5 + t * (bw - 10), py = by + 10 - Math.sin(t * Math.PI) * 7.5;
        c.moveTo(px - 2, py - 2); c.lineTo(px + 2, py + 2);
        c.moveTo(px - 2, py + 2); c.lineTo(px + 2, py - 2);
      }
      c.stroke();
      // small flowers along the crown
      const petal = helm.accent || '#a04020';
      const center = helm.flower || '#fff8e0';
      for (const [fx, fy] of [[bx + 9, by + 5], [cx, by - 1], [bx + bw - 9, by + 5]]) {
        c.fillStyle = petal;
        for (let i = 0; i < 5; i++) {
          const a = i * Math.PI * 2 / 5;
          c.beginPath(); c.arc(fx + Math.cos(a) * 1.8, fy + Math.sin(a) * 1.8, 1.3, 0, Math.PI * 2); c.fill();
        }
        c.fillStyle = center;
        c.beginPath(); c.arc(fx, fy, 1.1, 0, Math.PI * 2); c.fill();
      }
    } else if (helm.type === 'laurel') {
      // Apollo — slim golden laurel wreath, two sprays meeting at the front
      const accent = helm.accent || '#a06010';
      c.strokeStyle = accent; c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(bx + 5, by + 12); c.quadraticCurveTo(cx, by + 4, bx + bw - 5, by + 12);
      c.stroke();
      for (const s of [-1, 1]) {
        for (let i = 0; i < 4; i++) {
          const t = i / 3;
          const lx = cx + s * (3 + t * 15), ly = by + 10 - t * 6;
          c.save();
          c.translate(lx, ly);
          c.rotate(s * (0.5 + t * 0.5));
          c.fillStyle = color;
          c.beginPath();
          c.moveTo(0, 1.5); c.quadraticCurveTo(-2.2, -2.5, 0, -6);
          c.quadraticCurveTo(2.2, -2.5, 0, 1.5);
          c.closePath(); c.fill();
          c.lineWidth = 0.6; c.strokeStyle = accent; c.stroke();
          c.restore();
        }
      }
      // small gold berry where the sprays meet
      c.fillStyle = accent;
      c.beginPath(); c.arc(cx, by + 9.5, 1.3, 0, Math.PI * 2); c.fill();
    } else if (helm.type === 'flowerCrown') {
      // Persephone — ring of pink and white blossoms with small leaves
      c.strokeStyle = helm.band || '#3a7028'; c.lineWidth = 3;
      c.beginPath();
      c.moveTo(bx + 4, by + 11); c.quadraticCurveTo(cx, by + 2, bx + bw - 4, by + 11);
      c.stroke();
      const petals = [helm.accent || '#ff5070', helm.petal2 || '#fff8f0'];
      for (let i = 0; i < 5; i++) {
        const t = i / 4, fx = bx + 6 + t * (bw - 12), fy = by + 9 - Math.sin(t * Math.PI) * 6;
        c.fillStyle = petals[i % 2];
        for (let k = 0; k < 5; k++) {
          const a = k * Math.PI * 2 / 5;
          c.beginPath(); c.arc(fx + Math.cos(a) * 2, fy + Math.sin(a) * 2, 1.5, 0, Math.PI * 2); c.fill();
        }
        c.fillStyle = color;
        c.beginPath(); c.arc(fx, fy, 1.2, 0, Math.PI * 2); c.fill();
        c.lineWidth = 0.6; c.strokeStyle = outline; c.stroke();
        // small leaf beside each blossom
        c.fillStyle = helm.leaf || '#3a7028';
        c.beginPath();
        c.ellipse(fx + (i % 2 ? 3 : -3), fy + 3, 2.4, 1.1, i % 2 ? 0.6 : -0.6, 0, Math.PI * 2);
        c.fill();
      }
    } else if (helm.type === 'strawCross') {
      // Brigid — woven straw band with a Brigid's cross emblem and a small flame
      const straw = helm.accent || '#e8c060';
      c.fillStyle = color;
      c.fillRect(bx + 3, by + 8, bw - 6, 4);
      c.lineWidth = 1; c.strokeStyle = outline; c.strokeRect(bx + 3, by + 8, bw - 6, 4);
      c.strokeStyle = outline; c.lineWidth = 0.6;
      c.beginPath();
      for (let i = 0; i < 8; i++) { const px = bx + 4 + i * 4; c.moveTo(px, by + 8); c.lineTo(px, by + 12); }
      c.stroke();
      // Brigid's cross — four woven arms in a pinwheel
      c.strokeStyle = straw; c.lineCap = 'round'; c.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2 + Math.PI / 4;
        c.beginPath();
        c.moveTo(cx, by + 5); c.lineTo(cx + Math.cos(a) * 5, by + 5 + Math.sin(a) * 5);
        c.stroke();
      }
      c.strokeStyle = outline; c.lineWidth = 0.6;
      c.beginPath(); c.arc(cx, by + 5, 5, 0, Math.PI * 2); c.stroke();
      c.lineCap = 'butt';
      // small sacred flame above
      c.fillStyle = helm.flame || '#ffb050';
      c.beginPath();
      c.moveTo(cx, by - 6); c.quadraticCurveTo(cx - 3, by - 1, cx, by + 1);
      c.quadraticCurveTo(cx + 3, by - 1, cx, by - 6);
      c.closePath(); c.fill();
    } else if (helm.type === 'foxMask') {
      // Inari — white kitsune mask tilted atop the head, with ears and red markings
      const mark = helm.accent || '#c01828';
      c.save();
      c.translate(cx + 6, by + 2);
      c.rotate(-0.35);
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(0, -11); c.quadraticCurveTo(9, -9, 8, 1);
      c.quadraticCurveTo(6, 9, 0, 10);
      c.quadraticCurveTo(-6, 9, -8, 1);
      c.quadraticCurveTo(-9, -9, 0, -11);
      c.closePath();
      c.fill(); c.lineWidth = 1.1; c.strokeStyle = outline; c.stroke();
      // red cheek markings
      c.strokeStyle = mark; c.lineWidth = 1.1;
      c.beginPath();
      c.moveTo(-6, -1); c.lineTo(-2, -1); c.moveTo(2, -1); c.lineTo(6, -1);
      c.moveTo(-4, 4); c.lineTo(4, 4);
      c.stroke();
      // ears peeking above the mask
      for (const s of [-1, 1]) {
        c.fillStyle = color;
        c.beginPath();
        c.moveTo(s * 3, -10); c.lineTo(s * 2, -19); c.lineTo(s * 8, -11);
        c.closePath(); c.fill(); c.lineWidth = 0.9; c.strokeStyle = outline; c.stroke();
        c.fillStyle = mark;
        c.beginPath(); c.moveTo(s * 3.5, -11); c.lineTo(s * 3, -15.5); c.lineTo(s * 6.5, -11.5); c.closePath(); c.fill();
      }
      c.restore();
    } else if (helm.type === 'setBeast') {
      // Set — Set-animal head: tall squared ears, long curved snout forward
      const accent = helm.accent || '#ffd060';
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + 3, by + 13); c.quadraticCurveTo(cx, by, bx + bw - 3, by + 13);
      c.lineTo(bx + bw - 3, by + 15); c.lineTo(bx + 3, by + 15);
      c.closePath();
      c.fill(); c.lineWidth = 1.3; c.strokeStyle = outline; c.stroke();
      // squared-top ears
      for (const s of [-1, 1]) {
        c.fillStyle = color;
        c.beginPath();
        c.moveTo(cx + s * 3, by + 4);
        c.lineTo(cx + s * 2, by - 13); c.lineTo(cx + s * 9, by - 13); c.lineTo(cx + s * 8, by + 1);
        c.closePath(); c.fill(); c.lineWidth = 1.1; c.strokeStyle = outline; c.stroke();
        c.fillStyle = accent;
        c.fillRect(cx + s * 3, by - 12, s * 4, 2);
      }
      // long curved snout jutting forward, tip curving down
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + bw - 4, by + 8);
      c.quadraticCurveTo(bx + bw + 16, by + 5, bx + bw + 15, by + 12);
      c.quadraticCurveTo(bx + bw + 12, by + 16, bx + bw + 8, by + 13);
      c.quadraticCurveTo(bx + bw + 2, by + 13, bx + bw - 6, by + 12);
      c.closePath();
      c.fill(); c.lineWidth = 1.2; c.strokeStyle = outline; c.stroke();
      c.fillStyle = outline;
      c.beginPath(); c.arc(bx + bw + 14, by + 10, 1, 0, Math.PI * 2); c.fill();
    } else if (helm.type === 'jaguarHelm') {
      // Tezcatlipoca — jaguar head helm, open jaws framing the top, rosette spots
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + 2, by + 13); c.quadraticCurveTo(bx + 1, by - 2, cx, by - 4);
      c.quadraticCurveTo(bx + bw - 1, by - 2, bx + bw - 2, by + 13);
      c.lineTo(bx + bw - 2, by + 15); c.lineTo(bx + 2, by + 15);
      c.closePath();
      c.fill(); c.lineWidth = 1.3; c.strokeStyle = outline; c.stroke();
      // upper jaw halves curling open above, framing the top
      for (const s of [-1, 1]) {
        c.fillStyle = color;
        c.beginPath();
        c.moveTo(cx + s * 3, by - 3);
        c.quadraticCurveTo(cx + s * 14, by - 14, cx + s * 9, by - 3);
        c.quadraticCurveTo(cx + s * 6, by - 8, cx + s * 2, by - 1);
        c.closePath(); c.fill(); c.lineWidth = 1.1; c.strokeStyle = outline; c.stroke();
        // small fangs along the jaw edge
        c.fillStyle = '#fff';
        c.beginPath();
        c.moveTo(cx + s * 6, by - 9); c.lineTo(cx + s * 7.5, by - 5); c.lineTo(cx + s * 8.5, by - 8);
        c.closePath(); c.fill();
      }
      // rosette spots across the pelt
      c.fillStyle = helm.spot || '#1a0a04';
      for (const [sx, sy] of [[bx + 8, by + 6], [cx - 4, by + 2], [cx + 5, by + 3], [bx + bw - 8, by + 6], [bx + 12, by + 11], [bx + bw - 12, by + 11]]) {
        c.beginPath(); c.ellipse(sx, sy, 1.6, 1.1, 0.3, 0, Math.PI * 2); c.fill();
      }
    } else if (helm.type === 'kabuto') {
      // Susanoo — samurai kabuto: domed bowl, flared neck guard, crescent maedate
      const plate = helm.accent || '#a0d0ff';
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + 3, by + 10); c.quadraticCurveTo(cx, by - 8, bx + bw - 3, by + 10);
      c.lineTo(bx + bw - 3, by + 12); c.lineTo(bx + 3, by + 12);
      c.closePath();
      c.fill(); c.lineWidth = 1.3; c.strokeStyle = outline; c.stroke();
      // flared, layered neck guard (shikoro)
      for (let i = 0; i < 3; i++) {
        const py = by + 10 + i * 3.6, sw = bw - 4 + i * 5;
        c.fillStyle = i % 2 ? plate : color;
        c.beginPath();
        c.moveTo(cx - sw / 2, py); c.lineTo(cx + sw / 2, py);
        c.lineTo(cx + sw / 2 - 2, py + 3.6); c.lineTo(cx - sw / 2 + 2, py + 3.6);
        c.closePath(); c.fill(); c.lineWidth = 0.8; c.strokeStyle = outline; c.stroke();
      }
      // brow band
      c.fillStyle = plate;
      c.fillRect(bx + 4, by + 8, bw - 8, 2);
      // large crescent maedate crest, front-center
      c.strokeStyle = helm.horn || '#dde4ec'; c.lineWidth = 2.6; c.lineCap = 'round';
      c.beginPath();
      c.arc(cx, by - 4, 9, Math.PI * 1.15, Math.PI * 1.85);
      c.stroke();
      c.lineCap = 'butt';
    } else if (helm.type === 'shadeHelm') {
      // Hades — dark full helm with a lowered visor and glowing purple eye slits
      const glow = helm.accent || '#c050ff';
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(bx + 1, by + 24); c.quadraticCurveTo(bx - 1, by - 6, cx, by - 8);
      c.quadraticCurveTo(bx + bw + 1, by - 6, bx + bw - 1, by + 24);
      c.quadraticCurveTo(cx, by + 30, bx + 1, by + 24);
      c.closePath();
      c.fill(); c.lineWidth = 1.4; c.strokeStyle = outline; c.stroke();
      // visor plate over the upper face
      c.fillStyle = helm.visor || '#0a0410';
      c.fillRect(bx + 2, by + 7, bw - 4, 12);
      c.lineWidth = 1; c.strokeStyle = outline; c.strokeRect(bx + 2, by + 7, bw - 4, 12);
      // glowing purple eye slits
      for (const ex of [bx + 10, bx + 26]) {
        const g = c.createRadialGradient(ex, by + 14, 0.5, ex, by + 14, 4);
        g.addColorStop(0, glow); g.addColorStop(1, 'rgba(192,80,255,0)');
        c.fillStyle = g;
        c.beginPath(); c.ellipse(ex, by + 14, 4, 2, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = glow;
        c.fillRect(ex - 2.5, by + 13, 5, 1.6);
      }
      // brow ridge trim
      c.strokeStyle = glow; c.lineWidth = 0.8;
      c.beginPath(); c.moveTo(bx + 3, by + 7); c.lineTo(bx + bw - 3, by + 7); c.stroke();
    } else if (helm.type === 'tripleMoon') {
      // Hekate — diadem topped by the triple-moon (waxing-full-waning) symbol
      const moon = helm.gem || '#e8d8ff';
      const dark = helm.accent || '#3a0860';
      c.fillStyle = color;
      c.fillRect(bx + 3, by + 7, bw - 6, 3.5);
      c.lineWidth = 1; c.strokeStyle = outline; c.strokeRect(bx + 3, by + 7, bw - 6, 3.5);
      c.fillStyle = 'rgba(255,255,255,0.4)';
      c.fillRect(bx + 4, by + 7, bw - 8, 1);
      // full moon, center
      c.fillStyle = moon;
      c.beginPath(); c.arc(cx, by + 2, 3.4, 0, Math.PI * 2); c.fill();
      c.lineWidth = 0.9; c.strokeStyle = outline; c.stroke();
      // waxing crescent, left
      c.fillStyle = moon;
      c.beginPath(); c.arc(cx - 10, by + 4, 2.6, 0, Math.PI * 2); c.fill();
      c.fillStyle = dark;
      c.beginPath(); c.arc(cx - 8.6, by + 4, 2.6, 0, Math.PI * 2); c.fill();
      // waning crescent, right (mirrored)
      c.fillStyle = moon;
      c.beginPath(); c.arc(cx + 10, by + 4, 2.6, 0, Math.PI * 2); c.fill();
      c.fillStyle = dark;
      c.beginPath(); c.arc(cx + 8.6, by + 4, 2.6, 0, Math.PI * 2); c.fill();
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
    } else if (weapon.type === 'bow') {
      // recurve bow held upright, arrow nocked pointing forward
      const wood = weapon.wood || '#ffd060';
      const accent = weapon.accent || '#fff8c0';
      const hx = bx + bw + 3, top = by + 1, bot = by + 41, my = (top + bot) / 2;
      c.strokeStyle = outline; c.lineWidth = 3.2; c.lineCap = 'round';
      c.beginPath();
      c.moveTo(hx - 2, top); c.quadraticCurveTo(hx + 12, my, hx - 2, bot);
      c.stroke();
      c.strokeStyle = wood; c.lineWidth = 1.8;
      c.stroke();
      // recurved tips
      c.beginPath();
      c.moveTo(hx - 2, top); c.lineTo(hx - 4, top - 2);
      c.moveTo(hx - 2, bot); c.lineTo(hx - 4, bot + 2);
      c.stroke();
      c.lineCap = 'butt';
      // string
      c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 0.6;
      c.beginPath(); c.moveTo(hx - 3, top); c.lineTo(hx - 3, bot); c.stroke();
      // arrow
      c.strokeStyle = outline; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(hx - 8, my); c.lineTo(hx + 11, my); c.stroke();
      c.fillStyle = accent;
      c.beginPath(); c.moveTo(hx + 15, my); c.lineTo(hx + 10, my - 2.5); c.lineTo(hx + 10, my + 2.5); c.closePath();
      c.fill(); c.lineWidth = 0.8; c.stroke();
      c.fillStyle = weapon.fletch || '#ff8040';
      c.beginPath(); c.moveTo(hx - 8, my); c.lineTo(hx - 11, my - 2.5); c.lineTo(hx - 6, my); c.lineTo(hx - 11, my + 2.5); c.closePath();
      c.fill();
      // grip wrap
      c.fillStyle = weapon.grip || '#a06010';
      c.fillRect(hx + 3, my - 3, 2.5, 6);
    } else if (weapon.type === 'spear') {
      // long spear (Gungnir) — leaf blade, rune bands on shaft
      const handle = weapon.handle || '#5a3818';
      const blade = weapon.blade || '#dde8f0';
      const accent = weapon.accent || '#ffd060';
      const hx = bx + bw + 3, top = by - 20;
      c.fillStyle = handle;
      roundRectPath(c, hx - 1.2, top + 10, 2.4, 54, 1);
      c.fill(); c.lineWidth = 0.9; c.strokeStyle = outline; c.stroke();
      c.fillStyle = accent;
      for (let i = 0; i < 3; i++) c.fillRect(hx - 1.6, top + 14 + i * 3, 3.2, 1.2);
      const bGrd = c.createLinearGradient(hx - 3, 0, hx + 3, 0);
      bGrd.addColorStop(0, '#7a8898'); bGrd.addColorStop(0.5, blade); bGrd.addColorStop(1, '#fff');
      c.fillStyle = bGrd;
      c.beginPath();
      c.moveTo(hx, top);
      c.quadraticCurveTo(hx + 4.5, top + 6, hx, top + 12);
      c.quadraticCurveTo(hx - 4.5, top + 6, hx, top);
      c.closePath();
      c.fill(); c.lineWidth = 1; c.stroke();
      c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 0.6;
      c.beginPath(); c.moveTo(hx, top + 2); c.lineTo(hx, top + 11); c.stroke();
    } else if (weapon.type === 'torch') {
      // flaming torch — flicker driven by frame phase
      const handle = weapon.handle || '#3a1a08';
      const flame = weapon.flame || '#c050ff';
      const hot = weapon.hot || '#fff0ff';
      const hx = bx + bw + 3, hy = by + 12 + (opts.antBob || 0) * 0.3;
      const fl = 1 + (opts.t || 0) * 0.25;
      c.fillStyle = handle;
      c.beginPath();
      c.moveTo(hx - 2.2, hy + 4); c.lineTo(hx + 2.2, hy + 4); c.lineTo(hx + 1.2, hy + 24); c.lineTo(hx - 1.2, hy + 24);
      c.closePath(); c.fill(); c.lineWidth = 0.9; c.strokeStyle = outline; c.stroke();
      c.fillStyle = weapon.accent || '#ffd060';
      c.fillRect(hx - 3, hy + 2, 6, 3);
      c.strokeRect(hx - 3, hy + 2, 6, 3);
      const glow = c.createRadialGradient(hx, hy - 3, 1, hx, hy - 3, 10 * fl);
      glow.addColorStop(0, flame); glow.addColorStop(1, 'rgba(0,0,0,0)');
      c.globalAlpha = 0.45; c.fillStyle = glow;
      c.beginPath(); c.arc(hx, hy - 3, 10 * fl, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
      for (const [col, s] of [[flame, 1], [hot, 0.55]]) {
        c.fillStyle = col;
        c.beginPath();
        c.moveTo(hx - 4 * s, hy + 2);
        c.quadraticCurveTo(hx - 5 * s, hy - 5 * s * fl, hx + 1, hy - 11 * s * fl);
        c.quadraticCurveTo(hx + 5 * s, hy - 4 * s, hx + 4 * s, hy + 2);
        c.closePath(); c.fill();
      }
    } else if (weapon.type === 'khopesh') {
      // Egyptian sickle-sword — grip below, blade hooks forward
      const blade = weapon.blade || '#ffd060';
      const grip = weapon.grip || '#0a3870';
      const hx = bx + bw + 3, hy = by + 30;
      c.fillStyle = grip;
      roundRectPath(c, hx - 1.5, hy - 1, 3, 10, 1);
      c.fill(); c.lineWidth = 0.9; c.strokeStyle = outline; c.stroke();
      c.fillStyle = weapon.accent || '#c08020';
      c.fillRect(hx - 3, hy - 2, 6, 2);
      const bGrd = c.createLinearGradient(hx - 4, hy - 26, hx + 10, hy);
      bGrd.addColorStop(0, '#fff8d0'); bGrd.addColorStop(0.5, blade); bGrd.addColorStop(1, '#8a5a10');
      c.fillStyle = bGrd;
      c.beginPath();
      c.moveTo(hx - 1.5, hy - 2);
      c.lineTo(hx - 1.5, hy - 12);
      c.quadraticCurveTo(hx - 2, hy - 26, hx + 8, hy - 24);
      c.quadraticCurveTo(hx + 12, hy - 22, hx + 9, hy - 17);
      c.quadraticCurveTo(hx + 4, hy - 20, hx + 2, hy - 12);
      c.lineTo(hx + 1.5, hy - 2);
      c.closePath();
      c.fill(); c.lineWidth = 1; c.stroke();
    } else if (weapon.type === 'axe') {
      // bearded battle-axe — frosted cutting edge
      const handle = weapon.handle || '#1a3858';
      const head = weapon.head || '#dde8f0';
      const edge = weapon.accent || '#a0d8ff';
      const hx = bx + bw + 3, hy = by + 4 + (opts.antBob || 0) * 0.3;
      c.fillStyle = handle;
      roundRectPath(c, hx - 1.3, hy - 2, 2.6, 38, 1);
      c.fill(); c.lineWidth = 0.9; c.strokeStyle = outline; c.stroke();
      c.fillStyle = head;
      c.beginPath();
      c.moveTo(hx, hy);
      c.lineTo(hx + 6, hy - 2);
      c.quadraticCurveTo(hx + 13, hy + 4, hx + 9, hy + 14);
      c.quadraticCurveTo(hx + 5, hy + 9, hx, hy + 8);
      c.closePath();
      c.fill(); c.lineWidth = 1.1; c.stroke();
      c.strokeStyle = edge; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(hx + 6.5, hy - 1); c.quadraticCurveTo(hx + 12, hy + 4, hx + 8.7, hy + 12.5); c.stroke();
      // back spike
      c.fillStyle = head;
      c.beginPath(); c.moveTo(hx, hy + 1); c.lineTo(hx - 5, hy + 4); c.lineTo(hx, hy + 6); c.closePath();
      c.fill(); c.lineWidth = 0.8; c.strokeStyle = outline; c.stroke();
    } else if (weapon.type === 'scythe') {
      // reaper scythe — tall shaft, blade sweeping back over the head
      const handle = weapon.handle || '#080010';
      const blade = weapon.blade || '#3a1058';
      const edge = weapon.accent || '#c050ff';
      const hx = bx + bw + 3, top = by - 14;
      c.fillStyle = handle;
      roundRectPath(c, hx - 1.3, top, 2.6, 58, 1);
      c.fill(); c.lineWidth = 0.9; c.strokeStyle = outline; c.stroke();
      c.fillStyle = blade;
      c.beginPath();
      c.moveTo(hx + 1, top + 1);
      c.quadraticCurveTo(hx - 10, top - 8, hx - 24, top + 4);
      c.quadraticCurveTo(hx - 10, top - 1, hx - 1, top + 6);
      c.closePath();
      c.fill(); c.lineWidth = 1; c.strokeStyle = outline; c.stroke();
      c.strokeStyle = edge; c.lineWidth = 1.1;
      c.beginPath(); c.moveTo(hx - 22, top + 3.5); c.quadraticCurveTo(hx - 10, top - 0.5, hx - 1, top + 5.5); c.stroke();
      c.fillStyle = edge;
      c.beginPath(); c.arc(hx, top + 1, 1.6, 0, Math.PI * 2); c.fill();
    } else if (weapon.type === 'voidOrb') {
      // Shadow — floating dark orb (no shaft) hovering beside hand, orbiting ring, purple glow
      const core = weapon.color || '#1a0828';
      const accent = weapon.accent || '#c080ff';
      const hx = bx + bw + 5, hy = by + 24;
      const spin = (opts.t || 0) * Math.PI * 2;
      const glow = c.createRadialGradient(hx, hy, 1, hx, hy, 12);
      glow.addColorStop(0, accent);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      c.globalAlpha = 0.5;
      c.fillStyle = glow;
      c.beginPath(); c.arc(hx, hy, 12, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
      // orbiting ring (tilted ellipse)
      c.save();
      c.translate(hx, hy);
      c.rotate(spin * 0.3);
      c.strokeStyle = accent; c.lineWidth = 1;
      c.beginPath(); c.ellipse(0, 0, 8, 3, 0, 0, Math.PI * 2); c.stroke();
      c.restore();
      // orb body
      const orbGrd = c.createRadialGradient(hx - 1.5, hy - 1.5, 0.4, hx, hy, 5.5);
      orbGrd.addColorStop(0, '#f0d0ff');
      orbGrd.addColorStop(0.5, accent);
      orbGrd.addColorStop(1, core);
      c.fillStyle = orbGrd;
      c.beginPath(); c.arc(hx, hy, 5.5, 0, Math.PI * 2); c.fill();
      c.lineWidth = 1; c.strokeStyle = outline; c.stroke();
      // orbiting mote
      const mx = hx + Math.cos(spin) * 8, my = hy + Math.sin(spin) * 3;
      c.fillStyle = '#fff';
      c.beginPath(); c.arc(mx, my, 1.2, 0, Math.PI * 2); c.fill();
    } else if (weapon.type === 'flail') {
      // Anubis — nekhakha flail: short handle, three beaded strands hanging
      const handle = weapon.color || '#0a0604';
      const bead = weapon.accent || '#ffd060';
      const hx = bx + bw + 3, hy = by + 8;
      const sway = (opts.antBob || 0) * 0.4;
      c.fillStyle = handle;
      roundRectPath(c, hx - 1.4, hy, 2.8, 13, 1);
      c.fill(); c.lineWidth = 0.9; c.strokeStyle = outline; c.stroke();
      c.fillStyle = bead;
      c.beginPath(); c.arc(hx, hy, 1.8, 0, Math.PI * 2); c.fill();
      c.strokeStyle = outline; c.lineWidth = 0.7; c.stroke();
      // three beaded strands drooping from the tip
      c.strokeStyle = outline; c.lineWidth = 0.9;
      for (let i = -1; i <= 1; i++) {
        const tipX = hx + i * 6 + sway, tipY = hy + 24;
        c.beginPath();
        c.moveTo(hx, hy + 13);
        c.quadraticCurveTo(hx + i * 8, hy + 18, tipX, tipY);
        c.stroke();
        c.fillStyle = bead;
        for (let b = 1; b <= 3; b++) {
          const bt = b / 3;
          const px = hx + (tipX - hx) * bt, py = hy + 13 + (tipY - hy - 13) * bt;
          c.beginPath(); c.arc(px, py, 1.3, 0, Math.PI * 2); c.fill();
        }
      }
    } else if (weapon.type === 'ankh') {
      // Ra — tall golden ankh held upright (loop on top)
      const gold = weapon.color || '#ffd060';
      const accent = weapon.accent || '#a04008';
      const hx = bx + bw + 4, top = by - 6, bot = by + 34;
      const gGrd = c.createLinearGradient(hx - 3, 0, hx + 3, 0);
      gGrd.addColorStop(0, accent); gGrd.addColorStop(0.5, gold); gGrd.addColorStop(1, accent);
      c.fillStyle = gGrd;
      roundRectPath(c, hx - 1.6, top + 10, 3.2, bot - top - 10, 1.2);
      c.fill(); c.lineWidth = 1; c.strokeStyle = outline; c.stroke();
      // crossbar
      roundRectPath(c, hx - 7, top + 12, 14, 3.2, 1.2);
      c.fill(); c.stroke();
      // glow halo behind the loop
      const glow = c.createRadialGradient(hx, top + 5, 1, hx, top + 5, 10);
      glow.addColorStop(0, 'rgba(255,220,120,0.5)'); glow.addColorStop(1, 'rgba(255,220,120,0)');
      c.fillStyle = glow;
      c.beginPath(); c.arc(hx, top + 5, 10, 0, Math.PI * 2); c.fill();
      // loop (hollow, stroked)
      c.lineWidth = 3.4; c.strokeStyle = gGrd;
      c.beginPath(); c.ellipse(hx, top + 5, 5.5, 7, 0, 0, Math.PI * 2); c.stroke();
      c.lineWidth = 1; c.strokeStyle = outline; c.stroke();
      // sheen on the crossbar
      c.fillStyle = 'rgba(255,255,255,0.5)';
      c.fillRect(hx - 5, top + 12.5, 10, 1);
    } else if (weapon.type === 'macuahuitl') {
      // Quetzalcoatl — flat wooden club with obsidian blades along both edges
      const wood = weapon.color || '#a06010';
      const obsidian = weapon.accent || '#1a1028';
      const hx = bx + bw + 3, top = by - 4, len = 34;
      const wGrd = c.createLinearGradient(hx - 3, 0, hx + 3, 0);
      wGrd.addColorStop(0, '#5a3008'); wGrd.addColorStop(0.5, wood); wGrd.addColorStop(1, '#5a3008');
      c.fillStyle = wGrd;
      roundRectPath(c, hx - 3, top, 6, len, 2);
      c.fill(); c.lineWidth = 1; c.strokeStyle = outline; c.stroke();
      // obsidian blades studding both long edges
      c.fillStyle = obsidian;
      for (let i = 0; i < 5; i++) {
        const ey = top + 3 + i * 6.5;
        c.beginPath();
        c.moveTo(hx - 3, ey); c.lineTo(hx - 8, ey + 2.5); c.lineTo(hx - 3, ey + 5);
        c.closePath(); c.fill(); c.lineWidth = 0.8; c.strokeStyle = outline; c.stroke();
        c.beginPath();
        c.moveTo(hx + 3, ey); c.lineTo(hx + 8, ey + 2.5); c.lineTo(hx + 3, ey + 5);
        c.closePath(); c.fill(); c.stroke();
      }
      // glassy sheen on the blade edges
      c.strokeStyle = 'rgba(160,140,255,0.4)'; c.lineWidth = 0.5;
      c.beginPath();
      for (let i = 0; i < 5; i++) { const ey = top + 3 + i * 6.5; c.moveTo(hx - 7, ey + 1.5); c.lineTo(hx - 4, ey + 2.5); }
      c.stroke();
      // grip wrap at base
      c.fillStyle = 'rgba(0,0,0,0.4)';
      for (let i = 0; i < 3; i++) c.fillRect(hx - 2.5, top + len - 6 + i * 2, 5, 1);
    } else if (weapon.type === 'fireWhip') {
      // Pele — whip handle with curling lava whip trailing up/back, glowing
      const handle = weapon.color || '#3a0808';
      const lava = weapon.accent || '#ff4020';
      const hot = weapon.hot || '#fff070';
      const hx = bx + bw + 2, hy = by + 26;
      const flick = (opts.t || 0) * 3;
      c.fillStyle = handle;
      roundRectPath(c, hx - 1.4, hy, 2.8, 10, 1);
      c.fill(); c.lineWidth = 0.9; c.strokeStyle = outline; c.stroke();
      // handle glow
      const glow = c.createRadialGradient(hx, hy + 2, 0.5, hx, hy + 2, 6);
      glow.addColorStop(0, lava); glow.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = glow;
      c.beginPath(); c.arc(hx, hy + 2, 6, 0, Math.PI * 2); c.fill();
      // curling whip trailing up and back
      c.lineCap = 'round';
      c.strokeStyle = lava; c.lineWidth = 2.2;
      c.beginPath();
      c.moveTo(hx, hy);
      c.bezierCurveTo(hx + 6, hy - 14, hx - 10, hy - 20, hx - 2 + Math.sin(flick) * 2, hy - 32);
      c.stroke();
      c.strokeStyle = hot; c.lineWidth = 0.9;
      c.stroke();
      c.lineCap = 'butt';
      // glowing embers along the whip
      c.fillStyle = hot;
      for (const t2 of [0.25, 0.5, 0.75, 0.95]) {
        const ex = hx + Math.sin(t2 * 3 + flick) * 6 * (1 - t2);
        const ey = hy - t2 * 32;
        c.beginPath(); c.arc(ex, ey, 1.2 * (1 - t2 * 0.4), 0, Math.PI * 2); c.fill();
      }
    } else if (weapon.type === 'pomegranate') {
      // Persephone — slim wand topped by a pomegranate (split showing red seeds)
      const wand = weapon.color || '#3a1058';
      const rind = weapon.accent || '#a83050';
      const seed = weapon.seed || '#ff3060';
      const hx = bx + bw + 3, hy = by + 4;
      c.fillStyle = wand;
      roundRectPath(c, hx - 1, hy + 10, 2, 26, 1);
      c.fill(); c.lineWidth = 0.8; c.strokeStyle = outline; c.stroke();
      // pomegranate body
      c.fillStyle = rind;
      c.beginPath(); c.arc(hx, hy + 5, 6, Math.PI * 0.15, Math.PI * 1.85); c.closePath(); c.fill();
      c.lineWidth = 1; c.strokeStyle = outline; c.stroke();
      // crown tip
      c.beginPath();
      c.moveTo(hx - 2, hy - 1); c.lineTo(hx - 1, hy - 4); c.lineTo(hx, hy - 1);
      c.lineTo(hx + 1, hy - 4); c.lineTo(hx + 2, hy - 1);
      c.closePath(); c.fill();
      // split face with glistening seeds
      c.fillStyle = '#3a0810';
      c.beginPath(); c.moveTo(hx, hy - 1); c.lineTo(hx + 5, hy + 3); c.lineTo(hx, hy + 10); c.closePath(); c.fill();
      c.fillStyle = seed;
      for (const [sx, sy] of [[hx + 1, hy + 2], [hx + 2.5, hy + 4], [hx + 1.5, hy + 6], [hx + 3, hy + 7], [hx + 1, hy + 8.5]]) {
        c.beginPath(); c.arc(sx, sy, 0.9, 0, Math.PI * 2); c.fill();
      }
    } else if (weapon.type === 'ruyi') {
      // Wukong — Ruyi Jingu Bang: long red pole with gold banded ends, held diagonally
      const pole = weapon.color || '#a01818';
      const gold = weapon.accent || '#ffd060';
      const hx = bx + bw - 2, hy = by + 26;
      c.save();
      c.translate(hx, hy);
      c.rotate(-0.55);
      const pGrd = c.createLinearGradient(-2, 0, 2, 0);
      pGrd.addColorStop(0, '#5a0808'); pGrd.addColorStop(0.5, pole); pGrd.addColorStop(1, '#5a0808');
      c.fillStyle = pGrd;
      roundRectPath(c, -2.2, -34, 4.4, 68, 2);
      c.fill(); c.lineWidth = 1.1; c.strokeStyle = outline; c.stroke();
      // gold bands at both ends
      for (const y of [-32, 30]) {
        c.fillStyle = gold;
        c.fillRect(-2.6, y, 5.2, 3.5);
        c.lineWidth = 0.8; c.strokeStyle = outline; c.strokeRect(-2.6, y, 5.2, 3.5);
      }
      // engraved rings along the shaft
      c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 0.5;
      for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(-2.2, i * 12); c.lineTo(2.2, i * 12); c.stroke(); }
      // sheen
      c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 0.6;
      c.beginPath(); c.moveTo(-1, -30); c.lineTo(-1, 26); c.stroke();
      c.restore();
    } else if (weapon.type === 'rainJar') {
      // Tlaloc — clay jar tilted, pouring water droplets
      const clay = weapon.color || '#a0603a';
      const water = weapon.accent || '#80d8ff';
      const hx = bx + bw + 2, hy = by + 18;
      c.save();
      c.translate(hx, hy);
      c.rotate(0.5);
      const jGrd = c.createLinearGradient(-6, 0, 6, 0);
      jGrd.addColorStop(0, '#6a3a20'); jGrd.addColorStop(0.5, clay); jGrd.addColorStop(1, '#6a3a20');
      c.fillStyle = jGrd;
      c.beginPath();
      c.moveTo(-5, 10); c.quadraticCurveTo(-8, -2, -3, -8);
      c.lineTo(3, -8); c.quadraticCurveTo(8, -2, 5, 10);
      c.quadraticCurveTo(0, 13, -5, 10);
      c.closePath(); c.fill(); c.lineWidth = 1; c.strokeStyle = outline; c.stroke();
      // neck / spout
      c.fillStyle = clay;
      c.fillRect(-2.5, -12, 5, 5);
      c.strokeRect(-2.5, -12, 5, 5);
      // decorative band
      c.strokeStyle = water; c.lineWidth = 1;
      c.beginPath(); c.moveTo(-6, 0); c.lineTo(6, 0); c.stroke();
      c.restore();
      // pouring droplets (phase-animated)
      const phase = opts.t || 0;
      c.fillStyle = water;
      for (let i = 0; i < 3; i++) {
        const dt = (phase + i / 3) % 1;
        c.beginPath();
        c.arc(hx + 6 - dt * 3, hy + 8 + dt * 16, 1.4 - dt * 0.5, 0, Math.PI * 2);
        c.fill();
      }
    } else if (weapon.type === 'gada') {
      // Vishnu — golden mace: round ornate head on a straight handle
      const gold = weapon.color || '#ffd860';
      const accent = weapon.accent || '#1a3878';
      const hx = bx + bw + 3, hy = by + 4;
      c.fillStyle = weapon.handle || '#0a2860';
      roundRectPath(c, hx - 1.5, hy + 10, 3, 26, 1.2);
      c.fill(); c.lineWidth = 1; c.strokeStyle = outline; c.stroke();
      // ornate head — layered sphere
      const hGrd = c.createRadialGradient(hx - 2, hy + 1, 0.5, hx, hy + 3, 8);
      hGrd.addColorStop(0, '#fff8d0'); hGrd.addColorStop(0.5, gold); hGrd.addColorStop(1, accent);
      c.fillStyle = hGrd;
      c.beginPath(); c.arc(hx, hy + 3, 7.5, 0, Math.PI * 2); c.fill();
      c.lineWidth = 1.2; c.strokeStyle = outline; c.stroke();
      // studs ringing the head
      c.fillStyle = accent;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        c.beginPath(); c.arc(hx + Math.cos(a) * 6, hy + 3 + Math.sin(a) * 6, 1, 0, Math.PI * 2); c.fill();
      }
      // collar band
      c.fillStyle = accent;
      c.fillRect(hx - 3, hy + 9, 6, 2);
      c.lineWidth = 0.8; c.strokeStyle = outline; c.strokeRect(hx - 3, hy + 9, 6, 2);
    } else if (weapon.type === 'wasScepter') {
      // Set — was-scepter: straight shaft, forked bottom, angled animal-head top
      const shaft = weapon.color || '#ffd060';
      const accent = weapon.accent || '#a04018';
      const hx = bx + bw + 3, top = by - 10, bot = by + 34;
      c.fillStyle = shaft;
      roundRectPath(c, hx - 1.6, top + 10, 3.2, bot - top - 10, 1);
      c.fill(); c.lineWidth = 1; c.strokeStyle = outline; c.stroke();
      // forked base (two splayed prongs)
      c.strokeStyle = shaft; c.lineWidth = 2.4; c.lineCap = 'round';
      c.beginPath();
      c.moveTo(hx, bot - 2); c.lineTo(hx - 4, bot + 6);
      c.moveTo(hx, bot - 2); c.lineTo(hx + 4, bot + 6);
      c.stroke();
      c.strokeStyle = outline; c.lineWidth = 0.8; c.stroke();
      c.lineCap = 'butt';
      // angled animal-head finial (Set-beast snout)
      c.fillStyle = accent;
      c.beginPath();
      c.moveTo(hx - 3, top + 10); c.lineTo(hx - 3, top + 2);
      c.quadraticCurveTo(hx - 2, top - 6, hx + 6, top - 5);
      c.lineTo(hx + 5, top);
      c.quadraticCurveTo(hx + 1, top - 1, hx + 2, top + 8);
      c.closePath();
      c.fill(); c.lineWidth = 1; c.strokeStyle = outline; c.stroke();
      // ear
      c.beginPath(); c.moveTo(hx - 1, top - 5); c.lineTo(hx, top - 10); c.lineTo(hx + 1.5, top - 4); c.closePath();
      c.fill(); c.stroke();
    } else if (weapon.type === 'starWand') {
      // Nut — wand with crescent moon + small star at top
      const wand = weapon.color || '#1a2870';
      const gold = weapon.accent || '#ffd860';
      const hx = bx + bw + 3, hy = by + 6;
      c.fillStyle = wand;
      roundRectPath(c, hx - 1, hy + 10, 2, 26, 1);
      c.fill(); c.lineWidth = 0.8; c.strokeStyle = outline; c.stroke();
      // glow behind the moon
      const glow = c.createRadialGradient(hx, hy, 0.5, hx, hy, 9);
      glow.addColorStop(0, 'rgba(255,240,190,0.5)'); glow.addColorStop(1, 'rgba(255,240,190,0)');
      c.fillStyle = glow;
      c.beginPath(); c.arc(hx, hy, 9, 0, Math.PI * 2); c.fill();
      // crescent moon (lune via two opposed arcs)
      c.fillStyle = gold;
      c.beginPath();
      c.arc(hx, hy, 5.5, Math.PI * 0.5, Math.PI * 1.5, false);
      c.arc(hx + 2.6, hy, 4.6, Math.PI * 1.5, Math.PI * 0.5, true);
      c.closePath();
      c.fill();
      c.lineWidth = 0.8; c.strokeStyle = outline; c.stroke();
      // small star beside the moon
      c.fillStyle = '#fff';
      c.beginPath();
      for (let i = 0; i < 8; i++) {
        const r = i % 2 ? 0.9 : 2.2, a = -Math.PI / 2 + i * Math.PI / 4;
        c.lineTo(hx - 6 + Math.cos(a) * r, hy + 8 + Math.sin(a) * r);
      }
      c.closePath(); c.fill();
      c.lineWidth = 0.6; c.strokeStyle = outline; c.stroke();
    } else if (weapon.type === 'marru') {
      // Marduk — marru: triangular spade on a long shaft
      const shaft = weapon.handle || '#2a0408';
      const blade = weapon.color || '#ffd060';
      const accent = weapon.accent || '#a01818';
      const hx = bx + bw + 3, top = by - 16;
      c.fillStyle = shaft;
      roundRectPath(c, hx - 1.4, top + 14, 2.8, 40, 1);
      c.fill(); c.lineWidth = 1; c.strokeStyle = outline; c.stroke();
      // flat triangular spade head
      const bGrd = c.createLinearGradient(hx - 7, 0, hx + 7, 0);
      bGrd.addColorStop(0, accent); bGrd.addColorStop(0.5, blade); bGrd.addColorStop(1, accent);
      c.fillStyle = bGrd;
      c.beginPath();
      c.moveTo(hx, top);
      c.lineTo(hx + 7, top + 16);
      c.lineTo(hx - 7, top + 16);
      c.closePath();
      c.fill(); c.lineWidth = 1.1; c.strokeStyle = outline; c.stroke();
      // central rib
      c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 0.6;
      c.beginPath(); c.moveTo(hx, top + 2); c.lineTo(hx, top + 15); c.stroke();
      // socket collar
      c.fillStyle = accent;
      c.fillRect(hx - 2.5, top + 13, 5, 3);
      c.lineWidth = 0.8; c.strokeStyle = outline; c.strokeRect(hx - 2.5, top + 13, 5, 3);
    } else if (weapon.type === 'tongs') {
      // Brigid — blacksmith tongs gripping a glowing orange ingot
      const iron = weapon.color || '#9aa4b0';
      const ingotCol = weapon.accent || '#ffb050';
      const hx = bx + bw + 4, hy = by + 16;
      // two curved jaw arms crossing at a pivot rivet — outline under, metal over
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(hx - 6, hy + 22); c.quadraticCurveTo(hx - 2, hy + 6, hx + 3, hy - 4);
      c.moveTo(hx + 6, hy + 22); c.quadraticCurveTo(hx + 2, hy + 6, hx - 3, hy - 4);
      c.strokeStyle = outline; c.lineWidth = 4; c.stroke();
      c.strokeStyle = iron; c.lineWidth = 2.2; c.stroke();
      c.lineCap = 'butt';
      // pivot rivet
      c.fillStyle = '#8a98a8';
      c.beginPath(); c.arc(hx, hy + 7, 1.8, 0, Math.PI * 2); c.fill();
      c.lineWidth = 0.7; c.strokeStyle = outline; c.stroke();
      // glowing ingot gripped between the jaw tips
      const glow = c.createRadialGradient(hx, hy - 5, 0.5, hx, hy - 5, 7);
      glow.addColorStop(0, ingotCol); glow.addColorStop(1, 'rgba(255,150,60,0)');
      c.fillStyle = glow;
      c.beginPath(); c.arc(hx, hy - 5, 7, 0, Math.PI * 2); c.fill();
      c.fillStyle = ingotCol;
      roundRectPath(c, hx - 4.5, hy - 9, 9, 5, 1.2);
      c.fill(); c.lineWidth = 0.9; c.strokeStyle = outline; c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.6)';
      c.fillRect(hx - 2.5, hy - 7, 5, 1);
    } else if (weapon.type === 'harpoon') {
      // Sedna — bone/ivory harpoon with barbed head and coiled line
      const bone = weapon.color || '#f0e8d8';
      const accent = weapon.accent || '#7df';
      const hx = bx + bw + 3, top = by - 14;
      const bGrd = c.createLinearGradient(hx - 2, 0, hx + 2, 0);
      bGrd.addColorStop(0, '#c8b898'); bGrd.addColorStop(0.5, bone); bGrd.addColorStop(1, '#c8b898');
      c.fillStyle = bGrd;
      roundRectPath(c, hx - 1.4, top + 10, 2.8, 46, 1);
      c.fill(); c.lineWidth = 1; c.strokeStyle = outline; c.stroke();
      // barbed head
      c.fillStyle = bone;
      c.beginPath();
      c.moveTo(hx, top); c.lineTo(hx + 3, top + 9); c.lineTo(hx - 3, top + 9);
      c.closePath(); c.fill(); c.lineWidth = 1; c.strokeStyle = outline; c.stroke();
      c.beginPath(); c.moveTo(hx - 3, top + 6); c.lineTo(hx - 6, top + 9); c.lineTo(hx - 2, top + 10); c.closePath();
      c.fill(); c.stroke();
      c.beginPath(); c.moveTo(hx + 3, top + 6); c.lineTo(hx + 6, top + 9); c.lineTo(hx + 2, top + 10); c.closePath();
      c.fill(); c.stroke();
      // coiled line near the grip
      c.strokeStyle = accent; c.lineWidth = 1;
      c.beginPath();
      for (let i = 0; i < 3; i++) c.arc(hx, top + 40 - i * 2, 4 - i * 0.6, 0, Math.PI * 1.6);
      c.stroke();
    } else if (weapon.type === 'flamberge') {
      // Ember — wavy-edged flame blade sword, orange-hot edge
      const blade = weapon.blade || '#ffe080';
      const hot = weapon.accent || '#ff5028';
      const grip = weapon.grip || '#3a1208';
      const hx = bx + bw + 3, hy = by + 2;
      const bGrd = c.createLinearGradient(hx - 3, 0, hx + 3, 0);
      bGrd.addColorStop(0, hot); bGrd.addColorStop(0.5, blade); bGrd.addColorStop(1, hot);
      c.fillStyle = bGrd;
      c.beginPath();
      c.moveTo(hx, hy);
      c.quadraticCurveTo(hx + 3.5, hy + 4, hx + 1.5, hy + 8);
      c.quadraticCurveTo(hx + 4, hy + 12, hx + 1.5, hy + 16);
      c.quadraticCurveTo(hx + 4, hy + 20, hx + 1.5, hy + 24);
      c.lineTo(hx, hy + 27);
      c.quadraticCurveTo(hx - 3, hy + 22, hx - 1.5, hy + 16);
      c.quadraticCurveTo(hx - 3.5, hy + 10, hx - 1.5, hy + 6);
      c.closePath();
      c.fill();
      c.strokeStyle = outline; c.lineWidth = 1; c.stroke();
      c.strokeStyle = 'rgba(255,255,220,0.7)'; c.lineWidth = 0.6;
      c.beginPath(); c.moveTo(hx, hy + 3); c.lineTo(hx, hy + 24); c.stroke();
      c.fillStyle = grip;
      roundRectPath(c, hx - 5, hy + 27, 10, 3, 1.2);
      c.fill(); c.strokeStyle = outline; c.lineWidth = 0.9; c.stroke();
      c.fillStyle = grip;
      c.fillRect(hx - 1.2, hy + 30, 2.4, 6);
      c.strokeRect(hx - 1.2, hy + 30, 2.4, 6);
      const pGrd = c.createRadialGradient(hx, hy + 37, 0.3, hx, hy + 37, 2);
      pGrd.addColorStop(0, '#fff'); pGrd.addColorStop(1, hot);
      c.fillStyle = pGrd;
      c.beginPath(); c.arc(hx, hy + 37, 1.8, 0, Math.PI * 2); c.fill();
      c.strokeStyle = outline; c.lineWidth = 0.8; c.stroke();
    } else if (weapon.type === 'thunderbolt') {
      // Zeus — handheld zigzag lightning bolt (keraunos), glowing
      const bolt = weapon.bolt || '#fff8a0';
      const accent = weapon.accent || '#ffd860';
      const hx = bx + bw + 3, hy = by + 20;
      const glowR = 12 + (opts.t || 0) * 3;
      const glow = c.createRadialGradient(hx, hy, 1, hx, hy, glowR);
      glow.addColorStop(0, 'rgba(255,248,160,0.55)');
      glow.addColorStop(1, 'rgba(255,248,160,0)');
      c.fillStyle = glow;
      c.beginPath(); c.arc(hx, hy, glowR, 0, Math.PI * 2); c.fill();
      const bGrd = c.createLinearGradient(hx, hy - 20, hx, hy + 20);
      bGrd.addColorStop(0, '#fff'); bGrd.addColorStop(0.5, bolt); bGrd.addColorStop(1, accent);
      c.fillStyle = bGrd;
      c.beginPath();
      c.moveTo(hx + 1, hy - 20);
      c.lineTo(hx - 4, hy - 6);
      c.lineTo(hx + 1, hy - 4);
      c.lineTo(hx - 5, hy + 6);
      c.lineTo(hx + 2, hy + 4);
      c.lineTo(hx - 1, hy + 20);
      c.lineTo(hx + 6, hy + 4);
      c.lineTo(hx, hy + 2);
      c.lineTo(hx + 7, hy - 6);
      c.lineTo(hx + 1, hy - 4);
      c.closePath();
      c.fill();
      c.lineJoin = 'round'; c.strokeStyle = outline; c.lineWidth = 1; c.stroke();
      c.lineJoin = 'miter';
      c.fillStyle = accent;
      c.beginPath(); c.moveTo(hx + 1, hy - 20); c.lineTo(hx - 2, hy - 15); c.lineTo(hx + 3, hy - 15); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(hx - 1, hy + 20); c.lineTo(hx - 5, hy + 15); c.lineTo(hx, hy + 15); c.closePath(); c.fill();
    } else if (weapon.type === 'aegis') {
      // Athena — round shield held at front, gorgon/owl emblem, rim studs
      const shield = weapon.shield || '#dde4ec';
      const rim = weapon.rim || '#ffd060';
      const emblem = weapon.emblem || '#3a4a78';
      const hx = bx + bw, hy = by + 24, r = 13;
      const sGrd = c.createRadialGradient(hx - 4, hy - 4, 1, hx, hy, r);
      sGrd.addColorStop(0, '#fff'); sGrd.addColorStop(0.55, shield); sGrd.addColorStop(1, '#8a96a8');
      c.fillStyle = sGrd;
      c.beginPath(); c.arc(hx, hy, r, 0, Math.PI * 2); c.fill();
      c.strokeStyle = outline; c.lineWidth = 1.3; c.stroke();
      c.strokeStyle = rim; c.lineWidth = 2; c.stroke();
      c.fillStyle = rim;
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2;
        c.beginPath(); c.arc(hx + Math.cos(a) * (r - 2), hy + Math.sin(a) * (r - 2), 1, 0, Math.PI * 2); c.fill();
      }
      c.fillStyle = emblem;
      c.beginPath(); c.arc(hx, hy, 5.5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(hx - 5, hy - 3); c.lineTo(hx - 7, hy - 8); c.lineTo(hx - 2, hy - 5); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(hx + 5, hy - 3); c.lineTo(hx + 7, hy - 8); c.lineTo(hx + 2, hy - 5); c.closePath(); c.fill();
      c.fillStyle = rim;
      c.beginPath(); c.arc(hx - 2, hy - 0.5, 1.4, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(hx + 2, hy - 0.5, 1.4, 0, Math.PI * 2); c.fill();
      c.fillStyle = outline;
      c.beginPath(); c.arc(hx - 2, hy - 0.5, 0.6, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(hx + 2, hy - 0.5, 0.6, 0, Math.PI * 2); c.fill();
    } else if (weapon.type === 'katana') {
      // Susanoo — slightly curved katana, round tsuba, wrapped grip
      const blade = weapon.blade || '#fff';
      const accent = weapon.accent || '#a0d0ff';
      const grip = weapon.grip || '#1a2848';
      const hx = bx + bw + 3, hy = by + 2;
      const bGrd = c.createLinearGradient(hx - 2, 0, hx + 2, 0);
      bGrd.addColorStop(0, '#8a98a8'); bGrd.addColorStop(0.5, blade); bGrd.addColorStop(1, '#fff');
      c.fillStyle = bGrd;
      c.beginPath();
      c.moveTo(hx + 1, hy);
      c.quadraticCurveTo(hx + 5, hy + 12, hx + 2, hy + 24);
      c.lineTo(hx - 0.6, hy + 23.5);
      c.quadraticCurveTo(hx + 2.2, hy + 12, hx - 0.5, hy + 1);
      c.closePath();
      c.fill();
      c.strokeStyle = outline; c.lineWidth = 0.9; c.stroke();
      c.strokeStyle = accent; c.lineWidth = 0.6;
      c.beginPath(); c.moveTo(hx + 1.6, hy + 3); c.quadraticCurveTo(hx + 4.2, hy + 12, hx + 1.6, hy + 22); c.stroke();
      c.fillStyle = grip;
      c.beginPath(); c.arc(hx, hy + 25.5, 2.6, 0, Math.PI * 2); c.fill();
      c.strokeStyle = accent; c.lineWidth = 0.8; c.stroke();
      c.fillStyle = grip;
      c.fillRect(hx - 1.3, hy + 28, 2.6, 8);
      c.strokeStyle = outline; c.lineWidth = 0.7; c.strokeRect(hx - 1.3, hy + 28, 2.6, 8);
      c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 0.5;
      c.beginPath();
      for (let i = 0; i < 3; i++) {
        c.moveTo(hx - 1.3, hy + 29 + i * 2.4); c.lineTo(hx + 1.3, hy + 30.2 + i * 2.4);
        c.moveTo(hx + 1.3, hy + 29 + i * 2.4); c.lineTo(hx - 1.3, hy + 30.2 + i * 2.4);
      }
      c.stroke();
    } else if (weapon.type === 'suzu') {
      // Amaterasu — kagura suzu bells, tiered cluster, trailing ribbons
      const bell = weapon.bell || '#ffd060';
      const ribbon = weapon.ribbon || '#c83030';
      const hx = bx + bw + 3, hy = by + 10;
      c.fillStyle = weapon.handle || '#5a3008';
      roundRectPath(c, hx - 1.2, hy + 14, 2.4, 20, 1);
      c.fill(); c.lineWidth = 0.8; c.strokeStyle = outline; c.stroke();
      const rows = [[hy + 12, [-5, 0, 5]], [hy + 6, [-2.5, 2.5]], [hy, [0]]];
      for (const [ry, xs] of rows) {
        for (const dx of xs) {
          const bx2 = hx + dx, by2 = ry;
          const bg = c.createRadialGradient(bx2 - 1, by2 - 1, 0.3, bx2, by2, 3);
          bg.addColorStop(0, '#fff8d0'); bg.addColorStop(1, bell);
          c.fillStyle = bg;
          c.beginPath(); c.arc(bx2, by2, 2.6, 0, Math.PI * 2); c.fill();
          c.strokeStyle = outline; c.lineWidth = 0.7; c.stroke();
          c.beginPath(); c.moveTo(bx2 - 1.6, by2 + 1); c.lineTo(bx2 + 1.6, by2 + 1); c.stroke();
        }
      }
      c.strokeStyle = ribbon; c.lineWidth = 1.4; c.lineCap = 'round';
      const sway = (opts.antBob || 0) * 0.4;
      c.beginPath();
      c.moveTo(hx - 1, hy + 14); c.quadraticCurveTo(hx - 5 + sway, hy + 20, hx - 3 + sway, hy + 28);
      c.moveTo(hx + 1, hy + 14); c.quadraticCurveTo(hx + 5 + sway, hy + 20, hx + 3 + sway, hy + 28);
      c.stroke();
      c.lineCap = 'butt';
    } else if (weapon.type === 'sling') {
      // Lugh — sling cords with stone cradled in swinging pouch
      const cord = weapon.cord || '#1a5828';
      const pouch = weapon.pouch || '#a07020';
      const stone = weapon.stone || '#7a7a7a';
      const hx = bx + bw + 2, hy = by + 20;
      const swing = (opts.antBob || 0) * 0.5;
      const px = hx + 6 + swing, py = hy + 20;
      // whirl arc — sling mid-swing
      c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 1; c.setLineDash([2, 2]);
      c.beginPath(); c.arc(hx + 3, hy + 10, 12, -0.9, 1.6); c.stroke();
      c.setLineDash([]);
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(hx, hy); c.lineTo(px - 2.5, py - 2);
      c.moveTo(hx, hy); c.lineTo(px + 2.5, py - 2);
      c.strokeStyle = outline; c.lineWidth = 2.6; c.stroke();
      c.strokeStyle = cord; c.lineWidth = 1.4; c.stroke();
      c.lineCap = 'butt';
      c.fillStyle = pouch;
      c.beginPath();
      c.moveTo(px - 3, py - 2); c.quadraticCurveTo(px, py + 1, px + 3, py - 2);
      c.lineTo(px, py + 3);
      c.closePath();
      c.fill(); c.lineWidth = 0.7; c.strokeStyle = outline; c.stroke();
      const sg = c.createRadialGradient(px - 1, py - 1, 0.3, px, py, 3);
      sg.addColorStop(0, '#e0e0e0'); sg.addColorStop(1, stone);
      c.fillStyle = sg;
      c.beginPath(); c.arc(px, py, 3.4, 0, Math.PI * 2); c.fill();
      c.strokeStyle = outline; c.lineWidth = 1; c.stroke();
      c.fillStyle = cord;
      c.beginPath(); c.arc(hx, hy, 1.6, 0, Math.PI * 2); c.fill();
    } else if (weapon.type === 'ringRod') {
      // Ishtar — Mesopotamian rod-and-ring, symbol of kingship
      const rod = weapon.rod || '#ffd060';
      const ring = weapon.ring || '#1a3878';
      const hx = bx + bw + 3, top = by + 2;
      const rGrd = c.createLinearGradient(hx - 1.4, 0, hx + 1.4, 0);
      rGrd.addColorStop(0, '#a06010'); rGrd.addColorStop(0.5, rod); rGrd.addColorStop(1, '#a06010');
      c.fillStyle = rGrd;
      roundRectPath(c, hx - 1.4, top + 6, 2.8, 32, 1);
      c.fill(); c.lineWidth = 0.9; c.strokeStyle = outline; c.stroke();
      c.fillStyle = ring;
      for (let i = 0; i < 4; i++) c.fillRect(hx - 2, top + 10 + i * 6, 4, 1.4);
      c.strokeStyle = ring; c.lineWidth = 3;
      c.beginPath(); c.arc(hx, top, 6.5, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = rod; c.lineWidth = 1.4;
      c.beginPath(); c.arc(hx, top, 6.5, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = outline; c.lineWidth = 1;
      c.beginPath(); c.moveTo(hx - 6.5, top); c.lineTo(hx + 6.5, top); c.stroke();
      c.fillStyle = '#fff8e0';
      c.beginPath(); c.arc(hx, top, 1.6, 0, Math.PI * 2); c.fill();
      c.strokeStyle = outline; c.lineWidth = 0.7; c.stroke();
      c.fillStyle = ring;
      c.beginPath(); c.arc(hx, top + 38, 1.5, 0, Math.PI * 2); c.fill();
    } else if (weapon.type === 'distaff') {
      // Freyja — seiðr distaff staff wrapped with wool, ornate knob
      const wood = weapon.wood || '#a06820';
      const wool = weapon.wool || '#fff8e0';
      const accent = weapon.accent || '#ffd060';
      const hx = bx + bw + 3, hy = by + 4;
      const sGrd = c.createLinearGradient(hx - 1.4, 0, hx + 1.4, 0);
      sGrd.addColorStop(0, wood); sGrd.addColorStop(0.5, '#c88838'); sGrd.addColorStop(1, wood);
      c.fillStyle = sGrd;
      roundRectPath(c, hx - 1.4, hy + 14, 2.8, 26, 1);
      c.fill(); c.lineWidth = 0.9; c.strokeStyle = outline; c.stroke();
      c.fillStyle = wool;
      for (const [dx, dy, r] of [[-3, 4, 4], [3, 4, 4.2], [0, 0, 4.5], [-2.5, -3, 3.4], [2.5, -3, 3.4]]) {
        c.beginPath(); c.arc(hx + dx, hy + 8 + dy, r, 0, Math.PI * 2); c.fill();
      }
      c.strokeStyle = outline; c.lineWidth = 0.8;
      for (const [dx, dy, r] of [[-3, 4, 4], [3, 4, 4.2], [0, 0, 4.5], [-2.5, -3, 3.4], [2.5, -3, 3.4]]) {
        c.beginPath(); c.arc(hx + dx, hy + 8 + dy, r, 0, Math.PI * 2); c.stroke();
      }
      c.fillStyle = accent;
      c.fillRect(hx - 4, hy + 12, 8, 1.6);
      c.strokeStyle = outline; c.lineWidth = 0.6; c.strokeRect(hx - 4, hy + 12, 8, 1.6);
      c.fillStyle = accent;
      c.beginPath(); c.arc(hx, hy - 5, 2, 0, Math.PI * 2); c.fill();
      c.strokeStyle = outline; c.lineWidth = 0.8; c.stroke();
    } else if (weapon.type === 'caduceus') {
      // Hermes — winged staff with two entwined snakes
      const rod = weapon.rod || '#3a6a90';
      const snake = weapon.snake || '#80e0ff';
      const wing = weapon.wing || '#dde8f0';
      const hx = bx + bw + 3, top = by - 4, bot = by + 32;
      c.fillStyle = rod;
      roundRectPath(c, hx - 1.2, top + 6, 2.4, bot - top - 6, 1);
      c.fill(); c.lineWidth = 0.9; c.strokeStyle = outline; c.stroke();
      c.strokeStyle = snake; c.lineWidth = 1.6; c.lineCap = 'round';
      for (const ph of [0, Math.PI]) {
        c.beginPath();
        for (let i = 0; i <= 10; i++) {
          const t = i / 10, y = top + 6 + t * (bot - top - 10);
          const x = hx + Math.sin(t * Math.PI * 3 + ph) * 4;
          i ? c.lineTo(x, y) : c.moveTo(x, y);
        }
        c.stroke();
      }
      c.lineCap = 'butt';
      c.fillStyle = snake;
      c.beginPath(); c.arc(hx - 3, top + 5, 1.6, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(hx + 3, top + 5, 1.6, 0, Math.PI * 2); c.fill();
      c.strokeStyle = outline; c.lineWidth = 0.6; c.stroke();
      c.fillStyle = wing;
      c.beginPath();
      c.moveTo(hx, top + 2); c.quadraticCurveTo(hx - 10, top - 3, hx - 6, top + 6);
      c.quadraticCurveTo(hx - 2, top + 4, hx, top + 2);
      c.closePath(); c.fill();
      c.beginPath();
      c.moveTo(hx, top + 2); c.quadraticCurveTo(hx + 10, top - 3, hx + 6, top + 6);
      c.quadraticCurveTo(hx + 2, top + 4, hx, top + 2);
      c.closePath(); c.fill();
      c.strokeStyle = outline; c.lineWidth = 0.7; c.stroke();
    } else if (weapon.type === 'khadga') {
      // Kali — heavy curved sword with broad hooked tip
      const blade = weapon.blade || '#dde8f0';
      const accent = weapon.accent || '#ff3060';
      const handle = weapon.handle || '#1a0828';
      const hx = bx + bw + 3, hy = by + 8;
      const bGrd = c.createLinearGradient(hx - 4, 0, hx + 6, 0);
      bGrd.addColorStop(0, '#7a8898'); bGrd.addColorStop(0.5, blade); bGrd.addColorStop(1, '#fff');
      c.fillStyle = bGrd;
      c.beginPath();
      c.moveTo(hx - 1, hy);
      c.quadraticCurveTo(hx + 6, hy + 6, hx + 10, hy + 16);
      c.quadraticCurveTo(hx + 12, hy + 21, hx + 6, hy + 22);
      c.quadraticCurveTo(hx + 8, hy + 17, hx + 4, hy + 12);
      c.quadraticCurveTo(hx, hy + 8, hx - 2.2, hy + 4);
      c.closePath();
      c.fill();
      c.strokeStyle = outline; c.lineWidth = 1; c.stroke();
      c.strokeStyle = accent; c.lineWidth = 0.9;
      c.beginPath(); c.moveTo(hx - 1, hy + 1); c.quadraticCurveTo(hx + 5, hy + 7, hx + 8, hy + 15); c.stroke();
      c.fillStyle = handle;
      roundRectPath(c, hx - 5, hy + 3, 6, 2.6, 1);
      c.fill(); c.lineWidth = 0.8; c.strokeStyle = outline; c.stroke();
      c.fillStyle = handle;
      c.fillRect(hx - 4, hy + 6, 2.4, 8);
      c.strokeRect(hx - 4, hy + 6, 2.4, 8);
      c.fillStyle = accent;
      c.beginPath(); c.arc(hx - 2.8, hy + 15.5, 1.8, 0, Math.PI * 2); c.fill();
      c.strokeStyle = outline; c.lineWidth = 0.7; c.stroke();
    } else if (weapon.type === 'sistrum') {
      // Bastet — Egyptian sistrum rattle, loop frame, jingle discs
      const frame = weapon.frame || '#ffd060';
      const rod = weapon.rod || '#dde8f0';
      const hx = bx + bw + 3, hy = by + 6;
      c.fillStyle = weapon.handle || '#3a2818';
      roundRectPath(c, hx - 1.3, hy + 20, 2.6, 10, 1);
      c.fill(); c.lineWidth = 0.8; c.strokeStyle = outline; c.stroke();
      c.strokeStyle = frame; c.lineWidth = 2.2;
      c.beginPath();
      c.moveTo(hx - 1.5, hy + 20);
      c.quadraticCurveTo(hx - 9, hy + 16, hx - 8, hy + 6);
      c.quadraticCurveTo(hx - 7, hy - 6, hx, hy - 8);
      c.quadraticCurveTo(hx + 7, hy - 6, hx + 8, hy + 6);
      c.quadraticCurveTo(hx + 9, hy + 16, hx + 1.5, hy + 20);
      c.stroke();
      c.strokeStyle = outline; c.lineWidth = 0.7; c.stroke();
      c.strokeStyle = rod; c.lineWidth = 1.1;
      for (let i = 0; i < 3; i++) {
        const ry = hy - 3 + i * 5;
        const rw = 7 - i * 0.6;
        c.beginPath(); c.moveTo(hx - rw, ry); c.lineTo(hx + rw, ry); c.stroke();
        c.fillStyle = rod;
        c.beginPath(); c.arc(hx - rw, ry, 1, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(hx + rw, ry, 1, 0, Math.PI * 2); c.fill();
      }
      c.fillStyle = frame;
      c.beginPath(); c.arc(hx, hy - 8, 2, 0, Math.PI * 2); c.fill();
      c.strokeStyle = outline; c.lineWidth = 0.6; c.stroke();
    } else if (weapon.type === 'fan') {
      // Inari — open folding fan, red/white pleated pattern
      const paper = weapon.paper || '#fff';
      const pattern = weapon.pattern || '#c01828';
      const rib = weapon.rib || '#a04018';
      const hx = bx + bw + 1, hy = by + 26, r = 14;
      c.save();
      c.translate(hx, hy);
      c.rotate(-0.35);
      const segs = 7, spread = Math.PI * 0.55;
      for (let i = 0; i < segs; i++) {
        const a0 = -Math.PI / 2 - spread / 2 + (i / segs) * spread;
        const a1 = -Math.PI / 2 - spread / 2 + ((i + 1) / segs) * spread;
        c.fillStyle = i % 2 ? pattern : paper;
        c.beginPath();
        c.moveTo(0, 0);
        c.arc(0, 0, r, a0, a1);
        c.closePath();
        c.fill();
        c.strokeStyle = rib; c.lineWidth = 0.5; c.stroke();
      }
      c.strokeStyle = outline; c.lineWidth = 1;
      c.beginPath(); c.arc(0, 0, r, -Math.PI / 2 - spread / 2, -Math.PI / 2 + spread / 2); c.stroke();
      c.fillStyle = rib;
      c.beginPath(); c.arc(0, 0, 1.6, 0, Math.PI * 2); c.fill();
      c.strokeStyle = outline; c.lineWidth = 0.6; c.stroke();
      c.restore();
      c.fillStyle = rib;
      c.fillRect(hx - 1, hy + 1, 2, 6);
      c.strokeStyle = outline; c.lineWidth = 0.6; c.strokeRect(hx - 1, hy + 1, 2, 6);
    } else if (weapon.type === 'drum') {
      // Anansi — talking drum (hourglass) with strings, curved stick
      const wood = weapon.body || '#5a3818';
      const skin = weapon.skin || '#e8c890';
      const string = weapon.string || '#1a0a04';
      const hx = bx + bw + 2, top = by + 6, bot = by + 34;
      const dGrd = c.createLinearGradient(hx - 6, 0, hx + 6, 0);
      dGrd.addColorStop(0, '#3a2410'); dGrd.addColorStop(0.5, wood); dGrd.addColorStop(1, '#3a2410');
      c.fillStyle = dGrd;
      c.beginPath();
      c.moveTo(hx - 6, top); c.quadraticCurveTo(hx - 2, (top + bot) / 2, hx - 6, bot);
      c.lineTo(hx + 6, bot); c.quadraticCurveTo(hx + 2, (top + bot) / 2, hx + 6, top);
      c.closePath();
      c.fill(); c.lineWidth = 1; c.strokeStyle = outline; c.stroke();
      c.fillStyle = skin;
      c.beginPath(); c.ellipse(hx, top, 6, 2.2, 0, 0, Math.PI * 2); c.fill(); c.stroke();
      c.beginPath(); c.ellipse(hx, bot, 6, 2.2, 0, 0, Math.PI * 2); c.fill(); c.stroke();
      c.strokeStyle = string; c.lineWidth = 0.8;
      for (let i = 0; i < 5; i++) {
        const t = i / 4;
        c.beginPath();
        c.moveTo(hx - 5.6 + t * 11.2, top + 1.5);
        c.lineTo(hx - 5.6 + (1 - t) * 11.2, bot - 1.5);
        c.stroke();
      }
      c.strokeStyle = weapon.stick || '#3a1c08'; c.lineWidth = 1.8; c.lineCap = 'round';
      c.beginPath(); c.moveTo(hx + 8, bot - 2); c.quadraticCurveTo(hx + 15, bot - 14, hx + 10, bot - 22); c.stroke();
      c.lineCap = 'butt';
    } else if (weapon.type === 'smokeMirror') {
      // Tezcatlipoca — obsidian mirror disc with curling smoke wisps
      const disc = weapon.disc || '#1a2030';
      const rim = weapon.rim || '#80c8e0';
      const smoke = weapon.smoke || '#8890a0';
      const hx = bx + bw - 1, hy = by + 22, r = 9;
      const dGrd = c.createRadialGradient(hx - 3, hy - 3, 0.5, hx, hy, r);
      dGrd.addColorStop(0, '#5868a0'); dGrd.addColorStop(0.5, disc); dGrd.addColorStop(1, '#000');
      c.fillStyle = dGrd;
      c.beginPath(); c.arc(hx, hy, r, 0, Math.PI * 2); c.fill();
      c.strokeStyle = rim; c.lineWidth = 1.3; c.stroke();
      c.strokeStyle = outline; c.lineWidth = 0.7; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1.2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(hx - 4, hy - 5); c.quadraticCurveTo(hx - 2, hy - 2, hx - 4, hy + 3); c.stroke();
      c.lineCap = 'butt';
      c.fillStyle = weapon.handle || '#080000';
      c.fillRect(hx - 1.2, hy + r, 2.4, 6);
      c.strokeStyle = outline; c.lineWidth = 0.7; c.strokeRect(hx - 1.2, hy + r, 2.4, 6);
      const t = opts.t || 0;
      c.strokeStyle = smoke; c.lineWidth = 1; c.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const ph = t * 4 + i * 2;
        const sx = hx - 4 + i * 4;
        c.beginPath();
        c.moveTo(sx, hy - r);
        c.quadraticCurveTo(sx + Math.sin(ph) * 3, hy - r - 6, sx - Math.sin(ph * 1.3) * 2, hy - r - 12);
        c.stroke();
      }
      c.lineCap = 'butt';
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
          feet: [
            Math.sin(phase * Math.PI * 2) * 3.5, -Math.max(0,  Math.cos(phase * Math.PI * 2)) * 3,
            -Math.sin(phase * Math.PI * 2) * 3.5, -Math.max(0, -Math.cos(phase * Math.PI * 2)) * 3,
          ],
        });
      }),
      jump: renderSprite(skin, {
        t: 1, mouth: 'open', eyeOff: -1, antBob: -4, capeWave: -6,
        squash: 0.9, stretch: 1.18, dead: false, blink: false,
        motion: 0.8, feet: [-2, -3, 3, -4],
      }),
      fall: renderSprite(skin, {
        t: 0.6, mouth: 'flat', eyeOff: 2, antBob: 3, capeWave: 5,
        squash: 1.05, stretch: 0.95, dead: false, blink: false,
        motion: 0.5, feet: [-1, 2, 1, 1],
      }),
      dead: renderSprite(skin, {
        t: 0.2, mouth: 'up', eyeOff: 0, antBob: 0, capeWave: 0,
        squash: 1, stretch: 1, dead: true, blink: false,
      }),
    };
  }

  W.PlayerSprite = {
    SPR_W, SPR_H, SPR_OFFX, SPR_OFFY,
    roundRectPath,
    build,
  };
})();
