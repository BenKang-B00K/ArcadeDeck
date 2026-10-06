// Physics: a Rapier world built from a TrackDef. Fixed 1/120 s steps, the safety nets, and plain events
// ({ t, type, i, j?, pos, data }) for the view and the audio, which never reach into Rapier. No three.js, no DOM.
// Rapier comes in as a parameter (race.js and test.mjs both pass the vendored deterministic build), so the same
// seed and gate picks replay identically, on every device.
//
// Sensors (boost pads, wormhole mouths, the mist tube, the carousel, the finish line) are worked out from each
// marble's progress along the course centre line and its position, not from sensor colliders.

import { R, MR, TIER_TIME, warpAt, expressAt, sectorOf, mulberry32, stallAt, spinXZ, boomGeo, BUMP_R, COMB } from './track.js';

// ---------- tuning (physics) ----------
export const DT = 1 / 120;
const GRAVITY = -35; // toy scale: quicker than real marbles, still easy to follow
export const VMAX = 25; // speed cap, clamped after every step (no tunnelling, watchable)
const LIN_DAMP = 0, ANG_DAMP = 0.01; // next to no drag: a rolling marble coasts
const DENSITY = 2.5, M_REST = 0.6, M_FRIC = 0.08; // marble; against the track the Min rule gives the track's restitution
// inertia: a marble's moment of inertia is 0.5 m r² (a solid ball's is 0.4), so its spin works as a flywheel and drives
// it back up to speed after a hit (mass alone changes nothing: every marble weighs the same, the track is fixed)
const MASS = DENSITY * 4 / 3 * Math.PI * MR ** 3, MOI = 0.5 * MASS * MR * MR;
// friction averages: marble-marble 0.08 (slippery glass: a crowd can't lock into an arch), marble-track (0.08+0.72)/2 = 0.4
const T_REST = 0.2, T_FRIC = 0.72;
// a boomerang's trough grips (marble-trough 0.92): a marble turning round high on its curved walls keeps rolling instead
// of slipping (that needs (2/7) tan of the slope), so it comes back with most of its speed and swings again
const BOOM_FRIC = 1.76;
const PEG_REST = 0.75, PEG_KICK = [1.8, 2]; // pegs act like pinball bumpers: springy (Max rule), and a hit flicks the marble sideways and on down, u/s
const BUMP_REST = 0.95, BUMP_KICK = [3.6, 2]; // the half-pegs on the walls: bouncier, and they fling a marble back out across the board
const BOOST = 6; // u/s added along the course on a boost pad
const POP = 6; // u/s straight up out of a wormhole's hole B (a hop of about half a unit)
const STUCK_V = 0.3, STUCK_T = 1.5, NUDGES = 3; // nudge after STUCK_T s under STUCK_V; teleport after NUDGES of them
const STALL_T = 2.5; // ... or after this long without gaining half a unit of progress
const RIDE_MAX = 8; // s: a marble the carousel hooks keep riding this long is set down on the exit chute
const SWING_MAX = 12; // s: a marble still swinging in a boomerang (or back up its drop) this long is set down at the exit
const BASIN_DAMP = 0.15, BASIN_MAX = 9; // a bowl's water drag (damping in the dish); s swirling before it's dropped down the drain
const FLAP_T = 0.25; // gate flaps swing down in this long
const BUMP_V = 2.2; // closing speed that counts as a hit (clack, sparks)
// a real knock from behind: the marble in front is stunned (OUCH!) and stands frozen where it was hit, the one behind
// gets the ATTACK! buff
const STUN_V = 6; // closing speed of a real knock
const STUN_CD = 4; // s before a marble can be stunned again
// no stuns in the start hopper, on peg boards or in banked turns: a frozen marble there walls in the crowd behind it
// (nor over the trapdoors: frozen beside an opening hole it would be a sitting duck)
const NO_STUN = new Set(['hopper', 'pegs', 'bowl', 'bend', 'boomerang', 'basin', 'whirlpool', 'trapdoor']);
export const STUN_T = 0.4, ATK_T = 0.8; // s
const ATK_ACC = 7; // u/s² pushed along the course while the buff lasts
// catch-up tailwind: a marble behind the leader is pushed along the course, from nothing CHASE_G0 back to the full
// CHASE CHASE_G1 further, x CHASE_LATE over the last quarter, so the field closes up for the finish (race position
// only, never who the player is: every player keeps the same odds)
const CHASE = 6, CHASE_G0 = 2, CHASE_G1 = 15, CHASE_LATE = 1.6; // u/s², units, units, factor
const DRAFT = 4, DRAFT_D = 4; // slipstream: u/s² while tucked in up to DRAFT_D right behind another marble
const CAP = 3; // time cap = CAP x the tier's median race time
const HOP_T = 0.45, HOP_H = 2.2; // flick over the wall onto a trap lane (and back in): seconds, arc height
const QUICK_T = 0.3; // s: a fork's spring flick onto its lane
const DOOR_HOP = 0.15; // s: a trapdoor's fall to its side track, and its hop back in
const MUD_DAMP = 4.5; // linear and angular damping on a mud patch (gravity down a 10° run balances it at about 1.35 u/s)
const GUST = [-4, 7]; // u/s² along the course: each marble meets its own gust in the mist tube, from a headwind (-) to a tailwind (+)
const HOOP_V = 5; // u/s added through a jump's hoop
const WHIRL_MAX = 6; // s past a whirlpool's longest hold before its marble is dropped down the drain (the bowl's net)
const JACK_CALM = 0.5; // s a marble popping out of a roulette's JACKPOT can't be knocked dizzy (it lands on a crowd)
const ROU_V = 8; // u/s every marble pops out of a roulette's exits at, whatever it dropped in at: JACKPOT's lead is a time
// trapdoors: an open lid's angle (leaning back over its hole), how high over the floor a marble still drops in, the push
// a marble riding a lifting lid gets (u/s along the course, up) and how long after it can't be eaten
export const DOOR_A = 70 * Math.PI / 180;
const DOOR_H = 1.4, LID_KICK = [3, 1.5], LID_GRACE = 0.4;
const DROP_H = 1.2; // an eaten marble sinks this far through its hole before it heads on under the floor to the side track
const DOOR_V = 11; // u/s, at least, it comes out of the cave mouth at (it fell) and is flicked back in at: the side track costs about the same at any speed in
const FORK_V = 18; // u/s a fork's paddle flicks a LONG marble onto its lane at (a spring, not a nudge)
// a narrow helix's coils: s from the comb to the mouth in the chamber, whatever the marble came in at (the middle tube
// takes about 0.75 s, so a coil costs about 2 s: the long way round is a time)
const COIL_T = 2.8;
export const WAITING = 0, RACING = 1, WARP = 2, DONE = 3, TRAP = 4, COIL = 5;

