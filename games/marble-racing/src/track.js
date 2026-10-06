// Track generator: seed + players + tier -> TrackDef. PURE: no three.js, no Rapier, no DOM, no Math.random.
// Used by race.js (meshes), sim.js (colliders, sensors) and test.mjs. Same seed, n and tier give the same TrackDef.
//
// Layout: an arc-shaped start fan (every stall the same distance from its mouth, so no gate is favoured) pours into
// a wide peg board heading toward the viewer (+z). The course then spirals down round a central tower like a stadium:
// a front run along x, a 180° turn round the tower's end, a back run the other way, another turn, and so on. Every
// turn turns the same way (h = +1 right, -1 left, seeded), so the laps stack straight down. At the bottom the finish
// bends out toward the viewer. Gimmicks replace plain sides (pegs, ramp, jump, boost, narrow helix) and turns (carousel, mist tube).
//
// The course is swept from frames sampled along its floor centre line. Each frame has a position, tangent t, right r
// and up u (banked), arc length s and a cross-section: a rounded rectangle hw each side of the centre, H tall (the
// invisible collider lid), corner radii rb (floor) / rt (lid), and the visible wall heights wl / wr. The collider is
// the closed rounded rectangle, so a marble can never leave a channel; the view draws only the floor and the walls.

export const R = 0.5; // the unit: everything below is in multiples of it (the marble's radius once)
export const MR = 0.46; // marble radius: a touch smaller than the unit the track is built in, so it has room to pass
// tier -> stadium sides (at least: picks that don't fit add two), joker chance, modification slots
export const TRACKS = { short: { sides: 3, joker: 0.6, slots: 3 }, medium: { sides: 5, joker: 0.6, slots: 5 }, long: { sides: 7, joker: 0.6, slots: 7 } };
// modifications the player picks under the track length: the most of each kind per length [S, M, L]. Every pick takes
// a slot (3 carousels on Long take 3 of its 7). Turns: carousel, wormhole, trap, mist, boomerang, basin, whirlpool,
// roulette, fork; sides: ramp, jump, boost, narrow, trapdoor; mud: one patch on a plain straight. Pegs aren't picked: every
// course seeds 2-4 side peg boards onto its free sides (see build). Every course has one bowl (basin) for free, like the
// joker: no slot, picks add more (the max here counts only those). The key order is the buttons' order and the order
// fitMods keeps picks in. ponytail: one mist tube at most (the sim and the view follow a single one)
export const MODS = { carousel: [1, 2, 3], wormhole: [1, 2, 3], trap: [1, 2, 3], mist: [1, 1, 1], boomerang: [1, 2, 3], basin: [0, 1, 1],
  whirlpool: [1, 1, 1], roulette: [1, 1, 2], fork: [1, 1, 2], ramp: [1, 2, 3], jump: [1, 2, 2], boost: [1, 2, 3], narrow: [1, 2, 3], trapdoor: [1, 1, 2], mud: [2, 3, 4] };
export const DEFAULT_MODS = { short: { carousel: 1, trap: 1, mud: 1 }, medium: { boost: 1, wormhole: 1, trap: 1, mud: 1 },
  long: { wormhole: 1, carousel: 2, mist: 1, trap: 1, mud: 1 } };
const TIER = { short: 0, medium: 1, long: 2 };
// picks (saved, or from anywhere) cut back to the rules: known kinds, whole counts, each under its max, slots in order
export function fitMods(tier, picks) {
  const out = {};
  let left = TRACKS[tier].slots;
  for (const k of Object.keys(MODS)) {
    const v = Math.min(Math.max(0, Math.floor(+picks?.[k] || 0)), MODS[k][TIER[tier]], left);
    if (v) { out[k] = v; left -= v; }
  }
  return out;
}
export const TIER_TIME = { short: 20, medium: 30, long: 45 }; // median race seconds; the sim's time cap is 3x this

// ---------- tuning (geometry) ----------
const DEG = Math.PI / 180;
const WALL = 2.5 * R; // visible lip of a plain channel
const LID = 1.6; // collider lid over a channel: above the lip, and the gap is too small for a marble to slip out
const BOWL_WALL = 4 * R; // banked turns: outer wall
const BOWL_LID = 3;
const RC = 0.35; // floor corner radius (no sharp floor/wall seam to wedge in)
const SLOPE = [10, 12]; // plain runs, degrees
const BOWL_SLOPE = 9.5;
const BOWL_BANK = 26;
const BANK_PIVOT = 0.5; // 0 = bank about the floor's centre, 1 = about its inner edge
const PEG_SLOPE = [23, 27];
const PEG_GAP = 2.6 * R; // peg spacing in the staggered grid
const PEG_ROWS = 10; // rows on every peg board
// the first board takes every marble at once (the ring delivers them together, that's what makes it fair), so its
// pegs start lower and sit wider for a big crowd: 20 marbles packed against a 2.6R sieve arch and jam
const FIRST_RUNUP = 3.2;
export const BUMP_R = 0.3; // half-pegs straddling the walls (sim.js makes them bouncier)
const PEG_R = 0.25 * R;
// moguls on the finish run-in, like a ski slope's: balls sunk into the floor, a low cap showing, each its own height in
// MOG_H (MOG_B: the tallest one's foot), in staggered rows MOG_GAP apart (along, across: about, as fits the width)
const MOG_R = 2.2 * R, MOG_H = [0.3 * R, 0.8 * R], MOG_B = Math.sqrt(MOG_H[1] * (2 * MOG_R - MOG_H[1])), MOG_ROWS = 4, MOG_GAP = [3.2 * R, 4 * R];
const RUN_IN = 5 * DEG; // the run-in's slope: a little downhill (6° spread the pack: median margin 0.45 s -> 0.72 s)
const PEG_H = 1.2;
const SIDE = { short: [17, 18.5], medium: [17, 19.5], long: [17.5, 20.5] }; // stadium side length along x, seeded
const STALL = 2.6 * R; // stall pitch along the start arc (2.4R inside + divider)
const STALL_DEPTH = 1.6;
const FAN_SLOPE = 15; // start ring's cone in front of the stalls; 3° in them
const FLAP_H = 1.1;
// carousel: inner / outer radii follow the stadium (about 3R / 7R at 2-6 players)
const RING = { tilt: 3 * Math.PI / 180, wall: 2.2, omega: 2 * Math.PI * 0.5, seats: 6, divH: 0.7, hook: 0.45 }; // hook: lip at each divider's outer end
const WARP_TIME = 0.8; // seconds from dropping into hole A to popping out of hole B
const HOLE_R = [1.2, 1.45]; // hole radius in R: a marble has to roll right over it to fall in, so most miss
const TRAP_HW = 2 * R, TRAP_LEAD = 3; // trap lane half-width; how far its wide turn starts past the tower's end
const TRAP_R = [1, 1.2], TRAP_SLOPE = 7.5; // trap pad radius in R (a little smaller than a wormhole's); lane slope, degrees
const MUD_LEN = [2.2, 3.2], MUD_W = [0.4, 0.65]; // patch length; its share of the channel's width
// the late shufflers (whirlpool, roulette, fork, trapdoor) are timed in seconds; V_REF turns a time into a length: a
// marble's median speed through the late turns (measured with node test.mjs shuffle)
export const V_REF = 11;
// whirlpool: a bowl 1.35x as wide (drain radius in marble radii: a plain bowl's; narrower, marbles rattled round its
// rim for seconds); each marble's current holds it high round the wall for its own hold (s, from the sim's RNG), pushing
// it toward vCur round the drain (u/s², u/s) and out against the wall; once let go its swirl is damped (1/s) and it's
// drawn in toward the drain (u/s²), so the big dish empties about as quickly as a plain bowl
const WHIRL = { grow: 1.35, drain: 2, hold: [2, 5], spin: 9, vCur: 12, out: 2.5, drag: 1.5, pull: 6 };
// wormhole roulette: s a JACKPOT gains on NEXT (its exit sits JACK_S * V_REF further on), the wheel's turn rate (rad/s),
// its sectors (JACKPOT | NEXT | LOST, shares of a turn), a LOST marble's drift (s, against NEXT's WARP_TIME)
const JACK_S = 1, ROULETTE = { omega: 2.4, sectors: [0.25, 0.5, 0.25], lost: 3 };
// fork switch: s EXPRESS gains on MAIN; the signal's cycle (s) and its shares (EXPRESS | MAIN | LONG)
const FORK = { exp: 1, period: 0.9, split: [0.3, 0.4, 0.3] };
// trapdoor: pairs of lids zigzagging down the course, one on each half, each lid its own (seeded) clock: len along the
// course, sep between a pair's two lids, gap of open floor between pairs; the cycle (s): warning blink, lift, open
// (eats), shut; the side track starts drop under the floor and is sized so an eaten marble loses about s seconds (two
// 0.45 s hops in and out, sim.js HOP_T, then the roll round)
const DOOR = { pairs: 3, len: 1.2, sep: 0.3, gap: 1.2, run: 2, period: 4, warn: 0.8, lift: 0.3, open: 0.6, mid: 0.12, edge: 0.3, drop: 1.5, s: 1.5, hops: 0.9 };
const doorAt = k => k * (DOOR.len + DOOR.sep) + (k >> 1) * DOOR.gap; // where lid k starts, past the first one's start
const DOOR_FIELD = doorAt(2 * DOOR.pairs - 1) + DOOR.len; // from the first lid's start to the last one's end
const DS = 0.35; // frame spacing on curves and transitions
const CLEAR = 2 * R; // clearance between the boxes of modules that aren't neighbours
const THICK = 0.3; // track shell thickness (boxes only)

// frame layout in the Float32Arrays: FS floats per frame
export const FS = 21;
export const F = { x: 0, tx: 3, rx: 6, ux: 9, s: 12, hw: 13, H: 14, wl: 15, wr: 16, rb: 17, rt: 18, flags: 19, mod: 20 };
export const TUBE = 1; // flag: frames drawn as a closed frosted tube, not an open channel
export const TRAPF = 2; // flag: a trap lane (drawn in the warning colour)
export const GLASS = 4; // flag, with TUBE: clear glass instead of frosted (the narrow tube: watch the queue)
// points round a cross-section: 4 corner arcs of K segments, the floor split in FL. A whole-width floor quad twists
// where a turn banks and folds along its diagonal into a sawtooth that kicks marbles into the air
const K = 6, FL = 8;
export const NP = 4 * (K + 1) + FL - 1;
export const overlap = { last: null }; // why the last layout was rejected (tests / debugging)

export const mulberry32 = a => () => {
  a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
// channel inner width: 7R up to 6 players (room to pass the marble in front), rising to 11R at 20
const W_MIN = 7;
export const chanW = n => R * (W_MIN + 4 * Math.min(1, Math.max(0, (n - 6) / 14)));
const wideHw = W => Math.min(W, 3.2); // half-width of a wide special (peg board on a side, jump landing)
const crowd = W => Math.min(1, Math.max(0, (W / R - W_MIN) / 2.5)); // 0 up to 6 players, 1 from 15
const sidePegGap = W => PEG_GAP + R * 0.8 * crowd(W);

// ---------- quick-fill splits (pure; game.js rolls them, test.mjs checks them) ----------
export const shuffleWith = (a, rand) => {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
// `units` split into n random parts: stars and bars, so every split is equally likely.
// zeros = null: any part may be 0. zeros = z: exactly z parts are 0, the others get at least 1 unit each
// (fewer payers if there aren't enough units to go round)
export function split(units, n, zeros, rand) {
  const k = Math.max(1, Math.min(n - (zeros ?? 0), zeros == null ? n : units)), min = zeros == null ? 0 : 1;
  const slots = units - k * min + k - 1, bars = new Set();
  while (bars.size < k - 1) bars.add(Math.floor(rand() * slots));
  const pts = [-1, ...[...bars].sort((a, b) => a - b), slots];
  return shuffleWith([...Array(k).keys()].map(i => pts[i + 1] - pts[i] - 1 + min).concat(Array(n - k).fill(0)), rand); // scatter the zeros
}
// ratio: 20 five-percent units, re-rolled until no share tops 50% (zeros <= n - 2 keeps that possible)
// ponytail: rejection loop, worst case 2 non-zero places (~19-21 tries, always 50/50); fine at this size
export function ratioSplit(n, zeros, rand) {
  let r;
  do r = split(20, n, zeros, rand).map(u => u * 5); while (Math.max(...r) > 50);
  return r;
}
// bill: whole currency steps, no cap, so one payer may take it all; the leftover below one step goes to a random
// payer so the amounts add up to the total exactly
export function billSplit(total, step, n, zeros, rand) {
  const b = split(Math.floor(total / step), n, zeros, rand).map(u => u * step), payers = b.map((v, i) => v ? i : -1).filter(i => i >= 0);
  b[payers.length ? payers[Math.floor(rand() * payers.length)] : Math.floor(rand() * n)] += total % step;
  return b;
}
// teams: sizes differ by at most one, members scattered over the places
export const teamSplit = (n, teams, rand) => shuffleWith([...Array(n).keys()].map(i => i % teams), rand);

const smooth = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
const lerp = (a, b, f) => a + (b - a) * f;
const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));
const PROF = ['hw', 'H', 'wl', 'wr', 'rb', 'rt'];

// mods: the player's picks (count per kind, see MODS); left out = the length's defaults. Picks that don't fit the
// stadium (more turn or side specials than it has turns or free sides), or a layout that keeps failing the overlap
// check, get two more sides
const TIGHT = 'tight';
export function makeTrack(seed, n, tier, mods = DEFAULT_MODS[tier]) {
  const picks = fitMods(tier, mods);
  for (let grow = 0; grow < 6; grow++) for (let k = 0; k < 30; k++) {
    const def = build(seed >>> 0, n, tier, k, picks, grow);
    if (def === TIGHT) break;
    if (def) return def;
  }
  throw new Error(`no track layout for seed ${seed}, n ${n}, ${tier}`);
}
// do these picks fit the length's own sides (no lap more)? Plan only, so it's cheap enough to call per candidate pick
export const fits = (seed, n, tier, mods) => build(seed >>> 0, n, tier, 0, fitMods(tier, mods), 0, true) === true;

