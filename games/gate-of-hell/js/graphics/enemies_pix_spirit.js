/* enemies_pix_spirit.js — Spirit (악령) — the grieving and the frozen
 * Pixel art draw functions. See enemies_pix_core.js for the sprite standard. */

/**
 * --- SOUL EATER (soul_eater) ---
 * 소울 이터: Starving for an exorcist's power — a dark orb with multiple
 * consuming maws, spinning soul wisps being drawn inward.
 */
function drawSoulEater(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.006) + 1) / 2;
    const spinT  = now * 0.002;
    const drawT  = (now % 1600) / 1600;                                            // souls drawn inward
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, col, w, h, S);

    const CO='#000';
    const O1='#020210', O2='#050520', O3='#080835', O4='#0C0C4A', HL='#14147A', HV='#2828B0';
    const BN='#D8D0C8';                                                            // pale soul-bone
    const MW  = `rgba(0,0,80,0.95)`;
    const TH  = `rgba(100,100,220,${0.65+pulse*0.30})`;
    const THH = `rgba(220,220,255,0.95)`;
    const WP  = `rgba(80,160,255,${0.55+pulse*0.35})`;
    const WPH = `rgba(220,240,255,0.95)`;
    const EG  = `rgba(0,120,255,${0.80+pulse*0.20})`;
    const EGH = `rgba(180,220,255,0.95)`;
    const AB  = `rgba(0,50,200,${0.20+pulse*0.20})`;
    const VOID= '#000005';
    const gA  = 0.92 + pulse * 0.06;

    ctx.save(); ctx.globalAlpha = gA;

    // ── ABSORB AURA (souls being drawn in)
    ctx.save(); ctx.globalAlpha = 0.22 + pulse * 0.20;
    pEnemyAura(ctx, p, -20,-20,AB,40,40);
    ctx.restore();

    // ── 8 ORBITING SOUL WISPS (was 5 — w/ tiny face details, draw-in animation)
    ctx.save();
    for (let i = 0; i < 8; i++) {
        const ang = spinT + (i / 8) * Math.PI * 2;
        const r   = (16 - drawT * 6) + Math.sin(spinT * 2 + i) * 2;               // drawn inward
        const wx  = Math.round(Math.cos(ang) * r);
        const wy  = Math.round(Math.sin(ang) * r * 0.6);
        ctx.globalAlpha = gA * (0.55 - (i % 4) * 0.07 + pulse * 0.20);
        // Tiny ghost head w/ hollow sockets
        pEnemy(ctx, cx + wx * S, cy + wy * S, -1,-3, WP, 3, 5, S);
        pEnemy(ctx, cx + wx * S, cy + wy * S,  0,-2, WPH, 1, 1, S);                // top highlight
        pEnemy(ctx, cx + wx * S, cy + wy * S, -1,-2, CO, 1, 1, S);                 // L eye socket
        pEnemy(ctx, cx + wx * S, cy + wy * S,  1,-2, CO, 1, 1, S);                 // R eye socket
    }
    ctx.restore();

    // ── MAIN ORB OUTLINE (larger)
    p(-9,-15,CO,18,1); p(-11,-14,CO,22,1);
    p(-12,-13,CO,1,22); p(11,-13,CO,1,22);
    p(-11,9,CO,22,1); p(-9,10,CO,18,1);

    // Orb fill — 5 depth layers (top-highlighted)
    p(-11,-14,O1,22,2); p(-11,-12,O2,22,22);
    p(-10,-12,O3,20,20); p(-8,-11,O4,16,18); p(-6,-10,HL,12,16);
    p(-11,-12,HV,22,1);                                                            // top highlight
    p(-10,-13,HL,5,5);

    // ── MAIN CONSUMING MAW (center front, larger w/ inner souls)
    p(-6,-2,CO,12,1); p(-7,-1,MW,14,7);                                            // bigger maw
    p(-6,6,CO,12,1);
    // Glowing teeth (more, alternating size)
    ctx.save(); ctx.globalAlpha = 0.80;
    p(-6,-1,TH,2,5); p(-3,-1,TH,2,5); p( 0,-1,TH,2,5); p( 3,-1,TH,2,5);            // upper fangs
    p(-5,4,TH,2,3); p(-2,4,TH,2,3); p( 2,4,TH,2,3); p( 5,4,TH,2,3);                // lower teeth
    ctx.restore();
    // Bright fang highlights
    ctx.save(); ctx.globalAlpha = 0.85;
    pEnemy(ctx, cx, cy,-6,-1,THH,1,1,S);
    pEnemy(ctx, cx, cy, 0,-1,THH,1,1,S);
    pEnemy(ctx, cx, cy, 4,-1,THH,1,1,S);
    ctx.restore();
    // 2 trapped soul faces inside main maw (silent-screaming)
    ctx.save(); ctx.globalAlpha = 0.65;
    pEnemy(ctx, cx, cy,-4,1,BN,2,2,S); pEnemy(ctx, cx, cy,-3,1,CO,1,1,S);
    pEnemy(ctx, cx, cy, 2,1,BN,2,2,S); pEnemy(ctx, cx, cy, 3,1,CO,1,1,S);
    ctx.restore();

    // ── 2 UPPER SECONDARY MAWS
    p(-10,-10,CO,6,1); p(-11,-9,MW,7,4); p(-10,-9,CO,2,3); p(-8,-9,CO,2,3);
    p(-11,-5,CO,7,1);
    ctx.save(); ctx.globalAlpha = 0.65;
    p(-10,-8,TH,2,2); p(-8,-8,TH,2,2);
    ctx.restore();
    p( 4,-10,CO,6,1); p( 4,-9,MW,7,4); p( 4,-9,CO,2,3); p( 6,-9,CO,2,3);
    p( 4,-5,CO,7,1);
    ctx.save(); ctx.globalAlpha = 0.65;
    p( 4,-8,TH,2,2); p( 6,-8,TH,2,2);
    ctx.restore();

    // ── 2 SIDE MAWS (new — gives 4 secondary maws total, more horror)
    p(-13,-2,CO,2,5); p(-13,-1,MW,2,3);
    ctx.save(); ctx.globalAlpha = 0.55;
    p(-13,0,TH,2,1);
    ctx.restore();
    p( 12,-2,CO,2,5); p( 12,-1,MW,2,3);
    ctx.save(); ctx.globalAlpha = 0.55;
    p( 12,0,TH,2,1);
    ctx.restore();

    // ── HOLLOW EYE SOCKETS above main maw (deeper, ringed)
    p(-7,-7,CO,4,4); p( 3,-7,CO,4,4);
    p(-6,-6,VOID,2,2); p( 4,-6,VOID,2,2);
    p(-6,-6,EG,1,1); p( 4,-6,EG,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy,-6,-6,EGH,1,1,S);
    pEnemy(ctx, cx, cy, 4,-6,EGH,1,1,S);
    ctx.restore();
    // Outer eye aura
    ctx.save(); ctx.globalAlpha = 0.50 + pulse * 0.30;
    pEnemy(ctx, cx, cy,-8,-8,EG,6,5,S);
    pEnemy(ctx, cx, cy, 2,-8,EG,6,5,S);
    ctx.restore();

    // ── VOID-TEAR LEAK (souls overflowing — dark drip below orb)
    const dripA = (now % 1800) / 1800;
    ctx.save(); ctx.globalAlpha = 0.55;
    pEnemy(ctx, cx, cy,-4,10+dripA*4,WP,1,3,S);
    pEnemy(ctx, cx, cy, 3,10+dripA*5,WP,1,3,S);
    pEnemy(ctx, cx, cy, 0,12+dripA*3,WPH,1,2,S);
    ctx.restore();

    ctx.restore();
}

/**
 * --- FROST WALKER (frost) ---
 * 코키토스 방랑자: A frozen grudge's heart that roams Cocytus — pale blue figure
 * trailing ice crystals, accelerating nearby enemies with cold dread.
 */
