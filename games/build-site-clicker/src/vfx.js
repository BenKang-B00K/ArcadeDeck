import * as THREE from 'three';
import { CYAN } from './toon.js';
import { emit, initParticles, particlesUpdate } from './particles.js';

export const ease = {
  out: t => 1 - Math.pow(1 - t, 3), in: t => t * t * t,
  io: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  back: t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
  elastic: t => t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1,
};
export const lerp = (a, b, t) => a + (b - a) * t;

// ---------- tween list ----------
const fx = [];
let now = 0;
export const tween = (dur, fn, done) => fx.push({ t: 0, dur, fn, done });
export const delay = (dur, done) => tween(dur, () => {}, done);
export function fxUpdate(dt) {
  now += dt;
  particlesUpdate(dt);
  for (let i = fx.length - 1; i >= 0; i--) {
    const f = fx[i]; f.t += dt; const k = Math.min(f.t / f.dur, 1);
    f.fn(k, dt); if (k >= 1) { f.done?.(); fx.splice(i, 1); }
  }
}

export const shake = { amt: 0, stop: 0 }; // read by the scene loop: world offset + hit-stop

let scene;
const flashLight = new THREE.PointLight(CYAN, 0, 3, 2);
export function initVfx(s) { scene = s; scene.add(flashLight); initParticles(s); }

const tmp = new THREE.Vector3(), BACK = new THREE.Vector3(0, 0, -1), FLAT = new THREE.Euler(-Math.PI / 2, 0, 0);
const addMat = extra => new THREE.MeshBasicMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, ...extra });
const kill = m => { scene.remove(m); m.material.dispose(); };

// canvas textures: soft glow + crack decal
function canvasTex(size, draw) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  draw(cv.getContext('2d'), size); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const glowTex = canvasTex(64, (g, s) => {
  const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.3, 'rgba(255,255,255,0.6)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, s, s);
});
const crackTex = canvasTex(128, (g, s) => {
  const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  r.addColorStop(0, 'rgba(0,0,0,0.75)'); r.addColorStop(0.5, 'rgba(0,0,0,0.25)'); r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r; g.fillRect(0, 0, s, s);
  g.strokeStyle = 'rgba(10,20,30,0.9)'; g.lineWidth = 2;
  for (let i = 0; i < 7; i++) { // jagged radial cracks
    let x = s / 2, y = s / 2, a = i / 7 * Math.PI * 2 + Math.random();
    g.beginPath(); g.moveTo(x, y);
    for (let j = 0; j < 4; j++) { a += (Math.random() - .5) * 1.2; const l = 8 + Math.random() * 12; x += Math.cos(a) * l; y += Math.sin(a) * l; g.lineTo(x, y); }
    g.stroke();
  }
});

// ---------- primitives ----------
const ringGeo = new THREE.RingGeometry(0.7, 1, 40), ringThin = new THREE.RingGeometry(0.9, 1, 40);
export function ring(pos, rot, size, dur = 0.35, thin = false) {
  const m = new THREE.Mesh(thin ? ringThin : ringGeo, addMat({ color: new THREE.Color(0.4, 2, 2.5) }));
  m.position.copy(pos); m.rotation.copy(rot); m.scale.setScalar(0.001); scene.add(m);
  tween(dur, k => { m.scale.setScalar(size * ease.out(k)); m.material.opacity = 1 - k; }, () => kill(m));
}

export function lightFlash(pos, I, dur = 0.18) { flashLight.position.copy(pos); tween(dur, k => flashLight.intensity = I * (1 - k)); }

export function flashSprite(pos, s0, s1, dur = 0.08) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: new THREE.Color(0.8, 2.5, 3), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  sp.position.copy(pos); scene.add(sp);
  tween(dur, k => { const s = lerp(s0, s1, ease.out(k)); sp.scale.set(s, s, 1); sp.material.opacity = 1 - k; }, () => kill(sp));
}

const beamGeo = new THREE.CylinderGeometry(0.1, 0.1, 6, 12, 1, true);
export function beam(pos, dur = 0.45) {
  const m = new THREE.Mesh(beamGeo, addMat({ color: new THREE.Color(0.2, 1.1, 1.4), opacity: 0.35 }));
  m.position.set(pos.x, pos.y + 3, pos.z); scene.add(m);
  tween(dur, k => { m.scale.set(1 - k, 1, 1 - k); m.material.opacity = 0.35 * (1 - k); }, () => kill(m));
}

export function flash(ref, v, dur) { ref.value = v; tween(dur, k => ref.value = v * (1 - k)); }

