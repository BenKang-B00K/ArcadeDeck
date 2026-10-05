// Procedural chibi animals + wind-up toy karts, built from three.js primitives (no model files). DESIGN.md §12.
// Faces come straight from Ladder's SVG symbols (#a0..#a19 in index.html): the symbol's face features are drawn to
// a canvas and projected from the front onto the head, so every 3D face matches its 2D icon. Protruding parts
// (beaks, snouts, muzzles, frog eye bumps) take the same projection and pick up the colours painted at their spot.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const U = 0.0365; // metres per SVG unit (a 32-unit icon ≈ 1.17 m: every animal keeps its icon's proportions)
const INK = '#2b2140', OUTLINE = '#120a2a', PUSH = 0.022;
const FACE_PX = 256;

// head: [cx, cy, rx, ry] of the symbol's head disc; from: index of that disc among the symbol's leaf elements (the .e
// eye group counts as one leaf; everything before it is ears/mane/bumps); skip: later leaves left off the face;
// parts: 3D pieces in SVG units around the head ('f-n' z = n units behind the face surface; c: null = painted).
const W = '#f6f2fc';
export const SPECIES = [
  { name: 'rabbit', head: [16, 20.5, 10.5, 8.8], from: 2, fur: W, belly: '#ffe3ec', parts: [
    ['ell', { at: [10.3, 8.8], z: 0, r: [2.4, 6.4, 1.5], c: W, rot: [0, 0, 10], m: 1 }],
    ['ell', { at: [10.4, 9.6], z: 1, r: [1.25, 4.6, 0.7], c: '#ffb3c8', rot: [0, 0, 10], m: 1 }],
    ['ell', { at: [16, 23.4], z: 'f-1.6', r: [3.6, 2.6, 2.2], c: null }]] },
  { name: 'penguin', head: [16, 16.5, 12.5, 12.5], from: 0, fur: '#33395c', belly: W, parts: [
    ['cone', { at: [16, 20.6], z: 'f-0.5', r: 2.1, h: 3.4, rot: [90, 0, 0], s: [1, 1, 0.6], c: null }]] },
  { name: 'tiger', head: [16, 17.8, 12.5, 10.8], from: 4, fur: '#ffa53a', belly: '#fff3e0', parts: [
    ['ell', { at: [7.6, 9], z: -0.5, r: [3.9, 3.9, 1.6], c: '#ffa53a', m: 1 }],
    ['ell', { at: [7.7, 9.2], z: 0.6, r: [2, 2, 0.7], c: '#ffe0c2', m: 1 }],
    ['ell', { at: [16, 22.6], z: 'f-2.4', r: [6.2, 4.6, 3.2], c: null }]] },
  { name: 'cat', head: [16, 18.2, 12.2, 10.4], from: 2, fur: '#ffd89a', belly: '#fff3e0', parts: [
    ['cone', { at: [8.4, 10.6], z: -0.3, r: 3.6, h: 6.8, rot: [0, 0, 22], s: [1, 1, 0.42], c: '#ffd89a', m: 1 }],
    ['cone', { at: [8.7, 11], z: 0.9, r: 2, h: 4.4, rot: [0, 0, 22], s: [1, 1, 0.3], c: '#ffb3c8', m: 1 }],
    ['ell', { at: [16, 21.8], z: 'f-1.6', r: [3.6, 2.4, 2], c: null }]] },
  { name: 'panda', head: [16, 17.6, 12.6, 11], from: 2, fur: W, paw: INK, parts: [
    ['ell', { at: [7.6, 9.2], z: -0.4, r: [4.2, 4.2, 1.8], c: INK, m: 1 }],
    ['ell', { at: [16, 21.6], z: 'f-1.8', r: [4.4, 3.2, 2.4], c: null }]] },
  { name: 'fox', head: [16, 18.2, 12.6, 10.9], from: 2, fur: '#ff8a3a', belly: '#fff3e0', parts: [
    ['cone', { at: [8.6, 10.8], z: -0.4, r: 4, h: 8.5, rot: [0, 0, 24], s: [1, 1, 0.42], c: '#ff8a3a', m: 1 }],
    ['cone', { at: [8.6, 10.8], off: [0, 5.2, 0.3], z: -0.4, r: 1.62, h: 3.3, rot: [0, 0, 24], s: [1, 1, 0.5], c: '#5a2e1e', m: 1 }],
    ['ell', { at: [16, 22.2], z: 'f-2.6', r: [6, 3.8, 4.4], c: null }]] },
  { name: 'dog', head: [16, 17.6, 10.8, 10.6], from: 0, skip: [2], fur: '#f0c890', belly: '#fff3e0', parts: [
    ['ell', { at: [6.2, 13.4], z: -1, r: [2.6, 6.4, 1.7], c: '#9a6440', rot: [0, 0, -16], m: 1 }],
    ['ell', { at: [16, 22], z: 'f-2.4', r: [5.6, 4.3, 3.4], c: null }]] },
  { name: 'lion', head: [16, 17.6, 8.6, 8.6], from: 3, fur: '#ffc95a', belly: '#fff3e0', parts: [
    ['ring', { at: [16, 17.4], n: 12, rad: 10.4, r: [3.9, 3.9, 2.6], z: -2.6, c: '#d9692a' }],
    ['ell', { at: [10.2, 10.4], z: 0.4, r: [2.4, 2.4, 1.3], c: '#ffc95a', m: 1 }],
    ['ell', { at: [16, 21.1], z: 'f-1.6', r: [3.7, 2.9, 2.4], c: null }]] },
  { name: 'bear', head: [16, 18, 12.2, 10.6], from: 4, fur: '#b0703c', belly: '#ecc89e', parts: [
    ['ell', { at: [7.6, 9.3], z: -0.4, r: [4.2, 4.2, 1.8], c: '#b0703c', m: 1 }],
    ['ell', { at: [7.7, 9.5], z: 0.8, r: [2.1, 2.1, 0.8], c: '#e0a670', m: 1 }],
    ['ell', { at: [16, 22], z: 'f-2.4', r: [5.4, 4.1, 3.2], c: null }]] },
  { name: 'frog', head: [16, 19.6, 13.2, 9.6], from: 2, box: [2.6, 4.6, 26.8, 25.6], fur: '#6bd16a', belly: '#c8f5a0', parts: [
    ['ell', { at: [9.5, 10.8], z: 2.6, r: [5.2, 5.2, 4.4], c: null, m: 1 }]] },
  { name: 'koala', head: [16, 18, 11.5, 10.5], from: 4, fur: '#9aa3b8', belly: '#e6dff0', parts: [
    ['ell', { at: [6.6, 11.2], z: -0.6, r: [5.2, 5.2, 2], c: '#9aa3b8', m: 1 }],
    ['ell', { at: [6.8, 11.4], z: 0.9, r: [3, 3, 0.9], c: '#e6dff0', m: 1 }],
    ['ell', { at: [16, 20], z: 'f-1.2', r: [2.6, 3.3, 2], c: null }]] },
  { name: 'pig', head: [16, 18, 12.4, 10.6], from: 2, fur: '#ffb3c8', parts: [
    ['cone', { at: [8.6, 10.4], z: -0.2, r: 3, h: 5, rot: [-25, 0, 28], s: [1, 1, 0.4], c: '#ff9fb8', m: 1 }],
    ['ell', { at: [16, 21.2], z: 'f-1.2', r: [4.6, 3.4, 2.6], c: null }]] },
  { name: 'mouse', head: [16, 19, 10.6, 9.6], from: 4, fur: '#b8b4c8', belly: '#e6e2f0', parts: [
    ['ell', { at: [7.4, 9.4], z: -0.8, r: [6, 6, 1.6], c: '#b8b4c8', m: 1 }],
    ['ell', { at: [7.5, 9.5], z: 0.5, r: [3.8, 3.8, 0.8], c: '#ffb3c8', m: 1 }],
    ['ell', { at: [16, 21.6], z: 'f-0.8', r: [1.4, 1.4, 1.2], c: null }]] },
  { name: 'monkey', head: [16, 16.5, 11.5, 11.5], from: 4, fur: '#8a5a3c', belly: '#f0c8a0', parts: [
    ['ell', { at: [5, 17], z: -1.2, r: [4.2, 4.2, 1.6], c: '#8a5a3c', rot: [0, -30, 0], m: 1 }],
    ['ell', { at: [5.2, 17], z: 0.1, r: [2.4, 2.4, 0.8], c: '#f0c8a0', rot: [0, -30, 0], m: 1 }],
    ['ell', { at: [16, 21.6], z: 'f-2.6', r: [6, 4.4, 3.4], c: null }]] },
  { name: 'owl', head: [16, 18, 12, 11], from: 1, fur: '#8c6a50', belly: '#c9a77f', parts: [
    ['cone', { at: [8.4, 8.8], z: -0.5, r: 2.4, h: 4.8, rot: [0, 0, 38], s: [1, 1, 0.5], c: '#8c6a50', m: 1 }],
    ['cone', { at: [16, 21.4], z: 'f-0.6', r: 1.6, h: 2.8, rot: [110, 0, 0], s: [1, 1, 0.7], c: null }]] },
  { name: 'chick', head: [16, 18, 11.5, 11.5], from: 1, fur: '#ffe066', belly: '#fff0a0', parts: [
    ['cone', { at: [15.6, 7.2], z: 0, r: 0.9, h: 4.2, rot: [0, 0, 14], c: '#ffc21a' }],
    ['cone', { at: [16.6, 7.2], z: 0, r: 0.9, h: 3.6, rot: [0, 0, -38], c: '#ffc21a' }],
    ['cone', { at: [16, 20.6], z: 'f-0.6', r: 2.4, h: 2.8, rot: [90, 0, 0], s: [1, 1, 0.55], c: null }]] },
  { name: 'cow', head: [16, 16.5, 10.6, 11], from: 6, fur: W, parts: [
    ['cone', { at: [9.6, 7.4], z: -0.4, r: 1.3, h: 4, rot: [0, 0, 40], c: '#e8d8b0', m: 1 }],
    ['ell', { at: [4.8, 12.2], z: -1, r: [3.8, 2.2, 1.2], c: W, rot: [0, 0, 20], m: 1 }],
    ['ell', { at: [5, 12.3], z: 0.1, r: [2.2, 1.1, 0.6], c: '#ffb3c8', rot: [0, 0, 20], m: 1 }],
    ['ell', { at: [16, 22], z: 'f-2.8', r: [7, 5, 3.4], c: null }]] },
  { name: 'sheep', head: [16, 19, 7.6, 9], from: 10, skip: [11, 12, 13], fur: W, face: '#ffe8cf', parts: [
    ['ring', { at: [16, 17], n: 11, rad: 10.2, r: [4, 4, 3], z: -2.6, c: W, a0: 160, a1: 380 }],
    ['ell', { at: [12.6, 11], z: 'f-1.8', r: [3, 3, 2.4], c: W }], ['ell', { at: [16, 10], z: 'f-1.8', r: [3.2, 3.2, 2.4], c: W }],
    ['ell', { at: [19.4, 11], z: 'f-1.8', r: [3, 3, 2.4], c: W }],
    ['ell', { at: [6.2, 17.6], z: -0.5, r: [3.4, 1.8, 1.2], c: '#e0b896', rot: [0, 0, 25], m: 1 }]] },
  { name: 'raccoon', head: [16, 18, 12.4, 10.6], from: 2, fur: '#8a8aa0', belly: '#c8c8d8', parts: [
    ['cone', { at: [8.4, 10.2], z: -0.4, r: 3.4, h: 6, rot: [0, 0, 20], s: [1, 1, 0.42], c: '#8a8aa0', m: 1 }],
    ['cone', { at: [8.7, 10.6], z: 0.7, r: 1.9, h: 3.8, rot: [0, 0, 20], s: [1, 1, 0.3], c: '#3a3550', m: 1 }],
    ['ell', { at: [16, 23], z: 'f-2.4', r: [5.4, 4, 3], c: null }]] },
  { name: 'hamster', head: [16, 18, 12.6, 10.8], from: 4, fur: '#e89a5a', belly: '#fff3e0', parts: [
    ['ell', { at: [8.2, 8.8], z: -0.4, r: [3.4, 3.4, 1.4], c: '#e89a5a', m: 1 }],
    ['ell', { at: [8.3, 9], z: 0.6, r: [1.8, 1.8, 0.6], c: '#ffb3c8', m: 1 }],
    ['ell', { at: [9.4, 21.4], z: 'f-3', r: [5.4, 4.8, 3.6], c: null, m: 1 }]] },
];

