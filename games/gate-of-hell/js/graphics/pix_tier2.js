/* pix_tier2.js - Tier 2 Exorcists */
/* Sprite: 45×63 art-pixels @ S=2.0; light source: top-left */
/* p(ox, oy, col, w, h) — mirrors via pUnit's isLeft flag    */

// ───────────────────────────────────────────────────
// EXORCIST KNIGHT — 퇴마 기사. Bronze plate, a consecrated greatsword shouldered,
// a holy cross mantle over the left shoulder and down the back.
// Lore: 청동 판금 갑주에 축성된 대검, 어깨에 신성 십자 망토를 두른 기사.
// Was drawn in cool grey plate with a kite shield and a crimson plume — none of
// which is in the brief. The bronze and the mantle are.
// ───────────────────────────────────────────────────
function drawKnight(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 350;
    const S = 2.0;
    const idleY  = Math.sin(now * 0.0018) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep   = (Math.sin(now * 0.004) + 1) / 2;
    const furl = Math.round(Math.sin(now * 0.0026) * 1);                         // mantle stirs

    const CO='#000';
    const Z0='#2A1A08', Z1='#6A4418', Z2='#A0702C', Z3='#C89A4C', Z4='#EDC886';  // bronze plate
    const G0='#3C2400', G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';  // gold trim
    const C0='#3A0A10', C1='#8A1420', C2='#C02030', C3='#E8485A';                // mantle cloth
    const W2='#D8D0C4', W3='#F4EEE2';                                            // cross ivory
    const T2='#B6BECE', T3='#E2E8F2', T4='#FFFFFF';                              // sword steel
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    // holy aura
    ctx.save(); ctx.globalAlpha = 0.11 + ep * 0.15;
    pUnitAura(ctx, cx, cy, -20, -34 + idleY, G3, 40, 62, isLeft, S);
    ctx.restore();

    // ── CROSS MANTLE — hangs behind the left shoulder and down the back, so it
    //    is laid in first and the body stands in front of it.
    //    Laid in courses that flare as they fall — a straight rect read as a
    //    plank bolted to his side. Right edge stays at -12 so the pauldron,
    //    sleeve and gauntlet overlap it and it hangs from the body rather
    //    than standing beside it. Crimson, not white: at ivory the cloth sat
    //    between the bronze and the gold in value and read as stone.
    for (let r = 0; r < 11; r++) {
        const y  = -17 + r * 4;
        const lx = -17 - Math.floor(r * 0.7) + (r > 5 ? furl : 0);
        const w  = -14 - lx;
        p(lx - 1, y, CO, w + 2, 5);
        p(lx,     y, C1, w, 4);
        p(lx,     y, C2, 2, 4);                                                  // lit outer edge
        p(lx,     y, C3, w, 1);                                                  // course highlight
        p(-16,    y, C0, 2, 4);                                                  // inner edge in shade
        if (r > 2) p(lx + 3, y, C0, 1, 4);                                       // fold
    }
    for (let i = 0; i < 6; i++) {                                                // ragged hem
        const hx = -23 + i * 2, hl = 2 + ((i * 5) % 4);
        p(hx, 27 + furl, CO, 2, hl + 1); p(hx, 27 + furl, C1, 2, hl);
    }
    // The cross rides low on the skirt. Higher up the sleeve and gauntlet
    // hang over the cloth and swallow it; below the gauntlet the mantle is
    // at its widest and nothing crosses it.
    p(-20, 12 + furl, C0,  5, 17); p(-20, 12 + furl, W2, 4, 16);
    p(-22, 19 + furl, C0, 10,  5); p(-22, 19 + furl, W2, 9,  4);
    p(-20, 12 + furl, W3,  4,  1); p(-22, 19 + furl, W3, 9,  1);

    // ── SABATONS
    p(-12, 23, CO, 10, 6); p(-11, 24, Z1, 8, 4); p(-10, 24, Z3, 4, 3);
    p(-12, 28, Z0, 10, 1); p(-12, 23, G2, 10, 1);
    p(  2, 23, CO, 10, 6); p(  3, 24, Z1, 8, 4); p(  3, 24, Z3, 4, 3);
    p(  2, 28, Z0, 10, 1); p(  2, 23, G2, 10, 1);

    // ── GREAVES / FAULDS
    p(-13,  6, CO, 26, 18);
    p(-12,  7, Z1, 24, 16); p(-10,  7, Z2, 18, 14); p(-6, 7, Z3, 10, 12);
    p(-12,  7, Z4, 24,  1);                                                      // top highlight
    p(-1,   8, Z0,  2, 15);                                                      // leg split
    p(-12,  7, G3,  2, 16); p( 11, 7, G3, 2, 16);                                // gold edging
    for (let r = 0; r < 2; r++) { p(-10, 11 + r * 5, G2, 1, 1); p(10, 11 + r * 5, G2, 1, 1); }

    // ── BELT
    p(-11,  1, CO, 22, 6); p(-10, 2, G2, 20, 4); p(-8, 3, G3, 12, 2); p(-8, 5, G1, 12, 1);
    p(-2,   2, CO,  4, 4); p(-1, 3, C3,  2, 2);                                  // buckle gem

    // ── CUIRASS (riveted bronze, top-highlighted)
    p(-11,-12, CO, 22, 20);
    p(-10,-11, Z1, 20, 18); p(-8,-11, Z2, 16, 16); p(-5,-10, Z3, 8, 14);
    p(-10,-11, Z4, 20,  1);                                                      // top highlight
    p(  8,-10, Z0,  2, 16);                                                      // shaded flank
    p(-10, -6, Z0, 20,  1); p(-10, 0, Z0, 20, 1);                                // plate seams
    for (let r = 0; r < 3; r++) { p(-9,-8+r*5, G2, 1, 1); p(8,-8+r*5, G2, 1, 1); }
    // gold cross emblem
    p(-3, -7, CO, 6, 12); p(-2, -6, G2, 4, 10); p(-1, -5, G3, 2, 8);
    p(-5, -2, CO,10,  4); p(-4, -1, G2, 8,  2); p(-3, 0, G3, 6, 1);
    glow(-1, -5, G4, 2, 8, 0.35 + ep * 0.26);
    glow(-3,  0, G4, 6, 1, 0.35 + ep * 0.26);

    // ── PAULDRONS (gold-capped, the left one pinning the mantle)
    p(-18,-15, CO, 7, 8); p(-17,-14, Z1, 5, 6); p(-16,-13, Z2, 3, 4);
    p(-17,-14, Z4,  5, 1); p(-17,-14, G2, 5, 1);
    p(-16,-17, CO, 4, 3); p(-15,-16, G3, 2, 2);                                  // mantle clasp
    p( 11,-15, CO, 7, 8); p( 12,-14, Z1, 5, 6); p( 13,-13, Z2, 3, 4);
    p( 12,-14, Z4,  5, 1); p( 12,-14, G2, 5, 1);

    // ── SLEEVES + GAUNTLETS
    p(-16, -8, CO, 5, 14); p(-15, -7, Z1, 3, 12); p(-15, -7, Z3, 3, 8);
    p(-16,  6, CO, 5,  6); p(-15,  7, Z2, 3, 4); p(-15, 7, G2, 3, 1);
    p( 11, -8, CO, 5, 14); p( 12, -7, Z1, 3, 12); p( 12, -7, Z3, 3, 8);
    p( 11,  6, CO, 5,  6); p( 12,  7, Z2, 3, 4); p( 12, 7, G2, 3, 1);

    // ── NECK / COLLAR
    p(-4,-14, CO, 8, 4); p(-3,-13, Z2, 6, 2); p(-2,-13, Z4, 4, 2);

    // ── GREAT HELM (riveted, gold-rimmed, lit visor)
    p(-8,-28, CO, 16, 14);
    p(-7,-27, Z1, 14, 12); p(-5,-26, Z3, 8, 10);
    p(-7,-27, Z4, 14,  1);                                                       // top highlight
    p(-3,-27, Z0,  4, 12);                                                       // visor ridge shadow
    p(-6,-22, CO, 12,  3); p(-5,-21, isAtk ? '#FF6A00' : G3, 8, 1);              // visor slit
    glow(-5,-21, isAtk ? G4 : G3, 8, 1, 0.50 + ep * 0.32);
    p(-8,-14, CO, 16,  2); p(-7,-13, G2, 14, 1);                                 // helm rim
    p(-9,-28, G2,  2, 14); p( 7,-28, G2, 2, 14);                                 // side strips

    // ── CROSS FINIAL on the helm (replaces the plume, which the brief has not)
    p(-1,-34, CO, 3, 7); p( 0,-33, G3, 1, 5);
    p(-4,-32, CO, 9, 3); p(-3,-31, G3, 7, 1);
    glow( 0,-33, G4, 1, 5, 0.45 + ep * 0.28);
    glow(-3,-31, G4, 7, 1, 0.45 + ep * 0.28);

    // ── CONSECRATED GREATSWORD, shouldered across the back at an angle.
    //    Broader than the old longsword and carried, not presented — it reads
    //    as a two-hander at rest instead of a parade blade.
    //    The outline runs as a pass of its own: at a 1px advance a per-segment
    //    outline lands inside the segment below it and notches the blade into
    //    a ladder. Outline first, whole length, then the steel over it.
    const BL = 18;
    for (let i = 0; i < BL; i++) p(9 + i, -4 - i * 2, CO, 8, 4);
    for (let i = 0; i < BL; i++) {
        const bx = 10 + i, by = -4 - i * 2;
        p(bx, by, i < BL - 4 ? T2 : T3, 6, 3);
        p(bx, by, T4, 6, 1);                                                     // spine light
        if (i % 4 === 1) p(bx + 2, by + 1, G1, 2, 1);                            // etched verse
    }
    p(26,-42, CO, 7, 4); p(27,-42, T3, 5, 3); p(27,-42, T4, 5, 1);               // point
    p( 7, -3, CO,11, 5); p( 8, -2, G2, 9, 3); p( 8, -2, G4, 9, 1);               // crossguard
    p(10,  2, CO, 5, 6); p(11,  3, G1, 3, 4);                                    // grip
    p( 9,  8, CO, 7, 4); p(10,  9, G3, 5, 2);                                    // pommel
    glow( 8, -2, G4, 9, 1, 0.35 + ep * 0.26);

    if (isAtk) {
        glow( 9, -4, T4, 24, 40, 0.30);                                          // blade catches light
        glow(-1, -5, G4,  2, 12, 0.55);
        glow(-5,-21, G4,  8,  1, 0.75);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// FIRE  —  Pyro-exorcist in crimson flame robes, fire wand with ember top
// ────────────────────────────────────────────────────
// FIRE MAGE — 화염 마법사. Crimson robe, flame-patterned hood, a live ember
// turning over on his open palm.
// Lore: 진홍 로브에 불꽃 무늬 두건, 손바닥 위 작은 불씨를 굴리는 화염 마법사.
// ────────────────────────────────────────────────────
function drawFire(cx, cy, tower) {
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
    const lick = Math.round(Math.sin(now * 0.011) * 1);                          // flame flicker
    const roll = Math.round(Math.sin(now * 0.0035) * 1);                         // ember roll

    const CO='#000';
    const R0='#2A0408', R1='#6A0C14', R2='#A81824', R3='#E0343C', R4='#FF7A72';  // crimson robe
    const F0='#7A1800', F1='#C43800', F2='#FF6A00', F3='#FFB020', F4='#FFE890';  // flame
    const G2='#B88000', G3='#FFD700';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -18, -34 + idleY, F2, 36, 62, isLeft, S);
    ctx.restore();

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, R1, 4, 3); p(-6, 23, R3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, R1, 4, 3); p( 2, 23, R3, 4, 1);

    // ── ROBE SKIRT (crimson, flame-tongue hem)
    p(-8,  4, CO, 16, 18);
    p(-7,  5, R0, 14, 16); p(-6,  5, R1, 12, 15); p(-4,  6, R2, 8, 13);
    p(-7,  5, R4, 14,  1);                                                       // top highlight
    p(-3,  7, R0,  1, 11); p( 2,  7, R0,  1, 11);                                // fold shadows
    for (let i = 0; i < 8; i++) {                                                // flame-tongue hem
        const hx = -7 + i * 2;
        const hl = 2 + ((i * 3) % 3) + (i % 2 ? lick : -lick);
        p(hx, 20, CO, 2, hl + 1); p(hx, 20, i % 2 ? F1 : F0, 2, hl);
        if (i % 2 === 0) glow(hx, 20 + hl - 1, F3, 2, 1, 0.35 + ep * 0.22);
    }

    // ── SASH
    p(-7,  1, CO, 14, 4); p(-6, 2, G2, 12, 2); p(-6, 2, G3, 12, 1);
    p(-2,  0, CO,  5, 5); p(-1, 1, F1,  3, 3); p(-1, 1, F3, 3, 1);
    glow(-1, 1, F4, 3, 1, 0.50 + ep * 0.30);

    // ── ROBE TORSO
    p(-7,-17, CO, 14, 19);
    p(-6,-16, R0, 12, 17); p(-5,-16, R1, 10, 16); p(-3,-15, R2, 6, 14);
    p(-6,-16, R4, 12,  1);                                                       // top highlight
    // flame chevrons down the placket
    for (let i = 0; i < 4; i++) {
        p(-2, -13 + i * 4, F1, 5, 1); p(-1, -12 + i * 4, F2, 3, 1);
    }

    // ── SLEEVES
    p(-12,-16, CO, 6, 15); p(-11,-15, R1, 4, 13); p(-11,-15, R3, 4, 1);
    p(-12,  0, CO, 6,  5); p(-11,  1, K1, 4,  3); p(-11, 1, K2, 4, 1);
    p(  6,-16, CO, 6, 10); p(  7,-15, R1, 4,  8); p(  7,-15, R3, 4, 1);
    p(  8,-23, CO, 6, 10); p(  9,-22, R1, 4,  8); p(  9,-22, R3, 4, 1);
    // open palm, fingers curled to cradle the ember
    p(  8,-27, CO, 7,  5); p(  9,-26, K1, 5,  3); p(  9,-26, K2, 5, 1);
    p(  8,-24, K0,  7,  1);

    // ── EMBER ON THE PALM (turning over, throwing sparks)
    const ex = 10 + roll;
    p(ex-1,-32, CO, 5, 5); p(ex, -31, F1, 3, 3); p(ex, -31, F3, 3, 1);
    p(ex,  -30, F2, 3, 2); p(ex+1,-30, F4, 1, 1);
    glow(ex, -31, F3, 3, 3, 0.45 + ep * 0.30);
    glow(ex+1,-30, F4, 1, 1, 0.75);
    for (let i = 0; i < 4; i++) {                                                // sparks
        const t = ((now * 0.0018) + i / 4) % 1;
        glow(ex + ((i * 2) % 3), -33 - Math.round(t * 8), F4, 1, 1, (1 - t) * 0.75);
    }

    // ── NECK
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);

    // ── FACE inside the hood
    p(-5,-32, CO, 10, 11); p(-4,-31, K1, 8, 9); p(-4,-31, K2, 8, 1);
    p( 2,-30, K0,  2,  7);
    p(-3,-28, CO, 3, 2); p( 1,-28, CO, 3, 2);
    p(-2,-28, isAtk ? F4 : F3, 1, 1); p( 2,-28, isAtk ? F4 : F3, 1, 1);
    p(-1,-24, K0, 2, 1);

    // ── FLAME-PATTERNED HOOD (peaked, zig-zag trim along the opening)
    p(-8,-38, CO, 16, 8); p(-7,-37, R0, 14, 6); p(-6,-36, R1, 12, 5);
    p(-7,-37, R3, 14,  1);                                                       // top highlight
    p(-3,-41, CO,  6, 4); p(-2,-40, R1, 4, 3); p(-2,-40, R3, 4, 1);              // peak
    p(-9,-33, CO,  3, 8); p(-8,-32, R0, 1, 7);                                   // side falls
    p( 7,-33, CO,  3, 8); p( 8,-32, R0, 1, 7);
    for (let i = 0; i < 7; i++) {                                                // zig-zag flame trim
        const zx = -7 + i * 2;
        p(zx, -31 - (i % 2), F1, 2, 2);
        if (i % 2 === 0) glow(zx, -31, F3, 2, 1, 0.30 + ep * 0.20);
    }

    if (isAtk) {
        glow(ex-1,-32, F4, 5, 5, 0.70);
        glow( 8,-27, F4, 7, 5, 0.45);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ARCHER  —  Elven-style forest scout in hunter green/brown, long bow
// ───────────────────────────────────────────────────
// SACRED ARCHER — 신성한 궁수. Platinum chainmail, a bowstring lit end to end,
// and a rune cut into every arrowhead in the quiver.
// Lore: 백금 사슬 갑주에 빛나는 활시위, 화살촉마다 성스러운 룬이 새겨진 정밀 사수.
// The old art was a green woodland ranger — a different unit entirely.
// ───────────────────────────────────────────────────
function drawArcher(cx, cy, tower) {
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
    const ep   = (Math.sin(now * 0.004) + 1) / 2;
    const draw = isAtk ? 2 : 0;                                                  // string pulled back

    const CO='#000';
    const T0='#2E323E', T1='#767E92', T2='#B6BECE', T3='#E2E8F2', T4='#FFFFFF';  // platinum
    const G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const C1='#0A6E96', C2='#22B8E0', C3='#7FE8FF', C4='#DDFAFF';                // holy rune
    const W1='#5A4A34', W2='#8A7454', W3='#B89E74';                              // bow limb wood
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';
    const H0='#3A2A14', H1='#6A4E20', H2='#A87C34';

    ctx.save(); ctx.globalAlpha = 0.12 + ep * 0.16;
    pUnitAura(ctx, cx, cy, -18, -34 + idleY, C2, 36, 62, isLeft, S);
    ctx.restore();

    // ── BOOTS
    p(-8, 22, CO, 7, 5); p(-7, 23, T1, 5, 3); p(-7, 23, T3, 5, 1);
    p( 1, 22, CO, 7, 5); p( 2, 23, T1, 5, 3); p( 2, 23, T3, 5, 1);

    // ── GREAVES
    p(-8,  4, CO, 16, 19);
    p(-7,  5, T0, 14, 17); p(-6,  5, T1, 12, 16); p(-4,  6, T2, 8, 14);
    p(-7,  5, T4, 14,  1);                                                       // top highlight
    p(-1,  6, T0,  2, 13);                                                       // leg split
    p(-8, 19, CO, 16,  3); p(-7, 20, G2, 14, 2); p(-7, 20, G3, 14, 1);

    // ── BELT
    p(-7,  1, CO, 14, 4); p(-6, 2, G2, 12, 2); p(-6, 2, G3, 12, 1);

    // ── CHAINMAIL HAUBERK — the mail reads as a stagger of light links over a
    //    dark ground; a flat plate would just look like the knight's cuirass.
    p(-7,-17, CO, 14, 19);
    p(-6,-16, T0, 12, 17); p(-5,-16, T1, 10, 16);
    p(-6,-16, T4, 12,  1);                                                       // top highlight
    for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 5; c++) {
            p(-5 + c * 2 + (r % 2), -14 + r * 2, r % 2 ? T2 : T3, 1, 1);
        }
    }
    p( 4,-15, T0,  2, 15);                                                       // shaded flank
    // gold-bordered surcoat panel with a rune
    p(-3,-13, CO, 7, 12); p(-2,-12, T2, 5, 10); p(-2,-12, T4, 5, 1);
    p(-2,-12, G2, 5,  1); p(-2, -3, G2, 5, 1);
    p(-1, -9, C1, 3,  3); p(-1, -9, C3, 3, 1);
    glow(-1, -9, C4, 3, 1, 0.45 + ep * 0.30);

    // ── PAULDRONS + COLLAR
    p(-11,-19, CO, 6, 7); p(-10,-18, T1, 4, 5); p(-10,-18, T4, 4, 1);
    p(-10,-18, G2, 4, 1);
    p(  5,-19, CO, 6, 7); p(  6,-18, T1, 4, 5); p(  6,-18, T4, 4, 1);
    p(  6,-18, G2, 4, 1);
    p(-6,-21, CO, 12, 3); p(-5,-20, T3, 10, 2); p(-5,-20, T4, 10, 1);

    // ── ARMS: bow hand forward, string hand drawn to the cheek
    p(-13,-14, CO, 6, 8); p(-12,-13, T1, 4, 6); p(-12,-13, T3, 4, 1);
    p(-15,-13, CO, 5, 5); p(-14,-12, K1, 3, 3); p(-14,-12, K2, 3, 1);            // bow hand
    p(  6,-15, CO, 6, 7); p(  7,-14, T1, 4, 5); p(  7,-14, T4, 4, 1);
    p(  3,-20 - draw, CO, 5, 5); p( 4,-19 - draw, K1, 3, 3);                     // string hand

    // ── LONGBOW (recurve limbs, lit string)
    p(-18,-34, CO, 4,  8); p(-17,-33, W2, 2, 6); p(-17,-33, W3, 2, 1);           // upper tip
    p(-19,-26, CO, 4, 22); p(-18,-25, W1, 2, 20); p(-18,-25, W3, 2, 1);          // upper limb
    p(-18, -6, CO, 5,  8); p(-17, -5, W2, 3, 6); p(-17, -5, W3, 3, 1);           // grip
    p(-19,  2, CO, 4, 22); p(-18,  3, W1, 2, 20);                                // lower limb
    p(-18, 24, CO, 4,  8); p(-17, 25, W2, 2, 6);                                 // lower tip
    p(-17,-30, G2, 2,  1); p(-17, 28, G2, 2, 1);                                 // gold nocks
    // string: straight at rest, drawn to a V when firing
    for (let i = 0; i < 30; i++) {
        const t  = i / 29;
        const sy = -30 + i * 2;
        const sx = -16 + Math.round(Math.sin(t * Math.PI) * draw * 9);
        glow(sx, sy, C3, 1, 2, 0.45 + ep * 0.20);
    }

    // ── QUIVER over the shoulder, three runed heads showing
    p( 7,-30, CO, 7, 20); p( 8,-29, W1, 5, 18); p( 8,-29, W3, 5, 1);
    p( 8,-24, G2, 5,  1); p( 8,-16, G2, 5, 1);                                   // gold bands
    for (let i = 0; i < 3; i++) {
        const ax = 8 + i * 2;
        p(ax, -37, CO, 2, 8); p(ax, -36, T2, 1, 6);                              // shaft
        p(ax-1, -39, CO, 4, 3); p(ax, -38, C1, 2, 2); p(ax, -38, C3, 2, 1);      // runed head
        glow(ax, -38, C4, 2, 1, 0.45 + ep * 0.28);
    }

    // ── NECK + HEAD
    p(-2,-23, CO, 4, 3); p(-1,-22, K0, 2, 2);
    p(-6,-35, CO, 12, 13);
    p(-5,-34, K1, 10, 11); p(-5,-34, K2, 10, 1);
    p( 3,-33, K0,  2,  9);
    p(-6,-36, CO, 12,  4); p(-5,-35, H1, 10, 2); p(-5,-35, H2, 10, 1);
    p(-7,-32, CO,  2,  5); p( 5,-32, CO, 2, 5);
    p(-7,-31, H0,  1,  4); p( 6,-31, H0, 1, 4);
    p(-4,-30, CO,  3,  2); p( 1,-30, CO, 3, 2);
    p(-3,-30, isAtk ? C4 : T4, 1, 1); p( 2,-30, isAtk ? C4 : T4, 1, 1);
    p(-1,-26, K0,  2,  1);

    // ── CIRCLET
    p(-7,-38, CO, 14, 3); p(-6,-37, G2, 12, 2); p(-6,-37, G4, 12, 1);
    p(-1,-40, CO,  3, 3); p( 0,-39, C3, 1, 1);
    glow( 0,-39, C4, 1, 1, 0.55 + ep * 0.30);

    if (isAtk) {
        glow(-1, -9, C4, 3, 3, 0.60);
        for (let i = 0; i < 3; i++) glow(8 + i * 2, -38, C4, 2, 1, 0.70);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAINER  —  Chain-whip exorcist in dark iron grey + sacred-gold markings
// ───────────────────────────────────────────────────
// SOUL CHAINER — 영혼의 결박자. Grey robe wound with black chain, blue spirit
// -fire running along the links.
// Lore: 검은 사슬을 휘감은 회색 로브, 사슬에서 푸른 영기가 흐르는 결박자.
// ───────────────────────────────────────────────────
function drawChainer(cx, cy, tower) {
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
    const surge = (now % 1300) / 1300;

    const CO='#000';
    const A0='#22242C', A1='#4A4E5A', A2='#7C8290', A3='#AEB4C2', A4='#E2E6EE';  // grey robe
    const N0='#0A0A10', N1='#1E1E28', N2='#34343E', N3='#52525E';                // black chain
    const E1='#0A5E96', E2='#22A8E0', E3='#7FDCFF', E4='#DDF4FF';                // spirit blue
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.12 + ep * 0.16;
    pUnitAura(ctx, cx, cy, -18, -34 + idleY, E2, 36, 62, isLeft, S);
    ctx.restore();

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, A1, 4, 3); p(-6, 23, A3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, A1, 4, 3); p( 2, 23, A3, 4, 1);

    // ── ROBE SKIRT
    p(-8,  4, CO, 16, 19);
    p(-7,  5, A0, 14, 17); p(-6,  5, A1, 12, 16); p(-4,  6, A2, 8, 14);
    p(-7,  5, A4, 14,  1);                                                       // top highlight
    p(-3,  7, A0,  1, 12); p( 2,  7, A0,  1, 12);
    p(-8, 19, CO, 16,  3); p(-7, 20, N1, 14, 2); p(-7, 20, N3, 14, 1);

    // ── ROBE TORSO
    p(-7,-17, CO, 14, 19);
    p(-6,-16, A0, 12, 17); p(-5,-16, A1, 10, 16); p(-3,-15, A2, 6, 14);
    p(-6,-16, A4, 12,  1);                                                       // top highlight

    // ── COLLAR
    p(-7,-20, CO, 14, 4); p(-6,-19, A2, 12, 2); p(-6,-19, A4, 12, 1);

    // ── SLEEVES
    p(-12,-16, CO, 6, 15); p(-11,-15, A1, 4, 13); p(-11,-15, A3, 4, 1);
    p(-12,  0, CO, 6,  5); p(-11,  1, K1, 4,  3); p(-11, 1, K2, 4, 1);
    p(  6,-16, CO, 6, 15); p(  7,-15, A1, 4, 13); p(  7,-15, A3, 4, 1);
    p(  6,  0, CO, 6,  5); p(  7,  1, K1, 4,  3); p(  7, 1, K2, 4, 1);

    // ── CHAINS WOUND ROUND THE BODY — one bandolier run across the chest, one
    //    round the waist, and a loose end swinging off each hand.
    pChain(p, -8, -14,  7,  -4, 7, N1, N3);                                      // across the chest
    pChain(p, -8,   1,  7,   1, 7, N1, N3);                                      // round the waist
    pChain(p, -12,  4, -14, 16, 5, N1, N3);                                      // loose end, left
    pChain(p,  8,   4, 11,  15, 5, N1, N3);                                      // loose end, right
    p(-15, 16, CO, 4, 4); p(-14, 17, N2, 2, 2);                                  // shackle cuffs
    p( 11, 15, CO, 4, 4); p( 12, 16, N2, 2, 2);

    // ── SPIRIT-FIRE travelling along the chest chain
    for (let i = 0; i < 4; i++) {
        const t  = (surge + i / 4) % 1;
        const lx = Math.round(-8 + 15 * t);
        const ly = Math.round(-14 + 10 * t);
        glow(lx, ly, E3, 3, 2, (1 - t) * 0.85);
    }
    glow(-8, 1, E2, 15, 1, 0.20 + ep * 0.18);

    // ── NECK + HEAD
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-4,-29, CO, 3, 2); p( 1,-29, CO, 3, 2);
    p(-3,-29, isAtk ? E4 : E3, 1, 1); p( 2,-29, isAtk ? E4 : E3, 1, 1);
    p(-1,-25, K0, 2, 1);

    // ── HOOD + CHAIN CIRCLET
    p(-8,-38, CO, 16, 7); p(-7,-37, A0, 14, 5); p(-7,-37, A2, 14, 1);
    p(-9,-33, CO,  3, 7); p(-8,-32, A0, 1, 6);
    p( 7,-33, CO,  3, 7); p( 8,-32, A0, 1, 6);
    pChain(p, -7, -34, 6, -34, 6, N1, N3);                                       // chain circlet

    if (isAtk) {
        glow(-8,-14, E4, 16, 12, 0.45);
        glow(-8,  1, E4, 16,  2, 0.55);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ICE  —  Cryomancer in pale blue crystal robes, frost wand
// ───────────────────────────────────────────────────
// FROST TAOIST — 빙결 도사. Pale blue-white coat, a frost-crystal staff, and
// his own breath freezing as it leaves him.
// Lore: 청백색 외투에 서리 결정 지팡이, 입김이 차갑게 응결되는 빙결 도사.
// ───────────────────────────────────────────────────
function drawIce(cx, cy, tower) {
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
    const breath = (now % 2200) / 2200;

    const CO='#000';
    const I0='#1C2E3E', I1='#3E6480', I2='#78A6C4', I3='#B6DCEE', I4='#F0FBFF';  // frost coat
    const C1='#0A6E96', C2='#22B8E0', C3='#7FE8FF', C4='#DDFAFF';                // ice crystal
    const W1='#5A4A34', W2='#8A7454', W3='#B89E74';                              // staff wood
    const G2='#B88000', G3='#FFD700';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';
    const H0='#3A3A48', H1='#6A6A80', H2='#A8A8C0';                              // grey topknot

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -18, -34 + idleY, C2, 36, 62, isLeft, S);
    ctx.restore();

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, I1, 4, 3); p(-6, 23, I3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, I1, 4, 3); p( 2, 23, I3, 4, 1);

    // ── LONG COAT (crossed front, taoist cut)
    p(-9,  4, CO, 18, 19);
    p(-8,  5, I0, 16, 17); p(-7,  5, I1, 14, 16); p(-5,  6, I2, 10, 14);
    p(-8,  5, I4, 16,  1);                                                       // top highlight
    p(-3,  7, I0,  1, 12); p( 3,  7, I0,  1, 12);                                // fold shadows
    p(-9, 19, CO, 18,  3); p(-8, 20, I3, 16, 2); p(-8, 20, I4, 16, 1);           // frosted hem

    // ── SASH
    p(-8,  1, CO, 16, 4); p(-7, 2, C1, 14, 2); p(-7, 2, C3, 14, 1);
    p(-2,  0, CO,  5, 5); p(-1, 1, C2,  3, 3); p(-1, 1, C4, 3, 1);
    glow(-1, 1, C4, 3, 1, 0.50 + ep * 0.30);

    // ── TORSO with a crossed collar
    p(-7,-17, CO, 14, 19);
    p(-6,-16, I0, 12, 17); p(-5,-16, I1, 10, 16); p(-3,-15, I2, 6, 14);
    p(-6,-16, I4, 12,  1);                                                       // top highlight
    p(-5,-16, I3,  4,  9); p( 1,-16, I3, 4, 9);                                  // crossed lapels
    p(-5,-16, I4,  4,  1); p( 1,-16, I4, 4, 1);
    p(-2, -6, CO,  5,  5); p(-1, -5, C1, 3, 3); p(-1, -5, C3, 3, 1);
    glow(-1, -5, C4, 3, 1, 0.45 + ep * 0.28);

    // ── COLLAR
    p(-7,-20, CO, 14, 4); p(-6,-19, I3, 12, 2); p(-6,-19, I4, 12, 1);

    // ── SLEEVES (wide taoist cuffs)
    p(-13,-16, CO, 7, 16); p(-12,-15, I1, 5, 14); p(-12,-15, I3, 4, 13);
    p(-12,-15, I4,  5, 1);
    p(-12,  1, CO, 6,  5); p(-11,  2, K1, 4,  3); p(-11, 2, K2, 4, 1);
    p(  6,-16, CO, 7, 13); p(  7,-15, I1, 5, 11); p(  7,-15, I3, 4, 10);
    p(  7,-15, I4,  5, 1);
    p(  7, -4, CO, 6,  5); p(  8, -3, K1, 4,  3); p(  8, -3, K2, 4, 1);

    // ── FROST-CRYSTAL STAFF
    p(10,-24, CO, 4, 48); p(11,-23, W1, 2, 46); p(11,-23, W3, 2, 1);
    p(10,-10, G2, 4, 1); p(10, 8, G2, 4, 1);                                     // gold bindings
    p( 9,-32, CO, 6,  9); p(10,-31, C1, 4, 7); p(10,-31, C3, 4, 1);              // crystal head
    p(11,-30, C2, 2,  5); p(11,-29, C4, 2, 2);
    p( 8,-28, CO, 3,  4); p( 9,-27, C2, 1, 3);                                   // side shards
    p(14,-28, CO, 3,  4); p(15,-27, C2, 1, 3);
    p(11,-36, CO, 3,  5); p(12,-35, C3, 1, 4);                                   // top spike
    glow(10,-31, C4, 4, 1, 0.50 + ep * 0.32);
    glow(12,-35, C4, 1, 3, 0.55 + ep * 0.28);

    // ── NECK + HEAD
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-4,-29, CO, 3, 1); p( 1,-29, CO, 3, 1);                                    // narrowed eyes
    p(-3,-29, isAtk ? C4 : I4, 1, 1); p( 2,-29, isAtk ? C4 : I4, 1, 1);
    p(-2,-25, K0, 4, 1);                                                         // mouth, breathing out

    // ── FREEZING BREATH — a plume that condenses and drifts as it leaves him
    for (let i = 0; i < 5; i++) {
        const t  = (breath + i / 5) % 1;
        const bx = 3 + Math.round(t * 9);
        const by = -25 - Math.round(t * 4) + ((i % 2) ? 1 : 0);
        const a  = (1 - t) * 0.7;
        p(bx, by, I3, 2, 1);
        glow(bx, by, C4, 2, 1, a);
    }

    // ── GREY TOPKNOT + FROST PIN
    p(-6,-36, CO, 12, 4); p(-5,-35, H1, 10, 2); p(-5,-35, H2, 10, 1);
    p(-7,-32, CO,  2, 5); p( 5,-32, CO, 2, 5);
    p(-7,-31, H0,  1, 4); p( 6,-31, H0, 1, 4);
    p(-2,-40, CO,  5, 5); p(-1,-39, H1, 3, 3); p(-1,-39, H2, 3, 1);              // topknot
    p( 2,-40, CO,  4, 2); p( 3,-39, C3, 2, 1);                                   // frost pin
    glow( 3,-39, C4, 2, 1, 0.50 + ep * 0.28);

    if (isAtk) {
        glow( 9,-32, C4, 6, 9, 0.65);
        glow(-1, -5, C4, 3, 3, 0.55);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// TRACKER  —  Dark-leather bounty hunter, wrist crossbow, hood
// ───────────────────────────────────────────────────
// SOUL TRACKER — 영혼 추적자. Silver cloak, hunter's leathers, a tracking
// lantern held out, both eyes burning blue.
// Lore: 은빛 망토에 추적의 등불을 든 사냥꾼풍 추적자, 두 눈동자가 푸르게 빛남.
// ───────────────────────────────────────────────────
function drawTracker(cx, cy, tower) {
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
    const swing = Math.round(Math.sin(now * 0.0032) * 1);

    const CO='#000';
    const Z0='#2E323E', Z1='#767E92', Z2='#B6BECE', Z3='#E2E8F2', Z4='#FFFFFF';  // silver cloak
    const L0='#241608', L1='#4A2E16', L2='#7A5028', L3='#A87848';                // hunter leather
    const E1='#0A5E96', E2='#22A8E0', E3='#7FDCFF', E4='#DDF4FF';                // tracking blue
    const G2='#B88000', G3='#FFD700';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.12 + ep * 0.17;
    pUnitAura(ctx, cx, cy, -18, -34 + idleY, E2, 36, 62, isLeft, S);
    ctx.restore();

    // ── SILVER CLOAK behind
    p(-12,-19, CO, 9, 34); p(-11,-18, Z0, 7, 32); p(-11,-18, Z2, 7, 1);
    p(-11, 10, Z1,  7,  4);
    p(  4,-19, CO, 9, 34); p(  5,-18, Z0, 7, 32); p(  5,-18, Z2, 7, 1);
    p(  5, 10, Z1,  7,  4);

    // ── BOOTS
    p(-7, 20, CO, 6, 5); p(-6, 21, L1, 4, 3); p(-6, 21, L3, 4, 1);
    p( 1, 20, CO, 6, 5); p( 2, 21, L1, 4, 3); p( 2, 21, L3, 4, 1);

    // ── LEATHER LEGS
    p(-7,  4, CO, 14, 17); p(-6,  5, L0, 12, 15); p(-5,  5, L1, 10, 14);
    p(-6,  5, L3, 12,  1);                                                       // top highlight
    p(-1,  6, L0,  2, 14);

    // ── BELT with pouches
    p(-8,  1, CO, 16, 4); p(-7, 2, L1, 14, 2); p(-7, 2, L3, 14, 1);
    p(-6,  5, CO,  4, 4); p(-5, 6, L2, 2, 2);
    p( 3,  5, CO,  4, 4); p( 4, 6, L2, 2, 2);

    // ── LEATHER JERKIN
    p(-7,-16, CO, 14, 18); p(-6,-15, L0, 12, 16); p(-5,-15, L1, 10, 15);
    p(-6,-15, L3, 12,  1);                                                       // top highlight
    p(-3,-14, L2,  6, 13);
    p(-6,-11, L0, 12,  1); p(-6, -5, L0, 12, 1);                                 // stitch lines

    // ── SILVER MANTLE + CLASP
    p(-9,-20, CO, 18, 5); p(-8,-19, Z1, 16, 3); p(-8,-19, Z4, 16, 1);
    p(-2,-19, CO,  5, 4); p(-1,-18, G2, 3, 2); p(-1,-18, G3, 3, 1);

    // ── ARMS, lantern out in front
    p(-12,-14, CO, 6, 13); p(-11,-13, L1, 4, 11); p(-11,-13, L3, 4, 1);
    p(-12, -2, CO, 6,  5); p(-11, -1, K1, 4,  3); p(-11, -1, K2, 4, 1);
    p(  6,-15, CO, 6, 10); p(  7,-14, L1, 4,  8); p(  7,-14, L3, 4, 1);
    p(  8,-22, CO, 6,  9); p(  9,-21, L1, 4,  7); p(  9,-21, L3, 4, 1);
    p(  8,-25, CO, 6,  5); p(  9,-24, K1, 4,  3); p(  9,-24, K2, 4, 1);

    // ── TRACKING LANTERN — hood, glazed body, blue soul-flame inside
    const lx = 9 + swing;
    p(lx+1,-22, G2, 2, 3);                                                       // hanger
    p(lx-1,-33, CO, 8, 4); p(lx,  -32, G2, 6, 2); p(lx, -32, G3, 6, 1);          // hood
    p(lx,  -30, CO, 6, 3); p(lx+1,-29, G2, 4, 1);                                // collar
    p(lx-1,-28, CO, 8,10); p(lx,  -27, E1, 6, 8);                                // glazed body
    p(lx,  -27, E2, 6,  2); p(lx+1,-25, E3, 4, 3);                               // flame
    p(lx+2,-24, E4, 2,  2);
    p(lx-1,-28, G2, 1, 10); p(lx+6,-28, G2, 1, 10);                              // frame posts
    p(lx-1,-19, CO, 8,  3); p(lx,  -18, G2, 6, 2); p(lx, -18, G3, 6, 1);         // base
    glow(lx+1,-25, E4, 4, 3, 0.55 + ep * 0.30);
    glow(lx,  -27, E3, 6, 1, 0.40 + ep * 0.26);
    // motes drifting off the lantern
    for (let i = 0; i < 3; i++) {
        const t = ((now * 0.0013) + i / 3) % 1;
        glow(lx + 7 + Math.round(t * 5), -26 + i * 3, E4, 1, 1, (1 - t) * 0.7);
    }

    // ── NECK + HEAD
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-4,-29, CO, 4, 3); p( 1,-29, CO, 4, 3);
    p(-3,-28, E2, 2, 1); p( 2,-28, E2, 2, 1);                                    // blue-burning eyes
    glow(-3,-28, E4, 2, 1, 0.75 + ep * 0.25);
    glow( 2,-28, E4, 2, 1, 0.75 + ep * 0.25);
    p(-1,-25, K0, 2, 1);

    // ── HUNTER'S HOOD
    p(-8,-38, CO, 16, 7); p(-7,-37, Z0, 14, 5); p(-7,-37, Z2, 14, 1);
    p(-9,-33, CO,  3, 7); p(-8,-32, Z0, 1, 6);
    p( 7,-33, CO,  3, 7); p( 8,-32, Z0, 1, 6);
    p(-3,-41, CO,  6, 4); p(-2,-40, Z1, 4, 3); p(-2,-40, Z3, 4, 1);              // peak

    if (isAtk) {
        glow(lx-1,-28, E4, 8, 10, 0.60);
        glow(-3,-28, E4, 2, 1, 0.95); glow(2,-28, E4, 2, 1, 0.95);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// TALISMAN  —  East-Asian exorcist, red & gold robes, paper talisman fan
// ───────────────────────────────────────────────────
// TALISMAN ADEPT — 부적술사. Yellow robe hung with explosive talismans at the
// shoulder and waist, an ember already lit at the fingertips.
// Lore: 황색 도복에 폭발 부적을 어깨와 허리에 두른 술사, 손끝에 불씨가 피어남.
// ───────────────────────────────────────────────────
function drawTalisman(cx, cy, tower) {
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
    const flick = Math.round(Math.sin(now * 0.011) * 1);

    const CO='#000';
    const Y0='#3A2A06', Y1='#7A5C10', Y2='#B8901C', Y3='#E8C038', Y4='#FFE894';  // yellow robe
    const P2='#C9B98E', P3='#EDE0BC', P4='#FFF8E0';                              // talisman paper
    const R2='#A81824', R3='#E0343C';                                            // ink
    const F1='#C43800', F2='#FF6A00', F3='#FFB020', F4='#FFE890';                // ember
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';
    const H0='#2A1A0E', H1='#4A3018', H2='#7A5028';

    ctx.save(); ctx.globalAlpha = 0.12 + ep * 0.17;
    pUnitAura(ctx, cx, cy, -18, -34 + idleY, F2, 36, 62, isLeft, S);
    ctx.restore();

    // ── SANDALS
    p(-7, 22, CO, 6, 5); p(-6, 23, Y1, 4, 3); p(-6, 23, Y3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, Y1, 4, 3); p( 2, 23, Y3, 4, 1);

    // ── ROBE SKIRT
    p(-8,  4, CO, 16, 19);
    p(-7,  5, Y0, 14, 17); p(-6,  5, Y1, 12, 16); p(-4,  6, Y2, 8, 14);
    p(-7,  5, Y4, 14,  1);                                                       // top highlight
    p(-3,  7, Y0,  1, 12); p( 2,  7, Y0,  1, 12);
    p(-8, 19, CO, 16,  3); p(-7, 20, R2, 14, 2); p(-7, 20, R3, 14, 1);

    // ── SASH
    p(-7,  1, CO, 14, 4); p(-6, 2, R2, 12, 2); p(-6, 2, R3, 12, 1);

    // ── ROBE TORSO (crossed front)
    p(-7,-17, CO, 14, 19);
    p(-6,-16, Y0, 12, 17); p(-5,-16, Y1, 10, 16); p(-3,-15, Y2, 6, 14);
    p(-6,-16, Y4, 12,  1);                                                       // top highlight
    p(-5,-16, Y3,  4,  9); p( 1,-16, Y3, 4, 9);                                  // crossed lapels
    p(-5,-16, Y4,  4,  1); p( 1,-16, Y4, 4, 1);

    // ── EXPLOSIVE TALISMANS — slips pinned at the shoulder and hung from the
    //    waist, each inked and each with a lit corner.
    const slip = (sx, sy, sway) => {
        p(sx, sy, CO, 4, 11);
        p(sx + 1, sy + 1, P2, 2, 9); p(sx + 1, sy + 1, P4, 2, 1);
        p(sx + 1, sy + 3, R2, 2, 1); p(sx + 1, sy + 6, R2, 2, 1);                // ink marks
        p(sx + 1, sy + 9 + sway, F1, 2, 1);                                      // smouldering corner
        glow(sx + 1, sy + 9 + sway, F3, 2, 1, 0.45 + ep * 0.28);
    };
    slip(-12,-20, flick);                                                        // shoulder
    slip(  8,-20,-flick);
    slip(-10,  3,-flick);                                                        // waist
    slip( -5,  3, flick);
    slip(  6,  3,-flick);

    // ── COLLAR
    p(-7,-20, CO, 14, 4); p(-6,-19, Y2, 12, 2); p(-6,-19, Y4, 12, 1);

    // ── SLEEVES, right hand up with the ember
    p(-12,-16, CO, 6, 15); p(-11,-15, Y1, 4, 13); p(-11,-15, Y3, 4, 1);
    p(-12,  0, CO, 6,  5); p(-11,  1, K1, 4,  3); p(-11, 1, K2, 4, 1);
    p(  6,-16, CO, 6, 10); p(  7,-15, Y1, 4,  8); p(  7,-15, Y3, 4, 1);
    p(  8,-24, CO, 6, 10); p(  9,-23, Y1, 4,  8); p(  9,-23, Y3, 4, 1);
    p(  8,-28, CO, 6,  5); p(  9,-27, K1, 4,  3); p(  9,-27, K2, 4, 1);

    // ── EMBER at the fingertips
    p(10,-32 + flick, CO, 4, 4); p(11,-31 + flick, F1, 2, 2);
    p(11,-31 + flick, F3, 2, 1);
    glow(11,-31 + flick, F4, 2, 2, 0.65 + ep * 0.30);
    for (let i = 0; i < 3; i++) {
        const t = ((now * 0.0018) + i / 3) % 1;
        glow(11 + ((i * 2) % 3), -33 - Math.round(t * 7), F4, 1, 1, (1 - t) * 0.7);
    }

    // ── NECK + HEAD
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-6,-35, CO, 12,  4); p(-5,-34, H1, 10, 2); p(-5,-34, H2, 10, 1);
    p(-7,-31, CO,  2,  5); p( 5,-31, CO, 2, 5);
    p(-7,-30, H0,  1,  4); p( 6,-30, H0, 1, 4);
    p(-4,-29, CO,  3,  2); p( 1,-29, CO, 3, 2);
    p(-3,-29, isAtk ? F4 : F3, 1, 1); p( 2,-29, isAtk ? F4 : F3, 1, 1);
    p(-1,-25, K0,  2,  1);

    // ── HEADBAND WITH A TALISMAN SLIP
    p(-7,-37, CO, 14, 3); p(-6,-36, R2, 12, 2); p(-6,-36, R3, 12, 1);
    p(-2,-42, CO,  5, 6); p(-1,-41, P3, 3, 4); p(-1,-41, P4, 3, 1);
    p(-1,-39, R2,  3, 1);

    if (isAtk) {
        glow(10,-32, F4, 4, 4, 0.80);
        glow(-12,-11, F4, 4, 4, 0.45); glow(8,-11, F4, 4, 4, 0.45);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MONK  —  Battle monk in ochre robes, bare arms, prayer beads + iron fists
// ───────────────────────────────────────────────────
// MACE MONK — 철퇴 승려. Russet kasaya, a golden mace shouldered, a holy seal
// burning on the brow.
// Lore: 적갈색 가사에 황금 철퇴를 짊어진 다부진 승려, 이마에 신성 인장.
// The mace is the unit's name and was not in the old art at all.
// ───────────────────────────────────────────────────
function drawMonk(cx, cy, tower) {
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
    const ep = (Math.sin(now * 0.004) + 1) / 2;

    const CO='#000';
    const R0='#2E1206', R1='#6A2C10', R2='#A0481C', R3='#C86A32', R4='#E8996A';  // russet kasaya
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8';
    const K0='#B87848', K1='#E8A870', K2='#FFC898';                              // weathered skin
    const S1='#5A4A34', S2='#8A7454';                                            // haft leather

    ctx.save(); ctx.globalAlpha = 0.12 + ep * 0.16;
    pUnitAura(ctx, cx, cy, -18, -32 + idleY, G3, 36, 58, isLeft, S);
    ctx.restore();

    // ── BARE FEET (stocky, planted wide)
    p(-9, 22, CO, 7, 5); p(-8, 23, K0, 5, 3); p(-8, 23, K1, 5, 1);
    p( 2, 22, CO, 7, 5); p( 3, 23, K0, 5, 3); p( 3, 23, K1, 5, 1);

    // ── KASAYA SKIRT (wide, stocky build)
    p(-10,  4, CO, 20, 19);
    p(-9,  5, R0, 18, 17); p(-8,  5, R1, 16, 16); p(-5,  6, R2, 10, 14);
    p(-9,  5, R4, 18,  1);                                                       // top highlight
    p(-4,  7, R0,  1, 12); p( 3,  7, R0,  1, 12);                                // fold shadows
    p(-10, 19, CO, 20, 3); p(-9, 20, G2, 18, 2); p(-9, 20, G3, 18, 1);

    // ── ROPE BELT
    p(-9,  1, CO, 18, 4); p(-8, 2, S1, 16, 2); p(-8, 2, S2, 16, 1);
    p(-2,  4, S1,  2, 5); p( 1,  4, S1, 2, 4);                                   // knot ends

    // ── BARE CHEST + KASAYA SASH over one shoulder
    p(-8,-17, CO, 17, 19);
    p(-7,-16, K0, 15, 17); p(-6,-16, K1, 13, 16); p(-4,-15, K2, 9, 6);
    p(-7,-16, K2, 15,  1);                                                       // top highlight
    p( 5,-15, K0,  2, 15);                                                       // shaded flank
    p(-5, -8, K0, 11,  1); p(-5, -4, K0, 11, 1);                                 // muscle shading
    // sash crossing the torso
    for (let i = 0; i < 9; i++) {
        p(-8 + i * 2, -16 + i * 2, CO, 5, 4);
        p(-7 + i * 2, -15 + i * 2, R1, 3, 3);
        p(-7 + i * 2, -15 + i * 2, R3, 3, 1);
    }

    // ── ARMS (thick), right reaching back to the haft
    p(-13,-15, CO, 6, 15); p(-12,-14, K0, 4, 13); p(-12,-14, K2, 4, 1);
    p(-13,  1, CO, 6,  5); p(-12,  2, K1, 4,  3); p(-12, 2, K2, 4, 1);
    p(  7,-16, CO, 6, 12); p(  8,-15, K0, 4, 10); p(  8,-15, K2, 4, 1);
    p(  8,-25, CO, 6, 10); p(  9,-24, K0, 4,  8); p(  9,-24, K2, 4, 1);
    p(  8,-28, CO, 6,  5); p(  9,-27, K1, 4,  3); p(  9,-27, K2, 4, 1);          // gripping fist

    // ── GOLDEN MACE, shouldered — leather haft, flanged gold head
    p( 9,-24, CO, 4, 26); p(10,-23, S1, 2, 24); p(10,-23, S2, 2, 1);             // haft
    p( 9,-14, G2, 4, 1); p( 9, -4, G2, 4, 1);                                    // bindings
    p( 8,-36, CO, 8, 12); p( 9,-35, G1, 6, 10); p( 9,-35, G4, 6, 1);             // head core
    p(10,-34, G2, 4,  8); p(11,-33, G3, 2, 6);
    for (let i = 0; i < 3; i++) {                                                // flanges
        p( 6,-34 + i * 4, CO, 3, 4); p( 7,-33 + i * 4, G2, 1, 2);
        p(15,-34 + i * 4, CO, 3, 4); p(15,-33 + i * 4, G2, 1, 2);
    }
    p(10,-39, CO, 4,  4); p(11,-38, G3, 2, 2); p(11,-38, G4, 2, 1);              // finial
    glow( 9,-35, G4, 6, 1, 0.40 + ep * 0.28);
    glow(11,-38, G4, 2, 1, 0.45 + ep * 0.26);

    // ── NECK + HEAD (shaven, broad)
    p(-3,-22, CO, 7, 3); p(-2,-21, K0, 5, 2);
    p(-7,-35, CO, 14, 14);
    p(-6,-34, K0, 12, 12); p(-5,-34, K1, 10, 11); p(-4,-33, K2, 7, 4);
    p(-6,-34, K2, 12,  1);                                                       // top highlight
    p( 4,-33, K0,  2, 10);
    p(-5,-29, CO,  3,  2); p( 2,-29, CO, 3, 2);                                  // eyes
    p(-4,-29, K2,  1,  1); p( 3,-29, K2, 1, 1);
    p(-2,-25, K0,  5,  1);                                                       // set mouth
    p(-6,-31, K0, 12,  1);                                                       // brow ridge

    // ── HOLY SEAL burning on the brow
    p(-2,-32, CO, 5, 4); p(-1,-31, G2, 3, 2); p(-1,-31, G4, 3, 1);
    p( 0,-31, G3, 1, 1);
    glow(-1,-31, G4, 3, 2, 0.55 + ep * 0.35);

    if (isAtk) {
        glow( 8,-36, G4, 8, 12, 0.60);
        glow(-1,-31, G4, 3, 2, 0.85);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// NECROMANCER  —  Dark summoner in skull-adorned robes, bone staff
// ───────────────────────────────────────────────────
// NECROMANCER — 강령술사. Violet hood, a skull-topped stave, soul mist running
// off the free hand.
// Lore: 보랏빛 후드에 해골 장식 지팡이, 손끝에 영혼의 안개를 뿜는 강령술사.
// Its two T3s were redrawn first, which left this end of the line looking a
// tier older than its own children.
// ───────────────────────────────────────────────────
function drawNecromancer(cx, cy, tower) {
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
    const mist = (now % 2000) / 2000;

    const CO='#000';
    const V0='#150826', V1='#331358', V2='#5A2394', V3='#8A4CCC', V4='#C29AF0';  // violet
    const E0='#04361A', E1='#0A7A3A', E2='#18C468', E3='#5FF2A4', E4='#C8FFE2';  // soul green
    const B1='#8A8478', B2='#C6C0B2', B3='#EDE8DC', B4='#FFFFFF';                // bone
    const W1='#4A3A28', W2='#77603F';                                            // stave wood
    const K0='#B07A48', K1='#E0B088', K2='#F8D0A8';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -18, -34 + idleY, V3, 36, 62, isLeft, S);
    ctx.restore();

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, V1, 4, 3); p(-6, 23, V3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, V1, 4, 3); p( 2, 23, V3, 4, 1);

    // ── ROBE SKIRT
    p(-8,  4, CO, 16, 19);
    p(-7,  5, V0, 14, 17); p(-6,  5, V1, 12, 16); p(-4,  6, V2, 8, 14);
    p(-7,  5, V4, 14,  1);                                                       // top highlight
    p(-3,  7, V0,  1, 12); p( 2,  7, V0,  1, 12);
    p(-8, 19, CO, 16,  3); p(-7, 20, E0, 14, 2); p(-7, 20, E2, 14, 1);           // soul-lit hem

    // ── BONE-CHARM BELT
    p(-7,  1, CO, 14, 4); p(-6, 2, V2, 12, 2); p(-6, 2, V4, 12, 1);
    for (let i = 0; i < 4; i++) { p(-5 + i * 4, 5, CO, 3, 4); p(-4 + i * 4, 6, B2, 1, 2); }

    // ── ROBE TORSO
    p(-7,-17, CO, 14, 19);
    p(-6,-16, V0, 12, 17); p(-5,-16, V1, 10, 16); p(-3,-15, V2, 6, 14);
    p(-6,-16, V4, 12,  1);                                                       // top highlight
    p(-2,-11, CO,  5,  5); p(-1,-10, E1, 3, 3); p(-1,-10, E3, 3, 1);             // soul gem
    glow(-1,-10, E4, 3, 1, 0.55 + ep * 0.32);

    // ── SLEEVES, free hand out to spill mist
    p(-13,-16, CO, 7, 15); p(-12,-15, V1, 5, 13); p(-12,-15, V3, 4, 12);
    p(-12,-15, V4,  5, 1);
    p(-13, -2, CO, 6,  5); p(-12, -1, B2, 4,  3); p(-12, -1, B3, 4, 1);          // skeletal hand
    p(  6,-16, CO, 7, 13); p(  7,-15, V1, 5, 11); p(  7,-15, V3, 4, 10);
    p(  7,-15, V4,  5, 1);
    p(  7, -4, CO, 6,  5); p(  8, -3, B2, 4,  3); p(  8, -3, B3, 4, 1);

    // ── SOUL MIST spilling off the free hand
    for (let i = 0; i < 5; i++) {
        const t  = (mist + i / 5) % 1;
        const mx = -13 + ((i * 2) % 5);
        const my = 2 + Math.round(t * 10);
        p(mx, my, E0, 2, 1);
        glow(mx, my, E3, 2, 1, (1 - t) * 0.65);
    }

    // ── SKULL-TOPPED STAVE
    p(10,-28, CO, 4, 52); p(11,-27, W1, 2, 50); p(11,-27, W2, 2, 1);
    p(10,-14, E1, 4, 1); p(10, 4, E1, 4, 1);                                     // soul bindings
    p( 9,-38, CO, 8, 10); p(10,-37, B1, 6, 8); p(10,-37, B3, 6, 1);              // skull
    p(11,-35, CO, 2,  3); p(14,-35, CO, 2, 3);                                   // sockets
    p(11,-35, E1, 2,  2); p(14,-35, E1, 2, 2);
    glow(11,-35, E3, 2, 2, 0.70 + ep * 0.28);
    glow(14,-35, E3, 2, 2, 0.70 + ep * 0.28);
    p(10,-31, CO, 6,  2); p(11,-30, B3, 4, 1);                                   // jaw
    for (let i = 0; i < 3; i++) p(11 + i * 2, -31, CO, 1, 2);
    p( 8,-36, CO, 2,  4); p(15,-36, CO, 2, 4);                                   // horns
    p( 8,-36, B2, 1,  3); p(16,-36, B2, 1, 3);

    // ── FACE inside the hood
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);
    p(-5,-32, CO, 10, 11); p(-4,-31, K1, 8, 9); p(-4,-31, K2, 8, 1);
    p( 2,-30, K0,  2,  7);
    p(-3,-28, CO, 3, 2); p( 1,-28, CO, 3, 2);
    p(-2,-28, isAtk ? E4 : E3, 1, 1); p( 2,-28, isAtk ? E4 : E3, 1, 1);
    p(-1,-24, K0, 2, 1);

    // ── VIOLET HOOD
    p(-8,-38, CO, 16, 8); p(-7,-37, V0, 14, 6); p(-6,-36, V1, 12, 5);
    p(-7,-37, V3, 14,  1);                                                       // top highlight
    p(-3,-41, CO,  6, 4); p(-2,-40, V1, 4, 3); p(-2,-40, V3, 4, 1);              // peak
    p(-9,-33, CO,  3, 8); p(-8,-32, V0, 1, 7);
    p( 7,-33, CO,  3, 8); p( 8,-32, V0, 1, 7);
    p(-6,-33, E0, 12,  1);                                                       // soul-lit hood rim
    glow(-6,-33, E2, 12, 1, 0.22 + ep * 0.20);

    if (isAtk) {
        glow(11,-35, E4, 2, 2, 0.90); glow(14,-35, E4, 2, 2, 0.90);
        glow(-1,-10, E4, 3, 3, 0.60);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// GUARDIAN  —  Heavy gold plate knight, tower shield + morning star
// ───────────────────────────────────────────────────
// SANCTUARY GUARDIAN — 성소 수호자. White chainmail, gold cross shield, a
// consecrated sword.
// Lore: 백색 사슬 갑주에 황금 십자 방패, 축성된 검을 든 굳건한 수호자.
// ───────────────────────────────────────────────────
function drawGuardian(cx, cy, tower) {
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
    const ep = (Math.sin(now * 0.004) + 1) / 2;

    const CO='#000';
    const M0='#3A3E4A', M1='#767E92', M2='#B6BECE', M3='#E2E8F2', M4='#FFFFFF';  // white mail
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8';
    const B1='#2A4A8E', B2='#4A72C4';                                            // shield field
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.12 + ep * 0.16;
    pUnitAura(ctx, cx, cy, -20, -34 + idleY, G3, 40, 60, isLeft, S);
    ctx.restore();

    // ── SABATONS
    p(-9, 22, CO, 8, 5); p(-8, 23, M1, 6, 3); p(-8, 23, M3, 6, 1);
    p( 2, 22, CO, 8, 5); p( 3, 23, M1, 6, 3); p( 3, 23, M3, 6, 1);

    // ── MAIL SKIRT — links rather than plate, per the lore
    p(-9,  4, CO, 18, 19); p(-8,  5, M0, 16, 17);
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) p(-8 + c * 2 + (r % 2), 6 + r * 2, r % 2 ? M1 : M2, 1, 1);
    }
    p(-8,  5, M4, 16,  1);                                                       // top highlight
    p(-9, 19, CO, 18,  3); p(-8, 20, G2, 16, 2); p(-8, 20, G3, 16, 1);

    // ── BELT
    p(-8,  1, CO, 16, 4); p(-7, 2, G1, 14, 2); p(-7, 2, G3, 14, 1);

    // ── MAIL HAUBERK
    p(-7,-17, CO, 14, 19); p(-6,-16, M0, 12, 17);
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 6; c++) p(-6 + c * 2 + (r % 2), -15 + r * 2, r % 2 ? M1 : M2, 1, 1);
    }
    p(-6,-16, M4, 12,  1);                                                       // top highlight
    p( 4,-15, M0,  2, 15);                                                       // shaded flank

    // ── PAULDRONS + COLLAR
    p(-12,-20, CO, 6, 8); p(-11,-19, M1, 4, 6); p(-11,-19, M4, 4, 1);
    p(-11,-19, G2, 4, 1);
    p(  6,-20, CO, 6, 8); p(  7,-19, M1, 4, 6); p(  7,-19, M4, 4, 1);
    p(  7,-19, G2, 4, 1);
    p(-6,-21, CO, 12, 3); p(-5,-20, M3, 10, 2); p(-5,-20, M4, 10, 1);

    // ── ARMS
    p(-12,-14, CO, 6, 13); p(-11,-13, M1, 4, 11); p(-11,-13, M3, 4, 1);
    p(-12, -2, CO, 6,  5); p(-11, -1, M2, 4,  3); p(-11, -1, M4, 4, 1);
    p(  6,-14, CO, 6, 13); p(  7,-13, M1, 4, 11); p(  7,-13, M3, 4, 1);
    p(  6, -2, CO, 6,  5); p(  7, -1, M2, 4,  3); p(  7, -1, M4, 4, 1);

    // ── GOLD CROSS SHIELD (heater shape: square shoulders tapering to a point)
    p(-21,-16, CO, 11, 18);
    p(-20,-15, G1,  9, 16); p(-20,-15, G4, 9, 1);                                // rim + top light
    p(-19,-14, B1,  7, 14); p(-18,-13, B2, 5, 12);                               // blue field
    p(-20,  2, CO, 11,  4); p(-19,  3, G1, 9, 3);                                // taper
    p(-18,  6, CO,  7,  4); p(-17,  7, G1, 5, 2);
    p(-16, 10, CO,  4,  3); p(-15, 11, G2, 2, 1);                                // point
    // bold cross on the field
    p(-17,-13, CO,  3, 16); p(-16,-12, G3, 1, 14);
    p(-21, -7, CO, 11,  3); p(-20, -6, G3, 9, 1);
    glow(-16,-12, G4, 1, 14, 0.35 + ep * 0.26);
    glow(-20, -6, G4, 9,  1, 0.35 + ep * 0.26);

    // ── CONSECRATED SWORD, held upright
    p(10,-40, CO, 5, 34); p(11,-39, M2, 3, 32); p(11,-39, M4, 3, 1);             // blade
    p(11,-44, CO, 3,  5); p(12,-43, M3, 1, 4);                                   // point
    p( 8, -7, CO, 9,  4); p( 9, -6, G2, 7, 2); p( 9, -6, G4, 7, 1);              // crossguard
    p(11, -3, CO, 3,  5); p(12, -2, G1, 1, 3);                                   // grip
    p(10,  2, CO, 5,  4); p(11,  3, G3, 3, 2);                                   // pommel
    glow(11,-39, M4, 3, 1, 0.30 + ep * 0.24);

    // ── NECK + HEAD
    p(-2,-23, CO, 4, 3); p(-1,-22, K0, 2, 2);
    p(-6,-35, CO, 12, 13);
    p(-5,-34, K1, 10, 11); p(-5,-34, K2, 10, 1);
    p( 3,-33, K0,  2,  9);
    p(-4,-30, CO, 3, 2); p( 1,-30, CO, 3, 2);
    p(-3,-30, isAtk ? G4 : M4, 1, 1); p( 2,-30, isAtk ? G4 : M4, 1, 1);
    p(-1,-26, K0, 2, 1);

    // ── MAIL COIF + GOLD BAND
    p(-7,-37, CO, 14, 5); p(-6,-36, M0, 12, 3);
    for (let c = 0; c < 6; c++) p(-6 + c * 2, -36, M2, 1, 1);
    p(-8,-33, CO,  2, 8); p( 6,-33, CO, 2, 8);
    p(-7,-32, M1,  1, 7); p( 7,-32, M1, 1, 7);
    p(-7,-38, CO, 14, 2); p(-6,-37, G2, 12, 1);

    if (isAtk) {
        glow(11,-40, M4, 3, 34, 0.40);
        glow(-16,-12, G4, 1, 14, 0.55); glow(-20,-6, G4, 9, 1, 0.55);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ALCHEMIST  —  Mad scientist in emerald robes, alchemical circle on chest
// ────────────────────────────────────────────────────
// EXORCIST ALCHEMIST — 퇴마 연금술사. Leather apron, a belt of vials, and a
// purification flask boiling in his raised hand.
// Lore: 가죽 앞치마에 유리병 벨트, 한 손에 보글거리는 정화 플라스크를 든 연금술사.
// ────────────────────────────────────────────────────
function drawAlchemist(cx, cy, tower) {
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

    const CO='#000';
    const L0='#241608', L1='#5A3A1E', L2='#8A5C30', L3='#B98450', L4='#E0B080';  // leather
    const S1='#8C8474', S2='#C9C1AC', S3='#EDE7D6', S4='#FFFCF2';                // linen shirt
    const C1='#0E7A6A', C2='#1FC4A8', C3='#7FF0DC', C4='#DDFFF6';                // purifier teal
    const V1='#7A2A80', V2='#C4463C', V3='#C8A014';                              // other vials
    const G2='#B88000', G3='#FFD700';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';
    const H0='#3A2A14', H1='#6A4E20', H2='#A87C34';                              // brown hair

    ctx.save(); ctx.globalAlpha = 0.12 + ep * 0.16;
    pUnitAura(ctx, cx, cy, -18, -34 + idleY, C2, 36, 62, isLeft, S);
    ctx.restore();

    // ── BOOTS
    p(-7, 22, CO, 6, 5); p(-6, 23, L1, 4, 3); p(-6, 23, L3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, L1, 4, 3); p( 2, 23, L3, 4, 1);

    // ── TROUSERS
    p(-7,  6, CO, 14, 17); p(-6,  7, S1, 12, 15); p(-5,  7, S2, 10, 14);
    p(-6,  7, S4, 12,  1);                                                       // top highlight
    p(-1,  8, CO,  2, 14);                                                       // leg split

    // ── LEATHER APRON (the silhouette read: bib up the chest, skirt to the shin)
    p(-6,-12, CO, 12,  6); p(-5,-11, L1, 10, 4); p(-5,-11, L3, 10, 1);           // bib
    p(-8, -6, CO, 16, 24); p(-7, -5, L0, 14, 22); p(-6, -5, L1, 12, 21);
    p(-4, -4, L2,  8, 19);                                                       // lit panel
    p(-7, -5, L4, 14,  1);                                                       // top highlight
    p(-7, 15, L0, 14,  1); p(-2, -4, L0, 1, 19);                                 // seam + stitch line
    p(-6,-12, L2,  2,  1); p( 4,-12, L2, 2, 1);                                  // neck straps
    p(-6,-14, CO,  2,  3); p( 4,-14, CO, 2, 3);
    p(-6,-14, L2,  2,  2); p( 4,-14, L2, 2, 2);

    // ── VIAL BELT (four corked vials, each its own reagent)
    p(-9, -2, CO, 18, 5); p(-8, -1, L1, 16, 3); p(-8, -1, L3, 16, 1);
    const vial = [C2, V1, V2, V3];
    for (let i = 0; i < 4; i++) {
        const vx = -8 + i * 4;
        p(vx, 3, CO, 3, 6); p(vx + 1, 4, vial[i], 1, 4);
        p(vx, 2, CO, 3, 2); p(vx + 1, 2, L3, 1, 1);                              // cork
        glow(vx + 1, 4, vial[i], 1, 2, 0.30 + ep * 0.22);
    }

    // ── SHIRT + COLLAR
    p(-7,-17, CO, 14, 6); p(-6,-16, S2, 12, 4); p(-6,-16, S4, 12, 1);
    p(-7,-20, CO, 14, 4); p(-6,-19, S3, 12, 2); p(-6,-19, S4, 12, 1);

    // ── SLEEVES (rolled, forearms bare)
    p(-12,-16, CO, 6, 10); p(-11,-15, S2, 4, 8); p(-11,-15, S4, 4, 1);
    p(-12, -7, CO, 6,  7); p(-11, -6, K1, 4, 5); p(-11, -6, K2, 4, 1);
    p(  6,-16, CO, 6,  9); p(  7,-15, S2, 4, 7); p(  7,-15, S4, 4, 1);
    p(  8,-25, CO, 6, 11); p(  9,-24, K1, 4, 9); p(  9,-24, K2, 4, 1);           // raised forearm
    p(  8,-28, CO, 6,  5); p(  9,-27, K1, 4, 3); p(  9,-27, K2, 4, 1);           // hand

    // ── PURIFICATION FLASK (round belly, narrow neck, boiling)
    p( 8,-42, CO, 8,  4); p( 9,-41, C1, 6, 2);                                   // wide mouth
    p( 9,-39, CO, 6,  4); p(10,-38, C1, 4, 3);                                   // neck
    p( 7,-36, CO, 10, 9); p( 8,-35, C1, 8, 7); p( 8,-35, C3, 8, 1);              // belly + surface
    p( 8,-32, C2,  8,  4);                                                       // liquid body
    p( 9,-31, C3,  3,  2);                                                       // lit lens spot
    // bubbles rising through the liquid, each on its own phase
    for (let i = 0; i < 5; i++) {
        const t  = ((now * 0.0016) + i / 5) % 1;
        const bx = 9 + ((i * 2) % 6);
        const by = -28 + Math.round(-t * 9);
        p(bx, by, C4, 1, 1);
        glow(bx, by, C4, 1, 1, (1 - t) * 0.8);
    }
    glow( 8,-35, C3, 8, 1, 0.40 + ep * 0.30);
    glow( 8,-32, C2, 8, 4, 0.18 + ep * 0.16);

    // ── NECK
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);

    // ── HEAD
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-4,-29, CO, 3, 2); p( 1,-29, CO, 3, 2);
    p(-3,-29, S4, 1, 1); p( 2,-29, S4, 1, 1);
    p(-1,-25, K0, 2, 1);

    // ── GOGGLES PUSHED UP ON THE BROW + HAIR
    p(-6,-36, CO, 12, 4); p(-5,-35, H1, 10, 2); p(-5,-35, H2, 10, 1);            // hair
    p(-7,-33, CO, 14, 3); p(-6,-32, L1, 12, 2); p(-6,-32, L3, 12, 1);            // strap
    p(-6,-33, CO,  5, 4); p(-5,-32, C1,  3, 2); p(-5,-32, C3, 3, 1);             // left lens
    p( 1,-33, CO,  5, 4); p( 2,-32, C1,  3, 2); p( 2,-32, C3, 3, 1);             // right lens
    glow(-5,-32, C3, 3, 1, 0.35 + ep * 0.25);
    glow( 2,-32, C3, 3, 1, 0.35 + ep * 0.25);

    if (isAtk) {
        glow( 7,-36, C4, 10, 9, 0.60);
        glow( 8,-42, C4,  8, 4, 0.50);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MIRROR  —  Reflection mage in silver & white, holds a sacred mirror
// ────────────────────────────────────────────────────
// MIRROR PROPHET — 거울 예언자. Silver vestments, raised hand mirror whose face
// runs through the spectrum, and a faint reflected double behind her.
// Lore: 은빛 의복에 손거울을 든 신비로운 예언자, 거울 면이 무지개빛으로 일렁임.
// ────────────────────────────────────────────────────
function drawMirror(cx, cy, tower) {
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
    const ep  = (Math.sin(now * 0.004) + 1) / 2;
    // One shared spectrum cycle so mirror, veil and staff in this whole line
    // shimmer on the same beat rather than each drifting on its own.
    const IRI = ['#FF7ACF', '#7FE8FF', '#FFE79A', '#B98CFF', '#8CFFC0'];
    const iri = (k) => IRI[(Math.floor(now * 0.004) + k) % IRI.length];

    const CO='#000';
    const Z0='#2E323E', Z1='#767E92', Z2='#B6BECE', Z3='#E2E8F2', Z4='#FFFFFF';  // silver
    const V0='#26203A', V1='#463C68', V2='#6E5F9C';                              // violet lining
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';
    const H0='#4A4258', H1='#7E7492', H2='#B4A8C8';                              // ash hair

    ctx.save(); ctx.globalAlpha = 0.12 + ep * 0.16;
    pUnitAura(ctx, cx, cy, -18, -34 + idleY, Z3, 36, 62, isLeft, S);
    ctx.restore();

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, Z0, 4, 3); p(-6, 23, Z2, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, Z0, 4, 3); p( 2, 23, Z2, 4, 1);

    // ── LOWER VESTMENT
    p(-8,  4, CO, 16, 19);
    p(-7,  5, Z0, 14, 17); p(-6,  5, Z1, 12, 16); p(-4,  6, Z2, 8, 14);
    p(-7,  5, Z4, 14,  1);                                                       // top highlight
    p(-3,  7, Z0,  1, 12); p( 2,  7, Z0,  1, 12);                                // fold shadows
    p(-8, 19, CO, 16,  3); p(-7, 20, V1, 14, 2); p(-7, 20, V2, 14, 1);           // violet hem

    // ── SASH
    p(-7,  1, CO, 14, 4); p(-6, 2, V1, 12, 2); p(-6, 2, V2, 12, 1);
    p(-2,  0, CO,  5, 5); p(-1, 1, Z2,  3, 3); p(-1, 1, Z4, 3, 1);
    glow(-1, 1, iri(0), 3, 1, 0.45 + ep * 0.30);

    // ── TORSO
    p(-7,-17, CO, 14, 19);
    p(-6,-16, Z0, 12, 17); p(-5,-16, Z1, 10, 16); p(-3,-15, Z2, 6, 14);
    p(-6,-16, Z4, 12,  1);                                                       // top highlight
    p(-5,-16, V1,  3, 17); p( 3,-16, V1, 3, 17);                                 // violet lapels
    // spectrum bead at the throat
    p(-1,-12, CO, 3, 3); p( 0,-11, iri(1), 1, 1);
    glow( 0,-11, iri(1), 1, 1, 0.65 + ep * 0.30);

    // ── COLLAR
    p(-7,-20, CO, 14, 4); p(-6,-19, Z3, 12, 2); p(-6,-19, Z4, 12, 1);

    // ── SLEEVES (outside the torso outline so they read)
    p(-12,-16, CO, 6, 16); p(-11,-15, Z1, 4, 14); p(-11,-15, Z2, 3, 13);
    p(-11,-15, Z4,  4, 1);
    p(-12, -1, CO, 6,  5); p(-11,  0, K1, 4, 3); p(-11, 0, K2, 4, 1);
    p(  6,-16, CO, 6, 11); p(  7,-15, Z1, 4,  9); p(  7,-15, Z2, 3, 8);
    p(  7,-15, Z4,  4, 1);
    p(  8,-26, CO, 6, 12); p(  9,-25, Z1, 4, 10); p(  9,-25, Z2, 3, 9);
    p(  9,-25, Z4,  4, 1);
    p(  8,-29, CO, 6,  5); p(  9,-28, K1, 4, 3); p(  9,-28, K2, 4, 1);           // raised hand

    // ── HAND MIRROR — silver frame, spectrum face. Three bands cycling on
    //    different offsets is what sells "iridescent" at this pixel budget.
    p( 6,-45, CO, 11, 16);                                                       // frame outline
    p( 7,-44, Z1,  9, 14); p( 7,-44, Z4, 9, 1);                                  // frame + highlight
    p( 8,-43, CO,  7, 12);                                                       // glass recess
    p( 8,-42, iri(0), 7, 3);
    p( 8,-39, iri(1), 7, 3);
    p( 8,-36, iri(2), 7, 3);
    p( 8,-33, iri(3), 7, 2);
    glow( 8,-42, iri(0), 7, 1, 0.45 + ep * 0.28);
    glow( 8,-39, iri(1), 7, 1, 0.45 + ep * 0.28);
    glow( 8,-36, iri(2), 7, 1, 0.45 + ep * 0.28);
    p( 9,-42, Z4,  1, 11);                                                       // sheen streak
    p(10,-30, CO,  3,  4); p(11,-30, Z1, 1, 3);                                  // handle
    p( 9,-27, CO,  5,  3); p(10,-26, Z2, 3, 1);                                  // pommel

    // ── SPECTRUM MOTES shed from the glass
    for (let i = 0; i < 4; i++) {
        const t = ((now * 0.0011) + i / 4) % 1;
        glow(13 + Math.round(t * 5), -40 + i * 3 + Math.round(t * 4), iri(i), 1, 1, (1 - t) * 0.7);
    }

    // ── NECK
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);

    // ── HEAD
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-4,-29, CO, 3, 2); p( 1,-29, CO, 3, 2);
    p(-3,-29, isAtk ? iri(2) : Z4, 1, 1); p( 2,-29, isAtk ? iri(2) : Z4, 1, 1);
    p(-1,-25, K0, 2, 1);

    // ── SILVER CIRCLET + VEILED HAIR
    p(-7,-35, CO, 14, 4); p(-6,-34, H1, 12, 2); p(-6,-34, H2, 12, 1);            // hair
    p(-8,-31, CO,  3, 9); p(-7,-30, H0, 1, 8);                                   // side fall
    p( 6,-31, CO,  3, 9); p( 7,-30, H0, 1, 8);
    p(-7,-37, CO, 14, 3); p(-6,-36, Z2, 12, 2); p(-6,-36, Z4, 12, 1);            // circlet
    p(-1,-39, CO,  3, 3); p( 0,-38, iri(3), 1, 1);                               // brow stone
    glow( 0,-38, iri(3), 1, 1, 0.60 + ep * 0.30);

    if (isAtk) {
        glow( 8,-42, iri(0), 7, 12, 0.55);
        glow( 0,-38, iri(3), 1, 1, 0.80);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSASSIN  —  Shadow blade in black, dual daggers + void-step effect
// ───────────────────────────────────────────────────
// SHADOW ASSASSIN — 그림자 암살자. Black hood, white mask, a curved blade
// reversed in each hand.
// Lore: 검은 후드와 백색 가면, 양손에 휘어진 쌍검을 쥔 민첩한 그림자.
// ───────────────────────────────────────────────────
function drawAssassin(cx, cy, tower) {
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
    const ep   = (Math.sin(now * 0.005) + 1) / 2;
    const dash = isAtk ? 2 : 0;

    const CO='#000';
    const K0='#08080E', K1='#1A1A26', K2='#2E2E42', K3='#4A4A66', K4='#78789A';  // blacks
    const M1='#7E7E90', M2='#C8C8D4', M3='#EDEDF4', M4='#FFFFFF';                // porcelain mask
    const R1='#5A0010', R2='#A00020', R3='#E02440';                              // crimson sash
    const S1='#5A6478', S2='#98A2B8', S3='#D2DAEA', S4='#FFFFFF';                // blade steel

    ctx.save(); ctx.globalAlpha = 0.11 + ep * 0.14;
    pUnitAura(ctx, cx, cy, -18, -32 + idleY, K4, 36, 58, isLeft, S);
    ctx.restore();

    // ── BOOTS (wrapped, light-footed)
    p(-7, 20, CO, 6, 5); p(-6, 21, K1, 4, 3); p(-6, 21, K3, 4, 1);
    p( 1, 20, CO, 6, 5); p( 2, 21, K1, 4, 3); p( 2, 21, K3, 4, 1);
    p(-7, 16, K2, 6, 1); p( 1, 16, K2, 6, 1);                                    // wrap bands

    // ── LEGS
    p(-7,  2, CO, 14, 19); p(-6,  3, K0, 12, 17); p(-5,  4, K1, 10, 15);
    p(-6,  3, K4, 12,  1);                                                       // top highlight
    p(-1,  4, K0,  2, 15);                                                       // leg split

    // ── CRIMSON SASH
    p(-8,  0, CO, 16, 4); p(-7, 1, R1, 14, 2); p(-7, 1, R3, 14, 1);
    p( 4,  3, R2,  2, 7); p( 6,  3, R1, 1, 5);                                   // trailing tail

    // ── TORSO (fitted, cross-strapped)
    p(-7,-16, CO, 14, 18); p(-6,-15, K0, 12, 16); p(-5,-15, K1, 10, 15);
    p(-6,-15, K4, 12,  1);                                                       // top highlight
    p(-3,-14, K2,  6, 13);
    p(-6,-12, K3,  5,  1); p( 1,-10, K3, 5, 1);                                  // cross straps
    p(-6, -6, K3,  5,  1); p( 1, -4, K3, 5, 1);

    // ── SHOULDER WRAP
    p(-9,-19, CO, 18, 4); p(-8,-18, K1, 16, 2); p(-8,-18, K3, 16, 1);

    // ── ARMS, blades held reversed
    p(-13,-14, CO, 6, 13); p(-12,-13, K1, 4, 11); p(-12,-13, K3, 4, 1);
    p(-14, -2 + dash, CO, 6, 5); p(-13, -1 + dash, K2, 4, 3);
    p(  7,-14, CO, 6, 13); p(  8,-13, K1, 4, 11); p(  8,-13, K3, 4, 1);
    p(  8, -2 - dash, CO, 6, 5); p(  9, -1 - dash, K2, 4, 3);

    // ── CURVED TWIN BLADES — stepped so the edge reads as a curve rather than
    //    a straight bar, one sweeping forward and one back.
    //    Blocks are 4 wide and advance 2 per step with the curve damped to +-2,
    //    so consecutive steps always overlap. At 3-wide with a +-3 curve the
    //    advance could reach 4 and the blade came out as a dotted line.
    const blade = (bx, by, dir) => {
        for (let i = 0; i < 8; i++) {
            const off = Math.round(Math.sin(i / 7 * Math.PI) * 2);
            const sx  = bx + dir * (i * 2 + off);
            const sy  = by - i * 2;
            p(sx - (dir > 0 ? 0 : 1), sy, CO, 5, 4);
            p(sx + (dir > 0 ? 1 : 0), sy, i < 6 ? S2 : S3, 3, 3);
            p(sx + (dir > 0 ? 1 : 0), sy, S4, 3, 1);                             // edge light
        }
        p(bx - dir, by + 2, CO, 5, 5); p(bx, by + 3, R2, 3, 3);                  // guard + wrap
        p(bx, by + 3, R3, 3, 1);
    };
    blade(-15,  0 + dash, -1);
    blade( 10,  0 - dash,  1);

    // ── NECK + WHITE MASK (no features but two slits)
    p(-2,-21, CO, 4, 3); p(-1,-20, K0, 2, 2);
    p(-6,-33, CO, 12, 13);
    p(-5,-32, M1, 10, 11); p(-4,-32, M2, 8, 10); p(-3,-31, M3, 6, 8);
    p(-5,-32, M4, 10,  1);                                                       // top highlight
    p( 3,-31, M1,  2,  9);                                                       // shaded cheek
    p(-4,-28, CO,  3,  2); p( 1,-28, CO, 3, 2);                                  // eye slits
    p(-3,-28, isAtk ? R3 : K3, 1, 1); p( 2,-28, isAtk ? R3 : K3, 1, 1);
    p(-2,-23, M1,  4,  1);                                                       // mouth seam

    // ── HOOD
    p(-8,-38, CO, 16, 8); p(-7,-37, K0, 14, 6); p(-6,-36, K1, 12, 5);
    p(-7,-37, K3, 14,  1);                                                       // top highlight
    p(-9,-33, CO,  3, 8); p(-8,-32, K0, 1, 7);
    p( 7,-33, CO,  3, 8); p( 8,-32, K0, 1, 7);
    p(-3,-41, CO,  6, 4); p(-2,-40, K1, 4, 3);                                   // peak
    p( 5,-38, R1,  2, 6); p( 6,-32, R1, 1, 4);                                   // trailing hood tie

    if (isAtk) {
        glow(-15, -8, S4, 12, 12, 0.35);                                         // blade arcs
        glow( 10, -8, S4, 12, 12, 0.35);
        glow(-4,-28, R3, 3, 2, 0.75); glow(2,-28, R3, 3, 2, 0.75);
    }
}

// ─────── EXPORTS ─────────────────────────────────────────────────────────────
window.drawKnight       = drawKnight;
window.drawFire         = drawFire;
window.drawArcher       = drawArcher;
window.drawChainer      = drawChainer;
window.drawIce          = drawIce;
window.drawTracker      = drawTracker;
window.drawTalisman     = drawTalisman;
window.drawMonk         = drawMonk;
window.drawNecromancer  = drawNecromancer;
window.drawGuardian     = drawGuardian;
window.drawAlchemist    = drawAlchemist;
window.drawMirror       = drawMirror;
window.drawAssassin     = drawAssassin;

// ─────────────────────────────────────────────────────────────────────────────
// VERSE WARRIOR  —  수련생 퇴마사 전용 공격형 — prayer-bead melee warrior
// ───────────────────────────────────────────────────
// VERSE WARRIOR — 성구 전사. White martial robe, a prayer-bead cord wound round
// both fists and swung as the weapon.
// Lore: 흰 무복에 묵주를 휘감은 손, 성구 구슬로 근접 타격을 가하는 전사.
// ───────────────────────────────────────────────────
function drawVerseWarrior(cx, cy, tower) {
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
    const ep    = (Math.sin(now * 0.005) + 1) / 2;
    const swing = isAtk ? 3 : 0;
    const slack = Math.round(Math.sin(now * 0.003) * 1);

    const CO='#000';
    const W0='#4A4A56', W1='#8C8C9C', W2='#C8C8D8', W3='#EDEDF6', W4='#FFFFFF';  // white martial robe
    const B0='#3A2A14', B1='#6A4E20', B2='#A87C34';                              // wooden beads
    const G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const R2='#A81824', R3='#E0343C';                                            // sash red
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';
    const H0='#2A1A0E', H1='#4A3018', H2='#7A5028';

    ctx.save(); ctx.globalAlpha = 0.12 + ep * 0.16;
    pUnitAura(ctx, cx, cy, -18, -34 + idleY, G3, 36, 62, isLeft, S);
    ctx.restore();

    // ── BARE FEET
    p(-8, 22, CO, 7, 5); p(-7, 23, K0, 5, 3); p(-7, 23, K1, 5, 1);
    p( 2, 22, CO, 7, 5); p( 3, 23, K0, 5, 3); p( 3, 23, K1, 5, 1);

    // ── MARTIAL TROUSERS (banded at the ankle)
    p(-8,  4, CO, 16, 19);
    p(-7,  5, W1, 14, 17); p(-6,  5, W2, 12, 16); p(-4,  6, W3, 8, 14);
    p(-7,  5, W4, 14,  1);                                                       // top highlight
    p(-1,  6, W0,  2, 13);                                                       // leg split
    p(-8, 18, CO,  7,  3); p(-7, 19, R2, 5, 2);                                  // ankle wraps
    p( 2, 18, CO,  7,  3); p( 3, 19, R2, 5, 2);

    // ── RED SASH
    p(-8,  1, CO, 16, 4); p(-7, 2, R2, 14, 2); p(-7, 2, R3, 14, 1);
    p( 4,  4, R2,  2, 7); p( 6,  4, R2, 1, 5);                                   // trailing tail

    // ── CROSSED MARTIAL ROBE
    p(-7,-17, CO, 14, 19);
    p(-6,-16, W1, 12, 17); p(-5,-16, W2, 10, 16); p(-3,-15, W3, 6, 14);
    p(-6,-16, W4, 12,  1);                                                       // top highlight
    p(-5,-16, W3,  4,  9); p( 1,-16, W3, 4, 9);                                  // crossed lapels
    p(-5,-16, W4,  4,  1); p( 1,-16, W4, 4, 1);
    p(-1,-11, CO,  3,  8); p( 0,-10, G3, 1, 6);                                  // small verse cross
    p(-3, -8, CO,  7,  3); p(-2, -7, G3, 5, 1);
    glow( 0,-10, G4, 1, 6, 0.32 + ep * 0.24);

    // ── COLLAR
    p(-7,-20, CO, 14, 4); p(-6,-19, W3, 12, 2); p(-6,-19, W4, 12, 1);

    // ── ARMS, both fists forward
    p(-13,-14, CO, 6, 13); p(-12,-13, W2, 4, 11); p(-12,-13, W4, 4, 1);
    p(-14, -2 + swing, CO, 6, 5); p(-13, -1 + swing, K1, 4, 3); p(-13, -1 + swing, K2, 4, 1);
    p(  7,-14, CO, 6, 13); p(  8,-13, W2, 4, 11); p(  8,-13, W4, 4, 1);
    p(  8, -2 - swing, CO, 6, 5); p(  9, -1 - swing, K1, 4, 3); p(  9, -1 - swing, K2, 4, 1);

    // ── THE ROSARY — wound over both fists and slung between them, the loop
    //    kicking out on the attack frame. This is the weapon, not an ornament.
    beads(-14, -3 + swing, -10, 3 + swing, 4, B0, B1, B2);                       // wound, left
    beads(  8, -3 - swing,  12, 3 - swing, 4, B0, B1, B2);                       // wound, right
    beads(-11,  3 + swing,  10, 6 + slack - swing, 11, B0, B1, B2);              // slung between
    p(-1, 8 + slack, CO, 3, 6); p( 0, 9 + slack, G3, 1, 4);                      // pendant cross
    p(-3,10 + slack, CO, 7, 3); p(-2,11 + slack, G3, 5, 1);
    glow( 0, 9 + slack, G4, 1, 4, 0.40 + ep * 0.26);

    // ── NECK + HEAD
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-6,-35, CO, 12,  4); p(-5,-34, H1, 10, 2); p(-5,-34, H2, 10, 1);
    p(-7,-31, CO,  2,  4); p( 5,-31, CO, 2, 4);
    p(-7,-30, H0,  1,  3); p( 6,-30, H0, 1, 3);
    p(-4,-29, CO,  3,  2); p( 1,-29, CO, 3, 2);
    p(-3,-29, isAtk ? G4 : W4, 1, 1); p( 2,-29, isAtk ? G4 : W4, 1, 1);
    p(-1,-25, K0,  2,  1);

    // ── HEADBAND
    p(-7,-36, CO, 14, 3); p(-6,-35, R2, 12, 2); p(-6,-35, R3, 12, 1);
    p( 5,-35, R2,  2, 7);                                                        // trailing tie

    if (isAtk) {
        glow(-11, 3, G4, 22, 6, 0.40);
        glow( 0,-10, G4,  1, 6, 0.55);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HYMN BLASTER  —  수련생 퇴마사 전용 공격형 — sonic holy wave cannon
// ───────────────────────────────────────────────────
// HYMN BLASTER — 찬가 포격수. Gold vestments under a great hymn trumpet-cannon
// carried on the shoulder.
// Lore: 황금 사제복에 거대한 성가 나팔포를 짊어진 우람한 포격수.
// ───────────────────────────────────────────────────
function drawHymnBlaster(cx, cy, tower) {
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
    const blast = (now % 1200) / 1200;

    const CO='#000';
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8', G5='#FFFDE8';
    const W1='#8C8C9C', W2='#C8C8D8', W3='#EDEDF6', W4='#FFFFFF';                // white vestment
    const B1='#5A3A0A', B2='#8A5E14';                                            // dull brass
    const K0='#B87848', K1='#E8A870', K2='#FFC898';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -20, -34 + idleY, G3, 40, 60, isLeft, S);
    ctx.restore();

    // ── BOOTS (burly, planted)
    p(-10, 22, CO, 8, 5); p(-9, 23, G1, 6, 3); p(-9, 23, G3, 6, 1);
    p(  3, 22, CO, 8, 5); p( 4, 23, G1, 6, 3); p( 4, 23, G3, 6, 1);

    // ── VESTMENT SKIRT (wide, heavy)
    p(-10,  4, CO, 20, 19);
    p(-9,  5, G0, 18, 17); p(-8,  5, G1, 16, 16); p(-5,  6, G2, 10, 14);
    p(-9,  5, G4, 18,  1);                                                       // top highlight
    p(-4,  7, G0,  1, 12); p( 3,  7, G0,  1, 12);
    p(-10, 19, CO, 20, 3); p(-9, 20, W2, 18, 2); p(-9, 20, W4, 18, 1);           // white hem

    // ── CINCTURE
    p(-9,  1, CO, 18, 4); p(-8, 2, W2, 16, 2); p(-8, 2, W4, 16, 1);

    // ── VESTMENT TORSO (broad chest)
    p(-9,-18, CO, 19, 21);
    p(-8,-17, G0, 17, 19); p(-7,-17, G1, 15, 18); p(-4,-16, G2, 9, 16);
    p(-8,-17, G4, 17,  1);                                                       // top highlight
    p( 7,-16, G0,  2, 17);                                                       // shaded flank
    p(-3,-12, CO,  7,  9); p(-2,-11, W3, 5, 7); p(-2,-11, W4, 5, 1);             // white chest panel
    p(-1,-10, G2,  3,  5);

    // ── COLLAR
    p(-8,-21, CO, 17, 4); p(-7,-20, W3, 15, 2); p(-7,-20, W4, 15, 1);

    // ── ARMS (thick), right up to steady the barrel
    p(-14,-16, CO, 7, 16); p(-13,-15, G1, 5, 14); p(-13,-15, G3, 5, 1);
    p(-14,  1, CO, 6,  5); p(-13,  2, K1, 4,  3); p(-13, 2, K2, 4, 1);
    p(  8,-17, CO, 7, 12); p(  9,-16, G1, 5, 10); p(  9,-16, G3, 5, 1);
    p(  9,-26, CO, 6, 11); p( 10,-25, G1, 4,  9); p( 10,-25, G3, 4, 1);
    p(  9,-29, CO, 6,  5); p( 10,-28, K1, 4,  3); p( 10,-28, K2, 4, 1);

    // ── HYMN TRUMPET-CANNON — narrow at the shoulder, flaring to a wide bell
    //    out front. Built in courses so the flare reads as a horn, not a cone.
    p( 2,-34, CO, 8,  8); p( 3,-33, B1, 6, 6); p( 3,-33, G3, 6, 1);              // breech at the shoulder
    p( 6,-33, CO, 8,  6); p( 7,-32, B2, 6, 4); p( 7,-32, G4, 6, 1);
    p(10,-33, CO,  9, 7); p(11,-32, B2, 7, 5); p(11,-32, G4, 7, 1);
    p(14,-34, CO, 10, 9); p(15,-33, G2, 8, 7); p(15,-33, G4, 8, 1);
    p(18,-36, CO, 11,13); p(19,-35, G2, 9, 11); p(19,-35, G4, 9, 1);             // flare
    p(22,-39, CO, 10,19); p(23,-38, G1, 8, 17); p(23,-38, G3, 8, 2);             // bell mouth
    p(24,-36, G0,  6, 13);                                                       // bore shadow
    p( 8,-35, G3,  2,  2); p(13,-35, G3, 2, 2); p(17,-37, G3, 2, 2);             // brass studs
    glow(23,-38, G5, 8, 2, 0.40 + ep * 0.28);

    // ── SOUND rolling out of the bell
    for (let i = 0; i < 3; i++) {
        const t = (blast + i / 3) % 1;
        glow(30 + Math.round(t * 6), -36 + i * 6, G5, 1, 5, (1 - t) * 0.6);
    }

    // ── NECK + HEAD (broad, bearded)
    p(-3,-24, CO, 7, 3); p(-2,-23, K0, 5, 2);
    p(-7,-37, CO, 14, 14);
    p(-6,-36, K0, 12, 12); p(-5,-36, K1, 10, 11); p(-4,-35, K2, 7, 4);
    p(-6,-36, K2, 12,  1);                                                       // top highlight
    p( 4,-35, K0,  2, 10);
    p(-5,-31, CO,  3,  2); p( 2,-31, CO, 3, 2);
    p(-4,-31, W4,  1,  1); p( 3,-31, W4, 1, 1);
    p(-5,-27, CO, 11,  4); p(-4,-26, W2, 9, 3);                                  // white beard

    // ── GOLD MITRE
    p(-7,-42, CO, 14, 6); p(-6,-41, G1, 12, 4); p(-6,-41, G4, 12, 1);
    p(-4,-46, CO, 8,  5); p(-3,-45, G2, 6, 3); p(-3,-45, G4, 6, 1);
    p(-1,-49, CO, 3,  4); p( 0,-48, G3, 1, 3);
    glow(-6,-41, G5, 12, 1, 0.40 + ep * 0.28);

    if (isAtk) {
        glow(22,-39, G5, 10, 19, 0.60);
        glow(-6,-41, G5, 12,  1, 0.55);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXORCISM MAGE  —  수련생 퇴마사 전용 공격형 — focused arcane exorcist
// ───────────────────────────────────────────────────
// EXORCISM MAGE — 퇴마 마법사. Deep blue robe, a cross-headed staff, white
// light condensing at the fingertips.
// Lore: 짙은 청색 로브에 십자 지팡이, 손끝에 응축된 백광을 모으는 마법사.
// ───────────────────────────────────────────────────
function drawExorcismMage(cx, cy, tower) {
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
    const gather = (now % 1200) / 1200;

    const CO='#000';
    const B0='#081432', B1='#173268', B2='#2A56A8', B3='#4A80D8', B4='#8FB2F0';  // deep blue
    const G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const W2='#C8D4E8', W3='#EDF2FA', W4='#FFFFFF';                              // white light
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';
    const H0='#3A2A14', H1='#6A4E20', H2='#A87C34';

    ctx.save(); ctx.globalAlpha = 0.12 + ep * 0.17;
    pUnitAura(ctx, cx, cy, -18, -34 + idleY, W3, 36, 62, isLeft, S);
    ctx.restore();

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

    // ── ROBE TORSO with a white cross panel
    p(-7,-17, CO, 14, 19);
    p(-6,-16, B0, 12, 17); p(-5,-16, B1, 10, 16); p(-3,-15, B2, 6, 14);
    p(-6,-16, B4, 12,  1);                                                       // top highlight
    p(-1,-14, CO,  3, 11); p( 0,-13, W3, 1, 9);
    p(-4,-10, CO,  7,  3); p(-3, -9, W3, 5, 1);
    glow( 0,-13, W4, 1, 9, 0.35 + ep * 0.26);
    glow(-3, -9, W4, 5, 1, 0.35 + ep * 0.26);

    // ── COLLAR
    p(-7,-20, CO, 14, 4); p(-6,-19, B2, 12, 2); p(-6,-19, B4, 12, 1);

    // ── SLEEVES, left on the staff, right raised and open
    p(-12,-16, CO, 6, 14); p(-11,-15, B1, 4, 12); p(-11,-15, B3, 4, 1);
    p(-12, -3, CO, 6,  5); p(-11, -2, K1, 4,  3); p(-11, -2, K2, 4, 1);
    p(  6,-16, CO, 6, 10); p(  7,-15, B1, 4,  8); p(  7,-15, B3, 4, 1);
    p(  8,-24, CO, 6, 10); p(  9,-23, B1, 4,  8); p(  9,-23, B3, 4, 1);
    p(  8,-28, CO, 7,  5); p(  9,-27, K1, 5,  3); p(  9,-27, K2, 5, 1);
    p(  9,-25, K0, 5,  1);                                                       // finger shadow

    // ── LIGHT CONDENSING at the fingertips — motes drawn inward to a core
    for (let i = 0; i < 5; i++) {
        const t = (gather + i / 5) % 1;
        const d = Math.round((1 - t) * 7);
        const a = (i % 2 ? 1 : -1);
        glow(11 + a * d, -33 + Math.round((1 - t) * 4), W4, 1, 1, t * 0.8);
    }
    p(10,-33, CO, 4, 4); p(11,-32, W2, 2, 2); p(11,-32, W4, 2, 1);               // condensed core
    glow(11,-32, W4, 2, 2, 0.55 + ep * 0.32);

    // ── CROSS-HEADED STAFF
    p(-15,-28, CO, 4, 52); p(-14,-27, G1, 2, 50); p(-14,-27, G3, 2, 1);
    p(-15,-12, G2, 4, 1); p(-15, 6, G2, 4, 1);                                   // bindings
    p(-14,-38, CO, 3, 11); p(-13,-37, G2, 1, 9); p(-13,-37, G4, 1, 3);           // upright
    p(-17,-35, CO, 7,  3); p(-16,-34, G2, 5, 1); p(-16,-34, G4, 5, 1);           // arm
    p(-14,-41, CO, 3,  4); p(-13,-40, W3, 1, 2);                                 // light at the tip
    glow(-13,-40, W4, 1, 2, 0.55 + ep * 0.30);
    glow(-16,-34, G4, 5, 1, 0.40 + ep * 0.26);

    // ── NECK + HEAD
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-6,-35, CO, 12,  4); p(-5,-34, H1, 10, 2); p(-5,-34, H2, 10, 1);
    p(-7,-31, CO,  2,  5); p( 5,-31, CO, 2, 5);
    p(-7,-30, H0,  1,  4); p( 6,-30, H0, 1, 4);
    p(-4,-29, CO,  3,  2); p( 1,-29, CO, 3, 2);
    p(-3,-29, isAtk ? W4 : W3, 1, 1); p( 2,-29, isAtk ? W4 : W3, 1, 1);
    p(-1,-25, K0,  2,  1);

    // ── CIRCLET
    p(-7,-37, CO, 14, 3); p(-6,-36, G2, 12, 2); p(-6,-36, G4, 12, 1);
    p(-1,-39, CO,  3, 3); p( 0,-38, W3, 1, 1);
    glow( 0,-38, W4, 1, 1, 0.55 + ep * 0.30);

    if (isAtk) {
        glow(10,-33, W4, 4, 4, 0.75);
        glow(-13,-40, W4, 1, 2, 0.70);
    }
}

window.drawVerseWarrior   = drawVerseWarrior;
window.drawHymnBlaster    = drawHymnBlaster;
window.drawExorcismMage   = drawExorcismMage;

/* ─── Novice Exorcist Exclusive — Support T2 ────────────────────────────── */
// ───────────────────────────────────────────────────
// PRAYER HERALD — 기도 전령. Ivory cassock, azure stole, gold cross-bell.
// Lore: 흰 사제복에 황금 십자 종을 든 단정한 어린 전령.
// The old art gave him a banner twice his own height, which is a different
// character and swamped the silhouette; the bell is the whole brief.
// ───────────────────────────────────────────────────
function drawPrayerHerald(ctx, tower, cx, cy, isLeft) {
    const S = 2.0;
    const now   = Date.now();
    const idleY = Math.sin(now * 0.002) * 2;
    const isAtk = (now - (tower.lastShot || 0)) < 350;
    const ep    = (Math.sin(now * 0.004) + 1) / 2;
    const swing = Math.sin(now * 0.005) * 1.6;                                   // bell swing
    const p = (ox, oy, col, w = 1, h = 1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    // Glows go through `lighter` so the bake records them as emissive and the
    // finishing pass blooms exactly these pixels instead of guessing.
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };

    const CO='#000';
    const I0='#4A4234', I1='#8C8474', I2='#C9C1AC', I3='#EDE7D6', I4='#FFFCF2';  // ivory cassock
    const G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';                // gold
    const A2='#33559E', A3='#6E93D6';                                            // azure stole
    const K0='#C4834E', K1='#F0C090', K2='#FFDCB4';                              // skin
    const H0='#6A4A18', H1='#A87C28', H2='#E0BC64';                              // blond hair

    // prayer aura
    ctx.save(); ctx.globalAlpha = 0.12 + ep * 0.16;
    pUnitAura(ctx, cx, cy, -18, -34 + idleY, G3, 36, 62, isLeft, S);
    ctx.restore();

    // ── SANDALS
    p(-7, 22, CO, 6, 5); p(-6, 23, I1, 4, 3); p(-6, 23, I3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, I1, 4, 3); p( 2, 23, I3, 4, 1);

    // ── LOWER CASSOCK (ivory, gold hem)
    p(-8,  4, CO, 16, 19);
    p(-7,  5, I1, 14, 17); p(-6,  5, I2, 12, 16); p(-4,  6, I3,  8, 14);
    p(-7,  5, I4, 14,  1);                                                       // top highlight
    p(-3,  7, I0,  1, 12); p( 2,  7, I0,  1, 12);                                // fold shadows
    p(-8, 19, CO, 16,  3); p(-7, 20, G2, 14,  2); p(-7, 20, G3, 14,  1);         // gold hem

    // ── CINCTURE
    p(-7,  1, CO, 14,  4); p(-6,  2, G1, 12,  2); p(-6,  2, G3, 12,  1);
    p( 3,  4, G2,  1,  5); p( 5,  4, G2,  1,  4);                                // hanging cord

    // ── TORSO (cassock under an azure stole)
    p(-7,-17, CO, 14, 19);
    p(-6,-16, I1, 12, 17); p(-5,-16, I2, 10, 16); p(-3,-15, I3,  6, 14);
    p(-6,-16, I4, 12,  1);                                                       // top highlight
    p(-5,-16, A2,  2, 17); p( 3,-16, A2,  2, 17);                                // stole bands
    p(-5,-16, A3,  2,  1); p( 3,-16, A3,  2,  1);
    // gold cross emblem
    p(-1,-13, CO,  3, 10); p( 0,-12, G3,  1,  8);
    p(-3,-10, CO,  7,  3); p(-2, -9, G3,  5,  1);
    // 1px emissive strokes only — a filled block here blooms into a bright
    // square that flattens the chest instead of lighting the cross.
    glow( 0,-12, G4, 1, 8, 0.40 + ep * 0.30);
    glow(-2, -9, G4, 5, 1, 0.40 + ep * 0.30);

    // ── COLLAR
    p(-7,-20, CO, 14, 4); p(-6,-19, I3, 12, 2); p(-6,-19, I4, 12, 1);
    p(-6,-17, G2, 12, 1);

    // ── SLEEVES — set outside the 14-wide torso, else the outline swallows
    //    them and the figure reads as armless.
    p(-12,-16, CO, 6, 16); p(-11,-15, I1, 4, 14); p(-11,-15, I3, 3, 13);
    p(-11,-15, I4,  4, 1);                                                       // top highlight
    p(-12, -1, CO, 6,  5); p(-11,  0, K1, 4,  3); p(-11, 0, K2, 4, 1);           // left hand
    p(  6,-16, CO, 6, 11); p(  7,-15, I1, 4,  9); p(  7,-15, I3, 3,  8);
    p(  7,-15, I4,  4, 1);
    p(  8,-27, CO, 6, 13); p(  9,-26, I1, 4, 11); p(  9,-26, I3, 3, 10);         // raised forearm
    p(  9,-26, I4,  4, 1);
    p(  8,-30, CO, 6,  5); p(  9,-29, K1, 4,  3); p(  9,-29, K2, 4, 1);          // right hand

    // ── NECK
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);

    // ── HEAD (young, round)
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);                                 // top highlight
    p( 3,-32, K0,  2,  9);                                                       // shaded cheek
    p(-6,-35, CO, 12,  5); p(-5,-34, H1, 10, 3); p(-5,-34, H2, 10, 1);           // hair cap
    p(-6,-31, H0,  2,  4); p( 4,-31, H0,  2, 4);                                 // side locks
    p(-4,-29, CO,  3,  2); p( 1,-29, CO,  3, 2);                                 // eyes
    p(-3,-29, I4,  1,  1); p( 2,-29, I4,  1, 1);                                 // glints
    p(-1,-25, K0,  2,  1);                                                       // mouth

    // ── HALO — an open ring. Filled, it reads as the brim of a hat.
    p(-8,-41, CO, 16, 1); p(-8,-36, CO, 16, 1);                                  // ring top / bottom
    p(-9,-40, CO,  1,  4); p( 8,-40, CO, 1, 4);                                  // ring sides
    p(-8,-40, G2, 16,  1); p(-8,-38, G2, 16, 1);
    p(-8,-40, G3, 16,  1);                                                       // lit upper edge
    p(-8,-39, G1, 16,  1);                                                       // inner shadow
    glow(-8,-40, G4, 16, 1, 0.45 + ep * 0.32);
    glow(-8,-38, G4, 16, 1, 0.30 + ep * 0.25);

    // ── GOLD CROSS-BELL (tapered in three courses, swings on the hand)
    const bx = 9 + swing;
    p(bx-1,-26, G1, 2, 2);                                                       // yoke
    p(bx-1,-33, CO, 3, 6); p(bx,  -32, G3, 1, 4);                                // finial cross
    p(bx-3,-31, CO, 7, 3); p(bx-2,-30, G3, 5, 1);
    p(bx-2,-25, CO, 5, 3); p(bx-1,-24, G2, 3, 2);                                // crown
    p(bx-3,-23, CO, 7, 4); p(bx-2,-22, G1, 5, 3); p(bx-2,-22, G3, 5, 1);         // shoulder
    p(bx-4,-20, CO, 9, 5); p(bx-3,-19, G1, 7, 4); p(bx-3,-19, G2, 7, 2);         // waist
    p(bx-2,-18, G3, 5, 2);                                                       // lit face
    p(bx-5,-16, CO,11, 3); p(bx-4,-15, G2, 9, 2); p(bx-4,-15, G4, 9, 1);         // flared rim
    p(bx-1,-13, CO, 3, 3); p(bx,  -12, G2, 1, 1);                                // clapper
    glow(bx-4,-20, G4, 9, 6, 0.28 + ep * 0.32);

    // ── SOUND RINGS — three ticks travelling outward on the prayer pulse.
    //    Outward only: mirrored inward they would sit on top of the cassock.
    const ring = (now % 1500) / 1500;
    for (let i = 0; i < 3; i++) {
        const t = (ring + i / 3) % 1;
        glow(bx + 4 + t * 7, -23 + i * 3, G4, 1, 3, (1 - t) * 0.5);
    }

    if (isAtk) {
        glow(bx-4,-20, G4, 9, 6, 0.55);                                          // bell flash
        glow(-8,-40, G4, 16, 1, 0.55);                                           // halo flash
        glow(-8,-38, G4, 16, 1, 0.40);
    }
}