function drawFrostWalker(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.004) + 1) / 2;
    const floatY = Math.sin(now * 0.003) * 3;
    const crystT = now * 0.0015;
    const breath = (now % 2400) / 2400;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO='#000';
    const IC1='#050E18', IC2='#0A1828', IC3='#10243C', IC4='#183452', HL='#204868', HV='#3A6890';
    const ICE='#6BBCD0', ICE2='#A8DEF0', ICE3='#E0F8FF';
    const BN='#D8E0E8', BNH='#F0F8FF';                                             // pale ice-bone
    const FR  = `rgba(100,200,240,${0.55+pulse*0.40})`;
    const EG  = `rgba(140,220,255,${0.80+pulse*0.20})`;
    const EGH = `rgba(220,240,255,0.95)`;
    const TR  = `rgba(120,200,240,${0.30+pulse*0.25})`;
    const BRTH= `rgba(180,220,240,${0.45*(1-breath)})`;
    const VOID= '#000005';
    const gA  = 0.92 + pulse * 0.06;

    ctx.save(); ctx.globalAlpha = gA;

    // ── FROST AURA
    ctx.save(); ctx.globalAlpha = 0.22 + pulse * 0.22;
    pEnemyAura(ctx, p, -14,-28,FR,28,44);
    ctx.restore();

    // ── FROSTED-BREATH CLOUD (rising from mouth)
    ctx.save(); ctx.globalAlpha = 0.55 * (1 - breath);
    pEnemy(ctx, cx, cy + floatY * S,-2,-12-breath*8, BRTH, 4, 4, S);
    pEnemy(ctx, cx, cy + floatY * S, 1,-14-breath*10, BRTH, 3, 3, S);
    ctx.restore();

    // ── LONGER ICE CRYSTAL TRAIL (was 5 — now 7, denser)
    ctx.save();
    [
        {ox:-5, oy:12, r:5}, {ox: 1, oy:15, r:4},
        {ox:-8, oy:18, r:3}, {ox: 3, oy:20, r:3}, {ox:-2, oy:22, r:2},
        {ox:-6, oy:26, r:2}, {ox: 4, oy:27, r:2},                                 // 2 more
    ].forEach((c,i) => {
        ctx.globalAlpha = gA * (0.45 - i * 0.05 + pulse * 0.12);
        pEnemy(ctx, cx, cy + floatY * S, c.ox, c.oy, ICE, c.r, c.r*2, S);
        pEnemy(ctx, cx, cy + floatY * S, c.ox+1, c.oy+1, ICE2, 1, 1, S);
    });
    ctx.restore();

    // ── 4 FLOATING ICE CRYSTALS (orbit — was 3)
    ctx.save();
    [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].forEach((offset, i) => {
        const ang = crystT + offset;
        const crx = Math.round(Math.cos(ang) * 16);
        const cry = Math.round(Math.sin(ang) * 7 - 5);
        ctx.globalAlpha = gA * (0.60 + 0.30 * Math.sin(crystT + i));
        pEnemy(ctx, cx, cy + floatY * S, crx-1, cry-6, ICE, 3, 10, S);
        pEnemy(ctx, cx, cy + floatY * S, crx,   cry-7, ICE2, 1, 2, S);            // tip glint
        pEnemy(ctx, cx, cy + floatY * S, crx-1, cry+4, ICE, 3, 5, S);             // bottom half
        pEnemy(ctx, cx, cy + floatY * S, crx,   cry-2, ICE3, 1, 1, S);            // bright center
    });
    ctx.restore();

    // ── HEAD OUTLINE
    p(-3,-24,CO,6,1); p(-5,-23,CO,10,1); p(-6,-22,CO,12,1);
    p(-7,-21,CO,1,16); p( 6,-21,CO,1,16); p(-7,-5,CO,14,1);

    // ── HEAD FILLS (top-highlighted)
    p(-5,-23,IC1,10,2); p(-6,-21,IC2,12,16);
    p(-5,-20,IC3,10,14); p(-3,-19,IC4,6,12); p(-1,-18,HL,2,10);
    p(-6,-21,HV,12,1);                                                            // top highlight
    p(-5,-21,ICE,3,4);

    // ── EXPOSED PALE ICE-BONE FACE (skull-like through frost)
    p(-5,-20,VOID,10,9);                                                          // recessed face void
    p(-4,-19,BN,8,7);                                                             // pale bone tone
    // Frost crack on cheek
    ctx.save(); ctx.globalAlpha = 0.55;
    pEnemy(ctx, cx, cy + floatY * S,-2,-14,ICE3,4,1,S);
    ctx.restore();

    // ── HOLLOW ICY EYE SOCKETS (deep void + glowing pinpoint)
    p(-5,-18,CO,4,4); p( 2,-18,CO,4,4);
    p(-4,-17,VOID,2,2); p( 3,-17,VOID,2,2);
    p(-4,-17,EG,1,1); p( 3,-17,EG,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy + floatY * S,-4,-17,EGH,1,1,S);
    pEnemy(ctx, cx, cy + floatY * S, 3,-17,EGH,1,1,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    pEnemy(ctx, cx, cy + floatY * S,-5,-19,FR,5,5,S);
    pEnemy(ctx, cx, cy + floatY * S, 2,-19,FR,5,5,S);
    ctx.restore();

    // ── SILENT-SCREAM ICE MAW (gaping void w/ icicle fangs)
    p(-3,-14,CO,6,4); p(-2,-13,VOID,4,2);
    p(-2,-13,BN,1,2); p( 0,-13,BN,1,2); p( 2,-13,BN,1,2);                         // icicle teeth

    // ── BODY (top-highlighted)
    p(-8,-4,CO,2,2); p( 6,-4,CO,2,2);
    p(-9,-2,CO,1,10); p( 8,-2,CO,1,10); p(-9,8,CO,18,1);
    p(-8,-2,IC2,16,10); p(-6,-1,IC3,12,8); p(-4,0,IC4,8,6);
    p(-8,-2,HV,16,1);                                                             // top highlight
    p(-8,-2,ICE,3,3);

    // ── DRIPPING ICICLE (from chin)
    const dripA = (now % 2000) / 2000;
    ctx.save(); ctx.globalAlpha = 0.65;
    pEnemy(ctx, cx, cy + floatY * S,-1,-6+dripA*5, ICE, 1, 3, S);
    pEnemy(ctx, cx, cy + floatY * S,-1,-3+dripA*4, ICE2, 1, 1, S);
    ctx.restore();

    // ── TAILS (longer, more ice flakes)
    p(-7,9,IC1,3,7); p(-7,16,ICE,2,3);
    p(-1,9,IC2,4,8); p( 0,17,IC1,2,3); p( 1,20,ICE,1,2);
    p( 4,9,IC1,3,6); p( 5,15,ICE,2,3);

    ctx.restore();
}

/**
 * --- FROZEN HEART (frost_outcast) ---
 * 얼어붙은 마음: A heart already frozen before reaching the abyss — a dark soul
 * encased in a jagged ice prison, slowing all unit attack rates nearby.
 */
