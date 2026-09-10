/* pix_lightning.js - Lightning-path units (apprentice → lightning_mage → storm_caller/thunder_judge → thunder_lord) */
/* Old-style signature (cx, cy, tower) — uses global pUnit + ctx. Cobalt + gold palette per data lore. */

function _lightningBolt(p, ox, oy, col) {
    p(ox,     oy,     col, 2, 2);
    p(ox + 1, oy + 2, col, 2, 2);
    p(ox,     oy + 4, col, 2, 2);
    p(ox + 1, oy + 6, col, 2, 2);
}

/* ─── T2: 번개술사 (lightning_mage) — Cobalt robe, gold lightning embroidery,
 *      blue current running off the fingertips.
 *      Lore: 코발트 로브에 황금 번개 자수, 손끝에서 푸른 전류가 흘러내리는 번개술사.
 *      The old aura was a 32x56 additive rect, which the emissive bake now
 *      records and blooms into a flat blue card behind the figure. */
function drawLightningMage(cx, cy, tower) {
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
    const ep   = (Math.sin(now * 0.006) + 1) / 2;
    const arc  = (now % 900) / 900;

    const CO='#000';
    const C0='#060E38', C1='#12246E', C2='#2848CC', C3='#4870E8', C4='#8FA8F8';  // cobalt
    const G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const E0='#0080FF', E1='#40C0FF', E2='#A0E8FF', E3='#E8F8FF';                // current
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';
    const H0='#3A2A14', H1='#6A4E20', H2='#A87C34';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -18, -34 + idleY, E1, 36, 62, isLeft, S);
    ctx.restore();

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, C1, 4, 3); p(-6, 23, C3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, C1, 4, 3); p( 2, 23, C3, 4, 1);

    // ── LOWER ROBE
    p(-8,  4, CO, 16, 19);
    p(-7,  5, C0, 14, 17); p(-6,  5, C1, 12, 16); p(-4,  6, C2, 8, 14);
    p(-7,  5, C4, 14,  1);                                                       // top highlight
    p(-3,  7, C0,  1, 12); p( 2,  7, C0,  1, 12);
    p(-8, 19, CO, 16,  3); p(-7, 20, G2, 14, 2); p(-7, 20, G3, 14, 1);

    // ── GOLD LIGHTNING EMBROIDERY down the skirt and sleeves
    _lightningBolt(p, -5,  7, G3);
    _lightningBolt(p,  3, 10, G2);

    // ── SASH
    p(-7,  1, CO, 14, 4); p(-6, 2, G1, 12, 2); p(-6, 2, G3, 12, 1);
    p(-2,  0, CO,  5, 5); p(-1, 1, E0,  3, 3); p(-1, 1, E2, 3, 1);
    glow(-1, 1, E3, 3, 1, 0.55 + ep * 0.32);

    // ── TORSO
    p(-7,-17, CO, 14, 19);
    p(-6,-16, C0, 12, 17); p(-5,-16, C1, 10, 16); p(-3,-15, C2, 6, 14);
    p(-6,-16, C4, 12,  1);                                                       // top highlight
    p(-6,-16, G2,  1, 17); p( 5,-16, G2, 1, 17);                                 // gold placket
    _lightningBolt(p, -4, -13, G3);                                              // chest embroidery
    _lightningBolt(p,  1, -12, G2);

    // ── COLLAR
    p(-7,-20, CO, 14, 4); p(-6,-19, C2, 12, 2); p(-6,-19, C4, 12, 1);

    // ── SLEEVES, right hand raised and open
    p(-12,-16, CO, 6, 15); p(-11,-15, C1, 4, 13); p(-11,-15, C3, 4, 1);
    p(-12,  0, CO, 6,  5); p(-11,  1, K1, 4,  3); p(-11, 1, K2, 4, 1);
    p(  6,-16, CO, 6, 10); p(  7,-15, C1, 4,  8); p(  7,-15, C3, 4, 1);
    p(  8,-24, CO, 6, 10); p(  9,-23, C1, 4,  8); p(  9,-23, C3, 4, 1);
    p(  8,-28, CO, 7,  5); p(  9,-27, K1, 5,  3); p(  9,-27, K2, 5, 1);          // open hand
    p(  9,-25, K0, 5,  1);                                                       // finger shadow

    // ── CURRENT RUNNING OFF THE FINGERTIPS
    for (let i = 0; i < 4; i++) {
        const t  = (arc + i / 4) % 1;
        const fx = 9 + ((i * 2) % 5);
        const fy = -30 - Math.round(t * 9);
        glow(fx, fy, E2, 1, 2, (1 - t) * 0.85);
        if (i % 2 === 0) glow(fx + 1, fy + 2, E1, 1, 1, (1 - t) * 0.55);
    }
    glow( 9,-27, E2, 5, 1, 0.35 + ep * 0.28);

    // ── NECK + HEAD
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-6,-35, CO, 12,  4); p(-5,-34, H1, 10, 2); p(-5,-34, H2, 10, 1);
    p(-7,-31, CO,  2,  5); p( 5,-31, CO, 2, 5);
    p(-7,-30, H0,  1,  4); p( 6,-30, H0, 1, 4);
    p(-4,-29, CO,  3,  2); p( 1,-29, CO, 3, 2);
    p(-3,-29, isAtk ? E3 : E2, 1, 1); p( 2,-29, isAtk ? E3 : E2, 1, 1);
    p(-1,-25, K0,  2,  1);

    // ── CIRCLET with a storm bead
    p(-7,-37, CO, 14, 3); p(-6,-36, G2, 12, 2); p(-6,-36, G4, 12, 1);
    p(-1,-39, CO,  3, 3); p( 0,-38, E1, 1, 1);
    glow( 0,-38, E3, 1, 1, 0.60 + ep * 0.30);

    if (isAtk) {
        glow( 8,-30, E3, 7, 8, 0.65);
        glow(-1, 1, E3, 3, 3, 0.55);
    }
}

