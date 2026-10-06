// Pure race logic: no DOM, no three.js (node test.mjs runs it).
// Karts live in track space: s along the centre line (wraps at L), d lateral (+ = right), h above the road,
// yaw relative to the track tangent, v speed along the heading. See DESIGN.md §7.
// ponytail: no free roam, no loops-the-loop (frames use world-up), no true 3D collisions. Move to cannon-es if a
// track ever needs those.

export const STEP = 1 / 120, MAX_STEPS = 8;
export const TOP = { chill: 18, normal: 22, turbo: 27 };
const ACCEL_T = 2.6, COAST = 4, BRAKE = 16, REVERSE = 6, REV_ACC = 8, OVER = 6, G = 18;
const STEER_LO = 2.0, STEER_HI = 1.1, STEER_V0 = 5; // rad/s at rest -> at top speed; full authority from 5 m/s
export const WALL_PAD = 0.6, KART_R = 0.9;
const HOP_V = 2.2, DRIFT_MIN = 8, DRIFT_KEEP = 6;
export const DRIFT_BIAS = 0.35; // visual: the kart body turns this far into the slide
export const TIERS = [0.6, 1.2, 2.0]; // drift seconds for cyan / amber / pink sparks
const TIER_BOOST = [0.5, 0.9, 1.4];
const BOOST_TOP = 1.35, BOOST_KICK = 4, RUNG_BOOST = 0.25, RUNG_MAX = 1.5, TRICK_BOOST = 0.6;
const OFFROAD = 0.55, RAMP_LEN = 4, RAMP_H = 0.8;
const WRONG_T = 2, STUCK_T = 3, RESPAWN_T = 1;
export const GRID_T = 2.5, COUNT_T = 3, END_AFTER = 30; // dice roll + flyover, 3-2-1-GO, race ends 30 s after the first human finishes
const STUN_DECEL = 14, START_BOOST = 1, SPIN_OUT = 0.6;
const BUMP_V = 6, STUN_SIDE_V = 10, BUMP_STUN = 0.4;
const RUBBER = { chill: 0.0016, normal: 0.001, turbo: 0.0006 }; // CPU speed scale per metre of gap to the nearest human
// items & gimmicks (DESIGN §8)
export const ITEMS = ['bomb', 'bubble', 'dash', 'joker'];
// odds per quarter of the field, leaders first: [bomb, bubble, dash, joker]. Joker never reaches 1st
export const ODDS = [[0.45, 0.45, 0.1, 0], [0.35, 0.3, 0.25, 0.1], [0.25, 0.2, 0.35, 0.2], [0.15, 0.1, 0.45, 0.3]];
export const ROLL_T = 1.2, BOX_T = 2, COIN_T = 15, MAX_COINS = 10, BUBBLE_T = 8, DASH_T = 1.6, BLAST_R = 3.5, BOMB_STUN = 1.1;
export const SPOT_T = 0.8, FLY_T = 0.7, INV_T = 0.6, WARP_T = 0.35, SOOT_T = 3, MOUTH_R = 2;
const BOX_R = 1.6, COIN_R = 1.3, BOMB_ROLL = 0.6, WARP_CD = 1.2;
// moving wall: a slab across the road (MOVER_T half-thick along s, MOVER_H tall) sliding rail to rail; a hard hit = STUN!
export const MOVER_T = 0.6, MOVER_H = 1.8;
const MOVER_STUN = 0.7;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const wrapA = a => a - 2 * Math.PI * Math.floor((a + Math.PI) / (2 * Math.PI));

