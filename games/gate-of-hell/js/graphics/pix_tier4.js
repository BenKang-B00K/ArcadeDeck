/* pix_tier4.js - Tier 4 Exorcists (Legendary/Ultimate Units) */

// ────────────────────────────────────────────────────
// VOID TRANSMUTER — 공허의 연성사. Lead-grey blocked plate with an emerald
// reactor in the chest, two detached mechanical arms, antenna crystal.
// Lore: 납빛 LEGO 갑주에 에메랄드 반응로가 흐르고, 부유하는 기계 팔과 안테나 결정을 가진 연성사.
// ────────────────────────────────────────────────────
function drawTransmuter(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const S = 2.0;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep   = (Math.sin(now * 0.004) + 1) / 2;
    const bob  = Math.round(Math.sin(now * 0.0032) * 2);                         // floating arms
    const bob2 = Math.round(Math.sin(now * 0.0032 + 2.1) * 2);

    const CO='#000';
    const D0='#181C22', D1='#3C424C', D2='#646C7A', D3='#8E96A6', D4='#C2CAD8';  // lead plate
    const M0='#02301F', M1='#046A44', M2='#0FC47E', M3='#5DF2B4', M4='#C8FFE6';  // emerald
    const G2='#B88000', G3='#FFD700';
    const K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -20, -36 + idleY, M2, 40, 66, isLeft, S);
    ctx.restore();

    // ── BLOCK FEET
    p(-8, 20, CO, 7, 7); p(-7, 21, D1, 5, 5); p(-7, 21, D3, 5, 1);
    p( 1, 20, CO, 7, 7); p( 2, 21, D1, 5, 5); p( 2, 21, D3, 5, 1);

    // ── BLOCK LEGS (squared plates with a stud each, the "brick" read)
    p(-8,  4, CO, 7, 17); p(-7,  5, D1, 5, 15); p(-7,  5, D3, 5, 1);
    p(-6,  8, D0, 3,  1); p(-6, 13, D0, 3, 1);                                   // panel seams
    p( 1,  4, CO, 7, 17); p( 2,  5, D1, 5, 15); p( 2,  5, D3, 5, 1);
    p( 3,  8, D0, 3,  1); p( 3, 13, D0, 3, 1);
    p(-6,  6, D4, 2,  1); p( 3,  6, D4, 2, 1);                                   // stud caps

    // ── HIP BLOCK
    p(-8,  0, CO, 16, 5); p(-7,  1, D1, 14, 3); p(-7, 1, D3, 14, 1);
    p(-7,  3, D0, 14, 1);

    // ── TORSO BLOCK
    p(-8,-16, CO, 16, 17);
    p(-7,-15, D0, 14, 15); p(-6,-15, D1, 12, 14); p(-4,-14, D2, 8, 12);
    p(-7,-15, D4, 14,  1);                                                       // top highlight
    p( 5,-14, D0,  2, 12);                                                       // shaded flank
    p(-7, -9, D0, 14,  1); p(-7, -3, D0, 14, 1);                                 // plate seams

    // ── EMERALD REACTOR (housing, ring, core)
    p(-4,-12, CO, 9, 9); p(-3,-11, D2, 7, 7); p(-3,-11, D4, 7, 1);
    p(-2,-10, CO, 5, 5); p(-1, -9, M1, 3, 3); p(-1, -9, M3, 3, 1);
    p( 0, -8, M4, 1, 1);
    glow(-1, -9, M3, 3, 1, 0.55 + ep * 0.35);
    glow( 0, -8, M4, 1, 1, 0.75);
    // coolant lines running out of the housing
    p(-6,-10, M0, 2, 1); p( 5,-10, M0, 2, 1); p(-6, -5, M0, 2, 1); p( 5, -5, M0, 2, 1);
    glow(-6,-10, M2, 2, 1, 0.30 + ep * 0.24); glow( 5,-10, M2, 2, 1, 0.30 + ep * 0.24);
    glow(-6, -5, M2, 2, 1, 0.30 + ep * 0.24); glow( 5, -5, M2, 2, 1, 0.30 + ep * 0.24);

    // ── PAULDRON BLOCKS
    p(-12,-19, CO, 6, 8); p(-11,-18, D1, 4, 6); p(-11,-18, D4, 4, 1);
    p(-11,-17, D2,  4, 4);
    p(  6,-19, CO, 6, 8); p(  7,-18, D1, 4, 6); p(  7,-18, D4, 4, 1);
    p(  7,-17, D2,  4, 4);

    // ── FLOATING MECHANICAL ARMS — detached, held off the shoulders on their
    //    own bob so they read as machinery, not sleeves.
    for (let k = 0; k < 2; k++) {
        const ax = k ? 13 : -17;
        const ay = (k ? bob2 : bob) - 8;
        p(ax-1, ay,    CO, 7, 5); p(ax,   ay+1,  D2, 5, 3); p(ax, ay+1,  D4, 5, 1);
        p(ax,   ay+5,  CO, 5, 8); p(ax+1, ay+6,  D1, 3, 6); p(ax+1, ay+6, D3, 3, 1);
        p(ax-1, ay+12, CO, 7, 5); p(ax,   ay+13, D2, 5, 3); p(ax, ay+13, D4, 5, 1);
        p(ax,   ay+17, CO, 5, 7); p(ax+1, ay+18, D1, 3, 5); p(ax+1, ay+18, D3, 3, 1);
        p(ax-1, ay+23, CO, 7, 5); p(ax,   ay+24, D3, 5, 3); p(ax, ay+24, D4, 5, 1);
        p(ax-1, ay+27, CO, 3, 4); p(ax+3, ay+27, CO, 3, 4);                      // claw tips
        p(ax,   ay+28, D2, 1, 2); p(ax+4, ay+28, D2, 1, 2);
        glow(ax, ay+1,  M2, 5, 1, 0.32 + ep * 0.22);
        glow(ax, ay+13, M2, 5, 1, 0.28 + ep * 0.20);
        glow(ax, ay+24, M3, 5, 1, 0.38 + ep * 0.25);
    }

    // ── HEAD BLOCK (visor band, no face)
    p(-7,-32, CO, 14, 14);
    p(-6,-31, D0, 12, 12); p(-5,-31, D1, 10, 11); p(-4,-30, D2, 7, 9);
    p(-6,-31, D4, 12,  1);                                                       // top highlight
    p( 4,-30, D0,  2,  9);
    p(-6,-27, CO, 12,  4); p(-5,-26, M0, 10, 2);                                 // visor recess
    p(-5,-26, isAtk ? M4 : M2, 10, 1);                                           // visor light
    glow(-5,-26, M3, 10, 1, 0.55 + ep * 0.30);
    p(-7,-23, D0, 14,  1);                                                       // jaw seam

    // ── ANTENNA CRYSTAL
    p(-1,-36, CO, 3, 5); p( 0,-35, D2, 1, 4);                                    // mast
    p(-2,-42, CO, 5, 7); p(-1,-41, M1, 3, 5); p(-1,-41, M3, 3, 1);               // crystal
    p( 0,-40, M4, 1, 2);
    glow(-1,-41, M3, 3, 1, 0.50 + ep * 0.32);
    glow( 0,-40, M4, 1, 2, 0.60 + ep * 0.30);
    // signal ticks climbing the mast
    for (let i = 0; i < 3; i++) {
        const t = ((now * 0.0018) + i / 3) % 1;
        glow(0, -35 - Math.round(t * 6), M4, 1, 1, (1 - t) * 0.7);
    }

    if (isAtk) {
        glow(-1, -9, M4, 3, 3, 0.70);
        glow(-5,-26, M4, 10, 1, 0.80);
        glow(-1,-41, M4, 3, 5, 0.65);
    }
}

// ────────────────────────────────────────────────────
// ORACLE OF ETERNITY — 영원의 선지자. Star-studded indigo, the Eye of Eternity
// where a face should be, eight stars in orbit.
// Lore: 별이 박힌 인디고 로브, 영원의 눈이 얼굴을 대신하며 8개의 별이 굴도를 도는 우주적 선지자.
// ────────────────────────────────────────────────────
function drawOracle(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const S = 2.0;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    // Glows use `lighter`, which the bake records as emissive so the finishing
    // pass blooms exactly these pixels and not the pale plate around them.
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep   = (Math.sin(now * 0.003) + 1) / 2;
    const spin = now * 0.0009;

    const CO='#000';
    const I0='#060A2A', I1='#141E5E', I2='#243498', I3='#3E56D0', I4='#7C93F0';  // indigo
    const G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const W2='#CFCFDC', W3='#F2F2FA';
    const E1='#0A6E96', E2='#22B8E0', E3='#7FE8FF', E4='#DDFAFF';                // eye light

    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -22, -40 + idleY, I3, 44, 72, isLeft, S);
    ctx.restore();

    // ── EIGHT ORBITING STARS — four-point stars on a tilted ring, the ones on
    //    the far side dimmed so the orbit reads as a ring and not a halo.
    for (let i = 0; i < 8; i++) {
        const a  = spin + i * (Math.PI / 4);
        const sx = Math.round(Math.cos(a) * 19);
        const sy = Math.round(Math.sin(a) * 10) - 20;
        const front = Math.sin(a) > 0;
        const tw = (front ? 0.55 : 0.28) + ep * 0.25;
        p(sx,   sy-1, CO, 1, 3); p(sx-1, sy, CO, 3, 1);
        p(sx,   sy,   front ? W3 : W2, 1, 1);
        glow(sx,   sy-1, E4, 1, 3, tw);
        glow(sx-1, sy,   E4, 3, 1, tw);
    }

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, I1, 4, 3); p(-6, 23, I3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, I1, 4, 3); p( 2, 23, I3, 4, 1);

    // ── LOWER ROBE
    p(-9,  4, CO, 18, 19);
    p(-8,  5, I0, 16, 17); p(-7,  5, I1, 14, 16); p(-5,  6, I2, 10, 14);
    p(-8,  5, I4, 16,  1);                                                       // top highlight
    p(-3,  7, I0,  1, 12); p( 3,  7, I0,  1, 12);                                // fold shadows
    p(-9, 19, CO, 18,  3); p(-8, 20, G2, 16, 2); p(-8, 20, G3, 16, 1);

    // ── SASH
    p(-8,  1, CO, 16, 4); p(-7, 2, I2, 14, 2); p(-7, 2, I4, 14, 1);

    // ── TORSO ROBE
    p(-8,-16, CO, 16, 18);
    p(-7,-15, I0, 14, 16); p(-6,-15, I1, 12, 15); p(-4,-14, I2, 8, 13);
    p(-7,-15, I4, 14,  1);                                                       // top highlight
    p(-8,-15, G2,  1, 16); p( 7,-15, G2, 1, 16);                                 // gold placket

    // ── STAR STUDS across the robe (fixed constellation, twinkling in place)
    const stars = [[-6,-11],[-2,-6],[3,-12],[5,-2],[-7,-1],[1,2],[-5,7],[4,9],[-2,13],[6,5],[-8,10],[2,-14],[-4,17],[5,15]];
    for (let i = 0; i < stars.length; i++) {
        const tw = 0.30 + 0.45 * Math.abs(Math.sin(now * 0.0028 + i * 1.7));
        p(stars[i][0], stars[i][1], W2, 1, 1);
        glow(stars[i][0], stars[i][1], E4, 1, 1, tw);
    }

    // ── MANTLE
    p(-11,-19, CO, 22, 5); p(-10,-18, I1, 20, 3); p(-10,-18, I3, 20, 1);
    p(-11,-15, CO,  4, 8); p(-10,-14, I1, 2, 7);
    p(  8,-15, CO,  4, 8); p(  9,-14, I1, 2, 7);

    // ── SLEEVES
    p(-13,-14, CO, 6, 15); p(-12,-13, I1, 4, 13); p(-12,-13, I3, 4, 1);
    p(-13,  1, CO, 6,  5); p(-12,  2, I2, 4,  3); p(-12, 2, I4, 4, 1);
    p(  7,-14, CO, 6, 15); p(  8,-13, I1, 4, 13); p(  8,-13, I3, 4, 1);
    p(  7,  1, CO, 6,  5); p(  8,  2, I2, 4,  3); p(  8, 2, I4, 4, 1);

    // ── EYE OF ETERNITY — stands in for the head. Lids, sclera, iris ring and
    //    a pupil that is a hole through to the starfield.
    //    Built as an almond: the lids taper in courses so it reads as a lens
    //    rather than a rectangle, and the iris is wide enough to survive the
    //    44px codex tile. The first pass drew it small and it read as a badge
    //    pinned to a head instead of standing in for one.
    p(-6,-38, CO, 12, 2); p(-9,-36, CO, 18, 2);                                  // upper lid taper
    p(-11,-34, CO, 22, 12);                                                      // socket body
    p(-9,-22, CO, 18, 2); p(-6,-20, CO, 12, 2);                                  // lower lid taper
    p(-10,-33, I0, 20, 10);
    p(-8,-34, W3, 16,  2); p(-10,-32, W3, 20, 8);                                // sclera
    p(-10,-32, I1, 20,  1);                                                      // lid shadow on the white
    p(  6,-31, I1,  3,  7);                                                      // shaded corner
    p(-6,-32, CO, 12, 10); p(-5,-31, E1, 10, 8);                                 // iris
    p(-5,-31, E2, 10,  4); p(-4,-30, E3,  8, 2);                                 // iris upper facets
    for (let i = 0; i < 6; i++) p(-5 + i * 2, -25, E1, 1, 2);                    // iris striations
    p(-3,-30, CO,  6,  6); p(-2,-29, I0, 4, 4);                                  // pupil
    p(-1,-28, W3,  1,  1); p( 0,-26, W3, 1, 1);                                  // stars inside it
    glow(-5,-31, E3, 10, 2, 0.50 + ep * 0.30);
    glow(-1,-28, E4,  1, 1, 0.80);
    p(-9,-23, I2, 18,  1);                                                       // lower lid rim
    for (let i = 0; i < 5; i++) {                                                // long lashes
        const lx = -8 + i * 4, ll = (i === 2) ? 5 : 3;
        p(lx, -38 - ll, CO, 2, ll); p(lx, -38 - ll, G3, 1, ll - 1);
    }

    // ── CROWN OF STARS
    p(-8,-46, CO, 16, 4); p(-7,-45, G2, 14, 2); p(-7,-45, G4, 14, 1);
    for (let i = 0; i < 3; i++) {
        const px = -5 + i * 5, ph = (i === 1) ? 6 : 4;
        p(px, -46 - ph, CO, 3, ph); p(px + 1, -45 - ph, G3, 1, ph - 1);
        glow(px + 1, -45 - ph, E4, 1, 2, 0.45 + ep * 0.25);
    }

    if (isAtk) {
        glow(-5,-31, E4, 10, 8, 0.55);
        glow(-1,-28, E4,  1, 1, 0.95);
        for (let i = 0; i < 8; i++) {
            const a = spin + i * (Math.PI / 4);
            glow(Math.round(Math.cos(a) * 19) - 1, Math.round(Math.sin(a) * 10) - 20, E4, 3, 1, 0.65);
        }
    }
}

