/* pix_tier3.js - Tier 3 Exorcists (Advanced Units) */

function drawMidas(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.003) * 4;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep       = (Math.sin(now * 0.005) + 1) / 2;
    const orbPulse = (Math.sin(now * 0.006) + 1) / 2;
    const ang      = now * 0.002;
    const CO='#000000';
    const PS='#2A0050', PM='#4A0080', PB='#7B1FA2', PL='#AB47BC', PH='#E1BEE7';
    const GS='#7A5800', GM='#B8860B', GB='#FFD700', GL='#FFE57F', GH='#FFFDE7', GW='#FFFFD8';
    const SAP='#1565C0', RUB='#C62828', RUH='#FF6E6E', EM='#00C853';
    const SK='#F5C090';

    // ── gold rain aura
    ctx.save(); ctx.globalAlpha = 0.15 + ep * 0.22;
    pUnit(ctx,cx,cy,-22,-44+idleY,GB,44,76,isLeft,S);
    ctx.restore();

    // ── 5 ORBITING GOLD ORBS (was 3, varying radius)
    for (let i = 0; i < 5; i++) {
        const a   = ang + i * (Math.PI * 2 / 5);
        const r   = 18 + (i % 2) * 6;
        const ox2 = Math.cos(a) * r;
        const oy2 = Math.sin(a) * r * 0.55 - 6;
        p(ox2-3, oy2-3, CO, 7, 7);
        p(ox2-2, oy2-2, GM, 5, 5);
        p(ox2-2, oy2-2, GH, 5, 1);                                                // top highlight
        p(ox2-1, oy2-1, GB, 3, 3);
        p(ox2,   oy2,   GL, 1, 1);
        ctx.save(); ctx.globalAlpha = 0.50 + orbPulse * 0.30;
        pUnit(ctx,cx,cy,ox2-2,oy2-2+idleY,GW,5,5,isLeft,S);
        ctx.restore();
    }

    // ── BOOTS (purple + gold cuff)
    p(-7,14,CO,7,9); p(-6,15,PS,5,8); p(-4,16,GB,2,5);
    p( 1,14,CO,6,9); p( 2,15,PS,5,8); p( 3,16,GB,2,5);
    p(-7,14,GB,7,1); p( 1,14,GB,6,1);

    // ── ROBE LOWER (purple, gold stripes + 4 jewel inlay)
    p(-8,2,CO,16,13); p(-7,3,PS,14,11); p(-6,4,PM,11,9); p(-5,5,PB,7,7);
    p(-7,3,PH,14,1);                                                              // top highlight
    p(-5,4,GB,1,10); p( 4,4,GB,1,10);                                             // gold vertical stripes
    p(-2,6,GB,1,8); p( 1,7,GB,1,7);
    // Jewel belt row
    p(-8,0,CO,16,5); p(-7,1,GS,14,4); p(-7,1,GM,14,1);
    p(-4,1,SAP,2,2); p(-1,1,RUB,2,2); p( 2,1,SAP,2,2); p( 5,1,EM,2,2);
    p(-7,12,CO,14,3); p(-6,13,GM,12,2); p(-6,13,GB,12,1);                         // gold hem
    for (let r=0; r<2; r++) { p(-6,5+r*4,GB,1,1); p(5,5+r*4,GB,1,1); }            // gold rivets

    // ── UPPER ROBE (riveted, gold pectoral)
    p(-7,-14,CO,15,15); p(-6,-13,PS,13,13); p(-5,-12,PM,10,11); p(-4,-11,PB,7,9); p(-3,-10,PL,4,7);
    p(-6,-13,PH,13,1);                                                            // top highlight
    p(-5,-12,GB,1,10); p( 3,-11,GB,1,9); p(-2,-10,GB,1,8);                        // gold trims
    // Gold pectoral plate w/ ruby gem
    p(-5,-2,CO,10,4); p(-4,-1,GS,8,3); p(-1,-1,GB,3,2);
    p(-3,-6,CO,6,5); p(-2,-5,GM,4,3); p(-2,-5,GB,4,1);
    p(-1,-4,RUB,2,1); p(-1,-4,RUH,2,1);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.35;
    pUnit(ctx,cx,cy,-3,-6+idleY,GW,6,5,isLeft,S);
    ctx.restore();
    for (let r=0; r<3; r++) { p(-6,-10+r*4,GB,1,1); p(5,-10+r*4,GB,1,1); }        // gold rivets

    // ── PAULDRONS (gold-capped purple)
    p(-12,-12,CO,8,9); p(-11,-11,GM,6,8); p(-10,-10,GB,4,7); p(-11,-11,GH,6,1);
    p(-11,-12,GW,6,1);
    p( 6,-12,CO,8,9); p( 7,-11,GM,6,8); p( 8,-10,GB,4,7); p( 7,-11,GH,6,1);
    p( 7,-12,GW,6,1);

    // ── ARMS + HANDS
    p(-10,-10,CO,5,12); p(-9,-9,PM,4,10); p(-9,-9,PL,4,1);
    p(-10,-17,CO,5,8); p(-9,-16,SK,4,6);
    p( 7,-10,CO,5,12); p( 8,-9,PM,4,10); p( 8,-9,PL,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,SK,4,6);

    // ── GOLD SCEPTER (taller, multi-layer crown jewels)
    p(9,-54,CO,4,44); p(10,-53,GS,3,42); p(10,-50,GM,2,36); p(10,-46,GB,2,30);    // shaft
    p(9,-44,GB,4,1); p(9,-32,GB,4,1); p(9,-20,GB,4,1); p(9,-8,GB,4,1);            // gold bands
    // Scepter crown jewel (multi-layered)
    p(6,-62,CO,12,12); p(7,-61,GM,10,10); p(8,-60,GB,8,8); p(9,-59,GL,6,6);
    p(7,-61,GW,10,1);                                                             // top highlight
    p(10,-58,GH,4,4); p(11,-57,'#FFFFFF',2,2);
    // Ruby gem at scepter tip
    p(10,-66,CO,4,5); p(11,-65,RUB,2,3); p(11,-65,RUH,2,1);
    // Sub-jewels on crown
    p( 6,-58,SAP,1,1); p(17,-58,EM,1,1); p( 6,-54,EM,1,1); p(17,-54,SAP,1,1);
    ctx.save(); ctx.globalAlpha = 0.55 + orbPulse * 0.40;
    pUnit(ctx,cx,cy,7,-61+idleY,GW,10,10,isLeft,S);
    ctx.restore();

    // ── NECK
    p(-2,-16,CO,5,3); p(-1,-15,SK,3,2);

    // ── HEAD (regal, golden-tinted face)
    p(-8,-30,CO,16,14); p(-7,-29,'#F5E0C0',14,12); p(-6,-28,SK,11,10); p(-5,-27,'#F5C878',8,8);
    p(-5,-23,CO,3,2); p( 2,-23,CO,3,2);
    p(-4,-23,GM,2,1); p( 3,-23,GM,2,1);
    p(-2,-21,CO,5,1);
    // Golden facial markings
    p(-6,-22,GB,1,1); p( 5,-22,GB,1,1);

    // ── RUBY TIARA CROWN (gold-multi-spire, ruby centerpiece)
    p(-8,-37,CO,16,8); p(-7,-36,GM,14,6); p(-6,-35,GB,11,4); p(-5,-34,GL,8,2);
    p(-7,-36,GW,14,1);                                                            // top highlight
    p(-8,-37,GS,16,1);                                                            // base
    // Center ruby spire
    p(-1,-41,CO,4,5); p( 0,-40,RUB,2,4); p( 0,-40,RUH,2,1);
    p(-1,-44,CO,2,3); p( 0,-43,GB,1,2); p( 0,-43,GW,1,1);
    // Side gold spires
    p(-7,-39,CO,3,4); p(-6,-38,GB,1,3);
    p( 5,-39,CO,3,4); p( 6,-38,GB,1,3);
    p(-7,-40,SAP,1,1); p( 6,-40,EM,1,1);                                          // side gems

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.78; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy, 6,-64+idleY,GW,18,16,isLeft,S);                          // scepter flash
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.50; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-10,-8+idleY,GL,26,34,isLeft,S);
        ctx.restore();
    }
}

function drawPhilosopher(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep        = (Math.sin(now * 0.005) + 1) / 2;
    const voidPulse = (Math.sin(now * 0.004) + 1) / 2;
    const cryY      = Math.sin(now * 0.003) * 6;
    const shdT      = now * 0.0015;
    const CO='#000000';
    const RS='#050505', RM='#0A0A0A', RB='#151515', RL='#222222', RH='#3A3A3A';
    const VS='#1A0038', VM='#4A0080', VB='#7B1FA2', VL='#9C27B0', VH='#CE93D8';
    const CY='#00ACC1', CL='#00E5FF', CH='#B2EBF2', CW='#E0FFFF';
    const PA='#C8B89A', PLA='#E8D8B8', PH='#F8E8C8';
    const GD='#FFD700';

    // ── void aura
    ctx.save(); ctx.globalAlpha = 0.16 + ep * 0.22;
    pUnit(ctx,cx,cy,-22,-56+idleY,VL,44,88,isLeft,S);
    ctx.restore();

    // ── 4 ORBITING VOIDSTONE SHARDS
    for (let i = 0; i < 4; i++) {
        const a   = shdT + i * (Math.PI / 2);
        const ox2 = Math.cos(a) * 19;
        const oy2 = Math.sin(a) * 11 - 8;
        p(ox2-2, oy2-2, CO, 5, 5);
        p(ox2-1, oy2-1, VM, 3, 3);
        p(ox2-1, oy2-1, VH, 3, 1);
        ctx.save(); ctx.globalAlpha = 0.55 + voidPulse * 0.30;
        pUnit(ctx,cx,cy,ox2-1,oy2-1+idleY,VL,3,3,isLeft,S);
        ctx.restore();
    }

    // ── HUGE FLOATING CRYSTAL (multi-faceted, bobbing)
    p(-5,-58+cryY,CO,11,18); p(-4,-57+cryY,VS,9,16); p(-3,-56+cryY,CY,7,14);
    p(-4,-57+cryY,CW,9,1);                                                        // top highlight
    p(-2,-54+cryY,CL,5,10);  p(-1,-52+cryY,CW,3,7);
    p(-5,-52+cryY,CO,11,5); p(-4,-51+cryY,CH,9,3);                                // facet band
    p( 0,-44+cryY,CW,1,3);                                                        // bottom point
    // Sub-shards
    p(-7,-50+cryY,CO,3,4); p(-6,-49+cryY,VB,1,3);
    p( 4,-50+cryY,CO,3,4); p( 5,-49+cryY,VB,1,3);
    ctx.save(); ctx.globalAlpha = 0.60 + voidPulse * 0.35;
    pUnit(ctx,cx,cy,-5,-58+cryY+idleY,CW,11,18,isLeft,S);
    ctx.restore();

    // ── BOOTS
    p(-7,14,CO,7,9); p(-6,15,RS,5,8); p(-4,16,RM,3,6);
    p( 1,14,CO,6,9); p( 2,15,RS,5,8); p( 3,16,RM,3,6);
    p(-7,14,VB,7,1); p( 1,14,VB,6,1);

    // ── ROBE LOWER (dark, top-highlighted, void-glow)
    p(-8,2,CO,16,13); p(-7,3,RS,14,11); p(-6,4,RM,11,9); p(-5,5,RB,7,7);
    p(-7,3,RH,14,1);                                                              // top highlight
    p(-5,4,`rgba(74,0,128,${0.18+voidPulse*0.25})`,11,10);
    p(-7,12,CO,14,3); p(-6,13,VB,12,2); p(-6,13,VL,12,1);                         // void hem

    // ── BELT (gold w/ void gem)
    p(-8,0,CO,16,3); p(-7,1,RL,14,2); p(-7,1,RH,14,1);
    p(-2,0,CO,4,3); p(-1,1,VL,2,1);
    ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
    pUnit(ctx,cx,cy,-1,1+idleY,CW,2,1,isLeft,S);
    ctx.restore();

    // ── UPPER ROBE (riveted, void gem chest)
    p(-7,-14,CO,15,17); p(-6,-13,RS,13,15); p(-5,-12,RM,10,12); p(-4,-11,RB,7,10);
    p(-6,-13,RH,13,1);                                                            // top highlight
    p(-4,-10,`rgba(103,0,160,${0.25+voidPulse*0.30})`,8,12);
    p(-5,-14,CO,10,3); p(-4,-13,VB,8,2); p(-4,-13,VL,8,1);                        // collar
    // Void gem chest emblem
    p(-3,-6,CO,6,6); p(-2,-5,VM,4,4); p(-2,-5,VH,4,1); p(-1,-4,CL,2,2);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.35;
    pUnit(ctx,cx,cy,-3,-6+idleY,CW,6,6,isLeft,S);
    ctx.restore();
    for (let r=0; r<3; r++) { p(-6,-10+r*4,CL,1,1); p(5,-10+r*4,CL,1,1); }        // glowing rivets

    // ── PAULDRONS (dark, void-trim)
    p(-13,-13,CO,8,9); p(-12,-11,RM,6,8); p(-11,-11,RB,4,7); p(-12,-11,RH,6,1);
    p(-12,-12,VB,6,1);
    p( 6,-13,CO,8,9); p( 7,-11,RM,6,8); p( 8,-11,RB,4,7); p( 7,-11,RH,6,1);
    p( 7,-12,VB,6,1);

    // ── ARMS + HANDS
    p(-11,-10,CO,5,12); p(-10,-9,RM,4,10); p(-10,-9,RH,4,1);
    p(-11,-17,CO,5,8); p(-10,-16,PA,4,6);
    p( 7,-10,CO,5,12); p( 8,-9,RM,4,10); p( 8,-9,RH,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,PA,4,6);

    // ── PARCHMENT SCROLL (held off-hand, ornate)
    p(8,-7,CO,8,18); p(9,-6,PLA,6,16); p(9,-6,PH,6,1);                            // scroll body + highlight
    p(9,-3,'#5D4037',5,1); p(9,3,'#5D4037',5,1); p(9,9,'#5D4037',5,1);            // text lines
    p(8,-9,CO,8,3); p(9,-8,'#8B7355',6,2);                                        // top spool
    p(8,11,CO,8,3); p(9,12,'#8B7355',6,2);                                        // bottom spool
    p(8,-9,GD,8,1); p(8,13,GD,8,1);                                               // gold caps

    // ── NECK
    p(-2,-16,CO,5,3); p(-1,-15,RM,3,2);

    // ── HEAD (deep hood, glowing eyes)
    p(-8,-30,CO,16,14); p(-7,-29,RS,14,12); p(-6,-28,RM,12,10); p(-5,-27,RB,9,8);
    p(-7,-29,RH,14,1);                                                            // top highlight
    // Cyan glowing eyes
    p(-4,-24,CO,4,3); p( 1,-24,CO,4,3);
    p(-3,-23,isAtk?CW:CL,2,1); p( 2,-23,isAtk?CW:CL,2,1);
    ctx.save(); ctx.globalAlpha = 0.65 + voidPulse * 0.30;
    pUnit(ctx,cx,cy,-4,-24+idleY,CW,4,3,isLeft,S);
    pUnit(ctx,cx,cy, 1,-24+idleY,CW,4,3,isLeft,S);
    ctx.restore();

    // ── DEEP HOOD (taller w/ cyan-tipped antenna)
    p(-8,-36,CO,16,8); p(-7,-35,RS,14,7); p(-6,-34,RM,11,6); p(-5,-33,RB,8,5);
    p(-7,-35,RH,14,1);                                                            // top highlight
    p(-8,-38,CO,12,3); p(-7,-37,RM,10,2);                                         // peak
    // Hood antenna (cyan-tipped)
    p(-1,-42,CO,3,5); p( 0,-41,VB,1,4); p( 0,-43,CL,1,2);
    ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
    pUnit(ctx,cx,cy, 0,-43+idleY,CW,1,2,isLeft,S);
    ctx.restore();

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.78; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-5,-60+cryY+idleY,CW,16,22,isLeft,S);                     // crystal flash
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.50; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-10,-12+idleY,VL,26,44,isLeft,S);
        ctx.restore();
    }
}