/* ─── T3: 폭풍 소환사 (storm_caller) — Blue-grey robe, lightning-patterned
 *      hood, a ball of lightning turning over in the open hand.
 *      Lore: 청회색 로브에 번개 무늬 두건, 손에 떠도는 뇌구를 쥔 소환사. */
function drawStormCaller(cx, cy, tower) {
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
    const ep   = (Math.sin(now * 0.005) + 1) / 2;
    const orb  = (now % 700) / 700;
    const bob  = Math.round(Math.sin(now * 0.0035) * 1);

    const CO='#000';
    const B0='#161C24', B1='#3A4652', B2='#66748A', B3='#9CAABC', B4='#D8E4F0';  // blue-grey
    const G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const E0='#0080FF', E1='#40C0FF', E2='#A0E8FF', E3='#E8F8FF';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -19, -36 + idleY, E1, 38, 64, isLeft, S);
    ctx.restore();

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, B1, 4, 3); p(-6, 23, B3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, B1, 4, 3); p( 2, 23, B3, 4, 1);

    // ── LOWER ROBE
    p(-8,  4, CO, 16, 19);
    p(-7,  5, B0, 14, 17); p(-6,  5, B1, 12, 16); p(-4,  6, B2, 8, 14);
    p(-7,  5, B4, 14,  1);                                                       // top highlight
    p(-3,  7, B0,  1, 12); p( 2,  7, B0,  1, 12);
    p(-8, 19, CO, 16,  3); p(-7, 20, G2, 14, 2); p(-7, 20, G3, 14, 1);

    // ── SASH
    p(-7,  1, CO, 14, 4); p(-6, 2, B2, 12, 2); p(-6, 2, B4, 12, 1);
    p(-2,  0, CO,  5, 5); p(-1, 1, E0,  3, 3); p(-1, 1, E2, 3, 1);
    glow(-1, 1, E3, 3, 1, 0.55 + ep * 0.32);

    // ── TORSO
    p(-7,-17, CO, 14, 19);
    p(-6,-16, B0, 12, 17); p(-5,-16, B1, 10, 16); p(-3,-15, B2, 6, 14);
    p(-6,-16, B4, 12,  1);                                                       // top highlight
    _lightningBolt(p, -4, -13, E1);
    _lightningBolt(p,  1, -12, E0);

    // ── SLEEVES, one hand cradling the orb
    p(-12,-16, CO, 6, 15); p(-11,-15, B1, 4, 13); p(-11,-15, B3, 4, 1);
    p(-12,  0, CO, 6,  5); p(-11,  1, K1, 4,  3); p(-11, 1, K2, 4, 1);
    p(  6,-16, CO, 6, 11); p(  7,-15, B1, 4,  9); p(  7,-15, B3, 4, 1);
    p(  8,-22, CO, 6,  8); p(  9,-21, B1, 4,  6); p(  9,-21, B3, 4, 1);
    p(  8,-25, CO, 7,  5); p(  9,-24, K1, 5,  3); p(  9,-24, K2, 5, 1);

    // ── BALL LIGHTNING floating over the palm, arcs crawling round it
    const oy2 = -33 + bob;
    p( 9, oy2,   CO, 7, 7);
    p(10, oy2+1, E0, 5, 5); p(10, oy2+1, E1, 5, 2);
    p(11, oy2+2, E2, 3, 3); p(12, oy2+3, E3, 1, 1);
    glow(10, oy2+1, E2, 5, 2, 0.50 + ep * 0.30);
    glow(12, oy2+3, E3, 1, 1, 0.80);
    for (let i = 0; i < 4; i++) {
        const a  = orb * Math.PI * 2 + i * (Math.PI / 2);
        const ax = 12 + Math.round(Math.cos(a) * 5);
        const ay = oy2 + 3 + Math.round(Math.sin(a) * 4);
        glow(ax, ay, E3, 1, 1, 0.45 + ep * 0.30);
    }

    // ── NECK + FACE inside the hood
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);
    p(-5,-32, CO, 10, 11); p(-4,-31, K1, 8, 9); p(-4,-31, K2, 8, 1);
    p( 2,-30, K0,  2,  7);
    p(-3,-28, CO, 3, 2); p( 1,-28, CO, 3, 2);
    p(-2,-28, isAtk ? E3 : E2, 1, 1); p( 2,-28, isAtk ? E3 : E2, 1, 1);
    p(-1,-24, K0, 2, 1);

    // ── LIGHTNING-PATTERNED HOOD
    p(-8,-38, CO, 16, 8); p(-7,-37, B0, 14, 6); p(-6,-36, B1, 12, 5);
    p(-7,-37, B3, 14,  1);                                                       // top highlight
    p(-3,-41, CO,  6, 4); p(-2,-40, B1, 4, 3); p(-2,-40, B3, 4, 1);              // peak
    p(-9,-33, CO,  3, 8); p(-8,-32, B0, 1, 7);
    p( 7,-33, CO,  3, 8); p( 8,-32, B0, 1, 7);
    _lightningBolt(p, -6, -36, G3);                                              // woven bolts
    _lightningBolt(p,  3, -36, G3);
    glow(-6,-36, G4, 2, 2, 0.35 + ep * 0.25);
    glow( 3,-36, G4, 2, 2, 0.35 + ep * 0.25);

    if (isAtk) {
        glow( 9, oy2, E3, 7, 7, 0.75);
        glow(-1, 1, E3, 3, 3, 0.55);
    }
}

