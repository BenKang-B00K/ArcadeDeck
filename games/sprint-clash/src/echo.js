import * as THREE from 'three';
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { COL, hex, canvasTex, disposeScene, flash, buzz, Burst } from './fx.js';
import { coarse, keyHint, zones, makePane, layout, bindInput, lights, symTex } from './stage.js';

// Memory relay: on your turn replay the whole chain, then add one note. A wrong note or a timeout is out.
// Each pad is a D Dorian pitch (D, A, B♮), so the chain turns into a melody. Last player standing wins.
// The device that controls the current player judges its inputs and timeouts and broadcasts them.
const PADC = [0x8a6bff, 0xffd23f, 0x5cf2d0], SYM = ['L', 'A', 'R'], FIRST = 3.5, ADD = 3, MAXO = 48;
const windowFor = len => Math.max(.9, 2 - len * .06);

export function createEcho({ renderer, mode, n = 2, me = 0, bots = [], label, send, onEnd }) {
  const online = mode === 'online';
  const IDX = [...Array(n).keys()];
  const scene = new THREE.Scene(), bg = new THREE.Color(0x080c22);
  scene.background = bg;
  scene.fog = new THREE.Fog(bg, 14, 40);
  lights(scene);
  const cam = new THREE.PerspectiveCamera(48, 1, .1, 80);

  const floorTex = canvasTex(256, 256, (g, w) => {
    const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    gr.addColorStop(0, '#1c2458'); gr.addColorStop(.7, '#0c1130'); gr.addColorStop(1, '#080c22');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
    g.strokeStyle = 'rgba(140,160,255,.12)'; g.lineWidth = 1;
    for (let r = 20; r < w / 2; r += 18) { g.beginPath(); g.arc(w / 2, w / 2, r, 0, 7); g.stroke(); }
  });
  scene.add(new THREE.Mesh(new THREE.CircleGeometry(12, 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: floorTex })));
  const ringMat = new THREE.MeshBasicMaterial({ color: COL[0], toneMapped: false });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(5.4, .05, 6, 96).rotateX(Math.PI / 2), ringMat);
  ring.position.y = .02;
  scene.add(ring);
  {
    const sp = [];
    for (let i = 0; i < 400; i++) sp.push((Math.random() - .5) * 70, 2 + Math.random() * 25, -10 - Math.random() * 30);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x8fa0ff, size: .09, fog: false })));
  }

  const tex = SYM.map(symTex);
  const padGeo = new THREE.CylinderGeometry(1.15, 1.25, .35, 6), symGeo = new THREE.PlaneGeometry(1.1, 1.1).rotateX(-Math.PI / 2), waveGeo = new THREE.TorusGeometry(1.25, .05, 6, 48).rotateX(Math.PI / 2);
  const pads = PADC.map((c, k) => {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: .15, roughness: .3, metalness: .2, flatShading: true });
    const pad = new THREE.Mesh(padGeo, mat);
    pad.position.y = .18;
    const sym = new THREE.Mesh(symGeo, new THREE.MeshBasicMaterial({ map: tex[k], transparent: true, opacity: .85, depthWrite: false, toneMapped: false }));
    sym.position.y = .37;
    pad.add(sym);
    const wave = new THREE.Mesh(waveGeo, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
    wave.position.y = .05;
    g.add(pad, wave);
    g.position.x = (k - 1) * 2.9;
    g.rotation.y = (1 - k) * .12;
    scene.add(g);
    return { pad, mat, wave, pulse: 0 };
  });
  const orbs = new THREE.InstancedMesh(new THREE.SphereGeometry(.17, 14, 10), new THREE.MeshBasicMaterial({ toneMapped: false }), MAXO);
  orbs.count = 0; orbs.frustumCulled = false;
  orbs.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(orbs);
  const burst = new Burst(scene);
  const M = new THREE.Matrix4(), C = new THREE.Color();

  // HUD: one full-screen pane (pi -1: a tap acts for whoever's turn it is on this device)
  const v = makePane(-1, label, `${zones('◀', '★', '▶')}<div class="tbar">${IDX.map(i => `<div class="ts" style="--c:${hex(i)}"><b></b><span>0</span></div>`).join('')}<div class="tround"></div><div class="etime"><i></i></div></div><div class="tturn"></div>`);
  v.q('.ptop').remove();
  const panes = [v], ts = [...v.el.querySelectorAll('.ts')], sc = ts.map(el => el.querySelector('span'));
  const turnEl = v.q('.tturn'), statusEl = v.q('.tround'), barEl = v.q('.etime i');

  let st = 'intro', timer = 0, cur = 0, idx = 0, k = 0, winT = FIRST, winMax = FIRST, botT = 0, time = 0;
  const chain = [], best = Array(n).fill(0), elim = [], queue = [];
  let alive = [...IDX];
  const ctrl = new Set(online ? [me] : IDX), ai = new Set();
  const owner = () => ctrl.has(cur), human = () => owner() && !ai.has(cur);
  const labels = () => ts.forEach((el, i) => { el.querySelector('b').textContent = label(i); });

  function status() {
    statusEl.textContent = idx < chain.length ? t('echoReplay', { i: idx, n: chain.length }) : t('echoAdd');
  }

  function beginTurn() {
    st = 'intro'; timer = 1.1; idx = 0; botT = .6 + Math.random() * .3;
    ringMat.color.setHex(COL[cur]);
    ts.forEach((el, i) => el.classList.toggle('on', i === cur));
    turnEl.style.setProperty('--c', hex(cur));
    turnEl.textContent = t('turn', { p: label(cur) });
    status();
    v.hint.textContent = human() ? (coarse ? t('echoTouch') : t('echoKeys', keyHint(online ? me : cur, online))) : t('echoWatch');
    v.hint.classList.remove('hide');
    sfx.turn();
  }

  function next() {
    if (alive.length <= (n > 1 ? 1 : 0)) { // solo: play on until you slip
      st = 'done';
      const order = [...alive, ...elim.slice().reverse()];
      onEnd({ order, draw: false, scores: best.map(b => t('chainN', { n: b })) });
      return;
    }
    for (let s = 1; s <= n; s++) { const c = (cur + s) % n; if (alive.includes(c)) { cur = c; break; } }
    k++;
    beginTurn();
  }

  function fail() {
    alive = alive.filter(i => i !== cur);
    elim.push(cur);
    ts[cur].classList.add('out');
    sc[cur].textContent = '✕';
    st = 'out'; timer = 1.5;
    flash(v.msg, t('out'), 'hit');
    sfx.fall(); buzz(80);
    v.hint.classList.add('hide');
  }

  function input(val) {
    if (val < 0) return fail();
    const p = pads[val];
    p.pulse = 1;
    sfx.note(val);
    burst.emit(p.pad.parent.position.x, .5, 0, PADC[val], 10, 3);
    if (idx < chain.length) {
      if (val !== chain[idx]) return fail();
      idx++;
      winT = winMax = idx < chain.length ? windowFor(chain.length) : ADD;
      status();
    } else {
      chain.push(val);
      best[cur] = chain.length;
      sc[cur].textContent = chain.length;
      st = 'ok'; timer = .9;
      flash(v.msg, t('chainN', { n: chain.length }), 'great');
      v.hint.classList.add('hide');
    }
  }

  function press(val) {
    if (online) send({ t: 'ec', from: cur, k, v: val });
    input(val);
  }

  function startPlay() {
    st = 'play'; winT = winMax = chain.length ? windowFor(chain.length) + .5 : FIRST;
    flash(v.msg, t('echoStart'), 'go'); sfx.go(); // the window timer runs from here
  }

  function update(dt) {
    time += dt; timer -= dt;
    if (st === 'intro' && timer <= 0) startPlay();
    else if (st === 'play') {
      winT -= dt;
      while (queue.length && queue[0].k < k) queue.shift();
      while (st === 'play' && !owner() && queue.length && queue[0].k === k) { const m = queue.shift(); if (m.from === cur) input(m.v); }
      if (st === 'play' && owner()) {
        if (ai.has(cur) && (botT -= dt) <= 0) { // AI: 0.45–0.8 s per note, error rate grows with chain length
          botT = .45 + Math.random() * .35;
          const e = .015 + chain.length * .012;
          press(idx < chain.length ? (Math.random() < e ? (chain[idx] + 1 + (Math.random() * 2 | 0)) % 3 : chain[idx]) : Math.random() * 3 | 0);
        } else if (winT <= 0) press(-1);
      }
    } else if ((st === 'ok' || st === 'out') && timer <= 0) next();

    barEl.style.transform = `scaleX(${st === 'play' ? Math.max(0, winT / winMax) : 0})`;
    for (const p of pads) {
      p.pulse = Math.max(0, p.pulse - dt * 2.5);
      p.mat.emissiveIntensity = .15 + p.pulse * 1.4;
      p.pad.position.y = .18 - p.pulse * .08;
      p.wave.scale.setScalar(1 + (1 - p.pulse) * 1.6);
      p.wave.material.opacity = p.pulse * .9;
    }
    // chain orbs: replayed ones lit, the open slot blinks in the player's colour
    const adding = st === 'play' && idx === chain.length, total = Math.min(MAXO, chain.length + (adding ? 1 : 0));
    orbs.count = total;
    for (let i = 0; i < total; i++) {
      const row = i / 16 | 0, inRow = Math.min(16, total - row * 16), c = i % 16;
      orbs.setMatrixAt(i, M.makeTranslation((c - (inRow - 1) / 2) * .55, 1.25 - row * .45 + Math.sin(time * 2 + i * .5) * .05, -1.9 + row * .35));
      orbs.setColorAt(i, i === chain.length ? C.setHex(COL[cur]).multiplyScalar(.5 + .5 * Math.sin(time * 8)) : i < idx ? C.setHex(0xfff6c0) : C.setHex(0x2c3470));
    }
    orbs.instanceMatrix.needsUpdate = true;
    if (orbs.instanceColor) orbs.instanceColor.needsUpdate = true;
    ring.rotation.y += dt * .2;
    cam.position.x = Math.sin(time * .25) * .3;
    burst.update(dt);
  }

  function resize() {
    layout(panes);
    const a = innerWidth / innerHeight, kf = Math.max(1, 1.45 / a); // back off on portrait so all three pads fit
    cam.aspect = a;
    cam.position.set(0, 5.4 * kf, 6.6 * kf);
    cam.lookAt(0, .5, -.6);
    scene.fog.near = 8.5 * kf + 4; scene.fog.far = 8.5 * kf + 30;
    cam.updateProjectionMatrix();
  }

  function render() {
    renderer.setViewport(0, 0, innerWidth, innerHeight);
    renderer.render(scene, cam);
  }

  const act = (pi, a) => {
    if (pi < 0) pi = online ? me : cur;
    if (pi !== cur || (st !== 'play' && st !== 'intro') || !human()) return;
    if (st === 'intro') startPlay(); // pressed before your cue: the turn starts now, so that note still counts
    press(SYM.indexOf(a));
  };
  const unbind = bindInput({ cv: renderer.domElement, panes, n, online, me, act });

  function onNet(m) {
    if (m.t !== 'ec' || !Number.isInteger(m.k) || !Number.isInteger(m.v) || m.v < -1 || m.v > 2 || ctrl.has(m.from)) return;
    queue.push(m);
  }

  function botify(i, local) {
    ai.add(i);
    if (local) ctrl.add(i);
    labels();
    if (i === cur) { turnEl.textContent = t('turn', { p: label(i) }); v.hint.textContent = t('echoWatch'); }
  }

  function dispose() {
    unbind();
    v.el.remove();
    tex.forEach(x => x.dispose());
    disposeScene(scene);
  }

  labels();
  resize();
  beginTurn();
  bots.forEach(i => botify(i, me === 0));
  return { update, render, resize, onNet, dispose, botify };
}