// seedable RNG so tests and replays are deterministic
export function mulberry32(a) {
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ---------- track table ----------
const dist3 = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
// centripetal Catmull-Rom (alpha 0.5), Barry-Goldman pyramid; extra components (width, bank) ride the same weights
function cr(p0, p1, p2, p3, t0, t1, t2, t3, t) {
  const out = new Array(p1.length);
  for (let c = 0; c < p1.length; c++) {
    const a1 = ((t1 - t) * p0[c] + (t - t0) * p1[c]) / (t1 - t0);
    const a2 = ((t2 - t) * p1[c] + (t - t1) * p2[c]) / (t2 - t1);
    const a3 = ((t3 - t) * p2[c] + (t - t2) * p3[c]) / (t3 - t2);
    const b1 = ((t2 - t) * a1 + (t - t0) * a2) / (t2 - t0);
    const b2 = ((t3 - t) * a2 + (t - t1) * a3) / (t3 - t1);
    out[c] = ((t2 - t) * b1 + (t - t1) * b2) / (t2 - t1);
  }
  return out;
}

// def.points: [x, y, z, width?, bankDeg?] (y up). Resampled at ~1 m (exactly L / round(L)) into typed arrays.
export function buildTrack(def) {
  const P = def.points.map(p => [p[0], p[1], p[2], p[3] ?? def.width, (p[4] ?? 0) * Math.PI / 180]);
  const N = P.length, SUB = 64, dense = [];
  for (let i = 0; i < N; i++) {
    const p0 = P[(i - 1 + N) % N], p1 = P[i], p2 = P[(i + 1) % N], p3 = P[(i + 2) % N];
    const t1 = Math.max(1e-3, dist3(p0, p1) ** 0.5), t2 = t1 + Math.max(1e-3, dist3(p1, p2) ** 0.5), t3 = t2 + Math.max(1e-3, dist3(p2, p3) ** 0.5);
    for (let j = 0; j < SUB; j++) dense.push(cr(p0, p1, p2, p3, 0, t1, t2, t3, t1 + (t2 - t1) * j / SUB));
  }
  const M = dense.length, acc = new Float64Array(M + 1);
  for (let i = 0; i < M; i++) acc[i + 1] = acc[i] + dist3(dense[i], dense[(i + 1) % M]);
  const L = acc[M], n = Math.round(L), ds = L / n, wMin = Math.min(...P.map(p => p[3])), wMax = Math.max(...P.map(p => p[3]));
  const pos = new Float32Array(n * 3), tan = new Float32Array(n * 3), right = new Float32Array(n * 3), up = new Float32Array(n * 3);
  const kappa = new Float32Array(n), half = new Float32Array(n), bank = new Float32Array(n), head = new Float64Array(n);
  for (let i = 0, j = 0; i < n; i++) {
    const s = i * ds;
    while (acc[j + 1] < s) j++;
    const f = (s - acc[j]) / (acc[j + 1] - acc[j]), a = dense[j], b = dense[(j + 1) % M];
    for (let c = 0; c < 3; c++) pos[i * 3 + c] = a[c] + (b[c] - a[c]) * f;
    half[i] = clamp((a[3] + (b[3] - a[3]) * f) / 2, wMin / 2, wMax / 2); // the spline overshoots between width changes
    bank[i] = a[4] + (b[4] - a[4]) * f;
  }
  for (let i = 0; i < n; i++) {
    const p = (i - 1 + n) % n, q = (i + 1) % n;
    let tx = pos[q * 3] - pos[p * 3], ty = pos[q * 3 + 1] - pos[p * 3 + 1], tz = pos[q * 3 + 2] - pos[p * 3 + 2];
    const tl = Math.hypot(tx, ty, tz); tx /= tl; ty /= tl; tz /= tl;
    // right = tan x worldUp, up = right x tan, then both rotate about tan by the bank (+ = right edge lower)
    let rx = -tz, rz = tx; const rl = Math.hypot(rx, rz); rx /= rl; rz /= rl;
    let ux = -rz * ty, uy = rz * tx - rx * tz, uz = rx * ty;
    const cb = Math.cos(bank[i]), sb = Math.sin(bank[i]);
    const Rx = rx * cb - ux * sb, Ry = -uy * sb, Rz = rz * cb - uz * sb;
    const Ux = ux * cb + rx * sb, Uy = uy * cb, Uz = uz * cb + rz * sb;
    tan.set([tx, ty, tz], i * 3); right.set([Rx, Ry, Rz], i * 3); up.set([Ux, Uy, Uz], i * 3);
    head[i] = Math.atan2(tx, -tz); // heading in the ground plane; turning right increases it
  }
  // signed horizontal curvature (+ = turning right), lightly smoothed so the step response stays calm
  for (let i = 0; i < n; i++) kappa[i] = wrapA(head[(i + 1) % n] - head[(i - 1 + n) % n]) / (2 * ds);
  for (let pass = 0; pass < 3; pass++) {
    const k0 = kappa.slice();
    for (let i = 0; i < n; i++) kappa[i] = (k0[(i - 2 + n) % n] + k0[(i - 1 + n) % n] + k0[i] + k0[(i + 1) % n] + k0[(i + 2) % n]) / 5;
  }
  // CPU racing line: lean toward the inside of curves (curvature over a 20 m window), smoothed, kept off the walls
  const line = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let k = 0;
    for (let j = -10; j <= 10; j++) k += kappa[(i + j + n) % n];
    line[i] = k / 21 * 160;
  }
  for (let pass = 0; pass < 6; pass++) {
    const l0 = line.slice();
    for (let i = 0; i < n; i++) { let a = 0; for (let j = -8; j <= 8; j++) a += l0[(i + j + n) % n]; line[i] = a / 17; }
  }
  for (let i = 0; i < n; i++) line[i] = clamp(line[i], -(half[i] - 1.5), half[i] - 1.5);
  const fr = f => ((f % 1) + 1) % 1 * L; // features are authored as lap fractions
  const features = (def.features || []).map(f => ({ ...f, s: f.s != null ? fr(f.s) : undefined, a: f.a != null ? fr(f.a) : undefined, b: f.b != null ? fr(f.b) : undefined }));
  const rungs = [], ramps = [], boxes = [], coins = [], props = [], mouths = [], carousels = [], water = [], movers = [];
  for (const f of features) {
    if (f.type === 'rungs') { const c = f.n || 8; for (let k = 0; k < c; k++) rungs.push(f.s + f.len * k / (c - 1)); }
    if (f.type === 'ramp') ramps.push(f.s);
    if (f.type === 'water') water.push([f.s, f.s + f.len]); // a stretch with no rails: off the edge is a splash
    const hw = i => half[Math.round(i / ds) % n];
    if (f.type === 'items') { const sp = (hw(f.s) - 1.8) / 2; for (let j = 0; j < (f.n || 5); j++) boxes.push({ s: f.s, d: (j - ((f.n || 5) - 1) / 2) * sp }); }
    if (f.type === 'coins') for (let j = 0; j < (f.n || 5); j++) coins.push({ s: (f.s + j * 3) % L, d: f.d || 0 });
    if (f.type === 'prop') props.push({ s: f.s, d: f.d, r: f.r || 1.2, kind: f.kind });
    if (f.type === 'wormhole') { // A (shortcut forward) on f.side, B on the other side; each sends you to the other
      const a = mouths.length;
      mouths.push({ s: f.a, d: f.side * (hw(f.a) - 3), to: a + 1, fwd: true }, { s: f.b, d: -f.side * (hw(f.b) - 3), to: a, fwd: false });
    }
    if (f.type === 'carousel') carousels.push({ s: (f.s + f.len / 2) % L, r: f.len / 2, w: 0.7 * (f.spin || 1) });
    if (f.type === 'mover') { const hwm = (f.w || 5) / 2; movers.push({ s: f.s, hw: hwm, amp: hw(f.s) + WALL_PAD + (def.shoulder || 0) - hwm, w: 2 * Math.PI / (f.period || 4) }); } // its end reaches the rail at each extreme
  }
  return { id: def.id, def, L, n, ds, pos, tan, right, up, kappa, half, bank, line, features, rungs, ramps, boxes, coins, props, mouths, carousels, water, movers, shoulder: def.shoulder || 0 };
}

// ---------- look-ups (lerp between samples; s wraps) ----------
let _i = 0, _j = 0, _f = 0;
function idx(T, s) {
  let x = (s / T.ds) % T.n;
  if (x < 0) x += T.n;
  _i = x | 0; _j = (_i + 1) % T.n; _f = x - _i;
}
export function at(T, arr, s) { idx(T, s); return arr[_i] + (arr[_j] - arr[_i]) * _f; }
// o: { pos, tan, right, up } of 3-arrays (reused by the caller, nothing allocated here)
export function frameAt(T, s, o) {
  idx(T, s);
  const a = _i * 3, b = _j * 3, f = _f;
  for (let c = 0; c < 3; c++) {
    o.pos[c] = T.pos[a + c] + (T.pos[b + c] - T.pos[a + c]) * f;
    o.tan[c] = T.tan[a + c] + (T.tan[b + c] - T.tan[a + c]) * f;
    o.right[c] = T.right[a + c] + (T.right[b + c] - T.right[a + c]) * f;
    o.up[c] = T.up[a + c] + (T.up[b + c] - T.up[a + c]) * f;
  }
  return o;
}
export const overWater = (T, s) => { for (const [a, b] of T.water) if ((s >= a && s <= b) || (s + T.L >= a && s + T.L <= b)) return true; return false; };
export const wallHalf = (T, s) => at(T, T.half, s) + WALL_PAD + T.shoulder;
// a moving wall's centre (d) at race time t; it sits in the middle until GO
export const moverD = (m, t) => m.amp * Math.sin(m.w * t);

