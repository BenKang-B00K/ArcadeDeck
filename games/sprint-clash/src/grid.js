import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { COL, hex, canvasTex, disposeScene, flash, buzz, Burst } from './fx.js';
import { setText, coarse, keyHint, zones, makePane, rankChips, layout, fitFov, renderPanes, bindInput, countdown, makeShowcase, addSky, addCity, lights, nameTag } from './stage.js';

// Grid Claim: light cycles paint every cell they enter. Recent cells (2.5 s) stand as light walls; hitting one
// stuns you for 1.5 s, nobody is knocked out. Closing a loop of your own cells claims everything inside it.
// Most painted cells after 60 s wins.
// One device (host, or whoever inherits it) runs a fixed 12 Hz tick sim and streams every tick; guests only send presses.
const G = 40, TPS = 12, TICK = 1 / TPS, TICKS = 60 * TPS, WALL = 30, STUN = 18, BOOST = 18, CHARGES = 3, SNAP = 24, MAXW = 320;
const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0]; // heading 0 up (-z), 1 right, 2 down, 3 left
const wx = v => v - G / 2 + .5; // cell → world
const START = [[4, 4, 1], [G - 5, G - 5, 3], [G - 5, 4, 2], [4, G - 5, 0]]; // corners, facing along the edge; 2p = opposite corners

