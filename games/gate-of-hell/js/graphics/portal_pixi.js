/* portal_pixi.js — Bake drawPortal (hell castle at bottom) to Pixi AnimatedSprite.
 *
 * drawPortal renders hundreds of ctx2d ops per frame for a mostly-static
 * pillared portal with hellfire ambient. Bake N frames over the visual pulse
 * cycle (~2.5s) and animate. eRatio (portal energy) modulation captured at
 * baseline ratio; live tinting could approximate dynamic eRatio if needed.
 *
 * Bake trick: temporarily override window.LOGICAL_WIDTH/HEIGHT so drawPortal's
 * CX/CY/roadX compute relative to the bake canvas (not the full game canvas).
 */

const PORTAL_FRAME_COUNT = 16;
const PORTAL_BAKE_W      = 640;
const PORTAL_BAKE_H      = 280;
const PORTAL_CYCLE_MS    = 2520;  // 2π / 2.5 rad/s ≈ 2513ms
const PORTAL_BAKE_BASE_T = 4_000_000;

let _portalFrames     = null;
let _portalBakeFailed = false;
let _portalSprite     = null;
let _portalInstalled  = false;

if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        _portalSprite = null;
        _portalInstalled = false;
        // _portalFrames (Texture[]) preserved — frames re-attachable to new sprite.
    });
}

function _bakePortalFrames() {
    if (_portalFrames || _portalBakeFailed) return _portalFrames;
    if (typeof PIXI === 'undefined' || typeof drawPortal !== 'function') {
        _portalBakeFailed = true;
        return null;
    }

    const origCtx = window.ctx;
    const origNow = Date.now;
    const SAVE_W  = window.LOGICAL_WIDTH;
    const SAVE_H  = window.LOGICAL_HEIGHT;
    const frames  = [];

    try {
        // Force portal layout to compute relative to bake canvas dimensions.
        window.LOGICAL_WIDTH  = PORTAL_BAKE_W;
        window.LOGICAL_HEIGHT = PORTAL_BAKE_H;

        for (let i = 0; i < PORTAL_FRAME_COUNT; i++) {
            const off = document.createElement('canvas');
            off.width  = PORTAL_BAKE_W;
            off.height = PORTAL_BAKE_H;
            const offCtx = off.getContext('2d');
            offCtx.imageSmoothingEnabled = false;

            const fakeT = PORTAL_BAKE_BASE_T + (i / PORTAL_FRAME_COUNT) * PORTAL_CYCLE_MS;
            window.ctx = offCtx;
            Date.now   = () => fakeT;
            window.globalAnimTimer = fakeT / 1000;

            drawPortal();
            frames.push(pixelTexture(off));
        }
        _portalFrames = frames;
        console.log(`[portal_pixi] Baked ${frames.length} frames.`);
    } catch (err) {
        console.error('[portal_pixi] bake failed:', err);
        _portalBakeFailed = true;
    } finally {
        window.ctx = origCtx;
        Date.now   = origNow;
        window.LOGICAL_WIDTH  = SAVE_W;
        window.LOGICAL_HEIGHT = SAVE_H;
    }
    return _portalFrames;
}

function _installPortal() {
    if (_portalInstalled || !window.worldLayer) return;
    const frames = _bakePortalFrames();
    if (!frames) return;

    const W = window.LOGICAL_WIDTH  || 1080;
    const H = window.LOGICAL_HEIGHT || 1440;

    _portalSprite = new PIXI.AnimatedSprite(frames);
    _portalSprite.anchor.set(0.5, 1.0);    // bottom-center anchor
    _portalSprite.x = W / 2;
    _portalSprite.y = H;
    _portalSprite.animationSpeed = 0.15;   // 16 frames / 2.5s ≈ 6.4fps
    _portalSprite.loop = true;
    _portalSprite.play();
    window.worldLayer.addChild(_portalSprite);

    _portalInstalled = true;
    window._portalPixiInstalled = true;
    console.log('[portal_pixi] portal installed at bottom-center.');
}

function updatePortalPixi() {
    if (!_portalInstalled) _installPortal();
}

window.updatePortalPixi = updatePortalPixi;
