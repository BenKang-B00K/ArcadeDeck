/* enemies_pix_specter.js — Specter (원혼) — the drifting dead
 * Pixel art draw functions. See enemies_pix_core.js for the sprite standard. */

/**
 * --- WHISPERING SPIRIT (normal) ---
 * 영혼: Ethereal classic ghost with hollow cyan eyes and silent whispering mouth.
 * Midnight-blue palette, 5 shading passes, blink animation, 5 wispy tails.
 */
function drawWhisperingSpirit(cx, cy, enemy) {
    const now = Date.now();
    const S = 2.0;
    const pulse  = (Math.sin(now * 0.004) + 1) / 2;
    const blink  = Math.sin(now * 0.0015) > 0.7 ? 0 : 1;
    const floatY = Math.sin(now * 0.0025) * 3;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY, ox, oy, col, w, h, S);

    const CO = '#000000', C1 = '#060F1A', C2 = '#0E1E2E', C3 = '#182840';
    const C4 = '#243450', C5 = '#30425E', HL = '#3E5872';
    const ea = 0.55 + pulse * 0.45;
    const EG = `rgba(0,220,255,${ea})`;
    const EB = `rgba(180,245,255,${0.7 + pulse * 0.3})`;
    const MV = '#030810';
    const gA = 0.78 + pulse * 0.14;

    ctx.save(); ctx.globalAlpha = gA;

    // ── OUTLINE silhouette ─────────────────────────────────────
    p(-4,-22,CO, 8, 1);
    p(-6,-21,CO,12, 1);
    p(-8,-20,CO,16, 1);
    p(-8,-19,CO, 1,12); p( 7,-19,CO, 1,12);
    p(-8, -7,CO,16, 1);
    p(-9, -6,CO, 2, 2); p( 7, -6,CO, 2, 2);
    p(-10,-4,CO, 1, 9); p( 9, -4,CO, 1, 9);
    p(-9,  5,CO, 4, 1); p(-3,  5,CO, 2, 1);
    p( 1,  5,CO, 2, 1); p( 5,  5,CO, 4, 1);

    // ── DEEP FILL (layer 1) ───────────────────────────────────
    p(-7,-21,C1,14, 2);
    p(-7,-19,C1,14,12);                            // head
    p(-9, -5,C1,18,10);                            // body

    // ── BASE TONE (layer 2) ───────────────────────────────────
    p(-6,-20,C2,12, 2);
    p(-6,-18,C2,12,10);
    p(-8, -4,C2,16, 8);

    // ── MID TONE (layer 3) — hue shift toward cooler blue ─────
    p(-5,-19,C3,10, 2);
    p(-5,-17,C3,10, 7);
    p(-7, -4,C3,13, 6);

    // ── LIGHT TONE (layer 4) ──────────────────────────────────
    p(-4,-18,C4, 7, 3);
    p(-4,-15,C4, 7, 4);
    p(-6, -3,C4,10, 4);

    // ── HIGHLIGHT (layer 5, upper-left specular) ──────────────
    p(-3,-18,C5, 4, 2);
    p(-3,-15,C5, 4, 2);
    p(-4, -3,C5, 6, 2);
    p(-2,-17,HL, 2, 1);                            // bright spec dot
    p(-3, -3,HL, 3, 1);                            // body spec

    // ── EYE SOCKETS (black void) ──────────────────────────────
    p(-6,-17,CO, 5, 4);                            // left socket
    p( 1,-17,CO, 5, 4);                            // right socket

    // ── EYE GLOW core ─────────────────────────────────────────
    p(-5,-16,EG, 3, 2);                            // left glow
    p( 2,-16,EG, 3, 2);                            // right glow
    p(-4,-15,EB, 1, 1);                            // left bright dot
    p( 3,-15,EB, 1, 1);                            // right bright dot

    // ── EYE BLOOM (soft halo) ─────────────────────────────────
    ctx.save();
    ctx.globalAlpha = gA * (0.12 + pulse * 0.10);
    p(-7,-19,EG, 7, 6);
    p( 0,-19,EG, 7, 6);
    ctx.restore();

    // ── NASAL HOLLOW ──────────────────────────────────────────
    p(-1,-13,CO, 2, 3);

    // ── WHISPERING MOUTH (slightly open) ─────────────────────
    p(-4,-11,CO, 8, 1);                            // upper lip
    p(-4,-10,MV, 8, 2);                            // open void
    p(-3,-10,'#1A1A1A', 2, 1);                     // left shadow tooth
    p( 1,-10,'#1A1A1A', 2, 1);                     // right shadow tooth
    p(-4, -8,CO, 8, 1);                            // lower lip

    // ── WISPING TENDRILS (bottom hem) ────────────────────────
    // left wisp
    p(-8, 6,C1, 3, 5);
    p(-8,11,C1, 2, 3);
    p(-7,14,CO, 2, 2);
    // centre wisp (longest)
    p(-2, 6,C2, 4, 6);
    p(-1,12,C2, 3, 4);
    p(-1,16,C1, 2, 2);
    p( 0,18,CO, 1, 1);
    // right wisp
    p( 5, 6,C1, 3, 5);
    p( 5,11,C1, 2, 3);
    p( 5,14,CO, 2, 2);

    // ── ETHEREAL AURA STREAKS (animated) ─────────────────────
    ctx.save();
    ctx.globalAlpha = gA * (0.09 + blink * 0.07);
    p(-12,-14,EG, 2, 7);
    p( 10,-12,EG, 2, 5);
    p( -9,-20,EG, 1, 3);
    ctx.restore();

    ctx.restore();
}

/**
 * --- WANDERING MIST (mist) ---
 * 방랑하는 안개: Wide amorphous fog mass with a barely-visible hollow face inside.
 * Translucent grey-teal wisps layered 6 deep, undulating with slow wave motion.
 */
function drawMist(cx, cy, enemy) {
    const now = Date.now();
    const S   = 2.0;
    const pulse  = (Math.sin(now * 0.0030) + 1) / 2;
    const waveX  = Math.sin(now * 0.0020) * 2;
    const floatY = Math.sin(now * 0.0018) * 4;
    const eddyT  = now * 0.0014;
    const facePh = (Math.sin(now * 0.0012) + 1) / 2;                               // face emerges/fades
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx + waveX, cy + floatY, ox, oy, col, w, h, S);

    const CO='#000';
    const M1='#080E14', M2='#0F1A22', M3='#182632', M4='#243440', M5='#31444E', M6='#3E545E';
    const TL  = `rgba(0,170,200,${0.18+pulse*0.22})`;
    const TLH = `rgba(80,220,240,${0.40+pulse*0.30})`;
    const EG  = `rgba(0,200,220,${0.55+pulse*0.40})`;
    const EGH = `rgba(180,240,255,0.90)`;
    const FACE= `rgba(80,140,160,${0.35+facePh*0.40})`;                            // ghostly face tone
    const VOID= '#000005';
    const gA  = 0.55 + pulse * 0.28;

    ctx.save(); ctx.globalAlpha = gA;

    // ── WIDE CLOUD SILHOUETTE — stepped crown
    p(-16,-10,CO,6,3); p(-10,-14,CO,8,4); p(-2,-16,CO,8,4); p( 6,-12,CO,6,3);
    p(-18,-7,CO,1,14); p( 13,-7,CO,1,14); p(-18,7,CO,32,1);

    // ── OUTER MIST LAYERS (darkest)
    p(-16,-9,M1,6,15); p( 10,-9,M1,4,14);
    p(-10,-13,M1,8,6); p(-2,-15,M1,8,5); p( 6,-11,M1,6,4);

    // ── MID MIST LAYERS
    p(-15,-8,M2,28,15); p(-13,-12,M2,20,5); p(-2,-14,M2,8,4);

    // ── INNER BODY (brighter)
    p(-12,-6,M3,24,12); p(-10,-10,M3,18,5);

    // ── CORE CENTRE (lightest)
    p(-9,-5,M4,18,9); p(-7,-9,M4,12,4);
    p(-6,-3,M5,12,6); p(-4,-7,M5,6,3);
    p(-3,-1,M6,6,4);

    // ── 3 SWIRLING TEAL EDDIES (orbital)
    for (let i = 0; i < 3; i++) {
        const a  = eddyT + i * (Math.PI * 2 / 3);
        const ex = Math.cos(a) * 12;
        const ey = Math.sin(a) * 5 - 4;
        ctx.save(); ctx.globalAlpha = gA * (0.50 + pulse * 0.30);
        pEnemy(ctx, cx+waveX, cy+floatY, ex-2, ey-1, TLH, 5, 3, S);
        ctx.restore();
        ctx.save(); ctx.globalAlpha = gA * 0.65;
        pEnemy(ctx, cx+waveX, cy+floatY, ex-1, ey, TL, 3, 2, S);
        ctx.restore();
    }

    // ── TEAL SHIMMER OVERLAY (mist glow)
    ctx.save(); ctx.globalAlpha = gA * (0.25 + pulse * 0.25);
    p(-7,-6,TL,14,5); p(-9,-1,TL,18,4);
    ctx.restore();

    // ── PRIMARY DEATHMASK FACE (center, drifting in/out)
    ctx.save(); ctx.globalAlpha = gA * (0.60 + facePh * 0.40);
    // Skull-mask outline
    pEnemy(ctx, cx+waveX, cy+floatY, -6, -8, FACE, 12, 8, S);
    ctx.restore();
    // Hollow eye sockets (deep void w/ teal pinpoint)
    p(-6,-6,CO,4,3); p( 2,-6,CO,4,3);
    p(-5,-5,VOID,2,1); p( 3,-5,VOID,2,1);
    p(-5,-5,EG,2,1); p( 3,-5,EG,2,1);
    ctx.save(); ctx.globalAlpha = 0.90;
    pEnemy(ctx, cx+waveX, cy+floatY, -5, -5, EGH, 1, 1, S);
    pEnemy(ctx, cx+waveX, cy+floatY,  3, -5, EGH, 1, 1, S);
    ctx.restore();
    // Silent-scream mouth
    p(-2,-2,CO,4,3); p(-1,-1,VOID,2,1);

    // ── 2 SECONDARY GHOST HEADS peeking from mist (fainter)
    ctx.save(); ctx.globalAlpha = gA * 0.45 * facePh;
    // L peeking head
    pEnemy(ctx, cx+waveX, cy+floatY, -14, -2, FACE, 5, 5, S);
    pEnemy(ctx, cx+waveX, cy+floatY, -13, -1, CO, 1, 1, S);
    pEnemy(ctx, cx+waveX, cy+floatY, -10, -1, CO, 1, 1, S);
    pEnemy(ctx, cx+waveX, cy+floatY, -13, -1, EG, 1, 1, S);
    pEnemy(ctx, cx+waveX, cy+floatY, -10, -1, EG, 1, 1, S);
    // R peeking head
    pEnemy(ctx, cx+waveX, cy+floatY,  9, -4, FACE, 5, 5, S);
    pEnemy(ctx, cx+waveX, cy+floatY, 10, -3, CO, 1, 1, S);
    pEnemy(ctx, cx+waveX, cy+floatY, 13, -3, CO, 1, 1, S);
    pEnemy(ctx, cx+waveX, cy+floatY, 10, -3, EG, 1, 1, S);
    pEnemy(ctx, cx+waveX, cy+floatY, 13, -3, EG, 1, 1, S);
    ctx.restore();

    // ── WISPY TRAILING SIDE EDGES
    p(-18,1,M1,2,5); p(-17,6,CO,1,3);
    p( 14,0,M1,2,5); p( 14,5,CO,1,3);
    p(-19,-2,M1,1,4); p( 15,-3,M1,1,4);                                            // upper wisps

    // ── GROUND WISPS (more, denser)
    p(-10,8,M2,5,4); p(-4,9,M1,5,3); p( 2,8,M2,5,4);
    p(-12,12,CO,3,3); p(-6,12,CO,3,2); p( 0,12,CO,3,3); p( 6,12,CO,3,2);
    p(-14,14,M1,2,2); p( 8,14,M1,2,2);                                             // edge ground tufts

    ctx.restore();
}