// ───────────────────────────────────────────────────
// ABYSS WARDEN — 심연의 간수. Black steel plate hung with violet chain, a
// black-hole core pulling inward at the chest, a golden key in hand.
// Lore: 검은 강철 갑주에 보라 사슬을 두르고, 가슴에 빨려드는 블랙홀 코어와 황금 열쇠를 든 심연의 간수.
// ───────────────────────────────────────────────────
function drawWarden(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const S = 2.0;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep   = (Math.sin(now * 0.003) + 1) / 2;
    const pull = (now % 1400) / 1400;                                            // infall cycle

    const CO='#000';
    const N0='#08080E', N1='#1A1A24', N2='#2E2E3A', N3='#4A4A5C', N4='#767690';  // black steel
    const V1='#33165E', V2='#54269A', V3='#7E4AD0', V4='#B48CF0';                // violet chain
    const G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';                // gold key
    const H0='#04000A', H1='#160828';                                            // event horizon

    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -22, -38 + idleY, V3, 44, 66, isLeft, S);
    ctx.restore();

    // ── SABATONS
    p(-9, 22, CO, 8, 5); p(-8, 23, N1, 6, 3); p(-8, 23, N3, 6, 1);
    p( 2, 22, CO, 8, 5); p( 3, 23, N1, 6, 3); p( 3, 23, N3, 6, 1);

    // ── GREAVES
    p(-9,  4, CO, 18, 19); p(-8,  5, N0, 16, 17); p(-7,  5, N1, 14, 16);
    p(-5,  6, N2, 10, 14);
    p(-8,  5, N4, 16,  1);                                                       // top highlight
    p(-1,  6, N0,  2, 13);
    p(-9, 19, CO, 18,  3); p(-8, 20, V2, 16, 2); p(-8, 20, V3, 16, 1);

    // ── BELT
    p(-8,  1, CO, 16, 4); p(-7, 2, N2, 14, 2); p(-7, 2, N4, 14, 1);

    // ── CUIRASS
    p(-8,-18, CO, 17, 20); p(-7,-17, N0, 15, 18); p(-6,-17, N1, 13, 17);
    p(-4,-16, N2,  9, 15);
    p(-7,-17, N4, 15,  1);                                                       // top highlight
    p( 6,-16, N0,  2, 16);                                                       // shaded flank
    p(-7,-10, N0, 15,  1); p(-7, -4, N0, 15, 1);                                 // plate seams

    // ── BLACK-HOLE CORE — a ring housing round a hole, with matter falling in.
    //    Drawn dark at the centre and bright only at the rim, which is what
    //    makes it read as a hole rather than as a glowing gem.
    p(-5,-13, CO, 11, 11); p(-4,-12, N3, 9, 9); p(-4,-12, N4, 9, 1);             // housing
    p(-3,-11, CO,  7,  7); p(-2,-10, H1, 5, 5); p(-1, -9, H0, 3, 3);             // horizon
    p(-2,-10, V2,  5,  1); p(-2, -6, V2, 5, 1);                                  // accretion rim
    p(-3, -9, V2,  1,  3); p( 3, -9, V2, 1, 3);
    glow(-2,-10, V4, 5, 1, 0.55 + ep * 0.30);
    glow(-3, -9, V4, 1, 3, 0.40 + ep * 0.25);
    glow( 3, -9, V4, 1, 3, 0.40 + ep * 0.25);
    // matter falling inward from four sides
    for (let i = 0; i < 4; i++) {
        const t = (pull + i / 4) % 1;
        const d = Math.round((1 - t) * 5);
        glow(i % 2 ? 0 : -1 - d + (i > 1 ? 2 + d * 2 : 0), i % 2 ? -8 - d + (i > 1 ? 2 + d * 2 : 0) : -8,
             V4, 1, 1, t * 0.8);
    }

    // ── PAULDRONS + COLLAR
    p(-14,-21, CO, 7, 9); p(-13,-20, N1, 5, 7); p(-13,-20, N4, 5, 1);
    p(-13,-21, V2,  5, 1);
    p(  7,-21, CO, 7, 9); p(  8,-20, N1, 5, 7); p(  8,-20, N4, 5, 1);
    p(  8,-21, V2,  5, 1);
    p(-6,-22, CO, 12, 3); p(-5,-21, N3, 10, 2); p(-5,-21, N4, 10, 1);

    // ── VIOLET CHAINS draped shoulder to hip, both sides
    pChain(p, -13, -18, -7,  0, 6, V1, V3);
    pChain(p,  12, -18,  6,  0, 6, V1, V3);
    pChain(p,  -8,   2,  7,  2, 7, V1, V3);                                      // waist run

    // ── ARMS
    p(-13,-15, CO, 6, 14); p(-12,-14, N1, 4, 12); p(-12,-14, N3, 4, 1);
    p(-13,  0, CO, 6,  5); p(-12,  1, N2, 4,  3); p(-12, 1, N4, 4, 1);
    p(  7,-15, CO, 6, 11); p(  8,-14, N1, 4,  9); p(  8,-14, N3, 4, 1);
    p(  7, -5, CO, 6,  5); p(  8, -4, N2, 4,  3); p(  8, -4, N4, 4, 1);

    // ── GOLDEN KEY held out
    p(11, -6, CO, 4, 18); p(12, -5, G2, 2, 16); p(12, -5, G4, 2, 1);             // shank
    p(10,-11, CO, 6,  6); p(11,-10, G1, 4, 4); p(11,-10, G3, 4, 1);              // bow
    p(12, -9, N0,  2,  2);                                                       // bow void
    p(11,  8, CO, 5,  3); p(12,  9, G3, 3, 1);                                   // ward
    p(11, 11, CO, 4,  3); p(12, 12, G3, 2, 1);
    glow(11,-10, G4, 4, 1, 0.45 + ep * 0.28);

    // ── HORNED HELM (no face, two lit slits)
    p(-7,-34, CO, 14, 14); p(-6,-33, N0, 12, 12); p(-5,-33, N1, 10, 11);
    p(-6,-33, N4, 12,  1);                                                       // top highlight
    p(-6,-28, N0, 12,  5);                                                       // face void
    p(-5,-27, CO,  4,  2); p( 2,-27, CO, 4, 2);
    p(-4,-27, V3,  2,  1); p( 3,-27, V3, 2, 1);
    glow(-4,-27, V4, 2, 1, 0.70 + ep * 0.28);
    glow( 3,-27, V4, 2, 1, 0.70 + ep * 0.28);
    p(-10,-38, CO, 4, 6); p(-9,-37, N3, 2, 4); p(-9,-38, N4, 2, 1);              // horns
    p(  7,-38, CO, 4, 6); p( 8,-37, N3, 2, 4); p( 8,-38, N4, 2, 1);
    p(-2,-38, CO,  5, 5); p(-1,-37, V2, 3, 3); p(-1,-37, V4, 3, 1);              // crest stone
    glow(-1,-37, V4, 3, 1, 0.50 + ep * 0.30);

    if (isAtk) {
        glow(-2,-10, V4, 5, 5, 0.65);
        glow(11,-10, G4, 4, 4, 0.60);
        glow(-4,-27, V4, 2, 1, 0.90); glow(3,-27, V4, 2, 1, 0.90);
    }
}

// ───────────────────────────────────────────────────
// CURSED CULT LEADER — 저주받은 교단장. Blood vestments and a deep hood, a great
// banner with an eye cut into it, curse scrolls hanging in the air.
// Lore: 핏빛 제의와 깊은 후드, 사악한 눈을 새긴 거대 깃발과 떠다니는 저주 두루마리를 거느린 교단장.
// ───────────────────────────────────────────────────
function drawCursedTalisman(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const S = 2.0;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep   = (Math.sin(now * 0.003) + 1) / 2;
    const spin = now * 0.0010;
    const fly  = Math.round(Math.sin(now * 0.0026) * 1);

    const CO='#000';
    const R0='#1E0206', R1='#4E060E', R2='#8A1018', R3='#C42028', R4='#F05A56';  // blood vestments
    const N0='#0A0408', N1='#1E1016', N2='#341C26';                              // hood shadow
    const P1='#8A7A54', P2='#C9B98E', P3='#EDE0BC';                              // scroll paper
    const V2='#6A22B4', V3='#9C4CE0', V4='#D8B0FF';                              // curse violet
    const G2='#B88000', G3='#FFD700', G4='#FFF4A0';

    ctx.save(); ctx.globalAlpha = 0.15 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -22, -40 + idleY, R3, 44, 70, isLeft, S);
    ctx.restore();

    // ── FOUR CURSE SCROLLS drifting on a ring
    for (let i = 0; i < 4; i++) {
        const a  = spin + i * (Math.PI / 2);
        const sx = Math.round(Math.cos(a) * 18);
        const sy = -12 + Math.round(Math.sin(a) * 9);
        const front = Math.sin(a) > 0;
        p(sx - 2, sy - 1, CO, 6, 3); p(sx - 1, sy, front ? P2 : P1, 4, 1);       // rolled body
        p(sx - 3, sy - 2, CO, 2, 5); p(sx + 3, sy - 2, CO, 2, 5);                // spools
        p(sx - 3, sy - 1, G2, 1, 3); p(sx + 3, sy - 1, G2, 1, 3);
        glow(sx - 1, sy, V4, 4, 1, (front ? 0.45 : 0.24) + ep * 0.22);
    }

    // ── THE BANNER — pole behind the shoulder, cloth hanging with an eye cut
    //    into it. Drawn before the body so he stands in front of it.
    p(13,-50, CO, 4, 70); p(14,-49, N1, 2, 68); p(14,-49, N2, 2, 1);             // pole
    p(12,-56, CO, 6,  7); p(13,-55, G2, 4, 5); p(13,-55, G4, 4, 1);              // finial
    p(15,-48, CO, 20, 44);
    p(16,-47, R1, 18, 42); p(17,-46, R2, 16, 40);
    p(16,-47, R4, 18,  1);                                                       // cloth top light
    p(16,-45, R0, 18,  1); p(16, -8, R0, 18, 1);                                 // borders
    // the eye
    p(19,-34, CO, 14, 14); p(20,-33, P2, 12, 12); p(20,-33, P3, 12, 1);          // sclera
    p(23,-32, CO,  7, 10); p(24,-31, V2, 5, 8); p(24,-31, V3, 5, 2);             // iris
    p(25,-29, CO,  3,  4);                                                       // pupil
    glow(24,-31, V4, 5, 2, 0.50 + ep * 0.30);
    for (let i = 0; i < 6; i++) {                                                // lashes
        p(19 + i * 2, -37, CO, 1, 3); p(19 + i * 2, -37, R0, 1, 2);
    }
    for (let i = 0; i < 6; i++) p(35, -46 + i * 7 + (i % 2 ? fly : -fly), R1, 2, 4);  // ragged fly

    // ── ROBE HEM (ragged, no feet)
    for (let i = 0; i < 11; i++) {
        const tx = -11 + i * 2, tl = 4 + ((i * 5) % 6);
        p(tx, 14, CO, 2, tl); p(tx, 14, R1, 1, tl - 1);
        if (i % 3 === 0) glow(tx, 14 + tl - 1, V3, 2, 1, 0.28 + ep * 0.20);
    }

    // ── VESTMENTS
    p(-10,-19, CO, 21, 34); p(-9,-18, R0, 19, 32); p(-8,-18, R1, 17, 31);
    p(-9,-18, R4, 19,  1);                                                       // top highlight
    p(-5,-17, R2,  9, 29);                                                       // lit inner panel
    p(-10, -2, CO, 21, 4); p(-9, -1, G2, 19, 2); p(-9, -1, G3, 19, 1);           // gold girdle
    p(-2, -3, CO,  5, 6); p(-1, -2, V2,  3, 4); p(-1, -2, V4, 3, 1);             // curse boss
    glow(-1, -2, V4, 3, 1, 0.55 + ep * 0.32);

    // ── SHOULDER MANTLE
    p(-12,-22, CO, 25, 5); p(-11,-21, R1, 23, 3); p(-11,-21, R3, 23, 1);

    // ── ARMS
    p(-14,-16, CO, 6, 14); p(-13,-15, R1, 4, 12); p(-13,-15, R3, 4, 1);
    p(-15, -3, CO, 6,  5); p(-14, -2, P2, 4,  3); p(-14, -2, P3, 4, 1);
    p(  8,-17, CO, 6, 12); p(  9,-16, R1, 4, 10); p(  9,-16, R3, 4, 1);
    p(  9, -6, CO, 6,  5); p( 10, -5, P2, 4,  3); p( 10, -5, P3, 4, 1);

    // ── DEEP HOOD with two points of curse-light
    p(-9,-40, CO, 18, 18); p(-8,-39, N0, 16, 16); p(-7,-38, R0, 14, 15);
    p(-8,-39, R2, 16,  1);                                                       // top highlight
    p(-7,-33, N0, 14,  9);                                                       // face void
    p(-4,-30, V2,  3,  2); p( 2,-30, V2, 3, 2);
    p(-3,-30, V4,  1,  1); p( 3,-30, V4, 1, 1);
    glow(-4,-30, V4, 3, 2, 0.80 + ep * 0.20);
    glow( 2,-30, V4, 3, 2, 0.80 + ep * 0.20);
    p(-10,-35, CO, 3, 10); p(-9,-34, N0, 1, 9);
    p(  9,-35, CO, 3, 10); p( 10,-34, N0, 1, 9);
    p(-3,-44, CO,  6,  5); p(-2,-43, V2, 4, 3); p(-2,-43, V4, 4, 1);             // hood crest
    glow(-2,-43, V4, 4, 1, 0.50 + ep * 0.30);
    p(-9,-33, G2, 18,  1);                                                       // gold hood rim

    if (isAtk) {
        glow(24,-31, V4, 5, 8, 0.70);
        glow(-4,-30, V4, 3, 2, 0.95); glow(2,-30, V4, 3, 2, 0.95);
        glow(-1, -2, V4, 3, 4, 0.60);
    }
}

// ───────────────────────────────────────────────────
// ASURA — 지옥을 부수는 아수라. Six arms carrying scimitars and vajras, a gold
// emblem on the chest and a ruby at the centre of the horned crown.
// Lore: 6개의 팔에 시미터와 바즈라를 든 핏빛 마왕, 가슴에 황금 문장과 황금 뿔관 중앙에 루비.
// ───────────────────────────────────────────────────
function drawAsura(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const S = 2.0;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep   = (Math.sin(now * 0.003) + 1) / 2;
    const flex = Math.round(Math.sin(now * 0.004) * 1);

    const CO='#000';
    const R0='#2A0206', R1='#6E0A14', R2='#A81824', R3='#DC3038', R4='#FF7A72';  // blood red
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8';
    const S2='#98A2B8', S3='#D2DAEA', S4='#FFFFFF';                              // blade steel
    const RUB='#C62828', RUH='#FF7A7A';
    const K0='#7A0A10';                                                          // dark skin shadow

    ctx.save(); ctx.globalAlpha = 0.15 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -24, -40 + idleY, R3, 48, 70, isLeft, S);
    ctx.restore();

    // ── SIX ARMS — three a side, each reaching further and higher, alternating
    //    scimitar and vajra. The lore's headline and the whole silhouette.
    for (let k = 0; k < 2; k++) {
        for (let i = 0; i < 3; i++) {
            const sgn   = k ? 1 : -1;
            const reach = 8 + i * 5;
            const ay    = -8 - i * 8 + (i % 2 ? flex : -flex);
            const ax    = sgn * reach;
            const px2   = k ? ax - 3 : ax - 2;
            p(px2, ay, CO, 6, 5); p(px2 + 1, ay + 1, R1, 4, 3);
            p(px2 + 1, ay + 1, R3, 4, 1);                                        // arm top light
            const hx = k ? ax + 3 : ax - 5;
            if (i % 2 === 0) {
                // scimitar: stepped curve, blocks overlapping so it stays solid
                p(hx, ay - 1, CO, 4, 4); p(hx + 1, ay, G2, 2, 2);                // grip + guard
                for (let j = 0; j < 6; j++) {
                    const off = Math.round(Math.sin(j / 5 * Math.PI) * 2);
                    const sx  = hx + sgn * (j + off);
                    const sy  = ay - 4 - j * 2;
                    p(sx - (k ? 0 : 1), sy, CO, 5, 4);
                    p(sx + (k ? 1 : 0), sy, j < 4 ? S2 : S3, 3, 3);
                    p(sx + (k ? 1 : 0), sy, S4, 3, 1);                           // edge light
                }
            } else {
                // vajra: a double-ended gold sceptre
                p(hx, ay - 6, CO, 4, 14); p(hx + 1, ay - 5, G2, 2, 12);
                p(hx + 1, ay - 5, G4, 2, 1);
                p(hx - 1, ay - 8, CO, 6, 3); p(hx, ay - 7, G3, 4, 1);            // upper prongs
                p(hx - 1, ay + 7, CO, 6, 3); p(hx, ay + 8, G3, 4, 1);            // lower prongs
                glow(hx + 1, ay - 5, G4, 2, 2, 0.40 + ep * 0.26);
            }
        }
    }

    // ── FEET
    p(-9, 22, CO, 7, 5); p(-8, 23, R1, 5, 3); p(-8, 23, R3, 5, 1);
    p( 2, 22, CO, 7, 5); p( 3, 23, R1, 5, 3); p( 3, 23, R3, 5, 1);

    // ── LOINCLOTH + GREAVES
    p(-9,  4, CO, 18, 19);
    p(-8,  5, R0, 16, 17); p(-7,  5, R1, 14, 16); p(-5,  6, R2, 10, 14);
    p(-8,  5, R4, 16,  1);                                                       // top highlight
    p(-1,  6, R0,  2, 13);
    p(-9, 19, CO, 18,  3); p(-8, 20, G2, 16, 2); p(-8, 20, G3, 16, 1);

    // ── GOLD BELT
    p(-8,  1, CO, 16, 4); p(-7, 2, G1, 14, 2); p(-7, 2, G3, 14, 1);

    // ── TORSO
    p(-8,-18, CO, 17, 20);
    p(-7,-17, R0, 15, 18); p(-6,-17, R1, 13, 17); p(-4,-16, R2, 9, 15);
    p(-7,-17, R4, 15,  1);                                                       // top highlight
    p( 5,-16, K0,  2, 16);                                                       // shaded flank
    p(-1,-16, R0,  2, 16);                                                       // sternum
    p(-6,-10, R0, 13,  1); p(-6, -5, R0, 13, 1);                                 // abdominal lines

    // ── GOLD CHEST EMBLEM
    p(-4,-14, CO, 9, 8); p(-3,-13, G1, 7, 6); p(-3,-13, G4, 7, 1);
    p(-2,-12, G2, 5, 4); p(-1,-11, G3, 3, 2);
    glow(-2,-12, G4, 5, 1, 0.50 + ep * 0.30);

    // ── NECK + HEAD (three-eyed, wrathful)
    p(-3,-24, CO, 7, 3); p(-2,-23, R1, 5, 2);
    p(-7,-37, CO, 14, 14);
    p(-6,-36, R1, 12, 12); p(-5,-36, R2, 10, 11); p(-4,-35, R3, 7, 4);
    p(-6,-36, R4, 12,  1);                                                       // top highlight
    p( 4,-35, K0,  2, 10);
    p(-6,-32, R0, 12,  2);                                                       // heavy brow
    p(-5,-30, CO,  3,  2); p( 2,-30, CO, 3, 2);
    p(-4,-30, G3,  1,  1); p( 3,-30, G3, 1, 1);
    glow(-4,-30, G4, 1, 1, 0.60 + ep * 0.30);
    glow( 3,-30, G4, 1, 1, 0.60 + ep * 0.30);
    p(-1,-34, CO,  3,  3); p( 0,-33, G3, 1, 1);                                  // third eye
    glow( 0,-33, G4, 1, 1, 0.65 + ep * 0.30);
    p(-4,-26, CO,  9,  3); p(-3,-25, S3, 7, 2);                                  // bared fangs
    for (let i = 0; i < 4; i++) p(-3 + i * 2, -26, CO, 1, 3);

    // ── GOLD HORN CROWN with the ruby at its centre
    p(-8,-41, CO, 16, 5); p(-7,-40, G1, 14, 3); p(-7,-40, G3, 14, 1);
    p(-11,-46, CO, 4, 7); p(-10,-45, G2, 2, 5); p(-10,-45, G4, 2, 2);            // left horn
    p( 8,-46, CO, 4, 7); p(  9,-45, G2, 2, 5); p(  9,-45, G4, 2, 2);             // right horn
    p(-5,-45, CO, 3, 5); p(-4,-44, G3, 1, 4);
    p( 3,-45, CO, 3, 5); p( 4,-44, G3, 1, 4);
    p(-2,-48, CO, 5, 8); p(-1,-47, G3, 3, 6); p(-1,-47, G4, 3, 2);               // centre spire
    p(-2,-44, CO, 5, 5); p(-1,-43, RUB, 3, 3); p(-1,-43, RUH, 3, 1);             // ruby
    glow(-1,-43, G4, 3, 1, 0.55 + ep * 0.30);

    if (isAtk) {
        glow(-2,-12, G4, 5, 4, 0.60);
        glow(-1,-43, G4, 3, 3, 0.70);
        glow( 0,-33, G4, 1, 1, 0.90);
    }
}

