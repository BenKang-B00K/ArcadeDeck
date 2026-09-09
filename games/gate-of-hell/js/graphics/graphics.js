/* graphics.js — Core Rendering Engine (Pixi.js Hybrid Bridge) */

// ── Proxy Canvas (legacy ctx bridge) ─────────────────────────────────────────
// All unconverted draw functions (world, units, enemies) write to this offscreen
// canvas. It is uploaded to the GPU as a bgLayer sprite once per frame.
// Converted VFX functions now draw to Pixi layers (vfxLayer / textLayer) instead.
const _legacyCanvas   = document.createElement('canvas');
_legacyCanvas.width   = window.LOGICAL_WIDTH  || 1080;
_legacyCanvas.height  = window.LOGICAL_HEIGHT || 1440;

// Keep 'var' so window.ctx === ctx — existing pix_* files rely on this alias.
var ctx = _legacyCanvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        _haloGfx = null;
        if (ctx && _legacyCanvas) ctx.clearRect(0, 0, _legacyCanvas.width, _legacyCanvas.height);
    });
}

function initGraphics() {
    // Legacy sprite/texture removed — bake-only canvas, no render to screen.
    _syncSize();
}

function _syncSize() {
    const lw = window.LOGICAL_WIDTH  || 1080;
    const lh = window.LOGICAL_HEIGHT || 1440;
    if (_legacyCanvas.width !== lw || _legacyCanvas.height !== lh) {
        _legacyCanvas.width  = lw;
        _legacyCanvas.height = lh;
        ctx.imageSmoothingEnabled = false;
    }
}

