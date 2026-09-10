/* pix_tier3_attack.js – Tier 3 Exorcists: ATTACK Path
 * Paladin · Crusader · HellfireAlchemist · PhoenixSummoner · VoidSniper · ThousandHand
 */

/* ══════════════════════════════════════════════════════════ drawPaladin ═══ */
// ───────────────────────────────────────────────────
// PALADIN — 성기사. Platinum full plate, a holy warhammer, a halo showing only
// faintly.
// Lore: 백금 풀플레이트 갑주에 거룩한 망치, 후광이 흐릿하게 비치는 성기사.
// ───────────────────────────────────────────────────
function drawPaladin(cx, cy, tower) {
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
    const T0='#2E323E', T1='#767E92', T2='#B6BECE', T3='#E2E8F2', T4='#FFFFFF';  // platinum
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.12 + ep * 0.16;
    pUnitAura(ctx, cx, cy, -20, -36 + idleY, G3, 40, 64, isLeft, S);
    ctx.restore();

    // ── SABATONS
    p(-9, 22, CO, 8, 5); p(-8, 23, T1, 6, 3); p(-8, 23, T3, 6, 1);
    p( 2, 22, CO, 8, 5); p( 3, 23, T1, 6, 3); p( 3, 23, T3, 6, 1);

    // ── GREAVES + FAULDS (full plate: every mass gets its own lit top)
    p(-9,  4, CO, 18, 19); p(-8,  5, T0, 16, 17); p(-7,  5, T1, 14, 16);
    p(-5,  6, T2, 10, 14);
    p(-8,  5, T4, 16,  1);                                                       // top highlight
    p(-1,  6, T0,  2, 13);
    p(-9,  2, CO, 18,  4); p(-8,  3, T1, 16, 2); p(-8, 3, T4, 16, 1);            // faulds
    p(-9, 19, CO, 18,  3); p(-8, 20, G2, 16, 2); p(-8, 20, G3, 16, 1);

    // ── BELT
    p(-8, -1, CO, 16, 4); p(-7, 0, G1, 14, 2); p(-7, 0, G3, 14, 1);

    // ── CUIRASS with a gold cross
    p(-8,-19, CO, 17, 20); p(-7,-18, T0, 15, 18); p(-6,-18, T1, 13, 17);
    p(-4,-17, T2,  9, 15);
    p(-7,-18, T4, 15,  1);                                                       // top highlight
    p( 6,-17, T0,  2, 16);
    p(-1,-16, CO,  3, 13); p( 0,-15, G3, 1, 11);
    p(-4,-11, CO,  7,  3); p(-3,-10, G3, 5, 1);
    glow( 0,-15, G4, 1, 11, 0.35 + ep * 0.26);
    glow(-3,-10, G4, 5,  1, 0.35 + ep * 0.26);

    // ── PAULDRONS + COLLAR
    p(-13,-22, CO, 7, 9); p(-12,-21, T1, 5, 7); p(-12,-21, T4, 5, 1);
    p(-12,-22, G2,  5, 1);
    p(  6,-22, CO, 7, 9); p(  7,-21, T1, 5, 7); p(  7,-21, T4, 5, 1);
    p(  7,-22, G2,  5, 1);
    p(-6,-23, CO, 12, 3); p(-5,-22, T3, 10, 2); p(-5,-22, T4, 10, 1);

    // ── ARMS
    p(-12,-16, CO, 6, 14); p(-11,-15, T1, 4, 12); p(-11,-15, T3, 4, 1);
    p(-12, -2, CO, 6,  5); p(-11, -1, T2, 4,  3); p(-11, -1, T4, 4, 1);
    p(  6,-16, CO, 6, 11); p(  7,-15, T1, 4,  9); p(  7,-15, T3, 4, 1);
    p(  6, -6, CO, 6,  5); p(  7, -5, T2, 4,  3); p(  7, -5, T4, 4, 1);

    // ── HOLY WARHAMMER
    p( 9,-22, CO, 4, 40); p(10,-21, G1, 2, 38); p(10,-21, G3, 2, 1);             // haft
    p( 9,-10, G2, 4, 1); p( 9, 8, G2, 4, 1);                                     // bindings
    p( 5,-34, CO, 12, 12); p( 6,-33, T1, 10, 10); p( 6,-33, T4, 10, 1);          // head
    p( 6,-31, T2, 10,  6);
    p( 5,-34, G2, 12,  1); p( 5,-24, G2, 12, 1);                                 // gold cheeks
    p( 8,-31, CO,  6,  6); p( 9,-30, G3, 4, 4); p( 9,-30, G4, 4, 1);             // cross boss
    p(10,-38, CO,  4,  5); p(11,-37, G3, 2, 3);                                  // spike
    glow( 9,-30, G4, 4, 1, 0.45 + ep * 0.28);

    // ── NECK + GREAT HELM
    p(-2,-25, CO, 4, 3); p(-1,-24, K0, 2, 2);
    p(-7,-38, CO, 14, 15); p(-6,-37, T0, 12, 13); p(-5,-37, T1, 10, 12);
    p(-6,-37, T4, 12,  1);                                                       // top highlight
    p( 4,-36, T0,  2, 11);
    p(-6,-32, CO, 12,  3); p(-5,-31, K0, 10, 1);
    p(-5,-31, isAtk ? G4 : G3, 10, 1);                                           // visor slit
    glow(-5,-31, G4, 10, 1, 0.40 + ep * 0.28);
    p(-7,-39, CO, 14, 2); p(-6,-38, G2, 12, 1);
    p(-3,-43, CO,  7, 5); p(-2,-42, T2, 5, 3); p(-2,-42, T4, 5, 1);              // helm crest

    // ── FAINT HALO — deliberately dim; the lore says it only just shows.
    p(-9,-48, CO, 18, 1); p(-9,-45, CO, 18, 1);
    p(-9,-47, G1, 18, 1); p(-9,-46, G0, 18, 1);
    glow(-9,-47, G4, 18, 1, 0.22 + ep * 0.16);

    if (isAtk) {
        glow( 5,-34, G4, 12, 12, 0.55);
        glow(-9,-47, G4, 18, 1, 0.40);
    }
}

/* ══════════════════════════════════════════════════════════ drawCrusader ═══ */
// ───────────────────────────────────────────────────
// CRUSADER — 혈기사. Blood cape, two-handed executioner's sword, the blade
// marked with blood that has dried into it.
// Lore: 핏빛 망토에 양손 처형검, 검신에 응고된 핏자국이 새겨진 혈기사.
// ───────────────────────────────────────────────────
function drawCrusader(cx, cy, tower) {
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
    const fly = Math.round(Math.sin(now * 0.0028) * 2);

    const CO='#000';
    const T0='#2A2E36', T1='#6A7280', T2='#A6AEBC', T3='#D6DEEA', T4='#FFFFFF';  // dull steel
    const R0='#2A0408', R1='#6A0C14', R2='#A81824', R3='#E0343C', R4='#FF7A72';  // blood
    const G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -20, -36 + idleY, R3, 40, 64, isLeft, S);
    ctx.restore();

    // ── BLOOD CAPE
    for (let c = 0; c < 3; c++) {
        const wx  = -17 + c * 3;
        const top = -20 + c * 2 + fly;
        const len = 36 - c * 5;
        p(wx, top, CO, 4, len);
        p(wx, top + 1, c % 2 ? R0 : R1, 3, len - 2);
        p(wx, top + 1, R3, 3, 1);                                                // cape top light
        p(wx, top + len - 3, R0, 3, 2);
    }

    // ── SABATONS
    p(-9, 22, CO, 8, 5); p(-8, 23, T1, 6, 3); p(-8, 23, T3, 6, 1);
    p( 2, 22, CO, 8, 5); p( 3, 23, T1, 6, 3); p( 3, 23, T3, 6, 1);

    // ── GREAVES
    p(-9,  4, CO, 18, 19); p(-8,  5, T0, 16, 17); p(-7,  5, T1, 14, 16);
    p(-5,  6, T2, 10, 14);
    p(-8,  5, T4, 16,  1);                                                       // top highlight
    p(-1,  6, T0,  2, 13);
    p(-9, 19, CO, 18,  3); p(-8, 20, R2, 16, 2); p(-8, 20, R3, 16, 1);

    // ── BELT
    p(-8,  1, CO, 16, 4); p(-7, 2, G1, 14, 2); p(-7, 2, G3, 14, 1);

    // ── CUIRASS with a blood-red chevron
    p(-8,-18, CO, 17, 20); p(-7,-17, T0, 15, 18); p(-6,-17, T1, 13, 17);
    p(-4,-16, T2,  9, 15);
    p(-7,-17, T4, 15,  1);                                                       // top highlight
    p( 6,-16, T0,  2, 16);
    for (let i = 0; i < 5; i++) p(-4 + i * 2, -14 + Math.abs(i - 2), R2, 2, 4);  // chevron
    p(-2, -6, CO,  5,  5); p(-1, -5, R2, 3, 3); p(-1, -5, R4, 3, 1);
    glow(-1, -5, R4, 3, 1, 0.45 + ep * 0.28);

    // ── PAULDRONS (spiked) + COLLAR
    p(-13,-21, CO, 7, 9); p(-12,-20, T1, 5, 7); p(-12,-20, T4, 5, 1);
    p(-14,-25, CO, 4, 5); p(-13,-24, T2, 2, 4);
    p(  6,-21, CO, 7, 9); p(  7,-20, T1, 5, 7); p(  7,-20, T4, 5, 1);
    p( 10,-25, CO, 4, 5); p( 11,-24, T2, 2, 4);
    p(-6,-22, CO, 12, 3); p(-5,-21, R2, 10, 2); p(-5,-21, R3, 10, 1);

    // ── ARMS, both to the hilt
    p(-12,-15, CO, 6, 14); p(-11,-14, T1, 4, 12); p(-11,-14, T3, 4, 1);
    p(-12,  0, CO, 6,  5); p(-11,  1, T2, 4,  3); p(-11, 1, T4, 4, 1);
    p(  6,-15, CO, 6, 14); p(  7,-14, T1, 4, 12); p(  7,-14, T3, 4, 1);
    p(  6,  0, CO, 6,  5); p(  7,  1, T2, 4,  3); p(  7, 1, T4, 4, 1);

    // ── EXECUTIONER'S SWORD — broad, blunt-ended, blood dried into the fuller
    p(-4,-10, CO, 9, 36); p(-3, -9, T1, 7, 34); p(-3, -9, T4, 7, 1);             // blade
    p(-2, -9, T2, 5, 32);
    p(-1, -8, R1, 3, 30);                                                        // dried blood
    for (let i = 0; i < 6; i++) p(-1, -6 + i * 5, R2, 3, 2);                     // clotted marks
    p(-4, 24, CO, 9,  4); p(-3, 25, T2, 7, 2);                                   // squared tip
    p(-8,-14, CO, 17, 5); p(-7,-13, G2, 15, 3); p(-7,-13, G4, 15, 1);            // crossguard
    p(-2,-20, CO,  5, 7); p(-1,-19, R1, 3, 5);                                   // grip
    p(-3,-25, CO,  7, 6); p(-2,-24, G3, 5, 4); p(-2,-24, G4, 5, 1);              // pommel
    glow(-7,-13, G4, 15, 1, 0.35 + ep * 0.26);

    // ── NECK + HELM (barred visor, red glare behind it)
    p(-2,-27, CO, 4, 3); p(-1,-26, K0, 2, 2);
    p(-7,-40, CO, 14, 15); p(-6,-39, T0, 12, 13); p(-5,-39, T1, 10, 12);
    p(-6,-39, T4, 12,  1);                                                       // top highlight
    p( 4,-38, T0,  2, 11);
    p(-6,-34, CO, 12,  5); p(-5,-33, R1, 10, 3);
    for (let i = 0; i < 4; i++) p(-4 + i * 3, -34, T1, 1, 5);                    // visor bars
    glow(-5,-33, R4, 10, 3, 0.35 + ep * 0.28);
    p(-7,-41, CO, 14, 2); p(-6,-40, G2, 12, 1);
    for (let i = 0; i < 5; i++) p(-4 + i * 2, -46 + Math.abs(i - 2), R2, 2, 6);  // blood crest
    p(-4,-46, R3, 8, 1);

    if (isAtk) {
        glow(-3, -9, T4, 7, 34, 0.35);
        glow(-5,-33, R4, 10, 3, 0.65);
    }
}