function drawFrozenHeart(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.003) + 1) / 2;
    const crackP = (Math.sin(now * 0.005) + 1) / 2;
    const breath = (now % 2200) / 2200;
    const handP  = Math.sin(now * 0.004) * 1;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, col, w, h, S);

    const CO='#000';
    const SI1='#040810', SI2='#080E1A', SI3='#0C162A';                             // dark soul interior
    const IC1='#0A1E2E', IC2='#14304A', IC3='#1E4466', IC4='#28587E', HL='#3070A0';
    const ICE='#6BBCD0', ICE2='#B0E4F8', ICE3='#DFFFFF';
    const BN='#D8D0C8';                                                            // pale skeletal hand
    const FR  = `rgba(100,200,240,${0.40+pulse*0.38})`;
    const CK  = `rgba(180,240,255,${0.65+crackP*0.30})`;
    const EG  = `rgba(60,180,255,${0.75+pulse*0.25})`;
    const EGH = `rgba(200,240,255,0.95)`;
    const BRTH= `rgba(180,220,240,${0.50*(1-breath)})`;                            // frost breath
    const VOID= '#000005';
    const gA  = 0.96;

    ctx.save(); ctx.globalAlpha = gA;

    // ── FROST AURA
    ctx.save(); ctx.globalAlpha *= (0.18 + pulse * 0.18);
    pEnemyAura(ctx, p, -18,-32,FR,36,56);
    ctx.restore();

    // ── FROSTED-BREATH WISPS (animated, rising from cracks)
    ctx.save(); ctx.globalAlpha = 0.45 * (1 - breath);
    pEnemy(ctx, cx, cy,-2,-36-breath*8, BRTH, 4, 4, S);
    pEnemy(ctx, cx, cy, 4,-34-breath*10, BRTH, 3, 3, S);
    ctx.restore();

    // ── TRAPPED DARK SOUL INSIDE (more visible — humanoid shape)
    // Soul torso
    p(-6,-21,SI2,12,16);
    p(-5,-20,SI3,10,14);
    // Soul head silhouette
    p(-5,-25,SI1,10,4);
    p(-4,-24,SI2,8,3);
    // Soul lower body
    p(-7,-5,SI1,14,14); p(-5,-4,SI3,10,12);
    // SOUL EYE SOCKETS (glowing through ice)
    p(-4,-22,CO,3,2); p( 2,-22,CO,3,2);
    p(-3,-21,EG,1,1); p( 3,-21,EG,1,1);
    ctx.save(); ctx.globalAlpha = 0.85;
    pEnemy(ctx, cx, cy,-3,-21,EGH,1,1,S);
    pEnemy(ctx, cx, cy, 3,-21,EGH,1,1,S);
    ctx.restore();
    // Outer eye glow through ice
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    pEnemy(ctx, cx, cy,-5,-23,EG,4,3,S);
    pEnemy(ctx, cx, cy, 1,-23,EG,4,3,S);
    ctx.restore();
    // Silent-scream mouth inside ice
    p(-2,-17,CO,4,3); p(-1,-16,VOID,2,1);

    // ── DESPERATE SKELETAL HANDS PRESSING ON INSIDE OF ICE WALLS
    // Left hand pressing on left ice wall
    p(-11+handP,-12,CO,3,5);
    p(-10+handP,-11,BN,1,3); p(-10+handP,-8,BN,1,1);
    p(-11+handP,-7,CO,2,2);                                                       // wrist
    // Right hand pressing on right ice wall
    p(8-handP,-10,CO,3,5);
    p(9-handP,-9,BN,1,3); p(9-handP,-6,BN,1,1);
    p(9-handP,-5,CO,2,2);

    // ── MAIN ICE BLOCK OUTLINE
    // Top jagged crown
    p(-2,-32,CO,4,2); p(-5,-30,CO,2,4); p( 0,-31,CO,2,5); p( 4,-29,CO,2,4);
    p(-8,-28,CO,2,3); p( 6,-28,CO,2,3);
    // Outer ice wall
    p(-13,-26,CO,1,38); p(12,-26,CO,1,38); p(-13,12,CO,26,1);
    p(-12,-26,IC1,25,38); p(-10,-25,IC2,20,36); p(-8,-24,IC3,16,34);
    p(-6,-23,IC4,12,32); p(-4,-22,HL,8,30);
    // Ice specular highlights
    p(-12,-26,ICE,3,10); p( 9,-24,ICE,2,8);
    p(-4,-26,ICE2,4,3);                                                           // top face glint
    p(-12,-26,ICE3,3,1); p( 10,-26,ICE3,2,1);                                     // top edge sheen

    // ── ICE FRACTURES / CRACKS (more, branching)
    ctx.save(); ctx.globalAlpha = 0.60 + crackP * 0.35;
    p(-8,-20,CK,2,14); p(-6,-10,CK,2,10); p(-4,-2,CK,2,8);                        // main diagonal
    p( 2,-22,CK,2,12); p(-10,0,CK,2,8);                                           // secondary
    p(-3,-26,CK,1,6); p( 6,-18,CK,1,10);
    p(-9,8,CK,1,4); p( 8,6,CK,1,5);                                               // lower cracks
    p( 4,-26,CK,1,6);                                                             // top crack
    ctx.restore();
    // Bright crack pinpoints (focal points where ice is fracturing)
    ctx.save(); ctx.globalAlpha = 0.85;
    pEnemy(ctx, cx, cy,-7,-13,ICE3,1,1,S);
    pEnemy(ctx, cx, cy, 3,-15,ICE3,1,1,S);
    pEnemy(ctx, cx, cy,-9,4,ICE3,1,1,S);
    ctx.restore();

    // ── CRYSTAL SPIKES (top, taller + more)
    p(-2,-33,CO,4,3); p(-1,-33,ICE,2,2); p(-1,-34,ICE2,1,1);
    p(-5,-31,CO,3,4); p(-4,-31,ICE,2,3); p(-4,-32,ICE2,1,1);
    p( 3,-30,CO,3,4); p( 4,-30,ICE,2,3); p( 4,-31,ICE2,1,1);
    p(-8,-29,CO,2,3); p(-7,-29,ICE,1,2);
    p( 6,-29,CO,2,3); p( 7,-29,ICE,1,2);
    // Extra tall center spike
    p(-1,-36,CO,3,4); p( 0,-35,ICE,1,3); p( 0,-37,ICE3,1,1);

    // ── ICE PUDDLE AT BASE (melt below)
    ctx.save(); ctx.globalAlpha = 0.45;
    pEnemy(ctx, cx, cy,-14,13,IC1,28,3,S);
    pEnemy(ctx, cx, cy,-12,15,IC2,24,1,S);
    ctx.restore();

    ctx.restore();
}

/**
 * --- EMBER HATRED (ember_hatred) ---
 * 증오의 불꽃: A lifetime of hatred compressed into blazing spirit form —
 * charred skeletal body with roaring inner fire, crown of flames.
 */
function drawEmberHatred(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.006) + 1) / 2;
    const fireT  = now * 0.010;
    const fp     = (Math.sin(fireT) + 1) / 2;
    const floatY = Math.sin(now * 0.004) * 2;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO='#000';
    const C1='#0A0500', C2='#180A00', C3='#281000', C4='#3C1800', HL='#542200', HV='#7A3000';
    const EM='#5A2000';
    const BN='#D8C0A8', BNH='#F0D8B8';                                             // pale skull bone
    const F1  = `rgba(255,80,0,${0.80+fp*0.20})`;
    const F2  = `rgba(255,160,0,${0.65+pulse*0.30})`;
    const F3  = `rgba(255,240,0,${0.45+fp*0.40})`;
    const F4  = `rgba(255,255,200,0.95)`;
    const CR  = `rgba(255,50,0,${0.55+pulse*0.40})`;
    const EG  = `rgba(255,200,0,${0.85+pulse*0.15})`;
    const EGH = `rgba(255,255,140,0.95)`;
    const VOID= '#000005';
    const gA  = 0.92 + pulse * 0.06;

    ctx.save(); ctx.globalAlpha = gA;

    // ── TALLER FIRE CROWN (8 flames now, w/ central tallest)
    ctx.save();
    [
        {ox:-7,h: 8}, {ox:-4,h:12}, {ox:-1,h:18}, {ox: 2,h:14}, {ox: 5,h:10}, {ox: 8,h: 7},
        {ox:-9,h: 6}, {ox: 10,h: 6},
    ].forEach((f, i) => {
        const fa = (0.65 + fp * 0.35) * (0.7 + 0.3 * Math.sin(fireT + i * 1.1));
        ctx.globalAlpha = gA * fa;
        pEnemy(ctx, cx, cy + floatY * S, f.ox-1, -30, CO, 3, f.h, S);
        pEnemy(ctx, cx, cy + floatY * S, f.ox,   -30, F1, 2, f.h, S);
        pEnemy(ctx, cx, cy + floatY * S, f.ox,   -32, F2, 2, f.h-4, S);
        pEnemy(ctx, cx, cy + floatY * S, f.ox,   -33, F3, 1, f.h-6, S);
        pEnemy(ctx, cx, cy + floatY * S, f.ox,   -34, F4, 1, 1, S);                // bright tip
    });
    ctx.restore();

    // ── CHARRED SKULL HEAD (top-highlighted)
    p(-5,-27,CO,10,1); p(-6,-26,CO,12,1);
    p(-7,-25,CO,1,14); p( 6,-25,CO,1,14); p(-7,-11,CO,14,1);
    p(-6,-26,C1,12,2); p(-6,-24,C2,12,14);
    p(-5,-24,C3,10,12); p(-3,-23,C4,6,10); p(-1,-22,HL,2,8);
    p(-6,-24,HV,12,1);                                                            // top highlight
    p(-5,-25,EM,3,4);

    // ── EXPOSED PALE SKULL (through charred cracks — no blood)
    p(-2,-24,VOID,3,5);                                                           // forehead crack
    p(-2,-24,BN,1,5);
    p( 4,-20,VOID,2,4);                                                           // R temple crack
    p( 4,-20,BN,1,4);
    // Inner fire bleeding through cracks (brighter)
    ctx.save(); ctx.globalAlpha = 0.55 + fp * 0.40;
    p(-4,-24,F1,2,10); p( 2,-22,F1,2,8); p(-1,-25,F2,1,6);
    ctx.restore();

    // ── HOLLOW BURNING EYE SOCKETS (deeper void + ember pinpoint)
    p(-5,-21,CO,4,4); p( 2,-21,CO,4,4);
    p(-4,-20,VOID,2,2); p( 3,-20,VOID,2,2);
    p(-4,-20,EG,1,1); p( 3,-20,EG,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy + floatY * S,-4,-20,EGH,1,1,S);
    pEnemy(ctx, cx, cy + floatY * S, 3,-20,EGH,1,1,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.70;
    p(-5,-22,F1,5,5); p( 2,-22,F1,5,5);
    ctx.restore();

    // ── SCREAM MAW (gaping void w/ pale bone fangs)
    p(-4,-15,CO,8,1); p(-5,-14,F1,10,4);
    p(-5,-14,VOID,10,3);
    p(-4,-10,CO,8,1);
    // Pale bone fangs
    p(-4,-14,BN,1,3); p(-1,-14,BN,1,3); p( 2,-14,BN,1,3);
    p(-4,-14,BNH,1,1); p( 2,-14,BNH,1,1);
    ctx.save(); ctx.globalAlpha = 0.65;
    p(-5,-14,F2,10,4); p(-3,-13,F3,6,2);
    ctx.restore();

    // ── CHARRED BODY (top-highlighted, more cracks)
    p(-8,-10,CO,2,2); p( 6,-10,CO,2,2);
    p(-9,-8,CO,1,20); p( 8,-8,CO,1,20); p(-9,12,CO,18,1);
    p(-8,-8,C1,16,20); p(-6,-7,C2,12,18); p(-4,-6,C3,8,16); p(-2,-5,C4,4,14);
    p(-8,-8,HV,16,1);                                                             // top highlight
    // MORE body cracks (extended, revealing fire)
    ctx.save(); ctx.globalAlpha = 0.55 + fp * 0.40;
    p(-7,-6,CR,2,14); p( 3,-4,CR,2,12); p(-2,-8,F1,1,10);
    p(-5,5,CR,1,7); p( 5,7,CR,1,5);                                               // extra body cracks
    p(-3,9,F1,1,4);
    ctx.restore();
    // Bright lava pinpoints
    ctx.save(); ctx.globalAlpha = 0.85;
    pEnemy(ctx, cx, cy + floatY * S,-6,0,F4,1,1,S);
    pEnemy(ctx, cx, cy + floatY * S, 4,2,F4,1,1,S);
    ctx.restore();

    // ── BURNING ARMS w/ bone claws
    p(-14,-6,CO,6,4); p(-13,-5,C2,4,3);
    p(  8,-6,CO,6,4); p(  9,-5,C2,4,3);
    p(-16,-6,CO,3,4); p(-15,-5,BN,1,3);                                           // bone-claw L
    p( 14,-6,CO,3,4); p( 15,-5,BN,1,3);                                           // bone-claw R
    ctx.save(); ctx.globalAlpha = 0.55 + fp * 0.35;
    p(-14,-6,F1,6,4); p(  8,-6,F1,6,4);
    ctx.restore();

    // ── EMBER TAILS (longer, ember-tipped)
    p(-7,13,C1,3,6); p(-7,19,CO,2,3); p(-7,22,F1,1,2);
    p(-1,13,C2,4,7); p( 0,20,F1,2,3); p( 1,23,CO,1,2); p( 1,25,F2,1,1);
    p( 4,13,C1,3,5); p( 5,18,CO,2,3); p( 5,21,F1,1,2);
    ctx.save(); ctx.globalAlpha = 0.55 + fp * 0.35;
    p(-7,18,F1,2,3); p( 0,19,F2,2,3);
    ctx.restore();

    ctx.restore();
}

