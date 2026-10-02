import * as THREE from 'three';
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { COL, canvasTex, disposeScene, flash, buzz, Burst } from './fx.js';
import { coarse, keyHint, zones, makePane, rankChips, layout, fitFov, renderPanes, bindInput, countdown, makeShowcase, addSky, addCity, lights, makeRunner, animRunner, placeRunner, nameTag, part } from './stage.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Puck Panic: 4-way air hockey. Every player guards one side of a square rink whose corners are cut by 45° boards.
// A puck through your goal costs a life; at 0 your side becomes a wall. Last goal standing takes the round, first to 2.
// Action = smash: the paddle lunges and a puck it hits leaves ×1.35. 3 smashes a round; scoring on a rival (you were
// the last paddle to touch the puck) refunds one, up to 3. Each corner board has a spike that throws the puck back
// past the centre toward a far side (a plain 45° mirror lets two neighbours rally through their corner forever).
// Online is host-authoritative like Sumo Bump, except guests move their own paddle locally and send its position, so
// defending never lags. The host runs the pucks and broadcasts snapshots at 20 Hz; guests dead-reckon between them.
const H = 8, CUT = 2, PW = 1.5, PR = .42, FACE = H - .6, LUNGE = .6, LUNGE_T = .16, COOL = .7;
const V0 = 8, VMAX = 18, RUSH = 45, VCAP = VMAX * 1.35, PADV = 13, SMASHES = 3, LIVES = 3, WINS = 2, MAX_ROUNDS = 3, STEP = 1 / 120;
const LIM = H - CUT - PW; // paddle travel either side of the goal's centre
const ST = ['count', 'play', 'end', 'done'], PF = 7, KF = 5; // snapshot floats per paddle / per puck
// side k: o = outward normal (x, z), t = that seat's "right" as seen from its camera behind the goal
const SIDES = [[0, 1], [0, -1], [-1, 0], [1, 0]].map(([ox, oz]) => ({ o: [ox, oz], t: [oz, -ox] }));
const want = T => Math.min(4, 1 + (T >= 12) + (T >= 24) + (T >= 45)); // pucks in play grow over the round

