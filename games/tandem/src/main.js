import { Game } from './game.js';
import { View, COLORS } from './view.js';
import { LEVELS } from './levels.js';
import { readInput, bindTouch, capture } from './input.js';
import { audio } from './audio.js';
import { t, setLang, detectLang, getLang } from './i18n.js';

const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
const STEP = 1 / 120, SAVE_KEY = 'tandem-save';

let save;
try { save = JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch { save = {}; }
save = { unlocked: 1, gems: {}, best: {}, last: 0, volume: 0.7, music: 0.6, muted: false, musicMuted: false, lang: detectLang(), ...save };
// every cleared stage unlocks the next, even ones added after the save was written
for (const i in save.gems) save.unlocked = Math.max(save.unlocked, Math.min(+i + 2, LEVELS.length));
const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch { /* private mode */ } };

// phone link state (see "phone link" below): role null = one device, 'host' runs the sim, 'guest' mirrors it
let role = null, epoch = 0;
const out = [];  // host: events of this frame, encoded for the guest
const events = [];
const game = new Game((type, data) => {
  events.push([type, data]);
  if (role === 'host') { if (type === 'restart') epoch++; out.push([type, enc(type, data)]); }
});
const view = new View($('#c'));
game.load(Math.min(save.last, LEVELS.length - 1));
view.build(game);

// ---------- screens ----------
let screen = 'menu', stagesFrom = 'menu';
function show(name) {
  if (name === 'menu' && role) { Coop.close(); unlink(); } // back to the menu ends the link; the partner gets a notice
  else if (role === 'host') Coop.send({ scr: name });
  screen = name;
  for (const s of $$('.screen')) s.hidden = s.id !== `scr-${name}`;
  const playing = name === 'game';
  $('#hud').hidden = !playing;
  document.body.classList.toggle('playing', playing);
  capture.on = playing;
  wakeLock(playing);
  // Android back button / gesture: one history entry while off the main menu, so back pauses instead of closing the app
  if (name !== 'menu' && !history.state?.tandem) history.pushState({ tandem: 1 }, '');
  if (!playing) requestAnimationFrame(() => $(`#scr-${name} button:not([hidden]):not(:disabled)`)?.focus({ preventScroll: true }));
}

function startLevel(i) {
  game.load(i);
  view.build(game);
  save.last = i;
  persist();
  hud();
  if (role === 'host') sendGo(true);
  show('game');
  toast(t(LEVELS[i].hint), 5000);
}

// seconds -> "1:23.45" (rounded in centiseconds so 59.999 shows 1:00.00)
const fmtTime = s => {
  const cs = Math.round(s * 100), r = cs % 6000;
  return `${Math.floor(cs / 6000)}:${String(Math.floor(r / 100)).padStart(2, '0')}.${String(r % 100).padStart(2, '0')}`;
};

function hud() {
  $('#hud-level').textContent = `${game.index + 1}. ${t(LEVELS[game.index].name)}`;
  $('#hud-gems').textContent = `${game.gemsTaken}/${game.gems.length}`;
}

