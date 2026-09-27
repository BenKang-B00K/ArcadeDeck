import * as THREE from 'three';
import { toon, box, cyl, part, cached, CYAN } from './toon.js';

// one level = one area look + one landmark. Data only; scene code builds any of them.
export const LEVELS = [
  { ground: 0x3b2c1e, landmark: 'tower',      floors: 5,  props: ['crate', 10],    cam: [7.2, 4.8, -7.2], target: [0, 2.1, 0] },
  { ground: 0x6b5330, landmark: 'pyramid',    floors: 6,  props: ['cactus', 12],   cam: [7.5, 4.5, -7.5], target: [0, 1.6, 0] },
  { ground: 0x1d3b57, landmark: 'lighthouse', floors: 8,  props: ['palm', 8],      cam: [7.5, 5.5, -7.5], target: [0, 2.6, 0] },
  { ground: 0x262a33, landmark: 'skyscraper', floors: 12, props: ['building', 14], cam: [9.5, 7.5, -9.5], target: [0, 3.8, 0] },
  { ground: 0x9aa8b8, landmark: 'bridge',     floors: 10, props: ['pine', 14],     cam: [9, 6.5, -10.5],  target: [0, 1.2, 0] },
];

const hpp = n => Math.round(40 * 1.4 ** (n - 1)); // hits per phase: ×1.4/level, paced vs power ×1.08 compounding (L10 ~8 min, L30 ~1 h, L50 ~1.4 days)

// level n (1-based): 1-5 handcrafted, 6+ procedurally generated from the level number (deterministic, unique)
export function levelSpec(n) {
  if (n <= LEVELS.length) return { ...LEVELS[n - 1], k: 1, hitsPerPhase: hpp(n) };
  return genLevel(n);
}

// ---------- procedural landmarks ----------
const rng = seed => { let s = (seed * 2654435761) >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };
const hsl = (h, s, l) => new THREE.Color().setHSL(h, s, l).getHex();
const PROPS = ['crate', 'cactus', 'palm', 'building', 'pine'];
const R = (r, [a, b]) => a + r() * (b - a);
const LIGHTS = [0xffc46b, 0x2ef2ff, 0xff5fd2, 0x9dff6a, 0xfff1c9, 0x7aa2ff, 0xffa94d]; // window glow per landmark