/* ═══════════════════════════════════════════════ drawHellfireAlchemist ═══ */
// ────────────────────────────────────────────────────
// HELLFIRE ALCHEMIST — 지옥불 연금술사. Dark red leather apron, a lit flask in
// each fist, and nothing behind the goggles but appetite.
// Lore: 검붉은 가죽 앞치마에 폭발 플라스크를 양손에 든 광기 어린 연금술사.
// ────────────────────────────────────────────────────
function drawHellfireAlchemist(cx, cy, tower) {
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
    const ep    = (Math.sin(now * 0.005) + 1) / 2;
    const fuse  = (now % 700) / 700;                                             // fuse burn cycle
    const twitch = Math.round(Math.sin(now * 0.013) * 1);

    const CO='#000';
    const L0='#1E0A08', L1='#4A1410', L2='#7A2418', L3='#A84028', L4='#D06A40';  // scorched leather
    const S1='#6A6258', L5='#9A9084', S3='#C4BAA8';                              // grimy linen
    const F0='#7A1800', F1='#C43800', F2='#FF6A00', F3='#FFB020', F4='#FFE890';  // flame
    const V1='#0E7A3A', V2='#2FD46A', V3='#9CFFC0';                              // volatile green
    const K0='#B06A38', K1='#DCA070', K2='#F8C89C';

    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -20, -34 + idleY, F2, 40, 62, isLeft, S);
    ctx.restore();

    // ── BOOTS
    p(-7, 22, CO, 6, 5); p(-6, 23, L1, 4, 3); p(-6, 23, L3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, L1, 4, 3); p( 2, 23, L3, 4, 1);

    // ── TROUSERS
    p(-7,  6, CO, 14, 17); p(-6,  7, S1, 12, 15); p(-5,  7, L5, 10, 14);
    p(-6,  7, S3, 12,  1);                                                       // top highlight
    p(-1,  8, CO,  2, 14);

    // ── SCORCHED APRON (burn holes punched through it)
    p(-6,-12, CO, 12,  6); p(-5,-11, L1, 10, 4); p(-5,-11, L3, 10, 1);
    p(-8, -6, CO, 16, 24); p(-7, -5, L0, 14, 22); p(-6, -5, L1, 12, 21);
    p(-4, -4, L2,  8, 19);
    p(-7, -5, L4, 14,  1);                                                       // top highlight
    p(-5,  2, F0,  3,  2); p( 2,  8, F0, 2, 2); p(-3, 13, F0, 2, 2);             // burn holes
    glow(-5,  2, F1, 3, 1, 0.30 + ep * 0.22);
    p(-6,-12, L2,  2,  1); p( 4,-12, L2, 2, 1);
    p(-6,-14, CO,  2,  3); p( 4,-14, CO, 2, 3);
    p(-6,-14, L2,  2,  2); p( 4,-14, L2, 2, 2);

    // ── BANDOLIER OF SPARE FLASKS
    p(-9, -2, CO, 18, 5); p(-8, -1, L1, 16, 3); p(-8, -1, L3, 16, 1);
    for (let i = 0; i < 3; i++) {
        const vx = -7 + i * 5;
        p(vx, 3, CO, 3, 5); p(vx + 1, 4, i % 2 ? V1 : F1, 1, 3);
        glow(vx + 1, 4, i % 2 ? V2 : F2, 1, 2, 0.30 + ep * 0.22);
    }

    // ── SHIRT + COLLAR
    p(-7,-17, CO, 14, 6); p(-6,-16, L5, 12, 4); p(-6,-16, S3, 12, 1);
    p(-7,-20, CO, 14, 4); p(-6,-19, L5, 12, 2); p(-6,-19, S3, 12, 1);

    // ── BOTH ARMS RAISED, a flask in each fist
    p(-13,-16, CO, 6, 10); p(-12,-15, L5, 4, 8); p(-12,-15, S3, 4, 1);
    p(-14,-25, CO, 6, 11); p(-13,-24, K1, 4, 9); p(-13,-24, K2, 4, 1);
    p(-14,-28, CO, 6,  5); p(-13,-27, K1, 4, 3); p(-13,-27, K2, 4, 1);
    p(  7,-16, CO, 6, 10); p(  8,-15, L5, 4, 8); p(  8,-15, S3, 4, 1);
    p(  8,-25, CO, 6, 11); p(  9,-24, K1, 4, 9); p(  9,-24, K2, 4, 1);
    p(  8,-28, CO, 6,  5); p(  9,-27, K1, 4, 3); p(  9,-27, K2, 4, 1);

    // ── TWO EXPLOSIVE FLASKS — bulbs of volatile, corked, fuses burning down
    const flask = (fx, core, hot) => {
        p(fx,   -35, CO, 6, 4); p(fx+1, -34, L2, 4, 2);                          // cork collar
        p(fx-1, -32, CO, 8, 8); p(fx,   -31, core, 6, 6); p(fx, -31, hot, 6, 1);
        p(fx+1, -29, hot, 4, 2);                                                 // sloshing core
        glow(fx,   -31, hot, 6, 1, 0.45 + ep * 0.30);
        glow(fx+1, -29, hot, 4, 2, 0.35 + ep * 0.25);
        // fuse: a stub with a spark travelling down it
        p(fx+2, -40, CO, 2, 5); p(fx+2, -40, L1, 1, 4);
        glow(fx+2, -40 + Math.round(fuse * 4), F4, 2, 1, 0.85 - fuse * 0.3);
    };
    flask(-14, F1, F3);
    flask(  9, V1, V2);

    // ── NECK
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);

    // ── HEAD (manic: one eye wide, teeth bared)
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-4,-29, CO, 4, 4); p(-3,-28, S3, 2, 2); p(-3,-28, CO, 1, 1);               // wide eye
    p( 1,-29 + twitch, CO, 3, 2); p( 2,-29 + twitch, S3, 1, 1);                  // twitching eye
    p(-3,-24, CO, 7, 3); p(-2,-23, S3, 5, 2);                                    // bared grin
    for (let i = 0; i < 3; i++) p(-2 + i * 2, -24, CO, 1, 3);

    // ── SINGED HAIR + CRACKED GOGGLES ON THE BROW
    for (let i = 0; i < 7; i++) {
        const hx = -7 + i * 2, hh = 3 + ((i * 5) % 4);
        p(hx, -36 - hh, CO, 2, hh + 1); p(hx, -36 - hh, L1, 1, hh);
        if (i % 3 === 0) glow(hx, -36 - hh, F2, 1, 1, 0.35 + ep * 0.25);         // smouldering tips
    }
    p(-7,-33, CO, 14, 3); p(-6,-32, L1, 12, 2); p(-6,-32, L3, 12, 1);
    p(-6,-33, CO,  5, 4); p(-5,-32, F0,  3, 2); p(-5,-32, F2, 3, 1);
    p( 1,-33, CO,  5, 4); p( 2,-32, F0,  3, 2); p( 2,-32, F2, 3, 1);
    p( 3,-32, CO,  1, 2);                                                        // crack in the lens
    glow(-5,-32, F3, 3, 1, 0.35 + ep * 0.25);
    glow( 2,-32, F3, 3, 1, 0.35 + ep * 0.25);

    if (isAtk) {
        glow(-14,-31, F4, 6, 6, 0.70);
        glow(  9,-31, V3, 6, 6, 0.70);
    }
}