/**
 * --- LOST CHILD (spirit d1) ---
 * 미아 영혼: The faint spirit of a child who died lost — small, confused,
 * eyes wide with longing, forever searching for a way home.
 */
function drawLostChild(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.003) + 1) / 2;
    const floatY = Math.sin(now * 0.004) * 4;
    const hairF  = Math.sin(now * 0.003) * 1;
    const lantF  = Math.sin(now * 0.006) * 1;
    const tearT  = (now % 2000) / 2000;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO='#000';
    const L1='#060810', L2='#0C1020', L3='#121830', HL='#1A2040', HV='#28304A';
    const HR='#0A0A14', HRH='#1A1A2A';                                             // dark hair
    const SH='#1A2030', SHL='#2A3A50';                                             // funeral shroud
    const EG  = `rgba(140,180,255,${0.75+pulse*0.24})`;                            // sad blue eyes
    const EGH = `rgba(200,220,255,0.9)`;
    const AU  = `rgba(50,80,140,${0.10+pulse*0.15})`;
    const TR  = `rgba(20,30,60,${0.55+pulse*0.38})`;
    const LANT= `rgba(120,180,255,${0.65+pulse*0.30})`;                            // lantern soul-flame
    const LANTH=`rgba(220,240,255,0.9)`;
    const VOID='#000005';

    // ── faint loneliness aura
    ctx.save(); ctx.globalAlpha = 0.20 + pulse * 0.18;
    pEnemyAura(ctx, p, -12,-20,AU,24,34);
    ctx.restore();

    // ── DRIFTING HAIR (long, streaming down sides + tuft on top)
    ctx.save(); ctx.globalAlpha = 0.75;
    p(-6+hairF,-18,CO,12,3); p(-5+hairF,-17,HR,10,2);                             // hood/hair top
    p(-3+hairF,-21,CO,4,4); p(-2+hairF,-20,HR,2,3); p(-2+hairF,-20,HRH,2,1);      // hair tuft
    ctx.restore();
    // Long side-strands
    p(-8,-12,HR,1,10); p(-8,-2,HR,1,3);
    p( 7,-12,HR,1,10); p( 7,-2,HR,1,3);

    // ── SMALL HEAD (top-highlighted, paler)
    p(-5,-16,CO,10,2); p(-6,-14,CO,12,1);
    p(-7,-13,CO,1,10); p( 6,-13,CO,1,10); p(-5,-3,CO,10,1);
    p(-6,-15,L1,10,2); p(-6,-13,L2,12,10); p(-5,-12,L3,10,8); p(-3,-11,HL,6,6);
    p(-6,-13,HV,12,1);                                                            // top highlight

    // ── HOLLOW EYE SOCKETS (deep pits w/ sad blue pinpoint)
    p(-5,-9,CO,4,4); p( 1,-9,CO,4,4);
    p(-4,-8,VOID,2,2); p( 2,-8,VOID,2,2);
    p(-4,-8,EG,2,1); p( 2,-8,EG,2,1);
    ctx.save(); ctx.globalAlpha = 0.85 + pulse * 0.15;
    pEnemy(ctx,cx,cy + floatY * S,-4,-8,EGH,2,1,S);
    pEnemy(ctx,cx,cy + floatY * S, 2,-8,EGH,2,1,S);
    ctx.restore();
    // Outer eye glow
    ctx.save(); ctx.globalAlpha = 0.40 + pulse * 0.25;
    pEnemy(ctx,cx,cy + floatY * S,-6,-10,EG,5,5,S);
    pEnemy(ctx,cx,cy + floatY * S, 0,-10,EG,5,5,S);
    ctx.restore();

    // ── FROZEN TEAR STREAKS (slow descent from sockets)
    ctx.save(); ctx.globalAlpha = 0.70;
    pEnemy(ctx,cx,cy + floatY * S,-3,-5+tearT*4,EG,1,2,S);
    pEnemy(ctx,cx,cy + floatY * S, 3,-5+tearT*5,EG,1,2,S);
    ctx.restore();
    // Dried tear marks (always)
    p(-3,-5,L1,1,2); p( 3,-5,L1,1,2);

    // ── SMALL SAD MOUTH (tiny silent gape)
    p(-2,-4,CO,4,2); p(-1,-3,VOID,2,1);

    // ── FUNERAL SHROUD BODY (ragged, layered)
    p(-6,-2,CO,12,3); p(-7,-1,CO,14,1);
    p(-8,0,CO,1,12); p( 7,0,CO,1,12); p(-6,12,CO,12,1);
    p(-7,-1,SH,14,12); p(-5,0,L2,10,11); p(-3,1,L3,6,9); p(-1,2,HL,2,7);
    p(-7,-1,SHL,14,1);                                                            // top highlight
    // Ragged hem
    p(-7,12,CO,3,3); p(-3,12,CO,3,3); p( 1,12,CO,3,3); p( 5,12,CO,3,3);

    // ── TINY REACHING HANDS (small + pale)
    p(-10,2,CO,3,4); p(-9,3,L2,2,3); p(-9,3,L3,2,1);
    p( 7,2,CO,3,4); p( 8,3,L2,2,3); p( 8,3,L3,2,1);

    // ── TATTERED GHOST LANTERN (held in one tiny hand, soul-flame inside)
    p(8+lantF,5,CO,6,8); p(9+lantF,6,L2,4,6); p(9+lantF,6,SHL,4,1);                // lantern body
    p(8+lantF,4,CO,6,2); p(9+lantF,4,L3,4,1);                                     // top cap
    p(7+lantF,13,CO,8,2); p(8+lantF,13,L2,6,1);                                   // bottom cap
    // Lantern soul-flame inside (bobbing)
    p(10+lantF,7,LANT,2,4);
    p(11+lantF,8,LANTH,1,2);
    ctx.save(); ctx.globalAlpha = 0.75 + pulse * 0.20;
    pEnemy(ctx,cx,cy + floatY * S,9+lantF,5,LANTH,4,8,S);
    ctx.restore();
    // Lantern halo (lights up area)
    ctx.save(); ctx.globalAlpha = 0.30 + pulse * 0.25;
    pEnemy(ctx,cx,cy + floatY * S, 6+lantF, 2,LANT,10,14,S);
    ctx.restore();
    // Lantern handle (hangs from hand)
    p(11+lantF,2,CO,1,4); p(11+lantF,1,CO,3,1);                                   // ring + cord

    // ── GHOST TRAIL (longer)
    ctx.save(); ctx.globalAlpha = 0.45 + pulse * 0.35;
    p(-3,13,TR,2,7); p( 0,13,TR,2,10); p( 2,13,TR,1,6);
    p(-1,20,TR,1,5);
    ctx.restore();
}