// ---------- karts ----------
export function newKart(i, animal = 0, human = -1) {
  return {
    i, animal, human, s: 0, d: 0, h: 0, vh: 0, yaw: 0, v: 0, lap: -1, half: true, progress: 0, place: i + 1,
    prevDrift: false, drift: 0, driftT: 0, tier: 0, boost: 0, lock: 0, air: 0, trick: false,
    wrongT: 0, wrong: false, finished: false, finishT: 0, coins: 0, ds: 0, steer: 0, stun: 0,
    push: 0, stuckT: 0, resp: 0, respS: 0, thrT: 0, dnf: false, rubber: 1, bias: 0, skill: 1, cpuDrift: 0, grid: i, startSkill: 0.5,
    item: null, roll: 0, holdT: 0, bubble: 0, soot: 0, inv: 0, warp: 0, warpTo: -1, warpCd: 0, fly: 0, joker: 0, jokerOn: -1, onCar: false, shortcut: false, coinStreak: 0, coinAt: -9,
  };
}
export const NO_INPUT = Object.freeze({ steer: 0, throttle: 0, brake: 0, drift: false, item: false, back: false });
const STUNNED = NO_INPUT;

const ev = (R, type, k, x = 0) => R.ev.push({ type, k: k.i, x });

function boost(R, k, t) {
  if (k.boost < 0.05) k.v += BOOST_KICK;
  k.boost = Math.max(k.boost, t);
}
function release(R, k) {
  const tier = k.tier;
  k.drift = 0; k.driftT = 0; k.tier = 0;
  if (tier) { boost(R, k, TIER_BOOST[tier - 1]); ev(R, 'miniTurbo', k, tier); }
}

