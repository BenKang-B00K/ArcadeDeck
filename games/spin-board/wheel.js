// Spin Board wheel: pure logic, no DOM.
// Angles in radians. Wheel-local angles run clockwise from 12 o'clock; θ is the wheel's rotation (clockwise +, the
// canvas convention), so wheel-local φ shows at screen angle φ + θ. The pointer sits at 12 o'clock.
// Lengths are in wheel radii (disc edge = 1).

export const TAU = 2 * Math.PI;
const mod = (x, m = TAU) => ((x % m) + m) % m;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const W0 = 1e-9; // narrower than this = gone (a knocked-out segment)

// ---------- layout ----------
// segments sized by weight: [{ a0, a1 }] wheel-local. A weight of 0 leaves an empty segment (a0 = a1)
export function layout(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let a = 0;
  return weights.map((w, i) => {
    const a0 = a;
    a = i === weights.length - 1 ? TAU : a + w / total * TAU; // last edge exactly closes the circle
    return { a0, a1: a };
  });
}

// segment holding wheel-local angle φ
export function segOf(segs, φ) {
  φ = mod(φ);
  const k = segs.findIndex(s => φ >= s.a0 && φ < s.a1);
  return k < 0 ? segs.length - 1 : k;
}

// pegs: one at every segment edge, plus one mid-segment while fewer than 8 live segments are left. Comeback slots
// (slot[i]) get their edges only; empty segments none. [{ φ (wheel-local), i (segment), mid }]
function pegList(segs, slot = []) {
  const live = segs.filter((s, i) => s.a1 - s.a0 > W0 && !slot[i]).length, list = [];
  segs.forEach((s, i) => {
    if (s.a1 - s.a0 <= W0) return;
    list.push({ φ: s.a0, i });
    if (live < 8 && !slot[i]) list.push({ φ: (s.a0 + s.a1) / 2, i, mid: true });
  });
  return list;
}
export const pegs = (segs, slot) => pegList(segs, slot).map(p => p.φ);
// the peg that cracks in section j: its centre peg while it has one, else the edge peg at its start
export function crackPeg(segs, slot, j) {
  const l = pegList(segs, slot), m = l.findIndex(p => p.i === j && p.mid);
  return m >= 0 ? m : l.findIndex(p => p.i === j);
}
// sections that may crack: live ones with a centre peg (its two halves just merge), or whose edge peg leaves both sections
// beside it at least CRACK_W wide. A missing edge peg merges two pockets, and the flapper can only come to rest in the
// one it ends up held in; next to a narrow section that would make the neighbour impossible to land on.
// ponytail: so equal boards above 15 sections never crack (no centre pegs, too narrow)
const CRACK_W = 0.4;
export function crackable(segs, slot = []) {
  const l = pegList(segs, slot), w = i => segs[i].a1 - segs[i].a0, n = segs.length;
  return segs.map((_, j) => j).filter(j => {
    if (w(j) <= W0 || slot[j]) return false;
    if (l.some(p => p.i === j && p.mid)) return true;
    let h = (j + n - 1) % n;
    while (w(h) <= W0) h = (h + n - 1) % n; // the section before it, past any knocked-out gaps
    return w(j) >= CRACK_W && w(h) >= CRACK_W;
  });
}

// ---------- roll ----------
// rad/s: slower flicks spring back, faster ones are capped; the hub button is a medium flick (≈ 5 s)
export const FLICK_MIN = 4, FLICK_MAX = 30, BUTTON = 15;
const T_MIN = 3.5, T_MAX = 7, T_REDUCED = 1.2, MIN_TURNS = 3;
// ponytail: first guesses, tune in play tests. A peg snaps on 2% of spins; its section's odds drop to half
export const PEG_BREAK = 0.02, CRACK = 0.5;
const NEVER = 1e9; // s of game time: a moment that doesn't come
// Spice: chance of [Teeter, Kickback, Gust, Joker (Match only)] per spin; on Wild the wheel three add up to 1.
// ponytail: the tipSpice strings spell these out by hand; change both together
export const SPICE = { mild: [0, 0, 0, 0], spicy: [0.3, 0.2, 0.2, 0], wild: [0.4, 0.3, 0.3, 0.4] };