// cross-section: NP points of the rounded rectangle, counter-clockwise looking along +t (x right, y up), starting at
// the top-left corner; the floor between the bottom arcs is split in FL. Writes [x0, y0, x1, y1...] into out
export function profile(hw, H, rb, rt, out = new Float32Array(NP * 2)) {
  const C = [[-hw + rt, H - rt, rt, 90], [-hw + rb, rb, rb, 180], [hw - rb, rb, rb, 270], [hw - rt, H - rt, rt, 0]];
  let k = 0;
  C.forEach(([cx, cy, r, a0], c) => {
    for (let j = 0; j <= K; j++) {
      const a = (a0 + j * 90 / K) * DEG;
      out[k++] = cx + Math.cos(a) * r; out[k++] = cy + Math.sin(a) * r;
    }
    if (c === 1) for (let j = 1; j < FL; j++) { out[k++] = lerp(-hw + rb, hw - rb, j / FL); out[k++] = 0; } // the floor
  });
  return out;
}

// ---------- turtle: integrates the centre line and emits frames ----------
function emit(T) {
  const ca = Math.cos(T.a), sa = Math.sin(T.a), ct = Math.cos(T.th), st = Math.sin(T.th);
  const tx = ca * ct, ty = -st, tz = sa * ct; // tangent, pitched down by th (yaw a: 0 = +x, +90° = +z)
  const r0x = -sa, r0z = ca; // horizontal right
  const u0x = -r0z * ty, u0y = r0z * tx - r0x * tz, u0z = r0x * ty; // u0 = r0 x t
  const cb = Math.cos(T.b), sb = Math.sin(T.b); // bank: up leans toward the right by b
  const rx = r0x * cb - u0x * sb, ry = -u0y * sb, rz = r0z * cb - u0z * sb;
  // banked about a point between the centre and the inner edge: the outside rises, the inside drops only a little
  // from under a marble hugging it (it would fly and slam into the outer wall), and the centre doesn't climb so fast
  // that a slow marble stalls at a turn's entry
  const k = BANK_PIVOT * Math.sign(T.b) * T.hw, x = T.x + k * (r0x - rx), y = T.y - k * ry, z = T.z + k * (r0z - rz);
  T.chain.f.push(x, y, z, tx, ty, tz, rx, ry, rz,
    u0x * cb + r0x * sb, u0y * cb, u0z * cb + r0z * sb,
    T.s, T.hw, T.H, T.wl, T.wr, T.rb, T.rt, T.flags, T.mod);
  T.line.push(x, y, z, T.s);
}

function newChain(T, capStart = null) {
  T.chain = { f: [], capStart, capEnd: null };
  T.chains.push(T.chain);
  emit(T);
}

// curvature profile of a turning piece: ramps up over the first f of its length and down over the last f (an
// easement, like a road's clockwise spiral). A marble meeting a turn at full curvature slams the outer wall and loses
// a third of its speed; eased in, it rolls up the wall instead. yawAt(u, f) is the share of the turn done at u
const RAMP = 0.3;
const curv = (u, f) => f ? smooth(Math.min(u, 1 - u) / f) : 1;
const YAW = new Map();
function yawAt(u, f) {
  if (!f) return u;
  let tab = YAW.get(f);
  if (!tab) { // cumulative integral of curv, normalised to 0..1, sampled at 256 points
    tab = new Float64Array(257);
    for (let i = 1; i <= 256; i++) tab[i] = tab[i - 1] + curv((i - 0.5) / 256, f);
    for (let i = 1; i <= 256; i++) tab[i] /= tab[256];
    YAW.set(f, tab);
  }
  const x = u * 256, i = Math.min(255, Math.floor(x));
  return lerp(tab[i], tab[i + 1], x - i);
}
// sideways / forward displacement per unit of horizontal length for a turn of angle th with ramp f
function turnDisp(th, f) {
  let s = 0, c = 0;
  for (let i = 0; i < 400; i++) { const a = th * yawAt((i + 0.5) / 400, f); s += Math.sin(a) / 400; c += Math.cos(a) / 400; }
  return { side: s, fwd: c };
}

// len along the path; o.turn total yaw change (+ = right) with o.ramp easing (default RAMP), o.pitch target pitch
// (eased in over o.ease), o.bank peak bank (signed, eased in and out), profile targets eased over the whole piece
function piece(T, len, o = {}) {
  const turn = o.turn || 0, f = turn ? o.ramp ?? RAMP : 0, a0 = T.a, th0 = T.th, th1 = o.pitch ?? T.th, ease = o.ease ?? Math.min(1.5, len / 2);
  const p0 = PROF.map(k => T[k]), p1 = PROF.map(k => o[k] ?? T[k]), bank = o.bank || 0;
  const varies = turn || th1 !== th0 || bank || p1.some((v, i) => v !== p0[i]);
  const k = Math.max(1, Math.ceil(len / (varies ? DS : 1.5))), ds = len / k;
  for (let j = 1; j <= k; j++) {
    const u = j / k, um = (j - 0.5) / k, thm = lerp(th0, th1, smooth(um * len / ease)), am = a0 + turn * yawAt(um, f);
    T.x += Math.cos(am) * Math.cos(thm) * ds;
    T.y -= Math.sin(thm) * ds;
    T.z += Math.sin(am) * Math.cos(thm) * ds;
    T.a = a0 + turn * yawAt(u, f);
    T.th = lerp(th0, th1, smooth(u * len / ease));
    T.b = bank * smooth(Math.min(u, 1 - u) * 2.5); // eased over 40% each end: a turn's entry never climbs
    PROF.forEach((key, i) => { T[key] = lerp(p0[i], p1[i], smooth(u)); });
    T.s += ds;
    emit(T);
  }
}

