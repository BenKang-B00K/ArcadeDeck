/* enemies_pix_demon.js — Demon (악마) — the pit-born, plus the gold phantom
 * Pixel art draw functions. See enemies_pix_core.js for the sprite standard. */

/**
 * --- CHAIN ENFORCER (heavy) ---
 * 사슬 형벌자: A brute that was bound and never released — the chains have been
 * on long enough to sink into the flesh, and rage glows out through the cracks
 * they made. Hunched, top-heavy and asymmetric: one pauldron intact, the other
 * shattered with the chain torn free and swinging. Nearly monochrome, so the
 * red seams and eyes are the only colour and carry all the read.
 */
function drawChainEnforcer(cx, cy, enemy) {
    const now = Date.now();
    const S   = 2.0;
    const pulse  = (Math.sin(now * 0.004) + 1) / 2;
    const rage   = (Math.sin(now * 0.009) + 1) / 2;
    const chainT = now * 0.002;
    const heave  = Math.sin(now * 0.0024) * 1.5;
    const p  = (ox, oy, col, w = 1, h = 1) => pEnemy(ctx, cx, cy + heave, ox, oy, col, w, h, S);
    const pg = (ox, oy, col, w = 1, h = 1) => pEnemyGlow(ctx, cx, cy + heave, ox, oy, col, w, h, S);

    const CO = '#000000', VOID = '#000005';
    const B1 = '#070707', B2 = '#111111', B3 = '#1C1C1C', B4 = '#2A2A2A', B5 = '#3A3A3A';
    const HL = '#4E4E56';
    const C1 = '#161616', C2 = '#2E2E2E', C3 = '#4C4C4C', C4 = '#767676';   // iron
    const BONE = '#D8C0A8', BONEH = '#F2E6D2';
    const RAGE  = `rgba(210,25,0,${0.60 + rage * 0.40})`;
    const RAGEH = `rgba(255,150,40,${0.65 + rage * 0.35})`;
    const EG    = `rgba(255,70,0,${0.80 + pulse * 0.20})`;
    const EGH   = `rgba(255,225,170,${0.85 + pulse * 0.15})`;

    ctx.save();
    ctx.globalAlpha = 0.97;

    // ── RAGE AURA — dim; this thing smoulders rather than burns ───────────
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.10 + rage * 0.12;
    const ar = (30 + rage * 5) * S;
    const ag = ctx.createRadialGradient(cx, cy + 2 * S, 0, cx, cy + 2 * S, ar);
    ag.addColorStop(0, 'rgba(200,30,0,0.70)');
    ag.addColorStop(0.55, 'rgba(90,10,0,0.24)');
    ag.addColorStop(1, 'transparent');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.arc(cx, cy + 2 * S, ar, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // ── TORSO — top-heavy slab, wider at the chest than the hips ──────────
    const BODY = [
        [ -4, -17, 35, 5], [  1, -18, 37, 6], [  7, -17, 35, 5],
        [ 12, -15, 31, 5], [ 17, -13, 27, 5],
    ];
    for (const [oy, ox, w, h] of BODY) p(ox - 1, oy, CO, w + 2, h);
    for (const { col, ix, iy } of [
        { col: B1, ix: 0, iy: 0 }, { col: B2, ix: 2, iy: 2 },
        { col: B3, ix: 5, iy: 5 }, { col: B4, ix: 9, iy: 8 }, { col: B5, ix: 13, iy: 12 },
    ]) {
        for (const [oy, ox, w, h] of BODY) {
            if (oy < -4 + iy || oy + h > 22 - iy) continue;
            const li = Math.max(0, ix - 2), ri = ix + 2;
            const nw = w - li - ri;
            if (nw > 0) p(ox + li, oy, col, nw, h);
        }
    }
    p(-16, -4, HL, 33, 1);                                  // top highlight
    p(-12, -3, B5, 22, 1);
    p(-8, 4, B1, 16, 1); p(-8, 10, B1, 16, 1);              // pectoral / rib seams

    // ── RAGE SEAMS — the chains cut in, and it glows out ──────────────────
    ctx.save();
    ctx.globalAlpha = 0.55 + rage * 0.40;
    pg(-15, 1, RAGE, 2, 16); pg(12, 3, RAGE, 2, 13);
    pg( -2, -2, RAGE, 2, 15);
    pg(-10, 7, RAGE, 7, 1); pg( 5, 12, RAGE, 7, 1);
    pg(-14, 4, RAGEH, 1, 9); pg(13, 6, RAGEH, 1, 7);
    ctx.restore();

    // ── CHAINS — wrap the torso, sag between anchor points ────────────────
    ctx.save();
    for (let i = 0; i < 4; i++) {
        const cy2 = -1 + i * 6;
        const cw  = 36 - i * 3;
        const shift = Math.round(Math.sin(chainT + i * 0.8));
        ctx.globalAlpha = 0.78 + 0.18 * Math.sin(chainT + i);
        for (let j = 0; j < cw; j += 4) {
            const lx = -(cw >> 1) + j + shift;
            const sag = Math.round(Math.sin((j / cw) * Math.PI) * 2);   // hangs, not straight
            p(lx, cy2 + sag, CO, 4, 3);
            p(lx + 1, cy2 + sag + 1, C2, 2, 2);
            p(lx + 1, cy2 + sag, C4, 1, 1);                 // top-left link specular
        }
    }
    ctx.restore();

    // ── PAULDRONS — left intact, right shattered open ─────────────────────
    p(-24, -8, CO, 9, 11); p(-23, -7, B2, 7, 9); p(-22, -6, B4, 4, 6);
    p(-23, -7, HL, 7, 1);
    p(-25, -10, CO, 3, 4); p(-24, -9, B3, 1, 3);            // spike
    p( 15, -6, CO, 9, 9);  p( 16, -5, B2, 7, 5); p( 17, -4, B4, 4, 3);
    p( 16, -5, HL, 7, 1);
    p( 18, -1, VOID, 5, 4);                                 // torn open
    p( 19,  0, BONE, 1, 3); p( 21, 0, BONE, 1, 2);          // bone through the gap
    ctx.save(); ctx.globalAlpha = 0.6 + rage * 0.4;
    pg( 18, 1, RAGE, 4, 2);
    ctx.restore();

    // ── ARMS — heavy, knuckles near the ground ────────────────────────────
    p(-25, 3, CO, 8, 17); p(-24, 4, B2, 6, 15); p(-24, 4, B4, 3, 9);
    p(-24, 4, HL, 6, 1);
    p(-26, 20, CO, 10, 8); p(-25, 21, B3, 8, 6); p(-24, 22, B4, 4, 3);
    p( 17, 5, CO, 8, 17); p( 18, 6, B2, 6, 15); p( 18, 6, B4, 3, 9);
    p( 18, 6, HL, 6, 1);
    p( 16, 22, CO, 10, 8); p( 17, 23, B3, 8, 6); p( 19, 24, B4, 4, 3);
    // Manacles, still locked on
    p(-25, 15, C1, 8, 3); p(-25, 15, C3, 8, 1);
    p( 17, 17, C1, 8, 3); p( 17, 17, C3, 8, 1);

    // ── NECK — chain sunk to the bone ─────────────────────────────────────
    p(-7, -9, CO, 15, 5);
    p(-6, -8, B2, 13, 3);
    p(-6, -7, BONE, 13, 1);
    ctx.save(); ctx.globalAlpha = 0.5 + rage * 0.4;
    pg(-6, -6, RAGE, 13, 1);
    ctx.restore();

    // ── SKULL — broad, heavy brow, jaw jutting forward ────────────────────
    const HEAD = [
        [-30, -8, 17, 2], [-28, -10, 21, 3], [-25, -12, 25, 5],
        [-20, -12, 25, 5], [-15, -10, 21, 4], [-11, -8, 17, 2],
    ];
    for (const [oy, ox, w, h] of HEAD) p(ox - 1, oy, CO, w + 2, h);
    for (const { col, ix, iy } of [
        { col: B1, ix: 0, iy: 0 }, { col: B2, ix: 2, iy: 1 },
        { col: B3, ix: 4, iy: 4 }, { col: B4, ix: 7, iy: 7 }, { col: B5, ix: 9, iy: 10 },
    ]) {
        for (const [oy, ox, w, h] of HEAD) {
            if (oy < -30 + iy || oy + h > -9 - iy) continue;
            const li = Math.max(0, ix - 1), ri = ix + 1;
            const nw = w - li - ri;
            if (nw > 0) p(ox + li, oy, col, nw, h);
        }
    }
    p(-10, -28, HL, 21, 1);                                 // top highlight
    p(-6, -27, B5, 12, 1);

    // ── BROW — one heavy slab, casting the sockets into shadow ────────────
    p(-12, -22, CO, 25, 3);
    p(-11, -21, B1, 23, 2);
    p(-11, -22, B4, 6, 1); p( 6, -22, B4, 6, 1);

    // ── EYES — furnace slits, not circles ─────────────────────────────────
    p(-11, -19, CO, 9, 5); p( 3, -19, CO, 9, 5);
    p(-10, -18, VOID, 7, 3); p( 4, -18, VOID, 7, 3);
    pg(-9, -17, EG, 5, 1); pg( 5, -17, EG, 5, 1);
    pg(-8, -17, EGH, 1, 1); pg( 7, -17, EGH, 1, 1);

    // ── MAW — clamped shut on bone, straining ─────────────────────────────
    p(-8, -14, CO, 17, 1);
    p(-8, -13, VOID, 17, 4);
    for (let i = 0; i < 6; i++) p(-7 + i * 3, -13, BONE, 1, 2);
    for (let i = 0; i < 5; i++) p(-6 + i * 3, -11, BONE, 1, 2);
    p(-7, -13, BONEH, 1, 1);
    p(-8, -9, CO, 17, 1);
    // A chain through the jaw
    ctx.save(); ctx.globalAlpha = 0.85;
    for (let j = 0; j < 20; j += 4) { p(-9 + j, -11, CO, 4, 3); p(-8 + j, -10, C2, 2, 1); }
    ctx.restore();

    // ── LEGS — squat, planted, manacled ───────────────────────────────────
    p(-15, 22, CO, 12, 13); p( 3, 22, CO, 12, 13);
    p(-14, 23, B2, 10, 11); p( 4, 23, B2, 10, 11);
    p(-12, 24, B3,  6,  9); p( 6, 24, B3,  6,  9);
    p(-14, 23, HL, 10,  1); p( 4, 23, HL, 10,  1);
    p(-15, 29, C1, 12, 3); p( 3, 29, C1, 12, 3);
    p(-15, 29, C3, 12, 1); p( 3, 29, C3, 12, 1);
    p(-17, 35, CO, 14, 4); p( 3, 35, CO, 14, 4);            // splayed feet
    p(-16, 36, B2, 12, 2); p( 4, 36, B2, 12, 2);

    // ── TORN CHAIN dangling from the shattered pauldron ───────────────────
    ctx.save();
    ctx.globalAlpha = 0.8;
    for (let k = 0; k < 5; k++) {
        const dx = 25 + Math.round(Math.sin(chainT * 1.4 + k * 0.6) * 2);
        const dy = 2 + k * 4;
        p(dx, dy, CO, 4, 3); p(dx + 1, dy + 1, C2, 2, 1); p(dx + 1, dy, C4, 1, 1);
    }
    ctx.restore();

    ctx.restore();
}

/**
 * --- LAVA FURY (lava) ---
 * 불타는 분노: A soul wholly consumed by rage — agile lava demon whose body
 * ruptures open revealing a molten interior; leaps when struck by cold.
 */
function drawLavaFury(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.008) + 1) / 2;
    const floatY = Math.sin(now * 0.005) * 2;
    const emberT = now * 0.010;
    const p  = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);
    const pg = (ox, oy, col, w=1, h=1) => pEnemyGlow(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO='#000';
    const S1='#100500', S2='#1E0A00', S3='#2E1000', S4='#3E1800', HL='#502000', HV='#702A00';
    const BN='#D8C8B8', BNH='#F0E0D0';                                             // pale skull bone
    const LV  = `rgba(255,80,0,${0.75+pulse*0.25})`;
    const LV2 = `rgba(255,160,0,${0.60+pulse*0.35})`;
    const LV3 = `rgba(255,220,0,${0.40+pulse*0.50})`;
    const LVW = `rgba(255,255,200,0.95)`;
    const CR  = `rgba(255,80,0,${0.65+pulse*0.30})`;
    const EG  = `rgba(255,140,0,${0.85+pulse*0.15})`;
    const EGH = `rgba(255,220,140,0.95)`;
    const VOID= '#000005';
    const gA  = 0.94;

    ctx.save(); ctx.globalAlpha = gA;

    // ── HEAT HAZE — radial, not a flat rect. The old 36x50 block of LV showed
    //    as a visible orange rectangle behind the sprite. ─────────────────
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.15 + pulse * 0.14;
    const _ar = (26 + pulse * 6) * S;
    const _ag = ctx.createRadialGradient(cx, cy, 0, cx, cy, _ar);
    _ag.addColorStop(0, 'rgba(255,110,0,0.80)');
    _ag.addColorStop(0.5, 'rgba(180,40,0,0.28)');
    _ag.addColorStop(1, 'transparent');
    ctx.fillStyle = _ag;
    ctx.beginPath(); ctx.arc(cx, cy, _ar, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // ── DRIFTING EMBER PARTICLES (3 rising)
    for (let i = 0; i < 3; i++) {
        const ex = -10 + i * 8;
        const ey = -26 - ((emberT * 3 + i * 6) % 14);
        ctx.save(); ctx.globalAlpha = 0.65 - i * 0.15;
        pEnemyGlow(ctx, cx, cy + floatY * S, ex, ey, LV2, 1, 2, S);
        pEnemyGlow(ctx, cx, cy + floatY * S, ex, ey-2, LV3, 1, 1, S);
        ctx.restore();
    }

    // ── HEAD — charred skull: narrow crown, heavy jaw ─────────────────────
    const _HEAD = [
        [-25, -5, 11, 2], [-23, -7, 15, 2], [-21, -8, 17, 4],
        [-17, -8, 17, 4], [-13, -7, 15, 3], [-10, -5, 11, 2],
    ];
    for (const [oy, ox, w, h] of _HEAD) p(ox - 1, oy, CO, w + 2, h);
    for (const _r of [{c:S1,i:0,j:0},{c:S2,i:1,j:1},{c:S3,i:3,j:3},{c:S4,i:5,j:5},{c:HL,i:6,j:7}]) {
        for (const [oy, ox, w, h] of _HEAD) {
            if (oy < -25 + _r.j || oy + h > -8 - _r.j) continue;
            const li = Math.max(0, _r.i - 1), nw = w - li - (_r.i + 1);
            if (nw > 0) p(ox + li, oy, _r.c, nw, h);
        }
    }
    p(-7,-23,HV,15,1);                                                            // top highlight
    p(-4,-22,HL, 8,1);

    // ── EXPOSED PALE SKULL through skin cracks (no blood — pale bone)
    p(-2,-22,VOID,3,4);                                                           // forehead crack
    p(-2,-22,BN,1,4);
    p( 5,-18,VOID,2,4);                                                           // R cheek crack
    p( 5,-18,BN,1,4);
    // Lava streaks through cracks
    ctx.save(); ctx.globalAlpha = 0.65 + pulse * 0.35;
    pg(-6,-20,CR,1,10); pg( 2,-18,CR,1,8); pg(-1,-22,CR,2,5);
    pg(-5,-19,LV,1,7); pg( 3,-17,LV,1,6); pg(-1,-21,LV2,1,3);
    ctx.restore();

    // ── HOLLOW BURNING EYE SOCKETS (deep void + ember pinpoint)
    p(-7,-17,CO,5,4); p( 2,-17,CO,5,4);
    p(-6,-16,VOID,3,2); p( 3,-16,VOID,3,2);
    pg(-5,-15,EG,2,1); pg( 4,-15,EG,2,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemyGlow(ctx, cx, cy + floatY * S,-5,-15, EGH,1,1,S);
    pEnemyGlow(ctx, cx, cy + floatY * S, 4,-15, EGH,1,1,S);
    ctx.restore();
    // Outer eye-burn aura
    ctx.save(); ctx.globalAlpha = 0.65;
    pg(-8,-18,LV,6,5); pg( 1,-18,LV,6,5);
    ctx.restore();

    // ── AGONY-SCREAM VOID MOUTH (gaping, pale bone fangs)
    p(-5,-12,CO,10,5); p(-4,-11,VOID,8,3);
    p(-4,-11,BN,1,3); p(-2,-11,BN,1,3); p( 0,-11,BN,1,3); p( 2,-11,BN,1,3); p( 4,-11,BN,1,3);
    p(-4,-11,BNH,1,1); p( 0,-11,BNH,1,1); p( 4,-11,BNH,1,1);

    // ── HUNCHED BODY — shoulders forward, waist narrow ────────────────────
    const _BODY = [
        [-8, -12, 25, 5], [-3, -13, 27, 6], [ 3, -12, 25, 5],
        [ 8, -11, 22, 5], [13, -9, 18, 4],
    ];
    for (const [oy, ox, w, h] of _BODY) p(ox - 1, oy, CO, w + 2, h);
    for (const _r of [{c:S1,i:0,j:0},{c:S2,i:2,j:2},{c:S3,i:4,j:4},{c:S4,i:7,j:7},{c:HL,i:9,j:10}]) {
        for (const [oy, ox, w, h] of _BODY) {
            if (oy < -8 + _r.j || oy + h > 17 - _r.j) continue;
            const li = Math.max(0, _r.i - 2), nw = w - li - (_r.i + 2);
            if (nw > 0) p(ox + li, oy, _r.c, nw, h);
        }
    }
    p(-12,-8,HV,24,1);                                                            // top highlight
    p(-8,-7,HL,16,1);

    // ── MORE LAVA CRACKS REVEALING FIRE INTERIOR
    ctx.save(); ctx.globalAlpha = 0.70 + pulse * 0.30;
    pg(-11,-4,CR,2,16); pg(-11,-4,LV,1,14);
    pg( 7,-2,CR,2,12); pg( 7,-2,LV,1,10);
    pg(-4,-6,CR,2,10); pg(-3,-6,LV,1,8); pg(-4,-6,LV2,1,4); pg(-2,-5,LV3,1,2);
    pg(-8,5,CR,1,8); pg( 4,7,CR,1,6);                                               // extra cracks
    pg(-3,10,LV,2,1);                                                              // horizontal crack
    ctx.restore();
    // Bright lava core pinpoints (focal hot spots)
    ctx.save(); ctx.globalAlpha = 0.85;
    pEnemyGlow(ctx, cx, cy + floatY * S,-10,2, LVW,1,1,S);
    pEnemyGlow(ctx, cx, cy + floatY * S, 8,4, LVW,1,1,S);
    pEnemyGlow(ctx, cx, cy + floatY * S,-3,0, LVW,1,1,S);
    ctx.restore();

    // ── CLAWED ARMS (bone claws + lava tips)
    p(-18,-4,CO,6,6); p(-17,-3,S2,4,5); p(-16,-2,S4,2,3);
    p( 12,-4,CO,6,6); p( 13,-3,S2,4,5); p( 14,-2,S4,2,3);
    // Bone-claw tips
    p(-19,-4,CO,3,4); p(-18,-3,BN,1,3);
    p( 16,-4,CO,3,4); p( 17,-3,BN,1,3);
    p(-20,-2,CO,2,2); p(-19,-1,BN,1,1);                                           // extra claw L
    p( 18,-2,CO,2,2); p( 18,-1,BN,1,1);                                           // extra claw R
    // Lava drip from claws
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.35;
    pg(-19,-4,LV,3,5); pg(16,-4,LV,3,5);
    pg(-19,2,LV,1,2); pg(17,2,LV,1,2);                                              // drips
    ctx.restore();

    // ── LEGS (charred + lava-glowing knee cracks)
    p(-10,17,CO,8,10); p( 2,17,CO,8,10);
    p(-9,18,S2,6,8); p( 3,18,S2,6,8);
    p(-8,19,S3,3,6); p( 4,19,S3,3,6);
    ctx.save(); ctx.globalAlpha = 0.60 + pulse * 0.40;
    pg(-9,24,LV,6,3); pg( 3,24,LV,6,3);
    pg(-7,20,CR,1,5); pg( 5,20,CR,1,5);                                             // knee crack glow
    ctx.restore();

    // ── LONGER CHARRED EMBER TAILS (3 streaming back)
    ctx.save(); ctx.globalAlpha = 0.65;
    p(-8,27,CO,2,5); pg(-7,30,CR,1,3);
    p( 6,27,CO,2,5); pg( 7,30,CR,1,3);
    p(-1,28,CO,2,5); pg( 0,31,LV,1,3);
    ctx.restore();

    ctx.restore();
}

/**
 * --- PAIN REGENERATOR (burning) ---
 * 고통의 재생자: A body that will not stop repairing itself. Its whole read is
 * WOUNDS AT DIFFERENT STAGES — a fresh red gash, one knitting shut, one already
 * a pale seam — with sickly green regrowth crawling along each. Kept that idea
 * from the previous version but the head and torso were concentric rectangles;
 * the silhouette is now lumpy and mismatched, as if the healing never set right.
 * The green routes through pEnemyGlow so the regrowth is the only thing blooming
 * against otherwise matte, raw flesh.
 */
function drawPainRegenerator(cx, cy, enemy) {
    const now = Date.now();
    const S   = 2.0;
    const pulse  = (Math.sin(now * 0.004) + 1) / 2;
    const regenP = (Math.sin(now * 0.006) + 1) / 2;
    const knit   = (now * 0.0014) % 1;                      // travels along each seam
    const floatY = Math.sin(now * 0.003) * 2;
    const p  = (ox, oy, col, w = 1, h = 1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);
    const pg = (ox, oy, col, w = 1, h = 1) => pEnemyGlow(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO = '#000000', VOID = '#000005';
    const R1 = '#0A0000', R2 = '#1A0200', R3 = '#2C0500', R4 = '#440A02', R5 = '#601408';
    const HL = '#7E2418';
    const WD = '#6B0000', WL = '#B22222';                   // wound deep / fresh
    const SC = '#C8A898';                                   // pale healed scar
    const BONE = '#D8C0A8';
    const RE   = `rgba(0,235,90,${0.60 + regenP * 0.40})`;
    const RE2  = `rgba(190,255,100,${0.45 + regenP * 0.55})`;
    const EG   = `rgba(255,60,0,${0.80 + pulse * 0.20})`;
    const EGH  = `rgba(255,210,140,${0.88 + pulse * 0.12})`;

    ctx.save();
    ctx.globalAlpha = 0.93 + pulse * 0.05;

    // ── REGEN AURA — sickly green, not the usual hellfire ─────────────────
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.08 + regenP * 0.13;
    const ar = (27 + regenP * 5) * S;
    const ag = ctx.createRadialGradient(cx, cy + 2 * S, 0, cx, cy + 2 * S, ar);
    ag.addColorStop(0, 'rgba(0,220,90,0.60)');
    ag.addColorStop(0.5, 'rgba(0,90,40,0.22)');
    ag.addColorStop(1, 'transparent');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.arc(cx, cy + 2 * S, ar, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    /** A wound: raw channel, then regrowth knitting along it. */
    const seam = (x, y, len, stage, vertical) => {
        // stage 0 = fresh, 1 = healed
        const raw = stage < 0.4 ? WL : (stage < 0.8 ? WD : SC);
        if (vertical) p(x, y, CO, 4, len + 2); else p(x, y, CO, len + 2, 4);
        if (vertical) p(x + 1, y + 1, raw, 2, len); else p(x + 1, y + 1, raw, len, 2);
        ctx.save();
        ctx.globalAlpha = (0.35 + (1 - stage) * 0.35) + regenP * 0.30;
        const grown = Math.round(len * ((knit + stage) % 1));
        if (vertical) { pg(x + 1, y + 1, RE, 2, grown); pg(x + 1, y + 1, RE2, 1, Math.max(1, grown - 2)); }
        else          { pg(x + 1, y + 1, RE, grown, 2); pg(x + 1, y + 1, RE2, Math.max(1, grown - 2), 1); }
        ctx.restore();
        // Sutures across the channel
        ctx.save(); ctx.globalAlpha = 0.55;
        for (let i = 2; i < len; i += 3) {
            if (vertical) p(x, y + i, SC, 4, 1); else p(x + i, y, SC, 1, 4);
        }
        ctx.restore();
    };

    // ── HEAD — lopsided; the left side healed bigger than the right ───────
    const HEAD = [
        [-27, -7, 15, 2], [-25, -9, 19, 3], [-22, -10, 20, 5],
        [-17, -10, 19, 5], [-12, -8, 16, 3],
    ];
    for (const [oy, ox, w, h] of HEAD) p(ox - 1, oy, CO, w + 2, h);
    for (const { col, ix, iy } of [
        { col: R1, ix: 0, iy: 0 }, { col: R2, ix: 1, iy: 1 },
        { col: R3, ix: 3, iy: 3 }, { col: R4, ix: 5, iy: 6 }, { col: R5, ix: 7, iy: 9 },
    ]) {
        for (const [oy, ox, w, h] of HEAD) {
            if (oy < -27 + iy || oy + h > -9 - iy) continue;
            const li = Math.max(0, ix - 2), ri = ix;       // lit core sits left
            const nw = w - li - ri;
            if (nw > 0) p(ox + li, oy, col, nw, h);
        }
    }
    p(-9, -25, HL, 19, 1);                                  // top highlight
    p(-6, -24, R5, 11, 1);

    // ── FACE SEAM — the oldest one, nearly closed ─────────────────────────
    seam(-8, -22, 11, 0.85, true);

    // ── EYE SOCKETS ───────────────────────────────────────────────────────
    p(-8, -20, CO, 6, 4); p( 3, -20, CO, 6, 4);
    p(-7, -19, VOID, 4, 2); p( 4, -19, VOID, 4, 2);
    pg(-6, -19, EG, 2, 1); pg( 5, -19, EG, 2, 1);
    pg(-6, -19, EGH, 1, 1); pg( 6, -19, EGH, 1, 1);

    // ── MAW — sutured half shut, still screaming through it ───────────────
    p(-7, -14, CO, 15, 1);
    p(-7, -13, VOID, 15, 5);
    for (let i = 0; i < 5; i++) p(-6 + i * 3, -13, BONE, 1, 3);
    p(-7,  -8, CO, 15, 1);
    ctx.save(); ctx.globalAlpha = 0.60 + regenP * 0.36;
    pg(-6, -11, RE, 13, 1);                                 // regrowth stitching the jaw shut
    ctx.restore();
    for (let i = 0; i < 5; i++) p(-6 + i * 3, -12, SC, 1, 3);

    // ── TORSO — mismatched halves, one shoulder healed larger ─────────────
    const BODY = [
        [-7, -15, 30, 5], [-2, -17, 33, 6], [ 4, -16, 31, 6],
        [10, -14, 27, 5], [15, -12, 23, 5],
    ];
    for (const [oy, ox, w, h] of BODY) p(ox - 1, oy, CO, w + 2, h);
    for (const { col, ix, iy } of [
        { col: R1, ix: 0, iy: 0 }, { col: R2, ix: 2, iy: 1 },
        { col: R3, ix: 5, iy: 4 }, { col: R4, ix: 8, iy: 8 }, { col: R5, ix: 11, iy: 12 },
    ]) {
        for (const [oy, ox, w, h] of BODY) {
            if (oy < -7 + iy || oy + h > 20 - iy) continue;
            const li = Math.max(0, ix - 2), ri = ix + 2;
            const nw = w - li - ri;
            if (nw > 0) p(ox + li, oy, col, nw, h);
        }
    }
    p(-14, -7, HL, 29, 1);                                  // top highlight
    p(-10, -6, R5, 18, 1);

    // ── THREE WOUNDS, THREE STAGES — the whole point of the sprite ────────
    seam(-14, -4, 16, 0.90, true);                          // oldest, pale seam
    seam( -3, -5, 20, 0.45, true);                          // knitting
    seam(  9, -3, 14, 0.05, true);                          // fresh, still red
    seam( -9, 11, 14, 0.65, false);                         // healing across the gut

    // ── EXPOSED RIB in the fresh wound ────────────────────────────────────
    p(10, 2, BONE, 1, 5); p(10, 8, BONE, 1, 3);

    // ── ARMS — the left one is thicker; it has healed more times ──────────
    p(-22, -4, CO, 8, 15); p(-21, -3, R2, 6, 13); p(-21, -3, R4, 3, 8);
    p(-21, -3, HL, 6, 1);
    p(-23, 11, CO, 9, 6); p(-22, 12, R3, 7, 4);
    p( 15, -2, CO, 7, 14); p( 16, -1, R2, 5, 12); p( 16, -1, R4, 2, 7);
    p( 16, -1, HL, 5, 1);
    p( 15, 12, CO, 8, 6); p( 16, 13, R3, 6, 4);
    seam(-21, 0, 9, 0.30, true);
    seam( 16, 2, 8, 0.75, true);

    // ── LEGS ──────────────────────────────────────────────────────────────
    p(-13, 20, CO, 11, 13); p( 3, 20, CO, 11, 13);
    p(-12, 21, R2,  9, 11); p( 4, 21, R2,  9, 11);
    p(-11, 22, R3,  5,  9); p( 6, 22, R3,  5,  9);
    p(-12, 21, HL,  9,  1); p( 4, 21, HL,  9,  1);
    p(-14, 33, CO, 12, 4); p( 3, 33, CO, 12, 4);
    p(-13, 34, R2, 10, 2); p( 4, 34, R2, 10, 2);
    seam(-11, 24, 7, 0.20, true);
    seam(  6, 24, 7, 0.55, true);

    ctx.restore();
}

/**
 * --- ABYSSAL ACOLYTE (abyssal_acolyte) ---
 * 심연의 시종: A servant of the deep in a gold-trimmed vestment, hands replaced
 * by four boneless arms that reach ahead of it. The old version drew the robe as
 * one 52-tall rectangle; it now narrows at the shoulders and flares to a hem
 * that drags, with vertical folds so it reads as cloth. Gold trim is the only
 * warm colour on an otherwise black sprite, which is what keeps it legible.
 */
function drawAbyssalAcolyte(cx, cy, enemy) {
    const now = Date.now();
    const S   = 2.0;
    const pulse  = (Math.sin(now * 0.003) + 1) / 2;
    const tentT  = now * 0.002;
    const floatY = Math.sin(now * 0.002) * 3;
    const p  = (ox, oy, col, w = 1, h = 1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);
    const pg = (ox, oy, col, w = 1, h = 1) => pEnemyGlow(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO = '#000000', VOID = '#000005';
    const D1 = '#040409', D2 = '#0A0A16', D3 = '#121226', D4 = '#1B1B3A', D5 = '#262652';
    const HL = '#383870';
    const G1 = '#2A1C00', G2 = '#4A3200', G3 = '#7A5400', G4 = '#B88400', G5 = '#F0C24A';
    const EG  = `rgba(205,0,255,${0.80 + pulse * 0.20})`;
    const EGH = `rgba(240,205,255,${0.85 + pulse * 0.15})`;
    const TE  = `rgba(28,0,58,${0.75 + pulse * 0.25})`;
    const TS  = `rgba(95,0,175,${0.55 + pulse * 0.40})`;

    ctx.save();
    ctx.globalAlpha = 0.95;

    // ── ABYSS AURA ────────────────────────────────────────────────────────
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.11 + pulse * 0.14;
    const ar = (30 + pulse * 6) * S;
    const ag = ctx.createRadialGradient(cx, cy - 4 * S, 0, cx, cy - 4 * S, ar);
    ag.addColorStop(0, 'rgba(110,0,190,0.65)');
    ag.addColorStop(0.55, 'rgba(40,0,80,0.24)');
    ag.addColorStop(1, 'transparent');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.arc(cx, cy - 4 * S, ar, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // ── FOUR BONELESS ARMS — drawn behind the robe, tapering to claws ─────
    ctx.save();
    const ARMS = [
        { sx: -9, sy: -6, reach: -22, ph: 0.0, seg: 6 },
        { sx: -9, sy:  2, reach: -27, ph: 0.8, seg: 7 },
        { sx:  8, sy: -6, reach:  22, ph: 0.4, seg: 6 },
        { sx:  8, sy:  2, reach:  27, ph: 1.2, seg: 7 },
    ];
    for (let i = 0; i < ARMS.length; i++) {
        const t = ARMS[i];
        const wob = Math.sin(tentT + t.ph + i) * 4;
        const endX = t.sx + Math.sign(t.reach) * (Math.abs(t.reach) + wob);
        for (let s2 = 0; s2 < t.seg; s2++) {
            const f = s2 / t.seg;
            const sx = Math.round(t.sx + (endX - t.sx) * f);
            const sy = t.sy + s2 * 3 + Math.round(Math.sin(tentT * 1.5 + s2 + i) * 2);
            const th = 4 - Math.round(f * 2);               // tapers along its length
            ctx.globalAlpha = (0.88 - f * 0.35) * (0.70 + pulse * 0.28);
            p(sx, sy, CO, th + 1, 4);
            p(sx, sy, TE, th, 3);
            p(sx, sy, TS, 1, 2);                            // top-left highlight
        }
        ctx.globalAlpha = 0.92;
        p(endX, t.sy + t.seg * 3, CO, 4, 4);
        pg(endX + 1, t.sy + t.seg * 3 + 1, EG, 2, 2);
    }
    ctx.restore();

    // ── ROBE — narrow at the shoulders, flaring to a dragging hem ─────────
    const ROBE = [
        [-20, -8, 17, 4], [-16, -9, 19, 5], [-11, -10, 21, 6],
        [ -5, -11, 23, 6], [  1, -12, 25, 6], [  7, -14, 29, 6], [ 13, -16, 33, 5],
    ];
    for (const [oy, ox, w, h] of ROBE) p(ox - 1, oy, CO, w + 2, h);
    for (const { col, ix, iy } of [
        { col: D1, ix: 0, iy: 0 }, { col: D2, ix: 2, iy: 1 },
        { col: D3, ix: 5, iy: 4 }, { col: D4, ix: 8, iy: 8 }, { col: D5, ix: 11, iy: 12 },
    ]) {
        for (const [oy, ox, w, h] of ROBE) {
            if (oy < -20 + iy || oy + h > 18 - iy) continue;
            const li = Math.max(0, ix - 2), ri = ix + 2;
            const nw = w - li - ri;
            if (nw > 0) p(ox + li, oy, col, nw, h);
        }
    }
    p(-8, -20, HL, 17, 1);                                  // top highlight
    p(-5, -19, D5, 11, 1);
    for (const fx of [-9, -4, 1, 6]) p(fx, -14, D1, 1, 30);  // vertical folds
    for (const fx of [-13, 11]) p(fx, 5, D1, 1, 13);

    // ── GOLD TRIM — collar, centre seam, hem, shoulder bands ──────────────
    p(-9, -20, G1, 18, 2); p(-9, -20, G3, 18, 1); p(-6, -20, G5, 8, 1);
    p(-1, -18, G2, 2, 30); p(-1, -18, G4, 1, 30);
    p(-11, -12, G1, 23, 2); p(-11, -12, G3, 23, 1);
    p(-16, 16, G1, 33, 2); p(-15, 16, G3, 31, 1);
    for (let i = 0; i < 8; i++) pg(-14 + i * 4, 16, G5, 2, 1);

    // ── HOOD — peaked, deeper than the shoulders are wide ─────────────────
    const HOOD = [
        [-34, -3, 7, 2], [-32, -6, 13, 2], [-30, -8, 17, 3],
        [-27, -10, 21, 4], [-23, -11, 23, 5], [-18, -10, 21, 3],
    ];
    for (const [oy, ox, w, h] of HOOD) p(ox - 1, oy, CO, w + 2, h);
    for (const { col, ix, iy } of [
        { col: D1, ix: 0, iy: 0 }, { col: D2, ix: 2, iy: 2 }, { col: D3, ix: 4, iy: 5 },
    ]) {
        for (const [oy, ox, w, h] of HOOD) {
            if (oy < -34 + iy || oy + h > -15 - iy) continue;
            const li = Math.max(0, ix - 1), ri = ix + 1;
            const nw = w - li - ri;
            if (nw > 0) p(ox + li, oy, col, nw, h);
        }
    }
    p(-8, -30, HL, 17, 1);
    p(-5, -29, D5, 11, 1);
    p(-9, -32, G1, 3, 3); p(-9, -32, G3, 2, 2);             // gold crown studs
    p( 7, -32, G1, 3, 3); p( 7, -32, G3, 2, 2);

    // ── THE HOOD IS EMPTY ─────────────────────────────────────────────────
    p(-9, -26, VOID, 19, 11);
    p(-9, -26, CO, 19, 1);
    pg(-6, -23, EG, 3, 2); pg( 3, -23, EG, 3, 2);
    pg(-5, -23, EGH, 1, 1); pg( 4, -23, EGH, 1, 1);
    p(-2, -19, VOID, 5, 3);
    pg(-1, -18, EG, 3, 1);

    // ── SHADOW TRAIL pooling under the hem ────────────────────────────────
    ctx.save();
    for (let i = 0; i < 7; i++) {
        const tx = -14 + i * 4;
        const tl = 5 + Math.round(Math.sin(now * 0.003 + i * 0.9) * 3);
        ctx.globalAlpha = 0.60 - i * 0.03;
        p(tx, 18, D1, 3, tl);
        ctx.globalAlpha = 0.28;
        p(tx + 1, 18 + tl, VOID, 1, 3);
    }
    ctx.restore();

    ctx.restore();
}

/**
 * --- IMP (imp) ---
 * 임프: The smallest demon in the roster and the first one a player meets, so it
 * has to read at a glance: oversized torn wings, a head too big for its body,
 * and two ember eyes. Kept the previous version's vocabulary — bat wings with
 * ribs and tears, ribcage ridges, bone-spike tail — but the head and body were
 * concentric rectangles and are now tapered, and every ember routes through
 * pEnemyGlow so the eyes bloom and the charred hide stays matte.
 */
function drawImp(cx, cy, enemy) {
    const now = Date.now();
    const S   = 2.0;
    const pulse  = (Math.sin(now * 0.006) + 1) / 2;
    const wingT  = now * 0.008;
    const floatY = Math.sin(now * 0.005) * 3;
    const dustT  = now * 0.003;
    const p  = (ox, oy, col, w = 1, h = 1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);
    const pg = (ox, oy, col, w = 1, h = 1) => pEnemyGlow(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO = '#000000', VOID = '#000005';
    const I1 = '#100506', I2 = '#1E0A0C', I3 = '#2E1012', I4 = '#3F181C', I5 = '#5A2530';
    const HL = '#79394A';
    const BN = '#D8C8C0', BNH = '#F0E0D8';
    const EG  = `rgba(255,80,0,${0.85 + pulse * 0.15})`;
    const EGH = `rgba(255,205,120,${0.90 + pulse * 0.10})`;
    const WC  = `rgba(40,10,14,${0.72 + pulse * 0.24})`;
    const WCH = `rgba(86,22,32,${0.55 + pulse * 0.22})`;
    const DUST = `rgba(20,5,8,${0.50 + pulse * 0.20})`;

    ctx.save();
    ctx.globalAlpha = 0.93;

    // ── EMBER AURA — small; this is a minor demon ─────────────────────────
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.11 + pulse * 0.11;
    const ar = (18 + pulse * 4) * S;
    const ag = ctx.createRadialGradient(cx, cy - 6 * S, 0, cx, cy - 6 * S, ar);
    ag.addColorStop(0, 'rgba(255,90,0,0.70)');
    ag.addColorStop(0.5, 'rgba(120,20,0,0.24)');
    ag.addColorStop(1, 'transparent');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.arc(cx, cy - 6 * S, ar, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // ── DRIFTING SOOT ─────────────────────────────────────────────────────
    for (let i = 0; i < 3; i++) {
        const dx = -8 + i * 7;
        const dy = -16 - ((dustT * 3 + i * 5) % 14);
        ctx.save(); ctx.globalAlpha = 0.55 - i * 0.12;
        p(dx, dy, DUST, 1, 1);
        ctx.restore();
    }

    // ── TORN BAT WINGS — scalloped trailing edge, not square ──────────────
    const flap = Math.sin(wingT) * 4;
    ctx.save();
    ctx.globalAlpha *= 0.84;
    for (const side of [-1, 1]) {
        const sx = side < 0 ? -21 : 9;
        const WING = [                                      // [oy, ox, w, h]
            [-13, sx + 2, 10, 2], [-11, sx + 1, 11, 3],
            [ -8, sx,     12, 4], [ -4, sx + 1, 11, 4], [ 0, sx + 3, 8, 3],
        ];
        for (const [oy, ox, w, h] of WING) p(ox - 1, oy + flap, CO, w + 2, h);
        for (const [oy, ox, w, h] of WING) p(ox, oy + flap, WC, w, h);
        for (const [oy, ox, w, h] of WING) if (w > 4) p(ox + 2, oy + flap, I2, w - 4, h);
        for (const [oy, ox, w, h] of WING) p(ox, oy + flap, WCH, w, 1);   // top highlight
        // Ribs, fanning out from the shoulder
        for (let r = 0; r < 3; r++) {
            const rx = side < 0 ? sx + 2 + r * 3 : sx + 8 - r * 3;
            p(rx, -12 + r * 2 + flap, CO, 1, 11 - r * 2);
        }
        // Tears
        p(sx + 3, -5 + flap, VOID, 2, 2);
        p(sx + 6, -1 + flap, VOID, 2, 2);
        // Claw at the wing's leading tip
        p(side < 0 ? sx : sx + 10, -16 + flap, CO, 2, 4);
        p(side < 0 ? sx : sx + 10, -15 + flap, I3, 1, 2);
    }
    ctx.restore();

    // ── HORNS — curved back, bone-tipped, uneven ──────────────────────────
    p(-4, -20, CO, 3, 6); p(-3, -19, I3, 1, 4); p(-3, -21, CO, 2, 2); p(-3, -21, BN, 1, 1);
    p( 2, -19, CO, 3, 5); p( 3, -18, I3, 1, 3); p( 3, -20, CO, 2, 2); p( 3, -20, BN, 1, 1);

    // ── HEAD — wide cranium narrowing to a pointed chin ───────────────────
    const HEAD = [
        [-15, -5, 11, 2], [-13, -7, 15, 3], [-10, -7, 15, 4],
        [ -6, -6, 13, 3], [ -3, -4,  9, 2],
    ];
    for (const [oy, ox, w, h] of HEAD) p(ox - 1, oy, CO, w + 2, h);
    for (const { col, ix, iy } of [
        { col: I1, ix: 0, iy: 0 }, { col: I2, ix: 1, iy: 1 },
        { col: I3, ix: 3, iy: 3 }, { col: I4, ix: 5, iy: 5 },
    ]) {
        for (const [oy, ox, w, h] of HEAD) {
            if (oy < -15 + iy || oy + h > -1 - iy) continue;
            const li = Math.max(0, ix - 1), ri = ix + 1;
            const nw = w - li - ri;
            if (nw > 0) p(ox + li, oy, col, nw, h);
        }
    }
    p(-6, -13, HL, 13, 1);                                  // top highlight
    p(-3, -12, I5,  6, 1);
    p(-8, -10, CO, 2, 3); p( 7, -10, CO, 2, 3);             // pointed ears
    p(-8, -12, CO, 2, 3); p( 7, -12, CO, 2, 3);
    p(-8, -11, I3, 1, 2); p( 8, -11, I3, 1, 2);

    // ── EYE SOCKETS — hollow, with an ember at the bottom ─────────────────
    p(-6, -9, CO, 4, 4); p( 2, -9, CO, 4, 4);
    p(-5, -8, VOID, 2, 2); p( 3, -8, VOID, 2, 2);
    pg(-5, -8, EG, 2, 1); pg( 3, -8, EG, 2, 1);
    pg(-5, -8, EGH, 1, 1); pg( 4, -8, EGH, 1, 1);

    // ── GRIN — bared fangs, void behind ───────────────────────────────────
    p(-5, -4, CO, 11, 1);
    p(-5, -3, VOID, 11, 3);
    p(-4, -3, BN, 1, 2); p(-1, -3, BN, 1, 2); p( 2, -3, BN, 1, 2);
    p(-4, -3, BNH, 1, 1); p( 2, -3, BNH, 1, 1);
    p(-3, -1, BN, 1, 1); p( 1, -1, BN, 1, 1);
    p(-5,  0, CO, 11, 1);

    // ── BODY — narrow chest, pot belly, spindly ───────────────────────────
    const BODY = [
        [ 1, -6, 13, 3], [ 4, -7, 15, 4], [ 8, -6, 13, 4], [12, -5, 11, 2],
    ];
    for (const [oy, ox, w, h] of BODY) p(ox - 1, oy, CO, w + 2, h);
    for (const { col, ix, iy } of [
        { col: I1, ix: 0, iy: 0 }, { col: I2, ix: 1, iy: 1 },
        { col: I3, ix: 3, iy: 3 }, { col: I4, ix: 5, iy: 5 },
    ]) {
        for (const [oy, ox, w, h] of BODY) {
            if (oy < 1 + iy || oy + h > 14 - iy) continue;
            const li = Math.max(0, ix - 1), ri = ix + 1;
            const nw = w - li - ri;
            if (nw > 0) p(ox + li, oy, col, nw, h);
        }
    }
    p(-6, 1, HL, 13, 1);                                    // top highlight
    // Ribcage ridges
    ctx.save(); ctx.globalAlpha = 0.45;
    p(-4, 3, BN, 8, 1); p(-4, 6, BN, 8, 1); p(-3, 9, BN, 6, 1);
    ctx.restore();

    // ── ARMS — thin, clawed, held close ───────────────────────────────────
    p(-9, 2, CO, 3, 8); p(-8, 3, I2, 1, 6);
    p( 7, 2, CO, 3, 8); p( 8, 3, I2, 1, 6);
    p(-10, 9, CO, 4, 3); p( 7, 9, CO, 4, 3);
    p(-10, 12, BN, 1, 2); p(-8, 12, BN, 1, 2);
    p(  8, 12, BN, 1, 2); p(10, 12, BN, 1, 2);

    // ── TAIL — segmented, whipping, bone spike at the tip ─────────────────
    const whip = Math.sin(now * 0.006) * 2;
    ctx.save(); ctx.globalAlpha *= 0.92;
    p(-2, 14, CO, 3, 4); p(-1 + whip, 18, CO, 3, 4); p(0 + whip * 1.5, 22, CO, 2, 3);
    p(-1, 15, I3, 1, 3); p( 0 + whip, 19, I2, 1, 3);
    p( 0 + whip * 1.5, 24, CO, 3, 3); p( 1 + whip * 1.5, 25, BN, 1, 2);
    ctx.restore();

    // ── FEET — clawed, splayed ────────────────────────────────────────────
    p(-7, 14, CO, 5, 3); p( 2, 14, CO, 5, 3);
    p(-6, 15, I2, 3, 2); p( 3, 15, I2, 3, 2);
    p(-7, 17, CO, 5, 1); p( 2, 17, CO, 5, 1);
    p(-7, 18, BN, 1, 1); p(-5, 18, BN, 1, 1); p(-3, 18, BN, 1, 1);
    p( 2, 18, BN, 1, 1); p( 4, 18, BN, 1, 1); p( 6, 18, BN, 1, 1);

    ctx.restore();
}

/**
 * --- HELLSPAWN (hellspawn) ---
 * 지옥의 자식: A young demon still growing into its horns, which are already too
 * big for its skull and have cracked under their own weight. Black hair hangs
 * behind them; the skin is splitting along glowing seams as whatever is inside
 * outgrows it. Kept the previous version's vocabulary — curved horns, trailing
 * hair, void cracks, bared fangs, bone claws — but the head and body were
 * concentric rectangles and are now tapered, and the glow routes through
 * pEnemyGlow so the cracks bloom and the hide stays matte.
 */
function drawHellspawn(cx, cy, enemy) {
    const now = Date.now();
    const S   = 2.0;
    const pulse  = (Math.sin(now * 0.005) + 1) / 2;
    const floatY = Math.sin(now * 0.004) * 2;
    const hairF  = Math.sin(now * 0.003);
    const crackT = (Math.sin(now * 0.006) + 1) / 2;
    const p  = (ox, oy, col, w = 1, h = 1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);
    const pg = (ox, oy, col, w = 1, h = 1) => pEnemyGlow(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO = '#000000', VOID = '#000005';
    const H1 = '#0E0608', H2 = '#1C0C10', H3 = '#2A1018', H4 = '#3C1620', H5 = '#54202E';
    const HL = '#74303F';
    const HN = '#1A0508', HH = '#2C0C12', HW = '#4A1A24';   // horn — kept darker than
    // the hide, or the rim light turns two 2px columns into bright pink bars
    const BN = '#D8C8C0', BNH = '#F0E0D8';
    const HR = '#08000A';                                   // hair
    const EG    = `rgba(255,140,0,${0.85 + pulse * 0.15})`;
    const EGH   = `rgba(255,225,150,${0.90 + pulse * 0.10})`;
    const CRACK = `rgba(215,55,20,${0.60 + crackT * 0.40})`;
    const CRKH  = `rgba(255,170,80,${0.55 + crackT * 0.40})`;

    ctx.save();
    ctx.globalAlpha = 0.93;

    // ── CRIMSON AURA ──────────────────────────────────────────────────────
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.12 + pulse * 0.12;
    const ar = (22 + pulse * 5) * S;
    const ag = ctx.createRadialGradient(cx, cy - 4 * S, 0, cx, cy - 4 * S, ar);
    ag.addColorStop(0, 'rgba(220,50,20,0.70)');
    ag.addColorStop(0.5, 'rgba(110,10,10,0.24)');
    ag.addColorStop(1, 'transparent');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.arc(cx, cy - 4 * S, ar, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // ── HAIR — drawn first, hangs behind the horns ────────────────────────
    ctx.save();
    ctx.globalAlpha = 0.75;
    p(-8 + hairF, -21, CO, 17, 4); p(-7 + hairF, -20, HR, 15, 3);
    p(-10 + hairF, -24, CO, 4, 5); p(-9 + hairF, -23, HR, 2, 4);
    p(  6 + hairF, -24, CO, 4, 5); p( 7 + hairF, -23, HR, 2, 4);
    for (let i = 0; i < 4; i++) {
        const sx = i < 2 ? -11 + i : 10 - (i - 2);
        const sl = 11 + Math.round(Math.sin(now * 0.0026 + i) * 3);
        p(sx, -14, HR, 1, sl);
    }
    ctx.restore();

    // ── HORNS — oversized, swept back, cracked under their own weight ─────
    for (const side of [-1, 1]) {
        const bx = side < 0 ? -7 : 4;
        p(bx, -30, CO, 4, 13); p(bx + 1, -30, HN, 2, 11); p(bx + (side < 0 ? 2 : 1), -29, HH, 1, 9);
        p(side < 0 ? -10 : 6, -24, CO, 4, 7);               // the curve back
        p(side < 0 ? -9 : 7, -23, HN, 2, 5);
        p(side < 0 ? -9 : 8, -22, HH, 1, 3);
        p(bx + 1, -30, HW, 1, 2);                           // top highlight
        pg(bx + 1, -26, CRACK, 1, 4);                       // the crack, lit from inside
        p(side < 0 ? -10 : 9, -19, BN, 1, 2);               // bone tip
    }

    // ── HEAD — wide cranium narrowing to a pointed jaw ────────────────────
    const HEAD = [
        [-21, -6, 13, 2], [-19, -8, 17, 3], [-16, -9, 19, 4],
        [-12, -8, 17, 4], [ -8, -6, 13, 3], [ -5, -4,  9, 2],
    ];
    for (const [oy, ox, w, h] of HEAD) p(ox - 1, oy, CO, w + 2, h);
    for (const { col, ix, iy } of [
        { col: H1, ix: 0, iy: 0 }, { col: H2, ix: 1, iy: 1 },
        { col: H3, ix: 3, iy: 3 }, { col: H4, ix: 5, iy: 6 }, { col: H5, ix: 7, iy: 9 },
    ]) {
        for (const [oy, ox, w, h] of HEAD) {
            if (oy < -21 + iy || oy + h > -3 - iy) continue;
            const li = Math.max(0, ix - 1), ri = ix + 1;
            const nw = w - li - ri;
            if (nw > 0) p(ox + li, oy, col, nw, h);
        }
    }
    p(-8, -19, HL, 17, 1);                                  // top highlight
    p(-4, -18, H5,  8, 1);

    // ── FACE SEAMS — splitting skin, lit from behind ──────────────────────
    ctx.save();
    ctx.globalAlpha = 0.68 + crackT * 0.30;
    pg(-3, -13, CRACK, 1, 8);
    pg( 4, -15, CRACK, 1, 6);
    pg(-6, -8, CRACK, 6, 1);
    pg(-3, -12, CRKH, 1, 4);
    ctx.restore();

    // ── BROW + EYE SOCKETS ────────────────────────────────────────────────
    p(-9, -15, CO, 19, 2); p(-8, -14, H1, 17, 1);
    p(-8, -13, CO, 6, 4); p( 3, -13, CO, 6, 4);
    p(-7, -12, VOID, 4, 2); p( 4, -12, VOID, 4, 2);
    pg(-6, -12, EG, 2, 1); pg( 5, -12, EG, 2, 1);
    pg(-6, -12, EGH, 1, 1); pg( 6, -12, EGH, 1, 1);

    // ── MAW — bared fangs, void behind ────────────────────────────────────
    p(-6, -8, CO, 13, 1);
    p(-6, -7, VOID, 13, 4);
    for (let i = 0; i < 5; i++) p(-5 + i * 3, -7, BN, 1, 3);
    for (let i = 0; i < 4; i++) p(-4 + i * 3, -4, BN, 1, 2);
    p(-5, -7, BNH, 1, 1); p( 1, -7, BNH, 1, 1);
    p(-6, -3, CO, 13, 1);

    // ── BODY — narrow chest widening to the hips ──────────────────────────
    const BODY = [
        [-2, -9, 19, 4], [ 2, -10, 21, 5], [ 7, -10, 21, 5], [12, -9, 19, 4],
    ];
    for (const [oy, ox, w, h] of BODY) p(ox - 1, oy, CO, w + 2, h);
    for (const { col, ix, iy } of [
        { col: H1, ix: 0, iy: 0 }, { col: H2, ix: 2, iy: 1 },
        { col: H3, ix: 4, iy: 4 }, { col: H4, ix: 6, iy: 7 },
    ]) {
        for (const [oy, ox, w, h] of BODY) {
            if (oy < -2 + iy || oy + h > 16 - iy) continue;
            const li = Math.max(0, ix - 1), ri = ix + 1;
            const nw = w - li - ri;
            if (nw > 0) p(ox + li, oy, col, nw, h);
        }
    }
    p(-9, -2, HL, 19, 1);                                   // top highlight

    // ── BODY SEAMS ────────────────────────────────────────────────────────
    ctx.save();
    ctx.globalAlpha = 0.58 + crackT * 0.34;
    pg(-8, 1, CRACK, 1, 11); pg( 7, 3, CRACK, 1, 9); pg(-2, 6, CRACK, 4, 1);
    ctx.restore();

    // ── CHEST WOUND — bone showing through ────────────────────────────────
    p(-4, 1, CO, 7, 6); p(-3, 2, VOID, 5, 4);
    p(-3, 2, BN, 5, 1); p(-2, 5, BN, 3, 1);
    ctx.save(); ctx.globalAlpha = 0.6 + crackT * 0.4;
    pg(-3, 3, CRACK, 5, 2);
    ctx.restore();

    // ── ARMS — clawed, held out from the body ─────────────────────────────
    p(-14, -1, CO, 5, 12); p(-13, 0, H2, 3, 10); p(-13, 0, H4, 1, 6);
    p( 10, -1, CO, 5, 12); p( 11, 0, H2, 3, 10); p( 11, 0, H4, 1, 6);
    p(-16, 10, CO, 6, 4); p( 11, 10, CO, 6, 4);
    p(-15, 11, H3, 4, 2); p( 12, 11, H3, 4, 2);
    p(-16, 14, BN, 1, 3); p(-13, 14, BN, 1, 3); p(-11, 14, BN, 1, 2);
    p( 12, 14, BN, 1, 3); p( 15, 14, BN, 1, 3); p( 16, 14, BN, 1, 2);

    // ── LEGS — digitigrade, bone claws ────────────────────────────────────
    p(-8, 16, CO, 7, 9); p( 2, 16, CO, 7, 9);
    p(-7, 17, H2, 5, 7); p( 3, 17, H2, 5, 7);
    p(-6, 18, H3, 3, 5); p( 4, 18, H3, 3, 5);
    p(-9, 25, CO, 8, 3); p( 2, 25, CO, 8, 3);
    p(-8, 26, H2, 6, 1); p( 3, 26, H2, 6, 1);
    p(-9, 28, BN, 1, 2); p(-6, 28, BN, 1, 2); p(-3, 28, BN, 1, 2);
    p( 2, 28, BN, 1, 2); p( 5, 28, BN, 1, 2); p( 8, 28, BN, 1, 2);

    ctx.restore();
}

/**
 * --- BRIMSTONE FIEND (brimstone_fiend) ---
 * 유황 악귀: Charred hide cracked open by sulfur burning underneath. Hunched and
 * bandy-legged with a heavy brow and a jaw too wide for its skull. The old
 * version had the right idea — veins, horns, fangs — but drew the head and body
 * as two stacked boxes; the silhouette is now tapered and asymmetric, and every
 * sulfur vein routes through pEnemyGlow so the finishing pass blooms the heat
 * and leaves the charred hide matte.
 */
function drawBrimstoneFiend(cx, cy, enemy) {
    const now = Date.now();
    const S   = 2.0;
    const pulse  = (Math.sin(now * 0.005) + 1) / 2;
    const flick  = Math.sin(now * 0.017);
    const smokeT = now * 0.003;
    const floatY = Math.sin(smokeT) * 2;
    const p  = (ox, oy, col, w = 1, h = 1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);
    const pg = (ox, oy, col, w = 1, h = 1) => pEnemyGlow(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO = '#000000', VOID = '#000005';
    const B1 = '#0C0500', B2 = '#180A00', B3 = '#281200', B4 = '#3C1D02', B5 = '#542C0A';
    const HL = '#6E4018';
    const BONE = '#D8C0A8', BONEH = '#F2E6D2';
    const SV  = `rgba(255,150,0,${0.70 + pulse * 0.30})`;
    const SF  = `rgba(255,225,60,${0.60 + pulse * 0.40})`;
    const SW  = `rgba(255,250,205,${0.75 + pulse * 0.25})`;
    const SM  = `rgba(60,32,0,${0.16 + pulse * 0.14})`;
    const EG  = `rgba(255,180,0,${0.82 + pulse * 0.18})`;

    ctx.save();
    ctx.globalAlpha = 0.94;

    // ── SULFUR HEAT AURA ──────────────────────────────────────────────────
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.13 + pulse * 0.13;
    const ar = (25 + pulse * 5) * S;
    const ag = ctx.createRadialGradient(cx, cy + 2 * S, 0, cx, cy + 2 * S, ar);
    ag.addColorStop(0, 'rgba(255,170,0,0.75)');
    ag.addColorStop(0.5, 'rgba(160,70,0,0.26)');
    ag.addColorStop(1, 'transparent');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.arc(cx, cy + 2 * S, ar, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // ── SULFUR SMOKE, rising and thinning ─────────────────────────────────
    ctx.save();
    for (let i = 0; i < 4; i++) {
        const sy = -26 - i * 5 - ((smokeT * 6) % 6);
        const sw = 12 - i * 2;
        ctx.globalAlpha = (0.20 - i * 0.04) + pulse * 0.08;
        p(-(sw >> 1) + Math.round(Math.sin(smokeT + i) * 2), sy, SM, sw, 4);
    }
    ctx.restore();

    // ── HORNS — swept back, uneven, one chipped ───────────────────────────
    p(-7, -26, CO, 3, 4); p(-8, -23, CO, 3, 4);
    p(-6, -25, B4, 1, 3); p(-7, -22, B3, 1, 3);
    p(-6, -25, HL, 1, 1);
    p( 5, -27, CO, 3, 5); p( 6, -23, CO, 3, 3);
    p( 6, -26, B4, 1, 4); p( 7, -22, B3, 1, 2);
    p( 6, -26, BONE, 1, 1);                                  // chipped to the bone

    // ── SKULL — narrow crown widening to a heavy jaw ──────────────────────
    const HEAD = [
        [-22, -5, 11, 2], [-20, -7, 15, 2], [-18, -8, 17, 3],
        [-15, -9, 19, 4], [-11, -9, 19, 4], [ -7, -8, 17, 3], [-4, -6, 13, 2],
    ];
    for (const [oy, ox, w, h] of HEAD) p(ox - 1, oy, CO, w + 2, h);
    for (const { col, ix, iy } of [
        { col: B1, ix: 0, iy: 0 }, { col: B2, ix: 1, iy: 1 },
        { col: B3, ix: 3, iy: 3 }, { col: B4, ix: 5, iy: 6 }, { col: B5, ix: 7, iy: 9 },
    ]) {
        for (const [oy, ox, w, h] of HEAD) {
            if (oy < -22 + iy || oy + h > -2 - iy) continue;
            const li = Math.max(0, ix - 1), ri = ix + 1;
            const nw = w - li - ri;
            if (nw > 0) p(ox + li, oy, col, nw, h);
        }
    }
    p(-7, -20, HL, 15, 1);                                   // top highlight
    p(-4, -19, B5,  8, 1);

    // ── BROW — heavy, angled in, casts the sockets into shadow ────────────
    p(-9, -16, CO, 19, 3);
    p(-8, -15, B1, 17, 2);
    p(-8, -16, B3,  5, 1); p( 4, -16, B3, 5, 1);

    // ── FOREHEAD CRACK — bone showing through the char ────────────────────
    p( 0, -21, VOID, 2, 5);
    p( 0, -21, BONE, 1, 4); p( 0, -21, BONEH, 1, 1);

    // ── SULFUR FISSURES across the face (crawl with flick) ────────────────
    ctx.save();
    ctx.globalAlpha = 0.62 + pulse * 0.34;
    pg(-6 + flick, -14, SV, 1, 9);
    pg( 4, -12, SV, 1, 7);
    pg(-2, -18, SV, 2, 4);
    pg(-5, -13, SF, 1, 5); pg( 4, -11, SF, 1, 3);
    ctx.restore();

    // ── EYE SOCKETS — deep pits, a sulfur coal at the bottom ──────────────
    p(-8, -13, CO, 6, 4); p( 2, -13, CO, 6, 4);
    p(-7, -12, VOID, 4, 2); p( 3, -12, VOID, 4, 2);
    pg(-6, -12, EG, 2, 1); pg( 4, -12, EG, 2, 1);
    pg(-6, -12, SW, 1, 1); pg( 5, -12, SW, 1, 1);

    // ── MAW — snarling, wider than the crown, fangs top and bottom ────────
    p(-7, -6, CO, 15, 1);
    p(-8, -5, VOID, 17, 5);
    for (let i = 0; i < 5; i++) p(-6 + i * 3, -5, BONE, 1, 3);
    for (let i = 0; i < 4; i++) p(-5 + i * 3, -2, BONE, 1, 2);
    p(-6, -5, BONEH, 1, 1); p( 0, -5, BONEH, 1, 1);
    ctx.save(); ctx.globalAlpha = 0.45 + pulse * 0.30;
    pg(-6, -3, SV, 13, 1);                                   // glow down the throat
    ctx.restore();
    p(-8, 0, CO, 17, 1);

    // ── TORSO — barrel chest tapering to a narrow waist ───────────────────
    const BODY = [
        [ 1, -11, 22, 4], [ 5, -12, 24, 5], [10, -11, 22, 4], [14, -9, 18, 4],
    ];
    for (const [oy, ox, w, h] of BODY) p(ox - 1, oy, CO, w + 2, h);
    for (const { col, ix, iy } of [
        { col: B1, ix: 0, iy: 0 }, { col: B2, ix: 2, iy: 1 },
        { col: B3, ix: 4, iy: 3 }, { col: B4, ix: 6, iy: 6 },
    ]) {
        for (const [oy, ox, w, h] of BODY) {
            if (oy < 1 + iy || oy + h > 18 - iy) continue;
            const li = Math.max(0, ix - 1), ri = ix + 1;
            const nw = w - li - ri;
            if (nw > 0) p(ox + li, oy, col, nw, h);
        }
    }
    p(-10, 1, HL, 20, 1);                                    // top highlight
    // Ribs pushing through the hide
    p(-8, 4, B1, 16, 1); p(-8, 8, B1, 16, 1); p(-7, 12, B1, 14, 1);

    // ── SULFUR VEINS bleeding down the torso ──────────────────────────────
    ctx.save();
    ctx.globalAlpha = 0.60 + pulse * 0.36;
    pg(-9, 3, SV, 2, 13); pg(-9, 3, SF, 1, 9);
    pg( 7, 5, SV, 2, 10); pg( 8, 5, SF, 1, 6);
    pg(-2, 2, SV, 2,  9); pg(-1, 3, SF, 1, 5);
    pg(-5, 10, SV, 9, 1);
    ctx.restore();

    // ── ARMS — long, dangling past the knee, clawed ───────────────────────
    p(-17, 1, CO, 6, 15); p(-16, 2, B2, 4, 13); p(-16, 2, B4, 2, 8);
    p(-16, 2, HL, 4, 1);
    p(-18, 15, CO, 7, 6); p(-17, 16, B3, 5, 4);
    p(-17, 21, BONE, 1, 3); p(-14, 21, BONE, 1, 3); p(-11, 21, BONE, 1, 2);
    p( 11, 3, CO, 6, 15); p( 12, 4, B2, 4, 13); p( 12, 4, B4, 2, 8);
    p( 12, 4, HL, 4, 1);
    p( 11, 17, CO, 7, 6); p( 12, 18, B3, 5, 4);
    p( 12, 23, BONE, 1, 3); p( 15, 23, BONE, 1, 3); p( 17, 23, BONE, 1, 2);
    ctx.save(); ctx.globalAlpha = 0.45 + pulse * 0.35;
    pg(-15, 6, SV, 1, 6); pg(14, 8, SV, 1, 6);
    ctx.restore();

    // ── LEGS — bandy, digitigrade, splayed for balance ────────────────────
    p(-9, 18, CO, 7, 9); p( 3, 18, CO, 7, 9);
    p(-8, 19, B2, 5, 7); p( 4, 19, B2, 5, 7);
    p(-7, 20, B3, 3, 5); p( 5, 20, B3, 3, 5);
    p(-11, 27, CO, 8, 4); p( 4, 27, CO, 8, 4);               // splayed feet
    p(-10, 28, B2, 6, 2); p( 5, 28, B2, 6, 2);
    p(-11, 31, BONE, 1, 2); p(-8, 31, BONE, 1, 2); p(-5, 31, BONE, 1, 2);
    p(  5, 31, BONE, 1, 2); p( 8, 31, BONE, 1, 2); p(11, 31, BONE, 1, 2);
    ctx.save(); ctx.globalAlpha = 0.40 + pulse * 0.36;
    pg(-8, 24, SV, 4, 1); pg( 5, 24, SV, 4, 1);
    ctx.restore();

    ctx.restore();
}

/**
 * --- GOLD PHANTOM (gold) ---
 * 황금 망령: The treasure enemy — a miser who kept counting after death. Gaunt
 * and hollow-cheeked, clutching a coin to a chest it no longer has, wrapped in a
 * shroud that is turning to gold leaf from the hem up. Coins orbit it because it
 * cannot let them go, and its halo is broken: wealth that bought nothing.
 * Gold reads warm and bright against every other enemy in the roster, which is
 * the point — the player should spot it instantly and prioritise it.
 */
function drawGoldPhantom(cx, cy, enemy) {
    const now = Date.now();
    const S   = 2.0;
    const ep     = (Math.sin(now * 0.005) + 1) / 2;
    const floatY = Math.sin(now * 0.002) * 3;
    const coinT  = now * 0.0018;
    const shiver = Math.sin(now * 0.011) * 0.5;
    const p  = (ox, oy, col, w = 1, h = 1) => pEnemy(ctx, cx, cy + floatY, ox, oy, col, w, h, S);
    const pg = (ox, oy, col, w = 1, h = 1) => pEnemyGlow(ctx, cx, cy + floatY, ox, oy, col, w, h, S);

    const CO = '#000000', VOID = '#0A0006';
    const G1 = '#2E2000', G2 = '#5A4000', G3 = '#9A6F00', G4 = '#D9A400', G5 = '#FFD700';
    const GH = '#FFF3B0';
    const F1 = '#1C1408', F2 = '#33260F', F3 = '#4E3B1A', F4 = '#6B5428';   // dead flesh, gold-tinged
    const HE   = `rgba(255,175,0,${0.80 + ep * 0.20})`;
    const HEH  = `rgba(255,246,200,${0.85 + ep * 0.15})`;
    const COIN = `rgba(255,215,60,${0.75 + ep * 0.25})`;

    ctx.save();
    ctx.globalAlpha = 0.95;

    // ── GREED AURA (additive, sickly gold) ────────────────────────────────
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.16 + ep * 0.16;
    const ar = (22 + ep * 5) * S;
    const ag = ctx.createRadialGradient(cx, cy - 4 * S, 0, cx, cy - 4 * S, ar);
    ag.addColorStop(0, 'rgba(255,200,40,0.80)');
    ag.addColorStop(0.5, 'rgba(150,110,0,0.28)');
    ag.addColorStop(1, 'transparent');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.arc(cx, cy - 4 * S, ar, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // ── ORBITING COINS — edge-on and face-on as they turn ─────────────────
    for (let i = 0; i < 5; i++) {
        const a = coinT + i * 1.257;
        const ox = Math.round(Math.cos(a) * 16);
        const oy = Math.round(Math.sin(a) * 8) - 5;
        const face = Math.abs(Math.cos(a));                 // 1 = flat on, 0 = edge on
        const cw = face > 0.6 ? 3 : (face > 0.25 ? 2 : 1);
        p(ox - 1, oy - 1, CO, cw + 2, 4);
        pg(ox, oy, COIN, cw, 2);
        if (cw === 3) pg(ox + 1, oy, GH, 1, 1);
    }

    // ── SHROUD TAIL — ragged, turning to gold leaf at the hem ─────────────
    ctx.save();
    for (let i = 0; i < 5; i++) {
        const tx = -8 + i * 4;
        const tl = 6 + Math.round(Math.sin(now * 0.0028 + i * 1.1) * 3);
        ctx.globalAlpha = 0.72 - i * 0.04;
        p(tx, 9, G1, 3, tl);
        p(tx, 9, G2, 2, tl - 2);
        ctx.globalAlpha = 0.44 + ep * 0.18;
        pg(tx, 9 + tl, G4, 2, 2);                           // gilded, glowing hem
        ctx.globalAlpha = 0.25;
        p(tx + 1, 11 + tl, VOID, 1, 3);
    }
    ctx.restore();

    // ── BODY — narrow shoulders, sunken chest, gilding creeping up ────────
    const BODY = [
        [-13, -6, 12, 2], [-11, -7, 14, 3], [-8, -8, 16, 4],
        [ -4, -8, 16, 5], [  1, -7, 14, 4], [  5, -6, 12, 4],
    ];
    for (const [oy, ox, w, h] of BODY) p(ox - 1, oy, CO, w + 2, h);
    for (const { col, ix, iy } of [
        { col: F1, ix: 0, iy: 0 }, { col: F2, ix: 1, iy: 1 },
        { col: F3, ix: 3, iy: 3 }, { col: F4, ix: 5, iy: 6 },
    ]) {
        for (const [oy, ox, w, h] of BODY) {
            if (oy < -13 + iy || oy + h > 9 - iy) continue;
            const li = Math.max(0, ix - 1), ri = ix + 1;
            const nw = w - li - ri;
            if (nw > 0) p(ox + li, oy, col, nw, h);
        }
    }
    p(-7, -11, G3, 14, 1);                                  // top highlight (gilded collar)
    p(-5, -10, G5,  8, 1);
    // Gilding creeps up from the hem — the lower body is already metal
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.20;
    pg(-6, 5, G3, 12, 4); pg(-5, 7, G4, 10, 2);
    ctx.restore();
    // Ribs showing through
    p(-5, -6, F1, 10, 1); p(-5, -3, F1, 10, 1); p(-4, 0, F1, 8, 1);

    // ── ARMS — clutched inward around the coin, not hanging ───────────────
    p(-11, -8, CO, 4, 12); p(-10, -7, F2, 2, 10); p(-10, -7, F4, 1, 6);
    p(  8, -8, CO, 4, 12); p(  9, -7, F2, 2, 10); p(  9, -7, F4, 1, 6);
    p(-10,  3, CO, 5,  4); p( -9,  4, F3, 3,  2);           // hands meet at the chest
    p(  6,  3, CO, 5,  4); p(  7,  4, F3, 3,  2);
    p(-9, 6, G2, 1, 2); p(9, 6, G2, 1, 2);                  // gilded fingertips

    // ── THE COIN it will not release ──────────────────────────────────────
    p(-3, 1, CO, 7, 6);
    pg(-2, 2, G4, 5, 4);
    pg(-1, 3, G5, 3, 2);
    pg( 0, 3, GH, 1, 1);

    // ── HEAD — gaunt, cheekbones, jaw hanging open ────────────────────────
    p(-6, -24, CO, 13, 2);
    p(-7, -22, CO, 15, 11);
    p(-6, -22, F1, 13, 10); p(-5, -21, F2, 11, 8);
    p(-4, -20, F3,  8,  6); p(-3, -19, F4, 5, 3);
    p(-6, -22, G3, 13, 1);                                  // top highlight
    p(-4, -21, G5,  4, 1);
    p(-8, -18, CO, 2, 4); p( 7, -18, CO, 2, 4);             // cheekbone shadow
    p(-6, -16, F1, 4, 2); p( 3, -16, F1, 4, 2);             // hollow cheeks

    // ── EYE SOCKETS — deep pits with a gold coal at the bottom ────────────
    p(-5, -20, CO, 4, 4); p( 2, -20, CO, 4, 4);
    p(-4, -19, VOID, 2, 2); p( 3, -19, VOID, 2, 2);
    pg(-4, -19, HE, 2, 1); pg( 3, -19, HE, 2, 1);
    pg(-4, -19, HEH, 1, 1); pg( 3, -19, HEH, 1, 1);

    // ── MOUTH — hanging open, a coin lodged in the throat ─────────────────
    p(-3, -14, CO, 7, 4);
    p(-2, -13, VOID, 5, 3);
    pg(-1, -12, G4, 3, 1);                                  // the swallowed coin
    p(-2, -10, CO, 5, 1);

    // ── GOLD TEARS (they well up and fall) ────────────────────────────────
    const drip = (now % 1400) / 1400;
    ctx.save(); ctx.globalAlpha = 0.85;
    pg(-4, -17 + drip * 9, G5, 1, 2);
    pg( 3, -17 + ((drip + 0.4) % 1) * 9, G5, 1, 2);
    ctx.restore();

    // ── BROKEN HALO — four arcs, gapped, tilted by the shiver ─────────────
    for (let i = 0; i < 4; i++) {
        const hx = -9 + i * 5;
        const hy = -28 + (i === 1 || i === 2 ? -1 : 0) + shiver;
        p(hx, hy, CO, 4, 2);
        pg(hx, hy, G5, 3, 1);
    }

    ctx.restore();
}

/**
 * --- SHADOW TITAN (shadow_titan) ---
 * 그림자 거인: A colossus of compacted darkness. Hunched, small-headed and
 * enormously shouldered so the silhouette reads as mass rather than height.
 * Near-black ramp that hue-shifts to violet in the lights — without that shift
 * the whole figure collapses into one flat black shape on the dark road.
 * Its lower body frays into smoke instead of ending in feet.
 */
function drawShadowTitan(cx, cy, enemy) {
    const now = Date.now();
    const S   = 2.0;
    const pulse  = (Math.sin(now * 0.003) + 1) / 2;
    const sway   = Math.sin(now * 0.0016) * 1.5;
    const smoke  = now * 0.004;
    const p  = (ox, oy, col, w = 1, h = 1) => pEnemy(ctx, cx, cy, ox, oy, col, w, h, S);
    const pg = (ox, oy, col, w = 1, h = 1) => pEnemyGlow(ctx, cx, cy, ox, oy, col, w, h, S);

    const CO = '#000000', VOID = '#000005';
    const K1 = '#050510', K2 = '#0B0B1C', K3 = '#13132C', K4 = '#1D1D40', K5 = '#2A2A56';
    const HL = '#3E3E72';
    const EYE  = `rgba(120,30,255,${0.72 + pulse * 0.28})`;
    const EYEH = `rgba(215,175,255,${0.80 + pulse * 0.20})`;
    const BONE = '#C8BCB0';

    ctx.save();
    ctx.globalAlpha = 0.97;

    // ── VOID AURA (additive; a titan should darken-then-glow, not sit flat) ─
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.10 + pulse * 0.10;
    const ar = (34 + pulse * 6) * S;
    const ag = ctx.createRadialGradient(cx, cy - 4 * S, 0, cx, cy - 4 * S, ar);
    ag.addColorStop(0, 'rgba(70,10,160,0.7)');
    ag.addColorStop(0.6, 'rgba(30,0,70,0.25)');
    ag.addColorStop(1, 'transparent');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.arc(cx, cy - 4 * S, ar, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // ── TORSO — trapezoid, wide at the shoulders, tapering to the waist ────
    const TORSO = [
        [-12, -20, 40, 3], [ -9, -19, 38, 4], [ -6, -18, 36, 5],
        [  0, -17, 34, 5], [  5, -15, 30, 4], [  9, -13, 26, 4],
        [ 13, -11, 22, 3], [ 16,  -9, 18, 3],
    ];
    for (const [oy, ox, w, h] of TORSO) p(ox - 1, oy, CO, w + 2, h);
    for (const { col, ix, iy } of [
        { col: K1, ix: 0,  iy: 0 }, { col: K2, ix: 2,  iy: 2 },
        { col: K3, ix: 5,  iy: 5 }, { col: K4, ix: 9,  iy: 9 },
        { col: K5, ix: 13, iy: 13 },
    ]) {
        for (const [oy, ox, w, h] of TORSO) {
            if (oy < -12 + iy || oy + h > 19 - iy) continue;
            const li = Math.max(0, ix - 2), ri = ix + 2;   // lit core sits left
            const nw = w - li - ri;
            if (nw > 0) p(ox + li, oy, col, nw, h);
        }
    }
    p(-19, -12, HL, 38, 1);                                // top highlight
    p(-17, -11, K5, 20, 1);

    // ── COLLARBONE RIDGE + STERNUM SCAR ───────────────────────────────────
    p(-14, -9, CO, 28, 2); p(-13, -9, K3, 26, 1);
    p( -1, -7, CO,  2, 16); p(-1, -6, K4, 1, 14);
    for (let r = 0; r < 4; r++) { p(-11, -4 + r * 5, K4, 6, 1); p(6, -4 + r * 5, K4, 6, 1); }

    // ── BOULDER SHOULDERS (asymmetric — right rides higher) ───────────────
    p(-26, -17, CO, 10, 12); p(-25, -16, K2, 8, 10); p(-24, -15, K3, 5, 7);
    p(-25, -16, K5,  8,  1);
    p( 16, -19, CO, 10, 12); p( 17, -18, K2, 8, 10); p( 18, -17, K3, 5, 7);
    p( 17, -18, K5,  8,  1);
    p(-27, -20, CO, 3, 4); p(-26, -19, K3, 1, 3);          // shoulder spurs
    p( 24, -22, CO, 3, 5); p( 24, -21, K3, 1, 4);

    // ── ARMS — long, hanging, tapering to clawed fists ────────────────────
    p(-27 + sway, -6, CO, 7, 20); p(-26 + sway, -5, K2, 5, 18); p(-26 + sway, -5, K4, 2, 12);
    p(-27 + sway, 14, CO, 7,  7); p(-26 + sway, 15, K3, 5,  5);
    p(-26 + sway, 21, BONE, 1, 2); p(-23 + sway, 21, BONE, 1, 2);
    p( 20 - sway, -8, CO, 7, 20); p( 21 - sway, -7, K2, 5, 18); p( 21 - sway, -7, K4, 2, 12);
    p( 20 - sway, 12, CO, 7,  7); p( 21 - sway, 13, K3, 5,  5);
    p( 21 - sway, 19, BONE, 1, 2); p( 24 - sway, 19, BONE, 1, 2);

    // ── HEAD — small, sunk between the shoulders (sells the scale) ────────
    p(-8, -30, CO, 16, 2); p(-9, -28, CO, 18, 1);
    p(-10, -27, CO, 1, 15); p( 9, -27, CO, 1, 15);
    p(-9, -12, CO, 18, 1);
    p(-9, -28, K1, 18, 16); p(-7, -27, K2, 14, 14);
    p(-5, -26, K3, 10, 11); p(-3, -25, K4, 6, 6);
    p(-7, -27, K5, 14, 1);                                 // top highlight
    p(-5, -26, HL,  4, 1);
    p(-4, -33, CO, 3, 5); p( 1, -33, CO, 3, 5);            // horn stubs
    p(-3, -32, K3, 1, 4); p( 2, -32, K3, 1, 4);

    // ── EYE SOCKETS — deep, with a violet fire pinpoint ───────────────────
    p(-8, -24, CO, 7, 6); p( 1, -24, CO, 7, 6);
    p(-7, -23, VOID, 5, 4); p( 2, -23, VOID, 5, 4);
    pg(-6, -22, EYE, 3, 2); pg( 3, -22, EYE, 3, 2);
    pg(-5, -22, EYEH, 1, 1); pg( 4, -22, EYEH, 1, 1);

    // ── BROW — heavy, angled inward, gives the face an expression ─────────
    p(-9, -25, CO, 5, 2); p( 4, -25, CO, 5, 2);
    p(-4, -26, CO, 8, 2); p(-3, -25, K2, 6, 1);

    // ── MAW — silent scream, bone fangs behind the void ───────────────────
    p(-6, -18, CO, 12, 1);
    p(-6, -17, VOID, 12, 4);
    for (let i = 0; i < 4; i++) p(-5 + i * 3, -17, BONE, 1, 2);
    for (let i = 0; i < 3; i++) p(-3 + i * 3, -15, BONE, 1, 2);
    p(-6, -13, CO, 12, 1);

    // ── LOWER BODY frays into smoke rather than ending in feet ────────────
    ctx.save();
    for (let i = 0; i < 7; i++) {
        const tx = -14 + i * 4;
        const tl = 8 + Math.round(Math.sin(smoke + i * 0.9) * 4);
        ctx.globalAlpha = 0.85 - i * 0.04;
        p(tx, 19, K1, 3, tl);
        ctx.globalAlpha = 0.50 - i * 0.03;
        p(tx, 19 + tl, K2, 2, 4);
        ctx.globalAlpha = 0.26;
        p(tx + 1, 23 + tl, VOID, 1, 3);
    }
    ctx.restore();

    ctx.restore();
}

/**
 * --- LAVA LORD (lava_lord) ---
 * 용암 군주: Cooled obsidian plating over a molten core. The silhouette is
 * broken and asymmetric — cracked slabs, a crown of magma spikes, one shattered
 * shoulder — so it reads as something that split and re-set rather than a
 * carved statue. Every glowing seam goes through pEnemyGlow so the finishing
 * pass blooms the lava and leaves the cold rock hard-edged.
 */
function drawLavaLord(cx, cy, enemy) {
    const now = Date.now();
    const S   = 2.0;
    const pulse = (Math.sin(now * 0.007) + 1) / 2;
    const fire  = (Math.sin(now * 0.012) + 1) / 2;
    const flick = Math.sin(now * 0.019);
    const emberT = now * 0.005;
    const p  = (ox, oy, col, w = 1, h = 1) => pEnemy(ctx, cx, cy, ox, oy, col, w, h, S);
    const pg = (ox, oy, col, w = 1, h = 1) => pEnemyGlow(ctx, cx, cy, ox, oy, col, w, h, S);

    const CO = '#000000';
    const R1 = '#120600', R2 = '#241000', R3 = '#3A1D02', R4 = '#553012', R5 = '#6E4520';
    const HL = '#8A5C33';
    const LAVA  = `rgba(255,90,0,${0.75 + fire * 0.25})`;
    const LAVAH = `rgba(255,205,60,${0.70 + pulse * 0.30})`;
    const WHITE = `rgba(255,245,200,${0.80 + fire * 0.20})`;
    const EMBER = `rgba(255,150,30,${0.55 + fire * 0.35})`;

    ctx.save();
    ctx.globalAlpha = 0.97;

    // ── HEAT AURA (additive, breathes with the core) ──────────────────────
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.16 + fire * 0.14;
    const ar = (28 + fire * 6) * S;
    const ag = ctx.createRadialGradient(cx, cy - 2 * S, 0, cx, cy - 2 * S, ar);
    ag.addColorStop(0, 'rgba(255,120,0,0.85)');
    ag.addColorStop(0.5, 'rgba(200,50,0,0.30)');
    ag.addColorStop(1, 'transparent');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.arc(cx, cy - 2 * S, ar, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // ── RISING EMBERS (drift up, fade out) ────────────────────────────────
    ctx.save();
    for (let i = 0; i < 6; i++) {
        const ex = -14 + i * 5 + Math.sin(emberT + i * 1.4) * 2;
        const ey = -26 - ((emberT * 9 + i * 7) % 20);
        ctx.globalAlpha = 0.65 - i * 0.07;
        pg(ex, ey, EMBER, 1, 1);
    }
    ctx.restore();

    // ── MAGMA CROWN — jagged, uneven spike heights ────────────────────────
    const SPIKES = [[-8, 5], [-4, 8], [0, 6], [4, 9], [8, 4]];
    for (let i = 0; i < SPIKES.length; i++) {
        const sx = SPIKES[i][0], sh = SPIKES[i][1];
        p(sx, -26 - sh, CO, 3, sh + 2);
        p(sx + 1, -25 - sh, R2, 1, sh);
        ctx.save();
        ctx.globalAlpha = 0.75 + fire * 0.25;
        pg(sx + 1, -25 - sh, LAVA, 1, Math.max(2, sh - 3));
        pg(sx + 1, -25 - sh, WHITE, 1, 1);
        ctx.restore();
    }

    // ── HEAD — cracked slab, wider at the jaw than the crown ──────────────
    p(-8, -26, CO, 16, 1); p(-10, -25, CO, 20, 2);
    p(-11, -23, CO, 1, 14); p(10, -23, CO, 1, 14);
    p(-10, -9, CO, 20, 1);
    p(-10, -24, R1, 20, 15); p(-8, -23, R2, 16, 13);
    p(-6, -22, R3, 12, 11); p(-4, -21, R4, 7, 6); p(-3, -20, R5, 4, 3);
    p(-8, -23, HL, 16, 1);                                  // top highlight
    p(-5, -22, R5, 5, 1);

    // ── FACE FISSURES (glowing, they crawl with flick) ────────────────────
    ctx.save();
    ctx.globalAlpha = 0.72 + pulse * 0.22;
    pg(-6 + flick, -21, LAVA, 1, 9);
    pg( 4, -23, LAVA, 1, 11);
    pg(-2, -17, LAVAH, 4, 1);
    pg( 1, -14, LAVA, 1, 4);
    ctx.restore();

    // ── EYE SOCKETS — molten gold inside cold rock ────────────────────────
    p(-9, -20, CO, 7, 5); p( 2, -20, CO, 7, 5);
    p(-8, -19, '#0A0300', 5, 3); p( 3, -19, '#0A0300', 5, 3);
    pg(-7, -18, LAVA, 3, 1); pg( 4, -18, LAVA, 3, 1);
    pg(-6, -18, WHITE, 1, 1); pg( 5, -18, WHITE, 1, 1);

    // ── MAW — molten throat behind bone fangs ─────────────────────────────
    p(-7, -13, CO, 14, 1);
    p(-7, -12, '#0A0300', 14, 4);
    ctx.save(); ctx.globalAlpha = 0.55 + fire * 0.30;
    pg(-6, -10, LAVA, 12, 2);                               // glow deep in the throat
    ctx.restore();
    for (let i = 0; i < 5; i++) p(-6 + i * 3, -12, '#D8C0A8', 1, 2);
    for (let i = 0; i < 4; i++) p(-4 + i * 3, -10, '#D8C0A8', 1, 2);
    p(-7, -8, CO, 14, 1);

    // ── TORSO — broken slabs, asymmetric silhouette ───────────────────────
    const SLABS = [
        [ -7, -14, 28, 5], [ -2, -15, 30, 6], [  4, -14, 28, 6],
        [ 10, -12, 24, 5], [ 15, -10, 20, 4],
    ];
    for (const [oy, ox, w, h] of SLABS) p(ox - 1, oy, CO, w + 2, h);
    for (const { col, ix, iy } of [
        { col: R1, ix: 0, iy: 0 }, { col: R2, ix: 2, iy: 2 },
        { col: R3, ix: 5, iy: 4 }, { col: R4, ix: 8, iy: 7 },
    ]) {
        for (const [oy, ox, w, h] of SLABS) {
            if (oy < -7 + iy || oy + h > 19 - iy) continue;
            const li = Math.max(0, ix - 2), ri = ix + 2;
            const nw = w - li - ri;
            if (nw > 0) p(ox + li, oy, col, nw, h);
        }
    }
    p(-14, -7, HL, 28, 1);                                  // top highlight
    // Slab seams — the plating is cracked, not smooth
    p(-13, -2, CO, 26, 1); p(-11, 5, CO, 22, 1); p(-9, 11, CO, 18, 1);

    // ── MOLTEN CORE — the brightest thing on the sprite ───────────────────
    // Stepped, not a slab — a rectangular block of white read as a UI element
    // rather than as molten rock showing through a crack in the plating.
    ctx.save();
    ctx.globalAlpha = 0.80 + fire * 0.20;
    p(-5, -5, CO, 10, 12);                                  // ragged rock lip
    pg(-4, -4, LAVA, 3, 3); pg(-3, -5, LAVA, 6, 2); pg(-4, -1, LAVA, 8, 4);
    pg( 1, -4, LAVA, 3, 3); pg(-3,  3, LAVA, 6, 3); pg(-2,  6, LAVA, 4, 1);
    pg(-2, -3, LAVAH, 4, 3); pg(-3,  0, LAVAH, 6, 3); pg(-1,  3, LAVAH, 3, 2);
    pg(-1, -1, WHITE, 2, 2);
    pg( 0,  1, WHITE, 1, 1);
    ctx.restore();
    // Veins bleeding out of the core
    ctx.save();
    ctx.globalAlpha = 0.60 + fire * 0.30;
    pg(-10, 0, LAVA, 6, 1); pg( 5, 2, LAVA, 6, 1);
    pg(-8, 7, LAVA, 1, 6);  pg( 7, 6, LAVA, 1, 7);
    pg(-2, 8, LAVAH, 3, 1);
    ctx.restore();

    // ── ARMS — heavy, cracked, one shoulder shattered open ────────────────
    p(-20, -8, CO, 7, 16); p(-19, -7, R2, 5, 14); p(-19, -7, R4, 2, 8);
    p(-19, -7, HL, 5, 1);
    ctx.save(); ctx.globalAlpha = 0.7 + fire * 0.3;
    pg(-18, -3, LAVA, 1, 7);
    ctx.restore();
    p(-20,  8, CO, 7, 6); p(-19, 9, R3, 5, 4);
    p( 14, -6, CO, 7, 16); p( 15, -5, R2, 5, 14); p( 15, -5, R4, 2, 8);
    p( 15, -5, HL, 5, 1);
    ctx.save(); ctx.globalAlpha = 0.7 + fire * 0.3;
    pg( 18, -1, LAVA, 1, 7);
    ctx.restore();
    p( 14, 10, CO, 7, 6); p( 15, 11, R3, 5, 4);

    // ── LEGS — squat and planted, cracks glowing at the joints ────────────
    p(-11, 19, CO, 9, 12); p( 3, 19, CO, 9, 12);
    p(-10, 20, R1, 7, 10); p( 4, 20, R1, 7, 10);
    p( -9, 21, R2, 4,  8); p( 5, 21, R2, 4,  8);
    p(-10, 20, R4, 7,  1); p( 4, 20, R4, 7,  1);
    ctx.save(); ctx.globalAlpha = 0.6 + fire * 0.3;
    pg(-8, 22, LAVA, 1, 5); pg( 7, 22, LAVA, 1, 5);
    ctx.restore();
    p(-12, 31, CO, 11, 3); p( 2, 31, CO, 11, 3);            // splayed feet
    p(-11, 32, R2,  9, 1); p( 3, 32, R2,  9, 1);

    ctx.restore();
}

/**
 * --- TIME RAVAGER (time_ravager) ---
 * 시간의 포식자: A cowled wraith whose ribcage is an hourglass. Two tapered
 * glass bulbs joined by a gold collar, sand running from the upper into the
 * lower and piling up as it goes. Broken clock hands orbit it. The old version
 * stacked two rounded boxes with a gold band between them and read as a lamp.
 */
function drawTimeRavager(cx, cy, enemy) {
    const now = Date.now();
    const S   = 2.0;
    const pulse = (Math.sin(now * 0.004) + 1) / 2;
    const fall  = (now * 0.0018) % 1;
    const drift = Math.sin(now * 0.0022) * 1.5;
    const spin  = now * 0.0012;
    const p  = (ox, oy, col, w = 1, h = 1) => pEnemy(ctx, cx, cy + drift, ox, oy, col, w, h, S);
    const pg = (ox, oy, col, w = 1, h = 1) => pEnemyGlow(ctx, cx, cy + drift, ox, oy, col, w, h, S);

    const CO = '#000000', VOID = '#000005';
    const C1 = '#0A0820', C2 = '#141035', C3 = '#1E184A', C4 = '#2C2568', C5 = '#3D3488';
    const HL = '#564BAA';
    const G1 = '#2E1F00', G2 = '#5A3E00', G3 = '#8C6200', G4 = '#C29010', G5 = '#F0C64A';
    const GLASS = `rgba(150,190,255,${0.16 + pulse * 0.10})`;
    const SAND  = `rgba(240,190,60,${0.85 + pulse * 0.15})`;
    const SANDH = `rgba(255,238,170,${0.85 + pulse * 0.15})`;
    const EYE   = `rgba(160,110,255,${0.75 + pulse * 0.25})`;
    const EYEH  = `rgba(232,214,255,${0.85 + pulse * 0.15})`;

    ctx.save();
    ctx.globalAlpha = 0.94;

    // ── TIME-DISTORTION AURA ──────────────────────────────────────────────
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.11 + pulse * 0.11;
    const ar = (26 + pulse * 5) * S;
    const ag = ctx.createRadialGradient(cx, cy, 0, cx, cy, ar);
    ag.addColorStop(0, 'rgba(110,60,255,0.75)');
    ag.addColorStop(0.55, 'rgba(50,20,140,0.26)');
    ag.addColorStop(1, 'transparent');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.arc(cx, cy, ar, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // ── ORBITING CLOCK-HAND SHARDS ────────────────────────────────────────
    ctx.save();
    for (let i = 0; i < 3; i++) {
        const a = spin + i * 2.09;
        const ox = Math.round(Math.cos(a) * 19);
        const oy = Math.round(Math.sin(a) * 8) - 4;
        ctx.globalAlpha = 0.45 + pulse * 0.30;
        p(ox, oy, CO, (i % 2 ? 5 : 2), (i % 2 ? 2 : 6));
        pg(ox, oy, G4, (i % 2 ? 4 : 1), (i % 2 ? 1 : 5));
    }
    ctx.restore();

    // ── COWL — pointed hood, no face inside, only two lights ──────────────
    p(-2, -33, CO, 5, 2);
    p(-5, -31, CO, 11, 2);
    p(-7, -29, CO, 15, 2);
    p(-8, -27, CO, 17, 8);
    p(-6, -30, C1, 12, 2); p(-7, -28, C1, 15, 7);
    p(-5, -29, C2, 10, 2); p(-6, -27, C2, 13, 6);
    p(-4, -28, C3,  8, 2); p(-5, -26, C3, 10, 4);
    p(-3, -27, C4,  5, 2); p(-3, -25, C4,  5, 2);
    p(-6, -30, HL, 11, 1);                                  // top highlight
    p(-4, -28, C5,  6, 1);
    p(-6, -24, VOID, 13, 5);                                // hollow of the hood

    // ── EYES — two cold lights deep in the cowl ───────────────────────────
    pg(-4, -22, EYE, 3, 2); pg( 2, -22, EYE, 3, 2);
    pg(-3, -22, EYEH, 1, 1); pg( 3, -22, EYEH, 1, 1);

    // ── SHOULDER MANTLE ───────────────────────────────────────────────────
    p(-12, -19, CO, 25, 4);
    p(-11, -18, C1, 23, 3); p(-9, -18, C2, 19, 2); p(-6, -18, C3, 13, 1);
    p(-11, -18, HL, 23, 1);
    p(-13, -18, CO, 3, 5); p( 11, -18, CO, 3, 5);           // pauldron nubs
    p(-12, -17, G2, 1, 3); p( 12, -17, G2, 1, 3);

    // ── UPPER BULB — tapers DOWN to the collar ────────────────────────────
    const UP = [
        [-15, -10, 20, 2], [-13, -9, 18, 2], [-11, -8, 16, 2],
        [ -9, -7, 14, 2], [ -7, -5, 10, 2], [ -5, -4,  8, 2], [-3, -3, 6, 2],
    ];
    for (const [oy, ox, w, h] of UP) { p(ox - 1, oy, CO, w + 2, h); p(ox, oy, GLASS, w, h); }
    p(-11, -16, CO, 22, 1); p(-10, -15, G3, 20, 1);         // rim of the bulb
    p(-10, -15, G5, 20, 1);

    // ── SAND still in the upper bulb (drains as `fall` advances) ──────────
    const upSand = Math.round(6 * (1 - fall));
    if (upSand > 0) {
        ctx.save(); ctx.globalAlpha = 0.9;
        for (let r = 0; r < upSand; r++) {
            const rowW = 18 - r * 3;
            pg(-(rowW >> 1), -9 + r * 2, SAND, rowW, 2);
        }
        pg(-7, -9, SANDH, 12, 1);
        ctx.restore();
    }

    // ── GOLD COLLAR — the waist of the hourglass ──────────────────────────
    p(-4, -1, CO, 9, 4);
    p(-3,  0, G2, 7, 2); p(-3, 0, G4, 7, 1); p(-2, 1, G3, 5, 1);
    p(-3,  0, G5, 3, 1);                                    // top highlight

    // ── FALLING SAND STREAM ───────────────────────────────────────────────
    ctx.save();
    ctx.globalAlpha = 0.8 + pulse * 0.2;
    pg(-1, 2, SAND, 2, 6 + Math.round(fall * 3));
    pg( 0, 2, SANDH, 1, 4);
    ctx.restore();

    // ── LOWER BULB — mirrors the upper, widening downward ─────────────────
    const LO = [
        [ 3, -3, 6, 2], [ 5, -5, 8, 2], [ 7, -7, 10, 2],
        [ 9, -9, 14, 2], [11, -11, 16, 2], [13, -13, 18, 2], [15, -15, 20, 2],
    ];
    for (const [oy, ox, w, h] of LO) { p(ox - 1, oy, CO, w + 2, h); p(ox, oy, GLASS, w, h); }
    p(-11, 17, CO, 22, 1); p(-10, 17, G3, 20, 1);

    // ── SAND PILE — grows as the upper bulb empties ───────────────────────
    const pile = Math.round(5 * fall) + 1;
    ctx.save(); ctx.globalAlpha = 0.9;
    for (let r = 0; r < pile; r++) {
        const rowW = 6 + r * 3;
        pg(-(rowW >> 1), 16 - r * 2, SAND, rowW, 2);
    }
    pg(-2, 16 - (pile - 1) * 2, SANDH, 4, 1);
    ctx.restore();

    // ── GOLD ARMATURE — three struts caging the glass ─────────────────────
    for (const sx of [-12, 11]) {
        p(sx, -15, G1, 2, 32); p(sx, -15, G3, 1, 32); p(sx, -15, G5, 1, 2);
    }
    p(-1, -16, G2, 2, 1); p(-1, 17, G2, 2, 1);

    // ── ROBE TAILS — tattered, drifting ───────────────────────────────────
    ctx.save();
    for (let i = 0; i < 5; i++) {
        const tx = -11 + i * 5;
        const tl = 7 + Math.round(Math.sin(now * 0.003 + i) * 3);
        ctx.globalAlpha = 0.82 - i * 0.05;
        p(tx, 18, C1, 4, tl);
        p(tx, 18, C2, 2, tl - 2);
        ctx.globalAlpha = 0.42;
        p(tx + 1, 18 + tl, VOID, 2, 3);
    }
    ctx.restore();

    ctx.restore();
}

/**
 * --- VOID MASTER (void_master) ---
 * 공허의 지배자: A sphere of nothing with one enormous eye. The orb is stepped
 * into an actual circle rather than a rounded rectangle, ringed by an event
 * horizon that is brighter than the body it surrounds, and trailed by orbiting
 * shards that fall INTO it. Its ramp lights toward the upper-left like every
 * other sprite, so it still reads as a solid object rather than a hole.
 */
function drawVoidMaster(cx, cy, enemy) {
    const now = Date.now();
    const S   = 2.0;
    const pulse = (Math.sin(now * 0.003) + 1) / 2;
    const iris  = (Math.sin(now * 0.0071) + 1) / 2;
    const rot   = now * 0.001;
    const bob   = Math.sin(now * 0.0019) * 2;
    const p  = (ox, oy, col, w = 1, h = 1) => pEnemy(ctx, cx, cy + bob, ox, oy, col, w, h, S);
    const pg = (ox, oy, col, w = 1, h = 1) => pEnemyGlow(ctx, cx, cy + bob, ox, oy, col, w, h, S);

    const CO = '#000000', VOID = '#000005';
    const V1 = '#030309', V2 = '#080816', V3 = '#0E0E26', V4 = '#16163A', V5 = '#212152';
    const HL = '#31316E';
    const RING  = `rgba(90,20,190,${0.55 + pulse * 0.35})`;
    const NULL_ = `rgba(0,210,255,${0.60 + pulse * 0.30})`;
    const IRISC = `rgba(0,170,255,${0.75 + iris * 0.25})`;
    const CORE  = `rgba(190,245,255,${0.85 + iris * 0.15})`;

    // Stepped circle, r ~14. [oy, ox, w, h]
    const ORB = [
        [-14, -5, 10, 1], [-13, -7, 14, 1], [-12, -9, 18, 1], [-11, -10, 20, 1],
        [-10, -11, 22, 2], [ -8, -12, 24, 2], [ -6, -13, 26, 3], [ -3, -14, 28, 6],
        [  3, -13, 26, 2], [  5, -12, 24, 2], [  7, -11, 22, 2], [  9, -10, 20, 1],
        [ 10,  -9, 18, 1], [ 11,  -7, 14, 1], [ 12,  -5, 10, 2],
    ];

    ctx.save();
    ctx.globalAlpha = 0.95;

    // ── NULLIFICATION AURA ────────────────────────────────────────────────
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.12 + pulse * 0.12;
    const ar = (30 + pulse * 6) * S;
    const ag = ctx.createRadialGradient(cx, cy, 0, cx, cy, ar);
    ag.addColorStop(0, 'rgba(0,150,220,0.55)');
    ag.addColorStop(0.45, 'rgba(60,0,140,0.32)');
    ag.addColorStop(1, 'transparent');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.arc(cx, cy, ar, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // ── ORBITING SHARDS — spiralling inward, drawn BEHIND the orb ─────────
    for (let i = 0; i < 7; i++) {
        const a = rot * (1 + i * 0.08) + (i / 7) * Math.PI * 2;
        const r = 20 + Math.sin(rot * 2 + i) * 5;
        const sx = Math.round(Math.cos(a) * r);
        const sy = Math.round(Math.sin(a) * r * 0.55);
        const sz = 1 + (i % 3 === 0 ? 1 : 0);
        ctx.save();
        ctx.globalAlpha = 0.35 + pulse * 0.35;
        p(sx, sy, CO, sz + 1, sz + 1);
        pg(sx, sy, RING, sz, sz);
        ctx.restore();
    }

    // ── ORB — outline, then a 5-step ramp lit from the upper-left ─────────
    for (const [oy, ox, w, h] of ORB) p(ox - 1, oy, CO, w + 2, h);
    for (const { col, ix, iy } of [
        { col: V1, ix: 0,  iy: 0 }, { col: V2, ix: 2, iy: 2 }, { col: V3, ix: 4, iy: 4 },
        { col: V4, ix: 7,  iy: 7 }, { col: V5, ix: 10, iy: 10 },
    ]) {
        for (const [oy, ox, w, h] of ORB) {
            if (oy < -14 + iy || oy + h > 14 - iy) continue;
            const li = Math.max(0, ix - 2), ri = ix + 2;
            const nw = w - li - ri;
            if (nw > 0) p(ox + li, oy, col, nw, h);
        }
    }
    p(-9, -12, HL, 18, 1);                                  // top highlight
    p(-6, -11, V5, 12, 1);
    p(-4, -12, CORE, 2, 1);                                 // sky-bounce spec

    // ── EVENT HORIZON — a bright rim ON the silhouette edge ───────────────
    ctx.save();
    ctx.globalAlpha = 0.30 + pulse * 0.35;
    for (const [oy, ox, w, h] of ORB) {
        pg(ox, oy, RING, 1, h);
        pg(ox + w - 1, oy, RING, 1, h);
    }
    pg(-5, -14, RING, 10, 1); pg(-5, 13, RING, 10, 1);
    ctx.restore();

    // ── CENTRAL EYE — stepped round, not a square. A rectangular iris read as
    //    a UI icon pasted on the orb rather than an eye set into it. ───────
    const EYEB = [                                          // [oy, ox, w, h]
        [-7, -3, 6, 1], [-6, -5, 10, 1], [-5, -6, 12, 1], [-4, -7, 14, 2],
        [-2, -7, 14, 4], [ 2, -7, 14, 1], [ 3, -6, 12, 1], [ 4, -5, 10, 1],
        [ 5, -3,  6, 1],
    ];
    for (const [oy, ox, w, h] of EYEB) p(ox - 1, oy, CO, w + 2, h);
    for (const [oy, ox, w, h] of EYEB) p(ox, oy, VOID, w, h);
    ctx.save();
    ctx.globalAlpha = 0.55 + pulse * 0.25;
    for (const [oy, ox, w, h] of EYEB) pg(ox, oy, NULL_, w, h);   // sclera haze
    ctx.restore();
    // Iris: the same disc pulled in by one art-pixel a side
    for (const [oy, ox, w, h] of EYEB) {
        if (oy < -6 || oy + h > 5) continue;
        if (w - 2 > 0) pg(ox + 1, oy, IRISC, w - 2, h);
    }
    for (const [oy, ox, w, h] of EYEB) {
        if (oy < -5 || oy + h > 4) continue;
        if (w - 4 > 0) p(ox + 2, oy, '#031A33', w - 4, h);        // iris depth
    }
    const er = 3 + Math.round(iris * 2);                    // pupil dilates
    p(-(er >> 1) - 1, -(er >> 1) - 1, VOID, er + 2, er + 2);
    pg( 2, -4, CORE, 2, 2);                                 // catch-light, upper-right
    pg(-4, -2, CORE, 1, 1);

    // ── LID RIDGES — a brow, so it reads as looking at you ────────────────
    p(-6, -9, CO, 13, 2); p(-5, -8, V3, 11, 1);
    p(-6,  7, CO, 13, 2); p(-5,  7, V3, 11, 1);

    // ── SATELLITE EYES on the shell, blinking out of phase ────────────────
    const SAT = [[-11, -5], [8, -3], [-10, 6], [7, 7]];
    for (let i = 0; i < SAT.length; i++) {
        const ex = SAT[i][0], ey = SAT[i][1];
        p(ex - 1, ey - 1, CO, 4, 4);
        p(ex, ey, VOID, 2, 2);
        if (Math.sin(now * 0.0031 + i * 1.9) > 0.82) continue;
        pg(ex, ey, IRISC, 2, 1);
        pg(ex, ey, CORE, 1, 1);
    }

    // ── TENDRILS — hang below, drawn last so they overlap the shell ───────
    ctx.save();
    for (let i = 0; i < 5; i++) {
        const tx = -10 + i * 5;
        const tl = 6 + Math.round(Math.sin(rot * 3 + i * 1.1) * 4);
        ctx.globalAlpha = 0.8 - i * 0.05;
        p(tx, 13, CO, 3, tl);
        p(tx, 13, V3, 1, tl - 1);
        ctx.globalAlpha = 0.45;
        p(tx + 1, 13 + tl, VOID, 1, 3);
    }
    ctx.restore();

    ctx.restore();
}

/**
 * --- SIN INCARNATE (sin_incarnate) ---
 * 죄의 화신: A corruption blob that hardens as it is punished — defence scales
 * with damage taken. Amorphous violet mass, no straight edges, studded with
 * mismatched eyes that never blink in unison, split by a bone-fanged maw.
 * Ramp hue-shifts blue in the darks and magenta in the lights.
 */
function drawSinIncarnate(cx, cy, enemy) {
    const now = Date.now();
    const S   = 2.0;
    const pulse   = (Math.sin(now * 0.005) + 1) / 2;
    const writhe  = Math.sin(now * 0.0032);
    const breathe = Math.sin(now * 0.0021) * 1.5;
    const p  = (ox, oy, col, w = 1, h = 1) => pEnemy(ctx, cx, cy + breathe, ox, oy, col, w, h, S);
    const pg = (ox, oy, col, w = 1, h = 1) => pEnemyGlow(ctx, cx, cy + breathe, ox, oy, col, w, h, S);

    const CO = '#000000', VOID = '#050008';
    const V1 = '#1A0530', V2 = '#2C0A4A', V3 = '#431466', V4 = '#5E2585', V5 = '#7E3DA6';
    const HL = '#A15CC4';
    const BONE = '#D8C0A8', BONEH = '#F5EAD8';
    const EYE  = `rgba(255,60,200,${0.75 + pulse * 0.25})`;
    const EYEH = `rgba(255,215,255,${0.85 + pulse * 0.15})`;
    const VEIN = `rgba(150,20,230,${0.35 + pulse * 0.35})`;

    // Irregular silhouette: [oy, ox, w, h]. Deliberately lumpy — the old version
    // was a plain rectangle with concentric insets and read as a box.
    const BANDS = [
        [-26, -5, 10, 1], [-25, -7, 14, 1], [-24, -9, 18, 1], [-23, -10, 20, 2],
        [-21, -12, 24, 3], [-18, -13, 26, 4], [-14, -14, 28, 4], [-10, -13, 27, 4],
        [ -6, -12, 25, 4], [ -2, -11, 22, 3], [  1,  -9, 18, 3], [  4,  -6, 12, 3],
        [  7,  -4,  8, 2],
    ];
    const TOP = -26, BOT = 9;

    ctx.save();
    ctx.globalAlpha = 0.94;

    // ── CORRUPTION AURA (additive, breathes with the mass) ────────────────
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.13 + pulse * 0.14;
    const ar = (26 + pulse * 5) * S;
    const ag = ctx.createRadialGradient(cx, cy - 6 * S, 0, cx, cy - 6 * S, ar);
    ag.addColorStop(0, 'rgba(150,0,220,0.85)');
    ag.addColorStop(0.55, 'rgba(90,0,150,0.30)');
    ag.addColorStop(1, 'transparent');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.arc(cx, cy - 6 * S, ar, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // ── OUTLINE silhouette ────────────────────────────────────────────────
    for (const [oy, ox, w, h] of BANDS) p(ox - 1, oy, CO, w + 2, h);
    p(-5, -27, CO, 10, 1);
    p(-4,  9, CO,  8, 1);

    // ── 5-STEP RAMP, each pass inset toward the upper-left light ──────────
    const RAMP = [
        { col: V1, ix: 0,  iy: 0 },
        { col: V2, ix: 2,  iy: 1 },
        { col: V3, ix: 4,  iy: 3 },
        { col: V4, ix: 7,  iy: 6 },
        { col: V5, ix: 10, iy: 10 },
    ];
    for (const { col, ix, iy } of RAMP) {
        for (const [oy, ox, w, h] of BANDS) {
            if (oy < TOP + iy || oy + h > BOT - iy) continue;
            const li = Math.max(0, ix - 1), ri = ix + 1;   // lit core sits left
            const nw = w - li - ri;
            if (nw <= 0) continue;
            p(ox + li, oy, col, nw, h);
        }
    }

    // ── TOP HIGHLIGHT (1px crown on each upper mass) ──────────────────────
    p(-9, -24, HL, 18, 1);
    p(-12, -21, V5, 24, 1);
    p(-7, -23, BONEH, 3, 1);                               // sky-bounce spec

    // ── CORRUPTION VEINS (crawl with writhe) ──────────────────────────────
    ctx.save();
    ctx.globalAlpha = 0.34 + pulse * 0.34;
    p(-9 + writhe, -19, VEIN, 2, 17);
    p(-4, -22, VEIN, 2, 13);
    p( 5 - writhe, -17, VEIN, 2, 14);
    p( 0, -11, VEIN, 2, 12);
    p(-6, -6, VEIN, 9, 1);
    ctx.restore();

    // ── EYES — mismatched sizes, out of phase, sunk in black sockets ──────
    const EYES = [
        [-9, -19, 3], [ 3, -17, 3], [-6, -13, 2], [ 6, -10, 2],
        [-11, -8, 2], [ 1,  -5, 3], [-8,  -2, 2], [ 4,   1, 2], [-2, -22, 2],
    ];
    for (let i = 0; i < EYES.length; i++) {
        const ex = EYES[i][0], ey = EYES[i][1], es = EYES[i][2];
        const blink = Math.sin(now * 0.0026 + i * 1.7) > 0.86 ? 0 : 1;
        p(ex - 1, ey - 1, CO, es + 2, es + 2);             // socket rim
        p(ex, ey, VOID, es, es);
        if (!blink) continue;
        pg(ex, ey + (es > 2 ? 1 : 0), EYE, es, es > 2 ? 2 : 1);
        pg(ex + (es > 2 ? 1 : 0), ey + (es > 2 ? 1 : 0), EYEH, 1, 1);
    }

    // ── MAW — silent scream, pale fangs top and bottom ────────────────────
    p(-5, -10, CO, 11, 1);
    p(-6,  -9, VOID, 13, 5);
    p(-5,  -9, BONE, 1, 3); p(-2, -9, BONE, 1, 2); p( 1, -9, BONE, 1, 3); p( 4, -9, BONE, 1, 2);
    p(-5,  -9, BONEH, 1, 1); p( 1, -9, BONEH, 1, 1);
    p(-4,  -6, BONE, 1, 2); p( 0, -6, BONE, 1, 2); p( 3, -6, BONE, 1, 2);
    p(-6,  -4, CO, 13, 1);

    // ── TENTACLE LIMBS (writhing, tapered to black tips) ──────────────────
    ctx.save();
    ctx.globalAlpha *= 0.92;
    p(-17 + writhe, -16, CO, 4, 13); p(-16 + writhe, -15, V2, 2, 11);
    p(-16 + writhe,  -3, CO, 2,  5); p(-16 + writhe,   2, VOID, 2, 2);
    p( 14 - writhe, -14, CO, 4, 11); p( 15 - writhe, -13, V2, 2,  9);
    p( 15 - writhe,  -3, CO, 2,  4); p( 15 - writhe,   1, VOID, 2, 2);
    p(-13,  4, CO, 3, 9); p(-12, 5, V2, 1, 7); p(-12, 13, VOID, 2, 2);
    p( 11,  3, CO, 3, 8); p( 12, 4, V2, 1, 6); p( 12, 11, VOID, 2, 2);
    ctx.restore();

    ctx.restore();
}

/**
 * --- CORRUPTION APOSTLE (corruption_apostle) ---
 * 타락의 사도: A priest who kept the vestments and lost everything else. Tall
 * peaked cowl over an empty hood, robe flaring to a wide skirt, hands still
 * raised in a blessing that no longer blesses. Its halo hangs INVERTED beneath
 * the chin, and the gold trim has gone black-green with tarnish — the holy
 * vocabulary of the ally sprites, read backwards.
 */
function drawCorruptionApostle(cx, cy, enemy) {
    const now = Date.now();
    const S   = 2.0;
    const pulse  = (Math.sin(now * 0.003) + 1) / 2;
    const floatY = Math.sin(now * 0.0015) * 5;
    const sway   = Math.sin(now * 0.0021) * 1.5;
    const bead   = now * 0.0026;
    const p  = (ox, oy, col, w = 1, h = 1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);
    const pg = (ox, oy, col, w = 1, h = 1) => pEnemyGlow(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO = '#000000', VOID = '#000005';
    const R1 = '#06021A', R2 = '#0D0430', R3 = '#160948', R4 = '#221060', R5 = '#331C82';
    const HL = '#4A2CA8';
    const T1 = '#1A1A08', T2 = '#33301A', T3 = '#4E4A24', T4 = '#6E6830';  // tarnished gold
    const EYE  = `rgba(210,0,255,${0.78 + pulse * 0.22})`;
    const EYEH = `rgba(255,214,255,${0.85 + pulse * 0.15})`;
    const BLOOD = `rgba(120,0,60,${0.45 + pulse * 0.30})`;
    const HALO  = `rgba(150,0,240,${0.55 + pulse * 0.35})`;

    ctx.save();
    ctx.globalAlpha = 0.96;

    // ── UNHOLY AURA ───────────────────────────────────────────────────────
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.12 + pulse * 0.13;
    const ar = (30 + pulse * 6) * S;
    const ag = ctx.createRadialGradient(cx, cy - 6 * S, 0, cx, cy - 6 * S, ar);
    ag.addColorStop(0, 'rgba(140,0,230,0.68)');
    ag.addColorStop(0.55, 'rgba(60,0,110,0.24)');
    ag.addColorStop(1, 'transparent');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.arc(cx, cy - 6 * S, ar, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // ── ROBE — narrow shoulders flaring to a wide skirt ───────────────────
    const ROBE = [
        [-14, -8, 17, 3], [-11, -10, 21, 4], [ -7, -11, 23, 5],
        [ -2, -12, 25, 5], [  3, -13, 27, 5], [  8, -15, 31, 5],
        [ 13, -17, 35, 4],
    ];
    for (const [oy, ox, w, h] of ROBE) p(ox - 1, oy, CO, w + 2, h);
    for (const { col, ix, iy } of [
        { col: R1, ix: 0, iy: 0 }, { col: R2, ix: 2, iy: 1 },
        { col: R3, ix: 5, iy: 4 }, { col: R4, ix: 8, iy: 7 }, { col: R5, ix: 11, iy: 10 },
    ]) {
        for (const [oy, ox, w, h] of ROBE) {
            if (oy < -14 + iy || oy + h > 17 - iy) continue;
            const li = Math.max(0, ix - 2), ri = ix + 2;
            const nw = w - li - ri;
            if (nw > 0) p(ox + li, oy, col, nw, h);
        }
    }
    p(-9, -14, HL, 18, 1);                                  // top highlight
    p(-6, -13, R5, 12, 1);
    // Vertical folds — a robe, not a cone
    for (const fx of [-10, -5, 0, 5, 9]) p(fx, -8, R1, 1, 24);
    for (const fx of [-13, 12]) p(fx, 4, R1, 1, 13);

    // ── TARNISHED HEM ─────────────────────────────────────────────────────
    p(-17, 16, T1, 35, 2); p(-16, 16, T2, 33, 1);
    for (let i = 0; i < 8; i++) p(-15 + i * 4, 16, T3, 2, 1);

    // ── TALL PEAKED COWL ──────────────────────────────────────────────────
    const HOOD = [
        [-38, -2, 5, 2], [-36, -4, 9, 2], [-34, -6, 13, 2],
        [-32, -8, 17, 3], [-29, -9, 19, 4], [-25, -10, 21, 5], [-20, -10, 21, 6],
    ];
    for (const [oy, ox, w, h] of HOOD) p(ox - 1, oy, CO, w + 2, h);
    for (const { col, ix, iy } of [
        { col: R1, ix: 0, iy: 0 }, { col: R2, ix: 1, iy: 1 },
        { col: R3, ix: 3, iy: 3 }, { col: R4, ix: 5, iy: 6 },
    ]) {
        for (const [oy, ox, w, h] of HOOD) {
            if (oy < -38 + iy || oy + h > -14 - iy) continue;
            const li = Math.max(0, ix - 1), ri = ix + 1;
            const nw = w - li - ri;
            if (nw > 0) p(ox + li, oy, col, nw, h);
        }
    }
    p(-8, -32, HL, 17, 1);                                  // top highlight
    p(-6, -31, R5, 12, 1);

    // ── THE HOOD IS EMPTY — a void with two lights in it ──────────────────
    p(-8, -25, VOID, 17, 11);
    p(-8, -25, CO, 17, 1);
    pg(-5, -22, EYE, 3, 2); pg( 2, -22, EYE, 3, 2);
    pg(-4, -22, EYEH, 1, 1); pg( 3, -22, EYEH, 1, 1);
    // A mouth that is only a gap in the dark
    p(-2, -18, VOID, 5, 3);
    pg(-1, -17, EYE, 3, 1);

    // ── INVERTED HALO — hangs under the chin, gapped and guttering ────────
    ctx.save();
    ctx.globalAlpha = 0.55 + pulse * 0.35;
    for (let i = 0; i < 7; i++) {
        const hx = -12 + i * 4;
        const dip = (i === 0 || i === 6) ? -2 : (i === 3 ? 2 : 0);
        if (i === 2) continue;                              // the halo is broken
        p(hx, -12 + dip, CO, 4, 2);
        pg(hx, -12 + dip, HALO, 3, 1);
    }
    ctx.restore();

    // ── INVERTED CROSS on the chest, tarnished ────────────────────────────
    p(-1, -10, T1, 3, 15); p(-1, -10, T3, 1, 15);
    p(-5,  0, T1, 11, 3); p(-4, 0, T3, 9, 1);
    p( 0, -10, T4, 1, 1);

    // ── ROSARY — beads swing on their own cycle ───────────────────────────
    ctx.save();
    ctx.globalAlpha = 0.60 + pulse * 0.28;
    for (let i = 0; i < 7; i++) {
        const t = i / 6;
        const bx = Math.round(-7 + t * 14 + Math.sin(bead + i * 0.5) * 1.5);
        const by = Math.round(-6 + Math.sin(t * Math.PI) * 7);
        p(bx, by, CO, 2, 2);
        p(bx, by, BLOOD, 1, 1);
    }
    ctx.restore();

    // ── BLESSING HANDS — raised, skeletal, still making the sign ──────────
    p(-22 + sway, -10, CO, 8, 4); p(-21 + sway, -9, R2, 6, 2);   // sleeve
    p(-24 + sway, -13, CO, 4, 6); p(-23 + sway, -12, R3, 2, 4);
    p(-25 + sway, -17, CO, 2, 5); p(-22 + sway, -18, CO, 2, 6);  // two raised fingers
    p(-25 + sway, -16, T2, 1, 3); p(-22 + sway, -17, T2, 1, 4);
    p( 14 - sway, -10, CO, 8, 4); p( 15 - sway, -9, R2, 6, 2);
    p( 20 - sway, -13, CO, 4, 6); p( 21 - sway, -12, R3, 2, 4);
    p( 23 - sway, -17, CO, 2, 5); p( 20 - sway, -18, CO, 2, 6);
    p( 23 - sway, -16, T2, 1, 3); p( 20 - sway, -17, T2, 1, 4);

    // ── SHADOW TENDRILS pooling under the hem ─────────────────────────────
    ctx.save();
    for (let i = 0; i < 8; i++) {
        const tx = -16 + i * 4;
        const tl = 5 + Math.round(Math.sin(now * 0.0031 + i * 0.8) * 3);
        ctx.globalAlpha = 0.62 - i * 0.03;
        p(tx, 18, R1, 3, tl);
        ctx.globalAlpha = 0.30;
        p(tx + 1, 18 + tl, VOID, 1, 3);
    }
    ctx.restore();

    ctx.restore();
}

// ── Window Exports ────────────────────────────────────────────────────────
window.drawChainEnforcer = drawChainEnforcer;
window.drawLavaFury = drawLavaFury;
window.drawPainRegenerator = drawPainRegenerator;
window.drawAbyssalAcolyte = drawAbyssalAcolyte;
window.drawImp = drawImp;
window.drawHellspawn = drawHellspawn;
window.drawBrimstoneFiend = drawBrimstoneFiend;
window.drawGoldPhantom = drawGoldPhantom;
window.drawShadowTitan = drawShadowTitan;
window.drawLavaLord = drawLavaLord;
window.drawTimeRavager = drawTimeRavager;
window.drawVoidMaster = drawVoidMaster;
window.drawSinIncarnate = drawSinIncarnate;
window.drawCorruptionApostle = drawCorruptionApostle;
