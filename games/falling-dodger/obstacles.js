// obstacles.js — obstacle subsystem extracted from index.html
// Spawn, update, collision live here. Rendering delegated to obstacle-draw.js.
// Instantiate via: const obstacleSys = createObstacleSystem(env)

import { createObstacleDrawer } from './obstacle-draw.js';

export function createObstacleSystem(env) {
  // Destructure env for convenience (these are live references / getters)
  const {
    ctx, W, WALL_W, CFG, rng, sign,
    player,
    getTimeMs, getScrollSpeed, getHMode,
    shouldInjectChanger,
    onChangerInjected,
    onChangerCollected,
    onChangerMissed,
    onPass,
  } = env;
  const rngInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const playMinX = WALL_W;
  const playMaxX = W - WALL_W;
  const playW = playMaxX - playMinX;
  const drawer = createObstacleDrawer({ ctx, W, getTimeMs, player });

  // Module-internal state
  let obstacles = [];
  let groupSeq = 0;
  let passedGroups = new Set();

  // ─── SPAWN FUNCTIONS ─────────────────────────────────────────────────────────

  function spawnSoloBar(y, gid) {
    const c = CFG.kinds.soloBar;
    const w = rng(c.minW, c.maxW), h = rng(c.minH, c.maxH);
    obstacles.push({ kind: 'bar', gid, x: Math.random() * (W - w), y, w, h, appear: 0 });
    return h;
  }
  function spawnSplitBar(y, gid) {
    const c = CFG.kinds.splitBar;
    const gx = c.marginMin + Math.random() * (W - 2 * c.marginMin - c.gap);
    obstacles.push({ kind: 'bar', gid, x: 0, y, w: gx, h: c.h, appear: 0 });
    obstacles.push({ kind: 'bar', gid, x: gx + c.gap, y, w: W - (gx + c.gap), h: c.h, appear: 0 });
    return c.h;
  }
  function spawnSpikeCluster(y, gid) {
    const c = CFG.kinds.spikeCluster;
    const count = rngInt(c.minCount, c.maxCount);
    const startX = Math.random() * (W - count * c.step);
    for (let i = 0; i < count; i++) {
      obstacles.push({
        kind: 'spike', gid,
        x: startX + i * c.step, y, w: c.spikeSize, h: c.spikeSize,
        spin: Math.random() * Math.PI, appear: 0
      });
    }
    return c.spikeSize;
  }
  function spawnSlider(y, gid) {
    const c = CFG.kinds.slider;
    const w = rng(c.minW, c.maxW);
    const vx = sign() * rng(c.vxMin, c.vxMax);
    obstacles.push({ kind: 'slider', gid, x: Math.random() * (W - w), y, w, h: c.h, vx, appear: 0 });
    return c.h;
  }
  function spawnBigSpike(y, gid) {
    const c = CFG.kinds.bigSpike;
    const sz = rng(c.minSize, c.maxSize);
    obstacles.push({
      kind: 'bigSpike', gid,
      x: Math.random() * (W - sz), y, w: sz, h: sz,
      spin: Math.random() * Math.PI, appear: 0
    });
    return sz;
  }
  function spawnLaser(y, gid) {
    const c = CFG.kinds.laser;
    const side = Math.random() < 0.5 ? 'L' : 'R';
    const tx = side === 'L' ? 0 : W - c.turretW;
    obstacles.push({
      kind: 'laser', gid,
      x: tx, y, w: c.turretW, h: c.turretH,
      side,
      phase: 'warn', t: Math.random() * 800,
      beamW: c.beamW,
      cycleMs: c.cycleMs, warnMs: c.warnMs, fireMs: c.fireMs,
      appear: 0
    });
    return c.turretH + 12;
  }
  function spawnChaser(y, gid) {
    const c = CFG.kinds.chaser;
    const sx = Math.max(playMinX, Math.min(playMaxX - c.w, player.x - c.w / 2));
    obstacles.push({
      kind: 'chaser', gid,
      x: sx, y, w: c.w, h: c.h,
      vxLerp: c.vxLerp,
      vxMax: c.vxMax,
      appear: 0
    });
    return c.h;
  }
  function spawnBlinker(y, gid) {
    const c = CFG.kinds.blinker;
    const holeW = c.holeW;
    // 3 doors, evenly placed, with random jitter within each third for variety
    const wallW = (W - 3 * holeW) / 4;
    const jitter = Math.max(0, wallW * 0.25);
    const j = () => (Math.random() - 0.5) * jitter * 2;
    const aX = wallW + j();
    const bX = wallW * 2 + holeW + j();
    const cX = wallW * 3 + holeW * 2 + j();
    const segs = [
      { x: 0,           x2: aX,            blink: null },
      { x: aX,          x2: aX + holeW,    blink: 'A' },
      { x: aX + holeW,  x2: bX,            blink: null },
      { x: bX,          x2: bX + holeW,    blink: 'B' },
      { x: bX + holeW,  x2: cX,            blink: null },
      { x: cX,          x2: cX + holeW,    blink: 'C' },
      { x: cX + holeW,  x2: W,             blink: null },
    ];
    const startT = Math.random() * 1000;
    for (const s of segs) {
      const w = s.x2 - s.x;
      if (w <= 0) continue;
      obstacles.push({
        kind: 'blinker', gid,
        x: s.x, y, w, h: c.h,
        blinkPhase: s.blink,
        periodMs: c.periodMs,
        t: startT,
        active: true,
        appear: 0
      });
    }
    return c.h;
  }
  function spawnHoming(y, gid) {
    const c = CFG.kinds.homing;
    obstacles.push({
      kind: 'homing', gid,
      x: Math.random() * (W - c.size), y, w: c.size, h: c.size,
      vy: c.vy, vxLerp: c.vxLerp,
      vxMax: c.vxMax,
      appear: 0
    });
    return c.size;
  }
  function spawnRotor(y, gid) {
    const c = CFG.kinds.rotor;
    const count = rngInt(c.minCount, c.maxCount);
    const slot = W / count;
    let maxH = 0;
    for (let i = 0; i < count; i++) {
      const lenCap = Math.min(c.maxLen, slot - 20);
      const lenMin = Math.min(c.minLen, lenCap);
      const len = rng(lenMin, lenCap);
      const cx = slot * i + slot / 2;
      obstacles.push({
        kind: 'rotor', gid,
        x: cx - len / 2, y, w: len, h: c.h,
        angle: Math.random() * Math.PI,
        vAng: sign() * rng(c.vAngMin, c.vAngMax),
        appear: 0
      });
      maxH = Math.max(maxH, Math.min(len, 100));
    }
    return maxH;
  }
  function spawnShrinker(y, gid) {
    const c = CFG.kinds.shrinker;
    const cx = c.marginMin + Math.random() * (W - 2 * c.marginMin);
    const common = { startGap: c.startGap, endGap: c.endGap, cx, age: 0, dur: c.dur, appear: 0 };
    obstacles.push({ kind: 'shrinker', gid, side: 'L', x: 0, y, w: cx - c.startGap / 2, h: c.h, ...common });
    obstacles.push({ kind: 'shrinker', gid, side: 'R', x: cx + c.startGap / 2, y, w: W - (cx + c.startGap / 2), h: c.h, ...common });
    return c.h;
  }
  function spawnSaw(y, gid) {
    const c = CFG.kinds.saw;
    const r = c.radius;
    const d = r * 2;
    const count = rngInt(c.minCount, c.maxCount);
    // distribute starting positions evenly across rail so they don't overlap
    const slot = (W - d) / count;
    const startDir = sign();
    for (let i = 0; i < count; i++) {
      const sx = slot * i + Math.random() * Math.max(0, slot - d);
      const dir = startDir * (i % 2 === 0 ? 1 : -1);
      obstacles.push({
        kind: 'saw', gid,
        x: sx, y, w: d, h: d,
        vx: dir * rng(c.vxMin, c.vxMax),
        spin: Math.random() * Math.PI,
        spinRate: c.spinRate,
        appear: 0
      });
    }
    return d + 8;
  }
  function spawnSwarm(y, gid) {
    const c = CFG.kinds.swarm;
    const spanMax = Math.max(0, W - 120 - c.count * c.step);
    const startX = 60 + Math.random() * spanMax;
    const phaseOff = Math.random() * Math.PI * 2;
    const drift = sign() * 0.8;
    for (let i = 0; i < c.count; i++) {
      const baseX = startX + i * c.step;
      obstacles.push({
        kind: 'swarm', gid,
        x: baseX, y: y + Math.sin(i * 0.8 + phaseOff) * c.ampY,
        w: c.size, h: c.size,
        baseX, baseY: y, idx: i,
        phaseOff, drift,
        ampX: c.ampX, driftScale: c.driftScale,
        appear: 0
      });
    }
    return c.size * 2;
  }
  function spawnSpinner(y, gid) {
    const c = CFG.kinds.spinner;
    const armLen = rng(c.minArmLen, c.maxArmLen);
    const margin = Math.max(c.marginMin, armLen + 10);
    const cx = margin + Math.random() * Math.max(0, W - 2 * margin);
    const sx = cx - armLen;
    const sh = armLen * 2;
    obstacles.push({
      kind: 'spinner', gid,
      x: sx, y, w: sh, h: sh,
      armLen, armW: c.armW,
      angle: Math.random() * Math.PI * 2,
      vAng: sign() * rng(c.vAngMin, c.vAngMax),
      appear: 0
    });
    return sh;
  }
  function spawnGate(y, gid) {
    const c = CFG.kinds.gate;
    obstacles.push({
      kind: 'gate', gid,
      x: 0, y, w: W, h: c.h,
      gapW: c.gapW,
      range: c.range,
      cx0: W / 2,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: c.phaseSpeed * sign(),
      gateCenter: W / 2,
      appear: 0
    });
    return c.h;
  }
  function spawnPendulum(y, gid) {
    const c = CFG.kinds.pendulum;
    const armLen = rng(c.minArmLen, c.maxArmLen);
    const anchorX = 60 + Math.random() * (W - 120);
    obstacles.push({
      kind: 'pendulum', gid,
      x: anchorX - 8, y, w: 16, h: armLen + c.weightR * 2,
      anchorX, armLen, armW: c.armW, weightR: c.weightR,
      swingAmp: c.swingAmp, swingSpeed: c.swingSpeed,
      phase: Math.random() * Math.PI * 2,
      angle: 0,
      appear: 0
    });
    return armLen + c.weightR * 2;
  }
  function spawnLightning(y, gid) {
    const c = CFG.kinds.lightning;
    const gapW = c.gapW;
    const margin = c.marginMin;
    const gapCx = margin + gapW / 2 + Math.random() * Math.max(0, W - 2 * margin - gapW);
    obstacles.push({
      kind: 'lightning', gid,
      x: 0, y, w: W, h: c.h,
      phase: 'warn', t: Math.random() * 900,
      cycleMs: c.cycleMs, warnMs: c.warnMs, fireMs: c.fireMs,
      beamH: c.beamH,
      gapW, gapCx,
      jagSeed: Math.random() * 1000,
      appear: 0
    });
    return c.h;
  }
  function spawnBouncer(y, gid) {
    const c = CFG.kinds.bouncer;
    obstacles.push({
      kind: 'bouncer', gid,
      x: Math.random() * (W - c.size), y, w: c.size, h: c.size,
      vx: sign() * rng(c.vxMin, c.vxMax),
      vy: rng(c.vyMin, c.vyMax),
      spin: Math.random() * Math.PI,
      appear: 0
    });
    return c.size + 6;
  }
  function spawnGrowBar(y, gid) {
    const c = CFG.kinds.growBar;
    const h = rng(c.minH, c.maxH);
    const halfEnd = Math.min(c.endW, W) / 2;
    const cx = halfEnd + Math.random() * Math.max(0, W - halfEnd * 2);
    obstacles.push({
      kind: 'growBar', gid,
      x: cx - c.startW / 2, y, w: c.startW, h,
      cx, startW: c.startW, endW: Math.min(c.endW, W),
      spawnY: y,
      appear: 0
    });
    return h;
  }
  function spawnCrusher(y, gid) {
    const c = CFG.kinds.crusher;
    const side = Math.random() < 0.5 ? 'L' : 'R';
    const baseX = side === 'L' ? 0 : W - c.w;
    const slamX = side === 'L' ? W - c.slamMargin - c.w : c.slamMargin;
    obstacles.push({
      kind: 'crusher', gid,
      x: baseX, y, w: c.w, h: c.h,
      side, baseX, slamX,
      cycleMs: c.cycleMs, warnMs: c.warnMs, slamMs: c.slamMs,
      holdMs: c.holdMs, retractMs: c.retractMs,
      t: Math.random() * 1200,
      shadowA: 0,
      appear: 0
    });
    return c.h + 20;
  }
  function spawnPortal(y, gid) {
    const c = CFG.kinds.portal;
    const span = rng(c.minSpan, Math.min(c.maxSpan, W - 2 * c.marginMin));
    const aX = c.marginMin + Math.random() * (W - 2 * c.marginMin - span);
    const bX = aX + span;
    obstacles.push({
      kind: 'portal', gid,
      x: 0, y, w: W, h: c.ringR * 2 + 4,
      aX, bX,
      ringR: c.ringR, ringSpin: 0,
      ballT: 0,
      ballX: aX, ballY: y + c.ringR,
      ballR: c.ballR, ballSpeed: c.ballSpeed,
      appear: 0
    });
    return c.ringR * 2 + 24;
  }
  function spawnWormTunnel(y, gid) {
    const c = CFG.kinds.wormTunnel;
    const amp = rng(c.ampMin, c.ampMax);
    const freq = rng(c.freqMin, c.freqMax);
    obstacles.push({
      kind: 'wormTunnel', gid,
      x: 0, y, w: W, h: c.h,
      channelW: c.channelW,
      amp, freq,
      phase: Math.random() * Math.PI * 2,
      appear: 0
    });
    return c.h;
  }
  function spawnStalactite(y, gid) {
    const c = CFG.kinds.stalactite;
    const count = rngInt(c.minCount, c.maxCount);
    const usableW = W - 2 * c.marginMin;
    const slot = usableW / count;
    for (let i = 0; i < count; i++) {
      const anchorX = c.marginMin + slot * (i + 0.5) + (Math.random() - 0.5) * slot * 0.4;
      obstacles.push({
        kind: 'stalactite', gid,
        x: anchorX - c.spikeW / 2, y, w: c.spikeW, h: c.spikeH + c.maxFall,
        anchorX,
        spikeW: c.spikeW, spikeH: c.spikeH, maxFall: c.maxFall,
        mountW: c.mountW, triggerW: c.triggerW,
        yOff: 0, phase: 'idle',
        cycleMs: c.cycleMs, warnMs: c.warnMs, fallMs: c.fallMs, holdMs: c.holdMs,
        t: i * c.staggerMs,
        appear: 0
      });
    }
    return c.spikeH + c.maxFall + 30;
  }
  function spawnBoomerang(y, gid) {
    const c = CFG.kinds.boomerang;
    const count = rngInt(c.minCount, c.maxCount);
    const range = W - c.rangeMargin;
    for (let i = 0; i < count; i++) {
      const side = Math.random() < 0.5 ? 'L' : 'R';
      const anchorX = side === 'L' ? 8 : W - 8;
      const yJitter = i * (c.size * 2 + 20);
      const ay = y + yJitter;
      obstacles.push({
        kind: 'boomerang', gid,
        x: anchorX - c.size, y: ay, w: c.size * 2, h: c.size * 2,
        anchorX, side,
        size: c.size, range,
        dur: c.dur, spinRate: c.spinRate, bobAmp: c.bobAmp,
        spin: 0, t: Math.random() * c.dur,
        bx: anchorX, by: ay,
        appear: 0
      });
    }
    return c.size * 2 + count * (c.size * 2 + 20) + 10;
  }
  function spawnSpikeCurtain(y, gid) {
    const c = CFG.kinds.spikeCurtain;
    const tipLen = W * c.tipReach;
    for (let i = 0; i < c.count; i++) {
      const fromLeft = i % 2 === 0;
      const sy = y + i * c.stepY;
      const side = fromLeft ? 'L' : 'R';
      const baseX = fromLeft ? 0 : W;
      obstacles.push({
        kind: 'spikeCurtain', gid,
        x: fromLeft ? 0 : W - tipLen,
        y: sy - c.tipW / 2,
        w: tipLen,
        h: c.tipW,
        side, baseX, baseY: sy,
        tipLen, tipW: c.tipW,
        appear: 0
      });
    }
    return c.count * c.stepY + c.tipW + 20;
  }
  function spawnYoyo(y, gid) {
    const c = CFG.kinds.yoyo;
    const reach = c.maxRope + c.ballR;
    // Left-wall yoyo
    obstacles.push({
      kind: 'yoyo', gid,
      side: 'L', anchorX: 0,
      x: 0, y, w: reach, h: c.ballR * 2,
      ballR: c.ballR,
      minRope: c.minRope, maxRope: c.maxRope, rope: c.minRope,
      spin: 0, spinRate: c.spinRate,
      cycleMs: c.cycleMs,
      ballX: 0, ballY: y,
      appear: 0
    });
    // Right-wall yoyo, offset along scroll axis, phase opposite
    const oy = y + c.anchorOffset;
    obstacles.push({
      kind: 'yoyo', gid,
      side: 'R', anchorX: W,
      x: W - reach, y: oy, w: reach, h: c.ballR * 2,
      ballR: c.ballR,
      minRope: c.minRope, maxRope: c.maxRope, rope: c.minRope,
      spin: 0, spinRate: -c.spinRate,
      cycleMs: c.cycleMs,
      // start phase-shifted by half cycle
      t: c.cycleMs / 2,
      ballX: W, ballY: oy,
      appear: 0
    });
    return c.anchorOffset + c.ballR * 2 + 30;
  }
  function spawnScreenChanger(y, gid) {
    const gapW = 110;
    const gapCx = playMinX + 110 + Math.random() * Math.max(0, playW - 220);
    const spikeSize = 40;
    const count = Math.max(1, Math.ceil(playW / spikeSize));
    const stepX = playW / count;
    for (let i = 0; i < count; i++) {
      const cx = playMinX + stepX * (i + 0.5);
      if (Math.abs(cx - gapCx) < gapW / 2 + spikeSize * 0.4) continue;
      obstacles.push({
        kind: 'spike', gid,
        x: cx - spikeSize / 2, y, w: spikeSize, h: spikeSize,
        spin: Math.random() * Math.PI, appear: 0
      });
    }
    obstacles.push({
      kind: 'changer', gid,
      x: gapCx - 24, y: y - 4, w: 48, h: 48,
      spin: 0, t: 0, appear: 0
    });
    return spikeSize + 18;
  }

  // ─── KIND_FNS MAP ────────────────────────────────────────────────────────────

  const KIND_FNS = {
    soloBar: spawnSoloBar, splitBar: spawnSplitBar, spikeCluster: spawnSpikeCluster,
    slider: spawnSlider, bigSpike: spawnBigSpike, laser: spawnLaser,
    chaser: spawnChaser, blinker: spawnBlinker, homing: spawnHoming,
    rotor: spawnRotor, shrinker: spawnShrinker, saw: spawnSaw,
    swarm: spawnSwarm, spinner: spawnSpinner, gate: spawnGate,
    pendulum: spawnPendulum, lightning: spawnLightning,
    bouncer: spawnBouncer,
    growBar: spawnGrowBar,
    wormTunnel: spawnWormTunnel,
    crusher: spawnCrusher,
    portal: spawnPortal,
    stalactite: spawnStalactite,
    boomerang: spawnBoomerang,
    spikeCurtain: spawnSpikeCurtain,
    yoyo: spawnYoyo,
  };

  // ─── SPAWN DISPATCHER ────────────────────────────────────────────────────────

  function spawnObstacle(spawnY) {
    // Ask main whether to inject the screen changer now
    if (shouldInjectChanger()) {
      onChangerInjected();
      return spawnScreenChanger(spawnY, ++groupSeq);
    }
    const gid = ++groupSeq;
    const sp = getScrollSpeed();
    const ramp = Math.min(1, (sp - CFG.world.scrollStart) / 5);
    const modeKey = getHMode() ? 'h' : 'v';
    // Filter spawn table by current orientation. Entries without `modes` are mode-neutral.
    const table = CFG.spawnTable.filter(t => !t.modes || t.modes.includes(modeKey));
    let total = 0;
    for (const t of table) total += t.weight + ramp * (t.rampMul || 0);
    let r = Math.random() * total;
    for (const t of table) {
      r -= t.weight + ramp * (t.rampMul || 0);
      if (r <= 0) {
        const fn = KIND_FNS[t.kind];
        if (fn) return fn(spawnY, gid);
        break;
      }
    }
    return spawnSoloBar(spawnY, gid);
  }

  // ─── COLLISION HELPERS ───────────────────────────────────────────────────────

  function hitRect(p, x, y, w, h) {
    const cx = Math.max(x, Math.min(p.x, x + w));
    const cy = Math.max(y, Math.min(p.y, y + h));
    const dx = p.x - cx, dy = p.y - cy;
    return dx * dx + dy * dy < p.r * p.r;
  }
  // circle vs rect rotated by `ang` about (ax, ay): rect spans [x0, x1] along its axis, half-width hw
  function hitRotRect(p, ax, ay, ang, x0, x1, hw) {
    const cs = Math.cos(-ang), sn = Math.sin(-ang);
    const dx = p.x - ax, dy = p.y - ay;
    const lx = dx * cs - dy * sn;
    const ly = dx * sn + dy * cs;
    const ex = lx - Math.max(x0, Math.min(lx, x1));
    const ey = ly - Math.max(-hw, Math.min(ly, hw));
    return ex * ex + ey * ey < p.r * p.r;
  }
  function hit(p, o) {
    if (o.kind === 'pendulum') {
      const ax = o.anchorX;
      const ay = o.y + 8;
      const wx = ax + Math.sin(o.angle) * o.armLen;
      const wy = ay + Math.cos(o.angle) * o.armLen;
      // weight circle
      const dx0 = p.x - wx, dy0 = p.y - wy;
      const sumR = o.weightR + p.r;
      if (dx0 * dx0 + dy0 * dy0 < sumR * sumR) return true;
      // arm: rotated rect from anchor to weight
      return hitRotRect(p, ax, ay, Math.atan2(wy - ay, wx - ax), 0, o.armLen, o.armW / 2);
    }
    if (o.kind === 'lightning') {
      if (o.phase !== 'fire') return false;
      const by = o.y + o.h / 2 - o.beamH / 2;
      const lx = o.gapCx - o.gapW / 2;
      const rx = o.gapCx + o.gapW / 2;
      return hitRect(p, 0, by, lx, o.beamH) || hitRect(p, rx, by, W - rx, o.beamH);
    }
    if (o.kind === 'bouncer') {
      const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
      const r = o.w / 2 * 0.9;
      const dx = p.x - cx, dy = p.y - cy;
      const sumR = r + p.r;
      return dx * dx + dy * dy < sumR * sumR;
    }
    if (o.kind === 'spike' || o.kind === 'bigSpike' || o.kind === 'saw' || o.kind === 'homing' || o.kind === 'swarm') {
      const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
      const rMul = (o.kind === 'spike' || o.kind === 'bigSpike') ? 0.85 : 0.9;
      const r = o.w / 2 * rMul;
      const dx = p.x - cx, dy = p.y - cy;
      const sumR = r + p.r;
      return dx * dx + dy * dy < sumR * sumR * (o.kind === 'spike' || o.kind === 'bigSpike' ? 0.7 : 0.9);
    }
    if (o.kind === 'laser') {
      if (o.phase !== 'fire') return false;
      const beamY = o.y + o.h / 2 - o.beamW / 2;
      if (o.side === 'R') {
        return hitRect(p, 0, beamY, o.x, o.beamW);
      }
      const ex = o.x + o.w;
      return hitRect(p, ex, beamY, W - ex, o.beamW);
    }
    if (o.kind === 'rotor') {
      return hitRotRect(p, o.x + o.w / 2, o.y + o.h / 2, o.angle, -o.w / 2, o.w / 2, o.h / 2);
    }
    if (o.kind === 'spinner') {
      const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
      return hitRotRect(p, cx, cy, o.angle, 0, o.armLen, o.armW / 2)
          || hitRotRect(p, cx, cy, o.angle + Math.PI, 0, o.armLen, o.armW / 2);
    }
    if (o.kind === 'gate') {
      const lx = o.gateCenter - o.gapW / 2;
      const rx = o.gateCenter + o.gapW / 2;
      return hitRect(p, 0, o.y, lx, o.h) || hitRect(p, rx, o.y, W - rx, o.h);
    }
    if (o.kind === 'blinker' && !o.active) return false;
    if (o.kind === 'portal') {
      const dx = p.x - o.ballX, dy = p.y - o.ballY;
      const sumR = o.ballR + p.r;
      return dx * dx + dy * dy < sumR * sumR;
    }
    if (o.kind === 'wormTunnel') {
      if (p.y < o.y - p.r || p.y > o.y + o.h + p.r) return false;
      const cx = W / 2 + Math.sin((p.y - o.y) * o.freq + o.phase) * o.amp;
      const halfW = o.channelW / 2;
      return Math.abs(p.x - cx) > halfW - p.r;
    }
    if (o.kind === 'stalactite') {
      if (o.yOff <= 0) return false;
      return hitRect(p, o.anchorX - o.spikeW / 2, o.y + o.yOff, o.spikeW, o.spikeH);
    }
    if (o.kind === 'boomerang') {
      const dx = p.x - o.bx, dy = p.y - o.by;
      const r = o.size * 0.85 + p.r;
      return dx * dx + dy * dy < r * r;
    }
    if (o.kind === 'spikeCurtain') {
      const dirX = o.side === 'L' ? 1 : -1;
      const reachX = dirX * (p.x - o.baseX);
      if (reachX < -p.r || reachX > o.tipLen + p.r) return false;
      const k = Math.max(0, Math.min(1, reachX / o.tipLen));
      const halfW = (o.tipW / 2) * (1 - k);
      return Math.abs(p.y - o.baseY) < halfW + p.r * 0.55;
    }
    if (o.kind === 'yoyo') {
      const dx = p.x - o.ballX, dy = p.y - o.ballY;
      const r = o.ballR + p.r;
      return dx * dx + dy * dy < r * r;
    }
    if (o.w <= 0) return false;
    return hitRect(p, o.x, o.y, o.w, o.h);
  }


  // ─── PUBLIC API ──────────────────────────────────────────────────────────────

  function reset() {
    obstacles = [];
    groupSeq = 0;
    passedGroups = new Set();
  }

  function phaseOf(o) {
    const cyc = o.t % o.cycleMs;
    return cyc < o.warnMs ? 'warn' : (cyc < o.warnMs + o.fireMs ? 'fire' : 'idle');
  }
  function chaseX(o, f) {
    const step = (player.x - o.w / 2 - o.x) * (1 - Math.pow(1 - o.vxLerp, f));
    const cap = o.vxMax * f;
    o.x += Math.max(-cap, Math.min(cap, step));
  }
  function bounceX(o) {
    if (o.x < playMinX)       { o.x = playMinX;       o.vx = Math.abs(o.vx); }
    if (o.x + o.w > playMaxX) { o.x = playMaxX - o.w; o.vx = -Math.abs(o.vx); }
  }

  function update(dt, f) {
    const sp = getScrollSpeed();
    const spStep = sp * f;

    for (const o of obstacles) {
      o.y -= spStep;
      o.t = (o.t || 0) + dt;
      if (o.appear < 1) o.appear = Math.min(1, o.appear + 0.08 * f);
      switch (o.kind) {
        case 'spike':    o.spin += 0.08 * f; break;
        case 'bigSpike': o.spin += 0.05 * f; break;
        case 'changer':  o.spin = (o.spin || 0) + 0.04 * f; break;
        case 'slider':
          o.x += o.vx * f;
          bounceX(o);
          break;
        case 'chaser':
          chaseX(o, f);
          o.x = Math.max(playMinX, Math.min(playMaxX - o.w, o.x));
          break;
        case 'laser':
        case 'lightning':
          o.phase = phaseOf(o);
          break;
        case 'blinker': {
          if (o.blinkPhase == null) { o.active = true; break; }
          const idx = Math.floor(o.t / o.periodMs) % 3;
          const cur = idx === 0 ? 'A' : (idx === 1 ? 'B' : 'C');
          o.active = o.blinkPhase === cur;
          break;
        }
        case 'homing':
          o.y -= o.vy * f;
          chaseX(o, f);
          break;
        case 'rotor':
          o.angle += o.vAng * f;
          break;
        case 'shrinker': {
          o.age += dt;
          const t = Math.min(1, o.age / o.dur);
          const gap = o.startGap + (o.endGap - o.startGap) * t;
          if (o.side === 'L') {
            o.w = Math.max(0, o.cx - gap / 2);
          } else {
            o.x = o.cx + gap / 2;
            o.w = Math.max(0, W - o.x);
          }
          break;
        }
        case 'saw':
          o.spin += o.spinRate * f;
          o.x += o.vx * f;
          bounceX(o);
          break;
        case 'swarm': {
          const ph = o.t * 0.005 + o.idx * 0.7 + o.phaseOff;
          o.x = o.baseX + Math.sin(ph) * o.ampX + o.drift * (o.t * o.driftScale);
          o.x = Math.max(0, Math.min(W - o.w, o.x));
          break;
        }
        case 'spinner':
          o.angle += o.vAng * f;
          break;
        case 'gate': {
          const c = o.cx0 + Math.sin(o.t * o.phaseSpeed + o.phase) * o.range;
          o.gateCenter = Math.max(o.gapW / 2 + 10, Math.min(W - o.gapW / 2 - 10, c));
          break;
        }
        case 'pendulum':
          o.angle = o.swingAmp * Math.sin(o.t * o.swingSpeed + o.phase);
          break;
        case 'bouncer':
          o.x += o.vx * f;
          o.y += o.vy * f;
          o.spin += 0.05 * f;
          bounceX(o);
          break;
        case 'crusher': {
          const cyc = o.t % o.cycleMs;
          const a = o.warnMs, b = a + o.slamMs, cc = b + o.holdMs;
          if (cyc < a) {
            o.x = o.baseX;
            o.shadowA = cyc / a;
          } else if (cyc < b) {
            const k = (cyc - a) / o.slamMs;
            o.x = o.baseX + (o.slamX - o.baseX) * k;
            o.shadowA = 1;
          } else if (cyc < cc) {
            o.x = o.slamX;
            o.shadowA = 1 - (cyc - b) / o.holdMs;
          } else {
            const k = Math.min(1, (cyc - cc) / o.retractMs);
            o.x = o.slamX + (o.baseX - o.slamX) * k;
            o.shadowA = 0;
          }
          break;
        }
        case 'portal':
          o.ringSpin += 0.025 * f;
          o.ballT = (o.ballT + o.ballSpeed * f) % (o.bX - o.aX);
          o.ballX = o.aX + o.ballT;
          o.ballY = o.y + o.ringR;
          break;
        case 'growBar': {
          const span = o.spawnY - player.y;
          if (span > 0) {
            const prog = Math.max(0, Math.min(1, (o.spawnY - o.y) / span));
            o.w = o.startW + (o.endW - o.startW) * prog;
            o.x = o.cx - o.w / 2;
            if (o.x < 0) o.x = 0;
            if (o.x + o.w > W) o.x = W - o.w;
          }
          break;
        }
        case 'stalactite': {
          const cyc = o.t % o.cycleMs;
          const a = o.warnMs, b = a + o.fallMs, cc = b + o.holdMs;
          if (cyc < a) {
            o.phase = 'warn'; o.yOff = 0;
          } else if (cyc < b) {
            o.phase = 'fall';
            const k = (cyc - a) / o.fallMs;
            o.yOff = o.maxFall * k * k;
          } else if (cyc < cc) {
            o.phase = 'hold'; o.yOff = o.maxFall;
          } else {
            o.phase = 'idle';
            const k = Math.min(1, (cyc - cc) / (o.cycleMs - cc));
            o.yOff = o.maxFall * (1 - k);
          }
          break;
        }
        case 'boomerang': {
          o.spin += o.spinRate * f;
          const cyc = o.t % o.dur;
          const k = cyc / o.dur;
          const tri = k < 0.5 ? (k * 2) : (1 - (k - 0.5) * 2);
          const ease = 1 - Math.pow(1 - tri, 2);
          const dir = o.side === 'L' ? 1 : -1;
          o.bx = o.anchorX + dir * ease * o.range;
          o.by = o.y + o.size + Math.sin(k * Math.PI) * o.bobAmp;
          break;
        }
        case 'spikeCurtain': {
          // baseY scrolls with main loop via o.y; keep baseY synced
          o.baseY = o.y + o.tipW / 2;
          break;
        }
        case 'yoyo': {
          o.spin += o.spinRate * f;
          const k = (1 - Math.cos(o.t / o.cycleMs * Math.PI * 2)) / 2;
          o.rope = o.minRope + (o.maxRope - o.minRope) * k;
          const dir = o.side === 'L' ? 1 : -1;
          o.ballX = o.anchorX + dir * o.rope;
          o.ballY = o.y + o.ballR;
          break;
        }
      }
      // Pass detection
      if (!passedGroups.has(o.gid) && o.y + o.h < player.y - player.r) {
        passedGroups.add(o.gid);
        const groupParts = obstacles.filter(g => g.gid === o.gid);
        let nearest = Infinity;
        for (const g of groupParts) {
          const dx = Math.max(g.x - player.x, player.x - (g.x + g.w), 0);
          if (dx < nearest) nearest = dx;
        }
        onPass(o.gid, nearest < 22);
      }
    }

    // Cull off-screen obstacles
    obstacles = obstacles.filter(o => {
      const keep = o.y + o.h > -20;
      // failsafe: changer scrolled off uncollected → re-arm so next one spawns
      if (!keep && o.kind === 'changer' && !o.collected) onChangerMissed();
      return keep;
    });

    // Collision detection: changer pickup first, then lethal hits
    let pickedChanger = false;
    for (const o of obstacles) {
      if (o.kind === 'changer') {
        if (!o.collected) {
          const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
          const r = o.w / 2 * 0.95;
          const dx = player.x - cx, dy = player.y - cy;
          if (dx * dx + dy * dy < (r + player.r) * (r + player.r)) {
            o.collected = true;
            pickedChanger = true;
            onChangerCollected();
            break;
          }
        }
        continue;
      }
      if (hit(player, o)) {
        return { died: true };
      }
    }
    if (pickedChanger) {
      obstacles = obstacles.filter(o => !o.collected);
    }

    return { died: false };
  }

  function draw() {
    drawer.drawAll(obstacles);
  }

  return { reset, spawn: spawnObstacle, update, draw };
}
