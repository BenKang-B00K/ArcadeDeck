/* pix_tier3_attack.js – Tier 3 Exorcists: ATTACK Path
 * Paladin · Crusader · HellfireAlchemist · PhoenixSummoner · VoidSniper · ThousandHand
 */

/* ══════════════════════════════════════════════════════════ drawPaladin ═══ */
function drawPaladin(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep        = (Math.sin(now * 0.004) + 1) / 2;
    const macePulse = (Math.sin(now * 0.005) + 1) / 2;
    const plumF     = Math.sin(now * 0.005) * 1.5;
    const CO='#000000';
    const PS='#7A6015', PM='#B8860B', PB='#D4A820', PL='#F5C842', PH='#FFFFF0';
    const CS='#7A0010', CM='#B00020', CR='#D32F2F', CL='#EF5350';
    const WS='#D0C898', WB='#F0EAD0', WH='#FFFDE7', SK='#F0D0A0';
    const GH='#5D4010', CB='#00E5FF';

    // ── holy aura
    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.20;
    pUnit(ctx,cx,cy,-22,-42+idleY,PB,44,76,isLeft,S);
    ctx.restore();

    // ── KITE SHIELD (off-hand, gold-rim w/ glowing crimson cross)
    p( 9,-10,CO,13,32); p(10,-9,PS,11,30); p(11,-8,PM,9,28); p(13,-5,PL,4,22);
    p(10,-9,PH,11,1);                                                             // top highlight
    p( 9,-10,GH,1,32); p(21,-10,GH,1,32);                                         // dark side rims
    p( 9,-10,PB,13,2); p( 9,20,PB,13,2);                                          // gold top/bottom rims
    // Glowing crimson cross
    p(13,-5,CO,5,22); p(14,-4,CM,3,20); p(14,-4,CR,3,1);
    p(10,2,CO,11,4); p(11,3,CM,9,2); p(11,3,CR,9,1);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.40;
    pUnit(ctx,cx,cy,13,-5+idleY,CL,5,22,isLeft,S);
    pUnit(ctx,cx,cy,10,2+idleY,CL,11,4,isLeft,S);
    ctx.restore();
    // Shield corner studs
    p(10,-9,CO,1,1); p(20,-9,CO,1,1); p(10,19,CO,1,1); p(20,19,CO,1,1);

    // ── MASSIVE HOLY MACE (taller staff, multi-flange head)
    p( 8,-54,CO,5,46); p( 9,-53,GH,3,44); p( 9,-50,PM,2,38);                      // shaft
    p( 8,-44,PB,5,1); p( 8,-32,PB,5,1); p( 8,-20,PB,5,1); p( 8,-8,PB,5,1);        // gold bands
    // Mace head (multi-layered)
    p( 5,-62,CO,14,14); p( 6,-61,PM,12,12); p( 7,-60,PB,10,10); p( 8,-59,PL,8,8);
    p( 6,-61,PH,12,1);                                                            // top highlight
    p( 9,-58,PH,6,6);                                                             // bright center
    // 4 flange spikes
    p( 4,-58,CO,3,3); p(5,-57,PB,1,1);
    p(18,-58,CO,3,3); p(19,-57,PB,1,1);
    p(10,-66,CO,3,4); p(11,-65,PB,1,3);
    p(10,-48,CO,3,4); p(11,-47,PB,1,3);
    // Spiked crown (3 spikes)
    p( 6,-66,CO,3,6); p( 7,-65,PL,2,4); p( 7,-67,PH,2,2);
    p(10,-69,CO,4,7); p(11,-68,PL,2,5); p(11,-71,PH,2,3);
    p(14,-66,CO,3,6); p(15,-65,PL,2,4); p(15,-67,PH,2,2);
    ctx.save(); ctx.globalAlpha = 0.55 + macePulse * 0.40;
    pUnit(ctx,cx,cy, 8,-59+idleY,PL,8,8,isLeft,S);
    ctx.restore();
    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.78; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy, 4,-64+idleY,'#FFFFFF',18,18,isLeft,S);
        ctx.restore();
    }

    // ── BOOTS (gold sabatons)
    p(-7,14,CO,7,9); p(-6,15,PS,5,8); p(-4,16,PM,3,6);
    p( 1,14,CO,6,9); p( 2,15,PS,5,8); p( 3,16,PM,3,6);
    p(-7,14,PB,7,1); p( 1,14,PB,6,1);

    // ── GREAVES (split ivory + crimson surcoat center, top-highlighted)
    p(-8,2,CO,7,13); p(-7,3,WS,5,12); p(-6,4,WB,3,10); p(-7,3,WH,5,1);
    p( 2,2,CO,7,13); p( 3,3,WS,5,12); p( 4,4,WB,3,10); p( 3,3,WH,5,1);
    p(-5,2,CO,10,13); p(-4,3,CM,8,11); p(-3,4,CR,6,9); p(-4,3,CL,8,1);
    p(-1,4,PB,2,9); p(-4,9,PB,8,2);

    // ── CHEST (top-highlighted, glowing cross emblem, rivets)
    p(-7,-14,CO,15,17); p(-6,-13,WS,13,15); p(-5,-12,WB,10,12); p(-4,-11,WH,7,10);
    p(-6,-13,'#FFFFFF',13,1);                                                     // top highlight
    p(-1,-13,CO,3,12); p(0,-12,PB,1,10); p(0,-12,PL,1,10);                        // central rod gold
    p(-1,-13,CR,3,1);                                                             // top crimson
    // Bold sacred cross
    p(-2,-12,CO,4,11); p(-1,-11,CR,2,9); p(-1,-11,CL,2,1);
    p(-5,-8,CO,11,4); p(-4,-7,CR,9,2); p(-4,-7,CL,9,1);
    ctx.save(); ctx.globalAlpha = 0.50 + ep * 0.35;
    pUnit(ctx,cx,cy,-2,-12+idleY,CL,4,11,isLeft,S);
    pUnit(ctx,cx,cy,-5,-8+idleY,CL,11,4,isLeft,S);
    ctx.restore();
    for (let r=0; r<3; r++) { p(-6,-9+r*5,PB,1,1); p(5,-9+r*5,PB,1,1); }          // gold rivets

    // ── PAULDRONS (gold w/ top highlight)
    p(-13,-13,CO,8,9); p(-12,-12,PM,6,8); p(-11,-11,PL,4,7); p(-12,-12,PH,6,1);
    p( 6,-13,CO,8,9); p( 7,-12,PM,6,8); p( 8,-11,PL,4,7); p( 7,-12,PH,6,1);

    // ── ARMS + GAUNTLETS
    p(-11,-10,CO,5,12); p(-10,-9,WS,4,10); p(-10,-9,WH,4,1);
    p(-11,-17,CO,5,8); p(-10,-16,SK,4,6);
    p( 7,-10,CO,5,12); p( 8,-9,WS,4,10); p( 8,-9,WH,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,SK,4,6);

    // ── NECK
    p(-2,-16,CO,5,3); p(-1,-15,SK,3,2);

    // ── HELM (gold w/ glowing cyan visor)
    p(-8,-30,CO,16,14); p(-7,-29,PM,14,12); p(-6,-28,PB,11,10); p(-5,-27,PL,8,8); p(-4,-26,PH,5,6);
    p(-7,-29,PH,14,1);                                                            // top highlight
    p(-5,-25,CO,11,4); p(-4,-24,CB,8,2);                                          // visor
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.30;
    pUnit(ctx,cx,cy,-4,-24+idleY,'#AAEEFF',8,2,isLeft,S);
    ctx.restore();
    p(-8,-16,PB,16,1);                                                            // gold rim
    p(-9,-26,PB,2,12); p( 7,-26,PB,2,12);                                         // side gold strips

    // ── TALL CRIMSON PLUME (flowing)
    p(-7,-37+plumF,CO,15,9); p(-6,-36+plumF,CR,13,8); p(-5,-35+plumF,CL,10,7); p(-4,-34+plumF,'#FF8A80',7,6);
    p(-5,-40+plumF,CO,11,5); p(-4,-39+plumF,CR,9,4); p(-4,-39+plumF,CL,9,1);
    p(-3,-44+plumF,CO,7,5); p(-2,-43+plumF,CL,5,4); p(-2,-43+plumF,'#FFAABB',5,1);
    p(-1,-47+plumF,CO,3,4); p(0,-46+plumF,'#FFCCDD',1,2);

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.72; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy, 6,-60+idleY,PL,22,20,isLeft,S);
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.40; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-10,-16+idleY,WH,24,40,isLeft,S);
        ctx.restore();
    }
}