/* ═════════════════════════════════════════════════ drawPhoenixSummoner ═══ */
// ────────────────────────────────────────────────────
// PHOENIX SUMMONER — 불사조 소환사. Crimson-and-gold feather mantle with the
// bird itself perched on his shoulder.
// Lore: 진홍과 황금 깃털 망토, 어깨에 작은 불사조가 앉은 소환사.
// ────────────────────────────────────────────────────
function drawPhoenixSummoner(cx, cy, tower) {
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
    const wing = Math.round(Math.sin(now * 0.006) * 2);                          // phoenix wing beat
    const tail = Math.round(Math.sin(now * 0.0045) * 1);

    const CO='#000';
    const R0='#2A0408', R1='#6A0C14', R2='#A81824', R3='#E0343C', R4='#FF7A72';  // crimson
    const G0='#4A3000', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8';  // gold
    const F1='#C43800', F2='#FF6A00', F3='#FFB020', F4='#FFE890';                // flame
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';
    const H0='#3A1810', H1='#6A2C18', H2='#A8502C';

    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -20, -38 + idleY, F2, 40, 68, isLeft, S);
    ctx.restore();

    // ── FEATHER MANTLE — courses of crimson into gold down both shoulders,
    //    each course outlined and lit on its upper edge.
    for (let k = 0; k < 2; k++) {
        const bx = k ? 6 : -14;
        for (let c = 0; c < 3; c++) {
            const fx = bx + (k ? c * 3 : (2 - c) * 3);
            const top = -19 + c * 2;
            const len = 20 - c * 4;
            p(fx, top, CO, 4, len);
            p(fx + (k ? 1 : 0), top + 1, c === 2 ? G1 : R1, 3, len - 2);
            p(fx + (k ? 1 : 0), top + 1, c === 2 ? G3 : R3, 3, 1);               // feather light
            p(fx + (k ? 1 : 0), top + len - 3, c === 2 ? G0 : R0, 3, 2);         // tip shade
        }
    }

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, R1, 4, 3); p(-6, 23, R3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, R1, 4, 3); p( 2, 23, R3, 4, 1);

    // ── ROBE SKIRT
    p(-8,  4, CO, 16, 19);
    p(-7,  5, R0, 14, 17); p(-6,  5, R1, 12, 16); p(-4,  6, R2, 8, 14);
    p(-7,  5, R4, 14,  1);                                                       // top highlight
    p(-3,  7, R0,  1, 12); p( 2,  7, R0,  1, 12);
    p(-8, 19, CO, 16,  3); p(-7, 20, G2, 14, 2); p(-7, 20, G3, 14, 1);           // gold hem

    // ── SASH
    p(-7,  1, CO, 14, 4); p(-6, 2, G1, 12, 2); p(-6, 2, G3, 12, 1);
    p(-2,  0, CO,  5, 5); p(-1, 1, F1,  3, 3); p(-1, 1, F3, 3, 1);
    glow(-1, 1, F4, 3, 1, 0.50 + ep * 0.30);

    // ── ROBE TORSO
    p(-7,-17, CO, 14, 19);
    p(-6,-16, R0, 12, 17); p(-5,-16, R1, 10, 16); p(-3,-15, R2, 6, 14);
    p(-6,-16, R4, 12,  1);                                                       // top highlight
    p(-6,-16, G2,  1, 17); p( 5,-16, G2, 1, 17);                                 // gold placket
    // sun emblem
    p(-2,-10, CO, 5, 5); p(-1, -9, G2, 3, 3); p(-1, -9, G4, 3, 1);
    glow(-1, -9, G4, 3, 1, 0.50 + ep * 0.30);

    // ── COLLAR
    p(-7,-20, CO, 14, 4); p(-6,-19, G2, 12, 2); p(-6,-19, G4, 12, 1);

    // ── ARMS
    p(-12,-15, CO, 6, 15); p(-11,-14, R1, 4, 13); p(-11,-14, R3, 4, 1);
    p(-12,  0, CO, 6,  5); p(-11,  1, K1, 4,  3); p(-11, 1, K2, 4, 1);
    p(  6,-15, CO, 6, 15); p(  7,-14, R1, 4, 13); p(  7,-14, R3, 4, 1);
    p(  6,  0, CO, 6,  5); p(  7,  1, K1, 4,  3); p(  7, 1, K2, 4, 1);

    // ── NECK
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);

    // ── HEAD
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-6,-35, CO, 12,  4); p(-5,-34, H1, 10, 2); p(-5,-34, H2, 10, 1);           // hair
    p(-7,-31, CO,  2,  5); p( 5,-31, CO, 2, 5);
    p(-7,-30, H0,  1,  4); p( 6,-30, H0, 1, 4);
    p(-4,-29, CO,  3,  2); p( 1,-29, CO, 3, 2);
    p(-3,-29, isAtk ? F4 : F3, 1, 1); p( 2,-29, isAtk ? F4 : F3, 1, 1);
    p(-1,-25, K0,  2,  1);

    // ── GOLD DIADEM
    p(-7,-37, CO, 14, 4); p(-6,-36, G2, 12, 2); p(-6,-36, G4, 12, 1);
    p(-1,-40, CO,  3, 4); p( 0,-39, F2, 1, 3);
    glow( 0,-39, F4, 1, 3, 0.45 + ep * 0.28);

    // ── THE PHOENIX, perched on the right shoulder
    //    Scaled up from the first pass: at 5x6 the body was a coloured smudge
    //    on the shoulder. It needs a distinct head, beak, wing and tail fan to
    //    read as a bird in a 44px codex tile.
    const px = 10, py = -34;
    p(px+1, py+5, CO, 8, 9); p(px+2, py+6, R1, 6, 7);                            // body
    p(px+2, py+6, R3, 6, 2); p(px+3, py+7, F2, 4, 2);                            // lit breast
    p(px+2, py+1, CO, 6, 5); p(px+3, py+2, R2, 4, 3); p(px+3, py+2, F3, 4, 1);   // head
    p(px+7, py+3, CO, 3, 3); p(px+7, py+3, G3, 2, 2); p(px+8, py+4, G2, 1, 1);   // beak
    p(px+4, py+3, CO, 1, 1);                                                     // eye
    p(px+2, py-4, CO, 3, 6); p(px+3, py-3, F2, 1, 5);                            // flame crest
    p(px+4, py-3, CO, 2, 4); p(px+4, py-2, F3, 1, 3);
    p(px+3, py-5, F4, 1, 2);
    // wing, beating
    p(px-2, py+4+wing, CO, 5, 10); p(px-1, py+5+wing, R1, 3, 8);
    p(px-1, py+5+wing, F1, 3, 4); p(px-1, py+5+wing, F3, 3, 1);
    p(px-1, py+11+wing, G2, 3, 2);                                               // wing tip gold
    // tail fan, trailing back and down
    for (let i = 0; i < 4; i++) {
        const ty = py + 13 + i * 2 + (i % 2 ? tail : -tail);
        const tw = 6 - i;
        p(px - 3 - i, ty, CO, tw + 1, 2);
        p(px - 2 - i, ty, i % 2 ? F2 : G3, tw, 1);
        glow(px - 2 - i, ty, F4, tw, 1, 0.32 + ep * 0.22);
    }
    p(px+3, py+13, CO, 4, 2); p(px+4, py+13, G3, 2, 1);                          // talons
    glow(px+2, py+6, F3, 6, 1, 0.42 + ep * 0.30);
    glow(px+2, py-4, F4, 3, 3, 0.55 + ep * 0.30);
    // embers shed from the bird
    for (let i = 0; i < 3; i++) {
        const t = ((now * 0.0015) + i / 3) % 1;
        glow(px + 1 + ((i * 2) % 4), py + 10 + Math.round(t * 10), F4, 1, 1, (1 - t) * 0.7);
    }

    if (isAtk) {
        glow(px-2, py-5, F4, 12, 22, 0.50);
        glow(-1, -9, G4, 3, 3, 0.55);
    }
}

