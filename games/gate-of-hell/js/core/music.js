/* music.js — Procedural score + tonal SFX cues, all in D Dorian.
 *
 * D Dorian (D E F G A B C) is natural minor with a raised 6th: dark, but the
 * B natural keeps it modal and "ancient" instead of tragic. Pad, bass, melody,
 * bells and every cue draw from this one scale, so effects always sit in key
 * with the score.
 *
 * The melody favors long notes (half / dotted-half / whole) over a slow pad,
 * and remembers its opening motif: each 8-bar phrase is A + A' (same rhythm,
 * same first two bars, new cadence ending on D), so it sounds composed rather
 * than random. A fresh motif is drawn every two phrases.
 *
 * Voices are scheduled ~1.5 s ahead on the audio clock (lookahead scheduler),
 * so main-thread hitches never make the music stutter.
 */
(function () {
    const SCALE = [0, 2, 3, 5, 7, 9, 10];        // Dorian intervals
    const ROOT = 50;                              // D3
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    // Scale degree → MIDI. 0 = D3, 7 = D4, 14 = D5.
    const deg = (d) => ROOT + 12 * Math.floor(d / 7) + SCALE[((d % 7) + 7) % 7];

    // Triads as scale degrees. IV (G major) is the Dorian signature chord.
    const CHORDS = { i: [0, 2, 4], ii: [1, 3, 5], III: [2, 4, 6], IV: [3, 5, 7], v: [4, 6, 8], VII: [6, 8, 10] };
    const MODES = {
        title:  { bpm: 54, prog: ['i', 'IV', 'i', 'VII', 'i', 'IV', 'III', 'i'], bells: false, pulse: false },
        battle: { bpm: 62, prog: ['i', 'VII', 'IV', 'i', 'III', 'VII', 'IV', 'v'], bells: true, pulse: false },
        boss:   { bpm: 70, prog: ['i', 'ii', 'VII', 'i', 'i', 'ii', 'IV', 'v'], bells: false, pulse: true }
    };
    // Bar rhythms in beats; negative = rest. Long values dominate on purpose.
    const RHYTHMS = [[4], [4], [2, 2], [3, 1], [2, 2], [-1, 3], [2, -2], [1, 3]];
    const MEL_LO = 7, MEL_HI = 16;                // D4 .. F5

    const A = () => window.GameAudio && GameAudio.ctx();
    let mode = null, pending = null;
    let nextBar = 0, barIdx = 0, timer = null;
    let motif = null, phrase = null, lastDeg = 11;
    let musicIn = null, duck = null, ducked = false;

    /* ─── Voices ─────────────────────────────────────────────────────────── */
    function osc(c, type, freq, t, end) {
        const o = c.createOscillator();
        o.type = type; o.frequency.value = freq;
        o.start(t); o.stop(end);
        return o;
    }
    // Attack → decay to sustain → release. Returns the stop time.
    function adsr(p, t, dur, a, d, s, r, peak) {
        p.setValueAtTime(0, t);
        p.linearRampToValueAtTime(peak, t + a);
        p.setTargetAtTime(peak * s, t + a, d / 3);
        p.setTargetAtTime(0, t + Math.max(dur, a), r / 4);
        return t + Math.max(dur, a) + r;
    }

    // Warm string/choir pad: detuned saws through a slowly opening low-pass.
    function pad(c, out, m, t, dur, vel) {
        const g = c.createGain(), f = c.createBiquadFilter();
        const end = adsr(g.gain, t, dur, 1.6, 1.2, 0.8, 2.4, vel);
        f.type = 'lowpass'; f.Q.value = 0.6;
        f.frequency.setValueAtTime(450, t);
        f.frequency.linearRampToValueAtTime(1100, t + dur * 0.6);
        f.frequency.linearRampToValueAtTime(500, end);
        [-7, 7].forEach(cents => { const o = osc(c, 'sawtooth', hz(m), t, end); o.detune.value = cents; o.connect(f); });
        f.connect(g); g.connect(out);
    }

    // Breathy lead (flute/ocarina): triangle + soft octave sine, delayed vibrato.
    function lead(c, out, m, t, dur, vel) {
        const g = c.createGain(), f = c.createBiquadFilter();
        const end = adsr(g.gain, t, dur, 0.09, 0.5, 0.75, 1.1, vel);
        f.type = 'lowpass'; f.frequency.value = 2400;
        const lfo = osc(c, 'sine', 5.1, t, end), depth = c.createGain();
        depth.gain.setValueAtTime(0, t);
        depth.gain.linearRampToValueAtTime(0, t + 0.35);
        depth.gain.linearRampToValueAtTime(9, t + 0.9);     // cents
        lfo.connect(depth);
        const o1 = osc(c, 'triangle', hz(m), t, end);
        const o2 = osc(c, 'sine', hz(m) * 2, t, end), o2g = c.createGain();
        o2g.gain.value = 0.22;
        depth.connect(o1.detune); depth.connect(o2.detune);
        o1.connect(f); o2.connect(o2g); o2g.connect(f);
        f.connect(g); g.connect(out);
    }

    function bass(c, out, m, t, dur, vel) {
        const g = c.createGain();
        const end = adsr(g.gain, t, dur, 0.05, 0.9, 0.7, 0.8, vel);
        osc(c, 'sine', hz(m), t, end).connect(g);
        const h = c.createGain(); h.gain.value = 0.18;
        osc(c, 'triangle', hz(m) * 2, t, end).connect(h); h.connect(g);
        g.connect(out);
    }

    // Struck bell: inharmonic partials, higher ones die first.
    function bell(c, out, m, t, vel, ring) {
        const f0 = hz(m);
        [[1, 1], [2, 0.32], [2.76, 0.22], [5.4, 0.07]].forEach(([mul, amp], i) => {
            const g = c.createGain(), len = ring / (1 + i * 0.8);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(vel * amp, t + 0.004);
            g.gain.exponentialRampToValueAtTime(0.0001, t + len);
            osc(c, 'sine', f0 * mul, t, t + len + 0.05).connect(g);
            g.connect(out);
        });
    }

    // Boss heartbeat: pitched-down sine thump.
    function thump(c, out, t, vel) {
        const g = c.createGain(), o = osc(c, 'sine', 95, t, t + 0.45);
        o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vel, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
        o.connect(g); g.connect(out);
    }

    /* ─── Composition ────────────────────────────────────────────────────── */
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const clampDeg = (d) => Math.max(MEL_LO, Math.min(MEL_HI, d));

    // Nearest chord tone to `from` inside the melody range (smooth voice-leading).
    function nearestChordTone(chord, from) {
        let best = from, bestDist = Infinity;
        for (let d = MEL_LO; d <= MEL_HI; d++) {
            if (!chord.some(c => ((d - c) % 7 + 7) % 7 === 0)) continue;
            const dist = Math.abs(d - from) + (Math.random() < 0.25 ? 2 : 0); // occasional leap
            if (dist < bestDist) { bestDist = dist; best = d; }
        }
        return best;
    }

    // One bar of melody: [{deg, beat, len}] — first note a chord tone, then stepwise.
    function writeBar(chordName, rhythm, cadence) {
        const chord = CHORDS[chordName];
        const notes = [];
        let beat = 0, first = true;
        for (const v of rhythm) {
            if (v > 0) {
                let d = first ? nearestChordTone(chord, lastDeg) : clampDeg(lastDeg + pick([-2, -1, -1, 1, 1, 2]));
                if (cadence && beat + v >= 4) d = lastDeg > 11 ? 14 : 7;     // land on D
                notes.push({ deg: d, beat, len: v });
                lastDeg = d; first = false;
            }
            beat += Math.abs(v);
        }
        return notes;
    }

    function writePhrase(prog) {
        if (!motif || barIdx % (prog.length * 2) === 0) {
            const rhythms = prog.map((_, i) => i === prog.length - 1 ? [4] : pick(RHYTHMS));
            motif = { rhythms, bars: prog.slice(0, 2).map((ch, i) => writeBar(ch, rhythms[i], false)) };
        }
        // A (bars 0-3) + A' (bars 4-7): both halves open with the motif's two bars.
        const half = prog.length / 2;
        return prog.map((ch, i) => {
            const k = i % half;
            if (k < 2) {
                const bar = motif.bars[k];
                if (bar.length) lastDeg = bar[bar.length - 1].deg;
                return bar;
            }
            return writeBar(ch, motif.rhythms[i], i === prog.length - 1 || i === half - 1);
        });
    }

    function scheduleBar(c, t, m) {
        const cfg = MODES[m];
        const beat = 60 / cfg.bpm, barLen = beat * 4;
        const k = barIdx % cfg.prog.length;
        if (k === 0) phrase = writePhrase(cfg.prog);
        const chord = CHORDS[cfg.prog[k]];

        chord.forEach(d => pad(c, musicIn, deg(d) + (d > 6 ? -12 : 0), t, barLen, 0.027));
        bass(c, musicIn, deg(chord[0]) - 12, t, barLen * 0.95, cfg.pulse ? 0.16 : 0.13);
        phrase[k].forEach(n => lead(c, musicIn, deg(n.deg), t + n.beat * beat, n.len * beat * 0.96, 0.13));

        if (cfg.bells) {
            [1.5, 3.5].forEach((b, i) => {
                if (Math.random() < 0.55) bell(c, musicIn, deg(chord[(k + i) % 3] + 14), t + b * beat, 0.035, 2.2);
            });
        }
        if (cfg.pulse) {
            for (let b = 0; b < 4; b++) {
                thump(c, musicIn, t + b * beat, 0.30);
                thump(c, musicIn, t + (b + 0.32) * beat, 0.16);
            }
        }
        return barLen;
    }

    function tick() {
        timer = null;
        const c = A();
        if (!c || !mode) return;
        if (c.state === 'running') {
            if (nextBar < c.currentTime) nextBar = c.currentTime + 0.1;
            while (nextBar < c.currentTime + 1.5) {
                if (pending !== null) { mode = pending; pending = null; barIdx = 0; motif = null; }
                if (!mode) return;
                nextBar += scheduleBar(c, nextBar, mode);
                barIdx++;
            }
        }
        timer = setTimeout(tick, 400);
    }

    function ensureChain() {
        const c = A();
        if (!c || musicIn) return c;
        musicIn = c.createGain();
        duck = c.createGain();
        musicIn.connect(duck);
        duck.connect(GameAudio.bus.musicFader);
        return c;
    }

    /* ─── Public API ─────────────────────────────────────────────────────── */
    // One place decides the duck level, so mode/pause calls can't fight.
    function applyDuck(tc) {
        const c = ensureChain();
        if (!c) return;
        duck.gain.cancelScheduledValues(c.currentTime);
        duck.gain.setTargetAtTime(!mode ? 0 : ducked ? 0.35 : 1, c.currentTime, tc);
    }

    // Switch score at the next bar line ('title' | 'battle' | 'boss'); null fades out.
    function setMode(m) {
        if (!m) { mode = null; pending = null; applyDuck(0.6); return; }
        if (!mode) {
            mode = m; barIdx = 0; motif = null;
            const c = A();
            if (c) nextBar = c.currentTime + 0.1;
        } else {
            pending = (m === mode) ? null : m;
        }
        applyDuck(0.3);
        if (!timer) tick();   // also (re)starts once the context exists
    }

    // Pause/modal: sink the score under the menu instead of stopping it.
    function setDucked(on) {
        if (ducked === !!on) return;
        ducked = !!on;
        applyDuck(0.25);
    }

    // Tonal SFX cues, routed through the SFX fader + reverb.
    const CUES = {
        // Stage clear: rising Dm6 arpeggio (D F A B D) — the B is the Dorian color.
        reward: (c, o, t, v) => [14, 16, 18, 19, 21].forEach((d, i) =>
            bell(c, o, deg(d), t + i * 0.085, v * (0.65 + 0.35 * i / 4), i === 4 ? 2.6 : 1.3)),
        // Relic / equipment: strummed Dm6 shimmer + held lead D5.
        relic: (c, o, t, v) => {
            [14, 16, 18, 19].forEach((d, i) => bell(c, o, deg(d), t + i * 0.05, v * 0.75, 2.8));
            bell(c, o, deg(21), t + 0.3, v * 0.55, 3.2);
            lead(c, o, deg(14), t + 0.05, 1.0, v * 0.35);
        },
        // Promotion: full Dorian run up the octave, then a ringing D-F-A.
        promote: (c, o, t, v) => {
            for (let i = 0; i <= 7; i++) bell(c, o, deg(7 + i), t + i * 0.045, v * (0.45 + 0.55 * i / 7), 0.9);
            [14, 16, 18].forEach(d => bell(c, o, deg(d), t + 0.38, v * 0.7, 2.4));
        },
        // Game over: slow lament A-G-F-E-D over a low D drone.
        gameover: (c, o, t, v) => {
            [11, 10, 9, 8, 7].forEach((d, i) => lead(c, o, deg(d), t + i * 0.6, i === 4 ? 2.4 : 0.55, v * 0.5));
            bass(c, o, deg(0) - 12, t, 4.2, v * 0.5);
        }
    };
    function cue(name, vol) {
        const c = A(), fn = CUES[name];
        if (!c || !fn || c.state !== 'running') return;
        fn(c, GameAudio.bus.cueBus, c.currentTime + 0.01, vol);
    }

    /* ─── Scene wiring ───────────────────────────────────────────────────── */
    const bossOr = () => ((window.stage || 1) % 10 === 0 ? 'boss' : 'battle');
    function syncToScene() {
        const SM = window.SceneManager;
        if (!SM || !window.SCENES) return;
        if (SM.has(SCENES.GAME_OVER)) return setMode(null);
        if (SM.has(SCENES.GAME)) { setMode(bossOr()); setDucked(SM.has(SCENES.MODAL) || SM.has(SCENES.PAUSE)); return; }
        if (SM.has(SCENES.START)) setMode('title');
    }
    if (window.EventBus) {
        EventBus.on('sceneChanged', syncToScene);
        EventBus.on('audio:ready', syncToScene);       // first gesture creates the context
        EventBus.on('stageChanged', () => { if (window.SceneManager && SceneManager.has(SCENES.GAME)) setMode(bossOr()); });
        EventBus.on('sceneEntered', (name) => {
            if (name === 'GAME_OVER') setTimeout(() => cue('gameover', 0.3), 700); // after the impact sample
        });
    }

    window.GameMusic = { setMode, setDucked, cue, deg, hz };
})();