/**
 * --- FADED MEMORY (memory) ---
 * 빛바랜 기억: Barely-visible sepia silhouette of a walking person; melancholic and
 * translucent, with a gentle walking arm-swing animation.
 */
function drawMemory(cx, cy, enemy) {
    const now = Date.now();
    const S = 2.0;
    const pulse  = (Math.sin(now * 0.0025) + 1) / 2;
    const walk   = Math.sin(now * 0.005);
    const floatY = Math.sin(now * 0.002) * 2;
    const fragT  = (now % 2400) / 2400;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY, ox, oy, col, w, h, S);

    const CO='#000';
    const F1='#0C0A08', F2='#1C1612', F3='#2C2018', F4='#3A2C22', F5='#4A3A30', HL='#5C4C40';
    const sepia = `rgba(160,115,70,${0.18+pulse*0.15})`;
    const sepiaH= `rgba(220,180,130,${0.30+pulse*0.20})`;
    const EG    = `rgba(180,140,100,${0.65+pulse*0.30})`;                          // hollow sepia eyes
    const fadeA = 0.32 + pulse * 0.22;
    const VOID  = '#000005';

    // ── FADING SEPIA FRAGMENTS DROPPING BEHIND (memory dust)
    ctx.save(); ctx.globalAlpha = 0.45 * (1 - fragT);
    pEnemy(ctx,cx,cy+floatY,-9+walk*2,-4-fragT*8,sepia,2,2,S);
    pEnemy(ctx,cx,cy+floatY,-12+walk*2, 2-fragT*10,sepia,1,1,S);
    pEnemy(ctx,cx,cy+floatY, 8-walk*2,-2-fragT*6,sepia,1,2,S);
    ctx.restore();

    ctx.save(); ctx.globalAlpha = fadeA;

    // ── HEAD (small oval, top-highlighted)
    p(-3,-24,CO,6,1); p(-4,-23,CO,8,1);
    p(-5,-22,CO,1,8); p( 4,-22,CO,1,8); p(-5,-14,CO,10,1);
    p(-4,-22,F2,8,2); p(-4,-20,F3,8,6); p(-3,-19,F4,6,4); p(-2,-18,F5,4,2);

    // ── MISSING FACE HOLE (deep void where face should be — forgotten identity)
    p(-3,-20,VOID,6,5);
    // Hollow eye-pit pinpoints (barely visible inside void)
    p(-2,-19,EG,1,1); p( 2,-19,EG,1,1);
    ctx.save(); ctx.globalAlpha = fadeA * (0.55+pulse*0.45);
    p(-2,-19,sepiaH,1,1); p( 2,-19,sepiaH,1,1);
    ctx.restore();
    // Outer fade aura around missing face
    ctx.save(); ctx.globalAlpha = fadeA * 0.40;
    p(-4,-21,sepia,8,7);
    ctx.restore();

    // ── NECK
    p(-2,-13,F2,4,2);

    // ── DECAYED ROBE BODY (narrow, tattered)
    p(-5,-11,CO,10,1); p(-6,-10,CO,1,20); p( 5,-10,CO,1,20); p(-6,10,CO,12,1);
    p(-5,-10,F1,10,20); p(-4,-9,F2,8,18); p(-3,-8,F3,6,16); p(-1,-7,F4,2,14);
    // Decay holes/tatters in robe
    p(-4, -4,VOID,2,2);                                                            // chest tatter hole
    p( 1,  1,VOID,2,2);                                                            // side tatter hole
    p(-3,  6,VOID,2,2);                                                            // lower tatter hole
    // Frayed edges
    p(-6, 8,CO,2,3); p(-3, 8,CO,2,3); p( 1, 8,CO,2,3); p( 4, 8,CO,2,3);

    // ── ANIMATED ARMS (walking swing, withered)
    const armDx = Math.round(walk * 2);
    p(-10+armDx,-8,F1,4,2); p(-11+armDx,-7,CO,2,1);
    p(  6-armDx,-8,F1,4,2); p(  9-armDx,-7,CO,2,1);
    // Withered skeletal hand-tips
    p(-12+armDx,-6,F2,1,3);
    p( 11-armDx,-6,F2,1,3);

    // ── WALKING LEGS (faded lower — dissolving)
    const legL = Math.round(walk * 2);
    p(-4,10,F2,3,10+legL); p( 1,10,F2,3,10-legL);
    p(-3,20+legL,CO,2,2); p( 2,20-legL,CO,2,2);
    // Fading legs lower (decay)
    ctx.save(); ctx.globalAlpha *= 0.50;
    p(-4,16,F1,3,5); p( 1,16,F1,3,5);
    ctx.restore();

    // ── SEPIA SHIMMER (memory impression — faded)
    ctx.save(); ctx.globalAlpha = fadeA * 0.40;
    p(-3,-17,sepia,6,3); p(-4,-4,sepia,8,5);
    ctx.restore();

    // ── FADING LOWER EDGE (dissolving feet)
    ctx.save(); ctx.globalAlpha = fadeA * 0.50;
    p(-5,8,F1,10,3);
    ctx.restore();

    ctx.restore();
}

/**
 * --- FLICKERING SHADOW (shade) ---
 * 깜빡이는 그림자: Sharp-edged humanoid shadow that glitches and blinks.
 * Near-black purple with random static lines; random horizontal glitch offset.
 */