/* ══════════════════════════════════════════════════════════ drawCrusader ═══ */
function drawCrusader(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.0025) * 3;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep    = (Math.sin(now * 0.005) + 1) / 2;
    const capeF = Math.sin(now * 0.004) * 2;
    const CO='#000000';
    const DS='#0D0D0D', DM='#1E1E1E', DB='#2E2E2E', DL='#444444', DH='#666666', DV='#888888';
    const BS='#4A0000', BM='#7A0000', BR='#B71C1C', BL='#EF5350', BG='#FF6E6E';
    const CS='#5A0000', CM='#8B0000', SK='#A07050';
    const GD='#FFD700', GD2='#B88000';

    // ── blood aura
    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.20;
    pUnit(ctx,cx,cy,-22,-42+idleY,BR,44,76,isLeft,S);
    ctx.restore();

    // ── SWEEPING CRIMSON CAPE (off-side, behind body)
    p(-18,-12+capeF,CO,12,40); p(-17,-11+capeF,CS,10,38); p(-16,-10+capeF,CM,8,36); p(-14,-8+capeF,BM,5,32);
    p(-17,-11+capeF,BR,10,1);                                                     // top highlight
    p(-18,-12+capeF,GD2,1,40); p(-7,-12+capeF,GD2,1,40);                          // gold cape trims
    // Tattered hem
    p(-18,28+capeF,CO,3,3); p(-13,28+capeF,CO,2,3); p(-9,28+capeF,CO,3,3);

    // ── HEAVY BOOTS (riveted)
    p(-7,14,CO,7,9); p(-6,15,DS,6,8); p(-4,16,DM,4,6);
    p( 1,14,CO,7,9); p( 2,15,DS,6,8); p( 4,16,DM,4,6);
    p(-7,14,BR,7,1); p( 1,14,BR,7,1);                                             // blood-trim
    p(-4,17,CM,2,2); p( 3,18,CM,2,1);

    // ── DARK GREAVES (rivets)
    p(-8,2,CO,16,13); p(-7,3,DS,14,11); p(-6,4,DM,11,9); p(-4,5,DB,7,7);
    p(-7,3,DH,14,1);                                                              // top highlight
    p(-2,8,BS,3,2); p(2,12,BM,2,3); p(-1,5,BR,2,2);
    for (let r=0; r<2; r++) { p(-7,7+r*4,GD2,1,1); p(6,7+r*4,GD2,1,1); }          // gold rivets

    // ── BELT (gold buckle, blood-stained)
    p(-8,-1,CO,16,4); p(-7,0,DM,14,2); p(-7,0,DV,14,1);
    p(-2,-1,CO,4,4); p(-1,0,GD2,2,2); p(-1,0,GD,2,1);                             // gold buckle
    p(-7,-1,BR,2,3); p(5,-1,BR,2,3);                                              // blood stains

    // ── CHEST PLATE (riveted, blood spatter, gold cross)
    p(-7,-14,CO,15,17); p(-6,-13,DS,13,15); p(-5,-12,DM,10,12); p(-4,-11,DB,7,10);
    p(-6,-13,DV,13,1);                                                            // top highlight
    p(-3,-8,BS,4,2); p(1,-10,BM,2,3); p(-4,-5,DH,1,4); p(2,-3,DH,1,3);
    // Battered gold cross (worn)
    p(-2,-11,CO,4,10); p(-1,-10,GD2,2,8); p(-1,-10,GD,2,1);
    p(-4,-7,CO,9,3); p(-3,-6,GD2,7,1);
    for (let r=0; r<3; r++) { p(-6,-9+r*5,GD,1,1); p(5,-9+r*5,GD,1,1); }          // rivets

    // ── HEAVY PAULDRONS (spiked, dark)
    p(-13,-14,CO,8,10); p(-12,-13,DS,6,8); p(-11,-12,DM,4,6); p(-12,-13,DV,6,1);
    p(-14,-17,CO,3,4); p(-13,-16,DH,1,3); p(-13,-16,BR,1,1);                      // L spike (blood)
    p( 6,-14,CO,8,10); p( 7,-13,DS,6,8); p( 8,-12,DM,4,6); p( 7,-13,DV,6,1);
    p(12,-17,CO,3,4); p(13,-16,DH,1,3); p(13,-16,BR,1,1);                         // R spike

    // ── ARMS + GAUNTLETS
    p(-9,-8,CO,5,14); p(-8,-7,DS,4,12); p(-8,-7,DV,4,1);
    p(-9,-17,CO,5,9); p(-8,-16,SK,4,7);
    p( 5,-8,CO,5,14); p( 6,-7,DS,4,12); p( 6,-7,DV,4,1);
    p( 5,-17,CO,5,9); p( 6,-16,SK,4,7);

    // ── MASSIVE BLOOD GREATSWORD (vertical, behind back)
    p(-3,-58,CO,7,80); p(-2,-57,DL,5,78); p(-1,-54,DM,3,72);                      // shaft
    p(-1,-50,BM,1,56);                                                            // blood groove
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.40;
    pUnit(ctx,cx,cy,-3,-58+idleY,BL,7,80,isLeft,S);
    ctx.restore();
    // Crossguard (gold + spread)
    p(-11,12,CO,23,7); p(-10,13,DL,21,5); p(-9,14,DH,17,2);
    p(-11,12,GD2,23,1); p(-11,18,GD2,23,1);                                       // gold trim
    p(-9,13,GD,3,3); p( 6,13,GD,3,3);                                             // guard ornaments
    // Hilt grip
    p(-1,14,CO,5,12); p( 0,15,CS,3,10); p( 0,15,CM,3,1);
    // Pommel (red gem)
    p(-2,24,CO,7,6); p(-1,25,DM,5,4); p(-1,25,DV,5,1);
    p( 0,26,BR,3,2); p( 1,27,BG,1,1);
    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.78; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy,-5,-62+idleY,BG,11,84,isLeft,S);
        ctx.restore();
    }

    // ── NECK
    p(-3,-16,CO,7,3); p(-2,-15,DS,5,2);

    // ── HELM (closed visor, blood-marked w/ glowing eyes)
    p(-8,-30,CO,16,14); p(-7,-29,DS,14,12); p(-6,-28,DM,12,10); p(-5,-27,DB,9,8);
    p(-7,-29,DV,14,1);                                                            // top highlight
    p(-7,-26,CO,15,5); p(-6,-25,DB,13,3);                                         // visor area
    // Blood-glowing eyes
    p(-4,-25,CO,4,3); p(-3,-24,isAtk?BG:BR,2,1);
    p( 1,-25,CO,4,3); p( 2,-24,isAtk?BG:BR,2,1);
    ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
    pUnit(ctx,cx,cy,-3,-24+idleY,BG,2,1,isLeft,S);
    pUnit(ctx,cx,cy, 2,-24+idleY,BG,2,1,isLeft,S);
    ctx.restore();
    p(-8,-16,GD2,16,1);                                                           // gold helm rim
    // Helm horns (blood-tipped)
    p(-9,-32,CO,3,5); p(-8,-31,DH,1,4); p(-8,-33,BR,1,2);
    p( 7,-32,CO,3,5); p( 8,-31,DH,1,4); p( 8,-33,BR,1,2);

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.65; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-12,12+idleY,BL,30,10,isLeft,S);
        ctx.restore();
    }
}

