// Three.js view of the race: renderer, scene per track, split-screen views, karts, fx, cameras.
// Reads sim state, never writes it. DESIGN.md §13–§15.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { Pass } from 'three/addons/postprocessing/Pass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { frameAt, at, WALL_PAD, DRIFT_BIAS, overWater, moverD, MOVER_T, MOVER_H } from './sim.js';
import { makeRacer, SPECIES, crown } from './animals.js';
import { GRID_T, FLY_T, WARP_T, ROLL_T } from './sim.js';

export const touch = matchMedia('(pointer: coarse)').matches;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const DEBUG = new URLSearchParams(location.search).has('debug');

let renderer, scene, canvas;
let W = 1, H = 1, dprCap = touch ? 1.5 : 2;
// quality tiers (DESIGN §15): High on desktop, Medium on touch; the frame loop steps down one tier for the session
// when the smoothed frame time stays above ~38 ms for 2 s, unless Settings pins a tier
export const TIERS = {
  high: { dpr: 2, bloom: true, shadows: true, outlines: true, fx: 1500, props: 1 },
  medium: { dpr: 1.5, bloom: false, shadows: false, outlines: true, fx: 1000, props: 0.75 },
  low: { dpr: 1, bloom: false, shadows: false, outlines: false, fx: 600, props: 0.5 },
};
export let tier = touch ? 'medium' : 'high';
let composer = null, bloomPass = null, shadowsOn = false, key = null;
export const GLOW = 2.8; // neon / emissive colours run hotter than 1 so only they cross the bloom threshold, never the faces
const views = [];
let trackObj = null, T = null, time = 0;

// scratch objects: nothing is allocated per frame
const fr = { pos: [0, 0, 0], tan: [0, 0, 0], right: [0, 0, 0], up: [0, 0, 0] };
const P = new THREE.Vector3(), F = new THREE.Vector3(), U = new THREE.Vector3(), X = new THREE.Vector3(), R3 = new THREE.Vector3();
const M = new THREE.Matrix4(), M2 = new THREE.Matrix4(), C = new THREE.Color(), RUNG = new THREE.Color('#4fd8ff'), WHITE = new THREE.Color('#fff');
const v3 = a => new THREE.Vector3(a[0], a[1], a[2]);

export function init(cv) {
  canvas = cv;
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !touch, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.setScissorTest(true);
  renderer.shadowMap.enabled = !touch; // flipping this later recompiles every material, so only desktops start with it
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false; // rendered once per frame, not once per view
  renderer.debug.checkShaderErrors = DEBUG; // the check stalls on every compile, and ANGLE's D3D warnings are noise
  scene = new THREE.Scene();
  scene.matrixWorldAutoUpdate = false; // updated once per frame in render(), not once per view
  const pm = new THREE.PMREMGenerator(renderer);
  pm.dispose();
  scene.environment = envFor('room');
  scene.environmentIntensity = 0.45;
  resize();
  addEventListener('resize', resize);
  return renderer;
}

export let stale = true; // resized (cleared) or re-split since the last render: a paused race draws once more
export function resize() {
  W =canvas.clientWidth || innerWidth; H = canvas.clientHeight || innerHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, dprCap) * dprScale);
  renderer.setSize(W, H, false);
  if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(W, H); }
  layout();
}

