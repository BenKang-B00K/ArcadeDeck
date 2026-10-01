// Pure ladder logic (no DOM): generation + path tracing.
// Points are normalized: x = column index, y = 0..1 (top..bottom).

export const HOLE_CHANCE = 0.2; // how often a ladder gets wormholes
export const MAX_HOLES = 3; // a ladder with wormholes gets 1..MAX_HOLES of them
// mouths sit in 15%..60% of the height, >= 15% apart; 15% = top of the fully widened peek band (game.js SEEN - EXT),
// so every wormhole is uncovered by the time the 3 s peek ends
export const HOLE_TOP = 0.15, HOLE_BOT = 0.6, HOLE_GAP = 0.15;
export const TILT_CHANCE = 0.36; // chance a rung tries to slope; a few find no room and stay flat, so ~30% end up diagonal
export const TILT = [0.03, 0.06]; // a diagonal's ends sit 2x this apart in height, as a share of the whole ladder
// carousel: centre line in 20%..78% (inside the fully widened peek band), half-height and overhang past its end rails
export const RING_TOP = 0.2, RING_BOT = 0.78, RING_RY = 0.025, RING_OUT = 0.3, RING_GAP = 0.15;

// every rung end on rail c (y values)
export const ends = (grid, c) => grid.flatMap(row => [row[c] && row[c][0], row[c - 1] && row[c - 1][1]]).filter(Boolean);

// scale: ladder height setting, multiplies the number of rung rows (1 = medium); tiltChance 0 = straight rungs only, 1 = diagonal only
// either: a ladder that got a carousel gets no wormholes (one of the two, never both)
export function makeLadder(n, rand = Math.random, holeChance = HOLE_CHANCE, scale = 1, tiltChance = TILT_CHANCE, ringChance = 0, either = false) {
  const rows = Math.round((8 + n) * scale);
  for (;;) {
    // grid[r][c] = [y on rail c, y on rail c+1] of the rung joining them on row r, or 0 when empty
    const grid = [];
    for (let r = 0; r < rows; r++) {
      const row = new Array(n - 1).fill(0);
      for (let c = 0; c < n - 1; c++) {
        // no two rungs side by side on one row -> each junction is unambiguous
        if (!row[c - 1] && rand() < 0.42) { const y = (r + 0.5 + (rand() - 0.5) * 0.56) / rows; row[c] = [y, y]; }
      }
      grid.push(row);
    }
    tilt(grid, rows, rand, tiltChance);
    // ponytail: retry until every gap has a rung (~1.5% of draws fail at n=10, more when tiltChance 1 drops rungs)
    if (grid[0].every((_, c) => grid.some(row => row[c]))) {
      const rings = rand() < ringChance ? makeRing(n, rows, grid, rand) : [];
      return { n, rows, grid, rings, holes: !(either && rings.length) && rand() < holeChance ? makeHoles(n, rows, grid, rings, rand) : [] };
    }
  }
}

// Slopes some rungs. Each rung end is still a two-way switch, so paths stay one-to-one and loop-free
// even when a slope makes a path climb a little.
// Slope size is a share of the whole ladder, not of a row, so it looks the same at every height
// (a Long ladder packs more rows into the same board; per-row slopes came out flatter there).
// Each rung tries its drawn slope both ways, then gentler ones; one that crowds a rung end or
// crosses a rung in its gap is skipped, and if none fits the rung stays flat (chance 1: it's removed, so none stay flat).
function tilt(grid, rows, rand, chance) {
  const apart = ys => ys.sort((p, q) => p - q).every((y, k) => !k || y - ys[k - 1] > 0.3 / rows);
  grid.forEach(row => row.forEach((flat, c) => {
    if (!flat || rand() >= chance) return;
    const base = TILT[0] + rand() * (TILT[1] - TILT[0]), s = rand() < 0.5 ? -1 : 1;
    for (const d of [1, 0.75, 0.5].flatMap(f => [s * f * base, -s * f * base])) {
      const [l, r] = row[c] = [flat[0] - d, flat[1] + d];
      if ([l, r].every(y => y > 0.02 && y < 0.98) && apart(ends(grid, c)) && apart(ends(grid, c + 1)) &&
        grid.every(o => !o[c] || o === row || Math.sign(o[c][0] - l) === Math.sign(o[c][1] - r))) return;
    }
    row[c] = chance >= 1 ? 0 : flat;
  }));
}

