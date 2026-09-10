/* enemies_pix_core.js — shared primitives for enemy pixel art.
 *
 * ENEMY SPRITE STANDARD (mirrors the ally standard in pix_tier2.js:1-3)
 *   Canon .......... 44x48 art-pixels @ S = 2.0 for regular enemies,
 *                    ~80x100 for bosses. Deliberately not the ally 45x63:
 *                    enemies render at scale 1.0 while allies render at ~0.635,
 *                    so equal art-pixel counts would make enemies far larger.
 *   Light source ... top-left, same as allies.
 *   Ramps .......... named 5-step hue-shifted ramps per material, ally
 *                    convention (P0..P4 plate, G0..G4 gold, R0..R4 crimson).
 *   Outline ........ CO='#000' silhouette pass first, then fill inward.
 *   Top highlight .. explicit 1px highlight row on every mass, commented.
 *   Emissive ....... every glowing pixel goes through pGlow(), not p(), so the
 *                    finishing pass blooms it exactly instead of guessing.
 *   Helpers ........ pRimLight / pAmbientOcclusion / pSpecular / pDither from
 *                    pix_core.js are available and should be used.
 *   Comments ....... sectioned per body part, as drawKnight does.
 *
 * Bake canvases are auto-fitted to the art (whispering_spirit_pixi.js), so the
 * `size` column in PIXI_ENEMY_REGISTRY is advisory — art may grow without it.
 */

function pEnemy(ctx, cx, cy, ox, oy, color, w=1, h=1, S=2.0) {
    ctx.fillStyle = color;
    ctx.fillRect(
        Math.round(cx + (ox * S)), 
        Math.round(cy + (oy * S)), 
        Math.round(w * S), 
        Math.round(h * S)
    );
}

/* ── Emissive layer ────────────────────────────────────────────────────────
 * finishEnemyFrame() blooms glowing pixels. Left to itself it has to guess
 * which pixels those are from luminance and saturation, and the palettes here
 * defeat any single rule: drawWhisperingSpirit's eye highlight rgb(180,245,255)
 * is luma 0.88 / sat 0.29 while its non-emissive bone #D8C8C0 is luma 0.80.
 *
 * pGlow() removes the guessing. It paints to the frame AND to a parallel
 * emissive canvas that the baker hands to the finishing pass, so the artist
 * declares what glows. Draw fns that still use plain p() fall back to the
 * heuristic, which is why this can be adopted one batch at a time.
 */
let _emissiveCtx = null;

/** Baker calls this around a frame; pass null to detach. */
function setEnemyEmissiveTarget(ctx2d) { _emissiveCtx = ctx2d; }

/** Emissive twin of pEnemy — draws the pixel and records it as a light source. */
function pEnemyGlow(ctx, cx, cy, ox, oy, color, w, h, S) {
    if (w === undefined) w = 1;
    if (h === undefined) h = 1;
    if (S === undefined) S = 2.0;
    pEnemy(ctx, cx, cy, ox, oy, color, w, h, S);
    if (_emissiveCtx) {
        const a = ctx.globalAlpha;
        _emissiveCtx.globalAlpha = a;
        pEnemy(_emissiveCtx, cx, cy, ox, oy, color, w, h, S);
        _emissiveCtx.globalAlpha = 1;
    }
}

window.pEnemy                  = pEnemy;
window.pEnemyGlow              = pEnemyGlow;
window.setEnemyEmissiveTarget  = setEnemyEmissiveTarget;

/* ── Body aura ─────────────────────────────────────────────────────────────
 * Every draw fn used to paint its "aura" as one flat translucent fillRect the
 * size of the whole sprite. At 0.18-0.40 alpha that is not atmosphere, it is a
 * visible box: drawIronWraith's 44x64 blood rect and drawGreedyPoltergeist's
 * 32x40 gold rect both read as a rectangle around the character, and the rect
 * (not the art) is what set the baked texture's crop bounds.
 *
 * pEnemyAura paints the same footprint as an elliptical radial falloff instead,
 * via the shared pAuraBand() in pix_core.js. Peak alpha is whatever the caller
 * already set on ctx, so call sites keep their save/globalAlpha/restore wrapper
 * unchanged.
 *
 * Takes the draw fn's own 1px painter closure `p(ox, oy, col, w, h)`, so it
 * inherits that fn's cx/cy/float binding without repeating it.
 */
function pEnemyAura(ctx, p, ox, oy, color, w, h) {
    const peak = ctx.globalAlpha;
    const rx = w / 2, ry = h / 2;
    for (let y = 0; y < h; y++) {
        const dy = (y + 0.5 - ry) / ry;
        for (let x = 0; x < w; x++) {
            // Shared falloff with pUnitAura, so both rosters glow the same way.
            const k = pAuraBand((x + 0.5 - rx) / rx, dy);
            if (!k) continue;
            ctx.globalAlpha = peak * k;
            p(ox + x, oy + y, color, 1, 1);
        }
    }
    ctx.globalAlpha = peak;
}

window.pEnemyAura = pEnemyAura;
