/* pix_tier3_support.js – Tier 3 Exorcists: SUPPORT Path
 * Executor · Binder · AbsoluteZero · Permafrost · Seer · Commander
 */

/* ══════════════════════════════════════════════════════════ drawExecutor ═══ */
/* EXECUTOR — 명계의 집행자. Black headsman's mask, the scales of fate held out,
 * deep violet court robe.
 * Lore: 검은 형리 가면에 운명의 천칭을 들고 짙은 보랏빛 도포를 입은 집행자. */
function drawExecutor(cx, cy, tower) {
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
    const tilt = Math.round(Math.sin(now * 0.0026) * 1);                         // scales sway

    const CO='#000';
    const V0='#180A2A', V1='#33165E', V2='#54269A', V3='#7E4AD0', V4='#B48CF0';  // violet robe
    const N0='#08080E', N1='#1A1A24', N2='#30303C', N3='#4E4E5E';                // black mask
    const G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';                // brass scales
    const E2='#22A8E0', E3='#7FDCFF', E4='#DDF4FF';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -19, -36 + idleY, V3, 38, 64, isLeft, S);
    ctx.restore();

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, V1, 4, 3); p(-6, 23, V3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, V1, 4, 3); p( 2, 23, V3, 4, 1);

    // ── COURT ROBE (wide, formal)
    p(-9,  4, CO, 18, 19);
    p(-8,  5, V0, 16, 17); p(-7,  5, V1, 14, 16); p(-5,  6, V2, 10, 14);
    p(-8,  5, V4, 16,  1);                                                       // top highlight
    p(-3,  7, V0,  1, 12); p( 3,  7, V0,  1, 12);
    p(-9, 19, CO, 18,  3); p(-8, 20, G2, 16, 2); p(-8, 20, G3, 16, 1);

    // ── SASH
    p(-8,  1, CO, 16, 4); p(-7, 2, N1, 14, 2); p(-7, 2, N3, 14, 1);

    // ── ROBE TORSO with a broad formal collar
    p(-7,-17, CO, 14, 19);
    p(-6,-16, V0, 12, 17); p(-5,-16, V1, 10, 16); p(-3,-15, V2, 6, 14);
    p(-6,-16, V4, 12,  1);                                                       // top highlight
    p(-6,-16, N1,  3, 11); p( 3,-16, N1, 3, 11);                                 // black lapels
    p(-6,-16, N3,  3,  1); p( 3,-16, N3, 3, 1);
    p(-9,-20, CO, 18, 4); p(-8,-19, N1, 16, 2); p(-8,-19, N3, 16, 1);

    // ── SLEEVES, right arm out holding the scales
    p(-12,-15, CO, 6, 15); p(-11,-14, V1, 4, 13); p(-11,-14, V3, 4, 1);
    p(-12,  1, CO, 6,  5); p(-11,  2, N2, 4,  3);
    p(  6,-16, CO, 6, 10); p(  7,-15, V1, 4,  8); p(  7,-15, V3, 4, 1);
    p(  8,-24, CO, 6, 10); p(  9,-23, V1, 4,  8); p(  9,-23, V3, 4, 1);
    p(  8,-27, CO, 6,  5); p(  9,-26, N2, 4,  3); p(  9,-26, N3, 4, 1);

    // ── SCALES OF FATE — beam, centre post, two pans on chains, tilting
    p(10,-32, CO, 3, 6); p(11,-31, G2, 1, 4);                                    // post
    p( 3,-34, CO, 17, 3); p( 4,-33, G2, 15, 1); p( 4,-33, G4, 15, 1);            // beam
    p(11,-36, CO, 3, 3); p(11,-35, G3, 2, 1);                                    // pivot
    // left pan
    pChain(p,  5, -32,  5, -27, 3, G1, G3);
    p( 2,-26 + tilt, CO, 8, 3); p( 3,-25 + tilt, G2, 6, 2); p( 3,-25 + tilt, G4, 6, 1);
    glow( 3,-25 + tilt, E3, 6, 1, 0.35 + ep * 0.25);
    // right pan
    pChain(p, 17, -32, 17, -29, 3, G1, G3);
    p(14,-28 - tilt, CO, 8, 3); p(15,-27 - tilt, G2, 6, 2); p(15,-27 - tilt, G4, 6, 1);
    glow(15,-27 - tilt, V4, 6, 1, 0.35 + ep * 0.25);

    // ── NECK + BLACK HEADSMAN'S MASK (hood with two slits, no face)
    p(-2,-22, CO, 4, 3); p(-1,-21, N0, 2, 2);
    p(-7,-35, CO, 14, 15);
    p(-6,-34, N0, 12, 13); p(-5,-34, N1, 10, 12); p(-4,-33, N2, 7, 10);
    p(-6,-34, N3, 12,  1);                                                       // top highlight
    p( 4,-33, N0,  2, 10);
    p(-5,-29, CO,  4,  2); p( 2,-29, CO, 4, 2);                                  // eye slits
    p(-4,-29, isAtk ? E4 : E2, 2, 1); p( 3,-29, isAtk ? E4 : E2, 2, 1);
    glow(-4,-29, E3, 2, 1, 0.65 + ep * 0.28);
    glow( 3,-29, E3, 2, 1, 0.65 + ep * 0.28);
    p(-6,-24, N0, 12,  2);                                                       // mask hem
    p(-2,-38, CO,  5, 4); p(-1,-37, G2, 3, 2); p(-1,-37, G4, 3, 1);              // brass brow badge

    if (isAtk) {
        glow( 3,-34, G4, 17, 3, 0.55);
        glow(-4,-29, E4, 2, 1, 0.90); glow(3,-29, E4, 2, 1, 0.90);
    }
}

/* ════════════════════════════════════════════════════════════ drawBinder ═══ */
/* BINDER — 영혼의 속박자. Grey-violet robe, soul chain wound round both hands,
 * silent behind a low hood.
 * Lore: 회보랏빛 로브에 영혼의 사슬을 양손에 휘감은 침묵의 속박자. */
function drawBinder(cx, cy, tower) {
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
    const ep    = (Math.sin(now * 0.004) + 1) / 2;
    const surge = (now % 1100) / 1100;
    const slack = Math.round(Math.sin(now * 0.003) * 1);

    const CO='#000';
    const P0='#221A30', P1='#463A60', P2='#726592', P3='#A899C0', P4='#DCD2EC';  // grey-violet
    const N1='#1E1E28', N3='#52525E';                                            // chain iron
    const E1='#0A5E96', E2='#22A8E0', E3='#7FDCFF', E4='#DDF4FF';                // soul blue
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -19, -34 + idleY, E2, 38, 62, isLeft, S);
    ctx.restore();

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, P1, 4, 3); p(-6, 23, P3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, P1, 4, 3); p( 2, 23, P3, 4, 1);

    // ── ROBE SKIRT
    p(-8,  4, CO, 16, 19);
    p(-7,  5, P0, 14, 17); p(-6,  5, P1, 12, 16); p(-4,  6, P2, 8, 14);
    p(-7,  5, P4, 14,  1);                                                       // top highlight
    p(-3,  7, P0,  1, 12); p( 2,  7, P0,  1, 12);
    p(-8, 19, CO, 16,  3); p(-7, 20, P2, 14, 2); p(-7, 20, P4, 14, 1);

    // ── SASH
    p(-7,  1, CO, 14, 4); p(-6, 2, P2, 12, 2); p(-6, 2, P4, 12, 1);

    // ── ROBE TORSO
    p(-7,-17, CO, 14, 19);
    p(-6,-16, P0, 12, 17); p(-5,-16, P1, 10, 16); p(-3,-15, P2, 6, 14);
    p(-6,-16, P4, 12,  1);                                                       // top highlight
    p(-2,-11, CO,  5,  5); p(-1,-10, E1, 3, 3); p(-1,-10, E3, 3, 1);             // soul seal
    glow(-1,-10, E4, 3, 1, 0.55 + ep * 0.32);

    // ── COLLAR
    p(-7,-20, CO, 14, 4); p(-6,-19, P2, 12, 2); p(-6,-19, P4, 12, 1);

    // ── SLEEVES, both hands forward and open
    p(-13,-15, CO, 7, 14); p(-12,-14, P1, 5, 12); p(-12,-14, P3, 4, 11);
    p(-12,-14, P4,  5, 1);
    p(-14, -2, CO, 6,  5); p(-13, -1, K1, 4,  3); p(-13, -1, K2, 4, 1);
    p(  6,-15, CO, 7, 14); p(  7,-14, P1, 5, 12); p(  7,-14, P3, 4, 11);
    p(  7,-14, P4,  5, 1);
    p(  8, -2, CO, 6,  5); p(  9, -1, K1, 4,  3); p(  9, -1, K2, 4, 1);

    // ── SOUL CHAIN wound round both fists and slung between them
    pChain(p, -14, -4, -10,  2, 4, N1, N3);                                      // wound, left fist
    pChain(p,   8, -4, 12,   2, 4, N1, N3);                                      // wound, right fist
    pChain(p, -11,  2,  9, 6 + slack, 9, N1, N3);                                // slung between
    // spirit-fire travelling the slung span
    for (let i = 0; i < 4; i++) {
        const t  = (surge + i / 4) % 1;
        glow(Math.round(-11 + 20 * t), Math.round(2 + (4 + slack) * t), E3, 3, 2, (1 - t) * 0.85);
    }

    // ── NECK + FACE inside a low hood
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);
    p(-5,-32, CO, 10, 11); p(-4,-31, K1, 8, 9); p(-4,-31, K2, 8, 1);
    p( 2,-30, K0,  2,  7);
    p(-3,-28, CO, 3, 2); p( 1,-28, CO, 3, 2);
    p(-2,-28, isAtk ? E4 : E3, 1, 1); p( 2,-28, isAtk ? E4 : E3, 1, 1);
    p(-2,-24, P1, 4, 1);                                                         // closed mouth

    // ── HOOD
    p(-8,-38, CO, 16, 8); p(-7,-37, P0, 14, 6); p(-6,-36, P1, 12, 5);
    p(-7,-37, P3, 14,  1);                                                       // top highlight
    p(-9,-33, CO,  3, 8); p(-8,-32, P0, 1, 7);
    p( 7,-33, CO,  3, 8); p( 8,-32, P0, 1, 7);
    pChain(p, -7, -34, 6, -34, 6, N1, N3);                                       // chain brow band

    if (isAtk) {
        glow(-11, 2, E4, 20, 6, 0.45);
        glow(-1,-10, E4, 3, 3, 0.60);
    }
}

