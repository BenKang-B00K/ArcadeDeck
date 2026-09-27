// Coin registry — data-driven from data/coins.json.
// Variant defs (id, value, weight, palette, extra) come from JSON.
// Drawer logic stays here — uses palette from def.
(() => {
  const W = (window.OneJump = window.OneJump || {});

  const registry = new Map();

  function register(def) {
    if (!def || !def.id) throw new Error('coin needs id');
    registry.set(def.id, def);
    return def;
  }

  function loadFromArray(arr) {
    for (const def of arr) register(def);
  }

  function pickKind(env) {
    const eligible = [];
    let total = 0;
    const allowed = env.coinIds ? new Set(env.coinIds) : null;
    for (const def of registry.values()) {
      if (allowed && !allowed.has(def.id)) continue;
      if ((def.minScore || 0) > env.score) continue;
      eligible.push(def);
      total += def.weight || 1;
    }
    if (!eligible.length) return null;
    let r = Math.random() * total;
    for (const def of eligible) {
      r -= def.weight || 1;
      if (r <= 0) return def;
    }
    return eligible[eligible.length - 1];
  }

  function spawn(env) {
    const def = pickKind(env);
    if (!def) return [];
    const groundTop = env.GROUND_Y + env.player.h;
    const r = Math.random();
    if (r < 0.45) {
      const y = groundTop - 60 - Math.random() * 90;
      return [makeCoin(def, env.W + 30, y)];
    } else if (r < 0.8) {
      const y = groundTop - 70 - Math.random() * 80;
      return Array.from({ length: 4 }, (_, i) => makeCoin(def, env.W + 30 + i * 28, y));
    } else {
      const cy = groundTop - 130;
      const out = [];
      for (let i = 0; i < 5; i++) {
        const t = i / 4;
        const x = env.W + 30 + i * 28;
        const arc = Math.sin(t * Math.PI) * 50;
        out.push(makeCoin(def, x, cy + 20 - arc));
      }
      return out;
    }
  }

  function makeCoin(def, x, y) {
    return {
      kind: 'coin',
      variant: def.id,
      value: def.value,
      x, y,
      w: 18, h: 18,
      rot: Math.random() * Math.PI * 2,
      bob: Math.random() * Math.PI * 2,
    };
  }

  function update(o, env) {
    o.rot += 0.18;
    o.bob += 0.12;
  }

  function draw(ctx, o, env) {
    const def = registry.get(o.variant);
    if (!def) return;
    const cx = o.x + o.w/2;
    const cy = o.y + o.h/2 + Math.sin(o.bob) * 2;
    if (def.extra === 'gemSparkle') drawGemAura(ctx, cx, cy, o.w/2, o.rot, def.palette.auraRgb);
    coinDisc(ctx, cx, cy, o.w/2, o.rot, def.palette);
    if (def.extra === 'gemSparkle') drawGemSparkles(ctx, cx, cy, o.w/2, o.rot);
  }

  function hitbox(o) {
    return { x: o.x + 2, y: o.y + 2, w: o.w - 4, h: o.h - 4 };
  }

  W.Coins = { loadFromArray, spawn, update, draw, hitbox };

  // ---------- drawing helpers ----------
  function coinDisc(ctx, cx, cy, r, rot, palette) {
    const sx = Math.abs(Math.cos(rot));
    const wMul = 0.25 + sx * 0.75;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + r + 2, r * 0.6, 1.5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = palette.rim;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * wMul, r, 0, 0, Math.PI*2);
    ctx.fill();
    const grd = ctx.createLinearGradient(cx - r*wMul, cy - r, cx + r*wMul, cy + r);
    grd.addColorStop(0, palette.light);
    grd.addColorStop(0.5, palette.mid);
    grd.addColorStop(1, palette.dark);
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * wMul * 0.8, r * 0.85, 0, 0, Math.PI*2);
    ctx.fill();
    if (palette.emblem) {
      ctx.fillStyle = palette.emblem;
      ctx.font = `bold ${Math.floor(r * 1.1)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(wMul, 1);
      ctx.fillText(palette.emblemChar || '★', 0, 1);
      ctx.restore();
      ctx.textBaseline = 'alphabetic';
    }
    ctx.fillStyle = `rgba(255,255,255,${0.5 + sx * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(cx - r * wMul * 0.4, cy - r * 0.4, r * wMul * 0.25, r * 0.25, 0, 0, Math.PI*2);
    ctx.fill();
  }

  function drawGemAura(ctx, cx, cy, r, rot, rgb) {
    const pulse = 0.5 + Math.sin(rot * 3) * 0.5;
    const c = rgb || [180, 80, 255];
    ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.3 + pulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.6, 0, Math.PI*2);
    ctx.fill();
  }
  function drawGemSparkles(ctx, cx, cy, r, rot) {
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 3; i++) {
      const a = rot * 2 + i * 2.1;
      const sx = cx + Math.cos(a) * (r + 4);
      const sy = cy + Math.sin(a) * (r + 4);
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }
  }
})();
