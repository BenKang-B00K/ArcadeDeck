/* pix_core.js - Shared helpers for pixel art rendering */

/**
 * Pixel drawing helper for consistent unit rendering.
 */
function pUnit(ctx, cx, cy, ox, oy, color, w=1, h=1, isLeft=true, S=2.0) {
    ctx.fillStyle = color;
    const finalOx = isLeft ? ox : -ox - w;
    ctx.fillRect(
        Math.round(cx + (finalOx * S)), 
        Math.round(cy + (oy * S * 1.13)), 
        Math.round(w * S), 
        Math.round(h * S * 1.13)
    );
}

/* Shrine VFX color table (mirrors shrine_vfx_pixi.js) for collection thumbs */
const SHRINE_COLLECTION_VFX = {
    shrine_might:     { glow: '#FF2020', spark: '#FFAA00' },
    shrine_speed:     { glow: '#CFD8DC', spark: '#FFFFFF' },
    shrine_range:     { glow: '#00E5FF', spark: '#E0F7FA' },
    shrine_wisdom:    { glow: '#FFF59D', spark: '#FFD54F' },
    shrine_greed:     { glow: '#FFD700', spark: '#FFF176' },
    shrine_purity:    { glow: '#E0F7FA', spark: '#00E5FF' },
    shrine_fervor:    { glow: '#FF4400', spark: '#FFD700' },
    shrine_shadow:    { glow: '#8888FF', spark: '#AAAAFF' },
    shrine_harvest:   { glow: '#FFD700', spark: '#FFEE44' },
    shrine_endurance: { glow: '#00BFA5', spark: '#80CBC4' },
    shrine_divine:    { glow: '#FFD700', spark: '#FFF9C4' },
    shrine_eternity:  { glow: '#7B1FA2', spark: '#00B8D4' },
    shrine_miracle:   { glow: '#FFFFFF', spark: '#FF1744' },
};

function _drawShrineCollectionUnderglow(ctx, size, type) {
    const v = SHRINE_COLLECTION_VFX[type];
    if (!v) return;
    const cx = size / 2, cy = size / 2;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // Bottom underglow (ground halo)
    const gy = cy + size * 0.18;
    const g1 = ctx.createRadialGradient(cx, gy, 0, cx, gy, size * 0.42);
    g1.addColorStop(0, v.glow);
    g1.addColorStop(0.5, v.glow + '55');
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1;
    ctx.globalAlpha = 0.45;
    ctx.beginPath(); ctx.ellipse(cx, gy, size * 0.42, size * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    // Upper aura behind shrine body
    const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.38);
    g2.addColorStop(0, v.glow);
    g2.addColorStop(1, 'transparent');
    ctx.fillStyle = g2;
    ctx.globalAlpha = 0.28;
    ctx.beginPath(); ctx.arc(cx, cy, size * 0.38, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

function _drawShrineCollectionSparks(ctx, size, type, isSacred) {
    const v = SHRINE_COLLECTION_VFX[type];
    if (!v) return;
    const cx = size / 2, cy = size / 2;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // Orbiting sparks (static snapshot)
    const count = isSacred ? 6 : 4;
    for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2 + 0.4;
        const r   = size * (isSacred ? 0.42 : 0.36);
        const px  = cx + Math.cos(ang) * r;
        const py  = cy + Math.sin(ang) * r * 0.55 - size * 0.08;
        ctx.fillStyle = i % 2 ? v.glow : v.spark;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(Math.round(px), Math.round(py), 2, 2);
    }
    // Top corona ring (sacred only)
    if (isSacred) {
        ctx.strokeStyle = v.glow;
        ctx.globalAlpha = 0.6;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy - size * 0.22, size * 0.16, 0, Math.PI * 2);
        ctx.stroke();
    }
    // Tier badge underglow (gold pulse for T2)
    ctx.restore();
}

/**
 * Creates and returns a canvas element rendering the specified unit/enemy/shrine.
 * Useful for UI elements like Collections.
 */