// crack decal on a -z-facing face; ≤12 live
const decalGeo = new THREE.PlaneGeometry(1, 1), decals = [];
export function decal(pos, size, life = 2) {
  const m = new THREE.Mesh(decalGeo, new THREE.MeshBasicMaterial({ map: crackTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  m.position.set(pos.x, pos.y, pos.z - 0.01); m.rotation.set(0, Math.PI, Math.random() * 6.28); m.scale.setScalar(size); scene.add(m);
  decals.push(m); if (decals.length > 12) kill(decals.shift());
  tween(life, k => m.material.opacity = 1 - k * k, () => { const i = decals.indexOf(m); if (i >= 0) { decals.splice(i, 1); kill(m); } });
}

export function pop(obj, dur = 0.2) { obj.scale.setScalar(0.001); tween(dur, k => obj.scale.setScalar(ease.back(k))); }
export function punch(obj, amt = 0.06, dur = 0.12) { tween(dur, k => obj.scale.setScalar(1 + amt * Math.sin(k * Math.PI))); }

// ---------- hammer burst: level 0 hit · 1 phase pop · 2 floor done · 3 landmark clear ----------
const LV = [
  { stop: 0.05, shake: 0.05, ring: 0.6, spark: 20, debris: 6, dust: 6, light: 5, sprite: 0.8 },
  { stop: 0.08, shake: 0.075, ring: 0.9, spark: 50, debris: 14, dust: 12, light: 8, sprite: 1.2 },
  { stop: 0.12, shake: 0.11, ring: 1.3, spark: 90, debris: 24, dust: 12, light: 12, sprite: 1.6 },
  { stop: 0.2, shake: 0.15, ring: 2.0, spark: 200, debris: 40, dust: 24, light: 20, sprite: 2.2 },
];
let lastStop = -1;
export function burst(hp, level = 0, { flash: flashRef = null, color = 0xb8bcc8, mult = 1, feet = null } = {}) {
  const L = LV[Math.min(level, 3)];
  if (now - lastStop > 0.15) { shake.stop = L.stop; lastStop = now; } // one hit-stop per 150 ms, whoever hits
  shake.amt = Math.max(shake.amt, Math.min(0.15, L.shake * mult));
  if (flashRef) flash(flashRef, 0.6, 0.12);
  flashSprite(hp, 0.3 * mult, L.sprite * mult);
  ring(hp, new THREE.Euler(), L.ring * mult);
  if (level >= 1) delay(0.06, () => ring(hp, new THREE.Euler(), L.ring * 0.7 * mult, 0.25, true));
  emit.spark(hp, Math.round(L.spark * mult), { dir: BACK, speed: 3 + level });
  emit.debris(hp, Math.round(L.debris * mult), color, { dir: BACK });
  emit.dust(hp, L.dust);
  if (feet) emit.dust(tmp.set(feet.x, feet.y + 0.02, feet.z), 4, { speed: 0.5 });
  lightFlash(hp, L.light * mult);
  decal(hp, (0.25 + 0.12 * level) * mult, level >= 1 ? 4 : 2);
}

// level clear: 3 firework bursts over the roof + ground dust wave
const FW = [new THREE.Color(1.2, 3, 3.5), new THREE.Color(3.5, 1.6, 0.4), new THREE.Color(3, 3, 3)];
export function fireworks(top) {
  FW.forEach((col, i) => delay(0.2 * i + 0.01, () => {
    const p = new THREE.Vector3(top.x + (Math.random() - .5) * 1.5, top.y + 0.8 + Math.random(), top.z + (Math.random() - .5) * 1.5);
    emit.spark(p, 200, { speed: 4, spread: 1.5, color: col, life: 0.7 });
    flashSprite(p, 0.5, 3, 0.15); lightFlash(p, 15, 0.4);
  }));
  const c = new THREE.Color(0.6, 0.55, 0.5), v = new THREE.Vector3(), p = new THREE.Vector3();
  for (let k = 0; k < 32; k++) {
    const a = k / 32 * Math.PI * 2;
    p.set(Math.cos(a) * 0.8, 0.05, Math.sin(a) * 0.8); v.set(Math.cos(a) * 2.5, 0.4, Math.sin(a) * 2.5);
    emit.at('dust', p, v, 1.2, 0.35, c);
  }
  ring(new THREE.Vector3(0, 0.05, 0), FLAT, 3.5, 0.7);
}

// ---------- hammer trail: ribbon between two tracked points over last N frames ----------
const TN = 12;
const trailMat = new THREE.ShaderMaterial({
  uniforms: { uAlpha: { value: 0 }, uColor: { value: new THREE.Color(CYAN) } },
  vertexShader: `attribute float aFade; varying float vF;
    void main() { vF = aFade; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform vec3 uColor; uniform float uAlpha; varying float vF;
    void main() { gl_FragColor = vec4(uColor * 2.5, vF * vF * uAlpha); }`,
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
});
const tFade = new Float32Array(TN * 2), tIdx = [];
for (let i = 0; i < TN; i++) tFade[i * 2] = tFade[i * 2 + 1] = 1 - i / (TN - 1);
for (let i = 0; i < TN - 1; i++) { const a = i * 2; tIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
export function makeTrail() {
  const pos = new Float32Array(TN * 6);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aFade', new THREE.BufferAttribute(tFade, 1));
  geo.setIndex(tIdx);
  const mat = trailMat.clone();
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; scene.add(mesh);
  return {
    push(a, b, reset) {
      if (reset) for (let i = 0; i < TN; i++) { a.toArray(pos, i * 6); b.toArray(pos, i * 6 + 3); }
      else { pos.copyWithin(6, 0, (TN - 1) * 6); a.toArray(pos, 0); b.toArray(pos, 3); }
      geo.attributes.position.needsUpdate = true;
    },
    alpha(v) { mat.uniforms.uAlpha.value = v; },
    dispose() { scene.remove(mesh); geo.dispose(); mat.dispose(); },
  };
}
