import * as THREE from 'three';
import { t, getLang, setLang, applyI18n } from './i18n.js';
import { sfx, unlock, getVolume, setVolume, isMuted, toggleMute, isMusicOn, toggleMusic } from './audio.js';
import * as net from './net.js';
import { mulberry32, hex, initEnv, Bloom, buzz, canBuzz, isHaptics, toggleHaptics } from './fx.js';
// game modules load on demand (the how-to card covers the fetch); the service worker keeps them all for offline play.
// key → display key (also the module's createX name and its i18n keys)
const GKEY = { dash: 'Dash', timing: 'Timing', draw: 'Draw', stack: 'Stack', sprint: 'Sprint', rope: 'Rope', echo: 'Echo', lanes: 'Lanes', tug: 'Tug', fuse: 'Fuse', sumo: 'Sumo', grid: 'Grid', curl: 'Curl', hex: 'Hex', boat: 'Boat', chicken: 'Chicken', vault: 'Vault', puck: 'Puck', chairs: 'Chairs', fish: 'Fish', kite: 'Kite', crowd: 'Crowd' };
const GAMES = Object.fromEntries(Object.entries(GKEY).map(([k, K]) => [k, () => import(`./${k}.js`).then(m => m['create' + K])]));
// games with a score that means something alone (time, distance, points, chain); the rest are last-one-standing / head-to-head
const SOLO = new Set(['dash', 'timing', 'draw', 'stack', 'sprint', 'rope', 'echo', 'lanes', 'grid', 'curl', 'boat', 'chicken', 'vault', 'fish']);
// hidden-identity games: on one shared screen everyone sees whose figure moves, so they only run online
const ONLINE_ONLY = new Set(['crowd']);
// "random" menu pick: any game but the one just played (solo: solo games only; same device: no online-only games)
const pickGame = (not, n, online = false) => { const ks = Object.keys(GAMES).filter(k => k !== not && (n > 1 || SOLO.has(k)) && (online || !ONLINE_ONLY.has(k))); return ks[Math.random() * ks.length | 0]; };

const $ = s => document.querySelector(s);
const coarse = matchMedia('(pointer: coarse)').matches;
const renderer = new THREE.WebGLRenderer({ canvas: $('#c'), antialias: devicePixelRatio < 2, powerPreference: 'high-performance' });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
initEnv(renderer);
const bloom = new Bloom(renderer);

// adaptive resolution: each second, an average under 40 fps (50 on touch) drops the pixel ratio a step (never raised mid-game).
// A drop that didn't speed frames up is undone and adapting stops for this game: the device is refresh-capped
// (iOS Low Power Mode runs at 30 fps) or CPU-bound, and a blurry bloomless picture wouldn't buy anything.
// The next game starts one step above where the last one ended: a phone that had to step down is still hot.
// Touch: 1.25× (not 1.5×) — about 30% fewer pixels shaded every frame, the biggest single cut in phone heat.
const PR = Math.min(devicePixelRatio, coarse ? 1.25 : 2);
// pixel budget: a 4K monitor or a 13" tablet would otherwise shade 3–8 M px a frame (plus bloom) on integrated / tablet GPUs
const BUDGET = coarse ? 2.2e6 : 5e6;
const prMax = () => Math.max(.75, Math.min(PR, Math.sqrt(BUDGET / (innerWidth * innerHeight))));
// phones: at most ~60 fps. 90/120 Hz screens would double GPU work, heat and battery drain for nothing.
const FRAME = coarse ? 1000 / 60 : 0, SLOW = coarse ? 20 : 25; // avg ms per frame that counts as slow
let pr = prMax(), win = 0, frames = 0, prevAvg = 0, locked = false, calm = false;
let game = null, opts = null, role = null, sel = 'random', nSel = 2, wakeLock = null;

function resize() {
  pr = Math.min(pr, prMax());
  renderer.setPixelRatio(pr);
  renderer.setSize(innerWidth, innerHeight, false);
  game?.resize();
}
addEventListener('resize', resize);
resize();

function setPr(p) {
  pr = p;
  bloom.on = pr > .75;
  document.body.classList.toggle('lofx', !bloom.on);
  resize();
}

