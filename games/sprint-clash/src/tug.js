import * as THREE from 'three';
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { COL, canvasTex, disposeScene, flash, buzz, Burst } from './fx.js';
import { coarse, keyHint, zones, makePane, rankChips, layout, fitFov, renderPanes, bindInput, countdown, makeShowcase, addSky, addCity, lights, makeRunner, placeRunner, nameTag } from './stage.js';

// Tug of War. Alternate Left/Right to pull; Action inside a gold brace window doubles your pull for 1 s.
// Tangles: the rope snags everyone's hands at once; pulls do nothing until you hit Left+Right together 3× in a row.
// 2p = 1v1, 4p = 2v2 (P1+P3 vs P2+P4), 3p = three ropes tied to one ring. First side to drag the marker
// WIN metres its way takes the round; best of 3. Brace windows come from the seed, so every device judges its
// own players' braces and only sends pull amounts. The host (seat 0) owns marker, rounds and the result.
const WIN = 6, CAP = 20, K = .22, DAMP = 1.6, WINDOW = .5, BOOST = 1, SLIP = .25, BADBRACE = .4, POINT = 2.2, MAXR = 12, R = 16, TIP = .4, TANGLE = 4, CHORD = .15, CHORDS = 3;

export function createTug({ renderer, mode, n = 2, me = 0, bots = [], rand, send, label, onEnd }) {
  const online = mode === 'online';
  const IDX = [...Array(n).keys()], S = n === 3 ? 3 : 2;
  const side = i => (S === 3 ? i : i % 2);
  const DIR = S === 2 ? [[-1, 0], [1, 0]] : [0, 1, 2].map(s => { const a = Math.PI / 2 + s * Math.PI * 2 / 3; return [Math.cos(a), Math.sin(a)]; });
  const members = [...Array(S).keys()].map(s => IDX.filter(i => side(i) === s));
  // per round: brace windows + up to 2 tangles, from the seed so every device has the same timeline
  const braces = [], tangles = [];
  for (let k = 0; k < MAXR; k++) {
    const b = [], tg = [];
    for (let t0 = 2.5 + rand() * 2; t0 < CAP - 1;) {
      if (t0 > 5 && tg.length < 2 && rand() < .4) { tg.push(t0); t0 += 3 + rand() * 2; }
      else { b.push(t0); t0 += WINDOW + 2 + rand() * 2; }
    }
    braces.push(b); tangles.push(tg);
  }

  const scene = new THREE.Scene(), fogC = new THREE.Color(0x0c1233);
  scene.background = fogC;
  scene.fog = new THREE.Fog(fogC, 24, 110);
  lights(scene);
  const sky = addSky(scene, fogC, 0x5a1a4c);
  addCity(scene, { y: -26, n: 260, x0: -120, x1: 120, z0: 120, z1: -120, clear: (x, z) => Math.hypot(x, z) < R + 12 });

  // floating arena: disc with rings, neon rim, a win line per side and a centre line
  const floorTex = canvasTex(256, 256, (g, w) => {
    const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    gr.addColorStop(0, '#1c2458'); gr.addColorStop(.75, '#0e1334'); gr.addColorStop(1, '#0a0e28');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
    g.strokeStyle = 'rgba(140,160,255,.13)'; g.lineWidth = 1.5;
    for (let r = 16; r < w / 2; r += 16) { g.beginPath(); g.arc(w / 2, w / 2, r, 0, 7); g.stroke(); }
  });
  floorTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  scene.add(new THREE.Mesh(new THREE.CircleGeometry(R, 72).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: floorTex, roughness: .6, metalness: .3 })));
  const under = new THREE.Mesh(new THREE.CylinderGeometry(R, R * .55, 3, 72, 1, true), new THREE.MeshStandardMaterial({ color: 0x0c1030, roughness: .5, metalness: .6, side: THREE.DoubleSide }));
  under.position.y = -1.5;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R, .08, 8, 128).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x7a4cff, toneMapped: false }));
  scene.add(under, rim);
  for (let s = 0; s < S; s++) {
    const [dx, dz] = DIR[s], line = new THREE.Mesh(new THREE.BoxGeometry(.18, .03, 7), new THREE.MeshBasicMaterial({ color: COL[members[s][0]], toneMapped: false }));
    line.position.set(dx * WIN, .02, dz * WIN); line.rotation.y = Math.atan2(dx, dz) + Math.PI / 2;
    const zone = new THREE.Mesh(new THREE.PlaneGeometry(7, R - WIN).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: COL[members[s][0]], transparent: true, opacity: .07, depthWrite: false }));
    zone.position.set(dx * (WIN + R) / 2, .01, dz * (WIN + R) / 2); zone.rotation.y = Math.atan2(dx, dz);
    scene.add(line, zone);
  }
  if (S === 2) { const c = new THREE.Mesh(new THREE.BoxGeometry(.08, .03, 7), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5 })); c.position.y = .02; scene.add(c); }

  // rope = chain of segments per side: knot → each athlete's front hand → back hand → … → slack tail → coil on the ground.
  // Points come from the posed hands every frame, so the grip is exact whatever the pose.
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0xd8c8a0, emissive: 0xffd23f, emissiveIntensity: 0, roughness: .85,
    map: canvasTex(16, 64, (g, w, h) => { // twisted-fibre stripes
      g.fillStyle = '#e6dcc0'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#9c8a64'; for (let y = -w; y < h; y += 8) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + w); g.lineTo(w, y + w + 3); g.lineTo(0, y + 3); g.fill(); }
    }) });
  ropeMat.map.wrapT = THREE.RepeatWrapping; ropeMat.map.repeat.set(1, 6);
  const ropeGeo = new THREE.CylinderGeometry(.05, .05, 1, 10, 1, true);
  const TAIL = [[.9, .45], [1.8, .05], [2.6, .05]]; // [metres behind the last hand, height]
  const ropes = DIR.map((_, s) => Array.from({ length: members[s].length * 2 + TAIL.length }, () => { const m = new THREE.Mesh(ropeGeo, ropeMat); scene.add(m); return m; }));
  const coils = DIR.map(() => { const c = new THREE.Mesh(new THREE.TorusGeometry(.28, .05, 8, 24).rotateX(Math.PI / 2), ropeMat); scene.add(c); return c; });
  const knotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const knot = new THREE.Group(), flag = new THREE.Mesh(new THREE.PlaneGeometry(.2, .5).translate(0, -.3, 0).rotateY(Math.PI / 4), new THREE.MeshBasicMaterial({ color: 0xff3355, side: THREE.DoubleSide, toneMapped: false })); // ribbon hanging off the centre mark
  knot.add(new THREE.Mesh(new THREE.SphereGeometry(.12, 16, 10), knotMat), flag);
  const spotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .6, toneMapped: false, depthWrite: false });
  const spot = new THREE.Mesh(new THREE.RingGeometry(.35, .5, 40).rotateX(-Math.PI / 2), spotMat);
  scene.add(knot, spot);
  const UP = new THREE.Vector3(0, 1, 0), vb = new THREE.Vector3(), hand = new THREE.Vector3(0, -.3, 0), tail = TAIL.map(() => new THREE.Vector3());
  const seg = (mesh, a, b) => {
    vb.subVectors(b, a); const len = vb.length();
    mesh.position.addVectors(a, b).multiplyScalar(.5);
    mesh.quaternion.setFromUnitVectors(UP, vb.divideScalar(len || 1));
    mesh.scale.set(1, len, 1);
  };
  const burst = new Burst(scene);

  const players = IDX.map(i => {
    const r = makeRunner(COL[i]), tag = nameTag(label(i), COL[i]), slot = members[side(i)].indexOf(i);
    scene.add(r, tag);
    return { lat: slot % 2 ? -1 : 1, // teammates stand on alternate sides of the rope
      i, r, tag, cam: new THREE.PerspectiveCamera(60, 1, .1, 200), fov: 60, local: !online || i === me, bot: false,
      s: side(i), slot, last: null, slipT: 0, boostT: 0, bw: -1, yank: 0, pend: 0,
      bt: Math.random() * .2, rate: 7.5, plan: null, tangT: 0, tn: 0, sk: null, skT: 0,  grips: [new THREE.Vector3(), new THREE.Vector3()],
    };
  });

  const panes = (online ? [me] : IDX).map(pi => {
    const v = makePane(pi, label, zones('◀', '⚡', '▶'));
    v.chips = rankChips(v, n, label);
    v.hint.textContent = coarse ? t('tugTouch') : t('tugKeys', keyHint(pi, online));
    v.brace = document.createElement('div'); // brace timer: gold = window left to brace, green = your ×2 left
    v.brace.className = 'brace';
    v.brace.innerHTML = '<i></i><b>×2</b>';
    v.tangle = document.createElement('div'); // tangle: one pip per chord landed
    v.tangle.className = 'tangle';
    v.tangle.innerHTML = '<i></i><i></i><i></i>';
    v.pips = [...v.tangle.querySelectorAll('i')];
    v.el.append(v.brace, v.tangle);
    return v;
  });
  const paneOf = i => panes.find(v => v.pi === i);
  const say = (i, text, cls) => { const v = paneOf(i); if (v) flash(v.msg, text, cls); };

  let auth = !online || me === 0, st = 'count', r = 0, RT = 0, pointT = 0, time = 0, netT = 0, lastWin = -1, ended = false, braceOn = -1, tangled = -1;
  const m = new THREE.Vector2(), v2 = new THREE.Vector2(), show = new THREE.Vector2(), wins = Array(S).fill(0);
  let snap = null; // latest host snapshot, applied once our own countdown is over
  const step = countdown(panes);
  const chips = () => panes.forEach(v => v.chips(IDX.map(i => '●'.repeat(wins[side(i)]) + '○'.repeat(Math.max(0, 2 - wins[side(i)])))));
  const lead = s => m.x * DIR[s][0] + m.y * DIR[s][1]; // how far the marker is toward side s
  const braceAt = T => braces[Math.min(r, MAXR - 1)].find(b => T >= b && T < b + WINDOW);

  function pull(i, imp) {
    if (auth) v2.x += DIR[side(i)][0] * K * imp, v2.y += DIR[side(i)][1] * K * imp;
    else players[i].pend += imp;
  }

  function act(pi, a) {
    const p = players[pi];
    if (!p?.local || p.bot || st !== 'pull') return;
    press(p, a);
  }

  function press(p, a) {
    const heard = !!paneOf(p.i);
    if (p.tangT > 0) { if (a !== 'A') chord(p, a, heard); return; }
    if (p.slipT > 0 && a !== 'A') return; // a slip locks your pulls, not your brace
    if (a === 'A') {
      const b = braceAt(RT);
      if (b != null && p.bw !== b) { p.bw = b; p.boostT = BOOST; say(p.i, t('tugBraced'), 'perfect'); if (heard) sfx.perfect(); }
      else if (b == null) { p.slipT = BADBRACE; p.boostT = 0; say(p.i, t('tugSlip'), 'hit'); if (heard) { sfx.miss(); buzz(40); } }
      return;
    }
    if (a === p.last) { p.slipT = SLIP; p.last = null; if (heard) sfx.miss(); return; }
    p.last = a; p.yank = 1;
    pull(p.i, p.boostT > 0 ? 2 : 1);
    if (heard) sfx.pull();
  }

  // tangled: Left and Right within CHORD s of each other = one chord; a lone key or a double tap resets the run
  function chord(p, a, heard) {
    if (p.sk && p.sk !== a && RT - p.skT <= CHORD) {
      p.sk = null;
      if (++p.tn >= CHORDS) { p.tangT = 0; p.last = null; say(p.i, t('tugFree'), 'boost'); if (heard) sfx.boost(); }
      else if (heard) sfx.catch();
      return;
    }
    if (p.sk) { p.tn = 0; if (heard) sfx.miss(); }
    p.sk = a; p.skT = RT;
  }

  // AI: 6–9 presses/s with 5% same-side slips; on a brace window 70% brace in time, 15% too late, 15% ignore
  function bot(p, dt) {
    if (p.tangT > 0) { // a chord every .35–.75 s, 1 in 8 fumbled (one key only)
      if ((p.bt -= dt) > 0) return;
      p.bt = .35 + Math.random() * .4;
      press(p, 'L'); if (Math.random() > .125) press(p, 'R');
      return;
    }
    const b = braceAt(RT);
    if (b != null && p.plan?.b !== b) { const k = Math.random(); p.plan = { b, at: k < .7 ? b + .1 + Math.random() * .3 : k < .85 ? b + WINDOW + .05 : -1 }; }
    if (p.plan && p.plan.at >= 0 && RT >= p.plan.at) { p.plan.at = -1; press(p, 'A'); }
    if ((p.bt -= dt) > 0) return;
    p.bt = 1 / p.rate;
    press(p, Math.random() < .05 ? (p.last ?? 'L') : p.last === 'L' ? 'R' : 'L');
  }

  function startRound() {
    st = 'pull'; RT = 0; m.set(0, 0); v2.set(0, 0); braceOn = -1; tangled = -1;
    for (const p of players) Object.assign(p, { last: null, slipT: 0, boostT: 0, bw: -1, plan: null, rate: 6 + Math.random() * 3, tangT: 0, tn: 0, sk: null });
    panes.forEach(v => { v.hint.classList.remove('hide'); flash(v.msg, t('tugRound', { n: r + 1 }), 'go'); });
    sfx.go();
  }

  function endRound(s) {
    st = 'point'; pointT = POINT; lastWin = s;
    if (s >= 0) wins[s]++;
    announce();
    chips();
    if (auth) broadcast();
  }

  function announce() {
    const s = lastWin;
    if (s < 0) { panes.forEach(v => flash(v.msg, t('tugTie'), 'miss')); return; }
    burst.emit(m.x, 1.2, m.y, COL[members[s][0]], 40, 7);
    for (const v of panes) {
      const mine = side(v.pi) === s;
      flash(v.msg, mine ? t('tugPoint') : t('tugLost'), mine ? 'go' : 'hit');
    }
    panes.some(v => side(v.pi) === s) ? sfx.finish() : sfx.lose();
  }

  const sc = makeShowcase(panes, label, onEnd);
  const marker = new THREE.Vector3();
  function finish() {
    if (ended) return;
    ended = true; st = 'done';
    if (auth && online) broadcast();
    const rank = [...Array(S).keys()].sort((a, b) => wins[b] - wins[a] || lead(b) - lead(a));
    const places = IDX.map(i => rank.indexOf(side(i)));
    const order = [...IDX].sort((a, b) => places[a] - places[b] || a - b);
    const top = members[rank[0]];
    // orbit the tug marker: it's dragged to the winning side's end of the rope, framing both teams around it
    sc.start({ order, draw: false, places, scores: IDX.map(i => t('tugRounds', { n: wins[side(i)] })), title: top.length > 1 ? t('tugTeamWins', { a: label(top[0]), b: label(top[1]) }) : undefined }, () => marker.set(show.x, 0, show.y));
  }

  const broadcast = () => send({ t: 'um', from: me, x: +m.x.toFixed(3), y: +m.y.toFixed(3), r, st, w: wins, rt: +RT.toFixed(2), s: lastWin });

  function simulate(dt) {
    if (st === 'pull') {
      RT += dt;
      v2.multiplyScalar(Math.exp(-DAMP * dt));
      v2.addScaledVector(m, TIP * dt); // footing: the side that's ahead digs in, so even teams still tip one way
      m.addScaledVector(v2, dt);
      const s = [...Array(S).keys()].reduce((a, b) => (lead(b) > lead(a) ? b : a), 0);
      if (lead(s) >= WIN) endRound(s);
      else if (RT >= CAP) {
        const sorted = [...Array(S).keys()].map(lead).sort((a, b) => b - a);
        endRound(sorted[0] - sorted[1] < 1e-3 ? -1 : s);
      }
    } else if (st === 'point' && (pointT -= dt) <= 0) {
      if (wins.some(w => w >= 2) || r >= MAXR - 1) finish();
      else { r++; startRound(); broadcast(); }
    }
  }

  // guest: follow the host's snapshot
  function applySnap(sn) {
    const was = st;
    if (sn.r !== r || (sn.st === 'pull' && was !== 'pull')) { r = sn.r; if (sn.st === 'pull') startRound(); }
    wins.splice(0, S, ...sn.w); chips();
    m.set(sn.x, sn.y);
    if (Math.abs(sn.rt - RT) > .3) RT = sn.rt;
    if (sn.st === 'point' && was === 'pull') { st = 'point'; lastWin = sn.s; announce(); }
    else if (sn.st === 'done') { lastWin = sn.s; finish(); }
    else st = sn.st;
  }

  function update(dt) {
    time += dt;
    if (st === 'count') {
      if (!step(dt)) {
        if (auth) { startRound(); if (online) broadcast(); }
        else { st = 'wait'; if (snap) { applySnap(snap); snap = null; } }
      }
    } else if (auth) simulate(dt);
    else if (st === 'pull') RT += dt;

    if (st === 'pull') {
      if (RT > 3) panes.forEach(v => v.hint.classList.add('hide'));
      const b = braceAt(RT) ?? -1;
      if (b !== braceOn) { braceOn = b; if (b >= 0) { panes.forEach(v => flash(v.msg, t('tugBrace'), 'go')); sfx.signal(); } }
      const tg = tangles[Math.min(r, MAXR - 1)].find(x => x > tangled && RT >= x && RT < x + TANGLE); // guests may skip ahead on a resync
      if (tg != null) {
        tangled = tg;
        for (const p of players) Object.assign(p, { tangT: TANGLE - (RT - tg), tn: 0, sk: null, boostT: 0 });
        panes.forEach(v => flash(v.msg, t('tugTangle'), 'hit')); sfx.drop(); buzz(60);
      }
      for (const p of players) {
        p.slipT = Math.max(0, p.slipT - dt); p.boostT = Math.max(0, p.boostT - dt);
        if (p.tangT > 0) { p.tangT = Math.max(0, p.tangT - dt); if (p.sk && RT - p.skT > CHORD) { p.sk = null; p.tn = 0; } }
        if (p.local && p.bot) bot(p, dt);
      }
    } else braceOn = -1;

    if (online && (netT -= dt) <= 0) {
      netT = 1 / 15;
      if (auth && st !== 'count' && !ended) broadcast();
      else if (!auth) for (const p of players) if (p.local && p.pend) { send({ t: 'up', from: p.i, p: p.pend }); p.pend = 0; }
    }

    // visuals: marker eases toward the authoritative spot on guests; rope + athletes follow it
    show.lerp(m, auth ? 1 : Math.min(1, dt * 10));
    const gold = braceOn >= 0 ? .6 + .4 * Math.sin(time * 20) : 0;
    ropeMat.emissiveIntensity += (gold - ropeMat.emissiveIntensity) * Math.min(1, dt * 12);
    spot.position.set(show.x, .03, show.y);
    const best = [...Array(S).keys()].reduce((a, b) => (lead(b) > lead(a) ? b : a), 0), k = THREE.MathUtils.clamp(lead(best) / WIN, 0, 1);
    knotMat.color.setHex(0xffffff).lerp(new THREE.Color(COL[members[best][0]]), k);
    spotMat.color.copy(knotMat.color);
    const pulling = st === 'pull';
    for (const p of players) {
      // tug stance: sit back low, front heel dug in toward the knot, back knee bent; the arm on the key just pressed hauls
      const [dx, dz] = DIR[p.s], d = 1.6 + p.slot * 1.5, u = p.r.userData, o = .2 * p.lat;
      p.yank = Math.max(0, p.yank - dt * 6);
      const slip = p.slipT > 0, boost = p.boostT > 0 ? 1 : 0, yl = p.last === 'L' ? p.yank : 0, yr = p.last === 'R' ? p.yank : 0;
      placeRunner(p.r, show.x + dx * d - dz * o, pulling ? -.1 - boost * .04 : 0, show.y + dz * d + dx * o);
      p.r.rotation.y = Math.atan2(dx, dz);
      const tang = pulling && p.tangT > 0, w = Math.sin(time * 14 + p.i) * .35;
      u.body.rotation.x = tang ? .05 : slip ? -.3 + Math.sin(time * 30) * .1 : (pulling ? .55 : .2) + p.yank * .1 + boost * .12;
      u.body.rotation.y = 0; u.body.rotation.z = -.08 * p.lat;
      // both hands reach across to the rope line: the near arm barely turns, the far arm crosses the chest
      u.armL.rotation.set(.95 - yl * .3, 0, p.lat > 0 ? 1.1 : .13);
      u.armR.rotation.set(.95 - yr * .3, 0, p.lat > 0 ? -.13 : -1.1);
      u.elbowL.rotation.x = .15 + yl * .6; u.elbowR.rotation.x = .15 + yr * .6;
      if (tang) { u.armL.rotation.x = 2.3 + w; u.armR.rotation.x = 2.3 - w; u.elbowL.rotation.x = u.elbowR.rotation.x = .6; } // rope wrapped round the raised hands
      u.legL.rotation.x = pulling ? .7 : .1; u.legR.rotation.x = pulling ? -.3 : -.1;
      u.kneeL.rotation.x = pulling ? -.15 : -.1; u.kneeR.rotation.x = pulling ? -.55 : -.15;
      if (p.lat < 0) { [u.legL.rotation.x, u.legR.rotation.x] = [u.legR.rotation.x, u.legL.rotation.x]; [u.kneeL.rotation.x, u.kneeR.rotation.x] = [u.kneeR.rotation.x, u.kneeL.rotation.x]; }
      p.tag.position.set(p.r.position.x, 2.3, p.r.position.z);
      p.r.updateMatrixWorld(true);
      u.elbowL.localToWorld(p.grips[0].copy(hand)); u.elbowR.localToWorld(p.grips[1].copy(hand));
      const along = g => (g.x - show.x) * dx + (g.z - show.y) * dz;
      if (along(p.grips[0]) > along(p.grips[1])) p.grips.reverse(); // [front hand, back hand]
    }
    let ky = 0;
    for (let s = 0; s < S; s++) ky += players[members[s][0]].grips[0].y / S;
    knot.position.set(show.x, ky, show.y);
    flag.rotation.z = Math.sin(time * 3) * .15;
    for (let s = 0; s < S; s++) {
      const [dx, dz] = DIR[s], segs = ropes[s];
      let a = knot.position, j = 0;
      for (const i of members[s]) for (const g of players[i].grips) { seg(segs[j++], a, g); a = g; }
      const bx = a.x, bz = a.z;
      for (let t0 = 0; t0 < TAIL.length; t0++) { const [back, y] = TAIL[t0], b = tail[t0].set(bx + dx * back, y, bz + dz * back); seg(segs[j++], a, b); a = b; }
      coils[s].position.set(a.x + dx * .2, .05, a.z + dz * .2);
    }
    rim.rotation.y += dt * .05;
    burst.update(dt);
    sc.update(dt);
    for (const v of panes) {
      v.val.textContent = st === 'pull' ? Math.max(0, Math.ceil(CAP - RT)) : '';
      const p = players[v.pi], tang = st === 'pull' && p.tangT > 0, boosted = st === 'pull' && p.boostT > 0, open = !tang && braceOn >= 0 && p.bw !== braceOn;
      v.tangle.classList.toggle('on', tang);
      v.pips.forEach((e, j) => e.classList.toggle('on', j < p.tn));
      const f = tang ? p.tangT / TANGLE : boosted ? p.boostT / BOOST : open ? (braceOn + WINDOW - RT) / WINDOW : 0;
      v.brace.className = 'brace' + (tang ? ' on tang' : boosted ? ' on boost' : open ? ' on' : '');
      v.brace.firstChild.style.transform = `scaleX(${THREE.MathUtils.clamp(f, 0, 1)})`;
    }
  }

  function resize() {
    layout(panes);
    for (const v of panes) { const p = players[v.pi]; p.cam.aspect = v.w / v.h; p.fov = fitFov(p.cam.aspect, 34, 55, 95); }
  }

  const look = new THREE.Vector3();
  function render() {
    renderPanes(renderer, scene, panes, v => {
      const p = players[v.pi], c = p.cam, [dx, dz] = DIR[p.s], rp = p.r.position;
      if (sc.on) { sc.cam(v, c, p.fov); sky.position.copy(c.position); return c; }
      // behind the athlete, a little to the side so the body doesn't hide the knot
      c.position.set(rp.x + dx * 5.2 - dz * 1.6, 3.4, rp.z + dz * 5.2 + dx * 1.6);
      c.lookAt(look.set(show.x - dx * 1.5, .9, show.y - dz * 1.5));
      if (v.flip) c.rotateZ(Math.PI);
      c.fov = p.fov; c.updateProjectionMatrix();
      sky.position.copy(c.position);
      return c;
    });
  }

  const unbind = bindInput({ cv: renderer.domElement, panes, n, online, me, act });

  function onNet(msg) {
    if (msg.t === 'up' && auth && st === 'pull') {
      const p = players[msg.from];
      if (p && !p.local && typeof msg.p === 'number' && msg.p > 0) { pull(p.i, Math.min(msg.p, 8)); p.tangT = 0; } // pulling again = they untangled on their device // 8 = 2× boost at ~26 presses/s per 100 ms: anything more is junk
    } else if (msg.t === 'um' && !auth && msg.from === 0) {
      const ok = ['pull', 'point', 'done'].includes(msg.st) && Number.isInteger(msg.r) && msg.r >= 0 && msg.r < MAXR
        && Number.isFinite(msg.x) && Number.isFinite(msg.y) && Number.isFinite(msg.rt) && Number.isInteger(msg.s) && msg.s >= -1 && msg.s < S
        && Array.isArray(msg.w) && msg.w.length === S && msg.w.every(w => Number.isInteger(w) && w >= 0 && w <= MAXR);
      if (!ok || ended) return;
      const sn = { ...msg, x: THREE.MathUtils.clamp(msg.x, -R, R), y: THREE.MathUtils.clamp(msg.y, -R, R) };
      if (st === 'count') snap = sn; else applySnap(sn);
    }
  }

  function botify(i, local) {
    const p = players[i];
    if (!p) return;
    p.bot = true;
    p.tag.userData.set(label(i));
    if (local) p.local = true;
    if (i === 0 && local && !auth) { // host gone: carry on from the last snapshot we saw
      auth = true;
      if (st === 'wait') startRound();
    }
    chips();
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
