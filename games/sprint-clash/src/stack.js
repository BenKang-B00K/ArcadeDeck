import * as THREE from 'three';
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { COL, disposeScene, flash, buzz, Burst } from './fx.js';
import { coarse, keyHint, zones, makePane, rankChips, layout, renderPanes, bindInput, countdown, makeShowcase, addSky, addCity, lights } from './stage.js';

// Stacker: a block slides over your tower, drop it and the overhang is cut off. Tallest tower after 60 s wins.
// Slide speed depends only on the floor number and start sides come from the seed, so every tower faces the same run.
const B = 3, FH = .5, GAP = 28, CLOCK = 60, MAXF = 160, AMP = 4.2, PERF = .12, PIECES = 16;
const speedAt = f => Math.min(9, 3.2 + f * .2);

export function createStack({ renderer, mode, n = 2, me = 0, bots = [], rand, send, label, onEnd }) {
  const online = mode === 'online';
  const IDX = [...Array(n).keys()], TX = IDX.map(i => (i - (n - 1) / 2) * GAP);
  const side = Array.from({ length: MAXF }, () => (rand() < .5 ? -1 : 1));

  const scene = new THREE.Scene(), fogC = new THREE.Color(0x0c1233);
  scene.background = fogC;
  scene.fog = new THREE.Fog(fogC, 30, 90);
  lights(scene);
  const sky = addSky(scene, fogC, 0x1a3a6c);
  const box = new THREE.BoxGeometry(1, 1, 1), C = new THREE.Color(), M = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = new THREE.Vector3(), S = new THREE.Vector3(), E = new THREE.Euler();
  // each tower stands on a tall pillar above a night city
  const PH = 56, span = Math.abs(TX[0]) + 70;
  addCity(scene, { y: -PH, n: 300, x0: -span, x1: span, z0: 40, z1: -110, clear: (x, z) => TX.some(tx => Math.hypot(x - tx, z) < 24) });
  const colorAt = (i, f) => C.setHex(COL[i]).offsetHSL(f * .025, -.1, (f % 2) * .04 - .08);

  const players = IDX.map(i => {
    const x = TX[i];
    const base = new THREE.Mesh(new THREE.BoxGeometry(B + .4, PH, B + .4), new THREE.MeshStandardMaterial({ color: 0x141a40, emissive: COL[i], emissiveIntensity: .08, roughness: .5, metalness: .4 }));
    base.position.set(x, -PH / 2 - FH / 2, 0);
    // neon rim round the plinth top + a band lower down
    const rimMat = new THREE.MeshBasicMaterial({ color: COL[i], toneMapped: false });
    for (const [y, t] of [[-FH / 2 - .06, .12], [-FH / 2 - 2.2, .06]]) {
      const rim = new THREE.Mesh(new THREE.BoxGeometry(B + .5, t, B + .5), rimMat);
      rim.position.set(x, y, 0); scene.add(rim);
    }
    const tower = new THREE.InstancedMesh(box, new THREE.MeshStandardMaterial({ roughness: .4, metalness: .15 }), MAXF + 1);
    tower.count = 0; tower.frustumCulled = false;
    const cur = new THREE.Mesh(box, new THREE.MeshStandardMaterial({ roughness: .35, metalness: .15, emissiveIntensity: .25 }));
    scene.add(base, tower, cur);
    const p = {
      i, tower, cur, cam: new THREE.PerspectiveCamera(50, 1, .1, 140), camY: 0, local: !online || i === me, bot: false, plan: null,
      floors: [], u: 0, dir: 1, stun: 0, combo: 0, h: 0, fin: null, prevU: 0,
    };
    addFloor(p, { x, z: 0, w: B, d: B });
    spawn(p);
    return p;
  });

  // falling offcuts: small pool, gravity + spin
  const pieces = Array.from({ length: PIECES }, () => {
    const m = new THREE.Mesh(box, new THREE.MeshStandardMaterial({ roughness: .4, transparent: true }));
    m.visible = false; scene.add(m);
    return { m, vy: 0, life: 0, spin: 0 };
  });
  let pieceI = 0;
  function drop(pos, size, col) {
    const pc = pieces[pieceI++ % PIECES];
    pc.m.position.copy(pos); pc.m.scale.copy(size); pc.m.rotation.set(0, 0, 0);
    pc.m.material.color.copy(col); pc.m.material.opacity = 1; pc.m.visible = true;
    pc.vy = 0; pc.life = 1.6; pc.spin = (Math.random() - .5) * 3;
  }
  const burst = new Burst(scene);

  const panes = (online ? [me] : IDX).map(pi => {
    const v = makePane(pi, label, zones('▼', '▼', '▼'));
    v.chips = rankChips(v, n, label);
    v.hint.textContent = coarse ? t('stackTouch') : t('stackKeys', keyHint(pi, online));
    return v;
  });
  const paneOf = i => panes.find(v => v.pi === i);
  const heard = p => !!paneOf(p.i);
  const heights = IDX.map(() => 0);
  const chips = () => panes.forEach(v => v.chips(heights.map(h => t('floors', { n: h }))));
  const sc = makeShowcase(panes, label, onEnd);
  let champ = 0;
  const champAt = new THREE.Vector3();

  function addFloor(p, f) {
    const k = p.floors.length;
    p.floors.push(f);
    p.tower.setMatrixAt(k, M.compose(P.set(f.x, k * FH, f.z), Q.identity(), S.set(f.w, FH, f.d)));
    p.tower.setColorAt(k, colorAt(p.i, k));
    p.tower.count = k + 1;
    p.tower.instanceMatrix.needsUpdate = true;
    p.tower.instanceColor.needsUpdate = true;
  }

  function spawn(p) {
    const f = p.floors.length, top = p.floors[f - 1];
    p.axis = f % 2; p.u = side[f % MAXF] * AMP; p.dir = -side[f % MAXF]; p.prevU = p.u; p.plan = null; p.think = .75 + Math.random() * .6;
    p.cur.scale.set(top.w, FH, top.d);
    p.cur.material.color.copy(colorAt(p.i, f));
    p.cur.material.emissive.copy(C);
    p.cur.visible = p.local;
  }

  function place(p) {
    if (p.floors.length > MAXF) return;
    const f = p.floors.length, top = p.floors[f - 1], size = p.axis ? top.d : top.w, off = p.u, heardP = heard(p);
    const y = f * FH, col = colorAt(p.i, f).clone();
    const at = (o, len) => { if (p.axis) { P.set(top.x, y, top.z + o); S.set(top.w, FH, len); } else { P.set(top.x + o, y, top.z); S.set(len, FH, top.d); } };
    p.cur.visible = false;
    if (Math.abs(off) >= size) { // clean miss: whole block falls, short penalty
      at(off, size); drop(P, S, col);
      p.combo = 0; p.stun = .7;
      if (heardP) { sfx.miss(); buzz(50); flash(paneOf(p.i).msg, t('miss'), 'miss'); }
      return;
    }
    let nf;
    if (Math.abs(off) < PERF) {
      nf = { ...top };
      if (++p.combo % 3 === 0) { if (p.axis) nf.d = Math.min(B, nf.d + .3); else nf.w = Math.min(B, nf.w + .3); } // 3 perfects in a row win width back
      burst.emit(top.x, y, top.z, 0xfff6a0, 22, 4);
      if (heardP) { sfx.perfect(); flash(paneOf(p.i).msg, p.combo > 1 ? t('combo', { n: p.combo }) : t('perfect'), 'perfect'); }
    } else {
      const keep = size - Math.abs(off), sg = Math.sign(off);
      nf = p.axis ? { ...top, z: top.z + off / 2, d: keep } : { ...top, x: top.x + off / 2, w: keep };
      at(sg * (size / 2 + Math.abs(off) / 2), Math.abs(off)); drop(P, S, col);
      p.combo = 0;
      if (heardP) sfx.drop();
    }
    addFloor(p, nf);
    p.h = p.floors.length - 1; heights[p.i] = p.h;
    if (online) send({ t: 'h', from: p.i, h: p.h });
    chips();
    spawn(p);
  }

  let state = 'count', T = 0, endT = 0, hudT = 0, hintHidden = false;
  const step = countdown(panes);

  // AI: waits 0.75–1.35 s after a spawn, aims near the centre with a triangular error, 20% dead-centre, 4% clean misses
  function botStep(p, dt) {
    if ((p.think = (p.think ?? .6) - dt) > 0) return; // settle time after each spawn
    const top = p.floors.at(-1), size = p.axis ? top.d : top.w;
    p.plan ??= Math.random() < .04 ? size * 1.2 * Math.sign(p.u) : Math.random() < .2 ? 0 : (Math.random() + Math.random() - 1) * size * .55;
    if ((p.prevU - p.plan) * (p.u - p.plan) <= 0 && p.prevU !== p.u) place(p);
  }

  function update(dt) {
    if (state === 'count') { if (!step(dt)) state = 'play'; }
    else if (state === 'play') {
      T += dt;
      if (!hintHidden && T > 3) { hintHidden = true; panes.forEach(v => v.hint.classList.add('hide')); }
      for (const p of players) {
        if (!p.local || p.fin != null) continue;
        if (p.stun > 0) { if ((p.stun -= dt) <= 0) spawn(p); continue; }
        p.prevU = p.u;
        p.u += p.dir * speedAt(p.floors.length) * dt;
        if (Math.abs(p.u) > AMP) { p.u = Math.sign(p.u) * AMP; p.dir = -p.dir; }
        if (p.bot) botStep(p, dt);
      }
      if (T >= CLOCK) {
        state = 'wait';
        panes.forEach(v => { flash(v.msg, t('timeUp'), 'go'); v.hint.textContent = online ? t('waitRival') : ''; v.hint.classList.toggle('hide', !online); });
        sfx.finish();
        for (const p of players) if (p.local) { p.fin = p.h; p.cur.visible = false; if (online) send({ t: 'fin', from: p.i, h: p.h }); }
      }
    }
    if (state === 'wait' && players.every(p => p.fin != null)) { state = 'done'; endT = 1.4; }
    if (state === 'done' && endT > 0 && (endT -= dt) <= 0) {
      const order = [...IDX].sort((a, b) => players[b].fin - players[a].fin);
      champ = order[0];
      const H = Math.max(1, players[champ].fin) * FH; // orbit height/radius scale with the winner's tower
      champAt.set(TX[champ], H * .5, 0); // look at mid-tower from far enough that the 50° fov holds base to top
      sc.start({ order, draw: n > 1 && players[order[0]].fin === players[order[1]].fin, scores: players.map(p => t('floors', { n: p.fin })) }, champAt, { r: H * 1.1 + 6, h: H * .3 + 1, look: 0 });
      burst.emit(TX[champ], H, 0, COL[champ], 36, 7);
    }

    for (const p of players) {
      p.camY += (p.floors.length * FH - p.camY) * Math.min(1, dt * 4);
      if (!p.cur.visible) continue;
      const top = p.floors.at(-1), y = p.floors.length * FH;
      p.cur.position.set(top.x + (p.axis ? 0 : p.u), y, top.z + (p.axis ? p.u : 0));
    }
    for (const pc of pieces) {
      if (!pc.m.visible) continue;
      pc.vy -= 22 * dt; pc.m.position.y += pc.vy * dt; pc.m.rotation.x += pc.spin * dt; pc.m.rotation.z += pc.spin * .7 * dt;
      pc.m.material.opacity = Math.min(1, pc.life);
      if ((pc.life -= dt) <= 0) pc.m.visible = false;
    }
    burst.update(dt);
    sc.update(dt);
    if ((hudT -= dt) <= 0) { hudT = .1; panes.forEach(v => { v.val.textContent = Math.max(0, Math.ceil(CLOCK - T)); }); }
  }

  function resize() {
    layout(panes);
    for (const v of panes) { const p = players[v.pi]; p.cam.aspect = v.w / v.h; p.cam.updateProjectionMatrix(); }
  }

  function render() {
    renderPanes(renderer, scene, panes, v => {
      const p = players[v.pi], c = p.cam;
      if (sc.on) { sc.cam(v, c); sky.position.copy(c.position); return c; }
      const k = Math.max(1, 1.15 / c.aspect); // back off on tall panes so the slide range fits
      c.position.set(TX[p.i] + 7.5 * k, p.camY + 6 + 2 * k, 7.5 * k);
      c.lookAt(TX[p.i], p.camY - .5, 0);
      if (v.flip) c.rotateZ(Math.PI);
      sky.position.copy(c.position);
      return c;
    });
  }

  const act = pi => {
    const p = players[pi];
    if (!p?.local || p.bot || state !== 'play' || p.stun > 0 || p.fin != null) return;
    place(p);
  };
  const unbind = bindInput({ cv: renderer.domElement, panes, n, online, me, act });

  function onNet(m) {
    const p = players[m.from];
    if (!p || p.local || !Number.isInteger(m.h)) return;
    if (m.t === 'h') { heights[p.i] = p.h = m.h; chips(); }
    else if (m.t === 'fin' && p.fin == null) { heights[p.i] = p.h = p.fin = m.h; chips(); }
  }

  // a dropped remote player: carry on from their reported height with a plain column
  function botify(i, local) {
    const p = players[i];
    if (!p) return;
    p.bot = true;
    chips();
    if (!local || p.local) return;
    p.local = true;
    while (p.floors.length <= p.h && p.floors.length < MAXF) addFloor(p, { ...p.floors.at(-1) });
    if (state === 'play') spawn(p);
    else if (state !== 'count') p.fin ??= p.h;
  }

  function dispose() {
    unbind();
    panes.forEach(v => v.el.remove());
    document.body.classList.remove('split-v');
    disposeScene(scene);
  }

  resize();
  chips();
  players.forEach(p => { p.camY = FH; });
  bots.forEach(i => botify(i, me === 0));
  return { update, render, resize, onNet, dispose, botify };
}
