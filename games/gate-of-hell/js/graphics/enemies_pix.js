/* enemies_pix.js - Pixel Art Drawing Functions for Enemies */

/**
 * Pixel drawing helper for consistent enemy rendering.
 */
function pEnemy(ctx, cx, cy, ox, oy, color, w=1, h=1, S=2.0) {
    ctx.fillStyle = color;
    ctx.fillRect(
        Math.round(cx + (ox * S)), 
        Math.round(cy + (oy * S)), 
        Math.round(w * S), 
        Math.round(h * S)
    );
}

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
    pEnemy(ctx, cx, cy, -22,-32, CK, 44, 64, S);
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
    pEnemy(ctx, cx, cy+floatY,-16,-26,GD2,32,40,S);
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
 * --- DEFILED APPRENTICE (defiled_apprentice) ---
 * 타락한 수련생: A sorcery student who touched forbidden arts — dark blue robes
 * now crawling with blood-red corruption veins; hunched under the forbidden tome.
 */
function drawDefiledApprentice(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.005) + 1) / 2;
    const floatY = Math.sin(now * 0.003) * 2;
    const pageT  = now * 0.0014;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO='#000';
    const R1='#050510', R2='#0A0A22', R3='#10103A', R4='#181855', HL='#2020AA', HV='#4040C8';
    const PA='#C8B89A', PAH='#E8D8B8';                                             // corrupted parchment
    const RD='#4A0008', RDH='#7A0010';                                             // dark dried-blood rune
    const CR1 = `rgba(180,0,0,${0.35+pulse*0.45})`;                                // corruption veins
    const CR2 = `rgba(255,30,0,${0.20+pulse*0.35})`;
    const EG  = `rgba(200,0,255,${0.75+pulse*0.25})`;
    const EGH = `rgba(255,180,255,0.9)`;
    const TM  = `rgba(80,0,180,${0.50+pulse*0.40})`;
    const TMH = `rgba(180,80,255,${0.65+pulse*0.30})`;
    const AU  = `rgba(80,0,120,${0.10+pulse*0.12})`;
    const VOID= '#000005';

    // ── corruption aura
    ctx.save(); ctx.globalAlpha = 0.22 + pulse * 0.20;
    p(-16,-32,AU,32,52);
    ctx.restore();

    // ── 4 ORBITING CORRUPTED SCRIPTURE PAGES (rotating, blood-stained)
    for (let i = 0; i < 4; i++) {
        const a   = pageT + i * (Math.PI / 2);
        const pgX = Math.cos(a) * 18;
        const pgY = Math.sin(a) * 11 - 6;
        p(pgX-2, pgY-3, CO, 5, 7);
        p(pgX-1, pgY-2, PA, 3, 5);
        p(pgX-1, pgY-2, PAH, 3, 1);                                               // top highlight
        // Blood-script lines
        p(pgX-1, pgY,   RD, 3, 1);
        p(pgX-1, pgY+2, RD, 2, 1);
        // Page-edge tatter
        p(pgX+2, pgY+3, CO, 1, 1);
    }

    // ── HOOD (top-highlighted)
    p(-3,-28,CO,6,2); p(-5,-26,CO,10,2); p(-6,-24,CO,12,1);
    p(-3,-27,R1,5,2); p(-5,-25,R2,10,2); p(-6,-23,R3,11,1);
    p(-6,-22,CO,1,12); p( 5,-22,CO,1,12); p(-6,-10,CO,12,1);
    p(-5,-22,R3,10,12); p(-3,-21,R4,6,10); p(-1,-20,HL,2,8);
    p(-5,-22,HV,10,1);                                                            // top highlight

    // ── FACELESS HOLLOW VOID (no face — only deep void w/ 2 socket pinpoints)
    p(-5,-20,VOID,10,9);
    // Tiny glowing purple-fire pinpoints (NOT eyes — just void embers)
    p(-3,-17,CO,2,2); p( 2,-17,CO,2,2);
    p(-3,-17,EG,1,1); p( 3,-17,EG,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx,cx,cy + floatY * S,-3,-17,EGH,1,1,S);
    pEnemy(ctx,cx,cy + floatY * S, 3,-17,EGH,1,1,S);
    ctx.restore();
    // Outer eye-pit aura
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.25;
    pEnemy(ctx,cx,cy + floatY * S,-5,-19,EG,4,5,S);
    pEnemy(ctx,cx,cy + floatY * S, 1,-19,EG,4,5,S);
    ctx.restore();
    // Bleeding-rune brand on forehead (blood-cursed)
    p(-1,-22,RD,2,2); p(-1,-22,RDH,2,1);

    // ── HUNCHED BODY
    p(-7,-9,CO,2,2); p( 5,-9,CO,2,2);
    p(-8,-7,CO,1,16); p( 7,-7,CO,1,16); p(-8,9,CO,16,1);
    p(-7,-7,R2,14,16); p(-5,-6,R3,10,14); p(-3,-5,R4,6,12); p(-1,-4,HL,2,10);
    p(-7,-7,HV,14,1);                                                             // top highlight

    // ── CORRUPTION VEIN LINES (more, branching)
    ctx.save(); ctx.globalAlpha = 0.65 + pulse * 0.35;
    p(-6,-5,CR1,2,11); p( 3,-3,CR1,2,9);
    p(-4,-7,CR2,1,9); p( 1,-6,CR2,1,8);
    p(-5,2,CR1,1,5); p( 4,3,CR1,1,4);                                             // lower branches
    ctx.restore();

    // ── CORRUPTED SCRIPTURE PAGE EMBEDDED IN CHEST (blood-rune)
    p(-3,-3,CO,6,5); p(-2,-2,PA,4,3); p(-2,-2,PAH,4,1);
    p(-1,-1,RD,2,1); p(-1, 1,RD,2,1);                                             // blood-script
    ctx.save(); ctx.globalAlpha = 0.60 + pulse * 0.35;
    pEnemy(ctx,cx,cy + floatY * S,-3,-3,RDH,6,5,S);
    ctx.restore();

    // ── FORBIDDEN TOME (held at waist, glowing curse)
    p(-5,4,CO,10,8);
    p(-4,5,VOID,8,6);
    p(-4,5,R1,8,1);                                                               // tome spine
    ctx.save(); ctx.globalAlpha = 0.60 + pulse * 0.40;
    pEnemy(ctx,cx,cy + floatY * S,-4,5,TM,8,6,S);
    ctx.restore();
    // Tome curse-symbol (bleeding pentagram)
    p(-2,6,CR1,4,1); p(-1,7,CR2,2,1); p(-2,8,CR1,4,1);                            // crossbars
    p(-1,5,CR2,2,4);                                                              // vertical
    ctx.save(); ctx.globalAlpha = 0.75 + pulse * 0.20;
    pEnemy(ctx,cx,cy + floatY * S,-2,5,TMH,4,7,S);
    ctx.restore();
    // Tome gold corners
    p(-5,4,CR1,1,1); p( 4,4,CR1,1,1); p(-5,11,CR1,1,1); p( 4,11,CR1,1,1);

    // ── ROBES HEM + RAGGED FEET
    p(-6,10,CO,4,4); p(-2,10,CO,4,4); p( 2,10,CO,4,4);
    p(-5,11,R2,2,3); p(-1,11,R2,2,3); p( 3,11,R2,2,3);

    // ── DRIPPING CURSE SHADOW BELOW (3 drips)
    const dripA = (now % 1600) / 1600;
    ctx.save(); ctx.globalAlpha = 0.55;
    pEnemy(ctx,cx,cy + floatY * S,-4,14+dripA*4,RD,1,2,S);
    pEnemy(ctx,cx,cy + floatY * S, 3,14+dripA*5,RD,1,2,S);
    pEnemy(ctx,cx,cy + floatY * S, 0,16+dripA*3,RD,1,2,S);
    ctx.restore();
}

/**
 * --- MIMIC WRAITH (mimic) ---
 * 미믹 망령: Takes the form of a treasure chest to lure greed — then the lid
 * snaps open revealing hollow spectral eyes and hissing spirit legs.
 */
function drawMimicWraith(cx, cy, enemy) {
    const now     = Date.now();
    const S       = 2.0;
    const pulse   = (Math.sin(now * 0.004) + 1) / 2;
    const lidAng  = Math.sin(now * 0.006) * 0.3 + 0.5;
    const bounceY = Math.sin(now * 0.008) * 3;
    const handR   = Math.sin(now * 0.005) * 2;
    const chainSw = Math.sin(now * 0.003) * 1;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + bounceY * S, ox, oy, col, w, h, S);

    const CO='#000';
    const W1='#1C1000', W2='#2E1A00', W3='#422800', W4='#5A3800', HL='#7A5010', WV='#A0701A';
    const MT='#3A2000', MG='#604000', MGH='#806020';
    const BN='#D8D0C0', BNH='#F0E8D8';
    const EG  = `rgba(160,80,255,${0.70+pulse*0.30})`;
    const EGH = `rgba(220,180,255,0.95)`;
    const LG  = `rgba(100,0,200,${0.35+pulse*0.40})`;
    const LGH = `rgba(180,80,255,${0.65+pulse*0.30})`;
    const VOID='#000005';
    const RD  = '#4A0008';

    ctx.save(); ctx.globalAlpha = 0.90 + pulse * 0.08;

    // ── BROKEN HANGING CHAIN (off-side, swaying)
    for (let i = 0; i < 4; i++) {
        const cx2 = -14 + chainSw - i;
        const cy2 = -12 + i * 5;
        p(cx2, cy2, CO, 3, 3);
        p(cx2+1, cy2+1, MG, 1, 1);
    }
    p(-14+chainSw-4, 7, CO, 2, 2);

    // ── CHEST LID (tilted open, with metal hinges + spike trim)
    const lidH = Math.round(5 + lidAng * 3);
    p(-11,-12,CO,22,1); p(-12,-11,CO,1,lidH); p(11,-11,CO,1,lidH);
    p(-12,-11,W1,22,lidH); p(-10,-10,W2,20,lidH-2); p(-8,-9,W3,16,lidH-3);
    p(-10,-11,WV,22,1);                                                            // top highlight
    p(-2,-11,MG,4,2); p(-1,-10,MGH,2,1);                                           // lock plate
    p(-9,-12,CO,2,2); p(-2,-12,CO,2,2); p( 5,-12,CO,2,2);
    p(-9,-12,MG,2,1); p(-2,-12,MG,2,1); p( 5,-12,MG,2,1);                          // 3 lid spikes

    // ── DEEP VOID CAVITY INSIDE CHEST (gaping)
    p(-10,-8,VOID,20,8);
    // Pulsing void-leak from cavity
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.35;
    p(-9,-7,LG,18,6);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.40 + pulse * 0.30;
    p(-7,-10,LGH,14,4);                                                            // rising glow above lid
    ctx.restore();

    // ── 4 GHOST EYES INSIDE VOID (multi-pair staring out)
    p(-9,-5,CO,4,3); p( 5,-5,CO,4,3);                                              // outer sockets
    p(-8,-4,EG,2,1); p( 6,-4,EG,2,1);
    p(-3,-6,CO,3,3); p( 0,-6,CO,3,3);                                              // inner sockets
    p(-3,-5,EG,3,1); p( 0,-5,EG,3,1);
    p(-7,-4,EGH,1,1); p( 7,-4,EGH,1,1); p(-2,-5,EGH,1,1); p( 1,-5,EGH,1,1);        // bright pupils
    ctx.save(); ctx.globalAlpha = 0.85 + pulse * 0.15;
    pEnemy(ctx,cx,cy+bounceY*S,-7,-4,'#FFFFFF',1,1,S);
    pEnemy(ctx,cx,cy+bounceY*S, 7,-4,'#FFFFFF',1,1,S);
    ctx.restore();

    // ── GRASPING SPECTRAL HAND REACHING OUT FROM CAVITY (pale skeletal)
    p(-2+handR,-14,CO,4,8); p(-1+handR,-13,BN,2,6); p(-1+handR,-13,BNH,2,1);       // forearm
    p(-4+handR,-18,CO,8,4);                                                        // hand
    p(-3+handR,-17,BN,2,3); p( 0+handR,-17,BN,2,3); p( 3+handR,-17,BN,2,3);        // 3 main fingers
    p(-4+handR,-16,BN,1,2); p( 4+handR,-16,BN,1,2);                                // outer fingers
    p(-3+handR,-20,CO,2,2); p( 0+handR,-20,CO,2,2); p( 3+handR,-20,CO,2,2);        // clawed tips
    ctx.save(); ctx.globalAlpha = 0.55;
    pEnemy(ctx,cx,cy+bounceY*S,-4+handR,-20,LG,8,5,S);
    ctx.restore();

    // ── CHEST BODY (worn wood, top-highlighted)
    p(-12,-4,CO,24,1); p(-13,-3,CO,1,14); p(12,-3,CO,1,14); p(-13,11,CO,26,1);
    p(-12,-3,W2,24,14); p(-10,-2,W3,20,12); p(-8,-1,W4,16,10); p(-6,0,HL,8,8);
    p(-12,-3,WV,24,1);                                                             // top highlight
    p(-10,2,MT,4,2); p( 6,2,MT,4,2);                                               // side bands
    p(-2,0,MG,4,5); p(-1,1,MGH,2,3);                                               // central lock
    // Dried-blood stain (someone died here)
    ctx.save(); ctx.globalAlpha = 0.50;
    pEnemy(ctx,cx,cy+bounceY*S, 4,4,RD,3,4,S);
    ctx.restore();
    // Wood-grain claw marks (3 across chest)
    p(-8,5,CO,1,6); p(-5,7,CO,1,4); p( 6,4,CO,1,7);

    // ── SPECTRAL LEGS (more, longer, drifting)
    p(-9,12,W1,3,7); p(-9,19,CO,2,4); p(-9,23,CO,1,2);
    p(-3,12,W2,4,8); p(-2,20,CO,2,4); p(-1,24,CO,1,3);
    p( 5,12,W1,3,7); p( 5,19,CO,2,4); p( 5,23,CO,1,2);

    // ── METAL CORNER BRACKETS
    p(-13,-3,MG,2,2); p(11,-3,MG,2,2);
    p(-13,10,MG,2,2); p(11,10,MG,2,2);

    ctx.restore();
}

/**
 * --- DIMENSION WRAITH (dimension) ---
 * 차원 이동 망령: Hermit from between dimensions — its body phases in and out
 * of reality; cyan rift tears surround it, body displaces with glitch stripes.
 */
function drawDimensionWraith(cx, cy, enemy) {
    const now     = Date.now();
    const S       = 2.0;
    const pulse   = (Math.sin(now * 0.004) + 1) / 2;
    const phase   = (Math.sin(now * 0.0015) + 1) / 2;
    const glitchX = Math.random() < 0.08 ? Math.round((Math.random()-0.5) * 12) : 0;
    const glitchA = Math.random() < 0.05;
    const mirrorX = Math.random() < 0.15;
    const rGo = (ox, oy, col, w, h) => pEnemy(ctx, cx + glitchX * S, cy, ox, oy, col, w, h, S);

    const CO='#000';
    const D1='#020A18', D2='#040E22', D3='#06143A', D4='#0A1E58', HL='#1030A0', HV='#2050D0';
    const RF  = `rgba(0,200,255,${0.50+pulse*0.40})`;
    const RF2 = `rgba(80,240,255,${0.30+pulse*0.30})`;
    const RF3 = `rgba(200,250,255,${0.85+pulse*0.15})`;
    const EG  = `rgba(0,240,255,${0.80+pulse*0.20})`;
    const EGH = `rgba(200,250,255,0.95)`;
    const CRACK = `rgba(0,255,255,${0.55+pulse*0.35})`;
    const VOID= '#000005';
    const gA  = glitchA ? 0.15 + Math.random() * 0.30 : 0.30 + phase * 0.60;

    // ── MIRROR-DOUBLE FLICKER (rare, jarring afterimage shifted)
    if (mirrorX) {
        ctx.save(); ctx.globalAlpha = 0.30 + pulse * 0.15;
        pEnemy(ctx, cx + glitchX * S + 6 * S, cy, -5,-20, D3, 10, 22, S);
        pEnemy(ctx, cx + glitchX * S - 6 * S, cy, -5,-20, D2, 10, 22, S);
        ctx.restore();
    }

    ctx.save(); ctx.globalAlpha = gA;

    // ── DIMENSIONAL RIFT TEARS (more, longer, surrounding body)
    ctx.save(); ctx.globalAlpha *= (0.65 + pulse * 0.30);
    rGo(-18,-22, RF,  3, 18);                                                     // L tall rift
    rGo( 15,-18, RF,  3, 16);                                                     // R tall rift
    rGo( -4,-28, RF,  2,  8);                                                     // top rift
    rGo(  4, 14, RF2, 2,  8);                                                     // bottom rift
    rGo(-14,  4, RF2, 2,  6);                                                     // L low rift
    rGo( 12,  6, RF2, 2,  6);                                                     // R low rift
    ctx.restore();
    // Bright rift centers (white-cyan)
    ctx.save(); ctx.globalAlpha = 0.85 + pulse * 0.15;
    rGo(-17,-18, RF3, 1, 10);
    rGo( 16,-14, RF3, 1,  8);
    ctx.restore();

    // ── BODY OUTLINE
    rGo(-3,-23,CO,6,2);
    rGo(-5,-21,CO,10,1);
    rGo(-6,-20,CO,1,22);
    rGo( 5,-20,CO,1,22);
    rGo(-6,2,CO,12,1);

    // ── BODY FILL (translucent being, top-highlighted)
    rGo(-2,-22,D1,4,2);
    rGo(-5,-20,D2,10,22);
    rGo(-4,-19,D3,8,20);
    rGo(-3,-18,D4,6,18);
    rGo(-1,-17,HL,2,16);
    rGo(-5,-20,HV,10,1);                                                          // top highlight

    // ── FACE DISSOLVING INTO RIFT CRACKS (across face/body)
    ctx.save(); ctx.globalAlpha = 0.60 + pulse * 0.30;
    rGo(-4,-13,CRACK,1,6);                                                        // L face crack vertical
    rGo( 3,-15,CRACK,1,8);                                                        // R face crack
    rGo(-5,-10,CRACK,5,1);                                                        // horizontal cheek crack
    rGo(-2,-4,CRACK,1,4);                                                         // chest dissolve
    rGo(-3,1,CRACK,5,1);                                                          // lower body crack
    ctx.restore();

    // ── GLITCH STRIPES (scan-line corruption when shifted)
    if (glitchX !== 0) {
        ctx.save(); ctx.globalAlpha *= 0.60;
        rGo(-7,-14, RF2, 14, 2);
        rGo(-7, -6, RF2, 14, 2);
        rGo(-7,  0, RF2, 14, 1);
        ctx.restore();
    }

    // ── DEEPER HOLLOW EYE SOCKETS (void w/ cyan pinpoint)
    rGo(-5,-17,CO,4,4);
    rGo( 1,-17,CO,4,4);
    rGo(-4,-16,VOID,2,2);
    rGo( 2,-16,VOID,2,2);
    rGo(-4,-16,EG,1,1);
    rGo( 3,-16,EG,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    rGo(-4,-16,EGH,1,1);
    rGo( 3,-16,EGH,1,1);
    ctx.restore();
    // Outer eye-pit aura
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    rGo(-6,-18,EG,5,5);
    rGo( 0,-18,EG,5,5);
    ctx.restore();

    // ── SILENT-SCREAM MOUTH (gaping void)
    rGo(-2,-10,CO,4,3);
    rGo(-1,-9,VOID,2,1);

    // ── TAILS (longer, more streams)
    rGo(-5,3,D1,3,7);
    rGo( 0,3,D2,3,9);
    rGo( 4,3,D1,2,6);
    rGo(-2,10,D2,1,4);                                                            // extra wisp tip

    ctx.restore();
}

/**
 * --- DECEIVER SIREN (deceiver) ---
 * 절망의 세이렌: Master of lies who never showed their face — a graceful veiled
 * silhouette hiding a sunken hollow beneath; evades and retreats.
 */
function drawDeceiverSiren(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.004) + 1) / 2;
    const floatY = Math.sin(now * 0.003) * 5;
    const veilW  = (Math.sin(now * 0.006) + 1) / 2;
    const hairF  = Math.sin(now * 0.0025) * 1;
    const revealT= (Math.sin(now * 0.0012) + 1) / 2;                              // veil reveals horror
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO='#000';
    const V1='#160820', V2='#240E38', V3='#361458', V4='#4A1C78', HL='#6028A0', HV='#7838BC';
    const VS='#0A0418';
    const VL  = `rgba(200,160,255,${0.20+veilW*0.25})`;
    const VLH = `rgba(240,200,255,${0.45+veilW*0.30})`;
    const EG  = `rgba(240,60,180,${0.80+pulse*0.20})`;
    const EGH = `rgba(255,180,220,0.95)`;
    const CR  = `rgba(180,0,80,${0.45+pulse*0.45})`;
    const CRH = `rgba(255,40,120,${0.55+pulse*0.35})`;
    const BN  = '#D8C8D0';                                                         // pale bone tone (skin under veil)
    const VOID= '#000005';
    const HR  = '#0A0014';                                                         // black hair
    const gA  = 0.92 + pulse * 0.08;

    // ── deception aura (purple shimmer)
    ctx.save(); ctx.globalAlpha = 0.20 + pulse * 0.20;
    pEnemy(ctx, cx, cy+floatY*S,-18,-32,V4,36,52,S);
    ctx.restore();

    ctx.save(); ctx.globalAlpha = gA;

    // ── DECORATIVE HAIR / CROWN (wider, more tendrils flowing)
    p(-4,-28,CO,8,2); p(-6,-26,CO,12,2); p(-3,-27,V3,6,2); p(-5,-25,V4,10,1);
    p(-5,-25,HV,10,1);                                                            // top highlight
    // Long flowing hair tendrils (more, swaying)
    p(-9+hairF,-24,CO,2,7); p(-8+hairF,-22,HR,1,6);                               // L outer tendril
    p(-10+hairF,-20,CO,1,4); p(-10+hairF,-17,HR,1,3);                             // L wisp
    p( 7-hairF,-24,CO,2,7); p( 8-hairF,-22,HR,1,6);                               // R outer tendril
    p( 9-hairF,-20,CO,1,4); p( 9-hairF,-17,HR,1,3);                               // R wisp
    p(-6+hairF,-30,CO,2,3); p(-5+hairF,-29,HR,1,2);                               // top hair tuft L
    p( 4-hairF,-30,CO,2,3); p( 5-hairF,-29,HR,1,2);                               // top hair tuft R

    // ── HEAD (top-highlighted)
    p(-5,-24,CO,10,1); p(-6,-23,CO,1,14); p( 5,-23,CO,1,14); p(-6,-9,CO,12,1);
    p(-5,-23,V2,10,14); p(-4,-22,V3,8,12); p(-2,-21,V4,4,10); p(-1,-20,HL,2,8);
    p(-5,-23,HV,10,1);                                                            // top highlight

    // ── HORROR FACE UNDERNEATH VEIL (pale corpse bone tone — visible first)
    p(-5,-19,VOID,10,8);                                                          // deep void recess
    p(-4,-18,BN,8,6);                                                             // pale skin
    // HOLLOW RINGED EYE SOCKETS (deep pits w/ horror-pink pinpoint)
    p(-4,-17,CO,4,4); p( 1,-17,CO,4,4);
    p(-3,-16,VOID,2,2); p( 2,-16,VOID,2,2);
    p(-3,-16,EG,1,1); p( 2,-16,EG,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy+floatY*S,-3,-16,EGH,1,1,S);
    pEnemy(ctx, cx, cy+floatY*S, 2,-16,EGH,1,1,S);
    ctx.restore();
    // Outer eye-pit corruption aura
    ctx.save(); ctx.globalAlpha = 0.50 + pulse * 0.30;
    pEnemy(ctx, cx, cy+floatY*S,-5,-18,EG,5,5,S);
    pEnemy(ctx, cx, cy+floatY*S, 1,-18,EG,5,5,S);
    ctx.restore();
    // SILENT-SCREAM MOUTH w/ bared bone teeth
    p(-3,-12,CO,6,4); p(-2,-11,VOID,4,2);
    p(-2,-11,BN,1,1); p( 0,-11,BN,1,1); p( 2,-11,BN,1,1);                         // 3 bone teeth

    // ── VEIL (flowing translucent fabric, reveals horror beneath)
    // Veil alpha varies — sometimes hides more, sometimes less
    ctx.save(); ctx.globalAlpha = gA * (0.55 - revealT * 0.25);                   // less coverage when horror reveals
    p(-6,-17,VS,12,8); p(-5,-16,VS,10,7);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = (0.35 + veilW * 0.30) * (0.55 + revealT * 0.30);
    p(-5,-16,VL,10,7); p(-4,-15,VLH,8,5);
    ctx.restore();
    // Veil edge gold trim (worn ornamental)
    p(-7,-9,V4,14,1); p(-6,-8,HV,12,1);

    // ── CORRUPTION SEEPING THROUGH VEIL (more, animated)
    ctx.save(); ctx.globalAlpha = 0.50 + pulse * 0.35;
    p(-5,-13,CR,10,1); p(-4,-11,CRH,8,1);                                         // horizontal corruption bands
    p(-3,-9,CR,1,3); p( 1,-9,CR,1,3);                                             // vertical drips
    ctx.restore();

    // ── ELEGANT ROBES (top-highlighted, corruption pattern)
    p(-8,-8,CO,2,2); p( 6,-8,CO,2,2);
    p(-9,-6,CO,1,18); p( 8,-6,CO,1,18); p(-9,12,CO,18,1);
    p(-8,-6,V1,16,18); p(-6,-5,V2,12,16); p(-4,-4,V3,8,14); p(-2,-3,V4,4,12);
    p(-8,-6,HV,16,1);                                                             // top highlight
    p(-7,-6,HL,3,5);
    // Corruption pattern on robe (more visible)
    ctx.save(); ctx.globalAlpha = 0.45 + pulse * 0.30;
    p(-6,-3,CR,2,12); p( 3,-1,CR,2,10); p(-2,2,CR,1,6);
    ctx.restore();

    // ── GRACEFUL ARMS (longer, drifting)
    p(-14,-4,CO,6,3); p(-13,-3,V2,4,2); p(-13,-3,V3,4,1);
    p( 8,-4,CO,6,3); p( 9,-3,V2,4,2); p( 9,-3,V3,4,1);
    // Bony reaching fingers
    p(-16,-3,V1,1,4); p(-15,-3,V2,1,3);
    p( 14,-3,V1,1,4); p( 14,-3,V2,1,3);

    // ── FLOATING HEM (longer, more tatters)
    p(-8,13,V1,3,6); p(-8,19,CO,2,4); p(-8,23,CO,1,2);
    p(-2,13,V2,4,7); p(-1,20,V1,2,3); p( 0,23,CO,1,2);
    p( 4,13,V1,3,6); p( 5,19,CO,2,4); p( 5,23,CO,1,2);

    ctx.restore();
}

