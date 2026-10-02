import * as THREE from 'three';
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { COL, canvasTex, disposeScene, flash, buzz, Burst } from './fx.js';
import { coarse, keyHint, zones, makePane, rankChips, layout, fitFov, renderPanes, bindInput, countdown, makeShowcase, addSky, addCity, lights, makeRunner, animRunner, nameTag } from './stage.js';

// Sumo Bump: pucks on an icy ring, bump rivals off the edge. The ring shrinks every 15 s. First to 2 round wins.
// Online is host-authoritative: guests send input changes, the host simulates and broadcasts snapshots at 20 Hz.
// Guests draw rivals ~100 ms behind (interpolated) and their own puck from the newest snapshot, extrapolated.
const R0 = 9, PR = .75, STEP = 1 / 60, ROT = 2.8, ACC = 2.6, DAMP = .9, CHARGE = .8, COOL = .6, BUF = .3, E = .9;
const SHRINK_EVERY = 15, SHRINK = 1.8, RMIN = 2.2, CAP = 45, CAP_END = 62, WINS = 2, MAX_ROUNDS = 5;
const ST = ['count', 'play', 'end', 'done'], F = 10; // snapshot floats per puck: x z vx vz h alive charge bumps dashes y

export function createSumo({ renderer, mode, n = 2, me = 0, bots = [], send, label, onEnd }) {
  const online = mode === 'online';
  const IDX = [...Array(n).keys()];
  let auth = !online || me === 0; // this device runs the simulation

  const scene = new THREE.Scene(), fogC = new THREE.Color(0x0a1030);
  scene.background = fogC;
  scene.fog = new THREE.Fog(fogC, 30, 150);
  lights(scene);
  const sky = addSky(scene, fogC, 0x2a3a8c);
  addCity(scene, { y: -70, n: 220, x0: -130, x1: 130, z0: 130, z1: -130, clear: (x, z) => Math.hypot(x, z) < 26 });

  // floating ice platform: unit-radius parts scaled (R, 1, R) as the ring shrinks
  const iceTex = canvasTex(512, 512, (g, w) => {
    const c = w / 2, gr = g.createRadialGradient(c, c, 0, c, c, c);
    gr.addColorStop(0, '#5f8fc4'); gr.addColorStop(.75, '#34609e'); gr.addColorStop(1, '#1c3470');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
    g.strokeStyle = 'rgba(200,230,255,.3)'; g.lineWidth = 2;
    for (let k = 0; k < 60; k++) { const a = Math.random() * 7, r = Math.random() * c * .9; g.beginPath(); g.moveTo(c + Math.cos(a) * r, c + Math.sin(a) * r); g.lineTo(c + Math.cos(a + .3) * (r + 30), c + Math.sin(a + .3) * (r + 30)); g.stroke(); }
    g.strokeStyle = 'rgba(255,90,160,.7)'; g.lineWidth = 6;
    g.beginPath(); g.arc(c, c, c * .28, 0, 7); g.stroke();
    g.beginPath(); g.arc(c, c, c * .93, 0, 7); g.stroke();
    g.fillStyle = 'rgba(230,240,255,.75)'; g.fillRect(c - 60, c - 30, 120, 8); g.fillRect(c - 60, c + 22, 120, 8); // shikiri-sen lines
  });
  const plat = new THREE.Group();
  const ice = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, .5, 96), [
    new THREE.MeshStandardMaterial({ color: 0x1a2a5a, roughness: .3, metalness: .5 }),
    new THREE.MeshStandardMaterial({ map: iceTex, roughness: .7, metalness: 0, envMapIntensity: .35 }),
    new THREE.MeshStandardMaterial({ color: 0x1a2a5a }),
  ]);
  ice.position.y = -.25;
  const under = new THREE.Mesh(new THREE.CylinderGeometry(1, .35, 3, 48, 1, true), new THREE.MeshStandardMaterial({ color: 0x0c1030, roughness: .5, metalness: .6, side: THREE.DoubleSide }));
  under.position.y = -2;
  const bandMat = new THREE.MeshBasicMaterial({ color: 0x35e0ff, toneMapped: false, side: THREE.DoubleSide });
  const band = new THREE.Mesh(new THREE.CylinderGeometry(1.004, 1.004, .14, 96, 1, true), bandMat);
  band.position.y = -.02;
  const band2 = new THREE.Mesh(new THREE.CylinderGeometry(.7, .7, .05, 64, 1, true), new THREE.MeshBasicMaterial({ color: 0xff3aa8, toneMapped: false, side: THREE.DoubleSide }));
  band2.position.y = -1.6;
  plat.add(ice, under, band, band2);
  scene.add(plat);

  // pucks: dark shell, glowing rim, athlete in a sumo crouch on top, heading arrow and charge ring
  const shellGeo = new THREE.CylinderGeometry(PR, PR * 1.06, .5, 40), rimGeo = new THREE.TorusGeometry(PR * 1.02, .06, 8, 48).rotateX(Math.PI / 2);
  const arrowGeo = new THREE.ConeGeometry(.2, .45, 3).rotateX(-Math.PI / 2), chargeGeo = new THREE.TorusGeometry(PR * 1.25, .05, 6, 48).rotateX(Math.PI / 2);
  const shaftGeo = new THREE.BoxGeometry(.09, .05, 1).translate(0, 0, -.5); // unit length, grows forward from the puck edge
  const shellMat = new THREE.MeshStandardMaterial({ color: 0x141a3c, roughness: .25, metalness: .7 });
  const pucks = IDX.map(i => {
    const g = new THREE.Group(), glow = new THREE.MeshBasicMaterial({ color: COL[i], toneMapped: false });
    const shell = new THREE.Mesh(shellGeo, shellMat); shell.position.y = .25;
    const rim = new THREE.Mesh(rimGeo, glow); rim.position.y = .42;
    const am = new THREE.MeshBasicMaterial({ color: COL[i], toneMapped: false });
    const arrow = new THREE.Mesh(arrowGeo, am); arrow.position.set(0, .3, -PR - .3);
    const shaft = new THREE.Mesh(shaftGeo, am); shaft.position.set(0, .3, -PR); shaft.scale.z = .08;
    const cm = new THREE.MeshBasicMaterial({ color: 0xffd23f, toneMapped: false, transparent: true, opacity: 0, depthWrite: false });
    const charge = new THREE.Mesh(chargeGeo, cm); charge.position.y = .1;
    const rider = makeRunner(COL[i]); rider.scale.setScalar(.62); rider.position.y = .5;
    rider.userData.shadow.visible = false;
    const u = rider.userData;
    u.armL.rotation.set(-1.2, 0, -.3); u.armR.rotation.set(-1.2, 0, .3);
    const tag = nameTag(label(i), COL[i]); tag.position.y = 2;
    g.add(shell, rim, shaft, arrow, charge, rider, tag);
    scene.add(g);
    return { g, rider, charge, cm, tag, arrow, shaft, am, base: new THREE.Color(COL[i]) };
  });
  const burst = new Burst(scene), sparks = new Burst(scene, 96), GOLD = new THREE.Color(0xffd23f); // own spark pool: charge sparks never evict KO bursts

  // sim state (authoritative on the host, mirrored from snapshots on guests)
  const S = {
    st: 'count', stT: 0, round: 1, R: R0, Rt: R0, T: 0, wins: Array(n).fill(0), kos: Array(n).fill(0), surv: Array(n).fill(0),
    p: IDX.map(() => ({ x: 0, z: 0, vx: 0, vz: 0, h: 0, alive: 1, y: 0, vy: 0, cool: 0, dashT: 0, last: -1, lastT: 0, b: 0, d: 0 })),
  };
  const inp = IDX.map(() => ({ l: 0, r: 0, c: 0, ct: 0 })); // held left/right, charging, charge time
  const ctrl = new Set(online ? [me] : IDX), ai = new Set(), brain = IDX.map(() => ({ think: 0, want: 0 }));

  const panes = (online ? [me] : IDX).map(pi => {
    const v = makePane(pi, label, zones('↺', '◎', '↻'));
    v.chips = rankChips(v, n, label);
    v.hint.textContent = coarse ? t('sumoTouch') : t('sumoKeys', keyHint(pi, online));
    v.cam = new THREE.PerspectiveCamera(60, 1, .1, 260); v.fov = 60; v.cp = new THREE.Vector3(0, 14, 16); v.look = new THREE.Vector3(); v.out = new THREE.Vector2(0, 1);
    return v;
  });
  const paneOf = i => panes.find(v => v.pi === i);
  const shown = i => !!paneOf(i);
  const chips = () => panes.forEach(v => v.chips(S.wins.map(w => '★' + w)));
  let step = countdown(panes);

  function place() {
    S.p.forEach((p, i) => {
      const a = i / n * Math.PI * 2 + Math.PI / 4;
      Object.assign(p, { x: Math.sin(a) * 5.5, z: Math.cos(a) * 5.5, vx: 0, vz: 0, h: a, alive: 1, y: 0, vy: 0, cool: 0, qd: null, dashT: 0, last: -1, lastT: 0 }); // h = a faces the centre
      inp[i].c = 0; inp[i].ct = 0;
    });
    Object.assign(S, { R: R0, Rt: R0, T: 0 });
  }

  function roundStart() {
    S.st = 'count'; S.stT = 0;
    place();
    step = countdown(panes);
    panes.forEach(v => { v.val.textContent = t('sumoRound', { n: S.round }); v.hint.classList.remove('hide'); });
    chips();
  }

  // --- simulation (authority only)
  const fwd = h => [-Math.sin(h), -Math.cos(h)];
  function dash(i, pw) {
    const p = S.p[i];
    if (S.st !== 'play' || !p.alive) return;
    if (p.cool > 0) { if (p.cool < BUF) p.qd = pw; return; } // released just before the cooldown ends: dash the moment it does
    const [fx, fz] = fwd(p.h), k = 3.5 + 7 * Math.min(1, Math.max(0, pw));
    p.vx += fx * k; p.vz += fz * k; p.dashT = .35; p.cool = COOL; p.d++;
  }

  function think(i, dt) { // AI: chase the nearest rival, head for the middle near the edge, dash when lined up
    const p = S.p[i], b = brain[i], io = inp[i];
    if ((b.think -= dt) > 0) return;
    b.think = .08 + Math.random() * .12;
    let tx = 0, tz = 0, best = 1e9;
    const edge = Math.hypot(p.x, p.z) > S.R - 2.4 - Math.hypot(p.vx, p.vz) * .3;
    if (!edge) for (const j of IDX) {
      const q = S.p[j], d = Math.hypot(q.x - p.x, q.z - p.z);
      if (j !== i && q.alive && d < best) { best = d; tx = q.x + q.vx * .3; tz = q.z + q.vz * .3; }
    }
    const want = Math.atan2(-(tx - p.x), -(tz - p.z)), diff = Math.atan2(Math.sin(want - p.h), Math.cos(want - p.h));
    io.l = diff > .15 ? 1 : 0; io.r = diff < -.15 ? 1 : 0;
    if (io.c && io.ct >= b.want) { io.c = 0; dash(i, io.ct / CHARGE); io.ct = 0; }
    else if (!io.c && !edge && best < 6.5 && Math.abs(diff) < .3 && p.cool <= 0 && Math.random() < .15) { io.c = 1; io.ct = 0; b.want = .25 + Math.random() * .55; }
  }

  function sim(dt) {
    S.stT += dt;
    if (S.st === 'end' && S.stT > 2.6) {
      if (Math.max(...S.wins) >= WINS || S.round >= MAX_ROUNDS) { S.st = 'done'; return; }
      S.round++; roundStart(); return;
    }
    const play = S.st === 'play';
    if (play) {
      S.T += dt;
      const k = Math.floor(S.T / SHRINK_EVERY);
      S.Rt = S.T > CAP ? Math.max(0, R0 - SHRINK * 3 - (S.T - CAP) * .45) : Math.max(RMIN, R0 - k * SHRINK);
      if (S.T >= CAP_END) S.Rt = 0;
    }
    if (play) S.R += Math.sign(S.Rt - S.R) * Math.min(Math.abs(S.Rt - S.R), 1.2 * dt); // the ring stops shrinking once the round is decided
    for (const i of IDX) {
      const p = S.p[i], io = inp[i];
      if (play && ai.has(i) && ctrl.has(i)) think(i, dt);
      if (!p.alive) { p.vy -= 25 * dt; p.y += p.vy * dt; p.x += p.vx * dt; p.z += p.vz * dt; continue; }
      if (play) {
        p.h += (io.l - io.r) * ROT * dt;
        if (io.c) io.ct = Math.min(CHARGE, io.ct + dt);
        const [fx, fz] = fwd(p.h), a = io.c ? ACC * .4 : ACC; // charging plants your feet a little
        p.vx += fx * a * dt; p.vz += fz * a * dt;
        S.surv[i] += dt;
      }
      const damp = Math.exp(-(play ? DAMP : 6) * dt); // round over: everyone skids to a stop instead of sliding out
      p.vx *= damp; p.vz *= damp;
      p.x += p.vx * dt; p.z += p.vz * dt;
      p.cool -= dt; p.dashT -= dt;
      if (p.qd != null && p.cool <= 0) { const pw = p.qd; p.qd = null; dash(i, pw); }
    }
    // collisions: equal masses, restitution E; a dashing puck hits harder
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
      const p = S.p[a], q = S.p[b];
      if (!p.alive || !q.alive) continue;
      let dx = q.x - p.x, dz = q.z - p.z, d = Math.hypot(dx, dz);
      if (d >= PR * 2 || d < 1e-4) continue;
      dx /= d; dz /= d;
      const vn = (q.vx - p.vx) * dx + (q.vz - p.vz) * dz, push = (PR * 2 - d) / 2;
      p.x -= dx * push; p.z -= dz * push; q.x += dx * push; q.z += dz * push;
      if (vn >= 0) continue;
      const j = -(1 + E) * vn / 2, kp = p.dashT > 0 ? 2 : 0, kq = q.dashT > 0 ? 2 : 0;
      p.vx -= dx * (j + kq); p.vz -= dz * (j + kq); q.vx += dx * (j + kp); q.vz += dz * (j + kp);
      p.last = b; q.last = a; p.lastT = q.lastT = S.T;
      if (-vn > 1.5) { p.b++; q.b++; }
    }
    // ring-outs; if everyone left would fall in the same step, the one nearest the middle holds on
    const alive = IDX.filter(i => S.p[i].alive), outs = play ? alive.filter(i => Math.hypot(S.p[i].x, S.p[i].z) > S.R + .05) : [];
    if (outs.length && outs.length === alive.length) outs.splice(outs.indexOf(outs.reduce((m, i) => (Math.hypot(S.p[i].x, S.p[i].z) < Math.hypot(S.p[m].x, S.p[m].z) ? i : m))), 1);
    for (const i of outs) {
      const p = S.p[i];
      p.alive = 0; p.vy = 2;
      if (p.last >= 0 && S.T - p.lastT < 3) S.kos[p.last]++;
    }
    if (play && alive.length - outs.length <= 1) {
      const w = alive.find(i => !outs.includes(i));
      if (w != null) S.wins[w]++;
      S.st = 'end'; S.stT = 0;
    }
  }

  // --- networking
  const q2 = v => Math.round(v * 100) / 100;
  let simT = 0, acc = 0, sendAcc = 0;
  function snapshot() {
    const p = [];
    S.p.forEach((s, i) => p.push(q2(s.x), q2(s.z), q2(s.vx), q2(s.vz), q2(s.h), s.alive, q2(inp[i].c ? inp[i].ct / CHARGE : 0), s.b, s.d, q2(s.y)));
    send({ t: 'ss', from: 0, k: q2(simT), st: ST.indexOf(S.st), r: S.round, R: q2(S.R), T: q2(S.T), w: S.wins, ko: S.kos, sv: S.surv.map(q2), p });
  }
  const snaps = []; // guest: recent snapshots for interpolation
  let gT = 0;
  const num = x => typeof x === 'number' && Number.isFinite(x);
  const arr = (a, len) => Array.isArray(a) && a.length === len && a.every(num);

  function applySnap(m) {
    for (const i of IDX) {
      const s = S.p[i], o = i * F, pa = m.p.slice(o, o + F);
      if (i === me && pa[7] > s.b) { sfx.bump(); buzz(30); }
      if (shown(i) && pa[8] > s.d) sfx.boost();
      if (shown(i) && s.alive && !pa[5]) { sfx.fall(); flash(paneOf(i).msg, t('sumoOut'), 'hit'); }
      if (s.alive && !pa[5]) burst.emit(s.x, .3, s.z, COL[i], 24, 5);
      Object.assign(s, { x: pa[0], z: pa[1], vx: pa[2], vz: pa[3], h: pa[4], alive: pa[5], c: pa[6], b: pa[7], d: pa[8], y: pa[9] });
    }
    const st = ST[m.st];
    if (st === 'count' && S.st !== 'count') { S.round = m.r; step = countdown(panes); panes.forEach(v => { v.val.textContent = t('sumoRound', { n: m.r }); v.hint.classList.remove('hide'); }); }
    if (st === 'end' && S.st === 'play') roundOver(IDX.find(i => m.w[i] > S.wins[i]));
    Object.assign(S, { st, round: m.r, R: m.R, T: m.T, wins: m.w.slice(), kos: m.ko.slice(), surv: m.sv.slice() });
    chips();
    if (st === 'done') finish();
  }

  function onNet(m) {
    if (!m || typeof m.t !== 'string') return;
    const i = m.from;
    if (auth) { // host: guest inputs
      if (!Number.isInteger(i) || i < 1 || i >= n || ctrl.has(i)) return;
      if (m.t === 'si' && [-1, 0, 1].includes(m.r)) { inp[i].l = m.r > 0 ? 1 : 0; inp[i].r = m.r < 0 ? 1 : 0; if (m.c && !inp[i].c) inp[i].ct = 0; inp[i].c = m.c ? 1 : 0; }
      else if (m.t === 'sd' && num(m.p)) { inp[i].c = 0; inp[i].ct = 0; dash(i, m.p); }
    } else if (m.t === 'ss' && i === 0 && num(m.k) && Number.isInteger(m.st) && ST[m.st] && Number.isInteger(m.r) && num(m.R) && num(m.T)
      && arr(m.w, n) && arr(m.ko, n) && arr(m.sv, n) && arr(m.p, n * F)) {
      if (snaps.length && m.k < snaps.at(-1).k) snaps.length = 0; // host restarted its clock (new round state is still in the snapshot)
      snaps.push(m);
      if (snaps.length > 30) snaps.shift();
      applySnap(m);
    }
  }

  // --- input
  let sentR = 0, sentC = 0;
  function syncInput(i) {
    if (auth) return;
    const r = inp[i].l - inp[i].r;
    if (r !== sentR || inp[i].c !== sentC) { sentR = r; sentC = inp[i].c; send({ t: 'si', from: i, r, c: inp[i].c }); }
  }
  const act = (pi, a) => {
    if (!ctrl.has(pi) || ai.has(pi)) return;
    const io = inp[pi];
    if (a === 'L') io.l = 1; else if (a === 'R') io.r = 1;
    else if (S.st === 'play' && S.p[pi].alive) { io.c = 1; io.ct = 0; }
    syncInput(pi);
  };
  const release = (pi, a) => {
    if (!ctrl.has(pi) || ai.has(pi)) return;
    const io = inp[pi];
    if (a === 'L') io.l = 0; else if (a === 'R') io.r = 0;
    else if (io.c) {
      const pw = io.ct / CHARGE;
      io.c = 0; io.ct = 0;
      if (auth) dash(pi, pw); else { sentC = 0; send({ t: 'sd', from: pi, p: q2(pw) }); }
      const ready = time - lastDash[pi] >= COOL - BUF; // too soon after the last dash: no whoosh for a dash that won't happen
      if (ready) lastDash[pi] = time;
      if (shown(pi)) ready ? sfx.boost() : sfx.miss();
    }
    syncInput(pi);
  };
  const unbind = bindInput({ cv: renderer.domElement, panes, n, online, me, act, release });

  // --- round / match end (every device computes the same ranking from the same numbers)
  function roundOver(winner) {
    panes.forEach(v => flash(v.msg, winner != null ? t('sumoTakes', { p: label(winner) }) : t('sumoNoRound'), winner === v.pi ? 'go' : ''));
    if (winner != null && shown(winner)) sfx.finish();
  }
  const sc = makeShowcase(panes, label, onEnd);
  let ended = false;
  function finish() {
    if (ended) return;
    ended = true;
    const key = i => [S.wins[i], S.kos[i], S.surv[i]];
    const order = [...IDX].sort((a, b) => S.wins[b] - S.wins[a] || S.kos[b] - S.kos[a] || S.surv[b] - S.surv[a]);
    const draw = key(order[0]).every((v, k) => v === key(order[1])[k]);
    sc.start({ order, draw, scores: IDX.map(i => t('sumoScore', { w: S.wins[i], k: S.kos[i] })) }, () => pucks[order[0]].g.position, { r: 4.2, h: 2.4, look: 1.2 });
  }

  // --- frame
  let time = 0, lastDash = IDX.map(() => -9), lastOut = IDX.map(() => 1), lastB = IDX.map(() => 0), shrinkK = 0;
  const shrinkStage = T => (T > CAP ? 9 : Math.floor(T / SHRINK_EVERY));
  function update(dt) {
    time += dt;
    if (S.st === 'count' && !step(dt) && auth) { S.st = 'play'; S.stT = 0; }
    if (S.st === 'play') panes.forEach(v => v.hint.classList.add('hide'));
    if (auth && S.st !== 'done') {
      const wasEnd = S.st, before = S.wins.slice();
      acc = Math.min(acc + dt, .25);
      while (acc >= STEP) { acc -= STEP; simT += STEP; sim(STEP); }
      if (online && (sendAcc += dt) >= .05) { sendAcc = 0; snapshot(); }
      if (wasEnd === 'play' && S.st === 'end') { roundOver(IDX.find(i => S.wins[i] > before[i])); chips(); }
      // local feedback on the authority (guests get it from snapshots)
      IDX.forEach(i => {
        const p = S.p[i];
        if (lastOut[i] && !p.alive) { burst.emit(p.x, .3, p.z, COL[i], 24, 5); if (shown(i)) { sfx.fall(); buzz(60); flash(paneOf(i).msg, t('sumoOut'), 'hit'); } }
        if (p.b > lastB[i] && shown(i)) { sfx.bump(); buzz(30); }
        if (p.b > lastB[i]) burst.emit(p.x, .5, p.z, 0xcfe8ff, 8, 3);
        lastOut[i] = p.alive; lastB[i] = p.b;
      });
      if (S.st === 'done') { if (online) snapshot(); finish(); }
    } else if (!auth) gT += dt;
    const sk = S.st === 'play' ? shrinkStage(S.T) : 0;
    if (sk > shrinkK) { panes.forEach(v => flash(v.msg, t('sumoShrink'), 'hit')); sfx.signal(); }
    shrinkK = sk;

    // ring visuals: band flashes red in the 2 s before and during a shrink
    plat.scale.set(Math.max(.01, S.R), 1, Math.max(.01, S.R));
    const ph = S.T % SHRINK_EVERY, warn = S.st === 'play' && (ph > SHRINK_EVERY - 2 || (S.T > SHRINK_EVERY && ph < 1.5) || S.T > CAP);
    bandMat.color.setHex(warn && Math.sin(time * 18) > 0 ? 0xff3a5a : 0x35e0ff);
    plat.visible = S.R > .05;

    // pucks: authority draws the sim; guests interpolate rivals 100 ms back and extrapolate their own puck
    const newest = snaps.at(-1);
    if (!auth && newest && Math.abs(gT - newest.k) > .3) gT = newest.k;
    const rt = gT - .1;
    let s0 = null, s1 = null;
    if (!auth) for (let k = snaps.length - 1; k > 0; k--) if (snaps[k - 1].k <= rt) { s0 = snaps[k - 1]; s1 = snaps[k]; break; }
    IDX.forEach(i => {
      const p = S.p[i], pk = pucks[i];
      let x = p.x, z = p.z, h = p.h, y = p.y, c = auth ? (inp[i].c ? inp[i].ct / CHARGE : 0) : p.c ?? 0;
      if (!auth && i === me && newest) { const e = Math.min(.15, Math.max(0, gT - newest.k)); x += p.vx * e; z += p.vz * e; if (inp[i].c) c = Math.min(1, (inp[i].ct += dt) / CHARGE); }
      else if (!auth && s0) {
        const f = Math.min(1, (rt - s0.k) / Math.max(1e-3, s1.k - s0.k)), o = i * F, a = s0.p, b = s1.p;
        x = a[o] + (b[o] - a[o]) * f; z = a[o + 1] + (b[o + 1] - a[o + 1]) * f;
        h = a[o + 4] + Math.atan2(Math.sin(b[o + 4] - a[o + 4]), Math.cos(b[o + 4] - a[o + 4])) * f; y = a[o + 9] + (b[o + 9] - a[o + 9]) * f;
      }
      pk.g.position.set(x, y, z);
      pk.g.rotation.y = h;
      pk.g.visible = y > -45;
      pk.cm.opacity = c > 0 ? .4 + c * .6 : 0;
      pk.charge.scale.setScalar(1.25 - c * .35);
      // charge: arrow stretches forward and heats toward gold; ring spins and pulses at full; sparks swirl off the rim
      const L = .08 + c * 1.6, full = c >= 1;
      pk.shaft.scale.z = L; pk.arrow.position.z = -PR - .3 - L + .08;
      pk.arrow.scale.setScalar(1 + c * .5 + (full ? Math.sin(time * 30) * .15 : 0));
      pk.am.color.copy(pk.base).lerp(GOLD, c);
      pk.charge.rotation.y = time * (2 + c * 10);
      if (full) pk.charge.scale.multiplyScalar(1 + Math.sin(time * 25) * .06);
      if (c > 0 && pk.g.visible && Math.random() < dt * (8 + c * 24)) {
        const a = Math.random() * Math.PI * 2, r = PR * (1.25 - c * .35);
        sparks.emit(x + Math.cos(a) * r, y + .15, z + Math.sin(a) * r, full ? 0xffffff : 0xffd23f, 1, 1 + c * 2);
      }
      const u = pk.rider.userData;
      animRunner(pk.rider, time * 3 + i, .05, .9); // squat
      u.body.rotation.x = -.35 - c * .4;
      u.armL.rotation.x = u.armR.rotation.x = -1.2 - c * .3;
      pk.tag.visible = p.alive || y > -3;
    });
    burst.update(dt); sparks.update(dt);
    sc.update(dt);
  }

  function resize() {
    layout(panes);
    for (const v of panes) { v.cam.aspect = v.w / v.h; v.fov = fitFov(v.cam.aspect, 34, 55, 95); }
  }

  const tmp = new THREE.Vector3(), t2 = new THREE.Vector2();
  function render() {
    renderPanes(renderer, scene, panes, v => {
      const c = v.cam, p = S.p[v.pi], pk = pucks[v.pi].g.position, k = 1 - Math.exp(-(1 / 60) * 5);
      if (sc.on) { sc.cam(v, c, v.fov); sky.position.copy(c.position); return c; }
      if (p.alive) { // behind the puck on the line from the ring centre, looking back across the ring
        const d = Math.hypot(pk.x, pk.z);
        if (d > .8) v.out.lerp(t2.set(pk.x / d, pk.z / d), .08).normalize();
        v.cp.lerp(tmp.set(pk.x + v.out.x * 7, 6.5, pk.z + v.out.y * 7), k * 3);
        v.look.lerp(tmp.set(pk.x * .45, 0, pk.z * .45), k * 3);
      } else { // out: overview
        v.cp.lerp(tmp.set(0, 17, 15), k);
        v.look.lerp(tmp.set(0, 0, 0), k);
      }
      c.position.copy(v.cp); c.lookAt(v.look);
      if (v.flip) c.rotateZ(Math.PI);
      c.fov = v.fov; c.updateProjectionMatrix();
      sky.position.copy(c.position);
      return c;
    });
  }

  function botify(i, local) {
    ai.add(i);
    if (local) ctrl.add(i);
    if (local && i === 0 && !auth) { auth = true; simT = snaps.at(-1)?.k ?? 0; } // host gone: carry on from the last snapshot
    pucks[i].tag.userData.set(label(i));
    chips();
  }

  function dispose() {
    unbind();
    panes.forEach(v => v.el.remove());
    document.body.classList.remove('split-v');
    disposeScene(scene);
  }

  roundStart();
  resize();
  bots.forEach(i => botify(i, me === 0));
  return { update, render, resize, onNet, dispose, botify };
}