// Everything is decided here, before the wheel moves.
// 1. Peg break (PEG_BREAK): section j uniform over the crackable ones (never a comeback slot; none while `crack` already is).
// 2. Segment k by weight, the cracked section (new or lasting) at CRACK of its weight.
// 3. A special (spice), pure drama: the path to k changes, never k.
//    Teeter: the main curve stops with one of k's edge pegs balanced on the flapper's tip, wobbles, then falls back
//      (k = the pocket that peg holds) or tips over (k = the pocket behind it). SO CLOSE!
//    Kickback: overshoots into the next segment, then rocks back onto k (it arrives going the other way). BOUNCE!
//    Gust: stops 1-2 segments short, pauses, then a gust carries it on to k. WHOOSH!
// 4. The stop inside k, checked with reads() for the way the wheel finally arrives, so the flapper really rests in k.
//    First aimed at the read angle; next to a missing peg the flapper may have to hang straight instead, so later tries
//    aim 12 o'clock with the pocket's far peg already slipped past (u range where that holds).
// Flick speed w (signed, rad/s) only sets the show: spin time T, travel D (>= 3 turns, >= the flick's natural travel),
// direction. The main curve θ(τ) = θ0 + D·(1 − (1 − τ/T)²) starts at 2D/T ≈ |w|; a special's legs follow it to r.end.
// opt: rng, reduced (short spin, no special), slot (comeback slots), crack / stub (Pick's lasting cracked section and its
// peg), breaks (false: no new break), spice ('mild' | 'spicy' | 'wild')
export function roll(weights, θ0, w, { rng = Math.random, reduced = false, slot = [], crack = -1, stub = -1, breaks = true, spice = 'mild' } = {}) {
  const segs = layout(weights), pins = pegs(segs, slot), can = crackable(segs, slot);
  const brk = breaks && crack < 0 && can.length > 1 && rng() < PEG_BREAK ? can[Math.floor(rng() * can.length)] : -1;
  const cj = brk >= 0 ? brk : crack, pw = weights.map((x, i) => i === cj ? x * CRACK : x);
  let x = rng() * pw.reduce((a, b) => a + b, 0), k = 0;
  while (k < pw.length - 1 && x >= pw[k]) x -= pw[k++];
  while (!pw[k]) k--; // rounding ran off the end onto an empty segment
  const pb = brk >= 0 ? crackPeg(segs, slot, brk) : -1, gone = pb >= 0 ? pb : stub;
  const s = Math.sign(w) || 1, sp = clamp(Math.abs(w), FLICK_MIN, FLICK_MAX);
  const T = reduced ? T_REDUCED : T_MIN + (T_MAX - T_MIN) * (sp - FLICK_MIN) / (FLICK_MAX - FLICK_MIN);
  const { a0, a1 } = segs[k], wk = a1 - a0, m = Math.min(0.4, Math.max(0.12, 0.04 / wk)), far = (READ + 0.03) / wk;
  const seg = TAU / Math.max(1, weights.filter((y, i) => y > 0 && !slot[i]).length); // a typical segment
  // a stop where the flapper, arriving going `dir`, rests in k
  const aim = dir => {
    let θ = 0, u = 0;
    for (let i = 0; i < 16; i++) {
      const hang = i >= 8, lo = hang && dir < 0 ? Math.max(m, far) : m, hi = hang && dir > 0 ? Math.min(1 - m, 1 - far) : 1 - m;
      u = lo + Math.max(0, hi - lo) * rng();
      θ = (hang ? 0 : dir * READ) - (a0 + u * wk);
      if (reads(segs, pins, θ, dir, gone) === k) return { θ, u, ok: true };
    }
    return { θ, u, ok: false };
  };
  const [pt, pk, pg] = SPICE[spice] ?? SPICE.mild, q = reduced ? 1 : rng();
  let kind = q < pt ? 'teeter' : q < pt + pk ? 'kick' : q < pt + pk + pg ? 'gust' : '', θ1 = 0, θf = 0, u = 0, legs = [];
  if (kind === 'teeter') {
    const back = rng() < 0.5, P = back === s > 0 ? a0 : a1, j = pins.findIndex(p => Math.abs(mod(p - P + Math.PI) - Math.PI) < 1e-9);
    θ1 = s * (READ - 0.02) - P; // held right at the tip; the wobble never lets it slip
    θf = s * (back ? READ - 0.06 : READ + 0.05) - P;
    if (j < 0 || j === gone || reads(segs, pins, θf, s, gone) !== k) kind = '';
    else { u = back === s > 0 ? 0 : 1; legs = [{ k: 'wobble', dur: 0.8, amp: 0.012 * s }, { k: 'ease', dur: 0.45, cue: true }]; }
  }
  if (kind === 'kick') {
    const a = aim(-s);
    if (!a.ok) kind = '';
    // rocks back at least 2·READ: the pegs that held the flapper going forward all clear its tip, so it arrives
    // going back exactly as a spin that way would (reads(-s)); on narrow boards that's a few segments
    else { ({ θ: θf, u } = a); θ1 = θf + s * Math.max(seg * (0.7 + 0.6 * rng()), 2 * READ + 0.1 + 0.1 * rng()); legs = [{ k: 'hold', dur: 0.12 }, { k: 'ease', dur: 0.55, cue: true }]; }
  }
  if (kind === 'gust') {
    const a = aim(s);
    if (!a.ok) kind = '';
    else { ({ θ: θf, u } = a); θ1 = θf - s * seg * (1 + rng()); legs = [{ k: 'hold', dur: 0.3 }, { k: 'ease', dur: 0.9, cue: true }]; }
  }
  if (!kind) { ({ θ: θf, u } = aim(s)); θ1 = θf; legs = []; }
  const rem = mod(s * (θ1 - θ0)), need = Math.max((reduced ? 1 : MIN_TURNS) * TAU, sp * T / 2);
  // tb / cue: game time of the peg snap / the special's moment; NEVER when there's none (finite: the roll travels to
  // watching phones in a message, and msgpack / JSON can't carry Infinity)
  const r = { k, u, T, θ0, D: s * (rem + Math.ceil((need - rem) / TAU) * TAU), Δ: θf - θ1, legs, sp: kind, brk, pb, tb: NEVER, cue: NEVER };
  r.end = T + legs.reduce((a, L) => a + L.dur, 0);
  if (kind) r.cue = T + legs.slice(0, legs.findIndex(L => L.cue)).reduce((a, L) => a + L.dur, 0);
  if (pb >= 0) {
    // the peg snaps the first time it passes 12 o'clock after 0.25 T: in the fast phase, while it bends the flapper.
    // D >= 3 turns puts that before 0.65 T. ponytail: a reduced-motion spin may not get there; it snaps at 0.25 T
    const t25 = 0.25 * T, θ25 = angleAt(r, t25), θb = θ25 + s * mod(-s * (pins[pb] + θ25));
    const tb = T * (1 - Math.sqrt(Math.max(0, 1 - (θb - θ0) / r.D)));
    r.tb = tb <= 0.65 * T ? tb : t25;
  }
  return r;
}

