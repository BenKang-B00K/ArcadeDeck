/* soundeffect.js — Audio engine: mixer buses, sample SFX, volume/mute state.
 *
 * Graph (built on the first user gesture — autoplay policy):
 *
 *   samples ──────────────────────► sfxFader ─┐
 *   music.js cues ─► cueBus ─┬────► sfxFader  │
 *                            └─► cueVerb ─┐   ├─► limiter ─► masterOut ─► out
 *   music.js score ─► musicFader ─┬───────┼───┘
 *                                 └─► musicVerb ─► reverb ─► limiter
 *
 * Samples live in `sounds/<key>.mp3` (Pixabay Content License, see
 * sounds/CREDITS.json); each is fetched + decoded once. Tonal cues (stage
 * clear, relic, promotion, game over) are synthesized in D Dorian by
 * music.js so they always sit in key with the score.
 *
 * Call sites use `playSFX(key)` / `sfxAttack(unitType)`; both are no-ops until
 * the context exists, so they are safe from load-order-earlier files.
 */

/* ─── Registry ──────────────────────────────────────────────────────────── */
// key: [volume, throttleMs]  — throttle guards against 28 towers firing at once.
const SFX_CFG = {
    atk_arrow:  [0.30,  90],
    atk_slash:  [0.30,  90],
    atk_magic:  [0.26,  90],
    atk_flame:  [0.30,  90],
    atk_ice:    [0.26,  90],
    atk_bolt:   [0.28,  90],
    atk_holy:   [0.26,  90],
    atk_dark:   [0.28,  90],
    atk_item:   [0.26,  90],
    hit:        [0.22,  70],
    crit:       [0.40, 140],
    death:      [0.28,  70],
    boss_death: [0.60, 500],
    wave:       [0.28, 300],
    boss_spawn: [0.70, 500],
    portal_hit: [0.45, 120],
    gameover:   [0.70, 500],
    summon:     [0.45,  80],
    sacrifice:  [0.45,  80],
    ui_click:   [0.30,  60]
};

// Synthesized Dorian cues (music.js). Same [volume, throttleMs] shape.
// Levels measured against the samples: relic ≈ boss_spawn loudness, others below.
const CUE_CFG = {
    reward:  [0.22, 400],
    relic:   [0.28, 300],
    promote: [0.22, 150]
};

// Projectile kind → attack clip. Unlisted kinds fall back to atk_magic.
const KIND_SFX = {
    arrow: 'atk_arrow', dart: 'atk_arrow', feather: 'atk_arrow',
    slash: 'atk_slash', scythe: 'atk_slash', dagger: 'atk_slash',
    flame: 'atk_flame',
    shard: 'atk_ice',
    bolt:  'atk_bolt',  beam: 'atk_bolt',  chain: 'atk_bolt',
    cross: 'atk_holy',
    skull: 'atk_dark',
    coin:  'atk_item',  bottle: 'atk_item', paper: 'atk_item'
};

const SFX_PATH = 'sounds/';
const MAX_VOICES = 14;
const CUE_VERB_LEVEL = 0.55;   // cue reverb send, scaled by the SFX fader
const MUSIC_VERB_LEVEL = 0.45; // score reverb send (post-fader)

/* ─── State ─────────────────────────────────────────────────────────────── */
let audioCtx = null;
const bus = {};               // sfxFader, musicFader, cueBus, cueVerb, reverb, masterOut
const soundBuffers = {};
const lastPlayed = {};
let liveVoices = 0;

function _readVol(key, def) {
    const v = parseFloat(localStorage.getItem(key));
    return isNaN(v) ? def : Math.max(0, Math.min(1, v));
}
const audioPrefs = {
    sfxOn:    localStorage.getItem('goh_sfx_enabled') !== 'false',
    sfxVol:   _readVol('goh_sfx_volume', 0.6),
    musicOn:  localStorage.getItem('goh_music_enabled') !== 'false',
    musicVol: _readVol('goh_music_volume', 0.35),
    muted:    localStorage.getItem('goh_audio_muted') === 'true'
};