function adapt(avg) {
  if (avg < SLOW) prevAvg = 0; // fast enough: keep what we have
  else if (prevAvg && avg > prevAvg * .9) { locked = true; setPr(pr + .25); } // last drop didn't help: undo it, stop
  else if (pr > .75) { prevAvg = avg; setPr(Math.max(.75, pr - .25)); }
}

// runs only while a game is live (startGame / clearGame): menus and the how-to card wake nothing per frame.
// Behind the results card the camera only drifts, so 30 fps is plenty there.
let last = 0, due = 0;
function loop(now) {
  if (now < due - 3) return; // 3 ms slack so a 60 Hz frame arriving a hair early isn't skipped
  const step = calm ? 1000 / 30 : FRAME;
  due = Math.max(due, now - step) + step;
  const ms = Math.max(0, now - last), dt = Math.min(.05, ms / 1000); // max: the first frame stamp can predate startGame's now()
  last = now;
  // clamped per frame: one shader-compile hitch at game start mustn't read as a slow second
  if (!locked && !calm) { win += Math.min(ms, 50); if (++frames >= 30 && win > 1000) { adapt(win / frames); win = frames = 0; } }
  game.update(dt);
  game.render();
  bloom.render();
}

const newSeed = () => Math.random() * 2 ** 32 >>> 0;
const label = i => {
  const s = opts?.mode === 'online' && i === opts.me ? t('you') : t('pn', { n: i + 1 });
  return opts?.bots?.includes(i) ? t('bot', { p: s }) : s;
};

// off the menu, one history entry of ours sits on top, so the system back (Android gesture / button, iOS edge swipe)
// pops it instead of leaving the site; back on the menu by any other route, it's popped quietly
let hist = false;
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === id));
  if (id !== 'menu' && !hist) { hist = true; history.pushState(null, ''); }
  else if (id === 'menu' && hist) { hist = false; history.back(); }
}

// how-to card before every match. Local: waits for Start. Online: everyone taps Ready, then the host says go
// (AI seats count as ready); messages that arrive meanwhile are queued for the game.
const KEYSETS = ['A W D', '← ↑ →', 'J I L', 'Num 4 8 6'];
let inbox = null;

function renderGuide(o) {
  const k = GKEY[o.game];
  $('#guide .eyebrow').textContent = t(o.random ? 'randomPick' : 'howTo');
  $('#gTitle').textContent = t('game' + k);
  $('#gRec').textContent = record && o.n > 1 ? `${t('recShort')}: ` + record.wins.map((w, i) => `${label(i)} ★${w}`).join(' · ') : '';
  $('#gRules').replaceChildren(...t('g' + k).split('\n').map(line => {
    const li = document.createElement('li');
    // "[red:text]" → coloured keyword; built as nodes, never innerHTML
    line.split(/(\[(?:gold|red|purple|green|cyan|orange):[^\]]+\])/).forEach(part => {
      const m = part.match(/^\[(\w+):(.+)\]$/);
      if (!m) return part && li.append(part);
      const b = document.createElement('b');
      b.className = 'k-' + m[1]; b.textContent = m[2];
      li.append(b);
    });
    return li;
  }));
  $('#gCtrl').replaceChildren(...t('c' + k).split('|').map((txt, i, all) => {
    const b = document.createElement('div');
    b.className = 'gk';
    b.innerHTML = `<small>${all.length > 1 ? ['◀', '▲', '▶', '▼'][i] : '●'}</small>`;
    b.append(txt);
    return b;
  }));
  $('#gKeys').textContent = coarse ? t(o.game === 'dash' ? 'gTouchDash' : o.game === 'timing' ? 'gTouchTiming' : 'gTouch')
    : o.game === 'timing' ? t('gKeysTiming')
    : `${t('keys')}: ` + (o.mode === 'online' || o.n === 1 ? 'A W D / ← ↑ →' : KEYSETS.slice(0, o.n).map((s, i) => `P${i + 1} ${s}`).join(' · '));
  const go = $('#gGo');
  go.disabled = false;
  go.textContent = t('start');
  renderReady(o);
}

// online how-to card: one chip per seat, and the Ready button turns into "waiting" once pressed
function renderReady(o) {
  const box = $('#gReady'), go = $('#gGo');
  box.hidden = !o.ready;
  if (!o.ready) return;
  box.replaceChildren(...[...Array(o.n).keys()].map(i => {
    const s = document.createElement('span'), ok = o.ready[i] || o.bots.includes(i);
    s.className = ok ? 'ok' : '';
    s.style.setProperty('--c', hex(i));
    s.textContent = `${label(i)} ${ok ? '✓' : '…'}`;
    return s;
  }));
  go.disabled = !!o.ready[o.me];
  go.textContent = t(o.ready[o.me] ? 'waitRival' : 'ready');
}

