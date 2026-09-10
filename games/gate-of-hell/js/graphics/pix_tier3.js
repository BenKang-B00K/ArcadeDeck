/* pix_tier3.js - Tier 3 Exorcists (Advanced Units) */

// ───────────────────────────────────────────────────
// MIDAS — 황금의 미다스. Gold mask, gilded plate over a purple underrobe, and
// gold dust falling from his fingertips.
// Lore: 황금 가면에 도금 갑주, 손끝에 황금 가루를 흩뿌리는 부의 화신.
// The old art showed a bare face and a sceptre reaching 66px above the head,
// which set the sprite's whole crop and left the figure tiny beside it.
// ───────────────────────────────────────────────────
function drawMidas(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const S = 2.0;
    const idleY  = Math.sin(now * 0.0025) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    // Glows go through `lighter`, which is what the bake records as emissive;
    // the finishing pass then blooms exactly these and nothing else.
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep   = (Math.sin(now * 0.005) + 1) / 2;
    const orbP = (Math.sin(now * 0.006) + 1) / 2;
    const ang  = now * 0.002;

    const CO='#000';
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8', G5='#FFFDE8';
    const P0='#1B0730', P1='#3A1160', P2='#5E2094', P3='#8B41C8', P4='#C088F0';
    const RUB='#C62828', RUH='#FF7A7A';

    // gold-dust aura
    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -20, -38 + idleY, G3, 40, 68, isLeft, S);
    ctx.restore();

    // ── FOUR ORBITING GOLD ORBS (kept close; they used to swing out to r=24)
    for (let i = 0; i < 4; i++) {
        const a  = ang + i * (Math.PI / 2);
        const ox2 = Math.round(Math.cos(a) * 15);
        const oy2 = Math.round(Math.sin(a) * 7) - 8;
        p(ox2-2, oy2-2, CO, 5, 5); p(ox2-1, oy2-1, G1, 3, 3);
        p(ox2-1, oy2-1, G3, 3, 1);                                               // top highlight
        p(ox2,   oy2,   G4, 1, 1);
        glow(ox2-1, oy2-1, G4, 3, 1, 0.40 + orbP * 0.30);
    }

    // ── SABATONS
    p(-7, 14, CO, 7, 9); p(-6, 15, P0, 5, 8); p(-6, 15, P2, 5, 1);
    p( 1, 14, CO, 6, 9); p( 2, 15, P0, 5, 8); p( 2, 15, P2, 5, 1);
    p(-7, 14, G2, 7, 1); p( 1, 14, G2, 6, 1);                                    // gilt cuffs

    // ── PURPLE UNDERROBE
    p(-8,  2, CO, 16, 14); p(-7,  3, P0, 14, 12); p(-6,  4, P1, 11, 10);
    p(-7,  3, P4, 14,  1);                                                       // top highlight
    p(-4,  5, P2,  7, 9);                                                        // lit panel
    p(-8, 13, CO, 16,  3); p(-7, 14, G1, 14, 2); p(-7, 14, G3, 14, 1);           // gilt hem

    // ── JEWELLED BELT
    p(-8,  0, CO, 16, 3); p(-7, 1, G1, 14, 2); p(-7, 1, G3, 14, 1);
    p(-2, -1, CO,  5, 5); p(-1, 0, RUB, 3, 3); p(-1, 0, RUH, 3, 1);
    glow(-1, 0, G5, 3, 1, 0.45 + ep * 0.30);

    // ── GILDED CUIRASS (gold plate over the purple)
    p(-7,-14, CO, 14, 16); p(-6,-13, G1, 12, 14); p(-5,-13, G2, 10, 13);
    p(-6,-13, G4, 12,  1);                                                       // top highlight
    p(-3,-12, G3,  6, 11);                                                       // lit centre plate
    p( 4,-12, G1,  2, 11);                                                       // shaded side
    p(-6, -8, G0, 12,  1); p(-6, -4, G0, 12, 1);                                 // plate seams
    // ruby pectoral
    p(-2, -7, CO, 5, 5); p(-1, -6, RUB, 3, 3); p(-1, -6, RUH, 3, 1);
    glow(-1, -6, G5, 3, 1, 0.55 + ep * 0.35);

    // ── PAULDRONS
    p(-13,-17, CO, 7, 8); p(-12,-16, G1, 5, 6); p(-12,-16, G4, 5, 1);
    p(-12,-15, G2,  5, 4);
    p(  6,-17, CO, 7, 8); p(  7,-16, G1, 5, 6); p(  7,-16, G4, 5, 1);
    p(  7,-15, G2,  5, 4);

    // ── LEFT ARM (short gilt sceptre, held low)
    p(-12,-11, CO, 6, 13); p(-11,-10, P1, 4, 11); p(-11,-10, P3, 4, 1);
    p(-12,  1, CO, 6,  5); p(-11,  2, G2, 4,  3); p(-11, 2, G4, 4, 1);
    p(-11,-16, CO, 3, 20); p(-10,-15, G1, 1, 18);                                // haft
    p(-12,-20, CO, 5,  5); p(-11,-19, G2, 3, 3); p(-11,-19, G4, 3, 1);           // head
    glow(-11,-19, G5, 3, 1, 0.40 + orbP * 0.30);

    // ── RIGHT ARM (raised, fingers spread)
    p( 6,-11, CO, 6, 12); p( 7,-10, P1, 4, 10); p( 7,-10, P3, 4, 1);
    p( 8,-20, CO, 6, 11); p( 9,-19, P1, 4,  9); p( 9,-19, P3, 4, 1);
    p( 8,-24, CO, 6,  6); p( 9,-23, G2, 4,  4); p( 9,-23, G4, 4, 1);             // gilded hand
    p( 9,-19, G1, 1,  2); p(11,-19, G1, 1, 2);                                   // finger gaps

    // ── GOLD DUST — motes shed from the fingertips, each on its own phase so
    //    the fall never reads as a repeating column.
    for (let i = 0; i < 7; i++) {
        const t  = ((now * 0.0009) + i / 7) % 1;
        const mx = 9 + ((i * 3) % 5) + Math.round(Math.sin(now * 0.004 + i) * 1);
        const my = -18 + t * 26;
        const a  = (1 - t) * 0.85;
        p(mx, my, i % 3 ? G3 : G4, 1, 1);
        glow(mx, my, G5, 1, 1, a * 0.7);
    }

    // ── NECK
    p(-3,-17, CO, 7, 3); p(-2,-16, P0, 5, 2);

    // ── GOLD MASK (smooth full face, slit eyes, serene mouth line)
    p(-7,-31, CO, 14, 15);
    p(-6,-30, G1, 12, 13); p(-5,-30, G2, 10, 12); p(-4,-29, G3, 7, 10);
    p(-6,-30, G4, 12,  1);                                                       // top highlight
    p( 4,-29, G1,  2, 10);                                                       // shaded cheek
    p(-1,-28, G4,  2, 12);                                                       // centre-line sheen
    p(-5,-26, CO,  4,  2); p( 2,-26, CO, 4, 2);                                  // eye slits
    p(-4,-26, G0,  2,  1); p( 3,-26, G0, 2, 1);
    glow(-5,-26, G5, 4, 1, 0.30 + ep * 0.25);
    glow( 2,-26, G5, 4, 1, 0.30 + ep * 0.25);
    p(-3,-20, G1,  7,  1);                                                       // mouth line
    p(-7,-27, G2,  1,  6); p( 6,-27, G2, 1, 6);                                  // mask edge

    // ── CIRCLET (modest band, ruby centre — the old tiara was a second crown)
    p(-8,-36, CO, 16, 5); p(-7,-35, G1, 14, 3); p(-7,-35, G3, 14, 1);
    p(-2,-39, CO,  5, 5); p(-1,-38, RUB, 3, 3); p(-1,-38, RUH, 3, 1);
    p(-7,-38, CO,  3, 4); p(-6,-37, G3, 1, 3);
    p( 4,-38, CO,  3, 4); p( 5,-37, G3, 1, 3);
    glow(-1,-38, G5, 3, 1, 0.45 + ep * 0.30);

    if (isAtk) {
        glow(-1,-38, G5, 3, 3, 0.65);
        glow(-1, -6, G5, 3, 3, 0.60);
        glow( 8,-24, G5, 6, 6, 0.55);                                            // casting hand
    }
}

