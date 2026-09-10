/* spawning_gates_pixi.js — Bake _drawSummoningCircle to Pixi AnimatedSprite.
 *
 * 2 portals (left/right) at top of road arms. Each shares a single baked frame
 * set (mirrored isn't needed — symmetric art). Animation cycle ~3s captures
 * pulse + rotation + entity emergence.
 */

const GATE_FRAME_COUNT = 24;
const GATE_FRAME_SIZE  = 280; // R * 2.4 padded
const GATE_CYCLE_MS    = 3000;
const GATE_BAKE_BASE_T = 3_000_000;
let _gateFrames        = null;
let _gateBakeFailed    = false;
let _gateLeftSprite    = null;
let _gateRightSprite   = null;
let _gateDecorGfx      = null;
let _gateInstalled     = false;

if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        _gateLeftSprite = null;
        _gateRightSprite = null;
        _gateDecorGfx = null;
        _gateInstalled = false;
    });
}

function _bakeGateFrames() {
    if (_gateFrames || _gateBakeFailed) return _gateFrames;
    if (typeof PIXI === 'undefined' || typeof _drawSummoningCircle !== 'function') {
        _gateBakeFailed = true;
        return null;
    }

    const origCtx = window.ctx;
    const origNow = Date.now;
    const frames = [];
    const SZ = GATE_FRAME_SIZE;
    const R  = 110;

    try {
        for (let i = 0; i < GATE_FRAME_COUNT; i++) {
            const off = document.createElement('canvas');
            off.width = SZ; off.height = SZ;
            const offCtx = off.getContext('2d');
            offCtx.imageSmoothingEnabled = false;

            const fakeT = GATE_BAKE_BASE_T + (i / GATE_FRAME_COUNT) * GATE_CYCLE_MS;
            // _drawSummoningCircle reads window.globalAnimTimer via param `time`; we pass fakeT/1000 as time.
            window.ctx = offCtx;
            Date.now   = () => fakeT;

            _drawSummoningCircle(SZ / 2, SZ / 2, R, fakeT / 1000);
            frames.push(pixelTexture(off));
        }
        _gateFrames = frames;
        console.log(`[gates_pixi] Baked ${frames.length} frames.`);
    } catch (err) {
        console.error('[gates_pixi] bake failed:', err);
        _gateBakeFailed = true;
    } finally {
        window.ctx = origCtx;
        Date.now   = origNow;
    }
    return _gateFrames;
}

// Seeded RNG for stable decor placement across reloads.
function _gateRand(seed) {
    let s = seed | 0;
    return function() {
        s = (s * 1664525 + 1013904223) | 0;
        return ((s >>> 8) & 0xFFFFFF) / 0xFFFFFF;
    };
}

// Draw a single decor "structure" at local (x,y). Variant 0..5.
function _drawDecorStructure(g, x, y, variant, rng) {
    const dark   = 0x1A0B14;
    const stone  = 0x2E1A23;
    const stoneLt= 0x4A2A35;
    const bone   = 0xD7CCC0;
    const boneSh = 0x8A7E70;
    const ember  = 0xFF4500;
    const blood  = 0x6A0B12;

    switch (variant) {
        case 0: {
            // Twisted obsidian spire
            const h = 60 + rng() * 30;
            g.moveTo(x - 10, y).lineTo(x + 8, y).lineTo(x + 2, y - h).closePath()
             .fill({ color: dark, alpha: 0.95 });
            g.moveTo(x - 10, y).lineTo(x + 2, y - h)
             .stroke({ width: 1, color: stoneLt, alpha: 0.7 });
            g.circle(x + 2, y - h, 2).fill({ color: ember, alpha: 0.8 });
            // ember glow
            g.circle(x + 2, y - h, 6).fill({ color: ember, alpha: 0.15 });
            break;
        }
        case 1: {
            // Broken pillar (cracked column)
            const h = 35 + rng() * 20;
            g.rect(x - 8, y - h, 16, h).fill({ color: stone, alpha: 1 });
            g.rect(x - 10, y - 4, 20, 6).fill({ color: stoneLt, alpha: 1 });
            g.rect(x - 10, y - h - 2, 20, 4).fill({ color: stoneLt, alpha: 1 });
            // crack
            g.moveTo(x - 2, y - h + 4).lineTo(x + 1, y - 10)
             .stroke({ width: 1, color: dark, alpha: 0.7 });
            break;
        }
        case 2: {
            // Skull pile
            const baseR = 14;
            g.ellipse(x, y, baseR + 2, 5).fill({ color: dark, alpha: 0.6 });
            for (let i = 0; i < 4; i++) {
                const sx = x + (rng() - 0.5) * 18;
                const sy = y - rng() * 8 - 2;
                const r  = 4 + rng() * 2;
                g.circle(sx, sy, r).fill({ color: bone, alpha: 1 });
                g.circle(sx - r * 0.4, sy - r * 0.1, r * 0.25).fill({ color: dark, alpha: 1 });
                g.circle(sx + r * 0.4, sy - r * 0.1, r * 0.25).fill({ color: dark, alpha: 1 });
                g.rect(sx - 1, sy + r * 0.5, 2, 1.5).fill({ color: dark, alpha: 0.8 });
            }
            break;
        }
        case 3: {
            // Bone fence (vertical ribs on a crossbeam)
            const w = 28;
            g.rect(x - w / 2, y - 4, w, 2.5).fill({ color: boneSh, alpha: 1 });
            for (let i = 0; i < 5; i++) {
                const bx = x - w / 2 + (i + 0.5) * (w / 5);
                g.rect(bx - 1, y - 18, 2, 18).fill({ color: bone, alpha: 1 });
                g.circle(bx, y - 18, 2.2).fill({ color: bone, alpha: 1 });
            }
            break;
        }
        case 4: {
            // Cracked ground patch with rising embers (static)
            g.ellipse(x, y, 24, 7).fill({ color: dark, alpha: 0.85 });
            g.ellipse(x, y, 18, 4).fill({ color: blood, alpha: 0.5 });
            // crack lines
            g.moveTo(x - 18, y).lineTo(x - 6, y - 2).lineTo(x + 4, y + 1).lineTo(x + 18, y - 1)
             .stroke({ width: 1, color: ember, alpha: 0.6 });
            // glow pip
            g.circle(x - 4, y - 1, 1.5).fill({ color: ember, alpha: 0.9 });
            g.circle(x + 8, y, 1.2).fill({ color: ember, alpha: 0.7 });
            break;
        }
        case 5: {
            // Hanging chained banner (dark shroud)
            g.moveTo(x, y - 50).lineTo(x, y - 28)
             .stroke({ width: 1.2, color: stoneLt, alpha: 0.9 });
            g.moveTo(x - 12, y - 28).lineTo(x + 12, y - 28).lineTo(x + 10, y - 4)
             .lineTo(x + 4, y - 8).lineTo(x - 4, y - 4).lineTo(x - 10, y - 8).lineTo(x - 12, y - 28)
             .closePath().fill({ color: blood, alpha: 0.9 })
             .stroke({ width: 1, color: dark, alpha: 1 });
            // sigil
            g.circle(x, y - 18, 3).stroke({ width: 1, color: bone, alpha: 0.95 });
            g.moveTo(x - 2, y - 18).lineTo(x + 2, y - 18).stroke({ width: 1, color: bone, alpha: 0.95 });
            break;
        }
    }
}