export function stepKart(R, k, inp, dt) {
  const T = R.T, top0 = R.top * (1 + k.coins * 0.01) * k.rubber * k.skill;
  // respawn: lifted off by an orb, set back down on the racing line a little further on (the 1 s is the penalty)
  if (k.resp > 0) {
    k.resp -= dt; k.v = 0; k.h = 2 * Math.sin(Math.PI * Math.min(1, 1 - k.resp / RESPAWN_T));
    if (k.resp <= 0) { k.resp = 0; k.s = k.respS; k.d = at(T, T.line, k.s); k.yaw = 0; k.h = 0; k.vh = 0; k.push = 0; k.stuckT = 0; }
    return;
  }
  if (k.bubble > 0) k.bubble = Math.max(0, k.bubble - dt);
  if (k.soot > 0) k.soot = Math.max(0, k.soot - dt);
  if (k.inv > 0) k.inv = Math.max(0, k.inv - dt);
  if (k.warpCd > 0) k.warpCd -= dt;
  if (k.roll > 0 && (k.roll -= dt) <= 0) { k.roll = 0; ev(R, 'itemReady', k, ITEMS.indexOf(k.item)); }
  // into a wormhole: shrink-spin into the mouth, then out of the other one at the same speed
  if (k.warp > 0) {
    if ((k.warp -= dt) <= 0) {
      const m = T.mouths[k.warpTo];
      k.warp = 0; k.s = (m.s + 3) % T.L; k.d = m.d * 0.6; k.yaw = 0; k.h = 0; k.vh = 0; k.push = 0; k.warpCd = WARP_CD;
      if (k.s > T.L * 0.5) k.half = true;
      k.progress = k.lap * T.L + k.s;
      ev(R, 'warpOut', k, k.warpTo);
    }
    return;
  }
  // Joker swap flight: both karts ride their orb arcs, frozen in place, then a moment of invulnerability
  if (k.fly > 0) { if ((k.fly -= dt) <= 0) { k.fly = 0; k.inv = INV_T; } return; }
  if (k.stun > 0) { k.stun = Math.max(0, k.stun - dt); inp = STUNNED; if (k.drift) { k.drift = 0; k.driftT = 0; k.tier = 0; } k.v = Math.max(0, k.v - STUN_DECEL * dt); }
  if (k.lock > 0) k.lock -= dt;
  k.steer = inp.steer; // for the view (body lean)
  if (k.boost > 0) k.boost = Math.max(0, k.boost - dt);
  const kap = at(T, T.kappa, k.s), half = at(T, T.half, k.s), wall = half + WALL_PAD + T.shoulder;
  const grounded = k.h <= 0 && k.vh <= 0;
  let top = top0 * (k.boost > 0 ? BOOST_TOP : 1);
  if (T.shoulder && grounded && Math.abs(k.d) > half) top = Math.min(top, top0 * OFFROAD);

  // ---- speed ----
  const thr = inp.throttle, brk = inp.brake;
  if (brk > 0.1 && k.v > 0.5) k.v -= BRAKE * brk * dt;
  else if (brk > 0.1 && thr < 0.1) k.v = Math.max(-REVERSE, k.v - REV_ACC * brk * dt);
  else if (thr > 0.05) {
    if (k.v < 0) k.v += BRAKE * dt;
    else if (k.v < top) {
      // ease-out: 0 -> top in ACCEL_T at full throttle (v = top(1-(1-t/T)^2)), small floor so it lands on top
      const a = 2 * top / ACCEL_T * Math.sqrt(Math.max(0, 1 - k.v / top));
      k.v = Math.min(top, k.v + Math.max(a, 1.5) * thr * dt);
    }
  } else k.v = k.v > 0 ? Math.max(0, k.v - COAST * dt) : Math.min(0, k.v + COAST * dt);
  if (k.v > top) k.v = Math.max(top, k.v - OVER * dt);

  // ---- items ----
  if (k.item && k.roll <= 0) k.holdT += dt;
  if (inp.item && k.item && k.roll <= 0 && !k.joker) useItem(R, k, inp.back);

  // ---- drift / hop ----
  const press = inp.drift && !k.prevDrift;
  k.prevDrift = inp.drift;
  if (press && grounded && k.v > DRIFT_MIN) { k.vh = HOP_V; ev(R, 'hop', k); }
  if (!k.drift && inp.drift && k.v > DRIFT_MIN && Math.abs(inp.steer) > 0.3 && k.lock <= 0) { k.drift = Math.sign(inp.steer); k.driftT = 0; k.tier = 0; }
  if (k.drift) {
    if (!inp.drift || k.v < DRIFT_KEEP) release(R, k);
    else if (grounded) {
      k.driftT += dt;
      const tier = k.driftT >= TIERS[2] ? 3 : k.driftT >= TIERS[1] ? 2 : k.driftT >= TIERS[0] ? 1 : 0;
      if (tier !== k.tier) { k.tier = tier; ev(R, 'tier', k, tier); }
    }
  }

  // ---- steering ----
  const va = Math.abs(k.v), sp = Math.min(1, va / R.top);
  const rate = (STEER_LO + (STEER_HI - STEER_LO) * sp) * Math.min(1, va / STEER_V0);
  let w = 0;
  if (k.lock > 0) w = 0;
  else if (k.drift) w = k.drift * rate * 0.95 * (1 + 0.4 * clamp(inp.steer * k.drift, -1, 1)); // steer tightens / widens 0.6-1.4x
  else w = inp.steer * rate * (k.v < 0 ? -1 : 1);

  // ---- integrate in track space ----
  const vs = k.v * Math.cos(k.yaw) / Math.max(0.2, 1 - kap * k.d);
  const s0 = k.s;
  k.s += vs * dt;
  k.d += (k.v * Math.sin(k.yaw) + k.push) * dt;
  k.push *= Math.exp(-5 * dt);
  // carousel: a spinning turntable carries everything on it round its centre (and the karts turn with it)
  let on = false;
  for (const c of T.carousels) {
    let dx = k.s - c.s; dx -= T.L * Math.round(dx / T.L);
    if (dx * dx + k.d * k.d < c.r * c.r && k.h < 0.5) { on = true; k.s -= c.w * k.d * dt; k.d += c.w * dx * dt; k.yaw = wrapA(k.yaw + c.w * dt); }
  }
  if (on !== k.onCar) { k.onCar = on; if (on) ev(R, 'carousel', k); }
  // props (gift boxes, lotus lanterns): a wall-style bounce off a circle
  for (const p of T.props) {
    let dx = k.s - p.s; dx -= T.L * Math.round(dx / T.L);
    const dd = k.d - p.d, r = p.r + KART_R, d2 = dx * dx + dd * dd;
    if (d2 < r * r && d2 > 1e-6 && k.h < 1) {
      const dist = Math.sqrt(d2), nx = dx / dist, ny = dd / dist;
      k.s += nx * (r - dist); k.d += ny * (r - dist);
      const into = -(k.v * Math.cos(k.yaw) * nx + k.v * Math.sin(k.yaw) * ny);
      if (into > 2) { k.v *= 0.6; k.yaw = wrapA(k.yaw + Math.PI * 0.35 * (ny >= 0 ? 1 : -1) * Math.sign(Math.cos(k.yaw))); k.lock = 0.15; ev(R, 'prop', k, into); }
    }
  }
  // moving walls: box vs box in (s, d), pushed out along the shallower axis. Its sliding end shoves you sideways;
  // pinned against the rail, you're pushed back out along s instead. ponytail: the kart is a square here (corners too)
  for (const m of T.movers) {
    let dx = k.s - m.s; dx -= T.L * Math.round(dx / T.L);
    const md = moverD(m, R.t), dd = k.d - md, ps = MOVER_T + KART_R - Math.abs(dx), pd = m.hw + KART_R - Math.abs(dd);
    if (ps <= 0 || pd <= 0 || k.h > MOVER_H) continue;
    const side = Math.sign(dd) || 1, mv = m.amp * m.w * Math.cos(m.w * R.t);
    let into;
    if (pd < ps && Math.abs(k.d + side * pd) < wall - 0.7) { k.d += side * pd; into = (mv - k.v * Math.sin(k.yaw) - k.push) * side; if (into > 0) k.push = mv; }
    else { const n = Math.sign(dx) || -1; k.s += n * ps; into = -k.v * Math.cos(k.yaw) * n; if (into > 0) k.v *= 0.3; }
    if (into > 2 && !k.stun) { ev(R, 'prop', k, into); hit(R, k, MOVER_STUN, 'mover'); }
  }
  k.yaw = wrapA(k.yaw + (w - kap * vs) * dt);
  k.ds = vs;

  // ---- water (no rails): drive off the planks and you're fished back out ----
  const wet = T.water.length && overWater(T, k.s);
  if (wet && Math.abs(k.d) > half + 0.4 && k.h < 0.5) { k.resp = RESPAWN_T; k.respS = k.s + 4; k.drift = 0; k.boost = 0; k.v = 0; ev(R, 'splash', k); return; }
  // ---- walls: reflect, scrub speed by impact angle, brief steer lock ----
  const lim = wall - 0.7;
  if (!wet && Math.abs(k.d) > lim) {
    const side = Math.sign(k.d), into = k.v * Math.sin(k.yaw) * side; // > 0: moving into the wall
    k.d = side * lim;
    if (into > 0) {
      const hit = Math.min(1, into / Math.max(1, va) * 2.5);
      k.yaw = Math.atan2(-Math.sin(k.yaw) * 0.4, Math.cos(k.yaw));
      k.v *= 1 - 0.4 * hit;
      if (hit > 0.3 && va > 4) { k.lock = 0.15; if (k.drift) { k.drift = 0; k.driftT = 0; k.tier = 0; } ev(R, 'wall', k, hit * side); }
    }
  }

  // ---- ramps: ride up the wedge, launch off the lip ----
  if (k.v > 0 && k.h <= RAMP_H && k.vh <= 0) {
    for (const r of T.ramps) {
      const u = k.s - (r - RAMP_LEN);
      if (u >= 0 && u < RAMP_LEN) { k.h = RAMP_H * u / RAMP_LEN; k.vh = 0; }
      else if (s0 < r && k.s >= r && k.h > 0) { k.vh = 3 + 0.25 * k.v; k.air = 0; k.trick = false; ev(R, 'ramp', k); }
    }
  }
  // ---- vertical ----
  if (k.h > 0 || k.vh > 0) {
    let onRamp = false;
    if (k.vh <= 0) for (const r of T.ramps) if (k.s > r - RAMP_LEN && k.s < r) onRamp = true;
    if (!onRamp) {
      k.vh -= G * dt; k.h += k.vh * dt; k.air += dt;
      if (press && k.air > 0.1) k.trick = true; // trick: tap drift in the air
      if (k.h <= 0) {
        if (k.air > 0.5 && k.trick) { boost(R, k, TRICK_BOOST); ev(R, 'trick', k); }
        if (k.air > 0.35) ev(R, 'land', k, Math.min(1, -k.vh / 10));
        k.h = 0; k.vh = 0; k.air = 0; k.trick = false;
      }
    }
  }

  // ---- rung strips: each rung crossed adds boost and plays the next Dorian step ----
  if (k.s > s0 && k.h < 0.3) {
    for (let r = 0; r < T.rungs.length; r++) {
      const x = T.rungs[r];
      if (s0 < x && k.s >= x) {
        if (k.boost < 0.05) k.v += BOOST_KICK;
        k.boost = Math.min(RUNG_MAX, k.boost + RUNG_BOOST);
        ev(R, 'rung', k, r);
      }
    }
  }

  // ---- laps: progress stays continuous; a lap only counts after passing half way (no reverse-over-the-line cheese) ----
  if (k.s >= T.L) {
    k.s -= T.L;
    if (k.half) { k.lap++; k.half = false; if (!k.finished) ev(R, 'lap', k, k.lap); }
  } else if (k.s < 0) { k.s += T.L; k.lap--; k.half = true; }
  if (!k.half && k.s > T.L * 0.5 && k.s < T.L * 0.75) k.half = true;
  k.progress = k.lap * T.L + k.s;
  if (!k.finished && k.lap >= R.laps && R.phase === 'racing') { k.finished = true; k.finishT = R.t; ev(R, 'finish', k); }

  // ---- stuck for 3 s (pressing, not moving) -> respawn ----
  const pressing = inp.throttle > 0.1 || inp.brake > 0.1;
  k.stuckT = pressing && Math.abs(k.ds) < 0.8 && !k.finished ? k.stuckT + dt : 0;
  if (k.stuckT > STUCK_T) { k.resp = RESPAWN_T; k.respS = k.s + 3; k.drift = 0; k.boost = 0; ev(R, 'respawn', k); }

  // ---- wrong way ----
  const back = vs < -1 || (Math.abs(k.yaw) > 2.2 && k.v > 2);
  k.wrongT = back ? k.wrongT + dt : Math.max(0, k.wrongT - 2 * dt);
  const wrong = k.wrongT > WRONG_T;
  if (wrong !== k.wrong) { k.wrong = wrong; ev(R, 'wrong', k, +wrong); }
}