// ---------- textures drawn once to canvases ----------
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const skyTex = cols => canvasTex(2, 256, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  cols.forEach((c, i) => gr.addColorStop(i / (cols.length - 1), c));
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
});
// the road reads as a ladder laid flat: one faint rung across every 4 m tile, bright edge lines down both sides
const roadTex = th => canvasTex(th.lacquer ? 256 : 128, th.lacquer ? 512 : 256, (g, w, h) => {
  g.fillStyle = th.road; g.fillRect(0, 0, w, h);
  if (th.lacquer) { // red lacquer, one tile per 8 m (repeat.y 0.5): dark rungs edged in gold every 4 m, a gold lotus stamped between every other pair
    for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(255,190,150,${0.025 + Math.random() * 0.03})`; g.fillRect(20 + Math.random() * (w - 40), 0, 2 + Math.random() * 6, h); }
    for (const y of [0, h / 2]) { g.fillStyle = 'rgba(30,4,6,.6)'; g.fillRect(16, y, w - 32, 26); g.fillStyle = 'rgba(255,200,110,.7)'; g.fillRect(16, y, w - 32, 3); g.fillRect(16, y + 23, w - 32, 3); }
    g.save(); g.translate(w / 2, h / 4 + 10); g.scale(1, 3.6); g.fillStyle = 'rgba(232,170,70,.62)'; // texels are 3.6x taller than wide on the road
    for (const [x, y, rx, ry, a] of [[0, -6, 4.5, 9, 0], [-7, -4, 4, 8, -0.55], [7, -4, 4, 8, 0.55], [-12, -1, 3.5, 6.5, -1.1], [12, -1, 3.5, 6.5, 1.1], [0, 4, 14, 2.4, 0]]) { g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, 7); g.fill(); }
    g.restore();
    g.fillStyle = th.edge; g.fillRect(6, 0, 12, h); g.fillRect(w - 18, 0, 12, h);
    g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(10, 0, 4, h); g.fillRect(w - 14, 0, 4, h);
    return;
  }
  if (th.day) { // dirt: speckles and two wheel ruts, a faint rung across each tile, grass fringe at the edges
    for (let i = 0; i < 900; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(120,80,40,.18)' : 'rgba(255,240,210,.18)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    g.fillStyle = 'rgba(110,70,35,.16)'; g.fillRect(30, 0, 14, h); g.fillRect(w - 44, 0, 14, h);
    g.fillStyle = 'rgba(255,246,220,.35)'; g.fillRect(10, 124, w - 20, 8);
    g.fillStyle = '#86c46a'; g.fillRect(0, 0, 5, h); g.fillRect(w - 5, 0, 5, h);
    return;
  }
  const sheen = g.createLinearGradient(0, 0, w, 0);
  sheen.addColorStop(0, 'rgba(255,255,255,.05)'); sheen.addColorStop(0.5, 'rgba(255,255,255,0)'); sheen.addColorStop(1, 'rgba(255,255,255,.05)');
  g.fillStyle = sheen; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.075)'; g.fillRect(12, 118, w - 24, 20);
  g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(12, 118, w - 24, 2); g.fillRect(12, 136, w - 24, 2);
  g.fillStyle = th.edge; g.fillRect(3, 0, 6, h); g.fillRect(w - 9, 0, 6, h);
  g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(5, 0, 2, h); g.fillRect(w - 7, 0, 2, h);
});
const blobTex = () => canvasTex(64, 64, (g, w) => {
  const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  r.addColorStop(0, 'rgba(0,0,0,.6)'); r.addColorStop(0.55, 'rgba(0,0,0,.35)'); r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r; g.fillRect(0, 0, w, w);
}, false);
const checkerTex = () => canvasTex(64, 8, (g) => {
  for (let x = 0; x < 16; x++) for (let y = 0; y < 2; y++) { g.fillStyle = (x + y) % 2 ? '#fff' : '#120a2a'; g.fillRect(x * 4, y * 4, 4, 4); }
});

// ---------- track geometry ----------
// a ribbon along the table: 2 verts per sample (left, right edge), uv.v in 4 m tiles (rounded so the seam tiles cleanly)
function ribbon(T, offL, offR, lift = 0, tile = 4) {
  const n = T.n, pos = new Float32Array((n + 1) * 6), nor = new Float32Array((n + 1) * 6), uv = new Float32Array((n + 1) * 4), idx = [];
  const reps = Math.round(T.L / tile);
  for (let i = 0; i <= n; i++) {
    const j = i % n, hw = T.half[j];
    for (let side = 0; side < 2; side++) {
      const o = side ? hw + offR : -(hw + offL), b = (i * 2 + side) * 3;
      for (let c = 0; c < 3; c++) {
        pos[b + c] = T.pos[j * 3 + c] + T.right[j * 3 + c] * o + T.up[j * 3 + c] * lift;
        nor[b + c] = T.up[j * 3 + c];
      }
      uv[(i * 2 + side) * 2] = side; uv[(i * 2 + side) * 2 + 1] = i * reps / n;
    }
    if (i < n && !overWater(T, i * T.ds)) { const a = i * 2; idx.push(a, a + 1, a + 3, a, a + 3, a + 2); } // bridges: planks instead of road
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}
// side skirts from the road edges down to the floor, so raised sections read as solid toy track
function skirts(T, floor, slab) { // slab: a floating track only this thick, no floor under it
  const n = T.n, pos = [], idx = [];
  for (let side = -1; side <= 1; side += 2) {
    const base = pos.length / 3;
    for (let i = 0; i <= n; i++) {
      const j = i % n, o = side * (T.half[j] + 0.2);
      const x = T.pos[j * 3] + T.right[j * 3] * o, y = T.pos[j * 3 + 1] + T.right[j * 3 + 1] * o, z = T.pos[j * 3 + 2] + T.right[j * 3 + 2] * o;
      pos.push(x, y - 0.05, z, x, slab ? y - slab : floor, z);
      if (i < n) { const a = base + i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
// neon rails: core tube + additive mid and halo tubes (Ladder glow(): outer .13, mid .32, core 1 with a white centre).
// Each side merged into one geometry per layer with vertex colours, so the rails cost 3 draw calls in all
// the road's rail line, in runs: one closed loop, or open runs broken where a bridge crosses water
function railRuns(T) {
  const runs = [], step = 2;
  if (!T.water.length) return [{ idx: Array.from({ length: Math.floor(T.n / step) }, (_, j) => j * step), closed: true }];
  let cur = null;
  for (let j = 0; j < T.n; j += step) {
    if (overWater(T, j * T.ds)) { cur = null; continue; }
    if (!cur) runs.push(cur = { idx: [], closed: false });
    cur.idx.push(j);
  }
  if (runs.length > 1 && runs[0].idx[0] === 0 && !overWater(T, (T.n - 1) * T.ds)) { const last = runs.pop(); runs[0].idx = [...last.idx, ...runs[0].idx]; } // join across the finish line
  return runs.filter(r => r.idx.length > 2);
}
const railOff = (T, i) => T.half[i] + T.shoulder + WALL_PAD - 0.15;
function rails(T, th) {
  const palette = th.rails.map(c => new THREE.Color(c)), runs = railRuns(T);
  const radii = th.wood || th.lacquer ? [th.lacquer ? 0.14 : 0.16] : [0.11, 0.24, 0.5];
  const layers = radii.map(() => []);
  for (let side = -1; side <= 1; side += 2) for (const run of runs) {
    const pts = run.idx.map(i => {
      frameAt(T, i * T.ds, fr);
      const o = side * railOff(T, i), hgt = th.wood || th.lacquer ? 0.8 : 0.55;
      return new THREE.Vector3(fr.pos[0] + fr.right[0] * o + fr.up[0] * hgt, fr.pos[1] + fr.right[1] * o + fr.up[1] * hgt, fr.pos[2] + fr.right[2] * o + fr.up[2] * hgt);
    });
    const curve = new THREE.CatmullRomCurve3(pts, run.closed, 'centripetal'), segs = pts.length;
    radii.forEach((r, li) => {
      const radial = li ? 6 : 8, g = new THREE.TubeGeometry(curve, segs, r, radial, run.closed);
      const count = g.attributes.position.count, col = new Float32Array(count * 3), ring = radial + 1;
      for (let v = 0; v < count; v++) {
        const along = Math.floor(v / ring) / segs, pc = palette[Math.floor(along * 14) % palette.length];
        C.copy(pc); if (!li && !th.wood && !th.lacquer) C.lerp(WHITE, 0.45).multiplyScalar(GLOW); // core runs white-hot
        col[v * 3] = C.r; col[v * 3 + 1] = C.g; col[v * 3 + 2] = C.b;
      }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      layers[li].push(g);
    });
  }
  const mk = (li, mat) => new THREE.Mesh(mergeGeometries(layers[li]), mat);
  if (th.wood) return [mk(0, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: toonRamp() }))];
  if (th.lacquer) return [mk(0, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.18, metalness: 0.1, envMapIntensity: 1.2 }))];
  const add = o => new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, fog: true });
  const out = [mk(0, new THREE.MeshBasicMaterial({ vertexColors: true })), mk(1, add(0.32)), mk(2, add(0.13))];
  out[1].userData.glow = 0.32; out[2].userData.glow = 0.13; // the soft layers: full on Medium / Low, faint under bloom
  return out;
}
let TOON = null;
function toonRamp() { // 3-step ramp for the storybook's flat watercolour shading
  if (TOON) return TOON;
  const d = new Uint8Array([90, 90, 90, 255, 180, 180, 180, 255, 255, 255, 255, 255]);
  TOON = new THREE.DataTexture(d, 3, 1); TOON.minFilter = TOON.magFilter = THREE.NearestFilter; TOON.needsUpdate = true;
  return TOON;
}
// orient an object on the track frame at s (x = right, y = up, z = forward), d metres off the centre, h up
function place(o, T, s, d = 0, h = 0) {
  frameAt(T, s, fr);
  X.fromArray(fr.right); U.fromArray(fr.up); F.fromArray(fr.tan);
  P.fromArray(fr.pos).addScaledVector(X, d).addScaledVector(U, h);
  M.makeBasis(X, U, F).setPosition(P);
  o.matrix.copy(M); o.matrix.decompose(o.position, o.quaternion, o.scale);
  return o;
}
// ladder gate over the finish line: two neon rails rising 6 m, glowing rungs across the top, the top rung checkered
function gate(T, th) {
  const g = new THREE.Group(), w = at(T, T.half, 0) + WALL_PAD + 0.4, pink = new THREE.Color(th.rails[0]).multiplyScalar(GLOW), cyan = new THREE.Color(th.rails[2]).multiplyScalar(GLOW);
  const tint = (geo, c) => { const n = geo.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) a.set([c.r, c.g, c.b], i * 3); geo.setAttribute('color', new THREE.BufferAttribute(a, 3)); return geo; };
  const core = [], halos = [];
  for (const side of [-1, 1]) {
    core.push(tint(new THREE.CylinderGeometry(0.22, 0.22, 7, 10).translate(side * w, 3.5, 0), pink));
    halos.push(new THREE.CylinderGeometry(0.6, 0.6, 7, 10).translate(side * w, 3.5, 0));
  }
  for (const y of [5.1, 5.8]) core.push(tint(new THREE.CylinderGeometry(0.12, 0.12, w * 2, 8).rotateZ(Math.PI / 2).translate(0, y, 0), cyan));
  g.add(new THREE.Mesh(mergeGeometries(core), new THREE.MeshBasicMaterial({ vertexColors: true })));
  g.add(new THREE.Mesh(mergeGeometries(halos), new THREE.MeshBasicMaterial({ color: th.rails[1], transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false })));
  const top = new THREE.Mesh(new THREE.BoxGeometry(w * 2, 0.6, 0.3), new THREE.MeshBasicMaterial({ map: checkerTex() }));
  top.material.map.wrapS = THREE.RepeatWrapping; top.material.map.repeat.set(Math.round(w / 1.2), 1);
  top.position.y = 6.6; g.add(top);
  place(g, T, 0);
  return g;
}
// ramp: a wedge rising to the lip at s (the sim lifts the kart along it)
function ramp(T, s, th) {
  const w = at(T, T.half, s) - 0.3, h = 0.8, l = 4;
  const v = [[-w, 0, -l], [w, 0, -l], [-w, h, 0], [w, h, 0], [-w, 0, 0], [w, 0, 0]];
  const f = [0, 3, 1, 0, 2, 3, 2, 5, 3, 2, 4, 5, 0, 4, 2, 1, 3, 5];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(f.flatMap(i => v[i]), 3));
  g.computeVertexNormals();
  const tex = canvasTex(128, 64, (c, W2, H2) => { // chevrons pointing down the track
    c.fillStyle = th.road; c.fillRect(0, 0, W2, H2);
    c.strokeStyle = '#ffb547'; c.lineWidth = 7;
    for (let x = -32; x < W2 + 32; x += 32) { c.beginPath(); c.moveTo(x, H2); c.lineTo(x + 16, 0); c.lineTo(x + 32, H2); c.stroke(); }
  });
  const uv = new Float32Array(f.length * 2);
  f.forEach((i, k) => { uv[k * 2] = (v[i][0] + w) / (2 * w) * 4; uv[k * 2 + 1] = (v[i][2] + l) / l; });
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  tex.wrapS = THREE.RepeatWrapping;
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, emissive: '#ff8a3a', emissiveIntensity: 0.12 }));
  return place(m, T, s);
}

// ---------- karts ----------
let blob = null, orbGeo = null;
function racerMesh(k) {
  const r = makeRacer(k.animal, k.color);
  r.root.matrixAutoUpdate = false;
  return { racer: r, root: r.root, prevH: 0 };
}

// ---------- track load ----------
export function loadTrack(track, karts) {
  unload();
  T = track;
  const th = T.def.theme, grp = new THREE.Group();
  scene.background = skyTex(th.sky);
  scene.environment = envFor(th.env || 'room');
  scene.fog = new THREE.Fog(th.fog, th.fogNear, th.fogFar);
  const hemi = new THREE.HemisphereLight(th.hemi[0], th.hemi[1], th.hemi[2]);
  key = new THREE.DirectionalLight(th.key[0], th.key[1]);
  key.position.set(-120, 200, 80);
  const sc = key.shadow.camera; sc.left = sc.bottom = -45; sc.right = sc.top = 45; sc.near = 1; sc.far = 300;
  key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.04;
  grp.add(hemi, key, key.target);

  const rt = roadTex(th);
  rt.wrapT = THREE.RepeatWrapping;
  if (th.lacquer) rt.repeat.y = 0.5;
  rt.anisotropy = Math.min(tier === 'high' ? 16 : 4, renderer.capabilities.getMaxAnisotropy()); // 16x made the road ~35% dearer than 4x
  const road = new THREE.Mesh(ribbon(T, 0.15, 0.15), new THREE.MeshStandardMaterial(th.roadGloss ? { map: rt, roughness: 0.16, metalness: 0.55, envMapIntensity: 1.1 }
    : th.lacquer ? { map: rt, roughness: 0.3, metalness: 0.1, envMapIntensity: 0.9 } : { map: rt, roughness: 0.62, metalness: 0.05, envMapIntensity: 0.18 }));
  road.receiveShadow = true;
  const floor = -0.4;
  const skirt = th.day ? null : new THREE.Mesh(skirts(T, floor, th.slab), new THREE.MeshStandardMaterial({ color: th.slab ? '#120b2e' : th.lacquer ? '#4a1410' : '#1d1240', roughness: 0.7, side: THREE.DoubleSide, emissive: th.slab ? '#2a1660' : '#000000', emissiveIntensity: 0.5 }));
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: th.ground, roughness: 0.95 }));
  ground.position.y = floor;
  ground.visible = !!th.ground && !th.day; // day tracks bring their own terrain
  const rl = rails(T, th);
  grp.add(road, ground, ...rl, gate(T, th));
  if (skirt) grp.add(skirt);
  for (const s of T.ramps) grp.add(ramp(T, s, th));

  // rung boost strips: static bars, a chase light runs across them (instance colours, no geometry updates)
  if (T.rungs.length) {
    const rm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.05, 0.45), new THREE.MeshBasicMaterial({ toneMapped: false }), T.rungs.length);
    const o = new THREE.Object3D();
    T.rungs.forEach((s, j) => { place(o, T, s, 0, 0.03); o.scale.set(at(T, T.half, s) * 2 - 0.6, 1, 1); o.updateMatrix(); rm.setMatrixAt(j, o.matrix); rm.setColorAt(j, C.set('#4fd8ff')); });
    rm.userData.rungs = true;
    grp.add(rm);
    trackObj = { grp, rungs: rm };
  } else trackObj = { grp, rungs: null };

  buildGimmicks(grp);
  trackObj.shadows = new THREE.InstancedMesh(new THREE.PlaneGeometry(2.2, 2.9).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: blob ||= blobTex(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), karts.length);
  trackObj.shadows.frustumCulled = false;
  grp.add(trackObj.shadows);
  dress[T.id]?.(grp, TIERS[tier].props);
  trackObj.karts = karts.map(k => {
    const m = racerMesh(k);
    m.racer.outlines(TIERS[tier].outlines);
    m.racer.root.traverse(o => { if (o.isMesh && o.material.side !== THREE.BackSide) o.castShadow = true; });
    grp.add(m.root);
    return m;
  });
  buildTrails(grp, karts);
  prewarmFx();
  singlePass(grp);
  trackObj.halos = rl.slice(1);
  haloLevel();
  scene.add(grp);
  time = 0;
  applyShadows();
  // compile every shader now (effects included), so the first bomb or bubble doesn't stall the race
  const cam = new THREE.PerspectiveCamera(70, 1.6, 0.1, 420);
  renderer.compile(scene, cam);
  if (TIERS[tier].bloom) { ensureComposer(); }
  for (const o of warmed) o.visible = false;
  warmed.length = 0;
}
// the effects normally built on first use: build one of each up front (visible, so compile() sees them)
const warmed = [];
function prewarmFx() {
  const m = trackObj.karts[0];
  m.orb = new THREE.Mesh(orbGeo ||= new THREE.SphereGeometry(1.4, 20, 14), new THREE.MeshBasicMaterial({ color: '#bfeaff', transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  m.orb.matrixAutoUpdate = false; trackObj.grp.add(m.orb); warmed.push(m.orb);
  bubbleStep(m, { bubble: 5 }, M.identity(), 0); warmed.push(m.bub);
  const b = bombMesh(); G5.bombs.push(b); warmed.push(b);
  onEvent({ type: 'blast', k: 0, x: 0, s: 0, d: 0 }, { karts: [] }); const bl = G5.blasts[0]; bl.t = 1; warmed.push(bl.ring, bl.star);
  label(0, ' ', '#fff'); labels.forEach(l => { l.t = 1; warmed.push(l.sprite); });
  G5.spot = spotMesh(); warmed.push(G5.spot);
  fx.n = 0;
}
const spotMesh = () => { const s = new THREE.Mesh(new THREE.ConeGeometry(2.2, 9, 24, 1, true).translate(0, 4.5, 0).rotateX(Math.PI), new THREE.MeshBasicMaterial({ color: SPOT, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, forceSinglePass: true })); G5.grp.add(s); return s; };
function haloLevel() { for (const m of trackObj?.halos || []) m.material.opacity = m.userData.glow * (TIERS[tier].bloom ? 0.35 : 1); }
export function unload() {
  if (!trackObj) return;
  scene.remove(trackObj.grp);
  trackObj.grp.traverse(o => {
    if (o.userData.shared) return;
    o.geometry?.dispose();
    for (const m of [].concat(o.material || [])) { if (!m.userData.sharedMap) m.map?.dispose(); m.dispose(); }
  });
  trackObj.karts.forEach(m => m.racer.dispose());
  scene.background?.dispose?.();
  fx.n = 0; shake.length = 0; trails = null; petals = null;
  for (const p of pillars) p.t = 1;
  trackObj = null;
}

// transparent double-sided materials: three draws them in two passes (back, then front), flipping side + needsUpdate on
// every draw, which re-resolves the shader program each time. Our cards, halos and glows look the same in one pass
function singlePass(root) { root.traverse(o => { for (const m of [].concat(o.material || [])) if (m.transparent && m.side === THREE.DoubleSide) m.forceSinglePass = true; }); }

// ---------- views & cameras ----------
// one camera per human; P1..P4 keep their viewport position
export function setShot(o) {
  views.length = 0;
  views.push({ shot: o, p: 0, kart: 0, cam: new THREE.PerspectiveCamera(o.fov, 1, 0.3, 1200), pos: new THREE.Vector3(), look: new THREE.Vector3(), dir: new THREE.Vector3(0, 0, 1), x: 0, y: 0, w: 1, h: 1 });
  layout();
}
export function setCinematic() {
  views.length = 0;
  views.push({ cine: true, p: 0, kart: 0, cam: new THREE.PerspectiveCamera(42, 1, 0.5, 900), pos: new THREE.Vector3(), look: new THREE.Vector3(), dir: new THREE.Vector3(0, 0, 1), snap: true, x: 0, y: 0, w: 1, h: 1 });
  layout();
}
let dprScale = 1; // the title backdrop renders at reduced resolution behind the menus
export function setDprScale(s) { if (s !== dprScale) { dprScale = s; resize(); } }
export function setViews(humans) {
  views.length = 0;
  humans.forEach((kartIndex, p) => views.push({ p, kart: kartIndex, cam: new THREE.PerspectiveCamera(70, 1, 0.1, 420), pos: new THREE.Vector3(), look: new THREE.Vector3(), dir: new THREE.Vector3(0, 0, 1), fov: 70, snap: true, x: 0, y: 0, w: 1, h: 1 }));
  layout();
}
// split screen (DESIGN §6): 1 full; 2 halves, whichever split gives views closer to 1.6:1 (log space, ties top/bottom)
// unless Settings forces one; 3-4 a 2x2 grid (3P: the 4th quadrant is the big minimap). P1 stays top / left / top-left
let layoutPref = 'auto';
export function setLayoutPref(p) { layoutPref = p; layout(); }
export let onLayout = null;
export const setOnLayout = f => { onLayout = f; };
export function splitOf(n, pref = layoutPref, w = W, h = H) {
  if (n !== 2) return n === 1 ? 'full' : 'grid';
  if (pref === 'tb' || pref === 'sbs') return pref;
  const tb = Math.abs(Math.log(w / (h / 2) / 1.6)), sbs = Math.abs(Math.log(w / 2 / h / 1.6));
  return sbs < tb - 1e-9 ? 'sbs' : 'tb';
}
export function rects(n = views.length) {
  const split = splitOf(n), w2 = W / 2, h2 = H / 2;
  if (split === 'full') return [{ x: 0, y: 0, w: W, h: H }];
  if (split === 'tb') return [{ x: 0, y: 0, w: W, h: h2 }, { x: 0, y: h2, w: W, h: h2 }];
  if (split === 'sbs') return [{ x: 0, y: 0, w: w2, h: H }, { x: w2, y: 0, w: w2, h: H }];
  return [{ x: 0, y: 0, w: w2, h: h2 }, { x: w2, y: 0, w: w2, h: h2 }, { x: 0, y: h2, w: w2, h: h2 }, { x: w2, y: h2, w: w2, h: h2 }];
}
function layout() {
  stale = true;
  const n = views.length, rs = rects(n);
  if (renderer) applyShadows();
  views.forEach((v, i) => {
    Object.assign(v, rs[i]);
    v.cam.aspect = v.w / v.h;
    // views taller than 1.6:1 widen the FOV so narrow views still see the road
    v.base = THREE.MathUtils.clamp(2 * Math.atan(Math.tan(35 * Math.PI / 180) * 1.6 / v.cam.aspect) * 180 / Math.PI, 70, 90);
    if (v.cam.aspect >= 1.6) v.base = 70;
    if (v.cine) { v.base = 42; v.cam.fov = 42; }
    if (v.shot) v.cam.fov = v.shot.fov;
    v.cam.updateProjectionMatrix();
  });
  onLayout?.();
}

// kart pose: track frame at s, offset d along right and h along up, turned by yaw (+ the drift slide for the body)
function pose(k, bodyYaw) {
  frameAt(T, k.s, fr);
  const c = Math.cos(bodyYaw), s = Math.sin(bodyYaw);
  U.fromArray(fr.up); R3.fromArray(fr.right);
  F.fromArray(fr.tan).multiplyScalar(c).addScaledVector(R3, s).normalize();
  X.crossVectors(U, F).normalize();
  P.fromArray(fr.pos).addScaledVector(R3, k.d).addScaledVector(U, k.h);
}

export function sync(R, dt) {
  if (!trackObj) return;
  time += dt;
  for (let i = 0; i < R.karts.length; i++) {
    const k = R.karts[i], m = trackObj.karts[i];
    k._slide = THREE.MathUtils.damp(k._slide || 0, k.drift * DRIFT_BIAS, 10, dt);
    pose(k, k.yaw + k._slide);
    M.makeBasis(X, U, F).setPosition(P);
    if (k.fly > 0 && m.flyFrom) { // Joker: ride an orb arc from the old spot to the new one (one high, one low)
      const f = 1 - k.fly / FLY_T, e = f * f * (3 - 2 * f);
      R3.copy(m.flyFrom).lerp(P, e); R3.y += Math.sin(Math.PI * f) * (m.flyHigh ? 7 : 2.5);
      M.setPosition(R3);
    }
    if (k.warp > 0) { // into the wormhole: shrink and spin into the mouth
      const f = k.warp / WARP_T;
      M.multiply(M2.makeRotationY((1 - f) * 9)).scale(R3.set(f, f, f));
    }
    m.root.matrix.copy(M);
    bubbleStep(m, k, M, dt);
    // blob shadow on the road under the kart, smaller and fainter the higher it flies
    const sc = 1 - Math.min(k.h, 5) / 7;
    P.addScaledVector(U, -k.h + 0.05);
    M.makeBasis(X, U, F).setPosition(P).scale(R3.set(sc, 1, sc));
    trackObj.shadows.setMatrixAt(i, M);
    if (m.prevH > 0.3 && k.h <= 0) m.racer.squash(Math.min(0.22, m.prevH * 0.06)); // landing
    m.prevH = k.h;
    m.racer.update(dt, k);
    // respawn: a glowing orb carries the kart back to the road
    if (k.resp > 0 && !m.orb) { m.orb = new THREE.Mesh(orbGeo ||= new THREE.SphereGeometry(1.4, 20, 14), new THREE.MeshBasicMaterial({ color: '#bfeaff', transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })); m.orb.matrixAutoUpdate = false; trackObj.grp.add(m.orb); }
    if (m.orb) { m.orb.visible = k.resp > 0 || k.fly > 0; if (m.orb.visible) { m.orb.matrix.copy(m.root.matrix).multiply(M2.makeTranslation(0, 0.9, 0)); m.orb.material.color.set(k.fly > 0 ? '#ffd27a' : '#bfeaff'); } }
    else if (k.fly > 0) { m.orb = new THREE.Mesh(orbGeo ||= new THREE.SphereGeometry(1.4, 20, 14), new THREE.MeshBasicMaterial({ color: '#ffd27a', transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })); m.orb.matrixAutoUpdate = false; trackObj.grp.add(m.orb); }
  }
  trackObj.shadows.instanceMatrix.needsUpdate = true;
  gimmickStep(R, dt);
  kartFx(R, dt);
  if (shadowsOn && views.length) { // the shadow box follows P1
    const p = trackObj.karts[views[0].kart].root.matrix.elements;
    key.target.position.set(p[12], p[13], p[14]); key.position.set(p[12] - 60, p[13] + 100, p[14] + 40);
    key.target.updateMatrixWorld();
  }
  if (trackObj.rungs) { // chase light: a bright band runs down the strip ~6 rungs a second
    const rm = trackObj.rungs, n = T.rungs.length;
    for (let j = 0; j < n; j++) {
      const f = Math.max(0, 1 - ((time * 6 - j) % n + n) % n / 2.2);
      rm.setColorAt(j, C.copy(RUNG).multiplyScalar(0.45 + 0.9 * f).lerp(WHITE, f * 0.3).multiplyScalar(1 + 0.8 * f)); // only the chase band crosses the bloom threshold
    }
    rm.instanceColor.needsUpdate = true;
  }
  for (const v of views) camStep(v, R.karts[v.kart], dt, R);
  labelStep(dt);
}

// chase camera: the view direction is smoothed, not the position, so speed never stretches the distance
// (a position spring trails v/k metres: ~3 m at 22 m/s). DESIGN §13.6
const DIR = new THREE.Vector3();
function camStep(v, k, dt, R) {
  if (v.shot) { // ?shot: a fixed beauty camera ahead of the pack, looking back at it
    const o = v.shot;
    frameAt(T, o.s, fr);
    P.fromArray(fr.pos); F.fromArray(fr.tan); R3.fromArray(fr.right);
    v.cam.position.copy(P).addScaledVector(F, o.ahead).addScaledVector(R3, o.side).y += o.h;
    frameAt(T, o.s - o.look, fr);
    v.cam.lookAt(fr.pos[0] + fr.right[0] * o.side * 0.3, fr.pos[1] + o.lookH, fr.pos[2] + fr.right[2] * o.side * 0.3);
    if (v.cam.fov !== o.fov) { v.cam.fov = o.fov; v.cam.updateProjectionMatrix(); }
    return;
  }
  if (v.cine) { // title backdrop: a slow orbit round the race leader, the diorama behind
    const lead = R.karts.find(x => x.place === 1) || k;
    pose(lead, lead.yaw);
    const a = reduceMotion.matches ? 0.8 : time * 0.12;
    R3.set(P.x + Math.cos(a) * 24, P.y + 9, P.z + Math.sin(a) * 24);
    v.pos.lerp(R3, v.snap ? 1 : 1 - Math.exp(-2 * dt)); v.look.lerp(P, v.snap ? 1 : 1 - Math.exp(-3 * dt)); v.snap = false;
    v.cam.position.copy(v.pos); v.cam.lookAt(v.look);
    return;
  }
  if (R.phase === 'grid') { // dice roll: a slow orbit round the grid
    frameAt(T, T.L - 12, fr);
    const a = -1 + R.clock / GRID_T * 2.4 * (reduceMotion.matches ? 0 : 1);
    X.fromArray(fr.right); F.fromArray(fr.tan);
    P.fromArray(fr.pos);
    v.cam.position.copy(P).addScaledVector(X, Math.cos(a) * 17).addScaledVector(F, Math.sin(a) * 17).y += 6.5;
    v.cam.lookAt(P.x, P.y + 0.8, P.z);
    v.snap = true;
    return;
  }
  pose(k, k.yaw * 0.7); // ponytail: 70% of the kart's heading keeps wall bounces from swinging the camera past the rails
  P.addScaledVector(U, -k.h * 0.5);
  if (k.fly > 0) P.setFromMatrixPosition(trackObj.karts[v.kart].root.matrix); // ride the Joker arc with the kart
  if (v.snap) { v.dir.copy(F); v.snap = false; v.pos.set(0, 0, 0); }
  v.dir.lerp(F, 1 - Math.exp(-7 * dt)).normalize();
  const back = k.lookBack ? -1 : 1;
  DIR.copy(v.dir).multiplyScalar(back);
  R3.copy(P).addScaledVector(DIR, -4.7).y += 2.0;
  if (!v.pos.lengthSq()) v.pos.copy(R3);
  v.pos.lerp(R3, 1 - Math.exp(-30 * dt));
  R3.copy(P).addScaledVector(DIR, 4).y += 0.8;
  v.look.copy(R3);
  v.cam.position.copy(v.pos);
  v.cam.lookAt(v.look);
  if (v.shake > 0 && !reduceMotion.matches) { v.shake = Math.max(0, v.shake - dt); const a = 0.25 * v.shake / 0.3; v.cam.position.x += (Math.random() - 0.5) * a; v.cam.position.y += (Math.random() - 0.5) * a; }
  const kick = k.boost > 0 && !reduceMotion.matches ? 10 : 0;
  const fov = THREE.MathUtils.damp(v.cam.fov, v.base + kick, 6, dt);
  if (Math.abs(fov - v.cam.fov) > 0.01) { v.cam.fov = fov; v.cam.updateProjectionMatrix(); }
}

// a kart tailgating you would fill the camera: hide any kart closer to this view's camera than its own kart
function nearHide(v) {
  if (!trackObj) return;
  if (trackObj.sky) { trackObj.sky.position.set(v.cam.position.x, 0, v.cam.position.z); trackObj.sky.updateMatrixWorld(true); } // horizon dressing rides with each camera
  const own = v.cine ? 9 : P.setFromMatrixPosition(trackObj.karts[v.kart].root.matrix).distanceToSquared(v.cam.position) * 0.85;
  for (let i = 0; i < trackObj.karts.length; i++) {
    const m = trackObj.karts[i];
    m.root.visible = i === v.kart || P.setFromMatrixPosition(m.root.matrix).distanceToSquared(v.cam.position) > own;
    if (!m.root.visible) m.near = true; // its trail would run out from under the camera: kartFx hides it next frame
  }
}
// High tier: every view is drawn into one target with scissors, then bloom + output run ONCE over the whole frame
class SplitRenderPass extends Pass {
  constructor() { super(); this.needsSwap = false; }
  render(r, writeBuffer, readBuffer) {
    const pr = r.getPixelRatio();
    readBuffer.scissorTest = true;
    for (const v of views) {
      nearHide(v);
      readBuffer.viewport.set(v.x * pr, (H - v.y - v.h) * pr, v.w * pr, v.h * pr);
      readBuffer.scissor.copy(readBuffer.viewport);
      r.setRenderTarget(readBuffer);
      r.render(scene, v.cam);
    }
    readBuffer.scissorTest = false;
  }
}
function ensureComposer() {
  if (composer) return;
  composer = new EffectComposer(renderer);
  composer.addPass(new SplitRenderPass());
  bloomPass = new UnrealBloomPass(new THREE.Vector2(W, H), 0.42, 0.18, 1.6); // threshold above lit white fur: only GLOW colours bloom
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(W, H);
}
export function render() {
  stale = false;
  renderer.info.autoReset = false; // count every view, not just the last
  renderer.info.reset();
  scene.updateMatrixWorld();
  if (shadowsOn) renderer.shadowMap.needsUpdate = true;
  if (TIERS[tier].bloom && views.length) { // full-frame passes: no screen scissor (the split pass scissors its own target)
    ensureComposer();
    renderer.setScissorTest(false); renderer.setViewport(0, 0, W, H);
    composer.render();
    renderer.setScissorTest(true);
    return;
  }
  for (const v of views) {
    nearHide(v);
    renderer.setViewport(v.x, H - v.y - v.h, v.w, v.h);
    renderer.setScissor(v.x, H - v.y - v.h, v.w, v.h);
    renderer.render(scene, v.cam);
  }
}
export function setTier(t) {
  tier = t;
  const q = TIERS[t];
  dprCap = q.dpr; fx.cap = q.fx; fx.n = Math.min(fx.n, fx.cap);
  resize();
  applyShadows();
  if (trackObj) for (const m of trackObj.karts) m.racer.outlines(q.outlines);
  haloLevel();
}
function applyShadows() {
  shadowsOn = TIERS[tier].shadows && renderer.shadowMap.enabled && views.length <= 2 && !!key;
  if (key) key.castShadow = shadowsOn;
}
export const info = () => renderer.info;
export const snapCams = () => views.forEach(v => { v.snap = true; });

// ---------- the one canvas moves between screens (race, lobby preview, ?zoo) ----------
let ro = null;
export function mount(container) {
  if (canvas.parentElement !== container) container.prepend(canvas);
  ro ||= new ResizeObserver(() => resize());
  ro.disconnect();
  ro.observe(container);
  resize();
}
export const size = () => [W, H];

// a small stage: glossy pedestal with a gold rim, soft bokeh behind (the Toy Diorama banner mood)
const softTex = () => canvasTex(64, 64, (g, w) => {
  const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.6, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, w, w);
});
function stage(sky) {
  const s = new THREE.Scene();
  s.background = skyTex(sky);
  s.environment = envFor('room');
  s.environmentIntensity = 0.6;
  s.add(new THREE.HemisphereLight('#bfb4ff', '#1a0f3a', 1.2));
  const key = new THREE.DirectionalLight('#ffe2c4', 2.2); key.position.set(-3, 5, 4);
  const rim = new THREE.DirectionalLight('#4fd8ff', 1.2); rim.position.set(4, 3, -4);
  s.add(key, rim);
  const n = 46, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), pal = ['#ffd27a', '#ff5d8f', '#4fd8ff', '#b98bff', '#ffb547'];
  for (let i = 0; i < n; i++) {
    pos.set([(Math.random() - 0.5) * 26, Math.random() * 9 - 1, -9 - Math.random() * 8], i * 3);
    C.set(pal[i % pal.length]).multiplyScalar(0.35 + Math.random() * 0.4); col.set([C.r, C.g, C.b], i * 3);
  }
  const g = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)).setAttribute('color', new THREE.BufferAttribute(col, 3));
  s.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 1.6, map: softTex(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })));
  return s;
}
function pedestal(r = 1.6, h = 0.36) { // top face at y = 0
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.08, h, 48), new THREE.MeshStandardMaterial({ color: '#2b1858', roughness: 0.22, metalness: 0.1 }));
  top.position.y = -h / 2;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.02, 0.06, 10, 64).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#ffc861', emissive: '#ff9f1c', emissiveIntensity: 0.6, roughness: 0.3, metalness: 0.6 }));
  g.add(top, ring);
  return g;
}

let pv = null;
const IDLE = { v: 0, steer: 0, boost: 0, stun: 0 };
export function preview(k, accent) {
  if (!pv) {
    pv = { s: stage(['#3a1a6e', '#1d0f45', '#0d0828']), cam: new THREE.PerspectiveCamera(30, 1, 0.1, 60), racer: null, k: -1, a: -0.5 };
    pv.s.add(pedestal());
    pv.cam.position.set(0, 2.1, 6.4); pv.cam.lookAt(0, 0.8, 0);
  }
  if (pv.k === k) return;
  if (pv.racer) { pv.s.remove(pv.racer.root); pv.racer.dispose(); }
  pv.racer = makeRacer(k, accent);
  pv.s.add(pv.racer.root);
  pv.k = k;
  pv.racer.squash(0.3);
}
export function renderPreview(dt) {
  if (!pv?.racer) return;
  pv.a += dt * 0.7;
  pv.racer.root.rotation.y = pv.a;
  pv.racer.update(dt, IDLE);
  if (Math.abs(pv.cam.aspect - W / H) > 1e-3) { pv.cam.aspect = W / H; pv.cam.updateProjectionMatrix(); }
  renderer.setViewport(0, 0, W, H); renderer.setScissor(0, 0, W, H);
  renderer.render(pv.s, pv.cam);
}

// ?zoo: all 20 racers in a 5 x 4 lineup, turning slowly, for checking each one against its SVG face
let zz = null;
export function zoo(colors) {
  zz = { s: stage(['#2a1650', '#171046', '#080720']), cam: new THREE.PerspectiveCamera(34, 1, 0.1, 100), racers: [] };
  colors.forEach((c, k) => {
    const r = makeRacer(k, c), x = (k % 5 - 2) * 3.7, z = -Math.floor(k / 5) * 4.6;
    r.root.position.set(x, 0, z);
    const p = pedestal(1.25); p.position.set(x, 0, z);
    zz.s.add(r.root, p);
    zz.racers.push(r);
  });
  zz.cam.position.set(0, 9, 17.5); zz.cam.lookAt(0, 0.2, -7);
}
export function renderZoo(dt, t, front) { // front: everyone faces the camera
  if (Math.abs(zz.cam.aspect - W / H) > 1e-3) { zz.cam.aspect = W / H; zz.cam.updateProjectionMatrix(); }
  zz.racers.forEach((r, i) => { r.root.rotation.y = front ? 0 : Math.sin(t * 0.5 + i * 0.3) * 1.2; r.update(dt, IDLE); });
  renderer.setViewport(0, 0, W, H); renderer.setScissor(0, 0, W, H);
  renderer.render(zz.s, zz.cam);
  // label anchors: a point beside each pedestal, in CSS px
  return zz.racers.map(r => { R3.copy(r.root.position); R3.x += 1.15; R3.y += 1.6; R3.project(zz.cam); return [(R3.x + 1) / 2 * W, (1 - R3.y) / 2 * H]; });
}

// ---------- floating labels: "STUN!", "MINI-TURBO!"... each text drawn once to a canvas (Ladder floatText()), a pooled
// sprite floats it up 1.1 s over the kart and fades it ----------
const labelTex = new Map(), labels = [];
function labelTexture(text, color) {
  const key = text + color;
  if (labelTex.has(key)) return labelTex.get(key);
  const c = document.createElement('canvas'), g = c.getContext('2d'), font = '900 52px system-ui, -apple-system, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", "Yu Gothic UI", sans-serif';
  g.font = font;
  c.width = Math.ceil(g.measureText(text).width) + 28; c.height = 76;
  g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.lineWidth = 12; g.strokeStyle = 'rgba(10,6,30,.88)'; g.strokeText(text, c.width / 2, 40);
  g.fillStyle = color; g.fillText(text, c.width / 2, 40);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.userData.aspect = c.width / c.height;
  labelTex.set(key, t);
  return t;
}
export function label(kartIndex, text, color = '#fff') {
  if (!trackObj) return;
  let l = labels.find(x => x.t >= 1);
  if (!l) {
    if (labels.length >= 12) return;
    l = { sprite: new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, depthTest: false, fog: false, sizeAttenuation: false })), t: 1, k: 0 };
    l.sprite.renderOrder = 10;
    l.sprite.material.userData.sharedMap = true;
    labels.push(l);
  }
  const tex = labelTexture(text, color);
  l.sprite.material.map = tex; l.sprite.material.needsUpdate = true;
  l.sprite.scale.set(0.05 * tex.userData.aspect, 0.05, 1); // a fixed share of the view's height, near or far
  l.t = 0; l.k = kartIndex;
  trackObj.grp.add(l.sprite);
}
function labelStep(dt) {
  for (const l of labels) {
    if (l.t >= 1) { l.sprite.visible = false; continue; }
    l.t = Math.min(1, l.t + dt / 1.1);
    const m = trackObj.karts[l.k];
    l.sprite.visible = true;
    l.sprite.position.setFromMatrixPosition(m.root.matrix);
    l.sprite.position.y += 2.3 + 0.9 * (1 - (1 - l.t) ** 2);
    l.sprite.material.opacity = l.t < 0.15 ? l.t / 0.15 : 1 - ((l.t - 0.15) / 0.85) ** 2;
  }
}
export const squash = (i, q) => trackObj?.karts[i]?.racer.squash(q);

// ---------- results podium: three glossy pedestals, top 3 cheering, the winner crowned, confetti in all 20 colours ----------
let pod = null;
export function podium(top3, colors) { // top3: [{ animal }...] in finishing order
  if (pod) { pod.racers.forEach(r => r.dispose()); }
  pod = { s: stage(['#3a1a6e', '#1d0f45', '#0d0828']), cam: new THREE.PerspectiveCamera(30, 1, 0.1, 80), racers: [], t: 0 };
  const spots = [[0, 1.3], [-2.6, 0.85], [2.6, 0.5]]; // 1st centre and highest, 2nd left, 3rd right
  top3.forEach((r, i) => {
    const [x, h] = spots[i], p = pedestal(1.15, h);
    p.position.set(x, h, 0);
    const tex = canvasTex(64, 64, (g, w2) => { g.fillStyle = ['#ffd54a', '#dfe3f5', '#e8955a'][i]; g.font = 'italic 900 46px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(i + 1, w2 / 2, 36); });
    const num = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    num.position.set(x, h * 0.5, 1.27);
    const racer = makeRacer(r.animal, colors[r.animal]);
    racer.root.position.set(x, h - 0.02, 0);
    racer.root.rotation.y = -x * 0.08;
    racer.setMood('joy');
    if (!i) { const c = crown(); c.position.set(0, racer.headTop - 0.04, 0.02); c.rotation.z = 0.18; racer.body.add(c); }
    pod.s.add(p, num, racer.root);
    pod.racers.push(racer);
  });
  // confetti: 90 flakes, one instanced draw
  const n = 90, mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.13, 0.08), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), n);
  pod.flakes = Array.from({ length: n }, (_, i) => {
    mesh.setColorAt(i, C.set(colors[i % colors.length]));
    return { p: new THREE.Vector3((Math.random() - 0.5) * 8, 3 + Math.random() * 6, (Math.random() - 0.5) * 3), v: 0.6 + Math.random() * 0.8, r: new THREE.Euler(Math.random() * 6, Math.random() * 6, 0), w: 2 + Math.random() * 5, ph: Math.random() * 6 };
  });
  pod.confetti = mesh;
  pod.s.add(mesh);
  pod.cam.aspect = 0; // placed on the first frame, once the box size is known
}
const IDLE2 = { v: 0, steer: 0, boost: 0, stun: 0 }, Qc = new THREE.Quaternion(), Sc = new THREE.Vector3(1, 1, 1);
export function renderPodium(dt) {
  if (!pod) return;
  pod.t += dt;
  pod.racers.forEach((r, i) => { r.update(dt, IDLE2); r.body.position.y += Math.max(0, Math.sin(pod.t * 7 + i)) * 0.12; }); // joy hops
  const still = reduceMotion.matches;
  pod.flakes.forEach((f, i) => {
    f.p.y -= f.v * dt; f.p.x += Math.sin(pod.t * 2 + f.ph) * 0.4 * dt;
    if (f.p.y < -0.5) f.p.y += 9;
    if (!still) { f.r.x += f.w * dt; f.r.y += f.w * 0.7 * dt; }
    M.compose(f.p, Qc.setFromEuler(f.r), Sc);
    pod.confetti.setMatrixAt(i, M);
  });
  pod.confetti.instanceMatrix.needsUpdate = true;
  if (Math.abs(pod.cam.aspect - W / H) > 1e-3) { // back off far enough to fit all three pedestals in any box shape
    pod.cam.aspect = W / H; pod.cam.updateProjectionMatrix();
    const dist = Math.max(9.6, 4.9 / Math.tan(Math.atan(Math.tan(15 * Math.PI / 180) * pod.cam.aspect)));
    pod.cam.position.set(0, 1.6 + dist * 0.11, dist); pod.cam.lookAt(0, 1.3, 0);
  }
  renderer.setViewport(0, 0, W, H); renderer.setScissor(0, 0, W, H);
  renderer.render(pod.s, pod.cam);
}

// ---------- particles: one pooled Points system for every burst (sparkle, implode, blast, coin scatter), no per-frame
// allocation; capped (Phase 6 ties the cap to the quality tier) ----------
const FX_MAX = 1500;
export const fx = { n: 0, cap: TIERS[tier].fx, pos: new Float32Array(FX_MAX * 3), vel: new Float32Array(FX_MAX * 3), col: new Float32Array(FX_MAX * 3), life: new Float32Array(FX_MAX), max: new Float32Array(FX_MAX), size: new Float32Array(FX_MAX), grav: new Float32Array(FX_MAX), mesh: null };
function fxMesh() {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(fx.pos, 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('color', new THREE.BufferAttribute(fx.col, 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('size', new THREE.BufferAttribute(fx.size, 1).setUsage(THREE.DynamicDrawUsage));
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'attribute float size; attribute vec3 color; varying vec3 vC; void main() { vC = color; vec4 mv = modelViewMatrix * vec4(position, 1.); gl_PointSize = size * 300. / -mv.z; gl_Position = projectionMatrix * mv; }', // color carries the fade (written each step)
    fragmentShader: 'varying vec3 vC; void main() { float d = length(gl_PointCoord - .5); if (d > .5) discard; gl_FragColor = vec4(vC * smoothstep(.5, .0, d) * 1.6, 1.); }',
  });
  const p = new THREE.Points(g, m);
  p.frustumCulled = false; p.userData.shared = true;
  return p;
}
const FC = new THREE.Color();
// count particles at (x, y, z) flying out at ~speed m/s; up adds an upward kick, grav pulls them down
export function burst(x, y, z, color, count, speed, life = 0.7, size = 0.35, up = 0, grav = 6, inward = false) {
  FC.set(color);
  for (let i = 0; i < count && fx.n < fx.cap; i++) {
    const j = fx.n++, a = Math.random() * Math.PI * 2, b = Math.acos(Math.random() * 2 - 1), sp = speed * (0.4 + Math.random() * 0.6);
    const vx = Math.sin(b) * Math.cos(a) * sp, vy = Math.cos(b) * sp + up, vz = Math.sin(b) * Math.sin(a) * sp;
    const q = j * 3;
    if (inward) { fx.pos[q] = x + vx * life; fx.pos[q + 1] = y + vy * life * 0.5; fx.pos[q + 2] = z + vz * life; fx.vel[q] = -vx; fx.vel[q + 1] = -vy * 0.5; fx.vel[q + 2] = -vz; }
    else { fx.pos[q] = x; fx.pos[q + 1] = y; fx.pos[q + 2] = z; fx.vel[q] = vx; fx.vel[q + 1] = vy; fx.vel[q + 2] = vz; }
    fx.col[q] = FC.r; fx.col[q + 1] = FC.g; fx.col[q + 2] = FC.b;
    fx.life[j] = fx.max[j] = life * (0.7 + Math.random() * 0.5); fx.size[j] = size; fx.grav[j] = inward ? 0 : grav;
  }
}
// a single particle with its own velocity (drift sparks, wind streaks)
export function spark(x, y, z, vx, vy, vz, color, life, size, grav = 0) {
  if (fx.n >= fx.cap) return;
  const j = fx.n++, q = j * 3;
  FC.set(color);
  fx.pos[q] = x; fx.pos[q + 1] = y; fx.pos[q + 2] = z; fx.vel[q] = vx; fx.vel[q + 1] = vy; fx.vel[q + 2] = vz;
  fx.col[q] = FC.r; fx.col[q + 1] = FC.g; fx.col[q + 2] = FC.b;
  fx.life[j] = fx.max[j] = life; fx.size[j] = size; fx.grav[j] = grav;
}
function fxStep(dt) {
  for (let i = 0; i < fx.n; i++) {
    fx.life[i] -= dt;
    if (fx.life[i] <= 0) { // swap-remove with the last live particle
      const j = --fx.n;
      if (i !== j) {
        for (let c = 0; c < 3; c++) { fx.pos[i * 3 + c] = fx.pos[j * 3 + c]; fx.vel[i * 3 + c] = fx.vel[j * 3 + c]; fx.col[i * 3 + c] = fx.col[j * 3 + c]; }
        fx.life[i] = fx.life[j]; fx.max[i] = fx.max[j]; fx.size[i] = fx.size[j]; fx.grav[i] = fx.grav[j];
      }
      i--; continue;
    }
    fx.vel[i * 3 + 1] -= fx.grav[i] * dt;
    for (let c = 0; c < 3; c++) fx.pos[i * 3 + c] += fx.vel[i * 3 + c] * dt;
    const fade = fx.life[i] / fx.max[i], k2 = fade > 0.15 ? 1 : fade / 0.15;
    fx.size[i] *= 1 - dt * 0.6;
    if (k2 < 1) for (let c = 0; c < 3; c++) fx.col[i * 3 + c] *= 0.85;
  }
  const g = fx.mesh.geometry;
  g.setDrawRange(0, fx.n);
  for (const a of ['position', 'color', 'size']) { g.attributes[a].needsUpdate = true; g.attributes[a].clearUpdateRanges?.(); g.attributes[a].addUpdateRange?.(0, fx.n * (a === 'size' ? 1 : 3)); }
}

// ---------- items & gimmicks on the track ----------
const CARD_COLS = ['#ff5d8f', '#9b6bff', '#4fd8ff', '#ffd54a'];
const cardTex = (glyphOnly) => canvasTex(128, 160, (g, w2, h2) => {
  if (!glyphOnly) {
    const gr = g.createLinearGradient(0, 0, w2, h2); gr.addColorStop(0, 'rgba(255,255,255,.34)'); gr.addColorStop(0.5, 'rgba(255,255,255,.08)'); gr.addColorStop(1, 'rgba(255,255,255,.22)');
    g.fillStyle = gr; g.beginPath(); g.roundRect(8, 8, w2 - 16, h2 - 16, 22); g.fill();
    g.lineWidth = 9; g.strokeStyle = '#fff'; g.stroke();
    g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.roundRect(20, 20, w2 - 40, h2 - 40, 14); g.stroke();
    return;
  }
  g.font = '900 104px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 12; g.strokeStyle = 'rgba(26,15,58,.9)'; g.lineJoin = 'round'; g.strokeText('?', w2 / 2, h2 / 2 + 6);
  g.fillStyle = '#fff'; g.fillText('?', w2 / 2, h2 / 2 + 6);
});
const swirlTex = (inner, outer) => canvasTex(128, 128, (g, w2) => {
  const c = w2 / 2, r = g.createRadialGradient(c, c, 0, c, c, c);
  r.addColorStop(0, '#05020f'); r.addColorStop(0.28, inner); r.addColorStop(0.8, outer); r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r; g.fillRect(0, 0, w2, w2);
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3;
  for (let a = 0; a < 4; a++) { g.beginPath(); for (let t = 0; t < 1; t += 0.02) { const ang = a * Math.PI / 2 + t * 5, rr = t * c * 0.95; g.lineTo(c + Math.cos(ang) * rr, c + Math.sin(ang) * rr); } g.stroke(); }
});
const vinylTex = () => canvasTex(512, 512, (g, w2) => {
  const c = w2 / 2;
  g.fillStyle = '#141018'; g.beginPath(); g.arc(c, c, c, 0, 7); g.fill();
  for (let r = c * 0.36; r < c * 0.98; r += 3) { g.strokeStyle = r % 9 < 3 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.35)'; g.lineWidth = 1.2; g.beginPath(); g.arc(c, c, r, 0, 7); g.stroke(); }
  const sh = g.createLinearGradient(0, 0, w2, w2); sh.addColorStop(0.35, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(190,170,255,.16)'); sh.addColorStop(0.65, 'rgba(255,255,255,0)');
  g.fillStyle = sh; g.beginPath(); g.arc(c, c, c, 0, 7); g.fill();
  const lab = g.createRadialGradient(c, c, 0, c, c, c * 0.34); lab.addColorStop(0, '#ffe680'); lab.addColorStop(0.7, '#ff5d8f'); lab.addColorStop(1, '#9b6bff');
  g.fillStyle = lab; g.beginPath(); g.arc(c, c, c * 0.33, 0, 7); g.fill();
  g.fillStyle = '#141018'; g.beginPath(); g.arc(c, c, 10, 0, 7); g.fill();
});
const blastTex = () => canvasTex(128, 128, (g) => { // Ladder x-blast starburst
  g.translate(64, 64); g.scale(3.4, 3.4); g.translate(-16, -16);
  for (const [col, d] of [['#ff7a3c', 'M16 -3L19.4 5.5L27.2 .6L24.9 9.5L34.1 10.1L27 16L34.1 21.9L24.9 22.5L27.2 31.4L19.4 26.5L16 35L12.6 26.5L4.8 31.4L7.1 22.5L-2.1 21.9L5 16L-2.1 10.1L7.1 9.5L4.8 .6L12.6 5.5z'],
    ['#ffd54a', 'M18.6 3.3L20.2 9.8L26.8 8.8L23.4 14.6L28.7 18.6L22.2 20.2L23.2 26.8L17.4 23.4L13.4 28.7L11.8 22.2L5.2 23.2L8.6 17.4L3.3 13.4L9.8 11.8L8.8 5.2L14.6 8.6z'],
    ['#fff8d8', 'M16 9L17.8 13L22.1 12.5L19.5 16L22.1 19.5L17.8 19L16 23L14.2 19L9.9 19.5L12.5 16L9.9 12.5L14.2 13z']]) { g.fillStyle = col; g.fill(new Path2D(d)); }
});
let G5 = null; // the gimmick meshes for the loaded track
const IM = new THREE.Object3D();
function buildGimmicks(grp) {
  G5 = { grp };
  fx.mesh ||= fxMesh(); fx.n = 0; grp.add(fx.mesh);
  // item boxes: tinted glass cards (frame), a white "?" over them, crossed additive halos: 3 draw calls for all of them
  const nb = T.boxes.length;
  if (nb) {
    const card = new THREE.PlaneGeometry(1.15, 1.45);
    G5.cards = new THREE.InstancedMesh(card, new THREE.MeshBasicMaterial({ map: cardTex(false), transparent: true, side: THREE.DoubleSide, depthWrite: false }), nb);
    G5.glyphs = new THREE.InstancedMesh(card, new THREE.MeshBasicMaterial({ map: cardTex(true), transparent: true, side: THREE.DoubleSide, depthWrite: false }), nb);
    const halo = mergeGeometries([new THREE.PlaneGeometry(2.6, 2.6), new THREE.PlaneGeometry(2.6, 2.6).rotateY(Math.PI / 2)]);
    G5.halos = new THREE.InstancedMesh(halo, new THREE.MeshBasicMaterial({ map: softTex(), transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), nb);
    for (let i = 0; i < nb; i++) { C.set(CARD_COLS[i % 4]); G5.halos.setColorAt(i, C); G5.cards.setColorAt(i, C.multiplyScalar(GLOW)); G5.glyphs.setColorAt(i, WHITE); }
    G5.glyphs.renderOrder = 2;
    grp.add(G5.halos, G5.cards, G5.glyphs);
  }
  // coins: one instanced draw, spinning; picked-up ones shrink to nothing until they respawn
  if (T.coins.length) {
    const face = canvasTex(64, 64, (c, s) => { // Ladder's gold gradient with a raised rim and a star
      const gr = c.createLinearGradient(0, 0, s, s); gr.addColorStop(0, '#fff6c4'); gr.addColorStop(0.35, '#ffd54a'); gr.addColorStop(0.8, '#e09a12'); gr.addColorStop(1, '#a8650a');
      c.fillStyle = gr; c.fillRect(0, 0, s, s);
      c.strokeStyle = '#a8650a'; c.lineWidth = 5; c.beginPath(); c.arc(32, 32, 24, 0, 7); c.stroke();
      c.fillStyle = '#fff6c4'; c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 7 : 15, a2 = i * Math.PI / 5 - Math.PI / 2; c.lineTo(32 + Math.cos(a2) * r, 32 + Math.sin(a2) * r); } c.fill();
    });
    const edge = new THREE.MeshStandardMaterial({ color: '#c98410', metalness: 0.6, roughness: 0.35, emissive: '#7a4a00', emissiveIntensity: 0.4 });
    const cap = new THREE.MeshStandardMaterial({ map: face, metalness: 0.35, roughness: 0.35, emissive: '#ffb547', emissiveIntensity: 0.25, emissiveMap: face });
    G5.coins = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.32, 0.32, 0.1, 20).rotateX(Math.PI / 2), [edge, cap, cap], T.coins.length);
    grp.add(G5.coins);
  }
  // wormhole mouths: a ring standing on the road edge with a spinning swirl inside (A violet->cyan, B the other way round)
  G5.mouths = T.mouths.map((m, i) => {
    const hc = T.def.theme.holes || ['#d36bff', '#4fd8ff'], g = new THREE.Group(), [inner, outer] = i % 2 ? [hc[1], hc[0]] : hc;
    const disc = new THREE.Mesh(new THREE.CircleGeometry(2.05, 40), new THREE.MeshBasicMaterial({ map: swirlTex(inner, outer), transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.17, 10, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(outer).multiplyScalar(GLOW) }));
    const glow = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.55, 8, 40), new THREE.MeshBasicMaterial({ color: inner, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }));
    g.add(disc, ring, glow);
    place(g, T, m.s, m.d, 2.15);
    G5.grp.add(g);
    return { g, disc };
  });
  // carousel: a vinyl record on a toy turntable with a gold rim and blinking seat lights
  G5.cars = T.carousels.map(c => {
    const g = new THREE.Group();
    place(g, T, c.s, 0, 0.06);
    const top = T.def.theme.carousel === 'musicbox' ? new THREE.MeshToonMaterial({ map: musicBoxTex(), gradientMap: toonRamp() }) : T.def.theme.carousel === 'buk' ? new THREE.MeshStandardMaterial({ map: bukTex(), roughness: 0.6 }) : new THREE.MeshStandardMaterial({ map: vinylTex(), roughness: 0.5, metalness: 0, envMapIntensity: 0.4 });
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(c.r, c.r, 0.12, 64), [
      new THREE.MeshStandardMaterial({ color: '#7a3a0c', roughness: 0.3, metalness: 0.6 }), top, new THREE.MeshStandardMaterial({ color: '#2b1858' })]);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(c.r, 0.16, 10, 96).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#ffc861', emissive: '#ff9f1c', emissiveIntensity: 0.55, roughness: 0.3, metalness: 0.6 }));
    const nl = 28, lights = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ toneMapped: false }), nl);
    for (let i = 0; i < nl; i++) { const a = i / nl * Math.PI * 2; IM.position.set(Math.cos(a) * (c.r + 0.02), 0.2, Math.sin(a) * (c.r + 0.02)); IM.updateMatrix(); lights.setMatrixAt(i, IM.matrix); lights.setColorAt(i, C.set('#ffb547')); }
    const spin = new THREE.Group(); spin.add(disc);
    g.add(spin, rim, lights);
    G5.grp.add(g);
    return { spin, lights, w: c.w, nl };
  });
  // moving walls: a hazard-striped barrier with glowing end posts and top rail, sliding in a lit slot across the road
  G5.movers = T.movers.map(m => {
    const th = T.def.theme, hot = th.day ? 1 : GLOW, w = m.hw * 2, bh = MOVER_H - 0.2, dep = MOVER_T * 2;
    const tex = canvasTex(256, 64, (g, cw, ch) => {
      g.fillStyle = th.wood ? th.rails[0] : th.road; g.fillRect(0, 0, cw, ch);
      g.fillStyle = th.edge;
      for (let x = -ch; x < cw + ch; x += 40) { g.beginPath(); g.moveTo(x, ch); g.lineTo(x + 20, ch); g.lineTo(x + 20 + ch, 0); g.lineTo(x + ch, 0); g.fill(); }
      g.strokeStyle = th.rails[1]; g.lineWidth = 8; g.strokeRect(4, 4, cw - 8, ch - 8);
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, bh, dep).translate(0, bh / 2, 0), th.toon
      ? new THREE.MeshToonMaterial({ map: tex, gradientMap: toonRamp() })
      : new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.35 }));
    body.castShadow = true;
    const tint = (geo, c) => { const n = geo.attributes.position.count, a = new Float32Array(n * 3); C.set(c).multiplyScalar(hot); for (let i = 0; i < n; i++) a.set([C.r, C.g, C.b], i * 3); geo.setAttribute('color', new THREE.BufferAttribute(a, 3)); return geo; };
    const glow = new THREE.Mesh(mergeGeometries([
      tint(new THREE.CylinderGeometry(0.15, 0.15, w + 0.3, 12).rotateZ(Math.PI / 2).translate(0, MOVER_H - 0.05, 0), th.rails[2]),
      tint(new THREE.CylinderGeometry(0.2, 0.2, MOVER_H + 0.1, 12).translate(-w / 2, (MOVER_H + 0.1) / 2, 0), th.rails[0]),
      tint(new THREE.CylinderGeometry(0.2, 0.2, MOVER_H + 0.1, 12).translate(w / 2, (MOVER_H + 0.1) / 2, 0), th.rails[0])]), new THREE.MeshBasicMaterial({ vertexColors: true }));
    const g = new THREE.Group(); g.add(body, glow); G5.grp.add(g);
    const slot = new THREE.Mesh(new THREE.BoxGeometry(2 * (m.amp + m.hw), 0.04, 0.3), new THREE.MeshBasicMaterial({ color: new THREE.Color(th.edge).multiplyScalar(th.day ? 0.6 : 1.2) }));
    place(slot, T, m.s, 0, 0.03); G5.grp.add(slot);
    return { g, m };
  });
  // props (gift boxes / lotus lanterns) come with their tracks' set dressing (Phase 7)
  G5.bombs = []; G5.blasts = []; G5.spot = null; G5.lines = [];
}

const bombGeo = () => {
  const p = [new THREE.SphereGeometry(0.42, 18, 14), new THREE.CylinderGeometry(0.14, 0.16, 0.18, 10).translate(0, 0.45, 0), new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6).rotateZ(-0.6).translate(0.1, 0.62, 0)];
  const cols = ['#3a2d5c', '#6b5a8a', '#c8a070'];
  p.forEach((g, i) => { const n = g.attributes.position.count, a = new Float32Array(n * 3); C.set(cols[i]); for (let j = 0; j < n; j++) a.set([C.r, C.g, C.b], j * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); });
  return mergeGeometries(p);
};
let BOMB_GEO = null, SPARK_GEO = null, BLAST_TEX = null;
function bombMesh() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(BOMB_GEO ||= bombGeo(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.25, metalness: 0.2 })));
  const spark = new THREE.Mesh(SPARK_GEO ||= new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffb547', toneMapped: false }));
  spark.position.set(0.19, 0.76, 0); g.add(spark); g.userData.spark = spark;
  G5.grp.add(g);
  return g;
}
const shake = [];
// called by game.js from the sim events
export function onEvent(e, R) {
  if (!G5) return;
  const k = R.karts[e.k];
  if (e.type === 'blast') {
    frameAt(T, e.s, fr); P.fromArray(fr.pos).addScaledVector(R3.fromArray(fr.right), e.d).y += 0.6;
    burst(P.x, P.y, P.z, '#ffb547', 60, 9, 0.7, 0.55, 3); burst(P.x, P.y, P.z, '#ff7a3c', 40, 6, 0.6, 0.7, 2); burst(P.x, P.y, P.z, '#fff8d8', 20, 4, 0.4, 0.9, 1);
    let b = G5.blasts.find(x => x.t >= 1);
    if (!b) {
      b = { t: 1, ring: new THREE.Mesh(new THREE.TorusGeometry(1, 0.12, 8, 40).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffd54a', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })),
        star: new THREE.Sprite(new THREE.SpriteMaterial({ map: BLAST_TEX ||= blastTex(), transparent: true, depthWrite: false })) };
      b.star.material.userData.sharedMap = true;
      G5.grp.add(b.ring, b.star); G5.blasts.push(b);
    }
    b.t = 0; b.ring.position.copy(P); b.star.position.copy(P);
    for (const v of views) if (v.cam.position.distanceTo(P) < 22) v.shake = 0.3;
  } else if (e.type === 'stun' && e.x > 0) { // coins pop out and scatter
    pose(k, k.yaw); burst(P.x, P.y + 1, P.z, '#ffd54a', e.x * 6, 5, 0.8, 0.3, 4, 12);
  } else if (e.type === 'stun') { const v = views.find(x => x.kart === e.k); if (v) v.shake = 0.25; }
  else if (e.type === 'coin' || e.type === 'box') { pose(k, k.yaw); burst(P.x, P.y + 1, P.z, e.type === 'coin' ? '#ffe680' : CARD_COLS[e.x % 4], e.type === 'coin' ? 8 : 18, 3.5, 0.5, 0.28, 1.5, 2); }
  else if (e.type === 'startBoost') { pose(k, k.yaw); burst(P.x - F.x * 1.2, P.y + 0.5, P.z - F.z * 1.2, '#ffd54a', 30, 5, 0.5, 0.25, 2, 6); }
  else if (e.type === 'lap' && k.human >= 0) pillar(e.k, k.color || '#ffffff');
  else if (e.type === 'warpIn') { pose(k, k.yaw); burst(P.x, P.y + 1, P.z, e.x % 2 ? '#4fd8ff' : '#d36bff', 40, 6, 0.4, 0.3, 0, 0, true); }
  else if (e.type === 'warpOut') { pose(k, k.yaw); burst(P.x, P.y + 1, P.z, '#ffffff', 26, 7, 0.45, 0.32, 1, 2); const v = views.find(x => x.kart === e.k); if (v) v.snap = true; }
  else if (e.type === 'jokerSwap') {
    const a = trackObj.karts[e.k], b = trackObj.karts[e.x];
    for (const [m, high] of [[a, true], [b, false]]) { m.flyFrom = (m.flyFrom || new THREE.Vector3()).setFromMatrixPosition(m.root.matrix); m.flyHigh = high; }
    // the two karts' old spots are each other's new ones: snap both cameras with them
    for (const v of views) if (v.kart === e.k || v.kart === e.x) v.snap = true;
  } else if (e.type === 'pop' || e.type === 'bubble') { pose(k, k.yaw); burst(P.x, P.y + 1, P.z, '#e6dcff', e.type === 'pop' ? 30 : 14, e.type === 'pop' ? 6 : 2, 0.5, 0.3, 1, 2); }
}
// bubble shield: a glass sphere with a bright rim and a Ladder g-pass highlight; blinks out over its last second and a half
let BUB_GEO = null, BUB_MAT = null;
function bubbleStep(m, k, mat, dt) {
  if (k.bubble <= 0) { if (m.bub) m.bub.visible = false; return; }
  if (!m.bub) {
    BUB_MAT ||= new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: 'varying vec3 vN; varying vec3 vV; void main() { vec4 mv = modelViewMatrix * vec4(position, 1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'varying vec3 vN; varying vec3 vV; void main() { float f = pow(1. - abs(dot(vN, vV)), 2.2); float hi = smoothstep(.93, .99, dot(vN, normalize(vec3(-.4, .55, .7)))); vec3 c = mix(vec3(.72, .55, 1.), vec3(.55, .9, 1.), vN.y * .5 + .5); gl_FragColor = vec4(c * f * 1.1 + hi * .9, 1.); }',
    });
    m.bub = new THREE.Mesh(BUB_GEO ||= new THREE.SphereGeometry(1.55, 28, 20), BUB_MAT);
    m.bub.matrixAutoUpdate = false; m.bub.userData.shared = true;
    trackObj.grp.add(m.bub);
  }
  m.bub.visible = k.bubble > 1.5 || Math.sin(k.bubble * 30) > 0;
  m.bub.matrix.copy(mat).multiply(M2.makeTranslation(0, 1, 0));
}
const SPOT = new THREE.Color('#ffd27a');
function gimmickStep(R, dt) {
  const t = time;
  if (G5.cards) { // spin + bob, scale back in on respawn (overshoot)
    for (let i = 0; i < T.boxes.length; i++) {
      const b = T.boxes[i], rt = R.boxT[i], f = rt > 0 ? Math.max(0, 1 - rt / 0.5) : 1, sc = rt > 0 && rt > 0.5 ? 0 : f < 1 ? f * (1 + 0.4 * Math.sin(f * Math.PI)) : 1;
      place(IM, T, b.s, b.d, 1.3 + Math.sin(t * 2.2 + i) * 0.15);
      IM.rotateY(t * 1.6 + i); IM.scale.setScalar(sc); IM.updateMatrix();
      G5.cards.setMatrixAt(i, IM.matrix); G5.glyphs.setMatrixAt(i, IM.matrix); G5.halos.setMatrixAt(i, IM.matrix);
    }
    G5.cards.instanceMatrix.needsUpdate = G5.glyphs.instanceMatrix.needsUpdate = G5.halos.instanceMatrix.needsUpdate = true;
  }
  if (G5.coins) {
    for (let i = 0; i < T.coins.length; i++) {
      const c = T.coins[i], ct = R.coinT[i];
      place(IM, T, c.s, c.d, 0.9 + Math.sin(t * 3 + i * 0.7) * 0.08);
      IM.rotateY(t * 3 + i * 0.4); IM.scale.setScalar(ct > 0 ? (ct < 0.4 ? 1 - ct / 0.4 : 0) : 1); IM.updateMatrix();
      G5.coins.setMatrixAt(i, IM.matrix);
    }
    G5.coins.instanceMatrix.needsUpdate = true;
  }
  for (const m of G5.mouths) m.disc.rotation.z -= dt * 3;
  for (const v of G5.movers) place(v.g, T, v.m.s, moverD(v.m, R.t), 0);
  if (G5.boats) for (const b of G5.boats) { // drift down the stream and loop round
    const u = ((b.userData.u += dt * 2.2) + 120) % 240 - 120, { sx, sz, dirX, dirZ } = G5.boatPath;
    b.position.set(sx + dirX * u, b.userData.y + Math.sin(t * 2 + u) * 0.08, sz + dirZ * u); b.rotation.set(Math.sin(t * 1.7 + u) * 0.08, Math.atan2(dirX, dirZ) + Math.PI / 2, 0);
  }
  for (const c of G5.cars) {
    c.spin.rotation.y -= c.w * dt;
    for (let i = 0; i < c.nl; i++) c.lights.setColorAt(i, C.set((Math.floor(t * 6) + i) % 2 ? '#ffb547' : '#fff3c4').multiplyScalar(GLOW));
    c.lights.instanceColor.needsUpdate = true;
  }
  // bombs in flight: arc, roll, fuse spark flicker
  let nb = 0;
  for (const b of R.bombs) {
    const g = G5.bombs[nb] ||= bombMesh();
    g.visible = true; nb++;
    place(g, T, b.s, b.d, b.h + 0.42);
    g.rotateX(b.t * 8);
    g.userData.spark.scale.setScalar(0.8 + Math.random() * 0.8);
  }
  for (let i = nb; i < G5.bombs.length; i++) G5.bombs[i].visible = false;
  for (const b of G5.blasts) {
    if (b.t >= 1) { b.ring.visible = b.star.visible = false; continue; }
    b.t = Math.min(1, b.t + dt / 0.45);
    b.ring.visible = b.star.visible = true;
    b.ring.scale.setScalar(0.5 + b.t * 3.5); b.ring.material.opacity = 1 - b.t;
    b.star.scale.setScalar(1.5 + b.t * 4); b.star.material.opacity = 1 - b.t * b.t; b.star.material.rotation = b.t;
  }
  // Joker spotlight: a gold cone over the racer in its sights
  const user = R.karts.find(k => k.joker > 0);
  if (user) {
    G5.spot ||= spotMesh();
    const tk = R.karts[user.jokerOn];
    pose(tk, tk.yaw);
    G5.spot.visible = true; G5.spot.position.copy(P).y += 9; G5.spot.material.opacity = 0.15 + 0.12 * Math.sin(t * 25);
  } else if (G5.spot) G5.spot.visible = false;
  fxStep(dt);
  pillarStep(dt);
  petalStep(dt);
}

// ---------- kart effects: neon trail ribbons (all karts in one draw), boost flames, drift sparks, wind streaks ----------
const TRAIL_N = 19, TRAIL_STEP = 0.6; // ~11 m of streak
let trails = null;
function buildTrails(grp, karts) {
  const nK = karts.length, nv = nK * TRAIL_N * 2;
  const pos = new Float32Array(nv * 3), col = new Float32Array(nv * 3), idx = [];
  for (let k = 0; k < nK; k++) for (let j = 0; j < TRAIL_N - 1; j++) { const a = (k * TRAIL_N + j) * 2; idx.push(a, a + 1, a + 3, a, a + 3, a + 2); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage));
  g.setIndex(idx);
  const mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  mesh.frustumCulled = false;
  grp.add(mesh);
  trails = { day: T.def.theme.day ? 0.4 : 1, mesh, pos, col, pts: karts.map(k => ({ x: new Float32Array(TRAIL_N), y: new Float32Array(TRAIL_N), z: new Float32Array(TRAIL_N), rx: new Float32Array(TRAIL_N), rz: new Float32Array(TRAIL_N), n: 0, acc: new THREE.Color(k.color || '#fff') })) };
  // boost flames: one small additive cone on each kart's tail, only drawn while boosting
  trackObj.karts.forEach((m, i) => {
    const f = new THREE.Mesh(FLAME_GEO ||= new THREE.ConeGeometry(0.22, 1, 10, 1, true).translate(0, -0.5, 0).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: C.set(karts[i].color || '#fff').multiplyScalar(GLOW), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    f.position.set(0, 0.45, -1.05); f.visible = false;
    m.root.add(f); m.flame = f;
  });
}
let FLAME_GEO = null;
const TR = new THREE.Vector3(), TF = new THREE.Vector3(), TU = new THREE.Vector3();
function kartFx(R, dt) {
  const tp = trails.pos, tc = trails.col;
  for (let i = 0; i < R.karts.length; i++) {
    const k = R.karts[i], m = trackObj.karts[i], e = m.root.matrix.elements, tr = trails.pts[i];
    TR.set(e[0], e[1], e[2]); TU.set(e[4], e[5], e[6]); TF.set(e[8], e[9], e[10]);
    const sx = e[12] - TF.x * 1.15 + TU.x * 0.32, sy = e[13] - TF.y * 1.15 + TU.y * 0.32, sz = e[14] - TF.z * 1.15 + TU.z * 0.32;
    // recent tail positions: 0 follows the kart every frame, 1.. are points kept every 0.6 m (newest first). The spacing
    // is measured from the last kept point, not from last frame's head (at 60 fps a kart moves < 0.6 m a frame, so
    // nothing was kept and the ribbon stretched back to wherever the last frame hitch happened)
    if (!tr.n || Math.hypot(sx - tr.x[0], sz - tr.z[0]) > 8) tr.n = 1; // first frame, or teleported (wormhole, Joker, respawn): a fresh trail
    if (tr.n < 2 || Math.hypot(sx - tr.x[1], sz - tr.z[1]) > TRAIL_STEP || k.warp || k.fly) {
      for (let j = TRAIL_N - 1; j > 1; j--) { tr.x[j] = tr.x[j - 1]; tr.y[j] = tr.y[j - 1]; tr.z[j] = tr.z[j - 1]; tr.rx[j] = tr.rx[j - 1]; tr.rz[j] = tr.rz[j - 1]; }
      tr.x[1] = sx; tr.y[1] = sy; tr.z[1] = sz; tr.rx[1] = TR.x; tr.rz[1] = TR.z;
      tr.n = Math.min(TRAIL_N, tr.n + 1);
    }
    tr.x[0] = sx; tr.y[0] = sy; tr.z[0] = sz; tr.rx[0] = TR.x; tr.rz[0] = TR.z;
    const vis = Math.min(1, Math.max(0, (k.v - 7) / 9)) * (k.warp || k.fly || k.resp || m.near ? 0 : 1) * trails.day, hot = k.boost > 0 ? 1 : 0;
    m.near = false;
    for (let j = 0; j < TRAIL_N; j++) {
      const jj = Math.min(j, tr.n - 1), f = 1 - j / TRAIL_N, wdt = (0.12 + 0.05 * hot) * f * (trails.day < 1 ? 0.6 : 1), b = (i * TRAIL_N + j) * 6; // a light streak, not a painted stripe
      for (let s = 0; s < 2; s++) {
        const o = s ? wdt : -wdt;
        tp[b + s * 3] = tr.x[jj] + tr.rx[jj] * o; tp[b + s * 3 + 1] = tr.y[jj]; tp[b + s * 3 + 2] = tr.z[jj] + tr.rz[jj] * o;
        const a = f * f * vis * (1.1 + 0.5 * hot), wh = hot * f * 0.35; // brighter, whiter while boosting (bloom picks it up)
        tc[b + s * 3] = (tr.acc.r * (1 - wh) + wh) * a; tc[b + s * 3 + 1] = (tr.acc.g * (1 - wh) + wh) * a; tc[b + s * 3 + 2] = (tr.acc.b * (1 - wh) + wh) * a;
      }
    }
    // boost flame flicker
    m.flame.visible = k.boost > 0 && !k.warp;
    if (m.flame.visible) m.flame.scale.set(1, 1, 0.8 + Math.random() * 0.7 + (k.boost > 0.6 ? 0.4 : 0));
    // drift sparks from the rear wheels in the charge colour, wind streaks at top speed
    if (k.drift && k.tier && k.h <= 0 && dt) {
      const col = TIER_COL[k.tier - 1];
      for (const side of [-1, 1]) spark(e[12] + TR.x * 0.78 * side - TF.x * 0.6, e[13] + 0.15, e[14] + TR.z * 0.78 * side - TF.z * 0.6,
        -TF.x * 2 + (Math.random() - 0.5) * 3 + TR.x * side * 2, 1 + Math.random() * 2.5, -TF.z * 2 + (Math.random() - 0.5) * 3 + TR.z * side * 2, col, 0.28, 0.16, 9);
    }
    if (k.v > R.top * 0.92 && dt && Math.random() < 0.6) {
      const side = Math.random() < 0.5 ? -1 : 1, up = Math.random() * 1.4;
      spark(e[12] + TR.x * side * (1 + Math.random()), e[13] + 0.4 + up, e[14] + TR.z * side * (1 + Math.random()), TF.x * k.v * 0.5, 0, TF.z * k.v * 0.5, '#8f86c8', 0.22, 0.09);
    }
  }
  const g = trails.mesh.geometry;
  g.attributes.position.needsUpdate = g.attributes.color.needsUpdate = true;
}
const TIER_COL = ['#4fd8ff', '#ffb547', '#ff5d8f'];
// pillar of light at the finish line (and a spray of sparks on a rocket start)
const pillars = [];
export function pillar(i, color) {
  if (!trackObj) return;
  let p = pillars.find(x => x.t >= 1);
  if (!p) {
    p = { t: 1, m: new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 26, 24, 1, true).translate(0, 13, 0), new THREE.MeshBasicMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })) };
    p.m.material.forceSinglePass = true;
    pillars.push(p);
  }
  trackObj.grp.add(p.m);
  p.t = 0; p.m.material.color.set(color).multiplyScalar(GLOW);
  p.m.position.setFromMatrixPosition(trackObj.karts[i].root.matrix);
}
function pillarStep(dt) {
  for (const p of pillars) { if (p.t >= 1) { p.m.visible = false; continue; } p.t = Math.min(1, p.t + dt / 0.6); p.m.visible = true; p.m.material.opacity = 0.55 * (1 - p.t); p.m.scale.set(1 + p.t, 1, 1 + p.t); }
}

// ---------- set dressing ----------
// Toy Diorama Speedway: a child's room at night at toy scale. Velvet blanket in folds, the road running over stacks of
// giant books, glass marbles, a d20 at the hairpin, a star night-light and a crescent-moon lantern, bokeh in the dark
const dress = {};
function seeded(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// book atlas: 4 cover colours (rows), each row = [cover | spine with gold foil | pages]
const BOOK_COLS = ['#1f2a5c', '#3a1a6e', '#1d4a5a', '#5a1a3e'];
const bookAtlas = () => canvasTex(512, 512, (g) => {
  BOOK_COLS.forEach((c, r) => {
    const y = r * 128;
    g.fillStyle = c; g.fillRect(0, y, 340, 128);
    for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`; g.fillRect(Math.random() * 340, y + Math.random() * 128, 2, 2); }
    g.strokeStyle = '#d9a64a'; g.lineWidth = 3; g.strokeRect(12, y + 12, 146, 104); // cover border
    // spine: gold foil bands + title bars
    g.fillStyle = '#e8b85a'; for (const by of [10, 22, 104, 116]) g.fillRect(170, y + by, 170, 4);
    g.fillStyle = '#ffd27a'; g.fillRect(200, y + 50, 110, 8); g.fillRect(220, y + 66, 70, 6);
    // pages
    g.fillStyle = '#cfc2a4'; g.fillRect(340, y, 172, 128);
    g.fillStyle = 'rgba(120,100,80,.25)'; for (let l = 4; l < 128; l += 4) g.fillRect(340, y + l, 172, 1);
  });
});
// one book: a box whose six faces sample the atlas (covers top/bottom, spine on one side, pages elsewhere)
function bookGeo(w, h, d, variant, spineSide) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, v0 = (3 - variant) / 4, vh = 1 / 4;
  const rect = f => f === 2 || f === 3 ? [0, 340 / 512 * 0.5] : f < 2 ? [340 / 512 * 0.5, 340 / 512] : [340 / 512, 1]; // covers / spines / pages
  for (let i = 0; i < uv.count; i++) {
    const f = Math.floor(i / 4), [u0, u1] = rect(f);
    uv.setXY(i, u0 + (u1 - u0) * uv.getX(i), v0 + vh * uv.getY(i));
  }
  return g;
}
const curtainTex = () => canvasTex(512, 64, (g, w2, h2) => {
  const gr = g.createLinearGradient(0, 0, w2, 0);
  for (let i = 0; i <= 16; i++) gr.addColorStop(i / 16, i % 2 ? '#1a1048' : '#0c0826');
  g.fillStyle = gr; g.fillRect(0, 0, w2, h2);
});
function starShape(r1, r2, n = 5) { const s = new THREE.Shape(); for (let i = 0; i <= n * 2; i++) { const r = i % 2 ? r2 : r1, a = i * Math.PI / n + Math.PI / 2; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); } return s; }
function crescentShape(r) { const s = new THREE.Shape(); s.absarc(0, 0, r, Math.PI * 0.3, Math.PI * 1.7, false); s.absarc(r * 0.45, 0, r * 0.82, Math.PI * 1.62, Math.PI * 0.38, true); return s; }
dress.toy = (grp, density) => {
  const rand = seeded(7), floor = -0.4;
  const near = []; // track samples every 3 m, for keeping the blanket folds and the props off the road
  for (let i = 0; i < T.n; i += 3) near.push(T.pos[i * 3], T.pos[i * 3 + 1], T.pos[i * 3 + 2]);
  const distTrack = (x, z) => { let b = 1e9; for (let i = 0; i < near.length; i += 3) { const dx = near[i] - x, dz = near[i + 2] - z, d = dx * dx + dz * dz; if (d < b) b = d; } return Math.sqrt(b); };
  // velvet blanket: big folds that flatten out near the track
  const bw = 1300, bd = 1000, blanket = new THREE.PlaneGeometry(bw, bd, 130, 100).rotateX(-Math.PI / 2).translate(-140, 0, -15);
  const p = blanket.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), fall = Math.min(1, Math.max(0, (distTrack(x, z) - 12) / 40));
    const fold = 2.6 * Math.sin(x * 0.03 + Math.sin(z * 0.017) * 2.2) * Math.cos(z * 0.026 - x * 0.008) + 1.3 * Math.sin(x * 0.083 + z * 0.061) + 0.6 * Math.sin(z * 0.15 + x * 0.04);
    p.setY(i, floor - 0.25 + (fold - 1) * fall * 1.6);
  }
  blanket.computeVertexNormals();
  // the sheen shader cost ~40% of the Toy frame on its own (it fills the screen): High only
  const vel = tier === 'high' ? new THREE.MeshPhysicalMaterial({ color: '#1c1250', roughness: 0.95, sheen: 0.45, sheenRoughness: 0.4, sheenColor: new THREE.Color('#5b3fc0'), envMapIntensity: 0.25 })
    : tier === 'medium' ? new THREE.MeshStandardMaterial({ color: '#1c1250', roughness: 0.95, envMapIntensity: 0.25 }) : new THREE.MeshLambertMaterial({ color: '#1c1250' });
  const bl = new THREE.Mesh(blanket, vel); bl.receiveShadow = true;
  grp.add(bl);
  // the old flat ground goes: the blanket is the floor now
  grp.children.forEach(o => { if (o.geometry?.parameters?.width === 2000) o.visible = false; });

  // books: stacks under every raised stretch of road (the road runs on them), plus loose stacks round the room
  const books = [];
  const book = (x, y, z, w, h, d, yaw) => {
    const g = bookGeo(w, h, d, Math.floor(rand() * 4), rand() < 0.5 ? 0 : 1);
    g.rotateY(yaw).translate(x, y + h / 2, z);
    books.push(g);
  };
  for (let i = 0; i < T.n; i += 9) {
    const y = T.pos[i * 3 + 1];
    if (y < 0.9) continue;
    const x = T.pos[i * 3], z = T.pos[i * 3 + 2], yaw = Math.atan2(T.tan[i * 3], T.tan[i * 3 + 2]), wide = T.half[i] * 2 + 2.5;
    let h = floor;
    while (h < y - 0.6) {
      const t = Math.min(y - 0.25 - h, 1 + rand() * 0.9);
      book(x + (rand() - 0.5) * 1.2, h, z + (rand() - 0.5) * 1.2, wide + rand() * 2.5, t, 10 + rand() * 3, yaw + (rand() - 0.5) * 0.12);
      h += t;
    }
  }
  const loose = Math.round(14 * density);
  for (let s = 0; s < loose; s++) { // loose stacks off the road
    let x, z, tries = 0;
    do { x = -300 + rand() * 340; z = -150 + rand() * 260; } while (distTrack(x, z) < 22 && ++tries < 40);
    let h = floor, yaw = rand() * 6;
    const nb = 1 + Math.floor(rand() * 4);
    for (let b = 0; b < nb; b++) { const t = 1.2 + rand() * 1.4; book(x + (rand() - 0.5), h, z + (rand() - 0.5), 9 + rand() * 6, t, 12 + rand() * 5, yaw + (rand() - 0.5) * 0.3); h += t; }
  }
  const bm = new THREE.Mesh(mergeGeometries(books), new THREE.MeshStandardMaterial({ map: bookAtlas(), roughness: 0.65, metalness: 0.05 }));
  bm.receiveShadow = true;
  grp.add(bm);

  // glass marbles: a glossy shell (env-mapped, fresnel-bright, see-through) over a coloured swirl core; all in 2 draws
  const shells = [], cores = [], tints = ['#ff5d8f', '#4fd8ff', '#ffb547', '#9b6bff', '#5dffb0'];
  const nm = Math.round(10 * density);
  for (let i = 0; i < nm; i++) {
    let x, z, tries = 0;
    do { x = -290 + rand() * 320; z = -140 + rand() * 240; } while (distTrack(x, z) < 24 && ++tries < 60);
    const r = 1.6 + rand() * 1.8, y = floor + r - 0.3;
    const s = new THREE.SphereGeometry(r, 24, 16).translate(x, y, z), c = new THREE.IcosahedronGeometry(r * 0.45, 1).translate(x, y, z);
    for (const [g, col, k] of [[s, '#d8ccff', 1], [c, tints[i % 5], 1]]) { const n = g.attributes.position.count, a = new Float32Array(n * 3); C.set(col); for (let j = 0; j < n; j++) a.set([C.r, C.g, C.b], j * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); }
    shells.push(s); cores.push(c);
  }
  if (nm) {
    const shell = new THREE.Mesh(mergeGeometries(shells), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.04, metalness: 0.2, transparent: true, opacity: 0.38, envMapIntensity: 2.2, depthWrite: false }));
    const core = new THREE.Mesh(mergeGeometries(cores), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.3, emissive: '#ffffff', emissiveIntensity: 0.35, flatShading: true }));
    shell.renderOrder = 1;
    grp.add(core, shell);
  }

  // d20 at the hairpin
  const d20 = new THREE.Mesh(new THREE.IcosahedronGeometry(5.5, 0), new THREE.MeshStandardMaterial({ color: '#6b3fd1', roughness: 0.18, metalness: 0.15, flatShading: true }));
  d20.position.set(-250, floor + 4.4, -75); d20.rotation.set(0.6, 0.4, 0.2);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(d20.geometry), new THREE.LineBasicMaterial({ color: C.set('#ffd27a').multiplyScalar(GLOW) }));
  d20.add(edges); d20.castShadow = true;
  grp.add(d20);

  // star night-light (left of the start straight) and the crescent-moon lantern (outside the U-turn): warm glows
  const warm = new THREE.MeshBasicMaterial({ color: C.set('#ffd27a').multiplyScalar(GLOW) });
  const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape(4, 1.9), { depth: 1.4, bevelEnabled: true, bevelSize: 0.35, bevelThickness: 0.35, bevelSegments: 2 }), warm);
  star.position.set(-26, 11.5, -26); star.rotation.y = 0.9;
  const lantern = new THREE.Group();
  const gold = new THREE.MeshStandardMaterial({ color: '#c98410', metalness: 0.7, roughness: 0.3 });
  const goldParts = [[-2, -2], [2, -2], [-2, 2], [2, 2]].map(([x, z]) => new THREE.CylinderGeometry(0.18, 0.18, 6, 8).translate(x, 3, z));
  for (const y of [0, 6]) goldParts.push(new THREE.BoxGeometry(5, 0.5, 5).translate(0, y, 0));
  goldParts.push(new THREE.ConeGeometry(3.6, 2.4, 4).rotateY(Math.PI / 4).translate(0, 7.4, 0), new THREE.TorusGeometry(0.7, 0.15, 6, 16).translate(0, 9, 0));
  lantern.add(new THREE.Mesh(mergeGeometries(goldParts.map(g => g.index ? g.toNonIndexed() : g)), gold));
  const moon = new THREE.Mesh(new THREE.ExtrudeGeometry(crescentShape(1.6), { depth: 0.5, bevelEnabled: false }), warm); moon.position.set(0, 3.1, 0); lantern.add(moon);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(3.8, 5.4, 3.8), new THREE.MeshBasicMaterial({ color: '#ffb547', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }));
  glass.position.y = 3; lantern.add(glass);
  lantern.position.set(-18, 5.75, 104); lantern.rotation.y = 0.5;
  grp.add(star, lantern);
  const haloMat = new THREE.SpriteMaterial({ map: softTex(), color: '#ffb547', transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
  for (const [o, s] of [[star, 22], [lantern, 18]]) { const h = new THREE.Sprite(haloMat); h.scale.setScalar(s); h.position.copy(o.position); if (o === lantern) h.position.y += 3; grp.add(h); }
  if (tier === 'high') for (const [x, y, z] of [[-26, 13, -26], [-18, 9, 104]]) { const l = new THREE.PointLight('#ffc87a', 900, 90, 1.6); l.position.set(x, y, z); grp.add(l); }

  // rail posts: little pegs under the neon rails every 6 m, like a plastic toy track (one instanced draw)
  const step = 6, np = Math.floor(T.n / step) * 2, posts = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.09, 0.12, 1, 6).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ color: '#3a2d5c', roughness: 0.5 }), np);
  let pi = 0;
  for (let i = 0; i < T.n - step + 1 && pi < np; i += step) for (const side of [-1, 1]) {
    if (overWater(T, i * T.ds)) continue;
    const o = side * railOff(T, i);
    IM.position.set(T.pos[i * 3] + T.right[i * 3] * o, T.pos[i * 3 + 1] + T.right[i * 3 + 1] * o, T.pos[i * 3 + 2] + T.right[i * 3 + 2] * o);
    IM.scale.set(1, 0.5, 1); IM.rotation.set(0, 0, 0); IM.updateMatrix();
    posts.setMatrixAt(pi++, IM.matrix);
  }
  posts.count = pi;
  grp.add(posts);

  // the dark room: curtains far away, soft bokeh in front of them
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(700, 700, 500, 48, 1, true), new THREE.MeshBasicMaterial({ map: curtainTex(), side: THREE.BackSide, fog: false }));
  wall.material.map.wrapS = THREE.RepeatWrapping; wall.material.map.repeat.set(8, 1);
  wall.position.set(-140, 150, -15);
  grp.add(wall);
  const nbk = 60, bp = new Float32Array(nbk * 3), bc = new Float32Array(nbk * 3), pal = ['#ffd27a', '#ff5d8f', '#4fd8ff', '#b98bff', '#ffb547'];
  for (let i = 0; i < nbk; i++) {
    const a = rand() * Math.PI * 2, r = 360 + rand() * 260;
    bp.set([-140 + Math.cos(a) * r, 10 + rand() * 120, -15 + Math.sin(a) * r], i * 3);
    C.set(pal[i % 5]).multiplyScalar(0.25 + rand() * 0.35); bc.set([C.r, C.g, C.b], i * 3);
  }
  const bg = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(bp, 3)).setAttribute('color', new THREE.BufferAttribute(bc, 3));
  grp.add(new THREE.Points(bg, new THREE.PointsMaterial({ size: 40, map: softTex(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })));
};