// ── Main Render Function ──────────────────────────────────────────────────────
function renderGraphics() {
    // Wait for Pixi initialization
    if (!window.pixiReady || !pixiApp.renderer) return;

    _syncSize();
    // Legacy canvas only used by gated portal/gate fallbacks.
    // Track whether any ctx2d writer fires this frame; skip clear + upload if not.
    window._legacyCanvasDirty = false;
    // Reset transform once at start (cheap; matters only if a writer runs).
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (typeof lavaPhase       === 'undefined') window.lavaPhase       = 0;
    if (typeof globalAnimTimer === 'undefined') window.globalAnimTimer = 0;
    window.lavaPhase       += 0.02;
    window.globalAnimTimer += 0.06;

    // ── Logical Updates (state, not drawing) ─────────────────────────────────
    if (typeof updateParticles        === 'function') updateParticles();
    if (typeof updateHitEffects       === 'function') updateHitEffects();
    if (typeof updateSoulEssences     === 'function') updateSoulEssences();
    if (typeof updateItemDrops        === 'function') updateItemDrops();
    if (typeof updateLightPillars     === 'function') updateLightPillars();
    if (typeof updatePromotionBursts  === 'function') updatePromotionBursts();
    if (typeof updateStageFlashes     === 'function') updateStageFlashes();
    if (typeof window.updateBanishEffects === 'function') window.updateBanishEffects();
    if (typeof updatePurgeEffects     === 'function') updatePurgeEffects();
    if (typeof updateSummonCircles    === 'function') updateSummonCircles();
    if (typeof updateChainBolts       === 'function') updateChainBolts();
    if (typeof updateFloatingTexts    === 'function') updateFloatingTexts();
    if (typeof updateProjectiles      === 'function') updateProjectiles();
    if (typeof updateImpactRings      === 'function') updateImpactRings();

    // ── Level 0: Pure-PIXI static world sprites (top_bg, road, crowd, slots) ─
    if (typeof updateWorldPixiSprites === 'function') updateWorldPixiSprites();
    if (typeof updateRoadPixi         === 'function') updateRoadPixi();
    if (typeof updateRoadSeam         === 'function') updateRoadSeam();
    if (typeof updateRoadDecorations  === 'function') updateRoadDecorations();
    if (typeof updateWorldDecorations === 'function') updateWorldDecorations();
    if (typeof updateRoadVfxEnhancer  === 'function') updateRoadVfxEnhancer();
    if (typeof updatePortalImpactVfx  === 'function') updatePortalImpactVfx();
    if (typeof updateSpawningGatesPixi === 'function') updateSpawningGatesPixi();
    if (typeof updatePortalPixi        === 'function') updatePortalPixi();
    if (typeof updatePixiSlots        === 'function') updatePixiSlots();
    if (typeof updateSlotsVfx         === 'function') updateSlotsVfx();

    // ── Level 1: Background — drawLavaRoad baked once to bgLayer sprite (lava_road_pixi).
    if (typeof updateLavaRoadPixi      === 'function') updateLavaRoadPixi();
    if (typeof renderPixiShrineAuras   === 'function') renderPixiShrineAuras();
    if (typeof renderPixiShrineVfx     === 'function') renderPixiShrineVfx();

    // ── Level 2: Entities (proxy canvas — world, unit, enemy pixel art) ──────
    if (typeof drawEnemies     === 'function') drawEnemies();
    if (typeof drawUnits       === 'function') drawUnits();
    if (typeof drawSummons     === 'function') drawSummons();

    // ── Level 3: World Overlay — Portal / Gate ───────────────────────────────
    if (typeof drawPortal               === 'function') drawPortal();
    if (typeof drawSpawningGate         === 'function') drawSpawningGate();

    // Legacy ctx2d → Pixi upload pipeline DELETED.
    // _legacyCanvas + window.ctx kept alive only as bake-target swap point
    // for pix_*.js animation frame baking. Nothing renders the canvas to screen.

    // ── Level 4: Converted VFX (Pixi layers — vfxLayer / textLayer) ──────────
    if (typeof drawProjectiles      === 'function') drawProjectiles();
    if (typeof drawParticles        === 'function') drawParticles();
    if (typeof drawHitEffects       === 'function') drawHitEffects();
    if (typeof drawSoulEssences     === 'function') drawSoulEssences();
    if (typeof drawItemDrops        === 'function') drawItemDrops();
    if (typeof drawLightPillars     === 'function') drawLightPillars();
    if (typeof drawPromotionBursts  === 'function') drawPromotionBursts();
    if (typeof window.drawBanishEffects === 'function') window.drawBanishEffects();
    if (typeof drawPurgeEffects     === 'function') drawPurgeEffects();
    if (typeof drawSummonCircles    === 'function') drawSummonCircles();
    if (typeof drawChainBolts       === 'function') drawChainBolts();
    if (typeof drawImpactRings          === 'function') drawImpactRings();
    if (typeof drawStageFlashes         === 'function') drawStageFlashes();
    drawSelectionHalo();

    // ── Final Pixi render pass ────────────────────────────────────────────────
    // v8: simple app.render() or renderer.render({ container: stage })
    pixiApp.render();

    // Gargoyle HUD widget — separate DOM <canvas>, renders its own gctx each frame
    if (typeof updateGargoyleWidget === 'function') updateGargoyleWidget();
}

let _haloGfx = null;
function drawSelectionHalo() {
    if (!window.overlayLayer) return;
    if (!_haloGfx) {
        _haloGfx = new PIXI.Graphics();
        overlayLayer.addChild(_haloGfx);
    }
    _haloGfx.clear();
    const selected = (typeof getSelectedTower === 'function') ? getSelectedTower() : null;
    if (!selected) return;

    // Dashed circle
    const R    = 30;
    const segs = 8;
    const arcLen   = Math.PI * 2 / segs;
    const dashFrac = 0.55;
    const steps    = 6;
    
    // v8 style
    _haloGfx.setStrokeStyle({ width: 2, color: 0xFFD700, alpha: 0.5 });
    
    for (let i = 0; i < segs; i++) {
        const s0 = i * arcLen;
        const s1 = s0 + arcLen * dashFrac;
        for (let j = 0; j <= steps; j++) {
            const ang = s0 + (s1 - s0) * (j / steps);
            const vx = selected.lx + Math.cos(ang) * R;
            const vy = selected.ly + Math.sin(ang) * R;
            if (j === 0) _haloGfx.moveTo(vx, vy); else _haloGfx.lineTo(vx, vy);
        }
        _haloGfx.stroke();
    }
}

// Initialize after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGraphics);
} else {
    initGraphics();
}

// ── Global Exports ────────────────────────────────────────────────────────────
window.ctx          = ctx;
window.canvas       = _legacyCanvas;
window.scaleFactor  = 1.0;
window.renderGraphics = renderGraphics;
