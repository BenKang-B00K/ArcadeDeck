// Web Audio synth — every sound generated at runtime, tuned to D Dorian (the white keys from D).
// Graph: voice -> [pan] -> bus(music|sfx) -> master -> compressor -> out
//                       \-> wet(music|sfx) -> convolver reverb -> master

const DORIAN = [0, 2, 3, 5, 7, 9, 10];
const mtof = m => 440 * 2 ** ((m - 69) / 12);
const deg = (d, root = 62) => root + 12 * Math.floor(d / 7) + DORIAN[((d % 7) + 7) % 7];

// partial tables: [frequency ratio, amplitude, decay scale]
const BELL = [[1, 1, 1], [2, 0.28, 0.6], [2.76, 0.3, 0.45], [5.4, 0.1, 0.22], [8.93, 0.04, 0.12]];
const MARIMBA = [[1, 1, 1], [3.99, 0.28, 0.18], [10.1, 0.05, 0.06]];

let ctx = null, master, verb, noise;
const bus = {}, wet = {};
const level = { music: 0.5, sfx: 0.8 };
const TRIM = { music: 0.25, sfx: 1 }; // music sits under sfx: slider 50 ≈ -3 dB below the old default of 30

let ducked = false;
const DUCK = 0.4; // ≈ -8 dB on music while animals run

export function setVolume(kind, v, tau = 0.05) {
  level[kind] = v;
  if (!ctx) return;
  const g = v * v * TRIM[kind] * (kind === 'music' && ducked ? DUCK : 1); // perceptual taper
  bus[kind].gain.setTargetAtTime(g, ctx.currentTime, tau);
  wet[kind].gain.setTargetAtTime(g, ctx.currentTime, tau);
}

// music dips under the run sfx while any animal is on the ladder: quick down, slow swell back
export function duck(on) {
  if (on === ducked) return;
  ducked = on;
  setVolume('music', level.music, on ? 0.12 : 0.6);
}

export function init() {
  if (ctx) { if (ctx.state === 'suspended' && !document.hidden) ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC({ latencyHint: 'interactive' });

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 3;
  comp.attack.value = 0.005; comp.release.value = 0.3;
  master = ctx.createGain();
  master.gain.value = 0.85;
  master.connect(comp).connect(ctx.destination);

  verb = ctx.createConvolver();
  verb.buffer = impulse(3.2, 2.6);
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass'; tone.frequency.value = 5200;
  verb.connect(tone).connect(master);

  for (const k of ['music', 'sfx']) {
    bus[k] = ctx.createGain(); bus[k].connect(master);
    wet[k] = ctx.createGain(); wet[k].connect(verb);
    setVolume(k, level[k]);
  }

  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}

export function pause(hidden) {
  if (ctx) hidden ? ctx.suspend() : ctx.resume();
}

function impulse(sec, decay) {
  const len = (ctx.sampleRate * sec) | 0, pre = (ctx.sampleRate * 0.018) | 0;
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = pre; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** decay;
  }
  return buf;
}

function out(kind, pan = 0, send = 0.3) {
  const g = ctx.createGain();
  let node = g;
  if (pan && ctx.createStereoPanner) {
    const p = ctx.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, pan));
    node = g.connect(p);
  }
  const [dry, w] = kind === 'music' ? mix : [bus[kind], wet[kind]];
  node.connect(dry);
  const s = ctx.createGain();
  s.gain.value = send;
  node.connect(s).connect(w);
  return g;
}

// struck tone: each partial decays on its own clock, like a real bar or bell
function strike(kind, freq, t, { partials, decay, peak, pan = 0, send = 0.3 }) {
  const o = out(kind, pan, send);
  for (const [ratio, amp, dk] of partials) {
    const osc = ctx.createOscillator(), g = ctx.createGain(), end = t + decay * dk;
    osc.frequency.value = freq * ratio;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak * amp, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(g).connect(o);
    osc.start(t); osc.stop(end + 0.05);
  }
}

// ---------- music: one chiptune loop per quick fill type, all in D Dorian — pulse lead, arps, triangle bass, noise drums ----------