/**
 * --- CURSED VAJRA (cursed_vajra) ---
 * 타락한 승려: A corrupt monk whose iron mace now crushes the living —
 * massive frame in tattered robes, corrupted prayer beads, vajra crackling with dark energy.
 */
function drawCursedVajra(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.004) + 1) / 2;
    const maceSwing = Math.sin(now * 0.003) * 6; // mace tip swing
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, col, w, h, S);

    const CO  = '#000000';
    const M1  = '#120808'; const M2 = '#201010'; const M3 = '#301818'; const M4 = '#422020'; const HL = '#663030';
    const ROBE= '#0C0010'; const RB1= '#140018'; const RB2= '#1C0022';
    const IR  = '#1A1A1A'; const IR2 = '#2E2E2E'; const IR3 = '#444444'; // iron
    const CK  = `rgba(150,0,255,${0.45+pulse*0.45})`; // dark energy crack
    const BD  = `rgba(200,0,0,${0.40+pulse*0.40})`;  // bead glow
    const EG  = `rgba(255,80,0,${0.70+pulse*0.30})`;
    const gA  = 0.95;

    ctx.save(); ctx.globalAlpha = gA;

    // ── VAJRA / MACE (tall weapon, right side) ────────────────
    const maceOY = Math.round(maceSwing);
    // Shaft
    p(10,-32+maceOY,CO, 4,50+Math.abs(maceOY)); p(11,-31+maceOY,IR, 2,48+Math.abs(maceOY));
    // Spiked head
    p( 7,-40+maceOY,CO, 10, 8); p( 8,-39+maceOY,IR2, 8, 6); p(9,-38+maceOY,IR3, 6, 4);
    // Crown spikes
    p( 8,-42+maceOY,CO, 2, 4); p(10,-42+maceOY,CO, 2, 4); p(12,-42+maceOY,CO, 2, 4);
    p( 9,-41+maceOY,IR3, 1,3); p(11,-41+maceOY,IR3, 1,3);
    ctx.save(); ctx.globalAlpha *= (0.55+pulse*0.40);
    p( 8,-40+maceOY,CK,10, 8);
    ctx.restore();

    // ── MONK HEAD ─────────────────────────────────────────────
    p(-8,-28,CO,16, 1); p(-9,-27,CO,18, 1);
    p(-10,-26,CO, 1,15); p( 9,-26,CO, 1,15); p(-9,-11,CO,18, 1);
    p(-8,-27,M1,16, 2); p(-9,-26,M2,18,15); p(-7,-25,M3,14,13); p(-5,-24,M4,10,11); p(-3,-23,HL, 6, 9);
    p(-8,-26,HL, 3, 5); // specular

    // ── HOLLOW BURNING EYE SOCKETS (deep void + amber pinpoint)
    p(-8,-22,CO,6,5); p( 2,-22,CO,6,5);
    p(-7,-21,'#000005',4,3); p( 3,-21,'#000005',4,3);
    p(-6,-20,EG,2,1); p( 4,-20,EG,2,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy,-6,-20,'#FFCC80',1,1,S);
    pEnemy(ctx, cx, cy, 4,-20,'#FFCC80',1,1,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    p(-9,-23,EG,8,7); p( 1,-23,EG,8,7);
    ctx.restore();

    // Stern furrowed brow
    p(-8,-23,CO,5,2); p( 3,-23,CO,5,2);

    // Silent-scream void mouth w/ pale bone fangs
    p(-4,-15,CO,8,3); p(-3,-14,'#000005',6,1);
    p(-3,-14,'#D8C0A8',1,1); p(-1,-14,'#D8C0A8',1,1); p( 1,-14,'#D8C0A8',1,1);     // 3 fangs

    // Exposed pale bone wrist gaps (where chained-into-bone)
    ctx.save(); ctx.globalAlpha = 0.55;
    pEnemy(ctx, cx, cy, 9,-9,'#D8C0A8',2,1,S);                                    // wrist near mace
    ctx.restore();

    // ── MASSIVE BODY IN ROBES ─────────────────────────────────
    p(-12,-10,CO,24, 1); p(-14,-9,CO, 1,24); p(13,-9,CO, 1,24); p(-12,15,CO,24, 1);
    p(-13,-9,ROBE,26,24); p(-11,-8,RB1,22,22); p(-9,-7,RB2,18,20);
    p(-11,-9,HL, 4, 6); // chest specular

    // Robe corruption veins
    ctx.save(); ctx.globalAlpha *= (0.40+pulse*0.45);
    p(-10,-5,CK, 2,14); p( 5,-3,CK, 2,12); p(-4,-8,CK, 1,10);
    ctx.restore();

    // ── CORRUPTED PRAYER BEADS ────────────────────────────────
    const beadT = now * 0.002;
    ctx.save();
    for (let i = 0; i < 8; i++) {
        const ang = beadT + i * (Math.PI * 2 / 8);
        const bx = Math.round(Math.cos(ang) * 14);
        const by = Math.round(Math.sin(ang) * 6 + 2);
        ctx.globalAlpha = gA * (0.55 + 0.35 * Math.sin(beadT * 2 + i));
        pEnemy(ctx, cx, cy, bx, by, CO, 3, 3, S);
        pEnemy(ctx, cx, cy, bx+1, by+1, BD, 2, 2, S);
    }
    ctx.restore();

    // ── THICK LEGS ────────────────────────────────────────────
    p(-10,16,CO, 8,10); p( 2,16,CO, 8,10);
    p(-9,17,M2, 6, 8); p( 3,17,M2, 6, 8);
    p(-7,18,M3, 4, 6); p( 5,18,M3, 4, 6);

    ctx.restore();
}

/**
 * --- BETRAYER BLADE (betrayer_blade) ---
 * 그림자 배신자: The shadow of a blade that stabbed an ally — lean stealthy
 * assassin with twin daggers; cloaks periodically in shadow ink.
 */
function drawBetrayerBlade(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.006) + 1) / 2;
    const stealth = (Math.sin(now * 0.0012) + 1) / 2;
    const lean   = 4;
    const hairF  = Math.sin(now * 0.003) * 1;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, col, w, h, S);

    const CO='#000';
    const C1='#050510', C2='#0A0A1E', C3='#101030', C4='#181848', HL='#202060', HV='#3030A0';
    const DG='#1A1A1A', DG2='#383838', DG3='#585858', DGH='#888888';
    const HR='#0A000A', HRH='#1A001A';
    const BL  = `rgba(0,0,30,${0.40+stealth*0.55})`;
    const EG  = `rgba(100,0,255,${0.80+pulse*0.20})`;
    const EGH = `rgba(200,150,255,0.95)`;
    const VS  = `rgba(80,0,180,${0.55+pulse*0.30})`;                               // void slash trail
    const VOID= '#000005';
    const gA  = 0.94 - stealth * 0.45;

    // ── betrayal aura (low, dark purple)
    ctx.save(); ctx.globalAlpha = 0.16 + pulse * 0.15;
    pEnemy(ctx, cx, cy,-24,-30,VS,48,52,S);
    ctx.restore();

    ctx.save(); ctx.globalAlpha = gA;

    // ── SHADOW CLOAK (overlay when cloaking)
    ctx.save(); ctx.globalAlpha = stealth * 0.65;
    p(lean-14,-24,BL,28,42);
    ctx.restore();

    // ── DRIFTING BLACK HAIR BEHIND HOOD
    ctx.save(); ctx.globalAlpha = 0.65;
    p(lean-4+hairF,-22,CO,8,3); p(lean-3+hairF,-21,HR,6,2);
    p(lean-6+hairF,-24,CO,3,4); p(lean-5+hairF,-23,HRH,1,3);
    ctx.restore();
    // Trailing side hair
    p(lean-5,-14,HR,1,8); p(lean+4,-14,HR,1,8);

    // ── HEAD (hood, very narrow, top-highlighted)
    p(lean-2,-24,CO,4,1); p(lean-3,-23,CO,6,1);
    p(lean-4,-22,CO,1,12); p(lean+3,-22,CO,1,12); p(lean-4,-10,CO,8,1);
    p(lean-3,-23,C1,5,2); p(lean-3,-21,C2,6,11);
    p(lean-2,-21,C3,4,9); p(lean-1,-20,C4,2,7);
    p(lean-3,-21,HV,6,1);                                                         // top highlight

    // ── HOLLOW VOID EYE SOCKETS (deeper than slit — pair)
    p(lean-3,-18,CO,3,3); p(lean+1,-18,CO,3,3);
    p(lean-2,-17,VOID,2,1); p(lean+1,-17,VOID,2,1);
    p(lean-2,-17,EG,1,1); p(lean+2,-17,EG,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy, lean-2,-17, EGH, 1, 1, S);
    pEnemy(ctx, cx, cy, lean+2,-17, EGH, 1, 1, S);
    ctx.restore();
    // Outer eye aura
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    pEnemy(ctx, cx, cy, lean-4,-19, EG, 8, 4, S);
    ctx.restore();

    // ── SILENT-SCREAM VOID MOUTH (gaping)
    p(lean-2,-13,CO,4,2); p(lean-1,-12,VOID,2,1);

    // ── LEAN TORSO (top-highlighted)
    p(lean-3,-9,CO,6,1);
    p(lean-4,-8,CO,1,16); p(lean+3,-8,CO,1,16); p(lean-4,8,CO,8,1);
    p(lean-3,-8,C1,6,16); p(lean-2,-7,C2,4,14); p(lean-1,-6,C3,2,12);
    p(lean-3,-8,HV,6,1);                                                          // top highlight

    // ── TWIN DAGGERS (longer, void-edged)
    // Left dagger w/ void slash trail
    p(lean-12,-14,CO,2,16); p(lean-11,-14,DG,1,15); p(lean-10,-14,DGH,1,14);
    p(lean-13,-14,CO,3,2); p(lean-12,-13,DG3,2,1);
    p(lean-12,-22,CO,2,3); p(lean-11,-22,DGH,1,2);
    // Void edge L
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    pEnemy(ctx, cx, cy, lean-13,-22, VS, 3, 18, S);
    ctx.restore();
    // Right dagger w/ void slash trail
    p(lean+8,-14,CO,2,16); p(lean+9,-14,DG,1,15); p(lean+10,-14,DGH,1,14);
    p(lean+8,-14,CO,3,2); p(lean+9,-13,DG3,2,1);
    p(lean+8,-22,CO,2,3); p(lean+9,-22,DGH,1,2);
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    pEnemy(ctx, cx, cy, lean+8,-22, VS, 3, 18, S);
    ctx.restore();

    // ── ARMS (reaching forward, pale-bone wrist tips)
    p(lean-11,-12,CO,8,3); p(lean-10,-11,C2,6,2);
    p(lean+4,-12,CO,8,3); p(lean+5,-11,C2,6,2);
    p(lean-11,-9,'#D8C0C8',1,1); p(lean+10,-9,'#D8C0C8',1,1);                     // bone wrist hint

    // ── LEGS
    p(lean-3,9,CO,3,10); p(lean+1,9,CO,3,10);
    p(lean-2,10,C1,2,9); p(lean+2,10,C1,2,9);
    p(lean-3,19,CO,4,2); p(lean+1,19,CO,4,2);

    // ── DRIPPING SHADOW BELOW (3 dark drops)
    const dripA = (now % 1700) / 1700;
    ctx.save(); ctx.globalAlpha = 0.55;
    pEnemy(ctx, cx, cy, lean-4, 21+dripA*4, CO, 1, 2, S);
    pEnemy(ctx, cx, cy, lean+2, 21+dripA*5, CO, 1, 2, S);
    ctx.restore();

    ctx.restore();
}

/**
 * --- VOID PIERCER (void_piercer) ---
 * 배신한 궁수: Abandoned the bow and chose the abyss — a spectral archer
 * whose arrows are now made of pure void energy; 50% ranged evasion.
 */
function drawVoidPiercer(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.005) + 1) / 2;
    const drawAng = Math.sin(now * 0.004) * 0.4;
    const shroudF = Math.sin(now * 0.003) * 1;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, col, w, h, S);

    const CO='#000';
    const C1='#060A18', C2='#0C1228', C3='#141C3E', C4='#1E2858', HL='#2A3878', HV='#3A50A8';
    const VA  = `rgba(0,100,255,${0.65+pulse*0.30})`;
    const VA2 = `rgba(0,200,255,${0.45+pulse*0.30})`;
    const VAH = `rgba(180,240,255,0.95)`;
    const EG  = `rgba(60,160,255,${0.80+pulse*0.20})`;
    const EGH = `rgba(180,240,255,0.95)`;
    const BW  = '#1E1E1E';
    const BS  = `rgba(0,80,200,${0.65+pulse*0.35})`;
    const SHADE=`rgba(8,12,20,${0.50+pulse*0.20})`;                                // dark shroud
    const VOID= '#000005';
    const gA  = 0.92 + pulse * 0.06;

    // ── void aura
    ctx.save(); ctx.globalAlpha = 0.18 + pulse * 0.20;
    pEnemy(ctx, cx, cy,-26,-30,VA,52,52,S);
    ctx.restore();

    ctx.save(); ctx.globalAlpha = gA;

    // ── DRIFTING DARK SHROUD (long, behind body)
    ctx.save(); ctx.globalAlpha = 0.55;
    pEnemy(ctx, cx, cy, 4+shroudF, 8, SHADE, 8, 16, S);
    pEnemy(ctx, cx, cy, 5+shroudF, 22, SHADE, 6, 6, S);
    pEnemy(ctx, cx, cy, 5+shroudF, 28, CO, 3, 3, S);                              // tattered tip
    ctx.restore();

    // ── BOW (curved limbs)
    const bowX = -14;
    p(bowX,-22,CO,3,14); p(bowX+1,-22,BW,2,14);
    p(bowX,-8,CO,3,14);  p(bowX+1,-8,BW,2,14);
    p(bowX-1,-24,CO,2,3); p(bowX-1, 6,CO,2,3);                                    // bow tips
    // String (void-glowing, brighter)
    ctx.save(); ctx.globalAlpha = 0.70 + pulse * 0.30;
    p(bowX+2,-22,BS,1,44);
    ctx.restore();
    // Draw pull
    const pullX = Math.round(drawAng * 4);
    ctx.save(); ctx.globalAlpha = 0.65 + pulse * 0.30;
    p(bowX+2+pullX,-10,BS, pullX+1, 2);
    ctx.restore();
    // GHOST-STRING TENSION WISPS (cyan glow trailing string)
    ctx.save(); ctx.globalAlpha = 0.45 + pulse * 0.30;
    pEnemy(ctx, cx, cy, bowX,-20, VA, 1, 8, S);
    pEnemy(ctx, cx, cy, bowX,-2, VA, 1, 6, S);
    ctx.restore();

    // ── VOID ARROW (nocked, glowing arrowhead)
    ctx.save(); ctx.globalAlpha = 0.80 + pulse * 0.20;
    p(bowX+2+pullX,-10,VA,8,1);                                                   // shaft
    p(bowX+9+pullX,-11,VA2,3,3);                                                  // arrowhead
    p(bowX+10+pullX,-10,VAH,1,1);                                                 // bright tip
    ctx.restore();

    // ── HOOD/HEAD (deep dark, faceless)
    p(-3,-24,CO,6,1); p(-4,-23,CO,8,1); p(-5,-22,CO,10,1);
    p(-5,-21,CO,1,14); p( 4,-21,CO,1,14); p(-5,-7,CO,10,1);
    p(-4,-23,C1,8,2); p(-4,-21,C2,8,14);
    p(-3,-21,C3,6,12); p(-2,-20,C4,4,10); p(-1,-19,HL,2,8);
    p(-4,-21,HV,8,1);                                                             // top highlight
    // Hood peak
    p(-3,-26,CO,6,3); p(-2,-25,C1,4,2);
    // Inner hood shadow (face fully obscured)
    p(-4,-19,VOID,8,8);

    // ── SINGLE FACELESS HOLLOW VOID EYE (cyan glow from hood depths)
    p(-3,-16,CO,6,3); p(-2,-15,VOID,4,1);
    p(-2,-15,EG,2,1); p( 1,-15,EG,2,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy,-1,-15,EGH,1,1,S);
    pEnemy(ctx, cx, cy, 2,-15,EGH,1,1,S);
    ctx.restore();
    // Outer hood-glow eye aura
    ctx.save(); ctx.globalAlpha = 0.50 + pulse * 0.30;
    pEnemy(ctx, cx, cy,-4,-17,EG,8,3,S);
    ctx.restore();

    // ── ARCHER BODY (lean, top-highlighted)
    p(-4,-6,CO,8,1);
    p(-4,-5,CO,1,16); p( 3,-5,CO,1,16); p(-4,11,CO,8,1);
    p(-3,-5,C1,6,16); p(-2,-4,C2,4,14); p(-1,-3,C3,2,12);
    p(-3,-5,HV,6,1);                                                              // top highlight

    // ── QUIVER (more void arrows, denser)
    p( 4,-7,CO,3,10); p( 5,-6,C2,2,8); p( 5,-6,HV,2,1);
    // Arrow shafts protruding (4 — was 3)
    ctx.save(); ctx.globalAlpha = 0.75;
    p( 4,-14,VA,1,8); p( 5,-15,VA,1,9); p( 6,-13,VA,1,7); p( 7,-12,VA,1,6);
    ctx.restore();
    // Glowing arrowheads
    ctx.save(); ctx.globalAlpha = 0.65 + pulse * 0.30;
    p( 4,-15,VAH,1,1); p( 5,-16,VAH,1,1); p( 6,-14,VAH,1,1); p( 7,-13,VAH,1,1);
    ctx.restore();

    // ── LEGS (gaunt, longer)
    p(-3,12,CO,3,11); p( 1,12,CO,3,11);
    p(-2,13,C1,2,10); p( 2,13,C1,2,10);
    p(-3,23,CO,4,2); p( 1,23,CO,4,2);

    ctx.restore();
}

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
    p(-20,-20,AB,40,40);
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
    p(-14,-28,FR,28,44);
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
    p(-18,-32,FR,36,56);
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
 * --- CHAIN ENFORCER (heavy) ---
 * 쇠사슬 집행자: A once-mighty enforcer now bound by his own chains —
 * massive demon body wrapped in clanking iron links; immune to knockback.
 */
function drawChainEnforcer(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.004) + 1) / 2;
    const chainT = now * 0.002;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, col, w, h, S);

    const CO  = '#000000';
    const B1  = '#080808'; const B2 = '#121212'; const B3 = '#1C1C1C'; const B4 = '#282828'; const HL = '#383838';
    const CH  = '#2A2A2A'; // chain link dark
    const CH2 = '#484848'; const CH3 = '#686868'; // chain highlight
    const GW  = `rgba(180,0,0,${0.15+pulse*0.18})`; // rage glow through chains
    const EG  = `rgba(255,60,0,${0.75+pulse*0.25})`;
    const gA  = 0.97;

    ctx.save(); ctx.globalAlpha = gA;

    // ── MASSIVE HEAD ──────────────────────────────────────────
    p(-10,-28,CO,20, 2); p(-11,-26,CO,22, 1);
    p(-12,-25,CO, 1,16); p(11,-25,CO, 1,16); p(-11,-9,CO,22, 1);
    p(-11,-27,B1,20, 2); p(-11,-25,B2,22,16); p(-9,-24,B3,18,14);
    p(-7,-23,B4,14,12); p(-5,-22,HL,10,10);
    p(-10,-25,HL, 4, 5); // specular

    // ── FURY EYES ─────────────────────────────────────────────
    p(-9,-22,CO, 7, 6); p( 2,-22,CO, 7, 6);
    p(-8,-21,EG, 5, 4); p( 3,-21,EG, 5, 4);
    p(-7,-21,CO, 3, 2); p( 4,-21,CO, 3, 2);
    ctx.save(); ctx.globalAlpha *= 0.45;
    p(-9,-23,EG, 8, 7); p( 2,-23,EG, 8, 7);
    ctx.restore();

    // ── HEAVY BROW / SCREAM MAW ────────────────────────────────
    p(-10,-23,CO,8,2); p( 2,-23,CO,8,2);
    p(-5,-14,CO,10,5); p(-4,-13,'#000005',8,3);                                   // gaping void maw
    p(-4,-13,'#D8C0A8',1,3); p(-1,-13,'#D8C0A8',1,3); p( 2,-13,'#D8C0A8',1,3);    // bone fang teeth

    // ── HOLLOW BURNING EYE SOCKETS (deeper void w/ outer aura)
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    pEnemy(ctx, cx, cy,-10,-24,EG,9,7,S);
    pEnemy(ctx, cx, cy, 1,-24,EG,9,7,S);
    ctx.restore();

    // ── THICK NECK W/ EXPOSED BONE (no blood — pale)
    p(-6,-8,CO,12,2); p(-5,-7,B2,10,3);
    // Pale-bone ring around neck (visible — chained-into-bone)
    p(-5,-7,'#D8C0A8',10,1);

    // ── MASSIVE BODY ──────────────────────────────────────────
    p(-16,-4,CO,32, 1); p(-18,-3,CO, 1,26); p(17,-3,CO, 1,26); p(-16,23,CO,32, 1);
    p(-17,-3,B1,34,26); p(-15,-2,B2,30,24); p(-12,-1,B3,24,22);
    p(-9, 0,B4,18,20); p(-6, 1,HL,12,16); p(-4, 2,CO, 8, 4);
    p(-15,-3,HL, 5, 6); // chest specular

    // Rage glow through skin cracks
    ctx.save(); ctx.globalAlpha *= (0.25 + pulse * 0.30);
    p(-15, 2,GW, 2,18); p(11, 0,GW, 2,14); p(-3,-2,GW, 2,12);
    ctx.restore();

    // ── CHAINS (6 wrapping around body) ───────────────────────
    ctx.save();
    const chainLinks = [
        {y:-2, w:32}, {y:4, w:30}, {y:10, w:28}, {y:16, w:26},
    ];
    chainLinks.forEach((cl, i) => {
        const chainAnim = Math.round(Math.sin(chainT + i * 0.8) * 1);
        ctx.globalAlpha = gA * (0.75 + 0.20 * Math.sin(chainT + i));
        const cw = cl.w; const cx2 = -Math.round(cw/2);
        // Link segments
        for (let j = 0; j < cw; j += 4) {
            const lx = cx2 + j + chainAnim;
            pEnemy(ctx, cx, cy, lx, cl.y, CO, 4, 3, S);
            pEnemy(ctx, cx, cy, lx+1, cl.y+1, CH, 2, 2, S);
            pEnemy(ctx, cx, cy, lx, cl.y, CH2, 1, 1, S); // specular
        }
    });
    ctx.restore();

    // ── SHOULDER BOULDER PAULDRONS ────────────────────────────
    p(-22,-7,CO, 7, 9); p( 15,-7,CO, 7, 9);
    p(-21,-6,B2, 5, 7); p( 16,-6,B2, 5, 7);
    p(-20,-5,B4, 3, 5); p( 17,-5,B4, 3, 5);
    // Chain loops over shoulders
    ctx.save(); ctx.globalAlpha *= 0.80;
    p(-22,-4,CH2, 6, 2); p(15,-4,CH2, 6, 2);
    ctx.restore();

    // ── THICK LEGS
    p(-14,24,CO,10,12); p( 4,24,CO,10,12);
    p(-13,25,B2,8,10); p( 5,25,B2,8,10);
    p(-11,26,B3,4,8); p( 7,26,B3,4,8);
    // Chains on legs
    ctx.save(); ctx.globalAlpha *= 0.70;
    p(-14,28,CH,8,2); p( 4,28,CH,8,2);
    ctx.restore();

    // ── BROKEN CHAIN LINKS DANGLING (off pauldrons + wrists)
    ctx.save(); ctx.globalAlpha = 0.70;
    // L pauldron broken chain
    pEnemy(ctx, cx, cy,-24,-2,CO,3,3); pEnemy(ctx, cx, cy,-23,-1,CH,1,1);
    pEnemy(ctx, cx, cy,-26,2,CO,3,3); pEnemy(ctx, cx, cy,-25,3,CH,1,1);
    pEnemy(ctx, cx, cy,-25,6,CO,2,2);
    // R pauldron broken chain
    pEnemy(ctx, cx, cy, 21,-2,CO,3,3); pEnemy(ctx, cx, cy, 22,-1,CH,1,1);
    pEnemy(ctx, cx, cy, 23,2,CO,3,3); pEnemy(ctx, cx, cy, 24,3,CH,1,1);
    pEnemy(ctx, cx, cy, 23,6,CO,2,2);
    ctx.restore();

    // ── PALE BONE VISIBLE AT WRIST/ELBOW GAPS (chained-in deep)
    ctx.save(); ctx.globalAlpha = 0.55;
    pEnemy(ctx, cx, cy,-22,12,'#D8C0A8',2,1);
    pEnemy(ctx, cx, cy, 20,12,'#D8C0A8',2,1);
    ctx.restore();

    // ── DRIPPING SHADOW DROPS BELOW (3 dark drops, no blood)
    const dripA = (now % 1800) / 1800;
    ctx.save(); ctx.globalAlpha = 0.65;
    pEnemy(ctx, cx, cy,-8,38+dripA*4,CO,1,3,S);
    pEnemy(ctx, cx, cy, 5,38+dripA*5,CO,1,3,S);
    pEnemy(ctx, cx, cy,-1,40+dripA*3,CO,1,2,S);
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
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

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

    // ── HEAT HAZE
    ctx.save(); ctx.globalAlpha *= (0.20 + pulse * 0.18);
    p(-18,-26,LV,36,50);
    ctx.restore();

    // ── DRIFTING EMBER PARTICLES (3 rising)
    for (let i = 0; i < 3; i++) {
        const ex = -10 + i * 8;
        const ey = -26 - ((emberT * 3 + i * 6) % 14);
        ctx.save(); ctx.globalAlpha = 0.65 - i * 0.15;
        pEnemy(ctx, cx, cy + floatY * S, ex, ey, LV2, 1, 2, S);
        pEnemy(ctx, cx, cy + floatY * S, ex, ey-2, LV3, 1, 1, S);
        ctx.restore();
    }

    // ── HEAD (charred skull-like, top-highlighted)
    p(-7,-24,CO,14,2); p(-8,-22,CO,16,1);
    p(-9,-21,CO,1,12); p( 8,-21,CO,1,12); p(-8,-9,CO,16,1);
    p(-8,-23,S1,14,2); p(-8,-21,S2,16,12); p(-7,-20,S3,14,10); p(-5,-19,S4,10,8); p(-3,-18,HL,6,6);
    p(-8,-21,HV,16,1);                                                            // top highlight

    // ── EXPOSED PALE SKULL through skin cracks (no blood — pale bone)
    p(-2,-22,VOID,3,4);                                                           // forehead crack
    p(-2,-22,BN,1,4);
    p( 5,-18,VOID,2,4);                                                           // R cheek crack
    p( 5,-18,BN,1,4);
    // Lava streaks through cracks
    ctx.save(); ctx.globalAlpha = 0.65 + pulse * 0.35;
    p(-6,-20,CR,1,10); p( 2,-18,CR,1,8); p(-1,-22,CR,2,5);
    p(-5,-19,LV,1,7); p( 3,-17,LV,1,6); p(-1,-21,LV2,1,3);
    ctx.restore();

    // ── HOLLOW BURNING EYE SOCKETS (deep void + ember pinpoint)
    p(-7,-17,CO,5,4); p( 2,-17,CO,5,4);
    p(-6,-16,VOID,3,2); p( 3,-16,VOID,3,2);
    p(-5,-15,EG,2,1); p( 4,-15,EG,2,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy + floatY * S,-5,-15,EGH,1,1,S);
    pEnemy(ctx, cx, cy + floatY * S, 4,-15,EGH,1,1,S);
    ctx.restore();
    // Outer eye-burn aura
    ctx.save(); ctx.globalAlpha = 0.65;
    p(-8,-18,LV,6,5); p( 1,-18,LV,6,5);
    ctx.restore();

    // ── AGONY-SCREAM VOID MOUTH (gaping, pale bone fangs)
    p(-5,-12,CO,10,5); p(-4,-11,VOID,8,3);
    p(-4,-11,BN,1,3); p(-2,-11,BN,1,3); p( 0,-11,BN,1,3); p( 2,-11,BN,1,3); p( 4,-11,BN,1,3);
    p(-4,-11,BNH,1,1); p( 0,-11,BNH,1,1); p( 4,-11,BNH,1,1);

    // ── HUNCHED BODY (top-highlighted)
    p(-11,-8,CO,22,1); p(-12,-7,CO,24,1);
    p(-13,-6,CO,1,22); p(12,-6,CO,1,22); p(-11,16,CO,22,1);
    p(-12,-7,S1,24,22); p(-10,-6,S2,20,20); p(-8,-5,S3,16,18);
    p(-6,-4,S4,12,16); p(-4,-3,HL,8,12); p(-2,-2,CO,4,6);
    p(-12,-7,HV,24,1);                                                            // top highlight

    // ── MORE LAVA CRACKS REVEALING FIRE INTERIOR
    ctx.save(); ctx.globalAlpha = 0.70 + pulse * 0.30;
    p(-11,-4,CR,2,16); p(-11,-4,LV,1,14);
    p( 7,-2,CR,2,12); p( 7,-2,LV,1,10);
    p(-4,-6,CR,2,10); p(-3,-6,LV,1,8); p(-4,-6,LV2,1,4); p(-2,-5,LV3,1,2);
    p(-8,5,CR,1,8); p( 4,7,CR,1,6);                                               // extra cracks
    p(-3,10,LV,2,1);                                                              // horizontal crack
    ctx.restore();
    // Bright lava core pinpoints (focal hot spots)
    ctx.save(); ctx.globalAlpha = 0.85;
    pEnemy(ctx, cx, cy + floatY * S,-10,2,LVW,1,1,S);
    pEnemy(ctx, cx, cy + floatY * S, 8,4,LVW,1,1,S);
    pEnemy(ctx, cx, cy + floatY * S,-3,0,LVW,1,1,S);
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
    p(-19,-4,LV,3,5); p(16,-4,LV,3,5);
    p(-19,2,LV,1,2); p(17,2,LV,1,2);                                              // drips
    ctx.restore();

    // ── LEGS (charred + lava-glowing knee cracks)
    p(-10,17,CO,8,10); p( 2,17,CO,8,10);
    p(-9,18,S2,6,8); p( 3,18,S2,6,8);
    p(-8,19,S3,3,6); p( 4,19,S3,3,6);
    ctx.save(); ctx.globalAlpha = 0.60 + pulse * 0.40;
    p(-9,24,LV,6,3); p( 3,24,LV,6,3);
    p(-7,20,CR,1,5); p( 5,20,CR,1,5);                                             // knee crack glow
    ctx.restore();

    // ── LONGER CHARRED EMBER TAILS (3 streaming back)
    ctx.save(); ctx.globalAlpha = 0.65;
    p(-8,27,CO,2,5); p(-7,30,CR,1,3);
    p( 6,27,CO,2,5); p( 7,30,CR,1,3);
    p(-1,28,CO,2,5); p( 0,31,LV,1,3);
    ctx.restore();

    ctx.restore();
}