function markReady(i) {
  const o = opts;
  if (!o?.ready || o.starting || !Number.isInteger(i) || i < 0 || i >= o.n) return;
  o.ready[i] = true;
  if ($('#guide').classList.contains('on')) renderReady(o);
  hostGo();
}

// host: every human seat ready → go. Guests start on the 'go' message.
function hostGo() {
  const o = opts;
  if (role !== 'host' || !o?.ready || o.starting || ![...Array(o.n).keys()].every(i => o.ready[i] || o.bots.includes(i))) return;
  net.send({ t: 'go' });
  startGame(o);
}

function begin(o) {
  clearGame();
  opts = o;
  document.activeElement?.blur();
  inbox = [];
  o.starting = false; // a rematch spreads the last opts
  o.ready = o.mode === 'online' ? [] : null; // per seat
  renderGuide(o);
  show('guide');
  o.load = GAMES[o.game](); // fetch while the card is read
  o.load.catch(() => {}); // failure is handled when starting
}

async function startGame(o) {
  if (opts !== o || game || o.starting) return;
  o.starting = true;
  let create;
  try { create = await o.load; } catch { toast(t('gameLoadFail')); return toMenu(); }
  if (opts !== o) return; // left the card while loading
  game = create({ renderer, ...o, rand: mulberry32(o.seed), send: net.send, label, onEnd: results });
  (inbox ?? []).forEach(m => game.onNet(m));
  inbox = null;
  document.body.classList.add('playing');
  show(null);
  win = frames = prevAvg = 0; locked = calm = false;
  setPr(Math.min(prMax(), pr + .25));
  last = performance.now(); due = 0;
  renderer.setAnimationLoop(loop);
  navigator.wakeLock?.request('screen').then(l => { wakeLock = l; }, () => {});
}

function clearGame() {
  inbox = null;
  renderer.setAnimationLoop(null);
  game?.dispose();
  game = null;
  document.body.classList.remove('playing');
  wakeLock?.release().catch(() => {});
  wakeLock = null;
}

function toMenu() {
  clearGame();
  record = null; // the room (or couch session) is over
  const r = role;
  role = null;
  if (r) net.close();
  shuffleLineup(sel);
  show('menu');
}

// ---- room record: wins + placement points per seat, kept across rematches until the room ends (back to menu).
// Online the host is the authority: it tallies and broadcasts; guests show the host's copy.
let record = null;

function tally({ order, draw, places }) { // places: tied / team seats share points, every place-0 seat gets the win
  const n = opts.n;
  if (!record || record.n !== n) record = { n, matches: 0, wins: Array(n).fill(0), pts: Array(n).fill(0), last: Array(n).fill(0) };
  record.matches++;
  record.last = Array(n).fill(0);
  order.forEach((i, place) => { const p = n - 1 - (places?.[i] ?? place); record.pts[i] += p; record.last[i] = p; });
  if (!draw) order.forEach(i => { if ((places?.[i] ?? (i === order[0] ? 0 : 1)) === 0) record.wins[i]++; });
}

// guest side: accept the host's record only if it is well-formed for this room
function takeRecord(r) {
  const n = opts?.n, ok = a => Array.isArray(a) && a.length === n && a.every(v => Number.isInteger(v) && v >= 0 && v < 1e4);
  if (!r || !ok(r.wins) || !ok(r.pts) || !ok(r.last) || !Number.isInteger(r.matches)) return;
  record = { n, matches: r.matches, wins: r.wins, pts: r.pts, last: r.last };
  if ($('#results').classList.contains('on')) renderRecord();
}