// ───────────────────────────────────────────────────
// PHILOSOPHER — 공허의 현자. Star-flecked black robe, open void codex, round
// spectacles, white beard.
// Lore: 별무늬 검은 로브에 공허의 책을 펼친 안경 쓴 노년의 현자.
// The old art was a faceless hood with a rolled scroll under a crystal twice
// the height of the figure — no book, no glasses, no sage.
// ───────────────────────────────────────────────────
function drawPhilosopher(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const S = 2.0;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    // Glows go through `lighter`, which is what the bake records as emissive;
    // the finishing pass then blooms exactly these and nothing else.
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep    = (Math.sin(now * 0.005) + 1) / 2;
    const voidP = (Math.sin(now * 0.004) + 1) / 2;
    const spin  = now * 0.0016;

    const CO='#000';
    const N0='#050510', N1='#12122A', N2='#20204A', N3='#33336E', N4='#5A5A9E';  // starred robe
    const C1='#0A6E96', C2='#1FB8DC', C3='#7FE8FF', C4='#DDFAFF';                // void cyan
    const K0='#B08050', K1='#E4BC94', K2='#FFDCBC';                              // aged skin
    const W1='#9A9AA8', W2='#CFCFDC', W3='#F2F2FA';                              // white hair
    const P1='#8A7A54', P2='#C9B98E', P3='#EDE0BC', P4='#FFF8E0';                // pages
    const G2='#B88000', G3='#FFD700';

    // void aura
    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -20, -38 + idleY, C2, 40, 68, isLeft, S);
    ctx.restore();

    // ── FOUR VOIDSTONE SHARDS in a slow orbit
    for (let i = 0; i < 4; i++) {
        const a  = spin + i * (Math.PI / 2);
        const ox2 = Math.round(Math.cos(a) * 15);
        const oy2 = Math.round(Math.sin(a) * 7) - 22;
        p(ox2-1, oy2-2, CO, 3, 5); p(ox2, oy2-1, N3, 1, 3);
        glow(ox2, oy2-1, C3, 1, 3, 0.40 + voidP * 0.30);
    }

    // ── SHOES
    p(-7, 16, CO, 7, 7); p(-6, 17, N0, 5, 6); p(-6, 17, N2, 5, 1);
    p( 1, 16, CO, 6, 7); p( 2, 17, N0, 5, 6); p( 2, 17, N2, 5, 1);

    // ── LOWER ROBE
    p(-9,  2, CO, 18, 16); p(-8,  3, N0, 16, 14); p(-7,  4, N1, 13, 12);
    p(-8,  3, N4, 16,  1);                                                       // top highlight
    p(-4,  5, N2,  8, 11);                                                       // lit panel
    p(-9, 15, CO, 18,  3); p(-8, 16, N2, 16, 2); p(-8, 16, N3, 16, 1);

    // ── ROBE TORSO
    p(-8,-14, CO, 16, 17); p(-7,-13, N0, 14, 15); p(-6,-13, N1, 12, 14);
    p(-7,-13, N4, 14,  1);                                                       // top highlight
    p(-3,-12, N2,  6, 13);                                                       // lit centre

    // ── STAR FLECKS across the robe (fixed positions, twinkling in place)
    const stars = [[-6,-10],[-2,-6],[3,-11],[5,-3],[-7,-2],[1,1],[-5,6],[4,8],[-2,12],[6,4],[-8,9],[2,-14]];
    for (let i = 0; i < stars.length; i++) {
        const tw = 0.35 + 0.45 * Math.abs(Math.sin(now * 0.003 + i * 1.7));
        p(stars[i][0], stars[i][1], W2, 1, 1);
        glow(stars[i][0], stars[i][1], C4, 1, 1, tw);
    }

    // ── VOID SASH
    p(-8,  0, CO, 16, 3); p(-7, 1, N2, 14, 2); p(-7, 1, N4, 14, 1);
    p(-2, -1, CO,  5, 5); p(-1, 0, C1,  3, 3); p(-1, 0, C3, 3, 1);
    glow(-1, 0, C4, 3, 1, 0.55 + voidP * 0.35);

    // ── SHOULDER MANTLE
    p(-10,-17, CO, 20, 5); p(-9,-16, N1, 18, 3); p(-9,-16, N3, 18, 1);
    p(-10,-13, CO,  4, 6); p(-9,-12, N1, 2, 5);
    p(  7,-13, CO,  4, 6); p(  8,-12, N1, 2, 5);

    // ── ARMS (both forward, holding the codex open)
    p(-12,-10, CO, 6, 11); p(-11,-9, N1, 4, 9); p(-11,-9, N3, 4, 1);
    p(-13, -1, CO, 6,  5); p(-12,  0, K1, 4, 3); p(-12, 0, K2, 4, 1);
    p(  6,-10, CO, 6, 11); p(  7,-9, N1, 4, 9); p(  7,-9, N3, 4, 1);
    p(  7, -1, CO, 6,  5); p(  8,  0, K1, 4, 3); p(  8, 0, K2, 4, 1);

    // ── OPEN VOID CODEX (two pages tilted open on the spine, cyan script)
    p(-11,  1, CO, 22, 12);
    p(-10,  2, P1, 10, 10); p( 1,  2, P1, 9, 10);                                // page backs
    p(-10,  2, P2,  9, 10); p( 1,  2, P3, 8, 10);                                // left/right faces
    p(-10,  2, P4,  9,  1); p( 1,  2, P4, 8,  1);                                // page top highlight
    p( -1,  1, CO,  3, 12); p( -1,  2, N2, 1, 10); p(-1, 2, G3, 1, 1);           // spine
    for (let i = 0; i < 3; i++) {
        p(-9, 4 + i * 3, C1, 6, 1); p(2, 4 + i * 3, C1, 5, 1);                   // lines of script
        glow(-9, 4 + i * 3, C3, 6, 1, 0.35 + voidP * 0.25);
        glow( 2, 4 + i * 3, C3, 5, 1, 0.35 + voidP * 0.25);
    }
    p(-11, 12, CO, 22, 2); p(-10, 13, G2, 20, 1);                                // gilt edge

    // ── VOID SIGIL rising off the open page
    const sg = -2 - Math.round(voidP * 2);
    p(-2, sg, CO, 5, 5); p(-1, sg + 1, C1, 3, 3); p(-1, sg + 1, C3, 3, 1);
    glow(-2, sg, C4, 5, 1, 0.45 + voidP * 0.35);
    glow(-1, sg + 1, C4, 3, 3, 0.25 + voidP * 0.25);

    // ── NECK
    p(-3,-17, CO, 7, 3); p(-2,-16, K0, 5, 2);

    // ── HEAD (old, lined)
    p(-7,-31, CO, 14, 15);
    p(-6,-30, K1, 12, 13); p(-6,-30, K2, 12, 1);                                 // top highlight
    p( 4,-29, K0,  2, 10);                                                       // shaded cheek
    p(-5,-22, K0, 10,  1);                                                       // brow-to-cheek line

    // ── SPECTACLES (two round rims on a bridge — the lore's one giveaway)
    p(-6,-27, CO, 5, 5); p(-5,-26, N0, 3, 3);
    p( 1,-27, CO, 5, 5); p( 2,-26, N0, 3, 3);
    p(-1,-26, G2, 2, 1);                                                         // bridge
    p(-7,-26, G2, 1, 1); p( 6,-26, G2, 1, 1);                                    // temple arms
    p(-5,-26, isAtk ? C3 : C1, 3, 1);                                            // lens catchlight
    p( 2,-26, isAtk ? C3 : C1, 3, 1);
    glow(-5,-26, C4, 3, 1, 0.40 + voidP * 0.30);
    glow( 2,-26, C4, 3, 1, 0.40 + voidP * 0.30);

    // ── WHITE BEARD + BROWS
    p(-6,-23, CO, 12, 2); p(-5,-23, W2, 10, 1);                                  // brows
    p(-6,-20, CO, 12, 9); p(-5,-19, W1, 10, 8); p(-5,-19, W3, 10, 1);
    p(-3,-18, W2,  6, 6);
    p(-2,-11, CO,  5, 4); p(-1,-10, W1, 3, 3);                                   // beard point
    p(-2,-20, K0,  5, 2);                                                        // mouth in the beard

    // ── SKULLCAP + WHITE HAIR
    p(-7,-34, CO, 14, 4); p(-6,-33, N1, 12, 2); p(-6,-33, N3, 12, 1);
    p(-8,-31, CO,  3, 7); p(-7,-30, W1, 1, 6);                                   // side hair
    p( 6,-31, CO,  3, 7); p( 7,-30, W1, 1, 6);
    p(-2,-36, CO,  5, 3); p(-1,-35, C1, 3, 1);                                   // cap void stone
    glow(-1,-35, C4, 3, 1, 0.50 + voidP * 0.35);

    if (isAtk) {
        glow(-2, sg, C4, 5, 5, 0.65);
        glow(-5,-26, C4, 3, 1, 0.75); glow(2,-26, C4, 3, 1, 0.75);
        for (let i = 0; i < 3; i++) {
            glow(-9, 4 + i * 3, C4, 6, 1, 0.55); glow(2, 4 + i * 3, C4, 5, 1, 0.55);
        }
    }
}

// ────────────────────────────────────────────────────
// ILLUSIONIST — 환영술사. Iridescent veil, blank mask, and two afterimages
// sliding out of true either side of the body.
// Lore: 무지개빛 베일에 가면을 쓴 환영술사, 주위에 잔상이 흐릿하게 어른거림.
// ────────────────────────────────────────────────────
function drawIllusion(cx, cy, tower) {
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
    const ep   = (Math.sin(now * 0.004) + 1) / 2;
    const slip = Math.sin(now * 0.0026) * 4;                                     // afterimage drift
    const IRI = ['#FF7ACF', '#7FE8FF', '#FFE79A', '#B98CFF', '#8CFFC0'];
    const iri = (k) => IRI[(Math.floor(now * 0.004) + k) % IRI.length];

    const CO='#000';
    const V0='#1A0F30', V1='#3A2560', V2='#5F3F98', V3='#8A63CC', V4='#C0A0F0';  // veil violet
    const M0='#5E5468', M1='#9A90AC', M2='#CFC6DC', M3='#F4EEFA';                // mask porcelain
    const K1='#F0C090';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -20, -36 + idleY, V3, 40, 66, isLeft, S);
    ctx.restore();

    // ── TWO AFTERIMAGES — the same silhouette offset either way, kept faint.
    //    The old art filled a flat violet rectangle behind the figure instead,
    //    which read as a coloured card, not as a body slipping out of true.
    for (let k = 0; k < 2; k++) {
        const dx = Math.round((k ? slip : -slip));
        ctx.save(); ctx.globalAlpha = 0.20 + ep * 0.12;
        pUnit(ctx, cx, cy, dx - 6, -32 + idleY, k ? iri(0) : iri(2), 12, 12, isLeft, S);
        pUnit(ctx, cx, cy, dx - 7, -18 + idleY, k ? iri(0) : iri(2), 14, 21, isLeft, S);
        pUnit(ctx, cx, cy, dx - 8,   3 + idleY, k ? iri(0) : iri(2), 16, 17, isLeft, S);
        ctx.restore();
    }

    // ── SHOES
    p(-7, 20, CO, 6, 5); p(-6, 21, V0, 4, 3); p(-6, 21, V2, 4, 1);
    p( 1, 20, CO, 6, 5); p( 2, 21, V0, 4, 3); p( 2, 21, V2, 4, 1);

    // ── LOWER VEIL (layered, hem drifting)
    p(-8,  3, CO, 16, 18);
    p(-7,  4, V0, 14, 16); p(-6,  5, V1, 12, 15); p(-4,  6, V2, 8, 13);
    p(-7,  4, V4, 14,  1);                                                       // top highlight
    for (let i = 0; i < 8; i++) {
        const hx = -7 + i * 2;
        const hl = 2 + ((i * 3) % 4) + Math.round(Math.sin(now * 0.003 + i) * 1);
        p(hx, 19, V1, 2, hl);
        if (i % 2 === 0) glow(hx, 19 + hl - 1, iri(i), 2, 1, 0.30 + ep * 0.20);
    }

    // ── SASH
    p(-7,  1, CO, 14, 3); p(-6, 2, V2, 12, 2); p(-6, 2, V4, 12, 1);

    // ── TORSO VEIL
    p(-7,-16, CO, 14, 18);
    p(-6,-15, V0, 12, 16); p(-5,-15, V1, 10, 15); p(-3,-14, V2, 6, 13);
    p(-6,-15, V4, 12,  1);                                                       // top highlight
    // spectrum thread down the front
    for (let i = 0; i < 4; i++) glow(0, -13 + i * 4, iri(i), 1, 2, 0.45 + ep * 0.25);

    // ── SHOULDER VEIL
    p(-10,-19, CO, 20, 5); p(-9,-18, V1, 18, 3); p(-9,-18, V3, 18, 1);

    // ── SLEEVES
    p(-12,-15, CO, 6, 15); p(-11,-14, V1, 4, 13); p(-11,-14, V3, 4, 1);
    p(-12,  0, CO, 6,  5); p(-11,  1, K1, 4,  3);
    p(  6,-15, CO, 6, 15); p(  7,-14, V1, 4, 13); p(  7,-14, V3, 4, 1);
    p(  6,  0, CO, 6,  5); p(  7,  1, K1, 4,  3);

    // ── NECK
    p(-2,-21, CO, 4, 3); p(-1,-20, V0, 2, 2);

    // ── BLANK MASK (porcelain, two slits, no features — that is the character)
    p(-7,-33, CO, 14, 14);
    p(-6,-32, M0, 12, 12); p(-5,-32, M1, 10, 11); p(-4,-31, M2, 7, 9);
    p(-6,-32, M3, 12,  1);                                                       // top highlight
    p( 4,-31, M0,  2,  9);                                                       // shaded cheek
    p(-5,-28, CO,  4,  2); p( 2,-28, CO, 4, 2);                                  // eye slits
    p(-4,-28, iri(1), 2, 1); p( 3,-28, iri(3), 2, 1);
    glow(-4,-28, iri(1), 2, 1, 0.60 + ep * 0.30);
    glow( 3,-28, iri(3), 2, 1, 0.60 + ep * 0.30);
    p(-2,-23, M0,  5,  1);                                                       // seam where a mouth would be

    // ── VEIL HOOD over the mask
    p(-8,-38, CO, 16, 6); p(-7,-37, V1, 14, 4); p(-7,-37, V3, 14, 1);
    p(-9,-34, CO,  3, 8); p(-8,-33, V0, 1, 7);
    p( 7,-34, CO,  3, 8); p( 8,-33, V0, 1, 7);
    p(-2,-41, CO,  5, 4); p(-1,-40, iri(2), 3, 1);                               // crest stone
    glow(-1,-40, iri(2), 3, 1, 0.55 + ep * 0.30);

    if (isAtk) {
        glow(-4,-28, iri(1), 2, 1, 0.85); glow(3,-28, iri(3), 2, 1, 0.85);
        for (let i = 0; i < 4; i++) glow(0, -13 + i * 4, iri(i), 1, 2, 0.70);
    }
}