// [θ, dθ/dτ] at time τ: the main curve to T, then the special's legs (hold, a damped wobble, the final ease of Δ)
function motion(r, τ) {
  if (τ <= r.T) { const f = 1 - clamp(τ / r.T, 0, 1); return [r.θ0 + r.D * (1 - f * f), 2 * r.D / r.T * f]; }
  const θ1 = r.θ0 + r.D;
  let t = τ - r.T;
  for (const L of r.legs ?? []) {
    if (t < L.dur) {
      const f = t / L.dur, w = 5 * Math.PI;
      if (L.k === 'ease') return [θ1 + r.Δ * f * f * (3 - 2 * f), r.Δ * 6 * f * (1 - f) / L.dur];
      if (L.k === 'wobble') return [θ1 + L.amp * Math.sin(w * f) * (1 - f), L.amp * (w * Math.cos(w * f) * (1 - f) - Math.sin(w * f)) / L.dur];
      return [θ1, 0];
    }
    t -= L.dur;
  }
  return [θ1 + (r.Δ ?? 0), 0];
}
export const angleAt = (r, τ) => motion(r, τ)[0];
export const speedAt = (r, τ) => motion(r, τ)[1];

// ---------- knockout ----------
export const SLOT = 0.1; // a comeback slot is a tenth of the segment it was
// one knockout round on segment k (state K: wt, base, slot, used, outs). A live segment goes out, leaving a comeback
// slot the first time when comebacks are on; landing on a slot brings it back, once. Returns 'out' | 'back'.
// Each animal goes out at most twice and comes back at most once, so a run of n ends within 3n − 1 rounds
export function knock(K, k, comeback) {
  if (K.slot[k]) { K.slot[k] = false; K.used[k] = true; K.wt[k] = K.base[k]; return 'back'; }
  K.outs[k]++;
  K.slot[k] = comeback && !K.used[k] && K.outs[k] === 1;
  K.wt[k] = K.slot[k] ? K.base[k] * SLOT : 0;
  return 'out';
}
export const liveOf = K => K.wt.map((_, i) => i).filter(i => K.wt[i] > 0 && !K.slot[i]);

