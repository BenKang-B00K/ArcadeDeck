// Procedural audio: click SFX + ambient BGM. Wraps Howler with HTMLAudio fallback.

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

function makeClickWavUrl(freq = 1000, duration = 0.06) {
  const sr = 44100;
  const len = Math.floor(sr * duration);
  const buffer = new ArrayBuffer(44 + len * 2);
  const view = new DataView(buffer);
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + len * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, len * 2, true);
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const env = Math.exp(-8 * t);
    const sample = Math.max(-1, Math.min(1, Math.sin(2 * Math.PI * freq * t) * env));
    view.setInt16(44 + i * 2, sample * 0x7fff, true);
  }
  return URL.createObjectURL(new Blob([view], { type: 'audio/wav' }));
}

function makeBgmWavUrl() {
  // Modulator periods picked so all complete integer cycles in `duration` → seamless loop.
  const sr = 44100;
  const lfoHz = 0.0625;        // 1 cycle / 16s
  const pulseHz = 1.5;         // 24 cycles / 16s
  const duration = 1 / lfoHz;  // 16s
  const len = Math.floor(sr * duration);
  const ch = 2;
  const buffer = new ArrayBuffer(44 + len * 2 * ch);
  const view = new DataView(buffer);
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + len * 2 * ch, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, ch, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * ch * 2, true);
  view.setUint16(32, ch * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, len * 2 * ch, true);
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const a1 = 0.35 * Math.sin(2 * Math.PI * 55 * t);
    const a2 = 0.22 * Math.sin(2 * Math.PI * 110 * t);
    const a3 = 0.12 * Math.sin(2 * Math.PI * 220 * t);
    const lfo = 0.6 + 0.4 * Math.sin(2 * Math.PI * lfoHz * t);
    const pulse = 0.08 * (0.5 + 0.5 * Math.sin(2 * Math.PI * pulseHz * t));
    const left  = (a1 + a2 + a3) * lfo + pulse;
    const right = (a1 + a2 + a3) * (lfo * 0.96) + pulse * 0.9;
    view.setInt16(44 + (i * 4),     Math.max(-1, Math.min(1, left  * 0.7)) * 0x7fff, true);
    view.setInt16(44 + (i * 4) + 2, Math.max(-1, Math.min(1, right * 0.7)) * 0x7fff, true);
  }
  return URL.createObjectURL(new Blob([view], { type: 'audio/wav' }));
}

let hitSound = null;
let bgm = null;
let bgmId = null;
let bgmReady = false;
let pendingBgmStart = false;
let hitFallbackMuted = false;
let bgmFallbackMuted = false;
let mutedState = false;

// Hardcap revoke any object URL that never received a load/error event.
function scheduleRevoke(url, timeoutMs = 30000) {
  setTimeout(() => URL.revokeObjectURL(url), timeoutMs);
}

function initHitSound() {
  try {
    const url = makeClickWavUrl(1000, 0.06);
    let revoked = false;
    const revokeOnce = () => { if (!revoked) { revoked = true; URL.revokeObjectURL(url); } };
    if (typeof Howl !== 'undefined') {
      hitSound = new Howl({
        src: [url], format: ['wav'], volume: 0.9, preload: true,
        onload: revokeOnce,
        onloaderror: (id, err) => { console.warn('hit Howl load error', err); revokeOnce(); },
      });
    } else {
      const audio = new Audio();
      audio.src = url;
      audio.preload = 'auto';
      audio.addEventListener('canplaythrough', revokeOnce, { once: true });
      audio.addEventListener('error', revokeOnce, { once: true });
      hitSound = {
        play: () => { if (hitFallbackMuted) return; audio.currentTime = 0; audio.play().catch((e) => console.warn('hit play failed', e)); },
        mute: (m) => { hitFallbackMuted = !!m; }
      };
    }
    scheduleRevoke(url);
  } catch (e) {
    console.warn('Hit sound init failed', e);
    hitSound = null;
  }
}

