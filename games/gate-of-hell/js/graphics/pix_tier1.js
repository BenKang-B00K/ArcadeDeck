/* pix_tier1.js - Tier 1 Exorcists (Basic Units) */
/* Sprite standard: 45×63 art-pixels @ S=2.0 nearest-neighbor, 1-2px outline, 2px margin */
/* Isometric 3/4 front view; mirror handled by pUnit isLeft flag */

// ───────────────────────────────────────────────────
// APPRENTICE — 견습 퇴마사. Deep indigo robe over a gold cassock, leaning on a
// cross-headed stave.
// Lore: 짙은 인디고 로브에 황금 수단, 십자 문장이 새겨진 성구를 짚은 견습 퇴마사.
// The four starters all read as the same cream robe before this pass; each now
// carries its own colour and its own silhouette prop — stave, book, feathered
// mantle, dagger — so they are told apart at 44px in the codex.
// ───────────────────────────────────────────────────
function drawApprentice(cx, cy, tower) {
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
    const I0='#0A0E2E', I1='#1C2464', I2='#31419E', I3='#5468D4', I4='#93A4F0';  // indigo
    const G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';                // gold cassock
    const W1='#5A4A34', W2='#8A7454', W3='#B89E74';                              // stave wood
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';
    const H0='#3A2A14', H1='#6A4E20', H2='#A87C34';

    ctx.save(); ctx.globalAlpha = 0.11 + ep * 0.15;
    pUnitAura(ctx, cx, cy, -17, -32 + idleY, I3, 34, 58, isLeft, S);
    ctx.restore();

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, I1, 4, 3); p(-6, 23, I3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, I1, 4, 3); p( 2, 23, I3, 4, 1);

    // ── ROBE SKIRT
    p(-8,  4, CO, 16, 19);
    p(-7,  5, I0, 14, 17); p(-6,  5, I1, 12, 16); p(-4,  6, I2, 8, 14);
    p(-7,  5, I4, 14,  1);                                                       // top highlight
    p(-3,  7, I0,  1, 12); p( 2,  7, I0,  1, 12);                                // fold shadows
    p(-8, 19, CO, 16,  3); p(-7, 20, G2, 14, 2); p(-7, 20, G3, 14, 1);           // gold hem

    // ── GOLD CASSOCK PANEL down the front
    p(-3,  4, CO, 7, 16); p(-2,  5, G1, 5, 14); p(-2, 5, G3, 5, 1);
    p(-1,  7, G2, 3, 11);

    // ── CINCTURE
    p(-7,  1, CO, 14, 4); p(-6, 2, G1, 12, 2); p(-6, 2, G3, 12, 1);

    // ── ROBE TORSO
    p(-7,-17, CO, 14, 19);
    p(-6,-16, I0, 12, 17); p(-5,-16, I1, 10, 16); p(-3,-15, I2, 6, 14);
    p(-6,-16, I4, 12,  1);                                                       // top highlight
    p(-3,-15, G1,  6, 15); p(-2,-14, G2, 4, 13);                                 // cassock front
    p(-1,-12, G3,  2, 10);

    // ── COLLAR
    p(-7,-20, CO, 14, 4); p(-6,-19, I2, 12, 2); p(-6,-19, I4, 12, 1);

    // ── SLEEVES, right hand on the stave
    p(-12,-16, CO, 6, 15); p(-11,-15, I1, 4, 13); p(-11,-15, I3, 4, 1);
    p(-12,  0, CO, 6,  5); p(-11,  1, K1, 4,  3); p(-11, 1, K2, 4, 1);
    p(  6,-16, CO, 6, 13); p(  7,-15, I1, 4, 11); p(  7,-15, I3, 4, 1);
    p(  7, -4, CO, 6,  5); p(  8, -3, K1, 4,  3); p(  8, -3, K2, 4, 1);

    // ── CROSS-HEADED STAVE
    p(10,-30, CO, 4, 54); p(11,-29, W1, 2, 52); p(11,-29, W3, 2, 1);
    p(10,-14, G2, 4, 1); p(10, 6, G2, 4, 1);                                     // gold bindings
    p(11,-40, CO, 3, 11); p(12,-39, G2, 1, 9); p(12,-39, G3, 1, 3);              // cross upright
    p( 9,-37, CO, 7,  3); p(10,-36, G2, 5, 1); p(10,-36, G3, 5, 1);              // cross arm
    glow(12,-39, G4, 1, 4, 0.40 + ep * 0.28);
    glow(10,-36, G4, 5, 1, 0.40 + ep * 0.28);

    // ── NECK + HEAD
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-6,-35, CO, 12,  4); p(-5,-34, H1, 10, 2); p(-5,-34, H2, 10, 1);           // hair
    p(-7,-31, CO,  2,  5); p( 5,-31, CO, 2, 5);
    p(-7,-30, H0,  1,  4); p( 6,-30, H0, 1, 4);
    p(-4,-29, CO,  3,  2); p( 1,-29, CO, 3, 2);
    p(-3,-29, I4,  1,  1); p( 2,-29, I4, 1, 1);
    p(-1,-25, K0,  2,  1);

    // ── GOLD BROW CORD
    p(-6,-36, CO, 12, 2); p(-5,-35, G2, 10, 1);

    if (isAtk) {
        glow(11,-40, G4, 3, 11, 0.55);
        glow( 9,-37, G4, 7,  3, 0.55);
    }
}