// ---------- match ----------
// Two rings of n. The outer one (results) carries the pegs and the pointer and spins as usual, cracks and all; the inner
// one (seats) turns the other way on the same clock and stops with seat i under outer section (i + off) % n. off is
// uniform, so with the outer ring shuffled every seat gets every result with chance 1/n, whatever the pointer does
export function matchRoll(n, θ0, φ0, w, opt = {}) {
  const rng = opt.rng ?? Math.random, r = roll(Array(n).fill(1), θ0, w, opt), off = Math.floor(rng() * n);
  const q = -Math.sign(r.D), end = θ0 + r.D + off * TAU / n, rem = mod(q * (end - φ0)), need = 0.6 * Math.abs(r.D);
  // Joker (Wild): after the stop, a uniform seat trades results with a uniform other one, so every seat stays at 1/n
  const jk = !opt.reduced && rng() < (SPICE[opt.spice] ?? SPICE.mild)[3] ? Math.floor(rng() * n) : -1;
  const jkP = jk < 0 ? -1 : (jk + 1 + Math.floor(rng() * (n - 1))) % n;
  return { ...r, off, φ0, Di: q * (rem + Math.ceil((need - rem) / TAU) * TAU), jk, jkP };
}
// the inner ring: its own curve to T, then locked to the outer one through the special's legs
export const innerAt = (r, τ) => τ <= r.T
  ? r.φ0 + r.Di * (1 - (1 - clamp(τ / r.T, 0, 1)) ** 2)
  : r.φ0 + r.Di + angleAt(r, τ) - (r.θ0 + r.D);

