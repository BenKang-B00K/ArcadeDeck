import * as THREE from 'three';
import { sfx, holdMusic } from './audio.js';
import { t } from './i18n.js';
import { COL, canvasTex, disposeScene, flash, buzz, Burst } from './fx.js';
import { coarse, keyHint, zones, makePane, rankChips, layout, fitFov, renderPanes, bindInput, countdown, makeShowcase, addSky, addCity, lights, makeRunner, nameTag } from './stage.js';

// Dragon Boat: team rhythm rowing race. Everyone plays the same seeded drum chart: left notes slide in from the
// left, right notes from the right, and meet on the drum. Paddle that side as a note lands — PERFECT/GOOD strokes
// drive the boat (scaled by combo), a BAD or stray stroke drags it, an unplayed note breaks the combo. Gold notes
// are doubles (both sides). Red arrow notes are a steer phrase: a rock sits mid-lane and reaches the bow half a
// beat after the phrase — land either arrow note and the boat swerves past, miss both and it crashes.
// Rocks are timed to the chart, not placed on the course, so every boat meets them on the same beat whatever
// its speed. 4p boats (P1+P3 vs P2+P4) earn SYNC boosts from notes both teammates land; solo boats from combo.
// Host owns boat physics; every device judges its own players against its own chart clock (started together at
// GO) and reports {k: note, q: grade, s: side, c: combo}. 2p/3p: one paddler per boat.
const FINISH = 360, CAP = 120, LANEHALF = 3.1, GAP = 15, STEERX = 2.1;
const BPM0 = 100, BPM1 = 122, RAMP_BEAT = 80, NBEATS = 260; // tempo ramps up for the last stretch of the race
const WIN = [.05, .1, .16]; // perfect / good / bad windows, seconds
const IMP = [.3, 1.6, 2.5]; // bad / good / perfect forward impulse
const DAMP = 1.1, DRAG_T = .35, DRAG_EXTRA = 2.6; // water drag; a bad stroke adds extra drag briefly
const SYNC_BOOST = 2.4, SPRINT_DUR = 3, SYNC_EVERY = 4, SOLO_EVERY = 16, ROCK_SLOW = .35;
const LOOK = 1.5; // seconds of chart visible on each half of the drum track
const ST = ['count', 'wait', 'play', 'done'];
const mult = c => 1 + Math.min(c, 40) / 80; // combo → up to ×1.5 stroke power
const NCOL = { L: '#5cf2d0', R: '#b69bff', dbl: '#ffd23f', steer: '#ff5a6e' };
const JCOL = ['#ff9a3a', '#5cf28a', '#ffd23f', '#8890aa']; // bad / good / perfect / miss
const noteCol = nt => (nt.steer != null ? NCOL.steer : nt.dbl ? NCOL.dbl : nt.s < 0 ? NCOL.L : NCOL.R);

// beat schedule: BPM0 for the first RAMP_BEAT beats, BPM1 after — same array on every device, no seed needed
const beatDur = k => 60 / (k < RAMP_BEAT ? BPM0 : BPM1);
const beatT = []; { let tt = 0; for (let k = 0; k < NBEATS; k++) { beatT.push(tt); tt += beatDur(k); } }
const tAt = x => { const k = Math.min(NBEATS - 1, Math.floor(x)); return beatT[k] + (x - k) * beatDur(k); };
const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
const CHORDS = [[0, 2, 4, 6], [3, 5, 7], [4, 6, 8, 10], [6, 8, 10], [0, 2, 4, 6], [3, 5, 7], [6, 8, 10], [0, 2, 4, 6]]; // matches sfx.chord's bars

// One bar per pattern: [beat offset, side] with 0 = both sides (gold double). Unlocked in order as the race goes.
const PAT = [
  [[0, -1], [1, 1], [2, -1], [3, 1]], // alternate quarters
  [[0, 0], [1, -1], [2, 1], [3, 0]], // doubles on the ends
  [[0, -1], [1, 1], [1.5, -1], [2, 1], [3, -1]], // eighth pickup
  [[0, 1], [1, -1], [2, 1], [3, 0]], // rest into a double
  [[0, -1], [.5, 1], [1, -1], [2, 1], [2.5, -1], [3, 1]], // eighth runs
  [[0, 1], [1, -1], [1.5, 1], [2.5, -1], [3, 0]], // syncopation
  [[0, -1], [.5, 1], [1, -1], [1.5, 1], [2, 0], [3, 0]], // roll into doubles
  [[0, 0], [.5, -1], [1, 1], [1.5, -1], [2.5, 1], [3, -1], [3.5, 1]], // off-beat drive
];
function makeChart(rand) {
  const notes = [], hz = [];
  let nextHz = 5;
  for (let bar = 1; bar * 4 + 4 <= NBEATS; bar++) {
    const ch = CHORDS[bar % 8], tone = (s, o) => (s < 0 ? ch[o % 2] : ch[ch.length - 1 - o % 2]);
    const add = (x, s, extra) => { notes.push({ t: tAt(bar * 4 + x), s, deg: tone(s, notes.length), ...extra }); };
    if (bar === nextHz) { // steer phrase: two alternating strokes, then two arrows toward the side to swerve to
      const dir = rand() < .5 ? -1 : 1, h = hz.length;
      hz.push({ t: tAt(bar * 4 + 3.5), dir });
      add(0, -dir); add(1, dir); add(2, dir, { steer: h, deg: 7 + ch[0] }); add(3, dir, { steer: h, deg: 9 + ch[0] });
      nextHz += 5 + Math.floor(rand() * 3);
      continue;
    }
    const lvl = bar < 4 ? 1 : bar < 10 ? 3 : bar < 18 ? 5 : bar < 28 ? 7 : 8;
    const pat = PAT[Math.floor(Math.max(rand(), bar >= 18 ? rand() * .7 : 0) * lvl)], flip = rand() < .5 ? -1 : 1; // late bars lean hard
    for (const [x, s] of pat) {
      if (s) add(x, s * flip);
      else { add(x, -1, { dbl: 1 }); add(x, 1, { dbl: 1 }); }
    }
  }
  return { notes, hz };
}