/* ══════════════════════════════════════════════════════ drawAbsoluteZero ═══ */
/* ABSOLUTE ZERO — 절대영도 마법사. Deep blue robe, a crown grown out of ice
 * crystal, and frost spreading from every step.
 * Lore: 빙결 결정 왕관에 새파란 로브, 발자국마다 얼음이 어는 마법사. */
function drawAbsoluteZero(cx, cy, tower) {
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
    const ep    = (Math.sin(now * 0.004) + 1) / 2;
    const creep = (now % 2400) / 2400;

    const CO='#000';
    const B0='#04122E', B1='#0A2A6E', B2='#1450B4', B3='#3C84E0', B4='#8CC0F8';  // deep blue
    const C1='#0A6E96', C2='#22B8E0', C3='#7FE8FF', C4='#DDFAFF';                // ice
    const W2='#C8DCE8', W3='#EAF6FF', W4='#FFFFFF';                              // rime
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -20, -38 + idleY, C2, 40, 68, isLeft, S);
    ctx.restore();

    // ── ICE UNDERFOOT — plates spreading out from where he stands, creeping
    //    outward on a slow cycle. This is the lore's whole signature.
    for (let i = 0; i < 6; i++) {
        const t  = (creep + i / 6) % 1;
        const ix = -12 + i * 5;
        const iw = 4 + Math.round(t * 3);
        p(ix, 24, CO, iw + 1, 3);
        p(ix, 24, W2, iw, 2); p(ix, 24, W3, iw, 1);
        glow(ix, 24, C4, iw, 1, (1 - t) * 0.55);
    }
    p(-10, 22, W2, 4, 1); p( 4, 22, W2, 4, 1);                                   // rime shards

    // ── SHOES
    p(-7, 19, CO, 6, 5); p(-6, 20, B1, 4, 3); p(-6, 20, B3, 4, 1);
    p( 1, 19, CO, 6, 5); p( 2, 20, B1, 4, 3); p( 2, 20, B3, 4, 1);

    // ── ROBE
    p(-9,  3, CO, 18, 18);
    p(-8,  4, B0, 16, 16); p(-7,  4, B1, 14, 15); p(-5,  5, B2, 10, 13);
    p(-8,  4, B4, 16,  1);                                                       // top highlight
    p(-3,  6, B0,  1, 12); p( 3,  6, B0,  1, 12);
    p(-9, 18, CO, 18,  3); p(-8, 19, W2, 16, 2); p(-8, 19, W3, 16, 1);           // rimed hem

    // ── SASH
    p(-8,  0, CO, 16, 4); p(-7, 1, C1, 14, 2); p(-7, 1, C3, 14, 1);
    p(-2, -1, CO,  5, 5); p(-1, 0, C2,  3, 3); p(-1, 0, C4, 3, 1);
    glow(-1, 0, C4, 3, 1, 0.55 + ep * 0.32);

    // ── TORSO
    p(-7,-17, CO, 14, 19); p(-6,-16, B0, 12, 17); p(-5,-16, B1, 10, 16);
    p(-6,-16, B4, 12,  1);                                                       // top highlight
    p(-3,-15, B2,  6, 14);
    p(-2, -8, CO,  5,  6); p(-1, -7, C1, 3, 4); p(-1, -7, C3, 3, 1);
    glow(-1, -7, C4, 3, 1, 0.55 + ep * 0.32);
    // frost creeping up the robe
    for (let i = 0; i < 4; i++) p(-5 + i * 3, -2 - (i % 2) * 2, W2, 1, 2);

    // ── COLLAR + SLEEVES
    p(-8,-20, CO, 16, 4); p(-7,-19, W2, 14, 2); p(-7,-19, W4, 14, 1);
    p(-13,-16, CO, 7, 16); p(-12,-15, B1, 5, 14); p(-12,-15, B3, 4, 13);
    p(-12,-15, B4,  5, 1);
    p(-12,  1, CO, 6,  5); p(-11,  2, K1, 4,  3); p(-11, 2, K2, 4, 1);
    p(  6,-16, CO, 7, 16); p(  7,-15, B1, 5, 14); p(  7,-15, B3, 4, 13);
    p(  7,-15, B4,  5, 1);
    p(  7,  1, CO, 6,  5); p(  8,  2, K1, 4,  3); p(  8, 2, K2, 4, 1);

    // ── NECK + HEAD
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-4,-29, CO, 3, 2); p( 1,-29, CO, 3, 2);
    p(-3,-29, isAtk ? C4 : C3, 1, 1); p( 2,-29, isAtk ? C4 : C3, 1, 1);
    p(-1,-25, K0, 2, 1);
    p(-5,-31, W2, 10, 1);                                                        // rime on the brow

    // ── CROWN OF ICE CRYSTAL — five shards grown, not forged
    p(-8,-37, CO, 16, 4); p(-7,-36, C1, 14, 2); p(-7,-36, C3, 14, 1);
    for (let i = 0; i < 5; i++) {
        const sx = -7 + i * 3;
        const sh = (i === 2) ? 9 : (i % 2 ? 5 : 7);
        p(sx, -37 - sh, CO, 3, sh + 1);
        p(sx + 1, -36 - sh, C2, 1, sh);
        p(sx + 1, -36 - sh, C4, 1, 2);                                           // lit tip
        glow(sx + 1, -36 - sh, C4, 1, 2, 0.45 + ep * 0.28);
    }

    if (isAtk) {
        for (let i = 0; i < 5; i++) glow(-6 + i * 3, -45, C4, 1, 4, 0.65);
        glow(-1, -7, C4, 3, 4, 0.60);
        for (let i = 0; i < 6; i++) glow(-12 + i * 5, 24, C4, 5, 1, 0.55);
    }
}

/* ═══════════════════════════════════════════════════════ drawPermafrost ═══ */
/* PERMAFROST MAIDEN — 빙결 처녀. Silver-white dress, a veil of snowflakes, a
 * blizzard turning off her fingertips.
 * Lore: 백은 드레스에 눈송이 면사포, 손끝에서 눈보라가 휘몰아치는 처녀. */