/**
 * --- GRAVE WALKER (spirit d2) ---
 * 묘지 배회자: A spirit in tattered burial shrouds, hunched and shuffling —
 * can't remember where its own grave is, so it wanders them all.
 */
function drawGraveWalker(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.003) + 1) / 2;
    const floatY = Math.sin(now * 0.0035) * 3;
    const dustT  = now * 0.002;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO='#000';
    const G1='#060808', G2='#0E1010', G3='#161A1A', HL='#202828', HV='#303A3A';
    const SH='#1A2020', SHL='#2A3838';                                             // shroud
    const BN='#D8D0C0', BNH='#F0E8D8';                                             // bone (pale, no blood)
    const ER='#2A1808', ERH='#3E2C12';                                             // gravesoil dirt
    const EG  = `rgba(100,200,120,${0.70+pulse*0.28})`;                            // sickly green eyes
    const EGH = `rgba(180,255,200,0.85)`;
    const TR  = `rgba(20,30,28,${0.50+pulse*0.38})`;
    const AU  = `rgba(20,60,40,${0.10+pulse*0.10})`;
    const VOID= '#000005';

    // ── grave aura (cold sickly green)
    ctx.save(); ctx.globalAlpha = 0.20 + pulse * 0.15;
    pEnemyAura(ctx, p, -14,-26,AU,28,46);
    ctx.restore();

    // ── HEAD/SKULL UNDER HOOD
    p(-6,-22,CO,12,2); p(-7,-20,CO,14,1);
    p(-8,-19,CO,1,12); p( 7,-19,CO,1,12); p(-6,-7,CO,12,1);
    p(-7,-21,G1,12,2); p(-7,-19,G2,14,12); p(-5,-18,G3,10,10); p(-3,-17,HL,6,8);
    p(-7,-19,HV,14,1);                                                            // top highlight

    // ── EXPOSED JAW BONE (lower face — pale bone visible)
    p(-5,-10,CO,10,5);
    p(-4,-9,BN,8,3);
    p(-4,-9,BNH,8,1);
    // Skeletal teeth row
    p(-4,-7,CO,8,3); p(-3,-6,BN,1,2); p(-1,-6,BN,1,2); p(1,-6,BN,1,2); p(3,-6,BN,1,2);

    // ── DEEP SUNKEN EYE SOCKETS (sickly green pinpoint)
    p(-5,-16,CO,4,4); p( 1,-16,CO,4,4);
    p(-4,-15,VOID,2,2); p( 2,-15,VOID,2,2);
    p(-4,-15,EG,1,1); p( 2,-15,EG,1,1);
    ctx.save(); ctx.globalAlpha = 0.85;
    pEnemy(ctx,cx,cy + floatY * S,-4,-15,EGH,1,1,S);
    pEnemy(ctx,cx,cy + floatY * S, 2,-15,EGH,1,1,S);
    ctx.restore();
    // Outer eye-socket glow
    ctx.save(); ctx.globalAlpha = 0.45 + pulse * 0.25;
    pEnemy(ctx,cx,cy + floatY * S,-5,-16,EG,4,4,S);
    pEnemy(ctx,cx,cy + floatY * S, 1,-16,EG,4,4,S);
    ctx.restore();

    // ── HUNCHED BODY IN BURIAL SHROUD
    p(-8,-6,CO,16,2); p(-9,-5,CO,18,1);
    p(-10,-4,CO,1,20); p( 9,-4,CO,1,20); p(-8,16,CO,16,1);
    p(-9,-5,SH,18,20); p(-7,-4,G2,14,18); p(-5,-3,G3,10,16); p(-3,-2,HL,6,14);
    p(-9,-5,SHL,18,1);                                                            // top highlight

    // ── BONE NECKLACE across collar (hanging bones)
    p(-6,-4,BN,2,2); p(-3,-4,BN,2,2); p( 0,-4,BN,2,2); p( 3,-4,BN,2,2);
    // Tiny skull pendant center
    p(-2,0,CO,4,3); p(-1,1,BN,2,2); p(-1,1,CO,1,1); p(1,1,CO,1,1);                // skull pendant

    // ── EXPOSED RIB/COLLAR BONE peeking through shroud
    ctx.save(); ctx.globalAlpha = 0.60;
    pEnemy(ctx,cx,cy + floatY * S,-7,4,BN,14,1,S);
    pEnemy(ctx,cx,cy + floatY * S,-7,8,BN,14,1,S);
    ctx.restore();

    // ── GRAVESOIL CLINGING TO ROBE (3 dirt patches)
    p(-8,8,ER,4,3); p(-7,9,ERH,2,1);
    p( 3,4,ER,4,3); p( 4,5,ERH,2,1);
    p(-4,12,ER,3,2);

    // ── SHROUD TATTER MARKS
    p(-9,8,CO,2,8); p( 7,6,CO,2,10); p(-3,12,CO,2,6);
    p(-8,9,G2,1,6); p( 8,7,G2,1,8);

    // ── SHUFFLING SKELETAL FEET (bone toes peeking below shroud)
    p(-6,17,CO,4,4); p( 2,17,CO,4,4);
    p(-5,18,BN,2,3); p( 3,18,BN,2,3);                                             // bone feet
    p(-5,21,BN,1,1); p(-3,21,BN,1,1); p( 3,21,BN,1,1); p( 5,21,BN,1,1);           // bone toes

    // ── DRAGGING SHROUD TRAIL (longer)
    ctx.save(); ctx.globalAlpha = 0.50 + pulse * 0.35;
    p(-5,17,TR,2,8); p( 0,17,TR,3,11); p( 3,17,TR,2,7);
    p(-3,25,TR,2,4); p( 1,25,TR,2,5);
    ctx.restore();

    // ── DRIFTING GRAVE DUST (3 floating particles around body)
    for (let i = 0; i < 3; i++) {
        const dx = -10 + i * 7;
        const dy = -16 - ((dustT * 4 + i * 6) % 16);
        ctx.save(); ctx.globalAlpha = 0.50 - i * 0.10;
        pEnemy(ctx,cx,cy + floatY * S, dx, dy, ER, 1, 1, S);
        ctx.restore();
    }
}

/**
 * --- WAILING MOTHER (spirit d3) ---
 * 통곡하는 어미: Grief became rage — a mother spirit whose mourning
 * turned to fury, arms outstretched, hair streaming upward.
 */