/* ─── T3: 천둥의 심판자 (thunder_judge) — Black mantle, a gold lightning
 *      sceptre, and current jumping from the eyes.
 *      Lore: 검은 망토에 황금 번개 왕홀, 눈에서 번개가 튀는 심판자. */
function drawThunderJudge(cx, cy, tower) {
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
    const ep  = (Math.sin(now * 0.005) + 1) / 2;
    const zap = (now % 500) / 500;

    const CO='#000';
    const K0='#08080E', K1='#1A1A26', K2='#2E2E42', K3='#4A4A66', K4='#78789A';  // black mantle
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8';
    const E0='#0080FF', E1='#40C0FF', E2='#A0E8FF', E3='#E8F8FF';
    const K0S='#C4834E', K1S='#F0C090', K2S='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -20, -38 + idleY, E1, 40, 66, isLeft, S);
    ctx.restore();

    // ── MANTLE
    p(-11,-19, CO, 23, 32); p(-10,-18, K0, 21, 30); p(-9,-18, K1, 19, 29);
    p(-10,-18, K3, 21,  1);                                                      // top highlight
    p(-6,-17, K2, 11, 27);
    for (let i = 0; i < 11; i++) {
        const tx = -11 + i * 2, tl = 2 + ((i * 5) % 5);
        p(tx, 13, CO, 2, tl); p(tx, 13, K1, 1, tl - 1);
    }

    // ── SHOES
    p(-7, 20, CO, 6, 5); p(-6, 21, K1, 4, 3); p(-6, 21, K3, 4, 1);
    p( 1, 20, CO, 6, 5); p( 2, 21, K1, 4, 3); p( 2, 21, K3, 4, 1);

    // ── ROBE
    p(-7,  2, CO, 14, 17); p(-6,  3, K0, 12, 15); p(-5,  4, K1, 10, 13);
    p(-6,  3, K4, 12,  1);                                                       // top highlight
    p(-7,  0, CO, 14,  3); p(-6,  1, G1, 12, 2); p(-6, 1, G3, 12, 1);

    // ── TORSO
    p(-7,-16, CO, 14, 18); p(-6,-15, K0, 12, 16); p(-5,-15, K1, 10, 15);
    p(-6,-15, K4, 12,  1);                                                       // top highlight
    p(-3,-14, K2,  6, 13);
    _lightningBolt(p, -4, -12, G3);
    _lightningBolt(p,  2, -11, G2);
    p(-2, -3, CO,  5,  5); p(-1, -2, E0, 3, 3); p(-1, -2, E2, 3, 1);
    glow(-1, -2, E3, 3, 1, 0.55 + ep * 0.32);

    // ── PAULDRONS + COLLAR
    p(-12,-20, CO, 6, 7); p(-11,-19, K2, 4, 5); p(-11,-19, K4, 4, 1);
    p(-11,-19, G2, 4, 1);
    p(  6,-20, CO, 6, 7); p(  7,-19, K2, 4, 5); p(  7,-19, K4, 4, 1);
    p(  7,-19, G2, 4, 1);
    p(-8,-22, CO, 16, 4); p(-7,-21, K2, 14, 2); p(-7,-21, K4, 14, 1);

    // ── ARMS, sceptre raised in the right
    p(-12,-14, CO, 6, 14); p(-11,-13, K1, 4, 12); p(-11,-13, K3, 4, 1);
    p(-12,  1, CO, 6,  5); p(-11,  2, K1S, 4, 3); p(-11, 2, K2S, 4, 1);
    p(  6,-15, CO, 6,  9); p(  7,-14, K1, 4,  7); p(  7,-14, K3, 4, 1);
    p(  8,-23, CO, 6, 10); p(  9,-22, K1, 4,  8); p(  9,-22, K3, 4, 1);
    p(  8,-26, CO, 6,  5); p(  9,-25, K1S, 4, 3); p(  9,-25, K2S, 4, 1);

    // ── GOLD LIGHTNING SCEPTRE
    p(10,-30, CO, 4, 34); p(11,-29, G1, 2, 32); p(11,-29, G3, 2, 1);             // shaft
    p(10,-18, G2, 4, 1); p(10, -6, G2, 4, 1);                                    // collars
    p( 8,-38, CO, 8,  9); p( 9,-37, G2, 6, 7); p( 9,-37, G4, 6, 1);              // head
    p(10,-36, CO, 4,  5); p(11,-35, E0, 2, 3);                                   // caged bolt
    _lightningBolt(p, 10, -36, E2);
    glow(10,-36, E3, 4, 6, 0.50 + ep * 0.32);
    p( 9,-42, CO, 6,  5); p(10,-41, G3, 4, 3); p(10,-41, G4, 4, 1);              // finial
    glow(10,-41, G4, 4, 1, 0.45 + ep * 0.28);

    // ── HEAD, current jumping between the eyes
    p(-2,-24, CO, 4, 3); p(-1,-23, K0S, 2, 2);
    p(-6,-36, CO, 12, 13);
    p(-5,-35, K1S, 10, 11); p(-5,-35, K2S, 10, 1);
    p( 3,-34, K0S,  2,  9);
    p(-4,-31, CO, 4, 3); p( 1,-31, CO, 4, 3);
    p(-3,-30, E1, 2, 1); p( 2,-30, E1, 2, 1);
    glow(-3,-30, E3, 2, 1, 0.75 + ep * 0.25);
    glow( 2,-30, E3, 2, 1, 0.75 + ep * 0.25);
    // the arc itself, snapping across the bridge of the nose
    if (zap < 0.35) {
        glow(-1,-30, E3, 2, 1, 0.85);
        glow( 0,-29, E2, 1, 1, 0.70);
    }
    p(-1,-27, K0S, 2, 1);

    // ── HOOD + GOLD BROW BAND
    p(-8,-40, CO, 16, 6); p(-7,-39, K0, 14, 4); p(-7,-39, K3, 14, 1);
    p(-9,-36, CO,  3, 8); p(-8,-35, K0, 1, 7);
    p( 7,-36, CO,  3, 8); p( 8,-35, K0, 1, 7);
    p(-7,-35, CO, 14, 3); p(-6,-34, G2, 12, 2); p(-6,-34, G4, 12, 1);

    if (isAtk) {
        glow(-3,-30, E3, 2, 1, 0.95); glow(2,-30, E3, 2, 1, 0.95);
        glow(10,-36, E3, 4, 6, 0.80);
    }
}