// archetypes: one coherent look each. Level n walks the list so neighbours never match; hue / sides / roof / sizes re-roll each visit.
// sides 4 = box (dr = depth ratio), >4 = prism. ws = window style. ledge = [kind, every n floors]. shift/twist/profile = silhouette.
const ARCH = [
  { sides: [4, 6, 8],  twist: [0.12, 0.3], ws: 'band', roof: ['spire', 'halo', 'tip'], floors: [8, 13] },                                                  // twister
  { sides: [4, 8],     profile: 'taper', ledge: ['eave', 1], ws: 'strip', roof: ['pagoda', 'spire'], hue: [0.96, 1.06], w: [1.6, 2.2], floors: [5, 8] },  // pagoda
  { sides: [4],        profile: 'step', ledge: ['slab', 2], ws: 'slit', roof: ['altar', 'tip'], hue: [0.07, 0.13], w: [2.6, 3.4], floors: [6, 9] },       // ziggurat
  { sides: [16],       pattern: 'stripe', stripe: 2, ws: 'port', roof: ['nose', 'dome'], w: [1, 1.4], floors: [8, 12] },                                    // silo / rocket
  { sides: [4],        shift: 'jenga', pattern: 'alt', ws: 'grid', roof: ['helipad', 'flat'], floors: [6, 10] },                                            // jenga stack
  { sides: [4],        dr: [0.55, 0.75], cols: 5, ws: 'none', roof: ['pediment'], F: [0.9, 1.1], w: [2.4, 3], sat: [0.05, 0.15], floors: [3, 4], base: 0.3, steps: 3 }, // temple
  { sides: [6, 8],     profile: 'bulge', glass: true, pattern: 'gradient', ws: 'band', roof: ['tip', 'crown'], floors: [8, 12] },                                               // crystal
  { sides: [8, 16],    shift: 'lean', ws: 'strip', roof: ['lamp', 'dome'], floors: [7, 10] },                                                               // leaning tower
  { sides: [4],        dr: [0.7, 1], ws: 'slit', roof: ['castle'], w: [2.2, 3], F: [0.5, 0.6], sat: [0.05, 0.15], floors: [4, 6] },                       // castle
  { sides: [8, 16],    shift: 'helix', ws: 'strip', roof: ['halo', 'antenna'], w: [1, 1.3], floors: [10, 14] },                                            // helix
  { sides: [8, 16],    profile: 'flare', ws: 'band', roof: ['dome', 'cone'], floors: [6, 9] },                                                              // water tower
  { sides: [4, 6],     ledge: ['disc', 2], ws: 'none', roof: ['dishes', 'antenna'], w: [0.6, 0.8], F: [0.5, 0.6], floors: [12, 18], base: 0.45, guys: true },                      // mast
  { sides: [4],        dr: [0.5, 0.7], w: [2.6, 3.2], F: [0.6, 0.8], ws: 'grid', roof: ['stack'], floors: [3, 5] },                                        // factory
  { sides: [8, 16],    profile: 'pinch', ws: 'strip', roof: ['flat', 'crown'], floors: [8, 12] },                                                           // hourglass
  { span: true,        roof: ['stay'], floors: [8, 14] },                                                                                                   // bridge
  { sides: [4],        profile: 'podium', pattern: 'cap', ws: 'strip', roof: ['antenna', 'helipad'], w: [2.2, 2.8], floors: [9, 14] },                     // podium skyscraper
  { sides: [16],       profile: 'needle', ws: 'band', roof: ['spire', 'halo'], w: [2, 2.6], F: [0.5, 0.6], floors: [11, 15] },                          // space needle
  { sides: [8],        profile: 'taper', ws: 'slit', win: 2, roof: ['mill'], w: [1.6, 2], F: [0.6, 0.7], sat: [0.1, 0.25], floors: [5, 7] },              // windmill
  { sides: [16],       cols: 12, ledge: ['slab', 1], ws: 'none', roof: ['dome'], F: [0.8, 1], w: [2.2, 2.8], sat: [0.05, 0.15], floors: [2, 3], base: 0.3, steps: 2, grow: 0 }, // rotunda
  { sides: [8],        pattern: 'solid', ws: 'none', roof: ['canopy'], hue: [0.05, 0.09], sat: [0.35, 0.5], w: [1.1, 1.4], F: [0.6, 0.8], floors: [4, 6], grow: 0.3, top: 3 },                  // giant tree
  { sides: [4],        profile: 'point', glass: true, ws: 'band', roof: ['tip'], w: [2.8, 3.4], F: [0.5, 0.6], floors: [5, 7] },                          // glass pyramid
  { sides: [8],        pattern: 'stripe', ledge: ['slab', 2], ws: 'strip', roof: ['onion'], w: [1.2, 1.6], floors: [6, 9] },                               // onion-dome tower
  { sides: [16],       ws: 'port', roof: ['obs'], w: [2, 2.6], F: [0.7, 0.8], sat: [0.05, 0.2], floors: [2, 3], base: 0.2, grow: 0, top: 1 },          // observatory
  { sides: [4],        twist: [0.785, 0.785], pattern: 'alt', ws: 'grid', roof: ['spire'], w: [1.3, 1.7], floors: [8, 12] },                            // star tower (45° alternating)
  { sides: [16],       profile: 'step', pattern: 'alt', ledge: ['slab', 2], ws: 'none', roof: ['cherry'], sat: [0.3, 0.5], w: [2.4, 3], F: [0.4, 0.5], floors: [6, 8], grow: 0.3 }, // wedding cake
  { sides: [4],        ledge: ['slab', 3], ws: 'slit', roof: ['clock'], hue: [0.03, 0.1], sat: [0.2, 0.35], w: [1.1, 1.4], F: [0.6, 0.7], floors: [9, 13], top: 1 }, // clock tower
  { sides: [16],       pattern: 'solid', ws: 'port', roof: ['shroom'], hue: [0.1, 0.14], sat: [0.2, 0.3], w: [1, 1.3], F: [0.6, 0.7], floors: [3, 5], grow: 0.3, top: 1.5 }, // mushroom house
  { sides: [6],        pattern: 'solid', foot: 0xf49ac1, ws: 'none', roof: ['pencil'], hue: [0.12, 0.14], sat: [0.75, 0.85], w: [1, 1.3], floors: [8, 12], grow: 0.3, top: 1 }, // pencil (pink eraser foot)
  { sides: [16],       profile: 'invert', pattern: 'solid', ledge: ['slab', 1], ws: 'none', roof: ['scoop'], hue: [0.08, 0.1], sat: [0.5, 0.6], w: [2, 2.4], F: [0.5, 0.6], floors: [6, 8], grow: 0.3, top: 5 }, // ice cream cone
  { sides: [4],        dr: [0.7, 0.8], ledge: ['slab', 2], ws: 'grid', roof: ['robot'], sat: [0.2, 0.4], w: [1.4, 1.8], floors: [6, 8], grow: 0.4, top: 1.5 }, // robot
  { sides: [4],        pattern: 'alt', ws: 'port', win: 2, roof: ['wings'], w: [0.9, 1.2], F: [0.7, 0.8], floors: [6, 9], grow: 0.5 },                  // totem pole (port pairs = eyes)
  { sides: [4],        dr: [0.55, 0.7], ledge: ['slab', 1], ws: 'strip', win: 2, roof: ['gable'], sat: [0.35, 0.55], w: [1.2, 1.5], floors: [4, 6], grow: 0 }, // canal house
  { sides: [16],       pattern: 'stripe', stripe: 2, ws: 'none', roof: ['flame'], sat: [0.5, 0.7], w: [0.8, 1], F: [0.5, 0.6], floors: [6, 9], grow: 0.3, top: 1.5 }, // birthday candle
  { sides: [8],        profile: 'bulge', pattern: 'solid', ws: 'port', roof: ['leaves'], hue: [0.09, 0.12], sat: [0.7, 0.8], w: [1.6, 2], floors: [4, 6], grow: 0.3, top: 2 }, // pineapple house
  { sides: [4],        dr: [0.75, 0.85], pattern: 'solid', ws: 'grid', win: 2, roof: ['pitch'], hue: [0.06, 0.08], sat: [0.45, 0.55], w: [2, 2.4], F: [0.8, 0.9], floors: [2, 3], grow: 0, top: 1.5 }, // gingerbread cottage
  { sides: [4],        dr: [0.65, 0.75], pattern: 'solid', ws: 'none', roof: ['gambrel'], hue: [0.99, 1.01], sat: [0.7, 0.8], lum: 0.38, w: [2.4, 2.8], F: [0.9, 1], floors: [2, 3], grow: 0, top: 1 }, // red barn
  { sides: [8],        ledge: ['disc', 3], ws: 'band', roof: ['solar'], w: [0.6, 0.8], F: [0.5, 0.6], floors: [10, 14], grow: 0.5, top: 1 },          // satellite tower
  { sides: [6],        profile: 'khalifa', glass: true, ws: 'strip', roof: ['spire'], w: [2, 2.4], F: [0.4, 0.5], floors: [16, 22], top: 1 },          // megatall
  { sides: [16],       pattern: 'solid', ws: 'none', roof: ['stupa'], sat: [0.05, 0.1], w: [2.6, 3.2], F: [0.5, 0.6], floors: [2, 2], base: 0.3, steps: 3, grow: 0, top: 2 }, // stupa
  { sides: [4],        dr: [0.7, 0.9], ledge: ['slab', 2], ws: 'slit', roof: ['gothic'], sat: [0.05, 0.15], w: [1.6, 2], F: [0.9, 1], floors: [5, 7], grow: 0.3, top: 2.5 }, // gothic cathedral
  { sides: [4],        pattern: 'cap', ledge: ['slab', 4], ws: 'strip', roof: ['deco'], w: [1.4, 1.8], floors: [12, 16], top: 2.5 },                     // art deco
  { sides: [4],        pattern: 'solid', ledge: ['slab', 1], ws: 'none', roof: ['trophy'], sat: [0.1, 0.25], w: [1.4, 1.8], floors: [4, 6], grow: 0.3, top: 2.5 }, // trophy
  { sides: [16],       profile: 'pole', pattern: 'solid', ws: 'none', roof: ['turbine'], sat: [0.02, 0.08], w: [0.6, 0.8], F: [0.5, 0.6], floors: [14, 20], top: 3 }, // wind turbine
  { sides: [8],        pattern: 'solid', ws: 'none', roof: ['cactus'], hue: [0.3, 0.36], sat: [0.4, 0.5], w: [1, 1.3], floors: [6, 9], grow: 0.3, top: 1 }, // cactus
  { sides: [4],        pattern: 'alt', ws: 'none', roof: ['studs'], sat: [0.8, 0.9], w: [1.6, 2.2], F: [0.5, 0.6], floors: [6, 9] },                      // lego tower
];