// ---------- race ----------
// phases: grid (dice-rolled grid + flyover) -> countdown (3-2-1-GO) -> racing -> done (karts keep cruising)
export function newRace(T, { cls = 'normal', laps = 3, seed = 1, karts = [newKart(0, 0, 0)], order = null, grid = true } = {}) {
  const R = { T, karts, laps, cls, top: TOP[cls], t: 0, clock: 0, acc: 0, ev: [], rng: mulberry32(seed), phase: grid ? 'grid' : 'racing', count: 3, endAt: Infinity, order: null,
    boxT: new Float32Array(T.boxes.length), coinT: new Float32Array(T.coins.length), bombs: [], bombId: 0 };
  // dice-rolled grid (Grand Prix passes the reverse standings instead): 2 columns 4 m apart, rows 6 m back
  R.order = order || shuffle(karts.map(k => k.i), R.rng);
  R.order.forEach((i, j) => {
    const k = karts[i];
    k.grid = j; k.s = T.L - 4 - 6 * (j >> 1); k.d = j % 2 ? 2 : -2; k.lap = -1; k.half = true; k.progress = k.lap * T.L + k.s;
    if (k.human < 0) { k.bias = (R.rng() - 0.5) * 2.4; k.skill = 0.985 + R.rng() * 0.015; k.startSkill = R.rng(); k.shortcut = R.rng() < 0.5; }
  });
  rank(R);
  return R;
}
function shuffle(a, rnd) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

const cpuIn = [];
const cpuSlot = k => cpuIn[k.i] ||= { steer: 0, throttle: 0, brake: 0, drift: false, item: false, back: false };
export function step(R, intents) {
  R.clock += STEP;
  const K = R.karts;
  if (R.phase === 'grid') {
    if (R.clock >= GRID_T) { R.phase = 'countdown'; R.clock = 0; R.count = 3; ev(R, 'count', K[0], 3); }
    return;
  }
  if (R.phase === 'countdown') {
    // throttle held from "3" spins out at GO; pressed in the last ~0.45 s before GO gives a start boost
    for (const k of K) {
      const inp = k.human >= 0 ? intents[k.human] || NO_INPUT : cpuStart(R, k);
      k.thrT = inp.throttle > 0.5 ? k.thrT + STEP : 0;
    }
    const n = 3 - Math.floor(R.clock);
    if (n !== R.count && n > 0) { R.count = n; ev(R, 'count', K[0], n); }
    if (R.clock >= COUNT_T) {
      R.phase = 'racing'; R.count = 0; R.clock = 0; ev(R, 'go', K[0]);
      for (const k of K) {
        if (k.thrT > COUNT_T - 1.05) { k.stun = SPIN_OUT; ev(R, 'spinOut', k); }
        else if (k.thrT > 0 && k.thrT <= 0.45) { boost(R, k, START_BOOST); ev(R, 'startBoost', k); }
      }
    }
    return;
  }
  R.t += STEP;
  rubber(R);
  for (const k of K) stepKart(R, k, k.human < 0 || k.finished ? cpu(R, k, cpuSlot(k)) : intents[k.human] || NO_INPUT, STEP);
  pickups(R);
  bombs(R);
  jokers(R);
  contacts(R);
  rank(R);
  if (R.phase === 'racing') endCheck(R);
}
// CPUs at the start: most press at the right moment, a few jump the gun, a few are late
function cpuStart(R, k) {
  const o = cpuSlot(k);
  const want = k.startSkill < 0.12 ? 0.5 : k.startSkill < 0.6 ? COUNT_T - 0.3 - k.startSkill * 0.2 : COUNT_T + 0.1;
  o.throttle = R.clock >= want ? 1 : 0;
  return o;
}
function endCheck(R) {
  let humans = 0, done = 0, all = true;
  for (const k of R.karts) {
    if (!k.finished) all = false;
    if (k.human >= 0) { humans++; if (k.finished) { done++; R.endAt = Math.min(R.endAt, k.finishT + END_AFTER); } }
  }
  if (humans ? done === humans || R.t >= R.endAt : all) {
    R.phase = 'done';
    for (const k of R.karts) if (!k.finished) k.dnf = true;
    ev(R, 'end', R.karts[0]);
  }
}

