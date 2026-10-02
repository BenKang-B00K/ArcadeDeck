import * as THREE from 'three';
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { COL, hex, canvasTex, flash, useEnv } from './fx.js';

// Shared scaffolding for the 3-button games: pane layout, keys + tap zones, countdown, sky, runner rig.
// Actions: 'L' left, 'A' action, 'R' right.
export const coarse = matchMedia('(pointer: coarse)').matches;
const KEYS = {
  KeyA: [0, 'L'], KeyW: [0, 'A'], KeyD: [0, 'R'], ArrowLeft: [1, 'L'], ArrowUp: [1, 'A'], ArrowRight: [1, 'R'],
  KeyJ: [2, 'L'], KeyI: [2, 'A'], KeyL: [2, 'R'], Numpad4: [3, 'L'], Numpad8: [3, 'A'], Numpad6: [3, 'R'],
};
const KEYS_D = { KeyS: 0, ArrowDown: 1, KeyK: 2, Numpad5: 3 }; // optional 4th action 'D' (down), only for games that opt in
const KEYHINT = [{ l: 'A', j: 'W', r: 'D', d: 'S' }, { l: '←', j: '↑', r: '→', d: '↓' }, { l: 'J', j: 'I', r: 'L', d: 'K' }, { l: 'Num4', j: 'Num8', r: 'Num6', d: 'Num5' }];
export const keyHint = (pi, online) => (online || pi < 0 ? { l: 'A/←', j: 'W/↑', r: 'D/→', d: 'S/↓' } : KEYHINT[pi]);

// touch: each pane is split into left / centre / right thirds; labels shown on touch devices only
export const zones = (l, a, r) => `<div class="zones"><span>${l}</span><span>${a}</span><span>${r}</span></div>`;

export function makePane(pi, label, extra = '') {
  const el = document.createElement('div');
  el.className = 'pane';
  if (pi >= 0) el.style.setProperty('--c', hex(pi));
  el.innerHTML = `<div class="ptop"><b class="ptag"></b><span class="ptime"></span></div>${extra}<div class="pmsg"></div><div class="phint"></div>`;
  document.getElementById('hud').appendChild(el);
  const q = s => el.querySelector(s);
  if (pi >= 0) q('.ptag').textContent = label(pi); else q('.ptag').remove();
  return { pi, el, q, val: q('.ptime'), msg: q('.pmsg'), hint: q('.phint'), x: 0, y: 0, w: 1, h: 1, flip: false };
}

// score chips for every player, shown in each pane
export function rankChips(pane, n, label) {
  const box = document.createElement('div');
  box.className = 'prank';
  const chips = [...Array(n).keys()].map(i => {
    const s = document.createElement('span');
    s.style.setProperty('--o', hex(i));
    if (i === pane.pi) s.className = 'me';
    box.appendChild(s);
    return s;
  });
  pane.el.appendChild(box);
  return vals => chips.forEach((s, i) => { s.textContent = `${label(i)} ${vals[i]}`; });
}

// 1 pane: full screen. 2: side by side (landscape) or stacked (portrait). 3–4: top row of 2, bottom row of the rest.
// Portrait = tablet flat on a table: the top row is rotated 180° to face the players across from it.
export function layout(panes) {
  const W = innerWidth, H = innerHeight, portrait = H > W, np = panes.length;
  document.body.classList.toggle('split-v', np > 1 && portrait);
  panes.forEach((v, k) => {
    if (np === 1) Object.assign(v, { x: 0, y: 0, w: W, h: H, flip: false });
    else if (np === 2 && !portrait) Object.assign(v, { x: k * W / 2, y: 0, w: W / 2, h: H, flip: false });
    else if (np === 2) Object.assign(v, { x: 0, y: k ? H / 2 : 0, w: W, h: H / 2, flip: k === 0 });
    else {
      const top = k < 2, cols = top ? 2 : np - 2, c = top ? k : k - 2;
      Object.assign(v, { x: c * W / cols, y: top ? 0 : H / 2, w: W / cols, h: H / 2, flip: top && portrait });
    }
    Object.assign(v.el.style, { left: v.x + 'px', top: v.y + 'px', width: v.w + 'px', height: v.h + 'px', transform: v.flip ? 'rotate(180deg)' : '' });
  });
}

