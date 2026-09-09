/* pix_lightning.js - Lightning-path units (apprentice → lightning_mage → storm_caller/thunder_judge → thunder_lord) */
/* Old-style signature (cx, cy, tower) — uses global pUnit + ctx. Cobalt + gold palette per data lore. */

function _lightningBolt(p, ox, oy, col) {
    p(ox,     oy,     col, 2, 2);
    p(ox + 1, oy + 2, col, 2, 2);
    p(ox,     oy + 4, col, 2, 2);
    p(ox + 1, oy + 6, col, 2, 2);
}

/* ─── T2: 번개술사 (lightning_mage) — Cobalt robe + lightning bolt staff ─────── */
function drawLightningMage(cx, cy, tower) {
    const area = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now = Date.now();
    const idleY = Math.sin(now * 0.002) * 2;
    const isAtk = (now - (tower.lastShot || 0)) < 350;
    const ep = (Math.sin(now * 0.006) + 1) / 2;
    const S = 2.0;
    const p = (ox, oy, c, w = 1, h = 1) => pUnit(ctx, cx, cy, ox, oy + idleY, c, w, h, isLeft, S);

    const CO = '#000', SK = '#F0C090';
    const C0 = '#0A1A50', C1 = '#1A30A0', C2 = '#2848CC', C3 = '#4870E8';
    const G0 = '#7A5000', G1 = '#B88000', G2 = '#FFD700', G3 = '#FFF4A0';
    const Y0 = '#806010', Y1 = '#E8B020', Y2 = '#FFE060';
    const E0 = '#0080FF', E1 = '#40C0FF', E2 = '#A0E8FF', WH = '#FFFFFF';

    // ── electric aura
    ctx.save(); ctx.globalAlpha = 0.15 + ep * 0.22; ctx.globalCompositeOperation = 'lighter';
    pUnit(ctx, cx, cy, -16, idleY - 30, E0, 32, 56, isLeft, S);
    ctx.restore();

    // ── boots
    p(-10, 22, CO, 8, 6); p(-9, 23, C0, 6, 4); p(-9, 23, C1, 3, 2);
    p(  2, 22, CO, 8, 6); p( 3, 23, C0, 6, 4); p( 3, 23, C1, 3, 2);

    // ── cobalt robe lower
    p(-11, 6, CO, 22, 18); p(-10, 7, C1, 20, 16); p(-9, 7, C2, 16, 15); p(-7, 7, C3, 10, 14);
    p(-11, 22, G2, 22, 2);

    // ── gold belt + lightning insignia
    p(-10, 1, CO, 20, 5); p(-9, 2, G1, 18, 3); p(-9, 2, G2, 18, 1);
    p(-1, 0, CO, 4, 6); p(0, 1, Y2, 2, 4); p(0, 1, WH, 1, 2);

    // ── torso
    p(-10, -12, CO, 20, 18); p(-9, -11, C1, 18, 16); p(-8, -11, C2, 14, 15); p(-5, -11, C3, 8, 14);
    p(-10, -12, G2, 20, 2);

    // ── arms
    p(-12, -10, CO, 3, 14); p(-11, -9, C1, 2, 12); p(-12, 4, SK, 2, 2);
    p( 10, -10, CO, 3, 14); p( 10, -9, C1, 2, 12); p( 10, 4, SK, 2, 2);

    // ── lightning bolt staff (right hand)
    p(11, -22, CO, 2, 30); p(11, -22, G1, 1, 30); p(11, -22, G2, 1, 2);
    // bolt head
    _lightningBolt(p, 9, -28, Y1);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.35; ctx.globalCompositeOperation = 'lighter';
    _lightningBolt(p, 9, -28, Y2);
    ctx.restore();

    // ── neck + head
    p(-2, -16, CO, 4, 3); p(-1, -15, SK, 2, 2);
    p(-6, -30, CO, 12, 12); p(-5, -29, SK, 10, 10);
    p(-6, -30, C1, 12, 4); p(-6, -26, C1, 2, 3); p(4, -26, C1, 2, 3);    // hood/hair
    p(-4, -26, CO, 2, 1); p(2, -26, CO, 2, 1);                             // brows
    p(-3, -24, E1, 1, 1); p(2, -24, E1, 1, 1);                             // glowing eyes
    p(-1, -22, SK, 2, 1); p(-1, -20, CO, 2, 1);                            // nose + mouth

    // ── lightning crown (3 cobalt sparks)
    for (let i = 0; i < 3; i++) {
        const sx = -4 + i * 3;
        p(sx, -34, CO, 2, 4); p(sx, -34, E0, 1, 4); p(sx, -33, E2, 1, 2);
    }

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.75; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, 8, idleY - 30, E1, 8, 12, isLeft, S);
        pUnit(ctx, cx, cy, 10, idleY - 28, WH, 4, 8, isLeft, S);
        ctx.restore();
    }
}