// rubber band: CPUs ease off ahead of the nearest human and push a little behind (0.92-1.06, strongest on Chill)
function rubber(R) {
  const g = RUBBER[R.cls];
  for (const k of R.karts) {
    if (k.human >= 0) continue;
    let gap = Infinity;
    for (const h of R.karts) if (h.human >= 0 && !h.finished && Math.abs(k.progress - h.progress) < Math.abs(gap)) gap = k.progress - h.progress;
    k.rubber = gap === Infinity ? 1 : clamp(1 - gap * g, 0.92, 1.06);
  }
}

// ---------- CPU driver: steer onto the racing line with a speed-based look-ahead, corner speed limit, drifts ----------
const steerRate = (R, v) => (STEER_LO + (STEER_HI - STEER_LO) * Math.min(1, v / R.top)) * Math.min(1, v / STEER_V0);
export function cpu(R, k, o) {
  const T = R.T, v = Math.max(0, k.v), look = 8 + 6 * Math.min(1, v / R.top);
  const hw = at(T, T.half, k.s + look) - 2.2; // keep the kart's own width off the wall
  let target = clamp(at(T, T.line, k.s + look) + k.bias, -hw, hw);
  for (const m of T.mouths) {
    let ahead = m.s - k.s; ahead -= T.L * Math.floor(ahead / T.L);
    if (ahead > 40) continue;
    if (m.fwd && k.shortcut && k.warpCd <= 0) target = m.d; // dive into the shortcut
    else if (!m.fwd && Math.abs(target - m.d) < 3.5) target = m.d > 0 ? m.d - 4 : m.d + 4; // and keep out of the way back
  }
  // props (gift boxes, lotus lanterns): aim for the wider gap beside the next one
  for (const p of T.props) {
    let ahead = p.s - k.s; ahead -= T.L * Math.floor(ahead / T.L);
    if (ahead > 26 || ahead < 1) continue;
    const clearance = p.r + KART_R + 0.8;
    if (Math.abs(target - p.d) < clearance) { const hw2 = at(T, T.half, p.s) - 1.2; target = p.d > 0 ? Math.max(-hw2, p.d - clearance) : Math.min(hw2, p.d + clearance); }
    break;
  }
  // moving walls: aim past the end with more room where the wall will be on arrival, favouring the side we're on
  for (const m of T.movers) {
    let ahead = m.s - k.s; ahead -= T.L * Math.floor(ahead / T.L);
    if (ahead > 35) continue;
    const md = moverD(m, R.t + ahead / Math.max(v, 6)), c = m.hw + KART_R + 0.8, hw2 = at(T, T.half, m.s) - 1.2;
    if (Math.abs(target - md) < c) target = hw2 - md - c + (k.d > md ? 2 : -2) > md - c + hw2 ? Math.min(hw2, md + c) : Math.max(-hw2, md - c);
    break;
  }
  const kap = at(T, T.kappa, k.s + v * 0.15);
  // desired yaw rate: follow the track's turning (feed-forward) + steer the heading onto the line
  const wDes = kap * v + (Math.atan2(target - k.d, look) - k.yaw) * 3;
  const rate = Math.max(0.2, steerRate(R, v));
  // corner speed: tightest curvature in the next ~1.4 s of road
  let kmax = 0, kavg = 0;
  for (let x = 4; x <= 32; x += 4) { const c = Math.abs(at(T, T.kappa, k.s + x * Math.max(1, v / 20))); kmax = Math.max(kmax, c); kavg += c / 8; }
  const vmax = 2 / (kmax + 0.9 / R.top) * (k.drift ? 1.2 : 1.08);
  o.throttle = v < vmax ? 1 : 0.2;
  o.brake = v > vmax + 3 ? 1 : 0;
  // drift through long curves, let go on the straight for the mini-turbo
  if (k.cpuDrift > 0) k.cpuDrift -= STEP;
  // only slide where the corner needs at least the drift's widest turn rate (0.6x), else it would cut into the wall
  const kNow = at(T, T.kappa, k.s + v * 0.3), need = Math.abs(kNow) * v / rate, kapSign = Math.sign(kNow);
  let propNear = false; // no sliding through a slalom: threading the gifts needs the grip
  for (const p of T.props) { let x = p.s - k.s; x -= T.L * Math.floor(x / T.L); if (x < 35) propNear = true; }
  for (const p of T.movers) { let x = p.s - k.s; x -= T.L * Math.floor(x / T.L); if (x < 35) propNear = true; }
  if (propNear && k.drift) { o.drift = false; k.cpuDrift = 0.6; }
  if (!k.drift && !o.drift && k.cpuDrift <= 0 && !propNear && need > 0.7 && kavg > 1 / 50 && v > 12 && k.h <= 0) { o.drift = true; o.steer = kapSign; return o; }
  if (k.drift && (need < 0.5 || kapSign === -k.drift)) { o.drift = false; k.cpuDrift = 0.6; }
  else if (!k.drift && o.drift && v < 9) o.drift = false;
  o.steer = clamp(k.drift ? k.drift * (wDes / (k.drift * rate * 0.95) - 1) / 0.4 : wDes / rate, -1, 1);
  if (k.lock > 0 || k.stun > 0) o.steer = 0;
  // items: Joker at once, Dash on a straight, Bubble when a bomb is near (or after 3 s), Bomb at someone 6-25 m ahead
  o.item = false; o.back = false;
  if (k.item && k.roll <= 0 && !k.joker && R.phase !== 'grid') {
    const it = k.item;
    if (it === 'joker') o.item = true;
    else if (it === 'dash') o.item = kavg < 1 / 120 && !k.drift;
    else if (it === 'bubble') o.item = k.holdT > 3 || R.bombs.some(b => b.owner !== k.i && Math.abs(gap(T, b.s, k.s)) < 25);
    else if (it === 'bomb') {
      o.item = R.karts.some(x => x !== k && gap(T, x.s, k.s) > 6 && gap(T, x.s, k.s) < 25 && Math.abs(x.d - k.d) < 3);
      if (!o.item && k.holdT > 8 && R.karts.some(x => x !== k && gap(T, k.s, x.s) > 3 && gap(T, k.s, x.s) < 12)) o.item = o.back = true;
    }
  }
  return o;
}
const gap = (T, a, b) => { let x = a - b; x -= T.L * Math.round(x / T.L); return x; }; // signed distance a - b along the lap

