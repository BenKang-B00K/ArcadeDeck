import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { CYAN } from './toon.js';
import { initVfx, fxUpdate, shake, tween, ease } from './vfx.js';

// phones / small CPUs: lower DPR cap + shadow map. ?hq / ?lq force.
const Q = new URLSearchParams(location.search);
export const LOW = Q.has('lq') || (!Q.has('hq') && (matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4));
const HORIZON = 0x1c1a4c;

// renderer + post + 3-light rig + sky + holo ground + motes + frame loop (hit-stop, shake, ?slow=N, adaptive DPR)
export function createApp({ cam = [5, 3.4, -5], target = [0, 1.2, 0] } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' }); // MSAA lives on the composer target
  let dpr = Math.min(devicePixelRatio, LOW ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  document.body.prepend(renderer.domElement); // first in DOM → every fixed overlay paints above it

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(HORIZON);
  scene.fog = new THREE.Fog(HORIZON, 10, 26);
  // sky dome: horizon glow -> deep navy zenith + twinkling stars (not fogged, not shaken)
  const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: { uTime: { value: 0 }, uFog: { value: scene.fog.color } }, // horizon = fog colour (linear) so the ground melts into the sky
    vertexShader: `varying vec3 vD; void main() { vD = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }`,
    fragmentShader: `varying vec3 vD; uniform float uTime; uniform vec3 uFog;
      float h(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
      float h2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y); }
      float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      const vec3 MOON = normalize(vec3(-0.866, -0.08, 0.5)); // 15° right of the default iso view, top-right on screen (the camera looks down; higher is off-screen)
      void main() {
        float y = max(vD.y, 0.0), ay = abs(vD.y);
        vec3 c = mix(uFog, vec3(0.012, 0.01, 0.045), smoothstep(0.0, 0.7, ay)); // darkens up and down: void under the island
        c += vec3(0.05, 0.02, 0.09) * exp(-ay * 8.0);
        float s = h(floor(vD * 180.0));
        if (s > 0.996 && y > 0.12) c += vec3(0.7, 0.9, 1.0) * (s - 0.996) * 250.0 * (0.6 + 0.4 * sin(uTime * 2.0 + s * 900.0)) * smoothstep(0.12, 0.35, y);
        // cloud band: fbm projected on a flat layer, thick near the horizon, thinning upward; lit rims toward the moon
        float md = dot(vD, MOON);
        vec2 cp = vD.xz / (abs(vD.y) + 0.18) * 1.6; // static: uTime wraps at 100 s, drift would jump
        float n = fbm(cp), band = smoothstep(0.42, 0.0, abs(vD.y)); // clouds above and below the island
        float cl = smoothstep(0.45, 0.75, n) * band;
        vec3 cc = mix(vec3(0.05, 0.04, 0.16), vec3(0.16, 0.14, 0.4), smoothstep(0.55, 0.9, n)) + vec3(0.12, 0.14, 0.3) * pow(max(md, 0.0), 6.0);
        c = mix(c, cc, cl * 0.85);
        c += vec3(0.35, 0.4, 0.75) * pow(max(md, 0.0), 60.0) * 0.6;                   // halo
        c = mix(c, vec3(0.85, 0.9, 1.1) - 0.12 * vn(vD.xy * 90.0), smoothstep(0.99950, 0.99965, md)); // disc + craters
        gl_FragColor = vec4(c, 1.0);
      }`,
  }));
  sky.renderOrder = -1; sky.frustumCulled = false; scene.add(sky);
  const world = new THREE.Group(); scene.add(world); // shaken on impact; one-shot vfx live in `scene`
  initVfx(scene);

  const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 400);
  camera.position.set(...cam);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(...target);
  controls.enableDamping = true;
  controls.mouseButtons.LEFT = null; // left button is for clicking only (fast clicks jittered into orbits); orbit with Q/E, touch still orbits
  controls.maxPolarAngle = Math.PI * 0.47; controls.minDistance = 2; controls.maxDistance = 80; // stay above ground on touch drags / pinches
  // keyboard camera: Q/E orbit, A/D strafe (= right-drag pan), W/S zoom (= wheel)
  const keys = new Set(), _v = new THREE.Vector3(), _q = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0);
  addEventListener('keydown', e => { if (!e.repeat && !e.ctrlKey && !e.metaKey) keys.add(e.code); });
  addEventListener('keyup', e => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());
  const keyCam = dt => {
    const turn = (keys.has('KeyQ') - keys.has('KeyE')) * 1.6 * dt, move = (keys.has('KeyD') - keys.has('KeyA'));
    if (turn) { _v.subVectors(camera.position, controls.target).applyQuaternion(_q.setFromAxisAngle(UP, turn)); camera.position.addVectors(controls.target, _v); }
    if (move) {
      _v.setFromMatrixColumn(camera.matrix, 0).setY(0).normalize().multiplyScalar(move * camera.position.distanceTo(controls.target) * 0.8 * dt);
      camera.position.add(_v); controls.target.add(_v);
    }
    const zoom = keys.has('KeyS') - keys.has('KeyW'); // exponential dolly, clamped like wheel zoom
    if (zoom) {
      _v.subVectors(camera.position, controls.target);
      _v.setLength(Math.min(controls.maxDistance, Math.max(controls.minDistance, _v.length() * Math.exp(zoom * 1.2 * dt))));
      camera.position.addVectors(controls.target, _v);
    }
  };

  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }));
  composer.setPixelRatio(dpr); composer.setSize(innerWidth, innerHeight);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.6, 0.45, 1.6));
  // lens: vignette + slight cool grade + fine animated grain (hides banding in the dark sky)
  const lens = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uTime: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime; varying vec2 vUv;
      void main() {
        vec4 c = texture2D(tDiffuse, vUv);
        float v = smoothstep(0.85, 0.2, length((vUv - 0.5) * vec2(1.1, 1.0)));
        c.rgb *= mix(0.55, 1.0, v);
        c.rgb = mix(c.rgb, c.rgb * vec3(0.94, 1.0, 1.08), 0.5);
        c.rgb += (fract(sin(dot(vUv * 1000.0 + uTime, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.012;
        gl_FragColor = c;
      }`,
  });
  composer.addPass(lens);
  composer.addPass(new OutputPass());

  world.add(new THREE.HemisphereLight(0x8a7aff, 0x2a1840, 0.9));
  const key = new THREE.DirectionalLight(0xffd9a0, 2.1);
  key.position.set(4, 7, 3);
  key.castShadow = true;
  key.shadow.mapSize.setScalar(LOW ? 1024 : 2048);
  key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02;
  world.add(key, key.target);
  const KEY_DIR = key.position.clone().normalize();
  const rim = new THREE.DirectionalLight(CYAN, 1.4);
  rim.position.set(-4, 3, -4);
  world.add(rim);

  // floating voxel island: walkable tile top (flush at y=0, level colour) over a jagged dark-rock underside. 2 instanced draws.
  const IR = 11, cells = [];
  for (let x = -IR; x <= IR; x++) for (let z = -IR; z <= IR; z++) { const r = Math.hypot(x, z); if (r < IR - Math.random() * 1.2) cells.push([x, z, r]); }
  const cube = new THREE.BoxGeometry(1, 1, 1).translate(0, -0.5, 0), m4 = new THREE.Matrix4(), col = new THREE.Color();
  const topMat = new THREE.MeshStandardMaterial({ roughness: 0.95 }), rockMat = new THREE.MeshStandardMaterial({ color: 0x3a2a3a, roughness: 1 });
  const tops = new THREE.InstancedMesh(cube, topMat, cells.length), rock = new THREE.InstancedMesh(cube, rockMat, cells.length);
  const topShade = cells.map(() => 0.85 + Math.random() * 0.3);
  cells.forEach(([x, z, r], i) => {
    const drop = r > 9.5 && Math.random() < 0.35 ? 0.2 + Math.random() * 0.2 : 0; // broken rim, outside every walk path
    tops.setMatrixAt(i, m4.makeScale(1, 0.3, 1).setPosition(x, -drop, z));
    const d = 0.6 + (1 - r / IR) ** 1.5 * 7 * (0.6 + Math.random() * 0.6);         // deeper toward the centre
    rock.setMatrixAt(i, m4.makeScale(1, d, 1).setPosition(x, -0.3 - drop, z));
    rock.setColorAt(i, col.setHSL(0.8 + Math.random() * 0.08, 0.18, 0.12 + Math.random() * 0.1));
  });
  tops.receiveShadow = true;
  const ground = new THREE.Group(); ground.add(tops, rock); world.add(ground);
  const setGround = (c, k) => { // level colour with per-tile jitter; bigger cycles = longer bridges = wider island
    const base = new THREE.Color(c);
    topShade.forEach((v, i) => tops.setColorAt(i, col.copy(base).multiplyScalar(v)));
    tops.instanceColor.needsUpdate = true; ground.scale.set(k, 1, k);
  };
  setGround(0x3b2c1e, 1); // instanceColor must exist before the first compile
  // holo grid: analytic anti-aliased lines (fwidth), minor 0.25 / major 1, radial fade. Geometry pre-rotated so scale(k,1,k) works.
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(24, 24).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { uColor: { value: new THREE.Color(CYAN) } },
    vertexShader: `varying vec2 vP; void main() { vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 uColor; varying vec2 vP;
      float ln(vec2 p) { vec2 g = abs(fract(p - 0.5) - 0.5) / fwidth(p); return 1.0 - min(min(g.x, g.y), 1.0); }
      void main() {
        float a = (ln(vP * 4.0) * 0.015 + ln(vP) * 0.4) * (1.0 - smoothstep(2.5, 4.5, length(vP)));
        gl_FragColor = vec4(uColor * 1.2, a);
      }`,
  }));
  grid.position.y = 0.002; world.add(grid);

  // motes: warm embers drifting up, a few cyan sparks among them
  const MN = 200, mPos = new Float32Array(MN * 3), mCol = new Float32Array(MN * 3), EMB = new THREE.Color(1.6, 0.6, 0.15), CY = new THREE.Color(CYAN);
  for (let i = 0; i < MN * 3; i += 3) {
    mPos[i] = (Math.random() - .5) * 20; mPos[i + 1] = Math.random() * 4; mPos[i + 2] = (Math.random() - .5) * 20;
    (Math.random() < 0.6 ? EMB : CY).toArray(mCol, i);
  }
  const motesGeo = new THREE.BufferGeometry(); motesGeo.setAttribute('position', new THREE.BufferAttribute(mPos, 3)); motesGeo.setAttribute('color', new THREE.BufferAttribute(mCol, 3));
  world.add(new THREE.Points(motesGeo, new THREE.PointsMaterial({ vertexColors: true, size: 0.035, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })));

  // distant floating islands: rock cone + a few lit houses, far past the fog (fog off), not shaken
  const farRock = new THREE.MeshBasicMaterial({ color: 0x1a1540, fog: false }), farHouse = new THREE.MeshBasicMaterial({ color: 0x241e55, fog: false }); // unlit: haze silhouettes
  const farWin = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.3, 0.5), fog: false });
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2 + Math.random() * 0.6, R = 110 + Math.random() * 40, s = 5 + Math.random() * 6, g = new THREE.Group();
    const c = new THREE.Mesh(new THREE.ConeGeometry(s, s * 1.4, 6).rotateX(Math.PI), farRock); c.position.y = -s * 0.7; g.add(c);
    for (let k = 0, n = 1 + Math.floor(Math.random() * 3); k < n; k++) {
      const hw = s * (0.2 + Math.random() * 0.15), hh = hw * (1 + Math.random() * 2.5), hx = (Math.random() - .5) * s, hz = (Math.random() - .5) * s;
      const hs = new THREE.Mesh(new THREE.BoxGeometry(hw, hh, hw), farHouse); hs.position.set(hx, hh / 2, hz); g.add(hs);
      const r = new THREE.Mesh(new THREE.ConeGeometry(hw * 0.8, hw, 4).rotateY(Math.PI / 4), farRock); r.position.set(hx, hh + hw / 2, hz); g.add(r);
      for (let j = 0; j < 3; j++) { const w = new THREE.Mesh(new THREE.BoxGeometry(hw * 0.18, hw * 0.22, hw * 1.02), farWin); w.position.set(hx + (Math.random() - .5) * hw * 0.5, hh * (0.3 + Math.random() * 0.5), hz); g.add(w); }
    }
    g.position.set(Math.cos(a) * R, -14 + Math.random() * 16, Math.sin(a) * R); g.rotation.y = Math.random() * 6; scene.add(g);
  }

  const SLOW = +Q.get('slow') || 1; // ?slow=4 to inspect frames
  const clock = new THREE.Clock();
  // adaptive resolution: sustained < ~45 fps -> drop DPR a notch (floor 1). ponytail: only steps down; a reload restores
  let acc = 0, frames = 0;
  const adapt = d => {
    if (d > 0.25) return; // tab switch / hitch, not load
    acc += d; if (++frames < 90) return;
    if (acc / frames > 1 / 45 && dpr > 1) { dpr = Math.max(1, dpr - 0.25); renderer.setPixelRatio(dpr); composer.setPixelRatio(dpr); resize(); }
    acc = frames = 0;
  };
  function start(onFrame) {
    renderer.setAnimationLoop(() => {
      const d = clock.getDelta(); adapt(d);
      const raw = Math.min(d, 0.05) / SLOW;
      let dt = raw;
      if (shake.stop > 0) { shake.stop -= raw; dt = 0; } // hit-stop: freeze sim, vfx keep running
      onFrame(dt, raw);
      fxUpdate(raw);
      for (let i = 1; i < MN * 3; i += 3) { mPos[i] += raw * 0.15; if (mPos[i] > 4) mPos[i] = 0; }
      motesGeo.attributes.position.needsUpdate = true;
      world.position.set((Math.random() - .5) * shake.amt, (Math.random() - .5) * shake.amt, (Math.random() - .5) * shake.amt);
      shake.amt = Math.max(0, shake.amt - raw * 0.4);
      sky.material.uniforms.uTime.value = lens.uniforms.uTime.value = clock.elapsedTime % 100;
      keyCam(raw); controls.update();
      composer.render();
    });
  }

  function resize() {
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
  }
  let last = null; // level framing; re-applied on rotate so portrait ↔ landscape keeps the landmark in view
  addEventListener('resize', () => { const was = camera.aspect; resize(); if (last && (was < 1) !== (camera.aspect < 1)) setCamera(...last, false); });

  // camera move (tweened) for level changes
  // level framings are authored for landscape; a narrow (portrait phone) view pulls back so the width still fits
  function setCamera(pos, tgt, animate = true, raw = false) {
    last = raw ? null : [pos, tgt]; // raw = zoom framing: a rotate must not snap back to the level view while the zoom button is still on
    const p0 = camera.position.clone(), t0 = controls.target.clone(), p1 = new THREE.Vector3(...pos), t1 = new THREE.Vector3(...tgt);
    if (!raw && camera.aspect < 1.2) p1.sub(t1).multiplyScalar(Math.min(2.4, (1.2 / camera.aspect) ** 0.75)).add(t1);
    const d = p1.distanceTo(t1); scene.fog.near = d * 1.1; scene.fog.far = d * 2.8; // fog follows framing so tall late levels stay visible
    // shadow frustum follows framing too, so tall late-level towers don't get clipped shadows
    const R = Math.max(10, d), sc = key.shadow.camera;
    key.position.copy(KEY_DIR).multiplyScalar(R * 1.2).add(t1.clone().setY(0)); key.target.position.copy(t1).setY(0);
    sc.left = sc.bottom = -R * 0.6; sc.right = sc.top = R * 0.6; sc.near = 0.5; sc.far = R * 3; sc.updateProjectionMatrix();
    if (!animate) { camera.position.copy(p1); controls.target.copy(t1); return; }
    tween(0.9, k => { const e = ease.io(k); camera.position.lerpVectors(p0, p1, e); controls.target.lerpVectors(t0, t1, e); });
  }
  // best view of a box: fixed iso direction, nearest distance at which all 8 corners fit both fov halves (+ room for the HUD / shop)
  function fit(box) {
    const c = box.getCenter(new THREE.Vector3()), dir = new THREE.Vector3(1, 0.5, -1).normalize();
    const right = new THREE.Vector3(0, 1, 0).cross(dir).normalize(), up = dir.clone().cross(right);
    const th = Math.tan(camera.fov * Math.PI / 360), tw = th * camera.aspect;
    let d = 0;
    for (let i = 0; i < 8; i++) {
      const p = new THREE.Vector3(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).sub(c);
      d = Math.max(d, Math.abs(p.dot(right)) / tw + p.dot(dir), Math.abs(p.dot(up)) / th + p.dot(dir));
    }
    c.y -= (box.max.y - box.min.y) * 0.06; // shop at the bottom is taller than the HUD → building sits a bit high
    setCamera(dir.multiplyScalar(d * 1.2).add(c).toArray(), c.toArray(), true, true);
  }

  return { renderer, scene, world, camera, controls, start, setCamera, fit, setGround, grid };
}
