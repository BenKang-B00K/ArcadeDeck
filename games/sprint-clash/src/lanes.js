import * as THREE from 'three';
import { sfx, holdMusic } from './audio.js';
import { t } from './i18n.js';
import { COL, canvasTex, disposeScene, flash, Burst } from './fx.js';
import { setText, coarse, keyHint, zones, makePane, rankChips, layout, fitFov, renderPanes, bindInput, countdown, addSky, addCity, lights, symTex } from './stage.js';

// Three-lane rhythm game. Everyone plays the same seeded chart on their own highway; hitting a note plays its
// D Dorian pitch, so the chart turns into a melody. Judged on the game clock (accumulated dt), never wall time.
// One of five songs (tempo, progression, rhythm feel, trick odds) is drawn from the shared seed each match.
// ponytail: no audio output latency calibration. Ceiling: Bluetooth audio drifts ~150 ms; add a one-tap offset screen if players complain.
const LEAD = 3.6, SPD = 14, LW = 1.4, GAP = 12; // count-in (s), note speed (units/s), lane width, highway spacing
const WIN = [.048, .092, .14], GRADE = ['perfect', 'great', 'good'], PTS = [100, 70, 40], HOLD_PTS = 50, EARLY = .12;
const LANEC = [0x8a6bff, 0xffd23f, 0x5cf2d0], SYM = ['L', 'A', 'R'], MAXN = 96, MAXH = 16, NBEAT = 10;
const mult = c => (c >= 50 ? 2.5 : c >= 25 ? 2 : c >= 10 ? 1.5 : 1);
const laneOf = d => (d < 3 ? 0 : d < 6 ? 1 : 2); // D E F | G A B | C D' E'
const JACK = .21; // two notes closer than this never share a lane (no same-button 16th jacks)

// 8-bar pad progressions (scale degrees, 0 = D4) and per-16th hit weights for one bar (beats × e-&-a).
// leap: lane-jump odds · run: 4-note chord-tone roll · hold / chord / tri: long, 2-lane, 3-lane notes · over: taps while holding
const Dm7 = [0, 2, 4, 6], Em7 = [1, 3, 5, 7], F7 = [2, 4, 6, 8], G = [3, 5, 7], G7 = [3, 5, 7, 9], Am7 = [4, 6, 8, 10], C = [6, 8, 10];
const SETS = [
  { bpm: 84, sky: 0x3a1a6c, prog: [Dm7, G, Am7, C, Dm7, G, C, Dm7], // Night Drive: steady eighths
    grid: [1, 0, .6, 0, .85, 0, .6, .1, 1, 0, .6, 0, .85, 0, .65, .15], leap: .15, run: .06, hold: .14, chord: .12, tri: .03, over: .2 },
  { bpm: 96, sky: 0x13406c, prog: [Dm7, Em7, F7, G, Dm7, Em7, F7, Am7], // Tidal Stairs: rolling arpeggios
    grid: [1, 0, .7, .1, .9, 0, .7, .15, 1, 0, .7, .1, .9, .1, .75, .2], leap: .1, run: .32, hold: .1, chord: .08, tri: .04, over: .3 },
  { bpm: 108, sky: 0x5a1450, prog: [Dm7, G7, Dm7, G7, Am7, G, C, Dm7], hat: 1, // Neon Offbeat: syncopated
    grid: [.8, 0, .3, .7, .2, 0, .9, 0, .7, 0, .3, .7, .2, 0, .9, .4], leap: .2, run: .1, hold: .12, chord: .15, tri: .05, over: .4 },
  { bpm: 120, sky: 0x0f4a44, prog: [Dm7, C, G, Dm7, F7, C, G7, Dm7], hat: 1, // Crosswind: lane jumps + chords
    grid: [1, 0, .7, .2, .9, 0, .7, .2, 1, 0, .7, .2, .9, .2, .7, .4], leap: .4, run: .12, hold: .14, chord: .22, tri: .07, over: .6 },
  { bpm: 136, sky: 0x6a1a1a, prog: [Dm7, Am7, G7, C, Dm7, Am7, F7, G7], hat: 1, // Storm Chaser: everything, fast
    grid: [1, .25, .7, .35, .9, .25, .75, .4, 1, .3, .7, .35, .9, .4, .8, .5], leap: .3, run: .3, hold: .15, chord: .25, tri: .1, over: .75 },
];

