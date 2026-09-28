import * as THREE from 'three';
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { COL, hex, canvasTex, disposeScene, useEnv, flash, buzz, Burst } from './fx.js';
import { makeRunner, animRunner, placeRunner, addCity, makeShowcase } from './stage.js';

// Track distance `d` runs forward; world z = -d. Every player (2–4) gets an identical seeded course on parallel tracks.
const LEN = 520, LANE = 2.2, GAP = 14;
const V0 = 12, VMAX = 24, ACC = 2.4, BOOST = 9, JUMP = 10, GRAV = 28;
const BS = 16, BPS = 5; // bullet speed, bullets per stream
const laneX = l => (l - 1) * LANE;
const coarse = matchMedia('(pointer: coarse)').matches;

function makeCourse(rand) {
  const c = { walls: [], bars: [], pads: [], sliders: [], streams: [] };
  for (let d = 45; d < LEN - 30;) {
    const k = rand();
    if (k < .28) { // walls: always at least one blocked lane, never all three
      const free = rand() * 3 | 0;
      c.walls.push({ l: (free + 1) % 3, d });
      if (rand() < .6) c.walls.push({ l: (free + 2) % 3, d });
      d += 16 + rand() * 8;
    } else if (k < .46) { c.bars.push({ d }); d += 15 + rand() * 8; }
    else if (k < .66) { // bullet streams fired back down a lane from a turret
      const span = 34, l = rand() * 3 | 0;
      c.streams.push({ l, far: d + span, span, ph: rand() * span });
      if (rand() < .4) c.streams.push({ l: (l + 1 + (rand() * 2 | 0)) % 3, far: d + span, span, ph: rand() * span });
      d += span + 12;
    } else if (k < .84) { c.sliders.push({ d, w: 1.5 + rand(), ph: rand() * 6.28 }); d += 16 + rand() * 6; }
    else { c.pads.push({ l: rand() * 3 | 0, d }); d += 12 + rand() * 6; }
  }
  return c;
}