// ---------- pegs and flapper ----------
// Pegs on a ring at PEG_R. The flapper hangs from a pivot above the rim, tapering from FLAP_W0 to FLAP_W1 half-width;
// at rest its tip dips inside the peg ring, at the ±43° housing stop it clears it, so a peg can always slide past.
export const PEG_R = 0.9, PEG_CAP = 0.03, PIVOT = 1.22, FLAP_L = 0.38, FLAP_W0 = 0.06, FLAP_W1 = 0.014, FLAP_MAX = 43 * Math.PI / 180;
export const STEP = 0.001; // s: fixed physics step
const K = 1600, C = 16, BOUNCE = 0.3; // spring ≈ 6 Hz, light damping; restitution on a slap
const REST = 1; // rad/s: slower contacts just rest (no bounce, no tick)
const S_TIP = PEG_CAP + FLAP_W1, REACH = FLAP_L + S_TIP;
// widest screen angle a peg can be in reach at (law of cosines on pivot / centre / peg): where a slow peg slips off the tip
export const READ = Math.acos((PIVOT ** 2 + PEG_R ** 2 - REACH ** 2) / (2 * PIVOT * PEG_R));
const REACH_PSI = READ + 0.01;

// a peg at screen angle ψ, seen from the pivot: [β, δ] = the flapper angles it blocks are β ± δ; null = out of reach
export function gap(ψ) {
  const x = PEG_R * Math.sin(ψ), y = PIVOT - PEG_R * Math.cos(ψ), ρ = Math.hypot(x, y);
  if (ρ > REACH) return null;
  const δ = ρ <= FLAP_L ? Math.asin(Math.min(1, (FLAP_W0 + (FLAP_W1 - FLAP_W0) * ρ / FLAP_L + PEG_CAP) / ρ))
    : Math.acos(clamp((FLAP_L ** 2 + ρ ** 2 - S_TIP ** 2) / (2 * FLAP_L * ρ), -1, 1));
  return [Math.atan2(x, y), δ];
}

// Where the pointer reads with the board stopped at θ after a spin in direction s (+1 clockwise), pins[skip] broken.
// The flapper sits in a pocket between pegs: pegs that crossed 12 o'clock keep it bent until they slip off the tip at
// screen angle s·READ. It rests against the in-reach peg that bends it furthest, on that peg's far side; with none it
// hangs straight and reads 12 o'clock
export function reads(segs, pins, θ, s, skip = -1) {
  let best = 0, at = -θ;
  pins.forEach((p, j) => {
    const ψ = mod(p + θ + Math.PI) - Math.PI, g = j !== skip && s * ψ < READ && Math.abs(ψ) < REACH_PSI && gap(ψ);
    if (g && s * g[0] + g[1] > best) { best = s * g[0] + g[1]; at = p + s * 1e-6; }
  });
  return segOf(segs, at);
}

// flapper state: angle a (0 = straight down, + = tip to the right), speed v, which side of each peg in reach it is on,
// load = bend while a peg holds it (drives peg friction), passes = pegs forced through it (only a wild drag does that)
export const flapper = () => ({ a: 0, v: 0, side: new Map(), touch: new Set(), load: 0, passes: 0 });

// one STEP with the wheel at θ turning at θdot; pins[skip] is a broken stub, vel = each peg's own speed on the board
// (a re-forming knockout wheel). ev(type, size): 'hit' = flapper and peg collide (impact speed), 'snap' = a peg it was
// bent against slips off the tip (bend)
export function flapStep(F, pins, θ, θdot, ev, skip = -1, vel = null) {
  F.v += (-K * F.a - C * F.v) * STEP;
  F.a += F.v * STEP;
  if (Math.abs(F.a) > FLAP_MAX) { F.a = Math.sign(F.a) * FLAP_MAX; if (F.v * F.a > 0) F.v *= -BOUNCE; } // housing
  const touch = new Set();
  let push = -1;
  for (let j = 0; j < pins.length; j++) {
    const ψ = mod(pins[j] + θ + Math.PI) - Math.PI, g = j !== skip && Math.abs(ψ) < REACH_PSI && gap(ψ);
    if (!g) { F.side.delete(j); continue; }
    let sd = F.side.get(j);
    if (sd === undefined) F.side.set(j, sd = F.a >= g[0] ? 1 : -1);
    const edge = g[0] + sd * g[1];
    if (sd * (F.a - edge) > 1e-9) continue;
    const n = gap(ψ + (θdot + (vel?.[j] ?? 0)) * STEP), ve = n ? (n[0] + sd * n[1] - edge) / STEP : 0; // how fast the peg's edge moves
    const rel = F.v - ve;
    if (sd * rel < 0) {
      if (Math.abs(rel) < REST) F.v = ve;
      else { F.v = ve - BOUNCE * rel; ev?.('hit', Math.abs(rel)); }
    }
    F.a = edge;
    touch.add(j);
    push = j;
  }
  // a peg shoving the flapper into the housing: it can't bend further, so the peg goes through (fast drags only)
  if (Math.abs(F.a) > FLAP_MAX && push >= 0) {
    F.a = Math.sign(F.a) * FLAP_MAX;
    F.v = 0;
    F.side.set(push, -F.side.get(push));
    F.passes++;
  }
  // the peg slid off the tip of a bent flapper, which now swings back (a bounce swings away instead)
  for (const j of F.touch) if (!touch.has(j) && F.a * F.v < 0 && Math.abs(F.a) > 0.15) { ev?.('snap', Math.abs(F.a)); break; }
  F.touch = touch;
  F.load = touch.size ? Math.abs(F.a) : 0;
}

