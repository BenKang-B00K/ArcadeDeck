import * as THREE from 'three';
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { COL, disposeScene, flash, buzz, Burst } from './fx.js';
import { coarse, keyHint, zones, makePane, rankChips, layout, fitFov, renderPanes, bindInput, countdown, makeShowcase, addSky, addCity, lights, makeRunner, animRunner, placeRunner, nameTag } from './stage.js';

// Hex Drop: falling-floor survival on 3 stacked hex arenas. You always walk forward; hold L/R to turn, tap A to
// hop a short gap. Standing on a tile cracks it — it falls away 0.45 s later and you drop to the layer below
// (or out, past the bottom). First to 2 round wins (max 3 rounds), like sumo.
// Online is host-authoritative like sumo.js: guests send turn state + hop presses, the host simulates on a fixed
// step and broadcasts ~20 Hz snapshots (player floats + newly-touched tile ids) plus a full tile bitset every 2 s
// so a guest that missed packets resyncs. Guests draw rivals interpolated ~100 ms back and their own player
// extrapolated from the last snapshot; the shared crack/fall timer (stepTiles) runs locally on every device once
// it knows a tile was touched, so the animation needs no further sync.
const RAD = 6, NCELL = 3 * RAD * RAD + 3 * RAD + 1, LR = 3, LY = [20, 10, 0]; // hex radius 6 → 127 tiles/layer; 10 m apart so the chase cam fits between floors
const TOTAL = LR * NCELL, TILE_H = .35, SPACE = Math.sqrt(3); // circumradius 1 → centre-to-centre spacing √3
const WALK = 2.6, ROT = 2.6, G = 16, HOP_AIR = .5, HOP_COOL = .6, HOP_V = G * HOP_AIR / 2;
const FALL_DELAY = .45, SHARD_T = 1.1, NSHARD = 240, PR = .5, OUT_MARGIN = 3, NHOLE = 6;
const CRUMBLE_CAP = 70, HARD_CAP = 95, WINS = 2, MAX_ROUNDS = 3, STEP = 1 / 60, F = 7; // snapshot floats/player: x z y h vy layer alive
const ST = ['count', 'play', 'end', 'done'];
const LCOL = [0x35e0ff, 0xff3aa8, 0xffd23f]; // top / mid / bottom layer neon colours