/* ─── Init & loading ────────────────────────────────────────────────────── */
// Dark stone-hall impulse: low-passed noise with an exponential tail.
function _makeImpulse(ctx, seconds, decay) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        let lp = 0;
        for (let i = 0; i < len; i++) {
            lp += 0.35 * ((Math.random() * 2 - 1) - lp);
            d[i] = lp * Math.pow(1 - i / len, decay);
        }
    }
    return buf;
}

function initAudioContext() {
    if (audioCtx) return audioCtx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;

    audioCtx = new Ctx();
    const c = audioCtx;
    const gain = (v) => { const g = c.createGain(); g.gain.value = v; return g; };

    bus.masterOut = gain(audioPrefs.muted ? 0 : 1);
    bus.masterOut.connect(c.destination);

    // Gentle brick-wall: 14 sample voices + score + cues never clip.
    const lim = c.createDynamicsCompressor();
    lim.threshold.value = -6; lim.knee.value = 4; lim.ratio.value = 12;
    lim.attack.value = 0.002; lim.release.value = 0.2;
    lim.connect(bus.masterOut);

    bus.reverb = c.createConvolver();
    bus.reverb.buffer = _makeImpulse(c, 2.8, 2.6);
    bus.reverb.connect(lim);

    bus.sfxFader = gain(0);
    bus.sfxFader.connect(lim);
    bus.cueBus = gain(1);
    bus.cueBus.connect(bus.sfxFader);
    bus.cueVerb = gain(0);
    bus.cueBus.connect(bus.cueVerb);
    bus.cueVerb.connect(bus.reverb);

    bus.musicFader = gain(0);
    bus.musicFader.connect(lim);
    const musicVerb = gain(MUSIC_VERB_LEVEL);
    bus.musicFader.connect(musicVerb);
    musicVerb.connect(bus.reverb);

    _applyFaders(true);
    loadAllSounds();
    if (window.EventBus) EventBus.emit('audio:ready');
    return audioCtx;
}

function loadAllSounds() {
    Object.keys(SFX_CFG).forEach(key => loadSound(key, SFX_PATH + key + '.mp3'));
}

async function loadSound(name, url) {
    if (!audioCtx || soundBuffers[name]) return;
    try {
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.arrayBuffer();
        // Callback form: older iOS Safari has no promise-returning decodeAudioData.
        soundBuffers[name] = await new Promise((ok, fail) => audioCtx.decodeAudioData(data, ok, fail));
    } catch (e) {
        // ponytail: a missing/undecodable clip just stays silent — no retry, no fallback chain.
        if (typeof GameLogger !== 'undefined') GameLogger.warn('SFX load failed: ' + name);
    }
}

/* ─── Playback ──────────────────────────────────────────────────────────── */
function _throttled(key, ms) {
    const now = performance.now();
    if (now - (lastPlayed[key] || 0) < ms) return true;
    lastPlayed[key] = now;
    return false;
}

/**
 * Play a sound effect by key. Silently ignored before the audio context exists,
 * while SFX are off, when the key is throttled, or when the voice cap is hit.
 * @param {string} key   - SFX_CFG or CUE_CFG key.
 * @param {number} scale - Optional volume multiplier (default 1).
 */
function playSFX(key, scale = 1) {
    if (!audioCtx || !audioPrefs.sfxOn || audioPrefs.muted) return;

    const cue = CUE_CFG[key];
    if (cue) {
        if (_throttled(key, cue[1])) return;
        if (window.GameMusic) GameMusic.cue(key, cue[0] * scale);
        return;
    }

    const buf = soundBuffers[key];
    if (!buf || liveVoices >= MAX_VOICES) return;
    const cfg = SFX_CFG[key] || [0.3, 80];
    if (_throttled(key, cfg[1])) return;

    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const g = audioCtx.createGain();
    g.gain.value = cfg[0] * scale;
    src.connect(g);
    g.connect(bus.sfxFader);
    liveVoices++;
    src.onended = () => { liveVoices--; };
    src.start();
}

/**
 * Play the attack clip for a unit type, bucketed by its projectile kind.
 */
function sfxAttack(unitType) {
    const d = window.PROJ_DESIGN ? window.PROJ_DESIGN[unitType] : null;
    playSFX((d && KIND_SFX[d.kind]) || 'atk_magic');
}