function drawWailingMother(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.004) + 1) / 2;
    const wailT  = now * 0.003;
    const floatY = Math.sin(wailT) * 3;
    const childT = (Math.sin(now * 0.0018) + 1) / 2;                              // ghost-child fade
    const tearT  = (now % 2200) / 2200;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO='#000';
    const M1='#080508', M2='#100C10', M3='#181418', HL='#241E24', HV='#3A2A3A';
    const BN='#D8C8D0', BNH='#F0E0E0';                                             // pale bone
    const EG  = `rgba(255,80,80,${0.85+pulse*0.15})`;
    const EGH = `rgba(255,200,200,0.95)`;
    const TE  = `rgba(180,40,40,${0.55+pulse*0.30})`;                              // bloody tear trail
    const HR  = `rgba(20,12,20,${0.75+pulse*0.20})`;
    const CHILD=`rgba(180,200,220,${0.30+childT*0.30})`;                          // ghost-child silhouette
    const VOID= '#000005';
    const gA  = 0.92;

    // ── grief aura (cold red-grey)
    ctx.save(); ctx.globalAlpha = 0.18 + pulse * 0.18;
    pEnemyAura(ctx, p, -22,-30,M3,44,52);
    ctx.restore();

    ctx.save(); ctx.globalAlpha = gA;

    // ── HAIR STREAMING UP (grief wind, more strands)
    ctx.save(); ctx.globalAlpha = 0.75 + pulse * 0.20;
    const hairStrands = [
        {ox:-6,base:-22,len:14}, {ox:-2,base:-25,len:16}, {ox: 2,base:-24,len:14},
        {ox:-9,base:-19,len:11}, {ox: 6,base:-20,len:12},
        {ox:-11,base:-15,len: 8}, {ox: 9,base:-16,len: 9},                        // 2 more outer strands
    ];
    hairStrands.forEach((h, i) => {
        const sway = Math.round(Math.sin(wailT + i * 0.9) * 2);
        pEnemy(ctx, cx, cy + floatY * S, h.ox + sway, h.base, CO, 3, h.len + 2, S);
        pEnemy(ctx, cx, cy + floatY * S, h.ox+1+sway, h.base+1, HR, 1, h.len, S);
    });
    ctx.restore();

    // ── HEAD (top-highlighted, gaunt)
    p(-6,-18,CO,12,2); p(-7,-16,CO,14,1);
    p(-8,-15,CO,1,12); p( 7,-15,CO,1,12); p(-6,-3,CO,12,1);
    p(-7,-17,M1,12,2); p(-7,-15,M2,14,12); p(-5,-14,M3,10,10); p(-3,-13,HL,6,8);
    p(-7,-15,HV,14,1);                                                            // top highlight

    // ── HOLLOW VOID EYE SOCKETS (deep grief — sorrowful red pinpoint)
    p(-6,-12,CO,4,4); p( 2,-12,CO,4,4);
    p(-5,-11,VOID,2,2); p( 3,-11,VOID,2,2);
    p(-5,-11,EG,1,1); p( 3,-11,EG,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy + floatY * S,-5,-11,EGH,1,1,S);
    pEnemy(ctx, cx, cy + floatY * S, 3,-11,EGH,1,1,S);
    ctx.restore();
    // Outer eye-pit grief aura
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    pEnemy(ctx, cx, cy + floatY * S,-7,-13,EG,5,5,S);
    pEnemy(ctx, cx, cy + floatY * S, 1,-13,EG,5,5,S);
    ctx.restore();

    // ── BLOODY TEAR STREAKS (long, slow descent)
    ctx.save(); ctx.globalAlpha = 0.70;
    pEnemy(ctx, cx, cy + floatY * S,-5,-9+tearT*5, TE, 1, 4, S);
    pEnemy(ctx, cx, cy + floatY * S, 3,-9+tearT*6, TE, 1, 4, S);
    pEnemy(ctx, cx, cy + floatY * S,-5,-5+tearT*4, TE, 1, 3, S);
    pEnemy(ctx, cx, cy + floatY * S, 3,-5+tearT*5, TE, 1, 3, S);
    ctx.restore();
    // Dried-tear static streaks (always)
    p(-5,-8,TE,1,3); p( 3,-8,TE,1,3);

    // ── GAPING WAILING VOID SCREAM (large, pale bone teeth bared)
    p(-5,-5,CO,10,8); p(-4,-4,VOID,8,6);
    // Bared pale-bone teeth (top + bottom row)
    p(-4,-4,BN,1,2); p(-2,-4,BN,1,2); p( 0,-4,BN,1,2); p( 2,-4,BN,1,2); p( 4,-4,BN,1,2);
    p(-4, 1,BN,1,2); p(-2, 1,BN,1,2); p( 0, 1,BN,1,2); p( 2, 1,BN,1,2); p( 4, 1,BN,1,2);
    // Bone-pale highlights
    p(-4,-4,BNH,1,1); p( 0,-4,BNH,1,1); p( 4,-4,BNH,1,1);

    // ── BODY (top-highlighted, grief-shroud)
    p(-9,4,CO,18,1); p(-10,5,CO,20,1);
    p(-11,6,CO,1,16); p(10,6,CO,1,16); p(-9,22,CO,18,1);
    p(-10,5,M2,20,16); p(-8,6,M3,16,14); p(-6,7,HL,12,10);
    p(-10,5,HV,20,1);                                                             // top highlight

    // ── LONGER REACHING SKELETAL ARMS (outstretched, pale-bone tips)
    p(-22,-1,CO,8,4); p(-21,0,M2,6,3); p(-21,0,M3,6,1);
    p(-23,0,CO,3,3); p(-22,1,BN,1,2);                                             // L hand bone
    p(-25,0,CO,2,2); p(-24,1,BN,1,1);                                             // L claw
    p( 14,-1,CO,8,4); p( 15,0,M2,6,3); p( 15,0,M3,6,1);
    p( 20,0,CO,3,3); p( 21,1,BN,1,2);                                             // R hand bone
    p( 23,0,CO,2,2); p( 23,1,BN,1,1);                                             // R claw

    // ── GHOST-CHILD WISP BESIDE MOTHER (faint silhouette, off-side)
    ctx.save(); ctx.globalAlpha = 0.35 + childT * 0.30;
    // Small head
    pEnemy(ctx, cx, cy + floatY * S, 12, 6, CHILD, 5, 5, S);
    // Tiny body
    pEnemy(ctx, cx, cy + floatY * S, 13, 11, CHILD, 3, 6, S);
    // Tiny hollow eye sockets
    pEnemy(ctx, cx, cy + floatY * S, 13, 7, CO, 1, 1, S);
    pEnemy(ctx, cx, cy + floatY * S, 15, 7, CO, 1, 1, S);
    // Tiny outstretched hand (reaching toward mother)
    pEnemy(ctx, cx, cy + floatY * S, 11, 8, CHILD, 2, 2, S);
    ctx.restore();

    // ── GHOST TRAIL (longer, denser)
    ctx.save(); ctx.globalAlpha = 0.50 + pulse * 0.30;
    p(-6,23,M1,2,7); p(-1,23,M1,3,11); p( 3,23,M1,2,7);
    p(-2,30,M1,2,4); p( 1,30,M1,1,4);
    ctx.restore();

    ctx.restore();
}

/**
 * --- HELLBOUND BOAR (boar) ---
 * 야생의 복수자: A violent hunter's thirst made flesh — demonic boar with
 * lava-veined tusks, bristling charred hide, charging posture.
 */
