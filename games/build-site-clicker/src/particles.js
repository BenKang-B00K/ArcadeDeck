import * as THREE from 'three';

// Stateless GPU particle pools: CPU writes attributes only on emit; the vertex shader integrates
// pos = p0 + v·(1-e^(-drag·t))/drag + ½g·t² from (uTime - aBirth). One draw call per type.

const VERT = `
attribute vec3 aPos0; attribute vec3 aVel; attribute float aBirth; attribute float aLife; attribute float aSize; attribute vec3 aColor; attribute float aSeed;
uniform float uTime; uniform vec3 uGravity; uniform float uDrag;
varying vec3 vColor; varying float vK; varying vec2 vUv; varying float vSeed;
mat3 rot(vec3 a, float t) { float c = cos(t), s = sin(t), o = 1.0 - c;
  return mat3(o*a.x*a.x+c, o*a.x*a.y+a.z*s, o*a.x*a.z-a.y*s, o*a.x*a.y-a.z*s, o*a.y*a.y+c, o*a.y*a.z+a.x*s, o*a.x*a.z+a.y*s, o*a.y*a.z-a.x*s, o*a.z*a.z+c); }
void main() {
  float t = uTime - aBirth, k = t / aLife;
  if (t < 0.0 || k > 1.0) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }
  vec3 disp = uDrag > 0.001 ? aVel * (1.0 - exp(-uDrag * t)) / uDrag : aVel * t;
  vec3 p = aPos0 + disp + 0.5 * uGravity * t * t;
  #ifdef FLUTTER
  p.x += sin(t * 7.0 + aSeed * 6.28) * 0.12; p.z += cos(t * 5.0 + aSeed * 3.1) * 0.08;
  #endif
  vColor = aColor; vK = k; vUv = uv; vSeed = aSeed;
  #ifdef MESH
  vec3 axis = normalize(vec3(sin(aSeed * 7.0) + 0.1, cos(aSeed * 5.0), sin(aSeed * 3.0)));
  mat3 R = rot(axis, t * (5.0 + aSeed * 6.0));
  vColor *= 0.45 + 0.55 * max(dot(R * normal, normalize(vec3(0.5, 1.0, 0.4))), 0.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p + R * (position * aSize * SIZE), 1.0);
  #else
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vec2 q = position.xy;
  #ifdef STRETCH
  vec3 v = aVel * exp(-uDrag * t) + uGravity * t;
  vec3 vv = (modelViewMatrix * vec4(v, 0.0)).xyz;
  vec2 d = normalize(vv.xy + vec2(1e-4, 0.0));
  q.x *= clamp(length(vv) * 0.9, 1.0, 6.0);
  q = vec2(q.x * d.x - q.y * d.y, q.x * d.y + q.y * d.x);
  #endif
  #ifdef SPIN
  float a = t * (4.0 + aSeed * 5.0); q = vec2(q.x * cos(a) - q.y * sin(a), q.x * sin(a) + q.y * cos(a));
  #endif
  mv.xy += q * aSize * SIZE;
  gl_Position = projectionMatrix * mv;
  #endif
}`;
const FRAG = `
varying vec3 vColor; varying float vK; varying vec2 vUv; varying float vSeed;
void main() {
  float a = 1.0;
  #ifdef ROUND
  float r = length(vUv - 0.5) * 2.0; if (r > 1.0) discard; a = 1.0 - r * r;
  #endif
  gl_FragColor = vec4(vColor, a * (FADE));
}`;

const TYPES = {
  spark:    { n: 2000, cap: 300, defines: { STRETCH: 1, SIZE: '(1.0 - k)', FADE: '(1.0 - vK)' }, gravity: [0, -9, 0], drag: 1.5, blend: 'add' },
  dust:     { n: 600, cap: 100, defines: { ROUND: 1, SIZE: '(0.6 + 1.4 * k)', FADE: '((1.0 - vK) * 0.5)' }, gravity: [0, -0.8, 0], drag: 3, blend: 'normal' },
  debris:   { n: 400, cap: 80, geo: 'box', defines: { MESH: 1, SIZE: '(1.0 - k * k * k)', FADE: '1.0' }, gravity: [0, -9, 0], drag: 0.5, blend: 'opaque' },
  ember:    { n: 800, cap: 120, defines: { ROUND: 1, SIZE: '(1.0 - k * k)', FADE: '((0.6 + 0.4 * sin(vK * 40.0 + vSeed * 20.0)) * (1.0 - vK))' }, gravity: [0, 0, 0], drag: 0, blend: 'add' },
  confetti: { n: 600, cap: 120, defines: { FLUTTER: 1, SPIN: 1, SIZE: '1.0', FADE: '(1.0 - smoothstep(0.8, 1.0, vK))' }, gravity: [0, -2.5, 0], drag: 2.5, blend: 'normal' },
};

const T = { value: 0 }; // game time, shared by all pools
const ATTRS = [['aPos0', 3], ['aVel', 3], ['aBirth', 1], ['aLife', 1], ['aSize', 1], ['aColor', 3], ['aSeed', 1]];