/**
 * --- PAIN REGENERATOR (burning) ---
 * 고통의 재생자: Wounds close before your eyes — torn demon flesh stitching
 * itself shut with green regen energy, char marks healing over, driven
 * purely by the ecstasy of pain becoming power.
 */
function drawPainRegenerator(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.004) + 1) / 2;
    const regenP = (Math.sin(now * 0.006) + 1) / 2;
    const floatY = Math.sin(now * 0.003) * 2;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO  = '#000000';
    const R1  = '#0A0000'; const R2 = '#1A0200'; const R3 = '#2A0400'; const R4 = '#400600'; const HL = '#580A00';
    const WD  = '#6B0000'; // wound deep
    const WL  = '#B22222'; // wound lighter
    const RE  = `rgba(0,230,80,${0.55+regenP*0.42})`; // regen green
    const RE2 = `rgba(180,255,80,${0.30+regenP*0.55})`; // regen bright
    const EG  = `rgba(255,50,0,${0.75+pulse*0.25})`;
    const gA  = 0.92 + pulse * 0.06;

    ctx.save(); ctx.globalAlpha = gA;

    // ── REGEN AURA GLOW ───────────────────────────────────────
    ctx.save(); ctx.globalAlpha *= (0.06 + regenP * 0.12);
    p(-18,-26,RE,36,52);
    ctx.restore();

    // ── HEAD ──────────────────────────────────────────────────
    p(-8,-26,CO,16, 2); p(-9,-24,CO,18, 1);
    p(-10,-23,CO, 1,14); p( 9,-23,CO, 1,14); p(-9,-9,CO,18, 1);
    p(-9,-25,R1,16, 2); p(-9,-23,R2,18,14); p(-7,-22,R3,14,12); p(-5,-21,R4,10,10); p(-3,-20,HL, 6, 8);
    p(-9,-23,HL, 3, 5); // specular

    // Healing scar on face
    p(-7,-18,WD, 2,10); // raw wound left
    ctx.save(); ctx.globalAlpha *= (0.55 + regenP * 0.40);
    p(-7,-18,RE, 2,10); p(-7,-17,RE2, 1, 7); // regen stitching
    ctx.restore();

    // ── HOLLOW ANGUISHED VOID EYE SOCKETS (deep void + ember pinpoint + outer aura)
    p(-8,-19,CO,5,4); p( 3,-19,CO,5,4);
    p(-7,-18,'#000005',3,2); p( 4,-18,'#000005',3,2);
    p(-6,-17,EG,1,1); p( 5,-17,EG,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy + floatY * S,-6,-17,'#FFCC80',1,1,S);
    pEnemy(ctx, cx, cy + floatY * S, 5,-17,'#FFCC80',1,1,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    p(-9,-20,EG,7,6); p( 2,-20,EG,7,6);
    ctx.restore();

    // ── SILENT-SCREAM MAW (gaping void w/ pale bone teeth)
    p(-6,-12,CO,12,1); p(-7,-11,'#000005',14,4);                                  // deep void interior
    p(-6,-11,'#D8C0A8',1,3); p(-3,-11,'#D8C0A8',1,3); p( 0,-11,'#D8C0A8',1,3); p( 3,-11,'#D8C0A8',1,3); p( 5,-11,'#D8C0A8',1,3);
    p(-6,-7,CO,12,1);
    ctx.save(); ctx.globalAlpha *= (0.55 + regenP * 0.40);
    p(-5,-9,RE, 8, 1);                                                            // regen stitching across mouth
    ctx.restore();

    // ── NECK ──────────────────────────────────────────────────
    p(-5,-8,CO,10, 3); p(-4,-7,R2, 8, 3);

    // ── HEAVY BODY ────────────────────────────────────────────
    p(-14,-4,CO,28, 1); p(-15,-3,CO,30, 1);
    p(-16,-2,CO, 1,22); p(15,-2,CO, 1,22); p(-14,20,CO,28, 1);
    p(-15,-3,R1,30,22); p(-13,-2,R2,26,20); p(-11,-1,R3,22,18);
    p(-9, 0,R4,18,16); p(-7, 1,HL,14,12); p(-5, 2,CO, 8, 6);
    p(-15,-3,HL, 4, 6); // chest specular

    // ── WOUNDS IN VARIOUS STATES OF HEALING ──────────────────
    // Left gash — nearly healed
    p(-13, 0,WD, 3,12);
    ctx.save(); ctx.globalAlpha *= (0.60 + regenP * 0.38);
    p(-13, 0,RE, 3,12); p(-12, 1,RE2, 1, 8);
    ctx.restore();

    // Center chest tear — midway through healing
    p(-2,-2,WD, 4,14);
    ctx.save(); ctx.globalAlpha *= (0.40 + regenP * 0.50);
    p(-2,-2,RE, 4,14); p(-1, 0,RE2, 2,10);
    ctx.restore();

    // Right shoulder slash — fresh
    p( 9,-1,WL, 3,10);
    ctx.save(); ctx.globalAlpha *= (0.30 + regenP * 0.40);
    p( 9,-1,RE, 3,10);
    ctx.restore();

    // ── ARMS ──────────────────────────────────────────────────
    p(-20,-1,CO, 6, 6); p(-19, 0,R2, 4, 5); p(-18, 1,R4, 2, 3);
    p( 14,-1,CO, 6, 6); p( 15, 0,R2, 4, 5); p( 16, 1,R4, 2, 3);
    ctx.save(); ctx.globalAlpha *= (0.45 + regenP * 0.35);
    p(-20,-1,RE, 5, 5); p(14,-1,RE, 5, 5);
    ctx.restore();

    // ── LEGS ──────────────────────────────────────────────────
    p(-12,21,CO, 9,12); p( 3,21,CO, 9,12);
    p(-11,22,R2, 7,10); p( 4,22,R2, 7,10);
    p(-10,23,R3, 4, 8); p( 5,23,R3, 4, 8);
    ctx.save(); ctx.globalAlpha *= (0.35 + regenP * 0.40);
    p(-11,28,RE, 6, 3); p(4,28,RE, 6, 3);
    ctx.restore();

    ctx.restore();
}

/**
 * --- ABYSSAL ACOLYTE (abyssal_acolyte) ---
 * 심연의 추종자: The most dangerous mortal demon — a towering acolyte robed in
 * living shadow, with multiple writhing tentacle arms pulling victims into the abyss.
 */
function drawAbyssalAcolyte(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.003) + 1) / 2;
    const tentT  = now * 0.002;
    const floatY = Math.sin(now * 0.002) * 3;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO  = '#000000';
    const D1  = '#040408'; const D2 = '#080810'; const D3 = '#0C0C18'; const D4 = '#101022'; const HL = '#14143A';
    const RB  = '#1A0030'; // robe base
    const RH  = '#300060'; // robe highlight
    const GD  = '#4A3000'; // gold trim
    const GH  = '#AA8000'; // gold highlight
    const AB  = `rgba(60,0,100,${0.55+pulse*0.35})`; // abyss glow
    const EG  = `rgba(200,0,255,${0.80+pulse*0.20})`;
    const TE  = `rgba(30,0,60,${0.70+pulse*0.28})`; // tentacle color
    const TS  = `rgba(80,0,160,${0.50+pulse*0.40})`; // tentacle shimmer
    const gA  = 0.95;

    ctx.save(); ctx.globalAlpha = gA;

    // ── DEEP VOID AURA ────────────────────────────────────────
    ctx.save(); ctx.globalAlpha *= (0.10 + pulse * 0.16);
    p(-22,-34,AB,44,68);
    ctx.restore();

    // ── SHADOW TENTACLE ARMS (4 of them, swaying) ────────────
    ctx.save();
    const tentacles = [
        {sx:-10, sy:-2, spread:-24, sway:0.0  , len:5},
        {sx:-10, sy: 4, spread:-28, sway:0.8  , len:6},
        {sx: 9, sy:-2, spread: 24, sway:0.4  , len:5},
        {sx: 9, sy: 4, spread: 28, sway:1.2  , len:6},
    ];
    tentacles.forEach((t, i) => {
        const ang  = Math.sin(tentT + t.sway + i) * 4;
        const curX = t.sx + Math.sign(t.spread) * (Math.abs(t.spread) + ang);
        for (let seg = 0; seg < t.len; seg++) {
            const frac = seg / t.len;
            const sx   = Math.round(t.sx + (curX - t.sx) * frac);
            const sy   = t.sy + seg * 3 + Math.round(Math.sin(tentT * 1.5 + seg + i) * 2);
            const a    = 0.85 - frac * 0.45;
            ctx.globalAlpha = gA * a * (0.65 + pulse * 0.30);
            pEnemy(ctx, cx, cy + floatY * S, sx, sy, TE, 3, 4, S);
            pEnemy(ctx, cx, cy + floatY * S, sx+1, sy+1, TS, 1, 2, S);
        }
        // Claw tip
        ctx.globalAlpha = gA * 0.90;
        pEnemy(ctx, cx, cy + floatY * S, curX, t.sy + t.len * 3, CO, 4, 4, S);
        pEnemy(ctx, cx, cy + floatY * S, curX+1, t.sy + t.len * 3 + 1, EG, 2, 2, S);
    });
    ctx.restore();

    // ── TALL ROBED BODY ───────────────────────────────────────
    p(-9,-32,CO,18, 2); p(-10,-30,CO,20, 1);
    p(-11,-29,CO, 1,52); p(10,-29,CO, 1,52); p(-10,23,CO,20, 1);
    p(-10,-31,D1,18, 2); p(-10,-29,RB,20,52); p(-8,-28,D3,16,50);
    p(-6,-27,D4,12,48); p(-4,-26,HL, 8,44);
    // Central robe sheen
    p(-2,-26,RH, 4,44);

    // ── GOLD ORNAMENTAL TRIM ──────────────────────────────────
    p(-9,-29,GD,18, 2); // collar
    p(-3,-26,GH, 2,44); // center seam
    p(-9,18,GD,18, 2); // hem
    // Shoulder trim
    p(-10,-14,GD,20, 2); p(-10,-14,GH, 2,12); p( 8,-14,GH, 2,12);

    // ── HOOD (deep shadow) ────────────────────────────────────
    p(-10,-32,CO,20, 2); p(-11,-30,CO,22, 1);
    p(-12,-29,CO, 1,10); p(11,-29,CO, 1,10); p(-11,-19,CO,22, 1);
    p(-11,-31,D1,20, 2); p(-11,-29,D1,22,10); p(-9,-28,D2,18, 8); p(-7,-27,D3,14, 6);
    // ── HOLLOW VOID EYE SOCKETS in deep hood (purple-fire pinpoint)
    p(-6,-25,CO,4,4); p( 2,-25,CO,4,4);
    p(-5,-24,'#000005',2,2); p( 3,-24,'#000005',2,2);
    p(-5,-24,EG,1,1); p( 3,-24,EG,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy + floatY * S,-5,-24,'#E1BEE7',1,1,S);
    pEnemy(ctx, cx, cy + floatY * S, 3,-24,'#E1BEE7',1,1,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= 0.55;
    p(-7,-26,AB,5,5); p( 1,-26,AB,5,5);
    ctx.restore();
    // Silent-scream void mouth peeking from hood depths
    p(-2,-21,CO,4,2); p(-1,-20,'#000005',2,1);

    // ── SHADOW HAND (one visible at robe edge) ────────────────
    p(-12,-6,CO, 4, 8); p(-11,-5,D2, 3, 6); p(-10,-4,TE, 2, 4);
    // Finger wisps
    ctx.save(); ctx.globalAlpha *= (0.50 + pulse * 0.45);
    p(-13,-6,TS, 2, 8); p(-14,-5,TE, 2, 6);
    ctx.restore();

    // ── SHADOW TRAIL BELOW ────────────────────────────────────
    ctx.save(); ctx.globalAlpha *= (0.25 + pulse * 0.20);
    p(-8,24,AB,16, 8); p(-6,28,AB,12, 5);
    ctx.restore();

    ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════════
//  NEW LOW-DANGER ENEMIES  (danger 1-3 for wraith / spirit / demon)
// ═══════════════════════════════════════════════════════════════════════

/**
 * --- SHADOW WISP (wraith d1) ---
 * 그림자 부유체: The feeblest wraith — a raw scrap of shadow barely holding
 * any shape, drifting on dark currents with no will of its own.
 */
function drawShadowWisp(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.005) + 1) / 2;
    const floatY = Math.sin(now * 0.004) * 3;
    const hairF  = Math.sin(now * 0.003) * 1;
    const wispT  = now * 0.0025;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO='#000';
    const W1='#050508', W2='#0A0A12', W3='#12121E', HL='#1A1A2E', HV='#2A2A48';   // shadow body
    const HR='#1A0F1A', HRH='#3A1A38';                                             // long black hair
    const EG  = `rgba(120,100,220,${0.70+pulse*0.28})`;                            // socket fire purple
    const EGH = `rgba(220,180,255,${0.85+pulse*0.15})`;
    const AU  = `rgba(60,50,100,${0.08+pulse*0.12})`;
    const TR  = `rgba(20,15,40,${0.55+pulse*0.35})`;
    const VOID= '#000005';

    // ── faint aura
    ctx.save(); ctx.globalAlpha = 0.18 + pulse * 0.20;
    p(-14,-22,AU,28,40);
    ctx.restore();

    // ── DRIFTING HAIR VEIL ABOVE HEAD (long, streaming)
    ctx.save(); ctx.globalAlpha = 0.65;
    p(-7+hairF,-22,CO,14,4); p(-6+hairF,-21,HR,12,3); p(-6+hairF,-21,HRH,12,1);
    p(-8+hairF,-26,CO,4,5); p(-7+hairF,-25,HR,2,4);                               // tuft L
    p(-2+hairF,-28,CO,5,7); p(-1+hairF,-27,HR,3,6);                               // tuft top
    p( 4+hairF,-26,CO,4,5); p( 5+hairF,-25,HR,2,4);                               // tuft R
    ctx.restore();
    // Trailing hair strands (down sides of body)
    p(-9, -8, HR, 1, 12); p(-9, 4, HR, 1, 4);
    p( 8, -8, HR, 1, 12); p( 8, 4, HR, 1, 4);

    // ── BODY (teardrop, top-highlighted)
    p(-6,-14,CO,12,2); p(-7,-12,CO,14,1);
    p(-8,-11,CO,1,14); p( 7,-11,CO,1,14); p(-6,3,CO,12,1);
    p(-7,-13,W1,12,2); p(-7,-11,W2,14,14); p(-5,-10,W3,10,12); p(-3,-9,HL,6,10);
    p(-7,-11,HV,14,1);                                                            // top highlight

    // ── HOLLOW EYE SOCKETS (deep void, fire pupil)
    p(-6,-9,CO,5,4); p( 1,-9,CO,5,4);
    p(-5,-8,VOID,3,2); p( 2,-8,VOID,3,2);
    p(-4,-7,EG,2,1); p( 3,-7,EG,2,1);
    ctx.save(); ctx.globalAlpha = 0.85 + pulse * 0.15;
    pEnemy(ctx,cx,cy + floatY * S,-4,-7,EGH,2,1,S);
    pEnemy(ctx,cx,cy + floatY * S, 3,-7,EGH,2,1,S);
    ctx.restore();

    // ── SILENT-SCREAM MOUTH (gaping pale void)
    p(-2,-2,CO,4,5); p(-1,-1,VOID,2,3);

    // ── 5 LONG TRAIL WISPS (was 5 short — now varying lengths, animated)
    for (let i = 0; i < 5; i++) {
        const wo = -4 + i * 2;
        const wl = 7 + Math.round(Math.sin(wispT + i) * 3);
        const wx = wo + Math.sin(wispT + i * 0.7) * 1;
        ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
        p(wx, 4, TR, 1, wl);
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.35 + pulse * 0.25;
        p(wx, 4+wl, W2, 1, 3);                                                    // wisp tip
        ctx.restore();
    }
}

/**
 * --- CURSED SHADE (wraith d2) ---
 * 저주받은 망령: A shade bearing visible curse sigils — purple rune-marks
 * burned into its shadowy flesh, dragging it down with their weight.
 */
function drawCursedShade(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.004) + 1) / 2;
    const runeP  = (Math.sin(now * 0.007) + 1) / 2;
    const floatY = Math.sin(now * 0.003) * 3;
    const runeT  = now * 0.0014;
    const tearT  = (now % 1400) / 1400;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO='#000';
    const D1='#060610', D2='#0C0C1E', D3='#12122E', HL='#1C1C40', HV='#2A2A50';
    const BN='#E8E0D0', BNH='#FFF8E8';                                             // bone-pale mask
    const RU = `rgba(160,60,255,${0.60+runeP*0.38})`;                              // curse rune
    const RUH= `rgba(220,140,255,${0.85+runeP*0.15})`;
    const EG = `rgba(200,80,255,${0.75+pulse*0.24})`;
    const EGH= `rgba(240,180,255,0.9)`;
    const AU = `rgba(80,30,120,${0.07+pulse*0.10})`;
    const TR = `rgba(120,30,200,${0.55+pulse*0.30})`;                              // weeping curse-tear
    const VOID='#000005';

    // ── curse aura
    ctx.save(); ctx.globalAlpha = 0.18 + pulse * 0.18;
    p(-16,-22,AU,32,42);
    ctx.restore();

    // ── 5 ORBITING CURSE-SCRIPT RUNES (rotating around body)
    for (let i = 0; i < 5; i++) {
        const a  = runeT + i * (Math.PI * 2 / 5);
        const rx = Math.cos(a) * 18;
        const ry = Math.sin(a) * 12 - 4;
        ctx.save(); ctx.globalAlpha = 0.55 + runeP * 0.30;
        p(rx-1, ry-1, RU, 3, 3);
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.75 + runeP * 0.20;
        p(rx, ry, RUH, 1, 1);
        ctx.restore();
    }

    // ── BODY (top-highlighted, deep dark)
    p(-7,-18,CO,14,2); p(-8,-16,CO,16,1);
    p(-9,-15,CO,1,20); p( 8,-15,CO,1,20); p(-7,5,CO,14,1);
    p(-8,-17,D1,14,2); p(-8,-15,D2,16,20); p(-6,-14,D3,12,18); p(-4,-13,HL,8,16);
    p(-8,-15,HV,16,1);                                                            // top highlight

    // ── BONE-PALE SILENT-SCREAM MASK (face overlay on body)
    p(-6,-12,CO,12,10);
    p(-5,-11,BN,10,8);
    p(-5,-11,BNH,10,1);                                                           // top highlight
    // Cracked seams across mask
    p(-3,-9,D1,1,7);
    p(-5,-7,D1,4,1); p(2,-8,D1,3,1);
    // HOLLOW BLACK EYE PITS (deep void w/ curse-fire pupil)
    p(-5,-9,CO,4,4); p( 1,-9,CO,4,4);
    p(-4,-8,VOID,2,2); p( 2,-8,VOID,2,2);
    p(-4,-8,EG,1,1); p( 3,-8,EG,1,1);
    ctx.save(); ctx.globalAlpha = 0.90;
    pEnemy(ctx,cx,cy + floatY * S,-4,-8,EGH,1,1,S);
    pEnemy(ctx,cx,cy + floatY * S, 3,-8,EGH,1,1,S);
    ctx.restore();
    // Silent-scream mouth (gaping void hole)
    p(-2,-4,CO,4,4); p(-1,-3,VOID,2,2);
    // Curse brand sigil on forehead
    p(-1,-11,RU,2,2);
    ctx.save(); ctx.globalAlpha = 0.85;
    pEnemy(ctx,cx,cy + floatY * S,-1,-11,RUH,2,2,S);
    ctx.restore();

    // ── WEEPING CURSE-TEAR STREAKS (slow descent from sockets)
    p(-4,-5,TR,1,2);
    p( 3,-5,TR,1,2);
    ctx.save(); ctx.globalAlpha = 0.70;
    pEnemy(ctx,cx,cy + floatY * S,-4,-3+tearT*4,RU,1,2,S);
    pEnemy(ctx,cx,cy + floatY * S, 3,-3+tearT*5,RU,1,2,S);
    ctx.restore();

    // ── GLOWING BRAND BURNS ON BODY (curse-rune scars)
    ctx.save(); ctx.globalAlpha = 0.55 + runeP * 0.35;
    p(-7,0,RU,2,5); p(-7,0,RUH,2,1);                                              // L brand
    p( 5,2,RU,2,4); p( 5,2,RUH,2,1);                                              // R brand
    p(-2,2,RU,4,1);                                                               // center band
    ctx.restore();

    // ── WISP TRAILS (longer)
    ctx.save(); ctx.globalAlpha = 0.50 + pulse * 0.35;
    p(-5,6,D2,2,8); p(-1,6,D2,3,11); p( 3,6,D2,2,8);
    p(-3,14,D1,2,5); p( 1,14,D1,1,5);
    p(-1,18,TR,1,3);                                                              // curse-tinted wisp tip
    ctx.restore();
}

/**
 * --- SOUL HOUND (wraith d3) ---
 * 영혼 추적자: A predatory wraith retaining the hunter's instinct — low
 * HP but fast; elongated shadow body with blazing tracking eyes.
 */
