/* road_pixi.js — Pure-Pixi T-shaped road via TilingSprite + Graphics mask.
 *
 * Renders on worldLayer at index 0 (below portal/gates/slots/towers).
 * Horizontal bar across full width at top + vertical stem down to portal.
 */

let _roadTilingSprite = null;
let _roadMaskGfx      = null;
let _roadInitTried    = false;
let _roadTexture      = null;

if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        _roadTilingSprite = null;
        _roadMaskGfx = null;
        _roadInitTried = false;
        // _roadTexture preserved (asset)
    });
}

function _ensureRoadTexture(callback) {
    if (_roadTexture) { callback(_roadTexture); return; }
    if (typeof PIXI === 'undefined') return;
    PIXI.Assets.load('images/world/road_tile.webp').then(tex => {
        _roadTexture = tex;
        callback(tex);
    }).catch(err => console.error('[road_pixi] load failed', err));
}

function _buildRoadMask() {
    const W = window.LOGICAL_WIDTH  || 1080;
    const H = window.LOGICAL_HEIGHT || 1440;
    const roadW = (typeof getRoadWidth === 'function') ? getRoadWidth() : 342;
    const roadX = (typeof getRoadX     === 'function') ? getRoadX()     : (W - roadW) / 2;

    const MERGE_Y   = H * 0.22;
    // Bar from y=0 to former bottom (MERGE_Y*0.1 + 220) — eliminates top black strip.
    const barY      = 0;
    const barH      = MERGE_Y * 0.1 + 220;

    const mask = new PIXI.Graphics();
    mask.rect(0, barY, W, barH).fill(0xFFFFFF);
    mask.rect(roadX, barY, roadW, H - barY).fill(0xFFFFFF);
    return mask;
}

function initRoadPixi() {
    if (_roadInitTried) return;
    _roadInitTried = true;
    if (!window.worldLayer || typeof PIXI === 'undefined') {
        _roadInitTried = false;
        return;
    }

    const W = window.LOGICAL_WIDTH  || 1080;
    const H = window.LOGICAL_HEIGHT || 1440;

    _ensureRoadTexture(tex => {
        _roadTilingSprite = new PIXI.TilingSprite({
            texture: tex,
            width:   W,
            height:  H,
        });
        _roadTilingSprite.x = 0;
        _roadTilingSprite.y = 0;
        // Smaller tile = finer texture detail, more cobble/lava repetitions.
        _roadTilingSprite.tileScale.set(0.5, 0.5);

        _roadMaskGfx = _buildRoadMask();
        if (_roadMaskGfx) {
            window.worldLayer.addChild(_roadMaskGfx);
            _roadTilingSprite.mask = _roadMaskGfx;
        }
        // Index 0 → below portal/gates/slots/towers.
        window.worldLayer.addChildAt(_roadTilingSprite, 0);
        if (_roadMaskGfx) {
            window.worldLayer.setChildIndex(_roadMaskGfx, window.worldLayer.children.length - 1);
        }
        window._roadPixiInstalled = true;
        console.log('[road_pixi] road tiling sprite + mask installed on worldLayer.');
    });
}

function updateRoadPixi() {
    if (!_roadInitTried) initRoadPixi();
}

window.initRoadPixi    = initRoadPixi;
window.updateRoadPixi  = updateRoadPixi;