class Pool {
  constructor(scene, cfg) {
    const base = cfg.geo === 'box' ? new THREE.BoxGeometry(1, 1, 1) : new THREE.PlaneGeometry(1, 1);
    const g = new THREE.InstancedBufferGeometry();
    g.index = base.index;
    for (const k in base.attributes) g.setAttribute(k, base.attributes[k]);
    this.n = cfg.n; this.head = 0; this.cap = cfg.cap; this.count = 0; this.lo = Infinity; this.hi = -1;
    this.a = {};
    for (const [k, sz] of ATTRS) {
      const arr = new Float32Array(this.n * sz);
      if (k === 'aBirth') arr.fill(-1e9);
      if (k === 'aLife') arr.fill(1);
      this.a[k] = new THREE.InstancedBufferAttribute(arr, sz).setUsage(THREE.DynamicDrawUsage);
      g.setAttribute(k, this.a[k]);
    }
    g.instanceCount = this.n;
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, defines: cfg.defines,
      uniforms: { uTime: T, uGravity: { value: new THREE.Vector3(...cfg.gravity) }, uDrag: { value: cfg.drag } },
      transparent: cfg.blend !== 'opaque', depthWrite: cfg.blend === 'opaque', side: THREE.DoubleSide,
      blending: cfg.blend === 'add' ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    const m = new THREE.Mesh(g, mat); m.frustumCulled = false; scene.add(m);
  }
  emit(p, v, life, size, color, seed = Math.random()) {
    if (this.count++ >= this.cap) return; // per-frame cap
    const i = this.head++ % this.n, a = this.a;
    p.toArray(a.aPos0.array, i * 3); v.toArray(a.aVel.array, i * 3); color.toArray(a.aColor.array, i * 3);
    a.aBirth.array[i] = T.value; a.aLife.array[i] = life; a.aSize.array[i] = size; a.aSeed.array[i] = seed;
    if (i < this.lo) this.lo = i; if (i > this.hi) this.hi = i;
  }
  // upload only the slots touched this frame (a ring wrap just widens the range), not the whole pool
  flush() {
    if (this.hi >= 0) for (const k in this.a) { const at = this.a[k]; at.clearUpdateRanges(); at.addUpdateRange(this.lo * at.itemSize, (this.hi - this.lo + 1) * at.itemSize); at.needsUpdate = true; }
    this.lo = Infinity; this.hi = -1; this.count = 0;
  }
}

const pools = {};
export function initParticles(scene) { for (const k in TYPES) pools[k] = new Pool(scene, TYPES[k]); }
export function particlesUpdate(dt) { T.value += dt; for (const k in pools) pools[k].flush(); }

const c = new THREE.Color(), v = new THREE.Vector3(), p = new THREE.Vector3();
const rnd = (a, b) => a + Math.random() * (b - a);
const randDir = (up = 0.3) => v.set(rnd(-1, 1), rnd(-1, 1) + up, rnd(-1, 1)).normalize();
const CONFETTI = [new THREE.Color(0.3, 2, 2.5), new THREE.Color(2.5, 1, 0.2), new THREE.Color(2, 2, 2)];

export const emit = {
  at(type, pos, vel, life, size, color) { pools[type].emit(pos, vel, life, size, color); },
  // cone away from `dir` (or omni when null)
  spark(pos, n, { dir = null, speed = 3, spread = 1, color = null, life = 0.4 } = {}) {
    for (let i = 0; i < n; i++) {
      randDir(0.4).multiplyScalar(spread); if (dir) v.addScaledVector(dir, 1.2);
      v.normalize().multiplyScalar(speed * rnd(0.5, 1.3));
      if (color) c.copy(color); else c.setRGB(1.2, rnd(2.5, 3.5), 3.5);
      pools.spark.emit(pos, v, life * rnd(0.7, 1.3), rnd(0.04, 0.07), c);
    }
  },
  dust(pos, n, { speed = 0.8, color = null } = {}) {
    for (let i = 0; i < n; i++) {
      p.copy(pos).addScaledVector(randDir(0), 0.05);
      randDir(1).multiplyScalar(speed * rnd(0.4, 1.2));
      if (color) c.copy(color); else c.setRGB(0.5, 0.46, 0.42).multiplyScalar(rnd(0.8, 1.2));
      pools.dust.emit(p, v, rnd(0.6, 1.0), rnd(0.15, 0.3), c);
    }
  },
  debris(pos, n, color, { dir = null, speed = 2.5 } = {}) {
    for (let i = 0; i < n; i++) {
      randDir(0.8); if (dir) v.addScaledVector(dir, 0.8);
      v.normalize().multiplyScalar(speed * rnd(0.4, 1.2));
      c.set(color).multiplyScalar(rnd(0.7, 1.1));
      pools.debris.emit(pos, v, rnd(0.5, 0.8), rnd(0.03, 0.07), c);
    }
  },
  ember(pos, n, { vel = null, life = 1.5, size = 0.02 } = {}) {
    for (let i = 0; i < n; i++) {
      if (vel) v.copy(vel); else v.set(rnd(-0.2, 0.2), rnd(0.2, 0.5), rnd(-0.2, 0.2));
      c.setRGB(0.3, 1.8, 2.2);
      pools.ember.emit(pos, v, life, size, c);
    }
  },
  confetti(pos, n) {
    for (let i = 0; i < n; i++) {
      randDir(0.6).multiplyScalar(rnd(1, 3));
      pools.confetti.emit(pos, v, rnd(1.5, 2.5), rnd(0.05, 0.08), CONFETTI[i % 3]);
    }
  },
};