// one chord per bar, all diatonic to D Dorian (G major = Dorian's bright IV)
const DM = [62, 65, 69], EM = [64, 67, 71], F = [65, 69, 72], G = [55, 59, 62], AM = [57, 60, 64], C = [60, 64, 67];
const DM7 = [62, 65, 69, 72], EM7 = [64, 67, 71, 74], FM7 = [65, 69, 72, 76], G7 = [59, 62, 65, 67];
const range = n => [...Array(n).keys()];
// arp / comp hits: [beat, chord tone, octave, beats]
const ARP16 = range(16).map(k => [k / 4, k % 3, ((k / 3) | 0) % 2, 0.2]);
const stab = (b, len, n = 3) => range(n).map(j => [b, j, 0, len]);
// prog: [bass root, chord] per bar; hook: [midi, start beat, beats] per bar, each 4-bar phrase ends on a held note;
// bass: [beat, semitones over root, beats]; lead: pulse duty on normal / every other loop (arp also lifts an octave then)
const SONGS = {
  // Winner: bright arcade loop
  win: {
    bpm: 132,
    prog: [[38, DM], [36, C], [43, G], [38, DM], [38, DM], [36, C], [43, G], [45, AM]],
    hook: [
      [[74, 0, 1], [77, 1, 0.5], [81, 1.5, 2.5]],
      [[79, 0, 1], [76, 1, 0.5], [72, 1.5, 2.5]],
      [[71, 0, 1], [74, 1, 0.5], [79, 1.5, 1.5], [83, 3, 1]],
      [[81, 0, 4]],
      [[86, 0, 1], [84, 1, 0.5], [81, 1.5, 1.5], [77, 3, 1]],
      [[79, 0, 1], [76, 1, 0.5], [79, 1.5, 1.5], [84, 3, 1]],
      [[83, 0, 1.5], [81, 1.5, 0.5], [79, 2, 1], [74, 3, 1]],
      [[76, 0, 4]],
    ],
    lead: [0.5, 0.125], arp: ARP16, bass: range(8).map(k => [k / 2, k % 2 ? 12 : 0, 0.425]),
    kick: [0, 2], fill: [2.5], snare: [1, 3], hat: range(8).map(k => k / 2), open: 3.5,
  },
  // Penalty: tense ticking-clock ostinato, heartbeat kick, low creeping lead
  pen: {
    bpm: 116,
    prog: [[38, DM], [38, DM], [36, C], [38, DM], [38, DM], [41, F], [40, EM], [45, AM]],
    hook: [
      [[74, 0, 1.5], [72, 1.5, 0.5], [69, 2, 2]],
      [[71, 0, 1.5], [69, 1.5, 0.5], [65, 2, 2]],
      [[67, 0, 1], [69, 1, 1], [64, 2, 2]],
      [[62, 0, 4]],
      [[74, 0, 1], [77, 1, 1], [76, 2, 1], [74, 3, 1]],
      [[72, 0, 1.5], [71, 1.5, 0.5], [69, 2, 2]],
      [[67, 0, 1], [65, 1, 1], [64, 2, 2]],
      [[69, 0, 4]],
    ],
    lead: [0.25, 0.125], arp: range(8).map(k => [k / 2, k % 3, 0, 0.3]), arpWave: 0.125,
    bass: range(8).map(k => [k / 2, 0, 0.3]),
    kick: [0, 0.5], snare: [3], hat: range(8).map(k => k / 2),
  },
  // Ranking: racing — four-on-the-floor, galloping bass, running lead
  rank: {
    bpm: 152,
    prog: [[38, DM], [36, C], [38, DM], [36, C], [41, F], [43, G], [45, AM], [43, G]],
    hook: [
      [[74, 0, 0.5], [76, 0.5, 0.5], [77, 1, 0.5], [79, 1.5, 0.5], [81, 2, 2]],
      [[79, 0, 0.5], [77, 0.5, 0.5], [76, 1, 1], [72, 2, 2]],
      [[74, 0, 0.5], [76, 0.5, 0.5], [77, 1, 0.5], [81, 1.5, 0.5], [86, 2, 2]],
      [[84, 0, 1], [81, 1, 1], [79, 2, 2]],
      [[77, 0, 1], [81, 1, 1], [84, 2, 2]],
      [[83, 0, 1], [79, 1, 1], [74, 2, 2]],
      [[76, 0, 1], [72, 1, 1], [69, 2, 1], [72, 3, 1]],
      [[71, 0, 1], [74, 1, 1], [79, 2, 1], [83, 3, 1]],
    ],
    lead: [0.5, 0.25], arp: ARP16, bass: range(8).map(k => [k / 2, k % 4 === 2 ? 12 : 0, 0.4]),
    kick: [0, 1, 2, 3], fill: [3.5], snare: [1, 3], hat: [0.5, 1.5, 2.5, 3.5], open: 3.5,
  },
  // Teams: marching anthem — oom-pah bass and stabs, snare roll-offs
  team: {
    bpm: 112,
    prog: [[38, DM], [43, G], [38, DM], [43, G], [41, F], [36, C], [43, G], [38, DM]],
    hook: [
      [[74, 0, 1], [74, 1, 0.5], [74, 1.5, 0.5], [77, 2, 1], [74, 3, 1]],
      [[79, 0, 2], [74, 2, 2]],
      [[74, 0, 1], [77, 1, 1], [81, 2, 1], [77, 3, 1]],
      [[79, 0, 4]],
      [[81, 0, 1], [81, 1, 0.5], [79, 1.5, 0.5], [77, 2, 2]],
      [[76, 0, 1], [79, 1, 1], [84, 2, 2]],
      [[83, 0, 1.5], [81, 1.5, 0.5], [79, 2, 2]],
      [[74, 0, 4]],
    ],
    lead: [0.25, 0.5], arp: [...stab(1, 0.4), ...stab(3, 0.4)], arpPeak: 0.025,
    bass: [[0, 0, 0.9], [2, 7, 0.9]],
    kick: [0, 2], snare: [1, 3, 3.5, 3.75], hat: [0, 1, 2, 3],
  },
  // Ratio: carousel waltz in 3/4
  ratio: {
    bpm: 144, beats: 3,
    prog: [[38, DM], [38, DM], [43, G], [43, G], [36, C], [36, C], [45, AM], [38, DM]],
    hook: [
      [[74, 0, 2], [77, 2, 1]],
      [[76, 0, 1], [74, 1, 1], [69, 2, 1]],
      [[71, 0, 2], [74, 2, 1]],
      [[79, 0, 3]],
      [[76, 0, 2], [79, 2, 1]],
      [[84, 0, 1], [83, 1, 1], [79, 2, 1]],
      [[81, 0, 2], [76, 2, 1]],
      [[74, 0, 3]],
    ],
    lead: [0.5, 0.25], arp: [...stab(1, 0.5), ...stab(2, 0.5)], arpPeak: 0.022,
    bass: [[0, 0, 0.9]],
    kick: [0], hat: [1, 2],
  },
  // Bill: swung lounge vamp — Dm7 / G7, walking bass, Charleston comp, brushed ride
  bill: {
    bpm: 100, swing: true,
    prog: [[38, DM7], [38, DM7], [43, G7], [43, G7], [38, DM7], [40, EM7], [41, FM7], [43, G7]],
    hook: [
      [[69, 0, 1.5], [72, 1.5, 0.5], [74, 2, 1], [77, 3, 1]],
      [[76, 0, 3], [74, 3, 1]],
      [[71, 0, 1], [74, 1, 0.5], [77, 1.5, 1.5], [76, 3, 1]],
      [[74, 0, 4]],
      [[81, 0, 1.5], [79, 1.5, 0.5], [77, 2, 1], [76, 3, 1]],
      [[74, 0, 2], [71, 2, 2]],
      [[72, 0, 1], [74, 1, 1], [76, 2, 2]],
      [[77, 0, 1.5], [76, 1.5, 0.5], [74, 2, 2]],
    ],
    lead: ['triangle', 'triangle'], leadPeak: 0.07, arp: [...stab(0, 1.2, 4), ...stab(1.5, 0.4, 4)], arpWave: 0.5, arpPeak: 0.012,
    bass: [[0, 0, 0.9], [1, 7, 0.9], [2, 12, 0.9], [3, 7, 0.9]],
    kick: [0], snare: [1, 3], hat: [0, 1, 1.5, 2, 3, 3.5], drum: 0.6,
  },
  // Pick: bright game-show loop, four on the floor, a hook that keeps climbing back to the octave
  spin: {
    bpm: 128,
    prog: [[38, DM], [43, G], [36, C], [45, AM], [38, DM], [43, G], [41, F], [45, AM]],
    hook: [
      [[74, 0, 0.5], [77, 0.5, 0.5], [81, 1, 1], [79, 2, 0.5], [77, 2.5, 1.5]],
      [[79, 0, 0.5], [81, 0.5, 0.5], [83, 1, 1], [86, 2, 2]],
      [[84, 0, 0.5], [83, 0.5, 0.5], [81, 1, 1], [79, 2, 1], [76, 3, 1]],
      [[81, 0, 3], [79, 3, 1]],
      [[74, 0, 0.5], [77, 0.5, 0.5], [81, 1, 1], [79, 2, 0.5], [77, 2.5, 1.5]],
      [[79, 0, 0.5], [83, 0.5, 0.5], [86, 1, 1], [88, 2, 2]],
      [[89, 0, 1], [88, 1, 0.5], [86, 1.5, 0.5], [84, 2, 1], [81, 3, 1]],
      [[86, 0, 4]],
    ],
    lead: [0.25, 0.5], arp: ARP16, bass: range(8).map(k => [k / 2, k % 2 ? 12 : 0, 0.4]),
    kick: [0, 1, 2, 3], fill: [3.5], snare: [1, 3], hat: range(8).map(k => k / 2), open: 3.5,
  },
  // Knockout: tense pulse that adds a layer each round (setLevel): bass + kick, then hats, arp, snare, the lead
  knock: {
    bpm: 120, layered: true,
    prog: [[38, DM], [38, DM], [41, F], [40, EM], [38, DM], [38, DM], [36, C], [45, AM]],
    hook: [
      [[74, 0, 1.5], [76, 1.5, 0.5], [77, 2, 2]],
      [[76, 0, 1], [74, 1, 1], [72, 2, 2]],
      [[77, 0, 1.5], [79, 1.5, 0.5], [81, 2, 2]],
      [[79, 0, 4]],
      [[81, 0, 1], [79, 1, 0.5], [77, 1.5, 0.5], [76, 2, 2]],
      [[74, 0, 1.5], [72, 1.5, 0.5], [69, 2, 2]],
      [[72, 0, 1], [74, 1, 1], [76, 2, 2]],
      [[76, 0, 4]],
    ],
    lead: [0.125, 0.25], arp: range(8).map(k => [k / 2, k % 3, 0, 0.25]), arpWave: 0.125,
    bass: range(8).map(k => [k / 2, k % 4 === 3 ? 7 : 0, 0.3]),
    kick: [0, 1.5, 2], fill: [3.5, 3.75], snare: [1, 3], hat: range(16).map(k => k / 4),
  },
  // custom results: mellow, half-time
  custom: {
    bpm: 96,
    prog: [[38, DM], [45, AM], [36, C], [43, G], [41, F], [36, C], [40, EM], [45, AM]],
    hook: [
      [[69, 0, 2], [72, 2, 1], [74, 3, 1]],
      [[76, 0, 3], [72, 3, 1]],
      [[67, 0, 2], [72, 2, 2]],
      [[71, 0, 4]],
      [[72, 0, 2], [69, 2, 1], [72, 3, 1]],
      [[76, 0, 2], [79, 2, 2]],
      [[74, 0, 2], [71, 2, 2]],
      [[69, 0, 4]],
    ],
    lead: [0.5, 0.25], leadPeak: 0.032, arp: range(8).map(k => [k / 2, [0, 1, 2, 1][k % 4], (k / 4) | 0, 0.45]), arpWave: 0.5,
    bass: [[0, 0, 1.8], [2, 12, 1.8]],
    kick: [0, 2.5], hat: [1, 3], drum: 0.7,
  },
};
const FADE = 1; // s: outgoing song fades over this; the new one starts from the top just before it ends
let timer = 0, nextT = 0, bar = 0, echo = null, mix = null, song = SONGS.win;

