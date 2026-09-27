import * as THREE from 'three';
import { toon, box, cyl, part, cached, release, CYAN } from './toon.js';
import { tween, ease, lerp, pop, punch, ring, lightFlash, shake, fireworks, delay } from './vfx.js';
import { emit } from './particles.js';

// shared materials (no flash ref → building never flashes)
const S = {
  found: toon(0x2a3048), steel: toon(0x8c94a8), concrete: toon(0xb8bcc8), rail: toon(0x6c7383),
  scaf: toon(0xd4a020), crane: toon(0xffc21a), roofRed: toon(0xc94f2a), gold: toon(0xf2c14e),
  glass: toon(0x9fd8ff, CYAN, 1.2), clock: toon(0xf5ecd5), leaf: toon(0x3f9f55), leaf2: toon(0x2f7f45), sail: toon(0xefe6d2), onion: toon(0x2fa39a), wood: toon(0xe8c39a), lead: toon(0x2a2a30), pink: toon(0xf49ac1), mint: toon(0x9be8c8), flame: toon(0xffc46b, 0xff8a1a, 2.4), solar: toon(0x1d3f8a, 0x2244aa, 0.5), hook: toon(0x0a2a33, CYAN, 3), flag: toon(0x0a2a33, CYAN, 3), tip: toon(0x0a2a33, CYAN, 4),
};
const bpMat = new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.5 });
const bpFill = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false }); // glassy holo volume
const PH = 3, BASE = 0.1; // build phases per floor, foundation top
const postGeo = new THREE.BoxGeometry(0.05, 1, 0.05).translate(0, 0.5, 0);
const MW = 0.24, JW = 0.16; // lattice mast / jib cross-section
const mastGeo = new THREE.BoxGeometry(MW, 1, MW).translate(0, 0.5, 0);
const jibGeo = new THREE.BoxGeometry(1, JW, JW).translate(-0.5, 0, 0); // spans x -1 → 0, scale.x = length
// lattice panel: chords + X bracing, alpha-tested so the crane reads as open steelwork (banner look). One cell = one square face.
const latticeImg = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  x.strokeStyle = '#fff'; x.lineCap = 'square';
  x.lineWidth = 10; x.strokeRect(0, 0, 64, 64);
  x.lineWidth = 5; x.beginPath(); x.moveTo(0, 0); x.lineTo(64, 64); x.moveTo(64, 0); x.lineTo(0, 64); x.stroke();
  return c;
})();
const lattice = () => {
  const t = new THREE.CanvasTexture(latticeImg); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  const m = toon(0xffc21a); m.map = t; m.alphaTest = 0.5; m.side = THREE.DoubleSide; return m;
};
const cableGeo =new THREE.BoxGeometry(0.012, 1, 0.012).translate(0, -0.5, 0);
const pierGeo = new THREE.BoxGeometry(0.16, 1, 0.16).translate(0, -0.5, 0);
const wireGeo = new THREE.BoxGeometry(0.018, 0.018, 1).translate(0, 0, 0.5), Z = new THREE.Vector3(0, 0, 1);
const aim = (m, a, b) => { const v = b.clone().sub(a); m.position.copy(a); m.scale.z = v.length(); m.quaternion.setFromUnitVectors(Z, v.normalize()); return m; };
const wire = (a, b) => aim(part(wireGeo, S.steel, false), a, b); // cable a → b
const arc = R => cached(`arc${R.toFixed(2)}`, () => new THREE.TorusGeometry(R, 0.05, 6, 16, Math.PI)); // upper half ring in xy
const cone = (r, h, seg) => cached(`cone${r.toFixed(2)},${h},${seg}`, () => new THREE.ConeGeometry(r, h, seg));
const prism = (r, h, n) => cached(`p${r.toFixed(3)},${h.toFixed(3)},${n}`, () => new THREE.CylinderGeometry(r, r, h, n));
const torus = (r, t) => cached(`t${r.toFixed(2)},${t}`, () => new THREE.TorusGeometry(r, t, 8, 32).rotateX(Math.PI / 2));
// window mesh per style, facing +z
const WIN = {
  strip: m => box(0.16, 0.28, 0.03, m, false),
  slit:  m => box(0.05, 0.32, 0.03, m, false),
  port:  m => { const c = cyl(0.09, 0.03, m, false); c.rotation.x = Math.PI / 2; return c; },
  grid:  m => { const g = new THREE.Group(); for (const y of [-0.12, 0.12]) for (const x of [-0.12, 0.12]) { const b = box(0.1, 0.1, 0.03, m, false); b.position.set(x, y, 0); g.add(b); } return g; },
};

// landmark types: same phase system, different slab shape / color / roof
// light = window glow color; lit = share of windows that turn on at clear
const TYPES = {
  tower:      { F: 0.7, size: () => 1.6, color: () => 0xd9cbb3, roof: 'clock', ws: 'grid', ledge: 'slab', light: 0xffc46b },
  pyramid:    { F: 0.6, size: (i, n) => lerp(2.8, 0.8, i / Math.max(1, n - 1)), color: i => i % 2 ? 0xe0c48c : 0xcfae72, roof: 'tip', ws: 'slit', win: 2, ledge: 'slab', light: 0xffa94d },
  lighthouse: { F: 0.6, size: (i, n) => lerp(1.5, 1.1, i / Math.max(1, n - 1)), color: i => i % 2 ? 0xf2f2f2 : 0xd9534f, roof: 'lamp', sides: 16, ws: 'port', ledge: 'disc', every: 4, light: 0xfff1c9 },
  skyscraper: { F: 0.6, size: (i, n) => 1.4 * (i < n * 0.5 ? 1 : i < n * 0.8 ? 0.78 : 0.56), /* setbacks */ color: () => 0x5d8fc9, roof: 'antenna', glass: true, ws: 'band', ledge: 'slab', every: 3, light: CYAN },
  bridge:     { F: 0.5, size: () => 1.5, color: () => 0xb84a36, roof: 'stay', span: true, deck: 1.0, light: 0xffc46b },
};