// fov that keeps a horizontal half-angle of `half`° visible on tall panes
export const fitFov = (aspect, half, min = 50, max = 100) =>
  THREE.MathUtils.clamp(2 * THREE.MathUtils.radToDeg(Math.atan(Math.tan(THREE.MathUtils.degToRad(half)) / aspect)), min, max);

export function renderPanes(renderer, scene, panes, camFor) {
  const H = innerHeight, split = panes.length > 1;
  renderer.setScissorTest(split);
  for (const v of panes) {
    const cam = camFor(v), y = H - v.y - v.h; // GL viewport origin is bottom-left
    renderer.setViewport(v.x, y, v.w, v.h);
    if (split) renderer.setScissor(v.x, y, v.w, v.h);
    renderer.render(scene, cam);
  }
  renderer.setScissorTest(false);
}

// keys map to their player locally (any set drives `me` online); a tap acts on pointerdown for the pane it lands in.
// Optional release(pi, a) fires on keyup / pointerup for games with hold inputs.
// down: also send 'D' (S / ↓ / K / Num5, or a tap on the bottom quarter of the centre zone).
export function bindInput({ cv, panes, n, online, me, act, release, down }) {
  if (n === 1) online = true; // solo: every key set drives the one player (me defaults to 0)
  const held = new Map(); // pointerId -> [pi, action] so the release goes to the zone that was pressed
  const keys = new Map(); // code -> [pi, action] while down, so losing focus can let go of them
  const key = e => KEYS[e.code] ?? (down && KEYS_D[e.code] != null ? [KEYS_D[e.code], 'D'] : null);
  const onKey = e => {
    const k = key(e);
    if (!k || e.repeat || (!online && k[0] >= n)) return;
    e.preventDefault();
    keys.set(e.code, [online ? me : k[0], k[1]]);
    act(online ? me : k[0], k[1]);
  };
  const onUp = e => {
    const k = key(e);
    if (!k || (!online && k[0] >= n)) return;
    keys.delete(e.code);
    release(online ? me : k[0], k[1]);
  };
  // alt-tab / notification while holding: the keyup never arrives, so release everything still held
  const onBlur = () => { for (const h of [...keys.values(), ...held.values()]) release(...h); keys.clear(); held.clear(); };
  const onDown = e => {
    if (e.button > 0) return;
    const v = panes.find(p => e.clientX >= p.x && e.clientX < p.x + p.w && e.clientY >= p.y && e.clientY < p.y + p.h) || panes[0];
    let rx = (e.clientX - v.x) / v.w, ry = (e.clientY - v.y) / v.h;
    if (v.flip) { rx = 1 - rx; ry = 1 - ry; }
    const a = rx < 1 / 3 ? 'L' : rx > 2 / 3 ? 'R' : down && ry > .75 ? 'D' : 'A';
    held.set(e.pointerId, [v.pi, a]);
    act(v.pi, a);
  };
  const onPUp = e => { const h = held.get(e.pointerId); if (h) { held.delete(e.pointerId); release(...h); } };
  cv.addEventListener('pointerdown', onDown);
  addEventListener('keydown', onKey);
  if (release) { addEventListener('keyup', onUp); addEventListener('pointerup', onPUp); addEventListener('pointercancel', onPUp); addEventListener('blur', onBlur); }
  return () => {
    cv.removeEventListener('pointerdown', onDown); removeEventListener('keydown', onKey);
    removeEventListener('keyup', onUp); removeEventListener('pointerup', onPUp); removeEventListener('pointercancel', onPUp); removeEventListener('blur', onBlur);
  };
}