/* ─── T3: 폭풍 소환사 (storm_caller) — Storm cloud crown, dual bolts ─────── */
function drawStormCaller(cx, cy, tower) {
    const area = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now = Date.now();
    const idleY = Math.sin(now * 0.002) * 2;
    const isAtk = (now - (tower.lastShot || 0)) < 400;
    const ep = (Math.sin(now * 0.007) + 1) / 2;
    const S = 2.0;
    const p = (ox, oy, c, w = 1, h = 1) => pUnit(ctx, cx, cy, ox, oy + idleY, c, w, h, isLeft, S);

    const CO = '#000', SK = '#E8C098';
    const D0 = '#101830', D1 = '#202848', D2 = '#384068', D3 = '#5060A0';
    const G1 = '#B88000', G2 = '#FFD700', G3 = '#FFF4A0';
    const E0 = '#3070FF', E1 = '#60A0FF', E2 = '#B0D8FF', WH = '#FFFFFF';

    // ── storm cloud aura
    ctx.save(); ctx.globalAlpha = 0.20 + ep * 0.25;
    pUnit(ctx, cx, cy, -20, idleY - 36, D2, 40, 18, isLeft, S);
    pUnit(ctx, cx, cy, -16, idleY - 38, D1, 32, 12, isLeft, S);
    ctx.restore();

    // ── boots
    p(-12, 23, CO, 10, 6); p(-11, 24, D0, 8, 4); p(-11, 24, D2, 4, 2);
    p(  2, 23, CO, 10, 6); p( 3, 24, D0, 8, 4); p( 3, 24, D2, 4, 2);

    // ── stormy robe
    p(-13, 6, CO, 26, 18); p(-12, 7, D1, 24, 16); p(-11, 7, D2, 20, 15); p(-9, 7, D3, 14, 14);
    p(-13, 22, G2, 26, 2);

    // ── torso + cape
    p(-12, -14, CO, 24, 20); p(-11, -13, D1, 22, 18); p(-10, -13, D2, 18, 17); p(-7, -13, D3, 10, 16);
    p(-12, -14, G2, 24, 2);
    // cape behind
    ctx.save(); ctx.globalAlpha = 0.7;
    pUnit(ctx, cx, cy, -14, idleY - 12, D0, 4, 30, isLeft, S);
    pUnit(ctx, cx, cy, 10, idleY - 12, D0, 4, 30, isLeft, S);
    ctx.restore();

    // ── belt
    p(-12, 0, CO, 24, 5); p(-11, 1, G1, 22, 3); p(-11, 1, G2, 22, 1);

    // ── arms gripping bolts
    p(-14, -12, CO, 3, 14); p(-13, -11, D2, 2, 12); p(-14, 2, SK, 2, 2);
    p( 12, -12, CO, 3, 14); p( 12, -11, D2, 2, 12); p( 12, 2, SK, 2, 2);

    // ── dual lightning bolts in hands
    for (const s of [-1, 1]) {
        const bx = s === -1 ? -16 : 14;
        _lightningBolt(p, bx, -22, G2);
        ctx.save(); ctx.globalAlpha = 0.6 + ep * 0.3; ctx.globalCompositeOperation = 'lighter';
        _lightningBolt(p, bx, -22, E2);
        ctx.restore();
    }

    // ── neck + head
    p(-2, -18, CO, 4, 3); p(-1, -17, SK, 2, 2);
    p(-6, -32, CO, 12, 14); p(-5, -31, SK, 10, 12);
    p(-6, -32, D0, 12, 4); p(-6, -28, D0, 2, 3); p(4, -28, D0, 2, 3);
    p(-4, -28, CO, 2, 1); p(2, -28, CO, 2, 1);
    p(-3, -26, E1, 1, 1); p(2, -26, E1, 1, 1);
    ctx.save(); ctx.globalAlpha = 0.7 + ep * 0.3; ctx.globalCompositeOperation = 'lighter';
    pUnit(ctx, cx, cy, -3, idleY - 26, WH, 1, 1, isLeft, S);
    pUnit(ctx, cx, cy, 2, idleY - 26, WH, 1, 1, isLeft, S);
    ctx.restore();
    p(-1, -24, SK, 2, 1); p(-1, -22, CO, 2, 1);

    // ── storm crown — jagged cloud spires
    p(-4, -38, CO, 2, 4); p(-4, -38, D2, 2, 4); p(-4, -37, D3, 1, 2);
    p( 2, -38, CO, 2, 4); p( 2, -38, D2, 2, 4); p( 2, -37, D3, 1, 2);
    p(-1, -40, CO, 2, 4); p(-1, -40, D3, 2, 4); p(-1, -39, E2, 1, 2);

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.85; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, -8, idleY - 36, WH, 16, 4, isLeft, S);
        pUnit(ctx, cx, cy, -12, idleY - 20, E1, 24, 6, isLeft, S);
        ctx.restore();
    }
}