// ---------- layout ----------
function build(seed, n, tier, retry, picks, grow, planOnly) {
  // two streams: the plan (turn hand, what goes where, start jitter) comes from the seed alone, so a retried layout
  // keeps the advertised odds; lengths, slopes and angles come from seed + retry
  const plan = mulberry32(seed), rng = mulberry32(seed ^ Math.imul(retry + 1, 0x9E3779B9));
  const rnd = (a, b) => a + (b - a) * rng();
  const sides = TRACKS[tier].sides + 2 * grow, nOf = k => picks[k] || 0;
  const W = chanW(n), hw = W / 2, h = plan() < 0.5 ? 1 : -1;
  // wide specials (peg board, jump landing) are twice a channel, capped so a big crowd doesn't blow up the stadium;
  // stadium depth (front column to back column) leaves a wide side facing a plain one room to spare (two facing each
  // other: deeper, see the plan)
  const WW = wideHw(W);
  let D = Math.max(WW + W / 2 + 2.2, W + 3.2);
  const slope = () => rnd(...SLOPE) * DEG;
  // what a side's special takes along it (pegs: widen, rows, funnel out)
  const specLen = sp => ({ pegs: 1.5 + 0.8 + (PEG_ROWS - 1) * sidePegGap(W) * Math.sqrt(3) / 2 + 0.8 + 2.6, ramp: 6, jump: 8.9, boost: 6, narrow: NARROW.fan + NARROW.comb + narrowLen + NARROW.drop + NARROW.merge + NARROW.flare,
    trapdoor: 1 + DOOR_FIELD + DOOR.run + 1.5 }[sp] || 0);
  const T = { x: 0, y: 0, z: 0, a: Math.PI / 2, th: 0, b: 0, s: 0, flags: 0, mod: 0,
    hw: W, H: LID, wl: WALL, wr: WALL, rb: RC, rt: 0.1, chain: null, chains: [], line: [] };
  const mods = [], pegs = [], boosts = [], jumps = [], holes = [], traps = [], coils = [], moguls = [];
  const rings = [], booms = [], basins = [];
  let mist = null;
  const mod = (type, extra = {}) => {
    const m = { type, index: mods.length, s0: T.s, s1: T.s, color: mods.length % 3, ...extra };
    T.mod = m.index;
    mods.push(m);
    return m;
  };
  const end = m => { m.s1 = T.s; };
  const take = list => list.splice(Math.floor(plan() * list.length), 1)[0];
  // the late shufflers take the latest turn that suits them, short of the last (a crowd jams the finish bend) unless
  // that's all there is: a shuffle in the first half gets ironed out again
  const latest = ok => ok.filter(j => j < sides - 2).at(-1) ?? ok.at(-1) ?? -1;

  // ---- plan: what each side carries and what each turn is, from the picks. Sides alternate front (even) / back (odd)
  // the half sides at both ends stay plain; wide specials (pegs, jump) keep off neighbouring sides, which face each
  // other across the tower, where they can. A pick with no room left: TIGHT
  const special = Array(sides).fill(null), turns = Array(sides - 1).fill('bowl'), free = [...Array(sides).keys()].slice(1, -1);
  // mist / carousels first, never on the last turn, nor the first but for a carousel with no other turn left (Short: on
  // the last, a big crowd crawling off the ring jammed in the finish bend; the first leaves a whole side to spread out
  // on); the side after a carousel stays plain (its S-bend back onto the column line eats into its length)
  const inner = [...turns.keys()].slice(1, -1);
  for (let k = nOf('whirlpool'); k > 0; k--) { // first, on the latest inner turn (a bowl: the next side needs no S-bend)
    const q = inner.length ? inner.pop() : turns.length > 1 && turns[0] === 'bowl' ? 0 : -1;
    if (q < 0) return TIGHT;
    turns[q] = 'whirlpool';
  }
  for (let k = nOf('mist'); k > 0; k--) { if (!inner.length) return TIGHT; turns[take(inner)] = 'mist'; }
  for (let k = nOf('carousel'); k > 0; k--) {
    const q = inner.length ? take(inner) : turns.length > 1 && turns[0] === 'bowl' ? 0 : -1;
    if (q < 0) return TIGHT;
    turns[q] = 'carousel';
    if (free.includes(q + 1)) free.splice(free.indexOf(q + 1), 1);
  }
  // boomerangs the same way (the side after one stays plain too: its run out and peg cluster eat into it)
  for (let k = nOf('boomerang'); k > 0; k--) {
    const q = inner.length ? take(inner) : turns.length > 1 && turns[0] === 'bowl' ? 0 : -1;
    if (q < 0) return TIGHT;
    turns[q] = 'boomerang';
    if (free.includes(q + 1)) free.splice(free.indexOf(q + 1), 1);
  }
  for (let k = nOf('basin') + 1; k > 0; k--) { // the free bowl + picks; they pick their turn like carousels; the next side needs no S-bend
    const q = inner.length ? take(inner) : turns.length > 1 && turns[0] === 'bowl' ? 0 : -1;
    if (q < 0) { if (k === 1 && nOf('whirlpool')) break; return TIGHT; } // no turn left for the free one: the whirlpool is the course's bowl
    turns[q] = 'basin';
  }
  // wormhole roulettes on plain turns; the sides either side keep no special: the funnel spans the channel (after a peg
  // board only a few units of straight are left for it) and the JACKPOT exit lands on plain straight
  const rouAt = new Set();
  for (let k = nOf('roulette'); k > 0; k--) {
    const q = latest([...turns.keys()].filter(j => turns[j] === 'bowl' && !rouAt.has(j)));
    if (q < 0) return TIGHT;
    rouAt.add(q);
    for (const j of [q, q + 1]) if (free.includes(j)) free.splice(free.indexOf(j), 1);
  }
  const isWide = sp => sp === 'pegs' || sp === 'jump' || sp === 'narrow'; // a narrow helix's coils reach 3.2 out
  const side = sp => {
    const apart = free.filter(k => !isWide(sp) || !isWide(special[k - 1]) && !isWide(special[k + 1])), ok = apart.length ? apart : free;
    if (!ok.length) return false;
    const k = ok[Math.floor(plan() * ok.length)];
    free.splice(free.indexOf(k), 1); special[k] = sp;
    return true;
  };
  // the wide one first, it's the fussy one; then 2-4 peg boards on whatever sides are still free (never a lap more, so a
  // packed Short may get none; its own second peg board sits on the finish approach regardless).
  // Two wide ones that have to face each other get a deeper stadium rather than another lap. Trapdoors before them all,
  // on the latest free sides
  for (let k = nOf('trapdoor'); k > 0; k--) { if (!free.length) return TIGHT; special[free.pop()] = 'trapdoor'; }
  for (const sp of ['jump', 'ramp', 'boost', 'narrow']) for (let k = nOf(sp); k > 0; k--) if (!side(sp)) return TIGHT;
  for (let k = 2 + Math.floor(plan() * 3); k > 0 && free.length; k--) side('pegs');
  if (special.some((sp, k) => isWide(sp) && isWide(special[k + 1]))) D = Math.max(D, 2 * WW + 2.2);
  // side length: seeded, but long enough for the longest special plus a 3.3 lead each side of it
  const L = Math.max(rnd(...SIDE[tier]), Math.max(0, ...special.map(specLen)) + 6.6);
  // a wormhole skips a plain turn: mouth A near the end of the side before it, B near the start of the side after
  // a fork's long lane goes round like a trap route's (not the first turn: it runs under the start), so neither runs beside
  // a trapdoor's side track; forks first, on the latest turns, then the wormholes and trap routes at random
  const lane = j => j > 0 && turns[j] === 'bowl' && !rouAt.has(j) && special[j] !== 'trapdoor' && special[j + 1] !== 'trapdoor';
  const forkAt = new Set();
  for (let k = nOf('fork'); k > 0; k--) {
    const q = latest([...turns.keys()].filter(j => lane(j) && !forkAt.has(j)));
    if (q < 0) return TIGHT;
    forkAt.add(q);
  }
  const holeTurns = [...turns.keys()].filter(k => turns[k] === 'bowl' && !rouAt.has(k) && !forkAt.has(k));
  const holeAt = new Set();
  for (let k = nOf('wormhole'); k > 0; k--) { if (!holeTurns.length) return TIGHT; holeAt.add(take(holeTurns)); }

  // ---- start ring, its drop hole and catch box, then the first peg board out of the box's front ----
  const fan = startRing(n, W, plan);
  // a trap route goes the long way round a plain turn (not the first, it runs under the start; not a wormhole's),
  // each at the other end of the tower from the one before where it can
  const trapTurns = [...turns.keys()].filter(k => lane(k) && !holeAt.has(k) && !forkAt.has(k)), trapAt = new Set();
  for (let k = nOf('trap'), last = -1; k > 0; k--) {
    const other = trapTurns.filter(j => j % 2 !== last % 2), pool = other.length ? other : trapTurns;
    if (!pool.length) return TIGHT;
    const q = take(pool);
    if (pool !== trapTurns) trapTurns.splice(trapTurns.indexOf(q), 1);
    trapAt.add(q); last = q;
  }
  if (planOnly) return true; // fits(): the picks fit this many sides, no geometry needed
  mod('hopper', { fan });
  // progress on the ring: straight down the hole's axis (a marble's height on the cone gives its distance to the hole)
  const s1 = -Math.hypot(fan.z0, fan.floorAt(fan.z0) + DROP), s0 = s1 - fan.y(fan.rMid) - DROP;
  T.line.push(0, fan.y(fan.rMid), 0, s0, 0, -DROP, 0, s1);
  Object.assign(T, { x: 0, y: fan.floorAt(fan.z0), z: fan.z0, th: BOX_PITCH * DEG });
  const board = mod('pegs', { first: true });
  newChain(T);
  pegBoard(T, PEG_ROWS, rnd(29, 33) * DEG, W, pegs, board.index);
  piece(T, 2.5, { hw, pitch: slope(), ease: 2.5 });
  end(board);

  // ---- run-out toward the viewer, so the stadium's back column starts clear of the board, then the bend ----
  const bendR = Math.max(3, hw + 1.8), out = mod('ramp', { runout: true }); // runout: not a picked ramp (no name sign)
  piece(T, Math.max(0, D + hw + 1.6 - bendR) + 1, { pitch: 12 * DEG });
  end(out);
  const bend = mod('bend');
  piece(T, bendR * Math.PI / 2, { turn: h * Math.PI / 2, bank: h * 14 * DEG, H: BOWL_LID, rb: hw - 0.02, pitch: 8 * DEG, wl: h > 0 ? BOWL_WALL : WALL, wr: h > 0 ? WALL : BOWL_WALL });
  piece(T, 1.2, { H: LID, rb: RC, wl: WALL, wr: WALL });
  end(bend);
  const zFront = T.z, zBack = zFront - D;
  const target = k => ({ x: k === sides - 1 ? 0 : (k % 2 ? 1 : -1) * h * L / 2, z: k % 2 ? zBack : zFront });

  // ---- sides and the turns between them ----
  for (let k = 0; k < sides; k++) {
    const tgt = target(k), dir = Math.sign(tgt.x - T.x) || (k % 2 ? h : -h);
    if (Math.abs(T.z - tgt.z) > 0.08) { const m = mod('straight'); sBend(T, tgt.z - T.z, dir, slope()); end(m); } // after a carousel
    const left = () => Math.max(0.5, (tgt.x - T.x) * dir / Math.cos(T.th)), sp = special[k];
    const spLen = specLen(sp);
    const m1 = mod('straight'), first = k === 0; // the first side and turn drop steeper, to pass well under the run-out
    piece(T, sp ? Math.max(3, (left() - spLen) / 2) : left() * (k === sides - 1 ? 1 : 0.5), { pitch: first ? SLOPE[1] * DEG : slope() });
    end(m1);
    if (holeAt.has(k - 1) || rouAt.has(k - 1)) holes[holes.length - 1].b = { s: m1.s0 + Math.min(2.5, (m1.s1 - m1.s0) * 0.5), mod: m1.index };
    if (trapAt.has(k - 1) || forkAt.has(k - 1)) traps[traps.length - 1].b = { s: m1.s0 + Math.min(2.5, (m1.s1 - m1.s0) * 0.5), mod: m1.index };
    // a roulette's JACKPOT exit: JACK_S on from NEXT along this (plain) side, clear of the next turn's mouth
    const jack = () => { if (rouAt.has(k - 1)) { const w = holes.at(-1); w.jack = { s: w.b.s + Math.max(1.5, Math.min(JACK_S * V_REF, T.s - 4 - w.b.s)) }; } };
    if (sp === 'pegs') { const m = mod('pegs'); pegSide(T, W, rnd(...PEG_SLOPE) * DEG + crowd(W) * 3 * DEG, pegs, m.index, slope()); end(m); }
    if (sp === 'ramp') { const m = mod('ramp'); piece(T, 2, { pitch: rnd(12, 15) * DEG }); piece(T, 2); piece(T, 2, { pitch: slope() }); end(m); }
    if (sp === 'boost') { const m = mod('boost'); piece(T, 1.8); boosts.push({ s0: T.s, s1: T.s + 2.4, mod: m.index }); piece(T, 2.4); piece(T, 1.8); end(m); }
    if (sp === 'jump') { const m = mod('jump'); jump(T, W, jumps, m, rnd(-1, 1)); end(m); }
    if (sp === 'narrow') { const m = mod('narrow'); narrowTube(T, W, slope(), m, pegs, coils); end(m); }
    if (sp === 'trapdoor') { const m = mod('trapdoor'); traps.push(trapdoor(T, W, m, rng)); end(m); }
    if (k === sides - 1) { jack(); break; }
    const m2 = mod('straight');
    piece(T, left(), { pitch: first ? SLOPE[1] * DEG : slope() });
    end(m2);
    jack();
    if (holeAt.has(k)) holes.push({ a: { s: m2.s1 - Math.min(2.5, (m2.s1 - m2.s0) * 0.5), s0: m2.s0, mod: m2.index, side: rnd(-1, 1), r: rnd(...HOLE_R) * R } });
    // a roulette's funnel spans the channel (over() catches within 0.7 of a mouth's radius: the whole width), dead centre
    if (rouAt.has(k)) holes.push({ roulette: true, a: { s: m2.s1 - Math.min(Math.max(2.5, hw + 0.8), (m2.s1 - m2.s0) * 0.5), s0: m2.s0, mod: m2.index, side: 0, r: hw / 0.7 } });
    if (trapAt.has(k)) traps.push({ end: m2.s1, a: { s: m2.s1 - Math.min(2.5, (m2.s1 - m2.s0) * 0.5), mod: m2.index, side: rnd(-1, 1), r: rnd(...TRAP_R) * R } });
    // a fork's paddle: crossing it anywhere across, the signal picks the way
    if (forkAt.has(k)) traps.push({ end: m2.s1, a: { s: m2.s1 - Math.min(2.5, (m2.s1 - m2.s0) * 0.5), mod: m2.index, side: 0, r: hw }, fork: { phase: rng() * FORK.period } });
    // ---- the turn round the tower's end ----
    const dz = Math.abs(target(k + 1).z - T.z), kind = turns[k];
    if (kind === 'bowl') { const m = mod('bowl'), sl = (first ? 8.5 : BOWL_SLOPE) * DEG; bowl(T, h, dz, sl); end(m); }
    if (kind === 'mist') { const m = mod('mist'); mist = helix(T, h, dz / 2, W, m.index); end(m); }
    if (kind === 'carousel') { const m = mod('carousel'); rings.push(carousel(T, h, W, dz, rng, m.index)); end(m); }
    if (kind === 'basin') { const m = mod('basin'); basins.push(basin(T, h, W, dz, m.index, boosts)); end(m); }
    if (kind === 'whirlpool') { const m = mod('whirlpool'); basins.push(basin(T, h, W, dz, m.index, boosts, true)); end(m); }
    if (kind === 'boomerang') { const m = mod('boomerang'); booms.push(boomerang(T, h, W, dz, m.index, boosts, pegs)); end(m); }
  }

  // ---- finish: bend out toward the viewer, a straight, the arch and line, a short runout ----
  const fb = mod('bend');
  piece(T, Math.max(3, hw + 1.8) * Math.PI / 2, { turn: -h * Math.PI / 2, bank: -h * 14 * DEG, pitch: 7 * DEG, H: BOWL_LID, rb: hw - 0.02,
    wl: h > 0 ? WALL : BOWL_WALL, wr: h > 0 ? BOWL_WALL : WALL });
  piece(T, 1.2, { H: LID, rb: RC, wl: WALL, wr: WALL });
  end(fb);
  if (tier === 'short') { const m = mod('pegs'); pegSide(T, W, rnd(...PEG_SLOPE) * DEG, pegs, m.index, 4 * DEG); end(m); }
  const fin = mod('finish');
  // open: the walls ease away to nothing, so the side camera sees the winner cross (view only, the collider still closes)
  piece(T, 1.5, { pitch: RUN_IN, ease: 1.5, wl: 0, wr: 0 });
  mogulRows(T, moguls, fin.index, rnd);
  piece(T, 8.5); // a long open run-in, gently downhill: the last fight for the line plays out in view (10 to the line)
  const finish = { s: T.s, p: [T.x, T.y, T.z], a: T.a };
  piece(T, 4.5, { pitch: 2 * DEG });
  T.chain.capEnd = 'full';
  end(fin);

  const wormholes = holes.filter(w => w.b).map((w, i) => wormhole(T, w, W, i));
  const trapRoutes = traps.filter(tp => tp.b).map((tp, i) => (tp.door ? doorLane : trapRoute)(T, tp, W, h, i, mod('trap')));
  // mud: a few patches on plain straights, one per straight, over part of the width (anywhere across), clear of the
  // wormhole holes and trap pads (and a roulette's wide funnel, and its JACKPOT exit). Data only: no collider, the sim
  // slows a marble whose centre is over one
  const near = [...wormholes.flatMap(w => [[w.a.s, w.roulette ? hw + 1 : 1.5], [w.b.s, 1.5], ...w.roulette ? [[w.roulette.exits[0].b.s, 1.5]] : []]),
    ...trapRoutes.flatMap(tp => [[tp.a.s, 1.5], [tp.b.s, 1.5]])];
  // room for at least the shortest patch, 0.6 clear of each end; a shorter straight takes a shorter patch
  const straights = mods.filter(m => m.type === 'straight' && m.s1 - m.s0 > MUD_LEN[0] + 1.2), lanes = [...straights], muds = [];
  for (let k = nOf('mud'), again = true; k > 0; k--) {
    if (!lanes.length) { if (!again) break; again = false; lanes.push(...straights); } // every straight has one: a second each
    const m = lanes.splice(Math.floor(rng() * lanes.length), 1)[0];
    // every spot (0.2 apart) where a patch of length l clears the holes, pads and other patches; a random one of them
    const spots = l => {
      const out = [];
      for (let x = m.s0 + 0.6 + l / 2; x <= m.s1 - 0.6 - l / 2; x += 0.2)
        if (near.every(([y, c]) => Math.abs(y - x) > l / 2 + c) && muds.every(md => Math.abs(md.s - x) > (md.s1 - md.s0 + l) / 2 + 0.8)) out.push(x);
      return out;
    };
    let len = Math.min(rnd(...MUD_LEN), m.s1 - m.s0 - 1.2), ok = spots(len);
    if (!ok.length) ok = spots(len = MUD_LEN[0]); // the shortest patch may still fit beside a hole or pad
    if (!ok.length) { k++; continue; } // no room on this straight, try another; runs out with the lanes
    const s = ok[Math.floor(rng() * ok.length)];
    const a = hw * rnd(...MUD_W);
    muds.push({ s0: s - len / 2, s1: s + len / 2, s, a, c: rnd(-1, 1) * (hw - RC - a), mod: m.index }); // a: half-width across, c: centre's offset (on the flat floor, clear of the corner fillets)
  }
  if (muds.length < nOf('mud')) return TIGHT; // not enough clear straight: a lap more has more
  return pack({ seed, n, tier, retry, picks, grow, W, h, D, L, T, mods, pegs, boosts, jumps, wormholes, traps: trapRoutes, muds, rings, basins, booms, mist, coils, moguls, fan, finish, stadium: { zFront, zBack, half: L / 2 } });
}

// ---------- start ring ----------
// Stalls evenly round a full circle, facing a central drop hole. Marbles roll down the cone, drop through the hole
// into a catch box, and roll out of its front onto the first peg board. Each stall has its own gate flap, hinged on
// the floor; the cone is 3 degrees in the stalls. The stall wheel spins during the countdown and stops at a seeded
// angle, so every gate's release spot is uniformly random round the ring: no pick is favoured, whatever the hole and
// box below do (a fixed layout always favours some spots: a partial arc squeezes its middle stalls, a full ring favours
// the stalls nearest the box's exit).
const DROP = 2.2, BOX_PITCH = 12;
function startRing(n, W, rng) {
  const hr = Math.max(1.5, W - 0.25), rStall = Math.max(hr + 2.6, STALL * n / (2 * Math.PI)), rBack = rStall + STALL_DEPTH;
  const slope = (FAN_SLOPE + 4 * crowd(W)) * DEG, tf = Math.tan(slope); // a bigger ring is steeper, so the start takes about as long
  const y = r => r <= rStall ? Math.max(0, r - hr) * tf : (rStall - hr) * tf + (r - rStall) * Math.tan(3 * DEG); // 0 at the hole's rim
  const at = (r, psi) => [r * Math.sin(psi), y(r), -r * Math.cos(psi)];
  const dpsi = 2 * Math.PI / n, half = STALL / 2 / rStall;
  // gate order: from the front-left round the back to the front-right, so seen from the front the gates read left to right
  const rMid = rStall + STALL_DEPTH / 2, ring = { rMid, yS: y(rMid) + MR + 0.02, rH: rStall - 0.06, yH: y(rStall - 0.06) };
  const stalls = [...Array(n).keys()].map(i => {
    // seeded micro-jitter (0.05R sideways and back) and a little spin
    const jt = (rng() - 0.5) * 0.1 * R, jr = Math.abs((rng() - 0.5) * 0.1 * R), spin = [(rng() - 0.5) * 0.4, (rng() - 0.5) * 0.4, (rng() - 0.5) * 0.4];
    return { psi: -Math.PI + (i + 0.5) * dpsi, jt, jr, spin };
  });
  const fan = { hr, rStall, rBack, ...ring, dpsi, half, W, slope, stalls, y, at, z0: hr + 0.3, top: 2.6, spin: rng() * 2 * Math.PI, flapHw: STALL / 2 - 0.05, flapH: FLAP_H };
  fan.floorAt = z => -DROP - z * Math.tan(BOX_PITCH * DEG); // the catch box floor slopes toward the board
  stalls.forEach((st, g) => { const a = stallAt(fan, g, 0); st.pos = a.pos; st.flap = { hinge: a.hinge, yaw: a.yaw, hw: fan.flapHw, h: FLAP_H }; });
  return fan;
}
// stall g of the start ring with the wheel turned by theta: marble start, flap hinge and yaw (theta = fan.spin at GO)
export function stallAt(fan, g, theta = 0) {
  const st = fan.stalls[g], psi = st.psi + theta, sn = Math.sin(psi), cs = Math.cos(psi);
  return { pos: [fan.rMid * sn - cs * st.jt + sn * st.jr, fan.yS, -fan.rMid * cs - sn * st.jt - cs * st.jr], hinge: [fan.rH * sn, fan.yH, -fan.rH * cs], yaw: Math.PI - psi, psi };
}
// a point / yaw of the start wheel (stall dividers) turned by theta about the ring's axis
export const spinXZ = (x, z, theta) => [x * Math.cos(theta) - z * Math.sin(theta), z * Math.cos(theta) + x * Math.sin(theta)];