function drawShade(cx, cy, enemy) {
    const now = Date.now();
    const S   = 2.0;
    const pulse   = (Math.sin(now * 0.006) + 1) / 2;
    const flicker = Math.random() < 0.12 ? 0.05 : 1;
    const glitchX = Math.random() < 0.08 ? (Math.random() - 0.5) * 5 : 0;
    const floatY  = Math.sin(now * 0.004) * 2;
    const crackT  = (Math.sin(now * 0.005) + 1) / 2;
    const tearT   = (now % 1500) / 1500;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx + glitchX, cy + floatY, ox, oy, col, w, h, S);

    const CO='#000';
    const D1='#07000E', D2='#0E0018', D3='#170028', D4='#220040', D5='#2E0058', DV='#420080';
    const EG  = `rgba(170,0,255,${0.70+pulse*0.30})`;
    const EGH = `rgba(240,180,255,0.95)`;
    const STA = `rgba(240,160,255,${0.45+pulse*0.45})`;
    const CRACK=`rgba(180,80,255,${0.55+crackT*0.40})`;                            // void crack glow
    const VOID= '#000005';
    const gA  = (0.72 + pulse * 0.22) * flicker;

    ctx.save(); ctx.globalAlpha = Math.max(0.08, gA);

    // ── TALL RECTANGULAR SILHOUETTE
    p(-4,-26,CO,8,2); p(-5,-24,CO,10,1); p(-6,-23,CO,12,1);
    p(-6,-22,CO,1,28); p( 5,-22,CO,1,28);
    p(-6,6,CO,12,1);
    p(-8,7,CO,2,12); p( 5,7,CO,2,12);
    p(-8,19,CO,4,2); p( 5,19,CO,4,2);

    // ── DARK FILL — 4 LAYERS
    p(-5,-25,D1,10,3);
    p(-5,-22,D2,10,28);
    p(-4,-21,D3,8,26);
    p(-3,-20,D4,6,24);
    p(-2,-19,D5,4,22);

    // Shoulder juts
    p(-8,-20,D1,2,6); p( 6,-20,D1,2,6);

    // ── VOID CRACKS SPLITTING BODY (always animated, glowing purple)
    ctx.save(); ctx.globalAlpha = 0.65 + crackT * 0.30;
    p(-3,-15,CRACK,1,8);                                                           // L vertical crack
    p( 2,-12,CRACK,1,10);                                                          // R vertical crack
    p(-5,-2,CRACK,8,1);                                                            // horizontal crack
    p(-2, 4,CRACK,1,4);
    p(-6,-22,CRACK,3,1);                                                           // diagonal crack at shoulder
    p( 3,-19,CRACK,3,1);
    ctx.restore();

    // ── DEEP HOLLOW EYE SOCKETS (was simple — now deeper void)
    p(-5,-19,CO,4,4); p( 1,-19,CO,4,4);
    p(-4,-18,VOID,2,2); p( 2,-18,VOID,2,2);
    p(-3,-17,EG,1,1); p( 3,-17,EG,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx+glitchX, cy+floatY,-3,-17,EGH,1,1,S);
    pEnemy(ctx, cx+glitchX, cy+floatY, 3,-17,EGH,1,1,S);
    ctx.restore();
    // Outer eye-pit aura
    ctx.save(); ctx.globalAlpha = gA * (0.40 + pulse * 0.30);
    p(-6,-20,EG,5,5); p( 0,-20,EG,5,5);
    ctx.restore();

    // ── VOID-TEAR STREAKS from sockets
    ctx.save(); ctx.globalAlpha = 0.65;
    pEnemy(ctx, cx+glitchX, cy+floatY,-3,-13+tearT*4,CRACK,1,3,S);
    pEnemy(ctx, cx+glitchX, cy+floatY, 3,-13+tearT*5,CRACK,1,3,S);
    ctx.restore();

    // ── SILENT-SCREAM MOUTH (gaping void)
    p(-3,-10,CO,6,4); p(-2,-9,VOID,4,2);

    // ── RANDOM GLITCH STATIC LINES (more, multi-Y, varying)
    if (Math.random() < 0.40) {
        ctx.save(); ctx.globalAlpha = (0.55 + pulse * 0.40);
        const sly1 = -18 + Math.floor(Math.random() * 24);
        const sly2 = -14 + Math.floor(Math.random() * 20);
        p(-5, sly1, STA, 10, 1);
        p(-4, sly2, STA,  8, 1);
        ctx.restore();
    }
    // RGB-split glitch (rare, jarring)
    if (Math.random() < 0.15) {
        ctx.save(); ctx.globalAlpha = 0.50;
        pEnemy(ctx, cx+glitchX-2, cy+floatY, -3,-17,EG,1,1,S);
        pEnemy(ctx, cx+glitchX+2, cy+floatY,  3,-17,EG,1,1,S);
        ctx.restore();
    }

    // ── NARROW LEGS
    p(-7,7,D2,3,12); p( 4,7,D2,3,12);
    p(-7,19,D1,4,2); p( 4,19,D1,4,2);

    // ── GHOST TAIL STUB AT BASE (shadow leak, longer)
    ctx.save(); ctx.globalAlpha = gA * 0.55;
    p(-5,6,D1,4,5); p( 1,7,D2,4,4);
    p(-3,11,D1,2,4); p( 1,11,D1,2,4);                                              // longer wisps
    ctx.restore();

    ctx.restore();
}

/**
 * --- IRON-CLAD SPECTER (tank) ---
 * 철갑 망령: Hulking ghost in dark iron armor; sin crystallised into impenetrable plate.
 * Charcoal iron + blood-red soul fissures; crit targets can crack through.
 */
function drawIronWraith(cx, cy, enemy) {
    const now = Date.now();
    const S   = 2.0;
    const pulse  = (Math.sin(now * 0.003) + 1) / 2;
    const flameT = Math.sin(now * 0.008) * 1;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, col, w, h, S);

    const CO='#000';
    const A1='#080808', A2='#111111', A3='#1A1A1A', A4='#242424', A5='#303030', HL='#444444', HV='#666666';
    const BN='#D8D0C0', BNH='#F0E8D8';                                             // pale bone visible inside
    const CK  = `rgba(200,0,0,${0.55+pulse*0.45})`;
    const CK2 = `rgba(255,80,20,${0.45+pulse*0.40})`;
    const SF  = `rgba(255,180,80,${0.55+pulse*0.35})`;                             // soul-flame leak
    const EG  = `rgba(255,0,0,${0.80+pulse*0.20})`;
    const EGH = `rgba(255,180,180,0.95)`;
    const VOID= '#000005';

    // ── soul aura (faint blood-red)
    ctx.save(); ctx.globalAlpha = 0.18 + pulse * 0.18;
    pEnemyAura(ctx, p, -22,-32, CK, 44, 64);
    ctx.restore();

    ctx.save(); ctx.globalAlpha = 0.96;

    // ── HELMET (iron plate, top-highlighted)
    p(-8,-28,CO,16,2); p(-9,-26,CO,18,1); p(-10,-25,CO,20,1);
    p(-10,-24,CO,1,14); p( 9,-24,CO,1,14); p(-10,-10,CO,20,1);
    p(-9,-27,A1,18,2); p(-9,-25,A2,18,15);
    p(-6,-24,A3,12,13); p(-4,-23,A4,8,11); p(-2,-22,A5,4,9);
    p(-9,-25,HV,18,1);                                                            // top highlight

    // ── VISOR SLIT (deeper void + dual ember pinpoint eyes)
    p(-8,-19,CO,16,5); p(-7,-18,VOID,14,3);
    // Dual hollow eye pinpoints (not full glow band — pinpoint pair)
    p(-5,-17,EG,3,1); p( 2,-17,EG,3,1);
    ctx.save(); ctx.globalAlpha = 0.90;
    pEnemy(ctx, cx, cy,-4,-17,EGH,1,1,S);
    pEnemy(ctx, cx, cy, 3,-17,EGH,1,1,S);
    ctx.restore();
    // Outer ember-eye aura through visor
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    pEnemy(ctx, cx, cy, -7,-18, EG, 14, 3, S);
    ctx.restore();

    // ── HELMET CRACKS (more, glowing soul-flame leaking)
    ctx.save(); ctx.globalAlpha = 0.70 + pulse * 0.30;
    p(-3,-27,CK,1,9); p( 2,-25,CK,1,7); p( 5,-24,CK,1,12);
    p(-7,-22,CK,1,6); p( 4,-27,CK,1,6);                                           // 2 more cracks
    ctx.restore();
    // Soul-flame wisp escaping crack at top of helm
    ctx.save(); ctx.globalAlpha = 0.65 + pulse * 0.30;
    pEnemy(ctx, cx, cy,-3,-31+flameT, SF, 1, 4, S);
    pEnemy(ctx, cx, cy, 5,-29+flameT, SF, 1, 3, S);
    ctx.restore();

    // ── SHOULDER PAULDRONS (one spike broken off — wronged warrior)
    p(-17,-12,CO,6,9); p( 11,-12,CO,6,9);
    p(-16,-11,A2,4,7); p( 12,-11,A2,4,7);
    p(-15,-10,A4,2,5); p( 13,-10,A4,2,5);
    p(-16,-11,HV,4,1); p( 12,-11,HV,4,1);                                         // top highlight
    // L pauldron spike (intact)
    p(-18,-15,CO,3,4); p(-17,-14,A4,1,3);
    // R pauldron spike BROKEN (jagged stump)
    p( 13,-13,CO,2,2);

    // ── BODY PLATE (top-highlighted)
    p(-10,-9,CO,20,24); p(-9,-8,A2,18,22);
    p(-7,-7,A3,14,20); p(-5,-6,A4,10,18); p(-3,-5,A5,6,16);
    p(-1,-7,HL,2,20);                                                             // chest centre ridge
    p(-9,-8,HV,18,1);                                                             // top highlight

    // ── BODY FISSURES (more, deeper — exposing pale bone interior)
    // Major chest crack revealing bone underneath
    p(-7,-3,VOID,3,9);                                                            // deep void crack L
    p(-7,-3,BN,1,9);                                                              // pale rib bone visible
    p( 4,-1,VOID,3,9);                                                            // deep void crack R
    p( 4,-1,BN,1,9);                                                              // pale bone
    // Soul-flame seeping from cracks
    ctx.save(); ctx.globalAlpha = 0.65 + pulse * 0.35;
    p(-6,-2,SF,1,6); p( 5,0,SF,1,7);
    ctx.restore();
    // Smaller surface cracks (glowing red)
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.40;
    p(-3,-7,CK2,1,6); p( 1,-9,CK2,1,5);
    p(-8,3,CK,4,1); p( 3,5,CK,4,1);                                               // horizontal cracks
    ctx.restore();

    // ── GREAVES / LEGS (riveted)
    p(-8,15,CO,6,12); p( 2,15,CO,6,12);
    p(-7,16,A2,4,10); p( 3,16,A2,4,10);
    p(-6,17,A4,2,8); p( 4,17,A4,2,8);
    p(-7,16,HV,4,1); p( 3,16,HV,4,1);                                             // top highlight
    p(-8,27,CO,8,2); p( 2,27,CO,8,2);
    // Greave cracks
    ctx.save(); ctx.globalAlpha = 0.50 + pulse * 0.30;
    p(-5,18,CK,1,7); p( 4,20,CK,1,5);
    ctx.restore();

    // ── GROUND CRACK GLOW (wider, more intense)
    ctx.save(); ctx.globalAlpha = 0.32 + pulse * 0.36;
    p(-12,27,CK,24,1);
    p(-10,28,CK2,20,1);                                                           // brighter inner glow
    ctx.restore();

    // ── DRIPPING SHADOW BELOW BODY (3 dark drops, no blood)
    const dripA = (now % 1800) / 1800;
    ctx.save(); ctx.globalAlpha = 0.55;
    pEnemy(ctx, cx, cy,-4, 30+dripA*3, CO, 1, 3, S);
    pEnemy(ctx, cx, cy, 3, 30+dripA*4, CO, 1, 3, S);
    ctx.restore();

    ctx.restore();
}

