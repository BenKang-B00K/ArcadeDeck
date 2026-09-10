/* units_pixi.js — Pure Pixi sprite path for units/towers/shrines.
 *
 * Mirrors the enemy migration pattern (whispering_spirit_pixi.js):
 *   - Registry maps unit type → { drawFn, size, frames, cycleMs }
 *   - Lazy bake of animation frames into PIXI.AnimatedSprite textures
 *   - Per-tower sprite pool + shadow Graphics on worldLayer
 *   - GC against window.towers each frame
 *
 * Auras / range indicators rendered as Pixi Graphics alongside the sprite.
 * Cooldown indicator: vivid cyan hex outline whose alpha fades as the attack
 * recharges (matches ctx2d drawUnitCooldown).
 *
 * Mirror trick: bake at isLeft=true; for right-slot towers, set
 * sprite.scale.x = -1 (pUnit only differs by x-flip, so mirror is exact).
 */

const PIXI_UNIT_REGISTRY = {
    // ── Shrines (handled specially via tower.isShrine + tier) ──────────
    'shrine_normal': { drawFn: 'drawShrineNormal', size: 140, frames: 8, cycleMs: 2400 },
    'shrine_power':  { drawFn: 'drawShrinePower',  size: 160, frames: 8, cycleMs: 2400 },

    // ── Tier 1 ─────────────────────────────────────────────────────────
    'apprentice':       { drawFn: 'drawApprentice',       size: 150, frames: 8, cycleMs: 2400 },
    'novice_exorcist':  { drawFn: 'drawNoviceExorcist',   size: 150, frames: 8, cycleMs: 2400 },
    'acolyte_priest':   { drawFn: 'drawAcolytePriest',    size: 150, frames: 8, cycleMs: 2400 },
    'acolyte_warrior':  { drawFn: 'drawAcolyteWarrior',   size: 150, frames: 8, cycleMs: 2400 },

    // ── Tier 2 ─────────────────────────────────────────────────────────
    'knight':           { drawFn: 'drawKnight',           size: 130, frames: 8, cycleMs: 2400 },
    'fire':             { drawFn: 'drawFire',             size: 130, frames: 8, cycleMs: 2400 },
    'archer':           { drawFn: 'drawArcher',           size: 130, frames: 8, cycleMs: 2400 },
    'chainer':          { drawFn: 'drawChainer',          size: 130, frames: 8, cycleMs: 2400 },
    'ice':              { drawFn: 'drawIce',              size: 130, frames: 8, cycleMs: 2400 },
    'tracker':          { drawFn: 'drawTracker',          size: 130, frames: 8, cycleMs: 2400 },
    'talisman':         { drawFn: 'drawTalisman',         size: 130, frames: 8, cycleMs: 2400 },
    'monk':             { drawFn: 'drawMonk',             size: 130, frames: 8, cycleMs: 2400 },
    'necromancer':      { drawFn: 'drawNecromancer',      size: 130, frames: 8, cycleMs: 2400 },
    'guardian':         { drawFn: 'drawGuardian',         size: 130, frames: 8, cycleMs: 2400 },
    'alchemist':        { drawFn: 'drawAlchemist',        size: 130, frames: 8, cycleMs: 2400 },
    'mirror':           { drawFn: 'drawMirror',           size: 130, frames: 8, cycleMs: 2400 },
    'assassin':         { drawFn: 'drawAssassin',         size: 130, frames: 8, cycleMs: 2400 },
    'verse_warrior':    { drawFn: 'drawVerseWarrior',     size: 130, frames: 8, cycleMs: 2400 },
    'hymn_blaster':     { drawFn: 'drawHymnBlaster',      size: 130, frames: 8, cycleMs: 2400 },
    'exorcism_mage':    { drawFn: 'drawExorcismMage',     size: 130, frames: 8, cycleMs: 2400 },
    'prayer_herald':    { drawFn: 'drawPrayerHerald',     size: 130, frames: 8, cycleMs: 2400 },
    'relic_keeper':     { drawFn: 'drawRelicKeeper',      size: 130, frames: 8, cycleMs: 2400 },
    'ward_scribe':      { drawFn: 'drawWardScribe',       size: 130, frames: 8, cycleMs: 2400 },
    'lightning_mage':   { drawFn: 'drawLightningMage',    size: 130, frames: 8, cycleMs: 2400 },

    // ── Tier 3 — Attack Path ───────────────────────────────────────────
    'paladin':          { drawFn: 'drawPaladin',          size: 140, frames: 8, cycleMs: 2400 },
    'crusader':         { drawFn: 'drawCrusader',         size: 140, frames: 8, cycleMs: 2400 },
    'hellfire':         { drawFn: 'drawHellfireAlchemist',size: 140, frames: 8, cycleMs: 2400 },
    'phoenix':          { drawFn: 'drawPhoenixSummoner',  size: 140, frames: 8, cycleMs: 2400 },
    'voidsniper':       { drawFn: 'drawVoidSniper',       size: 140, frames: 8, cycleMs: 2400 },
    'thousandhand':     { drawFn: 'drawThousandHand',     size: 140, frames: 8, cycleMs: 2400 },
    'scripture_knight': { drawFn: 'drawScriptureKnight',  size: 140, frames: 8, cycleMs: 2400 },
    'seal_warrior':     { drawFn: 'drawSealWarrior',      size: 140, frames: 8, cycleMs: 2400 },
    'tome_cannon':      { drawFn: 'drawTomeCannon',       size: 140, frames: 8, cycleMs: 2400 },
    'holy_burst':       { drawFn: 'drawHolyBurst',        size: 140, frames: 8, cycleMs: 2400 },
    'rapid_exorcist':   { drawFn: 'drawRapidExorcist',    size: 140, frames: 8, cycleMs: 2400 },
    'chain_exorcist':   { drawFn: 'drawChainExorcist',    size: 140, frames: 8, cycleMs: 2400 },
    'storm_caller':     { drawFn: 'drawStormCaller',      size: 140, frames: 8, cycleMs: 2400 },
    'thunder_judge':    { drawFn: 'drawThunderJudge',     size: 140, frames: 8, cycleMs: 2400 },

    // ── Tier 3 — Support Path ──────────────────────────────────────────
    'executor':         { drawFn: 'drawExecutor',         size: 140, frames: 8, cycleMs: 2400 },
    'binder':           { drawFn: 'drawBinder',           size: 140, frames: 8, cycleMs: 2400 },
    'absolutezero':     { drawFn: 'drawAbsoluteZero',     size: 140, frames: 8, cycleMs: 2400 },
    'permafrost':       { drawFn: 'drawPermafrost',       size: 140, frames: 8, cycleMs: 2400 },
    'seer':             { drawFn: 'drawSeer',             size: 140, frames: 8, cycleMs: 2400 },
    'commander':        { drawFn: 'drawCommander',        size: 140, frames: 8, cycleMs: 2400 },
    'psalm_singer':     { drawFn: 'drawPsalmSinger',      size: 140, frames: 8, cycleMs: 2400 },
    'litany_chanter':   { drawFn: 'drawLitanyChanter',    size: 140, frames: 8, cycleMs: 2400 },
    'relic_guardian':   { drawFn: 'drawRelicGuardian',    size: 140, frames: 8, cycleMs: 2400 },
    'rune_crafter':     { drawFn: 'drawRuneCrafter',      size: 140, frames: 8, cycleMs: 2400 },
    'barrier_master':   { drawFn: 'drawBarrierMaster',    size: 140, frames: 8, cycleMs: 2400 },
    'divine_barrier':   { drawFn: 'drawDivineBarrier',    size: 140, frames: 8, cycleMs: 2400 },

    // ── Tier 3 — Special Path ──────────────────────────────────────────
    'grandsealer':      { drawFn: 'drawGrandSealer',      size: 140, frames: 8, cycleMs: 2400 },
    'flamemaster':      { drawFn: 'drawFlameMaster',      size: 140, frames: 8, cycleMs: 2400 },
    'vajra':            { drawFn: 'drawVajrapani',        size: 140, frames: 8, cycleMs: 2400 },
    'saint':            { drawFn: 'drawSaint',            size: 140, frames: 8, cycleMs: 2400 },
    'wraithlord':       { drawFn: 'drawWraithLord',       size: 140, frames: 8, cycleMs: 2400 },
    'cursedshaman':     { drawFn: 'drawCursedShaman',     size: 140, frames: 8, cycleMs: 2400 },
    'rampart':          { drawFn: 'drawRampart',          size: 140, frames: 8, cycleMs: 2400 },
    'judgment':         { drawFn: 'drawJudgment',         size: 140, frames: 8, cycleMs: 2400 },
    'midas':            { drawFn: 'drawMidas',            size: 140, frames: 8, cycleMs: 2400 },
    'philosopher':      { drawFn: 'drawPhilosopher',      size: 140, frames: 8, cycleMs: 2400 },
    'illusion':         { drawFn: 'drawIllusion',         size: 140, frames: 8, cycleMs: 2400 },
    'reflection':       { drawFn: 'drawReflection',       size: 140, frames: 8, cycleMs: 2400 },
    'abyssal':          { drawFn: 'drawAbyssalKiller',    size: 140, frames: 8, cycleMs: 2400 },
    'spatial':          { drawFn: 'drawSpatialSlasher',   size: 140, frames: 8, cycleMs: 2400 },

    // ── Tier 4 — Legendary ─────────────────────────────────────────────
    'eternal_wall':     { drawFn: 'drawEternalWall',      size: 160, frames: 8, cycleMs: 2400 },
    'purgatory':        { drawFn: 'drawPurgatory',        size: 160, frames: 8, cycleMs: 2400 },
    'piercing_shadow':  { drawFn: 'drawPiercingShadow',   size: 160, frames: 8, cycleMs: 2400 },
    'warden':           { drawFn: 'drawWarden',           size: 160, frames: 8, cycleMs: 2400 },
    'cocytus':          { drawFn: 'drawCocytus',          size: 160, frames: 8, cycleMs: 2400 },
    'doom_guide':       { drawFn: 'drawDoomGuide',        size: 160, frames: 8, cycleMs: 2400 },
    'cursed_talisman':  { drawFn: 'drawCursedTalisman',   size: 160, frames: 8, cycleMs: 2400 },
    'asura':            { drawFn: 'drawAsura',            size: 160, frames: 8, cycleMs: 2400 },
    'forsaken_king':    { drawFn: 'drawForsakenKing',     size: 180, frames: 8, cycleMs: 2400 },
    'reaper':           { drawFn: 'drawReaper',           size: 160, frames: 8, cycleMs: 2400 },
    'void_gatekeeper':  { drawFn: 'drawVoidGatekeeper',   size: 160, frames: 8, cycleMs: 2400 },
    'transmuter':       { drawFn: 'drawTransmuter',       size: 160, frames: 8, cycleMs: 2400 },
    'oracle':           { drawFn: 'drawOracle',           size: 160, frames: 8, cycleMs: 2400 },
    'word_of_god':      { drawFn: 'drawWordOfGod',        size: 160, frames: 8, cycleMs: 2400 },
    'genesis_strike':   { drawFn: 'drawGenesisStrike',    size: 160, frames: 8, cycleMs: 2400 },
    'exorcism_storm':   { drawFn: 'drawExorcismStorm',    size: 160, frames: 8, cycleMs: 2400 },
    'divine_choir':     { drawFn: 'drawDivineChoir',      size: 160, frames: 8, cycleMs: 2400 },
    'sacred_reliquary': { drawFn: 'drawSacredReliquary',  size: 160, frames: 8, cycleMs: 2400 },
    'grand_ward':       { drawFn: 'drawGrandWard',        size: 160, frames: 8, cycleMs: 2400 },
    'thunder_lord':     { drawFn: 'drawThunderLord',      size: 160, frames: 8, cycleMs: 2400 },
};