// a layered song's intensity: 0 = bass and kick, then hats, arp, snare, lead (Knockout: one more each round)
let layer = 0;
export function setLevel(n) { layer = n; }

export function setMusic(preset) {
  const s = SONGS[preset] || SONGS.custom;
  if (s === song) return;
  song = s; bar = 0;
  if (!timer) return; // not started yet: startMusic picks it up
  const t = ctx.currentTime, [dry, w] = mix, old = echo;
  for (const g of [dry, w]) {
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(g.gain.value, t);
    g.gain.linearRampToValueAtTime(0, t + FADE);
  }
  // notes already scheduled for the old song keep playing into its silent gains; cut them loose once faded
  setTimeout(() => [dry, w, old].forEach(n => n.disconnect()), (FADE + 0.2) * 1000);
  newMix();
  nextT = t + FADE * 0.9;
}

// fresh dry/reverb gains per song, so the outgoing one can fade on its own; its echo goes with it
function newMix() {
  mix = [ctx.createGain(), ctx.createGain()];
  mix[0].connect(bus.music); mix[1].connect(wet.music);
  // dotted-8th echo on the lead: the classic arcade "double" sound
  echo = ctx.createDelay(1);
  echo.delayTime.value = 0.75 * 60 / song.bpm;
  const fb = ctx.createGain(), wetOut = ctx.createGain();
  fb.gain.value = 0.3; wetOut.gain.value = 0.35;
  echo.connect(fb).connect(echo);
  echo.connect(wetOut).connect(out('music', -0.3, 0.1));
}
const waves = {};