/* ═══════════════════════════════════════════════════════ drawVoidSniper ═══ */
// ───────────────────────────────────────────────────
// VOID SNIPER — 공허의 저격수. Black cloak, a long void rifle across the body,
// a starlight monocle over one eye.
// Lore: 검은 망토에 긴 공허 라이플을 멘 저격수, 한쪽 눈에 별빛 단안경.
// ───────────────────────────────────────────────────
function drawVoidSniper(cx, cy, tower) {
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
    const charge = (now % 1600) / 1600;

    const CO='#000';
    const N0='#08080E', N1='#1A1A28', N2='#2E2E44', N3='#4A4A6A', N4='#7878A0';  // black cloak
    const V1='#3A0A5E', V2='#7B1FA2', V3='#B060E0', V4='#E0B0FF';                // void charge
    const S1='#5A6478', S2='#98A2B8', S3='#D2DAEA', S4='#FFFFFF';                // gun steel
    const G2='#B88000', G3='#FFD700';
    const K0='#B07A48', K1='#E0B088', K2='#F8D0A8';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -20, -36 + idleY, V2, 40, 66, isLeft, S);
    ctx.restore();

    // ── CLOAK (high collar, falls to the ankle, ragged at the hem)
    p(-11,-18, CO, 23, 34); p(-10,-17, N0, 21, 32); p(-9,-17, N1, 19, 31);
    p(-10,-17, N3, 21,  1);                                                      // top highlight
    p(-6,-16, N2, 11, 29);                                                       // lit inner panel
    for (let i = 0; i < 11; i++) {
        const tx = -11 + i * 2, tl = 2 + ((i * 5) % 5);
        p(tx, 16, CO, 2, tl); p(tx, 16, N1, 1, tl - 1);
    }

    // ── BOOTS
    p(-7, 20, CO, 6, 5); p(-6, 21, N1, 4, 3); p(-6, 21, N3, 4, 1);
    p( 1, 20, CO, 6, 5); p( 2, 21, N1, 4, 3); p( 2, 21, N3, 4, 1);

    // ── UNDER-COAT
    p(-6,  2, CO, 13, 16); p(-5,  3, N0, 11, 14); p(-4,  4, N1, 9, 12);
    p(-5,  3, N4, 11,  1);                                                       // top highlight
    p(-6,  0, CO, 13,  3); p(-5,  1, V1, 11, 2); p(-5, 1, V2, 11, 1);            // void belt

    // ── TORSO
    p(-7,-16, CO, 14, 18); p(-6,-15, N0, 12, 16); p(-5,-15, N1, 10, 15);
    p(-6,-15, N4, 12,  1);                                                       // top highlight
    p(-3,-14, N2,  6, 13);
    p(-2, -9, CO,  5,  5); p(-1, -8, V1, 3, 3); p(-1, -8, V3, 3, 1);             // void core
    glow(-1, -8, V4, 3, 1, 0.50 + ep * 0.32);

    // ── HIGH COLLAR
    p(-8,-21, CO, 16, 6); p(-7,-20, N1, 14, 4); p(-7,-20, N3, 14, 1);
    p(-8,-21, CO,  3, 8); p( 5,-21, CO, 3, 8);
    p(-7,-20, N2,  1, 6); p( 6,-20, N2, 1, 6);

    // ── ARMS bracing the rifle
    p(-12,-13, CO, 6, 10); p(-11,-12, N1, 4, 8); p(-11,-12, N3, 4, 1);
    p(-13, -5, CO, 5,  5); p(-12, -4, K1, 3, 3);                                 // support hand
    p(  6,-13, CO, 6,  9); p(  7,-12, N1, 4, 7); p(  7,-12, N3, 4, 1);
    p(  7, -6, CO, 5,  5); p(  8, -5, K1, 3, 3);                                 // trigger hand

    // ── LONG VOID RIFLE, carried level across the body
    p(-16,-11, CO, 34, 5); p(-15,-10, S1, 32, 3); p(-15,-10, S3, 32, 1);         // barrel
    p(-16,-11, N0,  6, 5); p(-15,-10, S2, 4, 2);                                 // muzzle brake
    p( 10,-13, CO,  8, 8); p(11,-12, N1, 6, 6); p(11,-12, N3, 6, 1);             // receiver
    p( 12,-16, CO,  6, 4); p(13,-15, S2, 4, 2); p(13,-15, S4, 4, 1);             // scope
    p( 13,-15, V2,  4, 1);                                                       // scope lens
    p( 16, -6, CO,  5, 9); p(17, -5, N1, 3, 7); p(17, -5, N3, 3, 1);             // stock
    p( -8, -6, CO,  4, 5); p(-7, -5, N1, 2, 3);                                  // fore grip
    // void charge running up the barrel toward the muzzle
    for (let i = 0; i < 5; i++) {
        const t  = (charge + i / 5) % 1;
        glow(10 - Math.round(t * 25), -10, V4, 3, 1, (1 - t) * 0.8);
    }
    glow(13,-15, V4, 4, 1, 0.55 + ep * 0.30);

    // ── NECK + HEAD
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-4,-29, CO, 3, 2); p(-3,-29, S4, 1, 1);                                    // bare eye
    p(-1,-25, K0, 2, 1);

    // ── STARLIGHT MONOCLE over the aiming eye
    p( 0,-31, CO, 6, 6); p( 1,-30, N0, 4, 4);
    p( 1,-30, V2, 4, 1);                                                         // lens tint
    p( 2,-29, V4, 1, 1);                                                         // star glint
    p( 6,-30, G2, 1, 3);                                                         // chain to the ear
    p( 6,-27, G2, 2, 1);
    glow( 2,-29, V4, 1, 1, 0.70 + ep * 0.30);
    glow( 1,-30, V3, 4, 1, 0.35 + ep * 0.25);

    // ── HOOD over the head
    p(-7,-38, CO, 14, 6); p(-6,-37, N0, 12, 4); p(-6,-37, N2, 12, 1);
    p(-8,-34, CO,  3, 7); p(-7,-33, N0, 1, 6);
    p( 6,-34, CO,  3, 7); p( 7,-33, N0, 1, 6);

    if (isAtk) {
        glow(-16,-10, V4, 6, 3, 0.85);                                           // muzzle flash
        glow( 2,-29, V4, 1, 1, 0.95);
        glow(-1, -8, V4, 3, 3, 0.55);
    }
}

/* ══════════════════════════════════════════════════════ drawThousandHand ═══ */
// ───────────────────────────────────────────────────
// THOUSAND-HAND ARCHER — 천수궁수. Six gilded arms fanned out, a drawn bow in
// every one of them.
// Lore: 다중 팔로 수많은 활을 동시에 당기는 황금빛 천수궁수.
// The old art gave her a single staff, which is the one thing the name rules out.
// ───────────────────────────────────────────────────
function drawThousandHand(cx, cy, tower) {
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
    const draw = isAtk ? 2 : 0;

    const CO='#000';
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8', G5='#FFFDE8';
    const R1='#6A0C14', R2='#A81824', R3='#E0343C';                              // crimson sash
    const C1='#0A6E96', C3='#7FE8FF', C4='#DDFAFF';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -22, -36 + idleY, G3, 44, 66, isLeft, S);
    ctx.restore();

    // ── SIX ARMS, three a side, fanned by angle. The outermost pair reaches
    //    highest; each carries its own small bow with the string drawn.
    //    Each arm reaches further out AND higher than the one below it, so the
    //    six read as a fan. Stacking them at the same offsets, as the first
    //    pass did, just made two gold columns.
    for (let k = 0; k < 2; k++) {
        for (let i = 0; i < 3; i++) {
            const sgn = k ? 1 : -1;
            const reach = 7 + i * 5;
            const ay  = -10 - i * 8;
            const ax  = sgn * reach;
            const px2 = k ? ax - 3 : ax - 2;
            // upper arm out to the grip
            p(px2, ay, CO, 6, 5); p(px2 + 1, ay + 1, G1, 4, 3);
            p(px2 + 1, ay + 1, G3, 4, 1);                                        // arm top light
            // bow: limbs above and below the grip, drawn string on the inside
            const bx = k ? ax + 2 : ax - 5;
            p(bx, ay - 8, CO, 3, 9);  p(bx + 1, ay - 7, G2, 1, 7);
            p(bx, ay + 4, CO, 3, 9);  p(bx + 1, ay + 5, G2, 1, 7);
            p(bx, ay - 1, CO, 3, 5);  p(bx + 1, ay,     G1, 1, 3);
            p(bx + (k ? 0 : 2), ay - 8, G4, 1, 1);
            p(bx + (k ? 0 : 2), ay + 11, G4, 1, 1);                              // gold nocks
            for (let t = 0; t < 10; t++) {
                const sy = ay - 7 + t * 2;
                const sx = bx + (k ? -1 : 3) + (k ? draw : -draw);
                glow(sx, sy, C3, 1, 2, 0.42 + ep * 0.20);
            }
            glow(px2 + 1, ay + 1, G4, 4, 1, 0.26 + ep * 0.20);
        }
    }

    // ── BOOTS
    p(-7, 22, CO, 6, 5); p(-6, 23, G1, 4, 3); p(-6, 23, G3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, G1, 4, 3); p( 2, 23, G3, 4, 1);

    // ── LOWER ROBE
    p(-8,  4, CO, 16, 19);
    p(-7,  5, G0, 14, 17); p(-6,  5, G1, 12, 16); p(-4,  6, G2, 8, 14);
    p(-7,  5, G4, 14,  1);                                                       // top highlight
    p(-3,  7, G0,  1, 12); p( 2,  7, G0,  1, 12);
    p(-8, 19, CO, 16,  3); p(-7, 20, R2, 14, 2); p(-7, 20, R3, 14, 1);           // crimson hem

    // ── SASH
    p(-7,  1, CO, 14, 4); p(-6, 2, R1, 12, 2); p(-6, 2, R3, 12, 1);

    // ── TORSO
    p(-7,-17, CO, 14, 19);
    p(-6,-16, G0, 12, 17); p(-5,-16, G1, 10, 16); p(-3,-15, G2, 6, 14);
    p(-6,-16, G4, 12,  1);                                                       // top highlight
    p(-6,-16, G3,  1, 17); p( 5,-16, G3, 1, 17);
    p(-2,-10, CO,  5,  5); p(-1, -9, C1, 3, 3); p(-1, -9, C3, 3, 1);
    glow(-1, -9, C4, 3, 1, 0.50 + ep * 0.30);

    // ── COLLAR
    p(-7,-20, CO, 14, 4); p(-6,-19, G2, 12, 2); p(-6,-19, G4, 12, 1);

    // ── NECK + HEAD (serene)
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-4,-29, CO, 3, 1); p( 1,-29, CO, 3, 1);                                    // lowered lids
    p(-1,-25, K0, 2, 1);
    p(-3,-31, G2, 7, 1);                                                         // brow mark

    // ── HALO + CROWN
    p(-9,-40, CO, 18, 1); p(-9,-36, CO, 18, 1);
    p(-10,-39, CO, 1, 3); p( 9,-39, CO, 1, 3);
    p(-9,-39, G3, 18, 1); p(-9,-37, G2, 18, 1);
    p(-9,-38, G0, 18, 1);                                                        // hollow interior
    glow(-9,-39, G5, 18, 1, 0.45 + ep * 0.30);
    p(-7,-36, CO, 14, 3); p(-6,-35, G2, 12, 2); p(-6,-35, G4, 12, 1);
    p(-1,-38, CO,  3, 3); p( 0,-37, C3, 1, 1);
    glow( 0,-37, C4, 1, 1, 0.55 + ep * 0.30);

    if (isAtk) {
        glow(-9,-39, G5, 18, 1, 0.70);
        glow(-1, -9, C4, 3, 3, 0.60);
    }
}