/* ═══════════════════════════════════════════════ drawHellfireAlchemist ═══ */
function drawHellfireAlchemist(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.003) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep     = (Math.sin(now * 0.006) + 1) / 2;
    const floatY = Math.sin(now * 0.004) * 5;
    const bombSpark = (Math.sin(now * 0.020) + 1) / 2;
    const CO='#000000';
    const RS='#0A0A0A', RM='#1A1A1A', RB='#252525', RL='#333333', RH='#555555';
    const ES='#5A1A00', EM='#8B2500', EB='#BF360C', EL='#FF3D00', EH='#FF6D00', ER='#FFA040';
    const LS='#8B4000', LB='#FF6A00', LL='#FFD600', LW='#FFFFAA';
    const GM='#424242', GB='#616161', GH='#888888';

    // ── hellfire aura
    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.22;
    pUnit(ctx,cx,cy,-22,-38+idleY,EL,44,68,isLeft,S);
    ctx.restore();

    // ── HUGE HELLFIRE BOMB CANISTER (floating off-hand, sparking fuse)
    // Iron canister body
    p(11,-12+floatY,CO,14,18); p(12,-11+floatY,RS,12,16); p(13,-10+floatY,GM,10,14);
    p(12,-11+floatY,GH,12,1);                                                     // top highlight
    p(14,-9+floatY,RB,8,12);
    // Glowing window (lava core visible)
    p(14,-7+floatY,CO,8,8); p(15,-6+floatY,EM,6,6); p(15,-6+floatY,EL,6,1);
    p(16,-5+floatY,LB,4,4); p(17,-4+floatY,LL,2,2);
    ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
    pUnit(ctx,cx,cy,15,-6+floatY+idleY,LW,6,6,isLeft,S);
    ctx.restore();
    // Riveted edges
    p(11,-12+floatY,CO,1,1); p(24,-12+floatY,CO,1,1);
    p(11, 5+floatY,CO,1,1); p(24, 5+floatY,CO,1,1);
    p(11,-3+floatY,GM,1,1); p(24,-3+floatY,GM,1,1);
    // Iron cap on top + fuse
    p(15,-15+floatY,CO,6,4); p(16,-14+floatY,GH,4,2);
    p(17,-19+floatY,CO,2,5); p(18,-18+floatY,GM,1,4);                             // fuse base
    // Sparking fuse tip
    p(17,-21+floatY,CO,3,3); p(18,-20+floatY,bombSpark > 0.5 ? LW : LL,1,1);
    ctx.save(); ctx.globalAlpha = 0.70 + bombSpark * 0.30;
    pUnit(ctx,cx,cy,17,-22+floatY+idleY,LW,3,3,isLeft,S);
    ctx.restore();
    // Leak drips below canister
    p(15, 7+floatY,EL,1,2); p(15, 9+floatY,EH,1,1);
    p(20, 7+floatY,EL,1,2); p(20, 9+floatY,EH,1,1);

    // ── LAVA POOL AT FEET
    ctx.save(); ctx.globalAlpha = 0.30 + ep * 0.20;
    pUnit(ctx,cx,cy,-7,14+idleY,EL,18,5,isLeft,S);
    ctx.restore();

    // ── BOOTS (lava-cuffed)
    p(-7,14,CO,7,9); p(-6,15,RS,5,8); p(-4,16,RM,3,6);
    p( 1,14,CO,6,9); p( 2,15,RS,5,8); p( 3,16,RM,3,6);
    p(-7,14,EL,7,1); p( 1,14,EL,6,1);                                             // glowing cuffs

    // ── INFERNAL ROBE LOWER (top-highlighted, fire-trimmed hem)
    p(-8,2,CO,16,13); p(-7,3,RS,14,11); p(-6,4,RM,11,9); p(-5,5,RB,7,7);
    p(-7,3,RH,14,1);                                                              // top highlight
    p(-7,13,CO,14,3); p(-6,13,EL,12,2); p(-5,14,EH,9,1);

    // ── BELT (orange ember w/ gold buckle)
    p(-8,0,CO,16,5); p(-7,1,LS,14,4); p(-7,1,EL,14,1);
    p(-2,0,CO,4,5); p(-1,1,LL,2,3); p(-1,1,LW,2,1);                               // glowing gem buckle

    // ── 3 ALCHEMICAL VIALS ON BELT
    p(-5,-3,CO,4,8); p(-4,-2,EM,2,6); p(-4,-2,EL,2,3);
    p(-1,-3,CO,4,8); p( 0,-2,'#1B5E20',2,6); p( 0,-2,'#00E676',2,3);
    p( 3,-3,CO,4,8); p( 4,-2,'#827717',2,6); p( 4,-2,LL,2,3);
    // Vial caps
    p(-5,-4,CO,4,1); p(-1,-4,CO,4,1); p(3,-4,CO,4,1);
    p(-4,-4,GM,2,1); p(0,-4,GM,2,1); p(4,-4,GM,2,1);
    ctx.save(); ctx.globalAlpha = 0.50 + ep * 0.30;
    pUnit(ctx,cx,cy,-4,-2+idleY,EH,2,3,isLeft,S);
    pUnit(ctx,cx,cy, 0,-2+idleY,'#88FFBB',2,3,isLeft,S);
    pUnit(ctx,cx,cy, 4,-2+idleY,LW,2,3,isLeft,S);
    ctx.restore();

    // ── CHEST (riveted, fire-tinted)
    p(-7,-14,CO,15,15); p(-6,-13,RS,13,13); p(-5,-12,RM,10,11); p(-4,-11,RB,7,9);
    p(-6,-13,RH,13,1);                                                            // top highlight
    p(-5,-10,`rgba(191,54,12,${0.20 + ep * 0.25})`,11,8);
    for (let r=0; r<3; r++) { p(-6,-10+r*4,EL,1,1); p(5,-10+r*4,EL,1,1); }        // glowing rivets

    // ── PAULDRONS (iron w/ fire-vent slits)
    p(-13,-13,CO,8,9); p(-12,-12,GM,6,8); p(-11,-11,GB,4,7); p(-12,-12,GH,6,1);
    p(-11,-9,EL,3,1); p(-11,-7,EH,3,1);                                           // fire vents L
    p( 6,-13,CO,8,9); p( 7,-12,GM,6,8); p( 8,-11,GB,4,7); p( 7,-12,GH,6,1);
    p( 8,-9,EL,3,1); p( 8,-7,EH,3,1);                                             // fire vents R

    // ── ARMS + LEATHER GAUNTLETS
    p(-11,-10,CO,5,12); p(-10,-9,RM,4,10); p(-10,-9,RH,4,1);
    p(-11,-17,CO,5,8); p(-10,-16,'#8D5524',4,6);
    p( 7,-10,CO,5,12); p( 8,-9,RM,4,10); p( 8,-9,RH,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,'#8D5524',4,6);

    // ── NECK
    p(-3,-16,CO,7,4); p(-2,-15,RS,5,3);

    // ── GAS MASK HEAD (iron mask + dual filter goggles + breathing tube)
    p(-8,-30,CO,16,14); p(-7,-29,RS,14,12); p(-6,-28,RM,12,10); p(-5,-27,RB,9,8);
    p(-7,-29,RH,14,1);                                                            // top highlight
    // Goggle housings (iron rim, glowing orange lenses)
    p(-6,-26,CO,5,5); p(-5,-25,GM,3,3); p(-5,-25,GH,3,1);
    p( 1,-26,CO,5,5); p( 2,-25,GM,3,3); p( 2,-25,GH,3,1);
    // Glowing lenses
    p(-4,-23,CO,5,4); p(-3,-22,EH,3,3); p(-2,-22,EL,2,2);
    p( 1,-23,CO,5,4); p( 2,-22,EH,3,3); p( 3,-22,EL,2,2);
    ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
    pUnit(ctx,cx,cy,-3,-22+idleY,LL,3,3,isLeft,S);
    pUnit(ctx,cx,cy, 2,-22+idleY,LL,3,3,isLeft,S);
    ctx.restore();
    // Breathing filter (mouth)
    p(-3,-19,CO,6,4); p(-2,-18,GM,4,2); p(-2,-18,GH,4,1);
    p(-1,-17,EL,2,1);
    // Side breathing tubes
    p(-9,-22,CO,2,5); p(-8,-21,GB,1,3);
    p( 7,-22,CO,2,5); p( 8,-21,GB,1,3);

    // ── IRON HOOD/CAP
    p(-7,-34,CO,14,6); p(-6,-33,RS,12,5); p(-5,-32,RM,9,4);
    p(-6,-33,RH,12,1);
    // Smoke vent on top (animated)
    p(-2,-37,CO,4,4); p(-1,-36,GB,2,3);
    ctx.save(); ctx.globalAlpha = 0.35 + ep * 0.25;
    pUnit(ctx,cx,cy,-2,-39+idleY,RH,4,4,isLeft,S);
    ctx.restore();

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.78; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,10,-14+floatY+idleY,EL,18,22,isLeft,S);
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.45; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-7,10+idleY,LB,22,10,isLeft,S);
        ctx.restore();
    }
}

/* ═════════════════════════════════════════════════ drawPhoenixSummoner ═══ */
function drawPhoenixSummoner(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep        = (Math.sin(now * 0.005) + 1) / 2;
    const firePulse = (Math.sin(now * 0.008) + 1) / 2;
    const phY       = Math.sin(now * 0.006) * 10;
    const phF       = Math.sin(now * 0.008) * 1;
    const CO='#000000';
    const RS='#5A0000', RM='#8B0000', RB='#B71C1C', RL='#D32F2F', RH='#EF5350';
    const ES='#5A1A00', EM='#8B2500', EB='#BF360C', EL='#FF3D00', EH='#FF6D00', EW='#FFCC44';
    const GS='#7A5800', GM='#B8860B', GB='#FFD700', GL='#FFE57F', GH='#FFFDE7';
    const RUB='#C62828', WH='#FFFFFF';

    // ── fire aura
    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.22;
    pUnit(ctx,cx,cy,-28,-42+idleY,EL,52,76,isLeft,S);
    ctx.restore();

    // ── PHOENIX COMPANION (off-side, large feathered, animated wings)
    // Body (red-gold gradient, larger)
    p(-22,-13+phY,CO,16,12); p(-21,-12+phY,EB,14,10); p(-20,-11+phY,EL,11,8); p(-19,-10+phY,EH,7,5);
    p(-21,-12+phY,EW,14,1);                                                       // top highlight
    // Phoenix head + beak
    p(-26,-12+phY,CO,4,5); p(-25,-11+phY,EB,2,3); p(-25,-11+phY,EL,2,1);          // head
    p(-28,-10+phY,CO,3,3); p(-27,-9+phY,GB,1,1);                                  // beak
    p(-25,-11+phY,WH,1,1);                                                        // eye
    // Tail feathers (gold tips)
    p(-8,-10+phY,CO,5,5); p(-7,-9+phY,EL,3,3); p(-7,-9+phY,GB,3,1);
    p(-6,-13+phY,CO,3,4); p(-5,-12+phY,GB,1,3);
    // Wings (outstretched, multi-layer)
    p(-26,-16+phY+phF,CO,8,4); p(-25,-15+phY+phF,EB,6,3); p(-25,-15+phY+phF,EL,6,1);
    p(-20,-18+phY+phF,CO,10,5); p(-19,-17+phY+phF,EM,8,4); p(-19,-17+phY+phF,EL,8,1);
    p(-15,-16+phY+phF,CO,10,4); p(-14,-15+phY+phF,EL,8,3); p(-14,-15+phY+phF,EW,8,1);
    // Wing tips (gold feathers)
    p(-26,-15+phY+phF,GB,1,2); p(-22,-19+phY+phF,GB,1,2); p(-12,-15+phY+phF,GB,1,2);
    // Phoenix legs (gold)
    p(-22,-1+phY,CO,3,3); p(-21,0+phY,GB,1,2);
    p(-18,-1+phY,CO,3,3); p(-17,0+phY,GB,1,2);
    // Phoenix glow trail
    ctx.save(); ctx.globalAlpha = 0.55 + firePulse * 0.35; ctx.globalCompositeOperation = 'lighter';
    pUnit(ctx,cx,cy,-26,-16+phY+idleY,EL,20,12,isLeft,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.40 + firePulse * 0.30;
    pUnit(ctx,cx,cy,-30,-10+phY+idleY,EW,10,8,isLeft,S);                          // head halo
    ctx.restore();
    // Embers trailing behind phoenix
    for (let i=0; i<3; i++) {
        const ex = -8 + i*2;
        const ey = -6 + Math.sin(now*0.012 + i)*3 + phY;
        ctx.save(); ctx.globalAlpha = 0.6 - i*0.15;
        pUnit(ctx,cx,cy,ex,ey+idleY,EW,1,1,isLeft,S);
        ctx.restore();
    }

    // ── FIREBRAND SCEPTER (taller, ornate gold w/ phoenix-head top)
    p(8,-52,CO,5,44); p(9,-51,GS,3,42); p(9,-48,GM,2,36); p(9,-44,GB,2,30);       // shaft
    p(8,-40,GB,5,1); p(8,-28,GB,5,1); p(8,-16,GB,5,1);                            // gold bands
    // Phoenix-head scepter top (multi-layered)
    p(6,-58,CO,12,12); p(7,-57,GM,10,10); p(8,-56,GB,8,8); p(9,-55,GL,5,5);
    p(7,-57,GH,10,1);                                                             // top highlight
    p(10,-54,EL,4,4); p(11,-53,EW,2,2);                                           // ember core
    // Beak (gold curve)
    p(5,-54,CO,3,3); p(6,-53,GB,1,1);
    // Eye gem (ruby)
    p(11,-56,CO,3,3); p(12,-55,RUB,1,1);
    ctx.save(); ctx.globalAlpha = 0.55 + firePulse * 0.40;
    pUnit(ctx,cx,cy,7,-57+idleY,EW,10,10,isLeft,S);
    ctx.restore();

    // ── BOOTS (ember-glow cuffs)
    p(-7,14,CO,7,9); p(-6,15,RS,5,8); p(-4,16,RM,3,6);
    p( 1,14,CO,6,9); p( 2,15,RS,5,8); p( 3,16,RM,3,6);
    p(-7,14,EL,7,1); p( 1,14,EL,6,1);

    // ── ROBE LOWER (red w/ fire hem + gold stripes)
    p(-8,2,CO,16,13); p(-7,3,RS,14,11); p(-6,4,RM,11,9); p(-5,5,RB,7,7);
    p(-7,3,RH,14,1);                                                              // top highlight
    p(-7,12,CO,14,4); p(-6,13,EL,12,3); p(-5,14,EH,9,2); p(-4,14,GB,7,1);         // fire hem
    p(-5,7,GB,1,6); p(-2,6,GB,1,7); p(1,7,GB,1,6);                                // gold stripes

    // ── BELT (gold w/ ruby buckle)
    p(-8,0,CO,16,3); p(-7,1,GM,14,2); p(-7,1,GB,14,1);
    p(-2,0,CO,4,3); p(-1,1,RUB,2,1);

    // ── CHEST (riveted, golden phoenix emblem)
    p(-7,-14,CO,15,17); p(-6,-13,RS,13,15); p(-5,-12,RM,10,12); p(-4,-11,RB,7,10); p(-3,-10,RL,4,8);
    p(-6,-13,RH,13,1);                                                            // top highlight
    p(-5,-12,GB,1,10); p(3,-11,GB,1,9);                                           // gold edges
    // Phoenix emblem (flame motif)
    p(-3,-8,CO,6,8); p(-2,-7,GM,4,6); p(-2,-7,GB,4,1);
    p(-2,-3,EL,4,2); p(-1,-1,EW,2,1);
    p(-3,-11,GB,1,2); p( 2,-11,GB,1,2);                                           // flame wings
    ctx.save(); ctx.globalAlpha = 0.50 + ep * 0.35;
    pUnit(ctx,cx,cy,-3,-8+idleY,EW,6,8,isLeft,S);
    ctx.restore();
    for (let r=0; r<3; r++) { p(-6,-10+r*4,EL,1,1); p(5,-10+r*4,EL,1,1); }        // glowing rivets

    // ── PAULDRONS (red w/ gold flame trim)
    p(-13,-13,CO,8,9); p(-12,-12,RM,6,8); p(-11,-11,RB,4,7); p(-10,-10,RL,2,5);
    p(-12,-12,RH,6,1);
    p(-12,-12,GB,6,1);                                                            // gold cap
    p( 6,-13,CO,8,9); p( 7,-12,RM,6,8); p( 8,-11,RB,4,7); p( 9,-10,RL,2,5);
    p( 7,-12,RH,6,1);
    p( 7,-12,GB,6,1);

    // ── ARMS + GAUNTLETS
    p(-11,-10,CO,5,12); p(-10,-9,RM,4,10); p(-10,-9,RH,4,1);
    p(-11,-17,CO,5,8); p(-10,-16,'#C68642',4,6);
    p( 7,-10,CO,5,12); p( 8,-9,RM,4,10); p( 8,-9,RH,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,'#C68642',4,6);

    // ── NECK
    p(-3,-16,CO,7,3); p(-2,-15,GM,5,2);

    // ── GOLDEN HELM (ornate w/ ruby eyes)
    p(-8,-30,CO,16,14); p(-7,-29,GM,14,12); p(-6,-28,GB,11,10); p(-5,-27,GL,8,8); p(-4,-26,GH,5,6);
    p(-7,-29,GH,14,1);                                                            // top highlight
    // Glowing ruby eyes
    p(-4,-23,CO,4,3); p(-3,-22,RUB,2,2); p(-2,-22,'#FF6E6E',1,1);
    p( 1,-23,CO,4,3); p( 2,-22,RUB,2,2); p( 3,-22,'#FF6E6E',1,1);
    ctx.save(); ctx.globalAlpha = 0.60 + ep * 0.30;
    pUnit(ctx,cx,cy,-3,-22+idleY,'#FF8080',2,2,isLeft,S);
    pUnit(ctx,cx,cy, 2,-22+idleY,'#FF8080',2,2,isLeft,S);
    ctx.restore();
    p(-2,-21,CO,5,1);                                                             // mouth slit

    // ── PHOENIX CROWN (golden, multi-spire)
    p(-8,-36,CO,16,8); p(-7,-35,GM,14,7); p(-6,-34,GB,11,6); p(-5,-33,GL,8,4);
    p(-7,-35,GH,14,1);                                                            // top highlight
    // Center flame spire (taller, ember-tipped)
    p(-3,-42,CO,6,7); p(-2,-41,GB,4,6); p(-1,-40,GL,2,4);
    p(-1,-44,CO,3,3); p( 0,-43,EW,1,2);                                           // top ember
    // Side flame spires
    p(-7,-39,CO,3,4); p(-6,-38,GB,1,3); p(-6,-40,EL,1,1);
    p( 5,-39,CO,3,4); p( 6,-38,GB,1,3); p( 6,-40,EL,1,1);

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.78; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy, 5,-60+idleY,EW,18,16,isLeft,S);
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.55; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-26,-18+phY+idleY,EW,22,14,isLeft,S);                     // phoenix burst
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.40; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-10,-16+idleY,EL,24,40,isLeft,S);
        ctx.restore();
    }
}

