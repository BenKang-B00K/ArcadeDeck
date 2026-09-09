/* pix_tier4.js - Tier 4 Exorcists (Legendary/Ultimate Units) */

function drawTransmuter(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.0018) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep     = (Math.sin(now * 0.005) + 1) / 2;
    const armRot = now * 0.003;
    const CO='#000';
    const LD0='#1A1F22', LD1='#2B3338', LD2='#455A64', LD3='#607D8B', LD4='#90A4AE';
    const EM0='#004D2C', EM1='#00C853', EM2='#00E676', EM3='#69F0AE', EM4='#B9F6CA';
    const GD1='#9A6F00', GD2='#D4A500', GD3='#FFD700';
    const RD='#D32F2F', SK='#C8A28C';

    // emerald reaction aura
    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnit(ctx,cx,cy,-18,-30+idleY,EM2,36,62,isLeft,S); ctx.restore();

    // ── BOOTS — lead sabatons, gold cuff
    p(-12,22,CO,11,7);  p(-11,23,LD1,9,5);  p(-9,24,LD3,4,3);  p(-12,28,LD0,11,1);
    p(  1,22,CO,11,7);  p(  2,23,LD1,9,5);  p( 2,24,LD3,4,3);  p(  1,28,LD0,11,1);
    p(-12,22,GD2,11,1); p( 1,22,GD2,11,1);

    // ── LEG PLATES (riveted lead)
    p(-12,7,CO,24,15); p(-11,8,LD1,22,13); p(-9,8,LD2,18,11); p(-6,9,LD3,12,9);
    p(-11,8,LD4,22,1);                                                          // top highlight
    for (let r=0; r<2; r++) { p(-9,11+r*4,EM1,2,2); p(7,11+r*4,EM1,2,2); }      // emerald rivets

    // ── BELT (gold reinforced)
    p(-12,1,CO,24,7); p(-11,2,LD2,22,5); p(-9,3,LD3,14,3);
    p(-12,1,GD2,24,1); p(-12,6,GD1,24,1);
    p(-2,2,CO,4,4);   p(-1,3,GD3,2,2);                                          // buckle

    // ── CHEST PLATE (emerald energy channels)
    p(-12,-12,CO,24,20); p(-11,-11,LD1,22,18); p(-9,-11,LD2,18,16); p(-6,-10,LD3,12,12);
    p(-11,-11,LD4,22,1);                                                        // top highlight
    p(-5,-10,EM0,2,18); p(3,-10,EM0,2,18);                                      // channel base
    ctx.save(); ctx.globalAlpha = 0.50 + ep * 0.42;
    pUnit(ctx,cx,cy,-5,-10+idleY,EM2,2,18,isLeft,S);
    pUnit(ctx,cx,cy, 3,-10+idleY,EM2,2,18,isLeft,S);
    ctx.restore();
    for (let r=0; r<3; r++) { p(-9,-7+r*5,GD2,2,2); p(7,-7+r*5,GD2,2,2); }      // gold rivets

    // ── PHILOSOPHER'S CORE (red gem, chest center)
    p(-4,-2,CO,8,8); p(-3,-1,RD,6,6); p(-2,0,'#FF6E6E',4,4);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.40;
    pUnit(ctx,cx,cy,-4,-2+idleY,RD,8,8,isLeft,S);
    ctx.restore();

    // ── MASSIVE PAULDRONS w/ transmutation circles
    p(-19,-15,CO,8,9); p(-18,-14,LD2,6,7); p(-17,-13,LD3,4,5); p(-18,-14,LD4,6,1);
    p(-18,-12,CO,6,6); p(-17,-11,GD2,4,4); p(-16,-10,EM2,2,2);                  // circle L
    p( 11,-15,CO,8,9); p( 12,-14,LD2,6,7); p( 12,-13,LD3,4,5); p( 12,-14,LD4,6,1);
    p( 12,-12,CO,6,6); p( 13,-11,GD2,4,4); p( 14,-10,EM2,2,2);                  // circle R

    // ── ARMS (lead vambraces)
    p(-17,-10,CO,5,18); p(-16,-9,LD2,3,16); p(-15,-8,LD3,2,12);
    p( 12,-10,CO,5,18); p( 13,-9,LD2,3,16); p( 13,-8,LD3,2,12);

    // ── FLOATING MECHANICAL ARMS (rotating, emerald tips)
    const a1 = Math.sin(armRot) * 4;
    const a2 = Math.sin(armRot + Math.PI) * 4;
    p(-26,-2+a1,CO,11,5); p(-25,-1+a1,LD3,9,3); p(-25,-1+a1,LD4,9,1);
    p(-26,-2+a1,GD2,2,5); p(-17,-1+a1,CO,3,3); p(-16,0+a1,EM2,2,2);
    p( 15,-2+a2,CO,11,5); p( 16,-1+a2,LD3,9,3); p( 16,-1+a2,LD4,9,1);
    p( 24,-2+a2,GD2,2,5); p( 14,-1+a2,CO,3,3); p( 15,0+a2,EM2,2,2);
    ctx.save(); ctx.globalAlpha = 0.6 + ep * 0.3;
    pUnit(ctx,cx,cy,-17,-1+a1+idleY,EM3,3,3,isLeft,S);
    pUnit(ctx,cx,cy, 14,-1+a2+idleY,EM3,3,3,isLeft,S);
    ctx.restore();

    // ── NECK
    p(-3,-14,CO,6,2); p(-2,-13,SK,4,1);

    // ── HIEROPHANT'S HELM (lead, emerald visor, gold accents)
    p(-9,-30,CO,18,18); p(-8,-29,LD1,16,16); p(-7,-28,LD2,14,14); p(-5,-27,LD3,8,10);
    p(-8,-29,LD4,16,1);                                                         // top highlight
    p(-9,-32,CO,18,3); p(-8,-31,LD3,16,2); p(-8,-31,LD4,16,1);                  // brim
    p(-9,-26,GD2,2,8); p( 7,-26,GD2,2,8);                                       // side gold
    p(-7,-22,CO,14,4); p(-6,-21,isAtk?EM4:EM2,12,3);                            // visor slit
    ctx.save(); ctx.globalAlpha = 0.50 + ep * 0.40;
    pUnit(ctx,cx,cy,-6,-21+idleY,EM3,12,3,isLeft,S);
    ctx.restore();

    // ── ANTENNA CRYSTAL (emerald spike on helm top)
    p(-1,-36,CO,4,5); p(0,-35,EM0,2,4); p(0,-38,EM1,2,3); p(1,-40,EM2,1,3);
    p(1,-42,EM3,1,2); p(1,-43,EM4,1,1);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.40;
    pUnit(ctx,cx,cy,0,-42+idleY,EM3,2,4,isLeft,S);
    ctx.restore();

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.65; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy,-18,-26+idleY,EM3,36,52,isLeft,S);
        ctx.restore();
    }
}

function drawOracle(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const floatY = Math.sin(now * 0.002) * 6;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + floatY, col, w, h, isLeft, S);
    const ep    = (Math.sin(now * 0.005) + 1) / 2;
    const orbit = now * 0.0018;
    const CO='#000';
    const IN0='#0A0A2A', IN1='#1A237E', IN2='#283593', IN3='#3949AB', IN4='#5C6BC0';
    const PR1='#651FFF', PR2='#7C4DFF', PR3='#B388FF', PR4='#E1BEE7';
    const GD1='#9A6F00', GD2='#D4A500', GD3='#FFD700';
    const WH='#FFFFFF', SK='#D4A675';

    // cosmic aura
    ctx.save(); ctx.globalAlpha = 0.16 + ep * 0.22;
    pUnit(ctx,cx,cy,-18,-30+floatY,PR1,36,64,isLeft,S); ctx.restore();

    // ── CONSTELLATION ORBS (8 orbiting stars)
    for (let i=0; i<8; i++) {
        const ang = orbit + (i * Math.PI / 4);
        const r   = 22 + Math.sin(orbit*2+i) * 2;
        const ox  = Math.cos(ang) * r;
        const oy  = Math.sin(ang) * r * 0.55 - 8;
        ctx.save(); ctx.globalAlpha = 0.40 + ep * 0.40;
        pUnit(ctx,cx,cy,ox-2,oy-2+floatY,PR3,5,5,isLeft,S);
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.85;
        pUnit(ctx,cx,cy,ox-1,oy-1+floatY,WH,3,3,isLeft,S);
        ctx.restore();
    }

    // ── BOOTS (indigo armored)
    p(-11,22,CO,10,7); p(-10,23,IN2,8,5); p(-8,24,IN3,4,3); p(-11,28,IN1,10,1);
    p(  1,22,CO,10,7); p(  2,23,IN2,8,5); p( 2,24,IN3,4,3); p(  1,28,IN1,10,1);
    p(-11,28,GD2,22,1);                                                          // gold toe trim

    // ── ROBE HEM (layered indigo, star-sprinkled)
    p(-13,4,CO,26,22); p(-12,5,IN0,24,20); p(-10,5,IN1,20,18); p(-7,6,IN2,14,16); p(-4,7,IN3,8,14);
    p(-12,5,IN4,24,1);                                                          // top highlight
    p(-8,12,WH,1,1); p(2,16,WH,1,1); p(-3,18,WH,1,1); p(6,10,WH,1,1);           // stars on robe
    p(-13,22,GD2,26,2); p(-11,24,GD3,22,1);                                     // gold hem

    // ── UPPER ROBE / TORSO
    p(-11,-12,CO,22,18); p(-10,-11,IN1,20,16); p(-8,-11,IN2,16,14); p(-5,-10,IN3,10,12);
    p(-10,-11,IN4,20,1);                                                        // top highlight
    p(-11,-12,GD2,22,1);                                                        // gold collar
    // Galaxy core glow on chest
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.40;
    pUnit(ctx,cx,cy,-6,-6+floatY,PR2,12,10,isLeft,S);
    ctx.restore();
    p(-3,-4,CO,6,4); p(-2,-3,PR1,4,2);

    // ── MASSIVE PAULDRONS (indigo, gold-capped)
    p(-18,-16,CO,8,9); p(-17,-15,IN2,6,7); p(-16,-14,IN3,4,5); p(-17,-15,IN4,6,1);
    p(-17,-15,GD2,6,1);
    p( 10,-16,CO,8,9); p( 11,-15,IN2,6,7); p( 11,-14,IN3,4,5); p( 11,-15,IN4,6,1);
    p( 11,-15,GD2,6,1);

    // ── ARMS (flowing sleeves with hand orbs)
    p(-16,-10,CO,5,20); p(-15,-9,IN1,3,18); p(-14,-8,IN2,2,14);
    p( 11,-10,CO,5,20); p( 12,-9,IN1,3,18); p( 13,-8,IN2,2,14);
    p(-17,9,CO,5,5); p(-16,10,PR1,3,3);
    p( 12,9,CO,5,5); p( 13,10,PR1,3,3);
    ctx.save(); ctx.globalAlpha = 0.6 + ep * 0.3;
    pUnit(ctx,cx,cy,-16,10+floatY,PR3,3,3,isLeft,S);
    pUnit(ctx,cx,cy, 13,10+floatY,PR3,3,3,isLeft,S);
    ctx.restore();

    // ── NECK
    p(-3,-14,CO,6,2); p(-2,-13,SK,4,1);

    // ── HOOD / HELM (indigo, gold brim)
    p(-9,-30,CO,18,18); p(-8,-29,IN1,16,16); p(-7,-28,IN2,14,14); p(-5,-27,IN3,8,12);
    p(-8,-29,IN4,16,1);                                                         // top highlight
    p(-10,-32,CO,20,4); p(-9,-31,IN2,18,3); p(-9,-31,GD2,18,1);                 // crown brim

    // ── EYE OF ETERNITY (huge purple eye replaces face)
    p(-7,-26,CO,14,9); p(-6,-25,WH,12,7); p(-6,-25,PR4,12,1);
    p(-3,-24,CO,7,7); p(-2,-23,PR1,5,5); p(-1,-22,PR2,3,3); p(0,-21,CO,1,1);
    ctx.save(); ctx.globalAlpha = 0.50 + ep * 0.40;
    pUnit(ctx,cx,cy,-3,-24+floatY,PR3,7,7,isLeft,S);
    ctx.restore();
    if (isAtk) p(0,-21,WH,1,1);

    // ── COSMIC CROWN (5-spire gold + stargem)
    p(-9,-34,GD1,3,4); p(-9,-37,GD2,3,3); p(-8,-39,GD3,2,2);                    // spire 1
    p(-5,-36,GD1,3,6); p(-5,-39,GD2,3,4); p(-4,-42,GD3,2,3);                    // spire 2
    p(-1,-38,CO,4,8); p(0,-37,GD2,2,6); p(0,-41,GD3,2,4);                       // center spire
    p( 3,-36,GD1,3,6); p( 3,-39,GD2,3,4); p( 4,-42,GD3,2,3);                    // spire 4
    p( 7,-34,GD1,3,4); p( 7,-37,GD2,3,3); p( 8,-39,GD3,2,2);                    // spire 5
    p(0,-44,WH,2,2);                                                            // stargem
    ctx.save(); ctx.globalAlpha = 0.60 + ep * 0.35;
    pUnit(ctx,cx,cy,0,-44+floatY,PR3,2,3,isLeft,S);
    ctx.restore();

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.62; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy,-20,-30+floatY,PR3,40,60,isLeft,S);
        ctx.restore();
    }
}