// ────────────────────────────────────────────────────
// MASTER OF REFLECTION — 반사의 거장. Crystal plate, a faceted crystal stave,
// and light breaking off it into a spread of colour.
// Lore: 수정 갑주에 다면 수정 지팡이, 빛이 산란되어 무지개로 흘어지는 거장.
// ────────────────────────────────────────────────────
function drawReflection(cx, cy, tower) {
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
    const IRI = ['#FF7ACF', '#7FE8FF', '#FFE79A', '#B98CFF', '#8CFFC0'];
    const iri = (k) => IRI[(Math.floor(now * 0.004) + k) % IRI.length];

    const CO='#000';
    const Q0='#243444', Q1='#4E7288', Q2='#88B4C8', Q3='#C6E4F0', Q4='#FFFFFF';  // crystal plate
    const G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -20, -38 + idleY, Q3, 40, 68, isLeft, S);
    ctx.restore();

    // ── SABATONS
    p(-8, 22, CO, 7, 5); p(-7, 23, Q1, 5, 3); p(-7, 23, Q3, 5, 1);
    p( 1, 22, CO, 7, 5); p( 2, 23, Q1, 5, 3); p( 2, 23, Q3, 5, 1);

    // ── GREAVES (faceted: each plate gets its own lit corner)
    p(-8,  4, CO, 16, 19);
    p(-7,  5, Q0, 14, 17); p(-6,  5, Q1, 12, 16); p(-4,  6, Q2, 8, 14);
    p(-7,  5, Q4, 14,  1);                                                       // top highlight
    p(-6,  8, Q3,  3,  1); p( 2, 12, Q3, 3, 1); p(-5, 16, Q3, 3, 1);             // facet catches
    p(-1,  6, Q0,  2, 13);                                                       // leg split
    p(-8, 19, CO, 16,  3); p(-7, 20, G2, 14, 2); p(-7, 20, G3, 14, 1);

    // ── BELT
    p(-7,  1, CO, 14, 4); p(-6, 2, G2, 12, 2); p(-6, 2, G3, 12, 1);
    p(-2,  0, CO,  5, 5); p(-1, 1, Q2,  3, 3); p(-1, 1, Q4, 3, 1);
    glow(-1, 1, iri(0), 3, 1, 0.50 + ep * 0.30);

    // ── CRYSTAL CUIRASS
    p(-7,-16, CO, 14, 18);
    p(-6,-15, Q0, 12, 16); p(-5,-15, Q1, 10, 15); p(-3,-14, Q2, 6, 13);
    p(-6,-15, Q4, 12,  1);                                                       // top highlight
    p(-5,-12, Q3,  3,  1); p( 2, -8, Q3, 3, 1); p(-4, -4, Q3, 3, 1);             // facet catches
    p( 4,-14, Q0,  2, 13);                                                       // shaded flank
    // prism core
    p(-2, -9, CO, 5, 6); p(-1, -8, Q3, 3, 4);
    glow(-1, -8, iri(1), 3, 1, 0.55 + ep * 0.30);
    glow(-1, -6, iri(3), 3, 1, 0.45 + ep * 0.25);

    // ── PAULDRONS (crystal shards)
    p(-12,-19, CO, 6, 8); p(-11,-18, Q1, 4, 6); p(-11,-18, Q4, 4, 1);
    p(-12,-23, CO, 4, 5); p(-11,-22, Q2, 2, 4); p(-11,-23, Q4, 2, 1);
    p(  6,-19, CO, 6, 8); p(  7,-18, Q1, 4, 6); p(  7,-18, Q4, 4, 1);
    p(  8,-23, CO, 4, 5); p(  9,-22, Q2, 2, 4); p(  9,-23, Q4, 2, 1);

    // ── COLLAR
    p(-6,-19, CO, 12, 3); p(-5,-18, Q3, 10, 2); p(-5,-18, Q4, 10, 1);

    // ── ARMS
    p(-11,-13, CO, 5, 14); p(-10,-12, Q1, 3, 12); p(-10,-12, Q3, 3, 1);
    p(-11,  0, CO, 5,  5); p(-10,  1, K1, 3,  3); p(-10, 1, K2, 3, 1);
    p(  6,-13, CO, 5, 10); p(  7,-12, Q1, 3,  8); p(  7,-12, Q3, 3, 1);
    p(  7,-19, CO, 5,  8); p(  8,-18, Q1, 3,  6); p(  8,-18, Q3, 3, 1);
    p(  7,-22, CO, 5,  5); p(  8,-21, K1, 3,  3); p(  8,-21, K2, 3, 1);          // gripping hand

    // ── FACETED CRYSTAL STAVE
    p( 9,-24, CO, 4, 44); p(10,-23, Q1, 2, 42); p(10,-23, Q3, 2, 1);
    p( 9,-12, G3, 4, 1); p( 9, 2, G3, 4, 1);                                     // gold collars
    // crystal head: three stacked facets, each lit on its upper-left
    p( 7,-38, CO, 8, 6); p( 8,-37, Q1, 6, 4); p( 8,-37, Q4, 6, 1);
    p( 8,-33, CO, 6, 5); p( 9,-32, Q2, 4, 3); p( 9,-32, Q4, 4, 1);
    p( 9,-42, CO, 4, 5); p(10,-41, Q2, 2, 3); p(10,-41, Q4, 2, 1);
    glow( 8,-37, iri(0), 6, 1, 0.45 + ep * 0.30);
    glow( 9,-32, iri(2), 4, 1, 0.40 + ep * 0.25);
    glow(10,-41, iri(4), 2, 1, 0.45 + ep * 0.25);

    // ── SCATTERED SPECTRUM — light breaking off the crystal head into a fan
    for (let i = 0; i < 5; i++) {
        const t  = ((now * 0.0012) + i / 5) % 1;
        const rx = 11 + Math.round(t * 8);
        const ry = -36 + Math.round((i - 2) * 3 + t * 6);
        glow(rx, ry, iri(i), 2, 1, (1 - t) * 0.75);
    }

    // ── NECK
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);

    // ── HEAD
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-4,-29, CO, 3, 2); p( 1,-29, CO, 3, 2);
    p(-3,-29, isAtk ? iri(1) : Q4, 1, 1); p( 2,-29, isAtk ? iri(1) : Q4, 1, 1);
    p(-1,-25, K0, 2, 1);

    // ── CRYSTAL DIADEM (three shards, tallest centre)
    p(-7,-37, CO, 14, 4); p(-6,-36, Q1, 12, 2); p(-6,-36, Q3, 12, 1);
    p(-5,-40, CO, 3, 4); p(-4,-39, Q2, 1, 3);
    p(-1,-43, CO, 3, 7); p( 0,-42, Q3, 1, 6); p( 0,-42, Q4, 1, 2);
    p( 3,-40, CO, 3, 4); p( 4,-39, Q2, 1, 3);
    glow( 0,-42, iri(3), 1, 2, 0.55 + ep * 0.30);

    if (isAtk) {
        glow( 8,-37, iri(0), 6, 6, 0.60);
        glow(-1, -8, iri(1), 3, 4, 0.55);
    }
}

// ───────────────────────────────────────────────────
// GRAND SEALER — 대봉인사. White robe worked with gold, sealing talismans
// standing in the air around him.
// Lore: 황금 자수가 박힌 백색 의복, 봉인 부적이 공중에 떠도는 대봉인사.
// ───────────────────────────────────────────────────
function drawGrandSealer(cx, cy, tower) {
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
    const spin = now * 0.0011;

    const CO='#000';
    const W0='#4A4A56', W1='#8C8C9C', W2='#C8C8D8', W3='#EDEDF6', W4='#FFFFFF';  // white robe
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8', G5='#FFFDE8';
    const P2='#C9B98E', P3='#EDE0BC', P4='#FFF8E0';                              // seal paper
    const R2='#A81824', R3='#E0343C';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';
    const H1='#9A9AA8', H2='#CFCFDC';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -20, -36 + idleY, G3, 40, 64, isLeft, S);
    ctx.restore();

    // ── FIVE SEALING TALISMANS standing in the air on a slow ring
    for (let i = 0; i < 5; i++) {
        const a  = spin + i * (Math.PI * 2 / 5);
        const sx = Math.round(Math.cos(a) * 17);
        const sy = -14 + Math.round(Math.sin(a) * 9);
        const front = Math.sin(a) > 0;
        p(sx - 1, sy - 5, CO, 4, 11);
        p(sx,     sy - 4, front ? P3 : P2, 2, 9);
        p(sx,     sy - 4, P4, 2, 1);                                             // paper top light
        p(sx,     sy - 2, R2, 2, 1); p(sx, sy + 1, R2, 2, 1);                    // ink marks
        glow(sx, sy - 4, G5, 2, 1, (front ? 0.42 : 0.22) + ep * 0.22);
    }

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, W1, 4, 3); p(-6, 23, W3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, W1, 4, 3); p( 2, 23, W3, 4, 1);

    // ── ROBE SKIRT with gold embroidery
    p(-8,  4, CO, 16, 19);
    p(-7,  5, W1, 14, 17); p(-6,  5, W2, 12, 16); p(-4,  6, W3, 8, 14);
    p(-7,  5, W4, 14,  1);                                                       // top highlight
    p(-3,  7, W0,  1, 12); p( 2,  7, W0,  1, 12);
    for (let i = 0; i < 4; i++) { p(-6 + i * 4, 9, G2, 3, 1); p(-5 + i * 4, 13, G2, 2, 1); }
    p(-8, 19, CO, 16,  3); p(-7, 20, G2, 14, 2); p(-7, 20, G3, 14, 1);

    // ── SASH
    p(-7,  1, CO, 14, 4); p(-6, 2, G1, 12, 2); p(-6, 2, G3, 12, 1);

    // ── ROBE TORSO
    p(-7,-17, CO, 14, 19);
    p(-6,-16, W1, 12, 17); p(-5,-16, W2, 10, 16); p(-3,-15, W3, 6, 14);
    p(-6,-16, W4, 12,  1);                                                       // top highlight
    p(-6,-16, G2,  1, 17); p( 5,-16, G2, 1, 17);                                 // gold placket
    for (let i = 0; i < 3; i++) p(-4, -13 + i * 5, G2, 9, 1);                    // embroidery rows
    p(-2,-10, CO,  5,  5); p(-1, -9, G2, 3, 3); p(-1, -9, G4, 3, 1);
    glow(-1, -9, G5, 3, 1, 0.50 + ep * 0.30);

    // ── COLLAR
    p(-8,-21, CO, 16, 5); p(-7,-20, W3, 14, 3); p(-7,-20, W4, 14, 1);
    p(-7,-18, G2, 14, 1);

    // ── SLEEVES, both hands up in a sealing sign
    p(-13,-16, CO, 7, 13); p(-12,-15, W2, 5, 11); p(-12,-15, W4, 5, 1);
    p(-13, -5, CO, 6,  5); p(-12, -4, K1, 4,  3); p(-12, -4, K2, 4, 1);
    p(  6,-16, CO, 7, 13); p(  7,-15, W2, 5, 11); p(  7,-15, W4, 5, 1);
    p(  7, -5, CO, 6,  5); p(  8, -4, K1, 4,  3); p(  8, -4, K2, 4, 1);
    p(-2, -6, CO,  5,  4); p(-1, -5, K1, 3, 2);                                  // hands joined

    // ── NECK + HEAD
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-4,-29, CO, 3, 1); p( 1,-29, CO, 3, 1);                                    // eyes closed
    p(-1,-25, K0, 2, 1);
    p(-6,-35, CO, 12, 4); p(-5,-34, H1, 10, 2); p(-5,-34, H2, 10, 1);            // white hair
    p(-7,-31, CO,  2, 5); p( 5,-31, CO, 2, 5);

    // ── SEALING CROWN — a gold band carrying an upright talisman
    p(-7,-38, CO, 14, 4); p(-6,-37, G1, 12, 2); p(-6,-37, G4, 12, 1);
    p(-2,-45, CO,  5, 8); p(-1,-44, P3, 3, 6); p(-1,-44, P4, 3, 1);
    p(-1,-42, R2,  3, 1); p(-1,-39, R2, 3, 1);
    glow(-1,-44, G5, 3, 1, 0.45 + ep * 0.28);

    if (isAtk) {
        for (let i = 0; i < 5; i++) {
            const a = spin + i * (Math.PI * 2 / 5);
            glow(Math.round(Math.cos(a) * 17), -18 + Math.round(Math.sin(a) * 9), G5, 2, 9, 0.55);
        }
        glow(-1, -9, G5, 3, 3, 0.60);
    }
}