// the wheel moved θ0 → θ1 over `steps` STEPs (a drag, a spring-back, a resting board) while its pegs moved
// pins0 → pins1 (a re-forming knockout wheel). A different peg count means a new peg list: sides are worked out afresh
export function flapRun(F, pins0, θ0, θ1, steps, ev, skip = -1, pins1 = pins0) {
  const same = pins1.length === pins0.length, vel = same && pins1 !== pins0 ? pins0.map((p, j) => (pins1[j] - p) / (steps * STEP)) : null;
  if (!same) { F.side.clear(); F.touch.clear(); }
  for (let i = 1; i <= steps; i++) {
    const f = i / steps, pins = vel ? pins0.map((p, j) => p + (pins1[j] - p) * f) : pins1;
    flapStep(F, pins, θ0 + (θ1 - θ0) * f, (θ1 - θ0) / (steps * STEP), ev, skip, vel);
  }
}

// ---------- spin ----------
// The roll's curve runs on a game-time clock τ. Peg friction slows that clock while a peg holds the flapper bent,
// r = max(0.35, 1 − load / speed): nothing at full speed, a strain-and-pop on each peg in the crawl. The curve itself
// never changes, so the stop is still exactly θ(T). A rolled peg break fires ev('break') at τ = tb and its peg stops
// counting; stub = a peg already broken before the spin
export const spinner = r => ({ r, τ: 0, acc: 0, done: false, broke: false, cued: false });
export function advance(sp, F, pins, dt, ev, stub = -1, cap = 50) {
  sp.acc += dt;
  for (let n = 0; sp.acc >= STEP && n < cap; n++) { // <= cap steps a frame (dt is clamped to 0.05; ×3 fast forward triples it)
    sp.acc -= STEP;
    let rate = 0;
    if (!sp.done) {
      const v = Math.abs(speedAt(sp.r, sp.τ));
      rate = sp.τ < sp.r.T && F.load && v ? Math.max(0.35, 1 - F.load / v) : 1; // the specials keep their own timing
      sp.τ = Math.min(sp.r.end, sp.τ + STEP * rate);
      sp.done = sp.τ >= sp.r.end;
    }
    if (!sp.broke && sp.τ >= sp.r.tb) { sp.broke = true; ev?.('break', sp.r.pb); }
    if (!sp.cued && sp.τ >= sp.r.cue) { sp.cued = true; ev?.('cue', sp.r.sp); }
    flapStep(F, pins, angleAt(sp.r, sp.τ), speedAt(sp.r, sp.τ) * rate, ev, sp.broke ? sp.r.pb : stub);
  }
  sp.acc = Math.min(sp.acc, STEP); // dropped steps don't pile up
  return angleAt(sp.r, sp.τ);
}
