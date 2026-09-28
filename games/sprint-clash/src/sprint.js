import * as THREE from 'three';
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { COL, hex, canvasTex, disposeScene, flash, buzz, Burst } from './fx.js';
import { coarse, keyHint, zones, makePane, rankChips, layout, fitFov, renderPanes, bindInput, countdown, makeShowcase, addSky, lights, makeRunner, animRunner, placeRunner, nameTag } from './stage.js';

// Track & field triathlon on side-by-side lanes: 100 m, 110 m hurdles, long jump.
// Alternate Left/Right to run (same foot twice = stumble), Action jumps. Place per event scores 4/3/2/1.
const LANE = 1.9, K = 1.1, IMP = 1.45, VMAX = 11.5, G = 16, JV = 5.4, CAP = 30, BOARD = 40;
const EV = [{ key: 'ev100', len: 100 }, { key: 'evHurdles', len: 110, hurdles: true }, { key: 'evLong', len: BOARD + 8, long: true }];
const HURDLES = Array.from({ length: 10 }, (_, k) => 13.72 + k * 9.14);
const PTS = [4, 3, 2, 1], DNF = 99.99, FOUL = -1;
const needle = T => 8 + 67 * (.5 - .5 * Math.cos(T * Math.PI * 2 / 1.1)); // long-jump angle gauge, degrees