function drawHellboundBoar(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.005) + 1) / 2;
    const chargeX = Math.sin(now * 0.003) * 2; // subtle charge bob
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx + chargeX * S, cy, ox, oy, col, w, h, S);

    const CO  = '#000000';
    const B1  = '#080808'; const B2 = '#111111'; const B3 = '#1A1A1A'; const B4 = '#262626'; const HL = '#383838';
    const LA  = `rgba(255,80,0,${0.55+pulse*0.40})`; // lava veins
    const LA2 = `rgba(255,200,0,${0.30+pulse*0.45})`;
    const EG  = `rgba(255,60,0,${0.75+pulse*0.25})`;
    const TK  = '#2A1800'; // tusk dark base
    const TK2 = '#5A3600'; // tusk mid
    const TK3 = `rgba(255,100,0,${0.60+pulse*0.35})`; // tusk lava glow
    const gA  = 0.94;

    ctx.save(); ctx.globalAlpha = gA;

    // ── CHARGING POSTURE (head low, body angled) ──────────────
    // HEAD (lowered, wide)
    p(-10,-8,CO,20, 2); p(-12,-6,CO,24, 1);
    p(-13,-5,CO, 1,10); p(11,-5,CO, 1,10); p(-12, 5,CO,24, 1);
    p(-12,-5,B1,24,10); p(-10,-4,B2,20, 8); p(-8,-3,B3,16, 6); p(-6,-2,B4,12, 4); p(-4,-1,HL, 8, 2);
    p(-11,-5,HL, 3, 3); // snout specular

    // ── TUSKS (lava-veined, curving outward) ──────────────────
    // Left tusk
    p(-14, 2,CO, 6, 3); p(-15, 3,CO, 4, 4); p(-16, 4,CO, 3, 3);
    p(-13, 2,TK, 5, 2); p(-14, 3,TK2, 3, 4); p(-15, 4,TK2, 2, 3);
    ctx.save(); ctx.globalAlpha *= (0.60+pulse*0.38);
    p(-13, 3,TK3, 4, 3); p(-15, 5,TK3, 2, 2);
    ctx.restore();
    // Right tusk
    p( 8, 2,CO, 6, 3); p( 9, 3,CO, 4, 4); p(10, 4,CO, 3, 3);
    p( 8, 2,TK, 5, 2); p( 9, 3,TK2, 3, 4); p(10, 4,TK2, 2, 3);
    ctx.save(); ctx.globalAlpha *= (0.60+pulse*0.38);
    p( 8, 3,TK3, 4, 3); p(10, 5,TK3, 2, 2);
    ctx.restore();

    // ── HOLLOW BURNING VOID EYE SOCKETS (deep + ember pinpoint)
    p(-8,-5,CO,4,3); p( 4,-5,CO,4,3);
    p(-7,-4,'#000005',2,1); p( 5,-4,'#000005',2,1);
    p(-7,-4,EG,1,1); p( 5,-4,EG,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx + chargeX * S, cy,-7,-4,'#FFAA40',1,1,S);
    pEnemy(ctx, cx + chargeX * S, cy, 5,-4,'#FFAA40',1,1,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    pEnemy(ctx, cx + chargeX * S, cy,-9,-6,EG,6,5,S);
    pEnemy(ctx, cx + chargeX * S, cy, 3,-6,EG,6,5,S);
    ctx.restore();

    // ── SNOUT + NOSTRILS ──────────────────────────────────────
    p(-12,1,CO, 8, 3); p(-11,2,B2, 6, 2);
    p(-10,3,CO, 2, 2); p(-7,3,CO, 2, 2); // nostrils
    ctx.save(); ctx.globalAlpha *= (0.55+pulse*0.40);
    p(-10,4,LA, 2, 1); p(-7,4,LA, 2, 1); // hot breath
    ctx.restore();

    // ── NECK BRISTLES ─────────────────────────────────────────
    p(-10,-10,CO, 2, 5); p(-7,-12,CO, 2, 6); p(-4,-13,CO, 2, 5); p(-1,-12,CO, 2, 6);
    p(-10,-10,B3, 1, 4); p(-7,-12,B3, 1, 5); p(-4,-13,B3, 1, 4);

    // ── MASSIVE BODY ──────────────────────────────────────────
    p(-8,6,CO,18, 1); p(-10,7,CO, 1,10); p(9,7,CO, 1,10); p(-10,17,CO,20, 1);
    p(-9,7,B1,18,10); p(-7,8,B2,14, 8); p(-5,9,B3,10, 6); p(-3,10,B4, 6, 4);
    p(-9,7,HL, 4, 3); // body specular

    // Lava cracks on body hide
    ctx.save(); ctx.globalAlpha *= (0.45+pulse*0.45);
    p(-8, 9,LA, 2, 7); p( 4,11,LA, 2, 5); p(-2, 8,LA2, 1, 6);
    ctx.restore();

    // ── LEGS (thick, stomping) ────────────────────────────────
    const legOff = Math.round(Math.sin(now * 0.006) * 2);
    p(-8,18,CO, 5, 8+legOff); p(-1,18,CO, 5, 8); p(3,18,CO, 5, 8+legOff);
    p(-7,19,B2, 3, 7+legOff); p( 0,19,B2, 3, 7); p(4,19,B2, 3, 7+legOff);

    // Ground dust glow
    ctx.save(); ctx.globalAlpha *= (0.18+pulse*0.22);
    p(-12,26,LA, 26, 1);
    ctx.restore();

    ctx.restore();
}

// ══════════════════════════════════════════════════════════════════════
// 원혼 (Specter) — 5 New Types
// ══════════════════════════════════════════════════════════════════════

/**
 * --- ABYSS SENTINEL (abyss_sentinel) ---
 * 악령: Tall green-shadowed guardian; regenerates HP.
 */
