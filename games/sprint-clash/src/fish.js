import * as THREE from 'three';
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { COL, canvasTex, disposeScene, flash, buzz, Burst } from './fx.js';
import { coarse, keyHint, zones, makePane, rankChips, layout, fitFov, renderPanes, bindInput, countdown, makeShowcase, addSky, lights, makeRunner, nameTag } from './stage.js';

// Deep Cast: 60 s of fishing off your own dock; heaviest total catch wins. A loop of three skill checks:
// CAST (hold Action, the meter swings, release sets the distance; further = bigger fish, harder fight),
// HOOK (nibbles twitch the bobber as bait; strike on the real bite, 0.6 s), and REEL (the fish switches its pull
// left / right every 1.2–2.4 s with a 0.5 s warning; hold the opposite side to drop the tension, tap Action to wind in; over the top
// the line snaps, slack for 1.8 s and it gets away).
// Fairness: your k-th cast meets the same seeded fish as everyone else's k-th cast (wait, nibble, species, weight,
// pull pattern). Online every device runs its own anglers (the host also runs the AI seats), like Cliff Chicken:
// only a status line (8 Hz), catches and the final total go over the wire, so latency never costs a fish.
const DUR = 60, LG = 9, DOCK = .8, FLY = .6, BITE = .6, REST = 1.1, MAXD = 17, WARN = .5, SLACK = 1.8;
const PH = ['aim', 'fly', 'wait', 'bite', 'reel', 'rest', 'done'];
const SPECIES = [{ k: 'fishPerch', col: 0x9fd86a }, { k: 'fishBass', col: 0x4fa870 }, { k: 'fishPike', col: 0x8aa6b8 }, { k: 'fishCarp', col: 0xffc23f }];

