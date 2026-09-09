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
        pixiApp.canvas.style.imageRendering = 'pixelated';
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
window.cssColorToHex    = cssColorToHex;
window.createGlowFilter = createGlowFilter;
window.resizePixiApp    = resizePixiApp;