function initBgmSound() {
  try {
    const url = makeBgmWavUrl();
    let revoked = false;
    const revokeOnce = () => { if (!revoked) { revoked = true; URL.revokeObjectURL(url); } };
    const onReady = () => {
      bgmReady = true;
      revokeOnce();
      if (pendingBgmStart) { pendingBgmStart = false; startBgm(); }
    };
    if (typeof Howl !== 'undefined') {
      bgm = new Howl({
        src: [url], format: ['wav'], loop: true, volume: 0.12, html5: false, preload: true,
        onload: onReady,
        onloaderror: (id, err) => { console.warn('bgm Howl load error', err); revokeOnce(); },
      });
    } else {
      const audio = new Audio();
      audio.src = url;
      audio.loop = true;
      audio.volume = 0.12;
      audio.addEventListener('canplaythrough', onReady, { once: true });
      audio.addEventListener('error', () => { console.warn('bgm audio load error'); revokeOnce(); }, { once: true });
      bgm = {
        play: () => { if (bgmFallbackMuted) return null; audio.play().catch((e) => console.warn('bgm play failed', e)); return null; },
        stop: () => { audio.pause(); audio.currentTime = 0; },
        mute: (m) => { bgmFallbackMuted = !!m; if (m) audio.pause(); }
      };
    }
    scheduleRevoke(url);
  } catch (e) {
    console.warn('BGM init failed', e);
    bgm = null;
  }
}

export function initAudio() {
  // Click SFX is small & needed on first click — generate immediately.
  initHitSound();
  // BGM is ~16s × 44.1kHz stereo (≈2.8MB) and only needed after the player taps Start.
  // Defer generation so it doesn't block the main thread during page load.
  const deferBgm = () => initBgmSound();
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(deferBgm, { timeout: 2000 });
  } else {
    setTimeout(deferBgm, 250);
  }
}

export function playHit(rate = 1) {
  try {
    if (!hitSound) return;
    const id = hitSound.play && hitSound.play();
    // Howler exposes rate(value, id) per-play; fallback Audio cannot pitch-shift cheaply.
    if (typeof id === 'number' && typeof hitSound.rate === 'function') {
      hitSound.rate(Math.max(0.5, Math.min(2.0, rate)), id);
    }
  } catch (e) { console.warn('playHit failed', e); }
}

export function startBgm() {
  try {
    if (!bgm) { pendingBgmStart = true; return; }
    if (!bgmReady && typeof Howl !== 'undefined') { pendingBgmStart = true; return; }
    if (mutedState) return;
    bgmId = bgm.play();
    if (typeof bgm.fade === 'function') {
      bgm.volume(0);
      bgm.fade(0, 0.12, 1500, bgmId);
    }
  } catch (e) { console.warn('startBgm failed', e); }
}

export function stopBgm() {
  pendingBgmStart = false;
  try {
    if (!bgm) return;
    if (typeof bgm.fade === 'function' && bgmId != null) {
      const id = bgmId;
      bgm.fade(bgm.volume() || 0.12, 0, 900, id);
      setTimeout(() => {
        try { bgm.stop(id); } catch (e) { console.warn('bgm stop after fade failed', e); }
      }, 950);
    } else if (bgm.stop) {
      bgm.stop();
    }
    bgmId = null;
  } catch (e) { console.warn('stopBgm failed', e); }
}

export function setMuted(muted) {
  mutedState = !!muted;
  try {
    if (typeof Howler !== 'undefined') Howler.mute(mutedState);
    if (hitSound && typeof hitSound.mute === 'function') hitSound.mute(mutedState);
    if (bgm     && typeof bgm.mute     === 'function') bgm.mute(mutedState, bgmId);
  } catch (e) { console.warn('setMuted failed', e); }
}

export function unlockAudio() {
  try {
    if (typeof Howler !== 'undefined' && Howler.ctx && Howler.ctx.state === 'suspended') {
      Howler.ctx.resume();
    }
  } catch (e) { console.warn('unlockAudio failed', e); }
}