// ───────────────────────────────────────────────────
// PIERCING SHADOW — 영혼을 꿰뚫는 그림자. Violet soul plate, five shadow
// needles in orbit, two points of soul-light where a face should be.
// Lore: 보라빛 영혼 갑주에 5개의 그림자 침이 궤도를 도는, 후드 속 영혼 안광의 어둠 저격수.
// ───────────────────────────────────────────────────
function drawPiercingShadow(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const S = 2.0;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    // Glows use `lighter`; the bake records those as emissive so the finishing
    // pass blooms exactly them and leaves the plate alone.
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep   = (Math.sin(now * 0.003) + 1) / 2;
    const spin = now * 0.0013;
    const charge = (now % 1800) / 1800;

    const CO='#000';
    const V0='#150828', V1='#33165E', V2='#5A28A0', V3='#8A50D8', V4='#C0A0F0';  // soul plate
    const N0='#08080E', N1='#1A1A28', N2='#2E2E44', N3='#4A4A6A';                // shadow cloth
    const S2='#98A2B8', S3='#D2DAEA', S4='#FFFFFF';                              // gun steel
    const G2='#B88000', G3='#FFD700';

    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -22, -40 + idleY, V3, 44, 72, isLeft, S);
    ctx.restore();

    // ── FIVE SHADOW NEEDLES in orbit, points inward, far side dimmed
    for (let i = 0; i < 5; i++) {
        const a  = spin + i * (Math.PI * 2 / 5);
        const nx = Math.round(Math.cos(a) * 19);
        const ny = Math.round(Math.sin(a) * 10) - 16;
        const front = Math.sin(a) > 0;
        p(nx-1, ny-4, CO, 3, 9);
        p(nx,   ny-3, front ? V2 : V1, 1, 7);
        p(nx,   ny-3, front ? V4 : V3, 1, 2);                                    // lit point
        glow(nx, ny-3, V4, 1, 3, (front ? 0.50 : 0.26) + ep * 0.24);
    }

    // ── CLOAK
    p(-11,-18, CO, 23, 32); p(-10,-17, N0, 21, 30); p(-9,-17, N1, 19, 29);
    p(-10,-17, N3, 21,  1);                                                      // top highlight
    for (let i = 0; i < 11; i++) {
        const tx = -11 + i * 2, tl = 2 + ((i * 7) % 5);
        p(tx, 14, CO, 2, tl); p(tx, 14, N1, 1, tl - 1);
        if (i % 3 === 0) glow(tx, 14 + tl - 1, V3, 2, 1, 0.30 + ep * 0.20);
    }

    // ── BOOTS
    p(-7, 18, CO, 6, 5); p(-6, 19, V1, 4, 3); p(-6, 19, V3, 4, 1);
    p( 1, 18, CO, 6, 5); p( 2, 19, V1, 4, 3); p( 2, 19, V3, 4, 1);

    // ── GREAVES
    p(-7,  2, CO, 14, 17); p(-6,  3, V0, 12, 15); p(-5,  4, V1, 10, 13);
    p(-6,  3, V4, 12,  1);                                                       // top highlight
    p(-7,  0, CO, 14,  3); p(-6,  1, V2, 12, 2); p(-6, 1, V3, 12, 1);

    // ── SOUL CUIRASS
    p(-7,-16, CO, 14, 18); p(-6,-15, V0, 12, 16); p(-5,-15, V1, 10, 15);
    p(-6,-15, V4, 12,  1);                                                       // top highlight
    p(-3,-14, V2,  6, 13);                                                       // lit centre
    p(-2, -9, CO,  5,  6); p(-1, -8, V2, 3, 4); p(-1, -8, V4, 3, 1);             // soul core
    glow(-1, -8, V4, 3, 1, 0.55 + ep * 0.32);
    for (let r = 0; r < 3; r++) { glow(-6,-13+r*5, V4, 1, 1, 0.45); glow(5,-13+r*5, V4, 1, 1, 0.45); }

    // ── PAULDRONS
    p(-12,-19, CO, 6, 8); p(-11,-18, V1, 4, 6); p(-11,-18, V3, 4, 1);
    p(  6,-19, CO, 6, 8); p(  7,-18, V1, 4, 6); p(  7,-18, V3, 4, 1);

    // ── ARMS bracing the rifle
    p(-12,-12, CO, 6, 10); p(-11,-11, V1, 4, 8); p(-11,-11, V3, 4, 1);
    p(-13, -4, CO, 5,  5); p(-12, -3, V2, 3, 3);
    p(  6,-12, CO, 6,  9); p(  7,-11, V1, 4, 7); p(  7,-11, V3, 4, 1);
    p(  7, -5, CO, 5,  5); p(  8, -4, V2, 3, 3);

    // ── LONG SOUL RIFLE
    p(-16,-10, CO, 34, 5); p(-15, -9, S2, 32, 3); p(-15, -9, S3, 32, 1);
    p(-16,-10, V0,  6, 5); p(-15, -9, V2, 4, 2);                                 // muzzle
    p( 10,-12, CO,  8, 8); p( 11,-11, V1, 6, 6); p( 11,-11, V3, 6, 1);
    p( 12,-15, CO,  6, 4); p( 13,-14, S3, 4, 2); p( 13,-14, V3, 4, 1);           // scope
    p( 16, -5, CO,  5, 9); p( 17, -4, V1, 3, 7); p( 17, -4, V3, 3, 1);
    p(-17,-11, G2,  2, 1); p( 8,-12, G3, 2, 1);                                  // gold furniture
    for (let i = 0; i < 6; i++) {
        const t = (charge + i / 6) % 1;
        glow(10 - Math.round(t * 25), -9, V4, 3, 1, (1 - t) * 0.85);
    }

    // ── HOOD with two points of soul-light instead of a face
    p(-8,-36, CO, 16, 16); p(-7,-35, N0, 14, 14); p(-6,-34, N1, 12, 12);
    p(-7,-35, N3, 14,  1);                                                       // top highlight
    p(-6,-30, N0, 12,  8);                                                       // face void
    p(-4,-28, V2,  3,  2); p( 2,-28, V2, 3, 2);
    p(-3,-28, V4,  1,  1); p( 3,-28, V4, 1, 1);
    glow(-4,-28, V4, 3, 2, 0.75 + ep * 0.25);
    glow( 2,-28, V4, 3, 2, 0.75 + ep * 0.25);
    p(-9,-32, CO,  3, 9); p(-8,-31, N0, 1, 8);                                   // hood falls
    p( 7,-32, CO,  3, 9); p( 8,-31, N0, 1, 8);
    p(-3,-39, CO,  6, 4); p(-2,-38, V2, 4, 2); p(-2,-38, V4, 4, 1);              // hood crest
    glow(-2,-38, V4, 4, 1, 0.50 + ep * 0.30);

    if (isAtk) {
        glow(-16, -9, V4, 6, 3, 0.90);
        glow(-4,-28, V4, 3, 2, 0.95); glow(2,-28, V4, 3, 2, 0.95);
        for (let i = 0; i < 5; i++) {
            const a = spin + i * (Math.PI * 2 / 5);
            glow(Math.round(Math.cos(a) * 19), Math.round(Math.sin(a) * 10) - 19, V4, 1, 4, 0.70);
        }
    }
}

// ───────────────────────────────────────────────────
// LORD OF COCYTUS — 코키토스의 지배자. Blue vestments, a five-point crown of
// absolute zero, a great ice crystal held overhead and an ice-dragon sceptre.
// Lore: 푸른 사제복과 절대영도의 5첨 왕관, 머리 위에 떠 있는 거대 얼음 결정과 빙룡 셉터의 지배자.
// ───────────────────────────────────────────────────
function drawCocytus(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const S = 2.0;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep   = (Math.sin(now * 0.003) + 1) / 2;
    const hover = Math.round(Math.sin(now * 0.0022) * 2);
    const spin  = now * 0.0011;

    const CO='#000';
    const B0='#04122E', B1='#0A2A6E', B2='#1450B4', B3='#3C84E0', B4='#8CC0F8';  // vestment blue
    const C0='#063A52', C1='#0A6E96', C2='#22B8E0', C3='#7FE8FF', C4='#DDFAFF';  // ice
    const W2='#C8DCE8', W3='#EAF6FF', W4='#FFFFFF';
    const G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.15 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -22, -44 + idleY, C2, 44, 76, isLeft, S);
    ctx.restore();

    // ── GREAT ICE CRYSTAL held overhead — three facet courses with a lit
    //    upper-left face, plus four shards orbiting it.
    const cyy = -54 + hover;
    p(-6, cyy,      CO, 13,  8); p(-5, cyy + 1, C0, 11, 6); p(-5, cyy + 1, C3, 11, 1);
    p(-5, cyy + 7,  CO, 11,  7); p(-4, cyy + 8, C1,  9, 5); p(-4, cyy + 8, C2, 9, 1);
    p(-3, cyy + 13, CO,  7,  6); p(-2, cyy + 14, C1, 5, 4);
    p(-1, cyy + 18, CO,  3,  4); p( 0, cyy + 19, C2, 1, 2);                      // bottom point
    p(-3, cyy + 2,  C2,  5,  4); p(-2, cyy + 3, C4, 3, 2);                       // inner light
    glow(-5, cyy + 1, C4, 11, 1, 0.50 + ep * 0.30);
    glow(-2, cyy + 3, C4,  3, 2, 0.55 + ep * 0.30);
    for (let i = 0; i < 4; i++) {
        const a  = spin + i * (Math.PI / 2);
        const sx = Math.round(Math.cos(a) * 12);
        const sy = cyy + 8 + Math.round(Math.sin(a) * 5);
        p(sx-1, sy-2, CO, 3, 5); p(sx, sy-1, C2, 1, 3);
        glow(sx, sy-1, C4, 1, 3, (Math.sin(a) > 0 ? 0.55 : 0.28) + ep * 0.22);
    }

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, B1, 4, 3); p(-6, 23, B3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, B1, 4, 3); p( 2, 23, B3, 4, 1);

    // ── VESTMENT SKIRT
    p(-9,  4, CO, 18, 19);
    p(-8,  5, B0, 16, 17); p(-7,  5, B1, 14, 16); p(-5,  6, B2, 10, 14);
    p(-8,  5, B4, 16,  1);                                                       // top highlight
    p(-3,  7, B0,  1, 12); p( 3,  7, B0,  1, 12);
    p(-9, 19, CO, 18,  3); p(-8, 20, W2, 16, 2); p(-8, 20, W4, 16, 1);           // rimed hem

    // ── CINCTURE
    p(-8,  1, CO, 16, 4); p(-7, 2, G2, 14, 2); p(-7, 2, G3, 14, 1);
    p(-2,  0, CO,  5, 5); p(-1, 1, C1,  3, 3); p(-1, 1, C3, 3, 1);
    glow(-1, 1, C4, 3, 1, 0.55 + ep * 0.32);

    // ── VESTMENT TORSO + STOLE
    p(-7,-17, CO, 14, 19); p(-6,-16, B0, 12, 17); p(-5,-16, B1, 10, 16);
    p(-6,-16, B4, 12,  1);                                                       // top highlight
    p(-3,-15, B2,  6, 14);
    p(-5,-16, C1,  2, 17); p( 3,-16, C1, 2, 17);                                 // ice stole
    p(-5,-16, C3,  2,  1); p( 3,-16, C3, 2, 1);
    p(-2, -9, CO,  5,  6); p(-1, -8, C1, 3, 4); p(-1, -8, C3, 3, 1);
    glow(-1, -8, C4, 3, 1, 0.55 + ep * 0.32);

    // ── COLLAR
    p(-8,-21, CO, 16, 5); p(-7,-20, W2, 14, 3); p(-7,-20, W4, 14, 1);
    p(-7,-18, G2, 14, 1);

    // ── ARMS
    p(-13,-16, CO, 7, 16); p(-12,-15, B1, 5, 14); p(-12,-15, B3, 4, 13);
    p(-12,-15, B4,  5, 1);
    p(-12,  1, CO, 6,  5); p(-11,  2, K1, 4,  3); p(-11, 2, K2, 4, 1);
    p(  6,-16, CO, 7, 12); p(  7,-15, B1, 5, 10); p(  7,-15, B3, 4, 9);
    p(  7,-15, B4,  5, 1);
    p(  7, -5, CO, 6,  5); p(  8, -4, K1, 4,  3); p(  8, -4, K2, 4, 1);

    // ── ICE-DRAGON SCEPTRE — a serpentine neck cresting into a horned head
    p(11,-26, CO, 4, 50); p(12,-25, C0, 2, 48); p(12,-25, C2, 2, 1);             // shaft
    p(11,-12, G2, 4, 1); p(11,  6, G2, 4, 1);                                    // gold collars
    for (let i = 0; i < 4; i++) {                                                // arching neck
        const nx = 11 + Math.round(Math.sin(i / 3 * 1.2) * 3);
        p(nx, -34 - i * 3, CO, 4, 4); p(nx + 1, -33 - i * 3, C1, 2, 2);
        p(nx + 1, -33 - i * 3, C3, 2, 1);
    }
    p(12,-50, CO, 8,  6); p(13,-49, C1, 6, 4); p(13,-49, C3, 6, 1);              // head
    p(18,-48, CO, 3,  3); p(18,-48, C2, 2, 2);                                   // snout
    p(13,-54, CO, 2,  5); p(13,-53, W3, 1, 4);                                   // horn
    p(16,-54, CO, 2,  5); p(16,-53, W3, 1, 4);
    p(15,-48, CO, 1,  1);                                                        // eye
    glow(13,-49, C4, 6, 1, 0.50 + ep * 0.30);
    glow(13,-53, C4, 1, 2, 0.45 + ep * 0.25);

    // ── NECK + HEAD
    p(-2,-23, CO, 4, 3); p(-1,-22, K0, 2, 2);
    p(-6,-35, CO, 12, 13);
    p(-5,-34, K1, 10, 11); p(-5,-34, K2, 10, 1);
    p( 3,-33, K0,  2,  9);
    p(-4,-30, CO, 3, 2); p( 1,-30, CO, 3, 2);
    p(-3,-30, isAtk ? C4 : C3, 1, 1); p( 2,-30, isAtk ? C4 : C3, 1, 1);
    p(-1,-26, K0, 2, 1);
    p(-5,-32, W2, 10, 1);                                                        // rime brow

    // ── FIVE-POINT CROWN OF ABSOLUTE ZERO
    p(-8,-38, CO, 16, 4); p(-7,-37, C1, 14, 2); p(-7,-37, C3, 14, 1);
    for (let i = 0; i < 5; i++) {
        const sx = -7 + i * 3;
        const sh = (i === 2) ? 10 : (i % 2 ? 5 : 7);
        p(sx, -38 - sh, CO, 3, sh + 1);
        p(sx + 1, -37 - sh, C2, 1, sh);
        p(sx + 1, -37 - sh, C4, 1, 2);
        glow(sx + 1, -37 - sh, C4, 1, 2, 0.48 + ep * 0.28);
    }

    if (isAtk) {
        glow(-6, cyy, C4, 13, 20, 0.55);
        for (let i = 0; i < 5; i++) glow(-6 + i * 3, -47, C4, 1, 4, 0.65);
        glow(-1, -8, C4, 3, 4, 0.60);
    }
}

