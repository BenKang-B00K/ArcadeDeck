/* whispering_spirit_pixi.js — Generic pure-Pixi sprite path for enemies.
 *
 * Originally migrated only 속삭이는 영혼 (drawWhisperingSpirit). Now hosts a small
 * registry so additional enemy types can opt in by adding one row in
 * PIXI_ENEMY_REGISTRY. Each type:
 *   - bakes N animation frames by redirecting global `ctx` to an offscreen
 *     canvas and stubbing Date.now() to walk a fixed cycle.
 *   - shares a per-type AnimatedSprite pool on entityLayer.
 *   - is GC'd per frame against window.enemies.
 *
 * Body sprite goes on entityLayer; ctx2d still draws shadow / status glows /
 * spawn glow / invinc aura / HP bar to bgLayer underneath the sprite.
 */

const PIXI_ENEMY_REGISTRY = {
    // type → { drawFn, size, frames, cycleMs }
    // Size = max draw extent (cells × 2 × S) + padding. Cycle = longest internal anim period.
    'normal':  { drawFn: 'drawWhisperingSpirit', size: 100, frames: 8, cycleMs: 4200 },
    'specter': { drawFn: 'drawWhisperingSpirit', size: 100, frames: 8, cycleMs: 4200 },
    'mist':    { drawFn: 'drawMist',             size: 110, frames: 8, cycleMs: 3500 },
    'memory':  { drawFn: 'drawMemory',           size: 120, frames: 8, cycleMs: 3200 },
    'shade':   { drawFn: 'drawShade',            size: 120, frames: 8, cycleMs: 3200 },
    'tank':    { drawFn: 'drawIronWraith',       size: 150, frames: 8, cycleMs: 4200 },
    'runner':  { drawFn: 'drawShadowRunner',     size: 100, frames: 8, cycleMs: 1050 },
    'greedy':  { drawFn: 'drawGreedyPoltergeist',size: 110, frames: 8, cycleMs: 2100 },
    'lightspeed':         { drawFn: 'drawLightspeedHerald',  size: 140, frames: 8, cycleMs: 800 },
    'boar':               { drawFn: 'drawHellboundBoar',     size: 130, frames: 8, cycleMs: 2100 },
    'defiled_apprentice': { drawFn: 'drawDefiledApprentice', size: 110, frames: 8, cycleMs: 2100 },
    'mimic':              { drawFn: 'drawMimicWraith',       size: 120, frames: 8, cycleMs: 1600 },
    'dimension':          { drawFn: 'drawDimensionWraith',   size: 140, frames: 8, cycleMs: 4200 },
    'deceiver':           { drawFn: 'drawDeceiverSiren',     size: 120, frames: 8, cycleMs: 2100 },
    'cursed_vajra':       { drawFn: 'drawCursedVajra',       size: 150, frames: 8, cycleMs: 2100 },
    'betrayer_blade':     { drawFn: 'drawBetrayerBlade',     size: 150, frames: 8, cycleMs: 2100 },
    'void_piercer':       { drawFn: 'drawVoidPiercer',       size: 150, frames: 8, cycleMs: 2100 },
    'soul_eater':         { drawFn: 'drawSoulEater',         size: 140, frames: 8, cycleMs: 2100 },
    'frost':              { drawFn: 'drawFrostWalker',       size: 130, frames: 8, cycleMs: 2100 },
    'frost_outcast':      { drawFn: 'drawFrozenHeart',       size: 140, frames: 8, cycleMs: 2100 },
    // ── Wraith group ────────────────────────────────────────────────────
    'ember_hatred':       { drawFn: 'drawEmberHatred',       size: 160, frames: 8, cycleMs: 2100 },
    'heavy':              { drawFn: 'drawChainEnforcer',     size: 180, frames: 8, cycleMs: 2100 },
    'lava':               { drawFn: 'drawLavaFury',          size: 160, frames: 8, cycleMs: 2100 },
    'burning':            { drawFn: 'drawPainRegenerator',   size: 160, frames: 8, cycleMs: 2100 },
    'abyssal_acolyte':    { drawFn: 'drawAbyssalAcolyte',    size: 160, frames: 8, cycleMs: 2100 },
    'gold':               { drawFn: 'drawGoldPhantom',       size: 140, frames: 8, cycleMs: 2100 },
    // ── Specter (new) ───────────────────────────────────────────────────
    'echo_soul':          { drawFn: 'drawEchoSoul',          size: 150, frames: 8, cycleMs: 2100 },
    'hungry_ghost':       { drawFn: 'drawHungryGhost',       size: 150, frames: 8, cycleMs: 2100 },
    'aggrieved':          { drawFn: 'drawAggrieved',         size: 150, frames: 8, cycleMs: 2100 },
    'split_soul':         { drawFn: 'drawSplitSoul',         size: 160, frames: 8, cycleMs: 2100 },
    'cursed_ancestor':    { drawFn: 'drawCursedAncestor',    size: 160, frames: 8, cycleMs: 2100 },
    // ── Wraith (new) ────────────────────────────────────────────────────
    'shadow_wisp':        { drawFn: 'drawShadowWisp',        size: 130, frames: 8, cycleMs: 2100 },
    'cursed_shade':       { drawFn: 'drawCursedShade',       size: 150, frames: 8, cycleMs: 2100 },
    'soul_hound':         { drawFn: 'drawSoulHound',         size: 160, frames: 8, cycleMs: 2100 },
    'oblivion_wraith':    { drawFn: 'drawOblivionWraith',    size: 160, frames: 8, cycleMs: 2100 },
    'unrepentant':        { drawFn: 'drawUnrepentant',       size: 160, frames: 8, cycleMs: 2100 },
    // ── Spirit ──────────────────────────────────────────────────────────
    'lost_child':         { drawFn: 'drawLostChild',         size: 140, frames: 8, cycleMs: 2100 },
    'grave_walker':       { drawFn: 'drawGraveWalker',       size: 160, frames: 8, cycleMs: 2100 },
    'wailing_mother':     { drawFn: 'drawWailingMother',     size: 170, frames: 8, cycleMs: 2100 },
    'abyss_sentinel':     { drawFn: 'drawAbyssSentinel',     size: 180, frames: 8, cycleMs: 2100 },
    'fear_harvester':     { drawFn: 'drawFearHarvester',     size: 180, frames: 8, cycleMs: 2100 },
    'blood_spirit':       { drawFn: 'drawBloodSpirit',       size: 160, frames: 8, cycleMs: 2100 },
    // ── Demon ───────────────────────────────────────────────────────────
    'imp':                { drawFn: 'drawImp',               size: 140, frames: 8, cycleMs: 2100 },
    'hellspawn':          { drawFn: 'drawHellspawn',         size: 160, frames: 8, cycleMs: 2100 },
    'brimstone_fiend':    { drawFn: 'drawBrimstoneFiend',    size: 180, frames: 8, cycleMs: 2100 },
    'shadow_titan':       { drawFn: 'drawShadowTitan',       size: 220, frames: 8, cycleMs: 2100 },
    'lava_lord':          { drawFn: 'drawLavaLord',          size: 200, frames: 8, cycleMs: 2100 },
    'time_ravager':       { drawFn: 'drawTimeRavager',       size: 180, frames: 8, cycleMs: 2100 },
    'void_master':        { drawFn: 'drawVoidMaster',        size: 180, frames: 8, cycleMs: 2100 },
    'sin_incarnate':      { drawFn: 'drawSinIncarnate',      size: 200, frames: 8, cycleMs: 2100 },
    'corruption_apostle': { drawFn: 'drawCorruptionApostle', size: 180, frames: 8, cycleMs: 2100 },
    // ── Bosses (larger canvas) ──────────────────────────────────────────
    'cerberus':           { drawFn: 'drawCerberus',          size: 280, frames: 8, cycleMs: 2400 },
    'charon':             { drawFn: 'drawCharon',            size: 280, frames: 8, cycleMs: 2400 },
    'beelzebub':          { drawFn: 'drawBeelzebub',         size: 280, frames: 8, cycleMs: 2400 },
    'lucifer':            { drawFn: 'drawLucifer',           size: 320, frames: 8, cycleMs: 2400 },
    'abyssal_overlord':   { drawFn: 'drawAbyssalOverlord',   size: 340, frames: 8, cycleMs: 2400 },
    'mini_cerberus':      { drawFn: 'drawCerberus',          size: 260, frames: 8, cycleMs: 2400 },
    'mini_charon':        { drawFn: 'drawCharon',            size: 260, frames: 8, cycleMs: 2400 },
    'mini_beelzebub':     { drawFn: 'drawBeelzebub',         size: 260, frames: 8, cycleMs: 2400 },
    'mini_lucifer':       { drawFn: 'drawLucifer',           size: 280, frames: 8, cycleMs: 2400 },
    'mini_lilith':        { drawFn: 'drawLilith',            size: 260, frames: 8, cycleMs: 2400 },
    'lilith':             { drawFn: 'drawLilith',            size: 300, frames: 8, cycleMs: 2400 },
    'mini_chronos':       { drawFn: 'drawChronos',           size: 260, frames: 8, cycleMs: 2400 },
    'medusa':             { drawFn: 'drawMedusa',            size: 300, frames: 8, cycleMs: 2400 },
};

