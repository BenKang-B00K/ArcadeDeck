/* pix_tier3_support.js – Tier 3 Exorcists: SUPPORT Path
 * Executor · Binder · AbsoluteZero · Permafrost · Seer · Commander
 */

/* ══════════════════════════════════════════════════════════ drawExecutor ═══ */
function drawExecutor(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep        = (Math.sin(now * 0.004) + 1) / 2;
    const scaleSway = Math.sin(now * 0.003) * 5;
    const CO='#000000';
    const NS='#0D1B4A', NM='#1A2A7A', NB='#283593', NL='#3949AB', NH='#5C6BC0', NW='#8C9CD8';
    const GS='#7A5800', GM='#B8860B', GB='#FFD700', GL='#FFE57F', GW='#FFFCC0';
    const SS='#9E9E9E', SM='#BDBDBD', SB='#E0E0E0', SH='#FFFFFF';
    const SK='#F0D0A0', RD='#D32F2F';

    // ── judgment aura
    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.20;
    pUnit(ctx,cx,cy,-22,-44+idleY,GB,44,76,isLeft,S);
    ctx.restore();

    // ── JUDGMENT SCALES (massive, overhead, swinging)
    // Top beam (gold)
    p(-15,-34,CO,30,3); p(-14,-33,GM,28,2); p(-14,-33,GW,28,1);                   // gold beam + highlight
    p(-15,-36,CO,4,2); p(-14,-35,GB,2,1);                                         // beam left finial
    p(11,-36,CO,4,2); p(12,-35,GB,2,1);                                           // beam right finial
    // Center pivot
    p(-2,-38,CO,4,6); p(-1,-37,GM,2,5); p(-1,-37,GB,2,2);
    p(-3,-32,CO,6,3); p(-2,-31,GM,4,2);                                           // pivot mount
    // Left pan + chains
    p(-19,-34+scaleSway,CO,1,8); p(-15,-34+scaleSway,CO,1,8);                     // chains
    p(-19,-28+scaleSway,CO,12,3); p(-18,-27+scaleSway,SM,10,2); p(-18,-27+scaleSway,SH,10,1);
    p(-19,-25+scaleSway,CO,12,2); p(-18,-24+scaleSway,SS,10,1);                   // pan bowl underside
    p(-17,-26+scaleSway,GB,8,1);                                                  // gold inner rim
    // Right pan + chains
    p(11,-34-scaleSway,CO,1,8); p(15,-34-scaleSway,CO,1,8);
    p(11,-28-scaleSway,CO,12,3); p(12,-27-scaleSway,SM,10,2); p(12,-27-scaleSway,SH,10,1);
    p(11,-25-scaleSway,CO,12,2); p(12,-24-scaleSway,SS,10,1);
    p(13,-26-scaleSway,GB,8,1);
    // Glow on pans (always)
    ctx.save(); ctx.globalAlpha = 0.45 + ep * 0.30;
    pUnit(ctx,cx,cy,-19,-28+scaleSway+idleY,GL,12,3,isLeft,S);
    pUnit(ctx,cx,cy, 11,-28-scaleSway+idleY,GL,12,3,isLeft,S);
    ctx.restore();

    // ── ORNATE GAVEL STAFF (off-hand, held)
    p(8,-14,CO,5,30); p(9,-13,GS,4,28); p(9,-10,GM,3,22);                         // shaft
    p(9,-13,GB,3,1);                                                              // top highlight
    p(8,-8,GB,5,1); p(8,2,GB,5,1);                                                // gold bands
    // Gavel head (massive top)
    p(5,-22,CO,14,9); p(6,-21,GM,12,7); p(7,-20,GB,9,5); p(8,-19,GL,5,3);
    p(6,-21,GW,12,1);                                                             // top highlight
    p(5,-22,CO,3,9); p(6,-21,GS,1,7);                                             // left mallet end
    p(16,-22,CO,3,9); p(17,-21,GS,1,7);                                           // right mallet end
    // Base / pedestal
    p(5,7,CO,13,8); p(6,8,GS,11,6); p(7,9,GM,8,4); p(8,10,GB,5,2);
    p(6,8,GW,11,1);

    // ── BOOTS (navy)
    p(-7,14,CO,7,9); p(-6,15,NS,5,8); p(-4,16,NM,3,6);
    p( 1,14,CO,6,9); p( 2,15,NS,5,8); p( 3,16,NM,3,6);
    p(-7,14,GB,7,1); p( 1,14,GB,6,1);

    // ── JUDGE ROBE LOWER (navy, gold scripture column)
    p(-8,2,CO,16,13); p(-7,3,NS,14,11); p(-6,4,NM,11,9); p(-5,5,NB,7,7);
    p(-7,3,NW,14,1);                                                              // top highlight
    p(-2,2,CO,5,13); p(-1,3,GS,3,11); p(0,4,GM,2,9); p(0,4,GB,2,1);
    p(-7,12,CO,14,3); p(-6,13,GS,12,2); p(-5,13,GB,12,1);                         // gold hem

    // ── BELT (gold sash + ruby center gem)
    p(-8,0,CO,16,3); p(-7,1,GM,14,2); p(-7,1,GB,14,1);
    p(-2,0,CO,4,3); p(-1,1,RD,2,1);

    // ── UPPER ROBE (riveted)
    p(-7,-14,CO,15,17); p(-6,-13,NS,13,15); p(-5,-12,NM,10,12); p(-4,-11,NB,7,10);
    p(-6,-13,NW,13,1);                                                            // top highlight
    p(-2,-13,CO,5,16); p(-1,-12,GS,3,14); p(0,-11,GM,2,12); p(0,-8,GB,2,6);       // scripture column
    p(-5,-14,CO,10,3); p(-4,-13,NB,8,2); p(-4,-13,NL,8,1);                        // collar
    for (let r=0; r<3; r++) { p(-6,-9+r*5,GB,1,1); p(5,-9+r*5,GB,1,1); }          // gold rivets

    // ── PAULDRONS (gold-trim)
    p(-13,-13,CO,8,9); p(-12,-11,NM,6,8); p(-11,-11,NB,4,7); p(-12,-11,NW,6,1);
    p(-12,-12,GB,6,1);                                                            // gold cap
    p( 6,-13,CO,8,9); p( 7,-11,NM,6,8); p( 8,-11,NB,4,7); p( 7,-11,NW,6,1);
    p( 7,-12,GB,6,1);

    // ── ARMS + GAUNTLETS
    p(-11,-10,CO,5,12); p(-10,-9,NM,4,10); p(-10,-9,NW,4,1);
    p(-11,-17,CO,5,8); p(-10,-16,SK,4,6);
    p( 7,-10,CO,5,12); p( 8,-9,NM,4,10); p( 8,-9,NW,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,SK,4,6);

    // ── NECK
    p(-3,-16,CO,7,3); p(-2,-15,SK,5,2);

    // ── HEAD (judge face, stern)
    p(-8,-30,CO,16,14); p(-7,-29,SK,14,12); p(-6,-28,'#F5E0C0',11,10); p(-5,-27,'#F5C880',8,8);
    p(-5,-23,CO,3,2); p( 2,-23,CO,3,2); p(-4,-23,NL,2,1); p( 3,-23,NL,2,1);
    p(-3,-21,CO,6,1);                                                             // stern mouth
    // White judge wig curls (sides)
    p(-7,-25,CO,15,4); p(-6,-24,SS,13,3); p(-5,-24,SB,10,2); p(-4,-24,SH,7,1);

    // ── POWDERED WIG TOP + JUDGE'S BERET CAP
    p(-8,-36,CO,16,8); p(-7,-35,SB,14,7); p(-6,-34,SH,11,6);
    p(-8,-38,CO,8,4); p(-7,-37,SB,6,3); p(-7,-37,SH,6,1);                         // L curl
    p( 0,-38,CO,8,4); p( 1,-37,SB,6,3); p( 1,-37,SH,6,1);                         // R curl
    // Gold-trim beret top
    p(-3,-40,CO,6,4); p(-2,-39,NB,4,3); p(-2,-39,GB,4,1);
    p(-1,-42,CO,3,3); p( 0,-41,GB,1,2);                                           // gold finial

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.70; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,4,-24+idleY,GL,18,16,isLeft,S);                           // gavel slam
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.55; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-15,-36+scaleSway+idleY,GW,32,10,isLeft,S);               // scale flash
        ctx.restore();
    }
}