// next rung end below y on rail c: [y, rail it leads to, y it arrives at] or [1, null] at the bottom
function next(grid, c, y) {
  let best = 1, go = null, out = 1;
  for (const row of grid) {
    if (row[c] && row[c][0] > y && row[c][0] < best) [best, go, out] = [row[c][0], c + 1, row[c][1]];
    if (row[c - 1] && row[c - 1][1] > y && row[c - 1][1] < best) [best, go, out] = [row[c - 1][1], c - 1, row[c - 1][0]];
  }
  return [best, go, out];
}

// Wormholes: two-way. Mouth `a` (lower) lifts whoever falls into it to `b` (higher, another rail),
// and `b` drops whoever falls into it down to `a`. Like a slanted rung it swaps two paths, so results
// stay one-to-one and no path can loop (every rail segment still has exactly one way in).
function makeHoles(n, rows, grid, rings, rand) {
  const want = 1 + Math.floor(rand() * MAX_HOLES), holes = [];
  // off every rung end and the carousel, and mouths on one rail kept apart so they never overlap
  const clear = (c, y) => ends(grid, c).every(e => Math.abs(e - y) > 0.3 / rows) &&
    rings.every(r => c < r.c0 || c >= r.c0 + r.k || Math.abs(r.y - y) > RING_RY + 0.06) &&
    holes.every(h => [h.a, h.b].every(([hc, hy]) => hc !== c || Math.abs(hy - y) > 0.08));
  const spot = (c, lo, hi) => { for (let t = 0; t < 30; t++) { const y = lo + rand() * (hi - lo); if (clear(c, y)) return [c, y]; } return null; };
  // ponytail: rejection sampling; a crowded small ladder may end up with fewer than `want`
  for (let tries = 0; tries < 60 && holes.length < want; tries++) {
    const c = Math.floor(rand() * n);
    const c2 = (c + 1 + Math.floor(rand() * (n - 1))) % n; // any other rail
    // both mouths in HOLE_TOP..HOLE_BOT, `a` at least HOLE_GAP below `b`
    const b = spot(c2, HOLE_TOP, HOLE_BOT - HOLE_GAP), a = b && spot(c, b[1] + HOLE_GAP, HOLE_BOT);
    if (!a) continue;
    holes.push({ a, b });
    // keep it only if every wormhole still catches someone and no carousel seat is cut off in a closed loop
    const ts = Array.from({ length: n }, (_, i) => trace({ grid, holes, rings }, i));
    if (holes.some((_, k) => !ts.some(t => t.warps.some(w => w.hole === k))) ||
      rings.some((r, g) => ts.flatMap(t => t.rides).filter(x => x.ring === g).length !== r.k)) holes.pop();
  }
  return holes;
}

// Carousel: a ring over k = 3..4 neighbouring rails at height y. Whoever reaches a rail's seat rides one seat on
// (dir 1: rightward along the front, the last seat wraps round the back to the first; dir -1: the mirror) and carries on
// down from there. A cyclic shift of k paths: still one-to-one, and the rail below each seat keeps exactly one way in,
// so no loops. Rungs in or next to the ring's band are cleared away; a spot that would empty a gap is skipped.
// A ladder gets 1..floor(n / 3) of them; two sharing a rail sit at least RING_GAP apart in height.
function makeRing(n, rows, grid, rand) {
  if (n < 3) return [];
  const want = 1 + Math.floor(rand() * Math.floor(n / 3)), rings = [];
  const R = RING_RY + 0.3 / rows; // rung ends stay this far off the centre line, as far as from any other rung end
  // ponytail: rejection sampling; a crowded ladder may end up with fewer than `want`
  for (let tries = 0; tries < 40 * want && rings.length < want; tries++) {
    const k = Math.min(n, 3 + Math.floor(rand() * 2)), c0 = Math.floor(rand() * (n - k + 1));
    const y = RING_TOP + rand() * (RING_BOT - RING_TOP);
    if (rings.some(r => c0 < r.c0 + r.k && r.c0 < c0 + k && Math.abs(r.y - y) < RING_GAP)) continue;
    const keep = grid.map(row => row.slice());
    // gaps under the ring plus the two it overhangs into
    for (const row of keep) for (let g = Math.max(0, c0 - 1); g <= Math.min(n - 2, c0 + k - 1); g++) {
      const v = row[g];
      if (v && (Math.abs(v[0] - y) < R || Math.abs(v[1] - y) < R || (v[0] - y) * (v[1] - y) < 0)) row[g] = 0;
    }
    if (keep[0].every((_, g) => keep.some(row => row[g]))) {
      keep.forEach((row, r) => grid[r] = row);
      rings.push({ c0, k, y, dir: rand() < 0.5 ? 1 : -1 });
    }
  }
  return rings;
}