// Lay decor around a gate position, avoiding the road footprint.
function _layoutDecorAroundGate(g, cx, cy, side, rng) {
    // side: -1 (left gate, decor mostly left+below), +1 (right gate, mostly right+below)
    // Place ~7 structures in a fan: outward from gate, plus some forward (below) of gate.
    const slots = [
        { dx: side * 110, dy: -20, v: 0 },  // spire outer-back
        { dx: side * 130, dy:  40, v: 5 },  // banner outer
        { dx: side * 95,  dy:  90, v: 1 },  // pillar
        { dx: side * 50,  dy:  85, v: 2 },  // skull pile near front
        { dx: side * -10, dy:  95, v: 3 },  // bone fence forward
        { dx: side * 70,  dy:  40, v: 4 },  // cracked ground side
        { dx: side * 145, dy:  -50, v: 1 }, // pillar back-outer
        { dx: side * 30,  dy:  -55, v: 2 }, // skull pile back-inner
    ];
    slots.forEach(s => {
        // Slight jitter for organic feel
        const jx = (rng() - 0.5) * 8;
        const jy = (rng() - 0.5) * 6;
        _drawDecorStructure(g, cx + s.dx + jx, cy + s.dy + jy, s.v, rng);
    });
}

function _installGates() {
    if (_gateInstalled || !window.worldLayer) return;
    const frames = _bakeGateFrames();
    if (!frames) return;

    const W = window.LOGICAL_WIDTH  || 1080;
    const H = window.LOGICAL_HEIGHT || 1440;
    const roadW = (typeof getRoadWidth === 'function') ? getRoadWidth() : 342;
    const MERGE_Y   = H * 0.22;
    // T-shape: gates at left/right ends of horizontal bar.
    const barH      = 220;
    const barCenterY = MERGE_Y * 0.1 + barH * 0.5;
    const gateMargin = 140;  // gate sprite is ~280px; anchor inset from edge

    // Decor BEHIND the animated gate sprites
    _gateDecorGfx = new PIXI.Graphics();
    const rngL = _gateRand(0xA17C9D);
    const rngR = _gateRand(0xB23F5E);
    _layoutDecorAroundGate(_gateDecorGfx, gateMargin,     barCenterY, -1, rngL);
    _layoutDecorAroundGate(_gateDecorGfx, W - gateMargin, barCenterY, +1, rngR);
    window.worldLayer.addChild(_gateDecorGfx);

    // Animated gate sprites render on worldLayer (below entityLayer) so emerging
    // enemies appear IN FRONT of the portal art — looks like they actually spawn
    // out of the gate. Decor added first stays beneath the gate sprites.
    const gateLayer = window.worldLayer;

    _gateLeftSprite = new PIXI.AnimatedSprite(frames);
    _gateLeftSprite.anchor.set(0.5, 0.5);
    _gateLeftSprite.x = gateMargin;
    _gateLeftSprite.y = barCenterY;
    _gateLeftSprite.animationSpeed = 0.20;
    _gateLeftSprite.loop = true;
    _gateLeftSprite.play();
    gateLayer.addChild(_gateLeftSprite);

    _gateRightSprite = new PIXI.AnimatedSprite(frames);
    _gateRightSprite.anchor.set(0.5, 0.5);
    _gateRightSprite.x = W - gateMargin;
    _gateRightSprite.y = barCenterY;
    _gateRightSprite.animationSpeed = 0.20;
    _gateRightSprite.loop = true;
    _gateRightSprite.play();
    gateLayer.addChild(_gateRightSprite);

    _gateInstalled = true;
    window._spawnGatesPixiInstalled = true;
    console.log('[gates_pixi] 2 portals installed at top of arms.');
}

function updateSpawningGatesPixi() {
    if (!_gateInstalled) _installGates();
}

window.updateSpawningGatesPixi = updateSpawningGatesPixi;