// ────────────────────────────────────────────────────
// EVERLASTING PURGATORY — 영원한 연옥의 불길. Ivory plate, wings of holy fire,
// a torch sceptre in each hand, five flames standing off the crown.
// Lore: 백상아 갑주에 신성 화염의 날개와 두 자루 횃불 셉터, 정수리에서 솟는 5개의 불꽃 왕관.
// ────────────────────────────────────────────────────
function drawPurgatory(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const S = 2.0;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep   = (Math.sin(now * 0.003) + 1) / 2;
    const lick = (k) => Math.round(Math.sin(now * 0.009 + k * 1.3) * 1);

    const CO='#000';
    const I0='#4A4438', I1='#8C8474', I2='#C9C1AC', I3='#EDE7D6', I4='#FFFCF2';  // ivory plate
    const G0='#4A3000', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8';
    const F0='#7A1800', F1='#C43800', F2='#FF6A00', F3='#FFB020', F4='#FFE890';  // holy fire
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.15 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -24, -42 + idleY, F3, 48, 74, isLeft, S);
    ctx.restore();

    // ── WINGS OF HOLY FIRE — four tongues a side, tapering, each licking on
    //    its own phase so the wing never repeats itself.
    for (let k = 0; k < 2; k++) {
        const bx = k ? 8 : -20;
        for (let c = 0; c < 4; c++) {
            const wx = bx + (k ? c * 3 : (3 - c) * 3);
            const lk = lick(c + k * 4);
            const top = -30 + c * 4 + lk;
            const len = 24 - c * 4;
            p(wx, top, CO, 4, len);
            p(wx + (k ? 1 : 0), top + 1, F0, 3, len - 2);
            p(wx + (k ? 1 : 0), top + 1, F1, 3, Math.max(1, len - 8));
            p(wx + (k ? 1 : 0), top + 1, F3, 3, 1);                              // flame tip light
            glow(wx + (k ? 1 : 0), top + 1, F4, 3, 2, 0.32 + ep * 0.24);
        }
    }

    // ── SABATONS
    p(-8, 22, CO, 7, 5); p(-7, 23, I1, 5, 3); p(-7, 23, I3, 5, 1);
    p( 1, 22, CO, 7, 5); p( 2, 23, I1, 5, 3); p( 2, 23, I3, 5, 1);

    // ── GREAVES
    p(-8,  4, CO, 16, 19);
    p(-7,  5, I0, 14, 17); p(-6,  5, I1, 12, 16); p(-4,  6, I2, 8, 14);
    p(-7,  5, I4, 14,  1);                                                       // top highlight
    p(-1,  6, I0,  2, 13);                                                       // leg split
    p(-8, 19, CO, 16,  3); p(-7, 20, G2, 14, 2); p(-7, 20, G3, 14, 1);

    // ── BELT
    p(-7,  1, CO, 14, 4); p(-6, 2, G1, 12, 2); p(-6, 2, G3, 12, 1);
    p(-2,  0, CO,  5, 5); p(-1, 1, F1,  3, 3); p(-1, 1, F3, 3, 1);
    glow(-1, 1, F4, 3, 1, 0.50 + ep * 0.30);

    // ── CUIRASS
    p(-7,-17, CO, 14, 19);
    p(-6,-16, I0, 12, 17); p(-5,-16, I1, 10, 16); p(-3,-15, I2, 6, 14);
    p(-6,-16, I4, 12,  1);                                                       // top highlight
    p( 4,-15, I0,  2, 14);                                                       // shaded flank
    p(-6,-10, G2, 12,  3); p(-5, -9, G4, 10, 1);                                 // gold band
    // brazier emblem
    p(-2, -5, CO, 5, 5); p(-1, -4, F1, 3, 3); p(-1, -4, F3, 3, 1);
    glow(-1, -4, F4, 3, 1, 0.55 + ep * 0.32);

    // ── PAULDRONS
    p(-12,-20, CO, 6, 8); p(-11,-19, I1, 4, 6); p(-11,-19, I4, 4, 1);
    p(-11,-19, G2,  4, 1);
    p(  6,-20, CO, 6, 8); p(  7,-19, I1, 4, 6); p(  7,-19, I4, 4, 1);
    p(  7,-19, G2,  4, 1);

    // ── COLLAR
    p(-6,-21, CO, 12, 3); p(-5,-20, I3, 10, 2); p(-5,-20, I4, 10, 1);

    // ── ARMS, one sceptre each
    p(-12,-14, CO, 6, 14); p(-11,-13, I1, 4, 12); p(-11,-13, I3, 4, 1);
    p(-12,  1, CO, 6,  5); p(-11,  2, K1, 4,  3); p(-11, 2, K2, 4, 1);
    p(  6,-14, CO, 6, 14); p(  7,-13, I1, 4, 12); p(  7,-13, I3, 4, 1);
    p(  6,  1, CO, 6,  5); p(  7,  2, K1, 4,  3); p(  7, 2, K2, 4, 1);

    // ── TWIN TORCH SCEPTRES
    const torch = (tx, k) => {
        p(tx,   -18, CO, 4, 26); p(tx+1, -17, G1, 2, 24); p(tx+1, -17, G3, 2, 1);
        p(tx,   -6,  G3,  4, 1); p(tx,    4,  G3, 4, 1);                         // collars
        p(tx-1, -24, CO, 6,  7); p(tx,   -23, G2, 4, 5); p(tx, -23, G4, 4, 1);   // bowl
        // flame in the bowl
        const l0 = lick(k), l1 = lick(k + 2);
        p(tx,   -29 + l0, CO, 4, 6); p(tx+1, -28 + l0, F1, 2, 5);
        p(tx+1, -28 + l0, F3, 2, 2);
        p(tx+1, -32 + l1, CO, 2, 4); p(tx+1, -31 + l1, F2, 1, 3);
        p(tx+1, -34 + l1, F4, 1, 1);
        glow(tx+1, -28 + l0, F3, 2, 3, 0.50 + ep * 0.30);
        glow(tx+1, -34 + l1, F4, 1, 2, 0.65);
    };
    torch(-16, 0);
    torch( 12, 1);

    // ── NECK
    p(-2,-23, CO, 4, 3); p(-1,-22, K0, 2, 2);

    // ── HEAD
    p(-6,-35, CO, 12, 13);
    p(-5,-34, K1, 10, 11); p(-5,-34, K2, 10, 1);
    p( 3,-33, K0,  2,  9);
    p(-4,-30, CO, 3, 2); p( 1,-30, CO, 3, 2);
    p(-3,-30, isAtk ? F4 : F3, 1, 1); p( 2,-30, isAtk ? F4 : F3, 1, 1);
    p(-1,-26, K0, 2, 1);

    // ── CROWN OF FIVE FLAMES rising off the crown of the head
    p(-7,-38, CO, 14, 4); p(-6,-37, G2, 12, 2); p(-6,-37, G4, 12, 1);
    for (let i = 0; i < 5; i++) {
        const fx = -6 + i * 3;
        const fh = (i === 2) ? 9 : (i % 2 ? 5 : 7);
        const lk = lick(i);
        p(fx, -38 - fh + lk, CO, 3, fh);
        p(fx + 1, -37 - fh + lk, F1, 1, fh - 1);
        p(fx + 1, -37 - fh + lk, F3, 1, 2);
        glow(fx + 1, -37 - fh + lk, F4, 1, 2, 0.50 + ep * 0.28);
    }

    if (isAtk) {
        for (let i = 0; i < 5; i++) glow(-5 + i * 3, -46, F4, 1, 4, 0.65);
        glow(-1, -4, F4, 3, 3, 0.60);
        glow(-16,-29, F4, 4, 6, 0.55); glow(12,-29, F4, 4, 6, 0.55);
    }
}

// ───────────────────────────────────────────────────
// NIGHTMARE REAPER — 나이트메어 리퍼. Jet cloak, violet scythe, a skull in the
// hood and five souls it has not finished with.
// Lore: 칠흑 망토에 보라 사신낫을 든 두건 속 해골, 5개의 영혼이 주위를 떠도는 죽음의 화신.
// ───────────────────────────────────────────────────
function drawReaper(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const S = 2.0;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    // Glows use `lighter`; the bake records those as emissive so the finishing
    // pass blooms exactly them and leaves the plate alone.
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep   = (Math.sin(now * 0.003) + 1) / 2;
    const spin = now * 0.0012;
    const rag  = now * 0.004;

    const CO='#000';
    const K0='#050508', K1='#131320', K2='#242438', K3='#3C3C58', K4='#63638A';  // jet cloth
    const V0='#1A0038', V1='#3E0F72', V2='#6A22B4', V3='#9C4CE0', V4='#D8B0FF';  // soul violet
    const B1='#8A8478', B2='#C6C0B2', B3='#EDE8DC', B4='#FFFFFF';                // bone
    const S2='#98A2B8', S3='#D2DAEA', S4='#FFFFFF';

    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -22, -40 + idleY, V2, 44, 70, isLeft, S);
    ctx.restore();

    // ── FIVE SOULS still circling him
    for (let i = 0; i < 5; i++) {
        const a  = spin + i * (Math.PI * 2 / 5);
        const sx = Math.round(Math.cos(a) * 18);
        const sy = Math.round(Math.sin(a) * 9) - 10;
        const front = Math.sin(a) > 0;
        const al = (front ? 0.55 : 0.28) + ep * 0.22;
        p(sx-1, sy-2, CO, 4, 4); p(sx, sy-1, V1, 2, 2);                          // little skull
        p(sx,   sy+2, V0, 2, 2); p(sx, sy+4, V0, 1, 2);                          // wisp tail
        glow(sx, sy-1, V4, 2, 2, al);
        glow(sx, sy+2, V3, 2, 2, al * 0.6);
    }

    // ── JET CLOAK, ragged
    p(-12,-20, CO, 25, 36); p(-11,-19, K0, 23, 34); p(-10,-19, K1, 21, 33);
    p(-11,-19, K3, 23,  1);                                                      // top highlight
    p(-6,-18, K2, 11, 31);                                                       // lit inner panel
    for (let i = 0; i < 12; i++) {
        const tx = -12 + i * 2;
        const tl = 3 + ((i * 5) % 7) + Math.round(Math.sin(rag + i) * 1.5);
        p(tx, 16, CO, 2, tl); p(tx, 16, K1, 1, tl - 1);
        if (i % 3 === 0) glow(tx, 16 + tl - 1, V3, 2, 1, 0.28 + ep * 0.20);
    }

    // ── ROBE UNDER THE CLOAK
    p(-7,  2, CO, 14, 15); p(-6,  3, K0, 12, 13); p(-5,  4, K1, 10, 11);
    p(-6,  3, K4, 12,  1);                                                       // top highlight
    p(-7,  0, CO, 14,  3); p(-6,  1, V1, 12, 2); p(-6, 1, V2, 12, 1);

    // ── TORSO
    p(-7,-16, CO, 14, 18); p(-6,-15, K0, 12, 16); p(-5,-15, K1, 10, 15);
    p(-6,-15, K4, 12,  1);                                                       // top highlight
    p(-3,-14, K2,  6, 13);
    p(-2, -9, CO,  5,  6); p(-1, -8, V1, 3, 4); p(-1, -8, V3, 3, 1);             // soul lantern
    glow(-1, -8, V4, 3, 1, 0.60 + ep * 0.32);

    // ── SKELETAL ARMS
    p(-12,-13, CO, 6, 12); p(-11,-12, K1, 4, 10); p(-11,-12, K3, 4, 1);
    p(-12, -2, CO, 6,  5); p(-11, -1, B2, 4,  3); p(-11, -1, B3, 4, 1);
    p(  6,-13, CO, 6, 12); p(  7,-12, K1, 4, 10); p(  7,-12, K3, 4, 1);
    p(  6, -2, CO, 6,  5); p(  7, -1, B2, 4,  3); p(  7, -1, B3, 4, 1);

    // ── VIOLET SCYTHE
    p(11,-32, CO, 4, 54); p(12,-31, K1, 2, 52); p(12,-31, K3, 2, 1);             // haft
    p(11,-16, V1, 4, 1); p(11, 2, V1, 4, 1);
    p( 9,-36, CO, 8,  6); p(10,-35, K2, 6, 4); p(10,-35, K4, 6, 1);              // collar
    for (let i = 0; i < 9; i++) {
        const bx = 9 - i * 2 - Math.round(Math.sin(i / 8 * Math.PI) * 3);
        const by = -40 - Math.round(i * 0.8);
        p(bx, by, CO, 4, 4);
        p(bx, by, i < 7 ? V2 : V3, 3, 2);
        p(bx, by, V4, 3, 1);                                                     // edge light
        glow(bx, by, V4, 3, 1, 0.34 + ep * 0.24);
    }

    // ── SKULL IN THE HOOD
    p(-6,-32, CO, 12, 13); p(-5,-31, B1, 10, 11); p(-4,-31, B2, 8, 10);
    p(-5,-31, B4, 10,  1);                                                       // top highlight
    p( 3,-30, B1,  2,  9);
    p(-4,-27, CO,  4,  4); p( 1,-27, CO, 4, 4);                                  // sockets
    p(-3,-26, V2,  2,  2); p( 2,-26, V2, 2, 2);
    glow(-3,-26, V4, 2, 2, 0.80 + ep * 0.20);
    glow( 2,-26, V4, 2, 2, 0.80 + ep * 0.20);
    p(-1,-22, CO,  2,  2);                                                       // nasal cavity
    p(-4,-20, CO,  9,  3); p(-3,-19, B3, 7, 2);                                  // jaw
    for (let i = 0; i < 4; i++) p(-3 + i * 2, -20, CO, 1, 3);

    // ── HOOD over the skull
    p(-9,-38, CO, 18, 8); p(-8,-37, K0, 16, 6); p(-8,-37, K3, 16, 1);
    p(-10,-33, CO, 3, 9); p(-9,-32, K0, 1, 8);
    p(  8,-33, CO, 3, 9); p( 9,-32, K0, 1, 8);
    p(-3,-42, CO,  6, 5); p(-2,-41, K1, 4, 4);                                   // peak
    p(-1,-44, CO,  3, 3); p( 0,-43, V2, 1, 1);                                   // peak stone
    glow( 0,-43, V4, 1, 1, 0.55 + ep * 0.30);

    if (isAtk) {
        glow(-3,-26, V4, 2, 2, 0.95); glow(2,-26, V4, 2, 2, 0.95);
        glow(-8,-44, V4, 20, 8, 0.50);                                           // scythe sweep
        glow(-1, -8, V4,  3, 4, 0.65);
    }
}

