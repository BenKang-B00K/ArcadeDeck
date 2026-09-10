/* enemy_finish_pixi.js — one shared post-bake finishing pass for enemy frames.
 *
 * Runs at bake time only (64 types x 8 frames, lazy, ~512 calls total), so the
 * cost is irrelevant and the quality is not. Canvas 2D only, no new deps.
 *
 * Why this exists: enemies_pix.js draws flat axis-aligned fillRects with
 * globalAlpha and nothing else — zero 'lighter', zero gradients — while the
 * ally art uses additive blending 127 times. Rather than editing 58 draw
 * functions to catch up, every baked frame gets the missing lighting here.
 *
 * Composite order on the frame canvas:
 *     aura (furthest back) <- outline <- ART <- rim light <- bloom
 *
 * The pass samples at half resolution. That is exact, not an approximation:
 * every enemy draw fn uses S = 2.0, so one art pixel is one 2x2 device block
 * and stride 2 hits each art pixel exactly once. Working half-res also means
 * blurs get composited back with a x2 nearest upscale, which quantises the
 * falloff onto the art-pixel grid instead of turning it into gradient mush.
 */

/* Per-category intensity only. Glow COLOUR is derived from each frame's own
 * hot pixels, so it can never drift out of sync with the art. */
const ENEMY_VFX_STYLE = {
    specter:  { bloom: 0.85, bloomR: 2.2, aura: 0.20, auraR: 5, outline: 0.50, rim: '#9FE0FF', rimA: 0.36 },
    wraith:   { bloom: 0.95, bloomR: 2.5, aura: 0.26, auraR: 6, outline: 0.58, rim: '#C7A8FF', rimA: 0.38 },
    spirit:   { bloom: 0.80, bloomR: 2.2, aura: 0.20, auraR: 5, outline: 0.50, rim: '#FFE2B8', rimA: 0.36 },
    demon:    { bloom: 1.05, bloomR: 2.8, aura: 0.32, auraR: 7, outline: 0.62, rim: '#FFB894', rimA: 0.40 },
    treasure: { bloom: 1.10, bloomR: 2.5, aura: 0.28, auraR: 6, outline: 0.45, rim: '#FFF3A8', rimA: 0.38 },
    boss:     { bloom: 1.20, bloomR: 3.2, aura: 0.38, auraR: 8, outline: 0.70, rim: '#FFD2D2', rimA: 0.42 },
};

/* Ally + shrine rows. The pass was written for enemies on the theory that ally
 * art already lights itself with additive blending, but additive glow is not
 * what reads as depth — the per-mass rim light is, and the allies had none.
 * Side by side the enemies looked three-dimensional and the exorcists looked
 * like flat decals, which is what these rows fix.
 *
 * Lower aura than any enemy row: allies carry their own pUnitAura already, and
 * stacking a second silhouette halo on top just fogs the figure. Bloom is
 * gentler too, since ally palettes are pale gold and ivory to begin with. */
const ALLY_VFX_STYLE = {
    unit:   { bloom: 0.55, bloomR: 2.0, aura: 0, auraR: 5, outline: 0.44,
              rim: '#FFFFFF', rimA: 0.42, shade: '#4A3A6A', shadeA: 0.55 },
    shrine: { bloom: 0.70, bloomR: 2.4, aura: 0, auraR: 6, outline: 0.50,
              rim: '#FFF6E4', rimA: 0.44, shade: '#3E3252', shadeA: 0.58 },
};

/** Style row for a unit/shrine bake. `isShrine` picks the warmer, stronger row. */
function allyVfxStyle(isShrine) {
    return isShrine ? ALLY_VFX_STYLE.shrine : ALLY_VFX_STYLE.unit;
}

/* Alpha at or above this counts as solid body. Below it is atmosphere the draw
 * fns paint at low globalAlpha, which must not drive the silhouette. */
const SOLID_A = 110;

/** type -> mean glow colour derived from the art (0xRRGGBB). Read by renderPixiEnemy. */
const ENEMY_GLOW_TINT = {};

let _catOf = null;
function enemyVfxStyle(type) {
    if (!_catOf && window.enemyCategories) {
        _catOf = {};
        for (const c in window.enemyCategories)
            for (const e of window.enemyCategories[c]) _catOf[e.type] = c;
        for (const k in (window.bossData || {}))
            if (window.bossData[k].type) _catOf[window.bossData[k].type] = 'boss';
    }
    let c = _catOf && _catOf[type];
    if (!c && typeof type === 'string' && type.indexOf('mini_') === 0) c = 'boss';
    return ENEMY_VFX_STYLE[c] || ENEMY_VFX_STYLE.specter;
}