// one floor = [blueprint, frame, walls, finish] groups, centred on the floor centre
function floorParts(T, i, sides, w, d, F, mat, [win, off], cy) {
  const lit = () => Math.random() < (T.lit ?? 0.7) ? win : off; // some rooms stay dark: reads as lived-in, less bloom wash
  const poly = sides > 4, r = w / 2, E = w / 2 - 0.04, Ed = d / 2 - 0.04;
  const bpGeo = poly ? prism(r, F, sides) : new THREE.BoxGeometry(w, F, d), bp = new THREE.LineSegments(new THREE.EdgesGeometry(bpGeo), bpMat);
  bp.add(new THREE.Mesh(bpGeo, bpFill));
  const frame = new THREE.Group(), walls = new THREE.Group(), finish = new THREE.Group();
  const wh = F * 0.65, wy = -F / 2 + wh / 2; // wall panels sit on the floor, gap at top
  // k points on the footprint edge (+pad out), [x, z, yaw]; box = k per side spread over f of the width, corners deduped
  const ring = (k, pad, f = 1) => poly
    ? Array.from({ length: k }, (_, j) => { const a = j / k * Math.PI * 2; return [Math.cos(a) * (r + pad), Math.sin(a) * (r + pad), Math.PI / 2 - a]; })
    : [-1, 1].flatMap(s => Array.from({ length: k }, (_, j) => { const u = k > 1 ? (j / (k - 1) * 2 - 1) * f : 0, end = f === 1 && (j === 0 || j === k - 1);
        return [[u * (w / 2 + pad), s * (d / 2 + pad), 0], ...(end ? [] : [[s * (w / 2 + pad), u * (d / 2 + pad), Math.PI / 2]])]; }).flat());
  if (T.span) {                              // bridge span: piers to ground → deck → rails + lamp
    const H = cy - F / 2;
    for (const s of [-1, 1]) { const p = part(pierGeo, S.concrete); p.scale.y = H; p.position.set(s * (w / 2 - 0.12), -F / 2, 0); frame.add(p); }
    for (const z of [-1, 1]) { const a = part(arc(w / 2 - 0.12), S.concrete); a.position.set(0, -F / 2 - (w / 2 - 0.12), z * (d / 2 - 0.15)); frame.add(a); } // arch springs from the piers
    const beam = box(w, 0.08, d, S.steel); beam.position.y = -F / 2 + 0.04; frame.add(beam);
    const deck = box(w, F / 2, d, mat); deck.position.y = -F / 4; walls.add(deck);
    const top = box(w + 0.02, F / 2, d + 0.02, mat); top.position.y = F / 4; top.receiveShadow = true; finish.add(top);
    for (const s of [-1, 1]) {
      const rail = box(w, 0.05, 0.05, S.rail); rail.position.set(0, F / 2 + 0.25, s * Ed); finish.add(rail);
      for (const x of [-w / 2 + 0.1, w / 2 - 0.1]) { const p = box(0.05, 0.25, 0.05, S.rail); p.position.set(x, F / 2 + 0.125, s * Ed); finish.add(p); }
    }
    const lp = cyl(0.02, 0.5, S.rail); lp.position.set(0, F / 2 + 0.25, -Ed); finish.add(lp);
    const lamp = box(0.1, 0.1, 0.1, win, false); lamp.position.set(0, F / 2 + 0.55, -Ed); finish.add(lamp);
    return [bp, frame, walls, finish];
  }
  // frame: pillars + top ring / beams
  for (const [x, z] of ring(poly ? Math.min(sides, 8) : 2, -0.06)) { const p = box(0.08, F, 0.08, S.steel); p.position.set(x, 0, z); frame.add(p); }
  if (poly) { const rt = part(prism(r, 0.05, sides), S.steel); rt.position.y = F / 2 - 0.025; frame.add(rt); }
  else for (const s of [-1, 1]) {
    const bx = box(w, 0.06, 0.06, S.steel); bx.position.set(0, F / 2 - 0.03, s * Ed); frame.add(bx);
    const bz = box(0.06, 0.06, d, S.steel); bz.position.set(s * E, F / 2 - 0.03, 0); frame.add(bz);
  }
  // walls: shell / 4 panels
  if (poly) { const sh = part(prism(r - 0.03, wh, sides), S.concrete); sh.position.y = wy; walls.add(sh); }
  else for (const s of [-1, 1]) {
    const wz = box(w - 0.16, wh, 0.06, S.concrete); wz.position.set(0, wy, s * Ed); walls.add(wz);
    const wx = box(0.06, wh, d - 0.16, S.concrete); wx.position.set(s * E, wy, 0); walls.add(wx);
  }
  // finish: slab + windows + ledge + columns
  const slab = poly ? part(prism(r + 0.02, F, sides), mat) : box(w + 0.04, F, d + 0.04, mat); slab.receiveShadow = true; finish.add(slab);
  const ws = T.ws ?? 'strip';
  if (ws === 'band') finish.add(poly ? part(prism(r + 0.05, 0.12, sides), win, false) : box(w + 0.1, 0.12, d + 0.1, win, false));
  else if (WIN[ws]) for (const [x, z, yaw] of ring(poly ? Math.min(sides, 8) : T.win ?? 3, 0.03, 0.7)) { const m = WIN[ws](lit()); m.position.set(x, 0, z); m.rotation.y = yaw; finish.add(m); }
  if (T.ledge && i % (T.every ?? 1) === 0) {
    const eave = T.ledge === 'eave';
    const L = eave ? part(cone(r * (poly ? 1.45 : 2.1), 0.28, poly ? sides : 4), S.found)
      : T.ledge === 'disc' ? part(prism(r * 1.7, 0.05, 16), S.steel) : poly ? part(prism(r * 1.14, 0.06, sides), S.concrete) : box(w * 1.14, 0.06, d * 1.14, S.concrete);
    L.position.y = eave ? F / 2 + 0.16 : -F / 2 + 0.03; if (eave && !poly) L.rotation.y = Math.PI / 4; finish.add(L);
  }
  if (i === 0) { const dw = Math.min(0.36, w * 0.25), dh = Math.min(0.5, F * 0.75), dr = box(dw, dh, 0.06, win, false); dr.position.set(0, -F / 2 + dh / 2, -(poly ? r : d / 2) - 0.02); finish.add(dr); } // lit doorway
  if (T.cols) for (const [x, z] of ring(T.cols, 0.12)) { const c = cyl(0.09, F, S.concrete); c.position.set(x, 0, z); finish.add(c); }
  return [bp, frame, walls, finish];
}