const PIXI_ENEMY_BAKE_BASE_T = 1_000_000;

/* Bake scratch canvases are drawn oversized, then cropped to the art's real
 * bounds. Registry `size` values are hand-tuned guesses and two of them clipped
 * their own sprite (defiled_apprentice, frost_outcast) because the art reaches
 * further up than down while the canvas is centred. Measuring beats guessing,
 * and cropping the dead margin also cuts texture memory. */
const BAKE_OVERSCAN = 64;   // scratch margin; covers every clipped type with room to spare
const BAKE_PAD      = 20;   // kept in the final texture so bloom/aura are not cut off

/** Per-type runtime state: { textures, bakeFailed, pool, active(Map enemy→record) } */
const _pixiEnemyState = new Map();

function _getEnemyState(type) {
    let st = _pixiEnemyState.get(type);
    if (!st) {
        st = { textures: null, bakeFailed: false, pool: [], active: new Map() };
        _pixiEnemyState.set(type, st);
    }
    return st;
}

/** Lazy bake on first render request for a type. Returns Texture[] or null. */
function _bakePixiEnemyFrames(type) {
    const cfg = PIXI_ENEMY_REGISTRY[type];
    if (!cfg) return null;
    const st = _getEnemyState(type);
    if (st.textures || st.bakeFailed) return st.textures;
    const drawFn = window[cfg.drawFn];
    if (typeof drawFn !== 'function' || typeof PIXI === 'undefined') {
        st.bakeFailed = true;
        return null;
    }

    const origCtx = window.ctx;
    const frames = [];
    // Even size keeps pEnemy's Math.round() phase identical to the old bake.
    const scratchSize = cfg.size + BAKE_OVERSCAN * 2;
    const origin = scratchSize / 2;

    try {
        // ── Pass 1: draw every frame onto oversized scratch canvases ────────
        // A parallel emissive canvas rides along: draw fns that use pEnemyGlow
        // paint into it, letting the finishing pass bloom exactly what the art
        // declares instead of guessing from luminance. Fns still on plain p()
        // leave it empty and fall back to the heuristic.
        const scratches = [], emissives = [];
        const canEmit = typeof setEnemyEmissiveTarget === 'function';
        for (let i = 0; i < cfg.frames; i++) {
            const off = document.createElement('canvas');
            off.width  = scratchSize;
            off.height = scratchSize;
            const offCtx = off.getContext('2d', { willReadFrequently: true });
            offCtx.imageSmoothingEnabled = false;

            const em = document.createElement('canvas');
            em.width = em.height = scratchSize;
            const emCtx = em.getContext('2d', { willReadFrequently: true });
            emCtx.imageSmoothingEnabled = false;

            const fakeT = PIXI_ENEMY_BAKE_BASE_T + (i / cfg.frames) * cfg.cycleMs;
            window.ctx = offCtx;
            if (canEmit) setEnemyEmissiveTarget(emCtx);
            // Draw fns animate off Date.now(); stub it to walk the cycle.
            // Keep the swap as tight as possible — it is global state.
            const origNow = Date.now;
            Date.now = () => fakeT;
            try { drawFn(origin, origin, null); }
            finally { Date.now = origNow; if (canEmit) setEnemyEmissiveTarget(null); }

            scratches.push(off);
            emissives.push(em);
        }

        // ── Pass 2: union alpha bounding box across all frames ──────────────
        const box = _measureAlphaBounds(scratches, scratchSize);
        const crop = box
            ? {
                x: Math.max(0, box.x0 - BAKE_PAD),
                y: Math.max(0, box.y0 - BAKE_PAD),
                w: Math.min(scratchSize, box.x1 + BAKE_PAD) - Math.max(0, box.x0 - BAKE_PAD),
                h: Math.min(scratchSize, box.y1 + BAKE_PAD) - Math.max(0, box.y0 - BAKE_PAD)
              }
            : { x: origin - cfg.size / 2, y: origin - cfg.size / 2, w: cfg.size, h: cfg.size };

        // ── Pass 3: crop each frame, then run the shared finishing pass ─────
        const style = (typeof enemyVfxStyle === 'function') ? enemyVfxStyle(type) : null;
        for (let i = 0; i < cfg.frames; i++) {
            const out = document.createElement('canvas');
            out.width  = crop.w;
            out.height = crop.h;
            const oc = out.getContext('2d', { willReadFrequently: true });
            oc.imageSmoothingEnabled = false;
            oc.drawImage(scratches[i], -crop.x, -crop.y);
            // Bloom / rim light / outline / aura — the lighting the draw fns lack.
            if (style && typeof finishEnemyFrame === 'function') {
                let emCrop = null;
                if (_hasInk(emissives[i], scratchSize)) {
                    emCrop = document.createElement('canvas');
                    emCrop.width  = crop.w;
                    emCrop.height = crop.h;
                    const ec = emCrop.getContext('2d', { willReadFrequently: true });
                    ec.imageSmoothingEnabled = false;
                    ec.drawImage(emissives[i], -crop.x, -crop.y);
                }
                finishEnemyFrame(out, style, 2, type, emCrop);
            }
            frames.push(pixelTexture(out));
        }

        // Anchor that keeps the original draw origin fixed, so every existing
        // position / shadow / HP-bar offset in renderPixiEnemy stays valid.
        st.anchor = { x: (origin - crop.x) / crop.w, y: (origin - crop.y) / crop.h };
        st.crop = crop;
        st.textures = frames;
        console.log(`[pixi_enemy] Baked ${frames.length} frames for "${type}" `
                  + `(${crop.w}x${crop.h}, was ${cfg.size}x${cfg.size}).`);
    } catch (err) {
        console.error(`[pixi_enemy] bake failed for "${type}":`, err);
        st.bakeFailed = true;
        st.textures = null;
    } finally {
        window.ctx = origCtx;
    }
    return st.textures;
}