/* ═══════════════════════════════════════════════════════ drawVoidSniper ═══ */
function drawVoidSniper(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep        = (Math.sin(now * 0.005) + 1) / 2;
    const linePulse = (Math.sin(now * 0.005) + 1) / 2;
    const floatX    = Math.sin(now * 0.006) * 4;
    const CO='#000000';
    const SS='#050A1A', SM='#0A1430', SB='#0D1C4A', SL='#0D47A1', SH='#3060A8';
    const VS='#1A0040', VM='#3A007A', VL='#9C27B0', VH='#CE93D8';
    const CY='#00B8D4', CL='#00E5FF', CH='#B2EBF2', CW='#FFFFFF';
    const GD2='#B88000', GD='#FFD700';

    // ── void aura
    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.20;
    pUnit(ctx,cx,cy,-22,-42+idleY,VM,44,80,isLeft,S);
    ctx.restore();

    // ── DUAL VOID ORBS (flanking, orbital)
    p(18+floatX,-18,CO,6,14); p(19+floatX,-17,VM,4,12); p(20+floatX,-16,VL,2,10);
    p(20+floatX,-15,VH,2,2);
    p(18-floatX, 2,CO,6,12); p(19-floatX, 3,VM,4,10); p(20-floatX, 4,VL,2,8);
    p(20-floatX, 5,VH,2,2);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.30;
    pUnit(ctx,cx,cy,18+floatX,-18+idleY,VL,6,14,isLeft,S);
    pUnit(ctx,cx,cy,18-floatX, 2+idleY,VL,6,12,isLeft,S);
    ctx.restore();

    // ── MASSIVE VOID RIFLE (taller, w/ scope+vents+stock+muzzle)
    // Barrel (long)
    p(12,-58,CO,7,84); p(13,-57,SS,5,82); p(13,-54,SM,3,76);
    p(14,-50,SB,1,68);                                                            // central groove
    // Barrel vents (gold accents)
    p(12,-50,GD2,7,1); p(12,-38,GD2,7,1); p(12,-26,GD2,7,1); p(12,-14,GD2,7,1); p(12,-2,GD2,7,1);
    // Muzzle (extended w/ flash hider)
    p( 9,-64,CO,12,10); p(10,-63,SB,10,8); p(11,-62,SL,7,6);
    p(10,-66,CO,4,3); p(11,-65,SH,2,2);                                           // muzzle tip cap
    p(15,-66,CO,4,3); p(16,-65,SH,2,2);
    p(11,-58,CO,8,1);                                                             // muzzle base
    // Muzzle inner glow (always visible)
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.35;
    pUnit(ctx,cx,cy,11,-62+idleY,CL,8,6,isLeft,S);
    ctx.restore();
    // Stock + buttplate
    p( 9,14,CO,12,10); p(10,15,SB,10,8); p(11,16,SL,7,6);
    p(10,22,CO,12,4); p(11,23,SH,10,2);                                           // butt cap
    // Cheek rest
    p(11,18,GD2,8,1);
    // Scope (taller, multi-segment)
    p(13,-32,CO,5,16); p(14,-31,SM,3,14); p(14,-31,SH,3,1);
    p(13,-34,CO,3,3); p(14,-33,SB,1,1);                                           // eyepiece
    p(15,-34,CO,3,3); p(16,-33,CL,1,1);                                           // front lens (glow)
    ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
    pUnit(ctx,cx,cy,15,-33+idleY,CW,3,3,isLeft,S);
    ctx.restore();
    // Tracer line (always faint, bright on atk)
    p(14,-58,CL,1,84);
    ctx.save(); ctx.globalAlpha = 0.50 + linePulse * 0.40;
    pUnit(ctx,cx,cy,14,-58+idleY,CL,1,84,isLeft,S);
    ctx.restore();

    // ── BOOTS
    p(-7,14,CO,7,9); p(-6,15,SS,5,8); p(-4,16,SM,3,6);
    p( 1,14,CO,6,9); p( 2,15,SS,5,8); p( 3,16,SM,3,6);
    p(-7,14,VM,7,1); p( 1,14,VM,6,1);                                             // void cuffs

    // ── ROBE LOWER (dark w/ cyan glow channel)
    p(-8,2,CO,16,13); p(-7,3,SS,14,11); p(-6,4,SM,11,9); p(-5,5,SB,7,7);
    p(-7,3,SH,14,1);                                                              // top highlight
    p(-1,4,`rgba(148,0,211,${0.25+linePulse*0.35})`,3,10);
    p(-5,7,`rgba(0,229,255,${0.15+linePulse*0.2})`,2,6);

    // ── BELT (gold buckle, void gem)
    p(-8,0,CO,16,3); p(-7,1,SB,14,2); p(-7,1,SH,14,1);
    p(-2,0,CO,4,3); p(-1,1,VL,2,1);

    // ── CHEST (riveted, cyan power channel)
    p(-7,-14,CO,15,17); p(-6,-13,SS,13,15); p(-5,-12,SM,10,12); p(-4,-11,SB,7,10);
    p(-6,-13,SH,13,1);                                                            // top highlight
    p(-1,-12,`rgba(0,229,255,${0.3+linePulse*0.4})`,2,11);
    p(-4,-6,CY,9,1);
    p(-6,-9,CO,12,4); p(-5,-8,SM,10,3); p(-4,-7,SB,7,2);                          // ammo strap
    // Bullet pouches
    for (let i=0; i<3; i++) { p(-5+i*4,-9,CO,2,3); p(-4+i*4,-8,GD2,1,2); }
    for (let r=0; r<2; r++) { p(-6,-2+r*4,CL,1,1); p(5,-2+r*4,CL,1,1); }          // glowing rivets

    // ── PAULDRONS (sleek w/ cyan accent stripe)
    p(-13,-13,CO,8,9); p(-12,-12,SM,6,8); p(-11,-11,SB,4,7); p(-12,-12,SH,6,1);
    p(-12,-9,CY,6,1);
    p( 6,-13,CO,8,9); p( 7,-12,SM,6,8); p( 8,-11,SB,4,7); p( 7,-12,SH,6,1);
    p( 7,-9,CY,6,1);

    // ── ARMS + GAUNTLETS
    p(-11,-10,CO,5,12); p(-10,-9,SM,4,10); p(-10,-9,SH,4,1);
    p(-11,-17,CO,5,8); p(-10,-16,SB,4,6);
    p( 7,-10,CO,5,12); p( 8,-9,SM,4,10); p( 8,-9,SH,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,SL,4,6);

    // ── NECK
    p(-3,-16,CO,7,3); p(-2,-15,SM,5,2);

    // ── HEAD (closed hood, full cyan scope-visor band)
    p(-8,-30,CO,16,14); p(-7,-29,SS,14,12); p(-6,-28,SM,12,10); p(-5,-27,SB,9,8);
    p(-7,-29,SH,14,1);                                                            // top highlight
    // Wide cyan visor band (single slit across)
    p(-7,-25,CO,15,5); p(-6,-24,CL,13,4); p(-5,-24,`rgba(0,229,255,${0.7+linePulse*0.3})`,10,3);
    p(-4,-23,CH,3,1); p( 1,-23,CH,3,1);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.30;
    pUnit(ctx,cx,cy,-6,-24+idleY,CW,13,4,isLeft,S);
    ctx.restore();

    // ── HOOD CAP (taller, w/ side-mount scope antenna)
    p(-7,-36,CO,14,8); p(-6,-35,SS,12,7); p(-5,-34,SM,9,5);
    p(-6,-35,SH,12,1);
    p(-8,-38,CO,4,3); p(-7,-37,SB,2,2);                                           // L antenna base
    p( 4,-38,CO,4,3); p( 5,-37,SB,2,2);                                           // R antenna base
    // Antenna cyan tip
    p( 4,-42,CO,2,6); p( 5,-41,CL,1,5);
    ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
    pUnit(ctx,cx,cy, 5,-42+idleY,CW,1,2,isLeft,S);
    ctx.restore();

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.78; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy, 9,-66+idleY,CW,14,10,isLeft,S);                          // muzzle flash
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.65; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,12,-58+idleY,CL,8,80,isLeft,S);                           // tracer beam
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.55; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,12,-48+idleY,VL,7,68,isLeft,S);
        ctx.restore();
    }
}