function renderRecord() {
  const box = $('#resRecord');
  box.hidden = !record;
  if (!record) return;
  const idx = [...Array(record.n).keys()].sort((a, b) => record.wins[b] - record.wins[a] || record.pts[b] - record.pts[a]);
  const [a, b] = idx, gap = record.wins[a] - record.wins[b];
  $('#recHead').textContent = t(opts.mode === 'online' ? 'roomRecord' : 'sessionRecord', { n: record.matches });
  $('#recLead').textContent = record.matches < 2 ? '' : gap ? t('leads', { p: label(a), n: gap }) : t('tiedTop');
  $('#recRows').replaceChildren(...idx.map((i, k) => {
    const row = document.createElement('div'), name = document.createElement('b'), w = document.createElement('span'), pt = document.createElement('span');
    row.className = 'rr' + (k === 0 && record.wins[i] > 0 ? ' lead' : '');
    row.style.setProperty('--c', hex(i));
    name.textContent = label(i);
    w.className = 'rw'; w.textContent = `★ ${record.wins[i]}`;
    pt.className = 'rp'; pt.textContent = t('pts', { n: record.pts[i] }) + (record.last[i] ? ` (+${record.last[i]})` : '');
    row.append(name, w, pt);
    return row;
  }));
}

// ---- codex: every game ever finished on this device + best winning score per player count (localStorage)
// { [game]: { [n]: { p: plays, s: score text, v: rank (higher = better) } } }
const CX_KEY = 'sprintclash-codex'; // namespaced: the arcade host serves many games from one origin
const cxLoad = () => { try { return JSON.parse(localStorage.getItem(CX_KEY)) || {}; } catch { return {}; } };
// scores arrive as localized text; times ("12.3s") rank lower-is-better and beat distances, anything else ranks by its first number.
// ponytail: text parsing, give games a numeric best in onEnd if a score format ever breaks this
function cxRank(text) {
  const s = String(text);
  for (const key of ['time', 'ms']) { // lower is better
    const [a, b] = t(key, { n: '#' }).split('#'), num = s.slice(a.length, s.length - b.length);
    if (s.startsWith(a) && s.endsWith(b) && num && !isNaN(num)) return 1e6 - num;
  }
  return parseFloat(s.match(/-?\d+(\.\d+)?/)?.[0]) || 0;
}
// returns the previous best text ('' = first play) and whether this one beat it
function cxRecord(game, n, text) {
  const cx = cxLoad(), g = cx[game] ??= {}, e = g[n] ??= { p: 0 }, v = cxRank(text), prev = e.s ?? '', best = e.v == null || v > e.v;
  e.p++;
  if (best) Object.assign(e, { s: text, v });
  try { localStorage.setItem(CX_KEY, JSON.stringify(cx)); } catch {}
  return { prev, best };
}
function renderCodex() {
  const cx = cxLoad(), keys = Object.keys(GAMES).sort((a, b) => !cx[a] - !cx[b]); // played first
  $('#cxSum').textContent = t('codexSum', { n: keys.filter(k => cx[k]).length, m: keys.length });
  $('#cxList').replaceChildren(...keys.map(k => {
    const row = document.createElement('div'), name = document.createElement('b'), rec = cx[k];
    row.className = 'cx' + (rec ? '' : ' locked');
    name.append($(`.game[data-game="${k}"] svg`).cloneNode(true), rec ? t('game' + GKEY[k]) : t('codexLocked'));
    row.append(name);
    for (const n of [1, 2, 3, 4]) {
      const c = document.createElement('span'), e = rec?.[n];
      c.dataset.n = n + 'P';
      if (n === 1 && !SOLO.has(k)) c.className = 'na'; // no solo mode: struck through
      c.textContent = e ? e.s : '—';
      if (e) { const x = document.createElement('small'); x.textContent = `×${e.p}`; c.append(x); }
      row.append(c);
    }
    return row;
  }));
}