/* ─── window exports ─────────────────────────────────────────────────────── */
window.drawPaladin          = drawPaladin;
window.drawCrusader         = drawCrusader;
window.drawHellfireAlchemist = drawHellfireAlchemist;
window.drawPhoenixSummoner  = drawPhoenixSummoner;
window.drawVoidSniper       = drawVoidSniper;
window.drawThousandHand     = drawThousandHand;

/* ══════════════════════════════ NOVICE EXORCIST EXCLUSIVE ATTACK T3 ══════ */

// ───────────────────────────────────────────────────
// SCRIPTURE KNIGHT — 성구 기사. Platinum plate set with prayer beads, swinging
// a consecrated sword of light.
// Lore: 성구 구슬이 박힌 백금 갑주에 축성된 광검을 휘두르는 기사.
// ───────────────────────────────────────────────────
function drawScriptureKnight(cx, cy, tower) {
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
    const ep = (Math.sin(now * 0.004) + 1) / 2;

    const CO='#000';
    const T0='#2E323E', T1='#767E92', T2='#B6BECE', T3='#E2E8F2', T4='#FFFFFF';  // platinum
    const B0='#3A2A14', B1='#6A4E20', B2='#A87C34';                              // beads
    const G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8', G5='#FFFDE8';
    const L2='#CFE4FF', L3='#EAF4FF', L4='#FFFFFF';                              // sword light
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -20, -36 + idleY, L3, 40, 64, isLeft, S);
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

    // ── CUIRASS, prayer beads set into the plate
    p(-8,-19, CO, 17, 21); p(-7,-18, T0, 15, 19); p(-6,-18, T1, 13, 18);
    p(-4,-17, T2,  9, 16);
    p(-7,-18, T4, 15,  1);                                                       // top highlight
    p( 6,-17, T0,  2, 17);
    p(-6,-12, T0, 15,  1); p(-6, -6, T0, 15, 1);                                 // plate seams
    beads(-6,-15, 6,-15, 7, B0, B1, B2);                                         // bead course
    beads(-6, -3, 6, -3, 7, B0, B1, B2);
    p(-2,-10, CO,  5,  5); p(-1, -9, G3, 3, 3); p(-1, -9, G5, 3, 1);
    glow(-1, -9, G5, 3, 1, 0.50 + ep * 0.30);

    // ── PAULDRONS + COLLAR
    p(-13,-22, CO, 7, 9); p(-12,-21, T1, 5, 7); p(-12,-21, T4, 5, 1);
    p(-12,-22, G2,  5, 1);
    p(  6,-22, CO, 7, 9); p(  7,-21, T1, 5, 7); p(  7,-21, T4, 5, 1);
    p(  7,-22, G2,  5, 1);
    p(-6,-23, CO, 12, 3); p(-5,-22, T3, 10, 2); p(-5,-22, T4, 10, 1);

    // ── ARMS, sword arm up
    p(-12,-16, CO, 6, 14); p(-11,-15, T1, 4, 12); p(-11,-15, T3, 4, 1);
    p(-12, -2, CO, 6,  5); p(-11, -1, T2, 4,  3); p(-11, -1, T4, 4, 1);
    p(  6,-17, CO, 6, 10); p(  7,-16, T1, 4,  8); p(  7,-16, T3, 4, 1);
    p(  8,-26, CO, 6, 10); p(  9,-25, T1, 4,  8); p(  9,-25, T3, 4, 1);
    p(  8,-29, CO, 6,  5); p(  9,-28, T2, 4,  3); p(  9,-28, T4, 4, 1);

    // ── CONSECRATED SWORD OF LIGHT — the blade is the glow, so it is drawn
    //    almost entirely in emissive with only a thin core.
    p( 9,-34, CO, 5, 7); p(10,-33, G2, 3, 5); p(10,-33, G4, 3, 1);               // hilt
    p( 7,-38, CO, 9, 5); p( 8,-37, G2, 7, 3); p( 8,-37, G5, 7, 1);               // crossguard
    p(10,-70, CO, 4, 33); p(11,-69, L2, 2, 31);                                  // blade core
    p(11,-69, L4, 2,  2);
    glow(10,-70, L4, 4, 33, 0.40 + ep * 0.20);
    glow(11,-69, L4, 2, 31, 0.55 + ep * 0.22);
    glow( 9,-70, L3, 6, 33, 0.18 + ep * 0.14);                                   // spill either side
    p(11,-74, CO, 3, 5); p(12,-73, L3, 1, 3);                                    // point
    glow(12,-73, L4, 1, 3, 0.70);

    // ── NECK + HELM
    p(-2,-25, CO, 4, 3); p(-1,-24, K0, 2, 2);
    p(-7,-38, CO, 14, 15); p(-6,-37, T0, 12, 13); p(-5,-37, T1, 10, 12);
    p(-6,-37, T4, 12,  1);                                                       // top highlight
    p( 4,-36, T0,  2, 11);
    p(-6,-32, CO, 12,  3); p(-5,-31, K0, 10, 1);
    p(-5,-31, isAtk ? L4 : G3, 10, 1);                                           // visor slit
    glow(-5,-31, L4, 10, 1, 0.42 + ep * 0.28);
    p(-7,-39, CO, 14, 2); p(-6,-38, G2, 12, 1);
    beads(-6,-40, 5,-40, 6, B0, B1, B2);                                         // bead browband
    p(-2,-44, CO,  5, 5); p(-1,-43, G3, 3, 3); p(-1,-43, G5, 3, 1);
    glow(-1,-43, G5, 3, 1, 0.45 + ep * 0.28);

    if (isAtk) {
        glow(10,-70, L4, 4, 33, 0.70);
        glow(-1, -9, G5, 3,  3, 0.55);
    }
}