const PIXI_UNIT_BAKE_BASE_T = 2_000_000;
const UNIT_ATTACK_WINDOW_MS = 350; // matches drawApprentice etc. (350ms isAttacking)
// Every pix_*.js draws at S=2.0, so a bake holds 2 canvas px per art pixel.
// Keep the display scale at or above 0.5 — below that nearest sampling drops art
// rows outright (the old per-tier normalization ran at 0.55–0.64 of a bake that
// was already 1.2 px per art pixel, which ate 1px details and shimmered as the
// idle bob moved the sprite). 0.5 is the low end and the other exact ratio:
// one art pixel per screen pixel, so nothing is dropped or doubled.
const UNIT_RENDER_SCALE      = 0.50; // units only — shrines stay 1:1
const UNIT_ART_FOOT          = 66;   // art reaches ~66px below the draw centre at 1:1
const UNIT_ART_HEAD          = 63;   // …and ~63px above it
const UNIT_Y_OFFSET          = -6;   // sprite centre vs slot centre
const SHRINE_T1_Y_OFFSET     = -31;  // shrine art sits high in its bake canvas
const SHRINE_T2_Y_OFFSET     = -45;
const UNIT_COOLDOWN_Y_OFFSET = -14; // lift cooldown hex outline above slot center
// Shrine-buff sigil tints. T2 (global/sacred) = pale gold, T1 = pale ice;
// T1 matches SHRINE_LINK_COLOR in shrine_auras_pixi.js.
const SHRINE_SIGIL_T1 = 0x9FE8FF;
const SHRINE_SIGIL_T2 = 0xFFD98A;
// UNIT_ prefixed: every js/ file shares one global scope, and
// whispering_spirit_pixi.js already owns BAKE_PAD / BAKE_OVERSCAN.
const UNIT_BAKE_SCRATCH      = 400; // oversized bake canvas; tallest sprite is 245px
const UNIT_BAKE_PAD          = 4;   // guard band so a glow edge never touches the texture border
const _pixiUnitState  = new Map(); // type → { idleTex, attackTex, anchor, bakeFailed, pool, active(Map tower→record) }
const _unitShadowPool    = [];
const _unitCooldownPool  = [];
const _unitSelectionPool = [];
const _unitAuraGfxPool   = [];
const _unitAuraSpritePool= [];
const _unitHaloPool      = [];