function genLevel(n) {
  const r = rng(n), pick = a => a[Math.floor(r() * a.length)], A = ARCH[(n - 6) % ARCH.length];
  const hue = (A.hue ? R(r, A.hue) : r()) % 1, sat = A.sat ? R(r, A.sat) : 0.3 + r() * 0.4, span = !!A.span;
  const floors = Math.round(R(r, A.floors)) + Math.round(Math.min(10, Math.floor((n - 5) / 4)) * (A.grow ?? 1)); // grow: how much the late-level floor bonus applies
  const F = R(r, A.F ?? (span ? [0.4, 0.7] : [0.5, 0.8]));
  const w0 = R(r, A.w ?? (span ? [1.2, 1.8] : [1.2, 2.4])), wTop = w0 * (0.35 + r() * 0.65), profile = A.profile ?? 'flat';
  const lum = 0.5 + r() * 0.12, main = hsl(hue, Math.max(sat, 0.2), A.lum ?? lum) /* lum: fixed lightness (always draw r() so other rolls stay put) */, accent = hsl((hue + 0.5) % 1, 0.5, 0.5);
  const pattern = A.pattern ?? pick(['solid', 'stripe', 'gradient', 'solid']), stripe = A.stripe ?? 2 + Math.floor(r() * 4);
  const offs = Array.from({ length: floors }, (_, i) =>
    A.shift === 'jenga' ? [(r() - 0.5) * 0.4, (r() - 0.5) * 0.4] : A.shift === 'lean' ? [-0.07 * i, 0] : A.shift === 'helix' ? [Math.cos(i * 0.55) * 0.3, Math.sin(i * 0.55) * 0.3] : [0, 0]);
  const gen = {
    F, span, sides: span ? 4 : pick(A.sides), dr: A.dr ? R(r, A.dr) : 1, twist: A.twist ? R(r, A.twist) : 0, deck: 0.8 + r() * 0.6,
    base: A.base, steps: A.steps, guys: A.guys, ledge: A.ledge?.[0], every: A.ledge?.[1] ?? 1, cols: A.cols ?? 0, ws: A.ws ?? 'strip', glass: !!A.glass, win: 2 + Math.floor(r() * 4), roof: pick(A.roof),
    light: LIGHTS[Math.floor(rng(n * 7919)() * LIGHTS.length)], // own rng stream: adding it doesn't re-roll existing shapes
    shift: i => offs[i],
    size: (i, m) => {
      const t = i / Math.max(1, m - 1);
      if (span) return w0;
      if (profile === 'taper') return w0 + (wTop - w0) * t;
      if (profile === 'step') return w0 * (1 - 0.12 * Math.floor(i / 2));
      if (profile === 'bulge') return w0 * (0.7 + 0.3 * Math.sin(Math.PI * t));
      if (profile === 'pinch') return w0 * (1 - 0.35 * Math.sin(Math.PI * t));
      if (profile === 'flare') return w0 * (t < 0.65 ? 0.45 : 1);
      if (profile === 'podium') return w0 * (i < 2 ? 1 : 0.55);
      if (profile === 'needle') return w0 * (t < 0.8 ? 0.3 : 1); // thin stalk, wide saucer on top
      if (profile === 'point') return w0 * (1 - 0.85 * t);
      if (profile === 'invert') return w0 * (0.35 + 0.65 * t); // narrow at the bottom
      if (profile === 'khalifa') return w0 * (1 - 0.8 * Math.floor(t * 6) / 6); // 6 setbacks down to a needle
      if (profile === 'pole') return w0 * (1 - 0.5 * t);
      return w0;
    },
    color: (i, m) => A.foot && i === 0 ? A.foot : pattern === 'stripe' && i % stripe === stripe - 1 ? accent : pattern === 'alt' && i % 2 ? accent
      : pattern === 'cap' && i >= m - 2 ? accent : pattern === 'gradient' ? hsl((hue + 0.12 * i / m) % 1, Math.max(sat, 0.2), 0.55) : main,
  };
  // framing from the landmark's size
  const H = span ? gen.deck + F + 1 : floors * F + 1.5 + (A.top ?? 0), /* top: roof taller than usual */ L = span ? floors * w0 : 0, W = w0 * Math.max(1, gen.dr);
  const dist = span ? L * 0.55 + 5 : Math.max(6.5, H * 1.6 + 3, W * 2.8);
  return {
    landmark: 'gen', gen, floors, hitsPerPhase: hpp(n), k: Math.max(1, L / 16),
    ground: hsl((hue + 0.3 + r() * 0.4) % 1, 0.25 + r() * 0.3, 0.12 + r() * 0.2), props: [pick(PROPS), 8 + Math.floor(r() * 8)],
    cam: [dist * 0.72, span ? H * 0.9 + 3 : H * 0.55 + 2, -dist * 0.72], target: [0, span ? 1.2 : H * 0.45, 0],
  };
}