function makeRoof(kind, w, d, sides, len, body) { // returns { g, flagY }; len = bridge length, body = top floor material
  const g = new THREE.Group();
  const tip = y => { const t = part(cached('tip', () => new THREE.SphereGeometry(0.05, 10, 8)), S.tip, false); t.position.y = y; g.add(t); };
  const rod = (h, y, r = 0.02) => { const a = cyl(r, h, S.steel); a.position.y = y; g.add(a); };
  if (kind === 'cone') { const c = part(cone(w * 0.75, 0.6, 4), S.roofRed); c.rotation.y = Math.PI / 4; c.position.y = 0.3; g.add(c); rod(0.6, 0.9); tip(1.2); return { g, flagY: 1.05 }; }
  if (kind === 'tip') { const c = part(cone(w * 0.7, 0.5, 4), S.gold); c.rotation.y = Math.PI / 4; c.position.y = 0.25; g.add(c); tip(0.55); return { g, flagY: 0.65 }; }
  if (kind === 'lamp') { const gl = cyl(w * 0.35, 0.45, S.glass); gl.position.y = 0.22; g.add(gl); const c = part(cone(w * 0.5, 0.4, 12), S.roofRed); c.position.y = 0.65; g.add(c); tip(0.9); return { g, flagY: 0.95 }; }
  if (kind === 'antenna') { const cap = box(w * 0.6, 0.2, w * 0.6, S.steel); cap.position.y = 0.1; g.add(cap); rod(1.4, 0.9, 0.025); tip(1.65); return { g, flagY: 1.5 }; }
  if (kind === 'dome') { const d = part(cached(`dome${w.toFixed(2)}`, () => new THREE.SphereGeometry(w * 0.45, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2)), S.gold); g.add(d); rod(0.4, w * 0.45 + 0.2, 0.02); tip(w * 0.45 + 0.4); return { g, flagY: w * 0.45 + 0.35 }; }
  if (kind === 'flat') { const par = box(w + 0.1, 0.12, w + 0.1, S.steel); par.position.y = 0.06; g.add(par); const hut = box(w * 0.3, 0.3, w * 0.3, S.concrete); hut.position.set(w * 0.2, 0.27, -w * 0.2); g.add(hut); rod(0.7, 0.45, 0.02); tip(0.82); return { g, flagY: 0.7 }; }
  if (kind === 'spire') { const c = part(cone(w * 0.45, 1.6, 8), S.steel); c.position.y = 0.8; g.add(c); tip(1.65); return { g, flagY: 1.5 }; }
  if (kind === 'pagoda') { const n = sides > 4 ? sides : 4; for (let k = 0; k < 3; k++) { const c = part(cone(w * (0.75 - k * 0.2), 0.25, n), S.roofRed); c.rotation.y = n === 4 ? Math.PI / 4 : 0; c.position.y = 0.15 + k * 0.4; g.add(c);
    if (k < 2) { const b = part(prism(w * (0.3 - k * 0.08), 0.3, n), S.concrete); b.rotation.y = c.rotation.y; b.position.y = 0.4 + k * 0.4; g.add(b); } } rod(0.5, 1.25); tip(1.5); return { g, flagY: 1.4 }; }
  if (kind === 'castle') {
    for (let k = 0, P = 2 * (w + d); k < P; k += 0.32) { // crenels walk the perimeter, turrets on the corners
      const [x, z] = k < w ? [k - w / 2, -d / 2] : k < w + d ? [w / 2, k - w - d / 2] : k < 2 * w + d ? [w / 2 - (k - w - d), d / 2] : [-w / 2, d / 2 - (k - 2 * w - d)];
      const b = box(0.14, 0.16, 0.14, S.concrete); b.position.set(x, 0.08, z); g.add(b);
    }
    for (const x of [-1, 1]) for (const z of [-1, 1]) { const t = cyl(0.18, 1, S.concrete); t.position.set(x * w / 2, 0.3, z * d / 2); g.add(t); const c = part(cone(0.22, 0.35, 8), S.roofRed); c.position.set(x * w / 2, 0.97, z * d / 2); g.add(c); }
    rod(0.6, 0.3); tip(0.62); return { g, flagY: 0.5 };
  }
  if (kind === 'helipad') { const m = Math.min(w, d), par = box(w + 0.1, 0.12, d + 0.1, S.steel); par.position.y = 0.06; g.add(par); const pad = cyl(m * 0.42, 0.06, S.concrete); pad.position.y = 0.15; g.add(pad);
    const h = part(torus(m * 0.3, 0.025), S.tip, false); h.position.y = 0.19; g.add(h); return { g, flagY: 0.35 }; }
  if (kind === 'halo') { const R = w * 0.5 + 0.15; for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2, p = cyl(0.02, 0.6, S.steel); p.position.set(Math.cos(a) * R * 0.8, 0.3, Math.sin(a) * R * 0.8); g.add(p); }
    const h = part(torus(R, 0.05), S.tip, false); h.position.y = 0.6; g.add(h); rod(0.5, 0.85, 0.015); tip(1.1); return { g, flagY: 0.95 }; }
  if (kind === 'pediment') { const R = w * 0.62, p = part(cached(`ped${w.toFixed(2)},${d.toFixed(2)}`, () => new THREE.CylinderGeometry(R, R, d * 1.06, 3, 1).rotateX(-Math.PI / 2).scale(1, 0.45, 1)), S.concrete);
    p.position.y = R * 0.225; g.add(p); tip(R * 0.45 + 0.05); return { g, flagY: R * 0.45 + 0.1 }; }
  if (kind === 'nose') { const c = part(cone(w * 0.52, w * 1.2, 16), S.steel); c.position.y = w * 0.6; g.add(c); tip(w * 1.2 + 0.05); return { g, flagY: w * 1.2 + 0.1 }; }
  if (kind === 'crown') { for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2, c = part(cone(0.12, 0.4, 4), S.gold); c.position.set(Math.cos(a) * w * 0.4, 0.2, Math.sin(a) * w * 0.4); g.add(c); }
    const c = part(cone(w * 0.3, 0.7, 4), S.gold); c.position.y = 0.35; g.add(c); tip(0.75); return { g, flagY: 0.8 }; }
  if (kind === 'stack') { for (const x of [-0.3, 0.3]) { const s = cyl(0.13, 1.1, S.rail); s.position.set(x * w, 0.55, 0); g.add(s); const b = cyl(0.14, 0.12, S.roofRed); b.position.set(x * w, 1.05, 0); g.add(b); } rod(0.5, 0.25); tip(0.52); return { g, flagY: 0.45 }; }
  if (kind === 'dishes') { rod(1.6, 0.8, 0.025); for (const [y, s] of [[0.5, 1], [1.0, -1]]) { const dsh = cyl(0.22, 0.03, S.steel); dsh.position.set(s * 0.2, y, 0); dsh.rotation.z = s * 0.9; g.add(dsh); } tip(1.65); return { g, flagY: 1.5 }; }
  if (kind === 'altar') { const b = box(w * 0.45, 0.35, w * 0.45, S.gold); b.position.y = 0.17; g.add(b); const c = part(cone(w * 0.3, 0.3, 4), S.roofRed); c.rotation.y = Math.PI / 4; c.position.y = 0.5; g.add(c); tip(0.7); return { g, flagY: 0.75 }; }
  if (kind === 'clock') { const b = box(w * 0.7, 0.7, w * 0.7, S.concrete); b.position.y = 0.35; g.add(b);
    for (let k = 0; k < 4; k++) { const f = new THREE.Group(); f.rotation.y = k * Math.PI / 2; g.add(f);
      const c = cyl(0.24, 0.04, S.clock); c.rotation.x = Math.PI / 2; c.position.set(0, 0.38, -w * 0.35 - 0.02); f.add(c);
      for (const [l, a] of [[0.16, 0.5], [0.11, 2.2]]) { const h = part(cached(`hand${l}`, () => new THREE.BoxGeometry(0.03, l, 0.02).translate(0, l / 2, 0)), S.found, false); h.position.set(0, 0.38, -w * 0.35 - 0.05); h.rotation.z = a; f.add(h); } }
    const c = part(cone(w * 0.62, 0.8, 4), S.roofRed); c.rotation.y = Math.PI / 4; c.position.y = 1.1; g.add(c); rod(0.4, 1.6); tip(1.82); return { g, flagY: 1.7 }; }
  if (kind === 'stay') { const H = 2.2, P = len / 4, e = d / 2 + 0.06; // cable-stayed: 2 pylons, fan of cables to the deck
    for (const px of [-P, P]) { for (const z of [-e, e]) { const leg = box(0.14, H, 0.14, S.roofRed); leg.position.set(px, H / 2, z); g.add(leg);
        for (let k = 1; k <= 4; k++) for (const sx of [-1, 1]) g.add(wire(new THREE.Vector3(px, H - 0.1 - k * 0.08, z), new THREE.Vector3(px + sx * k * len / 20, 0.05, z))); }
      const cb = box(0.12, 0.12, e * 2 + 0.14, S.roofRed); cb.position.set(px, H - 0.3, 0); g.add(cb); }
    rod(0.8, 0.4, 0.015); tip(0.82); return { g, flagY: 0.7 }; }
  if (kind === 'mill') { const c = part(cone(w * 0.62, 0.7, sides), S.roofRed); c.position.y = 0.35; g.add(c); // blades spin via userData.spin
    const hub = cyl(0.12, 0.3, S.steel); hub.rotation.x = Math.PI / 2; hub.position.set(0, 0.25, -w * 0.5 - 0.1); g.add(hub);
    const spin = new THREE.Group(); spin.position.set(0, 0.25, -w * 0.5 - 0.25); g.add(spin); g.userData.spin = spin;
    for (let k = 0; k < 4; k++) { const arm = new THREE.Group(); arm.rotation.z = k * Math.PI / 2; spin.add(arm);
      const b = box(0.07, w * 1.3, 0.04, S.steel); b.position.y = w * 0.65; arm.add(b); const sl = box(0.28, w * 1.0, 0.02, S.sail); sl.position.set(0.18, w * 0.75, 0); arm.add(sl); }
    rod(0.4, 0.9); tip(1.12); return { g, flagY: 1.0 }; }
  if (kind === 'canopy') { for (const [x, y, z, r, m] of [[0, 1.0, 0, 1.15, S.leaf], [0.75, 0.6, 0.2, 0.8, S.leaf2], [-0.7, 0.65, -0.1, 0.8, S.leaf2], [0.1, 0.55, -0.75, 0.75, S.leaf], [-0.1, 0.6, 0.75, 0.75, S.leaf], [0, 1.7, 0, 0.7, S.leaf2]]) {
      const b = part(cached(`ball${(r * w).toFixed(2)}`, () => new THREE.IcosahedronGeometry(r * w, 1)), m); b.position.set(x * w, y * w, z * w); g.add(b); }
    return { g, flagY: w * 2.5 }; }
  if (kind === 'onion') { const b = part(prism(w * 0.35, 0.3, sides), S.concrete); b.position.y = 0.15; g.add(b);
    const o = part(cached(`onion${w.toFixed(2)}`, () => new THREE.LatheGeometry([[0, 0], [0.3, 0.02], [0.46, 0.25], [0.4, 0.5], [0.18, 0.78], [0.04, 1], [0, 1.05]].map(([x, y]) => new THREE.Vector2(x * w * 1.4, y * w * 1.3)), 16)), S.onion);
    o.position.y = 0.3; g.add(o); rod(0.35, w * 1.37 + 0.45); tip(w * 1.37 + 0.65); return { g, flagY: w * 1.37 + 0.55 }; }
  const hemi = (R, key) => cached(`hemi${key}${R.toFixed(2)}`, () => new THREE.SphereGeometry(R, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2));
  if (kind === 'obs') { const R = w * 0.48, d = part(hemi(R, ''), S.clock); g.add(d); // observatory: dome, dark slit, telescope out of the slit
    const sl = box(0.3, R * 1.1, 0.1, S.found, false); sl.position.set(0, R * 0.55, -R * 0.82); sl.rotation.x = -0.6; g.add(sl);
    const t = cyl(0.09, R * 1.1, S.steel); t.rotation.x = -0.9; t.position.set(0, R * 0.75, -R * 0.55); g.add(t); tip(R + 0.1); return { g, flagY: R + 0.1 }; }
  if (kind === 'cherry') { const c = cyl(w * 0.3, 0.12, S.clock); c.position.y = 0.06; g.add(c); // wedding cake topper
    const ch = part(cached('cherry', () => new THREE.SphereGeometry(0.28, 16, 12)), S.roofRed); ch.position.y = 0.4; g.add(ch); rod(0.3, 0.8, 0.02); return { g, flagY: 0.9 }; }
  if (kind === 'shroom') { const R = w * 1.5, cap = part(hemi(R, 's'), S.roofRed); cap.scale.y = 0.6; g.add(cap); // mushroom: flattened red cap, cream spots
    for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, th = k % 2 ? 1.15 : 0.7, sp = part(cached('spot', () => new THREE.SphereGeometry(0.16, 10, 8)), S.clock, false);
      sp.position.set(Math.sin(th) * Math.cos(a) * R, Math.cos(th) * R * 0.6, Math.sin(th) * Math.sin(a) * R); sp.scale.y = 0.5; g.add(sp); }
    tip(R * 0.6 + 0.05); return { g, flagY: R * 0.6 + 0.1 }; }
  if (kind === 'pencil') { const h = w * 1.3, c = part(cone(w / 2 + 0.02, h, sides), S.wood); c.position.y = h / 2; g.add(c); // sharpened wood + graphite point
    const p = part(cone(w * 0.14, h * 0.28, sides), S.lead); p.position.y = h * 0.86; g.add(p); tip(h + 0.02); return { g, flagY: h + 0.1 }; }
  if (kind === 'scoop') { let y = w * 0.25; for (const [r, m] of [[0.62, S.pink], [0.5, S.mint], [0.4, S.clock]]) { // ice cream: 3 scoops + cherry
      const b = part(cached(`scoop${(r * w).toFixed(2)}`, () => new THREE.SphereGeometry(r * w, 16, 12)), m); b.position.y = y; g.add(b); y += r * w * 1.25; }
    const ch = part(cached('cherry', () => new THREE.SphereGeometry(0.28, 16, 12)), S.roofRed); ch.position.y = y; g.add(ch); return { g, flagY: y + 0.3 }; }
  if (kind === 'robot') { const hw = w * 0.7, hd = box(hw, hw * 0.8, hw, S.steel); hd.position.y = hw * 0.4 + 0.1; g.add(hd); // head, glowing eyes, arms down the sides
    const nk = box(hw * 0.4, 0.12, hw * 0.4, S.rail); nk.position.y = 0.06; g.add(nk);
    for (const x of [-1, 1]) { const e = box(hw * 0.2, hw * 0.14, 0.04, S.tip, false); e.position.set(x * hw * 0.22, hw * 0.5 + 0.1, -hw / 2 - 0.02); g.add(e);
      const ear = cyl(0.1, 0.12, S.roofRed); ear.rotation.z = Math.PI / 2; ear.position.set(x * (hw / 2 + 0.06), hw * 0.4 + 0.1, 0); g.add(ear);
      const arm = box(0.2, 1.6, 0.24, S.steel); arm.position.set(x * (w / 2 + 0.16), -0.9, 0); g.add(arm);
      const hand = box(0.3, 0.22, 0.3, S.rail); hand.position.set(x * (w / 2 + 0.16), -1.8, 0); g.add(hand); }
    const mo = box(hw * 0.5, 0.05, 0.04, S.found, false); mo.position.set(0, hw * 0.22 + 0.1, -hw / 2 - 0.02); g.add(mo);
    rod(0.4, hw * 0.8 + 0.3); tip(hw * 0.8 + 0.5); return { g, flagY: hw * 0.8 + 0.4 }; }
  if (kind === 'wings') { const hd = box(w * 0.8, 0.5, d * 0.8, S.roofRed); hd.position.y = 0.25; g.add(hd); // totem thunderbird
    const bk = part(cone(0.14, 0.4, 4), S.gold); bk.rotation.x = -Math.PI / 2; bk.position.set(0, 0.2, -d * 0.4 - 0.2); g.add(bk);
    for (const x of [-1, 1]) { const wg = box(w * 1.1, 0.12, d * 0.5, S.onion); wg.position.set(x * w * 0.85, 0.45, 0); wg.rotation.z = x * 0.35; g.add(wg);
      const e = box(0.12, 0.12, 0.04, S.tip, false); e.position.set(x * w * 0.18, 0.32, -d * 0.4 - 0.02); g.add(e); }
    return { g, flagY: 0.85 }; }
  if (kind === 'gable') { for (let k = 0; k < 4; k++) { const b = box(w * (1 - k * 0.24), 0.26, d, S.concrete); b.position.y = 0.13 + k * 0.26; g.add(b); } // stepped Dutch gable
    const hb = box(0.06, 0.06, 0.3, S.found); hb.position.set(0, 0.95, -d / 2 - 0.1); g.add(hb); tip(1.12); return { g, flagY: 1.2 }; }
  // triangular ridge along z (k = steepness), same construction as the pediment
  const ridge = (k, m) => { const R = w * 0.62, p = part(cached(`rdg${w.toFixed(2)},${d.toFixed(2)},${k}`, () => new THREE.CylinderGeometry(R, R, d * 1.06, 3, 1).rotateX(-Math.PI / 2).scale(1, k, 1)), m); p.position.y = R * 0.5 * k; g.add(p); return R * 1.5 * k; };
  if (kind === 'flame') { rod(0.2, 0.1, 0.015); const f = part(cached('flame', () => new THREE.SphereGeometry(0.2, 14, 10).scale(1, 2, 1).translate(0, 0.4, 0)), S.flame, false); // candle: flickering flame
    f.position.y = 0.15; g.add(f); g.userData.flame = f; return { g, flagY: 1.1 }; }
  if (kind === 'leaves') { for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, l = part(cone(0.16, 1.1, 4), S.leaf); // pineapple crown
      l.position.set(Math.cos(a) * w * 0.15, 0.45, Math.sin(a) * w * 0.15); l.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); g.add(l); }
    const c = part(cone(0.18, 1.5, 4), S.leaf2); c.position.y = 0.75; g.add(c); return { g, flagY: 1.6 }; }
  if (kind === 'pitch') { const h = ridge(1.1, S.clock), ch = box(0.3, 0.7, 0.3, S.roofRed); ch.position.set(w * 0.25, h * 0.6, d * 0.2); g.add(ch); tip(h + 0.05); return { g, flagY: h + 0.1 }; } // gingerbread: icing roof + chimney
  if (kind === 'gambrel') { const R = w * 0.55, o = part(cached(`gam${w.toFixed(2)},${d.toFixed(2)}`, () => new THREE.CylinderGeometry(R, R, d * 1.04, 4, 1, false, Math.PI / 2, Math.PI).rotateX(Math.PI / 2)), S.rail); g.add(o); // barn: half an octagon = steep lower + shallow upper slope
    const hl = box(w * 0.28, w * 0.24, 0.05, S.clock, false); hl.position.set(0, R * 0.4, -d * 0.52 - 0.02); g.add(hl); tip(R + 0.05); return { g, flagY: R + 0.1 }; }
  if (kind === 'solar') { const b = box(w * 0.8, 0.5, w * 0.8, S.steel); b.position.y = 0.25; g.add(b); // satellite: body, 2 solar wings, dish
    for (const x of [-1, 1]) { const st = box(0.9, 0.06, 0.06, S.rail); st.position.set(x * (w * 0.4 + 0.45), 0.3, 0); g.add(st);
      const pn = box(2.0, 0.04, 0.8, S.solar); pn.position.set(x * (w * 0.4 + 1.9), 0.3, 0); g.add(pn); }
    const dsh = cyl(0.35, 0.04, S.clock); dsh.rotation.x = -0.9; dsh.position.set(0, 0.75, -0.2); g.add(dsh); rod(0.6, 0.8); tip(1.12); return { g, flagY: 1.0 }; }
  if (kind === 'stupa') { const R = w * 0.45; g.add(part(hemi(R, 'st'), S.clock)); const h = box(R * 0.5, 0.3, R * 0.5, S.gold); h.position.y = R + 0.1; g.add(h); // bell dome, harmika, ring spire
    for (let k = 0; k < 7; k++) { const rg = part(prism(0.3 * (1 - k * 0.12), 0.1, 16), S.gold); rg.position.y = R + 0.3 + k * 0.14; g.add(rg); } tip(R + 1.35); return { g, flagY: R + 1.3 }; }
  if (kind === 'gothic') { const c = part(cone(w * 0.42, 2.4, 8), S.concrete); c.position.y = 1.2; g.add(c); // central spire + 4 corner pinnacles
    for (const x of [-1, 1]) for (const z of [-1, 1]) { const b = box(0.24, 0.3, 0.24, S.concrete); b.position.set(x * (w / 2 - 0.12), 0.15, z * (d / 2 - 0.12)); g.add(b);
      const p = part(cone(0.14, 0.9, 4), S.concrete); p.position.set(x * (w / 2 - 0.12), 0.75, z * (d / 2 - 0.12)); g.add(p); }
    tip(2.45); return { g, flagY: 2.3 }; }
  if (kind === 'deco') { let y = 0; for (let k = 0; k < 4; k++) { const sz = w * (0.9 - 0.18 * k), t = box(sz, 0.36, sz, S.steel); t.position.y = y + 0.18; g.add(t); // art deco crown: shrinking tiers with sunburst arcs
      for (let j = 0; j < 4; j++) { const f = new THREE.Group(); f.rotation.y = j * Math.PI / 2; g.add(f); const a = part(arc(sz * 0.35), S.clock, false); a.position.set(0, y + 0.02, -sz / 2 - 0.03); f.add(a); }
      y += 0.36; }
    const nd = part(cone(0.07, 1.6, 8), S.steel); nd.position.y = y + 0.8; g.add(nd); tip(y + 1.62); return { g, flagY: y + 1.5 }; }
  if (kind === 'trophy') { const st = cyl(0.12, 0.4, S.gold); st.position.y = 0.2; g.add(st); // cup on a stem + 2 handles
    const cup = part(cached(`cup${w.toFixed(2)}`, () => new THREE.LatheGeometry([[0, 0], [0.22, 0], [0.1, 0.1], [0.42, 0.4], [0.5, 0.95], [0, 0.95]].map(([x, y]) => new THREE.Vector2(x * w, y * w)), 16)), S.gold); cup.position.y = 0.4; g.add(cup);
    for (const x of [-1, 1]) { const hd = part(cached(`hdl${w.toFixed(2)}`, () => new THREE.TorusGeometry(w * 0.18, 0.05, 8, 20)), S.gold); hd.position.set(x * w * 0.5, 0.4 + w * 0.6, 0); g.add(hd); }
    return { g, flagY: 0.4 + w * 1.1 }; }
  if (kind === 'turbine') { const nc = box(0.34, 0.34, 0.8, S.clock); nc.position.y = 0.17; g.add(nc); // wind turbine: nacelle + 3 long spinning blades
    const hub = part(cone(0.16, 0.3, 12), S.clock); hub.rotation.x = -Math.PI / 2; hub.position.set(0, 0.17, -0.55); g.add(hub);
    const spin = new THREE.Group(); spin.position.set(0, 0.17, -0.5); g.add(spin); g.userData.spin = spin;
    for (let k = 0; k < 3; k++) { const arm = new THREE.Group(); arm.rotation.z = k * Math.PI * 2 / 3; spin.add(arm); const b = box(0.16, 2.6, 0.04, S.sail); b.position.y = 1.35; arm.add(b); }
    return { g, flagY: 0.5 }; }
  if (kind === 'cactus') { g.add(part(hemi(w / 2, 'c'), body)); // rounded top + 2 arms elbowing up, in the trunk's color
    for (const [x, y] of [[1, -1.6], [-1, -2.6]]) { const r = w * 0.2, h = cyl(r, 0.6, body); h.rotation.z = Math.PI / 2; h.position.set(x * (w / 2 + 0.25), y, 0); g.add(h);
      const v = cyl(r, 1.2, body); v.position.set(x * (w / 2 + 0.5), y + 0.55, 0); g.add(v); const cp = part(hemi(r, 'c'), body); cp.position.set(x * (w / 2 + 0.5), y + 1.15, 0); g.add(cp); }
    tip(w / 2 + 0.05); return { g, flagY: w / 2 + 0.1 }; }
  if (kind === 'studs') { const k = w > 1.8 ? 3 : 2, sp = w / k; // lego studs in the top floor's color
    for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) { const st = cyl(sp * 0.3, 0.26, body); st.position.set((a - (k - 1) / 2) * sp, 0.13, (b - (k - 1) / 2) * sp); g.add(st); }
    return { g, flagY: 0.4 }; }
  rod(0.8, 0.4, 0.015); tip(0.82); return { g, flagY: 0.7 }; // 'pole'
}

