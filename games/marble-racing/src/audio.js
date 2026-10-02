// Web Audio synth — every sound generated at runtime, tuned to D Dorian (the white keys from D).
// Graph: voice -> [pan] -> bus(music|sfx) -> master -> compressor -> limiter -> out (music bus through a low-pass,
//                       \-> wet(music|sfx) -> convolver reverb -> master       swept down for the photo finish)

const DORIAN = [0, 2, 3, 5, 7, 9, 10];
const mtof = m => 440 * 2 ** ((m - 69) / 12);
const deg = (d, root = 62) => root + 12 * Math.floor(d / 7) + DORIAN[((d % 7) + 7) % 7];

// partial tables: [frequency ratio, amplitude, decay scale]
const BELL = [[1, 1, 1], [2, 0.28, 0.6], [2.76, 0.3, 0.45], [5.4, 0.1, 0.22], [8.93, 0.04, 0.12]];
const MARIMBA = [[1, 1, 1], [3.99, 0.28, 0.18], [10.1, 0.05, 0.06]];

let ctx = null, master, verb, noise, musicLp;
const bus = {}, wet = {};
const level = { music: 0.5, sfx: 0.8 };
const TRIM = { music: 0.25, sfx: 1 }; // music sits under sfx: slider 50 ≈ -3 dB below the old default of 30

let ducked = false;
const DUCK = 0.4; // ≈ -8 dB on music while animals run

// iOS 17+: 'playback' plays through the silent switch (Web Audio follows it otherwise). It also pauses other apps'
// music, so with both sliders at 0 the game hands the speaker back ('ambient'). ponytail: older iOS has no
// audioSession and keeps following the switch; the silent-<audio> unlock hack would cover it if that matters
const session = () => {
  const want = level.music || level.sfx ? 'playback' : 'ambient';
  try { if (navigator.audioSession && navigator.audioSession.type !== want) navigator.audioSession.type = want; } catch { /* not allowed in a frame */ }
};