// ---------- props ----------
const P = {
  crate: toon(0x8a5a2b), cactus: toon(0x3f8f4a), trunk: toon(0x6b4a2b), leaf: toon(0x3aa860), pine: toon(0x2f6b3a),
  bldg: toon(0x1e2436), snow: toon(0xe8eef5),
  cone: toon(0xff6a1a), band: toon(0xf2f2f2), barrel: toon(0x2a2f3d), rod: toon(0x3a3f4d), lamp: toon(0xfff1c9, 0xffc46b, 3),
};
// site dressing (banner look): cones, barrel, floodlight aimed at the build. Same spots every level, front of the pad, clear of the |z|<1.2 lane.
function dressing() {
  const g = new THREE.Group();
  const coneAt = (x, z) => {
    const c = new THREE.Group(); c.position.set(x, 0, z);
    const base = box(0.3, 0.04, 0.3, P.band); base.position.y = 0.02; c.add(base);
    const k = part(cached('tcone', () => new THREE.ConeGeometry(0.12, 0.38, 12)), P.cone); k.position.y = 0.23; c.add(k);
    const b = part(cached('tband', () => new THREE.CylinderGeometry(0.068, 0.085, 0.07, 12)), P.band, false); b.position.y = 0.25; c.add(b);
    g.add(c);
  };
  coneAt(-2.6, -3.4); coneAt(-2.1, -3.9); coneAt(3.3, -2.2);
  const barrel = cyl(0.2, 0.5, P.barrel); barrel.position.set(-3.3, 0.25, -2.6); g.add(barrel);
  const lid = cyl(0.21, 0.04, P.rod); lid.position.set(-3.3, 0.5, -2.6); g.add(lid);
  const fl = new THREE.Group(); fl.position.set(-3.8, 0, -1.6); fl.rotation.y = Math.atan2(3.8, 1.6); // faces the landmark
  for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2, leg = cyl(0.02, 0.8, P.rod); leg.position.set(Math.cos(a) * 0.15, 0.38, Math.sin(a) * 0.15); leg.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35); fl.add(leg); }
  const head = box(0.36, 0.26, 0.12, P.rod); head.position.y = 0.85; head.rotation.x = -0.35; fl.add(head); // tilt up at the tower
  const face = box(0.3, 0.2, 0.02, P.lamp, false); face.position.set(0, 0, 0.065); head.add(face);
  g.add(fl);
  return g;
}
const edgeMat = new THREE.LineBasicMaterial({ color: new THREE.Color(0.2, 1.6, 2) });
const rnd = (a, b) => a + Math.random() * (b - a);

