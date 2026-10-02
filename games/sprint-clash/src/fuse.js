import * as THREE from 'three';
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { COL, canvasTex, disposeScene, flash, buzz, Burst } from './fx.js';
import { symTex, coarse, keyHint, zones, makePane, rankChips, layout, fitFov, renderPanes, bindInput, countdown, makeShowcase, addSky, addCity, lights, makeRunner, animRunner, placeRunner, nameTag } from './stage.js';

// Hot potato: pass the bomb left / right; the receiver catches it (Action) as it lands. A fumble (too early / too late)
// still leaves the bomb with the receiver, dazed: no passing for DAZE s.
// The fuse is hidden (seeded 6–14 s); whoever owns the bomb at the bang is out. n−1 bangs, last one standing wins.
// The authority (the host, or this device in local play) owns bomb + fuse and streams state; guests only send inputs.
const RING = 4.6, TOP = .62, FL = .45, EARLY = .2, LATE = .35, GRACE = .12, COOL = .25, DAZE = 2, BOOM = 2.4, HOT = 3, NET = 1 / 15;

export function createFuse({ renderer, mode, n = 2, me = 0, bots = [], rand, send, label, onEnd }) {
  const online = mode === 'online';
  const IDX = [...Array(n).keys()];
  const fuses = IDX.slice(1).map(() => 6 + rand() * 8);
  let auth = !online || me === 0;

  const scene = new THREE.Scene(), fogC = new THREE.Color(0x0b1030);
  scene.background = fogC;
  scene.fog = new THREE.Fog(fogC, 18, 75);
  lights(scene);
  const sky = addSky(scene, fogC, 0x6a1a3c);
  addCity(scene, { y: -34, n: 200, x0: -80, x1: 80, z0: 80, z1: -80, clear: (x, z) => Math.hypot(x, z) < 16 });

  // round platform on a pillar: radial floor, hazard spokes, glowing edge and a centre ring that heats with the fuse
  const floorTex = canvasTex(512, 512, (g, w) => {
    const c = w / 2, gr = g.createRadialGradient(c, c, 0, c, c, c);
    gr.addColorStop(0, '#26184a'); gr.addColorStop(.6, '#11143a'); gr.addColorStop(1, '#090c26');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
    g.strokeStyle = 'rgba(255,120,80,.18)'; g.lineWidth = 3;
    for (let r = 40; r < c; r += 44) { g.beginPath(); g.arc(c, c, r, 0, 7); g.stroke(); }
    g.strokeStyle = 'rgba(160,170,255,.1)'; g.lineWidth = 2;
    for (let k = 0; k < 24; k++) { const a = k * Math.PI / 12; g.beginPath(); g.moveTo(c + Math.cos(a) * 60, c + Math.sin(a) * 60); g.lineTo(c + Math.cos(a) * c, c + Math.sin(a) * c); g.stroke(); }
  });
  floorTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const metal = new THREE.MeshStandardMaterial({ color: 0x151a3e, roughness: .35, metalness: .7 });
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(6.6, 4.2, 34, 48), metal);
  pillar.position.y = -17 + TOP - .3;
  const floor = new THREE.Mesh(new THREE.CircleGeometry(6.6, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: floorTex, roughness: .5, metalness: .3 }));
  floor.position.y = TOP - .3;
  const edge = new THREE.Mesh(new THREE.TorusGeometry(6.6, .07, 8, 128).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff6a2a, toneMapped: false }));
  edge.position.y = TOP - .3;
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xff6a2a, toneMapped: false, transparent: true, opacity: .5 });
  const core = new THREE.Mesh(new THREE.TorusGeometry(1.3, .05, 6, 64).rotateX(Math.PI / 2), coreMat);
  core.position.y = TOP - .28;
  scene.add(pillar, floor, edge, core);

  // seats around the ring; each athlete faces the centre on a pedestal rimmed in its colour
  const pedGeo = new THREE.CylinderGeometry(.85, .95, .3, 32), rimGeo = new THREE.TorusGeometry(.9, .05, 6, 48).rotateX(Math.PI / 2);
  const up = new THREE.Vector3(0, 1, 0);
  const players = IDX.map(i => {
    const a = -Math.PI / 2 + i * Math.PI * 2 / n, p = new THREE.Vector3(Math.cos(a) * RING, 0, Math.sin(a) * RING);
    const ped = new THREE.Mesh(pedGeo, metal); ped.position.set(p.x, TOP - .15, p.z);
    const rimMat = new THREE.MeshBasicMaterial({ color: COL[i], toneMapped: false });
    const rim = new THREE.Mesh(rimGeo, rimMat); rim.position.set(p.x, TOP + .01, p.z);
    const r = makeRunner(COL[i]);
    r.rotation.y = Math.atan2(p.x, p.z);
    const tag = nameTag(label(i), COL[i]);
    r.add(tag);
    scene.add(ped, rim, r);
    return {
      i, p, r, rimMat, tag, alive: true, pips: 0, daze: 0, fly: null, react: 0, think: 1, bob: Math.random() * 6,
      hand: p.clone().multiplyScalar(1 - .7 / RING).setY(TOP + 1.3),
      right: p.clone().negate().normalize().cross(up), // screen-right for a camera behind this seat looking in
      cam: new THREE.PerspectiveCamera(60, 1, .1, 160), fov: 60,
    };
  });

  // bomb: glossy black ball, fuse cap, glowing spark, additive heat halo
  const bomb = new THREE.Group();
  const bombMat = new THREE.MeshStandardMaterial({ color: 0x14161f, roughness: .2, metalness: .6, emissive: 0xff3010, emissiveIntensity: 0 });
  bomb.add(new THREE.Mesh(new THREE.SphereGeometry(.34, 24, 16), bombMat));
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(.09, .11, .16, 12), new THREE.MeshStandardMaterial({ color: 0x9aa0b8, roughness: .3, metalness: .9 }));
  cap.position.y = .36; bomb.add(cap);
  const spark = new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffd060, toneMapped: false }));
  spark.position.y = .5; bomb.add(spark);
  const haloTex = canvasTex(64, 64, (g, w) => {
    const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,140,60,.9)'); gr.addColorStop(.4, 'rgba(255,60,20,.35)'); gr.addColorStop(1, 'rgba(255,40,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  });
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  bomb.add(halo);
  bomb.visible = false;
  scene.add(bomb);
  const burst = new Burst(scene, 320);
  // catch preview at the receiver's hand: a ring closes onto a fixed target ring exactly as the bomb lands,
  // gold while the catch window is open (EARLY before landing → LATE after), red on a fumble
  const ringTex = canvasTex(128, 128, (g, w) => {
    g.strokeStyle = '#fff'; g.lineWidth = 9; g.shadowColor = '#fff'; g.shadowBlur = 10;
    g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 14, 0, 7); g.stroke();
  });
  const ringMat = () => new THREE.SpriteMaterial({ map: ringTex, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, toneMapped: false });
  const aim = new THREE.Sprite(ringMat()), target = new THREE.Sprite(ringMat());
  aim.renderOrder = target.renderOrder = 3;
  target.scale.setScalar(1);
  // dazed: gold stars circling the holder's helmet
  const stars = new THREE.Group(), starMat = new THREE.SpriteMaterial({ map: symTex('A'), color: 0xffe070, depthWrite: false, toneMapped: false });
  for (let k = 0; k < 3; k++) { const s = new THREE.Sprite(starMat); s.scale.setScalar(.28); stars.add(s); }
  stars.visible = false;
  scene.add(stars);
  const cue = new THREE.Group();
  cue.add(target, aim);
  cue.visible = false;
  scene.add(cue);
  const tip = new THREE.Vector3(), tmp = new THREE.Vector3();

  const panes = (online ? [me] : IDX).map(pi => {
    const v = makePane(pi, label, zones('◀', '●', '▶'));
    v.chips = rankChips(v, n, label);
    v.hint.textContent = coarse ? t('fuseTouch') : t('fuseKeys', keyHint(pi, online));
    return v;
  });
  const paneOf = i => panes.find(v => v.pi === i);
  const say = (i, text, cls) => { const v = paneOf(i); if (v) flash(v.msg, text, cls); };
  const chips = () => panes.forEach(v => v.chips(players.map(p => (p.alive ? `★${p.pips}` : '✕'))));

  // fl: { f, to, own (passer: still owns it in the air), u (0→1 flight), w (s since landing), fumble, plan }
  let qP = null; // a pass pressed just before it's allowed
  let roundTxt = '', ph = 'count', r = 0, h = -1, fl = null, fuse = 0, hk = 0, holdT = 0, boomT = 0, time = 0, netT = 0, tickT = 0, sparkT = 0, shake = 0;
  const elim = [], ctrl = new Set(online ? [me] : IDX), ai = new Set();
  const step = countdown(panes);
  const alive = () => IDX.filter(i => players[i].alive);

  // the living neighbour on this seat's screen-left / right (2 left: both sides are the same player)
  function neighbour(i, a) {
    const al = alive().filter(j => j !== i);
    if (!al.length) return -1;
    const nx = al.find(j => j > i) ?? al[0], pv = al.findLast(j => j < i) ?? al.at(-1), P = players[i];
    const side = j => tmp.copy(players[j].p).sub(P.p).dot(P.right);
    const [l, rr] = side(nx) >= side(pv) ? [pv, nx] : [nx, pv];
    return a === 'L' ? l : rr;
  }

  function got(i) {
    holdT = 0;
    players[i].think = .6 + Math.random() * 1.6;
    say(i, t('fusePass'), 'go');
  }

  function startRound() {
    const al = alive();
    ph = 'play'; fl = null; hk = 0;
    players.forEach(p => { p.daze = 0; });
    fuse = fuses[r] ?? 6 + Math.random() * 8;
    h = al[Math.random() * al.length | 0];
    got(h);
    netT = 0;
  }

  function toss(f, to) {
    if (paneOf(f) || paneOf(to)) sfx.toss();
    players[f].react = .35;
    panes.forEach(v => { if (v.pi === f) v.hint.classList.add('hide'); });
  }

  // fumbled: the bomb drops into the receiver's hands anyway, but they can't pass it for DAZE s
  function dazed(i) {
    const p = players[i];
    p.daze = DAZE; p.react = .35;
    if (paneOf(i)) { sfx.miss(); buzz(40); }
    say(i, t('fuseDazed'), 'hit');
  }

  function caught(i) {
    tmp.copy(players[i].hand);
    burst.emit(tmp.x, tmp.y, tmp.z, 0xffe070, 18, 3);
    players[i].pips++;
    players[i].react = .35;
    if (paneOf(i)) { sfx.catch(); say(i, t('fuseCatch'), 'great'); }
    chips();
  }

  // authority: apply one player's input. Remote receivers get GRACE extra on the late edge (applied where it's fumbled).
  function input(i, a) {
    if (ph !== 'play' || !players[i]?.alive) return;
    if (a !== 'A') {
      if (h !== i) return;
      if (holdT < COOL || players[i].daze > 0) { if (players[i].daze < .3) qP = { i, a, t: .3 }; return; } // too soon: pass the moment you can
      const to = neighbour(i, a);
      if (to < 0) return;
      fl = { f: i, to, own: i, u: 0, w: 0, fumble: false, plan: null };
      h = -1;
      toss(i, to);
    } else if (fl && fl.to === i && !fl.fumble) {
      if (fl.u < 1 && (1 - fl.u) * FL > EARLY) { fl.fumble = true; say(i, t('early'), 'hit'); }
      else {
        h = i; fl = null;
        caught(i); got(i);
        if (online) send({ t: 'fc', from: me, i });
      }
    }
  }

  function bang(i) {
    const p = players[i];
    ph = 'boom'; boomT = BOOM; r++;
    p.alive = false; elim.push(i);
    fl = null; h = -1;
    burst.emit(bomb.position.x, bomb.position.y, bomb.position.z, 0xff7a2a, 70, 11);
    burst.emit(bomb.position.x, bomb.position.y, bomb.position.z, 0xffe070, 40, 7);
    bomb.visible = false;
    p.fly = p.p.clone().normalize().multiplyScalar(7).setY(11);
    p.rimMat.color.setHex(0x2a3060);
    shake = .6;
    if (panes.length) { sfx.boom(); buzz(120); }
    panes.forEach(v => flash(v.msg, v.pi === i ? t('out') : t('fuseBang', { p: label(i) }), 'hit'));
    if (online && auth) send({ t: 'fb', from: me, i });
    chips();
  }

  const sc = makeShowcase(panes, label, onEnd);
  function finish() {
    ph = 'done';
    const order = [...alive(), ...elim.slice().reverse()];
    const w = players[order[0]].p; // winner never moves from their pedestal
    sc.start({ order, draw: false, scores: players.map(p => t('fuseCatches', { n: p.pips })) }, new THREE.Vector3(w.x, TOP, w.z), { r: 4.5, h: 2.3, look: 1.3 });
  }

  // AI (authority only): holds 0.6–2.2 s then passes a random way; catches 85% of throws inside the window
  function drive(dt) {
    for (const i of ai) {
      if (!ctrl.has(i) || !players[i].alive) continue;
      const p = players[i];
      if (h === i && p.daze <= 0 && (p.think -= dt) <= 0) input(i, Math.random() < .5 ? 'L' : 'R');
      else if (fl && fl.to === i) {
        fl.plan ??= Math.random() < .85 ? -.12 + Math.random() * .3 : 99; // seconds relative to landing
        if ((fl.u < 1 ? -(1 - fl.u) * FL : fl.w) >= fl.plan) input(i, 'A');
      }
    }
  }

  function simulate(dt) {
    if (fl) {
      if (fl.u < 1) fl.u = Math.min(1, fl.u + dt / FL);
      else if (fl.fumble || (fl.w += dt) > LATE + (ctrl.has(fl.to) ? 0 : GRACE)) {
        h = fl.to; fl = null; holdT = 0;
        players[h].think = .6 + Math.random() * 1.6; // AI waits this long after the daze wears off
        dazed(h);
        if (online) send({ t: 'fd', from: me, i: h });
      }
    } else holdT += dt;
    if (qP && (qP.t -= dt) <= 0) qP = null;
    else if (qP && h === qP.i && holdT >= COOL && players[h].daze <= 0) { const { i, a } = qP; qP = null; input(i, a); }
    fuse -= dt;
    hk = fuse < HOT ? Math.min(1, 1 - fuse / HOT) : 0; // heat only shows in the last 3 s
    if (fuse <= 0) bang(h >= 0 ? h : fl.own);
  }

  function update(dt) {
    time += dt;
    if (ph === 'count') { if (!step(dt)) { if (auth) startRound(); else ph = 'wait'; } }
    else if (ph === 'wait') { if (auth) startRound(); }
    else if (ph === 'play') {
      if (auth) { drive(dt); if (ph === 'play') simulate(dt); }
      else if (fl && fl.u < 1) fl.u = Math.min(1, fl.u + dt / FL); // guests: smooth between snapshots
      else if (fl) fl.w += dt;
    } else if (ph === 'boom' && (boomT -= dt) <= 0) {
      if (alive().length <= 1) finish();
      else if (auth) startRound();
      else ph = 'wait';
    }
    if (online && auth && ph !== 'done' && (netT -= dt) <= 0) {
      netT = NET;
      send({ t: 'fs', from: me, ph: ph === 'play' ? 1 : 0, h, f: fl?.f ?? -1, to: fl?.to ?? -1, own: fl?.own ?? -1, u: fl?.u ?? 0, w: fl?.w ?? 0, hk });
    }

    // bomb: in hand, arcing, or hovering at the receiver while the catch window runs
    bomb.visible = ph === 'play' && (h >= 0 || !!fl);
    if (h >= 0) bomb.position.copy(players[h].hand).y += Math.sin(time * 6) * .04;
    else if (fl) {
      const A = players[fl.f].hand, B = players[fl.to].hand;
      if (fl.u < 1) bomb.position.lerpVectors(A, B, fl.u).y += Math.sin(Math.PI * fl.u) * 2.2;
      else bomb.position.copy(B).y += Math.sin(time * 30) * .06;
    }
    cue.visible = ph === 'play' && !!fl;
    if (cue.visible) {
      const left = (1 - fl.u) * FL, open = !fl.fumble && left <= EARLY, fade = fl.u < 1 ? 1 : Math.max(0, 1 - fl.w / LATE);
      cue.position.copy(players[fl.to].hand);
      aim.scale.setScalar(1 + 2.6 * left / FL);
      aim.material.color.setHex(fl.fumble ? 0xff3040 : open ? 0xffe070 : COL[fl.to]);
      aim.material.opacity = (open ? 1 : .7) * fade;
      target.material.color.setHex(open ? 0xffe070 : 0xffffff);
      target.material.opacity = (open ? .9 : .35) * fade;
    }
    const pulse = .5 + .5 * Math.sin(time * (4 + hk * 26));
    bombMat.emissiveIntensity = .15 + hk * 1.2 * pulse + .1 * pulse;
    halo.scale.setScalar(1 + hk * 1.6 + pulse * .3);
    halo.material.opacity = .35 + hk * .6;
    spark.scale.setScalar(.8 + Math.random() * .6 + hk);
    bomb.rotation.y += dt * (1 + hk * 4); bomb.rotation.z = Math.sin(time * 3) * .15;
    coreMat.color.setHex(0xff6a2a).lerp(tmp.set(1, .85, .5), hk * pulse);
    coreMat.opacity = .35 + hk * .6 * pulse;
    core.scale.setScalar(1 + hk * .15 * pulse);
    if (bomb.visible) {
      spark.getWorldPosition(tip);
      if ((sparkT -= dt) <= 0) { sparkT = .09 - hk * .06; burst.emit(tip.x, tip.y, tip.z, hk > .5 ? 0xffe070 : 0xffa040, 2 + (hk * 4 | 0), 2 + hk * 2); }
      if (panes.length && (tickT -= dt) <= 0) { tickT = hk ? .45 - hk * .37 : .6; sfx.tick(); }
    }

    // athletes: idle bob, arms out when holding or about to catch; the loser is blown off the platform
    for (const p of players) {
      const i = p.i;
      if (p.fly) {
        p.fly.y -= 20 * dt;
        p.r.position.addScaledVector(p.fly, dt);
        p.r.rotation.x += dt * 7;
        p.r.userData.shadow.visible = false;
        if (p.r.position.y < -30) { p.r.visible = false; p.fly = null; }
        continue;
      }
      if (!p.alive) continue;
      p.react = Math.max(0, p.react - dt);
      if (p.daze > 0 && (p.daze -= dt) <= 0 && h === i && ph === 'play') say(i, t('fusePass'), 'go');
      placeRunner(p.r, p.p.x, TOP, p.p.z, TOP);
      animRunner(p.r, time * 2 + p.bob, .05);
      const u = p.r.userData, catching = fl && fl.to === i, reach = h === i || catching ? 1.25 : p.react * 3;
      u.armL.rotation.x = u.armR.rotation.x = reach;
      u.elbowL.rotation.x = u.elbowR.rotation.x = h === i ? .7 : .3;
      u.body.rotation.x = catching ? .12 : 0;
      u.body.rotation.z = p.daze > 0 ? Math.sin(time * 7) * .18 * Math.min(1, p.daze) : 0; // woozy sway
      const win = catching && !fl.fumble && (fl.u >= 1 || (1 - fl.u) * FL <= EARLY);
      p.rimMat.color.setHex(win ? 0xffffff : COL[i]);
    }
    const dz = ph === 'play' ? players.find(p => p.alive && p.daze > 0) : null;
    stars.visible = !!dz;
    if (dz) {
      stars.position.set(dz.p.x, TOP + 2.05, dz.p.z);
      stars.children.forEach((s, k) => { const a = time * 5 + k * 2.094; s.position.set(Math.cos(a) * .4, Math.sin(a * 2) * .05, Math.sin(a) * .4); });
      starMat.opacity = Math.min(1, dz.daze * 2);
    }
    shake = Math.max(0, shake - dt);
    burst.update(dt);
    sc.update(dt);
    const al = Math.max(1, n - 1), rt = t('fuseRound', { r: Math.min(r + (ph === 'boom' ? 0 : 1), al), n: al });
    if (rt !== roundTxt) { roundTxt = rt; panes.forEach(v => { v.val.textContent = rt; }); } // DOM write only on change
  }

  function resize() {
    layout(panes);
    for (const v of panes) { const p = players[v.pi]; p.cam.aspect = v.w / v.h; p.fov = fitFov(p.cam.aspect, 36, 55, 100); }
  }

  function render() {
    renderPanes(renderer, scene, panes, v => {
      const p = players[v.pi], c = p.cam, k = (RING + 4.6) / RING;
      if (sc.on) { sc.cam(v, c, p.fov); sky.position.copy(c.position); return c; }
      c.position.set(p.p.x * k, TOP + 4.8, p.p.z * k);
      if (shake) c.position.add(tmp.set(Math.random() - .5, Math.random() - .5, Math.random() - .5).multiplyScalar(shake));
      c.lookAt(-p.p.x * .3, TOP + .6, -p.p.z * .3);
      if (v.flip) c.rotateZ(Math.PI);
      c.fov = p.fov; c.updateProjectionMatrix();
      sky.position.copy(c.position);
      return c;
    });
  }

  const act = (pi, a) => {
    const p = players[pi];
    if (!p || !ctrl.has(pi) || ai.has(pi) || !p.alive) return;
    if (auth) input(pi, a);
    else if (ph === 'play') send({ t: 'fi', from: pi, a });
  };
  const unbind = bindInput({ cv: renderer.domElement, panes, n, online, me, act });

  const seat = x => Number.isInteger(x) && x >= -1 && x < n;
  function onNet(m) {
    if (m.t === 'fi') {
      if (auth && seat(m.from) && m.from >= 0 && !ctrl.has(m.from) && ['L', 'R', 'A'].includes(m.a)) input(m.from, m.a);
      return;
    }
    if (auth || m.from !== 0) return; // everything else is host → guest state
    if (m.t === 'fs') {
      if (![m.h, m.f, m.to, m.own].every(seat) || typeof m.u !== 'number' || typeof m.w !== 'number' || typeof m.hk !== 'number') return;
      if (m.ph === 1 && ph === 'wait') ph = 'play';
      if (ph !== 'play') return;
      const nf = m.f >= 0 && m.to >= 0 ? { f: m.f, to: m.to, own: m.own, u: Math.min(1, Math.max(0, m.u)), w: m.w, fumble: false } : null;
      if (nf && (!fl || fl.f !== nf.f || fl.to !== nf.to)) toss(nf.f, nf.to);
      if (m.h >= 0 && m.h !== h) holdT = 0;
      h = m.h; fl = nf; hk = Math.min(1, Math.max(0, m.hk));
    } else if (m.t === 'fc' && seat(m.i) && m.i >= 0) caught(m.i);
    else if (m.t === 'fd' && seat(m.i) && m.i >= 0) dazed(m.i);
    else if (m.t === 'fb' && seat(m.i) && m.i >= 0 && players[m.i].alive && ph !== 'done') bang(m.i);
  }

  function botify(i, local) {
    const p = players[i];
    if (!p) return;
    ai.add(i);
    if (local) ctrl.add(i);
    p.tag.userData.set(label(i));
    // host gone: this guest takes over the bomb. The hidden fuse never reached us, so roll a fresh short one.
    if (i === 0 && local && !auth) { auth = true; if (ph === 'play') fuse = 1.5 + Math.random() * 4; }
    chips();
  }

  function dispose() {
    unbind();
    panes.forEach(v => v.el.remove());
    document.body.classList.remove('split-v');
    disposeScene(scene);
  }

  resize();
  // bomb, halo, spark and catch rings stay hidden until the first pass; compile their shaders now so that moment doesn't hitch
  bomb.visible = cue.visible = stars.visible = true; renderer.compile(scene, players[0].cam); bomb.visible = cue.visible = stars.visible = false;
  chips();
  bots.forEach(i => botify(i, me === 0));
  return { update, render, resize, onNet, dispose, botify };
}