/** True if any pixel on this canvas is non-transparent. */
function _hasInk(canvas, size) {
    const d = canvas.getContext('2d').getImageData(0, 0, size, size).data;
    for (let i = 3; i < d.length; i += 16) if (d[i]) return true;   // stride 4px
    return false;
}

/**
 * Union bounding box of non-transparent pixels across every baked frame.
 * Stacks all frames into one canvas so this costs a single getImageData, and
 * steps by 2 because every enemy draw fn uses S = 2.0 — each art pixel is a
 * 2x2 block, so stride 2 is exact, not an approximation.
 * Returns {x0,y0,x1,y1} (x1/y1 exclusive) or null if every frame is empty.
 */
function _measureAlphaBounds(canvases, size) {
    const acc = document.createElement('canvas');
    acc.width = acc.height = size;
    const ac = acc.getContext('2d', { willReadFrequently: true });
    for (const c of canvases) ac.drawImage(c, 0, 0);

    const d = ac.getImageData(0, 0, size, size).data;
    let x0 = size, y0 = size, x1 = 0, y1 = 0, any = false;
    for (let y = 0; y < size; y += 2) {
        const row = y * size;
        for (let x = 0; x < size; x += 2) {
            if (d[(row + x) * 4 + 3] < 8) continue;
            any = true;
            if (x < x0) x0 = x;
            if (x + 2 > x1) x1 = x + 2;
            if (y < y0) y0 = y;
            if (y + 2 > y1) y1 = y + 2;
        }
    }
    return any ? { x0, y0, x1, y1 } : null;
}