let toastTimer;
// kind 'tip' = stage hint (bulb, gold), 'wait' = exit reminder (flag, cyan)
function toast(msg, ms = 2500, kind = 'tip') {
  const el = $('#toast');
  el.dataset.kind = kind;
  el.querySelector('use').setAttribute('href', kind === 'wait' ? '#i-flag' : '#i-bulb');
  el.querySelector('.toast-title').textContent = kind === 'wait' ? '' : `${t('tip')} · ${game.index + 1}`;
  el.querySelector('.toast-title').hidden = kind === 'wait';
  el.querySelector('.toast-msg').textContent = msg;
  el.style.setProperty('--ms', `${ms}ms`);
  el.classList.remove('show');
  void el.offsetWidth; // restart the pop-in + timer bar
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

function stageGrid() {
  const grid = $('#stage-grid');
  const heading = key => {
    const h = document.createElement('h3');
    h.textContent = t(key);
    return h;
  };
  grid.replaceChildren(...LEVELS.flatMap((lv, i) => {
    const b = document.createElement('button');
    const locked = i >= save.unlocked;
    b.disabled = locked;
    b.innerHTML = `<b>${i + 1}</b><span></span><small></small>`;
    b.querySelector('span').textContent = t(lv.name);
    const total = lv.map.join('').split('*').length - 1;
    b.querySelector('small').innerHTML = locked
      ? `<svg><use href="#i-lock"/></svg>`
      : `<svg><use href="#i-gem"/></svg> ${save.gems[i] ?? 0}/${total}`
        + (save.best[i] ? ` · <svg><use href="#i-clock"/></svg> ${fmtTime(save.best[i])}` : '');
    if (save.best[i]) b.classList.add(save.gems[i] >= total ? 'perfect' : 'done');
    if (locked) b.setAttribute('aria-label', `${i + 1} ${t('locked')}`);
    b.onclick = () => startLevel(i);
    const tier = l => (l.expert ? 'expert' : l.advanced ? 'advanced' : 'basics');
    return i === 0 || tier(lv) !== tier(LEVELS[i - 1]) ? [heading(tier(lv)), b] : [b];
  }));
}

// no pausing in the clear window: onClear's timer would bail and the clear screen never appears
// linked guest asks the host, whose screen change comes back to both phones
const pause = () => {
  if (role === 'guest') { if (screen === 'game') Coop.send({ pz: 1 }); }
  else if (screen === 'game' && game.state !== 'clear') show('pause');
};
const resume = () => {
  if (role === 'guest') { if (screen === 'pause') Coop.send({ pz: 0 }); }
  else if (screen === 'pause') show('game');
};
const restart = () => {
  if (role === 'guest') return; // the host picks restarts and stages
  game.load(game.index); view.build(game); hud();
  if (role === 'host') sendGo(false);
  show('game');
};

function onClear() {
  const i = game.index;
  save.unlocked = Math.max(save.unlocked, Math.min(i + 2, LEVELS.length));
  save.gems[i] = Math.max(save.gems[i] ?? 0, game.gemsTaken);
  const time = game.time, record = !save.best[i] || time < save.best[i];
  if (record) save.best[i] = time;
  persist();
  // ArcadeDeck personal best: stages cleared
  window.parent?.postMessage({ type: 'GAME_OVER', score: Object.keys(save.gems).length }, '*');
  for (const p of game.players) view.burst(p.x, p.y + 0.5, COLORS.p[p.id], 40, 5, { up: 2 });
  setTimeout(() => {
    if (screen !== 'game' || game.state !== 'clear') return;
    const last = i === LEVELS.length - 1;
    $('#clear-gems').innerHTML = `<svg><use href="#i-gem"/></svg> ${game.gemsTaken}/${game.gems.length}`;
    $('#clear-time').textContent = `${t('time')} ${fmtTime(time)} · ${t('best')} ${fmtTime(save.best[i])}`;
    $('#new-record').hidden = !record;
    $('#all-clear').hidden = !last;
    $('#btn-next').hidden = last;
    show('clear');
  }, 1000);
}

function handleEvents() {
  for (const [type, data] of events) {
    audio.play(type, data);
    view.fx(type, data);
    if (type === 'gem') hud();
    else if (type === 'waiting') toast(t('waiting'), 2500, 'wait');
    else if (type === 'restart') { view.build(game); hud(); }
    else if (type === 'die') navigator.vibrate?.(120);
    else if (type === 'clear') onClear();
  }
  events.length = 0;
  if (out.length) Coop.send({ e: out.splice(0), k: epoch });
}

// ---------- settings: language, volume, fullscreen ----------
for (const box of $$('.settings')) box.append($('#settings').content.cloneNode(true));

function applyLang(l) {
  setLang(l);
  save.lang = getLang();
  persist();
  for (const b of $$('[data-lang]')) b.classList.toggle('sel', b.dataset.lang === save.lang);
  hud();
  stageGrid();
}

// Two sliders: SFX (speaker icon also mutes everything) and music (note icon mutes music only).
function syncVolume() {
  audio.setVolume(save.volume);
  audio.setMusic(save.music);
  audio.setMuted(save.muted);
  audio.setMusicMuted(save.musicMuted);
  for (const r of $$('.vol-row input')) {
    r.value = save[r.dataset.vol];
    r.style.setProperty('--v', `${r.value * 100}%`);
  }
  for (const u of $$('.btn-mute use')) u.setAttribute('href', save.muted || !save.volume ? '#i-mute' : '#i-vol');
  for (const u of $$('.btn-music use')) u.setAttribute('href', audio.musicMuted ? '#i-music-off' : '#i-music');
  for (const r of $$('.vol-row.sfx')) r.classList.toggle('off', save.muted);
  for (const r of $$('.vol-row.music')) r.classList.toggle('off', save.muted || audio.musicMuted);
}

document.addEventListener('input', e => {
  const k = e.target.dataset.vol;
  if (!k) return;
  save[k] = +e.target.value;
  if (save[k] > 0) save[k === 'music' ? 'musicMuted' : 'muted'] = false;
  syncVolume();
  persist();
});

// embedded on arcadedeck.net: host owns fullscreen (nested request hangs in Chrome)
const fullOk = document.fullscreenEnabled && window.self === window.top;
for (const b of $$('.btn-full')) b.hidden = !fullOk;

document.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b || b.closest('#touch')) return;
  if (b.dataset.lang) applyLang(b.dataset.lang);
  else if (b.classList.contains('btn-mute')) {
    save.muted = !save.muted && save.volume > 0;
    if (!save.muted && !save.volume) save.volume = 0.5;
    syncVolume();
    persist();
  } else if (b.classList.contains('btn-music')) {
    save.musicMuted = !audio.musicMuted;
    if (!save.musicMuted && !save.music) save.music = 0.5;
    syncVolume();
    persist();
  } else if (b.classList.contains('btn-full')) {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen({ navigationUI: 'hide' })
      .then(() => window.screen.orientation?.lock?.('landscape')).catch(() => {});
  } else if (b.classList.contains('btn-menu')) show('menu');
  else if (b.classList.contains('btn-back')) show(stagesFrom);
  audio.play('ui');
});

