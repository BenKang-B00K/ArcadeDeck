/* world_pixi.js — Pure-PIXI static world sprites (crowd, center gargoyle).
 *
 * Uses PIXI.Sprite.from(url) which handles async texture loading internally.
 * Sprites attach to bgLayer / worldLayer. Procedural fallbacks in world_road.js
 * still run when these sprites are absent.
 */

let _wpInitialized = false;

let _crowdSprite       = null;
let _centerGargoyleSpr = null;
let _slotBgLeftSpr     = null;
let _slotBgRightSpr    = null;

if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        _wpInitialized = false;
        _crowdSprite = null;
        _centerGargoyleSpr = null;
        _slotBgLeftSpr = null;
        _slotBgRightSpr = null;
    });
}

function _makeSprite(url, name) {
    const sp = new PIXI.Sprite(PIXI.Texture.EMPTY);
    sp.label = name;
    sp.visible = false;     // hide until real texture loads (prevents EMPTY-scale balloon bug)
    sp.alpha = 1;
    sp._loaded = false;
    PIXI.Assets.load(url).then(tex => {
        sp.texture = tex;
        sp._loaded = true;
        sp.visible = true;
        console.log(`[world_pixi] LOADED ${url} ${tex.source?.width || '?'}x${tex.source?.height || '?'}`);
    }).catch(err => console.error(`[world_pixi] PIXI load failed ${url}`, err));
    return sp;
}

function initWorldPixi() {
    if (_wpInitialized) return;
    if (!window.pixiApp || !window.pixiApp.stage || !window.PIXI) return;

    const stage = window.pixiApp.stage;
    const W = window.LOGICAL_WIDTH  || 1080;
    const H = window.LOGICAL_HEIGHT || 1440;

    stage.sortableChildren = true;

    // Existing layer zIndexes: world+entities above sprites
    if (window.worldLayer)   window.worldLayer.zIndex   = 5;
    if (window.entityLayer)  window.entityLayer.zIndex  = 10;
    if (window.holyLayer)    window.holyLayer.zIndex    = 15;
    if (window.vfxLayer)     window.vfxLayer.zIndex     = 20;
    if (window.textLayer)    window.textLayer.zIndex    = 25;
    if (window.overlayLayer) window.overlayLayer.zIndex = 30;

    // Crowd silhouettes — above bgLayer (covers procedural crowd) but below worldLayer/entities
    _crowdSprite = _makeSprite('images/world/crowd_sprites.webp', 'crowd');
    _crowdSprite.x = 0;
    _crowdSprite.y = 0;
    _crowdSprite.zIndex = 2;
    stage.addChild(_crowdSprite);

    // Center gargoyle throne — above crowd. Top-anchored so y=0 aligns to viewport top.
    _centerGargoyleSpr = _makeSprite('images/world/center_gargoyle.webp', 'throne');
    _centerGargoyleSpr.anchor.set(0.5, 0);
    _centerGargoyleSpr.zIndex = 3;
    stage.addChild(_centerGargoyleSpr);

    // Slot side backdrops — sit above road tile, below slot tiles (worldLayer zIndex 5).
    // One source strip mirrored at runtime for the right side.
    // Dims applied AFTER texture loads to avoid EMPTY→real scale balloon bug.
    const MERGE_Y = H * 0.22;
    const roadW = 342;
    const sideW = (W - roadW) / 2;
    // Raise to road bar bottom to close the side gap (matches road_pixi bar geom).
    const _barBottom = MERGE_Y * 0.1 + 220;
    const sideH = H - _barBottom;

    const _sizeSlotBg = (sp, mirror) => {
        if (!sp._loaded) return;
        sp.width  = sideW;
        sp.height = sideH;
        if (mirror) sp.scale.x = -Math.abs(sp.scale.x);
    };

    // Slot side backdrops on worldLayer — above road (idx 0), below slots/entities.
    const _slotBgParent = window.worldLayer || stage;

    _slotBgLeftSpr = _makeSprite('images/world/slot_bg_side.webp', 'slot_bg_left');
    _slotBgLeftSpr.anchor.set(0, 0);
    _slotBgLeftSpr.x = 0;
    _slotBgLeftSpr.y = _barBottom;
    _slotBgParent.addChild(_slotBgLeftSpr);

    _slotBgRightSpr = _makeSprite('images/world/slot_bg_side.webp', 'slot_bg_right');
    _slotBgRightSpr.anchor.set(0, 0);
    _slotBgRightSpr.x = W;          // origin at right edge; scale.x = -1 mirrors leftward
    _slotBgRightSpr.y = _barBottom;
    _slotBgParent.addChild(_slotBgRightSpr);

    // Poll once per frame in updateWorldPixiSprites until both loaded, then apply dims.
    _slotBgLeftSpr._applyDims  = () => _sizeSlotBg(_slotBgLeftSpr,  false);
    _slotBgRightSpr._applyDims = () => _sizeSlotBg(_slotBgRightSpr, true);

    _wpInitialized = true;
    console.log('[world_pixi] sprites attached to stage. stage children:', stage.children.length);
}

function updateWorldPixiSprites() {
    if (!_wpInitialized) {
        initWorldPixi();
        if (!_wpInitialized) return;
    }

    const W = window.LOGICAL_WIDTH  || 1080;
    const H = window.LOGICAL_HEIGHT || 1440;
    const MERGE_Y = H * 0.22;

    if (_crowdSprite && _crowdSprite._loaded) {
        // Hidden for T-shape — cheering crowd drawn procedurally inside bar.
        _crowdSprite.visible = false;
    }

    if (_centerGargoyleSpr) {
        // Gargoyle removed — hide PIXI sprite.
        _centerGargoyleSpr.visible = false;
    }

    if (_slotBgLeftSpr && _slotBgLeftSpr._loaded && !_slotBgLeftSpr._sized) {
        _slotBgLeftSpr._applyDims();
        _slotBgLeftSpr._sized = true;
    }
    if (_slotBgRightSpr && _slotBgRightSpr._loaded && !_slotBgRightSpr._sized) {
        _slotBgRightSpr._applyDims();
        _slotBgRightSpr._sized = true;
    }
}

function setCenterGargoyleVisible(visible) {
    if (_centerGargoyleSpr) _centerGargoyleSpr.visible = !!visible;
}

window.initWorldPixi             = initWorldPixi;
window.updateWorldPixiSprites    = updateWorldPixiSprites;
window.setCenterGargoyleVisible  = setCenterGargoyleVisible;