function _acquireSprite(type) {
    const frames = _bakePixiEnemyFrames(type);
    if (!frames || !window.entityLayer) return null;
    const st = _getEnemyState(type);

    let sprite;
    if (st.pool.length > 0) {
        sprite = st.pool.pop();
        sprite.textures = frames; // safety; pool is per-type so usually unchanged
    } else {
        sprite = new PIXI.AnimatedSprite(frames);
        sprite.loop = true;
        // Snap to whole pixels — sprites sit at fractional x/y (percent-x + sine
        // float), and subpixel sampling smears 2x pixel art across texels.
        sprite.roundPixels = true;
    }
    // Crop moved the art's midpoint; this anchor puts the original draw origin
    // back under sprite.x/y so callers need no offset changes.
    if (st.anchor) sprite.anchor.set(st.anchor.x, st.anchor.y);
    else sprite.anchor.set(0.5, 0.5);
    // Play the baked cycle at the rate it was authored for. Frames span cfg.cycleMs,
    // and AnimatedSprite advances animationSpeed frames per 60fps tick.
    const cfg = PIXI_ENEMY_REGISTRY[type];
    sprite.animationSpeed = cfg.frames / ((cfg.cycleMs / 1000) * 60);
    sprite.visible = true;
    sprite.alpha   = 1;
    sprite.scale.set(1, 1);
    sprite.tint    = 0xFFFFFF;
    sprite.play();
    window.entityLayer.addChild(sprite);
    return sprite;
}

/** Shared pools for auxiliary Graphics (shadow ellipse + HP bar). */
const _shadowPool    = [];
const _hpBarPool     = [];
const _glowPool      = [];
const _spawnGlowPool = [];
const _invMoonPool   = [];
const _invCoronaPool = [];
const _invRaysPool   = [];
const _invArcsPool   = [];