$('#btn-play').onclick = () => startLevel(Math.min(save.last, save.unlocked - 1));
$('#btn-stages').onclick = () => { stagesFrom = 'menu'; stageGrid(); show('stages'); };
$('#btn-stages2').onclick = () => { stagesFrom = 'pause'; stageGrid(); show('stages'); };
$('#btn-resume').onclick = resume;
$('#btn-pause').onclick = pause;
$('#btn-restart').onclick = restart;
$('#btn-restart2').onclick = restart;
$('#btn-next').onclick = () => startLevel(Math.min(game.index + 1, LEVELS.length - 1));

addEventListener('keydown', e => {
  if (e.code === 'Escape' || e.code === 'KeyP') screen === 'game' ? pause() : resume();
  else if (e.code === 'KeyR' && screen === 'game') restart();
});

// ---------- mobile / PWA ----------
bindTouch($('#touch'));
const markTouch = e => { if (e.pointerType === 'touch') document.body.classList.add('touch'); };
if (matchMedia('(pointer: coarse)').matches) document.body.classList.add('touch');
addEventListener('pointerdown', markTouch, { passive: true });
addEventListener('pointerdown', () => audio.unlock());
addEventListener('keydown', () => audio.unlock());
document.addEventListener('gesturestart', e => e.preventDefault()); // iOS pinch zoom

addEventListener('popstate', () => {
  if (screen === 'game') pause();
  else if (screen === 'stages') show(stagesFrom);
  else if (screen !== 'menu') show('menu'); // show() re-pushes the entry when needed
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { pause(); audio.suspend(); } else audio.unlock();
});

let lock = null;
async function wakeLock(on) {
  try {
    if (on && !lock && navigator.wakeLock) {
      lock = await navigator.wakeLock.request('screen');
      lock.addEventListener('release', () => { lock = null; });
    } else if (!on && lock) { await lock.release(); lock = null; }
  } catch { /* not allowed, fine */ }
}

let installEvt = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; $('#btn-install').hidden = false; });
$('#btn-install').onclick = async () => {
  installEvt?.prompt();
  await installEvt?.userChoice;
  installEvt = null;
  $('#btn-install').hidden = true;
};
addEventListener('appinstalled', () => { installEvt = null; $('#btn-install').hidden = true; });
const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const standalone = matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches || navigator.standalone;
$('#ios-install').hidden = !(ios && !standalone);
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js');

// ---------- phone link ----------
// Host-authoritative over coop.js (WebRTC, one guest). The host runs the 120 Hz sim with the guest's input;
// the guest runs no sim, it mirrors the host:
//   guest → host  reliable  { i: [x, jump] } on change only · { pz: 1 | 0 } pause / resume request
//                 ponytail: input rides the reliable, ordered channel, so no keepalive (coop.js heartbeats the link)
//   host → guest  reliable  { go: stage, k, h } stage (re)loaded · { e: [[type, data]], k } sim events (sfx / fx / hud)
//                           { scr } screen change
//                 fast      30 Hz snapshot, positions ×1000 as ints: { k, ts, t, st, p, d, b, f }
// k = load epoch, so snapshots or events from before a (re)load never land on the new stage.
// Clears are saved on both phones: the pair earned them together.
const remote = { x: 0, jump: false, jumpPressed: false }; // host: the guest's jelly
const snaps = [];                                          // guest: recent snapshots, oldest first
const INTERP = 100;                                        // guest renders this many ms behind the host
let clock = null, lastIn = '', lastSnap = 0;

const sendGo = hint => { epoch++; Coop.send({ go: game.index, k: epoch, h: hint ? 1 : 0 }); };