/* RELIC KEEPER — 유물 수호자. Platinum chain mantle, the reliquary chest
 * carried on the shoulder.
 * Lore: 백금 사슬 망토에 성유물 함을 어깨에 짊어진 수호자. */
function drawRelicKeeper(ctx, tower, cx, cy, isLeft) {
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
    const T0='#2E323E', T1='#767E92', T2='#B6BECE', T3='#E2E8F2', T4='#FFFFFF';  // platinum
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8';
    const W1='#5A4A34', W2='#8A7454', W3='#B89E74';                              // reliquary wood
    const C2='#22B8E0', C3='#7FE8FF', C4='#DDFAFF';                              // relic light
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.12 + ep * 0.17;
    pUnitAura(ctx, cx, cy, -19, -34 + idleY, G3, 38, 62, isLeft, S);
    ctx.restore();

    // ── BOOTS
    p(-8, 22, CO, 7, 5); p(-7, 23, T1, 5, 3); p(-7, 23, T3, 5, 1);
    p( 1, 22, CO, 7, 5); p( 2, 23, T1, 5, 3); p( 2, 23, T3, 5, 1);

    // ── ROBE + GREAVES
    p(-8,  4, CO, 16, 19);
    p(-7,  5, T0, 14, 17); p(-6,  5, T1, 12, 16); p(-4,  6, T2, 8, 14);
    p(-7,  5, T4, 14,  1);                                                       // top highlight
    p(-1,  6, T0,  2, 13);
    p(-8, 19, CO, 16,  3); p(-7, 20, G2, 14, 2); p(-7, 20, G3, 14, 1);

    // ── BELT
    p(-7,  1, CO, 14, 4); p(-6, 2, G1, 12, 2); p(-6, 2, G3, 12, 1);

    // ── TORSO
    p(-7,-17, CO, 14, 19);
    p(-6,-16, T0, 12, 17); p(-5,-16, T1, 10, 16); p(-3,-15, T2, 6, 14);
    p(-6,-16, T4, 12,  1);                                                       // top highlight

    // ── CHAIN MANTLE over the shoulders — links, not a plate cape
    p(-11,-21, CO, 22, 4); p(-10,-20, T0, 20, 2);
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 10; c++) p(-10 + c * 2 + (r % 2), -20 + r * 2, r % 2 ? T1 : T2, 1, 1);
    }
    p(-10,-21, T4, 20, 1);                                                       // mantle top light
    p(-2,-22, CO,  5, 4); p(-1,-21, G2, 3, 2); p(-1,-21, G4, 3, 1);              // clasp

    // ── ARMS, right up under the chest strap
    p(-12,-15, CO, 6, 14); p(-11,-14, T1, 4, 12); p(-11,-14, T3, 4, 1);
    p(-12,  0, CO, 6,  5); p(-11,  1, K1, 4,  3); p(-11, 1, K2, 4, 1);
    p(  6,-16, CO, 6, 11); p(  7,-15, T1, 4,  9); p(  7,-15, T3, 4, 1);
    p(  7,-24, CO, 6,  9); p(  8,-23, T1, 4,  7); p(  8,-23, T3, 4, 1);
    p(  7,-27, CO, 6,  5); p(  8,-26, K1, 4,  3); p(  8,-26, K2, 4, 1);

    // ── RELIQUARY CHEST on the shoulder — a gabled casket with gold banding
    //    and relic light leaking out of the seam.
    p( 8,-24, CO, 18, 15);
    p( 9,-23, W1, 16, 13); p(10,-22, W2, 14, 11); p(10,-22, W3, 14, 1);
    p( 9,-23, G2, 16,  1); p( 9,-11, G2, 16, 1);                                 // gold bands
    p(13,-23, G2,  2, 13); p(19,-23, G2, 2, 13);                                 // vertical straps
    p( 9,-28, CO, 18,  5); p(10,-27, W2, 16, 3); p(10,-27, W3, 16, 1);           // gabled lid
    p(12,-31, CO, 12,  4); p(13,-30, W2, 10, 2); p(13,-30, W3, 10, 1);
    p(16,-34, CO,  5,  4); p(17,-33, G3, 3, 2); p(17,-33, G4, 3, 1);             // cross finial
    p(15,-32, CO,  7,  2); p(16,-31, G3, 5, 1);
    p( 9,-17, C2, 16,  1);                                                       // light at the seam
    glow( 9,-17, C4, 16, 1, 0.45 + ep * 0.30);
    glow(17,-33, G4,  3, 1, 0.40 + ep * 0.26);
    p( 8,-20, CO,  3, 14); p( 9,-19, T1, 1, 12);                                 // carry strap

    // ── NECK + HEAD
    p(-2,-24, CO, 4, 3); p(-1,-23, K0, 2, 2);
    p(-6,-36, CO, 12, 13);
    p(-5,-35, K1, 10, 11); p(-5,-35, K2, 10, 1);
    p( 3,-34, K0,  2,  9);
    p(-4,-31, CO, 3, 2); p( 1,-31, CO, 3, 2);
    p(-3,-31, isAtk ? C4 : T4, 1, 1); p( 2,-31, isAtk ? C4 : T4, 1, 1);
    p(-1,-27, K0, 2, 1);

    // ── CHAIN COIF + GOLD BAND
    p(-7,-38, CO, 14, 5); p(-6,-37, T0, 12, 3);
    for (let c = 0; c < 6; c++) p(-6 + c * 2, -37, T2, 1, 1);
    p(-8,-34, CO,  2, 7); p( 6,-34, CO, 2, 7);
    p(-7,-33, T1,  1, 6); p( 7,-33, T1, 1, 6);
    p(-7,-39, CO, 14, 2); p(-6,-38, G2, 12, 1);

    if (isAtk) {
        glow( 9,-17, C4, 16, 1, 0.75);
        glow(17,-33, G4,  3, 2, 0.60);
    }
}