// the ring is an ellipse centred mid-span; seats sit where the rails cross its front (lower) half
export const ringBox = ({ c0, k, y }) => ({ cx: c0 + (k - 1) / 2, rx: (k - 1) / 2 + RING_OUT, y });
const seatAngle = (r, c) => { const { cx, rx } = ringBox(r); return Math.acos((c - cx) / rx); };
export const seat = (r, c) => [c, r.y + RING_RY * Math.sin(seatAngle(r, c))];
// points along the ring from the seat on rail c to the one on rail d, turning r.dir's way
function ride(r, c, d) {
  const { cx, rx, y } = ringBox(r), a = seatAngle(r, c);
  let b = seatAngle(r, d);
  if (r.dir > 0 && b >= a) b -= 2 * Math.PI; // rightward = angle falling; past the right end it runs round the back
  if (r.dir < 0 && b <= a) b += 2 * Math.PI;
  const steps = Math.ceil(Math.abs(b - a) * 6), pts = [seat(r, c)];
  for (let s = 1; s < steps; s++) { const t = a + (b - a) * s / steps; pts.push([cx + rx * Math.cos(t), y + RING_RY * Math.sin(t)]); }
  return [...pts, seat(r, d)];
}

// sine curve from mouth p to mouth q, in normalized coords (shared by the trace and the drawn guide)
export function wave(p, q, steps = 32) {
  const pts = [];
  for (let s = 0; s <= steps; s++) {
    const f = s / steps;
    pts.push([p[0] + (q[0] - p[0]) * f + Math.sin(f * Math.PI * 3) * 0.22, p[1] + (q[1] - p[1]) * f]);
  }
  return pts;
}

// warps: { at, out, hole } = point indices where the path dives in / comes out, and which wormhole; rides: same for the carousel.
export function trace({ grid, holes, rings = [] }, start) {
  let c = start, y = 0;
  const points = [[c, 0]], warps = [], rides = [];
  for (;;) {
    // next thing below y on rail c: a rung end, a wormhole mouth (either one leads to the other) or a carousel seat
    const [best, go, out] = next(grid, c, y);
    let hit = null, lim = best;
    holes.forEach(({ a, b }, hole) => {
      for (const [p, q] of [[a, b], [b, a]]) if (p[0] === c && p[1] > y && p[1] < lim) { lim = p[1]; hit = { pts: wave(p, q), to: q, list: warps, hole }; }
    });
    rings.forEach((r, ring) => {
      if (c < r.c0 || c >= r.c0 + r.k) return;
      const s = seat(r, c)[1], d = r.c0 + (c - r.c0 + r.dir + r.k) % r.k;
      if (s > y && s < lim) { lim = s; hit = { pts: ride(r, c, d), to: seat(r, d), list: rides, ring }; }
    });
    if (hit) {
      const at = points.length, { list, pts, to, ...which } = hit;
      points.push(...pts); // wave(b, a) is wave(a, b) reversed, so it rides the drawn line
      list.push({ at, out: points.length - 1, ...which });
      [c, y] = to;
      continue;
    }
    if (go == null) break;
    points.push([c, best], [go, out]);
    c = go; y = out;
  }
  points.push([c, 1]);
  return { start, end: c, points, warps, rides };
}