// ───────────────────────────────────────────────────
// NOVICE EXORCIST — 수련생 퇴마사. Lavender student robe, brown bob, an open
// scripture held out in both hands throwing light.
// Lore: 라벤더빛 학생 로브에 갈색 단발머리, 양손에 펼친 성서로 빛을 발하는 초심 퇴마사.
// ───────────────────────────────────────────────────
function drawNoviceExorcist(cx, cy, tower) {
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
    const L0='#2A2440', L1='#544A80', L2='#8478BC', L3='#B4A8DC', L4='#E4DCF6';  // lavender
    const G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const P2='#C9B98E', P3='#EDE0BC', P4='#FFF8E0';                              // pages
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';
    const H0='#3A2412', H1='#6B4423', H2='#9E6A38';                              // brown bob

    ctx.save(); ctx.globalAlpha = 0.11 + ep * 0.15;
    pUnitAura(ctx, cx, cy, -17, -32 + idleY, L3, 34, 58, isLeft, S);
    ctx.restore();

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, L1, 4, 3); p(-6, 23, L3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, L1, 4, 3); p( 2, 23, L3, 4, 1);

    // ── STUDENT ROBE SKIRT (shorter than the others, pleated)
    p(-8,  6, CO, 16, 17);
    p(-7,  7, L0, 14, 15); p(-6,  7, L1, 12, 14); p(-4,  8, L2, 8, 12);
    p(-7,  7, L4, 14,  1);                                                       // top highlight
    p(-4,  9, L0,  1, 11); p( 0,  9, L0, 1, 11); p( 3,  9, L0, 1, 11);           // pleats
    p(-8, 19, CO, 16,  3); p(-7, 20, L3, 14, 2); p(-7, 20, L4, 14, 1);

    // ── SASH
    p(-7,  3, CO, 14, 4); p(-6, 4, G2, 12, 2); p(-6, 4, G3, 12, 1);

    // ── ROBE TORSO with a school collar
    p(-7,-16, CO, 14, 20);
    p(-6,-15, L0, 12, 18); p(-5,-15, L1, 10, 17); p(-3,-14, L2, 6, 15);
    p(-6,-15, L4, 12,  1);                                                       // top highlight
    p(-5,-15, L3,  4,  8); p( 1,-15, L3, 4, 8);                                  // collar flaps
    p(-5,-15, L4,  4,  1); p( 1,-15, L4, 4, 1);
    p(-1,-13, G3,  2,  2);                                                       // collar pin

    // ── SLEEVES, both forward to hold the book
    p(-12,-14, CO, 6, 13); p(-11,-13, L1, 4, 11); p(-11,-13, L3, 4, 1);
    p(-12, -2, CO, 6,  5); p(-11, -1, K1, 4,  3); p(-11, -1, K2, 4, 1);
    p(  6,-14, CO, 6, 13); p(  7,-13, L1, 4, 11); p(  7,-13, L3, 4, 1);
    p(  6, -2, CO, 6,  5); p(  7, -1, K1, 4,  3); p(  7, -1, K2, 4, 1);

    // ── OPEN SCRIPTURE, throwing light up into the face
    p(-10, -2, CO, 20, 11);
    p(-9,  -1, P2,  8,  9); p( 1, -1, P2, 8, 9);                                 // page backs
    p(-9,  -1, P3,  8,  9); p( 1, -1, P4, 8, 9);
    p(-9,  -1, P4,  8,  1); p( 1, -1, P4, 8, 1);                                 // page top light
    p(-1,  -2, CO,  3, 11); p(-1, -1, G2, 1, 9); p(-1, -1, G4, 1, 1);            // spine
    for (let i = 0; i < 3; i++) { p(-8, 1 + i * 2, G2, 6, 1); p(2, 1 + i * 2, G2, 5, 1); }
    p(-10,  8, CO, 20,  2); p(-9,  9, G3, 18, 1);                                // gilt edge
    glow(-9, -1, G4, 18, 1, 0.45 + ep * 0.30);
    // light rising off the open page
    for (let i = 0; i < 4; i++) {
        const t = ((now * 0.001) + i / 4) % 1;
        glow(-6 + i * 4, -4 - Math.round(t * 8), G4, 2, 1, (1 - t) * 0.6);
    }

    // ── NECK + HEAD (young, wide-eyed)
    p(-2,-21, CO, 4, 3); p(-1,-20, K0, 2, 2);
    p(-6,-33, CO, 12, 13);
    p(-5,-32, K1, 10, 11); p(-5,-32, K2, 10, 1);
    p( 3,-31, K0,  2,  9);
    p(-4,-28, CO,  3,  3); p( 1,-28, CO, 3, 3);                                  // big eyes
    p(-3,-28, K2,  1,  1); p( 2,-28, K2, 1, 1);
    p(-1,-24, K0,  2,  1);

    // ── BROWN BOB — straight fringe, blunt ends at the jaw
    p(-7,-35, CO, 14, 6); p(-6,-34, H1, 12, 4); p(-6,-34, H2, 12, 1);
    p(-6,-30, H0, 12, 1);                                                        // fringe line
    p(-8,-31, CO,  3, 9); p(-7,-30, H1, 1, 8);                                   // left fall
    p( 6,-31, CO,  3, 9); p( 7,-30, H1, 1, 8);                                   // right fall
    p(-7,-22, CO,  2, 2); p( 6,-22, CO, 2, 2);                                   // blunt ends

    if (isAtk) {
        glow(-9, -1, G4, 18, 9, 0.50);
    }
}


