// Web Audio synth — every sound generated at runtime, tuned to D Dorian (the white keys from D).
// Ported from Ladder Game; Animal Racing adds the track songs, race sfx and engine voices.
// Graph: voice -> [pan] -> bus(music|sfx) -> master -> compressor -> out
//                       \-> wet(music|sfx) -> convolver reverb -> master

const DORIAN = [0, 2, 3, 5, 7, 9, 10];
const mtof = m => 440 * 2 ** ((m - 69) / 12);
const deg = (d, root = 62) => root + 12 * Math.floor(d / 7) + DORIAN[((d % 7) + 7) % 7];

// partial tables: [frequency ratio, amplitude, decay scale]
const BELL = [[1, 1, 1], [2, 0.28, 0.6], [2.76, 0.3, 0.45], [5.4, 0.1, 0.22], [8.93, 0.04, 0.12]];
const MARIMBA = [[1, 1, 1], [3.99, 0.28, 0.18], [10.1, 0.05, 0.06]];
const KKWAENG = [[1, 1, 1], [1.42, 0.6, 0.8], [2.13, 0.45, 0.6], [2.87, 0.3, 0.5], [3.95, 0.18, 0.35]]; // small brass gong: bright, inharmonic
const JING = [[1, 1, 1], [2.01, 0.45, 0.7], [2.98, 0.25, 0.5], [4.12, 0.12, 0.3]]; // big gong: a long low bloom

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
// D minor pentatonic (D F G A C) stacks for the Korean festival song: no E or B, so nothing leaves the mode
const PD = [62, 65, 69], PF = [65, 69, 72], PC = [60, 62, 67], PG = [67, 72, 74], PA = [69, 72, 74];
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
  // Toy Diorama Speedway: `win` reworked for racing, every 4-bar phrase holds two notes of 2+ beats (delayed vibrato),
  // the arps carry the motion, the loop lands on a 4-beat hold
  toy: {
    bpm: 132,
    prog: [[38, DM], [36, C], [43, G], [38, DM], [38, DM], [36, C], [43, G], [45, AM]],
    hook: [
      [[74, 0, 1], [77, 1, 0.5], [81, 1.5, 2.5]],
      [[79, 0, 1], [76, 1, 0.5], [72, 1.5, 2.5]],
      [[71, 0, 1], [74, 1, 1], [79, 2, 2]],
      [[81, 0, 4]],
      [[86, 0, 2], [84, 2, 1], [81, 3, 1]],
      [[79, 0, 1], [76, 1, 1], [79, 2, 2]],
      [[83, 0, 1.5], [81, 1.5, 0.5], [79, 2, 1], [74, 3, 1]],
      [[76, 0, 4]],
    ],
    lead: [0.5, 0.125], arp: ARP16, bass: range(8).map(k => [k / 2, k % 2 ? 12 : 0, 0.425]),
    kick: [0, 2], fill: [2.5], snare: [1, 3], hat: range(8).map(k => k / 2), open: 3.5,
  },
  // Neon Arcade Circuit: Ladder's `rank` racer (four-on-the-floor, galloping bass, running lead), the lead reworked
  // round held tones (two 2-beat holds per phrase) and the loop landing on a 4-beat hold
  neon: {
    bpm: 152,
    prog: [[38, DM], [36, C], [38, DM], [36, C], [41, F], [43, G], [45, AM], [43, G]],
    hook: [
      [[74, 0, 0.5], [76, 0.5, 0.5], [77, 1, 1], [81, 2, 2]],
      [[79, 0, 1], [76, 1, 1], [72, 2, 2]],
      [[74, 0, 0.5], [77, 0.5, 0.5], [81, 1, 1], [86, 2, 2]],
      [[84, 0, 2], [79, 2, 2]],
      [[77, 0, 1], [81, 1, 1], [84, 2, 2]],
      [[83, 0, 2], [79, 2, 2]],
      [[76, 0, 1], [72, 1, 1], [69, 2, 2]],
      [[74, 0, 4]],
    ],
    lead: [0.5, 0.25], arp: ARP16, bass: range(8).map(k => [k / 2, k % 4 === 2 ? 12 : 0, 0.4]),
    kick: [0, 1, 2, 3], fill: [3.5], snare: [1, 3], hat: [0.5, 1.5, 2.5, 3.5], open: 3.5,
  },
  // Storybook Meadow: a folk dance in 2/4 (two to a bar here) at 140 bpm, oom-pah bass and off-beat stabs from Ladder's
  // `team`, a marimba-ish triangle lead on long held notes
  story: {
    bpm: 140,
    prog: [[38, DM], [43, G], [38, DM], [45, AM], [41, F], [36, C], [43, G], [38, DM]],
    hook: [
      [[74, 0, 1], [76, 1, 1], [77, 2, 2]],
      [[79, 0, 2], [76, 2, 2]],
      [[74, 0, 1], [72, 1, 1], [69, 2, 2]],
      [[69, 0, 2], [72, 2, 2]],
      [[77, 0, 1], [81, 1, 1], [84, 2, 2]],
      [[79, 0, 2], [76, 2, 2]],
      [[74, 0, 1], [76, 1, 1], [79, 2, 2]],
      [[74, 0, 4]],
    ],
    lead: ['triangle', 'triangle'], leadPeak: 0.075, arp: [...stab(0.5, 0.25), ...stab(1.5, 0.25), ...stab(2.5, 0.25), ...stab(3.5, 0.25)], arpWave: 0.25, arpPeak: 0.016,
    bass: [[0, 0, 0.45], [1, 7, 0.45], [2, 0, 0.45], [3, 7, 0.45]],
    kick: [0, 2], snare: [1, 3], hat: [0.5, 1.5, 2.5, 3.5], drum: 0.7,
  },
  // Festival Night: a pungmul street-band tune. Gutgeori-style 12/8 (4 dotted beats a bar, each split in 3) at 112.
  // Melody in gyemyeonjo on D (D F G A C, the minor pentatonic inside D Dorian) on a breathy daegeum-like flute: long
  // holds that scoop up into the note, a wide vibrato that deepens, and a fall off the end of each phrase. Plucked
  // gayageum arps, an ajaeng-like octave drone, buk + janggu (deep "kung", dry "deok"), kkwaenggwari on the triplets,
  // a jing gong every other bar; the loop lands on a 4-beat hold
  fest: {
    bpm: 112, echo: 2 / 3,
    prog: [[38, PD], [38, PD], [41, PF], [36, PC], [38, PD], [43, PG], [45, PA], [38, PD]],
    hook: [
      [[69, 0, 2 / 3], [72, 2 / 3, 1 / 3], [74, 1, 3]],
      [[72, 0, 2 / 3], [69, 2 / 3, 1 / 3], [67, 1, 1], [69, 2, 2]],
      [[72, 0, 1], [74, 1, 2 / 3], [77, 5 / 3, 1 / 3], [79, 2, 2]],
      [[77, 0, 2 / 3], [74, 2 / 3, 1 / 3], [72, 1, 3]],
      [[74, 0, 2 / 3], [77, 2 / 3, 1 / 3], [79, 1, 1], [81, 2, 2]],
      [[79, 0, 2 / 3], [77, 2 / 3, 1 / 3], [74, 1, 1], [79, 2, 2]],
      [[81, 0, 1], [79, 1, 2 / 3], [77, 5 / 3, 1 / 3], [72, 2, 2]],
      [[74, 0, 4]],
    ],
    lead: ['triangle', 'triangle'], leadPeak: 0.07, orn: { att: 0.05, sus: 0.85, vibHz: 5, vibCents: 40, vibRamp: 0.8, scoop: 1.5, fall: 2, breath: 0.6 },
    arp: [0, 2 / 3, 1, 5 / 3, 2, 7 / 3, 8 / 3, 3, 11 / 3].map((b, k) => [b, [0, 2, 1, 2, 0, 1, 2, 1, 2][k], 0, 0.6]), arpWave: 0.25, arpPeak: 0.03, arpPluck: 0.16,
    bass: [[0, 0, 1.9], [2, 12, 1.9]],
    kick: [0, 2], fill: [10 / 3, 11 / 3], toms: [1, 7 / 3, 3], crack: [0, 2 / 3, 5 / 3, 8 / 3, 10 / 3],
    gong: [0, 2 / 3, 1, 5 / 3, 2, 8 / 3, 3, 10 / 3, 11 / 3], jing: 2, hat: [], drum: 0.85,
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
let timer = 0, nextT = 0, bar = 0, echo = null, mix = null, song = SONGS.win, tempo = 1;
// final lap: the same song, a touch faster from the next bar (key stays D Dorian)
export const setTempo = m => { tempo = m; };

export function setMusic(preset) {
  const s = SONGS[preset] || SONGS.custom;
  if (s === song) return;
  song = s; bar = 0; tempo = 1;
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
  echo.delayTime.value = (song.echo ?? 0.75) * 60 / song.bpm;
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

// att / sus: attack time and sustain level (a blown flute swells in and holds); pluck: decay time constant instead of a
// sustain (a plucked zither). Korean ornaments on held notes: scoop up into the note from below, a wide vibrato that
// deepens over vibRamp seconds, fall away at the end; breath: pitched noise under the tone
function chip(m, t, dur, { wave = 0.5, peak, pan = 0, send = 0.1, vib = false, delay = false, att = 0.004, sus = 0.65, pluck = 0,
  vibHz = 6, vibCents = 18, vibRamp = 0.35, scoop = 0, fall = 0, breath = 0 }) {
  const o = out('music', pan, send), g = ctx.createGain(), osc = ctx.createOscillator(), end = t + dur;
  wave === 'triangle' ? (osc.type = 'triangle') : osc.setPeriodicWave(pulse(wave));
  osc.frequency.value = mtof(m);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + att);
  if (pluck) g.gain.setTargetAtTime(0, t + att, pluck);
  else g.gain.setTargetAtTime(peak * sus, t + att + 0.016, 0.07); // chip-style drop to sustain
  g.gain.setTargetAtTime(0, end - 0.015, 0.012);
  osc.connect(g).connect(o);
  if (delay) g.connect(echo);
  if (scoop) { osc.detune.setValueAtTime(-100 * scoop, t); osc.detune.linearRampToValueAtTime(0, t + 0.14); }
  if (fall) { const f0 = Math.max(t + 0.15, end - Math.min(0.45, dur * 0.3)); osc.detune.setValueAtTime(0, f0); osc.detune.linearRampToValueAtTime(-100 * fall, end); }
  if (vib) { // delayed vibrato on held notes
    const lfo = ctx.createOscillator(), depth = ctx.createGain();
    lfo.frequency.value = vibHz;
    depth.gain.setValueAtTime(0, t);
    depth.gain.linearRampToValueAtTime(vibCents, t + vibRamp);
    lfo.connect(depth).connect(osc.detune);
    lfo.start(t); lfo.stop(end + 0.1);
  }
  if (breath) {
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), bg = ctx.createGain();
    src.buffer = noise; src.loop = true;
    f.type = 'bandpass'; f.frequency.value = mtof(m) * 2; f.Q.value = 4;
    bg.gain.setValueAtTime(0, t);
    bg.gain.linearRampToValueAtTime(peak * breath, t + att);
    bg.gain.setTargetAtTime(peak * breath * 0.35, t + att, 0.12);
    bg.gain.setTargetAtTime(0, end - 0.015, 0.012);
    src.connect(f).connect(bg).connect(o);
    src.start(t, Math.random() * 0.5); src.stop(end + 0.1);
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

function tom(t, v = 1) {
  const osc = ctx.createOscillator(), g = ctx.createGain();
  osc.frequency.setValueAtTime(mtof(deg(0, 50)), t);
  osc.frequency.exponentialRampToValueAtTime(mtof(deg(-3, 50)), t + 0.18);
  g.gain.setValueAtTime(0.28 * v, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
  osc.connect(g).connect(out('music', 0, 0.15));
  osc.start(t); osc.stop(t + 0.4);
  hit(t, { freq: 900, q: 1.2, peak: 0.05 * v, decay: 0.05 });
}
// phrase ends (every 4th bar), in AudioContext time: the festival fires its fireworks on them
export const phraseEnds = [];
export const now = () => ctx ? ctx.currentTime : 0;
function scheduleBar(t) {
  const S = song, B = 60 / (S.bpm * tempo), n = S.prog.length, i = bar % n, alt = ((bar / n) | 0) % 2; // every other loop: other lead duty, arp an octave up
  bar++;
  const at = b => t + (S.swing && b % 1 === 0.5 ? b + 1 / 6 : b) * B; // swing pushes off-beat 8ths to the triplet
  const [root, tones] = S.prog[i], d = S.drum ?? 1;
  for (const [b, j, oct, len] of S.arp) {
    chip(tones[j % tones.length] + 12 * (oct + alt), at(b), len * B, { wave: S.arpWave ?? 0.25, peak: S.arpPeak ?? 0.02, pan: -0.4, send: 0.06, pluck: S.arpPluck });
  }
  for (const [b, semi, len] of S.bass) chip(root + semi, at(b), len * B, { wave: 'triangle', peak: 0.15, send: 0 });
  for (const [m, b, len] of S.hook[i]) { // orn: the song's lead voice and ornaments; the fall only ends a phrase
    const held = len >= 1.5, o = S.orn;
    chip(m, at(b), len * B * 0.92, { wave: S.lead[alt], peak: S.leadPeak ?? 0.038, pan: 0.15, send: 0.18, vib: held, delay: true, ...o, scoop: held ? o?.scoop : 0, fall: held && i % 4 === 3 ? o?.fall : 0 });
  }
  for (const b of i % 4 === 3 ? [...S.kick, ...S.fill ?? []] : S.kick) kick(at(b), d); // fill into each phrase
  for (const b of S.snare ?? []) hit(at(b), { freq: 1800, peak: 0.13 * d, decay: 0.13 });
  for (const b of S.toms ?? []) tom(at(b), b % 1 ? 0.6 : 1);
  for (const b of S.crack ?? []) hit(at(b), { freq: 2800, q: 3, peak: 0.1 * d, decay: 0.06, pan: 0.2 }); // janggu stick head: a dry wooden "deok"
  for (const b of S.gong ?? []) strike('music', 1250, at(b), { partials: KKWAENG, decay: b % 1 ? 0.12 : 0.24, peak: (b % 1 ? 0.011 : 0.02) * d, pan: 0.35, send: 0.12 });
  if (S.jing && i % S.jing === 0) strike('music', mtof(50), at(0), { partials: JING, decay: 3, peak: 0.07 * d, send: 0.45 });
  if (i % 4 === 3 && phraseEnds.length < 8) phraseEnds.push(t + (S.beats ?? 4) * B);
  for (const b of S.hat) hit(at(b), { freq: 7500, type: 'highpass', peak: (b === S.open ? 0.05 : 0.03) * d, decay: b === S.open ? 0.14 : 0.035, pan: 0.3 });
}

function tick() {
  if (ctx.state !== 'running') return;
  if (nextT < ctx.currentTime) nextT = ctx.currentTime + 0.1;
  while (nextT < ctx.currentTime + 0.5) {
    if (level.music > 0.001) scheduleBar(nextT); else bar++;
    nextT += (song.beats ?? 4) * 60 / (song.bpm * tempo);
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

// ---------- race sfx (all D Dorian) ----------

// countdown: 3, 2, 1 climb the spotlight ticks; GO is the go() chord over a kick
export function count(n) {
  if (!live()) return;
  if (n > 0) { spot((3 - n) * 2); return; }
  go(0);
  const t = ctx.currentTime, osc = ctx.createOscillator(), g = ctx.createGain();
  osc.frequency.setValueAtTime(170, t);
  osc.frequency.exponentialRampToValueAtTime(42, t + 0.14);
  g.gain.setValueAtTime(0.4, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  osc.connect(g).connect(out('sfx', 0, 0.1));
  osc.start(t); osc.stop(t + 0.32);
}

// mini-turbo / dash: the go() chord plus a rising filtered-noise whoosh
export function whoosh(tier, pan) {
  if (!live()) return;
  go(tier * 2, pan);
  const t = ctx.currentTime, dur = 0.45 + tier * 0.12;
  const src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = noise;
  bp.type = 'bandpass'; bp.Q.value = 2.5;
  bp.frequency.setValueAtTime(400, t);
  bp.frequency.exponentialRampToValueAtTime(3200 + tier * 900, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.14, t + 0.06);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp).connect(g).connect(out('sfx', pan, 0.2));
  src.start(t, Math.random() * 0.4); src.stop(t + dur + 0.05);
}

// stun: three falling bell notes (deg 4, 2, 0 from D6) with a little vibrato
export function stun(pan) {
  if (!live()) return;
  const t = ctx.currentTime;
  [4, 2, 0].forEach((d, k) => {
    const f = mtof(deg(d, 86)), s0 = t + k * 0.11, o = out('sfx', pan, 0.35), osc = ctx.createOscillator(), g = ctx.createGain();
    const lfo = ctx.createOscillator(), depth = ctx.createGain();
    osc.frequency.value = f; lfo.frequency.value = 7; depth.gain.value = 22;
    lfo.connect(depth).connect(osc.detune);
    g.gain.setValueAtTime(0, s0);
    g.gain.linearRampToValueAtTime(0.09, s0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, s0 + 0.55);
    osc.connect(g).connect(o);
    osc.start(s0); lfo.start(s0); osc.stop(s0 + 0.6); lfo.stop(s0 + 0.6);
  });
}

// wall: bump()'s rubbery boing alone, quieter and shorter
export function wall(hit, pan) {
  if (!live()) return;
  const t = ctx.currentTime, osc = ctx.createOscillator(), g = ctx.createGain();
  osc.frequency.setValueAtTime(mtof(deg(2, 50)), t);
  osc.frequency.exponentialRampToValueAtTime(mtof(deg(-3, 50)), t + 0.12);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.08 + 0.08 * hit, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  osc.connect(g).connect(out('sfx', pan, 0.1));
  osc.start(t); osc.stop(t + 0.2);
}

// ---------- engines: one voice per human kart ----------
// two detuned 25% pulses -> lowpass -> gain. Pitch glides from D2 (MIDI 38) at idle to A2 (45, the fifth) at top
// speed, so rest and full throttle both land on scale tones; a sub-octave joins on boost, drift adds a 9 Hz tremolo
const engines = [];
export function engine(i, pan = 0, trim = 1) {
  if (!ctx || engines[i]) return;
  const t = ctx.currentTime, o = out('sfx', pan, 0.05), lp = ctx.createBiquadFilter(), g = ctx.createGain(), trem = ctx.createGain();
  lp.type = 'lowpass'; lp.frequency.value = 500; lp.Q.value = 3;
  g.gain.value = 0; trem.gain.value = 1;
  const a = ctx.createOscillator(), b = ctx.createOscillator(), sub = ctx.createOscillator(), sg = ctx.createGain();
  a.setPeriodicWave(pulse(0.25)); b.setPeriodicWave(pulse(0.25)); sub.type = 'triangle';
  b.detune.value = 9; sg.gain.value = 0;
  const lfo = ctx.createOscillator(), lg = ctx.createGain();
  lfo.frequency.value = 9; lg.gain.value = 0;
  lfo.connect(lg).connect(trem.gain);
  a.connect(lp); b.connect(lp); sub.connect(sg).connect(lp);
  lp.connect(trem).connect(g).connect(o);
  for (const n of [a, b, sub, lfo]) n.start(t);
  engines[i] = { a, b, sub, sg, lp, g, lg, trim, nodes: [a, b, sub, lfo] };
}
// sp: speed / top (0..1.4), thr: throttle, boost, drift: booleans
export function engineSet(i, sp, thr, boost, drift) {
  const e = engines[i];
  if (!e || !ctx) return;
  const t = ctx.currentTime, f = mtof(38 + 7 * Math.min(1.15, Math.max(0, sp)));
  e.a.frequency.setTargetAtTime(f, t, 0.06); e.b.frequency.setTargetAtTime(f, t, 0.06); e.sub.frequency.setTargetAtTime(f / 2, t, 0.06);
  e.sg.gain.setTargetAtTime(boost ? 0.7 : 0, t, 0.08);
  e.lp.frequency.setTargetAtTime(350 + 900 * Math.min(1, sp) + 500 * thr, t, 0.08);
  e.lg.gain.setTargetAtTime(drift ? 0.35 : 0, t, 0.05);
  e.g.gain.setTargetAtTime((0.025 + 0.03 * thr + 0.02 * Math.min(1, sp)) * e.trim * (level.sfx > 0.001 ? 1 : 0), t, 0.08);
}
export function engineStop(i) {
  const e = engines[i];
  if (!e) return;
  engines[i] = null;
  const t = ctx.currentTime;
  e.g.gain.setTargetAtTime(0, t, 0.05);
  for (const n of e.nodes) n.stop(t + 0.3);
}
export const enginesStop = () => engines.forEach((_, i) => engineStop(i));
export function enginesQuiet(on) { // pause menu: engines hold their note but go silent
  if (!ctx) return;
  for (const e of engines) if (e) e.g.gain.setTargetAtTime(on ? 0 : 0.03 * e.trim, ctx.currentTime, 0.05);
}

// ---------- item sfx ----------
// coin: a bell on the 5th, alternating with the 7th on a streak
export function coin(streak, pan) {
  if (!live()) return;
  strike('sfx', mtof(deg(streak % 2 ? 6 : 4, 86)), ctx.currentTime, { partials: BELL, decay: 0.55, peak: 0.08, pan, send: 0.3 });
}
// bomb: low sine thump + lowpassed noise burst + a falling bell arp
export function boom(pan, near = 1) {
  if (!live()) return;
  const t = ctx.currentTime, osc = ctx.createOscillator(), g = ctx.createGain();
  osc.frequency.setValueAtTime(mtof(deg(0, 38)), t);
  osc.frequency.exponentialRampToValueAtTime(30, t + 0.4);
  g.gain.setValueAtTime(0.5 * near, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  osc.connect(g).connect(out('sfx', pan, 0.2));
  osc.start(t); osc.stop(t + 0.55);
  const src = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), ng = ctx.createGain();
  src.buffer = noise;
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(1400, t); lp.frequency.exponentialRampToValueAtTime(200, t + 0.5);
  ng.gain.setValueAtTime(0.35 * near, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
  src.connect(lp).connect(ng).connect(out('sfx', pan, 0.4));
  src.start(t, Math.random() * 0.3); src.stop(t + 0.65);
  if (near > 0.5) land(false, pan, true);
}
// bubble up: a rising glassy blip under a bell
export function bubble(pan) {
  if (!live()) return;
  const t = ctx.currentTime, osc = ctx.createOscillator(), g = ctx.createGain();
  osc.frequency.setValueAtTime(mtof(deg(0, 74)), t);
  osc.frequency.exponentialRampToValueAtTime(mtof(deg(7, 74)), t + 0.25);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.09, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
  osc.connect(g).connect(out('sfx', pan, 0.4));
  osc.start(t); osc.stop(t + 0.4);
  strike('sfx', mtof(deg(4, 86)), t + 0.18, { partials: BELL, decay: 1.2, peak: 0.07, pan, send: 0.5 });
}
// pop: a burst of bright noise and a falling blip
export function pop(pan) {
  if (!live()) return;
  const t = ctx.currentTime, src = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = noise; hp.type = 'highpass'; hp.frequency.value = 2500;
  g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
  src.connect(hp).connect(g).connect(out('sfx', pan, 0.2));
  src.start(t, Math.random() * 0.3); src.stop(t + 0.1);
  const osc = ctx.createOscillator(), og = ctx.createGain();
  osc.frequency.setValueAtTime(mtof(deg(7, 74)), t); osc.frequency.exponentialRampToValueAtTime(mtof(deg(0, 62)), t + 0.15);
  og.gain.setValueAtTime(0.08, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  osc.connect(og).connect(out('sfx', pan, 0.2));
  osc.start(t); osc.stop(t + 0.2);
}
// toss: a short falling swish as a bomb leaves the hand
export function toss(pan) {
  if (!live()) return;
  const t = ctx.currentTime, src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = noise; bp.type = 'bandpass'; bp.Q.value = 3;
  bp.frequency.setValueAtTime(2600, t); bp.frequency.exponentialRampToValueAtTime(500, t + 0.25);
  g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
  src.connect(bp).connect(g).connect(out('sfx', pan, 0.2));
  src.start(t, Math.random() * 0.3); src.stop(t + 0.3);
}