/**
 * --- ACCELERATED SHADOW (runner) ---
 * 가속된 그림자: Sleek shadow sprinting forward; speed hatred crystallised.
 * Lean silhouette with 4 layered purple-cyan speed trails behind.
 */
function drawShadowRunner(cx, cy, enemy) {
    const now = Date.now();
    const S   = 2.0;
    const pulse = (Math.sin(now * 0.012) + 1) / 2;
    const lean  = 3;
    const hairF = Math.sin(now * 0.008) * 1;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, col, w, h, S);

    const CO='#000';
    const R1='#09000F', R2='#12001E', R3='#1C0030', R4='#260048', R5='#320060', RV='#440080';
    const HR='#0A0014', HRH='#1A0028';                                             // long dark hair
    const TR   = `rgba(90,0,200,${0.55+pulse*0.35})`;
    const TR2  = `rgba(0,170,255,${0.40+pulse*0.35})`;
    const TR3  = `rgba(180,80,255,${0.30+pulse*0.30})`;
    const EG   = `rgba(140,0,255,${0.80+pulse*0.20})`;
    const EGH  = `rgba(220,180,255,0.95)`;
    const SP   = `rgba(0,170,255,${0.45+pulse*0.40})`;
    const VOID = '#000005';
    const VOIDT= `rgba(20,0,40,${0.45+pulse*0.30})`;

    ctx.save(); ctx.globalAlpha = 0.92;

    // ── VOID-BURN TRAIL BENEATH BODY (always visible)
    ctx.save(); ctx.globalAlpha = 0.55;
    pEnemy(ctx, cx, cy,-22,17, VOIDT, 28, 2, S);
    pEnemy(ctx, cx, cy,-26,19, VOIDT, 26, 1, S);
    ctx.restore();

    // ── 8 SPEED TRAILS (was 4 — longer, multi-Y)
    ctx.save();
    for (let i = 0; i < 8; i++) {
        const tox = (i + 1) * -4;
        const tal = (0.55 - i * 0.06) * (0.45 + pulse * 0.30);
        ctx.globalAlpha = tal;
        pEnemy(ctx, cx, cy, lean+tox-4, -22, TR,  4, 16, S);                       // upper trail
        pEnemy(ctx, cx, cy, lean+tox-2, -12, TR,  3, 10, S);
        pEnemy(ctx, cx, cy, lean+tox+1, -26, TR2, 3,  8, S);                       // top trail
        pEnemy(ctx, cx, cy, lean+tox-3,   4, TR3, 3,  6, S);                       // lower trail
    }
    ctx.restore();

    // ── STREAMING HAIR VEIL (whipping backward from speed)
    ctx.save(); ctx.globalAlpha = 0.75;
    p(lean-8+hairF,-24,CO,5,2);                                                   // hair base
    p(lean-12+hairF,-22,CO,4,2); p(lean-11+hairF,-21,HR,2,1);
    p(lean-16+hairF,-20,CO,4,2); p(lean-15+hairF,-19,HR,2,1);
    p(lean-20+hairF,-18,CO,3,2); p(lean-19+hairF,-17,HRH,1,1);
    ctx.restore();

    // ── HEAD (top-highlighted)
    p(lean-3,-24,CO,6,1); p(lean-4,-23,CO,8,1);
    p(lean-5,-22,CO,1,8); p(lean+4,-22,CO,1,8); p(lean-5,-14,CO,10,1);
    p(lean-4,-22,R2,8,2); p(lean-4,-20,R3,8,6); p(lean-3,-19,R4,6,4); p(lean-2,-18,R5,4,2);
    p(lean-4,-22,RV,8,1);                                                         // top highlight

    // ── HOLLOW VOID EYE SOCKETS (replace flat visor slit)
    p(lean-4,-17,CO,8,3);
    p(lean-3,-16,VOID,3,2); p(lean+1,-16,VOID,3,2);
    p(lean-3,-16,EG,2,1); p(lean+1,-16,EG,2,1);
    ctx.save(); ctx.globalAlpha = 0.90;
    pEnemy(ctx, cx, cy, lean-2,-16, EGH, 1, 1, S);
    pEnemy(ctx, cx, cy, lean+2,-16, EGH, 1, 1, S);
    ctx.restore();
    // Outer eye-burn glow
    ctx.save(); ctx.globalAlpha = 0.40 + pulse * 0.35;
    p(lean-4,-18,EG,10,4);
    ctx.restore();

    // ── SILENT-SCREAM MOUTH (gaping void)
    p(lean-2,-13,CO,4,2); p(lean-1,-12,VOID,2,1);

    // ── TORSO (narrow, elongated, top-highlighted)
    p(lean-3,-13,CO,6,1);
    p(lean-4,-12,CO,1,20); p(lean+3,-12,CO,1,20);
    p(lean-3,-12,R2,6,20); p(lean-2,-11,R3,4,18); p(lean-1,-10,R4,2,16);
    p(lean-3,-12,RV,6,1);                                                         // top highlight

    // ── SPINE STREAK (cyan, always glowing)
    ctx.save(); ctx.globalAlpha = 0.50 + pulse * 0.40;
    p(lean-1,-21,SP,1,21);
    ctx.restore();

    // ── ARMS (swept back, more aggressive sweep)
    p(lean+3,-9,R1,6,2); p(lean+4,-8,CO,5,1);
    p(lean+9,-7,CO,4,1); p(lean+10,-6,R2,3,1);                                    // L arm extension
    p(lean-8,-7,R1,5,2); p(lean-9,-6,CO,4,1);
    p(lean-13,-5,CO,3,1); p(lean-12,-4,R2,2,1);                                   // L arm trail

    // ── SPRINTING LEGS
    const legA = Math.round(pulse * 3);
    p(lean-3,8,CO,3,10);        p(lean+1,8-legA,CO,3,10+legA);
    p(lean-2,9,R2,2,9);         p(lean+2,9-legA,R2,2,9+legA);
    p(lean-3,18,CO,4,2);        p(lean+1,18+legA,CO,4,2);

    ctx.restore();
}

/**
 * --- GREEDY POLTERGEIST (greedy) ---
 * 탐욕스러운 폴터가이스트: Rotund amber ghost with three orbiting gold coins and a
 * wide greedy grin. Drops large SE reward on death.
 */