function drawWarden(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const bhP  = (Math.sin(now * 0.008) + 1) / 2;
    const CO='#000', ON1='#0A0A0A', ON2='#2C2C2C', ST='#455A64';
    const VP1='#3D0066', VP2='#6A0099', KR1='#8B0000', KR2='#CC0000', KG='#FFD700';

    // ── VOID AURA (dark-purple pulsing)
    ctx.save(); ctx.globalAlpha = 0.13 + bhP * 0.17;
    pUnit(ctx,cx,cy,-18,-30+idleY,VP2,36,64,isLeft,S);
    ctx.restore();

    // ── VOID CHAINS — 6 segmented links trailing from both arms
    for (let i=0; i<6; i++) {
        p(-22, -6+i*7, ON2, 3, 5);  p(-21, -5+i*7, ST,  2, 4);
        p( 15, -6+i*7, ON2, 3, 5);  p( 16, -5+i*7, ST,  2, 4);
    }

    // ── BOOTS — iron sabatons
    p(-12,22,CO,11,7);  p(-11,23,ON2,9,5);  p(-9,24,ST,4,3);   p(-12,28,ON1,11,1);
    p(  1,22,CO,11,7);  p(  2,23,ON2,9,5);  p( 2,24,ST,4,3);   p(  1,28,ON1,11,1);

    // ── MASSIVE LEG PLATES
    p(-12,7,CO,24,15);  p(-11,8,ON1,22,13);  p(-9,8,ON2,18,11);  p(-6,9,ST,12,9);
    p(-12,7,VP1,3,14);  p( 9,7,VP1,3,14);   // void-purple trim strips

    // ── BELT
    p(-12,1,CO,24,7);   p(-11,2,ON2,22,5);   p(-9,3,ST,14,3);

    // ── CHEST ARMOR — iron-riveted plate
    p(-12,-12,CO,24,20);  p(-11,-11,ON1,22,18);  p(-9,-11,ON2,18,16);  p(-6,-10,ST,12,12);
    for (let r=0; r<3; r++) { p(-9,-3+r*5,VP2,2,2);  p(7,-3+r*5,VP2,2,2); }  // rivets

    // ── BLACK HOLE VOID CORE (chest) — pulsing screen glow
    p(-5,0,CO,10,10);  p(-4,1,VP1,8,8);  p(-2,2,VP2,4,5);
    ctx.save(); ctx.globalCompositeOperation='screen'; ctx.globalAlpha=0.38+bhP*0.48;
    pUnit(ctx,cx,cy,-5,0+idleY,VP2,10,10,isLeft,S);
    ctx.restore();

    // ── MASSIVE PAULDRONS — riveted iron with void trim
    p(-18,-14,CO,7,8);  p(-17,-13,ON2,5,6);  p(-16,-12,ST,3,4);  p(-18,-14,VP1,2,3);
    p( 11,-14,CO,7,8);  p( 12,-13,ON2,5,6);  p( 12,-12,ST,3,4);  p( 11,-14,VP1,2,3);

    // ── ARMS — iron vambraces
    p(-17,-10,CO,5,22);  p(-16,-9,ON2,3,20);  p(-15,-8,ST,2,16);
    p( 12,-10,CO,5,22);  p( 13,-9,ON2,3,20);  p( 13,-8,ST,2,16);

    // ── IRON GREAT HELM — flat-topped, riveted brim
    p(-9,-30,CO,18,18);  p(-8,-29,ON1,16,16);  p(-7,-28,ON2,14,14);  p(-5,-27,ST,8,10);
    p(-10,-34,CO,20,5);  p(-9,-33,ON2,18,4);   // flat-topped brim
    p(-12,-35,VP1,24,2);  p(-11,-36,VP2,20,1); // void crest on brim

    // ── SINGLE BLOOD-RED EYE SLIT
    p(-7,-23,CO,14,4);
    p(-6,-22,isAtk?'#FF2222':KR2,12,3);

    // ── THE KEY — ornate (ring + shaft + 3 teeth), weapon hand side
    p(13,-22,CO,8,8);   p(14,-21,KG,6,6);    p(15,-20,ON2,4,4);   // ring
    p(16,-18,CO,3,22);  p(17,-17,KR1,2,20);  p(17,-17,KR2,1,18);  // shaft
    p(18,-12,CO,5,3);   p(19,-11,KR2,4,2);                         // top tooth
    p(18,-6,CO,5,3);    p(19,-5,KR2,4,2);                          // mid tooth
    p(18,0,CO,5,3);     p(19,1,KR2,4,2);                           // bot tooth
    p(18,-18,KG,3,2);   p(18,-14,KG,3,1);                          // shaft gold accents
}

function drawCursedTalisman(cx, cy, tower) {
    const area = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now = Date.now();
    const isAtk = (now - (tower.lastShot || 0)) < 400;
    const idleY = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const CO='#000000', SB='#0A0808', DB='#1A0808';
    const CR='#8B0000', MR='#B71C1C';
    const RF='#FF1744', PK='#FF4466';
    const GT='#C8A800', GD='#FFD700';
    const DP='#C8B898';
    // Aura: malevolent blood-red mist at feet
    ctx.save(); ctx.globalAlpha = 0.2 + Math.sin(now * 0.002) * 0.08;
    pUnit(ctx, cx, cy, 0, 6 + idleY, CR, 16, 6, isLeft, S); ctx.restore();
    // Back prop: massive cultist banner on pole
    const bx = isLeft ? 14 : -16;
    p(bx,   -42, CO,  4, 56);
    p(bx+1, -41, '#3A1208',  2, 54);
    p(bx+1, -42, CO, 14, 30);  p(bx+2, -41, MR, 12, 28);  p(bx+3, -40, CR, 10, 26);
    // Sinister eye emblem on banner cloth
    p(bx+5, -36, CO,  6,  8);  p(bx+6, -35, DP,  4,  6);
    p(bx+7, -33, RF,  2,  2);
    // Gold trim border at banner top
    p(bx+2, -42, CO, 12,  3);  p(bx+3, -41, GT, 10,  2);
    // Lower body: heavy blood-crimson vestments
    p(-7,  2, CO, 14, 14);  p(-6,  3, SB, 12, 12);  p(-5,  4, DB,  8, 10);
    p(-3,  4, CR,  4, 10);
    p(-6, 14, CO, 13,  3);  p(-5, 15, GT, 11,  2);  p(-4, 16, GD,  9,  1);
    // Upper torso vestments + gold-trimmed collar
    p(-6, -14, CO, 13, 17);  p(-5, -13, SB, 11, 15);  p(-4, -12, DB,  8, 13);
    p(-6, -14, CR,  3, 12);  p( 4, -14, CR,  3, 12);
    p(-6, -15, CO, 13,  3);  p(-5, -14, GT, 11,  2);  p(-4, -13, GD,  9,  1);
    // Arms
    p(-10, -11, CO,  5, 12);  p(-9, -10, SB,  4, 10);
    p(-10, -3,  CO,  5,  6);  p(-9,  -2, DB,  4,  5);
    p(  6, -11, CO,  5, 12);  p( 7, -10, SB,  4, 10);
    p(  6, -3,  CO,  5,  6);  p( 7,  -2, DB,  4,  5);
    // 3 levitating cursed scrolls (cos/sin orbit, dark parchment + blood-red text)
    const scAng = now * 0.0013;
    for (let i = 0; i < 3; i++) {
        const a = scAng + i * (Math.PI * 2 / 3);
        const sx = Math.cos(a) * 18, sy = Math.sin(a) * 9 - 10;
        p(sx - 1, sy - 2, CO,  6, 10);
        p(sx,     sy - 1, DP,  4,  8);
        p(sx,     sy + 1, RF,  4,  3);
        p(sx + 1, sy + 3, MR,  2,  2);
    }
    // Deep hooded cowl — face almost invisible inside
    p(-7, -30, CO, 15, 15);  p(-6, -29, SB, 13, 13);
    p(-6, -29, DB, 13,  6);
    p(-8, -31, CO, 16,  4);  p(-7, -30, '#120808', 14, 4);
    // 2 malevolent red eyes glowing in hood darkness
    p(-4, -24, CO,  3,  2);  p( 1, -24, CO,  3,  2);
    p(-3, -24, RF,  2,  2);  p( 2, -24, RF,  2,  2);
    ctx.save(); ctx.globalAlpha = 0.7; ctx.globalCompositeOperation = 'screen';
    pUnit(ctx, cx, cy, -3, -24 + idleY, PK, 4, 3, isLeft, S); ctx.restore();
    // Attack: scrolls converge, malevolent screen crimson burst
    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.65; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx, cx, cy, 0, -10 + idleY, RF, 44, 38, isLeft, S); ctx.restore();
    }
}

function drawAsura(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const muscle = Math.sin(now * 0.008) * 2;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY + muscle, col, w, h, isLeft, S);
    const ep = (Math.sin(now * 0.006) + 1) / 2;
    const CO='#000', BK='#1A0808';
    const RD0='#3D0000', RD1='#7A0000', RD2='#B71C1C', RD3='#D32F2F', RD4='#FF5252';
    const GD1='#9A6F00', GD2='#D4A500', GD3='#FFD700';
    const SK0='#5D1A1A', WH='#FFFFFF';

    // demonic aura
    ctx.save(); ctx.globalAlpha = 0.15 + ep * 0.20;
    pUnit(ctx,cx,cy,-22,-30+idleY,RD2,44,62,isLeft,S); ctx.restore();

    // ── BOOTS — armored sabatons, gold claws
    p(-12,22,CO,11,7); p(-11,23,RD1,9,5); p(-9,24,RD3,4,3); p(-12,28,RD0,11,1);
    p(  1,22,CO,11,7); p(  2,23,RD1,9,5); p( 2,24,RD3,4,3); p(  1,28,RD0,11,1);
    p(-12,22,GD2,11,1); p( 1,22,GD2,11,1);
    p(-11,28,GD3,2,2); p(-7,28,GD3,2,2); p(-3,28,GD3,2,2); p( 2,28,GD3,2,2); p(6,28,GD3,2,2); p(10,28,GD3,2,2);

    // ── LEG PLATES
    p(-12,7,CO,24,15); p(-11,8,RD1,22,13); p(-9,8,RD2,18,11); p(-6,9,RD3,12,9);
    p(-11,8,RD4,22,1);                                                           // highlight
    p(-12,7,GD2,3,14); p( 9,7,GD2,3,14);                                         // gold side strips

    // ── BELT (gold reinforced + skull buckle)
    p(-12,1,CO,24,7); p(-11,2,RD2,22,5); p(-9,3,RD3,14,3);
    p(-12,1,GD2,24,1); p(-12,6,GD1,24,1);
    p(-2,2,CO,4,4); p(-1,3,GD3,2,2);

    // ── CHEST (musculature + gold emblem)
    p(-12,-12,CO,24,20); p(-11,-11,RD1,22,18); p(-9,-11,RD2,18,16); p(-6,-10,RD3,12,12);
    p(-11,-11,RD4,22,1);
    p(-5,-11,RD0,2,16); p(3,-11,RD0,2,16);                                       // muscle def
    p(-3,-8,RD4,2,3); p(1,-8,RD4,2,3); p(-3,-1,RD4,2,3); p(1,-1,RD4,2,3);
    p(-4,-8,CO,8,8); p(-3,-7,GD2,6,6); p(-2,-6,GD3,4,4); p(-1,-5,RD3,2,2);       // gold emblem

    // ── MAIN PAULDRONS (spiked)
    p(-19,-16,CO,8,10); p(-18,-15,RD1,6,8); p(-17,-14,RD2,4,6); p(-18,-15,RD4,6,1);
    p(-21,-18,CO,3,4); p(-20,-17,GD2,1,3);
    p(-17,-18,CO,3,4); p(-16,-17,GD2,1,3);
    p( 11,-16,CO,8,10); p( 12,-15,RD1,6,8); p( 13,-14,RD2,4,6); p( 12,-15,RD4,6,1);
    p( 18,-18,CO,3,4); p( 19,-17,GD2,1,3);
    p( 14,-18,CO,3,4); p( 15,-17,GD2,1,3);

    // ── PRIMARY ARMS + gauntlets
    p(-17,-10,CO,5,18); p(-16,-9,RD2,3,16); p(-15,-8,RD3,2,12);
    p( 12,-10,CO,5,18); p( 13,-9,RD2,3,16); p( 13,-8,RD3,2,12);
    p(-17,8,CO,5,7); p(-16,9,RD1,3,5);
    p( 12,8,CO,5,7); p( 13,9,RD1,3,5);

    // ── SECONDARY ARMS (mid pair from shoulders)
    p(-22,-6,CO,6,5); p(-21,-5,RD2,4,3);
    p( 16,-6,CO,6,5); p( 17,-5,RD2,4,3);
    p(-26,-4,CO,5,4); p(-25,-3,RD3,3,2); p(-26,-4,GD2,1,4);
    p( 21,-4,CO,5,4); p( 22,-3,RD3,3,2); p( 25,-4,GD2,1,4);

    // ── TERTIARY ARMS (lower pair raised in mudra)
    p(-22, 4,CO,5,7); p(-21,5,RD2,3,5);
    p( 17, 4,CO,5,7); p( 18,5,RD2,3,5);
    p(-23, 9,CO,4,4); p(-22,10,RD3,2,2);
    p( 22, 9,CO,4,4); p( 23,10,RD3,2,2);

    // ── INFERNAL SCIMITAR (left side, golden edge)
    p(-21,-30,CO,5,40); p(-20,-29,BK,3,38); p(-20,-29,GD3,1,38);                 // blade w/ gold edge
    p(-23,-32,CO,9,5); p(-22,-31,GD2,7,3); p(-22,-31,GD3,7,1);                   // pommel
    p(-23,-10,CO,9,3); p(-22,-9,GD2,7,2);                                        // crossguard

    // ── VAJRA (right hand)
    p( 20,-22,CO,4,30); p( 21,-21,GD1,2,28);
    p( 18,-26,CO,8,6); p( 19,-25,GD2,6,4); p( 20,-24,GD3,4,2);
    p( 18,  4,CO,8,6); p( 19,  5,GD2,6,4);

    // ── NECK
    p(-3,-14,CO,6,2); p(-2,-13,SK0,4,1);

    // ── DEMON HEAD (fanged)
    p(-9,-30,CO,18,18); p(-8,-29,RD1,16,16); p(-7,-28,RD2,14,14); p(-5,-27,RD3,8,10);
    p(-8,-29,RD4,16,1);                                                          // highlight
    p(-5,-23,CO,4,3); p( 1,-23,CO,4,3);
    p(-4,-22,isAtk?WH:GD3,2,2); p( 2,-22,isAtk?WH:GD3,2,2);
    ctx.save(); ctx.globalAlpha = 0.60 + ep * 0.35;
    pUnit(ctx,cx,cy,-4,-22+idleY+muscle,GD3,2,2,isLeft,S);
    pUnit(ctx,cx,cy, 2,-22+idleY+muscle,GD3,2,2,isLeft,S);
    ctx.restore();
    p(-5,-17,WH,2,3); p(3,-17,WH,2,3);                                           // fangs
    p(-3,-17,RD0,6,2);                                                           // dark mouth

    // ── HORNED GOLD CROWN
    p(-9,-32,CO,18,4); p(-8,-31,GD1,16,3); p(-6,-30,GD2,12,2); p(-4,-30,GD3,8,1);
    p(-12,-36,CO,4,6); p(-11,-35,GD1,2,5); p(-11,-38,GD2,2,3); p(-10,-40,GD3,1,2);
    p(  8,-36,CO,4,6); p(  9,-35,GD1,2,5); p(  9,-38,GD2,2,3); p( 10,-40,GD3,1,2);
    p(-2,-36,CO,4,5); p(-1,-35,RD2,2,3); p(-1,-35,RD4,2,1);                      // center jewel
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.40;
    pUnit(ctx,cx,cy,-2,-36+idleY+muscle,RD3,4,3,isLeft,S);
    ctx.restore();

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.65; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy,-22,-30+idleY,RD4,44,60,isLeft,S);
        ctx.restore();
    }
}