function drawIllusion(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.004) * 3;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep    = (Math.sin(now * 0.005) + 1) / 2;
    const maskX = Math.sin(now * 0.003) * 14;
    const maskY = Math.cos(now * 0.004) * 9;
    const CO='#000000';
    const P1S='#1A0050', P1M='#311B92', P1B='#4527A0', P1L='#7E57C2', P1H='#B39DDB';
    const P2S='#560027', P2M='#880E4F', P2B='#AD1457', P2L='#E91E63', P2H='#F48FB1';
    const SV='#CFD8DC', SM='#ECEFF1', SH='#FFFFFF';
    const GD2='#B88000', GB='#FFD700', GH='#FFF4A0';
    const SK='#F5D0A0';

    // ── illusion aura (dual-color)
    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnit(ctx,cx,cy,-22,-48+idleY,P1L,22,80,isLeft,S);
    pUnit(ctx,cx,cy,  0,-48+idleY,P2L,22,80,isLeft,S);
    ctx.restore();

    // ── 2 LARGE FLOATING DRAMA MASKS (laughing + weeping, orbiting)
    // Laughing mask (white, gold-trim)
    p(maskX-16, maskY-9, CO, 11, 11);
    p(maskX-15, maskY-8, SH, 9, 9);
    p(maskX-15, maskY-8, GB, 9, 1);                                               // gold top trim
    p(maskX-14, maskY-7, SM, 7, 5);
    p(maskX-13, maskY-5, CO, 2, 1); p(maskX-11, maskY-5, CO, 2, 1);               // joy eyes
    p(maskX-14, maskY-2, CO, 7, 2); p(maskX-13, maskY-1, P2L, 5, 1);              // laughing mouth
    p(maskX-13, maskY-4, GB, 1, 1); p(maskX-11, maskY-4, GB, 1, 1);               // gold cheek studs
    ctx.save(); ctx.globalAlpha = 0.50 + ep * 0.30;
    pUnit(ctx,cx,cy,maskX-16,maskY-9+idleY,SH,11,11,isLeft,S);
    ctx.restore();

    // Weeping mask (dark, magenta-trim)
    p(-maskX+11, -maskY+5, CO, 11, 11);
    p(-maskX+12, -maskY+6, '#2A2A2A', 9, 9);
    p(-maskX+12, -maskY+6, P2M, 9, 1);                                            // magenta top trim
    p(-maskX+13, -maskY+7, '#424242', 7, 5);
    p(-maskX+13, -maskY+9, CO, 2, 1); p(-maskX+15, -maskY+9, CO, 2, 1);           // weeping eyes
    p(-maskX+13, -maskY+10, P1L, 1, 2); p(-maskX+16, -maskY+10, P1L, 1, 2);       // tear streaks
    p(-maskX+14, -maskY+13, CO, 5, 2); p(-maskX+15, -maskY+12, P2L, 3, 1);        // frown
    p(-maskX+12, -maskY+8, GB, 1, 1); p(-maskX+19, -maskY+8, GB, 1, 1);           // gold studs
    ctx.save(); ctx.globalAlpha = 0.50 + ep * 0.30;
    pUnit(ctx,cx,cy,-maskX+11,-maskY+5+idleY,P2L,11,11,isLeft,S);
    ctx.restore();

    // ── BOOTS (split color, gold-cuffed)
    p(-7,14,CO,7,9); p(-6,15,P1M,3,8); p(-3,15,P2M,3,8);
    p( 1,14,CO,6,9); p( 2,15,P1M,3,8); p( 5,15,P2M,3,8);
    p(-7,14,GB,7,1); p( 1,14,GB,6,1);
    p(-8,21,CO,4,4); p(-7,22,GB,2,2); p( 3,21,CO,4,4); p( 4,22,GB,2,2);           // gold ankle chains

    // ── ROBE LOWER (split, top-highlighted)
    p(-8,2,CO,16,13); p(-8,3,P1M,8,11); p( 0,3,P2M,8,11);
    p(-7,4,P1B,6,9); p( 1,4,P2B,6,9);
    p(-8,3,P1H,8,1); p( 0,3,P2H,8,1);                                             // top highlights
    p(-7,12,CO,14,3); p(-6,13,GD2,12,2); p(-6,13,GB,12,1);                        // gold hem
    // Vertical riveted center seam
    p(-1,2,CO,2,12); p( 0,3,GD2,1,11); p( 0,3,GB,1,1); p( 0,7,GB,1,1); p( 0,11,GB,1,1);

    // ── BELT (gold w/ split-jewel buckle)
    p(-8,0,CO,16,3); p(-7,1,GD2,14,2); p(-7,1,GB,14,1);
    p(-2,0,CO,4,3); p(-1,1,P1L,1,1); p( 0,1,P2L,1,1);                             // dual-color gem

    // ── UPPER TORSO (split)
    p(-7,-14,CO,15,17); p(-7,-13,P1M,7,15); p( 0,-13,P2M,8,15);
    p(-6,-12,P1B,5,12); p( 1,-12,P2B,6,12);
    p(-7,-13,P1H,7,1); p( 0,-13,P2H,8,1);                                         // top highlights
    p(-4,-5,P1L,2,2); p( 2,-5,P2L,2,2);
    // Riveted seam
    p(-1,-14,CO,2,16); p( 0,-13,GD2,1,15); p( 0,-9,GB,1,1); p( 0,-5,GB,1,1); p( 0,-1,GB,1,1);
    // Joker chest emblem (dual-color)
    p(-3,-8,CO,6,5); p(-2,-7,P1B,3,3); p( 1,-7,P2B,3,3);
    p(-1,-6,P1H,1,1); p( 0,-6,P2H,1,1);
    ctx.save(); ctx.globalAlpha = 0.50 + ep * 0.30;
    pUnit(ctx,cx,cy,-3,-8+idleY,'#FFFFFF',6,5,isLeft,S);
    ctx.restore();

    // ── PAULDRONS (split, gold-stud)
    p(-13,-12,CO,8,8); p(-12,-11,P1B,6,7); p(-11,-10,P1L,3,5); p(-12,-11,P1H,6,1);
    p(-12,-8,GB,2,2);
    p( 6,-12,CO,8,8); p( 7,-11,P2B,6,7); p( 8,-10,P2L,3,5); p( 7,-11,P2H,6,1);
    p( 7,-8,GB,2,2);

    // ── ARMS + HANDS
    p(-11,-10,CO,5,12); p(-10,-9,P1M,4,10); p(-10,-9,P1L,4,1);
    p(-11,-17,CO,5,8); p(-10,-16,SK,4,6);
    p( 7,-10,CO,5,12); p( 8,-9,P2M,4,10); p( 8,-9,P2L,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,SK,4,6);

    // ── TWIN SWORD-CANES (dual silver blades, held at sides)
    p(-13,4,CO,4,18); p(-12,5,SV,2,16); p(-12,5,SM,2,1);                          // L cane shaft
    p(-14,2,CO,6,4); p(-13,3,GB,4,2); p(-13,3,GH,4,1);                            // L pommel
    p(-14,22,CO,4,3); p(-13,22,P1L,2,1);                                          // L tip
    p( 10,4,CO,4,18); p( 11,5,SV,2,16); p( 11,5,SM,2,1);                          // R cane shaft
    p( 9,2,CO,6,4); p( 10,3,GB,4,2); p( 10,3,GH,4,1);                             // R pommel
    p( 9,22,CO,4,3); p( 10,22,P2L,2,1);                                           // R tip

    // ── NECK
    p(-2,-16,CO,5,3); p(-1,-15,SK,3,2);

    // ── HEAD (split-face makeup)
    p(-8,-30,CO,16,14); p(-7,-29,SK,14,12); p(-6,-28,'#F8E0B0',11,10);
    // Split face paint (left purple, right magenta)
    p(-7,-29,P1L,7,4); p( 0,-29,P2L,7,4);
    p(-5,-23,CO,3,2); p( 2,-23,CO,3,2);
    p(-4,-23,P1L,2,1); p( 3,-23,P2L,2,1);
    ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
    pUnit(ctx,cx,cy,-4,-23+idleY,'#FFFFFF',2,1,isLeft,S);
    pUnit(ctx,cx,cy, 3,-23+idleY,'#FFFFFF',2,1,isLeft,S);
    ctx.restore();
    p(-2,-21,CO,4,1);

    // ── JESTER CROWN (5-spire split-color w/ gold bells)
    p(-8,-36,CO,16,8); p(-8,-35,P1B,8,7); p( 0,-35,P2B,8,7);
    p(-8,-35,P1H,8,1); p( 0,-35,P2H,8,1);                                         // top highlights
    p(-8,-36,GB,16,1);                                                            // gold base ring
    // 5 horn spires (alternating colors)
    p(-7,-41,CO,4,6); p(-6,-40,P1M,2,5); p(-5,-42,P1L,1,2);                       // outer L
    p(-3,-43,CO,4,8); p(-2,-42,P2M,2,7); p(-1,-44,P2L,1,2);                       // inner L
    p( 1,-46,CO,4,11); p( 2,-45,P1M,2,10); p( 3,-47,P1L,1,3);                     // center tallest
    p( 5,-43,CO,4,8); p( 6,-42,P2M,2,7); p( 7,-44,P2L,1,2);                       // inner R
    p( 8,-41,CO,3,6); p( 9,-40,P1M,1,5); p( 9,-42,P1L,1,2);                       // outer R
    // Gold bells on tips
    p(-5,-42,GB,1,1); p(-1,-44,GB,1,1); p( 3,-47,GB,1,1); p( 7,-44,GB,1,1); p( 9,-42,GB,1,1);

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.55; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,maskX-18,maskY-11+idleY,SH,14,14,isLeft,S);
        pUnit(ctx,cx,cy,-maskX+9,-maskY+3+idleY,P2L,14,14,isLeft,S);
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.45; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-10,-16+idleY,P1L,24,38,isLeft,S);
        pUnit(ctx,cx,cy,  0,-16+idleY,P2L,12,38,isLeft,S);
        ctx.restore();
    }
}

function drawReflection(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep    = (Math.sin(now * 0.005) + 1) / 2;
    const pulse = (Math.sin(now * 0.006) + 1) / 2;
    const ang   = now * 0.0025;
    const CO='#000000';
    const AS='#C5D5E0', AM='#D8E8F0', AB='#E8F4FC', AL='#F0F8FF', AH='#FFFFFF';
    const CY='#00B8D4', CL='#00E5FF', CH='#B2EBF2';
    const RBC = ['#FF5252','#FFD740','#00E676','#40C4FF','#B388FF','#FF8FAB'];
    const SK='#F0D8C0';
    const GD2='#B88000', GD='#FFD700';

    // ── prismatic aura
    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.20;
    pUnit(ctx,cx,cy,-22,-44+idleY,AH,44,76,isLeft,S);
    ctx.restore();

    // ── 6 RAINBOW SHARDS (was 4, full spectrum orbit)
    for (let i = 0; i < 6; i++) {
        const a   = ang + i * (Math.PI / 3);
        const ox2 = Math.cos(a) * 20;
        const oy2 = Math.sin(a) * 12 - 6;
        p(ox2-2, oy2-4, CO, 5, 10);
        p(ox2-1, oy2-3, RBC[i], 3, 8);
        p(ox2-1, oy2-3, AH, 3, 1);                                                // top highlight
        p(ox2,   oy2-1, AH, 1, 3);
        ctx.save(); ctx.globalAlpha = 0.50 + pulse * 0.30;
        pUnit(ctx,cx,cy,ox2-2,oy2-4+idleY,RBC[i],5,10,isLeft,S);
        ctx.restore();
    }

    // ── HUGE SILVER MIRROR STAFF (ornate frame + multi-layer face)
    // Frame outer (gold-trimmed)
    p( 9,-14,CO,16,42); p(10,-13,GD2,14,40); p(10,-13,GD,14,1);                   // outer rim
    p(11,-12,AS,12,38);
    // Inner mirror face (cyan-sky reflection gradient)
    p(12,-10,CO,10,34); p(13,-9,AS,8,32); p(13,-9,AM,8,16);                       // sky half
    p(13,7,AB,8,16);                                                              // ground half reflection
    p(14,-7,`rgba(0,229,255,${0.25+pulse*0.35})`,6,28); p(14,2,CL,4,16);
    p(16,-4,AH,2,10);
    // Cross-glint pattern
    p(15,-6,AH,1,1); p(17,-3,AH,1,1); p(16,1,AH,1,1);
    ctx.save(); ctx.globalAlpha = 0.45 + pulse * 0.40;
    pUnit(ctx,cx,cy,13,-9+idleY,AH,8,32,isLeft,S);
    ctx.restore();
    // Gold corner studs
    p( 9,-14,CO,3,3); p(10,-13,GD,1,1);
    p(22,-14,CO,3,3); p(23,-13,GD,1,1);
    p( 9,25,CO,3,3); p(10,26,GD,1,1);
    p(22,25,CO,3,3); p(23,26,GD,1,1);
    // Hilt grip
    p(13,-2,CO,10,3); p(13,3,AM,9,2);
    p(17,-10,CO,3,22); p(18,-9,AM,2,20);

    // ── BOOTS (cyan-cuffed)
    p(-7,14,CO,7,9); p(-6,15,AS,5,8); p(-4,16,AL,3,6);
    p( 1,14,CO,6,9); p( 2,15,AS,5,8); p( 3,16,AL,3,6);
    p(-7,14,CL,7,1); p( 1,14,CL,6,1);

    // ── ROBE LOWER (white-silver, top-highlighted, cyan glow)
    p(-8,2,CO,16,13); p(-7,3,AS,14,11); p(-6,4,AM,11,9); p(-5,5,AB,7,7);
    p(-7,3,AH,14,1);                                                              // top highlight
    p(-3,6,`rgba(0,229,255,${0.18+pulse*0.22})`,7,6);
    p(-7,12,CO,14,3); p(-6,13,GD2,12,2); p(-6,13,GD,12,1);                        // gold hem

    // ── BELT (gold w/ prismatic gem)
    p(-8,0,CO,16,3); p(-7,1,GD2,14,2); p(-7,1,GD,14,1);
    p(-2,0,CO,4,3); p(-1,1,CL,2,1);

    // ── UPPER ROBE (riveted, prismatic chest emblem)
    p(-7,-14,CO,15,17); p(-6,-13,AS,13,15); p(-5,-12,AM,10,12); p(-4,-11,AB,7,10); p(-3,-10,AL,4,8);
    p(-6,-13,AH,13,1);                                                            // top highlight
    p(-2,-8,`rgba(0,229,255,${0.25+pulse*0.30})`,6,10);
    // Prismatic emblem (4 mini rainbow shards radiating)
    p(-3,-6,CO,6,6); p(-2,-5,AS,4,4); p(-2,-5,AH,4,1);
    p(-2,-5,RBC[0],1,4); p(-1,-5,RBC[2],1,4); p( 0,-5,RBC[3],1,4); p( 1,-5,RBC[1],1,4);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.35;
    pUnit(ctx,cx,cy,-3,-6+idleY,AH,6,6,isLeft,S);
    ctx.restore();
    for (let r=0; r<3; r++) { p(-6,-10+r*4,CL,1,1); p(5,-10+r*4,CL,1,1); }        // glowing rivets

    // ── PAULDRONS (silver-rim)
    p(-13,-12,CO,8,9); p(-12,-11,AS,6,8); p(-11,-11,AM,4,7); p(-10,-10,AL,2,5);
    p(-12,-11,AH,6,1);
    p(-12,-12,GD,6,1);
    p( 6,-12,CO,8,9); p( 7,-11,AS,6,8); p( 8,-11,AM,4,7); p( 9,-10,AL,2,5);
    p( 7,-11,AH,6,1);
    p( 7,-12,GD,6,1);

    // ── ARMS + HANDS
    p(-11,-10,CO,5,12); p(-10,-9,AM,4,10); p(-10,-9,AH,4,1);
    p(-11,-17,CO,5,8); p(-10,-16,SK,4,6);
    p( 7,-10,CO,5,12); p( 8,-9,AM,4,10); p( 8,-9,AH,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,SK,4,6);

    // ── NECK
    p(-2,-16,CO,5,3); p(-1,-15,AM,3,2);

    // ── HEAD (pale, cyan eye band)
    p(-8,-30,CO,16,14); p(-7,-29,AS,14,12); p(-6,-28,AM,11,10); p(-5,-27,AB,8,8);
    // Cyan visor band
    p(-5,-24,CO,11,4); p(-4,-23,`rgba(0,229,255,${0.70+pulse*0.30})`,9,3); p(-3,-23,AH,5,2);
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    pUnit(ctx,cx,cy,-4,-23+idleY,AH,9,3,isLeft,S);
    ctx.restore();

    // ── SILVER CROWN (multi-spire w/ rainbow gems)
    p(-6,-38,CO,12,10); p(-5,-37,AS,10,9); p(-4,-36,AM,7,7);
    p(-5,-37,AH,10,1);                                                            // top highlight
    p(-6,-38,GD,12,1);                                                            // gold base
    // Crown spires (4, rainbow gem-tipped)
    p(-5,-41,CO,3,4); p(-4,-40,AM,1,3); p(-4,-41,RBC[0],1,1);
    p(-2,-43,CO,3,6); p(-1,-42,AM,1,5); p(-1,-43,RBC[1],1,1);
    p( 1,-44,CO,3,7); p( 2,-43,AL,1,6); p( 2,-44,RBC[2],1,1);
    p( 4,-41,CO,3,4); p( 5,-40,AM,1,3); p( 5,-41,RBC[3],1,1);

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.78; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy, 8,-16+idleY,CL,20,44,isLeft,S);                          // mirror flash
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.50; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-10,-16+idleY,AH,24,42,isLeft,S);
        ctx.restore();
    }
}