/* ════════════════════════════════════════════════════════════ drawBinder ═══ */
function drawBinder(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.003) * 3;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep         = (Math.sin(now * 0.005) + 1) / 2;
    const ghostPulse = (Math.sin(now * 0.004) + 1) / 2;
    const CO='#000000';
    const GS='#D8E8E8', GM='#E8F4F4', GB='#F0FAFA', GLA='#F8FEFE', GH='#FFFFFF';
    const CY1='#0099CC', CY='#00ACC1', CL='#00E5FF', CH='#B2EBF2', CW='#E0FFFF';
    const CS='#455A64', CM='#607D8B', CB='#78909C', CHL='#90A4AE';
    const SK='#E8F0F0';
    const GD='#FFD700';

    // ── ethereal aura
    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.20;
    pUnit(ctx,cx,cy,-22,-32+idleY,CL,44,68,isLeft,S);
    ctx.restore();

    // ── 4 SPECTRAL BINDING CHAINS each side (8 total links)
    for (let i = 0; i < 4; i++) {
        const swayL = Math.sin(now * 0.005 + i * 0.7) * 6;
        const swayR = Math.cos(now * 0.005 + i * 0.7) * 5;
        // Left chain link
        p(-19, 2+i*6+swayL, CO, 8, 5); p(-18, 3+i*6+swayL, CS, 6, 4);
        p(-17, 3+i*6+swayL, CM, 4, 4); p(-16, 4+i*6+swayL, CB, 2, 2);
        p(-18, 3+i*6+swayL, CHL, 6, 1);                                            // highlight
        ctx.save(); ctx.globalAlpha = 0.50 + ghostPulse * 0.30;
        pUnit(ctx,cx,cy,-19,2+i*6+swayL+idleY,CL,8,5,isLeft,S);
        ctx.restore();
        // Right chain link
        p(11, -2+i*6+swayR, CO, 8, 5); p(12, -1+i*6+swayR, CS, 6, 4);
        p(13, -1+i*6+swayR, CM, 4, 4); p(14, 0+i*6+swayR, CB, 2, 2);
        p(12, -1+i*6+swayR, CHL, 6, 1);
        ctx.save(); ctx.globalAlpha = 0.50 + ghostPulse * 0.30;
        pUnit(ctx,cx,cy,11,-2+i*6+swayR+idleY,CL,8,5,isLeft,S);
        ctx.restore();
    }

    // ── LARGE BINDING ORB (held high, pulsing rings)
    // Outer ring
    p( 8,-24,CO,14,18); p( 9,-23,CY1,12,16); p(10,-22,CY,10,14);
    p( 9,-23,CH,12,1);                                                            // top highlight
    // Inner core
    p(11,-20,CO,8,10); p(12,-19,CL,6,8); p(13,-18,CW,4,6); p(14,-17,GH,2,4);
    ctx.save(); ctx.globalAlpha = 0.60 + ghostPulse * 0.35;
    pUnit(ctx,cx,cy,11,-20+idleY,CW,8,10,isLeft,S);
    ctx.restore();
    // Outer pulsing ring (4 corner studs)
    p( 8,-24,CO,2,2); p(20,-24,CO,2,2); p( 8,-8,CO,2,2); p(20,-8,CO,2,2);
    p( 9,-23,GD,1,1); p(20,-23,GD,1,1); p( 9,-8,GD,1,1); p(20,-8,GD,1,1);
    // Holding stand below orb
    p( 9,-6,CO,12,4); p(10,-5,CS,10,2); p(10,-5,CHL,10,1);
    p(10,-2,CO,10,3); p(11,-1,CM,8,2);

    // ── BOOTS (cyan-cuffed)
    p(-7,14,CO,7,9); p(-6,15,GS,5,8); p(-4,16,GM,3,6);
    p( 1,14,CO,6,9); p( 2,15,GS,5,8); p( 3,16,GM,3,6);
    p(-7,14,CL,7,1); p( 1,14,CL,6,1);

    // ── ROBE LOWER (white-ghost, top-highlighted, cyan glow)
    p(-8,2,CO,16,13); p(-7,3,GS,14,11); p(-6,4,GM,11,9); p(-5,5,GB,7,7);
    p(-7,3,GH,14,1);                                                              // top highlight
    p(-3,6,`rgba(0,229,255,${0.15+ghostPulse*0.25})`,7,6);

    // ── BELT (silver w/ glowing cyan buckle)
    p(-8,0,CO,16,3); p(-7,1,CM,14,2); p(-7,1,CHL,14,1);
    p(-2,0,CO,4,3); p(-1,1,CL,2,1);
    ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
    pUnit(ctx,cx,cy,-1,1+idleY,CW,2,1,isLeft,S);
    ctx.restore();

    // ── UPPER ROBE (cyan power channel, rivets)
    p(-7,-14,CO,15,17); p(-6,-13,GS,13,15); p(-5,-12,GM,10,12); p(-4,-11,GB,7,10); p(-3,-10,GLA,4,8);
    p(-6,-13,GH,13,1);                                                            // top highlight
    p(-2,-8,`rgba(0,229,255,${0.20+ghostPulse*0.30})`,6,10);
    p(-5,-14,CO,10,3); p(-4,-13,CS,8,2); p(-3,-13,CHL,5,1);                       // silver collar
    for (let r=0; r<3; r++) { p(-6,-10+r*4,CL,1,1); p(5,-10+r*4,CL,1,1); }        // glowing rivets

    // ── PAULDRONS (silver-rim)
    p(-13,-13,CO,8,9); p(-12,-11,GS,6,8); p(-11,-11,GM,4,7); p(-12,-11,GH,6,1);
    p(-12,-12,CM,6,1);
    p( 6,-13,CO,8,9); p( 7,-11,GS,6,8); p( 8,-11,GM,4,7); p( 7,-11,GH,6,1);
    p( 7,-12,CM,6,1);

    // ── ARMS + HANDS
    p(-11,-10,CO,5,12); p(-10,-9,GM,4,10); p(-10,-9,GH,4,1);
    p(-11,-17,CO,5,8); p(-10,-16,SK,4,6);
    p( 7,-10,CO,5,12); p( 8,-9,GM,4,10); p( 8,-9,GH,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,SK,4,6);

    // ── NECK
    p(-3,-16,CO,7,3); p(-2,-15,SK,5,2);

    // ── HEAD (ghostly, cyan glowing eye visor band)
    p(-8,-30,CO,16,14); p(-7,-29,SK,14,12); p(-6,-28,GS,11,10); p(-5,-27,'#D0E8E8',8,8);
    // Wide cyan visor band
    p(-7,-25,CO,15,4); p(-6,-24,CY,13,3); p(-6,-24,CL,13,1);
    p(-4,-23,CL,4,2); p( 2,-23,CL,4,2);
    p(-3,-23,CW,2,1); p( 3,-23,CW,2,1);
    ctx.save(); ctx.globalAlpha = 0.55 + ghostPulse * 0.30;
    pUnit(ctx,cx,cy,-6,-24+idleY,CW,13,3,isLeft,S);
    ctx.restore();
    p(-2,-21,`rgba(0,229,255,0.6)`,4,2);

    // ── HOOD CAP (cyan-tipped antenna)
    p(-8,-36,CO,16,8); p(-7,-35,GS,14,7); p(-6,-34,GM,11,6); p(-5,-33,GB,8,5);
    p(-7,-35,GH,14,1);                                                            // top highlight
    p(-2,-40,CO,4,5); p(-1,-39,CY,2,4); p(-1,-39,CL,2,1);                         // antenna base
    p(-1,-42,CO,2,3); p( 0,-41,CW,1,2);                                           // antenna tip
    ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
    pUnit(ctx,cx,cy, 0,-42+idleY,CW,1,2,isLeft,S);
    ctx.restore();

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.78; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy, 8,-26+idleY,CW,16,22,isLeft,S);                          // orb burst
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.50; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-8,-12+idleY,CL,28,40,isLeft,S);
        ctx.restore();
    }
}

/* ══════════════════════════════════════════════════════ drawAbsoluteZero ═══ */
function drawAbsoluteZero(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep        = (Math.sin(now * 0.005) + 1) / 2;
    const frostPulse = (Math.sin(now * 0.006) + 1) / 2;
    const cryF      = Math.sin(now * 0.003) * 1.5;
    const CO='#000000';
    const IS='#A0C8D8', IM='#B8D8E8', IB='#D0EAF4', IL='#E8F6FC', IH='#FFFFFF';
    const IC='#00B8D4', CL='#00E5FF', CH='#B2EBF2', CW='#E0FFFF';
    const SK='#E8F0F4';
    const GD2='#B88000', GD='#FFD700';

    // ── absolute frost aura
    ctx.save(); ctx.globalAlpha = 0.15 + ep * 0.22;
    pUnit(ctx,cx,cy,-22,-46+idleY,CL,44,82,isLeft,S);
    ctx.restore();

    // ── 3 FLOATING ICE SPIKES (orbiting)
    for (let i = 0; i < 3; i++) {
        const spY = Math.sin(now * 0.006 + i * 2.1) * 12;
        const spX = -22 + i * 22;
        p(spX,   spY-5, CO, 5, 16);
        p(spX+1, spY-4, IS, 3, 14);
        p(spX+1, spY-4, IH, 3, 1);                                                // top highlight
        p(spX+2, spY-3, IL, 1, 10);
        p(spX+2, spY-1, CW, 1, 5);
        ctx.save(); ctx.globalAlpha = 0.55 + frostPulse * 0.30;
        pUnit(ctx,cx,cy,spX,spY-5+idleY,CW,5,16,isLeft,S);
        ctx.restore();
    }

    // ── TALL ICE SCEPTER (taller, multi-shard crystal top)
    p(9,-54,CO,5,46); p(10,-53,IC,3,44); p(10,-50,CL,2,38);                       // shaft
    p(9,-44,GD,5,1); p(9,-32,GD,5,1); p(9,-20,GD,5,1); p(9,-8,GD,5,1);            // gold bands
    // Main crystal (bigger, faceted, bobbing)
    p(6,-62+cryF,CO,12,14); p(7,-61+cryF,IC,10,12); p(8,-60+cryF,CL,8,10);
    p(7,-61+cryF,CW,10,1);                                                        // top highlight
    p(9,-59+cryF,IL,5,7); p(10,-58+cryF,CW,3,4);
    // Sub-shards (3 smaller, surrounding)
    p( 5,-58+cryF,CO,3,5); p( 6,-57+cryF,IC,1,4);
    p(18,-58+cryF,CO,3,5); p(19,-57+cryF,IC,1,4);
    p(10,-66+cryF,CO,4,4); p(11,-65+cryF,CL,2,3); p(11,-66+cryF,CW,2,1);
    ctx.save(); ctx.globalAlpha = 0.60 + frostPulse * 0.35;
    pUnit(ctx,cx,cy,7,-61+cryF+idleY,CW,10,12,isLeft,S);
    ctx.restore();

    // ── FROST MIST (subtle)
    ctx.save(); ctx.globalAlpha = 0.30 + frostPulse * 0.20;
    pUnit(ctx,cx,cy,-4,-20+idleY,CW,10,4,isLeft,S);
    ctx.restore();

    // ── BOOTS (frost-cuffed)
    p(-7,14,CO,7,9); p(-6,15,IS,5,8); p(-4,16,IM,3,6);
    p( 1,14,CO,6,9); p( 2,15,IS,5,8); p( 3,16,IM,3,6);
    p(-7,14,CL,7,1); p( 1,14,CL,6,1);

    // ── ROBE LOWER (top-highlighted, ice rivets)
    p(-8,2,CO,16,13); p(-7,3,IS,14,11); p(-6,4,IM,11,9); p(-5,5,IB,7,7); p(-4,6,IL,4,5);
    p(-7,3,IH,14,1);                                                              // top highlight
    p(-6,8,IC,1,5); p(3,7,IC,1,6);                                                // ice channels
    for (let r=0; r<2; r++) { p(-6,5+r*4,IH,1,1); p(5,5+r*4,IH,1,1); }            // ice rivets

    // ── BELT (gold w/ ice gem buckle)
    p(-8,0,CO,16,3); p(-7,1,GD2,14,2); p(-7,1,GD,14,1);
    p(-2,0,CO,4,3); p(-1,1,CW,2,1);

    // ── CHEST (frost gem, riveted)
    p(-7,-14,CO,15,17); p(-6,-13,IS,13,15); p(-5,-12,IM,10,12); p(-4,-11,IB,7,10); p(-3,-10,IL,4,8);
    p(-6,-13,IH,13,1);                                                            // top highlight
    p(-2,-8,`rgba(0,229,255,${0.25+frostPulse*0.30})`,6,10);
    // Frost gem chest emblem
    p(-3,-6,CO,6,6); p(-2,-5,IC,4,4); p(-2,-5,CW,4,1); p(-1,-4,IH,2,2);
    ctx.save(); ctx.globalAlpha = 0.60 + ep * 0.35;
    pUnit(ctx,cx,cy,-3,-6+idleY,CW,6,6,isLeft,S);
    ctx.restore();
    p(-5,-14,CO,10,3); p(-4,-13,IC,8,2); p(-3,-13,CL,5,1);                        // collar
    for (let r=0; r<3; r++) { p(-6,-10+r*4,IH,1,1); p(5,-10+r*4,IH,1,1); }        // ice rivets

    // ── PAULDRONS (jagged ice shards)
    p(-13,-13,CO,8,9); p(-12,-11,IS,6,8); p(-11,-11,IM,4,7); p(-10,-10,IH,2,5);
    p(-12,-11,CW,6,1);
    p(-14,-17,CO,3,5); p(-13,-16,IC,1,4); p(-13,-16,IH,1,1);                      // shoulder shard L
    p( 6,-13,CO,8,9); p( 7,-11,IS,6,8); p( 8,-11,IM,4,7); p( 9,-10,IH,2,5);
    p( 7,-11,CW,6,1);
    p(11,-17,CO,3,5); p(12,-16,IC,1,4); p(12,-16,IH,1,1);                         // shoulder shard R

    // ── ARMS + HANDS
    p(-11,-10,CO,5,12); p(-10,-9,IM,4,10); p(-10,-9,IH,4,1);
    p(-11,-17,CO,5,8); p(-10,-16,SK,4,6);
    p( 7,-10,CO,5,12); p( 8,-9,IM,4,10); p( 8,-9,IH,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,SK,4,6);

    // ── NECK
    p(-3,-16,CO,7,3); p(-2,-15,SK,5,2);

    // ── HEAD (pale ice-tinted)
    p(-8,-30,CO,16,14); p(-7,-29,SK,14,12); p(-6,-28,IS,11,10); p(-5,-27,IM,8,8); p(-4,-26,IH,5,6);
    // Frost circlet
    p(-8,-29,CO,16,2); p(-7,-28,IC,14,1);
    p(-5,-23,CO,3,2); p( 2,-23,CO,3,2); p(-4,-23,IH,2,1); p( 3,-23,IH,2,1);
    ctx.save(); ctx.globalAlpha = 0.65 + frostPulse * 0.30;
    pUnit(ctx,cx,cy,-4,-23+idleY,CW,2,1,isLeft,S);
    pUnit(ctx,cx,cy, 3,-23+idleY,CW,2,1,isLeft,S);
    ctx.restore();
    p(-2,-21,CO,5,1);

    // ── 5-SPIKE ICE CROWN (taller, prominent)
    p(-8,-36,CO,16,8); p(-7,-35,IS,14,7); p(-6,-34,IM,11,5); p(-5,-33,IH,8,3);
    p(-7,-35,IH,14,1);                                                            // top highlight
    p(-8,-36,GD,16,1);                                                            // gold base ring
    // 5 spikes (center tallest)
    p(-8,-40,CO,3,5); p(-7,-39,IC,1,4);
    p(-4,-42,CO,3,7); p(-3,-41,IC,1,6); p(-3,-43,CW,1,1);
    p(-1,-46,CO,4,10); p( 0,-45,CL,2,9); p( 0,-45,CW,2,2); p( 1,-48,IH,1,2);      // center spike
    p( 3,-42,CO,3,7); p( 4,-41,IC,1,6); p( 4,-43,CW,1,1);
    p( 6,-40,CO,3,5); p( 7,-39,IC,1,4);
    ctx.save(); ctx.globalAlpha = 0.55 + frostPulse * 0.35;
    pUnit(ctx,cx,cy, 1,-48+idleY,CW,1,3,isLeft,S);
    ctx.restore();

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.78; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy, 5,-66+cryF+idleY,CW,18,18,isLeft,S);                     // crystal flash
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.45; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-10,-16+idleY,IH,24,42,isLeft,S);
        ctx.restore();
    }
}