function _cv(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
}

/** Replace a mask's colour while keeping its alpha. */
function _tint(canvas, css, w, h) {
    const g = canvas.getContext('2d');
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = css;
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'source-over';
    return canvas;
}

/**
 * Apply the finishing pass to one baked frame, in place.
 * @param {HTMLCanvasElement} cv    baked frame, already padded by BAKE_PAD
 * @param {object} style            row from ENEMY_VFX_STYLE
 * @param {number} step             art-pixel size in device px (2 for all enemies)
 * @param {string|null} type        publishes ENEMY_GLOW_TINT; pass null for thumbnails
 * @param {HTMLCanvasElement|null} emissive  exact glow layer from pEnemyGlow;
 *        when absent the luminance/saturation heuristic below is used instead
 */
function finishEnemyFrame(cv, style, step, type, emissive) {
    step = step || 2;
    const W = cv.width, H = cv.height;
    const c = cv.getContext('2d', { willReadFrequently: true });
    const src = c.getImageData(0, 0, W, H).data;

    const w = Math.ceil(W / step), h = Math.ceil(H / step), n = w * h;
    const A = new Uint8Array(n);                       // alpha at art-pixel res
    const hot = _cv(w, h), msk = _cv(w, h), rim = _cv(w, h), shd = _cv(w, h);
    const hotD = hot.getContext('2d').createImageData(w, h);
    const mskD = msk.getContext('2d').createImageData(w, h);
    const rimD = rim.getContext('2d').createImageData(w, h);
    const shdD = shd.getContext('2d').createImageData(w, h);
    const hd = hotD.data, md = mskD.data, rd = rimD.data, sd = shdD.data;
    let gr = 0, gg = 0, gb = 0, gn = 0;

    // An exact emissive layer, when the draw fn provided one, beats guessing.
    const em = emissive
        ? emissive.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, W, H).data
        : null;

    // -- One pass: silhouette mask + emissive mask + mean glow colour --------
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = ((y * step) * W + x * step) * 4;
            const a = src[i + 3];
            const q = y * w + x;
            A[q] = a;
            if (a < 12) continue;
            // Body mask ignores the faint atmospheric rects several draw fns
            // paint behind themselves (e.g. drawShadowWisp's 28x40 aura block at
            // alpha 0.18). Including them made the aura and outline render as a
            // glowing rectangle around the sprite instead of hugging its shape.
            if (a >= SOLID_A) md[q * 4 + 3] = 255;

            const r = src[i], g = src[i + 1], b = src[i + 2];
            let k;
            if (em) {
                // Declared emissive: bloom strength is the layer's own alpha.
                const ea = em[i + 3];
                if (!ea) continue;
                k = ea / 255;
            } else {
                // Effective luminance — a rect drawn at globalAlpha 0.12 must not bloom.
                const L = (0.299 * r + 0.587 * g + 0.114 * b) * (a / 255);
                const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
                const sat = mx ? (mx - mn) / mx : 0;
                // Bright pixels bloom; saturated ones (embers, sockets) bloom lower down.
                let t = (L - 92) / 90;
                if (sat > 0.55) t = Math.max(t, (L - 48) / 110);
                if (t <= 0) continue;
                k = t > 1 ? 1 : t;
            }
            hd[q * 4] = r; hd[q * 4 + 1] = g; hd[q * 4 + 2] = b;
            hd[q * 4 + 3] = (k * 255) | 0;
            gr += r * k; gg += g * k; gb += b * k; gn += k;
        }
    }

    // -- Rim: the upper-left boundary of a MASS (light top-left, matching the
    //    ally convention in pix_tier2.js:2). The pixel must also have body to
    //    its right and below it, otherwise thin 1-2px features -- tentacles,
    //    wisp tails, chains -- are entirely edge and light up solid, reading as
    //    pale sticks rather than as dark limbs catching a highlight. -------
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const q = y * w + x;
            if (A[q] < SOLID_A) continue;
            const up = (y > 0 ? A[q - w] : 0) < SOLID_A;
            const lf = (x > 0 ? A[q - 1] : 0) < SOLID_A;
            if (!up && !lf) continue;
            const rt = (x < w - 1 ? A[q + 1] : 0) >= SOLID_A;
            const dn = (y < h - 1 ? A[q + w] : 0) >= SOLID_A;
            if (rt && dn) rd[q * 4 + 3] = 255;
        }
    }

    // -- Core shadow: the LOWER-RIGHT inner boundary of a mass, the mirror of
    //    the rim. Rim light alone sculpts the enemies because their bodies are
    //    near-black, so a pale edge reads instantly. It does nothing for the
    //    allies: a warm white rim on ivory and gold plate is invisible, and what
    //    actually gives a light-coloured object volume is its shaded side. Same
    //    thin-feature guard as the rim, so a 1px staff does not turn solid dark.
    if (style.shadeA) {
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const q = y * w + x;
                if (A[q] < SOLID_A) continue;
                const dn = (y < h - 1 ? A[q + w] : 0) < SOLID_A;
                const rt = (x < w - 1 ? A[q + 1] : 0) < SOLID_A;
                if (!dn && !rt) continue;
                const up = (y > 0 ? A[q - w] : 0) >= SOLID_A;
                const lf = (x > 0 ? A[q - 1] : 0) >= SOLID_A;
                if (up && lf) sd[q * 4 + 3] = 255;
            }
        }
    }

    hot.getContext('2d').putImageData(hotD, 0, 0);
    msk.getContext('2d').putImageData(mskD, 0, 0);
    rim.getContext('2d').putImageData(rimD, 0, 0);
    shd.getContext('2d').putImageData(shdD, 0, 0);

    const R = gn ? Math.min(255, gr / gn) : 138,
          G = gn ? Math.min(255, gg / gn) : 58,
          B = gn ? Math.min(255, gb / gn) : 200;
    const glowCss = 'rgb(' + (R | 0) + ',' + (G | 0) + ',' + (B | 0) + ')';
    if (type && ENEMY_GLOW_TINT[type] === undefined)
        ENEMY_GLOW_TINT[type] = ((R | 0) << 16) | ((G | 0) << 8) | (B | 0);

    _tint(rim, style.rim, w, h);
    if (style.shadeA) _tint(shd, style.shade || '#1A1024', w, h);

    c.save();
    c.imageSmoothingEnabled = false;   // x2 upscale stays on the art-pixel grid

    // 0. Core shadow — multiply, over the art, before the rim so a pixel that is
    //    both (a 1px-wide mass) ends up lit rather than muddied.
    if (style.shadeA) {
        c.globalCompositeOperation = 'multiply';
        c.globalAlpha = style.shadeA;
        c.drawImage(shd, 0, 0, W, H);
        c.globalCompositeOperation = 'source-over';
    }

    // 1. Rim light — additive, over the art. Does most of the readability work:
    //    enemy bodies are near-black and otherwise merge into the dark road.
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = style.rimA;
    c.drawImage(rim, 0, 0, W, H);

    // 2. Bloom — blurred halo, then the crisp hot core back on top.
    const bl = _cv(w, h), blc = bl.getContext('2d');
    blc.filter = 'blur(' + style.bloomR + 'px)';
    blc.drawImage(hot, 0, 0);
    blc.filter = 'none';
    c.globalAlpha = style.bloom;        c.drawImage(bl, 0, 0, W, H);
    c.globalAlpha = style.bloom * 0.55; c.drawImage(hot, 0, 0, W, H);

    // 3. Outline — 1 art-pixel dilation, dark, BEHIND the art. Invisible where a
    //    draw fn already outlines; fills in the ones that never did.
    const ol = _cv(w, h), olc = ol.getContext('2d');
    olc.drawImage(msk, -1, 0); olc.drawImage(msk, 1, 0);
    olc.drawImage(msk, 0, -1); olc.drawImage(msk, 0, 1);
    _tint(ol, '#05030A', w, h);
    c.globalCompositeOperation = 'destination-over';
    c.globalAlpha = style.outline;
    c.drawImage(ol, 0, 0, W, H);

    // 4. Aura — heavy blur of the silhouette in the derived glow colour, furthest back.
    const au = _cv(w, h), auc = au.getContext('2d');
    auc.filter = 'blur(' + style.auraR + 'px)';
    auc.drawImage(msk, 0, 0);
    auc.filter = 'none';
    _tint(au, glowCss, w, h);
    c.globalAlpha = style.aura;
    c.drawImage(au, 0, 0, W, H);
    c.restore();
}

window.ENEMY_VFX_STYLE  = ENEMY_VFX_STYLE;
window.ALLY_VFX_STYLE   = ALLY_VFX_STYLE;
window.allyVfxStyle     = allyVfxStyle;
window.ENEMY_GLOW_TINT  = ENEMY_GLOW_TINT;
window.enemyVfxStyle    = enemyVfxStyle;
window.finishEnemyFrame = finishEnemyFrame;
// Same pass, both rosters. The enemy-only name is kept for its call sites.
window.finishSpriteFrame = finishEnemyFrame;