// ---------- peg boards ----------
// staggered grid, symmetric about the centre line. No peg leaves a gap to a wall that a marble can't pass, so
// nothing can wedge between a peg and a wall
// Every other row a bumper straddles each wall: without them a marble hugging a wall rolls down a free lane past
// every peg, and the outer gates would win far more than their share
function pegRows(T, rows, half, pegs, mod, gap = PEG_GAP, d0 = 0.8) {
  const f = T.chain.f, k0 = f.length - FS; // straight board: the frame where it starts holds for its whole length
  const [x, y, z, tx, ty, tz, rx, ry, rz, ux, uy, uz] = f.slice(k0, k0 + 12);
  const xmax = half - BUMP_R - PEG_R - 2 * R - 0.08, dr = gap * Math.sqrt(3) / 2, lu = PEG_H / 2;
  const at = (d, lx, r) => pegs.push({ p: [x + tx * d + rx * lx + ux * lu, y + ty * d + ry * lx + uy * lu, z + tz * d + rz * lx + uz * lu], ax: [ux, uy, uz], r, mod });
  for (let row = 0; row < rows; row++) {
    const d = d0 + row * dr, off = row % 2 ? gap / 2 : 0;
    // the centre pegs only every third row: a sparser middle, so a marble can get through there, not only round the sides
    for (let c = -9; c <= 9; c++) { const lx = off + c * gap; if (Math.abs(lx) <= xmax && (Math.abs(lx) > gap * 0.75 || row % 3 === 0)) at(d, lx, PEG_R); }
    if (row % 2) { at(d, -half, BUMP_R); at(d, half, BUMP_R); }
  }
  return d0 + (rows - 1) * dr + 0.8;
}
// moguls across the straight starting here (its first frame holds for its whole length): every marble hops a few on the
// way to the line. The last row ends ~2 short of it, so the crossing itself is clean
function mogulRows(T, moguls, mod, rnd) {
  const f = T.chain.f, k0 = f.length - FS, [x, y, z, tx, ty, tz, rx, ry, rz, ux, uy, uz] = f.slice(k0, k0 + 12);
  const xmax = T.hw - MOG_B - 0.1; // feet clear of the walls
  // k across, edge to edge; every other row one fewer, in the gaps between (2-1-2-1 on the narrowest course)
  const k = Math.max(2, Math.round(2 * xmax / MOG_GAP[1]) + 1), g = 2 * xmax / (k - 1);
  for (let row = 0; row < MOG_ROWS; row++) {
    const d = 1 + row * MOG_GAP[0], odd = row % 2;
    for (let j = 0; j < k - odd; j++) {
      const lx = (j - (k - 1 - odd) / 2) * g;
      const h = rnd(...MOG_H), lu = h - MOG_R; // the ball's centre, under the floor
      moguls.push({ p: [x + tx * d + rx * lx + ux * lu, y + ty * d + ry * lx + uy * lu, z + tz * d + rz * lx + uz * lu], u: [ux, uy, uz], r: MOG_R, h, mod });
    }
  }
}
function pegBoard(T, rows, pitch, half, pegs, mod) {
  piece(T, 1.2, { pitch, hw: half, ease: 1.2 });
  piece(T, pegRows(T, rows, half, pegs, mod, PEG_GAP + crowd(half) * 1.6 * R, FIRST_RUNUP));
}
function pegSide(T, W, pitch, pegs, mod, out) {
  const half = wideHw(W);
  piece(T, 1.5, { pitch, hw: half, ease: 1.5 });
  piece(T, pegRows(T, PEG_ROWS, half, pegs, mod, sidePegGap(W))); // sparser and steeper for a big crowd
  piece(T, 2.6, { hw: W / 2, pitch: out, ease: 2.6 });
}

// ---------- turns ----------
function bowl(T, h, dz, slope) {
  const len = Math.max(dz, 2 * T.hw + 2.4) / turnDisp(Math.PI, RAMP).side / Math.cos(slope); // lands on the other column
  piece(T, len, { turn: h * Math.PI, pitch: slope, bank: h * BOWL_BANK * DEG, H: BOWL_LID, rb: T.hw - 0.02,
    wl: h > 0 ? BOWL_WALL : WALL, wr: h > 0 ? WALL : BOWL_WALL });
  piece(T, 1.2, { H: LID, rb: RC, wl: WALL, wr: WALL });
}

// mist tube: an enclosed frosted helix of 1.5 turns, so it comes out where a 180° turn would, one turn lower
function helix(T, h, r, W, mod) {
  const rho = Math.min(1.6, Math.max(1.8 * R, 0.38 * W)), rise = 2 * rho + 1.1; // tube radius, drop per turn
  piece(T, 3.6, { hw: rho + 0.01, H: 2 * rho + 0.02, rb: rho, rt: rho, wl: 2 * rho, wr: 2 * rho });
  const s0 = T.s, th = Math.atan(rise / (2 * Math.PI * r)), lh = 2 * r / turnDisp(3 * Math.PI, 0.12).side;
  T.flags = TUBE;
  piece(T, lh / Math.cos(th), { turn: h * 3 * Math.PI, ramp: 0.12, pitch: th, ease: 1.2, bank: h * 10 * DEG });
  T.flags = 0;
  const s1 = T.s;
  piece(T, 3.6, { hw: W / 2, H: LID, rb: RC, rt: 0.1, wl: WALL, wr: WALL, pitch: SLOPE[0] * DEG });
  return { s0, s1, mod, rho, r, h };
}

// narrow helix: the channel fans out three openings wide and ends in a wall, the comb. Its middle opening is a clear glass
// tube 1.5 marbles wide (two can't sit side by side: single file, no overtaking inside) running straight on. Its side
// openings are the mouths of two glass coils wound round that tube as a double helix: half a turn apart (so they never
// meet), 1.5 turns, out on the other side, 2.8x the way. A marble takes whichever opening it rolls into: a pin where the
// fan starts splits the middle line, and a bumper on each strip between two openings flicks it into one. Over the top of
// a turn a rolling marble would stall (it climbs 3.8), so the coils are air tubes: the sim carries a marble along one
// (sim.js COIL_T) and they have no collider. All three empty into a wide chamber (the jump landing's: a back wall with a
// window for the middle tube), then the channel narrows back.
// rho: inner radius; gap: coil shell to tube shell; turns, eased in and out over ease of the winding (like a turn's RAMP);
// lead: straight run each end of it; pin: a peg dead centre that far before the comb (where the fan starts): a lone
// marble rolls down the middle, so without it the leader took the middle tube 58% of the time with 4 players; lengths;
// degrees
const NARROW = { rho: 1.5 * MR, gap: 0.2, turns: 1.5, ease: 0.12, lead: 0.6, fan: 1.5, comb: 1, pin: 2.4, drop: 0.3, merge: 2.2, flare: 2, out: 0.6, pitch: 14 };
const COIL_R = 2 * (NARROW.rho + THICK) + NARROW.gap, COIL_P = 2 * COIL_R; // coil centre off the tube's axis; per turn
export const COMB = COIL_R - NARROW.rho; // |across| past which a marble at the comb is a side mouth's (the strips: rho..COMB)
// the winding: longer by the easing, so the coils still sit COIL_P / 2 apart where it's fastest (mid-coil)
const narrowWind = NARROW.turns * COIL_P / (1 - NARROW.ease), narrowLen = 2 * NARROW.lead + narrowWind; // the middle tube
function narrowTube(T, W, out, m, pegs, coils) {
  const { rho, lead, turns } = NARROW, hm = COIL_R + rho + 0.1;
  piece(T, NARROW.fan, { hw: hm, pitch: NARROW.pitch * DEG });
  piece(T, NARROW.comb);
  T.chain.capEnd = { below: 0, gapHw: rho, gapTop: 2 * rho }; // the comb: an end wall with the middle tube's window
  const f = T.chain.f, o = f.length - FS, [p, t, r, u] = [0, 3, 6, 9].map(k => f.slice(o + k, o + k + 3)), sC = T.s;
  const at = (x, y, d = 0) => p.map((v, k) => v + r[k] * x + u[k] * y + t[k] * d);
  for (const sd of [-1, 1]) pegs.push({ p: at(sd * (rho + COMB) / 2, PEG_H / 2, -0.35), ax: u, r: BUMP_R, mod: m.index });
  pegs.push({ p: at(0, PEG_H / 2, -NARROW.pin), ax: u, r: PEG_R, mod: m.index }); // the pin
  Object.assign(T, { hw: rho, H: 2 * rho, rb: rho, rt: rho, wl: 2 * rho, wr: 2 * rho, flags: TUBE | GLASS });
  newChain(T);
  piece(T, narrowLen);
  T.flags = 0;
  // the coils: frames written straight round the tube's axis (the turtle only yaws and pitches), the winding eased in and
  // out like a turn's (yawAt); each frame's up points away from the axis. Arc length from 1e5 up, clear of the course's
  const end = narrowLen + NARROW.out, wind = narrowWind;
  for (const sd of [1, -1]) {
    const fr = [], line = [], s0 = 1e5 + 1e3 * coils.length, N = Math.ceil(end / 0.1);
    const cAt = x => {
      const a = (sd > 0 ? 0 : Math.PI) + 2 * Math.PI * turns * yawAt(Math.min(1, Math.max(0, (x - lead) / wind)), NARROW.ease);
      return [at(Math.cos(a) * COIL_R, rho + Math.sin(a) * COIL_R, x), [0, 1, 2].map(k => r[k] * Math.cos(a) + u[k] * Math.sin(a))];
    };
    let d = 0, last = null;
    for (let j = 0; j <= N; j++) {
      const x = end * j / N, [c, n] = cAt(x), [c1] = cAt(Math.min(end, x + 0.02)), [c0] = cAt(Math.max(0, x - 0.02));
      const tg = c1.map((v, k) => v - c0[k]), tl = Math.hypot(...tg);
      for (let k = 0; k < 3; k++) tg[k] /= tl;
      const nt = n[0] * tg[0] + n[1] * tg[1] + n[2] * tg[2], up = n.map((v, k) => v - tg[k] * nt), ul = Math.hypot(...up);
      for (let k = 0; k < 3; k++) up[k] /= ul;
      const rt = [tg[1] * up[2] - tg[2] * up[1], tg[2] * up[0] - tg[0] * up[2], tg[0] * up[1] - tg[1] * up[0]]; // r = t x u (u = r x t)
      if (last) d += Math.hypot(c[0] - last[0], c[1] - last[1], c[2] - last[2]);
      last = c;
      fr.push(...c.map((v, k) => v - up[k] * rho), ...tg, ...rt, ...up, s0 + d, rho, 2 * rho, 2 * rho, 2 * rho, rho, rho, TUBE | GLASS, m.index);
      line.push(...c, d);
    }
    T.chains.push({ f: fr, capStart: null, capEnd: null, ghost: true, side: sd });
    // in: the comb (s on the course, which side, its frame and size for the view); out: the coil's mouth in the chamber
    // (the course's s there: the chamber's floor starts drop on)
    coils.push({ mod: m.index, side: sd, len: d, line: new Float32Array(line), in: { s: sC, side: sd, p, t, r, u, hw: hm, H: LID, rho, cr: COIL_R },
      out: { p: last, t, s: sC + narrowLen + NARROW.drop + NARROW.out } });
  }
  // the merge chamber, NARROW.drop under the tube: its back wall has the middle tube's window, the coils end inside it
  T.y -= NARROW.drop; T.s += NARROW.drop;
  Object.assign(T, { hw: wideHw(W), H: 3, rb: RC, rt: 0.1, wl: 1.6, wr: 1.6 });
  newChain(T, { below: 0.05, gapHw: rho + 0.2, gapTop: NARROW.drop + 2 * rho + 0.2 });
  piece(T, NARROW.merge);
  piece(T, NARROW.flare, { hw: W / 2, H: LID, wl: WALL, wr: WALL, pitch: out });
}

// jump: the channel kicks up 15° off a lip and drops onto a landing twice as wide with a tall back wall and a lid.
// A neon hoop stands just past the lip, somewhere across (side: -1 left .. 1 right), at the height marbles fly through
// there: a marble whose centre passes inside it gets a boost (the sim), the rest fly past it. It's light, no collider
const HOOP = { d: 1, y: 0.6 }; // past the lip, over the lip's floor (measured flights: 0.54-0.63 high there)
function jump(T, W, jumps, m, side) {
  piece(T, 2.4, { pitch: -15 * DEG, ease: 2.4 });
  const lip = { s: T.s, p: [T.x, T.y, T.z] }, drop = 1.3, kHw = T.hw, kH = T.H;
  const fw = [Math.cos(T.a), Math.sin(T.a)], r = Math.min(1.25, Math.max(0.85, 0.25 * W)), c = side * (kHw - r); // the hoop's rim stays over the kicker
  const hoop = { p: [T.x + fw[0] * HOOP.d - fw[1] * c, T.y + HOOP.y, T.z + fw[1] * HOOP.d + fw[0] * c], n: [fw[0], 0, fw[1]], r };
  jumps.push({ s: T.s, p: lip.p, mod: m.index, hoop });
  // the landing starts straight under the lip; its start cap is open where the kicker comes in
  T.y -= drop; T.s += drop; T.th = 4 * DEG; T.hw = wideHw(W); T.H = 3; T.wl = T.wr = 1.6;
  newChain(T, { below: drop - 0.25, gapHw: kHw + 0.3, gapTop: drop + kH + 0.35 });
  piece(T, 4.2);
  piece(T, 2.3, { hw: W / 2, H: LID, wl: WALL, wr: WALL, pitch: SLOPE[0] * DEG });
  m.lip = lip;
}