function createPixelCanvas(type, category, size = 64) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const cx = size / 2;
    const cy = size / 2;

    // ── Atmospheric background per category ──────────────────────────────────
    // Enemies: hellish dark-purple (makes dark pixel art visible)
    // Units:   deep holy-navy
    // Shrines: warm stone dark
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
    if (category === 'enemy') {
        bg.addColorStop(0,   'rgba(70, 15, 80, 1)');
        bg.addColorStop(0.55,'rgba(28, 8, 35, 1)');
        bg.addColorStop(1,   'rgba(10, 4, 14, 1)');
    } else if (category === 'unit') {
        bg.addColorStop(0,   'rgba(15, 25, 55, 1)');
        bg.addColorStop(1,   'rgba(5, 8, 18, 1)');
    } else {
        bg.addColorStop(0,   'rgba(30, 22, 12, 1)');
        bg.addColorStop(1,   'rgba(8, 6, 3, 1)');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
    
    // Determine drawing function
    let fnName = null;
    let mockObj = { data: { type: type }, currentSlot: { area: 'left-slots' } };

    if (category === 'unit') {
        if (typeof getUnitDrawFunction === 'function') fnName = getUnitDrawFunction(type);
    } else if (category === 'enemy') {
        if (typeof getEnemyDrawFunction === 'function') fnName = getEnemyDrawFunction(type);
        mockObj = { type: type }; // Enemies expect simpler objects
    } else if (category === 'shrine') {
        const sacredType = (type.includes('shrine_divine') || type.includes('shrine_eternity') || type.includes('shrine_miracle'));
        fnName = sacredType ? 'drawShrinePower' : 'drawShrineNormal';
        // Wire tier on mock so any tier-aware draw logic matches in-game shrine
        mockObj.data.tier = sacredType ? 2 : 1;
        mockObj.isShrine = true;
        // Underglow BEFORE shrine art so sprite sits in front of halo
        _drawShrineCollectionUnderglow(ctx, size, type);
    }

    if (fnName && typeof window[fnName] === 'function') {
        const oldCtx = window.ctx;
        window.ctx = ctx; // Temporary swap for the drawing function
        // Adjust scale for small UI canvas.
        // New-style draw fns (signature ctx, tower, cx, cy, isLeft — detected by fn.length >= 4)
        // use compact ~24-design-pixel sprites vs old-style ~80-design-pixel sprites,
        // so they need a bigger S to fill the codex thumbnail at parity.
        const fnRef = window[fnName];
        const isNewStyle = (category === 'unit' && fnRef && fnRef.length >= 4);
        const S = (category === 'shrine' || type.includes('boss'))
                    ? (size / 120)
                    : (isNewStyle ? (size / 48) : (size / 80));

        // Wrap pUnit/pEnemy to use local ctx and scale
        const originalPUnit = window.pUnit;
        const originalPEnemy = window.pEnemy;

        window.pUnit = (c, x, y, ox, oy, col, w, h, isl, s) => originalPUnit(ctx, cx, cy, ox, oy, col, w, h, isl, S);
        window.pEnemy = (c, x, y, ox, oy, col, w, h, s) => {
            ctx.fillStyle = col;
            ctx.fillRect(Math.round(cx + ox * S), Math.round(cy + oy * S), Math.round(w * S), Math.round(h * S));
        };

        try {
            const fn = window[fnName];
            if (category === 'shrine') {
                // Shrine draw functions use hardcoded S=2.0 with their own local p().
                // Fit-to-canvas with proper centering for full art bounds (cross/wings/spire).
                const isSacred = fnName === 'drawShrinePower';
                // Art extents in fillRect-pixel space (oy * S=2). Generous to include bobbing/sparks.
                const artTop = isSacred ? -100 : -56;
                const artBot = isSacred ?  +60 : +40;
                const artH   = artBot - artTop;
                const margin = Math.max(2, size * 0.04);
                const sf     = (size - 2 * margin) / artH;
                // Shift cy so art top lands at margin (no clipping).
                const cyEff  = margin / sf - artTop;
                const cxEff  = (size / 2) / sf;
                ctx.save();
                ctx.scale(sf, sf);
                if (fn.length >= 4) {
                    // Old-style: fn(ctx, tower, cx, cy, isLeft)
                    fn(ctx, mockObj, cxEff, cyEff, false);
                } else {
                    fn(cxEff, cyEff, mockObj);
                }
                ctx.restore();
            } else {
                if (fn.length >= 4) {
                    // Old-style: fn(ctx, tower, cx, cy, isLeft)
                    fn(ctx, mockObj, cx, cy, false);
                } else {
                    window[fnName](cx, cy, mockObj);
                }
            }
        } catch (e) {
            console.warn(`Failed to draw pixel art for ${type}:`, e);
        }

        window.pUnit = originalPUnit;
        window.pEnemy = originalPEnemy;
        window.ctx = oldCtx;

        // Sparks/corona AFTER shrine art so they overlay the sprite
        if (category === 'shrine') {
            const isSacred = (fnName === 'drawShrinePower');
            _drawShrineCollectionSparks(ctx, size, type, isSacred);
        }
    } else {
        // Fallback to Icon
        ctx.font = `${size/2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', cx, cy);
    }

    return canvas;
}

/* ─── High-Technique Pixel Art Helpers ──────────────────────────────────
 * Use these from inside pix_*.js draw functions (after window.ctx and S
 * are in scope). All ops are nearest-neighbor compatible.
 */

// Bayer 4x4 ordered dither matrix (normalized 0..1)
const PIXEL_BAYER_4 = [
    [ 0/16,  8/16,  2/16, 10/16],
    [12/16,  4/16, 14/16,  6/16],
    [ 3/16, 11/16,  1/16,  9/16],
    [15/16,  7/16, 13/16,  5/16],
];

/**
 * Draw a dithered block — every pixel inside the rect is drawn only if
 * Bayer threshold < density. Use for soft gradients / fog / glow edges
 * without breaking pixel-art look.
 *
 * @param cx,cy  sprite center
 * @param ox,oy  art-pixel offset
 * @param w,h    art-pixel size
 * @param col    css color
 * @param dens   0..1 (0 = none, 1 = solid)
 * @param S      scale (default 2.0)
 */
function pDither(cx, cy, ox, oy, w, h, col, dens, S) {
    if (typeof S !== 'number') S = 2.0;
    const c = window.ctx;
    if (!c) return;
    c.fillStyle = col;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const t = PIXEL_BAYER_4[y & 3][x & 3];
            if (t < dens) {
                c.fillRect(
                    Math.round(cx + (ox + x) * S),
                    Math.round(cy + (oy + y) * S),
                    Math.round(S), Math.round(S)
                );
            }
        }
    }
}

/**
 * Rim light — bright pixel along the top-left edge of a rect.
 * Simulates ambient sky bounce on iso pixel art.
 */
function pRimLight(cx, cy, ox, oy, w, h, col, S) {
    if (typeof S !== 'number') S = 2.0;
    const c = window.ctx;
    if (!c) return;
    c.fillStyle = col;
    // top edge (1px tall, full width)
    c.fillRect(Math.round(cx + ox * S), Math.round(cy + oy * S), Math.round(w * S), Math.round(S));
    // left edge (1px wide, full height)
    c.fillRect(Math.round(cx + ox * S), Math.round(cy + oy * S), Math.round(S), Math.round(h * S));
}

/**
 * Ambient occlusion shadow — soft elliptical darkening under a base.
 * Multiplies darken instead of straight black, preserving ground texture.
 */
function pAmbientOcclusion(cx, cy, oy, rx, ry, S, strength) {
    if (typeof S !== 'number') S = 2.0;
    if (typeof strength !== 'number') strength = 0.35;
    const c = window.ctx;
    if (!c) return;
    c.save();
    // source-over (default) — works on transparent offscreen canvases
    const grad = c.createRadialGradient(cx, cy + oy * S, 0, cx, cy + oy * S, rx * S);
    grad.addColorStop(0,   `rgba(0,0,0,${strength})`);
    grad.addColorStop(0.5, `rgba(0,0,0,${strength * 0.55})`);
    grad.addColorStop(1,   'rgba(0,0,0,0)');
    c.fillStyle = grad;
    c.beginPath();
    c.ellipse(cx, cy + oy * S, rx * S, ry * S, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
}

/**
 * Specular highlight dot — single bright pixel with soft glow halo.
 * For gem/eye/crystal sparkle.
 */
function pSpecular(cx, cy, ox, oy, col, S) {
    if (typeof S !== 'number') S = 2.0;
    const c = window.ctx;
    if (!c) return;
    // Soft additive halo
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = 0.7;
    const grad = c.createRadialGradient(
        cx + ox * S + S / 2, cy + oy * S + S / 2, 0,
        cx + ox * S + S / 2, cy + oy * S + S / 2, 3 * S
    );
    grad.addColorStop(0, col);
    grad.addColorStop(1, 'transparent');
    c.fillStyle = grad;
    c.beginPath();
    c.arc(cx + ox * S + S / 2, cy + oy * S + S / 2, 3 * S, 0, Math.PI * 2);
    c.fill();
    c.restore();
    // Hard hot-pixel
    c.fillStyle = '#FFFFFF';
    c.fillRect(Math.round(cx + ox * S), Math.round(cy + oy * S), Math.round(S), Math.round(S));
}

window.pUnit              = pUnit;
window.createPixelCanvas  = createPixelCanvas;
window.pDither            = pDither;
window.pRimLight          = pRimLight;
window.pAmbientOcclusion  = pAmbientOcclusion;
window.pSpecular          = pSpecular;
window.PIXEL_BAYER_4      = PIXEL_BAYER_4;