if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        // Clear active sprite records per type (sprites destroyed by resetPixiScene).
        for (const state of _pixiUnitState.values()) {
            if (state.active && typeof state.active.clear === 'function') state.active.clear();
            if (Array.isArray(state.pool)) state.pool.length = 0;
        }
        _unitShadowPool.length = 0;
        _unitCooldownPool.length = 0;
        _unitSelectionPool.length = 0;
        _unitAuraGfxPool.length = 0;
        _unitAuraSpritePool.length = 0;
        _unitHaloPool.length = 0;
    });
}

/** Soft radial glow texture (white→transparent), shared. */
let _unitGlowTex = null;
const _UNIT_GLOW_TEX_SIZE = 128;
function _ensureUnitGlowTexture() {
    if (_unitGlowTex) return _unitGlowTex;
    const c = document.createElement('canvas');
    c.width = _UNIT_GLOW_TEX_SIZE; c.height = _UNIT_GLOW_TEX_SIZE;
    const g = c.getContext('2d');
    const r = _UNIT_GLOW_TEX_SIZE / 2;
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, _UNIT_GLOW_TEX_SIZE, _UNIT_GLOW_TEX_SIZE);
    _unitGlowTex = PIXI.Texture.from(c);
    return _unitGlowTex;
}

function _getUnitState(type) {
    let st = _pixiUnitState.get(type);
    if (!st) {
        st = { idleTex: null, attackTex: null, anchor: null, bakeFailed: false, pool: [], active: new Map() };
        _pixiUnitState.set(type, st);
    }
    return st;
}

/** Synthetic tower for bake. lastShot controls idle vs attack pose. */
function _synthBakeTower(type, attacking) {
    const isShrine = (typeof type === 'string' && type.indexOf('shrine_') === 0);
    const tier = isShrine ? (SHRINE_SACRED_TYPES.has(type) ? 2 : 1) : 2;
    return {
        data: { type, tier, name: type },
        currentSlot: { area: 'left-slots' },
        // attacking → lastShot at baseT (delta=0); idle → 9999ms ago (past 350ms threshold)
        lastShot: attacking ? PIXI_UNIT_BAKE_BASE_T : (PIXI_UNIT_BAKE_BASE_T - 9999),
        speedBonus: 0, rangeBonus: 0, range: 100,
        cooldown: 1000,
        isShrine,
        shrineHaloTier1: false, shrineHaloTier2: false,
    };
}