// ───────────────────────────────────────────────────
// SEAL WARRIOR — 봉인 전사. Grey-white plate carved over with seal talismans,
// a sword bound in a rosary cord.
// Lore: 봉인 부적이 새겨진 회백색 갑주, 묵주를 휘감은 칼을 쥔 전사.
// ───────────────────────────────────────────────────
function drawSealWarrior(cx, cy, tower) {
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
    const ep = (Math.sin(now * 0.004) + 1) / 2;

    const CO='#000';
    const A0='#33363E', A1='#6E7280', A2='#A2A8B4', A3='#D0D6E0', A4='#FFFFFF';  // grey-white plate
    const B0='#3A2A14', B1='#6A4E20', B2='#A87C34';                              // beads
    const P2='#C9B98E', P3='#EDE0BC', P4='#FFF8E0';                              // seal paper
    const R2='#A81824', R3='#E0343C';                                            // seal ink
    const G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.12 + ep * 0.17;
    pUnitAura(ctx, cx, cy, -20, -36 + idleY, A3, 40, 64, isLeft, S);
    ctx.restore();

    // ── SABATONS
    p(-9, 22, CO, 8, 5); p(-8, 23, A1, 6, 3); p(-8, 23, A3, 6, 1);
    p( 2, 22, CO, 8, 5); p( 3, 23, A1, 6, 3); p( 3, 23, A3, 6, 1);

    // ── GREAVES with carved seals
    p(-9,  4, CO, 18, 19); p(-8,  5, A0, 16, 17); p(-7,  5, A1, 14, 16);
    p(-5,  6, A2, 10, 14);
    p(-8,  5, A4, 16,  1);                                                       // top highlight
    p(-1,  6, A0,  2, 13);
    for (let i = 0; i < 2; i++) { p(-6, 9 + i * 6, R2, 4, 1); p(2, 11 + i * 6, R2, 4, 1); }
    p(-9, 19, CO, 18,  3); p(-8, 20, G2, 16, 2); p(-8, 20, G3, 16, 1);

    // ── BELT
    p(-8,  1, CO, 16, 4); p(-7, 2, G2, 14, 2); p(-7, 2, G3, 14, 1);

    // ── CUIRASS, seal script cut across the plate
    p(-8,-19, CO, 17, 21); p(-7,-18, A0, 15, 19); p(-6,-18, A1, 13, 18);
    p(-4,-17, A2,  9, 16);
    p(-7,-18, A4, 15,  1);                                                       // top highlight
    p( 6,-17, A0,  2, 17);
    for (let i = 0; i < 4; i++) p(-5, -15 + i * 5, R2, 11, 1);                   // carved seal lines
    p(-2,-10, CO,  5,  5); p(-1, -9, R2, 3, 3); p(-1, -9, R3, 3, 1);
    glow(-1, -9, R3, 3, 1, 0.45 + ep * 0.28);

    // ── SEAL TALISMAN pinned to the left pauldron
    p(-15,-25, CO, 5, 12); p(-14,-24, P2, 3, 10); p(-14,-24, P4, 3, 1);
    p(-14,-22, R2,  3, 1); p(-14,-19, R2, 3, 1); p(-14,-16, R2, 3, 1);
    glow(-14,-22, R3, 3, 1, 0.30 + ep * 0.22);

    // ── PAULDRONS + COLLAR
    p(-13,-22, CO, 7, 9); p(-12,-21, A1, 5, 7); p(-12,-21, A4, 5, 1);
    p(  6,-22, CO, 7, 9); p(  7,-21, A1, 5, 7); p(  7,-21, A4, 5, 1);
    p(-6,-23, CO, 12, 3); p(-5,-22, A3, 10, 2); p(-5,-22, A4, 10, 1);

    // ── ARMS, sword held across the body
    p(-12,-16, CO, 6, 14); p(-11,-15, A1, 4, 12); p(-11,-15, A3, 4, 1);
    p(-12, -2, CO, 6,  5); p(-11, -1, K1, 4,  3); p(-11, -1, K2, 4, 1);
    p(  6,-16, CO, 6, 13); p(  7,-15, A1, 4, 11); p(  7,-15, A3, 4, 1);
    p(  6, -4, CO, 6,  5); p(  7, -3, K1, 4,  3); p(  7, -3, K2, 4, 1);

    // ── ROSARY-BOUND SWORD — the cord is wound up the blade itself, which is
    //    the point of the unit: a weapon kept sealed.
    p( 9,-40, CO, 6, 40); p(10,-39, A2, 4, 38); p(10,-39, A4, 4, 1);             // blade
    p(11,-38, A3,  2, 36);
    p(10,-44, CO, 4,  5); p(11,-43, A3, 2, 3);                                   // point
    p( 7,-2, CO, 10, 4); p( 8, -1, G2, 8, 2); p( 8, -1, G4, 8, 1);               // crossguard
    p(10,  2, CO, 4,  5); p(11,  3, B1, 2, 3);                                   // grip
    p( 9,  7, CO, 6,  4); p(10,  8, G3, 4, 2);                                   // pommel
    beads(10,-36, 12, -4, 10, B0, B1, B2);                                       // cord up the blade
    // small seal slips knotted along it
    for (let i = 0; i < 3; i++) {
        const sy = -30 + i * 10;
        p(14, sy, CO, 4, 8); p(15, sy + 1, P2, 2, 6); p(15, sy + 1, P4, 2, 1);
        p(15, sy + 3, R2, 2, 1);
        glow(15, sy + 3, R3, 2, 1, 0.28 + ep * 0.20);
    }

    // ── NECK + HELM
    p(-2,-25, CO, 4, 3); p(-1,-24, K0, 2, 2);
    p(-7,-38, CO, 14, 15); p(-6,-37, A0, 12, 13); p(-5,-37, A1, 10, 12);
    p(-6,-37, A4, 12,  1);                                                       // top highlight
    p( 4,-36, A0,  2, 11);
    p(-6,-32, CO, 12,  3); p(-5,-31, K0, 10, 1);
    p(-5,-31, isAtk ? R3 : R2, 10, 1);                                           // visor slit
    glow(-5,-31, R3, 10, 1, 0.35 + ep * 0.26);
    p(-6,-35, R2, 12,  1);                                                       // seal cut on the brow
    p(-7,-39, CO, 14, 2); p(-6,-38, G2, 12, 1);
    p(-2,-43, CO,  5, 5); p(-1,-42, P3, 3, 3); p(-1,-42, P4, 3, 1);              // crest slip
    p(-1,-41, R2,  3, 1);

    if (isAtk) {
        glow(10,-40, A4, 4, 40, 0.35);
        glow(-1, -9, R3, 3,  3, 0.55);
    }
}

// ───────────────────────────────────────────────────
// TOME CANNON — 성서 대포. A great gold scripture held open and fired through,
// runes alight on every page.
// Lore: 거대한 황금 성서를 펼쳐 대포로 사용하는 포격수, 페이지마다 룬이 빛남.
// ───────────────────────────────────────────────────
function drawTomeCannon(cx, cy, tower) {
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
    const charge = (now % 1100) / 1100;

    const CO='#000';
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8', G5='#FFFDE8';
    const P1='#8A7A54', P2='#C9B98E', P3='#EDE0BC', P4='#FFF8E0';                // pages
    const W1='#8C8C9C', W2='#C8C8D8', W3='#EDEDF6', W4='#FFFFFF';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -20, -34 + idleY, G3, 40, 60, isLeft, S);
    ctx.restore();

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, W1, 4, 3); p(-6, 23, W3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, W1, 4, 3); p( 2, 23, W3, 4, 1);

    // ── VESTMENT SKIRT
    p(-9,  4, CO, 18, 19);
    p(-8,  5, W1, 16, 17); p(-7,  5, W2, 14, 16); p(-5,  6, W3, 10, 14);
    p(-8,  5, W4, 16,  1);                                                       // top highlight
    p(-3,  7, W1,  1, 12); p( 3,  7, W1,  1, 12);
    p(-9, 19, CO, 18,  3); p(-8, 20, G2, 16, 2); p(-8, 20, G3, 16, 1);

    // ── CINCTURE
    p(-8,  1, CO, 16, 4); p(-7, 2, G1, 14, 2); p(-7, 2, G3, 14, 1);

    // ── TORSO
    p(-7,-17, CO, 14, 19);
    p(-6,-16, W1, 12, 17); p(-5,-16, W2, 10, 16); p(-3,-15, W3, 6, 14);
    p(-6,-16, W4, 12,  1);                                                       // top highlight
    p(-5,-16, G1,  2, 17); p( 3,-16, G1, 2, 17);                                 // gold stole
    p(-5,-16, G3,  2,  1); p( 3,-16, G3, 2, 1);

    // ── COLLAR
    p(-7,-20, CO, 14, 4); p(-6,-19, W3, 12, 2); p(-6,-19, W4, 12, 1);

    // ── ARMS holding the tome up and out
    p(-12,-15, CO, 6, 13); p(-11,-14, W2, 4, 11); p(-11,-14, W4, 4, 1);
    p(-12, -3, CO, 6,  5); p(-11, -2, K1, 4,  3); p(-11, -2, K2, 4, 1);
    p(  6,-16, CO, 6, 11); p(  7,-15, W2, 4,  9); p(  7,-15, W4, 4, 1);
    p(  6, -6, CO, 6,  5); p(  7, -5, K1, 4,  3); p(  7, -5, K2, 4, 1);

    // ── THE TOME AS A CANNON — covers splayed back, pages fanned forward, the
    //    muzzle firing out of the gutter between them.
    p( 8,-28, CO, 6, 40); p( 9,-27, G1, 4, 38); p( 9,-27, G3, 4, 2);             // spine
    // upper cover + page fan
    for (let i = 0; i < 5; i++) {
        const py = -26 + i * 2;
        const pw = 15 - i * 2;
        p(12, py, CO, pw + 1, 3);
        p(13, py, i === 0 ? G2 : P2, pw - 1, 2);
        p(13, py, i === 0 ? G4 : P4, pw - 1, 1);                                 // page top light
    }
    // lower cover + page fan
    for (let i = 0; i < 5; i++) {
        const py = 4 + i * 2;
        const pw = 7 + i * 2;
        p(12, py, CO, pw + 1, 3);
        p(13, py, i === 4 ? G2 : P2, pw - 1, 2);
        p(13, py, i === 4 ? G4 : P4, pw - 1, 1);
    }
    // glowing runes on the exposed pages
    for (let i = 0; i < 3; i++) {
        p(15 + i * 3, -22 + i * 2, G3, 3, 1);
        p(15 + i * 3,  10 - i * 2, G3, 3, 1);
        glow(15 + i * 3, -22 + i * 2, G5, 3, 1, 0.40 + ep * 0.28);
        glow(15 + i * 3,  10 - i * 2, G5, 3, 1, 0.40 + ep * 0.28);
    }
    // the bore between the leaves, charging
    p(12, -8, CO, 16, 14); p(13, -7, G0, 14, 12);
    p(13, -7, G1, 14,  2);
    glow(13, -7, G4, 14, 2, 0.30 + ep * 0.24);
    for (let i = 0; i < 4; i++) {
        const t = (charge + i / 4) % 1;
        glow(26 - Math.round(t * 12), -4, G5, 3, 4, (1 - t) * 0.85);
    }

    // ── NECK + HEAD
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-4,-29, CO, 3, 2); p( 1,-29, CO, 3, 2);
    p(-3,-29, isAtk ? G5 : G4, 1, 1); p( 2,-29, isAtk ? G5 : G4, 1, 1);
    p(-1,-25, K0, 2, 1);

    // ── READING SPECTACLES + BIRETTA
    p(-6,-30, CO, 5, 4); p(-5,-29, G0, 3, 2);
    p( 1,-30, CO, 5, 4); p( 2,-29, G0, 3, 2);
    p(-1,-29, G2, 2, 1);
    p(-7,-38, CO, 14, 5); p(-6,-37, W2, 12, 3); p(-6,-37, W4, 12, 1);
    p(-2,-41, CO,  5, 4); p(-1,-40, G2, 3, 2); p(-1,-40, G4, 3, 1);
    glow(-1,-40, G5, 3, 1, 0.45 + ep * 0.28);

    if (isAtk) {
        glow(13, -7, G5, 14, 12, 0.60);
        for (let i = 0; i < 3; i++) {
            glow(15 + i * 3, -22 + i * 2, G5, 3, 1, 0.70);
            glow(15 + i * 3,  10 - i * 2, G5, 3, 1, 0.70);
        }
    }
}