function drawGrandSealer(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep   = (Math.sin(now * 0.005) + 1) / 2;
    const ang  = now * 0.0015;
    const streF = Math.sin(now * 0.004) * 1;
    const CO='#000000';
    const WR='#F0F4F8', WH='#FFFFFF', WS='#E8ECF0';
    const TE='#00897B', TL='#4DB6AC', TH='#80CBC4';
    const SK='#F5DCC7', DS='#E8C09A';
    const TA='#FFF8C0', CN='#D32F2F', CH='#FF6E6E';
    const GHL='#8D6E63', GD2='#B88000', GD='#FFD700';

    // ── sealing aura (gold)
    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.20;
    pUnit(ctx,cx,cy,-22,-44+idleY,GD,44,76,isLeft,S);
    ctx.restore();

    // ── 5 ORBITING SEALING TALISMANS (was 3, kanji-style)
    for (let i = 0; i < 5; i++) {
        const a  = ang + i * (Math.PI * 2 / 5);
        const tx = Math.cos(a) * 19;
        const ty = Math.sin(a) * 11 - 8;
        p(tx-2, ty-3, CO, 6, 9);
        p(tx-1, ty-2, TA, 4, 7);
        p(tx-1, ty-2, WH, 4, 1);                                                  // top highlight
        p(tx-1, ty   , CN, 4, 1);                                                 // red seal line
        p(tx,   ty+2 , CN, 1, 1);                                                 // seal dot
        ctx.save(); ctx.globalAlpha = 0.50 + ep * 0.30;
        pUnit(ctx,cx,cy,tx-2,ty-3+idleY,TA,6,9,isLeft,S);
        ctx.restore();
    }

    // ── BOOTS (white-tabi, teal cuffs)
    p(-7,14,CO,7,9); p(-6,15,WS,5,8); p(-4,16,WH,3,6);
    p( 1,14,CO,6,9); p( 2,15,WS,5,8); p( 3,16,WH,3,6);
    p(-7,14,TE,7,1); p( 1,14,TE,6,1);

    // ── LOWER ROBE (white w/ teal trim, top-highlighted)
    p(-8,2,CO,16,14); p(-7,3,WR,14,12); p(-6,4,WH,11,10);
    p(-7,3,WH,14,1);                                                              // top highlight
    p(-5,4,TL,3,10);                                                              // teal center stripe
    p(-8,14,CO,16,3); p(-7,15,TE,14,2); p(-6,16,TL,12,1);                         // teal hem

    // ── BELT (teal w/ gold buckle + bell)
    p(-8,-1,CO,16,3); p(-7,0,TE,14,2); p(-7,0,TH,14,1);
    p(-2,-1,CO,4,3); p(-1,0,GD,2,1);
    // Hanging bell ornament
    p(-2,3,CO,3,4); p(-1,4,GD2,1,3); p(-1,4,GD,1,1);

    // ── UPPER ROBE (white w/ teal collar)
    p(-7,-14,CO,15,17); p(-6,-13,WR,13,15); p(-5,-12,WH,10,12); p(-4,-11,WS,8,10);
    p(-6,-13,WH,13,1);                                                            // top highlight
    p(-7,-14,CO,15,3); p(-6,-13,TE,13,2); p(-5,-12,TL,11,1);                      // teal collar
    // Talisman emblem on chest
    p(-3,-7,CO,6,9); p(-2,-6,TA,4,7); p(-2,-6,WH,4,1);
    p(-2,-4,CN,4,1); p(-1,-2,CN,2,2); p(-1,0,CH,1,1);
    ctx.save(); ctx.globalAlpha = 0.50 + ep * 0.30;
    pUnit(ctx,cx,cy,-3,-7+idleY,TA,6,9,isLeft,S);
    ctx.restore();
    // Cuffs
    p(-9,-10,CO,4,6); p(-8,-9,TE,3,5); p(-8,-9,TH,3,1);
    p( 6,-10,CO,4,6); p( 7,-9,TE,3,5); p( 7,-9,TH,3,1);
    for (let r=0; r<2; r++) { p(-6,-9+r*5,CN,1,1); p(5,-9+r*5,CN,1,1); }          // red rivets

    // ── ARMS
    // Left arm raised (seal gesture)
    p(-10,-13,CO,5,12); p(-9,-12,WR,4,10); p(-9,-12,WH,4,1);
    p(-12,-19,CO,5,8); p(-11,-18,SK,4,6);
    // Right arm holding Gohei
    p(  6,-13,CO,5,12); p( 7,-12,WR,4,10); p( 7,-12,WH,4,1);
    p(  7,-21,CO,5,8); p( 8,-20,SK,4,6);

    // ── HEAD (shaved monk, gold-trim headband w/ kanji)
    p(-8,-30,CO,16,14); p(-7,-29,SK,14,12);
    p(-7,-30,DS,8,4);                                                             // forehead shading
    // Black headband
    p(-8,-24,CO,16,3); p(-7,-23,'#1A1A1A',14,2);
    p(-8,-24,GD,16,1);                                                            // gold trim top
    p(-7,-23,TE,14,1);                                                            // teal mid line
    // Central kanji seal (red on yellow)
    p(-4,-24,CO,5,4); p(-3,-23,TA,3,3); p(-2,-23,CN,1,3);
    // Eyes + mouth (closed meditation)
    p(-5,-23,CO,3,1); p( 2,-23,CO,3,1);                                           // closed eyes
    p(-2,-20,DS,5,1);
    p(-3,-19,CO,6,1);                                                             // serene mouth

    // ── SACRED GOHEI WAND (taller, multi-strand streamers + gold bell + tassel)
    p(9,-50,CO,3,32); p(10,-49,GHL,2,30);                                         // handle (taller)
    p(8,-46,GD,4,1); p(8,-36,GD,4,1); p(8,-26,GD,4,1);                            // gold grip bands
    // Top mount (gold-trim)
    p(8,-54,CO,8,6); p(9,-53,GD2,6,4); p(9,-53,GD,6,1);
    // Multi-strand zigzag streamers (5 strips total)
    // Strip 1 (left, longer)
    p(7,-62+streF,CO,4,12); p(8,-61+streF,WH,2,10); p(8,-61+streF,WS,2,1);
    p(7,-60+streF,CO,3,2); p(7,-56+streF,CO,3,2); p(7,-52+streF,CO,3,2);          // zigzag notches
    // Strip 2
    p(11,-64+streF,CO,4,14); p(12,-63+streF,WH,2,12); p(12,-63+streF,WS,2,1);
    p(11,-62+streF,CO,3,2); p(11,-58+streF,CO,3,2); p(11,-54+streF,CO,3,2);
    // Strip 3 (center, tallest)
    p(9,-68+streF,CO,4,18); p(10,-67+streF,WH,2,16); p(10,-67+streF,WS,2,1);
    p(9,-66+streF,CO,3,2); p(9,-62+streF,CO,3,2); p(9,-58+streF,CO,3,2); p(9,-54+streF,CO,3,2);
    // Strip 4
    p(13,-64-streF,CO,4,14); p(14,-63-streF,WH,2,12); p(14,-63-streF,WS,2,1);
    // Strip 5 (right)
    p(15,-62-streF,CO,4,12); p(16,-61-streF,WH,2,10); p(16,-61-streF,WS,2,1);
    // Teal seal squares between strips
    p(8,-50,TL,2,2); p(13,-50,TL,2,2);
    // Gold bell at base of streamers
    p(11,-54,CO,4,5); p(12,-53,GD,2,3); p(12,-53,'#FFFCC0',2,1);
    p(12,-49,CO,2,1); p(12,-49,GD2,2,1);                                          // bell clapper

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.78; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,7,-68+streF+idleY,WH,12,24,isLeft,S);                     // streamer flash
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.65; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,8,-36+idleY,'#FFD060',12,46,isLeft,S);                    // gold burst
        ctx.restore();
    }
}