// band-limited pulse wave (NES-style duty cycles) — no aliasing fizz unlike a raw square
function pulse(duty) {
  if (waves[duty]) return waves[duty];
  const N = 48, re = new Float32Array(N), im = new Float32Array(N);
  for (let n = 1; n < N; n++) {
    re[n] = Math.sin(2 * Math.PI * n * duty) / (n * Math.PI);
    im[n] = (1 - Math.cos(2 * Math.PI * n * duty)) / (n * Math.PI);
  }
  return (waves[duty] = ctx.createPeriodicWave(re, im));
}

function chip(m, t, dur, { wave = 0.5, peak, pan = 0, send = 0.1, vib = false, delay = false }) {
  const o = out('music', pan, send), g = ctx.createGain(), osc = ctx.createOscillator(), end = t + dur;
  wave === 'triangle' ? (osc.type = 'triangle') : osc.setPeriodicWave(pulse(wave));
  osc.frequency.value = mtof(m);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.004);
  g.gain.setTargetAtTime(peak * 0.65, t + 0.02, 0.07); // chip-style drop to sustain
  g.gain.setTargetAtTime(0, end - 0.015, 0.012);
  osc.connect(g).connect(o);
  if (delay) g.connect(echo);
  if (vib) { // delayed vibrato on held notes
    const lfo = ctx.createOscillator(), depth = ctx.createGain();
    lfo.frequency.value = 6;
    depth.gain.setValueAtTime(0, t);
    depth.gain.linearRampToValueAtTime(18, t + 0.35);
    lfo.connect(depth).connect(osc.detune);
    lfo.start(t); lfo.stop(end + 0.1);
  }
  osc.start(t); osc.stop(end + 0.1);
}

