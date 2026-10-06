// The 3D race: a three.js view of a TrackDef and a running sim. Builds the diorama (merged track, instanced pegs and
// posts, the start fan, the carousel, wormholes, the finish rack), draws the marbles (glass shell, rolling band,
// upright animal face, halo, trail), runs the camera director and the effects, and steps the sim on a fixed clock.
// game.js owns the flow and the DOM; it drives this through createRace()'s API and hears back through hooks.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries, toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
import RAPIER from 'rapier';
import { R, MR, FS, F, TUBE, TRAPF, GLASS, frameAt, stallAt, boomGeo, splitsOf, expressAt, sectorOf as sectorAt } from './track.js';
import { createSim, centreLine, DT, flapAngle, ringAngle, doorClock, doorAngle, forkWay, DOOR_A, WARP, DONE, COIL, TRAP as TRAPPED } from './sim.js';

export const ready = RAPIER.init();

// ---------- tuning (view) ----------
const PASTEL = ['#ff8fb1', '#b98bff', '#4fd8ff']; // module colours: pink, lavender, cyan (3D Toy Diorama)
const ICE = '#a9d4ff', HOT = '#ff5a2a'; // status tints: OUCH! (frozen) shell, ATTACK! shell / halo / trail
const HOLE = ['#c86bff', '#2fe3a0', '#ff5c93']; // one colour per wormhole
const TRAP = '#ff8a3d'; // trap pads and lanes: warning orange
const RW = ['#ffd54a', '#4fd8ff', '#c86bff']; // a roulette's sectors and exits: JACKPOT, NEXT, LOST
const FW = ['#5dffb0', '#ffffff', '#ff8a3d']; // a fork's lamps: EXPRESS, MAIN, LONG
const COILC = ['#ffb347', '#b4ff5a'], coilC = sd => COILC[sd > 0 ? 1 : 0]; // a narrow helix's coils, one colour each: side -1 amber, +1 lime
const MUDDY = '#5a381c', COAT_T = 1.6, SINK = 0.14; // mud: shell coat colour, seconds it takes to dry off, how deep a marble wades
const GOLD = '#ffc861', PEARL = '#f5f2ff', POST = '#6b5a9a';
const THICK = 0.18; // visible shell of a channel
const NEON = 1.25; // neon lip brightness: just over the bloom threshold, a rim light rather than a glow
const CREASE = Math.PI / 4; // track shading: faces meeting under this angle shade smooth (curves), over it stay sharp (lips, box corners)
const TRAIL = 24, TRAIL_GAP = 0.1, TRAIL_LEN = 2.3; // trail: points per marble, spacing they are laid at, length it fades out over (~2.5 marbles)
const LABEL_MAX = 12;
const HOP = 0.6; // s: hop from the finish line into a rack cup
const FT_SMOOTH = 0.05, FT_SLOW = 1 / 26; // adaptive quality: smoothed frame time, step down above this (iOS Low Power = 30)
const QKEY = 'marble-racing.q';
const TIERS = ['high', 'medium', 'low'];
const HALF_POS = 0.25, HALF_LOOK = 0.15; // camera springs, half-lives (s)
const LEAD_GAP = 2; // the auto camera rides the 1st marble; a new leader takes it once ahead by this much (near-ties don't flick it)
const SNAP = 8; // the view's target jumps further than this (a warp, a far cut, the finish): cut, don't fly
// the last moments' shot: takes over once the leader is this far short of the final bend; from in front of the finish
// line, looking back up the course, it frames the front-runners (up to LAST_N within LAST_PACK of the leader's
// progress) at least LAST_R round, LAST_UP lower than the race rig (~25°): it looks through the arch, under its banner
const LAST_IN = 10, LAST_N = 3, LAST_PACK = 3, LAST_R = 4.5, LAST_UP = -0.3, LAST_LEAN = 0.75;
const SIGN_KICK = new Set(['boost', 'jump', 'boomUp', 'warpIn', 'trapIn', 'fork', 'rideIn', 'basinIn', 'mudIn', 'mistIn', 'tubeIn', 'coilIn']); // sim events that flare a mod's sign
const SHOW = new Set(['pegs', 'jump', 'narrow', 'trapdoor', 'mist', 'carousel', 'basin', 'whirlpool', 'boomerang']); // the camera eases out over these
const ZOOM_HALF = 0.6, ZOOM_MAX = 11; // that ease (half-life, s) and the widest it frames (radius)
// the flyover: cruise and showcase-mod speeds (units/s), speed at its two ends, its accel/brake (units/s²), longest it runs (s)
const PEEK_V = 120, PEEK_SHOW = 20, PEEK_END = 10, PEEK_A = 160, PEEK_MAX = 14, PEEK_HOLD = 0.7; // PEEK_HOLD: on each mod's neon sign (s)
const SPIN_T = 2.7, SPIN_TURNS = 2; // the start wheel's spin during the countdown: seconds, extra whole turns

const v3 = () => new THREE.Vector3();
const col = h => new THREE.Color(h);
const MUD_C = col(MUDDY), ICE_C = col(ICE), HOT_C = col(HOT), DRY_C = col('#b07a48'), PEARL_C = col(PEARL), FW_C = FW.map(col), BLACK = col('#000'); // parsed once, used every frame
const mixWhite = (h, f = 0.5) => col(h).lerp(col('#ffffff'), f);
const smooth = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
const damp = (half, dt) => 1 - Math.pow(2, -dt / half); // critically damped-ish spring step for a half-life

// ---------- canvas textures ----------
const canvas = (w, h = w) => Object.assign(document.createElement('canvas'), { width: w, height: h });
const tex = (c, srgb = true) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };
function softDot(size = 64, hard = 0) {
  const c = canvas(size), g = c.getContext('2d'), r = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  r.addColorStop(0, '#fff'); r.addColorStop(hard, 'rgba(255,255,255,.9)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, size, size);
  return tex(c);
}
// SVG markup (viewBox 0 0 32 32 by default) -> canvas, via an <img>; resolves once decoded
const svgCanvas = (inner, size, viewBox = '0 0 32 32') => new Promise(res => {
  const img = new Image(), c = canvas(size);
  img.onload = () => { c.getContext('2d').drawImage(img, 0, 0, size, size); res(c); };
  img.onerror = () => res(c);
  img.src = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${size}" height="${size}">${inner}</svg>`);
});
const $ = s => document.querySelector(s);
// pupil centres of animal z (LADDER eyes()), for the blink and hurt variants
const eyes = z => [...$('#a' + z).querySelectorAll('.e [fill="#2b2140"] circle')].map(c => [+c.getAttribute('cx'), +c.getAttribute('cy')]).sort((p, q) => p[0] - q[0]);
function faceSvg(z, kind) {
  const s = $('#a' + z).cloneNode(true), e = s.querySelector('.e');
  if (kind === 'blink') { const [[, y]] = eyes(z); e.setAttribute('transform', `translate(0 ${y}) scale(1 .1) translate(0 ${-y})`); }
  if (kind === 'hurt') { // LADDER hurtFace(): > < eyes, a plaster, a sweat drop
    const [l, r] = eyes(z);
    e.insertAdjacentHTML('afterend', `<path d="M${l[0] - 1.6} ${l[1] - 1.4}L${l[0] + 1.2} ${l[1]}L${l[0] - 1.6} ${l[1] + 1.4}M${r[0] + 1.6} ${r[1] - 1.4}L${r[0] - 1.2} ${r[1]}L${r[0] + 1.6} ${r[1] + 1.4}" fill="none" stroke="#2b2140" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><g transform="translate(${r[0] + 2.2} ${r[1] - 5}) rotate(-35)"><rect x="-3.6" y="-1.3" width="7.2" height="2.6" rx="1.3" fill="#ffdcae" stroke="#c98a5a" stroke-width=".5"/><rect x="-1.1" y="-1.3" width="2.2" height="2.6" fill="#f0b07c"/></g><path d="M${l[0] - 3.4} ${l[1] - 5.2}q-1.5 2.1 0 3q1.5-.9 0-3z" fill="#8fd8ff" stroke="#2b6a9a" stroke-width=".45"/>`);
    e.remove();
  }
  if (kind === 'mud') { // splattered: lumpy brown splats on the brow and cheeks (eyes left clear), a drip, a wet glint each
    const [l, r] = eyes(z);
    const bx = r[0] + 1, by = r[1] - 5, cx = l[0] - 2.8, cy = l[1] + 3.8;
    s.insertAdjacentHTML('beforeend', `<g fill="#6b4524" stroke="#3f2512" stroke-width=".35">${splat(bx, by, 2.5)}${splat(cx, cy, 2.1)}${splat(r[0] + 2.6, r[1] + 5.6, 1.4)}${splat(l[0] - 1, l[1] - 7, 1.2)}<path d="M${cx - 0.5} ${cy + 1.6}q-.5 2.8.35 4q.95-1.1.45-4z"/></g><g fill="#c49464" opacity=".85"><ellipse cx="${bx - 0.7}" cy="${by - 0.7}" rx=".7" ry=".4"/><ellipse cx="${cx - 0.5}" cy="${cy - 0.6}" rx=".55" ry=".3"/></g>`);
  }
  return $('#ol').outerHTML + s.innerHTML;
}
// the mud cell covers the whole marble (its billboard grows to the shell's size): the face shrunk to its usual size in
// the middle, mud caked over the bottom third up to the chin, splats and a drip round the rim, wet glints
const FACE_IN_SHELL = 0.625; // face billboard / shell diameter (R * 1.25 / 2R)
const splat = (x, y, s) => `<circle cx="${x}" cy="${y}" r="${s}"/>` + [0.6, 2.4, 4.3].map((a, k) => `<circle cx="${x + Math.cos(a) * s * 1.05}" cy="${y + Math.sin(a) * s * 0.95}" r="${s * [0.45, 0.35, 0.3][k]}"/>`).join('');
const MUD_COAT = `<defs><clipPath id="mc"><circle cx="16" cy="16" r="15.2"/></clipPath></defs><g clip-path="url(#mc)">
  <path fill="#5a381c" d="M0 21.6q2.6-2.4 5.4-.9q2.8-2.3 6.1-.6q3.4-2.5 6.8-.3q3-2.1 6-.7q3.1-1.7 7.7.4V32H0z"/>
  <g fill="#5a381c">${splat(4.6, 9.6, 2.3)}${splat(26.4, 8.2, 1.9)}${splat(28.2, 15.4, 1.3)}<path d="M3.9 11.2q-.6 3.4.45 4.8q1.15-1.3.5-4.8z"/><path d="M26.6 9.6q-.4 2.4.35 3.4q.85-.9.35-3.4z"/></g>
  <g fill="#3f2512">${splat(8, 26.5, 1.4)}${splat(19.5, 28, 1.7)}<circle cx="13.5" cy="24.3" r=".9"/><circle cx="25" cy="24.8" r="1"/></g>
  <g fill="#c49464" opacity=".8"><ellipse cx="10" cy="23.4" rx="1.6" ry=".5"/><ellipse cx="22.6" cy="23" rx="1.2" ry=".4"/><ellipse cx="4" cy="8.8" rx=".8" ry=".4"/></g></g>`;
// one atlas for every face: 20 animals x (normal, blink, hurt, mud), 128 px cells, 9 to a row
const CELL = 128, ACOLS = 9;
async function faceAtlas() {
  const c = canvas(ACOLS * CELL), g = c.getContext('2d'), jobs = [], coat = svgCanvas(MUD_COAT, CELL);
  for (let z = 0; z < 20; z++) ['n', 'blink', 'hurt', 'mud'].forEach((kind, v) => {
    const k = z * 4 + v, x = (k % ACOLS) * CELL, y = Math.floor(k / ACOLS) * CELL, m = (1 - FACE_IN_SHELL) / 2 * CELL;
    jobs.push(svgCanvas(faceSvg(z, kind), CELL).then(f => kind === 'mud'
      ? coat.then(cc => { g.drawImage(f, x + m, y + m, CELL * FACE_IN_SHELL, CELL * FACE_IN_SHELL); g.drawImage(cc, x, y); })
      : g.drawImage(f, x, y)));
  });
  await Promise.all(jobs);
  const t = tex(c);
  t.anisotropy = 4;
  return t;
}
const atlasUV = (z, v) => { const k = z * 4 + v; return [(k % ACOLS) / ACOLS, 1 - (Math.floor(k / ACOLS) + 1) / ACOLS, 1 / ACOLS]; };
// floating label text: drawn once per (text, colour), then only moved and faded (LADDER v1.118)
const labelCache = new Map();
function labelTex(text, color) {
  const key = text + color;
  if (!labelCache.has(key)) {
    const font = '800 44px Pretendard, system-ui, sans-serif', m = canvas(8).getContext('2d');
    m.font = font;
    const w = Math.ceil(m.measureText(text).width) + 20, c = canvas(w, 64), g = c.getContext('2d');
    g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = 6; g.strokeStyle = 'rgba(10,6,30,.85)'; g.strokeText(text, w / 2, 34);
    g.fillStyle = color; g.fillText(text, w / 2, 34);
    labelCache.set(key, { t: tex(c), aspect: w / 64 });
  }
  return labelCache.get(key);
}

// ---------- shaders: billboards (faces, halos), particles ----------
// instanced camera-facing quads: bb = x y z size, tint = rgb a, uvr = atlas u v scale + roll
function billboards(count, map, additive, depthTest = true) {
  const g = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneGeometry(1, 1));
  g.instanceCount = count;
  for (const [k, n] of [['bb', 4], ['tint', 4], ['uvr', 4]]) g.setAttribute(k, new THREE.InstancedBufferAttribute(new Float32Array(count * n), n).setUsage(THREE.DynamicDrawUsage));
  const m = new THREE.ShaderMaterial({
    uniforms: { map: { value: map } }, transparent: true, depthWrite: false, depthTest,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    vertexShader: `attribute vec4 bb; attribute vec4 tint; attribute vec4 uvr; varying vec2 vUv; varying vec4 vTint;
      void main() {
        vec4 mv = modelViewMatrix * vec4(bb.xyz, 1.0);
        float c = cos(uvr.w), s = sin(uvr.w);
        mv.xy += mat2(c, s, -s, c) * position.xy * bb.w;
        vUv = uvr.xy + uv * uvr.z; vTint = tint;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying vec4 vTint;
      void main() { vec4 t = texture2D(map, vUv); gl_FragColor = vec4(t.rgb * vTint.rgb, t.a * vTint.a); if (gl_FragColor.a < 0.004) discard;
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(g, m);
  mesh.frustumCulled = false;
  return mesh;
}
function particleSystem(count, map) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('pcol', new THREE.BufferAttribute(new Float32Array(count * 4), 4).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('psize', new THREE.BufferAttribute(new Float32Array(count), 1).setUsage(THREE.DynamicDrawUsage));
  const m = new THREE.ShaderMaterial({
    uniforms: { map: { value: map }, scale: { value: 400 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute vec4 pcol; attribute float psize; uniform float scale; varying vec4 vCol;
      void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = psize * scale / -mv.z; vCol = pcol; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D map; varying vec4 vCol;
      void main() { vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = vec4(vCol.rgb, vCol.a * t.a); if (gl_FragColor.a < 0.004) discard;
        #include <colorspace_fragment>
      }`,
  });
  const p = new THREE.Points(g, m);
  p.frustumCulled = false;
  return p;
}

