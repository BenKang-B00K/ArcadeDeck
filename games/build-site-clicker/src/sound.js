// WebAudio synth, no files. Everything tuned to D Dorian (D E F G A B C — minor with a bright raised 6th).
// Chain: voices → [pan] → bus → dry + convolution reverb send → compressor → master volume → out. ctx starts on first gesture.
const KEY = 'build-site-clicker-vol';
let ctx, bus, verb, master, vol = 0.7, lastHit = 0, combo = 0, lastClick = 0, voices = 0;
try { const v = parseFloat(localStorage.getItem(KEY)); if (v >= 0 && v <= 1) vol = v; } catch {}

const ROOT = 293.66, DORIAN = [0, 2, 3, 5, 7, 9, 10];
// scale degree (any int, wraps into octaves) → Hz
const note = (deg, oct = 0) => { const o = Math.floor(deg / 7); return ROOT * 2 ** ((DORIAN[deg - o * 7] + 12 * (o + oct)) / 12); };
const MAX_VOICES = 28; // ponytail: hard voice cap drops extra notes; a steal-oldest scheme if it ever sounds gappy

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = new AC({ latencyHint: 'interactive' });
    master = ctx.createGain(); master.gain.value = curve(vol);
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.18;
    bus = ctx.createGain(); bus.gain.value = 0.55;
    verb = ctx.createConvolver(); verb.buffer = impulse(2.4, 2.8);
    const wet = ctx.createGain(); wet.gain.value = 0.28;
    const lo = ctx.createBiquadFilter(); lo.type = 'highpass'; lo.frequency.value = 180; // keep thuds out of the tail
    bus.connect(comp); bus.connect(lo).connect(verb).connect(wet).connect(comp);
    comp.connect(master).connect(ctx.destination);
    addEventListener('visibilitychange', () => document.hidden ? ctx.suspend() : ctx.resume());
  }
  if (ctx.state !== 'running') ctx.resume();
  return vol > 0;
}
const curve = v => v * v * 0.9; // perceptual (squared) volume