/* ══════════════════════════════════════════════════════ drawThousandHand ═══ */
function drawThousandHand(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep = (Math.sin(now * 0.005) + 1) / 2;
    const CO='#000000';
    const FS='#1B3A1B', FM='#2E7D32', FB='#388E3C', FL='#558B2F', FH='#81C784', FW='#C8E6C9';
    const GS='#7A5800', GM='#B8860B', GB='#FFD700', GL='#FFE57F', GW='#FFF8C0';
    const SK='#F5DCC7';
    const RD='#D32F2F';

    // ── sacred green aura
    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.20;
    pUnit(ctx,cx,cy,-28,-44+idleY,FH,56,80,isLeft,S);
    ctx.restore();

    // ── 6 GHOST ARMS (3 each side, varying alpha + glowing palms)
    for (let i = 0; i < 6; i++) {
        const half  = i % 3;
        const side  = i < 3 ? -1 : 1;
        const aAlpha = 0.65 - half * 0.18;
        const aY    = -8 + half * 11;
        const sway  = Math.sin(now * 0.004 + i * 0.6) * 6;
        const baseX = side === -1 ? -20 : 12;
        const palmX = side === -1 ? -24 : 18;
        ctx.save(); ctx.globalAlpha = aAlpha;
        // Arm
        pUnit(ctx,cx,cy,baseX, aY+sway+idleY, FM, 10, 5, isLeft, S);
        pUnit(ctx,cx,cy,baseX, aY+sway+idleY, FH, 10, 1, isLeft, S);              // highlight
        // Palm w/ eye-of-protection
        pUnit(ctx,cx,cy,palmX, aY+sway+2+idleY, CO, 6, 6, isLeft, S);
        pUnit(ctx,cx,cy,palmX+1, aY+sway+3+idleY, FB, 4, 4, isLeft, S);
        pUnit(ctx,cx,cy,palmX+2, aY+sway+4+idleY, GB, 2, 2, isLeft, S);           // gold eye
        pUnit(ctx,cx,cy,palmX+2, aY+sway+4+idleY, GW, 1, 1, isLeft, S);
        ctx.restore();
        // Palm glow (always)
        ctx.save(); ctx.globalAlpha = aAlpha * 0.7;
        pUnit(ctx,cx,cy,palmX, aY+sway+2+idleY, GL, 6, 6, isLeft, S);
        ctx.restore();
    }

    // ── TALL GOLDEN BOW STAFF (vertical, glowing string)
    p(12,-54,CO,5,56); p(13,-53,GS,3,54); p(13,-50,GM,2,48); p(13,-46,GB,2,42);   // shaft
    p(12,-44,GB,5,1); p(12,-32,GB,5,1); p(12,-20,GB,5,1); p(12,-8,GB,5,1);        // gold bands
    // Top bow curve
    p( 9,-60,CO,12,10); p(10,-59,GM,10,8); p(11,-58,GB,7,6); p(12,-57,GL,5,4);
    p(10,-59,GW,10,1);                                                            // top highlight
    p( 7,-62,CO,4,5); p( 8,-61,GM,2,4);                                           // limb tip L
    p(17,-62,CO,4,5); p(18,-61,GM,2,4);                                           // limb tip R
    // Bottom curve
    p( 9, 2,CO,12,10); p(10, 3,GM,10,8); p(11, 4,GB,7,6); p(12, 5,GL,5,4);
    p( 7, 0,CO,4,5); p( 8, 1,GM,2,4);
    p(17, 0,CO,4,5); p(18, 1,GM,2,4);
    // Bowstring (always glowing)
    p(14,-58,CO,1,68); p(14,-58,GW,1,68);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.35;
    pUnit(ctx,cx,cy,14,-58+idleY,GL,1,68,isLeft,S);
    ctx.restore();
    // Center grip (red wrap)
    p(11,-12,CO,5,8); p(12,-11,RD,3,6); p(12,-11,'#FF6E6E',3,1);

    // ── BOOTS (gold-cuffed)
    p(-7,14,CO,7,9); p(-6,15,FS,5,8); p(-4,16,FM,3,6);
    p( 1,14,CO,6,9); p( 2,15,FS,5,8); p( 3,16,FM,3,6);
    p(-7,14,GB,7,1); p( 1,14,GB,6,1);

    // ── ROBE LOWER (top-highlighted, gold belt-line)
    p(-8,2,CO,16,13); p(-7,3,FS,14,11); p(-6,4,FM,11,9); p(-5,5,FB,7,7);
    p(-7,3,FW,14,1);                                                              // top highlight
    p(-5,12,CO,10,3); p(-4,13,FL,8,2); p(-4,13,GB,8,1);                           // gold hem

    // ── BELT (gold w/ lotus buckle)
    p(-8,0,CO,16,3); p(-7,1,FM,14,2); p(-7,1,FL,14,1);
    p(-2,0,CO,4,3); p(-1,1,GB,2,1);

    // ── CHEST (riveted, golden lotus emblem)
    p(-7,-14,CO,15,17); p(-6,-13,FS,13,15); p(-5,-12,FM,10,12); p(-4,-11,FB,7,10); p(-3,-10,FL,4,8);
    p(-6,-13,FW,13,1);                                                            // top highlight
    p(-5,-12,FL,1,11); p(3,-11,FL,1,10);
    // Lotus emblem
    p(-3,-8,CO,6,8); p(-2,-7,GM,4,6); p(-2,-7,GB,4,1);
    p(-1,-5,GL,2,4); p( 0,-3,GW,1,2);
    p(-3,-10,GB,1,2); p( 2,-10,GB,1,2);                                           // petal tips
    ctx.save(); ctx.globalAlpha = 0.50 + ep * 0.35;
    pUnit(ctx,cx,cy,-3,-8+idleY,GW,6,8,isLeft,S);
    ctx.restore();
    for (let r=0; r<3; r++) { p(-6,-10+r*4,GB,1,1); p(5,-10+r*4,GB,1,1); }        // gold rivets

    // ── PAULDRONS (gold-trim, green)
    p(-13,-13,CO,8,9); p(-12,-11,FM,6,8); p(-11,-11,FL,4,7); p(-10,-10,FH,2,5);
    p(-12,-11,FW,6,1);
    p(-12,-12,GB,6,1);                                                            // gold cap
    p( 6,-13,CO,8,9); p( 7,-11,FM,6,8); p( 8,-11,FL,4,7); p( 9,-10,FH,2,5);
    p( 7,-11,FW,6,1);
    p( 7,-12,GB,6,1);

    // ── ARMS + HANDS (primary, real)
    p(-11,-10,CO,5,12); p(-10,-9,FM,4,10); p(-10,-9,FH,4,1);
    p(-11,-17,CO,5,8); p(-10,-16,SK,4,6);
    p( 7,-10,CO,5,12); p( 8,-9,FM,4,10); p( 8,-9,FH,4,1);
    p( 7,-17,CO,5,8); p( 8,-16,SK,4,6);

    // ── NECK
    p(-3,-16,CO,7,3); p(-2,-15,SK,5,2);

    // ── HEAD (serene, gold third-eye)
    p(-8,-30,CO,16,14); p(-7,-29,SK,14,12); p(-6,-28,'#F8E0BC',11,10);
    p(-5,-23,CO,3,2); p( 2,-23,CO,3,2);
    p(-4,-23,FM,2,1); p( 3,-23,FM,2,1);
    p(-2,-21,CO,5,1);                                                             // serene mouth
    // Third eye on forehead
    p(-1,-26,CO,3,3); p( 0,-25,GB,1,1); p( 0,-25,GW,1,1);
    ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
    pUnit(ctx,cx,cy, 0,-25+idleY,GW,1,1,isLeft,S);
    ctx.restore();

    // ── LOTUS CROWN (multi-petal gold, taller)
    p(-8,-36,CO,16,8); p(-7,-35,FS,14,7); p(-6,-34,FM,11,6); p(-5,-33,FL,8,4); p(-4,-32,FH,5,2);
    p(-7,-35,FW,14,1);                                                            // top highlight
    p(-8,-36,GB,16,1);                                                            // gold band
    // Crown petals
    p(-8,-39,CO,6,4); p(-7,-38,FB,4,3); p(-7,-38,FL,4,1);                         // L petal
    p( 3,-39,CO,6,4); p( 4,-38,FL,4,3); p( 4,-38,FH,4,1);                         // R petal
    // Center tall petal
    p(-3,-42,CO,6,7); p(-2,-41,FM,4,6); p(-2,-41,FL,4,1);
    p(-1,-44,CO,3,4); p( 0,-43,FH,1,2); p( 0,-44,GB,1,1);
    // Gold buds at tips
    p(-7,-40,GB,1,1); p( 6,-40,GB,1,1); p( 0,-45,GW,1,1);

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.72; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy, 8,-62+idleY,GW,16,12,isLeft,S);
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.50; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-22,-12+idleY,FH,38,40,isLeft,S);                         // ghost-arm burst
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.40; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,-8,-14+idleY,GL,22,40,isLeft,S);
        ctx.restore();
    }
}