function drawPermafrost(cx, cy, tower) {
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
    const ep    = (Math.sin(now * 0.004) + 1) / 2;
    const storm = now * 0.0016;

    const CO='#000';
    const W0='#5A6E80', W1='#8EA8BC', W2='#C2DCEC', W3='#E6F6FF', W4='#FFFFFF';  // silver-white
    const C1='#0A6E96', C2='#22B8E0', C3='#7FE8FF', C4='#DDFAFF';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -20, -36 + idleY, C3, 40, 66, isLeft, S);
    ctx.restore();

    // ── SHOES
    p(-6, 22, CO, 5, 5); p(-5, 23, W1, 3, 3); p(-5, 23, W3, 3, 1);
    p( 1, 22, CO, 5, 5); p( 2, 23, W1, 3, 3); p( 2, 23, W3, 3, 1);

    // ── DRESS (bell skirt, widening in courses)
    p(-6,  2, CO, 13, 6); p(-5,  3, W1, 11, 4); p(-5,  3, W3, 11, 1);
    p(-8,  7, CO, 17, 7); p(-7,  8, W1, 15, 5); p(-7,  8, W2, 15, 1);
    p(-10, 13, CO, 21, 9); p(-9, 14, W0, 19, 7); p(-8, 14, W1, 17, 6);
    p(-9, 14, W3, 19,  1);                                                       // top highlight
    p(-5, 15, W2, 11,  5);                                                       // lit front panel
    p(-10, 21, CO, 21, 3); p(-9, 22, W2, 19, 2); p(-9, 22, W4, 19, 1);           // frosted hem
    for (let i = 0; i < 5; i++) p(-7 + i * 4, 16, W0, 1, 5);                     // pleat shadows

    // ── WAIST
    p(-6,  0, CO, 13, 3); p(-5, 1, C1, 11, 2); p(-5, 1, C3, 11, 1);
    p(-2, -1, CO,  5, 4); p(-1, 0, C2,  3, 2); p(-1, 0, C4, 3, 1);
    glow(-1, 0, C4, 3, 1, 0.55 + ep * 0.32);

    // ── BODICE
    p(-6,-16, CO, 13, 17); p(-5,-15, W0, 11, 15); p(-4,-15, W1, 9, 14);
    p(-5,-15, W4, 11,  1);                                                       // top highlight
    p(-2,-14, W2,  5, 13);
    p(-2, -8, CO,  5,  5); p(-1, -7, C1, 3, 3); p(-1, -7, C3, 3, 1);             // frost brooch
    glow(-1, -7, C4, 3, 1, 0.50 + ep * 0.30);

    // ── SHOULDERS + ARMS, both hands out
    p(-9,-19, CO, 18, 4); p(-8,-18, W2, 16, 2); p(-8,-18, W4, 16, 1);
    p(-12,-15, CO, 6, 14); p(-11,-14, W1, 4, 12); p(-11,-14, W3, 4, 1);
    p(-14, -3, CO, 6,  5); p(-13, -2, K1, 4,  3); p(-13, -2, K2, 4, 1);
    p(  6,-15, CO, 6, 14); p(  7,-14, W1, 4, 12); p(  7,-14, W3, 4, 1);
    p(  8, -3, CO, 6,  5); p(  9, -2, K1, 4,  3); p(  9, -2, K2, 4, 1);

    // ── BLIZZARD off both hands — flakes on circular tracks, the far ones dim
    for (let i = 0; i < 10; i++) {
        const k  = i % 2;
        const a  = storm + i * 0.63;
        const hx = (k ? 11 : -11) + Math.round(Math.cos(a) * 7);
        const hy = -1 + Math.round(Math.sin(a) * 6);
        const front = Math.sin(a) > 0;
        p(hx, hy, W3, 1, 1);
        glow(hx, hy, C4, 1, 1, (front ? 0.70 : 0.35) + ep * 0.20);
        if (i % 3 === 0) { p(hx-1, hy, W2, 3, 1); p(hx, hy-1, W2, 1, 3); }       // flake arms
    }

    // ── NECK + HEAD
    p(-2,-21, CO, 4, 3); p(-1,-20, K0, 2, 2);
    p(-6,-33, CO, 12, 13);
    p(-5,-32, K1, 10, 11); p(-5,-32, K2, 10, 1);
    p( 3,-31, K0,  2,  9);
    p(-4,-28, CO, 3, 2); p( 1,-28, CO, 3, 2);
    p(-3,-28, isAtk ? C4 : C3, 1, 1); p( 2,-28, isAtk ? C4 : C3, 1, 1);
    p(-1,-24, K0, 2, 1);

    // ── SNOWFLAKE VEIL — a sheer fall either side of the face with flakes
    //    caught in it, and a flake circlet holding it on.
    p(-8,-36, CO, 16, 5); p(-7,-35, W2, 14, 3); p(-7,-35, W4, 14, 1);
    p(-9,-32, CO,  3,14); p(-8,-31, W1, 1, 13);
    p( 7,-32, CO,  3,14); p( 8,-31, W1, 1, 13);
    ctx.save(); ctx.globalAlpha = 0.30 + ep * 0.14;
    pUnit(ctx, cx, cy, -8, -32 + idleY, W2, 16, 13, isLeft, S);                  // sheer panel
    ctx.restore();
    for (let i = 0; i < 5; i++) {
        const fx = -7 + i * 4, fy = -30 + (i % 2) * 5;
        p(fx, fy, W4, 1, 1); p(fx-1, fy, W3, 3, 1); p(fx, fy-1, W3, 1, 3);
        glow(fx, fy, C4, 1, 1, 0.35 + ep * 0.25);
    }
    p(-2,-39, CO, 5, 4); p(-1,-38, C2, 3, 2); p(-1,-38, C4, 3, 1);               // circlet flake
    glow(-1,-38, C4, 3, 1, 0.55 + ep * 0.30);

    if (isAtk) {
        glow(-14, -6, C4, 10, 10, 0.45); glow(8, -6, C4, 10, 10, 0.45);
        glow(-1, -7, C4, 3, 3, 0.60);
    }
}

/* ══════════════════════════════════════════════════════════════ drawSeer ═══ */
/* SEER OF TRUTH — 진실의 탐구자. Deep purple robe, the truth-eye amulet at the
 * throat, a third eye open on the forehead.
 * Lore: 짙은 자색 로브에 진실의 눈동자 부적, 이마의 세 번째 눈이 빛나는 탐구자. */
function drawSeer(cx, cy, tower) {
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
    const ep    = (Math.sin(now * 0.004) + 1) / 2;
    const blink = (now % 4200) / 4200;
    const spin  = now * 0.0012;

    const CO='#000';
    const V0='#1A0A2E', V1='#3A1660', V2='#5E2A9E', V3='#8B4ED4', V4='#C093F0';  // deep purple
    const C1='#0A6E96', C2='#22B8E0', C3='#7FE8FF', C4='#DDFAFF';                // truth cyan
    const G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const W3='#EDEDF6', W4='#FFFFFF';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -19, -36 + idleY, V3, 38, 64, isLeft, S);
    ctx.restore();

    // ── THREE TRUTH MOTES circling the head
    for (let i = 0; i < 3; i++) {
        const a  = spin + i * (Math.PI * 2 / 3);
        const mx = Math.round(Math.cos(a) * 13);
        const my = -34 + Math.round(Math.sin(a) * 6);
        p(mx, my, C2, 1, 1);
        glow(mx, my, C4, 1, 1, (Math.sin(a) > 0 ? 0.70 : 0.32) + ep * 0.22);
    }

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, V1, 4, 3); p(-6, 23, V3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, V1, 4, 3); p( 2, 23, V3, 4, 1);

    // ── ROBE SKIRT
    p(-9,  4, CO, 18, 19);
    p(-8,  5, V0, 16, 17); p(-7,  5, V1, 14, 16); p(-5,  6, V2, 10, 14);
    p(-8,  5, V4, 16,  1);                                                       // top highlight
    p(-3,  7, V0,  1, 12); p( 3,  7, V0,  1, 12);
    p(-9, 19, CO, 18,  3); p(-8, 20, G2, 16, 2); p(-8, 20, G3, 16, 1);
    // eye motifs woven into the hem
    for (let i = 0; i < 4; i++) { p(-6 + i * 4, 14, CO, 3, 2); p(-5 + i * 4, 14, C1, 1, 1); }

    // ── SASH
    p(-8,  1, CO, 16, 4); p(-7, 2, V2, 14, 2); p(-7, 2, V4, 14, 1);

    // ── ROBE TORSO
    p(-7,-17, CO, 14, 19);
    p(-6,-16, V0, 12, 17); p(-5,-16, V1, 10, 16); p(-3,-15, V2, 6, 14);
    p(-6,-16, V4, 12,  1);                                                       // top highlight

    // ── COLLAR + TRUTH-EYE AMULET at the throat
    p(-7,-20, CO, 14, 4); p(-6,-19, V2, 12, 2); p(-6,-19, V4, 12, 1);
    p(-3,-16, CO, 7, 6); p(-2,-15, G2, 5, 4); p(-2,-15, G4, 5, 1);               // gold setting
    p(-1,-14, CO, 3, 2); p(-1,-14, W4, 3, 1);                                    // sclera
    p( 0,-14, C1, 1, 1);                                                         // iris
    glow( 0,-14, C4, 1, 1, 0.70 + ep * 0.28);

    // ── SLEEVES
    p(-13,-16, CO, 7, 16); p(-12,-15, V1, 5, 14); p(-12,-15, V3, 4, 13);
    p(-12,-15, V4,  5, 1);
    p(-12,  1, CO, 6,  5); p(-11,  2, K1, 4,  3); p(-11, 2, K2, 4, 1);
    p(  6,-16, CO, 7, 16); p(  7,-15, V1, 5, 14); p(  7,-15, V3, 4, 13);
    p(  7,-15, V4,  5, 1);
    p(  7,  1, CO, 6,  5); p(  8,  2, K1, 4,  3); p(  8, 2, K2, 4, 1);

    // ── NECK + HEAD
    p(-2,-21, CO, 4, 3); p(-1,-20, K0, 2, 2);
    //    A course taller than the other robed units: the third eye needs clear
    //    forehead above the mortal pair, and the hood brim has to clear it.
    p(-6,-36, CO, 12, 15);
    p(-5,-35, K1, 10, 13); p(-5,-35, K2, 10, 1);
    p( 3,-34, K0,  2, 11);
    p(-4,-27, CO, 3, 2); p( 1,-27, CO, 3, 2);                                    // mortal eyes
    p(-3,-27, W4, 1, 1); p( 2,-27, W4, 1, 1);
    p(-1,-23, K0, 2, 1);

    // ── THE THIRD EYE, vertical, on clear brow above the mortal pair
    const lid = blink > 0.95 ? 1 : 0;
    p(-2,-34, CO, 5, 6);
    if (!lid) {
        p(-1,-33, W4, 3, 4);                                                     // sclera
        p(-1,-33, C1, 3, 1);                                                     // lid shadow
        p(-1,-32, C1, 3, 2); p( 0,-32, CO, 1, 1);                                // iris + pupil
        glow(-1,-33, C4, 3, 1, 0.70 + ep * 0.28);
        glow( 0,-32, C4, 1, 1, 0.60);
    } else {
        p(-1,-32, K0, 3, 2);
    }

    // ── HOOD (brim lifted clear of the third eye)
    p(-8,-43, CO, 16, 7); p(-7,-42, V0, 14, 5); p(-7,-42, V2, 14, 1);
    p(-9,-38, CO,  3, 8); p(-8,-37, V0, 1, 7);
    p( 7,-38, CO,  3, 8); p( 8,-37, V0, 1, 7);
    p(-2,-46, CO,  5, 4); p(-1,-45, C1, 3, 2); p(-1,-45, C3, 3, 1);              // hood stone
    glow(-1,-45, C4, 3, 1, 0.50 + ep * 0.30);

    if (isAtk) {
        glow(-1,-33, C4, 3, 5, 0.85);
        glow( 0,-14, C4, 1, 1, 0.90);
    }
}