export function createFish({ renderer, mode, n = 2, me = 0, bots = [], rand, send, label, onEnd }) {
  const online = mode === 'online';
  const IDX = [...Array(n).keys()], LX = IDX.map(i => (i - (n - 1) / 2) * LG);

  // the k-th cast of every player meets the same fish
  const casts = Array.from({ length: 80 }, () => ({
    wait: 1.4 + rand() * 2, nib: .3 + rand() * .45, roll: rand(), wroll: rand(),
    dirs: Array.from({ length: 24 }, () => [1.2 + rand() * 1.2, rand()]),
  }));
  const fishOf = (c, d) => {
    const C = casts[c % casts.length];
    let sp = d < .35 ? 0 : d < .68 ? 1 : 2, w = (1.5 + d * 7) * (.6 + .8 * C.wroll);
    if (d > .75 && C.roll < .14) { sp = 3; w *= 1.6; } // rare golden carp, long casts only
    return { sp, w: Math.round(w * 10) / 10 };
  };

  // ---- scene: golden-hour lake, layered hills, a dock + lantern per player
  const scene = new THREE.Scene(), fogC = new THREE.Color(0x4a2a48);
  scene.background = fogC;
  scene.fog = new THREE.Fog(fogC, 40, 150);
  lights(scene);
  const sky = addSky(scene, fogC, 0xff8a4a);
  const sun = new THREE.Mesh(new THREE.CircleGeometry(9, 48), new THREE.MeshBasicMaterial({ color: 0xffc070, toneMapped: false, fog: false }));
  sun.position.set(-18, 13, -140); scene.add(sun);
  const glintTex = canvasTex(64, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,200,120,0)'); gr.addColorStop(.6, 'rgba(255,190,110,.55)'); gr.addColorStop(1, 'rgba(255,190,110,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const gx = g.createLinearGradient(0, 0, w, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(.5, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)');
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = gx; g.fillRect(0, 0, w, h);
  });
  const glint = new THREE.Mesh(new THREE.PlaneGeometry(10, 140).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: glintTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  glint.position.set(-9, .03, -72); glint.rotation.y = -.13; scene.add(glint);
  [[-70, 0x4a2846, 5], [-95, 0x5c3452, 8], [-120, 0x70425e, 11]].forEach(([z, col, hmax]) => { // hills, hazier with distance
    const pts = [new THREE.Vector2(-160, -2)];
    for (let x = -160; x <= 160; x += 8) pts.push(new THREE.Vector2(x, 2 + Math.abs(Math.sin(x * .031 + z) * hmax + Math.sin(x * .09) * 3)));
    pts.push(new THREE.Vector2(160, -2));
    const m = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(pts)), new THREE.MeshBasicMaterial({ color: col, fog: false }));
    m.position.z = z; scene.add(m);
  });
  // water: scrolling normal map, see-through enough to spot a hooked fish below the surface
  const nTex = canvasTex(256, 256, (g, w) => {
    const img = g.createImageData(w, w), T = Math.PI * 2 / w;
    for (let y = 0; y < w; y++) for (let x = 0; x < w; x++) {
      const nx = Math.sin(x * T * 3 + Math.sin(y * T * 2) * 2) * .5 + Math.sin((x + y) * T * 5) * .3, ny = Math.cos(y * T * 4 + Math.sin(x * T * 3)) * .5 + Math.cos((x - y) * T * 6) * .3;
      const k = (y * w + x) * 4; img.data[k] = 128 + nx * 90; img.data[k + 1] = 128 + ny * 90; img.data[k + 2] = 255; img.data[k + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  });
  nTex.colorSpace = THREE.NoColorSpace; nTex.wrapS = nTex.wrapT = THREE.RepeatWrapping; nTex.repeat.set(70, 70);
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x245e74, roughness: .3, metalness: .1, normalMap: nTex, normalScale: new THREE.Vector2(.14, .14), transparent: true, opacity: .76, envMapIntensity: .35 });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2), waterMat);
  water.renderOrder = 1; scene.add(water);
  const bed = new THREE.Mesh(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x06202e }));
  bed.position.y = -3; scene.add(bed);
  // ambient fish shadows
  const shadowGeo = new THREE.SphereGeometry(1, 12, 8).scale(.7, .12, .25), shadowMat = new THREE.MeshBasicMaterial({ color: 0x031018, transparent: true, opacity: .5, depthWrite: false });
  const school = Array.from({ length: 18 }, () => { const m = new THREE.Mesh(shadowGeo, shadowMat); m.position.set((Math.random() - .5) * 40, -.6 - Math.random() * .8, -3 - Math.random() * 18); m.userData.v = (Math.random() < .5 ? -1 : 1) * (.6 + Math.random()); m.scale.setScalar(.5 + Math.random() * .9); scene.add(m); return m; });

  const plankTex = canvasTex(128, 256, (g, w, h) => {
    for (let y = 0; y < h; y += 16) { g.fillStyle = `hsl(28, ${35 + Math.random() * 10}%, ${24 + Math.random() * 8}%)`; g.fillRect(0, y, w, 15); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y + 15, w, 1); }
  });
  const woodMat = new THREE.MeshStandardMaterial({ map: plankTex, roughness: .8 }), postMat = new THREE.MeshStandardMaterial({ color: 0x3a2618, roughness: .9 });
  const rodMat = new THREE.MeshStandardMaterial({ color: 0xc9a26b, roughness: .4, metalness: .2 }), reelMat = new THREE.MeshStandardMaterial({ color: 0x20243a, metalness: .8, roughness: .3 }), gripMat = new THREE.MeshStandardMaterial({ color: 0x8a5a34, roughness: .9 });
  const segGeo = new THREE.CylinderGeometry(.025, .035, .55, 6).translate(0, .275, 0);
  const lanes = IDX.map(i => {
    const x = LX[i], g = new THREE.Group();
    const deck = new THREE.Mesh(new THREE.BoxGeometry(2.6, .2, 6), woodMat); deck.position.set(0, DOCK - .1, .5);
    g.add(deck);
    for (const [px, pz] of [[-1.2, -2.4], [1.2, -2.4], [-1.2, 3.2], [1.2, 3.2]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 3.4, 8), postMat); p.position.set(px, DOCK - 1.7, pz); g.add(p); }
    const lpost = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 2), postMat); lpost.position.set(1.15, DOCK + 1, -2.3); g.add(lpost);
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xffb040, toneMapped: false });
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(.16, 12, 8), lampMat); lamp.position.set(1.15, DOCK + 2.05, -2.3); g.add(lamp);
    g.position.x = x; scene.add(g);
    // angler + rod (a chain of segments that bends with tension) + line + bobber + fish
    const r = makeRunner(COL[i]); r.position.set(x - .25, DOCK, .6);
    const tag = nameTag(label(i), COL[i]); tag.position.y = 2.2; r.add(tag); scene.add(r);
    // rod butt at the belly, held in both hands: left on the fore grip, right on the reel crank
    const rod = new THREE.Group(); rod.position.set(x - .25, DOCK + .98, .32); scene.add(rod);
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(.034, .03, .42, 8).translate(0, .09, 0), gripMat); rod.add(grip);
    const reel = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .07, 12).rotateZ(Math.PI / 2), reelMat); reel.position.set(0, .04, -.08); rod.add(reel);
    const gripL = new THREE.Object3D(); gripL.position.y = .24; rod.add(gripL);
    const gripR = new THREE.Object3D(); rod.add(gripR);
    const segs = []; let parent = rod;
    for (let k = 0; k < 6; k++) { const s = new THREE.Mesh(segGeo, rodMat); if (k) s.position.y = .55; parent.add(s); segs.push(s); parent = s; }
    const tip = new THREE.Object3D(); tip.position.y = .55; parent.add(tip);
    const LP = 28, lineGeo = new THREE.BufferGeometry(); lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(LP * 3), 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .85, toneMapped: false });
    const line = new THREE.Line(lineGeo, lineMat); line.frustumCulled = false; scene.add(line);
    const bob = new THREE.Group();
    bob.add(new THREE.Mesh(new THREE.SphereGeometry(.13, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff3a4a, toneMapped: false })));
    bob.add(new THREE.Mesh(new THREE.SphereGeometry(.13, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xf0f0f0 })));
    scene.add(bob);
    const fishMat = new THREE.MeshStandardMaterial({ color: 0x9fd86a, roughness: .35, metalness: .4, emissive: 0x000000 });
    const fish = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(.5, 16, 10).scale(1.5, .62, .42), fishMat);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(.32, .5, 4).rotateZ(Math.PI / 2), fishMat); tail.position.x = .85;
    const fin = new THREE.Mesh(new THREE.ConeGeometry(.14, .3, 3), fishMat); fin.position.set(.05, .3, 0);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0x050510 })); eye.position.set(-.55, .08, .15);
    fish.add(body, tail, fin, eye); fish.visible = false; scene.add(fish);
    return { x, r, rod, segs, tip, gripL, gripR, crank: 0, line, lineGeo, lineMat, LP, bob, fish, fishMat, tail, lampMat, tag, whip: 0, arcT: -1, arcFrom: new THREE.Vector3() };
  });

  // ripple rings (shared pool)
  const ripGeo = new THREE.RingGeometry(.85, 1, 32).rotateX(-Math.PI / 2);
  const ripples = Array.from({ length: 14 }, () => { const m = new THREE.Mesh(ripGeo, new THREE.MeshBasicMaterial({ color: 0xdff4ff, transparent: true, opacity: 0, depthWrite: false })); m.position.y = .02; m.visible = false; scene.add(m); return { m, t: 1 }; });
  let ripI = 0;
  const ripple = (x, z, s = 1) => { const r = ripples[ripI++ % ripples.length]; r.m.position.x = x; r.m.position.z = z; r.t = 0; r.s = s; r.m.visible = true; };
  const burst = new Burst(scene);

  // ---- players: local ones run the sim; online rivals mirror their status messages
  const P = IDX.map(i => ({
    i, local: !online || i === me, bot: false, ph: 'aim', t: 0, m: 0, mt: 0, hold: false, d: .3, c: 0, cnt: 0, nib: 0, nibbed: false, wait: 2, nibAt: 1,
    T: .45, line: 1, dir: 1, nd: -1, di: 0, dirT: 1, slack: 0, l: 0, r: 0, fish: null, kg: 0, best: 0, fin: false, sendT: 0,
    ai: { tgt: .7, early: false, rt: .2, side: 0, sideT: 0, cd: 0 },
  }));
  const panes = (online ? [me] : IDX).map(pi => {
    const v = makePane(pi, label, zones('◀', '🎣', '▶') + '<div class="fcast"><i></i></div><div class="ften"><b>TENSION</b><s></s><i></i></div><div class="fpull"><p><em></em><span></span></p><b></b></div><div class="freel"><i></i></div>');
    v.chips = rankChips(v, n, label);
    v.cast = v.q('.fcast'); v.castI = v.q('.fcast i'); v.ten = v.q('.ften'); v.pull = v.q('.fpull'); v.sit = v.q('.fpull em'); v.dir = v.q('.fpull span'); v.todo = v.q('.fpull b'); v.reel = v.q('.freel'); v.reelI = v.q('.freel i');
    v.q('.ften b').textContent = t('fishTension');
    v.cam = new THREE.PerspectiveCamera(55, 1, .1, 400); v.fov = 55; v.cp = new THREE.Vector3(LX[pi], 3.5, 5); v.look = new THREE.Vector3(LX[pi], 0, -9); v.s = {};
    v.hint.textContent = coarse ? t('fishTouch') : t('fishKeys', keyHint(pi, online));
    return v;
  });
  const paneOf = i => panes.find(v => v.pi === i);
  const shown = i => !!paneOf(i);
  const chips = () => panes.forEach(v => v.chips(P.map(p => t('fishKg', { n: p.kg.toFixed(1) }))));
  const say = (i, txt, cls) => { const v = paneOf(i); if (v) flash(v.msg, txt, cls); };

  let ph = 'count', clock = 0, step = countdown(panes), time = 0;

  // ---- per-angler sim (local players only)
  function cast(p) {
    p.d = Math.max(.08, p.m); p.ph = 'fly'; p.t = 0; p.hold = false; p.c = p.cnt++;
    if (shown(p.i)) sfx.toss();
    lanes[p.i].whip = 1;
  }
  function hook(p) {
    if (p.ph === 'bite') {
      const C = casts[p.c % casts.length];
      p.fish = fishOf(p.c, p.d); p.ph = 'reel'; p.t = 0; p.T = .45; p.line = 1; p.slack = 0; p.di = 0;
      p.dir = C.dirs[0][1] < .5 ? -1 : 1; p.dirT = C.dirs[0][0]; p.ai.sideT = 0;
      say(p.i, t('fishHooked'), 'boost'); if (shown(p.i)) { sfx.catch(); buzz(30); }
      splash(p.i, .6);
    } else if (p.ph === 'wait') { p.ph = 'rest'; p.t = 0; say(p.i, t('fishSpook'), 'miss'); if (shown(p.i)) sfx.miss(); }
  }
  function land(p, how) { // how: catch | snap | slack | miss | time
    p.ph = how === 'time' ? 'done' : 'rest'; p.t = 0;
    if (how === 'catch') {
      p.kg = Math.round((p.kg + p.fish.w) * 10) / 10; p.best = Math.max(p.best, p.fish.w);
      if (online) send({ t: 'fk', from: p.i, kg: p.kg, w: p.fish.w, sp: p.fish.sp, b: p.best });
      caught(p.i, p.fish);
    } else if (how === 'snap') { say(p.i, t('fishSnap'), 'hit'); if (shown(p.i)) { sfx.hit(); buzz(60); } burst.emit(lanes[p.i].x, 1.5, -2, 0xff5a6e, 16, 4); }
    else if (how === 'slack') { say(p.i, t('fishSlack'), 'miss'); if (shown(p.i)) sfx.miss(); }
    else if (how === 'miss') { say(p.i, t('fishMiss'), 'miss'); if (shown(p.i)) sfx.miss(); }
  }
  function caught(i, f) {
    const L = lanes[i];
    say(i, t('fishCatch', { s: t(SPECIES[f.sp].k), w: f.w.toFixed(1) }), f.sp === 3 ? 'perfect' : 'great');
    if (shown(i)) { f.sp === 3 ? sfx.win() : sfx.perfect(); }
    L.arcT = 0; L.arcFrom.copy(L.fish.position); L.arcSp = f.sp; L.arcW = f.w;
    burst.emit(L.x, .3, -3, 0x9fe8ff, 26, 5);
    if (f.sp === 3) burst.emit(L.x, 1.5, 0, 0xffd23f, 40, 6);
    chips();
  }
  function splash(i, s) { const p = P[i]; ripple(lanes[i].x + .3, -(3 + p.d * (MAXD - 3)), s); }

  function think(p, dt) { // AI: decides only for its own seat, from Math.random (not the seed)
    const A = p.ai;
    if (p.ph === 'aim') { if (!p.hold) { p.hold = true; p.mt = 0; A.tgt = .45 + Math.random() * .5; } else if (p.mt > .3 && p.m >= A.tgt) cast(p); }
    else if (p.ph === 'wait') { if (A.early && p.nib > 0 && p.nib < .12) { A.early = false; hook(p); } }
    else if (p.ph === 'bite') { if (p.t > A.rt) hook(p); }
    else if (p.ph === 'reel') {
      if ((A.sideT -= dt) <= 0 && A.side !== -p.dir) { A.side = -p.dir; A.sideT = .18 + Math.random() * .2; }
      p.l = A.side === -1 ? 1 : 0; p.r = A.side === 1 ? 1 : 0;
      if ((A.cd -= dt) <= 0 && p.T < .6) { tap(p); A.cd = .1 + Math.random() * .08; }
    }
  }
  function tap(p) { if (p.ph !== 'reel') return; p.line -= .05; p.T += .07; if (shown(p.i)) sfx.pull(); }

  function stepAngler(p, dt) {
    p.t += dt; p.nib = Math.max(0, p.nib - dt);
    if (p.bot) think(p, dt);
    if (p.ph === 'aim') { if (p.hold) { p.mt += dt; p.m = .5 - .5 * Math.cos(p.mt * 3.2); } }
    else if (p.ph === 'fly') {
      if (p.t > FLY) {
        const C = casts[p.c % casts.length];
        Object.assign(p, { ph: 'wait', t: 0, wait: C.wait, nibAt: C.wait * C.nib, nibbed: false });
        Object.assign(p.ai, { early: Math.random() < .1, rt: .12 + Math.random() * .18 });
        splash(p.i, .7); if (shown(p.i)) sfx.drop();
      }
    } else if (p.ph === 'wait') {
      if (!p.nibbed && p.t > p.nibAt) { p.nib = .28; p.nibbed = true; splash(p.i, .35); if (shown(p.i)) sfx.decoy(); }
      if (p.t > p.wait) { p.ph = 'bite'; p.t = 0; splash(p.i, 1); say(p.i, '!', 'go'); if (shown(p.i)) { sfx.signal(); buzz(25); } }
    } else if (p.ph === 'bite') { if (p.t > BITE) land(p, 'miss'); }
    else if (p.ph === 'reel') {
      const D = casts[p.c % casts.length].dirs, next = () => (D[(p.di + 1) % D.length][1] < .6 ? -p.dir : p.dir);
      if ((p.dirT -= dt) <= 0) { p.dir = next(); p.di++; p.dirT = D[p.di % D.length][0]; }
      p.nd = next();
      const counter = p.dir < 0 ? p.r : p.l, wrong = p.dir < 0 ? p.l : p.r;
      p.T = Math.max(0, p.T + (counter ? -.22 : wrong ? .36 : .16) * dt * (.6 + p.fish.w / 16));
      if (!counter) p.line = Math.min(1, p.line + .03 * dt);
      if (p.line <= 0) land(p, 'catch'); // the winding tap that lands it can't also snap it
      else if (p.T > 1) land(p, 'snap');
      else if (p.T < .1 ? (p.slack += dt) > SLACK : (p.slack = 0, false)) land(p, 'slack');
    } else if (p.ph === 'rest' && p.t > REST) { p.ph = 'aim'; p.m = 0; p.mt = 0; p.hold = false; }
  }

  // ---- networking: status lines for rivals' docks, catches, and each angler's final total
  const q2 = v => Math.round(v * 100) / 100;
  function status(p) { send({ t: 'fs', from: p.i, ph: PH.indexOf(p.ph), d: q2(p.d), T: q2(p.T), ln: q2(p.line), dir: p.dir, m: q2(p.m), kg: p.kg, sp: p.fish?.sp ?? 0, w: p.fish?.w ?? 0 }); }
  const num = x => typeof x === 'number' && Number.isFinite(x);
  function onNet(m) {
    if (!m || typeof m.t !== 'string') return;
    const i = m.from;
    if (!Number.isInteger(i) || i < 0 || i >= n || P[i].local) return;
    const p = P[i];
    if (m.t === 'fs' && Number.isInteger(m.ph) && PH[m.ph] && [m.d, m.T, m.ln, m.m, m.kg, m.w].every(num) && [-1, 1].includes(m.dir) && Number.isInteger(m.sp) && SPECIES[m.sp]) {
      if (PH[m.ph] !== p.ph) p.t = 0; // rivals' phase clocks run locally between status lines
      Object.assign(p, { ph: p.fin ? 'done' : PH[m.ph], d: m.d, T: m.T, line: m.ln, dir: m.dir, m: m.m, fish: { sp: m.sp, w: m.w } });
      if (!p.fin) p.kg = Math.max(p.kg, m.kg);
    } else if (m.t === 'fk' && [m.kg, m.w, m.b].every(num) && Number.isInteger(m.sp) && SPECIES[m.sp]) {
      p.kg = Math.max(p.kg, m.kg); p.best = Math.max(p.best, m.b); caught(i, { sp: m.sp, w: m.w });
    } else if (m.t === 'fe' && num(m.kg) && num(m.b)) { p.kg = m.kg; p.best = m.b; p.fin = true; p.ph = 'done'; chips(); }
  }

  // ---- input
  const act = (pi, a) => {
    const p = P[pi];
    if (!p?.local || p.bot || ph !== 'play') return;
    if (a === 'L') p.l = 1;
    else if (a === 'R') p.r = 1;
    else if (p.ph === 'aim') { p.hold = true; p.mt = 0; }
    else if (p.ph === 'wait' || p.ph === 'bite') hook(p);
    else if (p.ph === 'reel') tap(p);
  };
  const release = (pi, a) => {
    const p = P[pi];
    if (!p?.local || p.bot) return;
    if (a === 'L') p.l = 0;
    else if (a === 'R') p.r = 0;
    else if (p.ph === 'aim' && p.hold && ph === 'play') cast(p);
  };
  const unbind = bindInput({ cv: renderer.domElement, panes, n, online, me, act, release });

  // ---- match end
  const sc = makeShowcase(panes, label, onEnd);
  let ended = false, champ = 0;
  function finishLocal(p) {
    if (p.fin) return;
    p.fin = true;
    if (p.ph === 'reel' || p.ph === 'bite' || p.ph === 'wait') say(p.i, t('fishTime'), 'miss');
    p.ph = 'done';
    if (online) send({ t: 'fe', from: p.i, kg: p.kg, b: p.best });
    const v = paneOf(p.i);
    if (v && online && P.some(o => !o.fin)) { v.hint.textContent = t('waitRival'); v.hint.classList.remove('hide'); }
  }
  function finish() {
    if (ended) return;
    ended = true;
    const order = [...IDX].sort((a, b) => P[b].kg - P[a].kg || P[b].best - P[a].best);
    const draw = n > 1 && P[order[0]].kg === P[order[1]].kg && P[order[0]].best === P[order[1]].best;
    champ = order[0];
    sc.start({ order, draw, scores: IDX.map(i => t('fishKg', { n: P[i].kg.toFixed(1) })) }, () => lanes[champ].r.position, { r: 4.2, h: 2.2, look: 1.4 });
    burst.emit(lanes[champ].x, 2, .5, COL[champ], 40, 6);
  }

  // ---- frame
  // two-bone IK (upper arm .3 + forearm .3 rig units): put the hand on a grip point of the rod
  const ikV = new THREE.Vector3();
  function reach(u, arm, elbow, grip) {
    u.body.worldToLocal(grip.getWorldPosition(ikV)).sub(arm.position);
    const d = Math.min(.595, Math.max(.05, ikV.length())); ikV.normalize();
    arm.rotation.set(Math.atan2(-ikV.z, -ikV.y) - Math.acos(d / .6), 0, Math.asin(ikV.x));
    elbow.rotation.x = Math.PI - Math.acos(1 - d * d / .18);
  }
  const tipV = new THREE.Vector3(), endV = new THREE.Vector3(), ctl = new THREE.Vector3(), cRed = new THREE.Color(0xff5a6e), cGold = new THREE.Color(0xffd23f), cWhite = new THREE.Color(0xffffff);
  function update(dt) {
    time += dt;
    if (ph === 'count') {
      if (!step(dt)) { ph = 'play'; clock = 0; panes.forEach(v => v.hint.classList.add('hide')); }
    } else if (ph === 'play') {
      clock += dt;
      for (const p of P) {
        if (!p.local) { p.t += dt; continue; }
        if (p.fin) continue;
        stepAngler(p, dt);
        if (online && (p.sendT += dt) >= .125) { p.sendT = 0; status(p); }
        if (clock >= DUR && (p.ph !== 'reel' && p.ph !== 'bite' || clock >= DUR + 10)) finishLocal(p); // a fish on the line at the buzzer gets fought out
      }
      if (P.every(p => p.fin)) { ph = 'done'; finish(); }
    }

    // scenery
    nTex.offset.set(time * .01, time * .016);
    school.forEach(f => { f.position.x += f.userData.v * dt; if (Math.abs(f.position.x) > 26) f.userData.v *= -1; f.rotation.y = f.userData.v > 0 ? Math.PI : 0; });
    ripples.forEach(r => { if (!r.m.visible) return; r.t += dt; const k = r.t / 1.4; r.m.scale.setScalar(.2 + k * 2.2 * r.s); r.m.material.opacity = Math.max(0, .7 * (1 - k)); if (k >= 1) r.m.visible = false; });
    const left = Math.max(0, DUR - clock), urgent = ph === 'play' && left < 10;

    P.forEach(p => {
      const L = lanes[p.i];
      // rod: pulled back while charging, whips forward on the cast, bends with tension while reeling
      L.whip = Math.max(0, L.whip - dt * 3);
      const back = p.ph === 'aim' && p.hold ? .25 + p.m * .7 : 0, bend = p.ph === 'reel' ? .2 + p.T * 1.1 : p.ph === 'bite' ? .5 : .06;
      L.rod.rotation.x = -1.15 + back - L.whip * .6 + (p.ph === 'reel' ? .35 : 0);
      L.rod.rotation.z = p.ph === 'reel' ? -p.dir * .15 * p.T : 0;
      L.rod.position.y = DOCK + .98 + back * .3;
      L.segs.forEach((s, k) => { if (k) s.rotation.x = -bend / 5 + Math.sin(time * 2 + k) * .01; });
      if (p.ph === 'reel') L.crank += dt * (p.l || p.r ? 7 : 12);
      L.gripR.position.set(.1, .04 + Math.sin(L.crank) * .07, -.08 + Math.cos(L.crank) * .07);
      L.rod.updateMatrixWorld(true); L.tip.getWorldPosition(tipV);
      const u = L.r.userData;
      u.body.rotation.x = p.ph === 'reel' ? .12 + p.T * .12 : -.05 - back * .2; u.body.rotation.y = p.ph === 'reel' ? -p.dir * .15 : 0;
      L.r.updateMatrixWorld(true);
      reach(u, u.armL, u.elbowL, L.gripL); reach(u, u.armR, u.elbowR, L.gripR);
      L.lampMat.color.setHex(urgent && Math.sin(time * 10) > 0 ? 0xff5a3a : 0xffb040);

      // bobber / fish / line end
      const bz = -(3 + p.d * (MAXD - 3)), bx = L.x + .3;
      L.bob.visible = p.ph === 'fly' || p.ph === 'wait' || p.ph === 'bite';
      L.fish.visible = p.ph === 'reel' || L.arcT >= 0;
      let lineOn = L.bob.visible || p.ph === 'reel', sag = .9;
      if (p.ph === 'fly') { const k = Math.min(1, p.t / FLY); endV.set(tipV.x + (bx - tipV.x) * k, tipV.y + (0 - tipV.y) * k + Math.sin(k * Math.PI) * 3, tipV.z + (bz - tipV.z) * k); sag = .3; }
      else if (p.ph === 'wait' || p.ph === 'bite') {
        const dunk = p.ph === 'bite' ? -.18 + Math.sin(time * 40) * .04 : p.nib > 0 ? Math.sin(p.nib * 60) * .06 : Math.sin(time * 2.5) * .02;
        endV.set(bx, .04 + dunk, bz);
      } else if (p.ph === 'reel') {
        const f = p.fish ?? { sp: 0, w: 2 }, depth = -.3 - p.d * .45 * p.line;
        endV.set(bx + p.dir * (1 + p.T), depth, -2.2 + (bz + 2.2) * p.line);
        L.fishMat.color.setHex(SPECIES[f.sp].col); L.fishMat.emissive.setHex(f.sp === 3 ? 0x6a4800 : 0x10261a);
        L.fish.scale.setScalar(.55 + f.w * .07);
        L.fish.position.copy(endV);
        L.fish.rotation.set(0, p.dir > 0 ? Math.PI : 0, Math.sin(time * 12) * .12);
        L.tail.rotation.y = Math.sin(time * 18) * .5;
        sag = Math.max(0, .9 - p.T * 1.2);
        if (Math.random() < dt * 6) ripple(endV.x, endV.z, .35);
      }
      if (L.arcT >= 0) { // caught: the fish arcs out of the water into the angler's hands
        L.arcT += dt / .8;
        const k = Math.min(1, L.arcT), hx = L.x - .25, hy = DOCK + 1.3, hz = .2;
        L.fish.position.set(L.arcFrom.x + (hx - L.arcFrom.x) * k, L.arcFrom.y + (hy - L.arcFrom.y) * k + Math.sin(k * Math.PI) * 2.4, L.arcFrom.z + (hz - L.arcFrom.z) * k);
        L.fish.rotation.z = k * 6; L.fishMat.color.setHex(SPECIES[L.arcSp].col); L.fish.scale.setScalar(.55 + L.arcW * .07);
        if (L.arcT > 1.6) L.arcT = -1;
        endV.copy(L.fish.position); lineOn = true; sag = .2;
      }
      L.bob.position.copy(endV);
      L.line.visible = lineOn;
      if (lineOn) {
        const a = L.lineGeo.attributes.position;
        ctl.set((tipV.x + endV.x) / 2, Math.min(tipV.y, endV.y) + (Math.max(tipV.y, endV.y) - Math.min(tipV.y, endV.y)) * .3 - sag * 1.2, (tipV.z + endV.z) / 2);
        const buzzAmp = p.ph === 'reel' && p.T > .85 ? .05 : 0;
        for (let k = 0; k < L.LP; k++) {
          const s = k / (L.LP - 1), a1 = (1 - s) * (1 - s), b1 = 2 * (1 - s) * s, c1 = s * s;
          a.setXYZ(k, a1 * tipV.x + b1 * ctl.x + c1 * endV.x + Math.sin(time * 80 + k) * buzzAmp, a1 * tipV.y + b1 * ctl.y + c1 * endV.y, a1 * tipV.z + b1 * ctl.z + c1 * endV.z);
        }
        a.needsUpdate = true;
        const T = p.ph === 'reel' ? p.T : 0;
        L.lineMat.color.copy(cWhite).lerp(T > .6 ? cRed : cGold, T > .6 ? (T - .6) / .4 : T / .6 * .6);
      }
    });

    // HUD
    panes.forEach(v => {
      const p = P[v.pi], s = v.s;
      const tv = ph === 'count' ? '60' : String(Math.ceil(left));
      if (s.tv !== tv) { s.tv = tv; v.val.textContent = t('time', { n: tv }); v.val.style.color = urgent ? '#ff5a6e' : ''; }
      const casting = p.ph === 'aim' && ph === 'play';
      v.cast.classList.toggle('on', casting);
      if (casting) v.castI.style.transform = `scaleX(${p.m.toFixed(3)})`;
      const reel = p.ph === 'reel';
      v.ten.classList.toggle('on', reel); v.reel.classList.toggle('on', reel); v.pull.classList.toggle('on', reel);
      if (reel) {
        const tq = Math.min(1, p.T).toFixed(3);
        if (s.T !== tq) { s.T = tq; v.ten.style.setProperty('--t', tq); }
        v.ten.classList.toggle('hot', p.T > .85); v.ten.classList.toggle('slack', p.T < .12);
        v.reelI.style.transform = `scaleX(${(1 - p.line).toFixed(3)})`;
        // row 1 = situation (where the fish pulls, or where it's about to switch), row 2 = what to hold (always the opposite side)
        const warn = p.dirT < WARN && p.nd !== p.dir, d = warn ? p.nd : p.dir, key = d + '' + warn;
        if (s.pull !== key) {
          s.pull = key; v.pull.classList.toggle('warn', warn);
          v.sit.textContent = t(warn ? 'fishSitSwap' : 'fishSitPull'); v.dir.textContent = t(d < 0 ? 'fishDirL' : 'fishDirR'); v.todo.textContent = t(d < 0 ? 'fishDoR' : 'fishDoL');
        }
      }
    });
    burst.update(dt);
    sc.update(dt);
  }

  function resize() {
    layout(panes);
    for (const v of panes) { v.cam.aspect = v.w / v.h; v.fov = fitFov(v.cam.aspect, 30, 48, 90); }
  }

  const tmp = new THREE.Vector3();
  function render() {
    renderPanes(renderer, scene, panes, v => {
      const c = v.cam, p = P[v.pi], L = lanes[v.pi], k = 1 - Math.exp(-(1 / 60) * 3);
      if (sc.on) { sc.cam(v, c, v.fov); sky.position.copy(c.position); return c; }
      if (p.ph === 'reel') { // push in over the shoulder, eyes on the fish
        v.cp.lerp(tmp.set(L.x + 1.1, DOCK + 2.3, 3.2), k * 2);
        v.look.lerp(tmp.set(L.x + p.dir * .6, -.2, -3 - p.d * 6 * p.line), k * 2);
      } else {
        v.cp.lerp(tmp.set(L.x + .6, DOCK + 2.9, 4.8), k * 2);
        v.look.lerp(tmp.set(L.x, 0, -9), k * 2);
      }
      c.position.copy(v.cp);
      if (p.ph === 'reel' && p.T > .85) { c.position.x += (Math.random() - .5) * .06; c.position.y += (Math.random() - .5) * .06; }
      c.lookAt(v.look);
      if (v.flip) c.rotateZ(Math.PI);
      c.fov = v.fov; c.updateProjectionMatrix();
      sky.position.copy(c.position);
      return c;
    });
  }

  function botify(i, local) {
    const p = P[i];
    if (!p) return;
    p.bot = true;
    if (local) p.local = true;
    lanes[i].tag.userData.set(label(i));
    chips();
  }

  function dispose() {
    unbind();
    panes.forEach(v => v.el.remove());
    document.body.classList.remove('split-v');
    disposeScene(scene);
  }

  chips();
  resize();
  bots.forEach(i => botify(i, me === 0));
  return { update, render, resize, onNet, dispose, botify };
}