// ───────────────────────────────────────────────────
// FLAME TALISMAN MASTER — 화염 부적 마스터. Red-black robe, a bundle of burning
// talismans in the fist, embers left behind at every step.
// Lore: 적흑 도복에 불타는 부적 다발, 발걸음마다 잔불이 번지는 마스터.
// ───────────────────────────────────────────────────
function drawFlameMaster(cx, cy, tower) {
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
    const flick = Math.round(Math.sin(now * 0.012) * 1);
    const step  = (now % 1500) / 1500;

    const CO='#000';
    const D0='#180608', D1='#3A0E12', D2='#6A1A1E', D3='#9E2C2E', D4='#D45A50';  // red-black robe
    const P2='#C9B98E', P3='#EDE0BC', P4='#FFF8E0';
    const F0='#7A1800', F1='#C43800', F2='#FF6A00', F3='#FFB020', F4='#FFE890';
    const G2='#B88000', G3='#FFD700';
    const K0='#B87848', K1='#E8A870', K2='#FFC898';
    const H0='#1A1010', H1='#3A2018', H2='#66382A';

    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -19, -34 + idleY, F2, 38, 62, isLeft, S);
    ctx.restore();

    // ── EMBERS SPREADING FROM THE FOOTFALL
    for (let i = 0; i < 6; i++) {
        const t  = (step + i / 6) % 1;
        const bx = -12 + i * 4 + Math.round(t * 3) * (i % 2 ? 1 : -1);
        p(bx, 25, F0, 2, 1);
        glow(bx, 25, F2, 2, 1, (1 - t) * 0.65);
        if (i % 2 === 0) glow(bx, 24 - Math.round(t * 3), F4, 1, 1, (1 - t) * 0.5);
    }

    // ── SANDALS
    p(-7, 22, CO, 6, 5); p(-6, 23, D1, 4, 3); p(-6, 23, D3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, D1, 4, 3); p( 2, 23, D3, 4, 1);

    // ── ROBE SKIRT
    p(-8,  4, CO, 16, 19);
    p(-7,  5, D0, 14, 17); p(-6,  5, D1, 12, 16); p(-4,  6, D2, 8, 14);
    p(-7,  5, D4, 14,  1);                                                       // top highlight
    p(-3,  7, D0,  1, 12); p( 2,  7, D0,  1, 12);
    for (let i = 0; i < 8; i++) {                                                // scorched hem
        const hx = -7 + i * 2, hl = 2 + ((i * 3) % 3) + (i % 2 ? flick : -flick);
        p(hx, 20, CO, 2, hl + 1); p(hx, 20, i % 2 ? F0 : D1, 2, hl);
        if (i % 2 === 0) glow(hx, 20 + hl - 1, F2, 2, 1, 0.35 + ep * 0.22);
    }

    // ── SASH
    p(-7,  1, CO, 14, 4); p(-6, 2, F0, 12, 2); p(-6, 2, F2, 12, 1);
    glow(-6, 2, F3, 12, 1, 0.28 + ep * 0.22);

    // ── ROBE TORSO
    p(-7,-17, CO, 14, 19);
    p(-6,-16, D0, 12, 17); p(-5,-16, D1, 10, 16); p(-3,-15, D2, 6, 14);
    p(-6,-16, D4, 12,  1);                                                       // top highlight
    p(-5,-16, D3,  4,  9); p( 1,-16, D3, 4, 9);                                  // crossed lapels
    p(-2,-10, CO,  5,  5); p(-1, -9, F1, 3, 3); p(-1, -9, F3, 3, 1);
    glow(-1, -9, F4, 3, 1, 0.55 + ep * 0.32);

    // ── COLLAR
    p(-7,-20, CO, 14, 4); p(-6,-19, D2, 12, 2); p(-6,-19, D4, 12, 1);

    // ── SLEEVES, right fist up with the burning bundle
    p(-12,-16, CO, 6, 15); p(-11,-15, D1, 4, 13); p(-11,-15, D3, 4, 1);
    p(-12,  0, CO, 6,  5); p(-11,  1, K1, 4,  3); p(-11, 1, K2, 4, 1);
    p(  6,-16, CO, 6, 10); p(  7,-15, D1, 4,  8); p(  7,-15, D3, 4, 1);
    p(  8,-25, CO, 6, 11); p(  9,-24, D1, 4,  9); p(  9,-24, D3, 4, 1);
    p(  8,-29, CO, 6,  5); p(  9,-28, K1, 4,  3); p(  9,-28, K2, 4, 1);

    // ── BURNING TALISMAN BUNDLE — a fan of slips, the top edges alight
    for (let i = 0; i < 4; i++) {
        const sx = 8 + i * 2;
        const sy = -42 + i * 2;
        p(sx, sy, CO, 4, 14);
        p(sx + 1, sy + 1, P2, 2, 12); p(sx + 1, sy + 1, P4, 2, 1);
        p(sx + 1, sy + 4, F0, 2, 1);                                             // ink gone to char
        const fh = 3 + ((i * 3) % 3) + (i % 2 ? flick : -flick);
        p(sx + 1, sy - fh, CO, 2, fh); p(sx + 1, sy - fh + 1, F1, 2, fh - 1);
        p(sx + 1, sy - fh + 1, F3, 2, 1);
        glow(sx + 1, sy - fh + 1, F4, 2, 2, 0.55 + ep * 0.28);
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
    p(-2,-25, K0,  4,  1);

    // ── SCORCHED HEADBAND
    p(-7,-37, CO, 14, 3); p(-6,-36, F0, 12, 2); p(-6,-36, F1, 12, 1);
    p(-2,-40, CO,  5, 4); p(-1,-39, F1, 3, 2); p(-1,-39, F3, 3, 1);
    glow(-1,-39, F4, 3, 1, 0.50 + ep * 0.28);

    if (isAtk) {
        glow( 8,-46, F4, 12, 16, 0.60);
        glow(-1, -9, F4,  3,  3, 0.60);
    }
}

// ───────────────────────────────────────────────────
// VAJRAPANI — 금강역사. Bare muscled torso, a golden trident, the vajra seal
// alight on the forehead.
// Lore: 근육질 상체에 황금 삼지창, 이마에 금강 인장이 빛나는 역사.
// ───────────────────────────────────────────────────
function drawVajrapani(cx, cy, tower) {
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
    const K0='#8A5628', K1='#B87848', K2='#E8A870', K3='#FFC898';                // bronzed skin
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8';
    const R1='#6A0C14', R2='#A81824', R3='#E0343C';                              // crimson wrap
    const W1='#5A4A34', W2='#8A7454';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -19, -36 + idleY, G3, 38, 64, isLeft, S);
    ctx.restore();

    // ── BARE FEET
    p(-9, 22, CO, 7, 5); p(-8, 23, K0, 5, 3); p(-8, 23, K2, 5, 1);
    p( 2, 22, CO, 7, 5); p( 3, 23, K0, 5, 3); p( 3, 23, K2, 5, 1);

    // ── CRIMSON WRAP (short, knee length)
    p(-9,  6, CO, 18, 15);
    p(-8,  7, R1, 16, 13); p(-7,  7, R2, 14, 12); p(-4,  8, R3, 8, 10);
    p(-8,  7, R3, 16,  1);                                                       // top highlight
    p(-9, 18, CO, 18,  3); p(-8, 19, G2, 16, 2); p(-8, 19, G3, 16, 1);

    // ── GOLD SASH
    p(-9,  3, CO, 18, 4); p(-8, 4, G1, 16, 2); p(-8, 4, G3, 16, 1);

    // ── MUSCLED TORSO (bare, defined in the ramp rather than outlined boxes)
    p(-8,-18, CO, 17, 22);
    p(-7,-17, K0, 15, 20); p(-6,-17, K1, 13, 19); p(-4,-16, K2, 9, 9);
    p(-7,-17, K3, 15,  1);                                                       // top highlight
    p( 5,-16, K0,  2, 18);                                                       // shaded flank
    p(-1,-16, K0,  2, 18);                                                       // sternum line
    p(-6,-10, K0, 13,  1); p(-6, -6, K0, 13, 1); p(-6, -2, K0, 13, 1);           // abdominal lines
    p(-6,-15, K3,  5,  3); p( 2,-15, K3, 5, 3);                                  // pectoral light

    // ── GOLD ARMLETS + ARMS
    p(-13,-16, CO, 6, 16); p(-12,-15, K0, 4, 14); p(-12,-15, K2, 4, 1);
    p(-13,-11, G2,  6, 2);                                                       // armlet
    p(-13,  1, CO, 6,  5); p(-12,  2, K1, 4,  3); p(-12, 2, K3, 4, 1);
    p(  7,-17, CO, 6, 12); p(  8,-16, K0, 4, 10); p(  8,-16, K2, 4, 1);
    p(  7,-12, G2,  6, 2);
    p(  8,-26, CO, 6, 11); p(  9,-25, K0, 4,  9); p(  9,-25, K2, 4, 1);
    p(  8,-29, CO, 6,  5); p(  9,-28, K1, 4,  3); p(  9,-28, K3, 4, 1);

    // ── GOLDEN TRIDENT
    p(10,-26, CO, 4, 50); p(11,-25, W1, 2, 48); p(11,-25, W2, 2, 1);             // shaft
    p(10,-12, G2, 4, 1); p(10, 6, G2, 4, 1);                                     // bindings
    p( 8,-34, CO, 8,  6); p( 9,-33, G2, 6, 4); p( 9,-33, G4, 6, 1);              // socket
    p(11,-46, CO, 3, 13); p(12,-45, G3, 1, 11); p(12,-45, G4, 1, 3);             // centre tine
    p( 8,-42, CO, 3,  9); p( 9,-41, G3, 1,  7); p( 9,-41, G4, 1, 2);             // left tine
    p(14,-42, CO, 3,  9); p(15,-41, G3, 1,  7); p(15,-41, G4, 1, 2);             // right tine
    p( 8,-35, CO, 9,  2); p( 9,-34, G3, 7, 1);                                   // tine bridge
    glow(12,-45, G4, 1, 4, 0.50 + ep * 0.30);
    glow( 9,-41, G4, 1, 3, 0.40 + ep * 0.26);
    glow(15,-41, G4, 1, 3, 0.40 + ep * 0.26);

    // ── NECK + HEAD (fierce, brows down)
    p(-3,-23, CO, 7, 3); p(-2,-22, K0, 5, 2);
    p(-7,-36, CO, 14, 14);
    p(-6,-35, K0, 12, 12); p(-5,-35, K1, 10, 11); p(-4,-34, K2, 7, 4);
    p(-6,-35, K3, 12,  1);                                                       // top highlight
    p( 4,-34, K0,  2, 10);
    p(-6,-31, K0, 12,  2);                                                       // heavy brow
    p(-5,-29, CO,  3,  2); p( 2,-29, CO, 3, 2);
    p(-4,-29, G3,  1,  1); p( 3,-29, G3, 1, 1);                                  // gold-lit eyes
    glow(-4,-29, G4, 1, 1, 0.60 + ep * 0.30);
    glow( 3,-29, G4, 1, 1, 0.60 + ep * 0.30);
    p(-3,-25, CO,  7,  2); p(-2,-24, K0, 5, 1);                                  // bared teeth

    // ── TOPKNOT + VAJRA SEAL
    p(-6,-38, CO, 12, 3); p(-5,-37, '#2A1A0E', 10, 2);
    p(-2,-42, CO,  5, 5); p(-1,-41, '#2A1A0E', 3, 3);
    p(-2,-33, CO,  5, 4); p(-1,-32, G2, 3, 2); p(-1,-32, G4, 3, 1);              // seal
    p( 0,-32, G3,  1, 1);
    glow(-1,-32, G4, 3, 2, 0.60 + ep * 0.35);

    if (isAtk) {
        glow(11,-46, G4, 3, 13, 0.60);
        glow(-1,-32, G4, 3,  2, 0.90);
    }
}