// ---------- per-theme environment maps (the reflections in glossy karts / roads) ----------
const envCache = {};
function envFor(kind) {
  if (envCache[kind]) return envCache[kind];
  const pm = new THREE.PMREMGenerator(renderer);
  let tex;
  if (kind === 'room') tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  else { // a dark sky sphere with a few coloured light blobs (space: neon; dusk: festival; day: storybook)
    const s = new THREE.Scene(), cols = { space: ['#0a0826', ['#ff5d8f', '#4fd8ff', '#9b6bff', '#ffd27a']], day: ['#cfe6ff', ['#ffffff', '#fff3d6', '#ffe0ef', '#d6f0ff']], dusk: ['#1d2f5a', ['#ffb547', '#ff6b5c', '#ffd27a', '#c8321e']] }[kind];
    s.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.MeshBasicMaterial({ color: cols[0], side: THREE.BackSide })));
    cols[1].forEach((c, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(kind === 'day' ? 14 : 6, 16, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(kind === 'day' ? 1.5 : 4) })); const a = i / 4 * Math.PI * 2; m.position.set(Math.cos(a) * 40, 12 + (i % 2) * 18, Math.sin(a) * 40); s.add(m); });
    tex = pm.fromScene(s, 0.02).texture;
  }
  pm.dispose();
  return (envCache[kind] = tex);
}