// one chord tone per lane (thirds-stacked chords always cover all three bands)
const triOf = ch => [0, 1, 2].map(l => [l * 3, l * 3 + 1, l * 3 + 2].find(d => ch.some(c => c % 7 === d % 7)) ?? l * 3);

// Chart: Dorian melody over the set's progression. Density ramps each phrase (16ths unlock after the first
// quarter), phrase ends resolve on a long chord root, and later phrases layer chords, rolls and taps over holds.
function makeChart(S, rand) {
  const BEAT = 60 / S.bpm, BAR = BEAT * 4, PH = Math.round(80 / (BAR * 4)); // ≈ 80 s at any tempo
  const notes = [];
  let deg = 4, lastT = -1, lastLane = -1, near = [];
  const add = (t, d, len = 0) => { const n = { t, deg: d, len, lane: laneOf(d) }; notes.push(n); deg = d; lastT = t; lastLane = n.lane; near = [n.lane]; return n; };
  const next = (at, avoid) => {
    const r = rand();
    let d = Math.max(0, Math.min(8, deg + (r < S.leap ? (rand() < .5 ? -3 : 3) : r < S.leap + .12 ? 0 : r < .6 + S.leap / 2 ? 1 : -1)));
    if (d === 5 && rand() < .3) d = 6; // B♮ is colour: touch it, don't sit on it
    const ban = at - lastT < JACK ? [avoid, ...near] : [avoid], l = laneOf(d);
    if (ban.includes(l)) { const ok = [0, 1, 2].filter(x => !ban.includes(x)).sort((a, b) => Math.abs(a - l) - Math.abs(b - l)); if (!ok.length) return -1; d = ok[0] * 3 + d % 3; } // -1: every lane just got hit, rest here
    return d;
  };
  const chordOn = (n, ch, avoid, d, close) => { // close: lanes hit a moment ago
    if (avoid < 0 && !close.length && d > .5 && rand() < S.tri) { triOf(ch).forEach((x, l) => l !== n.lane && notes.push({ t: n.t, deg: x, len: 0, lane: l, chord: true })); near = [0, 1, 2]; return; }
    const d2 = n.deg >= 5 ? n.deg - 4 : n.deg + 4, l2 = laneOf(d2);
    if (l2 !== n.lane && l2 !== avoid && !close.includes(l2)) { notes.push({ t: n.t, deg: d2, len: 0, lane: l2, chord: true }); near.push(l2); }
  };
  for (let ph = 0; ph < PH; ph++) {
    const d = ph / (PH - 1);
    for (let b = 0; b < 4; b++) {
      const bn = 1 + ph * 4 + b, bar0 = bn * BAR, ch = S.prog[bn % 8], cad = b === 3; // bar 0 is a kick-only intro
      let busyTo = -1, hl = -1;
      for (let s = 0; s < 16; s++) {
        const at = bar0 + s * BEAT / 4, busy = at < busyTo - 1e-6, avoid = busy ? hl : -1;
        if (cad) { // cadence: pickup, a 2-beat hold on the chord root, taps over it once the song heats up
          if (s === 0) { const x = next(at, -1); if (x >= 0) add(at, x); }
          else if (s === 4) { const h = add(at, ch[0] % 7, BEAT * 2); busyTo = at + h.len; hl = h.lane; }
          else if (busy && s > 5 && s % 2 === 0 && rand() < S.over * d) { const x = next(at, hl); if (x >= 0) add(at, x); }
          continue;
        }
        if (!busy && ph && s % 4 === 0 && s < 12 && rand() < S.run * d) { // roll across the chord: L-M-R-M or R-M-L-M
          const tri = triOf(ch), ord = lastLane === 0 ? [2, 1, 0, 1] : lastLane === 2 || rand() < .5 ? [0, 1, 2, 1] : [2, 1, 0, 1];
          ord.forEach((l, i) => add(at + i * BEAT / 4, tri[l]));
          s += 3; continue;
        }
        if ((s % 2 && d < .25) || rand() > Math.min(.97, S.grid[s] * (.45 + .65 * d))) continue;
        if (busy && rand() > S.over) continue;
        const close = at - lastT < JACK ? near : [], x = next(at, avoid);
        if (x < 0) continue;
        const n = add(at, x);
        if (!busy && ph && s % 4 === 0 && s < 12 && rand() < S.hold * (.5 + d)) {
          n.len = BEAT * (1 + (rand() * Math.min(3, (16 - s) / 4) | 0)); busyTo = at + n.len; hl = n.lane;
        } else if (ph && s % 2 === 0 && rand() < S.chord * (.3 + d)) chordOn(n, ch, avoid, d, close);
      }
    }
  }
  return notes.sort((a, b) => a.t - b.t);
}