// event data → wire (players / cannons by index, so the guest resolves its own objects) and back
function enc(type, d) {
  if (type === 'jump' || type === 'die') return d.id;
  if (type === 'land') return [d.p.id, Math.round(d.v)];
  if (type === 'shoot') return game.cannons.indexOf(d);
  if (type === 'gem') return [d.x, d.y];
  if (type === 'plate') return [d.x, d.y, d.ch, d.on];
  if (type === 'clear') return Math.round(game.time * 1000);
  return 0;
}
function dec(type, d) {
  const P = game.players;
  if (type === 'jump') return P[d];
  if (type === 'die') { if (P[d]) { P[d].dead = true; game.state = 'dead'; } return P[d]; }
  if (type === 'land') return P[d[0]] && { p: P[d[0]], v: d[1] };
  if (type === 'shoot') return game.cannons[d];
  if (type === 'gem') {
    const g = game.gems.find(g => g.x === d[0] && g.y === d[1]);
    if (g && !g.taken) { g.taken = true; game.gemsTaken++; }
    return g;
  }
  if (type === 'plate') return { x: d[0], y: d[1], ch: d[2], on: d[3] };
  if (type === 'clear') { game.state = 'clear'; game.time = d / 1000; }
  if (type === 'restart') game.load(game.index);
  return {};
}

const q = v => Math.round(v * 1000);
const bits = (list, k) => list.map(o => (o[k] ? 1 : 0)).join('');
function snapshot(now) {
  if (now - lastSnap < 33) return;
  lastSnap = now;
  Coop.fast({
    k: epoch, ts: Math.round(now), t: q(game.time), st: game.state,
    p: game.players.flatMap(p => [q(p.x), q(p.y), q(p.vx), p.facing, (p.grounded ? 1 : 0) | (p.dead ? 2 : 0) | (p.inExit ? 4 : 0)]),
    d: game.drones.flatMap(d => [q(d.x), q(d.y), Math.sign(d.vx || d.vy)]),
    b: game.bolts.flatMap(b => [q(b.x), q(b.y)]),
    f: bits(game.dyn, 'solid') + bits(game.plates, 'on') + bits(game.gems, 'taken'),
  });
}

// guest: discrete state from the newest snapshot; positions are interpolated per frame in interp()
function onSnap(m) {
  if (m.k !== epoch || m.ts <= (snaps.at(-1)?.ts ?? -1)) return; // unordered channel: drop stale or out-of-order
  snaps.push(m);
  if (snaps.length > 8) snaps.shift();
  game.state = m.st;
  game.time = m.t / 1000;
  let j = 0;
  for (const d of game.dyn) d.solid = m.f[j++] === '1';
  for (const pl of game.plates) pl.on = m.f[j++] === '1';
  for (const g of game.gems) g.taken = m.f[j++] === '1';
  game.gemsTaken = game.gems.filter(g => g.taken).length;
  for (const ch in game.active) game.active[ch] = game.plates.some(pl => pl.ch === ch && pl.on);
  game.players.forEach((p, i) => {
    const fl = m.p[i * 5 + 4];
    p.facing = m.p[i * 5 + 3]; p.grounded = !!(fl & 1); p.dead = !!(fl & 2); p.inExit = !!(fl & 4);
  });
}
function interp(dtMs) {
  if (!snaps.length) return;
  const target = snaps.at(-1).ts - INTERP;
  // render clock follows the host's, INTERP behind: nudged toward it, jumps only after a long gap
  clock = clock == null || Math.abs(target - clock) > 300 ? target : clock + dtMs + (target - clock) * 0.05;
  let a = snaps[0], b = a;
  for (const s of snaps) { if (s.ts <= clock) a = b = s; else { b = s; break; } }
  const k = b.ts > a.ts ? Math.min(1, Math.max(0, (clock - a.ts) / (b.ts - a.ts))) : 0;
  const L = (u, v) => (u + (v - u) * k) / 1000;
  game.players.forEach((p, i) => {
    const o = i * 5;
    p.x = L(a.p[o], b.p[o]); p.y = L(a.p[o + 1], b.p[o + 1]); p.vx = L(a.p[o + 2], b.p[o + 2]);
  });
  game.drones.forEach((d, i) => {
    const o = i * 3;
    d.x = L(a.d[o], b.d[o]); d.y = L(a.d[o + 1], b.d[o + 1]); d.vx = a.d[o + 2]; d.vy = 0;
  });
  const same = a.b.length === b.b.length; // a bolt spawned or hit a wall in between: show the older set as is
  game.bolts = [];
  for (let i = 0; i < a.b.length; i += 2) {
    game.bolts.push(same ? { x: L(a.b[i], b.b[i]), y: L(a.b[i + 1], b.b[i + 1]) } : { x: a.b[i] / 1000, y: a.b[i + 1] / 1000 });
  }
}