function drawPiercingShadow(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.0018) * 3;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const pulse  = (Math.sin(now * 0.004) + 1) / 2;
    const orbit  = now * 0.0025;
    const CO='#000';
    const CL0='#0A0818', CL1='#180E2A', CL2='#2C1850', CL3='#442880', CL4='#6644A0';
    const SO1='#4400AA', SO2='#8833CC', SO3='#CC88FF';
    const NE1='#B0B0C8', NE2='#E8E8F8', NE3='#FFFFFF';

    // Shadow soul aura
    ctx.save(); ctx.globalAlpha = 0.18 + pulse * 0.22;
    pUnit(ctx, cx, cy, -16, -28+idleY, SO1, 32, 58, isLeft, S);
    ctx.restore();

    // ── SOUL WISPS (rising mist at feet, behind character) ──
    for (let i = 0; i < 4; i++) {
        const wy  = 20 - i * 5;
        const wox = Math.sin(now * 0.003 + i * 1.1) * 3;
        ctx.save(); ctx.globalAlpha = 0.30 + pulse * 0.22;
        pUnit(ctx, cx, cy, -2 + wox + i, wy + idleY, SO2, 2, 5, isLeft, S);
        ctx.restore();
    }

    // ── 5 FLOATING SHADOW NEEDLES (orbiting body) ──
    for (let i = 0; i < 5; i++) {
        const ang = orbit + (i * Math.PI * 2 / 5);
        const nx  = Math.cos(ang) * 14;
        const ny  = Math.sin(ang) * 8;
        pUnit(ctx, cx, cy, nx - 1, ny - 6 + idleY, CO,  3, 12, isLeft, S); // outline
        pUnit(ctx, cx, cy, nx,     ny - 5 + idleY, NE1, 1, 10, isLeft, S); // shaft dark
        pUnit(ctx, cx, cy, nx,     ny - 5 + idleY, NE2, 1,  8, isLeft, S); // shaft bright
        ctx.save(); ctx.globalAlpha = 0.70 + pulse * 0.25;
        pUnit(ctx, cx, cy, nx, ny - 6 + idleY, NE3, 1, 3, isLeft, S);      // tip glow
        ctx.restore();
    }
    if (isAtk) {
        for (let i = 0; i < 5; i++) {
            const ang = orbit + (i * Math.PI * 2 / 5);
            const nx  = Math.cos(ang) * 22; const ny = Math.sin(ang) * 13;
            ctx.save(); ctx.globalAlpha = 0.80;
            pUnit(ctx, cx, cy, nx - 1, ny - 4 + idleY, SO3, 3, 8, isLeft, S);
            ctx.restore();
        }
    }

    // ── BOOTS / CLOAK BASE ──
    p(-10, 22, CO,10,7); p(-9, 23,CL2,8,5); p(-7,24,CL3,4,3); p(-10,28,CL0,10,1);
    p(  0, 22, CO,10,7); p( 1, 23,CL2,8,5); p( 1,24,CL3,4,3); p(  0,28,CL0,10,1);

    // ── SWEEPING CLOAK BODY ──
    p(-12, 4,CO,24,22); p(-11, 5,CL0,22,20); p(-9, 5,CL1,18,18); p(-7, 6,CL2,14,16);
    p( -4, 7,CL3,8,14); p(-12,22,CL0,24,4); // hem shadow

    // ── TORSO ──
    p(-10,-12,CO,20,16); p(-9,-11,CL1,18,14); p(-7,-11,CL2,14,12); p(-5,-10,CL3,8,10); p(-3,-9,CL4,5,8);
    ctx.save(); ctx.globalAlpha = 0.44 + pulse * 0.40; // soul energy core at chest
    pUnit(ctx, cx, cy, -3, -5+idleY, SO3, 6, 8, isLeft, S);
    ctx.restore();

    // ── PAULDRONS (heavy cloak shoulder masses) ──
    p(-17,-16,CO,7,5); p(-16,-15,CL1,5,4); p(-15,-14,CL2,3,3);
    p( 10,-16,CO,7,5); p( 11,-15,CL1,5,4); p( 11,-14,CL2,3,3);

    // ── ARMS (hidden within cloak folds) ──
    p(-16,-12,CO,5,22); p(-15,-11,CL1,3,18); p(-14,-10,CL2,2,14);
    p( 11,-12,CO,5,22); p( 12,-11,CL1,3,18); p( 12,-10,CL2,2,14);
    p(12, 2,CO,5,5); p(13, 3,CL3,3,3); p(14, 4,SO3,2,2); // casting hand extended

    // ── DEEP HOOD (covers most of face, only eyes visible) ──
    p(-9,-32,CO,18,20); p(-8,-31,CL0,16,18); p(-7,-30,CL1,14,16); p(-5,-29,CL2,8,12);
    p(-7,-26,CL0,14,10); p(-6,-25,CO,10,8); // dark hood interior

    // ── GLOWING EYES (barely visible in shadow) ──
    p(-4,-22,SO2,2,2); p( 2,-22,SO2,2,2);
    p(-3,-21,isAtk?NE3:SO3,1,2); p(3,-21,isAtk?NE3:SO3,1,2);
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.38;
    pUnit(ctx, cx, cy, -5,-24+idleY, SO2, 4, 4, isLeft, S);
    pUnit(ctx, cx, cy,  1,-24+idleY, SO2, 4, 4, isLeft, S);
    ctx.restore();
}

function drawCocytus(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 500;
    const idleY  = Math.sin(now * 0.0018) * 3;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const icP  = (Math.sin(now * 0.005) + 1) / 2;
    const cryY = Math.sin(now * 0.002) * 8;
    const CO='#000', SK='#E8F0FF';
    const AB1='#1A237E', AB2='#283593', AB3='#3949AB';
    const IB1='#0288D1', IB2='#03A9F4', IB3='#B3E5FC';
    const FW1='#E1F5FE', FW2='#FFFFFF', IT='#00E5FF', GD='#FFD700';

    // ── FROST AURA
    ctx.save(); ctx.globalAlpha = 0.12 + icP * 0.16;
    pUnit(ctx,cx,cy,-16,-28+idleY,IB2,32,60,isLeft,S);
    ctx.restore();

    // ── ORBITING ICE CRYSTAL (floats above head, spinning/bobbing)
    p(-6,-46+cryY,CO,12,12);  p(-5,-45+cryY,IB1,10,10);  p(-4,-44+cryY,IB2,8,8);
    p(-3,-43+cryY,IB3,5,6);   p(-2,-42+cryY,FW1,3,4);    p(-1,-41+cryY,FW2,2,2);
    ctx.save(); ctx.globalAlpha = 0.55+icP*0.40;
    pUnit(ctx,cx,cy,-5,-45+cryY+idleY,IT,10,10,isLeft,S);
    ctx.restore();

    // ── BOOTS / ROBE HEM
    p(-11,22,CO,10,7);  p(-10,23,AB2,8,5);  p(-8,24,IB3,4,3);  p(-11,28,AB1,10,1);
    p(  1,22,CO,10,7);  p(  2,23,AB2,8,5);  p( 2,24,IB3,4,3);  p(  1,28,AB1,10,1);
    p(-11,28,IT,22,2);  // frost-teal toe trim

    // ── FLOWING ROBES (lower — wide, layered)
    p(-13,4,CO,26,22);   p(-12,5,AB1,24,20);  p(-10,5,AB2,20,18);
    p(-8,6,AB3,16,16);   p(-5,7,IB2,10,14);
    p(-13,22,FW1,26,3);  p(-12,23,FW2,20,2);  // frost sparkle hem

    // ── UPPER BODY + CHEST
    p(-11,-12,CO,22,18);  p(-10,-11,AB2,20,16);  p(-8,-11,AB3,16,14);
    p(-6,-10,IB2,10,12);  p(-4,-9,FW1,6,10);
    p(-11,-12,GD,2,16);   p( 9,-12,GD,2,16);     // gold robe edge

    // ── PAULDRONS — frost-edged
    p(-17,-14,CO,7,7);  p(-16,-13,AB3,5,5);  p(-15,-12,IB3,3,4);  p(-15,-12,FW1,2,2);
    p( 10,-14,CO,7,7);  p( 11,-13,AB3,5,5);  p( 11,-12,IB3,3,4);  p( 11,-12,FW1,2,2);

    // ── ARMS — flowing sleeves
    p(-16,-10,CO,5,22);  p(-15,-9,AB2,3,20);  p(-14,-9,IB3,2,14);
    p( 11,-10,CO,5,22);  p( 12,-9,AB2,3,20);  p( 12,-9,IB3,2,14);

    // ── ICE DRAGON SCEPTER — staff with sculpted dragon head (weapon hand)
    p(13,-30,CO,3,44);   p(14,-29,IB1,2,42);   // staff pole
    p(10,-34,CO,8,8);    p(11,-33,IB2,6,6);     p(12,-32,IB3,4,4);   p(13,-32,FW1,2,3); // dragon head
    p(9,-30,CO,4,4);     p(10,-29,IT,3,3);      // dragon snout/eye glow
    ctx.save(); ctx.globalAlpha=0.5+icP*0.44; pUnit(ctx,cx,cy,10,-29+idleY,IT,4,4,isLeft,S); ctx.restore();

    // ── FACE — pale white skin, ice-blue eyes
    p(-7,-28,CO,14,14);  p(-6,-27,SK,12,12);  p(-5,-26,FW1,8,8);  p(-4,-25,FW2,4,5);
    p(-4,-22,CO,2,2);  p(1,-22,CO,2,2);
    p(-3,-21,isAtk?FW2:IB2,1,2);  p(2,-21,isAtk?FW2:IB2,1,2);

    // ── CROWN OF ABSOLUTE ZERO — gold base ring + 5 ice spike protrusions
    p(-8,-30,CO,16,4);   p(-7,-29,GD,14,3);   p(-5,-28,IB3,10,2);  // base ring
    p(-7,-34,IB1,3,5);   p(-7,-38,IB2,2,4);   p(-7,-41,FW1,1,3);   // spike 1
    p(-3,-36,IB1,3,7);   p(-3,-40,IB2,2,5);   p(-3,-43,FW1,1,3);   // spike 2
    p( 0,-38,IB1,4,9);   p( 1,-43,IB2,2,7);   p( 1,-46,FW2,1,4);   // spike 3 (tallest)
    p( 4,-36,IB1,3,7);   p( 4,-40,IB2,2,5);   p( 4,-43,FW1,1,3);   // spike 4
    p( 7,-34,IB1,3,5);   p( 7,-38,IB2,2,4);   p( 7,-41,FW1,1,3);   // spike 5
    ctx.save(); ctx.globalAlpha = 0.55+icP*0.40;
    pUnit(ctx,cx,cy,1,-46+idleY,IT,3,5,isLeft,S);
    ctx.restore();
}

function drawPurgatory(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.0015) * 3.5;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const pulse  = (Math.sin(now * 0.004) + 1) / 2;
    const fPulse = (Math.sin(now * 0.009) + 1) / 2;
    const CO='#000';
    const W0='#B8A880', W1='#D8D0B8', W2='#F4EED8', W3='#FFFDF4';
    const F1='#A03000', F2='#E05500', F3='#FF8800', F4='#FFCC44', F5='#FFF8C0';
    const GL1='#906000', GL2='#D09800', GL3='#FFD700';
    const SK1='#D08060', SK2='#F0A880';

    // Holy purgatory fire aura
    ctx.save(); ctx.globalAlpha = 0.15 + pulse * 0.20;
    pUnit(ctx, cx, cy, -22, -28+idleY, F3, 44, 62, isLeft, S);
    ctx.restore();

    // ── WINGS OF HOLY FIRE (behind body, white-gold → orange tips) ──
    p(-23,-18,F1,9,28); p(-22,-16,F2,7,24); p(-21,-14,F3,5,20); p(-20,-12,F4,4,16); p(-19,-10,F5,3,12);
    p( 14,-18,F1,9,28); p( 15,-16,F2,7,24); p( 15,-14,F3,5,20); p( 15,-12,F4,4,16); p( 15,-10,F5,3,12);
    for (let i = 0; i < 4; i++) { // flame-feather notch details
        p(-22,-16+i*5,F4,2,3); p(-22,-14+i*5,F5,1,2);
        p( 14,-16+i*5,F4,2,3); p( 14,-14+i*5,F5,1,2);
    }
    ctx.save(); ctx.globalAlpha = 0.38 + fPulse * 0.40;
    pUnit(ctx, cx, cy, -20,-8+idleY,F5,4,14,isLeft,S);
    pUnit(ctx, cx, cy,  15,-8+idleY,F5,4,14,isLeft,S);
    ctx.restore();

    // ── TWIN FLOATING TORCH SCEPTERS (flanking body) ──
    const tL = -22, tR = 15;
    p(tL,  -20,CO, 3,28); p(tL+1,-19,GL2,1,26);                          // left handle
    p(tL-1,-24,CO, 5, 6); p(tL,  -23,F3,3,5); p(tL+1,-23,F4,2,4);       // left torch head
    p(tR,  -20,CO, 3,28); p(tR+1,-19,GL2,1,26);                          // right handle
    p(tR-1,-24,CO, 5, 6); p(tR,  -23,F3,3,5); p(tR+1,-23,F4,2,4);       // right torch head
    ctx.save(); ctx.globalAlpha = 0.50 + fPulse * 0.44;
    pUnit(ctx,cx,cy,tL-1,-27+idleY,F5,5,6,isLeft,S);
    pUnit(ctx,cx,cy,tR-1,-27+idleY,F5,5,6,isLeft,S);
    ctx.restore();

    // ── BOOTS (fire hem) ──
    p(-11,22,CO,10,7); p(-10,23,W1,8,5); p(-8,24,W2,4,3); p(-11,28,W0,10,1);
    p(  1,22,CO,10,7); p(  2,23,W1,8,5); p( 2,24,W2,4,3); p(  1,28,W0,10,1);
    p(-11,26,F2,10,2); p(-10,27,F3,8,1); p(1,26,F2,10,2); p(2,27,F3,8,1);

    // ── WHITE-IVORY ROBE (lower) ──
    p(-11,4,CO,22,22); p(-10,5,W0,20,20); p(-8,5,W1,16,18); p(-6,6,W2,12,16); p(-4,7,W3,8,14);
    p(-11,22,F2,22,2); p(-10,23,F3,20,1); p(-9,24,F4,18,1); // fire hem
    p(-11, 4,GL2,22,2); p(-9,5,GL3,18,1);                   // gold trim

    // ── CHEST / BODY ──
    p(-10,-12,CO,20,16); p(-9,-11,W0,18,14); p(-7,-11,W1,14,12); p(-5,-10,W2,10,10); p(-3,-9,W3,6,8);
    p(-1,-8,CO,2,10); p(-3,-4,CO,8,2);                          // holy fire cross outline
    p(-1,-7,F3,2,8); p(-2,-3,F3,6,2); p(0,-6,F4,1,5); p(-1,-3,F4,4,1); // cross fill

    // ── PAULDRONS ──
    p(-16,-16,CO,6,5); p(-15,-15,W1,4,4); p(-14,-14,W2,3,3); p(-14,-14,GL2,3,1);
    p( 10,-16,CO,6,5); p( 11,-15,W1,4,4); p( 11,-14,W2,3,3); p( 11,-14,GL2,3,1);

    // ── ARMS + GAUNTLETS ──
    p(-16,-12,CO,5,22); p(-15,-11,W0,3,20); p(-14,-11,W1,2,16);
    p( 11,-12,CO,5,22); p( 12,-11,W0,3,20); p( 12,-11,W1,2,16);
    p(-16,9,CO,5,7); p(-15,10,W1,3,5); p(-14,10,F3,2,3);
    p( 11,9,CO,5,7); p( 12,10,W1,3,5); p( 12,10,F3,2,3);

    // ── NECK ──
    p(-4,-14,CO,8,2); p(-3,-13,SK1,6,1);

    // ── NOBLE DIVINE HEAD ──
    p(-8,-30,CO,16,16); p(-7,-29,SK1,14,14); p(-6,-28,SK2,10,10); p(-4,-27,W2,5,6);
    p(-5,-23,CO,2,2); p(1,-23,CO,2,2);
    p(-4,-22,isAtk?F5:SK2,1,2); p(2,-22,isAtk?F5:SK2,1,2);

    // ── CROWN OF HOLY FLAMES (divine fire spikes upward — NOT horns) ──
    p(-7,-30,CO,14,3); p(-6,-29,GL1,12,2); p(-4,-29,GL2,8,1); // crown base ring
    p(-6,-34,F2,3,6); p(-6,-38,F3,2,4); p(-5,-41,F4,1,3);           // outer-left spike
    p(-3,-36,F2,3,7); p(-3,-40,F3,2,5); p(-3,-43,F4,1,3);           // inner-left spike
    p( 0,-38,F2,4,8); p( 0,-43,F3,3,5); p( 0,-46,F4,2,3); p(1,-48,F5,1,2); // center (tallest)
    p( 3,-36,F2,3,7); p( 3,-40,F3,2,5); p( 3,-43,F4,1,3);           // inner-right spike
    p( 6,-34,F2,3,6); p( 6,-38,F3,2,4); p( 6,-41,F4,1,3);           // outer-right spike
    ctx.save(); ctx.globalAlpha = 0.50 + fPulse * 0.44;
    pUnit(ctx,cx,cy,-1,-46+idleY,F5,6,6,isLeft,S);
    ctx.restore();

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.60; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy,-16,-22+idleY,F4,32,46,isLeft,S);
        ctx.restore();
    }
}