export function createDash({ renderer, mode, n = 2, me = 0, bots = [], rand, send, label, onEnd }) {
  const online = mode === 'online';
  const IDX = [...Array(n).keys()], TX = IDX.map(i => (i - (n - 1) / 2) * GAP);
  const C = makeCourse(rand);
  const scene = new THREE.Scene();
  const fogC = new THREE.Color(0x0c1233);
  scene.background = fogC;
  scene.fog = new THREE.Fog(fogC, 28, 110);
  useEnv(scene);
  scene.add(new THREE.HemisphereLight(0x9ab8ff, 0x201038, 1.2));
  const sun = new THREE.DirectionalLight(0xffe6cc, 1.6);
  sun.position.set(-4, 10, 6);
  scene.add(sun);
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  // sky dome: vertex-colour gradient + stars, follows the camera (works for the flipped view too)
  const sky = new THREE.Group();
  {
    const g = new THREE.SphereGeometry(90, 24, 16), p = g.attributes.position, cols = [];
    const top = new THREE.Color(0x02030c), glow = new THREE.Color(0x4a1a5c), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i) / 90;
      c.copy(fogC).lerp(glow, Math.max(0, 1 - Math.abs(y - .08) * 7) * .55).lerp(top, Math.max(0, y) ** .6);
      cols.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    sky.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })));
    const sp = [];
    for (let i = 0; i < 260; i++) {
      const a = Math.random() * 6.28, e = .15 + Math.random() * 1.3;
      sp.push(Math.cos(a) * Math.cos(e) * 85, Math.sin(e) * 85, Math.sin(a) * Math.cos(e) * 85);
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    sky.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xc8d4ff, size: 1.6, sizeAttenuation: false, fog: false, depthWrite: false })));
    sky.children.forEach(o => { o.renderOrder = -1; o.frustumCulled = false; });
    scene.add(sky);
  }

  // ground + tracks
  const grid = canvasTex(64, 64, (g, w) => {
    g.fillStyle = '#080c22'; g.fillRect(0, 0, w, w);
    g.strokeStyle = '#27306a'; g.lineWidth = 2; g.strokeRect(0, 0, w, w);
  });
  grid.wrapS = grid.wrapT = THREE.RepeatWrapping; grid.repeat.set(50, (LEN + 300) / 8); grid.anisotropy = aniso;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, LEN + 300).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: grid }));
  ground.position.set(0, -.03, -LEN / 2);
  scene.add(ground);

  const trackTex = canvasTex(96, 256, (g, w, h) => {
    g.fillStyle = '#161d44'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1e275a'; g.fillRect(0, 0, w, h / 2);
    g.fillStyle = 'rgba(255,255,255,.4)';
    for (const x of [w / 3, 2 * w / 3]) g.fillRect(x - 1.5, 24, 3, h / 2 - 48);
  });
  trackTex.wrapS = trackTex.wrapT = THREE.RepeatWrapping; trackTex.repeat.set(1, (LEN + 80) / 6); trackTex.anisotropy = aniso;
  const trackGeo = new THREE.PlaneGeometry(3 * LANE, LEN + 80).rotateX(-Math.PI / 2);
  const trackMat = new THREE.MeshStandardMaterial({ map: trackTex, roughness: .5, metalness: .25 });
  const railGeo = new THREE.BoxGeometry(.16, .3, LEN + 80);
  const checker = canvasTex(64, 16, (g) => { for (let x = 0; x < 8; x++) for (let y = 0; y < 2; y++) { g.fillStyle = (x + y) % 2 ? '#111' : '#fff'; g.fillRect(x * 8, y * 8, 8, 8); } });
  checker.magFilter = THREE.NearestFilter;
  const checkerMat = new THREE.MeshBasicMaterial({ map: checker, side: THREE.DoubleSide, toneMapped: false });
  const postGeo = new THREE.BoxGeometry(.3, 5.6, .3), bannerGeo = new THREE.PlaneGeometry(3 * LANE + .6, 1.1), lineGeo = new THREE.PlaneGeometry(3 * LANE, 1.2).rotateX(-Math.PI / 2);
  const startMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .6 });
  for (const p of IDX) {
    const tz = -(LEN + 80) / 2 + 20;
    const tr = new THREE.Mesh(trackGeo, trackMat); tr.position.set(TX[p], 0, tz); scene.add(tr);
    const railMat = new THREE.MeshBasicMaterial({ color: COL[p], toneMapped: false });
    for (const s of [-1, 1]) { const r = new THREE.Mesh(railGeo, railMat); r.position.set(TX[p] + s * (1.5 * LANE + .1), .15, tz); scene.add(r); }
    const fl = new THREE.Mesh(lineGeo, checkerMat); fl.position.set(TX[p], .01, -LEN); scene.add(fl);
    const sl = new THREE.Mesh(lineGeo, startMat); sl.scale.z = .25; sl.position.set(TX[p], .01, 0); scene.add(sl);
    const ban = new THREE.Mesh(bannerGeo, checkerMat); ban.position.set(TX[p], 5, -LEN); scene.add(ban);
    for (const s of [-1, 1]) { const po = new THREE.Mesh(postGeo, railMat); po.position.set(TX[p] + s * (1.5 * LANE + .3), 2.8, -LEN); scene.add(po); }
  }

  // city either side (cosmetic, not seeded)
  addCity(scene, { y: 0, n: 160, x0: -TX[n - 1] - 50, x1: TX[n - 1] + 50, z0: 30, z1: -LEN - 90, clear: x => Math.abs(x) < TX[n - 1] + 9 });

  // hazards: one InstancedMesh per type, all tracks
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = new THREE.Vector3(), S = new THREE.Vector3(), E = new THREE.Euler();
  const setM = (im, i, x, y, z, ry = 0, s = 1) => { im.setMatrixAt(i, M.compose(P.set(x, y, z), Q.setFromEuler(E.set(0, ry, 0)), S.setScalar(s))); };
  const inst = (geo, mat, n, dynamic) => {
    const im = new THREE.InstancedMesh(geo, mat, Math.max(1, n));
    im.count = n; im.frustumCulled = false;
    if (dynamic) im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(im);
    return im;
  };
  // hazard panel: glowing frame + faint diagonal stripes on a dark face (used as emissiveMap)
  const panel = canvasTex(64, 64, (g, w) => {
    g.fillStyle = '#1c1c1c'; g.fillRect(0, 0, w, w);
    g.fillStyle = '#555';
    for (let k = -w; k < w; k += 16) { g.beginPath(); g.moveTo(k, w); g.lineTo(k + 7, w); g.lineTo(k + 7 + w, 0); g.lineTo(k + w, 0); g.fill(); }
    g.strokeStyle = '#fff'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, w - 8);
  });
  const walls = inst(new THREE.BoxGeometry(1.9, 1.7, .7), new THREE.MeshStandardMaterial({ color: 0x2a0a20, emissive: 0xff2a55, emissiveMap: panel, emissiveIntensity: 1.1, roughness: .3, metalness: .4 }), C.walls.length * n);
  const bars = inst(new THREE.BoxGeometry(3 * LANE, .3, .3), new THREE.MeshStandardMaterial({ color: 0x4a3000, emissive: 0xffb020, emissiveIntensity: .8 }), C.bars.length * n);
  const padTex = canvasTex(64, 128, (g) => {
    g.strokeStyle = '#fff'; g.lineWidth = 9; g.lineCap = g.lineJoin = 'round';
    for (const y of [14, 56, 98]) { g.beginPath(); g.moveTo(12, y + 20); g.lineTo(32, y); g.lineTo(52, y + 20); g.stroke(); }
  });
  padTex.wrapT = THREE.RepeatWrapping;
  const pads = inst(new THREE.PlaneGeometry(1.8, 3).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: padTex, color: 0x3dff9a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), C.pads.length * n);
  const sliders = inst(new THREE.BoxGeometry(1.5, 1.5, 1.5), new THREE.MeshStandardMaterial({ color: 0x1a0828, emissive: 0xc040ff, emissiveMap: panel, emissiveIntensity: 1.1, roughness: .3, metalness: .4 }), C.sliders.length * n, true);
  const turrets = inst(new THREE.CylinderGeometry(.45, .65, 1.4, 12), new THREE.MeshStandardMaterial({ color: 0x222, emissive: 0xff4020, emissiveIntensity: .5 }), C.streams.length * n);
  const bullets = inst(new THREE.SphereGeometry(.3, 12, 8), new THREE.MeshBasicMaterial({ color: 0xfff27a, toneMapped: false }), C.streams.length * BPS * n, true);
  for (const p of IDX) {
    C.walls.forEach((o, i) => setM(walls, p * C.walls.length + i, TX[p] + laneX(o.l), .85, -o.d));
    C.bars.forEach((o, i) => setM(bars, p * C.bars.length + i, TX[p], .5, -o.d));
    C.pads.forEach((o, i) => setM(pads, p * C.pads.length + i, TX[p] + laneX(o.l), .02, -o.d));
    C.streams.forEach((o, i) => setM(turrets, p * C.streams.length + i, TX[p] + laneX(o.l), .7, -o.far - 1.2));
  }

  let T = 0; // race clock (drives every moving hazard — identical on every device)
  const sliderX = o => Math.sin(T * o.w + o.ph) * LANE * 1.15;
  const bulletU = (s, k) => (s.ph + T * BS + k * s.span / BPS) % s.span; // 0 at turret → span at tail

  // players
  const players = IDX.map(i => {
    const g = makeRunner(COL[i]);
    scene.add(g);
    return {
      i, g, cam: new THREE.PerspectiveCamera(62, 1, .1, 140), fov: 62, local: !online || i === me,
      d: 0, lane: 1, x: 0, y: 0, vy: 0, v: V0, stun: 0, inv: 0, boost: 0, fin: null, shake: 0, run: 0, lastPad: -1,
      td: 0, tx: 0, ty: 0, tv: 0,
    };
  });
  const speed = p => (p.stun > 0 ? 3 : p.v + (p.boost > 0 ? BOOST : 0));
  const burst = new Burst(scene);

  // HUD panes (one per rendered view)
  const hudRoot = document.getElementById('hud');
  const KEYHINT = [{ l: 'A', r: 'D', j: 'W' }, { l: '←', r: '→', j: '↑' }, { l: 'J', r: 'L', j: 'I' }, { l: 'Num4', r: 'Num6', j: 'Num8' }];
  const panes = (online ? [me] : IDX).map(pi => {
    const el = document.createElement('div');
    el.className = 'pane';
    el.style.setProperty('--c', hex(pi));
    el.innerHTML = '<div class="ptop"><b class="ptag"></b><span class="ptime">0.0</span></div><div class="pbar"></div><div class="pmsg"></div><div class="phint"></div>';
    hudRoot.appendChild(el);
    const q = s => el.querySelector(s);
    const dots = IDX.map(j => {
      const d = document.createElement('i');
      if (j !== pi) { d.className = 'op'; d.style.setProperty('--o', hex(j)); }
      return d;
    });
    q('.pbar').append(...dots.filter((_, j) => j !== pi), dots[pi]); // own dot last = drawn on top
    q('.ptag').textContent = label(pi);
    q('.phint').textContent = coarse ? t('dashHint') : t('dashKeys', online ? { l: 'A/←', r: 'D/→', j: 'W/↑' } : KEYHINT[pi]);
    return { pi, el, time: q('.ptime'), dots, msg: q('.pmsg'), hint: q('.phint'), x: 0, y: 0, w: 1, h: 1, flip: false };
  });
  const paneOf = p => panes.find(v => v.pi === p.i);
  const heard = p => !!paneOf(p); // only players shown on this device make sound
  const say = (p, text, cls) => { const v = paneOf(p); if (v) flash(v.msg, text, cls); };
  const sc = makeShowcase(panes, label, onEnd);

  function resize() {
    const W = innerWidth, H = innerHeight, portrait = H > W, np = panes.length;
    document.body.classList.toggle('split-v', np > 1 && portrait);
    panes.forEach((v, k) => {
      // 2 players: side by side (landscape) or stacked (portrait). 3–4: top row of 2, bottom row of the rest.
      // Portrait = tablet flat on a table: the top row is rotated 180° to face the players across from it.
      if (np === 1) Object.assign(v, { x: 0, y: 0, w: W, h: H, flip: false });
      else if (np === 2 && !portrait) Object.assign(v, { x: k * W / 2, y: 0, w: W / 2, h: H, flip: false });
      else if (np === 2) Object.assign(v, { x: 0, y: k ? H / 2 : 0, w: W, h: H / 2, flip: k === 0 });
      else {
        const top = k < 2, cols = top ? 2 : np - 2, c = top ? k : k - 2;
        Object.assign(v, { x: c * W / cols, y: top ? 0 : H / 2, w: W / cols, h: H / 2, flip: top && portrait });
      }
      Object.assign(v.el.style, { left: v.x + 'px', top: v.y + 'px', width: v.w + 'px', height: v.h + 'px', transform: v.flip ? 'rotate(180deg)' : '' });
      const p = players[v.pi], a = v.w / v.h;
      p.cam.aspect = a;
      p.fov = THREE.MathUtils.clamp(2 * THREE.MathUtils.radToDeg(Math.atan(Math.tan(THREE.MathUtils.degToRad(32)) / a)), 60, 100); // keep all 3 lanes in view on tall screens
    });
  }

  const tmp = new THREE.Vector3(), look = new THREE.Vector3();
  function camFollow(p, v, dt) {
    const c = p.cam;
    if (sc.on) { sc.cam(v, c, p.fov); return; }
    const wx = TX[p.i] + p.x * .75, k = 1 - Math.exp(-dt * 10);
    c.position.lerp(tmp.set(wx, 3.4 + p.y * .35, -p.d + 6.2), k);
    if (p.shake > 0) { p.shake -= dt; c.position.x += (Math.random() - .5) * p.shake; c.position.y += (Math.random() - .5) * p.shake; }
    c.lookAt(look.set(wx, 1 + p.y * .3, -p.d - 9));
    if (v.flip) c.rotateZ(Math.PI);
    c.fov += (p.fov + (p.boost > 0 ? 9 : 0) - c.fov) * k;
    c.updateProjectionMatrix();
  }

  function pose(p, dt, sp, laneTarget) {
    p.run += dt * sp * .9;
    const wx = TX[p.i] + p.x;
    placeRunner(p.g, wx, p.y, -p.d);
    animRunner(p.g, p.run, p.y > 0 ? .15 : Math.min(1, sp / 14) * .9, p.y > 0 ? .75 : 0);
    p.g.userData.body.rotation.x = -.15 - Math.min(sp, 30) * .006;
    p.g.rotation.set(0, p.stun > 0 ? p.stun * 20 : 0, (laneTarget - p.x) * -.12);
    p.g.visible = !(p.inv > 0 && p.stun <= 0 && (p.inv * 12 | 0) % 2);
  }

  function collide(p) {
    const d = p.d, x = p.x, y = p.y;
    C.pads.forEach((o, i) => {
      if (i !== p.lastPad && Math.abs(o.d - d) < 1.5 && Math.abs(laneX(o.l) - x) < 1) {
        p.lastPad = i; p.boost = 1.3; if (heard(p)) sfx.boost(); say(p, t('boost'), 'boost');
      }
    });
    if (p.inv > 0) return;
    let hit = C.walls.some(o => Math.abs(o.d - d) < .75 && Math.abs(laneX(o.l) - x) < 1.25)
      || (y < .7 && C.bars.some(o => Math.abs(o.d - d) < .5))
      || C.sliders.some(o => Math.abs(o.d - d) < 1.1 && Math.abs(sliderX(o) - x) < 1.2);
    if (!hit && y < .75) {
      for (const s of C.streams) {
        if (d < s.far - s.span - 1 || d > s.far + 1 || Math.abs(laneX(s.l) - x) > .95) continue;
        for (let k = 0; k < BPS && !hit; k++) { const u = bulletU(s, k); hit = u > 1 && u < s.span - 1 && Math.abs(s.far - u - d) < .6; }
        if (hit) break;
      }
    }
    if (!hit) return;
    p.stun = .55; p.inv = 1.5; p.v = Math.max(V0 * .5, p.v * .45); p.boost = 0; p.shake = .5;
    say(p, t('hit'), 'hit');
    burst.emit(TX[p.i] + x, .8 + y, -d, 0xff4060, 28, 7);
    if (heard(p)) { sfx.hit(); buzz(60); }
  }

  let state = 'count', clock = 3.6, lastCount = 4, endTimer = 0, sendT = 0, hudT = 0, hintHidden = false, champ = 0;

  // ---- AI: looks ahead in its lane, sidesteps blockers, jumps bars, drifts onto boost pads.
  // Reaction delay + occasional lapses keep it beatable.
  function laneBlocked(l, d0, d1, sp) {
    const x = laneX(l);
    return C.walls.some(o => o.l === l && o.d > d0 - .5 && o.d < d1)
      || C.sliders.some(o => o.d > d0 - 1 && o.d < d1 && Math.abs(Math.sin((T + (o.d - d0) / sp) * o.w + o.ph) * LANE * 1.15 - x) < 1.6)
      || C.streams.some(s => s.l === l && s.far > d0 && s.far - s.span < d1);
  }
  function botStep(p, dt) {
    if ((p.bot.t -= dt) > 0 || p.fin != null || state === 'count') return;
    p.bot.t = .09 + Math.random() * .12;
    if (Math.random() < .12) return;
    const sp = Math.max(6, speed(p)), look = sp * .6 + 2;
    const blocked = l => laneBlocked(l, p.d, p.d + look, sp);
    if (blocked(p.lane)) {
      const free = [p.lane - 1, p.lane + 1].filter(l => l >= 0 && l <= 2 && !blocked(l));
      const to = free.length ? free[Math.random() * free.length | 0] : p.lane === 1 ? p.lane + (Math.random() < .5 ? -1 : 1) : 1;
      act(p.i, to < p.lane ? 'L' : 'R');
    } else if (p.y <= 0 && C.bars.some(o => { const ta = (o.d - p.d) / sp; return ta > .12 && ta < .32; })) act(p.i, 'J');
    else {
      const pad = C.pads.find(o => o.d > p.d + 4 && o.d < p.d + look + 8 && Math.abs(o.l - p.lane) === 1);
      if (pad && !blocked(pad.l)) act(p.i, pad.l < p.lane ? 'L' : 'R');
    }
  }

  // take over a remote player whose device left; continues from their last known state
  function botify(i, local) {
    const p = players[i];
    if (!local || !p || p.local) return;
    Object.assign(p, { local: true, bot: { t: .3 }, lane: THREE.MathUtils.clamp(Math.round(p.x / LANE) + 1, 0, 2), v: THREE.MathUtils.clamp(p.tv || V0, V0 * .5, VMAX), stun: 0, inv: 1 });
  }

  function stepLocal(p, dt) {
    if (p.bot) botStep(p, dt);
    let sp = 0;
    if (state !== 'count') {
      p.stun -= dt; p.inv -= dt; p.boost -= dt;
      if (p.fin != null) p.v = Math.max(0, p.v - 14 * dt);
      else if (p.stun <= 0) p.v = Math.min(VMAX, p.v + ACC * dt);
      sp = speed(p);
      p.d += sp * dt;
      if (p.fin == null) {
        collide(p);
        if (p.d >= LEN) {
          p.fin = T; p.boost = 0;
          if (heard(p)) sfx.finish();
          say(p, t('finish'), 'go');
          for (let k = 0; k < 4; k++) burst.emit(TX[p.i] + (k - 1.5) * 1.6, 4.8, -LEN, [0xffd23f, COL[p.i], 0xffffff, 0x3dff9a][k], 22, 8);
          if (online) {
            send({ t: 'fin', from: p.i, time: T });
            const v = paneOf(p);
            if (v && players.some(o => o.fin == null)) { v.hint.textContent = t('waitRival'); v.hint.classList.remove('hide'); }
          }
        }
      }
    }
    p.x += (laneX(p.lane) - p.x) * Math.min(1, dt * 14);
    p.vy -= GRAV * dt; p.y += p.vy * dt;
    if (p.y <= 0) { p.y = 0; p.vy = 0; }
    pose(p, dt, sp, laneX(p.lane));
  }

  function stepRemote(p, dt) {
    p.stun -= dt;
    p.td += p.tv * dt; // dead-reckon between packets
    p.d += (p.td - p.d) * Math.min(1, dt * 8);
    p.x += (p.tx - p.x) * Math.min(1, dt * 12);
    p.y += (p.ty - p.y) * Math.min(1, dt * 15);
    pose(p, dt, p.tv, p.tx);
  }

  function update(dt) {
    if (state === 'count') {
      clock -= dt;
      const n = Math.ceil(clock);
      if (n < lastCount && n > 0) { lastCount = n; sfx.count(); panes.forEach(v => flash(v.msg, n)); }
      if (clock <= 0) { state = 'race'; sfx.go(); panes.forEach(v => flash(v.msg, t('go'), 'go')); }
    } else T += dt;

    for (const p of players) p.local ? stepLocal(p, dt) : stepRemote(p, dt);

    let i = 0;
    for (const p of IDX) for (const o of C.sliders) setM(sliders, i++, TX[p] + sliderX(o), .75, -o.d, T * 3);
    sliders.instanceMatrix.needsUpdate = true;
    i = 0;
    for (const p of IDX) for (const s of C.streams) for (let k = 0; k < BPS; k++) {
      const u = bulletU(s, k);
      setM(bullets, i++, TX[p] + laneX(s.l), .7, -(s.far - u), 0, Math.max(.01, Math.min(1, u / 2, (s.span - u) / 2)));
    }
    bullets.instanceMatrix.needsUpdate = true;
    padTex.offset.y = (padTex.offset.y - dt * 1.5) % 1;
    burst.update(dt);
    sc.update(dt);

    if (online && state !== 'count' && (sendT -= dt) <= 0) {
      sendT = .066;
      for (const p of players) if (p.local) send({ t: 'p', from: p.i, d: p.d, x: p.x, y: p.y, v: speed(p), s: p.stun > 0 ? 1 : 0 }); // own runner + any AI this device drives
    }
    if (state === 'race' && players.every(p => p.fin != null)) { state = 'done'; endTimer = 1.6; }
    if (state === 'done' && endTimer > 0 && (endTimer -= dt) <= 0) {
      const order = [...IDX].sort((a, b) => players[a].fin - players[b].fin);
      champ = order[0];
      sc.start({ order, draw: n > 1 && players[order[0]].fin === players[order[1]].fin, scores: players.map(p => t('time', { n: p.fin.toFixed(2) })) }, () => players[champ].g.position, { r: 5.5, h: 2.6, look: 1.1 });
      const c = players[champ].g.position;
      burst.emit(c.x, c.y + 1.5, c.z, COL[champ], 30, 6);
    }
    if ((hudT -= dt) <= 0) {
      hudT = .1;
      if (!hintHidden && T > 2.5) { hintHidden = true; panes.forEach(v => v.fin == null && v.hint.classList.add('hide')); }
      for (const v of panes) {
        const s = (players[v.pi].fin ?? T).toFixed(1);
        if (v.time.textContent !== s) v.time.textContent = s; // frozen after the finish: no DOM write
        v.dots.forEach((d, j) => { d.style.transform = `translateX(${Math.min(100, players[j].d / LEN * 100)}cqw)`; });
      }
    }
    for (const v of panes) camFollow(players[v.pi], v, dt);
  }

  function render() {
    const H = innerHeight, split = panes.length > 1;
    renderer.setScissorTest(split);
    for (const v of panes) {
      const c = players[v.pi].cam, y = H - v.y - v.h; // GL viewport origin is bottom-left
      sky.position.copy(c.position);
      renderer.setViewport(v.x, y, v.w, v.h);
      if (split) renderer.setScissor(v.x, y, v.w, v.h);
      renderer.render(scene, c);
    }
    renderer.setScissorTest(false);
  }

  // input: per-pane swipe (acts mid-gesture) or tap zones left / centre / right
  const act = (pi, a) => {
    const p = players[pi];
    if (!p.local || state === 'count' || p.fin != null) return;
    const s = heard(p);
    if (a === 'L' && p.lane > 0) { p.lane--; if (s) sfx.lane(); }
    else if (a === 'R' && p.lane < 2) { p.lane++; if (s) sfx.lane(); }
    else if (a === 'J' && p.y <= 0) { p.vy = JUMP; if (s) sfx.jump(); }
  };
  const KEYS = {
    KeyA: [0, 'L'], KeyD: [0, 'R'], KeyW: [0, 'J'], ArrowLeft: [1, 'L'], ArrowRight: [1, 'R'], ArrowUp: [1, 'J'],
    KeyJ: [2, 'L'], KeyL: [2, 'R'], KeyI: [2, 'J'], Numpad4: [3, 'L'], Numpad6: [3, 'R'], Numpad8: [3, 'J'],
  };
  const onKey = e => {
    const k = KEYS[e.code];
    if (!k || e.repeat || (!online && n > 1 && k[0] >= n)) return;
    e.preventDefault();
    act(online || n === 1 ? me : k[0], k[1]); // solo: any key set
  };
  const touches = new Map();
  const paneAt = (x, y) => panes.find(v => x >= v.x && x < v.x + v.w && y >= v.y && y < v.y + v.h) || panes[0];
  const onDown = e => touches.set(e.pointerId, { x: e.clientX, y: e.clientY, v: paneAt(e.clientX, e.clientY), used: false });
  const onMove = e => {
    const s = touches.get(e.pointerId);
    if (!s || s.used) return;
    let dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (dx * dx + dy * dy < 26 * 26) return;
    s.used = true;
    if (s.v.flip) { dx = -dx; dy = -dy; }
    if (Math.abs(dx) > Math.abs(dy)) act(s.v.pi, dx < 0 ? 'L' : 'R');
    else if (dy < 0) act(s.v.pi, 'J');
  };
  const onUp = e => {
    const s = touches.get(e.pointerId);
    touches.delete(e.pointerId);
    if (!s || s.used || e.type === 'pointercancel') return;
    let rx = (s.x - s.v.x) / s.v.w;
    if (s.v.flip) rx = 1 - rx;
    act(s.v.pi, rx < .33 ? 'L' : rx > .67 ? 'R' : 'J');
  };
  const cv = renderer.domElement;
  cv.addEventListener('pointerdown', onDown);
  cv.addEventListener('pointermove', onMove);
  cv.addEventListener('pointerup', onUp);
  cv.addEventListener('pointercancel', onUp);
  addEventListener('keydown', onKey);

  function onNet(m) {
    const r = players[m.from];
    if (!r || r.local) return;
    if (m.t === 'p' && typeof m.d === 'number') { r.td = m.d; r.tx = +m.x || 0; r.ty = +m.y || 0; r.tv = +m.v || 0; if (m.s) r.stun = .3; }
    else if (m.t === 'fin' && typeof m.time === 'number' && r.fin == null) { r.fin = m.time; r.td = Math.max(r.td, LEN); }
  }

  function dispose() {
    cv.removeEventListener('pointerdown', onDown);
    cv.removeEventListener('pointermove', onMove);
    cv.removeEventListener('pointerup', onUp);
    cv.removeEventListener('pointercancel', onUp);
    removeEventListener('keydown', onKey);
    panes.forEach(v => v.el.remove());
    document.body.classList.remove('split-v');
    disposeScene(scene);
  }

  resize();
  players.forEach(p => pose(p, 0, 0, 0));
  panes.forEach(v => camFollow(players[v.pi], v, 1));
  bots.forEach(i => botify(i, me === 0)); // bots carried into a rematch are driven by the host
  return { update, render, resize, onNet, dispose, botify };
}