// ───────────────────────────────────────────────────
// RESONANT SAINT — 진동의 성자. White vestments under a great holy bell
// shouldered on its yoke, the air ringing around it.
// Lore: 백색 사제복에 거대한 성종을 짊어진 성자, 종소리에 공기가 진동함.
// ───────────────────────────────────────────────────
function drawSaint(cx, cy, tower) {
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
    const ring = (now % 1300) / 1300;
    const sway = Math.round(Math.sin(now * 0.0045) * 1);

    const CO='#000';
    const W0='#4A4A56', W1='#8C8C9C', W2='#C8C8D8', W3='#EDEDF6', W4='#FFFFFF';  // vestments
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8';  // bell bronze
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';
    const H1='#9A9AA8', H2='#CFCFDC';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -20, -36 + idleY, G3, 40, 64, isLeft, S);
    ctx.restore();

    // ── SHOES
    p(-7, 22, CO, 6, 5); p(-6, 23, W1, 4, 3); p(-6, 23, W3, 4, 1);
    p( 1, 22, CO, 6, 5); p( 2, 23, W1, 4, 3); p( 2, 23, W3, 4, 1);

    // ── VESTMENT SKIRT
    p(-8,  4, CO, 16, 19);
    p(-7,  5, W1, 14, 17); p(-6,  5, W2, 12, 16); p(-4,  6, W3, 8, 14);
    p(-7,  5, W4, 14,  1);                                                       // top highlight
    p(-3,  7, W0,  1, 12); p( 2,  7, W0,  1, 12);
    p(-8, 19, CO, 16,  3); p(-7, 20, G2, 14, 2); p(-7, 20, G3, 14, 1);

    // ── CINCTURE
    p(-7,  1, CO, 14, 4); p(-6, 2, G1, 12, 2); p(-6, 2, G3, 12, 1);

    // ── VESTMENT TORSO
    p(-7,-17, CO, 14, 19);
    p(-6,-16, W1, 12, 17); p(-5,-16, W2, 10, 16); p(-3,-15, W3, 6, 14);
    p(-6,-16, W4, 12,  1);                                                       // top highlight
    p(-5,-16, G1,  2, 17); p( 3,-16, G1, 2, 17);                                 // gold stole
    p(-5,-16, G3,  2,  1); p( 3,-16, G3, 2, 1);

    // ── COLLAR
    p(-7,-20, CO, 14, 4); p(-6,-19, W3, 12, 2); p(-6,-19, W4, 12, 1);

    // ── SHOULDER YOKE the bell hangs from
    p(-11,-22, CO, 22, 4); p(-10,-21, G1, 20, 2); p(-10,-21, G3, 20, 1);

    // ── ARMS steadying the yoke
    p(-12,-16, CO, 6, 14); p(-11,-15, W2, 4, 12); p(-11,-15, W4, 4, 1);
    p(-12, -3, CO, 6,  5); p(-11, -2, K1, 4,  3); p(-11, -2, K2, 4, 1);
    p(  6,-16, CO, 6, 12); p(  7,-15, W2, 4, 10); p(  7,-15, W4, 4, 1);
    p(  6, -5, CO, 6,  5); p(  7, -4, K1, 4,  3); p(  7, -4, K2, 4, 1);

    // ── GREAT HOLY BELL, shouldered — tapered in courses, swinging slightly
    const bx = 8 + sway;
    p(bx+2,-24, G2, 2, 3);                                                       // hanger loop
    p(bx+1,-22, CO, 5, 4); p(bx+2,-21, G2, 3, 2);                                // crown
    p(bx,  -19, CO, 8, 5); p(bx+1,-18, G1, 6, 3); p(bx+1,-18, G3, 6, 1);         // shoulder
    p(bx-1,-15, CO,10, 6); p(bx,  -14, G1, 8, 4); p(bx,  -14, G2, 8, 2);
    p(bx+1,-13, G3, 6,  2);                                                      // lit face
    p(bx-2, -9, CO,12, 7); p(bx-1, -8, G1,10, 5); p(bx-1, -8, G2,10, 2);
    p(bx,   -7, G3, 8,  2);
    p(bx-3, -3, CO,14, 4); p(bx-2, -2, G2,12, 2); p(bx-2, -2, G4,12, 1);         // flared lip
    p(bx+2,  1, CO, 4, 4); p(bx+3,  2, G1, 2, 2);                                // clapper
    p(bx-1,-13, G0,  1,10); p(bx+7,-13, G0, 1, 10);                              // cast seams
    glow(bx-1, -8, G4, 10, 1, 0.35 + ep * 0.28);
    glow(bx-2, -2, G4, 12, 1, 0.40 + ep * 0.28);

    // ── THE TOLL — rings travelling outward from the lip
    for (let i = 0; i < 3; i++) {
        const t = (ring + i / 3) % 1;
        const r = 3 + Math.round(t * 9);
        glow(bx + 12 + r, -8 + i * 4, G4, 1, 3, (1 - t) * 0.6);
        glow(bx - 5 - r,  -8 + i * 4, G4, 1, 3, (1 - t) * 0.35);
    }

    // ── NECK + HEAD (eyes closed, listening)
    p(-2,-25, CO, 4, 3); p(-1,-24, K0, 2, 2);
    p(-6,-37, CO, 12, 13);
    p(-5,-36, K1, 10, 11); p(-5,-36, K2, 10, 1);
    p( 3,-35, K0,  2,  9);
    p(-6,-38, CO, 12,  4); p(-5,-37, H1, 10, 2); p(-5,-37, H2, 10, 1);
    p(-4,-32, CO,  3,  1); p( 1,-32, CO, 3, 1);                                  // closed lids
    p(-1,-28, K0,  2,  1);

    // ── HALO
    p(-8,-44, CO, 16, 1); p(-8,-40, CO, 16, 1);
    p(-9,-43, CO,  1, 3); p( 8,-43, CO, 1, 3);
    p(-8,-43, G3, 16, 1); p(-8,-41, G2, 16, 1); p(-8,-42, G0, 16, 1);
    glow(-8,-43, G4, 16, 1, 0.42 + ep * 0.30);

    if (isAtk) {
        glow(bx-3, -9, G4, 14, 10, 0.60);
        glow(-8,-43, G4, 16, 1, 0.60);
    }
}

// ───────────────────────────────────────────────────
// ABYSSAL KILLER — 심연의 학살자. Black plate, a soul-harvest scythe, and
// violet mist pouring out of two empty sockets.
// Lore: 검은 갑주에 영혼 수확 낫, 텅 빈 눈동자에 보랏빛 안개가 흐르는 학살자.
// ───────────────────────────────────────────────────
function drawAbyssalKiller(cx, cy, tower) {
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
    const mist = (now % 2000) / 2000;

    const CO='#000';
    const K0='#08080E', K1='#1A1A26', K2='#2E2E42', K3='#4A4A66', K4='#78789A';
    const V0='#1A0038', V1='#3E0F72', V2='#6A22B4', V3='#9C4CE0', V4='#D8B0FF';  // soul mist
    const S2='#98A2B8', S3='#D2DAEA', S4='#FFFFFF';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -20, -36 + idleY, V2, 40, 66, isLeft, S);
    ctx.restore();

    // ── BOOTS
    p(-7, 20, CO, 6, 5); p(-6, 21, K1, 4, 3); p(-6, 21, K3, 4, 1);
    p( 1, 20, CO, 6, 5); p( 2, 21, K1, 4, 3); p( 2, 21, K3, 4, 1);

    // ── GREAVES
    p(-8,  2, CO, 16, 19); p(-7,  3, K0, 14, 17); p(-6,  4, K1, 12, 15);
    p(-7,  3, K4, 14,  1);                                                       // top highlight
    p(-1,  4, K0,  2, 15);
    p(-8, 17, CO, 16,  3); p(-7, 18, V1, 14, 2); p(-7, 18, V2, 14, 1);           // soul-lit hem

    // ── BELT
    p(-8,  0, CO, 16, 3); p(-7, 1, K2, 14, 2); p(-7, 1, K4, 14, 1);
    p(-2, -1, CO,  5, 5); p(-1, 0, V1,  3, 3); p(-1, 0, V3, 3, 1);
    glow(-1, 0, V4, 3, 1, 0.55 + ep * 0.32);

    // ── CUIRASS
    p(-7,-16, CO, 14, 18); p(-6,-15, K0, 12, 16); p(-5,-15, K1, 10, 15);
    p(-6,-15, K4, 12,  1);                                                       // top highlight
    p(-3,-14, K2,  6, 13);
    p(-6,-10, K0, 12,  1); p(-6, -5, K0, 12, 1);                                 // plate seams
    p(-2, -9, CO,  5,  5); p(-1, -8, V1, 3, 3); p(-1, -8, V3, 3, 1);             // soul reliquary
    glow(-1, -8, V4, 3, 1, 0.55 + ep * 0.32);

    // ── PAULDRONS (spiked)
    p(-12,-19, CO, 6, 8); p(-11,-18, K1, 4, 6); p(-11,-18, K4, 4, 1);
    p(-13,-23, CO, 4, 5); p(-12,-22, K2, 2, 4);
    p(  6,-19, CO, 6, 8); p(  7,-18, K1, 4, 6); p(  7,-18, K4, 4, 1);
    p(  9,-23, CO, 4, 5); p( 10,-22, K2, 2, 4);

    // ── ARMS
    p(-12,-13, CO, 6, 13); p(-11,-12, K1, 4, 11); p(-11,-12, K3, 4, 1);
    p(-12,  0, CO, 6,  5); p(-11,  1, K2, 4,  3);
    p(  6,-13, CO, 6, 13); p(  7,-12, K1, 4, 11); p(  7,-12, K3, 4, 1);
    p(  6,  0, CO, 6,  5); p(  7,  1, K2, 4,  3);

    // ── SOUL-HARVEST SCYTHE — haft on the right, blade sweeping over the head
    p(12,-30, CO, 4, 52); p(13,-29, K1, 2, 50); p(13,-29, K3, 2, 1);             // haft
    p(12,-14, V1, 4, 1); p(12, 4, V1, 4, 1);                                     // soul bindings
    p(10,-34, CO, 8,  6); p(11,-33, K2, 6, 4); p(11,-33, K4, 6, 1);              // collar
    // blade: stepped courses sweeping left and up
    for (let i = 0; i < 8; i++) {
        const bx = 10 - i * 2 - Math.round(Math.sin(i / 7 * Math.PI) * 2);
        const by = -38 - Math.round(i * 0.9);
        p(bx, by, CO, 4, 4);
        p(bx, by, i < 6 ? S2 : S3, 3, 2);
        p(bx, by, S4, 3, 1);                                                     // edge light
        glow(bx, by, V4, 3, 1, 0.24 + ep * 0.20);
    }

    // ── HELM with two empty sockets
    p(-7,-33, CO, 14, 15); p(-6,-32, K0, 12, 13); p(-5,-32, K1, 10, 12);
    p(-6,-32, K4, 12,  1);                                                       // top highlight
    p(-6,-27, K0, 12,  6);                                                       // face void
    p(-5,-26, CO,  4,  4); p( 2,-26, CO, 4, 4);
    p(-4,-25, V2,  2,  2); p( 3,-25, V2, 2, 2);
    glow(-4,-25, V4, 2, 2, 0.75 + ep * 0.25);
    glow( 3,-25, V4, 2, 2, 0.75 + ep * 0.25);
    // mist pouring down out of the sockets
    for (let i = 0; i < 4; i++) {
        const t = (mist + i / 4) % 1;
        const my = -22 + Math.round(t * 10);
        glow(-4 + (i % 2) * 7, my, V3, 2, 1, (1 - t) * 0.55);
    }
    p(-8,-33, CO, 3, 8); p(-7,-32, K1, 1, 7);                                    // cheek guards
    p( 6,-33, CO, 3, 8); p( 7,-32, K1, 1, 7);
    p(-2,-37, CO, 5, 5); p(-1,-36, V1, 3, 3); p(-1,-36, V3, 3, 1);               // crest stone
    glow(-1,-36, V4, 3, 1, 0.50 + ep * 0.30);

    if (isAtk) {
        glow(-4,-25, V4, 2, 2, 0.95); glow(3,-25, V4, 2, 2, 0.95);
        glow(-6,-40, V4, 18, 8, 0.45);                                           // blade sweep
    }
}

