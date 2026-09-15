// Procedural audio via Web Audio API: baked SFX + ambient BGM. No files, no deps.

const BGM_VOL = 0.12;

let ctx = null;
let master = null;   // GainNode; mute = gain 0
const sfx = {};      // name → AudioBuffer, all baked at init (mono, <1s each)
let bgmBuf = null;
let bgmSrc = null;
let bgmGain = null;
let pendingBgmStart = false;

// fn(t) → sample in [-1,1]
function bake(duration, fn) {
  const sr = ctx.sampleRate;
  const buf = ctx.createBuffer(1, Math.floor(sr * duration), sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.max(-1, Math.min(1, fn(i / sr)));
  return buf;
}

// Phase of an exponential pitch glide f0→f1 (rate k). Must integrate phase —
// sin(2π·f(t)·t) with time-varying f chirps at the wrong rate.
const sweep = (t, f0, f1, k) => 2 * Math.PI * (f1 * t + (f0 - f1) * (1 - Math.exp(-k * t)) / k);
const noise = () => Math.random() * 2 - 1;
const TAU = 2 * Math.PI;

// Sum of notes [{f, at, k}]: sine + 0.3·3rd harmonic, exp decay k, gated by start time.
function notes(list, duration) {
  return bake(duration, (t) => {
    let acc = 0;
    for (const n of list) {
      const tl = t - n.at;
      if (tl < 0) continue;
      acc += (Math.sin(TAU * n.f * tl) + 0.3 * Math.sin(TAU * n.f * 3 * tl)) * Math.exp(-n.k * tl) * 0.35;
    }
    return acc;
  });
}

function bakeSfx() {
  sfx.hit  = bake(0.08, (t) => 0.7 * Math.sin(sweep(t, 1600, 700, 45)) * Math.exp(-25 * t) + 0.3 * noise() * Math.exp(-150 * t));
  sfx.miss = bake(0.25, (t) => 0.8 * Math.sin(sweep(t, 200, 70, 14)) * Math.exp(-9 * t) + 0.2 * noise() * Math.exp(-80 * t));
  sfx.tick = bake(0.06, (t) => 0.5 * Math.sin(TAU * 1200 * t) * Math.exp(-60 * t));
  sfx.go   = bake(0.35, (t) => 0.35 * (Math.sin(TAU * 880 * t) + Math.sin(TAU * 1320 * t)) * Math.exp(-6 * t));
  // C5 E5 G5 C6 ascending
  sfx.clear = notes([{ f: 523, at: 0, k: 10 }, { f: 659, at: 0.12, k: 10 }, { f: 784, at: 0.24, k: 10 }, { f: 1047, at: 0.36, k: 10 }], 0.6);
  sfx.win   = notes([{ f: 523, at: 0, k: 5 }, { f: 659, at: 0.1, k: 5 }, { f: 784, at: 0.2, k: 5 }], 0.7);
  sfx.fail  = notes([{ f: 392, at: 0, k: 6 }, { f: 311, at: 0.2, k: 6 }, { f: 262, at: 0.4, k: 6 }], 0.7);
}

function makeBgmBuffer() {
  // Modulator periods picked so all complete integer cycles in `duration` → seamless loop.
  const sr = ctx.sampleRate;
  const lfoHz = 0.0625;        // 1 cycle / 16s
  const pulseHz = 1.5;         // 24 cycles / 16s
  const duration = 1 / lfoHz;  // 16s
  const buf = ctx.createBuffer(2, Math.floor(sr * duration), sr);
  const L = buf.getChannelData(0);
  const R = buf.getChannelData(1);
  for (let i = 0; i < L.length; i++) {
    const t = i / sr;
    const tone = 0.35 * Math.sin(2 * Math.PI * 55 * t)
               + 0.22 * Math.sin(2 * Math.PI * 110 * t)
               + 0.12 * Math.sin(2 * Math.PI * 220 * t);
    const lfo = 0.6 + 0.4 * Math.sin(2 * Math.PI * lfoHz * t);
    const pulse = 0.08 * (0.5 + 0.5 * Math.sin(2 * Math.PI * pulseHz * t));
    L[i] = (tone * lfo + pulse) * 0.7;
    R[i] = (tone * lfo * 0.96 + pulse * 0.9) * 0.7;
  }
  return buf;
}

export function initAudio() {
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.warn('Web Audio unavailable', e);
    return;
  }
  master = ctx.createGain();
  master.connect(ctx.destination);
  bakeSfx();
  // BGM is 16s stereo (~1.5M samples) and only needed after Start — defer so page load isn't blocked.
  setTimeout(() => {
    bgmBuf = makeBgmBuffer();
    if (pendingBgmStart) { pendingBgmStart = false; startBgm(); }
  }, 250);
}

// `rate` also scales duration; only `hit` is called with rate ≠ 1 (combo pitch).
export function playSfx(name, rate = 1) {
  if (!ctx) return;  // unavailable: already warned at init
  const buf = sfx[name];
  if (!buf) { console.warn('playSfx: unknown', name); return; }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = Math.max(0.5, Math.min(2, rate));
  src.connect(master);
  src.start();
}

export function startBgm() {
  if (!bgmBuf) { pendingBgmStart = true; return; }
  if (bgmSrc) return;
  const now = ctx.currentTime;
  bgmGain = ctx.createGain();
  bgmGain.gain.setValueAtTime(0, now);
  bgmGain.gain.linearRampToValueAtTime(BGM_VOL, now + 1.5);
  bgmSrc = ctx.createBufferSource();
  bgmSrc.buffer = bgmBuf;
  bgmSrc.loop = true;
  bgmSrc.connect(bgmGain).connect(master);
  bgmSrc.start();
}

export function stopBgm() {
  pendingBgmStart = false;
  if (!bgmSrc) return;
  const src = bgmSrc, gain = bgmGain.gain, now = ctx.currentTime;
  bgmSrc = bgmGain = null;
  gain.cancelScheduledValues(now);
  gain.setValueAtTime(gain.value, now);
  gain.linearRampToValueAtTime(0, now + 0.9);
  src.stop(now + 0.95);
}

export function setMuted(muted) {
  if (master) master.gain.value = muted ? 0 : 1;
}

// Browsers keep the context suspended until a user gesture; call from a click handler.
// `!== 'running'` also covers Safari's non-standard 'interrupted' (call / lock / app switch).
export function unlockAudio() {
  if (ctx && ctx.state !== 'running') {
    ctx.resume().catch((e) => console.warn('audio resume failed', e));
  }
}
