// Synthesised SFX, every pitch drawn from D Dorian (D E F G A B C).
// The raised 6th (B) is the Dorian colour — melodic cues lean on it.
const AC = window.AudioContext || window.webkitAudioContext;
const get = k => { try { return localStorage.getItem(k); } catch { return null; } };
const put = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

let ctx = null, out = null, noiseBuf = null;
let vol = get('vol') == null ? .7 : +get('vol'), muted = get('muted') === '1';
const level = () => (muted ? 0 : vol * vol); // squared = perceptual taper

export function unlock() {
  if (!AC) return;
  if (!ctx) {
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -12; comp.knee.value = 8; comp.ratio.value = 4; comp.attack.value = .003; comp.release.value = .15;
    out = ctx.createGain(); out.gain.value = level();
    out.connect(comp).connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate / 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state !== 'running' && !document.hidden) ctx.resume();
  startMusic();
}

const apply = () => out && out.gain.setTargetAtTime(level(), ctx.currentTime, .02);
export const getVolume = () => vol;
export const isMuted = () => muted;
export function setVolume(v) { vol = v; if (v > 0) muted = false; put('vol', v); put('muted', muted ? 1 : 0); apply(); }
export function toggleMute() { muted = !muted; put('muted', muted ? 1 : 0); apply(); }

const STEP = [0, 2, 3, 5, 7, 9, 10], ROOT = 293.66; // D4; degree 7 = D5, -7 = D3
const hz = deg => ROOT * 2 ** ((Math.floor(deg / 7) * 12 + STEP[((deg % 7) + 7) % 7]) / 12);

function tone(deg, { type = 'triangle', dur = .15, gain = .2, at = 0, glide = null, attack = .006, dest = out, detune = 0 } = {}) {
  const t0 = ctx.currentTime + Math.max(0, at), o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.detune.value = detune;
  o.frequency.setValueAtTime(hz(deg), t0);
  if (glide != null) o.frequency.exponentialRampToValueAtTime(hz(glide), t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
  o.connect(g).connect(dest);
  o.start(t0); o.stop(t0 + dur + .05);
}

// ---- music: 8-bar D Dorian loop, long notes. i–IV (Dm7 → G major) is the Dorian signature move.
const BEAT = 60 / 84, BAR = BEAT * 4;
const CHORDS = [[0, 2, 4, 6], [3, 5, 7], [4, 6, 8, 10], [6, 8, 10], [0, 2, 4, 6], [3, 5, 7], [6, 8, 10], [0, 2, 4, 6]]; // Dm7 G Am7 C | Dm7 G C Dm7
const LEAD = [ // [degree, beats]; 7 = D5, 12 = B5 (the Dorian 6th)
  [[7, 2], [9, 1], [11, 1]], [[12, 3], [11, 1]], [[11, 2], [8, 2]], [[6, 4]],
  [[4, 2], [5, 1], [7, 1]], [[5, 4]], [[8, 2], [7, 1], [8, 1]], [[7, 4]],
];
let musicOn = get('music') !== '0', mus = null, echo = null, next = 0, bar = 0, timer = null;

function playBar(t0, b) {
  const at = t0 - ctx.currentTime;
  CHORDS[b].forEach(d => { // soft detuned pad through a lowpass
    tone(d, { type: 'triangle', dur: BAR * 1.05, gain: .045, at, attack: .5, dest: mus.pad, detune: -6 });
    tone(d, { type: 'sine', dur: BAR * 1.05, gain: .04, at, attack: .5, dest: mus.pad, detune: 6 });
  });
  tone(CHORDS[b][0] - 7, { type: 'sine', dur: BAR * .95, gain: .12, at, attack: .05, dest: mus });
  let beat = 0;
  for (const [d, len] of LEAD[b]) {
    tone(d, { type: 'triangle', dur: len * BEAT * 1.1, gain: .07, at: at + beat * BEAT, attack: .04, dest: echo });
    beat += len;
  }
}

function tick() {
  while (next < ctx.currentTime + .5) { playBar(next, bar); bar = (bar + 1) % 8; next += BAR; }
}

// a game that plays its own backing (Dorian Lanes) holds the loop off until it's done
let held = false;
export function holdMusic(on) { held = on; on ? stopMusic() : startMusic(); }

export function startMusic() {
  if (!ctx || timer || !musicOn || held) return;
  mus = ctx.createGain(); mus.gain.value = .55; mus.connect(out);
  mus.pad = ctx.createBiquadFilter(); mus.pad.type = 'lowpass'; mus.pad.frequency.value = 1400; mus.pad.connect(mus);
  echo = ctx.createGain(); echo.connect(mus); // dry lead + feedback delay (dotted-eighth feel)
  const dl = ctx.createDelay(1), fb = ctx.createGain(), wet = ctx.createGain();
  dl.delayTime.value = BEAT * .75; fb.gain.value = .32; wet.gain.value = .35;
  echo.connect(dl).connect(fb).connect(dl); dl.connect(wet).connect(mus);
  next = ctx.currentTime + .1; bar = 0;
  tick();
  timer = setInterval(tick, 100);
}

export function stopMusic() {
  clearInterval(timer); timer = null;
  if (mus) { mus.gain.setTargetAtTime(0, ctx.currentTime, .25); mus = null; } // scheduled notes fade on the old bus
}

export const isMusicOn = () => musicOn;
export function toggleMusic() {
  musicOn = !musicOn;
  put('music', musicOn ? 1 : 0);
  musicOn ? startMusic() : stopMusic();
}

// pause everything while the tab/app is in the background (battery + no throttled-timer gaps)
document.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  if (document.hidden) ctx.suspend();
  else ctx.resume();
});