/* Twelve ally draw fns read performance.now() instead of Date.now() (see
 * drawDivineChoir, drawGrandWard, drawPsalmSinger...). Stubbing only Date.now
 * left those on the real wall clock, where `now - tower.lastShot` came out
 * NEGATIVE against the synthetic lastShot near 2_000_000 — so `isAtk` was true
 * for every one of them and they baked their attack pose into the idle
 * texture, flat 58x56 burst rect and all. Freeze both clocks together. */
function _withBakeClock(t, fn) {
    const origDate = Date.now;
    const origPerf = performance.now;
    Date.now = () => t;
    performance.now = () => t;
    try { return fn(); }
    finally { Date.now = origDate; performance.now = origPerf; }
}

/** Run one draw call into `ctx2d` with the draw centre at (cx, cy). */
function _drawBakeFrame(drawFn, ctx2d, synth, cx, cy) {
    if (drawFn.length >= 4) drawFn(ctx2d, synth, cx, cy, true);
    else                    drawFn(cx, cy, synth);
}

/**
 * Draw one pose's whole cycle onto oversized scratch canvases.
 * Returns { frames, emissives } — the emissive twin carries every pixel the art
 * drew under `lighter`/`screen`, so the finishing pass blooms exactly what the
 * artist marked as glowing instead of guessing from luminance.
 */
function _drawScratchSet(type, cfg, drawFn, attacking) {
    const origCtx = window.ctx;
    const origNow = Date.now;
    const synth = _synthBakeTower(type, attacking);
    const frames = [], emissives = [];
    const canEmit = typeof setUnitEmissiveTarget === 'function';
    try {
        for (let i = 0; i < cfg.frames; i++) {
            const off = document.createElement('canvas');
            off.width = off.height = UNIT_BAKE_SCRATCH;
            const offCtx = off.getContext('2d', { willReadFrequently: true });
            offCtx.imageSmoothingEnabled = false;

            const em = document.createElement('canvas');
            em.width = em.height = UNIT_BAKE_SCRATCH;
            const emCtx = em.getContext('2d', { willReadFrequently: true });
            emCtx.imageSmoothingEnabled = false;

            window.ctx = offCtx;
            if (canEmit) setUnitEmissiveTarget(emCtx);
            try {
                _withBakeClock(PIXI_UNIT_BAKE_BASE_T + (i / cfg.frames) * cfg.cycleMs, () =>
                    _drawBakeFrame(drawFn, offCtx, synth, UNIT_BAKE_SCRATCH / 2, UNIT_BAKE_SCRATCH / 2));
            } finally {
                if (canEmit) setUnitEmissiveTarget(null);
            }
            frames.push(off);
            emissives.push(em);
        }
    } finally {
        window.ctx = origCtx;
        Date.now   = origNow;
    }
    return { frames: frames, emissives: emissives };
}

/** Union of two {x0,y0,x1,y1} boxes; either may be null. */
function _unionBounds(a, b) {
    if (!a) return b;
    if (!b) return a;
    return {
        x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0),
        x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1),
    };
}

/** True if any pixel on this canvas region carries alpha. */
function _emHasInk(c2d, w, h) {
    const d = c2d.getImageData(0, 0, w, h).data;
    for (let i = 3; i < d.length; i += 16) if (d[i]) return true;
    return false;
}

/**
 * Crop scratch frames to `crop`, run the shared finishing pass, and turn them
 * into nearest-filtered textures. The finishing pass is what gives a sprite its
 * dimensionality — rim light on the upper-left of every mass, bloom on the
 * declared emissive pixels, a dark outline behind the art.
 */
function _cropToTextures(set, crop, isShrine) {
    const style = (typeof allyVfxStyle === 'function') ? allyVfxStyle(isShrine) : null;
    return set.frames.map((src, i) => {
        const out = document.createElement('canvas');
        out.width  = crop.w;
        out.height = crop.h;
        const oc = out.getContext('2d', { willReadFrequently: true });
        oc.imageSmoothingEnabled = false;
        oc.drawImage(src, -crop.x, -crop.y);

        if (style && typeof finishSpriteFrame === 'function') {
            // Always non-null, even when empty: passing null would opt this frame
            // into the luminance heuristic, which cannot tell an ivory pauldron
            // highlight from an actual light source.
            const emCrop = document.createElement('canvas');
            emCrop.width = crop.w; emCrop.height = crop.h;
            const ec = emCrop.getContext('2d', { willReadFrequently: true });
            ec.imageSmoothingEnabled = false;
            const emSrc = set.emissives && set.emissives[i];
            if (emSrc) ec.drawImage(emSrc, -crop.x, -crop.y);
            finishSpriteFrame(out, style, 2, null, emCrop);
        }
        return pixelTexture(out);
    });
}