// ───────────────────────────────────────────────────
// SPATIAL SLASHER — 공간 절단자. Silver plate, a curved dimension blade, and
// the rifts it leaves hanging in the air behind the cut.
// Lore: 은빛 갑주에 휘어진 차원 검, 베인 자리에 균열이 남는 절단자.
// ───────────────────────────────────────────────────
function drawSpatialSlasher(cx, cy, tower) {
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
    const rift = (now % 1500) / 1500;

    const CO='#000';
    const Z0='#2E323E', Z1='#767E92', Z2='#B6BECE', Z3='#E2E8F2', Z4='#FFFFFF';  // silver
    const C1='#0A6E96', C2='#22B8E0', C3='#7FE8FF', C4='#DDFAFF';                // rift cyan
    const V2='#7B1FA2', V3='#B060E0';                                            // rift violet
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -20, -34 + idleY, C2, 40, 62, isLeft, S);
    ctx.restore();

    // ── HANGING RIFTS — three diagonal tears, each on its own fade cycle so
    //    they read as cuts left behind rather than as decoration.
    for (let i = 0; i < 3; i++) {
        const t  = (rift + i / 3) % 1;
        const a  = (1 - t) * 0.9;
        const rx = 12 + i * 3;
        const ry = -26 + i * 11;
        for (let j = 0; j < 6; j++) {
            p(rx + j, ry + j * 2, CO, 2, 2);
            glow(rx + j, ry + j * 2, j % 2 ? C4 : V3, 2, 1, a * 0.75);
        }
    }

    // ── SABATONS
    p(-8, 22, CO, 7, 5); p(-7, 23, Z1, 5, 3); p(-7, 23, Z3, 5, 1);
    p( 1, 22, CO, 7, 5); p( 2, 23, Z1, 5, 3); p( 2, 23, Z3, 5, 1);

    // ── GREAVES
    p(-8,  4, CO, 16, 19); p(-7,  5, Z0, 14, 17); p(-6,  5, Z1, 12, 16);
    p(-4,  6, Z2,  8, 14);
    p(-7,  5, Z4, 14,  1);                                                       // top highlight
    p(-1,  6, Z0,  2, 13);
    p(-8, 19, CO, 16,  3); p(-7, 20, C1, 14, 2); p(-7, 20, C2, 14, 1);

    // ── BELT
    p(-7,  1, CO, 14, 4); p(-6, 2, Z2, 12, 2); p(-6, 2, Z4, 12, 1);
    p(-2,  0, CO,  5, 5); p(-1, 1, C1,  3, 3); p(-1, 1, C3, 3, 1);
    glow(-1, 1, C4, 3, 1, 0.50 + ep * 0.30);

    // ── CUIRASS
    p(-7,-16, CO, 14, 18); p(-6,-15, Z0, 12, 16); p(-5,-15, Z1, 10, 15);
    p(-6,-15, Z4, 12,  1);                                                       // top highlight
    p(-3,-14, Z2,  6, 13);
    p( 4,-14, Z0,  2, 13);                                                       // shaded flank
    p(-2, -9, CO,  5,  5); p(-1, -8, C1, 3, 3); p(-1, -8, C3, 3, 1);
    glow(-1, -8, C4, 3, 1, 0.55 + ep * 0.30);

    // ── PAULDRONS + COLLAR
    p(-12,-19, CO, 6, 8); p(-11,-18, Z1, 4, 6); p(-11,-18, Z4, 4, 1);
    p(  6,-19, CO, 6, 8); p(  7,-18, Z1, 4, 6); p(  7,-18, Z4, 4, 1);
    p(-6,-20, CO, 12, 3); p(-5,-19, Z3, 10, 2); p(-5,-19, Z4, 10, 1);

    // ── ARMS, sword arm cocked back
    p(-12,-13, CO, 6, 13); p(-11,-12, Z1, 4, 11); p(-11,-12, Z3, 4, 1);
    p(-12,  0, CO, 6,  5); p(-11,  1, K1, 4,  3); p(-11, 1, K2, 4, 1);
    p(  6,-14, CO, 6, 10); p(  7,-13, Z1, 4,  8); p(  7,-13, Z3, 4, 1);
    p(  7,-20, CO, 6,  7); p(  8,-19, K1, 4,  5); p(  8,-19, K2, 4, 1);

    // ── DIMENSION BLADE — a curved sweep with a cyan inner edge
    p( 8,-16, CO, 5, 5); p( 9,-15, C1, 3, 3);                                    // guard
    //    Same overlap rule as the assassin's blades: 5-wide blocks stepping 1
    //    in x and 2 in y with the curve damped to +-2 keeps the sweep solid.
    for (let i = 0; i < 10; i++) {
        const off = Math.round(Math.sin(i / 9 * Math.PI) * 2);
        const sx  = 10 + i + off;
        const sy  = -19 - i * 2;
        p(sx, sy, CO, 5, 4);
        p(sx, sy, i < 8 ? Z2 : Z3, 4, 3);
        p(sx, sy, Z4, 4, 1);                                                     // spine light
        glow(sx, sy + 2, C4, 4, 1, 0.34 + ep * 0.24);                            // cutting edge
    }
    p( 9,-11, CO, 3, 4); p(10,-10, Z1, 1, 3);                                    // grip
    p( 8, -8, CO, 5, 3); p( 9, -7, C2, 3, 1);                                    // pommel stone

    // ── NECK + HEAD
    p(-2,-22, CO, 4, 3); p(-1,-21, K0, 2, 2);
    p(-6,-34, CO, 12, 13);
    p(-5,-33, K1, 10, 11); p(-5,-33, K2, 10, 1);
    p( 3,-32, K0,  2,  9);
    p(-4,-29, CO, 3, 2); p( 1,-29, CO, 3, 2);
    p(-3,-29, isAtk ? C4 : Z4, 1, 1); p( 2,-29, isAtk ? C4 : Z4, 1, 1);
    p(-1,-25, K0, 2, 1);

    // ── VISORED CIRCLET
    p(-7,-37, CO, 14, 4); p(-6,-36, Z1, 12, 2); p(-6,-36, Z3, 12, 1);
    p(-1,-40, CO,  3, 4); p( 0,-39, C2, 1, 3);
    glow( 0,-39, C4, 1, 3, 0.50 + ep * 0.30);

    if (isAtk) {
        glow(11,-30, C4, 14, 16, 0.40);
        glow(-1, -8, C4,  3,  3, 0.60);
    }
}

// ───────────────────────────────────────────────────
// WRAITH LORD — 망령 군주. Black iron crown, tattered wraith cloak, and the
// skeleton soldiers his kills become drifting at his shoulder.
// Lore: 검은 왕관에 너덜한 망령 망토, 주위에 해골 병사 영혼이 떠도는 군주.
// The old art orbited four green hands, which read as a swamp creature and
// said nothing about raising soldiers; the crown was silver, not black.
// ───────────────────────────────────────────────────
function drawWraithLord(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const S = 2.0;
    const idleY  = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    // Glows go through `lighter`, which is what the bake records as emissive;
    // the finishing pass then blooms exactly these and nothing else.
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep    = (Math.sin(now * 0.005) + 1) / 2;
    const soulP = (Math.sin(now * 0.004) + 1) / 2;
    const drift = now * 0.0011;
    const rag   = now * 0.004;

    const CO='#000';
    const V0='#0B0424', V1='#1E0F52', V2='#33208A', V3='#5238C0', V4='#8A72E8';  // wraith purple
    const E0='#04361A', E1='#0A7A3A', E2='#18C468', E3='#5FF2A4', E4='#C8FFE2';  // soul green
    const B1='#8A8478', B2='#C6C0B2', B3='#EDE8DC', B4='#FFFFFF';                // bone
    const K0='#08080E', K1='#1C1C28', K2='#34344A', K3='#54546E';                // black iron

    // soul aura
    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnitAura(ctx, cx, cy, -20, -40 + idleY, E2, 40, 70, isLeft, S);
    ctx.restore();

    // ── GRAVE MIST AT THE FEET
    p(-10, 20, CO, 20, 6);
    p( -9, 21, E0, 18, 4); p(-8, 21, E1, 16, 1);
    glow(-9, 21, E2, 18, 2, 0.16 + soulP * 0.16);

    // ── THREE SKELETON-SOLDIER SPIRITS — a skull, a rib cage and a wisp tail
    //    each. These are the souls the ability actually raises, which is the
    //    whole read the old floating hands were missing.
    for (let i = 0; i < 3; i++) {
        const a  = drift + i * (Math.PI * 2 / 3);
        const sx = Math.round(Math.cos(a) * 17) + (i === 1 ? 1 : 0);
        const sy = Math.round(Math.sin(a) * 7) - 6 + i * 2;
        const bob = Math.round(Math.sin(now * 0.005 + i * 2) * 1);
        // skull
        p(sx-2, sy-3+bob, CO, 5, 5); p(sx-1, sy-2+bob, E1, 3, 3);
        p(sx-1, sy-2+bob, E2, 3, 1);                                             // top highlight
        p(sx-1, sy-1+bob, CO, 1, 1); p(sx+1, sy-1+bob, CO, 1, 1);                // sockets
        // rib cage
        p(sx-2, sy+2+bob, CO, 5, 4); p(sx-1, sy+3+bob, E0, 3, 2);
        p(sx-2, sy+3+bob, E1, 5, 1); p(sx-2, sy+5+bob, E1, 5, 1);                // ribs
        // wisp tail
        p(sx-1, sy+6+bob, E0, 3, 2); p(sx, sy+8+bob, E0, 1, 2);
        glow(sx-2, sy-3+bob, E3, 5, 3, 0.35 + soulP * 0.30);
        glow(sx-2, sy+2+bob, E2, 5, 4, 0.22 + soulP * 0.20);
    }

    // ── BOOTS
    p(-7, 14, CO, 7, 9); p(-6, 15, V0, 5, 8); p(-6, 15, V2, 5, 1);
    p( 1, 14, CO, 6, 9); p( 2, 15, V0, 5, 8); p( 2, 15, V2, 5, 1);
    p(-7, 14, E1, 7, 1); p( 1, 14, E1, 6, 1);                                    // soul-lit cuffs

    // ── TATTERED CLOAK — one mass, then a ragged fringe of uneven strips.
    //    A flat hem is what made the old cloak read as a robe.
    p(-11,-16, CO, 23, 30); p(-10,-15, V0, 21, 28); p(-9,-15, V1, 19, 27);
    p(-10,-15, V3, 21,  1);                                                      // top highlight
    p(-6,-14, V2, 11, 25);                                                       // lit inner panel
    for (let i = 0; i < 11; i++) {
        const tx = -11 + i * 2;
        const tl = 3 + ((i * 5) % 7) + Math.round(Math.sin(rag + i) * 1.5);
        p(tx, 14, CO, 2, tl); p(tx, 14, V1, 1, tl - 1);
        if (i % 2 === 0) p(tx, 14 + tl - 1, E1, 2, 1);                           // soul-lit tips
    }

    // ── ROBE UNDER THE CLOAK
    p(-7,  2, CO, 14, 13); p(-6,  3, V0, 12, 11); p(-5,  4, V1, 9, 9);
    p(-6,  3, V3, 12,  1);                                                       // top highlight
    p(-7, 12, CO, 14,  3); p(-6, 13, E0, 12, 2); p(-6, 13, E2, 12, 1);           // soul hem

    // ── BELT
    p(-7,  0, CO, 14, 3); p(-6, 1, V2, 12, 2); p(-6, 1, V4, 12, 1);
    p(-2, -1, CO,  5, 5); p(-1, 0, E1,  3, 3); p(-1, 0, E3, 3, 1);
    glow(-1, 0, E4, 3, 1, 0.55 + ep * 0.35);

    // ── CUIRASS
    p(-7,-14, CO, 14, 16); p(-6,-13, V0, 12, 14); p(-5,-13, V1, 10, 13);
    p(-6,-13, V4, 12,  1);                                                       // top highlight
    p(-3,-12, V2,  6, 11);                                                       // lit centre panel
    // soul gem
    p(-2, -7, CO, 5, 5); p(-1, -6, E1, 3, 3); p(-1, -6, E3, 3, 1);
    glow(-1, -6, E4, 3, 1, 0.60 + ep * 0.35);
    for (let r = 0; r < 3; r++) { glow(-6,-11+r*4, E3, 1, 1, 0.45); glow(5,-11+r*4, E3, 1, 1, 0.45); }

    // ── PAULDRONS (black iron, soul-fire rim)
    p(-13,-16, CO, 7, 8); p(-12,-15, K1, 5, 6); p(-12,-15, K3, 5, 1);
    p(-12,-16, E1,  5, 1);
    p(  6,-16, CO, 7, 8); p(  7,-15, K1, 5, 6); p(  7,-15, K3, 5, 1);
    p(  7,-16, E1,  5, 1);

    // ── ARMS
    p(-12,-10, CO, 6, 13); p(-11,-9, V1, 4, 11); p(-11,-9, V3, 4, 1);
    p(-12,  2, CO, 6,  5); p(-11, 3, B2, 4,  3); p(-11, 3, B3, 4, 1);            // skeletal hand
    p(  6,-10, CO, 6, 13); p(  7,-9, V1, 4, 11); p(  7,-9, V3, 4, 1);
    p(  6,  2, CO, 6,  5); p(  7, 3, B2, 4,  3); p(  7, 3, B3, 4, 1);

    // ── SOUL STAFF (shortened; the old one reached 54px above the head and
    //    set the whole texture's crop by itself)
    p(11,-36, CO, 4, 40); p(12,-35, V0, 2, 38); p(12,-35, V2, 2, 1);
    p(11,-24, E1, 4, 1); p(11,-12, E1, 4, 1); p(11, 0, E1, 4, 1);                // soul bands
    p( 9,-44, CO, 8,  9); p(10,-43, E0, 6, 7); p(11,-42, E1, 4, 5);
    p(12,-41, E2, 2, 3); p(10,-43, E3, 6, 1);                                    // orb top highlight
    glow(10,-43, E3, 6, 1, 0.55 + soulP * 0.35);
    glow(11,-42, E4, 4, 3, 0.40 + soulP * 0.30);

    // ── NECK
    p(-3,-17, CO, 7, 3); p(-2,-16, V0, 5, 2);

    // ── SKULL FACE
    p(-7,-31, CO, 14, 15);
    p(-6,-30, B1, 12, 13); p(-5,-30, B2, 10, 12); p(-4,-29, B3, 7, 10);
    p(-6,-30, B4, 12,  1);                                                       // top highlight
    p( 4,-29, B1,  2, 10);                                                       // shaded cheek
    p(-5,-26, CO,  4,  5); p( 2,-26, CO, 4, 5);                                  // eye sockets
    p(-4,-25, E1,  2,  3); p( 3,-25, E1, 2, 3);
    glow(-4,-25, E3, 2, 2, 0.70 + soulP * 0.30);
    glow( 3,-25, E3, 2, 2, 0.70 + soulP * 0.30);
    p(-1,-21, CO,  3,  3);                                                       // nasal cavity
    p(-5,-18, CO, 11,  3); p(-4,-17, B3, 9, 2);                                  // jaw
    for (let i = 0; i < 5; i++) p(-4 + i * 2, -18, CO, 1, 3);                    // teeth gaps

    // ── BLACK IRON CROWN — five points, soul-fire in the gaps
    p(-8,-37, CO, 16, 6); p(-7,-36, K0, 14, 4); p(-7,-36, K2, 14, 1);
    p(-7,-33, K1, 14, 1);
    for (let i = 0; i < 5; i++) {
        const px = -7 + i * 3;
        const ph = (i === 2) ? 7 : (i % 2 ? 4 : 5);
        p(px, -37 - ph, CO, 3, ph + 1);
        p(px + 1, -36 - ph, K2, 1, ph);
        if (i % 2 === 0) glow(px + 1, -36 - ph, E3, 1, 2, 0.45 + ep * 0.30);
    }
    glow(-7,-33, E2, 14, 1, 0.22 + ep * 0.20);                                   // soul-fire in the band

    if (isAtk) {
        glow(11,-42, E4, 4, 3, 0.70);
        glow(-4,-25, E4, 2, 2, 0.85); glow(3,-25, E4, 2, 2, 0.85);
        glow(-1, -6, E4, 3, 3, 0.60);
    }
}