// ───────────────────────────────────────────────────
// DOOM GUIDE — 파멸의 인도자. Wraith robe with a ghost ship standing in the
// dark behind him, gold lantern in one hand, violet cleansing rod in the other.
// Lore: 어두운 망령 로브와 유령선의 그림자를 등진 채, 황금 등불과 보라 정화봉을 든 인도자.
// ───────────────────────────────────────────────────
function drawDoomGuide(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const S = 2.0;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep    = (Math.sin(now * 0.003) + 1) / 2;
    const swell = Math.round(Math.sin(now * 0.0018) * 2);                        // ship rides the swell
    const rag   = now * 0.004;

    const CO='#000';
    const N0='#080A12', N1='#171B28', N2='#28303F', N3='#404A5E', N4='#68748C';  // wraith cloth
    const V1='#3A0F6E', V2='#6A22B4', V3='#9C4CE0', V4='#D8B0FF';                // cleansing violet
    const G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const E2='#22A8E0', E3='#7FDCFF', E4='#DDF4FF';

    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -24, -40 + idleY, V3, 48, 70, isLeft, S);
    ctx.restore();

    // ── THE GHOST SHIP behind him — hull, mast and a torn sail, kept faint so
    //    it reads as a shape in the dark rather than as a second sprite.
    //    Alpha and tone both raised from the first pass: at 0.22 in a mid-slate
    //    the hull disappeared into the dark ground and the ship read as nothing.
    //    Outlined and given an edge light, it now sits behind him as a shape.
    ctx.save(); ctx.globalAlpha = 0.42 + ep * 0.12;
    pUnit(ctx, cx, cy, -14,-38 + swell + idleY, N2, 26, 22, isLeft, S);          // sail
    pUnit(ctx, cx, cy, -14,-38 + swell + idleY, N4, 26,  1, isLeft, S);          // sail top light
    pUnit(ctx, cx, cy, -16,-40 + swell + idleY, N3, 30,  2, isLeft, S);          // yard
    pUnit(ctx, cx, cy,  -2,-42 + swell + idleY, N3,  3, 38, isLeft, S);          // mast
    pUnit(ctx, cx, cy, -22, -4 + swell + idleY, N2, 44, 10, isLeft, S);          // hull
    pUnit(ctx, cx, cy, -22, -4 + swell + idleY, N4, 44,  1, isLeft, S);          // gunwale light
    pUnit(ctx, cx, cy, -19,  6 + swell + idleY, N2, 38,  4, isLeft, S);          // keel taper
    pUnit(ctx, cx, cy, -25, -8 + swell + idleY, N3,  4, 10, isLeft, S);          // bow post
    pUnit(ctx, cx, cy,  21, -8 + swell + idleY, N3,  4, 10, isLeft, S);          // stern post
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.30 + ep * 0.10;
    for (let i = 0; i < 8; i++) {                                                // tattered sail hem
        const sx = -14 + i * 3;
        const sl = 2 + ((i * 5) % 4) + Math.round(Math.sin(rag + i) * 1);
        pUnit(ctx, cx, cy, sx, -16 + swell + idleY, N2, 2, sl, isLeft, S);
    }
    ctx.restore();
    for (let i = 0; i < 5; i++) {                                                // lamps along the rail
        glow(-18 + i * 9, -6 + swell, E3, 1, 1, 0.30 + ep * 0.22);
    }

    // ── ROBE HEM (ragged, no feet — he drifts)
    for (let i = 0; i < 11; i++) {
        const tx = -11 + i * 2;
        const tl = 4 + ((i * 5) % 7) + Math.round(Math.sin(rag + i) * 1.5);
        p(tx, 12, CO, 2, tl); p(tx, 12, N1, 1, tl - 1);
        if (i % 3 === 0) glow(tx, 12 + tl - 1, V3, 2, 1, 0.28 + ep * 0.20);
    }

    // ── ROBE BODY
    p(-10,-18, CO, 21, 31); p(-9,-17, N0, 19, 29); p(-8,-17, N1, 17, 28);
    p(-9,-17, N4, 19,  1);                                                       // top highlight
    p(-5,-16, N2,  9, 26);                                                       // lit inner panel
    p(-10, -2, CO, 21, 4); p(-9, -1, V1, 19, 2); p(-9, -1, V2, 19, 1);           // violet girdle

    // ── SHOULDER MANTLE
    p(-12,-21, CO, 25, 5); p(-11,-20, N1, 23, 3); p(-11,-20, N3, 23, 1);

    // ── ARMS
    p(-14,-15, CO, 6, 14); p(-13,-14, N1, 4, 12); p(-13,-14, N3, 4, 1);
    p(-15, -2, CO, 6,  5); p(-14, -1, N2, 4,  3); p(-14, -1, N4, 4, 1);
    p(  8,-15, CO, 6, 12); p(  9,-14, N1, 4, 10); p(  9,-14, N3, 4, 1);
    p(  9, -4, CO, 6,  5); p( 10, -3, N2, 4,  3); p( 10, -3, N4, 4, 1);

    // ── GOLD LANTERN in the left hand
    p(-15,-6, G2, 2, 4);                                                         // hanger
    p(-18,-14, CO, 8, 4); p(-17,-13, G2, 6, 2); p(-17,-13, G4, 6, 1);            // hood
    p(-17,-10, CO, 7, 9); p(-16, -9, E2, 5, 7); p(-16, -9, E3, 5, 2);            // glazed body
    p(-15, -7, E4, 3,  3);
    p(-17,-10, G2, 1,  9); p(-11,-10, G2, 1, 9);                                 // frame posts
    p(-18, -1, CO, 8,  3); p(-17,  0, G2, 6, 2); p(-17, 0, G3, 6, 1);            // base
    glow(-16, -9, E4, 5, 2, 0.55 + ep * 0.30);

    // ── VIOLET CLEANSING ROD in the right hand
    p(11,-30, CO, 4, 40); p(12,-29, N2, 2, 38); p(12,-29, N4, 2, 1);             // shaft
    p(11,-16, V2, 4, 1); p(11, 0, V2, 4, 1);                                     // bindings
    p( 9,-38, CO, 8,  9); p(10,-37, V1, 6, 7); p(11,-36, V2, 4, 5);              // head
    p(12,-35, V3, 2,  3); p(12,-34, V4, 2, 1);
    p(11,-42, CO, 4,  5); p(12,-41, V3, 2, 3);                                   // spire
    glow(11,-36, V4, 4, 2, 0.50 + ep * 0.30);
    glow(12,-41, V4, 2, 2, 0.50 + ep * 0.28);

    // ── HOOD with two points of light for a face
    p(-8,-38, CO, 17, 17); p(-7,-37, N0, 15, 15); p(-6,-36, N1, 13, 14);
    p(-7,-37, N3, 15,  1);                                                       // top highlight
    p(-6,-32, N0, 13,  8);                                                       // face void
    p(-4,-29, V2,  3,  2); p( 2,-29, V2, 3, 2);
    p(-3,-29, V4,  1,  1); p( 3,-29, V4, 1, 1);
    glow(-4,-29, V4, 3, 2, 0.78 + ep * 0.22);
    glow( 2,-29, V4, 3, 2, 0.78 + ep * 0.22);
    p(-9,-34, CO,  3, 9); p(-8,-33, N0, 1, 8);
    p( 8,-34, CO,  3, 9); p( 9,-33, N0, 1, 8);
    p(-3,-42, CO,  6, 5); p(-2,-41, V2, 4, 3); p(-2,-41, V4, 4, 1);              // hood crest
    glow(-2,-41, V4, 4, 1, 0.50 + ep * 0.30);

    if (isAtk) {
        glow(-17,-10, E4, 7, 9, 0.65);
        glow(  9,-38, V4, 8, 9, 0.65);
        glow(-4,-29, V4, 3, 2, 0.95); glow(2,-29, V4, 3, 2, 0.95);
    }
}

// ───────────────────────────────────────────────────
// FORSAKEN KING — 버림받은 자들의 왕. Violet royal plate with a gold breast-
// plate, a streaming cape, a greatsword lit with curse-green, five-point ruby crown.
// Lore: 보라빛 왕의 갑주에 황금 가슴판과 휘날리는 망토, 저주 녹광의 대검과 5첨 루비 왕관.
// ───────────────────────────────────────────────────
function drawForsakenKing(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const S = 2.0;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep  = (Math.sin(now * 0.003) + 1) / 2;
    const fly = Math.round(Math.sin(now * 0.0026) * 2);                          // cape stream

    const CO='#000';
    const V0='#150826', V1='#331358', V2='#5A2394', V3='#8A4CCC', V4='#C29AF0';  // royal violet
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8';
    const E0='#04361A', E1='#0A7A3A', E2='#18C468', E3='#5FF2A4', E4='#C8FFE2';  // curse green
    const S2='#98A2B8', S3='#D2DAEA', S4='#FFFFFF';
    const RUB='#C62828', RUH='#FF7A7A';
    const K0='#B07A48', K1='#E0B088', K2='#F8D0A8';

    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -22, -40 + idleY, V3, 44, 70, isLeft, S);
    ctx.restore();

    // ── CAPE streaming out behind, ragged at the trailing edge
    for (let c = 0; c < 4; c++) {
        const wx  = -19 + c * 3 - (3 - c);
        const top = -20 + c * 2 + fly;
        const len = 34 - c * 5;
        p(wx, top, CO, 4, len);
        p(wx, top + 1, c % 2 ? V0 : V1, 3, len - 2);
        p(wx, top + 1, V3, 3, 1);                                                // cape top light
        p(wx, top + len - 3, V0, 3, 2);
    }

    // ── SABATONS
    p(-8, 22, CO, 7, 5); p(-7, 23, V1, 5, 3); p(-7, 23, V3, 5, 1);
    p( 1, 22, CO, 7, 5); p( 2, 23, V1, 5, 3); p( 2, 23, V3, 5, 1);

    // ── GREAVES
    p(-8,  4, CO, 16, 19); p(-7,  5, V0, 14, 17); p(-6,  5, V1, 12, 16);
    p(-4,  6, V2,  8, 14);
    p(-7,  5, V4, 14,  1);                                                       // top highlight
    p(-1,  6, V0,  2, 13);
    p(-8, 19, CO, 16,  3); p(-7, 20, G2, 14, 2); p(-7, 20, G3, 14, 1);

    // ── BELT
    p(-7,  1, CO, 14, 4); p(-6, 2, G1, 12, 2); p(-6, 2, G3, 12, 1);
    p(-2,  0, CO,  5, 5); p(-1, 1, RUB, 3, 3); p(-1, 1, RUH, 3, 1);
    glow(-1, 1, G4, 3, 1, 0.45 + ep * 0.28);

    // ── GOLD BREASTPLATE over violet plate
    p(-8,-18, CO, 16, 20);
    p(-7,-17, V0, 14, 18); p(-6,-17, V1, 12, 17);
    p(-7,-17, V4, 14,  1);                                                       // top highlight
    p(-5,-16, CO, 11, 15); p(-4,-15, G1, 9, 13); p(-4,-15, G4, 9, 1);            // gold plate
    p(-3,-14, G2,  7, 11); p(-2,-13, G3, 5, 9);
    p(-2, -9, CO,  5,  5); p(-1, -8, RUB, 3, 3); p(-1, -8, RUH, 3, 1);           // ruby boss
    glow(-1, -8, G4, 3, 1, 0.50 + ep * 0.30);

    // ── PAULDRONS (gold-capped)
    p(-13,-21, CO, 7, 9); p(-12,-20, V1, 5, 7); p(-12,-20, V4, 5, 1);
    p(-12,-21, G2,  5, 1); p(-14,-25, CO, 3, 5); p(-13,-24, G3, 1, 4);
    p(  6,-21, CO, 7, 9); p(  7,-20, V1, 5, 7); p(  7,-20, V4, 5, 1);
    p(  7,-21, G2,  5, 1); p( 11,-25, CO, 3, 5); p( 12,-24, G3, 1, 4);

    // ── COLLAR
    p(-6,-22, CO, 12, 3); p(-5,-21, G2, 10, 2); p(-5,-21, G4, 10, 1);

    // ── ARMS
    p(-12,-15, CO, 6, 14); p(-11,-14, V1, 4, 12); p(-11,-14, V3, 4, 1);
    p(-12,  0, CO, 6,  5); p(-11,  1, K1, 4,  3); p(-11, 1, K2, 4, 1);
    p(  6,-15, CO, 6, 11); p(  7,-14, V1, 4,  9); p(  7,-14, V3, 4, 1);
    p(  6, -5, CO, 6,  5); p(  7, -4, K1, 4,  3); p(  7, -4, K2, 4, 1);

    // ── CURSED GREATSWORD — blade planted, green corrosion crawling the fuller
    p( 8,-10, CO, 7, 5); p( 9, -9, G2, 5, 3); p( 9, -9, G4, 5, 1);               // crossguard
    p(10, -5, CO, 4, 5); p(11, -4, V2, 2, 3);                                    // grip
    p(10,  0, CO, 5, 4); p(11,  1, G3, 3, 2);                                    // pommel
    for (let i = 0; i < 9; i++) {                                                // blade upward
        const by = -14 - i * 4;
        p( 9, by, CO, 7, 5);
        p(10, by, S2, 5, 4); p(10, by, S3, 5, 2); p(10, by, S4, 5, 1);
        p(12, by, E1, 1, 4);                                                     // corroded fuller
        glow(12, by, E3, 1, 4, 0.30 + ep * 0.24);
    }
    p(10,-52, CO, 5, 5); p(11,-51, S3, 3, 3); p(11,-51, S4, 3, 1);               // point
    glow(11,-51, E4, 3, 1, 0.45 + ep * 0.26);

    // ── NECK + HEAD
    p(-2,-25, CO, 4, 3); p(-1,-24, K0, 2, 2);
    p(-6,-37, CO, 12, 13);
    p(-5,-36, K1, 10, 11); p(-5,-36, K2, 10, 1);
    p( 3,-35, K0,  2,  9);
    p(-4,-32, CO, 3, 2); p( 1,-32, CO, 3, 2);
    p(-3,-32, isAtk ? E4 : E3, 1, 1); p( 2,-32, isAtk ? E4 : E3, 1, 1);
    p(-1,-28, K0, 2, 1);

    // ── FIVE-POINT RUBY CROWN
    p(-8,-41, CO, 16, 5); p(-7,-40, G1, 14, 3); p(-7,-40, G3, 14, 1);
    for (let i = 0; i < 5; i++) {
        const sx = -7 + i * 3;
        const sh = (i === 2) ? 8 : (i % 2 ? 4 : 6);
        p(sx, -41 - sh, CO, 3, sh + 1);
        p(sx + 1, -40 - sh, G3, 1, sh);
        p(sx + 1, -40 - sh, G4, 1, 2);
    }
    p(-2,-46, CO, 5, 5); p(-1,-45, RUB, 3, 3); p(-1,-45, RUH, 3, 1);             // centre ruby
    glow(-1,-45, G4, 3, 1, 0.50 + ep * 0.30);

    if (isAtk) {
        for (let i = 0; i < 9; i++) glow(12, -14 - i * 4, E4, 1, 4, 0.60);
        glow(-1,-45, G4, 3, 3, 0.65);
        glow(-1, -8, G4, 3, 3, 0.55);
    }
}

// ───────────────────────────────────────────────────
// VOID GATEKEEPER — 공허의 문지기. The slate gate IS the body: two pillars and
// a lintel around a turning cyan portal, a floating eye in the opening, horned
// helm above.
// Lore: 거대한 슬레이트 게이트 자체가 몸이며, 회오리치는 시안 차원문과 떠 있는 눈, 뿔 투구의 문지기.
// ───────────────────────────────────────────────────
function drawVoidGatekeeper(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const S = 2.0;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep    = (Math.sin(now * 0.003) + 1) / 2;
    const swirl = now * 0.0022;
    const blink = (now % 3600) / 3600;

    const CO='#000';
    const S0='#181C24', S1='#333A46', S2='#576273', S3='#8894A6', S4='#C2CCDC';  // slate
    const C0='#03323F', C1='#0A6E96', C2='#22B8E0', C3='#7FE8FF', C4='#DDFAFF';  // portal cyan
    const G2='#B88000', G3='#FFD700', G4='#FFF4A0';

    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -22, -40 + idleY, C2, 44, 70, isLeft, S);
    ctx.restore();

    // ── PLINTH the gate stands on
    p(-15, 18, CO, 30, 7); p(-14, 19, S1, 28, 5); p(-14, 19, S3, 28, 1);
    p(-13, 22, S0, 26,  2);

    // ── GATE PILLARS — these are the legs and torso both
    for (let k = 0; k < 2; k++) {
        const px = k ? 6 : -14;
        p(px,     -22, CO, 8, 41);
        p(px + 1, -21, S0, 6, 39); p(px + 1, -21, S2, 6, 38);
        p(px + 1, -21, S4, 6,  1);                                               // top highlight
        p(px + 6, -20, S0, 1, 38);                                               // shaded edge
        for (let b = 0; b < 5; b++) p(px + 1, -16 + b * 8, S0, 6, 1);            // course lines
        // cyan runes cut into the stone
        p(px + 2, -12, C1, 4, 1); p(px + 2, 0, C1, 4, 1); p(px + 2, 12, C1, 4, 1);
        glow(px + 2, -12, C3, 4, 1, 0.32 + ep * 0.24);
        glow(px + 2,   0, C3, 4, 1, 0.32 + ep * 0.24);
        glow(px + 2,  12, C3, 4, 1, 0.32 + ep * 0.24);
    }

    // ── LINTEL across the top
    p(-16,-30, CO, 32, 9); p(-15,-29, S1, 30, 7); p(-15,-29, S4, 30, 1);
    p(-15,-23, S0, 30,  1);
    p(-13,-27, S3, 26,  1);                                                      // carved band
    for (let i = 0; i < 7; i++) p(-11 + i * 4, -26, S0, 2, 3);                   // dentils

    // ── THE PORTAL in the opening — concentric rings turning, dark at the rim
    //    and bright toward the middle so it reads as depth, not a flat disc.
    p(-6,-21, CO, 12, 40);
    p(-5,-20, C0, 10, 38);
    for (let i = 0; i < 7; i++) {
        const a  = swirl + i * 0.9;
        const rx = Math.round(Math.cos(a) * 3);
        const ry = -16 + i * 5 + Math.round(Math.sin(a) * 2);
        p(-4 + rx, ry, C1, 8, 3);
        p(-4 + rx, ry, C2, 8, 1);
        glow(-4 + rx, ry, C3, 8, 1, 0.30 + ep * 0.22);
    }
    p(-3, -4, C2, 6, 6); p(-2, -3, C3, 4, 4);                                    // bright core
    glow(-3, -4, C4, 6, 1, 0.45 + ep * 0.30);

    // ── THE FLOATING EYE in the opening
    const lid = blink > 0.94 ? 1 : 0;
    p(-5, -8, CO, 10, 8);
    if (!lid) {
        p(-4, -7, C4,  8, 6);                                                    // sclera
        p(-4, -7, C2,  8, 1);                                                    // lid shadow
        p(-2, -7, CO,  4, 6); p(-1, -6, C1, 2, 4);                               // iris
        p(-1, -6, CO,  2, 2);                                                    // pupil
        glow(-4, -7, C4, 8, 1, 0.50 + ep * 0.30);
        glow(-1, -6, C4, 2, 1, 0.55);
    } else {
        p(-4, -5, S2, 8, 2);                                                     // closed
    }

    // ── HORNED HELM crowning the lintel
    p(-7,-40, CO, 14, 11); p(-6,-39, S0, 12, 9); p(-5,-39, S1, 10, 8);
    p(-6,-39, S4, 12,  1);                                                       // top highlight
    p(-6,-35, S0, 12,  4);                                                       // face void
    p(-5,-34, CO,  4,  2); p( 2,-34, CO, 4, 2);
    p(-4,-34, C2,  2,  1); p( 3,-34, C2, 2, 1);
    glow(-4,-34, C4, 2, 1, 0.70 + ep * 0.28);
    glow( 3,-34, C4, 2, 1, 0.70 + ep * 0.28);
    p(-12,-45, CO, 5, 8); p(-11,-44, S2, 3, 6); p(-11,-45, S4, 3, 1);            // horns
    p(  8,-45, CO, 5, 8); p(  9,-44, S2, 3, 6); p(  9,-45, S4, 3, 1);
    p(-2,-44, CO,  5, 5); p(-1,-43, C1, 3, 3); p(-1,-43, C3, 3, 1);              // keystone
    glow(-1,-43, C4, 3, 1, 0.55 + ep * 0.30);
    p(-8,-41, CO, 16, 2); p(-7,-40, G2, 14, 1);                                  // gold band

    if (isAtk) {
        glow(-5,-20, C4, 10, 38, 0.35);
        glow(-3, -4, C4,  6,  6, 0.65);
        glow(-4,-34, C4,  2,  1, 0.90); glow(3,-34, C4, 2, 1, 0.90);
    }
}