/* ─── window exports ─────────────────────────────────────────────────────── */
window.drawPaladin          = drawPaladin;
window.drawCrusader         = drawCrusader;
window.drawHellfireAlchemist = drawHellfireAlchemist;
window.drawPhoenixSummoner  = drawPhoenixSummoner;
window.drawVoidSniper       = drawVoidSniper;
window.drawThousandHand     = drawThousandHand;

/* ══════════════════════════════ NOVICE EXORCIST EXCLUSIVE ATTACK T3 ══════ */

/* ── SCRIPTURE KNIGHT — holy scripture sword, golden plate ─────────────── */
function drawScriptureKnight(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 350;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const pulse = (Math.sin(now * 0.004) + 1) / 2;
    const CO='#000';
    const P1='#8C8CAA', P2='#B4B4CC', P3='#D8D8EC', P4='#F0F0FC';
    const G1='#7A5000', G2='#C89000', G3='#FFD700', G4='#FFF8A0';
    const SC='#FFEECC'; // scripture page warm-ivory
    const SK='#C88060';

    // Divine golden aura
    ctx.save(); ctx.globalAlpha = 0.14 + pulse * 0.16;
    pUnit(ctx,cx,cy,-15,-20+idleY,G3,30,54,isLeft,S);
    ctx.restore();

    // ── SCRIPTURE BOOK (left arm — shield function, 12 wide × 16 tall) ──
    const bx = isLeft ? -25 : 13;
    p(bx,   -22,CO,12,18);                                        // book outline
    p(bx+1, -21,G1,10,16); p(bx+1,-20,G2, 9,14); p(bx+2,-19,G3,8,12); // cover layers
    p(bx+1, -20,SC, 1,14);                                        // spine
    p(bx+9, -20,SC, 2,14);                                        // page edge
    p(bx+3, -20,SC, 5, 1); p(bx+3,-18,SC,5,1); p(bx+3,-16,SC,5,1); // scripture text lines
    p(bx+3, -14,SC, 5, 1); p(bx+3,-12,SC,5,1);
    p(bx+1, -21,G3, 1,14);                                        // spine highlight
    ctx.save(); ctx.globalAlpha = 0.50 + pulse * 0.44;
    pUnit(ctx,cx,cy,bx+2,-20+idleY,G4,8,12,isLeft,S);
    ctx.restore();
    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.72; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy,bx,-24+idleY,G3,14,22,isLeft,S);
        ctx.restore();
    }

    // ── BOOTS ──
    p(-12,22,CO,10,7); p(-11,23,P2,8,5); p(-9,24,P3,4,3); p(-12,28,P1,10,1);
    p(  2,22,CO,10,7); p(  3,23,P2,8,5); p( 3,24,P3,4,3); p(  2,28,P1,10,1);

    // ── LEGS ──
    p(-11,8,CO,22,14); p(-10,9,P1,20,12); p(-8,9,P2,16,10); p(-6,10,P3,12,8);
    p(-11,14,G2,22,2); p(-11,20,G2,22,2); // gold trim bands

    // ── BODY (ivory white plate) ──
    p(-11,-12,CO,22,20); p(-10,-11,P1,20,18); p(-8,-11,P2,16,16); p(-6,-10,P3,10,12); p(-4,-9,P4,6,10);
    p(-1,-8,CO, 4,10); p( 0,-7,G2,2,8); p(-2,-4,G2,6,2); // cross fill
    p(-1,-7,G3, 2, 8); p(-2,-3,G3,6,2); p(-1,-4,G4,2,2); // cross bright + centre

    // ── BELT ──
    p(-11,4,CO,22,4); p(-10,5,G1,20,2); p(-8,5,G2,14,1);

    // ── GOLD PAULDRONS (scripture text lines engraved) ──
    p(-18,-16,CO,8,5); p(-17,-15,G1,6,4); p(-16,-14,G2,4,3); p(-16,-14,SC,3,1);
    p( 10,-16,CO,8,5); p( 11,-15,G1,6,4); p( 11,-14,G2,4,3); p( 11,-14,SC,3,1);

    // ── ARMS ──
    p(-17,-12,CO,6,22); p(-16,-11,P1,4,20); p(-15,-11,P2,3,16);
    p( 11,-12,CO,6,22); p( 12,-11,P1,4,20); p( 12,-11,P2,3,16);
    p(-17, 9,CO,6,7); p(-16,10,G1,4,5); p(-15,10,G2,3,3); // gauntlet L
    p( 11, 9,CO,6,7); p( 12,10,G1,4,5); p( 12,10,G2,3,3); // gauntlet R

    // ── HOLY LONG SWORD (right hand — glowing golden blade with scripture marks) ──
    const swx = isLeft ? 14 : -16;
    p(swx,  -32,CO,3,42);                                   // outline (tall blade)
    p(swx+1,-31,G1,1,40); p(swx+1,-31,G2,1,36);            // blade shading
    p(swx-1, -8,CO,5, 3); p(swx,  -7,G2,3,2);              // crossguard
    p(swx,  -31,G3,1, 4);                                   // blade tip
    p(swx+1,-26,SC,1,1); p(swx+1,-22,SC,1,1); p(swx+1,-18,SC,1,1); p(swx+1,-14,SC,1,1); // scripture marks
    ctx.save(); ctx.globalAlpha = 0.50 + pulse * 0.44;
    pUnit(ctx,cx,cy,swx-1,-28+idleY,G3,5,32,isLeft,S); // blade glow
    ctx.restore();
    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.78;
        pUnit(ctx,cx,cy,swx-2,-32+idleY,G4,7,10,isLeft,S);
        ctx.restore();
    }

    // ── NECK ──
    p(-4,-14,CO,8,2); p(-3,-13,SK,6,1);

    // ── GREAT HELM (flat top, cross visor slit, crown crest) ──
    p(-9,-32,CO,18,18);                                        // helm outline
    p(-8,-31,P1,16,16); p(-7,-30,P2,14,14); p(-5,-29,P3,10,12); p(-4,-28,P4,6,10);
    p(-7,-31,P4,5,3); p(-8,-30,P4,2,5);                       // top-left highlight
    // Crown crest
    p(-6,-33,CO,12,3); p(-5,-32,G1,10,2); p(-3,-32,G2,6,1);  // crest base
    p(-5,-36,CO,4,5); p(-4,-35,G1,2,4); p(-3,-34,G2,2,3); p(-3,-36,G3,2,2); // left crest piece
    p( 2,-36,CO,4,5); p( 3,-35,G1,2,4); p( 3,-34,G2,2,3); p( 3,-36,G3,2,2); // right crest piece
    // Cross visor slit
    p(-7,-22,CO,14,3); p(-6,-21,isAtk?G3:'#AABBFF',12,2);
    p(-1,-24,CO, 2, 6); p(-1,-22,G2,2,4);                     // vertical cross bar on face plate
    // Gold trim edges
    p(-9,-32,G2,2,18); p(7,-32,G2,2,18); p(-8,-14,G2,16,1);
}