function _bakePixiUnitFrames(type) {
    const cfg = _resolveCfg(type);
    if (!cfg) return null;
    const st = _getUnitState(type);
    if (st.idleTex || st.bakeFailed) return st.idleTex;
    const drawFn = window[cfg.drawFn];
    if (typeof drawFn !== 'function' || typeof PIXI === 'undefined') {
        st.bakeFailed = true;
        return null;
    }

    try {
        // Same three-pass bake the enemies use: draw oversized, measure the union
        // alpha box, crop to it. The registry's fixed square clipped 78 of 86
        // sprites — halos, wings and light beams reach ~170px above the draw
        // centre, well past a 140px canvas. Idle and attack share one crop so the
        // texture swap can't shift the sprite.
        const idle   = _drawScratchSet(type, cfg, drawFn, false);
        const attack = _drawScratchSet(type, cfg, drawFn, true);
        const isShrine = (typeof type === 'string' && type.indexOf('shrine_') === 0);
        const origin = UNIT_BAKE_SCRATCH / 2;
        // Measure each pose separately and union the results: the shared helper
        // stacks frames with source-over, so alpha accumulates — 16 stacked
        // frames push a 2/255 glow past the cutoff and the box swells to the
        // whole scratch. 8 is the frame count the cutoff was tuned against.
        const box = _unionBounds(
            (typeof measureSpriteAlphaBounds === 'function') ? measureSpriteAlphaBounds(idle.frames, UNIT_BAKE_SCRATCH) : null,
            (typeof measureSpriteAlphaBounds === 'function') ? measureSpriteAlphaBounds(attack.frames, UNIT_BAKE_SCRATCH) : null
        );
        const crop = box
            ? {
                x: Math.max(0, box.x0 - UNIT_BAKE_PAD),
                y: Math.max(0, box.y0 - UNIT_BAKE_PAD),
                w: Math.min(UNIT_BAKE_SCRATCH, box.x1 + UNIT_BAKE_PAD) - Math.max(0, box.x0 - UNIT_BAKE_PAD),
                h: Math.min(UNIT_BAKE_SCRATCH, box.y1 + UNIT_BAKE_PAD) - Math.max(0, box.y0 - UNIT_BAKE_PAD)
              }
            : { x: origin - cfg.size / 2, y: origin - cfg.size / 2, w: cfg.size, h: cfg.size };

        // Anchor keeps the draw origin under sprite.x/y, so every offset below
        // (and the isLeft mirror, which flips about that origin) stays valid.
        st.anchor    = { x: (origin - crop.x) / crop.w, y: (origin - crop.y) / crop.h };
        st.idleTex   = _cropToTextures(idle, crop, isShrine);
        st.attackTex = _cropToTextures(attack, crop, isShrine);
        console.log(`[pixi_unit] Baked idle+attack frames (${st.idleTex.length}×2) for "${type}" `
                  + `(${crop.w}x${crop.h}, was ${cfg.size}x${cfg.size}).`);
    } catch (err) {
        console.error(`[pixi_unit] bake failed for "${type}":`, err);
        st.bakeFailed = true;
        st.idleTex = null;
        st.attackTex = null;
        st.anchor = null;
    }
    return st.idleTex;
}

function _acquireUnitSprite(type) {
    const idleTex = _bakePixiUnitFrames(type);
    if (!idleTex || !window.entityLayer) return null;
    const st = _getUnitState(type);

    let sprite;
    if (st.pool.length > 0) {
        sprite = st.pool.pop();
        sprite.textures = idleTex;
    } else {
        sprite = new PIXI.AnimatedSprite(idleTex);
        sprite.loop = true;
        sprite.roundPixels = true;
    }
    // Crop moved the art's midpoint; this anchor puts the draw origin back under
    // sprite.x/y so the position offsets below need no adjustment.
    if (st.anchor) sprite.anchor.set(st.anchor.x, st.anchor.y);
    else sprite.anchor.set(0.5, 0.5);
    // Match playback to the baked cycle instead of a flat 0.08 for every unit.
    const ucfg = _resolveCfg(type); // shrine subtypes aren't registry keys
    sprite.animationSpeed = ucfg.frames / ((ucfg.cycleMs / 1000) * 60);
    sprite.visible = true;
    sprite.alpha = 1;
    sprite.scale.set(1, 1);
    sprite.tint = 0xFFFFFF;
    sprite.play();
    window.entityLayer.addChild(sprite);
    return sprite;
}

function _acquireUnitShadow() {
    let g = _unitShadowPool.pop();
    if (!g) g = new PIXI.Graphics();
    g.visible = true;
    if (window.worldLayer) window.worldLayer.addChild(g);
    return g;
}
function _acquireUnitCooldown() {
    let g = _unitCooldownPool.pop();
    if (!g) g = new PIXI.Graphics();
    g.visible = true;
    // Render alongside character sprite (was overlayLayer; moved per UX request).
    if (window.entityLayer) window.entityLayer.addChild(g);
    return g;
}
function _acquireUnitSelection() {
    let g = _unitSelectionPool.pop();
    if (!g) g = new PIXI.Graphics();
    g.visible = true;
    if (window.worldLayer) window.worldLayer.addChild(g);
    return g;
}
function _acquireUnitAuraGfx() {
    let g = _unitAuraGfxPool.pop();
    if (!g) g = new PIXI.Graphics();
    g.visible = true;
    if (window.worldLayer) window.worldLayer.addChild(g);
    return g;
}
function _acquireUnitAuraSprite() {
    let s = _unitAuraSpritePool.pop();
    if (!s) {
        s = new PIXI.Sprite(_ensureUnitGlowTexture());
        s.anchor.set(0.5, 0.5);
        s.blendMode = 'add';
    }
    s.visible = true;
    if (window.worldLayer) window.worldLayer.addChild(s);
    return s;
}
function _acquireUnitHalo() {
    let g = _unitHaloPool.pop();
    if (!g) g = new PIXI.Graphics();
    g.visible = true;
    if (window.overlayLayer) window.overlayLayer.addChild(g);
    return g;
}