/* ════════════════════════════════════════════════════════ drawCommander ═══ */
/* BATTLEFIELD COMMANDER — 전장 사령관. Red cape, gold pauldron plate, the holy
 * war banner raised.
 * Lore: 붉은 망토에 황금 견장 갑주, 신성한 군기를 높이 든 사령관. */
function drawCommander(cx, cy, tower) {
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
    const ep  = (Math.sin(now * 0.004) + 1) / 2;
    const fly = Math.round(Math.sin(now * 0.0034) * 1);                          // banner ripple

    const CO='#000';
    const R0='#2A0408', R1='#6A0C14', R2='#A81824', R3='#E0343C', R4='#FF7A72';  // red cape
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8', G5='#FFFDE8';
    const T1='#767E92', T2='#B6BECE', T3='#E2E8F2', T4='#FFFFFF';                // steel
    const W3='#EDEDF6', W4='#FFFFFF';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -20, -36 + idleY, G3, 40, 64, isLeft, S);
    ctx.restore();

    // ── RED CAPE behind
    for (let c = 0; c < 3; c++) {
        const wx  = -16 + c * 3;
        const top = -19 + c * 2;
        const len = 34 - c * 4;
        p(wx, top, CO, 4, len);
        p(wx, top + 1, c % 2 ? R0 : R1, 3, len - 2);
        p(wx, top + 1, R3, 3, 1);                                                // cape top light
    }

    // ── SABATONS
    p(-9, 22, CO, 8, 5); p(-8, 23, T1, 6, 3); p(-8, 23, T3, 6, 1);
    p( 2, 22, CO, 8, 5); p( 3, 23, T1, 6, 3); p( 3, 23, T3, 6, 1);

    // ── GREAVES
    p(-8,  4, CO, 16, 19); p(-7,  5, T1, 14, 17); p(-5,  6, T2, 10, 15);
    p(-7,  5, T4, 14,  1);                                                       // top highlight
    p(-1,  6, R0,  2, 13);
    p(-8, 19, CO, 16,  3); p(-7, 20, G2, 14, 2); p(-7, 20, G3, 14, 1);

    // ── BELT
    p(-8,  1, CO, 16, 4); p(-7, 2, G1, 14, 2); p(-7, 2, G3, 14, 1);

    // ── CUIRASS with a red surcoat panel
    p(-8,-18, CO, 17, 20); p(-7,-17, T1, 15, 18); p(-5,-16, T2, 11, 16);
    p(-7,-17, T4, 15,  1);                                                       // top highlight
    p( 6,-16, T1,  2, 16);
    p(-3,-16, R1,  7, 18); p(-2,-15, R2, 5, 16); p(-2,-15, R4, 5, 1);            // surcoat
    p(-2, -9, CO,  5,  5); p(-1, -8, G3, 3, 3); p(-1, -8, G5, 3, 1);
    glow(-1, -8, G5, 3, 1, 0.50 + ep * 0.30);

    // ── GOLD PAULDRONS (the lore's named feature)
    p(-15,-22, CO, 9, 11); p(-14,-21, G1, 7, 9); p(-14,-21, G4, 7, 1);
    p(-14,-19, G2,  7,  5); p(-13,-25, CO, 5, 4); p(-12,-24, G3, 3, 2);
    p(  7,-22, CO, 9, 11); p(  8,-21, G1, 7, 9); p(  8,-21, G4, 7, 1);
    p(  8,-19, G2,  7,  5); p( 10,-25, CO, 5, 4); p( 11,-24, G3, 3, 2);

    // ── COLLAR
    p(-6,-22, CO, 12, 3); p(-5,-21, T3, 10, 2); p(-5,-21, T4, 10, 1);

    // ── ARMS, right raised to the banner staff
    p(-13,-14, CO, 6, 13); p(-12,-13, T1, 4, 11); p(-12,-13, T3, 4, 1);
    p(-13, -2, CO, 6,  5); p(-12, -1, K1, 4,  3); p(-12, -1, K2, 4, 1);
    p(  7,-15, CO, 6, 10); p(  8,-14, T1, 4,  8); p(  8,-14, T3, 4, 1);
    p(  9,-24, CO, 6, 11); p( 10,-23, T1, 4,  9); p( 10,-23, T3, 4, 1);
    p(  9,-27, CO, 6,  5); p( 10,-26, K1, 4,  3); p( 10,-26, K2, 4, 1);

    // ── HOLY WAR BANNER raised high
    p(11,-52, CO, 4, 62); p(12,-51, G1, 2, 60); p(12,-51, G3, 2, 1);             // staff
    p(11,-58, CO, 4,  7); p(12,-57, G3, 2, 5); p(12,-57, G5, 2, 2);              // spear finial
    p(10,-56, CO, 6,  3); p(11,-55, G2, 4, 1);                                   // cross bar
    // cloth, rippling
    p(14,-50, CO, 16, 26);
    p(15,-49, W3, 14, 24); p(15,-49, W4, 14, 1);                                 // field
    p(15,-49, R1, 14,  2); p(15,-27, R1, 14, 2);                                 // red borders
    p(19,-45, CO,  4, 16); p(20,-44, G3, 2, 14);                                 // gold cross
    p(15,-39, CO, 14,  4); p(16,-38, G3, 12, 2);
    for (let i = 0; i < 5; i++) p(29, -48 + i * 5 + (i % 2 ? fly : -fly), W3, 2, 3);  // ragged fly edge
    glow(20,-44, G5, 2, 14, 0.35 + ep * 0.26);
    glow(16,-38, G5, 12, 2, 0.35 + ep * 0.26);

    // ── NECK + HEAD
    p(-2,-24, CO, 4, 3); p(-1,-23, K0, 2, 2);
    p(-6,-36, CO, 12, 13);
    p(-5,-35, K1, 10, 11); p(-5,-35, K2, 10, 1);
    p( 3,-34, K0,  2,  9);
    p(-4,-31, CO, 3, 2); p( 1,-31, CO, 3, 2);
    p(-3,-31, isAtk ? G5 : W4, 1, 1); p( 2,-31, isAtk ? G5 : W4, 1, 1);
    p(-1,-27, K0, 2, 1);

    // ── OPEN-FACED HELM WITH A RED CREST
    p(-7,-39, CO, 14, 5); p(-6,-38, T1, 12, 3); p(-6,-38, T4, 12, 1);
    p(-8,-35, CO,  2, 6); p( 6,-35, CO, 2, 6);
    p(-7,-34, T2,  1, 5); p( 7,-34, T2, 1, 5);
    p(-7,-40, CO, 14, 2); p(-6,-39, G2, 12, 1);
    for (let i = 0; i < 5; i++) p(-4 + i * 2, -45 + Math.abs(i - 2), R2, 2, 6);  // crest
    p(-4,-45, R3, 8, 1);

    if (isAtk) {
        glow(15,-49, W4, 14, 24, 0.35);
        glow(-1, -8, G5,  3,  3, 0.55);
    }
}

/* ─── window exports ─────────────────────────────────────────────────────── */
window.drawExecutor    = drawExecutor;
window.drawBinder      = drawBinder;
window.drawAbsoluteZero = drawAbsoluteZero;
window.drawPermafrost  = drawPermafrost;
window.drawSeer        = drawSeer;
window.drawCommander   = drawCommander;

/* ─── Novice Exorcist Exclusive — Support T3 ────────────────────────────── */
/* PSALM SINGER — 시편 가수. White choir gown, gold psalter held open, notes
 * lifting off the page.
 * Lore: 백색 합창단 가운에 황금 시편서를 든 우아한 가수. */