function hit(t, { freq, q = 0.8, type = 'bandpass', peak, decay, pan = 0 }) {
  const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = noise;
  f.type = type; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(peak, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  src.connect(f).connect(g).connect(out('music', pan, 0.05));
  src.start(t, Math.random() * 0.5); src.stop(t + decay + 0.02);
}

function kick(t, v = 1) {
  const osc = ctx.createOscillator(), g = ctx.createGain();
  osc.frequency.setValueAtTime(170, t);
  osc.frequency.exponentialRampToValueAtTime(42, t + 0.12);
  g.gain.setValueAtTime(0.32 * v, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  osc.connect(g).connect(out('music', 0, 0));
  osc.start(t); osc.stop(t + 0.25);
}

function scheduleBar(t) {
  const S = song, B = 60 / S.bpm, n = S.prog.length, i = bar % n, alt = ((bar / n) | 0) % 2; // every other loop: other lead duty, arp an octave up
  bar++;
  const at = b => t + (S.swing && b % 1 === 0.5 ? b + 1 / 6 : b) * B; // swing pushes off-beat 8ths to the triplet
  const [root, tones] = S.prog[i], d = S.drum ?? 1, L = S.layered ? layer : 9; // layered songs build up with setLevel()
  if (L >= 2) for (const [b, j, oct, len] of S.arp) {
    chip(tones[j % tones.length] + 12 * (oct + alt), at(b), len * B, { wave: S.arpWave ?? 0.25, peak: S.arpPeak ?? 0.02, pan: -0.4, send: 0.06 });
  }
  for (const [b, semi, len] of S.bass) chip(root + semi, at(b), len * B, { wave: 'triangle', peak: 0.15, send: 0 });
  if (L >= 4) for (const [m, b, len] of S.hook[i]) {
    chip(m, at(b), len * B * 0.92, { wave: S.lead[alt], peak: S.leadPeak ?? 0.038, pan: 0.15, send: 0.18, vib: len >= 1.5, delay: true });
  }
  for (const b of i % 4 === 3 ? [...S.kick, ...S.fill ?? []] : S.kick) kick(at(b), d); // fill into each phrase
  if (L >= 3) for (const b of S.snare ?? []) hit(at(b), { freq: 1800, peak: 0.13 * d, decay: 0.13 });
  if (L >= 1) for (const b of S.hat) hit(at(b), { freq: 7500, type: 'highpass', peak: (b === S.open ? 0.05 : 0.03) * d, decay: b === S.open ? 0.14 : 0.035, pan: 0.3 });
}

function tick() {
  if (ctx.state !== 'running') return;
  if (nextT < ctx.currentTime) nextT = ctx.currentTime + 0.1;
  while (nextT < ctx.currentTime + 0.5) {
    if (level.music > 0.001) scheduleBar(nextT); else bar++;
    nextT += (song.beats ?? 4) * 60 / song.bpm;
  }
}

export function startMusic() {
  if (timer || !ctx) return;
  newMix();
  nextT = ctx.currentTime + 0.3;
  timer = setInterval(tick, 200);
  tick();
}

// ---------- sfx ----------

const live = () => ctx && ctx.state === 'running' && level.sfx > 0.001;

export function ui() {
  if (!live()) return;
  strike('sfx', mtof(deg(4, 74)), ctx.currentTime, { partials: MARIMBA, decay: 0.28, peak: 0.11, send: 0.12 });
}

export function go(i, pan) {
  if (!live()) return;
  const t = ctx.currentTime;
  [0, 2, 4].forEach((d, k) =>
    strike('sfx', mtof(deg(i + d, 62)), t + k * 0.06, { partials: MARIMBA, decay: 0.55, peak: 0.14, pan, send: 0.25 }));
}

export function land(big, pan, bad) {
  if (!live()) return;
  const t = ctx.currentTime;
  const arp = big ? [0, 2, 4, 5, 7, 9, 11, 14] : [0, 2, 4, 5, 7]; // i with the Dorian major 6th
  if (bad) arp.reverse(); // penalty / biggest payer: same run, falling
  arp.forEach((d, k) =>
    strike('sfx', mtof(deg(d, 74)), t + k * 0.075, { partials: BELL, decay: big ? 2.6 : 1.8, peak: 0.13, pan, send: 0.45 }));
  if (big) strike('sfx', mtof(50), t, { partials: BELL, decay: 3.5, peak: 0.16, send: 0.6 });
}

export function fanfare() {
  if (!live()) return;
  const t = ctx.currentTime + 0.1;
  [0, 4, 7, 9, 11, 14].forEach((d, k) =>
    strike('sfx', mtof(deg(d, 62)), t + k * 0.09, { partials: BELL, decay: 3, peak: 0.11, pan: (k / 5 - 0.5) * 1.2, send: 0.6 }));
  [0, 2, 4, 5].forEach(d =>
    strike('sfx', mtof(deg(d, 74)), t + 0.7, { partials: BELL, decay: 4, peak: 0.08, send: 0.7 }));
}

export function shuffle() {
  if (!live()) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = noise;
  bp.type = 'bandpass'; bp.Q.value = 1.4;
  bp.frequency.setValueAtTime(300, t);
  bp.frequency.exponentialRampToValueAtTime(4200, t + 0.4);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.22, t + 0.08);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  src.connect(bp).connect(g).connect(out('sfx', 0, 0.3));
  src.start(t); src.stop(t + 0.55);
  for (let k = 0; k < 7; k++) {
    strike('sfx', mtof(deg(11 - k, 62)), t + 0.05 + k * 0.035, { partials: MARIMBA, decay: 0.3, peak: 0.08, pan: (k / 6 - 0.5) * 1.4, send: 0.2 });
  }
}

// two animals bumping: a soft rubbery boing (sine dropping a fifth) with a Dorian marimba pair on top
export function bump(pan) {
  if (!live()) return;
  const t = ctx.currentTime, osc = ctx.createOscillator(), g = ctx.createGain();
  osc.frequency.setValueAtTime(mtof(deg(4, 62)), t);
  osc.frequency.exponentialRampToValueAtTime(mtof(deg(0, 62)), t + 0.18);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.16, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  osc.connect(g).connect(out('sfx', pan, 0.15));
  osc.start(t); osc.stop(t + 0.35);
  [2, 5].forEach((d, k) =>
    strike('sfx', mtof(deg(d, 74)), t + k * 0.05, { partials: MARIMBA, decay: 0.3, peak: 0.08, pan, send: 0.2 }));
}

// ---------- wheel ----------

// peg tick: a marimba knock plus a wooden click, pitched by wheel speed (so the ticks walk down the scale in the crawl),
// louder with the impact. speed in rad/s, hit 0..1
export function pegTick(speed, hit, pan) {
  if (!live()) return;
  const t = ctx.currentTime, d = Math.max(0, Math.min(10, Math.round(Math.log2(1 + speed) * 2)));
  strike('sfx', mtof(deg(d, 69)), t, { partials: MARIMBA, decay: 0.18, peak: 0.04 + 0.1 * hit, pan, send: 0.12 });
  const src = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = noise;
  hp.type = 'highpass'; hp.frequency.value = 2600;
  g.gain.setValueAtTime(0.03 + 0.07 * hit, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
  src.connect(hp).connect(g).connect(out('sfx', pan, 0.05));
  src.start(t, Math.random() * 0.5); src.stop(t + 0.03);
}

// a bent flapper springing free off a peg: a short rubbery boing
export function slip(pan) {
  if (!live()) return;
  const t = ctx.currentTime, osc = ctx.createOscillator(), g = ctx.createGain();
  osc.frequency.setValueAtTime(mtof(deg(7, 62)), t);
  osc.frequency.exponentialRampToValueAtTime(mtof(deg(2, 62)), t + 0.12);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.07, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  osc.connect(g).connect(out('sfx', pan, 0.1));
  osc.start(t); osc.stop(t + 0.25);
}

// release / SPIN: filtered noise sweeping up
export function whoosh() {
  if (!live()) return;
  const t = ctx.currentTime, src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = noise;
  bp.type = 'bandpass'; bp.Q.value = 2;
  bp.frequency.setValueAtTime(300, t);
  bp.frequency.exponentialRampToValueAtTime(3200, t + 0.35);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.18, t + 0.06);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
  src.connect(bp).connect(g).connect(out('sfx', 0, 0.3));
  src.start(t); src.stop(t + 0.5);
}

// slide whistle: a sine gliding between two Dorian notes with a little wobble
function whistle(from, to, dur, pan, peak = 0.09) {
  const t = ctx.currentTime, osc = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), depth = ctx.createGain();
  osc.frequency.setValueAtTime(mtof(deg(from, 62)), t);
  osc.frequency.exponentialRampToValueAtTime(mtof(deg(to, 62)), t + dur);
  lfo.frequency.value = 7; depth.gain.value = 14;
  lfo.connect(depth).connect(osc.detune);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.03);
  g.gain.setTargetAtTime(0, t + dur - 0.05, 0.04);
  osc.connect(g).connect(out('sfx', pan, 0.25));
  osc.start(t); lfo.start(t); osc.stop(t + dur + 0.2); lfo.stop(t + dur + 0.2);
}