// carousel: a turning golden ring with 6 seat pockets at the tower's end, in place of a turn. The run carries on
// past the end and arrives at the ring's back point a marble's height above its floor, moving the way the ring turns;
// marbles drop into the pockets (anything flying on hits the static outer wall and falls back in), ride round and
// roll out through the opening in the wall 120–240° on, onto a chute that swings back the other way; the next side
// S-bends onto the column line. The whole ring sits beyond the end, clear of the column runs.
function carousel(T, h, W, dz, rng, mod) {
  const aIn = T.a, inside = [-Math.sin(aIn) * h, Math.cos(aIn) * h];
  const half = W / 2, rMid = dz / 2, rIn = Math.max(1.3, rMid - half - 0.2), rOut = rMid + half + 0.2, rWall = rOut + 0.12;
  const tilt = RING.tilt, drop = 1;
  piece(T, rOut + 0.6, { pitch: 4 * DEG }); // on past the tower's end
  const pe = [T.x, T.y, T.z], c = [T.x + inside[0] * rMid, T.y - drop + (rMid - rIn) * Math.tan(tilt), T.z + inside[1] * rMid];
  const floorAt = r => c[1] - (r - rIn) * Math.tan(tilt); // the ring floor tilts down outward
  const phiE = Math.atan2(-inside[1], -inside[0]), dir = h, delta = (120 + rng() * 120) * DEG, phiX = phiE + dir * delta;
  // entry opening: where the chute crosses the wall circle (a skirt below the chute floor keeps marbles in);
  // exit opening: the exit chute's mouth
  const aMax = Math.acos(Math.min(1, (rMid - half - 0.2) / rWall)) + 0.05;
  const open = [[phiE - dir * aMax, phiE, pe[1] - 0.08 - c[1]]];
  // exit: the chute starts on the opening's chord heading straight out, its floor tucked under the ring's rim
  const hwE = half + 0.5, al = Math.asin(Math.min(0.9, hwE / rWall)), rE = rWall * Math.cos(al) - 0.02;
  const ex = [c[0] + Math.cos(phiX) * rE, floorAt(rOut) - 0.12, c[2] + Math.sin(phiX) * rE];
  open.push([phiX - al, phiX + al, null]);
  // centre line: down from the chute end, round the mid radius, out to the exit chute
  const yR = floorAt(rMid), a0 = phiE + dir * 1.2 / rMid, steps = Math.ceil((delta - 1.2 / rMid) * rMid / DS), i0 = T.line.length / 4;
  T.line.push(c[0] + Math.cos(a0) * rMid, yR, c[2] + Math.sin(a0) * rMid, T.s += Math.hypot(1.2, pe[1] - yR));
  for (let j = 1; j <= steps; j++) {
    const p = a0 + (phiX - a0) * j / steps;
    T.line.push(c[0] + Math.cos(p) * rMid, yR, c[2] + Math.sin(p) * rMid, T.s += Math.abs(phiX - a0) * rMid / steps);
  }
  const i1 = T.line.length / 4 - 1;
  T.s += rE - rMid;
  Object.assign(T, { x: ex[0], y: ex[1], z: ex[2], a: phiX, th: 6 * DEG, b: 0, hw: hwE, H: LID + 0.6, wl: WALL + 0.4, wr: WALL + 0.4, rb: RC, rt: 0.1 });
  newChain(T);
  piece(T, 1.4, { pitch: 9 * DEG });
  const turn = wrapA(aIn + Math.PI - T.a), sg = Math.sign(turn) || 1; // swing round to head back the way the run came
  const len = Math.max(2, Math.abs(turn) * (half + 2.8) * 1.2);
  piece(T, len, { turn, bank: sg * 10 * DEG, hw: half, wl: WALL, wr: WALL, H: BOWL_LID, rb: half - 0.02 });
  piece(T, 1.2, { rb: RC, H: LID });
  // the rim keeps the same speed on a bigger ring (more players): 0.5 turns a second up to rMid 2.5, slower beyond
  return { c, rIn, rOut, rMid, rWall, wall: RING.wall, tilt, omega: dir * RING.omega * Math.min(1, 2.5 / rMid), seats: RING.seats, divH: RING.divH,
    phiE, phiX, dir, delta, open, pe, mod, h, line: [i0, i1] };
}

// boomerang (the waterslide ride, made a half-pipe): the run carries on past the tower's end, drops steeply over a boost
// pad into a trough that runs across toward the next column, and meets a tall quarter-pipe wall at its far end. Marbles
// shoot up the wall, roll back down and up the near wall, and swing back and forth while they drift along the trough
// to its end, where the exit opens across its floor and curves round onto the next column, a few pegs on the way. The
// two walls lean the same way (a marble zig-zags between them, so every swing carries it a little further along, and the
// first one clear of the drop) and the floor tilts gently toward the end (one that has lost its swing still gets there).
// The chain ends open at the foot of the drop and the next starts open in the end wall; the trough between them is its
// own trimesh (boomMeshes), in a frame at the drop's foot E: u along the run, v across toward the next column
// far and near wall radii (big: a marble turns round on the curve, still rolling; up a vertical it keeps its spin and
// loses most of its speed to slip on the way down), lid height, the walls' lean, the floor's tilt toward the end, the
// boost pad's push (u/s, half a side pad's: more and the first climb overshoots the curve)
const BOOM = { rq: 5, rn: 4, top: 7, skew: 8 * DEG, tilt: 4.5 * DEG, boost: 3 };
function boomerang(T, h, W, dz, mod, boosts, pegs) {
  const a0 = T.a, f = [Math.cos(a0), Math.sin(a0)], inw = [-Math.sin(a0) * h, Math.cos(a0) * h], hw = W / 2, { rn, rq } = BOOM;
  piece(T, 3.6, { pitch: 28 * DEG, ease: 3 }); // the drop, eased in so a fast marble stays on the floor
  // the boost pad, where the drop levels out (on its lip a boosted marble flew, and lost a third of its speed landing)
  boosts.push({ s0: T.s + 0.3, s1: T.s + 2.1, mod, v: BOOM.boost });
  piece(T, 2.2, { pitch: 1 * DEG, ease: 2.2 }); // levels out into the trough
  // the floor between the walls is as wide as the exit (W + a little); the trough ends a turn's radius short of the next
  // column, so the exit can curve round onto it
  const E = [T.x, T.y, T.z], r = Math.max(2.5, hw + 1.5), flat = W + 0.4, vEnd = dz - r;
  const bm = { mod, E, f, inw, hw, dz, vEnd, flat, rq, rn, top: BOOM.top, ts: Math.tan(BOOM.skew), y0: E[1] - 0.04, tn: Math.tan(BOOM.tilt), yE: E[1], sIn: T.s };
  const { P, yF, feet } = boomGeo(bm), dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  // centre line: along the middle of the trough's floor to the exit (a swinging marble's progress is how far along)
  const mid = v => { const [a, b] = feet(v); return P((a + b) / 2, v, yF(0, v)); };
  const c0 = mid(0), X = mid(vEnd);
  X[1] -= 0.03;
  bm.i0 = T.line.length / 4; // c0's index in the line
  T.line.push(...c0, T.s += dist(E, c0));
  Object.assign(bm, { hE: T.H, yX: X[1] });
  T.s += dist(c0, X);
  bm.sOut = T.s;
  Object.assign(T, { x: X[0], y: X[1], z: X[2], a: a0 + h * Math.PI / 2, th: 3 * DEG, b: 0, hw: flat / 2 });
  newChain(T);
  bm.hX = T.H;
  // the exit: out of the end wall, round onto the next column (heading back along it), then a few pegs on a short widened
  // board; a straight first, so the turn lands on the column's line
  const len = r * Math.PI / 2, d = turnDisp(Math.PI / 2, RAMP);
  piece(T, Math.max(0.4, r - len * d.fwd * Math.cos(6 * DEG)), { pitch: 6 * DEG, hw, ease: 0.4 });
  piece(T, len, { turn: h * Math.PI / 2, bank: h * 12 * DEG, H: BOWL_LID, rb: hw - 0.02, wl: h > 0 ? BOWL_WALL : WALL, wr: h > 0 ? WALL : BOWL_WALL });
  piece(T, 1.2, { H: LID, rb: RC, wl: WALL, wr: WALL });
  const half = hw + 0.8;
  piece(T, 1.2, { pitch: 20 * DEG, hw: half, ease: 1.2 });
  piece(T, pegRows(T, 4, half, pegs, mod, sidePegGap(W)));
  piece(T, 1.6, { hw, pitch: SLOPE[0] * DEG, ease: 1.6 });
  bm.poly = [[0, -hw], [0, hw], [feet(hw)[0] - rn, hw], [feet(vEnd)[0] - rn, vEnd], [feet(vEnd)[1] + rq, vEnd], [feet(-hw)[1] + rq, -hw]]
    .map(([u, v]) => P(u, v, yF(0, v))); // the outline, at floor height
  return bm;
}
// a boomerang trough's frame (u along the run from the drop's foot, v across toward the next column): world point, floor
// height, the walls' feet at v ([near, far]: both lean; the near one stands at the drop's foot across its gap), the
// columns its mesh is built on (a pair a hair apart where the near wall starts, square), whether the near wall stands at
// v, and the profile along the run at v ([u, y]: the near wall from the lid down to its foot, collapsed to a point in
// the drop's gap; the floor; the quarter pipe; its straight top up to the lid, in rows so the view can stripe it).
// Shared by the colliders, the sim and the view
export function boomGeo(bm) {
  const { E, f, inw, hw, vEnd, flat, rq, rn, top, ts, y0, tn } = bm, e = 0.02;
  const P = (u, v, y) => [E[0] + f[0] * u + inw[0] * v, y, E[2] + f[1] * u + inw[1] * v];
  const yF = (u, v) => y0 - (v + hw) * tn; // flat across: the arcs meet it tangentially, no crease at a foot to hold a marble
  const sk = v => (v + hw) * ts, feet = v => [v <= hw ? 0 : sk(v), flat + sk(v)];
  // the curves in fine steps: every kink between two faces is a little bump a fast marble loses speed on
  const ARC = 48, RAMP = [...[3, 2, 1].map(j => [-rn, rn + (top - rn) * j / 3]), ...Array.from({ length: ARC + 1 }, (_, j) => { const a = Math.PI / 2 * (ARC - j) / ARC; return [-rn * Math.sin(a), rn * (1 - Math.cos(a))]; })];
  const w = v => v > hw ? 1 : 0;
  // in the drop's gap the near wall collapses to the chain's floor at its end, so the floor ramps gently down from it: a
  // marble swinging back meets no step on the way up the drop
  const prof = v => {
    const [a, b] = feet(v), y = yF(0, v);
    const p = v <= hw ? RAMP.map(() => [0, bm.yE]) : RAMP.map(([u, h]) => [a + u, y + h]);
    p.push([(a + b) / 2, y]);
    for (let j = 0; j <= ARC; j++) { const t = j / ARC * Math.PI / 2; p.push([b + Math.sin(t) * rq, y + (1 - Math.cos(t)) * rq]); }
    for (let j = 1; j <= 6; j++) p.push([b + rq, y + rq + (top - rq) * j / 6]);
    return p;
  };
  return { P, yF, feet, prof, w, NR: RAMP.length - 1, cols: [-hw, 0, hw, hw + e, (hw + vEnd) / 2, vEnd] };
}