function drawSoulHound(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.006) + 1) / 2;
    const floatY = Math.sin(now * 0.005) * 2;
    const breath = Math.sin(now * 0.008) * 1;
    const flameT = now * 0.012;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO='#000';
    const H1='#050505', H2='#0E0808', H3='#1A1010', HL='#261818', HV='#3A2828';   // shadow-fur
    const BN='#D8D0C0', BNH='#F0E8D8';                                             // pale rib bone
    const EG  = `rgba(255,100,30,${0.80+pulse*0.20})`;                             // ember eyes
    const EGH = `rgba(255,220,140,0.95)`;
    const AU  = `rgba(60,20,10,${0.10+pulse*0.15})`;
    const TR  = `rgba(20,8,4,${0.60+pulse*0.35})`;
    const EM  = `rgba(255,160,40,${0.60+pulse*0.30})`;                             // ember breath
    const VOID= '#000005';

    // ── ember death-track aura
    ctx.save(); ctx.globalAlpha = 0.20 + pulse * 0.18;
    p(-16,-26,AU,32,42);
    ctx.restore();

    // ── ELONGATED HOUND HEAD (sharper, longer snout)
    p(-10,-18,CO,20,2); p(-11,-16,CO,22,1);
    p(-12,-15,CO,1,12); p(11,-15,CO,1,12); p(-10,-3,CO,20,1);
    p(-11,-17,H1,20,2); p(-11,-15,H2,22,12); p(-9,-14,H3,18,10); p(-7,-13,HL,14,8);
    p(-11,-15,HV,22,1);                                                           // top highlight
    // Pointed bone ears (skeletal tufts)
    p(-12,-22,CO,4,5); p(-11,-21,BN,2,4);                                         // L ear
    p( 8,-22,CO,4,5); p( 9,-21,BN,2,4);                                           // R ear

    // ── HOLLOW EMBER EYE SOCKETS (deep void + ember + outer aura)
    p(-10,-11,CO,5,5); p( 5,-11,CO,5,5);
    p(-9,-10,VOID,3,3); p( 6,-10,VOID,3,3);
    p(-8,-9,EG,2,2); p( 7,-9,EG,2,2);
    p(-8,-9,CO,1,1); p( 7,-9,CO,1,1);
    ctx.save(); ctx.globalAlpha = 0.90;
    pEnemy(ctx,cx,cy + floatY * S,-8,-9,EGH,1,1,S);
    pEnemy(ctx,cx,cy + floatY * S, 7,-9,EGH,1,1,S);
    ctx.restore();
    // Outer eye aura
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    pEnemy(ctx,cx,cy + floatY * S,-12,-12,EG,8,7,S);
    pEnemy(ctx,cx,cy + floatY * S,  4,-12,EG,8,7,S);
    ctx.restore();

    // ── SKELETAL SNOUT (exposed jaw bone, no flesh on muzzle)
    p(-5,-3,CO,10,5); p(-4,-2,BN,8,3); p(-4,-2,BNH,8,1);
    // Fang teeth (sharper, more)
    p(-5,1,CO,12,4);
    p(-4,2,BN,1,2); p(-2,2,BN,1,2); p(0,2,BN,1,2); p(2,2,BN,1,2); p(4,2,BN,1,2); p(6,2,BN,1,2);
    // EMBER BREATH from open jaw (animated wisps)
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    pEnemy(ctx,cx,cy + floatY * S,-2,4+breath,EM,4,4,S);
    pEnemy(ctx,cx,cy + floatY * S,-1,6+breath,EG,2,3,S);
    pEnemy(ctx,cx,cy + floatY * S, 0,8+breath,EGH,1,2,S);
    ctx.restore();

    // ── BODY (long lean torso, top-highlighted)
    p(-8,-2,CO,16,2); p(-9,-1,CO,18,1);
    p(-10,0,CO,1,16); p(9,0,CO,1,16); p(-8,16,CO,16,1);
    p(-9,0,H2,18,16); p(-7,1,H3,14,14); p(-5,2,HL,10,12);
    p(-9,0,HV,18,1);                                                              // top highlight

    // ── EXPOSED RIBCAGE (pale bone, no blood — 4 ribs visible)
    p(-6,2,VOID,12,12);                                                           // chest cavity
    for (let r = 0; r < 4; r++) {
        const ry = 4 + r * 3;
        p(-6, ry, BN, 12, 1);
        p(-6, ry, BNH, 12, 1);
    }
    // Spine ridge
    p(-1, 0, BN, 2, 16);

    // ── SHADOW TAIL (longer, multi-segment streaming)
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.40;
    p(-5,17,TR,2,7); p(-1,17,TR,3,10); p( 3,17,TR,2,8);
    p(-3,24,TR,2,5); p( 1,24,TR,1,5);
    p(-1,28,TR,1,4);
    ctx.restore();
    // Tail-tip ember
    ctx.save(); ctx.globalAlpha = 0.70 + pulse * 0.25;
    pEnemy(ctx,cx,cy + floatY * S, 0,28,EM,1,2,S);
    ctx.restore();

    // ── GHOST FLAME TRAIL (drifting behind body — animated)
    for (let i = 0; i < 4; i++) {
        const fY = -8 - i * 4 + (flameT * 4 + i * 5) % 20;
        ctx.save(); ctx.globalAlpha = 0.40 - i * 0.07;
        pEnemy(ctx,cx,cy + floatY * S,-14+i,fY,EM,2,3,S);
        ctx.restore();
    }
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
    p(-12,-20,AU,24,34);
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
    p(-14,-26,AU,28,46);
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
    pEnemy(ctx, cx, cy + floatY * S,-22,-30,M3,44,52,S);
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
 * --- IMP (demon d1) ---
 * 잔챙이 악마: The bottom rung of demonkind — tiny horned nuisance
 * with bat wings and a mischievous grin. Weak but fast.
 */
function drawImp(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.006) + 1) / 2;
    const wingT  = now * 0.008;
    const floatY = Math.sin(now * 0.005) * 3;
    const dustT  = now * 0.003;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO='#000';
    const I1='#100506', I2='#1E0A0C', I3='#2E1012', HL='#3C181A', HV='#5A2030';
    const BN='#D8C8C0', BNH='#F0E0D8';
    const EG  = `rgba(255,80,0,${0.85+pulse*0.15})`;
    const EGH = `rgba(255,200,100,0.95)`;
    const WC  = `rgba(40,10,14,${0.70+pulse*0.25})`;
    const WCH = `rgba(80,20,28,${0.55+pulse*0.20})`;
    const DUST= `rgba(20,5,8,${0.50+pulse*0.20})`;
    const VOID= '#000005';
    const gA  = 0.92;

    ctx.save(); ctx.globalAlpha = gA;

    // ── DRIFTING BLACK DUST (3 floating particles around imp)
    for (let i = 0; i < 3; i++) {
        const dx = -8 + i * 7;
        const dy = -16 - ((dustT * 3 + i * 5) % 14);
        ctx.save(); ctx.globalAlpha = 0.55 - i * 0.12;
        pEnemy(ctx, cx, cy + floatY * S, dx, dy, DUST, 1, 1, S);
        ctx.restore();
    }

    // ── TORN BAT WINGS (more details, holes, wing ribs)
    ctx.save();
    const wingFlap = Math.sin(wingT) * 4;
    ctx.globalAlpha *= 0.82;
    // Left wing
    pEnemy(ctx, cx, cy + floatY * S, -20, -10 + wingFlap, CO, 12, 12, S);
    pEnemy(ctx, cx, cy + floatY * S, -19, -9 + wingFlap, WC, 10, 10, S);
    pEnemy(ctx, cx, cy + floatY * S, -17, -7 + wingFlap, I2, 6, 7, S);
    pEnemy(ctx, cx, cy + floatY * S, -19, -9 + wingFlap, WCH, 10, 1, S);          // top highlight
    // Right wing
    pEnemy(ctx, cx, cy + floatY * S,   8, -10 + wingFlap, CO, 12, 12, S);
    pEnemy(ctx, cx, cy + floatY * S,   9, -9 + wingFlap, WC, 10, 10, S);
    pEnemy(ctx, cx, cy + floatY * S,  11, -7 + wingFlap, I2, 6, 7, S);
    pEnemy(ctx, cx, cy + floatY * S,   9, -9 + wingFlap, WCH, 10, 1, S);
    ctx.restore();
    // Wing ribs (skeletal bones)
    p(-18,-8+wingFlap,CO,1,10); p(-15,-7+wingFlap,CO,1,9); p(-12,-6+wingFlap,CO,1,7);
    p(17,-8+wingFlap,CO,1,10); p(14,-7+wingFlap,CO,1,9); p(11,-6+wingFlap,CO,1,7);
    // Wing holes/tears (no-cute)
    p(-16,-4+wingFlap,VOID,2,2); p(-13,0+wingFlap,VOID,2,2);
    p( 15,-4+wingFlap,VOID,2,2); p( 12,0+wingFlap,VOID,2,2);
    // Wing claw tips (top)
    p(-21,-12+wingFlap,CO,2,3); p( 19,-12+wingFlap,CO,2,3);

    // ── CURVED HORNS (slightly larger, bone-tipped)
    p(-3,-18,CO,3,5); p(-2,-17,I3,1,4); p(-2,-18,BN,1,1);
    p( 1,-18,CO,3,5); p( 2,-17,I3,1,4); p( 2,-18,BN,1,1);

    // ── SMALL HEAD (top-highlighted)
    p(-5,-14,CO,10,2); p(-6,-12,CO,12,1);
    p(-7,-11,CO,1,10); p( 6,-11,CO,1,10); p(-5,-1,CO,10,1);
    p(-6,-13,I1,10,2); p(-6,-11,I2,12,10); p(-4,-10,I3,8,8); p(-2,-9,HL,4,6);
    p(-6,-11,HV,12,1);                                                            // top highlight

    // ── HOLLOW VOID EYE SOCKETS (ember pinpoint, deep void)
    p(-6,-8,CO,4,4); p( 2,-8,CO,4,4);
    p(-5,-7,VOID,2,2); p( 3,-7,VOID,2,2);
    p(-5,-7,EG,1,1); p( 3,-7,EG,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy + floatY * S, -5,-7, EGH, 1, 1, S);
    pEnemy(ctx, cx, cy + floatY * S,  3,-7, EGH, 1, 1, S);
    ctx.restore();
    // Outer eye-burn aura
    ctx.save(); ctx.globalAlpha = 0.45 + pulse * 0.30;
    pEnemy(ctx, cx, cy + floatY * S, -7,-9, EG, 5, 5, S);
    pEnemy(ctx, cx, cy + floatY * S,  1,-9, EG, 5, 5, S);
    ctx.restore();

    // ── SILENT-SCREAM MOCKING GRIN (bared pale fangs, void mouth)
    p(-5,-3,CO,10,4); p(-4,-2,VOID,8,2);
    p(-4,-2,BN,1,2); p(-1,-2,BN,1,2); p( 2,-2,BN,1,2);                            // 3 fangs
    p(-4,-2,BNH,1,1); p( 2,-2,BNH,1,1);                                           // fang highlights

    // ── SMALL BODY (top-highlighted, ribcage hint)
    p(-5,0,CO,10,2); p(-6,1,CO,12,1);
    p(-7,2,CO,1,10); p( 6,2,CO,1,10); p(-5,12,CO,10,1);
    p(-6,2,I2,12,10); p(-4,3,I3,8,8); p(-2,4,HL,4,6);
    p(-6,2,HV,12,1);                                                              // top highlight
    // Ribcage hint (3 faint bone ridges)
    ctx.save(); ctx.globalAlpha = 0.45;
    pEnemy(ctx, cx, cy + floatY * S,-4,4,BN,8,1,S);
    pEnemy(ctx, cx, cy + floatY * S,-4,7,BN,8,1,S);
    pEnemy(ctx, cx, cy + floatY * S,-4,10,BN,8,1,S);
    ctx.restore();

    // ── BONE-SPIKE POINTY TAIL (skeletal segments)
    ctx.save(); ctx.globalAlpha *= 0.90;
    p(-2,13,CO,3,4); p(-1,17,CO,2,3); p( 0,20,CO,2,2);
    p(-1,14,I3,2,3); p( 0,17,I2,1,2);
    p( 0,22,CO,3,3); p( 1,23,BN,1,2);                                             // bone spike tip
    ctx.restore();

    // ── CLAWED FEET (bone-talon tips)
    p(-6,13,CO,4,3); p( 2,13,CO,4,3);
    p(-5,14,I2,2,2); p( 3,14,I2,2,2);
    p(-6,16,CO,4,1); p(-5,17,BN,1,1); p(-3,17,BN,1,1);                            // bone claws L
    p( 2,16,CO,4,1); p( 3,17,BN,1,1); p( 5,17,BN,1,1);                            // bone claws R

    ctx.restore();
}

/**
 * --- HELLSPAWN (demon d2) ---
 * 지옥의 자식: A young demon fresh from the pit — oversized horns for its
 * size, clawed hands, hot amber eyes full of cruel instinct.
 */
function drawHellspawn(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.005) + 1) / 2;
    const floatY = Math.sin(now * 0.004) * 2;
    const hairF  = Math.sin(now * 0.003) * 1;
    const crackT = (Math.sin(now * 0.006) + 1) / 2;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO='#000';
    const H1='#0E0608', H2='#1C0C10', H3='#2A1018', HL='#381620', HV='#5A2030';
    const HN='#2E0A0E', HH='#4A1016', HW='#7A2030';                                // horn shades
    const BN='#D8C8C0', BNH='#F0E0D8';                                              // pale exposed bone
    const HR='#08000A';                                                            // black hair
    const EG  = `rgba(255,140,0,${0.85+pulse*0.15})`;
    const EGH = `rgba(255,220,140,0.95)`;
    const CRACK=`rgba(180,40,20,${0.55+crackT*0.35})`;
    const AU  = `rgba(80,10,20,${0.10+pulse*0.12})`;
    const VOID= '#000005';

    // ── hellspawn aura (faint crimson)
    ctx.save(); ctx.globalAlpha = 0.20 + pulse * 0.18;
    pEnemy(ctx, cx, cy+floatY*S,-18,-30,AU,36,52,S);
    ctx.restore();

    ctx.save(); ctx.globalAlpha = 0.92;

    // ── DRIFTING BLACK HAIR BEHIND HORNS (long, vengeful)
    ctx.save(); ctx.globalAlpha = 0.70;
    p(-7+hairF,-20,CO,14,3); p(-6+hairF,-19,HR,12,2);
    p(-9+hairF,-22,CO,3,4); p(-8+hairF,-21,HR,1,3);                                // L tuft
    p( 6+hairF,-22,CO,3,4); p( 7+hairF,-21,HR,1,3);                                // R tuft
    // Long trailing side strands
    p(-10,-12,HR,1,12); p( 9,-12,HR,1,12);
    ctx.restore();

    // ── LARGE CURVED HORNS (cracked + pale-bone exposed tips)
    p(-7,-28,CO,4,12); p(-6,-28,HN,2,10); p(-5,-27,HH,1,8);                       // L horn
    p( 3,-28,CO,4,12); p( 4,-28,HN,2,10); p( 5,-27,HH,1,8);                       // R horn
    p(-9,-22,CO,4,6); p(-8,-22,HN,2,4);                                            // L tip curve
    p( 5,-22,CO,4,6); p( 6,-22,HN,2,4);                                            // R tip curve
    // Bone-pale exposed inner horn cracks
    p(-7,-26,BN,1,4); p( 5,-26,BN,1,4);
    p(-6,-25,HW,1,1); p( 4,-25,HW,1,1);                                            // horn highlight

    // ── HEAD (top-highlighted)
    p(-7,-20,CO,14,2); p(-8,-18,CO,16,1);
    p(-9,-17,CO,1,14); p( 8,-17,CO,1,14); p(-7,-3,CO,14,1);
    p(-8,-19,H1,14,2); p(-8,-17,H2,16,14); p(-6,-16,H3,12,12); p(-4,-15,HL,8,10);
    p(-8,-17,HV,16,1);                                                            // top highlight

    // ── VOID CRACKS THROUGH SKIN (revealing dark interior, glow)
    ctx.save(); ctx.globalAlpha = 0.65 + crackT * 0.25;
    p(-3,-10,CRACK,1,7);                                                          // L vertical face crack
    p( 4,-12,CRACK,1,5);                                                          // R diagonal face crack
    p(-6,-6,CRACK,5,1);                                                           // horizontal cheek crack
    ctx.restore();

    // ── HOLLOW AMBER EYE SOCKETS (deep void + pinpoint glow + outer aura)
    p(-7,-12,CO,5,4); p( 2,-12,CO,5,4);
    p(-6,-11,VOID,3,2); p( 3,-11,VOID,3,2);
    p(-5,-10,EG,2,1); p( 4,-10,EG,2,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy+floatY*S,-5,-10,EGH,1,1,S);
    pEnemy(ctx, cx, cy+floatY*S, 4,-10,EGH,1,1,S);
    ctx.restore();
    // Outer eye-burn aura
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    pEnemy(ctx, cx, cy+floatY*S,-8,-13,EG,6,5,S);
    pEnemy(ctx, cx, cy+floatY*S, 1,-13,EG,6,5,S);
    ctx.restore();

    // ── SILENT-SCREAM MAW W/ FANGS (gaping void, bared teeth)
    p(-5,-6,CO,10,5); p(-4,-5,VOID,8,3);
    p(-4,-3,CO,8,2);                                                              // lower jaw line
    // Bared pale-bone fangs (5)
    p(-4,-5,BN,1,3); p(-2,-5,BN,1,3); p( 0,-5,BN,1,3); p( 2,-5,BN,1,3); p( 4,-5,BN,1,3);
    p(-4,-5,BNH,1,1); p( 0,-5,BNH,1,1); p( 4,-5,BNH,1,1);

    // ── BODY (top-highlighted, scarred)
    p(-8,-2,CO,16,2); p(-9,-1,CO,18,1);
    p(-10,0,CO,1,16); p( 9,0,CO,1,16); p(-8,16,CO,16,1);
    p(-9,0,H2,18,16); p(-7,1,H3,14,14); p(-5,2,HL,10,10);
    p(-9,0,HV,18,1);                                                              // top highlight
    // Body void cracks
    ctx.save(); ctx.globalAlpha = 0.55 + crackT * 0.30;
    p(-8,3,CRACK,1,10); p( 7,5,CRACK,1,8); p(-2,8,CRACK,3,1);
    ctx.restore();
    // Cruel chest scar (deep wound, no blood — pale bone visible)
    p(-3,2,CO,5,5); p(-2,3,VOID,3,3); p(-2,3,BN,3,1);

    // ── CLAWED ARMS w/ skeletal hand tips
    p(-15,-1,CO,6,6); p(-14,0,H2,4,5); p(-13,1,H3,2,3);
    p( 9,-1,CO,6,6); p(10,0,H2,4,5); p(11,1,H3,2,3);
    // Bone-claw tips (pale bone)
    p(-17,-1,CO,2,3); p(-16,0,BN,1,2);
    p( 15,-1,CO,2,3); p( 16,0,BN,1,2);
    p(-18, 0,CO,1,1); p(-18, 2,CO,1,1);                                           // extra claw fingers L
    p( 18, 0,CO,1,1); p( 18, 2,CO,1,1);

    // ── LEGS (skeletal-clawed feet)
    p(-7,17,CO,6,8); p( 1,17,CO,6,8);
    p(-6,18,H2,4,6); p( 2,18,H2,4,6);
    p(-5,19,H3,2,4); p( 3,19,H3,2,4);
    // Bone claws
    p(-7,25,CO,6,2); p(-6,26,BN,1,1); p(-3,26,BN,1,1);
    p( 1,25,CO,6,2); p( 2,26,BN,1,1); p( 5,26,BN,1,1);

    ctx.restore();
}

/**
 * --- BRIMSTONE FIEND (demon d3) ---
 * 유황 악귀: A demon branded with hellfire — sulfur veins glow orange
 * under charred skin; approach at your own risk.
 */
function drawBrimstoneFiend(cx, cy, enemy) {
    const now    = Date.now();
    const S      = 2.0;
    const pulse  = (Math.sin(now * 0.005) + 1) / 2;
    const smokeT = now * 0.003;
    const floatY = Math.sin(smokeT) * 2;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO = '#000000';
    const B1 = '#0C0500'; const B2 = '#180A00'; const B3 = '#240E00'; const HL = '#341400';
    const SV = `rgba(255,160,0,${0.55+pulse*0.40})`; // sulfur vein
    const SF = `rgba(255,220,0,${0.30+pulse*0.50})`; // sulfur bright
    const SM = `rgba(40,20,0,${0.15+pulse*0.15})`; // smoke
    const EG = `rgba(255,180,0,${0.80+pulse*0.20})`;
    const gA = 0.92;

    ctx.save(); ctx.globalAlpha = gA;

    // Sulfur smoke wisps above
    ctx.save(); ctx.globalAlpha *= (0.12 + pulse * 0.14);
    p(-8,-28,SM,16, 8); p(-5,-32,SM,10, 6); p(-2,-35,SM, 6, 5);
    ctx.restore();

    // Stubby horns
    p(-5,-24,CO, 3, 5); p( 2,-24,CO, 3, 5);
    p(-4,-24,B3, 2, 4); p( 3,-24,B3, 2, 4);
    p(-4,-24,HL, 1, 2); p( 4,-24,HL, 1, 2);

    // Head
    p(-7,-19,CO,14, 2); p(-8,-17,CO,16, 1);
    p(-9,-16,CO, 1,14); p( 8,-16,CO, 1,14); p(-7,-2,CO,14, 1);
    p(-8,-18,B1,14, 2); p(-8,-16,B2,16,14); p(-6,-15,B3,12,12); p(-4,-14,HL, 8,10);
    p(-7,-16,HL, 3, 4);

    // Sulfur veins on face
    ctx.save(); ctx.globalAlpha *= (0.50 + pulse * 0.45);
    p(-6,-13,SV, 1, 10); p( 3,-11,SV, 1, 8); p(-1,-15,SV, 2, 5);
    p(-5,-12,SF, 1, 6); p( 4,-10,SF, 1, 4);
    ctx.restore();

    // ── HOLLOW BURNING VOID EYE SOCKETS (deep void + sulfur pinpoint)
    p(-7,-11,CO,5,4); p( 2,-11,CO,5,4);
    p(-6,-10,'#000005',3,2); p( 3,-10,'#000005',3,2);
    p(-5,-9,EG,1,1); p( 4,-9,EG,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy + floatY * S,-5,-9,'#FFEE80',1,1,S);
    pEnemy(ctx, cx, cy + floatY * S, 4,-9,'#FFEE80',1,1,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    p(-8,-12,SV,6,5); p( 1,-12,SV,6,5);
    ctx.restore();

    // ── SILENT-SCREAM SNARLING MAW (pale bone fangs)
    p(-5,-3,CO,10,1); p(-6,-2,'#000005',12,4);
    p(-5,-2,'#D8C0A8',1,3); p(-1,-2,'#D8C0A8',1,3); p( 3,-2,'#D8C0A8',1,3);        // 3 pale fangs
    p(-5,2,CO,10,1);
    // Bare exposed bone showing through forehead crack
    p( 0,-16,'#000005',2,3); p( 0,-16,'#D8C0A8',1,3);

    // Body
    p(-9,-1,CO,18, 2); p(-10, 0,CO,20, 1);
    p(-11, 1,CO, 1,18); p(10, 1,CO, 1,18); p(-9,19,CO,18, 1);
    p(-10, 1,B2,20,18); p(-8, 2,B3,16,16); p(-6, 3,HL,12,12);
    p(-10, 1,HL, 4, 5);

    // Sulfur veins on body
    ctx.save(); ctx.globalAlpha *= (0.55 + pulse * 0.40);
    p(-9, 3,SV, 2,14); p(-9, 3,SF, 1,10); // left vein
    p( 6, 5,SV, 2,10); p( 7, 5,SF, 1, 7); // right vein
    p(-2, 1,SV, 2, 8); p(-1, 2,SF, 1, 5); // center vein
    ctx.restore();

    // Arms
    p(-16, 1,CO, 6, 6); p(-15, 2,B2, 4, 5); p(-14, 3,B3, 2, 3);
    p( 10, 1,CO, 6, 6); p( 11, 2,B2, 4, 5); p( 12, 3,B3, 2, 3);
    ctx.save(); ctx.globalAlpha *= (0.45 + pulse * 0.40);
    p(-18, 2,SV, 4, 4); p(14, 2,SV, 4, 4);
    ctx.restore();

    // Legs
    p(-8,20,CO, 6, 8); p( 2,20,CO, 6, 8);
    p(-7,21,B2, 4, 6); p( 3,21,B2, 4, 6);
    p(-6,22,B3, 2, 4); p( 4,22,B3, 2, 4);
    ctx.save(); ctx.globalAlpha *= (0.40 + pulse * 0.40);
    p(-8,25,SV, 5, 3); p(2,25,SV, 5, 3);
    ctx.restore();

    ctx.restore();
}

/**
 * --- GOLD PHANTOM (gold) ---
 */
function drawGoldPhantom(cx, cy, enemy) {
    const now    = Date.now();
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, col, w, h, S);
    const floatY = Math.sin(now * 0.002) * 3;
    const ep     = (Math.sin(now * 0.005) + 1) / 2;
    const coinT  = now * 0.0018;
    const CO='#000';
    const GS='#5A4000', GM='#9A6F00', GB='#FFD700', GL='#FFE57F', GH='#FFFFCC';
    const VS='#0A0006', VM='#1A0010', VB='#2A001C';                                // sallow ghost-flesh tones
    const HE='#FFAA00';                                                            // hollow gold-fire eyes

    // ── greed-curse aura (sickly gold)
    ctx.save(); ctx.globalAlpha = 0.18 + ep * 0.22;
    pEnemy(ctx,cx,cy,-14,-30+floatY,GM,28,52,S);
    ctx.restore();

    // ── 4 ORBITING GOLD COINS (curse-bound)
    for (let i = 0; i < 4; i++) {
        const a   = coinT + i * (Math.PI / 2);
        const cox = Math.cos(a) * 14;
        const coy = Math.sin(a) * 8 - 4;
        p(cox-1+floatY*0, coy-1+floatY, CO, 3, 3);
        p(cox+floatY*0,   coy+floatY,   GB, 1, 1);
        ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.25;
        pEnemy(ctx,cx,cy,cox-1,coy-1+floatY,GL,3,3,S);
        ctx.restore();
    }

    // ── DRIFTING SHROUD (translucent ragged tail below)
    ctx.save(); ctx.globalAlpha = 0.35 + ep * 0.20;
    p(-7,8+floatY,GM,14,6); p(-5,12+floatY,GS,10,4);
    p(-4,14+floatY,GS,3,2); p(2,14+floatY,GS,3,2);                                // tatter wisps
    ctx.restore();

    // ── BODY OUTLINE + GHOSTLY GOLD FLESH (top-highlighted)
    p(-7,-12+floatY,CO,14,22);
    p(-6,-11+floatY,GS,12,20);
    p(-6,-11+floatY,GM,12,1);                                                     // top highlight
    p(-5,-10+floatY,GM,10,18);
    p(-4,-9+floatY,GB,8,14);
    p(-3,-8+floatY,GL,4,10);
    // Sickly ghost-flesh undertone (sallow)
    ctx.save(); ctx.globalAlpha = 0.30 + ep * 0.20;
    p(-5,-9+floatY,VS,10,15);
    ctx.restore();

    // ── COIN CLUTCHED TO CHEST (greed-bound)
    p(-2,-3+floatY,CO,4,4); p(-1,-2+floatY,GH,2,2); p(-1,-2+floatY,GL,2,1);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.30;
    pEnemy(ctx,cx,cy,-2,-3+floatY,GL,4,4,S);
    ctx.restore();

    // ── HOLLOW MELTING FACE
    p(-5,-14+floatY,CO,10,6);                                                     // upper face outline
    p(-4,-13+floatY,GS,8,4);
    // Hollow gold-fire eye sockets (2 deep pits w/ pinpoint glow)
    p(-4,-12+floatY,CO,3,3); p( 1,-12+floatY,CO,3,3);
    p(-3,-11+floatY,HE,1,1); p( 2,-11+floatY,HE,1,1);
    ctx.save(); ctx.globalAlpha = 0.85 + ep * 0.15;
    pEnemy(ctx,cx,cy,-3,-11+floatY,GH,1,1,S);
    pEnemy(ctx,cx,cy, 2,-11+floatY,GH,1,1,S);
    ctx.restore();
    // Gaping silent-scream mouth (no blood — pale void)
    p(-2,-8+floatY,CO,4,3); p(-1,-7+floatY,VM,2,2);

    // ── GOLD DRIP TEARS (slow descent)
    const dripA = (now % 1200) / 1200;
    p(-3,-9+dripA*8+floatY,GB,1,1);
    p( 2,-9+dripA*9+floatY,GB,1,1);

    // ── FAINT GOLD HALO (broken — symbolizes failed wealth)
    p(-7,-18+floatY,CO,3,1); p(-3,-19+floatY,CO,3,1); p( 1,-19+floatY,CO,3,1); p( 4,-18+floatY,CO,3,1);
    p(-6,-18+floatY,GB,1,1); p(-2,-19+floatY,GB,1,1); p( 2,-19+floatY,GB,1,1); p( 5,-18+floatY,GB,1,1);
}