function drawGreedyPoltergeist(cx, cy, enemy) {
    const now = Date.now();
    const S   = 2.0;
    const pulse   = (Math.sin(now * 0.004) + 1) / 2;
    const floatY  = Math.sin(now * 0.003) * 5;
    const coinAng = now * 0.0030;
    const tearT   = (now % 1800) / 1800;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY, ox, oy, col, w, h, S);

    const CO='#000';
    const G1='#1A1000', G2='#2E1E00', G3='#432C00', G4='#5A3C00', G5='#724E00', HL='#8E6814', HV='#A88030';
    const GD1='#C49A00', GD2='#FFD700', GD3='#FFEE88', GDH='#FFFFCC';
    const PSK='#7A6A50';                                                          // sallow ghost-flesh undertone
    const EG  = `rgba(255,200,0,${0.80+pulse*0.20})`;
    const EGH = `rgba(255,255,200,0.95)`;
    const VOID= '#000005';
    const gA  = 0.84 + pulse * 0.10;

    // ── greed-curse aura
    ctx.save(); ctx.globalAlpha = 0.18 + pulse * 0.18;
    pEnemyAura(ctx, p, -16,-26,GD2,32,40);
    ctx.restore();

    ctx.save(); ctx.globalAlpha = gA;

    // ── 6 ORBITING COINS (was 3 — chained to body w/ thin dark threads)
    ctx.save();
    for (let i = 0; i < 6; i++) {
        const ang = coinAng + i * (Math.PI / 3);
        const cox = Math.round(Math.cos(ang) * 14);
        const coy = Math.round(Math.sin(ang) * 6);
        // Chain link line from body to coin
        ctx.globalAlpha = 0.30;
        pEnemy(ctx, cx, cy+floatY, Math.round(cox/2), Math.round(coy/2)-4, CO, 1, 1, S);
        // Coin
        ctx.globalAlpha = gA * (0.72 + 0.28 * pulse);
        pEnemy(ctx, cx, cy+floatY, cox-1, coy-6, CO,  3, 6, S);
        pEnemy(ctx, cx, cy+floatY, cox,   coy-6, GD1, 2, 5, S);
        pEnemy(ctx, cx, cy+floatY, cox,   coy-6, GDH, 2, 1, S);                    // top highlight
        pEnemy(ctx, cx, cy+floatY, cox,   coy-5, GD3, 1, 1, S);                    // shine
    }
    ctx.restore();

    // ── ROUND HEAD OUTLINE
    p(-5,-22,CO,2,1); p(-6,-21,CO,4,1);
    p(-10,-20,CO,12,1); p(-11,-19,CO,1,12); p(10,-19,CO,1,12);
    p(-11,-7,CO,22,1);
    p(-12,-6,CO,2,10); p(10,-6,CO,2,10); p(-12,4,CO,24,1);

    // ── HEAD FILL (5 layers, top-highlighted)
    p(-9,-21,G1,9,2); p(-10,-19,G1,20,12);
    p(-9,-18,G2,18,10); p(-7,-17,G3,14,8); p(-5,-16,G4,10,6); p(-3,-15,G5,6,4);
    p(-10,-19,HV,20,1);                                                           // top highlight
    p(-8,-19,HL,4,3); p(-7,-18,HL,2,1);
    // Sallow ghost-flesh undertone
    ctx.save(); ctx.globalAlpha = gA * 0.35;
    p(-7,-17,PSK,14,8);
    ctx.restore();

    // ── HOLLOW GREEDY EYE SOCKETS (deep void + gold-fire pinpoint)
    p(-8,-15,CO,4,4); p( 4,-15,CO,4,4);
    p(-7,-14,VOID,2,2); p( 5,-14,VOID,2,2);
    p(-7,-14,EG,2,1); p( 5,-14,EG,2,1);
    p(-6,-13,GDH,1,1); p( 6,-13,GDH,1,1);                                         // bright pupils
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy+floatY,-6,-13,'#FFFFFF',1,1,S);
    pEnemy(ctx, cx, cy+floatY, 6,-13,'#FFFFFF',1,1,S);
    ctx.restore();
    // Outer eye-burn aura
    ctx.save(); ctx.globalAlpha = 0.45 + pulse * 0.30;
    p(-9,-16,EG,5,5); p( 3,-16,EG,5,5);
    ctx.restore();

    // ── GOLD-TEAR WEEPING (slow descent from sockets)
    ctx.save(); ctx.globalAlpha = 0.65;
    pEnemy(ctx, cx, cy+floatY,-6,-10+tearT*4, GD2, 1, 2, S);
    pEnemy(ctx, cx, cy+floatY, 6,-10+tearT*5, GD2, 1, 2, S);
    ctx.restore();

    // ── BROKEN-JAW VOID GRIN (gaping void, gold teeth scattered/missing)
    p(-8,-10,CO,16,1); p(-9,-9,CO,2,3); p( 7,-9,CO,2,3); p(-8,-7,CO,16,1);
    p(-8,-9,VOID,16,2);                                                           // void mouth interior
    // Gold teeth (some missing — gaps for greed-rot)
    p(-7,-9,GD2,2,1); p(-1,-9,GD2,2,1); p( 2,-9,GD2,2,1); p( 5,-9,GD2,2,1);
    // Gold drool drip
    ctx.save(); ctx.globalAlpha = 0.65;
    pEnemy(ctx, cx, cy+floatY,-2,-6+tearT*5, GD2, 1, 2, S);
    pEnemy(ctx, cx, cy+floatY, 3,-7+tearT*6, GD1, 1, 1, S);
    ctx.restore();

    // ── ROTUND BELLY (top-highlighted, ghost-flesh undertone)
    p(-11,-5,G1,22,10); p(-10,-4,G2,20,8);
    p(-8,-3,G3,16,6); p(-6,-2,G4,12,4); p(-4,-1,G5,8,2);
    p(-10,-5,HV,22,1);                                                            // top highlight
    p(-9,-5,HL,3,2);
    // Gold coin embedded in belly
    p(-1,0,CO,4,3); p( 0,1,GD2,2,1);

    // ── STUBBY ARMS (clawed gold-fingered)
    p(-14,-9,CO,4,4); p( 10,-9,CO,4,4);
    p(-13,-8,G2,2,2); p( 11,-8,G2,2,2);
    p(-15,-7,CO,2,2); p( 13,-7,CO,2,2);                                           // clawed gold fingers
    p(-14,-6,GD1,1,1); p( 14,-6,GD1,1,1);

    // ── WISPY GHOST TAILS (longer, sallow-tinted)
    p(-8,5,G1,4,5); p(-7,10,CO,3,3); p(-6,13,CO,2,2);
    p(-2,5,G2,4,7); p(-1,12,G1,2,3); p( 0,15,CO,1,2);
    p( 4,5,G1,4,5); p( 5,10,CO,3,3); p( 6,13,CO,2,2);

    ctx.restore();
}

/**
 * --- LIGHTSPEED HERALD (lightspeed) ---
 * 필사적인 전령: A desperate messenger so fast it is nearly invisible—
 * only a shrieking afterburn remains where its body once was.
 */
function drawLightspeedHerald(cx, cy, enemy) {
    const now = Date.now();
    const S   = 2.0;
    const t   = now * 0.008;
    const blur = (Math.sin(t) + 1) / 2;
    const rippleT = (now % 1000) / 1000;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, col, w, h, S);

    const CO='#000';
    const W2 = 'rgba(200,230,255,0.12)';
    const W3 = 'rgba(140,200,255,0.22)';
    const W4 = 'rgba(80,160,255,0.35)';
    const W5 = 'rgba(200,230,255,0.60)';
    const EG  = `rgba(255,255,255,${0.85+blur*0.15})`;
    const SK1 = `rgba(120,200,255,${0.45+blur*0.40})`;
    const SK2 = `rgba(255,255,255,${0.25+blur*0.30})`;
    const SK3 = `rgba(80,180,255,${0.55+blur*0.35})`;
    const VOID='#000005';
    const PSK= `rgba(220,200,180,${0.40+blur*0.20})`;                              // pale ghost skin

    // ── SONIC RIPPLE WAKE (expanding ring behind body)
    ctx.save(); ctx.globalAlpha = 0.50 * (1 - rippleT);
    pEnemy(ctx,cx,cy,-30-rippleT*16,-12,SK3,4,28,S);
    pEnemy(ctx,cx,cy,-32-rippleT*18, -4,SK3,4,12,S);
    ctx.restore();

    ctx.save(); ctx.globalAlpha = 0.72 + blur * 0.18;

    // ── LONGER MULTI-STREAK MOTION TRAILS (was 5 — now 8 + multi-Y)
    ctx.save();
    for (let i = 0; i < 8; i++) {
        const bx = -(i + 1) * 6;
        const al = (0.50 - i * 0.06) * (0.40 + blur * 0.35);
        ctx.globalAlpha = al;
        pEnemy(ctx, cx, cy, bx-4, -20, SK1, 4, 14, S);                            // upper streak
        pEnemy(ctx, cx, cy, bx-2, -10, SK2, 3,  8, S);
        pEnemy(ctx, cx, cy, bx-3,  -4, SK1, 2,  6, S);
        pEnemy(ctx, cx, cy, bx-4,   4, SK3, 3,  6, S);                            // lower streak
    }
    ctx.restore();

    // Ground sonic line
    ctx.save(); ctx.globalAlpha = 0.22 + blur * 0.22;
    p(-30, 18, SK1, 60, 1); p(-28, 19, SK2, 56, 1);
    ctx.restore();

    // ── OUTLINE
    p(-4,-25,CO,8,2); p(-5,-23,CO,10,1);
    p(-6,-22,CO,1,28); p( 5,-22,CO,1,28); p(-6,6,CO,12,1);

    // ── SPECTRAL BODY FILLS
    p(-5,-22,W2,10,28); p(-4,-22,W3,8,26); p(-3,-21,W4,6,24); p(-1,-20,W5,2,22);
    ctx.save(); ctx.globalAlpha *= 0.70; p(0,-23,W5,2,24); ctx.restore();

    // ── SKELETAL HEAD (pale gaunt outline)
    p(-4,-25,W4,8,6); p(-3,-24,W5,6,4);
    p(-4,-23,PSK,8,3);                                                            // pale skull tone
    ctx.save(); ctx.globalAlpha *= 0.55; p(-5,-27,EG,10,8); ctx.restore();

    // ── HOLLOW VOID EYE SOCKETS (deep pits w/ white pinpoint glow)
    p(-3,-21,CO,3,3); p( 1,-21,CO,3,3);
    p(-3,-21,VOID,3,1); p( 1,-21,VOID,3,1);
    p(-2,-20,EG,1,1); p( 2,-20,EG,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx,cx,cy,-2,-20,'#FFFFFF',1,1,S);
    pEnemy(ctx,cx,cy, 2,-20,'#FFFFFF',1,1,S);
    ctx.restore();
    // Outer eye-burn aura
    ctx.save(); ctx.globalAlpha = 0.45 + blur * 0.35;
    p(-4,-22,EG,4,4); p( 0,-22,EG,4,4);
    ctx.restore();

    // ── SILENT-SCREAM SKELETAL MOUTH (gaping void w/ tiny fang gaps)
    p(-3,-15,CO,6,4); p(-2,-14,VOID,4,2);
    p(-2,-14,PSK,1,1); p( 0,-14,PSK,1,1); p( 1,-14,PSK,1,1);                      // tiny teeth gaps

    // ── DRIFTING SCREAM HAIR (whips back from speed)
    ctx.save(); ctx.globalAlpha = 0.55 + blur * 0.25;
    p(-12,-26,CO,2,3); p(-14,-24,CO,2,3); p(-16,-22,CO,2,3);                      // hair strands
    p(-11,-25,W3,1,2); p(-13,-23,W3,1,2); p(-15,-21,W3,1,2);
    ctx.restore();

    ctx.restore();
}

/**
 * --- DEFILED APPRENTICE (defiled_apprentice) ---
 */

/**
 * --- ECHO SOUL (echo_soul) ---
 * 원혼: Ghost that leaves layered afterimage echoes; haunts the same path twice.
 * Three echo layers trail behind, each progressively faded.
 */
