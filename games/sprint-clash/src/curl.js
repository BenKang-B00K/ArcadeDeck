import * as THREE from 'three';
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { COL, hex, canvasTex, disposeScene, flash, buzz, Burst } from './fx.js';
import { coarse, keyHint, zones, makePane, rankChips, layout, fitFov, renderPanes, bindInput, countdown, makeShowcase, addSky, addCity, lights, makeRunner, nameTag } from './stage.js';

// Stone Slide: turn-based curling. Throw order rotates seat-by-seat through the whole end. AIM: hold left/right to
// steer within +-8 deg, hold the middle to swing a power meter (ping-pong ~1.2s), release to throw. SLIDE: tap
// left/right to sweep your own stone (less friction + a lateral nudge for .3s). Stones curl a little toward their
// throw side and collide like billiards. After both ends, whoever's stone sits closest to the button scores a point
// per stone that beats every rival's best; ties break on the single closest stone either player ever threw.
// Host-authoritative like sumo.js: only the authority steps the physics; guests send aim/throw/sweep and interpolate
// the broadcast stone snapshot.
// Wind: rolled once per throw (random direction + speed) and fixed until the next throw. It pushes every moving
// stone with a constant acceleration; the HUD badge + ice streaks show it.
const STEP = 1 / 60, MAXA = 8 * Math.PI / 180, AIM_ROT = .7, AIM_TIMEOUT = 8, CHARGE_HALF = .75;
// Stop model v^2 = 2*mu*d on a short, grippy party sheet: a draw to the button slides ~6 s. The house spans
// ~13% of the power meter. AI velocity noise of +-3% becomes about +-1.3 m at the house.
const MIN_V = 4, MAX_V = 8.6, FRICTION = 1.2, CURL_RATE = .045;
// WIND_MAX .12 m/s^2 drifts a full-strength crosswind draw ~2 m, about a house width: aim off, or sweep it back
const WIND_MAX = .12, WIND_KMH = 30, STREAKS = 40;
const SWEEP_DUR = .3, SWEEP_ACCEL = .55, SWEEP_FRICTION = .5;
const STONE_R = .16, REST = .85, ENDS = 2;
const SHEET_HALF_W = 2.3, SHEET_W = SHEET_HALF_W * 2, HACK_Z = 0, HOUSE_Z = 22, BACK_Z = 25.5, SHEET_FRONT = -4, SHEET_L = BACK_Z - SHEET_FRONT;
const R_OUTER = 1.83, R_MID = 1.22, R_INNER = .61, R_BUTTON = .18, R_HOUSE = R_OUTER;
const PH = ['count', 'aim', 'slide', 'settle', 'end', 'done'], F = 7; // snapshot floats per stone: x z vx vz owner alive bumps
const GOLD = new THREE.Color(0xffd23f);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const meterAt = tm => { const p = (tm / CHARGE_HALF) % 2; return p < 1 ? p : 2 - p; };