// ---------- the race ----------
export async function createRace(cv, hooks = {}) {
  await ready;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)'), touch = matchMedia('(pointer: coarse)').matches;
  // quality: remembered per device; High on desktop, Medium on touch screens; steps down, never up (LADDER rule)
  let tier = (() => { try { return localStorage.getItem(QKEY); } catch { return null; } })();
  if (!TIERS.includes(tier)) tier = touch ? 'medium' : 'high';
  let dprCap = 2;

  // no MSAA on the canvas: the scene renders into the composer's target, so the canvas only ever got one full-screen
  // quad (the multisampled buffer cost memory and a resolve every frame for nothing). High tier at DPR < 2 (a PC
  // monitor) gets MSAA on the composer target instead, where the scene is drawn
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false, powerPreference: 'high-performance' });
  renderer.transmissionResolutionScale = 0.5; // High's glass refracts a half-size copy of the scene (it was a full-size 4x MSAA one)
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping ?? THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85; // pastel plastic under the key light sat near white at 1
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(45, 1, 0.1, 400);
  const envMap = () => { const g = new THREE.PMREMGenerator(renderer); scene.environment?.dispose(); scene.environment = g.fromScene(new RoomEnvironment(), 0.04).texture; g.dispose(); };
  envMap();
  scene.environmentIntensity = 0.65;
  scene.fog = new THREE.FogExp2('#120d33', 0.0065);

  // sky: gradient, stars, three drifting coloured haze blobs (LADDER's .bg, in 3D)
  const sky = canvas(4, 1024), sg = sky.getContext('2d'), grad = sg.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0, '#171046'); grad.addColorStop(0.55, '#100b33'); grad.addColorStop(1, '#080720');
  sg.fillStyle = grad; sg.fillRect(0, 0, 4, 1024);
  scene.background = tex(sky);
  const dot = softDot(64, 0.15), soft = softDot(128, 0);
  {
    const N = 600, p = new Float32Array(N * 3), c = new Float32Array(N * 3), r = Math.random;
    const tints = [col('#ffffff'), col('#cfc6ff'), col('#bfeaff')];
    for (let i = 0; i < N; i++) {
      const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u), d = 260;
      p.set([Math.cos(a) * s * d, Math.abs(u) * d * 0.9 - 30, Math.sin(a) * s * d], i * 3);
      const t = tints[i % 3]; c.set([t.r, t.g, t.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    const stars = new THREE.Points(g, new THREE.PointsMaterial({ size: 1.5, sizeAttenuation: false, vertexColors: true, fog: false, map: dot, transparent: true, depthWrite: false }));
    scene.add(stars);
  }
  const blobs = [['#5b2bff', 0.2], ['#ff3d7f', 0.12], ['#00b8ff', 0.1]].map(([c, a], k) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color: c, opacity: a, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    s.scale.setScalar(260); s.userData.k = k; s.renderOrder = -10;
    scene.add(s);
    return s;
  });

  // lights: the key from the top-left front (LADDER lights everything from there)
  scene.add(new THREE.HemisphereLight('#9b6bff', '#ff5d8f', 0.35));
  const key = new THREE.DirectionalLight('#fff3e6', 1.7);
  key.position.set(-30, 50, 40);
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 140 });
  key.shadow.bias = -0.0005; key.shadow.normalBias = 0.03;
  scene.add(key, key.target);

  // post: bloom catches only the emissive / neon parts (threshold), at half resolution
  let composer = null, bloom = null;
  function setupPost() {
    composer?.dispose(); composer = null; bloom = null;
    if (tier === 'low') return;
    const msaa = tier === 'high' && Math.min(dprCap, devicePixelRatio || 1) < 2 ? 4 : 0;
    composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: msaa }));
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), tier === 'high' ? 0.28 : 0.2, 0.2, 1.15);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    sizeAll();
  }
  function sizeAll() {
    const w = cv.clientWidth || innerWidth, h = cv.clientHeight || innerHeight, dpr = Math.min(dprCap, devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = 45 + 15 * Math.min(1, Math.max(0, (1.3 - camera.aspect) / 0.75)); // wider on a phone held upright
    camera.updateProjectionMatrix();
    if (composer) { composer.setPixelRatio(dpr); composer.setSize(w, h); bloom.resolution.set(w * dpr / 2, h * dpr / 2); }
    parts.material.uniforms.scale.value = h * dpr * 0.5 / Math.tan(camera.fov * Math.PI / 360);
    need();
  }

  // ---------- materials (rebuilt when the tier changes) ----------
  const M = {};
  function materials() {
    const hi = tier === 'high';
    const plastic = o => hi ? new THREE.MeshPhysicalMaterial({ roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.15, ...o }) : new THREE.MeshStandardMaterial({ roughness: 0.3, ...o });
    Object.values(M).forEach(m => m.dispose?.());
    Object.assign(M, {
      track: plastic({ vertexColors: true, side: THREE.DoubleSide }),
      rim: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
      post: plastic({ color: POST, roughness: 0.4 }),
      peg: new THREE.MeshStandardMaterial({ color: PEARL, roughness: 0.2, metalness: 0.1 }),
      gold: new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.9, roughness: 0.42, envMapIntensity: 0.6 }), // satin: a mirror gold caught the room lights and bloomed
      glass: hi ? new THREE.MeshPhysicalMaterial({ transmission: 1, roughness: 0.05, thickness: 0.2, ior: 1.3, transparent: true, depthWrite: false })
        : new THREE.MeshPhysicalMaterial({ color: '#e9e2ff', transparent: true, opacity: 0.25, roughness: 0.05, clearcoat: 1, depthWrite: false }),
      frost: hi ? new THREE.MeshPhysicalMaterial({ color: '#dceeff', transmission: 1, roughness: 0.6, thickness: 0.5, transparent: true, side: THREE.DoubleSide, depthWrite: false })
        : new THREE.MeshStandardMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.55, roughness: 0.4, side: THREE.DoubleSide, depthWrite: false }),
      tower: plastic({ color: '#2a1f5c', roughness: 0.55 }),
      floor: new THREE.MeshStandardMaterial({ color: '#0b0824', roughness: 0.9, map: floorTex, emissiveMap: floorTex, emissive: '#ffffff', emissiveIntensity: 0.45 }),
    });
    M.shell = hi ? new THREE.MeshPhysicalMaterial({ transmission: 1, roughness: 0.05, thickness: 0.2, ior: 1.3, transparent: true, depthWrite: false })
      : new THREE.MeshPhysicalMaterial({ transparent: true, opacity: 0.28, roughness: 0.05, clearcoat: 1, depthWrite: false });
    M.band = new THREE.MeshStandardMaterial({ roughness: 0.3, emissive: '#000000' });
    M.tint = M.glass.clone(); M.tint.vertexColors = true; // tinted glass: a narrow helix's coils
    for (const k of ['track', 'rim', 'post', 'tower', 'glass', 'tint', 'frost', 'gold']) cutaway(M[k], k === 'track');
  }
  // see-through: fragments inside a cylinder round the camera -> look line are dropped with a dithered edge, stopping
  // short of the look point so the action's own channel stays whole
  const cut = { cam: { value: new THREE.Vector3() }, tgt: { value: new THREE.Vector3() }, r: { value: 0 } };
  // wormhole holes (the track only): the floor and its shell are dropped in a short cylinder round each hole A's axis
  const HOLES = 6, holeCut = { P: { value: [...Array(HOLES)].map(() => new THREE.Vector4()) }, U: { value: [...Array(HOLES)].map(() => new THREE.Vector3()) }, N: { value: 0 } };
  function cutaway(mat, holes) {
    mat.customProgramCacheKey = () => holes ? 'cut+holes' : 'cut'; // same onBeforeCompile source, different shader
    mat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, { cutCam: cut.cam, cutTgt: cut.tgt, cutR: cut.r, holeP: holeCut.P, holeU: holeCut.U, holeN: holeCut.N });
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vCutW;')
        .replace('#include <project_vertex>', `#include <project_vertex>
          vec4 cutW = vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
            cutW = instanceMatrix * cutW;
          #endif
          vCutW = (modelMatrix * cutW).xyz;`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 cutCam, cutTgt; uniform float cutR; varying vec3 vCutW;' + (holes ? `uniform vec4 holeP[${HOLES}]; uniform vec3 holeU[${HOLES}]; uniform int holeN;` : ''))
        .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>${holes ? `
          for (int k = 0; k < ${HOLES}; k++) {
            if (k >= holeN) break;
            vec3 hd = vCutW - holeP[k].xyz; float ha = dot(hd, holeU[k]);
            if (ha > -0.4 && ha < 0.3 && length(hd - holeU[k] * ha) < holeP[k].w) discard;
          }` : ''}
          if (cutR > 0.05) {
            vec3 cd = cutTgt - cutCam; float cl = length(cd); vec3 cn = cd / cl;
            float a = dot(vCutW - cutCam, cn), r = cutR * smoothstep(0.0, 2.0, a) * (1.0 - smoothstep(cl - 3.0, cl - 1.6, a));
            float d = length(vCutW - cutCam - cn * a), dz = fract(dot(floor(gl_FragCoord.xy), vec2(0.5, 0.25)) + 0.125 * mod(floor(gl_FragCoord.y), 2.0));
            if (a > 0.0 && d < r * (0.75 + 0.25 * dz)) discard;
          }`);
    };
  }
  const floorTex = (() => { // neon floor rings on a dark disc, soft vignette (Neon Arcade floor)
    const c = canvas(512), g = c.getContext('2d');
    g.fillStyle = '#0b0824'; g.fillRect(0, 0, 512, 512);
    for (let k = 1; k <= 7; k++) {
      g.strokeStyle = k % 2 ? 'rgba(155,107,255,.55)' : 'rgba(79,216,255,.35)'; g.lineWidth = k === 7 ? 4 : 2;
      g.beginPath(); g.arc(256, 256, k * 34, 0, 7); g.stroke();
    }
    const v = g.createRadialGradient(256, 256, 120, 256, 256, 256);
    v.addColorStop(0, 'rgba(11,8,36,0)'); v.addColorStop(1, 'rgba(11,8,36,1)');
    g.fillStyle = v; g.fillRect(0, 0, 512, 512);
    return tex(c);
  })();
  materials();

  // ---------- marbles + effects that live across races ----------
  const atlas = await faceAtlas();
  const NMAX = 20;
  const shellGeo = new THREE.SphereGeometry(MR, 32, 20), bandGeo = new THREE.TorusGeometry(MR * 0.86, MR * 0.06, 8, 40);
  let shells = new THREE.InstancedMesh(shellGeo, M.shell, NMAX), bands = new THREE.InstancedMesh(bandGeo, M.band, NMAX);
  for (const m of [shells, bands]) { m.count = 0; m.frustumCulled = false; scene.add(m); }
  shells.renderOrder = 2;
  const faces = billboards(NMAX, atlas, false), halos = billboards(NMAX * 4, soft, true); // halo, then three dizzy stars, per marble
  faces.renderOrder = 3; halos.renderOrder = 1;
  // a whirlpool's hold ring: 16 steps of a ring running down clockwise from the top, 4 x 4 cells
  const holdTex = (() => {
    const c = canvas(256), g = c.getContext('2d');
    g.lineCap = 'round';
    for (let k = 0; k < 16; k++) {
      const x = (k % 4) * 64 + 32, y = Math.floor(k / 4) * 64 + 32, f = 1 - k / 15;
      g.lineWidth = 5; g.strokeStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.arc(x, y, 25, 0, 2 * Math.PI); g.stroke();
      if (f > 0) { g.lineWidth = 6; g.strokeStyle = '#fff'; g.beginPath(); g.arc(x, y, 25, -Math.PI / 2, -Math.PI / 2 + f * 2 * Math.PI); g.stroke(); }
    }
    return tex(c);
  })();
  const holds = billboards(NMAX, holdTex, true);
  holds.renderOrder = 3;
  scene.add(holds);
  const blobGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const blobMat = new THREE.MeshBasicMaterial({ map: soft, color: '#05020f', transparent: true, opacity: 0.55, depthWrite: false });
  const blobsM = new THREE.InstancedMesh(blobGeo, blobMat, NMAX);
  blobsM.count = 0; blobsM.frustumCulled = false;
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NMAX * TRAIL * 2 * 3), 3).setUsage(THREE.DynamicDrawUsage));
  trailGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(NMAX * TRAIL * 2 * 4), 4).setUsage(THREE.DynamicDrawUsage));
  { const idx = []; for (let m = 0; m < NMAX; m++) for (let k = 0; k < TRAIL - 1; k++) { const a = (m * TRAIL + k) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } trailGeo.setIndex(idx); }
  const trails = new THREE.Mesh(trailGeo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  trails.frustumCulled = false;
  scene.add(faces, halos, blobsM, trails);
  const parts = particleSystem(1500, dot);
  scene.add(parts);
  const P = { n: 0, max: 1500, x: new Float32Array(1500 * 3), v: new Float32Array(1500 * 3), c: new Float32Array(1500 * 4), life: new Float32Array(1500), max_: new Float32Array(1500), size: new Float32Array(1500), g: new Float32Array(1500), next: 0 };
  // labels: a small pool of screen-constant sprites, oldest culled first
  const labels = [...Array(LABEL_MAX)].map(() => {
    // a placeholder map from the start: the shader variant never changes, so the warm-up compiles it (the first label
    // used to compile its own mid-race)
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, sizeAttenuation: false, depthTest: false, transparent: true, fog: false }));
    s.visible = false; s.renderOrder = 10; s.userData = { t: 0, dur: 1.1, born: 0 };
    scene.add(s);
    return s;
  });
  // shock rings and light pillars
  const ringGeo = new THREE.RingGeometry(0.82, 1, 48);
  const shocks = [...Array(10)].map(() => { const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })); m.visible = false; m.userData = { t: 0 }; scene.add(m); return m; });
  const pillarTex = (() => { const c = canvas(4, 128), g = c.getContext('2d'), gr = g.createLinearGradient(0, 128, 0, 0); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(0.4, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 4, 128); return tex(c); })();
  const pillars = [...Array(5)].map(() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 1, 24, 1, true).translate(0, 0.5, 0), new THREE.MeshBasicMaterial({ map: pillarTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })); m.visible = false; m.userData = { t: 0 }; scene.add(m); return m; });

  // ---------- per-race state ----------
  const S = { def: null, sim: null, players: [], mode: 'idle', track: null, acc: 0, ff: false, raf: 0, last: 0, follow: -1, focus: -1,
    peek: null, feat: null, rings: [], holes: [], traps: [], signs: [], basins: [], hoops: [], pegFlash: null, rack: null, hops: [], trail: null, blink: null,
    lab: {}, fxUntil: 0, ft: 1 / 60, ftWait: 0, shake: 0, photo: 0, ended: false, idleUntil: 0, shown: true };
  const cam = { pos: new THREE.Vector3(30, 30, 60), look: new THREE.Vector3(0, -10, 10), wantPos: new THREE.Vector3(), wantLook: new THREE.Vector3() };
  const zoom = { k: 0, c: new THREE.Vector3(), r: 0, up: 0, zones: [] }; // easing out over a showcase mod: amount 0..1, its frame
  const tmpV = v3(), tmpV2 = v3(), tmpQ = new THREE.Quaternion(), tmpM = new THREE.Matrix4(), tmpS = new THREE.Vector3(1, 1, 1), tmpC = new THREE.Color();
  const pt = new Float32Array(6);

  // ---------- track building ----------
  function build(def) {
    // the old course leaves the scene now, but is disposed only once the new one is compiled or drawn (S.old, see the
    // loop): its shaders are mostly the new one's too, and freed first they were compiled all over again every course
    disposeTrack(S.old);
    S.old = S.track;
    if (S.track) scene.remove(S.track);
    const G = new THREE.Group(), geos = { track: [], rim: [], post: [], tower: [], gold: [], glass: [], tint: [], frost: [], peg: null };
    S.track = G;
    scene.add(G);
    const b = def.bounds, floorY = b[1] - 1.2;
    S.floorY = floorY;
    // chains: open channels (floor + walls with a shell thickness, neon lips) and the frosted mist tube
    for (const ch of def.chains) sweep(ch.f, geos, ch.side);
    // supports: every few units a short stub under the floor (posts down to the ground crossed the whole view)
    posts(def, geos);
    // start ring: cone, outer wall and catch box from the colliders, pastel; the stall wheel (dividers, gold flaps,
    // caps) turns as one during the countdown, so it lives in its own pivot
    const fan = def.fan, part = k => def.colliders.find(c => c.part === k);
    const wall = part('fanWall'), v = wall.verts, keep = [];
    for (let t = 0; t < wall.idx.length; t += 3) { // the catch box's walls and skirt, not the tall outer wall
      const far = [0, 1, 2].every(k => { const i = wall.idx[t + k]; return Math.hypot(v[i * 3], v[i * 3 + 2]) > fan.rBack - 0.05; });
      if (!far) keep.push(wall.idx[t], wall.idx[t + 1], wall.idx[t + 2]);
    }
    const fg = meshGeo(part('fanFloor')), fw = meshGeo({ verts: v, idx: new Uint32Array(keep) }), fb = meshGeo(part('fanBox'));
    const rimY = Math.max(0, fan.rStall - fan.hr) * Math.tan(fan.slope) + (fan.rBack - fan.rStall) * Math.tan(3 * Math.PI / 180);
    const rim = new THREE.CylinderGeometry(fan.rBack + 0.1, fan.rBack + 0.1, 1.0, 72, 1, true).translate(0, rimY + 0.35, 0);
    const lip = new THREE.TorusGeometry(fan.rBack + 0.1, 0.06, 6, 96).rotateX(Math.PI / 2).translate(0, rimY + 0.86, 0);
    tintGeo(fg, PASTEL[1]); tintGeo(fw, PASTEL[2]); tintGeo(fb, PASTEL[2]); tintGeo(rim, PASTEL[0]); tintGeo(lip, '#ffffff');
    lip.setAttribute('color', new THREE.Float32BufferAttribute(new Array(lip.attributes.position.count).fill(0).flatMap(() => { const c = mixWhite(PASTEL[0], 0.3).multiplyScalar(NEON); return [c.r, c.g, c.b]; }), 3));
    geos.track.push(fg, fw, fb, rim);
    geos.rim.push(lip);
    // stubs under the ring (clear of the board running out under its front)
    const coneY = r => Math.max(0, r - fan.hr) * Math.tan(fan.slope);
    for (let k = 0; k < 8; k++) {
      const a = Math.PI / 8 + k * Math.PI / 4, x = Math.sin(a) * fan.rStall, z = -Math.cos(a) * fan.rStall;
      if (z > 0 && Math.abs(x) < fan.W + 1.2) continue;
      stub(geos.tower, x, coneY(fan.rStall) - 0.25, z, 0.35);
    }
    const wheel = new THREE.Group();
    G.add(wheel);
    S.wheel = wheel; S.spinNow = 0;
    const divGeo = [];
    for (const d of def.colliders.filter(c => c.part === 'divider')) divGeo.push(new THREE.BoxGeometry(d.half[0] * 2, d.half[1] * 2 - 0.1, d.half[2] * 2).rotateY(d.yaw).translate(...d.p));
    wheel.add(new THREE.Mesh(mergeGeometries(divGeo), M.post));
    divGeo.forEach(g => g.dispose());
    const flapGeo = new THREE.BoxGeometry(1, 1, 1);
    S.flaps = fan.stalls.map(s => { const m = new THREE.Mesh(flapGeo, M.gold); m.userData = s.flap; m.scale.set(s.flap.hw * 2, s.flap.h, 0.08); wheel.add(m); return m; });
    // stall caps: white glass domes, tinted the owner's colour once seated
    S.caps = fan.stalls.map((s, g) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(MR * 1.15, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, roughness: 0.1, clearcoat: 1, emissive: '#ffffff', emissiveIntensity: 0.25, depthWrite: false }));
      m.position.set(s.pos[0], s.pos[1] - MR, s.pos[2]);
      wheel.add(m);
      const lt = labelTex(String(g + 1), '#ffffff'), n = new THREE.Sprite(new THREE.SpriteMaterial({ map: lt.t, sizeAttenuation: true, depthWrite: false, transparent: true }));
      n.scale.set(0.55 * lt.aspect, 0.55, 1); n.position.set(s.pos[0], s.pos[1] + 0.95, s.pos[2]);
      wheel.add(n); m.userData.num = n;
      return m;
    });
    // pegs: instanced pearls; they flash in the colour of whoever hits them
    const pegGeo = new THREE.CylinderGeometry(def.pegs[0]?.r ?? 0.125, def.pegs[0]?.r ?? 0.125, def.pegs[0]?.h ?? 1.2, 12);
    const pegs = new THREE.InstancedMesh(pegGeo, M.peg, def.pegs.length);
    def.pegs.forEach((p, k) => { const sr = p.r / def.pegs[0].r; tmpQ.setFromUnitVectors(tmpV.set(0, 1, 0), tmpV2.set(...p.ax)); tmpM.compose(tmpV.set(...p.p), tmpQ, tmpS.set(sr, 1, sr)); pegs.setMatrixAt(k, tmpM); pegs.setColorAt(k, PEARL_C); });
    pegs.castShadow = tier === 'high';
    G.add(pegs);
    S.pegs = pegs; S.pegFlash = new Float32Array(def.pegs.length); S.pegCol = def.pegs.map(() => PEARL_C.clone());
    // carousel, wormholes, boost pads, mist marks, finish arch + rack
    const walls = def.colliders.filter(c => c.part === 'ringWall'); // one per carousel, in order
    S.rings = def.rings.map((rg, k) => carouselMesh(rg, G, geos, walls[k]));
    const pans = k => def.colliders.filter(c => c.part === k); // one each per boomerang, in order
    def.boomerangs.forEach((bm, k) => boomMesh(bm, pans('boomFloor')[k], pans('boomWall')[k], geos));
    S.basins = def.basins.map((bw, k) => basinMesh(bw, pans('basin')[k], G, geos));
    S.signs = [];
    S.holes = def.wormholes.map((w, k) => w.roulette ? rouletteMesh(def, w, G) : holeMesh(w, k, G));
    holeCut.N.value = Math.min(HOLES, def.wormholes.length);
    S.holes.slice(0, HOLES).forEach((h, k) => { holeCut.P.value[k].set(...h.w.a.p, h.rv ?? h.w.a.r * HOLE_VIS); holeCut.U.value[k].set(...h.w.a.u); });
    S.traps = (def.traps || []).map(tp => tp.fork ? forkMesh(tp, G, geos) : tp.door ? doorMesh(def, tp, G) : trapMesh(tp, G));
    for (const bp of def.boosts) boostMesh(def, bp, G);
    S.hoops = def.jumps.map(jp => hoopMesh(jp.hoop, G));
    for (const md of def.muds) mudMesh(def, md, G);
    for (const c of def.coils) if (c.side > 0) combMesh(c, geos);
    nameSigns(def, G);
    finishMesh(def, G, geos);
    splitsOf(def).forEach((s, k) => splitMesh(def, s, k, G));
    S.rack = rackMesh(def, G);
    // floor plinth under everything
    const span = Math.max(b[3] - b[0], b[5] - b[2]) * 0.75 + 8;
    const floor = new THREE.Mesh(new THREE.CircleGeometry(span, 64).rotateX(-Math.PI / 2), M.floor);
    floor.position.set((b[0] + b[3]) / 2, floorY, (b[2] + b[5]) / 2); floor.receiveShadow = true;
    G.add(floor);
    // merge the static geometry per material: about ten draw calls for the whole course
    for (const [k, mat] of [['track', M.track], ['rim', M.rim], ['post', M.post], ['tower', M.tower], ['gold', M.gold], ['glass', M.glass], ['tint', M.tint], ['frost', M.frost]]) {
      if (!geos[k].length) continue;
      const colored = k === 'track' || k === 'rim' || k === 'tint', see = k === 'glass' || k === 'tint' || k === 'frost', list = geos[k].map(g => mergeable(g, colored));
      const m = new THREE.Mesh(mergeGeometries(list, false), mat);
      list.forEach(g => g.dispose());
      m.castShadow = tier === 'high' && k !== 'rim' && !see; m.receiveShadow = tier === 'high' && k !== 'rim';
      if (see) m.renderOrder = 4;
      G.add(m);
    }
  }
  // merge-ready: non-indexed, position + normal (+ colour where the material uses vertex colours), nothing else
  function mergeable(g, colored) {
    const n = g.index ? g.toNonIndexed() : g;
    if (n !== g) g.dispose();
    for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'color'].includes(k)) n.deleteAttribute(k);
    if (!n.attributes.normal) n.computeVertexNormals();
    if (colored && !n.attributes.color) n.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(n.attributes.position.count * 3).fill(1), 3));
    if (!colored && n.attributes.color) n.deleteAttribute('color');
    return n;
  }
  const meshGeo = c => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(c.verts.slice(), 3)); g.setIndex(new THREE.BufferAttribute(c.idx.slice(), 1)); const ng = toCreasedNormals(g, CREASE); g.dispose(); return ng; };
  const tintGeo = (g, h) => { const c = col(h), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) a.set([c.r, c.g, c.b], i * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); };
  function disposeTrack(g) {
    if (!g) return;
    // kept: the tier's materials and what every course shares (the soft dot also lights the halos). Disposed with the
    // course, they were uploaded again for the next one, and the carousel hooks' shader compiled again
    const keep = new Set([...Object.values(M), candy, candy.map, soft, pitTex, wellTex, padTex, hazardTex, caveTex, mudTex, chevTex, ...[...labelCache.values()].map(l => l.t)]);
    g.traverse(o => { o.geometry?.dispose(); for (const m of [].concat(o.material ?? [])) if (!keep.has(m)) { if (!keep.has(m.map)) m.map?.dispose(); m.dispose(); } });
  }

  // the visible cross-section: the floor and walls of the collider profile, cut at each wall's visible height; 2M-1
  // points from the left lip down and up to the right lip
  const HALF = 13;
  function lipProfile(hw, wl, wr, rb, out) {
    rb = Math.min(rb, hw);
    const side = (sgn, top) => { // from the lip down to the centre of the floor, dense, then resampled
      const pts = [];
      const yTop = Math.max(top, 0.05);
      if (yTop > rb) pts.push([sgn * hw, yTop]);
      for (let j = 0; j <= 12; j++) {
        const a = Math.PI / 2 * j / 12, x = sgn * (hw - rb + Math.cos(a) * rb), y = rb - Math.sin(a) * rb;
        if (y <= yTop + 1e-6) pts.push([x, y]);
      }
      if (pts.length && Math.abs(pts[0][1] - yTop) > 1e-3) { // the lip cuts the arc: start exactly at the lip height
        const a = Math.asin(Math.min(1, (rb - yTop) / rb)), x = sgn * (hw - rb + Math.cos(a) * rb);
        pts.unshift([x, yTop]);
      }
      pts.push([0, 0]);
      const L = [0];
      for (let k = 1; k < pts.length; k++) L.push(L[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
      const res = [];
      for (let k = 0; k < HALF; k++) {
        const d = L.at(-1) * k / (HALF - 1);
        let j = 0; while (j < pts.length - 2 && L[j + 1] < d) j++;
        const f = (d - L[j]) / Math.max(1e-6, L[j + 1] - L[j]);
        res.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f]);
      }
      return res;
    };
    const l = side(-1, wl), r = side(1, wr).reverse();
    return out.concat(l, r.slice(1));
  }
  // sweep a chain: open channel stretches as floor + walls with thickness and neon lips; TUBE stretches as a frosted tube
  function sweep(f, geos, side) {
    const k = f.length / FS;
    let i = 0;
    while (i < k - 1) {
      const tube = !!(f[i * FS + F.flags] & TUBE);
      let j = i;
      while (j < k - 1 && !!(f[(j + 1) * FS + F.flags] & TUBE) === tube) j++;
      const a = tube ? Math.max(0, i - 1) : i, z = Math.min(k - 1, j + 1);
      tube ? tubeSweep(f, a, z, geos, f[i * FS + F.flags] & GLASS, side) : channelSweep(f, a, z, geos);
      i = j + 1;
    }
  }
  function frame(f, i) { const o = i * FS; return { o, p: [f[o], f[o + 1], f[o + 2]], r: [f[o + 6], f[o + 7], f[o + 8]], u: [f[o + 9], f[o + 10], f[o + 11]] }; }
  function channelSweep(f, a, z, geos) {
    const NPV = HALF * 2 - 1, rows = z - a + 1, pos = [], colr = [], idx = [], rimPos = [], rimCol = [], rimIdx = [];
    const c3 = new THREE.Color();
    for (let i = a; i <= z; i++) {
      const { o, p, r, u } = frame(f, i), prof = lipProfile(f[o + F.hw], f[o + F.wl], f[o + F.wr], f[o + F.rb], []);
      const hue = f[o + F.flags] & TRAPF ? TRAP : PASTEL[f[o + F.mod] % 3];
      c3.set(hue);
      // normals of the profile (2D, pointing out of the channel) give the shell's outer surface
      const outer = prof.map((q, k) => {
        const pa = prof[Math.max(0, k - 1)], pb = prof[Math.min(prof.length - 1, k + 1)], dx = pb[0] - pa[0], dy = pb[1] - pa[1], l = Math.hypot(dx, dy) || 1;
        return [q[0] + dy / l * THICK, q[1] - dx / l * THICK];
      });
      const ring = [...prof, ...outer.reverse()]; // inner left->right, then outer right->left: a closed loop
      for (const [x, y] of ring) { pos.push(p[0] + r[0] * x + u[0] * y, p[1] + r[1] * x + u[1] * y, p[2] + r[2] * x + u[2] * y); colr.push(c3.r, c3.g, c3.b); }
      // neon lips: a thin square tube along the top of each wall
      const lc = mixWhite(hue, 0.3).multiplyScalar(NEON);
      for (const [x, y] of [prof[0], prof[NPV - 1]]) for (const [dx, dy] of [[-0.05, 0], [0, 0.07], [0.05, 0], [0, -0.03]]) {
        rimPos.push(p[0] + r[0] * (x + dx) + u[0] * (y + dy + 0.02), p[1] + r[1] * (x + dx) + u[1] * (y + dy + 0.02), p[2] + r[2] * (x + dx) + u[2] * (y + dy + 0.02));
        rimCol.push(lc.r, lc.g, lc.b);
      }
    }
    const RL = NPV * 2;
    for (let i = 0; i < rows - 1; i++) for (let j = 0; j < RL; j++) {
      const A = i * RL + j, B = i * RL + (j + 1) % RL, C = (i + 1) * RL + (j + 1) % RL, D = (i + 1) * RL + j;
      idx.push(A, C, B, A, D, C);
    }
    for (let i = 0; i < rows - 1; i++) for (let s = 0; s < 2; s++) for (let j = 0; j < 4; j++) {
      const A = i * 8 + s * 4 + j, B = i * 8 + s * 4 + (j + 1) % 4, C = A + 8, D = B + 8;
      rimIdx.push(A, B, D, A, D, C);
    }
    geos.track.push(geoFrom(pos, colr, idx, 3));
    geos.rim.push(geoFrom(rimPos, rimCol, rimIdx, 3));
  }
  // a narrow helix's comb: the end wall with its three round openings (the middle tube's window, the coils' mouths), a
  // neon ring round each (the middle's in the module's colour, a coil's in its own); the tube and the coils are their chains' glass
  function combMesh(c, geos) {
    const { p, t, r, u, hw, H, rho, cr } = c.in, sh = new THREE.Shape().moveTo(-hw, -THICK).lineTo(hw, -THICK).lineTo(hw, H).lineTo(-hw, H).closePath();
    for (const x of [-cr, 0, cr]) sh.holes.push(new THREE.Path().absarc(x, rho, rho + 0.06, 0, Math.PI * 2, true));
    const at = tmpM.makeBasis(tmpV.set(...r), tmpV2.set(...u), v3().set(-t[0], -t[1], -t[2])).setPosition(...p), hue = PASTEL[c.mod % 3];
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: false, curveSegments: 24 }).applyMatrix4(at);
    tintGeo(g, hue); geos.track.push(g);
    for (const x of [-cr, 0, cr]) {
      const ring = new THREE.TorusGeometry(rho + 0.1, 0.05, 6, 32).translate(x, rho, -0.02).applyMatrix4(at);
      tintGeo(ring, mixWhite(x ? coilC(x) : hue, 0.3).multiplyScalar(NEON)); geos.rim.push(ring);
    }
  }
  // glass (the narrow tube, a narrow helix's coils): seen from both sides, with a neon hoop every unit or so; clear with
  // the module's colour, a coil (side) tinted with hoops in its own colour
  function tubeSweep(f, a, z, geos, glass, side) {
    const NR = 24, pos = [], idx = [];
    for (let i = a; i <= z; i++) {
      const { o, p, r, u } = frame(f, i), rho = f[o + F.hw] + 0.12, cy = f[o + F.H] / 2;
      for (let j = 0; j < NR; j++) { const t = j / NR * Math.PI * 2, x = Math.cos(t) * rho, y = cy + Math.sin(t) * rho; pos.push(p[0] + r[0] * x + u[0] * y, p[1] + r[1] * x + u[1] * y, p[2] + r[2] * x + u[2] * y); }
    }
    for (let i = 0; i < z - a; i++) for (let j = 0; j < NR; j++) { const A = i * NR + j, B = i * NR + (j + 1) % NR, C = A + NR, D = B + NR; idx.push(A, B, D, A, D, C); }
    if (!glass) { geos.frost.push(geoFrom(pos, null, idx)); return; }
    const sh = [geoFrom(pos, null, idx), geoFrom(pos, null, idx.slice().reverse())];
    if (side) { sh.forEach(g => tintGeo(g, mixWhite(coilC(side), 0.45))); geos.tint.push(...sh); } else geos.glass.push(...sh); // a light tint: turns seen through turns went muddy
    const lc = mixWhite(side ? coilC(side) : PASTEL[f[(a + 1) * FS + F.mod] % 3], 0.3).multiplyScalar(NEON);
    for (let i = a + 1, last = -9; i < z; i++) {
      const { o, p, r, u } = frame(f, i);
      if (f[o + F.s] - last < 1.1) continue;
      last = f[o + F.s];
      const t = new THREE.Vector3(...r).cross(new THREE.Vector3(...u)), c = p.map((v, k) => v + u[k] * f[o + F.H] / 2);
      const g = new THREE.TorusGeometry(f[o + F.hw] + 0.14, 0.04, 6, 32).applyMatrix4(tmpM.makeBasis(tmpV.set(...r), tmpV2.set(...u), t).setPosition(...c));
      tintGeo(g, lc); geos.rim.push(g);
    }
  }
  function geoFrom(pos, colr, idx) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    if (colr) g.setAttribute('color', new THREE.Float32BufferAttribute(colr, 3));
    g.setIndex(idx);
    const n = toCreasedNormals(g, CREASE); // non-indexed, curves smooth and edges sharp (mergeable() keeps these normals)
    g.dispose();
    return n;
  }
  function posts(def, geos) {
    for (const ch of def.chains) {
      const f = ch.f, k = f.length / FS;
      let last = -9;
      for (let i = 0; i < k; i++) {
        const o = i * FS;
        if (f[o + F.s] - last < 6.5 || f[o + F.flags] & TUBE) continue;
        last = f[o + F.s];
        stub(geos.post, f[o], f[o + 1] - THICK, f[o + 2], 0.16);
      }
    }
  }
  // a decorative support: a short tapered stub hanging from y, a ball on its end
  const STUB = 0.7;
  const stub = (list, x, y, z, r) => list.push(new THREE.CylinderGeometry(r, r * 0.7, STUB, 12).translate(x, y - STUB / 2, z), new THREE.SphereGeometry(r * 0.9, 12, 8).translate(x, y - STUB, z));
  // carousel hooks: candy-striped enamel (45° stripes, tiling) so they read apart from the gold dividers
  const candy = (() => {
    const c = canvas(64), g = c.getContext('2d');
    g.fillStyle = '#fff1d6'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#e8304f';
    for (let i = -64; i <= 64; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 16, 0); g.lineTo(i + 80, 64); g.lineTo(i + 64, 64); g.fill(); }
    const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping;
    const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.28, metalness: 0.05, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.18 });
    cutaway(m, false); return m;
  })();
  function carouselMesh(rg, G, geos, wall) {
    const grp = new THREE.Group(); grp.position.set(...rg.c);
    const tilt = Math.tan(rg.tilt);
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(rg.rOut + 0.08, rg.rOut + 0.08, 0.12, 64, 1, false), M.gold);
    floor.position.y = -0.06 - (rg.rOut - rg.rIn) * tilt / 2;
    grp.add(floor);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(rg.rIn, rg.rIn, 1.05, 48), M.gold); hub.position.y = 0.5; grp.add(hub);
    const ruby = new THREE.MeshStandardMaterial({ color: '#ff2d55', emissive: '#ff2d55', emissiveIntensity: 0.5, metalness: 0.3, roughness: 0.15, flatShading: true });
    const seatMat = new THREE.MeshStandardMaterial({ color: '#ffd27a', metalness: 0.8, roughness: 0.2, emissive: '#ffb547', emissiveIntensity: 0.2 }), seatGeo = new THREE.SphereGeometry(0.22, 16, 10);
    const sg = Math.sign(rg.omega) || 1, hooks = rg.parts.filter(q => q.part === 'hook');
    for (let k = 0; k < rg.seats; k++) {
      const a = 2 * Math.PI * k / rg.seats, r = (rg.rIn + rg.rOut) / 2;
      const d = new THREE.Mesh(new THREE.BoxGeometry(rg.rOut - rg.rIn + 0.1, rg.divH, 0.12), M.gold);
      d.position.set(Math.cos(a) * r, rg.divH / 2 - (r - rg.rIn) * tilt - 0.05, Math.sin(a) * r); d.rotation.y = -a;
      grp.add(d);
      // the hook: a candy-striped lip (its collider's box), a gold rail along its top, a ruby finial at its tip (local
      // +z runs along the ring the way it turns) that glows with the seats
      const hk = hooks[k], [hx, hy, hz] = hk.half, h = new THREE.Group();
      h.position.set(...hk.p); h.rotation.y = hk.yaw;
      h.add(new THREE.Mesh(new THREE.BoxGeometry(hx * 2, hy * 2, hz * 2), candy));
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, hz * 2 + 0.1, 10).rotateX(Math.PI / 2), M.gold); rail.position.y = hy; h.add(rail);
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.14), ruby); gem.position.set(0, hy + 0.15, sg * hz); h.add(gem);
      grp.add(h);
      const seat = new THREE.Mesh(seatGeo, seatMat);
      seat.position.set(Math.cos(a) * rg.rOut, rg.divH - (rg.rOut - rg.rIn) * tilt, Math.sin(a) * rg.rOut);
      grp.add(seat);
    }
    G.add(grp);
    // static outer wall: a translucent band with gold lips, open at the entry (skirt) and exit
    geos.glass.push(meshGeo(wall));
    return { grp, rg, live: 0, kick: 0, ruby, seatMat };
  }
  // boomerang: the pan's floor and quarter-pipe wall in the module's pastel, striped every half unit up the wall (a height
  // gauge for how far each marble climbs), glass side and near walls, neon along each side's outline and the wall's top,
  // stubs under the corners
  function boomMesh(bm, floor, wall, geos) {
    const { P, yF, prof } = boomGeo(bm), g = meshGeo(floor), p = g.attributes.position, c = new Float32Array(p.count * 3);
    const base = col(PASTEL[bm.mod % 3]), stripe = mixWhite(PASTEL[(bm.mod + 1) % 3], 0.35);
    for (let t = 0; t < p.count; t += 3) { // per triangle, by its lowest corner's height over the floor (up either wall): both of a row's triangles alike
      let h = Infinity;
      for (let k = 0; k < 3; k++) h = Math.min(h, p.getY(t + k) - yF(0, (p.getX(t + k) - bm.E[0]) * bm.inw[0] + (p.getZ(t + k) - bm.E[2]) * bm.inw[1]));
      const cc = h > 0.25 && Math.floor(h / 0.5) % 2 ? stripe : base;
      for (let k = 0; k < 3; k++) c.set([cc.r, cc.g, cc.b], (t + k) * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    geos.track.push(g);
    geos.glass.push(meshGeo(wall));
    const lc = mixWhite(PASTEL[bm.mod % 3], 0.3).multiplyScalar(NEON);
    const neon = pts => { const t = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(q => new THREE.Vector3(...q)), false, 'centripetal'), pts.length * 3, 0.06, 6); tintGeo(t, lc); geos.rim.push(t); };
    const sides = [-bm.hw, bm.vEnd];
    for (const v of sides) neon(prof(v).map(([u, y]) => P(u, v, y + 0.02)));
    neon(sides.map(v => { const [u, y] = prof(v).at(-1); return P(u, v, y); }));
    for (const q of [bm.poly[0], bm.poly[3], bm.poly[4], bm.poly[5]]) stub(geos.post, q[0], q[1] - 0.3, q[2], 0.2);
  }
  // bowl: the dish painted like a waterslide's fibreglass, the module's pastel with six bands spiralling into the drain
  // and the throat dark; a neon lip, stubs under the dish, and a film of water over it whose streaks swirl round and in
  // (quicker while marbles are in it)
  const waterMat = () => new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float time; varying vec2 vUv;
      void main() {
        float a = vUv.x * 6.2831853, d = vUv.y; // round the bowl; 0 at the rim, 1 at the drain
        float s = pow(max(0.5 + 0.5 * sin(4.0 * a + 11.0 * d - time * 3.0), 0.0), 10.0); // four streaks, wound into a spiral (base clamped: see vortexMat)
        float fade = smoothstep(0.0, 0.1, d) * (1.0 - smoothstep(0.82, 1.0, d));
        gl_FragColor = vec4(vec3(0.6, 0.9, 1.0) * (0.07 + 0.55 * s) * fade, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  function basinMesh(bw, dish, G, geos) {
    const g = meshGeo(dish), p = g.attributes.position, cl = new Float32Array(p.count * 3), rimY = bw.rim;
    const base = col(PASTEL[bw.mod % 3]), band = mixWhite(PASTEL[(bw.mod + 1) % 3], 0.35), lip = mixWhite(PASTEL[bw.mod % 3], 0.55), throat = col('#1d1442');
    for (let v = 0; v < p.count; v++) { // per vertex: three bands wound into a spiral, the throat dark, the lip pale
      const x = p.getX(v) - bw.c[0], h = p.getY(v) - bw.c[1], z = p.getZ(v) - bw.c[2], r = Math.hypot(x, z);
      const w = Math.min(1, Math.max(0, 0.5 + 1.6 * Math.sin(Math.atan2(z, x) * 3 + (bw.rB - r) * 1.3))); // 0 base .. 1 band, soft-edged
      const sh = 0.6 + 0.4 * Math.min(1, (r - bw.rh) / (bw.rB - bw.rh)); // shaded deeper toward the drain
      const cc = h < -0.02 ? throat : h > rimY + 0.05 ? lip : tmpC.copy(base).lerp(band, w).multiplyScalar(sh);
      cl.set([cc.r, cc.g, cc.b], v * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(cl, 3));
    geos.track.push(g);
    // neon along the curl's crest, round from the chute's way in to where it came in
    const gap = bw.open ? bw.open[1] - bw.open[0] : 0, ring = new THREE.TorusGeometry(bw.rB - bw.curl, 0.07, 6, 96, 2 * Math.PI - gap).rotateX(Math.PI / 2).rotateY(-(bw.open?.[1] ?? 0)).translate(bw.c[0], bw.c[1] + bw.top + 0.03, bw.c[2]);
    tintGeo(ring, mixWhite(PASTEL[bw.mod % 3], 0.3).multiplyScalar(NEON)); geos.rim.push(ring);
    const [sr, sy] = bw.prof[Math.round(bw.prof.length * 0.6)];
    for (let k = 0; k < 6; k++) { const a = (k + 0.5) * Math.PI / 3; stub(geos.post, bw.c[0] + Math.cos(a) * sr, bw.c[1] + sy - 0.05, bw.c[2] + Math.sin(a) * sr, 0.22); }
    // the water: the dish from its rim down to the bevel, lifted a hair, uvs running 0 at the rim to 1 at the drain
    const mat = waterMat(), film = new THREE.Mesh(new THREE.LatheGeometry(bw.prof.filter(([, y]) => y > -0.1 && y <= bw.rim + 1e-6).reverse().map(([r, y]) => new THREE.Vector2(r - 0.04, y + 0.04)), 72), mat);
    film.position.set(...bw.c); film.renderOrder = 3;
    G.add(film);
    return { bw, mat, t: 0, live: 0 };
  }
  let def = null;
  // a wormhole: two matching holes in the floor. A drinks: a real hole (the track's floor is cut away over it, see
  // holeCut) with a glowing vortex funnel hanging under it, spiral arms spinning and pouring down into the dark, a neon
  // lip, and rings and sparks pulled in across the floor. B spits: a dark pit with rings spreading out
  const pitTex = (() => { const c = canvas(128), g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, '#000'); r.addColorStop(0.55, '#06030f'); r.addColorStop(0.86, '#3a3550'); r.addColorStop(1, '#fff'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return tex(c); })();
  const wellTex = (() => { const c = canvas(128), g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(3,1,12,.9)'); r.addColorStop(0.42, 'rgba(3,1,12,.55)'); r.addColorStop(1, 'rgba(3,1,12,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return tex(c); })();
  const HOLE_VIS = 0.82, FUNNEL = 1.5; // hole A's visible radius (share of the sim's; a marble over it drops in), funnel depth
  const vortexMat = c => new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, color: { value: col(c) } }, side: THREE.DoubleSide,
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float time; uniform vec3 color; varying vec2 vUv;
      void main() {
        float d = vUv.y, a = vUv.x * 6.2831853;
        float arms = smoothstep(0.1, 0.95, 0.5 + 0.5 * sin(3.0 * a + 11.0 * d - time * 7.0)); // three arms, twisting down
        // pow() of a base a hair under 0 (GPU sin slop, d interpolated past 1 down the throat) is NaN, and bloom smeared
        // one NaN pixel into a screen-sized blinking black block: every base is clamped
        float streak = pow(max(0.5 + 0.5 * sin(7.0 * a - 5.0 * d + 30.0 * d * d - time * 13.0), 0.0), 6.0); // thin fast streaks
        float lip = pow(max(1.0 - d, 0.0), 6.0), deep = pow(max(1.0 - d, 0.0), 1.8); // bright at the rim, black down the throat
        vec3 c = color * deep * (0.12 + 0.75 * arms + 0.9 * streak * arms) + mix(color, vec3(1.0), 0.4) * lip * 1.3;
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  // the funnel: a short collar at the hole's edge (hides the cut floor shell), then a gravity well narrowing to a throat
  const funnelGeo = r => new THREE.LatheGeometry([[r, 0.005], [r, -0.24], ...[...Array(15)].map((_, j) => { const f = (j + 1) / 15; return [r * (0.1 + 0.9 * (1 - f) ** 2.2), -0.24 - (FUNNEL - 0.24) * f]; })].map(([x, y]) => new THREE.Vector2(x, y)), 48);
  // a mouth (m: { p, u }) of radius r in colour c: drink, a vortex funnel with a lip, a shadowed well and rings pulled in
  // (wide: a roulette's, as wide as the channel: no well, the rings stay inside it); else a pit with rings spreading out
  function mouthMesh(grp, m, drink, c, r, wide = false) {
    const o = new THREE.Group(); o.position.set(...m.p); o.quaternion.setFromUnitVectors(tmpV.set(0, 1, 0), tmpV2.set(...m.u));
    const rings = [0, 1, 2].map(j => { const q = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col(c), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); q.position.y = 0.02; q.userData.ph = j / 3; o.add(q); return q; });
    let swirl = null, vortex = null;
    if (drink) {
      vortex = vortexMat(c);
      o.add(new THREE.Mesh(funnelGeo(r), vortex));
      o.add(new THREE.Mesh(new THREE.TorusGeometry(r + 0.03, 0.045, 8, 48).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: mixWhite(c, 0.35).multiplyScalar(1.6), toneMapped: false })));
      if (!wide) {
        const well = new THREE.Mesh(new THREE.RingGeometry(r, r * 2.6, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: wellTex, transparent: true, depthWrite: false }));
        well.position.y = 0.012; o.add(well); // a shadowed dip round the lip (RingGeometry's uvs are planar, centred)
      }
    } else {
      const pit = new THREE.Mesh(new THREE.CircleGeometry(r, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: pitTex, color: mixWhite(c, 0.2) })); pit.position.y = 0.012; o.add(pit);
      swirl = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.5, 40, 1, 0, Math.PI * 1.4).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: mixWhite(c, 0.45), transparent: true, opacity: 0.7, depthWrite: false })); swirl.position.y = 0.025; swirl.scale.setScalar(r); o.add(swirl);
    }
    grp.add(o);
    return { rings, swirl, vortex, r, drink, o, spread: wide ? 0.12 : 1.6 };
  }
  function holeMesh(w, k, G) {
    const c = HOLE[w.color], grp = new THREE.Group();
    const mouths = [mouthMesh(grp, w.a, true, c, w.a.r * HOLE_VIS), mouthMesh(grp, w.b, false, c, w.b.r)];
    G.add(grp);
    // hole A's frame for a marble spiralling in: up, and two axes across (e2 = up x e1, so +angle turns like the vortex)
    const up = v3().set(...w.a.u), e1 = v3().crossVectors(up, Math.abs(up.y) < 0.9 ? tmpV.set(0, 1, 0) : tmpV.set(1, 0, 0)).normalize();
    return { w, mouths, live: 0, c, t: 0, up, e1, e2: v3().crossVectors(up, e1), sparkAt: 0 };
  }
  // a wormhole roulette: a vortex funnel across the whole channel, a wheel of three sectors round its lip turning with sim
  // time (JACKPOT gold, NEXT cyan, LOST violet: the sim reads the sector under a marble as it drops, sectorOf), a white
  // pointer where the marbles roll in, and two exit pits on the next side: JACKPOT further on, NEXT (LOST drifts out of
  // it too). Its frame: x = e1 (along the course), y = up, z = -e2, so a wheel angle reads as the sim's
  function rouletteMesh(def, w, G) {
    const rl = w.roulette, rv = def.W / 2 - 0.35, grp = new THREE.Group(), up = v3().set(...w.a.u), e1 = v3().set(...rl.e1), e2 = v3().set(...rl.e2);
    const mouths = [mouthMesh(grp, w.a, true, RW[2], rv, true), mouthMesh(grp, rl.exits[0].b, false, RW[0], rl.exits[0].b.r), mouthMesh(grp, w.b, false, RW[1], w.b.r)];
    const o = new THREE.Group(), wheel = new THREE.Group();
    o.position.set(...w.a.p).addScaledVector(up, 0.018);
    o.quaternion.setFromRotationMatrix(tmpM.makeBasis(e1, up, v3().crossVectors(e1, up)));
    let a0 = 0;
    rl.sectors.forEach((f, k) => { // RingGeometry's angle runs from x toward -z once laid flat: the sim's angle round (e1, e2)
      const m = new THREE.Mesh(new THREE.RingGeometry(rv + 0.05, rv + 0.3, 24, 1, a0 * 2 * Math.PI, f * 2 * Math.PI).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col(RW[k]).multiplyScalar(1.3), toneMapped: false }));
      wheel.add(m);
      const tick = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.05).rotateX(-Math.PI / 2).translate(rv + 0.175, 0.004, 0), new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }));
      tick.rotation.y = a0 * 2 * Math.PI; wheel.add(tick);
      a0 += f;
    });
    const tri = new THREE.Shape([new THREE.Vector2(0, -0.13), new THREE.Vector2(0.22, 0), new THREE.Vector2(0, 0.13)]);
    const pointer = new THREE.Mesh(new THREE.ShapeGeometry(tri).rotateX(-Math.PI / 2).translate(-rv - 0.3, 0.02, 0), new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }));
    o.add(wheel, pointer); // the pointer at angle π: where the marbles roll in
    grp.add(o);
    G.add(grp);
    const sign = modSign(G, v3().set(...w.a.p).addScaledVector(e1, rv + 0.8).addScaledVector(up, 2.4), up, (hooks.label || (k => k))('roulette'), RW, 0.8, w.a.s);
    return { w, mouths, live: 0, c: RW[2], t: 0, up, e1, e2, sparkAt: 0, rv, rl, wheel, sector: -1, sign };
  }
  // a mod's neon sign: its name in neon tubing (cols[0]) on a dark board, a marquee of bulbs round the edge in its three
  // colours, chasing. It bobs, faces the camera, flickers now and then, and flares as marbles go through (see the loop).
  // th: the word's height. A roulette's floats just beyond its funnel, in the sectors' colours; the rest: nameSigns
  // s: its mod's spot along the course, where the flyover holds on it (peek, director)
  function modSign(G, at, up, text, cols, th = 0.8, s = null) {
    const font = '900 84px Pretendard, system-ui, sans-serif', m = canvas(8).getContext('2d');
    m.font = font;
    const cw = Math.ceil(m.measureText(text).width) + 64, c = canvas(cw, 144), g = c.getContext('2d');
    g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.shadowColor = cols[0]; g.shadowBlur = 14; g.lineWidth = 7; g.strokeStyle = cols[0]; g.strokeText(text, cw / 2, 76); // the tube, glowing
    g.shadowBlur = 0; g.lineWidth = 3; g.strokeStyle = '#fffbe6'; g.strokeText(text, cw / 2, 76); // its hot core
    const tw = th * cw / 144, bw = tw / 2 + 0.25 * th, bh = th * 0.7, br = 0.27 * th;
    const sign = new THREE.Group(), board = new THREE.Shape();
    board.absarc(bw - br, bh - br, br, 0, Math.PI / 2); board.absarc(-bw + br, bh - br, br, Math.PI / 2, Math.PI); board.absarc(-bw + br, -bh + br, br, Math.PI, Math.PI * 1.5); board.absarc(bw - br, -bh + br, br, Math.PI * 1.5, Math.PI * 2);
    sign.add(new THREE.Mesh(new THREE.ShapeGeometry(board, 6), new THREE.MeshBasicMaterial({ color: '#170610' })));
    const word = new THREE.MeshBasicMaterial({ map: tex(c), transparent: true, depthWrite: false, toneMapped: false });
    const wm = new THREE.Mesh(new THREE.PlaneGeometry(tw, th), word); wm.position.z = 0.02; sign.add(wm);
    // the marquee: a bulb about every 0.3 round the edge, one merged mesh per colour, so the chase is three colour changes
    const n = 3 * Math.max(4, Math.round((bw + bh) * 4 / 0.9)), pts = board.getSpacedPoints(n).slice(0, n), bulb = new THREE.SphereGeometry(0.07 * th, 8, 6);
    const bulbs = cols.map((h, k) => { const mat = new THREE.MeshBasicMaterial({ color: col(h), toneMapped: false }); sign.add(new THREE.Mesh(mergeGeometries(pts.filter((_, j) => j % 3 === k).map(p => bulb.clone().translate(p.x, p.y, 0.03))), mat)); return mat; });
    bulb.dispose();
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(2 * bw + 1.2, 2 * bh + 1), new THREE.MeshBasicMaterial({ map: soft, color: col(cols[0]), transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.position.z = -0.04; sign.add(glow);
    G.add(sign);
    const sn = { sign, word, bulbs, glow: glow.material, cols: cols.map(col), hex: cols[0], at, up, s, w: bw, flick: 0, kick: 0, k: 0 }; // k: featured by the flyover, 0..1
    S.signs.push(sn);
    return sn;
  }
  // a name sign for every other mod, in the player's language: beside it on the tower's side, just clear of its box (the
  // camera watches from the other side, so a sign never hides a marble), lifted over the walls; a ring's or bowl's over
  // its rim. Wormhole, trap, fork and mud sit on a straight: by their spot (a trap's / fork's a little before it)
  const NAMEC = { carousel: GOLD, trap: TRAP, fork: FW[0], mist: '#9ff7ff', boomerang: '#ff9de6', basin: '#7fe3ff', whirlpool: '#4fd8ff',
    ramp: PASTEL[1], jump: '#ffd27a', boost: '#7cf0c5', narrow: COILC[0], trapdoor: '#ffd54a', mud: '#e0b07a' };
  function nameSigns(def, G) {
    const L = def.line, st = def.stadium, zMid = (st.zFront + st.zBack) / 2, Y = v3().set(0, 1, 0);
    const lineAt = s => { let j = 0; for (let i = 4; i < L.length; i += 4) if (Math.abs(L[i + 3] - s) < Math.abs(L[j + 3] - s)) j = i; return v3().set(L[j], L[j + 1], L[j + 2]); };
    const sign = (key, at, s, hex = NAMEC[key]) => modSign(G, at, Y, (hooks.modName?.(key) ?? key).toUpperCase(), [hex, '#fff3c4', PASTEL[S.signs.length % 3]], 0.6, s);
    const put = (key, p, box, lift, s, hex) => {
      const d = v3().set(Math.max(-st.half, Math.min(st.half, p.x)) - p.x, 0, zMid - p.z).normalize(); // toward the tower
      if (d.lengthSq() < 0.5) d.set(0, 0, -1);
      const out = a => d.getComponent(a) ? ((d.getComponent(a) > 0 ? box[a + 3] : box[a]) - p.getComponent(a)) / d.getComponent(a) : Infinity;
      const edge = typeof box === 'number' ? box : box ? Math.max(0, Math.min(out(0), out(2))) : def.W / 2 + THICK; // box: the mod's, or its rim's radius
      sign(key, p.clone().addScaledVector(d, edge + 0.5).setY(p.y + lift), s, hex);
    };
    for (const m of def.mods) {
      if (!(m.type in NAMEC) || m.type === 'trap' || m.runout || !isFinite(m.aabb?.[0])) continue; // 'trap' modules: the side lanes (signed below)
      const round = def.rings.find(x => x.mod === m.index) || def.basins.find(x => x.mod === m.index), b = m.aabb, mid = (m.s0 + m.s1) / 2;
      if (m.type === 'boomerang') { sign(m.type, v3().set((b[0] + b[3]) / 2, b[4] + 0.9, b[2] - 0.5), mid); continue; } // watched from the front (see outward): over its back
      round ? put(m.type, v3().set(...round.c), (round.rWall ?? round.rB) + THICK, (round.wall ?? round.top) + 1.4, mid) : put(m.type, lineAt(mid), m.aabb, 1.9, mid);
    }
    const on = (key, s, hex) => { // clear of the modules round its spot (a narrow helix's coils stick out of its channel)
      const p = lineAt(s), b = def.mods.map(m => m.aabb).filter((b, k) => def.mods[k].s1 > s - 3 && def.mods[k].s0 < s + 3 && b[0] <= p.x && p.x <= b[3] && b[2] <= p.z && p.z <= b[5]);
      put(key, p, b.length ? b.reduce((u, q) => u.map((v, i) => i < 3 ? Math.min(v, q[i]) : Math.max(v, q[i]))) : null, 1.9, s, hex);
    };
    for (const w of def.wormholes) if (!w.roulette) on('wormhole', w.a.s, HOLE[w.color]);
    for (const tp of def.traps) if (!tp.door) on(tp.fork ? 'fork' : 'trap', tp.a.s - 3);
    for (const md of def.muds) on('mud', md.s);
  }
  // a trap: a hazard pad on the floor before the turn (orange and dark stripes round a dark disc), its arrow pointing
  // out to the lane alongside, and a ring that keeps pulsing outward
  const padTex = (() => {
    const c = canvas(128), g = c.getContext('2d');
    g.save(); g.beginPath(); g.arc(64, 64, 63, 0, 6.283); g.clip();
    g.fillStyle = TRAP; g.fillRect(0, 0, 128, 128);
    g.strokeStyle = '#2a0b14'; g.lineWidth = 11;
    for (let x = -128; x < 256; x += 26) { g.beginPath(); g.moveTo(x, 128); g.lineTo(x + 128, 0); g.stroke(); }
    g.restore();
    g.fillStyle = '#1a0710'; g.beginPath(); g.arc(64, 64, 44, 0, 6.283); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(34, 52); g.lineTo(66, 52); g.lineTo(66, 36); g.lineTo(96, 64); g.lineTo(66, 92); g.lineTo(66, 76); g.lineTo(34, 76); g.closePath(); g.fill();
    return tex(c);
  })();
  function trapMesh(tp, G) {
    const o = new THREE.Group(), up = v3().set(...tp.a.u), x = v3().set(...tp.in.p).sub(tmpV.set(...tp.a.p));
    x.addScaledVector(up, -x.dot(up)).normalize(); // texture right (the arrow) points at the lane
    o.quaternion.setFromRotationMatrix(tmpM.makeBasis(x, up, v3().crossVectors(x, up)));
    o.position.set(...tp.a.p).addScaledVector(up, 0.015);
    o.add(new THREE.Mesh(new THREE.CircleGeometry(tp.a.r, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: padTex, color: new THREE.Color(1.15, 1.15, 1.15), toneMapped: false })));
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.88, 1, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col(TRAP), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    ring.position.y = 0.01; o.add(ring);
    G.add(o);
    // two signs: over the pad, pointing out at the lane (orange); over the lane's end, pointing back in (green)
    const signs = [neonSign(G, v3().set(...tp.a.p).addScaledVector(up, 1.9), up, x, TRAP, '#ffd27a'), outSign(tp, G)];
    return { tp, ring, kick: 0, signs, out: signs[1] };
  }
  // over a lane's end, pointing back in at B (green)
  function outSign(tp, G) {
    const back = v3().set(...tp.b.p).sub(tmpV.set(...tp.out.p)), oup = v3().set(...tp.out.u);
    back.addScaledVector(oup, -back.dot(oup)).normalize();
    return neonSign(G, v3().set(...tp.out.p).addScaledVector(oup, 1.9), oup, back, '#3dffa8', '#d4ffe9');
  }
  // a glass tube along curve (radius r, seen from both sides), into geos
  const glassTube = (geos, curve, r, seg) => { const g = new THREE.TubeGeometry(curve, seg, r, 16, false), b = g.clone(); b.setIndex([...g.index.array].reverse()); geos.glass.push(g, b); };
  // a fork: a gantry over the course at its paddle (A) with three lamps across it, EXPRESS on the tower's side (mint), MAIN
  // (white), LONG on the outside (orange). The lit one is the signal now (forkWay, from sim time, so it matches the sim)
  // and the white arrow under them swings to point that way. The EXPRESS is a glass tube from a mouth over A across the
  // turn to a mouth over B, neon hoops along it; a neon sign at the long lane's end points back in
  const GANTRY_H = 3.2;
  function forkMesh(tp, G, geos) {
    const ex = tp.fork.express, p = v3().set(...tp.a.p), t = v3().set(...tp.a.t), up = v3().set(...tp.a.u), r = v3().crossVectors(t, up);
    const inSide = Math.sign(tmpV.set(...tp.b.p).sub(p).dot(r)) || 1, X = S.def.W / 2 + 0.45;
    const g = new THREE.Group();
    g.position.copy(p); g.quaternion.setFromRotationMatrix(tmpM.makeBasis(r, up, v3().copy(t).negate())); // x across, y up, z upstream
    for (const sx of [-X, X]) g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, GANTRY_H, 10).translate(sx, GANTRY_H / 2, 0), M.gold));
    g.add(new THREE.Mesh(new THREE.BoxGeometry(2 * X + 0.2, 0.16, 0.18).translate(0, GANTRY_H, 0), M.gold));
    const board = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.15, 0.06).translate(0, GANTRY_H - 0.62, 0.05), new THREE.MeshBasicMaterial({ color: '#170610' }));
    g.add(board);
    const lamps = [inSide * 0.75, 0, -inSide * 0.75].map((lx, k) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 10), new THREE.MeshBasicMaterial({ color: col(FW[k]), toneMapped: false }));
      m.position.set(lx, GANTRY_H - 0.3, 0.12); g.add(m);
      return m;
    });
    const sh = new THREE.Shape([[0, 0.32], [0.24, 0.06], [0.09, 0.06], [0.09, -0.28], [-0.09, -0.28], [-0.09, 0.06], [-0.24, 0.06]].map(([x, y]) => new THREE.Vector2(x, y)));
    const arrow = new THREE.Group(); arrow.position.set(0, GANTRY_H - 0.82, 0.1);
    arrow.add(new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false, side: THREE.DoubleSide })));
    g.add(arrow);
    G.add(g);
    // the tube: the express's path across (expressAt), mouths flaring down over A and B
    const pts = [];
    for (let j = 0; j <= 16; j++) pts.push(v3().fromArray(expressAt(ex, 0.2 + 0.65 * j / 16, ex.a, [0, 0, 0])));
    const curve = new THREE.CatmullRomCurve3(pts);
    glassTube(geos, curve, 0.58, 48);
    const lc = mixWhite(FW[0], 0.3).multiplyScalar(NEON);
    for (const [m, u] of [[ex.a, tp.a.u], [ex.b, tp.b.u]]) {
      const bell = new THREE.CylinderGeometry(0.58, 0.8, 0.5, 20, 1, true).applyMatrix4(tmpM.makeTranslation(0, -0.25, 0)), q = new THREE.Quaternion().setFromUnitVectors(tmpV.set(0, 1, 0), tmpV2.set(...u));
      bell.applyQuaternion(q).translate(...m);
      const b2 = bell.clone(); b2.setIndex([...bell.index.array].reverse());
      geos.glass.push(bell, b2);
      const lip = new THREE.TorusGeometry(0.8, 0.04, 6, 32).rotateX(Math.PI / 2).translate(0, -0.5, 0).applyQuaternion(q).translate(...m);
      tintGeo(lip, lc); geos.rim.push(lip);
    }
    for (let j = 1; j < 6; j++) { // neon hoops along it
      const c = curve.getPointAt(j / 6), d = curve.getTangentAt(j / 6), hoop = new THREE.TorusGeometry(0.6, 0.035, 6, 32);
      hoop.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(tmpV.set(0, 0, 1), d)).translate(c.x, c.y, c.z);
      tintGeo(hoop, lc); geos.rim.push(hoop);
    }
    const out = outSign(tp, G);
    return { tp, kind: 'fork', lamps, arrow, way: -1, ang: 0, flash: 0, signs: [out], out, inSide };
  }
  // trapdoors: per lid a hole on its half, its hazard-striped frame always on the floor and the dark cave in it showing as
  // the lid lifts, and its lid: a blue panel hinged on the hole's downstream edge that lifts up and back toward the
  // oncoming marbles (doorAngle, from sim time), blinking red over the warning before it lifts. At the side track's
  // start, the cave mouth the eaten marbles roll out of
  const hazardTex = (() => {
    const c = canvas(64), g = c.getContext('2d');
    g.fillStyle = '#ffd54a'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#1a1020'; g.lineWidth = 8;
    for (let x = -64; x < 128; x += 20) { g.beginPath(); g.moveTo(x, 64); g.lineTo(x + 64, 0); g.stroke(); }
    const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); return t;
  })();
  const caveTex = (() => { const c = canvas(64), g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 40); r.addColorStop(0, '#3a1408'); r.addColorStop(0.35, '#0a0306'); r.addColorStop(1, '#020104'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return tex(c); })();
  function doorMesh(def, tp, G) {
    const dr = tp.door, lids = [], x0 = dr.mid, x1 = dr.hw - dr.edge, w = x1 - x0;
    for (const lid of dr.lids) {
      const fr = frameAt(def.chains, lid.s), t = v3().set(...fr.t), up = v3().set(...fr.u), r = v3().set(...fr.r);
      const base = new THREE.Group();
      base.position.set(...fr.p).addScaledVector(r, (lid.half ? 1 : -1) * (x0 + x1) / 2).addScaledVector(up, 0.012);
      base.quaternion.setFromRotationMatrix(tmpM.makeBasis(r, up, v3().copy(t).negate())); // x across, y up, z upstream
      base.add(new THREE.Mesh(new THREE.PlaneGeometry(w + 0.16, dr.len + 0.16).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: hazardTex, color: new THREE.Color(0.9, 0.9, 0.9), toneMapped: false })));
      const hole = new THREE.Mesh(new THREE.PlaneGeometry(w, dr.len).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: caveTex, transparent: true, opacity: 0, depthWrite: false }));
      hole.position.y = 0.006; base.add(hole);
      const hinge = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color: '#7aa7ff', roughness: 0.35, metalness: 0.25, emissive: '#000000' });
      hinge.position.set(0, 0.012, -dr.len / 2); // the downstream edge
      hinge.add(new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, dr.len).translate(0, 0.03, dr.len / 2), mat));
      base.add(hinge);
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, w + 0.06, 8).rotateZ(Math.PI / 2), M.gold);
      pin.position.set(0, 0.04, -dr.len / 2); base.add(pin);
      G.add(base);
      lids.push({ lid, hinge, mat, hole, p: base.position.toArray(), c: -1 });
    }
    // the cave mouth: a dark hole in the side track's start cap, an orange rim round it
    const i = tp.in, mouth = new THREE.Group();
    mouth.position.set(...i.p).addScaledVector(tmpV.set(...i.t), -0.97).addScaledVector(tmpV2.set(...i.u), 0.62);
    mouth.quaternion.setFromUnitVectors(tmpV.set(0, 0, 1), tmpV2.set(...i.t));
    mouth.add(new THREE.Mesh(new THREE.CircleGeometry(0.62, 32), new THREE.MeshBasicMaterial({ map: pitTex, color: '#40281c' })));
    mouth.add(new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.05, 6, 32), new THREE.MeshBasicMaterial({ color: col(TRAP).multiplyScalar(1.4), toneMapped: false })));
    G.add(mouth);
    const out = outSign(tp, G);
    return { tp, kind: 'door', lids, signs: [out], out };
  }
  // a neon direction sign: a dark board, a neon frame and three chevrons chasing along x. It turns about x to face the
  // camera (see the loop), so the arrow always points the same way in the world and reads from any side
  function neonSign(G, at, up, x, frameHex, chevHex) {
    const sign = new THREE.Group(), neon = h => new THREE.MeshBasicMaterial({ color: col(h), toneMapped: false });
    const tube = (pts, closed, r) => {
      const c = closed ? new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0) : new THREE.CurvePath();
      if (!closed) pts.slice(1).forEach((p, j) => c.add(new THREE.LineCurve3(pts[j], p)));
      return new THREE.TubeGeometry(c, closed ? 96 : 16, r, 6, closed);
    };
    const board = new THREE.Shape(), bw = 0.85, bh = 0.42, br = 0.16;
    board.absarc(bw - br, bh - br, br, 0, Math.PI / 2); board.absarc(-bw + br, bh - br, br, Math.PI / 2, Math.PI); board.absarc(-bw + br, -bh + br, br, Math.PI, Math.PI * 1.5); board.absarc(bw - br, -bh + br, br, Math.PI * 1.5, Math.PI * 2);
    sign.add(new THREE.Mesh(new THREE.ShapeGeometry(board, 6), new THREE.MeshBasicMaterial({ color: '#170610', side: THREE.DoubleSide })));
    const frame = neon(frameHex);
    sign.add(new THREE.Mesh(tube(board.getSpacedPoints(64).map(p => v3().set(p.x, p.y, 0.02)), true, 0.035), frame));
    const chev = [-0.4, 0, 0.4].map(cx => { const m = new THREE.Mesh(tube([[-0.13, 0.24], [0.13, 0], [-0.13, -0.24]].map(([x, y]) => v3().set(cx + x, y, 0.03)), false, 0.05), neon(chevHex)); sign.add(m); return m; });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.5), new THREE.MeshBasicMaterial({ map: soft, color: col(frameHex), transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.position.z = -0.04; sign.add(glow);
    G.add(sign);
    return { sign, frame, chev, x, at, up, flick: 0, kick: 0, chevC: col(chevHex), frameC: col(frameHex) };
  }
  // mud: a wet brown blob (lumpy rim, darker clumps, glossy glints) on a grid that hugs the floor over the patch;
  // the blob sits just inside the ellipse the sim slows marbles in
  const mudTex = (() => {
    const c = canvas(128), g = c.getContext('2d');
    const blob = (col, x, y, s, k) => { g.fillStyle = col; g.beginPath(); for (let j = 0; j <= 48; j++) { const a = j / 48 * 6.283, r = s * (1 + 0.08 * Math.sin(5 * a + k) + 0.05 * Math.sin(9 * a + 2 * k)); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.fill(); };
    blob('#3f2512', 64, 64, 56, 0); blob('#5a381c', 64, 64, 46, 1.7);
    for (let k = 0; k < 9; k++) blob(k % 2 ? '#34200f' : '#6b4524', 64 + Math.cos(k * 2.4) * 28, 64 + Math.sin(k * 2.4) * 28, 6 + (k * 7) % 9, k);
    g.fillStyle = 'rgba(255,236,210,.35)';
    for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(64 + Math.cos(k * 1.9 + 1) * 22, 64 + Math.sin(k * 1.9 + 1) * 30, 5, 2, k, 0, 6.283); g.fill(); }
    return tex(c);
  })();
  function mudMesh(def, md, G) {
    const NA = 8, NB = 6, pos = [], uv = [], idx = [];
    for (let i = 0; i <= NA; i++) {
      const fr = frameAt(def.chains, md.s0 + (md.s1 - md.s0) * i / NA);
      for (let j = 0; j <= NB; j++) {
        const x = md.c + md.a * (j / NB * 2 - 1);
        for (let k = 0; k < 3; k++) pos.push(fr.p[k] + fr.r[k] * x + fr.u[k] * 0.02);
        uv.push(j / NB, i / NA);
        if (i && j) { const a = (i - 1) * (NB + 1) + j - 1, b = a + NB + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); } // faces up (r x t)
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: mudTex, transparent: true, depthWrite: false, roughness: 0.25, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.receiveShadow = true;
    G.add(m);
  }
  const chevTex = (() => { const cc = canvas(64, 64), g = cc.getContext('2d'); g.strokeStyle = '#fff'; g.lineWidth = 9; g.lineJoin = 'round'; g.beginPath(); g.moveTo(12, 52); g.lineTo(32, 18); g.lineTo(52, 52); g.stroke(); return tex(cc); })();
  function boostMesh(def, bp, G) {
    for (let s = bp.s0 + 0.4; s < bp.s1; s += 0.8) {
      const fr = frameAt(def.chains, s), m = new THREE.Mesh(new THREE.PlaneGeometry(def.W * 0.7, 0.7), new THREE.MeshBasicMaterial({ map: chevTex, color: new THREE.Color(0.4, 1.4, 1), transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
      m.position.set(...fr.p).addScaledVector(tmpV.set(...fr.u), 0.03);
      tmpM.makeBasis(tmpV.set(...fr.r), tmpV2.set(...fr.t).negate(), v3().set(...fr.u)); // plane: x across, y backwards along the run (arrow points forward)
      m.quaternion.setFromRotationMatrix(tmpM);
      m.userData.boost = s;
      G.add(m);
    }
  }
  // a jump's hoop: a gold neon ring standing across the flight just past the lip, a soft glow filling it; it flashes in
  // the colour of each marble that flies through
  function hoopMesh(hp, G) {
    const o = new THREE.Group(), base = col('#ffd27a').multiplyScalar(1.6);
    o.position.set(...hp.p); o.quaternion.setFromUnitVectors(tmpV.set(0, 0, 1), tmpV2.set(...hp.n));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(hp.r + 0.03, 0.07, 10, 64), new THREE.MeshBasicMaterial({ color: base.clone(), toneMapped: false }));
    const disc = new THREE.Mesh(new THREE.PlaneGeometry(hp.r * 3, hp.r * 3), new THREE.MeshBasicMaterial({ map: soft, color: col('#ffd27a'), transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    o.add(ring, disc);
    G.add(o);
    return { hp, o, ring, disc, base, hit: new THREE.Color(), flash: 0 };
  }
  function finishMesh(def, G, geos) {
    const fr = frameAt(def.chains, def.finish.s), hw = def.W / 2 + 0.6, r = tmpV2.set(...fr.r);
    for (const sgn of [-1, 1]) geos.gold.push(new THREE.CylinderGeometry(0.16, 0.2, 3.4, 16).translate(fr.p[0] + r.x * hw * sgn, fr.p[1] + 1.7, fr.p[2] + r.z * hw * sgn));
    const chk = (() => { const cc = canvas(128, 32), g = cc.getContext('2d'); for (let x = 0; x < 16; x++) for (let y = 0; y < 4; y++) { g.fillStyle = (x + y) % 2 ? '#ffffff' : '#1a1040'; g.fillRect(x * 8, y * 8, 8, 8); } return tex(cc); })();
    const band = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, 0.5, 0.12), new THREE.MeshStandardMaterial({ map: chk, emissive: '#ffffff', emissiveMap: chk, emissiveIntensity: 0.3, roughness: 0.4 }));
    band.position.set(fr.p[0], fr.p[1] + 3.2, fr.p[2]); band.rotation.y = -Math.atan2(fr.t[2], fr.t[0]) + Math.PI / 2;
    G.add(band);
    const line = new THREE.Mesh(new THREE.PlaneGeometry(def.W, 0.25).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: chk, toneMapped: false }));
    line.position.set(fr.p[0], fr.p[1] + 0.02, fr.p[2]); line.rotation.y = band.rotation.y; G.add(line);
    S.arch = { p: new THREE.Vector3(...fr.p), t: new THREE.Vector3(...fr.t), band };
    // the moguls on the run-in: each its ball's cap above the floor, the module's colour at the foot to snow on top (even
    // light head-on flattened a plain tint into a decal)
    for (const m of def.moguls) {
      const g = new THREE.SphereGeometry(m.r, 32, 6, 0, Math.PI * 2, 0, Math.acos(1 - m.h / m.r)), pos = g.attributes.position;
      const c = new Float32Array(pos.count * 3), foot = col(PASTEL[m.mod % 3]), snow = col('#ffffff');
      for (let i = 0; i < pos.count; i++) tmpC.copy(foot).lerp(snow, 0.85 * Math.max(0, (pos.getY(i) - m.r + m.h) / m.h) ** 1.5).toArray(c, i * 3); // max: the rim rounds a hair under 0, and a negative ** 1.5 is NaN (black)
      g.setAttribute('color', new THREE.BufferAttribute(c, 3));
      geos.track.push(g.applyQuaternion(tmpQ.setFromUnitVectors(tmpV.set(0, 1, 0), tmpV2.set(...m.u))).translate(...m.p));
    }
  }
  // split checkpoint k: a glowing mint line across the floor, its number floating over the middle
  function splitMesh(def, s, k, G) {
    const fr = frameAt(def.chains, s), up = v3().set(...fr.u), lt = labelTex(String(k + 1), '#5dffb0');
    const line = new THREE.Mesh(new THREE.PlaneGeometry(fr.hw * 2, 0.3), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 1.6, 1.2), transparent: true, opacity: 0.9, depthWrite: false, toneMapped: false }));
    line.position.set(...fr.p).addScaledVector(up, 0.03);
    line.quaternion.setFromRotationMatrix(tmpM.makeBasis(tmpV.set(...fr.r), tmpV2.set(...fr.t).negate(), up));
    const num = new THREE.Sprite(new THREE.SpriteMaterial({ map: lt.t, depthWrite: false, transparent: true }));
    num.scale.set(0.75 * lt.aspect, 0.75, 1); num.position.copy(line.position).addScaledVector(up, 1.2);
    G.add(line, num);
  }
  // the finish rack: n glass-dome cups on a curved podium beyond the runout, facing back toward the course; up to
  // 10 a tier, 2 tiers for more
  function rackMesh(def, G) {
    const fr = frameAt(def.chains, def.finish.s), t = new THREE.Vector3(fr.t[0], 0, fr.t[2]).normalize(), side = new THREE.Vector3(-t.z, 0, t.x);
    const n = def.n, rows = n > 10 ? 2 : 1, per = Math.ceil(n / rows), spacing = 1.7, rad = Math.max(6, per * spacing / 2.2);
    const center = new THREE.Vector3(...fr.p).addScaledVector(t, 9 + rad);
    const cups = [];
    const dotTex = (() => { const cc = canvas(128, 16), g = cc.getContext('2d'); g.fillStyle = '#2a1f5c'; g.fillRect(0, 0, 128, 16); for (let x = 8; x < 128; x += 16) { g.fillStyle = '#fff6c4'; g.beginPath(); g.arc(x, 8, 3, 0, 7); g.fill(); } const tt = tex(cc); tt.wrapS = THREE.RepeatWrapping; tt.repeat.set(3, 1); return tt; })();
    const ledMat = new THREE.MeshBasicMaterial({ map: dotTex, color: new THREE.Color(1.6, 1.4, 1.1), toneMapped: false });
    for (let k = 0; k < n; k++) {
      const row = rows === 2 && k >= per ? 1 : 0, idx = row ? k - per : k, cnt = row ? n - per : per;
      const ang = (idx - (cnt - 1) / 2) * spacing / rad;
      const p = center.clone().addScaledVector(t, -Math.cos(ang) * rad + row * 2.2).addScaledVector(side, Math.sin(ang) * rad);
      p.y = S.floorY + 0.6 + row * 1.3;
      const g = new THREE.Group(); g.position.copy(p); g.lookAt(p.x - t.x, p.y, p.z - t.z);
      // its own material, so a landing or the joker's spotlight lights this pedestal only (one shared per colour lit every third cup, or none)
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 1.2 + row * 1.3, 32), new THREE.MeshStandardMaterial({ color: PASTEL[k % 3], roughness: 0.35 })); ped.position.y = -0.6 - row * 0.65; g.add(ped);
      const led = new THREE.Mesh(new THREE.CylinderGeometry(0.805, 0.805, 0.16, 32, 1, true), ledMat); led.position.y = -0.18; g.add(led);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.66, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), M.glass); dome.renderOrder = 4; g.add(dome);
      const glyph = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false })); glyph.scale.setScalar(0.7); glyph.position.y = 0.42; glyph.visible = false; g.add(glyph);
      G.add(g);
      cups.push({ g, ped, glyph, p: p.clone().setY(p.y + MR + 0.02), flash: 0, slam: 0 });
    }
    return { cups, center, t };
  }

  // ---------- marbles ----------
  // players: [{ z: animal, color }], in player order
  function setMarbles(players) {
    S.players = players;
    const n = players.length;
    shells.count = bands.count = blobsM.count = n;
    for (let i = 0; i < n; i++) {
      tmpC.set(players[i].color);
      shells.setColorAt(i, tmpC.clone().lerp(col('#ffffff'), 0.55));
      bands.setColorAt(i, tmpC);
    }
    shells.instanceColor.needsUpdate = bands.instanceColor.needsUpdate = true;
    faces.geometry.instanceCount = n;
    halos.geometry.instanceCount = n;
    S.trail = new Float32Array(n * TRAIL * 3);
    S.trailN = new Int16Array(n);
    S.blink = players.map(() => ({ next: 3 + Math.random() * 4, until: 0, twice: Math.random() < 0.33 }));
    S.shellCol = players.map(p => col(p.color).lerp(col('#ffffff'), 0.55));
    S.pcol = players.map(p => col(p.color));
    S.coat = new Float32Array(n); S.sink = new Float32Array(n);
    S.hops = []; S.cupOf = new Int16Array(n).fill(-1);
  }
  const marblePos = new Float32Array(NMAX * 3), marbleQuat = new Float32Array(NMAX * 4);
  const BAND_Q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2), flapE = new THREE.Euler();
  // interpolated marble transforms (prev -> current step), or the stall / cup positions when no sim runs
  function marbleTransforms(alpha) {
    const n = S.players.length, sim = S.sim;
    for (let i = 0; i < n; i++) {
      let x, y, z, qx = 0, qy = 0, qz = 0, qw = 1;
      const cup = S.cupOf[i], hop = S.hops.find(h => h.i === i);
      if (hop) {
        const d = hop.dur || HOP, f = smooth(Math.min(1, hop.t / d)), lift = Math.sin(Math.PI * Math.min(1, hop.t / d)) * (hop.hi || 2.2);
        x = hop.a.x + (hop.b.x - hop.a.x) * f; y = hop.a.y + (hop.b.y - hop.a.y) * f + lift; z = hop.a.z + (hop.b.z - hop.a.z) * f;
      } else if (cup >= 0) {
        const c = S.rack.cups[cup].p; x = c.x; y = c.y + S.rack.cups[cup].slam * -0.15; z = c.z;
      } else if (sim) {
        const o = i * 7, a = sim.prev, b = sim.xf, k = alpha;
        x = a[o] + (b[o] - a[o]) * k; y = a[o + 1] + (b[o + 1] - a[o + 1]) * k; z = a[o + 2] + (b[o + 2] - a[o + 2]) * k;
        let d = a[o + 3] * b[o + 3] + a[o + 4] * b[o + 4] + a[o + 5] * b[o + 5] + a[o + 6] * b[o + 6], s = d < 0 ? -1 : 1;
        qx = a[o + 3] + (s * b[o + 3] - a[o + 3]) * k; qy = a[o + 4] + (s * b[o + 4] - a[o + 4]) * k; qz = a[o + 5] + (s * b[o + 5] - a[o + 5]) * k; qw = a[o + 6] + (s * b[o + 6] - a[o + 6]) * k;
        const l = Math.hypot(qx, qy, qz, qw) || 1; qx /= l; qy /= l; qz /= l; qw /= l;
        // sucked into hole A (the first 30% of a warp): spirals in from where it dropped, faster and faster, down the
        // funnel (view only: the sim just sinks it straight down)
        const wu = sim.state[i] === WARP ? sim.warpU(i) : -1, h = S.holes[sim.warp[i]], wi = S.warpIn?.[i];
        if (wu >= 0 && wu < 0.3 && h && wi) {
          const f = Math.min(1, wu / 0.3 + alpha * DT / h.w.time / 0.3), rho = wi[0] * (1 - f) ** 1.4, th = wi[1] + 5 * Math.PI * f ** 1.6, dep = MR * (1 - f) - 0.9 * f * f;
          const c = Math.cos(th) * rho, sn = Math.sin(th) * rho, p = h.w.a.p;
          x = p[0] + h.e1.x * c + h.e2.x * sn + h.up.x * dep; y = p[1] + h.e1.y * c + h.e2.y * sn + h.up.y * dep; z = p[2] + h.e1.z * c + h.e2.z * sn + h.up.z * dep;
        }
      } else {
        const g = S.gateOf?.[i] ?? -1;
        if (g < 0) { x = 0; y = -999; z = 0; } else { const s = stallAt(S.def.fan, g, S.spinNow).pos; x = s[0]; y = s[1]; z = s[2]; }
      }
      marblePos[i * 3] = x; marblePos[i * 3 + 1] = y; marblePos[i * 3 + 2] = z;
      marbleQuat[i * 4] = qx; marbleQuat[i * 4 + 1] = qy; marbleQuat[i * 4 + 2] = qz; marbleQuat[i * 4 + 3] = qw;
    }
  }
  // how far marble i is through its fall down a trapdoor (0..1), or -1
  const fell = i => { const sim = S.sim; return sim && sim.state[i] === TRAPPED && sim.trapPh[i] === 0 && S.def.traps[sim.trap[i]].door ? sim.trapU(i) : -1; };
  function drawMarbles(now, dt) {
    const n = S.players.length, sim = S.sim, bb = faces.geometry.attributes.bb, tint = faces.geometry.attributes.tint, uvr = faces.geometry.attributes.uvr;
    const hb = halos.geometry.attributes.bb, ht = halos.geometry.attributes.tint, hu = halos.geometry.attributes.uvr;
    for (let i = 0; i < n; i++) {
      // mud: coated while on a patch, drying off over COAT_T once out; wading a little way into it while on it
      const md = sim ? sim.inMud[i] : 0;
      S.coat[i] = md ? 1 : Math.max(0, S.coat[i] - dt / COAT_T);
      S.sink[i] += (md - S.sink[i]) * Math.min(1, dt * 10);
      const coat = S.coat[i];
      const x = marblePos[i * 3], y = marblePos[i * 3 + 1] - SINK * S.sink[i], z = marblePos[i * 3 + 2];
      const hidden = y < -900, warp = sim && sim.state[i] === WARP, mist = sim && sim.inMist[i];
      // in a wormhole (warpAt): shrinks as it sinks into A, unseen under the track, grows rising out of B; down a trapdoor:
      // shrinks as it drops through, unseen till the side track's cave mouth
      const wu = warp ? sim.warpU(i) : -1, fu = fell(i), ws = fu >= 0 ? (fu < 0.3 ? 1 - 0.75 * fu / 0.3 : 0) : wu < 0 ? 1 : wu < 0.3 ? 1 - 0.75 * (wu / 0.3) ** 1.5 : wu > 0.8 ? 0.5 + (wu - 0.8) / 0.4 : 0;
      const lost = warp && sim.warpE[i] === 2 && ws === 0; // a roulette's LOST: a faint violet spark drifting under the track
      const sc = ws * (S.squash?.[i] ?? 1);
      tmpQ.set(marbleQuat[i * 4], marbleQuat[i * 4 + 1], marbleQuat[i * 4 + 2], marbleQuat[i * 4 + 3]);
      tmpM.compose(tmpV.set(x, y, z), tmpQ, tmpS.set(sc, sc, sc));
      if (hidden || mist) tmpM.makeScale(0, 0, 0);
      shells.setMatrixAt(i, tmpM);
      tmpQ.multiply(BAND_Q);
      tmpM.compose(tmpV.set(x, y, z), tmpQ, tmpS.set(sc, sc, sc));
      if (hidden || mist) tmpM.makeScale(0, 0, 0);
      bands.setMatrixAt(i, tmpM);
      // face: upright, never rolls; waddles; blinks now and then; hurt face while stunned
      const bl = S.blink[i];
      if (now / 1000 > bl.next) { bl.until = now / 1000 + 0.12; bl.next = now / 1000 + 3 + Math.random() * 4 + (bl.twice ? 0.25 : 0); if (bl.twice && Math.random() < 0.5) bl.next = now / 1000 + 0.3; }
      const st = sim ? sim.stun[i] : 0, at = sim ? sim.atk[i] : 0; // OUCH! (frozen) / ATTACK! seconds left
      const variant = st > 0 ? 2 : coat > 0.3 ? 3 : now / 1000 < bl.until ? 1 : 0, [u0, v0, us] = atlasUV(S.players[i].z, variant);
      const fs = hidden || mist ? 0 : MR * (variant === 3 ? 1.25 / FACE_IN_SHELL : 1.25) * sc; // muddy: the whole shell
      bb.setXYZW(i, x, y, z, fs);
      tint.setXYZW(i, 1, 1, 1, 1);
      uvr.setXYZW(i, u0, v0, us, Math.sin(now / 130 + i) * 0.14 + (st > 0 ? Math.sin(now / 45) * 0.25 : 0));
      // status: OUCH! an icy shell, a cold pulsing halo; ATTACK! a red-hot shell, a big flickering orange halo, sparks
      // streaming off behind. Otherwise a faint halo in the player's colour (a soft blob only, inside the mist)
      // mud dulls the shell to wet brown and smothers the glow
      tmpC.copy(S.shellCol[i]);
      if (coat > 0) tmpC.lerp(MUD_C, 0.72 * coat);
      if (st > 0) tmpC.lerp(ICE_C, 0.7); else if (at > 0) tmpC.lerp(HOT_C, 0.55);
      shells.setColorAt(i, tmpC);
      bands.setColorAt(i, tmpC.copy(S.pcol[i]).lerp(MUD_C, 0.8 * coat)); // the glass barely shows a tint; the band does
      tmpC.copy(st > 0 ? ICE_C : at > 0 ? HOT_C : S.pcol[i]);
      const pulse = 0.5 + 0.5 * Math.sin(now / 70);
      if (lost) tmpC.set(RW[2]);
      hb.setXYZW(i, x, y + (lost ? MR * 2 : 0), z, hidden ? 0 : lost ? MR * (1.6 + 0.4 * pulse) : mist ? MR * 3.2 : MR * (st > 0 ? 2.4 + 0.4 * pulse : at > 0 ? 2.8 + 0.3 * pulse : 2) * sc);
      ht.setXYZW(i, tmpC.r, tmpC.g, tmpC.b, lost ? 0.5 : mist ? 0.6 : st > 0 ? 0.35 + 0.25 * pulse : at > 0 ? 0.6 * Math.min(1, at * 4) : 0.2 * (1 - 0.7 * coat));
      hu.setXYZW(i, 0, 0, 1, 0);
      if ((at > 0 || coat > 0.25) && sim && !hidden && !mist && !reduce.matches) {
        const o = i * 7, vx = (sim.xf[o] - sim.prev[o]) / DT, vy = (sim.xf[o + 1] - sim.prev[o + 1]) / DT, vz = (sim.xf[o + 2] - sim.prev[o + 2]) / DT;
        if (at > 0) spark(x, y, z, -vx * 0.2 + rnd() * 1.5, -vy * 0.2 + Math.random() * 1.2, -vz * 0.2 + rnd() * 1.5, Math.random() < 0.5 ? HOT : '#ffd27a', 0.3, 0.07, -4); // sparks off the back
        // ploughing through: flecks flicked up off the back; drying off: drips falling from underneath
        if (md && Math.random() < 0.6) spark(x, y - MR * 0.6, z, -vx * 0.15 + rnd() * 1.4, 1.2 + Math.random() * 1.6, -vz * 0.15 + rnd() * 1.4, Math.random() < 0.7 ? '#d9a66b' : '#8a5a32', 0.35 + Math.random() * 0.2, 0.05 + Math.random() * 0.04);
        else if (!md && Math.random() < coat * 0.2) spark(x + rnd() * MR, y - MR * 0.8, z + rnd() * MR, vx * 0.3, -0.4, vz * 0.3, '#b07a48', 0.3, 0.045);
      }
      // blob shadow on the floor below (Medium / Low), probed every third frame
      if (tier !== 'high' && sim && !hidden) {
        if ((S.frameN + i) % 3 === 0) S.floorGap[i] = sim.state[i] === DONE || warp || fu >= 0 ? -1 : sim.floorBelow(i);
        const gap = S.floorGap[i], s = gap < 0 ? 0 : Math.max(0, 1.6 - gap * 0.35) * MR * 2;
        tmpM.compose(tmpV.set(x, y - Math.max(0, gap) + 0.03, z), tmpQ.identity(), tmpS.set(s, 1, s));
      } else tmpM.makeScale(0, 0, 0);
      blobsM.setMatrixAt(i, tmpM);
    }
    shells.instanceColor.needsUpdate = bands.instanceColor.needsUpdate = true;
    // the dizzy stars ride the other halo instances: three gold stars circling on a tilted ring over the face
    for (let i = 0; i < n; i++) for (let j = 0; j < 3; j++) {
      const k = n * (j + 1) + i, st = S.sim ? S.sim.stun[i] : 0;
      if (st <= 0) { hb.setXYZW(k, 0, 0, 0, 0); continue; }
      const a = now / 1000 * 7 + j * 2.094;
      hb.setXYZW(k, marblePos[i * 3] + Math.cos(a) * MR * 0.8, marblePos[i * 3 + 1] + MR * 1.1 + Math.sin(a) * 0.1, marblePos[i * 3 + 2] + Math.sin(a) * MR * 0.8, MR * 0.45);
      ht.setXYZW(k, 1, 0.85, 0.4, Math.min(1, st * 4));
      hu.setXYZW(k, 0, 0, 1, 0);
    }
    halos.geometry.instanceCount = n * 4;
    // a whirlpool's hold: a ring round each held marble in its colour, running down as its current is about to let go
    const gb = holds.geometry.attributes.bb, gt = holds.geometry.attributes.tint, gu = holds.geometry.attributes.uvr;
    for (let i = 0; i < n; i++) {
      const h = sim ? sim.hold[i] : 0, f = h ? Math.max(0, Math.min(1, (h - sim.t) / (h - sim.hold0[i] || 1))) : 0, k = Math.round((1 - f) * 15);
      gb.setXYZW(i, marblePos[i * 3], marblePos[i * 3 + 1], marblePos[i * 3 + 2], h ? MR * 2.9 : 0);
      gt.setXYZW(i, S.pcol[i].r * 1.4, S.pcol[i].g * 1.4, S.pcol[i].b * 1.4, 0.95);
      gu.setXYZW(i, (k % 4) / 4, 1 - (Math.floor(k / 4) + 1) / 4, 1 / 4, 0);
    }
    holds.geometry.instanceCount = n;
    for (const a of [gb, gt, gu]) a.needsUpdate = true;
    for (const a of [bb, tint, uvr, hb, ht, hu]) a.needsUpdate = true;
    shells.instanceMatrix.needsUpdate = bands.instanceMatrix.needsUpdate = blobsM.instanceMatrix.needsUpdate = true;
    drawTrails();
  }
  // trails: the last TRAIL positions as a camera-facing ribbon, additive, fading to the tail
  function drawTrails() {
    const n = S.players.length, pos = trailGeo.attributes.position.array, cl = trailGeo.attributes.color.array, sim = S.sim;
    camera.getWorldPosition(tmpV2);
    for (let i = 0; i < n; i++) {
      const tr = S.trail, x = marblePos[i * 3], y = marblePos[i * 3 + 1], z = marblePos[i * 3 + 2];
      const hide = !sim || y < -900 || sim.state[i] === WARP || fell(i) >= 0 || sim.inMist[i] || S.cupOf[i] >= 0 || S.hops.some(h => h.i === i);
      if (hide) { S.trailN[i] = 0; } else {
        const b = i * TRAIL * 3;
        // a jump of over 1.5 in one frame is a rescue teleport: start afresh rather than draw a line across it
        if (S.trailN[i] && (x - tr[b]) ** 2 + (y - tr[b + 1]) ** 2 + (z - tr[b + 2]) ** 2 > 2.25) S.trailN[i] = 0;
        // point 0 rides the marble; a new point is laid once it is TRAIL_GAP past the last one laid (point 1). Measuring
        // from point 0 (last frame) never laid one at a slow roll, which left a straight line back to the stall
        if (S.trailN[i] < 2 || (x - tr[b + 3]) ** 2 + (y - tr[b + 4]) ** 2 + (z - tr[b + 5]) ** 2 > TRAIL_GAP ** 2) {
          tr.copyWithin(b + 3, b, b + (TRAIL - 1) * 3);
          S.trailN[i] = Math.min(TRAIL, S.trailN[i] + 1);
        }
        tr[b] = x; tr[b + 1] = y; tr[b + 2] = z;
      }
      tmpC.copy(sim?.atk[i] > 0 ? HOT_C : S.coat[i] > 0.3 ? DRY_C : S.pcol[i]); // ATTACK!: a hot trail; muddy: a brown smear
      let len = 0; // distance back along the path: fades out over TRAIL_LEN whatever the speed or frame rate
      for (let k = 0; k < TRAIL; k++) {
        const b = (i * TRAIL + Math.min(k, Math.max(0, S.trailN[i] - 1))) * 3, nb = (i * TRAIL + Math.min(k + 1, Math.max(0, S.trailN[i] - 1))) * 3;
        const px = tr[b], py = tr[b + 1], pz = tr[b + 2];
        let dx = tr[nb] - px, dy = tr[nb + 1] - py, dz = tr[nb + 2] - pz;
        if (k && k < S.trailN[i]) { const pb = b - 3; len += Math.hypot(px - tr[pb], py - tr[pb + 1], pz - tr[pb + 2]); }
        if (k === S.trailN[i] - 1 && k) { const pb = (i * TRAIL + k - 1) * 3; dx = px - tr[pb]; dy = py - tr[pb + 1]; dz = pz - tr[pb + 2]; }
        // side = tangent x view direction
        const vx = tmpV2.x - px, vy = tmpV2.y - py, vz = tmpV2.z - pz;
        let sx = dy * vz - dz * vy, sy = dz * vx - dx * vz, sz = dx * vy - dy * vx;
        const sl = Math.hypot(sx, sy, sz) || 1, f = Math.max(0, 1 - len / TRAIL_LEN), w = MR * 0.6 * 0.5 * f;
        sx = sx / sl * w; sy = sy / sl * w; sz = sz / sl * w;
        const o = (i * TRAIL + k) * 6, a = k < S.trailN[i] ? 0.3 * f * f : 0;
        pos[o] = px + sx; pos[o + 1] = py + sy; pos[o + 2] = pz + sz; pos[o + 3] = px - sx; pos[o + 4] = py - sy; pos[o + 5] = pz - sz;
        const c = (i * TRAIL + k) * 8;
        cl[c] = cl[c + 4] = tmpC.r * a; cl[c + 1] = cl[c + 5] = tmpC.g * a; cl[c + 2] = cl[c + 6] = tmpC.b * a; cl[c + 3] = cl[c + 7] = a;
      }
    }
    trailGeo.setDrawRange(0, n * (TRAIL - 1) * 6);
    trailGeo.attributes.position.needsUpdate = trailGeo.attributes.color.needsUpdate = true;
  }

  // ---------- effects ----------
  const sparkC = new Map(); // spark colours, parsed once: a burst used to parse its colour string for every spark
  // amb: an ambient spark (a wormhole's pull), which leaves a still view throttled; any other keeps full rate while it flies
  function spark(x, y, z, vx, vy, vz, color, life, size, g = -12, amb = false) {
    const k = P.next; P.next = (P.next + 1) % P.max;
    if (!amb) S.fxUntil = Math.max(S.fxUntil, performance.now() + life * 1000);
    let c = sparkC.get(color);
    if (!c) sparkC.set(color, c = col(color));
    P.x[k * 3] = x; P.x[k * 3 + 1] = y; P.x[k * 3 + 2] = z; P.v[k * 3] = vx; P.v[k * 3 + 1] = vy; P.v[k * 3 + 2] = vz;
    P.c[k * 4] = c.r; P.c[k * 4 + 1] = c.g; P.c[k * 4 + 2] = c.b; P.c[k * 4 + 3] = 1;
    P.life[k] = 0; P.max_[k] = life; P.size[k] = size; P.g[k] = g;
  }
  const rnd = () => Math.random() - 0.5;
  function burst(p, color, count, speed) { for (let k = 0; k < count; k++) { const a = Math.random() * 6.283, b = Math.acos(Math.random() * 2 - 1), s = speed * (0.3 + Math.random() * 0.7); spark(p[0], p[1], p[2], Math.sin(b) * Math.cos(a) * s, Math.cos(b) * s + speed * 0.3, Math.sin(b) * Math.sin(a) * s, color, 0.5 + Math.random() * 0.6, 0.08 + Math.random() * 0.1); } }
  function spray(p, dir, color, count, speed) { for (let k = 0; k < count; k++) { const s = speed * (0.4 + Math.random() * 0.6); spark(p[0], p[1], p[2], (dir[0] + rnd() * 0.9) * s, (dir[1] + rnd() * 0.9) * s, (dir[2] + rnd() * 0.9) * s, k % 3 ? color : '#ffffff', 0.3 + Math.random() * 0.3, 0.07 + Math.random() * 0.08, 0); } }
  function implode(p, color, rim) { for (let k = 0; k < 30; k++) { const a = Math.random() * 6.283, r = 1 + Math.random() * 0.6; spark(p[0] + Math.cos(a) * r, p[1] + 0.3, p[2] + Math.sin(a) * r, -Math.cos(a) * r * 4, -0.5, -Math.sin(a) * r * 4, k % 3 ? color : rim, 0.28, 0.09, 0); } }
  function confetti(center) { for (let k = 0; k < 140; k++) spark(center.x + rnd() * 12, center.y + 7 + Math.random() * 3, center.z + rnd() * 8, rnd() * 3, -2 - Math.random() * 3, rnd() * 3, ['#ff5d8f', '#4fd8ff', '#ffb547', '#b98bff', '#5dffb0', '#ffe45e'][k % 6], 2 + Math.random(), 0.16, -3); }
  function shock(p, color, size, dur = 0.6, flat = false) {
    const m = shocks.find(s => !s.visible) || shocks[0];
    Object.assign(m.userData, { t: 0, dur, size, flat }); m.position.set(...p); m.material.color.set(color); m.visible = true;
    if (flat) m.quaternion.setFromAxisAngle(tmpV.set(1, 0, 0), -Math.PI / 2);
  }
  // a spark pulled in across the floor round wormhole h's hole A, curling the way its vortex turns
  function suck(h) {
    const a = h.w.a, th = Math.random() * 6.283, rho = h.rv ? h.rv * (0.9 + Math.random() * 0.25) : a.r * HOLE_VIS * (2.2 + Math.random() * 0.6), c = Math.cos(th), s = Math.sin(th);
    const px = c * h.e1.x + s * h.e2.x, py = c * h.e1.y + s * h.e2.y, pz = c * h.e1.z + s * h.e2.z; // out from the axis
    const tx = -s * h.e1.x + c * h.e2.x, ty = -s * h.e1.y + c * h.e2.y, tz = -s * h.e1.z + c * h.e2.z; // round it
    spark(a.p[0] + px * rho + h.up.x * 0.08, a.p[1] + py * rho + h.up.y * 0.08, a.p[2] + pz * rho + h.up.z * 0.08,
      -px * 4 + tx * 2, -py * 4 + ty * 2, -pz * 4 + tz * 2, Math.random() < 0.3 ? '#ffffff' : h.c, 0.32, 0.05 + Math.random() * 0.03, 0, true);
  }
  function pillar(p, color, h) { const m = pillars.find(s => !s.visible) || pillars[0]; Object.assign(m.userData, { t: 0, h }); m.position.set(p.x, p.y - 0.3, p.z); m.material.color.set(color).multiplyScalar(0.9); m.visible = true; }
  // small: the tiny OUCH! / ATTACK! pair; dy: shift on screen in label heights (+ up), so a pair stacks, not overlaps
  // labels a crowd sets off together (a pile-up, a pack into a bowl): one per gap s of sim time per kind. Sim time
  // starts at 0 every race, so the table is reset with each course (stale stamps hid the first ones of the next race)
  function every(k, gap, t) {
    if (t - (S.lab[k] ?? -9) <= gap) return false;
    S.lab[k] = t;
    return true;
  }
  // a marble's event label: the 3D sprite (show: false when a crowd just had one), and always the word to game.js for
  // that marble's edge badge (S.who: the marble it's about)
  function label(p, text, color, small = false, dy = 0, show = true) {
    if (!text) return;
    hooks.onTag?.(S.who, text, color);
    if (!show) return;
    const s = labels.find(l => !l.visible) || labels.reduce((a, b) => a.userData.born < b.userData.born ? a : b);
    const { t, aspect } = labelTex(text, color);
    s.material.map = t; // swapping maps keeps the shader
    s.center.set(0.5, 0.5 - dy);
    Object.assign(s.userData, { t: 0, born: performance.now(), x: p[0], y: p[1] + 0.9, z: p[2], aspect, h: small ? 0.028 : 0.045 });
    s.visible = true;
  }
  function fxStep(dt) {
    const pos = parts.geometry.attributes.position.array, pc = parts.geometry.attributes.pcol.array, ps = parts.geometry.attributes.psize.array;
    let alive = 0;
    const d = Math.pow(0.15, dt);
    for (let k = 0; k < P.max; k++) {
      if (P.life[k] >= P.max_[k]) { if (pc[k * 4 + 3]) pc[k * 4 + 3] = 0; continue; }
      alive++;
      P.life[k] += dt;
      P.v[k * 3 + 1] += P.g[k] * dt;
      P.v[k * 3] *= d; P.v[k * 3 + 2] *= d;
      for (let c = 0; c < 3; c++) pos[k * 3 + c] = P.x[k * 3 + c] += P.v[k * 3 + c] * dt; // no subarray views: two garbage objects per spark per frame
      const f = Math.max(0, 1 - P.life[k] / P.max_[k]);
      pc[k * 4] = P.c[k * 4]; pc[k * 4 + 1] = P.c[k * 4 + 1]; pc[k * 4 + 2] = P.c[k * 4 + 2]; pc[k * 4 + 3] = f;
      ps[k] = P.size[k];
    }
    if (alive || P.alive) parts.geometry.attributes.position.needsUpdate = parts.geometry.attributes.pcol.needsUpdate = parts.geometry.attributes.psize.needsUpdate = true; // 48 KB a frame, only while sparks fly
    P.alive = alive;
    for (const s of labels) if (s.visible) {
      const u = s.userData; u.t += dt;
      const f = u.t / u.dur;
      if (f >= 1) { s.visible = false; continue; }
      s.position.set(u.x, u.y + 1.2 * (1 - (1 - f) ** 2), u.z);
      s.material.opacity = f < 0.15 ? f / 0.15 : 1 - ((f - 0.15) / 0.85) ** 2;
      s.scale.set(u.h * u.aspect, u.h, 1);
    }
    for (const m of shocks) if (m.visible) {
      const u = m.userData; u.t += dt;
      const f = u.t / u.dur;
      if (f >= 1) { m.visible = false; continue; }
      m.scale.setScalar(u.size * (1 - (1 - f) ** 3) + 0.01);
      m.material.opacity = 1 - f;
      if (!u.flat) m.quaternion.copy(camera.quaternion);
    }
    for (const m of pillars) if (m.visible) {
      const u = m.userData; u.t += dt;
      const f = u.t / 0.6;
      if (f >= 1) { m.visible = false; continue; }
      m.scale.set(1 - f * 0.6, u.h * (1 - (1 - f) ** 3), 1 - f * 0.6);
      m.material.opacity = 0.8 * (1 - f);
    }
    return alive;
  }

  // ---------- sim events -> visuals (the audio and HUD hear them through hooks.onEvent) ----------
  function onSimEvent(e) {
    const p = e.pos, c = S.players[e.i]?.color || '#fff', lab = hooks.label || (k => k);
    S.who = e.i;
    if (SIGN_KICK.has(e.type)) { // the nearest mod sign (within 10) flares as a marble goes through
      let best = null, bd = 100;
      tmpV.fromArray(p);
      for (const sn of S.signs) { const q = sn.at.distanceToSquared(tmpV); if (q < bd) { bd = q; best = sn; } }
      if (best) best.kick = 1;
    }
    switch (e.type) {
      case 'peg': {
        S.pegFlash[e.data.peg] = 0.25; S.pegCol[e.data.peg].set(c);
        burst(p, c, 6, 2.5);
        break;
      }
      case 'bump': {
        const q = e.j != null ? [(p[0] + S.sim.xf[e.j * 7]) / 2, (p[1] + S.sim.xf[e.j * 7 + 1]) / 2, (p[2] + S.sim.xf[e.j * 7 + 2]) / 2] : p;
        burst(q, '#fff3c4', 8, 3);
        break;
      }
      case 'stun': { // knocked from behind: the front one (e.i) dizzy, the one behind (e.j) buffed
        const b = S.sim.xf, o = e.j * 7;
        shock([(p[0] + b[o]) / 2, (p[1] + b[o + 1]) / 2, (p[2] + b[o + 2]) / 2], '#fff3c4', 1.2, 0.3);
        burst(p, ICE, 12, 2.5); burst([b[o], b[o + 1], b[o + 2]], HOT, 10, 3);
        // tiny labels, at most a pair every 0.3 s (a crowd at the drop hole would otherwise fill the screen)
        if (!S.sim.inMist[e.i]) {
          const ok = every('stun', 0.3, e.t);
          label(p, lab('ouch'), '#ffd27a', true, 0.6, ok);
          S.who = e.j; label([b[o], b[o + 1], b[o + 2]], lab('attack'), '#ff8a5c', true, -0.6, ok);
        }
        break;
      }
      case 'boost': label(p, lab('boost'), '#7cf0c5'); spray(p, [0, 0.4, 0], '#7cf0c5', 10, 5); break;
      case 'jump': label(p, lab('jump'), mixWhite(c).getStyle()); break;
      case 'hoop': { // through a jump's hoop: it flashes the marble's colour, a ring of light off it
        const h = S.hoops[e.data.jump]; h.flash = 1; h.hit.set(c);
        shock(h.hp.p, '#ffd27a', h.hp.r * 2.4, 0.4); burst(p, c, 10, 3); label(p, lab('hoop'), '#ffd27a', false, -0.7);
        break;
      }
      case 'boomUp': // up one of a boomerang's walls: a spray off it; BOOMERANG! the first time, then which swing (×2, ×3...);
        // labels at most every 0.35 s (a crowd hits the wall together)
        spray(p, [0, 1, 0], c, 8, 4);
        { const ok = every('boom', 0.35, e.t); e.data.n > 1 ? label(p, '×' + e.data.n, '#ff9de6', true, 0, ok) : label(p, lab('boomerang'), '#ff9de6', false, 0, ok); }
        break;
      case 'warpIn': {
        const h = S.holes[e.data.hole]; h.live++;
        { const d = tmpV.set(p[0] - h.w.a.p[0], p[1] - h.w.a.p[1], p[2] - h.w.a.p[2]), u = d.dot(h.e1), v = d.dot(h.e2); // where it went in, round the axis
          (S.warpIn ||= [])[e.i] = [Math.min(Math.hypot(u, v), h.w.a.r * 0.7), Math.atan2(v, u)]; }
        if (!h.rl) { label(p, lab('wormhole'), mixWhite(h.c).getStyle()); implode(h.w.a.p, c, h.c); shock(h.w.a.p, h.c, 2.2, 0.5, true); break; }
        // a roulette: the sector it dropped in on, at most a label every 0.3 s (the whole field drops in); a JACKPOT always
        const x = ['jackpot', 'next', 'lost'].indexOf(e.data.exit);
        burst(p, RW[x], 8, 3);
        label(p, lab(e.data.exit), mixWhite(RW[x], 0.25).getStyle(), x !== 0, 0, every('rou', x ? 0.3 : -1, e.t));
        break;
      }
      case 'trapIn': {
        const tr = S.traps[e.data.trap];
        if (tr.kind === 'door') { // eaten: a dark gulp out of the hole, the camera stays on the leader
          label(p, lab('gulp'), '#ffd54a'); burst(p, '#3a2a40', 14, 3); shock([p[0], p[1] - MR + 0.05, p[2]], '#ffd54a', 1.6, 0.4, true);
          break;
        }
        tr.kick = tr.signs[0].kick = 1;
        label(p, lab('trap'), '#ffb38a'); shock(tr.tp.a.p, TRAP, 2.2, 0.5, true); burst(p, TRAP, 18, 5); spray(p, tr.tp.a.u, '#ffd27a', 10, 4);
        break;
      }
      case 'trapOut': { const tr = S.traps[e.data.trap]; tr.out.kick = 1; label(p, lab(tr.kind === 'door' ? 'back' : 'out'), '#ffb38a'); shock(tr.tp.b.p, tr.kind === 'fork' && e.data.express ? FW[0] : TRAP, 1.8, 0.45, true); burst(p, c, 12, 4); break; }
      case 'fork': { // through the paddle: the lamp that was lit
        const tr = S.traps[e.data.trap], w = e.data.way; tr.flash = 1;
        if (w === 2) { tr.out.kick = 0.6; shock(p, TRAP, 2, 0.45, true); burst(p, TRAP, 16, 5); }
        if (w === 0) spray(p, tr.tp.a.u, FW[0], 14, 5);
        label(p, lab(['express', 'main', 'longway'][w]), w === 1 ? '#e8e4ff' : mixWhite(FW[w], 0.2).getStyle(), w === 1, 0, w !== 1 || every('main', 0.5, e.t));
        break;
      }
      case 'warpOut': {
        const h = S.holes[e.data.hole], x = ['jackpot', 'next', 'lost'].indexOf(e.data.exit), hc = x < 0 ? h.c : RW[x], b = x === 0 ? h.rl.exits[0].b : h.w.b;
        h.live = Math.max(0, h.live - 1);
        label(p, lab(x === 0 ? 'jackpot' : 'out'), mixWhite(hc).getStyle()); shock(b.p, hc, x === 0 ? 2.6 : 1.8, 0.45, true); spray(p, b.u, hc, x === 0 ? 30 : 18, 6); burst(p, c, 10, 3);
        if (x === 0) burst(p, '#ffd27a', 24, 5);
        break;
      }
      case 'rideIn': { const rg = S.rings[e.data.ring]; rg.live++; rg.kick = 0.45; label(p, lab('carousel'), '#ffd27a'); burst(p, '#ffb547', 10, 3); break; }
      case 'rideOut': { const rg = S.rings[e.data.ring]; rg.live = Math.max(0, rg.live - 1); label(p, lab('out'), '#fff3c4'); burst(p, '#ffd27a', 16, 4); break; }
      case 'basinIn': { // dropping into a bowl: a splash; the label at most every 0.4 s (a crowd pours in together)
        S.basins[e.data.basin].live++;
        if (e.data.again) break;
        spray(p, [0, 1, 0], '#bff3ff', 10, 4);
        label(p, lab(e.data.whirl ? 'whirl' : 'bowl'), '#7fe3ff', false, 0, every('basin', 0.4, e.t));
        break;
      }
      case 'letGo': // a whirlpool's current lets go: a splash off it
        spray(p, [0, 1, 0], '#e6fbff', 8, 3.5);
        label(p, lab('letgo'), '#bff3ff', true, 0, every('let', 0.35, e.t));
        break;
      case 'basinOut': { // down the drain: a ripple round the hole
        const b = S.basins[e.data.basin]; b.live = Math.max(0, b.live - 1);
        if (e.data.drain) shock([b.bw.c[0], b.bw.c[1] + 0.05, b.bw.c[2]], '#7fe3ff', b.bw.rh * 2.2, 0.45, true);
        break;
      }
      case 'mudIn': // a splash; the label at most every 0.4 s (a pack ploughing through would fill the screen)
        burst(p, '#c8925a', 8, 2); shock([p[0], p[1] - MR + 0.05, p[2]], '#c8925a', 1.3, 0.45, true); // and a ripple across the mud
        label(p, lab('mud'), '#e0b07a', true, 0, every('mud', 0.4, e.t));
        break;
      case 'mistIn': label(p, lab('hidden'), '#cfe8ff'); break;
      case 'tubeIn': // into a narrow helix's middle tube; the label at most every 0.4 s (a queue goes in)
        label(p, lab('shortcut'), '#7cf0c5', false, 0, every('tube', 0.4, e.t));
        break;
      case 'coilIn': // the air takes it into a coil: a puff off the mouth; the label at most every 0.4 s (a crowd pours in)
        spray(p, [0, 0.6, 0], mixWhite(coilC(S.def.coils[e.data.coil].side), 0.5).getStyle(), 8, 3);
        label(p, lab('spiral'), coilC(S.def.coils[e.data.coil].side), false, 0, every('coil', 0.4, e.t));
        break;
      case 'coilOut': burst(p, mixWhite(coilC(S.def.coils[e.data.coil].side), 0.5).getStyle(), 8, 2.5); break; // out of a coil's mouth into the chamber
      case 'mistOut': e.data.gust >= 0 ? label(p, lab('tailwind'), '#9ff7ff') : label(p, lab('headwind'), '#b8c4ff'); break; // which gust it met in there
      case 'rescue': if (e.data.kind === 'nudge') label(p, lab('nudge'), mixWhite(c).getStyle()); break;
      case 'out': label(p, lab('out'), mixWhite(c).getStyle()); break;
      case 'finish': {
        const k = e.data.place, cup = S.rack.cups[k];
        S.hops.push({ i: e.i, k, t: 0, a: new THREE.Vector3(...p), b: cup.p.clone() });
        break;
      }
    }
    hooks.onEvent?.(e);
  }
  function landHop(h) {
    const cup = S.rack.cups[h.k], big = hooks.isBig?.(h.k), color = S.players[h.i].color;
    S.cupOf[h.i] = h.k; cup.slam = 1; cup.flash = 1; cup.color = col(color);
    shock([cup.p.x, cup.p.y - 0.3, cup.p.z], color, big ? 2.6 : 1.7, 0.6, true);
    pillar(cup.p, color, big ? 9 : 5.5);
    burst([cup.p.x, cup.p.y, cup.p.z], color, big ? 60 : 30, big ? 7 : 4.5);
    if (big) confetti(S.rack.center);
    if (big && !reduce.matches) S.shake = 0.25;
    hooks.onLand?.(h.i, h.k);
  }

  // ---------- camera director ----------
  // outward from the tower at point p: the camera sits on that side, so the course is never in the way
  function outward(p, out) {
    const st = S.def.stadium, zMid = (st.zFront + st.zBack) / 2;
    if (p.z < st.zBack - S.def.W) return out.set(0, 0, 1); // start fan, board and run-out: watch from the front
    for (const bm of S.def.boomerangs) { // in a boomerang's trough: from the front, through its glass side wall (outward is behind the wall)
      const dx = p.x - bm.E[0], dz = p.z - bm.E[2], u = dx * bm.f[0] + dz * bm.f[1], v = dx * bm.inw[0] + dz * bm.inw[1];
      if (u > -bm.rn - 1 && u < bm.flat + (bm.vEnd + bm.hw) * bm.ts + bm.rq + 1 && v > -bm.hw - 1 && v < bm.vEnd + 1 && Math.abs(p.y - bm.y0) < bm.top) return out.set(0, 0, 1);
    }
    const cx = Math.max(-st.half, Math.min(st.half, p.x));
    out.set(p.x - cx, 0, p.z - zMid);
    if (out.lengthSq() < 1e-4) out.set(0, 0, 1);
    return out.normalize();
  }
  // the last moments' side of the course: the inside of the final bend. Its outer wall is the tall one, and on the side
  // the camera used to take whatever the course's hand, it hid the run-in on half the courses
  const lastSide = () => tmpV2.set(-S.rack.t.z, 0, S.rack.t.x).multiplyScalar(-S.def.h);
  const fitDist = r => { const vf = camera.fov * Math.PI / 360, hf = Math.atan(Math.tan(vf) * camera.aspect); return r / Math.sin(Math.min(vf, hf)); };
  // in the race, a target that leaps (a warp, a far cut, the finish shot) is a cut: no swoop across the stadium
  const jumped = look => (S.mode === 'race' || S.mode === 'done') && look.distanceToSquared(cam.look) > SNAP * SNAP;
  function director(dt) {
    const sim = S.sim, def = S.def;
    if (!def) return;
    const want = cam.wantPos, look = cam.wantLook;
    let cutR = S.mode === 'race' || S.mode === 'peek' ? 2.6 : 0;
    if (S.mode === 'peek' && S.peek) {
      // flyover: along the centre line from the start fan to the rack, offset up and outward so the track reads; its
      // timetable (peek()) crawls over each showcase mod, and the camera closes in on it like the race camera does
      const P = S.peek, tau = Math.min((P.t += dt) * P.k, P.ts.at(-1));
      while (P.i < P.ts.length - 2 && P.ts[P.i + 1] < tau) P.i++;
      const s = P.ss[P.i] + (P.ss[P.i + 1] - P.ss[P.i]) * Math.min(1, (tau - P.ts[P.i]) / (P.ts[P.i + 1] - P.ts[P.i]));
      sim0.pointAt(Math.min(def.finish.s, s), pt);
      if (reduce.matches) { overview(want, look); } else {
        const tan = tmpV2.set(pt[3], 0, pt[5]).normalize();
        sim0.pointAt(Math.min(def.finish.s, s + 6), pt);
        look.set(pt[0], pt[1], pt[2]);
        zoomAt(s + 6, dt);
        look.lerp(zoom.c, 0.7 * zoom.k);
        rig(look, tan, 15 + (Math.min(zoom.r, ZOOM_MAX) + 2 - 15) * zoom.k, dt, want, zoom.up * zoom.k);
      }
      // each mod's neon sign: the timetable holds on it (peek()); it pops (sparks, a flare) and the camera dollies in
      // gently from where it is, a little above, until the board sits well in view, then drifts back onto the flyover
      const f = S.signs.find(x => Math.abs(x.s - s) < 1);
      if (f && f !== S.feat) { // and a chime, a step higher for each sign along the course (game.js)
        const q = f.sign.position.toArray();
        f.kick = 1; burst(q, f.hex, 18, 3); burst(q, '#fff3c4', 10, 2);
        hooks.onEvent?.({ type: 'sign', pos: q, data: { k: S.featN++ } });
      }
      S.feat = f;
      const g = S.signs.reduce((a, x) => x.k > (a?.k ?? 0.02) ? x : a, null); // the most featured: the one easing out too
      if (g && !reduce.matches) {
        // the board, grown, at ~60% of the narrower side; eased in and out (S-curve), so the dolly drifts rather than lunges
        const p = g.sign.position, d = Math.max(2, fitDist(g.w * 1.12 * 1.5)), e = smooth(g.k);
        tmpV.subVectors(cam.pos, p).setY(0).normalize();
        want.lerp(tmpS.copy(p).addScaledVector(tmpV, d * 0.97).add(tmpV.set(0, d * 0.26, 0)), e);
        look.lerp(p, e);
      }
    } else if (S.mode === 'ready' || S.mode === 'countdown') {
      // the start fan head-on, all gates across the screen
      const fan = def.fan, half = fan.rBack + 0.8, cy = fan.yS;
      const vf = camera.fov * Math.PI / 360, hf = Math.atan(Math.tan(vf) * camera.aspect);
      let d = Math.max(half / Math.tan(hf) * 1.05, half / Math.tan(vf) * 1.25, 6);
      if (S.mode === 'countdown') d *= 1 - 0.1 * smooth(S.cdT / 3);
      look.set(0, cy - 1.2, 0.6);
      want.set(0, cy + d * 0.72, d * 0.72);
    } else if (S.mode === 'race' || S.mode === 'done') {
      // auto: the 1st marble, one at a time (no cutaways); follow: the tapped one, tighter; the last moments (the leader
      // into the final bend): the line head-on, the front-runners rolling toward it, then the rack
      const order = S.order || [], live = order.filter(i => sim.state[i] !== DONE);
      if (!live.includes(S.focus) || sim.prog[live[0]] - sim.prog[S.focus] > LEAD_GAP) S.focus = live[0] ?? -1;
      const focus = S.follow >= 0 && sim.state[S.follow] !== DONE ? S.follow : S.focus;
      const finishing = sim.finished > 0 || (live.length && sim.prog[live[0]] > S.lastS);
      if (finishing && !sim.finished && live.length) {
        cutR = 1.2; // the line head-on, low: a wide window would carve a hole in the run-out floor in front of it
        // the last moments: the front-runners fighting it out, watched from in front of the line as they come at it,
        // the frame leaning toward the line and widening to keep it in as they near it
        let n = 0;
        look.set(0, 0, 0);
        for (const i of live) {
          if (n === LAST_N || sim.prog[live[0]] - sim.prog[i] > LAST_PACK) break;
          look.x += marblePos[i * 3]; look.y += marblePos[i * 3 + 1]; look.z += marblePos[i * 3 + 2]; n++;
        }
        look.divideScalar(n);
        const toLine = tmpV.subVectors(S.arch.p, look), rad = Math.min(ZOOM_MAX, Math.max(LAST_R, toLine.length() * 0.4 + 1.5));
        look.addScaledVector(toLine, LAST_LEAN);
        look.y += 0.6; // over the floor: a target down on it had the see-through window's tapered end clip a ring out of it
        rig(look, tmpV.set(0, 0, 0), rad, dt, want, LAST_UP, S.rack.t); // no chase blend: from the front on any screen
      } else if (finishing || focus < 0) { // the first one home: the rack fills up
        const a = S.arch, r = S.rack, mid = tmpV.copy(a.p).lerp(r.center, 0.55);
        look.copy(mid).add(tmpS.set(0, 1, 0));
        want.copy(mid).addScaledVector(lastSide(), 15).addScaledVector(r.t, 9).add(tmpS.set(0, 8, 0));
      } else {
        const p = tmpV.set(marblePos[focus * 3], marblePos[focus * 3 + 1], marblePos[focus * 3 + 2]);
        sim.pointAt(sim.prog[focus] + 3 * R + 1, pt);
        const rad = S.follow >= 0 ? 3.2 : 4;
        look.set(p.x * 0.7 + pt[0] * 0.3, p.y * 0.7 + pt[1] * 0.3 + 0.3, p.z * 0.7 + pt[2] * 0.3);
        // rolling up to or through a showcase mod: ease out (and up, over a round one) until all of it is in view. The
        // frame itself glides from one mod to the next, so nothing here jumps
        zoomAt(sim.prog[focus], dt);
        look.lerp(zoom.c, 0.7 * zoom.k);
        const tan = tmpV2.set(pt[3], 0, pt[5]).normalize();
        rig(look, tan, rad + Math.max(0, Math.min(zoom.r, ZOOM_MAX) - rad) * zoom.k, dt, want, zoom.up * zoom.k);
      }
    } else { overview(want, look); }
    if (S.photo > 0 && !reduce.matches) { const a = S.arch; want.copy(a.p).addScaledVector(lastSide(), 7).add(tmpS.set(0, 2.2, 0)); look.copy(a.p).add(tmpS.set(0, 0.6, 0)); }
    const slow = reduce.matches ? 0.5 : 1;
    if (jumped(look)) { cam.pos.copy(want); cam.look.copy(look); }
    cam.pos.lerp(want, damp(HALF_POS / slow * (S.mode === 'peek' ? 0.4 : 1), dt));
    cam.look.lerp(look, damp(HALF_LOOK / slow * (S.mode === 'peek' ? 0.4 : 1), dt));
    camera.position.copy(cam.pos);
    if (S.shake > 0) { S.shake -= dt; camera.position.x += rnd() * 0.1; camera.position.y += rnd() * 0.1; }
    camera.lookAt(cam.look);
    // cut a window through whatever stands between the camera and the action (the run above in the spiral, the tower,
    // posts); off for the start ring and the overview, where nothing is in the way
    cut.cam.value.copy(camera.position); cut.tgt.value.copy(cam.look);
    cut.r.value += (cutR - cut.r.value) * damp(0.25, dt);
    // the shadow camera follows the action, snapped to texels so it doesn't shimmer
    if (tier === 'high') {
      const step = 30 / 1024;
      key.target.position.set(Math.round(cam.look.x / step) * step, Math.round(cam.look.y / step) * step, Math.round(cam.look.z / step) * step);
      key.position.copy(key.target.position).add(tmpV.set(-30, 50, 40));
    }
  }
  // the race rig: from the side (outward from the tower) on a wide screen, swinging toward a chase view from behind
  // on a narrow one, where a run across the screen would need the camera far away. The direction is smoothed on its
  // own, slower spring, so a 180° turn swings the camera round rather than flipping it
  const rigDir = new THREE.Vector3(0, 0, 1), rigTmp = new THREE.Vector3();
  // eases the zoom toward the showcase mod at progress s (none: back out)
  function zoomAt(s, dt) {
    const zn = zoom.zones.find(z => s > z.s0 && s < z.s1), f = damp(ZOOM_HALF, dt);
    if (zn && zoom.k < 0.02) { zoom.c.copy(zn.c); zoom.r = zn.r; zoom.up = zn.up; }
    else if (zn) { zoom.c.lerp(zn.c, f); zoom.r += (zn.r - zoom.r) * f; zoom.up += (zn.up - zoom.up) * f; }
    zoom.k += ((zn ? 1 : 0) - zoom.k) * f;
  }
  // side: the side to watch from (default: outward from the tower)
  function rig(look, tan, rad, dt, want, up = 0, side = null) {
    const w = Math.min(1, Math.max(0, (1.3 - camera.aspect) / 0.75)); // 0 landscape .. 1 portrait
    (side ? rigTmp.copy(side) : outward(look, rigTmp)).multiplyScalar(1 - 0.7 * w).addScaledVector(tan, -(0.3 + 0.9 * w)).normalize();
    jumped(look) ? rigDir.copy(rigTmp) : rigDir.lerp(rigTmp, damp(0.5, dt)).normalize();
    const vf = camera.fov * Math.PI / 360, hf = Math.atan(Math.tan(vf) * camera.aspect);
    const d = Math.max(rad / Math.sin(w > 0.5 ? vf * 0.9 : Math.min(vf, hf)), 6.5);
    const e = Math.atan2(0.55 + 0.15 * w + 0.6 * up, 0.8); // up 1: ~55° down into a bowl
    want.copy(look).addScaledVector(rigDir, d * Math.cos(e)).add(tmpS.set(0, d * Math.sin(e), 0));
  }
  // the showcase mods' frames, along the course's progress: a round one (ring, bowl) by its own centre and radius, seen
  // from higher; the rest by their bounds; a roulette's funnel and wheel; a fork's signal and both ends of the turn
  function zonesOf(d) {
    const z = [], v = p => new THREE.Vector3(...p);
    for (const m of d.mods) {
      if (!SHOW.has(m.type) || !isFinite(m.aabb?.[0])) continue;
      const b = m.aabb, round = d.rings.find(x => x.mod === m.index) || d.basins.find(x => x.mod === m.index);
      z.push(round ? { s0: m.s0 - 2, s1: m.s1, c: v(round.c), r: (round.rWall ?? round.rB) + 1.5, up: 1 }
        : { s0: m.s0 - 2, s1: m.s1, c: v([(b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2]), r: Math.hypot(b[3] - b[0], b[4] - b[1], b[5] - b[2]) * 0.38, up: 0 });
    }
    for (const w of d.wormholes) if (w.roulette) z.push({ s0: w.a.s - 6, s1: w.a.s + 0.5, c: v(w.a.p), r: w.a.r + 3, up: 1 });
    for (const tp of d.traps) if (tp.fork) z.push({ s0: tp.a.s - 6, s1: tp.a.s + 1, c: v(tp.a.p).lerp(v(tp.b.p), 0.5), r: v(tp.a.p).distanceTo(v(tp.b.p)) / 2 + 2, up: 0 });
    return z;
  }
  function overview(want, look) {
    const b = S.def.bounds, c = tmpV.set((b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2);
    const r = Math.max(b[3] - b[0], b[4] - b[1], b[5] - b[2]) * 0.55;
    look.copy(c); want.copy(c).add(tmpV2.set(r * 0.3, r * 0.5, fitDist(r) * 1.05));
  }
  let sim0 = null; // the current track's centre line, for the flyover (no physics world: building one cost ~0.5 s on a phone)

  // ---------- minimap: the course as one line, start to finish, its mods in their sign colours with their glyphs, side
  // lanes branching off it (a trap's, a fork's long way under, its express arcing over, a trapdoor's, a helix's coils, a
  // wormhole's jump arcing over: a roulette's to each of its exits), a dot per marble at its progress, on the lane it's on ----------
  const MINI_D = 9, MINI_G = 14; // a lane's offset from the line; a glyph's size (CSS px)
  // y of a lane (dy off the line y0, x from xa to xb) at x: ramps off the line and back over r at each end
  // (an express or a wormhole arcs over instead: the quadratic's height at x; its arc is the dash pattern)
  const laneY = (ln, x, y0) => { const u = (x - ln.xa) / (ln.xb - ln.xa); return ln.arc ? y0 - 4 * MINI_D * u * (1 - u) : y0 + ln.dy * Math.min(1, Math.max(0, Math.min(x - ln.xa, ln.xb - x) / ln.r)); };
  function drawMini() {
    const cv = hooks.mini, [cw, ch] = S.miniCss || [0, 0]; // its CSS size, from the ResizeObserver below
    if (!cw || !S.def) return;
    const dpr = Math.min(2, devicePixelRatio || 1), w = Math.round(cw * dpr), h = Math.round(ch * dpr), g = cv.getContext('2d');
    let m = S.mini;
    if (!m || m.w !== w || m.h !== h) { // the line: once per track and size
      cv.width = w; cv.height = h;
      const def = S.def, s0 = def.line[3], s1 = def.finish.s, y0 = ch / 2, x0 = ch / 2, x1 = cw - ch / 2, X = s => x0 + (Math.min(s1, Math.max(s0, s)) - s0) * (x1 - x0) / (s1 - s0);
      const lane = (a, b, dy, c, arc) => { const xa = X(a), xb = X(b); return { xa, xb, dy, c, arc, r: Math.min(4, (xb - xa) / 4) || 1 }; };
      const traps = def.traps.map(tp => [lane(tp.a.s, tp.b.s, MINI_D, tp.door ? NAMEC.trapdoor : TRAP), tp.fork && lane(tp.a.s, tp.b.s, -MINI_D, FW[0], '3 3')]);
      const coils = def.coils.map(c => lane(c.in.s, c.out.s, c.side * MINI_D, coilC(c.side)));
      const holes = def.wormholes.map(w => (w.roulette ? w.roulette.exits : [w]).map(e => lane(w.a.s, e.b.s, -MINI_D, e.kind === 'jackpot' ? GOLD : '#c86bff', '.1 4'))); // dotted: the wormhole's violet, JACKPOT's gold
      const segs = [...def.mods.filter(md => NAMEC[md.type]).map(md => [md.s0, md.s1, NAMEC[md.type]]), ...def.muds.map(md => [md.s0, md.s1, NAMEC.mud])].filter(([a, b]) => b > s0 && a < s1);
      const marks = [...def.mods.filter(md => md.s0 < s1).map(md => [md.type, (md.s0 + md.s1) / 2]), ...def.wormholes.map(w => [w.roulette ? 'roulette' : 'wormhole', w.a.s]),
        ...def.traps.filter(tp => !tp.door).map(tp => [tp.fork ? 'fork' : 'trap', tp.a.s]), ...def.muds.map(md => ['mud', (md.s0 + md.s1) / 2])]; // a trapdoor is a mod on the course too
      // the static layer is an SVG made the canvas's CSS background, so a frame only draws the dots (a stroked map every
      // frame cost 6-50 ms on a phone). The glyphs are index.html's mod symbols (#m-*), copied in with the gradients they use
      const f = n => n.toFixed(1), put = ln => `<path d="${ln.arc ? `M${f(ln.xa)} ${y0}Q${f((ln.xa + ln.xb) / 2)} ${y0 - 2 * MINI_D} ${f(ln.xb)} ${y0}`
        : `M${f(ln.xa)} ${y0}L${f(ln.xa + ln.r)} ${y0 + ln.dy}L${f(ln.xb - ln.r)} ${y0 + ln.dy}L${f(ln.xb)} ${y0}`}" stroke="${ln.c}" stroke-width="2.5"${ln.arc ? ` stroke-dasharray="${ln.arc}"` : ''}/>`;
      const sym = new Map(marks.map(([t]) => [t, document.getElementById('m-' + t)]).filter(([, el]) => el));
      const grads = new Set([...sym.values()].flatMap(el => [...el.innerHTML.matchAll(/url\(#([\w-]+)\)/g)].map(r => r[1])));
      let px = -Infinity; // glyphs left to right, one nudged along off the one before it rather than over it (close mods on a phone)
      const spots = marks.filter(([t]) => sym.has(t)).map(([t, s]) => [t, X(s)]).sort((a, b) => a[1] - b[1]).map(([t, x]) => [t, px = Math.max(x, px + MINI_G - 1)]);
      const q = 3, rows = Math.floor((ch - 4) / q);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="${ch}" viewBox="0 0 ${cw} ${ch}">`
        + `<defs>${[...grads].map(id => document.getElementById(id)?.outerHTML || '').join('')}</defs>`
        + `<g fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".9">${[...traps.flat().filter(Boolean), ...coils, ...holes.flat()].map(put).join('')}</g>`
        + `<g fill="none" stroke-linecap="round"><path d="M${x0} ${y0}H${f(x1)}" stroke="rgba(207, 198, 255, .3)" stroke-width="3"/>`
        + segs.map(([a, b, c]) => `<path d="M${f(X(a))} ${y0}H${f(X(b))}" stroke="${c}" stroke-width="5"/>`).join('') + '</g>'
        + Array.from({ length: rows * 2 }, (_, k) => `<rect x="${f(x1 - q + (k & 1) * q)}" y="${2 + (k >> 1) * q}" width="${q}" height="${q}" fill="${((k >> 1) + k) % 2 ? '#1a1440' : '#fff'}"/>`).join('') // the finish: a chequered line
        + `<rect x="${x0 - 1}" y="${y0 - 5}" width="2" height="10" fill="rgba(255, 255, 255, .7)"/>` // the start: a tick
        + spots.map(([t, x]) => `<circle cx="${f(x)}" cy="${y0}" r="${MINI_G / 2 + 1.5}" fill="rgba(18, 13, 51, .9)"/>`
          + `<svg x="${f(x - MINI_G / 2)}" y="${y0 - MINI_G / 2}" width="${MINI_G}" height="${MINI_G}" viewBox="0 0 24 24">${sym.get(t).innerHTML}</svg>`).join('')
        + '</svg>';
      Object.assign(cv.style, { backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, backgroundSize: '100% 100%' });
      m = S.mini = { w, h, y0, x0, x1, s0, s1, traps, coils, holes };
    }
    // the dots: the followed marble a size up with a white rim. A marble on a trap route, a fork's express or a helix's
    // coil rides that lane, a warping one its wormhole's arc. Bunched ones on the same lane step up or down off it, so one doesn't hide another: lanes go
    // to the followed marble first, then from the leader down; drawn last place first, so the leader and then the
    // followed marble sit on top. Before the start, all at the start. Redrawn only once one has moved a whole pixel or
    // changed lane, or the followed one changed
    const sim = S.sim, n = S.players.length, ids = [...(S.order || Array(n).keys())], dots = [];
    const fi = ids.indexOf(S.follow);
    if (fi >= 0) ids.unshift(ids.splice(fi, 1)[0]);
    let key = String(S.follow);
    for (const i of ids) {
      if (marblePos[i * 3 + 1] < -900) continue; // not in a stall yet
      const t = !sim ? 0 : sim.place[i] >= 0 ? 1 : Math.min(1, Math.max(0, (sim.prog[i] - m.s0) / (m.s1 - m.s0)));
      const st = sim?.state[i], ln = st === TRAPPED ? m.traps[sim.trap[i]][sim.trapPh[i] === 3 ? 1 : 0] : st === COIL ? m.coils[sim.coil[i]] : st === WARP ? m.holes[sim.warp[i]][Math.max(0, sim.warpE[i])] : null;
      const x = st === WARP ? ln.xa + (ln.xb - ln.xa) * Math.min(1, Math.max(0, sim.warpU(i))) : m.x0 + t * (m.x1 - m.x0); // a warp's progress stays at A till it's out
      const yb = Math.round(ln ? laneY(ln, x, m.y0) : m.y0), l = [0, -1, 1].find(y => !dots.some(d => d.yb === yb && d.l === y && Math.abs(d.x - x) < 8)) ?? 0;
      dots.push({ i, x, yb, l });
      key += `,${i}:${Math.round(x)}:${yb + l}`;
    }
    if (key === m.key) return;
    m.key = key;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, cw, ch);
    for (const { i, x, yb, l } of dots.reverse()) {
      const me = i === S.follow;
      g.beginPath();
      g.arc(x, yb + l * 4.5, me ? 6 : 4.5, 0, 2 * Math.PI);
      g.fillStyle = S.players[i].color; g.fill();
      g.lineWidth = me ? 2 : 1; g.strokeStyle = me ? '#fff' : 'rgba(8, 7, 32, .85)'; g.stroke();
    }
  }

  // a live marble no more than d short of course position s (and not past it): sounds for a mod nobody is near stay quiet
  const near = (s, d) => { const sim = S.sim; if (!sim) return false; for (let i = 0; i < sim.n; i++) if (sim.state[i] !== DONE && sim.prog[i] > s - d && sim.prog[i] < s + 1) return true; return false; };
  // a fork's gantry: the signal's lamp lit (a flash as it changes or a marble goes through), the arrow swinging to its way
  function forkStep(tr, tt, now, dt, racing) {
    const w = forkWay(tr.tp.fork, tt);
    if (w !== tr.way) { tr.way = w; tr.flash = Math.max(tr.flash, 0.5); if (racing && near(tr.tp.a.s, 20)) hooks.onEvent?.({ type: 'signal', pos: tr.tp.a.p, data: { way: w } }); }
    tr.flash = Math.max(0, tr.flash - dt * 3);
    tr.lamps.forEach((m, k) => m.material.color.copy(FW_C[k]).multiplyScalar(k === w ? 1.6 + 2 * tr.flash : 0.18));
    const want = w === 1 ? 0 : (w === 0 ? -1 : 1) * tr.inSide * Math.PI / 2; // the arrow: up (straight on), or toward its side
    tr.ang += (want - tr.ang) * damp(0.06, dt);
    tr.arrow.rotation.z = tr.ang;
  }
  // a trapdoor's lids: lifted by doorAngle (sim time), the cave showing under them, red blinks in the warning; a clack as
  // one starts to lift near the camera's target
  function doorStep(tr, tt, now, racing) {
    const dr = tr.tp.door;
    for (const ld of tr.lids) {
      const c = doorClock(dr, ld.lid, tt), a = doorAngle(dr, ld.lid, tt);
      ld.hinge.rotation.x = -a;
      ld.hole.material.opacity = a / DOOR_A;
      const red = c > dr.period - dr.warn && Math.floor(now / 70) % 2 ? 1 : 0;
      ld.mat.color.setRGB(red ? 1 : 0.19, red ? 0.16 : 0.39, red ? 0.2 : 1); ld.mat.emissive.setRGB(red * 0.9, 0, red * 0.05); // #7aa7ff, or red
      if (c < ld.c && racing && now - S.lidAt > 120 && cam.look.distanceToSquared(tmpV.fromArray(ld.p)) < 400) { S.lidAt = now; hooks.onEvent?.({ type: 'lid', pos: ld.p }); }
      ld.c = c;
    }
  }

  // ---------- the loop: renders only while something moves ----------
  // S.shown: the canvas is on screen (the ResizeObserver below). Hidden behind the setup screen, the carousels and bowls
  // kept it drawing at full rate forever
  // need(): something changed from outside (a new phase, a tap), so the next frame is drawn at full rate
  function need() { S.calm = false; if (!S.raf && S.shown && !document.hidden && !S.paused) { S.last = performance.now(); S.raf = requestAnimationFrame(loop); } }
  function loop(now) {
    // pacing: phones and tablets draw at most 60 fps (a 90 or 120 Hz screen every other refresh: a 60 Hz one's heat and
    // battery), other screens every other refresh over 100 Hz (a 144 Hz monitor: 72 fps); a still view with only ambient
    // motion left (waiting for Race!, the finished race: S.calm) at most 30. 2 ms under the step: rAF times jitter
    if (now - S.last < (S.calm ? 1000 / 30 - 2 : touch ? 1000 / 60 - 2 : 10)) { S.raf = requestAnimationFrame(loop); return; }
    S.raf = 0;
    const dt = Math.min(0.1, (now - S.last) / 1000); S.last = now;
    S.frameN = (S.frameN || 0) + 1;
    // adaptive quality: a smoothed frame time held above 1/26 s steps down (one way, remembered per device). Not over
    // the throttled frames: those are slow on purpose
    if (!S.calm) {
      S.ft += (dt - S.ft) * FT_SMOOTH;
      if ((S.ftWait += dt) > 2 && S.ft > FT_SLOW && S.mode !== 'idle') stepDown();
    }
    const sim = S.sim;
    let moving = S.mode === 'peek' || S.mode === 'countdown' || S.mode === 'ready';
    if (sim && S.mode === 'race') {
      // fixed steps, at most 4 a frame (12 at x3); photo finish slows the clock
      const speed = (S.ff ? 3 : 1) * (S.photo > 0 ? 0.3 : 1);
      S.acc += dt * speed;
      let steps = 0;
      const cap = S.ff ? 12 : 4;
      while (S.acc >= DT && steps < cap && !sim.done) {
        S.acc -= DT; steps++;
        for (const e of sim.step()) onSimEvent(e);
      }
      if (steps === cap) S.acc = 0;
      if (S.photo > 0) S.photo -= dt;
      S.order = [...Array(S.players.length).keys()].sort((a, b) => { // standings: finished by place, then by progress
        const pa = sim.place[a], pb = sim.place[b];
        if (pa >= 0 || pb >= 0) return (pa < 0 ? 1e9 : pa) - (pb < 0 ? 1e9 : pb);
        return sim.prog[b] - sim.prog[a] || S.gateOf[a] - S.gateOf[b]; // level at GO: by (shuffled) gate, not player 1 first
      });
      hooks.onTick?.(S.order, sim);
      moving = true;
      if (sim.done && !S.hops.length && !S.ended) { S.ended = true; hooks.onDone?.(); }
    }
    marbleTransforms(sim && S.mode === 'race' ? S.acc / DT : 1);
    for (const h of S.hops) { h.t += dt; if (h.t >= (h.dur || HOP) && !h.landed) { h.landed = true; h.swap ? (S.cupOf[h.i] = h.k) : landHop(h); } }
    S.hops = S.hops.filter(h => !h.landed);
    // kinematic visuals from sim time
    const tSim = sim && S.mode === 'race' ? sim.t + S.acc : 0;
    if (S.flaps) for (const m of S.flaps) { const fl = m.userData, a = flapAngle(tSim); m.position.set(...fl.hinge); m.quaternion.setFromEuler(flapE.set(0, fl.yaw, 0)); m.quaternion.multiply(tmpQ.setFromAxisAngle(tmpV.set(1, 0, 0), -a)); m.translateY(fl.h / 2); m.translateZ(0.04); }
    // the stall wheel: still while picking, spins up and settles on the seeded angle over the countdown
    if (S.wheel) {
      if (S.mode === 'countdown') { const f = Math.min(1, S.cdT / SPIN_T), e = 1 - Math.pow(1 - f, 3); S.spinNow = reduce.matches ? (f > 0.95 ? S.def.fan.spin : 0) : (S.def.fan.spin + SPIN_TURNS * 2 * Math.PI) * e; moving = true; }
      else if (S.mode === 'race' || S.mode === 'done') S.spinNow = S.def.fan.spin;
      else S.spinNow = 0;
      S.wheel.rotation.y = -S.spinNow;
    }
    for (const ring of S.rings) {
      const t = S.mode === 'race' ? tSim : now / 1000;
      ring.grp.rotation.y = -ringAngle(ring.rg, t);
      ring.kick = Math.max(0, ring.kick - dt);
      const glow = 0.15 + (ring.live ? 0.3 + 0.15 * Math.sin(now / 50) : 0) + ring.kick;
      ring.seatMat.emissiveIntensity = glow;
      ring.ruby.emissiveIntensity = 0.35 + glow * 1.6;
      moving = true;
    }
    const tk = S.mode === 'race' ? tSim : now / 1000, racing = S.mode === 'race';
    for (const tr of S.traps) { // the pad's ring pulses outward; it flares when it catches a marble
      if (tr.kind === 'fork') forkStep(tr, tk, now, dt, racing);
      else if (tr.kind === 'door') doorStep(tr, tk, now, racing);
      else {
        const f = (now / 1100) % 1;
        tr.kick = Math.max(0, tr.kick - dt * 2.5);
        tr.ring.scale.setScalar(tr.tp.a.r * (1 + 0.7 * f + tr.kick * 0.8));
        tr.ring.material.opacity = (1 - f) * 0.7 + tr.kick;
      }
      // the signs bob and turn about their arrows to face the camera; the chevrons chase, the frame flickers now and
      // then like a tired neon tube, and a sign flares when a marble goes its way (in at the pad, out at the lane's end)
      for (const sn of tr.signs) {
        const sg = sn.sign;
        sn.kick = Math.max(0, sn.kick - dt * 2.5);
        sg.position.copy(sn.at).addScaledVector(sn.up, reduce.matches ? 0 : Math.sin(now / 450) * 0.08);
        tmpV.subVectors(camera.position, sg.position).addScaledVector(sn.x, -tmpV.dot(sn.x));
        if (tmpV.lengthSq() > 1e-6) sg.quaternion.setFromRotationMatrix(tmpM.makeBasis(sn.x, tmpV2.crossVectors(tmpV.normalize(), sn.x), tmpV));
        const ph = Math.floor(now / 160) % 4;
        sn.chev.forEach((m, j) => m.material.color.copy(sn.chevC).multiplyScalar(sn.kick > 0 ? 1.4 + 2 * sn.kick : reduce.matches ? 1.6 : j === ph ? 2.4 : j === ph - 1 ? 1.1 : 0.35));
        if (sn.flick > 0) sn.flick -= dt; else if (!reduce.matches && Math.random() < dt * 0.2) sn.flick = 0.18;
        sn.frame.color.copy(sn.frameC).multiplyScalar(sn.flick > 0 && Math.floor(now / 40) % 2 ? 0.25 : 1.6 + 2 * sn.kick);
      }
      moving = true;
    }
    for (const b of S.basins) { b.t += dt * (b.live > 0 ? 1.8 : 1) * (b.bw.whirl ? 2.6 : 1); b.mat.uniforms.time.value = b.t; moving = true; } // bowl water swirls (a whirlpool's fast)
    for (const h of S.holes) {
      h.t += dt * (h.live > 0 ? 2.5 : 1); // both mouths stir while a marble is between them
      for (const m of h.mouths) {
        m.rings.forEach(r => { const f = (h.t / 1.8 + r.userData.ph) % 1, g = m.drink ? 1 - f : f; r.scale.setScalar(m.r * (m.drink ? 1.05 + m.spread * g : 0.25 + 1.25 * g)); r.material.opacity = Math.min(1, f * 3) * (1 - f) * 0.8; });
        if (m.swirl) m.swirl.rotation.y = 4.5 * h.t;
        if (m.vortex) m.vortex.uniforms.time.value = h.t;
      }
      if (h.wheel) { // a roulette's wheel turns with sim time; a soft tick each time a sector boundary passes the pointer
        h.wheel.rotation.y = -h.rl.omega * tk;
        const k = sectorAt(h.rl, Math.PI + h.rl.omega * tk);
        if (k !== h.sector && racing && near(h.w.a.s, 25)) hooks.onEvent?.({ type: 'wheel', pos: h.w.a.p, data: { exit: k } });
        h.sector = k;
      }
      if (!reduce.matches && (h.sparkAt -= dt) < 0) { h.sparkAt = h.live > 0 ? 0.02 : 0.07; suck(h); }
      moving = true;
    }
    // mod signs: bob and face the camera (a vertical sign read edge-on from the showcase's view from above); the marquee
    // chases, the word flickers now and then like a tired neon tube, and flares as marbles go through
    for (const sn of S.signs) {
      const sg = sn.sign, k0 = Math.abs(sn.at.x + sn.at.z); // each its own phase, so they don't bob in step
      sn.kick = Math.max(0, sn.kick - dt * 2.5);
      sn.k += ((S.mode === 'peek' && S.feat === sn ? 1 : 0) - sn.k) * damp(0.35, dt); // featured by the flyover: grows, all lit, glowing
      sg.position.copy(sn.at).addScaledVector(sn.up, reduce.matches ? 0 : Math.sin(now / 520 + k0) * 0.1);
      sg.lookAt(camera.position);
      sg.scale.setScalar(1 + (reduce.matches ? 0 : 0.12 * smooth(sn.k)));
      const ph = Math.floor(now / (sn.k > 0.5 ? 70 : 140) + k0) % 3, fl = Math.max(sn.kick, sn.k * 0.6);
      sn.bulbs.forEach((m, k) => m.color.copy(sn.cols[k]).multiplyScalar(fl > 0 ? 1.6 + 2 * fl + (k === ph ? 1 : 0) * sn.k : reduce.matches || k === ph ? 2.2 : 0.35));
      if (sn.flick > 0) sn.flick -= dt; else if (!reduce.matches && sn.k < 0.1 && Math.random() < dt * 0.15) sn.flick = 0.2;
      sn.word.color.setScalar(sn.flick > 0 && Math.floor(now / 40) % 2 ? 0.3 : 1 + 0.6 * fl);
      sn.glow.opacity = 0.2 + 0.35 * sn.k;
      moving = true;
    }
    // peg flashes fade back to pearl
    if (S.pegs) {
      let dirty = false;
      for (let k = 0; k < S.pegFlash.length; k++) if (S.pegFlash[k] > 0) { S.pegFlash[k] = Math.max(0, S.pegFlash[k] - dt); tmpC.copy(PEARL_C).lerp(S.pegCol[k], S.pegFlash[k] / 0.25); S.pegs.setColorAt(k, tmpC); dirty = true; }
      if (dirty) S.pegs.instanceColor.needsUpdate = true;
    }
    for (const h of S.hoops) if (h.flash > 0) { // a hoop's flash fades back to gold
      h.flash = Math.max(0, h.flash - dt * 2.5);
      h.ring.material.color.copy(h.base).lerp(h.hit, h.flash); h.disc.material.opacity = 0.25 + 0.5 * h.flash; h.o.scale.setScalar(1 + 0.15 * h.flash);
    }
    if (S.rack) for (const c of S.rack.cups) {
      if (c.slam > 0) { c.slam = Math.max(0, c.slam - dt * 2.5); c.g.position.y = c.p.y - MR - 0.02 - Math.sin(c.slam * Math.PI) * 0.15; }
      if (c.flash > 0) { c.flash = Math.max(0, c.flash - dt * 1.5); }
      c.ped.material.emissive.copy(c.color || BLACK).multiplyScalar(c.flash * 0.8 + (c.spot ? 0.6 + 0.4 * Math.sin(now / 90) : 0));
      if (c.joker) { c.joker.rotation.y += dt * 1.2; moving = true; }
    }
    for (const b of blobs) { const k = b.userData.k, t = now / 1000; b.position.set(Math.cos(t / (22 + k * 3) + k * 2) * 90, 40 + Math.sin(t / (25 + k * 2) + k) * 20 - k * 30, -140 + Math.sin(t / 28 + k * 4) * 40); }
    director(dt);
    drawMarbles(now, dt);
    drawMini();
    const alive = fxStep(dt);
    render();
    if (S.old && !S.warm) { disposeTrack(S.old); S.old = null; } // the new course's shaders are in use now
    // the start ring's centre (world origin) on screen, for the Race! button that sits on it
    if (S.mode === 'ready') { tmpV.set(0, 0, 0).project(camera); hooks.onRing?.(tmpV.x, tmpV.y); }
    const busy = S.fxUntil > now || S.hops.length > 0 || labels.some(l => l.visible) || shocks.some(s => s.visible) || pillars.some(s => s.visible) || camMoving() || S.idleUntil > now;
    // only ambient motion left (bowl water, the signs, a carousel) on a still view: throttled to 30 fps
    S.calm = !busy && (S.mode === 'idle' || S.mode === 'ready' || S.mode === 'race' && !!sim?.done);
    if ((moving || busy || alive > 0) && S.shown && !S.paused && !document.hidden) S.raf = requestAnimationFrame(loop);
  }
  const camMoving = () => cam.pos.distanceToSquared(cam.wantPos) > 1e-4 || cam.look.distanceToSquared(cam.wantLook) > 1e-4;
  function render() { if (!S.warm) composer ? composer.render() : renderer.render(scene, camera); }
  // compile the scene's shaders in the background (KHR_parallel_shader_compile) for the target the scene is drawn into
  // (the composer's, or the canvas on Low: tone mapping and colour space pick the variant). Drawing with a shader that
  // isn't compiled yet blocks until it is: the first course's first frame froze the page for ~3.5 s on a PC.
  // Nothing is drawn until it resolves
  function warm() {
    if (!renderer.extensions.has('KHR_parallel_shader_compile')) return Promise.resolve(); // no way to wait without blocking: the first frame compiles, as before
    renderer.setRenderTarget(composer?.readBuffer ?? null);
    const p = S.warm = renderer.compileAsync(scene, camera).catch(() => {}).then(() => { if (S.warm === p) { S.warm = null; need(); } });
    renderer.setRenderTarget(null);
    return p;
  }
  function stepDown() {
    S.ftWait = 0; S.ft = 1 / 60;
    if (tier !== 'low') {
      tier = TIERS[TIERS.indexOf(tier) + 1];
      try { localStorage.setItem(QKEY, tier); } catch { /* private mode */ }
      applyTier();
    } else if (dprCap > 1) { dprCap = Math.max(1, dprCap - 0.5); sizeAll(); }
  }
  // swap the new tier's materials onto the meshes in place (rebuilding the course cost ~1.7 s on a 6x-throttled CPU,
  // right when the device was already struggling) and compile them off the critical path
  function applyTier() {
    const old = new Map(Object.entries(M).map(([k, m]) => [m, k]));
    materials();
    scene.traverse(o => { const k = o.material && old.get(o.material); if (k) o.material = M[k]; });
    renderer.shadowMap.enabled = tier === 'high';
    key.castShadow = tier === 'high';
    shells.castShadow = tier === 'high';
    setupPost();
    warm();
  }

  // ---------- resize / visibility / context loss ----------
  new ResizeObserver(() => { if ((S.shown = cv.clientWidth > 0)) { sizeAll(); render(); } }).observe(cv);
  // the minimap's size, kept as it changes: read every frame (right after the standings' DOM writes) it forced a whole
  // style and layout pass each frame
  if (hooks.mini) new ResizeObserver(([e]) => { S.miniCss = [e.contentRect.width, e.contentRect.height]; }).observe(hooks.mini);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) need(); });
  cv.addEventListener('webglcontextlost', e => { e.preventDefault(); S.paused = true; cancelAnimationFrame(S.raf); S.raf = 0; });
  cv.addEventListener('webglcontextrestored', () => {
    S.paused = false;
    // three re-uploads geometry and textures by itself; only what was rendered on the GPU has to be made again
    envMap();
    sizeAll(); need();
  });

  renderer.shadowMap.enabled = tier === 'high';
  key.castShadow = tier === 'high';
  setupPost();
  sizeAll();

  // ---------- API (game.js) ----------
  return {
    get tier() { return tier; },
    get renderer() { return renderer; },
    // a new track: build it, park everyone off-stage, show the overview
    load(d, players) {
      S.def = d; def = d;
      sim0 = centreLine(d.line);
      S.sim?.dispose(); S.sim = null; S.pre?.sim.dispose(); S.pre = null;
      S.mode = 'idle'; S.ended = false; S.follow = S.focus = -1; S.order = null; S.photo = 0; S.lab = {}; S.lidAt = 0;
      S.gateOf = players.map(() => -1);
      build(d); setMarbles(players); S.mini = null; zoom.zones = zonesOf(d); zoom.k = 0;
      S.lastS = (d.mods.findLast(m => m.type === 'bend')?.s0 ?? d.finish.s * 0.85) - LAST_IN; // the final bend: the run-in's start
      S.frameN = 0; S.floorGap = new Float32Array(players.length);
      overview(cam.wantPos, cam.wantLook); cam.pos.copy(cam.wantPos); cam.look.copy(cam.wantLook);
      need();
      return warm(); // resolves once the course can be drawn without a stall
    },
    // the flyover: its timetable (progress every 0.5, seconds to reach it) cruises, brakes to crawl over each showcase
    // mod and eases in and out at the ends, at a steady accel. Returns its length in whole seconds (3..PEEK_MAX)
    peek() {
      const s0 = S.def.line[3], s1 = S.def.finish.s, slow = [[s0, s0, PEEK_END], [s1, s1, PEEK_END], ...zoom.zones.map(z => [z.s0, z.s1, PEEK_SHOW])];
      const v = s => slow.reduce((m, [a, b, vs]) => Math.min(m, Math.sqrt(vs * vs + 2 * PEEK_A * Math.max(0, a - s, s - b))), PEEK_V);
      const ss = [s0], tr = [0], hc = [0]; // per point: seconds of travel, holds so far
      const holds = S.signs.map(sn => sn.s).filter(s => s > s0 && s < s1).sort((a, b) => a - b);
      for (let s = s0, h = 0; s < s1;) {
        const n = Math.min(s1, s + 0.5, holds[h] ?? Infinity);
        tr.push(tr.at(-1) + (n - s) * 2 / (v(s) + v(n))); hc.push(hc.at(-1)); ss.push(s = n);
        for (; holds[h] === n; h++) { tr.push(tr.at(-1)); hc.push(hc.at(-1) + 1); ss.push(n); } // stands still on a mod's sign
      }
      // over the longest, the travel speeds up and the holds keep their length (only a course packed with signs squeezes those too)
      const H = holds.length * PEEK_HOLD, dur = Math.min(PEEK_MAX, Math.max(3, Math.ceil(tr.at(-1) + H)));
      const a = Math.min(1, Math.max(0.4, (dur - H) / tr.at(-1))), ts = tr.map((x, i) => x * a + hc[i] * PEEK_HOLD), T = ts.at(-1);
      S.mode = 'peek'; S.peek = { t: 0, k: T / dur, ss, ts, i: 0 }; S.feat = null; S.featN = 0; zoom.k = 0; need();
      return dur;
    },
    ready() {
      S.mode = 'ready'; zoom.k = 0; need();
      // the race's physics world (trimesh trees for the whole course) is built while the board waits for Race!: built at
      // GO it froze the drop for ~300 ms on a PC, over a second on a phone
      const d = S.def, gates = [...S.gateOf];
      (window.requestIdleCallback || (f => setTimeout(f, 600)))(() => { // Safari has no idle callback: after the stalls pop
        if (S.def !== d || S.pre || (S.mode !== 'ready' && S.mode !== 'countdown')) return;
        S.pre = { sim: createSim(RAPIER, d, gates), gates: String(gates) };
      }, { timeout: 600 });
    },
    // player i takes gate g: their marble appears in the stall, the stall crouches and springs
    claim(i, g) {
      S.gateOf[i] = g;
      const m = S.caps[g]; m.material.color.set(S.players[i].color); m.material.opacity = 0.12; m.userData.num.visible = false;
      const p = S.def.fan.stalls[g].pos;
      shock([p[0], p[1] - MR + 0.05, p[2]], S.players[i].color, 1.4, 0.45, true);
      spray(p, [0, 1, 0], S.players[i].color, 14, 3);
      S.idleUntil = performance.now() + 900;
      need();
    },
    countdown() { S.mode = 'countdown'; S.cdT = 0; const t0 = performance.now(); const tick = () => { S.cdT = (performance.now() - t0) / 1000; if (S.mode === 'countdown') requestAnimationFrame(tick); }; tick(); need(); },
    // GO: the gate flaps swing down and everyone drops. gates[i] = stall for player i
    go(gates) {
      S.sim?.dispose();
      const pre = S.pre; S.pre = null;
      if (pre && pre.gates !== String(gates)) pre.sim.dispose();
      S.sim = pre?.gates === String(gates) ? pre.sim : createSim(RAPIER, S.def, gates);
      S.gateOf = [...gates];
      S.caps?.forEach(m => { m.visible = false; m.userData.num.visible = false; });
      gates.forEach((g, i) => { const a = stallAt(S.def.fan, g, S.def.fan.spin), p = a.pos; spray(p, [-Math.sin(a.psi) * 0.6, 0.4, Math.cos(a.psi) * 0.6], S.players[i].color, 16, 5); });
      S.mode = 'race'; S.acc = 0;
      need();
    },
    setFollow(i) { S.follow = i; need(); },
    setFF(on) { S.ff = on; need(); },
    photo() { if (!reduce.matches) S.photo = 1.1; },
    get sim() { return S.sim; },
    // rack cups: glyph textures per place (game.js draws them), spotlight / joker / swap for the joker roulette
    setGlyph(k, canvasEl) { const c = S.rack.cups[k]; if (!c) return; c.glyph.material.map?.dispose(); c.glyph.material.map = tex(canvasEl); c.glyph.material.needsUpdate = true; c.glyph.visible = true; need(); },
    setJoker(ks) { // places carrying a joker card
      for (const c of S.rack.cups) if (c.joker) { c.g.remove(c.joker); c.joker = null; }
      for (const k of ks) {
        const c = S.rack.cups[k], card = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.6, 0.03), new THREE.MeshStandardMaterial({ color: '#ffb547', metalness: 0.8, roughness: 0.3, emissive: '#ffb547', emissiveIntensity: 0.35 }));
        card.position.y = 1.15; c.g.add(card); c.joker = card;
      }
      need();
    },
    spot(k, on) { const c = S.rack.cups[k]; if (c) { c.spot = on; c.color = col('#ffb547'); } need(); },
    // the two marbles in cups j and e trade places on arcs (one high, one low)
    swap(j, e, dur) {
      const a = S.cupOf.indexOf(j), b = S.cupOf.indexOf(e);
      for (const [i, from, to, hi] of [[a, j, e, 2.6], [b, e, j, 1.2]]) {
        if (i < 0) continue;
        S.cupOf[i] = -1;
        const h = { i, k: to, t: 0, a: S.rack.cups[from].p.clone(), b: S.rack.cups[to].p.clone(), hi, dur, swap: true };
        S.hops.push(h);
      }
      need();
    },
    cupFlash(k, color) { const c = S.rack.cups[k]; if (!c) return; c.flash = 1; c.color = col(color); shock([c.p.x, c.p.y, c.p.z], '#ffb547', 2.2, 0.6, true); burst([c.p.x, c.p.y, c.p.z], color, 36, 6); burst([c.p.x, c.p.y, c.p.z], '#ffd27a', 24, 5); need(); },
    // stereo pan (-1..1) of a world position, from where it is on screen
    pan(p) { if (!p) return 0; tmpV.set(p[0] ?? p.x, p[1] ?? p.y, p[2] ?? p.z).project(camera); return Math.max(-1, Math.min(1, tmpV.x)) * 0.8; },
    // marble i in normalized device coords [x, y, behind the camera] (edge badges for marbles off screen)
    ndc(i) { tmpV.fromArray(marblePos, i * 3).project(camera); return [tmpV.x, tmpV.y, tmpV.z > 1]; },
    cupPos(k) { return S.rack?.cups[k]?.p; },
    pause(on) { S.paused = on; if (on) { cancelAnimationFrame(S.raf); S.raf = 0; } else need(); },
    stop() { S.sim?.dispose(); S.sim = null; S.pre?.sim.dispose(); S.pre = null; S.mode = 'idle'; },
    dispose() { cancelAnimationFrame(S.raf); disposeTrack(S.track); disposeTrack(S.old); S.sim?.dispose(); S.pre?.sim.dispose(); renderer.dispose(); },
  };
}