const BUILD = {
  crate() { const g = new THREE.Group(); const s = rnd(0.35, 0.55); const c = box(s, s, s, P.crate); c.position.y = s / 2; c.rotation.y = rnd(0, 1); g.add(c);
    if (Math.random() < 0.4) { const c2 = box(s * 0.8, s * 0.8, s * 0.8, P.crate); c2.position.set(0.1, s + s * 0.4, 0.1); c2.rotation.y = rnd(0, 1); g.add(c2); } return g; },
  cactus() { const g = new THREE.Group(); const h = rnd(0.7, 1.2); const t = cyl(0.13, h, P.cactus); t.position.y = h / 2; g.add(t);
    for (const s of [-1, 1]) { if (Math.random() < 0.7) { const a = cyl(0.08, 0.3, P.cactus); a.rotation.z = Math.PI / 2; a.position.set(s * 0.22, h * 0.55, 0); g.add(a);
      const u = cyl(0.08, 0.35, P.cactus); u.position.set(s * 0.35, h * 0.55 + 0.15, 0); g.add(u); } } return g; },
  palm() { const g = new THREE.Group(); const h = rnd(1.2, 1.8); const t = cyl(0.07, h, P.trunk); t.position.y = h / 2; t.rotation.z = rnd(-0.15, 0.15); g.add(t);
    for (let k = 0; k < 5; k++) { const l = box(0.9, 0.04, 0.22, P.leaf); l.position.y = h; l.rotation.y = k / 5 * Math.PI * 2; l.rotation.z = -0.5; l.translateX(0.4); g.add(l); } return g; },
  building() { const g = new THREE.Group(); const w = rnd(0.6, 1.2), h = rnd(1, 3.5); const b = box(w, h, w, P.bldg, false); b.position.y = h / 2; g.add(b);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry), edgeMat); e.scale.setScalar(1.01); b.add(e); return g; },
  pine() { const g = new THREE.Group(); const h = rnd(0.9, 1.5); const t = cyl(0.08, 0.5, P.trunk); t.position.y = 0.25; g.add(t);
    const c = part(cached(`pine${h.toFixed(1)}`, () => new THREE.ConeGeometry(0.4, h, 8)), P.pine); c.position.y = 0.5 + h / 2; g.add(c);
    const s = part(cached(`pinesnow${h.toFixed(1)}`, () => new THREE.ConeGeometry(0.22, h * 0.5, 8)), P.snow); s.position.y = 0.5 + h * 0.75; g.add(s); return g; },
};

// scatter props on a ring r 5–6.8, keep the |z|<1.2 band clear (bridge spans + spawn lanes)
export function makeProps(spec) {
  const g = new THREE.Group(); g.add(dressing());
  const [kind, n] = spec.props;
  for (let i = 0; i < n; i++) {
    const a = rnd(0, Math.PI * 2), r = rnd(5, 6.8), x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.abs(z) < 1.2) continue;
    const m = BUILD[kind](); m.position.set(x, 0, z); m.rotation.y = rnd(0, 6.28); g.add(m);
  }
  return g;
}