// Neon Arcade Circuit: floating in deep space. Starfield, crystal-city islands with lit windows, purple clouds below,
// two ringed planets
const windowTex = () => canvasTex(64, 256, (g, w2, h2) => {
  g.fillStyle = '#1a0f3a'; g.fillRect(0, 0, w2, h2);
  const cols = ['#ff5d8f', '#4fd8ff', '#ffd27a', '#b98bff'];
  for (let y = 4; y < h2; y += 10) for (let x = 4; x < w2; x += 12) if (Math.random() < 0.55) { g.fillStyle = cols[(x + y) % 4]; g.globalAlpha = 0.4 + Math.random() * 0.6; g.fillRect(x, y, 6, 5); }
  g.globalAlpha = 1;
});
const cloudTex = () => canvasTex(128, 128, (g) => {
  for (let i = 0; i < 9; i++) {
    const x = 30 + Math.random() * 68, y = 50 + Math.random() * 34, r = 18 + Math.random() * 22, gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }
});
const planetTex = (a, b) => canvasTex(16, 128, (g, w2, h2) => {
  const gr = g.createLinearGradient(0, 0, 0, h2);
  for (let i = 0; i <= 8; i++) gr.addColorStop(i / 8, i % 2 ? a : b);
  g.fillStyle = gr; g.fillRect(0, 0, w2, h2);
});
const ringTex = () => canvasTex(128, 4, (g, w2) => {
  const gr = g.createLinearGradient(0, 0, w2, 0);
  gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.2, 'rgba(255,214,250,.55)'); gr.addColorStop(0.5, 'rgba(180,140,255,.25)'); gr.addColorStop(0.75, 'rgba(120,220,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, w2, 4);
});
dress.neon = (grp, density) => {
  const rand = seeded(11);
  let cx = 0, cz = 0;
  for (let i = 0; i < T.n; i++) { cx += T.pos[i * 3] / T.n; cz += T.pos[i * 3 + 2] / T.n; }
  const near = []; for (let i = 0; i < T.n; i += 4) near.push(T.pos[i * 3], T.pos[i * 3 + 2]);
  const clear = (x, z, r) => { for (let i = 0; i < near.length; i += 2) if ((near[i] - x) ** 2 + (near[i + 1] - z) ** 2 < r * r) return false; return true; };
  // stars and planets ride with each camera (nearHide), ~330-395 m out, inside the race cameras' 420 m far plane
  const sky = new THREE.Group();
  grp.add(sky); trackObj.sky = sky;
  // stars: 1 draw
  const ns = 1800, sp = new Float32Array(ns * 3), sc = new Float32Array(ns * 3);
  for (let i = 0; i < ns; i++) {
    const u = rand() * 2 - 1, a = rand() * Math.PI * 2, r = 395, s = Math.sqrt(1 - u * u);
    sp.set([Math.cos(a) * s * r, u * r * 0.8 + 40, Math.sin(a) * s * r], i * 3);
    C.set(rand() < 0.2 ? '#bfeaff' : rand() < 0.3 ? '#ffd1e2' : '#ffffff').multiplyScalar(0.5 + rand() * 0.9); sc.set([C.r, C.g, C.b], i * 3);
  }
  sky.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(sp, 3)).setAttribute('color', new THREE.BufferAttribute(sc, 3)),
    new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: false, vertexColors: true, fog: false })));
  // crystal-city islands: inverted rock cones topped with spires of lit windows (2 draws for all of them)
  const rocks = [], spires = [], ni = Math.round(11 * density);
  for (let i = 0; i < ni; i++) {
    let x, z, tries = 0;
    do { const a = rand() * Math.PI * 2, r = 120 + rand() * 330; x = cx + Math.cos(a) * r; z = cz + Math.sin(a) * r; } while (!clear(x, z, 60) && ++tries < 50);
    const R0 = 18 + rand() * 26, y = -10 + rand() * 40, hgt = R0 * (1.4 + rand());
    rocks.push(new THREE.ConeGeometry(R0, hgt, 7, 1).rotateX(Math.PI).translate(x, y - hgt / 2, z));
    const ns2 = 3 + Math.floor(rand() * 5);
    for (let j = 0; j < ns2; j++) {
      const a = rand() * Math.PI * 2, r = rand() * R0 * 0.6, hh = 18 + rand() * 60, rr = 2.5 + rand() * 4;
      spires.push(new THREE.CylinderGeometry(rr * 0.55, rr, hh, 6, 1).translate(x + Math.cos(a) * r, y + hh / 2, z + Math.sin(a) * r));
      spires.push(new THREE.ConeGeometry(rr * 0.55, rr * 2.5, 6).translate(x + Math.cos(a) * r, y + hh + rr * 1.25, z + Math.sin(a) * r));
    }
  }
  grp.add(new THREE.Mesh(mergeGeometries(rocks), new THREE.MeshStandardMaterial({ color: '#2a1a5e', roughness: 0.85, flatShading: true })));
  const wt = windowTex(); wt.wrapS = wt.wrapT = THREE.RepeatWrapping;
  grp.add(new THREE.Mesh(mergeGeometries(spires.map(g => g.index ? g : g)), new THREE.MeshStandardMaterial({ color: '#4a2f9a', roughness: 0.25, metalness: 0.3, emissive: '#ffffff', emissiveMap: wt, emissiveIntensity: 1.6, map: wt })));
  // purple cumulus below the track: big soft billboards (one Points draw)
  const nc = Math.round(36 * density), cp = new Float32Array(nc * 3), cc = new Float32Array(nc * 3);
  for (let i = 0; i < nc; i++) {
    const a = rand() * Math.PI * 2, r = 60 + rand() * 420;
    cp.set([cx + Math.cos(a) * r, -30 + rand() * 30, cz + Math.sin(a) * r], i * 3);
    C.set(rand() < 0.5 ? '#6b3fd1' : '#c45cff').multiplyScalar(0.35 + rand() * 0.25); cc.set([C.r, C.g, C.b], i * 3);
  }
  grp.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(cp, 3)).setAttribute('color', new THREE.BufferAttribute(cc, 3)),
    new THREE.PointsMaterial({ size: 140, map: cloudTex(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })));
  // ringed planets far off (each ring's far edge stays under 400 m from the camera)
  for (const [x, y, z, r, a, b, tilt] of [[208, 64, -248, 28, '#ff8fb8', '#9b6bff', 0.35], [-282, 40, 167, 16.7, '#4fd8ff', '#2b2f8c', -0.5]]) {
    const pl = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 24), new THREE.MeshBasicMaterial({ map: planetTex(a, b), fog: false }));
    const ring = new THREE.Mesh(new THREE.RingGeometry(r * 1.4, r * 2.3, 64), new THREE.MeshBasicMaterial({ map: ringTex(), transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false }));
    const uv = ring.geometry.attributes.uv, p2 = ring.geometry.attributes.position; // radial uv for the ring bands
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (Math.hypot(p2.getX(i), p2.getY(i)) - r * 1.4) / (r * 0.9), 0.5);
    ring.rotation.x = Math.PI / 2 + tilt; pl.rotation.z = tilt;
    pl.position.set(x, y, z); ring.position.set(x, y, z);
    sky.add(pl, ring);
  }
};