function drawFlameMaster(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep        = (Math.sin(now * 0.005) + 1) / 2;
    const firePulse = (Math.sin(now * 0.010) + 1) / 2;
    const fSway     = Math.sin(now * 0.006) * 2;
    const CO='#000000', CH='#0A0A0A', CB='#1A1A1A', CV='#2A2A2A', DB='#2E1A00';
    const LV='#FF3D00', OL='#FF6D00', GF='#FFD600', GA='#FFAB00', LW='#FFFF80';
    const SK='#BF6030', FT='#FF4400', FTL='#FF9900';
    const GD2='#B88000', GD='#FFD700';
    const CN='#D32F2F';

    // ── inferno aura
    ctx.save(); ctx.globalAlpha = 0.16 + ep * 0.22;
    pUnit(ctx,cx,cy,-22,-44+idleY,LV,44,76,isLeft,S);
    ctx.restore();

    // ── EMBER POOL AT FEET
    ctx.save(); ctx.globalAlpha = 0.40 + firePulse * 0.30;
    pUnit(ctx,cx,cy,-2,10+idleY,LV,18,4,isLeft,S);
    ctx.restore();

    // ── BOOTS (charcoal w/ glowing ember cuffs)
    p(-7,14,CO,7,9); p(-6,15,CH,5,8); p(-4,16,CB,3,6);
    p( 1,14,CO,6,9); p( 2,15,CH,5,8); p( 3,16,CB,3,6);
    p(-7,14,LV,7,1); p( 1,14,LV,6,1);

    // ── LOWER ROBE (charcoal w/ multi-layer molten lava hem)
    p(-7,2,CO,14,14); p(-6,3,CH,12,12); p(-5,4,CB,8,10);
    p(-6,3,CV,12,1);                                                              // top highlight
    p(-6,13,CO,13,5); p(-5,14,LV,11,4);                                           // lava hem outline
    p(-4,15,OL,9,3); p(-3,16,GF,7,2); p(-2,17,LW,5,1);                            // lava layers
    for (let r=0; r<2; r++) { p(-5,5+r*4,LV,1,1); p(4,5+r*4,LV,1,1); }            // lava rivets

    // ── CHARCOAL SASH BELT (gold-trim, ember clasp)
    p(-5,-2,CO,11,4); p(-4,-1,DB,9,3); p(-4,-1,'#5A3010',9,1);
    p(-5,-2,GD2,11,1);                                                            // gold top trim
    p(-1,-1,CO,4,3); p(0,0,OL,2,1);
    ctx.save(); ctx.globalAlpha = 0.65 + firePulse * 0.30;
    pUnit(ctx,cx,cy,0,0+idleY,GF,2,1,isLeft,S);
    ctx.restore();

    // ── UPPER TORSO ROBE (charcoal, lava chest core)
    p(-6,-14,CO,13,17); p(-5,-13,CH,11,15); p(-4,-12,CB,8,13);
    p(-5,-13,CV,11,1);                                                            // top highlight
    // Molten sleeve edges
    p(-9,-10,CO,4,7); p(-8,-9,LV,3,5); p(-8,-9,OL,3,1);
    p( 6,-10,CO,4,7); p( 7,-9,LV,3,5); p( 7,-9,OL,3,1);
    // Lava chest core (glowing flame heart)
    p(-3,-9,CO,6,8); p(-2,-8,DB,4,6); p(-2,-8,LV,4,1);
    p(-2,-6,OL,4,3); p(-1,-4,GF,2,2); p( 0,-3,LW,1,1);
    ctx.save(); ctx.globalAlpha = 0.60 + firePulse * 0.35;
    pUnit(ctx,cx,cy,-3,-9+idleY,LW,6,8,isLeft,S);
    ctx.restore();
    for (let r=0; r<2; r++) { p(-5,-10+r*5,LV,1,1); p(4,-10+r*5,LV,1,1); }        // ember rivets

    // ── PAULDRONS (charcoal w/ ember vents)
    p(-12,-13,CO,7,8); p(-11,-12,CH,5,6); p(-10,-11,CB,3,4); p(-11,-12,CV,5,1);
    p(-10,-10,LV,3,1); p(-10,-8,OL,3,1);                                          // ember vents L
    p( 5,-13,CO,7,8); p( 6,-12,CH,5,6); p( 7,-11,CB,3,4); p( 6,-12,CV,5,1);
    p( 7,-10,LV,3,1); p( 7,-8,OL,3,1);                                            // ember vents R

    // ── ARMS
    // Right arm raised (burning talisman hand)
    p(-10,-13,CO,5,12); p(-9,-12,CH,4,10); p(-9,-12,CV,4,1);
    p(-12,-19,CO,5,8); p(-11,-18,SK,4,6);
    // Burning talisman (bigger, double-layer)
    p(-15,-27,CO,7,12); p(-14,-26,GA,5,10); p(-14,-26,GF,5,1);
    p(-13,-23,GF,3,4); p(-13,-22,LW,3,2);
    p(-13,-19,CN,3,1); p(-13,-17,CN,3,1);                                         // red seal lines
    ctx.save(); ctx.globalAlpha = 0.60 + firePulse * 0.30; ctx.globalCompositeOperation = 'lighter';
    pUnit(ctx,cx,cy,-15,-29+idleY,FTL,7,14,isLeft,S);
    ctx.restore();

    // Left arm (Inferno War Fan hand)
    p(  6,-13,CO,5,12); p( 7,-12,CH,4,10); p( 7,-12,CV,4,1);
    p(  7,-21,CO,5,8); p( 8,-20,SK,4,6);

    // ── NECK
    p(-2,-16,CO,5,3); p(-1,-15,SK,3,2);

    // ── HEAD (intense, scarred)
    p(-8,-30,CO,16,14); p(-7,-29,SK,14,12);
    // Eyes: glowing orange
    p(-5,-23,CO,3,2); p( 2,-23,CO,3,2);
    p(-4,-23,OL,2,1); p( 3,-23,OL,2,1);
    ctx.save(); ctx.globalAlpha = 0.65 + firePulse * 0.30;
    pUnit(ctx,cx,cy,-4,-23+idleY,LW,2,1,isLeft,S);
    pUnit(ctx,cx,cy, 3,-23+idleY,LW,2,1,isLeft,S);
    ctx.restore();
    // Battle scar
    p(-6,-26,SK,1,1); p(-5,-25,SK,1,1); p(-4,-24,SK,1,1);
    p(-3,-19,CO,6,1);                                                             // grim mouth

    // ── WILD FIRE TOPKNOT (taller, multi-flame strands)
    p(-8,-30,CO,16,3); p(-7,-29,CO,12,6); p(-6,-29,'#3A1A00',10,5);               // hair base
    p(-4,-36,CO,8,8); p(-3,-35,'#5A1A00',6,7);                                    // mid hair
    p(-1,-39,CO,4,5); p( 0,-38,FT,2,4);                                           // topknot bun
    p(-1,-42,CO,3,5); p( 0,-41,FT,1,4);                                           // top flame strand
    // 5 flame tufts radiating from topknot
    p(-3,-40,CO,3,4); p(-2,-39,FT,1,3); p(-2,-41,LW,1,1);                         // L flame
    p( 2,-40,CO,3,4); p( 3,-39,FT,1,3); p( 3,-41,LW,1,1);                         // R flame
    p( 0,-44,FT,2,3); p( 1,-46,LW,1,1);                                           // top flame
    ctx.save(); ctx.globalAlpha = 0.55 + firePulse * 0.35;
    pUnit(ctx,cx,cy,-3,-45+idleY,FT,8,8,isLeft,S);
    ctx.restore();

    // ── MASSIVE INFERNO WAR FAN (taller, multi-rib, gold-tipped)
    const fx = 10;
    // Ribs (6 alternating gold/red)
    for (let r = 0; r < 6; r++) {
        const rx = fx + r * 2 + fSway;
        p(rx,   -36, CO, 2, 32);
        p(rx,   -35, r % 2 === 0 ? '#5A0000' : GD2, 2, 30);
        p(rx,   -35, r % 2 === 0 ? '#8B0000' : GF, 2, 1);                         // top highlight
    }
    // Fan top edge (curved gold crescent)
    p(fx, -36+fSway, GD, 14, 2); p(fx, -36+fSway, '#FFFCC0', 14, 1);
    // Painted flame seal on fan face (multi-row)
    p(fx+1, -28+fSway, GF, 2, 2); p(fx+5, -28+fSway, GF, 2, 2); p(fx+9, -28+fSway, GF, 2, 2);
    p(fx+2, -22+fSway, FT, 1, 4); p(fx+6, -22+fSway, FT, 1, 4); p(fx+10, -22+fSway, FT, 1, 4);
    p(fx+1, -16+fSway, GA, 2, 2); p(fx+5, -16+fSway, GA, 2, 2); p(fx+9, -16+fSway, GA, 2, 2);
    // Fan handle base (gold)
    p(fx+11, -36+fSway, CO, 4, 28); p(fx+12, -35+fSway, GD2, 2, 26); p(fx+12, -35+fSway, GD, 2, 1);
    p(fx+11, -10+fSway, CO, 4, 4); p(fx+12, -9+fSway, GD, 2, 2);                  // pommel
    // Fire trail along fan top
    ctx.save(); ctx.globalAlpha = 0.55 + firePulse * 0.40; ctx.globalCompositeOperation = 'lighter';
    pUnit(ctx,cx,cy,fx,-40+fSway+idleY,FT,14,8,isLeft,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.40 + firePulse * 0.30;
    pUnit(ctx,cx,cy,fx,-38+fSway+idleY,FTL,14,4,isLeft,S);
    ctx.restore();

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.78; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,fx-2,-44+fSway+idleY,LW,20,46,isLeft,S);                  // fan unfolds
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.55; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-15,-30+idleY,FT,10,16,isLeft,S);                         // talisman flare
        ctx.restore();
    }
}

function drawVajrapani(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.003) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep         = (Math.sin(now * 0.005) + 1) / 2;
    const lightPulse = (Math.sin(now * 0.008) + 1) / 2;
    const haloRot    = now * 0.002;
    const CO='#000000';
    const BS='#5D3A1A', BM='#8B5A2B', BB='#A0522D', BL='#C68642', BH='#D4A050';
    const GS='#7A5800', GM='#B8860B', GB='#FFD700', GL='#FFE57F', GH='#FFFFF0', GW='#FFFCC0';
    const TS='#3E2723', TM='#5D4037', TB='#795548', TL='#A1887F';
    const LM='#1E6ADF', LL='#4FC3F7', LW='#FFFFFF';
    const RD='#D32F2F';

    // ── lightning aura
    ctx.save(); ctx.globalAlpha = 0.16 + ep * 0.22;
    pUnit(ctx,cx,cy,-22,-50+idleY,LL,44,82,isLeft,S);
    ctx.restore();

    // ── LIGHTNING HALO RING (orbiting bolts behind head, rotating)
    for (let i = 0; i < 6; i++) {
        const a = haloRot + i * (Math.PI / 3);
        const hx = Math.cos(a) * 14;
        const hy = Math.sin(a) * 14 - 30;
        p(hx-1, hy-1, CO, 3, 3);
        p(hx,   hy,   LL, 1, 1);
        ctx.save(); ctx.globalAlpha = 0.60 + lightPulse * 0.30;
        pUnit(ctx,cx,cy,hx-1,hy-1+idleY,LW,3,3,isLeft,S);
        ctx.restore();
    }

    // ── LIGHTNING-CORE GLOW (chest)
    ctx.save(); ctx.globalAlpha = 0.45 + lightPulse * 0.35;
    pUnit(ctx,cx,cy,-4,-12+idleY,LL,10,20,isLeft,S);
    ctx.restore();

    // ── MASSIVE 3-PRONG VAJRA SCEPTER (taller, glowing core)
    // Shaft
    p(10,-58,CO,5,54); p(11,-57,GS,4,52); p(11,-54,GM,3,46); p(11,-50,GB,2,40);
    p(10,-46,GB,5,1); p(10,-32,GB,5,1); p(10,-18,GB,5,1); p(10,-4,GB,5,1);        // gold bands
    // Central vajra orb (large, multi-layered)
    p( 6,-66,CO,14,12); p( 7,-65,GM,12,10); p( 8,-64,GB,9,8); p( 9,-63,GL,6,6);
    p( 7,-65,GW,12,1);                                                            // top highlight
    p(10,-61,LW,4,4);                                                             // bright center
    // 3 prongs at top
    p( 6,-70,CO,4,6); p( 7,-69,GB,2,5); p( 7,-71,GL,2,1);                         // L prong
    p(11,-72,CO,4,8); p(12,-71,GL,2,7); p(12,-73,LW,2,1);                         // center prong (tallest)
    p(16,-70,CO,4,6); p(17,-69,GB,2,5); p(17,-71,GL,2,1);                         // R prong
    // 3 prongs at bottom
    p( 6,-54,CO,4,6); p( 7,-53,GB,2,5); p( 7,-50,GL,2,1);
    p(11,-52,CO,4,8); p(12,-51,GL,2,7); p(12,-46,LW,2,1);
    p(16,-54,CO,4,6); p(17,-53,GB,2,5); p(17,-50,GL,2,1);
    // Lightning arcing between prongs
    ctx.save(); ctx.globalAlpha = 0.65 + lightPulse * 0.30;
    pUnit(ctx,cx,cy, 7,-65+idleY,LL,12,10,isLeft,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.55 + lightPulse * 0.30;
    pUnit(ctx,cx,cy, 8,-73+idleY,LW,8,3,isLeft,S);
    pUnit(ctx,cx,cy, 8,-48+idleY,LW,8,3,isLeft,S);
    ctx.restore();

    // ── KNEELING LOTUS BASE (monk pose)
    p(-8,8,CO,16,15); p(-7,9,TS,14,13); p(-6,10,TM,11,11); p(-5,11,TB,7,9);
    p(-7,9,TL,14,1);                                                              // top highlight
    p(-4,10,CO,2,6); p(-1,10,CO,2,7); p(2,11,CO,2,6); p(5,10,CO,2,5);
    p(-3,11,TL,1,5); p( 0,11,TL,1,6);
    // Gold lotus petals at base
    p(-9,18,CO,4,3); p(-8,19,GB,2,2);
    p( 5,18,CO,4,3); p( 6,19,GB,2,2);

    // ── BOOTS (under robe)
    p(-7,14,CO,7,9); p(-6,15,TM,5,8); p(-4,16,TB,3,6);
    p( 1,14,CO,6,9); p( 2,15,TM,5,8); p( 3,16,TB,3,6);
    p(-7,14,GB,7,1); p( 1,14,GB,6,1);

    // ── LOWER ROBE (earth-brown, gold trim)
    p(-8,2,CO,16,7); p(-7,3,BS,14,5); p(-6,4,BM,11,4); p(-4,5,BL,7,3);
    p(-7,3,BH,14,1);                                                              // top highlight
    p(-8,2,GB,16,1);                                                              // gold belt-line

    // ── UPPER ROBE (brown w/ gold lightning seal)
    p(-7,-14,CO,14,17); p(-6,-13,BS,12,15); p(-5,-12,BM,9,12); p(-4,-11,BB,6,10); p(-3,-10,BL,4,8);
    p(-6,-13,BH,12,1);                                                            // top highlight
    p(-3,-12,BH,2,6); p( 1,-12,BH,2,6); p(-1,-6,BH,2,4);                          // brown panels
    // Lightning glyph on chest (cyan zigzag, was simpler)
    p(-2,-10,LM,5,1); p(-1,-8,LL,4,1); p(-4,-6,LM,6,1); p(-2,-4,LL,4,1);
    p(-1,-7,LW,1,1); p(-2,-5,LW,1,1);                                             // bright bolts
    ctx.save(); ctx.globalAlpha = 0.55 + lightPulse * 0.30;
    pUnit(ctx,cx,cy,-4,-10+idleY,LL,9,8,isLeft,S);
    ctx.restore();
    for (let r=0; r<3; r++) { p(-6,-10+r*4,LL,1,1); p(5,-10+r*4,LL,1,1); }        // lightning rivets

    // ── PAULDRONS (gold, top-highlighted)
    p(-13,-12,CO,8,9); p(-12,-11,GM,6,8); p(-11,-10,GB,4,7); p(-10,-9,GL,2,5);
    p(-12,-11,GW,6,1);
    p( 6,-12,CO,8,9); p( 7,-11,GM,6,8); p( 8,-10,GB,4,7); p( 9,-9,GL,2,5);
    p( 7,-11,GW,6,1);

    // ── ARMS + HANDS
    p(-11,-10,CO,5,12); p(-10,-9,BM,4,10); p(-10,-9,BL,4,1);
    p(-11,-17,CO,5,8); p(-10,-16,BL,4,6);
    p( 7,-10,CO,5,12); p( 8,-9,BM,4,10); p( 8,-9,BL,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,BL,4,6);

    // ── NECK
    p(-3,-16,CO,7,4); p(-2,-15,BS,5,3);

    // ── HEAD (wrathful monk face)
    p(-8,-30,CO,16,14); p(-7,-29,BS,14,12); p(-6,-28,BM,11,10); p(-5,-27,BB,8,8); p(-4,-26,BL,5,6);
    // Fang grimace (full mouth)
    p(-4,-22,CO,9,3); p(-3,-21,'#FFFFFF',7,2);
    p(-3,-22,CO,1,2); p(-1,-22,CO,1,2); p( 1,-22,CO,1,2); p( 3,-22,CO,1,2);       // teeth gaps
    // Wrathful eyes (lightning blue, glaring)
    p(-5,-25,CO,4,3); p( 1,-25,CO,4,3);
    p(-4,-24,LL,2,1); p( 2,-24,LL,2,1);
    ctx.save(); ctx.globalAlpha = 0.70 + lightPulse * 0.25;
    pUnit(ctx,cx,cy,-4,-24+idleY,LW,2,1,isLeft,S);
    pUnit(ctx,cx,cy, 2,-24+idleY,LW,2,1,isLeft,S);
    ctx.restore();
    // Third eye (gold center)
    p(-1,-27,CO,3,3); p( 0,-26,GB,1,1); p( 0,-26,LW,1,1);

    // ── FLAMED CROWN / TOPKNOT (gold w/ lightning crystal)
    p(-8,-36,CO,16,8); p(-7,-35,GS,14,7); p(-6,-34,GM,11,5); p(-5,-33,GB,8,3); p(-3,-36,GL,5,2);
    p(-7,-35,GW,14,1);                                                            // top highlight
    p(-8,-36,GB,16,1);                                                            // gold base
    // Lightning crystal on crown
    p(-2,-40,CO,4,5); p(-1,-39,LM,2,4); p(-1,-39,LL,2,1);
    p(-1,-42,CO,2,3); p( 0,-41,LW,1,2);
    ctx.save(); ctx.globalAlpha = 0.65 + lightPulse * 0.30;
    pUnit(ctx,cx,cy, 0,-42+idleY,LW,1,2,isLeft,S);
    ctx.restore();
    // Side spikes
    p(-7,-39,CO,3,4); p(-6,-38,GB,1,3);
    p( 5,-39,CO,3,4); p( 6,-38,GB,1,3);

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.78; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy, 6,-74+idleY,LW,18,18,isLeft,S);                          // vajra flash
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.50; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-6,-16+idleY,LL,16,40,isLeft,S);
        ctx.restore();
    }
}