if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        for (const state of _pixiEnemyState.values()) {
            if (state.active && typeof state.active.clear === 'function') state.active.clear();
            if (Array.isArray(state.pool)) state.pool.length = 0;
        }
        _dying.length = 0;
        _shadowPool.length = 0;
        _hpBarPool.length = 0;
        _glowPool.length = 0;
        _spawnGlowPool.length = 0;
        _invMoonPool.length = 0;
        _invCoronaPool.length = 0;
        _invRaysPool.length = 0;
        _invArcsPool.length = 0;
    });
}

/** Soft radial glow texture (white→transparent). Shared, baked once. */
let _glowTexture = null;
const GLOW_TEX_SIZE = 128;
function _ensureGlowTexture() {
    if (_glowTexture) return _glowTexture;
    const c = document.createElement('canvas');
    c.width = GLOW_TEX_SIZE; c.height = GLOW_TEX_SIZE;
    const g = c.getContext('2d');
    const r = GLOW_TEX_SIZE / 2;
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, GLOW_TEX_SIZE, GLOW_TEX_SIZE);
    _glowTexture = PIXI.Texture.from(c);
    return _glowTexture;
}

function _acquireGlow() {
    let s = _glowPool.pop();
    if (!s) {
        s = new PIXI.Sprite(_ensureGlowTexture());
        s.anchor.set(0.5, 0.5);
        s.blendMode = 'add';
    }
    s.visible = true;
    if (window.worldLayer) window.worldLayer.addChild(s);
    return s;
}
function _acquireSpawnGlow() {
    let s = _spawnGlowPool.pop();
    if (!s) {
        s = new PIXI.Sprite(_ensureGlowTexture());
        s.anchor.set(0.5, 0.5);
        s.blendMode = 'add';
    }
    s.visible = true;
    if (window.worldLayer) window.worldLayer.addChild(s);
    return s;
}

function _acquireShadow() {
    let g = _shadowPool.pop();
    if (!g) g = new PIXI.Graphics();
    g.visible = true;
    if (window.worldLayer) window.worldLayer.addChild(g);
    return g;
}
function _acquireHpBar() {
    let g = _hpBarPool.pop();
    if (!g) g = new PIXI.Graphics();
    g.visible = true;
    if (window.overlayLayer) window.overlayLayer.addChild(g);
    return g;
}

function _releaseSprite(type, record) {
    if (!record) return;
    const { sprite, shadow, hpBar, glow } = record;
    if (sprite) {
        sprite.stop();
        sprite.visible = false;
            if (sprite.parent) sprite.parent.removeChild(sprite);
        _getEnemyState(type).pool.push(sprite);
    }
    if (shadow) {
        shadow.visible = false;
        if (shadow.parent) shadow.parent.removeChild(shadow);
        _shadowPool.push(shadow);
    }
    if (hpBar) {
        hpBar.visible = false;
        if (hpBar.parent) hpBar.parent.removeChild(hpBar);
        _hpBarPool.push(hpBar);
    }
    if (glow) {
        glow.visible = false;
        if (glow.parent) glow.parent.removeChild(glow);
        _glowPool.push(glow);
    }
    if (record.spawnGlow) {
        record.spawnGlow.visible = false;
        if (record.spawnGlow.parent) record.spawnGlow.parent.removeChild(record.spawnGlow);
        _spawnGlowPool.push(record.spawnGlow);
    }
    _releaseInvincAura(record);
}

function _acquireInvincAura(record) {
    if (!window.worldLayer) return false;
    if (!record.invMoon) {
        const g = _invMoonPool.pop() || new PIXI.Graphics();
        g.blendMode = 'multiply'; g.visible = true;
        window.worldLayer.addChild(g);
        record.invMoon = g;
    }
    if (!record.invCorona) {
        let s = _invCoronaPool.pop();
        if (!s) { s = new PIXI.Sprite(_ensureGlowTexture()); s.anchor.set(0.5, 0.5); s.blendMode = 'add'; }
        s.visible = true;
        window.worldLayer.addChild(s);
        record.invCorona = s;
    }
    if (!record.invRays) {
        const g = _invRaysPool.pop() || new PIXI.Graphics();
        g.blendMode = 'add'; g.visible = true;
        window.worldLayer.addChild(g);
        record.invRays = g;
    }
    if (!record.invArcs) {
        const g = _invArcsPool.pop() || new PIXI.Graphics();
        g.blendMode = 'add'; g.visible = true;
        window.worldLayer.addChild(g);
        record.invArcs = g;
    }
    return true;
}