export function createPuck({ renderer, mode, n = 2, me = 0, bots = [], send, label, onEnd }) {
  const online = mode === 'online';
  const IDX = [...Array(n).keys()];
  let auth = !online || me === 0;

  const scene = new THREE.Scene(), fogC = new THREE.Color(0x0a1030);
  scene.background = fogC;
  scene.fog = new THREE.Fog(fogC, 34, 120);
  lights(scene);
  const sky = addSky(scene, fogC, 0x3a2a8c);
  addCity(scene, { y: -40, n: 200, x0: -120, x1: 120, z0: 120, z1: -120, clear: (x, z) => Math.max(Math.abs(x), Math.abs(z)) < 30 });

  // ---- rink: octagon ice, boards + spikes in the corners, goal lines, a goalie platform behind each goal
  const oct = [[-H + CUT, -H], [H - CUT, -H], [H, -H + CUT], [H, H - CUT], [H - CUT, H], [-H + CUT, H], [-H, H - CUT], [-H, -H + CUT]];
  const iceTex = canvasTex(512, 512, (g, w) => {
    const c = w / 2, gr = g.createRadialGradient(c, c, 0, c, c, c * 1.3);
    gr.addColorStop(0, '#26407e'); gr.addColorStop(1, '#101c48');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
    g.strokeStyle = 'rgba(160,190,255,.12)'; g.lineWidth = 2;
    for (let k = 0; k <= 16; k++) { const p = k * w / 16; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, w); g.moveTo(0, p); g.lineTo(w, p); g.stroke(); }
    g.strokeStyle = 'rgba(255,210,63,.55)'; g.lineWidth = 6; g.beginPath(); g.arc(c, c, w * .12, 0, 7); g.stroke();
    g.fillStyle = 'rgba(255,210,63,.55)'; g.beginPath(); g.arc(c, c, 8, 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,90,160,.35)'; g.lineWidth = 4; g.beginPath(); g.moveTo(c, 0); g.lineTo(c, w); g.moveTo(0, c); g.lineTo(w, c); g.stroke();
  });
  const floorGeo = new THREE.ShapeGeometry(new THREE.Shape(oct.map(([x, z]) => new THREE.Vector2(x, z))));
  const fp = floorGeo.attributes.position, fuv = floorGeo.attributes.uv;
  for (let k = 0; k < fp.count; k++) fuv.setXY(k, fp.getX(k) / (2 * H) + .5, fp.getY(k) / (2 * H) + .5);
  floorGeo.rotateX(Math.PI / 2); // shape (x, y) → world (x, z)
  const floor = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ map: iceTex, roughness: .25, metalness: .35, envMapIntensity: .6, side: THREE.DoubleSide }));
  scene.add(floor);
  const base = new THREE.Mesh(new THREE.BoxGeometry(2 * H + 6, 1.2, 2 * H + 6), new THREE.MeshStandardMaterial({ color: 0x0c1030, roughness: .5, metalness: .6 }));
  base.position.y = -.62; scene.add(base);
  const underGlow = new THREE.Mesh(new THREE.BoxGeometry(2 * H + 6.1, .08, 2 * H + 6.1), new THREE.MeshBasicMaterial({ color: 0xff3aa8, toneMapped: false }));
  underGlow.position.y = -1.1; scene.add(underGlow);

  const boardMat = new THREE.MeshStandardMaterial({ color: 0x252c58, roughness: .35, metalness: .7 });
  const railMat = new THREE.MeshBasicMaterial({ color: 0x7b87c4, toneMapped: false });
  const spikeMat = new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0xffb000, emissiveIntensity: .8, metalness: .6, roughness: .3 });
  const CORNERS = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  const spikes = CORNERS.map(([sx, sz]) => {
    const mx = sx * (H - CUT / 2), mz = sz * (H - CUT / 2), g = new THREE.Group(), len = CUT * Math.SQRT2 + .3;
    g.position.set(mx, 0, mz); g.rotation.y = Math.atan2(sx, sz); // local +z points out of the corner, -z into the rink
    const board = new THREE.Mesh(new THREE.BoxGeometry(len, .5, .3), boardMat); board.position.set(0, .25, .15);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(len, .06, .32), railMat); rail.position.set(0, .52, .15);
    const spike = new THREE.Mesh(new THREE.ConeGeometry(.26, .7, 4).rotateX(-Math.PI / 2), spikeMat); spike.position.set(0, .28, -.3);
    g.add(board, rail, spike); scene.add(g);
    return { spike, pulse: 0 };
  });

  // per side: goal line + crease strip (players), or a wall (empty sides, and players knocked out)
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x3a4270, emissive: 0x1a2250, emissiveIntensity: .8, roughness: .4, metalness: .5 });
  const sides = SIDES.map((S, k) => {
    const g = new THREE.Group(), len = 2 * (H - CUT);
    g.position.set(S.o[0] * H, 0, S.o[1] * H); g.rotation.y = Math.atan2(S.o[0], S.o[1]); // local +z = outward, local x = ±t
    const wall = new THREE.Mesh(new THREE.BoxGeometry(len, .8, .4), wallMat); wall.position.set(0, .4, .2);
    const wallTop = new THREE.Mesh(new THREE.BoxGeometry(len, .06, .42), railMat); wallTop.position.set(0, .82, .2);
    const wg = new THREE.Group(); wg.add(wall, wallTop); g.add(wg);
    let line = null, crease = null, deck = null;
    if (k < n) {
      line = new THREE.Mesh(new THREE.BoxGeometry(len, .05, .14), new THREE.MeshBasicMaterial({ color: COL[k], toneMapped: false })); line.position.y = .03;
      crease = new THREE.Mesh(new THREE.PlaneGeometry(len, H - FACE + .2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: COL[k], transparent: true, opacity: .14, depthWrite: false, toneMapped: false }));
      crease.position.set(0, .012, -(H - FACE) / 2);
      deck = new THREE.Mesh(new THREE.BoxGeometry(len + 1, .2, 2.6), new THREE.MeshStandardMaterial({ color: 0x141a3c, emissive: COL[k], emissiveIntensity: .12, roughness: .5, metalness: .5 }));
      deck.position.set(0, -.1, 1.5);
      g.add(line, crease, deck);
    }
    scene.add(g);
    wg.scale.y = k < n ? .001 : 1; wg.visible = k >= n;
    return { g, wg, line, crease, rise: k < n ? 0 : 1 };
  });

  // paddles (capsule + smash pips) with the player's athlete crouched behind, sliding along with it
  const pipGeo = new THREE.SphereGeometry(.09, 10, 8), pipOn = new THREE.MeshBasicMaterial({ color: 0xffd23f, toneMapped: false }), pipOff = new THREE.MeshBasicMaterial({ color: 0x1a1f36 });
  const paddles = IDX.map(i => {
    const S = SIDES[i], g = new THREE.Group();
    g.rotation.y = Math.atan2(-S.t[1], S.t[0]); // local x along the seat's right
    const mat = new THREE.MeshStandardMaterial({ color: COL[i], emissive: COL[i], emissiveIntensity: .55, roughness: .3, metalness: .3 });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(.3, 2 * PW - .6, 6, 16).rotateZ(Math.PI / 2), mat); body.position.y = .3;
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2 * PW - .5, .05, .1), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })); stripe.position.set(0, .3, -.29);
    const pips = [-1, 0, 1].map(k => { const m = new THREE.Mesh(pipGeo, pipOn); m.position.set(k * .45, .62, 0); g.add(m); return m; });
    g.add(body, stripe);
    scene.add(g);
    const rider = makeRunner(COL[i]); rider.scale.setScalar(.8);
    rider.rotation.y = Math.atan2(S.o[0], S.o[1]); // faces the centre
    const u = rider.userData; u.armL.rotation.set(.9, 0, -.12); u.armR.rotation.set(.9, 0, .12);
    const tag = nameTag(label(i), COL[i]); tag.position.y = 2.1; rider.add(tag);
    scene.add(rider);
    return { g, mat, pips, rider, tag, phase: 0, x: 0 };
  });

  // pucks: small pool. Bevelled lathe body with a recessed top, a white chevron (shows the spin) and a glowing
  // side band + top ring that take the colour of whoever smashed it last; contact shadow underneath
  const V = (a) => a.map(([r, y]) => new THREE.Vector2(r, y));
  const puckGeo = mergeGeometries([
    part(new THREE.LatheGeometry(V([[0, 0], [PR * .9, 0], [PR, .035], [PR, .17], [PR * .96, .2]]), 32), 0x262e66), // base + side
    part(new THREE.LatheGeometry(V([[PR * .96, .2], [PR * .8, .2], [PR * .74, .17], [PR * .3, .17], [PR * .26, .2], [0, .2]]), 32), 0x5664b8), // bevelled top, recessed face, centre cap
  ]);
  const chev = r => new THREE.BoxGeometry(PR * .38, .02, .08).rotateY(r);
  const glowGeo = mergeGeometries([
    new THREE.TorusGeometry(PR * 1.005, .026, 6, 32).rotateX(Math.PI / 2).translate(0, .1, 0),
    new THREE.RingGeometry(PR * .74, PR * .8, 32).rotateX(-Math.PI / 2).translate(0, .201, 0),
    chev(.6).translate(-PR * .13, .175, -PR * .5), chev(-.6).translate(PR * .13, .175, -PR * .5),
  ].map(g => g.toNonIndexed()));
  const puckMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .28, metalness: .35 });
  const shadowGeo = new THREE.CircleGeometry(PR * 1.3, 32).rotateX(-Math.PI / 2), shadowMat = new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: .45, depthWrite: false });
  const pucks = Array.from({ length: 6 }, () => {
    const g = new THREE.Group(), rm = new THREE.MeshBasicMaterial({ color: 0xe8ecff, toneMapped: false });
    const b = new THREE.Mesh(puckGeo, puckMat), r = new THREE.Mesh(glowGeo, rm), sh = new THREE.Mesh(shadowGeo, shadowMat);
    b.position.y = r.position.y = .01; sh.position.y = .015;
    g.add(sh, b, r); g.visible = false; scene.add(g);
    return { g, rm, spin: b, ring: r };
  });
  const burst = new Burst(scene), trail = new Burst(scene, 160);

  // ---- sim state (authoritative on the host, mirrored from snapshots on guests)
  const S = {
    st: 'count', stT: 0, round: 1, T: 0, wins: Array(n).fill(0), goals: Array(n).fill(0),
    pl: SIDES.map(() => ({ p: 0, lives: 0, alive: 0, lunge: 0, cd: 0, sm: SMASHES, hits: 0, sc: 0, v: 0 })), pk: [], q: [],
  };
  const inp = IDX.map(() => ({ l: 0, r: 0, k: 0, s: 0 })); // held left / right, last one pressed, smash requested
  const dirOf = io => io.l && io.r ? io.k : io.r - io.l; // both held: the newer press wins, so a quick reverse doesn't stop the paddle
  const ctrl = new Set(online ? [me] : IDX), ai = new Set(), brain = IDX.map(() => ({ off: 0, t: 0 }));

  const panes = (online ? [me] : IDX).map(pi => {
    const v = makePane(pi, label, zones('◀', '◆', '▶'));
    v.chips = rankChips(v, n, label);
    v.cam = new THREE.PerspectiveCamera(56, 1, .1, 260); v.fov = 56; v.cp = new THREE.Vector3(); v.look = new THREE.Vector3(); v.valS = '';
    return v;
  });
  const paneOf = i => panes.find(v => v.pi === i);
  const shown = i => !!paneOf(i);
  const chips = () => panes.forEach(v => v.chips(IDX.map(i => `★${S.wins[i]} ${'♥'.repeat(S.pl[i].lives) || '✕'}`)));
  let step = countdown(panes);

  function roundStart() {
    S.st = 'count'; S.stT = 0; S.T = 0; S.pk = []; S.q = [];
    S.pl.forEach((p, k) => Object.assign(p, { p: 0, lives: k < n ? LIVES : 0, alive: k < n ? 1 : 0, lunge: 0, cd: 0, sm: SMASHES, v: 0 }));
    IDX.forEach(i => { inp[i].s = 0; });
    step = countdown(panes);
    panes.forEach(v => { v.hint.textContent = coarse ? t('puckTouch') : t('puckKeys', keyHint(v.pi, online)); v.hint.classList.remove('hide'); });
    chips();
  }

  // ---- simulation (authority only)
  const dot = (x, z, a) => x * a[0] + z * a[1];
  function spawn() {
    const a = Math.random() * Math.PI * 2, b = Math.round(a / (Math.PI / 2)) * (Math.PI / 2);
    const ang = b + (a > b ? .5 : -.5) + (Math.random() - .5) * .4; // ~30° off an axis: it heads for a side, never a corner
    S.pk.push({ x: 0, z: 0, vx: Math.cos(ang) * V0, vz: Math.sin(ang) * V0, own: -1, last: -1 });
  }
  function smash(k) {
    const P = S.pl[k];
    if (S.st !== 'play' || !P.alive || P.cd > 0 || P.sm <= 0) return;
    P.sm--; P.sc++; P.lunge = LUNGE_T; P.cd = COOL;
  }
  function think(k, dt) { // AI: slide to where the most urgent incoming puck will cross the goal line; smash some of the time
    const P = S.pl[k], Sd = SIDES[k], b = brain[k];
    if ((b.t -= dt) <= 0) { b.t = .4 + Math.random() * .6; b.off = (Math.random() - .5) * 1.2; }
    let best = null, bt = 1e9;
    for (const q of S.pk) {
      const vw = dot(q.vx, q.vz, Sd.o); if (vw <= 0) continue;
      const w = dot(q.x, q.z, Sd.o), tt = (FACE - w) / vw;
      if (tt < bt) { bt = tt; best = { q, tt, w }; }
    }
    let mv = 0;
    if (best) {
      const u = dot(best.q.x, best.q.z, Sd.t), vu = dot(best.q.vx, best.q.vz, Sd.t);
      const tgt = THREE.MathUtils.clamp(u + vu * best.tt, -LIM, LIM) + b.off * Math.min(1, best.tt);
      if (Math.abs(tgt - P.p) > .15) mv = Math.sign(tgt - P.p);
      if (P.sm > 0 && best.w > FACE - 1.8 && Math.abs(u - P.p) < PW && Math.random() < .02) smash(k);
    } else if (Math.abs(P.p) > .3) mv = -Math.sign(P.p);
    return mv;
  }

  function sim(dt) {
    S.stT += dt;
    if (S.st === 'end' && S.stT > 2.6) {
      if (Math.max(...S.wins) >= WINS || S.round >= MAX_ROUNDS) { S.st = 'done'; return; }
      S.round++; roundStart(); return;
    }
    if (S.st !== 'play') return;
    S.T += dt;
    while (S.pk.length + S.q.length < want(S.T)) S.q.push(S.pk.length ? .8 : .5);
    S.q = S.q.map(v => v - dt).filter(v => v > 0 || (spawn(), false));
    for (const k of IDX) {
      const P = S.pl[k];
      P.lunge = Math.max(0, P.lunge - dt); P.cd = Math.max(0, P.cd - dt);
      if (!P.alive) continue;
      let mv = null;
      if (ai.has(k) && ctrl.has(k)) mv = think(k, dt);
      else if (ctrl.has(k)) mv = dirOf(inp[k]);
      if (inp[k].s) { inp[k].s = 0; smash(k); }
      if (mv != null) { P.p = THREE.MathUtils.clamp(P.p + mv * PADV * dt, -LIM, LIM); P.v = mv; } // remote guests set p themselves
    }
    for (const q of S.pk) {
      // from RUSH s the speed cap climbs and pucks speed up faster, so a stalemate between good keepers ends
      const rush = Math.max(0, S.T - RUSH), cap = VMAX + rush * .3, sp = Math.hypot(q.vx, q.vz);
      const ns = Math.min(VCAP + rush * .4, sp < cap ? sp * (1 + (rush ? .06 : .02) * dt) : sp);
      q.vx *= ns / sp; q.vz *= ns / sp;
      q.x += q.vx * dt; q.z += q.vz * dt;
      // corner spike: the throw goes back past the centre, 17–34° off the diagonal toward one of the far sides
      const sx = Math.sign(q.x) || 1, sz = Math.sign(q.z) || 1;
      if (Math.abs(q.x) + Math.abs(q.z) + PR * Math.SQRT2 > 2 * H - CUT && q.vx * sx + q.vz * sz > 0) {
        const s = Math.hypot(q.vx, q.vz), a = Math.atan2(-sz, -sx) + (Math.random() < .5 ? -1 : 1) * (.3 + Math.random() * .3);
        q.vx = Math.cos(a) * s; q.vz = Math.sin(a) * s;
        q.spike = CORNERS.findIndex(([cx, cz]) => cx === sx && cz === sz);
      }
      for (let k = 0; k < 4; k++) {
        const Sd = SIDES[k], P = S.pl[k], vw = dot(q.vx, q.vz, Sd.o);
        if (vw <= 0) continue;
        const w = dot(q.x, q.z, Sd.o), u = dot(q.x, q.z, Sd.t);
        if (!P.alive) { if (w + PR >= H) { q.vx -= 2 * vw * Sd.o[0]; q.vz -= 2 * vw * Sd.o[1]; } continue; }
        const face = FACE - (P.lunge > 0 ? LUNGE : 0);
        if (w + PR >= face && w < H - .15 && Math.abs(u - P.p) <= PW + PR) {
          const off = THREE.MathUtils.clamp((u - P.p) / PW, -1, 1), s = Math.min(VCAP, Math.hypot(q.vx, q.vz) * (P.lunge > 0 ? 1.35 : 1));
          const nu = Math.sin(off) * s, nw = -Math.cos(off) * s;
          q.vx = Sd.t[0] * nu + Sd.o[0] * nw; q.vz = Sd.t[1] * nu + Sd.o[1] * nw;
          q.last = k; P.hits++;
          if (P.lunge > 0) q.own = k;
        } else if (w - PR > H) {
          q.dead = true; P.lives--; if (P.lives <= 0) P.alive = 0;
          const sc = q.last >= 0 && q.last !== k ? S.pl[q.last] : null; // scorer: last paddle to touch it
          if (sc) { S.goals[q.last]++; if (sc.alive && sc.sm < SMASHES) sc.sm++; }
        }
      }
    }
    S.pk = S.pk.filter(q => !q.dead);
    const alive = IDX.filter(k => S.pl[k].alive);
    if (alive.length <= 1) {
      if (alive.length) S.wins[alive[0]]++;
      S.st = 'end'; S.stT = 0;
    }
  }

  // ---- networking
  const q2 = v => Math.round(v * 100) / 100;
  let simT = 0, acc = 0, sendAcc = 0, snapK = 0, gT = 0, pmAcc = 0, sentP = null;
  function snapshot() {
    const pl = [], pk = [];
    S.pl.forEach(p => pl.push(q2(p.p), p.lives, p.alive, p.sm, p.lunge > 0 ? 1 : 0, p.hits, p.sc));
    S.pk.forEach(q => pk.push(q2(q.x), q2(q.z), q2(q.vx), q2(q.vz), q.own));
    send({ t: 'pp', from: 0, k: q2(simT), st: ST.indexOf(S.st), r: S.round, T: q2(S.T), w: S.wins, g: S.goals, pl, pk, sp: S.spk ?? [] });
    S.spk = [];
  }
  const num = x => typeof x === 'number' && Number.isFinite(x);
  const arr = (a, len) => Array.isArray(a) && (len == null || a.length === len) && a.every(num);
  function applySnap(m) {
    for (let k = 0; k < 4; k++) {
      const P = S.pl[k], a = m.pl.slice(k * PF, k * PF + PF);
      const mine = k === me && P.alive && a[2]; // own paddle stays where this device put it
      Object.assign(P, { lives: a[1], alive: a[2], sm: a[3], hits: a[5], sc: a[6] });
      if (!mine) { P.v = Math.sign(a[0] - P.p); P.p = a[0]; }
      if (k !== me) P.lunge = a[4] ? LUNGE_T : 0;
    }
    S.pk = [];
    for (let j = 0; j + KF <= m.pk.length; j += KF) S.pk.push({ x: m.pk[j], z: m.pk[j + 1], vx: m.pk[j + 2], vz: m.pk[j + 3], own: m.pk[j + 4] });
    (m.sp ?? []).forEach(c => { if (spikes[c]) spikes[c].pulse = .3; });
    const st = ST[m.st];
    if (st === 'count' && S.st !== 'count') { S.pl[me].p = 0; step = countdown(panes); panes.forEach(v => v.hint.classList.remove('hide')); }
    Object.assign(S, { st, round: m.r, T: m.T, wins: m.w.slice(), goals: m.g.slice() });
    snapK = m.k;
    if (Math.abs(gT - snapK) > .3) gT = snapK;
  }

  function onNet(m) {
    if (!m || typeof m.t !== 'string') return;
    const i = m.from;
    if (auth) { // host: guest paddle position + smash requests
      if (!Number.isInteger(i) || i < 1 || i >= n || ctrl.has(i)) return;
      if (m.t === 'pm' && num(m.p)) { const P = S.pl[i]; P.v = Math.sign(m.p - P.p); P.p = THREE.MathUtils.clamp(m.p, -LIM, LIM); }
      else if (m.t === 'pS') inp[i].s = 1;
    } else if (m.t === 'pp' && i === 0 && num(m.k) && Number.isInteger(m.st) && ST[m.st] && Number.isInteger(m.r) && num(m.T)
      && arr(m.w, n) && arr(m.g, n) && arr(m.pl, 4 * PF) && arr(m.pk) && m.pk.length <= 8 * KF && (m.sp == null || arr(m.sp))) applySnap(m);
  }

  // ---- input
  const act = (pi, a) => {
    if (!ctrl.has(pi) || ai.has(pi)) return;
    if (a === 'L') { inp[pi].l = 1; inp[pi].k = -1; }
    else if (a === 'R') { inp[pi].r = 1; inp[pi].k = 1; }
    else if (S.st === 'play' && S.pl[pi].alive) {
      const P = S.pl[pi];
      if (P.sm <= 0) { if (shown(pi)) { flash(paneOf(pi).msg, t('puckNoSmash'), 'miss'); sfx.miss(); } return; }
      if (P.cd > 0) return;
      if (auth) inp[pi].s = 1;
      else { send({ t: 'pS', from: pi }); P.lunge = LUNGE_T; P.cd = COOL; } // predicted locally; the host decides the hit
    }
  };
  const release = (pi, a) => {
    if (!ctrl.has(pi)) return;
    if (a === 'L') inp[pi].l = 0; else if (a === 'R') inp[pi].r = 0;
  };
  const unbind = bindInput({ cv: renderer.domElement, panes, n, online, me, act, release });

  // ---- round / match end
  const sc = makeShowcase(panes, label, onEnd);
  let ended = false;
  function finish() {
    if (ended) return;
    ended = true;
    const order = [...IDX].sort((a, b) => S.wins[b] - S.wins[a] || S.goals[b] - S.goals[a] || S.pl[b].lives - S.pl[a].lives);
    const key = i => [S.wins[i], S.goals[i], S.pl[i].lives];
    const draw = key(order[0]).every((v, k) => v === key(order[1])[k]);
    sc.start({ order, draw, scores: IDX.map(i => t('puckScore', { w: S.wins[i], g: S.goals[i] })) }, () => paddles[order[0]].rider.position, { r: 5, h: 2.6, look: 1.2 });
  }

  // feedback from state changes: the same code path on host and guests
  let prev = null, prevT = 0;
  function events() {
    const cur = { st: S.st, pl: S.pl.map(p => ({ ...p })), goals: S.goals.slice(), wins: S.wins.slice() };
    if (prev) {
      IDX.forEach(k => {
        const a = prev.pl[k], b = cur.pl[k], Sd = SIDES[k], gx = Sd.o[0] * H + Sd.t[0] * b.p, gz = Sd.o[1] * H + Sd.t[1] * b.p;
        if (b.lives < a.lives) {
          burst.emit(gx, .4, gz, COL[k], 30, 6);
          const v = paneOf(k);
          if (v) { flash(v.msg, b.alive ? t('puckGoal') : t('out'), 'hit'); sfx.hit(); buzz(60); } else sfx.drop();
          if (!b.alive) { sides[k].wg.visible = true; sfx.fall(); }
        }
        if (b.sc > a.sc) { burst.emit(gx - Sd.o[0] * .7, .5, gz - Sd.o[1] * .7, 0xffd23f, 14, 4); if (shown(k)) sfx.boost(); }
        if (b.hits > a.hits) sfx.bump();
        if (cur.goals[k] > prev.goals[k] && shown(k)) { flash(paneOf(k).msg, b.sm > a.sm ? t('puckScoredSmash') : t('puckScored'), 'boost'); sfx.perfect(); }
      });
      if (prev.st === 'play' && cur.st === 'end') {
        const w = IDX.find(i => cur.wins[i] > prev.wins[i]);
        panes.forEach(v => flash(v.msg, w != null ? t('puckTakes', { p: label(w) }) : t('sumoNoRound'), w === v.pi ? 'go' : ''));
        if (w != null && shown(w)) sfx.finish();
      }
      if (prev.st === 'play' && cur.st === 'play' && prevT < RUSH && S.T >= RUSH) { panes.forEach(v => flash(v.msg, t('puckRush'), 'hit')); sfx.signal(); }
      if (prev.st !== 'count' && cur.st === 'count') sides.forEach((sd, k) => { if (k < n) { sd.wg.visible = false; sd.rise = 0; } });
    }
    if (!prev || cur.goals.some((g, i) => g !== prev.goals[i]) || cur.pl.some((p, k) => p.lives !== prev.pl[k].lives) || cur.wins.some((w, i) => w !== prev.wins[i])) chips();
    prev = cur; prevT = S.T;
  }

  // ---- frame
  let time = 0;
  function update(dt) {
    time += dt;
    if (S.st === 'count' && !step(dt) && auth) { S.st = 'play'; S.stT = 0; }
    if (S.st === 'play') panes.forEach(v => v.hint.classList.add('hide'));
    if (auth && S.st !== 'done') {
      acc = Math.min(acc + dt, .25);
      while (acc >= STEP) { acc -= STEP; simT += STEP; sim(STEP); S.pk.forEach(q => { if (q.spike != null) { spikes[q.spike].pulse = .3; if (online) (S.spk ??= []).push(q.spike); q.spike = null; } }); }
      if (online && (sendAcc += dt) >= .05) { sendAcc = 0; snapshot(); }
      if (S.st === 'done') { if (online) snapshot(); finish(); }
    } else if (!auth) {
      gT += dt;
      const P = S.pl[me], io = inp[me];
      P.lunge = Math.max(0, P.lunge - dt); P.cd = Math.max(0, P.cd - dt);
      if (S.st === 'play' && P.alive) { P.v = dirOf(io); P.p = THREE.MathUtils.clamp(P.p + P.v * PADV * dt, -LIM, LIM); }
      if ((pmAcc += dt) >= .05 && P.p !== sentP) { pmAcc = 0; sentP = P.p; send({ t: 'pm', from: me, p: q2(P.p) }); }
      if (S.st === 'done') finish();
    }
    events();

    // walls rise where a goal fell
    sides.forEach(sd => { if (sd.wg.visible) { sd.rise = Math.min(1, sd.rise + dt * 2.5); sd.wg.scale.y = Math.max(.001, sd.rise); } });
    spikes.forEach(s => { s.pulse = Math.max(0, s.pulse - dt); s.spike.scale.setScalar(1 + s.pulse * 2.5); });
    spikeMat.emissiveIntensity = .7 + Math.sin(time * 4) * .2;

    // paddles + riders
    IDX.forEach(k => {
      const P = S.pl[k], Sd = SIDES[k], pd = paddles[k], w = FACE + .3 - (P.lunge > 0 ? LUNGE : 0);
      pd.x += (P.p - pd.x) * Math.min(1, dt * (k === me || auth ? 40 : 14)); // rivals on guests ease toward the snapshot
      const x = Sd.o[0] * w + Sd.t[0] * pd.x, z = Sd.o[1] * w + Sd.t[1] * pd.x;
      pd.g.position.set(x, 0, z);
      pd.g.visible = !!P.alive;
      pd.pips.forEach((m, j) => { m.material = j < P.sm ? pipOn : pipOff; });
      pd.mat.emissiveIntensity = P.lunge > 0 ? 1.4 : .55;
      pd.phase += Math.abs(P.v) * dt * 14;
      placeRunner(pd.rider, x + Sd.o[0] * .95, 0, z + Sd.o[1] * .95);
      animRunner(pd.rider, pd.phase, P.alive && S.st === 'play' ? Math.min(.5, Math.abs(P.v) * .5) : 0);
      const u = pd.rider.userData;
      u.body.rotation.x = -.45 - (P.lunge > 0 ? .35 : 0);
      // hands forward onto the paddle (+x swings an arm forward in this rig); a smash straightens them into a shove
      u.armL.rotation.x = u.armR.rotation.x = .9 + (P.lunge > 0 ? .45 : 0);
      u.elbowL.rotation.x = u.elbowR.rotation.x = P.lunge > 0 ? .05 : .45;
      pd.rider.visible = !!P.alive || S.st !== 'play';
    });

    // pucks: host draws the sim; guests dead-reckon from the newest snapshot
    const e = auth ? 0 : Math.min(.15, Math.max(0, gT - snapK));
    pucks.forEach((pm, j) => {
      const q = S.pk[j];
      pm.g.visible = !!q && S.st !== 'count';
      if (!q) return;
      const x = q.x + q.vx * e, z = q.z + q.vz * e;
      pm.g.position.set(x, 0, z);
      pm.spin.rotation.y = pm.ring.rotation.y += Math.hypot(q.vx, q.vz) * dt * .8; // spins with speed (chevron shows it)
      pm.rm.color.setHex(q.own >= 0 ? COL[q.own] : 0xe8ecff);
      if (Math.random() < dt * 40) trail.emit(x, .15, z, q.own >= 0 ? COL[q.own] : 0x9fb4ff, 1, .4);
    });

    // HUD: round + smashes left
    panes.forEach(v => {
      const s = `${t('sumoRound', { n: S.round })}  ${'◆'.repeat(S.pl[v.pi].sm)}${'◇'.repeat(SMASHES - S.pl[v.pi].sm)}`;
      if (s !== v.valS) { v.valS = s; v.val.textContent = s; }
    });
    burst.update(dt); trail.update(dt);
    sc.update(dt);
  }

  function resize() {
    layout(panes);
    for (const v of panes) { v.cam.aspect = v.w / v.h; v.fov = fitFov(v.cam.aspect, 36, 50, 100); }
  }

  const tmp = new THREE.Vector3();
  function render() {
    renderPanes(renderer, scene, panes, v => {
      const c = v.cam, Sd = SIDES[v.pi], k = 1 - Math.exp(-(1 / 60) * 4);
      if (sc.on) { sc.cam(v, c, v.fov); sky.position.copy(c.position); return c; }
      if (S.pl[v.pi].alive || S.st === 'count') { // behind your own goal, looking across the rink
        v.cp.lerp(tmp.set(Sd.o[0] * (H + 7.5), 9.5, Sd.o[1] * (H + 7.5)), k * 3);
        v.look.lerp(tmp.set(Sd.o[0] * 1.2, 0, Sd.o[1] * 1.2), k * 3);
      } else { // knocked out: watch from high above your wall
        v.cp.lerp(tmp.set(Sd.o[0] * 6, 22, Sd.o[1] * 6), k);
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
    if (local && i === 0 && !auth) { auth = true; simT = snapK; } // host gone: carry on from the last snapshot
    paddles[i].tag.userData.set(label(i));
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
