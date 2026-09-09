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
    const origNow = Date.now;
    const frames = [];

    try {
        for (let i = 0; i < cfg.frames; i++) {
            const off = document.createElement('canvas');
            off.width  = cfg.size;
            off.height = cfg.size;
            const offCtx = off.getContext('2d');
            offCtx.imageSmoothingEnabled = false;

            const fakeT = PIXI_ENEMY_BAKE_BASE_T + (i / cfg.frames) * cfg.cycleMs;
            window.ctx = offCtx;
            Date.now   = () => fakeT;

            drawFn(cfg.size / 2, cfg.size / 2, null);
            frames.push(PIXI.Texture.from(off));
        }
        st.textures = frames;
        console.log(`[pixi_enemy] Baked ${frames.length} frames for "${type}".`);
    } catch (err) {
        console.error(`[pixi_enemy] bake failed for "${type}":`, err);
        st.bakeFailed = true;
        st.textures = null;
    } finally {
        window.ctx = origCtx;
        Date.now   = origNow;
    }
    return st.textures;
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
        sprite.anchor.set(0.5, 0.5);
        sprite.animationSpeed = 0.10;
        sprite.loop = true;
    }
    sprite.visible = true;
    sprite.alpha   = 1;
    sprite.scale.set(1, 1);
    sprite.tint    = 0xFFFFFF;
    sprite.filters = null;
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
        sprite.filters = null;
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

/** Per-frame GC. Releases sprites whose enemies are dead or removed. */
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
                _releaseSprite(type, record);
                st.active.delete(enemy);
            }
        }
    }
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
    const stunned  = !!enemy.isStunned;
    const slowed   = enemy.speed < enemy.baseSpeed;

    if (hitFlash || stunned || slowed) {
        if (!record.filter) record.filter = new PIXI.ColorMatrixFilter();
        const cm = record.filter;
        cm.reset();
        if (hitFlash) { cm.brightness(2.2, true); cm.contrast(1.6, true); }
        if (stunned)  { cm.desaturate(); cm.brightness(1.5, true); }
        if (slowed)   { cm.hue(90, true); }
        sprite.filters = [cm];
    } else if (sprite.filters) {
        sprite.filters = null;
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
    let glowColor = null, glowAlpha = 0;
    if (enemy.isBurning)            { glowColor = 0xFF4500; glowAlpha = 0.4; }
    else if (enemy.isStunned)       { glowColor = 0xFFFFFF; glowAlpha = 0.3; }
    else if (enemy.speed < enemy.baseSpeed) { glowColor = 0x00E5FF; glowAlpha = 0.3; }
    else if (isBoss)                { glowColor = 0xFF0000; glowAlpha = 0.2; }
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

window.PIXI_ENEMY_REGISTRY        = PIXI_ENEMY_REGISTRY;
window.isPixiEnemyType            = isPixiEnemyType;
window.renderPixiEnemy            = renderPixiEnemy;
window.releasePixiEnemy           = releasePixiEnemy;
window.gcPixiEnemySprites         = gcPixiEnemySprites;
window._gcWhisperingSprites       = gcPixiEnemySprites; // back-compat
window.renderWhisperingSpiritPixi = renderWhisperingSpiritPixi;
window.releaseWhisperingSpritePixi = releaseWhisperingSpritePixi;