// order: player indices best → worst. places (optional, per player, 0-based) lets teams / ties share a place;
// title (optional) overrides the headline, e.g. a team win.
function results({ order, draw, scores, places, title }) {
  if (opts.mode !== 'online' || role === 'host') {
    tally({ order, draw, places });
    if (role === 'host') net.send({ t: 'rec', ...record });
  }
  const cx = cxRecord(opts.game, opts.n, scores[order[0]]), solo = opts.n === 1;
  // arcade host: score = games finished in the Codex (0–22); matches are hot-seat, so no per-match score is posted
  if (parent !== window) parent.postMessage({ type: 'GAME_OVER', score: Object.keys(cxLoad()).length }, '*');
  renderRecord();
  if (solo) $('#resRecord').hidden = true; // no rivals: the personal best is the record
  const online = opts.mode === 'online', winner = draw ? -1 : order[0];
  $('#resTitle').textContent = solo ? t(cx.best && cx.prev ? 'newBest' : 'yourScore') : title ?? (draw ? t('draw') : online && winner === opts.me ? t('youWin') : t('wins', { p: label(winner) }));
  $('#resLines').replaceChildren(...order.map((i, place) => {
    const row = document.createElement('div'), b = document.createElement('b'), v = document.createElement('span');
    row.className = 'rl' + (i === winner || (places && !draw && places[i] === 0) ? ' win' : '');
    row.style.setProperty('--c', hex(i));
    b.textContent = `${(places?.[i] ?? place) + 1}. ${label(i)}`; v.textContent = scores[i];
    row.append(b, v);
    return row;
  }));
  if (solo && cx.prev) {
    const row = document.createElement('div'), b = document.createElement('b'), v = document.createElement('span');
    row.className = 'rl best';
    b.textContent = t('prevBest'); v.textContent = cx.prev;
    row.append(b, v);
    $('#resLines').append(row);
  }
  $('#resWait').textContent = '';
  $('#btnRematch').hidden = !!opts.orphan; // host gone: no one left to rematch with
  $('#btnPick').hidden = role !== 'host';
  !solo && online && winner !== opts.me && winner >= 0 ? sfx.lose() : sfx.win();
  calm = true;
  show('results');
}

let toastT;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('on'), 3200);
}

// ---- online
// rematch keeps the same seats; seats whose player left stay AI
function hostStart(gameName, n = net.guestCount() + 1, bots = []) {
  if (n < 2) return;
  const random = gameName === 'random';
  const o = { game: random ? pickGame(opts?.game, n, true) : gameName, random, seed: newSeed(), n, bots: [...bots] };
  net.lock();
  for (let i = 0; i < n - 1; i++) net.sendTo(i, { t: 'start', ...o, me: i + 1 });
  begin({ mode: 'online', me: 0, ...o });
}

function netFail(type) {
  const msg = t(type === 'load' ? 'netLoadFail' : 'connFail');
  net.close();
  role = null;
  if ($('#join').classList.contains('on')) $('#joinMsg').textContent = msg;
  else { toast(msg); toMenu(); }
}

net.on('msg', m => {
  if (m.t === 'start' && role === 'guest') {
    const n = m.n | 0, me = m.me | 0;
    const bots = Array.isArray(m.bots) ? m.bots.filter(b => Number.isInteger(b) && b > 0 && b < n && b !== me) : [];
    if (Object.hasOwn(GAMES, m.game) && n >= 2 && n <= 4 && me >= 1 && me < n) begin({ mode: 'online', n, me, bots, game: m.game, random: !!m.random, seed: m.seed >>> 0 });
  }
  else if (m.t === 'rec' && role === 'guest' && m.from == null) takeRecord(m); // host-only: relayed guest messages carry `from`
  else if (m.t === 'ready') markReady(m.from ?? 0); // no `from` = the host
  else if (m.t === 'go' && role === 'guest' && m.from == null && opts?.ready) startGame(opts);
  else if (m.t === 'pick' && role === 'guest' && m.from == null) $('#resWait').textContent = t('hostPicking');
  else if (m.t === 'rematch' && role === 'host' && opts && $('#results').classList.contains('on')) hostStart(opts.random ? 'random' : opts.game, opts.n, opts.bots);
  else if (m.t === 'bot' && role === 'guest' && opts) { // host reports a dropped player; host drives them now
    const i = m.i | 0;
    if (i > 0 && i < opts.n && i !== opts.me && !opts.bots.includes(i)) { opts.bots.push(i); game?.botify(i, false); toast(t('aiJoined', { p: t('pn', { n: i + 1 }) })); }
    if ($('#guide').classList.contains('on')) renderReady(opts);
  }
  else if (game) game.onNet(m);
  else inbox?.push(m);
});
// host side: a guest dropped mid-session -> this device takes over their seat
net.on('drop', i => {
  if (!opts || opts.bots.includes(i)) return;
  opts.bots.push(i);
  game?.botify(i, true);
  net.send({ t: 'bot', from: 0, i });
  toast(t('aiJoined', { p: t('pn', { n: i + 1 }) }));
  if ($('#guide').classList.contains('on')) renderReady(opts);
  if ($('#lobby').classList.contains('on')) lobbyCount();
  hostGo(); // the one we were waiting on may have left
});
// guest side: lost the host. Mid-game, AI takes every other seat and the match finishes offline.
net.on('close', () => {
  if (!role) return;
  if (role === 'guest' && game && !$('#results').classList.contains('on')) {
    role = null; net.close(); opts.orphan = true;
    for (let i = 0; i < opts.n; i++) if (i !== opts.me) { if (!opts.bots.includes(i)) opts.bots.push(i); game.botify(i, true); }
    toast(t('hostLeft'));
  } else { toast(t('disconnected')); toMenu(); }
});