function onNet(m) {
  if (role === 'host') {
    if (Array.isArray(m.i)) {
      const j = !!m.i[1];
      if (j && !remote.jump) remote.jumpPressed = true;
      remote.x = Math.sign(+m.i[0]) || 0;
      remote.jump = j;
    } else if (m.pz === 1) pause();
    else if (m.pz === 0) resume();
    return;
  }
  if (m.p) return onSnap(m);
  if (m.e) {
    for (const [type, d] of m.e) {
      const data = dec(type, d);
      if (type === 'restart') { epoch = m.k; snaps.length = 0; clock = null; }
      if (data) events.push([type, data]);
    }
    handleEvents();
  } else if (m.go != null && LEVELS[m.go]) {
    game.load(m.go);
    view.build(game);
    epoch = m.k; snaps.length = 0; clock = null;
    hud();
    show('game');
    if (m.h) toast(t(LEVELS[m.go].hint), 5000);
  } else if (m.scr && m.scr !== 'clear') show(m.scr === 'stages' ? 'pause' : m.scr); // clear: the guest's own onClear shows it
}

// guest: send only when the input changes
function sendInput(p) {
  const s = `${p.x},${p.jump ? 1 : 0}`;
  if (s === lastIn) return;
  lastIn = s;
  Coop.send({ i: [p.x, p.jump ? 1 : 0] });
}

// the single on-screen pad drives "my" jelly: label it for screen readers too
function padLabels() {
  for (const b of $$('.pad.p1 button')) b.dataset.i18nPrefix = role === 'guest' ? 'P2 ' : 'P1 ';
  setLang(save.lang);
}
function unlink() {
  role = null;
  out.length = 0; snaps.length = 0;
  Object.assign(remote, { x: 0, jump: false, jumpPressed: false });
  document.body.classList.remove('linked', 'net-host', 'net-guest');
  padLabels();
}

$('#btn-link').onclick = () => Coop.open({
  game: 'tandem', max: 1, lang: getLang,
  onStart(n, me) {
    role = me ? 'guest' : 'host';
    epoch = 0; lastIn = ''; clock = null;
    document.body.classList.add('linked', `net-${role}`);
    padLabels();
    if (role === 'host') startLevel(Math.min(save.last, save.unlocked - 1));
    else show('pause'); // "waiting for the host" until the first stage arrives
  },
  onMsg: onNet,
  onLeave() { unlink(); pause(); }, // coop.js shows "… disconnected" with Back to menu
  onMenu: () => show('menu'),
});

// ---------- main loop ----------
applyLang(save.lang);
syncVolume();
show('menu');

let last = performance.now(), acc = 0, time = 0, viewDt = 0, odd = false, shownTime = '';
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  time += dt;
  const inp = readInput();
  if (inp.start) screen === 'game' ? pause() : resume();
  if (role) { // phone link: every key, button and pad on this phone drives my own jelly; the other one is remote
    const [a, b] = inp;
    inp[0] = { x: a.x || b.x, jump: a.jump || b.jump, jumpPressed: a.jumpPressed || b.jumpPressed };
    inp[1] = remote;
  }
  if (screen === 'game' && role === 'guest') {
    sendInput(inp[0]);
    interp(dt * 1000);
  } else if (screen === 'game') {
    inp.forEach((p, i) => p.jumpPressed && game.jump(i));
    remote.jumpPressed = false;
    for (acc += dt; acc >= STEP; acc -= STEP) game.step(STEP, inp);
    handleEvents();
    if (role === 'host') snapshot(now);
  } else acc = 0;
  if (screen === 'game') {
    const s = fmtTime(game.time);
    if (s !== shownTime) $('#hud-time').textContent = shownTime = s;
  }
  // menus blur the live canvas (backdrop-filter): 30 fps behind them halves GPU cost and battery drain
  viewDt += dt;
  if (screen === 'menu' || screen === 'stages') { viewDt = 0; return; } // banner art covers the canvas: skip rendering
  if (screen !== 'game' && (odd = !odd)) return;
  view.measure = screen === 'game';
  view.update(game, viewDt, time);
  viewDt = 0;
}
requestAnimationFrame(frame);
// splash stays up until the first frame has been drawn
requestAnimationFrame(() => requestAnimationFrame(() => {
  const l = $('#loader');
  l.classList.add('done');
  l.addEventListener('transitionend', () => l.remove(), { once: true });
}));
