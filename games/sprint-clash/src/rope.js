import * as THREE from 'three';
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { COL, hex, disposeScene, flash, buzz, Burst } from './fx.js';
import { coarse, keyHint, zones, makePane, rankChips, layout, fitFov, renderPanes, bindInput, countdown, makeShowcase, addSky, addCity, lights, makeRunner, animRunner, placeRunner, nameTag } from './stage.js';

// Balance walk over a high wire. Left/Right push your lean, Action takes a 1 m step.
// Lean past TIP and you fall; step while leaning past OVER and you fall. Gusts come from the seed, so all wires get the same wind.
const LEN = 40, POST = 10, GAP = 6, CLOCK = 70, HY = 8, TIP = 1, OVER = .5, IMP = .6, INST = 1.9, DAMP = .8, STEP = .32, FALL = 2.6;

export function createRope({ renderer, mode, n = 2, me = 0, bots = [], rand, send, label, onEnd }) {
  const online = mode === 'online';
  const IDX = [...Array(n).keys()], TX = IDX.map(i => (i - (n - 1) / 2) * GAP);
  const gusts = [];
  for (let t0 = 3; t0 < CLOCK;) { const dur = 1 + rand() * 1.2; gusts.push({ t0, dur, f: (rand() < .5 ? -1 : 1) * (.9 + rand() * .9) }); t0 += dur + 2 + rand() * 3; }
  const gustAt = T => { const g = gusts.find(g => T >= g.t0 && T < g.t0 + g.dur); return g ? g.f * Math.sin(Math.PI * (T - g.t0) / g.dur) : 0; };
  const warnAt = T => gusts.find(g => T >= g.t0 - .8 && T < g.t0 + g.dur);

  const scene = new THREE.Scene(), fogC = new THREE.Color(0x0e1438);
  scene.background = fogC;
  scene.fog = new THREE.Fog(fogC, 20, 95);
  lights(scene);
  const sky = addSky(scene, fogC, 0x6a2a5c);

  addCity(scene, { y: -34, clear: x => Math.abs(x) < 6 });

  // wires, towers, post lamps
  const wireGeo = new THREE.CylinderGeometry(.035, .035, LEN + 3, 6).rotateX(Math.PI / 2);
  const towerGeo = new THREE.BoxGeometry(3, HY + 34, 3), towerMat = new THREE.MeshStandardMaterial({ color: 0x151a3e, roughness: .7, metalness: .3 });
  const lampGeo = new THREE.SphereGeometry(.14, 12, 8);
  const players = IDX.map(i => {
    const x = TX[i], cm = new THREE.MeshBasicMaterial({ color: COL[i], toneMapped: false });
    const wire = new THREE.Mesh(wireGeo, new THREE.MeshStandardMaterial({ color: 0xd0d8ff, metalness: .8, roughness: .3 })); wire.position.set(x, HY, -LEN / 2);
    scene.add(wire);
    for (const z of [2, -LEN - 2]) {
      const tw = new THREE.Mesh(towerGeo, towerMat); tw.position.set(x, HY - (HY + 34) / 2, z);
      const edge = new THREE.Mesh(new THREE.BoxGeometry(3.08, .14, 3.08), cm); edge.position.set(x, HY - .7, z);
      scene.add(tw, edge);
    }
    for (let d = POST; d < LEN; d += POST) { const l = new THREE.Mesh(lampGeo, cm); l.position.set(x, HY + .05, -d); scene.add(l); }
    const r = makeRunner(COL[i]), u = r.userData;
    u.shadow.visible = false;
    u.armL.rotation.z = -1.3; u.armR.rotation.z = 1.3;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 4.2, 6).rotateZ(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xe8ecff, metalness: .6, roughness: .3 }));
    pole.position.set(0, 1.2, -.3);
    const tag = nameTag(label(i), COL[i]);
    r.add(pole);
    scene.add(tag); // not parented: stays upright over the walker while the body leans
    scene.add(r);
    return {
      i, r, pole, tag, cam: new THREE.PerspectiveCamera(60, 1, .1, 160), fov: 60, local: !online || i === me, bot: false, bt: .3,
      d: 0, th: 0, om: 0, stepT: 0, from: 0, fall: 0, fy: 0, falls: 0, fin: null, walk: 0, td: 0, tth: 0,
    };
  });

  // wind streaks
  const NW = 320, wpos = new Float32Array(NW * 3), X0 = TX[0] - 16, XS = TX[n - 1] - TX[0] + 32;
  for (let k = 0; k < NW; k++) { wpos[k * 3] = X0 + Math.random() * XS; wpos[k * 3 + 1] = HY - 5 + Math.random() * 11; wpos[k * 3 + 2] = 8 - Math.random() * (LEN + 20); }
  const wg = new THREE.BufferGeometry();
  wg.setAttribute('position', new THREE.BufferAttribute(wpos, 3).setUsage(THREE.DynamicDrawUsage));
  const windMat = new THREE.PointsMaterial({ color: 0xbfeaff, size: .12, transparent: true, opacity: .15, depthWrite: false, blending: THREE.AdditiveBlending });
  const wind = new THREE.Points(wg, windMat);
  wind.frustumCulled = false;
  scene.add(wind);
  const burst = new Burst(scene);

  const panes = (online ? [me] : IDX).map(pi => {
    const v = makePane(pi, label, `${zones('◀', '▲', '▶')}<div class="pbar"></div><div class="lean"><i></i><b></b></div>`);
    v.chips = rankChips(v, n, label);
    v.mark = v.q('.lean i'); v.wind = v.q('.lean b');
    v.dots = IDX.map(j => { const d = document.createElement('i'); if (j !== pi) { d.className = 'op'; d.style.setProperty('--o', hex(j)); } return d; });
    v.q('.pbar').append(...v.dots.filter((_, j) => j !== pi), v.dots[pi]);
    v.hint.textContent = coarse ? t('ropeTouch') : t('ropeKeys', keyHint(pi, online));
    return v;
  });
  const paneOf = i => panes.find(v => v.pi === i);
  const say = (p, text, cls) => { const v = paneOf(p.i); if (v) flash(v.msg, text, cls); };
  const chips = () => panes.forEach(v => v.chips(players.map(p => t('meters', { n: Math.floor(final[p.i]?.d ?? p.d) }))));
  const sc = makeShowcase(panes, label, onEnd);

  let state = 'count', T = 0, endT = 0, sendT = 0, hudT = 0, time = 0, champ = 0;
  const final = Array(n).fill(null);
  const step = countdown(panes);

  function report(p, time) {
    final[p.i] = { time, d: Math.round(p.d * 10) / 10, falls: p.falls };
    if (online) send({ t: 'fin', from: p.i, ...final[p.i] });
  }

  function fall(p, msg = 'fall') {
    p.fall = FALL; p.falls++; p.stepT = 0;
    if (paneOf(p.i)) { say(p, t(msg), 'hit'); sfx.fall(); buzz(80); }
  }

  function tryStep(p) {
    if (p.stepT > 0) return;
    if (Math.abs(p.th) > OVER) return fall(p, 'ropeTilt');
    p.stepT = STEP; p.from = p.d;
    p.om += (Math.round(p.d) % 2 ? .25 : -.25); // each foot sways you its way
    if (paneOf(p.i)) sfx.step();
  }

  // AI: predicts its lean 0.35 s ahead and corrects, steps when steady; 10% of decisions skipped
  function botStep(p, dt) {
    if ((p.bt -= dt) > 0) return;
    p.bt = .1 + Math.random() * .08;
    if (Math.random() < .1) return;
    const pred = p.th + p.om * .35;
    if (Math.abs(pred) > .07) p.om += pred > 0 ? -IMP : IMP;
    else if (Math.abs(p.th) < .2 && Math.abs(p.om) < .45) tryStep(p);
  }

  function stepLocal(p, dt) {
    if (state !== 'play' || p.fin != null || final[p.i]) return;
    if (p.fall > 0) {
      p.fall -= dt;
      const k = FALL - p.fall;
      p.fy = -k * k * 6;
      if (p.fall <= 0) { p.d = Math.floor(p.d / POST) * POST; p.th = p.om = p.fy = 0; }
      return;
    }
    if (p.bot) botStep(p, dt);
    p.om += (INST * Math.sin(p.th) + gustAt(T)) * dt;
    p.om *= Math.exp(-DAMP * dt);
    p.th += p.om * dt;
    if (p.stepT > 0) {
      p.stepT -= dt;
      p.d = p.from + Math.min(1, 1 - p.stepT / STEP);
      if (p.stepT <= 0 && p.d >= LEN) {
        p.d = LEN; p.fin = T; report(p, Math.round(T * 100) / 100);
        say(p, t('finish'), 'go'); if (paneOf(p.i)) sfx.finish();
        for (let k = 0; k < 3; k++) burst.emit(TX[p.i], HY + 2, -LEN - 2, [0xffd23f, COL[p.i], 0xffffff][k], 20, 6);
      }
    }
    if (p.fin == null && Math.abs(p.th) > TIP) fall(p);
  }

  function stepRemote(p, dt) {
    p.d += (p.td - p.d) * Math.min(1, dt * 8);
    p.th += (p.tth - p.th) * Math.min(1, dt * 12);
  }

  function update(dt) {
    time += dt;
    if (state === 'count') { if (!step(dt)) state = 'play'; }
    else if (state === 'play') {
      T += dt;
      if (T > 3) panes.forEach(v => v.hint.classList.add('hide'));
      if (T >= CLOCK) {
        state = 'wait';
        sfx.finish();
        panes.forEach(v => flash(v.msg, t('timeUp'), 'go'));
        for (const p of players) if (p.local && !final[p.i]) { if (p.fall > 0) p.d = Math.floor(p.d / POST) * POST; report(p, null); } // mid-fall counts from the post you drop back to
        if (online && final.some(f => !f)) panes.forEach(v => { v.hint.textContent = t('waitRival'); v.hint.classList.remove('hide'); });
      }
    }
    if (state !== 'done' && final.every(Boolean)) { state = 'done'; endT = 1.5; }
    if (state === 'done' && endT > 0 && (endT -= dt) <= 0) {
      const cmp = (a, b) => {
        const A = final[a], B = final[b];
        if (A.time != null || B.time != null) return (A.time ?? 1e9) - (B.time ?? 1e9);
        return B.d - A.d || A.falls - B.falls;
      };
      const order = [...IDX].sort(cmp);
      champ = order[0];
      sc.start({ order, draw: n > 1 && cmp(order[0], order[1]) === 0, scores: final.map(f => (f.time != null ? t('time', { n: f.time.toFixed(2) }) : t('meters', { n: f.d.toFixed(1) }))) }, () => players[champ].r.position, { r: 5, h: 1.8, look: 1 });
      const c = players[champ].r.position;
      burst.emit(c.x, c.y + 1, c.z, COL[champ], 30, 6);
    }

    for (const p of players) {
      p.local ? stepLocal(p, dt) : stepRemote(p, dt);
      const walking = p.stepT > 0;
      if (walking) p.walk += dt * Math.PI / STEP;
      placeRunner(p.r, TX[p.i] + Math.sin(p.th) * .15, HY + p.fy, -p.d, HY);
      p.tag.position.set(TX[p.i] + Math.sin(p.th) * .6, HY + p.fy + 2.25, -p.d);
      p.r.rotation.z = -p.th - (p.fall > 0 ? (FALL - p.fall) * 2 * Math.sign(p.th || 1) : 0);
      animRunner(p.r, p.walk, walking ? .5 : .03);
      p.pole.rotation.z = p.th * .3 + Math.sin(time * 1.7 + p.i) * .03;
    }

    // wind streaks drift with the gust
    const g = gustAt(Math.max(0, T)), vx = g * 16 + .6;
    for (let k = 0; k < NW; k++) { let x = wpos[k * 3] + vx * dt; if (x > X0 + XS) x -= XS; else if (x < X0) x += XS; wpos[k * 3] = x; }
    wg.attributes.position.needsUpdate = true;
    windMat.opacity = .12 + Math.min(1, Math.abs(g)) * .6;
    burst.update(dt);
    sc.update(dt);

    if (online && state === 'play' && (sendT -= dt) <= 0) {
      sendT = .1;
      for (const p of players) if (p.local) send({ t: 'p', from: p.i, d: p.d, th: p.th });
    }
    if ((hudT -= dt) <= 0) {
      hudT = .05;
      const w = state === 'play' && warnAt(T);
      for (const v of panes) {
        const p = players[v.pi];
        v.val.textContent = Math.max(0, Math.ceil(CLOCK - T));
        v.dots.forEach((d, j) => { d.style.transform = `translateX(${Math.min(100, players[j].d / LEN * 100)}cqw)`; });
        v.mark.style.transform = `translateX(${50 + THREE.MathUtils.clamp(p.th / TIP, -1, 1) * 50}cqw)`;
        v.wind.textContent = w ? (w.f > 0 ? t('wind') + ' ≫' : '≪ ' + t('wind')) : '';
        v.wind.classList.toggle('on', !!w);
      }
      chips();
    }
  }

  function resize() {
    layout(panes);
    for (const v of panes) { const p = players[v.pi]; p.cam.aspect = v.w / v.h; p.fov = fitFov(p.cam.aspect, 32, 55, 95); }
  }

  const look = new THREE.Vector3();
  function render() {
    renderPanes(renderer, scene, panes, v => {
      const p = players[v.pi], c = p.cam, x = TX[p.i];
      if (sc.on) { sc.cam(v, c, p.fov); sky.position.copy(c.position); return c; }
      c.position.set(x, HY + 2.6 + p.fy * .3, -p.d + 5.2);
      c.lookAt(look.set(x, HY + .9 + p.fy * .5, -p.d - 4));
      c.rotateZ(p.th * .12 + (v.flip ? Math.PI : 0));
      c.fov = p.fov; c.updateProjectionMatrix();
      sky.position.copy(c.position);
      return c;
    });
  }

  const act = (pi, a) => {
    const p = players[pi];
    if (!p?.local || p.bot || state !== 'play' || p.fall > 0 || p.fin != null || final[pi]) return;
    if (a === 'A') tryStep(p);
    else { p.om += a === 'L' ? -IMP : IMP; if (paneOf(pi)) sfx.lane(); }
  };
  const unbind = bindInput({ cv: renderer.domElement, panes, n, online, me, act });

  function onNet(m) {
    const p = players[m.from];
    if (!p || p.local) return;
    if (m.t === 'p' && typeof m.d === 'number') { p.td = m.d; p.tth = +m.th || 0; }
    else if (m.t === 'fin' && !final[p.i] && typeof m.d === 'number') {
      final[p.i] = { time: typeof m.time === 'number' ? m.time : null, d: m.d, falls: m.falls | 0 };
      p.td = m.d;
    }
  }

  function botify(i, local) {
    const p = players[i];
    if (!p) return;
    p.bot = true;
    p.tag.userData.set(label(i));
    if (!local || p.local) return;
    Object.assign(p, { local: true, d: Math.floor(p.td), th: 0, om: 0, stepT: 0 });
    if (state === 'wait' && !final[i]) report(p, null);
  }

  function dispose() {
    unbind();
    panes.forEach(v => v.el.remove());
    document.body.classList.remove('split-v');
    disposeScene(scene);
  }

  resize();
  chips();
  bots.forEach(i => botify(i, me === 0));
  return { update, render, resize, onNet, dispose, botify };
}