// ---- menu
// double click/tap a card = quick start on Same Device (timed by hand: iOS doesn't fire dblclick on taps; e.detail 0 = keyboard)
let lastTap = { b: null, at: 0 };
document.querySelectorAll('[data-game]').forEach(b => b.addEventListener('click', e => {
  const now = performance.now(), dbl = e.detail > 0 && lastTap.b === b && now - lastTap.at < 400;
  lastTap = dbl ? { b: null, at: 0 } : { b, at: now };
  if (dbl && !role) return $('#btnLocal').click(); // menu is never mid host/join (toMenu clears role), so Same Device
  sel = b.dataset.game;
  sfx.click();
  document.querySelectorAll('[data-game]').forEach(x => { x.classList.toggle('sel', x === b); x.setAttribute('aria-pressed', String(x === b)); });
  b.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  // one info strip for the picked game (keys stay on the element, so a language switch re-renders it)
  const [name, desc] = $('#gameInfo').children;
  name.dataset.i18n = b.querySelector('b').dataset.i18n; name.textContent = t(name.dataset.i18n);
  desc.dataset.i18n = b.querySelector('small').dataset.i18n; desc.textContent = t(desc.dataset.i18n);
}));
// icon-only mode buttons: touch long-press shows the label instead of starting (mouse gets it on hover)
document.querySelectorAll('.mode-ic').forEach(b => {
  let timer = 0, held = false;
  b.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') return;
    held = false;
    timer = setTimeout(() => { held = true; b.classList.add('tip-on'); buzz(15); }, 420);
  });
  const end = () => { clearTimeout(timer); if (held) setTimeout(() => b.classList.remove('tip-on'), 1400); };
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => b.addEventListener(ev, end));
  b.addEventListener('click', e => { if (held) { held = false; e.stopImmediatePropagation(); } }, true); // capture: runs before onclick
  b.addEventListener('contextmenu', e => e.preventDefault());
});
document.querySelectorAll('[data-n]').forEach(b => b.addEventListener('click', () => {
  const was = nSel === 1;
  nSel = +b.dataset.n;
  sfx.click();
  document.querySelectorAll('[data-n]').forEach(x => { x.classList.toggle('sel', x === b); x.setAttribute('aria-checked', String(x === b)); });
  if (was !== (nSel === 1)) shuffleLineup(sel); // solo lineup holds solo games only
}));
$('#btnLocal').onclick = () => { sfx.click(); if (ONLINE_ONLY.has(sel)) return toast(t('onlineOnly')); begin({ mode: 'local', n: nSel, bots: [], game: sel === 'random' ? pickGame(null, nSel) : sel, random: sel === 'random', seed: newSeed() }); };
// ---- host lobby: room code, head count, and a picker with every game (the menu lineup shows only 8).
// Reopened from the results screen ("Change game") with the room kept: the code is hidden (room locked) and seats carry over.
let roomMax = 0;
const lobbyCount = () => { const c = net.guestCount(); $('#lobbyMsg').textContent = t('joined', { n: c + 1, max: roomMax }); $('#btnStart').disabled = c < 1; };
function renderPick() {
  const card = k => $(`.game[data-game="${k}"]`), name = k => card(k).querySelector('b').textContent;
  $('#pick').replaceChildren(...['random', ...Object.keys(GAMES).sort((a, b) => name(a).localeCompare(name(b)))].map(k => {
    const b = document.createElement('button');
    b.className = 'pk'; b.dataset.k = k;
    b.append(card(k).querySelector('svg').cloneNode(true), name(k));
    b.onclick = () => { card(k).click(); syncPick(); }; // the menu card's handler sets `sel`, so the menu stays in step
    return b;
  }));
  syncPick();
  const pick = $('#pick'), s = pick.querySelector('.sel'); // scroll the list only: scrollIntoView would also scroll the screen on landscape phones
  if (s) pick.scrollTop = s.offsetTop - pick.offsetTop - (pick.clientHeight - s.offsetHeight) / 2;
}
function syncPick() {
  $('#pick').querySelectorAll('.pk').forEach(b => { b.classList.toggle('sel', b.dataset.k === sel); b.setAttribute('aria-pressed', String(b.dataset.k === sel)); });
  const [name, desc] = $('#pickInfo').children, card = $(`.game[data-game="${sel}"]`);
  name.textContent = card.querySelector('b').textContent; desc.textContent = card.querySelector('small').textContent;
}
function openLobby(max) {
  roomMax = max;
  $('#code').hidden = $('#share').hidden = !!record; // record = this room already played a match
  show('lobby');
  renderPick();
  lobbyCount();
}
$('#btnHost').onclick = () => {
  sfx.click();
  role = 'host';
  $('#code').textContent = '····';
  openLobby(nSel);
  $('#lobbyMsg').textContent = t('connecting');
  net.host(code => { $('#code').textContent = code; lobbyCount(); }, () => { lobbyCount(); sfx.turn(); }, netFail, nSel - 1);
};
$('#btnStart').onclick = () => { sfx.click(); record ? hostStart(sel, opts.n, opts.bots) : hostStart(sel); };
$('#btnPick').onclick = () => { sfx.click(); clearGame(); net.send({ t: 'pick' }); openLobby(opts.n); };
$('#btnJoin').onclick = () => { sfx.click(); $('#joinMsg').textContent = ''; show('join'); if (!coarse) $('#codeIn').focus(); };
$('#btnCodex').onclick = () => { sfx.click(); renderCodex(); show('codex'); };
// inputmode="email" opens a Latin keyboard on most KO / JA phones; the 4th character joins straight away
$('#codeIn').oninput = e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); if (e.target.value.length === 4) $('#joinGo').click(); };
$('#codeIn').onkeydown = e => { if (e.key === 'Enter') $('#joinGo').click(); };
$('#joinGo').onclick = () => {
  const code = $('#codeIn').value;
  if (code.length !== 4 || role === 'guest') return; // already joining (auto-join + Enter): one attempt at a time; a failure clears role
  sfx.click();
  role = 'guest';
  $('#joinMsg').textContent = t('connecting');
  net.join(code, () => { $('#joinMsg').textContent = t('waitHost'); }, netFail);
};
document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => { sfx.click(); toMenu(); }));
$('#btnMenu').onclick = () => { sfx.click(); toMenu(); };
$('#btnRematch').onclick = () => {
  sfx.click();
  if (opts.mode !== 'online') begin({ ...opts, game: opts.random ? pickGame(opts.game, opts.n) : opts.game, seed: newSeed() });
  else if (role === 'host') hostStart(opts.random ? 'random' : opts.game, opts.n, opts.bots);
  else { net.send({ t: 'rematch' }); $('#resWait').textContent = t('waitHost'); }
};
// leaving a live match takes a 2nd press within 2.5 s (back always, ✕ on touch), so a stray edge swipe or corner tap can't end it
let exitArm = -1e4;
function leave(confirm) {
  const live = game && !$('#results').classList.contains('on');
  if (confirm && live && performance.now() - exitArm > 2500) { exitArm = performance.now(); toast(t('exitAgain')); return false; }
  toMenu();
  return true;
}
$('#btnExit').onclick = () => { sfx.click(); leave(coarse); };
addEventListener('popstate', () => {
  if (!hist) return; // our own quiet pop from show('menu')
  hist = false;
  if (!leave(true)) { hist = true; history.pushState(null, ''); }
});