function drawEchoSoul(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.004) + 1) / 2;
    const floatY = Math.sin(now * 0.0025) * 3;
    const echoT  = now * 0.003;

    const CO = '#000000';
    const C1 = '#100520'; const C2 = '#200A40'; const C3 = '#321565';
    const C4 = '#4A2490'; const C5 = '#5E3AAA'; const HL = '#7A54CC';
    const EG = `rgba(160,80,255,${0.60 + pulse * 0.38})`;
    const gA = 0.88 + pulse * 0.10;

    // ── ECHO TRAILS (3 progressively faded copies) ────────────
    ctx.save();
    [
        { ox: Math.round(Math.sin(echoT + 1.0) * 5), oy: Math.round(Math.cos(echoT + 1.0) * 3), a: 0.18 + pulse * 0.10 },
        { ox: Math.round(Math.sin(echoT + 2.1) * 8), oy: Math.round(Math.cos(echoT + 2.1) * 5), a: 0.11 + pulse * 0.07 },
        { ox: Math.round(Math.sin(echoT + 3.2) * 11), oy: Math.round(Math.cos(echoT + 3.2) * 6), a: 0.06 + pulse * 0.04 },
    ].forEach(e => {
        ctx.globalAlpha = e.a;
        const ecx = cx + e.ox * S; const ecy = cy + floatY * S + e.oy * S;
        // Echo body silhouette
        pEnemy(ctx, ecx, ecy, -6,-21, C3, 12, 4, S); pEnemy(ctx, ecx, ecy, -7,-17, C4, 14,14, S);
        pEnemy(ctx, ecx, ecy, -8, -3, C3, 16,12, S); pEnemy(ctx, ecx, ecy, -7, -2, C4, 14, 9, S);
        pEnemy(ctx, ecx, ecy, -4,  9, C2,  3, 7, S); pEnemy(ctx, ecx, ecy,  0,  9, C3,  3, 8, S);
        pEnemy(ctx, ecx, ecy,  4,  9, C2,  3, 6, S);
    });
    ctx.restore();

    ctx.save(); ctx.globalAlpha = gA;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    // ── HEAD OUTLINE ───────────────────────────────────────────
    p(-3,-22,CO, 6, 1); p(-5,-21,CO,10, 1); p(-6,-20,CO,12, 1);
    p(-7,-19,CO, 1,16); p( 6,-19,CO, 1,16); p(-7,-3,CO,14, 1);

    // Head fills — 5 depth layers
    p(-5,-21,C1,10, 2); p(-6,-19,C2,12,16);
    p(-5,-18,C3,10,14); p(-3,-17,C4, 6,12); p(-1,-16,C5, 2,10);
    p(-5,-19,HL, 3, 4); // specular

    // ── HOLLOW VOID EYE SOCKETS (deep + purple-fire pinpoint)
    p(-5,-16,CO,4,3); p( 2,-16,CO,4,3);
    p(-4,-15,'#000005',2,2); p( 3,-15,'#000005',2,2);
    p(-4,-15,EG,1,1); p( 3,-15,EG,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy + floatY * S,-4,-15,'#E1BEE7',1,1,S);
    pEnemy(ctx, cx, cy + floatY * S, 3,-15,'#E1BEE7',1,1,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.55;
    p(-5,-17,EG,5,4); p( 2,-17,EG,5,4);
    ctx.restore();

    // ── SILENT-SCREAM VOID MOUTH
    p(-2,-11,CO,4,2); p(-1,-10,'#000005',2,1);

    // ── BODY OUTLINE
    p(-8,-2,CO,2,2); p( 6,-2,CO,2,2);
    p(-9,-1,CO,1,10); p( 8,-1,CO,1,10); p(-9,9,CO,18,1);

    // Body fills
    p(-7, -2,C1,14, 2); p(-8, 0,C2,16,10);
    p(-6, 1,C3,12, 8); p(-4, 2,C4, 8, 6); p(-2, 3,C5, 4, 4);
    p(-7, -1,HL, 3, 3); // chest specular

    // ── WISPY TAILS ────────────────────────────────────────────
    p(-6, 10,C1, 3, 6); p(-6,16,CO, 2, 3);
    p( 0, 10,C2, 3, 7); p( 0,17,C1, 2, 4); p( 1,21,CO, 1, 2);
    p( 4, 10,C1, 3, 5); p( 5,15,CO, 2, 3);

    // ── ECHO SHIMMER AURA ──────────────────────────────────────
    ctx.save(); ctx.globalAlpha *= 0.22;
    pEnemyAura(ctx, p, -9,-22, EG, 18, 32);
    ctx.restore();

    ctx.restore();
}

/**
 * --- HUNGRY GHOST (hungry_ghost) ---
 * 원혼: Grotesquely gaunt spirit — an endless void of hunger made visible.
 * Enormous maw stretches wider as it nears its destination.
 */
function drawHungryGhost(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.006) + 1) / 2;
    const floatY = Math.sin(now * 0.003) * 4;
    const mawP   = (Math.sin(now * 0.009) + 1) / 2; // maw pulse
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO  = '#000000';
    const C1  = '#050510'; const C2 = '#0C0C22'; const C3 = '#141432';
    const C4  = '#1E1E45'; const C5 = '#282858'; const HL = '#3A3A7A';
    const MW  = `rgba(180,0,0,${0.65 + mawP * 0.35})`; // maw void
    const TH  = `rgba(220,200,180,${0.55 + pulse * 0.25})`; // teeth
    const EG  = `rgba(255,80,0,${0.72 + pulse * 0.28})`;
    const gA  = 0.88 + pulse * 0.08;

    ctx.save(); ctx.globalAlpha = gA;

    // ── GAUNT HEAD OUTLINE ─────────────────────────────────────
    p(-2,-25,CO, 4, 1); p(-3,-24,CO, 6, 1); p(-4,-23,CO, 8, 1);
    p(-5,-22,CO,10, 1); p(-6,-21,CO, 1,22); p( 5,-21,CO, 1,22);
    p(-6, 1,CO,12, 1);

    // Head fills — 5 depth layers (sunken gaunt appearance)
    p(-2,-24,C1, 4, 2); p(-4,-22,C2,10, 2);
    p(-5,-20,C2,10,20); p(-4,-19,C3, 8,18); p(-3,-18,C4, 6,16);
    p(-2,-17,C5, 4,14); p(-1,-16,HL, 2,12);
    p(-4,-21,HL, 2, 4); // specular

    // ── DEEP HOLLOW VOID EYE SOCKETS (sunken w/ ember pinpoint)
    p(-5,-19,CO,5,5); p( 1,-19,CO,5,5);
    p(-4,-18,'#000005',3,3); p( 2,-18,'#000005',3,3);
    p(-3,-17,EG,1,1); p( 3,-17,EG,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy + floatY * S,-3,-17,'#FFAA40',1,1,S);
    pEnemy(ctx, cx, cy + floatY * S, 3,-17,'#FFAA40',1,1,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.55;
    p(-5,-19,EG,5,6); p( 1,-19,EG,5,6);
    ctx.restore();

    // ── SKELETAL RIBCAGE (visible through translucent belly) ───
    ctx.save(); ctx.globalAlpha *= 0.30;
    p(-4,-8,CO, 1,4); p(-2,-8,CO, 1,4); p( 0,-8,CO, 1,4); p( 2,-8,CO, 1,4);
    ctx.restore();

    // ── ENORMOUS MAW ───────────────────────────────────────────
    const mawW = Math.round(8 + mawP * 2);
    const mawH = Math.round(5 + mawP * 2);
    p(-4,-12,CO, 8, 1); // upper lip
    p(-mawW,-11,MW, mawW*2, mawH); // maw void interior
    // Upper teeth
    p(-4,-12,TH, 2, 2); p(-1,-12,TH, 2, 2); p( 2,-12,TH, 2, 2);
    // Lower teeth
    p(-3,-11+mawH,TH, 2, 2); p( 0,-11+mawH,TH, 2, 2);
    p(-4,-11+mawH,CO, 8, 1); // lower lip

    // ── EMACIATED BODY ─────────────────────────────────────────
    p(-7, 2,CO, 2, 2); p( 5, 2,CO, 2, 2);
    p(-8, 4,CO, 1,10); p( 7, 4,CO, 1,10); p(-8,14,CO,16, 1);
    p(-7, 4,C1,14,10); p(-6, 5,C3,12, 8); p(-5, 6,C4, 9, 6);

    // ── WISPY TAILS (7 strands, very thin) ────────────────────
    p(-6,15,C1, 2, 6); p(-6,21,CO, 1, 3);
    p(-3,15,C2, 2, 8); p(-2,23,C1, 1, 3); p(-2,26,CO, 1, 2);
    p( 0,15,C1, 2, 7); p( 1,22,CO, 1, 2);
    p( 3,15,C2, 2, 6); p( 4,21,CO, 1, 3);
    p( 5,15,C1, 1, 5); p( 5,20,CO, 1, 2);

    ctx.restore();
}

/**
 * --- AGGRIEVED (aggrieved) ---
 * 원혼: Incandescent rage — first hit absorbed by a seething grudge-shield.
 * Body cracked with rage-fire, brow furrowed into hatred, aura pulsing crimson.
 */