function _releaseUnitRecord(type, record) {
    if (!record) return;
    const { sprite, shadow, cooldown, selection, auraGfx, auraSprite, halo } = record;
    if (sprite) {
        sprite.stop();
        sprite.visible = false;
            if (sprite.parent) sprite.parent.removeChild(sprite);
        _getUnitState(type).pool.push(sprite);
    }
    if (shadow)     { shadow.clear();    shadow.visible=false;    if (shadow.parent)    shadow.parent.removeChild(shadow);    _unitShadowPool.push(shadow); }
    if (cooldown)   { cooldown.clear();  cooldown.visible=false;  if (cooldown.parent)  cooldown.parent.removeChild(cooldown);_unitCooldownPool.push(cooldown); }
    if (selection)  { selection.clear(); selection.visible=false; if (selection.parent) selection.parent.removeChild(selection);_unitSelectionPool.push(selection); }
    if (auraGfx)    { auraGfx.clear();   auraGfx.visible=false;   if (auraGfx.parent)   auraGfx.parent.removeChild(auraGfx);   _unitAuraGfxPool.push(auraGfx); }
    if (auraSprite) { auraSprite.visible=false; if (auraSprite.parent) auraSprite.parent.removeChild(auraSprite); _unitAuraSpritePool.push(auraSprite); }
    if (halo)       { halo.clear();      halo.visible=false;      if (halo.parent)      halo.parent.removeChild(halo);         _unitHaloPool.push(halo); }
}

/** Sacred shrine subtypes (T2). All others starting with `shrine_` are T1. */
const SHRINE_SACRED_TYPES = new Set(['shrine_divine', 'shrine_eternity', 'shrine_miracle']);

function _typeKeyFor(tower) {
    // Shrines: key by actual subtype so each shrine bakes its own unique art.
    if (tower.isShrine) return tower.data.type;
    return tower.data && tower.data.type;
}

/** Resolve PIXI_UNIT_REGISTRY entry; fall back to shrine tier bucket for shrine subtypes. */
function _resolveCfg(type) {
    const direct = PIXI_UNIT_REGISTRY[type];
    if (direct) return direct;
    if (typeof type === 'string' && type.indexOf('shrine_') === 0) {
        return SHRINE_SACRED_TYPES.has(type)
            ? PIXI_UNIT_REGISTRY.shrine_power
            : PIXI_UNIT_REGISTRY.shrine_normal;
    }
    return null;
}

function gcPixiUnitSprites() {
    const list = window.towers;
    if (!list) return;
    const live = new Set(list);
    for (const [type, st] of _pixiUnitState) {
        for (const [tower, record] of st.active) {
            // Drop record if tower gone OR if its current type no longer matches
            // this bucket (post-promotion stale entry the per-frame cleanup missed).
            const stillMine = live.has(tower) && tower.__pixiUnitType === type;
            if (!stillMine) {
                _releaseUnitRecord(type, record);
                st.active.delete(tower);
            }
        }
    }
}

function isPixiUnitType(typeOrTower) {
    const key = (typeof typeOrTower === 'string') ? typeOrTower : _typeKeyFor(typeOrTower);
    if (Object.prototype.hasOwnProperty.call(PIXI_UNIT_REGISTRY, key)) return true;
    if (typeof key === 'string' && key.indexOf('shrine_') === 0) return true;
    return false;
}

/**
 * Render one tower as a Pixi sprite + shadow.
 * @returns {boolean} true if handled, false if not in registry.
 */