// stereo noise tail with exp decay → small hall
function impulse(sec, decay) {
  const n = ctx.sampleRate * sec, b = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); let lp = 0; for (let i = 0; i < n; i++) { lp += 0.35 * ((Math.random() * 2 - 1) - lp); d[i] = lp * (1 - i / n) ** decay; } }
  return b;
}
let noiseBuf;
const noiseSrc = () => {
  if (!noiseBuf) { noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; return s;
};

// one voice: gain envelope (attack → exp decay, click-free) → panner → bus. Returns input node or null when over the cap.
function voice(t, a, dur, peak, pan = 0) {
  if (voices >= MAX_VOICES) return null;
  voices++; setTimeout(() => voices--, (t - ctx.currentTime + dur + 0.1) * 1000);
  const g = ctx.createGain(), p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.setTargetAtTime(0, t + a, (dur - a) / 5);
  if (p) { p.pan.value = Math.max(-1, Math.min(1, pan)); g.connect(p).connect(bus); } else g.connect(bus);
  return g;
}
const osc = (type, f, t, end, out) => { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.connect(out); o.start(t); o.stop(end); return o; };

// FM bell: carrier + inharmonic modulator whose index decays → bright strike, pure tail
function bell(f, at = 0, { dur = 1.2, v = 0.3, ratio = 3.5, index = 2.2, pan = 0 } = {}) {
  const t = ctx.currentTime + at, out = voice(t, 0.004, dur, v, pan); if (!out) return;
  const c = osc('sine', f, t, t + dur, out);
  const mg = ctx.createGain(); mg.gain.setValueAtTime(f * index, t); mg.gain.setTargetAtTime(f * 0.05, t, dur / 6);
  osc('sine', f * ratio, t, t + dur, mg); mg.connect(c.frequency);
  const h = ctx.createGain(); h.gain.value = 0.18; h.connect(out); osc('sine', f * 2.01, t, t + dur, h); // shimmer partial
}
// soft pluck: triangle + octave sine through a closing lowpass
function pluck(f, at = 0, { dur = 0.35, v = 0.25, pan = 0 } = {}) {
  const t = ctx.currentTime + at, out = voice(t, 0.003, dur, v, pan); if (!out) return;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2; lp.frequency.setValueAtTime(f * 8, t); lp.frequency.setTargetAtTime(f * 1.5, t, dur / 5); lp.connect(out);
  osc('triangle', f, t, t + dur, lp); const s = ctx.createGain(); s.gain.value = 0.4; s.connect(lp); osc('sine', f * 2, t, t + dur, s);
}
// warm pad: 2 detuned saws per note, slow attack, lowpass
function pad(freqs, at = 0, { dur = 2, v = 0.12, a = 0.08 } = {}) {
  const t = ctx.currentTime + at, out = voice(t, a, dur, v); if (!out) return;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, t); lp.frequency.linearRampToValueAtTime(2600, t + a + 0.2); lp.frequency.setTargetAtTime(700, t + a + 0.2, dur / 3); lp.connect(out);
  const s = ctx.createGain(); s.gain.value = 1 / (freqs.length * 2); s.connect(lp);
  for (const f of freqs) for (const d of [-7, 7]) osc('sawtooth', f, t, t + dur, s).detune.value = d;
}
// body thump: sine pitch drop (kick-like)
function thud(at = 0, { v = 0.9, f0 = 150, f1 = 48, dur = 0.22, pan = 0 } = {}) {
  const t = ctx.currentTime + at, out = voice(t, 0.002, dur, v, pan); if (!out) return;
  const o = osc('sine', f0, t, t + dur, out); o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.6);
}
// filtered noise: bandpass crunch / highpass swish
function hiss(at = 0, { dur = 0.1, v = 0.4, f = 1800, q = 0.8, type = 'bandpass', sweep = 0, pan = 0 } = {}) {
  const t = ctx.currentTime + at, out = voice(t, 0.002, dur, v, pan); if (!out) return;
  const bp = ctx.createBiquadFilter(); bp.type = type; bp.Q.value = q; bp.frequency.setValueAtTime(f, t); if (sweep) bp.frequency.exponentialRampToValueAtTime(f + sweep, t + dur);
  bp.connect(out); const s = noiseSrc(); s.connect(bp); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
}
// combo phrase after the climb: starts on the octave, leans on B♮ (degree 5, the Dorian colour), ends on C → back to D
const MELODY = [
  7, 5, 4, 5, 6, 4, 2, 4,  5, 3, 1, 2, 3, 4, 5, 6,  // question → answer
  7, 9, 8, 7, 5, 6, 7, 4,  3, 2, 0, 2, 4, 5, 4, 6,  // up to the high F, fall to the root
  4, 6, 7, 9, 8, 6, 5, 7,  6, 4, 3, 1, 0, 2, 3, 5,  // second climb, long descent
  4, 4, 2, 4, 5, 5, 3, 5,  6, 7, 6, 5, 4, 2, 1, 2,  // bridge: repeated-note figure, sighs downward
  0, 2, 4, 7, 6, 4, 5, 3,  1, 3, 5, 8, 7, 5, 6, 4,  // arpeggio sequence stepping up
  7, 8, 10, 9, 7, 8, 6, 7, 5, 6, 4, 5, 3, 4, 2, 4,  // peak on the high G, stair-step home
  2, 1, 0, -1, 0, 2, 1, 3, 2, 4, 3, 5, 4, 6, 5, 7,  // low turn under the root, zig-zag back up
  9, 7, 8, 6, 7, 5, 4, 2,  3, 4, 5, 3, 4, 5, 6, 5,  // coda, lead back to the octave
];
let mStart = 0;
const rnd = a =>a[Math.floor(Math.random() * a.length)];