/* ── SEAL WARRIOR — binding blue armor, seal markings ──────────────────── */
function drawSealWarrior(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 350;
    const idleY  = Math.sin(now * 0.0025) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const pulse = (Math.sin(now * 0.005) + 1) / 2;

    const CO='#000', A1='#1A3A6A', A2='#2255A0', A3='#4488D0', A4='#88BBFF';
    const SL='#00CCFF', SL2='#AAEEFF'; // seal glow cyan
    const G2='#C8A000', G3='#FFD700';
    const SK='#B07050';

    // Seal binding aura
    ctx.save(); ctx.globalAlpha = 0.18+pulse*0.18;
    pUnit(ctx,cx,cy,-13,-14,SL,26,46,isLeft,S);
    ctx.restore();

    // Boots + greaves
    p(-12,23,CO,10,6); p(-11,24,A2,8,4); p(-9,25,A3,4,2); p(-12,28,A1,10,1);
    p(  2,23,CO,10,6); p(  3,24,A2,8,4); p(  3,25,A3,4,2); p(  2,28,A1,10,1);
    // Body armor (blue)
    p(-12,4,CO,24,20); p(-11,5,A1,22,18); p(-9,5,A2,18,16); p(-6,5,A3,12,14);
    // Seal runes on chest
    ctx.save(); ctx.globalAlpha = 0.5+pulse*0.4;
    pUnit(ctx,cx,cy,-4,8,SL,8,2,isLeft,S); pUnit(ctx,cx,cy,-1,10,SL,2,6,isLeft,S);
    pUnit(ctx,cx,cy,-4,6,SL2,2,2,isLeft,S); pUnit(ctx,cx,cy, 2,6,SL2,2,2,isLeft,S);
    ctx.restore();
    // Chest plate
    p(-10,-12,CO,20,16); p(-9,-11,A1,18,14); p(-7,-11,A2,14,12); p(-5,-10,A3,10,10);
    // Pauldrons (wide)
    p(-17,-14,CO,7,9); p(-16,-13,A2,5,7); p(-16,-13,A4,3,3);
    p( 10,-14,CO,7,9); p( 11,-13,A2,5,7); p( 11,-13,A4,3,3);
    // Arms
    p(-16,-6,CO,5,14); p(-15,-5,A1,3,12); p(-15,-5,A2,2,9);
    p( 11,-6,CO,5,14); p( 12,-5,A1,3,12); p( 12,-5,A2,2,9);
    // Binding weapon (seal hammer)
    const wx = isLeft ? 14 : -15;
    p(wx,-18,CO,3,30); p(wx+1,-17,G2,1,28); // handle
    p(wx-4,-22,CO,12,8); p(wx-3,-21,A3,10,6); p(wx-1,-20,A4,6,4); // hammer head
    ctx.save(); ctx.globalAlpha = 0.5+pulse*0.4;
    pUnit(ctx,cx,cy,wx-3,-21,SL,10,6,isLeft,S); // seal glow on head
    ctx.restore();
    if (isAtk) { ctx.save(); ctx.globalAlpha=0.8; pUnit(ctx,cx,cy,wx-4,-24,SL2,12,12,isLeft,S); ctx.restore(); }
    // Head / great helm
    p(-8,-28,CO,16,14); p(-7,-27,A1,14,12); p(-5,-26,A2,8,10);
    p(-3,-27,A2,4,12); // visor
    p(-6,-22,CO,12,3); p(-5,-21,isAtk?SL:'#3366AA',8,1);
    p(-4,-30,A3,8,3); // crest
}

/* ── TOME CANNON — floating book cannon, holy bombardment ──────────────── */
function drawTomeCannon(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 300;
    const idleY  = Math.sin(now * 0.0018) * 1.5;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const pulse = (Math.sin(now * 0.006) + 1) / 2;

    const CO='#000', BK1='#3A2800', BK2='#6A4800', BK3='#9C6A00'; // book brown
    const G1='#B87800', G2='#FFD700', G3='#FFFACD';
    const P1='#CC3300', P2='#FF5500', PG='rgba(255,100,0,0.5)';
    const W1='#FFFFFF', W2='#FFEECC';
    const SK='#C07848';

    // Muzzle flash (attack)
    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.7;
        pUnit(ctx,cx,cy,(isLeft?18:-19),-4,P2,10,10,isLeft,S);
        ctx.restore();
    }

    // Boots + lower robe
    p(-8,22,CO,6,5); p(-7,23,BK2,4,3); p( 2,22,CO,6,5); p( 3,23,BK2,4,3);
    p(-9,4,CO,18,18); p(-8,5,BK1,16,16); p(-7,5,BK2,12,14); p(-5,6,BK3,8,12);
    p(-9,20,G2,18,2); // gold hem
    // Upper robe
    p(-8,-8,CO,16,13); p(-7,-7,BK1,14,11); p(-6,-7,BK2,10,9); p(-4,-6,BK3,6,7);

    // The TOME CANNON — large floating book + barrel
    const bx = isLeft ? 8 : -14;
    p(bx,-12,CO,12,16); p(bx+1,-11,BK2,10,14); p(bx+2,-10,BK3,8,12);
    // Book pages
    p(bx+3,-9,W1,1,10); p(bx+4,-9,W2,2,10);
    // Book spine gold
    p(bx,-11,G2,2,14);
    // Cannon barrel extending from book
    p(bx+10,-4,CO,8,6); p(bx+11,-3,G1,6,4); p(bx+12,-2,G2,4,2); // barrel
    ctx.save(); ctx.globalAlpha = 0.5+pulse*0.4;
    pUnit(ctx,cx,cy,bx+10,-3,P2,4,4,isLeft,S);
    ctx.restore();

    // Arms (reaching to book)
    p(-12,-5,CO,4,10); p(-11,-4,BK2,2,8);
    p(  8,-5,CO,4,10); p(  9,-4,BK2,2,8);

    // Head + wide brim hat
    p(-5,-18,CO,10,9); p(-4,-17,SK,8,7); p(-3,-16,SK,6,5);
    p(-8,-22,CO,16,5); p(-7,-21,BK2,14,3); p(-5,-20,BK3,10,2); // wide brim
    p(-4,-26,CO,8,5); p(-3,-25,BK2,6,4); p(-2,-24,G2,4,2); // top
    // Eyes
    p(-3,-14,CO,2,1); p(2,-14,CO,2,1);
    p(-2,-13,isAtk?P2:G2,1,1); p(3,-13,isAtk?P2:G2,1,1);
}

/* ── HOLY BURST — angelic high-damage holy caster ──────────────────────── */
function drawHolyBurst(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const pulse = (Math.sin(now * 0.004) + 1) / 2;

    const CO='#000', W0='#B4A890', W1='#E8DCC0', W2='#F8F4E8', W3='#FFFFFF';
    const G1='#B88000', G2='#FFD700', G3='#FFF8A0';
    const GD='rgba(255,220,0,0.6)'; // gold burst
    const HB='rgba(255,255,200,0.5)'; // holy blast
    const SK='#D09878';

    // Holy aura (constant)
    ctx.save(); ctx.globalAlpha = 0.16+pulse*0.18;
    pUnit(ctx,cx,cy,-14,-18,G2,28,50,isLeft,S);
    ctx.restore();
    // Burst VFX
    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.75;
        pUnit(ctx,cx,cy,-18,-22,G3,36,46,isLeft,S);
        ctx.restore();
    }

    // Wings (angelic — spread)
    p(-18,-12,W0,6,18); p(-19,-10,W1,4,14); p(-20,-8,W2,2,10); // left wing
    p( 12,-12,W0,6,18); p( 13,-10,W1,4,14); p( 14,-8,W2,2,10); // right wing
    // Wing detail lines
    p(-17,-10,CO,1,12); p(-16,-11,CO,1,11);
    p( 13,-10,CO,1,12); p( 12,-11,CO,1,11);

    // White robe (lower)
    p(-9,4,CO,18,19); p(-8,5,W1,16,17); p(-6,5,W2,12,15); p(-4,6,W3,8,12);
    p(-9,20,G2,18,2); p(-7,21,G3,14,1);
    // Robe upper
    p(-8,-9,CO,16,14); p(-7,-8,W1,14,12); p(-5,-8,W2,10,10); p(-3,-7,W3,6,8);
    // Gold breastplate detail
    p(-5,-6,G1,10,8); p(-4,-5,G2,8,6); p(-2,-4,G3,4,4);
    p(-2,-2,G2,2,6); p(-3,0,G2,6,2); // cross

    // Arms
    p(-14,-5,CO,5,14); p(-13,-4,W1,3,12); p(-13,-4,W2,2,8);
    p(  9,-5,CO,5,14); p( 10,-4,W1,3,12); p( 10,-4,W2,2,8);
    // Hands raising orb
    p(-13,8,CO,5,5); p(-12,9,W2,3,3);
    p(  9,8,CO,5,5); p( 10,9,W2,3,3);
    // Holy orb between hands
    p(-3,9,CO,6,6); p(-2,10,G2,4,4); p(-1,11,G3,2,2);
    ctx.save(); ctx.globalAlpha = 0.6+pulse*0.35;
    pUnit(ctx,cx,cy,-3,9,HB,6,6,isLeft,S);
    ctx.restore();

    // Head + halo
    p(-5,-19,CO,10,10); p(-4,-18,SK,8,8); p(-3,-17,W1,6,5); p(-2,-16,W2,3,3);
    p(-7,-22,CO,14,5); p(-6,-21,W1,12,3); p(-4,-21,W2,8,2); // headband
    // Halo ring
    p(-8,-25,G2,3,2); p(5,-25,G2,3,2); p(-10,-24,G2,2,3); p(8,-24,G2,2,3);
    ctx.save(); ctx.globalAlpha = 0.5+pulse*0.4;
    pUnit(ctx,cx,cy,-10,-26,G2,20,5,isLeft,S);
    ctx.restore();
    // Eyes
    p(-3,-14,CO,2,1); p(2,-14,CO,2,1);
    p(-2,-13,isAtk?'#FFD700':'#AADDFF',1,1); p(3,-13,isAtk?'#FFD700':'#AADDFF',1,1);
}