// Landmark: floors × phases, scaffold that follows the current floor, crane, roof + flag on clear. Front face is -z.
export function makeLandmark({ type = 'tower', gen = null, floors = 5, hitsPerPhase = 2 } = {}) {
  const T = type === 'gen' ? gen : TYPES[type], F = T.F, n = floors, sides = T.sides ?? 4, B = T.base ?? BASE;
  const g = new THREE.Group();
  const total = n * PH * hitsPerPhase;
  const own = []; // materials to dispose
  const matCache = new Map();
  const matFor = c => { if (!matCache.has(c)) { const m = T.glass ? toon(c, c, 0.25) : toon(c); matCache.set(c, m); own.push(m); } return matCache.get(c); };
  const L = T.light ?? CYAN, win = toon(0x0b1a2e, L, 0.4), off = toon(0x0b1a2e, L, 0.12); own.push(win, off);

  // ---- floors ----
  const fl = [];
  for (let i = 0; i < n; i++) {
    const w = T.size(i, n), d = T.span ? 1.2 : w * (T.dr ?? 1), color = T.color(i, n), [ox, oz] = T.shift?.(i) ?? [0, 0];
    const c = T.span ? new THREE.Vector3((i - (n - 1) / 2) * w, T.deck + F / 2, 0) : new THREE.Vector3(ox, B + i * F + F / 2, oz);
    const feet = T.span ? c.y - 0.18 : c.y - F / 2; // where a worker stands so its hammer (feet+0.18) meets the face
    const rad = sides > 4 ? w / 2 : T.twist ? Math.hypot(w, d) / 2 : Math.max(w, d) / 2, front = sides > 4 || T.twist ? rad : d / 2, side = sides > 4 || T.twist ? rad : w / 2; // bounding radius, -z / -x face distance
    const grp = new THREE.Group(); grp.position.copy(c); grp.rotation.y = (T.twist ?? 0) * i; g.add(grp);
    const parts = floorParts(T, i, sides, w, d, F, matFor(color), [win, off], c.y);
    grp.add(...parts);
    fl.push({ g: grp, parts, phase: 0, w, d, rad, front, side, feet, color, c });
  }
  if (!T.span) for (let k = 0, m = T.steps ?? 1, h = B / m; k < m; k++) { // foundation; steps > 1 = stepped plinth
    const p = (m - 1 - k) * 0.3, found = box(fl[0].w + 0.6 + p, h, fl[0].d + 0.6 + p, S.found); found.position.y = h * (k + 0.5); found.receiveShadow = true; g.add(found); }

  // ---- roof + flag (appear on clear) ----
  const last = fl[n - 1], topY = T.span ? T.deck + F : B + n * F, tx = T.span ? 0 : last.c.x, tz = T.span ? 0 : last.c.z;
  const { g: roof, flagY } = makeRoof(T.roof, last.w, last.d, sides, n * last.w, matFor(last.color)); roof.position.set(tx, topY, tz); roof.rotation.y = (T.twist ?? 0) * (n - 1); g.add(roof);
  if (T.guys) { const R = Math.min(4.2, topY * 0.35); // mast: 3 guy wires from top and 60 % height to ground anchors
    for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + 0.5, c = Math.cos(a), sn = Math.sin(a), gnd = new THREE.Vector3(c * R, -topY, sn * R);
      for (const y of [0, -topY * 0.4]) roof.add(wire(new THREE.Vector3(c * last.w / 2, y, sn * last.w / 2), gnd));
      const an = box(0.2, 0.12, 0.2, S.found); an.position.copy(gnd).y += 0.06; roof.add(an); } }
  const flag = box(0.3, 0.18, 0.02, S.flag, false); flag.position.set(tx + 0.17, topY + flagY, tz); g.add(flag);
  const top = new THREE.Vector3(tx, topY + flagY, tz);

  // ---- scaffold: decks (plank + rails + posts) in one group that follows the current floor ----
  // front = work deck; back + left wrap the building, right side is left to the crane (+x)
  const scaf = new THREE.Group(); g.add(scaf);
  const posts = [];
  const mkDeck = ry => {
    const d = new THREE.Group(); d.rotation.y = ry; scaf.add(d); // local -z = outward
    const plank = box(2.0, 0.04, 0.6, S.scaf); plank.position.y = -0.02; plank.receiveShadow = true; d.add(plank);
    const long = [plank], ps = [];
    for (const y of [0.18, 0.36]) { const rail = box(2.0, 0.03, 0.03, S.scaf); rail.position.set(0, y, -0.3); d.add(rail); long.push(rail); }
    for (const x of [-0.9, 0.9]) for (const z of [0.27, -0.3]) { const p = part(postGeo, S.scaf); p.position.set(x, 0, z); d.add(p); posts.push(p); ps.push(p); }
    return { d, len(L) { long.forEach(m => m.scale.x = L / 2); ps.forEach(p => p.position.x = Math.sign(p.position.x) * (L / 2 - 0.1)); } };
  };
  const DECK_RY = T.span ? [0] : [0, Math.PI, Math.PI / 2]; // front, back, left; also the facing of a worker standing on it
  const decks = DECK_RY.map(mkDeck);

  // ---- crane: mast grows with the build, jib slews so the hook hangs over the floor being built ----
  // tower: mast at the back-right corner, clear of every floor (lean / twist / jenga) and off the camera's line to the front.
  // bridge: mast walks behind the current span (+z), away from the work deck and the camera.
  const MX = Math.max(...fl.map(f => f.c.x + f.rad)) + 0.6, MZ = Math.max(...fl.map(f => f.c.z + f.rad)) + 0.6;
  const crane = new THREE.Group(); g.add(crane);
  // lattice mast + jib (texture repeat follows their scale), cab, counter-jib, A-frame apex with pendant lines, trolley + glowing load
  const mastM = lattice(), jibM = lattice(); own.push(mastM, jibM);
  const mast = part(mastGeo, mastM, false); crane.add(mast);
  const ctop = new THREE.Group(); crane.add(ctop);
  const jib = part(jibGeo, jibM, false); jib.position.x = 0.4; ctop.add(jib);
  const cjib = box(0.8, 0.1, 0.14, S.crane); cjib.position.set(0.6, 0, 0); ctop.add(cjib);
  const cw = box(0.3, 0.26, 0.26, S.steel); cw.position.set(0.85, -0.1, 0); ctop.add(cw);
  const cab = box(0.3, 0.26, 0.28, S.crane); cab.position.set(0.02, -0.2, 0.27); ctop.add(cab);
  const cabWin = box(0.02, 0.12, 0.2, S.hook, false); cabWin.position.set(-0.13, -0.18, 0.27); ctop.add(cabWin);
  const APEX = new THREE.Vector3(0, 0.75, 0);
  for (const z of [-1, 1]) ctop.add(wire(new THREE.Vector3(0, JW / 2, z * JW / 2), APEX)); // A-frame legs
  const beacon = part(cached('tip', () => new THREE.SphereGeometry(0.05, 10, 8)), S.tip, false); beacon.position.copy(APEX); ctop.add(beacon);
  ctop.add(wire(APEX, new THREE.Vector3(0.9, 0.05, 0)));             // back pendant to the counterweight
  const pend = wire(APEX, new THREE.Vector3(-1, 0.08, 0)); ctop.add(pend); // front pendant, re-aimed as the jib grows
  const trolley = box(0.16, 0.06, 0.18, S.steel); ctop.add(trolley);
  const cable = part(cableGeo, S.steel, false); ctop.add(cable);
  const hook = box(0.16, 0.16, 0.16, S.hook, false); ctop.add(hook);
  const PT = new THREE.Vector3();
  const setCrane = s => { // s: { ch, x, z (hook target), cx, cz (mast) }
    mast.scale.y = s.ch; ctop.position.y = s.ch; cable.scale.y = 0.85; crane.position.set(s.cx, 0, s.cz);
    const ox = s.cx - s.x, oz = s.cz - s.z, L = Math.hypot(ox, oz);
    ctop.rotation.y = Math.atan2(-oz, ox); jib.scale.x = L + 0.6; cable.position.x = hook.position.x = -L;
    trolley.position.set(-L, -JW / 2 - 0.03, 0);
    mastM.map.repeat.set(1, s.ch / MW); jibM.map.repeat.set((L + 0.6) / JW, 1);
    aim(pend, APEX, PT.set(-(L + 0.2) * 0.75, JW / 2, 0));
  };

  // ---- state ----
  let hits = 0, done = false, tt = 0;
  const cur = () => Math.min(n - 1, Math.floor(hits / (PH * hitsPerPhase)));
  const scafTarget = i => { const f = fl[i]; return { x: f.c.x, y: f.feet, z: f.c.z, fd: f.front + 0.45, sd: f.side + 0.45, ch: f.c.y + F / 2 + 1,
    cx: T.span ? f.c.x + f.w / 2 : MX, cz: T.span ? f.c.z + f.d / 2 + 0.5 : MZ }; };
  const applyScaf = (s, y) => {
    scaf.position.set(s.x, y, s.z);
    decks[0].d.position.z = -s.fd;
    if (decks[1]) { decks[1].d.position.z = s.fd; decks[2].d.position.x = -s.sd; decks[2].len(2 * (s.fd - 0.3)); } // side deck fits between front/back planks
    posts.forEach(p => { p.position.y = -y; p.scale.y = y + 0.45; });
  };

  function layout(animate) {
    const fi = Math.floor(hits / (PH * hitsPerPhase)), ph = Math.floor((hits % (PH * hitsPerPhase)) / hitsPerPhase);
    let level = 0;
    fl.forEach((f, i) => {
      const p = hits >= total || i < fi ? PH : i === fi ? ph : 0;
      f.parts.forEach((m, j) => { m.visible = j === 0 ? p === 0 : p >= j; });
      if (animate && p > f.phase) { pop(f.parts[p]); level = Math.max(level, p === PH ? 2 : 1); }
      f.phase = p;
    });
    const s = scafTarget(cur());
    if (animate && level === 2 && hits < total) {
      const s0 = scafTarget(cur() - 1), y0 = scaf.position.y, x0 = scaf.position.x, z0 = scaf.position.z, h0 = mast.scale.y;
      hook.getWorldPosition(tmpV); emit.confetti(tmpV, 40);
      tween(0.5, k => { const e = ease.out(k); applyScaf({ x: lerp(x0, s.x, e), z: lerp(z0, s.z, e), fd: lerp(s0.fd, s.fd, e), sd: lerp(s0.sd, s.sd, e) }, lerp(y0, s.y, e)); setCrane({ ch: lerp(h0, s.ch, e), x: lerp(s0.x, s.x, e), z: lerp(s0.z, s.z, e), cx: lerp(s0.cx, s.cx, e), cz: lerp(s0.cz, s.cz, e) }); });
    } else if (!animate) { applyScaf(s, s.y); setCrane(s); }
    if (hits >= total && !done) { done = true; clear(); level = 3; }
    return level;
  }
  const tmpV = new THREE.Vector3();

  function clear() {
    scaf.visible = false;
    roof.visible = true; pop(roof, 0.35);
    delay(0.3, () => { flag.visible = true; pop(flag, 0.3); });
    win.emissiveIntensity = 2.2; // > bloom threshold, but body color still reads
    const h = mast.scale.y; tween(0.8, k => crane.position.y = -h * ease.in(k), () => crane.visible = false);
    ring(new THREE.Vector3(0, 0.05, 0), new THREE.Euler(-Math.PI / 2, 0, 0), 3, 0.6);
    lightFlash(top, 15, 0.5);
    shake.amt = 0.12;
    fireworks(top);
  }

  function setHits(h) {
    hits = Math.min(total, h); done = false;
    fl.forEach(f => f.phase = 0);
    roof.visible = flag.visible = false; scaf.visible = crane.visible = true; crane.position.y = 0; win.emissiveIntensity = 0.4;
    layout(false);
  }
  setHits(0);
  // rise in: blueprint floors pop up one after another
  fl.forEach((f, i) => { f.g.scale.setScalar(0.001); delay(0.06 * i + 0.01, () => pop(f.g, 0.3)); });

  return {
    group: g, total, top, type,
    get hits() { return hits; }, get done() { return done; },
    current: cur, floorY: () => fl[cur()].feet, color: () => fl[cur()].color,
    bounds() { const b = new THREE.Box3(); for (const f of fl) { b.expandByPoint(new THREE.Vector3(f.c.x - f.rad, 0, f.c.z - f.rad)); b.expandByPoint(new THREE.Vector3(f.c.x + f.rad, f.c.y + F / 2, f.c.z + f.rad)); } b.max.y = Math.max(b.max.y, top.y + 0.2); return b; },
    decks: DECK_RY.length,
    // spot on deck `side` + the facing that points the hammer at the wall. outward = (-sin, -cos), lateral = (cos, -sin)
    stand(slot, reach, side = 0) {
      const f = fl[cur()], face = DECK_RY[side], s = Math.sin(face), c = Math.cos(face);
      const o = (side === 2 ? f.side : f.front) + reach, lat = slot * Math.min(0.5, (side === 2 ? f.d : f.w) / 3);
      return { at: new THREE.Vector3(f.c.x - s * o + c * lat, 0, f.c.z - c * o - s * lat), face };
    },
    setHits,
    // returns { level, color }: 0 hit · 1 phase pop · 2 floor done · 3 clear
    addHits(k = 1) {
      if (done) return { level: 0, color: fl[cur()].color };
      const color = fl[cur()].color;
      hits = Math.min(total, hits + k); punch(fl[cur()].g);
      return { level: layout(true), color };
    },
    update(dt) { tt += dt; if (roof.userData.spin) roof.userData.spin.rotation.z -= dt * 1.2; if (roof.userData.flame) roof.userData.flame.scale.y = 1 + 0.12 * Math.sin(tt * 13) + 0.05 * Math.sin(tt * 31); bpMat.opacity = 0.5 + 0.12 * Math.sin(tt * 3); hook.position.y = -0.85 + Math.sin(tt * 1.5) * 0.03; },
    dispose() { g.parent?.remove(g); own.forEach(m => { m.map?.dispose(); m.dispose(); }); release(g); },
  };
}