function drawPsalmSinger(ctx, tower, cx, cy, isLeft) {
    const S = 2.0;
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 350;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep = (Math.sin(now * 0.004) + 1) / 2;

    const CO='#000';
    const W0='#4A4A56', W1='#8C8C9C', W2='#C8C8D8', W3='#EDEDF6', W4='#FFFFFF';  // choir white
    const G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const A2='#33559E', A3='#6E93D6';                                            // choir trim
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';
    const H1='#A87C28', H2='#E0BC64';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -19, -36 + idleY, G3, 38, 66, isLeft, S);
    ctx.restore();

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, W1, 4, 3); p(-6, 23, W3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, W1, 4, 3); p( 2, 23, W3, 4, 1);

    // ── GOWN SKIRT (full, pleated)
    p(-9,  4, CO, 18, 19);
    p(-8,  5, W1, 16, 17); p(-7,  5, W2, 14, 16); p(-5,  6, W3, 10, 14);
    p(-8,  5, W4, 16,  1);                                                       // top highlight
    p(-4,  7, W1,  1, 12); p( 0,  7, W1, 1, 12); p( 4,  7, W1, 1, 12);           // pleats
    p(-9, 19, CO, 18,  3); p(-8, 20, G2, 16, 2); p(-8, 20, G3, 16, 1);           // gold hem

    // ── CINCTURE
    p(-8,  1, CO, 16, 4); p(-7, 2, G1, 14, 2); p(-7, 2, G3, 14, 1);

    // ── GOWN BODICE
    p(-7,-17, CO, 14, 19);
    p(-6,-16, W1, 12, 17); p(-5,-16, W2, 10, 16); p(-3,-15, W3, 6, 14);
    p(-6,-16, W4, 12,  1);                                                       // top highlight
    p(-5,-16, A2,  2, 17); p( 3,-16, A2, 2, 17);                                 // choir bands
    p(-5,-16, A3,  2,  1); p( 3,-16, A3, 2, 1);

    // ── WIDE CHOIR COLLAR
    p(-9,-21, CO, 18, 5); p(-8,-20, W3, 16, 3); p(-8,-20, W4, 16, 1);
    p(-8,-18, G2, 16, 1);

    // ── SLEEVES (wide choir cuffs, forearms in to hold the book)
    p(-12,-16, CO, 6, 12); p(-11,-15, W2, 4, 10); p(-11,-15, W4, 4, 1);
    p(-11, -5, CO, 5,  7); p(-10, -4, K1, 3,  5); p(-10, -4, K2, 3, 1);
    p(  6,-16, CO, 6, 12); p(  7,-15, W2, 4, 10); p(  7,-15, W4, 4, 1);
    p(  6, -5, CO, 5,  7); p(  7, -4, K1, 3,  5); p(  7, -4, K2, 3, 1);

    // ── GOLD PSALTER held open across both hands
    p(-9, -4, CO, 18, 11);
    p(-8, -3, G1,  8,  9); p( 1, -3, G1, 7, 9);                                  // covers
    p(-8, -3, W3,  8,  8); p( 1, -3, W4, 7, 8);                                  // pages
    p(-8, -3, W4,  8,  1); p( 1, -3, W4, 7, 1);                                  // page highlight
    p(-1, -4, CO,  3, 11); p(-1, -3, G2, 1, 9); p(-1, -3, G4, 1, 1);             // spine
    for (let i = 0; i < 3; i++) { p(-7, -1 + i * 2, G2, 6, 1); p(2, -1 + i * 2, G2, 5, 1); }
    p(-9,  6, CO, 18,  2); p(-8,  7, G3, 16, 1);                                 // gilt edge
    glow(-1, -3, G4, 1, 9, 0.35 + ep * 0.25);

    // ── NECK
    p(-2,-23, CO, 4, 3); p(-1,-22, K0, 2, 2);

    // ── HEAD (singing, mouth open)
    p(-6,-35, CO, 12, 13);
    p(-5,-34, K1, 10, 11); p(-5,-34, K2, 10, 1);
    p( 3,-33, K0,  2,  9);
    p(-6,-36, CO, 12,  5); p(-5,-35, H1, 10, 3); p(-5,-35, H2, 10, 1);           // hair
    p(-7,-32, CO,  2,  6); p( 5,-32, CO, 2, 6);
    p(-4,-30, CO,  3,  2); p( 1,-30, CO, 3, 2);                                  // eyes
    p(-3,-30, W4,  1,  1); p( 2,-30, W4, 1, 1);
    p(-2,-26, CO,  4,  3); p(-1,-25, '#8A3A46', 2, 2);                           // open mouth

    // ── HALO
    p(-8,-42, CO, 16, 1); p(-8,-38, CO, 16, 1);
    p(-9,-41, CO,  1,  3); p( 8,-41, CO, 1, 3);
    p(-8,-41, G2, 16, 1); p(-8,-39, G2, 16, 1); p(-8,-41, G3, 16, 1);
    glow(-8,-41, G4, 16, 1, 0.42 + ep * 0.30);

    // ── RISING NOTES (three, climbing and fading on their own phases)
    for (let i = 0; i < 3; i++) {
        const t  = ((now * 0.0009) + i / 3) % 1;
        const nx = 10 + ((i * 3) % 5);
        const ny = -18 - Math.round(t * 20);
        const a  = (1 - t) * 0.85;
        p(nx,   ny,   G3, 2, 2);                                                 // note head
        p(nx+2, ny-4, G3, 1, 5);                                                 // stem
        p(nx+2, ny-4, G4, 2, 1);                                                 // flag
        glow(nx, ny-4, G4, 4, 7, a * 0.5);
    }

    if (isAtk) {
        glow(-8,-41, G4, 16, 1, 0.65);
        glow(-1, -3, G4,  1, 9, 0.60);
    }
}

/* LITANY CHANTER — 연도 창자. Blue-grey cassock, a rosary wound through both
 * hands, prayer rising off his lips without pause.
 * Lore: 청회색 사제복에 묵주를 휘감은 손, 끊임없이 기도를 읊는 창자.
 * The old art was gold and purple, which belonged to a different character. */
function drawLitanyChanter(ctx, tower, cx, cy, isLeft) {
    const S = 2.0;
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 350;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep = (Math.sin(now * 0.004) + 1) / 2;

    const CO='#000';
    const B0='#161C24', B1='#3A4652', B2='#66748A', B3='#9CAABC', B4='#D8E4F0';  // blue-grey
    const G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const W2='#C8C8D8', W3='#EDEDF6', W4='#FFFFFF';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';
    const H1='#5A5A66', H2='#9A9AA8';                                            // greying hair

    ctx.save(); ctx.globalAlpha = 0.12 + ep * 0.16;
    pUnitAura(ctx, cx, cy, -18, -34 + idleY, B3, 36, 62, isLeft, S);
    ctx.restore();

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, B1, 4, 3); p(-6, 23, B3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, B1, 4, 3); p( 2, 23, B3, 4, 1);

    // ── CASSOCK SKIRT
    p(-8,  4, CO, 16, 19);
    p(-7,  5, B0, 14, 17); p(-6,  5, B1, 12, 16); p(-4,  6, B2, 8, 14);
    p(-7,  5, B4, 14,  1);                                                       // top highlight
    p(-3,  7, B0,  1, 12); p( 2,  7, B0,  1, 12);                                // fold shadows
    p(-8, 19, CO, 16,  3); p(-7, 20, B2, 14, 2); p(-7, 20, B3, 14, 1);

    // ── CASSOCK TORSO (buttoned placket down the front)
    p(-7,-17, CO, 14, 19);
    p(-6,-16, B0, 12, 17); p(-5,-16, B1, 10, 16); p(-3,-15, B2, 6, 14);
    p(-6,-16, B4, 12,  1);                                                       // top highlight
    p(-1,-16, B0,  2, 17);                                                       // placket
    for (let i = 0; i < 5; i++) p(0, -14 + i * 3, B4, 1, 1);                     // buttons

    // ── CINCTURE
    p(-7,  1, CO, 14, 4); p(-6, 2, B1, 12, 2); p(-6, 2, B3, 12, 1);

    // ── ROMAN COLLAR
    p(-7,-20, CO, 14, 4); p(-6,-19, B1, 12, 2); p(-6,-19, B3, 12, 1);
    p(-2,-19, W4,  5,  2);                                                       // white tab

    // ── SLEEVES, hands together at the chest
    p(-12,-15, CO, 6, 13); p(-11,-14, B1, 4, 11); p(-11,-14, B3, 4, 1);
    p( -9, -4, CO, 5,  6); p(-8, -3, K1, 3,  4); p(-8, -3, K2, 3, 1);
    p(  6,-15, CO, 6, 13); p(  7,-14, B1, 4, 11); p(  7,-14, B3, 4, 1);
    p(  4, -4, CO, 5,  6); p( 5, -3, K1, 3,  4); p( 5, -3, K2, 3, 1);

    // ── ROSARY — wound over both fists, then hanging in a loop to a cross.
    //    Beads are single pixels so the chain still reads at codex size.
    for (let i = 0; i < 5; i++) p(-8 + i * 4, -5, W3, 1, 1);                     // wound across
    for (let i = 0; i < 6; i++) {
        const t  = i / 5;
        const bx = -6 + Math.round(t * 12);
        const by = 2 + Math.round(Math.sin(t * Math.PI) * 5);
        p(bx, by, W2, 1, 1);
        glow(bx, by, W4, 1, 1, 0.30 + ep * 0.20);
    }
    p(-1, 10, CO, 3, 7); p( 0, 11, G3, 1, 5);                                    // cross
    p(-3, 12, CO, 7, 3); p(-2, 13, G3, 5, 1);
    glow( 0, 11, G4, 1, 5, 0.40 + ep * 0.28);
    glow(-2, 13, G4, 5, 1, 0.40 + ep * 0.28);

    // ── NECK
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);

    // ── HEAD (mid-chant, eyes lowered)
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-6,-35, CO, 12,  4); p(-5,-34, H1, 10, 2); p(-5,-34, H2, 10, 1);           // hair
    p(-7,-31, CO,  2,  5); p( 5,-31, CO, 2, 5);
    p(-4,-29, CO,  3,  1); p( 1,-29, CO, 3, 1);                                  // lowered lids
    p(-2,-25, CO,  4,  3); p(-1,-24, '#8A3A46', 2, 2);                           // chanting mouth

    // ── LITANY GLYPHS rising from the lips, never stopping
    for (let i = 0; i < 4; i++) {
        const t  = ((now * 0.0011) + i / 4) % 1;
        const gx = 4 + ((i * 2) % 4);
        const gy = -26 - Math.round(t * 16);
        glow(gx, gy, W4, 2, 1, (1 - t) * 0.7);
        glow(gx + 1, gy - 1, G4, 1, 1, (1 - t) * 0.5);
    }

    if (isAtk) {
        glow( 0, 11, G4, 1, 5, 0.65); glow(-2, 13, G4, 5, 1, 0.65);
        glow(-6,-14, B4, 12, 14, 0.20);
    }
}