export function createGrid({ renderer, mode, n = 2, me = 0, bots = [], rand, send, label, onEnd }) {
  const online = mode === 'online';
  const IDX = [...Array(n).keys()];
  let auth = !online || me === 0; // this device runs the sim

  const scene = new THREE.Scene(), fogC = new THREE.Color(0x070b1e);
  scene.background = fogC;
  scene.fog = new THREE.Fog(fogC, 30, 95);
  lights(scene);
  const sky = addSky(scene, fogC, 0x2a1a6c);
  addCity(scene, { y: 0, n: 140, x0: -95, x1: 95, z0: 95, z1: -95, clear: (x, z) => Math.max(Math.abs(x), Math.abs(z)) < 40 });

  // outer floor + arena: ownership lives in one 40×40 DataTexture, grid lines on an overlay
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const outer = canvasTex(64, 64, (g, w) => { g.fillStyle = '#060918'; g.fillRect(0, 0, w, w); g.strokeStyle = '#18204e'; g.lineWidth = 2; g.strokeRect(0, 0, w, w); });
  outer.wrapS = outer.wrapT = THREE.RepeatWrapping; outer.repeat.set(50, 50); outer.anisotropy = aniso;
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(200, 200).rotateX(-Math.PI / 2).translate(0, -.03, 0), new THREE.MeshBasicMaterial({ map: outer })));
  const px = new Uint8Array(G * G * 4), floor = new THREE.DataTexture(px, G, G);
  floor.colorSpace = THREE.SRGBColorSpace;
  floor.magFilter = floor.minFilter = THREE.NearestFilter;
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(G, G).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: floor, toneMapped: false })));
  const lines = canvasTex(32, 32, (g, w) => { g.strokeStyle = 'rgba(140,165,255,.3)'; g.lineWidth = 2; g.strokeRect(0, 0, w, w); });
  lines.wrapS = lines.wrapT = THREE.RepeatWrapping; lines.repeat.set(G, G); lines.anisotropy = aniso;
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(G, G).rotateX(-Math.PI / 2).translate(0, .01, 0), new THREE.MeshBasicMaterial({ map: lines, transparent: true, depthWrite: false })));
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0x7a8cff, toneMapped: false });
  for (const [x, z, w, d] of [[0, -G / 2 - .15, G + .6, .3], [0, G / 2 + .15, G + .6, .3], [-G / 2 - .15, 0, .3, G], [G / 2 + .15, 0, .3, G]]) {
    const e = new THREE.Mesh(new THREE.BoxGeometry(w, .3, d), edgeMat); e.position.set(x, .15, z); scene.add(e);
  }

  // shared state (identical on every device, driven by the tick stream on guests)
  const own = new Int8Array(G * G).fill(-1), age = new Int32Array(G * G).fill(-999), cnt = Array(n).fill(0);
  const trail = IDX.map(() => []); // recent cells per player: { c, k, d }
  let k = 0, changed = [], fills = [], dirty = true;
  const rgb = COL.map(c => [c >> 16 & 255, c >> 8 & 255, c & 255].map(v => v * .5 | 0));
  function texel(c) {
    const x = c % G, y = c / G | 0, j = ((G - 1 - y) * G + x) * 4, o = own[c];
    const col = o >= 0 ? rgb[o] : (x + y) % 2 ? [12, 17, 50] : [15, 21, 60];
    px[j] = col[0]; px[j + 1] = col[1]; px[j + 2] = col[2]; px[j + 3] = 255;
    dirty = true;
  }
  for (let c = 0; c < G * G; c++) texel(c);

  function paint(i, c) {
    const prev = own[c];
    if (prev === i) return false;
    if (prev >= 0) cnt[prev]--;
    cnt[i]++; own[c] = i; texel(c);
    return true;
  }
  function enter(i, c) {
    const gained = paint(i, c);
    age[c] = k;
    trail[i].push({ c, k, d: players[i].d });
    changed.push(c, i);
    return gained;
  }

  // enclosure: flood from the border through cells i doesn't own; whatever the flood can't reach is sealed inside i's loop
  const seen = new Uint8Array(G * G), stack = new Int32Array(G * G);
  function enclose(i) {
    seen.fill(0);
    let sp = 0;
    const push = c => { if (!seen[c] && own[c] !== i) { seen[c] = 1; stack[sp++] = c; } };
    for (let j = 0; j < G; j++) { push(j); push(G * G - G + j); push(j * G); push(j * G + G - 1); }
    while (sp) {
      const c = stack[--sp], x = c % G;
      if (x) push(c - 1);
      if (x < G - 1) push(c + 1);
      if (c >= G) push(c - G);
      if (c < G * G - G) push(c + G);
    }
    const got = [];
    for (let c = 0; c < G * G; c++) if (!seen[c] && own[c] !== i) { paint(i, c); fills.push(c, i); got.push(c); }
    if (got.length) claimed(i, got);
  }

  // cycles: dark hull + glowing wheels / strip + a floor halo; name tag so rivals are easy to tell apart
  const hullGeo = mergeGeometries([
    new THREE.CapsuleGeometry(.2, .75, 4, 12).rotateX(Math.PI / 2).scale(1.3, 1, 1).translate(0, .38, 0),
    new THREE.SphereGeometry(.2, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, .9, 1.7).translate(0, .5, -.12),
  ]);
  const glowGeo = mergeGeometries([
    new THREE.TorusGeometry(.27, .06, 8, 24).rotateY(Math.PI / 2).translate(0, .28, -.5),
    new THREE.TorusGeometry(.27, .06, 8, 24).rotateY(Math.PI / 2).translate(0, .28, .5),
    new THREE.BoxGeometry(.54, .05, .8).translate(0, .38, 0),
  ]);
  const haloTex = canvasTex(64, 64, (g, w) => {
    const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  });
  const haloGeo = new THREE.PlaneGeometry(2.4, 3).rotateX(-Math.PI / 2);
  const mirror = rand() < .5; // seeded: mirror the start layout across the diagonal
  const players = IDX.map(i => {
    let [x, y, d] = START[i];
    if (mirror) { [x, y] = [y, x]; d = 3 - d; }
    const g = new THREE.Group();
    const hull = new THREE.Mesh(hullGeo, new THREE.MeshStandardMaterial({ color: 0x141a36, emissive: COL[i], emissiveIntensity: .12, roughness: .25, metalness: .75 }));
    const glow = new THREE.Mesh(glowGeo, new THREE.MeshBasicMaterial({ color: COL[i], toneMapped: false }));
    const halo = new THREE.Mesh(haloGeo, new THREE.MeshBasicMaterial({ map: haloTex, color: COL[i], transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    halo.position.y = .03;
    const tag = nameTag(label(i), COL[i]); tag.position.y = 1.5;
    g.add(hull, glow, halo, tag);
    scene.add(g);
    const c = y * G + x, a = -d * Math.PI / 2;
    return {
      i, g, hull, halo, tag, x, y, d, px: x, py: y, stun: 0, boost: 0, charges: CHARGES, q: [], boostReq: false, hist: [c, c],
      ang: a, camAng: a, cam: new THREE.PerspectiveCamera(60, 1, .1, 200), fov: 60, cp: null, look: new THREE.Vector3(), local: !online || i === me, bot: false,
      was: { stun: 0, boost: 0 },
    };
  });
  players.forEach(p => enter(p.i, p.y * G + p.x));
  changed = [];

  // light walls: one additive InstancedMesh, colour fades with age (black = invisible)
  const walls = new THREE.InstancedMesh(new THREE.BoxGeometry(.16, .7, 1.02).translate(0, .35, 0),
    new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), MAXW);
  walls.count = 0; walls.frustumCulled = false;
  walls.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(walls);
  const burst = new Burst(scene);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1), UP = new THREE.Vector3(0, 1, 0), C = new THREE.Color();
  const tmp = new THREE.Vector3();

  function drawWalls() {
    let m = 0;
    for (const p of players) {
      const tr = trail[p.i];
      while (tr.length && tr[0].k <= k - WALL) tr.shift();
      for (const e of tr) {
        if (m >= MAXW) break;
        const f = 1 - (k - e.k) / WALL;
        walls.setMatrixAt(m, M.compose(P.set(wx(e.c % G), 0, wx(e.c / G | 0)), Q.setFromAxisAngle(UP, e.d % 2 ? Math.PI / 2 : 0), S));
        walls.setColorAt(m++, C.setHex(COL[p.i]).multiplyScalar(.15 + .85 * f * f));
      }
    }
    walls.count = m;
    walls.instanceMatrix.needsUpdate = true;
    if (walls.instanceColor) walls.instanceColor.needsUpdate = true;
  }

  // HUD: time, share bar, boost pips, % chips
  const panes = (online ? [me] : IDX).map(pi => {
    const v = makePane(pi, label, zones('◀', '⚡', '▶'));
    v.chips = rankChips(v, n, label);
    v.hint.textContent = coarse ? t('gridTouch') : t('gridKeys', keyHint(pi, online));
    const bar = document.createElement('div');
    bar.style.cssText = 'position:absolute;left:72px;right:72px;bottom:var(--sb);height:8px;border-radius:4px;overflow:hidden;display:flex;background:rgba(255,255,255,.12)';
    v.segs = IDX.map(i => { const s = document.createElement('i'); s.style.cssText = `display:block;height:100%;width:0;background:${hex(i)};box-shadow:0 0 8px ${hex(i)};transition:width .25s`; bar.appendChild(s); return s; });
    v.el.appendChild(bar);
    v.pips = document.createElement('span');
    v.pips.style.cssText = 'color:var(--acc);letter-spacing:1px;font-size:14px';
    v.q('.ptop').appendChild(v.pips);
    return v;
  });
  const paneOf = i => panes.find(v => v.pi === i);
  let lastSec = -1;
  function hud() {
    const sec = Math.max(0, Math.ceil((TICKS - k) / TPS));
    if (sec !== lastSec && sec <= 5 && sec > 0 && ph === 'play') sfx.count();
    lastSec = sec;
    for (const v of panes) {
      setText(v.val, sec);
      v.chips(cnt.map(c => `${Math.round(c / 16)}%`));
      v.segs.forEach((s, i) => { s.style.width = `${cnt[i] / 16}%`; });
      setText(v.pips, '⚡'.repeat(players[v.pi].charges));
    }
  }

  // ---- sim (authority only)
  const blocked = (c, p, strict) => age[c] > k - WALL && (strict || !p.hist.includes(c));
  const free = (p, d) => { const x = p.x + DX[d], y = p.y + DY[d]; return x >= 0 && y >= 0 && x < G && y < G && !blocked(y * G + x, p, true); };
  const crash = p => { p.stun = STUN; p.boost = 0; p.q = []; };

  // AI: score straight / left / right by free run (≤ 8) and paint value of the next 5 cells
  function think(p) {
    let best = null;
    [p.d, (p.d + 3) % 4, (p.d + 1) % 4].forEach((d, o) => {
      let run = 0, val = 0, x = p.x, y = p.y;
      for (let s = 1; s <= 8; s++) {
        x += DX[d]; y += DY[d];
        if (x < 0 || y < 0 || x >= G || y >= G) break;
        const c = y * G + x;
        if (age[c] > k - WALL + s || players.some(q => q !== p && q.x === x && q.y === y)) break; // still a wall when we'd get there
        run++;
        if (s <= 5) val += own[c] < 0 ? 2 : own[c] !== p.i ? 3 : 0;
      }
      const score = Math.min(run, 6) * 10 + val + Math.random() * 1.5 - (o ? .8 : 0);
      if (!best || score > best.score) best = { o, run, score };
    });
    p.q = best.o ? [best.o === 1 ? 'L' : 'R'] : [];
    if (!best.o && best.run >= 8 && p.charges && !p.boost && Math.random() < .06) p.boostReq = true;
  }

  function tick() {
    k++;
    const moving = [];
    for (const p of players) {
      p.px = p.x; p.py = p.y;
      if (p.bot && p.local && !p.stun) think(p);
      if (p.stun > 0) {
        if (--p.stun === 0) { // a turn pressed while stunned picks the way out
          const turn = p.q.length ? (p.d + (p.q[0] === 'L' ? 3 : 1)) % 4 : p.d;
          const d = [turn, p.d, (p.d + 1) % 4, (p.d + 3) % 4, (p.d + 2) % 4].find(d => free(p, d));
          if (d == null) p.stun = 1; else { p.d = d; p.q = []; }
        }
        p.boostReq = false;
        continue;
      }
      if (p.q.length) p.d = (p.d + (p.q.shift() === 'L' ? 3 : 1)) % 4;
      if (p.boostReq && p.charges > 0 && !p.boost) { p.boost = BOOST; p.charges--; }
      p.boostReq = false;
      moving.push([p, p.boost > 0 ? (p.boost--, 2) : 1]);
    }
    for (let s = 0; s < 2; s++) {
      const go = moving.filter(([p, steps]) => steps > s && !p.stun).map(([p]) => p);
      const tgt = go.map(p => { const x = p.x + DX[p.d], y = p.y + DY[p.d]; return x < 0 || y < 0 || x >= G || y >= G ? -1 : y * G + x; });
      go.forEach((p, j) => {
        const c = tgt[j];
        if (c < 0 || blocked(c, p) || tgt.some((o, m) => m !== j && o === c) || players.some(o => o !== p && o.y * G + o.x === c)) crash(p);
        else { p.x = c % G; p.y = c / G | 0; p.hist = [p.hist[1], c]; if (enter(p.i, c)) enclose(p.i); }
      });
    }
    if (online) {
      send({ t: 'gt', from: me, k, p: players.flatMap(p => [p.x, p.y, p.d, p.stun, p.boost, p.charges]), c: changed, f: fills });
      if (k % SNAP === 0) send({ t: 'gs', from: me, k, o: Array.from(own, v => v + 1).join('') });
    }
    changed = []; fills = [];
    afterTick();
  }

  // guests: apply a streamed tick
  function applyTick(m) {
    if (m.k <= k) return;
    k = m.k;
    players.forEach((p, i) => {
      const [x, y, d, stun, boost, charges] = m.p.slice(i * 6, i * 6 + 6);
      p.px = p.x; p.py = p.y;
      if (x !== p.x || y !== p.y) p.hist = [p.hist[1], y * G + x];
      Object.assign(p, { x, y, d, stun, boost, charges });
    });
    for (let j = 0; j < m.c.length; j += 2) enter(m.c[j + 1], m.c[j]);
    const got = IDX.map(() => []);
    for (let j = 0; j < m.f.length; j += 2) if (paint(m.f[j + 1], m.f[j])) got[m.f[j + 1]].push(m.f[j]);
    got.forEach((g, i) => g.length && claimed(i, g));
    changed = []; fills = [];
    afterTick();
  }

  // loop closed: burst over the claimed area, cue for the owner's pane
  function claimed(i, cells) {
    let sx = 0, sz = 0;
    for (const c of cells) { sx += c % G; sz += c / G | 0; }
    burst.emit(wx(sx / cells.length), .4, wx(sz / cells.length), COL[i], Math.min(40, 10 + cells.length), 4);
    const v = paneOf(i);
    if (v) { flash(v.msg, `+${cells.length}`, 'boost'); sfx.perfect(); buzz(30); }
  }

  // crash / boost feedback, walls, HUD — on every device after each tick
  function afterTick() {
    for (const p of players) {
      const v = paneOf(p.i), X = wx(p.x), Z = wx(p.y);
      if (p.stun && !p.was.stun) {
        burst.emit(X, .5, Z, COL[p.i], 22, 5);
        if (v) { flash(v.msg, t('gridCrash'), 'hit'); sfx.hit(); buzz(60); }
      }
      if (p.boost && !p.was.boost && v) { flash(v.msg, t('boost'), 'boost'); sfx.boost(); }
      if (p.boost) burst.emit(X, .3, Z, COL[p.i], 3, 1.5);
      p.was = { stun: p.stun, boost: p.boost };
    }
    drawWalls();
    hud();
  }

  // ---- flow
  let ph = 'count', acc = 0, gclock = 0, time = 0, hintT = 0, endT = 0, final = null, champ = 0;
  const gq = [];
  const step321 = countdown(panes);
  const sc = makeShowcase(panes, label, onEnd);

  function end(c) {
    if (ph === 'end' || ph === 'done') return;
    final = [...c]; ph = 'end'; endT = 1.6;
    panes.forEach(v => flash(v.msg, t('timeUp'), 'go'));
    sfx.finish();
    if (auth && online) send({ t: 'ge', from: me, c: final });
  }
  function finish() {
    ph = 'done';
    const c = final, order = [...IDX].sort((a, b) => c[b] - c[a]);
    champ = order[0];
    sc.start({ order, draw: c[order[0]] === c[order[1]], places: IDX.map(i => IDX.filter(j => c[j] > c[i]).length), scores: c.map(v => t('gridPct', { n: (v / 16).toFixed(1) })) },
      () => players[champ].g.position, { r: 9, h: 6, look: .4 }); // higher orbit to show off the claimed territory
  }

  function update(dt) {
    time += dt;
    if (ph === 'count' && !step321(dt)) { ph = 'play'; hintT = 4; }
    if (ph === 'play') {
      if (auth) {
        acc += dt;
        while (acc >= TICK && k < TICKS) { acc -= TICK; tick(); }
        if (k >= TICKS) end(cnt);
      }
      if (hintT > 0 && (hintT -= dt) <= 0) panes.forEach(v => v.hint.classList.add('hide'));
    }
    if (!auth) { // play streamed ticks at the tick rate, catching up if more than 2 are waiting
      gclock += dt;
      while (gq.length && (gclock >= TICK || gq.length > 2)) { gclock = Math.max(0, gclock - TICK); applyTick(gq.shift()); }
      if (!gq.length) gclock = Math.min(gclock, TICK);
    }
    if (ph === 'end' && (endT -= dt) <= 0) finish();
    if (dirty) { floor.needsUpdate = true; dirty = false; }

    const f = Math.min(1, auth ? acc / TICK : gclock / TICK), kc = 1 - Math.exp(-dt * 6);
    for (const p of players) {
      const X = wx(p.stun ? p.x : p.px + (p.x - p.px) * f), Z = wx(p.stun ? p.y : p.py + (p.y - p.py) * f);
      const a = -p.d * Math.PI / 2, da = x => Math.atan2(Math.sin(a - x), Math.cos(a - x));
      p.ang += da(p.ang) * Math.min(1, dt * 14);
      p.camAng += da(p.camAng) * Math.min(1, dt * 5);
      p.g.position.set(X, 0, Z);
      p.g.rotation.set(0, p.ang, p.stun ? Math.sin(time * 40) * .25 : 0);
      p.hull.visible = !(p.stun && (time * 16 | 0) % 2);
      p.halo.scale.setScalar(p.boost ? 1.5 + Math.sin(time * 30) * .1 : 1);
      if (!paneOf(p.i)) continue;
      const fx = -Math.sin(p.camAng), fz = -Math.cos(p.camAng);
      tmp.set(X - fx * 6, 9.5, Z - fz * 6);
      p.cp ? p.cp.lerp(tmp, kc) : (p.cp = tmp.clone());
      p.look.set(X + fx * 4.5, 0, Z + fz * 4.5);
    }
    burst.update(dt);
    sc.update(dt);
  }

  function resize() {
    layout(panes);
    for (const v of panes) { const p = players[v.pi]; p.cam.aspect = v.w / v.h; p.fov = fitFov(p.cam.aspect, 36, 60, 100); }
  }

  function render() {
    renderPanes(renderer, scene, panes, v => {
      const p = players[v.pi], c = p.cam;
      if (sc.on) { sc.cam(v, c, p.fov); sky.position.copy(c.position); return c; }
      if (p.cp) c.position.copy(p.cp);
      c.lookAt(p.look);
      if (v.flip) c.rotateZ(Math.PI);
      c.fov = p.fov; c.updateProjectionMatrix();
      sky.position.copy(c.position);
      return c;
    });
  }

  function press(i, a) {
    const p = players[i];
    if (a === 'A') p.boostReq = true;
    else if (p.q.length < 2) p.q.push(a);
  }
  const act = (pi, a) => {
    const p = players[pi];
    if (!p?.local || p.bot || ph !== 'play') return;
    if (a !== 'A') sfx.lane();
    if (auth) press(pi, a); else send({ t: 'gi', from: pi, a });
  };
  const unbind = bindInput({ cv: renderer.domElement, panes, n, online, me, act });

  const int = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
  function onNet(m) {
    if (m.t === 'gi') { // host: a guest's press
      if (auth && int(m.from, 1, n - 1) && !players[m.from].local && ['L', 'R', 'A'].includes(m.a)) press(m.from, m.a);
    } else if (auth) return; // everything below comes from the authority
    else if (m.t === 'gt') {
      if (!int(m.k, 1, TICKS) || !Array.isArray(m.p) || m.p.length !== n * 6 || !Array.isArray(m.c) || m.c.length % 2) return;
      if (!Array.isArray(m.f) || m.f.length % 2 || !m.f.every((v, j) => int(v, 0, j % 2 ? n - 1 : G * G - 1))) return;
      const lim = [G - 1, G - 1, 3, STUN, BOOST, CHARGES];
      if (!m.p.every((v, j) => int(v, 0, lim[j % 6])) || !m.c.every((v, j) => int(v, 0, j % 2 ? n - 1 : G * G - 1))) return;
      gq.push(m);
    } else if (m.t === 'gs') { // periodic full ownership: heals anything a lost packet missed
      if (typeof m.o !== 'string' || m.o.length !== G * G || !/^[0-4]+$/.test(m.o)) return;
      cnt.fill(0);
      for (let c = 0; c < G * G; c++) {
        const o = Math.min(n, +m.o[c]) - 1;
        if (o !== own[c]) { own[c] = o; texel(c); }
        if (o >= 0) cnt[o]++;
      }
    } else if (m.t === 'ge' && Array.isArray(m.c) && m.c.length === n && m.c.every(v => int(v, 0, G * G))) end(m.c);
  }

  function botify(i, local) {
    const p = players[i];
    if (!p) return;
    p.bot = true;
    if (local) p.local = true;
    p.tag.userData.set(label(i));
    if (i === 0 && local && !auth) { // host vanished: carry on as the authority from the last streamed tick
      while (gq.length) applyTick(gq.shift());
      auth = true; acc = 0;
    }
  }

  function dispose() {
    unbind();
    panes.forEach(v => v.el.remove());
    document.body.classList.remove('split-v');
    disposeScene(scene);
  }

  resize();
  drawWalls();
  hud();
  bots.forEach(i => botify(i, me === 0));
  return { update, render, resize, onNet, dispose, botify };
}