// ---- top bar
const langSel = $('#lang'), volEl = $('#vol'), sndBtn = $('#btnSnd'), musBtn = $('#btnMus'), vibBtn = $('#btnVib');
langSel.value = getLang();
langSel.onchange = () => {
  setLang(langSel.value); sfx.click();
  if ($('#guide').classList.contains('on')) renderGuide(opts);
  if ($('#codex').classList.contains('on')) renderCodex();
  if ($('#lobby').classList.contains('on')) { renderPick(); if ($('#code').textContent !== '····') lobbyCount(); }
};
$('#gGo').onclick = () => {
  sfx.click();
  if (!opts.ready) return startGame(opts);
  net.send({ t: 'ready' });
  markReady(opts.me);
};
addEventListener('keydown', e => {
  if ((e.code === 'Enter' || e.code === 'Space') && !e.repeat && $('#guide').classList.contains('on') && !$('#gGo').disabled) { e.preventDefault(); $('#gGo').click(); }
});
function syncAudioUI() {
  const v = getVolume();
  volEl.value = Math.round(v * 100);
  volEl.style.setProperty('--p', volEl.value + '%');
  sndBtn.dataset.level = isMuted() || v === 0 ? 0 : v < .5 ? 1 : 2;
  sndBtn.setAttribute('aria-pressed', String(!isMuted()));
  musBtn.classList.toggle('off', !isMusicOn());
  musBtn.setAttribute('aria-pressed', String(isMusicOn()));
  vibBtn.classList.toggle('off', !isHaptics());
  vibBtn.setAttribute('aria-pressed', String(isHaptics()));
}
volEl.oninput = () => { unlock(); setVolume(volEl.value / 100); syncAudioUI(); };
volEl.onchange = () => sfx.click();
sndBtn.onclick = () => { unlock(); toggleMute(); syncAudioUI(); sfx.click(); };
musBtn.onclick = () => { unlock(); toggleMusic(); syncAudioUI(); sfx.click(); };
vibBtn.hidden = !canBuzz; // touch devices that can buzz only
vibBtn.onclick = () => { toggleHaptics(); syncAudioUI(); sfx.click(); };
const fs = $('#btnFs');
// embedded: the host page owns fullscreen (a nested request hangs in Chrome)
if (!document.documentElement.requestFullscreen || matchMedia('(display-mode: standalone)').matches || parent !== window) fs.hidden = true;
fs.onclick = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen({ navigationUI: 'hide' })).catch(() => {});

