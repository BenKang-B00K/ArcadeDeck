// Obstacle module — JSON-driven config, JS-defined behavior.
// data/obstacles.json supplies weight + minScore (+ any future tunables).
// `defs` map below holds behavior (spawn/update/draw/hitbox) keyed by id.
// loadFromArray(arr) merges JSON config with built-in defs.
(() => {
  const W = (window.OneJump = window.OneJump || {});

  const registry = new Map();   // merged def: data + behavior
  const defs = new Map();       // built-in behaviors keyed by id

  function defineBehavior(id, behavior) {
    defs.set(id, behavior);
  }

  function loadFromArray(arr) {
    for (const item of arr) {
      const beh = defs.get(item.id);
      if (!beh) {
        console.warn('No behavior defined for obstacle:', item.id);
        continue;
      }
      registry.set(item.id, Object.assign({}, beh, item));
    }
  }

  function register(def) {
    registry.set(def.id, def);
    return def;
  }

  function pickKind(env) {
    const eligible = [];
    let total = 0;
    const allowed = env.allowedIds ? new Set(env.allowedIds) : null;
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
    if (!def || !def.spawn) return [];
    return def.spawn(env);
  }

  function update(o, env) {
    const def = registry.get(o.kind);
    if (def && def.update) def.update(o, env);
  }

  function draw(ctx, o, env) {
    const def = registry.get(o.kind);
    if (def && def.draw) def.draw(ctx, o, env);
  }

  function hitbox(o) {
    const def = registry.get(o.kind);
    if (def && def.hitbox) return def.hitbox(o);
    return o;
  }

  W.Obstacles = {
    register, loadFromArray, defineBehavior,
    spawn, update, draw, hitbox,
    all: () => Array.from(registry.values()),
  };

  // ---------- shared helpers ----------
  function groundTop(env) { return env.GROUND_Y + env.player.h; }

  // ---------- behaviors ----------

  defineBehavior('spike', {
    spawn(env) {
      // variants: normal / fat / narrow-tall
      const v = Math.random();
      let w, h, variant;
      if (v < 0.45) {
        // normal
        w = 22 + Math.random() * 18;
        h = 30 + Math.random() * 30;
        variant = 'normal';
      } else if (v < 0.75) {
        // fat — wider, shorter
        w = 38 + Math.random() * 16;
        h = 30 + Math.random() * 18;
        variant = 'fat';
      } else {
        // narrow tall — easier to pass but tall
        w = 10 + Math.random() * 8;
        h = 42 + Math.random() * 24;
        variant = 'narrow';
      }
      return [{ kind: 'spike', x: env.W + 20, y: groundTop(env) - h, w, h, variant }];
    },
    draw(ctx, o) {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(o.x + o.w/2, o.y + o.h - 1, o.w/2, 3, 0, 0, Math.PI*2);
      ctx.fill();
      const grd = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.h);
      grd.addColorStop(0, '#ffb0c0');
      grd.addColorStop(0.5, '#ff5577');
      grd.addColorStop(1, '#7a1530');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.moveTo(o.x, o.y + o.h);
      ctx.lineTo(o.x + o.w / 2, o.y);
      ctx.lineTo(o.x + o.w, o.y + o.h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#3a0010';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.moveTo(o.x + o.w/2 - 2, o.y + 4);
      ctx.lineTo(o.x + o.w/2, o.y + 1);
      ctx.lineTo(o.x + o.w/2 + 1, o.y + o.h - 6);
      ctx.lineTo(o.x + o.w/2 - 1, o.y + o.h - 8);
      ctx.closePath();
      ctx.fill();
    },
    hitbox(o) {
      return { x: o.x + 4, y: o.y + 4, w: o.w - 8, h: o.h - 4 };
    },
  });

  defineBehavior('doubleSpike', {
    spawn(env) {
      const top = groundTop(env);
      const h = 38;
      // variants: tight / normal / wide spacing
      const v = Math.random();
      const spacing = v < 0.3 ? 18 : (v < 0.75 ? 30 : 48);
      return [
        { kind: 'spike', x: env.W + 20,           y: top - h, w: 24, h },
        { kind: 'spike', x: env.W + 20 + spacing, y: top - h, w: 24, h },
      ];
    },
  });

  defineBehavior('bat', {
    spawn(env) {
      // variants: normal / big / drunken
      const v = Math.random();
      const flyY = env.GROUND_Y - 60 + Math.random() * 30;
      if (v < 0.5) {
        return [{
          kind: 'bat', x: env.W + 20, y: flyY,
          w: 38, h: 26, fl: 0, flapSpeed: 0.25, sizeMul: 1, variant: 'normal',
        }];
      } else if (v < 0.8) {
        // big — slower flap, larger hitbox
        return [{
          kind: 'bat', x: env.W + 20, y: flyY - 6,
          w: 54, h: 36, fl: 0, flapSpeed: 0.18, sizeMul: 1.4, variant: 'big',
        }];
      } else {
        // drunken — wobbles vertically
        return [{
          kind: 'bat', x: env.W + 20, y: flyY,
          w: 38, h: 26, fl: 0, flapSpeed: 0.4, sizeMul: 1, variant: 'drunken',
          baseY: flyY, vAmp: 16 + Math.random() * 8, vPhase: Math.random() * Math.PI * 2,
        }];
      }
    },
    update(o) {
      o.fl = (o.fl + (o.flapSpeed || 0.25)) % (Math.PI * 2);
      if (o.variant === 'drunken') {
        o.vPhase += 0.12;
        o.y = o.baseY + Math.sin(o.vPhase) * o.vAmp;
      }
    },
    draw(ctx, o) {
      const cx = o.x + o.w/2, cy = o.y + o.h/2;
      const sm = o.sizeMul || 1;
      const flap = Math.sin(o.fl) * 8 * sm;
      // drunken tilt
      const tilt = o.variant === 'drunken' ? Math.sin(o.vPhase * 1.5) * 0.25 : 0;
      ctx.save();
      if (tilt) {
        ctx.translate(cx, cy);
        ctx.rotate(tilt);
        ctx.translate(-cx, -cy);
      }
      // wings
      ctx.fillStyle = '#1a0a2a';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(o.x - 4 * sm, cy - flap - 4, o.x, cy - flap);
      ctx.quadraticCurveTo(o.x + 4 * sm, cy + 4, o.x + 8 * sm, cy + 2);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(o.x + o.w + 4 * sm, cy - flap - 4, o.x + o.w, cy - flap);
      ctx.quadraticCurveTo(o.x + o.w - 4 * sm, cy + 4, o.x + o.w - 8 * sm, cy + 2);
      ctx.closePath(); ctx.fill();
      // body
      const grd = ctx.createRadialGradient(cx - 2, cy - 3, 1, cx, cy, 11 * sm);
      grd.addColorStop(0, '#5a3a7a');
      grd.addColorStop(1, '#180828');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.ellipse(cx, cy, 10 * sm, 8 * sm, 0, 0, Math.PI * 2); ctx.fill();
      // ears
      ctx.fillStyle = '#180828';
      ctx.beginPath(); ctx.moveTo(cx - 5*sm, cy - 6*sm); ctx.lineTo(cx - 7*sm, cy - 11*sm); ctx.lineTo(cx - 2*sm, cy - 7*sm); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx + 5*sm, cy - 6*sm); ctx.lineTo(cx + 7*sm, cy - 11*sm); ctx.lineTo(cx + 2*sm, cy - 7*sm); ctx.closePath(); ctx.fill();
      // eyes — drunken = X eyes
      if (o.variant === 'drunken') {
        ctx.strokeStyle = '#ff3355';
        ctx.lineWidth = 1.4 * sm;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - 4.5*sm, cy - 2*sm); ctx.lineTo(cx - 1.5*sm, cy + 0.5*sm);
        ctx.moveTo(cx - 4.5*sm, cy + 0.5*sm); ctx.lineTo(cx - 1.5*sm, cy - 2*sm);
        ctx.moveTo(cx + 1.5*sm, cy - 2*sm); ctx.lineTo(cx + 4.5*sm, cy + 0.5*sm);
        ctx.moveTo(cx + 1.5*sm, cy + 0.5*sm); ctx.lineTo(cx + 4.5*sm, cy - 2*sm);
        ctx.stroke();
        ctx.lineCap = 'butt';
      } else {
        ctx.fillStyle = '#ff3355';
        ctx.beginPath(); ctx.arc(cx - 3 * sm, cy - 1 * sm, 1.3 * sm, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 3 * sm, cy - 1 * sm, 1.3 * sm, 0, Math.PI * 2); ctx.fill();
      }
      // tooth
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx - 1 * sm, cy + 2 * sm, 2 * sm, 2 * sm);
      ctx.restore();
    },
    hitbox(o) { return { x: o.x + 8, y: o.y + 4, w: o.w - 16, h: o.h - 8 }; },
  });

  defineBehavior('saw', {
    spawn(env) {
      // variants: normal / giant / mini
      const v = Math.random();
      const r = v < 0.55 ? 22 : (v < 0.85 ? 30 : 14);
      const spinMul = r === 14 ? 1.6 : (r === 30 ? 0.7 : 1);
      const w = r * 2, h = r * 2;
      return [{ kind: 'saw', x: env.W + 20, y: groundTop(env) - h, w, h, rot: 0, spinMul }];
    },
    update(o, env) { o.rot += (0.25 + env.speed * 0.02) * (o.spinMul || 1); },
    draw(ctx, o) {
      const cx = o.x + o.w/2, cy = o.y + o.h/2, r = o.w/2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(o.rot);
      ctx.fillStyle = '#dde2ea';
      const teeth = 10;
      ctx.beginPath();
      for (let i = 0; i < teeth; i++) {
        const a0 = (i / teeth) * Math.PI * 2;
        const a1 = ((i + 0.5) / teeth) * Math.PI * 2;
        ctx.lineTo(Math.cos(a0) * r, Math.sin(a0) * r);
        ctx.lineTo(Math.cos(a1) * (r - 6), Math.sin(a1) * (r - 6));
      }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#3a4050';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      const grd = ctx.createRadialGradient(0, 0, 2, 0, 0, r - 4);
      grd.addColorStop(0, '#ffe070');
      grd.addColorStop(0.5, '#c08020');
      grd.addColorStop(1, '#503010');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(0, 0, r - 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#222';
      ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const a = (i / 3) * Math.PI * 2;
        ctx.moveTo(Math.cos(a) * 4, Math.sin(a) * 4);
        ctx.lineTo(Math.cos(a) * (r - 8), Math.sin(a) * (r - 8));
        ctx.stroke();
      }
      ctx.restore();
      ctx.fillStyle = 'rgba(255,220,120,0.8)';
      for (let i = 0; i < 3; i++) {
        const a = o.rot * 2 + i * 1.7;
        const sx = cx + Math.cos(a) * (r + 4);
        const sy = cy + Math.sin(a) * (r + 4);
        ctx.fillRect(sx, sy, 2, 2);
      }
    },
    hitbox(o) { return { x: o.x + 4, y: o.y + 4, w: o.w - 8, h: o.h - 8 }; },
  });

  defineBehavior('rocket', {
    spawn(env) {
      // variants: normal / fast (sleek) / heavy (big slow)
      const v = Math.random();
      const flyY = env.GROUND_Y - 70 + Math.random() * 50;
      if (v < 0.55) {
        return [{ kind: 'rocket', x: env.W + 30, y: flyY, w: 44, h: 14, extraSpeed: 3 + Math.random() * 2 }];
      } else if (v < 0.85) {
        return [{ kind: 'rocket', x: env.W + 30, y: flyY, w: 38, h: 11, extraSpeed: 5.5 + Math.random() * 2, variant: 'fast' }];
      } else {
        return [{ kind: 'rocket', x: env.W + 30, y: flyY, w: 58, h: 18, extraSpeed: 1.8 + Math.random() * 1.2, variant: 'heavy' }];
      }
    },
    update(o) { o.x -= o.extraSpeed; },
    draw(ctx, o) {
      const cx = o.x + o.w/2, cy = o.y + o.h/2;
      const trailLen = 26;
      const trail = ctx.createLinearGradient(o.x + o.w, cy, o.x + o.w + trailLen, cy);
      trail.addColorStop(0, 'rgba(255,200,80,0.9)');
      trail.addColorStop(0.5, 'rgba(255,80,40,0.6)');
      trail.addColorStop(1, 'rgba(255,80,40,0)');
      ctx.fillStyle = trail;
      ctx.beginPath();
      ctx.moveTo(o.x + o.w, cy - 4);
      ctx.lineTo(o.x + o.w + trailLen, cy);
      ctx.lineTo(o.x + o.w, cy + 4);
      ctx.closePath(); ctx.fill();
      const grd = ctx.createLinearGradient(o.x, cy, o.x + o.w, cy);
      grd.addColorStop(0, '#dde2ea');
      grd.addColorStop(1, '#5a6070');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.moveTo(o.x, cy);
      ctx.lineTo(o.x + 8, o.y);
      ctx.lineTo(o.x + o.w - 4, o.y);
      ctx.lineTo(o.x + o.w, o.y + 3);
      ctx.lineTo(o.x + o.w, o.y + o.h - 3);
      ctx.lineTo(o.x + o.w - 4, o.y + o.h);
      ctx.lineTo(o.x + 8, o.y + o.h);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#101418'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#a02020';
      ctx.beginPath();
      ctx.moveTo(o.x + o.w - 6, o.y - 3);
      ctx.lineTo(o.x + o.w + 2, o.y);
      ctx.lineTo(o.x + o.w, o.y + 4);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(o.x + o.w - 6, o.y + o.h + 3);
      ctx.lineTo(o.x + o.w + 2, o.y + o.h);
      ctx.lineTo(o.x + o.w, o.y + o.h - 4);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#80c0ff';
      ctx.beginPath(); ctx.arc(o.x + 14, cy, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ff3030';
      ctx.beginPath(); ctx.arc(o.x + 1, cy, 1.5, 0, Math.PI*2); ctx.fill();
    },
    hitbox(o) { return { x: o.x + 4, y: o.y + 2, w: o.w - 8, h: o.h - 4 }; },
  });

  defineBehavior('hover', {
    spawn(env) {
      // variants: normal / diver (deep dip) / glider (high+gentle)
      const v = Math.random();
      let baseY, amp, variant;
      if (v < 0.55) { baseY = env.GROUND_Y - 40; amp = 36 + Math.random() * 16; variant = 'normal'; }
      else if (v < 0.85) { baseY = env.GROUND_Y - 50; amp = 50 + Math.random() * 12; variant = 'diver'; }
      else { baseY = env.GROUND_Y - 60; amp = 16 + Math.random() * 8; variant = 'glider'; }
      return [{
        kind: 'hover', x: env.W + 20, y: baseY,
        w: 36, h: 22, baseY, amp,
        phase: Math.random() * Math.PI * 2, spinPhase: 0, variant,
      }];
    },
    update(o) {
      o.phase += 0.06;
      o.spinPhase += 0.4;
      o.y = o.baseY + Math.sin(o.phase) * o.amp;
    },
    draw(ctx, o) {
      const cx = o.x + o.w/2, cy = o.y + o.h/2;
      const thrustY = cy + 10;
      const glow = ctx.createRadialGradient(cx, thrustY, 1, cx, thrustY, 16);
      glow.addColorStop(0, 'rgba(120,220,255,0.55)');
      glow.addColorStop(1, 'rgba(120,220,255,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(cx, thrustY, 16, 0, Math.PI*2); ctx.fill();
      const bg = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.h);
      bg.addColorStop(0, '#dde2ea');
      bg.addColorStop(1, '#5a6070');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.ellipse(cx, cy, o.w/2, o.h/2, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#101418'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = 'rgba(120,220,255,0.7)';
      ctx.beginPath(); ctx.ellipse(cx, cy - 3, o.w/3, o.h/3, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#101418'; ctx.stroke();
      const rotorY = cy - 1;
      const rotL = o.x - 2, rotR = o.x + o.w + 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      const sp = Math.cos(o.spinPhase) * 6;
      ctx.beginPath();
      ctx.moveTo(rotL - 6, rotorY); ctx.lineTo(rotL + 6, rotorY);
      ctx.moveTo(rotL, rotorY - sp/3); ctx.lineTo(rotL, rotorY + sp/3);
      ctx.moveTo(rotR - 6, rotorY); ctx.lineTo(rotR + 6, rotorY);
      ctx.moveTo(rotR, rotorY - sp/3); ctx.lineTo(rotR, rotorY + sp/3);
      ctx.stroke();
      ctx.fillStyle = '#202028';
      ctx.beginPath(); ctx.arc(rotL, rotorY, 2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(rotR, rotorY, 2, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ff3030';
      ctx.beginPath(); ctx.arc(cx, cy - 3, 1.5, 0, Math.PI*2); ctx.fill();
    },
    hitbox(o) { return { x: o.x + 4, y: o.y + 3, w: o.w - 8, h: o.h - 6 }; },
  });

  defineBehavior('faller', {
    spawn(env) {
      const top = groundTop(env);
      // variants: normal / fast / heavy
      const v = Math.random();
      let w, h, gravMul;
      if (v < 0.55) { w = 26; h = 24; gravMul = 1; }
      else if (v < 0.85) { w = 22; h = 20; gravMul = 1.5; }
      else { w = 32; h = 30; gravMul = 0.85; }
      return [{
        kind: 'faller', x: env.W + 20, y: -40, targetY: top - h,
        w, h, vy: 0, landed: false, bounce: 0, gravMul,
      }];
    },
    update(o) {
      if (!o.landed) {
        o.vy += 0.5 * (o.gravMul || 1); o.y += o.vy;
        if (o.y >= o.targetY) {
          o.y = o.targetY; o.landed = true; o.bounce = 6;
        }
      } else if (o.bounce > 0) {
        o.bounce -= 0.5;
      }
    },
    draw(ctx, o) {
      const cx = o.x + o.w/2, cy = o.y + o.h/2;
      if (!o.landed) {
        ctx.strokeStyle = 'rgba(180,180,200,0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(cx, 0); ctx.lineTo(cx, o.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      const sy = 1 - Math.max(0, o.bounce) * 0.05;
      const sx = 1 + Math.max(0, o.bounce) * 0.08;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(sx, sy);
      ctx.translate(-cx, -cy);
      const grd = ctx.createRadialGradient(cx - 4, cy - 4, 1, cx, cy, o.w/2);
      grd.addColorStop(0, '#888'); grd.addColorStop(0.6, '#3a3a48'); grd.addColorStop(1, '#0a0a14');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(cx, cy, o.w/2, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#2a2a3a';
      const spikes = 8;
      for (let i = 0; i < spikes; i++) {
        const a = (i / spikes) * Math.PI * 2;
        const x1 = cx + Math.cos(a) * (o.w/2);
        const y1 = cy + Math.sin(a) * (o.w/2);
        const x2 = cx + Math.cos(a) * (o.w/2 + 4);
        const y2 = cy + Math.sin(a) * (o.w/2 + 4);
        ctx.beginPath();
        ctx.moveTo(x1 - Math.sin(a) * 2, y1 + Math.cos(a) * 2);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x1 + Math.sin(a) * 2, y1 - Math.cos(a) * 2);
        ctx.closePath(); ctx.fill();
      }
      const blink = Math.floor(Date.now() / 200) % 2;
      ctx.fillStyle = blink ? '#ff3030' : '#400000';
      ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    },
    hitbox(o) {
      if (o.y < -20) return { x: -1000, y: -1000, w: 1, h: 1 };
      return { x: o.x + 2, y: o.y + 2, w: o.w - 4, h: o.h - 4 };
    },
  });

  defineBehavior('wall', {
    spawn(env) {
      const top = groundTop(env);
      // variants: normal / tall / short
      const v = Math.random();
      const h = v < 0.5 ? (70 + Math.random() * 20)
              : v < 0.8 ? (95 + Math.random() * 16)
              : (50 + Math.random() * 12);
      const w = v < 0.5 ? 28 : (v < 0.8 ? 32 : 24);
      return [{ kind: 'wall', x: env.W + 20, y: top - h, w, h }];
    },
    draw(ctx, o) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(o.x + o.w/2, o.y + o.h, o.w/1.6, 3, 0, 0, Math.PI*2);
      ctx.fill();
      const grd = ctx.createLinearGradient(o.x, o.y, o.x + o.w, o.y);
      grd.addColorStop(0, '#3a3030');
      grd.addColorStop(0.5, '#7a6a60');
      grd.addColorStop(1, '#2a2020');
      ctx.fillStyle = grd;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = '#9a8a80';
      ctx.fillRect(o.x - 2, o.y, o.w + 4, 6);
      ctx.fillStyle = '#3a3030';
      ctx.fillRect(o.x - 2, o.y + 5, o.w + 4, 1);
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 1;
      for (let y = 12; y < o.h - 6; y += 12) {
        ctx.beginPath();
        ctx.moveTo(o.x, o.y + y);
        ctx.lineTo(o.x + o.w, o.y + y);
        ctx.stroke();
      }
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = '#ff7090';
      ctx.beginPath(); ctx.arc(o.x + o.w/2, o.y + o.h/2, 3, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(255,180,200,0.5)';
      ctx.beginPath(); ctx.arc(o.x + o.w/2, o.y + o.h/2, 6, 0, Math.PI*2); ctx.fill();
    },
    hitbox(o) { return { x: o.x + 2, y: o.y + 2, w: o.w - 4, h: o.h - 2 }; },
  });

  defineBehavior('tower', {
    spawn(env) {
      const top = groundTop(env);
      // variants: normal / mega / short
      const v = Math.random();
      let h, w;
      if (v < 0.55) { h = 160 + Math.random() * 30; w = 26; }
      else if (v < 0.85) { h = 200 + Math.random() * 28; w = 30; }
      else { h = 130 + Math.random() * 18; w = 22; }
      return [{ kind: 'tower', x: env.W + 20, y: top - h, w, h, glow: Math.random() * Math.PI * 2 }];
    },
    update(o) { o.glow += 0.08; },
    draw(ctx, o) {
      const grd = ctx.createLinearGradient(o.x, o.y, o.x + o.w, o.y);
      grd.addColorStop(0, '#0a0a18');
      grd.addColorStop(0.5, '#3a2055');
      grd.addColorStop(1, '#0a0a18');
      ctx.fillStyle = grd;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = '#160820'; ctx.lineWidth = 1.5;
      ctx.strokeRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      for (let y = 30; y < o.h - 12; y += 30) {
        ctx.beginPath();
        ctx.moveTo(o.x, o.y + y);
        ctx.lineTo(o.x + o.w, o.y + y);
        ctx.stroke();
      }
      const cx = o.x + o.w/2, cy = o.y - 6;
      const pulse = 0.5 + Math.sin(o.glow) * 0.5;
      const halo = ctx.createRadialGradient(cx, cy, 1, cx, cy, 18);
      halo.addColorStop(0, `rgba(180,90,255,${0.4 + pulse * 0.3})`);
      halo.addColorStop(1, 'rgba(180,90,255,0)');
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#d080ff';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 7); ctx.lineTo(cx + 5, cy);
      ctx.lineTo(cx, cy + 6); ctx.lineTo(cx - 5, cy);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.ellipse(cx, o.y + o.h, o.w/1.4, 4, 0, 0, Math.PI*2);
      ctx.fill();
    },
    hitbox(o) { return { x: o.x + 2, y: o.y + 2, w: o.w - 4, h: o.h - 2 }; },
  });

  // ============================================================
  // Aurora — frozen tundra
  // ============================================================

  defineBehavior('iceShard', {
    spawn(env) {
      const top = groundTop(env);
      // variants: normal / jumbo / sliver
      const v = Math.random();
      let w, h;
      if (v < 0.55) { w = 18; h = 38; }
      else if (v < 0.85) { w = 26; h = 50; }
      else { w = 12; h = 28; }
      return [{
        kind: 'iceShard', x: env.W + 20, y: -50, targetY: top - h,
        w, h, vy: 0, landed: false, twinkle: 0,
      }];
    },
    update(o) {
      if (!o.landed) {
        o.vy += 0.55;
        o.y += o.vy;
        if (o.y >= o.targetY) { o.y = o.targetY; o.landed = true; }
      }
      o.twinkle += 0.2;
    },
    draw(ctx, o) {
      if (!o.landed) {
        ctx.strokeStyle = 'rgba(160,220,255,0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(o.x + o.w/2, 0);
        ctx.lineTo(o.x + o.w/2, o.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      const cx = o.x + o.w/2;
      if (o.landed) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(cx, o.y + o.h - 1, o.w/2, 3, 0, 0, Math.PI*2);
        ctx.fill();
      }
      const grd = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.h);
      grd.addColorStop(0, '#e8fbff');
      grd.addColorStop(0.5, '#80c8e8');
      grd.addColorStop(1, '#2880b0');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.moveTo(o.x, o.y);
      ctx.lineTo(o.x + o.w, o.y);
      ctx.lineTo(o.x + o.w/2 + 1, o.y + o.h);
      ctx.lineTo(o.x + o.w/2 - 1, o.y + o.h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0a4870';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.moveTo(o.x + 4, o.y + 3);
      ctx.lineTo(o.x + o.w/2 - 2, o.y + 3);
      ctx.lineTo(o.x + o.w/2 - 1, o.y + o.h - 6);
      ctx.lineTo(o.x + 5, o.y + o.h - 12);
      ctx.closePath();
      ctx.fill();
      const tw = (Math.sin(o.twinkle) + 1) / 2;
      ctx.fillStyle = `rgba(255,255,255,${tw})`;
      ctx.fillRect(cx - 1, o.y + 6, 1.5, 1.5);
      ctx.fillRect(o.x + 2, o.y + 18, 1, 1);
    },
    hitbox(o) {
      if (o.y < -20) return { x: -1000, y: -1000, w: 1, h: 1 };
      return { x: o.x + 3, y: o.y + 4, w: o.w - 6, h: o.h - 6 };
    },
  });

  defineBehavior('glacier', {
    spawn(env) {
      const top = groundTop(env);
      // variants: normal / mega / mini
      const v = Math.random();
      let h, w;
      if (v < 0.55) { h = 70 + Math.random() * 30; w = 36 + Math.random() * 14; }
      else if (v < 0.85) { h = 95 + Math.random() * 20; w = 50 + Math.random() * 12; }
      else { h = 45 + Math.random() * 12; w = 28 + Math.random() * 8; }
      return [{ kind: 'glacier', x: env.W + 20, y: top - h, w, h, t: 0 }];
    },
    update(o) { o.t += 0.05; },
    draw(ctx, o) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(o.x + o.w/2, o.y + o.h, o.w/1.6, 3, 0, 0, Math.PI*2);
      ctx.fill();
      const grd = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.h);
      grd.addColorStop(0, '#e8fbff');
      grd.addColorStop(0.5, '#88c8ec');
      grd.addColorStop(1, '#1a4870');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.moveTo(o.x, o.y + o.h);
      ctx.lineTo(o.x + 6, o.y + 12);
      ctx.lineTo(o.x + 12, o.y + 4);
      ctx.lineTo(o.x + o.w/2 - 4, o.y);
      ctx.lineTo(o.x + o.w/2 + 4, o.y + 8);
      ctx.lineTo(o.x + o.w - 12, o.y + 2);
      ctx.lineTo(o.x + o.w - 4, o.y + 14);
      ctx.lineTo(o.x + o.w, o.y + o.h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0a3858';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.moveTo(o.x + 8, o.y + 14);
      ctx.lineTo(o.x + 14, o.y + 6);
      ctx.lineTo(o.x + 12, o.y + 30);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(o.x + o.w - 12, o.y + 6);
      ctx.lineTo(o.x + o.w - 8, o.y + 18);
      ctx.lineTo(o.x + o.w - 14, o.y + 26);
      ctx.closePath(); ctx.fill();
      const tw = (Math.sin(o.t * 4) + 1) / 2;
      ctx.fillStyle = `rgba(220,250,255,${0.4 + tw * 0.5})`;
      ctx.fillRect(o.x + o.w/2 - 1, o.y + 4, 1.5, 1.5);
      ctx.fillRect(o.x + 18, o.y + 22, 1, 1);
    },
    hitbox(o) { return { x: o.x + 4, y: o.y + 4, w: o.w - 8, h: o.h - 4 }; },
  });

  // ============================================================
  // Nexus — cyber realm
  // ============================================================

  defineBehavior('laserGate', {
    spawn(env) {
      const top = groundTop(env);
      // variants: normal / wide / high (must double-jump)
      const v = Math.random();
      const beamH = 14;
      let beamW, beamY;
      if (v < 0.55) { beamW = 80;  beamY = top - 30 - beamH/2; }
      else if (v < 0.85) { beamW = 120; beamY = top - 30 - beamH/2; }
      else { beamW = 80; beamY = top - 60 - beamH/2; }
      return [{ kind: 'laserGate', x: env.W + 30, y: beamY, w: beamW, h: beamH, t: 0 }];
    },
    update(o) { o.t += 0.3; },
    draw(ctx, o) {
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(o.x - 4, o.y - 4, 8, o.h + 8);
      ctx.fillRect(o.x + o.w - 4, o.y - 4, 8, o.h + 8);
      ctx.strokeStyle = '#80f0ff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(o.x - 4, o.y - 4, 8, o.h + 8);
      ctx.strokeRect(o.x + o.w - 4, o.y - 4, 8, o.h + 8);
      const pulse = 0.5 + Math.sin(o.t) * 0.5;
      ctx.fillStyle = `rgba(255,80,200,${0.7 + pulse * 0.3})`;
      ctx.beginPath(); ctx.arc(o.x, o.y + o.h/2, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(o.x + o.w, o.y + o.h/2, 3, 0, Math.PI*2); ctx.fill();
      const cy = o.y + o.h/2;
      const beamGrd = ctx.createLinearGradient(0, o.y, 0, o.y + o.h);
      beamGrd.addColorStop(0, 'rgba(255,80,200,0)');
      beamGrd.addColorStop(0.5, `rgba(255,80,200,${0.7 + pulse * 0.3})`);
      beamGrd.addColorStop(1, 'rgba(255,80,200,0)');
      ctx.fillStyle = beamGrd;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(o.x, cy);
      ctx.lineTo(o.x + o.w, cy);
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const fx = o.x + ((i * 17 + Math.floor(o.t * 8)) % o.w);
        ctx.fillStyle = `rgba(255,180,255,${pulse})`;
        ctx.fillRect(fx, cy - 1, 1.5, 2);
      }
    },
    hitbox(o) { return { x: o.x, y: o.y + 2, w: o.w, h: o.h - 4 }; },
  });

  defineBehavior('drone', {
    spawn(env) {
      // variants: normal / sniper (fast straight) / tank (big slow)
      const v = Math.random();
      let amp, extraSpeed, sm, baseY;
      if (v < 0.55) { baseY = env.GROUND_Y - 80; amp = 20 + Math.random() * 25; extraSpeed = 1.5; sm = 1; }
      else if (v < 0.85) { baseY = env.GROUND_Y - 70; amp = 8;  extraSpeed = 3.2; sm = 0.85; }
      else { baseY = env.GROUND_Y - 80; amp = 32; extraSpeed = 1; sm = 1.25; }
      return [{
        kind: 'drone', x: env.W + 20, y: baseY,
        w: 32 * sm, h: 22 * sm, baseY, amp,
        phase: Math.random() * Math.PI * 2,
        extraSpeed,
        t: 0,
        sm,
      }];
    },
    update(o) {
      o.phase += 0.08;
      o.t += 0.3;
      o.y = o.baseY + Math.sin(o.phase) * o.amp;
      o.x -= o.extraSpeed;
    },
    draw(ctx, o) {
      const cx = o.x + o.w/2, cy = o.y + o.h/2;
      const trail = ctx.createLinearGradient(o.x + o.w, cy, o.x + o.w + 18, cy);
      trail.addColorStop(0, 'rgba(255,80,255,0.6)');
      trail.addColorStop(1, 'rgba(255,80,255,0)');
      ctx.fillStyle = trail;
      ctx.fillRect(o.x + o.w, cy - 2, 18, 4);
      const grd = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.h);
      grd.addColorStop(0, '#202838');
      grd.addColorStop(1, '#0a0a18');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.moveTo(o.x, cy);
      ctx.lineTo(o.x + 8, o.y);
      ctx.lineTo(o.x + o.w - 4, o.y);
      ctx.lineTo(o.x + o.w, cy);
      ctx.lineTo(o.x + o.w - 4, o.y + o.h);
      ctx.lineTo(o.x + 8, o.y + o.h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#80f0ff';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      const pulse = 0.5 + Math.sin(o.t) * 0.5;
      ctx.fillStyle = `rgba(255,80,200,${0.7 + pulse * 0.3})`;
      ctx.fillRect(o.x + 8, cy - 1, o.w - 16, 2);
      const thrust = ctx.createRadialGradient(cx, cy + 8, 1, cx, cy + 8, 9);
      thrust.addColorStop(0, 'rgba(255,80,255,0.7)');
      thrust.addColorStop(1, 'rgba(255,80,255,0)');
      ctx.fillStyle = thrust;
      ctx.beginPath(); ctx.arc(cx, cy + 8, 9, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#80f0ff';
      ctx.beginPath(); ctx.arc(o.x + o.w - 6, cy, 1.5, 0, Math.PI*2); ctx.fill();
    },
    hitbox(o) { return { x: o.x + 6, y: o.y + 4, w: o.w - 12, h: o.h - 8 }; },
  });

  // ============================================================
  // Genesis — cosmic finale
  // ============================================================

  defineBehavior('meteor', {
    spawn(env) {
      const top = groundTop(env);
      // variants: normal / giant / shrapnel (small fast)
      const v = Math.random();
      let w, h, gm;
      if (v < 0.55) { w = 38; h = 32; gm = 1; }
      else if (v < 0.85) { w = 52; h = 44; gm = 0.85; }
      else { w = 26; h = 22; gm = 1.4; }
      return [{
        kind: 'meteor', x: env.W + 40, y: -60, targetY: top - h,
        w, h, vy: 0, landed: false, t: 0, smoke: 0, gravMul: gm,
      }];
    },
    update(o) {
      o.t += 0.3;
      if (!o.landed) {
        o.vy += 0.55 * (o.gravMul || 1);
        o.y += o.vy;
        if (o.y >= o.targetY) {
          o.y = o.targetY;
          o.landed = true;
          o.smoke = 1;
        }
      }
      if (o.smoke > 0) o.smoke = Math.max(0, o.smoke - 0.02);
    },
    draw(ctx, o) {
      const cx = o.x + o.w/2, cy = o.y + o.h/2;
      if (!o.landed) {
        const trail = ctx.createLinearGradient(cx, o.y - 30, cx, o.y);
        trail.addColorStop(0, 'rgba(255,160,40,0)');
        trail.addColorStop(1, 'rgba(255,80,20,0.8)');
        ctx.fillStyle = trail;
        ctx.beginPath();
        ctx.moveTo(cx - 6, o.y);
        ctx.lineTo(cx, o.y - 30);
        ctx.lineTo(cx + 6, o.y);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.ellipse(cx, o.y + o.h, o.w/1.4, 4, 0, 0, Math.PI*2);
        ctx.fill();
      }
      const grd = ctx.createRadialGradient(cx - 6, cy - 4, 1, cx, cy, o.w/2);
      grd.addColorStop(0, '#ff8040');
      grd.addColorStop(0.4, '#a04020');
      grd.addColorStop(1, '#200810');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, o.w/2, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#3a1010';
      ctx.beginPath(); ctx.arc(cx - 4, cy + 2, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 5, cy - 3, 2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 2, cy + 6, 1.8, 0, Math.PI*2); ctx.fill();
      const pulse = 0.5 + Math.sin(o.t) * 0.5;
      ctx.strokeStyle = `rgba(255,140,40,${0.5 + pulse * 0.4})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(o.x + 6, cy + 2);
      ctx.lineTo(cx, cy - 1);
      ctx.lineTo(o.x + o.w - 6, cy + 4);
      ctx.stroke();
      if (o.smoke > 0) {
        ctx.fillStyle = `rgba(120,120,140,${o.smoke * 0.4})`;
        for (let i = 0; i < 3; i++) {
          const dx = (i - 1) * 8;
          ctx.beginPath();
          ctx.arc(cx + dx, o.y - 4 - (1 - o.smoke) * 10, 4 + (1 - o.smoke) * 3, 0, Math.PI*2);
          ctx.fill();
        }
      }
    },
    hitbox(o) {
      if (o.y < -20) return { x: -1000, y: -1000, w: 1, h: 1 };
      return { x: o.x + 4, y: o.y + 4, w: o.w - 8, h: o.h - 8 };
    },
  });

  // ============================================================
  // Mirage — desert
  // ============================================================

  defineBehavior('cactus', {
    spawn(env) {
      const top = groundTop(env);
      // variants: tall slim / armed / stubby
      const v = Math.random();
      let h, w, hasArm;
      if (v < 0.5) { h = 50 + Math.random() * 16; w = 16; hasArm = false; }
      else if (v < 0.85) { h = 60 + Math.random() * 12; w = 18; hasArm = true; }
      else { h = 38 + Math.random() * 8; w = 24; hasArm = false; }
      return [{ kind: 'cactus', x: env.W + 20, y: top - h, w, h, hasArm, t: 0 }];
    },
    update(o) { o.t += 0.1; },
    draw(ctx, o) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(o.x + o.w/2, o.y + o.h, o.w/1.4, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      const grd = ctx.createLinearGradient(o.x, 0, o.x + o.w, 0);
      grd.addColorStop(0, '#1a4818');
      grd.addColorStop(0.5, '#5aa830');
      grd.addColorStop(1, '#1a4818');
      ctx.fillStyle = grd;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = '#0a3008';
      ctx.lineWidth = 0.8;
      for (let i = 1; i < 4; i++) {
        const lx = o.x + (i / 4) * o.w;
        ctx.beginPath();
        ctx.moveTo(lx, o.y + 4);
        ctx.lineTo(lx, o.y + o.h - 4);
        ctx.stroke();
      }
      ctx.fillStyle = '#fff8c0';
      const spineRows = Math.floor(o.h / 8);
      for (let i = 0; i < spineRows; i++) {
        const sy = o.y + 6 + i * 8;
        ctx.fillRect(o.x - 1.5, sy, 1.5, 1);
        ctx.fillRect(o.x + o.w, sy, 1.5, 1);
      }
      if (o.hasArm) {
        const armW = o.w * 0.7, armH = 12;
        const armBase = o.y + o.h * 0.4;
        ctx.fillStyle = grd;
        ctx.fillRect(o.x + o.w, armBase, armW, armH);
        ctx.fillRect(o.x + o.w + armW - armH, armBase - 14, armH, 14);
        ctx.strokeStyle = '#0a3008';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(o.x + o.w, armBase, armW, armH);
        ctx.strokeRect(o.x + o.w + armW - armH, armBase - 14, armH, 14);
      }
      ctx.fillStyle = '#ff5070';
      ctx.beginPath();
      ctx.arc(o.x + o.w/2, o.y + 1, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd060';
      ctx.beginPath();
      ctx.arc(o.x + o.w/2, o.y + 1, 1.4, 0, Math.PI * 2);
      ctx.fill();
    },
    hitbox(o) {
      return { x: o.x + 2, y: o.y + 2, w: o.w - 4, h: o.h - 2 };
    },
  });

  defineBehavior('sandTwister', {
    spawn(env) {
      const top = groundTop(env);
      // variants: normal / tall / wide
      const v = Math.random();
      let h, w;
      if (v < 0.55) { h = 80 + Math.random() * 16; w = 32; }
      else if (v < 0.85) { h = 110 + Math.random() * 18; w = 34; }
      else { h = 70 + Math.random() * 10; w = 44; }
      return [{ kind: 'sandTwister', x: env.W + 20, y: top - h, w, h, t: 0 }];
    },
    update(o) { o.t += 0.3; },
    draw(ctx, o) {
      const cx = o.x + o.w/2;
      for (let i = 0; i < 5; i++) {
        const ratio = i / 5;
        const ringY = o.y + ratio * o.h;
        const ringW = o.w * (0.4 + ratio * 0.6);
        const offset = Math.sin(o.t + ratio * 4) * 4;
        const grd = ctx.createLinearGradient(cx - ringW/2, 0, cx + ringW/2, 0);
        grd.addColorStop(0, 'rgba(255,200,120,0)');
        grd.addColorStop(0.5, `rgba(220,180,100,${0.4 + ratio * 0.2})`);
        grd.addColorStop(1, 'rgba(255,200,120,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.ellipse(cx + offset, ringY + 6, ringW/2, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,220,150,0.7)';
      for (let i = 0; i < 8; i++) {
        const a = o.t * 2 + i * 0.8;
        const ratio = (i / 8 + (o.t * 0.05) % 1) % 1;
        const px = cx + Math.cos(a) * o.w * (0.2 + ratio * 0.4);
        const py = o.y + ratio * o.h;
        ctx.fillRect(px, py, 1.5, 1.5);
      }
      ctx.fillStyle = 'rgba(180,140,80,0.55)';
      ctx.beginPath();
      ctx.ellipse(cx, o.y + o.h, o.w/1.6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    },
    hitbox(o) {
      return { x: o.x + 5, y: o.y + 6, w: o.w - 10, h: o.h - 10 };
    },
  });

  defineBehavior('scorpion', {
    spawn(env) {
      const top = groundTop(env);
      // variants: normal / big / tiny-fast
      const v = Math.random();
      let w, h, sm;
      if (v < 0.55) { w = 36; h = 18; sm = 1; }
      else if (v < 0.85) { w = 46; h = 22; sm = 1.25; }
      else { w = 28; h = 14; sm = 0.85; }
      return [{ kind: 'scorpion', x: env.W + 20, y: top - h, w, h, t: 0, sm }];
    },
    update(o) { o.t += 0.15; },
    draw(ctx, o) {
      const sm = o.sm || 1;
      const cx = o.x + o.w/2, cy = o.y + o.h - 4;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(cx, o.y + o.h, o.w/1.5, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      const grd = ctx.createLinearGradient(0, cy - 6 * sm, 0, cy + 4 * sm);
      grd.addColorStop(0, '#a05028');
      grd.addColorStop(1, '#3a1810');
      ctx.fillStyle = grd;
      for (let i = 0; i < 4; i++) {
        const sx = o.x + 8 * sm + i * 5 * sm;
        ctx.beginPath();
        ctx.ellipse(sx, cy, 4 * sm, 4 * sm, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // head
      ctx.fillStyle = '#a05028';
      ctx.beginPath();
      ctx.ellipse(o.x + 6 * sm, cy, 3 * sm, 3 * sm, 0, 0, Math.PI * 2);
      ctx.fill();
      // pincers
      ctx.strokeStyle = '#3a1810';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(o.x + 4 * sm, cy - 1); ctx.lineTo(o.x - 1, cy - 4 * sm);
      ctx.moveTo(o.x + 4 * sm, cy + 1); ctx.lineTo(o.x - 1, cy + 4 * sm);
      ctx.stroke();
      // tail
      const tailWave = Math.sin(o.t) * 2;
      ctx.strokeStyle = '#a05028';
      ctx.lineWidth = 3 * sm;
      ctx.beginPath();
      ctx.moveTo(o.x + o.w - 4 * sm, cy);
      ctx.quadraticCurveTo(o.x + o.w + 2 * sm, cy - 8 * sm + tailWave, o.x + o.w - 4 * sm, cy - 12 * sm + tailWave);
      ctx.stroke();
      ctx.fillStyle = '#1a0810';
      ctx.beginPath();
      ctx.arc(o.x + o.w - 4 * sm, cy - 12 * sm + tailWave, 1.8 * sm, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff3030';
      ctx.beginPath(); ctx.arc(o.x + 6 * sm, cy - 1, 0.7 * sm, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(o.x + 8 * sm, cy - 1, 0.7 * sm, 0, Math.PI * 2); ctx.fill();
    },
    hitbox(o) {
      return { x: o.x + 2, y: o.y + 4, w: o.w - 4, h: o.h - 6 };
    },
  });

  // ============================================================
  // Chronos — clockwork
  // ============================================================

  defineBehavior('gear', {
    spawn(env) {
      // variants: normal / mega / mini-fast
      const v = Math.random();
      const r = v < 0.55 ? 18 : (v < 0.85 ? 26 : 14);
      const flyY = env.GROUND_Y - 65 + Math.random() * 20;
      return [{ kind: 'gear', x: env.W + 20, y: flyY, w: r * 2, h: r * 2, rot: 0, r }];
    },
    update(o, env) { o.rot += 0.12 + env.speed * 0.01; },
    draw(ctx, o) {
      const cx = o.x + o.w/2, cy = o.y + o.h/2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(o.rot);
      const teeth = 8;
      ctx.fillStyle = '#a8a4a0';
      ctx.beginPath();
      for (let i = 0; i < teeth; i++) {
        const a0 = (i / teeth) * Math.PI * 2;
        const a1 = ((i + 0.3) / teeth) * Math.PI * 2;
        const a2 = ((i + 0.7) / teeth) * Math.PI * 2;
        const a3 = ((i + 1) / teeth) * Math.PI * 2;
        if (i === 0) ctx.moveTo(Math.cos(a0) * (o.r - 5), Math.sin(a0) * (o.r - 5));
        else ctx.lineTo(Math.cos(a0) * (o.r - 5), Math.sin(a0) * (o.r - 5));
        ctx.lineTo(Math.cos(a1) * o.r, Math.sin(a1) * o.r);
        ctx.lineTo(Math.cos(a2) * o.r, Math.sin(a2) * o.r);
        ctx.lineTo(Math.cos(a3) * (o.r - 5), Math.sin(a3) * (o.r - 5));
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#3a3a3a';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      const grd = ctx.createRadialGradient(0, 0, 1, 0, 0, o.r - 6);
      grd.addColorStop(0, '#ddd8d0');
      grd.addColorStop(1, '#5a5a55');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(0, 0, o.r - 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#1a1a1a';
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * (o.r * 0.4), Math.sin(a) * (o.r * 0.4), 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    hitbox(o) {
      return { x: o.x + 4, y: o.y + 4, w: o.w - 8, h: o.h - 8 };
    },
  });

  defineBehavior('hourglass', {
    spawn(env) {
      const top = groundTop(env);
      // variants: normal / tall / wide
      const v = Math.random();
      let w, h;
      if (v < 0.55) { w = 24; h = 50 + Math.random() * 12; }
      else if (v < 0.85) { w = 22; h = 70 + Math.random() * 12; }
      else { w = 32; h = 44 + Math.random() * 8; }
      return [{ kind: 'hourglass', x: env.W + 20, y: top - h, w, h, t: 0 }];
    },
    update(o) { o.t += 0.12; },
    draw(ctx, o) {
      const cx = o.x + o.w/2, midY = o.y + o.h/2;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(cx, o.y + o.h, o.w/1.4, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#a86028';
      ctx.fillRect(o.x - 2, o.y, o.w + 4, 4);
      ctx.fillRect(o.x - 2, o.y + o.h - 4, o.w + 4, 4);
      ctx.fillStyle = 'rgba(180,220,255,0.6)';
      ctx.beginPath();
      ctx.moveTo(o.x, o.y + 4);
      ctx.lineTo(o.x + o.w, o.y + 4);
      ctx.lineTo(cx, midY);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(o.x, o.y + o.h - 4);
      ctx.lineTo(o.x + o.w, o.y + o.h - 4);
      ctx.lineTo(cx, midY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#3a2008';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = '#ffd060';
      ctx.beginPath();
      ctx.moveTo(o.x + 2, o.y + 4);
      ctx.lineTo(o.x + o.w - 2, o.y + 4);
      ctx.lineTo(cx + 1, midY - 2);
      ctx.lineTo(cx - 1, midY - 2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(o.x + 4, o.y + o.h - 4);
      ctx.lineTo(o.x + o.w - 4, o.y + o.h - 4);
      ctx.lineTo(cx + 5, o.y + o.h - 8);
      ctx.lineTo(cx - 5, o.y + o.h - 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(cx - 0.5, midY - 1, 1, 6);
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx - 0.3, midY + Math.sin(o.t) * 2, 0.6, 1);
    },
    hitbox(o) {
      return { x: o.x + 2, y: o.y + 2, w: o.w - 4, h: o.h - 4 };
    },
  });

  defineBehavior('pendulum', {
    spawn(env) {
      // variants: normal / wide swing / fast
      const v = Math.random();
      let len, swingMul, speed;
      if (v < 0.55) { len = 90; swingMul = 0.7; speed = 0.1; }
      else if (v < 0.85) { len = 100; swingMul = 1.0; speed = 0.09; }
      else { len = 80; swingMul = 0.6; speed = 0.16; }
      return [{
        kind: 'pendulum', x: env.W + 30, y: -10, w: 24, h: len,
        pivotY: -8, swingPhase: Math.random() * Math.PI * 2,
        swingMul, speed,
      }];
    },
    update(o) { o.swingPhase += o.speed; },
    draw(ctx, o) {
      const pivotX = o.x + o.w/2;
      const pivotY = o.pivotY;
      const swingAngle = Math.sin(o.swingPhase) * o.swingMul;
      const tipX = pivotX + Math.sin(swingAngle) * o.h;
      const tipY = pivotY + Math.cos(swingAngle) * o.h;
      // pivot mount
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(pivotX - 6, pivotY - 4, 12, 8);
      ctx.fillStyle = '#888';
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 2, 0, Math.PI * 2);
      ctx.fill();
      // chain
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
      // blade
      ctx.save();
      ctx.translate(tipX, tipY);
      ctx.rotate(swingAngle);
      const grd = ctx.createLinearGradient(0, -6, 0, 14);
      grd.addColorStop(0, '#fff');
      grd.addColorStop(0.5, '#aaa');
      grd.addColorStop(1, '#333');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.quadraticCurveTo(0, 14, 14, 0);
      ctx.quadraticCurveTo(0, 4, -14, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,200,80,0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-13, 0);
      ctx.quadraticCurveTo(0, 13, 13, 0);
      ctx.stroke();
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(0, -2, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    hitbox(o) {
      const pivotX = o.x + o.w/2;
      const swingAngle = Math.sin(o.swingPhase) * o.swingMul;
      const tipX = pivotX + Math.sin(swingAngle) * o.h;
      const tipY = o.pivotY + Math.cos(swingAngle) * o.h;
      return { x: tipX - 12, y: tipY - 4, w: 24, h: 14 };
    },
  });

  // ============================================================
  // Abyss — deep sea
  // ============================================================

  defineBehavior('bubble', {
    spawn(env) {
      const top = groundTop(env);
      // variants: normal / giant slow / small fast
      const v = Math.random();
      let w, vy;
      if (v < 0.55) { w = 28; vy = -1.4 - Math.random() * 0.5; }
      else if (v < 0.85) { w = 40; vy = -0.9; }
      else { w = 18; vy = -2.2; }
      return [{
        kind: 'bubble', x: env.W + 20, y: top - w, w, h: w,
        vy, t: 0, wobble: Math.random() * Math.PI * 2,
      }];
    },
    update(o) {
      o.y += o.vy;
      o.t += 0.15;
      o.wobble += 0.18;
    },
    draw(ctx, o) {
      const cx = o.x + o.w/2, cy = o.y + o.h/2;
      const wb = Math.sin(o.wobble) * 1.5;
      const grd = ctx.createRadialGradient(cx - 4, cy - 5, 1, cx, cy, o.w/2);
      grd.addColorStop(0, 'rgba(220,250,255,0.55)');
      grd.addColorStop(0.5, 'rgba(120,200,240,0.4)');
      grd.addColorStop(1, 'rgba(40,120,180,0.25)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx + wb, cy, o.w/2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(180,240,255,0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // highlight
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.arc(cx + wb - o.w * 0.18, cy - o.h * 0.2, o.w * 0.08, 0, Math.PI * 2);
      ctx.fill();
      // shimmer
      ctx.fillStyle = 'rgba(180,240,255,0.5)';
      ctx.beginPath();
      ctx.arc(cx + wb + o.w * 0.15, cy + o.h * 0.18, o.w * 0.04, 0, Math.PI * 2);
      ctx.fill();
    },
    hitbox(o) {
      return { x: o.x + 4, y: o.y + 4, w: o.w - 8, h: o.h - 8 };
    },
  });

  defineBehavior('tentacle', {
    spawn(env) {
      const top = groundTop(env);
      // variants: normal / tall / short fat
      const v = Math.random();
      let w, h;
      if (v < 0.55) { w = 18; h = 90 + Math.random() * 25; }
      else if (v < 0.85) { w = 16; h = 120 + Math.random() * 25; }
      else { w = 24; h = 60 + Math.random() * 15; }
      return [{
        kind: 'tentacle', x: env.W + 20, y: top - h, w, h, t: 0,
      }];
    },
    update(o) { o.t += 0.12; },
    draw(ctx, o) {
      const cx = o.x + o.w/2;
      const segH = 10;
      const segs = Math.floor(o.h / segH);
      // base shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(cx, o.y + o.h, o.w / 1.4, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // wavy segments — top sways more
      for (let i = 0; i < segs; i++) {
        const ratio = i / segs;
        const wave = Math.sin(o.t + ratio * 3) * 6 * (1 - ratio);
        const segY = o.y + i * segH;
        const segCx = cx + wave;
        const segR = (o.w / 2) * (0.6 + ratio * 0.4);
        const grd = ctx.createRadialGradient(segCx - 2, segY + segH/2 - 2, 1, segCx, segY + segH/2, segR);
        grd.addColorStop(0, '#a060c0');
        grd.addColorStop(0.7, '#5a2080');
        grd.addColorStop(1, '#2a0840');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.ellipse(segCx, segY + segH/2, segR, segH * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        if (i % 2 === 0) {
          ctx.fillStyle = 'rgba(255,180,200,0.55)';
          ctx.beginPath();
          ctx.arc(segCx + segR * 0.5, segY + segH/2, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // tip glow
      const tipX = cx + Math.sin(o.t) * 6;
      const tipY = o.y + Math.sin(o.t * 0.7) * 3;
      const halo = ctx.createRadialGradient(tipX, tipY, 1, tipX, tipY, 9);
      halo.addColorStop(0, 'rgba(255,180,200,0.7)');
      halo.addColorStop(1, 'rgba(255,180,200,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 9, 0, Math.PI * 2);
      ctx.fill();
    },
    hitbox(o) {
      return { x: o.x + 4, y: o.y + 6, w: o.w - 8, h: o.h - 8 };
    },
  });

  defineBehavior('jellyfish', {
    spawn(env) {
      const baseY = env.GROUND_Y - 70 + Math.random() * 30;
      // variants: normal / big / fast-bob
      const v = Math.random();
      let w, h, bobSpeed, ampMul;
      if (v < 0.55) { w = 36; h = 28; bobSpeed = 0.08; ampMul = 1; }
      else if (v < 0.85) { w = 50; h = 38; bobSpeed = 0.06; ampMul = 0.8; }
      else { w = 30; h = 24; bobSpeed = 0.16; ampMul = 1.4; }
      return [{
        kind: 'jellyfish', x: env.W + 20, y: baseY,
        w, h, baseY, t: 0,
        phase: Math.random() * Math.PI * 2,
        bobSpeed, ampMul,
      }];
    },
    update(o) {
      o.t += 0.08;
      o.phase += o.bobSpeed;
      o.y = o.baseY + Math.sin(o.phase) * 8 * (o.ampMul || 1);
    },
    draw(ctx, o) {
      const cx = o.x + o.w/2, cy = o.y + o.h * 0.4;
      const pulse = 0.5 + Math.sin(o.t * 2) * 0.5;
      // halo
      const halo = ctx.createRadialGradient(cx, cy, 4, cx, cy, o.w);
      halo.addColorStop(0, `rgba(255,180,255,${0.3 + pulse * 0.3})`);
      halo.addColorStop(1, 'rgba(140,80,180,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, o.w, 0, Math.PI * 2);
      ctx.fill();
      // dome
      const domeR = o.w / 2 * (0.95 + pulse * 0.1);
      const grd = ctx.createRadialGradient(cx - 4, cy - 4, 1, cx, cy, domeR);
      grd.addColorStop(0, '#fff');
      grd.addColorStop(0.5, '#ff80c0');
      grd.addColorStop(1, '#a020a0');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.ellipse(cx, cy, domeR, domeR * 0.7, 0, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#400060';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // tentacles
      ctx.strokeStyle = 'rgba(255,140,220,0.75)';
      ctx.lineWidth = 1.4;
      const tCount = 5;
      for (let i = 0; i < tCount; i++) {
        const tx = cx - domeR * 0.7 + (i / (tCount - 1)) * domeR * 1.4;
        const sway = Math.sin(o.t * 2 + i) * 3;
        ctx.beginPath();
        ctx.moveTo(tx, cy);
        ctx.quadraticCurveTo(tx + sway, cy + 9, tx + sway / 2, cy + 18);
        ctx.stroke();
      }
      // eye dots
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(cx - 4, cy - 2, 1.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 4, cy - 2, 1.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a0028';
      ctx.beginPath(); ctx.arc(cx - 4, cy - 2, 0.7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 4, cy - 2, 0.7, 0, Math.PI * 2); ctx.fill();
    },
    hitbox(o) {
      return { x: o.x + 5, y: o.y + 4, w: o.w - 10, h: o.h - 12 };
    },
  });

  defineBehavior('singularity', {
    spawn(env) {
      // variants: normal / giant / mini (low altitude)
      const v = Math.random();
      let baseR, flyY;
      if (v < 0.55) { baseR = 14; flyY = env.GROUND_Y - 70; }
      else if (v < 0.85) { baseR = 20; flyY = env.GROUND_Y - 80; }
      else { baseR = 10; flyY = env.GROUND_Y - 50; }
      return [{
        kind: 'singularity', x: env.W + 30, y: flyY,
        w: baseR * 2 + 2, h: baseR * 2 + 2, t: 0, baseR,
      }];
    },
    update(o) { o.t += 0.1; },
    draw(ctx, o) {
      const cx = o.x + o.w/2, cy = o.y + o.h/2;
      const pulse = 0.5 + Math.sin(o.t * 2) * 0.5;
      const aura = ctx.createRadialGradient(cx, cy, 4, cx, cy, o.baseR + 14);
      aura.addColorStop(0, 'rgba(180,80,255,0.5)');
      aura.addColorStop(0.5, `rgba(140,40,200,${0.25 + pulse * 0.3})`);
      aura.addColorStop(1, 'rgba(40,8,80,0)');
      ctx.fillStyle = aura;
      ctx.beginPath(); ctx.arc(cx, cy, o.baseR + 14, 0, Math.PI*2); ctx.fill();
      const core = ctx.createRadialGradient(cx, cy, 1, cx, cy, o.baseR);
      core.addColorStop(0, '#000');
      core.addColorStop(0.6, '#2a0838');
      core.addColorStop(1, '#5a1080');
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(cx, cy, o.baseR, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#c050ff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const a = o.t * 3 + i * (Math.PI * 2 / 5);
        const r = o.baseR + 3 + Math.sin(o.t * 4 + i) * 4;
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;
        ctx.fillStyle = `rgba(255,180,255,${0.6 + pulse * 0.4})`;
        ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI*2); ctx.fill();
      }
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(cx, cy, 1.5, 0, Math.PI*2); ctx.fill();
    },
    hitbox(o) { return { x: o.x + 4, y: o.y + 4, w: o.w - 8, h: o.h - 8 }; },
  });

  // ---------- GROVE ----------
  defineBehavior('thornVine', {
    spawn(env) {
      const top = groundTop(env);
      const v = Math.random();
      let h, w;
      if (v < 0.5) { h = 50 + Math.random() * 12; w = 14; }
      else if (v < 0.85) { h = 70 + Math.random() * 12; w = 16; }
      else { h = 92 + Math.random() * 8; w = 18; }
      return [{ kind: 'thornVine', x: env.W + 20, y: top - h, w, h, t: 0 }];
    },
    update(o) { o.t += 0.06; },
    draw(ctx, o) {
      const cx = o.x + o.w / 2;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(cx, o.y + o.h, o.w / 1.4, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // braided body — sinuous gradient
      const grd = ctx.createLinearGradient(o.x, 0, o.x + o.w, 0);
      grd.addColorStop(0, '#1a3a18');
      grd.addColorStop(0.5, '#3a8030');
      grd.addColorStop(1, '#1a3a18');
      ctx.fillStyle = grd;
      ctx.beginPath();
      const segs = 10;
      for (let i = 0; i <= segs; i++) {
        const ratio = i / segs;
        const sway = Math.sin(o.t + ratio * 4) * 1.5;
        ctx.lineTo(cx - o.w / 2 + sway, o.y + ratio * o.h);
      }
      for (let i = segs; i >= 0; i--) {
        const ratio = i / segs;
        const sway = Math.sin(o.t + ratio * 4) * 1.5;
        ctx.lineTo(cx + o.w / 2 + sway, o.y + ratio * o.h);
      }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#0a2008';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      // thorns alternating sides
      ctx.fillStyle = '#1a0a08';
      const tn = Math.floor(o.h / 12);
      for (let i = 0; i < tn; i++) {
        const ty = o.y + 6 + i * 12;
        const sway = Math.sin(o.t + (i / tn) * 4) * 1.5;
        const side = i % 2 === 0 ? -1 : 1;
        ctx.beginPath();
        ctx.moveTo(cx + sway + side * o.w / 2, ty);
        ctx.lineTo(cx + sway + side * (o.w / 2 + 5), ty - 2);
        ctx.lineTo(cx + sway + side * (o.w / 2 + 1), ty + 3);
        ctx.closePath(); ctx.fill();
      }
      // crown leaves
      ctx.fillStyle = '#5aa830';
      ctx.beginPath();
      ctx.ellipse(cx - 4, o.y + 2, 5, 3, -0.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 4, o.y + 2, 5, 3, 0.5, 0, Math.PI * 2); ctx.fill();
      // berry tip
      ctx.fillStyle = '#ff5070';
      ctx.beginPath(); ctx.arc(cx, o.y, 2, 0, Math.PI * 2); ctx.fill();
    },
    hitbox(o) { return { x: o.x + 3, y: o.y + 4, w: o.w - 6, h: o.h - 4 }; },
  });

  defineBehavior('acornDrop', {
    spawn(env) {
      const top = groundTop(env);
      const v = Math.random();
      let w, h, gravMul;
      if (v < 0.55) { w = 18; h = 20; gravMul = 1.2; }
      else if (v < 0.85) { w = 14; h = 16; gravMul = 1.7; }
      else { w = 22; h = 24; gravMul = 1.0; }
      return [{
        kind: 'acornDrop', x: env.W + 20, y: -40, targetY: top - h,
        w, h, vy: 0, landed: false, gravMul, t: 0,
      }];
    },
    update(o) {
      o.t += 0.1;
      if (!o.landed) {
        o.vy += 0.5 * o.gravMul; o.y += o.vy;
        if (o.y >= o.targetY) { o.y = o.targetY; o.landed = true; }
      }
    },
    draw(ctx, o) {
      const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
      if (!o.landed) {
        ctx.strokeStyle = 'rgba(160,200,140,0.5)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, o.y); ctx.stroke();
        ctx.setLineDash([]);
      }
      // cap (top half, dark brown ribbed)
      ctx.fillStyle = '#3a1808';
      ctx.beginPath();
      ctx.ellipse(cx, o.y + o.h * 0.32, o.w / 2, o.h * 0.36, 0, Math.PI, 2 * Math.PI);
      ctx.fill();
      // cap texture
      ctx.fillStyle = '#5a2810';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(o.x + 2 + i * 4, o.y + 4, 1, o.h * 0.2);
      }
      // body (lower nut)
      const grd = ctx.createRadialGradient(cx - 2, cy, 1, cx, cy + 2, o.w / 2);
      grd.addColorStop(0, '#d8a060');
      grd.addColorStop(1, '#7a3010');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.ellipse(cx, o.y + o.h * 0.6, o.w * 0.45, o.h * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3a1808';
      ctx.lineWidth = 1;
      ctx.stroke();
      // stem
      ctx.strokeStyle = '#3a1808';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx, o.y + 1); ctx.lineTo(cx + Math.sin(o.t * 4) * 1.5, o.y - 4);
      ctx.stroke();
      // tip
      ctx.fillStyle = '#3a1808';
      ctx.beginPath();
      ctx.arc(cx, o.y + o.h - 1, 1.2, 0, Math.PI * 2); ctx.fill();
    },
    hitbox(o) {
      if (o.y < -20) return { x: -1000, y: -1000, w: 1, h: 1 };
      return { x: o.x + 2, y: o.y + 2, w: o.w - 4, h: o.h - 4 };
    },
  });

  defineBehavior('bramblePatch', {
    spawn(env) {
      const top = groundTop(env);
      const v = Math.random();
      let w, h;
      if (v < 0.5) { w = 36; h = 22; }
      else if (v < 0.85) { w = 50; h = 24; }
      else { w = 70; h = 18; }
      return [{ kind: 'bramblePatch', x: env.W + 20, y: top - h, w, h, t: 0 }];
    },
    update(o) { o.t += 0.05; },
    draw(ctx, o) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(o.x + o.w / 2, o.y + o.h, o.w / 1.5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // tangled vines (bezier squiggles)
      ctx.lineCap = 'round';
      const layers = 4;
      for (let L = 0; L < layers; L++) {
        ctx.strokeStyle = L === 0 ? '#1a3a18' : `rgba(${30 + L * 12},${88 + L * 16},${30 + L * 8},0.85)`;
        ctx.lineWidth = 2 - L * 0.3;
        ctx.beginPath();
        const steps = Math.max(4, Math.floor(o.w / 8));
        for (let k = 0; k <= steps; k++) {
          const x = o.x + (k / steps) * o.w;
          const y = o.y + o.h - 2 + Math.sin(o.t + L + k * 0.7) * (o.h * 0.4) - L * 1.5;
          if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // thorn pricks scattered upward
      ctx.fillStyle = '#0a1808';
      const thorns = Math.floor(o.w / 8);
      for (let i = 0; i < thorns; i++) {
        const tx = o.x + 4 + i * (o.w - 8) / Math.max(1, thorns - 1);
        const ty = o.y + 2;
        ctx.beginPath();
        ctx.moveTo(tx - 1.5, ty + 4);
        ctx.lineTo(tx, ty - 2);
        ctx.lineTo(tx + 1.5, ty + 4);
        ctx.closePath(); ctx.fill();
      }
      // small pink berries
      ctx.fillStyle = '#ff5588';
      for (let i = 0; i < Math.floor(o.w / 18); i++) {
        const bx = o.x + 6 + i * 18;
        const by = o.y + o.h * 0.4 + Math.sin(o.t * 2 + i) * 2;
        ctx.beginPath(); ctx.arc(bx, by, 1.4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.lineCap = 'butt';
    },
    hitbox(o) { return { x: o.x + 3, y: o.y + 4, w: o.w - 6, h: o.h - 4 }; },
  });

  // ---------- CRYSTAL ----------
  defineBehavior('stalactite', {
    spawn(env) {
      const top = groundTop(env);
      const v = Math.random();
      let w, h, gravMul;
      if (v < 0.55) { w = 22; h = 36; gravMul = 1.0; }
      else if (v < 0.85) { w = 28; h = 48; gravMul = 0.85; }
      else { w = 16; h = 28; gravMul = 1.4; }
      return [{
        kind: 'stalactite', x: env.W + 20, y: -50, targetY: top - h,
        w, h, vy: 0, landed: false, shatter: 0, gravMul,
      }];
    },
    update(o) {
      if (!o.landed) {
        o.vy += 0.5 * o.gravMul; o.y += o.vy;
        if (o.y >= o.targetY) { o.y = o.targetY; o.landed = true; o.shatter = 12; }
      } else if (o.shatter > 0) {
        o.shatter -= 0.5;
      }
    },
    draw(ctx, o) {
      const cx = o.x + o.w / 2;
      if (!o.landed) {
        ctx.strokeStyle = 'rgba(180,220,255,0.45)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([2, 4]);
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, o.y); ctx.stroke();
        ctx.setLineDash([]);
      }
      // crystal shape: hexagonal point-down prism
      const grd = ctx.createLinearGradient(cx - o.w / 2, 0, cx + o.w / 2, 0);
      grd.addColorStop(0, '#80c8ff');
      grd.addColorStop(0.5, '#dceeff');
      grd.addColorStop(1, '#4080c0');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.moveTo(cx, o.y + o.h);
      ctx.lineTo(cx + o.w / 2, o.y + o.h * 0.45);
      ctx.lineTo(cx + o.w / 2 - 3, o.y + 4);
      ctx.lineTo(cx - o.w / 2 + 3, o.y + 4);
      ctx.lineTo(cx - o.w / 2, o.y + o.h * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#1a4878';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // facet highlight
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.moveTo(cx - 2, o.y + 6);
      ctx.lineTo(cx, o.y + o.h * 0.7);
      ctx.lineTo(cx + 2, o.y + 8);
      ctx.closePath(); ctx.fill();
      // shatter bits
      if (o.shatter > 0) {
        ctx.fillStyle = `rgba(220,240,255,${o.shatter / 12})`;
        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * Math.PI * 2;
          const r = (12 - o.shatter) * 1.5;
          ctx.fillRect(cx + Math.cos(ang) * r, o.y + o.h - 2 + Math.sin(ang) * r * 0.3, 1.5, 1.5);
        }
      }
    },
    hitbox(o) {
      if (o.y < -30) return { x: -1000, y: -1000, w: 1, h: 1 };
      return { x: o.x + 3, y: o.y + 3, w: o.w - 6, h: o.h - 5 };
    },
  });

  defineBehavior('prismShard', {
    spawn(env) {
      const top = groundTop(env);
      const v = Math.random();
      let w, h;
      if (v < 0.5) { w = 18; h = 60; }
      else if (v < 0.85) { w = 22; h = 86; }
      else { w = 28; h = 44; }
      return [{ kind: 'prismShard', x: env.W + 20, y: top - h, w, h, t: 0 }];
    },
    update(o) { o.t += 0.08; },
    draw(ctx, o) {
      const cx = o.x + o.w / 2;
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(cx, o.y + o.h, o.w / 1.4, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // pulsing rainbow halo
      const pulse = 0.5 + Math.sin(o.t * 2) * 0.5;
      const halo = ctx.createRadialGradient(cx, o.y + o.h / 2, o.w * 0.5, cx, o.y + o.h / 2, o.w * 1.4);
      halo.addColorStop(0, `rgba(255,180,255,${0.18 + pulse * 0.18})`);
      halo.addColorStop(0.5, `rgba(180,220,255,${0.12 + pulse * 0.12})`);
      halo.addColorStop(1, 'rgba(120,80,200,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.ellipse(cx, o.y + o.h / 2, o.w * 1.4, o.h * 0.6, 0, 0, Math.PI * 2); ctx.fill();
      // prism body — split gradient (rainbow refraction)
      const grd = ctx.createLinearGradient(cx - o.w / 2, o.y, cx + o.w / 2, o.y);
      grd.addColorStop(0, '#ff80c0');
      grd.addColorStop(0.25, '#c080ff');
      grd.addColorStop(0.5, '#80d0ff');
      grd.addColorStop(0.75, '#80ffc0');
      grd.addColorStop(1, '#fff080');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.moveTo(cx, o.y);
      ctx.lineTo(cx + o.w / 2, o.y + 6);
      ctx.lineTo(cx + o.w / 2 - 2, o.y + o.h);
      ctx.lineTo(cx - o.w / 2 + 2, o.y + o.h);
      ctx.lineTo(cx - o.w / 2, o.y + 6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#3a4a78';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // facet line
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(cx, o.y + 1); ctx.lineTo(cx, o.y + o.h - 2);
      ctx.stroke();
      // top sparkle
      ctx.fillStyle = `rgba(255,255,255,${0.4 + pulse * 0.4})`;
      ctx.beginPath(); ctx.arc(cx, o.y + 2, 1.5 + pulse, 0, Math.PI * 2); ctx.fill();
      // beams
      const beams = 4;
      for (let i = 0; i < beams; i++) {
        const ba = (i / beams) * Math.PI + o.t * 0.3;
        const len = o.w * 0.7 + Math.sin(o.t * 3 + i) * 4;
        ctx.strokeStyle = `rgba(220,200,255,${0.25 + pulse * 0.25})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(cx, o.y + o.h * 0.4);
        ctx.lineTo(cx + Math.cos(ba) * len, o.y + o.h * 0.4 + Math.sin(ba) * len * 0.4);
        ctx.stroke();
      }
    },
    hitbox(o) { return { x: o.x + 3, y: o.y + 4, w: o.w - 6, h: o.h - 5 }; },
  });

  defineBehavior('crystalCluster', {
    spawn(env) {
      const top = groundTop(env);
      const v = Math.random();
      let w, h, points;
      if (v < 0.5) { w = 40; h = 26; points = 4; }
      else if (v < 0.85) { w = 56; h = 30; points = 5; }
      else { w = 70; h = 22; points = 6; }
      return [{ kind: 'crystalCluster', x: env.W + 20, y: top - h, w, h, points, t: 0 }];
    },
    update(o) { o.t += 0.05; },
    draw(ctx, o) {
      const baseY = o.y + o.h;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(o.x + o.w / 2, baseY, o.w / 1.4, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // multiple jagged crystals along base
      for (let i = 0; i < o.points; i++) {
        const ratio = i / Math.max(1, o.points - 1);
        const px = o.x + 4 + ratio * (o.w - 8);
        const ph = o.h * (0.55 + Math.sin(i * 1.3) * 0.3);
        const pw = 6 + (i % 2) * 4;
        const grd = ctx.createLinearGradient(px - pw, 0, px + pw, 0);
        grd.addColorStop(0, '#c080ff');
        grd.addColorStop(0.5, '#dccfff');
        grd.addColorStop(1, '#6040a0');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.moveTo(px, baseY - ph);
        ctx.lineTo(px + pw / 2, baseY - 3);
        ctx.lineTo(px + pw / 2, baseY);
        ctx.lineTo(px - pw / 2, baseY);
        ctx.lineTo(px - pw / 2, baseY - 3);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#3a1858';
        ctx.lineWidth = 1;
        ctx.stroke();
        // facet glint
        const glintA = 0.4 + Math.abs(Math.sin(o.t * 2 + i)) * 0.5;
        ctx.fillStyle = `rgba(255,255,255,${glintA})`;
        ctx.fillRect(px - 1, baseY - ph + 4, 1.2, ph * 0.4);
      }
    },
    hitbox(o) { return { x: o.x + 3, y: o.y + 4, w: o.w - 6, h: o.h - 5 }; },
  });

  // ---------- CATHEDRAL ----------
  defineBehavior('gargoyle', {
    spawn(env) {
      const v = Math.random();
      const startY = env.GROUND_Y - 130 - Math.random() * 20;
      let w, h, divePeriod, diveAmp;
      if (v < 0.55) { w = 36; h = 30; divePeriod = 0.06; diveAmp = 60; }
      else if (v < 0.85) { w = 48; h = 38; divePeriod = 0.05; diveAmp = 75; }
      else { w = 30; h = 24; divePeriod = 0.09; diveAmp = 50; }
      return [{
        kind: 'gargoyle', x: env.W + 20, y: startY,
        w, h, t: 0, baseY: startY, divePeriod, diveAmp, fl: 0,
      }];
    },
    update(o) {
      o.t += o.divePeriod;
      o.fl = (o.fl + 0.3) % (Math.PI * 2);
      o.y = o.baseY + Math.max(0, Math.sin(o.t)) * o.diveAmp;
    },
    draw(ctx, o) {
      const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
      const flap = Math.sin(o.fl) * 6;
      // wings
      ctx.fillStyle = '#2a2028';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(o.x - 6, cy - flap - 8, o.x - 4, cy - flap);
      ctx.quadraticCurveTo(o.x + 4, cy + 4, o.x + 8, cy + 2);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(o.x + o.w + 6, cy - flap - 8, o.x + o.w + 4, cy - flap);
      ctx.quadraticCurveTo(o.x + o.w - 4, cy + 4, o.x + o.w - 8, cy + 2);
      ctx.closePath(); ctx.fill();
      // wing membrane lines
      ctx.strokeStyle = '#1a1018';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(o.x - 2, cy - flap); ctx.lineTo(cx, cy);
      ctx.moveTo(o.x + o.w + 2, cy - flap); ctx.lineTo(cx, cy);
      ctx.stroke();
      // body — stone ridged
      const grd = ctx.createRadialGradient(cx - 3, cy - 3, 1, cx, cy, o.w / 2);
      grd.addColorStop(0, '#7a6a70');
      grd.addColorStop(0.6, '#3a3038');
      grd.addColorStop(1, '#0a0608');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.ellipse(cx, cy, o.w / 2.4, o.h / 2.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // horns
      ctx.fillStyle = '#1a1018';
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy - o.h / 2.5);
      ctx.lineTo(cx - 9, cy - o.h / 2 - 4);
      ctx.lineTo(cx - 3, cy - o.h / 2.5 + 2);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 6, cy - o.h / 2.5);
      ctx.lineTo(cx + 9, cy - o.h / 2 - 4);
      ctx.lineTo(cx + 3, cy - o.h / 2.5 + 2);
      ctx.closePath(); ctx.fill();
      // glowing eyes
      const glow = 0.6 + Math.sin(o.fl * 2) * 0.3;
      ctx.fillStyle = `rgba(255,80,40,${glow})`;
      ctx.beginPath(); ctx.arc(cx - 4, cy - 1, 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 4, cy - 1, 1.6, 0, Math.PI * 2); ctx.fill();
      // fang
      ctx.fillStyle = '#dde8f0';
      ctx.fillRect(cx - 1, cy + 3, 1, 2);
      ctx.fillRect(cx + 1, cy + 3, 1, 2);
    },
    hitbox(o) { return { x: o.x + 6, y: o.y + 4, w: o.w - 12, h: o.h - 6 }; },
  });

  defineBehavior('candelabra', {
    spawn(env) {
      const top = groundTop(env);
      const v = Math.random();
      let h, w, arms;
      if (v < 0.5) { h = 70; w = 24; arms = 3; }
      else if (v < 0.85) { h = 96; w = 28; arms = 5; }
      else { h = 54; w = 20; arms = 1; }
      return [{ kind: 'candelabra', x: env.W + 20, y: top - h, w, h, arms, t: 0 }];
    },
    update(o) { o.t += 0.15; },
    draw(ctx, o) {
      const cx = o.x + o.w / 2;
      const baseY = o.y + o.h;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(cx, baseY, o.w / 1.2, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // base
      ctx.fillStyle = '#3a2810';
      ctx.fillRect(cx - o.w / 2, baseY - 4, o.w, 4);
      ctx.fillStyle = '#5a3818';
      ctx.fillRect(cx - o.w / 2 + 2, baseY - 4, o.w - 4, 1);
      // shaft
      const shaftGrd = ctx.createLinearGradient(cx - 2, 0, cx + 2, 0);
      shaftGrd.addColorStop(0, '#3a2008');
      shaftGrd.addColorStop(0.5, '#a07020');
      shaftGrd.addColorStop(1, '#3a2008');
      ctx.fillStyle = shaftGrd;
      ctx.fillRect(cx - 2, o.y + 8, 4, o.h - 12);
      // ornament knobs
      ctx.fillStyle = '#ffd060';
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.arc(cx, o.y + 14 + k * (o.h - 24) / 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // arms (horizontal cross-bar near top)
      const armY = o.y + 8;
      const armW = (o.arms - 1) * 8 + 6;
      ctx.fillStyle = '#a07020';
      ctx.fillRect(cx - armW / 2, armY, armW, 2);
      // candles + flames per arm
      for (let i = 0; i < o.arms; i++) {
        const ax = (o.arms === 1) ? cx : cx - armW / 2 + 3 + i * (armW - 6) / Math.max(1, o.arms - 1);
        // candle wax
        ctx.fillStyle = '#fff8e0';
        ctx.fillRect(ax - 1.5, armY - 8, 3, 8);
        ctx.fillStyle = '#e0d0a0';
        ctx.fillRect(ax - 1.5, armY - 8, 1, 8);
        // wick
        ctx.fillStyle = '#1a0a04';
        ctx.fillRect(ax - 0.5, armY - 11, 1, 3);
        // flame
        const flick = 1 + Math.sin(o.t + i * 1.3) * 0.15;
        const fh = 6 * flick;
        const fg = ctx.createRadialGradient(ax, armY - 11 - fh / 2, 1, ax, armY - 11 - fh / 2, fh);
        fg.addColorStop(0, '#fff8c0');
        fg.addColorStop(0.5, '#ffb040');
        fg.addColorStop(1, 'rgba(255,80,20,0)');
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.ellipse(ax, armY - 11 - fh / 2, 2.5, fh, 0, 0, Math.PI * 2);
        ctx.fill();
        // hot core
        ctx.fillStyle = `rgba(255,240,200,${0.6 + Math.sin(o.t * 3 + i) * 0.3})`;
        ctx.beginPath();
        ctx.arc(ax, armY - 11 - fh / 3, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    hitbox(o) {
      return { x: o.x + 3, y: o.y + 6, w: o.w - 6, h: o.h - 8 };
    },
  });

  defineBehavior('organPipe', {
    spawn(env) {
      const top = groundTop(env);
      const v = Math.random();
      let pipes, h, w;
      if (v < 0.5) { pipes = 3; h = 90; w = 36; }
      else if (v < 0.85) { pipes = 4; h = 110; w = 50; }
      else { pipes = 5; h = 72; w = 60; }
      return [{ kind: 'organPipe', x: env.W + 20, y: top - h, w, h, pipes, t: 0 }];
    },
    update(o) { o.t += 0.1; },
    draw(ctx, o) {
      const baseY = o.y + o.h;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(o.x + o.w / 2, baseY, o.w / 1.3, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // back panel (gothic dark wood)
      const panelGrd = ctx.createLinearGradient(o.x, 0, o.x + o.w, 0);
      panelGrd.addColorStop(0, '#1a1018');
      panelGrd.addColorStop(0.5, '#3a2828');
      panelGrd.addColorStop(1, '#1a1018');
      ctx.fillStyle = panelGrd;
      ctx.fillRect(o.x, o.y + o.h * 0.85, o.w, o.h * 0.15);
      // pipes (each different height pyramid)
      const pipeW = (o.w - 4) / o.pipes;
      for (let i = 0; i < o.pipes; i++) {
        const px = o.x + 2 + i * pipeW;
        const ratio = (i / Math.max(1, o.pipes - 1));
        const arc = 1 - Math.abs(ratio - 0.5) * 1.5;
        const ph = o.h * (0.5 + arc * 0.4);
        const pg = ctx.createLinearGradient(px, 0, px + pipeW, 0);
        pg.addColorStop(0, '#a8a8c0');
        pg.addColorStop(0.5, '#dde0ec');
        pg.addColorStop(1, '#5a5a78');
        ctx.fillStyle = pg;
        ctx.fillRect(px + 1, baseY - ph, pipeW - 2, ph - o.h * 0.15);
        ctx.strokeStyle = '#1a1828';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(px + 1, baseY - ph, pipeW - 2, ph - o.h * 0.15);
        // pipe top opening (dark mouth)
        ctx.fillStyle = '#0a0a18';
        ctx.fillRect(px + 2, baseY - ph, pipeW - 4, 2);
        // pipe mouth slit (where sound comes)
        ctx.fillStyle = '#0a0a18';
        const mouthY = baseY - ph + (ph - o.h * 0.15) * 0.6;
        ctx.fillRect(px + 2, mouthY, pipeW - 4, 1.2);
        // glowing rune mark on mid pipe (when sound active)
        const glow = 0.4 + Math.sin(o.t + i) * 0.4;
        ctx.fillStyle = `rgba(255,180,80,${Math.max(0, glow)})`;
        ctx.beginPath();
        ctx.arc(px + pipeW / 2, mouthY - 6, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      // crown trim
      ctx.fillStyle = '#3a2810';
      ctx.fillRect(o.x, o.y, o.w, 3);
      ctx.fillStyle = '#a07020';
      ctx.fillRect(o.x + 2, o.y + 1, o.w - 4, 1);
    },
    hitbox(o) { return { x: o.x + 3, y: o.y + 4, w: o.w - 6, h: o.h - 5 }; },
  });
})();