/**
 * --- CERBERUS (Boss 10) ---
 */
function drawCerberus(cx, cy, enemy) {
    const now    = Date.now();
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, col, w, h, S);
    const pulse  = (Math.sin(now * 0.005) + 1) / 2;
    const breath = Math.sin(now * 0.003) * 1;
    const drool  = (now % 800) / 800;
    const CO='#000';
    const FS='#0A0A0A', FM='#1A1A1A', FB='#2C2C2C', FL='#444444', FV='#5A5A5A';   // pale-charcoal funeral fur
    const BN='#E0DCD0', BH='#F5F0E8';                                              // pale bone (no blood)
    const SH='#363036', SHL='#5A4858';                                             // shroud cloth
    const HE='#FFAA00', HEL='#FFEE44';                                             // hollow socket fire
    const BR='#B71C1C', BR2='#FF4A20';                                             // brimstone glow (under-body only)

    // ── death aura (cold + brimstone undertone)
    ctx.save(); ctx.globalAlpha = 0.18 + pulse * 0.18;
    pEnemy(ctx,cx,cy,-30,-40,FM,60,60,S);
    ctx.restore();

    // ── BRIMSTONE GLOW BENEATH BODY (subtle hellfire)
    ctx.save(); ctx.globalAlpha = 0.35 + pulse * 0.30;
    pEnemy(ctx,cx,cy,-22,18,BR2,44,6,S);
    ctx.restore();

    // ── MASSIVE BODY (charcoal fur, top-highlighted, exposed pale ribcage)
    p(-22,-8,CO,44,30);
    p(-21,-7,FS,42,28);
    p(-20,-6,FM,40,26);
    p(-21,-7,FV,42,1);                                                            // top highlight
    // Exposed ribcage (pale bone, NO blood — 5 ribs)
    for (let r = 0; r < 5; r++) {
        const rx = -16 + r * 8;
        p(rx, -2, CO, 2, 14);
        p(rx, -2, BN, 1, 12);
        p(rx, -2, BH, 1, 1);
    }
    // Dark spine ridge above ribs
    p(-18,-6,CO,36,3); p(-17,-5,FS,34,1);
    // Bone-spike vertebrae crest
    for (let v = 0; v < 4; v++) {
        const vx = -14 + v * 10;
        p(vx, -10, CO, 2, 4); p(vx, -10, BN, 1, 3);
    }

    // ── LEGS (4 — clawed pale-bone visible)
    for (let leg = 0; leg < 4; leg++) {
        const lx = -18 + leg * 12;
        p(lx, 14, CO, 5, 12);
        p(lx+1, 15, FS, 3, 10);
        p(lx+1, 15, FV, 3, 1);                                                    // top highlight
        // Bone claws
        p(lx, 26, CO, 5, 3); p(lx+1, 27, BN, 1, 2); p(lx+3, 27, BN, 1, 2);
    }

    // ── DRIFTING SHROUD CAPE (translucent ragged neck wrap)
    ctx.save(); ctx.globalAlpha = 0.50 + breath * 0.10;
    p(-18, 0+breath, SH, 36, 8); p(-16, 6+breath, SHL, 32, 4);
    // Tattered edges
    p(-18,10+breath,SH,4,4); p(-12,11+breath,SH,3,4); p(-4,12+breath,SH,3,4); p(2,11+breath,SH,3,4); p(10,10+breath,SH,4,4);
    ctx.restore();

    // ── 3 HOLLOW HEADS (was simple — now: hollow eye sockets + bare fangs + drool)
    for (let i = -1; i <= 1; i++) {
        const hx = i * 16;
        const hy = Math.abs(i) * 6;
        // Skull-fur head outline
        p(hx-9, -28+hy, CO, 18, 18);
        p(hx-8, -27+hy, FS, 16, 16);
        p(hx-7, -26+hy, FM, 14, 14);
        p(hx-6, -25+hy, FB, 12, 12);
        p(hx-8, -27+hy, FV, 16, 1);                                               // top highlight
        // Pointed bone-ear tips
        p(hx-8, -32+hy, CO, 4, 5); p(hx-7, -31+hy, BN, 2, 4);                     // L ear
        p(hx+4, -32+hy, CO, 4, 5); p(hx+5, -31+hy, BN, 2, 4);                     // R ear
        // HOLLOW EYE SOCKETS (deep black w/ tiny gold-fire pupil)
        p(hx-5, -22+hy, CO, 4, 4); p(hx+1, -22+hy, CO, 4, 4);
        p(hx-4, -21+hy, HE, 2, 2); p(hx+2, -21+hy, HE, 2, 2);
        p(hx-3, -20+hy, HEL, 1, 1); p(hx+3, -20+hy, HEL, 1, 1);
        ctx.save(); ctx.globalAlpha = 0.80 + pulse * 0.20;
        pEnemy(ctx,cx,cy,hx-4,-21+hy,HEL,2,2,S);
        pEnemy(ctx,cx,cy,hx+2,-21+hy,HEL,2,2,S);
        ctx.restore();
        // Skeletal snout w/ bare fangs (NO blood)
        p(hx-4, -16+hy, CO, 8, 5);
        p(hx-3, -15+hy, FS, 6, 3);
        p(hx-3, -12+hy, CO, 6, 2);                                                // mouth gap
        p(hx-2, -12+hy, BN, 1, 2); p(hx, -12+hy, BN, 1, 2); p(hx+2, -12+hy, BN, 1, 2); // 3 fangs
        // Slow ghost-saliva drip (pale, not blood)
        ctx.save(); ctx.globalAlpha = 0.55;
        pEnemy(ctx,cx,cy,hx-1,-10+drool*5+hy,BN,1,2,S);
        ctx.restore();
    }

    // ── TAIL (skeletal — spinal segments)
    for (let t = 0; t < 4; t++) {
        const ty = 22 + t * 4;
        p(20+t*2, ty, CO, 4, 3); p(21+t*2, ty, BN, 2, 1);
    }
}

/**
 * --- CHARON (Boss 20) ---
 */
function drawCharon(cx, cy, enemy) {
    const now    = Date.now();
    const S = 2.0;
    const floatY = Math.sin(now * 0.002) * 10;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy + floatY, col, w, h, S);
    const ep     = (Math.sin(now * 0.004) + 1) / 2;
    const ripple = Math.sin(now * 0.005) * 2;
    const wispT  = now * 0.0014;
    const CO='#000';
    const WD0='#1A0A04', WD1='#2C1408', WD2='#3E2010', WD3='#5A3018', WDH='#7A4A28'; // dark stygian wood
    const RS='#080008', RM='#140010', RB='#241820';                                // robe shroud (deep)
    const SH='#3A2A3A', SHL='#5A4858';                                             // robe highlight
    const BN='#E0DCD0', BH='#F5F0E8';                                              // skeletal pale bone
    const CY1='#0099CC', CY='#00E5FF', CW='#B2EBF2', CG='#E0FFFF';                 // soul-flame cyan
    const SS='#1A2E1E';                                                            // Styx water dark

    // ── soul aura (cold cyan)
    ctx.save(); ctx.globalAlpha = 0.18 + ep * 0.22;
    pEnemy(ctx,cx,cy,-40,-50+floatY,CY,80,82,S);
    ctx.restore();

    // ── STYX WATER UNDER BOAT (ripple)
    ctx.save(); ctx.globalAlpha = 0.40 + ep * 0.20;
    pEnemy(ctx,cx,cy,-42,28+ripple,SS,84,5,S);
    pEnemy(ctx,cx,cy,-40,32+ripple,SS,80,3,S);
    ctx.restore();
    // Cyan reflection ripples
    p(-38,28+ripple,CY,12,1); p(-22,30+ripple,CY,10,1); p( 8,28+ripple,CY,14,1); p(24,30+ripple,CY,8,1);

    // ── STYGIAN BOAT (skeletal-curved hull)
    p(-38,10,CO,76,18);
    p(-37,11,WD1,74,16);
    p(-36,12,WD2,72,14);
    p(-35,13,WD3,70,12);
    p(-37,11,WDH,74,1);                                                           // top highlight
    // Hull ribs (5 dark vertical lines, like skeletal bones)
    for (let r = 0; r < 5; r++) { p(-30+r*14, 14, CO, 1, 12); }
    // Curved bow (left point)
    p(-42, 14, CO, 5, 8); p(-41, 15, WD2, 3, 6); p(-41, 15, WD3, 3, 1);
    p(-44, 16, CO, 3, 4); p(-43, 17, WD2, 1, 2);
    // Curved stern (right point)
    p(36, 14, CO, 6, 8); p(37, 15, WD2, 4, 6); p(37, 15, WD3, 4, 1);
    p(40, 16, CO, 3, 4); p(40, 17, WD2, 2, 2);
    // Stern lantern (small, glowing cyan soul flame)
    p(38, 4, CO, 3, 8); p(39, 5, WD2, 1, 6);                                      // lantern pole
    p(36, -2, CO, 7, 8); p(37, -1, WD2, 5, 6); p(38, 0, CY, 3, 4);
    ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
    pEnemy(ctx,cx,cy,36,-2+floatY,CW,7,8,S);
    ctx.restore();

    // ── 3 LOST SOUL WISPS (chained inside boat)
    for (let i = 0; i < 3; i++) {
        const wx = -20 + i * 14;
        const wy = 8 + Math.sin(wispT + i * 1.2) * 2;
        ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.25;
        pEnemy(ctx,cx,cy,wx-2,wy+floatY,CW,5,4,S);
        ctx.restore();
        // Tiny face inside wisp (hollow black sockets)
        p(wx-1, wy+1+floatY*0, CO, 1, 1); p(wx+1, wy+1+floatY*0, CO, 1, 1);
        p(wx, wy+3+floatY*0, CO, 1, 1);                                           // silent-scream mouth
    }

    // ── TOWERING CHARON FIGURE (deep hood, faceless)
    // Lower robe (wide, draped over boat)
    p(-14, -4, CO, 28, 18);
    p(-13, -3, RS, 26, 16);
    p(-12, -2, RM, 24, 14);
    p(-11, -1, RB, 22, 12);
    p(-13, -3, SHL, 26, 1);                                                       // top highlight
    // Upper robe (narrower, taller)
    p(-12, -28, CO, 24, 26);
    p(-11, -27, RS, 22, 24);
    p(-10, -26, RM, 20, 22);
    p(-9, -25, RB, 18, 20);
    p(-11, -27, SHL, 22, 1);
    // Tattered robe edge
    p(-14, 14, CO, 4, 4); p(-8, 14, CO, 3, 4); p(-2, 14, CO, 3, 4); p( 4, 14, CO, 3, 4); p(10, 14, CO, 4, 4);

    // ── DEEP HOOD (skull-shape, taller)
    p(-12, -42, CO, 24, 18);
    p(-11, -41, RS, 22, 16);
    p(-10, -40, RM, 20, 14);
    p(-11, -41, SHL, 22, 1);
    // Peak fold
    p(-9, -46, CO, 18, 5); p(-8, -45, RS, 16, 3);
    p(-7, -48, CO, 14, 3); p(-6, -47, RM, 12, 2);
    // Inner hood shadow (deep)
    p(-9, -38, CO, 18, 12);
    p(-8, -37, RS, 16, 10);

    // ── HOLLOW EYE in hood (single glowing socket)
    p(-3, -34, CO, 6, 4); p(-2, -33, CY, 4, 2); p(-1, -32, CW, 2, 1);
    ctx.save(); ctx.globalAlpha = 0.85 + ep * 0.15;
    pEnemy(ctx,cx,cy,-3,-34+floatY,CG,6,4,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.45 + ep * 0.30;                               // outer aura
    pEnemy(ctx,cx,cy,-6,-37+floatY,CY,12,10,S);
    ctx.restore();

    // ── SKELETAL ARMS GRIPPING OAR
    // Left arm (back, holding hull)
    p(-14, -8, CO, 4, 12); p(-13, -7, BN, 2, 10); p(-13, -7, BH, 2, 1);
    p(-15, 4, CO, 4, 4); p(-14, 5, BN, 2, 2);                                     // L hand
    // Right arm (forward, gripping oar)
    p(10, -16, CO, 4, 14); p(11, -15, BN, 2, 12); p(11, -15, BH, 2, 1);
    p(13, -2, CO, 4, 4); p(14, -1, BN, 2, 2);                                     // R hand on oar

    // ── MASSIVE GLOWING OAR (tall, ghost-flame tip)
    p(15, -50, CO, 5, 90);
    p(16, -49, WD2, 3, 88);
    p(16, -49, WD3, 3, 1);                                                        // top highlight
    p(16, -30, WDH, 3, 1); p(16, 6, WDH, 3, 1);                                   // grip bands
    // Oar blade (curved, glowing)
    p(13, -56, CO, 9, 10); p(14, -55, WD3, 7, 8); p(14, -55, WDH, 7, 1);
    p(15, -53, CY, 5, 5); p(16, -52, CW, 3, 3);
    p(13, 30, CO, 9, 10); p(14, 31, WD3, 7, 8); p(14, 31, WDH, 7, 1);
    p(15, 33, CY, 5, 5); p(16, 34, CW, 3, 3);
    ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
    pEnemy(ctx,cx,cy,13,-56+floatY,CW,9,10,S);
    pEnemy(ctx,cx,cy,13, 30+floatY,CW,9,10,S);
    ctx.restore();
}

/**
 * --- BEELZEBUB (Boss 30) ---
 */
function drawBeelzebub(cx, cy, enemy) {
    const now    = Date.now();
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, col, w, h, S);
    const pulse  = (Math.sin(now * 0.010) + 1) / 2;
    const flyT   = now * 0.004;
    const floatY = Math.sin(now * 0.002) * 3;
    const CO='#000';
    const WS='#1A0F0A', WM='#2E1F18', WB='#4E342E', WL='#6E4C3C';                 // tattered wing membrane
    const FS='#1A2A1A', FM='#2A3E2A', FB='#3E5A3E', FL='#5A7A5A', FV='#7E9E7E';    // sickly mottled flesh (NOT rotting)
    const BN='#D8D2C8', BH='#F0EAE0';                                              // pale ribcage bone
    const YE='#CCAA00', YEL='#FFEB00', YEH='#FFFCC0';                              // sickly fly-eye yellow
    const SH='#080208';                                                            // oozing void shadow

    // ── pestilence aura (sickly green-yellow)
    ctx.save(); ctx.globalAlpha = 0.20 + pulse * 0.20;
    pEnemy(ctx,cx,cy,-32,-30+floatY,FB,64,70,S);
    ctx.restore();

    // ── 4 TATTERED WINGS (2 per side, fluttering, fly-bitten holes)
    const wingF = Math.sin(now * 0.006) * 1.5;
    // Left upper wing
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.20;
    p(-46,-26+wingF,CO,12,22);
    p(-45,-25+wingF,WS,10,20);
    p(-44,-24+wingF,WM,8,18);
    p(-43,-23+wingF,WB,5,14);
    p(-45,-25+wingF,WL,10,1);
    ctx.restore();
    // Wing veins
    p(-44,-22+wingF,CO,1,18); p(-40,-22+wingF,CO,1,16); p(-37,-22+wingF,CO,1,14);
    // Holes/tears in wing
    p(-42,-18+wingF,CO,2,2); p(-39,-12+wingF,CO,2,2); p(-44,-6+wingF,CO,3,2);
    // Left lower wing (smaller)
    ctx.save(); ctx.globalAlpha = 0.50 + pulse * 0.15;
    p(-42, 0+wingF,CO,10,16); p(-41, 1+wingF,WS,8,14); p(-40, 2+wingF,WM,6,12);
    ctx.restore();
    p(-41, 4+wingF,CO,1,10); p(-38, 4+wingF,CO,1,8);
    p(-37, 6+wingF,CO,2,2);

    // Right upper wing (mirror)
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.20;
    p( 34,-26-wingF,CO,12,22);
    p( 35,-25-wingF,WS,10,20);
    p( 36,-24-wingF,WM,8,18);
    p( 37,-23-wingF,WB,5,14);
    p( 35,-25-wingF,WL,10,1);
    ctx.restore();
    p( 39,-22-wingF,CO,1,18); p( 43,-22-wingF,CO,1,16); p( 41,-22-wingF,CO,1,14);
    p( 36,-18-wingF,CO,2,2); p( 39,-12-wingF,CO,2,2); p( 42,-6-wingF,CO,3,2);
    // Right lower wing
    ctx.save(); ctx.globalAlpha = 0.50 + pulse * 0.15;
    p( 32, 0-wingF,CO,10,16); p( 33, 1-wingF,WS,8,14); p( 34, 2-wingF,WM,6,12);
    ctx.restore();
    p( 34, 4-wingF,CO,1,10); p( 37, 4-wingF,CO,1,8);
    p( 36, 6-wingF,CO,2,2);

    // ── BLOATED BODY (sickly mottled flesh, top-highlighted)
    p(-16,-16+floatY,CO,32,42);
    p(-15,-15+floatY,FS,30,40);
    p(-14,-14+floatY,FM,28,38);
    p(-13,-13+floatY,FB,26,36);
    p(-15,-15+floatY,FV,30,1);                                                    // top highlight
    // Mottled flesh spots (3 darker patches)
    p(-10,-8+floatY,FS,4,3); p( 4,-2+floatY,FS,5,4); p(-2,10+floatY,FS,4,3);

    // ── EXPOSED RIBCAGE (pale bone, NO blood — chest cavity opening)
    p(-10,-6+floatY,SH,20,16);                                                    // chest cavity (deep void)
    // 4 ribs (pale bone)
    for (let r = 0; r < 4; r++) {
        const ry = -4 + r * 4;
        p(-10, ry+floatY, BN, 20, 1);
        p(-10, ry+floatY, BH, 20, 1);
    }
    // Vertical spine peek (back)
    p(-1, -8+floatY, BN, 2, 18);

    // ── SWARM OF FLY-EYES (8 across body, multi-row)
    for (let i = 0; i < 8; i++) {
        const ex = -12 + (i % 4) * 8;
        const ey = -10 + Math.floor(i / 4) * 8;
        p(ex, ey+floatY, CO, 4, 4);
        p(ex+1, ey+1+floatY, YEL, 2, 2);
        p(ex+1, ey+1+floatY, YEH, 1, 1);
    }
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    pEnemy(ctx,cx,cy,-12,-10+floatY,YE,28,18,S);
    ctx.restore();

    // ── 12 ORBITING FLIES (swarm halo)
    for (let i = 0; i < 12; i++) {
        const a  = flyT + i * (Math.PI / 6);
        const fr = 28 + (i % 3) * 4;
        const fx = Math.cos(a) * fr;
        const fy = Math.sin(a) * fr * 0.6 - 8;
        p(fx-1, fy-1+floatY, CO, 3, 3);
        p(fx, fy+floatY, FB, 1, 1);
        // Tiny wing buzz
        p(fx-2, fy+floatY, FV, 1, 1); p(fx+2, fy+floatY, FV, 1, 1);
    }

    // ── HOLLOW RINGED EYE SOCKETS (massive head atop body — single dominant pair)
    p(-12,-26+floatY,CO,24,12);
    p(-11,-25+floatY,FS,22,10);
    p(-10,-24+floatY,FM,20,8);
    // Two hollow ringed sockets (yellow-fire)
    p(-10,-24+floatY,CO,8,8); p(-9,-23+floatY,SH,6,6);
    p(-8,-22+floatY,YE,4,4); p(-7,-21+floatY,YEL,2,2); p(-7,-21+floatY,YEH,1,1);
    p( 2,-24+floatY,CO,8,8); p( 3,-23+floatY,SH,6,6);
    p( 4,-22+floatY,YE,4,4); p( 5,-21+floatY,YEL,2,2); p( 5,-21+floatY,YEH,1,1);
    ctx.save(); ctx.globalAlpha = 0.85 + pulse * 0.15;
    pEnemy(ctx,cx,cy,-7,-21+floatY,YEH,2,2,S);
    pEnemy(ctx,cx,cy, 5,-21+floatY,YEH,2,2,S);
    ctx.restore();
    // Twitching antennae (2)
    p(-6,-32+floatY,CO,2,6); p(-5,-31+floatY,FB,1,5);
    p( 4,-32+floatY,CO,2,6); p( 5,-31+floatY,FB,1,5);

    // ── OOZING SHADOW DRIP (3 dark drops below body, no blood)
    const dripA = (now % 1500) / 1500;
    ctx.save(); ctx.globalAlpha = 0.65;
    pEnemy(ctx,cx,cy,-8, 26+dripA*8+floatY,SH,3,4,S);
    pEnemy(ctx,cx,cy, 3, 26+dripA*6+floatY,SH,3,4,S);
    pEnemy(ctx,cx,cy,-2, 28+dripA*10+floatY,SH,2,3,S);
    ctx.restore();
}

/**
 * --- LUCIFER (Boss 40) ---
 */