// Winner showcase: instead of calling onEnd(res) straight away, a game calls sc.start(res, at) and every pane's camera
// makes one eased 360° turn around `at` (a Vector3, or a function returning one each frame) for SHOW s; then onEnd(res)
// runs and the camera keeps drifting slowly behind the results card. Game wiring: sc.update(dt) every frame, and first
// thing in the renderPanes callback `if (sc.on) return sc.cam(v, cam, fov)`. opts: r radius, h height, look y offset.
const SHOW = 4;
// banner confetti rain, weighted toward the winner's colour; removes itself
function confetti(win) {
  const box = document.createElement('div'), pal = ['#ffd23f', '#fff', ...COL.map((_, i) => hex(i))];
  box.className = 'confetti';
  for (let k = 0; k < 70; k++) {
    const i = document.createElement('i'), R = Math.random;
    i.style.cssText = `left:${R() * 100}%;background:${COL[win] != null && R() < .4 ? hex(win) : pal[k % pal.length]};--d:${2.2 + R() * 1.8}s;--w:${R() * 1.2}s;--x:${(R() - .5) * 30}vw;--r:${(R() - .5) * 1440}deg`;
    box.appendChild(i);
  }
  document.body.appendChild(box); // outside #hud: games own its children
  setTimeout(() => box.remove(), 5500);
}
export function makeShowcase(panes, label, onEnd) {
  let res = null, at = null, o = null, T = 0, ended = false;
  const p = new THREE.Vector3(), look = new THREE.Vector3();
  const sc = {
    on: false,
    start(r, target, opts = {}) {
      if (sc.on) return;
      res = r; at = target; o = { r: 7, h: 3.4, look: 1, ...opts }; T = 0; ended = false; sc.on = true;
      const msg = r.title ?? (r.draw ? t('draw') : t('wins', { p: label(r.order[0]) }));
      panes.forEach(v => { flash(v.msg, msg, 'perfect'); v.hint?.classList.add('hide'); });
      confetti(r.draw ? null : r.order?.[0]);
    },
    update(dt) {
      if (!sc.on) return;
      T += dt;
      if (!ended && T >= SHOW) { ended = true; onEnd(res); }
    },
    cam(v, cam, fov) {
      const c = typeof at === 'function' ? at() : at, k = Math.min(1, T / SHOW);
      const a = k * k * (3 - 2 * k) * Math.PI * 2 + Math.max(0, T - SHOW) * .25; // smoothstep full turn, then slow drift
      p.set(c.x + Math.sin(a) * o.r, c.y + o.h, c.z + Math.cos(a) * o.r);
      cam.position.copy(p);
      cam.lookAt(look.set(c.x, c.y + o.look, c.z));
      if (v.flip) cam.rotateZ(Math.PI);
      if (fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
      return cam;
    },
  };
  return sc;
}

// 3-2-1-GO on every pane; returns step(dt) → true while still counting
export function countdown(panes) {
  let clock = 3.6, last = 4;
  return dt => {
    if (clock <= 0) return false;
    clock -= dt;
    const c = Math.ceil(clock);
    if (c < last && c > 0) { last = c; sfx.count(); panes.forEach(v => flash(v.msg, c)); }
    if (clock <= 0) { sfx.go(); panes.forEach(v => flash(v.msg, t('go'), 'go')); }
    return clock > 0;
  };
}

// gradient sky dome + stars; position it at the camera before each render
export function addSky(scene, fog, glow = 0x4a1a5c) {
  const sky = new THREE.Group(), R = 90;
  const g = new THREE.SphereGeometry(R, 24, 16), p = g.attributes.position, cols = [];
  const top = new THREE.Color(0x02030c), gl = new THREE.Color(glow), f = new THREE.Color(fog), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / R;
    c.copy(f).lerp(gl, Math.max(0, 1 - Math.abs(y - .08) * 7) * .55).lerp(top, Math.max(0, y) ** .6);
    cols.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  sky.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })));
  const sp = [];
  for (let i = 0; i < 260; i++) {
    const a = Math.random() * 6.28, e = .15 + Math.random() * 1.3;
    sp.push(Math.cos(a) * Math.cos(e) * 85, Math.sin(e) * 85, Math.sin(a) * Math.cos(e) * 85);
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  sky.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xc8d4ff, size: 1.6, sizeAttenuation: false, fog: false, depthWrite: false })));
  // stadium floodlight banks on the horizon (banner): 6 towers of 5×3 lamps, bright enough for the bloom pass
  const fl = [];
  for (let b = 0; b < 6; b++) {
    const a0 = b / 6 * 6.28 + .5;
    for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) {
      const a = a0 + (i - 2) * .018, e = .2 + j * .018;
      fl.push(Math.cos(a) * Math.cos(e) * 84, Math.sin(e) * 84, Math.sin(a) * Math.cos(e) * 84);
    }
  }
  const fg = new THREE.BufferGeometry();
  fg.setAttribute('position', new THREE.Float32BufferAttribute(fl, 3));
  sky.add(new THREE.Points(fg, new THREE.PointsMaterial({ color: new THREE.Color(0xfff2d8).multiplyScalar(1.6), size: 4, sizeAttenuation: false, fog: false, depthWrite: false, toneMapped: false })));
  sky.children.forEach(o => { o.renderOrder = -1; o.frustumCulled = false; });
  scene.add(sky);
  return sky;
}