// ───────────────────────────────────────────────────
// ETERNAL WALL — 영원의 수호벽. A rampart shield and a war hammer, a blue light
// cross set in the chest, battlements worn on the head.
// Lore: 거대한 성벽 방패와 전쟁망치, 흉부에 푸른 빛 십자, 성가퀴를 머리에 얹은 영원의 수호자.
// ───────────────────────────────────────────────────
function drawEternalWall(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const S = 2.0;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep = (Math.sin(now * 0.003) + 1) / 2;

    const CO='#000';
    const S0='#2A2E38', S1='#5E6676', S2='#949CAC', S3='#C6CEDC', S4='#FFFFFF';  // fortress stone
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8';
    const C1='#0A6E96', C2='#22B8E0', C3='#7FE8FF', C4='#DDFAFF';                // blue light
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.19;
    pUnitAura(ctx, cx, cy, -22, -40 + idleY, C2, 44, 70, isLeft, S);
    ctx.restore();

    // ── SABATONS (planted wide)
    p(-11, 22, CO, 8, 5); p(-10, 23, S1, 6, 3); p(-10, 23, S3, 6, 1);
    p(  4, 22, CO, 8, 5); p(  5, 23, S1, 6, 3); p(  5, 23, S3, 6, 1);

    // ── GREAVES
    p(-9,  4, CO, 18, 19); p(-8,  5, S0, 16, 17); p(-7,  5, S1, 14, 16);
    p(-5,  6, S2, 10, 14);
    p(-8,  5, S4, 16,  1);                                                       // top highlight
    p(-1,  6, S0,  2, 13);
    p(-9, 19, CO, 18,  3); p(-8, 20, G2, 16, 2); p(-8, 20, G3, 16, 1);

    // ── BELT
    p(-8,  1, CO, 16, 4); p(-7, 2, G1, 14, 2); p(-7, 2, G3, 14, 1);

    // ── CUIRASS built like masonry, with the blue cross set into it
    p(-9,-19, CO, 19, 21); p(-8,-18, S0, 17, 19); p(-7,-18, S1, 15, 18);
    p(-8,-18, S4, 17,  1);                                                       // top highlight
    p( 7,-17, S0,  2, 17);
    for (let r = 0; r < 4; r++) {                                                // block courses
        p(-8, -14 + r * 4, S0, 17, 1);
        p(-8 + (r % 2) * 4, -18 + r * 4, S0, 1, 4);
    }
    p(-2,-16, CO,  5, 15); p(-1,-15, C1, 3, 13); p(-1,-15, C3, 3, 1);            // cross upright
    p(-6,-10, CO, 13,  5); p(-5, -9, C1, 11, 3); p(-5, -9, C3, 11, 1);           // cross arm
    glow(-1,-15, C4, 3, 1, 0.50 + ep * 0.30);
    glow(-5, -9, C4, 11, 1, 0.50 + ep * 0.30);

    // ── PAULDRONS as bastions
    p(-15,-23, CO, 9, 11); p(-14,-22, S1, 7, 9); p(-14,-22, S4, 7, 1);
    for (let i = 0; i < 3; i++) p(-14 + i * 3, -26, S2, 2, 4);                   // merlons
    p(  7,-23, CO, 9, 11); p(  8,-22, S1, 7, 9); p(  8,-22, S4, 7, 1);
    for (let i = 0; i < 3; i++) p(  8 + i * 3, -26, S2, 2, 4);

    // ── COLLAR
    p(-6,-22, CO, 12, 3); p(-5,-21, S3, 10, 2); p(-5,-21, S4, 10, 1);

    // ── ARMS
    p(-14,-15, CO, 6, 14); p(-13,-14, S1, 4, 12); p(-13,-14, S3, 4, 1);
    p(  8,-15, CO, 6, 14); p(  9,-14, S1, 4, 12); p(  9,-14, S3, 4, 1);
    p(  8,  0, CO, 6,  5); p(  9,  1, S2, 4,  3); p(  9, 1, S4, 4, 1);

    // ── RAMPART SHIELD on the left — a wall section, crenellated along the top
    p(-24,-34, CO, 13, 58); p(-23,-33, S0, 11, 56); p(-22,-33, S1, 10, 55);
    p(-23,-33, S4, 11,  1);                                                      // top highlight
    for (let r = 0; r < 7; r++) {                                                // block courses
        p(-23, -28 + r * 8, S0, 11, 1);
        p(-23 + (r % 2) * 5, -33 + r * 8, S0, 1, 8);
    }
    for (let i = 0; i < 3; i++) { p(-23 + i * 4, -38, CO, 4, 5); p(-22 + i * 4, -37, S2, 2, 4); }
    p(-24, 22, CO, 13, 4); p(-23, 23, S1, 11, 2);                                // footing
    p(-20,-16, CO,  5, 5); p(-19,-15, C1, 3, 3); p(-19,-15, C3, 3, 1);           // ward stone
    glow(-19,-15, C4, 3, 1, 0.45 + ep * 0.28);

    // ── WAR HAMMER in the right
    p(11,-20, CO, 4, 42); p(12,-19, G1, 2, 40); p(12,-19, G3, 2, 1);             // haft
    p(11, -6, G2, 4, 1); p(11, 10, G2, 4, 1);
    p( 7,-32, CO, 12, 12); p( 8,-31, S1, 10, 10); p( 8,-31, S4, 10, 1);          // head
    p( 8,-29, S2, 10,  6);
    p( 7,-32, G2, 12,  1); p( 7,-22, G2, 12, 1);                                 // gold cheeks
    p(10,-29, CO,  6,  6); p(11,-28, C1, 4, 4); p(11,-28, C3, 4, 1);             // blue boss
    glow(11,-28, C4, 4, 1, 0.45 + ep * 0.28);

    // ── NECK + HELM
    p(-2,-25, CO, 4, 3); p(-1,-24, K0, 2, 2);
    p(-7,-38, CO, 14, 15); p(-6,-37, S0, 12, 13); p(-5,-37, S1, 10, 12);
    p(-6,-37, S4, 12,  1);                                                       // top highlight
    p( 4,-36, S0,  2, 11);
    p(-6,-32, CO, 12,  3); p(-5,-31, K0, 10, 1);
    p(-5,-31, isAtk ? C4 : C2, 10, 1);                                           // visor slit
    glow(-5,-31, C4, 10, 1, 0.42 + ep * 0.28);

    // ── BATTLEMENTS WORN AS A CROWN
    p(-9,-42, CO, 18, 5); p(-8,-41, S1, 16, 3); p(-8,-41, S3, 16, 1);
    for (let i = 0; i < 4; i++) {
        const mx = -8 + i * 5;
        p(mx, -47, CO, 4, 6); p(mx + 1, -46, S2, 2, 5); p(mx + 1, -46, S4, 2, 1);
    }
    p(-9,-42, G2, 18, 1);

    if (isAtk) {
        glow(-1,-15, C4, 3, 13, 0.55); glow(-5,-9, C4, 11, 3, 0.55);
        glow( 7,-32, C4, 12, 12, 0.45);
    }
}

window.drawTransmuter = drawTransmuter;
window.drawOracle = drawOracle;
window.drawWarden = drawWarden;
window.drawCursedTalisman = drawCursedTalisman;
window.drawAsura = drawAsura;
window.drawPiercingShadow = drawPiercingShadow;
window.drawCocytus = drawCocytus;
window.drawPurgatory = drawPurgatory;
window.drawReaper = drawReaper;
window.drawDoomGuide = drawDoomGuide;
window.drawForsakenKing = drawForsakenKing;
window.drawVoidGatekeeper = drawVoidGatekeeper;
window.drawEternalWall = drawEternalWall;

/* ══════════════════════════════ NOVICE EXORCIST EXCLUSIVE T4 ════════════ */

// ───────────────────────────────────────────────────
// WORD OF GOD — 신의 말씀. Shining gold plate, feathered angel wings, a great
// scripture floating open before him, halo overhead.
// Lore: 빛나는 황금 갑주에 천사 깃털 날개, 부유하는 거대 성서와 머리 위 황금 후광의 천사.
// ───────────────────────────────────────────────────
function drawWordOfGod(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const S = 2.0;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    // Beads are single pixels on a two-pixel cord: at this scale anything
    // larger stops reading as a rosary and turns into a chain.
    const beads = (x0, y0, x1, y1, n, cord, bead, lit) => {
        for (let i = 0; i < n; i++) {
            const t  = n > 1 ? i / (n - 1) : 0;
            const bx = Math.round(x0 + (x1 - x0) * t);
            const by = Math.round(y0 + (y1 - y0) * t);
            p(bx, by, cord, 2, 1);
            p(bx, by, i % 3 === 0 ? lit : bead, 1, 1);
        }
    };
    const ep    = (Math.sin(now * 0.003) + 1) / 2;
    const flap  = Math.round(Math.sin(now * 0.0022) * 2);
    const hover = Math.round(Math.sin(now * 0.0026) * 2);

    const CO='#000';
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8', G5='#FFFDE8';
    const W0='#5A5A6A', W1='#9C9CAE', W2='#D0D0E0', W3='#F0F0F8', W4='#FFFFFF';  // feathers
    const P2='#C9B98E', P3='#EDE0BC', P4='#FFF8E0';                              // pages
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.15 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -24, -42 + idleY, G3, 48, 74, isLeft, S);
    ctx.restore();

    // ── ANGEL WINGS — white feathers with gold coverts, fanned so the outer
    //    courses start higher and run longer.
    for (let k = 0; k < 2; k++) {
        const bx = k ? 8 : -22;
        for (let c = 0; c < 5; c++) {
            const wx  = bx + (k ? c * 3 : (4 - c) * 3);
            const top = -24 - c * 5 + flap;
            const len = 14 + c * 5;
            p(wx, top, CO, 4, len);
            p(wx + (k ? 1 : 0), top + 1, c % 2 ? W1 : W2, 3, len - 2);
            p(wx + (k ? 1 : 0), top + 1, W4, 3, 1);                              // feather top light
            p(wx + (k ? 1 : 0), top + len - 3, W0, 3, 2);                        // tip shade
            if (c < 2) p(wx + (k ? 1 : 0), top + 1, G2, 3, 2);                   // gold coverts
        }
        glow(bx + (k ? 12 : 0), -44 + flap, W4, 3, 10, 0.24 + ep * 0.20);
    }

    // ── SABATONS
    p(-9, 22, CO, 8, 5); p(-8, 23, G1, 6, 3); p(-8, 23, G3, 6, 1);
    p( 2, 22, CO, 8, 5); p( 3, 23, G1, 6, 3); p( 3, 23, G3, 6, 1);

    // ── GOLD GREAVES
    p(-9,  4, CO, 18, 19); p(-8,  5, G0, 16, 17); p(-7,  5, G1, 14, 16);
    p(-5,  6, G2, 10, 14);
    p(-8,  5, G4, 16,  1);                                                       // top highlight
    p(-1,  6, G0,  2, 13);
    p(-9, 19, CO, 18,  3); p(-8, 20, G2, 16, 2); p(-8, 20, G4, 16, 1);

    // ── BELT
    p(-8,  1, CO, 16, 4); p(-7, 2, G2, 14, 2); p(-7, 2, G4, 14, 1);

    // ── GOLD CUIRASS
    p(-8,-19, CO, 17, 21); p(-7,-18, G0, 15, 19); p(-6,-18, G1, 13, 18);
    p(-4,-17, G2,  9, 16); p(-3,-16, G3, 7, 14);
    p(-7,-18, G4, 15,  1);                                                       // top highlight
    p( 6,-17, G0,  2, 17);
    p(-6,-12, G0, 15,  1); p(-6, -6, G0, 15, 1);                                 // plate seams

    // ── PAULDRONS + COLLAR
    p(-13,-22, CO, 7, 9); p(-12,-21, G1, 5, 7); p(-12,-21, G4, 5, 1);
    p(  6,-22, CO, 7, 9); p(  7,-21, G1, 5, 7); p(  7,-21, G4, 5, 1);
    p(-6,-23, CO, 12, 3); p(-5,-22, G2, 10, 2); p(-5,-22, G4, 10, 1);

    // ── ARMS held open beside the book
    p(-13,-16, CO, 6, 13); p(-12,-15, G1, 4, 11); p(-12,-15, G3, 4, 1);
    p(-14, -4, CO, 6,  5); p(-13, -3, K1, 4,  3); p(-13, -3, K2, 4, 1);
    p(  7,-16, CO, 6, 13); p(  8,-15, G1, 4, 11); p(  8,-15, G3, 4, 1);
    p(  8, -4, CO, 6,  5); p(  9, -3, K1, 4,  3); p(  9, -3, K2, 4, 1);

    // ── THE GREAT SCRIPTURE, floating open in front
    const by = -8 + hover;
    p(-13, by,      CO, 27, 16);
    p(-12, by + 1,  P2, 12, 14); p( 1, by + 1, P2, 12, 14);                      // page backs
    p(-12, by + 1,  P3, 12, 13); p( 1, by + 1, P4, 12, 13);                      // page faces
    p(-12, by + 1,  P4, 12,  1); p( 1, by + 1, P4, 12,  1);                      // page top light
    p( -1, by,      CO,  3, 16); p(-1, by + 1, G2, 1, 14); p(-1, by + 1, G4, 1, 1);
    for (let i = 0; i < 4; i++) {
        p(-11, by + 3 + i * 3, G2, 9, 1); p( 2, by + 3 + i * 3, G2, 9, 1);       // lines of script
        glow(-11, by + 3 + i * 3, G5, 9, 1, 0.32 + ep * 0.24);
        glow(  2, by + 3 + i * 3, G5, 9, 1, 0.32 + ep * 0.24);
    }
    p(-13, by + 16, CO, 27, 3); p(-12, by + 17, G2, 25, 2);                      // gilt edge
    glow(-12, by + 1, G5, 25, 1, 0.35 + ep * 0.26);

    // ── NECK + HEAD
    p(-2,-25, CO, 4, 3); p(-1,-24, K0, 2, 2);
    p(-6,-37, CO, 12, 13);
    p(-5,-36, K1, 10, 11); p(-5,-36, K2, 10, 1);
    p( 3,-35, K0,  2,  9);
    p(-4,-32, CO, 3, 2); p( 1,-32, CO, 3, 2);
    p(-3,-32, isAtk ? G5 : G4, 1, 1); p( 2,-32, isAtk ? G5 : G4, 1, 1);
    p(-1,-28, K0, 2, 1);

    // ── GOLD CIRCLET
    p(-7,-39, CO, 14, 3); p(-6,-38, G2, 12, 2); p(-6,-38, G4, 12, 1);

    // ── HALO overhead — an open ring, brightest along its upper edge
    p(-11,-47, CO, 23, 1); p(-11,-42, CO, 23, 1);
    p(-12,-46, CO,  1, 5); p( 11,-46, CO, 1, 5);
    p(-11,-46, G3, 23, 1); p(-11,-43, G2, 23, 1);
    p(-11,-45, G0, 23, 1); p(-11,-44, G0, 23, 1);                                // hollow interior
    glow(-11,-46, G5, 23, 1, 0.50 + ep * 0.30);
    glow(-11,-43, G4, 23, 1, 0.30 + ep * 0.22);

    if (isAtk) {
        glow(-11,-46, G5, 23, 1, 0.75);
        for (let i = 0; i < 4; i++) {
            glow(-11, by + 3 + i * 3, G5, 9, 1, 0.65);
            glow(  2, by + 3 + i * 3, G5, 9, 1, 0.65);
        }
    }
}