export function createBoat({ renderer, mode, n = 2, me = 0, bots = [], rand, send, label, onEnd }) {
  const online = mode === 'online';
  const IDX = [...Array(n).keys()], S = n === 3 ? 3 : n === 1 ? 1 : 2;
  const side = i => (S === 3 ? i : i % 2);
  const members = [...Array(S).keys()].map(s => IDX.filter(i => side(i) === s));
  const TX = [...Array(S).keys()].map(s => (s - (S - 1) / 2) * GAP);
  const spanX = (S - 1) * GAP + LANEHALF * 2 + 14;
  const { notes: NOTES, hz: HZ } = makeChart(rand);

  const scene = new THREE.Scene(), fogC = new THREE.Color(0x061428);
  scene.background = fogC;
  scene.fog = new THREE.Fog(fogC, 26, 120);
  lights(scene);
  const sky = addSky(scene, fogC, 0x1a5a7c);
  addCity(scene, { y: -1, n: 200, x0: -spanX / 2 - 30, x1: spanX / 2 + 30, z0: 60, z1: -(FINISH + 120), clear: x => Math.abs(x) < spanX / 2 });

  // water: dark plane with a scrolling wave texture, current always flowing toward the racers
  const waveTex = canvasTex(64, 64, (g, w) => {
    g.fillStyle = '#082038'; g.fillRect(0, 0, w, w);
    g.strokeStyle = 'rgba(140,210,255,.16)'; g.lineWidth = 2;
    for (let y = 4; y < w; y += 10) { g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 8) g.lineTo(x, y + Math.sin(x * .5) * 2); g.stroke(); }
  });
  waveTex.wrapS = waveTex.wrapT = THREE.RepeatWrapping; waveTex.repeat.set(spanX / 6, (FINISH + 100) / 6);
  waveTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(spanX, FINISH + 100).rotateX(-Math.PI / 2).translate(0, 0, -FINISH / 2),
    new THREE.MeshStandardMaterial({ map: waveTex, roughness: .25, metalness: .55, envMapIntensity: .6 })));

  // lane rails (team colour) + a checkered finish line per lane
  const railGeo = new THREE.BoxGeometry(.14, .4, FINISH + 40).translate(0, 0, -FINISH / 2);
  const finishTex = canvasTex(64, 16, g => { for (let x = 0; x < 8; x++) for (let y = 0; y < 2; y++) { g.fillStyle = (x + y) % 2 ? '#111' : '#fff'; g.fillRect(x * 8, y * 8, 8, 8); } });
  finishTex.magFilter = THREE.NearestFilter;
  const finishMat = new THREE.MeshBasicMaterial({ map: finishTex, side: THREE.DoubleSide, toneMapped: false });
  for (let s = 0; s < S; s++) {
    const railMat = new THREE.MeshBasicMaterial({ color: COL[members[s][0]], toneMapped: false });
    for (const d of [-1, 1]) { const r = new THREE.Mesh(railGeo, railMat); r.position.set(TX[s] + d * LANEHALF, .3, 0); scene.add(r); }
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(LANEHALF * 2, 1.4).rotateX(-Math.PI / 2), finishMat);
    fl.position.set(TX[s], .05, -FINISH); scene.add(fl);
  }

  // dragon boat: hull + dragon-head/tail trim in team colour; a drummer at the bow, paddlers seated on deck.
  // Everyone is parented to one group, so a single position/rotation update per frame moves the whole boat.
  function makeHull(colHex, crew) {
    const len = 3 + crew * 1.4, g = new THREE.Group();
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x141a30, roughness: .4, metalness: .4 });
    const trimMat = new THREE.MeshBasicMaterial({ color: colHex, toneMapped: false });
    const hull = new THREE.Mesh(new THREE.CapsuleGeometry(.85, len, 4, 12).rotateX(Math.PI / 2).scale(1, .4, 1), hullMat); // flat hull so the crew sits on top, not inside
    hull.position.y = .2;
    const head = new THREE.Mesh(new THREE.ConeGeometry(.55, 1.3, 8), trimMat);
    head.rotation.x = -Math.PI / 2; head.position.set(0, .55, -(len / 2 + 1.1));
    const tail = new THREE.Mesh(new THREE.ConeGeometry(.4, 1, 6), trimMat);
    tail.rotation.x = Math.PI / 2; tail.position.set(0, .45, len / 2 + .9);
    g.add(hull, head, tail);
    return { g, front: -len / 2 };
  }
  // seated pose: hips bent, knees folded under — only arms animate per stroke
  const seat = u => { u.shadow.visible = false; u.legL.rotation.x = u.legR.rotation.x = 1.3; u.kneeL.rotation.x = u.kneeR.rotation.x = -1.4; };

  // rocks: one boulder + foam ring per boat per steer phrase, mid-lane. Placed ahead of the bow so it arrives on
  // its beat, then frozen once passed (the boat has swerved around it or crashed into it by then).
  const rockGeo = new THREE.IcosahedronGeometry(.8, 0), rockMat = new THREE.MeshStandardMaterial({ color: 0x6a7490, roughness: .9, flatShading: true });
  const foamGeo = new THREE.RingGeometry(.75, 1.25, 16).rotateX(-Math.PI / 2);
  const foamMat = new THREE.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: .5, toneMapped: false, depthWrite: false });

  const boatsVis = members.map((mem, s) => {
    const { g, front } = makeHull(COL[mem[0]], mem.length);
    g.position.x = TX[s];
    scene.add(g);
    const drummer = makeRunner(0xffe0a0); drummer.scale.setScalar(.7); seat(drummer.userData);
    drummer.position.set(0, .2, front - .3); drummer.rotation.y = Math.PI;
    const drumMat = new THREE.MeshStandardMaterial({ color: 0x241608, emissive: 0xff8a3a, emissiveIntensity: 0 });
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .26, 14), drumMat);
    drum.rotation.z = Math.PI / 2; drum.position.set(0, .75, front - .9);
    g.add(drummer, drum);
    const paddlers = mem.map((i, slot) => {
      const r = makeRunner(COL[i]); r.scale.setScalar(.8); seat(r.userData);
      r.position.set(0, .2, front + 1.4 + slot * 1.8); r.rotation.y = Math.PI;
      const tag = nameTag(label(i), COL[i]); tag.position.set(0, 1.6, r.position.z);
      g.add(r, tag);
      return { u: r.userData, tag };
    });
    const rocks = HZ.map(() => {
      const rg = new THREE.Group(), rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.y = .55; rock.rotation.set(Math.random(), Math.random(), Math.random());
      rg.add(rock, new THREE.Mesh(foamGeo, foamMat)); rg.position.x = TX[s]; rg.visible = false; scene.add(rg);
      return rg;
    });
    return { g, du: drummer.userData, drumMat, paddlers, rocks, bow: -front + 1.7 };
  });

  const players = IDX.map(i => {
    const s = side(i);
    return {
      i, s, slot: members[s].indexOf(i), local: !online || i === me, bot: false,
      cam: new THREE.PerspectiveCamera(60, 1, .1, 220), fov: 60,
      done: new Uint8Array(NOTES.length), next: 0, combo: 0, best: 0,
      jq: -1, jAge: 9, jDt: 0,
      lastSide: null, strokeSide: -1, strokeFX: 0, sprintUsed: false, sprintT: 0,
      ai: { k: -1, off: 0, whiff: false },
    };
  });
  const boats = members.map((mem, s) => ({
    s, team: mem.length > 1, x: 0, tx: 0, yaw: 0, v: 0, d: 0, dragT: 0, fin: null, hits: 0, syncN: 0, syncC: 0,
    dodge: new Uint8Array(HZ.length), hzNext: 0, noteQ: new Map(),
  }));
  const disp = boats.map(() => ({ x: 0, yaw: 0, d: 0, v: 0 })); // smoothed copy guests render from
  const burst = new Burst(scene);

  const FONT = getComputedStyle(document.body).fontFamily;
  const panes = (online ? [me] : IDX).map(pi => {
    const v = makePane(pi, label, zones('◀', '⚡', '▶'));
    v.chips = rankChips(v, n, label);
    v.hint.textContent = coarse ? t('boatTouch') : t('boatKeys', keyHint(pi, online));
    v.cv = document.createElement('canvas'); v.cv.className = 'bhud'; v.el.appendChild(v.cv);
    v.g = v.cv.getContext('2d');
    return v;
  });
  const paneOf = i => panes.find(v => v.pi === i);
  const say = (i, text, cls) => { const v = paneOf(i); if (v) flash(v.msg, text, cls); };
  let chipTxt = '';
  const chips = () => { // called every frame: touch the DOM only when a value changes
    const vals = IDX.map(i => { const b = boats[side(i)]; return b.fin != null ? t('time', { n: b.fin.toFixed(1) }) : Math.max(0, Math.round(FINISH - b.d)) + 'm'; });
    if (vals.join() !== chipTxt) { chipTxt = vals.join(); panes.forEach(v => v.chips(vals)); }
  };

  const sc = makeShowcase(panes, label, onEnd);
  let winSide = 0;
  let auth = !online || me === 0, st = 'count', RT = 0, time = 0, netT = 0, ended = false, snap = null;
  let beatPtr = 0, kickCur = 0, hatCur = 0, chordBar = 0, drumPulse = 0;
  const step = countdown(panes);
  const q2 = v => Math.round(v * 100) / 100;
  const lastSync = boats.map(() => 0), lastHits = boats.map(() => 0), lastFin = boats.map(() => false);
  const syncPtr = () => { while (beatPtr + 1 < NBEATS && beatT[beatPtr + 1] <= RT) beatPtr++; };

  // authority only: apply one judged stroke to its boat's physics + steer/sync bookkeeping. k = -1: stray stroke.
  function applyStroke(i, k, q, sprint, combo) {
    const p = players[i], boat = boats[p.s];
    if (!boat || boat.fin != null || st !== 'play') return;
    boat.v += IMP[q] * (sprint ? 2 : 1) * mult(combo) * (boat.team ? .6 : 1); // two paddlers share a hull: each stroke weighs less, SYNC makes it up
    if (q === 0) { boat.dragT = DRAG_T; return; }
    const note = NOTES[k];
    if (note.steer != null) boat.dodge[note.steer] = 1;
    if (boat.team) {
      const c = (boat.noteQ.get(k) ?? 0) + 1;
      boat.noteQ.set(k, c);
      if (c === 2 && ++boat.syncC % SYNC_EVERY === 0) { boat.v += SYNC_BOOST; boat.syncN++; }
    } else if (combo % SOLO_EVERY === 0) { boat.v += SYNC_BOOST; boat.syncN++; }
  }

  // show a judgement on this player's drum track (+ sound, only where the player is watched)
  function judge(p, q, dt) {
    p.jq = q; p.jAge = 0; p.jDt = dt;
    if (!paneOf(p.i)) return;
    if (q === 3) sfx.miss();
    else if (q === 0) { sfx.pull(); sfx.miss(); }
  }

  // judge one local keypress: the earliest unplayed note on that side within the BAD window, else a stray stroke
  function stroke(p, sideChar) {
    if (st !== 'play' || boats[p.s].fin != null) return;
    const s2 = sideChar === 'L' ? -1 : 1;
    let k = -1;
    for (let j = p.next; j < NOTES.length && NOTES[j].t <= RT + WIN[2]; j++) if (!p.done[j] && NOTES[j].s === s2 && RT - NOTES[j].t <= WIN[2]) { k = j; break; }
    const dt = k < 0 ? 0 : RT - NOTES[k].t, ad = Math.abs(dt), q = k < 0 ? 0 : ad <= WIN[0] ? 2 : ad <= WIN[1] ? 1 : 0;
    if (k >= 0) p.done[k] = 1;
    p.combo = q ? p.combo + 1 : 0; p.best = Math.max(p.best, p.combo);
    p.lastSide = sideChar; p.strokeSide = s2; p.strokeFX = 1;
    let jd = dt; // a stray just ahead of this side's next note still says EARLY
    if (k < 0) for (let j = p.next; j < NOTES.length && NOTES[j].t - RT < .6; j++) if (!p.done[j] && NOTES[j].s === s2) { jd = RT - NOTES[j].t; break; }
    judge(p, q, jd);
    if (q) {
      const nt = NOTES[k];
      if (paneOf(p.i)) { sfx.pull(); sfx.pitch(nt.deg, .28, q === 2 ? .13 : .09); if (nt.steer != null && !boats[p.s].dodge[nt.steer]) say(p.i, t('boatDodge'), 'boost'); }
    }
    const sprint = p.sprintT > 0;
    if (auth) applyStroke(p.i, k, q, sprint, p.combo);
    else send({ t: 'bs', from: p.i, k, q, p: sprint ? 1 : 0, c: p.combo });
  }

  // notes that slid past the BAD window unplayed: MISS, combo broken
  function sweep(p) {
    while (p.next < NOTES.length && (p.done[p.next] || NOTES[p.next].t + WIN[2] < RT)) {
      if (!p.done[p.next]) { p.done[p.next] = 1; p.combo = 0; judge(p, 3, 0); }
      p.next++;
    }
  }

  function triggerSprint(p) {
    if (p.sprintUsed || st !== 'play' || boats[p.s].fin != null) return;
    p.sprintUsed = true; p.sprintT = SPRINT_DUR;
    if (paneOf(p.i)) { sfx.boost(); say(p.i, t('boatSprint'), 'boost'); }
  }

  function act(pi, a) {
    const p = players[pi];
    if (!p?.local || p.bot || st !== 'play') return;
    a === 'A' ? triggerSprint(p) : stroke(p, a);
  }

  // AI: plays the chart with ~40 ms timing noise and whiffs ~6% of notes. Runs only where this seat is locally driven.
  function botStep(p) {
    if (boats[p.s].fin != null) return;
    let j = p.next;
    while (j < NOTES.length && p.done[j]) j++;
    if (j >= NOTES.length) return;
    if (p.ai.k !== j) {
      p.ai.k = j; p.ai.off = gauss() * .04; p.ai.whiff = Math.random() < .06;
      if (!p.sprintUsed && boats[p.s].d > FINISH * .3 && Math.random() < .03) triggerSprint(p);
    }
    if (!p.ai.whiff && RT >= NOTES[j].t + p.ai.off) stroke(p, NOTES[j].s < 0 ? 'L' : 'R');
  }

  function simulate(dt) {
    if (st !== 'play') return;
    RT += dt;
    for (const boat of boats) {
      if (boat.fin != null) continue;
      boat.v *= Math.exp(-(DAMP + (boat.dragT > 0 ? DRAG_EXTRA : 0)) * dt);
      boat.dragT = Math.max(0, boat.dragT - dt);
      while (boat.hzNext < HZ.length && RT >= HZ[boat.hzNext].t) { // the rock reaches the bow on its beat
        if (!boat.dodge[boat.hzNext]) { boat.v *= ROCK_SLOW; boat.hits++; }
        boat.hzNext++;
      }
      const h = HZ[boat.hzNext], prev = HZ[boat.hzNext - 1];
      boat.tx = h && boat.dodge[boat.hzNext] ? h.dir * STEERX : prev && boat.dodge[boat.hzNext - 1] && RT < prev.t + .5 ? prev.dir * STEERX : 0;
      const dx = (boat.tx - boat.x) * (1 - Math.exp(-5 * dt));
      boat.x += dx; boat.yaw = THREE.MathUtils.clamp(-dx / Math.max(dt, 1e-3) * .12, -.5, .5);
      boat.d += boat.v * dt;
      if (boat.d >= FINISH) { boat.d = FINISH; boat.fin = RT; }
    }
    for (const p of players) if (p.local && p.bot) botStep(p);
    if (boats.every(bt => bt.fin != null) || RT >= CAP) finish();
  }

  // any device: diff the sync/hit counters against last seen to fire feedback (works for the authority's own
  // updates and for a guest reading them off the broadcast — same code path either way)
  function boatFX() {
    boats.forEach((boat, s) => {
      if (boat.fin != null && !lastFin[s]) { // crossed the line: say so, then wait for the rest (notes stop judging)
        lastFin[s] = true;
        members[s].forEach(i => {
          const v = paneOf(i);
          if (!v) return;
          say(i, t('finish'), 'go'); sfx.finish();
          if (online && boats.some(bt => bt.fin == null)) { v.hint.textContent = t('waitRival'); v.hint.classList.remove('hide'); }
        });
      }
      if (boat.syncN > lastSync[s]) {
        lastSync[s] = boat.syncN;
        burst.emit(TX[s] + boat.x, .6, -boat.d, 0xffd23f, 30, 6);
        members[s].forEach(i => { if (paneOf(i)) { say(i, t('boatSync'), 'perfect'); sfx.perfect(); } });
      }
      if (boat.hits > lastHits[s]) {
        lastHits[s] = boat.hits;
        burst.emit(TX[s] + boat.x, .5, -boat.d - boatsVis[s].bow, 0x9fd8ff, 26, 6);
        members[s].forEach(i => { if (paneOf(i)) { say(i, t('hit'), 'hit'); sfx.hit(); buzz(50); } });
      }
    });
  }

  function finish() {
    if (ended) return;
    ended = true; st = 'done';
    if (auth && online) broadcast();
    const rank = [...Array(S).keys()].sort((a, b) => {
      const fa = boats[a].fin, fb = boats[b].fin;
      if (fa != null && fb != null) return fa - fb;
      if (fa != null) return -1;
      if (fb != null) return 1;
      return boats[b].d - boats[a].d;
    });
    const places = IDX.map(i => rank.indexOf(side(i)));
    const order = [...IDX].sort((a, b) => places[a] - places[b] || a - b);
    const top = members[rank[0]];
    winSide = rank[0];
    sc.start({
      order, draw: false, places,
      scores: IDX.map(i => { const b = boats[side(i)]; return b.fin != null ? t('time', { n: b.fin.toFixed(1) }) : t('meters', { n: Math.round(b.d) }); }),
      title: top.length > 1 ? t('boatTeamWins', { a: label(top[0]), b: label(top[1]) }) : undefined,
    }, () => boatsVis[winSide].g.position, { r: 8, h: 4 });
  }

  const broadcast = () => {
    const arr = [];
    boats.forEach(b => arr.push(q2(b.d), q2(b.x), q2(b.yaw), q2(b.v), b.fin == null ? -1 : q2(b.fin), b.hits, b.syncN));
    send({ t: 'bm', from: 0, st: ST.indexOf(st), rt: q2(RT), b: arr });
  };

  function applySnap(sn) {
    for (let s = 0; s < S; s++) {
      const o = s * 7, a = sn.b, boat = boats[s];
      Object.assign(boat, { d: a[o], x: a[o + 1], yaw: a[o + 2], v: a[o + 3], fin: a[o + 4] < 0 ? null : a[o + 4], hits: a[o + 5], syncN: a[o + 6] });
    }
    if (Math.abs(sn.rt - RT) > .4) RT = sn.rt;
    if (sn.st === 'done') finish(); else st = sn.st;
    boatFX();
    chips();
  }

  // drum track HUD: notes converge on the drum from their side; beat ticks mirror on both halves
  function drawHud(v, p) {
    const g = v.g, W = v.w, H = v.h;
    g.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    if (st === 'done') return;
    const th = THREE.MathUtils.clamp(H * .075, 26, 42), r = th * .36, half = Math.min(W * .46, 320);
    const cx = W / 2, cy = H - v.sb - th * 1.95; // bottom of the pane, under the crew, leaving room for the combo line
    const boost = p.sprintT > 0;
    g.fillStyle = 'rgba(4,12,28,.62)';
    g.beginPath(); g.roundRect(cx - half, cy - th / 2, half * 2, th, th / 2); g.fill();
    g.lineWidth = 2; g.strokeStyle = boost ? 'rgba(92,242,138,.9)' : 'rgba(255,255,255,.14)'; g.stroke();
    // beat ticks, downbeats brighter
    syncPtr();
    for (let k = beatPtr; k < NBEATS && beatT[k] - RT < LOOK; k++) {
      const dx = (beatT[k] - RT) / LOOK * half;
      if (dx < r) continue;
      const bar = k % 4 === 0, a = (1 - dx / half) * (bar ? .5 : .22), hh = th * (bar ? .42 : .26);
      g.fillStyle = `rgba(255,255,255,${a})`;
      g.fillRect(cx - dx - 1, cy - hh, 2, hh * 2); g.fillRect(cx + dx - 1, cy - hh, 2, hh * 2);
    }
    const disc = (x, y, rad) => { g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); };
    // hit zone: the GOOD window around the drum, lit in the next note's colour while that note is inside it
    const zw = WIN[1] / LOOK * half, pr0 = r * 1.35;
    let lead = null; // nearest note still playable: drives the zone glow + approach ring
    for (let j = p.next; j < NOTES.length && NOTES[j].t - RT < LOOK; j++) if (!p.done[j] && NOTES[j].t - RT > -WIN[1]) { lead = NOTES[j]; break; }
    const leadDt = lead ? lead.t - RT : 9, inZone = Math.abs(leadDt) <= WIN[1];
    g.globalAlpha = inZone ? .3 : .07; g.fillStyle = inZone ? noteCol(lead) : '#fff';
    g.beginPath(); g.roundRect(cx - zw - r, cy - th * .42, (zw + r) * 2, th * .84, th * .42); g.fill();
    g.globalAlpha = 1;
    // notes (drawn far → near so the next one sits on top): swell, glow harder and grow a wake as they close in
    let end = p.next;
    while (end < NOTES.length && NOTES[end].t - RT < LOOK) end++;
    for (let j = end - 1; j >= p.next; j--) {
      const nt = NOTES[j];
      if (p.done[j]) continue;
      const dx = (nt.t - RT) / LOOK * half, x = cx + nt.s * dx;
      const fade = dx < 0 ? Math.max(0, 1 + dx / (WIN[2] / LOOK * half)) : Math.min(1, (half - dx) / (half * .12));
      const near = THREE.MathUtils.clamp(1 - Math.abs(dx) / (half * .32), 0, 1), rr = r * (1 + .3 * near * near), col = noteCol(nt);
      if (nt.dbl && nt.s < 0) { g.globalAlpha = fade * (.18 + near * .4); g.fillStyle = NCOL.dbl; g.fillRect(x, cy - 2, dx * 2, 4); } // tie the pair
      if (near > 0 && dx > 0) { // wake trailing behind the note
        const tail = rr * (1.5 + near * 2.5), grd = g.createLinearGradient(x, 0, x - nt.s * tail, 0);
        grd.addColorStop(0, col); grd.addColorStop(1, 'rgba(0,0,0,0)');
        g.globalAlpha = fade * near * .55; g.fillStyle = grd;
        g.beginPath(); g.moveTo(x, cy - rr * .8); g.lineTo(x - nt.s * tail, cy); g.lineTo(x, cy + rr * .8); g.fill();
      }
      g.globalAlpha = fade;
      g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 8 + near * 24;
      disc(x, cy, rr); g.fill();
      g.shadowBlur = 0;
      if (near > .5) { g.globalAlpha = fade * (near - .5) * 1.6; g.strokeStyle = '#fff'; g.lineWidth = 2; disc(x, cy, rr); g.stroke(); g.globalAlpha = fade; }
      g.fillStyle = 'rgba(4,12,28,.85)';
      if (nt.steer != null) { // arrow toward the swerve side
        const w = rr * .55;
        g.beginPath(); g.moveTo(x + nt.s * w, cy); g.lineTo(x - nt.s * w * .6, cy - w); g.lineTo(x - nt.s * w * .6, cy + w); g.fill();
      } else { disc(x, cy, rr * .38); g.fill(); }
    }
    g.globalAlpha = 1;
    // approach ring: closes onto the drum rim exactly as the next note lands
    if (lead && leadDt > 0 && leadDt < .45) {
      const k = leadDt / .45;
      g.globalAlpha = (1 - k) * .9; g.strokeStyle = noteCol(lead); g.lineWidth = 2 + (1 - k) * 2;
      disc(cx, cy, pr0 * (1 + k * 1.6)); g.stroke(); g.globalAlpha = 1;
    }
    // drum target: pulses on the beat; the last judgement lights it up (PERFECT gold burst + rays, GOOD green,
    // BAD orange with a shake, MISS dims and shakes it)
    const jq = p.jq, ja = jq >= 0 && p.jAge < .4 ? 1 - p.jAge / .4 : 0, jc = JCOL[jq];
    const dcx = cx + (ja && (jq === 0 || jq === 3) ? Math.sin(p.jAge * 70) * 4 * ja : 0);
    const pr = pr0 * (1 + drumPulse * .12 + (jq === 2 ? .25 : jq === 1 ? .14 : 0) * ja * ja);
    if (ja && jq < 3) {
      const k = 1 - ja;
      g.globalAlpha = ja; g.fillStyle = jc; g.shadowColor = jc; g.shadowBlur = jq === 2 ? 36 : jq === 1 ? 22 : 12;
      disc(dcx, cy, pr); g.fill(); g.shadowBlur = 0;
      g.strokeStyle = jc; g.lineWidth = jq === 2 ? 5 : 3;
      disc(dcx, cy, pr * (1 + k * 1.2)); g.stroke();
      if (jq === 2) {
        g.globalAlpha = ja * .6; g.lineWidth = 2; disc(dcx, cy, pr * (1 + k * 2.1)); g.stroke();
        g.globalAlpha = ja; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath();
        for (let i = 0; i < 8; i++) {
          const an = i * Math.PI / 4 + .39, c = Math.cos(an), sn = Math.sin(an), r0 = pr * (1.2 + k * .6), r1 = pr * (1.5 + k * 1.3);
          g.moveTo(dcx + c * r0, cy + sn * r0); g.lineTo(dcx + c * r1, cy + sn * r1);
        }
        g.stroke(); g.lineCap = 'butt';
      }
      g.globalAlpha = 1;
    }
    g.fillStyle = '#2a1608'; disc(dcx, cy, pr); g.fill();
    if (ja && jq < 3) { // skin lit in the judgement colour, white-hot core on PERFECT
      g.globalAlpha = ja * (jq === 2 ? .85 : jq === 1 ? .65 : .45); g.fillStyle = jc; disc(dcx, cy, pr * .84); g.fill();
      if (jq === 2) { g.globalAlpha = ja * .9; g.fillStyle = '#fff'; disc(dcx, cy, pr * .38 * (1 + (1 - ja) * .6)); g.fill(); }
      g.globalAlpha = 1;
    } else if (ja) { g.globalAlpha = ja * .5; g.fillStyle = '#000'; disc(dcx, cy, pr); g.fill(); g.globalAlpha = 1; }
    g.strokeStyle = ja ? jc : boost ? '#5cf28a' : inZone ? noteCol(lead) : `rgba(255,${170 + drumPulse * 60 | 0},90,${.7 + drumPulse * .3})`; g.lineWidth = 3;
    disc(dcx, cy, pr); g.stroke();
    // judgement above the drum, EARLY/LATE under it, combo below the track
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (p.jq >= 0 && p.jAge < .55) {
      const pop = 1 + Math.max(0, .12 - p.jAge) * 2.5;
      g.globalAlpha = Math.min(1, (.55 - p.jAge) * 5);
      g.font = `italic 900 ${th * .62 * pop | 0}px ${FONT}`; g.fillStyle = JCOL[p.jq];
      g.fillText([t('boatBad'), t('good'), t('perfect'), t('miss')][p.jq], cx, cy - th * 1.15);
      if (p.jq < 2 && p.jDt) { g.font = `800 ${th * .34 | 0}px ${FONT}`; g.fillText(p.jDt < 0 ? t('boatEarly') : t('boatLate'), cx, cy - th * 1.7); }
      g.globalAlpha = 1;
    }
    if (p.combo >= 4) {
      g.font = `italic 900 ${th * .6 | 0}px ${FONT}`; g.fillStyle = '#fff';
      g.fillText(`${p.combo}`, cx, cy + th * 1.05);
      g.font = `800 ${th * .3 | 0}px ${FONT}`; g.fillStyle = NCOL.dbl;
      g.fillText(`${t('boatCombo')} ×${mult(p.combo).toFixed(2)}`, cx, cy + th * 1.55);
    }
  }

  function update(dt) {
    time += dt;
    if (st === 'count') {
      if (!step(dt)) {
        if (auth) { st = 'play'; RT = 0; if (online) broadcast(); }
        else { st = 'wait'; if (snap) { applySnap(snap); snap = null; } }
      }
    } else if (auth) simulate(dt);
    else if (st === 'play') RT += dt;
    if (st === 'play' && RT > 2.5) panes.forEach(v => { if (boats[players[v.pi].s].fin == null) v.hint.classList.add('hide'); }); // a finished boat's pane keeps its wait hint
    if (st === 'play') for (const p of players) if (p.local && boats[p.s].fin == null) sweep(p);

    // backing track: kick every beat, a bar chord every 4 beats, hats on the offbeat — same local clock for all
    if (st === 'play') {
      while (kickCur < NBEATS && beatT[kickCur] <= RT) {
        sfx.kick();
        if (kickCur % 4 === 0) { sfx.chord(chordBar % 8, 4 * beatDur(kickCur)); chordBar++; }
        drumPulse = 1; kickCur++;
      }
      while (hatCur < NBEATS - 1 && beatT[hatCur] + beatDur(hatCur) / 2 <= RT) { sfx.hat(); hatCur++; }
    }
    drumPulse = Math.max(0, drumPulse - dt * 4);
    for (const p of players) { p.sprintT = Math.max(0, p.sprintT - dt); p.strokeFX = Math.max(0, p.strokeFX - dt * 5); p.jAge += dt; }

    boatFX();
    chips();
    if (online && (netT -= dt) <= 0) { netT = 1 / 15; if (auth && st !== 'count' && !ended) broadcast(); }

    // smoothed display copy: authority snaps to it, guests ease toward the latest broadcast
    boats.forEach((b, s) => {
      const k = auth ? 1 : Math.min(1, dt * 8), d = disp[s];
      d.d += (b.d - d.d) * k; d.x += (b.x - d.x) * k; d.yaw += (b.yaw - d.yaw) * k;
      d.v += (Math.max(2, b.v) - d.v) * Math.min(1, dt * 3);
    });

    for (const v of panes) {
      const p = players[v.pi], boat = boats[p.s];
      const left = boat.fin != null ? '' : Math.max(0, Math.round(FINISH - boat.d)) + 'm';
      if (v.val.textContent !== left) v.val.textContent = left;
      drawHud(v, p);
    }

    // boats + drummer + paddlers: one transform per hull (everyone is parented to it), arms swing per stroke
    boatsVis.forEach((vis, s) => {
      const d = disp[s];
      vis.g.position.set(TX[s] + d.x, Math.sin(time * 1.4 + s) * .03, -d.d);
      vis.g.rotation.set(0, d.yaw, -d.yaw * .3);
      vis.drumMat.emissiveIntensity = drumPulse * 1.4;
      vis.du.armL.rotation.x = vis.du.armR.rotation.x = -.6 - drumPulse * 1.1;
      vis.paddlers.forEach((pd, slot) => {
        const p = players[members[s][slot]];
        // ponytail: non-local paddlers mime the beat instead of their real remote input — exact per-stroke
        // sync would need a message per paddler; cosmetic only, doesn't affect anyone's score.
        const strokeSide = p.local ? p.strokeSide : (kickCur + slot) % 2 ? 1 : -1, amt = p.local ? p.strokeFX : drumPulse;
        pd.u.armL.rotation.set(-.4 - (strokeSide < 0 ? amt : 0) * 1.3, 0, strokeSide < 0 ? .3 : 0);
        pd.u.armR.rotation.set(-.4 - (strokeSide > 0 ? amt : 0) * 1.3, 0, strokeSide > 0 ? -.3 : 0);
        pd.u.body.rotation.x = -.15 - amt * .25;
      });
      // rocks ride in ahead of the bow so they land on their beat, then stay put once the bow reaches them
      HZ.forEach((h, j) => {
        const rg = vis.rocks[j], ahead = h.t - RT;
        if (st === 'play' && ahead > 0 && ahead < 4) { rg.userData.d = d.d + vis.bow + ahead * d.v; rg.visible = rg.userData.d < FINISH; }
        else if (rg.visible && d.d - rg.userData.d > 25) rg.visible = false;
        if (rg.visible) rg.position.z = -rg.userData.d;
      });
    });
    waveTex.offset.y -= dt * .15;
    burst.update(dt);
    sc.update(dt);
  }

  function resize() {
    layout(panes);
    const dpr = Math.min(2, devicePixelRatio || 1);
    for (const v of panes) {
      const p = players[v.pi]; p.cam.aspect = v.w / v.h; p.fov = fitFov(p.cam.aspect, 30, 55, 95);
      v.dpr = dpr; v.cv.width = v.w * dpr | 0; v.cv.height = v.h * dpr | 0;
      v.sb = parseFloat(getComputedStyle(v.hint).bottom) - 22 || 16; // --sb: safe-area inset (home bar)
    }
  }

  const look = new THREE.Vector3();
  function render() {
    renderPanes(renderer, scene, panes, v => {
      const p = players[v.pi], c = p.cam, d = disp[p.s], wx = TX[p.s] + d.x * .6;
      if (sc.on) { sc.cam(v, c, p.fov); sky.position.copy(c.position); return c; }
      c.position.set(wx, 3.4, -d.d + 6);
      c.lookAt(look.set(wx, .5, -d.d - 8));
      if (v.flip) c.rotateZ(Math.PI);
      c.fov = p.fov; c.updateProjectionMatrix();
      sky.position.copy(c.position);
      return c;
    });
  }

  const unbind = bindInput({ cv: renderer.domElement, panes, n, online, me, act });

  function onNet(msg) {
    if (msg.t === 'bs' && auth) {
      const p = players[msg.from];
      if (!p || p.local || st !== 'play') return;
      if (!Number.isInteger(msg.k) || msg.k < -1 || msg.k >= NOTES.length || ![0, 1, 2].includes(msg.q) || (msg.k < 0 && msg.q) || !Number.isInteger(msg.c) || msg.c < 0) return;
      applyStroke(p.i, msg.k, msg.q, msg.p === 1, msg.c);
    } else if (msg.t === 'bm' && !auth && msg.from === 0) {
      const ok = Number.isInteger(msg.st) && ST[msg.st] && Number.isFinite(msg.rt) && Array.isArray(msg.b) && msg.b.length === S * 7 && msg.b.every(Number.isFinite);
      if (!ok || ended) return;
      const sn = { st: ST[msg.st], rt: msg.rt, b: msg.b };
      if (st === 'count') snap = sn; else applySnap(sn);
    }
  }

  function botify(i, local) {
    const p = players[i];
    if (!p) return;
    p.bot = true;
    boatsVis[p.s].paddlers[p.slot]?.tag.userData.set(label(i));
    if (local) p.local = true; // sweep() marks the notes it missed before taking over, silently
    if (i === 0 && local && !auth) { // host gone: boats[] already holds the last snapshot, keep going
      auth = true;
      if (st === 'wait') { st = 'play'; RT = 0; } // no snapshot ever arrived to start the race — start it now
    }
    chips();
  }

  function dispose() {
    unbind();
    panes.forEach(v => v.el.remove());
    document.body.classList.remove('split-v');
    disposeScene(scene);
    holdMusic(false);
  }

  holdMusic(true);
  resize();
  chips();
  bots.forEach(i => botify(i, me === 0));
  return { update, render, resize, onNet, dispose, botify };
}
