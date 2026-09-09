// All non-world drawing — HUD, start screen, game over, stage banner, helpers.
// Single shared module. main game wires via UI.init(ctx, ref, hits).
//   - ref: getters for live game state (W, H, score, etc.) + helpers
//   - hits: mutable object UI writes hit-rects into for input mapping
(() => {
  const NS = window.OneJump = window.OneJump || {};

  let ctx = null, R = null, hits = null;
  function rrp(x, y, w, h, r) { NS.PlayerSprite.roundRectPath(ctx, x, y, w, h, r); }

  const UI = NS.UI = {};

  UI.init = function(c, ref, hitRects) {
    ctx = c;
    R = ref;
    hits = hitRects;
  };

  // ============================================================
  // Helpers
  // ============================================================

  UI.formatTime = function(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    const h = Math.floor((ms % 1000) / 100);
    return m > 0 ? `${m}:${String(r).padStart(2,'0')}` : `${r}.${h}s`;
  };

  UI.medalForScore = function(s) {
    // gap shrinks as tier climbs — reflects player accel + rising difficulty
    if (s >= 3650) return { label: 'DIAMOND',  color: '#9ee0ff' };
    if (s >= 3450) return { label: 'RUBY',     color: '#ff5070' };
    if (s >= 3200) return { label: 'EMERALD',  color: '#50e090' };
    if (s >= 2900) return { label: 'SAPPHIRE', color: '#5080ff' };
    if (s >= 2550) return { label: 'PLATINUM', color: '#e0e8f0' };
    if (s >= 2150) return { label: 'GOLD',     color: '#ffd060' };
    if (s >= 1700) return { label: 'SILVER',   color: '#cfd6e0' };
    if (s >= 1200) return { label: 'BRONZE',   color: '#cd8a4a' };
    if (s >=  600) return { label: 'IRON',     color: '#889098' };
    return { label: 'ROOKIE', color: '#6a7a90' };
  };

  // small tier gem (diamond shape) — colored core + white inner + halo pulse
  function drawTierGem(cx, cy, r, color, t) {
    const pulse = 0.5 + Math.sin(t * 0.12) * 0.5;
    // halo
    const halo = ctx.createRadialGradient(cx, cy, 1, cx, cy, r * 2.4);
    halo.addColorStop(0, color);
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalAlpha = 0.4 * pulse;
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(cx, cy, r * 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // diamond
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = color;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-r * 0.4, -r * 0.4, r * 0.8, r * 0.8);
    ctx.restore();
  }

  UI.drawCoinIcon = function(cx, cy, r, rot) {
    const sx = Math.abs(Math.cos(rot));
    const wMul = 0.3 + sx * 0.7;
    ctx.fillStyle = '#a06010';
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * wMul, r, 0, 0, Math.PI*2);
    ctx.fill();
    const grd = ctx.createLinearGradient(cx - r*wMul, cy - r, cx + r*wMul, cy + r);
    grd.addColorStop(0, '#fff1a0');
    grd.addColorStop(0.5, '#ffcc40');
    grd.addColorStop(1, '#a06010');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * wMul * 0.8, r * 0.85, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#7a3008';
    ctx.font = `bold ${Math.floor(r * 1.2)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(wMul, 1);
    ctx.fillText('$', 0, 1);
    ctx.restore();
    ctx.textBaseline = 'alphabetic';
  };

  UI.drawPadlock = function(cx, cy) {
    ctx.fillStyle = 'rgba(20,28,48,0.75)';
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#ffd060';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy - 3, 6, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = '#ffd060';
    ctx.fillRect(cx - 7, cy - 3, 14, 12);
    ctx.fillStyle = '#221';
    ctx.fillRect(cx - 1, cy + 1, 2, 5);
  };

  UI.drawHighlighted = function(tokens, x, y, opts) {
    const { font = 'bold 14px monospace', baseColor = '#fff', align = 'center', gap = 0 } = opts || {};
    ctx.font = font;
    let totalW = 0;
    const widths = tokens.map(tok => {
      const txt = (typeof tok === 'string') ? tok : tok.t;
      const w = ctx.measureText(txt).width;
      totalW += w + gap;
      return w;
    });
    totalW -= gap;
    let cur = align === 'center' ? x - totalW/2 : (align === 'right' ? x - totalW : x);
    ctx.textAlign = 'left';
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      const txt = (typeof tok === 'string') ? tok : tok.t;
      const color = (typeof tok === 'string') ? baseColor : (tok.c || baseColor);
      ctx.fillStyle = color;
      ctx.fillText(txt, cur, y);
      cur += widths[i] + gap;
    }
  };

  // centered "LABEL  VALUE" — two fonts, two colors, centered around cx
  function drawCenteredKV(cx, y, label, labelColor, value, valueColor, labelFont, valueFont) {
    const sep = '  ';
    ctx.font = `${labelFont} monospace`;
    const lw = ctx.measureText(label + sep).width;
    ctx.font = `${valueFont} monospace`;
    const vw = ctx.measureText(value).width;
    const total = lw + vw;
    let cur = cx - total / 2;
    ctx.textAlign = 'left';
    ctx.font = `${labelFont} monospace`;
    ctx.fillStyle = labelColor;
    ctx.fillText(label + sep, cur, y);
    cur += lw;
    ctx.font = `${valueFont} monospace`;
    ctx.fillStyle = valueColor;
    ctx.fillText(value, cur, y);
  }
  // centered "LABEL  [parts...]" — parts: [{text, color}]
  function drawCenteredLabelParts(cx, y, label, labelColor, parts, labelFont, valueFont) {
    const sep = '  ';
    ctx.font = `${labelFont} monospace`;
    const lw = ctx.measureText(label + sep).width;
    ctx.font = `${valueFont} monospace`;
    let vw = 0;
    for (const p of parts) vw += ctx.measureText(p.text).width;
    const total = lw + vw;
    let cur = cx - total / 2;
    ctx.textAlign = 'left';
    ctx.font = `${labelFont} monospace`;
    ctx.fillStyle = labelColor;
    ctx.fillText(label + sep, cur, y);
    cur += lw;
    ctx.font = `${valueFont} monospace`;
    for (const p of parts) {
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, cur, y);
      cur += ctx.measureText(p.text).width;
    }
  }

  // compact total — 1.2k, 12.5k, 1.2M
  function formatTotalScore(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
  }

  function drawStatPlate(x, y, w, h, label, value, borderColor, valueColor) {
    ctx.fillStyle = 'rgba(20,28,48,0.85)';
    rrp(x, y, w, h, 10);
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#8aa';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w/2, y + 14);
    ctx.fillStyle = valueColor;
    ctx.font = 'bold 16px monospace';
    ctx.fillText(value, x + w/2, y + 33);
  }

  // ============================================================
  // Dithered sprite (start-screen player preview)
  // ============================================================

  let _ditherCanvas = null;
  function ensureDitherCanvas() {
    if (_ditherCanvas) return _ditherCanvas;
    _ditherCanvas = document.createElement('canvas');
    _ditherCanvas.width = 2; _ditherCanvas.height = 2;
    const cc = _ditherCanvas.getContext('2d');
    cc.fillStyle = 'rgba(0,0,0,0.22)';
    cc.fillRect(0, 0, 1, 1);
    cc.fillRect(1, 1, 1, 1);
    return _ditherCanvas;
  }
  const _previewBuf = document.createElement('canvas');
  let _previewBufPattern = null;
  UI.drawDitheredSprite = function(spr, dx, dy, dw, dh, alpha) {
    if (_previewBuf.width !== dw || _previewBuf.height !== dh) {
      _previewBuf.width = dw; _previewBuf.height = dh;
      _previewBufPattern = null;
    }
    const bc = _previewBuf.getContext('2d');
    bc.clearRect(0, 0, dw, dh);
    bc.imageSmoothingEnabled = false;
    bc.drawImage(spr, 0, 0, dw, dh);
    if (!_previewBufPattern) _previewBufPattern = bc.createPattern(ensureDitherCanvas(), 'repeat');
    bc.globalCompositeOperation = 'source-atop';
    bc.fillStyle = _previewBufPattern;
    bc.fillRect(0, 0, dw, dh);
    bc.globalCompositeOperation = 'source-over';
    ctx.save();
    if (alpha != null && alpha < 1) ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(_previewBuf, dx, dy);
    ctx.imageSmoothingEnabled = true;
    ctx.restore();
  };

  // ============================================================
  // Confetti (new best celebration)
  // ============================================================

  let confetti = [];
  UI.spawnConfetti = function() {
    confetti = [];
    const W = R.W;
    for (let i = 0; i < 70; i++) {
      confetti.push({
        x: W/2 + (Math.random() - 0.5) * 240,
        y: -10 - Math.random() * 80,
        vx: (Math.random() - 0.5) * 5,
        vy: 1 + Math.random() * 3,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.25,
        color: ['#ffd060','#7df','#ff5577','#fff','#9ee0ff','#c080ff'][Math.floor(Math.random() * 6)],
        sw: 4 + Math.random() * 4,
        sh: 6 + Math.random() * 6,
        life: 240 + Math.random() * 120,
      });
    }
  };
  UI.tickConfetti = function() {
    const H = R.H;
    for (const c of confetti) {
      c.x += c.vx; c.y += c.vy;
      c.vx *= 0.99;
      c.vy = Math.min(c.vy + 0.06, 4.5);
      c.rot += c.vrot;
      c.life--;
    }
    confetti = confetti.filter(c => c.life > 0 && c.y < H + 30);
  };
  UI.drawConfetti = drawConfetti;
  function drawConfetti() {
    if (!confetti.length) return;
    for (const c of confetti) {
      const alpha = Math.min(1, c.life / 80);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.sw/2, -c.sh/2, c.sw, c.sh);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // ============================================================
  // Stage banner
  // ============================================================

  // small slim top-right tier celebration — non-disruptive
  UI.drawTierBanner = function(banner) {
    const W = R.W;
    const tNorm = banner.age / 110;
    const a = tNorm < 0.12 ? tNorm / 0.12 : (tNorm > 0.85 ? (1 - tNorm) / 0.15 : 1);
    const slideIn = Math.max(0, 1 - banner.age / 10);
    const w = 200, h = 42;
    const x = W - w - 14 + slideIn * 40;
    const y = 14;
    ctx.save();
    ctx.globalAlpha = a;
    // glow halo
    const halo = ctx.createRadialGradient(x + w/2, y + h/2, 8, x + w/2, y + h/2, w * 0.7);
    halo.addColorStop(0, banner.color + '88');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(x - 20, y - 20, w + 40, h + 40);
    // body
    ctx.fillStyle = 'rgba(12,18,32,0.9)';
    rrp(x, y, w, h, 18);
    ctx.fill();
    ctx.strokeStyle = banner.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    // top accent stripe
    ctx.save();
    ctx.globalAlpha = a * 0.55;
    ctx.fillStyle = banner.color;
    rrp(x, y, w, 3, 18);
    ctx.fill();
    ctx.restore();
    // pulsing left chevron
    const pulse = 0.6 + Math.sin(banner.age * 0.18) * 0.4;
    ctx.fillStyle = banner.color;
    ctx.globalAlpha = a * pulse;
    ctx.beginPath();
    ctx.moveTo(x + 12, y + h/2 - 6);
    ctx.lineTo(x + 18, y + h/2);
    ctx.lineTo(x + 12, y + h/2 + 6);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = a;
    // text
    ctx.textAlign = 'left';
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#8aa';
    ctx.fillText('NEW TIER', x + 26, y + 16);
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = banner.color;
    ctx.fillText(banner.label, x + 26, y + 33);
    ctx.restore();
  };

  UI.drawStageBanner = function(banner) {
    const W = R.W, H = R.H;
    const t = banner.age / 90;
    const a = t < 0.15 ? t / 0.15 : (t > 0.85 ? (1 - t) / 0.15 : 1);
    const slide = (1 - Math.min(1, t * 4)) * 30;
    const cy = H/2 - 40 + slide;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, cy - 50, W, 100);
    ctx.fillStyle = banner.color;
    ctx.fillRect(0, cy - 50, W, 3);
    ctx.fillRect(0, cy + 47, W, 3);
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = banner.color;
    ctx.fillText(banner.text, W/2, cy + 4);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(banner.sub, W/2, cy + 30);
    ctx.restore();
  };

  // ============================================================
  // Unified play HUD (top-left panel)
  // ============================================================

  UI.drawPlayHud = function() {
    const stage = R.currentStage();
    const x = 12, y = 12;
    const w = 178, h = 130;
    ctx.fillStyle = 'rgba(12,18,32,0.78)';
    rrp(x, y, w, h, 10);
    ctx.fill();
    ctx.strokeStyle = '#3a4a6a';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = stage.color;
    rrp(x, y, 4, h, 4);
    ctx.fill();
    ctx.restore();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#8aa';
    ctx.font = '9px monospace';
    ctx.fillText('SCORE', x + 14, y + 16);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(String(R.score).padStart(5, '0'), x + 14, y + 38);
    // TIER gem (tier label below) — compact top-right
    const medal = UI.medalForScore(R.score);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#8aa';
    ctx.font = '9px monospace';
    ctx.fillText('TIER', x + w - 14, y + 16);
    drawTierGem(x + w - 18, y + 28, 5, medal.color, R.uiFrame);
    ctx.fillStyle = medal.color;
    ctx.font = 'bold 9px monospace';
    ctx.fillText(medal.label, x + w - 14, y + 44);

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 52);
    ctx.lineTo(x + w - 10, y + 52);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#8aa';
    ctx.font = '9px monospace';
    ctx.fillText('COINS', x + 14, y + 66);
    UI.drawCoinIcon(x + 22, y + 82, 7, R.uiFrame * 0.05);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(String(R.coinBalance), x + 36, y + 86);
    if (R.coinMultiplier > 1.001) {
      ctx.textAlign = 'right';
      ctx.fillStyle = '#7df';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('×' + R.coinMultiplier.toFixed(2), x + w - 14, y + 70);
    }

    // SPEED row: full-width label + numeric + km/h, no bar
    ctx.textAlign = 'left';
    ctx.fillStyle = '#8aa';
    ctx.font = '9px monospace';
    ctx.fillText('SPEED', x + 14, y + 100);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px monospace';
    const kmh = R.toKmh(R.speed).toFixed(0);
    const kmhTxt = kmh + ' km/h';
    ctx.fillText(kmhTxt, x + w - 14, y + 100);

    // NEXT STAGE UNLOCK row — dedicated row at bottom
    const target = R.STAGE_UNLOCK_SCORE || 2550;
    const fillRatio = Math.min(1, R.score / target);
    const cleared = R.score >= target;
    const labelText = cleared ? 'NEXT STAGE UNLOCKED' : 'NEXT STAGE UNLOCK';
    ctx.fillStyle = cleared ? '#7dff90' : '#8aa';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(labelText, x + 14, y + 116);
    // progress text right side
    ctx.textAlign = 'right';
    ctx.fillStyle = cleared ? '#7dff90' : '#ffd060';
    ctx.font = 'bold 8px monospace';
    ctx.fillText(`${Math.min(R.score, target)}/${target}`, x + w - 14, y + 116);
    // bar full-width
    const barX = x + 14;
    const barW = w - 28;
    const barY = y + 122;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    rrp(barX, barY, barW, 4, 2);
    ctx.fill();
    const bg = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    bg.addColorStop(0, '#7df');
    bg.addColorStop(0.5, '#ffd060');
    bg.addColorStop(1, cleared ? '#7dff90' : '#ff5577');
    ctx.fillStyle = bg;
    rrp(barX, barY, barW * fillRatio, 4, 2);
    ctx.fill();
  };

  // ============================================================
  // Start screen
  // ============================================================

  UI.drawStartScreen = function() {
    const t = R.uiFrame;
    const W = R.W, H = R.H;
    const SPR_W = NS.PlayerSprite.SPR_W;
    const SPR_H = NS.PlayerSprite.SPR_H;
    const landscape = W > H;

    const vig = ctx.createRadialGradient(W/2, H/2, Math.min(W, H) * 0.25, W/2, H/2, Math.max(W, H) * 0.7);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    drawTopTitle(t, landscape);

    // coin balance badge (top-right)
    drawCoinBadge(W - 14, 12, R.coinBalance, t);

    // preview character (integer scale + dither)
    const prevScale = 2;
    const prevW = SPR_W * prevScale, prevH = SPR_H * prevScale;
    const prevCx = landscape ? W * 0.35 : W / 2;
    const prevCy = landscape ? H * 0.58 : H * 0.50;
    const dx = Math.round(prevCx - prevW/2);
    const dy = Math.round(prevCy - prevH/2);
    const locked = R.previewLocked();
    const atlas = R.atlasFor(R.skinIds[R.skinIdx]);
    const previewSpr = atlas.idle[Math.floor(t / 6) % atlas.idle.length];
    ctx.save();
    if (locked) ctx.globalAlpha = 0.6;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(previewSpr, dx, dy, prevW, prevH);
    ctx.imageSmoothingEnabled = true;
    ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(prevCx, dy + prevH - 8, 40, 5, 0, 0, Math.PI*2);
    ctx.fill();
    if (locked) UI.drawPadlock(prevCx, prevCy);

    // skin arrows beside player
    const arrSize = 44;
    const arrGap = 18;
    hits.arrowL = {
      x: Math.round(prevCx - prevW/2 - arrGap - arrSize),
      y: Math.round(prevCy - arrSize/2),
      w: arrSize, h: arrSize,
    };
    hits.arrowR = {
      x: Math.round(prevCx + prevW/2 + arrGap),
      y: Math.round(prevCy - arrSize/2),
      w: arrSize, h: arrSize,
    };
    const prevSkinId = R.skinIds[(R.skinIdx - 1 + R.skinIds.length) % R.skinIds.length];
    const nextSkinId = R.skinIds[(R.skinIdx + 1) % R.skinIds.length];
    drawSkinArrow(hits.arrowL, '◀', t, 0,        prevSkinId);
    drawSkinArrow(hits.arrowR, '▶', t, Math.PI,  nextSkinId);

    // skin name below preview
    const skin = R.previewSkin();
    ctx.textAlign = 'center';
    ctx.font = '10px monospace';
    ctx.fillStyle = '#8aa';
    ctx.fillText(`SKIN ${R.skinIdx + 1}/${R.skinIds.length}`, prevCx, dy + prevH + 18);
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = locked ? '#ffd060' : '#fff';
    ctx.fillText(skin.name.toUpperCase(), prevCx, dy + prevH + 36);

    // cluster bottom-right
    const cw = landscape ? 280 : 300;
    const ch = 200;
    const cx = W - cw - 14;
    const cy = H - ch - 14;
    drawStartCluster(t, cx, cy, cw, ch);
  };

  function drawTopTitle(t, landscape) {
    const W = R.W;
    const cx = W / 2;
    const baseY = landscape ? 92 : 130;
    const size = landscape ? 46 : 64;
    const breathe = 1 + Math.sin(t * 0.05) * 0.025;
    const float = Math.sin(t * 0.05) * 4;
    const cy = baseY + float;

    // halo glow strip
    const glow = ctx.createRadialGradient(cx, cy, size * 0.4, cx, cy, size * 5);
    glow.addColorStop(0, 'rgba(140,200,255,0.45)');
    glow.addColorStop(0.4, 'rgba(140,200,255,0.18)');
    glow.addColorStop(1, 'rgba(140,200,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, cy - size * 2.5, W, size * 5);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(breathe, breathe);

    ctx.font = `bold ${size}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // back shadow
    ctx.fillStyle = 'rgba(10,30,60,0.7)';
    ctx.fillText('JUST JUMP', 4, 4);

    // gradient body
    const grd = ctx.createLinearGradient(0, -size * 0.55, 0, size * 0.5);
    grd.addColorStop(0,    '#ffffff');
    grd.addColorStop(0.35, '#bff5ff');
    grd.addColorStop(0.65, '#7df');
    grd.addColorStop(1,    '#1f6fb0');
    ctx.fillStyle = grd;
    ctx.fillText('JUST JUMP', 0, 0);

    // shine sweep across letters
    const txt = 'JUST JUMP';
    const txtW = ctx.measureText(txt).width;
    const sweepCycle = txtW + 80;
    const sweepX = ((t * 3) % sweepCycle) - txtW/2 - 40;
    ctx.save();
    ctx.beginPath();
    ctx.rect(-txtW/2, -size * 0.6, txtW, size * 1.2);
    ctx.clip();
    const sweepGrd = ctx.createLinearGradient(sweepX - 30, 0, sweepX + 30, 0);
    sweepGrd.addColorStop(0,   'rgba(255,255,255,0)');
    sweepGrd.addColorStop(0.5, 'rgba(255,255,255,0.6)');
    sweepGrd.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.fillStyle = sweepGrd;
    ctx.fillText(txt, 0, 0);
    ctx.restore();

    // stroke outline
    ctx.strokeStyle = 'rgba(20,80,140,0.55)';
    ctx.lineWidth = 1.5;
    ctx.strokeText('JUST JUMP', 0, 0);

    // J emphasis — bigger, golden, glowing on first char of each word
    ctx.font = `bold ${size}px monospace`;
    const charW = ctx.measureText('J').width;
    const jSize = Math.round(size * 1.3);
    // index 0 = 'J' of JUST, index 5 = 'J' of JUMP
    const jOffsets = [-txtW/2 + charW * 0.5, -txtW/2 + charW * 5.5];
    const jPulse = 0.7 + Math.sin(t * 0.08) * 0.3;
    ctx.font = `bold ${jSize}px monospace`;
    for (const jx of jOffsets) {
      // outer halo
      const hg = ctx.createRadialGradient(jx, 0, 2, jx, 0, jSize * 0.9);
      hg.addColorStop(0, `rgba(255,221,96,${0.5 * jPulse})`);
      hg.addColorStop(1, 'rgba(255,221,96,0)');
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.arc(jx, 0, jSize * 0.9, 0, Math.PI * 2); ctx.fill();
      // shadow
      ctx.fillStyle = 'rgba(60,30,5,0.7)';
      ctx.fillText('J', jx + 4, 4);
      // gold gradient body
      const jgrd = ctx.createLinearGradient(0, -jSize * 0.55, 0, jSize * 0.5);
      jgrd.addColorStop(0,    '#fff8c0');
      jgrd.addColorStop(0.35, '#ffe080');
      jgrd.addColorStop(0.7,  '#ffc040');
      jgrd.addColorStop(1,    '#a06010');
      ctx.fillStyle = jgrd;
      ctx.fillText('J', jx, 0);
      // dark outline
      ctx.strokeStyle = '#5a2810';
      ctx.lineWidth = 2;
      ctx.strokeText('J', jx, 0);
      // inner shine
      ctx.fillStyle = `rgba(255,255,255,${0.5 * jPulse})`;
      ctx.fillRect(jx - jSize * 0.3, -jSize * 0.4, jSize * 0.18, jSize * 0.12);
    }

    ctx.textBaseline = 'alphabetic';
    ctx.restore();

    // sparkles orbiting title
    drawTitleSparkles(t, cx, cy, size);

    // subtitle
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#aef';
    ctx.fillText('— MYTHICAL CHARACTERS —', cx, cy + size * 0.85);
  }

  function drawTitleSparkles(t, cx, cy, size) {
    const N = 7;
    for (let i = 0; i < N; i++) {
      const phase = t * 0.04 + i * (Math.PI * 2 / N);
      const rx = size * 4.0;
      const ry = size * 1.2;
      const x = cx + Math.cos(phase) * rx;
      const y = cy + Math.sin(phase * 1.3 + i) * ry;
      const tw = 0.5 + Math.sin(phase * 3 + i) * 0.5;
      const a = tw * 0.9;
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      const r = 1.2 + tw * 1.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI*2);
      ctx.fill();
      // cross sparkle when bright
      if (tw > 0.7) {
        ctx.fillStyle = `rgba(255,255,255,${a * 0.7})`;
        ctx.fillRect(x - 5, y - 0.5, 10, 1);
        ctx.fillRect(x - 0.5, y - 5, 1, 10);
      }
    }
  }

  function drawCoinBadge(rightX, topY, balance, t) {
    const text = String(balance);
    const padX = 12, iconW = 18, gap = 5;
    ctx.font = 'bold 17px monospace';
    const tw = ctx.measureText(text).width;
    const w = padX * 2 + iconW + gap + tw;
    const h = 30;
    const x = rightX - w;
    const y = topY;
    // bg pill
    ctx.fillStyle = 'rgba(12,18,32,0.85)';
    rrp(x, y, w, h, 15);
    ctx.fill();
    ctx.strokeStyle = '#ffd060';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    // soft halo behind icon
    const halo = ctx.createRadialGradient(x + padX + iconW/2, y + h/2, 1, x + padX + iconW/2, y + h/2, 14);
    halo.addColorStop(0, 'rgba(255,221,96,0.35)');
    halo.addColorStop(1, 'rgba(255,221,96,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x + padX + iconW/2, y + h/2, 14, 0, Math.PI * 2);
    ctx.fill();
    // coin icon
    UI.drawCoinIcon(x + padX + iconW / 2, y + h / 2, 8, t * 0.05);
    // count
    ctx.fillStyle = '#ffd060';
    ctx.textAlign = 'left';
    ctx.font = 'bold 17px monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + padX + iconW + gap, y + h / 2 + 1);
    ctx.textBaseline = 'alphabetic';
  }

  function drawSkinArrow(rct, marker, t, phaseOff, skinId) {
    const cx = rct.x + rct.w/2;
    const cy = rct.y + rct.h/2;
    const pulse = 0.5 + Math.sin(t * 0.1 + phaseOff) * 0.5;
    const skinLocked = skinId ? !NS.Skins.isUnlocked(skinId) : false;
    // outer ring
    ctx.strokeStyle = `rgba(255,221,96,${0.25 + pulse * 0.4})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, rct.w/2 + 3, 0, Math.PI*2);
    ctx.stroke();
    // body
    ctx.fillStyle = 'rgba(20,28,48,0.85)';
    ctx.beginPath();
    ctx.arc(cx, cy, rct.w/2, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = skinLocked ? '#666' : `rgba(255,221,96,${0.6 + pulse * 0.4})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    // mini sprite inside (preview of prev/next skin)
    if (skinId) {
      const SPR_W = NS.PlayerSprite.SPR_W, SPR_H = NS.PlayerSprite.SPR_H;
      const atlas = R.atlasFor(skinId);
      const spr = atlas.idle[Math.floor(t / 8) % atlas.idle.length];
      const miniScale = 0.5;
      const sw = SPR_W * miniScale, sh = SPR_H * miniScale;
      ctx.save();
      // clip to circle so sprite stays inside
      ctx.beginPath();
      ctx.arc(cx, cy, rct.w/2 - 1, 0, Math.PI*2);
      ctx.clip();
      if (skinLocked) ctx.globalAlpha = 0.45;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(spr, cx - sw/2, cy - sh/2 - 2, sw, sh);
      ctx.imageSmoothingEnabled = true;
      ctx.restore();
      if (skinLocked) {
        ctx.fillStyle = '#ffd060';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🔒', cx, cy + rct.h/2 - 3);
      }
    }
    // small chevron at outer edge (pointing direction of travel)
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const sgn = marker === '◀' ? -1 : 1;
    ctx.fillText(marker, cx + sgn * (rct.w/2 + 7), cy + 1);
    ctx.textBaseline = 'alphabetic';
  }

  function drawStartCluster(t, cx, cy, cw, ch) {
    const stage = R.stageList[R.startStageIdx];
    const skin = R.previewSkin();
    const locked = R.previewLocked();

    ctx.fillStyle = 'rgba(12,18,32,0.84)';
    rrp(cx, cy, cw, ch, 14);
    ctx.fill();
    ctx.strokeStyle = stage.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = stage.color;
    rrp(cx, cy, cw, 4, 14);
    ctx.fill();
    ctx.restore();

    let y = cy + 14;

    // 3 stat plates: BEST (this stage) | TOTAL (lifetime) | COIN BOOST
    const plateGap = 6;
    const plateW = (cw - 20 - plateGap * 2) / 3;
    const plateH = 42;
    drawStatPlate(cx + 10, y, plateW, plateH, 'BEST',
      String(R.best).padStart(5, '0'), '#3a4a6a', '#ffd060');
    drawStatPlate(cx + 10 + (plateW + plateGap), y, plateW, plateH, 'TOTAL',
      formatTotalScore(R.totalScore), '#3a4a6a', '#7df');
    const boosted = R.coinMultiplier > 1.001;
    const boostX = cx + 10 + (plateW + plateGap) * 2;
    drawStatPlate(boostX, y, plateW, plateH, 'BOOST',
      '×' + R.coinMultiplier.toFixed(2),
      boosted ? '#7df' : '#3a4a6a', boosted ? '#7df' : '#fff');
    hits.boost = { x: boostX, y: y, w: plateW, h: plateH };
    y += plateH + 10;

    // stage pill
    const pillW = cw - 20, pillH = 32;
    const pillX = cx + 10;
    ctx.fillStyle = 'rgba(20,28,48,0.85)';
    rrp(pillX, y, pillW, pillH, 16);
    ctx.fill();
    ctx.strokeStyle = stage.color;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    const arrR = 12;
    hits.stageL = { x: pillX + 4, y: y + pillH/2 - arrR, w: arrR*2, h: arrR*2 };
    hits.stageR = { x: pillX + pillW - 4 - arrR*2, y: y + pillH/2 - arrR, w: arrR*2, h: arrR*2 };
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('◀', hits.stageL.x + arrR, y + pillH/2 + 4);
    ctx.fillText('▶', hits.stageR.x + arrR, y + pillH/2 + 4);
    ctx.fillStyle = stage.color;
    ctx.font = 'bold 13px monospace';
    ctx.fillText(stage.name, cx + cw/2, y + pillH/2 - 1);
    ctx.fillStyle = '#8aa';
    ctx.font = '8px monospace';
    ctx.fillText(`STAGE ${R.startStageIdx + 1}/${R.stageList.length}`, cx + cw/2, y + pillH/2 + 11);
    y += pillH + 10;

    UI.drawHighlighted([
      { t: 'SPACE', c: '#ffd060' }, ' / ', { t: 'TAP', c: '#ffd060' }, '  →  ', { t: 'JUMP', c: '#7df' },
    ], cx + cw/2, y + 10, { font: '10px monospace', baseColor: '#aac' });
    UI.drawHighlighted([
      { t: 'AGAIN MID-AIR', c: '#ffd060' }, '  →  ', { t: 'DOUBLE', c: '#7df' },
    ], cx + cw/2, y + 24, { font: '10px monospace', baseColor: '#aac' });
    y += 34;

    const pulse = 0.55 + Math.sin(t * 0.12) * 0.45;
    const ctaScaleVal = 1 + Math.sin(t * 0.12) * 0.04;
    const ctaW = cw - 20, ctaH = 42;
    hits.ctaRect = { x: cx + 10, y: y, w: ctaW, h: ctaH };

    let ctaLabel, ctaBg, ctaFg, ctaCanBuy = true;
    if (locked) {
      ctaCanBuy = R.coinBalance >= skin.cost;
      ctaLabel = ctaCanBuy ? `BUY  ${skin.cost}` : `NEED  ${skin.cost}`;
      ctaBg = ctaCanBuy ? `rgba(255,221,96,${pulse})` : 'rgba(80,80,100,0.85)';
      ctaFg = ctaCanBuy ? '#221' : '#aaa';
    } else {
      ctaLabel = '▶ TAP TO START';
      ctaBg = `rgba(255,221,96,${pulse})`;
      ctaFg = '#221';
    }

    const useScale = ctaCanBuy || !locked;
    ctx.save();
    ctx.translate(hits.ctaRect.x + ctaW/2, hits.ctaRect.y + ctaH/2);
    if (useScale) ctx.scale(ctaScaleVal, ctaScaleVal);
    ctx.fillStyle = ctaBg;
    rrp(-ctaW/2, -ctaH/2, ctaW, ctaH, 21);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff8';
    ctx.stroke();
    if (locked) UI.drawCoinIcon(ctaW/2 - 22, 0, 8, t * 0.05);
    ctx.fillStyle = ctaFg;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(ctaLabel, locked ? -10 : 0, 5);
    ctx.restore();
  }

  // ============================================================
  // Game over
  // ============================================================

  UI.drawGameOver = function() {
    const W = R.W, H = R.H;
    const lastRun = R.lastRun;
    const deadFrame = R.deadFrame;
    const fadeIn = Math.min(1, deadFrame / 24);
    const ease = (k) => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;

    ctx.fillStyle = `rgba(0,0,0,${0.62 * fadeIn})`;
    ctx.fillRect(0, 0, W, H);

    drawConfetti();

    const landscape = W > H;
    const pw = landscape ? 460 : 380;
    const ph = landscape ? 420 : 480;
    const px = (W - pw) / 2;
    const slide = (1 - fadeIn) * 40;
    const py = (H - ph) / 2 + slide;

    ctx.save();
    ctx.globalAlpha = fadeIn;

    if (lastRun.newBest) {
      const g = ctx.createRadialGradient(W/2, py + ph/2, 40, W/2, py + ph/2, Math.max(pw, ph) * 0.8);
      g.addColorStop(0, 'rgba(255,210,90,0.32)');
      g.addColorStop(1, 'rgba(255,210,90,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    ctx.fillStyle = 'rgba(16,22,40,0.96)';
    rrp(px, py, pw, ph, 18);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = lastRun.newBest ? '#ffd060' : (lastRun.stageColor || '#3a4a6a');
    ctx.stroke();
    ctx.fillStyle = lastRun.newBest ? '#ffd060' : '#ff5577';
    rrp(px, py, pw, 6, 18);
    ctx.fill();

    // header
    const headerH = 48;
    ctx.fillStyle = lastRun.newBest ? 'rgba(255,210,90,0.12)' : 'rgba(255,90,110,0.12)';
    rrp(px, py + 6, pw, headerH, 14);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(lastRun.newBest ? '✦ NEW RECORD ✦' : 'GAME OVER', W/2, py + 36);

    // medal + score row
    const medal = UI.medalForScore(lastRun.score);
    const medalCx = px + (landscape ? 90 : pw/2);
    const medalCy = py + (landscape ? 130 : 105);
    drawMedalIcon(medalCx, medalCy, 30, medal.color, deadFrame);
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = medal.color;
    ctx.textAlign = 'center';
    ctx.fillText(medal.label, medalCx, medalCy + 50);

    const scoreT = Math.min(1, Math.max(0, (deadFrame - 12) / 36));
    const displayScore = Math.floor(lastRun.score * ease(scoreT));
    const scoreCx = landscape ? px + pw - 130 : pw/2 + px;
    const scoreCy = py + (landscape ? 100 : 158);
    ctx.fillStyle = '#8aa';
    ctx.font = '11px monospace';
    ctx.fillText('SCORE', scoreCx, scoreCy);
    ctx.fillStyle = lastRun.newBest ? '#ffd060' : '#fff';
    ctx.font = 'bold 44px monospace';
    ctx.fillText(String(displayScore).padStart(5, '0'), scoreCx, scoreCy + 38);

    const badgeY = scoreCy + 64;
    if (lastRun.newBest) {
      const pulse = 1 + Math.sin(deadFrame * 0.2) * 0.08;
      ctx.save();
      ctx.translate(scoreCx, badgeY);
      ctx.scale(pulse, pulse);
      ctx.fillStyle = '#ffd060';
      rrp(-68, -11, 136, 22, 11);
      ctx.fill();
      ctx.fillStyle = '#221';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`★ NEW BEST  +${lastRun.score - lastRun.prevBest} ★`, 0, 4);
      ctx.restore();
    } else {
      ctx.fillStyle = '#aab';
      ctx.font = '12px monospace';
      ctx.fillText('BEST ' + String(lastRun.prevBest || 0).padStart(5, '0'), scoreCx, badgeY + 4);
    }

    const divY = py + (landscape ? 200 : 240);
    drawFancyDivider(px + 24, px + pw - 24, divY, deadFrame,
      lastRun.newBest ? '#ffd060' : (lastRun.stageColor || '#7df'));

    const rows = [
      ['TIME',    UI.formatTime(lastRun.timeMs),                            '#a0d0ff'],
      ['JUMPS',   String(lastRun.jumps),                                    '#fff'],
      ['DOUBLES', String(lastRun.doubles),                                  '#7df'],
      ['DODGED',  String(lastRun.dodged),                                   '#fff'],
      ['MAX SPD', R.toKmh(lastRun.maxSpeed).toFixed(0) + ' km/h',            '#ff8aab'],
      ['COINS',   '+' + String(lastRun.coins || 0),                          '#ffd060'],
    ];
    const gridStartY = divY + 20;
    const colW = (pw - 48) / 2;
    const rowH = 22;
    const reveal = (i) => Math.min(1, Math.max(0, (deadFrame - 36 - i * 4) / 12));
    // vertical divider between left/right stat columns
    const colDvA = Math.min(reveal(2), reveal(3));
    if (colDvA > 0) {
      const dvX = px + 24 + colW;
      const dvTop = gridStartY - 8;
      const dvBot = gridStartY + 2 * rowH + 8;
      const dvAccent = lastRun.newBest ? '#ffd060' : (lastRun.stageColor || '#7df');
      ctx.save();
      ctx.globalAlpha = fadeIn * colDvA;
      drawVerticalDivider(dvX, dvTop, dvBot, deadFrame, dvAccent);
      ctx.restore();
    }
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cellCx = px + 24 + col * colW + colW / 2;
      const cellY = gridStartY + row * rowH;
      const a = reveal(i);
      if (a <= 0) continue;
      ctx.save();
      ctx.globalAlpha = fadeIn * a;
      drawCenteredKV(cellCx, cellY, r[0], '#8aa', r[1], r[2], '12px', 'bold 12px');
      ctx.restore();
    }

    const stageRowY = gridStartY + 3 * rowH + 4;
    const stageA = reveal(6);
    if (stageA > 0) {
      ctx.save();
      ctx.globalAlpha = fadeIn * stageA;
      const stageStr = (lastRun.stageName || '-') + (lastRun.stagesCleared ? ` ▲${lastRun.stagesCleared}` : '');
      const stageColor = lastRun.stageColor || '#c080ff';
      drawCenteredKV(px + pw / 2, stageRowY, 'STAGE', '#8aa', stageStr, stageColor, '12px', 'bold 12px');
      ctx.restore();
    }

    const multA = reveal(7);
    const multRowY = stageRowY + rowH;
    if (multA > 0) {
      ctx.save();
      ctx.globalAlpha = fadeIn * multA;
      const newM = (lastRun.multiplier || 1).toFixed(2);
      const oldM = (lastRun.prevMultiplier || 1).toFixed(2);
      let parts;
      if (lastRun.multiplierChanged) {
        const up = (lastRun.multiplier || 1) > (lastRun.prevMultiplier || 1);
        const arrowCol = up ? '#7df' : '#ff8aab';
        parts = [
          { text: `×${oldM}`, color: '#aaa' },
          { text: up ? ' ▶ ' : ' ▼ ', color: arrowCol },
          { text: `×${newM}`, color: arrowCol },
        ];
      } else {
        parts = [{ text: `×${newM}`, color: '#ffd060' }];
      }
      drawCenteredLabelParts(px + pw / 2, multRowY, 'NEXT BOOST', '#8aa', parts, '12px', 'bold 13px');
      ctx.restore();
    }

    const ctaA = Math.min(1, Math.max(0, (deadFrame - 70) / 20));
    if (ctaA > 0) {
      ctx.save();
      ctx.globalAlpha = fadeIn * ctaA;
      const pulse = 0.55 + Math.sin(deadFrame * 0.12) * 0.45;
      const scaleP = 1 + Math.sin(deadFrame * 0.12) * 0.04;
      const ctaW = pw - 80, ctaH = 42;
      const ctaCx = px + pw/2, ctaCy = py + ph - 32;
      ctx.translate(ctaCx, ctaCy);
      ctx.scale(scaleP, scaleP);
      ctx.fillStyle = `rgba(255,221,96,${pulse})`;
      rrp(-ctaW/2, -ctaH/2, ctaW, ctaH, 21);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fff8';
      ctx.stroke();
      ctx.fillStyle = '#221';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('▶ TAP TO RESTART', 0, 5);
      ctx.restore();
    }

    ctx.restore();
  };

  // ornate divider — gradient base + center diamond + halo + travelling sparkle + end caps
  function drawFancyDivider(x1, x2, divY, frame, accent) {
    const w = x2 - x1;
    const cx = (x1 + x2) / 2;
    // gradient base line (fades at edges, brighter mid)
    const g = ctx.createLinearGradient(x1, 0, x2, 0);
    g.addColorStop(0,    'rgba(255,255,255,0)');
    g.addColorStop(0.18, 'rgba(255,255,255,0.22)');
    g.addColorStop(0.5,  'rgba(255,255,255,0.5)');
    g.addColorStop(0.82, 'rgba(255,255,255,0.22)');
    g.addColorStop(1,    'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x1, divY - 0.5, w, 1);
    // accent stripe (thinner, themed color)
    const ag = ctx.createLinearGradient(x1, 0, x2, 0);
    ag.addColorStop(0,   'rgba(0,0,0,0)');
    ag.addColorStop(0.5, accent);
    ag.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = ag;
    ctx.fillRect(x1, divY + 0.5, w, 0.6);
    ctx.restore();
    // pulsing halo around center
    const t = frame * 0.06;
    const pulse = 0.55 + Math.sin(t) * 0.45;
    const halo = ctx.createRadialGradient(cx, divY, 1, cx, divY, 18);
    halo.addColorStop(0, accent);
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalAlpha = 0.35 * pulse;
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, divY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // center diamond ornament
    ctx.save();
    ctx.translate(cx, divY);
    ctx.rotate(Math.PI / 4);
    const ds = 3.5 + Math.sin(t) * 0.6;
    ctx.fillStyle = accent;
    ctx.fillRect(-ds, -ds, ds * 2, ds * 2);
    ctx.fillStyle = '#fff';
    const inner = ds * 0.45;
    ctx.fillRect(-inner, -inner, inner * 2, inner * 2);
    ctx.restore();
    // side filigree dots flanking diamond
    for (let i = 1; i <= 2; i++) {
      const off = i * 8;
      ctx.fillStyle = `rgba(255,255,255,${0.5 / i})`;
      ctx.beginPath(); ctx.arc(cx - off, divY, 1.2 - i * 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + off, divY, 1.2 - i * 0.3, 0, Math.PI * 2); ctx.fill();
    }
    // travelling sparkle
    const sx = x1 + ((frame * 1.8) % w);
    const tw = 0.5 + Math.sin(frame * 0.2) * 0.5;
    ctx.fillStyle = `rgba(255,255,255,${0.7 * (1 - Math.abs(sx - cx) / (w / 2)) + 0.3})`;
    ctx.fillRect(sx - 1.5, divY - 1, 3, 2);
    // tip cross sparkle when bright
    if (tw > 0.7) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(sx - 4, divY - 0.4, 8, 0.8);
    }
    // end caps — small triangle inward arrows
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(x1, divY - 2.5); ctx.lineTo(x1 + 4, divY); ctx.lineTo(x1, divY + 2.5);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x2, divY - 2.5); ctx.lineTo(x2 - 4, divY); ctx.lineTo(x2, divY + 2.5);
    ctx.closePath(); ctx.fill();
  }

  // vertical divider — gradient + center diamond + halo
  function drawVerticalDivider(x, yTop, yBot, frame, accent) {
    const h = yBot - yTop;
    const cy = (yTop + yBot) / 2;
    // base gradient line
    const g = ctx.createLinearGradient(0, yTop, 0, yBot);
    g.addColorStop(0,    'rgba(255,255,255,0)');
    g.addColorStop(0.2,  'rgba(255,255,255,0.18)');
    g.addColorStop(0.5,  'rgba(255,255,255,0.42)');
    g.addColorStop(0.8,  'rgba(255,255,255,0.18)');
    g.addColorStop(1,    'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 0.5, yTop, 1, h);
    // accent stripe
    const ag = ctx.createLinearGradient(0, yTop, 0, yBot);
    ag.addColorStop(0,   'rgba(0,0,0,0)');
    ag.addColorStop(0.5, accent);
    ag.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = ag;
    ctx.fillRect(x + 0.5, yTop, 0.6, h);
    ctx.restore();
    // center halo
    const t = frame * 0.06;
    const pulse = 0.55 + Math.sin(t) * 0.45;
    ctx.save();
    ctx.globalAlpha = 0.35 * pulse;
    const halo = ctx.createRadialGradient(x, cy, 1, x, cy, 12);
    halo.addColorStop(0, accent);
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, cy, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // center diamond
    ctx.save();
    ctx.translate(x, cy);
    ctx.rotate(Math.PI / 4);
    const ds = 2.5 + Math.sin(t) * 0.5;
    ctx.fillStyle = accent;
    ctx.fillRect(-ds, -ds, ds * 2, ds * 2);
    ctx.fillStyle = '#fff';
    const inner = ds * 0.45;
    ctx.fillRect(-inner, -inner, inner * 2, inner * 2);
    ctx.restore();
    // filigree dots above/below diamond
    for (let i = 1; i <= 2; i++) {
      const off = i * 7;
      ctx.fillStyle = `rgba(255,255,255,${0.5 / i})`;
      ctx.beginPath(); ctx.arc(x, cy - off, 1.1 - i * 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, cy + off, 1.1 - i * 0.3, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawMedalIcon(cx, cy, r, color, deadFrame) {
    const sweep = (deadFrame * 0.08) % (Math.PI * 2);
    const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, r * 1.6);
    g.addColorStop(0, color);
    g.addColorStop(0.4, 'rgba(255,210,90,0.3)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    const disc = ctx.createRadialGradient(cx - r*0.3, cy - r*0.3, 2, cx, cy, r);
    disc.addColorStop(0, '#fff');
    disc.addColorStop(0.4, color);
    disc.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = disc;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const rr = i % 2 === 0 ? r * 0.55 : r * 0.24;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    const sx = cx + Math.cos(sweep) * r * 1.4;
    const sy = cy + Math.sin(sweep) * r * 1.4;
    const grd = ctx.createLinearGradient(cx - r, sy - r, cx + r, sy + r);
    grd.addColorStop(0, 'rgba(255,255,255,0)');
    grd.addColorStop(0.5, 'rgba(255,255,255,0.4)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  }
})();