// bowl: a waterslide bowl beyond the tower's end, in place of a turn. The run bends off the end toward the other column
// and, over a boost pad, comes in at the rim through a gap in its curled lip, running along it; marbles swirl round the dish (its wall rises to
// vertical, then curls in over the dish, so a fast one rides high and is turned back in) and spiral down a steeper ring
// into the drain in the middle, a frosted tube that
// curves out underneath and heads back along the next column. The sim drags a marble in the dish (the water), so it
// swirls round a lap or so rather than orbiting for good. Its centre line: the chute to the tangent point, then straight down
// the drain's axis (a marble's height in the dish gives its progress, like the start ring), then the tube
const BASIN = { depth: 0.8, cone: 10, funnel: 20, lip: 0.9, curl: 0.45, drop: 0.15, tube: 3 }; // funnel: degrees, the ring round the drain
// whirl: a whirlpool, a bigger dish (its chute ends the same way in from the rim) with a narrow drain, and a current
function basin(T, h, W, dz, mod, boosts, whirl = false) {
  const aIn = T.a, f = [Math.cos(aIn), Math.sin(aIn)], inn = [-f[1] * h, f[0] * h], half = W / 2, x0 = T.x, z0 = T.z;
  const R90 = Math.max(3, half + 1.8), k = whirl ? WHIRL.grow : 1, rc0 = Math.max(3, 0.42 * dz), rB = (rc0 + half + 0.8) * k, rc = rc0 + rB - rB / k;
  const rh = (whirl ? WHIRL.drain : 2) * MR, rho = rh + 0.03;
  piece(T, R90 * Math.PI / 2, { turn: h * Math.PI / 2, bank: h * 14 * DEG, H: BOWL_LID, rb: half - 0.02, pitch: 8 * DEG, wl: h > 0 ? BOWL_WALL : WALL, wr: h > 0 ? WALL : BOWL_WALL });
  piece(T, 1.2, { H: LID, rb: RC, wl: WALL, wr: WALL });
  // on to the next column (the tangent point) over a boost pad, so marbles fly in fast and swirl
  const run = Math.max(1, dz - (T.x - x0) * inn[0] - (T.z - z0) * inn[1]) / Math.cos(T.th), pad = Math.max(0.8, Math.min(2.4, run - 1));
  piece(T, (run - pad) / 2, { pitch: 6 * DEG });
  boosts.push({ s0: T.s, s1: T.s + pad, mod });
  piece(T, pad);
  piece(T, (run - pad) / 2, { turn: -h * 15 * DEG }); // bending in a little: a fast marble lands in the dish, not on the far lip
  // profile (radius, height over the dish's foot): the throat, a bevel down into it (round a sharp edge a marble lips
  // out like a golf ball), the dish (a shallow funnel plus a quarter ellipse that stands vertical at the rim), then the
  // wall curling in to the lip
  const rd = rh + 0.45, g = r => 1 - Math.sqrt(Math.max(0, 1 - (r / rB) ** 2)), gd = g(rd), p0 = Math.asin(rd / rB), cone = Math.tan(BASIN.cone * DEG), funnel = Math.tan(BASIN.funnel * DEG) - cone;
  const dish = r => BASIN.depth * (g(r) - gd) / (1 - gd) + (r - rd) * cone + (Math.min(r, rd + 1.2) - rd) * funnel, rim = dish(rB), prof = [[rh, -0.45], [rh, -0.3], [rh + 0.08, -0.17], [rh + 0.22, -0.08], [rd, 0]];
  for (let j = 1; j <= 16; j++) { const r = rB * Math.sin(p0 + (Math.PI / 2 - p0) * j / 16); if (r > rd + 1.2 && prof.at(-1)[0] < rd + 1.2) prof.push([rd + 1.2, dish(rd + 1.2)]); prof.push([r, dish(r)]); }
  const R = BASIN.curl; // the rim: up the wall, then a half-round curling in over the dish, its tip pointing down at it
  for (let j = 0; j <= 8; j++) { const a = j / 8 * 165 * DEG; prof.push([rB - R + R * Math.cos(a), rim + BASIN.lip - R + R * Math.sin(a)]); }
  const pe = [T.x, T.y, T.z], along = (pe[0] - x0) * f[0] + (pe[2] - z0) * f[1] + rc, top = rim + BASIN.lip;
  const c = [x0 + f[0] * along + inn[0] * dz, pe[1] - rim - BASIN.drop, z0 + f[1] * along + inn[1] * dz]; // the drain, on the next column's line
  // a ceiling just under the chute where it hangs over the dish: a marble riding high round the wall bounces off it
  // rather than being pushed up through the chute's floor
  const w = half + 0.35, u0 = -Math.sqrt(Math.max(0, (rB + 0.3) ** 2 - (rc - w) ** 2)), at = (a, b) => [pe[0] + inn[0] * a + f[0] * b, c[1] + rim, pe[2] + inn[1] * a + f[1] * b];
  const cap = [at(u0, -w), at(-0.6, -w), at(-0.6, w), at(u0, w)];
  const ch = T.chain.f, a0 = Math.atan2(pe[2] - c[2], pe[0] - c[0]), gap = [];
  for (let o = 0; o < ch.length; o += FS) if (ch[o + F.mod] === mod) {
    const e = [-1, 1].map(sg => { const w = sg * (ch[o + F.hw] + THICK + 0.05), x = ch[o] + ch[o + F.rx] * w - c[0], z = ch[o + 2] + ch[o + F.rx + 2] * w - c[2]; return [Math.hypot(x, z), wrapA(Math.atan2(z, x) - a0)]; });
    if (e.some(([r]) => r > rB - 2 * BASIN.curl - 0.1) && e.some(([r]) => r < rB + 0.6)) gap.push(e[0][1], e[1][1]);
  }
  const open = gap.length ? [a0 + Math.min(...gap) - 0.03, a0 + Math.max(...gap) + 0.03] : null; // [from, to] round the drain
  const i0 = T.line.length / 4;
  T.line.push(c[0], pe[1], c[2], T.s += Math.hypot(c[0] - pe[0], c[2] - pe[2]));
  T.line.push(c[0], c[1] - 0.45, c[2], T.s += pe[1] - c[1] + 0.45);
  // the drain tube: starts straight down under the hole (its floor on the far side), bends out to head back
  const aOut = aIn + Math.PI, back = [Math.cos(aOut), Math.sin(aOut)];
  T.s += rho;
  Object.assign(T, { x: c[0] - back[0] * rho, y: c[1] - 0.4, z: c[2] - back[1] * rho, a: aOut, th: Math.PI / 2, b: 0, hw: rho, H: 2 * rho, rb: rho, rt: rho, wl: 2 * rho, wr: 2 * rho, flags: TUBE });
  newChain(T);
  piece(T, BASIN.tube, { pitch: 18 * DEG, ease: BASIN.tube });
  T.flags = 0;
  piece(T, 2.4, { hw: half, H: LID, rb: RC, rt: 0.1, wl: WALL, wr: WALL, pitch: 8 * DEG });
  const out = { c, rB, rh, rho, rim, top, curl: R, open, prof, cap, mod, line: [i0, i0 + 1] };
  // the current turns the way the chute pours in (dir: +1 anticlockwise seen from above, about +y)
  if (whirl) out.whirl = { hold: WHIRL.hold, spin: WHIRL.spin, vCur: WHIRL.vCur, out: WHIRL.out, drag: WHIRL.drag, pull: WHIRL.pull, dir: h };
  return out;
}

// S-bend: shift sideways by d (in z) while heading along x (dir = ±1): two opposite arcs, easing to a run's pitch
// (it comes off a carousel's shallow exit chute: a crowd crawling out of it jammed in the next bend)
function sBend(T, d, dir, pitch) {
  const fwd = Math.max(4, Math.abs(d) * 2.2), want = Math.abs(d) / fwd;
  let lo = 0, hi = Math.PI / 2; // turn angle g of each half, so that sideways / forward = want
  for (let i = 0; i < 40; i++) { const g = (lo + hi) / 2, t = turnDisp(g, 0.5); if (t.side / t.fwd < want) lo = g; else hi = g; }
  const g = (lo + hi) / 2, len = fwd / 2 / turnDisp(g, 0.5).fwd / Math.cos(T.th);
  const sgn = Math.sign(d) * dir; // heading +x and moving +z is a right turn first
  piece(T, len, { turn: sgn * g, ramp: 0.5, pitch });
  piece(T, len, { turn: -sgn * g, ramp: 0.5 });
}

// ---------- wormholes ----------
// two holes in the floor, no tube: hole A (just over a marble wide, anywhere across) near the end of a side, hole B
// mid-channel near the start of the side after the turn. A marble rolling right over A drops in and pops out of B
// A roulette's mouth is a funnel across the whole channel, so every marble drops in, and a wheel of three sectors turns
// round it: the sector under a marble's spot on the rim as it drops (sectorOf) picks its exit. JACKPOT pops out further
// on, NEXT where a plain wormhole's B would be, LOST at NEXT too but only after drifting a while
function wormhole(T, w, W, i) {
  const A = frameAt(T.chains, w.a.s), B = frameAt(T.chains, w.b.s);
  const ra = w.a.r, off = w.a.side * (W / 2 - ra); // side: -1 against the left wall .. 1 the right
  const pa = A.p.map((v, k) => v + A.r[k] * off);
  const out = { a: { p: pa, r: ra, s: w.a.s, mod: w.a.mod, side: w.a.side, u: A.u }, b: { p: B.p, r: w.roulette ? HOLE_R[0] * R : ra, s: w.b.s, mod: w.b.mod, t: B.t, u: B.u },
    time: WARP_TIME, color: i % 3 };
  if (w.roulette) {
    const J = frameAt(T.chains, w.jack.s), e2 = [A.u[1] * A.t[2] - A.u[2] * A.t[1], A.u[2] * A.t[0] - A.u[0] * A.t[2], A.u[0] * A.t[1] - A.u[1] * A.t[0]]; // u x t
    out.roulette = { omega: ROULETTE.omega, sectors: ROULETTE.sectors, e1: A.t, e2, exits: [
      { kind: 'jackpot', b: { p: J.p, r: out.b.r, s: w.jack.s, t: J.t, u: J.u }, time: WARP_TIME },
      { kind: 'next', b: out.b, time: WARP_TIME }, { kind: 'lost', b: out.b, time: ROULETTE.lost }] };
  }
  return out;
}
// the roulette sector at wheel angle psi (radians; a marble's angle round the mouth in (e1, e2), plus omega x sim time)
export const sectorOf = (rl, psi) => {
  let x = ((psi / (2 * Math.PI)) % 1 + 1) % 1, k = 0;
  while (k < rl.sectors.length - 1 && x >= rl.sectors[k]) x -= rl.sectors[k++];
  return k;
};
// ---------- trap routes ----------
// a pad on the floor (just over a marble wide, anywhere across, like a wormhole mouth) near the end of the side before
// a plain turn: a marble rolling right over it is flicked over the outer wall onto a narrow lane alongside. The lane
// runs on past the tower's end, round a turn as wide as the bowl plus both lanes, and back alongside the next side,
// where the marble is flicked back in at B: about twice the bowl's way round. Its own chain (arc length from 1e4 up,
// clear of the course's) is collider, sweep and posts like any other; the sim tracks a marble on it by its line
function trapRoute(T, tp, W, h, i, m) {
  const A = frameAt(T.chains, tp.a.s), B = frameAt(T.chains, tp.b.s), E = frameAt(T.chains, tp.end);
  const hw = W / 2, c = hw + TRAP_HW + 2 * THICK + CLEAR + 1; // lane centre off the column's, outward (room for the bowl's lean)
  const fl = Math.hypot(A.t[0], A.t[2]), f = [A.t[0] / fl, A.t[2] / fl], inw = [-f[1] * h, f[0] * h]; // heading; toward the other column
  const along = (p, d) => (p[0] - A.p[0]) * d[0] + (p[2] - A.p[2]) * d[1];
  // horizontal lengths: out past the end, the wide turn (its span: across to B's column plus a lane each side), back to B
  const run = along(E.p, f) + TRAP_LEAD, lat = along(B.p, inw) + 2 * c, turn = lat / turnDisp(Math.PI, RAMP).side, back = Math.max(1, run - 1.2 - along(B.p, f));
  const y0 = A.p[1] - 0.3, th = Math.max(TRAP_SLOPE * DEG, Math.atan((y0 - B.p[1] - 0.3) / (run + turn + 1.2 + back))); // ends at or below B
  const U = { x: A.p[0] - inw[0] * c, y: y0, z: A.p[2] - inw[1] * c, a: Math.atan2(f[1], f[0]), th, b: 0, s: 1e4 * (i + 1), flags: TRAPF, mod: m.index,
    hw: TRAP_HW, H: LID, wl: WALL, wr: WALL, rb: RC, rt: 0.1, chain: null, chains: T.chains, line: [] };
  m.s0 = U.s;
  newChain(U, 'full');
  const cos = Math.cos(th);
  piece(U, run / cos);
  piece(U, turn / cos, { turn: h * Math.PI, bank: h * BOWL_BANK * DEG, H: BOWL_LID, rb: TRAP_HW - 0.02, wl: h > 0 ? BOWL_WALL : WALL, wr: h > 0 ? WALL : BOWL_WALL });
  piece(U, 1.2 / cos, { H: LID, rb: RC, wl: WALL, wr: WALL });
  piece(U, back / cos);
  U.chain.capEnd = 'full';
  m.s1 = U.s;
  const lane = s => { const q = frameAt([U.chain], s); return { p: q.p, t: q.t, r: q.r, u: q.u }; };
  const pad = A.p.map((v, k) => v + A.r[k] * tp.a.side * (hw - tp.a.r));
  const out = { a: { p: pad, r: tp.a.r, s: tp.a.s, mod: tp.a.mod, u: A.u, t: A.t }, b: { p: B.p, s: tp.b.s, mod: tp.b.mod, t: B.t, r: B.r, u: B.u },
    s0: m.s0, s1: m.s1, mod: m.index, line: U.line, in: lane(m.s0 + 1), out: lane(m.s1 - 1) };
  // a fork: its signal, and the EXPRESS, a glass tube over the turn from a mouth above A to one above B, FORK.exp faster
  // than rolling round (at V_REF)
  if (tp.fork) out.fork = { period: FORK.period, split: FORK.split, phase: tp.fork.phase,
    express: { a: A.p.map((v, k) => v + A.u[k] * EXP_H), b: B.p.map((v, k) => v + B.u[k] * EXP_H), land: B.p.map((v, k) => v + B.u[k] * MR),
      time: Math.max(0.3, (tp.b.s - tp.a.s) / V_REF - FORK.exp) } };
  return out;
}
// the express ride: the marble's centre at u (0..1) from where it left (x0): sucked up into the mouth over A, across in
// the tube, down out of the mouth over B onto its floor
const EXP_H = 2.4; // the tube's axis over the floor: its mouths clear the walls' lips and a marble rolling under
export function expressAt(ex, u, x0, out) {
  const [p, q, f] = u < 0.2 ? [x0, ex.a, smooth(u / 0.2)] : u < 0.85 ? [ex.a, ex.b, smooth((u - 0.2) / 0.65)] : [ex.b, ex.land, smooth((u - 0.85) / 0.15)];
  for (let k = 0; k < 3; k++) out[k] = lerp(p[k], q[k], f);
  if (u >= 0.2 && u < 0.85) out[1] += Math.sin(Math.PI * f) * 0.6; // a gentle arc across
  return out;
}