function drawSaint(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.001) * 3;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep        = (Math.sin(now * 0.004) + 1) / 2;
    const haloPulse = (Math.sin(now * 0.005) + 1) / 2;
    const dovT      = now * 0.0014;
    const CO='#000000';
    const WS='#E8E8E8', WM='#F0F0F0', WB='#F8F8F8', WH='#FFFFFF';
    const GS='#7A5800', GM='#B8860B', GB='#FFD700', GL='#FFE57F', GH='#FFFDE7', GW='#FFFCC0';
    const SK='#F5DCC7', DS='#E8C09A', GHL='#8D6E63';

    // ── divine aura
    ctx.save(); ctx.globalAlpha = 0.16 + ep * 0.22;
    pUnit(ctx,cx,cy,-22,-48+idleY,GB,44,80,isLeft,S);
    ctx.restore();

    // ── HOLY NIMBUS ELLIPSE AT FEET (pulsing larger)
    ctx.save(); ctx.globalAlpha = 0.30 + haloPulse * 0.25;
    pUnit(ctx,cx,cy,-10,16+idleY,GB,22,5,isLeft,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.50 + haloPulse * 0.30;
    pUnit(ctx,cx,cy,-8,17+idleY,GL,18,3,isLeft,S);
    ctx.restore();

    // ── 4 ORBITING DOVES (small white sparks at corners)
    for (let i = 0; i < 4; i++) {
        const a  = dovT + i * (Math.PI / 2);
        const dx = Math.cos(a) * 20;
        const dy = Math.sin(a) * 12 - 18;
        p(dx-1, dy-1, CO, 3, 3);
        p(dx,   dy,   WH, 1, 1);
        ctx.save(); ctx.globalAlpha = 0.65;
        pUnit(ctx,cx,cy,dx-1,dy-1+idleY,GL,3,3,isLeft,S);
        ctx.restore();
    }

    // ── TALL GOLDEN SCEPTER (multi-layer crystal w/ cross top)
    p( 9,-50,CO,4,40); p(10,-49,GHL,3,38); p(10,-46,GS,3,32); p(10,-42,GM,2,26);  // shaft
    p(9,-40,GB,4,1); p(9,-28,GB,4,1); p(9,-16,GB,4,1);                            // gold bands
    // Crystal orb top (multi-layer, larger)
    p( 6,-58,CO,12,14); p( 7,-57,GM,10,12); p( 8,-56,GB,8,10); p( 9,-55,GL,5,7);
    p( 7,-57,GW,10,1);                                                            // top highlight
    p(10,-53,WH,4,4);                                                             // bright center
    // Gold cross atop crystal
    p(10,-66,CO,4,8); p(11,-65,GB,2,6); p(11,-65,GW,2,1);
    p( 8,-64,CO,8,3); p( 9,-63,GB,6,1);
    ctx.save(); ctx.globalAlpha = 0.60 + haloPulse * 0.35;
    pUnit(ctx,cx,cy, 7,-57+idleY,GW,10,12,isLeft,S);
    ctx.restore();

    // ── HUGE GOLDEN HALO RING (behind head, pulsing)
    p(-11,-36,CO,22,4); p(-10,-35,GM,20,3); p(-9,-35,GB,16,1);
    p(-11,-36,GW,22,1);                                                           // top highlight
    p(-12,-34,CO,3,3); p(11,-34,CO,3,3);                                          // side caps
    p(-11,-33,GB,1,2); p(12,-33,GB,1,2);
    ctx.save(); ctx.globalAlpha = 0.55 + haloPulse * 0.40;
    pUnit(ctx,cx,cy,-11,-36+idleY,GL,22,4,isLeft,S);
    ctx.restore();
    // Halo rays (5 small protrusions)
    p(-9,-39,GB,1,2); p(-4,-40,GB,1,3); p( 0,-41,GW,1,2); p( 4,-40,GB,1,3); p( 9,-39,GB,1,2);

    // ── BOOTS (gold-cuffed)
    p(-7,14,CO,7,9); p(-6,15,WS,5,8); p(-4,16,WM,3,6);
    p( 1,14,CO,6,9); p( 2,15,WS,5,8); p( 3,16,WM,3,6);
    p(-7,14,GB,7,1); p( 1,14,GB,6,1);

    // ── LOWER ROBE (pristine white, top-highlighted, gold center column)
    p(-8,2,CO,16,13); p(-7,3,WS,14,11); p(-6,4,WM,11,9); p(-5,5,WB,7,7);
    p(-7,3,WH,14,1);                                                              // top highlight
    p(-2,2,CO,5,13); p(-1,3,GS,3,11); p( 0,4,GM,2,9); p( 0,4,GB,2,1);             // gold column
    p(-7,12,CO,14,3); p(-6,13,GM,12,2); p(-6,13,GB,12,1);                         // gold hem

    // ── BELT (gold-trim w/ holy gem)
    p(-8,0,CO,16,3); p(-7,1,GM,14,2); p(-7,1,GB,14,1);
    p(-2,0,CO,4,3); p(-1,1,GW,2,1);

    // ── UPPER ROBE (riveted, gold cross emblem)
    p(-7,-14,CO,15,17); p(-6,-13,WS,13,15); p(-5,-12,WM,10,12); p(-4,-11,WB,7,10); p(-3,-10,WH,4,8);
    p(-6,-13,WH,13,1);                                                            // top highlight
    p(-2,-13,CO,5,16); p(-1,-12,GS,3,14); p( 0,-11,GM,2,12); p( 0,-8,GB,2,6);     // gold scripture
    // Glowing gold cross emblem (overlay)
    p(-1,-9,CO,3,8); p( 0,-8,GW,1,6);
    p(-3,-6,CO,7,3); p(-2,-5,GW,5,1);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.30;
    pUnit(ctx,cx,cy,-1,-9+idleY,GW,3,8,isLeft,S);
    pUnit(ctx,cx,cy,-3,-6+idleY,GW,7,3,isLeft,S);
    ctx.restore();
    for (let r=0; r<3; r++) { p(-6,-10+r*4,GB,1,1); p(5,-10+r*4,GB,1,1); }        // gold rivets

    // ── PAULDRONS (white w/ gold-trim)
    p(-13,-12,CO,8,9); p(-12,-11,WS,6,8); p(-11,-11,WM,4,7); p(-12,-11,WH,6,1);
    p(-12,-12,GB,6,1);
    p( 6,-12,CO,8,9); p( 7,-11,WS,6,8); p( 8,-11,WM,4,7); p( 7,-11,WH,6,1);
    p( 7,-12,GB,6,1);

    // ── ARMS + HANDS
    p(-11,-10,CO,5,12); p(-10,-9,WM,4,10); p(-10,-9,WH,4,1);
    p(-11,-17,CO,5,8); p(-10,-16,SK,4,6);
    p( 7,-10,CO,5,12); p( 8,-9,WM,4,10); p( 8,-9,WH,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,SK,4,6);

    // ── NECK
    p(-3,-16,CO,7,3); p(-2,-15,SK,5,2);

    // ── HEAD (serene, golden eyes)
    p(-8,-30,CO,16,14); p(-7,-29,SK,14,12); p(-6,-28,DS,11,10); p(-5,-27,'#F5C898',8,8);
    p(-5,-23,CO,3,1); p( 2,-23,CO,3,1);
    p(-4,-23,GL,2,1); p( 3,-23,GL,2,1);
    ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
    pUnit(ctx,cx,cy,-4,-23+idleY,GW,2,1,isLeft,S);
    pUnit(ctx,cx,cy, 3,-23+idleY,GW,2,1,isLeft,S);
    ctx.restore();
    p(-2,-21,CO,5,1);                                                             // serene mouth

    // ── HOLY CROWN (white w/ gold scripture cap)
    p(-8,-38,CO,16,8); p(-7,-37,WM,14,7); p(-6,-36,WH,11,6);
    p(-7,-37,WH,14,1);                                                            // top highlight
    p(-8,-38,GB,16,1);                                                            // gold base
    // Center gold spire w/ jewel
    p(-2,-42,CO,4,5); p(-1,-41,GB,2,4); p(-1,-41,GW,2,1);
    p(-1,-44,CO,2,3); p( 0,-43,GW,1,2);

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.78; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-13,-37+idleY,GB,26,7,isLeft,S);                          // halo flash
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.55; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy, 5,-60+idleY,GW,16,18,isLeft,S);                          // crystal flash
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.45; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-10,-16+idleY,GH,24,42,isLeft,S);
        ctx.restore();
    }
}

function drawAbyssalKiller(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep        = (Math.sin(now * 0.005) + 1) / 2;
    const edgePulse = (Math.sin(now * 0.005) + 1) / 2;
    const wingF     = Math.sin(now * 0.004) * 2;
    const CO='#000000';
    const VS='#050505', VM='#0A0A0A', VB='#121212', VL='#1A1A1A', VH='#2C2C2C';
    const PS='#1A0038', PM='#4A0080', PB='#7B1FA2', PL='#9C27B0', PH='#CE93D8', PW='#E1BEE7';
    const DS='#1A1A1A', DM='#424242', DL='#616161';
    const SK='#3A2040';
    const GD='#FFD700';

    // ── abyssal aura
    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnit(ctx,cx,cy,-26,-44+idleY,PB,52,76,isLeft,S);
    ctx.restore();

    // ── SHADOW POOL AT FEET
    p(-9,20,CO,18,6); p(-8,21,`rgba(74,0,128,${0.4+edgePulse*0.3})`,16,5); p(-7,22,PS,13,3);

    // ── BAT-WING CAPE (3 layer per side, taller, fluttering)
    // Left wing: outer membrane
    p(-22,-22+wingF,CO,12,30); p(-21,-21+wingF,DS,10,28); p(-21,-21+wingF,DM,10,1);
    p(-20,-20+wingF,VM,8,24); p(-19,-19+wingF,VB,5,18);
    // Wing bones (3 dark ribs)
    p(-22,-20+wingF,VL,1,26); p(-18,-18+wingF,VL,1,22); p(-14,-16+wingF,VL,1,18);
    // Wing claw spike tips
    p(-23,-24+wingF,CO,3,4); p(-22,-23+wingF,DM,1,2);                             // top claw
    p(-23,2+wingF,CO,3,4); p(-22,3+wingF,DM,1,2);                                 // bottom claw
    // Purple membrane glow trim
    p(-22,-22+wingF,PL,1,30); p(-22,-22+wingF,PB,12,1);
    ctx.save(); ctx.globalAlpha = 0.45 + edgePulse * 0.30;
    pUnit(ctx,cx,cy,-22,-22+wingF+idleY,PL,12,30,isLeft,S);
    ctx.restore();

    // Right wing (mirror)
    p(11,-22-wingF,CO,12,30); p(12,-21-wingF,DS,10,28); p(12,-21-wingF,DM,10,1);
    p(13,-20-wingF,VM,8,24); p(14,-19-wingF,VB,5,18);
    p(11,-20-wingF,VL,1,26); p(15,-18-wingF,VL,1,22); p(19,-16-wingF,VL,1,18);
    p(21,-24-wingF,CO,3,4); p(22,-23-wingF,DM,1,2);
    p(21,2-wingF,CO,3,4); p(22,3-wingF,DM,1,2);
    p(22,-22-wingF,PL,1,30); p(11,-22-wingF,PB,12,1);
    ctx.save(); ctx.globalAlpha = 0.45 + edgePulse * 0.30;
    pUnit(ctx,cx,cy,11,-22-wingF+idleY,PL,12,30,isLeft,S);
    ctx.restore();

    // ── BOOTS (void-cuffed)
    p(-7,14,CO,7,9); p(-6,15,VS,5,8); p(-4,16,VM,3,6);
    p( 1,14,CO,6,9); p( 2,15,VS,5,8); p( 3,16,VM,3,6);
    p(-7,14,PB,7,1); p( 1,14,PB,6,1);

    // ── ROBE LOWER (void-black, purple glow under)
    p(-8,2,CO,16,13); p(-7,3,VS,14,11); p(-6,4,VM,11,9); p(-5,5,VB,7,7);
    p(-7,3,VH,14,1);                                                              // top highlight
    p(-7,3,`rgba(74,0,128,${0.12+edgePulse*0.18})`,14,12);
    p(-7,12,CO,14,3); p(-6,13,PM,12,2); p(-6,13,PL,12,1);                         // purple hem

    // ── BELT (void w/ purple gem)
    p(-8,0,CO,16,3); p(-7,1,VL,14,2); p(-7,1,VH,14,1);
    p(-2,0,CO,4,3); p(-1,1,PL,2,1);
    ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
    pUnit(ctx,cx,cy,-1,1+idleY,PW,2,1,isLeft,S);
    ctx.restore();

    // ── UPPER ROBE (riveted, purple-glow void gem chest)
    p(-7,-14,CO,15,17); p(-6,-13,VS,13,15); p(-5,-12,VM,10,12); p(-4,-11,VB,7,10);
    p(-6,-13,VH,13,1);                                                            // top highlight
    p(-7,-13,`rgba(74,0,128,${0.22+edgePulse*0.25})`,14,16);
    p(-6,-5,PB,1,8); p( 5,-5,PB,1,8);                                             // purple side strips
    // Void gem chest emblem
    p(-3,-6,CO,6,6); p(-2,-5,PM,4,4); p(-2,-5,PH,4,1); p(-1,-4,PW,2,2);
    ctx.save(); ctx.globalAlpha = 0.60 + edgePulse * 0.35;
    pUnit(ctx,cx,cy,-3,-6+idleY,PL,6,6,isLeft,S);
    ctx.restore();
    for (let r=0; r<3; r++) { p(-6,-10+r*4,PL,1,1); p(5,-10+r*4,PL,1,1); }        // glowing rivets

    // ── PAULDRONS (spiked, purple-tipped)
    p(-13,-12,CO,8,9); p(-12,-11,VS,6,8); p(-11,-11,VM,4,7); p(-10,-10,PS,2,5);
    p(-12,-11,VH,6,1);
    p(-14,-15,CO,3,4); p(-13,-14,PM,1,3); p(-13,-14,PL,1,1);                      // L spike
    p( 6,-12,CO,8,9); p( 7,-11,VS,6,8); p( 8,-11,VM,4,7); p( 9,-10,PS,2,5);
    p( 7,-11,VH,6,1);
    p(11,-15,CO,3,4); p(12,-14,PM,1,3); p(12,-14,PL,1,1);                         // R spike

    // ── ARMS + HANDS
    p(-11,-10,CO,5,12); p(-10,-9,VM,4,10); p(-10,-9,VH,4,1);
    p(-11,-17,CO,5,8); p(-10,-16,SK,4,6);
    p( 7,-10,CO,5,12); p( 8,-9,VM,4,10); p( 8,-9,VH,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,SK,4,6);

    // ── NECK
    p(-3,-16,CO,7,3); p(-2,-15,VS,5,2);

    // ── HEAD (deep void, purple-glowing eyes)
    p(-8,-30,CO,16,14); p(-7,-29,VS,14,12); p(-6,-28,VM,12,10); p(-5,-27,VB,9,8);
    p(-7,-29,VH,14,1);                                                            // top highlight
    // Purple-void eyes
    p(-4,-24,PB,4,2); p( 1,-24,PB,4,2);
    p(-3,-24,PH,2,1); p( 2,-24,PH,2,1);
    ctx.save(); ctx.globalAlpha = 0.70 + edgePulse * 0.25;
    pUnit(ctx,cx,cy,-4,-24+idleY,PW,4,2,isLeft,S);
    pUnit(ctx,cx,cy, 1,-24+idleY,PW,4,2,isLeft,S);
    ctx.restore();

    // ── BAT-EARED HOOD (taller w/ 2 small ear spikes)
    p(-8,-36,CO,16,10); p(-7,-35,VS,14,9); p(-6,-34,VM,11,7); p(-5,-33,VB,8,5);
    p(-7,-35,VH,14,1);                                                            // top highlight
    // Bat ears (small horns)
    p(-9,-40,CO,3,5); p(-8,-39,VL,1,4); p(-8,-41,PL,1,1);                         // L ear
    p( 6,-40,CO,3,5); p( 7,-39,VL,1,4); p( 7,-41,PL,1,1);                         // R ear
    // Center purple gem
    p(-2,-39,CO,4,3); p(-1,-38,PL,2,1); p(-1,-38,PW,2,1);

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.72; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-22,-24+wingF+idleY,PL,46,32,isLeft,S);                   // wing burst
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.55; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-10,-16+idleY,PB,26,42,isLeft,S);
        ctx.restore();
    }
}