/* ═══════════════════════════════════════════════════════ drawPermafrost ═══ */
function drawPermafrost(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.002) * 5;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep         = (Math.sin(now * 0.005) + 1) / 2;
    const driftPulse = (Math.sin(now * 0.004) + 1) / 2;
    const orbF       = Math.sin(now * 0.003) * 1.5;
    const CO='#000000';
    const NS='#C8D8E8', NM='#D8E8F4', NB='#E8F4FC', NW='#FFFFFF';
    const NBS='#78B8D8', NBI='#00ACC1';
    const IC='#00B8D4', CL='#00E5FF', CW='#E0FFFF';
    const SK='#E8F0F4';
    const GD2='#B88000', GD='#FFD700';

    // ── frost aura
    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.22;
    pUnit(ctx,cx,cy,-22,-44+idleY,CW,44,76,isLeft,S);
    ctx.restore();

    // ── 6 ORBITING SNOWFLAKES (varying size/orbit)
    for (let i = 0; i < 6; i++) {
        const sA = now * 0.003 + i * (Math.PI / 3);
        const sR = 18 + (i % 2) * 6;
        const sx = Math.cos(sA) * sR;
        const sy = Math.sin(sA) * sR * 0.55 - 6;
        const sz = i % 2 === 0 ? 3 : 2;
        // Snowflake (cross pattern w/ outline)
        p(sx-sz+1, sy, CO, sz*2-1, 1); p(sx, sy-sz+1, CO, 1, sz*2-1);
        p(sx-1+1, sy, NW, sz === 3 ? 3 : 2, 1); p(sx, sy-1+1, NW, 1, sz === 3 ? 3 : 2);
        ctx.save(); ctx.globalAlpha = 0.55 + driftPulse * 0.30;
        pUnit(ctx,cx,cy,sx-1,sy-1+idleY,CW,3,3,isLeft,S);
        ctx.restore();
    }

    // ── BIG FROST ORB (held, pulsing ring)
    // Outer ring
    p(-17,-6+orbF,CO,14,14); p(-16,-5+orbF,NS,12,12); p(-15,-4+orbF,IC,10,10);
    p(-14,-3+orbF,CL,8,8); p(-13,-2+orbF,CW,5,5); p(-13,-1+orbF,NW,3,3);
    p(-16,-5+orbF,NW,12,1);                                                       // top highlight
    // 4 corner studs (gold)
    p(-17,-6+orbF,CO,1,1); p(-4,-6+orbF,CO,1,1); p(-17,7+orbF,CO,1,1); p(-4,7+orbF,CO,1,1);
    p(-17,-5+orbF,GD,1,1); p(-5,-5+orbF,GD,1,1); p(-17,6+orbF,GD,1,1); p(-5,6+orbF,GD,1,1);
    ctx.save(); ctx.globalAlpha = 0.60 + ep * 0.35;
    pUnit(ctx,cx,cy,-15,-4+orbF+idleY,CW,10,10,isLeft,S);
    ctx.restore();
    // Holding hand-rod
    p(-5,4+orbF,CO,4,8); p(-4,5+orbF,NM,2,6);

    // ── BOOTS (frost-cuffed)
    p(-7,14,CO,7,9); p(-6,15,NS,5,8); p(-4,16,NM,3,6);
    p( 1,14,CO,6,9); p( 2,15,NS,5,8); p( 3,16,NM,3,6);
    p(-7,14,CL,7,1); p( 1,14,CL,6,1);

    // ── ROBE LOWER (top-highlighted, frosted-blue ribbons)
    p(-8,2,CO,16,13); p(-7,3,NS,14,11); p(-6,4,NM,11,9); p(-5,5,NB,7,7); p(-4,6,NW,4,5);
    p(-7,3,NW,14,1);                                                              // top highlight
    p(-7,5,NBS,2,8); p( 4,4,NBS,2,9);                                             // blue ribbons
    p(-7,12,CO,14,3); p(-6,13,IC,12,2); p(-6,13,CL,12,1);                         // ice hem

    // ── BELT (gold + ice gem)
    p(-8,0,CO,16,3); p(-7,1,GD2,14,2); p(-7,1,GD,14,1);
    p(-2,0,CO,4,3); p(-1,1,CW,2,1);

    // ── CHEST (top-highlighted, ice gem, rivets)
    p(-7,-14,CO,15,17); p(-6,-13,NS,13,15); p(-5,-12,NM,10,12); p(-4,-11,NB,7,10); p(-3,-10,NW,4,8);
    p(-6,-13,NW,13,1);                                                            // top highlight
    p(-6,-8,NBS,2,10); p( 3,-7,NBS,2,9);                                          // blue ribbons
    // Ice snowflake gem chest emblem
    p(-3,-6,CO,6,6); p(-2,-5,IC,4,4); p(-2,-5,CW,4,1); p(-1,-4,NW,2,2);
    p(-2,-7,CO,4,1); p(-2,-2,CO,4,1); p(-3,-4,CO,1,2); p(2,-4,CO,1,2);            // snowflake arms
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.30;
    pUnit(ctx,cx,cy,-3,-6+idleY,CW,6,6,isLeft,S);
    ctx.restore();
    p(-5,-14,CO,10,3); p(-4,-13,NW,8,2); p(-3,-13,CW,5,1);                        // collar
    for (let r=0; r<3; r++) { p(-6,-10+r*4,IC,1,1); p(5,-10+r*4,IC,1,1); }        // ice rivets

    // ── PAULDRONS (snow-capped)
    p(-13,-13,CO,8,9); p(-12,-11,NS,6,8); p(-11,-11,NM,4,7); p(-10,-10,NW,2,5);
    p(-12,-11,NW,6,1);
    p(-12,-12,IC,6,1);
    p( 6,-13,CO,8,9); p( 7,-11,NS,6,8); p( 8,-11,NM,4,7); p( 9,-10,NW,2,5);
    p( 7,-11,NW,6,1);
    p( 7,-12,IC,6,1);

    // ── ARMS + HANDS
    p(-11,-10,CO,5,12); p(-10,-9,NM,4,10); p(-10,-9,NW,4,1);
    p(-11,-17,CO,5,8); p(-10,-16,SK,4,6);
    p( 7,-10,CO,5,12); p( 8,-9,NM,4,10); p( 8,-9,NW,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,SK,4,6);

    // ── NECK
    p(-3,-16,CO,7,3); p(-2,-15,SK,5,2);

    // ── HEAD (pale, frost-breath)
    p(-8,-30,CO,16,14); p(-7,-29,SK,14,12); p(-6,-28,NS,11,10); p(-5,-27,NM,8,8);
    p(-3,-21,`rgba(224,255,255,${0.50+driftPulse*0.30})`,7,2);                    // breath
    p(-5,-25,CO,3,2); p( 2,-25,CO,3,2); p(-4,-25,CW,2,1); p( 3,-25,CW,2,1);
    ctx.save(); ctx.globalAlpha = 0.65 + driftPulse * 0.30;
    pUnit(ctx,cx,cy,-4,-25+idleY,NW,2,1,isLeft,S);
    pUnit(ctx,cx,cy, 3,-25+idleY,NW,2,1,isLeft,S);
    ctx.restore();

    // ── FROST CROWN (4-spike, gold-base)
    p(-8,-36,CO,16,6); p(-7,-35,NS,14,5); p(-6,-34,NBI,11,4); p(-5,-33,IC,8,2);
    p(-7,-35,NW,14,1);                                                            // top highlight
    p(-8,-36,GD,16,1);                                                            // gold base
    // 4 ice spikes (center taller)
    p(-7,-40,CO,3,5); p(-6,-39,IC,1,4); p(-6,-40,CW,1,1);                         // outer L
    p(-3,-42,CO,3,7); p(-2,-41,IC,1,6); p(-2,-42,CW,1,1);                         // inner L
    p( 1,-44,CO,4,9); p( 2,-43,CL,2,8); p( 2,-44,CW,2,2);                         // center (tallest)
    p( 5,-42,CO,3,7); p( 6,-41,IC,1,6); p( 6,-42,CW,1,1);                         // inner R
    ctx.save(); ctx.globalAlpha = 0.55 + driftPulse * 0.30;
    pUnit(ctx,cx,cy, 2,-46+idleY,CW,2,3,isLeft,S);
    ctx.restore();

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.72; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-17,-8+orbF+idleY,CW,16,18,isLeft,S);                     // orb burst
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.55; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-10,-16+idleY,NW,24,42,isLeft,S);
        ctx.restore();
    }
}