/* ─── T4: 천둥의 군주 (thunder_lord) — Storm-cloud plate, a gold lightning
 *      spear, a thunder crown turning overhead and wings of thunder behind.
 *      Lore: 검푸른 폭풍 구름 갑주에 황금 번개창, 머리 위 회전하는 천둥 왕관과 등 뒤 우레 날개. */
function drawThunderLord(cx, cy, tower) {
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
    const spin = now * 0.0022;
    const flick = (now % 400) / 400;

    const CO='#000';
    const C0='#060E2A', C1='#122050', C2='#223C88', C3='#3C60C4', C4='#7C98E8';  // storm cloud
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8';
    const E0='#0080FF', E1='#40C0FF', E2='#A0E8FF', E3='#E8F8FF';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.15 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -24, -42 + idleY, E1, 48, 74, isLeft, S);
    ctx.restore();

    // ── WINGS OF THUNDER — four cloud courses a side with current crawling
    //    along their leading edge, fanned like the choir's wings.
    for (let k = 0; k < 2; k++) {
        const bx = k ? 8 : -20;
        for (let c = 0; c < 4; c++) {
            const wx  = bx + (k ? c * 3 : (3 - c) * 3);
            const top = -24 - c * 5;
            const len = 14 + c * 5;
            p(wx, top, CO, 4, len);
            p(wx + (k ? 1 : 0), top + 1, c % 2 ? C1 : C2, 3, len - 2);
            p(wx + (k ? 1 : 0), top + 1, C4, 3, 1);                              // cloud top light
            p(wx + (k ? 1 : 0), top + len - 3, C0, 3, 2);
            if ((c + k) % 2 === 0) {
                const t = (flick + c / 4) % 1;
                glow(wx + (k ? 1 : 0), top + 1 + Math.round(t * (len - 4)), E3, 3, 1, (1 - t) * 0.7);
            }
        }
    }

    // ── SABATONS
    p(-8, 22, CO, 7, 5); p(-7, 23, C1, 5, 3); p(-7, 23, C3, 5, 1);
    p( 1, 22, CO, 7, 5); p( 2, 23, C1, 5, 3); p( 2, 23, C3, 5, 1);

    // ── GREAVES
    p(-8,  4, CO, 16, 19); p(-7,  5, C0, 14, 17); p(-6,  5, C1, 12, 16);
    p(-4,  6, C2,  8, 14);
    p(-7,  5, C4, 14,  1);                                                       // top highlight
    p(-1,  6, C0,  2, 13);
    p(-8, 19, CO, 16,  3); p(-7, 20, G2, 14, 2); p(-7, 20, G3, 14, 1);

    // ── BELT
    p(-7,  1, CO, 14, 4); p(-6, 2, G1, 12, 2); p(-6, 2, G3, 12, 1);
    p(-2,  0, CO,  5, 5); p(-1, 1, E0,  3, 3); p(-1, 1, E2, 3, 1);
    glow(-1, 1, E3, 3, 1, 0.55 + ep * 0.32);

    // ── CUIRASS
    p(-7,-17, CO, 14, 19); p(-6,-16, C0, 12, 17); p(-5,-16, C1, 10, 16);
    p(-6,-16, C4, 12,  1);                                                       // top highlight
    p(-3,-15, C2,  6, 14);
    p( 4,-15, C0,  2, 14);
    _lightningBolt(p, -4, -13, G3);
    _lightningBolt(p,  2, -12, G2);
    p(-2, -4, CO,  5,  5); p(-1, -3, E0, 3, 3); p(-1, -3, E2, 3, 1);
    glow(-1, -3, E3, 3, 1, 0.55 + ep * 0.32);

    // ── PAULDRONS + COLLAR
    p(-12,-20, CO, 6, 8); p(-11,-19, C1, 4, 6); p(-11,-19, C4, 4, 1);
    p(-11,-19, G2, 4, 1);
    p(  6,-20, CO, 6, 8); p(  7,-19, C1, 4, 6); p(  7,-19, C4, 4, 1);
    p(  7,-19, G2, 4, 1);
    p(-6,-21, CO, 12, 3); p(-5,-20, C3, 10, 2); p(-5,-20, C4, 10, 1);

    // ── ARMS, spear in the right
    p(-12,-14, CO, 6, 14); p(-11,-13, C1, 4, 12); p(-11,-13, C3, 4, 1);
    p(-12,  1, CO, 6,  5); p(-11,  2, K1, 4,  3); p(-11, 2, K2, 4, 1);
    p(  6,-14, CO, 6, 11); p(  7,-13, C1, 4,  9); p(  7,-13, C3, 4, 1);
    p(  7, -4, CO, 6,  5); p(  8, -3, K1, 4,  3); p(  8, -3, K2, 4, 1);

    // ── GOLD LIGHTNING SPEAR
    p(10,-34, CO, 4, 56); p(11,-33, G1, 2, 54); p(11,-33, G3, 2, 1);             // haft
    p(10,-20, G2, 4, 1); p(10, -2, G2, 4, 1); p(10, 14, G2, 4, 1);               // collars
    p( 9,-44, CO, 6, 11); p(10,-43, G2, 4, 9); p(10,-43, G4, 4, 1);              // head socket
    p(10,-50, CO, 4,  8); p(11,-49, G3, 2, 6); p(11,-49, G4, 2, 2);              // spearpoint
    _lightningBolt(p, 10, -43, E2);
    glow(11,-49, G4, 2, 3, 0.55 + ep * 0.30);
    glow(10,-43, E3, 4, 6, 0.45 + ep * 0.30);

    // ── NECK + HEAD
    p(-2,-23, CO, 4, 3); p(-1,-22, K0, 2, 2);
    p(-6,-35, CO, 12, 13);
    p(-5,-34, K1, 10, 11); p(-5,-34, K2, 10, 1);
    p( 3,-33, K0,  2,  9);
    p(-4,-30, CO, 3, 2); p( 1,-30, CO, 3, 2);
    p(-3,-30, isAtk ? E3 : E2, 1, 1); p( 2,-30, isAtk ? E3 : E2, 1, 1);
    p(-1,-26, K0, 2, 1);
    p(-7,-38, CO, 14, 4); p(-6,-37, G2, 12, 2); p(-6,-37, G4, 12, 1);            // brow band

    // ── THUNDER CROWN turning above the head: six bolts on a tilted ring
    for (let i = 0; i < 6; i++) {
        const a  = spin + i * (Math.PI / 3);
        const bx = Math.round(Math.cos(a) * 11);
        const by = Math.round(Math.sin(a) * 5) - 46;
        const front = Math.sin(a) > 0;
        p(bx-1, by-3, CO, 3, 8);
        p(bx,   by-2, front ? G3 : G2, 1, 6);
        glow(bx, by-2, front ? E3 : E1, 1, 6, (front ? 0.55 : 0.28) + ep * 0.24);
    }

    if (isAtk) {
        glow(10,-50, G4, 4, 8, 0.80);
        glow(-1, -3, E3, 3, 3, 0.60);
        for (let i = 0; i < 6; i++) {
            const a = spin + i * (Math.PI / 3);
            glow(Math.round(Math.cos(a) * 11), Math.round(Math.sin(a) * 5) - 48, E3, 1, 6, 0.65);
        }
    }
}

window.drawLightningMage = drawLightningMage;
window.drawStormCaller   = drawStormCaller;
window.drawThunderJudge  = drawThunderJudge;
window.drawThunderLord   = drawThunderLord;