function drawAbyssSentinel(cx, cy, enemy) {
    const now = Date.now();
    const S = 2.0;
    const pulse     = (Math.sin(now * 0.004) + 1) / 2;
    const regenPulse = (Math.sin(now * 0.006) + 1) / 2;
    const p = (ox, oy, color, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, color, w, h, S);

    const CO  = '#000000';
    const C1  = '#040C08';
    const C2  = '#081A10';
    const C3  = '#0C2A1A';
    const C4  = '#103A22';
    const HL  = '#185030';
    const regenColor = `rgba(0, 200, 80, ${0.18 + regenPulse * 0.35})`;
    const eyeColor   = `rgba(0, 255, 100, ${0.6 + pulse * 0.4})`;

    ctx.save();
    ctx.globalAlpha = 0.90;

    // Regen aura
    ctx.save();
    ctx.globalAlpha = 0.12 + regenPulse * 0.18;
    pEnemyAura(ctx, p, -14,-25,regenColor,28,50);
    ctx.restore();

    // Head crest
    p(-2,-30,CO, 4, 2); p(-4,-28,CO, 8, 2);
    p(-1,-29,C4, 2, 2); p(-3,-27,C4, 6, 2);

    // Tall head
    p(-6,-26,CO,12, 1); p(-7,-25,CO, 1,16); p( 6,-25,CO, 1,16);
    p(-7, -9,CO,14, 1);
    p(-6,-25,C1,12,16); p(-4,-24,C2, 8,14); p(-2,-23,C3, 4,12);
    p(-1,-22,HL, 2, 2);

    // ── HOLLOW VOID EYE SOCKETS (deep + green-fire pinpoint)
    p(-5,-21,CO,4,4); p( 1,-21,CO,4,4);
    p(-4,-20,'#000005',2,2); p( 2,-20,'#000005',2,2);
    p(-4,-20,eyeColor,1,1); p( 2,-20,eyeColor,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy,-4,-20,'#B9F6CA',1,1,S);
    pEnemy(ctx, cx, cy, 2,-20,'#B9F6CA',1,1,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    p(-5,-22,eyeColor,5,5); p( 1,-22,eyeColor,5,5);
    ctx.restore();

    // ── SILENT-SCREAM VOID MOUTH (pale bone fangs)
    p(-3,-14,CO,6,3); p(-2,-13,'#000005',4,2);
    p(-2,-13,'#D8C0A8',1,1); p( 0,-13,'#D8C0A8',1,1); p( 2,-13,'#D8C0A8',1,1);

    // Wide body
    p(-10,-8,CO,20, 1); p(-11,-7,CO, 1,20); p(10,-7,CO, 1,20); p(-11,13,CO,22, 1);
    p(-10,-7,C1,20,20); p(-8,-6,C2,16,18); p(-6,-5,C3,12,16); p(-4,-4,C4, 8,14);
    p(-3,-3,HL, 4, 4);

    // Arms (guard stance)
    p(-16,-6,CO, 6, 4); p(-15,-5,C2, 4, 3);
    p( 10,-6,CO, 6, 4); p( 11,-5,C2, 4, 3);

    // Legs
    p(-8,14,CO, 6, 8); p( 2,14,CO, 6, 8);
    p(-7,15,C1, 4, 6); p( 3,15,C1, 4, 6);
    ctx.restore();
}

/**
 * --- FEAR HARVESTER (fear_harvester) ---
 * 악령: Multi-limbed horror; emits attack-speed-reducing fear aura.
 */
function drawFearHarvester(cx, cy, enemy) {
    const now = Date.now();
    const S = 2.0;
    const pulse   = (Math.sin(now * 0.005) + 1) / 2;
    const legWave = Math.sin(now * 0.008);
    const floatY  = Math.sin(now * 0.003) * 2;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO='#000';
    const C1='#1A0020', C2='#300040', C3='#480060', C4='#6A088A', CV='#88229A';
    const fearColor = `rgba(100,0,200,${0.18+pulse*0.18})`;
    const eyeColor  = `rgba(255,0,150,${0.70+pulse*0.30})`;
    const eyeDot    = `rgba(255,180,220,0.95)`;
    const dripC     = `rgba(60,0,90,${0.55+pulse*0.30})`;
    const VOID='#000005';

    // ── fear aura
    ctx.save(); ctx.globalAlpha = 0.20 + pulse * 0.18;
    pEnemyAura(ctx, p, -22,-26,fearColor,44,48);
    ctx.restore();

    // ── 6 SPIDER LEGS (was 4 — 3 per side, jointed, animated)
    const legData = [
        { lx: -14, oy: -8, sw:  3 }, { lx: -18, oy:  0, sw: -3 }, { lx: -16, oy:  8, sw:  3 },
        { lx:  12, oy: -8, sw: -3 }, { lx:  16, oy:  0, sw:  3 }, { lx:  14, oy:  8, sw: -3 }
    ];
    for (let i = 0; i < legData.length; i++) {
        const ld = legData[i];
        const wave = legWave * ld.sw;
        // Upper segment
        p(ld.lx, ld.oy + wave, CO, 2, 10);
        // Lower segment (jointed bend)
        const sx2 = ld.lx + (ld.lx < 0 ? -2 : 2);
        p(sx2, ld.oy + wave + 10, CO, 2, 7);
        // Spider-claw tip
        p(sx2 + (ld.lx < 0 ? -1 : 1), ld.oy + wave + 16, CO, 2, 2);
    }

    // ── OVAL BODY (top-highlighted, larger)
    p(-9,-16,CO,18,1); p(-11,-15,CO,22,1);
    p(-12,-14,CO,1,20); p(11,-14,CO,1,20);
    p(-11,6,CO,22,1); p(-9,7,CO,18,1);
    p(-11,-14,C1,22,20); p(-9,-13,C2,18,18); p(-7,-12,C3,14,16); p(-5,-11,C4,10,14);
    p(-11,-14,CV,22,1);                                                           // top highlight

    // ── 8 BODY EYES (was 6) — clusters of hollow ringed sockets
    const eyePos = [
        [-8,-11],[-4,-11],[ 0,-11],[ 4,-11],                                      // top row of 4
        [-7,-5], [ 4,-5],                                                         // mid pair
        [-5, 1], [ 2, 1]                                                          // bottom pair
    ];
    for (const [ex, ey] of eyePos) {
        p(ex, ey, CO, 3, 3);
        p(ex, ey, VOID, 3, 1);
        p(ex+1, ey+1, eyeColor, 1, 1);
        ctx.save(); ctx.globalAlpha = 0.95;
        pEnemy(ctx,cx,cy + floatY * S, ex+1, ey+1, eyeDot, 1, 1, S);
        ctx.restore();
    }
    // Outer fear-eye glow
    ctx.save(); ctx.globalAlpha = 0.40 + pulse * 0.25;
    pEnemy(ctx,cx,cy + floatY * S,-9,-12,eyeColor,18,6,S);
    ctx.restore();

    // ── GAPING VERTICAL MAW (silent fear-scream)
    p(-2,-3,CO,4,9); p(-1,-2,VOID,2,7);
    // Hooked fangs around maw
    p(-3,-1,CV,1,2); p( 2,-1,CV,1,2);
    p(-3, 4,CV,1,2); p( 2, 4,CV,1,2);

    // ── FEAR-SHADOW DRIPS (3 dark drops below body)
    const dripA = (now % 1500) / 1500;
    ctx.save(); ctx.globalAlpha = 0.60;
    pEnemy(ctx,cx,cy + floatY * S,-6, 9+dripA*5, dripC, 2, 4, S);
    pEnemy(ctx,cx,cy + floatY * S, 4, 9+dripA*7, dripC, 2, 4, S);
    pEnemy(ctx,cx,cy + floatY * S,-1,11+dripA*6, dripC, 2, 3, S);
    ctx.restore();

    // ── CHITIN-RIDGE SPINE (vertical row on top of body)
    p(-1,-14,VOID,2,18);
    for (let r = 0; r < 4; r++) {
        p(-2, -12+r*5, CV, 4, 1);                                                 // chitin segments
    }
}

/**
 * --- BLOOD SPIRIT (blood_spirit) ---
 * 악령: Crimson entity with claws and dripping blood; enrages on damage.
 */
function drawBloodSpirit(cx, cy, enemy) {
    const now = Date.now();
    const S = 2.0;
    const pulse = (Math.sin(now * 0.006) + 1) / 2;
    const drip  = (now * 0.005) % 1;
    const p = (ox, oy, color, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, color, w, h, S);

    const CO     = '#000000';
    const BL1    = '#1C0000';
    const BL2    = '#330000';
    const BL3    = '#550000';
    const BL4    = '#770000';
    const BL5    = '#990000';
    const BRIGHT = '#CC0000';
    const dropColor = `rgba(180,0,0,${0.6+pulse*0.3})`;
    const eyeColor  = `rgba(255,50,0,${0.7+pulse*0.3})`;
    const goldEye   = `rgba(255,200,0,${0.6+pulse*0.3})`;

    ctx.save();
    ctx.globalAlpha = 0.93;

    // Blood drips
    ctx.save();
    ctx.globalAlpha = 0.5 + pulse * 0.3;
    const dy = drip * 20;
    p(-4, 10 + dy * 0.3, dropColor, 3, 5);
    p( 2,  8 + dy * 0.4, dropColor, 2, 4);
    p(-7, 12 + dy * 0.25,dropColor, 2, 3);
    ctx.restore();

    // Body outline
    p(-6,-20,CO,12, 2); p(-8,-18,CO,16, 1);
    p(-9,-17,CO, 1,24); p( 8,-17,CO, 1,24);
    p(-9,  7,CO,18, 1); p(-8,  8,CO, 2, 2); p( 6,  8,CO, 2, 2);
    p(-9, 10,CO, 1, 6); p( 8, 10,CO, 1, 6); p(-9,16,CO,18, 1);

    // Body fill
    p(-5,-19,BL1,10, 2); p(-8,-17,BL1,16,24);
    p(-7,-16,BL2,14,22); p(-5,-15,BL3,10,20);
    p(-3,-14,BL4, 6,18); p(-2,-12,BL5, 4,14); p(-1,-10,BRIGHT, 2, 4);

    // ── HOLLOW BLOOD-VOID EYE SOCKETS (deep + ember-gold pinpoint)
    p(-7,-14,CO,6,5); p( 1,-14,CO,6,5);
    p(-6,-13,'#000005',4,3); p( 2,-13,'#000005',4,3);
    p(-5,-12,eyeColor,2,1); p( 3,-12,eyeColor,2,1);
    p(-5,-12,goldEye,2,1); p( 3,-12,goldEye,2,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy,-4,-12,'#FFFFCC',1,1,S);
    pEnemy(ctx, cx, cy, 4,-12,'#FFFFCC',1,1,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    p(-8,-15,eyeColor,8,6); p( 0,-15,eyeColor,8,6);
    ctx.restore();

    // ── SILENT-SCREAM VOID MAW (pale bone fangs — no blood-fountain)
    p(-5,-8,CO,10,1);
    p(-4,-7,'#000005',8,3);
    p(-4,-7,'#D8C0A8',1,3); p(-1,-7,'#D8C0A8',1,3); p( 2,-7,'#D8C0A8',1,3);
    p(-5,-4,CO,10,1);

    // Clawed arms
    p(-14,-10,CO, 5, 3); p(-14,-10,BL2, 3, 2);
    p(-15,-8,CO, 3, 3); p(-14,-7,CO, 2, 5); p(-12,-7,CO, 2, 5);
    p(  9,-10,CO, 5, 3); p( 10,-10,BL2, 3, 2);
    p( 12,-8,CO, 3, 3); p( 12,-7,CO, 2, 5); p( 10,-7,CO, 2, 5);
    ctx.restore();
}

// ══════════════════════════════════════════════════════════════════════
// 악마 (Demon) — 6 New Types
// ══════════════════════════════════════════════════════════════════════

// ── Window Exports ────────────────────────────────────────────────────────
window.drawSoulEater = drawSoulEater;
window.drawFrostWalker = drawFrostWalker;
window.drawFrozenHeart = drawFrozenHeart;
window.drawEmberHatred = drawEmberHatred;
window.drawLostChild = drawLostChild;
window.drawGraveWalker = drawGraveWalker;
window.drawWailingMother = drawWailingMother;
window.drawHellboundBoar = drawHellboundBoar;
window.drawAbyssSentinel = drawAbyssSentinel;
window.drawFearHarvester = drawFearHarvester;
window.drawBloodSpirit = drawBloodSpirit;
