import * as THREE from 'three';
import { sfx, holdMusic } from './audio.js';
import { t } from './i18n.js';
import { COL, canvasTex, disposeScene, flash, buzz, Burst } from './fx.js';
import { coarse, keyHint, zones, makePane, rankChips, layout, fitFov, renderPanes, bindInput, countdown, makeShowcase, addSky, lights, makeRunner, animRunner, placeRunner, nameTag } from './stage.js';

// Musical Chairs: everyone jogs clockwise round a ring of chairs (one fewer than players) while a D Dorian tune plays.
// When the music cuts, Action dives for the nearest free chair; the one left standing is out (2 players: 1 chair,
// first to 3 seats). Diving while the music plays is a false start (2 s stun); a held note (fermata) fakes a stop.
// Nobody overtakes: hustling (Right) into the runner ahead shoves them along; Left eases off.
// The stop / fermata times come from the match seed. Online is host-authoritative (like Sumo Bump): guests send
// input, the host broadcasts snapshots at 20 Hz. Every device plays the tune itself from the snapshot's music clock.
const RING = 6, CR = 2.7, W0 = .7, GAP = .36, DIVE_T = .34, FALSE_STUN = 2, BOUNCE_STUN = .7, STOP_MAX = 6;
const BEAT = .28, WINS2 = 3, STEP = 1 / 60;
const ST = ['count', 'ready', 'music', 'stop', 'result', 'done'], MODES = ['run', 'dive', 'seat', 'stun', 'out'], F = 9;
// [degree, beats]: 8 bars of 4 beats, long notes on the bar ends; 12 = B5, the Dorian 6th
const MEL = [[7, 1], [9, 1], [11, 2], [9, 1], [7, 1], [5, 2], [4, 1], [5, 1], [7, 2], [12, 2], [11, 2], [9, 1], [7, 1], [5, 1], [4, 1],
  [3, 2], [4, 2], [5, 1], [4, 1], [2, 1], [4, 1], [7, 4]];
const NOTES = []; { let b = 0; for (const [d, l] of MEL) { NOTES.push({ b, d, l }); b += l; } }
const LOOP = 32; // beats