// knockout: flung off the rim, the whistle falls
export function eject(pan) { if (live()) whistle(12, 0, 0.55, pan); }

// landing on the bench: a soft low thump
export function thud() {
  if (!live()) return;
  const t = ctx.currentTime, osc = ctx.createOscillator(), g = ctx.createGain();
  osc.frequency.setValueAtTime(120, t);
  osc.frequency.exponentialRampToValueAtTime(45, t + 0.15);
  g.gain.setValueAtTime(0.3, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
  osc.connect(g).connect(out('sfx', 0, 0.05));
  osc.start(t); osc.stop(t + 0.3);
}

// comeback: the whistle rises, then a sparkle of bells up the scale
export function comeback(pan) {
  if (!live()) return;
  whistle(0, 12, 0.45, pan);
  const t = ctx.currentTime + 0.4;
  [7, 9, 11, 14].forEach((d, k) => strike('sfx', mtof(deg(d, 74)), t + k * 0.06, { partials: BELL, decay: 1.2, peak: 0.08, pan, send: 0.5 }));
}

// a peg snapping: a dry crack, a high ping, the cap bouncing away in tinkles
export function snap(pan) {
  if (!live()) return;
  const t = ctx.currentTime, src = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = noise;
  hp.type = 'highpass'; hp.frequency.value = 1800;
  g.gain.setValueAtTime(0.32, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  src.connect(hp).connect(g).connect(out('sfx', pan, 0.2));
  src.start(t, Math.random() * 0.5); src.stop(t + 0.08);
  strike('sfx', mtof(deg(14, 74)), t + 0.01, { partials: BELL, decay: 0.9, peak: 0.09, pan, send: 0.4 });
  [0.18, 0.32, 0.42].forEach((d, k) => strike('sfx', mtof(deg(11 - k, 74)), t + d, { partials: MARIMBA, decay: 0.15, peak: 0.05 / (k + 1), pan: pan + 0.3, send: 0.2 }));
}

// a new peg screwed onto the stub: a ratchet, then a plink
export function fix(pan) {
  if (!live()) return;
  const t = ctx.currentTime;
  for (let k = 0; k < 4; k++) {
    const src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain(), s = t + k * 0.06;
    src.buffer = noise;
    bp.type = 'bandpass'; bp.frequency.value = 2800; bp.Q.value = 4;
    g.gain.setValueAtTime(0.12, s);
    g.gain.exponentialRampToValueAtTime(0.0001, s + 0.025);
    src.connect(bp).connect(g).connect(out('sfx', pan, 0.1));
    src.start(s, Math.random() * 0.5); src.stop(s + 0.03);
  }
  strike('sfx', mtof(deg(9, 74)), t + 0.28, { partials: BELL, decay: 1, peak: 0.1, pan, send: 0.4 });
}

// Teeter: the wheel creaking on the tip of a peg, a two-note see-saw that slows, then the tip lands
export function teeter(pan) {
  if (!live()) return;
  const t = ctx.currentTime;
  [5, 6, 5, 6, 5].forEach((d, k) => strike('sfx', mtof(deg(d, 74)), t + k * 0.14 + k * k * 0.012, { partials: MARIMBA, decay: 0.3, peak: 0.07, pan, send: 0.2 }));
  strike('sfx', mtof(deg(2, 74)), t + 0.85, { partials: BELL, decay: 1.4, peak: 0.1, pan, send: 0.45 });
}

// Kickback: a rubbery boing as the flapper catches a peg, then a clack back
export function kickback(pan) {
  if (!live()) return;
  const t = ctx.currentTime, osc = ctx.createOscillator(), g = ctx.createGain();
  osc.frequency.setValueAtTime(mtof(deg(2, 62)), t);
  osc.frequency.exponentialRampToValueAtTime(mtof(deg(9, 62)), t + 0.1);
  osc.frequency.exponentialRampToValueAtTime(mtof(deg(4, 62)), t + 0.3);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.13, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
  osc.connect(g).connect(out('sfx', pan, 0.2));
  osc.start(t); osc.stop(t + 0.45);
  strike('sfx', mtof(deg(7, 74)), t + 0.05, { partials: MARIMBA, decay: 0.25, peak: 0.1, pan, send: 0.2 });
}

// Gust: a breath of wind swelling and passing, with a chime riding it
export function gust(pan) {
  if (!live()) return;
  const t = ctx.currentTime, src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = noise; src.loop = true;
  bp.type = 'bandpass'; bp.Q.value = 1.6;
  bp.frequency.setValueAtTime(400, t);
  bp.frequency.exponentialRampToValueAtTime(1800, t + 0.45);
  bp.frequency.exponentialRampToValueAtTime(500, t + 1);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.2, t + 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.05);
  src.connect(bp).connect(g).connect(out('sfx', pan, 0.4));
  src.start(t); src.stop(t + 1.1);
  [9, 11, 14].forEach((d, k) => strike('sfx', mtof(deg(d, 74)), t + 0.25 + k * 0.1, { partials: BELL, decay: 1, peak: 0.05, pan: k - 1, send: 0.6 }));
}

// the wheel's air: looping noise whose pitch and level follow the wheel speed (rad/s); 0 fades it out
let air = null;
export function whirr(speed) {
  if (!ctx || (!air && !speed)) return;
  const t = ctx.currentTime;
  if (!air) {
    const src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noise; src.loop = true;
    bp.type = 'bandpass'; bp.Q.value = 3;
    g.gain.value = 0;
    src.connect(bp).connect(g).connect(out('sfx', 0, 0.1));
    src.start(t);
    air = { src, bp, g };
  }
  air.bp.frequency.setTargetAtTime(300 + speed * 110, t, 0.05);
  air.g.gain.setTargetAtTime(Math.min(0.09, speed * 0.004), t, 0.08);
  if (!speed) { const a = air; air = null; a.src.stop(t + 0.5); }
}

// joker roulette: one tick per spotlight step, walking up the scale
export function spot(k) {
  if (!live()) return;
  strike('sfx', mtof(deg(k % 7, 74)), ctx.currentTime, { partials: MARIMBA, decay: 0.22, peak: 0.09, send: 0.15 });
}

// joker swap: snare roll swelling over `dur` s (hold + flight), then a Dorian IV -> i cadence (G major -> D minor) on landing
export function swap(dur = 0.42) {
  if (!live()) return;
  const t = ctx.currentTime, n = Math.max(12, Math.round(dur / 0.045));
  for (let k = 0; k < n; k++) {
    const src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain(), s = t + dur * (k / n) ** 0.85; // hits tighten toward the landing
    src.buffer = noise;
    bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 0.9;
    g.gain.setValueAtTime(0.02 + 0.15 * (k / n) ** 1.6, s);
    g.gain.exponentialRampToValueAtTime(0.0001, s + 0.06);
    src.connect(bp).connect(g).connect(out('sfx', 0, 0.3));
    src.start(s, Math.random() * 0.5); src.stop(s + 0.07);
  }
  [67, 71, 74].forEach((m, k) => strike('sfx', mtof(m), t + dur + k * 0.03, { partials: BELL, decay: 1.6, peak: 0.1, pan: k - 1, send: 0.5 }));
  [62, 65, 69, 74].forEach((m, k) => strike('sfx', mtof(m), t + dur + 0.5 + k * 0.04, { partials: BELL, decay: 3.2, peak: 0.11, pan: (k - 1.5) / 2, send: 0.6 }));
}