/* ══════════════════════════════════════════════════════════════ drawSeer ═══ */
function drawSeer(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.003) * 3;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep        = (Math.sin(now * 0.005) + 1) / 2;
    const eyePulse  = (Math.sin(now * 0.004) + 1) / 2;
    const eyeX      = Math.sin(now * 0.001) * 2;
    const eyeFloat  = Math.sin(now * 0.002) * 5;
    const CO='#000000';
    const YS='#B8960A', YM='#D4A820', YB='#E8C040', YL='#F5D870', YH='#FFFDE7';
    const GS='#7A5800', GM='#B8860B', GB='#FFD700', GL='#FFE57F', GW='#FFFCC0';
    const CY1='#0099CC', CY='#00ACC1', CL='#00E5FF', CW='#E0FFFF';
    const GHL='#8D6E63', SK='#F5DCC7', DS='#E8C09A';
    const PR='#7B1FA2';

    // ── foresight aura
    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnit(ctx,cx,cy,-22,-52+idleY,GB,44,86,isLeft,S);
    ctx.restore();

    // ── ALL-SEEING EYE (large, floating, multi-iris)
    // Outer eye shell (almond)
    p(-5,-44+eyeFloat,CO,16,16); p(-4,-43+eyeFloat,GS,14,14); p(-4,-43+eyeFloat,GM,14,1);
    // Sclera (white)
    p(-3,-42+eyeFloat,CO,12,12); p(-2,-41+eyeFloat,'#FFFFFF',10,10);
    // Iris (gold→cyan layers, tracking)
    p(eyeX-2,-38+eyeFloat,GM,9,9);
    p(eyeX-1,-37+eyeFloat,CY1,7,7);
    p(eyeX,  -36+eyeFloat,CY,5,5);
    p(eyeX+1,-35+eyeFloat,CL,3,3);
    // Pupil (black w/ purple inner glow)
    p(eyeX+1,-35+eyeFloat,CO,3,3); p(eyeX+2,-34+eyeFloat,PR,1,1);
    // Catch-lights
    p(eyeX,-37+eyeFloat,'#FFFFFF',1,1); p(eyeX+3,-34+eyeFloat,CW,1,1);
    // Eye glow
    ctx.save(); ctx.globalAlpha = 0.50 + eyePulse * 0.35;
    pUnit(ctx,cx,cy,-3,-42+eyeFloat+idleY,GL,12,12,isLeft,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.30 + eyePulse * 0.30;
    pUnit(ctx,cx,cy,-7,-46+eyeFloat+idleY,GW,20,20,isLeft,S);
    ctx.restore();

    // ── GOLD SCEPTER w/ CYAN CRYSTAL TOP
    p(9,-50,CO,5,40); p(10,-49,GS,3,38); p(10,-46,GM,2,32); p(10,-42,GB,2,26);    // shaft
    p(9,-40,GB,5,1); p(9,-28,GB,5,1); p(9,-16,GB,5,1); p(9,-4,GB,5,1);            // gold bands
    // Cyan crystal top (multi-faceted)
    p(6,-58,CO,12,12); p(7,-57,CY1,10,10); p(8,-56,CY,8,8); p(9,-55,CL,6,6);
    p(7,-57,CW,10,1);                                                             // top highlight
    p(10,-54,'#FFFFFF',4,4);
    // Sub-shards
    p( 5,-54,CO,3,4); p( 6,-53,CY,1,3);
    p(18,-54,CO,3,4); p(19,-53,CY,1,3);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.35;
    pUnit(ctx,cx,cy,7,-57+idleY,CW,10,10,isLeft,S);
    ctx.restore();

    // ── BOOTS
    p(-7,14,CO,7,9); p(-6,15,YS,5,8); p(-4,16,YM,3,6);
    p( 1,14,CO,6,9); p( 2,15,YS,5,8); p( 3,16,YM,3,6);
    p(-7,14,GB,7,1); p( 1,14,GB,6,1);

    // ── ROBE LOWER (top-highlighted, gold side trims)
    p(-8,2,CO,16,13); p(-7,3,YS,14,11); p(-6,4,YM,11,9); p(-5,5,YB,7,7);
    p(-7,3,YH,14,1);                                                              // top highlight
    p(-5,4,GB,1,10); p(4,4,GB,1,10);
    p(-7,12,CO,14,3); p(-6,13,GM,12,2); p(-6,13,GB,12,1);                         // gold hem

    // ── BELT (gold w/ cyan gem buckle)
    p(-8,0,CO,16,3); p(-7,1,GM,14,2); p(-7,1,GB,14,1);
    p(-2,0,CO,4,3); p(-1,1,CY,2,1);
    ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
    pUnit(ctx,cx,cy,-1,1+idleY,CW,2,1,isLeft,S);
    ctx.restore();

    // ── CHEST (riveted, cyan eye gem emblem)
    p(-7,-14,CO,15,17); p(-6,-13,YS,13,15); p(-5,-12,YM,10,12); p(-4,-11,YB,7,10); p(-3,-10,YL,4,8);
    p(-6,-13,YH,13,1);                                                            // top highlight
    p(-5,-12,GB,1,10); p(3,-11,GB,1,9);                                           // gold trims
    // Cyan eye gem chest
    p(-3,-6,CO,6,6); p(-2,-5,GM,4,4); p(-2,-5,GB,4,1);
    p(-1,-4,CY,2,2); p(-1,-4,CW,2,1);
    p( 0,-3,CO,1,1);                                                              // pupil
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.35;
    pUnit(ctx,cx,cy,-3,-6+idleY,CL,6,6,isLeft,S);
    ctx.restore();
    for (let r=0; r<3; r++) { p(-6,-10+r*4,CL,1,1); p(5,-10+r*4,CL,1,1); }        // glowing rivets

    // ── PAULDRONS (gold-trim)
    p(-13,-13,CO,8,9); p(-12,-11,YM,6,8); p(-11,-11,YB,4,7); p(-12,-11,YL,6,1);
    p(-12,-12,GB,6,1);
    p( 6,-13,CO,8,9); p( 7,-11,YM,6,8); p( 8,-11,YB,4,7); p( 7,-11,YL,6,1);
    p( 7,-12,GB,6,1);

    // ── ARMS + HANDS
    p(-11,-10,CO,5,12); p(-10,-9,YM,4,10); p(-10,-9,YL,4,1);
    p(-11,-17,CO,5,8); p(-10,-16,SK,4,6);
    p( 7,-10,CO,5,12); p( 8,-9,YM,4,10); p( 8,-9,YL,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,SK,4,6);

    // ── NECK
    p(-3,-16,CO,7,3); p(-2,-15,SK,5,2);

    // ── HEAD (oracle, blinded — closed/glowing eye sockets)
    p(-8,-30,CO,16,14); p(-7,-29,SK,14,12); p(-6,-28,DS,11,10); p(-5,-27,'#F5C898',8,8);
    p(-5,-23,CO,3,2); p( 2,-23,CO,3,2); p(-4,-23,GM,2,1); p( 3,-23,GM,2,1);
    p(-2,-21,CO,5,1);
    // Third-eye on forehead (cyan glowing)
    p(-1,-26,CO,3,3); p( 0,-25,CY,1,1);
    ctx.save(); ctx.globalAlpha = 0.65 + eyePulse * 0.30;
    pUnit(ctx,cx,cy, 0,-25+idleY,CW,1,1,isLeft,S);
    ctx.restore();

    // ── ORACLE CROWN (gold w/ cyan central crystal)
    p(-8,-36,CO,16,6); p(-7,-35,YM,14,5); p(-6,-34,GB,11,4); p(-5,-33,GL,8,2);
    p(-7,-35,GW,14,1);                                                            // top highlight
    p(-8,-36,GS,16,1);                                                            // gold base
    // Central cyan crystal
    p(-2,-40,CO,4,5); p(-1,-39,CY,2,4); p(-1,-39,CW,2,1);
    p(-1,-42,CO,2,3); p( 0,-41,CL,1,2);                                           // top spike
    // Side gold spires
    p(-7,-38,CO,3,3); p(-6,-37,GB,1,2);
    p( 5,-38,CO,3,3); p( 6,-37,GB,1,2);

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.78; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-5,-44+eyeFloat+idleY,CW,18,18,isLeft,S);                 // eye flash
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.55; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy, 6,-60+idleY,CW,16,14,isLeft,S);                          // crystal flash
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.40; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-8,-14+idleY,YH,24,40,isLeft,S);
        ctx.restore();
    }
}

