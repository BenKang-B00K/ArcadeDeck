/* pix_core.js - Shared helpers for pixel art rendering */

/* ── Emissive layer ────────────────────────────────────
 * finishSpriteFrame() blooms glowing pixels, and left to itself it has to guess
 * which ones those are from luminance. That guess is hopeless on ally art: an
 * ivory pauldron highlight (#F0F0F8) is brighter than most of what actually
 * glows, so a luminance rule blooms the armour and washes the figure out.
 *
 * The ally art already declares its glows structurally — every emissive pass is
 * drawn under `lighter` or `screen`. Recording exactly those into a parallel
 * canvas needs no edits to the 86 draw functions and cannot drift from the art.
 * Null outside a bake, so this costs one branch in normal rendering.
 */
let _unitEmissiveCtx = null;

/** Baker calls this around a bake; pass null to detach. */
function setUnitEmissiveTarget(ctx2d) { _unitEmissiveCtx = ctx2d; }

/**
 * Pixel drawing helper for consistent unit rendering.
 */
function pUnit(ctx, cx, cy, ox, oy, color, w=1, h=1, isLeft=true, S=2.0) {
    const finalOx = isLeft ? ox : -ox - w;
    const x  = Math.round(cx + (finalOx * S));
    const y  = Math.round(cy + (oy * S * 1.13));
    const dw = Math.round(w * S);
    const dh = Math.round(h * S * 1.13);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, dw, dh);

    if (_unitEmissiveCtx) {
        const op = ctx.globalCompositeOperation;
        if (op === 'lighter' || op === 'screen') {
            _unitEmissiveCtx.globalAlpha = ctx.globalAlpha;
            _unitEmissiveCtx.fillStyle = color;
            _unitEmissiveCtx.fillRect(x, y, dw, dh);
            _unitEmissiveCtx.globalAlpha = 1;
        }
    }
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
    shrine_valor:     { glow: '#C62828', spark: '#FFCDD2' },
    shrine_tempest:   { glow: '#4DD0E1', spark: '#B2EBF2' },
    shrine_horizon:   { glow: '#FFB74D', spark: '#FFE0B2' },
    shrine_fortune:   { glow: '#66BB6A', spark: '#FFF176' },
    shrine_ruin:      { glow: '#B71C1C', spark: '#FF8A65' },
    shrine_omen:      { glow: '#5E35B1', spark: '#B39DDB' },
    shrine_tithe:     { glow: '#FFC107', spark: '#FFF8E1' },
    shrine_solace:    { glow: '#81C784', spark: '#E8F5E9' },
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

/* ── Codex thumbnails ─────────────────────────────────────────
 * The codex used to redraw art straight onto the thumbnail canvas at a scale it
 * guessed per category: enemies at S = size/80, units at size/48 or size/80
 * depending on the draw fn's arity, shrines fitted to hardcoded art extents.
 * Every one of those guesses was wrong somewhere — enemies skipped
 * finishEnemyFrame() so the codex showed flat unlit art, the boss branch keyed
 * on `type.includes('boss')` and so never fired for cerberus or lucifer, and
 * the unit scale overflowed the canvas badly enough to clip heads, feet, halos
 * and weapons off most of the roster.
 *
 * One path now serves all three: draw at the art's native S onto an oversized
 * transparent scratch, crop to measured alpha bounds, cache per type. Units and
 * shrines go through bakeUnitStill() so the codex gets literally the field
 * sprite's bake; enemies additionally run the shared finishing pass. The caller
 * only decides how to fit the result, so a 48px grid tile, a 110px tree node
 * and a 160px detail pane all share one bake.
 */
const THUMB_SCRATCH = 448;      // covers the largest baked sprite (340px) plus slack
const THUMB_PAD     = 10;       // kept in the crop so bloom / aura / halo are not cut
const THUMB_ENEMY_T = 1000000;  // frozen clock; matches PIXI_ENEMY_BAKE_BASE_T frame 0
const _thumbCache   = new Map();

/* One scratch pair reused for every bake. Allocating a fresh 448x448 canvas per
 * type cost ~64 x 2 x 800KB of churn on the codex's first open. */
let _thumbArt = null, _thumbEm = null;
function _thumbScratch() {
    if (!_thumbArt) {
        const N = THUMB_SCRATCH;
        _thumbArt = document.createElement('canvas'); _thumbArt.width = _thumbArt.height = N;
        _thumbEm  = document.createElement('canvas'); _thumbEm.width  = _thumbEm.height  = N;
        _thumbArt.getContext('2d', { willReadFrequently: true }).imageSmoothingEnabled = false;
        _thumbEm.getContext('2d',  { willReadFrequently: true }).imageSmoothingEnabled = false;
    }
    return [_thumbArt, _thumbEm];
}