// night city of window-textured blocks standing on y; clear(x, z) → true keeps that spot empty
export function addCity(scene, { y, n = 240, x0 = -90, x1 = 90, z0 = 30, z1 = -120, clear = () => false }) {
  const win = canvasTex(32, 64, (g, w, h) => {
    g.fillStyle = '#0a0d24'; g.fillRect(0, 0, w, h);
    for (let yy = 4; yy < h; yy += 8) for (let x = 3; x < w; x += 7) { g.fillStyle = Math.random() < .45 ? '#ffd88a' : '#1a2048'; g.fillRect(x, yy, 4, 4); }
  });
  const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ map: win }), n);
  const M = new THREE.Matrix4(), c = new THREE.Color(), pal = [0xffffff, 0xa0c8ff, 0xffb0e0, 0xc0ffd8];
  for (let k = 0; k < n; k++) {
    const h = 6 + Math.random() ** 1.5 * 26, w = 3 + Math.random() * 5;
    let x, z, tries = 0;
    do { x = x0 + Math.random() * (x1 - x0); z = z0 + Math.random() * (z1 - z0); } while (clear(x, z) && ++tries < 20);
    M.makeScale(w, h, w).setPosition(x, y + h / 2, z);
    city.setMatrixAt(k, M); city.setColorAt(k, c.setHex(pal[k % 4]));
  }
  scene.add(city);
  return city;
}

export function lights(scene) {
  useEnv(scene);
  scene.add(new THREE.HemisphereLight(0x9ab8ff, 0x201038, 1.2));
  const sun = new THREE.DirectionalLight(0xffe6cc, 1.6);
  sun.position.set(-4, 10, 6);
  scene.add(sun);
}

// white glyph on transparent; tint with material colour. kinds: L A R dia dot tri
export function symTex(kind) {
  return canvasTex(128, 128, g => {
    g.fillStyle = '#fff';
    g.beginPath();
    if (kind === 'L') { g.moveTo(92, 22); g.lineTo(30, 64); g.lineTo(92, 106); }
    else if (kind === 'R') { g.moveTo(36, 22); g.lineTo(98, 64); g.lineTo(36, 106); }
    else if (kind === 'A') for (let k = 0; k < 10; k++) { const r = k % 2 ? 22 : 54, a = -Math.PI / 2 + k * Math.PI / 5; g.lineTo(64 + Math.cos(a) * r, 66 + Math.sin(a) * r); }
    else if (kind === 'dia') { g.moveTo(64, 16); g.lineTo(106, 64); g.lineTo(64, 112); g.lineTo(22, 64); }
    else if (kind === 'dot') g.arc(64, 64, 40, 0, 7);
    else { g.moveTo(64, 20); g.lineTo(108, 100); g.lineTo(20, 100); }
    g.closePath(); g.fill();
  });
}