function drawLucifer(cx, cy, enemy) {
    const now    = Date.now();
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, col, w, h, S);
    const pulse  = (Math.sin(now * 0.004) + 1) / 2;
    const heart  = (Math.sin(now * 0.008) + 1) / 2;
    const floatY = Math.sin(now * 0.002) * 3;
    const wingF  = Math.sin(now * 0.003) * 1;
    const CO='#000';
    const WS='#0A0006', WM='#160010', WB='#241820', WL='#3A2A38', WV='#5A4858';   // tattered black wings
    const RS='#0A0F1F', RM='#1A237E', RB='#283593', RL='#3949AB', RV='#5C6BC0';   // dark royal blue
    const GS='#5A4000', GM='#9A6F00', GB='#FFD700', GL='#FFE57F', GH='#FFF8C0';   // gold (tarnished)
    const VS='#10001A', VL='#2A0040', VV='#4A0080', VH='#7B1FA2', VG='#9C27B0';   // void purple heart
    const BN='#D8D2C8', PSK='#7A6878';                                             // pale corpse skin
    const RD='#4A0008';                                                            // dried-blood (minimal, dark)

    // ── fallen-angel aura (deep void + faint gold)
    ctx.save(); ctx.globalAlpha = 0.22 + pulse * 0.22;
    pEnemy(ctx,cx,cy,-44,-44+floatY,VV,88,82,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.18 + pulse * 0.18;
    pEnemy(ctx,cx,cy,-30,-44+floatY,GM,60,84,S);
    ctx.restore();

    // ── 6 BROKEN TATTERED WINGS (3 per side, fallen + torn)
    // LEFT WINGS
    // Wing 1 (top, full-spread but broken at tip)
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.20;
    p(-48,-36+wingF,CO,30,16); p(-47,-35+wingF,WS,28,14); p(-46,-34+wingF,WM,25,12);
    p(-47,-35+wingF,WV,28,1);                                                     // top highlight
    ctx.restore();
    // Wing 1 ribs
    p(-46,-33+wingF,CO,1,12); p(-40,-33+wingF,CO,1,11); p(-34,-33+wingF,CO,1,10);
    // Wing 1 torn tips (jagged void gap)
    p(-19,-30+wingF,CO,4,3); p(-22,-26+wingF,CO,3,2);
    // Lost feathers (loose, falling)
    ctx.save(); ctx.globalAlpha = 0.50;
    pEnemy(ctx,cx,cy,-50,-20+wingF,WB,3,2,S);
    pEnemy(ctx,cx,cy,-48,-12+wingF,WB,2,2,S);
    ctx.restore();
    // Wing 2 (mid, shorter, drooping)
    ctx.save(); ctx.globalAlpha = 0.50 + pulse * 0.15;
    p(-44,-16+wingF,CO,26,14); p(-43,-15+wingF,WS,24,12); p(-42,-14+wingF,WM,21,10);
    ctx.restore();
    p(-42,-14+wingF,CO,1,10); p(-36,-14+wingF,CO,1,9); p(-30,-14+wingF,CO,1,8);
    p(-22,-10+wingF,CO,3,2); p(-26,-6+wingF,CO,3,2);
    // Wing 3 (lowest, broken/limp)
    ctx.save(); ctx.globalAlpha = 0.45 + pulse * 0.15;
    p(-38, 4+wingF,CO,22,14); p(-37, 5+wingF,WS,20,12); p(-36, 6+wingF,WM,17,10);
    ctx.restore();
    p(-36, 6+wingF,CO,1,10); p(-30, 6+wingF,CO,1,9); p(-24, 6+wingF,CO,1,8);
    p(-18, 10+wingF,CO,3,2); p(-22, 14+wingF,CO,4,2);

    // RIGHT WINGS (mirror)
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.20;
    p( 18,-36-wingF,CO,30,16); p( 19,-35-wingF,WS,28,14); p( 20,-34-wingF,WM,25,12);
    p( 19,-35-wingF,WV,28,1);
    ctx.restore();
    p( 21,-33-wingF,CO,1,12); p( 27,-33-wingF,CO,1,11); p( 33,-33-wingF,CO,1,10);
    p( 15,-30-wingF,CO,4,3); p( 19,-26-wingF,CO,3,2);
    ctx.save(); ctx.globalAlpha = 0.50;
    pEnemy(ctx,cx,cy,47,-20-wingF,WB,3,2,S);
    pEnemy(ctx,cx,cy,45,-12-wingF,WB,2,2,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.50 + pulse * 0.15;
    p( 18,-16-wingF,CO,26,14); p( 19,-15-wingF,WS,24,12); p( 20,-14-wingF,WM,21,10);
    ctx.restore();
    p( 22,-14-wingF,CO,1,10); p( 28,-14-wingF,CO,1,9); p( 34,-14-wingF,CO,1,8);
    p( 19,-10-wingF,CO,3,2); p( 23,-6-wingF,CO,3,2);
    ctx.save(); ctx.globalAlpha = 0.45 + pulse * 0.15;
    p( 16, 4-wingF,CO,22,14); p( 17, 5-wingF,WS,20,12); p( 18, 6-wingF,WM,17,10);
    ctx.restore();
    p( 20, 6-wingF,CO,1,10); p( 26, 6-wingF,CO,1,9); p( 32, 6-wingF,CO,1,8);
    p( 15, 10-wingF,CO,3,2); p( 18, 14-wingF,CO,4,2);

    // ── MAJESTIC FALLEN BODY (dark royal blue robes + tarnished gold trim)
    p(-14,-22+floatY,CO,28,50);
    p(-13,-21+floatY,RS,26,48);
    p(-12,-20+floatY,RM,24,46);
    p(-11,-19+floatY,RB,22,44);
    p(-13,-21+floatY,RV,26,1);                                                    // top highlight
    // Central gold stripe (column down chest)
    p(-4,-21+floatY,CO,8,46); p(-3,-20+floatY,GS,6,44);
    p(-3,-20+floatY,GM,6,42); p(-2,-19+floatY,GB,4,40); p(-1,-18+floatY,GL,2,38);
    // Gold side trims
    p(-14,-22+floatY,GM,2,50); p( 12,-22+floatY,GM,2,50);
    // Riveted royal seam
    for (let r = 0; r < 5; r++) { p(-12,-16+r*10+floatY,GB,1,1); p(11,-16+r*10+floatY,GB,1,1); }
    // Dried-blood drip from old wounds (minimal, dark)
    p(-9,-4+floatY,RD,2,4); p( 7,2+floatY,RD,2,5);

    // ── GLOWING VOID HEART (pulsing through chest)
    p(-4,-8+floatY,CO,8,8);
    p(-3,-7+floatY,VS,6,6);
    p(-3,-7+floatY,VL,6,1);                                                       // top highlight
    p(-2,-6+floatY,VV,4,4);
    p(-1,-5+floatY,VH,2,2);
    ctx.save(); ctx.globalAlpha = 0.70 + heart * 0.30;
    pEnemy(ctx,cx,cy,-4,-8+floatY,VG,8,8,S);
    ctx.restore();
    // Heart "veins" radiating outward
    p(-6,-2+floatY,VL,1,1); p(5,-2+floatY,VL,1,1); p(-6,-12+floatY,VL,1,1); p(5,-12+floatY,VL,1,1);

    // ── PALE GAUNT FACE (hollow void eyes, sunken)
    p(-10,-34+floatY,CO,20,14);
    p(-9,-33+floatY,PSK,18,12);
    p(-8,-32+floatY,'#9F8E9E',16,10);
    p(-9,-33+floatY,'#B0A0AE',18,1);                                              // top highlight
    // Sunken cheek shading
    p(-9,-26+floatY,CO,4,3); p(5,-26+floatY,CO,4,3);
    // HOLLOW VOID EYE SOCKETS (deep wells w/ purple-fire pupils)
    p(-7,-30+floatY,CO,5,5); p( 2,-30+floatY,CO,5,5);
    p(-6,-29+floatY,VS,3,3); p( 3,-29+floatY,VS,3,3);
    p(-5,-28+floatY,VV,1,1); p( 4,-28+floatY,VV,1,1);
    ctx.save(); ctx.globalAlpha = 0.90;
    pEnemy(ctx,cx,cy,-5,-28+floatY,VG,1,1,S);
    pEnemy(ctx,cx,cy, 4,-28+floatY,VG,1,1,S);
    ctx.restore();
    // Dark tear streaks (void weeping)
    p(-5,-25+floatY,VL,1,3); p( 4,-25+floatY,VL,1,3);
    // Mouth (grim, hollow void)
    p(-4,-22+floatY,CO,8,3); p(-3,-21+floatY,VS,6,1);

    // ── BROKEN CROWN (gold, multi-spire, ONE shattered)
    p(-12,-40+floatY,CO,24,4); p(-11,-39+floatY,GS,22,3); p(-11,-39+floatY,GM,22,1);
    p(-12,-40+floatY,GB,24,1);                                                    // gold base
    // 5 spires (center tallest, 2 broken)
    p(-10,-44+floatY,CO,3,5); p(-9,-43+floatY,GB,1,4);                            // L outer (intact)
    p(-6,-46+floatY,CO,3,3); p(-5,-45+floatY,GM,1,2);                             // L inner — BROKEN short
    p(-1,-50+floatY,CO,4,11); p( 0,-49+floatY,GM,2,10); p( 0,-49+floatY,GB,2,2);  // center
    p( 0,-53+floatY,CO,2,4); p( 1,-52+floatY,GL,1,3);
    p( 4,-46+floatY,CO,3,4); p( 5,-45+floatY,GM,1,3);                             // R inner
    p( 8,-44+floatY,CO,3,2); p( 9,-43+floatY,GM,1,1);                             // R outer — BROKEN short
    // Lost crown shard (drifting beside head)
    ctx.save(); ctx.globalAlpha = 0.55;
    pEnemy(ctx,cx,cy,11,-46+floatY,GB,1,3,S);
    pEnemy(ctx,cx,cy,-13,-44+floatY,GB,1,2,S);
    ctx.restore();

    // ── SHATTERED HALO BEHIND CROWN (broken golden ring fragments)
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    pEnemy(ctx,cx,cy,-16,-52+floatY,GB,8,2,S);                                    // L arc fragment
    pEnemy(ctx,cx,cy, 10,-52+floatY,GB,8,2,S);                                    // R arc fragment
    pEnemy(ctx,cx,cy,-12,-54+floatY,GL,2,1,S); pEnemy(ctx,cx,cy,12,-54+floatY,GL,2,1,S);
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
    p(-9,-22, EG, 18, 32);
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

/**
 * --- OBLIVION WRAITH (oblivion_wraith) ---
 * 망령: Void-dark wraith that fades in and out of existence.
 */
function drawOblivionWraith(cx, cy, enemy) {
    const now    = Date.now();
    const S = 2.0;
    const pulse  = (Math.sin(now * 0.003) + 1) / 2;
    const fade   = (Math.sin(now * 0.0015) + 1) / 2;
    const floatY = Math.sin(now * 0.0025) * 4;
    const hairF  = Math.sin(now * 0.002) * 1;
    const crackT = (Math.sin(now * 0.005) + 1) / 2;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, col, w, h, S);

    const CO='#000';
    const C1='#030310', C2='#07071C', C3='#0F0F30', C4='#1A1A45', CV='#2A2A60';
    const HR='#0A0A18', HRH='#1A1A30';                                             // long black hair
    const voidGlow = `rgba(50,0,120,${0.30+pulse*0.40})`;
    const eyeColor = `rgba(100,50,255,${0.50+pulse*0.45})`;
    const eyeDot   = `rgba(200,150,255,${0.85+pulse*0.15})`;
    const crackC   = `rgba(120,60,255,${0.45+crackT*0.40})`;                       // void crack glow
    const ghostAlpha = 0.30 + fade * 0.55;
    const AU = `rgba(60,30,100,${0.10+pulse*0.10})`;
    const VOID='#000005';

    // ── oblivion aura (always visible, low alpha)
    ctx.save(); ctx.globalAlpha = 0.20 + pulse * 0.18;
    p(-16,-32,AU,32,52);
    ctx.restore();

    // ── DRIFTING HAIR VEIL (long black hair flowing upward — vengeful spirit)
    ctx.save(); ctx.globalAlpha = 0.70;
    p(-7+hairF,-30,CO,14,4); p(-6+hairF,-29,HR,12,3);
    p(-2+hairF,-34,CO,5,7); p(-1+hairF,-33,HR,3,6); p(-1+hairF,-33,HRH,3,1);     // top tuft
    p(-8+hairF,-32,CO,4,5); p(-7+hairF,-31,HR,2,4);                              // L tuft
    p( 4+hairF,-32,CO,4,5); p( 5+hairF,-31,HR,2,4);                              // R tuft
    ctx.restore();
    // Trailing hair sides (long, down body)
    p(-9,-18,HR,1,18); p(-9,0,HR,1,8);
    p( 8,-18,HR,1,18); p( 8,0,HR,1,8);

    ctx.save();
    ctx.globalAlpha = ghostAlpha;

    // ── TALL SILHOUETTE
    p(-3,-25,CO,6,2); p(-5,-23,CO,10,2); p(-7,-21,CO,14,1);
    p(-8,-20,CO,1,16); p( 7,-20,CO,1,16); p(-8,-4,CO,16,1);
    p(-9,-3,CO,2,2); p( 7,-3,CO,2,2);
    p(-10,-1,CO,1,10); p( 9,-1,CO,1,10);

    // ── BODY FILL
    p(-2,-24,C1,4,2); p(-4,-22,C1,8,2);
    p(-7,-20,C2,14,16); p(-9,-2,C1,18,11); p(-7,-1,C2,14,9);
    p(-5,0,C3,10,7); p(-3,1,C4,6,5);
    // Top highlight
    p(-7,-20,CV,14,1); p(-9,-2,CV,18,1);

    ctx.restore();

    // ── VOID CRACKS across body (face/chest dissolving — purple glow)
    ctx.save(); ctx.globalAlpha = 0.55 + crackT * 0.35;
    p(-5,-10,crackC,1,8);                                                          // L vertical crack
    p( 4,-12,crackC,1,10);                                                         // R vertical crack
    p(-4,-2,crackC,8,1);                                                           // horizontal crack
    p(-2,2,crackC,1,5);
    p(-7,-15,crackC,4,1);                                                          // diagonal at face
    p( 3,-19,crackC,3,1);
    ctx.restore();

    // ── DEEP HOLLOW EYE SOCKETS (more void)
    p(-6,-17,CO,5,5); p( 1,-17,CO,5,5);
    p(-5,-16,VOID,3,3); p( 2,-16,VOID,3,3);
    p(-5,-16,eyeColor,2,2); p( 2,-16,eyeColor,2,2);
    p(-4,-15,eyeDot,1,1); p( 3,-15,eyeDot,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx,cx,cy + floatY * S,-4,-15,'#FFFFFF',1,1,S);
    pEnemy(ctx,cx,cy + floatY * S, 3,-15,'#FFFFFF',1,1,S);
    ctx.restore();
    // Outer eye-pit aura
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    p(-7,-18,voidGlow,5,5); p( 0,-18,voidGlow,5,5);
    ctx.restore();
    // Tear-streak dissolution (void weeping)
    ctx.save(); ctx.globalAlpha = 0.65;
    pEnemy(ctx,cx,cy + floatY * S,-4,-12,crackC,1,4,S);
    pEnemy(ctx,cx,cy + floatY * S, 3,-12,crackC,1,4,S);
    ctx.restore();

    // ── SILENT-SCREAM MOUTH (void-pit, gaping)
    p(-3,-10,CO,6,4); p(-2,-9,VOID,4,2);

    // ── VOID AURA STREAKS (sides — wider)
    ctx.save(); ctx.globalAlpha = 0.45 + pulse * 0.30;
    p(-16,-22,voidGlow,5,12); p(11,-20,voidGlow,5,10);
    p(-16, -8,voidGlow,4, 8); p(12, -8,voidGlow,4, 8);
    ctx.restore();

    // ── TATTERED STREAMING TAILS (more, longer)
    ctx.save(); ctx.globalAlpha = 0.65 + pulse * 0.25;
    p(-9,9,C1,3,10); p(-9,19,CO,2,5);
    p(-5,9,C2,3,12); p(-4,21,C1,2,5);
    p(-1,9,C2,4,14); p( 0,23,C1,2,5); p( 1,28,CO,1,3);                            // center longest
    p( 4,9,C2,3,12); p( 5,21,C1,2,5);
    p( 7,9,C1,3,10); p( 7,19,CO,2,5);
    ctx.restore();
}

/**
 * --- UNREPENTANT (unrepentant) ---
 * 망령: Armored defiant spirit; evades ranged attacks with high evasion.
 */
function drawUnrepentant(cx, cy, enemy) {
    const now = Date.now();
    const S = 2.0;
    const pulse = (Math.sin(now * 0.004) + 1) / 2;
    const p = (ox, oy, color, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, color, w, h, S);

    const CO = '#000000';
    const ARM  = '#1C1C1C';
    const ARM2 = '#2E2E2E';
    const ARM3 = '#454545';
    const SP1  = '#0D0020';
    const SP2  = '#180038';
    const SP3  = '#280055';
    const angerGlow = `rgba(200, 0, 0, ${0.3 + pulse * 0.5})`;
    const eyeColor  = `rgba(255, 100, 0, ${0.7 + pulse * 0.3})`;

    ctx.save();
    ctx.globalAlpha = 0.92;

    // Anger aura
    ctx.save();
    ctx.globalAlpha = 0.12 + pulse * 0.14;
    p(-12,-16,angerGlow,24,30);
    ctx.restore();

    // Helmet
    p(-7,-25,CO,14, 2); p(-8,-23,CO,16, 1);
    p(-9,-22,CO, 1,10); p( 8,-22,CO, 1,10);
    p(-9,-12,CO,18, 1);
    p(-7,-24,ARM,14, 2); p(-8,-22,ARM2,16,10); p(-5,-21,ARM3,10, 8);

    // ── HOLLOW VOID VISOR (deep + dual ember pinpoint eyes)
    p(-6,-19,CO,12,5); p(-5,-18,'#000005',10,3);
    p(-4,-17,eyeColor,2,1); p( 2,-17,eyeColor,2,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy,-3,-17,'#FFCC80',1,1,S);
    pEnemy(ctx, cx, cy, 3,-17,'#FFCC80',1,1,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    p(-5,-18,eyeColor,10,3);
    ctx.restore();
    // Exposed pale-bone neck gap
    p(-3,-10,'#000005',6,2); p(-3,-10,'#D8C0A8',6,1);

    // Shoulder guards
    p(-14,-13,CO, 6, 6); p( 8,-13,CO, 6, 6);
    p(-13,-12,ARM, 4, 4); p( 9,-12,ARM, 4, 4);
    p(-12,-11,ARM3, 2, 2); p(10,-11,ARM3, 2, 2);

    // Body armor
    p(-8,-11,CO,16,18); p(-7,-10,ARM,14,16);
    p(-5, -9,ARM2,10,14); p(-3,-8,ARM3, 6,12);

    // Spirit essence through cracks
    ctx.save();
    ctx.globalAlpha = 0.45;
    p(-6,-8,SP1,12,14); p(-4,-7,SP2, 8,12); p(-2,-6,SP3, 4,10);
    ctx.restore();

    // Legs
    p(-7, 7,CO, 5,12); p( 2, 7,CO, 5,12);
    p(-6, 8,ARM, 3,10); p(3, 8,ARM, 3,10);
    ctx.restore();
}

// ══════════════════════════════════════════════════════════════════════
// 악령 (Spirit) — 3 New Types
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
    p(-14,-25,regenColor,28,50);
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
    p(-22,-26,fearColor,44,48);
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

/**
 * --- SHADOW TITAN (shadow_titan) ---
 * 악마: Massive near-black giant; enormous HP and defence.
 */
function drawShadowTitan(cx, cy, enemy) {
    const now = Date.now();
    const S = 2.0;
    const pulse = (Math.sin(now * 0.003) + 1) / 2;
    const p = (ox, oy, color, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, color, w, h, S);

    const CO = '#000000';
    const C1 = '#020204';
    const C2 = '#06060C';
    const C3 = '#0A0A14';
    const C4 = '#101020';
    const C5 = '#181828';
    const shadowAura = `rgba(20,0,40,${0.08+pulse*0.12})`;
    const eyeColor   = `rgba(80,0,200,${0.6+pulse*0.4})`;
    const eyeBright  = `rgba(180,100,255,${0.5+pulse*0.4})`;

    ctx.save();
    ctx.globalAlpha = 0.96;

    // Shadow aura
    ctx.save();
    ctx.globalAlpha = 0.12 + pulse * 0.10;
    p(-20,-35,shadowAura,40,65);
    ctx.restore();

    // Huge head
    p(-10,-35,CO,20, 2); p(-12,-33,CO,24, 1);
    p(-13,-32,CO, 1,18); p(12,-32,CO, 1,18);
    p(-12,-14,CO,24, 1);
    p(-10,-33,C1,20,19); p(-8,-32,C2,16,17);
    p(-6,-31,C3,12,15); p(-4,-30,C4, 8, 5); p(-2,-29,C5, 4, 3);

    // Brow ridge
    p(-11,-20,CO,22, 3); p(-10,-20,C1,20, 2);

    // ── DEEP HOLLOW VOID EYE SOCKETS (purple-fire pinpoint)
    p(-9,-27,CO,7,7); p( 2,-27,CO,7,7);
    p(-8,-26,'#000005',5,5); p( 3,-26,'#000005',5,5);
    p(-7,-25,eyeColor,3,2); p( 4,-25,eyeColor,3,2);
    p(-6,-24,eyeBright,1,1); p( 5,-24,eyeBright,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy,-6,-24,'#FFFFFF',1,1,S);
    pEnemy(ctx, cx, cy, 5,-24,'#FFFFFF',1,1,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    p(-10,-28,eyeColor,8,8); p( 1,-28,eyeColor,8,8);
    ctx.restore();

    // ── SILENT-SCREAM GIANT VOID MAW (pale bone fangs)
    p(-8,-17,CO,16,2);
    p(-7,-15,'#000005',14,3);
    for (let i = 0; i < 5; i++) p(-7 + i*3, -15, '#D8C0A8', 2, 3);                // 5 pale bone fangs
    p(-8,-12,CO,16,1);

    // Massive body
    p(-16,-13,CO,32, 1); p(-18,-12,CO, 1,32); p(17,-12,CO, 1,32); p(-16,20,CO,32, 1);
    p(-17,-12,C1,34,32); p(-15,-11,C2,30,30); p(-12,-10,C3,24,28);
    p(-9, -9,C4,18,26); p(-6,-8,C5,12,20); p(-4,-6,CO, 8, 4);

    // Boulder shoulders
    p(-22,-14,CO, 6, 8); p(-21,-13,C1, 4, 6);
    p( 16,-14,CO, 6, 8); p( 17,-13,C1, 4, 6);

    // Thick legs
    p(-14,21,CO,10,14); p( 4,21,CO,10,14);
    p(-13,22,C1, 8,12); p( 5,22,C1, 8,12);
    p(-11,23,C2, 4,10); p( 7,23,C2, 4,10);
    ctx.restore();
}

/**
 * --- LAVA LORD (lava_lord) ---
 * 악마: Rock-armoured magma demon; accelerates nearby enemies when hit.
 */
function drawLavaLord(cx, cy, enemy) {
    const now = Date.now();
    const S = 2.0;
    const pulse     = (Math.sin(now * 0.007) + 1) / 2;
    const firePulse = (Math.sin(now * 0.012) + 1) / 2;
    const p = (ox, oy, color, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, color, w, h, S);

    const CO    = '#000000';
    const ROCK1 = '#1A0A00';
    const ROCK2 = '#2E1400';
    const ROCK3 = '#422200';
    const LAVA1 = `rgba(255,80,0,${0.7+firePulse*0.3})`;
    const LAVA2 = `rgba(255,200,0,${0.5+pulse*0.4})`;
    const CRACK = `rgba(255,150,0,${0.6+pulse*0.3})`;
    const eyeCol = `rgba(255,220,0,${0.8+pulse*0.2})`;

    ctx.save();
    ctx.globalAlpha = 0.96;

    // Magma spikes crown
    p(-1,-30,CO, 2, 4); p(-3,-28,CO, 2, 5); p(1,-29,CO, 2, 4); p(-5,-26,CO, 2, 3);
    ctx.save();
    ctx.globalAlpha = 0.8 + firePulse * 0.2;
    p( 0,-29,LAVA1, 2, 3); p(-2,-27,LAVA1, 2, 4); p(2,-28,LAVA1, 2, 3);
    ctx.restore();

    // Head (rocky)
    p(-8,-25,CO,16, 1); p(-9,-24,CO,18, 1);
    p(-10,-23,CO, 1,14); p( 9,-23,CO, 1,14); p(-9,-9,CO,18, 1);
    p(-10,-23,ROCK1,20,14); p(-8,-22,ROCK2,16,12); p(-6,-21,ROCK3,12,10);

    // Lava cracks on face
    ctx.save();
    ctx.globalAlpha = 0.7 + pulse * 0.2;
    p(-5,-20,CRACK, 2, 8); p(2,-22,CRACK, 2,10); p(-2,-18,CRACK, 3, 4);
    ctx.restore();

    // ── HOLLOW BURNING VOID EYE SOCKETS (lava-gold pinpoint)
    p(-8,-20,CO,6,5); p( 2,-20,CO,6,5);
    p(-7,-19,'#000005',4,3); p( 3,-19,'#000005',4,3);
    p(-6,-18,eyeCol,2,1); p( 4,-18,eyeCol,2,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy,-6,-18,'#FFFFCC',1,1,S);
    pEnemy(ctx, cx, cy, 4,-18,'#FFFFCC',1,1,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    p(-9,-21,LAVA1,7,7); p( 1,-21,LAVA1,7,7);
    ctx.restore();

    // ── SILENT-SCREAM MOLTEN MAW (pale bone fangs)
    p(-6,-13,CO,12,3); p(-5,-12,'#000005',10,2);
    p(-5,-12,'#D8C0A8',1,2); p(-2,-12,'#D8C0A8',1,2); p( 1,-12,'#D8C0A8',1,2); p( 4,-12,'#D8C0A8',1,2);

    // Heavy body
    p(-12,-8,CO,24, 1); p(-14,-7,CO, 1,24); p(13,-7,CO, 1,24); p(-12,17,CO,24, 1);
    p(-13,-7,ROCK1,26,24); p(-11,-6,ROCK2,22,22); p(-9,-5,ROCK3,18,20);

    // Lava veins on body
    ctx.save();
    ctx.globalAlpha = 0.65 + firePulse * 0.25;
    p(-6,-4,LAVA1, 4,14); p(2,-2,LAVA1, 3,10); p(-9, 2,CRACK, 3, 8);
    p(-4, 5,LAVA2, 4, 6); p(4,  0,LAVA2, 2, 6);
    ctx.restore();

    // Arms + legs
    p(-18,-7,CO, 5, 5); p(-17,-6,ROCK2, 3, 4);
    p( 13,-7,CO, 5, 5); p( 14,-6,ROCK2, 3, 4);
    p(-10,18,CO, 8,10); p(2,18,CO, 8,10);
    p( -9,19,ROCK1, 6, 8); p(3,19,ROCK1, 6, 8);
    ctx.restore();
}

/**
 * --- TIME RAVAGER (time_ravager) ---
 * 악마: Hourglass demon; slows all nearby unit attack speeds.
 */
function drawTimeRavager(cx, cy, enemy) {
    const now = Date.now();
    const S = 2.0;
    const pulse    = (Math.sin(now * 0.004) + 1) / 2;
    const sandFall = (now * 0.003) % 1;
    const p = (ox, oy, color, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, color, w, h, S);

    const CO    = '#000000';
    const C1    = '#0A0820';
    const C2    = '#141035';
    const C3    = '#1E184A';
    const GOLD1 = '#3A2800';
    const GOLD2 = '#604000';
    const GOLD3 = '#906000';
    const sandColor = `rgba(200,150,0,${0.5+pulse*0.4})`;
    const timeGlow  = `rgba(100,50,255,${0.20+pulse*0.30})`;
    const eyeColor  = `rgba(150,100,255,${0.7+pulse*0.3})`;

    ctx.save();
    ctx.globalAlpha = 0.92;

    // Time-distortion aura
    ctx.save();
    ctx.globalAlpha = 0.10 + pulse * 0.14;
    p(-16,-30,timeGlow,32,55);
    ctx.restore();

    // Upper orb (head)
    p(-7,-28,CO,14, 1); p(-8,-27,CO,16, 1);
    p(-9,-26,CO, 1,10); p( 8,-26,CO, 1,10);
    p(-8,-16,CO,16, 1); p(-7,-15,CO,14, 1);
    p(-8,-26,C1,16,10); p(-6,-25,C2,12, 8); p(-4,-24,C3, 8, 6);

    // ── HOLLOW TIME-VOID EYE SOCKETS (purple pinpoint)
    p(-6,-24,CO,4,4); p( 2,-24,CO,4,4);
    p(-5,-23,'#000005',2,2); p( 3,-23,'#000005',2,2);
    p(-5,-23,eyeColor,1,1); p( 3,-23,eyeColor,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy,-5,-23,'#E1BEE7',1,1,S);
    pEnemy(ctx, cx, cy, 3,-23,'#E1BEE7',1,1,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    p(-7,-25,eyeColor,6,6); p( 1,-25,eyeColor,6,6);
    ctx.restore();

    // Golden frame at waist
    p(-10,-14,GOLD1, 2, 3); p( 8,-14,GOLD1, 2, 3);
    p(-9,-13,GOLD2,  2, 2); p( 7,-13,GOLD2, 2, 2);
    p(-8,-12,GOLD3,  2, 2); p( 6,-12,GOLD3, 2, 2);

    // Neck and waist
    p(-4,-11,GOLD1, 8, 2); p(-3,-10,GOLD2, 6, 3); p(-2,-9,GOLD3, 4, 2);
    p(-4, -6,GOLD1, 8, 2); p(-3, -8,GOLD2, 6, 3);

    // Falling sand
    ctx.save();
    ctx.globalAlpha = 0.6 + pulse * 0.3;
    p(-2, -23 + Math.round(sandFall * 10), sandColor, 4, 2);
    p(-1, -20 + Math.round(sandFall *  8), sandColor, 2, 2);
    p(-1,  -9 + Math.round(sandFall *  3), sandColor, 2, 3);
    ctx.restore();

    // Lower orb (body)
    p(-9,-4,CO, 1,12); p( 8,-4,CO, 1,12);
    p(-8, 8,CO,16, 1); p(-7, 9,CO,14, 1);
    p(-9,-4,C1,18,12); p(-7,-3,C2,14,10); p(-5,-2,C3,10, 8);

    // Tentacle legs
    p(-8,10,C1, 3, 8); p(-7,18,CO, 2, 4);
    p(-2,10,C1, 4, 9); p(-1,19,CO, 2, 4); p(0, 23,CO, 1, 2);
    p( 5,10,C1, 3, 7); p( 6,17,CO, 2, 4);
    ctx.restore();
}

/**
 * --- VOID MASTER (void_master) ---
 * 악마: Orb of pure void with rotating tentacles; randomly nullifies 20% damage.
 */
function drawVoidMaster(cx, cy, enemy) {
    const now = Date.now();
    const S = 2.0;
    const pulse = (Math.sin(now * 0.003) + 1) / 2;
    const rot   = now * 0.001;
    const p = (ox, oy, color, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, color, w, h, S);

    const CO  = '#000000';
    const V1  = '#020206';
    const V2  = '#05050F';
    const V3  = '#08081A';
    const V4  = '#0C0C26';
    const V5  = '#101035';
    const voidEdge  = `rgba(50,0,100,${0.4+pulse*0.4})`;
    const nullColor = `rgba(0,200,255,${0.15+pulse*0.2})`;
    const eyeColor  = `rgba(0,150,255,${0.7+pulse*0.3})`;
    const pupil     = `rgba(0,50,150,${0.8+pulse*0.2})`;

    ctx.save();
    ctx.globalAlpha = 0.94;

    // Void nullification aura
    ctx.save();
    ctx.globalAlpha = 0.10 + pulse * 0.12;
    p(-20,-25,nullColor,40,50);
    ctx.restore();

    // Rotating tentacles
    for (let i = 0; i < 6; i++) {
        const angle = rot + (i / 6) * Math.PI * 2;
        const tx = Math.round(Math.cos(angle) * 15);
        const ty = Math.round(Math.sin(angle) * 12);
        const tLen = Math.round(8 + Math.sin(rot * 2 + i) * 3);
        ctx.save();
        ctx.globalAlpha = 0.40 + pulse * 0.30;
        pEnemy(ctx, cx + tx * S, cy + ty * S, -1, 0, V3, 2, tLen, S);
        pEnemy(ctx, cx + tx * S, cy + ty * S, -1, tLen, V2, 2, 3, S);
        ctx.restore();
    }

    // Main orb outline + fill
    p(-12,-15,CO,24, 1); p(-14,-14,CO,28, 1);
    p(-15,-13,CO, 1,26); p(14,-13,CO, 1,26);
    p(-14, 13,CO,28, 1); p(-12,14,CO,24, 1);
    p(-14,-13,V1,28,26); p(-12,-12,V2,24,24); p(-10,-11,V3,20,22);
    p(-8,-10,V4,16,20); p(-6,-9,V5,12,18); p(-4,-7,V4, 8,14);

    // Void edge pulse
    ctx.save();
    ctx.globalAlpha = 0.20 + pulse * 0.25;
    p(-15,-14,voidEdge,30,28);
    ctx.restore();

    // ── CENTRAL HOLLOW VOID-EYE (deep void w/ cyan pupil ring)
    p(-6,-6,CO,12,12); p(-5,-5,'#000005',10,10);
    p(-4,-4,eyeColor,8,8);
    p(-3,-3,pupil,6,6); p(-2,-2,CO,4,4); p(-1,-1,'#000005',2,2);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy,-1,-1,'#B2EBF2',1,1,S);                                    // bright pinpoint
    ctx.restore();
    // Catch-light
    p(-4,-4,'#B2EBF2',2,2);

    // ── SATELLITE HOLLOW EYE SOCKETS
    p(-10,-8,CO,3,3); p( 7,-6,CO,3,3);
    p(-10,-8,'#000005',2,1); p( 7,-6,'#000005',2,1);
    p(-9,-7,eyeColor,1,1); p( 8,-5,eyeColor,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy,-9,-7,'#B2EBF2',1,1,S);
    pEnemy(ctx, cx, cy, 8,-5,'#B2EBF2',1,1,S);
    ctx.restore();
    ctx.restore();
}

/**
 * --- SIN INCARNATE (sin_incarnate) ---
 * 악마: Multi-eyed corruption blob; defence scales with damage taken.
 */
function drawSinIncarnate(cx, cy, enemy) {
    const now = Date.now();
    const S = 2.0;
    const pulse       = (Math.sin(now * 0.005) + 1) / 2;
    const corruptPulse = (Math.sin(now * 0.008) + 1) / 2;
    const p = (ox, oy, color, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, color, w, h, S);

    const CO  = '#000000';
    const C1  = '#140020';
    const C2  = '#220036';
    const C3  = '#320050';
    const C4  = '#440068';
    const C5  = '#5A0080';
    const corruptColor = `rgba(100,0,200,${0.2+corruptPulse*0.3})`;
    const eyeColor     = `rgba(255,50,200,${0.6+pulse*0.4})`;
    const growColor    = `rgba(180,0,255,${0.12+pulse*0.18})`;

    ctx.save();
    ctx.globalAlpha = 0.93;

    // Corruption growth aura
    ctx.save();
    ctx.globalAlpha = 0.12 + corruptPulse * 0.15;
    p(-18,-25,growColor,36,55);
    ctx.restore();

    // Irregular body
    p(-8,-24,CO,16, 2); p(-10,-22,CO,20, 1);
    p(-12,-21,CO, 1,22); p(11,-21,CO, 1,22);
    p(-10,  1,CO,20, 1); p(-8,  2,CO,16, 1);
    p(-11,-21,C1,22,22); p(-9,-20,C2,18,20);
    p(-7,-19,C3,14,18); p(-5,-18,C4,10,16); p(-3,-17,C5, 6,14);

    // Corruption veins
    ctx.save();
    ctx.globalAlpha = 0.30 + corruptPulse * 0.40;
    p(-8,-15,corruptColor, 2,16); p(-4,-20,corruptColor, 2,14);
    p( 4,-17,corruptColor, 2,12); p(-1,-10,corruptColor, 2,10);
    ctx.restore();

    // ── HOLLOW SIN-VOID EYE SOCKETS scattered (deep + magenta-fire pinpoint)
    const sinEyes = [[-8,-18],[4,-16],[-5,-12],[2,-8],[-7,-6],[4,-4],[-3,0],[0,-18]];
    for (const [ex, ey] of sinEyes) {
        p(ex, ey, CO, 3, 3);
        p(ex, ey, '#000005', 3, 1);
        p(ex+1, ey+1, eyeColor, 1, 1);
        ctx.save(); ctx.globalAlpha = 0.95;
        pEnemy(ctx, cx, cy, ex+1, ey+1, '#FFCCFF', 1, 1, S);
        ctx.restore();
    }

    // ── SILENT-SCREAM CENTRAL VOID MAW (pale bone fangs)
    p(-4,-9,CO,8,1);
    p(-5,-8,'#000005',10,4);
    p(-4,-8,'#D8C0A8',1,3); p(-1,-8,'#D8C0A8',1,3); p( 2,-8,'#D8C0A8',1,3);        // 3 pale fangs
    p(-4,-4,CO,8,1);

    // Tentacle limbs
    p(-15,-15,C1, 3,12); p(-15,-3,CO, 2, 4);
    p( 12,-13,C1, 3,10); p( 13,-3,CO, 2, 3);
    p(-12,  3,C1, 2, 8); p(-11,11,CO, 2, 3);
    p( 10,  2,C1, 2, 7); p( 11, 9,CO, 2, 3);
    ctx.restore();
}

/**
 * --- CORRUPTION APOSTLE (corruption_apostle) ---
 * 악마: Towering dark-robed preacher; the gravest demon added so far.
 */
function drawCorruptionApostle(cx, cy, enemy) {
    const now = Date.now();
    const S = 2.0;
    const pulse  = (Math.sin(now * 0.003) + 1) / 2;
    const floatY = Math.sin(now * 0.0015) * 5;
    const p = (ox, oy, color, w=1, h=1) => pEnemy(ctx, cx, cy + floatY * S, ox, oy, color, w, h, S);

    const CO     = '#000000';
    const ROBE1  = '#050010';
    const ROBE2  = '#0A001A';
    const ROBE3  = '#100028';
    const ROBE4  = '#180038';
    const ROBE5  = '#220050';
    const darkHalo   = `rgba(80,0,150,${0.20+pulse*0.25})`;
    const corruptGold = `rgba(100,50,0,${0.5+pulse*0.4})`;
    const eyeColor   = `rgba(200,0,255,${0.7+pulse*0.3})`;
    const darkBlood  = `rgba(100,0,50,${0.3+pulse*0.3})`;

    ctx.save();
    ctx.globalAlpha = 0.96;

    // Inverted dark halo
    ctx.save();
    ctx.globalAlpha = 0.14 + pulse * 0.18;
    p(-14,-40,darkHalo,28, 6);
    ctx.restore();

    // Tall hood
    p(-4,-36,CO, 8, 2); p(-6,-34,CO,12, 2); p(-8,-32,CO,16, 2); p(-9,-30,CO,18, 2);
    p(-10,-28,CO, 1,14); p( 9,-28,CO, 1,14); p(-9,-14,CO,18, 1);
    p(-3,-35,ROBE1, 6, 2); p(-5,-33,ROBE2,10, 2);
    p(-7,-31,ROBE3,14, 2); p(-8,-29,ROBE4,16,15); p(-6,-28,ROBE5,12,13);

    // Hood shadow
    p(-7,-27,CO,14,11); p(-6,-26,ROBE1,12, 9);

    // ── HOLLOW VOID EYE SOCKETS in deep hood (magenta-fire pinpoint)
    p(-5,-24,CO,4,4); p( 2,-24,CO,4,4);
    p(-5,-24,'#000005',3,2); p( 2,-24,'#000005',3,2);
    p(-4,-23,eyeColor,1,1); p( 3,-23,eyeColor,1,1);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx, cx, cy + floatY * S,-4,-23,'#FFCCFF',1,1,S);
    pEnemy(ctx, cx, cy + floatY * S, 3,-23,'#FFCCFF',1,1,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    p(-6,-25,eyeColor,5,5); p( 1,-25,eyeColor,5,5);
    ctx.restore();
    // Silent-scream void mouth peeking from hood
    p(-2,-19,CO,4,2); p(-1,-18,'#000005',2,1);

    // Corrupt golden symbol on chest
    ctx.save();
    ctx.globalAlpha = 0.40 + pulse * 0.40;
    p(-3,-20,corruptGold, 6, 1); p(-1,-22,corruptGold, 1, 5);
    ctx.restore();

    // Wide robe body
    p(-12,-13,CO,24, 1); p(-14,-12,CO, 1,28); p(13,-12,CO, 1,28); p(-12,16,CO,24, 1);
    p(-13,-12,ROBE1,26,28); p(-11,-11,ROBE2,22,26);
    p(-9,-10,ROBE3,18,24); p(-7,-9,ROBE4,14,22); p(-5,-8,ROBE5,10,20);

    // Corrupted prayer beads
    ctx.save();
    ctx.globalAlpha = 0.50 + pulse * 0.30;
    p(-2,-12,darkBlood, 4, 1);
    p(-3,-11,darkBlood, 2, 1); p(1,-11,darkBlood, 2, 1);
    p(-4,-10,darkBlood, 2, 1); p(2,-10,darkBlood, 2, 1);
    p(-4, -8,darkBlood, 2, 2); p(2, -8,darkBlood, 2, 2);
    p(-3, -6,darkBlood, 6, 2);
    ctx.restore();

    // Outstretched corrupting hands
    p(-20,-8,CO, 7, 3); p(-19,-7,ROBE2, 5, 2);
    p(-21,-6,CO, 3, 5); p(-23,-3,CO, 3, 5);
    p( 13,-8,CO, 7, 3); p( 14,-7,ROBE2, 5, 2);
    p( 18,-6,CO, 3, 5); p( 20,-3,CO, 3, 5);

    // Shadow tendrils at base
    ctx.save();
    ctx.globalAlpha = 0.30 + pulse * 0.30;
    p(-14,17,darkHalo, 4, 8); p(-9,17,darkHalo, 3, 6);
    p( -4,17,darkHalo, 3, 7); p( 1,17,darkHalo, 3, 6);
    p(  6,17,darkHalo, 4, 7); p(10,17,darkHalo, 3, 5);
    ctx.restore();

    ctx.restore();
}


/**
 * --- LILITH (lilith / mini_lilith) ---
 * 밤의 여왕: Pale moon-white queen of night with raven hair, twin bat wings,
 * crescent crown, crimson gown with gold trim, blood-red glowing eyes,
 * floating ethereal stance over a pool of shadow.
 */
function drawLilith(cx, cy, enemy) {
    const now    = Date.now();
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, col, w, h, S);
    const pulse  = (Math.sin(now * 0.0045) + 1) / 2;
    const heart  = (Math.sin(now * 0.009) + 1) / 2;
    const floatY = Math.sin(now * 0.0022) * 3;
    const wingF  = Math.sin(now * 0.0032) * 2;
    const hairW  = Math.sin(now * 0.0026) * 1;

    const CO  = '#000';
    const SK  = '#F5E6E6', SKM = '#D8BFC4', SKS = '#A98A92';                  // pale moon skin
    const HRD = '#08000C', HRM = '#150020', HRL = '#2A0840';                  // raven hair w/ violet sheen
    const WS  = '#080008', WM  = '#1A0018', WL = '#3A1A38';                   // bat-leather wings
    const DR  = '#2A0008', DM  = '#5A0010', DB = '#8A0018', DL = '#B41040';   // crimson gown
    const GS  = '#5A4000', GM = '#9A6F00', GB = '#FFD700', GL = '#FFE57F';    // gold trim
    const MS  = '#1A1A2A', MM = '#3A3A5A', ML = '#7A7AAA', MH = '#D8D8F0';    // moon silver
    const RD  = '#8A0008', RH = '#FF1830';                                    // blood red eye
    const SH  = '#0A0010';                                                    // shadow pool

    // ── shadow pool beneath (ground darkening)
    ctx.save(); ctx.globalAlpha = 0.45 + pulse * 0.12;
    pEnemy(ctx,cx,cy,-32, 30,SH,64,8,S);
    pEnemy(ctx,cx,cy,-24, 36,SH,48,4,S);
    ctx.restore();

    // ── crimson night aura
    ctx.save(); ctx.globalAlpha = 0.20 + pulse * 0.18;
    pEnemy(ctx,cx,cy,-40,-46+floatY,DM,80,82,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.14 + pulse * 0.14;
    pEnemy(ctx,cx,cy,-28,-50+floatY,HRL,56,40,S);
    ctx.restore();

    // ── BAT WINGS (2 per side, spread + drooping)
    // LEFT upper wing (full-spread, scalloped tip)
    ctx.save(); ctx.globalAlpha = 0.70 + pulse * 0.20;
    p(-46,-30+wingF,CO,32,18); p(-45,-29+wingF,WS,30,16); p(-44,-28+wingF,WM,27,14);
    p(-45,-29+wingF,WL,30,1);
    ctx.restore();
    // wing ribs (bat fingers)
    p(-44,-27+wingF,CO,1,14); p(-37,-27+wingF,CO,1,13); p(-30,-27+wingF,CO,1,12); p(-23,-27+wingF,CO,1,11);
    // scalloped tip claws
    p(-15,-15+wingF,CO,2,3); p(-22,-13+wingF,CO,2,3); p(-29,-13+wingF,CO,2,3);
    // LEFT lower wing (smaller, drooping)
    ctx.save(); ctx.globalAlpha = 0.62 + pulse * 0.15;
    p(-40, -4+wingF,CO,26,14); p(-39, -3+wingF,WS,24,12); p(-38, -2+wingF,WM,21,10);
    ctx.restore();
    p(-38, -1+wingF,CO,1,11); p(-32,-1+wingF,CO,1,10); p(-26,-1+wingF,CO,1,9); p(-20,-1+wingF,CO,1,8);
    p(-14, 8+wingF,CO,2,3); p(-20, 8+wingF,CO,2,3); p(-26, 8+wingF,CO,2,3);

    // RIGHT upper wing (mirror)
    ctx.save(); ctx.globalAlpha = 0.70 + pulse * 0.20;
    p( 14,-30-wingF,CO,32,18); p( 15,-29-wingF,WS,30,16); p( 16,-28-wingF,WM,27,14);
    p( 15,-29-wingF,WL,30,1);
    ctx.restore();
    p( 17,-27-wingF,CO,1,14); p( 24,-27-wingF,CO,1,13); p( 31,-27-wingF,CO,1,12); p( 38,-27-wingF,CO,1,11);
    p( 13,-15-wingF,CO,2,3); p( 20,-13-wingF,CO,2,3); p( 27,-13-wingF,CO,2,3);
    // RIGHT lower wing
    ctx.save(); ctx.globalAlpha = 0.62 + pulse * 0.15;
    p( 14, -4-wingF,CO,26,14); p( 15, -3-wingF,WS,24,12); p( 16, -2-wingF,WM,21,10);
    ctx.restore();
    p( 18, -1-wingF,CO,1,11); p( 24,-1-wingF,CO,1,10); p( 30,-1-wingF,CO,1,9); p( 36,-1-wingF,CO,1,8);
    p( 12, 8-wingF,CO,2,3); p( 18, 8-wingF,CO,2,3); p( 24, 8-wingF,CO,2,3);

    // ── CRIMSON GOWN (flowing, gold trim)
    p(-14,-20+floatY,CO,28,50);
    p(-13,-19+floatY,DR,26,48);
    p(-12,-18+floatY,DM,24,46);
    p(-11,-17+floatY,DB,22,44);
    p(-13,-19+floatY,DL,26,1);                                                // top highlight
    // gown widens at hem
    p(-18, 24+floatY,CO,36,8); p(-17,25+floatY,DR,34,7); p(-16,26+floatY,DM,32,5);
    // central gold filigree
    p(-2,-19+floatY,CO,4,46); p(-1,-18+floatY,GS,2,44);
    p(-1,-18+floatY,GM,2,42); p(-1,-18+floatY,GB,2,2);
    for (let r = 0; r < 6; r++) { p(-1,-12+r*8+floatY,GL,2,1); }
    // gold gown trims
    p(-14,-20+floatY,GM,2,50); p( 12,-20+floatY,GM,2,50);
    p(-18, 24+floatY,GB,2,2);  p( 16, 24+floatY,GB,2,2);

    // ── CORSET PULSE (heart of darkness gem at sternum)
    p(-3,-10+floatY,CO,6,6);
    p(-2,-9+floatY,RD,4,4);
    ctx.save(); ctx.globalAlpha = 0.75 + heart * 0.25;
    pEnemy(ctx,cx,cy,-2,-9+floatY,RH,4,4,S);
    ctx.restore();
    p(-1,-8+floatY,GL,1,1);

    // ── RAVEN HAIR (flowing past shoulders, behind head)
    p(-16,-36+floatY,CO,32,12);
    p(-15,-35+floatY,HRD,30,10);
    p(-14,-34+floatY,HRM,28,8);
    p(-15,-35+floatY,HRL,30,1);                                               // violet sheen
    // long side locks (drifting)
    p(-18+hairW,-30+floatY,CO,3,30); p(-17+hairW,-29+floatY,HRD,1,28); p(-16+hairW,-29+floatY,HRM,1,26);
    p( 15-hairW,-30+floatY,CO,3,30); p( 16-hairW,-29+floatY,HRD,1,28); p( 16-hairW,-29+floatY,HRM,1,26);
    // back hair fan
    p(-12+hairW,-4+floatY,CO,24,10); p(-11+hairW,-3+floatY,HRD,22,8);

    // ── PALE FACE (moon-white, sharp)
    p(-9,-32+floatY,CO,18,14);
    p(-8,-31+floatY,SK,16,12);
    p(-7,-30+floatY,SKM,14,10);
    p(-8,-31+floatY,'#FFFAFC',16,1);                                          // top highlight
    // cheek shadows
    p(-8,-24+floatY,SKS,2,2); p( 6,-24+floatY,SKS,2,2);
    // GLOWING BLOOD-RED EYES
    p(-6,-28+floatY,CO,4,3); p( 2,-28+floatY,CO,4,3);
    p(-5,-27+floatY,RD,2,1); p( 3,-27+floatY,RD,2,1);
    ctx.save(); ctx.globalAlpha = 0.90 + heart * 0.10;
    pEnemy(ctx,cx,cy,-5,-27+floatY,RH,2,1,S);
    pEnemy(ctx,cx,cy, 3,-27+floatY,RH,2,1,S);
    ctx.restore();
    // lips (crimson)
    p(-3,-22+floatY,CO,6,2); p(-2,-21+floatY,DB,4,1);
    p(-1,-22+floatY,RH,2,1);

    // ── CRESCENT MOON CROWN (silver, twin horns curving up)
    p(-10,-40+floatY,CO,20,3); p(-9,-39+floatY,MM,18,2); p(-9,-40+floatY,ML,18,1);
    // left horn of crescent (curves up + inward)
    p(-12,-44+floatY,CO,3,5); p(-11,-43+floatY,MS,1,4);
    p(-11,-48+floatY,CO,3,4); p(-10,-47+floatY,MM,1,3);
    p(-10,-51+floatY,CO,3,3); p( -9,-50+floatY,ML,1,2);
    p( -8,-53+floatY,CO,3,2); p( -7,-52+floatY,MH,1,1);
    // right horn (mirror)
    p(  9,-44+floatY,CO,3,5); p( 10,-43+floatY,MS,1,4);
    p(  8,-48+floatY,CO,3,4); p(  9,-47+floatY,MM,1,3);
    p(  7,-51+floatY,CO,3,3); p(  8,-50+floatY,ML,1,2);
    p(  5,-53+floatY,CO,3,2); p(  6,-52+floatY,MH,1,1);
    // central moon gem (between horns)
    p(-2,-46+floatY,CO,4,4); p(-1,-45+floatY,MM,2,2);
    ctx.save(); ctx.globalAlpha = 0.85 + pulse * 0.15;
    pEnemy(ctx,cx,cy,-1,-45+floatY,MH,2,2,S);
    ctx.restore();

    // ── HALO MOON DISC (faded silver behind crown)
    ctx.save(); ctx.globalAlpha = 0.30 + pulse * 0.20;
    pEnemy(ctx,cx,cy,-16,-44+floatY,ML,8,2,S);
    pEnemy(ctx,cx,cy,  8,-44+floatY,ML,8,2,S);
    pEnemy(ctx,cx,cy,-14,-50+floatY,MH,3,1,S); pEnemy(ctx,cx,cy,11,-50+floatY,MH,3,1,S);
    ctx.restore();
}

/**
 * --- ABYSSAL OVERLORD (abyssal_overlord) ---
 * 심연의 군주: Final boss. Colossal void sovereign — fractured obsidian armor,
 * crown of impaled skulls, four eldritch arms, multiple void-eyes across head,
 * abyss heart core, shadow tendrils trailing from massive cloak.
 */
function drawAbyssalOverlord(cx, cy, enemy) {
    const now    = Date.now();
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, col, w, h, S);
    const pulse  = (Math.sin(now * 0.0035) + 1) / 2;
    const heart  = (Math.sin(now * 0.007) + 1) / 2;
    const floatY = Math.sin(now * 0.0018) * 3;
    const armF   = Math.sin(now * 0.003) * 1;
    const tendF  = (now * 0.001) % 1;

    const CO  = '#000';
    const VS  = '#04000A', VM = '#10001A', VB = '#26003A', VL = '#4A0080', VH = '#7B1FA2'; // void purple
    const OS  = '#0A0810', OM = '#1A1828', OB = '#2A2840', OL = '#4A4868';                 // obsidian armor
    const GS  = '#3A2A00', GM = '#7A5A18', GB = '#C0941C', GL = '#FFE060';                 // tarnished gold
    const BS  = '#A89888';                                                                  // bone skull
    const RD  = '#7A0010', RH = '#FF1830';                                                  // blood eye
    const SH  = '#080010';                                                                  // shadow

    // ── COSMIC VOID AURA (massive)
    ctx.save(); ctx.globalAlpha = 0.28 + pulse * 0.22;
    pEnemy(ctx,cx,cy,-52,-54+floatY,VL,104,108,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.18 + pulse * 0.16;
    pEnemy(ctx,cx,cy,-40,-58+floatY,VH,80,52,S);
    ctx.restore();

    // ── SHADOW TENDRILS (8 trailing from cloak base)
    ctx.save(); ctx.globalAlpha = 0.50;
    for (let t = 0; t < 8; t++) {
        const ang = (t / 8) * Math.PI * 2;
        const r1 = 22, r2 = 36 + tendF * 8;
        const x1 = Math.cos(ang) * r1;
        const y1 = 28 + Math.sin(ang) * r1 * 0.4;
        const x2 = Math.cos(ang) * r2;
        const y2 = 38 + Math.sin(ang) * r2 * 0.3;
        pEnemy(ctx,cx,cy,x1,y1+floatY,SH,3,3,S);
        pEnemy(ctx,cx,cy,x2,y2+floatY,VM,2,2,S);
    }
    ctx.restore();

    // ── MASSIVE CLOAK BASE (widening trapezoid)
    p(-22, 24+floatY,CO,44,12); p(-21,25+floatY,VS,42,10); p(-20,26+floatY,VM,40,8);
    p(-26, 30+floatY,CO,52, 8); p(-25,31+floatY,VS,50, 6);
    // gold cloak trim
    p(-22, 24+floatY,GM,2,12); p( 20, 24+floatY,GM,2,12);
    p(-26, 30+floatY,GB,2, 2); p( 24, 30+floatY,GB,2, 2);

    // ── COLOSSAL TORSO (obsidian plated)
    p(-18,-24+floatY,CO,36,52);
    p(-17,-23+floatY,OS,34,50);
    p(-16,-22+floatY,OM,32,48);
    p(-15,-21+floatY,OB,30,46);
    p(-17,-23+floatY,OL,34,1);                                                // top highlight
    // armor seams (vertical)
    p( -8,-22+floatY,CO,1,46); p(  7,-22+floatY,CO,1,46);
    // armor plates (horizontal bands)
    for (let r = 0; r < 5; r++) { p(-16,-18 + r*10 + floatY, CO, 32, 1); }
    // gold pauldron trim
    p(-18,-24+floatY,GM,3,8); p( 15,-24+floatY,GM,3,8);
    p(-18,-22+floatY,GB,3,1); p( 15,-22+floatY,GB,3,1);
    // armor rivets
    for (let c = 0; c < 4; c++) {
        p(-14 + c*9, -20+floatY, GL, 1, 1);
        p(-14 + c*9,  20+floatY, GL, 1, 1);
    }
    // central gold spine
    p(-2,-22+floatY,CO,4,46); p(-1,-21+floatY,GS,2,44); p(-1,-21+floatY,GM,2,2);
    for (let r = 0; r < 6; r++) p(-1,-16 + r*8 + floatY, GL, 2, 1);

    // ── ABYSS HEART CORE (central void wound)
    p(-6,-8+floatY,CO,12,12);
    p(-5,-7+floatY,VS,10,10);
    p(-4,-6+floatY,VB,8,8);
    p(-3,-5+floatY,VL,6,6);
    p(-2,-4+floatY,VH,4,4);
    ctx.save(); ctx.globalAlpha = 0.85 + heart * 0.15;
    pEnemy(ctx,cx,cy,-6,-8+floatY,VH,12,12,S);
    ctx.restore();
    // heart cracks radiating out
    p(-10,-4+floatY,VL,4,1); p( 6,-4+floatY,VL,4,1);
    p(-2,-14+floatY,VL,1,4); p(-2, 4+floatY,VL,1,4);

    // ── FOUR ELDRITCH ARMS (2 per side, asymmetric heights)
    // LEFT upper arm (raised, claw open)
    p(-26,-14+armF+floatY,CO,9,5); p(-25,-13+armF+floatY,OM,7,3);
    p(-30,-18+armF+floatY,CO,5,10); p(-29,-17+armF+floatY,OB,3,8);
    p(-32,-22+armF+floatY,CO,4,5); p(-31,-21+armF+floatY,VB,2,3);             // void claw
    p(-33,-24+armF+floatY,CO,1,3); p(-31,-24+armF+floatY,CO,1,3); p(-29,-24+armF+floatY,CO,1,3);
    // LEFT lower arm (down, holds void orb)
    p(-24, 2-armF+floatY,CO,8,5); p(-23,3-armF+floatY,OM,6,3);
    p(-30, 6-armF+floatY,CO,7,8); p(-29,7-armF+floatY,OB,5,6);
    // void orb
    p(-32,12-armF+floatY,CO,7,7);
    ctx.save(); ctx.globalAlpha = 0.85 + heart * 0.15;
    pEnemy(ctx,cx,cy,-31,13-armF+floatY,VL,5,5,S);
    pEnemy(ctx,cx,cy,-30,14-armF+floatY,VH,3,3,S);
    ctx.restore();
    // RIGHT upper arm (mirror)
    p( 17,-14-armF+floatY,CO,9,5); p( 18,-13-armF+floatY,OM,7,3);
    p( 25,-18-armF+floatY,CO,5,10); p( 26,-17-armF+floatY,OB,3,8);
    p( 28,-22-armF+floatY,CO,4,5); p( 29,-21-armF+floatY,VB,2,3);
    p( 28,-24-armF+floatY,CO,1,3); p( 30,-24-armF+floatY,CO,1,3); p( 32,-24-armF+floatY,CO,1,3);
    // RIGHT lower arm (down, holds shadow scythe)
    p( 16, 2+armF+floatY,CO,8,5); p( 17,3+armF+floatY,OM,6,3);
    p( 23, 6+armF+floatY,CO,7,8); p( 24,7+armF+floatY,OB,5,6);
    // scythe handle
    p( 28, 4+armF+floatY,CO,2,22); p( 28,4+armF+floatY,OL,1,20);
    // scythe blade
    p( 26, 0+armF+floatY,CO,12,4); p( 27,1+armF+floatY,VL,10,2); p( 27,1+armF+floatY,VH,10,1);
    p( 36, 2+armF+floatY,CO,2,3); p( 36,2+armF+floatY,VH,1,2);

    // ── HEAD (skull-shaped, multiple void-fire eyes)
    p(-12,-38+floatY,CO,24,16);
    p(-11,-37+floatY,OS,22,14);
    p(-10,-36+floatY,OM,20,12);
    p(-11,-37+floatY,OL,22,1);                                                // top highlight
    // jaw shadow
    p(-9,-26+floatY,CO,18,3); p(-8,-25+floatY,VS,16,2);
    // PRIMARY EYES (large, central)
    p(-8,-32+floatY,CO,5,4); p( 3,-32+floatY,CO,5,4);
    p(-7,-31+floatY,RD,3,2); p( 4,-31+floatY,RD,3,2);
    ctx.save(); ctx.globalAlpha = 0.95;
    pEnemy(ctx,cx,cy,-7,-31+floatY,RH,3,2,S);
    pEnemy(ctx,cx,cy, 4,-31+floatY,RH,3,2,S);
    ctx.restore();
    // SECONDARY EYES (smaller, void-purple, forehead + temples)
    p(-2,-36+floatY,CO,4,2); p(-1,-35+floatY,VH,2,1);                         // forehead 3rd eye
    p(-11,-34+floatY,CO,2,2); p(-10,-33+floatY,VL,1,1);                       // L temple
    p(  9,-34+floatY,CO,2,2); p( 10,-33+floatY,VL,1,1);                       // R temple
    // void weeping streaks
    p(-7,-28+floatY,VL,1,2); p( 5,-28+floatY,VL,1,2);
    // grim mouth
    p(-5,-24+floatY,CO,10,3); p(-4,-23+floatY,VS,8,1);
    // teeth
    p(-4,-23+floatY,BS,1,2); p(-1,-23+floatY,BS,1,2); p(2,-23+floatY,BS,1,2);

    // ── CROWN OF IMPALED SKULLS (5 small skulls on jagged crown)
    p(-14,-42+floatY,CO,28,4); p(-13,-41+floatY,GS,26,3); p(-13,-41+floatY,GM,26,1);
    p(-14,-42+floatY,GB,28,1);
    // jagged spires (5)
    p(-13,-46+floatY,CO,3,5); p(-12,-45+floatY,GM,1,4);
    p( -7,-50+floatY,CO,3,9); p( -6,-49+floatY,GM,1,8); p(-6,-49+floatY,GB,1,2);
    p( -1,-54+floatY,CO,4,13); p(  0,-53+floatY,GB,2,12); p(0,-53+floatY,GL,2,2);
    p(  5,-50+floatY,CO,3,9); p(  6,-49+floatY,GM,1,8); p(6,-49+floatY,GB,1,2);
    p( 11,-46+floatY,CO,3,5); p( 12,-45+floatY,GM,1,4);
    // impaled skulls (3 — at center spires)
    p(-7,-47+floatY,CO,4,4); p(-6,-46+floatY,BS,2,2);
    p(-6,-45+floatY,CO,1,1); p(-4,-45+floatY,CO,1,1);                         // skull eye holes
    p(-1,-51+floatY,CO,5,5); p( 0,-50+floatY,BS,3,3);
    p( 0,-49+floatY,CO,1,1); p( 2,-49+floatY,CO,1,1);
    p( 5,-47+floatY,CO,4,4); p( 6,-46+floatY,BS,2,2);
    p( 6,-45+floatY,CO,1,1); p( 8,-45+floatY,CO,1,1);

    // ── SHATTERED HALO (broken obsidian ring fragments)
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    pEnemy(ctx,cx,cy,-22,-58+floatY,VH,10,2,S);
    pEnemy(ctx,cx,cy, 12,-58+floatY,VH,10,2,S);
    pEnemy(ctx,cx,cy,-16,-62+floatY,VL, 4,1,S); pEnemy(ctx,cx,cy,12,-62+floatY,VL,4,1,S);
    ctx.restore();
}
window.drawAbyssalOverlord = drawAbyssalOverlord;

/**
 * --- CHRONOS (mini_chronos) ---
 * 시간의 거인: Hooded time-keeper with spinning hourglass core. Bronze + sand-gold
 * palette, rotating gear halo, sand particles bleeding from torn hourglass.
 */
function drawChronos(cx, cy, enemy) {
    const now    = Date.now();
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, col, w, h, S);
    const pulse  = (Math.sin(now * 0.004) + 1) / 2;
    const sandT  = (now * 0.002) % 1;
    const floatY = Math.sin(now * 0.0022) * 2;
    const gearA  = (now * 0.0015) % (Math.PI * 2);

    const CO  = '#000';
    const RS  = '#1A0E04', RM = '#3A2210', RL = '#5A3818';                    // brown hood
    const BS  = '#3D2A10', BM = '#705020', BB = '#A07830', BL = '#D8A848';    // bronze
    const SS  = '#4A3010', SM = '#9C7028', SL = '#E0B060', SH = '#FFE0A0';    // sand gold
    const GS  = '#1A1A24', GM = '#404048', GL = '#80808A';                    // grey gear
    const SK  = '#C8B8A0';                                                    // skin (skull-pale)

    // ── time-warp aura
    ctx.save(); ctx.globalAlpha = 0.20 + pulse * 0.18;
    pEnemy(ctx,cx,cy,-38,-42+floatY,BB,76,80,S);
    ctx.restore();

    // ── ROTATING GEAR HALO (4 cogs)
    for (let g = 0; g < 4; g++) {
        const ang = gearA + g * Math.PI / 2;
        const gx = Math.cos(ang) * 30;
        const gy = Math.sin(ang) * 30 - 10 + floatY;
        ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.20;
        pEnemy(ctx,cx,cy,gx-3,gy-3,CO,6,6,S);
        pEnemy(ctx,cx,cy,gx-2,gy-2,GM,4,4,S);
        pEnemy(ctx,cx,cy,gx-1,gy-1,GL,2,2,S);
        // teeth
        pEnemy(ctx,cx,cy,gx-4,gy-1,GS,1,2,S); pEnemy(ctx,cx,cy,gx+3,gy-1,GS,1,2,S);
        pEnemy(ctx,cx,cy,gx-1,gy-4,GS,2,1,S); pEnemy(ctx,cx,cy,gx-1,gy+3,GS,2,1,S);
        ctx.restore();
    }

    // ── HOODED ROBE (brown w/ bronze trim)
    p(-14,-18+floatY,CO,28,46);
    p(-13,-17+floatY,RS,26,44);
    p(-12,-16+floatY,RM,24,42);
    p(-11,-15+floatY,RL,22,40);
    p(-14,-18+floatY,BB,2,46); p( 12,-18+floatY,BB,2,46);
    // bronze rivets
    for (let r = 0; r < 5; r++) { p(-13,-12+r*8+floatY,BL,1,1); p(12,-12+r*8+floatY,BL,1,1); }

    // ── HOOD (deep cowl, shadow inside)
    p(-12,-34+floatY,CO,24,16); p(-11,-33+floatY,RS,22,14); p(-10,-32+floatY,RM,20,12);
    p(-11,-33+floatY,RL,22,1);
    p(-8,-28+floatY,CO,16,10);                                                // shadow inside cowl

    // ── SKULL FACE (pale, glowing eye sockets w/ sand pouring)
    p(-6,-26+floatY,SK,12,8);
    p(-5,-25+floatY,'#8A7A68',10,1);                                          // brow shadow
    p(-5,-23+floatY,CO,3,2); p( 2,-23+floatY,CO,3,2);                         // eye sockets
    p(-4,-22+floatY,SH,1,1); p( 3,-22+floatY,SH,1,1);                         // sand glow
    ctx.save(); ctx.globalAlpha = 0.75 + pulse * 0.20;
    pEnemy(ctx,cx,cy,-4,-22+floatY,SL,1,1,S); pEnemy(ctx,cx,cy,3,-22+floatY,SL,1,1,S);
    ctx.restore();
    // sand trail from eyes
    p(-4,-20+floatY,SM,1,3); p( 3,-20+floatY,SM,1,3);

    // ── TORN HOURGLASS (chest, leaking sand)
    p(-7,-12+floatY,CO,14,22);
    p(-6,-11+floatY,BS,12,20);
    p(-5,-10+floatY,BM,10,18);
    // top bulb
    p(-4, -9+floatY,SS,8,6);
    p(-3, -8+floatY,SM,6,4);
    p(-2, -7+floatY,SL,4,2);
    // pinch
    p(-2, -3+floatY,CO,4,2); p(-1,-2+floatY,SH,2,1);
    // bottom bulb (filling) — animate fill height
    const fillH = Math.floor(2 + sandT * 4);
    p(-4,  1+floatY,SS,8,7);
    p(-3,  2+floatY,SM,6,5);
    p(-3, 7-fillH+floatY,SL,6,fillH);
    // CRACK (torn) — black diagonal fracture
    p( 0, -5+floatY,CO,1,12); p( 1, -3+floatY,CO,1,4);
    // sand leaking out of crack
    ctx.save(); ctx.globalAlpha = 0.70 + pulse * 0.30;
    pEnemy(ctx,cx,cy, 2, -2+floatY,SH,1,1,S);
    pEnemy(ctx,cx,cy, 3,  0+floatY,SL,1,1,S);
    pEnemy(ctx,cx,cy, 4,  3+floatY,SM,1,2,S);
    pEnemy(ctx,cx,cy, 5,  6+floatY,SM,1,3,S);
    ctx.restore();

    // ── BRONZE STAFF (left hand, scythe-like crook)
    p(-22, -8+floatY,CO,2,30); p(-21,-7+floatY,BM,1,28);
    p(-26,-12+floatY,CO,6,3); p(-25,-11+floatY,BB,4,1); p(-25,-11+floatY,BL,4,1);
    p(-22,-16+floatY,CO,3,4); p(-21,-15+floatY,BB,1,3);                       // hook
}
window.drawChronos = drawChronos;

/**
 * --- MEDUSA (medusa) ---
 * 고르곤: Serpent-haired sorceress with petrifying green glare, scaled torso,
 * coiled snake tail, gold serpent crown.
 */
function drawMedusa(cx, cy, enemy) {
    const now    = Date.now();
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pEnemy(ctx, cx, cy, ox, oy, col, w, h, S);
    const pulse  = (Math.sin(now * 0.005) + 1) / 2;
    const gaze   = (Math.sin(now * 0.0028) + 1) / 2;
    const floatY = Math.sin(now * 0.002) * 2;
    const snakeA = Math.sin(now * 0.004) * 2;

    const CO  = '#000';
    const GS  = '#04140A', GM = '#0E3318', GB = '#1E6B30', GL = '#3CB058', GH = '#80F098'; // venom green
    const SS  = '#1A0A1A', SM = '#3A1A3A';                                                // dark purple scale
    const SK  = '#E0D0B8', SKM = '#A88E70', SKS = '#705840';                              // tan skin
    const AU  = '#A0F0C0';                                                                 // petrify aura
    const RD  = '#5A0008';                                                                 // mouth/blood

    // ── PETRIFY AURA (sickly green halo)
    ctx.save(); ctx.globalAlpha = 0.22 + pulse * 0.20;
    pEnemy(ctx,cx,cy,-40,-44+floatY,GB,80,82,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.16 + gaze * 0.18;
    pEnemy(ctx,cx,cy,-32,-46+floatY,AU,64,60,S);
    ctx.restore();

    // ── SNAKE HAIR (10 serpents around skull, animated)
    const drawSnake = (sx, sy, dir, idx) => {
        const wig = Math.sin(now * 0.005 + idx) * 2;
        const tipX = sx + dir * 4 + wig * dir * 0.6;
        const tipY = sy - 6;
        // body segments
        p(sx, sy+floatY, CO, 3, 3); p(sx, sy+floatY, GM, 3, 2); p(sx, sy+floatY, GB, 3, 1);
        p(sx + dir, sy-2+floatY, CO, 3, 3); p(sx + dir, sy-2+floatY, GB, 3, 2); p(sx + dir, sy-2+floatY, GL, 3, 1);
        p(tipX, tipY+floatY, CO, 3, 3); p(tipX, tipY+floatY, GL, 3, 2);
        // head
        p(tipX + dir, tipY-2+floatY, CO, 3, 2); p(tipX + dir, tipY-2+floatY, GH, 2, 1);
        // eyes (tiny red)
        p(tipX + dir + 1, tipY-1+floatY, RD, 1, 1);
        // fang (tongue)
        p(tipX + dir * 2, tipY+floatY, RD, 1, 1);
    };
    drawSnake(-14,-38, -1, 0); drawSnake(-12,-42, -1, 1); drawSnake( -8,-44, -1, 2);
    drawSnake( -4,-46, -1, 3); drawSnake(  1,-46,  1, 4);
    drawSnake(  6,-44,  1, 5); drawSnake( 10,-42,  1, 6); drawSnake( 13,-38,  1, 7);
    // back snakes
    drawSnake(-18,-32, -1, 8); drawSnake( 15,-32,  1, 9);

    // ── SCALED TORSO (purple-green scaled, snake-women)
    p(-12,-18+floatY,CO,24,40);
    p(-11,-17+floatY,SS,22,38);
    p(-10,-16+floatY,SM,20,36);
    p(-11,-17+floatY,GM,22,1);                                                // top highlight
    // scale pattern (alternating dots)
    for (let r = 0; r < 8; r++) {
        const offX = (r % 2 === 0) ? 0 : 2;
        for (let c = 0; c < 4; c++) p(-9 + offX + c*4, -13 + r*4 + floatY, GS, 2, 2);
    }
    // chest scales (greener)
    p(-5,-14+floatY,GM,10,12); p(-4,-13+floatY,GB,8,10);
    p(-3,-12+floatY,GL,6,1);
    // gold belt
    p(-12, 18+floatY,'#9A7000',24,3); p(-11,18+floatY,'#FFD700',22,1);

    // ── COILED SNAKE TAIL (lower body, S-curve)
    p(-16, 22+floatY,CO,32,10); p(-15,23+floatY,SM,30,8);
    p(-13,24+floatY,GM,26,6);
    // coil 2
    p(-12 + snakeA, 28+floatY,CO,26,8); p(-11+snakeA,29+floatY,SS,24,6);
    p(-9+snakeA,30+floatY,GM,20,4);
    // tail tip
    p(8 + snakeA, 32+floatY,CO,8,3); p(9+snakeA,33+floatY,GL,6,1);
    // tail scales
    for (let c = 0; c < 8; c++) p(-12 + c*3, 25+floatY, GS, 1, 1);

    // ── ARMS (raised, claw-like)
    p(-20, -8+floatY,CO,7,4); p(-19,-7+floatY,SKM,5,2);
    p(-22,-12+floatY,CO,4,8); p(-21,-11+floatY,SK,2,6);
    p( 13, -8+floatY,CO,7,4); p( 14,-7+floatY,SKM,5,2);
    p( 18,-12+floatY,CO,4,8); p( 19,-11+floatY,SK,2,6);
    // claws (green-tipped)
    p(-23,-14+floatY,GL,1,2); p(-21,-14+floatY,GL,1,2);
    p( 19,-14+floatY,GL,1,2); p( 21,-14+floatY,GL,1,2);

    // ── FACE (tan, sharp, glowing GREEN PETRIFY EYES)
    p(-8,-32+floatY,CO,16,12);
    p(-7,-31+floatY,SK,14,10);
    p(-6,-30+floatY,SKM,12,8);
    p(-7,-31+floatY,'#FFF0D8',14,1);                                          // top highlight
    p(-7,-25+floatY,SKS,2,2); p( 5,-25+floatY,SKS,2,2);                       // cheek shadow
    // GLOWING PETRIFY EYES (intense green w/ flare)
    p(-6,-28+floatY,CO,4,3); p( 2,-28+floatY,CO,4,3);
    p(-5,-27+floatY,GB,2,1); p( 3,-27+floatY,GB,2,1);
    ctx.save(); ctx.globalAlpha = 0.85 + gaze * 0.15;
    pEnemy(ctx,cx,cy,-5,-27+floatY,GH,2,1,S);
    pEnemy(ctx,cx,cy, 3,-27+floatY,GH,2,1,S);
    ctx.restore();
    // gaze beams (faint forward streaks)
    ctx.save(); ctx.globalAlpha = 0.35 + gaze * 0.30;
    pEnemy(ctx,cx,cy,-5,-26+floatY,GL,2,8,S);
    pEnemy(ctx,cx,cy, 3,-26+floatY,GL,2,8,S);
    ctx.restore();
    // hissing mouth (fangs visible)
    p(-4,-22+floatY,CO,8,3); p(-3,-21+floatY,RD,6,1);
    p(-3,-20+floatY,SK,1,2); p( 2,-20+floatY,SK,1,2);                         // fangs

    // ── GOLD SERPENT CROWN (twin coiled snakes at temples)
    p(-12,-36+floatY,CO,4,3); p(-11,-35+floatY,'#9A7000',2,1); p(-11,-35+floatY,'#FFD700',2,1);
    p( 8,-36+floatY,CO,4,3); p(  9,-35+floatY,'#9A7000',2,1); p(  9,-35+floatY,'#FFD700',2,1);
    p(-10,-39+floatY,CO,2,3); p(-9,-38+floatY,'#FFD700',1,2);                 // L horn
    p( 9,-39+floatY,CO,2,3); p( 10,-38+floatY,'#FFD700',1,2);                 // R horn
}
window.drawMedusa = drawMedusa;

const enemyDrawRegistry = {
    'normal': 'drawWhisperingSpirit',
    'specter': 'drawWhisperingSpirit',
    'mist': 'drawMist',
    'memory': 'drawMemory',
    'shade': 'drawShade',
    'tank': 'drawIronWraith',
    'runner': 'drawShadowRunner',
    'greedy': 'drawGreedyPoltergeist',
    'lightspeed': 'drawLightspeedHerald',
    'boar': 'drawHellboundBoar',
    'defiled_apprentice': 'drawDefiledApprentice',
    'mimic': 'drawMimicWraith',
    'dimension': 'drawDimensionWraith',
    'deceiver': 'drawDeceiverSiren',
    'cursed_vajra': 'drawCursedVajra',
    'betrayer_blade': 'drawBetrayerBlade',
    'void_piercer': 'drawVoidPiercer',
    'soul_eater': 'drawSoulEater',
    'frost': 'drawFrostWalker',
    'frost_outcast': 'drawFrozenHeart',
    'ember_hatred': 'drawEmberHatred',
    'heavy': 'drawChainEnforcer',
    'lava': 'drawLavaFury',
    'burning': 'drawPainRegenerator',
    'abyssal_acolyte': 'drawAbyssalAcolyte',
    'gold': 'drawGoldPhantom',
    // ── 원혼 (specter) new ──────────────────────────────────────────────
    'echo_soul':       'drawEchoSoul',
    'hungry_ghost':    'drawHungryGhost',
    'aggrieved':       'drawAggrieved',
    'split_soul':      'drawSplitSoul',
    'cursed_ancestor': 'drawCursedAncestor',
    // ── 망령 (wraith) new ───────────────────────────────────────────────
    'shadow_wisp':     'drawShadowWisp',
    'cursed_shade':    'drawCursedShade',
    'soul_hound':      'drawSoulHound',
    'oblivion_wraith': 'drawOblivionWraith',
    'unrepentant':     'drawUnrepentant',
    // ── 악령 (spirit) new ───────────────────────────────────────────────
    'lost_child':      'drawLostChild',
    'grave_walker':    'drawGraveWalker',
    'wailing_mother':  'drawWailingMother',
    'abyss_sentinel':  'drawAbyssSentinel',
    'fear_harvester':  'drawFearHarvester',
    'blood_spirit':    'drawBloodSpirit',
    // ── 악마 (demon) new ────────────────────────────────────────────────
    'imp':               'drawImp',
    'hellspawn':         'drawHellspawn',
    'brimstone_fiend':   'drawBrimstoneFiend',
    'shadow_titan':       'drawShadowTitan',
    'lava_lord':          'drawLavaLord',
    'time_ravager':       'drawTimeRavager',
    'void_master':        'drawVoidMaster',
    'sin_incarnate':      'drawSinIncarnate',
    'corruption_apostle': 'drawCorruptionApostle',
    // ── Bosses ──────────────────────────────────────────────────────────
    'cerberus': 'drawCerberus',
    'charon': 'drawCharon',
    'beelzebub': 'drawBeelzebub',
    'lucifer': 'drawLucifer',
    'abyssal_overlord': 'drawAbyssalOverlord',
    'mini_cerberus': 'drawCerberus',
    'mini_charon': 'drawCharon',
    'mini_beelzebub': 'drawBeelzebub',
    'mini_lucifer': 'drawLucifer',
    'mini_lilith': 'drawLilith',
    'lilith': 'drawLilith',
    'mini_chronos': 'drawChronos',
    'medusa': 'drawMedusa'
};

function getEnemyDrawFunction(type) {
    return enemyDrawRegistry[type] || null;
}

window.getEnemyDrawFunction = getEnemyDrawFunction;
window.drawWhisperingSpirit = drawWhisperingSpirit;
window.drawMist = drawMist;
window.drawMemory = drawMemory;
window.drawShade = drawShade;
window.drawIronWraith = drawIronWraith;
window.drawShadowRunner = drawShadowRunner;
window.drawGreedyPoltergeist = drawGreedyPoltergeist;
window.drawLightspeedHerald = drawLightspeedHerald;
window.drawHellboundBoar = drawHellboundBoar;
window.drawDefiledApprentice = drawDefiledApprentice;
window.drawMimicWraith = drawMimicWraith;
window.drawDimensionWraith = drawDimensionWraith;
window.drawDeceiverSiren = drawDeceiverSiren;
window.drawCursedVajra = drawCursedVajra;
window.drawBetrayerBlade = drawBetrayerBlade;
window.drawVoidPiercer = drawVoidPiercer;
window.drawSoulEater = drawSoulEater;
window.drawFrostWalker = drawFrostWalker;
window.drawFrozenHeart = drawFrozenHeart;
window.drawEmberHatred = drawEmberHatred;
window.drawChainEnforcer = drawChainEnforcer;
window.drawLavaFury = drawLavaFury;
window.drawPainRegenerator = drawPainRegenerator;
window.drawAbyssalAcolyte = drawAbyssalAcolyte;
window.drawGoldPhantom = drawGoldPhantom;
window.drawCerberus = drawCerberus;
window.drawCharon = drawCharon;
window.drawBeelzebub = drawBeelzebub;
window.drawLucifer = drawLucifer;
window.drawLilith = drawLilith;
// ── 원혼 new ───────────────────────────────────────────────────────────
window.drawEchoSoul = drawEchoSoul;
window.drawHungryGhost = drawHungryGhost;
window.drawAggrieved = drawAggrieved;
window.drawSplitSoul = drawSplitSoul;
window.drawCursedAncestor = drawCursedAncestor;
// ── 망령 new ───────────────────────────────────────────────────────────
window.drawShadowWisp = drawShadowWisp;
window.drawCursedShade = drawCursedShade;
window.drawSoulHound = drawSoulHound;
window.drawOblivionWraith = drawOblivionWraith;
window.drawUnrepentant = drawUnrepentant;
// ── 악령 new ───────────────────────────────────────────────────────────
window.drawLostChild = drawLostChild;
window.drawGraveWalker = drawGraveWalker;
window.drawWailingMother = drawWailingMother;
window.drawAbyssSentinel = drawAbyssSentinel;
window.drawFearHarvester = drawFearHarvester;
window.drawBloodSpirit = drawBloodSpirit;
// ── 악마 new ───────────────────────────────────────────────────────────
window.drawImp = drawImp;
window.drawHellspawn = drawHellspawn;
window.drawBrimstoneFiend = drawBrimstoneFiend;
window.drawShadowTitan = drawShadowTitan;
window.drawLavaLord = drawLavaLord;
window.drawTimeRavager = drawTimeRavager;
window.drawVoidMaster = drawVoidMaster;
window.drawSinIncarnate = drawSinIncarnate;
window.drawCorruptionApostle = drawCorruptionApostle;