export function createSprint({ renderer, mode, n = 2, me = 0, bots = [], send, label, onEnd }) {
  const online = mode === 'online';
  const IDX = [...Array(n).keys()], LX = IDX.map(i => (i - (n - 1) / 2) * LANE), W = n * LANE;
  const scene = new THREE.Scene(), fogC = new THREE.Color(0x0c1233);
  scene.background = fogC;
  scene.fog = new THREE.Fog(fogC, 30, 110);
  lights(scene);
  const sky = addSky(scene, fogC, 0x2a2a7c);
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  // ground, track, lane lines, 10 m ticks
  const grid = canvasTex(64, 64, (g, w) => { g.fillStyle = '#080c22'; g.fillRect(0, 0, w, w); g.strokeStyle = '#1f2a5a'; g.lineWidth = 2; g.strokeRect(0, 0, w, w); });
  grid.wrapS = grid.wrapT = THREE.RepeatWrapping; grid.repeat.set(30, 40); grid.anisotropy = aniso;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 320).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: grid }));
  ground.position.set(0, -.02, -60);
  const trackTex = canvasTex(64, 64, (g, w) => { g.fillStyle = '#3a1830'; g.fillRect(0, 0, w, w); g.fillStyle = '#44203a'; for (let k = 0; k < 90; k++) g.fillRect(Math.random() * w, Math.random() * w, 2, 2); });
  trackTex.wrapS = trackTex.wrapT = THREE.RepeatWrapping; trackTex.repeat.set(W / 2, 70); trackTex.anisotropy = aniso;
  const track = new THREE.Mesh(new THREE.PlaneGeometry(W + 1.2, 140).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: trackTex, roughness: .8 }));
  track.position.set(0, 0, -60);
  scene.add(ground, track);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xe8ecff, transparent: true, opacity: .7 });
  const laneLine = new THREE.PlaneGeometry(.06, 140).rotateX(-Math.PI / 2);
  for (let k = 0; k <= n; k++) { const m = new THREE.Mesh(laneLine, lineMat); m.position.set((k - n / 2) * LANE, .01, -60); scene.add(m); }
  const tick = new THREE.PlaneGeometry(W, .08).rotateX(-Math.PI / 2);
  for (let d = 10; d < 120; d += 10) { const m = new THREE.Mesh(tick, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .25 })); m.position.set(0, .01, -d); scene.add(m); }
  const startLine = new THREE.Mesh(new THREE.PlaneGeometry(W, .12).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  startLine.position.set(0, .012, 0);
  scene.add(startLine);

  // finish gantry (moved per event)
  const checker = canvasTex(64, 16, g => { for (let x = 0; x < 8; x++) for (let y = 0; y < 2; y++) { g.fillStyle = (x + y) % 2 ? '#111' : '#fff'; g.fillRect(x * 8, y * 8, 8, 8); } });
  checker.magFilter = THREE.NearestFilter; checker.wrapS = THREE.RepeatWrapping; checker.repeat.set(n, 1);
  const checkMat = new THREE.MeshBasicMaterial({ map: checker, side: THREE.DoubleSide, toneMapped: false });
  const finish = new THREE.Group();
  const fline = new THREE.Mesh(new THREE.PlaneGeometry(W, .8).rotateX(-Math.PI / 2), checkMat); fline.position.y = .013;
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(W + .6, .7), checkMat); banner.position.y = 3.4;
  const postMat = new THREE.MeshBasicMaterial({ color: 0xffd23f, toneMapped: false });
  finish.add(fline, banner);
  for (const s of [-1, 1]) { const po = new THREE.Mesh(new THREE.BoxGeometry(.16, 3.8, .16), postMat); po.position.set(s * (W / 2 + .3), 1.9, 0); finish.add(po); }
  scene.add(finish);

  // hurdles: bar + 2 legs per lane per hurdle; knocked ones tip forward
  const NH = HURDLES.length * n;
  const hBar = new THREE.InstancedMesh(new THREE.BoxGeometry(LANE * .8, .12, .06), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xff4f8b, emissiveIntensity: .35 }), NH);
  const hLeg = new THREE.InstancedMesh(new THREE.BoxGeometry(.05, .9, .05), new THREE.MeshStandardMaterial({ color: 0x9aa4c8, metalness: .5, roughness: .4 }), NH * 2);
  [hBar, hLeg].forEach(m => { m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); });
  const tip = Array(NH).fill(0), knocked = Array(NH).fill(false);
  const MB = new THREE.Matrix4(), MO = new THREE.Matrix4();
  function hurdleMatrices() {
    for (let i = 0; i < n; i++) HURDLES.forEach((hd, k) => {
      const j = i * HURDLES.length + k;
      MB.makeRotationX(-tip[j]).setPosition(LX[i], 0, -hd);
      hBar.setMatrixAt(j, MO.makeTranslation(0, .9, 0).premultiply(MB));
      hLeg.setMatrixAt(j * 2, MO.makeTranslation(-LANE * .38, .45, 0).premultiply(MB));
      hLeg.setMatrixAt(j * 2 + 1, MO.makeTranslation(LANE * .38, .45, 0).premultiply(MB));
    });
    hBar.instanceMatrix.needsUpdate = hLeg.instanceMatrix.needsUpdate = true;
  }
  hurdleMatrices();

  // long jump: take-off board + sand pit
  const pit = new THREE.Group();
  const board = new THREE.Mesh(new THREE.BoxGeometry(W, .03, .2), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })); board.position.set(0, .02, -BOARD);
  const sand = new THREE.Mesh(new THREE.BoxGeometry(W + .4, .06, 10), new THREE.MeshStandardMaterial({ color: 0xc9a46a, roughness: 1 })); sand.position.set(0, .01, -BOARD - 5.3);
  pit.add(board, sand);
  for (let m = 5; m <= 9; m++) { const tk = new THREE.Mesh(new THREE.PlaneGeometry(W + .4, .05).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5 })); tk.position.set(0, .05, -BOARD - m); pit.add(tk); }
  scene.add(pit);

  // stands with a crowd on both sides, floodlights (cosmetic)
  {
    const rows = 4, per = 70, crowd = new THREE.InstancedMesh(new THREE.BoxGeometry(.5, .7, .5), new THREE.MeshStandardMaterial({ roughness: .8 }), rows * per * 2);
    const tier = new THREE.InstancedMesh(new THREE.BoxGeometry(1.6, 1, 150), new THREE.MeshStandardMaterial({ color: 0x141a40, roughness: .9 }), rows * 2);
    const M = new THREE.Matrix4(), c = new THREE.Color(), pal = [0x35e0ff, 0xff4f8b, 0xb6ff3a, 0xffa53a, 0xffd23f, 0xe8ecff, 0x7a5cff];
    let k = 0;
    for (const s of [-1, 1]) for (let r = 0; r < rows; r++) {
      const x = s * (W / 2 + 7 + r * 1.6), y = r * 1 + .5;
      tier.setMatrixAt((s > 0 ? rows : 0) + r, M.makeScale(1, y * 2, 1).setPosition(x, y, -60));
      for (let q = 0; q < per; q++) {
        crowd.setMatrixAt(k, M.makeTranslation(x + (Math.random() - .5) * .6, y * 2 + .35, 10 - q * 2.1 - Math.random()));
        crowd.setColorAt(k++, c.setHex(pal[Math.random() * pal.length | 0]).multiplyScalar(.35 + Math.random() * .4));
      }
    }
    scene.add(tier, crowd);
    const poleGeo = new THREE.CylinderGeometry(.12, .16, 14, 8), headGeo = new THREE.BoxGeometry(2, .8, .3), poleMat = new THREE.MeshStandardMaterial({ color: 0x222844 }), headMat = new THREE.MeshBasicMaterial({ color: 0xfff6d8, toneMapped: false });
    for (const s of [-1, 1]) for (const d of [-5, 45, 95]) {
      const pole = new THREE.Mesh(poleGeo, poleMat); pole.position.set(s * (W / 2 + 15), 7, -d);
      const head = new THREE.Mesh(headGeo, headMat); head.position.set(s * (W / 2 + 14.6), 14, -d); head.rotation.y = s * .4;
      scene.add(pole, head);
    }
  }

  const players = IDX.map(i => {
    const r = makeRunner(COL[i]), tag = nameTag(label(i), COL[i]);
    r.add(tag);
    scene.add(r);
    return { i, r, tag, cam: new THREE.PerspectiveCamera(55, 1, .1, 160), fov: 55, local: !online || i === me, bot: false, run: 0 };
  });
  const burst = new Burst(scene);

  const panes = (online ? [me] : IDX).map(pi => {
    const v = makePane(pi, label, `${zones('L', '▲', 'R')}<div class="pbar"></div><div class="gauge"><i></i></div>`);
    v.chips = rankChips(v, n, label);
    v.gauge = v.q('.gauge'); v.nd = v.q('.gauge i');
    v.dots = IDX.map(j => { const d = document.createElement('i'); if (j !== pi) { d.className = 'op'; d.style.setProperty('--o', hex(j)); } return d; });
    v.q('.pbar').append(...v.dots.filter((_, j) => j !== pi), v.dots[pi]);
    return v;
  });
  const paneOf = i => panes.find(v => v.pi === i);
  const say = (p, text, cls) => { const v = paneOf(p.i); if (v) flash(v.msg, text, cls); };
  const sc = makeShowcase(panes, label, onEnd);

  let e = 0, state = 'title', timer = 1.6, T = 0, sendT = 0, hudT = 0, step = null, champ = 0;
  const res = EV.map(() => Array(n).fill(undefined)), total = Array(n).fill(0);
  const chips = () => panes.forEach(v => v.chips(total));
  const fmt = (ev, v) => (EV[ev].long ? (v === FOUL ? t('foul') : t('meters', { n: v.toFixed(2) })) : v >= DNF ? 'DNF' : t('time', { n: v.toFixed(2) }));

  function beginEvent() {
    const ev = EV[e];
    state = 'title'; timer = 1.6; T = 0;
    for (const p of players) Object.assign(p, { d: 0, v: 0, y: 0, vy: 0, foot: null, stumble: 0, done: false, air: null, td: 0, ty: 0, bs: { t: .2, dec: new Map() } });
    tip.fill(0); knocked.fill(false); hurdleMatrices();
    hBar.visible = hLeg.visible = !!ev.hurdles;
    pit.visible = !!ev.long;
    finish.visible = !ev.long;
    finish.position.z = -ev.len;
    for (const v of panes) {
      flash(v.msg, t(ev.key), 'go');
      const kh = keyHint(v.pi, online);
      v.hint.textContent = ev.long ? t(coarse ? 'longTouch' : 'longKeys', kh) : ev.hurdles ? t(coarse ? 'hurdleTouch' : 'hurdleKeys', kh) : t(coarse ? 'sprintTouch' : 'sprintKeys', kh);
      v.hint.classList.remove('hide');
      v.gauge.classList.toggle('on', !!ev.long);
      v.val.textContent = '0.00';
    }
    sfx.turn();
  }

  function done(p, val) {
    p.done = true;
    res[e][p.i] = val;
    if (online) send({ t: 'ev', from: p.i, e, v: val });
    say(p, fmt(e, val), val === FOUL || val >= DNF ? 'miss' : 'go');
    if (paneOf(p.i)) val === FOUL ? sfx.miss() : sfx.finish();
    const v = paneOf(p.i);
    if (v && online && players.some(o => res[e][o.i] === undefined)) { v.hint.textContent = t('waitRival'); v.hint.classList.remove('hide'); }
  }

  function scoreEvent() {
    const row = res[e], better = EV[e].long ? (a, b) => b - a : (a, b) => a - b;
    const sorted = [...IDX].sort((a, b) => better(row[a], row[b]));
    IDX.forEach(i => {
      // solo: points from the result itself, ~1000 for a world-class mark (10 s dash, 13 s hurdles, 8 m jump)
      const gain = n > 1 ? PTS[sorted.findIndex(j => row[j] === row[i])] // equal results share a place
        : EV[e].long ? Math.max(0, Math.round(row[i] * 125)) : Math.round((EV[e].hurdles ? 13000 : 10000) / row[i]);
      total[i] += gain;
      const v = paneOf(i);
      if (v) flash(v.msg, `+${gain}`, gain === 4 && n > 1 ? 'perfect' : 'great');
    });
    chips();
    state = 'post'; timer = 2.4;
  }

  function tap(p, a) {
    if (p.air || p.stumble > 0) return;
    const heard = !!paneOf(p.i);
    if (p.foot === a) { p.stumble = .35; p.v *= .6; p.foot = null; if (heard) { say(p, t('stumble'), 'hit'); sfx.miss(); } return; } // any foot restarts the rhythm
    p.v = Math.min(VMAX, p.v + IMP); p.foot = a;
    if (heard) sfx.foot();
  }

  function jump(p) {
    const ev = EV[e];
    if (p.y > 0 || p.air) return;
    if (ev.hurdles) { p.vy = JV; if (paneOf(p.i)) sfx.jump(); }
    else if (ev.long) {
      const th = THREE.MathUtils.degToRad(needle(T)), vx = p.v * Math.cos(th) * .95, vy = p.v * Math.sin(th), tf = 2 * vy / 9.81;
      const land = p.d + vx * tf;
      p.air = { d0: p.d, vx, vy, t: 0, tf, land, mark: Math.max(0, Math.round((land - BOARD) * 100) / 100) };
      if (paneOf(p.i)) sfx.jump();
    }
  }

  // AI: 6.8–8.6 taps/s with 3% wrong-foot slips, jumps hurdles at a planned lead time (12% missed),
  // takes off near the board when the gauge is in a decent range
  function botStep(p, dt) {
    const b = p.bs, ev = EV[e];
    if ((b.t -= dt) <= 0) { b.t = 1 / (6.8 + Math.random() * 1.8); tap(p, Math.random() < .03 && p.foot ? p.foot : p.foot === 'L' ? 'R' : 'L'); }
    if (ev.hurdles && p.y <= 0) {
      const h = HURDLES.find(hd => hd > p.d + .3);
      if (h != null) {
        if (!b.dec.has(h)) b.dec.set(h, Math.random() < .12 ? -1 : .18 + Math.random() * .16);
        const lead = b.dec.get(h);
        if (lead > 0 && (h - p.d) / Math.max(p.v, 1) <= lead) jump(p);
      }
    }
    if (ev.long) {
      b.win ??= .2 + Math.random() * 1.1;
      const th = needle(T);
      if ((p.d > BOARD - b.win && th > 32 && th < 55) || p.d > BOARD - .15) jump(p);
    }
  }

  function hurdleHit(p, real) {
    for (let k = 0; k < HURDLES.length; k++) {
      const j = p.i * HURDLES.length + k;
      if (knocked[j] || Math.abs(p.d - HURDLES[k]) > .3 || p.y > .6) continue;
      knocked[j] = true;
      burst.emit(LX[p.i], .9, -HURDLES[k], 0xff4f8b, 14, 4);
      if (!real) continue;
      p.v *= .35; p.stumble = .45; p.foot = null;
      if (paneOf(p.i)) { say(p, t('trip'), 'hit'); sfx.hit(); buzz(50); }
    }
  }

  function stepLocal(p, dt) {
    const ev = EV[e];
    if (p.bot && !p.done && state === 'run') botStep(p, dt);
    if (p.air) {
      const a = p.air;
      a.t = Math.min(a.tf, a.t + dt);
      p.d = a.d0 + a.vx * a.t; p.y = a.vy * a.t - 4.9 * a.t * a.t;
      if (a.t >= a.tf) {
        p.y = 0; p.v = 0; p.air = null;
        burst.emit(LX[p.i], .1, -p.d, 0xe8c890, 30, 4);
        if (!p.done) done(p, a.mark);
      }
      return;
    }
    p.stumble -= dt;
    p.v = Math.max(0, p.v - p.v * (p.done ? 2.5 : K) * dt);
    p.d += p.v * dt;
    p.vy -= G * dt; p.y += p.vy * dt;
    if (p.y <= 0) { p.y = 0; p.vy = 0; }
    if (p.done || state !== 'run') return;
    if (ev.hurdles) hurdleHit(p, true);
    if (ev.long && p.d > BOARD + .05) { p.v = Math.min(p.v, 3); done(p, FOUL); }
    else if (!ev.long && p.d >= ev.len) done(p, Math.round((T - (p.d - ev.len) / Math.max(p.v, .1)) * 100) / 100);
    else if (T > CAP) done(p, ev.long ? FOUL : DNF);
  }

  function stepRemote(p, dt) {
    const pd = p.d;
    p.d += (p.td - p.d) * Math.min(1, dt * 10);
    p.y += (p.ty - p.y) * Math.min(1, dt * 15);
    p.v = Math.max(0, (p.d - pd) / Math.max(dt, 1e-3));
    if (EV[e].hurdles) hurdleHit(p, false);
  }

  function update(dt) {
    if (state === 'title' && (timer -= dt) <= 0) { state = 'count'; step = countdown(panes); }
    else if (state === 'count' && !step(dt)) state = 'run';
    else if (state === 'run') {
      T += dt;
      if (T > 2.5) panes.forEach(v => { if (!players[v.pi].done) v.hint.classList.add('hide'); });
      if (res[e].every(v => v !== undefined)) { scoreEvent(); }
    } else if (state === 'post' && (timer -= dt) <= 0) {
      if (e + 1 < EV.length) { e++; beginEvent(); }
      else {
        state = 'end';
        const order = [...IDX].sort((a, b) => total[b] - total[a]);
        champ = order[0];
        sc.start({ order, draw: total[order[0]] === total[order[1]], scores: total.map(s => t('pts', { n: s })) }, () => players[champ].r.position, { r: 5.5, h: 2.6, look: 1.1 });
        const c = players[champ].r.position;
        burst.emit(c.x, c.y + 1, c.z, COL[champ], 30, 6);
      }
    }

    for (const p of players) {
      p.local ? stepLocal(p, dt) : stepRemote(p, dt);
      p.run += dt * p.v * 1.3;
      placeRunner(p.r, LX[p.i], p.y, -p.d);
      animRunner(p.r, p.run, Math.min(1, p.v / 7) * .95, p.y > .05 ? .7 : 0);
      p.r.userData.body.rotation.x = p.stumble > 0 ? -.5 : -Math.min(p.v, 12) * .015;
    }
    if (EV[e].hurdles) {
      for (let j = 0; j < NH; j++) if (knocked[j] && tip[j] < 1.45) tip[j] = Math.min(1.45, tip[j] + dt * 7);
      hurdleMatrices();
    }
    burst.update(dt);
    sc.update(dt);

    if (online && state === 'run' && (sendT -= dt) <= 0) {
      sendT = .066;
      for (const p of players) if (p.local) send({ t: 'p', from: p.i, d: p.d, y: p.y });
    }
    if ((hudT -= dt) <= 0) {
      hudT = .05;
      const ev = EV[e];
      for (const v of panes) {
        const p = players[v.pi], r = res[e][v.pi];
        const s = r !== undefined ? fmt(e, r) : ev.long && p.air ? t('meters', { n: Math.max(0, p.d - BOARD).toFixed(2) }) : T.toFixed(2);
        if (v.val.textContent !== s) v.val.textContent = s; // frozen after the mark: no DOM write
        v.dots.forEach((d, j) => { d.style.transform = `translateX(${Math.min(100, players[j].d / ev.len * 100)}cqw)`; });
        if (ev.long) v.nd.style.transform = `rotate(${p.air ? THREE.MathUtils.radToDeg(Math.atan2(p.air.vy, p.air.vx / .95)) : needle(T)}deg)`;
      }
    }
  }

  function resize() {
    layout(panes);
    for (const v of panes) { const p = players[v.pi]; p.cam.aspect = v.w / v.h; p.fov = fitFov(p.cam.aspect, 30, 55, 95); }
  }

  const look = new THREE.Vector3();
  function render() {
    renderPanes(renderer, scene, panes, v => {
      const p = players[v.pi], c = p.cam, x = LX[p.i];
      if (sc.on) { sc.cam(v, c, p.fov); sky.position.copy(c.position); return c; }
      c.position.set(x + 1.1, 3.1, -p.d + 5.4); // chase cam: neighbours run beside you, never in front
      c.lookAt(look.set(x, 1.1 + p.y * .4, -p.d - 4));
      if (v.flip) c.rotateZ(Math.PI);
      c.fov = p.fov; c.updateProjectionMatrix();
      sky.position.copy(c.position);
      return c;
    });
  }

  const act = (pi, a) => {
    const p = players[pi];
    if (!p?.local || p.bot || state !== 'run' || p.done) return;
    a === 'A' ? jump(p) : tap(p, a);
  };
  const unbind = bindInput({ cv: renderer.domElement, panes, n, online, me, act });

  function onNet(m) {
    const p = players[m.from];
    if (!p || p.local) return;
    if (m.t === 'p' && typeof m.d === 'number') { p.td = m.d; p.ty = +m.y || 0; }
    else if (m.t === 'ev' && Number.isInteger(m.e) && m.e >= 0 && m.e < EV.length && typeof m.v === 'number' && res[m.e][p.i] === undefined) res[m.e][p.i] = m.v;
  }

  function botify(i, local) {
    const p = players[i];
    if (!p) return;
    p.bot = true;
    p.tag.userData.set(label(i));
    chips();
    if (!local || p.local) return;
    Object.assign(p, { local: true, d: p.td, y: 0, vy: 0, v: 8, stumble: 0, done: res[e][i] !== undefined });
  }

  function dispose() {
    unbind();
    panes.forEach(v => v.el.remove());
    document.body.classList.remove('split-v');
    disposeScene(scene);
  }

  beginEvent();
  resize();
  chips();
  bots.forEach(i => botify(i, me === 0));
  return { update, render, resize, onNet, dispose, botify };
}