// ---------- Storybook Meadow: a watercolour picture book in daylight ----------
const musicBoxTex = () => canvasTex(512, 512, (g, s) => {
  const c = s / 2;
  const rings = ['#ffd6e7', '#fff3d6', '#e8dcff', '#fff3d6', '#ffd6e7'];
  rings.forEach((col, i) => { g.fillStyle = col; g.beginPath(); g.arc(c, c, c * (1 - i * 0.18), 0, 7); g.fill(); });
  g.strokeStyle = '#e0a94a'; g.lineWidth = 6;
  for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(c, c, c * (1 - i * 0.18) - 3, 0, 7); g.stroke(); }
  g.fillStyle = '#ffb547';
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.save(); g.translate(c + Math.cos(a) * c * 0.82, c + Math.sin(a) * c * 0.82); g.beginPath(); for (let j = 0; j < 10; j++) { const r = j % 2 ? 6 : 14, b = j * Math.PI / 5; g.lineTo(Math.cos(b) * r, Math.sin(b) * r); } g.fill(); g.restore(); }
});
const terrainNoise = (x, z) => Math.sin(x * 0.021) * Math.cos(z * 0.017) * 6 + Math.sin(x * 0.053 + z * 0.041) * 2.2 + Math.sin(z * 0.09 - x * 0.03) * 0.8;
dress.story = (grp, density) => {
  const rand = seeded(23), th = T.def.theme, toon = (o) => new THREE.MeshToonMaterial({ gradientMap: toonRamp(), ...o });
  let cx = 0, cz = 0;
  for (let i = 0; i < T.n; i++) { cx += T.pos[i * 3] / T.n; cz += T.pos[i * 3 + 2] / T.n; }
  // the stream runs under the bridge, square to it
  let mid = 0, span = 30; for (const [a, b] of T.water) { mid = Math.round((a + b) / 2 / T.ds) % T.n; span = (b - a) / 2; } // the river is as wide as the bridge is long
  const sx = T.pos[mid * 3], sz = T.pos[mid * 3 + 2], dirX = T.tan[mid * 3 + 2], dirZ = -T.tan[mid * 3]; // stream direction = perpendicular to the road
  const streamD = (x, z) => Math.abs((x - sx) * dirZ - (z - sz) * dirX); // distance from the stream's centre line
  const samples = []; for (let i = 0; i < T.n; i += 3) samples.push(i);
  // terrain: rolling meadow, flat with the road near it (following the bank), lavender hills far off, a stream channel
  const size = 760, segs = 150, geo = new THREE.PlaneGeometry(size, size, segs, segs).rotateX(-Math.PI / 2).translate(cx, 0, cz);
  const p = geo.attributes.position, col = new Float32Array(p.count * 3), grass = new THREE.Color('#9ed77f'), grass2 = new THREE.Color('#7cc46a'), hill = new THREE.Color('#c9b6ea'), sand = new THREE.Color('#e8d6a6');
  for (let v = 0; v < p.count; v++) {
    const x = p.getX(v), z = p.getZ(v);
    let best = 1e9, bi = 0;
    for (const i of samples) { const dx = T.pos[i * 3] - x, dz = T.pos[i * 3 + 2] - z, d = dx * dx + dz * dz; if (d < best) { best = d; bi = i; } }
    const rx = T.right[bi * 3], rz = T.right[bi * 3 + 2], rl = Math.hypot(rx, rz), lat = ((x - T.pos[bi * 3]) * rx + (z - T.pos[bi * 3 + 2]) * rz) / rl;
    const edge = T.half[bi] + T.shoulder + 1.5, lc = Math.max(-edge, Math.min(edge, lat));
    const nearH = T.pos[bi * 3 + 1] + lc * T.right[bi * 3 + 1] / rl - 0.22;
    const far = Math.min(1, Math.max(0, (Math.abs(lat) - edge) / 45));
    const s2 = far * far * (3 - 2 * far), far2 = Math.min(1, Math.max(0, (Math.sqrt(best) - 150) / 160));
    let h = nearH * (1 - s2) + (terrainNoise(x, z) + 2) * s2 + far2 * far2 * 26;
    const sd = streamD(x, z), e = Math.min(1, Math.max(0, (span + 2 - sd) / 10)), cut = e * e * (3 - 2 * e);
    h -= cut * 5.5;
    p.setY(v, h);
    C.copy(grass).lerp(grass2, (Math.sin(x * 0.11) * Math.cos(z * 0.13) + 1) / 2).lerp(hill, far2).lerp(sand, cut * 0.8);
    col.set([C.r, C.g, C.b], v * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const ground = new THREE.Mesh(geo, toon({ vertexColors: true }));
  ground.receiveShadow = true;
  grp.add(ground);
  // water: a calm blue ribbon along the stream, below the bridge
  const water = new THREE.Mesh(new THREE.PlaneGeometry(span * 2 + 6, size, 1, 1).rotateX(-Math.PI / 2).rotateY(Math.atan2(dirX, dirZ)).translate(sx, T.pos[mid * 3 + 1] - 2.6, sz),
    new THREE.MeshStandardMaterial({ color: '#8fd8ff', roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.85, envMapIntensity: 1.5 }));
  grp.add(water);
  // the wooden ladder bridge: planks across (rungs), two side beams, posts down into the water
  const planks = [], posts = [];
  for (let i = 0; i < T.n; i++) {
    if (!overWater(T, i * T.ds)) continue;
    frameAt(T, i * T.ds, fr);
    const yaw = Math.atan2(fr.tan[0], fr.tan[2]);
    if (i % 2 === 0) planks.push(new THREE.BoxGeometry(T.half[i] * 2 + 1, 0.2, 1.5).rotateY(yaw).translate(fr.pos[0], fr.pos[1] - 0.1, fr.pos[2])); // ladder rungs laid flat: the planks you drive on
    if (i % 3 === 0) for (const sd2 of [-1, 1]) { const o = sd2 * (T.half[i] + 0.35); planks.push(new THREE.BoxGeometry(0.5, 0.45, 3.2).rotateY(yaw).translate(fr.pos[0] + fr.right[0] * o, fr.pos[1] - 0.05, fr.pos[2] + fr.right[2] * o)); } // the ladder's side beams
    if (i % 10 === 0) for (const sd2 of [-1, 1]) { const o = sd2 * (T.half[i] + 0.3); posts.push(new THREE.CylinderGeometry(0.3, 0.3, 5, 8).translate(fr.pos[0] + fr.right[0] * o, fr.pos[1] - 2.6, fr.pos[2] + fr.right[2] * o)); }
  }
  if (planks.length) {
    const woodA = toon({ color: '#c98a5a' }), woodB = toon({ color: '#8a5a32' });
    grp.add(new THREE.Mesh(mergeGeometries(planks), woodA), new THREE.Mesh(mergeGeometries(posts), woodB));
  }
  // wooden ladder fence knobs: round knob on each rail post (instanced)
  const ks = 5, nk = Math.floor(T.n / ks) * 2, knobs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.26, 10, 8), toon({ color: '#b07a4a' }), nk), stem = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.11, 0.13, 1, 6).translate(0, 0.5, 0), toon({ color: '#8a5a32' }), nk);
  let ki = 0;
  for (let i = 0; i < T.n; i += ks) for (const side of [-1, 1]) {
    if (overWater(T, i * T.ds) || ki >= nk) continue;
    frameAt(T, i * T.ds, fr);
    const o = side * railOff(T, i);
    IM.position.set(fr.pos[0] + fr.right[0] * o, fr.pos[1] + fr.right[1] * o - 0.2, fr.pos[2] + fr.right[2] * o); IM.scale.set(1, 1.05, 1); IM.rotation.set(0, 0, 0); IM.updateMatrix(); stem.setMatrixAt(ki, IM.matrix);
    IM.position.y += 1.05; IM.scale.set(1, 1, 1); IM.updateMatrix(); knobs.setMatrixAt(ki, IM.matrix); ki++;
  }
  knobs.count = stem.count = ki;
  grp.add(knobs, stem);
  // blossom trees: trunks + 3-ball canopies in pink / lilac / cream, instanced (2 draws)
  const nt = Math.round(70 * density), trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5, 0.75, 1, 7).translate(0, 0.5, 0), toon({ color: '#8a5a3c' }), nt);
  const crowns = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), toon({ color: '#ffffff' }), nt * 3), pinks = ['#ffb7d0', '#e2c4ff', '#ffd6e7', '#fff1e0', '#ffc2dc'];
  let ti = 0, ci = 0;
  const heightAt = (x, z) => { // bilinear on the terrain grid
    const gx = (x - (cx - size / 2)) / size * segs, gz = (z - (cz - size / 2)) / size * segs, ix = Math.max(0, Math.min(segs - 1, gx | 0)), iz = Math.max(0, Math.min(segs - 1, gz | 0)), fx = gx - ix, fz = gz - iz, row = segs + 1;
    const h = i => p.getY(i);
    return (h(iz * row + ix) * (1 - fx) + h(iz * row + ix + 1) * fx) * (1 - fz) + (h((iz + 1) * row + ix) * (1 - fx) + h((iz + 1) * row + ix + 1) * fx) * fz;
  };
  for (let tries = 0; ti < nt && tries < nt * 20; tries++) {
    const a = rand() * Math.PI * 2, r = 25 + rand() * 300, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
    let ok = streamD(x, z) > span + 6;
    for (const i of samples) { const dx = T.pos[i * 3] - x, dz = T.pos[i * 3 + 2] - z; if (dx * dx + dz * dz < (T.half[i] + T.shoulder + 6) ** 2) { ok = false; break; } }
    if (!ok) continue;
    const y = heightAt(x, z), hgt = 4 + rand() * 4, s = 3 + rand() * 2.5;
    IM.position.set(x, y - 0.3, z); IM.rotation.set(0, 0, 0); IM.scale.set(1, hgt, 1); IM.updateMatrix(); trunks.setMatrixAt(ti++, IM.matrix);
    const pc = pinks[Math.floor(rand() * pinks.length)];
    for (let j = 0; j < 3; j++) {
      IM.position.set(x + (rand() - 0.5) * s, y + hgt + s * 0.4 + rand() * s * 0.5, z + (rand() - 0.5) * s); IM.scale.setScalar(s * (0.7 + rand() * 0.4)); IM.rotation.set(rand(), rand(), 0); IM.updateMatrix();
      crowns.setMatrixAt(ci, IM.matrix); crowns.setColorAt(ci++, C.set(pc).offsetHSL(0, 0, (rand() - 0.5) * 0.06));
    }
  }
  trunks.count = ti; crowns.count = ci;
  grp.add(trunks, crowns);
  // gift boxes (the slalom props): box + ribbon cross + bow, one merged mesh
  const gifts = [], gc = ['#ff8fb8', '#8fd8ff', '#ffd27a', '#b98bff'];
  T.props.forEach((pr, j) => {
    frameAt(T, pr.s, fr);
    const x = fr.pos[0] + fr.right[0] * pr.d, y = fr.pos[1] + fr.right[1] * pr.d, z = fr.pos[2] + fr.right[2] * pr.d, s = pr.r * 1.6, yaw = Math.atan2(fr.tan[0], fr.tan[2]) + 0.3 * j;
    const parts = [[new THREE.BoxGeometry(s, s, s), gc[j % 4]], [new THREE.BoxGeometry(s * 1.02, s * 1.02, s * 0.22), '#fff6dc'], [new THREE.BoxGeometry(s * 0.22, s * 1.02, s * 1.02), '#fff6dc'],
      [new THREE.TorusGeometry(s * 0.2, s * 0.07, 6, 12).rotateY(0.7).translate(-s * 0.15, s * 0.6, 0), '#fff6dc'], [new THREE.TorusGeometry(s * 0.2, s * 0.07, 6, 12).rotateY(-0.7).translate(s * 0.15, s * 0.6, 0), '#fff6dc']];
    for (const [g, c] of parts) { g.translate(0, s / 2, 0).rotateY(yaw).translate(x, y, z); const n = g.attributes.position.count, a = new Float32Array(n * 3); C.set(c); for (let q = 0; q < n; q++) a.set([C.r, C.g, C.b], q * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); gifts.push(g.index ? g.toNonIndexed() : g); }
  });
  if (gifts.length) { const gm = new THREE.Mesh(mergeGeometries(gifts), toon({ vertexColors: true })); gm.castShadow = true; grp.add(gm); }
  // paper boats bobbing on the stream
  const boatGeo = (() => { const g = new THREE.BufferGeometry(), v = [-1.2, 0, 0, 1.2, 0, 0, 0, 0.9, 0, -0.7, 0.5, 0.35, 0.7, 0.5, 0.35, -0.7, 0.5, -0.35, 0.7, 0.5, -0.35, -1.2, 0, 0, 1.2, 0, 0];
    g.setAttribute('position', new THREE.Float32BufferAttribute([-1.2, 0.5, 0.4, 1.2, 0.5, 0.4, 0, 0, 0, -1.2, 0.5, -0.4, 0, 0, 0, 1.2, 0.5, -0.4, -1.2, 0.5, 0.4, 0, 0, 0, -1.2, 0.5, -0.4, 1.2, 0.5, 0.4, 1.2, 0.5, -0.4, 0, 0, 0, -0.5, 0.5, 0, 0.5, 0.5, 0, 0, 1.4, 0], 3)); g.computeVertexNormals(); return g; })();
  G5.boats = [];
  for (let j = 0; j < 5; j++) {
    const b = new THREE.Mesh(boatGeo, toon({ color: ['#fff6dc', '#ffd6e7', '#d6f0ff'][j % 3], side: THREE.DoubleSide }));
    b.userData.u = (j - 2) * 40 + rand() * 10; b.userData.y = T.pos[mid * 3 + 1] - 2.5;
    grp.add(b); G5.boats.push(b);
  }
  G5.boatPath = { sx, sz, dirX, dirZ };
  // soft clouds in the paper sky (one Points draw)
  const ncl = Math.round(28 * density), cp = new Float32Array(ncl * 3), cc = new Float32Array(ncl * 3);
  for (let i = 0; i < ncl; i++) { const a = rand() * Math.PI * 2, r = 250 + rand() * 280; cp.set([cx + Math.cos(a) * r, 70 + rand() * 80, cz + Math.sin(a) * r], i * 3); C.set(rand() < 0.5 ? '#ffffff' : '#dcebff'); cc.set([C.r, C.g, C.b], i * 3); }
  grp.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(cp, 3)).setAttribute('color', new THREE.BufferAttribute(cc, 3)),
    new THREE.PointsMaterial({ size: 160, map: cloudTex(), vertexColors: true, transparent: true, depthWrite: false, fog: false, opacity: 0.9 })));
};