// Athlete rig (banner style): blocky chibi kid — big box head, spiky hair, team headband, jersey, wristbands, sneakers.
// Jointed arms/legs (elbows, knees). Faces -z. Parts sharing a rigid bone are merged into one vertex-coloured mesh (~10 draw calls).
// userData: body (hip pivot: torso, head, arms), legL/R + kneeL/R, armL/R + elbowL/R, shadow (ground blob, see placeRunner), mat.
const HIP = .9, RIG = .88; // rig units; RIG scales it to ~1.8 m tall
const paint = (geo, col) => {
  const c = new THREE.Color(col), n = geo.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) c.toArray(a, i * 3);
  geo.setAttribute('color', new THREE.BufferAttribute(a, 3));
  return geo;
};
// part(geometry, colour, [x,y,z], [sx,sy,sz]) → posed geometry ready to merge
export const part = (geo, col, [x, y, z] = [0, 0, 0], [sx, sy, sz] = [1, 1, 1]) => paint(geo.scale(sx, sy, sz).translate(x, y, z), col);

// skin / hair per player slot, so the four kids read as different people like the banner
const SKIN = [0xf3c7a0, 0xe9b184, 0x8d5a3c, 0xf6d2b0], HAIR = [0x1c2233, 0x5a331f, 0x241a26, 0x7a4424];
const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const spike = (r, h) => new THREE.ConeGeometry(r, h, 4).rotateY(Math.PI / 4); // 4-sided = low-poly hair tuft
const eyes = (w, h, y, col) => [part(B(w, h, .02), col, [-.1, y, -.215]), part(B(w, h, .02), col, [.1, y, -.215])];
const glints = W => [part(B(.025, .03, .01), W, [-.085, .755, -.227]), part(B(.025, .03, .01), W, [.115, .755, -.227])];
const brows = (col, tilt, y = .81) => [part(B(.1, .03, .02).rotateZ(-tilt), col, [-.1, y, -.216]), part(B(.1, .03, .02).rotateZ(tilt), col, [.1, y, -.216])];
// one face per player slot (front is -z), after the banner's four kids
const FACE = [
  (W, I, H) => [...eyes(.07, .1, .73, I), ...glints(W), ...brows(H, .3), // P1: determined, smirk grin
    part(B(.13, .035, .02), W, [0, .62, -.215]), part(B(.15, .012, .021), I, [0, .637, -.216])],
  (W, I, H) => [...eyes(.07, .1, .73, I), ...glints(W), ...brows(H, .45, .8), // P2: fierce, big open grin
    part(B(.19, .07, .02), I, [.01, .615, -.214]), part(B(.17, .03, .021), W, [.01, .632, -.216]), part(B(.08, .02, .021), 0xe0566a, [.01, .594, -.216])],
  (W, I, H) => [...eyes(.09, .025, .73, I), ...brows(H, .15, .79), // P3: eyes squeezed shut, gritted teeth
    part(B(.2, .06, .02), W, [0, .62, -.215]), part(B(.21, .01, .021), I, [0, .62, -.216]),
    ...[-.06, -.02, .02, .06].map(x => part(B(.008, .06, .021), I, [x, .62, -.216]))],
  (W, I, H) => [...eyes(.08, .12, .735, I), ...glints(W), ...brows(H, -.12, .83), // P4: big bright eyes, lashes, happy open smile
    part(B(.03, .025, .02), I, [-.15, .79, -.215]), part(B(.03, .025, .02), I, [.15, .79, -.215]),
    part(B(.14, .06, .02), 0x6a1a2a, [0, .62, -.214]), part(B(.12, .02, .021), W, [0, .64, -.216]), part(B(.07, .02, .021), 0xff7a8a, [0, .603, -.216])],
];
const capHair = H => [
  part(B(.5, .14, .46), H, [0, .95, .01]), part(B(.5, .3, .1), H, [0, .8, .2]),
  part(B(.08, .22, .38), H, [-.235, .82, .03]), part(B(.08, .22, .38), H, [.235, .82, .03]),
];
// one hairdo per player slot: spikes swept back · tall flame spikes · voxel afro puff · high ponytail with bangs
const HAIRDO = [
  (H, T) => [...capHair(H),
    T(-.15, 1.03, .02, 1.05, .3, 1.1), T(0, 1.06, -.02, 1.1, 0, 1.3), T(.15, 1.03, .02, 1.05, -.3, 1.1),
    T(-.09, 1, .18, 1.35, .2, 1.3), T(.09, 1, .18, 1.35, -.2, 1.3), T(0, .93, .28, 1.6, 0, 1.2),
    T(-.12, 1.07, -.12, -.25, .35, 1.1), T(.04, 1.1, -.14, -.3, -.1, 1.25), T(.17, 1.05, -.1, -.2, -.5, 1),
    T(-.2, .94, -.16, -.3, .9, .9), T(.2, .94, -.16, -.3, -.9, .9)],
  (H, T) => [...capHair(H),
    T(-.17, 1.08, -.06, -.15, .45, 1.2), T(-.08, 1.13, -.1, -.2, .15, 1.5), T(.03, 1.15, -.08, -.1, -.05, 1.7),
    T(.13, 1.11, -.06, -.1, -.35, 1.4), T(.2, 1.06, 0, 0, -.6, 1.1), T(-.06, 1.08, .12, .45, .2, 1.3), T(.1, 1.07, .14, .5, -.25, 1.2)],
  H => { // afro: fibonacci shell of cubes above the headband line
    const out = [part(B(.52, .32, .14), H, [0, .8, .19])];
    for (let i = 0; i < 64; i++) {
      const y = 1 - (i + .5) / 32, r = Math.sqrt(Math.max(0, 1 - y * y)), a = i * 2.39996;
      const p = [Math.cos(a) * r * .33, 1 + y * .27, .04 + Math.sin(a) * r * .31];
      if (p[1] < .88) continue;
      out.push(part(B(.15, .15, .15).rotateY(a).rotateX(.25 + (i % 3) * .2), H, p));
    }
    return out;
  },
  (H, T, C) => [...capHair(H),
    part(B(.52, .09, .1), H, [0, .93, -.2]),                                      // bangs
    part(B(.1, .08, .06).rotateZ(.35), H, [-.13, .89, -.23]), part(B(.1, .07, .06).rotateZ(-.3), H, [.08, .9, -.23]),
    part(B(.08, .36, .14), H, [-.25, .7, -.1]), part(B(.08, .36, .14), H, [.25, .7, -.1]), // side locks to the jaw
    part(B(.13, .09, .13), C, [0, 1.02, .26]),                                     // scrunchie
    part(B(.17, .18, .16).rotateX(.5), H, [0, 1.04, .37]),                         // ponytail, falling behind
    part(B(.14, .2, .13).rotateX(.25), H, [0, .88, .44]),
    part(B(.1, .16, .1).rotateX(.1), H, [0, .72, .45]),
    part(spike(.06, .12).rotateX(Math.PI), H, [0, .6, .45])],                   // tip
];