// ---------- kart-kart contact: circles in (s, d) space ----------
export function contacts(R) {
  const K = R.karts, L = R.T.L, r2 = 2 * KART_R;
  for (let i = 0; i < K.length; i++) for (let j = i + 1; j < K.length; j++) {
    const a = K[i], b = K[j];
    if (a.resp || b.resp || a.warp || b.warp || a.fly || b.fly || Math.abs(a.h - b.h) > 1.2) continue;
    let ds = b.s - a.s;
    if (ds > L / 2) ds -= L; else if (ds < -L / 2) ds += L;
    const dd = b.d - a.d, dist2 = ds * ds + dd * dd;
    if (dist2 >= r2 * r2 || dist2 < 1e-8) continue;
    const dist = Math.sqrt(dist2), nx = ds / dist, ny = dd / dist, over = r2 - dist;
    a.s -= nx * over / 2; b.s += nx * over / 2; a.d -= ny * over / 2; b.d += ny * over / 2;
    const closing = (a.v * Math.cos(a.yaw) - b.v * Math.cos(b.yaw)) * nx + (a.v * Math.sin(a.yaw) + a.push - b.v * Math.sin(b.yaw) - b.push) * ny;
    if (closing <= 0) continue;
    // sideways: shove apart; nose-to-tail: the one behind loses a little speed, the one ahead gets nudged on
    a.push -= ny * closing * 0.6; b.push += ny * closing * 0.6;
    if (Math.abs(nx) > 0.35) {
      const back = nx > 0 ? a : b, front = nx > 0 ? b : a;
      back.v -= Math.abs(nx) * closing * 0.5; front.v += Math.abs(nx) * closing * 0.25;
    }
    if (closing > BUMP_V) {
      R.ev.push({ type: 'bump', k: a.i, x: b.i, v: closing });
      if (Math.abs(ny) > 0.6 && closing > STUN_SIDE_V) {
        const slow = a.v < b.v ? a : b;
        if (!slow.stun) hit(R, slow, BUMP_STUN, 'bump');
      }
    }
  }
}

// fixed 1/120 s steps from a variable frame dt (at most MAX_STEPS per frame: a long hitch slows the race, never explodes it)
export function advance(R, dt, intents) {
  R.acc = Math.min(R.acc + dt, STEP * MAX_STEPS);
  let n = 0;
  while (R.acc >= STEP) { R.acc -= STEP; step(R, intents); n++; }
  return n;
}

// frame cap for the render loops (game.js): true = this display refresh comes too soon after the loop's last drawn
// frame, skip it. c: the loop's own clock { t }; fps 0 = uncapped. A 90/120 Hz phone otherwise drew every loop at the
// display's rate: the same picture as at 60, twice the heat
export function tooSoon(c, now, fps) {
  if (!fps) return false;
  const ms = 1000 / fps;
  if (now - c.t < ms - 2) return true; // 2 ms slack: a 60 Hz display's own refreshes jitter around 16.7 ms
  c.t = Math.max(c.t + ms, now - ms); // keeps the cadence even: at a 60 cap a 90 Hz phone draws 2 refreshes in 3
  return false;
}

// finished racers by finish time first, then everyone else by progress
const order = [], byPlace = (a, b) => a.finished !== b.finished ? (a.finished ? -1 : 1) : a.finished ? a.finishT - b.finishT : b.progress - a.progress;
export function rank(R) {
  order.length = 0;
  for (const k of R.karts) order.push(k);
  order.sort(byPlace);
  for (let j = 0; j < order.length; j++) order[j].place = j + 1;
}

