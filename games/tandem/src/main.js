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

const events = [];
const game = new Game((type, data) => events.push([type, data]));
const view = new View($('#c'));
game.load(Math.min(save.last, LEVELS.length - 1));
view.build(game);

// ---------- screens ----------
let screen = 'menu', stagesFrom = 'menu';
function show(name) {
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
const pause = () => { if (screen === 'game' && game.state !== 'clear') show('pause'); };
const resume = () => { if (screen === 'pause') show('game'); };
const restart = () => { game.load(game.index); view.build(game); hud(); show('game'); };

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
  if (screen === 'game') {
    inp.forEach((p, i) => p.jumpPressed && game.jump(i));
    for (acc += dt; acc >= STEP; acc -= STEP) game.step(STEP, inp);
    handleEvents();
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