export function makeRunner(color) {
  const k = Math.max(0, COL.indexOf(color)), SK = SKIN[k], HR = HAIR[k];
  const WHITE = 0xf4f6ff, INK = 0x14121c, SHORT = new THREE.Color(color).lerp(new THREE.Color(0x10142e), .35).getHex();
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, emissive: color, emissiveIntensity: .02, roughness: .62, metalness: 0, flatShading: true });
  const mesh = parts => new THREE.Mesh(mergeGeometries(parts), mat);
  const g = new THREE.Group(), rig = new THREE.Group();
  rig.scale.setScalar(RIG);

  // torso block: shorts, jersey + white trim, neck, big head, face, hair, headband with tails
  const body = new THREE.Group();
  body.position.y = HIP;
  const tuft = (x, y, z, rx, rz, s = 1) => part(spike(.09 * s, .2 * s).rotateX(rx).rotateZ(rz), HR, [x, y, z]);
  const hb = k === 2 ? .08 : 0; // afro: headband sits wider
  body.add(mesh([
    part(B(.36, .16, .24), SHORT, [0, .04, 0]),
    part(B(.38, .34, .25), color, [0, .28, 0]),
    part(B(.39, .035, .26), WHITE, [0, .12, 0]),                  // hem
    part(B(.03, .3, .262), WHITE, [-.175, .29, 0]), part(B(.03, .3, .262), WHITE, [.175, .29, 0]), // side stripes
    part(B(.16, .05, .03), WHITE, [0, .43, -.12]),                 // collar
    part(B(.11, .08, .1), SK, [0, .48, 0]),                        // neck
    part(B(.46, .42, .42), SK, [0, .72, 0]),                       // head
    part(B(.06, .1, .06), SK, [-.245, .71, 0]), part(B(.06, .1, .06), SK, [.245, .71, 0]), // ears
    part(B(.06, .03, .01), 0xff8f8f, [-.16, .66, -.213]), part(B(.06, .03, .01), 0xff8f8f, [.16, .66, -.213]), // blush
    ...FACE[k](WHITE, INK, HR),
    ...HAIRDO[k](HR, tuft, color),
    // headband (wraps over the hair; bigger round the afro) + knot tails (P4 ties a ponytail there instead)
    part(B(.57 + hb, .08, .52 + hb), color, [0, .86, .02]), part(B(.572 + hb, .02, .522 + hb), WHITE, [0, .825, .02]),
    ...(k === 3 ? [] : [
      part(B(.06, .06, .05), color, [.1, .86, .29 + hb / 2]),
      part(B(.05, .16, .02).rotateX(.5).rotateZ(-.4), color, [.14, .78, .32 + hb / 2]), part(B(.05, .13, .02).rotateX(.6).rotateZ(.2), color, [.07, .79, .32 + hb / 2]),
    ]),
  ]));

  // limb = pivot group → upper bone mesh + joint group → lower bone mesh
  const limb = (parent, x, y, len, upper, lower) => {
    const pv = new THREE.Group(), joint = new THREE.Group();
    pv.position.set(x, y, 0); joint.position.y = -len;
    pv.add(mesh(upper), joint); joint.add(mesh(lower));
    parent.add(pv);
    return [pv, joint];
  };
  // arm: sleeve + skin upper; skin forearm, team wristband, fist
  const arm = x => limb(body, x, .4, .24, [
    part(B(.13, .12, .14), color, [0, -.04, 0]), part(B(.135, .025, .145), WHITE, [0, -.1, 0]),
    part(B(.1, .14, .1), SK, [0, -.17, 0]),
  ], [
    part(B(.095, .13, .095), SK, [0, -.07, 0]),
    part(B(.115, .06, .115), color, [0, -.15, 0]),
    part(B(.12, .12, .12), SK, [0, -.23, -.01]),
  ]);
  // leg: shorts leg + skin thigh; skin shin, white sock, chunky sneaker (white, team stripe, dark sole)
  const leg = x => limb(rig, x, HIP, .44, [
    part(B(.17, .18, .2), SHORT, [0, -.07, 0]),
    part(B(.13, .3, .13), SK, [0, -.28, 0]),
  ], [
    part(B(.115, .22, .115), SK, [0, -.12, 0]),
    part(B(.125, .1, .125), WHITE, [0, -.28, 0]),
    part(B(.17, .13, .29), WHITE, [0, -.38, -.05]),
    part(B(.175, .04, .18), color, [0, -.37, -.04]),
    part(B(.18, .04, .3), INK, [0, -.44, -.05]),
  ]);
  const [armL, elbowL] = arm(-.26), [armR, elbowR] = arm(.26), [legL, kneeL] = leg(-.1), [legR, kneeR] = leg(.1);
  rig.add(body);

  const shadow = new THREE.Mesh(new THREE.CircleGeometry(.5, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: .45, depthWrite: false }));
  g.add(rig, shadow);
  g.userData = { body, legL, legR, kneeL, kneeR, armL, armR, elbowL, elbowR, shadow, mat };
  return g;
}