// ───────────────────────────────────────────────────
// ACOLYTE PRIEST — 수련 사제. White cassock under a mantle of dove feathers,
// blessing-light lifting from the raised hand.
// Lore: 흰 사제복에 비둘기 깃을 두르고 축복의 빛을 발하는 수련 사제.
// ───────────────────────────────────────────────────
function drawAcolytePriest(cx, cy, tower) {
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
    const W0='#4A4A56', W1='#8C8C9C', W2='#C8C8D8', W3='#EDEDF6', W4='#FFFFFF';  // white cassock
    const F1='#9EA6B8', F2='#CBD3E2', F3='#EEF3FA';                              // dove feathers
    const G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';
    const H1='#8A7448', H2='#C0A468';

    ctx.save(); ctx.globalAlpha = 0.12 + ep * 0.16;
    pUnitAura(ctx, cx, cy, -17, -32 + idleY, G3, 34, 58, isLeft, S);
    ctx.restore();

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, W1, 4, 3); p(-6, 23, W3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, W1, 4, 3); p( 2, 23, W3, 4, 1);

    // ── CASSOCK
    p(-8,  4, CO, 16, 19);
    p(-7,  5, W1, 14, 17); p(-6,  5, W2, 12, 16); p(-4,  6, W3, 8, 14);
    p(-7,  5, W4, 14,  1);                                                       // top highlight
    p(-3,  7, W0,  1, 12); p( 2,  7, W0,  1, 12);                                // fold shadows
    p(-8, 19, CO, 16,  3); p(-7, 20, G2, 14, 2); p(-7, 20, G3, 14, 1);

    // ── CINCTURE
    p(-7,  1, CO, 14, 4); p(-6, 2, G1, 12, 2); p(-6, 2, G3, 12, 1);

    // ── CASSOCK TORSO
    p(-7,-17, CO, 14, 19);
    p(-6,-16, W1, 12, 17); p(-5,-16, W2, 10, 16); p(-3,-15, W3, 6, 14);
    p(-6,-16, W4, 12,  1);                                                       // top highlight
    p(-1,-14, CO,  3,  9); p( 0,-13, G3, 1, 7);                                  // small cross
    p(-3,-11, CO,  7,  3); p(-2,-10, G3, 5, 1);
    glow( 0,-13, G4, 1, 7, 0.35 + ep * 0.26);

    // ── DOVE-FEATHER MANTLE — three courses of overlapping feathers over the
    //    shoulders. This is the starter's silhouette tell.
    for (let c = 0; c < 3; c++) {
        const wy = -21 + c * 3;
        const half = 10 - c * 2;
        for (let i = 0; i < half; i++) {
            const fx = -half + i * 2;
            p(fx, wy, CO, 3, 4);
            p(fx, wy, i % 2 ? F1 : F2, 2, 3);
            p(fx, wy, F3, 2, 1);                                                 // feather top light
        }
    }
    p(-6,-23, CO, 12, 3); p(-5,-22, F3, 10, 2); p(-5,-22, W4, 10, 1);            // collar band

    // ── SLEEVES, right hand raised in blessing
    p(-12,-15, CO, 6, 14); p(-11,-14, W2, 4, 12); p(-11,-14, W4, 4, 1);
    p(-12,  0, CO, 6,  5); p(-11,  1, K1, 4,  3); p(-11, 1, K2, 4, 1);
    p(  6,-16, CO, 6, 10); p(  7,-15, W2, 4,  8); p(  7,-15, W4, 4, 1);
    p(  8,-25, CO, 6, 11); p(  9,-24, W2, 4,  9); p(  9,-24, W4, 4, 1);
    p(  8,-29, CO, 6,  5); p(  9,-28, K1, 4,  3); p(  9,-28, K2, 4, 1);

    // ── BLESSING LIGHT off the raised hand
    for (let i = 0; i < 4; i++) {
        const t = ((now * 0.0011) + i / 4) % 1;
        glow(9 + ((i * 2) % 4), -31 - Math.round(t * 9), G4, 1, 2, (1 - t) * 0.75);
    }
    glow( 9,-28, G4, 4, 1, 0.35 + ep * 0.25);

    // ── NECK + HEAD
    p(-2,-25, CO, 4, 3); p(-1,-24, K0, 2, 2);
    p(-6,-37, CO, 12, 13);
    p(-5,-36, K1, 10, 11); p(-5,-36, K2, 10, 1);
    p( 3,-35, K0,  2,  9);
    p(-6,-38, CO, 12,  4); p(-5,-37, H1, 10, 2); p(-5,-37, H2, 10, 1);
    p(-4,-32, CO,  3,  2); p( 1,-32, CO, 3, 2);
    p(-3,-32, W4,  1,  1); p( 2,-32, W4, 1, 1);
    p(-1,-28, K0,  2,  1);

    // ── ZUCCHETTO + HALO
    p(-6,-40, CO, 12, 3); p(-5,-39, W3, 10, 2); p(-5,-39, W4, 10, 1);
    p(-8,-44, CO, 16, 1); p(-8,-41, CO, 16, 1);
    p(-9,-43, CO,  1, 2); p( 8,-43, CO, 1, 2);
    p(-8,-43, G3, 16, 1); p(-8,-42, G1, 16, 1);
    glow(-8,-43, G4, 16, 1, 0.42 + ep * 0.28);

    if (isAtk) {
        glow(-8,-43, G4, 16, 1, 0.65);
        glow( 8,-29, G4, 6,  5, 0.55);
    }
}