function drawAggrieved(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.005) + 1) / 2;
    const floatY = Math.sin(now * 0.002) * 2;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO  = '#000000';
    const C1  = '#1A0000'; const C2 = '#300000'; const C3 = '#4A0000';
    const C4  = '#6A0000'; const C5 = '#8A1010'; const HL = '#B03020';
    const SA  = 0.20 + pulse * 0.25;
    const SC  = `rgba(255,80,0,${SA})`;       // shield aura
    const CK  = `rgba(255,120,0,${0.45 + pulse * 0.45})`; // rage cracks
    const EG  = `rgba(255,200,0,${0.80 + pulse * 0.20})`;
    const MW  = `rgba(200,20,0,${0.55 + pulse * 0.35})`; // mouth
    const gA  = 0.90 + pulse * 0.08;

    ctx.save(); ctx.globalAlpha = gA;

    // ── GRUDGE-SHIELD AURA ────────────────────────────────────
    ctx.save(); ctx.globalAlpha = SA * 0.85;
    p(-13,-21,SC, 2,30); p(11,-21,SC, 2,30);
    p(-11,-23,SC,22, 2); p(-11, 9,SC,22, 2);
    ctx.restore();
    // Corner sparks
    ctx.save(); ctx.globalAlpha = pulse * 0.70;
    p(-14,-22,CK, 4, 4); p(10,-22,CK, 4, 4);
    p(-14, 8,CK, 4, 4); p(10,  8,CK, 4, 4);
    ctx.restore();

    // ── HEAD OUTLINE ──────────────────────────────────────────
    p(-3,-23,CO, 6, 1); p(-5,-22,CO,10, 1); p(-6,-21,CO,12, 1);
    p(-7,-20,CO, 1,16); p( 6,-20,CO, 1,16); p(-7,-4,CO,14, 1);

    // Head fills — 5 depth layers
    p(-5,-22,C1,10, 2); p(-6,-20,C2,12,16);
    p(-5,-19,C3,10,14); p(-3,-18,C4, 6,12); p(-1,-17,C5, 2,10);
    p(-5,-20,HL, 3, 4); // specular

    // ── RAGE CRACKS across head ────────────────────────────────
    ctx.save(); ctx.globalAlpha *= (0.50 + pulse * 0.45);
    p(-4,-20,CK, 1,10); p( 2,-18,CK, 1, 7); p( 3,-20,CK, 1, 5);
    p(-2,-22,CK, 1, 4);
    ctx.restore();

    // ── FURIOUS BROW ──────────────────────────────────────────
    p(-6,-17,CO, 5, 2); p( 1,-17,CO, 5, 2); // heavy brow
    ctx.save(); ctx.globalAlpha *= 0.70;
    p(-7,-18,CK, 5, 2); p( 2,-18,CK, 5, 2); // brow flame
    ctx.restore();

    // ── HOLLOW BURNING VOID EYE SOCKETS (deep + ember pinpoint)
    p(-5,-15,CO,5,4); p( 1,-15,CO,5,4);
    p(-4,-14,'#000005',3,2); p( 2,-14,'#000005',3,2);
    p(-3,-13,EG,1,1); p( 3,-13,EG,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy + floatY * S,-3,-13,'#FFEE80',1,1,S);
    pEnemy(ctx, cx, cy + floatY * S, 3,-13,'#FFEE80',1,1,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    p(-6,-16,EG,7,6); p( 1,-16,EG,7,6);
    ctx.restore();

    // ── CLENCHED SCREAM VOID MAW (pale bone teeth)
    p(-4,-9,CO,8,1); p(-5,-8,'#000005',10,4);
    p(-4,-7,'#D8C0A8',1,3); p(-1,-7,'#D8C0A8',1,3); p( 2,-7,'#D8C0A8',1,3);        // 3 bone fangs
    p(-4,-4,CO,8,1);

    // ── BODY OUTLINE ──────────────────────────────────────────
    p(-9, -3,CO, 2, 2); p( 7, -3,CO, 2, 2);
    p(-10,-1,CO, 1,12); p( 9, -1,CO, 1,12); p(-10,11,CO,20, 1);

    // Body fills
    p(-8, -2,C1,16, 2); p(-9, 0,C2,18,12);
    p(-7, 1,C3,14,10); p(-5, 2,C4,10, 8); p(-3, 3,C5, 6, 6); p(-1, 4,HL, 2, 4);

    // Body rage cracks
    ctx.save(); ctx.globalAlpha *= (0.50 + pulse * 0.45);
    p(-7, 0,CK, 1,10); p( 3, 2,CK, 1, 8); p(-2,-1,CK, 1, 6);
    ctx.restore();

    // ── FLAILING ARMS ─────────────────────────────────────────
    p(-15,-5,CO, 6, 4); p(-14,-4,C2, 4, 2);
    p( 9,-5,CO, 6, 4); p( 10,-4,C2, 4, 2);
    ctx.save(); ctx.globalAlpha *= 0.55;
    p(-15,-5,CK, 6, 4); p( 9,-5,CK, 6, 4);
    ctx.restore();

    // ── TAILS ─────────────────────────────────────────────────
    p(-8,12,C1, 4, 6); p(-7,18,CO, 3, 3);
    p(-1,12,C2, 3, 7); p( 0,19,C1, 2, 3);
    p( 4,12,C1, 4, 5); p( 5,17,CO, 3, 3);

    ctx.restore();
}

/**
 * --- SPLIT SOUL (split_soul) ---
 * 원혼: Agonised ghost cracking apart — each half a separate anguished face.
 * Splitting widens over time; cyan fault-lightning tears the seam.
 */
function drawSplitSoul(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.005) + 1) / 2;
    const split  = Math.round(Math.sin(now * 0.002) * 3 + 1); // 0-4 px
    const floatY = Math.sin(now * 0.003) * 3;
    const lightT = (now * 0.014) % (Math.PI * 2);
    const lightP = (Math.sin(lightT) + 1) / 2;

    const CO  = '#000000';
    const C1  = '#0A1420'; const C2 = '#142030'; const C3 = '#1E3045';
    const C4  = '#283F5A'; const C5 = '#324E70'; const HL = '#405E80';
    const CK  = `rgba(0,200,255,${0.55 + lightP * 0.44})`;  // crack lightning
    const EGL = `rgba(100,220,255,${0.65 + pulse * 0.33})`; // left eye
    const EGR = `rgba(255,100,100,${0.65 + pulse * 0.33})`; // right eye (different anguish)
    const gA  = 0.84 + pulse * 0.12;

    ctx.save();

    // ── LEFT HALF ─────────────────────────────────────────────
    ctx.save(); ctx.globalAlpha = gA;
    const lx = cx - split * S;
    pEnemy(ctx, lx, cy + floatY * S, -9,-24, C1, 9, 2, S);
    pEnemy(ctx, lx, cy + floatY * S, -9,-22, C2, 9,20, S);
    pEnemy(ctx, lx, cy + floatY * S, -8,-21, C3, 8,18, S);
    pEnemy(ctx, lx, cy + floatY * S, -7,-20, C4, 7,16, S);
    pEnemy(ctx, lx, cy + floatY * S, -6,-19, C5, 6,14, S);
    pEnemy(ctx, lx, cy + floatY * S, -8,-22, HL, 3, 5, S); // specular
    // Left outline
    pEnemy(ctx, lx, cy + floatY * S, -9,-24, CO, 1,24, S);
    pEnemy(ctx, lx, cy + floatY * S, -8,-25, CO, 8, 1, S);
    pEnemy(ctx, lx, cy + floatY * S, -9, 0, CO, 9, 1, S);
    // Left body
    pEnemy(ctx, lx, cy + floatY * S, -9, 1, C1, 9,14, S);
    pEnemy(ctx, lx, cy + floatY * S, -8, 2, C3, 8,12, S);
    pEnemy(ctx, lx, cy + floatY * S, -7, 3, C5, 7,10, S);
    pEnemy(ctx, lx, cy + floatY * S, -9,15, CO, 9, 1, S);
    // Left HOLLOW VOID EYE SOCKET (cyan-tear anguish)
    pEnemy(ctx, lx, cy + floatY * S, -7,-19, CO, 5, 4, S);
    pEnemy(ctx, lx, cy + floatY * S, -6,-18, '#000005', 3, 2, S);
    pEnemy(ctx, lx, cy + floatY * S, -5,-17, EGL, 1, 1, S);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, lx, cy + floatY * S, -5,-17, '#FFFFFF', 1, 1, S);
    ctx.restore();
    // Left mouth (grimace)
    pEnemy(ctx, lx, cy + floatY * S, -7,-8, CO, 6, 1, S);
    pEnemy(ctx, lx, cy + floatY * S, -6,-7, CO, 4, 1, S);
    // Left tails
    pEnemy(ctx, lx, cy + floatY * S, -8, 16, C1, 3, 7, S);
    pEnemy(ctx, lx, cy + floatY * S, -8, 23, CO, 2, 3, S);
    pEnemy(ctx, lx, cy + floatY * S, -5, 16, C2, 2, 8, S);
    ctx.restore();

    // ── RIGHT HALF ────────────────────────────────────────────
    ctx.save(); ctx.globalAlpha = gA;
    const rx = cx + split * S;
    pEnemy(ctx, rx, cy + floatY * S,  0,-24, C1, 9, 2, S);
    pEnemy(ctx, rx, cy + floatY * S,  0,-22, C2, 9,20, S);
    pEnemy(ctx, rx, cy + floatY * S,  0,-21, C3, 8,18, S);
    pEnemy(ctx, rx, cy + floatY * S,  0,-20, C4, 7,16, S);
    pEnemy(ctx, rx, cy + floatY * S,  0,-19, C5, 6,14, S);
    // Right outline
    pEnemy(ctx, rx, cy + floatY * S,  8,-24, CO, 1,24, S);
    pEnemy(ctx, rx, cy + floatY * S,  0,-25, CO, 8, 1, S);
    pEnemy(ctx, rx, cy + floatY * S,  0,  0, CO, 9, 1, S);
    // Right body
    pEnemy(ctx, rx, cy + floatY * S,  0,  1, C1, 9,14, S);
    pEnemy(ctx, rx, cy + floatY * S,  0,  2, C3, 8,12, S);
    pEnemy(ctx, rx, cy + floatY * S,  0,  3, C5, 7,10, S);
    pEnemy(ctx, rx, cy + floatY * S,  0, 15, CO, 9, 1, S);
    // Right HOLLOW VOID EYE SOCKET (red anguish, resigned)
    pEnemy(ctx, rx, cy + floatY * S,  2,-19, CO, 5, 4, S);
    pEnemy(ctx, rx, cy + floatY * S,  3,-18, '#000005', 3, 2, S);
    pEnemy(ctx, rx, cy + floatY * S,  4,-17, EGR, 1, 1, S);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, rx, cy + floatY * S,  4,-17, '#FFCCCC', 1, 1, S);
    ctx.restore();
    // Right mouth (open wail)
    pEnemy(ctx, rx, cy + floatY * S,  1,-8, CO, 2, 3, S);
    pEnemy(ctx, rx, cy + floatY * S,  2,-7, CO, 4, 1, S);
    // Right tails
    pEnemy(ctx, rx, cy + floatY * S,  5, 16, C1, 3, 7, S);
    pEnemy(ctx, rx, cy + floatY * S,  5, 23, CO, 2, 3, S);
    pEnemy(ctx, rx, cy + floatY * S,  3, 16, C2, 2, 8, S);
    ctx.restore();

    // ── CRACK SEAM (lightning bolt down the fault line) ───────
    ctx.save(); ctx.globalAlpha = gA * (0.55 + lightP * 0.45);
    pEnemy(ctx, cx, cy + floatY * S, -1,-26, CK, 2, 4, S);
    pEnemy(ctx, cx, cy + floatY * S,  0,-22, CK, 2, 5, S);
    pEnemy(ctx, cx, cy + floatY * S, -1,-17, CK, 2, 6, S);
    pEnemy(ctx, cx, cy + floatY * S,  0,-11, CK, 2, 5, S);
    pEnemy(ctx, cx, cy + floatY * S, -1, -6, CK, 2, 8, S);
    pEnemy(ctx, cx, cy + floatY * S,  0,  2, CK, 2, 6, S);
    pEnemy(ctx, cx, cy + floatY * S, -1,  8, CK, 2, 8, S);
    ctx.restore();

    // Crack bloom glow
    ctx.save(); ctx.globalAlpha = gA * (0.20 + lightP * 0.28);
    pEnemy(ctx, cx, cy + floatY * S, -3,-26, CK, 6, 42, S);
    ctx.restore();

    ctx.restore();
}