export function createLanes({ renderer, mode, n = 2, me = 0, bots = [], rand, send, label, onEnd }) {
  const online = mode === 'online';
  const IDX = [...Array(n).keys()];
  const song = SETS[rand() * SETS.length | 0], BEAT = 60 / song.bpm, BAR = BEAT * 4, VIS = 52 / SPD; // look-ahead (s)
  const notes = makeChart(song, rand), NN = notes.length;
  const END = Math.max(...notes.map(x => x.t + x.len)) + 1.5;

  const scene = new THREE.Scene(), fogC = new THREE.Color(0x0a0f2c);
  scene.background = fogC;
  scene.fog = new THREE.Fog(fogC, 22, 70);
  lights(scene);
  const sky = addSky(scene, fogC, song.sky);
  const grid = canvasTex(64, 64, (g, w) => { g.fillStyle = '#070a1e'; g.fillRect(0, 0, w, w); g.strokeStyle = '#222b66'; g.lineWidth = 2; g.strokeRect(0, 0, w, w); });
  grid.wrapS = grid.wrapT = THREE.RepeatWrapping; grid.repeat.set(40, 40);
  grid.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(200, 200).rotateX(-Math.PI / 2).translate(0, -.05, -40), new THREE.MeshBasicMaterial({ map: grid })));

  const shown = online ? [me] : IDX, TX = IDX.map(i => (shown.indexOf(i) - (shown.length - 1) / 2) * GAP);
  addCity(scene, { y: -.05, n: 120, x0: -60 - GAP * 2, x1: 60 + GAP * 2, z0: -48, z1: -130, clear: x => Math.abs(x) < GAP * shown.length / 2 + 4 });

  // shared geometry for every highway
  const trackTex = canvasTex(64, 128, (g, w, h) => {
    g.fillStyle = '#0c1130'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#121a44'; for (let x = 0; x < 3; x++) g.fillRect(x * w / 3 + 2, 0, w / 3 - 4, h);
  });
  trackTex.wrapT = THREE.RepeatWrapping; trackTex.repeat.set(1, 12);
  const trackGeo = new THREE.PlaneGeometry(LW * 3 + .3, 60).rotateX(-Math.PI / 2).translate(0, 0, -26);
  const trackMat = new THREE.MeshStandardMaterial({ map: trackTex, roughness: .35, metalness: .5 });
  const railGeo = new THREE.BoxGeometry(.07, .06, 60).translate(0, .03, -26);
  const gemGeo = new THREE.CylinderGeometry(.55, .55, .28, 6), holdGeo = new THREE.BoxGeometry(.5, .08, 1).translate(0, 0, -.5);
  const beatGeo = new THREE.BoxGeometry(LW * 3, .02, .05), padGeo = new THREE.CylinderGeometry(.58, .62, .12, 6), symGeo = new THREE.PlaneGeometry(.7, .7).rotateX(-Math.PI / 2);
  const tex = SYM.map(symTex), white = new THREE.Color(0xffffff), grey = new THREE.Color(0x30365a), C = new THREE.Color();
  const M = new THREE.Matrix4(), P = new THREE.Vector3(), Q = new THREE.Quaternion(), S = new THREE.Vector3();

  function highway(i) {
    const x = TX[i], g = new THREE.Group();
    g.position.x = x;
    g.add(new THREE.Mesh(trackGeo, trackMat));
    const rail = new THREE.MeshBasicMaterial({ color: COL[i], toneMapped: false });
    const inner = new THREE.MeshBasicMaterial({ color: new THREE.Color(COL[i]).multiplyScalar(.35), toneMapped: false });
    for (let k = 0; k < 4; k++) { const r = new THREE.Mesh(railGeo, k % 3 ? inner : rail); r.position.x = (k - 1.5) * LW; g.add(r); }
    const hit = new THREE.Mesh(new THREE.BoxGeometry(LW * 3 + .3, .05, .09), new THREE.MeshBasicMaterial({ color: 0xeef2ff, toneMapped: false }));
    hit.position.y = .04; g.add(hit);
    const beats = new THREE.InstancedMesh(beatGeo, new THREE.MeshBasicMaterial({ color: 0x3a4a9a, toneMapped: false }), NBEAT);
    const gems = new THREE.InstancedMesh(gemGeo, new THREE.MeshBasicMaterial({ toneMapped: false }), MAXN);
    const holds = new THREE.InstancedMesh(holdGeo, new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: .6, depthWrite: false }), MAXH);
    for (const m of [beats, gems, holds]) { m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.count = 0; g.add(m); }
    const pads = LANEC.map((c, l) => {
      const mat = new THREE.MeshStandardMaterial({ color: 0x151a3a, emissive: c, emissiveIntensity: .25, roughness: .3, metalness: .5, flatShading: true });
      const pad = new THREE.Mesh(padGeo, mat); pad.position.set((l - 1) * LW, .02, .9);
      const sym = new THREE.Mesh(symGeo, new THREE.MeshBasicMaterial({ map: tex[l], color: c, transparent: true, depthWrite: false, toneMapped: false }));
      sym.position.y = .07; pad.add(sym);
      g.add(pad);
      return { mat, pad, glow: 0 };
    });
    scene.add(g);
    return { beats, gems, holds, pads };
  }

  // j[k]: 0 open, 1 done (tap hit / hold completed), 2 holding, 3 missed / dropped
  const players = IDX.map(i => ({
    i, local: !online || i === me, bot: false, score: 0, combo: 0, fin: null, sent: -1,
    j: new Uint8Array(NN), hold: [-1, -1, -1], plan: [], hw: shown.includes(i) ? highway(i) : null,
    cam: new THREE.PerspectiveCamera(60, 1, .1, 160), fov: 60,
  }));
  const burst = new Burst(scene);

  const panes = shown.map(pi => {
    const v = makePane(pi, label, zones('◀', '★', '▶'));
    v.chips = rankChips(v, n, label);
    v.hint.textContent = `♪ ${t('lanesSets').split('|')[SETS.indexOf(song)]} · ${song.bpm} BPM — ${coarse ? t('lanesTouch') : t('lanesKeys', keyHint(pi, online))}`;
    return v;
  });
  const paneOf = i => panes.find(v => v.pi === i);
  const chips = () => panes.forEach(v => v.chips(players.map(p => p.fin ?? p.score)));

  let T = -LEAD, ph = 'count', lastBeat = -1, lastHat = -1, sendT = 0, endT = 0, done = false;
  const step = countdown(panes);

  function feedback(p, k, grade) {
    const v = paneOf(p.i);
    if (!v) return;
    if (grade < 0) { flash(v.msg, t('miss'), 'hit'); sfx.miss(); return; }
    const nt = notes[k];
    flash(v.msg, p.combo >= 5 ? `${t(GRADE[grade])} ${t('lanesCombo', { n: p.combo })}` : t(GRADE[grade]), grade === 0 ? 'go' : 'great');
    if (!nt.chord) sfx.pitch(nt.deg, nt.len ? nt.len + .15 : .38, .13);
    burst.emit(TX[p.i] + (nt.lane - 1) * LW, .4, .9, LANEC[nt.lane], grade === 0 ? 16 : 8, 4);
  }

  function miss(p, k) {
    p.j[k] = 3; p.combo = 0;
    if (notes[k].len && p.hold[notes[k].lane] === k) p.hold[notes[k].lane] = -1;
    feedback(p, k, -1);
  }

  function press(p, lane) {
    const pad = p.hw?.pads[lane];
    if (pad) pad.glow = 1;
    if (T < -WIN[2] || p.fin != null) return;
    let k = -1;
    for (let q = 0; q < NN; q++) {
      const nt = notes[q];
      if (nt.t > T + WIN[2]) break;
      if (nt.lane === lane && !p.j[q] && Math.abs(nt.t - T) <= WIN[2]) { k = q; break; }
    }
    if (k < 0) return; // stray press: no penalty
    const d = Math.abs(notes[k].t - T), grade = d <= WIN[0] ? 0 : d <= WIN[1] ? 1 : 2;
    p.combo++;
    p.score += Math.round(PTS[grade] * mult(p.combo));
    if (notes[k].len) { p.j[k] = 2; p.hold[lane] = k; } else p.j[k] = 1;
    feedback(p, k, grade);
  }

  function release(p, lane) {
    const k = p.hold[lane];
    if (k < 0) return;
    const nt = notes[k];
    if (T >= nt.t + nt.len - EARLY) completeHold(p, k);
    else { miss(p, k); }
  }

  function completeHold(p, k) {
    p.j[k] = 1; p.hold[notes[k].lane] = -1;
    p.score += Math.round(HOLD_PTS * mult(p.combo));
    const v = paneOf(p.i);
    if (v) burst.emit(TX[p.i] + (notes[k].lane - 1) * LW, .4, .9, 0xffffff, 10, 3);
  }

  // AI: timing error ~N(0, 45 ms), 5% misses, 90% of holds released at the end
  const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
  const planOf = (p, k) => (p.plan[k] ??= { at: notes[k].t + gauss() * .045, miss: Math.random() < .05, rel: notes[k].t + notes[k].len * (Math.random() < .9 ? 1.05 : .3 + Math.random() * .4) });

  function judge(p) {
    for (let k = 0; k < NN; k++) {
      const nt = notes[k];
      if (nt.t > T + WIN[2]) break;
      if (p.j[k] === 0 && T > nt.t + WIN[2]) miss(p, k);
      else if (p.j[k] === 2 && T >= nt.t + nt.len) completeHold(p, k);
      if (!p.bot) continue;
      const pl = planOf(p, k);
      if (p.j[k] === 0 && !pl.miss && T >= pl.at) press(p, nt.lane);
      else if (p.j[k] === 2 && T >= pl.rel) release(p, nt.lane);
    }
  }

  function finish() {
    done = true;
    const fin = players.map(p => p.fin ?? p.score);
    const order = [...IDX].sort((a, b) => fin[b] - fin[a]);
    onEnd({ order, draw: fin[order[0]] === fin[order[1]], scores: fin.map(s => t('pts', { n: s })) });
  }

  function update(dt) {
    if (done) return;
    T += dt;
    if (ph === 'count' && !step(dt)) ph = 'play';
    // backing: kick every beat, pad chord every bar
    const b = Math.floor(T / BEAT);
    if (b > lastBeat && T >= 0 && T < END - 1) { lastBeat = b; sfx.kick(); if (b % 4 === 0) sfx.chord(song.prog[(b / 4) % 8], BAR); }
    if (song.hat && T > BEAT / 2 && Math.floor(T / BEAT - .5) > lastHat && T < END - 1) { lastHat = Math.floor(T / BEAT - .5); sfx.hat(); } // off-beat hats
    if (T > 2.5) panes.forEach(v => v.hint.classList.add('hide'));

    for (const p of players) {
      if (!p.local || p.fin != null) continue;
      judge(p);
      if (T >= END) { p.fin = p.score; if (online) send({ t: 'lf', from: p.i, s: p.fin }); }
    }
    if (online && (sendT -= dt) <= 0) {
      sendT = .25;
      for (const p of players) if (p.local && p.fin == null && p.score !== p.sent) { p.sent = p.score; send({ t: 'ls', from: p.i, s: p.score }); }
    }
    if (T >= END && ((endT += dt) > 3 || players.every(p => p.fin != null))) finish();

    // visuals
    for (const p of players) {
      const hw = p.hw;
      if (!hw) continue;
      let g = 0, h = 0;
      for (let k = 0; k < NN; k++) {
        const nt = notes[k], z0 = -(nt.t - T) * SPD, st = p.j[k];
        if (nt.t - T > VIS) break;
        if (st === 1 || z0 - nt.len * SPD > 4) continue; // hit, or fully past the camera
        const x = (nt.lane - 1) * LW, dead = st === 3;
        if (nt.len && h < MAXH) {
          const head = st === 2 ? 0 : z0, len = Math.max(0, head + (nt.t + nt.len - T) * SPD);
          hw.holds.setMatrixAt(h, M.compose(P.set(x, .06, head), Q.identity(), S.set(1, 1, Math.max(.01, len))));
          hw.holds.setColorAt(h++, dead ? grey : C.setHex(LANEC[nt.lane]).lerp(white, st === 2 ? .35 + .2 * Math.sin(T * 20) : 0));
        }
        if (st !== 2 && g < MAXN) {
          hw.gems.setMatrixAt(g, M.compose(P.set(x, .12, z0), Q.identity(), S.set(1, 1, .9)));
          hw.gems.setColorAt(g++, dead ? grey : C.setHex(LANEC[nt.lane]));
        }
      }
      hw.gems.count = g; hw.holds.count = h;
      let nb = 0;
      for (let k = Math.max(0, Math.ceil(T / BEAT)); nb < NBEAT; k++, nb++) hw.beats.setMatrixAt(nb, M.makeTranslation(0, .01, -(k * BEAT - T) * SPD));
      hw.beats.count = nb;
      for (const m of [hw.gems, hw.holds, hw.beats]) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
      hw.pads.forEach((pd, l) => {
        if (p.hold[l] >= 0) pd.glow = Math.max(pd.glow, .7);
        pd.glow = Math.max(0, pd.glow - dt * 4);
        pd.mat.emissiveIntensity = .25 + pd.glow * 1.6;
        pd.pad.position.y = .02 - pd.glow * .05;
      });
      const v = paneOf(p.i);
      if (v) setText(v.val, p.score);
    }
    chips();
    burst.update(dt);
  }

  function resize() {
    layout(panes);
    for (const v of panes) { const p = players[v.pi]; p.cam.aspect = v.w / v.h; p.fov = fitFov(p.cam.aspect, 22, 55, 95); }
  }

  function render() {
    renderPanes(renderer, scene, panes, v => {
      const p = players[v.pi], c = p.cam, x = TX[v.pi];
      c.position.set(x, 4.4, 7.4);
      c.lookAt(x, 0, -8);
      if (v.flip) c.rotateZ(Math.PI);
      c.fov = p.fov; c.updateProjectionMatrix();
      sky.position.copy(c.position);
      return c;
    });
  }

  const lane = a => SYM.indexOf(a);
  const act = (pi, a) => { const p = players[pi]; if (p?.local && !p.bot && ph === 'play') press(p, lane(a)); };
  const rel = (pi, a) => { const p = players[pi]; if (p?.local && !p.bot) release(p, lane(a)); };
  const unbind = bindInput({ cv: renderer.domElement, panes, n, online, me, act, release: rel });

  function onNet(m) {
    const p = players[m.from];
    if (!p || p.local || !Number.isFinite(m.s) || m.s < 0 || m.s > 1e7) return;
    if (m.t === 'ls' && p.fin == null) p.score = Math.round(m.s);
    else if (m.t === 'lf' && p.fin == null) p.fin = p.score = Math.round(m.s);
  }

  function botify(i, local) {
    const p = players[i];
    if (!p) return;
    p.bot = true;
    if (local && !p.local) { // take over a remote seat mid-chart: keep their score, skip notes already behind the clock
      p.local = true;
      for (let k = 0; k < NN; k++) if (notes[k].t < T + .2) p.j[k] = 1;
    }
    chips();
  }

  function dispose() {
    unbind();
    panes.forEach(v => v.el.remove());
    document.body.classList.remove('split-v');
    tex.forEach(x => x.dispose());
    disposeScene(scene);
    holdMusic(false);
  }

  holdMusic(true);
  resize();
  chips();
  bots.forEach(i => botify(i, me === 0));
  return { update, render, resize, onNet, dispose, botify };
}