// ───────────────────────────────────────────────────
// CURSED SHAMAN — 저주받은 주술사. Bone mask, feather headdress, and the black
// curse doll he drives pins into.
// Lore: 뼈 가면과 깃털 장식, 검은 저주 인형을 손에 쥔 어두운 주술사.
// The old art had a painted bare face, a ritual drum and a banner pole taller
// than the sprite — three props, none of them the one in the brief.
// ───────────────────────────────────────────────────
function drawCursedShaman(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const S = 2.0;
    const idleY  = Math.sin(now * 0.003) * 2;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    // Glows go through `lighter`, which is what the bake records as emissive;
    // the finishing pass then blooms exactly these and nothing else.
    const glow = (ox, oy, col, w, h, a) => {
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S); ctx.restore();
    };
    const ep    = (Math.sin(now * 0.005) + 1) / 2;
    const pulse = (Math.sin(now * 0.008) + 1) / 2;
    const sway  = Math.sin(now * 0.004) * 1;

    const CO='#000';
    const H0='#150A16', H1='#301A34', H2='#4E2C54', H3='#70457A', H4='#9A6BA6';  // hide robe
    const B1='#8C8272', B2='#C8BEA8', B3='#E8E0CC', B4='#FFFAEC';                // bone
    const R1='#5A0010', R2='#A00020', R3='#E02440', R4='#FF7A90';                // curse red
    const F1='#7A2A12', F2='#C4581E', F3='#F09A3C';                              // feathers
    const D0='#0A0A0C', D1='#1E1E22', D2='#33333A';                              // curse doll
    const T1='#4E342E', T2='#6D4C41', T3='#A1887F';                              // wood

    // curse aura
    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -20, -38 + idleY, R2, 40, 68, isLeft, S);
    ctx.restore();

    // ── BOOTS
    p(-7, 14, CO, 7, 9); p(-6, 15, H0, 5, 8); p(-6, 15, H2, 5, 1);
    p( 1, 14, CO, 6, 9); p( 2, 15, H0, 5, 8); p( 2, 15, H2, 5, 1);
    p(-7, 14, R2, 7, 1); p( 1, 14, R2, 6, 1);

    // ── HIDE SKIRT (ragged, bone tassels)
    p(-8,  2, CO, 16, 14); p(-7,  3, H0, 14, 12); p(-6,  4, H1, 11, 10);
    p(-7,  3, H3, 14,  1);                                                       // top highlight
    p(-4,  5, H2,  7, 9);                                                        // lit panel
    for (let i = 0; i < 7; i++) {
        const tx = -7 + i * 2, tl = 3 + ((i * 3) % 5);
        p(tx, 14, CO, 2, tl); p(tx, 14, H1, 1, tl - 1);
        if (i % 2 === 1) p(tx, 14 + tl - 1, B2, 2, 1);                           // bone bead tips
    }

    // ── BONE BELT
    p(-8,  0, CO, 16, 3); p(-7, 1, B1, 14, 2); p(-7, 1, B3, 14, 1);
    p(-2, -1, CO,  5, 5); p(-1, 0, R1,  3, 3); p(-1, 0, R3, 3, 1);
    glow(-1, 0, R4, 3, 1, 0.55 + pulse * 0.35);

    // ── ROBE TORSO
    p(-7,-14, CO, 14, 16); p(-6,-13, H0, 12, 14); p(-5,-13, H1, 10, 13);
    p(-6,-13, H4, 12,  1);                                                       // top highlight
    p(-3,-12, H2,  6, 11);                                                       // lit centre
    // curse sigil
    p(-2, -7, CO, 5, 5); p(-1, -6, R1, 3, 3); p(-1, -6, R3, 3, 1);
    glow(-1, -6, R4, 3, 1, 0.55 + pulse * 0.35);

    // ── FUR MANTLE + BONE NECKLACE
    p(-9,-17, CO, 18, 5); p(-8,-16, H1, 16, 3); p(-8,-16, H3, 16, 1);
    for (let i = 0; i < 6; i++) { p(-6 + i * 2, -13, CO, 2, 3); p(-6 + i * 2, -12, B2, 1, 2); }

    // ── PAULDRONS (bone-spiked)
    p(-13,-17, CO, 7, 7); p(-12,-16, H1, 5, 5); p(-12,-16, H3, 5, 1);
    p(-13,-21, CO, 3, 5); p(-12,-20, B2, 1, 4); p(-12,-21, B4, 1, 1);
    p(  6,-17, CO, 7, 7); p(  7,-16, H1, 5, 5); p(  7,-16, H3, 5, 1);
    p( 10,-21, CO, 3, 5); p( 11,-20, B2, 1, 4); p( 11,-21, B4, 1, 1);

    // ── LEFT ARM (holds the doll out)
    p(-13,-11, CO, 6, 12); p(-12,-10, H1, 4, 10); p(-12,-10, H3, 4, 1);
    p(-14,  0, CO, 6,  5); p(-13,  1, B2, 4,  3); p(-13, 1, B3, 4, 1);

    // ── BLACK CURSE DOLL (the brief's prop: sackcloth body, stitched X eyes,
    //    two iron pins driven in, swinging from the fist)
    const dx = -13 + sway;
    p(dx-1,  6, T2, 1, 2);                                                       // cord
    p(dx-3,  8, CO, 7, 7); p(dx-2,  9, D1, 5, 5); p(dx-2, 9, D2, 5, 1);          // head
    p(dx-2, 10, R2, 1, 1); p(dx+1, 10, R2, 1, 1);                                // stitched eyes
    p(dx-1, 12, R1, 3, 1);                                                       // stitched mouth
    p(dx-3, 15, CO, 7, 8); p(dx-2, 16, D0, 5, 6); p(dx-2, 16, D2, 5, 1);         // body
    p(dx-5, 16, CO, 3, 5); p(dx-4, 17, D1, 1, 4);                                // arms
    p(dx+3, 16, CO, 3, 5); p(dx+4, 17, D1, 1, 4);
    p(dx-2, 22, CO, 2, 4); p(dx+1, 22, CO, 2, 4);                                // legs
    p(dx-4, 17, B3, 5, 1); p(dx-1, 19, B3, 5, 1);                                // iron pins
    glow(dx-4, 17, R4, 5, 1, 0.35 + pulse * 0.30);
    glow(dx-1, 19, R4, 5, 1, 0.35 + pulse * 0.30);

    // ── RIGHT ARM (raised, bone rattle)
    p( 7,-11, CO, 6, 12); p( 8,-10, H1, 4, 10); p( 8,-10, H3, 4, 1);
    p( 9,-20, CO, 6, 11); p(10,-19, H1, 4,  9); p(10,-19, H3, 4, 1);
    p( 9,-23, CO, 6,  5); p(10,-22, B2, 4,  3); p(10,-22, B3, 4, 1);
    p(11,-30, CO, 2,  8); p(11,-30, T2, 1,  7);                                  // rattle haft
    p( 9,-34, CO, 6,  5); p(10,-33, B2, 4,  3); p(10,-33, B4, 4, 1);             // rattle skull
    p(10,-32, CO, 1,  1); p(12,-32, CO, 1, 1);
    glow(10,-32, R3, 1, 1, 0.55 + pulse * 0.30);
    glow(12,-32, R3, 1, 1, 0.55 + pulse * 0.30);

    // ── NECK
    p(-3,-17, CO, 7, 3); p(-2,-16, H0, 5, 2);

    // ── BONE MASK (covers the whole face: carved plate, slit eyes, bared teeth)
    p(-7,-31, CO, 14, 15);
    p(-6,-30, B1, 12, 13); p(-5,-30, B2, 10, 12); p(-4,-29, B3, 7, 10);
    p(-6,-30, B4, 12,  1);                                                       // top highlight
    p( 4,-29, B1,  2, 10);                                                       // shaded side
    p(-6,-24, R1, 12,  1); p(-6,-21, R1, 12, 1);                                 // carved bands
    p(-5,-27, CO,  4,  2); p( 2,-27, CO, 4, 2);                                  // eye slits
    p(-4,-27, R2,  2,  1); p( 3,-27, R2, 2, 1);
    glow(-4,-27, R4, 2, 1, 0.75 + pulse * 0.25);
    glow( 3,-27, R4, 2, 1, 0.75 + pulse * 0.25);
    p(-4,-19, CO,  9,  3); p(-3,-18, B4, 7, 2);                                  // bared teeth
    for (let i = 0; i < 4; i++) p(-3 + i * 2, -19, CO, 1, 3);
    p(-1,-23, CO,  3,  2);                                                       // mask nose slot

    // ── FEATHER HEADDRESS (five, fanning back, red through amber)
    p(-8,-36, CO, 16, 6); p(-7,-35, T1, 14, 4); p(-7,-35, T3, 14, 1);            // hide band
    p(-6,-33, B2, 12, 1);                                                        // bone studs row
    for (let i = 0; i < 5; i++) {
        const fx = -8 + i * 4;
        const fh = (i === 2) ? 13 : (i % 2 ? 9 : 11);
        const tilt = Math.round((i - 2) * 1.2);
        p(fx + tilt, -36 - fh, CO, 3, fh);
        p(fx + tilt + 1, -35 - fh, i % 2 ? F2 : F1, 1, fh - 2);
        p(fx + tilt + 1, -35 - fh, F3, 1, 3);                                    // bright tip
    }
    glow(-8,-33, R3, 16, 1, 0.20 + pulse * 0.18);

    if (isAtk) {
        glow(-4,-27, R4, 2, 1, 0.90); glow(3,-27, R4, 2, 1, 0.90);
        glow(dx-3, 8, R4, 7, 15, 0.45);                                          // doll flares
        glow(-1, -6, R4, 3, 3, 0.55);
    }
}