function drawReaper(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const driftX = Math.sin(now * 0.0015) * 2;
    const idleY  = Math.sin(now * 0.0018) * 3;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox + driftX, oy + idleY, col, w, h, isLeft, S);
    const ep    = (Math.sin(now * 0.005) + 1) / 2;
    const soulT = now * 0.003;
    const CO='#000';
    const BL0='#000000', BL1='#0A0A0A', BL2='#1A1A1A', BL3='#2C2C2C';
    const PR1='#3D0066', PR2='#6A0DAD', PR3='#9C27B0', PR4='#CE93D8';
    const ST='#B0BEC5', SH='#FAFAFA', WH='#FFFFFF';
    const GD2='#D4A500';

    // death aura
    ctx.save(); ctx.globalAlpha = 0.16 + ep * 0.22;
    pUnit(ctx,cx,cy,-20,-30+idleY,PR2,40,64,isLeft,S); ctx.restore();

    // ── FLOATING SOULS (5 orbiting wisps)
    for (let i=0; i<5; i++) {
        const a  = soulT + i * (Math.PI*2/5);
        const sx = Math.cos(a) * 22;
        const sy = Math.sin(a) * 14 - 10;
        ctx.save(); ctx.globalAlpha = 0.50 + ep * 0.30;
        pUnit(ctx,cx,cy,sx-1,sy+idleY,PR3,3,3,isLeft,S);
        pUnit(ctx,cx,cy,sx,sy+1+idleY,PR4,1,2,isLeft,S);
        ctx.restore();
    }

    // ── CLOAK HEM (sweeping, tattered)
    p(-13,4,CO,26,22); p(-12,5,BL0,24,20); p(-10,5,BL1,20,18); p(-7,6,BL2,14,16);
    p(-13,22,PR1,26,4); p(-11,24,PR2,22,2);                                      // purple hem glow
    p(-13,26,CO,3,3); p(-8,26,CO,2,3); p(-3,26,CO,3,3); p(2,26,CO,2,3); p(7,26,CO,3,3); p(11,26,CO,2,3);

    // ── BOOTS (barely visible)
    p(-10,22,CO,9,6); p(-9,23,BL1,7,4);
    p(  1,22,CO,9,6); p( 2,23,BL1,7,4);

    // ── TORSO (cloaked, purple void at chest)
    p(-11,-12,CO,22,18); p(-10,-11,BL0,20,16); p(-8,-11,BL1,16,14); p(-5,-10,BL2,10,12);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.40;
    pUnit(ctx,cx,cy,-4,-6+idleY,PR2,8,10,isLeft,S);
    ctx.restore();
    p(-3,-4,CO,6,6); p(-2,-3,PR1,4,4); p(-1,-2,PR3,2,2);

    // ── MASSIVE PAULDRONS (skeletal spikes)
    p(-18,-16,CO,8,9); p(-17,-15,BL1,6,7); p(-16,-14,BL2,4,5);
    p(-19,-19,CO,4,5); p(-18,-18,ST,2,3);
    p(-15,-19,CO,3,4); p(-14,-18,ST,1,2);
    p( 10,-16,CO,8,9); p( 11,-15,BL1,6,7); p( 12,-14,BL2,4,5);
    p( 15,-19,CO,4,5); p( 16,-18,ST,2,3);
    p( 12,-19,CO,3,4); p( 13,-18,ST,1,2);

    // ── ARMS w/ bone hands
    p(-17,-10,CO,5,20); p(-16,-9,BL1,3,18);
    p(-16,8,CO,4,4); p(-15,9,ST,2,2);
    p( 12,-10,CO,5,20); p( 13,-9,BL1,3,18);
    p( 13,8,CO,4,4); p( 14,9,ST,2,2);

    // ── THE GRAND SCYTHE (towering shaft + curved blade + cursed rune)
    p(-22,-44,CO,4,72); p(-21,-43,BL3,2,70); p(-21,-43,ST,1,70);                 // shaft + highlight
    p(-23, 28,CO,6,5); p(-22,29,BL3,4,3); p(-22,29,GD2,4,1);                    // counterweight
    p(-32,-48,CO,5,8); p(-31,-47,ST,3,6); p(-31,-47,SH,3,1);
    p(-36,-44,CO,6,8); p(-35,-43,ST,4,6); p(-35,-43,SH,4,1);
    p(-38,-38,CO,5,8); p(-37,-37,ST,3,6); p(-37,-37,SH,3,1);
    p(-36,-30,CO,4,6); p(-35,-29,ST,2,4); p(-35,-29,SH,2,1);
    p(-32,-44,CO,3,4); p(-31,-43,PR2,1,2);                                       // cursed rune
    ctx.save(); ctx.globalAlpha = 0.60 + ep * 0.35;
    pUnit(ctx,cx,cy,-32,-44+idleY,PR3,3,4,isLeft,S);
    ctx.restore();
    p(-22,-22,GD2,4,2); p(-22,-14,GD2,4,2);                                      // gold haft bindings
    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.70; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy,-38,-48+idleY,PR4,12,22,isLeft,S);
        ctx.restore();
    }

    // ── DEEP HOOD
    p(-10,-32,CO,20,22); p(-9,-31,BL0,18,20); p(-8,-30,BL1,16,18); p(-6,-29,BL2,10,14);
    p(-8,-30,BL3,16,1);                                                          // top highlight
    p(-11,-34,CO,22,4); p(-10,-33,BL2,20,3);                                     // hood brow
    p(-9,-22,BL0,18,8);                                                          // inner shadow

    // ── SKULL FACE (burning purple eye sockets)
    p(-6,-26,CO,12,10); p(-5,-25,ST,10,8); p(-4,-24,SH,8,6);
    p(-4,-23,CO,3,4); p( 1,-23,CO,3,4);
    p(-3,-22,isAtk?WH:PR2,1,2); p( 2,-22,isAtk?WH:PR2,1,2);
    ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
    pUnit(ctx,cx,cy,-4,-23+idleY,PR3,3,4,isLeft,S);
    pUnit(ctx,cx,cy, 1,-23+idleY,PR3,3,4,isLeft,S);
    ctx.restore();
    p(-1,-19,CO,2,2);                                                            // nasal cavity
    p(-4,-16,WH,8,2); p(-3,-15,CO,1,1); p(-1,-15,CO,1,1); p(1,-15,CO,1,1); p(3,-15,CO,1,1); // teeth
}

function drawDoomGuide(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const floatY = Math.sin(now * 0.0022) * 3;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + floatY, col, w, h, isLeft, S);
    const lnP = (Math.sin(now * 0.007) + 1) / 2;
    const CO='#000';
    const DT1='#263238', DT2='#37474F', DT3='#546E7A', TE='#1B5E20';
    const GW1='#B0BEC5', GW2='#CFD8DC';
    const LG1='#FF8F00', LG2='#FFD54F', LG3='#FFFF00';
    const PP1='#6A1B9A', PP2='#AB47BC';

    // ── GHOST AURA
    ctx.save(); ctx.globalAlpha = 0.10 + lnP * 0.12;
    pUnit(ctx,cx,cy,-16,-28+floatY,GW1,32,60,isLeft,S);
    ctx.restore();

    // ── GHOSTLY BOAT SILHOUETTE (faint background)
    ctx.save(); ctx.globalAlpha = 0.11;
    pUnit(ctx,cx,cy,-28,12+floatY,DT1,56,14,isLeft,S);  // hull
    pUnit(ctx,cx,cy, -2,-10+floatY,DT2, 2,26,isLeft,S);  // mast
    pUnit(ctx,cx,cy,-14, -8+floatY,DT1,24,12,isLeft,S);  // sail
    ctx.restore();

    // ── BOOTS (barely visible under robe)
    p(-10,22,CO,9,6);  p(-9,23,DT1,7,4);  p(-10,27,DT1,9,1);
    p(  1,22,CO,9,6);  p( 2,23,DT1,7,4);  p(  1,27,DT1,9,1);

    // ── FLOATING GHOSTLY ROBES (lower — wide flowing)
    p(-13,4,CO,26,24);   p(-12,5,TE,24,22);   p(-10,5,DT1,20,20);
    p(-8,6,DT2,16,18);   p(-6,7,DT3,10,16);
    p(-13,24,GW1,26,3);  p(-12,25,GW2,22,2);  // ghost mist hem

    // ── UPPER ROBE BODY
    p(-11,-12,CO,22,18);  p(-10,-11,TE,20,16);  p(-8,-11,DT1,16,14);
    p(-6,-10,DT2,10,12);  p(-4,-9,DT3,6,10);

    // ── PAULDRONS — draped hood shoulders
    p(-16,-12,CO,6,8);  p(-15,-11,DT1,4,6);  p(-14,-10,DT2,3,5);
    p( 10,-12,CO,6,8);  p( 11,-11,DT1,4,6);  p( 11,-10,DT2,3,5);

    // ── ARMS (hidden in robe folds)
    p(-15,-8,CO,4,20);  p(-14,-7,DT1,2,18);  p(-14,-7,DT2,1,14);
    p( 11,-8,CO,4,20);  p( 12,-7,DT1,2,18);  p( 12,-7,DT2,1,14);

    // ── PURIFICATION STAFF/ROD (off-hand, portal purple orb top)
    p(-16,-28,CO,3,36);   p(-15,-27,DT2,2,34);  // pole
    p(-18,-32,CO,5,5);    p(-17,-31,PP1,3,4);    p(-16,-30,PP2,2,3);  // orb top
    ctx.save(); ctx.globalAlpha=0.44+lnP*0.40;
    pUnit(ctx,cx,cy,-17,-31+floatY,PP2,4,6,isLeft,S);
    ctx.restore();

    // ── LANTERN (weapon hand — large 5×10 with pulsing glow)
    p(12,-9,CO,7,14);   p(13,-8,LG1,5,12);   p(14,-7,LG2,3,10);   // lantern body
    p(11,-11,CO,9,3);   p(11, 4,CO,9,3);      // top / bottom cap
    p(12,-9,CO,2,14);                          // center bar
    ctx.save(); ctx.globalAlpha=0.50+lnP*0.44;
    pUnit(ctx,cx,cy,13,-7+floatY,LG3,4,10,isLeft,S);
    ctx.restore();
    ctx.save(); ctx.globalCompositeOperation='screen'; ctx.globalAlpha=0.20+lnP*0.28;
    pUnit(ctx,cx,cy,8,-13+floatY,LG2,14,22,isLeft,S);
    ctx.restore();

    // ── DEEP HOOD (face fully hidden)
    p(-9,-30,CO,18,20);   p(-8,-29,DT1,16,18);  p(-7,-28,DT2,14,16);  p(-5,-27,DT3,8,12);
    p(-8,-24,CO,16,4);    p(-7,-23,DT1,14,3);   // upper hood brow
    p(-7,-22,DT1,14,12);  p(-6,-21,CO,10,10);   // dark hood interior

    // ── TWO GOLDEN EYES glowing in shadow
    p(-3,-18,LG1,2,2);  p(2,-18,LG1,2,2);
    ctx.save(); ctx.globalAlpha=0.60+lnP*0.36;
    pUnit(ctx,cx,cy,-4,-19+floatY,LG2,3,4,isLeft,S);
    pUnit(ctx,cx,cy, 1,-19+floatY,LG2,3,4,isLeft,S);
    ctx.restore();

    if (isAtk) {
        ctx.save(); ctx.globalAlpha=0.65; ctx.globalCompositeOperation='screen';
        pUnit(ctx,cx,cy,7,-13+floatY,LG3,18,24,isLeft,S);
        ctx.restore();
    }
}