/* RELIC GUARDIAN — 성유물 수호자. Gold breastplate, the relic cross carried
 * before him.
 * Lore: 황금 흉갑에 성유물 십자를 든 위엄 있는 수호자. */
function drawRelicGuardian(ctx, tower, cx, cy, isLeft) {
    const S = 2.0;
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 350;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep = (Math.sin(now * 0.004) + 1) / 2;

    const CO='#000';
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8', G5='#FFFDE8';
    const T0='#2E323E', T1='#767E92', T2='#B6BECE', T3='#E2E8F2', T4='#FFFFFF';
    const R1='#6A0C14', R2='#A81824', R3='#E0343C';                              // mantle red
    const C2='#22B8E0', C3='#7FE8FF', C4='#DDFAFF';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -20, -36 + idleY, G3, 40, 64, isLeft, S);
    ctx.restore();

    // ── SABATONS
    p(-9, 22, CO, 8, 5); p(-8, 23, T1, 6, 3); p(-8, 23, T3, 6, 1);
    p( 2, 22, CO, 8, 5); p( 3, 23, T1, 6, 3); p( 3, 23, T3, 6, 1);

    // ── GREAVES
    p(-9,  4, CO, 18, 19); p(-8,  5, T0, 16, 17); p(-7,  5, T1, 14, 16);
    p(-5,  6, T2, 10, 14);
    p(-8,  5, T4, 16,  1);                                                       // top highlight
    p(-1,  6, T0,  2, 13);
    p(-9, 19, CO, 18,  3); p(-8, 20, G2, 16, 2); p(-8, 20, G3, 16, 1);

    // ── BELT
    p(-8,  1, CO, 16, 4); p(-7, 2, G1, 14, 2); p(-7, 2, G3, 14, 1);

    // ── GOLD BREASTPLATE (the lore's named feature — gold over steel, not trim)
    p(-8,-19, CO, 17, 21);
    p(-7,-18, T0, 15, 19);
    p(-6,-18, CO, 13, 19); p(-5,-17, G1, 11, 17); p(-5,-17, G4, 11, 1);
    p(-4,-16, G2,  9, 15); p(-3,-15, G3, 7, 13);
    p( 5,-16, G0,  2, 15);                                                       // shaded flank
    p(-5,-11, G0, 11,  1); p(-5, -5, G0, 11, 1);                                 // plate seams
    for (let r = 0; r < 3; r++) { p(-5,-15+r*5, G4, 1, 1); p(5,-15+r*5, G4, 1, 1); }

    // ── RED MANTLE at the shoulders
    p(-12,-22, CO, 24, 5); p(-11,-21, R1, 22, 3); p(-11,-21, R3, 22, 1);
    p(-12,-18, CO,  4, 8); p(-11,-17, R1, 2, 7);
    p(  9,-18, CO,  4, 8); p( 10,-17, R1, 2, 7);

    // ── PAULDRONS
    p(-13,-24, CO, 7, 9); p(-12,-23, G1, 5, 7); p(-12,-23, G4, 5, 1);
    p(  7,-24, CO, 7, 9); p(  8,-23, G1, 5, 7); p(  8,-23, G4, 5, 1);

    // ── ARMS, both forward around the relic
    p(-12,-16, CO, 6, 14); p(-11,-15, T1, 4, 12); p(-11,-15, T3, 4, 1);
    p(-12, -2, CO, 6,  5); p(-11, -1, K1, 4,  3); p(-11, -1, K2, 4, 1);
    p(  6,-16, CO, 6, 14); p(  7,-15, T1, 4, 12); p(  7,-15, T3, 4, 1);
    p(  6, -2, CO, 6,  5); p(  7, -1, K1, 4,  3); p(  7, -1, K2, 4, 1);

    // ── THE RELIC CROSS, held out in front
    p(-3,-14, CO, 7, 26); p(-2,-13, G1, 5, 24); p(-2,-13, G4, 5, 1);             // upright
    p(-1,-12, G3, 3, 22);
    p(-9, -6, CO, 19, 7); p(-8, -5, G1, 17, 5); p(-8, -5, G4, 17, 1);            // arm
    p(-7, -4, G3, 15,  3);
    p(-2, -5, CO,  5, 5); p(-1, -4, C2, 3, 3); p(-1, -4, C4, 3, 1);              // relic stone
    glow(-1, -4, C4, 3, 1, 0.55 + ep * 0.32);
    glow(-1,-12, G5, 3, 1, 0.35 + ep * 0.26);
    glow(-7, -4, G5, 15, 1, 0.30 + ep * 0.24);
    p(-2,-19, CO,  5, 5); p(-1,-18, G3, 3, 3); p(-1,-18, G5, 3, 1);              // crown finial

    // ── NECK + HEAD
    p(-2,-25, CO, 4, 3); p(-1,-24, K0, 2, 2);
    p(-6,-37, CO, 12, 13);
    p(-5,-36, K1, 10, 11); p(-5,-36, K2, 10, 1);
    p( 3,-35, K0,  2,  9);
    p(-4,-32, CO, 3, 2); p( 1,-32, CO, 3, 2);
    p(-3,-32, isAtk ? G5 : T4, 1, 1); p( 2,-32, isAtk ? G5 : T4, 1, 1);
    p(-1,-28, K0, 2, 1);
    p(-5,-34, G2, 10, 1);                                                        // brow band

    // ── GOLD CIRCLET
    p(-7,-40, CO, 14, 4); p(-6,-39, G1, 12, 2); p(-6,-39, G4, 12, 1);
    p(-1,-43, CO,  3, 4); p( 0,-42, G3, 1, 3);
    glow( 0,-42, G5, 1, 3, 0.45 + ep * 0.28);

    if (isAtk) {
        glow(-1, -4, C4, 3, 3, 0.70);
        glow(-8, -5, G5, 17, 5, 0.45);
    }
}

/* RUNE CRAFTER — 룬 조각가. Leather apron, chisel and hammer, cutting a glowing
 * rune into the air in front of her.
 * Lore: 가죽 앞치마에 룬 끌과 망치, 공중에 빛나는 룬을 새기는 조각가. */