/* ════════════════════════════════════════════════════════ drawCommander ═══ */
function drawCommander(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep        = (Math.sin(now * 0.005) + 1) / 2;
    const flagWave  = Math.sin(now * 0.005) * 4;
    const tasselSway = Math.sin(now * 0.004) * 1;
    const CO='#000000';
    const US='#1C3040', UM='#263545', UB='#37474F', UL='#455A64', UH='#607D8B', UV='#90A4AE';
    const RS='#8B0000', RM='#B71C1C', RL='#D32F2F', RH='#EF5350';
    const GS='#7A5800', GM='#B8860B', GB='#FFD700', GL='#FFE57F', GW='#FFFCC0';
    const SK='#F0D0A0';
    const SV='#C0C0C0';

    // ── commander aura
    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnit(ctx,cx,cy,-22,-54+idleY,GB,44,90,isLeft,S);
    ctx.restore();

    // ── MASSIVE BATTLE BANNER (taller pole, fluttering flag, gold cross)
    // Pole
    p(12,-58,CO,3,72); p(13,-57,UB,1,70); p(13,-57,UV,1,70);
    // Pole finial (gold spearhead)
    p(11,-62,CO,5,5); p(12,-61,GM,3,4); p(12,-61,GB,3,1);
    p(13,-65,CO,3,4); p(13,-64,GB,1,3); p(13,-66,GW,1,1);
    // Flag cloth (deep crimson, larger)
    p(15,-58+flagWave,CO,18,22); p(16,-57+flagWave,RS,16,20); p(16,-57+flagWave,RM,16,1);
    p(17,-56+flagWave,RM,14,18); p(18,-55+flagWave,RL,12,16);
    // Gold cross emblem on flag
    p(20,-54+flagWave,CO,4,16); p(21,-53+flagWave,GM,2,14); p(21,-53+flagWave,GB,2,1);
    p(16,-50+flagWave,CO,16,4); p(17,-49+flagWave,GM,14,2); p(17,-49+flagWave,GB,14,1);
    ctx.save(); ctx.globalAlpha = 0.50 + ep * 0.30;
    pUnit(ctx,cx,cy,20,-54+flagWave+idleY,GW,4,16,isLeft,S);
    pUnit(ctx,cx,cy,16,-50+flagWave+idleY,GW,16,4,isLeft,S);
    ctx.restore();
    // Gold border on flag
    p(15,-58+flagWave,GB,18,1); p(15,-37+flagWave,GB,18,1);
    p(15,-58+flagWave,GB,1,22); p(32,-58+flagWave,GB,1,22);
    // 3 tassels along bottom edge (sway)
    p(18,-36+flagWave+tasselSway,GB,1,3);
    p(22,-36+flagWave-tasselSway,GB,1,3);
    p(26,-36+flagWave+tasselSway,GB,1,3);
    // Banner cord ornament
    p(10,-58,CO,5,4); p(11,-57,GB,3,3);

    // ── BOOTS (gold-cuffed)
    p(-7,14,CO,7,9); p(-6,15,US,5,8); p(-4,16,UM,3,6);
    p( 1,14,CO,6,9); p( 2,15,US,5,8); p( 3,16,UM,3,6);
    p(-7,14,GB,7,1); p( 1,14,GB,6,1);

    // ── ROBE LOWER (top-highlighted, gold side stripe)
    p(-8,2,CO,16,13); p(-7,3,US,14,11); p(-6,4,UM,11,9); p(-5,5,UB,7,7);
    p(-7,3,UV,14,1);                                                              // top highlight
    p(-6,3,RM,1,12); p( 4,3,RM,1,12);                                             // crimson side stripe
    p(-7,12,CO,14,3); p(-6,13,GM,12,2); p(-6,13,GB,12,1);                         // gold hem

    // ── BELT (gold sash)
    p(-8,0,CO,16,3); p(-7,1,GM,14,2); p(-7,1,GB,14,1);
    p(-2,0,CO,4,3); p(-1,1,RM,2,1);                                               // crimson buckle gem

    // ── CHEST (military jacket, gold medal cluster, riveted)
    p(-7,-14,CO,15,17); p(-6,-13,US,13,15); p(-5,-12,UM,10,12); p(-4,-11,UB,7,10); p(-3,-10,UL,4,8);
    p(-6,-13,UV,13,1);                                                            // top highlight
    p(-6,-13,RM,1,16); p( 4,-13,RM,1,16);                                         // crimson lapels
    // Gold medal cluster (3 medals)
    p(-4,-7,CO,3,3); p(-3,-6,GB,1,1);
    p( 0,-7,CO,3,3); p( 1,-6,GB,1,1);
    p(-4,-3,CO,3,3); p(-3,-2,GB,1,1);
    p( 0,-3,CO,3,3); p( 1,-2,GB,1,1);
    p(-2,-5,CO,4,4); p(-1,-4,GM,2,2); p(-1,-4,GW,2,1);                            // central medallion
    for (let r=0; r<3; r++) { p(-6,-10+r*4,GB,1,1); p(5,-10+r*4,GB,1,1); }        // gold rivets

    // ── GOLD EPAULETTES (fringed, larger)
    p(-14,-13,CO,9,8); p(-13,-12,GM,7,7); p(-12,-11,GB,5,6); p(-11,-10,GL,3,4);
    p(-13,-12,GW,7,1);                                                            // top highlight
    p(-14,-5,CO,7,3); p(-13,-4,GB,1,2); p(-11,-4,GB,1,2); p( -9,-4,GB,1,2);       // fringe L
    p( 6,-13,CO,9,8); p( 7,-12,GM,7,7); p( 8,-11,GB,5,6); p( 9,-10,GL,3,4);
    p( 7,-12,GW,7,1);
    p( 6,-5,CO,7,3); p( 7,-4,GB,1,2); p( 9,-4,GB,1,2); p(11,-4,GB,1,2);           // fringe R

    // ── ARMS + GAUNTLETS
    p(-11,-10,CO,5,12); p(-10,-9,UM,4,10); p(-10,-9,UV,4,1);
    p(-11,-17,CO,5,8); p(-10,-16,SK,4,6);
    p( 7,-10,CO,5,12); p( 8,-9,UM,4,10); p( 8,-9,UV,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,SK,4,6);

    // ── NECK + COLLAR
    p(-3,-16,CO,7,3); p(-2,-15,SK,5,2);

    // ── HEAD (stern commander face)
    p(-8,-30,CO,16,14); p(-7,-29,SK,14,12); p(-6,-28,'#F0D8A8',11,10); p(-5,-27,'#F0C890',8,8);
    p(-5,-23,CO,3,2); p( 2,-23,CO,3,2); p(-4,-23,UH,2,1); p( 3,-23,UH,2,1);
    p(-2,-21,CO,5,1);                                                             // stern mouth
    // Scar across cheek
    p(-6,-25,SK,1,1); p(-5,-24,SK,1,1); p(-4,-23,SK,1,1);

    // ── PEAKED CAP (military, gold rim, large gold emblem)
    p(-8,-36,CO,16,7); p(-7,-35,US,14,6); p(-6,-34,UM,11,5); p(-5,-33,UH,8,3);
    p(-7,-35,UV,14,1);                                                            // top highlight
    p(-8,-36,GB,16,1);                                                            // gold base
    // Visor brim (extended forward)
    p(-9,-32,CO,18,3); p(-8,-31,UB,16,2); p(-8,-31,UL,16,1);
    // Gold rim band
    p(-8,-38,CO,16,2); p(-7,-37,UB,14,1); p(-7,-37,GB,14,1);
    // Large gold cap emblem (cross/eagle motif)
    p(-3,-37,CO,6,5); p(-2,-36,GM,4,3); p(-2,-36,GB,4,1);
    p(-1,-35,GW,2,1);
    p(-3,-39,CO,6,2); p(-2,-39,GB,4,1);                                           // emblem wings spread
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.30;
    pUnit(ctx,cx,cy,-3,-37+idleY,GW,6,5,isLeft,S);
    ctx.restore();

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.72; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,14,-58+flagWave+idleY,RL,22,24,isLeft,S);                 // banner flash
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.45; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-8,-14+idleY,GB,24,40,isLeft,S);
        ctx.restore();
    }
}

/* ─── window exports ─────────────────────────────────────────────────────── */
window.drawExecutor    = drawExecutor;
window.drawBinder      = drawBinder;
window.drawAbsoluteZero = drawAbsoluteZero;
window.drawPermafrost  = drawPermafrost;
window.drawSeer        = drawSeer;
window.drawCommander   = drawCommander;

/* ─── Novice Exorcist Exclusive — Support T3 ────────────────────────────── */
function drawPsalmSinger(ctx, tower, cx, cy, isLeft) {
    const S = 2.0;
    const p = (ox,oy,c,w,h) => pUnit(ctx,cx,cy,ox,oy,c,w,h,isLeft,S);
    const now = performance.now();
    const idleY = Math.sin(now * 0.002) * 2;
    const isAtk = (now - tower.lastShot) < 350;
    const t = now * 0.001;
    const CO='#0A0820', WS='#F0ECF8', WH='#FFFFFF';
    const GD='#FFE060', GK='#FFD000', BL='#88AAFF';
    const SK='#FFCCAA', MN='#CC88FF', MD='#AA44FF';
    // ── Ambient sound waves (behind figure) ──────────────────
    ctx.save(); ctx.globalAlpha = 0.15 + Math.sin(t*2)*0.08;
    pUnit(ctx,cx,cy, -13, idleY-24, BL,  5,  4, isLeft, S);
    pUnit(ctx,cx,cy, -17, idleY-22, BL,  3,  3, isLeft, S);
    pUnit(ctx,cx,cy, -20, idleY-20, BL,  2,  2, isLeft, S);
    ctx.restore();
    // ── Lower robe hem ────────────────────────────────────────
    p(-5, idleY+ 4, CO, 10,  6);
    p(-4, idleY+ 5, WS,  8,  4);
    p(-6, idleY+ 2, WH, 12,  2);         // flowing hem flare
    // ── Torso — white ceremonial robe ─────────────────────────
    p(-5, idleY-14, CO, 10, 18);
    p(-4, idleY-13, WS,  8, 16);
    p(-3, idleY-12, WH,  6, 14);
    p(-4, idleY+ 0, GD,  8,  2);         // hem gold band
    p(-4, idleY- 8, GD,  8,  1);         // waist gold
    p(-4, idleY-13, GK,  1,  4);         // left trim stripe
    p( 3, idleY-13, GK,  1,  4);         // right trim stripe
    p(-3, idleY-11, BL,  1,  9);         // blue accent sash
    // ── Arms (choir presenting position) ─────────────────────
    p(-8, idleY-16, CO,  3,  9);  p(-7, idleY-15, WS, 2, 8); // left arm
    p(-9, idleY- 8, SK,  2,  2);                              // left hand
    p( 5, idleY-16, CO,  3,  9);  p( 5, idleY-15, WS, 2, 8); // right arm
    p( 7, idleY- 8, SK,  2,  2);                              // right hand
    // ── Neck ──────────────────────────────────────────────────
    p(-2, idleY-16, CO,  4,  3);
    p(-1, idleY-15, SK,  2,  2);
    // ── Head — elegant singer ──────────────────────────────────
    p(-5, idleY-28, CO, 10, 12);
    p(-4, idleY-27, SK,  8, 10);
    p(-2, idleY-21, CO,  4,  3);         // O-shape singing mouth outer
    p(-1, idleY-20, '#330000',  2,  2);  // mouth interior
    p(-1, idleY-21, CO,  2,  1);         // mouth top edge
    p(-3, idleY-25, CO,  2,  1);  // left eye
    p( 1, idleY-25, CO,  2,  1);  // right eye
    p(-2, idleY-24, WH,  1,  1);  p(2, idleY-24, WH, 1, 1); // catch-lights
    p(-3, idleY-27, CO,  3,  1);  p(1, idleY-27, CO, 2, 1); // arched brows
    p( 0, idleY-23, CO,  1,  1);         // nose
    p(-4, idleY-28, GD,  8,  2);         // golden hair
    p(-5, idleY-27, GD,  2,  4);  p(3, idleY-27, GD, 2, 4); // hair sides
    // ── Golden tiara / crown with 5 points ────────────────────
    p(-5, idleY-30, CO, 10,  2);         // crown band base
    p(-4, idleY-29, GD,  8,  1);         // crown band gold
    p(-5, idleY-32, GK,  2,  3);         // point far-left
    p(-3, idleY-33, GD,  2,  4);         // point left
    p(-1, idleY-34, GD,  2,  5);         // center point (tallest)
    p( 1, idleY-33, GD,  2,  4);         // point right
    p( 3, idleY-32, GK,  2,  3);         // point far-right
    p(-1, idleY-29, BL,  2,  1);         // crown gem
    // ── Floating music notes (3, slowly orbiting) ─────────────
    ctx.save(); ctx.globalAlpha = 0.75;
    for (let i=0; i<3; i++) {
        const a  = t * 0.8 + i * 2.094;
        const nx = Math.cos(a) * 15;
        const ny = Math.sin(a) * 10 - 18;
        const nc = i % 2 === 0 ? MN : MD;
        pUnit(ctx,cx,cy, nx,   idleY+ny,   nc, 3, 2, isLeft, S); // note head
        pUnit(ctx,cx,cy, nx+2, idleY+ny-5, nc, 1, 5, isLeft, S); // note stem
    }
    ctx.restore();
    // ── Attack: large golden lighter burst ────────────────────
    if (isAtk) {
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,  0, idleY-12, GD, 36, 34, isLeft, S);
        ctx.restore();
    }
}