export const flapAngle = t => Math.PI / 2 * Math.min(1, Math.max(0, t / FLAP_T)) ** 2 * (3 - 2 * Math.min(1, Math.max(0, t / FLAP_T)));
export const ringAngle = (ring, t) => ring.omega * t; // radians of φ (positions at angle φ move to φ + this)
// a trapdoor lid's clock (s into its cycle) and its angle, from sim time only, so the view and the sim agree:
// lifting for door.lift, open for door.open (it eats), then shut (blinking red over the last door.warn)
export const doorClock = (door, lid, t) => (t + lid.phase) % door.period;
export const doorAngle = (door, lid, t) => { const c = doorClock(door, lid, t); return c < door.lift ? DOOR_A * c / door.lift : c < door.lift + door.open ? DOOR_A : 0; };
// a fork's signal at sim time t: 0 EXPRESS, 1 MAIN, 2 LONG
export const forkWay = (f, t) => { const w = ((t + f.phase) % f.period) / f.period; return w < f.split[0] ? 0 : w < f.split[0] + f.split[1] ? 1 : 2; };

// quaternion helpers ([x, y, z, w])
const qYaw = b => [0, Math.sin(b / 2), 0, Math.cos(b / 2)];
const qYawX = (b, a) => { const sy = Math.sin(b / 2), cy = Math.cos(b / 2), sx = Math.sin(a / 2), cx = Math.cos(a / 2); return [cy * sx, cx * sy, -sy * sx, cy * cx]; };
const qUp = ([x, y, z]) => { const w = 1 + y, l = Math.hypot(z, x, w) || 1; return w < 1e-6 ? [1, 0, 0, 0] : [z / l, 0, -x / l, w / l]; }; // y axis -> v
const V = (x, y, z) => ({ x, y, z });
const Q = ([x, y, z, w]) => ({ x, y, z, w });

// the course centre line (x y z s per point): the segment at progress s, and the point and heading there. Pure, so the
// view's flyover reads it before the race without building a physics world
export function centreLine(line) {
  const NL = line.length / 4, L = j => j * 4;
  const segAt = s => { let lo = 0, hi = NL - 2; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (line[L(m) + 3] <= s) lo = m; else hi = m - 1; } return lo; };
  const pointAt = (s, out) => {
    const j = segAt(s), a = L(j), b = L(j + 1), u = Math.min(1, Math.max(0, (s - line[a + 3]) / Math.max(1e-6, line[b + 3] - line[a + 3])));
    for (let k = 0; k < 3; k++) out[k] = line[a + k] + (line[b + k] - line[a + k]) * u;
    const dx = line[b] - line[a], dy = line[b + 1] - line[a + 1], dz = line[b + 2] - line[a + 2], l = Math.hypot(dx, dy, dz) || 1;
    out[3] = dx / l; out[4] = dy / l; out[5] = dz / l;
    return out;
  };
  return { segAt, pointAt };
}

