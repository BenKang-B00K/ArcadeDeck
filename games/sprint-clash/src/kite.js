import * as THREE from 'three';
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { COL, canvasTex, disposeScene, flash, buzz, Burst } from './fx.js';
import { coarse, keyHint, zones, makePane, rankChips, layout, fitFov, renderPanes, bindInput, countdown, makeShowcase, addSky, addCity, lights, makeRunner, animRunner, nameTag } from './stage.js';

// Kite Fight: rooftop kite fighting. Each kite flies forward on a string from its flyer's rooftop; hold left / right
// to steer, hold Action to PULL (faster, and the string turns sharp; pulling burns a grip meter). When two strings
// cross, the one pulling cuts the one that isn't (both pulling: sparks only). The check runs every step while the strings
// stay crossed, so starting to pull mid-cross saws through. Down = STASIS: the kite freezes for 2 s and its string can't
// be cut (cooldown after). Crash into the roofs and you're down too.
// Last kite flying takes the round, first to 2. From 40 s the strings reel in, forcing everyone together.
// Seat draw (3+ players): the middle rooftop has rivals on both sides, so seats are won with rock-paper-scissors
// (Left = rock, Action = paper, Right = scissors) before round 1. A throw with exactly 2 shapes splits a group into
// winners and losers; 1 or 3 shapes is a tie and that group throws again. Ranks 1-2 take the edges.
// Online is host-authoritative (like Sumo Bump): guests send held inputs and their pick; the host sends 20 Hz snapshots.
// Kites move in the x-y plane (a wall of sky), seen side-on.
const L0 = 28, V = 11, VPULL = 19.5, TURN = 2.8, CRASH = 1.4, SHRINK_AT = 40, WINS = 2, MAX_ROUNDS = 5, STEP = 1 / 60;
const STASIS = 2, STASIS_CD = 6;
const PICK_T = 2.5, REVEAL_T = 1.5, SEATS_T = 2;
const ST = ['rps', 'count', 'ready', 'play', 'end', 'done'], F = 12;
const HAND = ['✊', '✋', '✌️'];
const beats = (a, b) => (a - b + 3) % 3 === 1; // paper beats rock, scissors beat paper, rock beats scissors