function drawRuneCrafter(ctx, tower, cx, cy, isLeft) {
    const S = 2.0;
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 350;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep    = (Math.sin(now * 0.004) + 1) / 2;
    const strike = (now % 700) / 700;
    const hit    = strike < 0.18 ? 2 : 0;                                        // hammer fall

    const CO='#000';
    const L0='#241608', L1='#5A3A1E', L2='#8A5C30', L3='#B98450', L4='#E0B080';  // leather
    const S1='#8C8474', S2='#C9C1AC', S3='#EDE7D6', S4='#FFFCF2';                // linen
    const T1='#767E92', T2='#B6BECE', T3='#E2E8F2', T4='#FFFFFF';                // tool steel
    const C1='#0A6E96', C2='#22B8E0', C3='#7FE8FF', C4='#DDFAFF';                // cut rune
    const G2='#B88000', G3='#FFD700';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';
    const H1='#6A4E20', H2='#A87C34';

    ctx.save(); ctx.globalAlpha = 0.12 + ep * 0.17;
    pUnitAura(ctx, cx, cy, -19, -34 + idleY, C2, 38, 62, isLeft, S);
    ctx.restore();

    // ── BOOTS
    p(-7, 22, CO, 6, 5); p(-6, 23, L1, 4, 3); p(-6, 23, L3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, L1, 4, 3); p( 2, 23, L3, 4, 1);

    // ── TROUSERS
    p(-7,  6, CO, 14, 17); p(-6,  7, S1, 12, 15); p(-5,  7, S2, 10, 14);
    p(-6,  7, S4, 12,  1);                                                       // top highlight
    p(-1,  8, CO,  2, 14);

    // ── LEATHER APRON
    p(-6,-12, CO, 12,  6); p(-5,-11, L1, 10, 4); p(-5,-11, L3, 10, 1);           // bib
    p(-8, -6, CO, 16, 24); p(-7, -5, L0, 14, 22); p(-6, -5, L1, 12, 21);
    p(-4, -4, L2,  8, 19);
    p(-7, -5, L4, 14,  1);                                                       // top highlight
    p(-2, -4, L0,  1, 19);                                                       // seam
    p(-6,-12, L2,  2,  1); p( 4,-12, L2, 2, 1);
    p(-6,-14, CO,  2,  3); p( 4,-14, CO, 2, 3);
    p(-6,-14, L2,  2,  2); p( 4,-14, L2, 2, 2);

    // ── TOOL BELT
    p(-9, -2, CO, 18, 5); p(-8, -1, L1, 16, 3); p(-8, -1, L3, 16, 1);
    for (let i = 0; i < 3; i++) { p(-7 + i * 5, 3, CO, 3, 6); p(-6 + i * 5, 4, T2, 1, 4); }

    // ── SHIRT + COLLAR
    p(-7,-17, CO, 14, 6); p(-6,-16, S2, 12, 4); p(-6,-16, S4, 12, 1);
    p(-7,-20, CO, 14, 4); p(-6,-19, S3, 12, 2); p(-6,-19, S4, 12, 1);

    // ── ARMS: chisel hand steady, hammer hand falling
    p(-12,-16, CO, 6, 10); p(-11,-15, S2, 4, 8); p(-11,-15, S4, 4, 1);
    p(-13, -8, CO, 6,  7); p(-12, -7, K1, 4, 5); p(-12, -7, K2, 4, 1);           // chisel hand
    p(  6,-16, CO, 6,  9); p(  7,-15, S2, 4, 7); p(  7,-15, S4, 4, 1);
    p(  8,-26 + hit, CO, 6, 12); p( 9,-25 + hit, K1, 4, 10); p( 9,-25 + hit, K2, 4, 1);
    p(  8,-29 + hit, CO, 6,  5); p( 9,-28 + hit, K1, 4, 3); p( 9,-28 + hit, K2, 4, 1);

    // ── RUNE CHISEL held to the work
    p(-16,-12, CO, 4, 9); p(-15,-11, L2, 2, 7); p(-15,-11, L4, 2, 1);            // handle
    p(-16, -4, CO, 4, 6); p(-15, -3, T2, 2, 5); p(-15, -3, T4, 2, 1);            // shaft
    p(-16,  1, CO, 4, 3); p(-15,  2, T3, 2, 1);                                  // cutting edge

    // ── HAMMER, mid-fall
    p( 9,-36 + hit, CO, 4, 10); p(10,-35 + hit, L2, 2, 8); p(10,-35 + hit, L4, 2, 1);
    p( 6,-42 + hit, CO, 11, 7); p( 7,-41 + hit, T1, 9, 5); p( 7,-41 + hit, T4, 9, 1);
    p( 7,-39 + hit, T2,  9, 2);
    p( 6,-42 + hit, G2, 11, 1); p( 6,-36 + hit, G2, 11, 1);                      // gold cheeks

    // ── THE RUNE BEING CUT — a glyph hanging in the air, brighter where the
    //    chisel is working. Sparks fly on the hammer's fall.
    p(-22,-10, C1, 2, 14); p(-22,-10, C3, 2, 1);                                 // stem
    p(-22,-10, C1, 8,  2); p(-22, -4, C1, 6, 2); p(-22,  2, C1, 8, 2);           // arms
    glow(-22,-10, C4, 8, 2, 0.45 + ep * 0.30);
    glow(-22, -4, C4, 6, 2, 0.45 + ep * 0.30);
    glow(-22,  2, C4, 8, 2, 0.45 + ep * 0.30);
    if (hit) {
        for (let i = 0; i < 5; i++) {
            glow(-17 + (i % 3) * 2, -3 - ((i * 3) % 7), C4, 1, 1, 0.85 - i * 0.1);
        }
    }

    // ── NECK + HEAD
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-6,-35, CO, 12,  4); p(-5,-34, H1, 10, 2); p(-5,-34, H2, 10, 1);
    p(-7,-31, CO,  2,  5); p( 5,-31, CO, 2, 5);
    p(-4,-29, CO,  3,  2); p( 1,-29, CO, 3, 2);
    p(-3,-29, isAtk ? C4 : S4, 1, 1); p( 2,-29, isAtk ? C4 : S4, 1, 1);
    p(-1,-25, K0,  2,  1);

    // ── GOGGLES ON THE BROW
    p(-7,-33, CO, 14, 3); p(-6,-32, L1, 12, 2); p(-6,-32, L3, 12, 1);
    p(-6,-33, CO,  5, 4); p(-5,-32, C1,  3, 2); p(-5,-32, C3, 3, 1);
    p( 1,-33, CO,  5, 4); p( 2,-32, C1,  3, 2); p( 2,-32, C3, 3, 1);
    glow(-5,-32, C3, 3, 1, 0.35 + ep * 0.25);
    glow( 2,-32, C3, 3, 1, 0.35 + ep * 0.25);

    if (isAtk) {
        glow(-22,-10, C4, 8, 14, 0.55);
    }
}

/* BARRIER MASTER — 결계 마스터. Pale blue-white scholar robe, ward-array fan.
 * Lore: 청백 학자복에 결계진 부채를 든 침착한 마스터.
 * The fan is the brief and the silhouette; the old art gave him a helm and a
 * stack of three translucent rectangles that read as a slab, not a barrier. */
function drawBarrierMaster(ctx, tower, cx, cy, isLeft) {
    const S = 2.0;
    const now   = Date.now();
    const idleY = Math.sin(now * 0.002) * 2;
    const isAtk = (now - (tower.lastShot || 0)) < 350;
    const ep    = (Math.sin(now * 0.004) + 1) / 2;
    const p = (ox, oy, col, w = 1, h = 1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };

    const CO='#000';
    const B0='#141C34', B1='#37507E', B2='#7C97C6', B3='#BCD2EC', B4='#F2F8FF';  // frost robe
    const G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const C1='#0A6E96', C2='#22B8E0', C3='#7FE8FF', C4='#DDFAFF';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCB4';
    const H0='#1A1A28', H1='#33334E', H2='#5C5C80';                              // black hair

    ctx.save(); ctx.globalAlpha = 0.12 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -20, -36 + idleY, C2, 40, 66, isLeft, S);
    ctx.restore();

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, B1, 4, 3); p(-6, 23, B3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, B1, 4, 3); p( 2, 23, B3, 4, 1);

    // ── LOWER ROBE
    p(-8,  4, CO, 16, 19);
    p(-7,  5, B0, 14, 17); p(-6,  5, B1, 12, 16); p(-4,  6, B2, 8, 14);
    p(-7,  5, B4, 14,  1);                                                       // top highlight
    p(-3,  7, B0,  1, 12); p( 2,  7, B0,  1, 12);                                // fold shadows
    p(-8, 19, CO, 16,  3); p(-7, 20, G2, 14,  2); p(-7, 20, G3, 14, 1);          // gold hem

    // ── SASH
    p(-7,  1, CO, 14, 4); p(-6, 2, B2, 12, 2); p(-6, 2, B3, 12, 1);
    p(-2,  0, CO,  5, 5); p(-1, 1, C1,  3, 3); p(-1, 1, C3, 3, 1);
    glow(-1, 1, C4, 3, 3, 0.42 + ep * 0.32);

    // ── TORSO ROBE (crossed collar, scholar cut)
    p(-7,-17, CO, 14, 19);
    p(-6,-16, B0, 12, 17); p(-5,-16, B1, 10, 16); p(-3,-15, B2, 6, 14);
    p(-6,-16, B4, 12,  1);                                                       // top highlight
    p(-5,-16, B3,  4,  9); p( 1,-16, B3, 4, 9);                                  // crossed lapels
    p(-5,-16, B4,  4,  1); p( 1,-16, B4, 4, 1);
    // ward-array chest medallion
    p(-2,-10, CO, 5, 5); p(-1, -9, G2, 3, 3); p(-1, -9, G4, 3, 1);
    p( 0, -8, C3, 1, 1);
    glow( 0, -8, C4, 1, 1, 0.60 + ep * 0.35);                                    // point, not a block

    // ── COLLAR
    p(-7,-20, CO, 14, 4); p(-6,-19, B3, 12, 2); p(-6,-19, B4, 12, 1);
    p(-6,-17, G2, 12, 1);

    // ── LEFT SLEEVE (wide scholar cuff, hanging)
    p(-13,-15, CO, 7, 17); p(-12,-14, B1, 5, 15); p(-12,-14, B2, 4, 14);
    p(-12,-14, B4,  5, 1);                                                       // top highlight
    p(-12,  1, CO, 6,  5); p(-11,  2, K1, 4,  3); p(-11, 2, K2, 4, 1);

    // ── RIGHT SLEEVE (raised, holding the fan)
    p( 6,-16, CO, 7, 12); p( 7,-15, B1, 5, 10); p( 7,-15, B2, 4, 9);
    p( 7,-15, B4,  5, 1);
    p( 8,-24, CO, 6, 10); p( 9,-23, B1, 4,  8); p( 9,-23, B2, 3, 7);
    p( 9,-23, B4,  4, 1);
    p( 8,-27, CO, 6,  5); p( 9,-26, K1, 4,  3); p( 9,-26, K2, 4, 1);             // hand

    // ── WARD-ARRAY FAN — seven ribs opening from the hand, hex glyphs on
    //    the leaf. Each rib is one column so the fan keeps a hard pixel edge
    //    instead of the soft wedge a filled triangle would give.
    const fanO = 0.5 + ep * 0.5;                                                 // breathes open
    for (let i = 0; i < 7; i++) {
        const rx = 10 + i * 2;
        const top = -24 - Math.round(i * 1.6 * fanO);
        const bot = -10 + Math.round(i * 0.7);
        p(rx, top, CO, 2, bot - top);                                            // rib shadow
        p(rx, top + 1, i % 2 ? B2 : B3, 1, bot - top - 1);                       // rib
        if (i > 0) p(rx - 1, top + 2, B1, 1, bot - top - 3);                     // leaf between ribs
    }
    p(10, -12, CO, 14, 3); p(11, -11, G2, 12, 2); p(11, -11, G3, 12, 1);         // fan spine
    // hex glyphs across the leaf
    for (let i = 0; i < 3; i++) {
        const gx = 13 + i * 3, gy = -20 - i * 2;
        p(gx, gy, C1, 3, 2); p(gx, gy, C3, 3, 1);
        glow(gx - 1, gy - 1, C3, 5, 4, 0.28 + ep * 0.30);
    }

    // ── NECK
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);

    // ── HEAD (composed, no helm)
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-6,-36, CO, 12, 5); p(-5,-35, H0, 10, 3); p(-5,-35, H1, 10, 1);            // hair mass
    p(-5,-35, H2, 10, 1);                                                        // top highlight
    p(-7,-32, CO,  2, 8); p( 5,-32, CO,  2, 8);
    p(-7,-31, H0,  1, 6); p( 6,-31, H0,  1, 6);                                  // side fall
    p(-4,-29, CO, 3, 1); p( 1,-29, CO, 3, 1);                                    // narrowed eyes
    p(-3,-29, isAtk ? C4 : B4, 1, 1); p( 2,-29, isAtk ? C4 : B4, 1, 1);
    p(-1,-25, K0, 2, 1);

    // ── TOPKNOT + WARD PIN
    p(-2,-38, CO, 5, 4); p(-1,-37, H1, 3, 2); p(-1,-37, H2, 3, 1);
    p( 2,-38, CO, 4, 2); p( 3,-37, G3, 2, 1);                                    // pin
    glow( 3,-37, G4, 2, 1, 0.40 + ep * 0.30);

    if (isAtk) {
        for (let i = 0; i < 3; i++) glow(13 + i * 3, -21 - i * 2, C4, 5, 4, 0.55);
        glow(10, -12, G4, 14, 3, 0.50);
    }
}