/* ─── T3: 천둥의 심판자 (thunder_judge) — Chain-lightning judge w/ gavel ─────── */
function drawThunderJudge(cx, cy, tower) {
    const area = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now = Date.now();
    const idleY = Math.sin(now * 0.002) * 2;
    const isAtk = (now - (tower.lastShot || 0)) < 400;
    const ep = (Math.sin(now * 0.008) + 1) / 2;
    const S = 2.0;
    const p = (ox, oy, c, w = 1, h = 1) => pUnit(ctx, cx, cy, ox, oy + idleY, c, w, h, isLeft, S);

    const CO = '#000', SK = '#E8C098';
    const V0 = '#1A0848', V1 = '#2C1078', V2 = '#4820B0', V3 = '#7048E0';
    const G1 = '#B88000', G2 = '#FFD700', G3 = '#FFF4A0';
    const E0 = '#4040FF', E1 = '#80A0FF', E2 = '#D0E0FF', WH = '#FFFFFF';

    // ── thunder aura
    ctx.save(); ctx.globalAlpha = 0.18 + ep * 0.20; ctx.globalCompositeOperation = 'lighter';
    pUnit(ctx, cx, cy, -18, idleY - 32, V2, 36, 60, isLeft, S);
    ctx.restore();

    // ── boots
    p(-12, 23, CO, 10, 6); p(-11, 24, V0, 8, 4); p(-11, 24, V2, 4, 2);
    p(  2, 23, CO, 10, 6); p( 3, 24, V0, 8, 4); p( 3, 24, V2, 4, 2);

    // ── violet judge robe
    p(-13, 6, CO, 26, 18); p(-12, 7, V1, 24, 16); p(-11, 7, V2, 20, 15); p(-9, 7, V3, 14, 14);
    p(-13, 22, G2, 26, 2); p(-13, 7, G2, 1, 16); p(12, 7, G2, 1, 16);

    // ── golden chest amulet
    p(-12, -14, CO, 24, 20); p(-11, -13, V1, 22, 18); p(-10, -13, V2, 18, 17); p(-7, -13, V3, 10, 16);
    p(-12, -14, G2, 24, 2);
    p(-2, -8, CO, 6, 6); p(-1, -7, G1, 4, 4); p(-1, -7, G2, 4, 2); p(0, -6, G3, 2, 1);

    // ── belt
    p(-12, 0, CO, 24, 5); p(-11, 1, G1, 22, 3); p(-11, 1, G2, 22, 1);

    // ── arms
    p(-14, -12, CO, 3, 14); p(-13, -11, V2, 2, 12); p(-14, 2, SK, 2, 2);
    p( 12, -12, CO, 3, 14); p( 12, -11, V2, 2, 12); p( 12, 2, SK, 2, 2);

    // ── lightning gavel (right hand)
    p(13, -28, CO, 6, 8); p(14, -27, G1, 4, 6); p(14, -27, G2, 4, 3);
    p(15, -22, CO, 2, 22); p(15, -22, G2, 2, 22); p(15, -22, G3, 1, 2);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.35; ctx.globalCompositeOperation = 'lighter';
    pUnit(ctx, cx, cy, 13, idleY - 28, E2, 6, 8, isLeft, S);
    ctx.restore();

    // ── chain spark (left palm)
    _lightningBolt(p, -16, -22, E1);

    // ── neck + head
    p(-2, -18, CO, 4, 3); p(-1, -17, SK, 2, 2);
    p(-6, -32, CO, 12, 14); p(-5, -31, SK, 10, 12);
    p(-6, -32, V1, 12, 4); p(-6, -28, V1, 2, 3); p(4, -28, V1, 2, 3);
    p(-4, -28, CO, 2, 1); p(2, -28, CO, 2, 1);
    p(-3, -26, E0, 1, 1); p(2, -26, E0, 1, 1);
    p(-1, -24, SK, 2, 1); p(-1, -22, CO, 2, 1);

    // ── judge crown (3 lightning prongs in gold)
    p(-5, -38, CO, 2, 6); p(-5, -38, G2, 2, 6); p(-5, -37, G3, 1, 2);
    p(-1, -40, CO, 2, 8); p(-1, -40, G2, 2, 8); p(-1, -39, G3, 1, 2);
    p( 3, -38, CO, 2, 6); p( 3, -38, G2, 2, 6); p( 3, -37, G3, 1, 2);

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.85; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, 12, idleY - 36, WH, 8, 6, isLeft, S);
        pUnit(ctx, cx, cy, -2, idleY - 18, E2, 20, 4, isLeft, S);
        ctx.restore();
    }
}