function drawSpatialSlasher(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep        = (Math.sin(now * 0.005) + 1) / 2;
    const linePulse = (Math.sin(now * 0.006) + 1) / 2;
    const glitchX   = Math.random() < 0.08 ? (Math.random() - 0.5) * 8 : 0;
    const CO='#000000';
    const IS='#1A1A6A', IM='#283593', IB='#303F9F', IL='#3949AB', IH='#3F51B5', IV='#7986CB';
    const CY='#00B8D4', CL='#00E5FF', CH='#B2EBF2', CW='#FFFFFF';
    const SK='#B0B8D8';
    const VM='#4A0080', VL='#9C27B0';

    // ── spatial aura
    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnit(ctx,cx,cy,-22,-42+idleY,CL,44,76,isLeft,S);
    ctx.restore();

    // ── GLITCH AFTERIMAGE (shifted cyan silhouette)
    ctx.save(); ctx.globalAlpha = 0.20 + linePulse * 0.15;
    pUnit(ctx,cx,cy,(isLeft ? -14 : 14)+glitchX,0+idleY,CL,12,30,isLeft,S);
    ctx.restore();

    // ── MASSIVE CYAN SCIMITAR (vertical, curved, glitch-edged)
    // Shaft (curved upward)
    p( 9,-58,CO,5,52); p(10,-57,CY,3,50); p(10,-54,CL,2,46); p(11,-54,CH,1,42);
    p(11,-58,CO,1,10); p(12,-57,CW,1,8);                                          // tip
    // Curved blade extension (gets wider at top)
    p( 8,-60,CO,7,6); p( 9,-59,CL,5,4); p(10,-58,CW,3,2);
    // Hilt (cross-shaped)
    p( 6,-10,CO,11,4); p( 7,-9,CY,9,3); p( 8,-9,CL,5,2);                          // crossguard
    p(10,-6,CO,3,8); p(11,-5,IM,1,6);                                             // grip
    p( 8,2,CO,7,4); p( 9,3,CY,5,2); p(10,3,CW,3,1);                               // pommel
    // Glitch dots along blade (animated)
    for (let i = 0; i < 4; i++) {
        const gy = -50 + i*12;
        ctx.save(); ctx.globalAlpha = 0.65 + linePulse * 0.30;
        pUnit(ctx,cx,cy,11+(i%2===0?-2:0),gy+idleY,CW,1,1,isLeft,S);
        ctx.restore();
    }
    // Always-glowing edge
    ctx.save(); ctx.globalAlpha = 0.55 + linePulse * 0.30;
    pUnit(ctx,cx,cy,11,-54+idleY,CW,1,50,isLeft,S);
    ctx.restore();

    // ── BOOTS
    p(-7,14,CO,7,9); p(-6,15,IS,5,8); p(-4,16,IM,3,6);
    p( 1,14,CO,6,9); p( 2,15,IS,5,8); p( 3,16,IM,3,6);
    p(-7,14,CL,7,1); p( 1,14,CL,6,1);

    // ── ROBE LOWER (indigo armored)
    p(-8,2,CO,16,13); p(-7,3,IS,14,11); p(-6,4,IM,11,9); p(-5,5,IB,7,7);
    p(-7,3,IV,14,1);                                                              // top highlight
    p(-1,4,`rgba(0,229,255,${0.25+linePulse*0.30})`,3,10);
    p(-7,12,CO,14,3); p(-6,13,CY,12,2); p(-6,13,CL,12,1);                         // cyan hem

    // ── BELT (indigo w/ cyan gem)
    p(-8,0,CO,16,3); p(-7,1,IB,14,2); p(-7,1,IH,14,1);
    p(-2,0,CO,4,3); p(-1,1,CL,2,1);

    // ── CHEST (cyan circuit lines, dual void rifts)
    p(-7,-14,CO,15,17); p(-6,-13,IS,13,15); p(-5,-12,IM,10,12); p(-4,-11,IB,7,10); p(-3,-10,IL,4,8);
    p(-6,-13,IV,13,1);                                                            // top highlight
    p(-1,-12,`rgba(0,229,255,${0.35+linePulse*0.40})`,2,11);
    p(-4,-6,CY,9,1);
    p(-6,-9,CO,12,4); p(-5,-8,IM,10,3); p(-4,-7,IB,7,2);
    // Dual void rifts (purple slashes)
    p(-5,-5,CO,3,2); p(-4,-4,VM,1,1);
    p( 3,-5,CO,3,2); p( 4,-4,VM,1,1);
    ctx.save(); ctx.globalAlpha = 0.55 + linePulse * 0.30;
    pUnit(ctx,cx,cy,-5,-5+idleY,VL,3,2,isLeft,S);
    pUnit(ctx,cx,cy, 3,-5+idleY,VL,3,2,isLeft,S);
    ctx.restore();
    // Cyan circuit horizontal lines
    p(-5,-11,CL,8,1); p(-5,-3,CL,8,1);
    for (let r=0; r<3; r++) { p(-6,-10+r*4,CL,1,1); p(5,-10+r*4,CL,1,1); }        // glowing rivets

    // ── PAULDRONS (indigo w/ cyan trim)
    p(-13,-12,CO,8,9); p(-12,-11,IM,6,8); p(-11,-11,IB,4,7); p(-12,-11,IV,6,1);
    p(-12,-9,CL,6,1);
    p( 6,-12,CO,8,9); p( 7,-11,IM,6,8); p( 8,-11,IB,4,7); p( 7,-11,IV,6,1);
    p( 7,-9,CL,6,1);

    // ── ARMS + HANDS
    p(-11,-10,CO,5,12); p(-10,-9,IM,4,10); p(-10,-9,IV,4,1);
    p(-11,-17,CO,5,8); p(-10,-16,SK,4,6);
    p( 7,-10,CO,5,12); p( 8,-9,IM,4,10); p( 8,-9,IV,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,IB,4,6);

    // ── NECK
    p(-3,-16,CO,7,3); p(-2,-15,IM,5,2);

    // ── HEAD (cyan visor band — wide)
    p(-8,-30,CO,16,14); p(-7,-29,IS,14,12); p(-6,-28,IM,12,10); p(-5,-27,IB,9,8);
    p(-7,-29,IV,14,1);                                                            // top highlight
    // Cyan scope-visor (full band)
    p(-7,-25,CO,15,5); p(-6,-24,CL,13,4); p(-5,-24,`rgba(0,229,255,${0.80+linePulse*0.20})`,10,3);
    p(-4,-23,CH,3,1); p( 1,-23,CH,3,1);
    ctx.save(); ctx.globalAlpha = 0.60 + linePulse * 0.30;
    pUnit(ctx,cx,cy,-6,-24+idleY,CW,13,4,isLeft,S);
    ctx.restore();

    // ── HOOD/CAP (indigo w/ cyan antennas)
    p(-7,-36,CO,14,8); p(-6,-35,IS,12,7); p(-5,-34,IM,9,5);
    p(-6,-35,IV,12,1);                                                            // top highlight
    p(-7,-36,CL,14,1);                                                            // cyan rim
    // Side antenna L
    p(-8,-40,CO,3,4); p(-7,-39,IM,1,3);
    p(-8,-42,CO,2,3); p(-7,-41,CL,1,2);
    // Side antenna R (taller)
    p( 4,-40,CO,3,6); p( 5,-39,IM,1,5); p( 5,-41,CL,1,2);
    ctx.save(); ctx.globalAlpha = 0.65 + linePulse * 0.30;
    pUnit(ctx,cx,cy, 5,-41+idleY,CW,1,2,isLeft,S);
    ctx.restore();

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.85; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy, 7,-62+idleY,CW,12,60,isLeft,S);                          // scimitar slash beam
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.55; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-12,-10+idleY,CL,26,8,isLeft,S);                          // space-cut horizontal
        ctx.restore();
        // Glitch slashes (3)
        for (let i = 0; i < 3; i++) {
            ctx.save(); ctx.globalAlpha = 0.65;
            const gx = -14 + i * 12;
            pUnit(ctx,cx,cy,gx,-10+i*8+idleY,CW,8,1,isLeft,S);
            ctx.restore();
        }
    }
}

function drawWraithLord(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep         = (Math.sin(now * 0.005) + 1) / 2;
    const ghostPulse = (Math.sin(now * 0.005) + 1) / 2;
    const handX      = Math.sin(now * 0.004) * 5;
    const orbF       = Math.sin(now * 0.003) * 1.5;
    const CO='#000000';
    const IS='#1A0050', IM='#26007A', IB='#311B92', IL='#4527A0', IH='#5E35B1', IW='#9575CD';
    const GS='#00691E', GM='#00C853', GB='#69F0AE', GE='#00E676', GW='#B9F6CA';
    const BW='#F5F5F5', BS='#9E9E9E', BM='#BDBDBD', BH='#FFFFFF';
    const SK='#E8E0F0';

    // ── soul aura
    ctx.save(); ctx.globalAlpha = 0.15 + ep * 0.22;
    pUnit(ctx,cx,cy,-22,-50+idleY,GM,44,82,isLeft,S);
    ctx.restore();

    // ── GHOST POOL AT FEET (purple-green mist)
    p(-9,16,CO,18,8); p(-8,17,`rgba(0,200,83,${0.35+ghostPulse*0.35})`,16,7); p(-7,18,IS,13,5);

    // ── 4 FLOATING GHOST HANDS (was 2)
    // Hand 1 (low left, swaying)
    p(-19+handX,5,CO,8,8); p(-18+handX,6,GS,6,6); p(-17+handX,7,GM,4,4); p(-17+handX,8,GB,2,2);
    ctx.save(); ctx.globalAlpha = 0.55 + ghostPulse * 0.30;
    pUnit(ctx,cx,cy,-19+handX,5+idleY,GE,8,8,isLeft,S);
    ctx.restore();
    // Hand 2 (high left)
    p(-22-handX,-10,CO,6,6); p(-21-handX,-9,GS,4,4); p(-20-handX,-8,GM,2,2);
    ctx.save(); ctx.globalAlpha = 0.55 + ghostPulse * 0.30;
    pUnit(ctx,cx,cy,-22-handX,-10+idleY,GE,6,6,isLeft,S);
    ctx.restore();
    // Hand 3 (low right)
    p(13-handX,10,CO,8,8); p(14-handX,11,GS,6,6); p(15-handX,12,GM,4,4); p(15-handX,13,GB,2,2);
    ctx.save(); ctx.globalAlpha = 0.55 + ghostPulse * 0.30;
    pUnit(ctx,cx,cy,13-handX,10+idleY,GE,8,8,isLeft,S);
    ctx.restore();
    // Hand 4 (high right)
    p(16+handX,-12,CO,6,6); p(17+handX,-11,GS,4,4); p(18+handX,-10,GM,2,2);
    ctx.save(); ctx.globalAlpha = 0.55 + ghostPulse * 0.30;
    pUnit(ctx,cx,cy,16+handX,-12+idleY,GE,6,6,isLeft,S);
    ctx.restore();

    // ── SOUL STAFF (tall, large soul orb top, bobbing)
    p(10,-54,CO,4,48); p(11,-53,IS,3,46); p(11,-50,IM,2,40); p(11,-46,IB,2,32);   // shaft
    p(10,-44,GE,4,1); p(10,-30,GE,4,1); p(10,-16,GE,4,1);                         // green bands
    // Soul orb top (huge, multi-layer, bobbing)
    p( 7,-62+orbF,CO,12,12); p( 8,-61+orbF,GS,10,10); p( 9,-60+orbF,GM,8,8);
    p(10,-59+orbF,GB,6,6); p(11,-58+orbF,GE,4,4); p(12,-57+orbF,GW,2,2);
    p( 8,-61+orbF,GW,10,1);                                                       // top highlight
    // Orb glow + spirit wisps trailing
    ctx.save(); ctx.globalAlpha = 0.65 + ghostPulse * 0.30;
    pUnit(ctx,cx,cy, 7,-62+orbF+idleY,GW,12,12,isLeft,S);
    ctx.restore();
    // Floating soul wisps around orb
    for (let i = 0; i < 4; i++) {
        const a  = (now * 0.004) + i * (Math.PI / 2);
        const wx = Math.cos(a) * 9 + 13;
        const wy = Math.sin(a) * 6 - 56;
        ctx.save(); ctx.globalAlpha = 0.60 + ghostPulse * 0.25;
        pUnit(ctx,cx,cy,wx,wy+idleY,GE,2,2,isLeft,S);
        ctx.restore();
    }

    // ── BOOTS
    p(-7,14,CO,7,9); p(-6,15,IS,5,8); p(-4,16,IM,3,6);
    p( 1,14,CO,6,9); p( 2,15,IS,5,8); p( 3,16,IM,3,6);
    p(-7,14,GE,7,1); p( 1,14,GE,6,1);                                             // green cuffs

    // ── ROBE LOWER (purple, top-highlighted, green hem)
    p(-8,2,CO,16,13); p(-7,3,IS,14,11); p(-6,4,IM,11,9); p(-5,5,IB,7,7);
    p(-7,3,IW,14,1);                                                              // top highlight
    p(-7,12,CO,14,3); p(-6,13,GS,12,2); p(-6,13,GE,12,1);                         // green hem

    // ── BELT (purple w/ green soul gem)
    p(-8,0,CO,16,3); p(-7,1,IB,14,2); p(-7,1,IH,14,1);
    p(-2,0,CO,4,3); p(-1,1,GE,2,1);
    ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
    pUnit(ctx,cx,cy,-1,1+idleY,GW,2,1,isLeft,S);
    ctx.restore();

    // ── UPPER ROBE (riveted, green soul gem chest)
    p(-7,-14,CO,15,17); p(-6,-13,IS,13,15); p(-5,-12,IM,10,12); p(-4,-11,IB,7,10); p(-3,-10,IL,4,8);
    p(-6,-13,IW,13,1);                                                            // top highlight
    p(-5,-5,`rgba(0,200,83,${0.20+ghostPulse*0.25})`,11,8);
    // Soul gem chest emblem
    p(-3,-6,CO,6,6); p(-2,-5,GS,4,4); p(-2,-5,GB,4,1); p(-1,-4,GE,2,2);
    ctx.save(); ctx.globalAlpha = 0.60 + ep * 0.35;
    pUnit(ctx,cx,cy,-3,-6+idleY,GW,6,6,isLeft,S);
    ctx.restore();
    for (let r=0; r<3; r++) { p(-6,-10+r*4,GE,1,1); p(5,-10+r*4,GE,1,1); }        // glowing rivets

    // ── PAULDRONS (purple, ghost-glow)
    p(-13,-12,CO,8,9); p(-12,-11,IS,6,8); p(-11,-11,IM,4,7); p(-12,-11,IW,6,1);
    p(-12,-12,GE,6,1);
    p( 6,-12,CO,8,9); p( 7,-11,IS,6,8); p( 8,-11,IM,4,7); p( 7,-11,IW,6,1);
    p( 7,-12,GE,6,1);

    // ── ARMS + HANDS
    p(-11,-10,CO,5,12); p(-10,-9,IM,4,10); p(-10,-9,IW,4,1);
    p(-11,-17,CO,5,8); p(-10,-16,SK,4,6);
    p( 7,-10,CO,5,12); p( 8,-9,IM,4,10); p( 8,-9,IW,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,SK,4,6);

    // ── NECK
    p(-3,-16,CO,7,3); p(-2,-15,IS,5,2);

    // ── SKULL FACE (white skull, green eye sockets, fang grimace)
    p(-8,-30,CO,16,14); p(-7,-29,SK,14,12); p(-6,-28,BW,11,10); p(-5,-27,'#F0F0F0',8,8);
    // Green-glowing eye sockets
    p(-5,-25,CO,3,4); p( 2,-25,CO,3,4);
    p(-4,-24,GE,2,2); p( 3,-24,GE,2,2);
    p(-4,-23,GW,2,1); p( 3,-23,GW,2,1);
    ctx.save(); ctx.globalAlpha = 0.75 + ghostPulse * 0.25;
    pUnit(ctx,cx,cy,-5,-25+idleY,GW,3,4,isLeft,S);
    pUnit(ctx,cx,cy, 2,-25+idleY,GW,3,4,isLeft,S);
    ctx.restore();
    // Nasal cavity
    p(-1,-20,CO,2,2);
    // Fang grimace
    p(-4,-18,CO,9,3); p(-3,-17,BW,7,2);
    p(-3,-18,CO,1,3); p(-1,-18,CO,1,3); p( 1,-18,CO,1,3); p( 3,-18,CO,1,3);       // teeth gaps

    // ── GHOST CROWN (silver w/ green wraith ribbons trailing)
    p(-8,-36,CO,16,8); p(-7,-35,BS,14,7); p(-6,-34,BW,11,6);
    p(-7,-35,BH,14,1);                                                            // top highlight
    p(-8,-36,GE,16,1);                                                            // green base ring
    // Wraith ribbon spires (3 ghost ribbons)
    p(-6,-40,CO,4,4); p(-5,-39,BS,3,3); p(-5,-39,GE,3,1);                         // L ribbon
    p( 2,-40,CO,4,4); p( 3,-39,BS,3,3); p( 3,-39,GE,3,1);                         // R ribbon
    p(-1,-44,CO,4,8); p( 0,-43,BS,2,7); p( 0,-43,GE,2,2); p( 0,-46,GW,2,1);       // center tallest

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.78; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy, 7,-64+orbF+idleY,GW,14,16,isLeft,S);                     // soul orb flash
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.50; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-22,-12+idleY,GE,46,30,isLeft,S);                         // ghost-hand burst
        ctx.restore();
    }
}

