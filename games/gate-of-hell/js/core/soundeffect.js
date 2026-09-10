/* soundeffect.js — SFX playback (Web Audio API).
 *
 * Files live in `sounds/<key>.mp3` (Pixabay Content License, see sounds/CREDITS.json).
 * Context is created on the first user gesture (autoplay policy), then every
 * clip is fetched + decoded once into `buffers`.
 *
 * Call sites use `playSFX(key)` / `sfxAttack(unitType)`; both are no-ops until
 * buffers land, so they are safe to call from load-order-earlier files.
 *
 * Attack sounds are bucketed by projectile `kind` (window.PROJ_DESIGN), not per
 * unit — 84 units collapse to 9 clips.
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
    promote:    [0.50,  80],
    sacrifice:  [0.45,  80],
    ui_click:   [0.30,  60],
    reward:     [0.45, 200],
    relic:      [0.55, 200]
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

/* ─── State ─────────────────────────────────────────────────────────────── */
let audioCtx = null;
let masterGain = null;
const soundBuffers = {};
const lastPlayed = {};
let liveVoices = 0;

let sfxEnabled = (localStorage.getItem('goh_sfx_enabled') !== 'false');
const _savedVol = parseFloat(localStorage.getItem('goh_sfx_volume'));
let globalVolume = isNaN(_savedVol) ? 0.6 : Math.max(0, Math.min(1, _savedVol));

/* ─── Init & loading ────────────────────────────────────────────────────── */
function initAudioContext() {
    if (audioCtx) return audioCtx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;

    audioCtx = new Ctx();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = sfxEnabled ? globalVolume : 0;
    masterGain.connect(audioCtx.destination);
    loadAllSounds();
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
        soundBuffers[name] = await audioCtx.decodeAudioData(await res.arrayBuffer());
    } catch (e) {
        // ponytail: a missing/undecodable clip just stays silent — no retry, no fallback chain.
        if (typeof GameLogger !== 'undefined') GameLogger.warn('SFX load failed: ' + name);
    }
}

/* ─── Playback ──────────────────────────────────────────────────────────── */
/**
 * Play a sound effect by key. Silently ignored before the audio context exists,
 * while muted, when the key is throttled, or when the voice cap is hit.
 * @param {string} key   - SFX_CFG key.
 * @param {number} scale - Optional volume multiplier (default 1).
 */
function playSFX(key, scale = 1) {
    if (!audioCtx || !sfxEnabled) return;
    const buf = soundBuffers[key];
    if (!buf) return;

    const cfg = SFX_CFG[key] || [0.3, 80];
    const now = performance.now();
    if (now - (lastPlayed[key] || 0) < cfg[1]) return;
    if (liveVoices >= MAX_VOICES) return;
    lastPlayed[key] = now;

    if (audioCtx.state === 'suspended') audioCtx.resume();

    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const gain = audioCtx.createGain();
    gain.gain.value = cfg[0] * scale;
    src.connect(gain);
    gain.connect(masterGain);
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
function setSfxEnabled(on) {
    sfxEnabled = !!on;
    localStorage.setItem('goh_sfx_enabled', sfxEnabled);
    if (masterGain) masterGain.gain.value = sfxEnabled ? globalVolume : 0;
    if (sfxEnabled) initAudioContext();
}

function setMasterVolume(v) {
    globalVolume = Math.max(0, Math.min(1, v));
    localStorage.setItem('goh_sfx_volume', globalVolume);
    if (masterGain && sfxEnabled) masterGain.gain.value = globalVolume;
    const out = document.getElementById('sfx-volume-val');
    if (out) out.textContent = Math.round(globalVolume * 100) + '%';
}

/** Push current state into the settings-modal controls (markup is injected late). */
function syncSfxControls() {
    const box = document.getElementById('sfx-toggle');
    if (box) box.checked = sfxEnabled;
    const range = document.getElementById('sfx-volume');
    if (range) range.value = Math.round(globalVolume * 100);
    const out = document.getElementById('sfx-volume-val');
    if (out) out.textContent = Math.round(globalVolume * 100) + '%';
}

/* ─── Event hooks ───────────────────────────────────────────────────────── */
if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.ENEMY_REACHED_PORTAL, () => playSFX('portal_hit'));
    EventBus.on(GAME_EVENTS.RELIC_NOTIF, () => playSFX('relic'));
    EventBus.on(GAME_EVENTS.EQUIP_NOTIF, () => playSFX('relic'));
    EventBus.on(GAME_EVENTS.STAGE_CHANGED, (s) => { if (s > 1) playSFX('reward'); });
}

// Delegated UI click sound — avoids touching every button handler.
document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('button, .tower-card, .lang-tb')) playSFX('ui_click');
}, true);

// Settings modal toggle (markup lives in ui_templates.js). Modal HTML is injected
// at runtime, so bind on first open via delegation rather than a direct lookup.
document.addEventListener('change', (e) => {
    if (!e.target) return;
    if (e.target.id === 'sfx-toggle') setSfxEnabled(e.target.checked);
    if (e.target.id === 'sfx-volume') playSFX('ui_click'); // audible preview on release
});
document.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'sfx-volume') setMasterVolume(e.target.value / 100);
});
document.addEventListener('DOMContentLoaded', syncSfxControls);

// Unlock audio on the first user gesture (browser autoplay policy).
['pointerdown', 'keydown'].forEach(evt => {
    window.addEventListener(evt, () => {
        initAudioContext();
        syncSfxControls();
    }, { once: true });
});

/* ─── Exports ───────────────────────────────────────────────────────────── */
window.playSFX = playSFX;
window.sfxAttack = sfxAttack;
window.setSfxEnabled = setSfxEnabled;
window.setMasterVolume = setMasterVolume;
window.isSfxEnabled = () => sfxEnabled;
window.sfxStatus = () => ({
    state: audioCtx ? audioCtx.state : 'none',
    volume: globalVolume,
    gain: masterGain ? masterGain.gain.value : null,
    loaded: Object.keys(soundBuffers).length,
    missing: Object.keys(SFX_CFG).filter(k => !soundBuffers[k]),
    voices: liveVoices
});