// ───────────────────────────────────────────────────
// WARD SCRIBE — 결계 서기. Deep-blue scholar robe, hanging ward scroll,
// runes trailing off the raised fingertips, three hex wards in orbit.
// Lore: 짙은 청색 학자복에 결계 두루마리, 손끝에 룬을 새기는 서기.
// ───────────────────────────────────────────────────
function drawWardScribe(ctx, tower, cx, cy, isLeft) {
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
    const N0='#070E28', N1='#152452', N2='#263C82', N3='#3D5CB0', N4='#6B8AD8';  // navy robe
    const V1='#5A6478', V2='#98A2B8', V3='#D2DAEA', V4='#FFFFFF';                // silver
    const C1='#0A6E96', C2='#22B8E0', C3='#7FE8FF', C4='#DDFAFF';                // ward cyan
    const P1='#8A7A54', P2='#C9B98E', P3='#EDE0BC', P4='#FFF8E0';                // parchment
    const G2='#B88000', G3='#FFD700';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCB4';

    // ward aura
    ctx.save(); ctx.globalAlpha = 0.12 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -18, -34 + idleY, C2, 36, 62, isLeft, S);
    ctx.restore();

    // ── THREE ORBITING HEX WARDS (drawn as rings, not filled blocks)
    const ang = now * 0.0014;
    for (let i = 0; i < 3; i++) {
        const a  = ang + i * (Math.PI * 2 / 3);
        const hx = Math.round(Math.cos(a) * 14);
        const hy = Math.round(Math.sin(a) * 8) - 20;
        // Hexagon: 3 courses, 5-7-5 wide. A filled rect at this size just
        // reads as a cyan square.
        p(hx-1, hy-2, CO, 5, 1); p(hx-2, hy-1, CO, 7, 1);
        p(hx-2, hy+2, CO, 7, 1); p(hx-1, hy+3, CO, 5, 1);
        p(hx-3, hy,   CO, 1, 2); p(hx+3, hy,   CO, 1, 2);
        p(hx-1, hy-1, C1, 5, 1); p(hx-2, hy, C1, 7, 2); p(hx-1, hy+2, C1, 5, 1);
        p(hx-1, hy-1, C3, 5, 1);                                                 // lit upper facet
        glow(hx-2, hy-1, C3, 7, 1, 0.45 + ep * 0.30);
    }

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, N1, 4, 3); p(-6, 23, N3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, N1, 4, 3); p( 2, 23, N3, 4, 1);

    // ── LOWER ROBE
    p(-8,  4, CO, 16, 19);
    p(-7,  5, N0, 14, 17); p(-6,  5, N1, 12, 16); p(-4,  6, N2, 8, 14);
    p(-7,  5, N4, 14,  1);                                                       // top highlight
    p(-3,  7, N0,  1, 12); p( 2,  7, N0,  1, 12);                                // fold shadows
    p(-8, 19, CO, 16,  3); p(-7, 20, V1, 14,  2); p(-7, 20, G3, 14, 1);          // gold-edged hem

    // ── INK SASH
    p(-7,  1, CO, 14, 4); p(-6, 2, N2, 12, 2); p(-6, 2, N3, 12, 1);
    p(-2,  0, CO,  5, 5); p(-1, 1, C1,  3, 3); p(-1, 1, C3, 3, 1);               // ward buckle
    glow(-1,  1, C4, 3, 3, 0.45 + ep * 0.35);

    // ── TORSO ROBE
    p(-7,-17, CO, 14, 19);
    p(-6,-16, N0, 12, 17); p(-5,-16, N1, 10, 16); p(-3,-15, N2, 6, 14);
    p(-6,-16, N4, 12,  1);                                                       // top highlight
    p(-6,-16, G2,  1, 17); p( 5,-16, G2,  1, 17);                                // gold placket
    // chest ward sigil
    p(-2,-11, CO, 5, 5); p(-1,-10, C1, 3, 3); p(-1,-10, C3, 3, 1);
    glow(-1,-10, C4, 3, 1, 0.50 + ep * 0.35);                                    // 1px stroke, not a block

    // ── SILVER COLLAR
    p(-7,-20, CO, 14, 4); p(-6,-19, V2, 12, 2); p(-6,-19, V4, 12, 1);
    p(-6,-17, V1, 12, 1);

    // ── LEFT SLEEVE (outside the torso outline, holding the scroll)
    p(-12,-15, CO, 6, 15); p(-11,-14, N2, 4, 13); p(-11,-14, N3, 3, 12);
    p(-11,-14, N4,  4, 1);                                                       // top highlight
    p(-12,  0, CO, 6,  5); p(-11,  1, K1, 4,  3); p(-11, 1, K2, 4, 1);

    // ── HANGING WARD SCROLL (wider, so it reads as a scroll not a stick)
    p(-18,  2, CO, 11, 3); p(-17,  3, P1, 9, 2); p(-17,  3, P3, 9, 1);           // top rod
    p(-17,  5, CO,  9,15); p(-16,  6, P2, 7, 13); p(-16, 6, P4, 7, 1);
    p(-15,  6, P3,  5, 12);                                                      // lit page
    p(-15,  8, C1,  5, 1); p(-15, 11, C1, 5, 1); p(-15, 14, C1, 5, 1);           // inked wards
    glow(-15,  8, C3, 5, 1, 0.40 + ep * 0.25);
    glow(-15, 11, C3, 5, 1, 0.40 + ep * 0.25);
    glow(-15, 14, C3, 5, 1, 0.40 + ep * 0.25);
    p(-18, 20, CO, 11, 3); p(-17, 21, P1, 9, 2); p(-17, 21, G3, 9, 1);           // bottom rod
    p(-16, 23, P1,  1, 3); p(-12, 23, P1, 1, 3);                                 // tassels

    // ── RIGHT SLEEVE (raised, inscribing)
    p( 6,-16, CO, 6, 11); p( 7,-15, N2, 4, 9); p( 7,-15, N3, 3, 8);
    p( 7,-15, N4,  4, 1);
    p( 8,-27, CO, 6, 13); p( 9,-26, N2, 4, 11); p( 9,-26, N3, 3, 10);
    p( 9,-26, N4,  4, 1);
    p( 8,-30, CO, 6,  5); p( 9,-29, K1, 4,  3); p( 9,-29, K2, 4, 1);             // hand

    // ── RUNES OFF THE FINGERTIPS (three, rising and fading)
    const rt = (now % 1800) / 1800;
    for (let i = 0; i < 3; i++) {
        const t = (rt + i / 3) % 1;
        const ry = -32 - t * 9;
        glow(10, ry, C3, 2, 1, (1 - t) * 0.80);
        glow( 9, ry + 1, C2, 4, 1, (1 - t) * 0.45);
    }

    // ── NECK
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);

    // ── HEAD
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);                                 // top highlight
    p( 3,-32, K0,  2,  9);                                                       // shaded cheek
    p(-4,-29, CO, 3, 2); p( 1,-29, CO, 3, 2);                                    // eyes
    p(-3,-29, isAtk ? C4 : V4, 1, 1); p( 2,-29, isAtk ? C4 : V4, 1, 1);
    p(-1,-25, K0, 2, 1);                                                         // mouth

    // ── SCHOLAR CAP (soft cap with a folded crown, silver band, ward stone)
    p(-7,-37, CO, 14, 4); p(-6,-36, N1, 12, 2); p(-6,-36, N2, 12, 1);            // crown
    p(-5,-40, CO, 10, 4); p(-4,-39, N1,  8, 2); p(-4,-39, N3,  8, 1);            // folded top
    p(-8,-34, CO, 16, 3); p(-7,-33, V1, 14, 2); p(-7,-33, V3, 14, 1);            // silver band
    p(-2,-34, CO,  5, 3); p(-1,-33, C1,  3, 1);                                  // ward stone
    glow(-1,-33, C4, 3, 1, 0.55 + ep * 0.35);

    if (isAtk) {
        glow(-1,-33, C4, 3, 1, 0.75);
        glow(-1,-10, C4, 3, 3, 0.55);                                            // sigil flare
    }
}

window.drawPrayerHerald = drawPrayerHerald;
window.drawRelicKeeper  = drawRelicKeeper;
window.drawWardScribe   = drawWardScribe;
