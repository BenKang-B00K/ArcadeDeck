/* enemies_pix_wraith.js — Wraith (망령) — the bound and the betrayed
 * Pixel art draw functions. See enemies_pix_core.js for the sprite standard. */

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
    pEnemyAura(ctx, p, -16,-32,AU,32,52);
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
    pEnemyAura(ctx, p, -18,-32,V4,36,52);
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
    pEnemyAura(ctx, p, -24,-30,VS,48,52);
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
    pEnemyAura(ctx, p, -26,-30,VA,52,52);
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
    pEnemyAura(ctx, p, -14,-22,AU,28,40);
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
    pEnemyAura(ctx, p, -16,-22,AU,32,42);
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
    pEnemyAura(ctx, p, -16,-26,AU,32,42);
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
    pEnemyAura(ctx, p, -16,-32,AU,32,52);
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
    pEnemyAura(ctx, p, -12,-16,angerGlow,24,30);
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

// ── Window Exports ────────────────────────────────────────────────────────
window.drawDefiledApprentice = drawDefiledApprentice;
window.drawMimicWraith = drawMimicWraith;
window.drawDimensionWraith = drawDimensionWraith;
window.drawDeceiverSiren = drawDeceiverSiren;
window.drawCursedVajra = drawCursedVajra;
window.drawBetrayerBlade = drawBetrayerBlade;
window.drawVoidPiercer = drawVoidPiercer;
window.drawShadowWisp = drawShadowWisp;
window.drawCursedShade = drawCursedShade;
window.drawSoulHound = drawSoulHound;
window.drawOblivionWraith = drawOblivionWraith;
window.drawUnrepentant = drawUnrepentant;