function _releaseInvincAura(record) {
    if (record.invMoon) {
        record.invMoon.clear(); record.invMoon.visible = false;
        if (record.invMoon.parent) record.invMoon.parent.removeChild(record.invMoon);
        _invMoonPool.push(record.invMoon); record.invMoon = null;
    }
    if (record.invCorona) {
        record.invCorona.visible = false;
        if (record.invCorona.parent) record.invCorona.parent.removeChild(record.invCorona);
        _invCoronaPool.push(record.invCorona); record.invCorona = null;
    }
    if (record.invRays) {
        record.invRays.clear(); record.invRays.visible = false;
        if (record.invRays.parent) record.invRays.parent.removeChild(record.invRays);
        _invRaysPool.push(record.invRays); record.invRays = null;
    }
    if (record.invArcs) {
        record.invArcs.clear(); record.invArcs.visible = false;
        if (record.invArcs.parent) record.invArcs.parent.removeChild(record.invArcs);
        _invArcsPool.push(record.invArcs); record.invArcs = null;
    }
}

/* Death dissolve. Enemies used to pop out of existence the frame after they
 * died — only the particle burst sold the kill. Rather than keeping dead
 * entries alive in window.enemies (which combat, targeting, status effects,
 * wave counting and relics all iterate), the sprite's ownership is transferred
 * to this list at GC time and animated to completion here. Nothing in
 * enemies_combat.js or enemies_ui.js has to change. */
const _dying = [];
const DEATH_MS = 260;

function _startDeathFade(type, record) {
    const s = record.sprite;
    record.sprite = null;          // _releaseSprite guards on `if (sprite)`
    _releaseSprite(type, record);  // hp bar / glow / shadow / aura recycle now
    if (!s) return;
    s.stop();
    _dying.push({ type, sprite: s, t0: Date.now(), y0: s.y, a0: s.alpha,
                  sx: s.scale.x, sy: s.scale.y });
}

function _updateDeathFades() {
    const now = Date.now();
    for (let i = _dying.length - 1; i >= 0; i--) {
        const d = _dying[i];
        const k = (now - d.t0) / DEATH_MS;
        if (k >= 1) {
            d.sprite.visible = false;
            if (d.sprite.parent) d.sprite.parent.removeChild(d.sprite);
            _getEnemyState(d.type).pool.push(d.sprite);
            _dying.splice(i, 1);
            continue;
        }
        d.sprite.alpha = d.a0 * (1 - k) * (1 - k);            // ease-out fade
        d.sprite.y     = d.y0 - 14 * k;                       // spirit rises
        d.sprite.scale.set(d.sx * (1 + 0.18 * k), d.sy * (1 + 0.18 * k));
        const r = 255 - ((90 * k) | 0), g = 255 - ((170 * k) | 0);
        d.sprite.tint = (r << 16) | (g << 8) | r;             // drain toward violet
    }
}

/** Per-frame GC. Hands dead enemies' sprites to the dissolve, recycles the rest. */
function gcPixiEnemySprites() {
    const list = window.enemies;
    if (!list) return;
    const live = new Set();
    for (let i = 0; i < list.length; i++) {
        const e = list[i];
        if (e && e.hp > 0) live.add(e);
    }
    for (const [type, st] of _pixiEnemyState) {
        for (const [enemy, record] of st.active) {
            if (!live.has(enemy)) {
                _startDeathFade(type, record);
                st.active.delete(enemy);
            }
        }
    }
    _updateDeathFades();
}

/** Returns true if this enemy.type is handled by the Pixi sprite path. */
function isPixiEnemyType(type) {
    return Object.prototype.hasOwnProperty.call(PIXI_ENEMY_REGISTRY, type);
}

/**
 * Render one enemy as a Pixi sprite. Returns true if handled, false if
 * caller should fall back to the ctx2d draw path.
 */