// ---------- trapdoors ----------
// lids zigzagging down a straight, left half then right half, a pair at a time, each with its own seeded clock (sim.js
// doorClock). A lid is hinged on its downstream edge and lifts up and back toward the oncoming marbles, so its hole faces them like a cave's
// mouth: a marble rolling into an open one drops through to a side track below the course's edge, rolls the long way
// round on it and is flicked back in at B, just past the doors. A is where the doors start
function trapdoor(T, W, m, rng) {
  piece(T, 1);
  const s0 = T.s, lids = [];
  for (let k = 0; k < 2 * DOOR.pairs; k++) lids.push({ s: s0 + doorAt(k) + DOOR.len / 2, half: k & 1, phase: rng() * DOOR.period });
  piece(T, DOOR_FIELD + DOOR.run);
  const b = T.s;
  piece(T, 1.5);
  // a hole: len along the course, across from mid off the centre line to edge short of the wall, on its half (0 left)
  return { a: { s: s0, mod: m.index }, b: { s: b, mod: m.index },
    door: { lids, len: DOOR.len, hw: W / 2, mid: DOOR.mid, edge: DOOR.edge, period: DOOR.period, warn: DOOR.warn, lift: DOOR.lift, open: DOOR.open } };
}
// its side track: off the course's outer side, DOOR.drop under its floor, a run back upstream from beside the lid just
// past halfway (so a marble eaten at any lid isn't carried far back), a tight U-turn outward and a run down to beside B, sized so
// the trip costs about DOOR.s against rolling on (at V_REF). Its start cap is the cave mouth the eaten marbles come out of
function doorLane(T, tp, W, h, i, m) {
  const ms = tp.door.lids[DOOR.pairs].s, A = frameAt(T.chains, tp.a.s), M = frameAt(T.chains, ms), B = frameAt(T.chains, tp.b.s);
  const hw = W / 2, c = hw + TRAP_HW + 2 * THICK + CLEAR + 1, r = TRAP_HW + 0.6;
  const fl = Math.hypot(M.t[0], M.t[2]), f = [M.t[0] / fl, M.t[2] / fl], inw = [-f[1] * h, f[0] * h]; // heading; toward the tower
  const ab = tp.b.s - ms, uLen = 2 * r / turnDisp(Math.PI, RAMP).side, x = Math.max(0.5, ((DOOR.s - DOOR.hops) * V_REF - uLen) / 2);
  const th = TRAP_SLOPE * DEG, cos = Math.cos(th);
  const U = { x: M.p[0] - inw[0] * c, y: M.p[1] - DOOR.drop, z: M.p[2] - inw[1] * c, a: Math.atan2(-f[1], -f[0]), th, b: 0, s: 1e4 * (i + 1), flags: TRAPF, mod: m.index,
    hw: TRAP_HW, H: LID, wl: WALL, wr: WALL, rb: RC, rt: 0.1, chain: null, chains: T.chains, line: [] };
  m.s0 = U.s;
  newChain(U, 'full');
  piece(U, x / cos);
  piece(U, uLen / cos, { turn: h * Math.PI, bank: h * BOWL_BANK * DEG, H: BOWL_LID, rb: TRAP_HW - 0.02, wl: h > 0 ? BOWL_WALL : WALL, wr: h > 0 ? WALL : BOWL_WALL });
  piece(U, 1.2 / cos, { H: LID, rb: RC, wl: WALL, wr: WALL });
  piece(U, Math.max(0.5, x + ab - 1.2) / cos);
  U.chain.capEnd = 'full';
  m.s1 = U.s;
  const lane = s => { const q = frameAt([U.chain], s); return { p: q.p, t: q.t, r: q.r, u: q.u }; };
  return { a: { p: A.p, s: tp.a.s, mod: tp.a.mod, u: A.u, t: A.t }, b: { p: B.p, s: tp.b.s, mod: tp.b.mod, t: B.t, r: B.r, u: B.u },
    s0: m.s0, s1: m.s1, mod: m.index, line: U.line, in: lane(m.s0 + 1), out: lane(m.s1 - 1), door: tp.door };
}

// marble centre at u (0..1) of a warp: sinks through A (first 30%), passes unseen under the track from A to B, rises
// out of B (last 20%) to sit on its floor. e: a roulette's exit (-1: w.b)
export function warpAt(w, u, out = [0, 0, 0], e = -1) {
  const a = w.a, b = e < 0 ? w.b : w.roulette.exits[e].b;
  if (u < 0.3) { const h = MR * (1 - 2 * u / 0.3); for (let k = 0; k < 3; k++) out[k] = a.p[k] + a.u[k] * h; return out; }
  if (u > 0.8) { const h = MR * (2 * (u - 0.8) / 0.2 - 1); for (let k = 0; k < 3; k++) out[k] = b.p[k] + b.u[k] * h; return out; }
  const f = smooth((u - 0.3) / 0.5);
  for (let k = 0; k < 3; k++) out[k] = lerp(a.p[k] - a.u[k] * MR, b.p[k] - b.u[k] * MR, f);
  return out;
}

// split checkpoints at 1/4, 1/2 and 3/4 of the course (progress values), each slid on past any mod that isn't plain
// floor (a turn, a jump, a boost) and clear of wormhole holes, trap pads and mud, so its line lies flat on open track
const PLAIN = new Set(['straight', 'pegs', 'ramp', 'bend']);
export function splitsOf(def) {
  const s0 = def.line[3], f = def.finish.s;
  const busy = [...def.wormholes, ...(def.traps || [])].flatMap(w => [[w.a.s, w.roulette ? def.W / 2 + 1 : 1.5], [w.b.s, 1.5], ...w.roulette ? [[w.roulette.exits[0].b.s, 1.5]] : []])
    .map(([b, c]) => [b - c, b + c]);
  const skip = [...def.mods.filter(m => !PLAIN.has(m.type)).map(m => [m.s0, m.s1 + 1]), ...busy, ...def.muds.map(md => [md.s0 - 0.6, md.s1 + 0.6])];
  return [0.25, 0.5, 0.75].map(q => {
    let s = s0 + (f - s0) * q, hit;
    while ((hit = skip.find(([a, b]) => s >= a && s < b))) s = hit[1];
    return Math.min(s, f - 2);
  });
}

// frame at course arc length s (linear between the two nearest emitted frames); chains: a TrackDef's (or the turtle's)
export function frameAt(chains, s) {
  for (const ch of chains) {
    const f = ch.f, k = f.length / FS;
    if (s < f[F.s] - 1e-6 || s > f[(k - 1) * FS + F.s] + 1e-6) continue;
    let j = 0;
    while (j < k - 2 && f[(j + 1) * FS + F.s] < s) j++;
    const a = j * FS, b = a + FS, q = Math.min(1, Math.max(0, (s - f[a + F.s]) / Math.max(1e-6, f[b + F.s] - f[a + F.s])));
    const v = o => [0, 1, 2].map(i => lerp(f[a + o + i], f[b + o + i], q));
    return { p: v(F.x), t: v(F.tx), r: v(F.rx), u: v(F.ux), hw: lerp(f[a + F.hw], f[b + F.hw], q) };
  }
  throw new Error('frameAt: s out of range ' + s);
}

// ---------- colliders ----------
// one trimesh per chain: the closed cross-section swept along its frames, normals facing into the channel
function chainMesh(ch) {
  const f = ch.f, k = f.length / FS, verts = new Float32Array(k * NP * 3), pr = new Float32Array(NP * 2), idx = [];
  for (let i = 0; i < k; i++) {
    const o = i * FS;
    profile(f[o + F.hw], f[o + F.H], f[o + F.rb], f[o + F.rt], pr);
    for (let j = 0; j < NP; j++) for (let c = 0; c < 3; c++)
      verts[(i * NP + j) * 3 + c] = f[o + c] + f[o + F.rx + c] * pr[j * 2] + f[o + F.ux + c] * pr[j * 2 + 1];
    if (i) for (let j = 0; j < NP; j++) {
      const a = (i - 1) * NP + j, b = (i - 1) * NP + (j + 1) % NP, c = i * NP + (j + 1) % NP, d = i * NP + j;
      idx.push(a, b, c, a, c, d);
    }
  }
  const extra = [];
  const cap = (i, back) => { // fan over the whole cross-section; back = it faces +t (a start cap)
    const base = i * NP, o = i * FS, ci = verts.length / 3 + extra.length / 3;
    for (let c = 0; c < 3; c++) extra.push(f[o + c] + f[o + F.ux + c] * f[o + F.H] / 2);
    for (let j = 0; j < NP; j++) back ? idx.push(ci, base + (j + 1) % NP, base + j) : idx.push(ci, base + j, base + (j + 1) % NP);
  };
  // a wall with a window: the jump landing's back wall (the kicker comes in), a narrow helix's comb (the middle tube goes
  // out); end = it closes the chain's end, facing back into it
  const win = (i, { below, gapHw, gapTop }, end) => {
    const o = i * FS, H = f[o + F.H], hw = f[o + F.hw];
    const pt = (x, y) => { const v = verts.length / 3 + extra.length / 3; for (let c = 0; c < 3; c++) extra.push(f[o + c] + f[o + F.rx + c] * x + f[o + F.ux + c] * y); return v; };
    const rect = (x0, y0, x1, y1) => { if (x1 <= x0 || y1 <= y0) return; const a = pt(x0, y0), b = pt(x1, y0), c = pt(x1, y1), d = pt(x0, y1); end ? idx.push(a, b, c, a, c, d) : idx.push(a, c, b, a, d, c); };
    rect(-hw, 0, hw, below); rect(-hw, below, -gapHw, H); rect(gapHw, below, hw, H); rect(-gapHw, gapTop, gapHw, H);
  };
  if (ch.capEnd === 'full') cap(k - 1, false); else if (ch.capEnd) win(k - 1, ch.capEnd, true);
  if (ch.capStart === 'full') cap(0, true); else if (ch.capStart) win(0, ch.capStart, false);
  const all = new Float32Array(verts.length + extra.length);
  all.set(verts); all.set(extra, verts.length);
  return { kind: 'trimesh', verts: all, idx: new Uint32Array(idx), part: 'chain' };
}

// triangle (a, b, c) of vertex array v, wound so its normal points along want ([x, y, z]); oriented meshes (the
// internal-edge fix makes Rapier treat a mesh as one-sided) push a marble out through a triangle that faces away
function face(v, idx, a, b, c, want) {
  const u = [0, 1, 2].map(k => v[b * 3 + k] - v[a * 3 + k]), w = [0, 1, 2].map(k => v[c * 3 + k] - v[a * 3 + k]);
  const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
  if (Math.hypot(...n) < 1e-9) return; // degenerate
  n[0] * want[0] + n[1] * want[1] + n[2] * want[2] >= 0 ? idx.push(a, b, c) : idx.push(a, c, b);
}
const mesh = (v, idx, twoSided, part) => ({ kind: 'trimesh', verts: new Float32Array(v), idx: new Uint32Array(idx), twoSided, part });

// start ring: the cone (an annulus from the hole's rim out), a lid over everything (a stacked crowd is never crushed),
// the outer wall, the catch box under the hole with a skirt over the board's mouth, and the stall dividers. All
// two-sided: a crowd squeezed at the hole must not be pushed through a one-sided surface
function fanMeshes(fan) {
  const { hr, rStall, rBack, y, W, z0, floorAt, top, half } = fan, ANG = 72, RAD = 8;
  const ring = (rOf, yOf, part) => {
    const v = [], idx = [];
    for (let i = 0; i < ANG; i++) for (let j = 0; j <= RAD; j++) { const a = 2 * Math.PI * i / ANG, r = rOf(j); v.push(r * Math.sin(a), yOf(r), -r * Math.cos(a)); }
    for (let i = 0; i < ANG; i++) for (let j = 0; j < RAD; j++) {
      const A = i * (RAD + 1) + j, B = ((i + 1) % ANG) * (RAD + 1) + j;
      face(v, idx, A, B, B + 1, [0, 1, 0]); face(v, idx, A, B + 1, A + 1, [0, 1, 0]);
    }
    return mesh(v, idx, true, part);
  };
  const out = [ring(j => hr + (rBack - hr) * j / RAD, y, 'fanFloor'), ring(j => Math.max(0.01, rBack * j / RAD), r => y(Math.max(r, hr)) + top, 'fanLid')];
  const v = [], idx = [], P = (x, yy, z) => (v.push(x, yy, z), v.length / 3 - 1);
  const quad = (a, b, c, d) => idx.push(a, b, c, a, c, d);
  for (let i = 0; i < ANG; i++) { // outer wall, up to the lid
    const a0 = 2 * Math.PI * i / ANG, a1 = 2 * Math.PI * (i + 1) / ANG, yb = y(rBack);
    quad(P(rBack * Math.sin(a0), yb, -rBack * Math.cos(a0)), P(rBack * Math.sin(a1), yb, -rBack * Math.cos(a1)), P(rBack * Math.sin(a1), yb + top, -rBack * Math.cos(a1)), P(rBack * Math.sin(a0), yb + top, -rBack * Math.cos(a0)));
  }
  // catch box: walls from its floor up to the cone's underside (side walls x = +-W, back wall), and the skirt above the
  // board's lid at its mouth
  const cone = (x, z) => y(Math.max(hr, Math.hypot(x, z))), zb = -hr - 0.3, K = 12;
  for (let k = 0; k < K; k++) {
    const za = zb + (z0 - zb) * k / K, zc = zb + (z0 - zb) * (k + 1) / K;
    for (const x of [-W, W]) quad(P(x, floorAt(za), za), P(x, floorAt(zc), zc), P(x, cone(x, zc) - 0.02, zc), P(x, cone(x, za) - 0.02, za));
    const xa = -W + 2 * W * k / K, xc = -W + 2 * W * (k + 1) / K;
    quad(P(xa, floorAt(zb), zb), P(xc, floorAt(zb), zb), P(xc, cone(xc, zb) - 0.02, zb), P(xa, cone(xa, zb) - 0.02, zb));
    quad(P(xa, floorAt(z0) + LID, z0), P(xc, floorAt(z0) + LID, z0), P(xc, cone(xc, z0) - 0.02, z0), P(xa, cone(xa, z0) - 0.02, z0));
  }
  out.push(mesh(v, idx, true, 'fanWall'));
  const bv = [], bi = []; // the box floor
  for (const [x, z] of [[-W, zb], [W, zb], [W, z0], [-W, z0]]) bv.push(x, floorAt(z), z);
  face(bv, bi, 0, 1, 2, [0, 1, 0]); face(bv, bi, 0, 2, 3, [0, 1, 0]);
  out.push(mesh(bv, bi, true, 'fanBox'));
  for (const st of fan.stalls) for (const d of [-1, 1]) { // a divider each side of every stall
    const psi = st.psi + d * (half + 0.04 / rStall), r = rStall + STALL_DEPTH / 2;
    out.push({ kind: 'cuboid', half: [0.04, 0.62, STALL_DEPTH / 2], p: [r * Math.sin(psi), y(r) + 0.6, -r * Math.cos(psi)], yaw: Math.PI - psi, part: 'divider' });
  }
  return out;
}

