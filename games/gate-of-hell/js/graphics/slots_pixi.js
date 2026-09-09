/* slots_pixi.js — Pure-Pixi slot rendering (replaces ctx2d drawSlots).
 *
 * One PIXI.Sprite per logicalSlot, pinned to slot position. Texture chosen by
 * slot.type ('unit' vs 'shrine') from preloaded webp assets. Sprites added to
 * worldLayer (below entity bodies, above bgLayer).
 */

const SLOT_TILE_OVERSCAN = 1.4;
const SLOT_TILE_W_BASE   = 114;  // matches SLOT_WIDTH in slots.js
const SLOT_TILE_H_BASE   = 165;  // matches SPACING_Y  in slots.js

let _slotTexUnit   = null;
let _slotTexShrine = null;
const _slotSprites = []; // PIXI.Sprite[]
let _slotsBuilt    = false;

// Phase 2: rebuild on Pixi reset (textures preserved, sprites destroyed).
if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        _slotSprites.length = 0;
        _slotsBuilt = false;
    });
}

function _ensureSlotTextures() {
    if (_slotTexUnit && _slotTexShrine) return true;
    if (typeof PIXI === 'undefined') return false;
    if (!_slotTexUnit) {
        PIXI.Assets.load('images/world/tower_slot.webp').then(t => { _slotTexUnit = t; _refreshSlotTextures(); });
    }
    if (!_slotTexShrine) {
        PIXI.Assets.load('images/world/shrine_slot.webp').then(t => { _slotTexShrine = t; _refreshSlotTextures(); });
    }
    return false;
}

function _refreshSlotTextures() {
    if (!_slotsBuilt) return;
    const sw = SLOT_TILE_W_BASE * SLOT_TILE_OVERSCAN;
    const sh = SLOT_TILE_H_BASE * SLOT_TILE_OVERSCAN;
    _slotSprites.forEach((sp, i) => {
        const slot = window.logicalSlots[i];
        if (!slot) return;
        const tex = slot.type === 'shrine' ? _slotTexShrine : _slotTexUnit;
        if (tex && sp.texture !== tex) {
            sp.texture = tex;
            // Reset scale AFTER assigning real texture (EMPTY → real swap leaves stale scale).
            sp.width  = sw;
            sp.height = sh;
            sp.visible = true;
        }
    });
}

function _buildSlotSprites() {
    if (_slotsBuilt || !window.logicalSlots || !window.worldLayer) return;
    window.logicalSlots.forEach(slot => {
        const sp = new PIXI.Sprite(PIXI.Texture.EMPTY);
        sp.anchor.set(0.5, 0.5);
        sp.x = slot.lx;
        sp.y = slot.ly;
        sp.visible = false; // hide until texture loaded; size set then
        window.worldLayer.addChild(sp);
        _slotSprites.push(sp);
    });
    _slotsBuilt = true;
    _refreshSlotTextures();
}

function updatePixiSlots() {
    if (!window.logicalSlots || window.logicalSlots.length === 0) return;
    if (!_slotsBuilt) _buildSlotSprites();
    _ensureSlotTextures();
    // Cheap per-frame tint pulse based on occupied state.
    const t = (window.lavaPhase || 0) * 1.2;
    const pulse = (Math.sin(t) + 1) / 2;
    for (let i = 0; i < _slotSprites.length; i++) {
        const slot = window.logicalSlots[i];
        const sp = _slotSprites[i];
        if (!slot || !sp) continue;
        sp.alpha = slot.isOccupied ? 1.0 : (0.78 + pulse * 0.08);
    }
}

window.updatePixiSlots = updatePixiSlots;