// ---------- geometry helpers ----------
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _p = new THREE.Vector3();
const D = Math.PI / 180;
function xf(g, pos, rot = [0, 0, 0], scl = [1, 1, 1], off) {
  if (off) g.translate(off[0], off[1], off[2]);
  _q.setFromEuler(_e.set(rot[0] * D, rot[1] * D, rot[2] * D));
  return g.applyMatrix4(_m.compose(_p.set(pos[0], pos[1], pos[2]), _q, _s.set(scl[0], scl[1], scl[2])));
}
const sphere = (seg = 18) => new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7));
// front (z >= 0) or back half of a unit sphere: painted pieces are split so no triangle straddles the face projection
const half = (front, seg = 18) => new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7), front ? 0 : Math.PI, Math.PI);
const cone = (r, h, seg = 14) => new THREE.ConeGeometry(r, h, seg, 1).translate(0, h / 2, 0); // base at the origin, tip up
// rounded box: a subdivided box with every vertex pulled onto the rounded hull
function rbox(w, h, d, r, seg = 4) {
  const g = new THREE.BoxGeometry(w, h, d, seg, seg, seg), p = g.attributes.position, n = g.attributes.normal;
  const iw = w / 2 - r, ih = h / 2 - r, id = d / 2 - r, v = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    c.set(THREE.MathUtils.clamp(v.x, -iw, iw), THREE.MathUtils.clamp(v.y, -ih, ih), THREE.MathUtils.clamp(v.z, -id, id));
    v.sub(c).normalize();
    n.setXYZ(i, v.x, v.y, v.z);
    v.multiplyScalar(r).add(c);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  return g;
}
const COL = new THREE.Color();
// give a geometry the shared attribute set (position, normal, uv, color, pivot) so everything merges into one mesh
function paint(g, color, uv = [0.5, 0.995], pivot = [0, 0, 0, 0]) {
  const n = g.attributes.position.count, col = new Float32Array(n * 3), uvs = new Float32Array(n * 2), piv = new Float32Array(n * 4);
  COL.set(color);
  for (let i = 0; i < n; i++) {
    col[i * 3] = COL.r; col[i * 3 + 1] = COL.g; col[i * 3 + 2] = COL.b;
    uvs[i * 2] = uv[0]; uvs[i * 2 + 1] = uv[1];
    piv.set(pivot, i * 4);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  g.setAttribute('pivot', new THREE.BufferAttribute(piv, 4));
  return g;
}
// inverted hull outline (Ladder's #ol filter, in 3D): back faces pushed out along the normals
function outlineMat(uniforms) {
  const m = new THREE.MeshBasicMaterial({ color: OUTLINE, side: THREE.BackSide });
  m.onBeforeCompile = sh => {
    if (uniforms) spinShader(sh, uniforms);
    sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\ntransformed += normalize(normal) * ${PUSH.toFixed(3)};`);
  };
  m.customProgramCacheKey = () => uniforms ? 'hull-spin' : 'hull';
  return m;
}

// ---------- faces: the SVG symbol's features, projected onto the head ----------
const faceCache = new Map(); // `${k}:${mood}` -> CanvasTexture
const leavesOf = root => { const out = []; const walk = n => { for (const c of n.children) { if (c.tagName === 'g' && !c.classList.contains('e')) walk(c); else out.push(c); } }; walk(root); return out; };
const pupils = sym => [...sym.querySelectorAll('.e [fill="#2b2140"] circle')].map(c => [+c.getAttribute('cx'), +c.getAttribute('cy')]).sort((a, b) => a[0] - b[0]);
const boxOf = sp => sp.box || [sp.head[0] - sp.head[2] * 1.14, sp.head[1] - sp.head[3] * 1.14, sp.head[2] * 2.28, sp.head[3] * 2.28];
function faceMarkup(k, mood) {
  const sp = SPECIES[k], sym = document.querySelector('#a' + k);
  const root = sym.querySelector(':scope > g').cloneNode(true);
  root.removeAttribute('filter');
  const leaves = leavesOf(root);
  leaves.forEach((l, i) => { if (i < sp.from || sp.skip?.includes(i)) l.remove(); });
  const e = root.querySelector('.e'), eyes = pupils(sym);
  const ey = eyes.reduce((a, p) => a + p[1], 0) / eyes.length;
  const stroke = `fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"`;
  if (mood === 'blink' || mood === 'focus') e.setAttribute('transform', `translate(0 ${ey}) scale(1 ${mood === 'blink' ? 0.12 : 0.55}) translate(0 ${-ey})`);
  else if (mood === 'joy') e.outerHTML = eyes.map(([x, y]) => `<path d="M${x - 2.2} ${y + 0.8}Q${x} ${y - 2.4} ${x + 2.2} ${y + 0.8}" ${stroke}/>`).join('');
  else if (mood === 'sob') e.outerHTML = eyes.map(([x, y]) => `<path d="M${x - 2} ${y - 0.4}Q${x} ${y + 1.6} ${x + 2} ${y - 0.4}" ${stroke}/><path d="M${x - 0.5} ${y + 1.4}h1v6.5a.5.5 0 0 1-1 0z" fill="#8fd8ff" opacity=".85"/><path d="M${x} ${y + 7}q-1.3 1.9 0 2.8q1.3-.9 0-2.8z" fill="#8fd8ff" stroke="#2b6a9a" stroke-width=".4"/>`).join('');
  else if (mood === 'hurt') { // Ladder hurtFace(): > < eyes, a plaster over one, a sweat drop by the other
    const [l, r] = eyes;
    e.outerHTML = `<path d="M${l[0] - 1.6} ${l[1] - 1.4}L${l[0] + 1.2} ${l[1]}L${l[0] - 1.6} ${l[1] + 1.4}M${r[0] + 1.6} ${r[1] - 1.4}L${r[0] - 1.2} ${r[1]}L${r[0] + 1.6} ${r[1] + 1.4}" ${stroke}/>
      <g transform="translate(${r[0] + 2.2} ${r[1] - 5}) rotate(-35)"><rect x="-3.6" y="-1.3" width="7.2" height="2.6" rx="1.3" fill="#ffdcae" stroke="#c98a5a" stroke-width=".5"/><rect x="-1.1" y="-1.3" width="2.2" height="2.6" fill="#f0b07c"/></g>
      <path d="M${l[0] - 3.4} ${l[1] - 5.2}q-1.5 2.1 0 3q1.5-.9 0-3z" fill="#8fd8ff" stroke="#2b6a9a" stroke-width=".45"/>`;
  }
  if (mood === 'soot') root.insertAdjacentHTML('beforeend', document.querySelector('#x-soot g').outerHTML);
  return root.outerHTML;
}
export function faceTex(k, mood = 'normal') {
  const key = k + ':' + mood;
  if (faceCache.has(key)) return faceCache.get(key);
  const sp = SPECIES[k], c = document.createElement('canvas'), g = c.getContext('2d');
  c.width = c.height = FACE_PX;
  const bg = () => { g.fillStyle = sp.face || sp.fur; g.fillRect(0, 0, FACE_PX, FACE_PX); };
  const white = () => { g.fillStyle = '#fff'; g.fillRect(FACE_PX / 2 - 6, 0, 12, 4); }; // vertex-coloured parts sample this patch
  bg(); white();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const [bx, by, bw, bh] = boxOf(sp), img = new Image();
  img.onload = () => { bg(); g.drawImage(img, 0, 0, FACE_PX, FACE_PX); white(); tex.needsUpdate = true; };
  img.src = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bx} ${by} ${bw} ${bh}" width="${FACE_PX}" height="${FACE_PX}" preserveAspectRatio="none">${faceMarkup(k, mood)}</svg>`);
  faceCache.set(key, tex);
  return tex;
}

// ---------- animal geometry ----------
const geoCache = new Map();
export const SEAT = [0, 0.48, -0.22]; // where the animal sits in the kart
function animalGeo(k) {
  if (geoCache.has(k)) return geoCache.get(k);
  const sp = SPECIES[k], [cx, cy, rx, ry] = sp.head, [bx, by, bw, bh] = boxOf(sp);
  const Rx = rx * U, Ry = ry * U, Rz = Math.min(rx, ry) * 0.92 * U;
  const toX = x => (x - cx) * U, toY = y => (cy - y) * U;
  const frontZ = (x, y) => Math.min(rx, ry) * 0.92 * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2 - ((y - cy) / ry) ** 2));
  const zOf = (z, x, y) => typeof z === 'string' ? frontZ(x, y) - +z.slice(2) : z;
  const head = [], back = [], rest = [];
  const add = (g, c) => (c ? rest : head).push(c ? paint(g, c) : g);
  // painted ellipsoid: front half takes the face projection, back half the plain fur texel
  const painted = (pos, r, rot = [0, 0, 0], seg = 16) => { head.push(xf(half(true, seg), pos, rot, r)); back.push(xf(half(false, seg), pos, rot, r)); };

  painted([0, 0, 0], [Rx, Ry, Rz], undefined, 28);
  for (const [kind, o] of sp.parts) {
    const copies = o.m ? [[o.at[0], 1], [2 * cx - o.at[0], -1]] : [[o.at[0], 1]];
    for (const [x, sx] of copies) {
      const rot = o.rot ? [o.rot[0], o.rot[1] * sx, o.rot[2] * sx] : [0, 0, 0];
      if (kind === 'ring') { // lobes round the head (lion mane, sheep wool); a0..a1 limit the arc (degrees, 0 = right)
        const a0 = o.a0 ?? 0, a1 = o.a1 ?? -360;
        for (let j = 0; j < o.n; j++) {
          const a = (a0 + (a1 - a0) * (j + 0.5) / o.n) * D;
          add(xf(sphere(12), [toX(o.at[0] + Math.cos(a) * o.rad), toY(o.at[1] + Math.sin(a) * o.rad), o.z * U], [0, 0, 0], o.r.map(v => v * U)), o.c);
        }
        continue;
      }
      const pos = [toX(x), toY(o.at[1]), zOf(o.z, x, o.at[1]) * U];
      if (kind === 'ell' && !o.c) { painted(pos, o.r.map(v => v * U), rot); continue; }
      const g = kind === 'ell' ? xf(sphere(16), pos, rot, o.r.map(v => v * U)) : xf(cone(o.r * U, o.h * U), pos, rot, o.s || [1, 1, 1], o.off?.map(v => v * U));
      add(g, o.c);
    }
  }
  // painted parts: vertex colour white, uv = front projection into the face box; back halves sample a plain fur texel
  for (const g of head) {
    const p = g.attributes.position, n = p.count, uv = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      uv[i * 2] = THREE.MathUtils.clamp((cx + p.getX(i) / U - bx) / bw, 0.01, 0.99);
      uv[i * 2 + 1] = THREE.MathUtils.clamp(1 - (cy - p.getY(i) / U - by) / bh, 0.02, 0.97);
    }
    paint(g, '#fff');
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  }
  for (const g of back) head.push(paint(g, '#fff', [0.015, 0.03]));
  // body: a little capsule sitting in the seat, belly patch, two paws reaching for the wheel
  const headY = 0.62 + Ry * 0.92;
  head.forEach(g => g.translate(0, headY, 0.03));
  const fur = sp.fur;
  rest.forEach(g => g.translate(0, headY, 0.03));
  rest.push(paint(xf(new THREE.CapsuleGeometry(0.24, 0.16, 6, 14), [0, 0.36, -0.02], [0, 0, 0], [1, 1, 0.86]), fur));
  if (sp.belly) rest.push(paint(xf(sphere(14), [0, 0.32, 0.12], [-8, 0, 0], [0.17, 0.2, 0.11]), sp.belly));
  for (const s of [-1, 1]) {
    rest.push(paint(xf(new THREE.CapsuleGeometry(0.065, 0.3, 4, 8), [s * 0.17, 0.42, 0.26], [70, 0, s * -14]), sp.paw || fur));
    rest.push(paint(xf(sphere(10), [s * 0.13, 0.44, 0.44], [0, 0, 0], [0.085, 0.085, 0.085]), sp.paw || fur));
  }
  const all = [...head, ...rest].map(g => g.index ? g : g.toNonIndexed());
  const geo = mergeGeometries(all);
  geo.computeBoundingSphere();
  geoCache.set(k, geo);
  return geo;
}

