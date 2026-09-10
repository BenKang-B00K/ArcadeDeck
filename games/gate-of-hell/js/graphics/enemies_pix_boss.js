/* enemies_pix_boss.js — Bosses (마신) — stage bosses and their mini forms
 * Pixel art draw functions. See enemies_pix_core.js for the sprite standard. */

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
    pEnemyAura(ctx,p,-30,-40,FM,60,60);
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
    pEnemyAura(ctx,p,-40,-50,CY,80,82);
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
    pEnemyAura(ctx,p,-32,-30+floatY,FB,64,70);
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
    pEnemyAura(ctx,p,-12,-10+floatY,YE,28,18);
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
    pEnemyAura(ctx,p,-44,-44+floatY,VV,88,82);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.18 + pulse * 0.18;
    pEnemyAura(ctx,p,-30,-44+floatY,GM,60,84);
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
    pEnemyAura(ctx,p,-40,-46+floatY,DM,80,82);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.14 + pulse * 0.14;
    pEnemyAura(ctx,p,-28,-50+floatY,HRL,56,40);
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
    pEnemyAura(ctx,p,-52,-54+floatY,VL,104,108);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.18 + pulse * 0.16;
    pEnemyAura(ctx,p,-40,-58+floatY,VH,80,52);
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
    pEnemyAura(ctx,p,-38,-42+floatY,BB,76,80);
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
    pEnemyAura(ctx,p,-40,-44+floatY,GB,80,82);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.16 + gaze * 0.18;
    pEnemyAura(ctx,p,-32,-46+floatY,AU,64,60);
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

// ── Window Exports ────────────────────────────────────────────────────────
window.drawCerberus = drawCerberus;
window.drawCharon = drawCharon;
window.drawBeelzebub = drawBeelzebub;
window.drawLucifer = drawLucifer;
window.drawLilith = drawLilith;