/* ── RAPID EXORCIST — speed-type, light blue energy bolts ──────────────── */
function drawRapidExorcist(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 200;
    const idleY  = Math.sin(now * 0.003) * 1.5;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const zp = (Math.sin(now * 0.008) + 1) / 2;
    const CO='#000', SK='#C08060';
    const C1='#003366', C2='#0055AA', C3='#0077DD', C4='#44AAFF';
    const E1='#00FFFF', E2=`rgba(0,255,255,0.5)`;

    // ── SPEED TRAIL AURA (wide semi-transparent behind body)
    ctx.save(); ctx.globalAlpha=0.18+zp*0.20;
    pUnit(ctx,cx,cy,-12,0+idleY,C4,24,34,isLeft,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha=0.10+zp*0.14;
    pUnit(ctx,cx,cy,-14,2+idleY,E2,28,30,isLeft,S);
    ctx.restore();

    // ── BOOTS — streamlined
    p(-10,22,CO,9,6);  p(-9,23,C2,7,4);  p(-7,24,C3,4,2);  p(-10,27,C1,9,1);
    p(  1,22,CO,9,6);  p( 2,23,C2,7,4);  p( 2,24,C3,4,2);  p(  1,27,C1,9,1);

    // ── LOWER COMBAT SUIT (form-fitting, layered)
    p(-10,6,CO,20,16);  p(-9,7,C1,18,14);  p(-7,7,C2,14,12);  p(-5,8,C3,10,10);  p(-3,9,C4,6,8);
    ctx.save(); ctx.globalAlpha=0.30+zp*0.24; pUnit(ctx,cx,cy,-10,6+idleY,E2,3,14,isLeft,S); ctx.restore();
    ctx.save(); ctx.globalAlpha=0.30+zp*0.24; pUnit(ctx,cx,cy, 7,6+idleY,E2,3,14,isLeft,S); ctx.restore();

    // ── BELT
    p(-10,1,CO,20,6);  p(-9,2,C2,18,4);  p(-7,3,C3,10,2);

    // ── UPPER COMBAT SUIT
    p(-9,-10,CO,18,14);  p(-8,-9,C1,16,12);  p(-6,-9,C2,12,10);  p(-4,-8,C3,8,8);  p(-2,-7,C4,4,6);
    ctx.save(); ctx.globalAlpha=0.32+zp*0.28; pUnit(ctx,cx,cy,-4,-8+idleY,E2,8,10,isLeft,S); ctx.restore();

    // ── SPEED-WING PAULDRONS (with side flares)
    p(-16,-12,CO,6,8);  p(-15,-11,C2,4,6);  p(-14,-10,C3,3,5);
    p(-18,-14,CO,4,6);  p(-19,-13,C3,3,5);  p(-20,-12,C4,2,4);  // left speed-wing flare
    p( 10,-12,CO,6,8);  p( 11,-11,C2,4,6);  p( 11,-10,C3,3,5);
    p( 14,-14,CO,4,6);  p( 15,-13,C3,3,5);  p( 16,-12,C4,2,4);  // right speed-wing flare
    ctx.save(); ctx.globalAlpha=0.44+zp*0.34;
    pUnit(ctx,cx,cy,-20,-12+idleY,E2,4,8,isLeft,S);  pUnit(ctx,cx,cy,14,-12+idleY,E2,4,8,isLeft,S);
    ctx.restore();

    // ── ARMS
    p(-15,-8,CO,4,18);  p(-14,-7,C2,2,16);  p(-14,-7,C3,1,12);
    p( 11,-8,CO,4,18);  p( 12,-7,C2,2,16);  p( 12,-7,C3,1,12);

    // ── DUAL SHORT WANDS (both hands — handle + glowing cyan tips)
    p(-16,-4,CO,3,12);  p(-15,-3,C3,2,10);   // left wand handle
    p( 11,-4,CO,3,12);  p( 12,-3,C3,2,10);   // right wand handle
    p(-17,-6,CO,4,4);   p(-16,-5,C4,3,3);    // left wand tip
    p( 10,-6,CO,4,4);   p( 11,-5,C4,3,3);    // right wand tip
    ctx.save(); ctx.globalAlpha=0.72+zp*0.26;
    pUnit(ctx,cx,cy,-17,-6+idleY,E1,4,4,isLeft,S);  pUnit(ctx,cx,cy,10,-6+idleY,E1,4,4,isLeft,S);
    ctx.restore();
    // ── ATTACK: muzzle flash at both wand tips
    if (isAtk) {
        ctx.save(); ctx.globalAlpha=0.92;
        pUnit(ctx,cx,cy,-20,-8+idleY,E1,6,6,isLeft,S);
        pUnit(ctx,cx,cy, 8,-8+idleY,E1,6,6,isLeft,S);
        ctx.restore();
    }

    // ── FACE (behind helmet)
    p(-5,-18,CO,10,9);  p(-4,-17,SK,8,7);  p(-3,-16,SK,5,5);

    // ── AERODYNAMIC HELMET (full, streamlined)
    p(-7,-24,CO,14,7);  p(-6,-23,C1,12,6);  p(-5,-22,C2,9,5);  p(-4,-21,C3,6,4);  p(-3,-20,C4,4,3);
    p(-7,-28,CO,14,5);  p(-6,-27,C1,12,4);  p(-4,-26,C2,8,3);  // upper helm dome
    // Speed fins on sides
    p(-10,-24,C3,3,5);  p(6,-24,C3,3,5);
    // Full visor (glowing cyan slit)
    p(-6,-22,CO,12,4);  p(-5,-21,isAtk?E1:C4,10,3);
    ctx.save(); ctx.globalAlpha=0.52+zp*0.28;
    pUnit(ctx,cx,cy,-5,-21+idleY,E2,10,3,isLeft,S);
    ctx.restore();
}

function drawChainExorcist(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 300;
    const idleY  = Math.sin(now * 0.0022) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep = (Math.sin(now * 0.009) + 1) / 2;
    const CO='#000', SK='#B07050';
    const D1='#1A0055', D2='#330099', D3='#6600CC', D4='#9944EE';
    const CH1='#455A64', CH2='#CCAAFF';
    const EL=`rgba(200,100,255,0.55)`, LT='#FFFFFF';

    // ── CHAIN ARC GLOW AURA
    ctx.save(); ctx.globalAlpha=0.14+ep*0.22;
    pUnit(ctx,cx,cy,-14,-12+idleY,CH2,28,42,isLeft,S);
    ctx.restore();

    // ── BOOTS — midnight purple
    p(-10,22,CO,9,6);  p(-9,23,D1,7,4);  p(-8,24,D2,4,3);  p(-10,27,D1,9,1);
    p(  1,22,CO,9,6);  p( 2,23,D1,7,4);  p( 2,24,D2,4,3);  p(  1,27,D1,9,1);

    // ── HEAVY COAT LOWER (midnight purple, wide flowing)
    p(-11,4,CO,22,22);  p(-10,5,D1,20,20);  p(-8,5,D2,16,18);  p(-6,6,D3,10,16);  p(-3,7,D4,5,14);
    p(-11,24,D3,22,2);   // coat hem accent

    // ── BELT
    p(-10,1,CO,20,5);  p(-9,2,D2,18,3);  p(-7,3,D3,10,2);

    // ── UPPER BODY COAT
    p(-10,-10,CO,20,16);  p(-9,-9,D1,18,14);  p(-7,-9,D2,14,12);  p(-5,-8,D3,10,10);  p(-3,-7,D4,6,8);
    p(-10,-10,D4,2,14);   p( 8,-10,D4,2,14);   // violet edge trim

    // ── PAULDRONS — heavy coat shoulders
    p(-15,-12,CO,6,8);  p(-14,-11,D2,4,6);  p(-13,-10,D3,3,5);  p(-13,-10,D4,2,3);
    p( 10,-12,CO,6,8);  p( 11,-11,D2,4,6);  p( 11,-10,D3,3,5);  p( 11,-10,D4,2,3);

    // ── ARMS
    p(-14,-8,CO,4,20);  p(-13,-7,D2,2,18);  p(-13,-7,D3,1,14);
    p( 10,-8,CO,4,20);  p( 11,-7,D2,2,18);  p( 11,-7,D3,1,14);

    // ── HOLY CHAIN WHIP — 6 links diagonally from hand to tip orb
    const chx = 11, chDir = 1;  // chain extends from weapon hand rightward
    for (let i=0; i<6; i++) {
        const lx = chx + chDir*i*3,  ly = -4 + i*4;
        p(lx,ly,CO,4,4);  p(lx+chDir,ly+1,CH1,3,3);
        ctx.save(); ctx.globalAlpha=0.42+ep*0.40;
        pUnit(ctx,cx,cy,lx+chDir,ly+1+idleY,CH2,3,3,isLeft,S);
        ctx.restore();
    }
    // Chain tip — electrified orb
    const tx=chx+chDir*18,  ty=20;
    p(tx,ty,CO,6,6);   p(tx+1,ty+1,D3,4,4);  p(tx+2,ty+2,D4,2,3);
    ctx.save(); ctx.globalAlpha=0.65+ep*0.32;
    pUnit(ctx,cx,cy,tx+1,ty+1+idleY,LT,4,4,isLeft,S);
    ctx.restore();
    // Electric arcs radiating from chain tip (attack)
    if (isAtk) {
        ctx.save(); ctx.globalAlpha=0.75;
        pUnit(ctx,cx,cy,tx-2,ty-5+idleY,EL,8,4,isLeft,S);
        pUnit(ctx,cx,cy,tx+2,ty-3+idleY,EL,6,3,isLeft,S);
        pUnit(ctx,cx,cy,tx,  ty-7+idleY,EL,4,6,isLeft,S);
        ctx.restore();
    }

    // ── DEEP HOODED COWL (shadowy face)
    p(-9,-22,CO,18,16);   p(-8,-21,D1,16,14);  p(-7,-20,D2,13,12);  p(-5,-19,D3,8,10);
    p(-8,-24,CO,16,5);    p(-7,-23,D1,14,4);   // upper hood brow
    p(-7,-20,D1,14,12);   p(-6,-19,CO,10,10);  // dark hood interior shadow

    // ── TWO GLOWING EYES in the dark hood
    p(-3,-15,D3,2,2);  p(2,-15,D3,2,2);   // outer glow ring
    p(-2,-14,isAtk?LT:CH2,1,2);  p(3,-14,isAtk?LT:CH2,1,2);  // eye glint
    ctx.save(); ctx.globalAlpha=0.52+ep*0.36;
    pUnit(ctx,cx,cy,-4,-16+idleY,CH2,3,4,isLeft,S);
    pUnit(ctx,cx,cy, 1,-16+idleY,CH2,3,4,isLeft,S);
    ctx.restore();
}

window.drawScriptureKnight = drawScriptureKnight;
window.drawSealWarrior     = drawSealWarrior;
window.drawTomeCannon      = drawTomeCannon;
window.drawHolyBurst       = drawHolyBurst;
window.drawRapidExorcist   = drawRapidExorcist;
window.drawChainExorcist   = drawChainExorcist;
