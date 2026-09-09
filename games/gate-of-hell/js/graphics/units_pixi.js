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
};

const PIXI_UNIT_BAKE_BASE_T = 2_000_000;
const UNIT_ATTACK_WINDOW_MS = 350; // matches drawApprentice etc. (350ms isAttacking)
const UNIT_RENDER_SCALE     = 0.75; // base scale applied to T1 reference size
const UNIT_REF_BAKE_SIZE    = 110;  // T1 bake size; all tiers normalize to this display size
const UNIT_Y_OFFSET         = -14;  // lift sprite to fit slot (shadow stays at ground)
const UNIT_COOLDOWN_Y_OFFSET = -14; // lift cooldown hex outline above slot center
const _pixiUnitState  = new Map(); // type → { idleTex, attackTex, bakeFailed, pool, active(Map tower→record) }
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
        st = { idleTex: null, attackTex: null, bakeFailed: false, pool: [], active: new Map() };
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

function _bakeOneSet(type, cfg, drawFn, attacking) {
    const origCtx = window.ctx;
    const origNow = Date.now;
    const frames = [];
    const synth = _synthBakeTower(type, attacking);

    try {
        for (let i = 0; i < cfg.frames; i++) {
            const off = document.createElement('canvas');
            off.width  = cfg.size;
            off.height = cfg.size;
            const offCtx = off.getContext('2d');
            offCtx.imageSmoothingEnabled = false;

            const fakeT = PIXI_UNIT_BAKE_BASE_T + (i / cfg.frames) * cfg.cycleMs;
            window.ctx = offCtx;
            Date.now   = () => fakeT;

            if (drawFn.length >= 4) {
                drawFn(offCtx, synth, cfg.size / 2, cfg.size / 2, true);
            } else {
                drawFn(cfg.size / 2, cfg.size / 2, synth);
            }
            frames.push(PIXI.Texture.from(off));
        }
    } finally {
        window.ctx = origCtx;
        Date.now   = origNow;
    }
    return frames;
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
        st.idleTex   = _bakeOneSet(type, cfg, drawFn, false);
        st.attackTex = _bakeOneSet(type, cfg, drawFn, true);
        console.log(`[pixi_unit] Baked idle+attack frames (${st.idleTex.length}×2) for "${type}".`);
    } catch (err) {
        console.error(`[pixi_unit] bake failed for "${type}":`, err);
        st.bakeFailed = true;
        st.idleTex = null;
        st.attackTex = null;
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
        sprite.anchor.set(0.5, 0.5);
        sprite.animationSpeed = 0.08;
        sprite.loop = true;
    }
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
    // Normalize all tiers to T1 display size: scale = (T1_bake * base) / this_bake.
    const _typeScale = (UNIT_REF_BAKE_SIZE * UNIT_RENDER_SCALE) / cfg.size;
    // Shrines: bigger overall + extra tall. Lift sprite so base stays on slot.
    const isShrineT2 = tower.isShrine && tower.data.tier === 2;
    // Uniform mul (X = Y) — non-uniform scale distorts pixel art.
    const shrineMul  = tower.isShrine ? (isShrineT2 ? 2.10 : 1.75) : 1;
    const shrineMulX = shrineMul;
    const shrineMulY = shrineMul;
    sprite.x = lx;
    // Extra Y lift for shrines so taller sprite doesn't sink below slot.
    // Drop shrine ~14px lower than computed lift so base sits deeper on slot.
    const shrineYLift = tower.isShrine ? (cfg.size * _typeScale * (shrineMulY - 1) * 0.5 - 14) : 0;
    sprite.y = ly + UNIT_Y_OFFSET - shrineYLift;
    sprite.scale.x = (isLeft ? _typeScale : -_typeScale) * shrineMulX;
    sprite.scale.y = _typeScale * shrineMulY;

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

    // Shadow
    if (!record.shadow) record.shadow = _acquireUnitShadow();
    const sh = record.shadow;
    sh.clear();
    sh.ellipse(lx, ly + 25, 24, 24 * 0.4);
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
            ag.circle(lx + ox, ly + 5 + oy, 8).fill({ color: 0xFFFFFF, alpha: 0.2 + aPulse * 0.1 });
        }
    } else if (tier === 3) {
        needAuraGfx = true;
        if (!record.auraGfx) record.auraGfx = _acquireUnitAuraGfx();
        const ag = record.auraGfx;
        ag.clear();
        ag.ellipse(lx, ly + 8, 25 + aPulse * 5, 8 + aPulse * 2)
          .stroke({ color: 0xFFD700, alpha: 0.4 + aPulse * 0.3, width: 2 });
    } else if (tier === 4) {
        needAuraSprite = true;
        if (!record.auraSprite) record.auraSprite = _acquireUnitAuraSprite();
        const as = record.auraSprite;
        as.x = lx; as.y = ly + 5;
        as.tint = 0x4A148C;
        as.alpha = 0.3 + aPulse * 0.2;
        as.width = as.height = 80;
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

    // ── Shrine halo above head (overlayLayer) ───────────────────────────
    if (!tower.isShrine && (tower.shrineHaloTier1 || tower.shrineHaloTier2)) {
        if (!record.halo) record.halo = _acquireUnitHalo();
        // T2 (global/sacred) = gold; T1 = cyan. Matches shrine_auras_pixi.js.
        const color = tower.shrineHaloTier2 ? 0xFFD700 : 0x00E5FF;
        const floatY = ly - 22 + Math.sin(tAnim * 1.4 + lx * 0.03) * 1.8;
        const shimmer = 0.72 + Math.sin(tAnim * 0.9 + lx * 0.025) * 0.18;
        const hg = record.halo;
        hg.clear();
        // outer bloom
        hg.ellipse(lx, floatY, 11, 4).stroke({ color, alpha: 0.18 + Math.sin(tAnim * 1.1) * 0.06, width: 6 });
        // main ring
        hg.ellipse(lx, floatY, 10, 3.5).stroke({ color, alpha: shimmer, width: 2.5 });
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

window.PIXI_UNIT_REGISTRY = PIXI_UNIT_REGISTRY;
window.isPixiUnitType     = isPixiUnitType;
window.renderPixiUnit     = renderPixiUnit;
window.gcPixiUnitSprites  = gcPixiUnitSprites;
window.getPixiUnitSprite  = getPixiUnitSprite;