function drawLitanyChanter(ctx, tower, cx, cy, isLeft) {
    const S = 2.0;
    const p = (ox,oy,c,w,h) => pUnit(ctx,cx,cy,ox,oy,c,w,h,isLeft,S);
    const now = performance.now();
    const idleY = Math.sin(now * 0.002) * 2;
    const isAtk = (now - tower.lastShot) < 350;
    const CO='#1A0A3A', DV='#2A1A5A', LV='#4A2A7A';
    const GD='#FFD700', GL='#FFEE88', GS='#AA7700';
    const SK='#E8B890', BS='#C89868';
    const BK='#8B6014', BL='#D4A030', BP='#FFF8DC';
    // ── Hem / lower vestment ──────────────────────────────────
    p(-5, idleY+ 4, CO, 10,  6);
    p(-4, idleY+ 5, DV,  8,  4);
    p(-6, idleY+ 2, LV, 12,  2);         // stole hem
    // ── Torso — elaborate liturgical vestments ─────────────────
    p(-5, idleY-14, CO, 10, 18);
    p(-4, idleY-13, DV,  8, 16);
    p(-3, idleY-12, LV,  6, 14);
    p(-1, idleY-12, GD,  2, 10);         // gold cross vertical bar
    p(-4, idleY- 8, GD,  8,  2);         // gold cross horizontal bar
    p(-3, idleY-12, GL,  1,  4);         // cross arm glow L
    p( 2, idleY-12, GL,  1,  4);         // cross arm glow R
    p(-5, idleY-14, GS,  1, 18);         // left edge trim
    p( 4, idleY-14, GS,  1, 18);         // right edge trim
    p(-4, idleY+ 4, GD,  8,  1);         // bottom hem gold
    // ── Arms holding open prayer book ─────────────────────────
    p(-8, idleY-14, CO,  3,  6);  p(-7, idleY-13, DV, 2, 5); // left arm
    p(-9, idleY- 9, SK,  2,  2);                              // left hand
    p( 5, idleY-14, CO,  3,  6);  p( 5, idleY-13, DV, 2, 5); // right arm
    p( 7, idleY- 9, SK,  2,  2);                              // right hand
    // ── Gilded prayer book (open in front) ───────────────────
    p(-5, idleY- 9, CO, 10,  7);         // book outline
    p(-4, idleY- 8, BK,  8,  6);         // leather cover
    p(-4, idleY- 8, BL,  4,  6);         // left page open
    p( 0, idleY- 8, BL,  4,  6);         // right page open
    p(-1, idleY- 8, CO,  2,  6);         // spine crease
    p(-4, idleY- 8, GD,  1,  6);         // left gilt edge
    p( 3, idleY- 8, GD,  1,  6);         // right gilt edge
    p(-4, idleY- 2, GD,  8,  1);         // bottom gilt
    p(-3, idleY- 6, CO,  3,  1);  p( 1, idleY- 6, CO, 2, 1); // text line 1
    p(-3, idleY- 4, CO,  2,  1);  p( 1, idleY- 4, CO, 3, 1); // text line 2
    // ── Rosary beads hanging from left wrist ─────────────────
    for (let i=0; i<4; i++) p(-10, idleY-8+i*2, DV, 1, 1);
    // ── Neck ──────────────────────────────────────────────────
    p(-2, idleY-16, CO,  4,  3);
    p(-1, idleY-15, SK,  2,  2);
    // ── Head — solemn formal face ──────────────────────────────
    p(-5, idleY-28, CO, 10, 12);
    p(-4, idleY-27, SK,  8, 10);
    p(-3, idleY-25, CO,  2,  1);  // left eye (downcast)
    p( 1, idleY-25, CO,  2,  1);  // right eye
    p(-3, idleY-27, CO,  3,  1);  p(1, idleY-27, CO, 2, 1); // brows
    p( 0, idleY-23, CO,  1,  2);         // nose prominent
    p(-2, idleY-21, CO,  4,  1);         // firm mouth
    p(-3, idleY-24, BS,  2,  1);  p(2, idleY-24, BS, 2, 1); // cheek shadow
    // ── Ornate mitre (bishop tall hat) ────────────────────────
    p(-4, idleY-30, CO,  8,  2);         // band base
    p(-3, idleY-28, GD,  6,  1);         // gold headband
    p(-4, idleY-32, DV,  8,  6);         // mitre lower body
    p(-3, idleY-31, LV,  6,  4);         // lower highlight
    p(-3, idleY-38, DV,  6, 10);         // mitre tall upper
    p(-2, idleY-37, LV,  4,  8);         // upper highlight
    p(-1, idleY-37, GD,  2,  8);         // cross vertical on mitre
    p(-3, idleY-33, GD,  6,  2);         // cross horizontal
    p(-5, idleY-30, GD,  2,  6);         // left lappet
    p( 3, idleY-30, GD,  2,  6);         // right lappet
    // ── Attack: gold lighter bloom around prayer book ──────────
    if (isAtk) {
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,  0, idleY- 6, GD, 22, 20, isLeft, S);
        ctx.restore();
    }
}