// axial (flat-top) hex grid, radius RAD, cells indexed 0..NCELL-1; pure geometry, shared by every match instance
const QR = [], W = 2 * RAD + 1, IDXOF = new Int16Array(W * W).fill(-1);
const ofs = (q, r) => (q + RAD) * W + (r + RAD);
for (let q = -RAD; q <= RAD; q++) for (let r = Math.max(-RAD, -q - RAD); r <= Math.min(RAD, -q + RAD); r++) { IDXOF[ofs(q, r)] = QR.length; QR.push([q, r]); }
const CX = QR.map(([q]) => 1.5 * q), CZ = QR.map(([q, r]) => Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
const wx = c => CX[c], wz = c => CZ[c];
function cellAt(x, z) { // world (x,z) → nearest hex cell index, or -1 off the grid (cube-rounded axial pick)
  const q = 2 / 3 * x, r = -1 / 3 * x + Math.sqrt(3) / 3 * z, y = -q - r;
  let rq = Math.round(q), ry = Math.round(y), rr = Math.round(r);
  const dq = Math.abs(rq - q), dy = Math.abs(ry - y), dr = Math.abs(rr - r);
  if (dq > dy && dq > dr) rq = -ry - rr; else if (dy > dr) ry = -rq - rr; else rr = -rq - ry;
  if (rq < -RAD || rq > RAD || rr < -RAD || rr > RAD) return -1;
  return IDXOF[ofs(rq, rr)];
}
const fwd = h => [-Math.sin(h), -Math.cos(h)]; // heading 0 faces -z, matching makeRunner
const floorFor = y => { for (let L = 0; L < LR; L++) if (y > LY[L] - 3) return LY[L]; return LY[LR - 1]; }; // nearest floor plane, for shadow/pose only

export function createHex({ renderer, mode, n = 2, me = 0, bots = [], rand, send, label, onEnd }) {
  const online = mode === 'online';
  const IDX = [...Array(n).keys()];
  let auth = !online || me === 0;

  const scene = new THREE.Scene(), fogC = new THREE.Color(0x070a1c);
  scene.background = fogC;
  scene.fog = new THREE.Fog(fogC, 30, 130);
  lights(scene);
  const sky = addSky(scene, fogC, 0x3a1a6c);
  addCity(scene, { y: -55, n: 200, x0: -140, x1: 140, z0: 140, z1: -140, clear: (x, z) => Math.hypot(x, z) < 20 });

  // three stacked hex floors: one InstancedMesh per layer (fixed slot per cell so single tiles can be hidden/animated)
  const TILE_GEO = new THREE.CylinderGeometry(.92, 1, TILE_H, 6).rotateY(Math.PI / 6);
  const meshes = LCOL.map(c => {
    const m = new THREE.InstancedMesh(TILE_GEO, new THREE.MeshStandardMaterial({ roughness: .45, metalness: .3, emissive: c, emissiveIntensity: .12 }), NCELL);
    m.frustumCulled = false;
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(m);
    return m;
  });
  const RIM_R = RAD * SPACE + .6;
  LCOL.forEach((c, L) => {
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(RIM_R, RIM_R, .08, 64, 1, true), new THREE.MeshBasicMaterial({ color: c, toneMapped: false, side: THREE.DoubleSide, transparent: true, opacity: .5 }));
    rim.position.y = LY[L] - TILE_H / 2 - .05;
    scene.add(rim);
  });
  const M = new THREE.Matrix4(), P = new THREE.Vector3(), Qd = new THREE.Quaternion(), CC = new THREE.Color(), SCF = new THREE.Vector3(), AX = new THREE.Vector3();
  const SC1 = new THREE.Vector3(1, 1, 1), SC0 = new THREE.Vector3(1e-4, 1e-4, 1e-4);
  const HOT = new THREE.Color(0xff8a2a), WHITE_HOT = new THREE.Color(0xffe0b0), BASE = LCOL.map(c => new THREE.Color(c).multiplyScalar(.3));

  // shatter: a breaking tile splits into its 6 triangular wedges, which pop out, tumble and fall (one pooled InstancedMesh)
  const wedge = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(.96, 0), new THREE.Vector2(.48, .83)]), { depth: TILE_H, bevelEnabled: false });
  wedge.rotateX(-Math.PI / 2).translate(-.48, -TILE_H / 2, .277); // centroid at the origin so it spins in place
  const shardMesh = new THREE.InstancedMesh(wedge, new THREE.MeshStandardMaterial({ roughness: .45, metalness: .3 }), NSHARD);
  shardMesh.frustumCulled = false;
  shardMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(shardMesh);
  const sh = Array.from({ length: NSHARD }, () => ({ life: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), q0: new THREE.Quaternion(), ax: new THREE.Vector3(), a: 0, w: 0, L: 0 }));
  for (let k = 0; k < NSHARD; k++) { shardMesh.setMatrixAt(k, M.compose(P.set(0, -99, 0), Qd.identity(), SC0)); shardMesh.setColorAt(k, CC.set(0)); }
  let shardI = 0, shardsLive = 0;
  function shatter(id) {
    const L = id / NCELL | 0, c = id % NCELL, x = wx(c), y = LY[L] - TILE_H / 2, z = wz(c);
    for (let k = 0; k < 6; k++) {
      const s = sh[shardI], a = k * Math.PI / 3, oa = a + Math.PI / 6, sp = 1.2 + Math.random() * 1.6;
      shardI = (shardI + 1) % NSHARD;
      if (s.life <= 0) shardsLive++;
      s.life = SHARD_T * (.8 + Math.random() * .4); s.L = L;
      s.p.set(x + Math.cos(oa) * .55, y, z - Math.sin(oa) * .55);
      s.v.set(Math.cos(oa) * sp, 1 + Math.random() * 2.2, -Math.sin(oa) * sp);
      s.q0.setFromAxisAngle(AX.set(0, 1, 0), a);
      s.ax.set(Math.random() - .5, Math.random() * .3, Math.random() - .5).normalize(); s.a = 0; s.w = 4 + Math.random() * 7;
    }
    debris.emit(x, y + .2, z, 0xff9a40, 10, 3.2); // hot sparks
    debris.emit(x, y, z, LCOL[L], 8, 2); // layer-tinted dust
  }
  function drawShards(dt) {
    if (!shardsLive) return;
    for (let k = 0; k < NSHARD; k++) {
      const s = sh[k];
      if (s.life <= 0) continue;
      if ((s.life -= dt) <= 0) { shardsLive--; shardMesh.setMatrixAt(k, M.compose(P.set(0, -99, 0), Qd.identity(), SC0)); continue; }
      s.v.y -= G * dt; s.p.addScaledVector(s.v, dt); s.a += s.w * dt;
      const f = s.life / SHARD_T; // 1 → 0
      SCF.setScalar(Math.min(1, f * 2.5)); // shrink away over the last stretch
      shardMesh.setMatrixAt(k, M.compose(s.p, Qd.setFromAxisAngle(s.ax, s.a).multiply(s.q0), SCF));
      shardMesh.setColorAt(k, CC.copy(BASE[s.L]).lerp(HOT, Math.min(1, f * 1.2))); // cools from glowing orange back to the layer tint
    }
    shardMesh.instanceMatrix.needsUpdate = true; shardMesh.instanceColor.needsUpdate = true;
  }

  // tile state: alive (present), touch (>0 while cracking, counts down to 0), plus small "active" lists so only
  // changed/falling tiles get a per-frame matrix update (most of the 381 tiles sit untouched all match)
  const alive = new Uint8Array(TOTAL), touch = new Float32Array(TOTAL);
  let cracking = [], touchQ = [];
  const preholes = []; // seeded pre-missing holes, identical on every device from the shared match seed
  for (let L = 0; L < LR; L++) {
    let made = 0, tries = 0;
    while (made < NHOLE && tries < 300) {
      tries++;
      const idx = Math.floor(rand() * NCELL), [q, r] = QR[idx];
      if (Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) < 3) continue; // keep the spawn ring clear
      preholes.push(L * NCELL + idx); made++;
    }
  }
  function hideTile(id) {
    const L = id / NCELL | 0, c = id % NCELL;
    meshes[L].setMatrixAt(c, M.compose(P.set(wx(c), LY[L] - 30, wz(c)), Qd.identity(), SC0));
    meshes[L].instanceMatrix.needsUpdate = true;
  }
  function restTile(id) {
    const L = id / NCELL | 0, c = id % NCELL;
    meshes[L].setMatrixAt(c, M.compose(P.set(wx(c), LY[L] - TILE_H / 2, wz(c)), Qd.identity(), SC1));
    meshes[L].setColorAt(c, CC.setHex(LCOL[L]).multiplyScalar(.3)); // dim layer tint; white blows out under bloom
    meshes[L].instanceMatrix.needsUpdate = true;
    if (meshes[L].instanceColor) meshes[L].instanceColor.needsUpdate = true;
  }
  function resetTiles() {
    alive.fill(1); touch.fill(0); cracking.length = 0;
    for (const id of preholes) alive[id] = 0;
    for (let id = 0; id < TOTAL; id++) alive[id] ? restTile(id) : hideTile(id);
  }
  function crack(id, bcast) { // a tile gets touched: starts cracking, falls after FALL_DELAY
    if (!alive[id] || touch[id] > 0) return;
    touch[id] = FALL_DELAY;
    cracking.push(id);
    if (bcast) touchQ.push(id);
    const L = id / NCELL | 0, c = id % NCELL;
    debris.emit(wx(c), LY[L] + .05, wz(c), LCOL[L], 3, 1.1); // puff of dust where the foot lands
    if (panes.length) sfx.crack();
  }
  const touchTile = id => crack(id, true); // authority only: also queues the id for the next broadcast
  function knockOff(id) { // a standing player loses their tile: they start falling next tick
    if (!auth) return;
    const L = id / NCELL | 0, c = id % NCELL;
    for (const p of S.p) if (p.alive && p.grounded && p.layer === L && cellAt(p.x, p.z) === c) p.grounded = false;
  }
  function stepTiles(dt) { // crack countdown → fall; runs on every device so the animation needs no extra sync
    for (let k = cracking.length - 1; k >= 0; k--) {
      const id = cracking[k];
      if (!alive[id]) { cracking.splice(k, 1); continue; }
      if ((touch[id] -= dt) <= 0) { alive[id] = 0; hideTile(id); shatter(id); cracking.splice(k, 1); knockOff(id); }
    }
  }
  function drawTiles(time, dt) { // cracking tiles heat up, sag and rattle harder until they shatter
    for (const id of cracking) {
      const L = id / NCELL | 0, c = id % NCELL, f = 1 - touch[id] / FALL_DELAY, j = f * f;
      const rattle = Math.sin(time * (30 + 50 * f) + id) * .06 * j; // per-tile wobble, speeds up as it gives way
      AX.set(Math.sin(id * 12.9), 0, Math.cos(id * 7.3)).normalize();
      meshes[L].setMatrixAt(c, M.compose(P.set(wx(c), LY[L] - TILE_H / 2 - j * .14, wz(c)), Qd.setFromAxisAngle(AX, rattle), SC1));
      const pulse = .5 + .5 * Math.sin(time * (12 + 40 * f)); // warning throb quickens
      meshes[L].setColorAt(c, CC.copy(BASE[L]).lerp(HOT, Math.min(1, f * 1.6)).lerp(WHITE_HOT, j * pulse * .7));
      meshes[L].instanceMatrix.needsUpdate = true; meshes[L].instanceColor.needsUpdate = true;
    }
    drawShards(dt);
  }

  // players: athletes on the floor, name-tagged, hop = a real ballistic arc (shared with "fell through a gap")
  const runners = IDX.map(i => {
    const rig = makeRunner(COL[i]), tag = nameTag(label(i), COL[i]);
    tag.position.y = 2.3; rig.add(tag);
    scene.add(rig);
    return { rig, tag };
  });
  const burst = new Burst(scene), debris = new Burst(scene, 400);

  const S = {
    st: 'count', stT: 0, round: 1, T: 0, wins: Array(n).fill(0), surv: Array(n).fill(0), falls: Array(n).fill(0),
    p: IDX.map(() => ({ x: 0, z: 0, y: 0, vy: 0, h: 0, layer: 0, grounded: true, alive: 1, hopCd: 0 })),
  };
  const inp = IDX.map(() => ({ l: 0, r: 0 }));
  const ctrl = new Set(online ? [me] : IDX), ai = new Set(), brain = IDX.map(() => ({ think: 0 }));

  const panes = (online ? [me] : IDX).map(pi => {
    const v = makePane(pi, label, zones('↺', '▲', '↻'));
    v.chips = rankChips(v, n, label);
    v.hint.textContent = coarse ? t('hexTouch') : t('hexKeys', keyHint(pi, online));
    v.cam = new THREE.PerspectiveCamera(60, 1, .1, 260); v.fov = 60;
    v.cp = new THREE.Vector3(0, 36, 24); v.look = new THREE.Vector3(0, 8, 0);
    return v;
  });
  const paneOf = i => panes.find(v => v.pi === i);
  const shown = i => !!paneOf(i);
  const chips = () => panes.forEach(v => v.chips(S.wins.map(w => '★' + w)));
  let step = countdown(panes);

  function place() {
    for (const i of IDX) {
      const p = S.p[i], a = i / n * Math.PI * 2 + Math.PI / 4, R = 5.2, c = cellAt(Math.cos(a) * R, Math.sin(a) * R);
      Object.assign(p, { x: wx(c), z: wz(c), y: LY[0], vy: 0, h: Math.atan2(Math.sin(a), -Math.cos(a)), layer: 0, grounded: true, alive: 1, hopCd: 0 });
      inp[i].l = 0; inp[i].r = 0;
    }
    S.T = 0;
  }
  function roundStart() {
    S.st = 'count'; S.stT = 0;
    place();
    resetTiles();
    step = countdown(panes);
    panes.forEach(v => { v.val.textContent = t('hexRound', { n: S.round }); v.hint.classList.remove('hide'); });
    chips();
  }

  // --- physics (authority only)
  function checkLand(p, i) { // while falling, test every layer boundary crossed this tick for a tile to land on
    if (p.grounded || p.vy > 0) return;
    let L = p.layer;
    while (p.y <= LY[L]) {
      const c = cellAt(p.x, p.z), id = c >= 0 ? L * NCELL + c : -1;
      if (id >= 0 && alive[id]) {
        p.y = LY[L]; p.vy = 0; p.grounded = true;
        if (L > p.layer) S.falls[i]++;
        p.layer = L;
        touchTile(id);
        return;
      }
      if (L >= LR - 1) return; // nothing below the bottom layer; keep falling (handled by the out-of-bounds check)
      L++;
    }
  }
  function hop(i) {
    const p = S.p[i];
    if (S.st !== 'play' || !p.alive || !p.grounded || p.hopCd > 0) return;
    p.vy = HOP_V; p.grounded = false; p.hopCd = HOP_COOL;
    if (shown(i)) sfx.jump();
  }
  function think(i, dt) { // AI: look ahead for the safest heading, hop a missing/cracking tile if one exists beyond it
    const p = S.p[i], b = brain[i], io = inp[i];
    if (!p.grounded) return;
    if ((b.think -= dt) > 0) return;
    b.think = .15 + Math.random() * .15;
    let best = 0, bestScore = -1e9;
    for (const off of [0, .8, -.8, 1.6, -1.6]) {
      const [fx, fz] = fwd(p.h + off);
      let score = -Math.abs(off) * .4;
      for (let s = 1; s <= 3; s++) {
        const c = cellAt(p.x + fx * s * SPACE, p.z + fz * s * SPACE), id = c >= 0 ? p.layer * NCELL + c : -1;
        if (id < 0 || !alive[id]) { score -= 4; break; }
        score += touch[id] > 0 ? .3 : 1.5;
      }
      score += Math.random() * .6;
      if (score > bestScore) { bestScore = score; best = off; }
    }
    io.l = best > .3 ? 1 : 0; io.r = best < -.3 ? 1 : 0;
    if (p.hopCd <= 0) {
      const [fx, fz] = fwd(p.h);
      const c1 = cellAt(p.x + fx * SPACE, p.z + fz * SPACE), id1 = c1 >= 0 ? p.layer * NCELL + c1 : -1;
      const c2 = cellAt(p.x + fx * SPACE * 2, p.z + fz * SPACE * 2), id2 = c2 >= 0 ? p.layer * NCELL + c2 : -1;
      if ((id1 < 0 || !alive[id1]) && id2 >= 0 && alive[id2] && Math.random() < .5) hop(i);
    }
  }
  let crumbleAcc = 0;
  function crumble(dt) { // safety cap: past CRUMBLE_CAP, random tiles start giving way on their own to force an end
    if (S.T - CRUMBLE_CAP < dt) { panes.forEach(v => flash(v.msg, t('hexCrumble'), 'hit')); sfx.signal(); }
    crumbleAcc += dt;
    const ivl = Math.max(.03, .3 - (S.T - CRUMBLE_CAP) * .03);
    while (crumbleAcc >= ivl) { crumbleAcc -= ivl; touchTile(Math.floor(Math.random() * TOTAL)); }
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
      if (S.T > HARD_CAP) { // fail-safe: force the round to end so a stalemate can't run forever
        const rem = IDX.filter(i => S.p[i].alive);
        if (rem.length === 1) S.wins[rem[0]]++;
        S.st = 'end'; S.stT = 0; return;
      }
      if (S.T > CRUMBLE_CAP) crumble(dt);
    }
    const before = IDX.filter(i => S.p[i].alive), outs = [];
    for (const i of IDX) {
      const p = S.p[i], io = inp[i];
      if (play && ai.has(i) && ctrl.has(i)) think(i, dt);
      if (!p.alive) { p.vy -= G * dt; p.y += p.vy * dt; continue; }
      if (play) {
        p.h += (io.l - io.r) * ROT * dt;
        const [fx, fz] = fwd(p.h);
        p.x += fx * WALK * dt; p.z += fz * WALK * dt;
        S.surv[i] += dt;
      }
      if (p.hopCd > 0) p.hopCd -= dt;
      if (p.grounded) p.y = LY[p.layer]; else { p.vy -= G * dt; p.y += p.vy * dt; }
      checkLand(p, i);
      if (p.grounded && play) {
        const c = cellAt(p.x, p.z), id = c >= 0 ? p.layer * NCELL + c : -1;
        if (id >= 0 && alive[id]) touchTile(id); else p.grounded = false; // walked onto a hole or off the edge
      }
      if (!p.grounded && p.y < LY[LR - 1] - OUT_MARGIN) outs.push(i); // y alone: p.layer only tracks the last stood tile, not the current fall depth
    }
    stepTiles(dt);
    // light bump: push overlapping grounded players on the same floor apart (no momentum model to knock them with)
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
      const p = S.p[a], q = S.p[b];
      if (!p.alive || !q.alive || !p.grounded || !q.grounded || p.layer !== q.layer) continue;
      let dx = q.x - p.x, dz = q.z - p.z, d = Math.hypot(dx, dz);
      if (d >= PR * 2 || d < 1e-4) continue;
      dx /= d; dz /= d;
      const push = (PR * 2 - d) / 2;
      p.x -= dx * push; p.z -= dz * push; q.x += dx * push; q.z += dz * push;
    }
    // simultaneous wipe: whoever fell from the greatest height (still highest up) keeps the round; a true tie voids it
    if (play && outs.length && outs.length === before.length) {
      const maxY = Math.max(...outs.map(i => S.p[i].y)), top = outs.filter(i => S.p[i].y === maxY);
      if (top.length === 1) outs.splice(outs.indexOf(top[0]), 1);
    }
    for (const i of outs) { S.p[i].alive = 0; S.p[i].vy = Math.max(S.p[i].vy, 1); }
    if (play) {
      const remain = IDX.filter(i => S.p[i].alive);
      if (remain.length <= 1) { if (remain.length === 1) S.wins[remain[0]]++; S.st = 'end'; S.stT = 0; }
    }
  }

  // --- networking
  const q2 = v => Math.round(v * 100) / 100;
  const num = x => typeof x === 'number' && Number.isFinite(x);
  const arr = (a, len) => Array.isArray(a) && a.length === len && a.every(num);
  const int = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
  let simT = 0, acc = 0, sendAcc = 0, fullAcc = 0;
  function snapshot() {
    const p = [];
    S.p.forEach(s => p.push(q2(s.x), q2(s.z), q2(s.y), q2(s.h), q2(s.vy), s.layer, s.alive));
    send({ t: 'hs', from: 0, k: q2(simT), st: ST.indexOf(S.st), r: S.round, w: S.wins, sv: S.surv.map(q2), fa: S.falls, p, c: touchQ });
    touchQ = [];
  }
  const fullSync = () => send({ t: 'hf', from: 0, a: Array.from(alive).join('') });
  const snaps = [];
  let gT = 0;
  function applySnap(m) {
    for (const i of IDX) {
      const s = S.p[i], o = i * F, d = m.p.slice(o, o + F);
      if (s.alive && !d[6]) { burst.emit(s.x, s.y + .3, s.z, COL[i], 26, 5); if (shown(i)) { sfx.fall(); flash(paneOf(i).msg, t('hexOut'), 'hit'); } }
      Object.assign(s, { x: d[0], z: d[1], y: d[2], h: d[3], vy: d[4], layer: d[5], alive: d[6] });
    }
    for (const id of m.c) crack(id, false);
    const st = ST[m.st];
    if (st === 'count' && S.st !== 'count') { S.round = m.r; resetTiles(); step = countdown(panes); panes.forEach(v => { v.val.textContent = t('hexRound', { n: m.r }); v.hint.classList.remove('hide'); }); }
    if (st === 'end' && S.st === 'play') roundOver(IDX.find(i => m.w[i] > S.wins[i]));
    Object.assign(S, { st, round: m.r, wins: m.w.slice(), surv: m.sv.slice(), falls: m.fa.slice() });
    chips();
    if (st === 'done') finish();
  }
  function onNet(m) {
    if (!m || typeof m.t !== 'string') return;
    const i = m.from;
    if (auth) {
      if (!int(i, 1, n - 1) || ctrl.has(i)) return;
      if (m.t === 'hi' && [-1, 0, 1].includes(m.r)) { inp[i].l = m.r > 0 ? 1 : 0; inp[i].r = m.r < 0 ? 1 : 0; }
      else if (m.t === 'hj') hop(i);
    } else if (m.t === 'hs' && i === 0 && num(m.k) && int(m.st, 0, ST.length - 1) && int(m.r, 1, MAX_ROUNDS)
      && arr(m.w, n) && arr(m.sv, n) && arr(m.fa, n) && arr(m.p, n * F)
      && Array.isArray(m.c) && m.c.length < 200 && m.c.every(v => int(v, 0, TOTAL - 1))) {
      if (snaps.length && m.k < snaps.at(-1).k) snaps.length = 0;
      snaps.push(m);
      if (snaps.length > 30) snaps.shift();
      applySnap(m);
    } else if (m.t === 'hf' && i === 0 && typeof m.a === 'string' && m.a.length === TOTAL && /^[01]+$/.test(m.a)) {
      for (let id = 0; id < TOTAL; id++) if (m.a.charCodeAt(id) === 48 && alive[id]) { alive[id] = 0; hideTile(id); }
    }
  }

  // --- input
  let sentR = 0;
  function syncInput(i) {
    if (auth) return;
    const r = inp[i].l - inp[i].r;
    if (r !== sentR) { sentR = r; send({ t: 'hi', from: i, r }); }
  }
  const act = (pi, a) => {
    if (!ctrl.has(pi) || ai.has(pi)) return;
    if (a === 'L') inp[pi].l = 1;
    else if (a === 'R') inp[pi].r = 1;
    else if (a === 'A') { if (auth) hop(pi); else send({ t: 'hj', from: pi }); }
    syncInput(pi);
  };
  const release = (pi, a) => {
    if (!ctrl.has(pi) || ai.has(pi)) return;
    if (a === 'L') inp[pi].l = 0; else if (a === 'R') inp[pi].r = 0;
    syncInput(pi);
  };
  const unbind = bindInput({ cv: renderer.domElement, panes, n, online, me, act, release });

  // --- round / match end
  function roundOver(winner) {
    panes.forEach(v => flash(v.msg, winner != null ? t('hexTakes', { p: label(winner) }) : t('hexNoRound'), winner === v.pi ? 'go' : ''));
    if (winner != null && shown(winner)) sfx.finish();
  }
  const sc = makeShowcase(panes, label, onEnd);
  let ended = false;
  function finish() {
    if (ended) return;
    ended = true;
    const key = i => [S.wins[i], S.surv[i], S.falls[i]];
    const order = [...IDX].sort((a, b) => S.wins[b] - S.wins[a] || S.surv[b] - S.surv[a] || S.falls[b] - S.falls[a]);
    const draw = key(order[0]).every((v, k) => v === key(order[1])[k]);
    sc.start({ order, draw, scores: IDX.map(i => t('hexScore', { w: S.wins[i], s: S.surv[i].toFixed(0), f: S.falls[i] })) }, () => runners[order[0]].rig.position, { r: 4.5, h: 2.4, look: 1.3 });
  }

  // --- frame
  let time = 0, lastAlive = IDX.map(() => 1), lastLayer = IDX.map(() => 0);
  const gait = IDX.map(() => ({ ph: 0, x: 0, z: 0, amp: 0 })); // stride phase driven by distance walked, so feet don't skate
  function update(dt) {
    time += dt;
    if (S.st === 'count' && !step(dt) && auth) { S.st = 'play'; S.stT = 0; }
    if (S.st === 'play') panes.forEach(v => v.hint.classList.add('hide'));
    if (auth && S.st !== 'done') {
      acc = Math.min(acc + dt, .25);
      while (acc >= STEP) { acc -= STEP; simT += STEP; sim(STEP); }
      if (online && (sendAcc += dt) >= .05) { sendAcc = 0; snapshot(); }
      if (online && (fullAcc += dt) >= 2) { fullAcc = 0; fullSync(); }
      IDX.forEach(i => {
        const p = S.p[i];
        if (lastAlive[i] && !p.alive) { burst.emit(p.x, p.y + .3, p.z, COL[i], 26, 5); if (shown(i)) { sfx.fall(); buzz(60); flash(paneOf(i).msg, t('hexOut'), 'hit'); } }
        if (p.alive && p.layer > lastLayer[i]) burst.emit(p.x, p.y + .2, p.z, COL[i], 10, 3);
        lastAlive[i] = p.alive; lastLayer[i] = p.layer;
      });
      if (S.st === 'done') { if (online) snapshot(); finish(); }
    } else if (!auth) { gT += dt; stepTiles(dt); }

    // rivals interpolated ~100 ms back; a guest's own player is extrapolated from the last snapshot — copy sumo.js
    const newest = snaps.at(-1);
    if (!auth && newest && Math.abs(gT - newest.k) > .3) gT = newest.k;
    const rt = gT - .1;
    let s0 = null, s1 = null;
    if (!auth) for (let k = snaps.length - 1; k > 0; k--) if (snaps[k - 1].k <= rt) { s0 = snaps[k - 1]; s1 = snaps[k]; break; }
    IDX.forEach(i => {
      const p = S.p[i], rn = runners[i];
      let x = p.x, z = p.z, y = p.y, h = p.h;
      if (!auth && i === me && newest) {
        const e = Math.min(.15, Math.max(0, gT - newest.k)), [fx, fz] = fwd(p.h);
        x += fx * WALK * e; z += fz * WALK * e; y += p.vy * e - .5 * G * e * e;
      } else if (!auth && s0) {
        const f = Math.min(1, (rt - s0.k) / Math.max(1e-3, s1.k - s0.k)), o = i * F, a = s0.p, b = s1.p;
        x = a[o] + (b[o] - a[o]) * f; z = a[o + 1] + (b[o + 1] - a[o + 1]) * f; y = a[o + 2] + (b[o + 2] - a[o + 2]) * f;
        h = a[o + 3] + Math.atan2(Math.sin(b[o + 3] - a[o + 3]), Math.cos(b[o + 3] - a[o + 3])) * f;
      }
      const air = Math.abs(p.vy) > .05; // vy is 0 exactly while grounded (network-safe: sent every snapshot)
      rn.rig.visible = p.alive || y > -6;
      placeRunner(rn.rig, x, y, z, floorFor(y));
      rn.rig.rotation.y = h;
      const gt = gait[i], d = Math.min(.5, Math.hypot(x - gt.x, z - gt.z)); gt.x = x; gt.z = z;
      const moving = S.st === 'play' && p.alive && !air;
      gt.ph += d * 3.4; // ≈1.85 m per full stride at amp .6
      gt.amp += ((moving ? .6 : 0) - gt.amp) * Math.min(1, dt * 10); // ease between idle and walk
      if (air) animRunner(rn.rig, gt.ph, .3, .9);
      else if (gt.amp > .05) animRunner(rn.rig, gt.ph, gt.amp);
      else animRunner(rn.rig, time * 2 + i * 1.7, .04); // idle: weight shift, arms loose
      rn.tag.visible = rn.rig.visible;
    });
    drawTiles(time, dt);
    burst.update(dt); debris.update(dt);
    sc.update(dt);
  }

  function resize() {
    layout(panes);
    for (const v of panes) { v.cam.aspect = v.w / v.h; v.fov = fitFov(v.cam.aspect, 38, 55, 100); }
  }

  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  function render() {
    renderPanes(renderer, scene, panes, v => {
      const c = v.cam, p = S.p[v.pi], pos = runners[v.pi].rig.position, k = 1 - Math.exp(-(1 / 60) * 6);
      if (sc.on) { sc.cam(v, c, v.fov); sky.position.copy(c.position); return c; }
      if (p.alive) {
        const [fx, fz] = fwd(p.h);
        tmp.set(pos.x - fx * 7, pos.y + 4.4, pos.z - fz * 7); v.cp.lerp(tmp, k);
        tmp2.set(pos.x + fx * 4, pos.y + .6, pos.z + fz * 4); v.look.lerp(tmp2, k);
      } else { // out: overview of the whole stack
        tmp.set(0, 36, 24); v.cp.lerp(tmp, k);
        tmp2.set(0, 8, 0); v.look.lerp(tmp2, k);
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
    if (local && i === 0 && !auth) { auth = true; simT = snaps.at(-1)?.k ?? 0; }
    runners[i].tag.userData.set(label(i));
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