export function createSim(RAPIER, def, gates) {
  const n = def.n, line = def.line, NL = line.length / 4, rng = mulberry32(def.seed ^ 0x5eed);
  const world = new RAPIER.World(V(0, GRAVITY, 0));
  world.timestep = DT;
  const queue = new RAPIER.EventQueue(true);
  const MIN = RAPIER.CoefficientCombineRule.Min;
  const fixed = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
  const shape = (c, desc) => {
    if (c.kind === 'trimesh') return RAPIER.ColliderDesc.trimesh(c.verts, c.idx, c.twoSided ? 0 : RAPIER.TriMeshFlags.FIX_INTERNAL_EDGES);
    if (c.kind === 'cuboid') return RAPIER.ColliderDesc.cuboid(...c.half).setTranslation(...c.p).setRotation(Q(qYaw(c.yaw)));
    if (c.kind === 'cylinder') return RAPIER.ColliderDesc.cylinder(c.half, c.r).setTranslation(...c.p);
    return desc;
  };
  const track = d => d.setFriction(T_FRIC).setRestitution(T_REST).setRestitutionCombineRule(MIN);
  // the start wheel has spun to def.fan.spin by GO: its dividers, flaps and marbles start turned by that much
  const spin = def.fan.spin;
  for (let c of def.colliders) {
    if (c.part === 'divider') { const [x, z] = spinXZ(c.p[0], c.p[2], spin); c = { ...c, p: [x, c.p[1], z], yaw: c.yaw - spin }; }
    world.createCollider(track(shape(c)).setFriction(c.part === 'boomFloor' ? BOOM_FRIC : T_FRIC), fixed);
  }

  const pegOf = new Map();
  def.pegs.forEach((p, k) => {
    const d = RAPIER.ColliderDesc.cylinder(p.h / 2, p.r).setTranslation(...p.p).setRotation(Q(qUp(p.ax)))
      .setRestitution(p.r === BUMP_R ? BUMP_REST : PEG_REST).setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Max).setFriction(0.1).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
    pegOf.set(world.createCollider(d, fixed).handle, k);
  });
  // moguls on the finish run-in: balls sunk into the floor, only their low caps showing; plain track to roll over
  for (const m of def.moguls) world.createCollider(track(RAPIER.ColliderDesc.ball(m.r).setTranslation(...m.p)), fixed);

  // gate flaps: one kinematic body per stall, hinged on the floor, swinging in toward the mouth on GO
  const flaps = def.fan.stalls.map((s, g) => {
    const at = stallAt(def.fan, g, spin);
    const b = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(...at.hinge).setRotation(Q(qYaw(at.yaw))));
    const c = world.createCollider(RAPIER.ColliderDesc.cuboid(s.flap.hw, s.flap.h / 2, 0.05).setTranslation(0, s.flap.h / 2, 0).setFriction(T_FRIC), b);
    return { b, c, yaw: at.yaw };
  });

  // carousels: each turning ring is one kinematic body; its pose comes from sim time only
  const rings = def.rings, ringBodies = rings.map(rg => {
    const b = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(...rg.c));
    for (const c of rg.parts) world.createCollider(track(shape(c)).setFriction(0.6), b);
    return b;
  });

  // marbles: player i starts in stall gates[i]
  const marbleOf = new Map(), bodies = [];
  for (let i = 0; i < n; i++) {
    const s = def.fan.stalls[gates[i]], at = stallAt(def.fan, gates[i], spin);
    const b = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(...at.pos).setCcdEnabled(true).setCanSleep(false)
      .setLinearDamping(LIN_DAMP).setAngularDamping(ANG_DAMP).setAngvel(V(...s.spin)));
    const c = world.createCollider(RAPIER.ColliderDesc.ball(MR).setMassProperties(MASS, V(0, 0, 0), V(MOI, MOI, MOI), Q([0, 0, 0, 1])).setRestitution(M_REST).setFriction(M_FRIC), b);
    marbleOf.set(c.handle, i);
    bodies.push(b);
  }

  // ---------- state (typed arrays, read by the view without copying) ----------
  const xf = new Float32Array(n * 7), prev = new Float32Array(n * 7), vel = new Float32Array(n * 3);
  const prog = new Float32Array(n), seg = new Int32Array(n), speed = new Float32Array(n);
  const state = new Uint8Array(n).fill(RACING), place = new Int16Array(n).fill(-1), time = new Float32Array(n);
  const inMist = new Uint8Array(n), inMud = new Uint8Array(n), riding = new Uint8Array(n), // riding: carousel index + 1, 0 = none
    stuckT = new Float32Array(n), nudges = new Uint8Array(n);
  const nudgeAt = new Float32Array(n), used = new Uint32Array(n), bestProg = new Float32Array(n).fill(-1e9), bestAt = new Float32Array(n); // bit k: boost pad / jump / wormhole k already fired
  const warp = new Int8Array(n).fill(-1), warpT0 = new Float32Array(n), warpV = new Float32Array(n), warpE = new Int8Array(n).fill(-1); // warpE: a roulette's exit (-1: none)
  const hold = new Float32Array(n), hold0 = new Float32Array(n); // a whirlpool's current holds a marble until hold (0: free), since hold0
  const lidAt = new Float32Array(n).fill(-9); // when a lifting trapdoor lid last pushed it on
  // a narrow helix's coil a marble rides (-1: none), since when, how far along; when each coil last took one in
  const coil = new Int8Array(n).fill(-1), coilT0 = new Float32Array(n), coilD = new Float32Array(n), coilIn = new Float32Array(def.coils.length).fill(-9);
  // a whirlpool works like a lottery drum: each hold ends at a random moment counted from when the first marble got in,
  // not from a marble's own arrival, so the order out has next to nothing to do with the order in
  const drum = new Float32Array(def.basins.length).fill(-1);
  const trap = new Int8Array(n).fill(-1), trapPh = new Uint8Array(n), trapT0 = new Float32Array(n), trapV = new Float32Array(n), hop0 = new Float32Array(n * 3), hopX = new Float32Array(n);
  const stun = new Float32Array(n), atk = new Float32Array(n), stunAt = new Float32Array(n).fill(-99); // seconds left; when last stunned
  const rideAt = new Float32Array(n); // when the current carousel ride began
  const inBasin = new Int8Array(n).fill(-1), basinAt0 = new Float32Array(n); // the bowl a marble is swirling in (-1: none), since when
  const boomK = new Int8Array(n).fill(-1), boomN = new Uint8Array(n), boomOn = new Uint8Array(n); // boomerang: which one, climbs up its wall, up it now
  const swingAt = new Float32Array(n).fill(-1); // when a marble's spell in a boomerang began (-1: not in one)
  const gust = new Float32Array(n), hooped = new Uint8Array(n); // its gust in the mist (u/s²); bit k: jump k's hoop plane crossed
  const touch = new Set(), events = [];
  let t = 0, finished = 0, rescues = 0, flapsOff = false;
  const cap = CAP * TIER_TIME[def.tier];

  const read = i => {
    const b = bodies[i], p = b.translation(), q = b.rotation(), v = b.linvel(), o = i * 7;
    xf[o] = p.x; xf[o + 1] = p.y; xf[o + 2] = p.z; xf[o + 3] = q.x; xf[o + 4] = q.y; xf[o + 5] = q.z; xf[o + 6] = q.w;
    vel[i * 3] = v.x; vel[i * 3 + 1] = v.y; vel[i * 3 + 2] = v.z;
  };
  for (let i = 0; i < n; i++) read(i);
  prev.set(xf);

  // ---------- centre line ----------
  const L = j => j * 4;
  // nearest point within a window round the marble's last segment: O(1) per marble per step
  const project = (i, lo = -2, hi = 6) => {
    const o = i * 7, x = xf[o], y = xf[o + 1], z = xf[o + 2];
    let best = Infinity, bj = seg[i], bt = 0;
    for (let j = Math.max(0, seg[i] + lo); j < Math.min(NL - 1, seg[i] + hi); j++) {
      const a = L(j), b = L(j + 1), dx = line[b] - line[a], dy = line[b + 1] - line[a + 1], dz = line[b + 2] - line[a + 2];
      const len2 = dx * dx + dy * dy + dz * dz || 1e-9;
      const u = Math.min(1, Math.max(0, ((x - line[a]) * dx + (y - line[a + 1]) * dy + (z - line[a + 2]) * dz) / len2));
      const ex = line[a] + dx * u - x, ey = line[a + 1] + dy * u - y, ez = line[a + 2] + dz * u - z, d2 = ex * ex + ey * ey + ez * ez;
      if (d2 < best) { best = d2; bj = j; bt = u; }
    }
    seg[i] = bj;
    prog[i] = line[L(bj) + 3] + (line[L(bj + 1) + 3] - line[L(bj) + 3]) * bt;
    return Math.sqrt(best);
  };
  // boomerang troughs: the frame, and the progress at the line's two points along the floor's middle
  const troughs = def.boomerangs.map(bm => ({ bm, g: boomGeo(bm), s0: line[L(bm.i0) + 3], s1: line[L(bm.i0 + 1) + 3] }));
  // [u, v] in trough tr for the marble at xf[o], or null if it isn't in it (the drop and the run out are not)
  const across = (tr, o) => {
    const { bm, g } = tr, dx = xf[o] - bm.E[0], dz = xf[o + 2] - bm.E[2], u = dx * bm.f[0] + dz * bm.f[1], v = dx * bm.inw[0] + dz * bm.inw[1];
    if (v < -bm.hw || v > bm.vEnd || xf[o + 1] < bm.y0 - bm.dz * bm.tn - 2 || xf[o + 1] > bm.y0 + bm.top + 2) return null;
    const [a, b] = g.feet(v);
    return u > (g.w(v) ? a - bm.rn : a) && u < b + bm.rq + 0.5 ? [u, v] : null;
  };
  const { segAt, pointAt } = centreLine(line);
  // respawn points: centre line points on the swept course (not mid-air over the carousel or a jump gap)
  const onRide = j => rings.some(rg => j >= rg.line[0] && j <= rg.line[1] + 1);
  const safe = s => { let j = segAt(s); while (j > 0 && onRide(j)) j--; return line[L(j) + 3]; };
  const tmp = new Float32Array(6);
  // marble at xf[o] in bowl bw: over its drain's rim and under the curl's crest, inside the wall; across the chute's way
  // in only below the chute's floor (a marble still on the chute isn't in)
  const inBowl = (o, bw) => {
    const dx = xf[o] - bw.c[0], dz = xf[o + 2] - bw.c[2], y = xf[o + 1] - bw.c[1];
    if (y < -0.5 || y > bw.top + 0.3 || dx * dx + dz * dz > bw.rB * bw.rB) return false;
    if (!bw.open || y < bw.rim + 0.5) return true;
    const a = Math.atan2(dz, dx) - bw.open[0], w = Math.atan2(Math.sin(a), Math.cos(a));
    return w < 0 || w > bw.open[1] - bw.open[0];
  };
  const place1 = (i, s, v) => { // put marble i on the centre line at s, rolling forward at v
    pointAt(s, tmp);
    const b = bodies[i];
    b.setTranslation(V(tmp[0], tmp[1] + MR + 0.15, tmp[2]), true);
    b.setLinvel(V(tmp[3] * v, tmp[4] * v, tmp[5] * v), true);
    b.setAngvel(V(0, 0, 0), true);
    seg[i] = segAt(s); prog[i] = s; stuckT[i] = 0;
    read(i);
  };
  const ev = (type, i, data, j) => {
    const o = i * 7;
    events.push({ t, type, i, j, pos: [xf[o], xf[o + 1], xf[o + 2]], data });
  };

  // ---------- one step ----------
  function step() {
    events.length = 0;
    prev.set(xf);
    const tn = t + DT;
    if (!flapsOff) {
      const a = flapAngle(tn);
      for (const f of flaps) f.b.setNextKinematicRotation(Q(qYawX(f.yaw, -a)));
      if (t > FLAP_T + 0.15) { for (const f of flaps) f.c.setEnabled(false); flapsOff = true; } // lying flat: out of the way
    }
    ringBodies.forEach((b, k) => b.setNextKinematicRotation(Q(qYaw(-ringAngle(rings[k], tn)))));
    world.step(queue);
    t = tn;
    let lead = -Infinity; // the leader's progress, for the tailwind
    for (let i = 0; i < n; i++) if (state[i] !== DONE) lead = Math.max(lead, prog[i]);
    queue.drainCollisionEvents((h1, h2, started) => {
      if (!started) return;
      const p = pegOf.get(h1) ?? pegOf.get(h2), i = marbleOf.get(h1) ?? marbleOf.get(h2);
      if (p === undefined || i === undefined || state[i] !== RACING) return;
      // bumper flick: away from the peg across the board, and on down it (a kick back up the slope, or only across,
      // pumped a marble into bouncing round the same pegs for good); a head-on hit goes off to whichever side it's on
      const pg = def.pegs[p], b = bodies[i], q = b.translation(), v = b.linvel();
      pointAt(prog[i], tmp);
      let dx = q.x - pg.p[0], dy = q.y - pg.p[1], dz = q.z - pg.p[2];
      const a = dx * pg.ax[0] + dy * pg.ax[1] + dz * pg.ax[2], c = dx * tmp[3] + dy * tmp[4] + dz * tmp[5];
      dx -= a * pg.ax[0] + c * tmp[3]; dy -= a * pg.ax[1] + c * tmp[4]; dz -= a * pg.ax[2] + c * tmp[5];
      const K = pg.r === BUMP_R ? BUMP_KICK : PEG_KICK, k = K[0] / (Math.hypot(dx, dy, dz) || 1), f = K[1];
      b.setLinvel(V(v.x + dx * k + tmp[3] * f, v.y + dy * k + tmp[4] * f, v.z + dz * k + tmp[5] * f), true);
      ev('peg', i, { peg: p });
    });

    for (let i = 0; i < n; i++) {
      if (state[i] === DONE) continue;
      if (state[i] === WARP) { warpStep(i); continue; }
      if (state[i] === TRAP) { trapStep(i); continue; }
      if (state[i] === COIL) { coilStep(i); continue; }
      read(i);
      const o = i * 7, b = bodies[i];
      let vx = vel[i * 3], vy = vel[i * 3 + 1], vz = vel[i * 3 + 2], sp = Math.hypot(vx, vy, vz);
      if (sp > VMAX) { const k = VMAX / sp; vx *= k; vy *= k; vz *= k; sp = VMAX; b.setLinvel(V(vx, vy, vz), true); }
      speed[i] = sp;
      if (stun[i] > 0) { // frozen in place: no gravity, every push undone
        if ((stun[i] -= DT) <= 0) b.setGravityScale(1, true);
        else { b.setLinvel(V(0, 0, 0), true); b.setAngvel(V(0, 0, 0), true); vx = vy = vz = sp = speed[i] = 0; }
      }
      if (atk[i] > 0) {
        atk[i] -= DT;
        pointAt(prog[i], tmp);
        const a = ATK_ACC * DT;
        b.setLinvel(V(vx += tmp[3] * a, vy += tmp[4] * a, vz += tmp[5] * a), true);
      }
      if (stun[i] <= 0 && !riding[i] && inBasin[i] < 0) { // tailwind and slipstream (not frozen, in a carousel pocket or a bowl)
        let acc = CHASE * Math.min(1, Math.max(0, (lead - prog[i] - CHASE_G0) / CHASE_G1)) * (prog[i] > 0.75 * def.finish.s ? CHASE_LATE : 1);
        for (let j = 0; j < n; j++) { // right behind another one (not level with it on another lane)
          const q = j * 7, dp = prog[j] - prog[i];
          if (j !== i && state[j] === RACING && dp > 0.3 && dp < DRAFT_D && Math.hypot(xf[q] - xf[o], xf[q + 1] - xf[o + 1], xf[q + 2] - xf[o + 2]) < dp + 1.2) { acc += DRAFT; break; }
        }
        if (acc) {
          pointAt(prog[i], tmp);
          const a = acc * DT;
          b.setLinvel(V(vx += tmp[3] * a, vy += tmp[4] * a, vz += tmp[5] * a), true);
        }
      }
      // on the start ring only the hole's axis counts (the board runs underneath the ring's front)
      // ... and in a bowl only the drain's axis (its height in the dish)
      const bk = def.basins.findIndex(bw => inBowl(o, bw));
      if (bk >= 0) seg[i] = def.basins[bk].line[0];
      const drain = bk < 0 && def.basins.some(bw => seg[i] >= bw.line[0] && seg[i] <= bw.line[1] + 10); // down a bowl's drain: it falls down the middle, its line runs round the tube's floor
      const before = prog[i], off = bk >= 0 || seg[i] === 0 && xf[o + 1] > -0.3 ? project(i, 0, 1) : project(i, -2, drain ? 18 : 6);
      // ... and in a boomerang's trough how far across it (high on the near wall by the exit, the run out's line is nearer)
      let tk = -1, tw = null;
      for (let k = 0; k < troughs.length && tk < 0; k++) if ((tw = across(troughs[k], o))) tk = k;
      if (tk >= 0) { const tr = troughs[tk]; seg[i] = tr.bm.i0; prog[i] = tr.s0 + (tr.s1 - tr.s0) * Math.min(1, Math.max(0, tw[1] / tr.bm.vEnd)); }

      // ---- safety nets: out of bounds, then stuck ----
      if (xf[o + 1] < def.bounds[1] - 5 || off > 6 * def.W) {
        rescues++;
        ev('out', i);
        place1(i, safe(prog[i] - 1), 2);
        continue;
      }
      const rk = rings.findIndex(rg => Math.hypot(xf[o] - rg.c[0], xf[o + 2] - rg.c[2]) < rg.rWall && xf[o + 1] > rg.c[1] - 1.2 && xf[o + 1] < rg.c[1] + 2.4), ride = rk >= 0;
      if (rk + 1 !== riding[i]) {
        if (riding[i]) ev('rideOut', i, { ring: riding[i] - 1 });
        if (ride) ev('rideIn', i, { ring: rk });
        riding[i] = rk + 1; rideAt[i] = t;
      }
      if (ride && t - rideAt[i] > RIDE_MAX) { rescues++; ev('rescue', i, { kind: 'teleport' }); place1(i, line[L(rings[rk].line[1] + 1) + 3] + 1, 3); continue; }
      // stuck: too slow for STUCK_T, or rocking in a dip (in front of a jump's kicker, say) without gaining ground
      if (prog[i] > bestProg[i] + 0.5) { bestProg[i] = prog[i]; bestAt[i] = t; }
      if (bk !== inBasin[i]) {
        if (inBasin[i] >= 0) ev('basinOut', i, { basin: inBasin[i], drain: xf[o + 1] < def.basins[inBasin[i]].c[1] }); // drain: down the hole (not a bounce off the top)
        if (bk >= 0) { // again: back down after bouncing off the top. A whirlpool's current takes a fresh marble for its own hold
          const again = t - basinAt0[i] < 1.5, wh = def.basins[bk].whirl;
          if (!again) { basinAt0[i] = t; if (wh) { if (drum[bk] < 0) drum[bk] = t; hold0[i] = t; hold[i] = Math.max(t + wh.hold[0], drum[bk] + wh.hold[0] + (wh.hold[1] - wh.hold[0]) * rng()); } }
          ev('basinIn', i, { basin: bk, again, whirl: !!wh });
        }
        inBasin[i] = bk;
        b.setLinearDamping(bk >= 0 ? BASIN_DAMP : LIN_DAMP); b.setAngularDamping(bk >= 0 ? BASIN_DAMP : ANG_DAMP);
      }
      if (bk >= 0 && t - basinAt0[i] > (def.basins[bk].whirl ? def.basins[bk].whirl.hold[1] + WHIRL_MAX : BASIN_MAX)) { rescues++; basinAt0[i] = t; ev('rescue', i, { kind: 'teleport' }); place1(i, line[L(def.basins[bk].line[1] + 1) + 3] + 0.8, 3); continue; } // down the tube
      if (hold[i] && t >= hold[i]) { hold[i] = 0; ev('letGo', i, { basin: inBasin[i] }); } // its current lets go
      const wh = bk >= 0 && def.basins[bk].whirl;
      if (wh) { // held: carried round the wall toward the current's speed and pushed out against it, clear of the drain;
        // let go: drawn in toward the drain, so the big dish empties about as quickly as a plain bowl
        const dx = xf[o] - def.basins[bk].c[0], dz = xf[o + 2] - def.basins[bk].c[2], r = Math.hypot(dx, dz) || 1;
        const ox = dx / r, oz = dz / r, tx = wh.dir * oz, tz = -wh.dir * ox; // out; round (dir x (up x out))
        const v = b.linvel(), vt = v.x * tx + v.z * tz, a = (hold[i] ? wh.spin * (1 - vt / wh.vCur) : -wh.drag * vt) * DT, w = (hold[i] ? wh.out : -wh.pull) * DT;
        b.setLinvel(V(v.x + tx * a + ox * w, v.y, v.z + tz * a + oz * w), true);
      }
      // swinging in a boomerang's trough, or back up its drop, gains no progress either
      const bz = tk >= 0 ? tk : def.boomerangs.findIndex(bm => prog[i] > bm.sIn - 6 && prog[i] < bm.sIn);
      if (bz < 0) swingAt[i] = -1; else if (swingAt[i] < 0) swingAt[i] = t;
      if (bz >= 0 && t - swingAt[i] > SWING_MAX) { rescues++; swingAt[i] = -1; ev('rescue', i, { kind: 'teleport' }); place1(i, def.boomerangs[bz].sOut + 1, 3); continue; }
      if (ride || bk >= 0 || bz >= 0 && sp > 1) bestAt[i] = t; // a lap on the carousel or round a bowl gains no progress but is no stall
      const stalled = !ride && t - bestAt[i] > STALL_T && t > 3;
      if ((sp < STUCK_V && !ride && stun[i] <= 0) || stalled) {
        if ((stuckT[i] += DT) > STUCK_T || stalled) {
          stuckT[i] = 0; rescues++; bestAt[i] = t;
          if (prog[i] - nudgeAt[i] > 2) nudges[i] = 0; // got going since the last nudge: start counting again
          nudgeAt[i] = prog[i];
          if (++nudges[i] > NUDGES) { nudges[i] = 0; ev('rescue', i, { kind: 'teleport' }); place1(i, prog[i] + 3 * R, 3); continue; }
          pointAt(prog[i], tmp);
          const kick = 2 + rng() * 2, side = (rng() - 0.5);
          b.setLinvel(V(tmp[3] * kick + tmp[5] * side, tmp[4] * kick + 0.5, tmp[5] * kick - tmp[3] * side), true);
          ev('rescue', i, { kind: 'nudge' });
        }
      } else stuckT[i] = 0;

      // ---- course sensors ----
      def.boosts.forEach((p, k) => {
        if (prog[i] >= p.s0 && prog[i] <= p.s1 && !(used[i] & (1 << k))) {
          used[i] |= 1 << k;
          pointAt(prog[i], tmp);
          const nv = Math.min(VMAX, sp + (p.v ?? BOOST)) - sp; // p.v: a pad's own push (a boomerang's is gentler)
          b.setLinvel(V(vx + tmp[3] * nv, vy + tmp[4] * nv, vz + tmp[5] * nv), true);
          ev('boost', i);
        }
      });
      def.jumps.forEach((jp, k) => {
        if (before < jp.s && prog[i] >= jp.s && !(used[i] & (1 << (8 + k)))) { used[i] |= 1 << (8 + k); ev('jump', i); }
        // the hoop: crossing its plane (once), centre inside its ring: a boost along the jump
        const hp = jp.hoop, d = (x, y, z) => (x - hp.p[0]) * hp.n[0] + (y - hp.p[1]) * hp.n[1] + (z - hp.p[2]) * hp.n[2];
        if (!hp || hooped[i] & (1 << k) || Math.abs(prog[i] - jp.s) > 3 || d(prev[o], prev[o + 1], prev[o + 2]) >= 0 || d(xf[o], xf[o + 1], xf[o + 2]) < 0) return;
        hooped[i] |= 1 << k;
        if (Math.hypot(xf[o] - hp.p[0], xf[o + 1] - hp.p[1], xf[o + 2] - hp.p[2]) > hp.r - 0.1) return;
        const v = b.linvel();
        b.setLinvel(V(v.x + hp.n[0] * HOOP_V, v.y, v.z + hp.n[2] * HOOP_V), true);
        ev('hoop', i, { jump: k });
      });
      if (tk >= 0) { // each climb up one of a boomerang's walls is a swing (n: which one)
        const { bm, g } = troughs[tk], [a, c] = g.feet(tw[1]), far = tw[0] - c, near = a - tw[0]; // past each wall's foot
        const side = far > bm.rq * 0.4 ? 1 : near > bm.rn * 0.4 ? 2 : far < 0 && near < 0 ? 0 : boomOn[i];
        if (boomK[i] !== tk) { boomK[i] = tk; boomN[i] = boomOn[i] = 0; }
        if (side && side !== boomOn[i]) ev('boomUp', i, { boom: tk, n: ++boomN[i], far: side === 1 });
        boomOn[i] = side;
      }
      // mud: centre over a patch (an ellipse in course length x across) and down on the floor: heavy damping
      let mud = 0;
      for (const md of def.muds) if (prog[i] > md.s0 && prog[i] < md.s1 && onMud(o, md)) { mud = 1; break; }
      if (mud !== inMud[i]) {
        inMud[i] = mud;
        b.setLinearDamping(mud ? MUD_DAMP : LIN_DAMP); b.setAngularDamping(mud ? MUD_DAMP : ANG_DAMP);
        if (mud) ev('mudIn', i);
      }
      if (def.mist) {
        const m = prog[i] >= def.mist.s0 && prog[i] < def.mist.s1;
        if (m !== !!inMist[i]) {
          inMist[i] = m ? 1 : 0;
          if (m) gust[i] = GUST[0] + (GUST[1] - GUST[0]) * rng();
          ev(m ? 'mistIn' : 'mistOut', i, m ? undefined : { gust: gust[i] }); // gust: + a tailwind, - a headwind
        }
        if (m) { // unseen in the frost: its gust pushes it on or holds it back
          pointAt(prog[i], tmp);
          const v = b.linvel(), a = gust[i] * DT;
          b.setLinvel(V(v.x + tmp[3] * a, v.y + tmp[4] * a, v.z + tmp[5] * a), true);
        }
      }
      def.wormholes.forEach((w, k) => {
        const rl = w.roulette;
        if (state[i] !== RACING || used[i] & (1 << (16 + k)) || Math.abs(prog[i] - w.a.s) > (rl ? w.a.r : 2)) return;
        if (over(o, w.a, rl ? 1.5 : MR + 0.2)) { // rolling right over the middle of the hole (a roulette's: anywhere, even hopping): drops in
          used[i] |= 1 << (16 + k);
          state[i] = WARP; warp[i] = k; warpT0[i] = t; warpV[i] = rl ? ROU_V : Math.max(4, sp);
          // a roulette: the wheel's sector under the marble's spot round the mouth as it drops picks its exit
          warpE[i] = rl ? sectorOf(rl, Math.atan2(dot3(o, w.a.p, rl.e2), dot3(o, w.a.p, rl.e1)) + rl.omega * t) : -1;
          calm(i);
          b.setEnabled(false);
          ev('warpIn', i, { hole: k, exit: rl?.exits[warpE[i]].kind });
        }
      });
      def.traps.forEach((tp, k) => {
        if (state[i] !== RACING || used[i] & (1 << (24 + k))) return;
        if (tp.fork) { // crossing the paddle anywhere across: the signal at that moment picks the way
          if (before >= tp.a.s || prog[i] < tp.a.s) return;
          used[i] |= 1 << (24 + k);
          const way = forkWay(tp.fork, t);
          if (way !== 1) { calm(i); flick(i, k, way ? 0 : 3, way ? Math.max(sp, FORK_V) : sp); } // LONG: onto the lane; EXPRESS: up the glass tube
          ev('fork', i, { trap: k, way });
          return;
        }
        if (tp.door) { door(i, k, tp.door, sp); return; }
        if (Math.abs(prog[i] - tp.a.s) > 2 || !over(o, tp.a)) return;
        used[i] |= 1 << (24 + k);
        calm(i);
        flick(i, k, 0, sp * 0.8);
        ev('trapIn', i, { trap: k });
      });
      // a narrow helix's comb: the outer third either side is a coil's mouth, the air takes a marble there (one at a time:
      // it waits until the one before it is a marble clear in); the middle window is the tube, SHORTCUT!
      def.coils.forEach((c, k) => {
        if (state[i] !== RACING || prog[i] < c.in.s - 0.7 || prog[i] > c.in.s + 0.3) return;
        pointAt(prog[i], tmp);
        const lat = ((xf[o + 2] - tmp[2]) * tmp[3] - (xf[o] - tmp[0]) * tmp[5]) / (Math.hypot(tmp[3], tmp[5]) || 1);
        if (lat * c.side < COMB) { if (c.side > 0 && Math.abs(lat) < COMB && before < c.in.s && prog[i] >= c.in.s) ev('tubeIn', i, { mod: c.mod }); return; }
        if (t - coilIn[k] < (2 * MR + 0.1) * COIL_T / c.len) return;
        coilIn[k] = t;
        calm(i);
        state[i] = COIL; coil[i] = k; coilT0[i] = t; coilD[i] = 0;
        hop0[i * 3] = xf[o]; hop0[i * 3 + 1] = xf[o + 1]; hop0[i * 3 + 2] = xf[o + 2];
        b.setEnabled(false);
        ev('coilIn', i, { coil: k });
      });
      if (prog[i] >= def.finish.s) cross(i, before);
    }
    bumps();
    if (t >= cap && finished < n) timeUp();
    return events;
  }

  // a wormhole, a trap or the finish ends a stun and a buff
  function calm(i) { if (stun[i] > 0) bodies[i].setGravityScale(1, true); stun[i] = atk[i] = 0; }

  // marble at xf[o] over mud patch md: across from the centre line's horizontal right (straights don't bank)
  function onMud(o, md) {
    const i = o / 7;
    pointAt(prog[i], tmp);
    const dx = xf[o] - tmp[0], dz = xf[o + 2] - tmp[2], lat = (dz * tmp[3] - dx * tmp[5]) / (Math.hypot(tmp[3], tmp[5]) || 1);
    const u = (prog[i] - md.s) / (md.s1 - md.s0) * 2, v = (lat - md.c) / md.a;
    return xf[o + 1] - tmp[1] < MR + 0.3 && u * u + v * v < 1;
  }

  // marble at xf[o] rolling right over the middle of a floor mouth m ({ p, u, r }: a wormhole's hole A, a trap pad), its
  // centre under hi over the floor
  function over(o, m, hi = MR + 0.2) {
    const dx = xf[o] - m.p[0], dy = xf[o + 1] - m.p[1], dz = xf[o + 2] - m.p[2];
    const up = dx * m.u[0] + dy * m.u[1] + dz * m.u[2], flat = Math.sqrt(Math.max(0, dx * dx + dy * dy + dz * dz - up * up));
    return up < hi && flat < m.r * 0.7;
  }
  const dot3 = (o, p, e) => (xf[o] - p[0]) * e[0] + (xf[o + 1] - p[1]) * e[1] + (xf[o + 2] - p[2]) * e[2];

  // trapdoor k: a marble low over one of its holes (a lid's length along, between mid and edge across on the lid's half,
  // each lid on its own clock; no two lids share a stretch of the course). While the lid lifts the marble sits on it and is tipped on over the hinge with a push; once it's open the
  // marble drops through (onto the side track, the long way round); shut, nothing
  function door(i, k, dr, sp) {
    const o = i * 7, lid = dr.lids.find(l => Math.abs(prog[i] - l.s) < dr.len / 2);
    if (!lid || t - lidAt[i] < LID_GRACE) return;
    pointAt(prog[i], tmp);
    const dx = xf[o] - tmp[0], dz = xf[o + 2] - tmp[2], lat = (dz * tmp[3] - dx * tmp[5]) / (Math.hypot(tmp[3], tmp[5]) || 1), al = Math.abs(lat);
    if (al < dr.mid || al > dr.hw - dr.edge || (lat < 0 ? 0 : 1) !== lid.half || xf[o + 1] - tmp[1] > DOOR_H) return;
    const c = doorClock(dr, lid, t), b = bodies[i];
    if (c < dr.lift) { // riding the lid
      lidAt[i] = t;
      const v = b.linvel(), [f, up] = LID_KICK;
      b.setLinvel(V(v.x + tmp[3] * f, v.y + tmp[4] * f + up, v.z + tmp[5] * f), true);
      ev('boost', i, { lid: true });
    } else if (c < dr.lift + dr.open) { // eaten
      used[i] |= 1 << (24 + k);
      calm(i);
      flick(i, k, 0, Math.max(sp, DOOR_V));
      ev('trapIn', i, { trap: k, door: true });
    }
  }

  // trap route k: a hop over the wall onto its lane (phase 0; a trapdoor's: a drop through the floor), the long way round
  // on it (1), a hop back in at B (2); a fork's EXPRESS: the glass tube over the turn to B (3)
  function flick(i, k, ph, v) {
    const o = i * 7;
    state[i] = TRAP; trap[i] = k; trapPh[i] = ph; trapT0[i] = t; trapV[i] = Math.min(VMAX, Math.max(4, v));
    hop0[i * 3] = xf[o]; hop0[i * 3 + 1] = xf[o + 1]; hop0[i * 3 + 2] = xf[o + 2];
    // back in anywhere across B: dead centre, every one of them would roll the same line onto the same peg and balance there
    hopX[i] = ph ? (rng() * 2 - 1) * (def.W / 2 - MR - 0.3) : 0;
    bodies[i].setEnabled(false);
  }
  // how long marble i's hop takes (phase 0, 2 or 3)
  const hopT = i => { const tp = def.traps[trap[i]]; return trapPh[i] === 3 ? tp.fork.express.time : tp.door ? DOOR_HOP : !trapPh[i] && tp.fork ? QUICK_T : HOP_T; };
  function trapStep(i) {
    const tp = def.traps[trap[i]], o = i * 7, b = bodies[i], ph = trapPh[i];
    if (ph !== 1) { // a hop: from where it left to the far floor along an arc (a trapdoor's: down its hole, on under the floor)
      const to = ph ? tp.b : tp.in, ex = ph === 3 && tp.fork.express, u = (t - trapT0[i]) / hopT(i), x = hopX[i];
      prog[i] = ph === 0 ? tp.a.s : ph === 2 ? tp.b.s : tp.a.s + (tp.b.s - tp.a.s) * Math.min(1, u);
      if (u < 1) {
        if (ex) { expressAt(ex, u, hop0.subarray(i * 3, i * 3 + 3), tmp); xf[o] = tmp[0]; xf[o + 1] = tmp[1]; xf[o + 2] = tmp[2]; return; }
        const sink = tp.door && !ph ? Math.min(1, u / 0.3) : 0, v = tp.door && !ph ? Math.max(0, (u - 0.3) / 0.7) : u;
        for (let k = 0; k < 3; k++) xf[o + k] = hop0[i * 3 + k] + (to.p[k] + to.r[k] * x + to.u[k] * MR - hop0[i * 3 + k]) * v;
        xf[o + 1] += tp.door && !ph ? -DROP_H * sink * (1 - v) : Math.sin(Math.PI * u) * HOP_H;
        return;
      }
      const v = trapV[i], d = to.t, at = k => to.p[k] + to.r[k] * x + to.u[k] * (MR + 0.02);
      b.setEnabled(true);
      b.setTranslation(V(at(0), at(1), at(2)), true);
      b.setLinvel(V(d[0] * v, d[1] * v, d[2] * v), true);
      b.setAngvel(V(0, 0, 0), true);
      read(i);
      if (!ph) { trapPh[i] = 1; trapT0[i] = t; return; }
      state[i] = RACING; seg[i] = segAt(tp.b.s); bestProg[i] = prog[i]; bestAt[i] = t; stuckT[i] = 0;
      ev('trapOut', i, { trap: trap[i], express: ph === 3 });
      trap[i] = -1;
      return;
    }
    // on the lane: its progress (nearest of its ~150 line points) stands in for the course's between A and B
    read(i);
    let sp = Math.hypot(vel[i * 3], vel[i * 3 + 1], vel[i * 3 + 2]);
    if (sp > VMAX) { const k = VMAX / sp; b.setLinvel(V(vel[i * 3] * k, vel[i * 3 + 1] * k, vel[i * 3 + 2] * k), true); sp = VMAX; }
    speed[i] = sp;
    const ln = tp.line;
    let best = Infinity, s = tp.s0;
    for (let j = 0; j < ln.length; j += 4) {
      const d2 = (ln[j] - xf[o]) ** 2 + (ln[j + 1] - xf[o + 1]) ** 2 + (ln[j + 2] - xf[o + 2]) ** 2;
      if (d2 < best) { best = d2; s = ln[j + 3]; }
    }
    prog[i] = tp.a.s + (tp.b.s - tp.a.s) * (s - tp.s0) / (tp.s1 - tp.s0);
    if (s >= tp.s1 - 1.2 || t - trapT0[i] > 12) flick(i, trap[i], 2, tp.door ? Math.max(sp, DOOR_V) : sp); // at the lane's end (a net: 12 s on it)
  }

  // riding a narrow helix's coil: carried along its line at a steady speed (sucked from where it was onto the line over the
  // first 0.15 s), a marble behind the one ahead in it, rolling as it goes; its progress stands in for the middle tube's.
  // At the mouth it's let out into the chamber, unless another marble still sits there: then it waits
  function coilStep(i) {
    const c = def.coils[coil[i]], o = i * 7, v = c.len / COIL_T, ln = c.line;
    let d = Math.min(c.len, (t - coilT0[i]) * v);
    for (let j = 0; j < n; j++) if (j !== i && coil[j] === coil[i] && coilT0[j] < coilT0[i]) d = Math.min(d, coilD[j] - 2 * MR - 0.05);
    const dd = Math.max(0, d - coilD[i]);
    d = coilD[i] += dd;
    let lo = 0, hi = ln.length / 4 - 2;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (ln[m * 4 + 3] <= d) lo = m; else hi = m - 1; }
    const a = lo * 4, q = Math.min(1, (d - ln[a + 3]) / Math.max(1e-6, ln[a + 7] - ln[a + 3])), f = Math.min(1, (t - coilT0[i]) / 0.15), w = f * f * (3 - 2 * f);
    for (let k = 0; k < 3; k++) xf[o + k] = hop0[i * 3 + k] + (ln[a + k] + (ln[a + 4 + k] - ln[a + k]) * q - hop0[i * 3 + k]) * w;
    // roll: turn the shell by dd / MR about up x the way it's going (the view's band shows it)
    const dx = ln[a + 4] - ln[a], dz = ln[a + 6] - ln[a + 2], l = Math.hypot(dx, dz);
    if (dd > 0 && l > 1e-6) {
      const h = dd / MR / 2, sn = Math.sin(h), ax = dz / l * sn, az = -dx / l * sn, aw = Math.cos(h);
      const [x, y, z, ww] = [xf[o + 3], xf[o + 4], xf[o + 5], xf[o + 6]];
      xf[o + 3] = aw * x + ax * ww - az * y; xf[o + 4] = aw * y + az * x - ax * z; xf[o + 5] = aw * z + az * ww + ax * y; xf[o + 6] = aw * ww - ax * x - az * z;
    }
    prog[i] = c.in.s + (c.out.s - c.in.s) * d / c.len;
    speed[i] = dd / DT;
    if (d < c.len) return;
    for (let j = 0; j < n; j++) if (state[j] === RACING && Math.hypot(xf[j * 7] - c.out.p[0], xf[j * 7 + 1] - c.out.p[1], xf[j * 7 + 2] - c.out.p[2]) < 2 * MR + 0.05) return;
    const b = bodies[i], { p, t: e } = c.out;
    b.setEnabled(true);
    b.setTranslation(V(...p), true);
    b.setRotation(Q([xf[o + 3], xf[o + 4], xf[o + 5], xf[o + 6]]), true);
    b.setLinvel(V(e[0] * v, e[1] * v, e[2] * v), true);
    b.setAngvel(V(0, 0, 0), true);
    read(i);
    state[i] = RACING; seg[i] = segAt(c.out.s); prog[i] = c.out.s; bestProg[i] = prog[i]; bestAt[i] = t; stuckT[i] = 0;
    ev('coilOut', i, { coil: coil[i] });
    coil[i] = -1;
  }

  // a warp's exit: the wormhole itself, or a roulette's exit e
  const exitOf = (w, e) => e < 0 ? w : w.roulette.exits[e];
  function warpStep(i) {
    const w = def.wormholes[warp[i]], x = exitOf(w, warpE[i]), u = (t - warpT0[i]) / x.time, o = i * 7;
    if (u < 1) { warpAt(w, u, tmp, warpE[i]); xf[o] = tmp[0]; xf[o + 1] = tmp[1]; xf[o + 2] = tmp[2]; return; }
    const b = bodies[i], v = Math.min(VMAX, warpV[i]);
    state[i] = RACING;
    b.setEnabled(true);
    const { p, t: d, u: up } = x.b;
    b.setTranslation(V(p[0] + up[0] * (MR + 0.02), p[1] + up[1] * (MR + 0.02), p[2] + up[2] * (MR + 0.02)), true);
    b.setLinvel(V(d[0] * v + up[0] * POP, d[1] * v + up[1] * POP, d[2] * v + up[2] * POP), true);
    seg[i] = segAt(x.b.s); prog[i] = x.b.s;
    if (x.kind === 'jackpot') stunAt[i] = t - STUN_CD + JACK_CALM;
    read(i);
    ev('warpOut', i, { hole: warp[i], exit: x.kind });
    warp[i] = -1; warpE[i] = -1;
  }

  function cross(i, before) {
    const f = def.finish.s, k = prog[i] > before ? (f - before) / (prog[i] - before) : 1;
    time[i] = t - DT + DT * Math.min(1, Math.max(0, k));
    place[i] = finished++;
    state[i] = DONE; calm(i);
    bodies[i].setEnabled(false);
    ev('finish', i, { place: place[i], time: time[i] });
  }

  // time cap: whoever is still out there is ranked by progress
  function timeUp() {
    const left = [...Array(n).keys()].filter(i => state[i] !== DONE).sort((a, b) => prog[b] - prog[a]);
    for (const i of left) {
      time[i] = cap; place[i] = finished++; state[i] = DONE; calm(i);
      bodies[i].setEnabled(false);
      ev('finish', i, { place: place[i], time: null, capped: true });
    }
  }

  // marble on marble: a clack when two close fast; a pair re-arms only once it has separated. A real knock with one
  // clearly behind the other stuns the front one and buffs the one behind (neither if the front one is already
  // stunned or buffed, or the one behind is dizzy itself, so a pair can't ping-pong)
  function bumps() {
    for (let i = 0; i < n; i++) {
      if (state[i] !== RACING) continue;
      for (let j = i + 1; j < n; j++) {
        if (state[j] !== RACING) continue;
        const a = i * 7, b = j * 7, dx = xf[b] - xf[a], dy = xf[b + 1] - xf[a + 1], dz = xf[b + 2] - xf[a + 2], d = Math.hypot(dx, dy, dz);
        const key = i * 64 + j;
        if (d > 2.6 * MR) { touch.delete(key); continue; }
        if (d > 2 * MR + 0.06 || touch.has(key)) continue;
        // closing speed before this step's contact, from the previous positions
        const pa = prev, cv = ((pa[b] - pa[a] - dx) * dx + (pa[b + 1] - pa[a + 1] - dy) * dy + (pa[b + 2] - pa[a + 2] - dz) * dz) / (d * DT || 1);
        const rel = Math.hypot(vel[j * 3] - vel[i * 3], vel[j * 3 + 1] - vel[i * 3 + 1], vel[j * 3 + 2] - vel[i * 3 + 2]);
        touch.add(key);
        const v = Math.max(cv, rel);
        if (v > BUMP_V) ev('bump', i, { v }, j);
        const [f, k] = prog[i] >= prog[j] ? [i, j] : [j, i];
        if (v > STUN_V && prog[f] - prog[k] > R / 2 && !riding[f] && !riding[k] && stun[f] <= 0 && atk[f] <= 0 && stun[k] <= 0 && t - stunAt[f] > STUN_CD
          && !NO_STUN.has(def.mods.find(m => prog[f] >= m.s0 && prog[f] <= m.s1)?.type)) {
          stunAt[f] = t;
          stun[f] = STUN_T;
          bodies[f].setGravityScale(0, true); bodies[f].setLinvel(V(0, 0, 0), true); bodies[f].setAngvel(V(0, 0, 0), true);
          atk[k] = ATK_T;
          ev('stun', f, { v }, k);
        }
      }
    }
  }

  return {
    n, def, xf, prev, prog, speed, state, place, time, inMist, inMud, riding, warp, warpE, cap, stun, atk, // stun / atk: seconds left
    hold, hold0, trap, trapPh, // a whirlpool's hold on each marble (until, since); the trap route a marble is on, and its phase
    coil, // the narrow helix coil a marble rides (-1: none)
    get t() { return t; }, get finished() { return finished; }, get rescues() { return rescues; }, get done() { return finished >= n; },
    step, segAt, pointAt,
    warpU: i => warp[i] >= 0 ? (t - warpT0[i]) / exitOf(def.wormholes[warp[i]], warpE[i]).time : -1,
    trapU: i => trap[i] >= 0 && trapPh[i] !== 1 ? (t - trapT0[i]) / hopT(i) : -1, // how far through a hop
    // floor straight below marble i (blob shadows): distance from its centre, or -1; the view's only world query
    floorBelow: i => { const o = i * 7, hit = world.castRay(new RAPIER.Ray(V(xf[o], xf[o + 1], xf[o + 2]), V(0, -1, 0)), 6, true, undefined, undefined, undefined, bodies[i]); return hit ? hit.timeOfImpact : -1; },
    dispose: () => { world.free(); queue.free(); },
  };
}