// ---------- Festival Night: a Korean lotus-lantern festival (Yeondeunghoe) under a full moon, painted like minhwa ----------
const LANTERN_COLS = ['#ff8fb8', '#7fe0ff', '#ffd27a'];
const waveTex = () => canvasTex(512, 256, (g, W2, H2) => { // a minhwa wave with curling foam scrolls, cut out on transparent paper
  const body = new Path2D('M0 256 L0 170 C60 160 120 120 170 60 C210 12 290 0 340 30 C380 55 380 100 350 110 C330 116 318 98 330 86 C300 80 280 110 300 140 C330 180 420 200 512 190 L512 256 Z');
  const gr = g.createLinearGradient(0, 0, 0, H2); gr.addColorStop(0, '#2f7fc1'); gr.addColorStop(0.6, '#1d4f8f'); gr.addColorStop(1, '#0f2350');
  g.fillStyle = gr; g.fill(body);
  g.strokeStyle = '#f3ead2'; g.lineWidth = 7; g.lineCap = 'round';
  for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(70 + i * 30, 230 - i * 14); g.quadraticCurveTo(110 + i * 28, 170 - i * 16, 160 + i * 22, 200 - i * 14); g.stroke(); }
  g.fillStyle = '#f6efdc'; // foam claws along the crest
  for (let i = 0; i < 14; i++) { const a = i / 13, x = 175 + a * 175, y = 58 - Math.sin(a * Math.PI) * 40; g.beginPath(); g.arc(x, y, 9 - a * 3, 0, 7); g.fill(); g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x + 2, y + 18); g.lineTo(x + 7, y); g.fill(); }
  g.lineWidth = 5; // foam scrolls, like the cloud scrolls on a folding screen
  for (const [x, y, r] of [[120, 205, 22], [235, 150, 18], [420, 222, 20]]) { g.beginPath(); for (let a = 0; a < 11; a += 0.25) g.lineTo(x + Math.cos(a) * r * a / 11, y + Math.sin(a) * r * a / 11); g.stroke(); }
  g.strokeStyle = '#0a1638'; g.lineWidth = 3; g.stroke(body);
});
const moonTex = () => canvasTex(256, 256, (g, s) => {
  const r = g.createRadialGradient(s / 2, s / 2, s * 0.2, s / 2, s / 2, s / 2);
  r.addColorStop(0, '#fff8e0'); r.addColorStop(0.36, '#fff3c4'); r.addColorStop(0.4, 'rgba(255,243,196,.5)'); r.addColorStop(1, 'rgba(255,243,196,0)');
  g.fillStyle = r; g.fillRect(0, 0, s, s);
  g.fillStyle = 'rgba(220,200,150,.25)'; for (const [x, y, rr] of [[110, 100, 14], [150, 140, 10], [120, 150, 8]]) { g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); }
});
// dancheong: the painted beams of the gates (and the big drum's body). Green field, banded red / blue / white ends, lotus medallions
const dancheongTex = () => canvasTex(1024, 96, (g, w2, h2) => {
  g.fillStyle = '#1f7a62'; g.fillRect(0, 0, w2, h2);
  g.fillStyle = '#c8321e'; g.fillRect(0, 0, w2, 10); g.fillRect(0, h2 - 10, w2, 10);
  g.fillStyle = '#ffd27a'; g.fillRect(0, 10, w2, 3); g.fillRect(0, h2 - 13, w2, 3);
  const bands = ['#1a1018', '#2f6fd1', '#f3ead2', '#c8321e', '#f3ead2', '#2f6fd1', '#ffd27a'];
  bands.forEach((col, i) => { g.fillStyle = col; g.fillRect(i * 12, 13, 12, h2 - 26); g.fillRect(w2 - (i + 1) * 12, 13, 12, h2 - 26); });
  g.strokeStyle = '#f3ead2'; g.lineWidth = 3; // a white zigzag running the length of the beam
  g.beginPath(); for (let x = 96; x < w2 - 96; x += 16) g.lineTo(x, x % 32 ? 24 : h2 - 24); g.stroke();
  const lotus = (x, r) => {
    g.fillStyle = '#2f6fd1'; g.beginPath(); g.arc(x, h2 / 2, r * 1.15, 0, 7); g.fill();
    g.fillStyle = '#ff8fb8'; g.strokeStyle = '#8b1a1a'; g.lineWidth = 2;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.ellipse(x + Math.cos(a) * r * 0.55, h2 / 2 + Math.sin(a) * r * 0.55, r * 0.45, r * 0.24, a, 0, 7); g.fill(); g.stroke(); }
    g.fillStyle = '#ffd27a'; g.beginPath(); g.arc(x, h2 / 2, r * 0.3, 0, 7); g.fill();
  };
  lotus(w2 / 2, 34); lotus(190, 26); lotus(w2 - 190, 26);
});
// buk drumhead: cream hide, a samtaegeuk (red / yellow / blue swirl) in the middle, a dark rim studded in gold
const bukTex = () => canvasTex(512, 512, (g, s) => {
  const c = s / 2, R = c * 0.62, sw = (a, t) => [c + Math.cos(a + 1.9 * (1 - t)) * R * t, c + Math.sin(a + 1.9 * (1 - t)) * R * t];
  g.fillStyle = '#f2e3c4'; g.beginPath(); g.arc(c, c, c, 0, 7); g.fill();
  ['#c8321e', '#f2b630', '#2f6fd1'].forEach((col, i) => { // each third: out along one swirl, round the rim, back down the next
    const a0 = i * Math.PI * 2 / 3, a1 = a0 + Math.PI * 2 / 3;
    g.fillStyle = col; g.beginPath(); g.moveTo(c, c);
    for (let k = 0; k <= 20; k++) g.lineTo(...sw(a0, k / 20));
    g.arc(c, c, R, a0, a1);
    for (let k = 20; k >= 0; k--) g.lineTo(...sw(a1, k / 20));
    g.fill();
  });
  g.strokeStyle = '#3a2208'; g.lineWidth = 4; g.beginPath(); g.arc(c, c, R, 0, 7); g.stroke();
  g.lineWidth = 26; g.beginPath(); g.arc(c, c, c - 13, 0, 7); g.stroke();
  g.fillStyle = '#ffd27a'; for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2; g.beginPath(); g.arc(c + Math.cos(a) * (c - 13), c + Math.sin(a) * (c - 13), 6, 0, 7); g.fill(); }
});
// lotus lantern: a lathe bowl whose rim splits into 8 petal tips, shaded by vertex colour (the instance colour tints it)
function lotusGeo() {
  const g = new THREE.LatheGeometry([[0.02, 0], [0.22, 0.04], [0.4, 0.16], [0.48, 0.32], [0.46, 0.48], [0.34, 0.6], [0.16, 0.56], [0.06, 0.44]].map(([x, y]) => new THREE.Vector2(x, y)), 16);
  const p = g.attributes.position, col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), tip = Math.cos(Math.atan2(z, x) * 4) ** 2, t = Math.max(0, (y - 0.2) / 0.4);
    p.setXYZ(i, x * (1 + 0.2 * t * tip), y + 0.14 * t * tip, z * (1 + 0.2 * t * tip));
    const k = (0.5 + 0.5 * y / 0.6) * (0.75 + 0.25 * tip); col.set([k, k, k], i * 3);
  }
  return g.setAttribute('color', new THREE.BufferAttribute(col, 3));
}
// giwa roof: a hipped tile roof (a 16-sided frustum squared off), the slopes sagging and the eaves sweeping up to the corners
function giwaRoof(w, d, h) {
  const g = new THREE.CylinderGeometry(0.3, 1, 1, 16, 3), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), t = 0.5 - y, a = Math.atan2(z, x), sq = 1 / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a))), corner = Math.sin(2 * a) ** 2;
    p.setXYZ(i, x * sq * w / 2, (y - Math.sin(Math.PI * t) * 0.16 + t * t * corner * 0.45) * h, z * sq * d / 2);
  }
  g.computeVertexNormals();
  return g;
}
// minhwa pine: a leaning red trunk under three flat layers of needles
function pineGeo() {
  return mergeGeometries([[new THREE.CylinderGeometry(0.35, 0.6, 8, 6).translate(0, 4, 0).rotateZ(0.12), '#a8402a'],
    [new THREE.IcosahedronGeometry(1, 1).scale(3.2, 0.8, 2.6).translate(0.9, 6.6, 0), '#1f5a44'],
    [new THREE.IcosahedronGeometry(1, 1).scale(2.6, 0.7, 2.2).translate(-1.4, 7.8, 0.4), '#2a6e50'],
    [new THREE.IcosahedronGeometry(1, 1).scale(1.9, 0.6, 1.7).translate(-0.4, 9, -0.2), '#2f7a58']].map(([g, c]) => colored(g, c)));
}
const BELL = [[1, 0], [0.82, 0.22], [0.6, 0.5], [0.38, 0.78], [0.16, 0.95], [0, 1]].map(([x, y]) => new THREE.Vector2(x, y));
const DRUM = [[3, -1.7], [3.3, -0.9], [3.45, 0], [3.3, 0.9], [3, 1.7]].map(([x, y]) => new THREE.Vector2(x, y));
function colored(g, c, k = 1) { const n = g.attributes.position.count, a = new Float32Array(n * 3); C.set(c).multiplyScalar(k); for (let i = 0; i < n; i++) a.set([C.r, C.g, C.b], i * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g.index ? g.toNonIndexed() : g; }
dress.fest = (grp, density) => {
  const rand = seeded(31);
  let cx = 0, cz = 0; for (let i = 0; i < T.n; i++) { cx += T.pos[i * 3] / T.n; cz += T.pos[i * 3 + 2] / T.n; }
  const near = []; for (let i = 0; i < T.n; i += 4) near.push(T.pos[i * 3], T.pos[i * 3 + 2]);
  const clear = (x, z, r) => { for (let i = 0; i < near.length; i += 2) if ((near[i] - x) ** 2 + (near[i + 1] - z) ** 2 < r * r) return false; return true; };
  const red = '#c8321e', stone = '#8a8fa3', gold = '#e0a640', wood = '#6a2216', tiles = '#2b3550';
  // everything static is merged by material: lit props, unlit lantern light, dancheong-painted wood, drumheads; lotus lanterns are instanced
  const parts = [], add = (g, c) => parts.push(colored(g, c));
  const glows = [], glow = (g, c, k = 1.6) => glows.push(colored(g, c, k));
  const paint = [], heads = [], lotus = []; // lotus: [x, y, z, scale, colour, brightness]
  const flat = g => g.index ? g.toNonIndexed() : g;

  // the horizon rides with each camera (nearHide), so the moon, the stars and the five peaks sit inside the race cameras' 420 m
  const sky = new THREE.Group();
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex(), color: new THREE.Color('#fff3c4').multiplyScalar(1.6), fog: false, depthWrite: false }));
  moon.position.set(-250, 190, -210); moon.scale.setScalar(90); sky.add(moon);
  const ns = 900, sp = new Float32Array(ns * 3); for (let i = 0; i < ns; i++) { const a = rand() * Math.PI * 2, u = 0.15 + rand() * 0.85, r = 395; sp.set([Math.cos(a) * r * Math.sqrt(1 - u * u), u * r * 0.6 + 40, Math.sin(a) * r * Math.sqrt(1 - u * u)], i * 3); }
  sky.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(sp, 3)), new THREE.PointsMaterial({ color: '#dfe8ff', size: 1.6, sizeAttenuation: false, fog: false })));
  // the five peaks of the Irworobongdo screen in the west, low hills all round; the feet fade into the fog colour
  const lo = new THREE.Color('#17284a'), hi = new THREE.Color('#4d8a64'), hills = [];
  const peak = (a, dist, w, h, top) => {
    const g = new THREE.LatheGeometry(BELL, 20).scale(w, h, w).translate(Math.cos(a) * dist, -24, Math.sin(a) * dist), p = g.attributes.position, col = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) { C.copy(lo).lerp(hi, ((p.getY(i) + 24) / h) ** 1.5 * top); col.set([C.r, C.g, C.b], i * 3); }
    hills.push(flat(g.setAttribute('color', new THREE.BufferAttribute(col, 3))));
  };
  const wa = Math.PI - 0.12;
  for (const [da, dist, w, h] of [[0, 360, 70, 150], [-0.22, 370, 60, 112], [0.22, 370, 60, 112], [-0.42, 380, 55, 82], [0.42, 380, 55, 82]]) peak(wa + da, dist, w, h, 1);
  for (let j = 0; j < 14; j++) { const a = wa + 0.7 + j * (Math.PI * 2 - 1.4) / 13; peak(a, 395, 45 + rand() * 25, 42 + rand() * 30, 0.55); }
  sky.add(new THREE.Mesh(mergeGeometries(hills), new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })));
  grp.add(sky); trackObj.sky = sky;

  // hongsalmun gates over every rung of the strip: red pillars on stone bases, two dancheong beams, lanterns hung under them
  for (const s of T.rungs) {
    frameAt(T, s, fr);
    const yaw = Math.atan2(fr.tan[0], fr.tan[2]), hw = at(T, T.half, s) + 1.6, x0 = fr.pos[0], y0 = fr.pos[1], z0 = fr.pos[2];
    const put = g => g.rotateY(yaw).translate(x0, y0, z0), wx = lx => x0 + Math.cos(yaw) * lx, wz = lx => z0 - Math.sin(yaw) * lx;
    for (const sd of [-1, 1]) {
      add(put(new THREE.CylinderGeometry(0.55, 0.62, y0 + 10.4, 12).translate(sd * hw, (y0 + 10.4) / 2 - 0.4 - y0, 0)), red);
      add(put(new THREE.CylinderGeometry(0.95, 1.05, 0.7, 8).translate(sd * hw, -0.05 - y0, 0)), stone);
      const lx = sd * (hw - 1.7), cl = sd * hw * 0.42; // a lotus lantern by each pillar, a blue-and-red cheongsachorong further in
      lotus.push([wx(lx), y0 + 5.5, wz(lx), 1.3, '#ff8fb8', GLOW * 0.8]);
      add(put(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 4).translate(lx, 6.65, 0)), '#3a2208');
      add(put(new THREE.ConeGeometry(0.14, 0.6, 6).rotateX(Math.PI).translate(lx, 5.2, 0)), gold);
      glow(put(new THREE.BoxGeometry(0.6, 0.45, 0.6).translate(cl, 6.4, 0)), '#2f6fd1');
      glow(put(new THREE.BoxGeometry(0.6, 0.45, 0.6).translate(cl, 5.95, 0)), red);
      for (const y of [6.68, 5.7]) add(put(new THREE.BoxGeometry(0.72, 0.1, 0.72).translate(cl, y, 0)), gold);
      add(put(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 4).translate(cl, 6.85, 0)), '#3a2208');
      add(put(new THREE.ConeGeometry(0.12, 0.55, 6).rotateX(Math.PI).translate(cl, 5.35, 0)), gold);
    }
    paint.push(flat(put(new THREE.BoxGeometry(hw * 2 + 3, 1.5, 1.1).translate(0, 9.6, 0))), flat(put(new THREE.BoxGeometry(hw * 2, 1, 0.8).translate(0, 7.5, 0))));
    add(put(new THREE.BoxGeometry(hw * 2 + 3.6, 0.35, 1.4).translate(0, 10.52, 0)), tiles);
  }
  // a big buk drum on its stand at the tunnel's mouth, outside the track, its head turned to the oncoming karts
  if (T.rungs.length) {
    const s = T.rungs[0] - 16; frameAt(T, s, fr);
    const o = -(at(T, T.half, s) + 11), x = fr.pos[0] + fr.right[0] * o, z = fr.pos[2] + fr.right[2] * o;
    const nx = -fr.tan[0] * 0.77 + fr.right[0] * 0.64, nz = -fr.tan[2] * 0.77 + fr.right[2] * 0.64, put = g => g.rotateY(Math.atan2(-nz, nx)).translate(x, -0.4, z), cy = 4.9;
    paint.push(flat(put(new THREE.LatheGeometry(DRUM, 32).rotateZ(Math.PI / 2).translate(0, cy, 0))));
    for (const sd of [-1, 1]) {
      heads.push(flat(put(new THREE.CircleGeometry(3, 40).rotateY(sd * Math.PI / 2).translate(sd * 1.72, cy, 0))));
      add(put(new THREE.TorusGeometry(3, 0.12, 6, 32).rotateY(Math.PI / 2).translate(sd * 1.7, cy, 0)), gold);
      for (const lz of [-2.3, 2.3]) add(put(new THREE.BoxGeometry(0.45, 2.9, 0.45).translate(sd * 1.1, 1.45, lz)), wood);
      add(put(new THREE.BoxGeometry(0.4, 0.4, 5).translate(sd * 1.1, 2.6, 0)), wood);
    }
    add(put(new THREE.BoxGeometry(4, 0.35, 6).translate(0, 0.17, 0)), '#4a1a12');
  }
  // octagonal stone lanterns (seokdeung): plinth, pillar, lotus capital, the lit fire chamber, roof, finial
  const seokdeung = (x, y, z, k) => {
    for (const [g, h, c] of [[new THREE.CylinderGeometry(0.9, 1.05, 0.45, 8), 0.22, stone], [new THREE.CylinderGeometry(0.28, 0.32, 1.5, 8), 1.2, stone], [new THREE.CylinderGeometry(0.75, 0.4, 0.35, 8), 2.12, stone],
      [new THREE.ConeGeometry(1, 0.55, 8), 3.32, '#6f7388'], [new THREE.SphereGeometry(0.18, 8, 6), 3.75, '#6f7388']]) add(g.scale(k, k, k).translate(x, y + h * k, z), c);
    glow(new THREE.CylinderGeometry(0.4, 0.4, 0.75, 8).scale(k, k, k).translate(x, y + 2.68 * k, z), '#ffcf7a', 1.3);
  };
  for (let s = 8; s < T.L * 0.13; s += 16) for (const sd of [-1, 1]) { // along the start straight
    frameAt(T, s, fr); const o = sd * (at(T, T.half, s) + 3.2);
    seokdeung(fr.pos[0] + fr.right[0] * o, -0.4, fr.pos[2] + fr.right[2] * o, 1.4);
  }
  // the stone arch bridge over the lotus pond (the crest jump), and a palace pavilion standing in the pond beyond it
  let b0 = -1, b1 = -1, top = 0;
  for (let i = 0; i < T.n; i++) if (T.pos[i * 3 + 1] > 4) { if (b0 < 0) b0 = i; b1 = i; if (T.pos[i * 3 + 1] > T.pos[top * 3 + 1]) top = i; }
  if (b0 >= 0) {
    for (const sd of [-1, 1]) {
      const pts = [];
      for (let i = b0 - 14; i <= b1 + 14; i += 2) { const j = (i + T.n) % T.n, o = sd * (T.half[j] + 0.4); pts.push(new THREE.Vector3(T.pos[j * 3] + T.right[j * 3] * o, T.pos[j * 3 + 1] - 0.5, T.pos[j * 3 + 2] + T.right[j * 3 + 2] * o)); }
      add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 2, 0.45, 8, false), stone);
      for (let i = b0 + 6; i <= b1 - 6; i += 14) { // arches on both faces: a stone ring round a dark opening
        const yaw = Math.atan2(T.tan[i * 3], T.tan[i * 3 + 2]) - Math.PI / 2 + (sd < 0 ? Math.PI : 0), o = sd * (T.half[i] + 0.3), r = Math.min(5, T.pos[i * 3 + 1] - 1.4);
        const x = T.pos[i * 3] + T.right[i * 3] * o, z = T.pos[i * 3 + 2] + T.right[i * 3 + 2] * o;
        add(new THREE.CircleGeometry(r, 16, 0, Math.PI).rotateY(yaw).translate(x, -0.4, z), '#0b1430');
        add(new THREE.TorusGeometry(r + 0.4, 0.45, 6, 16, Math.PI).rotateY(yaw).translate(x, -0.4, z), stone);
      }
    }
    const tx = T.pos[top * 3], tz = T.pos[top * 3 + 2]; let ox = T.right[top * 3], oz = T.right[top * 3 + 2];
    const ol = Math.hypot(ox, oz) * (Math.sign((tx - cx) * ox + (tz - cz) * oz) || 1); ox /= ol; oz /= ol; // outward, away from the infield
    const px = tx + ox * 20, pz = tz + oz * 20, pr = 44, vx = tx + ox * 46, vz = tz + oz * 46;
    const pond = new THREE.Mesh(new THREE.CircleGeometry(pr, 48).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#173f7a', roughness: 0.08, metalness: 0.3, envMapIntensity: 1.6 }));
    pond.position.set(px, -0.3, pz); grp.add(pond);
    for (let j = 0; j < 60 * density; j++) { // lotus pads, a few in flower
      const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * (pr - 3), x = px + Math.cos(a) * r, z = pz + Math.sin(a) * r;
      if (!clear(x, z, 12) || (x - vx) ** 2 + (z - vz) ** 2 < 150) continue;
      add(new THREE.CircleGeometry(0.8 + rand() * 1.2, 10, 0.5, Math.PI * 2 - 0.9).rotateX(-Math.PI / 2).rotateY(rand() * 6).translate(x, -0.24, z), rand() < 0.5 ? '#2f7a4a' : '#3f8d58');
      if (rand() < 0.3) lotus.push([x, -0.2, z, 0.9, '#ff8fb8', 1.3]);
    }
    for (let j = 0; j < 7; j++) { const a = j * 0.9, x = px + Math.cos(a) * (pr + 4), z = pz + Math.sin(a) * (pr + 4); if (clear(x, z, 12)) seokdeung(x, -0.4, z, 1.3); }
    // the pavilion faces the bridge: stone piers and platform, red columns round a lit hall, two giwa roofs
    const put = g => g.rotateY(Math.atan2(-ox, -oz)).translate(vx, -0.4, vz);
    for (const lx of [-8, 8]) for (const lz of [-5, 5]) add(put(new THREE.BoxGeometry(1.4, 3.4, 1.4).translate(lx, 1.7, lz)), stone);
    add(put(new THREE.BoxGeometry(22, 1.2, 15).translate(0, 4, 0)), stone);
    for (const lx of [-9, -3, 3, 9]) for (const lz of [-6, 6]) add(put(new THREE.CylinderGeometry(0.38, 0.42, 5, 8).translate(lx, 7.1, lz)), red);
    glow(put(new THREE.BoxGeometry(16, 3.6, 9).translate(0, 6.6, 0)), '#ffb547', 1.3);
    add(put(new THREE.BoxGeometry(21, 0.5, 14).translate(0, 9.4, 0)), wood);
    add(put(giwaRoof(27, 19, 3).translate(0, 11.1, 0)), tiles);
    for (const lx of [-4.6, 4.6]) for (const lz of [-2.6, 2.6]) add(put(new THREE.CylinderGeometry(0.3, 0.3, 3.2, 8).translate(lx, 13.4, lz)), red);
    glow(put(new THREE.BoxGeometry(9, 3, 5).translate(0, 13.4, 0)), '#ffb547', 1.3);
    add(put(giwaRoof(17, 11, 3.4).translate(0, 16.7, 0)), tiles);
    add(put(new THREE.BoxGeometry(6, 0.6, 0.7).translate(0, 18.5, 0)), '#1d2438');
  }
  // giant lotus lanterns on the last straight (the props): a glowing flower on a lacquer plinth
  for (const pr of T.props) {
    frameAt(T, pr.s, fr); const x = fr.pos[0] + fr.right[0] * pr.d, y = fr.pos[1] + fr.right[1] * pr.d, z = fr.pos[2] + fr.right[2] * pr.d;
    add(new THREE.CylinderGeometry(pr.r * 0.8, pr.r * 0.9, 0.3, 8).translate(x, y + 0.15, z), '#5a1a14');
    lotus.push([x, y + 0.25, z, pr.r * 1.8, '#ff8fb8', GLOW * 0.9]);
  }
  // lotus lanterns on the rails: pink / cyan / gold
  for (let i = 0; i < T.n; i += 9) for (const sd of [-1, 1]) {
    frameAt(T, i * T.ds, fr); const o = sd * railOff(T, i);
    lotus.push([fr.pos[0] + fr.right[0] * o, fr.pos[1] + fr.right[1] * o + 0.95, fr.pos[2] + fr.right[2] * o, 1, LANTERN_COLS[(i / 9 + (sd > 0)) % 3 | 0], GLOW * 0.8]);
  }
  const props = new THREE.Mesh(mergeGeometries(parts), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, metalness: 0.05 }));
  props.castShadow = true;
  const dt = dancheongTex();
  grp.add(props, new THREE.Mesh(mergeGeometries(glows), new THREE.MeshBasicMaterial({ vertexColors: true })),
    new THREE.Mesh(mergeGeometries(paint), new THREE.MeshStandardMaterial({ map: dt, emissiveMap: dt, emissive: '#ffffff', emissiveIntensity: 0.25, roughness: 0.55, side: THREE.DoubleSide })));
  if (heads.length) grp.add(new THREE.Mesh(mergeGeometries(heads), new THREE.MeshStandardMaterial({ map: bukTex(), roughness: 0.6 })));
  const lot = new THREE.InstancedMesh(lotusGeo(), new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }), lotus.length);
  lotus.forEach(([x, y, z, s, c, k], i) => { IM.position.set(x, y, z); IM.rotation.set(0, i, 0); IM.scale.setScalar(s); IM.updateMatrix(); lot.setMatrixAt(i, IM.matrix); lot.setColorAt(i, C.set(c).multiplyScalar(k)); });
  grp.add(lot);
  // red-trunked pines round the infield and beyond (instanced), clear of the road and the pond
  const nt = Math.round(70 * density), pines = new THREE.InstancedMesh(pineGeo(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 }), nt);
  let ti = 0;
  for (let tries = 0; ti < nt && tries < nt * 20; tries++) {
    const a = rand() * Math.PI * 2, r = 30 + rand() * 250, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
    if (!clear(x, z, 16) || (b0 >= 0 && (x - T.pos[top * 3]) ** 2 + (z - T.pos[top * 3 + 2]) ** 2 < 75 ** 2)) continue;
    IM.position.set(x, -0.4, z); IM.rotation.set(0, rand() * 6.3, 0); IM.scale.setScalar(0.9 + rand() * 0.7); IM.updateMatrix(); pines.setMatrixAt(ti++, IM.matrix);
  }
  pines.count = ti; grp.add(pines);
  // minhwa waves rising beside the whirlpool curve: flat cut-outs, like a painted screen
  const wt = waveTex(), wm = new THREE.MeshBasicMaterial({ map: wt, transparent: true, side: THREE.DoubleSide, alphaTest: 0.05, fog: true });
  for (const m of T.mouths) for (let j = 0; j < Math.round(3 * density); j++) {
    frameAt(T, m.s + (j - 1) * 30, fr); const sd = Math.sign(m.d) || 1, o = sd * (at(T, T.half, m.s) + 22 + rand() * 12);
    const wv = new THREE.Mesh(new THREE.PlaneGeometry(34, 17), wm);
    wv.position.set(fr.pos[0] + fr.right[0] * o, 7.5, fr.pos[2] + fr.right[2] * o); wv.rotation.y = Math.atan2(fr.tan[0], fr.tan[2]) + Math.PI / 2 * sd;
    grp.add(wv);
  }
  // plum petals drifting down round P1 (instanced quads)
  const np = Math.round(260 * density), pm = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.28, 0.2), new THREE.MeshBasicMaterial({ color: '#ffc2dc', side: THREE.DoubleSide, transparent: true, opacity: 0.9 }), np);
  pm.frustumCulled = false;
  petals = { pm, p: Array.from({ length: np }, () => ({ x: (rand() - 0.5) * 70, y: rand() * 22, z: (rand() - 0.5) * 70, r: rand() * 6, w: 1 + rand() * 2 })) };
  grp.add(pm);
};
let petals = null;
function petalStep(dt) {
  if (!petals || !views.length) return;
  const c = views[0].cam.position, still = reduceMotion.matches;
  for (let i = 0; i < petals.p.length; i++) {
    const q = petals.p[i];
    q.y -= dt * 1.2; q.x += Math.sin(time + i) * dt * 0.8; q.r += dt * q.w * (still ? 0 : 1);
    if (q.y < -2) q.y += 24;
    // wrap round the camera so the field always surrounds it
    const x = c.x + ((q.x - c.x) % 70 + 105) % 70 - 35, z = c.z + ((q.z - c.z) % 70 + 105) % 70 - 35;
    IM.position.set(x, c.y - 6 + q.y, z); IM.rotation.set(q.r, q.r * 0.7, 0); IM.scale.setScalar(1); IM.updateMatrix();
    petals.pm.setMatrixAt(i, IM.matrix);
  }
  petals.pm.instanceMatrix.needsUpdate = true;
}
// fireworks on the music's phrase ends: a burst of sparks high over the track near P1
const FW = ['#ff5d8f', '#ffd27a', '#7fe0ff', '#b98bff', '#5dffb0', '#ff8a3a'];
export function firework() {
  if (!trackObj || !views.length || T.id !== 'fest') return;
  const c = views[0].cam.position, d = views[0].dir, r = 100 + Math.random() * 60, x = c.x + d.x * r + (Math.random() - 0.5) * 110, z = c.z + d.z * r + (Math.random() - 0.5) * 110, y = c.y + 30 + Math.random() * 25;
  const col = FW[Math.random() * FW.length | 0];
  burst(x, y, z, col, 80, 24, 1.5, 4.2, 0, 3);
  burst(x, y, z, '#ffffff', 24, 11, 0.8, 3.2, 0, 2);
}
export const _scene = () => scene; // debug: inspect the race scene