// ───────────────────────────────────────────────────
// HOLY BURST — 신성 폭격사. Platinum pauldron plate under a huge bombardment
// staff carried across the shoulder.
// Lore: 백금 견장 갑주에 거대한 신성 폭격 지팡이를 짊어진 폭격사.
// ───────────────────────────────────────────────────
function drawHolyBurst(cx, cy, tower) {
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
    const charge = (now % 1000) / 1000;

    const CO='#000';
    const T0='#2E323E', T1='#767E92', T2='#B6BECE', T3='#E2E8F2', T4='#FFFFFF';  // platinum
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8', G5='#FFFDE8';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
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

    // ── CUIRASS
    p(-8,-18, CO, 17, 20); p(-7,-17, T0, 15, 18); p(-6,-17, T1, 13, 17);
    p(-4,-16, T2,  9, 15);
    p(-7,-17, T4, 15,  1);                                                       // top highlight
    p( 6,-16, T0,  2, 16);
    p(-2, -8, CO,  5,  5); p(-1, -7, G2, 3, 3); p(-1, -7, G4, 3, 1);
    glow(-1, -7, G5, 3, 1, 0.50 + ep * 0.30);

    // ── OVERSIZED PAULDRONS (the lore's named feature)
    p(-16,-23, CO, 9, 12); p(-15,-22, T1, 7, 10); p(-15,-22, T4, 7, 1);
    p(-15,-19, T2,  7,  6); p(-15,-22, G2, 7, 1);
    p(-14,-26, CO, 5,  4); p(-13,-25, G3, 3, 2);                                 // crest
    p(  8,-23, CO, 9, 12); p(  9,-22, T1, 7, 10); p(  9,-22, T4, 7, 1);
    p(  9,-19, T2,  7,  6); p(  9,-22, G2, 7, 1);
    p( 10,-26, CO, 5,  4); p( 11,-25, G3, 3, 2);

    // ── COLLAR
    p(-6,-22, CO, 12, 3); p(-5,-21, T3, 10, 2); p(-5,-21, T4, 10, 1);

    // ── ARMS gripping the haft
    p(-13,-13, CO, 6, 13); p(-12,-12, T1, 4, 11); p(-12,-12, T3, 4, 1);
    p(-13, -1, CO, 6,  5); p(-12,  0, K1, 4,  3); p(-12, 0, K2, 4, 1);
    p(  7,-13, CO, 6, 11); p(  8,-12, T1, 4,  9); p(  8,-12, T3, 4, 1);
    p(  7, -3, CO, 6,  5); p(  8, -2, K1, 4,  3); p(  8, -2, K2, 4, 1);

    // ── BOMBARDMENT STAFF, carried diagonally across the back
    for (let i = 0; i < 16; i++) {
        const hx = -16 + i * 2, hy = 12 - i * 3;
        p(hx, hy, CO, 4, 4); p(hx + 1, hy, G1, 2, 3); p(hx + 1, hy, G3, 2, 1);
    }
    p(-18, 14, CO, 6, 5); p(-17, 15, G2, 4, 3); p(-17, 15, G4, 4, 1);            // butt cap
    // head: a caged burst chamber
    p(12,-40, CO, 12, 14); p(13,-39, G1, 10, 12); p(13,-39, G4, 10, 1);
    p(14,-38, CO,  8, 10); p(15,-37, G0,  6,  8);
    p(15,-37, G3,  6,  2);                                                       // charge in the cage
    p(12,-44, CO, 12,  4); p(13,-43, G2, 10, 2); p(13,-43, G4, 10, 1);           // cage top
    p(12,-27, CO, 12,  4); p(13,-27, G2, 10, 2);                                 // cage bottom
    p(13,-38, G2,  1, 10); p(22,-38, G2, 1, 10);                                 // cage bars
    p(17,-38, G2,  1, 10);
    glow(15,-37, G5, 6, 2, 0.45 + ep * 0.32);
    for (let i = 0; i < 3; i++) {
        const t = (charge + i / 3) % 1;
        glow(15, -36 + Math.round(t * 7), G5, 6, 1, (1 - t) * 0.7);
    }

    // ── NECK + HELM
    p(-2,-24, CO, 4, 3); p(-1,-23, K0, 2, 2);
    p(-7,-37, CO, 14, 14); p(-6,-36, T0, 12, 12); p(-5,-36, T1, 10, 11);
    p(-6,-36, T4, 12,  1);                                                       // top highlight
    p(-6,-31, CO, 12,  3); p(-5,-30, K0, 10, 1);
    p(-5,-30, isAtk ? G5 : G3, 10, 1);                                           // visor slit
    glow(-5,-30, G5, 10, 1, 0.42 + ep * 0.28);
    p(-7,-38, CO, 14, 2); p(-6,-37, G2, 12, 1);
    p(-2,-42, CO,  5, 5); p(-1,-41, G3, 3, 3); p(-1,-41, G4, 3, 1);
    glow(-1,-41, G5, 3, 1, 0.45 + ep * 0.28);

    if (isAtk) {
        glow(13,-39, G5, 10, 12, 0.65);
        glow(-1, -7, G5,  3,  3, 0.55);
    }
}

