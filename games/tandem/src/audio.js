// Synthesised SFX + music, every pitched note drawn from D Dorian (D E F G A B C).
const DORIAN = [0, 2, 3, 5, 7, 9, 10];
const D3 = 146.83;
export const hz = (deg, oct = 0) => {
  const o = Math.floor(deg / 7);
  return D3 * 2 ** ((DORIAN[deg - o * 7] + 12 * (o + oct)) / 12);
};

let ctx, master, bus, musicBus, verb;
let volume = 0.7, music = 0.6, muted = false, musicMuted = false;
const lastPlay = {};
const MUSIC_LEVEL = 0.45; // music sits under the SFX

// Stereo noise tail with a power-curve decay: a small hall, generated so there's no asset to load.
function impulse(sec, decay) {
  const n = Math.floor(ctx.sampleRate * sec), buf = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** decay;
  }
  return buf;
}

function init() {
  if (ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14; comp.ratio.value = 4;
  master = ctx.createGain();
  master.connect(comp).connect(ctx.destination);
  bus = ctx.createGain();
  bus.connect(master);
  // short slap-back echo on SFX for a bit of space
  const delay = ctx.createDelay(), fb = ctx.createGain(), wet = ctx.createGain(), lp = ctx.createBiquadFilter();
  delay.delayTime.value = 0.16; fb.gain.value = 0.28; wet.gain.value = 0.18;
  lp.type = 'lowpass'; lp.frequency.value = 2400;
  bus.connect(delay).connect(lp).connect(fb).connect(delay);
  lp.connect(wet).connect(master);
  musicBus = ctx.createGain();
  musicBus.connect(master);
  // shared hall reverb: music sends a lot, SFX a little; highpass keeps the tail off the bass
  verb = ctx.createConvolver();
  verb.buffer = impulse(2.6, 3);
  const verbOut = ctx.createGain(), verbHp = ctx.createBiquadFilter();
  verbOut.gain.value = 0.5; verbHp.type = 'highpass'; verbHp.frequency.value = 180;
  verb.connect(verbHp).connect(verbOut).connect(master);
  const send = (from, amt) => { const g = ctx.createGain(); g.gain.value = amt; from.connect(g).connect(verb); };
  send(bus, 0.15); send(musicBus, 0.55);
  apply();
}

// perceptual curves (v²)
function apply() {
  if (!ctx) return;
  master.gain.value = muted ? 0 : 1;
  bus.gain.value = volume * volume;
  musicBus.gain.value = musicMuted ? 0 : music * music * MUSIC_LEVEL;
}

export const audio = {
  unlock() {
    init();
    if (ctx?.state === 'suspended') ctx.resume();
    if (ctx && !musicTimer) { nextBar = ctx.currentTime + 0.1; musicTimer = setInterval(scheduleMusic, 200); }
  },
  suspend() { ctx?.suspend(); },
  get muted() { return muted; },
  get musicMuted() { return musicMuted || music === 0; },
  setVolume(v) { volume = v; apply(); },
  setMusic(v) { music = v; apply(); },
  setMuted(m) { muted = m; apply(); },
  setMusicMuted(m) { musicMuted = m; apply(); },
  play(name, arg) {
    if (!ctx || ctx.state !== 'running' || muted || !volume) return;
    const now = ctx.currentTime;
    if (now - (lastPlay[name] ?? -1) < 0.04) return; // stop same-frame stacking
    lastPlay[name] = now;
    SFX[name]?.(now, arg);
  },
};

// One enveloped oscillator note → optional lowpass → optional pan → bus.
// vib: vibrato depth in cents, fading in over the note (long melody notes).
function tone(t, freq, { type = 'triangle', dur = 0.15, vol = 0.3, attack = 0.005, hold = 0, detune = 0, glide, cutoff, pan, vib, out: dest = bus } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  o.detune.value = detune;
  if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
  if (vib) {
    const lfo = ctx.createOscillator(), depth = ctx.createGain();
    lfo.frequency.value = 5.2;
    depth.gain.setValueAtTime(0, t);
    depth.gain.linearRampToValueAtTime(vib, t + Math.min(dur * 0.5, 0.6));
    lfo.connect(depth).connect(o.detune);
    lfo.start(t); lfo.stop(t + dur + 0.02);
  }
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  if (hold) g.gain.setValueAtTime(vol, t + attack + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let out = o;
  if (cutoff) {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = cutoff;
    out = o.connect(f);
  }
  out = out.connect(g);
  if (pan && ctx.createStereoPanner) {
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    out = out.connect(p);
  }
  out.connect(dest);
  o.start(t);
  o.stop(t + dur + 0.02);
}

// Filtered white-noise burst: the body of thuds, whooshes and impacts.
let noiseBuf;
function noise(t, { dur = 0.1, vol = 0.1, freq = 800, q = 1, type = 'bandpass', sweep, pan } = {}) {
  noiseBuf ??= (() => {
    const b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  })();
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noiseBuf;
  f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
  if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let out = s.connect(f).connect(g);
  if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; out = out.connect(p); }
  out.connect(bus);
  s.start(t, Math.random() * 0.5);
  s.stop(t + dur + 0.02);
}

// P1 sits a little left, P2 a little right, matching their touch pads
const side = p => (p?.id ? 0.35 : -0.35);

const SFX = {
  // P1 and P2 jump on different chord tones so partners can tell them apart
  jump(t, p) {
    const d = p?.id ? 2 : 0, pan = side(p);
    tone(t, hz(7 + d), { dur: 0.13, vol: 0.15, glide: hz(11 + d), pan });
    tone(t, hz(14 + d), { type: 'sine', dur: 0.1, vol: 0.05, pan });
    noise(t, { dur: 0.08, vol: 0.03, freq: 1800, sweep: 4000, q: 0.7, pan });
  },
  land(t, { p, v = 8 } = {}) {
    const vol = Math.min(0.25, v / 60), pan = side(p);
    tone(t, 110, { type: 'sine', dur: 0.09, vol, glide: 50, pan });
    noise(t, { dur: 0.07, vol: vol * 0.5, freq: 500, type: 'lowpass', pan });
  },
  plate(t, pl) {
    const [a, b] = pl.on ? [2, 4] : [4, 2];
    const vol = pl.on ? 0.2 : 0.12;
    tone(t, hz(a, 1), { type: 'sine', dur: 0.18, vol });
    tone(t + 0.06, hz(b, 1), { type: 'sine', dur: 0.22, vol });
    tone(t, hz(a), { dur: 0.2, vol: vol * 0.5, cutoff: 1200 });
    noise(t, { dur: 0.04, vol: 0.05, freq: 2500, q: 2 }); // mechanical click
  },
  gem(t) {
    [7, 9, 11, 14].forEach((d, i) => tone(t + i * 0.05, hz(d, 1), { dur: 0.18, vol: 0.12 }));
    tone(t + 0.2, hz(14, 1), { type: 'sine', dur: 0.6, vol: 0.08, vib: 8 });
    tone(t + 0.2, hz(18, 1), { type: 'sine', dur: 0.5, vol: 0.03 }); // shimmer a fifth above
  },
  die(t, p) {
    [4, 3, 1, 0].forEach((d, i) => tone(t + i * 0.09, hz(d), { type: 'square', dur: 0.16, vol: 0.08, cutoff: 900 }));
    tone(t, 90, { type: 'sine', dur: 0.4, vol: 0.25, glide: 40 });
    noise(t, { dur: 0.35, vol: 0.12, freq: 1200, sweep: 200, type: 'lowpass', pan: side(p) });
  },
  waiting(t) {
    tone(t, hz(4, 1), { type: 'sine', dur: 0.35, vol: 0.1 });
    tone(t + 0.12, hz(7, 1), { type: 'sine', dur: 0.4, vol: 0.06 });
  },
  // D F A B D run (B = Dorian's raised 6th), then a Dm add-octave chord that rings out
  clear(t) {
    [0, 2, 4, 5, 7].forEach((d, i) => tone(t + i * 0.08, hz(d, 1), { dur: 0.3, vol: 0.13 }));
    [0, 2, 4, 7].forEach(d => tone(t + 0.45, hz(d, 1), { type: 'sine', dur: 1.8, vol: 0.08, attack: 0.02, vib: 6 }));
    tone(t + 0.45, hz(0), { dur: 1.8, vol: 0.1, cutoff: 800 });
  },
  // low, short and quiet: cannons fire constantly
  shoot(t) {
    tone(t, hz(0, -1), { type: 'square', dur: 0.1, vol: 0.045, cutoff: 700, glide: hz(-3, -1) });
    noise(t, { dur: 0.12, vol: 0.05, freq: 900, sweep: 300, type: 'lowpass' });
  },
  ui(t) {
    tone(t, hz(4, 1), { type: 'sine', dur: 0.08, vol: 0.09 });
  },
};

// ---------- background music: D Dorian, i - IV - i - VII ----------
// IV (G major) carries the Dorian raised 6th (B); scheduled ahead on the audio clock.
const BEAT = 60 / 84, BAR = BEAT * 4;
const PROG = [[0, 2, 4], [3, 5, 7], [0, 2, 4], [6, 8, 10]]; // Dm  G  Dm  C
const ARP = [0, 1, 2, 3, 2, 1, 2, 1]; // chord-tone index per 8th, 3 = root up an octave
// 8-bar lead melody in long notes: [degree, beats] per bar, null = rest. Leans on B (the Dorian colour) over G.
const MELODY = [
  [[4, 3], [3, 1]], [[5, 2], [7, 2]], [[4, 4]], [[3, 2], [1, 2]],
  [[2, 2], [4, 2]], [[7, 3], [5, 1]], [[6, 2], [4, 2]], [[1, 3], [null, 1]],
];
let musicTimer = 0, nextBar = 0, barNo = 0;

function scheduleMusic() {
  if (ctx.state !== 'running') return;
  if (nextBar < ctx.currentTime) nextBar = ctx.currentTime + 0.05; // resumed after a pause
  while (nextBar < ctx.currentTime + 0.6) {
    const ch = PROG[barNo % 4], t = nextBar, out = musicBus;
    // melody after the 8-bar intro, every other 8 bars so it doesn't wear thin
    const lead = barNo >= 8 && Math.floor(barNo / 8) % 2 === 1;
    tone(t, hz(ch[0], -1), { type: 'sine', dur: BAR, vol: 0.22, attack: 0.04, hold: BAR * 0.5, out });
    for (const d of ch) for (const detune of [-6, 6]) {
      tone(t, hz(d), { dur: BAR + 0.5, vol: 0.03, attack: 0.7, hold: BAR - 1.2, detune, cutoff: 900, out, pan: detune / 20 });
    }
    const notes = [...ch, ch[0] + 7];
    ARP.forEach((k, i) => {
      if (barNo % 8 >= 4 && i % 4 === 3) return; // second pass breathes a little
      tone(t + i * BEAT / 2, hz(notes[k], 1), { type: 'sine', dur: 0.5, vol: lead ? 0.04 : 0.06, attack: 0.01, out, pan: i % 2 ? 0.25 : -0.25 });
    });
    if (lead) {
      let at = t;
      for (const [d, beats] of MELODY[barNo % 8]) {
        const dur = beats * BEAT;
        if (d !== null) {
          tone(at, hz(d, 1), { dur: dur * 0.95, vol: 0.07, attack: 0.09, hold: dur * 0.5, vib: 14, cutoff: 2200, out });
          tone(at, hz(d, 2), { type: 'sine', dur: dur * 0.9, vol: 0.018, attack: 0.12, hold: dur * 0.4, vib: 14, out });
        }
        at += dur;
      }
    }
    nextBar += BAR;
    barNo++;
  }
}