// ───────────────────────────────────────────────────
// ACOLYTE WARRIOR — 수련 전사. Light plate over a tunic, a consecrated dagger
// reversed in the hand, a holy talisman pinned at the shoulder.
// Lore: 가벼운 갑주에 축성된 단검을 든 민첩한 견습 전사, 어깨에 신성한 부적이 빛납니다.
// ───────────────────────────────────────────────────
function drawAcolyteWarrior(cx, cy, tower) {
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
    const T0='#2A3038', T1='#5E6A7A', T2='#98A6B8', T3='#CDD8E6', T4='#FFFFFF';  // light plate
    const B1='#3A4A6E', B2='#5E76A8', B3='#8EA4D0';                              // tunic blue
    const G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const C2='#22B8E0', C3='#7FE8FF', C4='#DDFAFF';                              // talisman light
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';
    const H0='#3A2A14', H1='#6A4E20', H2='#A87C34';

    ctx.save(); ctx.globalAlpha = 0.11 + ep * 0.15;
    pUnitAura(ctx, cx, cy, -17, -32 + idleY, C2, 34, 58, isLeft, S);
    ctx.restore();

    // ── BOOTS
    p(-8, 22, CO, 7, 5); p(-7, 23, T1, 5, 3); p(-7, 23, T3, 5, 1);
    p( 1, 22, CO, 7, 5); p( 2, 23, T1, 5, 3); p( 2, 23, T3, 5, 1);

    // ── TUNIC + LIGHT GREAVES (shorter skirt than the robed starters)
    p(-7,  6, CO, 14, 13); p(-6,  7, B1, 12, 11); p(-5,  7, B2, 10, 10);
    p(-6,  7, B3, 12,  1);                                                       // top highlight
    p(-8,  4, CO, 16,  4); p(-7,  5, T1, 14, 2); p(-7, 5, T3, 14, 1);            // faulds
    p(-7, 17, CO,  6,  6); p(-6, 18, T1, 4, 4); p(-6, 18, T3, 4, 1);             // greave L
    p( 1, 17, CO,  6,  6); p( 2, 18, T1, 4, 4); p( 2, 18, T3, 4, 1);             // greave R

    // ── BELT
    p(-7,  1, CO, 14, 4); p(-6, 2, G1, 12, 2); p(-6, 2, G3, 12, 1);

    // ── CUIRASS
    p(-7,-16, CO, 14, 18);
    p(-6,-15, T0, 12, 16); p(-5,-15, T1, 10, 15); p(-3,-14, T2, 6, 13);
    p(-6,-15, T4, 12,  1);                                                       // top highlight
    p( 4,-14, T0,  2, 13);                                                       // shaded flank
    p(-6,-10, T0, 12,  1); p(-6, -5, T0, 12, 1);                                 // plate seams

    // ── PAULDRONS + COLLAR
    p(-11,-19, CO, 6, 7); p(-10,-18, T1, 4, 5); p(-10,-18, T4, 4, 1);
    p(  5,-19, CO, 6, 7); p(  6,-18, T1, 4, 5); p(  6,-18, T4, 4, 1);
    p(-6,-20, CO, 12, 3); p(-5,-19, T3, 10, 2); p(-5,-19, T4, 10, 1);

    // ── HOLY TALISMAN on the left pauldron
    p(-12,-24, CO, 5, 7); p(-11,-23, '#EDE0BC', 3, 5); p(-11,-23, '#FFF8E0', 3, 1);
    p(-11,-22, C2,  3, 1); p(-11,-20, C2, 3, 1);                                 // inked wards
    glow(-11,-22, C4, 3, 1, 0.45 + ep * 0.30);
    glow(-11,-20, C4, 3, 1, 0.45 + ep * 0.30);
    p(-11,-26, G2,  3, 2);                                                        // gold pin

    // ── ARMS
    p(-11,-13, CO, 5, 13); p(-10,-12, T1, 3, 11); p(-10,-12, T3, 3, 1);
    p(-11,  0, CO, 5,  5); p(-10,  1, K1, 3,  3); p(-10, 1, K2, 3, 1);
    p(  6,-13, CO, 5, 10); p(  7,-12, T1, 3,  8); p(  7,-12, T3, 3, 1);
    p(  6, -4, CO, 5,  5); p(  7, -3, K1, 3,  3); p(  7, -3, K2, 3, 1);

    // ── CONSECRATED DAGGER, held reversed
    p( 8, -8, CO, 5, 5); p( 9, -7, G2, 3, 3); p( 9, -7, G4, 3, 1);               // pommel + guard
    p( 9, -3, CO, 3, 4); p(10, -2, '#5A4A34', 1, 2);                             // grip
    for (let i = 0; i < 6; i++) {                                                // blade, downward
        const bx = 9, by = 1 + i * 2;
        p(bx, by, CO, 4, 3);
        p(bx, by, i < 4 ? T2 : T3, 3, 2);
        p(bx, by, T4, 3, 1);                                                     // edge light
    }
    p( 9, 13, CO, 4, 3); p(10, 13, T3, 2, 2);                                    // point
    glow( 9,  1, C4, 3, 1, 0.30 + ep * 0.24);

    // ── NECK + HEAD
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-6,-35, CO, 12,  4); p(-5,-34, H1, 10, 2); p(-5,-34, H2, 10, 1);
    p(-7,-31, CO,  2,  4); p( 5,-31, CO, 2, 4);
    p(-7,-30, H0,  1,  3); p( 6,-30, H0, 1, 3);
    p(-4,-29, CO,  3,  2); p( 1,-29, CO, 3, 2);
    p(-3,-29, isAtk ? C4 : T4, 1, 1); p( 2,-29, isAtk ? C4 : T4, 1, 1);
    p(-1,-25, K0,  2,  1);

    // ── STEEL CIRCLET
    p(-7,-36, CO, 14, 3); p(-6,-35, T2, 12, 2); p(-6,-35, T4, 12, 1);
    p(-1,-38, CO,  3, 3); p( 0,-37, C3, 1, 1);
    glow( 0,-37, C4, 1, 1, 0.50 + ep * 0.28);

    if (isAtk) {
        glow( 9, 1, C4, 3, 12, 0.45);
        glow(-11,-22, C4, 3, 1, 0.75);
    }
}


window.drawApprentice = drawApprentice;
window.drawNoviceExorcist = drawNoviceExorcist;
window.drawAcolytePriest = drawAcolytePriest;
window.drawAcolyteWarrior = drawAcolyteWarrior;