function drawCursedShaman(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.003) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep    = (Math.sin(now * 0.005) + 1) / 2;
    const pulse = (Math.sin(now * 0.008) + 1) / 2;
    const skSway = Math.sin(now * 0.004) * 1;
    const CO='#000000';
    const RS='#1A0040', RM='#2A0060', RB='#3F51B5', RL='#5C6BC0', RH='#7986CB';
    const GY='#616161', GYL='#9E9E9E', GYH='#BDBDBD';
    const TS='#4E342E', TM='#6D4C41', TB='#795548', TH='#A1887F';
    const BW='#F5F5F5', BS='#9E9E9E';
    const RD='#D32F2F', RH2='#FF6E6E';
    const GD='#FFD700';

    // ── curse aura
    ctx.save(); ctx.globalAlpha = 0.15 + ep * 0.20;
    pUnit(ctx,cx,cy,-26,-58+idleY,RD,52,90,isLeft,S);
    ctx.restore();

    // ── VOODOO BANNER (taller pole, shrunken-head top, 3 hanging skulls)
    // Pole (curved/gnarled wood)
    p(-15,-54,CO,5,52); p(-14,-53,TS,3,50); p(-14,-50,TM,2,44); p(-14,-46,TB,2,36);
    // Pole tip — shrunken head + topknot
    p(-17,-62,CO,10,12); p(-16,-61,TM,8,10); p(-15,-60,TB,6,8);
    p(-16,-61,TH,8,1);                                                            // top highlight
    // Stitched mouth + eye sockets
    p(-15,-56,CO,2,2); p(-12,-56,CO,2,2);                                         // eye sockets
    p(-14,-53,RD,4,1);                                                            // stitched mouth
    ctx.save(); ctx.globalAlpha = 0.65 + pulse * 0.30;
    pUnit(ctx,cx,cy,-15,-56+idleY,RH2,2,2,isLeft,S);
    pUnit(ctx,cx,cy,-12,-56+idleY,RH2,2,2,isLeft,S);
    ctx.restore();
    // Tribal feathers on top
    p(-16,-66,CO,3,5); p(-15,-65,RD,1,4); p(-15,-67,'#FF9900',1,1);
    p(-13,-66,CO,3,5); p(-12,-65,'#FF9900',1,4); p(-12,-67,RD,1,1);
    // 3 hanging skulls (sway)
    for (let i = 0; i < 3; i++) {
        const sy = -38 + i * 10;
        const sx = -13 + (i % 2 === 0 ? skSway : -skSway);
        p(sx, sy-2, CO, 1, 2);                                                    // rope
        p(sx-2, sy, CO, 5, 5); p(sx-1, sy+1, BW, 3, 3);
        p(sx-1, sy+2, CO, 1, 1); p(sx+1, sy+2, CO, 1, 1);                         // eye sockets
        p(sx-1, sy+4, CO, 3, 1);                                                  // teeth
    }
    // Banner cloth (small, frayed)
    p(-13,-12,CO,5,18); p(-12,-11,RS,3,16); p(-12,-11,RM,3,1);                    // cloth body
    p(-13,5,CO,2,3); p(-9,5,CO,2,3);                                              // tassels

    // ── RITUAL DRUM (held right side, with drumstick)
    // Drum body (taller, multi-layer)
    p( 9,4,CO,12,14); p(10,5,TM,10,12); p(11,6,TB,8,10); p(11,6,TH,8,1);
    // Drum skin (top)
    p( 9,2,CO,12,4); p(10,3,BW,10,2); p(10,3,BS,10,1);
    // Red ritual marks on drum side
    p(12,9,RD,2,2); p(12,8,CO,4,1);
    p(13,11,RD,1,3); p(15,11,RD,1,3);                                             // tribal stripes
    // Drumstick (raised)
    p(20,-4,CO,2,12); p(21,-3,TB,1,10); p(21,-3,TH,1,1);
    p(19,-6,CO,4,4); p(20,-5,BW,2,2);                                             // stick ball

    // ── BOOTS (purple)
    p(-7,14,CO,7,9); p(-6,15,RS,5,8); p(-4,16,RM,3,6);
    p( 1,14,CO,6,9); p( 2,15,RS,5,8); p( 3,16,RM,3,6);
    p(-7,14,RD,7,1); p( 1,14,RD,6,1);

    // ── BONE FUR ROBE LOWER (grey/bone, tasseled)
    p(-8,14,CO,16,10); p(-7,15,GY,14,8); p(-6,16,GYL,11,6);
    p(-7,15,GYH,14,1);                                                            // top highlight
    p(-7,20,CO,5,4); p(-3,21,CO,5,4); p( 1,20,CO,5,4);                            // bone tassels

    // ── ROBE LOWER (purple, top-highlighted)
    p(-8,2,CO,16,13); p(-7,3,RS,14,11); p(-6,4,RM,11,9); p(-5,5,RB,7,7);
    p(-7,3,RL,14,1);                                                              // top highlight

    // ── BELT (bone w/ red gem)
    p(-8,0,CO,16,3); p(-7,1,GYL,14,2); p(-7,1,GYH,14,1);
    p(-2,0,CO,4,3); p(-1,1,RD,2,1);

    // ── UPPER ROBE (riveted, red curse mark)
    p(-7,-14,CO,15,17); p(-6,-13,RS,13,15); p(-5,-12,RM,10,12); p(-4,-11,RB,7,10); p(-3,-10,RL,4,8);
    p(-6,-13,RH,13,1);                                                            // top highlight
    // Bone necklace
    p(-4,-14,CO,9,2);
    for (let i = 0; i < 4; i++) p(-3+i*2,-13,BW,1,1);
    // Red curse skull on chest
    p(-3,-6,CO,6,6); p(-2,-5,RD,4,4); p(-2,-5,RH2,4,1);
    p(-1,-4,CO,1,1); p( 1,-4,CO,1,1);                                             // eyes
    p(-1,-2,CO,2,1);                                                              // mouth
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    pUnit(ctx,cx,cy,-3,-6+idleY,RH2,6,6,isLeft,S);
    ctx.restore();
    for (let r=0; r<3; r++) { p(-6,-10+r*4,RD,1,1); p(5,-10+r*4,RD,1,1); }        // red rivets

    // ── PAULDRONS (bone-spiked)
    p(-13,-12,CO,8,9); p(-12,-11,RS,6,8); p(-11,-11,RM,4,7); p(-12,-11,RH,6,1);
    p(-14,-15,CO,3,4); p(-13,-14,BW,1,3);                                         // bone spike L
    p( 6,-12,CO,8,9); p( 7,-11,RS,6,8); p( 8,-11,RM,4,7); p( 7,-11,RH,6,1);
    p(11,-15,CO,3,4); p(12,-14,BW,1,3);                                           // bone spike R

    // ── ARMS + HANDS
    p(-11,-10,CO,5,12); p(-10,-9,RM,4,10); p(-10,-9,RL,4,1);
    p(-11,-17,CO,5,8); p(-10,-16,'#C8A878',4,6);
    p( 7,-10,CO,5,12); p( 8,-9,RM,4,10); p( 8,-9,RL,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,'#C8A878',4,6);

    // ── NECK
    p(-3,-16,CO,7,3); p(-2,-15,RM,5,2);

    // ── HEAD (tribal red face paint, fang grimace)
    p(-8,-30,CO,16,14); p(-7,-29,TS,14,12); p(-6,-28,TM,12,10); p(-5,-27,TB,9,8);
    // Tribal red face paint (stripes)
    p(-6,-28,RD,11,1); p(-6,-22,RD,11,1);                                         // horizontal stripes
    p(-3,-29,RD,1,12); p( 2,-29,RD,1,12);                                         // vertical stripes
    // Glowing gold eyes (peering through)
    p(-3,-25,'#FFD600',3,2); p( 1,-25,'#FFD600',3,2);
    p(-2,-24,'#FFFCC0',1,1); p( 2,-24,'#FFFCC0',1,1);
    ctx.save(); ctx.globalAlpha = 0.70 + pulse * 0.25;
    pUnit(ctx,cx,cy,-3,-25+idleY,'#FFFCC0',3,2,isLeft,S);
    pUnit(ctx,cx,cy, 1,-25+idleY,'#FFFCC0',3,2,isLeft,S);
    ctx.restore();
    // Fang grimace
    p(-4,-23,CO,9,4); p(-3,-22,BW,7,3);
    p(-3,-23,CO,1,3); p(-1,-23,CO,1,3); p( 1,-23,CO,1,3); p( 3,-23,CO,1,3);       // teeth gaps

    // ── HORNED CROWN (tribal bone w/ feathers)
    p(-8,-36,CO,16,8); p(-7,-35,TS,14,7); p(-6,-34,TM,11,6); p(-5,-33,TB,8,5);
    p(-7,-35,TH,14,1);                                                            // top highlight
    p(-5,-37,BW,2,2); p( 0,-37,BW,2,2); p( 4,-37,BW,2,2);                         // bone studs
    // Curved horns
    p(-10,-40,CO,4,5); p(-9,-39,GY,2,4); p(-9,-41,BW,2,1);                        // horn L
    p( 6,-40,CO,4,5); p( 7,-39,GY,2,4); p( 7,-41,BW,2,1);                         // horn R
    // Center feather plume
    p(-1,-42,CO,4,6); p( 0,-41,RD,2,5); p( 0,-44,'#FF9900',2,2); p( 1,-46,GD,1,2);

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.78; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-18,-66+idleY,RD,16,18,isLeft,S);                         // head burst
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.55; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy, 7,2+idleY,RD,16,18,isLeft,S);                            // drum burst
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.45; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-10,-16+idleY,RL,24,40,isLeft,S);
        ctx.restore();
    }
}

