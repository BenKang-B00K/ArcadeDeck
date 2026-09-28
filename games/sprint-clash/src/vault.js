import * as THREE from 'three';
import { sfx } from './audio.js';
import { t } from './i18n.js';
import { COL, canvasTex, disposeScene, flash, buzz, Burst } from './fx.js';
import { coarse, keyHint, zones, makePane, rankChips, layout, fitFov, renderPanes, bindInput, countdown, makeShowcase, addSky, lights, makeRunner, animRunner, placeRunner, nameTag } from './stage.js';

// Vault Run: push-your-luck (Incan Gold style), 5 vaults. Every device builds the same 5 seeded 30-card
// decks from `rand` up front, then reveals cards on its own clock — no host authority. Only the hidden
// stay/leave votes travel the network, keyed by (vault, card index), same pattern as draw.js's per-round
// results: a device fills in its own local players immediately and waits for the rest to arrive.
// A repeat trap is forced by the 21st reveal (15 gems + 5 first copies), so a vault can't run forever.
// The decision window closes early when every local seat still inside is AI, so all-AI matches fly by.
// Choices stay hidden until the window closes (the pane only shows a neutral lock-in); no choice = leave.
const VAULTS = 5, STEP = 3, GATE = 5, REVEAL = .9, WINDOW = 3, BUST_SHOW = 1.1, VEND_SHOW = 1.1, LEN = 100;
const GEM_VALS = [1, 2, 3, 4, 5, 5, 7, 7, 9, 11, 11, 13, 14, 15, 17];
const TRAPS = ['snake', 'spider', 'fire', 'boulder', 'spikes'];
const GEM_COL = 0x5be8ff, TRAP_COL = 0xff5a3a, GOLD = 0xffd23f;

function buildDeck(rand) {
  const cards = [...GEM_VALS.map(g => ({ g })), ...TRAPS.flatMap(k => [0, 1, 2].map(() => ({ k })))];
  for (let i = cards.length - 1; i > 0; i--) { const j = rand() * (i + 1) | 0; [cards[i], cards[j]] = [cards[j], cards[i]]; }
  return cards;
}

// white glyph per trap kind, tinted by the sprite material colour (same convention as stage.js symTex)
function trapTex(kind) {
  return canvasTex(128, 128, g => {
    g.strokeStyle = g.fillStyle = '#fff'; g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath();
    if (kind === 'snake') { g.moveTo(20, 40); g.bezierCurveTo(48, 8, 80, 72, 108, 40); g.stroke(); g.beginPath(); g.arc(108, 33, 8, 0, 7); g.fill(); }
    else if (kind === 'spider') {
      g.arc(64, 70, 20, 0, 7); g.fill();
      for (let s = -1; s <= 1; s += 2) for (let a = 0; a < 4; a++) { g.beginPath(); g.moveTo(64 + s * 17, 68); g.lineTo(64 + s * (44 + a * 5), 44 + a * 13); g.stroke(); }
    } else if (kind === 'fire') { g.moveTo(64, 12); g.bezierCurveTo(28, 52, 40, 78, 64, 116); g.bezierCurveTo(88, 78, 100, 52, 64, 12); g.fill(); }
    else if (kind === 'boulder') { for (let a = 0; a < 8; a++) { const r = 32 + (a % 2) * 12, an = a * Math.PI / 4; g[a ? 'lineTo' : 'moveTo'](64 + Math.cos(an) * r, 64 + Math.sin(an) * r); } g.closePath(); g.fill(); }
    else for (let s = 0; s < 5; s++) { const x = 12 + s * 26; g.moveTo(x, 110); g.lineTo(x + 13, 16); g.lineTo(x + 26, 110); } // spikes: 5 filled triangles
    g.fill();
  });
}