function drawRelicGuardian(ctx, tower, cx, cy, isLeft) {
    const S = 2.0;
    const p = (ox,oy,c,w,h) => pUnit(ctx,cx,cy,ox,oy,c,w,h,isLeft,S);
    const now   = performance.now();
    const idleY = Math.sin(now * 0.002) * 2;
    const isAtk = (now - tower.lastShot) < 350;
    const ep    = (Math.sin(now * 0.003) + 1) * 0.5;
    const t     = now * 0.001;
    const CO='#050308', IV='#F4ECCD', IH='#FFF8E0', IS='#C8B888';
    const PR='#4A1F7A', PL='#8A4DC0';
    const GD='#FFD700', GL='#FFF8B8', GS='#B88820', WG='#FFE898';
    const RU='#D81030', RL='#FF6080';
    const SK='#E8C098';

    // ── grand halo behind head (3-layer radiance)
    ctx.save(); ctx.globalAlpha = 0.32 + ep * 0.30; ctx.globalCompositeOperation = 'lighter';
    pUnit(ctx,cx,cy, -12, idleY-32, GD, 24, 16, isLeft, S);
    pUnit(ctx,cx,cy,  -9, idleY-31, GL, 18, 13, isLeft, S);
    pUnit(ctx,cx,cy,  -6, idleY-30, WG, 12,  9, isLeft, S);
    ctx.restore();
    // halo ring spokes (8 gold motes around head)
    for (let i = 0; i < 8; i++) {
        const a  = i * (Math.PI / 4);
        const rx = Math.cos(a) * 10;
        const ry = Math.sin(a) *  7 - 26;
        ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
        pUnit(ctx,cx,cy, rx, idleY+ry, GD, 2, 2, isLeft, S);
        pUnit(ctx,cx,cy, rx, idleY+ry, GL, 1, 1, isLeft, S);
        ctx.restore();
    }

    // ── floor sigil — gold cross
    ctx.save(); ctx.globalAlpha = 0.22 + ep * 0.18; ctx.globalCompositeOperation = 'lighter';
    pUnit(ctx,cx,cy, -8, idleY+10, GD, 16,  2, isLeft, S);
    pUnit(ctx,cx,cy, -1, idleY+ 7, GL,  2,  8, isLeft, S);
    ctx.restore();

    // ── folded gold wings behind body
    p(-10, idleY-18, CO,  4, 16);
    p( -9, idleY-17, GS,  3, 14);
    p( -9, idleY-17, GD,  2, 12);
    p( -9, idleY-15, GL,  1,  8);
    p(-10, idleY- 4, CO,  4,  4);
    p( -9, idleY- 3, GD,  3,  2);
    p(  6, idleY-18, CO,  4, 16);
    p(  6, idleY-17, GS,  3, 14);
    p(  6, idleY-17, GD,  2, 12);
    p(  7, idleY-15, GL,  1,  8);
    p(  6, idleY- 4, CO,  4,  4);
    p(  6, idleY- 3, GD,  3,  2);
    p(-10, idleY-14, CO, 1, 1); p(-10, idleY-10, CO, 1, 1); p(-10, idleY- 6, CO, 1, 1);
    p(  9, idleY-14, CO, 1, 1); p(  9, idleY-10, CO, 1, 1); p(  9, idleY- 6, CO, 1, 1);

    // ── lower robe (long, gold-hemmed)
    p(-5, idleY+ 4, CO, 10,  6);
    p(-4, idleY+ 5, IV,  8,  4);
    p(-3, idleY+ 5, IH,  6,  3);
    p(-6, idleY+ 8, CO, 12,  2);
    p(-5, idleY+ 9, GD, 10,  1);

    // ── torso — white sacred robe with royal purple diagonal sash
    p(-5, idleY-14, CO, 10, 18);
    p(-4, idleY-13, IV,  8, 16);
    p(-3, idleY-12, IH,  6, 14);
    p(-5, idleY-14, GD,  1, 18);
    p( 4, idleY-14, GD,  1, 18);
    // diagonal purple sash
    p(-4, idleY-13, PR, 2, 1);
    p(-3, idleY-11, PR, 2, 1);
    p(-2, idleY- 9, PR, 2, 1);
    p(-1, idleY- 7, PR, 2, 1);
    p( 0, idleY- 5, PR, 2, 1);
    p( 1, idleY- 3, PR, 2, 1);
    p(-3, idleY-11, PL, 1, 1);
    p( 0, idleY- 5, PL, 1, 1);
    // ornate gold belt buckle
    p(-2, idleY- 2, CO,  4,  3);
    p(-1, idleY- 1, GD,  2,  1);

    // ── neck
    p(-2, idleY-16, CO,  4,  3);
    p(-1, idleY-15, SK,  2,  2);

    // ── arm uppers (forearms drawn after monstrance for gripping look)
    p(-7, idleY-14, CO,  3,  6); p(-6, idleY-13, IV,  2,  5);
    p( 4, idleY-14, CO,  3,  6); p( 4, idleY-13, IV,  2,  5);

    // ── sacred monstrance — sunburst rays around central ruby disk
    // outer ray outlines (cardinals + diagonals)
    p(-2, idleY-15, CO,  6,  2);   // N ray
    p(-2, idleY- 3, CO,  6,  2);   // S ray
    p(-7, idleY- 9, CO,  3,  2);   // W ray
    p( 4, idleY- 9, CO,  3,  2);   // E ray
    p(-5, idleY-13, CO,  3,  3);   // NW
    p( 2, idleY-13, CO,  3,  3);   // NE
    p(-5, idleY- 5, CO,  3,  3);   // SW
    p( 2, idleY- 5, CO,  3,  3);   // SE
    // gold ray fills
    p(-1, idleY-14, GD,  4,  1);
    p(-1, idleY- 2, GD,  4,  1);
    p(-6, idleY- 8, GD,  2,  1);
    p( 4, idleY- 8, GD,  2,  1);
    p(-4, idleY-12, GD,  2,  2);
    p( 3, idleY-12, GD,  2,  2);
    p(-4, idleY- 4, GD,  2,  2);
    p( 3, idleY- 4, GD,  2,  2);
    // central gold disk
    p(-3, idleY-11, CO,  6,  6);
    p(-2, idleY-10, GS,  4,  4);
    p(-2, idleY-10, GD,  4,  3);
    p(-2, idleY-10, GL,  3,  1);                 // top highlight
    // ruby gem center
    p(-1, idleY- 9, CO,  2,  2);
    p(-1, idleY- 9, RU,  2,  1);
    p(-1, idleY- 9, RL,  1,  1);
    // soft inner radiance
    ctx.save(); ctx.globalAlpha = 0.32 + ep * 0.35; ctx.globalCompositeOperation = 'lighter';
    pUnit(ctx,cx,cy, -5, idleY-12, WG, 12, 12, isLeft, S);
    ctx.restore();

    // ── forearms + hands gripping monstrance edges
    p(-5, idleY-12, CO,  3,  6); p(-4, idleY-11, IV,  2,  5);
    p(-5, idleY- 8, SK,  2,  2);
    p( 3, idleY-12, CO,  3,  6); p( 3, idleY-11, IV,  2,  5);
    p( 3, idleY- 8, SK,  2,  2);

    // ── head — uncovered, holy-blond crowned
    p(-4, idleY-30, CO,  8, 12);
    p(-3, idleY-29, SK,  6, 10);
    // gold-blond hair frame
    p(-4, idleY-30, GS,  8,  2);
    p(-4, idleY-29, WG,  8,  1);
    p(-5, idleY-28, CO,  1,  6);
    p( 4, idleY-28, CO,  1,  6);
    // facial features — serene resolve
    p(-3, idleY-27, CO,  2,  1); p( 1, idleY-27, CO, 2, 1);   // brows
    p(-2, idleY-25, CO,  2,  1); p( 1, idleY-25, CO, 2, 1);   // eyes
    p(-2, idleY-25, GL,  1,  1);                               // L eye glint
    p(-1, idleY-23, IS,  1,  1);                               // nose
    p(-1, idleY-21, CO,  2,  1);                               // mouth

    // ── crown of light (5 gold spikes + ruby centerpiece)
    p(-4, idleY-33, CO,  8,  3);                               // crown base
    p(-3, idleY-32, GS,  6,  2);
    p(-3, idleY-32, GD,  6,  1);
    p(-4, idleY-35, CO,  2,  2); p(-4, idleY-35, GD, 1, 2);    // outer L spike
    p(-2, idleY-36, CO,  2,  3); p(-2, idleY-36, GD, 1, 3);    // mid L spike
    p( 0, idleY-36, CO,  2,  4); p( 0, idleY-36, GD, 1, 3); p(0, idleY-36, GL, 1, 1); // center
    p( 2, idleY-36, CO,  2,  3); p( 2, idleY-36, GD, 1, 3);    // mid R spike
    p( 3, idleY-35, CO,  2,  2); p( 3, idleY-35, GD, 1, 2);    // outer R spike
    // crown frontal gem
    p(-1, idleY-32, CO,  2,  2); p(-1, idleY-32, RU, 1, 1); p(0, idleY-32, RL, 1, 1);

    // ── 4 orbiting holy relic motes
    const ap = isAtk ? 0.98 : 0.75;
    for (let i = 0; i < 4; i++) {
        const a  = t * 0.6 + i * (Math.PI / 2);
        const rx = Math.cos(a) * 17;
        const ry = Math.sin(a) *  9 - 12;
        ctx.save(); ctx.globalAlpha = ap;
        pUnit(ctx,cx,cy, rx, idleY+ry, CO, 3, 3, isLeft, S);
        pUnit(ctx,cx,cy, rx, idleY+ry, GD, 2, 2, isLeft, S);
        pUnit(ctx,cx,cy, rx, idleY+ry, WG, 1, 1, isLeft, S);
        ctx.restore();
    }

    // ── attack: huge radial gold burst + ruby flash + rising sparks
    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.80; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy, -12, idleY-10, GD, 28, 24, isLeft, S);
        pUnit(ctx,cx,cy,  -6, idleY- 9, WG, 14, 12, isLeft, S);
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.95;
        pUnit(ctx,cx,cy, -1, idleY- 9, RL,  3,  3, isLeft, S);
        const ft = (now % 600) / 600;
        pUnit(ctx,cx,cy, -4, idleY-20 - ft*12, GD,  2,  2, isLeft, S);
        pUnit(ctx,cx,cy,  2, idleY-22 - ft*10, GL,  2,  2, isLeft, S);
        pUnit(ctx,cx,cy,  4, idleY-18 - ft*14, WG,  1,  1, isLeft, S);
        pUnit(ctx,cx,cy, -3, idleY-16 - ft* 8, GL,  1,  1, isLeft, S);
        ctx.restore();
    }
}

function drawRuneCrafter(ctx, tower, cx, cy, isLeft) {
    const S = 2.0;
    const p = (ox,oy,c,w,h) => pUnit(ctx,cx,cy,ox,oy,c,w,h,isLeft,S);
    const now = performance.now();
    const idleY = Math.sin(now * 0.002) * 2;
    const isAtk = (now - tower.lastShot) < 350;
    const t = now * 0.001;
    const CO='#0C1A3A', DK='#1A2A5A', MD='#2A3A7A', LT='#3A4A8A';
    const RC='#44EEFF', SG='#556677', SL='#778899';
    const CH='#AABBCC', SK='#FFCCAA', SP='#887766';
    // ── Lower robe ────────────────────────────────────────────
    p(-4, idleY+ 4, CO,  8,  6);
    p(-3, idleY+ 5, DK,  6,  4);
    p(-5, idleY+ 2, MD, 10,  2);         // robe hem band
    // ── Torso — midnight-blue hooded robe ─────────────────────
    p(-5, idleY-14, CO, 10, 18);
    p(-4, idleY-13, DK,  8, 16);
    p(-3, idleY-12, MD,  6, 14);
    p(-2, idleY-11, LT,  4, 12);
    p(-3, idleY-10, RC,  1,  2);         // rune stitch L
    p( 2, idleY-10, RC,  1,  2);         // rune stitch R
    p(-1, idleY-12, RC,  2,  1);         // rune stitch center
    // ── Left arm holding rune chisel ──────────────────────────
    p(-8, idleY-16, CO,  3,  9);  p(-7, idleY-15, DK, 2, 8);
    p(-9, idleY- 8, SK,  2,  3);         // calloused hand
    // ── Right arm holding rune stone slab ─────────────────────
    p( 5, idleY-18, CO,  3, 11);  p( 5, idleY-17, MD, 2, 10);
    p( 7, idleY- 8, SK,  2,  3);         // hand
    // ── Rune chisel (in left hand) ────────────────────────────
    p(-10, idleY-26, CO,  3, 20);        // shaft outline
    p( -9, idleY-26, CH,  2, 20);        // shaft metal
    p(-11, idleY-16, CO,  5,  4);        // handle guard
    p(-10, idleY-15, CH,  4,  2);        // guard highlight
    p(-10, idleY-26, CO,  3,  4);        // chisel tip area
    p( -9, idleY-26, RC,  1,  2);        // tip rune glow
    // ── Glowing rune stone slab (right hand) ──────────────────
    p( 5, idleY-26, CO,  8,  8);         // slab outline
    p( 6, idleY-25, SG,  6,  6);         // stone grey
    p( 7, idleY-24, SL,  4,  4);         // stone highlight
    p( 6, idleY-24, RC,  2,  1);         // carved rune H-bar
    p( 7, idleY-25, RC,  1,  3);         // carved rune V-bar
    p( 8, idleY-24, RC,  2,  1);         // rune end mark
    ctx.save(); ctx.globalAlpha = 0.38;
    pUnit(ctx,cx,cy,  9, idleY-23, RC, 10,  8, isLeft, S); // slab glow aura
    ctx.restore();
    // ── Neck ──────────────────────────────────────────────────
    p(-2, idleY-16, CO,  4,  3);
    p(-1, idleY-15, SK,  2,  2);
    // ── Head — focused scholar with spectacles ────────────────
    p(-5, idleY-28, CO, 10, 12);
    p(-4, idleY-27, SK,  8, 10);
    p(-3, idleY-26, SP,  3,  2);         // left spectacle lens frame
    p( 0, idleY-25, SP,  1,  1);         // nose bridge
    p( 1, idleY-26, SP,  3,  2);         // right spectacle lens frame
    p(-2, idleY-25, CO,  2,  1);  // left eye (inside lens)
    p( 2, idleY-25, CO,  2,  1);  // right eye (inside lens)
    p(-3, idleY-27, CO,  3,  1);  p(1, idleY-27, CO, 2, 1); // brows
    p(-1, idleY-23, CO,  1,  1);         // nose
    p(-1, idleY-21, CO,  2,  1);         // mouth
    // ── Hood drawn back, draping behind head ──────────────────
    p(-5, idleY-30, CO, 10,  4);         // hood band
    p(-4, idleY-29, DK,  8,  2);         // band highlight
    p(-6, idleY-30, CO,  3, 10);         // left cowl drape
    p( 3, idleY-30, CO,  3, 10);         // right cowl drape
    p(-5, idleY-29, DK,  2,  8);         // left cowl highlight
    p( 4, idleY-29, DK,  2,  8);         // right cowl highlight
    // ── 4 orbiting rune symbols ───────────────────────────────
    const ap = isAtk ? 0.95 : 0.55;
    for (let i=0; i<4; i++) {
        const a  = t * 0.7 + i * Math.PI * 0.5;
        const rx = Math.cos(a) * 16;
        const ry = Math.sin(a) * 10 - 14;
        ctx.save(); ctx.globalAlpha = ap;
        pUnit(ctx,cx,cy, rx,   idleY+ry,   RC,  3,  3, isLeft, S);
        pUnit(ctx,cx,cy, rx+1, idleY+ry+1, DK,  1,  1, isLeft, S);
        ctx.restore();
    }
    // ── Attack: rune symbols flash + cyan lighter burst ───────
    if (isAtk) {
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,  0, idleY-12, RC, 30, 26, isLeft, S);
        ctx.restore();
    }
}