export function createCurl({ renderer, mode, n = 2, me = 0, bots = [], rand, send, label, onEnd }) {
  const online = mode === 'online';
  const IDX = [...Array(n).keys()];
  let auth = !online || me === 0;
  const SPE = n === 1 ? 4 : n === 2 ? 3 : 2, TOTAL = n * SPE;
  const dist = s => Math.hypot(s.x, s.z - HOUSE_Z);

  const scene = new THREE.Scene(), fogC = new THREE.Color(0x0a1428);
  scene.background = fogC;
  scene.fog = new THREE.Fog(fogC, 26, 110);
  lights(scene);
  const sky = addSky(scene, fogC, 0x1a5c9c);
  addCity(scene, { y: -2, n: 170, x0: -85, x1: 85, z0: -40, z1: 85, clear: (x, z) => Math.abs(x) < SHEET_HALF_W + 6 && z > SHEET_FRONT - 8 && z < BACK_Z + 8 });

  // long ice sheet: canvas rings (house), hog/tee/centre lines, hack mark. Drawn once; the geometry maps world x/z 1:1.
  const iceTex = canvasTex(118, 1024, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#6d84b4'); gr.addColorStop(1, '#8aa0cc'); // dim night ice: pale white blows out under bloom
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const wu = w / SHEET_W, zRow = z => (z - SHEET_FRONT) / SHEET_L * h, cx = w / 2, cy = zRow(HOUSE_Z);
    g.strokeStyle = 'rgba(255,70,70,.55)'; g.lineWidth = 3;
    [HOUSE_Z - 9, SHEET_FRONT + 7].forEach(z => { const y = zRow(z); g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); });
    g.strokeStyle = 'rgba(110,145,220,.55)'; g.beginPath(); g.moveTo(0, cy); g.lineTo(w, cy); g.stroke();
    g.strokeStyle = 'rgba(110,145,220,.3)'; g.beginPath(); g.moveTo(cx, 0); g.lineTo(cx, h); g.stroke();
    const ring = (r, col) => { g.beginPath(); g.ellipse(cx, cy, r * wu, r * wu, 0, 0, 7); g.fillStyle = col; g.fill(); };
    ring(R_OUTER, '#35b6ff'); ring(R_MID, '#c8d6f4'); ring(R_INNER, '#ff3a5a'); ring(R_BUTTON, '#ffffff');
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1;
    for (let k = 0; k < 50; k++) { const x = Math.random() * w, y = Math.random() * h, len = 16 + Math.random() * 50; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + len); g.stroke(); }
    g.fillStyle = '#222b45'; g.fillRect(cx - w * .12, zRow(HACK_Z) - 2, w * .24, 4);
  });
  const ice = new THREE.Mesh(new THREE.PlaneGeometry(SHEET_W, SHEET_L).rotateX(-Math.PI / 2).translate(0, 0, (BACK_Z + SHEET_FRONT) / 2),
    new THREE.MeshStandardMaterial({ map: iceTex, roughness: .35, metalness: .15, envMapIntensity: .4 }));
  scene.add(ice);
  const sideMat = new THREE.MeshBasicMaterial({ color: 0x35e0ff, toneMapped: false });
  for (const x of [-SHEET_HALF_W - .1, SHEET_HALF_W + .1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(.2, .15, SHEET_L), sideMat); e.position.set(x, .08, (BACK_Z + SHEET_FRONT) / 2); scene.add(e); }
  const back = new THREE.Mesh(new THREE.BoxGeometry(SHEET_W + .4, .15, .2), new THREE.MeshBasicMaterial({ color: 0xff3a5a, toneMapped: false }));
  back.position.set(0, .08, BACK_Z); scene.add(back);

  // stones: granite lathe body, coloured handle ring (recoloured per end as slots change owner), additive glow ring
  const stoneGeo = new THREE.LatheGeometry([[0, 0], [.16, 0], [.165, .03], [.15, .09], [.1, .13], [0, .14]].map(([r, y]) => new THREE.Vector2(r, y)), 20);
  const handleGeo = new THREE.TorusGeometry(.09, .025, 6, 16).rotateX(Math.PI / 2), glowGeo = new THREE.TorusGeometry(.19, .02, 6, 24).rotateX(Math.PI / 2);
  const graniteMat = new THREE.MeshStandardMaterial({ color: 0x2b2f3c, roughness: .5, metalness: .35 });
  const stoneVis = Array.from({ length: TOTAL }, () => {
    const g = new THREE.Group(), handleMat = new THREE.MeshStandardMaterial({ roughness: .3, metalness: .6, emissiveIntensity: .4 });
    const handle = new THREE.Mesh(handleGeo, handleMat); handle.position.y = .14;
    const glowMat = new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: .7 });
    const glow = new THREE.Mesh(glowGeo, glowMat); glow.position.y = .01;
    g.add(new THREE.Mesh(stoneGeo, graniteMat), handle, glow);
    g.visible = false;
    scene.add(g);
    return { g, handleMat, glowMat, owner: -1 };
  });

  // one delivery athlete per seat, crouched at the hack; only the current thrower's is shown
  const runners = IDX.map(i => {
    const r = makeRunner(COL[i]);
    r.rotation.y = Math.PI; // faces -z by default; the house is +z
    r.position.set(-.45, 0, HACK_Z - .5); // crouched beside/behind the stone at the hack, off-centre so the camera sees the stone
    r.visible = false;
    const tag = nameTag(label(i), COL[i]); tag.position.y = 2; r.add(tag);
    scene.add(r);
    return { r, tag };
  });

  // aim gizmo: arrow + shaft at the hack, length/colour track the power meter
  const aimMat = new THREE.MeshBasicMaterial({ color: 0xffd23f, toneMapped: false, transparent: true });
  const aimShaft = new THREE.Mesh(new THREE.BoxGeometry(.08, .05, 1).translate(0, 0, .5), aimMat);
  const aimArrow = new THREE.Mesh(new THREE.ConeGeometry(.13, .5, 3).rotateX(Math.PI / 2), aimMat);
  const aimGizmo = new THREE.Group(); aimGizmo.add(aimShaft, aimArrow); aimGizmo.position.set(0, .5, HACK_Z + .2);
  scene.add(aimGizmo);
  const burst = new Burst(scene);

  // settle read-out: gold strip from the stopped stone to the button (unit length along +z, scaled) + a distance tag
  const meas = new THREE.Mesh(new THREE.BoxGeometry(.05, .01, 1).translate(0, 0, .5), new THREE.MeshBasicMaterial({ color: 0xffd23f, toneMapped: false, depthTest: false }));
  meas.renderOrder = 2; meas.visible = false;
  const measTag = nameTag('', 0xffd23f); measTag.visible = false; measTag.scale.set(.2, .05, 1);
  let measTxt = '';
  scene.add(meas, measTag);

  // wind streaks: short additive dashes blowing over the sheet; speed, length and brightness follow the wind
  const streakPos = new Float32Array(STREAKS * 6), streakGeo = new THREE.BufferGeometry();
  streakGeo.setAttribute('position', new THREE.BufferAttribute(streakPos, 3));
  const streakMat = new THREE.LineBasicMaterial({ color: 0xdff6ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const streaks = new THREE.LineSegments(streakGeo, streakMat);
  streaks.frustumCulled = false;
  scene.add(streaks);
  const SX = 7, SZ0 = SHEET_FRONT - 4, SZ1 = BACK_Z + 4, wrap = (v, lo, hi) => ((v - lo) % (hi - lo) + (hi - lo)) % (hi - lo) + lo;
  const motes = Array.from({ length: STREAKS }, () => [(Math.random() * 2 - 1) * SX, .15 + Math.random() * 1.8, SZ0 + Math.random() * (SZ1 - SZ0)]);

  // sim state (authoritative on the host, mirrored from snapshots on guests)
  const S = {
    phase: 'count', end: 0, starter: 0, turn: -1, thrower: 0, aimA: 0, aimT: 0, charging: 0, chargeT: 0, meter: 0, settleT: 0, endT: 0,
    order: [], score: Array(n).fill(0), best: Array(n).fill(999),
    wa: 0, ws: 0, wx: 0, wz: 0, // wind angle, strength 0..1, acceleration vector
    stones: Array.from({ length: TOTAL }, () => ({ owner: 0, x: 0, z: 0, vx: 0, vz: 0, alive: 0, curl: 0, sweepT: 0, sweepSide: 0, bumps: 0 })),
  };
  // pick the first thrower now (first rand() call on every device, same seed) so the countdown already shows them
  S.starter = S.thrower = rand() * n | 0;
  const inp = IDX.map(() => ({ l: 0, r: 0, c: 0 }));
  const ctrl = new Set(online ? [me] : IDX), ai = new Set();
  const brain = IDX.map(() => ({ planned: false, wantA: 0, wantP: 0, holding: false, lastM: 0, sweepClock: 0 }));

  const panes = (online ? [me] : IDX).map(pi => {
    const v = makePane(pi, label, zones('◀', '●', '▶'));
    v.chips = rankChips(v, n, label);
    v.hint.textContent = coarse ? t('curlTouch') : t('curlKeys', keyHint(pi, online));
    const bar = document.createElement('div');
    bar.style.cssText = 'position:absolute;left:72px;right:72px;bottom:var(--sb);height:10px;border-radius:5px;overflow:hidden;background:rgba(255,255,255,.14)';
    const fill = document.createElement('i');
    fill.style.cssText = 'display:block;height:100%;width:0%';
    bar.appendChild(fill); v.el.appendChild(bar); v.fill = fill;
    const wind = document.createElement('div');
    wind.className = 'pwind';
    wind.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 2 19 11h-4.5v11h-5V11H5z"/></svg><b></b>';
    v.el.appendChild(wind);
    Object.assign(v, { wArrow: wind.firstChild, wTxt: wind.querySelector('b'), wLast: '' });
    v.cam = new THREE.PerspectiveCamera(60, 1, .1, 200); v.fov = 60;
    return v;
  });
  const chips = () => panes.forEach(v => v.chips(S.score.map(w => '★' + w)));
  const step = countdown(panes);
  const sc = makeShowcase(panes, label, onEnd);
  const champV = new THREE.Vector3();

  // --- turn / end flow (authority only)
  function updateProgress() { panes.forEach(v => { v.val.textContent = t('curlProgress', { e: S.end, s: Math.min(S.turn + 1, TOTAL), n: TOTAL }); }); }

  function nextThrow() {
    S.turn++;
    if (S.turn >= TOTAL) return scoreEnd();
    S.thrower = S.order[S.turn];
    Object.assign(S, { wa: Math.random() * Math.PI * 2, ws: .1 + Math.random() * .9 });
    windVec();
    Object.assign(S, { phase: 'aim', aimT: 0, aimA: 0, charging: 0, chargeT: 0, meter: 0 });
    const io = inp[S.thrower]; io.l = io.r = io.c = 0;
    Object.assign(brain[S.thrower], { planned: false });
    panes.forEach(v => flash(v.msg, t('curlTurn', { p: label(S.thrower) }), S.thrower === v.pi ? 'go' : ''));
    if (panes.length) sfx.turn();
    updateProgress();
  }

  function newEnd() {
    S.end++;
    if (S.end > 1) S.starter = (S.starter + 1) % n;
    S.order = Array.from({ length: TOTAL }, (_, k) => (S.starter + k) % n);
    S.stones.forEach((s, idx) => Object.assign(s, { owner: S.order[idx], x: 0, z: 0, vx: 0, vz: 0, alive: 0, curl: 0, sweepT: 0, sweepSide: 0, bumps: 0 }));
    S.turn = -1;
    if (panes.length) sfx.count();
    panes.forEach(v => flash(v.msg, t('curlEndStart', { n: S.end }), 'go'));
    nextThrow();
  }

  function scoreEnd() {
    S.stones.forEach(s => { const d = dist(s); if (d < S.best[s.owner]) S.best[s.owner] = d; });
    const inHouse = S.stones.filter(s => s.alive && dist(s) <= R_HOUSE);
    const pts = Array(n).fill(0);
    // solo: no rival stones to beat, so every stone in the house scores 0–100 by how close it sits to the button
    if (n === 1) pts[0] = inHouse.reduce((sum, st) => sum + Math.round(100 * (1 - dist(st) / R_HOUSE)), 0);
    else if (inHouse.length) {
      inHouse.sort((a, b) => dist(a) - dist(b));
      const leader = inHouse[0].owner, rival = inHouse.find(s => s.owner !== leader);
      const lim = rival ? dist(rival) : Infinity;
      pts[leader] = inHouse.filter(s => s.owner === leader && dist(s) < lim).length;
    }
    IDX.forEach(i => { S.score[i] += pts[i]; });
    S.phase = 'end'; S.endT = 0;
    const scorer = pts.findIndex(p => p > 0);
    panes.forEach(v => flash(v.msg, scorer >= 0 ? t('curlScores', { p: label(scorer), n: pts[scorer] }) : t('curlBlank'), scorer >= 0 ? 'great' : ''));
    if (panes.length) (scorer >= 0 ? sfx.finish() : sfx.good());
    chips();
  }

  let ended = false;
  function finish() {
    if (ended) return;
    ended = true;
    const order = [...IDX].sort((a, b) => S.score[b] - S.score[a] || S.best[a] - S.best[b]);
    const draw = S.score[order[0]] === S.score[order[1]] && Math.abs(S.best[order[0]] - S.best[order[1]]) < 1e-6;
    // orbit the winner's closest stone still in the house; falls back to the button if none survived
    const champAt = () => {
      const mine = S.stones.filter(s => s.alive && s.owner === order[0]).sort((a, b) => dist(a) - dist(b))[0];
      return champV.set(mine ? mine.x : 0, .3, mine ? mine.z : HOUSE_Z);
    };
    sc.start({ order, draw, scores: IDX.map(i => t('pts', { n: S.score[i] })) }, champAt, { r: 4.5, h: 2.6, look: .3 });
  }

  // --- physics (authority only)
  function windVec() { S.wx = Math.sin(S.wa) * S.ws * WIND_MAX; S.wz = Math.cos(S.wa) * S.ws * WIND_MAX; }

  function doThrow(i, aimA, meter) {
    S.charging = 0; S.chargeT = 0;
    const a = clamp(aimA, -MAXA, MAXA), p = clamp(meter, 0, 1), v0 = MIN_V + p * (MAX_V - MIN_V), s = S.stones[S.turn];
    Object.assign(s, { x: 0, z: HACK_Z, vx: Math.sin(a) * v0, vz: Math.cos(a) * v0, alive: 1, curl: (a >= 0 ? 1 : -1) * CURL_RATE, sweepT: 0, sweepSide: 0 });
    S.phase = 'slide'; S.aimA = a; S.meter = p;
    if (panes.length) sfx.toss();
  }

  function sweepCur(side) {
    const s = S.stones[S.turn];
    if (!s || !s.alive) return;
    s.sweepT = SWEEP_DUR; s.sweepSide = side;
    burst.emit(s.x, .18, s.z, 0xdff6ff, 6, 2);
    if (panes.length) sfx.pull();
  }

  function collide() {
    const st = S.stones;
    for (let a = 0; a < st.length; a++) for (let b = a + 1; b < st.length; b++) {
      const p = st[a], q = st[b];
      if (!p.alive || !q.alive) continue;
      let dx = q.x - p.x, dz = q.z - p.z, d = Math.hypot(dx, dz);
      if (d >= STONE_R * 2 || d < 1e-4) continue;
      dx /= d; dz /= d;
      const vn = (q.vx - p.vx) * dx + (q.vz - p.vz) * dz, push = (STONE_R * 2 - d) / 2;
      p.x -= dx * push; p.z -= dz * push; q.x += dx * push; q.z += dz * push;
      if (vn >= 0) continue;
      const j = -(1 + REST) * vn / 2;
      p.vx -= dx * j; p.vz -= dz * j; q.vx += dx * j; q.vz += dz * j;
      if (-vn > .6) {
        p.bumps++; q.bumps++;
        burst.emit((p.x + q.x) / 2, .16, (p.z + q.z) / 2, 0xdff2ff, 16, 4);
        if (panes.length) { sfx.bump(); buzz(25); }
      }
    }
  }

  function removeStone(s) {
    s.alive = 0; s.vx = 0; s.vz = 0;
    burst.emit(clamp(s.x, -SHEET_HALF_W - .3, SHEET_HALF_W + .3), .2, clamp(s.z, SHEET_FRONT, BACK_Z + .3), COL[s.owner], 20, 5);
    if (panes.length) { sfx.fall(); buzz(50); panes.forEach(v => flash(v.msg, t('out'), 'hit')); }
  }

  function slideTick(dt) {
    let moving = false;
    const cur = S.stones[S.turn];
    for (const s of S.stones) {
      if (!s.alive) continue;
      const sp = Math.hypot(s.vx, s.vz);
      if (sp < .03) { s.vx = s.vz = 0; continue; }
      moving = true;
      const swept = s === cur && s.sweepT > 0;
      const fr = swept ? FRICTION * SWEEP_FRICTION : FRICTION, nsp = Math.max(0, sp - fr * dt), k = nsp / sp;
      s.vx *= k; s.vz *= k;
      s.vx += (s.curl + S.wx) * dt; s.vz += S.wz * dt;
      if (swept) { s.vx += s.sweepSide * SWEEP_ACCEL * dt; s.sweepT = Math.max(0, s.sweepT - dt); }
      s.x += s.vx * dt; s.z += s.vz * dt;
    }
    collide();
    for (const s of S.stones) if (s.alive && (Math.abs(s.x) > SHEET_HALF_W + STONE_R || s.z > BACK_Z + STONE_R || s.z < SHEET_FRONT - STONE_R)) removeStone(s);
    if (!moving) { S.phase = 'settle'; S.settleT = 0; }
  }

  // shared aim integration: runs for whichever seat this device drives (human input or a local AI bot)
  function driveAim(dt) {
    const i = S.thrower;
    if (ai.has(i) && ctrl.has(i)) aiAim(i, dt);
    if (!ctrl.has(i)) return;
    const io = inp[i];
    S.aimA = clamp(S.aimA + (io.l - io.r) * AIM_ROT * dt, -MAXA, MAXA);
    if (io.c) { if (!S.charging) { S.charging = 1; S.chargeT = 0; } S.chargeT += dt; }
    if (S.charging) { const m = meterAt(S.chargeT); if (m >= .96 && S.meter < .96 && panes.length) sfx.signal(); S.meter = m; }
  }

  // AI: aim at the button, or try a takeout on the closest in-house rival stone; power from v^2=2*mu*d, +-6% noise;
  // hold until the meter is rising through the wanted value; sweep occasionally to pull the stone back to line.
  function aiAim(i, dt) {
    const b = brain[i];
    if (!b.planned) {
      b.planned = true;
      const thrown = S.stones.slice(0, S.turn).filter(s => s.alive && s.owner !== i && dist(s) <= R_HOUSE).sort((x, y) => dist(x) - dist(y));
      const tgt = thrown.length && dist(thrown[0]) < R_HOUSE * .6 && Math.random() < .6 ? thrown[0] : { x: 0, z: HOUSE_Z };
      const dz = Math.max(4, tgt.z - HACK_Z), mu = FRICTION - S.wz; // tailwind lowers the effective friction
      const drift = S.wx * dz / mu; // .5*wx*T^2 with T^2 = 2*dz/mu
      b.wantA = clamp(Math.atan2(tgt.x - drift, dz) + (Math.random() - .5) * .1, -MAXA, MAXA);
      const v0 = Math.sqrt(2 * mu * dz) * (1 + (Math.random() - .5) * .06);
      b.wantP = clamp((v0 - MIN_V) / (MAX_V - MIN_V), 0, 1);
      b.holding = false; b.lastM = 0; b.sweepClock = .2 + Math.random() * .4;
    }
    const io = inp[i], diff = b.wantA - S.aimA;
    io.l = diff > .01 ? 1 : 0; io.r = diff < -.01 ? 1 : 0;
    if (!b.holding && Math.abs(diff) < .02) { io.c = 1; b.holding = true; }
    if (b.holding && S.charging) {
      const rising = S.meter >= b.lastM; b.lastM = S.meter;
      if (rising && S.meter >= b.wantP) { io.c = 0; doThrow(i, S.aimA, S.meter); b.holding = false; }
    }
  }

  function aiSweepThink(dt) {
    const b = brain[S.thrower], s = S.stones[S.turn];
    if (!s || !s.alive) return;
    if ((b.sweepClock -= dt) > 0) return;
    b.sweepClock = .25 + Math.random() * .5;
    if (Math.abs(s.x) > .12) sweepCur(s.x > 0 ? -1 : 1);
  }

  function sim(dt) {
    if (S.phase === 'aim') {
      S.aimT += dt;
      driveAim(dt);
      if (S.phase === 'aim' && S.aimT >= AIM_TIMEOUT) doThrow(S.thrower, S.aimA, S.charging ? S.meter : .4);
    } else if (S.phase === 'slide') {
      if (ai.has(S.thrower) && ctrl.has(S.thrower)) aiSweepThink(dt);
      slideTick(dt);
    } else if (S.phase === 'settle') {
      if ((S.settleT += dt) > 2) nextThrow(); // 2 s: long enough for the close-up + distance read-out
    } else if (S.phase === 'end') {
      if ((S.endT += dt) > 2.6) { if (S.end >= ENDS) S.phase = 'done'; else newEnd(); }
    }
  }

  // --- networking
  const q2 = v => Math.round(v * 100) / 100;
  let simT = 0, acc = 0, sendAcc = 0, syncAcc = 0, gT = 0;
  const snaps = [];
  const num = x => typeof x === 'number' && Number.isFinite(x);
  const seat = x => Number.isInteger(x) && x >= 0 && x < n;

  function snapshot() {
    const st = [];
    S.stones.forEach(s => st.push(q2(s.x), q2(s.z), q2(s.vx), q2(s.vz), s.owner, s.alive, s.bumps));
    send({ t: 'cs', from: 0, k: q2(simT), ph: PH.indexOf(S.phase), e: S.end, tn: S.turn, th: S.thrower, a: q2(S.aimA), m: q2(S.meter), sc: S.score.slice(), bd: S.best.map(v => q2(Math.min(v, 999))), wa: q2(S.wa), ws: q2(S.ws), st });
  }

  function applySnap(m) {
    if (m.th !== S.thrower) { const io = inp[m.th]; if (io) io.l = io.r = io.c = 0; }
    const ph = PH[m.ph];
    if (ph === 'aim' && (S.phase !== 'aim' || m.th !== S.thrower)) { panes.forEach(v => flash(v.msg, t('curlTurn', { p: label(m.th) }), m.th === v.pi ? 'go' : '')); if (panes.length) sfx.turn(); }
    if (ph === 'slide' && S.phase === 'aim' && panes.length) sfx.toss();
    if (ph === 'end' && S.phase !== 'end') {
      const scorer = IDX.findIndex(i => m.sc[i] > S.score[i]);
      panes.forEach(v => flash(v.msg, scorer >= 0 ? t('curlScores', { p: label(scorer), n: m.sc[scorer] - S.score[scorer] }) : t('curlBlank'), scorer >= 0 ? 'great' : ''));
      if (panes.length) (scorer >= 0 ? sfx.finish() : sfx.good());
    }
    for (let i = 0; i < S.stones.length; i++) {
      const o = i * F, s = S.stones[i], was = s.alive;
      Object.assign(s, { x: m.st[o], z: m.st[o + 1], vx: m.st[o + 2], vz: m.st[o + 3], owner: m.st[o + 4], alive: m.st[o + 5], bumps: m.st[o + 6] });
      if (was && !s.alive && panes.length) { burst.emit(s.x, .2, s.z, COL[s.owner], 18, 5); sfx.fall(); }
    }
    const mine = ph === 'aim' && S.phase === 'aim' && m.th === S.thrower && ctrl.has(m.th) && !ai.has(m.th); // this device steers that throw: keep its own aim
    Object.assign(S, { phase: ph, end: m.e, turn: m.tn, thrower: m.th, aimA: mine ? S.aimA : m.a, meter: mine ? S.meter : m.m, score: m.sc.slice(), best: m.bd.slice(), wa: m.wa, ws: clamp(m.ws, 0, 1) });
    windVec();
    chips();
    if (ph === 'done') finish();
  }

  function onNet(m) {
    if (!m || typeof m.t !== 'string') return;
    const i = m.from;
    if (auth) {
      if (!seat(i) || i === 0 || ctrl.has(i)) return;
      if (m.t === 'ca' && i === S.thrower && S.phase === 'aim' && num(m.a) && (m.c === 0 || m.c === 1)) {
        S.aimA = clamp(m.a, -MAXA, MAXA);
        if (m.c && !S.charging) { S.charging = 1; S.chargeT = 0; }
        S.charging = !!m.c;
      } else if (m.t === 'ct' && i === S.thrower && S.phase === 'aim' && num(m.a) && num(m.p)) {
        doThrow(i, clamp(m.a, -MAXA, MAXA), clamp(m.p, 0, 1));
      } else if (m.t === 'cw' && i === S.thrower && S.phase === 'slide' && (m.s === 1 || m.s === -1)) {
        sweepCur(m.s);
      }
    } else if (m.t === 'cs' && i === 0 && num(m.k) && PH[m.ph] && seat(m.th) && num(m.a) && num(m.m) && num(m.wa) && num(m.ws)
      && Array.isArray(m.st) && m.st.length === S.stones.length * F && Array.isArray(m.sc) && m.sc.length === n && Array.isArray(m.bd) && m.bd.length === n) {
      if (snaps.length && m.k < snaps.at(-1).k) snaps.length = 0;
      snaps.push(m);
      if (snaps.length > 30) snaps.shift();
      applySnap(m);
    }
  }

  // --- input
  const act = (pi, a) => {
    if (!ctrl.has(pi) || ai.has(pi) || pi !== S.thrower) return;
    if (S.phase === 'aim') {
      const io = inp[pi];
      if (a === 'L') io.l = 1; else if (a === 'R') io.r = 1;
      else { io.c = 1; if (!S.charging) { S.charging = 1; S.chargeT = 0; } }
    } else if (S.phase === 'slide' && (a === 'L' || a === 'R')) {
      const side = a === 'L' ? 1 : -1; // camera looks down +z, so screen-left is +x: sweeping left pulls the stone left
      if (auth) sweepCur(side); else { send({ t: 'cw', from: pi, s: side }); if (panes.length) sfx.pull(); }
    }
  };
  const release = (pi, a) => {
    if (!ctrl.has(pi) || ai.has(pi) || pi !== S.thrower || S.phase !== 'aim') return;
    const io = inp[pi];
    if (a === 'L') io.l = 0;
    else if (a === 'R') io.r = 0;
    else if (io.c) {
      io.c = 0;
      if (S.chargeT < .15) { S.charging = 0; S.meter = 0; return; } // a quick tap on the middle cancels instead of a min-power throw
      const p = S.charging ? S.meter : 0;
      if (auth) doThrow(pi, S.aimA, p);
      else { S.charging = 0; send({ t: 'ct', from: pi, a: q2(S.aimA), p: q2(p) }); }
    }
  };
  const unbind = bindInput({ cv: renderer.domElement, panes, n, online, me, act, release });

  // --- frame
  let time = 0, aimKey = '', aimClk = 0;
  const camPos = new THREE.Vector3(0, 2.1, SHEET_FRONT - 2), camLook = new THREE.Vector3(0, .3, 10), tgt = new THREE.Vector3(), lookTgt = new THREE.Vector3();

  function update(dt) {
    time += dt;
    // 2 s before the aim timeout throws for you, warn the thrower (a local clock, so guests get it too)
    const key = S.phase === 'aim' ? `${S.end}:${S.turn}:${S.thrower}` : '';
    if (key !== aimKey) { aimKey = key; aimClk = 0; }
    else if (key && aimClk < AIM_TIMEOUT - 2 && (aimClk += dt) >= AIM_TIMEOUT - 2 && ctrl.has(S.thrower) && !ai.has(S.thrower)) {
      const v = panes.find(v => v.pi === S.thrower);
      if (v) { flash(v.msg, t('curlHurry'), 'miss'); sfx.tick(); }
    }
    if (S.phase === 'count') { if (!step(dt) && auth) newEnd(); }
    if (auth && S.phase !== 'count' && S.phase !== 'done') {
      acc = Math.min(acc + dt, .25);
      while (acc >= STEP) { acc -= STEP; simT += STEP; sim(STEP); }
      if (online && (sendAcc += dt) >= .05) { sendAcc = 0; snapshot(); }
    } else if (!auth) {
      gT += dt;
      if (S.phase === 'aim' && ctrl.has(S.thrower)) {
        driveAim(dt);
        if ((syncAcc -= dt) <= 0) { syncAcc = .07; send({ t: 'ca', from: me, a: q2(S.aimA), c: S.charging ? 1 : 0 }); }
      }
    }
    if (auth && S.phase === 'done') { if (online) snapshot(); finish(); }

    // stone interpolation buffer (guests only), like sumo.js
    const newest = snaps.at(-1);
    if (!auth && newest && Math.abs(gT - newest.k) > .3) gT = newest.k;
    const rt = gT - .1;
    let s0 = null, s1 = null;
    if (!auth) for (let k = snaps.length - 1; k > 0; k--) if (snaps[k - 1].k <= rt) { s0 = snaps[k - 1]; s1 = snaps[k]; break; }

    // the stone about to be thrown sits at the hack in the thrower's colour through the countdown and the aim
    const ready = S.phase === 'count' || S.phase === 'aim', heldIdx = ready ? Math.max(0, S.turn) : -1;
    S.stones.forEach((s, idx) => {
      const v = stoneVis[idx], held = idx === heldIdx, owner = held ? S.thrower : s.owner;
      if (v.owner !== owner) { v.owner = owner; v.handleMat.color.setHex(COL[owner]); v.handleMat.emissive.setHex(COL[owner]); v.glowMat.color.setHex(COL[owner]); }
      v.g.visible = !!s.alive || held;
      if (held) { v.g.position.set(0, .02, HACK_Z); return; }
      if (!s.alive) return;
      let x = s.x, z = s.z;
      if (s0) { const o = idx * F, f = Math.min(1, (rt - s0.k) / Math.max(1e-3, s1.k - s0.k)); x = s0.st[o] + (s1.st[o] - s0.st[o]) * f; z = s0.st[o + 1] + (s1.st[o + 1] - s0.st[o + 1]) * f; }
      v.g.position.set(x, .02, z);
      v.g.rotation.y += Math.hypot(s.vx, s.vz) * dt * 1.5;
    });

    // delivery runner + aim gizmo + power meter (only meaningful during 'aim')
    runners.forEach((r, i) => { r.r.visible = i === S.thrower && ready; });
    if (S.phase === 'aim') {
      const r = runners[S.thrower].r, u = r.userData;
      u.body.rotation.x = -.3 - S.meter * .3;
      u.armL.rotation.x = u.armR.rotation.x = -1.1 - S.meter * .3;
    }
    aimGizmo.visible = S.phase === 'aim';
    if (aimGizmo.visible) {
      aimGizmo.rotation.y = S.aimA;
      const len = 1 + S.meter * 3;
      aimShaft.scale.z = len; aimArrow.position.z = len + .25;
      aimMat.color.setHex(COL[S.thrower]).lerp(GOLD, S.meter); aimMat.opacity = .55 + S.meter * .45;
    }
    panes.forEach(v => {
      const show = S.phase === 'aim';
      v.fill.style.width = (show ? S.meter * 100 : 0) + '%';
      v.fill.style.background = v.fill.style.boxShadow = show ? hex(S.thrower) : 'transparent';
      if (show) v.fill.style.boxShadow = `0 0 10px ${hex(S.thrower)}`;
    });

    // wind: HUD badge (arrow in screen space: camera looks +z so screen-right is -x) + streaks over the ice
    const windOn = S.phase !== 'count' && S.phase !== 'done';
    const wTxt = windOn ? t('curlWind', { v: Math.round(S.ws * WIND_KMH) }) : '';
    const wRot = `rotate(${Math.atan2(-S.wx, S.wz).toFixed(2)}rad) scale(${(.75 + S.ws * .5).toFixed(2)})`;
    panes.forEach(v => {
      v.wArrow.parentNode.classList.toggle('on', windOn);
      if (v.wLast !== wTxt) { v.wLast = wTxt; v.wTxt.textContent = wTxt; }
      v.wArrow.style.transform = wRot;
    });
    const wl = Math.hypot(S.wx, S.wz) || 1, dx = S.wx / wl, dz = S.wz / wl, spd = (1.5 + S.ws * 12) * dt, len = .25 + S.ws * 1.3;
    streakMat.opacity = windOn ? .12 + S.ws * .35 : 0;
    motes.forEach((m, k) => {
      m[0] = wrap(m[0] + dx * spd, -SX, SX); m[2] = wrap(m[2] + dz * spd, SZ0, SZ1);
      const o = k * 6, y = m[1];
      streakPos[o] = m[0]; streakPos[o + 1] = y; streakPos[o + 2] = m[2];
      streakPos[o + 3] = m[0] - dx * len; streakPos[o + 4] = y; streakPos[o + 5] = m[2] - dz * len;
    });
    streakGeo.attributes.position.needsUpdate = true;

    // settle: close-up on the stone that just stopped, with its distance to the button
    const settled = S.phase === 'settle' && S.stones[S.turn]?.alive ? S.stones[S.turn] : null;
    meas.visible = measTag.visible = !!settled;
    if (settled) {
      const p = stoneVis[S.turn].g.position;
      meas.position.set(p.x, .03, p.z); meas.rotation.y = Math.atan2(-p.x, HOUSE_Z - p.z); meas.scale.z = Math.max(.01, Math.hypot(p.x, HOUSE_Z - p.z));
      measTag.position.set(p.x / 2, .45, (p.z + HOUSE_Z) / 2);
      const txt = t('curlDist', { d: dist(settled).toFixed(2) });
      if (txt !== measTxt) { measTxt = txt; measTag.userData.set(txt); }
    }

    // camera: behind the hack while aiming, chases the live stone while sliding, overhead of the house otherwise
    const k = 1 - Math.exp(-dt * 4);
    if (S.phase === 'aim' || S.phase === 'count') { tgt.set(Math.sin(S.aimA) * 1.1, 3.6, SHEET_FRONT - 3.4); lookTgt.set(0, 0, HOUSE_Z * .7); } // high enough to see the house over the athlete
    else if (S.phase === 'slide' && S.stones[S.turn]) { const st = S.stones[S.turn]; tgt.set(st.x * .4, 3.2, st.z - 6); lookTgt.set(st.x, .2, st.z + 3); }
    else if (settled) { const d = dist(settled), mz = (settled.z + HOUSE_Z) / 2, h = clamp(1.6 + d * .6, 1.6, 6); tgt.set(settled.x * .5, h, mz - h * 1.6); lookTgt.set(settled.x / 2, 0, mz); } // low oblique like the chase cam (top-down blows out the ice under bloom), framing stone + button
    else { tgt.set(0, 13, HOUSE_Z - .2); lookTgt.set(0, 0, HOUSE_Z); }
    camPos.lerp(tgt, k); camLook.lerp(lookTgt, k);
    burst.update(dt);
    sc.update(dt);
  }

  function resize() {
    layout(panes);
    for (const v of panes) { v.cam.aspect = v.w / v.h; v.fov = fitFov(v.cam.aspect, 26, 50, 90); }
  }

  function render() {
    renderPanes(renderer, scene, panes, v => {
      const c = v.cam;
      if (sc.on) { sc.cam(v, c, v.fov); sky.position.copy(c.position); return c; }
      c.position.copy(camPos); c.lookAt(camLook);
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
    runners[i].tag.userData.set(label(i));
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