export const sfx = {
  // rapid taps climb the scale (combo) up to the octave, then loop a Dorian phrase; reset after a pause
  click(pan = 0) {
    if (!ensure()) return;
    const now = ctx.currentTime; combo = now - lastClick < 0.45 ? combo + 1 : 0; lastClick = now;
    if (!combo) mStart = Math.floor(Math.random() * MELODY.length); // each combo enters the phrase somewhere new
    pluck(note(combo < 8 ? combo : MELODY[(combo - 8 + mStart) % MELODY.length], 1), 0, { v: 0.22, pan });
    hiss(0, { dur: 0.03, v: 0.12, f: 5000, type: 'highpass', pan });
  },
  spawn(pan = 0) {
    if (!ensure()) return;
    hiss(0, { dur: 0.18, v: 0.07, f: 2500, q: 2, sweep: 5000, pan });
    bell(note(rnd([4, 6, 7]), 1), 0.02, { dur: 0.4, v: 0.035, ratio: 2, index: 1, pan });
  },
  // hammer: thump + metallic clank on a random Dorian degree; ≥1 dyad, ≥2 Dm9 arpeggio, 3 cadence i → IV (the Dorian major IV) → i
  hit(level = 0, pan = 0) {
    if (!ensure()) return;
    const now = ctx.currentTime; if (level === 0 && now - lastHit < 0.045) return; lastHit = now; // many workers → one clank per 45 ms
    thud(0, { v: 0.7 + level * 0.1, pan: pan * 0.5 });
    hiss(0, { dur: 0.07 + level * 0.03, v: 0.28, f: 1400 + Math.random() * 800, q: 1.2, pan });
    bell(note(rnd([0, 2, 4, 5]), 1) * (0.995 + Math.random() * 0.01), 0.002, { dur: 0.35, v: 0.07, ratio: 4.1, index: 3.2, pan });
    if (level >= 1) { bell(note(0, 1), 0.03, { v: 0.14, pan }); bell(note(4, 1), 0.06, { v: 0.11, pan }); }
    if (level >= 2) [0, 2, 4, 6, 8].forEach((d, i) => bell(note(d, 1), 0.1 + i * 0.07, { dur: 1.4, v: 0.12, ratio: 2, index: 1.4, pan: -0.4 + i * 0.2 }));
    if (level === 3) {
      thud(0, { v: 1, f0: 110, f1: 32, dur: 0.6 }); hiss(0, { dur: 0.9, v: 0.2, f: 600, sweep: 4000, q: 0.5 });
      pad([note(0, -1), note(2, 0), note(4, 0), note(6, 0)], 0.1, { dur: 1.4, v: 0.14 });   // Dm7
      pad([note(3, -1), note(5, 0), note(7, 0)], 0.9, { dur: 1.4, v: 0.14 });               // G (B♮ = Dorian colour)
      pad([note(0, -1), note(4, 0), note(8, 0), note(9, 0)], 1.7, { dur: 2.6, v: 0.15 });   // Dm(add9)
      [7, 8, 9, 11, 12, 14].forEach((d, i) => bell(note(d, 0), 1.7 + i * 0.09, { dur: 1.8, v: 0.1, ratio: 2, index: 1.2, pan: -0.6 + i * 0.24 }));
    }
  },
  buy() {
    if (!ensure()) return;
    bell(note(4, 1), 0, { dur: 0.6, v: 0.16, ratio: 2, index: 1.5 }); bell(note(7, 1), 0.07, { dur: 0.9, v: 0.16, ratio: 2, index: 1.5 });
    hiss(0.05, { dur: 0.25, v: 0.05, f: 7000, type: 'highpass' });
  },
  // new level: rising Dorian run over a soft pad
  clear() {
    if (!ensure()) return;
    pad([note(0, -1), note(4, -1), note(9, -1)], 0, { dur: 2.2, v: 0.1, a: 0.4 });
    for (let i = 0; i < 8; i++) bell(note(i, 1), 0.05 + i * 0.06, { dur: 0.9, v: 0.08, ratio: 2, index: 1, pan: -0.7 + i * 0.2 });
  },
  tick() { if (ensure()) pluck(note(4, 1), 0, { dur: 0.15, v: 0.2 }); }, // volume preview
};
export const getVolume = () => vol;
export function setVolume(v) {
  vol = Math.max(0, Math.min(1, v)); try { localStorage.setItem(KEY, vol); } catch {}
  if (master) master.gain.setTargetAtTime(curve(vol), ctx.currentTime, 0.02);
}