function drawForsakenKing(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const capeFlut = Math.sin(now * 0.003) * 1.5;
    const idleY    = Math.sin(now * 0.0015) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep = (Math.sin(now * 0.004) + 1) / 2;
    const CO='#000';
    const PR0='#1A0033', PR1='#311B92', PR2='#4A148C', PR3='#6A1B9A', PR4='#9C27B0';
    const GD1='#9A6F00', GD2='#D4A500', GD3='#FFD700';
    const RD='#D32F2F', RDB='#FF6E6E';
    const ST='#9E9E9E', STH='#E0E0E0', GR='#00E676';                              // cursed green
    const SK='#E5C8A0', WH='#FFFFFF';

    // royal aura
    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.18;
    pUnit(ctx,cx,cy,-22,-30+idleY,PR3,44,64,isLeft,S); ctx.restore();

    // ── CAPE (flowing both sides, fluttering)
    p(-22,-12+capeFlut,CO,11,38); p(-21,-11+capeFlut,PR0,9,36); p(-20,-10+capeFlut,PR1,7,34); p(-19,-9+capeFlut,PR2,5,30);
    p(-21,-11+capeFlut,GD2,9,1);
    p( 11,-12-capeFlut,CO,11,38); p( 12,-11-capeFlut,PR0,9,36); p( 13,-10-capeFlut,PR1,7,34); p( 14,-9-capeFlut,PR2,5,30);
    p( 12,-11-capeFlut,GD2,9,1);
    p(-22,-12+capeFlut,GD1,1,38); p( 21,-12-capeFlut,GD1,1,38);                  // cape gold edges

    // ── BOOTS (royal armored)
    p(-12,22,CO,11,7); p(-11,23,PR1,9,5); p(-9,24,PR3,4,3); p(-12,28,PR0,11,1);
    p(  1,22,CO,11,7); p(  2,23,PR1,9,5); p( 2,24,PR3,4,3); p(  1,28,PR0,11,1);
    p(-12,22,GD2,11,1); p( 1,22,GD2,11,1);
    p(-7,28,GD3,2,2); p( 6,28,GD3,2,2);                                          // gold toe ornament

    // ── LEG PLATES
    p(-12,7,CO,24,15); p(-11,8,PR1,22,13); p(-9,8,PR2,18,11); p(-6,9,PR3,12,9);
    p(-11,8,PR4,22,1);                                                           // highlight
    p(-12,7,GD2,3,14); p( 9,7,GD2,3,14);

    // ── BELT (ruby buckle)
    p(-12,1,CO,24,7); p(-11,2,PR2,22,5); p(-9,3,PR3,14,3);
    p(-12,1,GD2,24,1); p(-12,6,GD1,24,1);
    p(-3,2,CO,6,5); p(-2,3,GD2,4,3); p(-1,4,RD,2,1);

    // ── CHEST (purple regalia + gold center)
    p(-12,-12,CO,24,20); p(-11,-11,PR1,22,18); p(-9,-11,PR2,18,16); p(-6,-10,PR3,12,12);
    p(-11,-11,PR4,22,1);                                                         // highlight
    p(-3,-11,CO,6,18); p(-2,-10,GD1,4,16); p(-2,-10,GD2,4,14); p(-1,-9,GD3,2,12); // gold central plate
    p(-2,-6,CO,4,5); p(-1,-5,RD,2,3); p(-1,-5,RDB,2,1);                          // royal ruby
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.35;
    pUnit(ctx,cx,cy,-2,-6+idleY,RD,4,5,isLeft,S);
    ctx.restore();

    // ── MASSIVE PAULDRONS (spiked, gold-trim)
    p(-19,-16,CO,8,9); p(-18,-15,PR2,6,7); p(-17,-14,PR3,4,5); p(-18,-15,PR4,6,1);
    p(-18,-15,GD2,6,1);
    p(-21,-19,CO,4,5); p(-20,-18,GD2,2,3); p(-20,-18,GD3,2,1);
    p( 11,-16,CO,8,9); p( 12,-15,PR2,6,7); p( 13,-14,PR3,4,5); p( 12,-15,PR4,6,1);
    p( 12,-15,GD2,6,1);
    p( 17,-19,CO,4,5); p( 18,-18,GD2,2,3); p( 18,-18,GD3,2,1);

    // ── ARMS w/ gauntlets
    p(-17,-10,CO,5,20); p(-16,-9,PR2,3,18); p(-15,-8,PR3,2,14); p(-16,-9,PR4,3,1);
    p( 12,-10,CO,5,20); p( 13,-9,PR2,3,18); p( 13,-8,PR3,2,14); p( 13,-9,PR4,3,1);
    p(-17,8,CO,5,7); p(-16,9,GD1,3,5); p(-16,9,GD2,3,1);
    p( 12,8,CO,5,7); p( 13,9,GD1,3,5); p( 13,9,GD2,3,1);

    // ── THE FORSAKEN BLADE (greatsword, cursed-green runic glow)
    p(16,-36,CO,6,68); p(17,-35,ST,4,66); p(17,-35,STH,2,66);                    // blade + highlight
    p(17,-30,GR,4,1); p(17,-22,GR,4,1); p(17,-14,GR,4,1); p(17,-6,GR,4,1);       // runic notches
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.40;
    pUnit(ctx,cx,cy,16,-36+idleY,GR,6,68,isLeft,S);
    ctx.restore();
    p(13,-4,CO,12,4); p(14,-3,GD1,10,2); p(14,-3,GD2,10,1);                      // crossguard
    p(17, 0,CO,4,5); p(18, 1,GD2,2,3); p(18, 1,GD3,2,1); p(18, 2,RD,2,1);        // pommel + gem

    // ── NECK
    p(-3,-14,CO,6,2); p(-2,-13,SK,4,1);

    // ── ROYAL HEAD (regal face, purple cursed eyes, white beard)
    p(-9,-30,CO,18,18); p(-8,-29,SK,16,16); p(-6,-27,'#F5DDC7',12,12);
    p(-5,-23,CO,3,3); p( 2,-23,CO,3,3);
    p(-4,-22,isAtk?WH:PR4,1,2); p( 3,-22,isAtk?WH:PR4,1,2);
    ctx.save(); ctx.globalAlpha = 0.60 + ep * 0.30;
    pUnit(ctx,cx,cy,-5,-23+idleY,PR4,3,3,isLeft,S);
    pUnit(ctx,cx,cy, 2,-23+idleY,PR4,3,3,isLeft,S);
    ctx.restore();
    p(-5,-17,STH,10,4); p(-4,-13,STH,8,2);                                       // white beard
    p(-3,-17,CO,6,2);                                                            // mouth shadow

    // ── HIGH CROWN (5-spire gold with rubies)
    p(-10,-32,CO,20,4); p(-9,-31,GD1,18,3); p(-7,-30,GD2,14,2); p(-5,-30,GD3,10,1);
    p(-10,-36,CO,3,4); p(-9,-35,GD2,1,3); p(-9,-37,RD,1,2);
    p(-6,-38,CO,3,6); p(-5,-37,GD2,1,5); p(-5,-39,RD,1,2);
    p(-2,-40,CO,4,8); p(-1,-39,GD2,2,7); p(-1,-42,GD3,2,3); p( 0,-44,RD,1,2);    // center spire
    p( 3,-38,CO,3,6); p( 4,-37,GD2,1,5); p( 4,-39,RD,1,2);
    p( 7,-36,CO,3,4); p( 8,-35,GD2,1,3); p( 8,-37,RD,1,2);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.35;
    pUnit(ctx,cx,cy,0,-44+idleY,RD,1,3,isLeft,S);
    ctx.restore();

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.65; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy,-22,-30+idleY,GR,44,60,isLeft,S);
        ctx.restore();
    }
}

function drawVoidGatekeeper(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.0015) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep = (Math.sin(now * 0.004) + 1) / 2;
    const sw = now * 0.002;
    const CO='#000';
    const ST1='#1A1F22', ST2='#263238', ST3='#37474F', ST4='#546E7A', ST5='#90A4AE';
    const CY1='#005C7A', CY2='#0277BD', CY3='#0288D1', CY4='#00E5FF', CY5='#B3E5FC';
    const GD2='#D4A500', GD3='#FFD700';

    // void portal aura
    ctx.save(); ctx.globalAlpha = 0.16 + ep * 0.24;
    pUnit(ctx,cx,cy,-22,-30+idleY,CY3,44,64,isLeft,S); ctx.restore();

    // ── GUARDIAN STATUES (flanking small protectors)
    p(-26,4,CO,7,22); p(-25,5,ST2,5,20); p(-25,5,ST3,5,1);                       // L body
    p(-25,2,CO,5,4); p(-24,3,ST3,3,3);                                           // L head
    p(-25,9,GD2,5,1); p(-25,15,GD2,5,1);                                         // gold bands
    p( 19,4,CO,7,22); p( 20,5,ST2,5,20); p( 20,5,ST3,5,1);                       // R body
    p( 20,2,CO,5,4); p( 21,3,ST3,3,3);
    p( 20,9,GD2,5,1); p( 20,15,GD2,5,1);

    // ── GATE FRAME (massive — outer arch)
    p(-19,-12,CO,38,42);
    p(-18,-11,ST1,36,40); p(-17,-10,ST2,34,38); p(-16,-9,ST3,32,36);
    p(-18,-11,ST5,36,1);                                                         // top highlight
    p(-19,-16,CO,38,5); p(-18,-15,ST2,36,4); p(-17,-14,ST3,34,3); p(-15,-13,ST4,30,2);
    p(-19,-16,GD2,38,1);                                                         // gold arch cap

    // ── GATE INTERIOR (swirling void portal)
    p(-14,-8,CO,28,34);                                                          // dark backdrop
    ctx.save(); ctx.globalAlpha = 0.50 + ep * 0.35;
    pUnit(ctx,cx,cy,-13,-7+idleY,CY1,26,32,isLeft,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.45 + ep * 0.30;
    pUnit(ctx,cx,cy,-11,-5+idleY,CY2,22,28,isLeft,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.40 + ep * 0.35;
    pUnit(ctx,cx,cy,-9,-3+idleY,CY3,18,24,isLeft,S);
    ctx.restore();
    // Swirling vortex (3 orbiting bright points)
    for (let i=0; i<3; i++) {
        const a  = sw + i * (Math.PI * 2 / 3);
        const vx = Math.cos(a) * 7;
        const vy = Math.sin(a) * 9 + 4;
        ctx.save(); ctx.globalAlpha = 0.65;
        pUnit(ctx,cx,cy,vx-1,vy+idleY,CY4,3,3,isLeft,S);
        ctx.restore();
    }
    // Center bright core
    p(-2,2,CO,4,4); p(-1,3,CY4,2,2);
    ctx.save(); ctx.globalAlpha = 0.70 + ep * 0.25;
    pUnit(ctx,cx,cy,-2,2+idleY,CY5,4,4,isLeft,S);
    ctx.restore();

    // ── GATE RUNIC PILLARS (3 gold runes each side of frame)
    for (let r=0; r<3; r++) {
        p(-19,-6+r*10,GD2,2,4); p(-19,-5+r*10,GD3,2,2);
        p( 17,-6+r*10,GD2,2,4); p( 17,-5+r*10,GD3,2,2);
    }

    // ── FLOATING EYE OF THE GATE (above portal core)
    p(-5,-22,CO,10,7); p(-4,-21,'#FFFFFF',8,5);
    p(-2,-20,CO,4,4); p(-1,-19,CY3,2,2); p(0,-19,CO,1,1);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.40;
    pUnit(ctx,cx,cy,-2,-20+idleY,CY4,4,4,isLeft,S);
    ctx.restore();
    if (isAtk) p(0,-19,'#FFFFFF',1,1);

    // ── GATEKEEPER HEAD (atop the frame, horned helm)
    p(-10,-34,CO,20,18); p(-9,-33,ST1,18,16); p(-8,-32,ST2,16,14); p(-6,-31,ST3,10,10);
    p(-9,-33,ST4,18,1);                                                          // highlight
    p(-12,-38,CO,4,6); p(-11,-37,ST3,2,5); p(-11,-39,GD2,2,2);                   // horn L
    p(  8,-38,CO,4,6); p(  9,-37,ST3,2,5); p(  9,-39,GD2,2,2);                   // horn R
    p(-10,-36,CO,20,4); p(-9,-35,ST2,18,3); p(-9,-35,GD2,18,1);                  // brow band
    p(-8,-27,CO,16,4); p(-7,-26,isAtk?CY5:CY3,14,3);                             // visor slit
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.40;
    pUnit(ctx,cx,cy,-7,-26+idleY,CY4,14,3,isLeft,S);
    ctx.restore();
    p(-12,-26,CO,4,4); p(-11,-25,ST3,2,2);                                       // L mandible
    p(  8,-26,CO,4,4); p(  9,-25,ST3,2,2);                                       // R mandible

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.72; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy,-14,-8+idleY,CY5,28,34,isLeft,S);
        ctx.restore();
    }
}