function renderPixiEnemy(enemy, lx, floatY, spawnFade, mScale, ly, isBoss) {
    const cfg = PIXI_ENEMY_REGISTRY[enemy.type];
    if (!cfg) return false;
    if (!_bakePixiEnemyFrames(enemy.type)) return false;

    const st = _getEnemyState(enemy.type);
    let record = st.active.get(enemy);
    if (!record) {
        const sprite = _acquireSprite(enemy.type);
        if (!sprite) return false;
        record = { sprite };
        st.active.set(enemy, record);
    }
    const { sprite } = record;

    sprite.x = lx;
    sprite.y = floatY;
    sprite.scale.set(mScale, mScale);
    sprite.alpha = enemy.isStealthed ? 0.4 * spawnFade : spawnFade;

    const hitFlash = enemy.lastHitTime && (Date.now() - enemy.lastHitTime < 80);

    // Status colour via tint, not a ColorMatrixFilter. A filtered sprite gets its
    // own render pass and framebuffer and drops out of the batch, so a blizzard
    // slowing 30 enemies used to cost 30 passes. tint is a vertex attribute and
    // batches. It can only darken, so the BRIGHT half of the hit flash is carried
    // by the additive glow sprite below.
    sprite.tint = hitFlash                        ? 0xFFD0D0
                : enemy.isStunned                 ? 0xFFF0A0
                : (enemy.speed < enemy.baseSpeed) ? 0x88CCFF
                : 0xFFFFFF;

    // Red outline while this enemy is the Sacred Tablet's current subject.
    if (typeof markSelectionOutline === 'function') {
        markSelectionOutline(sprite, window.lastInspectedEnemy === enemy);
    }

    // ── Shadow ellipse (worldLayer, below sprite) ───────────────────────
    // Shadow stays anchored at ground (ly). Shrinks + fades as sprite floats
    // higher (floatY < ly) to sell the "flying" look.
    if (ly !== undefined) {
        if (!record.shadow) record.shadow = _acquireShadow();
        const baseR = isBoss ? 24 : 10;
        const lift = Math.max(0, ly - floatY);          // positive when airborne
        const liftK = Math.min(1, lift / 18);           // normalize to expected float range
        const shR = baseR * (1 - liftK * 0.45);
        const shAlpha = 0.32 * (1 - liftK * 0.55);
        const sh = record.shadow;
        sh.clear();
        sh.ellipse(lx, ly + 25, shR, shR * 0.4);
        sh.fill({ color: 0x000000, alpha: shAlpha });
    }

    // ── Spawn glow (purple radial pulse during materialization) ─────────
    const spawnMs = Date.now() - (enemy.spawnTime || 0);
    const matDur  = enemy.materializeDuration || 600;
    if (spawnMs < matDur) {
        if (!record.spawnGlow) record.spawnGlow = _acquireSpawnGlow();
        const sg = record.spawnGlow;
        const a  = Math.sin((spawnMs / matDur) * Math.PI) * 0.70;
        const r  = isBoss ? 60 : 28;
        sg.x = lx; sg.y = floatY;
        sg.tint = 0x8C00DC; // ≈ rgba(140,0,220)
        sg.alpha = a;
        sg.width = sg.height = r * 2;
        sg.visible = true;
    } else if (record.spawnGlow) {
        // Materialization done — release back to pool, drop ref.
        record.spawnGlow.visible = false;
        if (record.spawnGlow.parent) record.spawnGlow.parent.removeChild(record.spawnGlow);
        _spawnGlowPool.push(record.spawnGlow);
        record.spawnGlow = null;
    }

    // ── Status glow (worldLayer, additive blend) ────────────────────────
    // Default is no longer "off": every enemy sits in a faint additive halo tinted
    // to its own art (ENEMY_GLOW_TINT, derived at bake time). This is the true
    // additive glow the baked-in aura cannot be, since the body must blend normally.
    const tintTable = window.ENEMY_GLOW_TINT;
    let glowColor = (tintTable && tintTable[enemy.type]) || 0x6A3AA0;
    let glowAlpha = isBoss ? 0.30 : 0.18;
    if (hitFlash)                   { glowColor = 0xFFFFFF; glowAlpha = 0.85; }
    else if (enemy.isBurning)       { glowColor = 0xFF4500; glowAlpha = 0.4; }
    else if (enemy.isStunned)       { glowColor = 0xFFFFFF; glowAlpha = 0.3; }
    else if (enemy.speed < enemy.baseSpeed) { glowColor = 0x00E5FF; glowAlpha = 0.3; }
    else if (isBoss)                { glowColor = 0xFF0000; glowAlpha = 0.28; }
    if (glowColor !== null) {
        if (!record.glow) record.glow = _acquireGlow();
        const gl = record.glow;
        const gR = isBoss ? 60 : 25;
        gl.x = lx; gl.y = floatY;
        gl.tint = glowColor;
        gl.alpha = glowAlpha;
        gl.width = gl.height = gR * 2;
        gl.visible = true;
    } else if (record.glow) {
        record.glow.visible = false;
    }

    // ── Invincibility aura (moon + corona + rays + arcs) ────────────────
    if (enemy.invincible) {
        if (_acquireInvincAura(record)) {
            const now = Date.now();
            const pulse = (Math.sin(now * 0.003) + 1) * 0.5;
            const moonR   = isBoss ? 52 : 20;
            const coronaR = isBoss ? 72 : 28;

            // Moon (multiply blend → darken body)
            const mn = record.invMoon;
            mn.clear();
            mn.circle(lx, floatY, moonR).fill({ color: 0x00000C, alpha: 0.68 });

            // Corona radial glow (additive sprite)
            const co = record.invCorona;
            co.x = lx; co.y = floatY;
            co.tint = 0xFFB432; // warm orange/gold
            co.alpha = 0.72 + pulse * 0.22;
            co.width = co.height = (coronaR + 12) * 2;

            // Corona rays (12 short additive lines)
            const ry = record.invRays;
            ry.clear();
            for (let r = 0; r < 12; r++) {
                const angle = (r / 12) * Math.PI * 2 + now * 0.0004;
                const r2 = coronaR + 8 + Math.sin(now * 0.002 + r * 0.8) * 7;
                ry.moveTo(lx + Math.cos(angle) * coronaR, floatY + Math.sin(angle) * coronaR);
                ry.lineTo(lx + Math.cos(angle) * r2,      floatY + Math.sin(angle) * r2);
            }
            ry.stroke({ color: 0xFFBE32, alpha: 0.5 + pulse * 0.3, width: 1.5 });

            // Electric arcs (8 short curved segments, varying width/color)
            const ac = record.invArcs;
            ac.clear();
            const arcR = isBoss ? 84 : 35;
            for (let a = 0; a < 8; a++) {
                const startA = (a / 8) * Math.PI * 2 + now * 0.0022;
                const sweep  = 0.45 + Math.sin(now * 0.003 + a * 1.1) * 0.25;
                const alpha  = 0.35 + 0.30 * Math.abs(Math.sin(now * 0.004 + a * 0.8));
                const color  = a % 2 === 0 ? 0x44DDFF : 0xCC88FF;
                const lw     = 1.5 + Math.abs(Math.sin(now * 0.0025 + a)) * 1.5;
                const ar     = arcR + Math.sin(now * 0.005 + a) * 5;
                ac.arc(lx, floatY, ar, startA, startA + sweep);
                ac.stroke({ color, alpha, width: lw });
            }
        }
    } else if (record.invMoon) {
        _releaseInvincAura(record);
    }

    // ── HP bar (overlayLayer, above sprite) ─────────────────────────────
    if (!record.hpBar) record.hpBar = _acquireHpBar();
    const bw   = isBoss ? 84 : 30;
    const barH = isBoss ? 6 : 4;
    const hr   = Math.max(0, enemy.hp / enemy.maxHp);
    const bx   = lx - bw / 2;
    const by   = floatY - (isBoss ? 82 : 42);
    const hp   = record.hpBar;
    hp.clear();
    hp.rect(bx - 1, by - 1, bw + 2, barH + 2).fill({ color: 0x000000, alpha: 0.88 });
    hp.rect(bx, by, bw, barH).fill({ color: 0x3C1E1E, alpha: 0.7 });
    if (hr > 0) {
        const fillW = Math.round(bw * hr);
        const color = isBoss ? 0xD50000 : 0xC62828;
        hp.rect(bx, by, fillW, barH).fill({ color, alpha: 1 });
        hp.rect(bx, by, fillW, 1).fill({ color: 0xFFC8B4, alpha: 0.35 });
    }
    hp.rect(bx - 1, by - 1, 1, barH + 2).fill({ color: 0xB45050, alpha: 0.6 });
    hp.rect(bx + bw, by - 1, 1, barH + 2).fill({ color: 0xB45050, alpha: 0.6 });

    return true;
}

