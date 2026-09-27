// All non-world drawing — HUD, start screen, game over, stage banner, helpers.
// Single shared module. main game wires via UI.init(ctx, ref, hits).
//   - ref: getters for live game state (W, H, score, etc.) + helpers
//   - hits: mutable object UI writes hit-rects into for input mapping
(() => {
  const NS = window.OneJump = window.OneJump || {};

  let ctx = null, R = null, hits = null;
  function rrp(x, y, w, h, r) { NS.PlayerSprite.roundRectPath(ctx, x, y, w, h, r); }

  const UI = NS.UI = {};
  const T = (...a) => NS.I18N.t(...a);

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

  // Single source of score tiers: medal label/color + next-run coin multiplier.
  // Descending. Gap shrinks as tier climbs — reflects player accel + rising difficulty.
  UI.TIERS = [
    { score: 3650, label: 'DIAMOND',  color: '#9ee0ff', mult: 3.00 },
    { score: 3450, label: 'RUBY',     color: '#ff5070', mult: 2.70 },
    { score: 3200, label: 'EMERALD',  color: '#50e090', mult: 2.40 },
    { score: 2900, label: 'SAPPHIRE', color: '#5080ff', mult: 2.10 },
    { score: 2550, label: 'PLATINUM', color: '#e0e8f0', mult: 1.85 },
    { score: 2150, label: 'GOLD',     color: '#ffd060', mult: 1.60 },
    { score: 1700, label: 'SILVER',   color: '#cfd6e0', mult: 1.40 },
    { score: 1200, label: 'BRONZE',   color: '#cd8a4a', mult: 1.25 },
    { score:  600, label: 'IRON',     color: '#889098', mult: 1.10 },
    { score:    0, label: 'ROOKIE',   color: '#6a7a90', mult: 1.00 },
  ];
  UI.medalForScore = s => UI.TIERS.find(t => s >= t.score);

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

  // filled chevron (replaces ◀/▶ glyphs — font-dependent size/baseline on mobile)
  function drawChevron(x, y, dir, size) {
    ctx.beginPath();
    ctx.moveTo(x + dir * size * 0.6, y);
    ctx.lineTo(x - dir * size * 0.4, y - size * 0.6);
    ctx.lineTo(x - dir * size * 0.4, y + size * 0.6);
    ctx.closePath();
    ctx.fill();
  }

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
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#8aa';
    ctx.fillText(T('NEW TIER'), x + 26, y + 16);
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = banner.color;
    ctx.fillText(T(banner.label), x + 26, y + 33);
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
    ctx.fillRect(-R.OX, cy - 50, W + 2 * R.OX, 100);
    ctx.fillStyle = banner.color;
    ctx.fillRect(-R.OX, cy - 50, W + 2 * R.OX, 3);
    ctx.fillRect(-R.OX, cy + 47, W + 2 * R.OX, 3);
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

  // 4px HUD progress bar; gradient from c0 → mid gold → c1
  function progressBar(bx, by, bw, ratio, c1, c0 = '#7df') {
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    rrp(bx, by, bw, 4, 2);
    ctx.fill();
    const g = ctx.createLinearGradient(bx, 0, bx + bw, 0);
    g.addColorStop(0, c0);
    g.addColorStop(0.5, '#ffd060');
    g.addColorStop(1, c1);
    ctx.fillStyle = g;
    rrp(bx, by, bw * Math.min(1, ratio), 4, 2);
    ctx.fill();
  }

  UI.drawPlayHud = function() {
    const stage = R.currentStage();
    const x = 12, y = 12;
    const w = 178, h = 156;
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
    ctx.font = '10px monospace';
    ctx.fillText(T('SCORE'), x + 14, y + 16);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(String(R.score).padStart(5, '0'), x + 14, y + 38);
    // TIER badge (tier label below) — compact top-right
    const medal = UI.medalForScore(R.score);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#8aa';
    ctx.font = '10px monospace';
    ctx.fillText(T('TIER'), x + w - 14, y + 16);
    drawMedalIcon(x + w - 21, y + 28, 7, medal, R.uiFrame);
    ctx.fillStyle = medal.color;
    ctx.font = 'bold 10px monospace';
    ctx.fillText(T(medal.label), x + w - 14, y + 44);

    // NEXT TIER row — right under score/tier; progress within current tier band toward next one
    const next = UI.TIERS[UI.TIERS.indexOf(medal) - 1];
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = next ? next.color : medal.color;
    ctx.fillText(next ? T('NEXT ▸ {0}', T(next.label)) : T('MAX TIER REACHED'), x + 14, y + 62);
    if (next) {
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffd060';
      ctx.fillText(`${R.score}/${next.score}`, x + w - 14, y + 62);
    }
    const tierRatio = next ? (R.score - medal.score) / (next.score - medal.score) : 1;
    progressBar(x + 14, y + 68, w - 28, tierRatio, next ? next.color : medal.color, medal.color);

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 78);
    ctx.lineTo(x + w - 10, y + 78);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#8aa';
    ctx.font = '10px monospace';
    ctx.fillText(T('COINS'), x + 14, y + 92);
    UI.drawCoinIcon(x + 22, y + 108, 7, R.uiFrame * 0.05);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(String(R.coinBalance), x + 36, y + 112);
    if (R.coinMultiplier > 1.001) {
      ctx.textAlign = 'right';
      ctx.fillStyle = '#7df';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('×' + R.coinMultiplier.toFixed(2), x + w - 14, y + 96);
    }

    // SPEED row: full-width label + numeric + km/h, no bar
    ctx.textAlign = 'left';
    ctx.fillStyle = '#8aa';
    ctx.font = '10px monospace';
    ctx.fillText(T('SPEED'), x + 14, y + 126);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px monospace';
    const kmh = R.toKmh(R.speed).toFixed(0);
    const kmhTxt = kmh + ' km/h';
    ctx.fillText(kmhTxt, x + w - 14, y + 126);

    // NEXT STAGE UNLOCK row — dedicated row at bottom
    const target = R.STAGE_UNLOCK_SCORE || 2550;
    const fillRatio = Math.min(1, R.score / target);
    const cleared = R.score >= target;
    const labelText = T(cleared ? 'NEXT STAGE UNLOCKED' : 'NEXT STAGE UNLOCK');
    ctx.fillStyle = cleared ? '#7dff90' : '#8aa';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(labelText, x + 14, y + 142);
    // progress text right side
    ctx.textAlign = 'right';
    ctx.fillStyle = cleared ? '#7dff90' : '#ffd060';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`${Math.min(R.score, target)}/${target}`, x + w - 14, y + 142);
    progressBar(x + 14, y + 148, w - 28, fillRatio, cleared ? '#7dff90' : '#ff5577');
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
    ctx.fillRect(-R.OX, -R.OY, W + 2 * R.OX, H + 2 * R.OY);

    drawTopTitle(t, landscape);

    // coin balance badge (top-right)
    drawCoinBadge(W - 14, 12, R.coinBalance, t);
    drawLangButton(14, 12);
    drawVolumeButton(hits.lang.x + hits.lang.w + 8, 12);

    // preview character (atlas is supersampled → smooth scaling stays crisp)
    const prevScale = 2;
    const prevW = SPR_W * prevScale, prevH = SPR_H * prevScale;
    const prevCx = landscape ? W * 0.35 : W / 2;
    const prevCy = landscape ? H * 0.58 : H * 0.50;
    const dx = Math.round(prevCx - prevW/2);
    const dy = Math.round(prevCy - prevH/2);
    const locked = R.previewLocked();
    const atlas = R.atlasFor(R.skinIds[R.skinIdx]);
    const previewSpr = atlas.idle[Math.floor(t / 6) % atlas.idle.length];
    const skin = R.previewSkin();
    // skin-tinted spotlight + glowing pedestal ring
    const [ar, ag, ab] = skin.aura.rgb;
    const podY = dy + (NS.PlayerSprite.SPR_OFFY + 45) * prevScale;  // under feet
    const spot = ctx.createRadialGradient(prevCx, prevCy, 10, prevCx, prevCy, prevW * 0.62);
    spot.addColorStop(0, `rgba(${ar},${ag},${ab},${locked ? 0.08 : 0.22})`);
    spot.addColorStop(1, `rgba(${ar},${ag},${ab},0)`);
    ctx.fillStyle = spot;
    ctx.fillRect(prevCx - prevW, prevCy - prevW, prevW * 2, prevW * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(prevCx, podY, 44, 8, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},${0.45 + 0.25 * Math.sin(t * 0.08)})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.save();
    if (locked) ctx.globalAlpha = 0.6;
    ctx.drawImage(previewSpr, dx, dy, prevW, prevH);
    ctx.restore();
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
    drawSkinArrow(hits.arrowL, -1, t, 0,        prevSkinId);
    drawSkinArrow(hits.arrowR, +1, t, Math.PI,  nextSkinId);

    // skin name below preview
    ctx.textAlign = 'center';
    ctx.font = '10px monospace';
    ctx.fillStyle = '#8aa';
    ctx.fillText(T('SKIN {0}/{1}', R.skinIdx + 1, R.skinIds.length), prevCx, dy + prevH + 18);
    // owned count — collection goal
    const owned = R.skinIds.filter(id => NS.Skins.isUnlocked(id)).length;
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = owned === R.skinIds.length ? '#ffd060' : '#c9a0ff';
    ctx.fillText(T('OWNED {0}/{1}', owned, R.skinIds.length), prevCx, dy + prevH + 52);
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = locked ? '#ffd060' : '#fff';
    ctx.fillText(skin.name.toUpperCase(), prevCx, dy + prevH + 36);

    // cluster bottom-right
    const cw = landscape ? 280 : 300;
    const ch = 200;
    const cx = landscape ? W - cw - 14 : Math.round((W - cw) / 2);
    const cy = H - ch - 14;
    drawStartCluster(t, cx, cy, cw, ch);
    drawStageTooltip();
  };

  function drawTopTitle(t, landscape) {
    const W = R.W;
    const cx = W / 2;
    const baseY = landscape ? 92 : 130;
    const size = landscape ? 46 : 64;
    const breathe = 1 + Math.sin(t * 0.05) * 0.025;
    const float = Math.sin(t * 0.05) * 4;
    const cy = baseY + float;

    // halo glow — elliptical so it fades to 0 inside the fill rect (no hard edges)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, 0.5);
    const glow = ctx.createRadialGradient(0, 0, size * 0.4, 0, 0, size * 5);
    glow.addColorStop(0, 'rgba(140,200,255,0.45)');
    glow.addColorStop(0.4, 'rgba(140,200,255,0.18)');
    glow.addColorStop(1, 'rgba(140,200,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(-size * 5, -size * 5, size * 10, size * 10);
    ctx.restore();

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
    }

    ctx.textBaseline = 'alphabetic';
    ctx.restore();

    // sparkles orbiting title
    drawTitleSparkles(t, cx, cy, size);

    // subtitle
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#aef';
    ctx.fillText(T('— MYTHICAL CHARACTERS —'), cx, cy + size * 0.85);
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

  // language pill (top-left): globe + current language name; tap cycles EN → KO → JA
  function drawLangButton(x, y) {
    const text = NS.I18N.name;
    ctx.font = 'bold 13px monospace';
    const h = 30, w = 12 + 16 + 6 + ctx.measureText(text).width + 12;
    hits.lang = { x, y, w, h };
    ctx.fillStyle = 'rgba(12,18,32,0.85)';
    rrp(x, y, w, h, 15);
    ctx.fill();
    ctx.strokeStyle = '#7df';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    const gx = x + 20, gy = y + h / 2, gr = 7;
    ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(gx, gy, gr * 0.45, gr, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(gx - gr, gy); ctx.lineTo(gx + gr, gy); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + 34, gy + 1);
    ctx.textBaseline = 'alphabetic';
  }

  // volume button (next to lang pill): SVG speaker icon, waves = level; tap / M cycles mute→low→mid→high
  const VOL_ICON = {
    body: new Path2D('M2 9h4l5-4v14l-5-4H2z'),
    waves: [
      new Path2D('M14.83 9.17A4 4 0 0 1 14.83 14.83'),
      new Path2D('M16.95 7.05A7 7 0 0 1 16.95 16.95'),
      new Path2D('M19.07 4.93A10 10 0 0 1 19.07 19.07'),
    ],
    mute: new Path2D('M16 9l6 6M22 9l-6 6'),
  };
  function drawVolumeButton(x, y) {
    const s = 30, lvl = NS.Audio.level;
    hits.vol = { x, y: y - 6, w: s + 8, h: s + 12 };  // padded tap target for phones
    ctx.fillStyle = 'rgba(12,18,32,0.85)';
    rrp(x, y, s, s, 15);
    ctx.fill();
    ctx.strokeStyle = lvl ? '#7df' : '#ff7788';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.save();
    ctx.translate(x + 5.5, y + 5);        // 24-unit viewBox → ~19px icon
    ctx.scale(0.8, 0.8);
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.fillStyle = ctx.strokeStyle = '#fff';
    ctx.fill(VOL_ICON.body);
    if (lvl === 0) {
      ctx.strokeStyle = '#ff7788';
      ctx.stroke(VOL_ICON.mute);
    } else {
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = i < lvl ? 1 : 0.2;
        ctx.stroke(VOL_ICON.waves[i]);
      }
    }
    ctx.restore();
  }

  function drawSkinArrow(rct, dir, t, phaseOff, skinId) {
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
      ctx.drawImage(spr, cx - sw/2, cy - sh/2 - 2, sw, sh);
      ctx.restore();
      if (skinLocked) {
        // mini padlock (emoji renders inconsistently across platforms)
        const ly = cy + rct.h/2 - 9;
        ctx.strokeStyle = '#ffd060';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(cx, ly - 1, 2.6, Math.PI, 0); ctx.stroke();
        ctx.fillStyle = '#ffd060';
        ctx.fillRect(cx - 4, ly - 1, 8, 6);
        ctx.fillStyle = '#221';
        ctx.fillRect(cx - 0.5, ly + 1, 1, 2.5);
      }
    }
    // small chevron at outer edge (pointing direction of travel)
    ctx.fillStyle = '#fff';
    drawChevron(cx + dir * (rct.w/2 + 8), cy, dir, 9);
  }

  // mouse-hover note over stage pill (desktop only; touch never sets hits.hover):
  // obstacles this stage adds that no earlier stage had
  function newObstacles(idx) {
    const seen = new Set(R.stageList.slice(0, idx).flatMap(s => s.obstacleIds));
    return R.stageList[idx].obstacleIds.filter(id => !seen.has(id));
  }
  const prettyId = id => id.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
  function drawStageTooltip() {
    const p = hits.hover, r = hits.stagePill;
    if (!p || !r || p.x < r.x || p.x > r.x + r.w || p.y < r.y || p.y > r.y + r.h) return;
    const stage = R.stageList[R.startStageIdx];
    const lines = newObstacles(R.startStageIdx).map(id => '• ' + T(prettyId(id)));
    if (!lines.length) return;
    ctx.save();
    ctx.font = '10px monospace';
    const w = Math.ceil(Math.max(...lines.map(l => ctx.measureText(l).width), 90)) + 20;
    const h = 24 + lines.length * 14;
    const x = Math.max(4, Math.min(R.W - w - 4, r.x + r.w/2 - w/2));
    const y = r.y - h - 6;
    ctx.fillStyle = 'rgba(8,12,24,0.95)';
    rrp(x, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = stage.color;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffd060';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(T('NEW ADDITION') + ':', x + 10, y + 12);
    ctx.fillStyle = '#cde';
    ctx.font = '10px monospace';
    lines.forEach((l, i) => ctx.fillText(l, x + 10, y + 28 + i * 14));
    ctx.restore();
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
    drawStatPlate(cx + 10, y, plateW, plateH, T('BEST'),
      String(R.best).padStart(5, '0'), '#3a4a6a', '#ffd060');
    drawStatPlate(cx + 10 + (plateW + plateGap), y, plateW, plateH, T('TOTAL'),
      formatTotalScore(R.totalScore), '#3a4a6a', '#7df');
    const boosted = R.coinMultiplier > 1.001;
    const boostX = cx + 10 + (plateW + plateGap) * 2;
    drawStatPlate(boostX, y, plateW, plateH, T('BOOST'),
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
    // touch target ≥ 44 design px (glyph stays small); spans pill height + 5px slop
    const tapW = 56, tapPad = 5;
    hits.stageL = { x: pillX - tapPad, y: y - tapPad, w: tapW, h: pillH + tapPad*2 };
    hits.stagePill = { x: pillX, y: y, w: pillW, h: pillH };
    hits.stageR = { x: pillX + pillW + tapPad - tapW, y: y - tapPad, w: tapW, h: pillH + tapPad*2 };
    ctx.fillStyle = '#fff';
    drawChevron(pillX + 4 + arrR, y + pillH/2, -1, 11);
    drawChevron(pillX + pillW - 4 - arrR, y + pillH/2, +1, 11);
    ctx.fillStyle = stage.color;
    ctx.font = 'bold 13px monospace';
    ctx.fillText(stage.name, cx + cw/2, y + pillH/2 - 1);
    ctx.fillStyle = '#8aa';
    ctx.font = '9px monospace';
    ctx.fillText(T('STAGE {0}/{1}', R.startStageIdx + 1, R.stageList.length), cx + cw/2, y + pillH/2 + 11);
    y += pillH + 10;

    UI.drawHighlighted([
      { t: T('SPACE'), c: '#ffd060' }, ' / ', { t: T('TAP'), c: '#ffd060' }, '  →  ', { t: T('JUMP'), c: '#7df' },
    ], cx + cw/2, y + 10, { font: '10px monospace', baseColor: '#aac' });
    UI.drawHighlighted([
      { t: T('AGAIN MID-AIR'), c: '#ffd060' }, '  →  ', { t: T('DOUBLE'), c: '#7df' },
    ], cx + cw/2, y + 24, { font: '10px monospace', baseColor: '#aac' });
    y += 34;

    const pulse = 0.55 + Math.sin(t * 0.12) * 0.45;
    const ctaScaleVal = 1 + Math.sin(t * 0.12) * 0.04;
    const ctaW = cw - 20, ctaH = 42;
    hits.ctaRect = { x: cx + 10, y: y, w: ctaW, h: ctaH };

    let ctaLabel, ctaBg, ctaFg, ctaCanBuy = true;
    if (locked) {
      ctaCanBuy = R.coinBalance >= skin.cost;
      ctaLabel = T(ctaCanBuy ? 'BUY  {0}' : 'NEED  {0}', skin.cost);
      ctaBg = ctaCanBuy ? `rgba(255,221,96,${pulse})` : 'rgba(80,80,100,0.85)';
      ctaFg = ctaCanBuy ? '#221' : '#aaa';
    } else {
      ctaLabel = T('▶ TAP TO START');
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
    ctx.fillRect(-R.OX, -R.OY, W + 2 * R.OX, H + 2 * R.OY);
    if (!lastRun.newBest) {
      // red death vignette
      const v = ctx.createRadialGradient(W/2, H/2, Math.min(W, H) * 0.35, W/2, H/2, Math.max(W, H) * 0.75);
      v.addColorStop(0, 'rgba(255,40,70,0)');
      v.addColorStop(1, `rgba(255,40,70,${0.28 * fadeIn})`);
      ctx.fillStyle = v;
      ctx.fillRect(-R.OX, -R.OY, W + 2 * R.OX, H + 2 * R.OY);
    }

    drawConfetti();

    // replay bait: nearest goal above this score (stage best or next tier)
    const score = lastRun.score;
    const beatBest = !lastRun.newBest && lastRun.prevBest > score;
    const nextTier = UI.TIERS.slice().reverse().find(t => t.score > score);
    let goal = nextTier ? { score: nextTier.score, label: T(nextTier.label), color: nextTier.color } : null;
    if (beatBest && (!goal || lastRun.prevBest <= goal.score)) goal = { score: lastRun.prevBest, label: T('BEST'), color: '#ffd060' };
    const nearMiss = beatBest && score >= lastRun.prevBest * 0.8;

    const landscape = W > H;
    const pw = landscape ? 460 : 380;
    const ph = landscape ? 450 : 490;
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
      ctx.fillRect(-R.OX, -R.OY, W + 2 * R.OX, H + 2 * R.OY);
    }

    const accent = lastRun.newBest ? '#ffd060' : nearMiss ? '#ff9a50' : '#ff5577';
    const pg = ctx.createLinearGradient(0, py, 0, py + ph);
    pg.addColorStop(0, 'rgba(30,34,62,0.97)');
    pg.addColorStop(1, 'rgba(10,14,28,0.97)');
    ctx.fillStyle = pg;
    rrp(px, py, pw, ph, 18);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = lastRun.newBest ? '#ffd060' : (lastRun.stageColor || '#3a4a6a');
    ctx.stroke();
    ctx.fillStyle = accent;
    rrp(px, py, pw, 6, 18);
    ctx.fill();

    // header — "SO CLOSE!" when within 20% of stage best
    const headerH = 48;
    ctx.fillStyle = lastRun.newBest ? 'rgba(255,210,90,0.12)' : nearMiss ? 'rgba(255,150,80,0.14)' : 'rgba(255,90,110,0.12)';
    rrp(px, py + 6, pw, headerH, 14);
    ctx.fill();
    ctx.fillStyle = nearMiss ? '#ffb070' : '#fff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(T(lastRun.newBest ? '✦ NEW RECORD ✦' : nearMiss ? 'SO CLOSE!' : 'GAME OVER'), W/2, py + 36);

    // medal + score row
    const medal = UI.medalForScore(lastRun.score);
    const medalR = landscape ? 30 : 26;
    const medalCx = px + (landscape ? 90 : pw/2);
    const medalCy = py + (landscape ? 130 : 98);
    drawMedalIcon(medalCx, medalCy, medalR, medal, deadFrame);
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = medal.color;
    ctx.textAlign = 'center';
    ctx.fillText(T(medal.label), medalCx, medalCy + medalR + 20);

    const scoreT = Math.min(1, Math.max(0, (deadFrame - 12) / 36));
    const displayScore = Math.floor(lastRun.score * ease(scoreT));
    const scoreCx = landscape ? px + pw - 130 : pw/2 + px;
    const scoreCy = py + (landscape ? 100 : 166);
    ctx.fillStyle = '#8aa';
    ctx.font = '11px monospace';
    ctx.fillText(T('SCORE'), scoreCx, scoreCy);
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
      ctx.fillText(T('★ NEW BEST  +{0} ★', lastRun.score - lastRun.prevBest), 0, 4);
      ctx.restore();
    } else {
      ctx.fillStyle = '#aab';
      ctx.font = '12px monospace';
      ctx.fillText(T('BEST {0}', String(lastRun.prevBest || 0).padStart(5, '0')), scoreCx, badgeY + 4);
    }

    const divY = py + (landscape ? 200 : 250);
    drawFancyDivider(px + 24, px + pw - 24, divY, deadFrame,
      lastRun.newBest ? '#ffd060' : (lastRun.stageColor || '#7df'));

    const rows = [
      [T('TIME'),  UI.formatTime(lastRun.timeMs),                            '#a0d0ff'],
      [T('JUMPS'),  String(lastRun.jumps),                                    '#fff'],
      [T('DOUBLES'), String(lastRun.doubles),                                  '#7df'],
      [T('DODGED'),  String(lastRun.dodged),                                   '#fff'],
      [T('MAX SPD'), R.toKmh(lastRun.maxSpeed).toFixed(0) + ' km/h',            '#ff8aab'],
      [T('COINS'),  '+' + String(lastRun.coins || 0),                          '#ffd060'],
    ];
    const gridStartY = divY + 20;
    const colW = (pw - 48) / 2;
    const rowH = 22;
    const reveal = (i) => Math.min(1, Math.max(0, (deadFrame - 30 - i * 3) / 10));
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
      drawCenteredKV(px + pw / 2, stageRowY, T('STAGE'), '#8aa', stageStr, stageColor, '12px', 'bold 12px');
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
      drawCenteredLabelParts(px + pw / 2, multRowY, T('NEXT BOOST'), '#8aa', parts, '12px', 'bold 13px');
      ctx.restore();
    }

    // skins owned + distance to next unlock — replay hook
    const skinA = reveal(8);
    if (skinA > 0 && lastRun.skinsTotal) {
      ctx.save();
      ctx.globalAlpha = fadeIn * skinA;
      const parts = [{ text: `${lastRun.skinsOwned}/${lastRun.skinsTotal}`, color: '#c9a0ff' }];
      if (lastRun.skinsOwned < lastRun.skinsTotal) {
        const need = lastRun.nextSkinCost - (lastRun.coinBalance || 0);
        parts.push({ text: '  ·  ', color: '#667' });
        parts.push(need > 0
          ? { text: T('NEED  {0}', need), color: '#ffd060' }
          : { text: T('BUY  {0}', lastRun.nextSkinCost), color: '#7fe8a0' });
      }
      drawCenteredLabelParts(px + pw / 2, multRowY + rowH, T('SKINS'), '#8aa', parts, '12px', 'bold 13px');
      ctx.restore();
    }

    // next-goal progress bar — "you were THIS close" hook
    const goalA = reveal(9);
    if (goal && goalA > 0) {
      ctx.save();
      ctx.globalAlpha = fadeIn * goalA;
      const bw = pw - 80, bh = 8, bx = px + 40, by = py + ph - 72;
      const ratio = Math.min(1, score / goal.score) * ease(goalA);
      const hot = score / goal.score >= 0.85;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = goal.color;
      ctx.fillText(T('NEXT ▸ {0}', goal.label), bx, by - 7);
      ctx.textAlign = 'right';
      ctx.fillStyle = hot ? `rgba(255,170,90,${0.7 + 0.3 * Math.sin(deadFrame * 0.25)})` : '#dde';
      ctx.fillText(T(hot ? 'ONLY {0} TO GO!' : '{0} TO GO', goal.score - score), bx + bw, by - 7);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      rrp(bx, by, bw, bh, bh/2);
      ctx.fill();
      const fw = Math.max(bh, bw * ratio);
      const fg = ctx.createLinearGradient(bx, 0, bx + fw, 0);
      fg.addColorStop(0, accent);
      fg.addColorStop(1, goal.color);
      ctx.fillStyle = fg;
      rrp(bx, by, fw, bh, bh/2);
      ctx.fill();
      // spark at fill head + goal pin at track end
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(bx + fw - bh/2, by + bh/2, 3 + Math.sin(deadFrame * 0.3), 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = goal.color;
      ctx.beginPath(); ctx.arc(bx + bw, by + bh/2, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.restore();
    }

    // CTA — pops in once taps are accepted (index.html gate: deadFrame 45)
    const ctaK = Math.min(1, Math.max(0, (deadFrame - 45) / 14));
    if (ctaK > 0) {
      ctx.save();
      const back = 1 + 2.7 * Math.pow(ctaK - 1, 3) + 1.7 * Math.pow(ctaK - 1, 2);  // easeOutBack
      const scaleP = back * (1 + Math.sin(deadFrame * 0.14) * 0.035);
      const ctaW = pw - 60, ctaH = 48;
      const ctaCx = px + pw/2, ctaCy = py + ph - 34;
      ctx.translate(ctaCx, ctaCy);
      ctx.scale(scaleP, scaleP);
      ctx.shadowColor = 'rgba(255,200,80,0.85)';
      ctx.shadowBlur = 14 + Math.sin(deadFrame * 0.14) * 8;
      const cg = ctx.createLinearGradient(0, -ctaH/2, 0, ctaH/2);
      cg.addColorStop(0, '#ffe98a');
      cg.addColorStop(1, '#ffb52e');
      ctx.fillStyle = cg;
      rrp(-ctaW/2, -ctaH/2, ctaW, ctaH, ctaH/2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // diagonal shimmer sweep
      ctx.save();
      ctx.clip();
      const sx = (deadFrame * 5) % (ctaW * 2.2) - ctaW * 0.6;
      const sg = ctx.createLinearGradient(sx - 30, 0, sx + 30, 0);
      sg.addColorStop(0, 'rgba(255,255,255,0)');
      sg.addColorStop(0.5, 'rgba(255,255,255,0.7)');
      sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.transform(1, 0, -0.4, 1, 0, 0);
      ctx.fillStyle = sg;
      ctx.fillRect(-ctaW, -ctaH, ctaW * 2, ctaH * 2);
      ctx.restore();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fff';
      ctx.stroke();
      ctx.fillStyle = '#2a1a00';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(T('▶ ONE MORE RUN'), 0, 6);
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

  // hex color → rgba, lightened (+amt) or darkened (-amt) toward white/black
  function tint(hex, amt, alpha = 1) {
    const n = parseInt(hex.slice(1), 16);
    const f = c => Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt));
    return `rgba(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)},${alpha})`;
  }
  function polyPath(cx, cy, r, sides, rot) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const a = rot + (i / sides) * Math.PI * 2;
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    ctx.closePath();
  }
  function starPath(cx, cy, ro, ri, pts) {
    ctx.beginPath();
    for (let i = 0; i < pts * 2; i++) {
      const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
      const rr = i % 2 ? ri : ro;
      ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    ctx.closePath();
  }

  // Tier badge. rank 0 ROOKIE → 9 DIAMOND.
  //   ROOKIE: plain shield + chevron. IRON..GOLD: ribbon medal, rim, star, rank pips.
  //   PLATINUM..DIAMOND: faceted gem (fewer sides = rarer), DIAMOND adds crown.
  // gem cuts by rank: [sides, rotation] — PLATINUM octagon, SAPPHIRE hex, EMERALD pentagon, RUBY cushion, DIAMOND rhombus
  const GEM = { 5: [8, -Math.PI / 8], 6: [6, -Math.PI / 2], 7: [5, -Math.PI / 2], 8: [4, -Math.PI / 4], 9: [4, -Math.PI / 2] };
  function drawMedalIcon(cx, cy, r, medal, t) {
    const color = medal.color;
    const rank = UI.TIERS.length - 1 - UI.TIERS.indexOf(medal);
    const gem = rank >= 5;
    const pulse = 0.5 + Math.sin(t * 0.08) * 0.5;

    // halo (tier color, stronger for higher ranks)
    const g = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 1.8);
    g.addColorStop(0, tint(color, 0, 0.35 + rank * 0.04 + pulse * 0.1));
    g.addColorStop(1, tint(color, 0, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.8, 0, Math.PI * 2); ctx.fill();

    // ribbon tails (metal + gem tiers)
    if (rank >= 1) {
      for (const d of [-1, 1]) {
        const x0 = cx + d * r * 0.35;
        ctx.fillStyle = tint(color, -0.45);
        ctx.beginPath();
        ctx.moveTo(x0 - r * 0.22, cy + r * 0.4);
        ctx.lineTo(x0 + r * 0.22, cy + r * 0.4);
        ctx.lineTo(x0 + d * r * 0.2 + r * 0.2, cy + r * 1.22);
        ctx.lineTo(x0 + d * r * 0.2, cy + r * 1.05);
        ctx.lineTo(x0 + d * r * 0.2 - r * 0.2, cy + r * 1.22);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // body path
    const body = () => {
      if (rank === 0) {
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.8, cy - r * 0.8);
        ctx.lineTo(cx + r * 0.8, cy - r * 0.8);
        ctx.lineTo(cx + r * 0.8, cy + r * 0.1);
        ctx.quadraticCurveTo(cx + r * 0.7, cy + r * 0.75, cx, cy + r);
        ctx.quadraticCurveTo(cx - r * 0.7, cy + r * 0.75, cx - r * 0.8, cy + r * 0.1);
        ctx.closePath();
      } else if (gem) {
        polyPath(cx, cy, r, GEM[rank][0], GEM[rank][1]);
      } else {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      }
    };

    // dark outline + body gradient
    body();
    ctx.strokeStyle = '#0a0c14';
    ctx.lineWidth = Math.max(1.5, r * 0.14);
    ctx.lineJoin = 'round';
    ctx.stroke();
    const fill = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    fill.addColorStop(0, tint(color, 0.55));
    fill.addColorStop(0.45, color);
    fill.addColorStop(1, tint(color, -0.5));
    ctx.fillStyle = fill;
    ctx.fill();

    ctx.save();
    body();
    ctx.clip();
    if (gem) {
      // facets: lines from center to each vertex, alternating shade
      const [sides, rot] = GEM[rank];
      for (let i = 0; i < sides; i++) {
        const a0 = rot + (i / sides) * Math.PI * 2;
        const a1 = a0 + Math.PI * 2 / sides;
        ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a0) * r, cy + Math.sin(a0) * r);
        ctx.lineTo(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r);
        ctx.closePath();
        ctx.fill();
      }
      // table (inner flat face)
      polyPath(cx, cy, r * 0.5, sides, rot);
      ctx.fillStyle = tint(color, 0.35, 0.9);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (rank > 0) {
      // inner rim ring + center star
      ctx.strokeStyle = tint(color, -0.35);
      ctx.lineWidth = r * 0.12;
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = tint(color, 0.6, 0.8);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2); ctx.stroke();
      starPath(cx, cy - r * 0.08, r * 0.42, r * 0.18, 5);
      ctx.fillStyle = tint(color, -0.4);
      ctx.fill();
      starPath(cx, cy - r * 0.12, r * 0.4, r * 0.17, 5);
      ctx.fillStyle = tint(color, 0.75);
      ctx.fill();
      // rank pips (1..4)
      for (let i = 0; i < rank; i++) {
        const px = cx + (i - (rank - 1) / 2) * r * 0.2;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(px, cy + r * 0.5, r * 0.06, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      // rookie chevron
      ctx.strokeStyle = tint(color, 0.6);
      ctx.lineWidth = r * 0.16;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.4, cy - r * 0.05);
      ctx.lineTo(cx, cy + r * 0.3);
      ctx.lineTo(cx + r * 0.4, cy - r * 0.05);
      ctx.stroke();
    }
    // top-left gloss + moving sheen
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.beginPath(); ctx.ellipse(cx - r * 0.3, cy - r * 0.45, r * 0.5, r * 0.22, -0.5, 0, Math.PI * 2); ctx.fill();
    const sx = cx - r * 2 + ((t * 2) % (r * 6));
    const sh = ctx.createLinearGradient(sx - r * 0.4, cy - r, sx + r * 0.4, cy + r);
    sh.addColorStop(0, 'rgba(255,255,255,0)');
    sh.addColorStop(0.5, 'rgba(255,255,255,0.45)');
    sh.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sh;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();

    // crown for DIAMOND
    if (rank === 9) {
      const cyT = cy - r * 1.05;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.45, cyT + r * 0.18);
      ctx.lineTo(cx - r * 0.5, cyT - r * 0.2);
      ctx.lineTo(cx - r * 0.22, cyT);
      ctx.lineTo(cx, cyT - r * 0.32);
      ctx.lineTo(cx + r * 0.22, cyT);
      ctx.lineTo(cx + r * 0.5, cyT - r * 0.2);
      ctx.lineTo(cx + r * 0.45, cyT + r * 0.18);
      ctx.closePath();
      ctx.strokeStyle = '#0a0c14';
      ctx.lineWidth = Math.max(1, r * 0.1);
      ctx.stroke();
      ctx.fillStyle = '#ffd060';
      ctx.fill();
    }
    // twinkle sparkles on gem tiers
    if (gem) {
      for (let i = 0; i < 2; i++) {
        const a = t * 0.03 + i * Math.PI;
        const tw = Math.max(0, Math.sin(t * 0.1 + i * 2));
        const x = cx + Math.cos(a) * r * 1.2, y = cy + Math.sin(a) * r * 1.2;
        ctx.fillStyle = `rgba(255,255,255,${tw})`;
        starPath(x, y, r * 0.18 * tw + 0.5, r * 0.04, 4);
        ctx.fill();
      }
    }
  }
})();