// ───────────────────────────────────────────────────
// GENESIS STRIKE — 천지창조의 왕. Seven-gem rainbow crown, wings of every
// colour, an orb of creation turning between the hands.
// Lore: 7색 무지개 보석 왕관에 다색 창조 날개, 손 사이에 모든 색의 창조구를 다루는 우주적 황제.
// ───────────────────────────────────────────────────
function drawGenesisStrike(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const S = 2.0;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep   = (Math.sin(now * 0.003) + 1) / 2;
    const spin = now * 0.0016;
    const flap = Math.round(Math.sin(now * 0.0022) * 2);

    const CO='#000';
    // The seven creation colours, used for the crown gems, the wing courses and
    // the orb alike so the whole figure reads as one spectrum.
    const SPEC = ['#FF4A4A', '#FF9A3A', '#FFE23A', '#5AE06A', '#3AC8FF', '#5A6AFF', '#B85AFF'];
    const G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8', G5='#FFFDE8';
    const W1='#8C8C9C', W2='#C8C8D8', W3='#EDEDF6', W4='#FFFFFF';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.15 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -24, -42 + idleY, G3, 48, 74, isLeft, S);
    ctx.restore();

    // ── WINGS OF CREATION — seven courses a side, one per colour, fanned so
    //    the outer feathers start higher and run longer.
    for (let k = 0; k < 2; k++) {
        const bx = k ? 8 : -22;
        for (let c = 0; c < 7; c++) {
            const wx  = bx + (k ? c * 2 : (6 - c) * 2);
            const top = -22 - c * 4 + flap;
            const len = 12 + c * 4;
            p(wx, top, CO, 3, len);
            p(wx + (k ? 1 : 0), top + 1, SPEC[k ? c : 6 - c], 2, len - 2);
            p(wx + (k ? 1 : 0), top + 1, W4, 2, 1);                              // feather top light
            glow(wx + (k ? 1 : 0), top + 1, SPEC[k ? c : 6 - c], 2, 2, 0.30 + ep * 0.22);
        }
    }

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, G1, 4, 3); p(-6, 23, G3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, G1, 4, 3); p( 2, 23, G3, 4, 1);

    // ── IMPERIAL ROBE
    p(-9,  4, CO, 18, 19);
    p(-8,  5, W1, 16, 17); p(-7,  5, W2, 14, 16); p(-5,  6, W3, 10, 14);
    p(-8,  5, W4, 16,  1);                                                       // top highlight
    p(-3,  7, W1,  1, 12); p( 3,  7, W1,  1, 12);
    p(-9, 19, CO, 18,  3); p(-8, 20, G2, 16, 2); p(-8, 20, G3, 16, 1);
    for (let i = 0; i < 7; i++) p(-7 + i * 2, 16, SPEC[i], 1, 3);                // spectrum hem studs

    // ── SASH
    p(-8,  1, CO, 16, 4); p(-7, 2, G1, 14, 2); p(-7, 2, G3, 14, 1);

    // ── TORSO
    p(-7,-17, CO, 14, 19);
    p(-6,-16, W1, 12, 17); p(-5,-16, W2, 10, 16); p(-3,-15, W3, 6, 14);
    p(-6,-16, W4, 12,  1);                                                       // top highlight
    p(-6,-16, G2,  1, 17); p( 5,-16, G2, 1, 17);

    // ── COLLAR
    p(-8,-21, CO, 16, 5); p(-7,-20, G2, 14, 3); p(-7,-20, G4, 14, 1);

    // ── ARMS cupping the orb between them
    p(-13,-14, CO, 6, 12); p(-12,-13, W2, 4, 10); p(-12,-13, W4, 4, 1);
    p(-13, -4, CO, 6,  5); p(-12, -3, K1, 4,  3); p(-12, -3, K2, 4, 1);
    p(  7,-14, CO, 6, 12); p(  8,-13, W2, 4, 10); p(  8,-13, W4, 4, 1);
    p(  7, -4, CO, 6,  5); p(  8, -3, K1, 4,  3); p(  8, -3, K2, 4, 1);

    // ── ORB OF CREATION — a white core with the seven colours in orbit
    p(-5,-10, CO, 11, 11); p(-4, -9, W2, 9, 9); p(-3, -8, W4, 7, 7);
    glow(-4, -9, W4, 9, 1, 0.45 + ep * 0.30);
    for (let i = 0; i < 7; i++) {
        const a  = spin + i * (Math.PI * 2 / 7);
        const ox2 = Math.round(Math.cos(a) * 8);
        const oy2 = -4 + Math.round(Math.sin(a) * 5);
        p(ox2, oy2, SPEC[i], 2, 2);
        glow(ox2, oy2, SPEC[i], 2, 2, (Math.sin(a) > 0 ? 0.75 : 0.35) + ep * 0.20);
    }

    // ── NECK + HEAD
    p(-2,-23, CO, 4, 3); p(-1,-22, K0, 2, 2);
    p(-6,-35, CO, 12, 13);
    p(-5,-34, K1, 10, 11); p(-5,-34, K2, 10, 1);
    p( 3,-33, K0,  2,  9);
    p(-4,-30, CO, 3, 2); p( 1,-30, CO, 3, 2);
    p(-3,-30, W4, 1, 1); p( 2,-30, W4, 1, 1);
    p(-1,-26, K0, 2, 1);

    // ── SEVEN-GEM RAINBOW CROWN
    p(-9,-40, CO, 18, 5); p(-8,-39, G1, 16, 3); p(-8,-39, G4, 16, 1);
    for (let i = 0; i < 7; i++) {
        const gx = -8 + i * 2.5;
        const gh = (i === 3) ? 7 : (Math.abs(i - 3) === 1 ? 5 : 4);
        p(Math.round(gx), -40 - gh, CO, 3, gh + 1);
        p(Math.round(gx) + 1, -39 - gh, SPEC[i], 1, gh);
        glow(Math.round(gx) + 1, -39 - gh, SPEC[i], 1, 2, 0.55 + ep * 0.25);
    }

    if (isAtk) {
        glow(-5,-10, W4, 11, 11, 0.55);
        for (let i = 0; i < 7; i++) glow(Math.round(-8 + i * 2.5) + 1, -46, SPEC[i], 1, 4, 0.65);
    }
}

// ───────────────────────────────────────────────────
// EXORCISM STORM — 퇴마의 폭풍. Cape of cyan lightning wings, a storm sceptre
// in each hand, twin lightning horns.
// Lore: 시안 번개 날개 망토, 양손에 폭풍 셉터를 들고 트윈 번개 뿔이 빛나는 영원한 폭풍사.
// ───────────────────────────────────────────────────
function drawExorcismStorm(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const S = 2.0;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep    = (Math.sin(now * 0.003) + 1) / 2;
    const flick = (now % 380) / 380;
    const flap  = Math.round(Math.sin(now * 0.0024) * 2);

    const CO='#000';
    const B0='#04122E', B1='#0E2A62', B2='#1E4CA8', B3='#3C7AD8', B4='#84AEF0';  // storm blue
    const C0='#03323F', C1='#0A6E96', C2='#22B8E0', C3='#7FE8FF', C4='#DDFAFF';  // cyan lightning
    const G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.15 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -24, -42 + idleY, C2, 48, 74, isLeft, S);
    ctx.restore();

    // ── WINGS OF LIGHTNING — four courses a side, fanned, with a bolt running
    //    down the leading edge of alternate courses.
    for (let k = 0; k < 2; k++) {
        const bx = k ? 8 : -20;
        for (let c = 0; c < 4; c++) {
            const wx  = bx + (k ? c * 3 : (3 - c) * 3);
            const top = -24 - c * 5 + flap;
            const len = 14 + c * 5;
            p(wx, top, CO, 4, len);
            p(wx + (k ? 1 : 0), top + 1, c % 2 ? C0 : C1, 3, len - 2);
            p(wx + (k ? 1 : 0), top + 1, C3, 3, 1);                              // leading edge
            if ((c + k) % 2 === 0) {
                const t = (flick + c / 4) % 1;
                glow(wx + (k ? 1 : 0), top + 1 + Math.round(t * (len - 4)), C4, 3, 1, (1 - t) * 0.8);
            }
        }
    }

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, B1, 4, 3); p(-6, 23, B3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, B1, 4, 3); p( 2, 23, B3, 4, 1);

    // ── ROBE SKIRT
    p(-8,  4, CO, 16, 19);
    p(-7,  5, B0, 14, 17); p(-6,  5, B1, 12, 16); p(-4,  6, B2, 8, 14);
    p(-7,  5, B4, 14,  1);                                                       // top highlight
    p(-3,  7, B0,  1, 12); p( 2,  7, B0,  1, 12);
    p(-8, 19, CO, 16,  3); p(-7, 20, G2, 14, 2); p(-7, 20, G3, 14, 1);

    // ── SASH
    p(-7,  1, CO, 14, 4); p(-6, 2, G1, 12, 2); p(-6, 2, G3, 12, 1);
    p(-2,  0, CO,  5, 5); p(-1, 1, C1,  3, 3); p(-1, 1, C3, 3, 1);
    glow(-1, 1, C4, 3, 1, 0.55 + ep * 0.32);

    // ── TORSO
    p(-7,-17, CO, 14, 19);
    p(-6,-16, B0, 12, 17); p(-5,-16, B1, 10, 16); p(-3,-15, B2, 6, 14);
    p(-6,-16, B4, 12,  1);                                                       // top highlight
    p(-6,-16, G2,  1, 17); p( 5,-16, G2, 1, 17);
    p(-2,-10, CO,  5,  5); p(-1, -9, C1, 3, 3); p(-1, -9, C3, 3, 1);
    glow(-1, -9, C4, 3, 1, 0.55 + ep * 0.30);

    // ── COLLAR
    p(-8,-21, CO, 16, 5); p(-7,-20, G2, 14, 3); p(-7,-20, G4, 14, 1);

    // ── ARMS, a sceptre raised in each
    p(-13,-19, CO, 6, 13); p(-12,-18, B1, 4, 11); p(-12,-18, B3, 4, 1);
    p(-15,-27, CO, 6, 10); p(-14,-26, B1, 4,  8); p(-14,-26, B3, 4, 1);
    p(-15,-30, CO, 6,  5); p(-14,-29, K1, 4,  3); p(-14,-29, K2, 4, 1);
    p(  7,-19, CO, 6, 13); p(  8,-18, B1, 4, 11); p(  8,-18, B3, 4, 1);
    p(  9,-27, CO, 6, 10); p( 10,-26, B1, 4,  8); p( 10,-26, B3, 4, 1);
    p(  9,-30, CO, 6,  5); p( 10,-29, K1, 4,  3); p( 10,-29, K2, 4, 1);

    // ── TWIN STORM SCEPTRES
    const sceptre = (sx, k) => {
        p(sx, -34, CO, 4, 22); p(sx + 1, -33, G1, 2, 20); p(sx + 1, -33, G3, 2, 1);
        p(sx - 1, -42, CO, 6, 9); p(sx, -41, C1, 4, 7); p(sx, -41, C3, 4, 1);    // head
        p(sx + 1, -40, C2, 2, 5);
        p(sx, -46, CO, 4, 5); p(sx + 1, -45, C3, 2, 3);                          // spire
        glow(sx, -41, C4, 4, 1, 0.50 + ep * 0.30);
        const t = (flick + k * 0.5) % 1;
        glow(sx + 1, -45 + Math.round(t * 4), C4, 2, 1, (1 - t) * 0.8);
    };
    sceptre(-17, 0);
    sceptre( 12, 1);

    // ── NECK + HEAD
    p(-2,-23, CO, 4, 3); p(-1,-22, K0, 2, 2);
    p(-6,-35, CO, 12, 13);
    p(-5,-34, K1, 10, 11); p(-5,-34, K2, 10, 1);
    p( 3,-33, K0,  2,  9);
    p(-4,-30, CO, 3, 2); p( 1,-30, CO, 3, 2);
    p(-3,-30, isAtk ? C4 : C3, 1, 1); p( 2,-30, isAtk ? C4 : C3, 1, 1);
    p(-1,-26, K0, 2, 1);

    // ── TWIN LIGHTNING HORNS off a gold circlet
    p(-7,-38, CO, 14, 4); p(-6,-37, G2, 12, 2); p(-6,-37, G4, 12, 1);
    for (let k = 0; k < 2; k++) {
        const hx = k ? 4 : -7;
        const dir = k ? 1 : -1;
        for (let j = 0; j < 4; j++) {
            const bx = hx + dir * j + (j % 2 ? dir : 0);
            const by = -40 - j * 3;
            p(bx, by, CO, 4, 4); p(bx + (dir > 0 ? 1 : 0), by, C2, 2, 3);
            p(bx + (dir > 0 ? 1 : 0), by, C4, 2, 1);
        }
        glow(hx + dir * 3, -51, C4, 3, 3, 0.55 + ep * 0.28);
    }

    if (isAtk) {
        glow(-17,-41, C4, 6, 9, 0.70); glow(12,-41, C4, 6, 9, 0.70);
        glow(-1, -9, C4, 3, 3, 0.60);
    }
}

window.drawWordOfGod      = drawWordOfGod;
window.drawGenesisStrike  = drawGenesisStrike;
window.drawExorcismStorm  = drawExorcismStorm;

/* ─── Novice Exorcist Exclusive — Support T4 ────────────────────────────── */
/* DIVINE CHOIR — 신성한 합창단. Great gold feather wings, a vast halo, ghost
 * singers at either shoulder and notes drifting between them.
 * Lore: 거대한 황금 깃털 날개와 광활한 후광, 음표가 떠도는 양옆의 유령 가수를 거느린 신성한 지휘자.
 * Concept was right; this puts it on 5-step ramps, gives the wings layered
 * feathers instead of flat bars, and drops the flat 58x56 attack burst. */
function drawDivineChoir(ctx, tower, cx, cy, isLeft) {
    const S = 2.0;
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 350;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep    = (Math.sin(now * 0.002) + 1) / 2;
    const flap  = Math.round(Math.sin(now * 0.0022) * 2);
    const ghost = (Math.sin(now * 0.0035) + 1) / 2;

    const CO='#0A0820';
    const W0='#5A5A6A', W1='#9C9CAE', W2='#D0D0E0', W3='#F0F0F8', W4='#FFFFFF';  // white robes
    const G0='#4A3000', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8', G5='#FFFDE8';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -24, -42 + idleY, G3, 48, 74, isLeft, S);
    ctx.restore();

    // ── GREAT GOLD WINGS — four feather courses a side, each course outlined
    //    and lit on its upper edge so the wing has depth instead of reading as
    //    a stack of bars.
    for (let k = 0; k < 2; k++) {
        const sgn = k ? 1 : -1;
        const bx  = k ? 8 : -20;
        const fl  = k ? flap : -flap;
        // `c` is distance from the body in both mirrors. Outer courses start
        // higher and run longer off a common lower edge, which fans the wing
        // open. The first pass had it backwards — outer feathers shorter and
        // lower — so each wing read as a stack of columns.
        for (let c = 0; c < 4; c++) {
            const wx  = bx + (k ? c * 3 : (3 - c) * 3);
            const top = -24 - c * 5 + fl;
            const len = 14 + c * 5;
            p(wx, top, CO, 4, len);
            p(wx + (k ? 1 : 0), top + 1, c % 2 ? G1 : G2, 3, len - 2);
            p(wx + (k ? 1 : 0), top + 1, G4, 3, 1);                              // feather top light
            p(wx + (k ? 1 : 0), top + 2, G3, 3, 2);                              // upper vane
            p(wx + (k ? 1 : 0), top + len - 3, G0, 3, 2);                        // tip shade
        }
        glow(bx + (k ? 9 : 0), -39 + fl, G4, 3, 10, 0.26 + ep * 0.22);
        // wing shoulder joint
        p(k ? 6 : -9, -22 + fl, CO, 4, 8); p(k ? 7 : -8, -21 + fl, G2, 2, 6);
        p(k ? 7 : -8, -21 + fl, G4, 2, 1);
        void sgn;
    }

    // ── GHOST SINGERS at either shoulder
    for (let k = 0; k < 2; k++) {
        const gx = k ? 12 : -17;
        const gy = -12 + Math.round(Math.sin(now * 0.003 + k * 2) * 2);
        ctx.save(); ctx.globalAlpha = 0.26 + ghost * 0.20;
        pUnit(ctx, cx, cy, gx,     gy + idleY,      W2, 5, 5, isLeft, S);        // head
        pUnit(ctx, cx, cy, gx - 1, gy + 6 + idleY,  W2, 7, 9, isLeft, S);        // body
        pUnit(ctx, cx, cy, gx,     gy + 15 + idleY, W1, 5, 4, isLeft, S);        // trailing hem
        ctx.restore();
        p(gx + 1, gy + 2, CO, 1, 1); p(gx + 3, gy + 2, CO, 1, 1);                // eyes
        p(gx + 1, gy + 4, CO, 3, 1);                                             // singing mouth
        glow(gx - 1, gy + 6, W4, 7, 1, 0.20 + ghost * 0.18);
    }

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, W1, 4, 3); p(-6, 23, W3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, W1, 4, 3); p( 2, 23, W3, 4, 1);

    // ── ROBE SKIRT
    p(-8,  4, CO, 16, 19);
    p(-7,  5, W1, 14, 17); p(-6,  5, W2, 12, 16); p(-4,  6, W3, 8, 14);
    p(-7,  5, W4, 14,  1);                                                       // top highlight
    p(-3,  7, W1,  1, 12); p( 2,  7, W1,  1, 12);
    p(-8, 19, CO, 16,  3); p(-7, 20, G2, 14, 2); p(-7, 20, G3, 14, 1);

    // ── CINCTURE
    p(-7,  1, CO, 14, 4); p(-6, 2, G1, 12, 2); p(-6, 2, G3, 12, 1);

    // ── ROBE TORSO
    p(-7,-17, CO, 14, 19);
    p(-6,-16, W1, 12, 17); p(-5,-16, W2, 10, 16); p(-3,-15, W3, 6, 14);
    p(-6,-16, W4, 12,  1);                                                       // top highlight
    // gold stole with a conductor's chevron
    p(-5,-16, G2,  2, 17); p( 3,-16, G2, 2, 17);
    p(-5,-16, G4,  2,  1); p( 3,-16, G4, 2, 1);
    p(-2, -8, CO,  5,  5); p(-1, -7, G3, 3, 3); p(-1, -7, G5, 3, 1);
    glow(-1, -7, G5, 3, 1, 0.55 + ep * 0.30);

    // ── COLLAR
    p(-8,-21, CO, 16, 5); p(-7,-20, W3, 14, 3); p(-7,-20, W4, 14, 1);
    p(-7,-18, G2, 14, 1);

    // ── ARMS raised, conducting
    p(-12,-19, CO, 6, 13); p(-11,-18, W2, 4, 11); p(-11,-18, W4, 4, 1);
    p(-14,-27, CO, 6, 10); p(-13,-26, W2, 4,  8); p(-13,-26, W4, 4, 1);
    p(-14,-30, CO, 6,  5); p(-13,-29, K1, 4,  3); p(-13,-29, K2, 4, 1);
    p(  6,-19, CO, 6, 13); p(  7,-18, W2, 4, 11); p(  7,-18, W4, 4, 1);
    p(  8,-27, CO, 6, 10); p(  9,-26, W2, 4,  8); p(  9,-26, W4, 4, 1);
    p(  8,-30, CO, 6,  5); p(  9,-29, K1, 4,  3); p(  9,-29, K2, 4, 1);

    // ── NECK
    p(-2,-23, CO, 4, 3); p(-1,-22, K0, 2, 2);

    // ── HEAD (serene, eyes closed in song)
    p(-6,-35, CO, 12, 13);
    p(-5,-34, K1, 10, 11); p(-5,-34, K2, 10, 1);
    p( 3,-33, K0,  2,  9);
    p(-4,-30, CO, 3, 1); p( 1,-30, CO, 3, 1);                                    // closed lids
    p(-2,-26, CO, 4, 3); p(-1,-25, '#8A3A46', 2, 2);                             // open in song

    // ── VAST HALO — a wide open ring, brightest at the top
    p(-13,-44, CO, 26, 1); p(-13,-38, CO, 26, 1);
    p(-14,-43, CO,  1, 5); p( 13,-43, CO,  1, 5);
    p(-13,-43, G2, 26, 1); p(-13,-39, G2, 26, 1);
    p(-13,-43, G3, 26, 1);
    p(-13,-42, G1, 26, 1); p(-13,-41, G0, 26, 1);                                // ring interior shade
    glow(-13,-43, G5, 26, 1, 0.48 + ep * 0.30);
    glow(-13,-39, G4, 26, 1, 0.30 + ep * 0.22);

    // ── DRIFTING NOTES between the singers
    for (let i = 0; i < 5; i++) {
        const t  = ((now * 0.0008) + i / 5) % 1;
        const nx = (i % 2 ? 12 : -16) + Math.round(Math.sin(t * 6.28 + i) * 2);
        const ny = -4 - Math.round(t * 22);
        const a  = (1 - t) * 0.85;
        p(nx, ny, G3, 2, 2); p(nx + 2, ny - 4, G3, 1, 5); p(nx + 2, ny - 4, G4, 2, 1);
        glow(nx, ny - 4, G5, 4, 7, a * 0.45);
    }

    if (isAtk) {
        glow(-13,-43, G5, 26, 1, 0.75);
        glow(-1, -7, G5, 3, 3, 0.65);
        for (let k = 0; k < 2; k++) glow(k ? 8 : -20, -39, G5, 12, 5, 0.45);
    }
}