export function createKite({ renderer, mode, n = 2, me = 0, bots = [], rand, send, label, onEnd }) {
  const online = mode === 'online';
  const IDX = [...Array(n).keys()], GAPX = 15, SEATX = IDX.map(k => (k - (n - 1) / 2) * GAPX);
  let auth = !online || me === 0;
  // seeded gusts per round: [start, length, strength]
  const gusts = Array.from({ length: MAX_ROUNDS }, () => Array.from({ length: 6 }, (_, k) => [4 + k * 7 + rand() * 4, 1.2 + rand(), (rand() < .5 ? -1 : 1) * (3 + rand() * 3)]));

  const scene = new THREE.Scene(), fogC = new THREE.Color(0x3a2a5a);
  scene.background = fogC;
  scene.fog = new THREE.Fog(fogC, 60, 190);
  lights(scene);
  const sky = addSky(scene, fogC, 0xff9a6a);
  addCity(scene, { y: -30, n: 260, x0: -140, x1: 140, z0: 10, z1: -150 });
  const sun = new THREE.Mesh(new THREE.CircleGeometry(10, 48), new THREE.MeshBasicMaterial({ color: 0xffd8a0, toneMapped: false, fog: false }));
  sun.position.set(30, 22, -170); scene.add(sun);

  // rooftops under each seat, with a low parapet and a glowing edge in the owner's colour (set after the draw)
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x241a3a, roughness: .8, metalness: .2 });
  const roofs = IDX.map(() => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(7, 30, 7), roofMat); body.position.y = -15;
    const lip = new THREE.Group(), lipMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }); // glowing rim round the roof edge
    for (const [w, d, x, z] of [[7.2, .16, 0, 3.52], [7.2, .16, 0, -3.52], [.16, 7.2, 3.52, 0], [.16, 7.2, -3.52, 0]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, .35, d), lipMat); b.position.set(x, .17, z); lip.add(b); }
    lip.material = lipMat;
    const win = canvasTex(64, 256, (c, w, h) => { c.fillStyle = '#140e24'; c.fillRect(0, 0, w, h); for (let y = 6; y < h; y += 14) for (let x = 5; x < w; x += 14) { c.fillStyle = Math.random() < .5 ? '#ffc070' : '#2a2050'; c.fillRect(x, y, 8, 8); } });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 29), new THREE.MeshBasicMaterial({ map: win })); face.position.set(0, -15, 3.52);
    g.add(body, lip, face); scene.add(g);
    return { g, lip };
  });

  // kites: diamond sail + spars + a rope-simulated ribbon tail hung from the bottom tip; string = a stretched cylinder
  // from the flyer's hand that thickens and glows while pulling; stasis = a cyan shell round the kite
  const sailGeo = new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0, 1.3), new THREE.Vector2(.95, .15), new THREE.Vector2(0, -1.5), new THREE.Vector2(-.95, .15)]));
  const sparGeo = new THREE.BoxGeometry(.05, 2.8, .05), crossGeo = new THREE.BoxGeometry(1.9, .05, .05).translate(0, .15, 0);
  const strGeo = new THREE.CylinderGeometry(1, 1, 1, 5, 1, true).translate(0, .5, 0), shellGeo = new THREE.IcosahedronGeometry(1.9, 1);
  // cutting edge on the nose while pulling: a spinning white blade + a soft halo in the owner's colour
  const bladeGeo = new THREE.ConeGeometry(.32, 1.2, 4).translate(0, 1.85, .05), bladeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const haloTex = canvasTex(64, 64, (c, w) => { const gr = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, w); });
  const kites = IDX.map(i => {
    const g = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color: COL[i], emissive: COL[i], emissiveIntensity: .45, side: THREE.DoubleSide, roughness: .6 });
    const sail = new THREE.Mesh(sailGeo, mat);
    const spar = new THREE.Mesh(sparGeo, new THREE.MeshStandardMaterial({ color: 0x3a2618 })); spar.position.z = .03;
    const cross = new THREE.Mesh(crossGeo, spar.material); cross.position.z = .03;
    const stripe = new THREE.Mesh(new THREE.CircleGeometry(.32, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, side: THREE.DoubleSide })); stripe.position.set(0, .1, .02);
    g.add(sail, spar, cross, stripe); scene.add(g);
    const TP = 16, tailGeo = new THREE.BufferGeometry(), tcol = new Float32Array(TP * 6), c0 = new THREE.Color(COL[i]), c1 = new THREE.Color(0xffffff);
    for (let j = 0; j < TP; j++) { const c = j % 4 < 2 ? c0 : c1; tcol.set([c.r, c.g, c.b, c.r, c.g, c.b], j * 6); } // colour bands
    tailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TP * 6), 3));
    tailGeo.setAttribute('color', new THREE.BufferAttribute(tcol, 3));
    tailGeo.setIndex([...Array(TP - 1).keys()].flatMap(j => [j * 2, j * 2 + 1, j * 2 + 2, j * 2 + 1, j * 2 + 3, j * 2 + 2]));
    const tail = new THREE.Mesh(tailGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, toneMapped: false })); tail.frustumCulled = false; scene.add(tail);
    const edge = new THREE.Group(), blade = new THREE.Mesh(bladeGeo, bladeMat);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: COL[i], blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    halo.position.set(0, 1.6, .1); edge.add(blade, halo); edge.visible = false; g.add(edge);
    const shell = new THREE.Mesh(shellGeo, new THREE.MeshBasicMaterial({ color: 0x6ff6ff, transparent: true, opacity: .35, depthWrite: false, toneMapped: false })); shell.visible = false; g.add(shell);
    const strMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .7, toneMapped: false });
    const str = new THREE.Mesh(strGeo, strMat); scene.add(str);
    const flyer = makeRunner(COL[i]); flyer.scale.setScalar(1.2);
    const tag = nameTag(label(i), COL[i]); tag.position.y = 2.2; flyer.add(tag); scene.add(flyer);
    const bubTex = canvasTex(128, 128, () => {}), bub = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubTex, transparent: true, depthWrite: false, toneMapped: false }));
    bub.scale.set(3, 3, 1); bub.position.y = 4.4; bub.visible = false; flyer.add(bub);
    return { g, mat, tail, tailGeo, TP, rope: new Float32Array(TP * 2), ropeOk: false, shell, edge, blade, halo, str, strMat, flyer, tag, bub, bubTex, bubS: '', px: 0, py: 10, pa: 0 };
  });
  const burst = new Burst(scene);
  function drawBubble(k, text, col) { // speech bubble over a flyer, redrawn only when it changes
    const K = kites[k], key = text + col;
    if (K.bubS === key) return;
    K.bubS = key;
    const g = K.bubTex.image.getContext('2d');
    g.clearRect(0, 0, 128, 128);
    g.fillStyle = 'rgba(8,12,34,.85)'; g.strokeStyle = '#' + COL[k].toString(16).padStart(6, '0'); g.lineWidth = 6;
    g.beginPath(); g.roundRect(10, 10, 108, 90, 22); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(52, 98); g.lineTo(64, 120); g.lineTo(76, 98); g.fill();
    g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = text.length > 3 ? '900 28px system-ui, sans-serif' : '56px system-ui, "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    g.fillText(text, 64, 57);
    K.bubTex.needsUpdate = true;
  }

  // ---- state
  const S = {
    st: n >= 3 ? 'rps' : 'count', stT: 0, round: 1, T: 0, wind: 0, wins: Array(n).fill(0), cuts: Array(n).fill(0), surv: Array(n).fill(0),
    seat: IDX.slice(), // seat[i] = seat index of player i (0 = leftmost)
    k: IDX.map(() => ({ x: 0, y: 10, a: 0, m: 1, pull: 0, alive: 1, vx: 0, vy: 0, spin: 0, cutN: 0, crashN: 0, st: 0, cd: 0, blk: 0 })),
    R: { ph: 'pick', t: -2, groups: [IDX.slice()], picks: {}, shown: IDX.map(() => -1), msg: '', bot: IDX.map(() => .4 + Math.random() * 1.4) }, // t starts at -2: the first throw gets 2 s extra to find the keys
    pairs: {},
  };
  const inp = IDX.map(() => ({ l: 0, r: 0, p: 0, s: 0 }));
  const ctrl = new Set(online ? [me] : IDX), ai = new Set(), brain = IDX.map(i => ({ tgt: (i + 1) % n }));
  let myPick = -1; // this device's own pick, shown on its own flyer before the reveal

  const panes = (online ? [me] : IDX).map(pi => {
    const v = makePane(pi, label, zones('↺', '🪁', '↻') + '<div class="kdown">❄</div><div class="kgrip hide"><i></i></div><div class="kgrip kst hide"><i></i></div>');
    v.chips = rankChips(v, n, label);
    v.grip = v.q('.kgrip'); v.gripI = v.q('.kgrip i'); v.stb = v.q('.kst'); v.stI = v.q('.kst i');
    v.cam = new THREE.PerspectiveCamera(55, 1, .1, 400); v.fov = 55; v.cp = new THREE.Vector3(0, 12, 40); v.look = new THREE.Vector3(0, 12, 0); v.s = {};
    return v;
  });
  const paneOf = i => panes.find(v => v.pi === i);
  const shown = i => !!paneOf(i);
  const chips = () => panes.forEach(v => v.chips(IDX.map(i => `★${S.wins[i]} ✂${S.cuts[i]}`)));
  let step = S.st === 'count' ? countdown(panes) : () => false;
  const ax = i => SEATX[S.seat[i]];

  function place() {
    IDX.forEach(i => {
      const side = Math.sign(ax(i)) || (i ? 1 : -1);
      Object.assign(S.k[i], { x: ax(i) + side * 4, y: 12, a: side * .45, m: 1, pull: 0, alive: 1, vx: 0, vy: 0, spin: 0, st: 0, cd: 0 });
      if (ai.has(i)) inp[i].p = inp[i].s = 0; // a human still holding Pull keeps pulling at GO
    });
    Object.assign(S, { T: 0, pairs: {} });
  }
  function roundStart(first) {
    place();
    S.st = first ? 'count' : 'ready'; S.stT = 0;
    if (first) step = countdown(panes);
    panes.forEach(v => { v.hint.textContent = coarse ? t('kiteTouch') : t('kiteKeys', keyHint(v.pi, online)); v.hint.classList.remove('hide'); if (!first) flash(v.msg, t('sumoRound', { n: S.round })); });
    chips();
  }

  // ---- seat draw (authority)
  function rpsStep(dt) {
    const R = S.R, active = R.groups.filter(g => g.length > 1).flat();
    R.t += dt;
    if (R.ph === 'pick') {
      active.forEach(i => { if (ai.has(i) && ctrl.has(i) && R.picks[i] == null && R.t > R.bot[i]) R.picks[i] = Math.random() * 3 | 0; });
      if (R.t < PICK_T && !active.every(i => R.picks[i] != null)) return;
      active.forEach(i => { // no throw in time: random, and the slowpoke is told
        if (R.picks[i] != null) return;
        R.picks[i] = Math.random() * 3 | 0;
        const v = panes.find(v => v.pi === i);
        if (v && !ai.has(i)) flash(v.msg, t('kiteRandom'), 'miss');
      });
      const out = [], msgs = [];
      for (const g of R.groups) {
        if (g.length === 1) { out.push(g); continue; }
        const set = [...new Set(g.map(i => R.picks[i]))];
        if (set.length !== 2) { out.push(g); msgs.push('tie'); continue; }
        const win = beats(set[0], set[1]) ? set[0] : set[1];
        out.push(g.filter(i => R.picks[i] === win), g.filter(i => R.picks[i] !== win));
        msgs.push(String(win));
      }
      R.shown = IDX.map(i => R.picks[i] ?? -1);
      Object.assign(R, { groups: out, picks: {}, msg: msgs.join(','), ph: 'reveal', t: 0, bot: IDX.map(() => .4 + Math.random() * 1.4) });
    } else if (R.ph === 'reveal' && R.t > REVEAL_T) {
      R.shown = IDX.map(() => -1);
      if (R.groups.some(g => g.length > 1)) { R.ph = 'pick'; R.t = 0; return; }
      // ranks 1-2 take the edge seats, the rest the middle ones (left to right)
      const order = [0, n - 1, ...IDX.slice(1, n - 1)];
      R.groups.flat().forEach((i, r) => { S.seat[i] = order[r]; });
      R.ph = 'seats'; R.t = 0;
    } else if (R.ph === 'seats' && R.t > SEATS_T) roundStart(true);
  }

  // ---- simulation (authority)
  function think(i) { // AI: sweep your string across a rival's from above; pull when close; climb when low
    const k = S.k[i], b = brain[i], io = inp[i];
    let e = S.k[b.tgt];
    if (!e || !e.alive || b.tgt === i) { b.tgt = IDX.find(j => j !== i && S.k[j].alive) ?? i; e = S.k[b.tgt]; }
    let want = 0, near = false;
    // stasis when a pulling rival's kite is about to meet our string (not instant: ~0.5 s reaction)
    io.s = k.cd <= 0 && !k.pull && IDX.some(j => j !== i && S.k[j].alive && S.k[j].pull && segDist(S.k[j].x, S.k[j].y, ax(i), 0, k.x, k.y) < 4) && Math.random() < .03 ? 1 : 0;
    if (b.tgt !== i) {
      const ex = ax(b.tgt), tx = ex + (e.x - ex) * .6, ty = (e.y) * .6 + 3.4;
      want = Math.atan2(tx - k.x, ty - k.y);
      near = segDist(k.x, k.y, ex, 0, e.x, e.y) < 5.5;
    }
    if (k.y < 8 || (k.y < 15 && Math.cos(k.a) < .3)) want = k.x < ax(i) ? .3 : -.3; // pull up early: a full turn needs ~13 m
    const d = Math.atan2(Math.sin(want - k.a), Math.cos(want - k.a));
    io.l = d < -.12 ? 1 : 0; io.r = d > .12 ? 1 : 0;
    io.p = near && k.m > .25 && S.T > 3 ? 1 : 0;
  }
  const segDist = (px, py, ax0, ay0, bx, by) => { const dx = bx - ax0, dy = by - ay0, tt = Math.max(0, Math.min(1, ((px - ax0) * dx + (py - ay0) * dy) / (dx * dx + dy * dy || 1))); return Math.hypot(px - ax0 - dx * tt, py - ay0 - dy * tt); };
  const cross = (px, py, qx, qy, rx, ry) => (qx - px) * (ry - py) - (qy - py) * (rx - px);
  function segHit(a0x, a0y, a1x, a1y, b0x, b0y, b1x, b1y) {
    const d1 = cross(b0x, b0y, b1x, b1y, a0x, a0y), d2 = cross(b0x, b0y, b1x, b1y, a1x, a1y), d3 = cross(a0x, a0y, a1x, a1y, b0x, b0y), d4 = cross(a0x, a0y, a1x, a1y, b1x, b1y);
    if (d1 * d2 >= 0 || d3 * d4 >= 0) return null;
    const f = d1 / (d1 - d2); return [a0x + (a1x - a0x) * f, a0y + (a1y - a0y) * f];
  }
  const windAt = T => { let w = Math.sin(T * .35) * 2.2; for (const [s0, len, str] of gusts[(S.round - 1) % MAX_ROUNDS]) if (T >= s0 && T < s0 + len) w += str; return w; };

  function sim(dt) {
    S.stT += dt;
    if (S.st === 'rps') { rpsStep(dt); return; }
    if (S.st === 'ready' && S.stT > 1.4) { S.st = 'play'; S.stT = 0; }
    if (S.st === 'end' && S.stT > 2.6) {
      if (Math.max(...S.wins) >= WINS || S.round >= MAX_ROUNDS) { S.st = 'done'; return; }
      S.round++; roundStart(false); return;
    }
    const play = S.st === 'play';
    if (play) S.T += dt;
    S.wind = windAt(S.T);
    const L = L0 - Math.max(0, S.T - SHRINK_AT) * .4;
    for (const i of IDX) {
      const k = S.k[i], io = inp[i];
      if (!k.alive) { k.vx += (S.wind * 1.6 - k.vx) * dt; k.vy -= 3 * dt; k.x += k.vx * dt; k.y += k.vy * dt; k.spin += dt * 4; continue; }
      if (!play) continue;
      if (ai.has(i) && ctrl.has(i)) think(i);
      k.cd = Math.max(0, k.cd - dt);
      if (io.s && k.cd <= 0) { k.st = STASIS; k.cd = STASIS + STASIS_CD; }
      if (k.st > 0) { k.st = Math.max(0, k.st - dt); k.pull = 0; k.m = Math.min(1, k.m + dt * .22); S.surv[i] += dt; continue; } // frozen in place
      k.a += (io.r - io.l) * TURN * dt;
      k.pull = io.p && k.m > .02 ? 1 : 0;
      k.m = k.pull ? Math.max(0, k.m - dt * .55) : Math.min(1, k.m + dt * .22);
      const sp = k.pull ? VPULL : V;
      k.x += (Math.sin(k.a) * sp + S.wind) * dt; k.y += Math.cos(k.a) * sp * dt;
      const dx = k.x - ax(i), dy = k.y, d = Math.hypot(dx, dy);
      if (d > L) { k.x = ax(i) + dx / d * L; k.y = dy / d * L; }
      k.y = Math.min(k.y, 40);
      S.surv[i] += dt;
      if (k.y < CRASH) { k.alive = 0; k.vx = 0; k.vy = -2; k.crashN++; }
    }
    if (play) for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { // string crossings
      const a = S.k[i], b = S.k[j], key = i * 8 + j;
      if (!a.alive || !b.alive) continue;
      const hit = segHit(ax(i), 0, a.x, a.y, ax(j), 0, b.x, b.y);
      if (!hit) { delete S.pairs[key]; continue; }
      // checked every step while crossed, from either side: the one pulling cuts the one that is neither pulling nor in stasis
      const cut = a.pull && !b.pull && !b.st ? j : b.pull && !a.pull && !a.st ? i : -1;
      if (cut >= 0) { const c = S.k[cut], by = cut === i ? j : i; c.alive = 0; c.st = 0; c.vx = S.wind; c.vy = 1.5; c.cutN++; S.cuts[by]++; c.by = by; c.hx = hit[0]; c.hy = hit[1]; delete S.pairs[key]; continue; }
      const fresh = S.pairs[key] == null; S.pairs[key] = (S.pairs[key] ?? 0) - dt;
      if (fresh || ((a.pull || b.pull) && S.pairs[key] <= 0)) { // sparks on contact, then every 0.35 s while someone saws in vain
        S.pairs[key] = .35; a.spark = (a.spark ?? 0) + 1; a.hx = hit[0]; a.hy = hit[1];
        for (const [x, y] of [[a, b], [b, a]]) if (x.st && y.pull) x.blk++;
      }
    }
    if (play) {
      const alive = IDX.filter(i => S.k[i].alive);
      if (alive.length <= 1) { if (alive.length) S.wins[alive[0]]++; S.st = 'end'; S.stT = 0; }
    }
  }

  // ---- networking
  const q2 = v => Math.round(v * 100) / 100;
  let acc = 0, sendAcc = 0;
  function snapshot() {
    const kk = [];
    S.k.forEach(k => kk.push(q2(k.x), q2(k.y), q2(k.a), q2(k.m), k.pull, k.alive, k.cutN, k.crashN, k.spark ?? 0, q2(k.st), q2(k.cd), k.blk));
    const R = S.R;
    send({ t: 'ks', from: 0, st: ST.indexOf(S.st), r: S.round, T: q2(S.T), wd: q2(S.wind), w: S.wins, c: S.cuts, sv: S.surv.map(q2), seat: S.seat, k: kk,
      rp: [R.ph === 'pick' ? 0 : R.ph === 'reveal' ? 1 : 2, q2(R.t)], rg: R.groups, rs: R.shown, rk: IDX.map(i => (R.picks[i] != null ? 1 : 0)), rm: R.msg });
  }
  const num = x => typeof x === 'number' && Number.isFinite(x);
  const arr = (a, len) => Array.isArray(a) && (len == null || a.length === len) && a.every(num);
  let rk = IDX.map(() => 0);
  function applySnap(m) {
    const st = ST[m.st];
    if (st === 'count' && S.st !== 'count') step = countdown(panes);
    if (st === 'ready' && S.st !== 'ready') panes.forEach(v => flash(v.msg, t('sumoRound', { n: m.r })));
    S.k.forEach((k, i) => {
      const a = m.k.slice(i * F, i * F + F);
      Object.assign(k, { x: a[0], y: a[1], a: a[2], m: a[3], pull: a[4], alive: a[5], cutN: a[6], crashN: a[7], spark: a[8], st: a[9], cd: a[10], blk: a[11] });
      if (!k.alive) { k.vx = m.wd; k.vy = -2; }
    });
    const R = S.R, ph = ['pick', 'reveal', 'seats'][m.rp[0]] ?? 'pick';
    if (ph === 'reveal' && R.ph === 'pick' && myPick < 0 && R.groups.some(g => g.length > 1 && g.includes(me))) panes.forEach(v => { if (v.pi === me) flash(v.msg, t('kiteRandom'), 'miss'); });
    if (ph === 'pick' && R.ph !== 'pick') myPick = -1;
    Object.assign(R, { ph, t: m.rp[1], groups: m.rg, shown: m.rs, msg: m.rm });
    rk = m.rk;
    Object.assign(S, { st, round: m.r, T: m.T, wind: m.wd, wins: m.w.slice(), cuts: m.c.slice(), surv: m.sv.slice(), seat: m.seat.slice() });
  }
  function onNet(m) {
    if (!m || typeof m.t !== 'string') return;
    const i = m.from;
    if (auth) {
      if (!Number.isInteger(i) || i < 1 || i >= n || ctrl.has(i)) return;
      if (m.t === 'ki') { inp[i].l = m.l ? 1 : 0; inp[i].r = m.r ? 1 : 0; inp[i].p = m.p ? 1 : 0; inp[i].s = m.s ? 1 : 0; }
      else if (m.t === 'kp' && [0, 1, 2].includes(m.v) && S.st === 'rps' && S.R.ph === 'pick' && S.R.picks[i] == null && S.R.groups.some(g => g.length > 1 && g.includes(i))) S.R.picks[i] = m.v;
    } else if (m.t === 'ks' && i === 0 && Number.isInteger(m.st) && ST[m.st] && Number.isInteger(m.r) && num(m.T) && num(m.wd) && arr(m.w, n) && arr(m.c, n) && arr(m.sv, n)
      && arr(m.seat, n) && m.seat.every(s => s >= 0 && s < n) && arr(m.k, n * F) && arr(m.rp, 2) && Array.isArray(m.rg) && m.rg.every(g => arr(g) && g.every(x => x >= 0 && x < n))
      && arr(m.rs, n) && arr(m.rk, n) && typeof m.rm === 'string') applySnap(m);
  }

  // ---- input
  const KEY = { L: 'l', R: 'r', A: 'p', D: 's' };
  const sync = pi => { if (!auth) send({ t: 'ki', from: pi, l: inp[pi].l, r: inp[pi].r, p: inp[pi].p, s: inp[pi].s }); };
  const act = (pi, a) => {
    if (!ctrl.has(pi) || ai.has(pi)) return;
    if (S.st === 'rps') { // throw: Left rock, Action paper, Right scissors
      inp[pi][KEY[a]] = 1; sync(pi); // still held when the draw ends: it steers / pulls straight away
      if (a === 'D') return;
      const R = S.R, v = a === 'L' ? 0 : a === 'A' ? 1 : 2;
      if (R.ph !== 'pick' || !R.groups.some(g => g.length > 1 && g.includes(pi))) return;
      if (auth) { if (R.picks[pi] == null) { R.picks[pi] = v; sfx.click(); } }
      else if (myPick < 0) { myPick = v; send({ t: 'kp', from: pi, v }); sfx.click(); }
      return;
    }
    inp[pi][KEY[a]] = 1; sync(pi);
  };
  const release = (pi, a) => {
    if (!ctrl.has(pi) || ai.has(pi)) return;
    inp[pi][KEY[a]] = 0; sync(pi);
  };
  const unbind = bindInput({ cv: renderer.domElement, panes, n, online, me, act, release, down: true });

  // ---- match end
  const sc = makeShowcase(panes, label, onEnd);
  let ended = false, champ = 0;
  function finish() {
    if (ended) return;
    ended = true;
    const order = [...IDX].sort((a, b) => S.wins[b] - S.wins[a] || S.cuts[b] - S.cuts[a] || S.surv[b] - S.surv[a]);
    const key = i => [S.wins[i], S.cuts[i], S.surv[i]];
    const draw = key(order[0]).every((v, k) => v === key(order[1])[k]);
    champ = order[0];
    sc.start({ order, draw, scores: IDX.map(i => t('kiteScore', { w: S.wins[i], c: S.cuts[i] })) }, () => kites[champ].flyer.position, { r: 6, h: 2.6, look: 1.6 });
  }

  // ---- feedback from state changes (same path on host and guests)
  let prev = null;
  function events() {
    const cur = { st: S.st, k: S.k.map(k => ({ alive: k.alive, cutN: k.cutN, crashN: k.crashN, spark: k.spark ?? 0, st: k.st > 0, blk: k.blk })), wins: S.wins.slice(), rph: S.R.ph, msg: S.R.msg };
    if (prev) {
      IDX.forEach(i => {
        const a = prev.k[i], b = cur.k[i], k = S.k[i], v = paneOf(i);
        if (b.cutN > a.cutN) {
          const by = S.cuts.findIndex((c, j) => j !== i && c > (prev.cuts?.[j] ?? 0));
          burst.emit(k.hx ?? k.x, k.hy ?? k.y, 0, COL[by >= 0 ? by : i], 30, 6);
          if (v) { flash(v.msg, t('kiteCut'), 'hit'); sfx.fall(); buzz(60); }
          if (by >= 0 && paneOf(by)) { flash(paneOf(by).msg, t('kiteCutter'), 'perfect'); sfx.perfect(); }
          if (!v && !(by >= 0 && paneOf(by))) sfx.crack();
        }
        if (b.crashN > a.crashN) { burst.emit(k.x, 1, 0, COL[i], 24, 5); if (v) { flash(v.msg, t('kiteCrash'), 'hit'); sfx.fall(); } }
        if (b.st && !a.st && v) { flash(v.msg, t('kiteStasis'), 'boost'); sfx.click(); }
        if (b.blk > a.blk) { burst.emit(k.x, k.y, 0, 0x6ff6ff, 16, 4); if (v) flash(v.msg, t('kiteBlock'), 'perfect'); }
        if (b.spark > a.spark) { burst.emit(k.hx ?? k.x, k.hy ?? k.y, 0, 0xffd23f, 12, 4); sfx.bump(); }
      });
      if (prev.st === 'play' && cur.st === 'end') {
        const w = IDX.find(i => cur.wins[i] > prev.wins[i]);
        panes.forEach(v => flash(v.msg, w != null ? t('kiteTakes', { p: label(w) }) : t('sumoNoRound'), w === v.pi ? 'go' : ''));
        if (w != null && shown(w)) sfx.finish();
        chips();
      }
      if (cur.rph === 'reveal' && prev.rph !== 'reveal') {
        const tie = cur.msg.split(',').includes('tie'), w = cur.msg.split(',').find(x => x !== 'tie');
        panes.forEach(v => flash(v.msg, w != null ? t('kiteRpsWins', { h: HAND[+w] }) : t('kiteRpsTie'), w != null ? 'go' : ''));
        tie && w == null ? sfx.decoy() : sfx.signal();
      }
      if (cur.rph === 'seats' && prev.rph !== 'seats') { panes.forEach(v => flash(v.msg, S.seat[v.pi] === 0 || S.seat[v.pi] === n - 1 ? t('kiteEdge') : t('kiteMid'), S.seat[v.pi] === 0 || S.seat[v.pi] === n - 1 ? 'boost' : 'hit')); sfx.turn(); }
    }
    cur.cuts = S.cuts.slice();
    prev = cur;
  }

  // ---- frame
  let time = 0, lastSt = S.st;
  const clouds = Array.from({ length: 14 }, () => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8).scale(6 + Math.random() * 6, 1.4 + Math.random(), 2), new THREE.MeshBasicMaterial({ color: 0xffd0c0, transparent: true, opacity: .22, depthWrite: false, fog: false }));
    m.position.set((Math.random() - .5) * 200, 18 + Math.random() * 28, -30 - Math.random() * 60); scene.add(m); return m;
  });
  const tmp = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3();
  function update(dt) {
    time += dt;
    if (S.st === 'count' && !step(dt) && auth) { S.st = 'play'; S.stT = 0; }
    if (S.st === 'play') panes.forEach(v => v.hint.classList.add('hide'));
    if (auth && S.st !== 'done') {
      acc = Math.min(acc + dt, .25);
      while (acc >= STEP) { acc -= STEP; sim(STEP); }
      if (online && (sendAcc += dt) >= .05) { sendAcc = 0; snapshot(); }
    } else if (!auth) S.k.forEach(k => { if (!k.alive) { k.x += k.vx * dt; k.y += k.vy * dt; k.spin += dt * 4; } });
    if (S.st === 'done') { if (auth && online && lastSt !== 'done') snapshot(); finish(); }
    lastSt = S.st;
    events();

    clouds.forEach(c => { c.position.x += (1.2 + S.wind * .4) * dt; if (c.position.x > 110) c.position.x = -110; });
    roofs.forEach((r, s) => { r.g.position.set(SEATX[s], 0, 0); const owner = S.st === 'rps' && S.R.ph !== 'seats' ? -1 : S.seat.indexOf(s); r.lip.material.color.setHex(owner >= 0 ? COL[owner] : 0xffffff); });

    const R = S.R, active = R.groups.filter(g => g.length > 1).flat();
    IDX.forEach(i => {
      const k = S.k[i], K = kites[i], fx = ax(i), inRps = S.st === 'rps';
      // smooth toward the sim (host) or the snapshot (guests)
      const f = Math.min(1, dt * (auth ? 60 : 14));
      K.px += (k.x - K.px) * f; K.py += (k.y - K.py) * f; K.pa += Math.atan2(Math.sin(k.a - K.pa), Math.cos(k.a - K.pa)) * f;
      const flyX = inRps && R.ph !== 'seats' ? SEATX[i] : fx;
      K.flyer.position.x += (flyX - K.flyer.position.x) * Math.min(1, dt * 4); K.flyer.position.y = 0; K.flyer.position.z = 1.5;
      const u = K.flyer.userData;
      animRunner(K.flyer, time * 2 + i, 0);
      u.armL.rotation.x = u.armR.rotation.x = -2.4 + (k.pull ? .6 : 0) + Math.sin(time * 3 + i) * .05; u.body.rotation.x = k.pull ? .25 : .05;
      // speech bubble during the seat draw
      K.bub.visible = inRps;
      if (inRps) {
        if (R.ph === 'seats') { const edge = S.seat[i] === 0 || S.seat[i] === n - 1; drawBubble(i, edge ? t('kiteEdgeChip') : t('kiteMidChip'), edge ? '#3dff9a' : '#ffa53a'); }
        else if (R.ph === 'reveal' && R.shown[i] >= 0) drawBubble(i, HAND[R.shown[i]], '#fff');
        else if (!active.includes(i)) drawBubble(i, `#${R.groups.flat().indexOf(i) + 1}`, '#ffd23f');
        else if (online && i === me && (auth ? R.picks[i] != null : myPick >= 0)) drawBubble(i, HAND[auth ? R.picks[i] : myPick], '#fff'); // own phone only: a shared screen shows ✓
        else drawBubble(i, (auth ? R.picks[i] != null : rk[i]) ? '✓' : '?', '#fff');
      }
      const flying = !inRps && (k.alive || k.y > -30);
      K.g.visible = flying; K.tail.visible = flying; K.str.visible = !inRps && !!k.alive;
      if (!flying) { K.ropeOk = false; return; }
      const rot = k.alive ? -K.pa : k.spin, stas = k.alive && k.st > 0;
      K.g.position.set(K.px, K.py, 0);
      K.g.rotation.set(0, 0, rot);
      K.mat.emissiveIntensity = stas ? .2 : k.pull ? 1.1 : .45;
      K.shell.visible = stas;
      K.edge.visible = k.alive && !!k.pull;
      if (K.edge.visible) { K.blade.rotation.y = time * 18; K.halo.scale.setScalar(2.6 + Math.sin(time * 30) * .4); K.halo.material.opacity = .75 + Math.sin(time * 23) * .2; }
      if (stas) { K.shell.rotation.set(time * .7, time, 0); K.shell.scale.setScalar(1 + Math.sin(time * 14) * .04); K.shell.material.opacity = k.st < .5 && Math.sin(time * 40) > 0 ? .12 : .35; }
      // tail: a rope hung from the sail's bottom tip (local 0,-1.5); each link falls + drifts, then is pulled back to
      // SEG from the one before it, so it trails behind the kite's motion and always stays attached
      const P = K.rope, SEG = .24, tx = K.px + Math.sin(rot) * 1.5, ty = K.py - Math.cos(rot) * 1.5;
      if (!K.ropeOk || Math.hypot(P[0] - tx, P[1] - ty) > 6) { for (let j = 0; j < K.TP; j++) { P[j * 2] = tx; P[j * 2 + 1] = ty - j * SEG; } K.ropeOk = true; }
      P[0] = tx; P[1] = ty;
      for (let j = 1; j < K.TP; j++) {
        const x = P[j * 2] + (S.wind * .5 + Math.sin(time * 7 + j * .7) * 1.2) * dt, y = P[j * 2 + 1] - 3 * dt;
        const dx = x - P[j * 2 - 2], dy = y - P[j * 2 - 1], d = Math.hypot(dx, dy) || 1;
        P[j * 2] = P[j * 2 - 2] + dx / d * SEG; P[j * 2 + 1] = P[j * 2 - 1] + dy / d * SEG;
      }
      const tp = K.tailGeo.attributes.position;
      for (let j = 0; j < K.TP; j++) { // ribbon: two verts per link, across the rope, tapering to the end
        const a0 = Math.max(0, j - 1), a1 = Math.min(K.TP - 1, j + 1), dx = P[a1 * 2] - P[a0 * 2], dy = P[a1 * 2 + 1] - P[a0 * 2 + 1], d = Math.hypot(dx, dy) || 1;
        const w = .15 * (1 - j / K.TP * .6), nx = -dy / d * w, ny = dx / d * w, x = P[j * 2], y = P[j * 2 + 1];
        tp.setXYZ(j * 2, x + nx, y + ny, -.03); tp.setXYZ(j * 2 + 1, x - nx, y - ny, -.03);
      }
      tp.needsUpdate = true;
      // string: flyer's right hand → kite
      if (k.alive) {
        K.flyer.updateMatrixWorld(true); K.flyer.userData.elbowR.localToWorld(tmp.set(0, -.3, 0));
        dir.set(K.px - tmp.x, K.py - tmp.y, -tmp.z);
        const len = dir.length();
        K.str.position.copy(tmp); K.str.quaternion.setFromUnitVectors(up, dir.normalize());
        const w = k.pull ? .07 : .03; K.str.scale.set(w, len, w);
        K.strMat.color.setHex(stas ? 0x6ff6ff : k.pull ? COL[i] : 0xffffff); K.strMat.opacity = k.pull || stas ? 1 : .6;
      }
    });

    panes.forEach(v => {
      const s = v.s, P = S.k[v.pi];
      const wv = `${S.wind >= 0 ? '→' : '←'} ${Math.round(Math.abs(S.wind) * 3.6)} km/h`;
      const tv = S.st === 'rps' ? t('kiteDraw') + (S.R.ph === 'pick' ? ` ${Math.max(0, Math.ceil(PICK_T - S.R.t))}` : '') : `${t('sumoRound', { n: S.round })} · ${wv}`;
      if (s.tv !== tv) { s.tv = tv; v.val.textContent = tv; }
      v.grip.classList.toggle('hide', S.st !== 'play' || !P.alive);
      v.grip.classList.toggle('low', P.m < .3);
      v.gripI.style.transform = `scaleX(${P.m.toFixed(3)})`;
      // stasis bar: drains while frozen, then refills over the cooldown; bright when ready
      v.stb.classList.toggle('hide', S.st !== 'play' || !P.alive);
      v.stb.classList.toggle('ready', P.cd <= 0);
      v.stI.style.transform = `scaleX(${(P.st > 0 ? P.st / STASIS : 1 - Math.max(0, P.cd - STASIS) / STASIS_CD).toFixed(3)})`;
    });
    burst.update(dt);
    sc.update(dt);
  }

  function resize() {
    layout(panes);
    for (const v of panes) { v.cam.aspect = v.w / v.h; v.fov = fitFov(v.cam.aspect, 34, 50, 100); }
  }

  function render() {
    renderPanes(renderer, scene, panes, v => {
      const c = v.cam, K = kites[v.pi], k = 1 - Math.exp(-(1 / 60) * 3);
      if (sc.on) { sc.cam(v, c, v.fov); sky.position.copy(c.position); return c; }
      if (S.st === 'rps') { // the rooftops, close, for the draw
        v.cp.lerp(tmp.set(0, 5, 18 + n * 4), k * 2); v.look.lerp(tmp.set(0, 2.5, 0), k * 2);
      } else { // side-on, framing your flyer and your kite
        const kx = S.k[v.pi].alive ? K.px : ax(v.pi), mx = (ax(v.pi) + kx) / 2;
        v.cp.lerp(tmp.set(mx * .8, 14, 36), k * 2); v.look.lerp(tmp.set(mx * .8, 14, 0), k * 2);
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
    if (local && i === 0 && !auth) auth = true; // host gone: carry on from the last snapshot
    kites[i].tag.userData.set(label(i));
    chips();
  }

  function dispose() {
    unbind();
    panes.forEach(v => v.el.remove());
    document.body.classList.remove('split-v');
    disposeScene(scene);
  }

  place();
  if (S.st === 'count') roundStart(true);
  else panes.forEach(v => { v.hint.textContent = t('kiteRpsHint'); v.hint.classList.remove('hide'); });
  IDX.forEach(i => { kites[i].px = S.k[i].x; kites[i].py = S.k[i].y; kites[i].flyer.position.x = SEATX[i]; });
  chips();
  resize();
  bots.forEach(i => botify(i, me === 0));
  return { update, render, resize, onNet, dispose, botify };
}