// ───────────────────────────────────────────────────
// RAPID EXORCIST — 속성 퇴마사. Light white vestments and a purification
// pistol in each hand.
// Lore: 가벼운 백색 사제복에 쌍권총형 정화 마도구를 든 속사 퇴마사.
// ───────────────────────────────────────────────────
function drawRapidExorcist(cx, cy, tower) {
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
    const ep    = (Math.sin(now * 0.005) + 1) / 2;
    const recoil = isAtk ? 2 : 0;

    const CO='#000';
    const W0='#4A4A56', W1='#8C8C9C', W2='#C8C8D8', W3='#EDEDF6', W4='#FFFFFF';  // white vestments
    const S1='#5A6478', S2='#98A2B8', S3='#D2DAEA';                              // gun steel
    const G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const C1='#0A6E96', C2='#22B8E0', C3='#7FE8FF', C4='#DDFAFF';                // purifier cyan
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';
    const H1='#6A4E20', H2='#A87C34';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -19, -34 + idleY, C2, 38, 60, isLeft, S);
    ctx.restore();

    // ── BOOTS
    p(-7, 20, CO, 6, 5); p(-6, 21, W1, 4, 3); p(-6, 21, W3, 4, 1);
    p( 1, 20, CO, 6, 5); p( 2, 21, W1, 4, 3); p( 2, 21, W3, 4, 1);

    // ── SHORT VESTMENT (cut for movement, not a full robe)
    p(-8,  4, CO, 16, 17);
    p(-7,  5, W1, 14, 15); p(-6,  5, W2, 12, 14); p(-4,  6, W3, 8, 12);
    p(-7,  5, W4, 14,  1);                                                       // top highlight
    p(-1,  6, W0,  2, 12);                                                       // leg split
    p(-8, 17, CO, 16,  3); p(-7, 18, G2, 14, 2); p(-7, 18, G3, 14, 1);

    // ── BELT with spare charges
    p(-8,  1, CO, 16, 4); p(-7, 2, G1, 14, 2); p(-7, 2, G3, 14, 1);
    for (let i = 0; i < 4; i++) { p(-6 + i * 4, 5, CO, 3, 4); p(-5 + i * 4, 6, C2, 1, 2); }

    // ── TORSO
    p(-7,-16, CO, 14, 18);
    p(-6,-15, W1, 12, 16); p(-5,-15, W2, 10, 15); p(-3,-14, W3, 6, 13);
    p(-6,-15, W4, 12,  1);                                                       // top highlight
    p(-1,-13, CO,  3,  9); p( 0,-12, G3, 1, 7);                                  // small cross
    p(-3,-10, CO,  7,  3); p(-2, -9, G3, 5, 1);

    // ── SHOULDER CAPE (short)
    p(-9,-19, CO, 18, 4); p(-8,-18, W3, 16, 2); p(-8,-18, W4, 16, 1);

    // ── ARMS, both out with the pistols levelled
    p(-13,-12, CO, 6, 9); p(-12,-11, W2, 4, 7); p(-12,-11, W4, 4, 1);
    p(-15, -6, CO, 5, 5); p(-14, -5, K1, 3, 3);
    p(  7,-12, CO, 6, 9); p(  8,-11, W2, 4, 7); p(  8,-11, W4, 4, 1);
    p(  9, -6, CO, 5, 5); p( 10, -5, K1, 3, 3);

    // ── TWIN PURIFICATION PISTOLS — a boxy frame, a cyan charge cell in the
    //    body, and a short flared muzzle. Both kick back on the attack frame.
    const pistol = (gx, dir) => {
        const b = gx + dir * recoil;
        p(b, -9, CO, 4, 6); p(b + 1, -8, S1, 2, 4); p(b + 1, -8, S3, 2, 1);      // grip
        p(b - dir * 2, -13, CO, 9, 5);
        p(b - dir * 2 + 1, -12, S2, 7, 3); p(b - dir * 2 + 1, -12, S3, 7, 1);    // frame
        p(b - dir * 2 + 2, -12, C1, 3, 2);                                       // charge cell
        p(b - dir * 6, -13, CO, 5, 5); p(b - dir * 6 + 1, -12, S1, 3, 3);        // muzzle flare
        p(b - dir * 6 + 1, -12, G2, 3, 1);
        glow(b - dir * 2 + 2, -12, C4, 3, 1, 0.45 + ep * 0.30);
        if (isAtk) glow(b - dir * 8, -12, C4, 4, 3, 0.85);                       // muzzle flash
    };
    pistol(-15, 1);
    pistol( 12,-1);

    // ── NECK + HEAD
    p(-2,-21, CO, 4, 3); p(-1,-20, K0, 2, 2);
    p(-6,-33, CO, 12, 13);
    p(-5,-32, K1, 10, 11); p(-5,-32, K2, 10, 1);
    p( 3,-31, K0,  2,  9);
    p(-6,-34, CO, 12,  4); p(-5,-33, H1, 10, 2); p(-5,-33, H2, 10, 1);
    p(-4,-28, CO,  3,  2); p( 1,-28, CO, 3, 2);
    p(-3,-28, isAtk ? C4 : W4, 1, 1); p( 2,-28, isAtk ? C4 : W4, 1, 1);
    p(-1,-24, K0,  2,  1);

    // ── HEADBAND
    p(-7,-30, CO, 14, 3); p(-6,-29, G2, 12, 2); p(-6,-29, G4, 12, 1);

    if (isAtk) {
        glow(-1,-13, G4, 3, 9, 0.45);
    }
}

// ───────────────────────────────────────────────────
// CHAIN EXORCIST — 연쇄 퇴마사. Blue vestments, a bundle of linked talismans on
// the hip, chain-bolts arcing off the fingers.
// Lore: 푸른 사제복에 연쇄 부적 묶음, 손끝에서 연쇄 볼트가 튀는 퇴마사.
// ───────────────────────────────────────────────────
function drawChainExorcist(cx, cy, tower) {
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
    const arc = (now % 600) / 600;

    const CO='#000';
    const B0='#0A1A34', B1='#1C3A6E', B2='#3260AA', B3='#548CDC', B4='#96B8F2';  // blue vestments
    const P2='#C9B98E', P3='#EDE0BC', P4='#FFF8E0';                              // talisman paper
    const R2='#A81824', R3='#E0343C';                                            // talisman ink
    const G2='#B88000', G3='#FFD700';
    const C1='#0A6E96', C2='#22B8E0', C3='#7FE8FF', C4='#DDFAFF';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';
    const H1='#6A4E20', H2='#A87C34';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -18, -34 + idleY, C2, 36, 62, isLeft, S);
    ctx.restore();

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, B1, 4, 3); p(-6, 23, B3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, B1, 4, 3); p( 2, 23, B3, 4, 1);

    // ── VESTMENT SKIRT
    p(-8,  4, CO, 16, 19);
    p(-7,  5, B0, 14, 17); p(-6,  5, B1, 12, 16); p(-4,  6, B2, 8, 14);
    p(-7,  5, B4, 14,  1);                                                       // top highlight
    p(-3,  7, B0,  1, 12); p( 2,  7, B0,  1, 12);
    p(-8, 19, CO, 16,  3); p(-7, 20, G2, 14, 2); p(-7, 20, G3, 14, 1);

    // ── SASH
    p(-7,  1, CO, 14, 4); p(-6, 2, B2, 12, 2); p(-6, 2, B4, 12, 1);

    // ── BUNDLE OF LINKED TALISMANS on the hip — slips of paper strung on a
    //    cord, each inked, the whole bundle swinging as one.
    for (let i = 0; i < 5; i++) {
        const tx = -15 + i * 2;
        const ty = 2 + Math.round(Math.sin(now * 0.003 + i * 0.7) * 1);
        p(tx, ty, CO, 3, 11); p(tx, ty + 1, P2, 2, 9); p(tx, ty + 1, P4, 2, 1);
        p(tx, ty + 3, R2, 2, 1); p(tx, ty + 6, R2, 2, 1);                        // ink marks
        glow(tx, ty + 3, C3, 2, 1, 0.22 + ep * 0.18);
    }
    p(-16, 0, CO, 13, 3); p(-15, 1, G2, 11, 2); p(-15, 1, G3, 11, 1);            // cord bar

    // ── VESTMENT TORSO
    p(-7,-17, CO, 14, 19);
    p(-6,-16, B0, 12, 17); p(-5,-16, B1, 10, 16); p(-3,-15, B2, 6, 14);
    p(-6,-16, B4, 12,  1);                                                       // top highlight
    p(-2,-11, CO,  5,  5); p(-1,-10, C1, 3, 3); p(-1,-10, C3, 3, 1);
    glow(-1,-10, C4, 3, 1, 0.50 + ep * 0.30);

    // ── COLLAR
    p(-7,-20, CO, 14, 4); p(-6,-19, B2, 12, 2); p(-6,-19, B4, 12, 1);

    // ── SLEEVES, right hand out with fingers spread
    p(-12,-16, CO, 6, 15); p(-11,-15, B1, 4, 13); p(-11,-15, B3, 4, 1);
    p(-12,  0, CO, 6,  5); p(-11,  1, K1, 4,  3); p(-11, 1, K2, 4, 1);
    p(  6,-16, CO, 6, 11); p(  7,-15, B1, 4,  9); p(  7,-15, B3, 4, 1);
    p(  8,-23, CO, 6,  9); p(  9,-22, B1, 4,  7); p(  9,-22, B3, 4, 1);
    p(  8,-27, CO, 7,  5); p(  9,-26, K1, 5,  3); p(  9,-26, K2, 5, 1);
    p(  9,-24, K0, 5,  1);

    // ── CHAIN BOLTS jumping between the fingertips and outward
    const nodes = [[10,-30],[14,-33],[19,-30],[23,-34],[27,-30]];
    for (let i = 0; i < nodes.length - 1; i++) {
        const on = ((arc * nodes.length) | 0) >= i;
        if (!on) continue;
        const a = nodes[i], b = nodes[i + 1];
        for (let j = 0; j < 4; j++) {
            const t  = j / 3;
            const bx = Math.round(a[0] + (b[0] - a[0]) * t);
            const by = Math.round(a[1] + (b[1] - a[1]) * t) + (j % 2 ? 1 : -1);
            glow(bx, by, C4, 2, 1, 0.75 - i * 0.12);
        }
        glow(b[0] - 1, b[1] - 1, C3, 3, 3, 0.45 - i * 0.08);                     // node flare
    }
    glow(10,-30, C4, 2, 2, 0.60 + ep * 0.28);

    // ── NECK + HEAD
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-6,-35, CO, 12,  4); p(-5,-34, H1, 10, 2); p(-5,-34, H2, 10, 1);
    p(-4,-29, CO,  3,  2); p( 1,-29, CO, 3, 2);
    p(-3,-29, isAtk ? C4 : C3, 1, 1); p( 2,-29, isAtk ? C4 : C3, 1, 1);
    p(-1,-25, K0,  2,  1);
    p(-7,-37, CO, 14, 3); p(-6,-36, G2, 12, 2); p(-6,-36, G3, 12, 1);            // circlet

    if (isAtk) {
        glow(-1,-10, C4, 3, 3, 0.60);
        glow(10,-30, C4, 2, 2, 0.85);
    }
}

window.drawScriptureKnight = drawScriptureKnight;
window.drawSealWarrior     = drawSealWarrior;
window.drawTomeCannon      = drawTomeCannon;
window.drawHolyBurst       = drawHolyBurst;
window.drawRapidExorcist   = drawRapidExorcist;
window.drawChainExorcist   = drawChainExorcist;