function drawEternalWall(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const shake  = Math.sin(now * 0.1) * 0.5;
    const isAtk  = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.0018) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const pulse  = (Math.sin(now * 0.004) + 1) / 2;
    const CO='#000', ST0='#181826', ST1='#2C2C42', ST2='#484860', ST3='#6A6A88', ST4='#9898B4', ST5='#C0C0D8';
    const GL1='#806000', GL2='#C09400', GL3='#FFD700';
    const BL2='#003088', BL3='#0066CC', BL4='#44AAFF';
    const SK='#B08060';

    // Shield divine aura (left-side glow)
    ctx.save(); ctx.globalAlpha = 0.14 + pulse * 0.18;
    pUnit(ctx, cx, cy, -30, -34+idleY, BL3, 16, 56, isLeft, S);
    ctx.restore();

    // ── TOWER SHIELD — dominant left-arm element (12 wide × 52 tall) ──
    // 3 battlements (castle merlons) at very top
    p(-28+shake,-38,CO, 4,4); p(-23+shake,-38,CO,4,4); p(-18+shake,-38,CO,4,4);
    p(-27+shake,-37,ST2,2,3); p(-22+shake,-37,ST2,2,3); p(-17+shake,-37,ST2,2,3);
    // Shield main stone block
    p(-29+shake,-34,CO,14,52);
    p(-28+shake,-33,ST0,12,50); p(-27+shake,-32,ST1,10,46); p(-26+shake,-30,ST2,8,40); p(-25+shake,-28,ST3,6,34);
    p(-25+shake,-26,ST4,4,28); // top-left highlight band
    // Horizontal brick lines (6 rows of stone texture)
    for (let bi = 0; bi < 6; bi++) {
        p(-28+shake,-22+bi*8,ST0,12,1);
        p(-28+shake,-21+bi*8,ST2,12,1);
    }
    // Gold trim edges
    p(-29+shake,-34,GL1,2,52); p(-16+shake,-34,GL1,2,52);
    p(-29+shake,-33,GL2,1,50); p(-17+shake,-33,GL2,1,50);
    // Divine blue cross rune (center of shield)
    p(-23+shake,-16,BL2,2,14); p(-27+shake,-10,BL2,10,2);
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.42;
    pUnit(ctx,cx,cy,-23+shake,-16+idleY,BL4,2,14,isLeft,S);
    pUnit(ctx,cx,cy,-27+shake,-10+idleY,BL4,10, 2,isLeft,S);
    ctx.restore();
    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.72; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy,-29+shake,-20+idleY,BL4,14,30,isLeft,S);
        ctx.restore();
    }

    // ── BOOTS ──
    p(-12,22,CO,10,7); p(-11,23,ST2,8,5); p(-9,24,ST3,4,3); p(-12,28,ST1,10,1);
    p(  2,22,CO,10,7); p(  3,23,ST2,8,5); p( 3,24,ST3,4,3); p(  2,28,ST1,10,1);

    // ── LEGS ──
    p(-11,8,CO,22,14); p(-10,9,ST1,20,12); p(-8,9,ST2,16,10); p(-6,10,ST3,12,8);
    p(-11,12,GL2,22,2); p(-11,18,GL2,22,2); // knee/shin gold bands

    // ── BODY (stone plate + horizontal gold castle-wall trim bands) ──
    p(-11,-12,CO,22,20); p(-10,-11,ST1,20,18); p(-8,-11,ST2,16,16); p(-6,-10,ST3,10,12); p(-4,-9,ST4,6,10);
    p(-7,-9,ST5,4,6);                                    // top-left highlight
    p(-11,-4,GL2,22,2); p(-11,2,GL2,22,2); p(-11,-10,GL1,22,1); // gold bands

    // ── BELT ──
    p(-11,4,CO,22,4); p(-10,5,GL1,20,2); p(-8,5,GL2,14,1);

    // ── LEFT PAULDRON ──
    p(-18,-16,CO,8,5); p(-17,-15,ST2,6,4); p(-16,-14,ST3,4,3); p(-17,-13,GL2,6,1);

    // ── RIGHT PAULDRON ──
    p( 10,-16,CO,8,5); p( 11,-15,ST2,6,4); p( 11,-14,ST3,4,3); p( 11,-13,GL2,6,1);

    // ── LEFT ARM (shield arm) ──
    p(-17,-12,CO,6,22); p(-16,-11,ST1,4,20); p(-15,-11,ST2,3,16);
    p(-17,  9,CO,6, 7); p(-16, 10,ST2,4, 5); p(-15,10,ST3,3,3); // gauntlet

    // ── RIGHT ARM ──
    p( 11,-12,CO,6,22); p( 12,-11,ST1,4,20); p( 12,-11,ST2,3,16);
    p( 11,  9,CO,6, 7); p( 12, 10,ST2,4, 5); p( 12,10,ST3,3,3); // gauntlet

    // ── WARHAMMER (right hand — handle 3 wide, head 8×8) ──
    p(17, -4,CO, 3,22); p(18,-3,GL1,1,20); // handle shaft
    p(12,-14,CO,12, 9); p(13,-13,ST2,10,7); p(14,-12,ST3,7,5); p(12,-12,ST4,2,7); // head
    p(12,-14,GL1,12,1); p(23,-14,GL1,1,9); // gold trim on hammer head
    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.65;
        pUnit(ctx,cx,cy,11,-16+idleY,GL3,14,12,isLeft,S);
        ctx.restore();
    }

    // ── NECK ──
    p(-4,-14,CO,8,2); p(-3,-13,SK,6,1);

    // ── GREAT HELM (wide, castle parapet — 3 battlements on top) ──
    p(-8,-36,CO,4,5); p(-3,-36,CO,4,5); p( 2,-36,CO,4,5); // battlement outlines
    p(-7,-35,ST2,2,4); p(-2,-35,ST2,2,4); p( 3,-35,ST2,2,4); // merlon fills
    p(-9,-32,CO,18,18);                                         // helm outline
    p(-8,-31,ST1,16,16); p(-7,-30,ST2,14,14); p(-5,-29,ST3,10,12); p(-4,-28,ST4,6,10);
    p(-7,-31,ST5,5,4); p(-8,-30,ST5,2,6);                      // top-left highlight
    p(-9,-32,GL2,2,18); p(7,-32,GL2,2,18); p(-8,-14,GL2,16,1); // gold trim
    p(-7,-22,CO,14,3); p(-6,-21,isAtk?BL4:ST4,12,2);           // visor slit
}

window.drawTransmuter = drawTransmuter;
window.drawOracle = drawOracle;
window.drawWarden = drawWarden;
window.drawCursedTalisman = drawCursedTalisman;
window.drawAsura = drawAsura;
window.drawPiercingShadow = drawPiercingShadow;
window.drawCocytus = drawCocytus;
window.drawPurgatory = drawPurgatory;
window.drawReaper = drawReaper;
window.drawDoomGuide = drawDoomGuide;
window.drawForsakenKing = drawForsakenKing;
window.drawVoidGatekeeper = drawVoidGatekeeper;
window.drawEternalWall = drawEternalWall;

/* ══════════════════════════════ NOVICE EXORCIST EXCLUSIVE T4 ════════════ */

/* ── WORD OF GOD (신의 말씀) — ultimate scripture: towering white angel ── */
function drawWordOfGod(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 500;
    const idleY  = Math.sin(now * 0.0015) * 3;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const pulse  = (Math.sin(now * 0.003) + 1) / 2;
    const pulse2 = (Math.sin(now * 0.007) + 1) / 2;
    const wFlut  = Math.sin(now * 0.005) * 1.5;
    const CO='#000', W0='#B8A880', W1='#E0D8C0', W2='#F4F0E8', W3='#FFFFFF';
    const G1='#A07800', G2='#FFD700', G3='#FFF8A0';
    const G4=`rgba(255,240,100,${0.55+pulse*0.35})`;
    const SK='#D4A880';

    // Massive divine radiance aura
    ctx.save(); ctx.globalAlpha = 0.20 + pulse * 0.22;
    pUnit(ctx,cx,cy,-22,-30+idleY,G2,44,66,isLeft,S);
    ctx.restore();
    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.65; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy,-24,-32+idleY,'#FFFFFF',48,72,isLeft,S);
        ctx.restore();
    }

    // ── ANGEL WINGS (feathered, 3–4 rows, behind body) ──
    // Left wing: back-most row → front, with flutter offset
    p(-18,-18,W0,10,26+wFlut); p(-17,-16,W1,7,22+wFlut); p(-16,-14,W2,5,18+wFlut); p(-15,-12,W3,3,14+wFlut);
    for (let i = 0; i < 4; i++) { p(-18,-16+i*4,CO,1,4); p(-17,-14+i*4,CO,1,3); } // feather separators
    // Right wing
    p(  8,-18,W0,10,26-wFlut); p(  9,-16,W1,7,22-wFlut); p( 10,-14,W2,5,18-wFlut); p( 11,-12,W3,3,14-wFlut);
    for (let i = 0; i < 4; i++) { p(10,-16+i*4,CO,1,4); p(11,-14+i*4,CO,1,3); }
    ctx.save(); ctx.globalAlpha = 0.32 + pulse * 0.26; // wing tip glow
    pUnit(ctx,cx,cy,-16,-8+idleY,G3,4,12,isLeft,S);
    pUnit(ctx,cx,cy, 11,-8+idleY,G3,4,12,isLeft,S);
    ctx.restore();

    // ── BOOTS ──
    p(-11,22,CO,10,7); p(-10,23,W1,8,5); p(-8,24,W2,4,3); p(-11,28,W0,10,1);
    p(  1,22,CO,10,7); p(  2,23,W1,8,5); p( 2,24,W2,4,3); p(  1,28,W0,10,1);
    p(-11,28,G2,22,1); // gold toe trim

    // ── ROBE (lower) ──
    p(-11,4,CO,22,22); p(-10,5,W0,20,20); p(-8,5,W1,16,18); p(-6,6,W2,12,16); p(-4,7,W3,8,14);
    p(-11,22,G2,22,2); p(-9,23,G3,18,1); // gold hem

    // ── GOLD BREASTPLATE ──
    p(-10,-12,CO,20,16); p(-9,-11,G1,18,14); p(-7,-11,G2,14,12); p(-5,-10,G3,10,10); p(-3,-9,W2,4,8);
    p(-1,-8,CO,2,10); p(-3,-4,CO,8,2);                      // cross outline
    p(-1,-7,G2,2,8); p(-2,-3,G2,6,2); p(0,-7,G3,1,4); p(-1,-3,G3,4,1); // cross fill

    // ── PAULDRONS ──
    p(-16,-16,CO,7,10); p(-15,-15,G1,5,8); p(-14,-14,G2,4,6); p(-14,-13,G3,3,4);
    p(  9,-16,CO,7,10); p( 10,-15,G1,5,8); p( 10,-14,G2,4,6); p( 10,-13,G3,3,4);

    // ── ARMS + GAUNTLETS ──
    p(-16,-6,CO,5,16); p(-15,-5,W1,3,14); p(-14,-5,W2,2,10);
    p( 11,-6,CO,5,16); p( 12,-5,W1,3,14); p( 12,-5,W2,2,10);
    p(-16,9,CO,5,7); p(-15,10,G1,3,5); p(-14,10,G2,2,3);
    p( 11,9,CO,5,7); p( 12,10,G1,3,5); p( 12,10,G2,2,3);

    // ── MASSIVE FLOATING SCRIPTURE TABLET (14×20, floats higher than body) ──
    const bx = isLeft ? -28 : 14;
    p(bx,  -34,CO,14,22);                                   // tablet outline
    p(bx+1,-33,G1,12,20); p(bx+1,-32,G2,11,18); p(bx+2,-31,G3,9,16); // cover layers
    p(bx+2,-31,W1,2,16);                                    // spine edge
    p(bx+4,-31,W2,5,16);                                    // pages
    for (let tl = 0; tl < 6; tl++) { p(bx+4,-30+tl*2,W3,4,1); } // divine text lines
    p(bx+12,-33,G1,2,20); p(bx+1,-33,G3,1,18);             // cover strip + spine highlight
    ctx.save(); ctx.globalAlpha = 0.58 + pulse2 * 0.38;
    pUnit(ctx,cx,cy,bx+1,-32+idleY,G3,12,18,isLeft,S);
    ctx.restore();
    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.78; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy,bx,-36+idleY,G3,16,26,isLeft,S);
        ctx.restore();
    }

    // ── DIVINE HEAD ──
    p(-8,-28,CO,16,14); p(-7,-27,SK,14,12); p(-5,-26,W1,8,8); p(-4,-25,W2,6,6);
    p(-5,-22,CO,2,2); p(1,-22,CO,2,2);
    p(-4,-21,isAtk?W3:G2,1,2); p(2,-21,isAtk?W3:G2,1,2);

    // ── TALL DIVINE CROWN (3 golden spires) ──
    p(-7,-30,CO,14,4); p(-6,-29,G1,12,3); p(-4,-28,G2,8,2); p(-2,-28,G3,4,1); // crown base
    p(-6,-34,CO,4,6); p(-5,-33,G1,2,5); p(-4,-32,G2,2,4); p(-4,-36,G3,2,3);   // left spire
    p(-1,-36,CO,4,8); p( 0,-35,G1,2,7); p( 0,-34,G2,2,6); p( 0,-38,G3,2,4);   // center spire (tallest)
    p( 4,-34,CO,4,6); p( 5,-33,G1,2,5); p( 5,-32,G2,2,4); p( 5,-36,G3,2,3);   // right spire
    p(-4,-36,W3,2,1); p(0,-38,W3,2,1); p(5,-36,W3,2,1);                        // crown jewel tips

    // ── MASSIVE HALO (golden oval rings, pulsing above head) ──
    ctx.save(); ctx.globalAlpha = 0.72 + pulse * 0.22;
    pUnit(ctx,cx,cy,-14,-42+idleY,G2,28,6,isLeft,S);
    pUnit(ctx,cx,cy,-16,-40+idleY,G2,32,4,isLeft,S);
    pUnit(ctx,cx,cy,-12,-44+idleY,G2,24,4,isLeft,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.48 + pulse2 * 0.32;
    pUnit(ctx,cx,cy,-12,-43+idleY,G3,24,4,isLeft,S);
    pUnit(ctx,cx,cy,-14,-41+idleY,G3,28,3,isLeft,S);
    ctx.restore();
}