// ---------- toy kart ----------
// pivot attribute: xyz = spin centre, w = 1 wind-up key (spins about z), 2 wheel (spins about x)
function spinShader(sh, uni) {
  Object.assign(sh.uniforms, uni);
  sh.vertexShader = sh.vertexShader
    .replace('#include <common>', `#include <common>
attribute vec4 pivot;
uniform float uKey, uWheel;
vec3 spin(vec3 p, bool c) {
  if (pivot.w < 0.5) return p;
  float a = pivot.w < 1.5 ? uKey : uWheel, cs = cos(a), sn = sin(a);
  vec3 q = c ? p - pivot.xyz : p;
  if (pivot.w < 1.5) q.xy = mat2(cs, sn, -sn, cs) * q.xy; else q.yz = mat2(cs, sn, -sn, cs) * q.yz;
  return c ? q + pivot.xyz : q;
}`)
    .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nobjectNormal = spin(objectNormal, false);')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed = spin(transformed, true);');
}
// one dedicated kart per animal (DESIGN.md §12.3). Painted primitives, in metres: +z forward, y up, wheels at z ±0.6,
// the driver sits at SEAT. Every builder gets (accent, lighter accent, deeper accent) and returns its body parts;
// kartGeo() adds the shared chassis (steering wheel, axles, spinning wheels, the wind-up key) and merges it all.
const W2 = '#ffffff', CREAM = '#fff3e0', GOLD = '#ffd54a', CHROME = '#e8eef8';
const box = (w, h, d, r, pos, c, rot) => paint(xf(rbox(w, h, d, r), pos, rot), c);
const ell = (pos, r, c, rot, seg = 12) => paint(xf(sphere(seg), pos, rot, r), c);
const pod = (pos, r, c) => ell(pos, r, c, undefined, 24);
const cyl = (r0, r1, h, pos, c, rot, seg = 12) => paint(xf(new THREE.CylinderGeometry(r0, r1, h, seg), pos, rot), c);
const cn = (r, h, pos, c, rot, scl, seg) => paint(xf(cone(r, h, seg), pos, rot, scl), c); // base at pos, tip along +y before rot
const tor = (R, t, pos, c, rot, scl) => paint(xf(new THREE.TorusGeometry(R, t, 8, 22), pos, rot, scl), c);
const pair = f => [f(-1), f(1)].flat(); // mirrored parts, s = -1 left / 1 right
const ring = (n, f) => Array.from({ length: n }, (_, i) => f(i / n * Math.PI * 2, i)).flat();
const seat = (c = INK, z = -0.62) => box(0.78, 0.46, 0.16, 0.07, [0, 0.86, z], c, [-8, 0, 0]);
const bumper = (z, y = 0.28, w = 1.34) => box(w, 0.16, 0.2, 0.07, [0, y, z], CHROME);
const spin = (g, piv) => { const a = g.attributes.pivot; for (let i = 0; i < a.count; i++) a.setXYZW(i, ...piv); return g; };
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
function rod(p0, p1, r, c, seg = 8) { // a cylinder from p0 to p1
  _a.fromArray(p0); _b.fromArray(p1).sub(_a);
  const len = _b.length();
  _q.setFromUnitVectors(UP, _b.normalize());
  return paint(new THREE.CylinderGeometry(r, r, len, seg).applyMatrix4(_m.compose(_a.addScaledVector(_b, len / 2), _q, _s.set(1, 1, 1))), c);
}
// a smooth tube along a curve; r and c may be functions of t (0..1 along it) for tapers and ringed colours
function tube(pts, r, c, seg = 24, rad = 8) {
  const cv = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
  const g = paint(new THREE.TubeGeometry(cv, seg, 1, rad), typeof c === 'function' ? W2 : c), p = g.attributes.position, col = g.attributes.color;
  for (let j = 0; j <= seg; j++) { // TubeGeometry lays out rad + 1 vertices per ring, ring j centred on getPointAt(j / seg)
    const t = j / seg, k = typeof r === 'function' ? r(t) : r;
    cv.getPointAt(t, _a);
    if (typeof c === 'function') COL.set(c(t));
    for (let i = j * (rad + 1); i < (j + 1) * (rad + 1); i++) {
      p.setXYZ(i, _a.x + (p.getX(i) - _a.x) * k, _a.y + (p.getY(i) - _a.y) * k, _a.z + (p.getZ(i) - _a.z) * k);
      if (typeof c === 'function') col.setXYZ(i, COL.r, COL.g, COL.b);
    }
  }
  return g;
}
function wedge(w, h, d, pos, c) { // cheese wedge: full height at the back, a thin edge at the front
  const g = new THREE.BoxGeometry(w, h, d), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) p.setY(i, h / 2 - (p.getZ(i) / d + 0.5) * h * 0.8);
  g.computeVertexNormals();
  return paint(xf(g, pos), c);
}

