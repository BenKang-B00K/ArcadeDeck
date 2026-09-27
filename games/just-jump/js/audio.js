// Procedural SFX — Web Audio synth, every pitched sound drawn from D Dorian
// (D E F G A B C: minor with a bright major 6th). No audio files.
// Chain: voices → master gain → compressor → out, plus a shared reverb send.
(() => {
  const NS = window.OneJump = window.OneJump || {};

  const DORIAN = [0, 2, 3, 5, 7, 9, 10];
  const ROOT = 146.83;  // D3
  // scale degree (can exceed 6 / go negative) → Hz
  function hz(deg) {
    const oct = Math.floor(deg / 7), i = ((deg % 7) + 7) % 7;
    return ROOT * Math.pow(2, oct + DORIAN[i] / 12);
  }

  const LEVELS = [0, 0.35, 0.7, 1];  // mute / low / mid / high
  const VOL_KEY = 'jj_vol';
  let level = 2;
  try {
    const v = localStorage.getItem(VOL_KEY);
    if (v != null && LEVELS[+v] != null) level = +v;
  } catch (_) {}

  let ac = null, master, revSend, noiseBuf;
  const last = {};  // per-sfx retrigger throttle

  function init() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC({ latencyHint: 'interactive' });
    // iOS 16.4+: play through the ringer/silent switch like a game should
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (_) {}
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 4;
    comp.attack.value = 0.003; comp.release.value = 0.2;
    comp.connect(ac.destination);
    master = ac.createGain();
    master.gain.value = LEVELS[level];
    master.connect(comp);
    // reverb: synthetic 1.4s stereo impulse (decaying noise), damped by lowpass
    const len = Math.floor(ac.sampleRate * 1.4);
    const ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    const conv = ac.createConvolver();
    conv.buffer = ir;
    const damp = ac.createBiquadFilter();
    damp.type = 'lowpass'; damp.frequency.value = 3200;
    revSend = ac.createGain();
    revSend.gain.value = 0.9;
    revSend.connect(conv); conv.connect(damp); damp.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  }

  // Browsers (esp. iOS) only start audio inside a user gesture.
  function unlock() {
    if (!ac) init();
    if (ac && ac.state !== 'running') ac.resume().catch(() => {});
  }
  ['pointerdown', 'touchend', 'keydown'].forEach(ev =>
    window.addEventListener(ev, unlock, { capture: true, passive: true }));
  document.addEventListener('visibilitychange', () => {
    if (!ac) return;
    if (document.hidden) ac.suspend().catch(() => {}); else ac.resume().catch(() => {});
  });

  function ready() { return ac && ac.state === 'running' && level > 0; }
  function throttled(name, ms) {
    const now = performance.now();
    if (last[name] && now - last[name] < ms) return true;
    last[name] = now;
    return false;
  }

  // output stage for one voice: gain envelope → stereo pan → dry + reverb
  function out(t0, dur, peak, attack, pan, rev) {
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let node = g;
    if (pan && ac.createStereoPanner) {
      const p = ac.createStereoPanner(); p.pan.value = pan;
      g.connect(p); node = p;
    }
    node.connect(master);
    if (rev) { const s = ac.createGain(); s.gain.value = rev; node.connect(s); s.connect(revSend); }
    return g;
  }

  // pitched voice: osc (+ optional detuned twin) → optional lowpass → envelope
  function tone(freq, at, dur, o = {}) {
    const t0 = ac.currentTime + 0.005 + at;
    const g = out(t0, dur, o.gain || 0.2, o.attack || 0.004, o.pan || 0, o.rev == null ? 0.2 : o.rev);
    let dest = g;
    if (o.lp) {
      const f = ac.createBiquadFilter();
      f.type = 'lowpass'; f.Q.value = o.q || 1;
      f.frequency.setValueAtTime(o.lp, t0);
      if (o.lpTo) f.frequency.exponentialRampToValueAtTime(o.lpTo, t0 + dur);
      f.connect(g); dest = f;
    }
    const oscs = o.detune ? [-o.detune, o.detune] : [0];
    for (const dt of oscs) {
      const osc = ac.createOscillator();
      osc.type = o.type || 'triangle';
      osc.frequency.setValueAtTime(freq, t0);
      if (o.glide) osc.frequency.exponentialRampToValueAtTime(o.glide, t0 + (o.glideT || dur));
      osc.detune.value = dt;
      osc.connect(dest);
      osc.start(t0); osc.stop(t0 + dur + 0.02);
    }
  }
  // bell = sine fundamental + inharmonic partial (bright, glassy)
  function bell(freq, at, dur, gain, pan) {
    tone(freq, at, dur, { type: 'sine', gain, pan, rev: 0.35 });
    tone(freq * 2.76, at, dur * 0.4, { type: 'sine', gain: gain * 0.25, pan, rev: 0.35 });
    tone(freq * 5.4, at, dur * 0.15, { type: 'sine', gain: gain * 0.08, pan, rev: 0.35 });
  }
  function noise(at, dur, o = {}) {
    const t0 = ac.currentTime + 0.005 + at;
    const src = ac.createBufferSource();
    src.buffer = noiseBuf;
    const f = ac.createBiquadFilter();
    f.type = o.type || 'bandpass'; f.Q.value = o.q || 1;
    f.frequency.setValueAtTime(o.freq || 1000, t0);
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
    src.connect(f);
    f.connect(out(t0, dur, o.gain || 0.15, o.attack || 0.003, o.pan || 0, o.rev || 0));
    src.start(t0); src.stop(t0 + dur + 0.02);
  }

  let coinStep = 0, coinT = 0;
  const SFX = {
    jump() {
      tone(hz(7), 0, 0.16, { type: 'triangle', glide: hz(11), glideT: 0.08, gain: 0.22, rev: 0.1 });
      tone(hz(14), 0, 0.05, { type: 'square', gain: 0.03, lp: 3000, rev: 0 });
      noise(0, 0.08, { freq: 1800, to: 4000, gain: 0.04, q: 0.8 });
    },
    doubleJump() {
      [11, 14, 16].forEach((d, i) =>
        tone(hz(d), i * 0.035, 0.18, { type: 'sine', gain: 0.16, detune: 6, pan: -0.2 + i * 0.2, rev: 0.3 }));
      noise(0, 0.2, { freq: 900, to: 5000, gain: 0.06, q: 1.4, rev: 0.2 });
    },
    land() {
      if (throttled('land', 80)) return;
      tone(110, 0, 0.09, { type: 'sine', glide: 55, gain: 0.18, rev: 0 });
      noise(0, 0.06, { type: 'lowpass', freq: 500, gain: 0.08 });
    },
    coin() {
      if (throttled('coin', 25)) return;
      // consecutive pickups climb the Dorian scale
      const now = performance.now();
      coinStep = now - coinT < 900 ? Math.min(coinStep + 1, 9) : 0;
      coinT = now;
      const d = 14 + coinStep;
      bell(hz(d), 0, 0.35, 0.13, 0.15);
      bell(hz(d + 2), 0.06, 0.45, 0.13, 0.25);
    },
    death() {
      noise(0, 0.45, { freq: 2200, to: 160, gain: 0.3, q: 0.9, rev: 0.25 });
      tone(hz(0), 0, 0.5, { type: 'sawtooth', glide: hz(-14), gain: 0.2, lp: 1800, lpTo: 200, rev: 0.2 });
      tone(55, 0, 0.3, { type: 'sine', glide: 30, gain: 0.35, rev: 0 });
      // falling Dorian run, starting on its signature major 6th (B)
      [12, 11, 10, 9, 8, 7].forEach((d, i) =>
        tone(hz(d), 0.28 + i * 0.07, 0.3, { type: 'triangle', gain: 0.1, pan: 0.3 - i * 0.1, rev: 0.4 }));
    },
    newBest() {
      // D–A–D' brass call, then Dm9 strum (D F A C E)
      [7, 11, 14].forEach((d, i) =>
        tone(hz(d), 1.0 + i * 0.12, 0.22, { type: 'sawtooth', gain: 0.1, lp: 2400, detune: 7, rev: 0.3 }));
      [7, 9, 11, 13, 15].forEach((d, i) =>
        tone(hz(d), 1.4 + i * 0.04, 1.4, { type: 'sawtooth', gain: 0.07, lp: 2600, lpTo: 900, detune: 9, pan: -0.4 + i * 0.2, attack: 0.02, rev: 0.45 }));
      bell(hz(21), 1.4, 1.2, 0.08, 0);
    },
    stageClear() {
      // rising D F A B D' E' — the B (major 6th) is the Dorian colour tone
      [7, 9, 11, 12, 14, 15].forEach((d, i) =>
        tone(hz(d), i * 0.07, 0.3, { type: 'square', gain: 0.07, lp: 3200, pan: -0.5 + i * 0.2, rev: 0.3 }));
      [7, 9, 11, 12].forEach((d, i) =>
        tone(hz(d), 0.45, 1.6, { type: 'sine', gain: 0.1, detune: 5, attack: 0.04, pan: -0.3 + i * 0.2, rev: 0.5 }));
      bell(hz(18), 0.45, 1.4, 0.1, 0.3);
      noise(0.45, 1.0, { type: 'highpass', freq: 6000, gain: 0.04, rev: 0.5 });
    },
    tier() {
      [11, 14, 16].forEach((d, i) => bell(hz(d + 7), i * 0.09, 0.9, 0.09, -0.3 + i * 0.3));
    },
    start() {
      tone(hz(7), 0, 0.12, { type: 'triangle', gain: 0.15 });
      tone(hz(11), 0.07, 0.2, { type: 'triangle', gain: 0.15, rev: 0.3 });
    },
    tick(d = 11) {
      if (throttled('tick', 40)) return;
      tone(hz(d), 0, 0.08, { type: 'sine', gain: 0.14, rev: 0.1 });
      noise(0, 0.02, { type: 'highpass', freq: 4000, gain: 0.03 });
    },
    buy() {
      [7, 9, 11, 12, 14].forEach((d, i) => bell(hz(d + 7), i * 0.05, 0.5, 0.09, -0.4 + i * 0.2));
      [7, 11, 14].forEach(d =>
        tone(hz(d), 0.3, 1.0, { type: 'sine', gain: 0.1, detune: 6, attack: 0.03, rev: 0.5 }));
    },
    denied() {
      tone(hz(1), 0, 0.12, { type: 'square', gain: 0.08, lp: 900, rev: 0 });
      tone(hz(0), 0.11, 0.2, { type: 'square', gain: 0.08, lp: 700, rev: 0 });
    },
    pause()  { tone(hz(11), 0, 0.1, { type: 'sine', gain: 0.12 }); tone(hz(7), 0.08, 0.18, { type: 'sine', gain: 0.12 }); },
    resume() { tone(hz(7), 0, 0.1, { type: 'sine', gain: 0.12 }); tone(hz(11), 0.08, 0.18, { type: 'sine', gain: 0.12 }); },
  };

  NS.Audio = {
    play(name, arg) {
      if (!ready() || !SFX[name]) return;
      try { SFX[name](arg); } catch (_) {}
    },
    get level() { return level; },
    get levels() { return LEVELS.length; },
    cycleVolume() {
      level = (level + 1) % LEVELS.length;
      try { localStorage.setItem(VOL_KEY, String(level)); } catch (_) {}
      unlock();
      if (master) master.gain.setTargetAtTime(LEVELS[level], ac.currentTime, 0.02);
      // audible preview at the new level (pitch rises with level)
      if (level > 0) setTimeout(() => NS.Audio.play('tick', 7 + level * 2), 30);
    },
  };
})();