/* ── GENESIS STRIKE (천지창조의 왕 - King of Genesis) — cosmic emperor, multicolour radiance ─ */
function drawGenesisStrike(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 500;
    const idleY  = Math.sin(now * 0.0018) * 3;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const p1 = (Math.sin(now * 0.004) + 1) / 2;
    const p2 = (Math.sin(now * 0.0071) + 1) / 2;
    const p3 = (Math.sin(now * 0.011) + 1) / 2;
    const CO='#050005', SK='#D4A075';
    const AR1='#1A0033', AR2='#330066', AR3='#660099', AR4='#AA22CC';
    const G2='#FFD700', G3='#FFF8A0';
    const CR=`rgba(255,100,200,${0.5+p1*0.4})`;
    const CB=`rgba(100,200,255,${0.4+p2*0.4})`;
    const CG=`rgba(255,200,50,${0.5+p3*0.4})`;

    // ── COSMIC AURA (three cycling color layers)
    ctx.save(); ctx.globalAlpha=0.14+p1*0.14; pUnit(ctx,cx,cy,-20,-28+idleY,CR,40,64,isLeft,S); ctx.restore();
    ctx.save(); ctx.globalAlpha=0.12+p2*0.14; pUnit(ctx,cx,cy,-20,-28+idleY,CB,40,64,isLeft,S); ctx.restore();
    ctx.save(); ctx.globalAlpha=0.12+p3*0.14; pUnit(ctx,cx,cy,-20,-28+idleY,CG,40,64,isLeft,S); ctx.restore();

    // ── WINGS OF CREATION ENERGY (translucent all-spectrum, behind body)
    p(-22,-18,AR1,10,28);  p(-23,-16,AR2,7,24);  p(-24,-14,AR3,5,20);
    p( 12,-18,AR1,10,28);  p( 13,-16,AR2,7,24);  p( 14,-14,AR3,5,20);
    ctx.save(); ctx.globalAlpha=0.38+p1*0.30;
    pUnit(ctx,cx,cy,-22,-16+idleY,CR,7,20,isLeft,S);  pUnit(ctx,cx,cy,12,-16+idleY,CR,7,20,isLeft,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha=0.28+p2*0.26;
    pUnit(ctx,cx,cy,-23,-14+idleY,CB,5,16,isLeft,S);  pUnit(ctx,cx,cy,13,-14+idleY,CB,5,16,isLeft,S);
    ctx.restore();

    // ── BOOTS — cosmic-edged
    p(-12,22,CO,11,7);  p(-11,23,AR2,9,5);  p(-9,24,AR3,4,3);  p(-12,28,AR1,11,1);
    p(  1,22,CO,11,7);  p(  2,23,AR2,9,5);  p( 2,24,AR3,4,3);  p(  1,28,AR1,11,1);
    p(-12,28,G2,24,1);  // gold toe trim

    // ── COSMIC ROBES (lower — shifting color)
    p(-12,4,CO,24,22);    p(-11,5,AR1,22,20);  p(-9,5,AR2,18,18);  p(-7,6,AR3,14,16);  p(-4,7,AR4,8,14);
    ctx.save(); ctx.globalAlpha=0.30+p1*0.26; pUnit(ctx,cx,cy,-7,6+idleY,CR,14,16,isLeft,S); ctx.restore();
    p(-12,22,G2,24,2);  p(-10,23,G3,18,1);    // gold hem

    // ── CHEST — cosmic breastplate with shifting energy core
    p(-11,-12,CO,22,18);  p(-10,-11,AR2,20,16);  p(-8,-11,AR3,16,14);  p(-6,-10,AR4,10,12);
    ctx.save(); ctx.globalAlpha=0.50+p3*0.30; pUnit(ctx,cx,cy,-6,-10+idleY,CG,10,12,isLeft,S); ctx.restore();
    p(-11,-12,G2,2,16);  p( 9,-12,G2,2,16);    // gold trim edges

    // ── PAULDRONS — grand, cosmos-edged
    p(-18,-16,CO,8,8);  p(-17,-15,AR2,6,6);  p(-16,-14,AR3,4,5);  p(-16,-14,G2,2,2);
    p( 10,-16,CO,8,8);  p( 11,-15,AR2,6,6);  p( 11,-14,AR3,4,5);  p( 11,-14,G2,2,2);

    // ── ARMS — cosmic vambraces
    p(-17,-10,CO,5,22);  p(-16,-9,AR2,3,20);  p(-15,-8,AR3,2,16);
    p( 12,-10,CO,5,22);  p( 13,-9,AR2,3,20);  p( 13,-8,AR3,2,16);

    // ── ORB OF GENESIS (between hands — swirling all-creation sphere)
    p(-6,7,CO,12,12);   p(-5,8,AR3,10,10);  p(-3,9,AR4,6,7);
    ctx.save(); ctx.globalAlpha=0.60+p1*0.30; pUnit(ctx,cx,cy,-6,7+idleY,CR,12,12,isLeft,S); ctx.restore();
    ctx.save(); ctx.globalAlpha=0.50+p2*0.30; pUnit(ctx,cx,cy,-5,8+idleY,CB,10,10,isLeft,S); ctx.restore();
    ctx.save(); ctx.globalAlpha=0.75+p3*0.20; pUnit(ctx,cx,cy,-2,10+idleY,'#FFFFFF',4,4,isLeft,S); ctx.restore();

    // ── FACE — divine emperor (slightly larger SD head)
    p(-8,-28,CO,16,14);   p(-7,-27,SK,14,12);  p(-5,-26,AR3,8,8);  p(-4,-25,AR4,4,6);
    p(-4,-22,CO,2,2);  p(2,-22,CO,2,2);
    p(-3,-21,isAtk?'#FFFFFF':AR4,1,2);  p(3,-21,isAtk?'#FFFFFF':AR4,1,2);

    // ── COSMIC CROWN — multi-layered, 7 rainbow crystal orbs + center spire
    p(-8,-30,CO,16,6);  p(-7,-29,AR1,14,4);  p(-5,-28,AR2,10,3);  p(-3,-27,AR3,6,2);  // crown band
    p(-7,-32,G2,14,2);  p(-6,-31,G3,10,1);   // gold base ring
    const orbC=['#FF3333','#FF9900','#FFFF00','#00FF66','#00CCFF','#3366FF','#CC00FF'];
    for (let i=0; i<7; i++) { p(-7+i*2,-35,CO,3,4); p(-6+i*2,-34,orbC[i],2,3); }  // 7 orbs
    p(-1,-38,CO,4,8);  p(0,-37,G2,2,6);  p(0,-41,G3,2,4);  // center spire
    ctx.save(); ctx.globalAlpha=0.65+p3*0.28;
    pUnit(ctx,cx,cy,-1,-41+idleY,'#FFFFFF',4,6,isLeft,S);
    ctx.restore();

    if (isAtk) {
        ctx.save(); ctx.globalAlpha=0.62; ctx.globalCompositeOperation='screen';
        pUnit(ctx,cx,cy,-20,-26+idleY,'#FFFFFF',40,62,isLeft,S);
        ctx.restore();
    }
}

/* ── EXORCISM STORM (퇴마의 폭풍) — perpetual electric storm, teal & violet ─ */
function drawExorcismStorm(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const isAtk  = (now - (tower.lastShot || 0)) < 200;
    const idleY  = Math.sin(now * 0.003) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep = (Math.sin(now * 0.010) + 1) / 2;
    const sp = (Math.sin(now * 0.014) + 1) / 2;
    const CO='#000', SK='#C09070';
    const T1='#003344', T2='#005566', T3='#008899', T4='#00BBCC';
    const V2='#6600AA', V3='#9922EE';
    const BT='#00FFEE', BT2=`rgba(0,255,238,0.6)`;

    // ── PERPETUAL STORM AURA (two-color cycling)
    ctx.save(); ctx.globalAlpha=0.16+ep*0.20;
    pUnit(ctx,cx,cy,-18,-22+idleY,BT,36,58,isLeft,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha=0.12+sp*0.16;
    pUnit(ctx,cx,cy,-16,-20+idleY,'#AA44FF',32,52,isLeft,S);
    ctx.restore();

    // ── LIGHTNING WING-CLOAKS (behind body, 4 layered strips each side)
    p(-22,-18,T1,10,28);  p(-23,-16,T2,7,24);  p(-24,-14,T3,5,20);  p(-25,-12,T4,2,16);
    p( 12,-18,T1,10,28);  p( 13,-16,T2,7,24);  p( 14,-14,T3,5,20);  p( 15,-12,T4,2,16);
    // Violet wing overlay
    ctx.save(); ctx.globalAlpha=0.22+sp*0.24;
    pUnit(ctx,cx,cy,-22,-16+idleY,V3,8,22,isLeft,S);  pUnit(ctx,cx,cy,12,-16+idleY,V3,8,22,isLeft,S);
    ctx.restore();
    // Lightning arcs (3 per wing, pulsing)
    for (let i=0; i<3; i++) {
        ctx.save(); ctx.globalAlpha=0.42+ep*0.44;
        pUnit(ctx,cx,cy,-22+i*2,-14+i*3+idleY,BT,2,10-i*2,isLeft,S);
        pUnit(ctx,cx,cy, 12+i*2,-14+i*3+idleY,BT,2,10-i*2,isLeft,S);
        ctx.restore();
    }

    // ── BOOTS — streamlined combat
    p(-12,22,CO,11,7);  p(-11,23,T1,9,5);  p(-9,24,T3,4,3);  p(-12,28,T1,11,1);
    p(  1,22,CO,11,7);  p(  2,23,T1,9,5);  p( 2,24,T3,4,3);  p(  1,28,T1,11,1);

    // ── LOWER BODY SUIT
    p(-11,7,CO,22,15);  p(-10,8,T1,20,13);  p(-8,8,T2,16,11);  p(-5,9,T3,10,9);  p(-3,10,T4,6,8);
    p(-11,7,V2,3,14);   p( 8,7,V2,3,14);    // violet accent strips

    // ── BELT
    p(-11,1,CO,22,7);  p(-10,2,T2,20,5);  p(-8,3,T3,12,3);

    // ── CHEST PLATE — teal-armored
    p(-11,-12,CO,22,20);  p(-10,-11,T1,20,18);  p(-8,-11,T2,16,16);  p(-5,-10,T3,10,12);  p(-3,-9,T4,6,10);
    ctx.save(); ctx.globalAlpha=0.50+sp*0.34; pUnit(ctx,cx,cy,-4,-4+idleY,V3,8,14,isLeft,S); ctx.restore();
    ctx.save(); ctx.globalAlpha=0.70+ep*0.24;
    pUnit(ctx,cx,cy,0,-8+idleY,BT,3,8,isLeft,S);  pUnit(ctx,cx,cy,-2,-4+idleY,BT,5,3,isLeft,S); // bolt symbol
    ctx.restore();

    // ── PAULDRONS — teal with violet crest
    p(-17,-14,CO,6,6);  p(-16,-13,T2,4,5);  p(-15,-12,T3,3,4);  p(-15,-12,V3,2,2);
    p( 11,-14,CO,6,6);  p( 12,-13,T2,4,5);  p( 12,-12,T3,3,4);  p( 12,-12,V3,2,2);

    // ── ARMS — teal vambraces
    p(-16,-10,CO,5,22);  p(-15,-9,T2,3,20);  p(-14,-8,T3,2,16);
    p( 11,-10,CO,5,22);  p( 12,-9,T2,3,20);  p( 12,-8,T3,2,16);

    // ── DUAL STORM SCEPTERS (both hands — handle + crackling head)
    p(-16,-4,CO,4,16);  p(-15,-3,T3,2,14);  // left scepter handle
    p( 11,-4,CO,4,16);  p( 12,-3,T3,2,14);  // right scepter handle
    p(-18,-8,CO,6,5);   p(-17,-7,V2,4,4);   p(-16,-6,V3,3,3);   // left scepter head
    p(  9,-8,CO,6,5);   p( 10,-7,V2,4,4);   p( 11,-6,V3,3,3);   // right scepter head
    ctx.save(); ctx.globalAlpha=0.65+ep*0.30;
    pUnit(ctx,cx,cy,-17,-7+idleY,BT,5,5,isLeft,S);  pUnit(ctx,cx,cy,10,-7+idleY,BT,5,5,isLeft,S);
    ctx.restore();
    if (isAtk) {
        ctx.save(); ctx.globalAlpha=0.88;
        pUnit(ctx,cx,cy,-20,-8+idleY,BT,7,8,isLeft,S);  pUnit(ctx,cx,cy,8,-8+idleY,BT,7,8,isLeft,S);
        ctx.restore();
    }

    // ── SPEED-FORGED HELM + FACE
    p(-7,-25,CO,14,13);  p(-6,-24,SK,12,11);  p(-5,-23,T2,8,8);  p(-4,-22,T3,4,6);
    p(-9,-29,CO,18,6);   p(-8,-28,T1,16,4);   p(-6,-27,T2,12,3); p(-4,-26,T3,8,2); // helm top

    // ── TWIN LIGHTNING HORNS (glowing cyan)
    p(-8,-32,T2,4,6);   p(4,-32,T2,4,6);   // horn bases
    p(-7,-36,T3,3,5);   p(5,-36,T3,3,5);   // horn mids
    ctx.save(); ctx.globalAlpha=0.72+ep*0.24;
    pUnit(ctx,cx,cy,-8,-36+idleY,BT,4,7,isLeft,S);  pUnit(ctx,cx,cy,4,-36+idleY,BT,4,7,isLeft,S);
    ctx.restore();

    // ── FULL VISOR (glowing cyan slit)
    p(-7,-23,CO,14,4);  p(-6,-22,isAtk?BT:T4,12,3);
}

window.drawWordOfGod      = drawWordOfGod;
window.drawGenesisStrike  = drawGenesisStrike;
window.drawExorcismStorm  = drawExorcismStorm;

/* ─── Novice Exorcist Exclusive — Support T4 ────────────────────────────── */
function drawDivineChoir(ctx, tower, cx, cy, isLeft) {
    const S = 2.0;
    const p = (ox,oy,c,w,h) => pUnit(ctx,cx,cy,ox,oy,c,w,h,isLeft,S);
    const now = performance.now();
    const idleY = Math.sin(now * 0.002) * 2;
    const isAtk = (now - tower.lastShot) < 350;
    const ep = (Math.sin(now * 0.002) + 1) * 0.5;
    const t = now * 0.001;
    const CO='#0A0820', WH='#FFFFFF', WS='#F0F4FF', GE='#FFFAEE';
    const GD='#FFE070', GK='#FFD000', GL='#FFEE99';
    const MN='#CC88FF', MC='#FF88CC', SK='#FFDDBB';
    // ── Ghost singer silhouettes flanking (behind) ────────────
    ctx.save(); ctx.globalAlpha = 0.35 + ep * 0.15;
    pUnit(ctx,cx,cy, -24, idleY-22, WS,  8, 20, isLeft, S); // ghost L head+body
    pUnit(ctx,cx,cy, -26, idleY- 4, WS, 10, 16, isLeft, S); // ghost L lower
    pUnit(ctx,cx,cy,  16, idleY-22, WS,  8, 20, isLeft, S); // ghost R head+body
    pUnit(ctx,cx,cy,  16, idleY- 4, WS, 10, 16, isLeft, S); // ghost R lower
    ctx.restore();
    // ── Grand golden feather wings (4 layers, majestic) ───────
    // Left wing layers (outer → inner)
    p(-20, idleY-18, CO,  6, 22);        // outer layer shadow
    p(-19, idleY-17, GD,  5, 20);        // outer gold
    p(-15, idleY-20, CO,  5, 24);        // layer 2 shadow
    p(-14, idleY-19, GD,  4, 22);        // layer 2 gold
    p(-11, idleY-22, CO,  4, 22);        // layer 3 shadow
    p(-10, idleY-21, GE,  3, 20);        // layer 3 cream
    p( -8, idleY-22, GK,  2, 20);        // inner feather gold
    p(-14, idleY-14, GK,  6,  3);        // feather tip row
    p(-19, idleY-10, GD,  5,  3);        // wing lower feathers
    // Right wing layers (mirrored layout)
    p( 14, idleY-18, CO,  6, 22);
    p( 14, idleY-17, GD,  5, 20);
    p( 10, idleY-20, CO,  5, 24);
    p( 10, idleY-19, GD,  4, 22);
    p(  7, idleY-22, CO,  4, 22);
    p(  7, idleY-21, GE,  3, 20);
    p(  6, idleY-22, GK,  2, 20);
    p(  8, idleY-14, GK,  6,  3);
    p( 14, idleY-10, GD,  5,  3);
    // ── Lower robe ────────────────────────────────────────────
    p(-6, idleY+ 4, CO, 12,  6);
    p(-5, idleY+ 5, WS, 10,  4);
    p(-7, idleY+ 2, WH, 14,  2);         // hem sweep
    // ── Torso — immaculate white robes ────────────────────────
    p(-6, idleY-14, CO, 12, 18);
    p(-5, idleY-13, WS, 10, 16);
    p(-4, idleY-12, WH,  8, 14);
    p(-5, idleY+ 0, GD, 10,  2);         // waist gold band
    p(-5, idleY-13, GK,  1, 16);         // left stripe
    p( 4, idleY-13, GK,  1, 16);         // right stripe
    p(-2, idleY-12, GL,  4, 12);         // center gold stole
    // ── Arms raised in grand conducting sweep ─────────────────
    p(-11, idleY-18, CO,  4, 10);  p(-10, idleY-17, WS, 3, 9); // left wide arm
    p(-13, idleY-12, SK,   2,  2);                               // left hand
    p(  7, idleY-18, CO,  4, 10);  p(  7, idleY-17, WS, 3, 9); // right wide arm
    p( 11, idleY-12, SK,   2,  2);                               // right hand
    // ── Neck ──────────────────────────────────────────────────
    p(-2, idleY-18, CO,  4,  3);
    p(-1, idleY-17, SK,  2,  2);
    // ── Head — serene conductor ───────────────────────────────
    p(-5, idleY-30, CO, 10, 12);
    p(-4, idleY-29, SK,  8, 10);
    p(-4, idleY-30, WS,  8,  3);         // flowing hair
    p(-3, idleY-27, CO,  2,  1);         // left eye (closed, serene)
    p( 1, idleY-27, CO,  2,  1);         // right eye
    p(-2, idleY-24, CO,  1,  1);         // nose
    p(-2, idleY-22, CO,  4,  1);         // singing mouth open
    p(-1, idleY-21, '#220000',  2,  1);  // mouth interior
    // ── Grand divine halo (large golden ring above head) ──────
    p(-10, idleY-38, CO, 20,  4);        // ring outer shadow
    p( -9, idleY-37, GK, 18,  2);        // ring arc top
    p( -9, idleY-35, GK, 18,  2);        // ring arc bottom
    p(-10, idleY-37, GD, 20,  1);        // ring top bright
    p( -7, idleY-37, GL, 14,  2);        // ring inner warm
    ctx.save(); ctx.globalAlpha = 0.28 + ep * 0.3;
    pUnit(ctx,cx,cy,  0, idleY-36, GD, 22,  4, isLeft, S); // halo pulse
    ctx.restore();
    // Crown-like halo rays
    p(-8, idleY-42, GD,  2,  5);
    p(-4, idleY-43, GD,  2,  6);
    p(-1, idleY-44, GD,  2,  7);         // center tallest
    p( 2, idleY-43, GD,  2,  6);
    p( 5, idleY-42, GD,  2,  5);
    // ── Floating music notes (3 per side) ─────────────────────
    ctx.save(); ctx.globalAlpha = 0.72 + ep * 0.2;
    for (let i=0; i<3; i++) {
        const aL = t * 0.6 + i * 2.094;
        const aR = aL + Math.PI;
        const nLx = Math.cos(aL) * 18 - 8;
        const nLy = Math.sin(aL) *  9 - 22;
        const nRx = Math.cos(aR) * 18 + 8;
        const nRy = Math.sin(aR) *  9 - 22;
        const nc  = i % 2 === 0 ? MN : MC;
        pUnit(ctx,cx,cy, nLx,   idleY+nLy,    nc, 3, 2, isLeft, S);
        pUnit(ctx,cx,cy, nLx+2, idleY+nLy-4,  nc, 1, 4, isLeft, S);
        pUnit(ctx,cx,cy, nRx,   idleY+nRy,    nc, 3, 2, isLeft, S);
        pUnit(ctx,cx,cy, nRx+2, idleY+nRy-4,  nc, 1, 4, isLeft, S);
    }
    ctx.restore();
    // ── Attack: massive lighter burst over entire figure ───────
    if (isAtk) {
        ctx.save();
        ctx.globalAlpha = 0.65;
        ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,  0, idleY-14, GD, 58, 56, isLeft, S);
        ctx.restore();
    }
}

function drawSacredReliquary(ctx, tower, cx, cy, isLeft) {
    const S = 2.0;
    const p = (ox,oy,c,w,h) => pUnit(ctx,cx,cy,ox,oy,c,w,h,isLeft,S);
    const now = performance.now();
    const idleY = Math.sin(now * 0.002) * 2;
    const isAtk = (now - tower.lastShot) < 350;
    const ep = (Math.sin(now * 0.0025) + 1) * 0.5;
    const CO='#1A0A1A', MW='#E8E4E0', ML='#F4F0EC', MX='#FFFDFB';
    const GD='#FFD050', GL='#FFEE88', GS='#CC9900';
    const PG='#AAAACC', PS='#9090AA';
    const RD='#CC3300', RF='#FF4400', SK='#FFCCAA';
    // ── Side architectural pillars (temple columns) ───────────
    p(-14, idleY-38, CO,  4, 50);        // left pillar shadow
    p(-13, idleY-37, PS,  3, 48);        // left pillar stone
    p(-12, idleY-37, PG,  2, 48);        // left pillar highlight
    p(-15, idleY-40, CO,  6,  4);        // left capital top
    p(-14, idleY-39, PG,  4,  2);        // capital highlight
    p(-15, idleY+10, CO,  6,  3);        // left base
    p( 10, idleY-38, CO,  4, 50);        // right pillar shadow
    p( 10, idleY-37, PS,  3, 48);        // right pillar stone
    p( 11, idleY-37, PG,  2, 48);        // right pillar highlight
    p(  9, idleY-40, CO,  6,  4);        // right capital top
    p( 10, idleY-39, PG,  4,  2);
    p(  9, idleY+10, CO,  6,  3);        // right base
    // ── Lower body — ceremonial armor ────────────────────────
    p(-5, idleY+ 4, CO, 10,  6);
    p(-4, idleY+ 5, MW,  8,  4);
    p(-5, idleY+ 2, GD, 10,  2);         // gold greave edge
    p(-5, idleY- 2, ML, 10,  2);         // knee plate
    // ── Torso — marble-white ornate temple armor ──────────────
    p(-5, idleY-14, CO, 10, 18);         // armor shadow
    p(-4, idleY-13, MW,  8, 16);         // marble-white body
    p(-3, idleY-12, ML,  6, 14);         // marble highlight
    p(-2, idleY-11, MX,  4, 12);         // brightest marble
    p(-5, idleY-14, GS, 10,  1);         // breastplate top edge
    p(-5, idleY-14, GD, 10,  2);         // top gold band
    p(-5, idleY- 4, GD, 10,  2);         // lower gold band
    p(-2, idleY-11, CO,  4,  4);         // ruby gem setting
    p(-1, idleY-10, RD,  2,  3);         // ruby dark
    p( 0, idleY-10, RF,  1,  2);         // ruby bright highlight
    p(-7, idleY-14, CO,  3,  4);  p(-6, idleY-13, ML, 2, 3); // left pauldron
    p( 4, idleY-14, CO,  3,  4);  p( 5, idleY-13, ML, 2, 3); // right pauldron
    // ── Arms raised presenting reliquary ──────────────────────
    p(-7, idleY-22, CO,  3, 14);  p(-6, idleY-21, MW, 2, 13); // left arm raised
    p(-8, idleY-24, SK,  2,  2);         // left hand
    p( 4, idleY-22, CO,  3, 14);  p( 4, idleY-21, MW, 2, 13); // right arm raised
    p( 6, idleY-24, SK,  2,  2);         // right hand
    // ── Large open reliquary chest (floating above) ───────────
    p(-5, idleY-38, CO, 10,  2);         // chest frame shadow
    p(-5, idleY-36, GS, 10,  8);         // chest gold base
    p(-4, idleY-35, GD,  8,  6);         // chest bright gold
    p(-3, idleY-34, GL,  6,  4);         // interior warm glow
    p(-5, idleY-36, CO, 10,  1);         // top open edge
    p(-5, idleY-40, CO, 10,  2);         // lid shadow
    p(-4, idleY-39, GD,  8,  1);         // lid gold face
    p(-5, idleY-41, GL, 10,  2);         // lid back raised edge
    p(-5, idleY-36, CO,  2,  1);  p(3, idleY-36, CO, 2, 1); // corner studs top
    p(-5, idleY-28, CO,  2,  1);  p(3, idleY-28, CO, 2, 1); // corner studs bottom
    ctx.save(); ctx.globalAlpha = 0.35 + ep * 0.45;
    pUnit(ctx,cx,cy, -2, idleY-38, GL, 12,  8, isLeft, S); // upward holy glow
    pUnit(ctx,cx,cy, -4, idleY-40, GL,  6, 10, isLeft, S); // rising light beam
    ctx.restore();
    // ── Neck ──────────────────────────────────────────────────
    p(-2, idleY-18, CO,  4,  3);
    p(-1, idleY-17, SK,  2,  2);
    // ── Head ─────────────────────────────────────────────────
    p(-4, idleY-28, CO,  8, 10);
    p(-3, idleY-27, SK,  6,  8);
    p(-3, idleY-25, CO,  2,  1);  // left eye
    p( 1, idleY-25, CO,  2,  1);  // right eye
    p( 0, idleY-23, CO,  1,  1);  // nose
    p(-1, idleY-21, CO,  2,  1);  // mouth
    // ── Ornate temple helm with sun/halo crest ────────────────
    p(-5, idleY-30, CO, 10,  4);         // helm base
    p(-4, idleY-29, MW,  8,  2);         // base highlight
    p(-5, idleY-36, CO, 10,  7);         // dome
    p(-4, idleY-35, MW,  8,  5);         // dome marble
    p(-3, idleY-37, ML,  6,  4);         // dome top
    p(-4, idleY-42, CO,  8,  2);         // crest base plate
    p(-3, idleY-40, GD,  6,  1);         // crest gold band
    p(-4, idleY-44, GD,  2,  4);         // sun ray L
    p(-1, idleY-46, GD,  2,  6);         // sun ray center (tallest)
    p( 2, idleY-44, GD,  2,  4);         // sun ray R
    p(-6, idleY-43, GD,  2,  3);         // sun ray far L
    p( 4, idleY-43, GD,  2,  3);         // sun ray far R
    p(-7, idleY-34, CO,  3,  6);  p(-6, idleY-33, GD, 2, 4); // left helm flange
    p( 4, idleY-34, CO,  3,  6);  p( 5, idleY-33, GD, 2, 4); // right helm flange
    // ── Attack: reliquary opens fully, massive gold burst ──────
    if (isAtk) {
        ctx.save();
        ctx.globalAlpha = 0.65;
        ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,  0, idleY-26, GD, 48, 46, isLeft, S);
        ctx.restore();
    }
}