function noise({ dur = .2, gain = .3, f = 1000, q = .8, at = 0 } = {}) {
  const t0 = ctx.currentTime + at, s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noiseBuf; bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q;
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
  s.connect(bp).connect(g).connect(out);
  s.start(t0); s.stop(t0 + dur + .05);
}

const arp = (degs, o) => degs.forEach((d, i) => tone(d, { ...o, at: i * (o.step ?? .07) }));

// Gains balanced by ear against the compressor: UI ~.1, gameplay ~.12–.16, impacts loudest.
const defs = {
  click: () => tone(7, { type: 'sine', dur: .06, gain: .12 }),
  lane: () => tone(4, { type: 'triangle', dur: .07, gain: .1, glide: 5 }),
  jump: () => tone(0, { type: 'square', dur: .18, gain: .06, glide: 7 }),
  hit: () => { noise({ dur: .28, gain: .32, f: 600 }); tone(-7, { type: 'sawtooth', dur: .32, gain: .14, glide: -10 }); },
  boost: () => arp([7, 9, 11, 12], { type: 'triangle', dur: .12, gain: .1, step: .045 }), // D F A B
  count: () => tone(4, { type: 'square', dur: .12, gain: .07 }),
  go: () => { tone(7, { type: 'square', dur: .4, gain: .07 }); tone(11, { type: 'square', dur: .4, gain: .06 }); },
  finish: () => arp([0, 2, 4, 5, 7], { type: 'triangle', dur: .3, gain: .12, step: .08 }),
  win: () => { arp([7, 9, 11, 12, 14], { type: 'triangle', dur: .35, gain: .11 }); [7, 11, 12].forEach(d => tone(d, { type: 'sine', dur: .9, gain: .08, at: .4 })); },
  lose: () => arp([4, 3, 2, 0], { type: 'sine', dur: .35, gain: .11, step: .13 }),
  turn: () => { tone(4, { type: 'sine', dur: .1, gain: .1 }); tone(7, { type: 'sine', dur: .14, gain: .1, at: .08 }); },
  perfect: () => { arp([11, 12, 14], { type: 'triangle', dur: .3, gain: .12, step: .05 }); noise({ dur: .15, gain: .08, f: 7000, q: 2, at: .05 }); },
  great: () => arp([9, 11], { type: 'triangle', dur: .24, gain: .12, step: .05 }),
  good: () => tone(7, { type: 'triangle', dur: .2, gain: .12 }),
  miss: () => tone(1, { type: 'sawtooth', dur: .26, gain: .06, glide: -2 }),
  signal: () => { tone(14, { type: 'square', dur: .16, gain: .07 }); tone(12, { type: 'triangle', dur: .22, gain: .1 }); },
  decoy: () => tone(3, { type: 'sine', dur: .12, gain: .08, glide: 2 }),
  drop: () => { tone(-7, { type: 'sine', dur: .16, gain: .16, glide: -9 }); noise({ dur: .08, gain: .12, f: 400 }); },
  foot: () => noise({ dur: .04, gain: .09, f: 2200, q: 1.5 }),
  step: () => tone(0, { type: 'triangle', dur: .08, gain: .08, glide: 2 }),
  fall: () => { tone(4, { type: 'sawtooth', dur: .7, gain: .08, glide: -7 }); noise({ dur: .5, gain: .1, f: 500, q: .5 }); },
  // generic Dorian pitch (degree 0 = D4) for melodies built by games
  pitch: (deg, dur = .3, gain = .12) => { tone(deg, { type: 'triangle', dur, gain, attack: .01 }); tone(deg + 7, { type: 'sine', dur: dur * .7, gain: gain * .25 }); },
  // one bar of a pad chord: 0–7 (the music loop's progression) or an array of degrees; for games that play their own backing
  chord: (i, dur = BAR) => (Array.isArray(i) ? i : CHORDS[i % 8]).forEach(d => tone(d, { type: 'triangle', dur, gain: .035, attack: .3, detune: (d % 2) * 8 - 4 })),
  kick: () => tone(-14, { type: 'sine', dur: .18, gain: .22, glide: -18, attack: .002 }),
  hat: () => noise({ dur: .035, gain: .05, f: 8000, q: 1.2 }),
  tick: () => tone(12, { type: 'square', dur: .03, gain: .05 }),
  boom: () => { noise({ dur: .9, gain: .45, f: 180, q: .4 }); tone(-14, { type: 'sawtooth', dur: .8, gain: .16, glide: -21 }); },
  toss: () => tone(4, { type: 'sine', dur: .16, gain: .1, glide: 9 }),
  catch: () => { tone(7, { type: 'triangle', dur: .1, gain: .12 }); noise({ dur: .05, gain: .08, f: 1500 }); },
  pull: () => noise({ dur: .06, gain: .1, f: 900, q: 1.2 }),
  bump: () => { tone(-3, { type: 'sine', dur: .2, gain: .18, glide: -7 }); noise({ dur: .1, gain: .14, f: 700 }); },
  note: i => { const d = [0, 4, 5][i] ?? 0; tone(d, { type: 'triangle', dur: .55, gain: .14, attack: .01 }); tone(d + 7, { type: 'sine', dur: .4, gain: .04 }); }, // D, A, B♮
  crack: () => { noise({ dur: .1, gain: .16, f: 4200, q: 2.2 }); tone(11, { type: 'square', dur: .07, gain: .07, glide: 14 }); }, // tile touched: brittle snap + a quick rise through the Dorian 6th
  brake: () => { noise({ dur: .32, gain: .26, f: 2200, q: 2.4 }); tone(-3, { type: 'sawtooth', dur: .28, gain: .1, glide: -11 }); }, // skid screech
  ice: () => { tone(11, { type: 'sine', dur: .22, gain: .1, glide: 14 }); tone(14, { type: 'triangle', dur: .18, gain: .06, at: .05 }); }, // bright chime entering the ice patch
  gust: () => { noise({ dur: .5, gain: .16, f: 1600, q: .6 }); tone(9, { type: 'sine', dur: .4, gain: .08, glide: 4 }); }, // tailwind whoosh
  vaultGem: () => arp([4, 7, 11], { type: 'triangle', dur: .16, gain: .11, step: .045 }), // F A B — bright ascending sparkle for a gem split
  vaultTrap: () => { tone(1, { type: 'sawtooth', dur: .2, gain: .08, glide: -3 }); noise({ dur: .06, gain: .07, f: 1200, q: 1.4 }); }, // dark clank for a safe (first) trap reveal
  vaultBank: () => { arp([7, 9, 12], { type: 'sine', dur: .16, gain: .12, step: .04 }); tone(14, { type: 'triangle', dur: .3, gain: .08, at: .12 }); }, // coin-bank chime when a player leaves with gems
};

const last = {};
export const sfx = Object.fromEntries(Object.entries(defs).map(([k, fn]) => [k, (...a) => {
  if (!ctx || ctx.state !== 'running' || !level()) return;
  const n = ctx.currentTime;
  if (n - (last[k] ?? -1) < .04) return; // stop same-frame stacking
  last[k] = n;
  fn(...a);
}]));