const KARTS = [
  // 0 rabbit · Carrot Rocket: an egg pod with a carrot for a nose, bunny-ear fins, a cottontail
  (a, l) => [
    pod([0, 0.44, -0.02], [0.64, 0.27, 0.98], a),
    cn(0.24, 0.6, [0, 0.43, 0.8], '#ff8a3a', [90, 0, 0]),
    tor(0.15, 0.022, [0, 0.43, 1.03], '#e2661c'), tor(0.085, 0.018, [0, 0.43, 1.2], '#e2661c'),
    ...[-30, 0, 30].map(r => cn(0.05, 0.3, [0, 0.6, 0.74], '#5cc85a', [-25, 0, r], [1, 1, 0.5])),
    ...pair(s => [ell([s * 0.46, 0.86, -0.45], [0.08, 0.3, 0.12], a, [-18, 0, s * -12]), ell([s * 0.47, 0.88, -0.36], [0.045, 0.22, 0.05], '#ffb3c8', [-18, 0, s * -12])]),
    ell([0, 0.42, -1.0], [0.17, 0.17, 0.15], W2),
    seat(l),
  ],
  // 1 penguin · Ice Sled: snow on the bonnet, sled runners curling over the nose, ice-block fenders, a fish flag
  (a, l) => [
    box(1.2, 0.36, 1.8, 0.16, [0, 0.4, 0], a),
    box(0.9, 0.28, 0.5, 0.13, [0, 0.34, 0.98], l),
    ell([0, 0.58, 0.45], [0.4, 0.07, 0.3], W2), ell([0.2, 0.6, 0.64], [0.2, 0.07, 0.16], W2), ell([-0.24, 0.59, 0.26], [0.17, 0.06, 0.14], W2),
    ...pair(s => tube([[s * 0.45, 0.6, -0.92], [s * 0.45, 0.61, 0.3], [s * 0.44, 0.66, 0.9], [s * 0.42, 0.88, 1.12], [s * 0.42, 1.0, 1.0], [s * 0.42, 0.92, 0.88]], 0.04, CHROME)),
    ...[0.62, -0.6].flatMap(z => pair(s => box(0.38, 0.14, 0.64, 0.05, [s * 0.73, 0.7, z], '#bfeeff'))),
    seat(W2),
    rod([-0.5, 0.56, -0.86], [-0.5, 1.5, -0.86], 0.022, INK, 6),
    ell([-0.5, 1.48, -0.78], [0.05, 0.09, 0.15], '#ffa53a'),
    cn(0.09, 0.14, [-0.5, 1.48, -1.04], '#ffa53a', [90, 0, 0], [0.35, 1, 1]),
  ],
  // 2 tiger · Stripe Striker: low wedge with tiger stripes, fangs under the nose, twin exhausts, a big rear wing
  (a, l) => [
    box(1.25, 0.36, 1.85, 0.12, [0, 0.4, -0.02], a),
    box(1.05, 0.22, 0.6, 0.09, [0, 0.32, 0.98], l, [8, 0, 0]),
    ...[0.62, 0.36, 0.1].map(z => box(0.98, 0.03, 0.08, 0.015, [0, 0.585, z], INK)),
    ...[0.48, 0.12, -0.24, -0.6].flatMap(z => pair(s => box(0.03, 0.15, 0.08, 0.015, [s * 0.63, 0.41, z], INK, [18, 0, 0]))),
    ...pair(s => cn(0.055, 0.15, [s * 0.24, 0.24, 1.2], W2, [180, 0, 0])),
    ...pair(s => [cyl(0.07, 0.07, 0.3, [s * 0.36, 0.34, -1.02], CHROME, [90, 0, 0]), cyl(0.045, 0.045, 0.02, [s * 0.36, 0.34, -1.17], INK, [90, 0, 0])]),
    ...pair(s => [box(0.05, 0.44, 0.08, 0.02, [s * 0.42, 0.82, -0.9], INK), box(0.04, 0.24, 0.4, 0.02, [s * 0.66, 1.03, -1.0], a)]),
    box(1.3, 0.05, 0.34, 0.02, [0, 1.05, -1.0], INK, [-6, 0, 0]),
    seat(INK),
  ],
  // 3 cat · Cat Cruiser: the nose is a cat face (ears, slit-eye headlights, whiskers), a curly tail behind
  (a, l, d) => [
    box(1.2, 0.42, 1.7, 0.18, [0, 0.42, -0.06], a),
    box(1.0, 0.34, 0.6, 0.16, [0, 0.4, 0.88], l),
    ...pair(s => [cn(0.17, 0.3, [s * 0.3, 0.52, 0.84], a, [0, 0, s * -14], [1, 1, 0.45]), cn(0.09, 0.18, [s * 0.3, 0.54, 0.9], '#ffb3c8', [0, 0, s * -14], [1, 1, 0.3])]),
    ...pair(s => [ell([s * 0.24, 0.45, 1.16], [0.1, 0.12, 0.05], '#d8ff6a'), ell([s * 0.24, 0.45, 1.2], [0.025, 0.09, 0.02], INK)]),
    ell([0, 0.35, 1.2], [0.06, 0.045, 0.04], '#ff7aa0'),
    ...[-7, 7].flatMap(r => pair(s => rod([s * 0.32, 0.36, 1.16], [s * 0.72, 0.36 + r * 0.012, 1.12], 0.012, INK, 4))),
    tube([[0.45, 0.56, -0.86], [0.56, 0.68, -1.08], [0.6, 0.95, -1.2], [0.6, 1.16, -1.12], [0.52, 1.25, -0.98], [0.46, 1.19, -0.9]], t => 0.06 - t * 0.02, d),
    ell([0.46, 1.19, -0.9], [0.04, 0.04, 0.04], d),
    seat(INK),
  ],
  // 4 panda · Bamboo Buggy: black round fenders, bamboo side rails and bumper, two leafy stalks at the back
  (a, l) => {
    const lerp = (p, q, t) => p.map((v, i) => v + (q[i] - v) * t);
    const stalk = (p, q) => [rod(p, q, 0.045, '#6fbf4a'), ...[0.3, 0.65].map(t => rod(lerp(p, q, t - 0.025), lerp(p, q, t + 0.025), 0.057, '#3f8a2e'))];
    return [
      box(1.25, 0.42, 1.75, 0.17, [0, 0.42, 0], a),
      box(0.95, 0.3, 0.55, 0.14, [0, 0.36, 0.95], l),
      ...[0.62, -0.6].flatMap(z => pair(s => ell([s * 0.73, 0.56, z], [0.21, 0.15, 0.37], INK))),
      ...pair(s => stalk([s * 0.62, 0.7, -0.85], [s * 0.62, 0.7, 0.9])),
      ...stalk([-0.72, 0.28, 1.25], [0.72, 0.28, 1.25]),
      ...pair(s => [...stalk([s * 0.48, 0.55, -0.9], [s * 0.54, 1.32, -0.98]),
        ell([s * 0.66, 1.26, -0.97], [0.17, 0.035, 0.06], '#4fb84a', [0, 0, s * 28]), ell([s * 0.42, 1.18, -1.0], [0.14, 0.03, 0.05], '#4fb84a', [0, 0, s * -30])]),
      seat(W2),
    ];
  },
  // 5 fox · Blaze Tail: a long pointed snout with a cream tip, a huge bushy tail streaming behind
  (a) => [
    box(1.2, 0.38, 1.6, 0.16, [0, 0.42, -0.15], a),
    cn(0.56, 0.8, [0, 0.4, 0.55], a, [90, 0, 0], [1, 1, 0.5], 32),
    cn(0.155, 0.22, [0, 0.4, 1.14], CREAM, [90, 0, 0], [1, 1, 0.5], 24),
    ell([0, 0.4, 1.35], [0.06, 0.05, 0.05], INK),
    ...pair(s => box(0.03, 0.05, 0.9, 0.02, [s * 0.6, 0.5, -0.2], CREAM)),
    tube([[0.45, 0.5, -0.92], [0.62, 0.58, -1.25], [0.6, 0.8, -1.58], [0.42, 1.02, -1.74]], t => 0.02 + 0.24 * Math.sin(Math.PI * t) ** 0.7, t => t > 0.78 ? CREAM : '#ff8a3a', 20, 10),
    bumper(-1.0),
    seat(INK),
  ],
  // 6 dog · Doghouse Wagon: a little doghouse with a red roof on the back deck, a bone bumper, floppy-ear mud flaps
  (a, l) => [
    box(1.25, 0.44, 1.75, 0.12, [0, 0.43, 0], a),
    box(0.95, 0.3, 0.55, 0.12, [0, 0.36, 0.95], l),
    box(0.86, 0.24, 0.42, 0.04, [0, 0.77, -0.82], W2),
    ...pair(s => box(0.54, 0.05, 0.54, 0.02, [s * 0.235, 1.03, -0.82], '#e04848', [0, 0, s * -28])),
    cyl(0.08, 0.08, 0.03, [0, 0.78, -1.035], INK, [90, 0, 0], 14), box(0.16, 0.1, 0.03, 0.01, [0, 0.71, -1.035], INK),
    rod([-0.52, 0.3, 1.25], [0.52, 0.3, 1.25], 0.06, '#fff8e8'),
    ...pair(s => [ell([s * 0.56, 0.37, 1.25], [0.09, 0.09, 0.09], '#fff8e8'), ell([s * 0.56, 0.23, 1.25], [0.09, 0.09, 0.09], '#fff8e8')]),
    ...pair(s => ell([s * 0.52, 0.36, -0.92], [0.07, 0.24, 0.12], '#9a6440', [-10, 0, 0])),
    box(0.99, 0.07, 0.07, 0.03, [0, 0.5, 0.69], '#e04848'), ell([0, 0.44, 0.74], [0.05, 0.05, 0.02], GOLD),
  ],
  // 7 lion · Royal Chariot: a sun-mane grille, red carpet stripe with gold trim, a red throne with a crown
  (a, l) => [
    box(1.25, 0.42, 1.75, 0.17, [0, 0.42, 0], a),
    box(0.95, 0.3, 0.55, 0.14, [0, 0.36, 0.95], l),
    box(0.26, 0.05, 1.62, 0.02, [0, 0.64, 0.02], '#c2304a'),
    ...pair(s => box(0.04, 0.05, 1.5, 0.02, [s * 0.63, 0.5, 0], GOLD)),
    cyl(0.2, 0.2, 0.08, [0, 0.4, 1.25], '#ffc95a', [90, 0, 0], 18),
    ...ring(10, t => cn(0.075, 0.18, [Math.sin(t) * 0.21, 0.4 + Math.cos(t) * 0.21, 1.23], '#d9692a', [0, 0, -t / D], [1, 1, 0.5])),
    seat('#c2304a'),
    box(0.84, 0.06, 0.2, 0.03, [0, 1.1, -0.66], GOLD, [-8, 0, 0]),
    ...[-0.34, -0.12, 0.12, 0.34].map(x => cn(0.06, 0.15, [x, 1.12, -0.67], GOLD)),
    bumper(-0.95),
  ],
  // 8 bear · Honey Pot: the bear rides in a honey pot brimming over, a honey dipper for an antenna
  (a, l) => {
    const honey = '#ffb31a', pot = new THREE.LatheGeometry([[0.01, 0.15], [0.4, 0.16], [0.6, 0.3], [0.66, 0.5], [0.6, 0.7], [0.5, 0.8], [0.01, 0.8]].map(([x, y]) => new THREE.Vector2(x, y)), 20);
    return [
      paint(pot.translate(0, 0, -0.28), a),
      tor(0.52, 0.06, [0, 0.8, -0.28], l, [90, 0, 0]),
      ell([0, 0.81, -0.28], [0.5, 0.05, 0.5], honey),
      ...[20, 80, 150, 215, 290].map(g => ell([Math.sin(g * D) * 0.58, 0.68, -0.28 + Math.cos(g * D) * 0.58], [0.06, 0.15, 0.06], honey)),
      box(1.0, 0.44, 0.8, 0.16, [0, 0.4, 0.78], '#ffc23a'),
      rod([-0.36, 0.7, -0.62], [-0.56, 1.32, -0.78], 0.025, '#c98a4a', 6),
      ...[0, 1, 2].map(i => ell([-0.57 - i * 0.012, 1.33 + i * 0.07, -0.79 - i * 0.008], [0.08 - i * 0.012, 0.045, 0.08 - i * 0.012], '#e0a640')),
      bumper(1.2),
    ];
  },
  // 9 frog · Lily Pad: a round frog body with eye bulbs on the nose, folded legs over the back wheels, a lily-pad wing
  (a, l, d) => [
    pod([0, 0.42, 0], [0.66, 0.3, 1.0], a),
    ...pair(s => [ell([s * 0.3, 0.66, 0.64], [0.17, 0.17, 0.17], a), ell([s * 0.3, 0.7, 0.74], [0.11, 0.11, 0.08], W2), ell([s * 0.3, 0.71, 0.81], [0.055, 0.06, 0.03], INK)]),
    ...pair(s => [ell([s * 0.6, 0.5, -0.42], [0.2, 0.17, 0.42], d, [0, s * -12, 0]), ell([s * 0.66, 0.42, -0.9], [0.13, 0.03, 0.17], l)]),
    ...pair(s => rod([s * 0.18, 0.6, -0.78], [s * 0.18, 1.0, -0.98], 0.03, '#3e9a4a', 6)),
    cyl(0.4, 0.4, 0.04, [0, 1.03, -1.02], '#3e9a4a', [8, 0, 0], 22),
    ...ring(5, t => ell([0.16 + Math.sin(t) * 0.07, 1.08, -1.12 + Math.cos(t) * 0.07], [0.045, 0.03, 0.09], '#ff9db4', [0, t / D, 0])),
    ell([0.16, 1.1, -1.12], [0.04, 0.04, 0.04], '#ffd23a'),
  ],
  // 10 koala · Gum Log: a eucalyptus log banded in the racer's colour, tree rings on the ends, leafy sprigs
  (a) => {
    const bark = '#8a5a3c', sprig = (p, q) => [rod(p, q, 0.035, bark, 6), ...[[20, 30], [-30, -40], [60, 100], [-10, 170]].map(([x, y]) => ell(q, [0.05, 0.02, 0.16], '#7fb59a', [x, y, 0]))];
    return [
      cyl(0.34, 0.34, 1.9, [0, 0.38, 0], bark, [90, 0, 0], 16),
      ...pair(s => [cyl(0.3, 0.3, 0.04, [0, 0.38, s * 0.95], '#e8c890', [90, 0, 0], 16), tor(0.17, 0.018, [0, 0.38, s * 0.97], '#b08050'), tor(0.08, 0.015, [0, 0.38, s * 0.97], '#b08050')]),
      ...[-0.55, 0.62].map(z => tor(0.35, 0.05, [0, 0.38, z], a)),
      box(0.74, 0.16, 0.62, 0.06, [0, 0.68, -0.22], a),
      ell([0.3, 0.55, 0.3], [0.05, 0.08, 0.08], '#5e3a24'), ell([-0.28, 0.6, -0.65], [0.05, 0.07, 0.07], '#5e3a24'),
      ...sprig([0.18, 0.66, 0.62], [0.42, 1.0, 0.78]), ...sprig([-0.2, 0.66, -0.8], [-0.44, 1.02, -0.96]),
      seat(a),
    ];
  },
  // 11 pig · Piggy Bank: a round piggy bank with a snout bumper, little ears, a gold coin in the slot, a curly tail
  (a, l, d) => [
    pod([0, 0.46, 0], [0.64, 0.3, 1.0], a),
    cyl(0.2, 0.2, 0.14, [0, 0.42, 0.97], l, [90, 0, 0], 18),
    ...pair(s => ell([s * 0.075, 0.42, 1.045], [0.035, 0.055, 0.02], d)),
    ...pair(s => cn(0.13, 0.22, [s * 0.32, 0.66, 0.5], a, [30, 0, s * -20], [1, 1, 0.4])),
    box(0.34, 0.04, 0.08, 0.02, [0, 0.735, -0.5], INK),
    cyl(0.15, 0.15, 0.035, [0, 0.84, -0.5], GOLD, [90, 0, 0], 20),
    tube(Array.from({ length: 9 }, (_, i) => [0.28 + Math.cos(i * 1.1) * 0.06, 0.4 + Math.sin(i * 1.1) * 0.06, -0.85 - i * 0.035]), 0.028, l, 40, 6),
  ],
  // 12 mouse · Cheese Wedge: a wedge of cheese for a bonnet, round-ear mirrors, a long thin tail
  (a) => [
    box(1.2, 0.4, 1.5, 0.17, [0, 0.42, -0.18], a),
    wedge(1.04, 0.44, 0.85, [0, 0.43, 0.8], '#ffd23a'),
    ...[[0.52, 0.36, 0.7, 0.06], [-0.52, 0.48, 0.55, 0.05], [0.52, 0.3, 0.98, 0.04], [-0.52, 0.3, 0.92, 0.045]].map(([x, y, z, r]) => ell([x, y, z], [0.02, r, r], '#e0a020')),
    ...[[0.22, 0.62, 0.07], [-0.2, 0.86, 0.06], [0.04, 1.0, 0.045]].map(([x, z, r]) => ell([x, 0.65 - (z - 0.375) * 0.414, z], [r, 0.015, r], '#e0a020', [22.5, 0, 0])),
    ...pair(s => [rod([s * 0.5, 0.58, 0.15], [s * 0.64, 0.88, 0.15], 0.02, INK, 6), cyl(0.16, 0.16, 0.04, [s * 0.66, 0.96, 0.15], '#b8b4c8', [90, 0, 0], 18), cyl(0.1, 0.1, 0.02, [s * 0.66, 0.96, 0.175], '#ffb3c8', [90, 0, 0], 16)]),
    tube([[0.42, 0.36, -0.85], [0.56, 0.36, -1.3], [0.44, 0.5, -1.72], [0.16, 0.74, -1.86], [0.04, 0.96, -1.72]], t => 0.035 - t * 0.02, '#ffb3c8'),
    seat(INK),
  ],
  // 13 monkey · Banana Boat: two big bananas for side pontoons
  (a, l) => [
    box(0.96, 0.4, 1.7, 0.16, [0, 0.42, 0], a),
    box(0.78, 0.3, 0.5, 0.13, [0, 0.36, 0.95], l),
    ...pair(s => [tube([[s * 0.6, 0.98, -1.12], [s * 0.66, 0.74, -0.62], [s * 0.68, 0.7, 0.1], [s * 0.66, 0.74, 0.75], [s * 0.6, 0.96, 1.15]], t => 0.03 + 0.15 * Math.sin(Math.PI * t) ** 0.6, '#ffd84a', 28, 10),
      ell([s * 0.6, 0.98, -1.12], [0.04, 0.04, 0.04], '#6b4a2a'), ell([s * 0.6, 0.96, 1.15], [0.045, 0.045, 0.045], '#6b4a2a')]),
    bumper(1.2, 0.28, 1.0), bumper(-0.95, 0.3, 1.0),
    seat(INK),
  ],
  // 14 owl · Night Owl: owl-eye headlights and a beak on the nose, feathered wings swept back, ear-tuft fins
  (a, l) => [
    box(1.2, 0.44, 1.7, 0.2, [0, 0.44, -0.05], a),
    box(0.95, 0.34, 0.5, 0.16, [0, 0.4, 0.88], l),
    ...pair(s => [cyl(0.17, 0.17, 0.06, [s * 0.22, 0.44, 1.12], W2, [90, 0, 0], 20), cyl(0.12, 0.12, 0.06, [s * 0.22, 0.44, 1.135], GOLD, [90, 0, 0], 18), cyl(0.06, 0.06, 0.06, [s * 0.22, 0.44, 1.15], INK, [90, 0, 0])]),
    cn(0.06, 0.16, [0, 0.4, 1.14], '#ffb547', [150, 0, 0], [1, 1, 0.6]),
    ...[0, 1, 2].flatMap(i => pair(s => ell([s * (0.68 + i * 0.08), 0.72 - i * 0.05, -0.32 - i * 0.12], [0.15, 0.045, 0.5 - i * 0.07], i % 2 ? '#c9a77f' : '#8c6a50', [10, -s * (14 + i * 14), s * (-6 - i * 5)]))),
    seat(INK),
    ...pair(s => cn(0.07, 0.22, [s * 0.32, 1.05, -0.66], '#8c6a50', [-8, 0, s * -25], [1, 1, 0.5])),
  ],
  // 15 chick · Egg Cracker: the chick rides in the bottom half of a cracked Easter egg with little wings
  (a, l) => {
    const shell = '#fff8ea';
    return [
      paint(xf(new THREE.SphereGeometry(1, 28, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), [0, 0.78, 0], undefined, [0.72, 0.6, 1.06]), shell),
      paint(xf(new THREE.CircleGeometry(1, 28), [0, 0.74, 0], [-90, 0, 0], [0.7, 1.04, 1]), '#f1dfb8'),
      ...ring(18, (t, i) => cn(0.15, i % 2 ? 0.12 : 0.22, [Math.sin(t) * 0.71, 0.75, Math.cos(t) * 1.05], shell, [0, t / D, 0], [1, 1, 0.12], 4)),
      tor(1, 0.05, [0, 0.5, 0], a, [90, 0, 0], [0.64, 0.95, 1]),
      tor(1, 0.03, [0, 0.38, 0], l, [90, 0, 0], [0.53, 0.78, 1]),
      ...pair(s => ell([s * 0.72, 0.62, -0.25], [0.06, 0.16, 0.32], '#ffe066', [24, 0, s * 18])),
    ];
  },
  // 16 cow · Moo Truck: cow spots, a pink muzzle nose, horns, milk bottles on the back deck
  (a) => [
    box(1.25, 0.5, 1.8, 0.12, [0, 0.45, -0.02], a),
    box(0.95, 0.32, 0.42, 0.13, [0, 0.38, 0.98], '#ffc0d0'),
    ...pair(s => ell([s * 0.2, 0.4, 1.19], [0.05, 0.07, 0.03], '#c0607a')),
    ...pair(s => tube([[s * 0.36, 0.64, 0.66], [s * 0.58, 0.74, 0.68], [s * 0.72, 0.94, 0.6]], t => 0.075 * (1 - t * 0.85), '#e8d8b0', 12)),
    ...[[0.63, 0.47, 0.35, 0.22], [0.63, 0.44, -0.45, 0.16], [-0.63, 0.46, 0.05, 0.26], [-0.63, 0.47, -0.62, 0.13]].map(([x, y, z, r]) => ell([x, y, z], [0.025, 0.1, r], INK)),
    ell([0.34, 0.7, 0.5], [0.12, 0.02, 0.16], INK), ell([-0.34, 0.7, 0.12], [0.1, 0.02, 0.14], INK),
    ...pair(s => [cyl(0.09, 0.09, 0.24, [s * 0.42, 0.82, -0.84], W2), cyl(0.05, 0.07, 0.06, [s * 0.42, 0.97, -0.84], W2, undefined, 10), cyl(0.055, 0.055, 0.03, [s * 0.42, 1.01, -0.84], '#4fa8ff', undefined, 10)]),
    bumper(-0.97),
    seat(INK),
  ],
  // 17 sheep · Cloud Puff: wool-cloud fenders on every wheel, puffs round the cockpit, a cloud spoiler
  (a, l) => {
    const puff = (p, r, c = W2) => ell(p, [r, r * 0.9, r], c, undefined, 10), wool = '#f1ecf8';
    return [
      box(1.2, 0.4, 1.7, 0.17, [0, 0.42, 0], a),
      box(0.9, 0.3, 0.5, 0.14, [0, 0.36, 0.95], l),
      ...[[0.72, 0.62], [0.74, -0.6]].flatMap(([x, z]) => pair(s => [puff([s * x, 0.66, z - 0.2], 0.19), puff([s * x, 0.72, z + 0.1], 0.21, wool), puff([s * (x - 0.12), 0.64, z + 0.25], 0.16)])),
      ...[-0.25, 0.25].flatMap(z => pair(s => puff([s * 0.5, 0.66, z], 0.15, wool))),
      ...pair(s => rod([s * 0.3, 0.6, -0.8], [s * 0.3, 0.95, -0.98], 0.025, INK, 6)),
      ...[-0.36, 0, 0.36].map((x, i) => puff([x, 1.02 + (i % 2) * 0.04, -1.0], 0.17, i % 2 ? W2 : wool)),
      bumper(1.24),
      seat(l),
    ];
  },
  // 18 raccoon · Trash Bandit: a bandit mask across the nose, a ringed tail, a trash-can lid for a spoiler
  (a, l) => [
    box(1.25, 0.42, 1.75, 0.17, [0, 0.42, 0], a),
    box(0.95, 0.3, 0.55, 0.14, [0, 0.36, 0.95], l),
    box(1.0, 0.15, 0.1, 0.05, [0, 0.42, 1.2], '#3a3550'),
    ...pair(s => ell([s * 0.24, 0.43, 1.25], [0.09, 0.055, 0.03], '#eaf6ff')),
    tube([[-0.42, 0.5, -0.86], [-0.56, 0.6, -1.22], [-0.52, 0.88, -1.5], [-0.4, 1.12, -1.56], [-0.32, 1.26, -1.42]], t => 0.03 + 0.16 * Math.sin(Math.PI * t) ** 0.6, t => (t * 7 | 0) % 2 ? '#3a3550' : '#a0a0b8', 28, 10),
    ...pair(s => rod([s * 0.2, 0.6, -0.7], [s * 0.2, 1.0, -1.0], 0.025, INK, 6)),
    cyl(0.32, 0.32, 0.05, [0, 1.03, -1.08], '#a8b0c0', [8, 0, 0], 22),
    tor(0.32, 0.025, [0, 1.03, -1.08], '#8a92a4', [98, 0, 0]),
    box(0.22, 0.06, 0.05, 0.02, [0, 1.09, -1.07], '#8a92a4', [8, 0, 0]),
    bumper(-0.97),
    seat(INK),
  ],
  // 19 hamster · Wheel Runner: a sunflower grille and a spinning hamster wheel on the back (its wind-up key)
  (a, l) => {
    const R = 0.42, hub = [0, 0.8, -1.12, 2], at = (x, t) => [x, 0.8 + Math.cos(t) * R, -1.12 + Math.sin(t) * R];
    const wheel = [-0.26, 0.26].flatMap(x => [tor(R, 0.035, [x, 0.8, -1.12], CHROME, [0, 90, 0]), ...[0, 1, 2].map(i => rod(at(x, i * Math.PI / 3), at(x, i * Math.PI / 3 + Math.PI), 0.018, CHROME, 5))]);
    return [
      box(1.2, 0.44, 1.55, 0.2, [0, 0.42, 0.1], a),
      box(0.95, 0.3, 0.5, 0.15, [0, 0.36, 0.98], l),
      cyl(0.13, 0.13, 0.06, [0, 0.4, 1.24], '#6b3e1e', [90, 0, 0], 16),
      ...ring(10, t => ell([Math.sin(t) * 0.2, 0.4 + Math.cos(t) * 0.2, 1.23], [0.05, 0.1, 0.02], '#ffd23a', [0, 0, -t / D])),
      ...pair(s => rod([s * 0.34, 0.56, -0.5], [s * 0.34, 0.8, -1.12], 0.035, INK, 6)),
      rod([-0.36, 0.8, -1.12], [0.36, 0.8, -1.12], 0.03, INK, 6),
      ...[...wheel, ...ring(12, t => rod(at(-0.26, t), at(0.26, t), 0.022, a, 6))].map(g => spin(g, hub)),
      seat(INK, -0.52),
    ];
  },
];

