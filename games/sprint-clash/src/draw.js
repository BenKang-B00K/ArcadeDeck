import * as THREE from 'three';
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { COL, canvasTex, disposeScene, flash, buzz, Burst } from './fx.js';
import { coarse, keyHint, zones, makePane, rankChips, layout, fitFov, renderPanes, bindInput, countdown, addSky, lights, symTex, makeRunner, animRunner, placeRunner } from './stage.js';

// Reaction duel. Every device plays the same seeded script (wait, signal, decoy); each device times its own
// players from its own signal, so network latency never counts.
const ROUNDS = 7, GAP = 14, TIMEOUT = 2000, SHOW = 1.7;
const PTS = [3, 2, 1, 0], SIGS = 'LAR', DECOYS = ['dia', 'dot', 'tri'];
const IDLE = 0x2c3a78, DECOY_C = 0xb040ff, SIG_C = 0xffd23f;

export function createDraw({ renderer, mode, n = 2, me = 0, bots = [], rand, send, label, onEnd }) {
  const online = mode === 'online';
  const IDX = [...Array(n).keys()], TX = IDX.map(i => (i - (n - 1) / 2) * GAP);
  const script = Array.from({ length: ROUNDS }, () => {
    const wait = 1.6 + rand() * 3.4, sig = SIGS[rand() * 3 | 0], decoy = DECOYS[rand() * 3 | 0];
    return { wait, sig, decoy, fake: rand() < .35 ? .6 + rand() * (wait - 1.3) : -1 };
  });

  const scene = new THREE.Scene(), fogC = new THREE.Color(0x0c1233);
  scene.background = fogC;
  scene.fog = new THREE.Fog(fogC, 16, 70);
  lights(scene);
  const sky = addSky(scene, fogC, 0x5a1a4c);
  const grid = canvasTex(64, 64, (g, w) => { g.fillStyle = '#080c22'; g.fillRect(0, 0, w, w); g.strokeStyle = '#27306a'; g.lineWidth = 2; g.strokeRect(0, 0, w, w); });
  grid.wrapS = grid.wrapT = THREE.RepeatWrapping; grid.repeat.set(40, 40);
  grid.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(160, 160).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: grid })));

  // colonnade behind the stations: dark pillars with glowing front strips, alternating pink / blue
  {
    const nP = 25, M = new THREE.Matrix4(), c = new THREE.Color();
    const pil = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 14, 1), new THREE.MeshStandardMaterial({ color: 0x0c1030, roughness: .4, metalness: .6 }), nP);
    const strip = new THREE.InstancedMesh(new THREE.BoxGeometry(.14, 12, .05), new THREE.MeshBasicMaterial({ toneMapped: false }), nP);
    for (let k = 0; k < nP; k++) {
      const x = (k - (nP - 1) / 2) * 6;
      pil.setMatrixAt(k, M.makeTranslation(x * 1.4, 7, -34));
      strip.setMatrixAt(k, M.makeTranslation(x * 1.4, 7, -33.48));
      strip.setColorAt(k, c.setHex(k % 2 ? 0xff3aa8 : 0x3a7aff));
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(nP * 8.4, .2, .1), new THREE.MeshBasicMaterial({ color: 0xff3aa8, toneMapped: false }));
    beam.position.set(0, 13.2, -33.45);
    scene.add(pil, strip, beam);
  }

  // one station per player: pedestal, runner, signal lamp. Lamp materials are shared (same script everywhere).
  const tex = Object.fromEntries(['L', 'A', 'R', ...DECOYS].map(k => [k, symTex(k)]));
  const ringMat = new THREE.MeshBasicMaterial({ color: IDLE, toneMapped: false });
  const symMat = new THREE.MeshBasicMaterial({ map: tex.A, color: SIG_C, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const backMat = new THREE.MeshStandardMaterial({ color: 0x0a0e26, emissive: 0x141a44, roughness: .6 });
  const pedGeo = new THREE.CylinderGeometry(1.2, 1.35, .3, 32), rimGeo = new THREE.TorusGeometry(1.22, .05, 6, 48).rotateX(Math.PI / 2);
  const ringGeo = new THREE.TorusGeometry(1.55, .12, 10, 64), symGeo = new THREE.PlaneGeometry(2.1, 2.1), backGeo = new THREE.CircleGeometry(1.5, 48);
  const pedMat = new THREE.MeshStandardMaterial({ color: 0x161d44, roughness: .35, metalness: .6 });
  const poleGeo = new THREE.CylinderGeometry(.09, .16, 2.6, 12);
  const players = IDX.map(i => {
    const x = TX[i];
    const ped = new THREE.Mesh(pedGeo, pedMat); ped.position.set(x, .15, 0);
    const rim = new THREE.Mesh(rimGeo, new THREE.MeshBasicMaterial({ color: COL[i], toneMapped: false })); rim.position.set(x, .31, 0);
    const lamp = new THREE.Group();
    lamp.add(new THREE.Mesh(backGeo, backMat), new THREE.Mesh(ringGeo, ringMat));
    const sym = new THREE.Mesh(symGeo, symMat); sym.position.z = .02; lamp.add(sym);
    lamp.position.set(x, 4.1, -7);
    const pole = new THREE.Mesh(poleGeo, pedMat); pole.position.set(x, 1.3, -7.25);
    scene.add(pole);
    const r = makeRunner(COL[i]);
    scene.add(ped, rim, lamp, r);
    return { i, r, cam: new THREE.PerspectiveCamera(60, 1, .1, 140), fov: 60, local: !online || i === me, bot: false, react: 0, good: false };
  });
  const burst = new Burst(scene);

  const panes = (online ? [me] : IDX).map(pi => {
    const v = makePane(pi, label, zones('◀', '★', '▶'));
    v.chips = rankChips(v, n, label);
    v.hint.textContent = coarse ? t('drawTouch') : t('drawKeys', keyHint(pi, online));
    return v;
  });
  const paneOf = i => panes.find(v => v.pi === i);

  let ph = 'count', r = 0, tr = 0, sigAt = 0, showT = 0, time = 0, decoy = 0;
  const res = script.map(() => Array(n).fill(undefined)), plans = script.map(() => []), score = Array(n).fill(0), gain = Array(n).fill(0);
  const step = countdown(panes);
  // solo: score is total reaction ms (a foul / miss costs the full TIMEOUT), shown as the running average
  const solo = n === 1, avg = () => t('ms', { n: Math.round(score[0] / Math.max(1, r + (ph === 'show' ? 1 : 0))) });
  const chips = (withGain) => panes.forEach(v => v.chips(solo ? [avg()] : score.map((s, i) => (withGain ? `${s} (${gain[i] >= 0 ? '+' : ''}${gain[i]})` : s))));

  function setLamp(kind, col) {
    ringMat.color.setHex(col ?? IDLE);
    symMat.opacity = kind ? 1 : 0;
    if (kind) { symMat.map = tex[kind]; symMat.color.setHex(col); }
  }

  function startRound() {
    ph = 'wait'; tr = 0; decoy = 0;
    setLamp(null);
    chips(false);
    panes.forEach(v => { v.val.textContent = `${r + 1}/${ROUNDS}`; });
  }

  function submit(i, v) {
    res[r][i] = v;
    if (online) send({ t: 'qd', from: i, r, v });
    const p = players[i], pane = paneOf(i);
    p.react = .8; p.good = v >= 0;
    if (!pane) return;
    if (v >= 0) { flash(pane.msg, t('ms', { n: v }), 'great'); sfx.good(); }
    else { flash(pane.msg, t(v === -1 ? 'early' : v === -2 ? 'wrong' : 'late'), 'hit'); sfx.miss(); if (v > -3) buzz(40); }
  }

  function resolveRound() {
    const row = res[r], ok = IDX.filter(i => row[i] >= 0).sort((a, b) => row[a] - row[b]);
    IDX.forEach(i => {
      gain[i] = solo ? (row[i] >= 0 ? row[i] : TIMEOUT) : row[i] >= 0 ? PTS[ok.findIndex(j => row[j] === row[i])] : row[i] === -3 ? 0 : -1; // equal times share a place
      score[i] += gain[i];
    });
    ph = 'show'; showT = SHOW;
    setLamp(null);
    chips(true);
    if (ok.length && !solo) {
      const w = ok[0], pane = paneOf(w);
      burst.emit(TX[w], 2.4, 0, COL[w], 26, 6);
      if (pane) { flash(pane.msg, t('fastest'), 'go'); sfx.perfect(); }
    }
  }

  function finish() {
    ph = 'done';
    const order = [...IDX].sort((a, b) => score[b] - score[a]);
    onEnd({ order, draw: !solo && score[order[0]] === score[order[1]], scores: solo ? [avg()] : score.map(s => t('pts', { n: s })) });
  }

  // AI: 230–490 ms reactions, 7% wrong button, bites on 15% of decoys
  const plan = i => (plans[r][i] ??= { bite: script[r].fake >= 0 && Math.random() < .15, biteAt: .2 + Math.random() * .2, ms: 230 + Math.random() * 260, wrong: Math.random() < .07 });

  function update(dt) {
    time += dt;
    const S = script[r];
    if (ph === 'count') { if (!step(dt)) startRound(); }
    else if (ph === 'wait') {
      tr += dt;
      if (decoy === 0 && S.fake >= 0 && tr >= S.fake) { decoy = 1; setLamp(S.decoy, DECOY_C); sfx.decoy(); }
      if (decoy === 1 && tr >= S.fake + .35) { decoy = 2; setLamp(null); }
      for (const p of players) if (p.local && p.bot && res[r][p.i] === undefined && decoy && plan(p.i).bite && tr >= S.fake + plan(p.i).biteAt) submit(p.i, -1);
      if (tr >= S.wait) {
        ph = 'sig'; sigAt = performance.now();
        setLamp(S.sig, SIG_C); sfx.signal();
        panes.forEach(v => v.hint.classList.add('hide'));
      }
    } else if (ph === 'sig') {
      const ms = performance.now() - sigAt;
      for (const p of players) {
        if (!p.local || res[r][p.i] !== undefined) continue;
        if (p.bot) { const b = plan(p.i); if (ms >= b.ms) submit(p.i, b.wrong ? -2 : Math.round(b.ms)); }
        else if (ms > TIMEOUT) submit(p.i, -3);
      }
      if (res[r].every(v => v !== undefined)) resolveRound();
    } else if (ph === 'show' && (showT -= dt) <= 0) {
      if (++r < ROUNDS) startRound(); else finish();
    }

    for (const p of players) {
      p.react = Math.max(0, p.react - dt);
      const k = p.react / .8, hop = p.good ? Math.sin(k * Math.PI) * .7 : 0;
      placeRunner(p.r, TX[p.i], .3 + hop, 0, .3);
      animRunner(p.r, time * 2, .05, p.good ? k * .8 : 0);
      p.r.rotation.y = p.good ? k * Math.PI * 2 : 0;
      p.r.rotation.z = p.good ? 0 : Math.sin(k * 30) * k * .3;
    }
    burst.update(dt);
  }

  function resize() {
    layout(panes);
    for (const v of panes) { const p = players[v.pi]; p.cam.aspect = v.w / v.h; p.fov = fitFov(p.cam.aspect, 28, 50, 95); }
  }

  function render() {
    renderPanes(renderer, scene, panes, v => {
      const c = players[v.pi].cam, x = TX[v.pi];
      c.position.set(x + Math.sin(time * .3) * .15, 2.9, 5.2);
      c.lookAt(x, 2.9, -7);
      if (v.flip) c.rotateZ(Math.PI);
      c.fov = players[v.pi].fov; c.updateProjectionMatrix();
      sky.position.copy(c.position);
      return c;
    });
  }

  const act = (pi, a) => {
    const p = players[pi];
    if (!p?.local || p.bot || res[r]?.[pi] !== undefined) return;
    if (ph === 'wait') submit(pi, -1);
    else if (ph === 'sig') submit(pi, a === script[r].sig ? Math.round(performance.now() - sigAt) : -2);
  };
  const unbind = bindInput({ cv: renderer.domElement, panes, n, online, me, act });

  function onNet(m) {
    const p = players[m.from];
    if (m.t !== 'qd' || !p || p.local || !Number.isInteger(m.r) || m.r < 0 || m.r >= ROUNDS || typeof m.v !== 'number') return;
    if (res[m.r][m.from] === undefined) res[m.r][m.from] = m.v; // a device can be a round ahead; keep it for later
  }

  function botify(i, local) {
    const p = players[i];
    if (!p) return;
    p.bot = true;
    if (local) p.local = true;
    chips(ph === 'show');
  }

  function dispose() {
    unbind();
    panes.forEach(v => v.el.remove());
    document.body.classList.remove('split-v');
    Object.values(tex).forEach(x => x.dispose());
    disposeScene(scene);
  }

  resize();
  chips(false);
  bots.forEach(i => botify(i, me === 0));
  return { update, render, resize, onNet, dispose, botify };
}