export function setVolume(kind, v, tau = 0.05) {
  level[kind] = v;
  if (!ctx) return;
  session(); // init() comes through here too, once the context exists
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
  // iOS leaves a context 'interrupted' (not 'suspended') after a call, Siri or another app's audio
  if (ctx) { if (ctx.state !== 'running' && !document.hidden) ctx.resume().catch(() => {}); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC({ latencyHint: 'interactive' });

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 3;
  comp.attack.value = 0.005; comp.release.value = 0.3;
  master = ctx.createGain();
  master.gain.value = 0.85;
  // a brick-wall limiter after the glue compressor: the busiest moment (20 marbles in a peg field and a landing)
  // stays under -1 dBFS
  const lim = ctx.createDynamicsCompressor();
  lim.threshold.value = -3; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.12;
  master.connect(comp).connect(lim).connect(ctx.destination);

  verb = ctx.createConvolver();
  verb.buffer = impulse(3.2, 2.6);
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass'; tone.frequency.value = 5200;
  verb.connect(tone).connect(master);

  musicLp = ctx.createBiquadFilter();
  musicLp.type = 'lowpass'; musicLp.frequency.value = 20000; musicLp.Q.value = 0.5;
  musicLp.connect(master);
  for (const k of ['music', 'sfx']) {
    bus[k] = ctx.createGain(); bus[k].connect(k === 'music' ? musicLp : master);
    wet[k] = ctx.createGain(); wet[k].connect(verb);
    setVolume(k, level[k]);
  }

  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}

export function pause(hidden) {
  if (ctx) (hidden ? ctx.suspend() : ctx.resume()).catch(() => {}); // iOS may refuse a resume without a tap; init() retries on the next one
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
    if (freq * ratio > 16000) continue; // a high bell's upper partials: inaudible, and above Nyquist they alias
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
  // the race: a driving 150 BPM loop in D Dorian, galloping bass, a soaring lead that holds its phrase ends
  // (2-4 beats) and leans on the Dorian B natural over G
  race: {
    bpm: 150,
    prog: [[38, DM], [36, C], [38, DM], [43, G], [41, F], [36, C], [43, G], [45, AM]],
    hook: [
      [[74, 0, 1], [77, 1, 1], [81, 2, 2]],
      [[79, 0, 0.5], [76, 0.5, 0.5], [72, 1, 3]],
      [[74, 0, 1], [77, 1, 1], [81, 2, 1], [83, 3, 1]],
      [[86, 0, 4]],
      [[84, 0, 1], [81, 1, 1], [77, 2, 2]],
      [[79, 0, 1], [76, 1, 1], [72, 2, 2]],
      [[71, 0, 1], [74, 1, 1], [79, 2, 1], [83, 3, 1]],
      [[81, 0, 4]],
    ],
    lead: [0.5, 0.25], leadPeak: 0.034, arp: ARP16, bass: range(8).map(k => [k / 2, k % 4 === 2 ? 12 : k % 4 === 3 ? 7 : 0, 0.4]),
    kick: [0, 1, 2, 3], fill: [3.5], snare: [1, 3], hat: [0.5, 1.5, 2.5, 3.5], open: 3.5,
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
  const [root, tones] = S.prog[i], d = S.drum ?? 1;
  for (const [b, j, oct, len] of S.arp) {
    chip(tones[j % tones.length] + 12 * (oct + alt), at(b), len * B, { wave: S.arpWave ?? 0.25, peak: S.arpPeak ?? 0.02, pan: -0.4, send: 0.06 });
  }
  for (const [b, semi, len] of S.bass) chip(root + semi, at(b), len * B, { wave: 'triangle', peak: 0.15, send: 0 });
  for (const [m, b, len] of S.hook[i]) {
    chip(m, at(b), len * B * 0.92, { wave: S.lead[alt], peak: S.leadPeak ?? 0.038, pan: 0.15, send: 0.18, vib: len >= 1.5, delay: true });
  }
  for (const b of i % 4 === 3 ? [...S.kick, ...S.fill ?? []] : S.kick) kick(at(b), d); // fill into each phrase
  for (const b of S.snare ?? []) hit(at(b), { freq: 1800, peak: 0.13 * d, decay: 0.13 });
  for (const b of S.hat) hit(at(b), { freq: 7500, type: 'highpass', peak: (b === S.open ? 0.05 : 0.03) * d, decay: b === S.open ? 0.14 : 0.035, pan: 0.3 });
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

// each rung crossed climbs one Dorian step
export function step(n, pan) {
  if (!live()) return;
  strike('sfx', mtof(deg(n % 10, 74)), ctx.currentTime, { partials: MARIMBA, decay: 0.6, peak: 0.16, pan, send: 0.3 });
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

// wormhole: filtered-noise swoosh + shimmering Dorian run, rising when lifted, falling when dropped
export function warp(up, pan) {
  if (!live()) return;
  const t = ctx.currentTime, dur = 0.7;
  const src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = noise;
  bp.type = 'bandpass'; bp.Q.value = 6;
  bp.frequency.setValueAtTime(up ? 250 : 3800, t);
  bp.frequency.exponentialRampToValueAtTime(up ? 3800 : 250, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.2, t + 0.15);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp).connect(g).connect(out('sfx', pan, 0.6));
  src.start(t); src.stop(t + dur + 0.05);
  for (let k = 0; k < 8; k++) {
    strike('sfx', mtof(deg(up ? k : 14 - k * 2, 62)), t + k * 0.07, { partials: BELL, decay: 1.2, peak: 0.07, pan, send: 0.6 });
  }
}

// carousel: ratchet clicks winding round, over a Dorian arpeggio that circles back up to the octave
export function spin(n, pan) {
  if (!live()) return;
  const t = ctx.currentTime;
  for (let k = 0; k < 5; k++) {
    const src = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain(), s = t + k * 0.055;
    src.buffer = noise;
    hp.type = 'highpass'; hp.frequency.value = 3200 + k * 400;
    g.gain.setValueAtTime(0.12, s);
    g.gain.exponentialRampToValueAtTime(0.0001, s + 0.03);
    src.connect(hp).connect(g).connect(out('sfx', pan, 0.15));
    src.start(s, Math.random() * 0.5); src.stop(s + 0.04);
  }
  [0, 2, 4, 7].forEach((d, k) =>
    strike('sfx', mtof(deg(n % 7 + d, 62)), t + 0.05 + k * 0.08, { partials: MARIMBA, decay: 0.7, peak: 0.12, pan, send: 0.35 }));
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

// ---------- race voices (all diatonic to D Dorian) ----------
// filtered-noise sweep from f0 to f1 Hz over dur s
function whoosh(t, f0, f1, dur, peak, pan = 0, q = 1.2, send = 0.35) {
  const src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = noise; src.loop = true;
  bp.type = 'bandpass'; bp.Q.value = q;
  bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp).connect(g).connect(out('sfx', pan, send));
  src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
}

// 3, 2, 1: a marimba tick on degree 4 (A) with its lower octave; GO (k = 0): a bell stack on degrees 0, 2, 4, 7 and a
// rising whoosh
export function countdown(k) {
  if (!live()) return;
  const t = ctx.currentTime;
  if (k > 0) {
    strike('sfx', mtof(deg(4, 74)), t, { partials: MARIMBA, decay: 0.45, peak: 0.15, send: 0.2 });
    strike('sfx', mtof(deg(4, 62)), t, { partials: MARIMBA, decay: 0.35, peak: 0.07, send: 0.15 });
    return;
  }
  [0, 2, 4, 7].forEach((d, i) => strike('sfx', mtof(deg(d, 74)), t + i * 0.025, { partials: BELL, decay: 2.6, peak: 0.1, pan: (i - 1.5) * 0.35, send: 0.5 }));
  strike('sfx', mtof(50), t, { partials: BELL, decay: 2, peak: 0.12, send: 0.4 });
  whoosh(t, 250, 3200, 0.6, 0.16);
}

// the rolling bed: one looped noise through a band-pass for every marble at once. rollLevel() follows the summed speed
// (0..1, smoothed over 80 ms) and moves the band with the mean speed (200 -> 900 Hz); muffled while the followed
// marble is in the mist tube
let rollSrc = null, rollBp = null, rollLp = null, rollG = null, rollAt = 0;
export function roll(on) {
  if (!ctx) return;
  const t = ctx.currentTime;
  if (on && !rollSrc) {
    rollSrc = ctx.createBufferSource(); rollSrc.buffer = noise; rollSrc.loop = true;
    rollBp = ctx.createBiquadFilter(); rollBp.type = 'bandpass'; rollBp.Q.value = 0.9; rollBp.frequency.value = 300;
    rollLp = ctx.createBiquadFilter(); rollLp.type = 'lowpass'; rollLp.frequency.value = 9000;
    rollG = ctx.createGain(); rollG.gain.value = 0;
    rollSrc.connect(rollBp).connect(rollLp).connect(rollG).connect(out('sfx', 0, 0.08));
    rollSrc.start();
  } else if (!on && rollSrc) {
    const s = rollSrc;
    rollG.gain.setTargetAtTime(0, t, 0.15);
    setTimeout(() => s.stop(), 900);
    rollSrc = null;
  }
}
export function rollLevel(level, speed, muffled) {
  if (!rollSrc || !live()) return;
  const t = ctx.currentTime;
  // 20 updates a second, not one per frame: the glides are 80-150 ms anyway, and each call is another automation event
  // (three a frame piled up on Safari's timelines over a long race)
  if (t - rollAt < 0.05) return;
  rollAt = t;
  rollG.gain.setTargetAtTime(0.11 * Math.min(1, level), t, 0.08);
  rollBp.frequency.setTargetAtTime(200 + 700 * Math.min(1, speed), t, 0.08);
  rollLp.frequency.setTargetAtTime(muffled ? 650 : 9000, t, 0.15);
}

// glass marble on glass marble: a high, very short bell tick (degrees 7-11), louder for a harder knock; at most 15 a second
let clackT = [];
export function clack(pan, v) {
  if (!live()) return;
  const now = ctx.currentTime;
  clackT = clackT.filter(x => now - x < 1);
  if (clackT.length >= 15) return;
  clackT.push(now);
  const d = 7 + Math.floor(Math.random() * 5);
  strike('sfx', mtof(deg(d, 74)), now, { partials: BELL, decay: 0.12, peak: Math.min(0.12, 0.02 + v * 0.012), pan, send: 0.15 });
}

// boost pad: a quick pulse-wave run up degrees 0 -> 7 in a quarter second
export function boost(pan) {
  if (!live()) return;
  const t = ctx.currentTime;
  for (let k = 0; k < 8; k++) {
    const o = out('sfx', pan, 0.2), g = ctx.createGain(), osc = ctx.createOscillator(), s = t + k * 0.031;
    osc.setPeriodicWave(pulse(0.25)); osc.frequency.value = mtof(deg(k, 74));
    g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(0.05, s + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.09);
    osc.connect(g).connect(o); osc.start(s); osc.stop(s + 0.1);
  }
}

// jump: a soft sine whoop gliding up a fifth (D -> A) and back
export function jump(pan) {
  if (!live()) return;
  const t = ctx.currentTime, o = out('sfx', pan, 0.3), g = ctx.createGain(), osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(mtof(deg(0, 74)), t);
  osc.frequency.exponentialRampToValueAtTime(mtof(deg(4, 74)), t + 0.16);
  osc.frequency.exponentialRampToValueAtTime(mtof(deg(0, 74)), t + 0.36);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.11, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
  osc.connect(g).connect(o); osc.start(t); osc.stop(t + 0.45);
}

// boomerang: a slide whistle up the wall (D up the octave), a hang with a bell at the top, and the slide back down;
// each later swing (n) starts a Dorian step higher and a little softer; at most 4 a second (a crowd hits the wall together)
let boomT = [];
export function boomerang(pan, n = 1) {
  if (!live()) return;
  const t = ctx.currentTime;
  boomT = boomT.filter(x => t - x < 1);
  if (boomT.length >= 4) return;
  boomT.push(t);
  const k = Math.min(n, 7) - 1, v = n > 1 ? 0.06 : 0.09, o = out('sfx', pan, 0.3), g = ctx.createGain(), osc = ctx.createOscillator(), lo = mtof(deg(k, 62)), hi = mtof(deg(k + 7, 62));
  osc.type = 'sine';
  osc.frequency.setValueAtTime(lo, t);
  osc.frequency.exponentialRampToValueAtTime(hi, t + 0.32);
  osc.frequency.setValueAtTime(hi, t + 0.44);
  osc.frequency.exponentialRampToValueAtTime(lo, t + 0.82);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.05); g.gain.setValueAtTime(v, t + 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.88);
  osc.connect(g).connect(o); osc.start(t); osc.stop(t + 0.9);
  strike('sfx', mtof(deg(k + 7, 74)), t + 0.32, { partials: BELL, decay: 0.9, peak: v * 0.66, pan, send: 0.5 });
}

// trap pad: a falling "wah-wah-waah" (A, F, then a D that sags) on a soft triangle, as a marble is flicked off the course
export function trap(pan) {
  if (!live()) return;
  const t = ctx.currentTime;
  [4, 2, 0].forEach((d, k) => {
    const s = t + k * 0.14, last = k === 2, f = mtof(deg(d, 62)), o = out('sfx', pan, 0.25), g = ctx.createGain(), osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f, s);
    if (last) osc.frequency.exponentialRampToValueAtTime(f * 0.94, s + 0.42);
    g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(0.1, s + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, s + (last ? 0.46 : 0.13));
    osc.connect(g).connect(o); osc.start(s); osc.stop(s + 0.5);
  });
}

// mud: a wet plop, a sine sinking A3 -> D2 under a short low squelch of noise; at most 6 a second
let mudT = [];
export function mud(pan) {
  if (!live()) return;
  const t = ctx.currentTime;
  mudT = mudT.filter(x => t - x < 1);
  if (mudT.length >= 6) return;
  mudT.push(t);
  const o = out('sfx', pan, 0.1), g = ctx.createGain(), osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(mtof(deg(4, 50)), t); osc.frequency.exponentialRampToValueAtTime(mtof(deg(0, 38)), t + 0.14);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.13, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  osc.connect(g).connect(o); osc.start(t); osc.stop(t + 0.22);
  whoosh(t, 1100, 220, 0.2, 0.06, pan, 2.5, 0.1);
}

// mist tube: an airy filtered-noise breath, sinking on the way in, rising on the way out
export function mist(entering, pan) {
  if (!live()) return;
  const t = ctx.currentTime;
  whoosh(t, entering ? 2400 : 700, entering ? 700 : 2400, 0.9, 0.09, pan, 2.5, 0.6);
  strike('sfx', mtof(deg(entering ? 5 : 7, 74)), t + 0.1, { partials: BELL, decay: 1.6, peak: 0.045, pan, send: 0.7 });
}

// photo finish: a slow time-stretch whoosh, two heartbeat kicks, a long held high bell, the music low-passed meanwhile
export function photo() {
  if (!live()) return;
  const t = ctx.currentTime;
  whoosh(t, 3600, 300, 1.3, 0.14, 0, 1, 0.5);
  for (const k of [0.15, 0.45]) {
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.frequency.setValueAtTime(90, t + k); osc.frequency.exponentialRampToValueAtTime(40, t + k + 0.14);
    g.gain.setValueAtTime(0.3, t + k); g.gain.exponentialRampToValueAtTime(0.0001, t + k + 0.22);
    osc.connect(g).connect(out('sfx', 0, 0)); osc.start(t + k); osc.stop(t + k + 0.25);
  }
  strike('sfx', mtof(deg(11, 74)), t + 0.2, { partials: BELL, decay: 3.4, peak: 0.07, send: 0.7 });
  musicLp.frequency.cancelScheduledValues(t);
  musicLp.frequency.setValueAtTime(musicLp.frequency.value, t);
  musicLp.frequency.exponentialRampToValueAtTime(500, t + 0.25);
  musicLp.frequency.exponentialRampToValueAtTime(20000, t + 1.6);
}