const kartCache = new Map();
function kartGeo(k, accent) {
  if (kartCache.has(k)) return kartCache.get(k);
  const mix = (b, t) => '#' + COL.set(accent).lerp(new THREE.Color(b), t).getHexString();
  const parts = KARTS[k](accent, mix('#fff', 0.22), mix(INK, 0.3));
  // shared chassis: steering wheel, axles, four wheels (dark tyre, accent hubcap, a white bolt so the spin shows)
  parts.push(tor(0.15, 0.035, [0, 0.86, 0.36], INK, [-55, 0, 0]), rod([0, 0.55, 0.6], [0, 0.86, 0.37], 0.03, INK, 6));
  for (const z of [0.62, -0.6]) parts.push(rod([-0.7, 0.31, z], [0.7, 0.31, z], 0.045, INK, 6));
  for (const [x, z] of [[-0.72, 0.62], [0.72, 0.62], [-0.74, -0.6], [0.74, -0.6]]) {
    const piv = [x, 0.31, z, 2], s = Math.sign(x);
    parts.push(paint(xf(new THREE.CylinderGeometry(0.31, 0.31, 0.27, 18), [x, 0.31, z], [0, 0, 90]), '#2b2140', undefined, piv));
    parts.push(paint(xf(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 14), [x + s * 0.135, 0.31, z], [0, 0, 90]), accent, undefined, piv));
    parts.push(paint(xf(sphere(8), [x + s * 0.16, 0.41, z], [0, 0, 0], [0.04, 0.04, 0.04]), '#ffffff', undefined, piv)); // a bolt, so the spin shows
  }
  // the wind-up key on the tail: shaft + two loops, spinning with speed (signature detail; the hamster's is its wheel)
  if (SPECIES[k].name !== 'hamster') {
    const kp = [0, 0.62, -1.2, 1];
    parts.push(paint(xf(new THREE.CylinderGeometry(0.045, 0.045, 0.36, 8), [0, 0.62, -1.05], [90, 0, 0]), '#e09a12', undefined, kp));
    for (const s of [-1, 1]) parts.push(paint(xf(new THREE.TorusGeometry(0.13, 0.05, 8, 18), [s * 0.15, 0.62, -1.24], [0, 0, 0], [1, 0.8, 1]), GOLD, undefined, kp));
  }
  const geo = mergeGeometries(parts);
  geo.computeBoundingSphere();
  kartCache.set(k, geo);
  return geo;
}

