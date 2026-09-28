import * as THREE from 'three';
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { COL, canvasTex, disposeScene, flash, buzz, Burst } from './fx.js';
import { coarse, keyHint, zones, makePane, rankChips, layout, fitFov, renderPanes, bindInput, countdown, makeShowcase, addSky, addCity, lights, makeRunner, nameTag } from './stage.js';

// Cliff Chicken: nerve game, best of 3 (points summed). Carts roll and accelerate toward a cliff; press any
// button to slam the brakes ONCE. Stop position is a pure function of brake time `tb` (game-clock seconds
// since the roll started) plus this round's seeded params (start speed, accel, ice patch, tailwind window) —
// identical on every device. So each device just evaluates `resolve(tb, elapsed)` fresh every frame: no
// incremental state to desync, and a late-arriving `tb` for a rival "snaps" their cart to the correct spot
// the instant it's known (see the header comment on `resolve`).
const ROUNDS = 3, PTS = [3, 2, 1, 0], GAP = 6, STEP = 1 / 120, MAXEDGE = 80;
const BRAKE = 9, ICE_MULT = .22, WIND_ACC = 5;

export function createChicken({ renderer, mode, n = 2, me = 0, bots = [], rand, send, label, onEnd }) {
  const online = mode === 'online';
  const IDX = [...Array(n).keys()], TX = IDX.map(i => (i - (n - 1) / 2) * GAP), TW = n * GAP + 3;

  // seeded per round, identical on every device: start speed + accel, and the ice / tailwind twist
  const rounds = Array.from({ length: ROUNDS }, () => {
    const edge = 58 + rand() * 22, iceLen = 5 + rand() * 5;
    return {
      edge, v0: 6 + rand() * 3, acc: 1.4 + rand() * 1.4,
      iceLen, iceStart: 10 + rand() * (edge - iceLen - 22),
      windAt: 1 + rand() * 3.2, windDur: 1 + rand() * 1.6,
    };
  });

  // pure function of (tb, t): fixed inner step so every device gets the same answer for the same tb.
  // Breaks out (and freezes) the moment the cart is done, so callers can measure "time since done" from `t`.
  function resolve(tb, tMax, R) {
    const brakeAt = tb == null || tb < 0 ? Infinity : tb;
    let d = 0, v = R.v0, T = 0;
    while (T < tMax) {
      const braking = T >= brakeAt, wind = T >= R.windAt && T < R.windAt + R.windDur ? WIND_ACC : 0;
      const onIce = d >= R.iceStart && d <= R.iceStart + R.iceLen;
      const a = braking ? -(onIce ? BRAKE * ICE_MULT : BRAKE) + wind : R.acc + wind;
      v = Math.max(0, v + a * STEP);
      d += v * STEP;
      T += STEP;
      if (d >= R.edge) return { d, v, t: T, fallen: true, stopped: false, done: true };
      if (braking && v <= 0) return { d, v, t: T, fallen: false, stopped: true, done: true };
    }
    return { d, v, t: T, fallen: false, stopped: false, done: false };
  }

  // AI: binary-search the brake time that lands a target margin short of the edge, then add skill noise
  // and an occasional bad misjudgement. Decided once per round, from Math.random (not the shared seed).
  function findTb(targetD, R) {
    let lo = 0, hi = 15;
    for (let k = 0; k < 24; k++) {
      const mid = (lo + hi) / 2, st = resolve(mid, 40, R);
      (st.fallen || st.d > targetD) ? hi = mid : lo = mid;
    }
    return lo;
  }
  function aiPlan(R) {
    let tb = findTb(Math.max(1, R.edge - (.3 + Math.random() * 2.7)), R);
    tb += (Math.random() - .5) * (.08 + Math.random() * .3);
    if (Math.random() < .12) tb += Math.random() < .5 ? .5 + Math.random() * 1.1 : -(1.6 + Math.random() * 2.2);
    return Math.max(0, tb);
  }

  // ---- scene: canyon runway ending at a glowing cliff, city skyline either side, void beyond the edge
  const scene = new THREE.Scene(), fogC = new THREE.Color(0x0a0f28);
  scene.background = fogC;
  scene.fog = new THREE.Fog(fogC, 26, 105);
  lights(scene);
  const sky = addSky(scene, fogC, 0x3a1a5c);
  addCity(scene, { y: -18, n: 200, x0: -110, x1: 110, z0: 40, z1: -140, clear: (x) => Math.abs(x) < TW / 2 + 6 });
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const roadTex = canvasTex(64, 64, (g, w) => {
    g.fillStyle = '#12162c'; g.fillRect(0, 0, w, w);
    g.strokeStyle = '#232a56'; g.lineWidth = 2; g.strokeRect(0, 0, w, w);
  });
  roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping; roadTex.repeat.x = TW * 1.5; roadTex.anisotropy = aniso;
  // runway pieces are unit-length (z 0 -> -1) from z=6, stretched each round so they end exactly at the cliff
  const stretch = [];
  const runway = (geo, mat, x, y) => { const m = new THREE.Mesh(geo.translate(0, 0, -.5), mat); m.position.set(x, y, 6); scene.add(m); stretch.push(m); };
  runway(new THREE.PlaneGeometry(TW, 1).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: roadTex, roughness: .8 }), 0, 0);
  const railMat = new THREE.MeshBasicMaterial({ color: 0x2a5cff, toneMapped: false });
  for (const s of [-1, 1]) runway(new THREE.BoxGeometry(.12, .3, 1), railMat, s * (TW / 2), .18);
  const laneMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .18 });
  for (let k = 1; k < n; k++) runway(new THREE.PlaneGeometry(.05, 1).rotateX(-Math.PI / 2), laneMat, TX[k] - GAP / 2, .012);
  // rock mesa under the runway: its far face IS the cliff, so a cart past the edge visibly drops into the void
  const mesa = new THREE.Mesh(new THREE.BoxGeometry(TW + 8, 40, 1).translate(0, -20.02, -.5), new THREE.MeshStandardMaterial({ color: 0x1c1733, roughness: .95, metalness: .1, emissive: 0x2a0a22, emissiveIntensity: .6 }));
  mesa.position.z = 20; scene.add(mesa);
  // pulsing hazard glow down the cliff face
  const faceMesh = new THREE.Mesh(new THREE.PlaneGeometry(TW + 8, 3), new THREE.MeshBasicMaterial({ color: 0xff3a5a, transparent: true, opacity: .35, toneMapped: false, depthWrite: false }));
  faceMesh.position.y = -1.6; scene.add(faceMesh);

  // distance ticks every 10 m; only the ones inside this round's cliff distance are shown
  const tickGeo = new THREE.PlaneGeometry(TW, .1).rotateX(-Math.PI / 2), tickMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .3 });
  const ticks = [];
  for (let d = 10; d < MAXEDGE; d += 10) { const m = new THREE.Mesh(tickGeo, tickMat); m.position.set(0, .015, -d); scene.add(m); ticks.push({ m, d }); }

  // shiny ice strip + warning chevrons + glowing edge line, repositioned each round
  const iceMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x2f6fae, emissive: 0x3ad0ff, emissiveIntensity: .55, roughness: .05, metalness: .85, transparent: true, opacity: .85 }));
  scene.add(iceMesh);
  const chevTex = canvasTex(128, 32, (g, w, h) => {
    g.fillStyle = '#161616'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffcc33';
    for (let x = -h; x < w; x += h) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + h / 2, 0); g.lineTo(x + h, h); g.closePath(); g.fill(); }
  });
  chevTex.wrapS = THREE.RepeatWrapping; chevTex.repeat.set(TW / 2, 1);
  const chevMesh = new THREE.Mesh(new THREE.PlaneGeometry(TW, 1.1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: chevTex, toneMapped: false }));
  chevMesh.position.y = .03;
  scene.add(chevMesh);
  const edgeCol = new THREE.Color(0xff3a5a), white = new THREE.Color(0xffffff);
  const edgeMesh = new THREE.Mesh(new THREE.BoxGeometry(TW, .16, .14), new THREE.MeshBasicMaterial({ color: edgeCol.clone(), toneMapped: false }));
  edgeMesh.position.y = .1;
  scene.add(edgeMesh);

  // tailwind flags either side; flutter amplitude tracks the current gust
  function makeFlag(x) {
    const g = new THREE.Group(), poleMat = new THREE.MeshStandardMaterial({ color: 0x2a3050, metalness: .6, roughness: .4 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 3, 8), poleMat); pole.position.y = 1.5;
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(1, .6), new THREE.MeshBasicMaterial({ color: 0xffd23f, side: THREE.DoubleSide, toneMapped: false }));
    flag.position.set(.52, 2.6, 0);
    g.add(pole, flag); g.position.set(x, 0, -8);
    scene.add(g);
    return flag;
  }
  const flagL = makeFlag(-TW / 2 - 1.4), flagR = makeFlag(TW / 2 + 1.4);

  function repositionFx(R) {
    iceMesh.scale.set(TW, R.iceLen, 1);
    iceMesh.position.z = -(R.iceStart + R.iceLen / 2);
    chevMesh.position.z = -(R.edge - .8);
    edgeMesh.position.z = -R.edge;
    faceMesh.position.z = -R.edge - .02;
    stretch.forEach(m => { m.scale.z = R.edge + 6; });
    roadTex.repeat.y = (R.edge + 6) / 4;
    mesa.scale.z = R.edge + 20;
    ticks.forEach(tk => { tk.m.visible = tk.d < R.edge - 1; });
  }

  // speed display mounted on the cart's tail, facing the chase cam; redrawn only when the number changes
  function speedTag(color) {
    const tex = canvasTex(256, 112, () => {}), g = tex.image.getContext('2d'), css = '#' + color.toString(16).padStart(6, '0');
    let shown = '';
    const draw = (kmh, brk) => {
      const key = kmh + (brk ? 'b' : '');
      if (key === shown) return;
      shown = key;
      g.clearRect(0, 0, 256, 112);
      g.fillStyle = 'rgba(8, 12, 34, .78)'; g.strokeStyle = brk ? '#ff5a6e' : css; g.lineWidth = 4;
      g.beginPath(); g.roundRect(20, 6, 216, 100, 26); g.fill(); g.stroke();
      g.fillStyle = 'rgba(255, 255, 255, .14)'; g.fillRect(40, 90, 176, 6);
      g.fillStyle = kmh > 70 ? '#ff5a6e' : kmh > 45 ? '#ffd23f' : '#3dff9a'; g.fillRect(40, 90, 176 * Math.min(1, kmh / 90), 6);
      g.textBaseline = 'alphabetic'; g.textAlign = 'right';
      g.font = 'italic 900 64px ui-monospace, Menlo, Consolas, monospace';
      g.fillStyle = brk ? '#ff5a6e' : '#fff'; g.fillText(kmh, 158, 78);
      g.textAlign = 'left'; g.font = '800 24px system-ui, sans-serif';
      g.fillStyle = '#98a3c7'; g.fillText('km/h', 164, 78);
      tex.needsUpdate = true;
    };
    draw(0, false);
    const sp = new THREE.Mesh(new THREE.PlaneGeometry(1.2, .525), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
    sp.position.set(0, .8, 1.04);
    sp.rotation.x = -.35; // tilted up toward the chase cam
    sp.userData.set = draw;
    return sp;
  }

  // cart: chassis + wheels + headlights + a crouched rider borrowed from the shared runner rig
  function makeCart(i) {
    const g = new THREE.Group(), glow = new THREE.MeshBasicMaterial({ color: COL[i], toneMapped: false });
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x14182a, roughness: .35, metalness: .6 });
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.3, .4, 2.1), bodyMat); chassis.position.y = .34;
    const nose = new THREE.Mesh(new THREE.ConeGeometry(.5, .8, 4).rotateX(-Math.PI / 2).rotateY(Math.PI / 4), bodyMat); nose.position.set(0, .36, -1.3);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.86, .05, 8, 28).rotateX(Math.PI / 2), glow); rim.position.y = .16;
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfff6d0, toneMapped: false });
    const hl1 = new THREE.Mesh(new THREE.SphereGeometry(.11, 10, 8), lightMat); hl1.position.set(-.4, .38, -1.68);
    const hl2 = new THREE.Mesh(new THREE.SphereGeometry(.11, 10, 8), lightMat); hl2.position.set(.4, .38, -1.68);
    const tailMat = new THREE.MeshBasicMaterial({ color: 0x4a0c14, toneMapped: false });
    const tl1 = new THREE.Mesh(new THREE.BoxGeometry(.34, .12, .06), tailMat); tl1.position.set(-.42, .42, 1.06);
    const tl2 = tl1.clone(); tl2.position.x = .42;
    const wheelGeo = new THREE.CylinderGeometry(.32, .32, .18, 14).rotateZ(Math.PI / 2), wheelMat = new THREE.MeshStandardMaterial({ color: 0x0c0e18, roughness: .7 });
    const wheels = [[-.68, .3, .7], [.68, .3, .7], [-.68, .3, -.65], [.68, .3, -.65]].map(([x, y, z]) => { const w = new THREE.Mesh(wheelGeo, wheelMat); w.position.set(x, y, z); g.add(w); return w; });
    const rider = makeRunner(COL[i]); rider.scale.setScalar(.58); rider.position.y = .5;
    rider.userData.shadow.visible = false;
    const u = rider.userData;
    u.armL.rotation.set(-1, 0, -.25); u.armR.rotation.set(-1, 0, .25);
    u.legL.rotation.x = u.legR.rotation.x = -1.3; u.kneeL.rotation.x = u.kneeR.rotation.x = -1.5; u.body.rotation.x = -.3;
    const tag = nameTag(label(i), COL[i]); tag.position.y = 2;
    const spd = speedTag(COL[i]);
    g.add(chassis, nose, rim, hl1, hl2, tl1, tl2, rider, tag, spd);
    g.position.set(TX[i], 0, 0);
    scene.add(g);
    return { g, wheels, tag, tailMat, spd };
  }

  const players = IDX.map(i => {
    const cart = makeCart(i);
    return { i, g: cart.g, wheels: cart.wheels, tag: cart.tag, tailMat: cart.tailMat, spd: cart.spd, cam: new THREE.PerspectiveCamera(58, 1, .1, 200), fov: 58, local: !online || i === me, bot: false };
  });
  const burst = new Burst(scene);

  const panes = (online ? [me] : IDX).map(pi => {
    const v = makePane(pi, label, zones('■', '■', '■'));
    v.chips = rankChips(v, n, label);
    return v;
  });
  const paneOf = i => panes.find(v => v.pi === i);
  const shown = i => !!paneOf(i);

  // ---- round state
  let round = 0, ph = 'count', clock = 0, showT = 0, time = 0, gustAmp = 0, windFired = false, step = null;
  const tb = Array(n).fill(null), live = Array(n).fill(null);
  const enteredIce = Array(n).fill(false), brakeFired = Array(n).fill(false), doneFired = Array(n).fill(false);
  const gain = Array(n).fill(0), totalScore = Array(n).fill(0), bestD = Array(n).fill(Infinity);
  const inbox = Array.from({ length: ROUNDS }, () => ({})); // 'ck' messages that arrived ahead of their round
  const chips = withGain => panes.forEach(v => v.chips(totalScore.map((s, i) => (withGain ? `${s} (${gain[i] >= 0 ? '+' : ''}${gain[i]})` : s))));

  function startRound() {
    ph = 'count'; clock = 0; showT = 0; windFired = false; gustAmp = 0;
    tb.fill(null); live.fill(null);
    enteredIce.fill(false); brakeFired.fill(false); doneFired.fill(false); gain.fill(0);
    Object.entries(inbox[round]).forEach(([iStr, v]) => { const i = +iStr; if (!players[i].local) tb[i] = v; });
    const R = rounds[round];
    repositionFx(R);
    players.forEach(p => { live[p.i] = resolve(null, 0, R); placeCart(p, live[p.i], R, 0); }); // back on the start line for the countdown
    panes.forEach(v => {
      v.val.textContent = t('round', { r: round + 1, n: ROUNDS });
      v.hint.textContent = coarse ? t('chickenTouch') : t('chickenKeys', keyHint(v.pi, online));
      v.hint.classList.remove('hide');
    });
    chips(false);
    step = countdown(panes);
  }

  function setTb(i, val) {
    if (tb[i] != null) return;
    tb[i] = val;
    if (online && players[i].local) send({ t: 'ck', from: i, r: round, tb: val });
  }

  function resolveRound() {
    ph = 'show'; showT = 2.6;
    const R = rounds[round];
    const dist = IDX.map(i => (live[i].fallen ? null : R.edge - live[i].d));
    const ranked = IDX.filter(i => dist[i] != null).sort((a, b) => dist[a] - dist[b]);
    // solo: no one to beat, so a stop scores 100 minus 10 per metre short of the edge (max 300 over 3 rounds)
    IDX.forEach(i => { if (dist[i] != null) gain[i] = n === 1 ? Math.max(0, Math.round(100 - dist[i] * 10)) : PTS[ranked.findIndex(j => dist[j] === dist[i])] ?? 0; });
    IDX.forEach(i => { totalScore[i] += gain[i]; if (dist[i] != null) bestD[i] = Math.min(bestD[i], dist[i]); });
    chips(true);
    if (ranked.length) { const w = ranked[0]; burst.emit(TX[w], 1, -R.edge, COL[w], 30, 6); if (shown(w)) sfx.perfect(); }
  }

  const sc = makeShowcase(panes, label, onEnd);
  let champ = 0;
  function finish() {
    ph = 'done';
    const order = [...IDX].sort((a, b) => totalScore[b] - totalScore[a] || bestD[a] - bestD[b]);
    const draw = totalScore[order[0]] === totalScore[order[1]] && bestD[order[0]] === bestD[order[1]];
    champ = order[0];
    sc.start({ order, draw, scores: totalScore.map(s => t('pts', { n: s })) }, champAt);
    const c = champAt();
    burst.emit(c.x, 1.5, c.z, COL[champ], 40, 7);
  }
  // the champion's cart, or its lane at the edge if it went over on the last round
  const champV = new THREE.Vector3();
  const champAt = () => (live[champ]?.fallen ? champV.set(TX[champ], 0, -rounds[ROUNDS - 1].edge + 1.5) : champV.copy(players[champ].g.position));

  function placeCart(p, st, R, dt) {
    const i = p.i, x = TX[i];
    let y = 0, z, tiltX = 0, tiltZ = 0;
    if (st.fallen) {
      p.tailMat.color.setHex(0x4a0c14);
      const ft = Math.max(0, clock - st.t);
      y = -4.9 * ft * ft;
      z = -R.edge - st.v * ft * .4;
      tiltX = Math.min(1.3, ft * 2.2);
      tiltZ = Math.sin(i * 2 + ft * 3) * .3;
    } else {
      z = -st.d;
      const braking = tb[i] != null && tb[i] >= 0 && clock >= tb[i];
      tiltX = braking ? -.12 : .04;
      p.tailMat.color.setHex(braking ? 0xff2a3a : 0x4a0c14);
      if (st.v > .4 && braking && Math.random() < dt * 16) {
        const onIce = st.d >= R.iceStart && st.d <= R.iceStart + R.iceLen;
        burst.emit(x + (Math.random() - .5) * .8, .12, z + .9, onIce ? 0x9fe0ff : 0xffcf6a, onIce ? 2 : 4, onIce ? 2 : 4);
      }
    }
    p.g.position.set(x, y, z);
    p.g.rotation.set(tiltX, 0, tiltZ);
    p.wheels.forEach(w => { w.rotation.x += st.v * dt * 2.2; });
  }

  function update(dt) {
    time += dt;
    flagL.rotation.z = Math.sin(time * 3) * .08 + Math.sin(time * 11) * .05 * gustAmp;
    flagR.rotation.z = -flagL.rotation.z;
    const pulse = .5 + .5 * Math.sin(time * 7);
    edgeMesh.material.color.copy(edgeCol).lerp(white, pulse * .45);
    faceMesh.material.opacity = .22 + pulse * .25;
    if (ph === 'count') {
      if (!step(dt)) {
        ph = 'roll'; clock = 0;
        const R = rounds[round];
        players.forEach(p => { if (p.local && p.bot && tb[p.i] == null) setTb(p.i, aiPlan(R)); });
      }
    } else if (ph === 'roll') {
      clock += dt;
      const R = rounds[round], windOn = clock >= R.windAt && clock < R.windAt + R.windDur;
      gustAmp = windOn ? 1 : Math.max(0, gustAmp - dt * 2);
      if (windOn && !windFired) { windFired = true; sfx.gust(); panes.forEach(v => flash(v.msg, t('chickenWind'), 'boost')); }
      if (windOn && Math.random() < dt * 14) burst.emit((Math.random() - .5) * TW, .3 + Math.random() * 1.2, -Math.random() * R.edge * .6, 0xbfe8ff, 2, 5);

      for (const p of players) {
        const i = p.i;
        if (p.local && tb[i] == null && resolve(null, clock, R).fallen) setTb(i, -1); // never braked, now over the edge
        const known = tb[i] != null; // a rival with no 'ck' yet is a provisional free-roll guess, not a resolved result
        const st = resolve(known ? tb[i] : null, clock, R);
        live[i] = st;
        const resolved = known && st.done;
        if (!enteredIce[i] && !st.fallen && st.d >= R.iceStart && st.d <= R.iceStart + R.iceLen) {
          enteredIce[i] = true;
          if (shown(i)) { flash(paneOf(i).msg, t('chickenIce'), 'great'); sfx.ice(); }
        }
        if (!brakeFired[i] && known && tb[i] >= 0 && clock >= tb[i]) {
          brakeFired[i] = true;
          if (shown(i)) { flash(paneOf(i).msg, t('chickenBrake'), ''); sfx.brake(); }
        }
        if (!doneFired[i] && resolved) {
          doneFired[i] = true;
          const pane = paneOf(i);
          if (st.fallen) {
            burst.emit(TX[i], .6, -Math.min(st.d, R.edge), COL[i], 30, 7);
            if (pane) { flash(pane.msg, t('chickenFell'), 'hit'); sfx.fall(); buzz(60); }
          } else if (pane) {
            const m = R.edge - st.d;
            flash(pane.msg, t('meters', { n: m.toFixed(2) }), m < 1 ? 'perfect' : m < 3 ? 'great' : '');
            sfx.good();
          }
          if (pane && online && players.some(o => o.i !== i && !(tb[o.i] != null && live[o.i]?.done))) { pane.hint.textContent = t('waitRival'); pane.hint.classList.remove('hide'); }
        }
        placeCart(p, st, R, dt);
      }
      if (players.every(p => tb[p.i] != null && live[p.i]?.done)) resolveRound();
    } else {
      clock += dt; // keep carts that went over falling (they used to freeze at the edge until the next round)
      const R = rounds[round];
      players.forEach(p => { if (live[p.i]) placeCart(p, live[p.i], R, dt); });
      if (ph === 'show' && (showT -= dt) <= 0) {
        if (round + 1 < ROUNDS) { round++; startRound(); } else finish();
      } else if (ph === 'done' && Math.random() < dt * 3) {
        const c = champAt();
        burst.emit(c.x + (Math.random() - .5) * 3, 2 + Math.random() * 2, c.z + (Math.random() - .5) * 3, COL[champ], 14, 4);
      }
    }
    burst.update(dt);
    sc.update(dt);
    for (const p of players) {
      const st = live[p.i], rolling = ph === 'roll';
      p.spd.visible = ph !== 'done' && !st?.fallen;
      p.spd.userData.set(rolling ? Math.round((st?.v ?? 0) * 3.6) : 0, rolling && tb[p.i] != null && tb[p.i] >= 0 && clock >= tb[p.i]);
    }
  }

  function resize() {
    layout(panes);
    for (const v of panes) { const p = players[v.pi]; p.cam.aspect = v.w / v.h; p.fov = fitFov(p.cam.aspect, 26, 50, 100); }
  }

  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), lookV = new THREE.Vector3();
  function render() {
    renderPanes(renderer, scene, panes, v => {
      const p = players[v.pi], c = p.cam, st = live[v.pi], R = rounds[Math.min(round, ROUNDS - 1)];
      if (sc.on) { sc.cam(v, c, p.fov); sky.position.copy(c.position); return c; }
      const d = Math.min(st?.d ?? 0, R.edge), x = TX[v.pi];
      const near = THREE.MathUtils.clamp((d - (R.edge - 16)) / 16, 0, 1); // chase cam pulls to a side view near the edge
      tmpA.set(x, 3.2, -d + 6.5);
      tmpB.set(x + 7.5, 4.2, -d - 1);
      c.position.lerpVectors(tmpA, tmpB, near);
      const spd = st && !st.fallen ? st.v : 0;
      if (ph === 'roll' && tb[v.pi] != null && tb[v.pi] >= 0 && clock >= tb[v.pi] && spd > .5) { // brake rumble
        const k = Math.min(1, spd / 15) * .06;
        c.position.x += (Math.random() - .5) * k; c.position.y += (Math.random() - .5) * k;
      }
      lookV.set(x, 1.1, -d - 6 + near * 7);
      c.lookAt(lookV);
      if (v.flip) c.rotateZ(Math.PI);
      c.fov = p.fov + Math.min(9, spd * .4); c.updateProjectionMatrix(); // speed kick
      sky.position.copy(c.position);
      return c;
    });
  }

  const act = (pi, a) => {
    const p = players[pi];
    if (!p?.local || p.bot || ph !== 'roll' || tb[pi] != null) return;
    setTb(pi, clock);
  };
  const unbind = bindInput({ cv: renderer.domElement, panes, n, online, me, act });

  function onNet(m) {
    if (!m || m.t !== 'ck') return;
    const i = m.from;
    if (!Number.isInteger(i) || i < 0 || i >= n || players[i].local) return;
    if (!Number.isInteger(m.r) || m.r < 0 || m.r >= ROUNDS) return;
    if (typeof m.tb !== 'number' || !Number.isFinite(m.tb) || (m.tb < 0 && m.tb !== -1)) return;
    inbox[m.r][i] = m.tb; // may be ahead of (or behind) the round we're currently on
    if (m.r === round && (ph === 'roll' || ph === 'count') && tb[i] == null) tb[i] = m.tb; // a rival can start rolling a frame before us
  }

  function botify(i, local) {
    const p = players[i];
    if (!p) return;
    p.bot = true;
    if (local) p.local = true;
    p.tag.userData.set(label(i));
    if (local && ph === 'roll' && tb[i] == null) setTb(i, aiPlan(rounds[round]));
    chips(ph === 'show');
  }

  function dispose() {
    unbind();
    panes.forEach(v => v.el.remove());
    document.body.classList.remove('split-v');
    disposeScene(scene);
  }

  startRound();
  resize();
  bots.forEach(i => botify(i, me === 0));
  return { update, render, resize, onNet, dispose, botify };
}