function renderPixiUnit(tower) {
    const type = _typeKeyFor(tower);
    if (!type) return false;
    const cfg = _resolveCfg(type);
    if (!cfg) return false;

    // Promotion / job change: tower.data.type swapped under us.
    // MUST release stale prev-type record BEFORE any early bail (bake failure),
    // otherwise the old T1 sprite stays attached to entityLayer forever while
    // the new tier silently fails to render.
    const prevType = tower.__pixiUnitType;
    if (prevType && prevType !== type) {
        const prevSt = _pixiUnitState.get(prevType);
        if (prevSt) {
            const prevRec = prevSt.active.get(tower);
            if (prevRec) {
                _releaseUnitRecord(prevType, prevRec);
                prevSt.active.delete(tower);
            }
        }
        tower.__pixiUnitType = null;
    }

    if (!_bakePixiUnitFrames(type)) return false;
    tower.__pixiUnitType = type;

    const st = _getUnitState(type);
    let record = st.active.get(tower);
    if (!record) {
        const sprite = _acquireUnitSprite(type);
        if (!sprite) return false;
        record = { sprite };
        st.active.set(tower, record);
    }
    const { sprite } = record;

    const lx = tower.lx;
    const ly = tower.ly;

    // Mirror x-axis for right-slot towers (pUnit only differs by x-flip).
    const isLeft = !!(tower.currentSlot && typeof tower.currentSlot.area === 'string'
                      && tower.currentSlot.area.indexOf('left') !== -1);
    // One scale for every tier: the art inside the box is the same 45x63 art
    // pixels whatever the tier, so nothing needs normalizing per type.
    const isShrineT2 = tower.isShrine && tower.data.tier === 2;
    const scale = tower.isShrine ? 1 : UNIT_RENDER_SCALE;
    // Ground line under the sprite — shadow and tier rings sit here.
    const footY = ly + (tower.isShrine ? 25 : UNIT_Y_OFFSET + UNIT_ART_FOOT * scale - 4);
    sprite.x = lx;
    sprite.y = ly + (tower.isShrine ? (isShrineT2 ? SHRINE_T2_Y_OFFSET : SHRINE_T1_Y_OFFSET)
                                    : UNIT_Y_OFFSET);
    sprite.scale.x = isLeft ? scale : -scale;
    sprite.scale.y = scale;

    // Swap idle ↔ attack textures based on tower.lastShot recency.
    const attacking = tower.lastShot && (Date.now() - tower.lastShot < UNIT_ATTACK_WINDOW_MS);
    const desiredTex = attacking ? st.attackTex : st.idleTex;
    if (desiredTex && sprite.textures !== desiredTex) {
        sprite.textures = desiredTex;
        sprite.play();
    }

    // Cooldown drives the hex outline overlay below; sprite stays at full brightness.
    const _sm = 1.0 + (tower.speedBonus || 0);
    const _cd = (tower.cooldown || 1000) / _sm;
    const _elapsed = Date.now() - (tower.lastShot || 0);
    const cdReady = _cd > 0 ? Math.min(1, _elapsed / _cd) : 1;
    sprite.tint = 0xFFFFFF;

    // Red outline while this unit/shrine is the Sacred Tablet's current subject.
    if (typeof markSelectionOutline === 'function') {
        markSelectionOutline(sprite, window.lastInspectedTower === tower);
    }

    // Shadow
    if (!record.shadow) record.shadow = _acquireUnitShadow();
    const sh = record.shadow;
    sh.clear();
    sh.ellipse(lx, footY, tower.isShrine ? 24 : 26, tower.isShrine ? 10 : 10);
    sh.fill({ color: 0x000000, alpha: 0.3 });

    // ── Selection range + ritual rings (worldLayer, below sprite) ───────
    const selectedTower = (typeof getSelectedTower === 'function') ? getSelectedTower() : null;
    const hoveredTower  = (typeof getHoveredTower  === 'function') ? getHoveredTower()  : null;
    const isSelected = (selectedTower === tower);
    const isHovered  = !isSelected && (hoveredTower === tower);
    if (isSelected || isHovered) {
        if (!record.selection) record.selection = _acquireUnitSelection();
        const sel = record.selection;
        sel.clear();
        const t = window.globalAnimTimer || 0;
        const pulse = (Math.sin(t * 2) + 1) / 2;
        const aMul = isSelected ? 1 : 0.6;
        if (!tower.isShrine) {
            const range = (tower.range || 100) + (tower.rangeBonus || 0);
            sel.circle(lx, ly, range).fill({ color: 0x00E5FF, alpha: (0.05 + pulse * 0.05) * aMul });
            sel.circle(lx, ly, range).stroke({ color: 0x00E5FF, alpha: (0.3 + pulse * 0.2) * aMul, width: 2 });
        } else {
            const mastery = (typeof getRelicBonus === 'function') ? getRelicBonus('shrine_mastery') : 0;
            // Match shrines_effects.js actual buff radius (sqrt of rangeThresholdSq).
            const rThr = mastery > 0 ? 250 : 175;
            sel.circle(lx, ly, rThr).fill({ color: 0xFFD700, alpha: (0.1 + pulse * 0.1) * aMul });
            sel.circle(lx, ly, rThr).stroke({ color: 0xFFD700, alpha: (0.3 + pulse * 0.2) * aMul, width: 2 });
        }
        if (isSelected) {
            sel.circle(lx, ly, 70).stroke({ color: 0xFFD700, alpha: 0.6, width: 2 });
            sel.circle(lx, ly, 60).stroke({ color: 0xFFD700, alpha: 0.3, width: 2 });
        }
    } else if (record.selection) {
        record.selection.clear();
        record.selection.visible = false;
        if (record.selection.parent) record.selection.parent.removeChild(record.selection);
        _unitSelectionPool.push(record.selection);
        record.selection = null;
    }

    // ── Tier auras (worldLayer, below sprite) ───────────────────────────
    const tier = (tower.data && tower.data.tier) || 1;
    const tAnim = window.globalAnimTimer || 0;
    const aPulse = (Math.sin(tAnim * 2) + 1) / 2;
    let needAuraGfx = false, needAuraSprite = false;

    if (tier === 2) {
        needAuraGfx = true;
        if (!record.auraGfx) record.auraGfx = _acquireUnitAuraGfx();
        const ag = record.auraGfx;
        ag.clear();
        for (let i = 0; i < 3; i++) {
            const ang = tAnim + (i * Math.PI * 0.6);
            const ox = Math.cos(ang) * 15;
            const oy = Math.sin(ang * 0.5) * 5;
            ag.circle(lx + ox, footY + oy, 8).fill({ color: 0xFFFFFF, alpha: 0.2 + aPulse * 0.1 });
        }
    } else if (tier === 3) {
        needAuraGfx = true;
        if (!record.auraGfx) record.auraGfx = _acquireUnitAuraGfx();
        const ag = record.auraGfx;
        ag.clear();
        ag.ellipse(lx, footY, 28 + aPulse * 5, 9 + aPulse * 2)
          .stroke({ color: 0xFFD700, alpha: 0.4 + aPulse * 0.3, width: 2 });
    } else if (tier === 4) {
        needAuraSprite = true;
        if (!record.auraSprite) record.auraSprite = _acquireUnitAuraSprite();
        const as = record.auraSprite;
        as.x = lx; as.y = footY - 30;
        as.tint = 0x4A148C;
        as.alpha = 0.3 + aPulse * 0.2;
        as.width = as.height = 110;
        as.visible = true;
    }

    if (!needAuraGfx && record.auraGfx) {
        record.auraGfx.clear(); record.auraGfx.visible = false;
        if (record.auraGfx.parent) record.auraGfx.parent.removeChild(record.auraGfx);
        _unitAuraGfxPool.push(record.auraGfx); record.auraGfx = null;
    }
    if (!needAuraSprite && record.auraSprite) {
        record.auraSprite.visible = false;
        if (record.auraSprite.parent) record.auraSprite.parent.removeChild(record.auraSprite);
        _unitAuraSpritePool.push(record.auraSprite); record.auraSprite = null;
    }

    // ── "Shrine affected" sigil, floating above the head (overlayLayer) ──
    // A diamond, not a ring: at the board's ~0.58 CSS scale a thin ellipse
    // collapses into a smudge, while four straight edges stay crisp. Tints are
    // deliberately pale (not the shrine's own saturated gold/cyan) so the mark
    // separates from the gold slot frames and the cyan cooldown hex.
    if (!tower.isShrine && (tower.shrineHaloTier1 || tower.shrineHaloTier2)) {
        if (!record.halo) record.halo = _acquireUnitHalo();
        const color   = tower.shrineHaloTier2 ? SHRINE_SIGIL_T2 : SHRINE_SIGIL_T1;
        const floatY  = ly - 80 + Math.sin(tAnim * 1.5 + lx * 0.03) * 2.0;
        const shimmer = 0.78 + Math.sin(tAnim * 1.1 + lx * 0.02) * 0.18;
        const w = 8, h = 11;
        const hg = record.halo;
        hg.clear();
        // soft bloom behind the mark
        hg.circle(lx, floatY, h * 1.05).fill({ color, alpha: 0.10 + 0.05 * shimmer });
        // diamond outline
        hg.moveTo(lx, floatY - h).lineTo(lx + w, floatY).lineTo(lx, floatY + h).lineTo(lx - w, floatY)
          .closePath().stroke({ color, alpha: shimmer, width: 2.2 });
        // white-hot core
        hg.moveTo(lx, floatY - h * 0.42).lineTo(lx + w * 0.42, floatY)
          .lineTo(lx, floatY + h * 0.42).lineTo(lx - w * 0.42, floatY)
          .closePath().fill({ color: 0xFFFFFF, alpha: 0.5 + 0.3 * shimmer });
    } else if (record.halo) {
        record.halo.clear(); record.halo.visible = false;
        if (record.halo.parent) record.halo.parent.removeChild(record.halo);
        _unitHaloPool.push(record.halo); record.halo = null;
    }

    // Cooldown indicator: vivid cyan hex outline; alpha fades as attack recharges.
    if (!record.cooldown) record.cooldown = _acquireUnitCooldown();
    const cdg = record.cooldown;
    cdg.clear();
    if (_elapsed < _cd) {
        const remaining = 1 - cdReady;
        const hw = 51, hh = 69;
        const oy = ly + UNIT_COOLDOWN_Y_OFFSET;
        cdg.moveTo(lx + hw, oy);
        for (let i = 1; i < 6; i++) {
            const ang = (i * 60) * Math.PI / 180;
            cdg.lineTo(lx + hw * Math.cos(ang), oy + hh * Math.sin(ang));
        }
        cdg.closePath();
        cdg.stroke({ color: 0x00E5FF, alpha: 0.95 * remaining, width: 2.5 });

        cdg.moveTo(lx + hw, oy);
        for (let i = 1; i < 6; i++) {
            const ang = (i * 60) * Math.PI / 180;
            cdg.lineTo(lx + hw * Math.cos(ang), oy + hh * Math.sin(ang));
        }
        cdg.closePath();
        cdg.stroke({ color: 0xFFFFFF, alpha: 0.6 * remaining, width: 1 });
    }

    return true;
}