// ---------- items ----------
export function pickItem(R, k) {
  const row = ODDS[Math.min(3, Math.floor((k.place - 1) / R.karts.length * 4))];
  let x = R.rng(), i = 0;
  while (i < 3 && x >= row[i]) { x -= row[i]; i++; }
  return ITEMS[i] === 'joker' && k.place === 1 ? 'dash' : ITEMS[i];
}
function useItem(R, k, back) {
  const it = k.item;
  k.item = null; k.holdT = 0;
  const ahead = it === 'joker' && R.karts.find(x => x.place === k.place - 1);
  if (it === 'dash' || (it === 'joker' && (!ahead || ahead.finished))) { boost(R, k, DASH_T); ev(R, 'dash', k); } // Joker in 1st turns into a Dash
  else if (it === 'bubble') { k.bubble = BUBBLE_T; ev(R, 'bubble', k); }
  else if (it === 'joker') { k.joker = SPOT_T; k.jokerOn = ahead.i; ev(R, 'jokerSpot', k, ahead.i); }
  else if (it === 'bomb') {
    // thrown forward in an arc, or dropped behind while looking back; it lands, rolls 0.6 s and blows up
    R.bombs.push({ id: R.bombId++, owner: k.i, s: k.s + (back ? -2 : 1.5), d: k.d, h: 1.1, vs: back ? Math.max(0, k.ds) * 0.5 : Math.max(0, k.ds) + 13, vh: back ? 1.5 : 6.5, air: true, roll: BOMB_ROLL, t: 0 });
    ev(R, 'throw', k, back ? -1 : 1);
  }
}
// a hit: a bubble soaks it up, otherwise STUN! and three coins scatter
export function hit(R, k, t, why) {
  if (k.inv > 0 || k.fly > 0 || k.resp > 0 || k.warp > 0 || k.finished && why !== 'bump') return false;
  if (k.bubble > 0) { k.bubble = 0; ev(R, 'pop', k); return false; }
  const lost = Math.min(3, k.coins);
  k.coins -= lost; k.stun = Math.max(k.stun, t);
  if (why === 'bomb') { k.soot = SOOT_T; k.v *= 0.35; if (k.h <= 0) k.vh = 4; }
  R.ev.push({ type: 'stun', k: k.i, x: lost, why });
  return true;
}
function addCoin(R, k) { // coins picked up within a second of each other count as a streak (the pickup sound alternates)
  if (k.coins < MAX_COINS) k.coins++;
  k.coinStreak = R.t - k.coinAt < 1 ? k.coinStreak + 1 : 0;
  k.coinAt = R.t;
}
function pickups(R) {
  const T = R.T, L = T.L;
  for (let i = 0; i < R.boxT.length; i++) if (R.boxT[i] > 0) R.boxT[i] = Math.max(0, R.boxT[i] - STEP);
  for (let i = 0; i < R.coinT.length; i++) if (R.coinT[i] > 0) R.coinT[i] = Math.max(0, R.coinT[i] - STEP);
  for (const k of R.karts) {
    if (k.resp || k.fly || k.warp || k.h > 1.8) continue;
    for (let i = 0; i < T.boxes.length; i++) {
      if (R.boxT[i] > 0) continue;
      const b = T.boxes[i], ds = gap(T, k.s, b.s), dd = k.d - b.d;
      if (ds * ds + dd * dd > BOX_R * BOX_R) continue;
      R.boxT[i] = BOX_T;
      if (!k.item && k.roll <= 0) { k.item = pickItem(R, k); k.roll = ROLL_T; R.ev.push({ type: 'box', k: k.i, x: i }); }
      else { addCoin(R, k); R.ev.push({ type: 'coin', k: k.i, x: k.coinStreak }); } // full: the box still pays a coin
    }
    for (let i = 0; i < T.coins.length; i++) {
      if (R.coinT[i] > 0) continue;
      const c = T.coins[i], ds = gap(T, k.s, c.s), dd = k.d - c.d;
      if (ds * ds + dd * dd > COIN_R * COIN_R) continue;
      R.coinT[i] = COIN_T; addCoin(R, k);
      R.ev.push({ type: 'coin', k: k.i, x: k.coinStreak, i });
    }
    // wormhole mouths
    if (k.warpCd <= 0 && k.h < 1.5) for (let m = 0; m < T.mouths.length; m++) {
      const M = T.mouths[m], ds = gap(T, k.s, M.s), dd = k.d - M.d;
      if (ds * ds + dd * dd < MOUTH_R * MOUTH_R) { k.warp = WARP_T; k.warpTo = M.to; k.drift = 0; k.driftT = 0; k.tier = 0; R.ev.push({ type: 'warpIn', k: k.i, x: m }); break; }
    }
  }
}
function bombs(R) {
  const T = R.T, L = T.L;
  for (let j = R.bombs.length - 1; j >= 0; j--) {
    const b = R.bombs[j];
    b.t += STEP;
    if (b.air) {
      b.vh -= G * STEP; b.h += b.vh * STEP; b.s += b.vs * STEP;
      if (b.h <= 0) { b.h = 0; b.air = false; R.ev.push({ type: 'bombLand', k: b.owner, x: b.id }); }
    } else { b.s += b.vs * STEP; b.vs *= Math.exp(-3 * STEP); b.roll -= STEP; }
    b.s = ((b.s % L) + L) % L;
    b.d = clamp(b.d, -at(T, T.half, b.s), at(T, T.half, b.s));
    // a kart running into it sets it off early (not its thrower in the first half second)
    let boom = !b.air && b.roll <= 0;
    for (const k of R.karts) if ((k.i !== b.owner || b.t > 0.5) && Math.abs(k.h - b.h) < 1.5) { const ds = gap(T, k.s, b.s), dd = k.d - b.d; if (ds * ds + dd * dd < 1.4 * 1.4) boom = true; }
    if (!boom) continue;
    R.bombs.splice(j, 1);
    R.ev.push({ type: 'blast', k: b.owner, x: b.id, s: b.s, d: b.d });
    for (const k of R.karts) { const ds = gap(T, k.s, b.s), dd = k.d - b.d; if (ds * ds + dd * dd + (k.h - b.h) ** 2 < BLAST_R * BLAST_R) hit(R, k, BOMB_STUN, 'bomb'); }
  }
}
// Joker: spotlight on the racer just ahead for 0.8 s, then they trade places along crossing arcs
function jokers(R) {
  for (const k of R.karts) {
    if (!k.joker || (k.joker -= STEP) > 0) continue;
    k.joker = 0;
    const t = R.karts[k.jokerOn];
    if (!t || t.finished || t.resp || t.warp || t.fly) { boost(R, k, DASH_T); ev(R, 'dash', k); continue; }
    if (t.bubble > 0) { t.bubble = 0; ev(R, 'pop', t); ev(R, 'jokerBlock', k, t.i); continue; } // the bubble soaks up the Joker
    for (const f of ['s', 'd', 'lap', 'half', 'progress']) { const x = k[f]; k[f] = t[f]; t[f] = x; }
    for (const x of [k, t]) { x.fly = FLY_T; x.push = 0; x.drift = 0; x.driftT = 0; x.tier = 0; x.stun = 0; }
    ev(R, 'jokerSwap', k, t.i);
    rank(R);
  }
}

// ---------- Grand Prix & Party Stakes (pure; DESIGN §9, §11) ----------
export const GP_ORDER = ['toy', 'story', 'neon', 'fest'];
export const POINTS = [15, 12, 10, 8, 7, 6, 5, 4];
export const gpPoints = (place, racers) => place <= Math.min(racers, POINTS.length) ? POINTS[place - 1] : 0;
// later Grand Prix races start in reverse standings: fewest points at the front (ties keep the earlier order)
export const reverseGrid = (karts, pts) => karts.map(k => k.i).sort((a, b) => (pts[karts[a].animal] || 0) - (pts[karts[b].animal] || 0) || a - b);
// Bill: humans only, by their finishing order (0 = best). Weights 0, 1, 2... normalised; every share rounded down to the
// currency step, the remainder goes to last place, so the amounts add up to the total and never fall toward the back.
export function billSplit(total, step, n) {
  if (n <= 0) return [];
  const w = Array.from({ length: n }, (_, i) => i), sum = w.reduce((a, b) => a + b, 0);
  if (!sum) return [total]; // one payer takes it all
  const out = w.map(x => Math.floor(total * x / sum / step) * step);
  out[n - 1] += total - out.reduce((a, b) => a + b, 0);
  return out;
}
// Teams: everyone split into two teams of equal size (±1), humans alternating A / B first, CPUs filling up
export function teamSplit(karts) {
  const team = [], count = [0, 0];
  karts.filter(k => k.human >= 0).forEach((k, j) => { team[k.i] = j % 2; count[j % 2]++; });
  for (const k of karts) if (k.human < 0) { const t = count[0] <= count[1] ? 0 : 1; team[k.i] = t; count[t]++; }
  return team;
}
// team score = sum of each member's place points
export const teamScores = (karts, team) => karts.reduce((s, k) => { s[team[k.i]] += gpPoints(k.place, karts.length); return s; }, [0, 0]);