function drawRampart(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep    = (Math.sin(now * 0.004) + 1) / 2;
    const pulse = (Math.sin(now * 0.004) + 1) / 2;
    const plumF = Math.sin(now * 0.005) * 1.5;
    const CO='#000000';
    const PS='#8A9BA8', PM='#9EADB8', PB='#B0BEC5', PL='#CFD8DC', PH='#ECEFF1', PW='#FFFFFF';
    const BC='#0D47A1', BM='#1565C0', BL='#1976D2', BH='#2196F3', BW='#80D8FF';
    const GHL='#8D6E63', GHS='#5D4037';
    const SK='#F0D0A0';
    const GD2='#B88000', GD='#FFD700';

    // ── holy bulwark aura
    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnit(ctx,cx,cy,-28,-44+idleY,BH,52,76,isLeft,S);
    ctx.restore();

    // ── TALL PIKE (off-side, gold-bound)
    p(-16,-26,CO,4,60); p(-15,-25,GHS,3,58); p(-15,-22,GHL,2,52);
    p(-16,-18,GD,4,1); p(-16,-2,GD,4,1); p(-16,14,GD,4,1);                        // gold grip bands
    // Pike head (spearhead w/ side blades)
    p(-19,-34,CO,10,12); p(-18,-33,PS,8,10); p(-17,-32,PB,6,8); p(-16,-31,PH,4,6);
    p(-18,-33,PW,8,1);                                                            // top highlight
    p(-16,-30,BL,3,2);                                                            // blue gem
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    pUnit(ctx,cx,cy,-16,-30+idleY,BW,3,2,isLeft,S);
    ctx.restore();
    p(-20,-36,CO,3,4); p(-19,-35,PB,1,3);                                         // L side blade
    p(-14,-36,CO,3,4); p(-13,-35,PB,1,3);                                         // R side blade

    // ── MASSIVE TOWER SHIELD (right side, glowing blue cross, gold rim)
    p( 9,-14,CO,16,44); p(10,-13,PS,14,42); p(11,-12,PM,12,40);
    p(12,-10,PB,9,36); p(13,-8,PL,5,32);
    p(10,-13,PW,14,1);                                                            // top highlight
    // Gold rim (full perimeter)
    p( 9,-14,GD,16,2); p( 9,28,GD,16,2);
    p( 9,-14,GD,2,44); p(23,-14,GD,2,44);
    p( 9,-14,GD2,1,44); p(23,-14,GD2,1,44);
    // Corner studs
    p( 9,-14,CO,3,3); p(10,-13,GD,1,1);
    p(22,-14,CO,3,3); p(23,-13,GD,1,1);
    p( 9,27,CO,3,3); p(10,28,GD,1,1);
    p(22,27,CO,3,3); p(23,28,GD,1,1);
    // Blue cross emblem (bold, glowing)
    p(15,-8,CO,5,30); p(16,-7,BC,3,28); p(16,-7,BL,3,2);
    p(11,4,CO,13,5); p(12,5,BC,11,3); p(12,5,BL,11,1);
    ctx.save(); ctx.globalAlpha = 0.60 + pulse * 0.40;
    pUnit(ctx,cx,cy,15,-8+idleY,BW,5,30,isLeft,S);
    pUnit(ctx,cx,cy,11,4+idleY,BW,13,5,isLeft,S);
    ctx.restore();
    // Center crystal
    p(15,4,CO,5,5); p(16,5,BH,3,3); p(16,5,BW,3,1);
    p(10,8,BC,3,22); p(20,8,BC,3,22);                                             // edge ribs

    // ── BOOTS (gold-cuffed)
    p(-7,14,CO,7,9); p(-6,15,PS,5,8); p(-4,16,PB,2,6); p(-4,16,BC,3,2);
    p( 1,14,CO,6,9); p( 2,15,PS,5,8); p( 3,16,PB,2,6); p( 3,16,BC,3,2);
    p(-7,14,GD,7,1); p( 1,14,GD,6,1);

    // ── ROBE LOWER (steel-blue tabard, top-highlighted)
    p(-8,2,CO,16,13); p(-7,3,PS,14,11); p(-6,4,PM,11,9); p(-5,5,PB,7,7);
    p(-7,3,PW,14,1);                                                              // top highlight
    p(-4,2,BC,8,3); p(-2,5,BC,4,8);                                               // blue tabard
    p(-7,12,CO,14,3); p(-6,13,GD2,12,2); p(-6,13,GD,12,1);                        // gold hem

    // ── BELT (gold w/ blue gem)
    p(-8,0,CO,16,3); p(-7,1,GD2,14,2); p(-7,1,GD,14,1);
    p(-2,0,CO,4,3); p(-1,1,BH,2,1);

    // ── CHEST (plate w/ glowing blue cross, gold rivets)
    p(-7,-14,CO,15,17); p(-6,-13,PS,13,15); p(-5,-12,PM,10,12); p(-4,-11,PB,7,10); p(-3,-10,PH,4,8);
    p(-6,-13,PW,13,1);                                                            // top highlight
    p(-4,-13,BC,8,4); p(-2,-9,BC,4,8);                                            // tabard cross base
    // Glowing cross overlay
    p(-1,-13,CO,3,16); p(0,-12,BH,1,14); p(0,-12,BW,1,2);
    p(-4,-7,CO,9,3); p(-3,-6,BH,7,1); p(-3,-6,BW,7,1);
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.35;
    pUnit(ctx,cx,cy,-1,-13+idleY,BW,3,16,isLeft,S);
    pUnit(ctx,cx,cy,-4,-7+idleY,BW,9,3,isLeft,S);
    ctx.restore();
    for (let r=0; r<3; r++) { p(-6,-10+r*4,GD,1,1); p(5,-10+r*4,GD,1,1); }        // gold rivets

    // ── PAULDRONS (plate, gold-tipped)
    p(-13,-12,CO,8,9); p(-12,-11,PS,6,8); p(-11,-11,PM,4,7); p(-10,-10,PH,2,5);
    p(-12,-11,PW,6,1);
    p(-12,-12,GD,6,1);
    p( 6,-12,CO,8,9); p( 7,-11,PS,6,8); p( 8,-11,PM,4,7); p( 9,-10,PH,2,5);
    p( 7,-11,PW,6,1);
    p( 7,-12,GD,6,1);

    // ── ARMS + GAUNTLETS
    p(-11,-10,CO,5,12); p(-10,-9,PM,4,10); p(-10,-9,PH,4,1);
    p(-11,-17,CO,5,8); p(-10,-16,SK,4,6);
    p( 7,-10,CO,5,12); p( 8,-9,PM,4,10); p( 8,-9,PH,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,SK,4,6);

    // ── NECK
    p(-3,-16,CO,7,3); p(-2,-15,PM,5,2);

    // ── HELM (closed visor, glowing blue band)
    p(-8,-30,CO,16,14); p(-7,-29,PS,14,12); p(-6,-28,PM,11,10); p(-5,-27,PB,8,8); p(-4,-26,PH,5,6);
    p(-7,-29,PW,14,1);                                                            // top highlight
    p(-5,-24,CO,11,5); p(-4,-23,BL,9,4); p(-3,-23,BH,6,3);                        // visor
    p(-3,-23,SK,3,2);
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.30;
    pUnit(ctx,cx,cy,-4,-23+idleY,BW,9,4,isLeft,S);
    ctx.restore();
    p(-8,-16,GD,16,1);                                                            // gold helm rim
    p(-9,-26,GD,2,12); p( 7,-26,GD,2,12);                                         // side gold strips

    // ── HELM CREST (blue flowing plume, taller)
    p(-8,-36,CO,16,8); p(-7,-35,PS,14,7); p(-6,-34,PM,11,5); p(-5,-33,PH,8,3);
    p(-7,-35,PW,14,1);                                                            // top highlight
    p(-5,-38+plumF,CO,4,4); p(-4,-37+plumF,BC,3,3); p(-4,-37+plumF,BL,3,1);       // L plume
    p( 2,-38+plumF,CO,4,4); p( 3,-37+plumF,BC,3,3); p( 3,-37+plumF,BL,3,1);       // R plume
    p(-2,-42+plumF,CO,4,6); p(-1,-41+plumF,BM,2,5); p(-1,-41+plumF,BH,2,1);       // center taller
    p(-1,-44+plumF,CO,2,3); p( 0,-43+plumF,BW,1,2);

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.78; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy, 8,-14+idleY,BW,20,46,isLeft,S);                          // shield flash
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.55; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-21,-36+idleY,BW,14,16,isLeft,S);                         // pike flash
        ctx.restore();
    }
}

function drawJudgment(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep    = (Math.sin(now * 0.005) + 1) / 2;
    const pulse = (Math.sin(now * 0.005) + 1) / 2;
    const wingF = Math.sin(now * 0.004) * 2;
    const CO='#000000';
    const AS='#9E9E9E', AM='#BDBDBD', AB='#D0D0D0', AL='#E8E8E8', AH='#FFFFFF';
    const GS='#7A5800', GM='#B8860B', GB='#FFD700', GL='#FFE57F', GH='#FFFFF0', GW='#FFFCC0';
    const WS='#C8C8C8', WM='#E0E0E0', WH='#FFFFFF';
    const CY1='#0099CC', CY='#00E5FF', CW='#B2EBF2';
    const SK='#F0D0A0';

    // ── divine judgment aura
    ctx.save(); ctx.globalAlpha = 0.16 + ep * 0.22;
    pUnit(ctx,cx,cy,-30,-46+idleY,GB,60,80,isLeft,S);
    ctx.restore();

    // ── TWIN ANGEL WINGS (3-layer per side, fluttering)
    // Outer layer
    ctx.save(); ctx.globalAlpha = 0.38 + pulse * 0.22;
    pUnit(ctx,cx,cy,-26,-12+wingF+idleY,WH,16,30,isLeft,S);
    pUnit(ctx,cx,cy, 10,-12-wingF+idleY,WH,16,30,isLeft,S);
    ctx.restore();
    // Left wing — feathered, gold-tipped
    p(-26,-12+wingF,CO,14,28); p(-25,-11+wingF,WS,12,26); p(-24,-10+wingF,WM,9,24); p(-23,-8+wingF,WH,5,20);
    p(-25,-11+wingF,AH,12,1);                                                     // top highlight
    p(-25,0+wingF,CO,4,14); p(-24,1+wingF,WS,2,12);                               // wing lower fold
    p(-25,-14+wingF,CO,6,8); p(-24,-13+wingF,WS,4,6); p(-23,-12+wingF,WH,2,4);    // wing top tuft
    // Gold feather tips
    p(-26,-14+wingF,GB,1,2); p(-26,-6+wingF,GB,1,2); p(-26,2+wingF,GB,1,2); p(-26,10+wingF,GB,1,2);
    // Right wing (mirror)
    p( 10,-12-wingF,CO,14,28); p(11,-11-wingF,WS,12,26); p(12,-10-wingF,WM,9,24); p(13,-8-wingF,WH,5,20);
    p( 11,-11-wingF,AH,12,1);                                                     // top highlight
    p( 23,0-wingF,CO,4,14); p(24,1-wingF,WS,2,12);
    p( 11,-14-wingF,CO,6,8); p(12,-13-wingF,WS,4,6); p(13,-12-wingF,WH,2,4);
    p(23,-14-wingF,GB,1,2); p(23,-6-wingF,GB,1,2); p(23,2-wingF,GB,1,2); p(23,10-wingF,GB,1,2);

    // ── MASSIVE JUDGMENT SWORD (vertical, gold-trimmed, glowing edge)
    p(-1,-66,CO,7,80); p( 0,-65,GS,5,78); p( 0,-62,GM,3,72); p( 0,-58,GB,2,62);   // shaft
    p( 1,-56,`rgba(255,215,0,${0.5+pulse*0.5})`,1,58);                            // glowing core
    // Sword crossguard (broad, jeweled)
    p(-8,12,CO,18,6); p(-7,13,GS,16,4); p(-6,14,GB,12,2); p(-6,14,GW,12,1);
    p(-3,14,CY,2,2);                                                              // center gem
    // Sword pommel (gold ball)
    p(-3,20,CO,6,5); p(-2,21,GB,4,3); p(-2,21,GW,4,1);
    p(-1,22,CW,2,1);
    // Sword tip flare
    p(-2,-70,CO,5,5); p(-1,-69,GW,3,3);
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.35;
    pUnit(ctx,cx,cy,-1,-66+idleY,GW,7,80,isLeft,S);
    ctx.restore();

    // ── BOOTS (gold-cuffed)
    p(-7,14,CO,7,9); p(-6,15,AS,5,8); p(-4,16,AM,3,6);
    p( 1,14,CO,6,9); p( 2,15,AS,5,8); p( 3,16,AM,3,6);
    p(-7,14,GB,7,1); p( 1,14,GB,6,1);

    // ── ROBE LOWER (silver-white, gold scripture center)
    p(-8,2,CO,16,13); p(-7,3,AS,14,11); p(-6,4,AM,11,9); p(-5,5,AB,7,7);
    p(-7,3,AH,14,1);                                                              // top highlight
    p(-2,2,CO,5,13); p(-1,3,GS,3,11); p( 0,4,GB,2,8); p( 0,4,GW,2,1);

    // ── BELT (gold w/ cyan judgment gem)
    p(-8,0,CO,16,3); p(-7,1,GM,14,2); p(-7,1,GB,14,1);
    p(-2,0,CO,4,3); p(-1,1,CY,2,1);

    // ── CHEST (riveted, cyan judgment eye)
    p(-7,-14,CO,15,17); p(-6,-13,AS,13,15); p(-5,-12,AM,10,12); p(-4,-11,AB,7,10); p(-3,-10,AL,4,8);
    p(-6,-13,AH,13,1);                                                            // top highlight
    p(-2,-13,CO,5,16); p(-1,-12,GS,3,14); p( 0,-11,GM,2,12); p( 0,-8,GB,2,6);     // gold column
    // Cyan judgment eye on chest
    p(-4,-5,CO,9,9); p(-3,-4,AB,7,7); p(-2,-3,CY,5,5);
    p(-1,-2,GB,3,3); p( 0,-1,CO,1,1);                                             // pupil
    ctx.save(); ctx.globalAlpha = 0.60 + pulse * 0.30;
    pUnit(ctx,cx,cy,-4,-5+idleY,CW,9,9,isLeft,S);
    ctx.restore();
    for (let r=0; r<3; r++) { p(-6,-10+r*4,GB,1,1); p(5,-10+r*4,GB,1,1); }        // gold rivets

    // ── PAULDRONS (silver, gold-rim)
    p(-13,-12,CO,8,9); p(-12,-11,AS,6,8); p(-11,-11,AM,4,7); p(-10,-10,AH,2,5);
    p(-12,-11,AH,6,1);
    p(-12,-12,GB,6,1);
    p( 6,-12,CO,8,9); p( 7,-11,AS,6,8); p( 8,-11,AM,4,7); p( 9,-10,AH,2,5);
    p( 7,-11,AH,6,1);
    p( 7,-12,GB,6,1);

    // ── ARMS + HANDS
    p(-11,-10,CO,5,12); p(-10,-9,AM,4,10); p(-10,-9,AH,4,1);
    p(-11,-17,CO,5,8); p(-10,-16,SK,4,6);
    p( 7,-10,CO,5,12); p( 8,-9,AM,4,10); p( 8,-9,AH,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,SK,4,6);

    // ── NECK
    p(-3,-16,CO,7,3); p(-2,-15,AM,5,2);

    // ── HEAD (silver helm, cyan glowing visor band)
    p(-8,-30,CO,16,14); p(-7,-29,AS,14,12); p(-6,-28,AM,11,10); p(-5,-27,AB,8,8); p(-4,-26,AH,5,6);
    p(-7,-29,AH,14,1);                                                            // top highlight
    // Cyan judgment visor (wide band)
    p(-5,-25,CO,11,4); p(-4,-24,`rgba(0,229,255,${0.55+pulse*0.40})`,9,3); p(-3,-24,AH,5,2);
    ctx.save(); ctx.globalAlpha = 0.65 + pulse * 0.30;
    pUnit(ctx,cx,cy,-4,-24+idleY,CW,9,3,isLeft,S);
    ctx.restore();
    p(-8,-16,GB,16,1);                                                            // gold helm rim

    // ── HALO CROWN (3-spire gold w/ cyan center jewel)
    p(-8,-36,CO,16,8); p(-7,-35,AS,14,7); p(-6,-34,AM,11,6); p(-5,-33,GB,8,4);
    p(-7,-35,AH,14,1);                                                            // top highlight
    p(-8,-36,GM,16,1); p(-8,-36,GB,16,1);                                         // gold base ring
    // 3 gold spires
    p(-6,-40,CO,4,6); p(-5,-39,GB,3,5); p(-5,-40,GW,3,1);                         // L spire
    p( 2,-40,CO,4,6); p( 3,-39,GB,3,5); p( 3,-40,GW,3,1);                         // R spire
    p(-1,-44,CO,4,10); p( 0,-43,GL,2,9); p( 0,-44,GW,2,2); p( 1,-46,CY,1,3);      // center tallest w/ cyan tip
    ctx.save(); ctx.globalAlpha = 0.65 + pulse * 0.30;
    pUnit(ctx,cx,cy, 1,-46+idleY,CW,1,3,isLeft,S);
    ctx.restore();

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.85; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-3,-72+idleY,GW,11,12,isLeft,S);                          // sword tip flash
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.62; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-1,-60+idleY,GW,7,68,isLeft,S);                           // sword beam
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.50; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-26,-14+idleY,WH,52,34,isLeft,S);                         // wing burst
        ctx.restore();
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