/** Expose live sprite for a tower so VFX modules (e.g. shrine_vfx_pixi) can attach filters. */
function getPixiUnitSprite(tower, typeKey) {
    const key = typeKey || _typeKeyFor(tower);
    const st  = _pixiUnitState.get(key);
    if (!st) return null;
    const rec = st.active.get(tower);
    return rec ? rec.sprite : null;
}

/**
 * Draw one idle frame of a unit or shrine into `ctx2d`, centred on (cx, cy).
 *
 * The codex used to re-derive all of this — draw fn, synthetic tower, scale —
 * with its own heuristics, and got a different sprite than the field showed.
 * This hands it the exact bake the field sprite uses: same registry lookup
 * (shrine subtypes included), same synthetic tower, same frozen clock.
 *
 * @returns {string|null} the draw function's name, or null if there is none.
 */
function bakeUnitStill(type, ctx2d, cx, cy, emissiveCtx) {
    const cfg = _resolveCfg(type);
    const fnName = cfg && cfg.drawFn;
    const drawFn = fnName && window[fnName];
    if (typeof drawFn !== 'function') return null;

    const origCtx = window.ctx;
    const canEmit = emissiveCtx && typeof setUnitEmissiveTarget === 'function';
    window.ctx = ctx2d;
    if (canEmit) setUnitEmissiveTarget(emissiveCtx);
    try {
        _withBakeClock(PIXI_UNIT_BAKE_BASE_T, () =>
            _drawBakeFrame(drawFn, ctx2d, _synthBakeTower(type, false), cx, cy));
    } finally {
        if (canEmit) setUnitEmissiveTarget(null);
        window.ctx = origCtx;
    }
    return fnName;
}

window.PIXI_UNIT_REGISTRY = PIXI_UNIT_REGISTRY;
window.isPixiUnitType     = isPixiUnitType;
window.renderPixiUnit     = renderPixiUnit;
window.gcPixiUnitSprites  = gcPixiUnitSprites;
window.getPixiUnitSprite  = getPixiUnitSprite;
window.bakeUnitStill      = bakeUnitStill;   // codex thumbnails reuse the field bake