/* ─── T4: 천둥의 군주 (thunder_lord) — Storm-cloud armor, lightning spear + wings ─── */
function drawThunderLord(cx, cy, tower) {
    const area = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now = Date.now();
    const idleY = Math.sin(now * 0.0018) * 2;
    const isAtk = (now - (tower.lastShot || 0)) < 450;
    const ep = (Math.sin(now * 0.008) + 1) / 2;
    const S = 2.0;
    const p = (ox, oy, c, w = 1, h = 1) => pUnit(ctx, cx, cy, ox, oy + idleY, c, w, h, isLeft, S);

    const CO = '#000', SK = '#F0C8A0';
    const A0 = '#08081C', A1 = '#181838', A2 = '#283060', A3 = '#506098', A4 = '#80A0D8';
    const G0 = '#7A5000', G1 = '#B88000', G2 = '#FFD700', G3 = '#FFF4A0';
    const E0 = '#2040FF', E1 = '#60A0FF', E2 = '#C0E0FF', WH = '#FFFFFF';

    // ── massive thunder cloud aura behind
    ctx.save(); ctx.globalAlpha = 0.22 + ep * 0.22;
    pUnit(ctx, cx, cy, -26, idleY - 40, A1, 52, 30, isLeft, S);
    pUnit(ctx, cx, cy, -20, idleY - 44, A0, 40, 18, isLeft, S);
    ctx.restore();

    // ── thunder wings (behind body)
    ctx.save(); ctx.globalAlpha = 0.85;
    // left wing
    pUnit(ctx, cx, cy, -22, idleY - 18, A0, 10, 4, isLeft, S);
    pUnit(ctx, cx, cy, -26, idleY - 14, A1, 12, 4, isLeft, S);
    pUnit(ctx, cx, cy, -28, idleY - 8,  A2, 12, 4, isLeft, S);
    pUnit(ctx, cx, cy, -26, idleY - 2,  A1,  8, 4, isLeft, S);
    // right wing
    pUnit(ctx, cx, cy,  12, idleY - 18, A0, 10, 4, isLeft, S);
    pUnit(ctx, cx, cy,  14, idleY - 14, A1, 12, 4, isLeft, S);
    pUnit(ctx, cx, cy,  16, idleY - 8,  A2, 12, 4, isLeft, S);
    pUnit(ctx, cx, cy,  18, idleY - 2,  A1,  8, 4, isLeft, S);
    ctx.restore();
    // wing electric tips
    ctx.save(); ctx.globalAlpha = 0.6 + ep * 0.35; ctx.globalCompositeOperation = 'lighter';
    pUnit(ctx, cx, cy, -28, idleY - 8, E1, 2, 4, isLeft, S);
    pUnit(ctx, cx, cy,  26, idleY - 8, E1, 2, 4, isLeft, S);
    ctx.restore();

    // ── boots (armored)
    p(-12, 23, CO, 10, 6); p(-11, 24, A1, 8, 4); p(-11, 24, A3, 4, 2); p(-11, 28, G2, 8, 1);
    p(  2, 23, CO, 10, 6); p( 3, 24, A1, 8, 4); p( 3, 24, A3, 4, 2); p(  3, 28, G2, 8, 1);

    // ── armored lower body
    p(-13, 6, CO, 26, 18); p(-12, 7, A1, 24, 16); p(-11, 7, A2, 20, 15); p(-9, 7, A3, 14, 14);
    p(-13, 22, G2, 26, 2); p(-13, 7, G2, 1, 16); p(12, 7, G2, 1, 16);
    // gold lightning insignia on skirt
    _lightningBolt(p, -2, 10, G3);

    // ── golden belt
    p(-12, 0, CO, 24, 6); p(-11, 1, G1, 22, 4); p(-11, 1, G2, 22, 2);
    p(-2, 0, CO, 6, 6); p(-1, 1, G2, 4, 4); p(-1, 1, G3, 4, 1);

    // ── chest plate
    p(-13, -16, CO, 26, 22); p(-12, -15, A1, 24, 20); p(-11, -15, A2, 20, 19); p(-8, -15, A3, 12, 18);
    p(-13, -16, G2, 26, 2);
    // chest lightning emblem
    p(-3, -10, CO, 6, 10); p(-2, -9, G1, 4, 8); p(-2, -9, G2, 4, 4); p(-1, -8, G3, 2, 2);
    _lightningBolt(p, -2, -10, WH);

    // ── pauldrons
    p(-16, -16, CO, 6, 8); p(-15, -15, A2, 4, 6); p(-15, -15, A4, 2, 3);
    p( 12, -16, CO, 6, 8); p( 13, -15, A2, 4, 6); p( 13, -15, A4, 2, 3);

    // ── arms (vambraces)
    p(-15, -10, CO, 3, 14); p(-14, -9, A2, 2, 12); p(-15, 4, SK, 2, 2);
    p( 13, -10, CO, 3, 14); p( 13, -9, A2, 2, 12); p( 13, 4, SK, 2, 2);

    // ── lightning spear (right side, long)
    p(15, -36, CO, 2, 50); p(15, -36, G1, 2, 50); p(15, -36, G2, 1, 50);
    // spear head
    p(13, -42, CO, 6, 8); p(14, -41, G2, 4, 6); p(15, -40, G3, 2, 3);
    _lightningBolt(p, 13, -46, WH);
    ctx.save(); ctx.globalAlpha = 0.7 + ep * 0.3; ctx.globalCompositeOperation = 'lighter';
    pUnit(ctx, cx, cy, 13, idleY - 46, E2, 6, 12, isLeft, S);
    ctx.restore();

    // ── neck + head
    p(-3, -20, CO, 6, 4); p(-2, -19, SK, 4, 3);
    p(-7, -34, CO, 14, 14); p(-6, -33, SK, 12, 12);
    p(-7, -34, A1, 14, 4); p(-7, -30, A1, 2, 4); p(5, -30, A1, 2, 4);
    p(-4, -30, CO, 2, 1); p(2, -30, CO, 2, 1);
    p(-3, -28, E0, 1, 1); p(2, -28, E0, 1, 1);
    ctx.save(); ctx.globalAlpha = 0.85 + ep * 0.15; ctx.globalCompositeOperation = 'lighter';
    pUnit(ctx, cx, cy, -3, idleY - 28, WH, 1, 1, isLeft, S);
    pUnit(ctx, cx, cy, 2, idleY - 28, WH, 1, 1, isLeft, S);
    ctx.restore();
    p(-1, -26, SK, 2, 1); p(-1, -24, CO, 2, 1);

    // ── thunder crown (5 prongs, central highest)
    p(-7, -40, CO, 2, 5); p(-7, -40, G2, 2, 5);
    p(-3, -42, CO, 2, 7); p(-3, -42, G2, 2, 7); p(-3, -41, G3, 1, 3);
    p( 1, -44, CO, 2, 9); p( 1, -44, G2, 2, 9); p( 1, -43, G3, 1, 4);
    p( 5, -42, CO, 2, 7); p( 5, -42, G2, 2, 7); p( 5, -41, G3, 1, 3);
    // crown lightning glow
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.4; ctx.globalCompositeOperation = 'lighter';
    pUnit(ctx, cx, cy, 0, idleY - 46, E1, 4, 4, isLeft, S);
    ctx.restore();

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.9; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, 12, idleY - 50, WH, 8, 8, isLeft, S);
        pUnit(ctx, cx, cy, -20, idleY - 26, E2, 40, 6, isLeft, S);
        pUnit(ctx, cx, cy, -16, idleY - 16, E1, 32, 4, isLeft, S);
        ctx.restore();
    }
}

window.drawLightningMage = drawLightningMage;
window.drawStormCaller   = drawStormCaller;
window.drawThunderJudge  = drawThunderJudge;
window.drawThunderLord   = drawThunderLord;