// ───────────────────────────────────────────────────
// HOLY RAMPART — 신성한 성벽. White plate behind an enormous gold tower shield,
// planted and immovable.
// Lore: 거대한 황금 타워실드에 백색 갑주, 미동도 없는 견고한 성벽.
// ───────────────────────────────────────────────────
function drawRampart(cx, cy, tower) {
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
    const M0='#3A3E4A', M1='#767E92', M2='#B6BECE', M3='#E2E8F2', M4='#FFFFFF';  // white plate
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -22, -36 + idleY, G3, 44, 64, isLeft, S);
    ctx.restore();

    // ── SABATONS (planted wide)
    p(-11, 22, CO, 8, 5); p(-10, 23, M1, 6, 3); p(-10, 23, M3, 6, 1);
    p(  4, 22, CO, 8, 5); p(  5, 23, M1, 6, 3); p(  5, 23, M3, 6, 1);

    // ── GREAVES
    p(-9,  4, CO, 18, 19); p(-8,  5, M0, 16, 17); p(-7,  5, M1, 14, 16);
    p(-5,  6, M2, 10, 14);
    p(-8,  5, M4, 16,  1);                                                       // top highlight
    p(-1,  6, M0,  2, 13);
    p(-9, 19, CO, 18,  3); p(-8, 20, G2, 16, 2); p(-8, 20, G3, 16, 1);

    // ── BELT
    p(-8,  1, CO, 16, 4); p(-7, 2, G1, 14, 2); p(-7, 2, G3, 14, 1);

    // ── CUIRASS
    p(-8,-18, CO, 17, 20); p(-7,-17, M0, 15, 18); p(-6,-17, M1, 13, 17);
    p(-4,-16, M2,  9, 15);
    p(-7,-17, M4, 15,  1);                                                       // top highlight
    p( 6,-16, M0,  2, 16);
    p(-7,-11, M0, 15,  1); p(-7, -5, M0, 15, 1);                                 // plate seams

    // ── PAULDRONS + COLLAR
    p(-14,-21, CO, 7, 9); p(-13,-20, M1, 5, 7); p(-13,-20, M4, 5, 1);
    p(-13,-21, G2,  5, 1);
    p(  7,-21, CO, 7, 9); p(  8,-20, M1, 5, 7); p(  8,-20, M4, 5, 1);
    p(  8,-21, G2,  5, 1);
    p(-6,-22, CO, 12, 3); p(-5,-21, M3, 10, 2); p(-5,-21, M4, 10, 1);

    // ── ARMS braced behind the shield
    p(-13,-15, CO, 6, 14); p(-12,-14, M1, 4, 12); p(-12,-14, M3, 4, 1);
    p(  7,-15, CO, 6, 14); p(  8,-14, M1, 4, 12); p(  8,-14, M3, 4, 1);

    // ── ENORMOUS GOLD TOWER SHIELD — taller than the unit, planted in the
    //    ground. Built as a rim, a field, ribs and a boss so it has depth
    //    instead of being one gold slab.
    p(-20,-40, CO, 20, 66);                                                      // outline
    p(-19,-39, G1, 18, 64); p(-19,-39, G4, 18, 1);                               // rim + top light
    p(-17,-37, G0, 14, 60);                                                      // recessed field
    p(-16,-36, G2, 12, 58); p(-16,-36, G3, 12, 2);
    p(-16,-36, G4, 12,  1);
    p(-13,-36, G1,  1, 58); p( -6,-36, G1, 1, 58);                               // vertical ribs
    p(-16,-18, G1, 12,  1); p(-16,  2, G1, 12, 1);                               // banding
    // central boss with a cross
    p(-14,-12, CO, 8, 10); p(-13,-11, G3, 6, 8); p(-13,-11, G4, 6, 1);
    p(-11,-11, CO, 3,  8); p(-10,-10, G1, 1, 6);
    p(-14, -8, CO, 8,  3); p(-13, -7, G1, 6, 1);
    glow(-16,-36, G4, 12, 2, 0.35 + ep * 0.26);
    glow(-13,-11, G4,  6, 1, 0.40 + ep * 0.28);
    // ground bite where it is planted
    p(-18, 24, CO, 16, 3); p(-17, 25, G1, 14, 2);

    // ── NECK + GREAT HELM (visor slit only)
    p(-2,-24, CO, 4, 3); p(-1,-23, K0, 2, 2);
    p(-7,-37, CO, 14, 15); p(-6,-36, M0, 12, 13); p(-5,-36, M1, 10, 12);
    p(-6,-36, M4, 12,  1);                                                       // top highlight
    p( 4,-35, M0,  2, 11);
    p(-6,-31, CO, 12,  3); p(-5,-30, K0, 10, 1);                                 // visor slit
    p(-5,-30, isAtk ? G4 : G3, 10, 1);
    glow(-5,-30, G4, 10, 1, 0.40 + ep * 0.28);
    p(-7,-38, CO, 14, 2); p(-6,-37, G2, 12, 1);                                  // helm band
    p(-2,-42, CO,  5, 5); p(-1,-41, G3, 3, 3); p(-1,-41, G4, 3, 1);              // crest
    glow(-1,-41, G4, 3, 1, 0.45 + ep * 0.28);

    if (isAtk) {
        glow(-16,-36, G4, 12, 58, 0.28);
        glow(-13,-11, G4,  6, 8, 0.55);
    }
}

// ───────────────────────────────────────────────────
// KNIGHT OF JUDGMENT — 심판의 기사. Platinum plate, a holy greatsword, and the
// scales of judgment hanging as a halo above the helm.
// Lore: 백금 갑주에 거룩한 양손검, 머리 위에 천칭 후광이 떠도는 심판자.
// ───────────────────────────────────────────────────
function drawJudgment(cx, cy, tower) {
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
    const tilt = Math.round(Math.sin(now * 0.0024) * 1);

    const CO='#000';
    const T0='#2E323E', T1='#767E92', T2='#B6BECE', T3='#E2E8F2', T4='#FFFFFF';  // platinum
    const G0='#3A2600', G1='#7A5400', G2='#B98A0A', G3='#FFCF33', G4='#FFF0A8';
    const K0='#C4834E', K1='#F0C090', K2='#FFDCBC';

    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnitAura(ctx, cx, cy, -20, -38 + idleY, G3, 40, 66, isLeft, S);
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

    // ── CUIRASS with a gold judgment band
    p(-8,-18, CO, 17, 20); p(-7,-17, T0, 15, 18); p(-6,-17, T1, 13, 17);
    p(-4,-16, T2,  9, 15);
    p(-7,-17, T4, 15,  1);                                                       // top highlight
    p( 6,-16, T0,  2, 16);
    p(-7,-11, G2, 15,  3); p(-6,-10, G4, 13, 1);
    p(-2, -5, CO,  5,  5); p(-1, -4, G3, 3, 3); p(-1, -4, G4, 3, 1);
    glow(-1, -4, G4, 3, 1, 0.50 + ep * 0.30);

    // ── PAULDRONS + COLLAR
    p(-13,-21, CO, 7, 9); p(-12,-20, T1, 5, 7); p(-12,-20, T4, 5, 1);
    p(-12,-21, G2,  5, 1);
    p(  6,-21, CO, 7, 9); p(  7,-20, T1, 5, 7); p(  7,-20, T4, 5, 1);
    p(  7,-21, G2,  5, 1);
    p(-6,-22, CO, 12, 3); p(-5,-21, T3, 10, 2); p(-5,-21, T4, 10, 1);

    // ── ARMS, both to the hilt
    p(-12,-15, CO, 6, 14); p(-11,-14, T1, 4, 12); p(-11,-14, T3, 4, 1);
    p(-12,  0, CO, 6,  5); p(-11,  1, T2, 4,  3); p(-11, 1, T4, 4, 1);
    p(  6,-15, CO, 6, 14); p(  7,-14, T1, 4, 12); p(  7,-14, T3, 4, 1);
    p(  6,  0, CO, 6,  5); p(  7,  1, T2, 4,  3); p(  7, 1, T4, 4, 1);

    // ── HOLY GREATSWORD, held point-down in front
    p(-3, -8, CO, 7, 34); p(-2, -7, T2, 5, 32); p(-2, -7, T4, 5, 1);             // blade
    p(-1, -7, T3, 3, 30);                                                        // fuller light
    p(-2, 26, CO, 5,  4); p(-1, 27, T3, 3, 2);                                   // point
    p(-7,-12, CO, 15, 5); p(-6,-11, G2, 13, 3); p(-6,-11, G4, 13, 1);            // crossguard
    p(-2,-18, CO,  5, 7); p(-1,-17, G1, 3, 5);                                   // grip
    p(-3,-23, CO,  7, 6); p(-2,-22, G3, 5, 4); p(-2,-22, G4, 5, 1);              // pommel
    glow(-2, -7, T4, 5, 1, 0.35 + ep * 0.26);
    glow(-6,-11, G4, 13, 1, 0.40 + ep * 0.28);

    // ── NECK + GREAT HELM
    p(-2,-25, CO, 4, 3); p(-1,-24, K0, 2, 2);
    p(-7,-38, CO, 14, 15); p(-6,-37, T0, 12, 13); p(-5,-37, T1, 10, 12);
    p(-6,-37, T4, 12,  1);                                                       // top highlight
    p( 4,-36, T0,  2, 11);
    p(-6,-32, CO, 12,  3); p(-5,-31, K0, 10, 1);
    p(-5,-31, isAtk ? G4 : G3, 10, 1);                                           // visor slit
    glow(-5,-31, G4, 10, 1, 0.40 + ep * 0.28);
    p(-7,-39, CO, 14, 2); p(-6,-38, G2, 12, 1);

    // ── SCALES HALO floating over the helm
    p(-1,-46, CO, 3, 5); p( 0,-45, G2, 1, 3);                                    // post
    p(-9,-48, CO, 19, 3); p(-8,-47, G2, 17, 1); p(-8,-47, G4, 17, 1);            // beam
    pChain(p, -8, -46, -8, -43, 2, G1, G3);
    pChain(p,  8, -46,  8, -43, 2, G1, G3);
    p(-11,-42 + tilt, CO, 7, 3); p(-10,-41 + tilt, G2, 5, 2); p(-10,-41 + tilt, G4, 5, 1);
    p(  5,-42 - tilt, CO, 7, 3); p(  6,-41 - tilt, G2, 5, 2); p(  6,-41 - tilt, G4, 5, 1);
    glow(-8,-47, G4, 17, 1, 0.45 + ep * 0.30);
    glow(-10,-41 + tilt, G4, 5, 1, 0.35 + ep * 0.25);
    glow(  6,-41 - tilt, G4, 5, 1, 0.35 + ep * 0.25);

    if (isAtk) {
        glow(-8,-47, G4, 17, 3, 0.65);
        glow(-2, -7, T4,  5, 32, 0.35);
    }
}

window.drawMidas = drawMidas;
window.drawIllusion = drawIllusion;
window.drawPhilosopher = drawPhilosopher;
window.drawReflection = drawReflection;
window.drawFlameMaster = drawFlameMaster;
window.drawVajrapani = drawVajrapani;
window.drawGrandSealer = drawGrandSealer;
window.drawSaint = drawSaint;
window.drawAbyssalKiller = drawAbyssalKiller;
window.drawSpatialSlasher = drawSpatialSlasher;
window.drawWraithLord = drawWraithLord;
window.drawCursedShaman = drawCursedShaman;
window.drawRampart = drawRampart;
window.drawJudgment = drawJudgment;