/* SACRED RELIQUARY — 성물 성소 수호자. Marble plate and a sun-halo helm, the
 * golden ark floating between two temple pillars behind him.
 * Lore: 사원 기둥 사이에 부유하는 황금 성궤를 받든, 대리석 갑주와 태양 후광 투구의 성물 수호자. */
function drawSacredReliquary(ctx, tower, cx, cy, isLeft) {
    const S = 2.0;
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 350;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep    = (Math.sin(now * 0.003) + 1) / 2;
    const hover = Math.round(Math.sin(now * 0.0022) * 2);

    const CO='#000';
    const M0='#4A4A52', M1='#8E8E9A', M2='#C6C6D0', M3='#E8E8EE', M4='#FFFFFF';  // marble
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8', G5='#FFFDE8';
    const C2='#22B8E0', C3='#7FE8FF', C4='#DDFAFF';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.15 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -24, -42 + idleY, G3, 48, 74, isLeft, S);
    ctx.restore();

    // ── TEMPLE PILLARS either side — fluted marble on plinths, gold capitals
    for (let k = 0; k < 2; k++) {
        const px = k ? 13 : -21;
        p(px,     -58, CO, 9, 80);
        p(px + 1, -57, M0, 7, 78); p(px + 1, -57, M1, 7, 77);
        p(px + 1, -57, M4, 7,  1);                                               // top highlight
        p(px + 2, -56, M2, 1, 75); p(px + 5, -56, M2, 1, 75);                    // flutes
        p(px + 7, -56, M0, 1, 75);                                               // shaded edge
        p(px - 1, -62, CO, 11, 5); p(px, -61, G1, 9, 3); p(px, -61, G4, 9, 1);   // capital
        p(px - 1,  20, CO, 11, 5); p(px, 21, M1, 9, 3); p(px, 21, M3, 9, 1);     // plinth
    }

    // ── THE GOLDEN ARK, floating between them
    //    Held clear above the helm and between the two capitals. Drawn at the
    //    torso's own height it simply sat behind the body and disappeared.
    const ay = -56 + hover;
    p(-9, ay,      CO, 20, 14);
    p(-8, ay + 1,  G1, 18, 12); p(-7, ay + 2, G2, 16, 10);
    p(-8, ay + 1,  G4, 18,  1);                                                  // lid light
    p(-8, ay + 5,  G0, 18,  1); p(-8, ay + 9, G0, 18, 1);                        // banding
    p(-9, ay - 3,  CO, 20,  4); p(-8, ay - 2, G2, 18, 2); p(-8, ay - 2, G4, 18, 1);
    p(-7, ay + 14, CO, 16,  3); p(-6, ay + 15, G1, 14, 2);                        // base moulding
    // carrying poles through the rings
    p(-14, ay + 6, CO, 30, 3); p(-13, ay + 7, G1, 28, 1);
    // two cherubim facing in over the lid
    for (let k = 0; k < 2; k++) {
        const wx = k ? 3 : -6;
        p(wx, ay - 9, CO, 4, 7); p(wx + 1, ay - 8, G3, 2, 5); p(wx + 1, ay - 8, G5, 2, 1);
        p(wx + (k ? -2 : 3), ay - 8, CO, 3, 5);
        p(wx + (k ? -1 : 3), ay - 7, G2, 1, 3);                                  // folded wing
    }
    glow(-8, ay + 1, G5, 18, 1, 0.45 + ep * 0.30);
    glow(-2, ay + 4, C4,  6, 1, 0.40 + ep * 0.28);                               // presence at the seam

    // ── SABATONS
    p(-9, 22, CO, 8, 5); p(-8, 23, M1, 6, 3); p(-8, 23, M3, 6, 1);
    p( 2, 22, CO, 8, 5); p( 3, 23, M1, 6, 3); p( 3, 23, M3, 6, 1);

    // ── MARBLE GREAVES
    p(-8,  4, CO, 16, 19); p(-7,  5, M0, 14, 17); p(-6,  5, M1, 12, 16);
    p(-4,  6, M2,  8, 14);
    p(-7,  5, M4, 14,  1);                                                       // top highlight
    p(-1,  6, M0,  2, 13);
    p(-8, 19, CO, 16,  3); p(-7, 20, G2, 14, 2); p(-7, 20, G3, 14, 1);

    // ── BELT
    p(-7,  1, CO, 14, 4); p(-6, 2, G1, 12, 2); p(-6, 2, G3, 12, 1);

    // ── MARBLE CUIRASS
    p(-8,-18, CO, 17, 20); p(-7,-17, M0, 15, 18); p(-6,-17, M1, 13, 17);
    p(-4,-16, M2,  9, 15);
    p(-7,-17, M4, 15,  1);                                                       // top highlight
    p( 6,-16, M0,  2, 16);
    p(-2, -9, CO,  5,  5); p(-1, -8, G3, 3, 3); p(-1, -8, G5, 3, 1);
    glow(-1, -8, G5, 3, 1, 0.50 + ep * 0.30);

    // ── PAULDRONS + COLLAR
    p(-13,-21, CO, 7, 9); p(-12,-20, M1, 5, 7); p(-12,-20, M4, 5, 1);
    p(-12,-21, G2,  5, 1);
    p(  6,-21, CO, 7, 9); p(  7,-20, M1, 5, 7); p(  7,-20, M4, 5, 1);
    p(  7,-21, G2,  5, 1);
    p(-6,-22, CO, 12, 3); p(-5,-21, M3, 10, 2); p(-5,-21, M4, 10, 1);

    // ── ARMS raised, bearing the ark up
    p(-12,-19, CO, 6, 14); p(-11,-18, M1, 4, 12); p(-11,-18, M4, 4, 1);
    p(-14,-30, CO, 6, 12); p(-13,-29, M1, 4, 10); p(-13,-29, M4, 4, 1);
    p(-14,-34, CO, 6,  5); p(-13,-33, K1, 4,  3); p(-13,-33, K2, 4, 1);
    p(  6,-19, CO, 6, 14); p(  7,-18, M1, 4, 12); p(  7,-18, M4, 4, 1);
    p(  8,-30, CO, 6, 12); p(  9,-29, M1, 4, 10); p(  9,-29, M4, 4, 1);
    p(  8,-34, CO, 6,  5); p(  9,-33, K1, 4,  3); p(  9,-33, K2, 4, 1);

    // ── NECK + SUN-HALO HELM
    p(-2,-24, CO, 4, 3); p(-1,-23, K0, 2, 2);
    p(-6,-36, CO, 12, 13);
    p(-5,-35, K1, 10, 11); p(-5,-35, K2, 10, 1);
    p( 3,-34, K0,  2,  9);
    p(-4,-31, CO, 3, 2); p( 1,-31, CO, 3, 2);
    p(-3,-31, isAtk ? G5 : M4, 1, 1); p( 2,-31, isAtk ? G5 : M4, 1, 1);
    p(-1,-27, K0, 2, 1);
    p(-7,-38, CO, 14, 4); p(-6,-37, M1, 12, 2); p(-6,-37, M4, 12, 1);            // helm band
    // sun rays radiating off the helm
    for (let i = 0; i < 9; i++) {
        const a  = -Math.PI * (i / 8);
        const rx = Math.round(Math.cos(a) * 11);
        const ry = -38 + Math.round(Math.sin(a) * 7);
        p(rx, ry, CO, 3, 3); p(rx, ry, G3, 2, 2); p(rx, ry, G5, 2, 1);
        glow(rx, ry, G5, 2, 1, 0.42 + ep * 0.26);
    }

    if (isAtk) {
        glow(-8, ay + 1, G5, 18, 14, 0.50);
        glow(-1, -8, G5, 3, 3, 0.60);
    }
}

/* GRAND WARD — 대결계사. Triple ward sphere overhead, six hex runes in orbit,
 * gold-trimmed royal blue.
 * Lore: 머리 위에 떠 있는 3중 결계 구체와 굤도를 도는 시안 육각 룬, 황금 결계의 대결계사.
 * Concept was already right; this redraws it on 5-step ramps and turns the
 * spheres and runes from flat blocks into shaded, outlined forms. */
function drawGrandWard(ctx, tower, cx, cy, isLeft) {
    const S = 2.0;
    const now   = Date.now();
    const idleY = Math.sin(now * 0.002) * 2;
    const ep    = (Math.sin(now * 0.003) + 1) / 2;
    const isAtk = (now - (tower.lastShot || 0)) < 350;
    const p = (ox, oy, col, w = 1, h = 1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };

    const CO='#000';
    const R0='#050B2E', R1='#122062', R2='#2340A8', R3='#4A6FD8', R4='#8FAAF0';  // royal blue
    const G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const C1='#0A6E96', C2='#22B8E0', C3='#7FE8FF', C4='#DDFAFF';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCB4';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -22, -42 + idleY, C2, 44, 74, isLeft, S);
    ctx.restore();

    // ── SIX ORBITING HEX RUNES (outlined rings on a tilted orbit)
    const ang = now * 0.001;
    for (let i = 0; i < 6; i++) {
        const a  = ang + i * (Math.PI / 3);
        const hx = Math.round(Math.cos(a) * 17);
        const hy = Math.round(Math.sin(a) * 9) - 16;
        const front = Math.sin(a) > 0;
        p(hx-1, hy-2, CO, 5, 1); p(hx-2, hy-1, CO, 7, 1);
        p(hx-2, hy+2, CO, 7, 1); p(hx-1, hy+3, CO, 5, 1);
        p(hx-3, hy,   CO, 1, 2); p(hx+3, hy,   CO, 1, 2);
        p(hx-1, hy-1, front ? C2 : C1, 5, 1);
        p(hx-2, hy,   front ? C2 : C1, 7, 2);
        p(hx-1, hy+2, front ? C2 : C1, 5, 1);
        p(hx-1, hy-1, C3, 5, 1);                                                 // lit upper facet
        glow(hx-2, hy-1, C3, 7, 1, (front ? 0.48 : 0.26) + ep * 0.25);
    }

    // ── TRIPLE WARD SPHERE above the head (three shells, each outlined)
    const sp = 0.6 + ep * 0.4;
    p(-8,-52, CO, 16, 12);                                                       // outer shell
    p(-7,-51, R1, 14, 10); p(-7,-51, R3, 14, 1);
    p(-6,-49, CO, 12,  8); p(-5,-48, R2, 10, 6); p(-5,-48, R4, 10, 1);           // middle
    p(-4,-47, CO,  8,  6); p(-3,-46, C1,  6, 4); p(-3,-46, C3,  6, 1);           // core
    p(-1,-45, C4,  2,  2);                                                       // core spark
    glow(-8,-52, C3, 16, 1, 0.45 * sp);                                          // shell rim
    glow(-8,-41, C3, 16, 1, 0.28 * sp);
    glow(-3,-46, C4,  6, 1, 0.55 * sp);                                          // core rim
    glow(-1,-45, C4,  2, 2, 0.60 * sp);
    p(-9,-47, G2, 1, 3); p( 8,-47, G2, 1, 3);                                    // gold retaining pins
    p(-1,-54, G3, 2, 2);

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, R1, 4, 3); p(-6, 23, R3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, R1, 4, 3); p( 2, 23, R3, 4, 1);

    // ── LOWER ROBE
    p(-8,  4, CO, 16, 19);
    p(-7,  5, R0, 14, 17); p(-6,  5, R1, 12, 16); p(-4,  6, R2, 8, 14);
    p(-7,  5, R4, 14,  1);                                                       // top highlight
    p(-3,  7, R0,  1, 12); p( 2,  7, R0,  1, 12);
    p(-8, 19, CO, 16,  3); p(-7, 20, G2, 14,  2); p(-7, 20, G3, 14, 1);

    // ── SASH
    p(-7,  1, CO, 14, 4); p(-6, 2, R2, 12, 2); p(-6, 2, R3, 12, 1);
    p(-2,  0, CO,  5, 5); p(-1, 1, C1,  3, 3); p(-1, 1, C3, 3, 1);
    glow(-1, 1, C4, 3, 3, 0.42 + ep * 0.32);

    // ── TORSO ROBE
    p(-7,-17, CO, 14, 19);
    p(-6,-16, R0, 12, 17); p(-5,-16, R1, 10, 16); p(-3,-15, R2, 6, 14);
    p(-6,-16, R4, 12,  1);                                                       // top highlight
    p(-6,-16, G2,  1, 17); p( 5,-16, G2,  1, 17);                                // gold placket
    // concentric ward emblem
    p(-3,-11, CO, 7, 7); p(-2,-10, R2, 5, 5); p(-2,-10, R4, 5, 1);
    p(-1, -9, C1, 3, 3); p( 0, -8, C4, 1, 1);
    glow( 0, -8, C4, 1, 1, 0.65 + ep * 0.30);                                    // point, not a block

    // ── GOLD COLLAR
    p(-7,-20, CO, 14, 4); p(-6,-19, G2, 12, 2); p(-6,-19, G4, 12, 1);

    // ── SLEEVES raised wide, holding the sphere up (set outside the torso)
    p(-13,-19, CO, 7, 13); p(-12,-18, R1, 5, 11); p(-12,-18, R2, 4, 10);
    p(-12,-18, R4,  5, 1);                                                       // top highlight
    p(-15,-28, CO, 7, 11); p(-14,-27, R1, 5,  9); p(-14,-27, R2, 4, 8);
    p(-14,-27, R4,  5, 1);
    p(-15,-32, CO, 7,  5); p(-14,-31, K1, 5,  3); p(-14,-31, K2, 5, 1);
    p(  6,-19, CO, 7, 13); p(  7,-18, R1, 5, 11); p(  7,-18, R2, 4, 10);
    p(  7,-18, R4,  5, 1);
    p(  8,-28, CO, 7, 11); p(  9,-27, R1, 5,  9); p(  9,-27, R2, 4, 8);
    p(  9,-27, R4,  5, 1);
    p(  8,-32, CO, 7,  5); p(  9,-31, K1, 5,  3); p(  9,-31, K2, 5, 1);

    // ── NECK
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);

    // ── HEAD
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-4,-29, CO, 3, 2); p( 1,-29, CO, 3, 2);
    p(-3,-29, isAtk ? C4 : C3, 1, 1); p( 2,-29, isAtk ? C4 : C3, 1, 1);
    p(-1,-25, K0, 2, 1);

    // ── GRAND CIRCLET (gold band, three cyan crystal points)
    p(-7,-37, CO, 14, 4); p(-6,-36, G2, 12, 2); p(-6,-36, G4, 12, 1);
    p(-5,-40, CO, 3, 4); p(-4,-39, C2, 1, 3);
    p(-1,-42, CO, 3, 6); p( 0,-41, C3, 1, 5);
    p( 3,-40, CO, 3, 4); p( 4,-39, C2, 1, 3);
    glow(-1,-42, C4, 3, 6, 0.40 + ep * 0.32);

    if (isAtk) {
        glow(-8,-52, C4, 16, 1, 0.70); glow(-8,-41, C4, 16, 1, 0.55);
        glow(-3,-46, C4,  6, 1, 0.70);
        for (let i = 0; i < 6; i++) {
            const a = ang + i * (Math.PI / 3);
            glow(Math.round(Math.cos(a) * 17) - 2, Math.round(Math.sin(a) * 9) - 17, C4, 7, 1, 0.60);
        }
    }
}

window.drawDivineChoir      = drawDivineChoir;
window.drawSacredReliquary  = drawSacredReliquary;
window.drawGrandWard        = drawGrandWard;