export function createVault({ renderer, mode, n = 2, me = 0, bots = [], rand, send, label, onEnd }) {
  const online = mode === 'online';
  const IDX = [...Array(n).keys()];
  const decks = Array.from({ length: VAULTS }, () => buildDeck(rand));
  const TX = IDX.map(i => (i - (n - 1) / 2) * 1.7); // entrance lineup, players stand close together

  const scene = new THREE.Scene(), fogC = new THREE.Color(0x100b08);
  scene.background = fogC;
  scene.fog = new THREE.Fog(fogC, 10, 62);
  lights(scene);
  const sky = addSky(scene, fogC, 0x8a3a12);

  // stone corridor receding into -z, torch sconces glowing along both walls
  const stoneTex = canvasTex(128, 128, (g, w) => {
    g.fillStyle = '#1c1410'; g.fillRect(0, 0, w, w);
    g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 2;
    for (let y = 0; y < w; y += 22) for (let x = (y / 22 % 2) * 16; x < w; x += 32) g.strokeRect(x, y, 30, 20);
  });
  stoneTex.wrapS = stoneTex.wrapT = THREE.RepeatWrapping; stoneTex.repeat.set(6, 30);
  stoneTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const stoneMat = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: .85, metalness: .1 });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(9, LEN).rotateX(-Math.PI / 2).translate(0, 0, -LEN / 2 + 6), stoneMat));
  const wallGeo = new THREE.BoxGeometry(.6, 6, LEN);
  const wallL = new THREE.Mesh(wallGeo, stoneMat), wallR = new THREE.Mesh(wallGeo, stoneMat);
  wallL.position.set(-4.8, 3, -LEN / 2 + 6); wallR.position.set(4.8, 3, -LEN / 2 + 6);
  scene.add(wallL, wallR);
  const flameTex = canvasTex(64, 64, (g, w) => {
    const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,220,140,.95)'); gr.addColorStop(.5, 'rgba(255,120,30,.5)'); gr.addColorStop(1, 'rgba(255,60,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  });
  const torches = [];
  for (let z = -2; z > -(LEN - 6); z -= 6) for (const x of [-4.2, 4.2]) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    s.position.set(x, 3.4, z); s.scale.setScalar(1.6);
    scene.add(s); torches.push(s);
  }

  // small canvas-number sprite, redrawable in place (same trick as stage.js nameTag)
  function numSprite() {
    const tex = canvasTex(64, 64, () => {});
    const g = tex.image.getContext('2d');
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
    s.userData.ownTex = true;
    s.userData.set = val => { g.clearRect(0, 0, 64, 64); g.fillStyle = '#fff'; g.font = '900 32px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('' + val, 32, 34); tex.needsUpdate = true; };
    s.userData.set(0);
    return s;
  }
  const pool = numSprite(); // unclaimed gems waiting on the path
  pool.position.set(0, 1.7, -2.4); pool.scale.set(.55, .55, 1); pool.material.color.setHex(GOLD); pool.visible = false;
  scene.add(pool);

  const trapTexes = Object.fromEntries(TRAPS.map(k => [k, trapTex(k)]));
  const pedGeo = new THREE.CylinderGeometry(.9, 1.05, .3, 24), rimGeo = new THREE.TorusGeometry(.92, .05, 6, 32).rotateX(Math.PI / 2), gemGeo = new THREE.OctahedronGeometry(.22);

  function gemCluster(value) {
    const mat = new THREE.MeshStandardMaterial({ color: GEM_COL, emissive: GEM_COL, emissiveIntensity: .55, roughness: .15, metalness: .3 });
    const grp = new THREE.Group(), cnt = Math.min(7, Math.max(1, Math.round(value / 2)));
    for (let i = 0; i < cnt; i++) {
      const m = new THREE.Mesh(gemGeo, mat), a = i / cnt * Math.PI * 2, r = cnt > 1 ? .3 : 0;
      m.position.set(Math.cos(a) * r, .35 + (i % 2) * .14, Math.sin(a) * r);
      m.rotation.set(i, i * 1.3, i * .7);
      grp.add(m);
    }
    return grp;
  }

  const tiles = []; // { grp, t } — pop-in progress 0..1
  function spawnTile(card, idx) {
    const z = -(GATE + idx * STEP), isGem = card.g != null, grp = new THREE.Group();
    grp.position.set(0, 0, z); grp.scale.setScalar(0);
    const rim = new THREE.Mesh(rimGeo, new THREE.MeshBasicMaterial({ color: isGem ? GEM_COL : TRAP_COL, toneMapped: false }));
    rim.position.y = .16;
    grp.add(new THREE.Mesh(pedGeo, stoneMat), rim);
    if (isGem) {
      grp.add(gemCluster(card.g));
      const num = numSprite(); num.position.set(0, 1.05, 0); num.scale.set(.6, .6, 1); num.userData.set(card.g);
      grp.add(num);
    } else {
      const icon = new THREE.Sprite(new THREE.SpriteMaterial({ map: trapTexes[card.k], color: TRAP_COL, transparent: true, depthWrite: false, toneMapped: false }));
      icon.position.set(0, .85, 0); icon.scale.setScalar(1.1);
      grp.add(icon);
    }
    scene.add(grp);
    tiles.push({ grp, t: 0 });
  }
  function clearTiles() {
    for (const tl of tiles) {
      scene.remove(tl.grp);
      tl.grp.traverse(o => {
        if (!o.isMesh && !o.isSprite) return;
        if (o.geometry && o.geometry !== pedGeo && o.geometry !== rimGeo && o.geometry !== gemGeo) o.geometry.dispose();
        if (o.material && o.material !== stoneMat) { if (o.userData.ownTex) o.material.map?.dispose(); o.material.dispose(); }
      });
    }
    tiles.length = 0;
  }

  const burst = new Burst(scene);
  const players = IDX.map(i => {
    const r = makeRunner(COL[i]), tag = nameTag(label(i), COL[i]);
    r.add(tag);
    scene.add(r);
    return { i, r, tag, cam: new THREE.PerspectiveCamera(60, 1, .1, 160), fov: 60, local: !online || i === me, bot: false,
      banked: 0, carried: 0, inside: true, pending: 0, z: 0, bustFx: 0 };
  });

  const panes = (online ? [me] : IDX).map(pi => {
    const v = makePane(pi, label, zones('✕', '●', '✕'));
    v.chips = rankChips(v, n, label);
    v.hint.textContent = coarse ? t('vaultTouch') : t('vaultKeys', keyHint(pi, online));
    v.brace = document.createElement('div'); v.brace.className = 'brace'; v.brace.innerHTML = '<i></i><b></b>';
    v.el.appendChild(v.brace);
    return v;
  });
  const paneOf = i => panes.find(v => v.pi === i);
  const trapNames = () => t('vaultTraps').split('|');
  const trapName = k => trapNames()[TRAPS.indexOf(k)] ?? k;
  const chips = () => panes.forEach(v => v.chips(players.map(p => `💎${p.banked}` + (p.inside && p.carried ? `+${p.carried}` : ''))));
  const sayInside = (text, cls) => panes.forEach(v => { if (players[v.pi].inside) flash(v.msg, text, cls); });

  let ph = 'count', vi = 0, ci = -1, busted = false, trapSeen = {}, pathGems = 0;
  let revealT = 0, winT = 0, waiting = false, tickT = 0, phaseT = 0, time = 0;
  const choice = p => p.pending ?? 1; // undecided at the buzzer = leave with the gems
  const res = Array.from({ length: VAULTS }, () => []); // res[vi][ci][seat] = 0 stay / 1 leave
  const step = countdown(panes);
  const sc = makeShowcase(panes, label, onEnd);
  let champ = 0;

  function nextCard() {
    ci++;
    const deck = decks[vi];
    if (ci >= deck.length) { forceLeaveAll(); endVault(); return; } // never hit in practice, see file header note
    const card = deck[ci];
    ph = 'reveal'; revealT = REVEAL;
    spawnTile(card, ci);
    const insiders = IDX.filter(i => players[i].inside);
    if (card.g != null) {
      const share = Math.floor(card.g / insiders.length), rem = card.g - share * insiders.length;
      insiders.forEach(i => players[i].carried += share);
      pathGems += rem;
      pool.visible = pathGems > 0; pool.userData.set(pathGems);
      sayInside(t('vaultGem', { n: share }), 'great');
      sfx.vaultGem();
      busted = false;
    } else {
      trapSeen[card.k] = (trapSeen[card.k] || 0) + 1;
      const name = trapName(card.k);
      busted = trapSeen[card.k] >= 2;
      if (busted) {
        insiders.forEach(i => { players[i].carried = 0; players[i].bustFx = .7; burst.emit(TX[i], 1.4, players[i].z, 0xff3a3a, 26, 6); });
        sayInside(t('vaultBust', { t: name }), 'hit');
        sfx.boom(); buzz(80);
      } else { sayInside(t('vaultTrap', { t: name }), 'hit'); sfx.vaultTrap(); }
    }
  }

  function forceLeaveAll() {
    const rest = IDX.filter(i => players[i].inside);
    if (!rest.length) return;
    const share = Math.floor(pathGems / rest.length);
    rest.forEach(i => { const p = players[i]; p.banked += p.carried + share; p.carried = 0; p.inside = false; });
    pathGems -= share * rest.length;
    chips();
  }

  function prepBots() {
    const kinds = Object.keys(trapSeen).length;
    for (const p of players) {
      if (!p.inside || !p.local || !p.bot) continue;
      let leave = p.carried >= 8 + Math.random() * 8;
      if (!leave && kinds >= 2) leave = Math.random() < .5;
      if (!leave && kinds >= 3) leave = Math.random() < .8;
      p.pending = leave ? 1 : 0;
    }
  }

  function resolveTurn(row, insiders) {
    const leavers = insiders.filter(i => row[i] === 1);
    // reveal: everyone's choice pops at once — gold burst for leavers, cyan for delvers
    insiders.forEach(i => {
      const p = players[i], out = row[i] === 1;
      burst.emit(TX[i], 1.4, p.z, out ? GOLD : GEM_COL, 18, 4);
      p.bustFx = .35;
    });
    const share = leavers.length ? Math.floor(pathGems / leavers.length) : 0;
    leavers.forEach(i => {
      const p = players[i], gain = p.carried + share;
      p.banked += gain; p.carried = 0; p.inside = false;
      sfx.vaultBank();
      const v = paneOf(i); if (v) flash(v.msg, t('vaultBanked', { n: gain }), 'go');
    });
    if (leavers.length) pathGems -= share * leavers.length;
    pool.userData.set(pathGems); pool.visible = pathGems > 0;
    chips();
    waiting = false;
    if (!IDX.some(i => players[i].inside)) { endVault(); return; }
    nextCard();
  }

  function endVault() {
    ph = 'vend'; phaseT = VEND_SHOW;
    chips();
  }

  function startVault() {
    ci = -1; trapSeen = {}; pathGems = 0; pool.visible = false; pool.userData.set(0);
    players.forEach(p => { p.inside = true; p.carried = 0; p.pending = null; });
    clearTiles();
    const txt = t('vaultRound', { v: vi + 1, n: VAULTS });
    panes.forEach(v => { v.val.textContent = txt; flash(v.msg, txt, 'go'); });
    sfx.turn();
    nextCard();
  }

  function finish() {
    ph = 'done';
    const order = [...IDX].sort((a, b) => players[b].banked - players[a].banked || a - b);
    champ = order[0];
    // tight radius: the corridor is only ~9 wide, a wider orbit would clip through the walls
    sc.start({ order, draw: n > 1 && players[order[0]].banked === players[order[1]].banked, scores: players.map(p => t('vaultPts', { n: p.banked })) },
      () => players[champ].r.position, { r: 2, h: 1.3, look: .9 });
  }

  // timer bar + seconds; after a pick only a neutral ✓ shows (same colour either way, so split-screen neighbours can't read it)
  function updateBrace(v, p) {
    const bar = v.brace.firstChild, lab = v.brace.lastChild, locked = p.pending != null;
    v.brace.classList.add('on', 'vault');
    v.brace.classList.toggle('locked', locked);
    bar.style.transform = `scaleX(${waiting ? 0 : Math.max(0, winT / WINDOW)})`;
    lab.textContent = locked ? '✓' : waiting ? '' : Math.ceil(winT);
  }

  function act(pi, a) {
    const p = players[pi];
    if (!p?.local || p.bot || ph !== 'decide' || !p.inside || waiting) return;
    p.pending = a === 'A' ? 0 : 1;
    sfx.click();
    const v = paneOf(pi); // lock-in pop, replays on every change of mind
    if (v) { v.brace.classList.remove('pop'); void v.brace.offsetWidth; v.brace.classList.add('pop'); }
  }
  const unbind = bindInput({ cv: renderer.domElement, panes, n, online, me, act });

  function onNet(m) {
    if (m.t !== 'vc') return;
    const p = players[m.from];
    if (!p || p.local || !Number.isInteger(m.v) || m.v < 0 || m.v >= VAULTS) return;
    const deck = decks[m.v];
    if (!Number.isInteger(m.k) || m.k < 0 || m.k >= deck.length || (m.c !== 0 && m.c !== 1)) return;
    const row = res[m.v][m.k] ??= Array(n).fill(undefined);
    if (row[m.from] === undefined) row[m.from] = m.c;
  }

  function update(dt) {
    time += dt;
    if (ph === 'count') { if (!step(dt)) startVault(); }
    else if (ph === 'reveal') {
      if ((revealT -= dt) <= 0) {
        if (busted) { ph = 'bust'; phaseT = BUST_SHOW; }
        else { ph = 'decide'; winT = WINDOW; waiting = false; tickT = .25; players.forEach(p => { p.pending = null; }); prepBots(); }
      }
    } else if (ph === 'decide') {
      winT -= dt;
      if (!waiting && players.every(p => !p.inside || !p.local || p.bot)) winT = 0;
      if (winT < 1 && !waiting && (tickT -= dt) <= 0) { tickT = .25; sfx.tick(); }
      if (winT <= 0 && !waiting) {
        waiting = true;
        const row = res[vi][ci] ??= Array(n).fill(undefined);
        IDX.forEach(i => {
          const p = players[i];
          if (!p.inside || !p.local) return;
          row[i] = choice(p);
          if (online) send({ t: 'vc', from: i, v: vi, k: ci, c: row[i] });
        });
      }
      if (waiting) {
        const row = res[vi][ci], insiders = IDX.filter(i => players[i].inside);
        if (row && insiders.every(i => row[i] !== undefined)) resolveTurn(row, insiders);
      }
    } else if (ph === 'bust' && (phaseT -= dt) <= 0) endVault();
    else if (ph === 'vend' && (phaseT -= dt) <= 0) { vi++; if (vi >= VAULTS) finish(); else startVault(); }

    panes.forEach(v => { const p = players[v.pi]; if (ph === 'decide' && p.inside) updateBrace(v, p); else v.brace.classList.remove('on'); });

    for (const p of players) {
      const targetZ = p.inside ? -(GATE + Math.max(ci, 0) * STEP) + 2.2 : 0; // stop just short of the newest card so it stays in view
      p.z += (targetZ - p.z) * Math.min(1, dt * 2.4);
      const targetRotY = p.inside ? 0 : Math.PI, diff = Math.atan2(Math.sin(targetRotY - p.r.rotation.y), Math.cos(targetRotY - p.r.rotation.y));
      p.r.rotation.y += diff * Math.min(1, dt * 4);
      placeRunner(p.r, TX[p.i], 0, p.z, 0);
      animRunner(p.r, time * 3, Math.abs(targetZ - p.z) > .05 ? .5 : .06);
      if (p.bustFx > 0) { p.bustFx = Math.max(0, p.bustFx - dt); p.r.userData.mat.emissiveIntensity = .02 + p.bustFx * 2; }
    }
    for (const tl of tiles) if (tl.t < 1) { tl.t = Math.min(1, tl.t + dt / REVEAL); tl.grp.scale.setScalar(tl.t); }
    torches.forEach((s, i) => s.scale.setScalar(1.4 + Math.sin(time * 9 + i) * .15));
    burst.update(dt);
    sc.update(dt);
  }

  function resize() {
    layout(panes);
    for (const v of panes) { const p = players[v.pi]; p.cam.aspect = v.w / v.h; p.fov = fitFov(p.cam.aspect, 30, 50, 95); }
  }

  function render() {
    renderPanes(renderer, scene, panes, v => {
      const p = players[v.pi], c = p.cam, x = TX[v.pi];
      if (sc.on) { sc.cam(v, c, p.fov); sky.position.copy(c.position); return c; }
      c.position.set(x, 2.6, p.z + 5);
      c.lookAt(x * .3, 2.1, p.z - 14);
      if (v.flip) c.rotateZ(Math.PI);
      c.fov = p.fov; c.updateProjectionMatrix();
      sky.position.copy(c.position);
      return c;
    });
  }

  function botify(i, local) {
    const p = players[i];
    if (!p) return;
    p.bot = true;
    if (local) p.local = true;
    p.tag.userData.set(label(i));
    // ponytail: a seat can drop mid-decision; the device taking over sends whatever choice it already has
    // (none yet = leave) right away instead of replaying a snapshot — there's no host state to recover here.
    if (local && ph === 'decide' && p.inside) {
      const row = res[vi][ci] ??= Array(n).fill(undefined);
      if (row[i] === undefined) { row[i] = choice(p); if (online) send({ t: 'vc', from: i, v: vi, k: ci, c: row[i] }); }
    }
    chips();
  }

  function dispose() {
    unbind();
    panes.forEach(v => v.el.remove());
    document.body.classList.remove('split-v');
    clearTiles();
    Object.values(trapTexes).forEach(x => x.dispose());
    [pedGeo, rimGeo, gemGeo].forEach(g => g.dispose()); // shared tile parts, not in the scene once tiles are cleared
    disposeScene(scene);
  }

  resize();
  chips();
  bots.forEach(i => botify(i, me === 0));
  return { update, render, resize, onNet, dispose, botify };
}
