import * as THREE from 'three';
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { COL, hex, canvasTex, disposeScene, useEnv, flash, buzz, Burst } from './fx.js';

// Turn-based: players take turns in order; within a round everyone gets the same zone so it stays fair.
const R = 3, LAPS = 2;
const GRADE = { perfect: [100, 0xffd23f], great: [70, 0x35e0ff], good: [40, 0xffffff], miss: [0, 0x5a6080] };

export function createTiming({ renderer, mode, n = 2, me = 0, bots = [], rand, send, label, onEnd }) {
  const online = mode === 'online';
  const ROUNDS = [5, 5, 5, 4, 3][n], TURNS = ROUNDS * n; // keeps a match to ~10–12 turns
  const IDX = [...Array(n).keys()];
  const scene = new THREE.Scene(), bg = new THREE.Color(0x080c22);
  scene.background = bg;
  scene.fog = new THREE.Fog(bg, 12, 36);
  useEnv(scene);
  scene.add(new THREE.HemisphereLight(0xa0b8ff, 0x1a0a30, 1.2));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 4, 6);
  scene.add(key);
  const cam = new THREE.PerspectiveCamera(50, 1, .1, 80);

  const base = new THREE.Color(0x2c3a78);
  const ringMat = new THREE.MeshBasicMaterial({ color: base.clone(), toneMapped: false });
  scene.add(new THREE.Mesh(new THREE.TorusGeometry(R, .06, 8, 128), ringMat));
  const halo = new THREE.Mesh(new THREE.TorusGeometry(R + .55, .015, 6, 128), new THREE.MeshBasicMaterial({ color: 0x3a4a90, toneMapped: false }));
  const halo2 = new THREE.Mesh(new THREE.TorusGeometry(R + 1.3, .01, 6, 128, Math.PI * 1.4), new THREE.MeshBasicMaterial({ color: 0x5a2a7a, toneMapped: false }));
  scene.add(halo, halo2);
  const zoneMat = new THREE.MeshBasicMaterial({ color: 0x3dff9a, toneMapped: false, transparent: true });
  const perfMat = new THREE.MeshBasicMaterial({ color: 0xfff6a0, toneMapped: false });
  const zone = new THREE.Mesh(new THREE.BufferGeometry(), zoneMat), perf = new THREE.Mesh(new THREE.BufferGeometry(), perfMat);
  scene.add(zone, perf);
  const coreMat = new THREE.MeshStandardMaterial({ color: 0x1a1f3a, emissive: COL[0], emissiveIntensity: .4, flatShading: true, roughness: .18, metalness: .85 });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 0), coreMat);
  scene.add(core);
  // wire shell around the core, tinted with the turn owner's colour
  const shellMat = new THREE.MeshBasicMaterial({ color: COL[0], wireframe: true, transparent: true, opacity: .16, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.65, 1), shellMat);
  scene.add(shell);
  // 60 dial ticks outside the track, every 5th long
  const ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(.03, 1, .03), new THREE.MeshBasicMaterial({ color: 0x4a5aa8, toneMapped: false }), 60);
  for (let k = 0; k < 60; k++) {
    const a = k / 60 * Math.PI * 2, l = k % 5 ? .14 : .3;
    ticks.setMatrixAt(k, new THREE.Matrix4().compose(new THREE.Vector3(Math.cos(a) * (R + .3 + l / 2), Math.sin(a) * (R + .3 + l / 2), 0), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), a - Math.PI / 2), new THREE.Vector3(1, l, 1)));
  }
  scene.add(ticks);
  // nebula backdrop: soft colour blobs on one additive plane far behind
  const neb = canvasTex(256, 256, (g, w) => {
    for (const [x, y, r, c] of [[.3, .35, .45, '90,40,160'], [.72, .6, .4, '30,90,190'], [.5, .8, .3, '190,40,120'], [.6, .25, .25, '40,140,200']]) {
      const gr = g.createRadialGradient(x * w, y * w, 0, x * w, y * w, r * w);
      gr.addColorStop(0, `rgba(${c},.26)`); gr.addColorStop(1, `rgba(${c},0)`);
      g.fillStyle = gr; g.fillRect(0, 0, w, w);
    }
  });
  const nebula = new THREE.Mesh(new THREE.PlaneGeometry(90, 60), new THREE.MeshBasicMaterial({ map: neb, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  nebula.position.z = -30;
  scene.add(nebula);
  const orb = new THREE.Mesh(new THREE.SphereGeometry(.26, 20, 14), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }));
  scene.add(orb);
  const TRAIL = 10;
  const trailMat = new THREE.MeshBasicMaterial({ color: COL[0], toneMapped: false, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false });
  const trail = new THREE.InstancedMesh(new THREE.SphereGeometry(.2, 10, 8), trailMat, TRAIL);
  trail.frustumCulled = false;
  trail.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(trail);
  {
    const sp = [];
    for (let i = 0; i < 500; i++) sp.push((Math.random() - .5) * 70, (Math.random() - .5) * 44, -6 - Math.random() * 30);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x8fa0ff, size: .09, fog: false })));
  }
  const burst = new Burst(scene);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = new THREE.Vector3(), S = new THREE.Vector3();

  function setZone(c, half) {
    zone.geometry.dispose(); perf.geometry.dispose();
    zone.geometry = new THREE.TorusGeometry(R, .17, 8, 40, half * 2);
    zone.rotation.z = c - half;
    perf.geometry = new THREE.TorusGeometry(R, .22, 8, 12, half * .5);
    perf.rotation.z = c - half * .25;
  }

  const rounds = Array.from({ length: ROUNDS }, (_, r) => {
    const f = r / (ROUNDS - 1), c = rand() * Math.PI * 2;
    return { c, half: .5 - .3 * f, sp: (2.3 + 2.7 * f) * (rand() < .5 ? 1 : -1), a0: c + Math.PI * (.7 + rand() * .6) };
  });

  // HUD
  const hud = document.createElement('div');
  hud.className = 'pane';
  hud.style.inset = '0';
  hud.innerHTML = `<div class="tbar">${[...Array(n).keys()].map(i => `<div class="ts" style="--c:${hex(i)}"><b></b><span>0</span></div>`).join('')}<div class="tround"></div></div><div class="tturn"></div><div class="pmsg"></div><div class="phint"></div>`;
  document.getElementById('hud').appendChild(hud);
  const q = s => hud.querySelector(s);
  const ts = [...hud.querySelectorAll('.ts')], sc = ts.map(el => el.querySelector('span'));
  ts.forEach((el, i) => { el.querySelector('b').textContent = label(i); });
  const msg = q('.pmsg'), turnEl = q('.tturn'), hint = q('.phint'), roundEl = q('.tround');

  let k = 0, st = 'intro', timer = 0, spinStart = 0, angle = 0, time = 0, botPlan = null;
  const scores = Array(n).fill(0), pending = new Map();
  const ctrl = new Set(online ? [me] : IDX), ai = new Set(); // players this device resolves turns for / AI players
  const cur = () => rounds[Math.floor(k / n)], who = () => k % n, mine = () => ctrl.has(who()), human = () => mine() && !ai.has(who());
  const angleAt = now => cur().a0 + cur().sp * (now - spinStart) / 1000; // wall-clock based: tap precision independent of frame rate

  function beginTurn() {
    const r = cur(), p = who();
    st = 'intro'; timer = 1; angle = r.a0; botPlan = null;
    setZone(r.c, r.half);
    coreMat.emissive.setHex(COL[p]); trailMat.color.setHex(COL[p]); shellMat.color.setHex(COL[p]);
    ts.forEach((el, i) => el.classList.toggle('on', i === p));
    roundEl.textContent = t('round', { r: Math.floor(k / n) + 1, n: ROUNDS });
    turnEl.style.setProperty('--c', hex(p));
    turnEl.textContent = t('turn', { p: label(p) });
    hint.textContent = human() ? t('tapHint') : t('waitRival');
    hint.classList.remove('hide');
    sfx.turn();
  }

  function resolve(a) {
    const r = cur();
    let g = 'miss';
    if (a != null) {
      angle = a;
      const e = Math.abs(Math.atan2(Math.sin(a - r.c), Math.cos(a - r.c))) / r.half;
      g = e < .25 ? 'perfect' : e < .6 ? 'great' : e <= 1 ? 'good' : 'miss';
    }
    const [pts, col] = GRADE[g], p = who();
    scores[p] += pts;
    sc[p].textContent = scores[p];
    st = 'result'; timer = 1.3;
    pending.delete(k);
    sfx[g](); flash(msg, t(g), g);
    ringMat.color.setHex(col);
    hint.classList.add('hide');
    if (pts) burst.emit(Math.cos(angle) * R, Math.sin(angle) * R, 0, col, 10 + pts / 3 | 0, 5);
    if (g === 'perfect') buzz(40);
  }

  function tap(auto, a = auto ? null : angleAt(performance.now())) {
    if (st === 'intro' && !auto && mine()) { flash(msg, t('waitGo'), 'miss'); return; } // early: the turn isn't spent, say so
    if (st !== 'spin' || !mine()) return;
    if (online) send({ t: 'tap', from: who(), k, a });
    resolve(a);
  }

  // AI aims at the zone with a triangular error (mostly great/good, sometimes perfect), ~12% flat misses
  function planBot() {
    const r = cur(), dir = Math.sign(r.sp);
    const e = Math.random() < .12 ? 1.3 * (Math.random() < .5 ? -1 : 1) : (Math.random() + Math.random() - 1) * .8;
    const da = ((((r.c + e * r.half - r.a0) * dir) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2); // forward distance to aim point
    return { a: r.a0 + dir * da, ms: da / Math.abs(r.sp) * 1000 };
  }

  function botify(i, local) {
    ai.add(i);
    if (local) ctrl.add(i);
    ts[i].querySelector('b').textContent = label(i);
    if (i === who()) { turnEl.textContent = t('turn', { p: label(i) }); hint.textContent = human() ? t('tapHint') : t('waitRival'); }
  }

  function update(dt) {
    time += dt; timer -= dt;
    const now = performance.now();
    if (st === 'intro' && timer <= 0) { st = 'spin'; spinStart = now; if (pending.has(k)) resolve(pending.get(k)); }
    else if (st === 'spin') {
      angle = angleAt(now);
      if (mine() && ai.has(who()) && now - spinStart >= (botPlan ??= planBot()).ms) tap(false, botPlan.a);
      else if (mine() && Math.abs(angle - cur().a0) > Math.PI * 2 * LAPS) tap(true);
    }
    else if (st === 'result' && timer <= 0) {
      if (++k < TURNS) beginTurn();
      else {
        st = 'done';
        const order = [...scores.keys()].sort((a, b) => scores[b] - scores[a]);
        onEnd({ order, draw: scores[order[0]] === scores[order[1]], scores: scores.map(s => t('pts', { n: s })) });
      }
    }
    orb.position.set(Math.cos(angle) * R, Math.sin(angle) * R, 0);
    for (let i = 0; i < TRAIL; i++) {
      const a = st === 'spin' ? angleAt(now - (i + 1) * 18) : angle;
      trail.setMatrixAt(i, M.compose(P.set(Math.cos(a) * R, Math.sin(a) * R, 0), Q, S.setScalar(st === 'spin' ? 1 - i / TRAIL : .001)));
    }
    trail.instanceMatrix.needsUpdate = true;
    core.rotation.x += dt * .35; core.rotation.y += dt * .5;
    shell.rotation.x -= dt * .12; shell.rotation.y -= dt * .18;
    nebula.rotation.z = time * .01;
    halo.rotation.z += dt * .15; halo2.rotation.z -= dt * .1;
    zoneMat.opacity = .65 + .35 * Math.sin(time * 6);
    ringMat.color.lerp(base, Math.min(1, dt * 3));
    cam.position.x = Math.sin(time * .25) * .4;
    cam.position.y = Math.cos(time * .2) * .3;
    cam.lookAt(0, 0, 0);
    burst.update(dt);
  }

  function resize() {
    const a = innerWidth / innerHeight;
    cam.aspect = a;
    cam.position.z = Math.max(9.5, (R + 1.4) / (Math.tan(THREE.MathUtils.degToRad(25)) * a)); // fit ring width on portrait phones
    scene.fog.near = cam.position.z + 3; scene.fog.far = cam.position.z + 26;
    cam.updateProjectionMatrix();
  }

  function render() {
    renderer.setViewport(0, 0, innerWidth, innerHeight);
    renderer.render(scene, cam);
  }

  function onNet(m) {
    if (m.t !== 'tap' || typeof m.k !== 'number' || m.k % n !== m.from || ctrl.has(m.from)) return; // only the turn's owner may resolve it
    const a = typeof m.a === 'number' ? m.a : null;
    if (m.k === k && st === 'spin') resolve(a);
    else if (m.k >= k) pending.set(m.k, a);
  }

  const onDown = e => { if (e.button <= 0 && human()) tap(); };
  const onKey = e => { if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) { e.preventDefault(); if (human()) tap(); } };
  const cv = renderer.domElement;
  cv.addEventListener('pointerdown', onDown);
  addEventListener('keydown', onKey);

  function dispose() {
    cv.removeEventListener('pointerdown', onDown);
    removeEventListener('keydown', onKey);
    hud.remove();
    disposeScene(scene);
  }

  resize();
  beginTurn();
  bots.forEach(i => botify(i, me === 0));
  return { update, render, resize, onNet, dispose, botify };
}