// ---- mobile hygiene
addEventListener('pointerdown', unlock, { passive: true });
addEventListener('pointerup', unlock, { passive: true }); // a touch only counts as a user gesture on release, so the 1st tap's pointerdown can't start audio
addEventListener('keydown', unlock);
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault());
$('#c').addEventListener('contextmenu', e => e.preventDefault());
// held taps on the play area (Deep Cast, Kite Fight, Stone Slide, long notes…): iOS would raise the magnifier loupe,
// text selection + haptic, or the callout. Cancelling touchstart stops those; pointer events (all game input) still fire.
$('#c').addEventListener('touchstart', e => e.preventDefault(), { passive: false });
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && game && !wakeLock) navigator.wakeLock?.request('screen').then(l => { wakeLock = l; }, () => {});
  else if (document.hidden) wakeLock = null; // browser releases it on hide
});
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});

// ---- lineup: 8 random games around Random in a 3×3 grid, reshuffled after every game. Random still draws from every game.
// keep: the picked game stays in the new lineup so the selection never vanishes under the player.
function shuffleLineup(keep) {
  const box = $('.games'), cards = [...box.querySelectorAll('[data-game]')], rnd = cards.find(c => c.dataset.game === 'random');
  const solo = nSel === 1, ok = c => !solo || SOLO.has(c.dataset.game);
  document.body.classList.toggle('solo', solo);
  $('#btnHost').disabled = solo; // online needs 2+
  const cap = $('.lineup'); cap.dataset.i18n = solo ? 'lineupSolo' : 'lineup'; cap.textContent = t(cap.dataset.i18n);
  if (!ok(cards.find(c => c.dataset.game === keep) ?? rnd)) keep = null;
  const pool = cards.filter(c => c !== rnd);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [pool[i], pool[j]] = [pool[j], pool[i]]; }
  pool.sort((a, b) => ok(b) - ok(a)); // stable: shuffled solo games first
  const k = pool.findIndex(c => c.dataset.game === keep);
  if (k >= 8) [pool[0], pool[k]] = [pool[k], pool[0]];
  const shown = pool.slice(0, 8);
  pool.forEach((c, i) => { c.hidden = i >= 8; });
  box.replaceChildren(...shown.slice(0, 4), rnd, ...shown.slice(4), ...pool.slice(8));
  if (sel !== 'random' && !shown.some(c => c.dataset.game === sel)) rnd.click(); // picked game left the lineup: fall back to Random in the centre
}
shuffleLineup();
applyI18n();
syncAudioUI();