/**
 * --- CURSED ANCESTOR (cursed_ancestor) ---
 * 원혼: Ancient lineage patriarch warped by grudge — ornate robes riddled
 * with living curse-runes; weakens any shrine it passes near.
 */
function drawCursedAncestor(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.003) + 1) / 2;
    const floatY = Math.sin(now * 0.002) * 4;
    const runeT  = now * 0.005;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO   = '#000000';
    const C1   = '#080414'; const C2 = '#10083A'; const C3 = '#1C1060';
    const C4   = '#281880'; const C5 = '#3420A0'; const HL = '#4030C0';
    const ROBE = '#0C0828';
    const R1   = '#180040'; const R2 = '#220058'; const R3 = '#300070';
    const RU   = `rgba(255,100,200,${0.40 + pulse * 0.55})`; // rune glow
    const RU2  = `rgba(200,60,255,${0.30 + pulse * 0.45})`; // secondary rune
    const EG   = `rgba(220,50,255,${0.72 + pulse * 0.28})`;
    const gA   = 0.90 + pulse * 0.08;

    ctx.save(); ctx.globalAlpha = gA;

    // ── POINTED HAT (tall, slightly curved) ───────────────────
    p( 0,-32,CO, 2, 1); p(-1,-31,CO, 4, 1); p(-2,-30,CO, 6, 1);
    p(-3,-29,CO, 8, 2); p(-1,-31,C1, 3, 1); p(-2,-30,C2, 5, 1); p(-2,-29,C3, 6, 2);
    p(-4,-27,CO, 9, 3); p(-3,-27,C4, 7, 2);
    p(-5,-24,CO,10, 1); p(-6,-23,CO,12, 2); p(-5,-23,C4,10, 2); // brim shadow
    p(-6,-21,CO,12, 2); p(-5,-21,C5,10, 2); // lower brim
    // Hat rune line
    ctx.save(); ctx.globalAlpha *= (0.55 + pulse * 0.40);
    p(-3,-28,RU, 6, 1);
    ctx.restore();

    // ── HEAD ──────────────────────────────────────────────────
    p(-5,-19,CO, 10, 1); p(-6,-18,CO, 1,10); p( 5,-18,CO, 1,10); p(-6,-8,CO,12, 1);
    // Head fills — 5 depth layers
    p(-5,-18,C2,10, 2); p(-5,-16,C3,10, 8);
    p(-4,-17,C4, 8, 7); p(-3,-16,C5, 6, 5); p(-2,-15,HL, 4, 3);
    p(-4,-18,HL, 3, 3); // specular

    // ── HOLLOW ANCIENT VOID EYE SOCKETS (deep + magenta-fire pinpoint)
    p(-5,-16,CO,4,3); p( 1,-16,CO,4,3);
    p(-4,-15,'#000005',2,2); p( 2,-15,'#000005',2,2);
    p(-4,-15,EG,1,1); p( 2,-15,EG,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy + floatY * S,-4,-15,'#FFCCFF',1,1,S);
    pEnemy(ctx, cx, cy + floatY * S, 2,-15,'#FFCCFF',1,1,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.55;
    p(-5,-17,EG,5,4); p( 1,-17,EG,5,4);
    ctx.restore();

    // Aged wrinkle brow lines
    p(-4,-17,CO,3,1); p( 1,-17,CO,3,1);

    // ── SILENT-SCREAM VOID MOUTH (gaping w/ pale-bone teeth)
    p(-3,-11,CO,6,3); p(-2,-10,'#000005',4,2);
    p(-2,-10,'#D8C0A8',1,1); p( 0,-10,'#D8C0A8',1,1); p( 2,-10,'#D8C0A8',1,1);
    // Wispy ancient beard
    p(-3,-7,C2,5,4); p(-2,-6,C3,3,3); p(-2,-3,C2,3,2);

    // ── ORNATE ROBE BODY ──────────────────────────────────────
    p(-11,-7,CO,22, 1);
    p(-13,-6,CO, 1,22); p(12,-6,CO, 1,22); p(-13,16,CO,26, 1);
    p(-12,-6,ROBE,24,22); p(-10,-5,R1,20,20); p(-8,-4,R2,16,18); p(-6,-3,R3,12,16);
    // Robe specular
    p(-10,-6,HL, 4, 5);

    // ── CURSE RUNES (animated, 5 runes) ───────────────────────
    ctx.save();
    const runes = [
        { ox:-8, oy:-1 }, { ox: 3, oy: 1 }, { ox:-5, oy: 7 },
        { ox: 6, oy:-4 }, { ox:-9, oy: 11 },
    ];
    runes.forEach((r, i) => {
        const ra = (0.38 + pulse * 0.50) * (0.75 + 0.25 * Math.sin(runeT + i * 1.3));
        ctx.globalAlpha = gA * ra;
        pEnemy(ctx, cx, cy + floatY * S, r.ox,   r.oy,   RU,  3, 3, S);
        pEnemy(ctx, cx, cy + floatY * S, r.ox+1, r.oy-1, RU2, 1, 1, S);
        // H-cross rune shape
        pEnemy(ctx, cx, cy + floatY * S, r.ox-1, r.oy+1, RU,  5, 1, S);
        pEnemy(ctx, cx, cy + floatY * S, r.ox+1, r.oy,   RU,  1, 3, S);
    });
    ctx.restore();

    // ── OUTSTRETCHED SLEEVES ──────────────────────────────────
    p(-18,-3,CO, 6, 5); p(-17,-2,ROBE, 4, 3); p(-16,-1,R1, 3, 2);
    p( 12,-3,CO, 6, 5); p( 13,-2,ROBE, 4, 3); p( 14,-1,R1, 3, 2);
    // Sleeve rune trim
    ctx.save(); ctx.globalAlpha *= (0.45 + pulse * 0.40);
    p(-17,-3,RU, 5, 1); p( 12,-3,RU, 5, 1);
    ctx.restore();

    // ── ROBE FRINGE BOTTOM (scalloped) ────────────────────────
    p(-12,17,CO, 4, 4); p(-7,17,CO, 4, 4); p(-2,17,CO, 4, 4);
    p(  3,17,CO, 4, 4); p( 8,17,CO, 4, 4);
    p(-11,18,ROBE, 2, 3); p(-6,18,ROBE, 2, 3); p(-1,18,ROBE, 2, 3);
    p(  4,18,ROBE, 2, 3); p( 9,18,ROBE, 2, 3);

    // ── AURA STREAKS (rune energy bleeding out) ────────────────
    ctx.save(); ctx.globalAlpha *= (0.14 + pulse * 0.16);
    p(-14,-7, RU, 2,24); p(12,-7, RU2, 2,24);
    ctx.restore();

    ctx.restore();
}

// ══════════════════════════════════════════════════════════════════════
// 망령 (Wraith) — 2 New Types
// ══════════════════════════════════════════════════════════════════════

// ── Window Exports ────────────────────────────────────────────────────────
window.drawWhisperingSpirit = drawWhisperingSpirit;
window.drawMist = drawMist;
window.drawMemory = drawMemory;
window.drawShade = drawShade;
window.drawIronWraith = drawIronWraith;
window.drawShadowRunner = drawShadowRunner;
window.drawGreedyPoltergeist = drawGreedyPoltergeist;
window.drawLightspeedHerald = drawLightspeedHerald;
window.drawEchoSoul = drawEchoSoul;
window.drawHungryGhost = drawHungryGhost;
window.drawAggrieved = drawAggrieved;
window.drawSplitSoul = drawSplitSoul;
window.drawCursedAncestor = drawCursedAncestor;