// phase: stride angle (2π = one left+right stride). amp: swing 0–1. tuck: knees up (jumping).
export function animRunner(r, phase, amp, tuck = 0) {
  const u = r.userData, s = Math.sin(phase) * amp, c = Math.cos(phase);
  u.legL.rotation.x = s + tuck; u.legR.rotation.x = -s + tuck;
  // knee folds while its leg swings forward (recovery), plus a little always
  u.kneeL.rotation.x = -(amp * (.15 + 1.3 * Math.max(0, c)) + tuck * 1.6);
  u.kneeR.rotation.x = -(amp * (.15 + 1.3 * Math.max(0, -c)) + tuck * 1.6);
  u.armL.rotation.x = -s * .9 - tuck * .6; u.armR.rotation.x = s * .9 - tuck * .6;
  // elbows pump a little with each swing instead of staying locked
  u.elbowL.rotation.x = Math.min(1.6, .25 + amp * (1 + .35 * Math.max(0, -Math.sin(phase))) + tuck * .4);
  u.elbowR.rotation.x = Math.min(1.6, .25 + amp * (1 + .35 * Math.max(0, Math.sin(phase))) + tuck * .4);
  u.body.rotation.y = s * .18; // shoulders counter-rotate against the hips
  u.body.rotation.x = -amp * .16; // lean into the stride
  u.body.rotation.z = Math.sin(phase) * amp * .06; // weight shifts onto the stance leg
  // bob: lowest as a foot plants, highest passing over it; a slow breath keeps the idle pose alive
  u.body.position.y = HIP + (Math.abs(c) - .5) * amp * .09 + Math.sin(phase * .5) * .012 * (1 - Math.min(1, amp * 4));
}

