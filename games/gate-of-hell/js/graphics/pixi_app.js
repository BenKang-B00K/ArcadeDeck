/* pixi_app.js — Pixi.js v8 Application Bootstrap (Phase 1-2, Phase 10: Glow) */

window.LOGICAL_WIDTH  = window.LOGICAL_WIDTH  || 1080;
window.LOGICAL_HEIGHT = window.LOGICAL_HEIGHT || 1440;

// Create the application instance (v8)
const pixiApp = new PIXI.Application();

// Layer containers
// Note: holyLayer merged into vfxLayer — filters are per-DisplayObject, not per-layer.
// bgLayer removed — no backdrop.
const worldLayer   = new PIXI.Container();
const entityLayer  = new PIXI.Container();
const vfxLayer     = new PIXI.Container();
const textLayer    = new PIXI.Container();
const overlayLayer = new PIXI.Container();

pixiApp.stage.addChild(worldLayer, entityLayer, vfxLayer, textLayer, overlayLayer);

/**
 * Initializes the PixiJS v8 application.
 * Returns a promise that resolves when initialization is complete.
 */
async function initPixiApp() {
    const container = document.getElementById('top-panel');
    if (!container) return;

    try {
        await pixiApp.init({
            width:           window.LOGICAL_WIDTH,
            height:          window.LOGICAL_HEIGHT,
            background:      0x000000,
            antialias:       false,
            resolution:      1,
            preference:      'high-performance',
            autoStart:       false,
            // v8 uses 'canvas' instead of 'view' for the property name in options too
            // but we can append it manually after init.
        });

        // v8 renamed .view to .canvas
        pixiApp.canvas.id                   = 'game-canvas';
        pixiApp.canvas.style.width          = '100%';
        pixiApp.canvas.style.height         = '100%';
        pixiApp.canvas.style.display        = 'block';

        container.appendChild(pixiApp.canvas);
        
        resizePixiApp();
        window.pixiReady = true;
        console.log("PixiJS v8 Initialized.");
    } catch (err) {
        console.error("PixiJS Init Failed:", err);
    }
}

/**
 * Resizes the PixiJS renderer based on the container dimensions.
 */
function resizePixiApp() {
    const container = document.getElementById('top-panel');
    if (!container || !pixiApp.renderer) return;
    
    const rect = container.getBoundingClientRect();
    if (rect.width === 0) return;
    
    const ratio = rect.height / rect.width;
    window.LOGICAL_HEIGHT = Math.floor(window.LOGICAL_WIDTH * ratio);
    
    // v8 resize
    pixiApp.renderer.resize(window.LOGICAL_WIDTH, window.LOGICAL_HEIGHT);
    window.scaleFactor = rect.width / window.LOGICAL_WIDTH;

    // 'pixelated' is only correct at >= 1:1 in DEVICE pixels. Below that the
    // browser does a nearest DECIMATION and drops rows, so moving pixel art
    // shimmers. Note scaleFactor is CSS-px based and DPR-blind: a DPR-2 desktop
    // showing 602 CSS px is really 1204 device px, i.e. an upscale.
    const devScale = (rect.width * (window.devicePixelRatio || 1)) / window.LOGICAL_WIDTH;
    pixiApp.canvas.style.imageRendering = (devScale >= 0.999) ? 'pixelated' : 'auto';
}

/**
 * Creates a PIXI.filters.GlowFilter (pixi-filters v6) for PixiJS v8.
 */
function createGlowFilter(color, outer, inner, dist) {
    color = (color !== undefined) ? color : 0xFFD700;
    outer = (outer !== undefined) ? outer : 2;
    inner = (inner !== undefined) ? inner : 0;
    dist  = (dist  !== undefined) ? dist  : 15;
    
    // Check if PIXI.filters.GlowFilter exists (v6)
    if (!PIXI.filters || !PIXI.filters.GlowFilter) return null;
    
    return new PIXI.filters.GlowFilter({
        distance:      dist,
        outerStrength: outer,
        innerStrength: inner,
        color:         color,
        quality:       0.1,
    });
}

/* ─── Sacred Tablet selection outline ──────────────────────────
 * Red silhouette behind whichever unit / shrine / enemy the tablet is
 * inspecting. Not an OutlineFilter: pixi-filters never resolves in this build
 * (PIXI.filters is undefined, which is also why createGlowFilter returns null),
 * so the outline is four tinted copies of the sprite's current frame offset
 * around the original — a one-pass dilate that batches like any other sprite.
 * The tablet inspects one entity at a time, so one set of copies is enough.
 */
const SELECTION_OUTLINE_COLOR = 0xFF1744;
const SEL_OUTLINE_OFFSETS = [[-3, 0], [3, 0], [0, -3], [0, 3]];
let _selOutlineCopies  = null;
let _selOutlineClaimed = false;

function _ensureSelOutlineCopies() {
    if (_selOutlineCopies) return _selOutlineCopies;
    if (typeof PIXI === 'undefined') return null;
    _selOutlineCopies = SEL_OUTLINE_OFFSETS.map(() => {
        const s = new PIXI.Sprite();
        s.tint = SELECTION_OUTLINE_COLOR;
        s.roundPixels = true;
        s.visible = false;
        return s;
    });
    return _selOutlineCopies;
}

function _hideSelectionOutline() {
    if (!_selOutlineCopies) return;
    _selOutlineCopies.forEach(c => {
        if (c.destroyed) return;
        c.visible = false;
        if (c.parent) c.parent.removeChild(c);
        c.texture = PIXI.Texture.EMPTY;
    });
}