/** True if any pixel in this context's w x h region carries alpha. */
function _thumbHasInk(c2d, w, h) {
    const d = c2d.getImageData(0, 0, w, h).data;
    for (let i = 3; i < d.length; i += 16) if (d[i]) return true;
    return false;
}

/**
 * Bake one codex thumbnail. Returns a cropped transparent canvas, or null when
 * the type has no draw function. Cached; `drawFn` on the returned canvas names
 * the function used, which is how the shrine sparks tell T1 from T2.
 */
function _bakeThumb(category, type) {
    const key = category + '|' + type;
    if (_thumbCache.has(key)) return _thumbCache.get(key);

    const N = THUMB_SCRATCH, o = N / 2;
    const scratch = _thumbScratch();
    const art = scratch[0], em = scratch[1];
    const ac = art.getContext('2d', { willReadFrequently: true });
    const ec = em.getContext('2d',  { willReadFrequently: true });
    ac.clearRect(0, 0, N, N);
    ec.clearRect(0, 0, N, N);

    let drawFn = null;
    try {
        if (category === 'enemy') {
            const fnName = (typeof getEnemyDrawFunction === 'function') ? getEnemyDrawFunction(type) : null;
            const fn = fnName && window[fnName];
            if (typeof fn === 'function') {
                const oldCtx = window.ctx, oldNow = Date.now;
                const canEmit = typeof setEnemyEmissiveTarget === 'function';
                window.ctx = ac;
                if (canEmit) setEnemyEmissiveTarget(ec);
                Date.now = () => THUMB_ENEMY_T;
                try { fn(o, o, { type: type }); drawFn = fnName; }
                finally {
                    Date.now = oldNow;
                    if (canEmit) setEnemyEmissiveTarget(null);
                    window.ctx = oldCtx;
                }
            }
        } else if (typeof bakeUnitStill === 'function') {
            // Units and shrines: the field sprite's own bake, verbatim.
            drawFn = bakeUnitStill(type, ac, o, o, ec);
        }
    } catch (e) {
        console.warn('Codex art failed for ' + type + ':', e);
    }

    let out = null;
    const box = (drawFn && typeof measureSpriteAlphaBounds === 'function')
              ? measureSpriteAlphaBounds([art], N) : null;
    if (box) {
        const x = Math.max(0, box.x0 - THUMB_PAD);
        const y = Math.max(0, box.y0 - THUMB_PAD);
        const w = Math.min(N, box.x1 + THUMB_PAD) - x;
        const h = Math.min(N, box.y1 + THUMB_PAD) - y;

        out = document.createElement('canvas');
        out.width = w; out.height = h;
        const oc = out.getContext('2d', { willReadFrequently: true });
        oc.imageSmoothingEnabled = false;
        oc.drawImage(art, -x, -y);

        // Every category gets the finishing pass — rim light, bloom, outline.
        // It is what makes a sprite read as lit rather than as a flat decal, and
        // the codex has to match what the field shows.
        const style = category === 'enemy'
            ? (typeof enemyVfxStyle === 'function' ? enemyVfxStyle(type) : null)
            : (typeof allyVfxStyle  === 'function' ? allyVfxStyle(category === 'shrine') : null);
        if (style && typeof finishSpriteFrame === 'function') {
            // Hand the pass the declared emissive layer when the art painted one;
            // otherwise it falls back to its luminance heuristic.
            let emCrop = document.createElement('canvas');
            emCrop.width = w; emCrop.height = h;
            const emc = emCrop.getContext('2d', { willReadFrequently: true });
            emc.imageSmoothingEnabled = false;
            emc.drawImage(em, -x, -y);
            // Enemies may fall back to the luminance heuristic; allies never do
            // (it blooms their ivory and gold plate as if it were emissive).
            if (category === 'enemy' && !_thumbHasInk(emc, w, h)) emCrop = null;
            finishSpriteFrame(out, style, 2, null, emCrop);
        }
        out.drawFn = drawFn;
    }

    _thumbCache.set(key, out);
    return out;
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

    // ── Atmospheric background per category ────────────────────────
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

    const thumb = _bakeThumb(category, type);

    // Underglow BEFORE the art so the shrine sits in front of its halo.
    if (category === 'shrine') _drawShrineCollectionUnderglow(ctx, size, type);

    if (thumb) {
        // Crop already carries THUMB_PAD of slack, so fit edge to edge.
        const fit = Math.min(size / thumb.width, size / thumb.height);
        const w = Math.max(1, Math.round(thumb.width  * fit));
        const h = Math.max(1, Math.round(thumb.height * fit));
        // Nearest keeps the pixel grid when enlarging. Below 1:1 it drops whole
        // art pixels, so let the browser filter the shrink instead.
        ctx.imageSmoothingEnabled = (fit < 1);
        ctx.drawImage(thumb, Math.round((size - w) / 2), Math.round((size - h) / 2), w, h);
        // Sparks/corona AFTER the art so they overlay the sprite.
        if (category === 'shrine')
            _drawShrineCollectionSparks(ctx, size, type, thumb.drawFn === 'drawShrinePower');
        return canvas;
    }

    // Fallback to Icon
    ctx.font = (size / 2) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', cx, cy);
    return canvas;
}

