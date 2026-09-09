/* road_seam_pixi.js — Lava ember outline VFX along the slot_bg ↔ road seam.
 *
 * Draws an inverted-T outline:
 *   - Horizontal: along (0..roadX) and (roadX+roadW..W) at y = barBottom
 *   - Vertical:   down both stem edges from barBottom to H
 * Animated pulse on outerStrength via GlowFilter.
 */

let _seamGfx       = null;
let _seamGlow      = null;
let _seamInstalled = false;
let _seamPhase     = 0;

if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        _seamGfx = null;
        _seamGlow = null;
        _seamInstalled = false;
    });
}

function _installRoadSeam() {
    if (_seamInstalled || !window.worldLayer || typeof PIXI === 'undefined') return;
    const W = window.LOGICAL_WIDTH  || 1080;
    const H = window.LOGICAL_HEIGHT || 1440;
    const roadW = (typeof getRoadWidth === 'function') ? getRoadWidth() : 342;
    const roadX = (typeof getRoadX     === 'function') ? getRoadX()     : (W - roadW) / 2;
    const MERGE_Y   = H * 0.22;
    const barBottom = MERGE_Y * 0.1 + 220;

    _seamGfx = new PIXI.Graphics();

    const strokeBright = { width: 3, color: 0xFFAA33, alpha: 1.0 };
    const strokeCore   = { width: 2, color: 0xFF3300, alpha: 0.95 };

    // Left horizontal + vertical
    _seamGfx
        .moveTo(0, barBottom).lineTo(roadX, barBottom).lineTo(roadX, H)
        .stroke(strokeBright);
    _seamGfx
        .moveTo(0, barBottom).lineTo(roadX, barBottom).lineTo(roadX, H)
        .stroke(strokeCore);

    // Right horizontal + vertical
    _seamGfx
        .moveTo(W, barBottom).lineTo(roadX + roadW, barBottom).lineTo(roadX + roadW, H)
        .stroke(strokeBright);
    _seamGfx
        .moveTo(W, barBottom).lineTo(roadX + roadW, barBottom).lineTo(roadX + roadW, H)
        .stroke(strokeCore);

    _seamGfx.blendMode = 'add';

    if (typeof createGlowFilter === 'function') {
        _seamGlow = createGlowFilter(0xFF4400, 2.5, 0, 10);
        if (_seamGlow) _seamGfx.filters = [_seamGlow];
    }

    window.worldLayer.addChild(_seamGfx);
    _seamInstalled = true;
    console.log('[road_seam_pixi] installed on worldLayer.');
}

function updateRoadSeam() {
    if (!_seamInstalled) {
        _installRoadSeam();
        if (!_seamInstalled) return;
    }
    _seamPhase += (window.dt || 1) * 0.06;
    const pulse = 2.0 + Math.sin(_seamPhase) * 0.8;
    if (_seamGlow) _seamGlow.outerStrength = pulse;
}

window.updateRoadSeam = updateRoadSeam;