function drawGrandWard(ctx, tower, cx, cy, isLeft) {
    const S = 2.0;
    const p = (ox,oy,c,w,h) => pUnit(ctx,cx,cy,ox,oy,c,w,h,isLeft,S);
    const now = performance.now();
    const idleY = Math.sin(now * 0.002) * 2;
    const ep = (Math.sin(now * 0.003) + 1) * 0.5;
    const isAtk = (now - tower.lastShot) < 350;
    const CO='#000000', RB='#0A1A5A', NB='#1430A0', LB='#2244CC';
    const CY='#44EEFF', GD='#FFD060', GL='#FFEE88', SK='#FFCCAA';
    // Aura: 3 orbiting ward hexagons
    const ang = now * 0.001;
    for (let i = 0; i < 3; i++) {
        const a = ang + i * (Math.PI * 2 / 3);
        const hx = Math.cos(a) * 19, hy = Math.sin(a) * 11 - 14 + idleY;
        ctx.save(); ctx.globalAlpha = 0.5 + ep * 0.3;
        pUnit(ctx, cx, cy, hx, hy, CY, 5, 4, isLeft, S); ctx.restore();
    }
    // Ward sphere above head: 3 layered pulsing spheres
    const sp = 0.5 + ep * 0.3;
    ctx.save(); ctx.globalAlpha = 0.3 * sp;
    pUnit(ctx, cx, cy, -7, idleY - 46, CY, 14, 10, isLeft, S); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.5 * sp;
    pUnit(ctx, cx, cy, -5, idleY - 44, NB, 10,  8, isLeft, S); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.7 * sp;
    pUnit(ctx, cx, cy, -3, idleY - 42, LB,  6,  6, isLeft, S); ctx.restore();
    // Lower body: deep royal blue ceremonial robe
    p(-7, idleY+2,  CO, 14, 12);  p(-6, idleY+3,  RB, 12, 10);
    p(-5, idleY+4,  NB,  9,  8);  p(-4, idleY+5,  LB,  6,  6);
    p(-6, idleY+12, CO, 13,  3);  p(-5, idleY+13, GD, 11,  2);
    p(-4, idleY+14, GL,  9,  1);
    // Upper torso robe
    p(-6, idleY-14, CO, 13, 17);  p(-5, idleY-13, RB, 11, 15);
    p(-4, idleY-12, NB,  8, 13);  p(-3, idleY-11, LB,  5, 10);
    // Gold trim collar
    p(-6, idleY-15, CO, 13,  3);  p(-5, idleY-14, GD, 11,  2);
    // Ward rune emblem on chest (concentric glow)
    p(-4, idleY-11, CO,  8,  7);  p(-3, idleY-10, LB,  6,  6);
    p(-2, idleY-9,  CY,  4,  4);  p(-1, idleY-8,  GL,  2,  2);
    // Grand helm with 3 cyan crystal points
    p(-7, idleY-30, CO, 15, 15);  p(-6, idleY-29, SK, 13, 13);
    p(-7, idleY-30, RB, 15,  5);  p(-6, idleY-29, NB, 13,  4);
    p(-8, idleY-32, CO, 16,  4);  p(-7, idleY-31, LB, 14,  3);
    p(-8, idleY-33, GD, 16,  2);
    p(-4, idleY-36, CO,  3,  6);  p(-3, idleY-35, CY,  2,  5);
    p(-1, idleY-38, CO,  3,  8);  p( 0, idleY-37, '#AAFFFF', 2, 7);
    p( 3, idleY-36, CO,  3,  6);  p( 4, idleY-35, CY,  2,  5);
    // Eyes
    p(-5, idleY-24, CO,  3,  2);  p( 2, idleY-24, CO,  3,  2);
    // Arms raised wide, channeling the ward sphere
    p(-11, idleY-20, CO,  5, 16);  p(-10, idleY-19, RB,  4, 14);
    p(-14, idleY-26, CO,  5,  8);  p(-13, idleY-25, SK,  4,  7);
    p(  7, idleY-20, CO,  5, 16);  p(  8, idleY-19, RB,  4, 14);
    p( 10, idleY-26, CO,  5,  8);  p( 11, idleY-25, SK,  4,  7);
    // Attack: all orbit hexagons align, massive screen barrier burst
    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.6; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx, cx, cy, 0, idleY - 14, CY, 54, 50, isLeft, S); ctx.restore();
    }
}

window.drawDivineChoir      = drawDivineChoir;
window.drawSacredReliquary  = drawSacredReliquary;
window.drawGrandWard        = drawGrandWard;