export function placeRunner(r, x, y, z, ground = 0) {
  r.position.set(x, y, z);
  const sh = r.userData.shadow;
  sh.position.y = ground - y + .02;
  sh.scale.setScalar(Math.max(.3, 1 - (y - ground) * .25));
}

// tiny floating name label above a runner. A sprite always faces the camera, so it also reads upright in the 180°-flipped panes.
export function nameTag(text, color) {
  const tex = canvasTex(256, 64, () => {});
  const g = tex.image.getContext('2d'), css = '#' + color.toString(16).padStart(6, '0');
  const draw = txt => {
    g.clearRect(0, 0, 256, 64);
    g.font = '800 34px system-ui, -apple-system, "Segoe UI", "Malgun Gothic", "Hiragino Sans", sans-serif';
    const w = Math.min(248, g.measureText(txt).width + 32), x = 128 - w / 2;
    g.fillStyle = 'rgba(8, 12, 34, .72)'; g.strokeStyle = css; g.lineWidth = 3;
    g.beginPath(); g.roundRect(x, 8, w, 48, 24); g.fill(); g.stroke();
    g.fillStyle = css; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(txt, 128, 33, 224);
    tex.needsUpdate = true;
  };
  draw(text);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, sizeAttenuation: false }));
  s.scale.set(.14, .035, 1); // fixed screen size: a rival far down the track stays readable
  s.position.y = 2.25;
  s.renderOrder = 2;
  s.userData.set = draw;
  return s;
}