/**
 * Run of chain links from (x0,y0) to (x1,y1) in art-pixel space.
 *
 * Links alternate orientation — one across, one along — which is what makes a
 * row of blocks read as chain rather than as a dashed line. Takes the draw fn's
 * own 1px painter so it inherits that function's cx/cy/float binding, the same
 * contract pEnemyAura uses.
 *
 * @param p      the caller's p(ox, oy, col, w, h)
 * @param links  how many links to lay along the span
 * @param dark   link body
 * @param lit    upper-left highlight on each link
 */
function pChain(p, x0, y0, x1, y1, links, dark, lit) {
    for (let i = 0; i < links; i++) {
        const t  = links > 1 ? i / (links - 1) : 0;
        const lx = Math.round(x0 + (x1 - x0) * t);
        const ly = Math.round(y0 + (y1 - y0) * t);
        if (i % 2 === 0) { p(lx, ly, dark, 3, 2); p(lx, ly, lit, 2, 1); }
        else             { p(lx, ly, dark, 2, 3); p(lx, ly, lit, 1, 2); }
    }
}

/* ─── Soft aura ─────────────────────────────────────────────────────────
 * Both rosters used to paint a body "aura" as one flat translucent fillRect
 * the size of the whole sprite. At 0.10-0.65 alpha that is not atmosphere, it
 * is a visible box — drawDivineChoir's 44x60 cream rect and drawGrandWard's
 * cyan one read as a rectangle behind the character, and the rect (not the
 * art) is what set the baked texture's crop bounds.
 *
 * pAuraBand is the shared falloff: an ellipse inscribed in the w x h footprint,
 * full alpha across the inner plateau, smoothstepped to nothing at the rim,
 * then snapped to flat bands so the result stays pixel art instead of becoming
 * a smooth gradient. Returns 0 for cells that should not be painted.
 */
const AURA_BANDS   = 6;     // flat alpha steps
const AURA_PLATEAU = 0.5;   // inner fraction held at full alpha, so the glow still reads
const AURA_CUTOFF  = 0.08;

function pAuraBand(dx, dy) {
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d >= 1) return 0;
    const t = (1 - d) / (1 - AURA_PLATEAU);
    const sm = t >= 1 ? 1 : t * t * (3 - 2 * t);
    const k = Math.ceil(sm * AURA_BANDS) / AURA_BANDS;
    return k < AURA_CUTOFF ? 0 : k;
}

/**
 * Soft-aura twin of pUnit — same argument list, so a hard aura rect becomes one
 * by renaming the call. Peak alpha is whatever the caller already set on ctx.
 *
 * Rows are placed by pUnit's own geometry (oy * S * 1.13) and sized to the next
 * row's edge; stepping by a rounded per-cell height instead would leave 1px
 * gaps every few rows, since 1 * S * 1.13 rounds to 2 while the rows advance
 * by 2.26.
 */
function pUnitAura(ctx, cx, cy, ox, oy, color, w, h, isLeft = true, S = 2.0) {
    const peak = ctx.globalAlpha;
    const rx = w / 2, ry = h / 2;
    const cw = Math.round(S);
    ctx.fillStyle = color;
    for (let y = 0; y < h; y++) {
        const y0 = Math.round(cy + (oy + y) * S * 1.13);
        const y1 = Math.round(cy + (oy + y + 1) * S * 1.13);
        const dy = (y + 0.5 - ry) / ry;
        for (let x = 0; x < w; x++) {
            const k = pAuraBand((x + 0.5 - rx) / rx, dy);
            if (!k) continue;
            const fox = isLeft ? (ox + x) : (-(ox + x) - 1);
            ctx.globalAlpha = peak * k;
            ctx.fillRect(Math.round(cx + fox * S), y0, cw, y1 - y0);
        }
    }
    ctx.globalAlpha = peak;
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
window.pAuraBand          = pAuraBand;
window.pChain             = pChain;
window.setUnitEmissiveTarget = setUnitEmissiveTarget;
window.pUnitAura          = pUnitAura;
window.pDither            = pDither;
window.pRimLight          = pRimLight;
window.pAmbientOcclusion  = pAmbientOcclusion;
window.pSpecular          = pSpecular;
window.PIXEL_BAYER_4      = PIXEL_BAYER_4;