/* DIVINE BARRIER — 신성한 방벽사. Platinum cloak, shield talisman at the
 * belt, a hex barrier thrown from the open palm.
 * Lore: 백금 망토에 신성 방패 부적, 손바닥에서 빛 장벽이 펼쳐지는 방벽사.
 * The tower shield the old art carried was taller than the unit and hid it. */
function drawDivineBarrier(ctx, tower, cx, cy, isLeft) {
    const S = 2.0;
    const now   = Date.now();
    const idleY = Math.sin(now * 0.002) * 2;
    const isAtk = (now - (tower.lastShot || 0)) < 350;
    const ep    = (Math.sin(now * 0.004) + 1) / 2;
    const p = (ox, oy, col, w = 1, h = 1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };

    const CO='#000';
    const T0='#2E323E', T1='#767E92', T2='#B6BECE', T3='#E2E8F2', T4='#FFFFFF';  // platinum
    const G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const A1='#2A5A9E', A2='#88BBFF', A3='#CFE6FF';                              // barrier blue
    const K0='#C4834E', K1='#F0C090', K2='#FFDCB4';

    ctx.save(); ctx.globalAlpha = 0.12 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -20, -36 + idleY, G3, 40, 66, isLeft, S);
    ctx.restore();

    // ── SABATONS
    p(-8, 22, CO, 7, 5); p(-7, 23, T1, 5, 3); p(-7, 23, T3, 5, 1);
    p( 1, 22, CO, 7, 5); p( 2, 23, T1, 5, 3); p( 2, 23, T3, 5, 1);

    // ── GREAVES
    p(-8,  4, CO, 16, 19);
    p(-7,  5, T0, 14, 17); p(-6,  5, T1, 12, 16); p(-4,  6, T2, 8, 14);
    p(-7,  5, T4, 14,  1);                                                       // top highlight
    p(-1,  6, T0,  2, 13);                                                       // leg split
    p(-8, 19, CO, 16,  3); p(-7, 20, G2, 14,  2); p(-7, 20, G3, 14, 1);

    // ── CLOAK behind the shoulders (platinum, falls past the hip)
    p(-12,-19, CO,  5, 32); p(-11,-18, T0, 3, 30); p(-11,-18, T2, 3, 1);
    p( 8,-19, CO,  5, 32); p(  9,-18, T0, 3, 30); p(  9,-18, T2, 3, 1);
    p(-11, 12, T1,  3,  2); p(  9, 12, T1, 3, 2);                                // lit lower fold

    // ── BELT + SHIELD TALISMAN (the lore prop, worn not wielded)
    p(-7,  1, CO, 14, 4); p(-6, 2, G1, 12, 2); p(-6, 2, G3, 12, 1);
    p(-2,  4, CO,  5, 7); p(-1, 5, T2,  3, 5); p(-1, 5, T4, 3, 1);               // kite charm
    p(-1,  6, G3,  1, 3); p(-2, 7, G3,  3, 1);                                   // cross on charm
    glow(-2, 4, G4, 5, 7, 0.28 + ep * 0.26);

    // ── CUIRASS
    p(-7,-17, CO, 14, 19);
    p(-6,-16, T0, 12, 17); p(-5,-16, T1, 10, 16); p(-3,-15, T2, 6, 14);
    p(-6,-16, T4, 12,  1);                                                       // top highlight
    p(-6,-10, G2, 12,  3); p(-5, -9, G4, 10, 1);                                 // gold chest band
    for (let r = 0; r < 3; r++) { p(-6, -14 + r * 5, G2, 1, 1); p(5, -14 + r * 5, G2, 1, 1); }

    // ── PAULDRONS
    p(-11,-19, CO, 6, 7); p(-10,-18, T1, 4, 5); p(-10,-18, T4, 4, 1);
    p(-10,-18, G2, 4, 1);
    p(  5,-19, CO, 6, 7); p(  6,-18, T1, 4, 5); p(  6,-18, T4, 4, 1);
    p(  6,-18, G2, 4, 1);

    // ── COLLAR
    p(-6,-21, CO, 12, 3); p(-5,-20, T3, 10, 2); p(-5,-20, T4, 10, 1);

    // ── LEFT ARM (down, outside the cuirass outline)
    p(-11,-13, CO, 5, 14); p(-10,-12, T1, 3, 12); p(-10,-12, T2, 2, 11);
    p(-10,-12, T4,  3, 1);                                                       // top highlight
    p(-11,  0, CO, 5,  5); p(-10,  1, K1, 3,  3); p(-10, 1, K2, 3, 1);

    // ── RIGHT ARM (extended, palm forward)
    p( 6,-13, CO, 5, 7); p( 7,-12, T1, 3, 5); p( 7,-12, T4, 3, 1);
    p(10,-15, CO, 6, 7); p(11,-14, K1, 4, 5); p(11,-14, K2, 4, 1);               // open palm
    p(11,-11, K0, 4, 1);                                                         // finger shadow

    // ── PROJECTED BARRIER — a column of hex cells thrown off the palm, each
    //    an outline with a lit face. Drawn as cells rather than one filled
    //    rectangle so it reads as a lattice being held up, not a plate.
    const bo = 0.65 + ep * 0.35;
    for (let i = 0; i < 5; i++) {
        const hy = -25 + i * 6;
        const hx = 16 + Math.abs(i - 2);                                         // slight bow
        // Cell edges only. Filled cells stack into one blue slab, which is the
        // tower shield this redraw is getting rid of.
        p(hx+1, hy,   CO, 5, 1); p(hx+1, hy+4, CO, 5, 1);
        p(hx,   hy+1, CO, 1, 3); p(hx+6, hy+1, CO, 1, 3);
        glow(hx+1, hy,   A2, 5, 1, 0.62 * bo);
        glow(hx+1, hy+4, A1, 5, 1, 0.42 * bo);
        glow(hx,   hy+1, A2, 1, 3, 0.50 * bo);
        glow(hx+6, hy+1, A1, 1, 3, 0.34 * bo);
        glow(hx+1, hy+1, A1, 5, 3, 0.14 * bo);                                   // faint pane
    }

    // ── NECK
    p(-2,-23, CO, 4, 3); p(-1,-22, K0, 2, 2);

    // ── HEAD
    p(-6,-35, CO, 12, 13);
    p(-5,-34, K1, 10, 11); p(-5,-34, K2, 10, 1);
    p( 3,-33, K0,  2,  9);
    p(-4,-30, CO, 3, 2); p( 1,-30, CO, 3, 2);
    p(-3,-30, isAtk ? A3 : T4, 1, 1); p( 2,-30, isAtk ? A3 : T4, 1, 1);
    p(-1,-26, K0, 2, 1);

    // ── SUN CROWN (three gold rays, tallest centre)
    p(-7,-38, CO, 14, 4); p(-6,-37, G2, 12, 2); p(-6,-37, G3, 12, 1);
    p(-5,-42, CO, 3, 5); p(-4,-41, G3, 1, 4);
    p(-1,-45, CO, 3, 8); p( 0,-44, G3, 1, 7); p( 0,-44, G4, 1, 2);
    p( 3,-42, CO, 3, 5); p( 4,-41, G3, 1, 4);
    glow(-7,-38, G4, 14, 4, 0.30 + ep * 0.28);

    if (isAtk) {
        for (let i = 0; i < 5; i++) {
            const hx = 16 + Math.abs(i - 2), hy = -25 + i * 6;
            glow(hx + 1, hy, A3, 5, 1, 0.7); glow(hx + 1, hy + 4, A3, 5, 1, 0.7);
            glow(hx, hy + 1, A3, 1, 3, 0.7); glow(hx + 6, hy + 1, A3, 1, 3, 0.7);
        }
        glow(0,-44, G4, 1, 7, 0.65);
    }
}

window.drawPsalmSinger   = drawPsalmSinger;
window.drawLitanyChanter = drawLitanyChanter;
window.drawRelicGuardian = drawRelicGuardian;
window.drawRuneCrafter   = drawRuneCrafter;
window.drawBarrierMaster = drawBarrierMaster;
window.drawDivineBarrier = drawDivineBarrier;