export function createChairs({ renderer, mode, n = 2, me = 0, bots = [], rand, send, label, onEnd }) {
  const online = mode === 'online';
  const IDX = [...Array(n).keys()], duel = n === 2;
  let auth = !online || me === 0;
  // seeded per round: music stop (seconds of music) and the fake-stop fermata before it
  const plan = Array.from({ length: 12 }, () => { const stop = 6 + rand() * 4.5; return { stop, ferm: 2.2 + rand() * (stop - 4.4) }; });

  const scene = new THREE.Scene(), fogC = new THREE.Color(0x120a24);
  scene.background = fogC;
  scene.fog = new THREE.Fog(fogC, 22, 70);
  lights(scene);
  const sky = addSky(scene, fogC, 0x5a1a6c);

  // ---- ballroom: parquet disc, rug, equalizer ring, spotlight cone and a mirror ball
  const parquet = canvasTex(512, 512, (g, w) => {
    g.fillStyle = '#4a2c1a'; g.fillRect(0, 0, w, w);
    for (let y = 0; y < w; y += 32) for (let x = (y / 32 % 2) * 48; x < w + 96; x += 96) {
      g.fillStyle = `hsl(${24 + Math.random() * 8}, ${40 + Math.random() * 15}%, ${22 + Math.random() * 10}%)`;
      g.fillRect(x - 96, y, 94, 30);
    }
  });
  parquet.wrapS = parquet.wrapT = THREE.RepeatWrapping; parquet.repeat.set(3, 3);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(11, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: parquet, roughness: .35, metalness: .15 }));
  scene.add(floor);
  const edge = new THREE.Mesh(new THREE.TorusGeometry(11, .08, 8, 96).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffd23f, toneMapped: false }));
  edge.position.y = .05; scene.add(edge);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(CR + 1.2, 48).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x6a1030, roughness: .9 }));
  rug.position.y = .01; scene.add(rug);
  const lane = new THREE.Mesh(new THREE.RingGeometry(RING - .5, RING + .5, 96).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .05, depthWrite: false }));
  lane.position.y = .015; scene.add(lane);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(11, 11.4, 1, 64, 1, true), new THREE.MeshStandardMaterial({ color: 0x1a0c24, roughness: .6, side: THREE.DoubleSide }));
  base.position.y = -.5; scene.add(base);

  const EQ = 48, EQR = 18, eqGeo = new THREE.BoxGeometry(.7, 1, .7).translate(0, .5, 0); // light bars ringing the hall, out past the cameras
  const eqMat = new THREE.MeshBasicMaterial({ color: 0xb98cff, toneMapped: false });
  const eq = new THREE.InstancedMesh(eqGeo, eqMat, EQ);
  scene.add(eq);
  const eqH = new Float32Array(EQ), M4 = new THREE.Matrix4();

  const coneMat = new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: .09, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  const cone = new THREE.Mesh(new THREE.ConeGeometry(4.5, 14, 32, 1, true).translate(0, -7, 0), coneMat);
  cone.position.y = 14; scene.add(cone);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(4.2, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: .12, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  pool.position.y = .02; scene.add(pool);
  const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(.9, 2), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: .08, flatShading: true, envMapIntensity: 1.6 }));
  ball.position.y = 9; scene.add(ball);
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, 8), new THREE.MeshBasicMaterial({ color: 0x444466 })); wire.position.y = 13; scene.add(wire);
  const GOLD = new THREE.Color(0xffd23f), RED = new THREE.Color(0xff3a5a), VIOLET = new THREE.Color(0xb98cff);

  // chairs: lacquered wood, a gold ring on the floor marks the free ones after the music stops
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xc98b3a, roughness: .35, metalness: .2 }), cushMat = new THREE.MeshStandardMaterial({ color: 0xa01840, roughness: .7 });
  const seatGeo = new THREE.BoxGeometry(1, .14, 1), backGeo = new THREE.BoxGeometry(1, 1.1, .12), legGeo = new THREE.CylinderGeometry(.05, .05, .55, 8), cushGeo = new THREE.BoxGeometry(.86, .08, .86);
  const ringGeo = new THREE.TorusGeometry(.95, .06, 8, 40).rotateX(Math.PI / 2);
  const chairMeshes = Array.from({ length: 3 }, () => {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(seatGeo, woodMat); seat.position.y = .55;
    const cush = new THREE.Mesh(cushGeo, cushMat); cush.position.y = .66;
    const back = new THREE.Mesh(backGeo, woodMat); back.position.set(0, 1.15, .45); // backrest on the inner side: sit facing out
    g.add(seat, cush, back);
    for (const [x, z] of [[-.42, -.42], [.42, -.42], [-.42, .42], [.42, .42]]) { const l = new THREE.Mesh(legGeo, woodMat); l.position.set(x, .27, z); g.add(l); }
    const rm = new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
    const ring = new THREE.Mesh(ringGeo, rm); ring.position.y = .03; g.add(ring);
    g.visible = false; scene.add(g);
    return { g, rm };
  });

  // runners
  const starGeo = new THREE.OctahedronGeometry(.1), starMat = new THREE.MeshBasicMaterial({ color: 0xffd23f, toneMapped: false });
  const runners = IDX.map(i => {
    const r = makeRunner(COL[i]); r.scale.setScalar(.9);
    const tag = nameTag(label(i), COL[i]); tag.position.y = 2.3; r.add(tag);
    const stars = new THREE.Group(); stars.position.y = 2;
    for (let k = 0; k < 3; k++) stars.add(new THREE.Mesh(starGeo, starMat));
    r.add(stars); scene.add(r);
    return { r, tag, stars, phase: i, x: 0, z: 0 };
  });
  const burst = new Burst(scene);

  // ---- state (authoritative on the host, mirrored on guests)
  const S = {
    st: 'count', stT: 0, round: 1, mt: 0, ferm: 0, fermDone: 0, stopT: 0, off: 0, chairs: [], // chairs: occupant or -1
    p: IDX.map(i => ({ th: 0, mode: 'run', stun: 0, c: -1, dt: 0, seats: 0, out: 0, outR: 0, spd: 1, fs: 0, bn: 0 })),
  };
  const inp = IDX.map(() => ({ l: 0, r: 0, d: 0 }));
  const ctrl = new Set(online ? [me] : IDX), ai = new Set(), brain = IDX.map(() => ({ react: .3, fake: false, t: 0 }));
  const alive = () => IDX.filter(i => !S.p[i].out);

  const panes = (online ? [me] : IDX).map(pi => {
    const v = makePane(pi, label, zones('◀', '🪑', '▶'));
    v.chips = rankChips(v, n, label);
    v.cam = new THREE.PerspectiveCamera(58, 1, .1, 200); v.fov = 58; v.cp = new THREE.Vector3(0, 8, 14); v.look = new THREE.Vector3();
    return v;
  });
  const paneOf = i => panes.find(v => v.pi === i);
  const shown = i => !!paneOf(i);
  const chips = () => panes.forEach(v => v.chips(IDX.map(i => (duel ? `🪑${S.p[i].seats}` : S.p[i].out ? t('chairsOutChip') : t('chairsInChip')))));
  let step = countdown(panes);

  const pos = th => [Math.sin(th) * RING, Math.cos(th) * RING];
  const cpos = c => { const a = S.off + c * Math.PI * 2 / S.chairs.length; return [Math.sin(a) * CR, Math.cos(a) * CR, a]; };

  function roundSetup() {
    const al = alive(), nc = duel ? 1 : al.length - 1;
    S.off = S.round * 2.39; // golden-angle spin so the chairs sit somewhere new each round
    S.chairs = Array(nc).fill(-1);
    al.forEach((i, k) => Object.assign(S.p[i], { th: S.off + .5 + k * Math.PI * 2 / al.length, mode: 'run', stun: 0, c: -1, dt: 0, spd: 1 }));
    Object.assign(S, { mt: 0, ferm: 0, fermDone: 0, stopT: 0, stT: 0 });
    IDX.forEach(i => { inp[i].d = 0; Object.assign(brain[i], { react: .15 + Math.random() * .35, fake: Math.random() < .22 }); });
  }
  function roundStart(first) {
    roundSetup();
    S.st = first ? 'count' : 'ready';
    if (first) step = countdown(panes);
    panes.forEach(v => {
      v.hint.textContent = coarse ? t('chairsTouch') : t('chairsKeys', keyHint(v.pi, online)); v.hint.classList.remove('hide');
      if (!first) flash(v.msg, t('sumoRound', { n: S.round }));
    });
    chips();
  }

  // ---- simulation (authority only)
  function dive(i) {
    const P = S.p[i];
    if (P.mode !== 'run' || P.out) return;
    if (S.st === 'music') { P.mode = 'stun'; P.stun = FALSE_STUN; P.fs++; return; }
    if (S.st !== 'stop') return;
    const [x, z] = pos(P.th);
    let best = -1, bd = 1e9;
    S.chairs.forEach((o, c) => { if (o >= 0) return; const [cx, cz] = cpos(c), d = Math.hypot(cx - x, cz - z); if (d < bd) { bd = d; best = c; } });
    if (best < 0) return;
    P.mode = 'dive'; P.c = best; P.dt = 0;
  }
  function think(i, dt) {
    const P = S.p[i], b = brain[i], io = inp[i];
    let nearest = 9;
    S.chairs.forEach((o, c) => { if (o >= 0) return; const d = Math.atan2(Math.sin(cpos(c)[2] - P.th), Math.cos(cpos(c)[2] - P.th)); if (d > 0 && d < nearest) nearest = d; });
    io.l = nearest < .45 ? 1 : 0; io.r = nearest > 1.1 ? 1 : 0; // dawdle just short of a chair, hurry past the gaps
    if (P.mode !== 'run') return;
    if (S.st === 'stop' && S.stopT > b.react) { dive(i); b.react = S.stopT + .2 + Math.random() * .3; }
    else if (S.st === 'music' && S.ferm > 0 && b.fake && S.ferm < 1.3 - b.react) { b.fake = false; dive(i); }
  }
  function playing() { return S.st === 'music' || S.st === 'stop'; }
  function sim(dt) {
    S.stT += dt;
    const R = plan[(S.round - 1) % plan.length];
    if (S.st === 'ready' && S.stT > 1.4) { S.st = 'music'; S.stT = 0; }
    if (S.st === 'music') {
      if (!S.fermDone && S.mt >= R.ferm) { S.ferm = 1.3; S.fermDone = 1; }
      if (S.ferm > 0) S.ferm = Math.max(0, S.ferm - dt); else S.mt += dt;
      if (S.mt >= R.stop) { S.st = 'stop'; S.stT = 0; S.stopT = 0; }
    } else if (S.st === 'stop') S.stopT += dt;
    if (S.st === 'result' && S.stT > 2) {
      const al = alive();
      if (duel ? Math.max(...S.p.map(p => p.seats)) >= WINS2 : al.length <= 1) { S.st = 'done'; return; }
      S.round++; roundStart(false); return;
    }
    if (!playing() && S.st !== 'ready') return;
    const running = [];
    for (const i of IDX) {
      const P = S.p[i], io = inp[i];
      if (P.out || P.mode === 'seat') continue;
      if (playing() && ai.has(i) && ctrl.has(i)) think(i, dt);
      if (io.d) { io.d = 0; dive(i); }
      if (P.mode === 'stun') { if ((P.stun -= dt) <= 0) P.mode = 'run'; continue; }
      if (P.mode === 'dive') {
        if ((P.dt += dt / DIVE_T) < 1) continue;
        const o = S.chairs[P.c], [cx, cz] = cpos(P.c);
        if (o < 0) { S.chairs[P.c] = i; P.mode = 'seat'; }
        else { P.mode = 'stun'; P.stun = BOUNCE_STUN; P.bn++; P.th = Math.atan2(cx, cz) + (Math.random() - .5) * .3; }
        continue;
      }
      if (S.st === 'ready') continue;
      P.spd = io.l ? .55 : io.r ? 1.45 : 1;
      P.th += W0 * P.spd * dt;
      running.push(P);
    }
    for (const a of running) for (const b of running) { // no overtaking: the faster one shoves the one ahead
      if (a === b) continue;
      const d = Math.atan2(Math.sin(b.th - a.th), Math.cos(b.th - a.th));
      if (d > 0 && d < GAP) { const push = (GAP - d) * .5; b.th += push; a.th -= push; }
    }
    if (S.st === 'stop' && S.stopT > STOP_MAX) { // nobody took the last chair(s): hand them to the nearest runners
      S.chairs.forEach((o, c) => {
        if (o >= 0) return;
        const [cx, cz] = cpos(c);
        const cand = alive().filter(i => S.p[i].mode !== 'seat' && S.p[i].mode !== 'dive').sort((a, b) => { const [ax, az] = pos(S.p[a].th), [bx, bz] = pos(S.p[b].th); return Math.hypot(ax - cx, az - cz) - Math.hypot(bx - cx, bz - cz); });
        if (cand.length) { S.chairs[c] = cand[0]; S.p[cand[0]].mode = 'seat'; }
      });
    }
    if (S.st === 'stop' && S.chairs.every(o => o >= 0)) {
      if (duel) S.p[S.chairs[0]].seats++;
      else alive().filter(i => S.p[i].mode !== 'seat').forEach(i => { S.p[i].out = 1; S.p[i].outR = S.round; S.p[i].mode = 'out'; });
      S.st = 'result'; S.stT = 0;
    }
  }

  // ---- music: every device plays the tune from the music clock (host sim, or the guest's snapshots)
  let heardMt = 0, heardFerm = 0, heardRound = 0, lastBeat = -1;
  function music() {
    if (S.round !== heardRound || S.mt < heardMt) { heardRound = S.round; heardMt = 0; lastBeat = -1; }
    if (S.st !== 'music') { heardMt = S.mt; heardFerm = S.ferm; return; }
    if (S.ferm > 0 && heardFerm <= 0) { const nt = noteAt(Math.floor(S.mt / BEAT)); sfx.pitch(nt.d, 1.45, .13); } // held note
    heardFerm = S.ferm;
    const b1 = Math.floor(S.mt / BEAT);
    for (let b = Math.max(lastBeat + 1, Math.floor(heardMt / BEAT)); b <= b1; b++) {
      const lb = b % LOOP, nt = NOTES.find(x => x.b === lb);
      if (nt) sfx.pitch(nt.d, nt.l * BEAT * 1.05, .11);
      if (lb % 4 === 0) { sfx.chord((lb / 4) % 8, BEAT * 4); sfx.kick(); }
      else if (lb % 2 === 0) sfx.hat();
      lastBeat = b;
    }
    heardMt = S.mt;
  }
  const noteAt = b => { const lb = b % LOOP; let best = NOTES[0]; for (const x of NOTES) if (x.b <= lb) best = x; return best; };

  // ---- networking
  const q2 = v => Math.round(v * 100) / 100;
  let acc = 0, sendAcc = 0;
  function snapshot() {
    const p = [];
    S.p.forEach(P => p.push(q2(P.th), MODES.indexOf(P.mode), P.c, q2(P.dt), P.seats, P.out, P.fs, P.bn, P.outR));
    send({ t: 'cs', from: 0, st: ST.indexOf(S.st), r: S.round, mt: q2(S.mt), fe: q2(S.ferm), so: q2(S.stopT), ch: S.chairs, p });
  }
  const num = x => typeof x === 'number' && Number.isFinite(x);
  const arr = (a, len) => Array.isArray(a) && (len == null || a.length === len) && a.every(num);
  function applySnap(m) {
    const st = ST[m.st];
    if (m.r !== S.round || (st === 'count' && S.st !== 'count')) { S.round = m.r; S.off = S.round * 2.39; if (st === 'ready') panes.forEach(v => flash(v.msg, t('sumoRound', { n: S.round }))); }
    S.chairs = m.ch.map(c => c | 0);
    S.p.forEach((P, i) => {
      const a = m.p.slice(i * F, i * F + F);
      Object.assign(P, { th: a[0], mode: MODES[a[1]] ?? 'run', c: a[2], dt: a[3], seats: a[4], out: a[5], fs: a[6], bn: a[7], outR: a[8] });
    });
    Object.assign(S, { st, mt: m.mt, ferm: m.fe, stopT: m.so });
  }
  function onNet(m) {
    if (!m || typeof m.t !== 'string') return;
    const i = m.from;
    if (auth) {
      if (!Number.isInteger(i) || i < 1 || i >= n || ctrl.has(i)) return;
      if (m.t === 'ci') { inp[i].l = m.l ? 1 : 0; inp[i].r = m.r ? 1 : 0; }
      else if (m.t === 'cd') inp[i].d = 1;
    } else if (m.t === 'cs' && i === 0 && Number.isInteger(m.st) && ST[m.st] && Number.isInteger(m.r) && num(m.mt) && num(m.fe) && num(m.so)
      && arr(m.ch) && m.ch.length <= 3 && arr(m.p, n * F)) applySnap(m);
  }

  // ---- input
  const act = (pi, a) => {
    if (!ctrl.has(pi) || ai.has(pi)) return;
    if (a === 'A') { if (auth) inp[pi].d = 1; else send({ t: 'cd', from: pi }); return; }
    inp[pi][a === 'L' ? 'l' : 'r'] = 1;
    if (!auth) send({ t: 'ci', from: pi, l: inp[pi].l, r: inp[pi].r });
  };
  const release = (pi, a) => {
    if (!ctrl.has(pi) || a === 'A') return;
    inp[pi][a === 'L' ? 'l' : 'r'] = 0;
    if (!auth) send({ t: 'ci', from: pi, l: inp[pi].l, r: inp[pi].r });
  };
  const unbind = bindInput({ cv: renderer.domElement, panes, n, online, me, act, release });

  // ---- match end
  const sc = makeShowcase(panes, label, onEnd);
  let ended = false, champ = 0;
  function finish() {
    if (ended) return;
    ended = true;
    const order = duel ? [...IDX].sort((a, b) => S.p[b].seats - S.p[a].seats)
      : [...IDX].sort((a, b) => (S.p[b].out ? S.p[b].outR : 99) - (S.p[a].out ? S.p[a].outR : 99)); // last one in first, then latest out
    champ = order[0];
    const scores = IDX.map(i => (duel ? t('chairsSeats', { n: S.p[i].seats }) : S.p[i].out ? t('chairsOutIn', { r: S.p[i].outR }) : t('chairsLast')));
    sc.start({ order, draw: false, scores }, () => runners[champ].r.position, { r: 4.5, h: 2.4, look: 1.1 });
  }

  // ---- feedback from state changes (same path on host and guests)
  let prev = null;
  function events() {
    const cur = { st: S.st, p: S.p.map(P => ({ mode: P.mode, fs: P.fs, bn: P.bn, out: P.out, seats: P.seats })), chairs: S.chairs.slice() };
    if (prev) {
      if (prev.st === 'music' && cur.st === 'stop') { panes.forEach(v => flash(v.msg, t('chairsStop'), 'go')); sfx.signal(); buzz(40); }
      if (prev.st !== 'result' && cur.st === 'result') {
        const lost = IDX.filter(i => cur.p[i].out && !prev.p[i].out);
        lost.forEach(i => { const [x, z] = pos(S.p[i].th); burst.emit(x, 1, z, COL[i], 30, 5); });
        panes.forEach(v => {
          if (duel) { const w = S.chairs[0]; flash(v.msg, w === v.pi ? t('chairsSeated') : t('chairsStanding'), w === v.pi ? 'perfect' : 'hit'); }
          else if (lost.includes(v.pi)) flash(v.msg, t('out'), 'hit');
          else if (lost.length) flash(v.msg, t('chairsIsOut', { p: label(lost[0]) }), '');
        });
        if (lost.some(shown)) sfx.lose(); else sfx.finish();
        chips();
      }
      IDX.forEach(i => {
        const a = prev.p[i], b = cur.p[i], v = paneOf(i);
        if (b.fs > a.fs) { if (v) { flash(v.msg, t('chairsFalse'), 'hit'); sfx.miss(); buzz(50); } }
        if (b.bn > a.bn) { if (v) { flash(v.msg, t('chairsBounce'), 'hit'); } sfx.bump(); }
        if (a.mode !== 'seat' && b.mode === 'seat') { const c = S.chairs.indexOf(i); if (c >= 0) { const [x, z] = cpos(c); burst.emit(x, 1, z, COL[i], 16, 3); } if (v) { flash(v.msg, t('chairsSeated'), 'perfect'); } sfx.catch(); }
        if (a.mode !== 'dive' && b.mode === 'dive' && v) sfx.jump();
      });
    }
    prev = cur;
  }

  // ---- frame
  let time = 0, lastSt = null;
  function update(dt) {
    time += dt;
    if (S.st === 'count' && !step(dt) && auth) { S.st = 'music'; S.stT = 0; }
    if (S.st === 'music' || S.st === 'ready') panes.forEach(v => v.hint.classList.add('hide'));
    if (auth && S.st !== 'done') {
      acc = Math.min(acc + dt, .25);
      while (acc >= STEP) { acc -= STEP; sim(STEP); }
      if (online && (sendAcc += dt) >= .05) { sendAcc = 0; snapshot(); }
    }
    if (S.st === 'done') { if (auth && online && lastSt !== 'done') snapshot(); finish(); }
    if (S.st === 'count' && lastSt && lastSt !== 'count' && !auth) step = countdown(panes);
    lastSt = S.st;
    music();
    events();

    // stage lighting: gold while the music plays, violet on the held note, red in the silence
    const play = S.st === 'music', lit = play ? (S.ferm > 0 ? VIOLET : GOLD) : S.st === 'stop' ? RED : GOLD;
    coneMat.color.lerp(lit, Math.min(1, dt * 8)); pool.material.color.copy(coneMat.color);
    coneMat.opacity = S.st === 'stop' ? .14 + Math.sin(time * 10) * .04 : .09;
    ball.rotation.y += dt * (play ? 1.2 : .1);
    const beatPh = (S.mt / BEAT) % 1;
    for (let k = 0; k < EQ; k++) {
      const target = play ? (S.ferm > 0 ? 2.4 : .6 + Math.abs(Math.sin(k * 1.7 + Math.floor(S.mt / BEAT) * 2.1)) * 2.4 * (1 - beatPh * .5)) : .08;
      eqH[k] += (target - eqH[k]) * Math.min(1, dt * 14);
      const a = k / EQ * Math.PI * 2;
      M4.makeScale(1, Math.max(.02, eqH[k] * 2.2), 1).setPosition(Math.sin(a) * EQR, -1, Math.cos(a) * EQR);
      eq.setMatrixAt(k, M4);
    }
    eq.instanceMatrix.needsUpdate = true;
    eqMat.color.copy(play ? (S.ferm > 0 ? GOLD : VIOLET) : RED);

    // chairs
    chairMeshes.forEach((cm, c) => {
      cm.g.visible = c < S.chairs.length;
      if (!cm.g.visible) return;
      const [x, z, a] = cpos(c);
      cm.g.position.set(x, 0, z); cm.g.rotation.y = a + Math.PI; // backrest toward the centre
      cm.rm.opacity = S.st === 'stop' && S.chairs[c] < 0 ? .55 + Math.sin(time * 12) * .35 : 0;
    });

    // runners: run the ring, arc into a chair on a dive, sit, wobble when stunned
    IDX.forEach(i => {
      const P = S.p[i], R = runners[i], r = R.r, u = r.userData;
      R.r.visible = !P.out || S.st === 'result';
      let x, z, y = 0, face;
      if ((P.mode === 'seat' || P.mode === 'dive') && P.c >= 0 && P.c < S.chairs.length) {
        const [cx, cz, a] = cpos(P.c), [sx, sz] = pos(P.th), k = P.mode === 'seat' ? 1 : Math.min(1, P.dt), e = k * (2 - k);
        x = sx + (cx - sx) * e; z = sz + (cz - sz) * e; y = P.mode === 'seat' ? 0 : Math.sin(k * Math.PI) * 1.1;
        face = P.mode === 'seat' ? a : Math.atan2(cx - sx, cz - sz);
      } else { [x, z] = pos(P.th); face = P.th + Math.PI / 2; }
      R.x += (x - R.x) * Math.min(1, dt * (auth ? 30 : 12)); R.z += (z - R.z) * Math.min(1, dt * (auth ? 30 : 12));
      placeRunner(r, R.x, y, R.z);
      r.rotation.y = face + Math.PI; // rig faces -z
      if (P.mode === 'seat') {
        animRunner(r, 0, 0);
        u.legL.rotation.x = u.legR.rotation.x = 1.45; u.kneeL.rotation.x = u.kneeR.rotation.x = -1.45; u.body.rotation.x = .05;
        u.armL.rotation.x = u.armR.rotation.x = -.3;
      } else if (P.mode === 'dive') animRunner(r, R.phase, .2, .9);
      else if (P.mode === 'stun') { animRunner(r, 0, 0); u.body.rotation.z = Math.sin(time * 9) * .2; }
      else { R.phase += dt * 9 * (P.spd ?? 1) * (S.st === 'ready' || S.st === 'count' ? 0 : 1); animRunner(r, R.phase, S.st === 'ready' || S.st === 'count' ? .05 : .7 * (P.spd ?? 1)); }
      R.stars.visible = P.mode === 'stun';
      if (R.stars.visible) R.stars.children.forEach((s, k) => { const a = time * 6 + k * 2.09; s.position.set(Math.cos(a) * .35, Math.sin(time * 9 + k) * .05, Math.sin(a) * .35); });
    });

    panes.forEach(v => { const s = t('chairsRound', { r: S.round, c: S.chairs.length }); if (v.val.textContent !== s) v.val.textContent = s; });
    burst.update(dt);
    sc.update(dt);
  }

  function resize() {
    layout(panes);
    for (const v of panes) { v.cam.aspect = v.w / v.h; v.fov = fitFov(v.cam.aspect, 36, 52, 100); }
  }

  const tmp = new THREE.Vector3();
  function render() {
    renderPanes(renderer, scene, panes, v => {
      const c = v.cam, P = S.p[v.pi], R = runners[v.pi], k = 1 - Math.exp(-(1 / 60) * 4);
      if (sc.on) { sc.cam(v, c, v.fov); sky.position.copy(c.position); return c; }
      if (!P.out) { // outside the ring behind your runner, looking in across the chairs
        const d = Math.hypot(R.x, R.z) || 1;
        v.cp.lerp(tmp.set(R.x / d * (RING + 6.5), 6, R.z / d * (RING + 6.5)), k * 3);
        v.look.lerp(tmp.set(R.x * .25, .6, R.z * .25), k * 3);
      } else { v.cp.lerp(tmp.set(0, 16, 9), k); v.look.lerp(tmp.set(0, 0, 0), k); }
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
    runners[i].tag.userData.set(label(i));
    chips();
  }

  function dispose() {
    unbind();
    holdMusic(false);
    panes.forEach(v => v.el.remove());
    document.body.classList.remove('split-v');
    disposeScene(scene);
  }

  holdMusic(true);
  roundStart(true);
  resize();
  bots.forEach(i => botify(i, me === 0));
  return { update, render, resize, onNet, dispose, botify };
}