/* ─── Volume / mute ─────────────────────────────────────────────────────── */
// Click-free fader moves (a hard .value write zippers on a playing voice).
function _applyFaders(instant) {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const set = (node, v) => instant ? (node.gain.value = v) : node.gain.setTargetAtTime(v, t, 0.04);
    const sfx = audioPrefs.sfxOn ? audioPrefs.sfxVol : 0;
    set(bus.sfxFader, sfx);
    set(bus.cueVerb, sfx * CUE_VERB_LEVEL);
    set(bus.musicFader, audioPrefs.musicOn ? audioPrefs.musicVol : 0);
    set(bus.masterOut, audioPrefs.muted ? 0 : 1);
}

function _changed() {
    _applyFaders(false);
    if (window.EventBus) EventBus.emit('audio:changed', getAudioPrefs());
}

function setSfxEnabled(on) {
    audioPrefs.sfxOn = !!on;
    localStorage.setItem('goh_sfx_enabled', audioPrefs.sfxOn);
    _changed();
}
function setSfxVolume(v) {
    audioPrefs.sfxVol = Math.max(0, Math.min(1, v));
    localStorage.setItem('goh_sfx_volume', audioPrefs.sfxVol);
    _changed();
}
function setMusicEnabled(on) {
    audioPrefs.musicOn = !!on;
    localStorage.setItem('goh_music_enabled', audioPrefs.musicOn);
    _changed();
}
function setMusicVolume(v) {
    audioPrefs.musicVol = Math.max(0, Math.min(1, v));
    localStorage.setItem('goh_music_volume', audioPrefs.musicVol);
    _changed();
}
function setAudioMuted(m) {
    audioPrefs.muted = !!m;
    localStorage.setItem('goh_audio_muted', audioPrefs.muted);
    _changed();
}
function getAudioPrefs() { return Object.assign({}, audioPrefs); }

/* ─── Event hooks ───────────────────────────────────────────────────────── */
if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.ENEMY_REACHED_PORTAL, () => playSFX('portal_hit'));
    EventBus.on(GAME_EVENTS.RELIC_NOTIF, ({ show } = {}) => { if (show) playSFX('relic'); });
    EventBus.on(GAME_EVENTS.EQUIP_NOTIF, ({ show } = {}) => { if (show) playSFX('relic'); });
    EventBus.on(GAME_EVENTS.STAGE_CHANGED, (s) => { if (s > 1) playSFX('reward'); });
}

// Delegated UI click sound — avoids touching every button handler.
document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('button, .tower-card, .lang-tb')) playSFX('ui_click');
}, true);

// Unlock on a gesture that grants user activation. Chrome only counts
// pointerup/touchend (not touch pointerdown); iOS needs resume() inside the
// gesture again after an interruption (call, Siri, app switch) — so listeners
// stay attached and the check is one property read once running.
['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'].forEach(evt => {
    window.addEventListener(evt, () => {
        if (document.hidden) return;
        if (!initAudioContext() || audioCtx.state === 'running') return;
        audioCtx.resume().catch(() => {});
    }, { capture: true, passive: true });
});

// Backgrounded tab / locked phone: stop the score and release the audio device.
document.addEventListener('visibilitychange', () => {
    if (!audioCtx) return;
    if (document.hidden) audioCtx.suspend().catch(() => {});
    else audioCtx.resume().catch(() => {});
});

/* ─── Exports ───────────────────────────────────────────────────────────── */
window.GameAudio = {
    ctx: () => audioCtx,
    bus,
    prefs: getAudioPrefs,
    setSfxEnabled, setSfxVolume, setMusicEnabled, setMusicVolume, setAudioMuted
};
window.playSFX = playSFX;
window.sfxAttack = sfxAttack;
window.isSfxEnabled = () => audioPrefs.sfxOn;
window.sfxStatus = () => ({
    state: audioCtx ? audioCtx.state : 'none',
    prefs: getAudioPrefs(),
    loaded: Object.keys(soundBuffers).length,
    missing: Object.keys(SFX_CFG).filter(k => !soundBuffers[k]),
    voices: liveVoices
});