/** Optional explicit release; GC handles normal cases. */
function releasePixiEnemy(enemy) {
    const st = _pixiEnemyState.get(enemy.type);
    if (!st) return;
    const record = st.active.get(enemy);
    if (record) {
        _releaseSprite(enemy.type, record);
        st.active.delete(enemy);
    }
}

// ── Back-compat aliases (kept so older call sites still work) ────────────
function renderWhisperingSpiritPixi(enemy, lx, floatY, spawnFade, mScale) {
    return renderPixiEnemy(enemy, lx, floatY, spawnFade, mScale);
}
function releaseWhisperingSpritePixi(enemy) { return releasePixiEnemy(enemy); }

// Shared with the codex thumbnail baker in pix_core.js, which crops the same way.
window.measureSpriteAlphaBounds   = _measureAlphaBounds;
window.PIXI_ENEMY_REGISTRY        = PIXI_ENEMY_REGISTRY;
window.isPixiEnemyType            = isPixiEnemyType;
window.renderPixiEnemy            = renderPixiEnemy;
window.releasePixiEnemy           = releasePixiEnemy;
window.gcPixiEnemySprites         = gcPixiEnemySprites;
window._gcWhisperingSprites       = gcPixiEnemySprites; // back-compat
window.renderWhisperingSpiritPixi = renderWhisperingSpiritPixi;
window.releaseWhisperingSpritePixi = releaseWhisperingSpritePixi;