// ---------- racer: kart + animal + dizzy stars, with the animation API world.js drives ----------
let starTex = null;
const starTexture = () => starTex ||= (() => {
  const c = document.createElement('canvas'), g = c.getContext('2d');
  c.width = c.height = 64;
  g.translate(32, 32); g.fillStyle = '#ffe45e'; g.strokeStyle = '#7a3a0c'; g.lineWidth = 4; g.lineJoin = 'round';
  g.beginPath();
  for (let i = 0; i < 10; i++) { const r = i % 2 ? 11 : 26, a = i * Math.PI / 5 - Math.PI / 2; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  g.closePath(); g.stroke(); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();

export function makeRacer(k, accent, { lite = false } = {}) {
  const root = new THREE.Group();
  const uni = { uKey: { value: 0 }, uWheel: { value: 0 } };
  const kmat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.3, metalness: 0.08 });
  kmat.onBeforeCompile = sh => spinShader(sh, uni);
  kmat.customProgramCacheKey = () => 'kart';
  const kg = kartGeo(k, accent);
  const kart = new THREE.Mesh(kg, kmat);
  root.add(kart);
  if (!lite) root.add(new THREE.Mesh(kg, outlineMat(uni)));

  const body = new THREE.Group();
  body.position.fromArray(SEAT);
  const ag = animalGeo(k);
  const amat = lite ? new THREE.MeshLambertMaterial({ vertexColors: true, map: faceTex(k) })
    : new THREE.MeshStandardMaterial({ vertexColors: true, map: faceTex(k), roughness: 0.38, metalness: 0 });
  const ani = new THREE.Mesh(ag, amat);
  body.add(ani);
  if (!lite) body.add(new THREE.Mesh(ag, outlineMat()));
  // dizzy stars: one Points object, three stars orbiting the head while stunned
  const sp = SPECIES[k], headTop = 0.62 + 2 * sp.head[3] * U;
  const stars = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3)),
    new THREE.PointsMaterial({ map: starTexture(), size: 0.28, transparent: true, depthWrite: false, alphaTest: 0.05 }));
  stars.visible = false; stars.frustumCulled = false;
  body.add(stars);
  root.add(body);
  root.traverse(o => { o.userData.shared = true; }); // cached geometry / face textures: dispose() below handles the rest

  let mood = 'normal', shown = 'normal', blinkAt = 3 + Math.random() * 4, blinkEnd = 0, blink2 = 0, t = Math.random() * 10, squash = 0, spin = 0;
  const api = {
    root, body, animal: k, headTop,
    setMood(m) { mood = m; },
    outlines(on) { root.traverse(o => { if (o.material?.side === THREE.BackSide) o.visible = on; }); },
    squash(q) { squash = Math.max(squash, q); },
    // st: { v, steer, boost, stun, idle }
    update(dt, st) {
      t += dt;
      uni.uWheel.value = (uni.uWheel.value - st.v * dt / 0.31) % (Math.PI * 2);
      uni.uKey.value = (uni.uKey.value + (1.5 + Math.abs(st.v) * 0.35) * dt) % (Math.PI * 2);
      // face: blink every 3-7 s (1 in 3 a double blink, like Ladder), hurt while stunned, focus while boosting
      let want = mood;
      if (mood === 'normal') {
        if (st.stun > 0) want = 'hurt';
        else if (st.soot > 0) want = 'soot';
        else if (st.boost > 0) want = 'focus';
        if (t > blinkAt) { blinkEnd = t + 0.09; blink2 = Math.random() < 0.33 ? t + 0.22 : 0; blinkAt = t + 3 + Math.random() * 4; }
        if (blink2 && t > blink2) { blinkEnd = t + 0.09; blink2 = 0; }
        if (t < blinkEnd && want === 'normal') want = 'blink';
      }
      if (want !== shown) { amat.map = faceTex(k, want); shown = want; }
      // waddle at rest (Ladder rider()), lean into the steer, bob with speed, squash on landings / bumps
      const idle = Math.abs(st.v) < 1 ? 1 : 0;
      squash *= Math.exp(-9 * dt);
      const q = squash * Math.sin(t * 30) * 0.5 + squash * 0.5;
      body.rotation.z = st.steer * 0.25 + idle * Math.sin(t / 0.13) * 0.14;
      body.position.y = SEAT[1] + Math.abs(Math.sin(t * 9)) * 0.025 * Math.min(1, Math.abs(st.v) / 10);
      body.scale.set(1 + q * 0.6, 1 - q, 1 + q * 0.6);
      // stun: spin round with dizzy stars orbiting the head
      if (st.stun > 0) spin += dt * 14; else spin = THREE.MathUtils.damp(spin, Math.round(spin / (2 * Math.PI)) * 2 * Math.PI, 8, dt);
      ani.rotation.y = spin;
      stars.visible = st.stun > 0;
      if (stars.visible) {
        const a = stars.geometry.attributes.position;
        for (let i = 0; i < 3; i++) { const ang = t * 5 + i * 2.094; a.setXYZ(i, Math.cos(ang) * 0.38, headTop + 0.08 + Math.sin(t * 7 + i) * 0.04, Math.sin(ang) * 0.38); }
        a.needsUpdate = true;
      }
    },
    dispose() { kmat.dispose(); amat.dispose(); stars.geometry.dispose(); stars.material.dispose(); root.traverse(o => { if (o.material?.side === THREE.BackSide) o.material.dispose(); }); },
  };
  return api;
}

export function crown() {
  const gold = '#ffd54a', parts = [paint(new THREE.CylinderGeometry(0.2, 0.22, 0.12, 20, 1, true), gold)];
  for (let i = 0; i < 5; i++) {
    const ang = i / 5 * Math.PI * 2;
    parts.push(paint(xf(cone(0.06, 0.16), [Math.sin(ang) * 0.2, 0.05, Math.cos(ang) * 0.2]), gold));
    parts.push(paint(xf(sphere(8), [Math.sin(ang) * 0.2, 0.22, Math.cos(ang) * 0.2], [0, 0, 0], [0.03, 0.03, 0.03]), '#fff6c4'));
    parts.push(paint(xf(sphere(8), [Math.sin(ang + 0.63) * 0.215, 0, Math.cos(ang + 0.63) * 0.215], [0, 0, 0], [0.032, 0.032, 0.02]), i ? '#4fd8ff' : '#ff5d8f'));
  }
  const m = new THREE.Mesh(mergeGeometries(parts.map(g => g.index ? g : g.toNonIndexed())), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.25, metalness: 0.7, emissive: '#7a4a00', emissiveIntensity: 0.25 }));
  m.add(new THREE.Mesh(m.geometry, outlineMat()));
  return m;
}
