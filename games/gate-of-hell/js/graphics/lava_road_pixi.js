/* lava_road_pixi.js — Bake drawLavaRoad to a single static Pixi Sprite.
 *
 * drawLavaRoad does heavy procedural ctx2d work every frame (sky gradient,
 * hellfire glow, crack borders, direction arrows, portal glows). Most is
 * static. We bake one snapshot and display as a full-canvas Pixi Sprite on
 * bgLayer. Lost: pulse animations on cracks/arrows (subtle, acceptable).
 *
 * Road tile fill (the actual road surface) is rendered separately by
 * road_pixi.js — drawLavaRoad's road-fill block is already gated when
 * _roadPixiInstalled.
 */

let _lavaRoadSprite     = null;
let _lavaRoadBakeFailed = false;
let _lavaRoadInstalled  = false;

if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        _lavaRoadSprite = null;
        _lavaRoadInstalled = false;
        // _lavaRoadBakeFailed preserved (no point re-baking if it failed before)
    });
}

function _bakeLavaRoad() {
    if (_lavaRoadSprite || _lavaRoadBakeFailed) return _lavaRoadSprite;
    if (typeof PIXI === 'undefined' || typeof drawLavaRoad !== 'function') {
        _lavaRoadBakeFailed = true;
        return null;
    }

    const W = window.LOGICAL_WIDTH  || 1080;
    const H = window.LOGICAL_HEIGHT || 1440;

    const origCtx = window.ctx;
    const origNow = Date.now;
    const origTimer = window.globalAnimTimer;

    try {
        const off = document.createElement('canvas');
        off.width = W; off.height = H;
        const offCtx = off.getContext('2d');
        offCtx.imageSmoothingEnabled = false;

        window.ctx = offCtx;
        // Use a fixed time so pulse/glow capture mid-cycle (not at zero).
        const fakeT = 5_000_000;
        Date.now = () => fakeT;
        window.globalAnimTimer = fakeT / 1000;

        // Force road-fill block to draw (we want the road tile visible in bake even though
        // road_pixi handles it live too). Actually skip: road_pixi already handles tile.
        // Just bake what drawLavaRoad provides WITHOUT the road tile region (gated by _roadPixiInstalled).
        drawLavaRoad();

        const tex = PIXI.Texture.from(off);
        _lavaRoadSprite = new PIXI.Sprite(tex);
        _lavaRoadSprite.x = 0;
        _lavaRoadSprite.y = 0;
        console.log('[lava_road_pixi] Baked 1 static frame.');
    } catch (err) {
        console.error('[lava_road_pixi] bake failed:', err);
        _lavaRoadBakeFailed = true;
    } finally {
        window.ctx = origCtx;
        Date.now = origNow;
        window.globalAnimTimer = origTimer;
    }
    return _lavaRoadSprite;
}

function _installLavaRoad() {
    if (_lavaRoadInstalled || !window.bgLayer) return;
    const sp = _bakeLavaRoad();
    if (!sp) return;
    window.bgLayer.addChild(sp);
    _lavaRoadInstalled = true;
    window._lavaRoadPixiInstalled = true;
    console.log('[lava_road_pixi] sprite installed on bgLayer.');
}

function updateLavaRoadPixi() {
    // bgLayer contents disabled — no-op.
}

window.updateLavaRoadPixi = updateLavaRoadPixi;