/** Per-frame claim: mirror `sprite` in red, just underneath it. */
function markSelectionOutline(sprite, selected) {
    if (!selected || !sprite || sprite.destroyed || !sprite.parent) return;
    const copies = _ensureSelOutlineCopies();
    if (!copies) return;
    const parent = sprite.parent;
    for (let i = 0; i < copies.length; i++) {
        const c = copies[i];
        c.texture = sprite.texture;
        c.anchor.set(sprite.anchor.x, sprite.anchor.y);
        c.scale.set(sprite.scale.x, sprite.scale.y);
        c.alpha   = sprite.alpha;
        c.x = sprite.x + SEL_OUTLINE_OFFSETS[i][0];
        c.y = sprite.y + SEL_OUTLINE_OFFSETS[i][1];
        c.tint = SELECTION_OUTLINE_COLOR;
        c.visible = true;
        // Re-seat every frame: the target sprite may have been pooled, promoted
        // or re-added since, and the copies must stay directly behind it.
        // Detach BEFORE reading the sprite's index — addChildAt removes the copy
        // first, so an index read while the copy is still in place is one too
        // high and drops the copy on TOP of the sprite. That flipped the whole
        // unit red on alternating frames, which is what the blinking was.
        if (c.parent) c.parent.removeChild(c);
        parent.addChildAt(c, parent.getChildIndex(sprite));
    }
    _selOutlineClaimed = true;
}

/**
 * Called once per frame after entities render. If nothing claimed the outline
 * this frame the selection is gone (deselected, killed, sacrificed) — hide it.
 */
function tickSelectionOutline() {
    if (!_selOutlineClaimed) _hideSelectionOutline();
    _selOutlineClaimed = false;
}

/**
 * Baked pixel-art canvas -> Texture. Nearest filtering, never bilinear.
 * Pixi v8 defaults every TextureSource to 'linear', which smears 2x pixel art
 * across texels whenever a sprite sits at a fractional position or scale.
 * Scoped to canvas bakes on purpose: the painted .webp world art still wants
 * linear, so we do NOT touch PIXI.TextureSource.defaultOptions.
 */
function pixelTexture(canvas) {
    const t = PIXI.Texture.from(canvas);
    t.source.scaleMode = 'nearest';
    return t;
}

/**
 * Helper to convert CSS color strings to hex numbers.
 */
function cssColorToHex(color) {
    if (typeof color !== 'string') return 0xFFFFFF;
    color = color.trim();
    if (color.startsWith('#')) {
        const hex = color.slice(1);
        if (hex.length === 3) {
            return (parseInt(hex[0] + hex[0], 16) << 16) |
                   (parseInt(hex[1] + hex[1], 16) <<  8) |
                    parseInt(hex[2] + hex[2], 16);
        }
        return parseInt(hex.slice(0, 6), 16) || 0xFFFFFF;
    }
    if (color.startsWith('rgb')) {
        const m = color.match(/[\d.]+/g);
        if (m && m.length >= 3) {
            return (parseInt(m[0]) << 16) | (parseInt(m[1]) << 8) | parseInt(m[2]);
        }
    }
    return 0xFFFFFF;
}

window.addEventListener('resize', resizePixiApp);

/**
 * Brute-force teardown of every persistent Pixi child on every layer.
 * Textures preserved (shared, cached). Object pools reset.
 * Per-file modules subscribe to 'pixiReset' EventBus event to reset local flags.
 */
function resetPixiScene() {
    const layers = [worldLayer, entityLayer, vfxLayer, textLayer, overlayLayer];
    layers.forEach(layer => {
        // Iterate copy — destroy mutates parent.
        const children = layer.children.slice();
        children.forEach(c => {
            try { layer.removeChild(c); } catch (_) {}
            try { c.destroy({ children: true, texture: false, baseTexture: false }); } catch (_) {}
        });
    });

    // Also clear direct stage children added by world_pixi.js
    if (pixiApp && pixiApp.stage) {
        const stageChildren = pixiApp.stage.children.slice();
        stageChildren.forEach(c => {
            // Skip the layer containers themselves.
            if (layers.indexOf(c) !== -1) return;
            try { pixiApp.stage.removeChild(c); } catch (_) {}
            try { c.destroy({ children: true, texture: false, baseTexture: false }); } catch (_) {}
        });
    }

    // Reset object pools
    if (window.Pools) Object.values(window.Pools).forEach(p => p.reset && p.reset());

    // Outline copies lived on entityLayer and were just destroyed with it.
    _selOutlineCopies  = null;
    _selOutlineClaimed = false;

    // Signal subsystems to drop module-local state (flags, Maps).
    if (window.EventBus) EventBus.emit('pixiReset');

    console.log('Pixi scene reset — layers cleared.');
}

window.resetPixiScene = resetPixiScene;

// Global Ready flag
window.pixiReady = false;

// We'll let data_loader.js or script.js coordinate the start
// But we still keep the DOMContentLoaded for standalone safety
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPixiApp);
} else {
    initPixiApp();
}

// Window Exports
window.pixiApp          = pixiApp;
window.worldLayer       = worldLayer;
window.entityLayer      = entityLayer;
window.vfxLayer         = vfxLayer;
window.holyLayer        = vfxLayer; // alias — legacy callers still resolve
window.textLayer        = textLayer;
window.overlayLayer     = overlayLayer;
window.pixelTexture     = pixelTexture;
window.cssColorToHex    = cssColorToHex;
window.createGlowFilter = createGlowFilter;
window.markSelectionOutline = markSelectionOutline;
window.tickSelectionOutline = tickSelectionOutline;
window.resizePixiApp    = resizePixiApp;