function drawBarrierMaster(ctx, tower, cx, cy, isLeft) {
    const S = 2.0;
    const p = (ox,oy,c,w,h) => pUnit(ctx,cx,cy,ox,oy,c,w,h,isLeft,S);
    const now = performance.now();
    const idleY = Math.sin(now * 0.002) * 2;
    const isAtk = (now - tower.lastShot) < 350;
    const CO='#000000', NV='#0A1A4A', MB='#1A3080', LB='#2244AA';
    const BB='#4488DD', SB='#88CCFF', GD='#FFD700', GL='#FFE890', SK='#FFCCAA';
    // Aura: soft barrier field glow underfoot
    ctx.save(); ctx.globalAlpha = 0.18 + Math.sin(now * 0.002) * 0.07;
    pUnit(ctx, cx, cy, 0, idleY + 8, SB, 16, 5, isLeft, S); ctx.restore();
    // Lower body: heavy ceremonial coat
    p(-7, idleY+2,  CO, 14, 12);  p(-6, idleY+3,  NV, 12, 10);
    p(-5, idleY+4,  MB,  9,  8);  p(-4, idleY+5,  LB,  6,  6);
    p(-6, idleY+12, CO, 13,  3);  p(-5, idleY+13, GD, 11,  2);
    p(-4, idleY+14, GL,  9,  1);
    // Upper torso coat
    p(-6, idleY-14, CO, 13, 17);  p(-5, idleY-13, NV, 11, 15);
    p(-4, idleY-12, MB,  8, 13);  p(-3, idleY-11, LB,  5, 10);
    // Gold starburst chest emblem
    p(-4, idleY-10, CO,  8,  7);  p(-3, idleY-9,  GD,  6,  5);
    p(-2, idleY-8,  GL,  4,  3);  p(-1, idleY-7,  '#FFFFFF', 2, 2);
    // Gold trim collar
    p(-6, idleY-15, CO, 13,  3);  p(-5, idleY-14, GD, 11,  2);
    // Navy helm with gold celestial motif crest, face exposed
    p(-7, idleY-30, CO, 15, 15);  p(-6, idleY-29, SK, 13, 13);
    p(-7, idleY-30, NV, 15,  5);  p(-6, idleY-29, MB, 13,  4);
    p(-8, idleY-32, CO, 16,  4);  p(-7, idleY-31, MB, 14,  3);
    p(-8, idleY-33, GD, 16,  2);
    p(-3, idleY-35, CO,  6,  5);  p(-2, idleY-34, GD,  4,  4);
    p(-1, idleY-35, GL,  2,  2);
    // Eyes + mouth
    p(-5, idleY-24, CO,  3,  2);  p( 2, idleY-24, CO,  3,  2);
    p(-2, idleY-21, NV,  5,  1);
    // Both arms raised, channeling barrier
    p(-11, idleY-18, CO,  5, 15);  p(-10, idleY-17, NV,  4, 13);
    p(-13, idleY-24, CO,  5,  7);  p(-12, idleY-23, SK,  4,  6);
    p(  7, idleY-18, CO,  5, 15);  p(  8, idleY-17, NV,  4, 13);
    p(  9, idleY-24, CO,  5,  7);  p( 10, idleY-23, SK,  4,  6);
    // Multi-layered radiant shield barrier (3 translucent rects stacked)
    const sx = isLeft ? 15 : -17;
    p(sx,   idleY-20, CO, 13, 26);
    p(sx+1, idleY-19, NV, 11, 24);
    p(sx+2, idleY-18, MB,  9, 22);
    ctx.save(); ctx.globalAlpha = 0.5;
    pUnit(ctx, cx, cy, sx+2, idleY-18, BB,  9, 22, isLeft, S); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.35;
    pUnit(ctx, cx, cy, sx+3, idleY-15, SB,  7, 17, isLeft, S); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.18;
    pUnit(ctx, cx, cy, sx+4, idleY-12, '#CCDDFF', 5, 12, isLeft, S); ctx.restore();
    p(sx+4, idleY-14, CO,  5,  5);  p(sx+5, idleY-13, BB,  3,  4);
    // Attack: barrier hex flashes, screen blue burst forward
    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.65; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx, cx, cy, sx, idleY - 8, SB, 30, 34, isLeft, S); ctx.restore();
    }
}

function drawDivineBarrier(ctx, tower, cx, cy, isLeft) {
    const S = 2.0;
    const p = (ox,oy,c,w,h) => pUnit(ctx,cx,cy,ox,oy,c,w,h,isLeft,S);
    const now = performance.now();
    const idleY = Math.sin(now * 0.002) * 2;
    const isAtk = (now - tower.lastShot) < 350;
    const CO='#000000', WA='#E8EEF8', WH='#F8FCFF', GD='#FFD700', GL='#FFE890';
    const AZ='#88BBFF', SK='#FFDDBB';
    // Aura: divine light pour (lighter blend)
    ctx.save(); ctx.globalAlpha = 0.15 + Math.sin(now * 0.002) * 0.05;
    ctx.globalCompositeOperation = 'lighter';
    pUnit(ctx, cx, cy, 0, idleY - 2, GL, 28, 32, isLeft, S); ctx.restore();
    // Lower body: white-gold plate greaves
    p(-6, idleY+2,  CO, 13, 12);  p(-5, idleY+3,  WA, 11, 10);
    p(-4, idleY+4,  WH,  8,  8);
    p(-6, idleY+12, CO, 13,  3);  p(-5, idleY+13, GD, 11,  2);
    // Upper torso chest plate
    p(-6, idleY-14, CO, 13, 17);  p(-5, idleY-13, WA, 11, 15);
    p(-4, idleY-12, WH,  8, 13);
    p(-5, idleY-10, GD, 11,  3);  p(-4, idleY-9,  GL,  9,  2);
    // Pauldrons (shoulder guards)
    p(-9, idleY-14, CO,  4,  6);  p(-8, idleY-13, WA,  3,  5);
    p( 6, idleY-14, CO,  4,  6);  p( 7, idleY-13, WA,  3,  5);
    // Shield-holding arm (front side)
    const sa = isLeft ? 6 : -9;
    p(sa,   idleY-12, CO,  5, 13);  p(sa+1, idleY-11, WA,  4, 11);
    p(sa,   idleY-1,  CO,  5,  7);  p(sa+1, idleY,    SK,  4,  6);
    // Other arm at side
    const sa2 = isLeft ? -9 : 6;
    p(sa2,   idleY-12, CO,  5, 10);  p(sa2+1, idleY-11, WA,  4,  8);
    // Head: divine white helm
    p(-7, idleY-30, CO, 15, 15);  p(-6, idleY-29, SK, 13, 13);
    p(-7, idleY-30, WA, 15,  5);  p(-6, idleY-29, WH, 13,  4);
    p(-8, idleY-32, CO, 16,  3);  p(-7, idleY-31, GD, 14,  2);
    // Crown of 3 golden sun-ray spires
    p(-5, idleY-37, CO,  3,  7);  p(-4, idleY-36, GD,  2,  6);
    p(-1, idleY-40, CO,  3, 10);  p( 0, idleY-39, GL,  2,  9);
    p( 3, idleY-37, CO,  3,  7);  p( 4, idleY-36, GD,  2,  6);
    // Eyes
    p(-5, idleY-24, CO,  3,  2);  p( 2, idleY-24, CO,  3,  2);
    // Massive divine tower shield (taller than unit)
    const shx = isLeft ? 14 : -18;
    p(shx,   idleY-38, CO, 14, 52);
    p(shx+1, idleY-37, WA, 12, 50);
    p(shx+2, idleY-36, WH, 10, 48);
    p(shx+4, idleY-22, CO,  3, 20);  p(shx+5, idleY-21, GD,  1, 18);
    p(shx+1, idleY-30, CO, 12,  3);  p(shx+2, idleY-29, GD, 10,  2);
    p(shx+1, idleY-37, AZ, 12,  4);  p(shx+1, idleY+11, AZ, 12,  4);
    ctx.save(); ctx.globalAlpha = 0.3; ctx.globalCompositeOperation = 'lighter';
    pUnit(ctx, cx, cy, shx+3, idleY-18, GL, 8, 22, isLeft, S); ctx.restore();
    // Attack: shield glows fully, lighter burst radiates outward to both sides
    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.7; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx, cx, cy, 0, idleY - 6, GL, 56, 48, isLeft, S); ctx.restore();
    }
}

window.drawPsalmSinger   = drawPsalmSinger;
window.drawLitanyChanter = drawLitanyChanter;
window.drawRelicGuardian = drawRelicGuardian;
window.drawRuneCrafter   = drawRuneCrafter;
window.drawBarrierMaster = drawBarrierMaster;
window.drawDivineBarrier = drawDivineBarrier;