// carousel: the static outer wall (with its two openings) as a trimesh; the turning ring's parts in its own frame
function ringMeshes(rg) {
  const { c, rWall, wall, open } = rg, v = [], idx = [], K = 144, yb = c[1] - (rg.rOut - rg.rIn) * Math.tan(rg.tilt) - 0.4;
  const inOpen = a => open.find(([a0, a1]) => { const lo = Math.min(a0, a1), hi = Math.max(a0, a1); return wrapA(a - lo) >= 0 && wrapA(a - lo) <= hi - lo; });
  for (let i = 0; i < K; i++) {
    const a0 = 2 * Math.PI * i / K, a1 = 2 * Math.PI * (i + 1) / K, o = inOpen((a0 + a1) / 2);
    if (o && o[2] == null) continue; // the exit: a clean gap
    const top = c[1] + (o ? o[2] : wall); // the entry: only a skirt under the chute floor
    const p = a => [c[0] + Math.cos(a) * rWall, c[2] + Math.sin(a) * rWall];
    const [x0, z0] = p(a0), [x1, z1] = p(a1), b = v.length / 3;
    v.push(x0, yb, z0, x1, yb, z1, x1, top, z1, x0, top, z0);
    idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  // the ring, in its own frame (origin at the centre, at hub floor height): floor annulus tilted outward, a hub,
  // and the seat dividers
  const fv = [], fi = [], A = 64, tilt = Math.tan(rg.tilt);
  for (let i = 0; i <= A; i++) {
    const a = 2 * Math.PI * i / A;
    for (const r of [rg.rIn - 0.05, (rg.rIn + rg.rOut) / 2, rg.rOut + 0.08]) fv.push(Math.cos(a) * r, -(r - rg.rIn) * tilt, Math.sin(a) * r);
  }
  for (let i = 0; i < A; i++) for (let j = 0; j < 2; j++) { const a = i * 3 + j; face(fv, fi, a, a + 4, a + 1, [0, 1, 0]); face(fv, fi, a, a + 3, a + 4, [0, 1, 0]); }
  const parts = [mesh(fv, fi), { kind: 'cylinder', half: 0.55, r: rg.rIn, p: [0, 0.5, 0] }];
  // each divider's outer end bends forward into a little hook (the way the ring turns): a marble the divider pushes
  // into the corner bounces back inside and rides on until it gets round the hook
  const sg = Math.sign(rg.omega) || 1, rh = rg.rOut - 0.06, d = 0.06 + RING.hook / 2;
  for (let k = 0; k < rg.seats; k++) {
    const a = 2 * Math.PI * k / rg.seats, r = (rg.rIn + rg.rOut) / 2;
    parts.push({ kind: 'cuboid', half: [(rg.rOut - rg.rIn) / 2 + 0.05, rg.divH / 2, 0.06], p: [Math.cos(a) * r, rg.divH / 2 - (r - rg.rIn) * tilt - 0.05, Math.sin(a) * r], yaw: -a });
    parts.push({ kind: 'cuboid', half: [0.06, rg.divH / 2, RING.hook / 2], p: [Math.cos(a) * rh - Math.sin(a) * sg * d, rg.divH / 2 - (rh - rg.rIn) * tilt - 0.05, Math.sin(a) * rh + Math.cos(a) * sg * d], yaw: -a, part: 'hook' });
  }
  return { wall: mesh(v, idx, true, 'ringWall'), parts };
}

// boomerang trough: the floor, near wall and quarter-pipe wall (one-sided, facing in: marbles roll fast on it), the side
// wall at its start and the end wall (with the exit's window across the floor), the near wall's square start, the near
// wall along the floor's near edge (with a window where the drop comes in), and the lid
function boomMeshes(bm) {
  const { hw, vEnd, rq, rn, yE, hE, yX, hX } = bm, { P, yF, feet, prof, NR, cols } = boomGeo(bm);
  const fv = [], fi = [], NF = prof(0).length;
  for (const v of cols) for (const [u, y] of prof(v)) fv.push(...P(u, v, y));
  for (let c = 0; c < cols.length - 1; c++) {
    const pr = prof(cols[c]), pq = prof(cols[c + 1]);
    for (let i = cols[c] === hw ? NR : 0; i < NF - 1; i++) { // across the near wall's square start: the floor only
      const du = pr[i + 1][0] - pr[i][0] + pq[i + 1][0] - pq[i][0], dy = pr[i + 1][1] - pr[i][1] + pq[i + 1][1] - pq[i][1];
      const a = c * NF + i, b = a + NF, want = [-dy * bm.f[0], du, -dy * bm.f[1]];
      face(fv, fi, a, a + 1, b + 1, want); face(fv, fi, a, b + 1, b, want);
    }
  }
  const wv = [], wi = [], quad = (...q) => { const a = wv.length / 3; q.forEach(p => wv.push(...p)); face(wv, wi, a, a + 1, a + 2, [0, 1, 0]); face(wv, wi, a, a + 2, a + 3, [0, 1, 0]); };
  const lid = v => yF(0, v) + bm.top, near = v => prof(v)[0];
  for (const v of [-hw, vEnd]) { // the side walls: from the floor's profile up to the lid; in the end wall the exit's window over the floor
    const pr = prof(v), exit = v === vEnd;
    for (let i = 0; i < NF - 1; i++) if (!exit || i < NR || i >= NR + 2) quad(P(pr[i][0], v, pr[i][1]), P(pr[i + 1][0], v, pr[i + 1][1]), P(pr[i + 1][0], v, lid(v)), P(pr[i][0], v, lid(v)));
    if (exit) { const [a, b] = feet(v); quad(P(a, v, yX + hX), P(b, v, yX + hX), P(b, v, lid(v)), P(a, v, lid(v))); }
  }
  // the near wall's square start, from under its foot to the lid (it covers the drop's outside; a marble bounced off it
  // heads along the trough anyway)
  { const v = cols[3], u0 = feet(v)[0] - rn - 0.05, lo = yF(0, v) - 0.3; quad(P(u0, v, lo), P(0, v, lo), P(0, v, lid(v)), P(u0, v, lid(v))); }
  // near wall: bands between neighbouring columns along the floor's near edge, up to the lid; at the drop's foot a skirt
  // under the chain's floor and a band over its lid
  const band = (v0, v1, lo, hi) => { if (hi(v0) > lo(v0) + 1e-3) quad(P(near(v0)[0], v0, lo(v0)), P(near(v1)[0], v1, lo(v1)), P(near(v1)[0], v1, hi(v1)), P(near(v0)[0], v0, hi(v0))); };
  const under = v => near(v)[1] - 0.3;
  for (let c = 0; c < cols.length - 1; c++) {
    const v0 = cols[c], v1 = cols[c + 1];
    if (v1 <= hw) { band(v0, v1, under, () => yE); band(v0, v1, () => yE + hE, lid); }
    else band(v0, v1, under, lid);
  }
  const lv = [], li = [];
  for (const v of cols) lv.push(...P(near(v)[0], v, lid(v)), ...P(feet(v)[1] + rq, v, lid(v)));
  for (let c = 0; c < cols.length - 1; c++) { const a = c * 2; face(lv, li, a, a + 1, a + 3, [0, -1, 0]); face(lv, li, a, a + 3, a + 2, [0, -1, 0]); }
  return [mesh(fv, fi, false, 'boomFloor'), mesh(wv, wi, true, 'boomWall'), mesh(lv, li, true, 'boomLid')];
}


// bowl: the drain's throat, the dish, the wall and the lip revolved round the drain's axis, and the ceiling under the
// chute; two-sided (a swirling crowd pressed against them must never be pushed through)
function basinMeshes({ c, rim, open, prof, cap }) {
  const A = 72, P = prof.length, v = [], idx = [];
  for (let i = 0; i < A; i++) { const a = 2 * Math.PI * i / A; for (const [r, y] of prof) v.push(c[0] + Math.cos(a) * r, c[1] + y, c[2] + Math.sin(a) * r); }
  const gapAt = a => open && wrapA(a - open[0]) >= 0 && wrapA(a - open[0]) <= open[1] - open[0];
  for (let i = 0; i < A; i++) for (let j = 0; j < P - 1; j++) {
    if (prof[j][1] >= rim - 1e-6 && gapAt(2 * Math.PI * (i + 0.5) / A)) continue; // the chute's way in
    const p = i * P + j, q = (i + 1) % A * P + j; idx.push(p, q, q + 1, p, q + 1, p + 1);
  }
  return [mesh(v, idx, true, 'basin'), mesh(cap.flat(), [0, 1, 2, 0, 2, 3], true, 'basinCap')];
}

// ---------- packaging + the overlap check ----------
function pack(o) {
  const { T, mods } = o;
  const chains = T.chains.map(ch => ({ f: new Float32Array(ch.f), capStart: ch.capStart, capEnd: ch.capEnd, ghost: ch.ghost, side: ch.side })); // ghost: drawn, no collider; side: a coil's, for its colour
  // boxes: chains in chunks of ~2.5 of arc length, per module (plus the fan and the ring)
  const boxes = [];
  const grow = (b, x, y, z) => { b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y); b[2] = Math.min(b[2], z); b[3] = Math.max(b[3], x); b[4] = Math.max(b[4], y); b[5] = Math.max(b[5], z); };
  for (const ch of chains) {
    const f = ch.f, k = f.length / FS;
    let box = null, m = -1, s0 = 0;
    for (let i = 0; i < k; i++) {
      const fo = i * FS, mi = f[fo + F.mod];
      if (!box || mi !== m || f[fo + F.s] - s0 > 2.5) {
        if (box) boxes.push(box);
        box = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity, mi]; m = mi; s0 = f[fo + F.s];
        if (i) addFrame(box, f, fo - FS); // chunks overlap by one frame so there's no seam in between
      }
      addFrame(box, f, fo);
    }
    boxes.push(box);
  }
  function addFrame(b, f, fo) {
    const hw = f[fo + F.hw] + THICK, H = f[fo + F.H] + THICK;
    for (const x of [-hw, hw]) for (const y of [-THICK, H]) grow(b, f[fo] + f[fo + 6] * x + f[fo + 9] * y, f[fo + 1] + f[fo + 7] * x + f[fo + 10] * y, f[fo + 2] + f[fo + 8] * x + f[fo + 11] * y);
  }
  const fan = o.fan, rb = fan.rBack + THICK;
  boxes.push([-rb, fan.floorAt(fan.z0) - 0.5, -rb, rb, fan.y(fan.rBack) + fan.top + THICK, rb, 0]);
  for (const { c, rWall, wall, mod } of o.rings) {
    const r = rWall + THICK;
    boxes.push([c[0] - r, c[1] - 1, c[2] - r, c[0] + r, c[1] + wall + 0.1, c[2] + r, mod]);
  }
  for (const bm of o.booms) {
    const b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity, bm.mod];
    for (const p of bm.poly) { grow(b, p[0], p[1] - 0.3 - THICK, p[2]); grow(b, p[0], p[1] + bm.top + THICK, p[2]); }
    boxes.push(b);
  }
  for (const { c, rB, top, mod } of o.basins) { const r = rB + THICK; boxes.push([c[0] - r, c[1] - 0.5, c[2] - r, c[0] + r, c[1] + top + THICK, c[2] + r, mod]); }
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    if (Math.abs(a[6] - b[6]) < 2) continue; // neighbours touch by design
    if (a[0] - CLEAR < b[3] && b[0] - CLEAR < a[3] && a[1] - CLEAR < b[4] && b[1] - CLEAR < a[4] && a[2] - CLEAR < b[5] && b[2] - CLEAR < a[5]) {
      overlap.last = [a, b].map(x => [mods[x[6]].type + x[6], ...x.slice(0, 6).map(v => +v.toFixed(2))]);
      return null;
    }
  }
  for (const m of mods) {
    m.aabb = boxes.filter(b => b[6] === m.index).reduce((u, b) => [Math.min(u[0], b[0]), Math.min(u[1], b[1]), Math.min(u[2], b[2]), Math.max(u[3], b[3]), Math.max(u[4], b[4]), Math.max(u[5], b[5])], [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity]);
    delete m.fan;
  }
  // centre line: x y z s per point
  const line = new Float32Array(T.line);
  const bounds = boxes.reduce((u, b) => [Math.min(u[0], b[0]), Math.min(u[1], b[1]), Math.min(u[2], b[2]), Math.max(u[3], b[3]), Math.max(u[4], b[4]), Math.max(u[5], b[5])], [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity]);
  const { y, at, floorAt, ...fanData } = fan; // functions stay behind: a TrackDef is plain data
  void y; void at; void floorAt;
  const colliders = [...chains.filter(ch => !ch.ghost).map(chainMesh), ...fanMeshes(fan), ...o.basins.flatMap(basinMeshes)];
  const rings = o.rings.map(rg => { const rm = ringMeshes(rg); colliders.push(rm.wall); return { ...rg, parts: rm.parts }; });
  for (const bm of o.booms) colliders.push(...boomMeshes(bm));
  return {
    seed: o.seed, n: o.n, tier: o.tier, retry: o.retry, picks: o.picks, grow: o.grow, W: o.W, h: o.h, D: o.D, L: o.L, R, stadium: o.stadium,
    length: o.finish.s, drop: bounds[4] - o.finish.p[1], bounds,
    chains, line, mods, colliders,
    pegs: o.pegs.map(p => ({ p: p.p, ax: p.ax, r: p.r, h: PEG_H, mod: p.mod })), moguls: o.moguls,
    fan: fanData,
    boosts: o.boosts, jumps: o.jumps, wormholes: o.wormholes, traps: o.traps, muds: o.muds,
    rings, basins: o.basins, boomerangs: o.booms, mist: o.mist, coils: o.coils, finish: o.finish,
  };
}
