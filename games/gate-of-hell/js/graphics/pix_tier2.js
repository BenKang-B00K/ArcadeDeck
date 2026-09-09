/* pix_tier2.js - Tier 2 Exorcists */
/* Sprite: 45×63 art-pixels @ S=2.0; light source: top-left */
/* p(ox, oy, col, w, h) — mirrors via pUnit's isLeft flag    */

// ─────────────────────────────────────────────────────────────────────────────
// KNIGHT  —  Holy-plated warrior in ivory & gold, longsword + kite shield
// ─────────────────────────────────────────────────────────────────────────────
function drawKnight(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const atk    = (now - (tower.lastShot || 0)) < 350;
    const idleY  = Math.sin(now * 0.0018) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep    = (Math.sin(now * 0.004) + 1) / 2;
    const plumF = Math.sin(now * 0.005) * 1.5;
    const CO='#000';
    const P0='#424250', P1='#7A7A90', P2='#B4B4C8', P3='#D8D8E8', P4='#F0F0F8';
    const G0='#3C2400', G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const R0='#3B0000', R1='#6B0000', R2='#9B0000', R3='#CC1010', R4='#EE2020';

    // holy aura
    ctx.save(); ctx.globalAlpha = 0.10 + ep * 0.14;
    pUnit(ctx,cx,cy,-22,-32+idleY,G3,44,64,isLeft,S);
    ctx.restore();

    // ── BOOTS (sabatons + gold cuff)
    p(-12,23,CO,10,6); p(-11,24,P1,8,4); p(-10,24,P3,4,3); p(-12,28,P0,10,1);
    p(  2,23,CO,10,6); p(  3,24,P1,8,4); p(  3,24,P3,4,3); p(  2,28,P0,10,1);
    p(-12,23,G2,10,1); p( 2,23,G2,10,1);

    // ── GREAVES / LOWER SKIRT (ivory plate w/ crimson surcoat)
    p(-13,6,CO,26,18); p(-12,7,P1,24,16); p(-10,7,P2,18,14); p(-6,7,P3,10,12);
    p(-12,7,P4,24,1);                                                          // top highlight
    p(-6,7,R2,10,16); p(-4,8,R3,6,14); p(-2,9,R4,2,12);
    p(-12,7,G3,2,16); p(11,7,G3,2,16);
    for (let r=0; r<2; r++) { p(-10,11+r*5,G2,1,1); p(10,11+r*5,G2,1,1); }     // gold rivets

    // ── BELT (gold reinforced)
    p(-11,1,CO,22,6); p(-10,2,G2,20,4); p(-8,3,G3,12,2); p(-8,5,G1,12,1);
    p(-2,2,CO,4,4); p(-1,3,R3,2,2);                                            // crimson buckle gem

    // ── CHEST PLATE (riveted, top-highlighted)
    p(-11,-12,CO,22,20); p(-10,-11,P1,20,18); p(-8,-11,P2,16,16); p(-5,-10,P3,8,14);
    p(-10,-11,P4,20,1);                                                        // top highlight
    for (let r=0; r<3; r++) { p(-9,-8+r*5,G2,1,1); p(8,-8+r*5,G2,1,1); }       // rivets
    // Large cross emblem
    p(-3,-7,CO,6,12); p(-2,-6,G2,4,10); p(-1,-5,G3,2,8);
    p(-5,-2,CO,10,4); p(-4,-1,G2,8,2); p(-3, 0,G3,6,1);
    ctx.save(); ctx.globalAlpha = 0.45 + ep * 0.35;
    pUnit(ctx,cx,cy,-3,-7+idleY,G4,6,12,isLeft,S);
    ctx.restore();

    // ── PAULDRONS (chunkier, gold-rimmed)
    p(-18,-15,CO,7,8); p(-17,-14,P1,5,6); p(-16,-13,P2,3,4); p(-17,-14,P4,5,1);
    p(-17,-14,G2,5,1);                                                          // gold cap
    p( 11,-15,CO,7,8); p( 12,-14,P1,5,6); p( 13,-13,P2,3,4); p( 12,-14,P4,5,1);
    p( 12,-14,G2,5,1);

    // ── SLEEVES + GAUNTLETS
    p(-16,-8,CO,5,14); p(-15,-7,P1,3,12); p(-15,-7,P2,2,8);
    p( 11,-8,CO,5,14); p( 12,-7,P1,3,12); p( 12,-7,P2,2,8);
    p(-16,6,CO,5,6); p(-15,7,P2,3,4); p(-15,7,G2,3,1);
    p( 11,6,CO,5,6); p( 12,7,P2,3,4); p( 12,7,G2,3,1);

    // ── NECK / COLLAR
    p(-4,-14,CO,8,4); p(-3,-13,P2,6,2); p(-2,-13,P4,4,2);

    // ── GREAT HELM (riveted, gold-rim, glowing visor)
    p(-8,-28,CO,16,14); p(-7,-27,P1,14,12); p(-5,-26,P3,8,10);
    p(-7,-27,P4,14,1);                                                          // top highlight
    p(-3,-27,P0,4,12);                                                          // visor shadow
    p(-6,-22,CO,12,3); p(-5,-21,atk?'#FF4400':G3,8,1);                          // visor slit
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.35;
    pUnit(ctx,cx,cy,-5,-21+idleY,atk?G4:G3,8,1,isLeft,S);
    ctx.restore();
    p(-8,-14,CO,16,2); p(-7,-13,G2,14,1);                                       // gold helm rim
    p(-9,-28,G2,2,14); p(7,-28,G2,2,14);                                        // side gold strips

    // ── CRIMSON PLUME (taller, flowing)
    p(-8,-30+plumF,R2,16,4); p(-6,-33+plumF,R3,10,4); p(-4,-36+plumF,R4,6,4); p(-2,-39+plumF,R4,3,3);
    p(-1,-41+plumF,'#FF6060',2,2);

    // ── KITE SHIELD (gold-rim, prominent cross)
    p(-21,-12,CO,9,24); p(-20,-11,P1,7,22); p(-20,-11,P2,7,1);                  // shield outline + highlight
    p(-19,-10,R1,5,20); p(-18,-9,R2,3,18); p(-17,-8,R3,1,16);
    p(-21,-12,G3,9,2); p(-21,12,G3,9,2);                                        // gold top/bottom rim
    p(-21,-12,G3,1,24); p(-13,-12,G3,1,24);                                     // gold side rims
    // Bold cross
    p(-18,-4,CO,3,12); p(-17,-3,G3,1,10);
    p(-21,-2,CO,9,3); p(-20,-1,G3,7,1);
    ctx.save(); ctx.globalAlpha = 0.40 + ep * 0.30;
    pUnit(ctx,cx,cy,-21,-2+idleY,G4,9,3,isLeft,S);
    ctx.restore();

    // ── LONGSWORD (gold-trimmed)
    p(12,-26,CO,4,40); p(13,-25,P3,1,38); p(14,-25,P1,1,38);
    p(11,-28,CO,8,3); p(12,-27,P3,6,2); p(13,-27,P4,4,1);                       // tip
    p(11,-4,CO,6,4); p(12,-3,G3,4,2); p(12,-3,G4,4,1);                          // crossguard
    p(13,0,CO,2,4); p(13,1,G2,2,2);                                             // grip
    p(13,4,CO,3,3); p(14,5,G3,1,1);                                             // pommel
    if (atk) {
        ctx.save(); ctx.globalAlpha = 0.70; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy,11,-28+idleY,'#FFFFFF',6,42,isLeft,S);
        ctx.restore();
    }

    if (atk) {
        ctx.save(); ctx.globalCompositeOperation='lighter';
        const sx = isLeft ? cx + 14*S : cx - 14*S;
        const sy = cy - 20*S + idleY*S;
        const r  = (16 + Math.sin(now*0.04) * 6) * S;
        const g  = ctx.createRadialGradient(sx,sy,0,sx,sy,r);
        g.addColorStop(0,'rgba(255,220,100,0.9)'); g.addColorStop(1,'transparent');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
        ctx.restore();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// FIRE  —  Pyro-exorcist in crimson flame robes, fire wand with ember top
// ─────────────────────────────────────────────────────────────────────────────
function drawFire(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const atk    = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.0025) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep    = (Math.sin(now * 0.008) + 1) / 2;
    const flamePulse = atk ? 1 : ep;
    const CO='#000', SK1='#C07040', SK2='#E89868', SK3='#F8C090';
    const R0='#2A0000', R1='#5C0000', R2='#900000', R3='#CC1010', R4='#FF3020';
    const O0='#3C1800', O1='#7C3000', O2='#CC5500', O3='#FF8800', O4='#FFCC44';
    const G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';

    // flame wreath aura
    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.22;
    pUnit(ctx,cx,cy,-22,-32+idleY,O3,44,64,isLeft,S);
    ctx.restore();

    // ── BOOTS (ember-cuffed)
    p(-12,23,CO,10,6); p(-11,24,R2,8,4); p(-10,24,R3,4,3); p(-12,28,R0,10,1);
    p(  2,23,CO,10,6); p(  3,24,R2,8,4); p(  3,24,R3,4,3); p(  2,28,R0,10,1);
    p(-12,23,O3,10,1); p( 2,23,O3,10,1);

    // ── FLAME ROBE (A-line, top-highlighted)
    p(-13,6,CO,26,18); p(-12,7,R1,24,16); p(-10,7,R2,20,15); p(-8,7,R3,14,14);
    p(-12,7,R4,24,1);                                                           // top highlight
    p(-5,8,O2,8,13); p(-3,9,O3,4,12);
    // Hem flame tips (procedural, taller)
    for (let i=0; i<5; i++) {
        const fx = -11 + i*5, fh = 4 + Math.round(Math.sin(now*0.01+i) * 2);
        p(fx,22,O3,3,fh); p(fx+1,23,O4,1,fh-1); p(fx+1,25,'#FFFF80',1,1);
    }
    p(-12,7,G3,2,16); p(11,7,G3,2,16);
    for (let r=0; r<2; r++) { p(-10,11+r*5,G2,1,1); p(10,11+r*5,G2,1,1); }     // gold rivets

    // ── BELT (ember-orange + gold buckle)
    p(-11,1,CO,22,6); p(-10,2,O1,20,4); p(-8,3,O3,12,2); p(-8,5,O0,12,1);
    p(-2,2,CO,4,4); p(-1,3,G3,2,2);                                            // gold buckle

    // ── UPPER ROBE (riveted)
    p(-11,-12,CO,22,20); p(-10,-11,R2,20,18); p(-8,-11,R3,16,16); p(-4,-10,O2,8,14);
    p(-10,-11,R4,20,1);                                                         // top highlight
    for (let r=0; r<3; r++) { p(-9,-8+r*5,G3,1,1); p(8,-8+r*5,G3,1,1); }
    // Flame glyph (larger)
    p(-6,-4,CO,8,12); p(-5,-3,O2,6,10); p(-4,-2,O3,4,8); p(-3,-1,O4,2,6);
    ctx.save(); ctx.globalAlpha = 0.50 + ep * 0.40;
    pUnit(ctx,cx,cy,-6,-4+idleY,O4,8,12,isLeft,S);
    ctx.restore();

    // ── SHOULDERS (ember-trim)
    p(-18,-15,CO,7,8); p(-17,-14,R3,5,6); p(-16,-13,O3,3,4); p(-17,-14,O4,5,1);
    p( 11,-15,CO,7,8); p( 12,-14,R3,5,6); p( 13,-13,O3,3,4); p( 12,-14,O4,5,1);

    // ── SLEEVES + HANDS
    p(-16,-8,CO,5,14); p(-15,-7,R2,3,12); p(-15,-7,R3,2,8);
    p( 11,-8,CO,5,14); p( 12,-7,R2,3,12); p( 12,-7,R3,2,8);
    p(-16,6,CO,5,6); p(-15,7,SK2,3,4); p(-15,7,O3,3,1);
    p( 11,6,CO,5,6); p( 12,7,SK2,3,4); p( 12,7,O3,3,1);

    // ── NECK + COLLAR
    p(-4,-14,CO,8,4); p(-3,-13,R3,6,2); p(-2,-13,O3,4,2);

    // ── HEAD
    p(-8,-28,CO,16,14); p(-7,-27,SK1,14,12); p(-5,-26,SK2,8,10); p(-3,-26,SK3,4,8);
    // Wild fiery hair (larger flame plume)
    p(-10,-31,CO,20,7); p(-9,-30,R1,18,5); p(-7,-30,R2,13,4); p(-4,-30,O2,8,2); p(-2,-29,O4,4,1);
    p(-9,-34,CO,4,4); p(-8,-33,R2,2,3); p(-8,-35,O3,2,2);                       // L flame tuft
    p( 5,-34,CO,4,4); p( 6,-33,R2,2,3); p( 6,-35,O3,2,2);                       // R flame tuft
    p(-3,-36,CO,6,4); p(-2,-35,O3,4,3); p(-2,-37,O4,4,2); p(-1,-39,'#FFFF80',2,2); // top crest
    const eC = atk ? '#FFEE00' : '#FF6600';
    p(-7,-22,CO,5,4); p( 2,-22,CO,5,4);
    p(-6,-21,eC,3,2); p( 3,-21,eC,3,2);
    p(-1,-17,SK1,2,2); p(-3,-14,SK1,6,1);

    // ── FIRE WAND (taller, gold-banded)
    p(12,-28,CO,4,40); p(13,-27,O2,1,38); p(14,-27,O0,1,38);
    p(12,-22,G3,4,1); p(12,-12,G3,4,1); p(12,-2,G3,4,1);                        // gold bands
    // Ember crystal top (bigger, multi-layered)
    const ec = atk ? '#FFFFFF' : O4;
    p( 9,-36,CO,10,10); p(10,-35,R2,8,8); p(10,-35,O1,8,1);
    p(11,-34,O2,6,6); p(11,-34,O3,6,1);
    p(12,-33,O3,4,4); p(13,-33,ec,2,3); p(13,-31,'#FFFFFF',2,1);
    ctx.save(); ctx.globalAlpha = 0.55 + flamePulse * 0.40;
    pUnit(ctx,cx,cy,10,-35+idleY,O4,8,8,isLeft,S);
    ctx.restore();

    if (atk || flamePulse > 0.5) {
        ctx.save(); ctx.globalCompositeOperation='lighter';
        const sx = isLeft ? cx + 14*S : cx - 14*S;
        const sy = cy - 30*S + idleY*S;
        const r  = (14 + flamePulse * 14) * S;
        const g  = ctx.createRadialGradient(sx,sy,0,sx,sy,r);
        g.addColorStop(0,'rgba(255,200,50,0.9)');
        g.addColorStop(0.5,'rgba(255,60,0,0.5)');
        g.addColorStop(1,'transparent');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
        ctx.restore();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ARCHER  —  Elven-style forest scout in hunter green/brown, long bow
// ─────────────────────────────────────────────────────────────────────────────
function drawArcher(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const atk    = (now - (tower.lastShot || 0)) < 300;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep = (Math.sin(now * 0.004) + 1) / 2;
    // String draw distance: bow pulls back when ready, snaps forward on attack
    const drawX = atk ? 4 : 0;
    const CO='#000', SK1='#B86030', SK2='#D88050', SK3='#F0A060';
    const GR0='#0D1A08', GR1='#1E3C10', GR2='#2E5C1A', GR3='#4A7C28', GR4='#6CA040';
    const BR0='#1A0E04', BR1='#3C2010', BR2='#6C400A', BR3='#9A6020', BR4='#C08840';
    const G3='#FFD700', G4='#FFF4A0', AT='#88FFAA';

    // sylvan aura
    ctx.save(); ctx.globalAlpha = 0.10 + ep * 0.14;
    pUnit(ctx,cx,cy,-22,-32+idleY,GR4,44,64,isLeft,S);
    ctx.restore();

    // ── LEATHER BOOTS (cuffed)
    p(-12,23,CO,10,6); p(-11,24,BR1,8,4); p(-10,24,BR3,4,3); p(-12,28,BR0,10,1);
    p(  2,23,CO,10,6); p(  3,24,BR1,8,4); p(  3,24,BR3,4,3); p(  2,28,BR0,10,1);
    p(-12,23,BR4,10,1); p( 2,23,BR4,10,1);

    // ── LEGS / LEGGINGS (forest green, top-highlighted)
    p(-13,6,CO,26,18); p(-12,7,GR1,24,16); p(-10,7,GR2,20,15); p(-7,7,GR3,12,14);
    p(-12,7,GR4,24,1);                                                           // top highlight

    // ── BELT + QUIVER STRAP
    p(-11,1,CO,22,6); p(-10,2,BR2,20,4); p(-8,3,BR3,12,2); p(-8,5,BR0,12,1);
    p(-2,2,CO,4,4); p(-1,3,G3,2,2);                                              // gold buckle

    // ── ARROW QUIVER (back, prominent w/ fletching)
    p(10,-7,CO,6,20); p(11,-6,BR2,4,18); p(11,-6,BR3,4,1);                       // quiver body + highlight
    p(10,11,CO,6,3); p(11,12,BR3,4,1);                                           // bottom cap
    // 3 arrow shafts protruding (with feathers)
    for (let i = 0; i < 3; i++) {
        const ax = 11 + i;
        p(ax,-18,CO,2,12); p(ax,-17,BR4,1,11);                                   // shaft
        p(ax-1,-20,CO,3,3); p(ax,-19,GR3,1,2); p(ax,-19,GR4,1,1);                // arrowhead
        p(ax,-9,GR4,1,2);                                                        // feather
    }

    // ── TUNIC (leather over green)
    p(-11,-12,CO,22,20); p(-10,-11,GR1,20,18); p(-8,-11,GR2,16,16); p(-5,-10,GR3,8,14);
    p(-10,-11,GR4,20,1);                                                         // top highlight
    p(-8,-11,BR2,14,18); p(-6,-10,BR3,8,16); p(-4,-9,BR4,4,14);
    p(-11,-11,GR3,2,18); p(10,-11,GR2,2,18);
    // Leather chest rivets
    for (let r=0; r<3; r++) { p(-7,-8+r*5,G3,1,1); p(6,-8+r*5,G3,1,1); }
    // Diagonal quiver strap across chest
    p(-8,-12,BR1,2,3); p(-6,-9,BR1,2,3); p(-4,-6,BR1,2,3); p(-2,-3,BR1,2,3);

    // ── BRACERS
    p(-16,-8,CO,5,14); p(-15,-7,BR2,3,12); p(-15,-7,BR3,2,8);
    p( 11,-8,CO,5,14); p( 12,-7,BR2,3,12); p( 12,-7,BR3,2,8);
    p(-16,6,CO,5,6); p(-15,7,SK2,3,4); p(-15,7,BR4,3,1);
    p( 11,6,CO,5,6); p( 12,7,SK2,3,4); p( 12,7,BR4,3,1);

    // ── PAULDRONS (leather)
    p(-17,-14,CO,6,7); p(-16,-13,BR3,4,5); p(-16,-13,BR4,4,1);
    p( 11,-14,CO,6,7); p( 12,-13,BR3,4,5); p( 12,-13,BR4,4,1);

    // ── NECK + COWL
    p(-4,-14,CO,8,4); p(-3,-13,GR2,6,2); p(-2,-13,GR4,4,2);

    // ── HEAD (deeper hood shadow)
    p(-8,-28,CO,16,14); p(-7,-27,SK1,14,12); p(-5,-26,SK2,8,10); p(-3,-26,SK3,4,8);
    p(-8,-22,GR0,16,3);                                                          // shadow under hood
    // Ranger hood (taller peak)
    p(-9,-30,CO,18,6); p(-8,-29,GR1,16,5); p(-6,-29,GR2,10,4); p(-3,-28,GR3,6,2);
    p(-9,-32,CO,14,3); p(-8,-31,GR2,10,2);                                       // peak
    p(-7,-34,CO,10,3); p(-6,-33,GR1,8,2);                                        // tall peak top
    const eC = atk ? '#00FF88' : SK3;
    p(-7,-22,CO,5,4); p( 2,-22,CO,5,4);
    p(-6,-21,eC,3,2); p( 3,-21,eC,3,2);
    ctx.save(); ctx.globalAlpha = atk ? 0.7 : 0.0;
    pUnit(ctx,cx,cy,-6,-21+idleY,AT,3,2,isLeft,S);
    pUnit(ctx,cx,cy, 3,-21+idleY,AT,3,2,isLeft,S);
    ctx.restore();
    p(-1,-17,SK1,2,2); p(-3,-14,SK1,6,1);

    // ── LONGBOW (full curve)
    p(12,-32,CO,3,54); p(13,-31,BR3,1,52); p(13,-31,BR4,1,1);                    // limb + tip highlight
    p(12,-32,BR4,3,3); p(12,19,BR4,3,3);                                         // tips
    // Riser grip (mid)
    p(11,-4,CO,5,8); p(12,-3,BR2,3,6); p(12,-3,BR3,3,1);
    // Gold limb accents
    p(13,-22,G3,1,2); p(13,12,G3,1,2);

    // ── BOWSTRING (drawn back when ready, snaps forward on attack)
    p(14+drawX,-30,CO,1,50); p(14+drawX,-28,GR4,1,46);

    // ── NOCKED ARROW (ready position)
    if (!atk) {
        p(13,-2,CO,12,3); p(14,-1,BR3,10,1); p(14,-1,BR4,10,1);                  // shaft + highlight
        p(11,-1,CO,3,3); p(12, 0,GR3,1,1);                                       // arrowhead
        p(23,-2,GR4,1,3); p(24,-1,GR3,1,1);                                      // fletching
    } else {
        // Released — flash trail
        ctx.save(); ctx.globalAlpha = 0.75; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy,8,-2+idleY,AT,24,4,isLeft,S);
        ctx.restore();
        p(11,-2,CO,3,3); p(12,-1,G3,1,1);                                        // tensed string knock point
    }

    if (atk) {
        ctx.save(); ctx.globalCompositeOperation='lighter';
        const sx = isLeft ? cx + 14*S : cx - 14*S;
        const sy = cy - 5*S + idleY*S;
        const r  = 12*S;
        const g  = ctx.createRadialGradient(sx,sy,0,sx,sy,r);
        g.addColorStop(0,'rgba(80,255,120,0.8)'); g.addColorStop(1,'transparent');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
        ctx.restore();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAINER  —  Chain-whip exorcist in dark iron grey + sacred-gold markings
// ─────────────────────────────────────────────────────────────────────────────
function drawChainer(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const atk    = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep        = (Math.sin(now * 0.005) + 1) / 2;
    const chainSwing = Math.sin(now * 0.008) * 6;
    const CO='#000', SK2='#E89868';
    const I0='#0A0A0A', I1='#1A1A1A', I2='#303030', I3='#505050', I4='#787878', I5='#A0A0A0';
    const G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const P0='#1A0030', P1='#300060', P2='#5000A0', P3='#8020CC', P4='#BB60FF';

    // void aura
    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnit(ctx,cx,cy,-22,-32+idleY,P3,44,64,isLeft,S);
    ctx.restore();

    // ── IRON BOOTS (gold-cuffed)
    p(-12,23,CO,10,6); p(-11,24,I2,8,4); p(-10,24,I3,4,3); p(-12,28,I0,10,1);
    p(  2,23,CO,10,6); p(  3,24,I2,8,4); p(  3,24,I3,4,3); p(  2,28,I0,10,1);
    p(-12,23,G2,10,1); p( 2,23,G2,10,1);

    // ── LOWER ARMORED SKIRT (purple undercloth visible)
    p(-13,6,CO,26,18); p(-12,7,I1,24,16); p(-10,7,I2,20,15); p(-7,7,I3,12,14);
    p(-12,7,I5,24,1);                                                            // top highlight
    p(-8,8,P1,12,14); p(-6,9,P2,6,12);
    p(-12,7,G3,2,16); p(11,7,G3,2,16);
    for (let r=0; r<2; r++) { p(-10,11+r*5,G2,1,1); p(10,11+r*5,G2,1,1); }       // rivets

    // ── BELT (chain-link decorated)
    p(-11,1,CO,22,6); p(-10,2,I2,20,4); p(-8,3,G3,12,2); p(-8,5,I0,12,1);
    p(-12,1,G2,24,1);
    for (let i=0; i<5; i++) p(-9+i*4,2,G3,2,2);                                  // chain links
    p(-2,2,CO,4,4); p(-1,3,P3,2,2);                                              // purple buckle gem

    // ── CHEST ARMOR (riveted, purple sacred glyph)
    p(-11,-12,CO,22,20); p(-10,-11,I1,20,18); p(-8,-11,I2,16,16); p(-5,-10,I3,8,14);
    p(-10,-11,I5,20,1);                                                          // top highlight
    for (let r=0; r<3; r++) { p(-9,-8+r*5,G3,1,1); p(8,-8+r*5,G3,1,1); }
    // Big purple sacred glyph
    p(-4,-8,CO,8,12); p(-3,-7,P2,6,10); p(-3,-7,P3,6,1);                         // glyph block
    p(-2,-6,P4,4,8); p(-1,-5,P4,2,6);
    p(-3,-4,CO,6,2); p(-2,-3,G3,4,1);                                            // gold band
    ctx.save(); ctx.globalAlpha = 0.50 + ep * 0.40;
    pUnit(ctx,cx,cy,-4,-8+idleY,P4,8,12,isLeft,S);
    ctx.restore();

    // ── HEAVY SPIKED PAULDRONS
    p(-19,-15,CO,8,9); p(-18,-14,I2,6,7); p(-17,-13,I4,4,5); p(-18,-14,I5,6,1);
    p(-21,-18,CO,3,5); p(-20,-17,I3,1,4);                                        // spike L outer
    p(-17,-18,CO,3,4); p(-16,-17,I3,1,3);                                        // spike L inner
    p( 11,-15,CO,8,9); p( 12,-14,I2,6,7); p( 13,-13,I4,4,5); p( 12,-14,I5,6,1);
    p( 18,-18,CO,3,5); p( 19,-17,I3,1,4);
    p( 14,-18,CO,3,4); p( 15,-17,I3,1,3);

    // ── SLEEVES + GAUNTLETS
    p(-16,-8,CO,5,14); p(-15,-7,I2,3,12); p(-15,-7,I3,2,8);
    p( 11,-8,CO,5,14); p( 12,-7,I2,3,12); p( 12,-7,I3,2,8);
    p(-16,6,CO,5,6); p(-15,7,SK2,3,4); p(-15,7,G2,3,1);
    p( 11,6,CO,5,6); p( 12,7,SK2,3,4); p( 12,7,G2,3,1);

    // ── NECK
    p(-4,-14,CO,8,4); p(-3,-13,I3,6,2); p(-2,-13,I5,4,2);

    // ── HORNED HELM (full-face, glowing visor)
    p(-8,-28,CO,16,14); p(-7,-27,I2,14,12); p(-5,-26,I4,8,10);
    p(-7,-27,I5,14,1);                                                           // top highlight
    p(-6,-22,CO,14,3); p(-5,-21,atk?'#FFFFFF':P3,8,1);                           // visor glow
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.35;
    pUnit(ctx,cx,cy,-5,-21+idleY,atk?P4:P3,8,1,isLeft,S);
    ctx.restore();
    p(-10,-30,CO,18,4); p(-9,-29,I3,14,3); p(-9,-29,G2,14,1);                    // helm top w/ gold rim
    // Tall curved horns (gold tipped)
    p(-13,-34,CO,4,6); p(-12,-33,I3,2,5); p(-12,-36,I4,2,3); p(-12,-37,G3,2,1);
    p(  9,-34,CO,4,6); p( 10,-33,I3,2,5); p( 10,-36,I4,2,3); p( 10,-37,G3,2,1);
    // Center gold crest
    p(-2,-32,CO,4,5); p(-1,-31,G2,2,3); p(-1,-31,G3,2,1);

    // ── CHAIN WHIP (8 links + spiked maw, swinging)
    for (let i=0; i<8; i++) {
        const cx2 = 14 + i*4;
        const cy2 = -8 + i*4 + chainSwing*(i/7);
        p(cx2, cy2, CO, 4, 4);
        p(cx2+1, cy2+1, I3, 2, 2);
        p(cx2+1, cy2+1, G3, 2, 1);                                                // gold link highlight
    }
    // Spiked maw at chain end
    const mx = 14 + 8*4;
    const my = -8 + 8*4 + chainSwing;
    p(mx-1, my-1, CO, 8, 8);
    p(mx,   my,   I2, 6, 6);
    p(mx,   my,   I4, 6, 1);                                                      // highlight
    p(mx+1, my+1, P2, 4, 4);
    p(mx+2, my+2, P4, 2, 2);
    // Maw spikes
    p(mx-2, my+2, CO, 2, 2); p(mx+7, my+2, CO, 2, 2);
    p(mx+2, my-2, CO, 2, 2); p(mx+2, my+7, CO, 2, 2);
    ctx.save(); ctx.globalAlpha = 0.60 + ep * 0.35;
    pUnit(ctx,cx,cy, mx, my+idleY, P4, 6, 6, isLeft, S);
    ctx.restore();

    if (atk) {
        ctx.save(); ctx.globalAlpha = 0.75; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy, mx-2, my-2+idleY, '#FFFFFF', 12, 12, isLeft, S);
        ctx.restore();
        ctx.save(); ctx.globalCompositeOperation='lighter';
        const sx = isLeft ? cx + (mx+3)*S : cx - (mx+3)*S;
        const sy = cy + (my+3)*S + idleY*S;
        const r  = 14*S;
        const g  = ctx.createRadialGradient(sx,sy,0,sx,sy,r);
        g.addColorStop(0,'rgba(187,96,255,0.85)'); g.addColorStop(1,'transparent');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
        ctx.restore();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ICE  —  Cryomancer in pale blue crystal robes, frost wand
// ─────────────────────────────────────────────────────────────────────────────
function drawIce(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const atk    = (now - (tower.lastShot || 0)) < 350;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep    = (Math.sin(now * 0.004) + 1) / 2;
    const cryF  = Math.sin(now * 0.003) * 1.5;
    const CO='#000', SK1='#8090B0', SK2='#A8BCCC', SK3='#C8D8E8';
    const B0='#020814', B1='#061830', B2='#0A3060', B3='#0C5090', B4='#1880C0';
    const IC0='#80C4E0', IC1='#A8DCF0', IC2='#C8EEF8', IC3='#E0F4FC', IC4='#F0FAFF';
    const G2='#B88000', G3='#FFD700';

    // frost aura
    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.22;
    pUnit(ctx,cx,cy,-22,-32+idleY,IC1,44,64,isLeft,S);
    ctx.restore();

    // ── BOOTS (frost-cuffed)
    p(-12,23,CO,10,6); p(-11,24,B2,8,4); p(-10,24,IC0,4,3); p(-12,28,B0,10,1);
    p(  2,23,CO,10,6); p(  3,24,B2,8,4); p(  3,24,IC0,4,3); p(  2,28,B0,10,1);
    p(-12,23,IC2,10,1); p( 2,23,IC2,10,1);

    // ── ROBE (layered ice-crystal panels, top-highlighted)
    p(-13,6,CO,26,18); p(-12,7,B2,24,16); p(-10,7,B3,18,14); p(-8,7,IC0,12,12);
    p(-12,7,IC2,24,1);                                                            // top highlight
    p(-5,8,IC1,6,10); p(-3,9,IC2,2,8);
    // Ice crystal hem details (taller)
    for (let i=0; i<5; i++) {
        const fx = -12 + i*5;
        p(fx,22,IC1,3,5); p(fx+1,23,IC3,1,4); p(fx+1,25,IC4,1,1);
    }
    p(-12,7,IC1,2,16); p(11,7,IC1,2,16);
    for (let r=0; r<2; r++) { p(-10,11+r*5,IC4,1,1); p(10,11+r*5,IC4,1,1); }      // ice rivets

    // ── BELT (ice-gem buckle)
    p(-11,1,CO,22,6); p(-10,2,B3,20,4); p(-8,3,IC1,12,2); p(-8,5,B0,12,1);
    p(-12,1,IC2,24,1);
    p(-2,2,CO,4,4); p(-1,3,IC3,2,2); p(-1,3,IC4,2,1);                             // ice buckle

    // ── UPPER ROBE (riveted, frost gleam column)
    p(-11,-12,CO,22,20); p(-10,-11,B2,20,18); p(-8,-11,B3,16,16); p(-5,-10,IC0,8,14);
    p(-10,-11,IC2,20,1);                                                          // top highlight
    p(-2,-9,IC2,4,12);                                                            // bright column
    for (let r=0; r<3; r++) { p(-9,-8+r*5,IC4,1,1); p(8,-8+r*5,IC4,1,1); }
    // Frost gem on chest
    p(-3,-4,CO,6,6); p(-2,-3,IC1,4,4); p(-2,-3,IC3,4,1); p(-1,-2,IC4,2,2);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.40;
    pUnit(ctx,cx,cy,-3,-4+idleY,IC3,6,6,isLeft,S);
    ctx.restore();

    // ── PAULDRONS (jagged crystal shards stacked tall)
    p(-18,-15,CO,7,8); p(-17,-14,IC0,5,6); p(-16,-13,IC2,3,4); p(-17,-14,IC4,5,1);
    p(-19,-19,CO,4,5); p(-18,-18,IC1,2,4); p(-18,-18,IC3,2,1);                    // shard L
    p(-15,-20,CO,3,5); p(-14,-19,IC1,1,4); p(-14,-19,IC4,1,1);
    p( 11,-15,CO,7,8); p( 12,-14,IC0,5,6); p( 13,-13,IC2,3,4); p( 12,-14,IC4,5,1);
    p( 16,-19,CO,4,5); p( 17,-18,IC1,2,4); p( 17,-18,IC3,2,1);
    p( 13,-20,CO,3,5); p( 14,-19,IC1,1,4); p( 14,-19,IC4,1,1);

    // ── SLEEVES + HANDS
    p(-16,-8,CO,5,14); p(-15,-7,B3,3,12); p(-15,-7,IC0,2,8);
    p( 11,-8,CO,5,14); p( 12,-7,B3,3,12); p( 12,-7,IC0,2,8);
    p(-16,6,CO,5,6); p(-15,7,SK2,3,4); p(-15,7,IC2,3,1);
    p( 11,6,CO,5,6); p( 12,7,SK2,3,4); p( 12,7,IC2,3,1);

    // ── NECK
    p(-4,-14,CO,8,4); p(-3,-13,B3,6,2); p(-2,-13,IC2,4,2);

    // ── HEAD (pale ice-tinted)
    p(-8,-28,CO,16,14); p(-7,-27,SK1,14,12); p(-5,-26,SK2,8,10); p(-3,-26,SK3,4,8);
    // Silver hair (flowing)
    p(-10,-31,CO,20,7); p(-9,-30,IC0,18,5); p(-7,-30,IC1,13,4); p(-4,-30,IC2,8,2); p(-2,-29,IC4,4,1);
    // Ice circlet
    p(-9,-30,CO,18,2); p(-8,-29,IC1,16,1);
    // Eyes
    const eC = atk ? '#FFFFFF' : IC2;
    p(-7,-22,CO,5,4); p( 2,-22,CO,5,4); p(-6,-21,eC,3,2); p( 3,-21,eC,3,2);
    if (atk) { p(-5,-21,'#AADDFF',1,1); p(4,-21,'#AADDFF',1,1); }
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.30;
    pUnit(ctx,cx,cy,-6,-21+idleY,'#AADDFF',3,2,isLeft,S);
    pUnit(ctx,cx,cy, 3,-21+idleY,'#AADDFF',3,2,isLeft,S);
    ctx.restore();
    p(-1,-17,SK2,2,2); p(-3,-14,SK2,6,1);

    // ── FROST WAND (taller, gold-banded)
    p(12,-28,CO,4,42); p(13,-27,IC1,1,40); p(14,-27,B2,1,40);
    p(12,-20,G3,4,1); p(12,-8,G3,4,1); p(12,4,G3,4,1);                            // gold bands

    // ── MASSIVE CRYSTAL TOP (multi-shard, floating)
    p(10,-40+cryF,CO,8,12);
    p(11,-39+cryF,B3,6,10); p(11,-39+cryF,IC0,6,1);                               // body + highlight
    p(11,-37+cryF,IC1,4,7); p(12,-36+cryF,IC2,3,5); p(12,-35+cryF,IC3,3,3);
    p(13,-34+cryF,IC4,1,2);
    // Sub-shards
    p( 8,-36+cryF,CO,3,5); p( 9,-35+cryF,IC1,1,4); p( 9,-37+cryF,IC2,1,2);
    p(16,-36+cryF,CO,3,5); p(17,-35+cryF,IC1,1,4); p(17,-37+cryF,IC2,1,2);
    p(12,-43+cryF,CO,4,4); p(13,-42+cryF,IC1,2,3); p(13,-44+cryF,IC4,2,2);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.40;
    pUnit(ctx,cx,cy,10,-40+cryF+idleY,IC3,8,12,isLeft,S);
    ctx.restore();

    if (atk) {
        ctx.save(); ctx.globalCompositeOperation='lighter';
        const sx = isLeft ? cx + 14*S : cx - 14*S;
        const sy = cy - 36*S + idleY*S;
        const r  = (16 + Math.sin(now*0.04) * 6) * S;
        const g  = ctx.createRadialGradient(sx,sy,0,sx,sy,r);
        g.addColorStop(0,'rgba(160,230,255,0.9)');
        g.addColorStop(0.5,'rgba(50,180,255,0.5)');
        g.addColorStop(1,'transparent');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
        ctx.restore();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// TRACKER  —  Dark-leather bounty hunter, wrist crossbow, hood
// ─────────────────────────────────────────────────────────────────────────────
function drawTracker(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const atk    = (now - (tower.lastShot || 0)) < 300;
    const idleY  = Math.sin(now * 0.0022) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep = (Math.sin(now * 0.005) + 1) / 2;
    const CO='#000', SK1='#A06030', SK2='#C07040', SK3='#E89868';
    const D0='#080808', D1='#141414', D2='#242424', D3='#383838', D4='#505050', D5='#707070';
    const BR0='#1A0E04', BR1='#3C2010', BR2='#6C400A', BR3='#9A6020', BR4='#C08840';
    const G2='#B88000', G3='#FFD700';
    const EM='#00FF88', EM2='#88FFCC';

    // stealth aura (subtle dark-emerald)
    ctx.save(); ctx.globalAlpha = 0.10 + ep * 0.14;
    pUnit(ctx,cx,cy,-22,-32+idleY,EM,44,64,isLeft,S);
    ctx.restore();

    // ── DARK BOOTS (gold-cuffed)
    p(-12,23,CO,10,6); p(-11,24,D2,8,4); p(-10,24,D4,4,3); p(-12,28,D0,10,1);
    p(  2,23,CO,10,6); p(  3,24,D2,8,4); p(  3,24,D4,4,3); p(  2,28,D0,10,1);
    p(-12,23,G2,10,1); p( 2,23,G2,10,1);

    // ── SHADOW CLOAK LOWER
    p(-13,6,CO,26,18); p(-12,7,D1,24,16); p(-10,7,D2,20,15); p(-8,7,D3,12,14);
    p(-12,7,D5,24,1);                                                            // top highlight
    p(-8,7,BR2,4,16); p(-7,8,BR3,2,14);                                          // leather strap
    p(-12,7,D4,2,16); p(11,7,D4,2,16);
    for (let r=0; r<2; r++) { p(-10,11+r*5,G2,1,1); p(10,11+r*5,G2,1,1); }       // gold rivets

    // ── UTILITY BELT (gold buckles + pouches)
    p(-11,1,CO,22,6); p(-10,2,BR2,20,4); p(-8,3,BR3,12,2); p(-8,5,BR0,12,1);
    p(-12,1,G2,24,1);
    for (let i=0; i<4; i++) p(-9+i*5,2,G3,2,2);                                  // buckles
    p(-2,1,CO,4,5); p(-1,2,BR3,2,3); p(-1,2,G3,2,1);                             // center pouch

    // ── CHEST (dark layered + leather harness, riveted)
    p(-11,-12,CO,22,20); p(-10,-11,D1,20,18); p(-8,-11,D2,16,16); p(-5,-10,D3,8,14);
    p(-10,-11,D5,20,1);                                                          // top highlight
    p(-8,-8,BR2,14,12); p(-6,-7,BR3,8,10); p(-4,-6,BR4,4,8);
    p(-8,-11,D4,2,18); p(9,-11,D4,2,18);                                         // edge trim
    for (let r=0; r<3; r++) { p(-7,-7+r*4,G3,1,1); p(6,-7+r*4,G3,1,1); }         // rivets
    // Bolt pouches across chest
    p(-7,-3,CO,3,4); p(-6,-2,BR3,1,3); p(-6,-2,G3,1,1);
    p( 4,-3,CO,3,4); p( 5,-2,BR3,1,3); p( 5,-2,G3,1,1);

    // ── PAULDRONS (small leather)
    p(-18,-15,CO,7,8); p(-17,-14,D3,5,6); p(-16,-13,D5,3,4); p(-17,-14,D5,5,1);
    p( 11,-15,CO,7,8); p( 12,-14,D3,5,6); p( 13,-13,D5,3,4); p( 12,-14,D5,5,1);

    // ── SLEEVES + HANDS
    p(-16,-8,CO,5,14); p(-15,-7,D2,3,12); p(-15,-7,D3,2,8);
    p( 11,-8,CO,5,14); p( 12,-7,D2,3,12); p( 12,-7,D3,2,8);
    p(-16,6,CO,5,6); p(-15,7,SK2,3,4);
    p( 11,6,CO,5,6); p( 12,7,SK2,3,4);

    // ── NECK + COWL
    p(-4,-14,CO,8,4); p(-3,-13,D3,6,2); p(-2,-13,D5,4,2);

    // ── HOOD + FACE (deeper hood, lower-face mask)
    p(-8,-28,CO,16,14); p(-7,-27,SK1,14,12); p(-5,-26,SK2,8,10); p(-3,-26,SK3,4,8);
    p(-8,-22,D0,16,2);                                                           // shadow under hood
    p(-9,-30,CO,18,6); p(-8,-29,D1,16,5); p(-6,-29,D2,10,4);
    p(-9,-33,CO,14,4); p(-8,-32,D3,10,3);                                        // hood peak
    p(-7,-34,CO,10,3); p(-6,-33,D2,8,2);                                         // tall peak top
    // Lower-face mask (covers nose/mouth)
    p(-8,-18,CO,16,6); p(-7,-17,D2,14,4); p(-7,-17,D3,14,1);
    p(-3,-15,G3,6,1);                                                            // gold mask seam
    // Eyes (above mask, glowing emerald)
    const eC = atk ? '#FFFFFF' : EM;
    p(-7,-23,CO,5,3); p( 2,-23,CO,5,3);
    p(-6,-22,eC,3,2); p( 3,-22,eC,3,2);
    ctx.save(); ctx.globalAlpha = 0.60 + ep * 0.35;
    pUnit(ctx,cx,cy,-6,-22+idleY,EM2,3,2,isLeft,S);
    pUnit(ctx,cx,cy, 3,-22+idleY,EM2,3,2,isLeft,S);
    ctx.restore();

    // ── HEAVY WRIST CROSSBOW (raised, with scope + loaded bolt)
    // Body
    p(11,-10,CO,12,9); p(12,-9,BR2,10,7); p(12,-9,BR3,10,1);                     // body + highlight
    p(13,-7,D3,8,3);                                                              // mech inset
    // Stock
    p(20,-9,CO,4,5); p(21,-8,BR3,2,3); p(21,-8,G3,2,1);
    // Prod (limb arms — top & bottom)
    p(12,-14,CO,12,3); p(13,-13,D4,10,2); p(13,-13,D5,10,1);
    p(12,-2,CO,12,3); p(13,-1,D4,10,2); p(13,-1,D5,10,1);
    p(11,-16,CO,3,4); p(11,0,CO,3,4);                                            // limb tips
    // String
    p(14,-14,CO,1,12); p(14,-12,D5,1,10);
    // Scope (top, emerald lens)
    p(13,-18,CO,8,4); p(14,-17,D3,6,2); p(14,-17,D5,6,1);
    p(13,-19,CO,3,2); p(14,-18,EM,1,1);                                          // eyepiece
    p(20,-18,CO,3,2); p(20,-17,EM,2,1);                                          // objective lens
    ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
    pUnit(ctx,cx,cy,20,-17+idleY,EM2,2,1,isLeft,S);
    ctx.restore();
    // Loaded bolt (sliding into mech)
    p(15,-9,CO,8,3); p(16,-8,BR4,6,2); p(16,-8,G3,6,1);
    p(14,-9,CO,3,3); p(15,-8,EM,1,1);                                            // arrowhead glow
    // Pommel grip
    p(11,-2,CO,4,6); p(12,-1,BR2,2,4); p(12,-1,G3,2,1);

    if (atk) {
        ctx.save(); ctx.globalAlpha = 0.85; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy,12,-12+idleY,EM2,16,12,isLeft,S);
        ctx.restore();
        ctx.save(); ctx.globalCompositeOperation='lighter';
        const sx = isLeft ? cx + 22*S : cx - 22*S;
        const sy = cy - 8*S + idleY*S;
        const r  = 10*S;
        const g  = ctx.createRadialGradient(sx,sy,0,sx,sy,r);
        g.addColorStop(0,'rgba(0,255,120,0.85)'); g.addColorStop(1,'transparent');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
        ctx.restore();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// TALISMAN  —  East-Asian exorcist, red & gold robes, paper talisman fan
// ─────────────────────────────────────────────────────────────────────────────
function drawTalisman(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const atk    = (now - (tower.lastShot || 0)) < 350;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep    = (Math.sin(now * 0.005) + 1) / 2;
    const fSway = Math.sin(now * 0.006) * 3;
    const tOrb  = now * 0.0016;
    const CO='#000', SK1='#C07040', SK2='#E89868', SK3='#F8C090';
    const R0='#3B0000', R1='#6B0000', R2='#9B0000', R3='#CC2010', R4='#EE3020', R5='#FF6E5E';
    const G0='#3C2400', G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const W0='#A0A0A0', W2='#E0E0E0', W4='#FFFFFF';
    const H0='#080808', H1='#141424';

    // ── ceremonial fire aura
    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnit(ctx,cx,cy,-22,-32+idleY,R4,44,64,isLeft,S);
    ctx.restore();

    // ── ORBITING PAPER TALISMANS (4)
    for (let i=0; i<4; i++) {
        const a  = tOrb + i * (Math.PI / 2);
        const ox = Math.cos(a) * 19;
        const oy = Math.sin(a) * 11 - 6;
        p(ox-2, oy-3, CO, 5, 7);
        p(ox-1, oy-2, W2, 3, 5);
        p(ox-1, oy-2, W4, 3, 1);                                                  // highlight
        p(ox-1, oy   , R3, 3, 1);                                                  // red seal line
        p(ox  , oy+2 , R2, 1, 1);                                                  // seal dot
    }

    // ── BOOTS (gold-cuffed)
    p(-12,23,CO,10,6); p(-11,24,R2,8,4); p(-10,24,R3,4,3); p(-12,28,R0,10,1);
    p(  2,23,CO,10,6); p(  3,24,R2,8,4); p(  3,24,R3,4,3); p(  2,28,R0,10,1);
    p(-12,23,G2,10,1); p( 2,23,G2,10,1);

    // ── RED CEREMONIAL ROBE (top-highlighted, gold bands)
    p(-13,6,CO,26,18); p(-12,7,R1,24,16); p(-10,7,R2,20,15); p(-7,7,R3,12,14);
    p(-12,7,R4,24,1);                                                             // top highlight
    p(-5,8,G2,6,1); p(-5,14,G2,6,1); p(-5,20,G2,6,1);                             // gold stripe bands
    p(-12,7,G3,2,16); p(11,7,G3,2,16);
    p(-10,20,W2,20,4);                                                            // white undershirt trim
    for (let r=0; r<2; r++) { p(-9,11+r*5,G3,1,1); p(8,11+r*5,G3,1,1); }          // gold rivets

    // ── BELT (gold sash, scroll buckle)
    p(-11,1,CO,22,6); p(-10,2,G2,20,4); p(-8,3,G4,10,2); p(-8,5,G0,12,1);
    p(-12,1,G3,24,1);
    p(-2,1,CO,4,5); p(-1,2,R3,2,3); p(-1,2,G3,2,1);

    // ── UPPER ROBE (riveted, gold front panel)
    p(-11,-12,CO,22,20); p(-10,-11,R1,20,18); p(-8,-11,R2,16,16); p(-5,-10,R3,8,14);
    p(-10,-11,R4,20,1);                                                           // top highlight
    p(-3,-9,G2,4,12); p(-2,-8,G3,2,10);                                           // gold front panel
    p(-11,-11,G3,2,18); p(10,-11,G3,2,18);
    for (let r=0; r<3; r++) { p(-9,-8+r*5,G3,1,1); p(8,-8+r*5,G3,1,1); }

    // ── PAULDRONS (gold-capped)
    p(-18,-15,CO,7,8); p(-17,-14,R3,5,6); p(-16,-13,R5,3,4); p(-17,-14,G3,5,1);
    p( 11,-15,CO,7,8); p( 12,-14,R3,5,6); p( 13,-13,R5,3,4); p( 12,-14,G3,5,1);

    // ── SLEEVES + HANDS
    p(-16,-8,CO,5,14); p(-15,-7,R2,3,12); p(-15,-7,R3,2,8);
    p( 11,-8,CO,5,14); p( 12,-7,R2,3,12); p( 12,-7,R3,2,8);
    p(-16,6,CO,5,6); p(-15,7,SK2,3,4); p(-15,7,G2,3,1);
    p( 11,6,CO,5,6); p( 12,7,SK2,3,4); p( 12,7,G2,3,1);

    // ── NECK
    p(-4,-14,CO,8,4); p(-3,-13,R3,6,2); p(-2,-13,G3,4,2);

    // ── HEAD
    p(-8,-28,CO,16,14); p(-7,-27,SK1,14,12); p(-5,-26,SK2,8,10); p(-3,-26,SK3,4,8);
    // Larger topknot with gold hairpin + crown
    p(-10,-31,CO,20,7); p(-9,-30,H0,18,5); p(-7,-30,H1,13,4);
    p(-3,-34,CO,6,5); p(-2,-33,H0,4,4); p(-2,-33,H1,4,1);                         // topknot bun
    p(-2,-31,G3,6,3); p(-1,-30,G4,4,1);                                           // gold hairpin
    p(-1,-37,CO,3,3); p( 0,-36,G3,1,2);                                           // pin top
    const eC = atk ? '#FFEE00' : SK3;
    p(-7,-22,CO,5,3); p( 2,-22,CO,5,3);
    p(-6,-21,eC,3,2); p( 3,-21,eC,3,2);
    p(-1,-17,SK1,2,2); p(-3,-14,SK1,6,1);

    // ── HUGE TALISMAN FAN (held high)
    // Fan ribs spread out
    for (let i=0; i<6; i++) {
        const fx = 10 + i*2;
        const fc = i % 2 === 0 ? W2 : G3;
        p(fx, -32+fSway, CO, 2, 24);
        p(fx, -31+fSway, fc, 2, 22);
    }
    // Fan top edge (golden crescent)
    p(10, -32+fSway, G3, 14, 2); p(10, -32+fSway, G4, 14, 1);
    // Painted seals on fan face (kanji-style)
    p(12, -28+fSway, R3, 2, 2); p(15, -28+fSway, R3, 2, 2); p(18, -28+fSway, R3, 2, 2);
    p(13, -22+fSway, R3, 1, 3); p(16, -22+fSway, R3, 1, 3); p(19, -22+fSway, R3, 1, 3);
    p(12, -16+fSway, R3, 2, 1); p(15, -16+fSway, R3, 2, 1); p(18, -16+fSway, R3, 2, 1);
    // Fan handle (gold-trimmed)
    p(20, -32+fSway, CO, 4, 28); p(21, -31+fSway, G2, 2, 26); p(21, -31+fSway, G3, 2, 1);
    p(20, -8+fSway, CO, 4, 4); p(21, -7+fSway, G3, 2, 2);                         // pommel tassel
    // Tassel cord
    p(22, -4+fSway, R3, 1, 6); p(22, 2+fSway, R3, 1, 2);
    ctx.save(); ctx.globalAlpha = 0.45 + ep * 0.35;
    pUnit(ctx,cx,cy,10,-32+fSway+idleY,G4,14,24,isLeft,S);
    ctx.restore();

    if (atk) {
        ctx.save(); ctx.globalAlpha = 0.75; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy,8,-34+idleY,'#FFFFFF',18,28,isLeft,S);
        ctx.restore();
        ctx.save(); ctx.globalCompositeOperation='lighter';
        const sx = isLeft ? cx + 18*S : cx - 18*S;
        const sy = cy - 18*S + idleY*S;
        const r  = 18*S;
        const g  = ctx.createRadialGradient(sx,sy,0,sx,sy,r);
        g.addColorStop(0,'rgba(255,220,50,0.85)');
        g.addColorStop(0.5,'rgba(255,50,0,0.45)');
        g.addColorStop(1,'transparent');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
        ctx.restore();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MONK  —  Battle monk in ochre robes, bare arms, prayer beads + iron fists
// ─────────────────────────────────────────────────────────────────────────────
function drawMonk(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const atk    = (now - (tower.lastShot || 0)) < 300;
    const idleY  = Math.sin(now * 0.0025) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep = (Math.sin(now * 0.007) + 1) / 2;
    const CO='#000', SK1='#C07040', SK2='#E89868', SK3='#F8C090', SK4='#FFDCB8';
    const O0='#2A1200', O1='#5C2A00', O2='#904800', O3='#CC6000', O4='#EE8800', O5='#FFBB44';
    const W0='#A8A090', W1='#C8C0A0', W2='#E0D8B0', W3='#F0ECE0';
    const G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const KI='#FFCC44', KI2='#FFFFFF';

    // ── ki aura
    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.22;
    pUnit(ctx,cx,cy,-22,-32+idleY,O4,44,64,isLeft,S);
    ctx.restore();

    // ── BOOTS (gold-cuffed)
    p(-12,23,CO,10,6); p(-11,24,O1,8,4); p(-10,24,O3,4,3); p(-12,28,O0,10,1);
    p(  2,23,CO,10,6); p(  3,24,O1,8,4); p(  3,24,O3,4,3); p(  2,28,O0,10,1);
    p(-12,23,G3,10,1); p( 2,23,G3,10,1);

    // ── OCHRE ROBE
    p(-13,6,CO,26,18); p(-12,7,O1,24,16); p(-10,7,O2,20,15); p(-7,7,O3,12,14);
    p(-12,7,O5,24,1);                                                             // top highlight
    p(-12,7,W2,2,16); p(11,7,W2,2,16);

    // ── WHITE SASH (prayer-bead row + center knot)
    p(-11,1,CO,22,6); p(-10,2,W1,20,4); p(-8,3,W3,12,2); p(-8,5,W0,12,1);
    for (let i=0; i<6; i++) p(-10+i*4,2,G3,2,2);                                  // beads
    p(-2,1,CO,4,5); p(-1,2,O3,2,3); p(-1,2,G3,2,1);                               // sash knot

    // ── UPPER ROBE (open chest, riveted)
    p(-11,-12,CO,22,20); p(-10,-11,O2,20,18); p(-8,-11,O3,16,16); p(-5,-10,O4,8,14);
    p(-10,-11,O5,20,1);                                                           // top highlight
    p(-11,-11,W2,2,18); p(10,-11,W2,2,18);
    // Big sacred rune tattoo on chest
    p(-4,-7,CO,8,10); p(-3,-6,SK2,6,8); p(-3,-6,SK3,6,1);
    p(-2,-5,O3,4,2); p(-2,-2,O3,4,2);                                             // rune horizontal bars
    p(-1,-7,O3,2,10);                                                             // rune vertical
    p(-1,-7,G3,2,1); p(-1, 2,G3,2,1);                                             // gold caps
    ctx.save(); ctx.globalAlpha = 0.45 + ep * 0.40;
    pUnit(ctx,cx,cy,-4,-7+idleY,KI,8,10,isLeft,S);
    ctx.restore();
    // Prayer-bead necklace draping
    p(-4,-12,CO,8,2);
    for (let i=0; i<5; i++) p(-3+i*2,-11,G3,1,1);

    // ── BARE MUSCULAR ARMS
    p(-16,-8,CO,5,22); p(-15,-7,SK2,3,20); p(-14,-6,SK3,2,18);
    p( 11,-8,CO,5,22); p( 12,-7,SK2,3,20); p( 13,-6,SK3,2,18);
    // Muscle definition
    p(-14,-3,SK1,2,2); p(-14,4,SK1,2,2);
    p( 13,-3,SK1,2,2); p( 13,4,SK1,2,2);
    // Tribal arm bands (gold)
    p(-16,-4,CO,5,3); p(-15,-3,G2,3,1); p(-15,-3,G3,3,1);
    p( 11,-4,CO,5,3); p( 12,-3,G2,3,1); p( 12,-3,G3,3,1);
    p(-16,3,CO,5,2); p(-15,3,G3,3,1);
    p( 11,3,CO,5,2); p( 12,3,G3,3,1);

    // ── IRON-KNUCKLE FISTS w/ permanent ki glow
    p(-17,12,CO,6,7); p(-16,13,W0,4,5); p(-16,13,W3,4,1);                         // L fist + iron
    p(-16,15,CO,4,2); p(-15,16,G3,2,1);                                           // knuckle band
    p( 11,12,CO,6,7); p( 12,13,W0,4,5); p( 12,13,W3,4,1);                         // R fist
    p( 12,15,CO,4,2); p( 13,16,G3,2,1);
    // Ki glow on fists (always visible)
    ctx.save(); ctx.globalAlpha = 0.50 + ep * 0.40;
    pUnit(ctx,cx,cy,-17,12+idleY,KI,6,7,isLeft,S);
    pUnit(ctx,cx,cy, 11,12+idleY,KI,6,7,isLeft,S);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.40 + ep * 0.30;
    pUnit(ctx,cx,cy,-19,10+idleY,O5,10,11,isLeft,S);
    pUnit(ctx,cx,cy,  9,10+idleY,O5,10,11,isLeft,S);
    ctx.restore();

    // ── NECK
    p(-4,-14,CO,8,4); p(-3,-13,SK2,6,2); p(-2,-13,SK3,4,2);

    // ── SHAVED HEAD (with battle scar + forehead dot)
    p(-8,-28,CO,16,14); p(-7,-27,SK1,14,12); p(-5,-26,SK2,8,10); p(-3,-26,SK3,4,8);
    p(-8,-30,CO,16,4); p(-7,-29,SK1,14,3); p(-5,-29,SK2,8,2);                     // shaved top
    // Forehead bindi (red dot)
    p(-1,-26,O3,2,2); p(-1,-26,O4,2,1);
    const eC = atk ? '#FF8800' : SK3;
    p(-7,-22,CO,5,4); p( 2,-22,CO,5,4);
    p(-6,-21,eC,3,2); p( 3,-21,eC,3,2);
    if (atk) { p(-5,-21,'#FFEE44',1,1); p(4,-21,'#FFEE44',1,1); }
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.30;
    pUnit(ctx,cx,cy,-6,-21+idleY,KI,3,2,isLeft,S);
    pUnit(ctx,cx,cy, 3,-21+idleY,KI,3,2,isLeft,S);
    ctx.restore();
    p(-7,-24,CO,5,1); p(2,-24,CO,5,1);                                            // brows
    // Larger battle scar (diagonal)
    p(-6,-26,SK1,1,1); p(-5,-25,SK1,1,1); p(-4,-24,SK1,1,1); p(-3,-23,SK1,1,1);
    p(-1,-17,SK1,2,2); p(-3,-14,SK1,6,1);

    if (atk) {
        ctx.save(); ctx.globalCompositeOperation='lighter';
        for (const dx of [-15, 11]) {
            const sx = isLeft ? cx + dx*S : cx - dx*S;
            const sy = cy + 13*S + idleY*S;
            const r  = 16*S;
            const g  = ctx.createRadialGradient(sx,sy,0,sx,sy,r);
            g.addColorStop(0,'rgba(255,180,50,0.85)');
            g.addColorStop(0.5,'rgba(255,100,0,0.45)');
            g.addColorStop(1,'transparent');
            ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
        }
        ctx.restore();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// NECROMANCER  —  Dark summoner in skull-adorned robes, bone staff
// ─────────────────────────────────────────────────────────────────────────────
function drawNecromancer(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const atk    = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.0018) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep   = (Math.sin(now * 0.005) + 1) / 2;
    const skOrb = now * 0.0014;
    const CO='#000', SK2='#A8A0A0';
    const P0='#0A000A', P1='#180018', P2='#300040', P3='#500070', P4='#8000B0', P5='#B040D0';
    const G2='#808000', G3='#B8B000', G4='#E0D800';
    const BN0='#1A1410', BN1='#382C20', BN2='#605040', BN3='#907060', BN4='#C0A080';
    const NG='#44FF66', NG2='#AAFFAA';                                            // necro green

    // ── void aura (sickly green)
    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.22;
    pUnit(ctx,cx,cy,-22,-32+idleY,NG,44,64,isLeft,S);
    ctx.restore();

    // ── 3 FLOATING SKULL FAMILIARS (orbiting)
    for (let i=0; i<3; i++) {
        const a  = skOrb + i * (Math.PI * 2 / 3);
        const ox = Math.cos(a) * 22;
        const oy = Math.sin(a) * 13 - 12;
        // Skull
        p(ox-2, oy-2, CO, 6, 6);
        p(ox-1, oy-1, BN2, 4, 4);
        p(ox-1, oy-1, BN4, 4, 1);                                                 // top highlight
        p(ox-1, oy+1, CO, 1, 1); p(ox+1, oy+1, CO, 1, 1);                        // eye sockets
        // Glow
        ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.30;
        pUnit(ctx,cx,cy,ox-1,oy+1+idleY,NG,1,1,isLeft,S);
        pUnit(ctx,cx,cy,ox+1,oy+1+idleY,NG,1,1,isLeft,S);
        ctx.restore();
    }

    // ── BOOTS (gold-cuffed)
    p(-12,23,CO,10,6); p(-11,24,P2,8,4); p(-10,24,P3,4,3); p(-12,28,P0,10,1);
    p(  2,23,CO,10,6); p(  3,24,P2,8,4); p(  3,24,P3,4,3); p(  2,28,P0,10,1);
    p(-12,23,G3,10,1); p( 2,23,G3,10,1);

    // ── VOID ROBE (top-highlighted, skull hem trim)
    p(-13,6,CO,26,18); p(-12,7,P1,24,16); p(-10,7,P2,20,15); p(-7,7,P3,12,14);
    p(-12,7,P5,24,1);                                                             // top highlight
    // Skull hem trim (3 skulls)
    for (let i=0; i<3; i++) {
        const fx = -10 + i*7;
        p(fx,20,CO,6,6); p(fx+1,21,BN2,4,4); p(fx+1,21,BN4,4,1);
        p(fx+1,22,CO,1,1); p(fx+3,22,CO,1,1);                                     // eye sockets
        p(fx+2,24,CO,2,1);                                                        // teeth
    }
    p(-12,7,G3,2,16); p(11,7,G3,2,16);
    for (let r=0; r<2; r++) { p(-9,11+r*5,G2,1,1); p(8,11+r*5,G2,1,1); }          // gold rivets

    // ── BELT (bone buckle)
    p(-11,1,CO,22,6); p(-10,2,P3,20,4); p(-8,3,G3,12,2); p(-8,5,P0,12,1);
    p(-12,1,G2,24,1);
    p(-2,1,CO,4,5); p(-1,2,BN3,2,3); p(-1,2,BN4,2,1);                             // small skull buckle
    p(-1,3,CO,1,1); p( 0,3,CO,1,1);

    // ── UPPER ROBE (riveted, green-gold sacred glyph)
    p(-11,-12,CO,22,20); p(-10,-11,P1,20,18); p(-8,-11,P2,16,16); p(-5,-10,P3,8,14);
    p(-10,-11,P5,20,1);                                                           // top highlight
    p(-4,-7,CO,8,10); p(-3,-6,G2,6,8); p(-2,-5,G3,4,6); p(-1,-4,G4,2,4);          // glyph
    p(-3,-6,NG,6,1);                                                              // green energy line
    ctx.save(); ctx.globalAlpha = 0.50 + ep * 0.35;
    pUnit(ctx,cx,cy,-4,-7+idleY,NG,8,10,isLeft,S);
    ctx.restore();
    for (let r=0; r<3; r++) { p(-9,-8+r*5,G3,1,1); p(8,-8+r*5,G3,1,1); }

    // ── PAULDRONS (skull-capped, larger)
    p(-18,-15,CO,7,9); p(-17,-14,P3,5,7); p(-16,-13,P4,3,5); p(-17,-14,P5,5,1);
    p(-17,-18,CO,5,5); p(-16,-17,BN2,3,3); p(-16,-17,BN4,3,1);                    // skull cap L
    p(-16,-16,CO,1,1); p(-14,-16,CO,1,1);                                         // skull eyes
    p( 11,-15,CO,7,9); p( 12,-14,P3,5,7); p( 13,-13,P4,3,5); p( 12,-14,P5,5,1);
    p( 12,-18,CO,5,5); p( 13,-17,BN2,3,3); p( 13,-17,BN4,3,1);                    // skull cap R
    p( 13,-16,CO,1,1); p( 15,-16,CO,1,1);

    // ── SLEEVES + HANDS
    p(-16,-8,CO,5,14); p(-15,-7,P2,3,12); p(-15,-7,P3,2,8);
    p( 11,-8,CO,5,14); p( 12,-7,P2,3,12); p( 12,-7,P3,2,8);
    p(-16,6,CO,5,6); p(-15,7,SK2,3,4); p(-15,7,P3,3,1);
    p( 11,6,CO,5,6); p( 12,7,SK2,3,4); p( 12,7,P3,3,1);

    // ── DEEP HOOD (taller, fully shadowed face)
    p(-8,-28,CO,16,14); p(-7,-27,P2,14,12); p(-5,-26,P3,8,10); p(-3,-26,P4,4,8);
    p(-9,-30,CO,18,6); p(-8,-29,P1,16,5); p(-6,-29,P2,8,4);
    p(-9,-33,CO,14,4); p(-8,-32,P2,8,3);                                          // hood peak
    p(-8,-35,CO,12,3); p(-7,-34,P1,10,2);                                         // tall peak top
    p(-6,-23,CO,12,8); p(-5,-22,P1,8,6);                                          // shadowed face
    // Glowing eyes from hood
    const eC = atk ? '#FFFFFF' : NG;
    p(-6,-22,CO,4,3); p( 2,-22,CO,4,3);
    p(-5,-21,eC,2,2); p( 3,-21,eC,2,2);
    ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
    pUnit(ctx,cx,cy,-6,-22+idleY,NG2,4,3,isLeft,S);
    pUnit(ctx,cx,cy, 2,-22+idleY,NG2,4,3,isLeft,S);
    ctx.restore();

    // ── BONE STAFF (taller, glowing skull top)
    p(12,-28,CO,4,42); p(13,-27,BN3,1,40); p(14,-27,BN1,1,40);
    p(12,-20,BN4,4,2); p(12,-8,BN4,4,2); p(12,4,BN4,4,2);                         // joint nodes
    // Big skull top (multi-layered)
    p( 9,-36,CO,12,12); p(10,-35,BN2,10,10); p(10,-35,BN4,10,1);                  // top highlight
    p(11,-34,BN3,8,8); p(12,-33,BN4,6,6);
    p(10,-32,CO,3,4); p(15,-32,CO,3,4);                                           // eye sockets (larger)
    p(11,-31,NG,1,2); p(16,-31,NG,1,2);                                           // eye glow
    p(11,-29,CO,8,3);                                                              // teeth row
    p(12,-29,BN4,1,2); p(14,-29,BN4,1,2); p(16,-29,BN4,1,2);                      // teeth highlights
    p( 9,-38,CO,5,3); p(10,-37,BN3,3,1); p(16,-38,CO,5,3); p(17,-37,BN3,3,1);     // horn nubs
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.40;
    pUnit(ctx,cx,cy,10,-32+idleY,NG,3,4,isLeft,S);
    pUnit(ctx,cx,cy,15,-32+idleY,NG,3,4,isLeft,S);
    ctx.restore();

    if (atk) {
        ctx.save(); ctx.globalAlpha = 0.75; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy,7,-38+idleY,NG2,16,16,isLeft,S);
        ctx.restore();
        ctx.save(); ctx.globalCompositeOperation='lighter';
        const sx = isLeft ? cx + 14*S : cx - 14*S;
        const sy = cy - 32*S + idleY*S;
        const r  = (18 + Math.sin(now*0.04) * 6) * S;
        const g  = ctx.createRadialGradient(sx,sy,0,sx,sy,r);
        g.addColorStop(0,'rgba(80,255,80,0.85)');
        g.addColorStop(0.5,'rgba(80,200,80,0.45)');
        g.addColorStop(1,'transparent');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
        ctx.restore();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// GUARDIAN  —  Heavy gold plate knight, tower shield + morning star
// ─────────────────────────────────────────────────────────────────────────────
function drawGuardian(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const atk    = (now - (tower.lastShot || 0)) < 350;
    const idleY  = Math.sin(now * 0.0018) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep   = (Math.sin(now * 0.004) + 1) / 2;
    const plumF = Math.sin(now * 0.005) * 1.5;
    const CO='#000', SK2='#E89868';
    const G0='#3C2400', G1='#7A5000', G2='#B88000', G3='#FFD700', G4='#FFF4A0', G5='#FFFCC0';
    const P0='#424250', P1='#7A7A90', P3='#D8D8E8';
    const B0='#0A1248', B2='#1A30A8', B3='#2848CC', B4='#4488FF';

    // golden aura
    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.18;
    pUnit(ctx,cx,cy,-26,-34+idleY,G3,52,68,isLeft,S);
    ctx.restore();

    // ── GREAVES (thick gold plate, riveted)
    p(-13,22,CO,12,8); p(-12,23,G2,10,6); p(-11,23,G3,6,5); p(-11,23,G4,2,2);
    p(-12,23,G5,10,1);
    p(  1,22,CO,12,8); p(  2,23,G2,10,6); p(  2,23,G3,6,5); p(  2,23,G4,2,2);
    p(  2,23,G5,10,1);
    p(-9,28,CO,2,2); p(7,28,CO,2,2);                                              // toe ornament

    // ── HEAVY LOWER PLATE (top-highlighted, riveted)
    p(-14,5,CO,28,18); p(-13,6,G2,26,16); p(-11,6,G3,20,14); p(-8,7,G4,12,12);
    p(-13,6,G5,26,1);                                                             // top highlight
    p(-12,6,G1,2,16); p(11,6,G1,2,16);
    for (let r=0; r<2; r++) { p(-11,10+r*5,CO,1,1); p(10,10+r*5,CO,1,1); }        // rivets

    // ── BELT (heavy plate cinch)
    p(-12,0,CO,24,7); p(-11,1,G1,22,5); p(-9,2,G3,16,3); p(-7,3,G4,8,1);
    p(-2,1,CO,4,5); p(-1,2,G4,2,3); p(-1,2,G5,2,1);                               // gold buckle

    // ── CHEST PLATE (massive, glowing cross)
    p(-12,-13,CO,24,20); p(-11,-12,G2,22,18); p(-9,-11,G3,18,16); p(-6,-10,G4,10,14);
    p(-11,-12,G5,22,1);                                                           // top highlight
    p(-11,-12,G1,2,18); p(10,-12,G1,2,18);
    // Bold sacred cross (gold glowing)
    p(-2,-11,CO,4,16); p(-1,-10,G3,2,14); p(-1,-10,G5,2,2);
    p(-6,-6,CO,12,4); p(-5,-5,G3,10,2); p(-5,-5,G5,10,1);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.40;
    pUnit(ctx,cx,cy,-2,-11+idleY,G5,4,16,isLeft,S);
    pUnit(ctx,cx,cy,-6,-6+idleY,G5,12,4,isLeft,S);
    ctx.restore();
    for (let r=0; r<3; r++) { p(-11,-8+r*5,CO,1,1); p(10,-8+r*5,CO,1,1); }        // rivets

    // ── MASSIVE PAULDRONS (spiked, gold-trimmed)
    p(-20,-14,CO,10,11); p(-19,-13,G2,8,9); p(-19,-13,G3,5,6); p(-18,-12,G4,2,3);
    p(-19,-13,G5,8,1);
    p(-21,-17,CO,4,4); p(-20,-16,G3,2,3); p(-20,-16,G5,2,1);                      // spike L
    p(-15,-18,CO,3,4); p(-14,-17,G3,1,3);                                         // spike L inner
    p( 10,-14,CO,10,11); p( 11,-13,G2,8,9); p( 11,-13,G3,5,6); p( 12,-12,G4,2,3);
    p( 11,-13,G5,8,1);
    p( 17,-17,CO,4,4); p( 18,-16,G3,2,3); p( 18,-16,G5,2,1);
    p( 12,-18,CO,3,4); p( 13,-17,G3,1,3);

    // ── SLEEVES + GAUNTLETS
    p(-18,-8,CO,5,16); p(-17,-7,G2,3,14); p(-17,-7,G3,2,10);
    p( 11,-8,CO,5,16); p( 12,-7,G2,3,14); p( 12,-7,G3,2,10);
    p(-18,6,CO,6,7); p(-17,7,G2,4,5); p(-17,7,G4,2,2); p(-17,7,G5,4,1);
    p( 11,6,CO,6,7); p( 12,7,G2,4,5); p( 12,7,G4,2,2); p( 12,7,G5,4,1);

    // ── NECK
    p(-4,-14,CO,8,4); p(-3,-13,G2,6,2); p(-2,-13,G4,4,2);

    // ── GRAND HELM (ornate, glowing T-visor)
    p(-8,-28,CO,16,14); p(-7,-27,G2,14,12); p(-5,-26,G3,10,10); p(-3,-25,G4,6,8);
    p(-7,-27,G5,14,1);                                                            // top highlight
    p(-8,-14,CO,16,2); p(-7,-13,G2,14,1);                                         // gold helm rim
    // T-slit visor (glowing)
    p(-7,-22,CO,4,8); p(-5,-22,atk?B4:G1,2,6);
    p(-3,-22,CO,4,8); p(-1,-22,atk?B4:G1,2,6);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.35;
    pUnit(ctx,cx,cy,-5,-22+idleY,B4,2,6,isLeft,S);
    pUnit(ctx,cx,cy,-1,-22+idleY,B4,2,6,isLeft,S);
    ctx.restore();
    // Side gold flanges
    p(-9,-26,G2,2,12); p( 7,-26,G2,2,12);

    // ── TALL BLUE PLUME CREST (flowing)
    p(-6,-32+plumF,CO,12,8); p(-5,-31+plumF,B2,10,6); p(-4,-31+plumF,B3,6,5);
    p(-2,-32+plumF,B4,4,4); p(-1,-33+plumF,P3,2,3);
    p(-3,-36+plumF,CO,6,4); p(-2,-35+plumF,B3,4,3); p(-2,-37+plumF,B4,4,2);
    p(-1,-39+plumF,'#88BBFF',2,2);

    // ── TOWER SHIELD (gigantic, ornate gold rim + glowing cross)
    p(-26,-12,CO,12,34); p(-25,-11,G2,10,32); p(-24,-11,G3,6,30); p(-23,-10,G4,4,28);
    p(-25,-11,G5,10,1);                                                           // top highlight
    p(-26,-12,G3,12,2); p(-26,20,G3,12,2);                                        // gold top/bottom rim
    p(-26,-12,G3,1,34); p(-15,-12,G3,1,34);                                       // gold side rims
    p(-22,-12,G1,2,32);                                                           // inner shadow
    // Bold sacred cross
    p(-21,-6,CO,5,18); p(-20,-5,G3,3,16); p(-20,-5,G5,3,1);
    p(-25,3,CO,11,5); p(-24,4,G3,9,3); p(-24,4,G5,9,1);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.40;
    pUnit(ctx,cx,cy,-21,-6+idleY,G5,5,18,isLeft,S);
    pUnit(ctx,cx,cy,-25,3+idleY,G5,11,5,isLeft,S);
    ctx.restore();
    // Shield rivets at corners
    p(-25,-10,CO,1,1); p(-15,-10,CO,1,1); p(-25,19,CO,1,1); p(-15,19,CO,1,1);

    // ── MORNING STAR (bigger ball + more spikes)
    p(12,-22,CO,4,32); p(13,-21,G2,1,30); p(14,-21,G1,1,30);                      // handle
    p(12,-14,G3,4,1); p(12,-4,G3,4,1); p(12,6,G3,4,1);                            // gold bands
    // Ball (bigger)
    p( 9,-24,CO,10,10); p(10,-23,G2,8,8); p(11,-22,G3,6,6); p(11,-22,G4,6,1);
    p(12,-21,G5,4,4);                                                             // bright center
    // 8 spikes
    for (const [dx,dy] of [[-1,-4],[3,-4],[-4,0],[5,0],[-1,4],[3,4],[-3,-3],[5,3]]) {
        p(10+dx,-23+dy,CO,3,3); p(11+dx,-22+dy,G3,1,1);
    }
    if (atk) {
        ctx.save(); ctx.globalAlpha = 0.78; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy,7,-26+idleY,G5,14,14,isLeft,S);
        ctx.restore();
    }

    if (atk) {
        ctx.save(); ctx.globalCompositeOperation='lighter';
        const sx = isLeft ? cx + 14*S : cx - 14*S;
        const sy = cy - 18*S + idleY*S;
        const r  = (20 + Math.sin(now*0.04) * 8) * S;
        const g  = ctx.createRadialGradient(sx,sy,0,sx,sy,r);
        g.addColorStop(0,'rgba(255,230,100,0.85)');
        g.addColorStop(0.5,'rgba(255,180,20,0.45)');
        g.addColorStop(1,'transparent');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
        ctx.restore();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ALCHEMIST  —  Mad scientist in emerald robes, alchemical circle on chest
// ─────────────────────────────────────────────────────────────────────────────
function drawAlchemist(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const atk    = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep   = (Math.sin(now * 0.005) + 1) / 2;
    const bubT = now * 0.003;
    const CO='#000', SK1='#C07040', SK2='#E89868', SK3='#F8C090';
    const E0='#002200', E1='#004400', E2='#006600', E3='#00AA00', E4='#44CC44', E5='#88FF88';
    const G0='#3C2400', G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const T0='#000020', T1='#002040', T2='#004080', T3='#0080CC', T4='#40AAEE';
    const PR='#AA44FF';                                                            // potion purple
    const H0='#080808', H2='#283448', H3='#485870';

    // emerald aura
    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.20;
    pUnit(ctx,cx,cy,-22,-32+idleY,E3,44,64,isLeft,S);
    ctx.restore();

    // ── BOOTS (gold-cuffed)
    p(-12,23,CO,10,6); p(-11,24,E2,8,4); p(-10,24,E3,4,3); p(-12,28,E0,10,1);
    p(  2,23,CO,10,6); p(  3,24,E2,8,4); p(  3,24,E3,4,3); p(  2,28,E0,10,1);
    p(-12,23,G3,10,1); p( 2,23,G3,10,1);

    // ── EMERALD ROBE (top-highlighted)
    p(-13,6,CO,26,18); p(-12,7,E1,24,16); p(-10,7,E2,20,15); p(-7,7,E3,12,14);
    p(-12,7,E5,24,1);                                                              // top highlight
    p(-5,8,T2,6,12);                                                               // teal undercloth
    p(-12,7,G3,2,16); p(11,7,G3,2,16);
    for (let r=0; r<2; r++) { p(-9,11+r*5,G3,1,1); p(8,11+r*5,G3,1,1); }           // gold rivets

    // ── BELT (gold w/ vial pouch)
    p(-11,1,CO,22,6); p(-10,2,G2,20,4); p(-8,3,G4,10,2); p(-8,5,G0,12,1);
    p(-12,1,G3,24,1);
    p(-2,1,CO,4,5); p(-1,2,T3,2,3); p(-1,2,T4,2,1);                                // potion buckle
    // Hanging vials on belt
    p(-9,6,CO,3,4); p(-8,7,PR,1,2); p(-8,7,'#DD88FF',1,1);
    p( 6,6,CO,3,4); p( 7,7,T4,1,2); p( 7,7,'#88EEFF',1,1);

    // ── UPPER ROBE (riveted)
    p(-11,-12,CO,22,20); p(-10,-11,E1,20,18); p(-8,-11,E2,16,16); p(-5,-10,E3,8,14);
    p(-10,-11,E5,20,1);                                                            // top highlight
    p(-11,-11,E3,2,18); p(10,-11,E3,2,18);

    // ── LARGER GLOWING ALCHEMICAL CIRCLE (animated rotation, double ring)
    const rot = now * 0.002;
    ctx.save();
    ctx.translate(cx, cy + (-2 + idleY) * S);
    ctx.strokeStyle = G3; ctx.lineWidth = S;
    ctx.beginPath(); ctx.arc(0, 0, 9*S, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = G4; ctx.lineWidth = S * 0.6;
    ctx.beginPath(); ctx.arc(0, 0, 6*S, 0, Math.PI*2); ctx.stroke();
    ctx.rotate(rot);
    ctx.strokeStyle = G3; ctx.lineWidth = S;
    for (let i=0; i<6; i++) {
        const ang = i * Math.PI / 3;
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ang) * 8 * S, Math.sin(ang) * 8 * S); ctx.stroke();
    }
    // Pentagram star points
    ctx.strokeStyle = E4; ctx.lineWidth = S * 0.6;
    ctx.rotate(-rot * 2);
    ctx.beginPath();
    for (let i=0; i<5; i++) {
        const a = i * (Math.PI * 2 / 5) - Math.PI / 2;
        const x = Math.cos(a) * 5 * S;
        const y = Math.sin(a) * 5 * S;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.stroke();
    ctx.restore();

    // ── PAULDRONS (gold-capped)
    p(-18,-15,CO,7,8); p(-17,-14,E3,5,6); p(-16,-13,E4,3,4); p(-17,-14,E5,5,1);
    p(-17,-14,G3,5,1);
    p( 11,-15,CO,7,8); p( 12,-14,E3,5,6); p( 13,-13,E4,3,4); p( 12,-14,E5,5,1);
    p( 12,-14,G3,5,1);

    // ── SLEEVES + HANDS
    p(-16,-8,CO,5,14); p(-15,-7,E2,3,12); p(-15,-7,E3,2,8);
    p( 11,-8,CO,5,14); p( 12,-7,E2,3,12); p( 12,-7,E3,2,8);
    p(-16,6,CO,5,6); p(-15,7,SK2,3,4); p(-15,7,G3,3,1);
    p( 11,6,CO,5,6); p( 12,7,SK2,3,4); p( 12,7,G3,3,1);

    // ── OFF-HAND POTION VIAL (left hand, smaller bubbling)
    p(-19,2,CO,5,8); p(-18,3,T2,3,6); p(-18,3,T4,3,1);
    p(-18,5,PR,3,3); p(-18,5,'#DD88FF',3,1);
    p(-19,1,CO,5,2); p(-18,1,G3,3,1);                                              // cap
    ctx.save(); ctx.globalAlpha = 0.50 + ep * 0.40;
    pUnit(ctx,cx,cy,-19,2+idleY,PR,5,8,isLeft,S);
    ctx.restore();

    // ── NECK + GOGGLE MASK
    p(-4,-14,CO,8,4); p(-3,-13,E3,6,2);
    p(-8,-28,CO,16,14); p(-7,-27,SK1,14,12); p(-5,-26,SK2,8,10); p(-3,-26,SK3,4,8);
    // Goggles (bigger, glowing)
    p(-8,-23,CO,10,5); p(-7,-22,T3,4,3); p( 1,-22,T3,4,3);
    p(-6,-21,T4,2,1); p( 2,-21,T4,2,1);
    p(-3,-22,CO,2,1);                                                              // bridge
    ctx.save(); ctx.globalAlpha = 0.60 + ep * 0.30;
    pUnit(ctx,cx,cy,-7,-22+idleY,T4,4,3,isLeft,S);
    pUnit(ctx,cx,cy, 1,-22+idleY,T4,4,3,isLeft,S);
    ctx.restore();
    // Wild brown hair w/ singed tips
    p(-10,-31,CO,20,7); p(-9,-30,H0,18,5); p(-7,-30,H2,10,4); p(-5,-30,H3,6,2);
    p(-11,-32,CO,4,4); p(-10,-31,H0,2,3); p(-10,-34,'#553300',2,2);                // singed tuft L
    p( 7,-32,CO,4,4); p( 8,-31,H0,2,3); p( 8,-34,'#553300',2,2);                   // singed tuft R
    p(-1,-17,SK1,2,2); p(-3,-14,SK1,6,1);

    // ── BIG BUBBLING FLASK STAFF (taller, multi-layered)
    p(12,-28,CO,4,42); p(13,-27,G2,1,40); p(14,-27,E0,1,40);
    p(12,-20,G3,4,1); p(12,-8,G3,4,1); p(12,4,G3,4,1);                             // gold bands
    // Flask top (bigger, multi-color liquid)
    p( 8,-38,CO,12,12); p( 9,-37,T1,10,10); p( 9,-37,T3,10,1);                     // glass + top sheen
    p(10,-36,T3,8,8); p(11,-35,T4,6,5);
    // Liquid layers (3-color stratified)
    p(10,-30,PR,8,2);                                                              // purple bottom
    p(10,-32,E3,8,2);                                                              // green mid
    p(10,-34,T4,8,2);                                                              // teal top
    // Cork + label
    p(11,-40,CO,6,4); p(12,-39,G3,4,3); p(12,-39,G4,4,1);                          // gold cork
    p(11,-26,CO,8,2); p(12,-25,'#FFFCC0',6,1);                                     // label
    // Rising bubbles (3 animated)
    for (let i=0; i<3; i++) {
        const bx = 11 + (i % 2) * 4;
        const by = -28 - ((bubT * 6 + i * 4) % 10);
        ctx.save(); ctx.globalAlpha = 0.75;
        pUnit(ctx,cx,cy,bx,by+idleY,E5,2,2,isLeft,S);
        ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = 0.50 + ep * 0.40;
    pUnit(ctx,cx,cy, 8,-38+idleY,E5,12,12,isLeft,S);
    ctx.restore();

    if (atk) {
        ctx.save(); ctx.globalAlpha = 0.78; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy,6,-40+idleY,'#88FFCC',16,16,isLeft,S);
        ctx.restore();
        ctx.save(); ctx.globalCompositeOperation='lighter';
        const sx = isLeft ? cx + 14*S : cx - 14*S;
        const sy = cy - 32*S + idleY*S;
        const r  = (16 + Math.sin(now*0.04) * 8) * S;
        const g  = ctx.createRadialGradient(sx,sy,0,sx,sy,r);
        g.addColorStop(0,'rgba(0,255,160,0.85)');
        g.addColorStop(0.5,'rgba(0,200,80,0.45)');
        g.addColorStop(1,'transparent');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
        ctx.restore();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MIRROR  —  Reflection mage in silver & white, holds a sacred mirror
// ─────────────────────────────────────────────────────────────────────────────
function drawMirror(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const atk    = (now - (tower.lastShot || 0)) < 350;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep    = (Math.sin(now * 0.005) + 1) / 2;
    const mPulse= (Math.sin(now * 0.006) + 1) / 2;
    const shdT  = now * 0.0014;
    const CO='#000', SK1='#C07040', SK2='#E89868', SK3='#F8C090';
    const M0='#181820', M1='#303040', M2='#606070', M3='#9090A0', M4='#C0C0D0', M5='#E8E8F0';
    const W0='#B0B8C4', W1='#C8D0DC', W2='#E0E4EC', W3='#F2F4F8', W4='#FAFBFF';
    const G2='#B88000', G3='#FFD700', G4='#FFF4A0';
    const CB='#88CCFF';

    // silver aura
    ctx.save(); ctx.globalAlpha = 0.13 + ep * 0.20;
    pUnit(ctx,cx,cy,-22,-32+idleY,M5,44,64,isLeft,S);
    ctx.restore();

    // ── 4 ORBITING MIRROR SHARDS
    for (let i=0; i<4; i++) {
        const a  = shdT + i * (Math.PI / 2);
        const ox = Math.cos(a) * 20;
        const oy = Math.sin(a) * 12 - 8;
        p(ox-2, oy-2, CO, 5, 5);
        p(ox-1, oy-1, M3, 3, 3);
        p(ox-1, oy-1, W4, 3, 1);                                                  // reflective top
        ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.30;
        pUnit(ctx,cx,cy,ox-1,oy-1+idleY,CB,3,3,isLeft,S);
        ctx.restore();
    }

    // ── BOOTS (gold-cuffed)
    p(-12,23,CO,10,6); p(-11,24,M2,8,4); p(-10,24,M3,4,3); p(-12,28,M0,10,1);
    p(  2,23,CO,10,6); p(  3,24,M2,8,4); p(  3,24,M3,4,3); p(  2,28,M0,10,1);
    p(-12,23,G3,10,1); p( 2,23,G3,10,1);

    // ── SILVER ROBE (top-highlighted)
    p(-13,6,CO,26,18); p(-12,7,M1,24,16); p(-10,7,M2,20,15); p(-7,7,M3,12,14);
    p(-12,7,M5,24,1);                                                             // top highlight
    p(-5,8,W1,6,12);
    p(-12,7,G3,2,16); p(11,7,G3,2,16);
    for (let r=0; r<2; r++) { p(-9,11+r*5,G3,1,1); p(8,11+r*5,G3,1,1); }          // gold rivets

    // ── BELT (silver, glowing gem buckle)
    p(-11,1,CO,22,6); p(-10,2,M3,20,4); p(-8,3,M4,12,2); p(-8,5,M0,12,1);
    p(-12,1,G3,24,1);
    p(-2,1,CO,4,5); p(-1,2,CB,2,3); p(-1,2,W4,2,1);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.35;
    pUnit(ctx,cx,cy,-1,2+idleY,CB,2,3,isLeft,S);
    ctx.restore();

    // ── UPPER ROBE (riveted)
    p(-11,-12,CO,22,20); p(-10,-11,M1,20,18); p(-8,-11,M2,16,16); p(-5,-10,M3,8,14);
    p(-10,-11,M5,20,1);                                                           // top highlight
    p(-2,-9,W2,4,12);                                                             // bright column
    p(-11,-11,G3,2,18); p(10,-11,G3,2,18);
    for (let r=0; r<3; r++) { p(-9,-8+r*5,G3,1,1); p(8,-8+r*5,G3,1,1); }
    // Mirror gem on chest
    p(-2,-4,CO,4,5); p(-1,-3,M4,2,3); p(-1,-3,W4,2,1);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.35;
    pUnit(ctx,cx,cy,-2,-4+idleY,CB,4,5,isLeft,S);
    ctx.restore();

    // ── PAULDRONS (ornate silver, gold-trimmed)
    p(-18,-15,CO,7,8); p(-17,-14,M3,5,6); p(-16,-13,M4,3,4); p(-17,-14,M5,5,1);
    p(-17,-14,G3,5,1);
    p( 11,-15,CO,7,8); p( 12,-14,M3,5,6); p( 13,-13,M4,3,4); p( 12,-14,M5,5,1);
    p( 12,-14,G3,5,1);

    // ── SLEEVES + HANDS
    p(-16,-8,CO,5,14); p(-15,-7,M2,3,12); p(-15,-7,M3,2,8);
    p( 11,-8,CO,5,14); p( 12,-7,M2,3,12); p( 12,-7,M3,2,8);
    p(-16,6,CO,5,6); p(-15,7,SK2,3,4); p(-15,7,G3,3,1);
    p( 11,6,CO,5,6); p( 12,7,SK2,3,4); p( 12,7,G3,3,1);

    // ── NECK + HEAD
    p(-4,-14,CO,8,4); p(-3,-13,M3,6,2); p(-2,-13,W3,4,2);
    p(-8,-28,CO,16,14); p(-7,-27,SK1,14,12); p(-5,-26,SK2,8,10); p(-3,-26,SK3,4,8);
    // Silver ornate headband (gold trim, large center gem)
    p(-9,-29,CO,18,5); p(-8,-28,M3,16,3); p(-7,-28,M4,12,2);
    p(-8,-28,G3,16,1);                                                            // gold trim
    p(-3,-32,CO,6,6); p(-2,-31,G3,4,4); p(-2,-31,G4,4,1); p(-1,-30,CB,2,2);       // big gem ornament
    ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
    pUnit(ctx,cx,cy,-2,-31+idleY,CB,4,4,isLeft,S);
    ctx.restore();
    const eC = atk ? '#FFFFFF' : SK3;
    p(-7,-22,CO,5,4); p( 2,-22,CO,5,4);
    p(-6,-21,eC,3,2); p( 3,-21,eC,3,2);
    if (atk) { p(-5,-21,CB,1,1); p(4,-21,CB,1,1); }
    p(-1,-17,SK1,2,2); p(-3,-14,SK1,6,1);

    // ── LARGE SACRED MIRROR (held, ornate gold filigree frame)
    // Frame outer
    p( 9,-28,CO,14,24); p(10,-27,G2,12,22); p(10,-27,G3,12,1);                    // outer rim + highlight
    p(11,-26,G3,10,20); p(11,-26,G4,10,1);
    // Inner reflective face
    p(12,-25,CO,8,18);
    p(13,-24,M2,6,16);
    p(13,-24,M3,6,8);                                                             // upper sky reflection
    p(13,-16,M4,6,8);                                                             // lower bright reflection
    p(14,-23,W2,4,14); p(15,-22,W4,2,12);
    // Mirror cross-glint (always)
    p(15,-20,W4,2,1); p(16,-22,W4,1,5);
    ctx.save(); ctx.globalAlpha = 0.45 + mPulse * 0.40;
    pUnit(ctx,cx,cy,13,-24+idleY,W4,6,16,isLeft,S);
    ctx.restore();
    // Frame decorative corner studs (gold)
    p( 9,-28,CO,3,3); p(10,-27,G4,1,1);
    p(20,-28,CO,3,3); p(21,-27,G4,1,1);
    p( 9,-7,CO,3,3); p(10,-6,G4,1,1);
    p(20,-7,CO,3,3); p(21,-6,G4,1,1);
    // Handle (long, ornate gold)
    p(14,-5,CO,4,18); p(15,-4,G2,2,16); p(15,-4,G3,2,1);
    p(13,-3,CO,6,3); p(14,-2,G3,4,1);                                             // handle collar
    p(14,12,CO,4,4); p(15,13,G3,2,2);                                             // pommel

    if (atk) {
        ctx.save(); ctx.globalCompositeOperation='screen';
        const sx = isLeft ? cx + 17*S : cx - 17*S;
        const sy = cy - 16*S + idleY*S;
        const r  = 22*S;
        const g  = ctx.createRadialGradient(sx,sy,0,sx,sy,r);
        g.addColorStop(0,`rgba(220,240,255,${0.7+mPulse*0.3})`);
        g.addColorStop(0.5,'rgba(180,220,255,0.4)');
        g.addColorStop(1,'transparent');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
        ctx.restore();
        // Mirror beam projected forward
        ctx.save(); ctx.globalAlpha = 0.85; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy,24,-22+idleY,W4,16,12,isLeft,S);
        ctx.restore();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSASSIN  —  Shadow blade in black, dual daggers + void-step effect
// ─────────────────────────────────────────────────────────────────────────────
function drawAssassin(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const atk    = (now - (tower.lastShot || 0)) < 250;
    const idleY  = Math.sin(now * 0.0028) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const ep   = (Math.sin(now * 0.006) + 1) / 2;
    const CO='#000', SK1='#A06030', SK2='#C07040';
    const D0='#030306', D1='#0A0A12', D2='#14141E', D3='#202030', D4='#303045', D5='#444460';
    const P0='#200030', P1='#3C0060', P2='#6000A0', P3='#9020CC', P4='#BB60FF', P5='#DD88FF';
    const G3='#FFD700';
    const BL0='#101018', BL1='#181828', BL2='#242438', BL3='#383850', BL4='#9090B0';

    // void aura (subtle dark purple)
    ctx.save(); ctx.globalAlpha = 0.12 + ep * 0.18;
    pUnit(ctx,cx,cy,-22,-32+idleY,P3,44,64,isLeft,S);
    ctx.restore();

    // ── SHADOW AFTERIMAGE (faint silhouette behind body)
    ctx.save(); ctx.globalAlpha = 0.25 + ep * 0.18;
    pUnit(ctx,cx,cy,-12,-12+idleY,P1,24,40,isLeft,S);
    ctx.restore();

    // ── BOOTS
    p(-12,23,CO,10,6); p(-11,24,D2,8,4); p(-10,24,D3,4,3); p(-12,28,D0,10,1);
    p(  2,23,CO,10,6); p(  3,24,D2,8,4); p(  3,24,D3,4,3); p(  2,28,D0,10,1);
    p(-12,23,P2,10,1); p( 2,23,P2,10,1);                                          // purple cuffs

    // ── TIGHT DARK SUIT (lean silhouette)
    p(-11,6,CO,22,18); p(-10,7,D1,20,16); p(-9,7,D2,16,15); p(-7,7,D3,10,14);
    p(-10,7,D5,20,1);                                                             // top highlight
    p(-10,7,P1,2,16); p(9,7,P1,2,16);                                             // purple lining

    // ── UTILITY BELT (purple buckle + scabbard clips)
    p(-10,1,CO,20,6); p(-9,2,D3,18,4); p(-7,3,P2,8,2);
    p(-10,1,P2,20,1);                                                             // top edge
    p(-8,2,CO,3,3); p(5,2,CO,3,3);                                                // scabbard clips
    p(-2,1,CO,4,5); p(-1,2,P3,2,3); p(-1,2,P5,2,1);                               // glowing buckle gem
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.35;
    pUnit(ctx,cx,cy,-1,2+idleY,P4,2,3,isLeft,S);
    ctx.restore();

    // ── UPPER TORSO (slim, bandolier + purple chest rune)
    p(-10,-12,CO,20,20); p(-9,-11,D1,18,18); p(-8,-11,D2,14,16); p(-5,-10,D3,8,14);
    p(-9,-11,D5,18,1);                                                            // top highlight
    p(-9,-9,P2,6,12); p(-8,-8,P3,3,10);                                           // bandolier
    p(-10,-11,D4,2,18); p(9,-11,D4,2,18);
    // Purple rune
    p(-3,-6,CO,6,8); p(-2,-5,P2,4,6); p(-2,-5,P4,4,1);
    p(-1,-4,P5,2,4);
    ctx.save(); ctx.globalAlpha = 0.45 + ep * 0.40;
    pUnit(ctx,cx,cy,-3,-6+idleY,P4,6,8,isLeft,S);
    ctx.restore();

    // ── SMALL PAULDRONS (spiked)
    p(-17,-14,CO,6,7); p(-16,-13,D3,4,5); p(-15,-13,D5,2,3); p(-16,-13,P2,4,1);
    p(-18,-16,CO,3,3); p(-17,-15,P3,1,2);                                         // spike L
    p( 11,-14,CO,6,7); p( 12,-13,D3,4,5); p( 13,-13,D5,2,3); p( 12,-13,P2,4,1);
    p( 15,-16,CO,3,3); p( 16,-15,P3,1,2);

    // ── SLEEVES + HANDS (tight)
    p(-15,-8,CO,4,14); p(-14,-7,D2,2,12); p(-14,-7,D3,1,8);
    p( 10,-8,CO,4,14); p( 11,-7,D2,2,12); p( 11,-7,D3,1,8);
    p(-15,6,CO,4,6); p(-14,7,SK2,2,4); p(-14,7,P2,2,1);
    p( 10,6,CO,4,6); p( 11,7,SK2,2,4); p( 11,7,P2,2,1);

    // ── NECK + MASKED FACE
    p(-4,-14,CO,8,4); p(-3,-13,D2,6,2);
    p(-8,-28,CO,16,14); p(-7,-27,D1,14,12); p(-5,-26,D2,8,10); p(-3,-26,D3,4,8);
    // Ninja hood + tall peak
    p(-9,-30,CO,18,6); p(-8,-29,D1,16,5);
    p(-9,-33,CO,14,4); p(-8,-32,D2,10,3);
    p(-8,-35,CO,12,3); p(-7,-34,D1,10,2);                                         // tall peak top
    p(-8,-22,D2,16,8);                                                            // face wrap
    p(-8,-22,D5,16,1);                                                            // wrap highlight
    // Glowing eyes (menacing)
    const eC = atk ? '#FFFFFF' : P4;
    p(-7,-24,CO,5,3); p( 2,-24,CO,5,3);
    p(-6,-23,eC,3,2); p( 3,-23,eC,3,2);
    ctx.save(); ctx.globalAlpha = 0.65 + ep * 0.30;
    pUnit(ctx,cx,cy,-6,-23+idleY,P5,3,2,isLeft,S);
    pUnit(ctx,cx,cy, 3,-23+idleY,P5,3,2,isLeft,S);
    ctx.restore();

    // ── DUAL DAGGERS (longer, void-edged)
    // Left dagger (reverse grip — pointing down-back)
    p(-17,-18,CO,3,30); p(-16,-17,BL2,1,28); p(-15,-17,BL1,1,28);                 // shaft
    p(-16,-17,BL4,1,28);                                                          // highlight stripe
    p(-19,-20,CO,5,4); p(-18,-19,D3,3,2); p(-18,-19,G3,3,1);                      // handle pommel
    p(-19,-14,CO,4,2); p(-18,-13,G3,2,1);                                         // crossguard
    // Purple void edge L
    p(-17,-12,P3,1,1); p(-17,-4,P3,1,1); p(-17,4,P3,1,1);
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.35;
    pUnit(ctx,cx,cy,-17,-18+idleY,P4,3,30,isLeft,S);
    ctx.restore();

    // Right dagger (forward grip — pointing up-out)
    p(13,-26,CO,3,30); p(14,-25,BL2,1,28); p(15,-25,BL1,1,28);                    // shaft
    p(14,-25,BL4,1,28);                                                           // highlight
    p(13,4,CO,5,4); p(14,5,D3,3,2); p(14,5,G3,3,1);                               // handle pommel
    p(13,-2,CO,4,2); p(14,-1,G3,2,1);                                             // crossguard
    p(15,-20,P3,1,1); p(15,-12,P3,1,1); p(15,-4,P3,1,1);                          // void edge R
    ctx.save(); ctx.globalAlpha = 0.55 + ep * 0.35;
    pUnit(ctx,cx,cy,13,-26+idleY,P4,3,30,isLeft,S);
    ctx.restore();

    if (atk) {
        ctx.save(); ctx.globalAlpha = 0.80; ctx.globalCompositeOperation = 'screen';
        // Slash trails on both blades
        pUnit(ctx,cx,cy,-20,-18+idleY,P5,8,30,isLeft,S);
        pUnit(ctx,cx,cy,12,-28+idleY,P5,8,30,isLeft,S);
        ctx.restore();
        ctx.save(); ctx.globalCompositeOperation='lighter';
        for (const [dx,dy] of [[-17,-12],[14,-14]]) {
            const sx = isLeft ? cx + dx*S : cx - dx*S;
            const sy = cy + dy*S + idleY*S;
            const r  = 14*S;
            const g  = ctx.createRadialGradient(sx,sy,0,sx,sy,r);
            g.addColorStop(0,'rgba(187,96,255,0.85)');
            g.addColorStop(1,'transparent');
            ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
        }
        ctx.restore();
    }
}

// ─────── EXPORTS ─────────────────────────────────────────────────────────────
window.drawKnight       = drawKnight;
window.drawFire         = drawFire;
window.drawArcher       = drawArcher;
window.drawChainer      = drawChainer;
window.drawIce          = drawIce;
window.drawTracker      = drawTracker;
window.drawTalisman     = drawTalisman;
window.drawMonk         = drawMonk;
window.drawNecromancer  = drawNecromancer;
window.drawGuardian     = drawGuardian;
window.drawAlchemist    = drawAlchemist;
window.drawMirror       = drawMirror;
window.drawAssassin     = drawAssassin;

// ─────────────────────────────────────────────────────────────────────────────
// VERSE WARRIOR  —  수련생 퇴마사 전용 공격형 — prayer-bead melee warrior
// ─────────────────────────────────────────────────────────────────────────────
function drawVerseWarrior(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const atk    = (now - (tower.lastShot || 0)) < 350;
    const idleY  = Math.sin(now * 0.0018) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const hPulse = (Math.sin(now * 0.003) + 1) / 2;
    const pgOrb  = now * 0.0012;
    const CO='#000', SK1='#C07848', SK2='#E8A070', SK3='#FFCC99';
    const R0='#A0A0A0', R1='#D0D0D0', R2='#F0F0F0', R3='#FFFFFF';                 // white robe layers
    const G0='#5A4000', G1='#B8860B', G2='#FFD700', G3='#FFF4A0', G4='#FFFDE7';   // gold trim
    const RD='#9B0000', RD2='#CC2020';                                            // crimson accent

    // ── HALO GLOW (back, large pulsing)
    ctx.save(); ctx.globalAlpha = 0.26 + hPulse * 0.22;
    pUnit(ctx,cx,cy,-14,-34+idleY,G2,28,16,isLeft,S);
    ctx.restore();

    // ── SCRIPTURE PAGES orbiting (4 floating pages)
    for (let i = 0; i < 4; i++) {
        const a  = pgOrb + i * (Math.PI / 2);
        const ox = Math.cos(a) * 18;
        const oy = Math.sin(a) * 11 - 6;
        p(ox-2, oy-3+idleY*0, CO, 5, 6);
        p(ox-1, oy-2+idleY*0, R2, 3, 4);
        p(ox-1, oy-1+idleY*0, G2, 3, 1);
    }

    // ── BOOTS (sandaled, gold strap)
    p(-11,22,CO,9,6); p(-10,23,R0,7,4); p(-10,24,R1,7,2); p(-11,28,CO,9,1);
    p(  2,22,CO,9,6); p( 3,23,R0,7,4); p( 3,24,R1,7,2); p(  2,28,CO,9,1);
    p(-11,23,G2,9,1); p( 2,23,G2,9,1);

    // ── WHITE ROBE LOWER (full-size, layered, gold hem)
    p(-12,5,CO,24,20); p(-11,6,R0,22,18); p(-9,6,R1,18,17); p(-6,7,R2,12,15); p(-3,8,R3,6,13);
    p(-11,6,R3,22,1);                                                             // top highlight
    // Crimson scripture sash down center
    p(-2,6,RD,4,18); p(-1,7,RD2,2,16);
    // Gold hem
    p(-12,22,G2,24,2); p(-10,24,G3,20,1);
    // Vertical gold robe trims
    p(-12,6,G2,2,18); p(10,6,G2,2,18);

    // ── BELT (gold sash + cross buckle)
    p(-11,1,CO,22,6); p(-10,2,G1,20,4); p(-8,3,G2,12,2); p(-8,5,G0,12,1);
    p(-2,2,CO,4,4); p(-1,3,G3,2,2);

    // ── UPPER ROBE / TORSO
    p(-11,-12,CO,22,18); p(-10,-11,R0,20,16); p(-8,-11,R1,16,14); p(-5,-10,R2,10,12); p(-3,-9,R3,6,10);
    p(-10,-11,R3,20,1);                                                           // top highlight
    p(-11,-12,G2,22,1);                                                           // gold collar
    // Vertical gold robe trim
    p(-11,-11,G2,2,18); p(9,-11,G2,2,18);
    // Large golden cross emblem
    p(-2,-9,CO,4,12); p(-1,-8,G2,2,10); p(-1,-8,G3,1,10);
    p(-5,-5,CO,10,4); p(-4,-4,G2,8,2); p(-3,-4,G3,6,1);
    ctx.save(); ctx.globalAlpha = 0.50 + hPulse * 0.40;
    pUnit(ctx,cx,cy,-5,-5+idleY,G3,10,4,isLeft,S);
    pUnit(ctx,cx,cy,-2,-9+idleY,G3,4,12,isLeft,S);
    ctx.restore();

    // ── PAULDRONS (gold-rim)
    p(-17,-15,CO,7,8); p(-16,-14,R0,5,6); p(-15,-13,R2,3,4); p(-16,-14,R3,5,1);
    p(-16,-14,G2,5,1);                                                            // gold cap
    p( 10,-15,CO,7,8); p( 11,-14,R0,5,6); p( 12,-13,R2,3,4); p( 11,-14,R3,5,1);
    p( 11,-14,G2,5,1);

    // ── ARMS (long white sleeves, gold cuffs)
    p(-16,-9,CO,5,16); p(-15,-8,R0,3,14); p(-15,-8,R1,2,10);
    p( 11,-9,CO,5,16); p( 12,-8,R0,3,14); p( 12,-8,R1,2,10);
    p(-16,6,G2,5,2); p( 11,6,G2,5,2);                                             // cuffs
    p(-16,8,CO,5,5); p(-15,9,SK1,3,3);                                            // hand L
    p( 11,8,CO,5,5); p( 12,9,SK1,3,3);                                            // hand R

    // ── PRAYER BEADS (looped around L wrist, hanging)
    for (let i = 0; i < 4; i++) {
        const bx = -14;
        const by = 12 + i * 2;
        p(bx,by,CO,3,2); p(bx+1,by,G2,1,1);
    }

    // ── HOLY WAR HAMMER (massive — weapon hand side)
    // Handle
    p(13,-26,CO,4,42); p(14,-25,G1,2,40); p(14,-25,G2,1,40);
    p(13,-18,G3,4,1); p(13,-8,G3,4,1); p(13,2,G3,4,1);                            // gold grip bands
    // Hammer head (ornate, cross-shaped face)
    p( 9,-32,CO,12,12); p(10,-31,R0,10,10); p(10,-31,R1,10,1);                   // head body + highlight
    p(11,-30,R2,8,8); p(12,-29,R3,6,6);
    p( 9,-32,G2,12,2); p( 9,-22,G2,12,2);                                         // gold top/bottom strips
    p( 9,-32,G2,2,12); p(19,-32,G2,2,12);                                         // gold side strips
    // Embossed cross on hammer face
    p(13,-30,CO,4,8); p(14,-29,G2,2,6); p(14,-29,G3,1,6);
    p(11,-27,CO,8,2); p(12,-26,G2,6,1);
    ctx.save(); ctx.globalAlpha = 0.50 + hPulse * 0.40;
    pUnit(ctx,cx,cy,11,-30+idleY,G3,8,8,isLeft,S);
    ctx.restore();
    // Pommel
    p(13,16,CO,4,5); p(14,17,G2,2,3); p(14,17,G3,2,1);
    // Attack flash
    if (atk) {
        ctx.save(); ctx.globalAlpha = 0.80; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy,7,-34+idleY,'#FFFFFF',16,16,isLeft,S);
        ctx.restore();
    }

    // ── NECK / COLLAR
    p(-4,-14,CO,8,4); p(-3,-13,R1,6,2); p(-2,-13,R3,4,2);

    // ── HEAD (full SD-size)
    p(-8,-28,CO,16,14); p(-7,-27,SK1,14,12); p(-5,-26,SK2,8,10); p(-3,-25,SK3,4,7);
    // White hood
    p(-9,-30,CO,18,5); p(-8,-29,R1,16,4); p(-6,-28,R2,10,3);
    p(-9,-32,CO,14,3); p(-8,-31,R1,10,2);                                         // peak
    p(-9,-30,G2,18,1);                                                            // gold hood band
    // Eyes (resolute)
    const eC = atk ? '#FFEE00' : '#4488FF';
    p(-5,-22,CO,4,3); p( 1,-22,CO,4,3);
    p(-4,-21,eC,2,2); p( 2,-21,eC,2,2);
    ctx.save(); ctx.globalAlpha = 0.55 + hPulse * 0.30;
    pUnit(ctx,cx,cy,-4,-21+idleY,'#AACCFF',2,2,isLeft,S);
    pUnit(ctx,cx,cy, 2,-21+idleY,'#AACCFF',2,2,isLeft,S);
    ctx.restore();
    p(-1,-17,SK1,2,2); p(-3,-14,SK1,6,1);

    // ── GOLDEN HALO RING (around head, prominent)
    p(-11,-34,CO,22,3); p(-10,-33,G2,20,2); p(-10,-33,G3,20,1);
    p(-12,-32,CO,3,4); p( 9,-32,CO,3,4);
    p(-11,-31,G2,2,3); p( 10,-31,G2,2,3);
    ctx.save(); ctx.globalAlpha = 0.62 + hPulse * 0.30;
    pUnit(ctx,cx,cy,-11,-34+idleY,G3,22,3,isLeft,S);
    ctx.restore();
    // Halo light rays
    p(-2,-38,G2,4,3); p(-1,-40,G3,2,2);                                           // top ray
    p(-9,-37,G2,2,2); p( 7,-37,G2,2,2);                                           // side rays
}

// ─────────────────────────────────────────────────────────────────────────────
// HYMN BLASTER  —  수련생 퇴마사 전용 공격형 — sonic holy wave cannon
// ─────────────────────────────────────────────────────────────────────────────
function drawHymnBlaster(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const atk    = (now - (tower.lastShot || 0)) < 300;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const pulse  = (Math.sin(now * 0.006) + 1) / 2;
    const CO='#000';
    const C0='#001840', C1='#002870', C2='#0040A8', C3='#3060C8';
    const BR1='#806000', BR2='#C09000', BR3='#FFD700';
    const CA0='#1A1A28', CA1='#3A3A50', CA2='#666680';
    const DE1='#8888FF', DE2='#AAAAFF', DE3='#EEEEFF';
    const SK='#C88060';

    // Cannon divine energy aura
    ctx.save(); ctx.globalAlpha = (0.14 + pulse * 0.18) * (atk ? 2.2 : 1.0);
    pUnit(ctx,cx,cy, isLeft ? 8 : -26, -6+idleY, DE2, 24, 14, isLeft, S);
    ctx.restore();

    // ── BOOTS ──
    p(-10,22,CO,9,7); p(-9,23,C2,7,5); p(-7,24,C3,3,3); p(-10,28,C1,9,1);
    p(  1,22,CO,9,7); p( 2,23,C2,7,5); p( 2,24,C3,3,3); p(  1,28,C1,9,1);

    // ── LEGS (military trousers with gold side stripe) ──
    p(-10,8,CO,20,14); p(-9,9,C0,18,12); p(-7,9,C1,14,10); p(-5,10,C2,10,8);
    p(-10,13,BR2,20,1); p(-10,17,BR2,20,1); // trouser stripes

    // ── MILITARY COAT BODY (deep blue, brass buttons) ──
    p(-10,-12,CO,20,20); p(-9,-11,C0,18,18); p(-7,-11,C1,14,16); p(-5,-10,C2,10,14); p(-3,-9,C3,6,12);
    p(-1,-8,BR2,2,2); p(-1,-4,BR2,2,2); p(-1,0,BR2,2,2); p(-1,4,BR2,2,2); // brass buttons
    p(-1,-8,BR3,1,1); p(-1,-4,BR3,1,1); p(-1,0,BR3,1,1); p(-1,4,BR3,1,1); // button highlights
    p(-8,-11,BR1,2,12); p(-7,-10,BR2,2,10); p(6,-11,BR1,2,12); p(5,-10,BR2,2,10); // gold lapels

    // ── BELT ──
    p(-10,8,CO,20,4); p(-9,9,BR1,18,2); p(-7,9,BR2,12,1);

    // ── GOLD EPAULETTES (with fringe) ──
    p(-18,-16,CO,8,5); p(-17,-15,BR1,6,4); p(-16,-14,BR2,4,3); p(-15,-13,BR3,2,2);
    p(-18,-12,BR2,8,2); p(-17,-13,BR3,6,1);
    p( 10,-16,CO,8,5); p( 11,-15,BR1,6,4); p( 11,-14,BR2,4,3); p( 11,-13,BR3,2,2);
    p( 10,-12,BR2,8,2); p( 11,-13,BR3,6,1);

    // ── ARMS ──
    p(-17,-12,CO,6,22); p(-16,-11,C0,4,20); p(-15,-11,C1,3,16); p(-14,-9,C2,2,12);
    p( 11,-12,CO,6,22); p( 12,-11,C0,4,20); p( 12,-11,C1,3,16); p( 12,-9,C2,2,12);
    p(-17, 9,CO,6,7); p(-16,10,BR1,4,5); p(-15,10,BR2,3,3); // cuff L
    p( 11, 9,CO,6,7); p( 12,10,BR1,4,5); p( 12,10,BR2,3,3); // cuff R

    // ── LARGE HOLY CANNON (dominant weapon, shoulder-held — 18 art-px long × 6 tall) ──
    const cx2 = isLeft ? 9 : -27;
    p(cx2,  -6,CO, 4,10); p(cx2+1,-5,CA0,2,8); p(cx2+1,-5,CA1,1,6); // stock/grip
    p(cx2+2,-12,CO,20,8);                                              // barrel outline
    p(cx2+3,-11,CA0,18,6); p(cx2+4,-10,CA1,16,4); p(cx2+5,-9,CA2,12,2); // barrel body
    p(cx2+4, -12,BR1,2,8); p(cx2+4, -11,BR2,1,6);  // ornate gold band 1
    p(cx2+10,-12,BR1,2,8); p(cx2+10,-11,BR2,1,6);  // ornate gold band 2
    p(cx2+16,-12,BR1,2,8); p(cx2+16,-11,BR2,1,6);  // ornate gold band 3
    p(cx2+7, -10,BR3,1,1); p(cx2+13,-10,BR3,1,1);  // musical rune engravings
    p(cx2+8,  -9,DE1,1,1); p(cx2+14, -9,DE1,1,1);  // rune note stems
    p(cx2+19,-12,CO,4,8); p(cx2+20,-11,DE1,2,6); p(cx2+20,-10,DE2,2,4); p(cx2+21,-10,DE3,1,3); // muzzle
    ctx.save(); ctx.globalAlpha = 0.55 + pulse * 0.40;
    pUnit(ctx,cx,cy,cx2+19,-12+idleY,DE3,4,8,isLeft,S); // muzzle glow
    ctx.restore();
    if (atk) {
        ctx.save(); ctx.globalAlpha = 0.88; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy,cx2+19,-16+idleY,DE3,10,16,isLeft,S); // divine discharge
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.90;
        pUnit(ctx,cx,cy,cx2+22,-12+idleY,DE2,8,8,isLeft,S);   // muzzle flash
        ctx.restore();
    }

    // ── FLOATING MUSICAL NOTES (gold dots in arc) ──
    for (let i = 0; i < 4; i++) {
        const nx = -14 + i * 6;
        const ny = -22 - Math.sin(now * 0.004 + i * 0.9) * 5;
        ctx.save(); ctx.globalAlpha = 0.52 + pulse * 0.30;
        pUnit(ctx,cx,cy,nx,  ny  +idleY,BR3,2,2,isLeft,S); // note head
        pUnit(ctx,cx,cy,nx+1,ny-3+idleY,BR3,1,3,isLeft,S); // note stem
        ctx.restore();
    }

    // ── NECK ──
    p(-4,-14,CO,8,2); p(-3,-13,SK,6,1);

    // ── HEAD ──
    p(-8,-28,CO,16,14); p(-7,-27,SK,14,12); p(-5,-26,C3,6,6); p(-4,-25,SK,4,4);
    p(-5,-22,CO,2,2); p(1,-22,CO,2,2);
    p(-4,-21,atk?DE3:'#BBCCFF',1,2); p(2,-21,atk?DE3:'#BBCCFF',1,2);

    // ── MILITARY BICORNE HAT ──
    p(-9,-30,CO,18,4); p(-8,-29,C0,16,3); p(-6,-29,C1,8,2); // brim
    p(-8,-34,CO,14,6); p(-7,-33,C0,12,5); p(-5,-32,C1,8,4); p(-3,-31,C2,4,3); // crown
    p(-11,-33,CO,4,5); p(-10,-32,C2,2,4); // left bicorne peak
    p(  8,-33,CO,4,5); p(  8,-32,C2,2,4); // right bicorne peak
    p(-2,-32,BR1,4,4); p(-1,-31,BR2,2,3); p(0,-31,BR3,2,2); // gold emblem on front
    p(-8,-32,BR2,2,1); p(6,-32,BR2,2,1); // side detail lines
}

// ─────────────────────────────────────────────────────────────────────────────
// EXORCISM MAGE  —  수련생 퇴마사 전용 공격형 — focused arcane exorcist
// ─────────────────────────────────────────────────────────────────────────────
function drawExorcismMage(cx, cy, tower) {
    const area   = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now    = Date.now();
    const atk    = (now - (tower.lastShot || 0)) < 400;
    const idleY  = Math.sin(now * 0.002) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w=1, h=1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);
    const pulse  = (Math.sin(now * 0.005) + 1) / 2;
    const CO='#000', SK1='#D4A070', SK2='#E8C090';
    const P1='#1A0044', P2='#330088', P3='#6622BB', P4='#9944DD';
    const HA='#550099';
    const G2='#FFD700', G3='#FFF4A0';
    const OP='#FF88FF', OP2='#FF44CC';

    // ── ARCANE ORB GLOW AURA
    ctx.save(); ctx.globalAlpha=0.18+pulse*0.22;
    pUnit(ctx,cx,cy,-10,-6+idleY,'#CC44FF',20,18,isLeft,S);
    ctx.restore();

    // ── SHOES
    p(-9,22,CO,8,5);  p(-8,23,P2,6,3);  p(-9,26,CO,8,1);
    p( 1,22,CO,8,5);  p( 2,23,P2,6,3);  p( 1,26,CO,8,1);

    // ── ROBE LOWER — deep purple gradient to violet, gold trim
    p(-10,3,CO,20,22);  p(-9,4,P1,18,20);  p(-7,4,P2,14,18);  p(-5,5,P3,10,16);  p(-3,6,P4,6,14);
    p(-10,23,G2,20,2);  p(-8,24,G3,14,1);   // gold hem trim
    p(-10,3,G2,2,20);   p( 8,3,G2,2,20);    // gold side edge trim

    // ── UPPER BODY ROBE
    p(-9,-10,CO,18,14);  p(-8,-9,P1,16,12);  p(-6,-9,P2,12,10);  p(-4,-8,P3,8,8);  p(-2,-7,P4,4,6);
    p(-9,-10,G2,2,12);   p( 7,-10,G2,2,12);   // gold edge trim
    p(-8,-11,G2,16,2);                         // collar gold band

    // ── PAULDRONS — robed
    p(-15,-12,CO,5,7);  p(-14,-11,P2,4,6);  p(-13,-10,P3,3,5);
    p( 10,-12,CO,5,7);  p( 11,-11,P2,4,6);  p( 11,-10,P3,3,5);

    // ── ARMS — long sleeves with gold cuffs
    p(-14,-8,CO,4,18);  p(-13,-7,P2,3,16);  p(-13,-7,P3,2,12);
    p( 10,-8,CO,4,18);  p( 11,-7,P2,3,16);  p( 11,-7,P3,2,12);
    p(-14,8,G2,4,2);    p(10,8,G2,4,2);      // gold sleeve cuffs

    // ── LEFT HAND — focused energy channel
    if (atk) {
        ctx.save(); ctx.globalAlpha=0.80;
        pUnit(ctx,cx,cy,-18,-4+idleY,OP,8,8,isLeft,S);
        ctx.restore();
    } else {
        ctx.save(); ctx.globalAlpha=0.35+pulse*0.30;
        pUnit(ctx,cx,cy,-16,-2+idleY,OP2,5,5,isLeft,S);
        ctx.restore();
    }

    // ── OVERSIZED ARCANE STAFF (~40 art-px tall, weapon hand)
    const sx = isLeft ? 12 : -14;
    p(sx,-26,CO,3,50);   p(sx+1,-25,P2,2,48);  p(sx+1,-25,P3,1,40);  // staff pole
    p(sx-2,-30,CO,6,8);  p(sx-1,-29,G2,4,6);   p(sx,-28,G3,2,4);      // gold ring near top
    // Crystal orb at top (large, pulsing purple-pink-white)
    p(sx-3,-38,CO,8,8);  p(sx-2,-37,P3,6,6);   p(sx-1,-36,P4,4,4);   p(sx,-35,OP,2,3);
    ctx.save(); ctx.globalAlpha=0.55+pulse*0.42;
    pUnit(ctx,cx,cy,sx-2,-37+idleY,OP,6,6,isLeft,S);
    ctx.restore();
    ctx.save(); ctx.globalCompositeOperation='screen'; ctx.globalAlpha=0.22+pulse*0.26;
    pUnit(ctx,cx,cy,sx-4,-40+idleY,'#FFFFFF',12,12,isLeft,S);
    ctx.restore();

    // ── NECK
    p(-4,-14,CO,8,2);  p(-3,-13,SK1,6,1);

    // ── FACE — studious wizard
    p(-6,-22,CO,12,10);  p(-5,-21,SK1,10,8);  p(-4,-20,SK2,7,6);  p(-3,-19,SK2,4,4);
    p(-3,-17,CO,2,2);  p(2,-17,CO,2,2);
    p(-2,-16,atk?OP2:'#AA66FF',1,2);  p(3,-16,atk?OP2:'#AA66FF',1,2);

    // ── TALL POINTED WIZARD HAT (dark purple, gold band)
    p(-7,-24,CO,14,7);   p(-6,-23,P1,12,6);  p(-4,-22,HA,8,5);  p(-2,-21,P2,4,4);  // hat brim
    p(-5,-29,CO,10,6);   p(-4,-28,P1,8,5);   p(-2,-27,HA,5,4);  // lower hat body
    p(-3,-34,CO,6,6);    p(-2,-33,P1,4,5);   p(-1,-32,HA,3,4);  // mid hat
    p(-1,-39,CO,4,6);    p( 0,-38,HA,2,5);   // hat peak
    p(-6,-24,G2,12,2);   p(-5,-23,G3,8,1);   // gold band on hat brim
}

window.drawVerseWarrior   = drawVerseWarrior;
window.drawHymnBlaster    = drawHymnBlaster;
window.drawExorcismMage   = drawExorcismMage;

/* ─── Novice Exorcist Exclusive — Support T2 ────────────────────────────── */
function drawPrayerHerald(ctx, tower, cx, cy, isLeft) {
    const S = 2.0;
    const p = (ox,oy,c,w,h) => pUnit(ctx,cx,cy,ox,oy,c,w,h,isLeft,S);
    const now   = performance.now();
    const idleY = Math.sin(now * 0.002) * 2;
    const isAtk = (now - tower.lastShot) < 350;
    const ep    = (Math.sin(now * 0.004) + 1) / 2;
    const tFlut = Math.sin(now * 0.005) * 1;
    const CO='#000', CN='#1A2D5A', CL='#2A4080';
    const AZ='#C8D8F8', AL='#E8EFF8', AH='#FFFFFF';
    const GD0='#7A5000', GD='#FFD700', GL='#FFF4A0';
    const BN='#F8EED0', BA='#E8D8A0', SK='#F0C090', WH='#FFFFFF';

    // ── divine aura
    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnit(ctx,cx,cy,-18,-46+idleY,GD,36,68,isLeft,S);
    ctx.restore();

    // ── BANNER STANDARD (taller, richer scripture, gold trim)
    p(-9, idleY-50, CO, 2, 60);                                                  // pole shadow
    p(-8, idleY-50, GD, 1, 60);                                                  // gold pole
    p(-8, idleY-52, CO, 4, 4); p(-7, idleY-51, GD, 2, 2);                        // pole finial cross
    p(-6, idleY-53, CO, 2, 3); p(-5, idleY-52, GD, 0, 0);
    p(-7, idleY-52, GD, 2, 1);
    // Banner cloth
    p(-9, idleY-46, CO, 14, 22);                                                 // banner outline
    p(-8, idleY-45, BN, 12, 20);                                                 // cloth body
    p(-7, idleY-44, BA, 10, 18);                                                 // mid-tone
    p(-8, idleY-45, GL, 12, 1);                                                  // top highlight
    p(-9, idleY-46, GD, 14, 2);                                                  // gold top border
    p(-9, idleY-26, GD, 14, 2);                                                  // gold bottom border
    p(-9, idleY-46, GD, 1, 22); p( 4, idleY-46, GD, 1, 22);                      // gold side trims
    // Cross emblem on banner (large)
    p(-3, idleY-42, CO, 4, 12); p(-2, idleY-41, GD, 2, 10); p(-2, idleY-41, GL, 2, 1);
    p(-6, idleY-38, CO, 10, 4); p(-5, idleY-37, GD, 8, 2); p(-5, idleY-37, GL, 8, 1);
    ctx.save(); ctx.globalAlpha = 0.50 + ep * 0.40;
    pUnit(ctx,cx,cy,-3, idleY-42, GL, 4, 12, isLeft, S);
    pUnit(ctx,cx,cy,-6, idleY-38, GL, 10, 4, isLeft, S);
    ctx.restore();
    // Tassels (with flutter)
    p(-7, idleY-24+tFlut, GD, 2, 5); p(-3, idleY-24-tFlut, GD, 2, 5); p( 1, idleY-24+tFlut, GD, 2, 5);
    p(-6, idleY-20+tFlut, GD, 1, 2); p(-2, idleY-20-tFlut, GD, 1, 2); p( 2, idleY-20+tFlut, GD, 1, 2);

    // ── HEM / LOWER CASSOCK (gold-trimmed)
    p(-5, idleY+ 4, CO, 10, 6); p(-4, idleY+ 5, CN, 8, 4); p(-5, idleY+ 2, CL, 10, 2);
    p(-5, idleY+ 8, GD, 10, 1);                                                  // gold hem

    // ── TORSO — cassock + azure surplice (highlighted)
    p(-5, idleY-14, CO, 10, 18);
    p(-4, idleY-13, CN, 8, 16);
    p(-4, idleY-12, AZ, 8, 12);
    p(-3, idleY-11, AL, 6, 10);
    p(-4, idleY-13, AH, 8, 1);                                                   // top highlight
    p(-4, idleY+ 0, GD, 8, 2);                                                   // gold hem trim
    p(-4, idleY- 8, CO, 8, 2); p(-3, idleY- 7, GD, 6, 1);                        // rope belt + gold

    // ── ARMS raised (presenting gesture)
    p(-8, idleY-20, CO, 3, 12); p(-7, idleY-19, AZ, 2, 10); p(-7, idleY-19, AH, 2, 1);
    p(-9, idleY-10, SK, 2, 2);
    p( 5, idleY-20, CO, 3, 12); p( 5, idleY-19, AZ, 2, 10); p( 5, idleY-19, AH, 2, 1);
    p( 7, idleY-10, SK, 2, 2);

    // ── NECK
    p(-2, idleY-16, CO, 4, 3); p(-1, idleY-15, SK, 2, 2);

    // ── SURPLICE COLLAR
    p(-5, idleY-22, AZ, 2, 5); p( 3, idleY-22, AZ, 2, 5);
    p(-5, idleY-22, GD, 2, 1); p( 3, idleY-22, GD, 2, 1);

    // ── HEAD
    p(-5, idleY-30, CO, 10, 11); p(-4, idleY-29, SK, 8, 9);
    p(-5, idleY-30, CN, 10, 3); p(-5, idleY-27, CN, 2, 3); p( 3, idleY-27, CN, 2, 3);
    p(-3, idleY-26, CO, 2, 1); p( 1, idleY-26, CO, 2, 1);
    p(-2, idleY-25, AH, 1, 1);
    p( 0, idleY-23, CO, 1, 1);
    p(-1, idleY-21, CO, 2, 1); p(-2, idleY-20, CO, 1, 1); p( 1, idleY-20, CO, 1, 1);

    // ── PROMINENT HALO (taller ring + light rays)
    p(-8, idleY-36, CO, 16, 4); p(-7, idleY-35, GD, 14, 2); p(-7, idleY-35, GL, 14, 1);
    p(-9, idleY-34, CO, 2, 3); p( 7, idleY-34, CO, 2, 3);
    p(-8, idleY-33, GD, 1, 2); p( 7, idleY-33, GD, 1, 2);
    ctx.save(); ctx.globalAlpha = 0.62 + ep * 0.30;
    pUnit(ctx,cx,cy,-8, idleY-36, GL, 16, 4, isLeft, S);
    ctx.restore();
    // Halo rays
    p(-1, idleY-40, GD, 2, 3); p( 0, idleY-42, GL, 1, 2);                        // top
    p(-6, idleY-39, GD, 1, 2); p( 5, idleY-39, GD, 1, 2);                        // sides

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.70; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy, -3, idleY-40, GL, 18, 24, isLeft, S);
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.55; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy, -8, idleY-38, GD, 18, 8, isLeft, S);
        ctx.restore();
    }
}

function drawRelicKeeper(ctx, tower, cx, cy, isLeft) {
    const S = 2.0;
    const p = (ox,oy,c,w,h) => pUnit(ctx,cx,cy,ox,oy,c,w,h,isLeft,S);
    const now   = performance.now();
    const idleY = Math.sin(now * 0.002) * 2;
    const isAtk = (now - tower.lastShot) < 350;
    const ep    = (Math.sin(now * 0.003) + 1) * 0.5;
    const t     = now * 0.001;
    const CO='#050308', IV='#F4ECCD', IH='#FFF8E0', IS='#C8B888';
    const GD='#FFD700', GL='#FFF0A0', GS='#B88820';
    const RU='#D81030', RL='#FF5060';
    const SK='#E8C098', HD='#3A2A10';

    // ── halo glow behind head (sacred radiance)
    ctx.save(); ctx.globalAlpha = 0.30 + ep * 0.28; ctx.globalCompositeOperation = 'lighter';
    pUnit(ctx,cx,cy, -9, idleY-32, GD, 18, 14, isLeft, S);
    pUnit(ctx,cx,cy, -6, idleY-31, GL, 12, 10, isLeft, S);
    ctx.restore();

    // ── floor sigil glow
    ctx.save(); ctx.globalAlpha = 0.20 + ep * 0.15; ctx.globalCompositeOperation = 'lighter';
    pUnit(ctx,cx,cy, -6, idleY+10, GD, 12,  2, isLeft, S);
    pUnit(ctx,cx,cy, -1, idleY+ 9, GL,  2,  4, isLeft, S);
    ctx.restore();

    // ── lower robe (flared, gold hem)
    p(-5, idleY+ 4, CO, 10,  6);
    p(-4, idleY+ 5, IV,  8,  4);
    p(-3, idleY+ 5, IH,  6,  3);
    p(-6, idleY+ 8, CO, 12,  2);
    p(-5, idleY+ 9, GD, 10,  1);

    // ── torso — white-gold sacred robe
    p(-5, idleY-14, CO, 10, 18);
    p(-4, idleY-13, IV,  8, 16);
    p(-3, idleY-12, IH,  6, 14);
    p(-5, idleY-14, GD,  1, 18);          // L gold trim
    p( 4, idleY-14, GD,  1, 18);          // R gold trim
    p(-5, idleY-10, GD, 10,  1);          // horizontal stole band
    p(-5, idleY- 2, GS, 10,  1);          // belt shadow

    // ── neck
    p(-2, idleY-16, CO,  4,  3);
    p(-1, idleY-15, SK,  2,  2);

    // ── arms forward (uppers — forearms drawn after reliquary so hands grip)
    p(-7, idleY-14, CO,  3,  6); p(-6, idleY-13, IV,  2,  5);   // back shoulder
    p( 4, idleY-14, CO,  3,  6); p( 4, idleY-13, IV,  2,  5);   // front shoulder

    // ── ornate gold cross-reliquary (held at chest)
    // vertical stem
    p(-1, idleY-16, CO,  4, 18);
    p( 0, idleY-15, GS,  2, 16);
    p( 0, idleY-15, GD,  2, 14);
    p( 0, idleY-15, GL,  1, 14);
    // crossbar
    p(-5, idleY-10, CO, 12,  3);
    p(-4, idleY- 9, GS, 10,  1);
    p(-4, idleY- 9, GD,  8,  1);
    p(-3, idleY- 9, GL,  4,  1);
    // ruby gem at intersection
    p(-1, idleY- 9, CO,  4,  3);
    p( 0, idleY- 8, RU,  2,  1);
    p( 0, idleY- 8, RL,  1,  1);
    // top + bottom + side finial beads
    p(-1, idleY-17, CO,  4,  2); p( 0, idleY-16, GD, 2, 1);
    p(-1, idleY+ 0, CO,  4,  2); p( 0, idleY+ 1, GD, 2, 1);
    p(-6, idleY-10, CO,  2,  3); p(-5, idleY- 9, GD, 1, 1);
    p( 5, idleY-10, CO,  2,  3); p( 5, idleY- 9, GD, 1, 1);
    // descending light pillar above cross
    ctx.save(); ctx.globalAlpha = 0.22 + ep * 0.28; ctx.globalCompositeOperation = 'lighter';
    pUnit(ctx,cx,cy, -1, idleY-26, GL,  4, 10, isLeft, S);
    ctx.restore();

    // ── forearms + hands gripping crossbar (drawn after reliquary)
    p(-5, idleY-12, CO,  3,  6); p(-4, idleY-11, IV,  2,  5);   // back forearm
    p(-5, idleY- 9, SK,  2,  2);                                 // back hand on cross
    p( 3, idleY-12, CO,  3,  6); p( 3, idleY-11, IV,  2,  5);   // front forearm
    p( 3, idleY- 9, SK,  2,  2);                                 // front hand on cross

    // ── head — hooded acolyte
    p(-5, idleY-30, CO, 10, 14);          // hood outer
    p(-4, idleY-29, HD,  8, 12);          // hood inner shadow
    p(-3, idleY-26, SK,  6,  8);          // face
    p(-3, idleY-27, CO,  3,  1); p( 1, idleY-27, CO, 2, 1);     // brows
    p(-2, idleY-24, CO,  2,  1); p( 1, idleY-24, CO, 2, 1);     // eyes (calm)
    p(-2, idleY-24, GL,  1,  1);                                 // L eye glint
    p(-1, idleY-22, IS,  1,  1);          // nose
    p(-1, idleY-20, CO,  2,  1);          // mouth (serene)
    // hood crown peak
    p(-3, idleY-34, CO,  6,  4);
    p(-2, idleY-33, HD,  4,  2);
    // hood gold trim
    p(-5, idleY-30, GD, 10,  1);
    p(-3, idleY-27, GD,  6,  1);          // inner face trim
    // side cowl drapes
    p(-6, idleY-26, CO,  1,  6);
    p( 5, idleY-26, CO,  1,  6);

    // ── 2 orbiting prayer beads
    const ap = isAtk ? 0.95 : 0.7;
    for (let i = 0; i < 2; i++) {
        const a  = t * 0.9 + i * Math.PI;
        const rx = Math.cos(a) * 14;
        const ry = Math.sin(a) *  6 - 12;
        ctx.save(); ctx.globalAlpha = ap;
        pUnit(ctx,cx,cy, rx, idleY+ry, CO, 3, 3, isLeft, S);
        pUnit(ctx,cx,cy, rx, idleY+ry, GD, 2, 2, isLeft, S);
        pUnit(ctx,cx,cy, rx, idleY+ry, GL, 1, 1, isLeft, S);
        ctx.restore();
    }

    // ── attack: radial gold burst + gem flash + rising sparks
    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.75; ctx.globalCompositeOperation = 'lighter';
        pUnit(ctx,cx,cy, -8, idleY-10, GD, 22, 20, isLeft, S);
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.95;
        pUnit(ctx,cx,cy, -1, idleY- 9, RL,  4,  3, isLeft, S);   // gem flash
        const ft = (now % 600) / 600;
        pUnit(ctx,cx,cy, -3, idleY-18 - ft*10, GD,  2,  2, isLeft, S);
        pUnit(ctx,cx,cy,  1, idleY-20 - ft* 8, GL,  2,  2, isLeft, S);
        pUnit(ctx,cx,cy,  3, idleY-16 - ft*12, GL,  1,  1, isLeft, S);
        ctx.restore();
    }
}

function drawWardScribe(ctx, tower, cx, cy, isLeft) {
    const S = 2.0;
    const p = (ox,oy,c,w,h) => pUnit(ctx,cx,cy,ox,oy,c,w,h,isLeft,S);
    const now   = performance.now();
    const idleY = Math.sin(now * 0.002) * 2;
    const isAtk = (now - tower.lastShot) < 350;
    const ep    = (Math.sin(now * 0.004) + 1) / 2;
    const CO='#000000', IB='#0C1A40', NB='#1A2D60', MB='#2A4080', MH='#4A6090';
    const SV='#A8B8D0', LSV='#D0DCF0';
    const CY1='#0099CC', CY='#44DDFF', CY2='#88EEFF';
    const GD='#FFD700', GL='#FFF4A0';
    const SK='#F0C890', PC='#F8EED8', DPC='#E8D8A8', QL='#FFFFAA';

    // ── arcane ward aura
    ctx.save(); ctx.globalAlpha = 0.14 + ep * 0.20;
    pUnit(ctx,cx,cy,-22,-32+idleY,CY,44,64,isLeft,S);
    ctx.restore();

    // ── 3 ORBITING HEXAGONAL WARDS
    const ang = now * 0.0014;
    for (let i = 0; i < 3; i++) {
        const a  = ang + i * (Math.PI * 2 / 3);
        const hx = Math.cos(a) * 20;
        const hy = Math.sin(a) * 11 - 14 + idleY;
        // Hex w/ outline
        ctx.save(); ctx.globalAlpha = 0.40 + ep * 0.30;
        pUnit(ctx,cx,cy,hx-1,hy-1,CY,7,6,isLeft,S);
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.70 + ep * 0.25;
        pUnit(ctx,cx,cy,hx,hy,CY2,5,4,isLeft,S);
        ctx.restore();
        // Glyph in center
        pUnit(ctx,cx,cy,hx+1,hy+1,'#FFFFFF',3,2,isLeft,S);
    }

    // ── LOWER ROBE (top-highlighted)
    p(-6, idleY+ 2, CO, 13, 12); p(-5, idleY+ 3, IB, 11, 10);
    p(-4, idleY+ 4, NB,  8,  8); p(-3, idleY+ 5, MB,  5,  7);
    p(-5, idleY+ 3, MH, 11,  1);                                                 // top highlight
    p(-6, idleY+12, CO, 13,  3); p(-5, idleY+13, SV, 11,  2);
    p(-5, idleY+13, GD, 11,  1);                                                 // gold hem

    // ── UPPER TORSO ROBE + silver collar
    p(-6, idleY-14, CO, 13, 17); p(-5, idleY-13, IB, 11, 15);
    p(-4, idleY-12, NB,  7, 13); p(-3, idleY-11, MB,  4, 11);
    p(-5, idleY-13, MH, 11,  1);                                                 // top highlight
    p(-6, idleY-15, CO, 13,  3); p(-5, idleY-14, SV, 11,  2);
    p(-4, idleY-13, LSV, 9, 1);
    // Gold robe edges
    p(-6, idleY-13, GD, 1, 16); p( 6, idleY-13, GD, 1, 16);

    // ── INK SASH BELT (cyan ward buckle, larger)
    p(-5, idleY- 2, CO, 11, 4); p(-4, idleY- 1, NB, 9, 3);
    p(-4, idleY- 1, GD, 9, 1);
    p(-1, idleY- 2, CO, 4, 4); p( 0, idleY- 1, CY, 2, 2);
    ctx.save(); ctx.globalAlpha = 0.60 + ep * 0.35;
    pUnit(ctx,cx,cy, 0, idleY- 1, CY2, 2, 2, isLeft, S);
    ctx.restore();

    // ── LEFT ARM (pressing seal into tome)
    p(-10, idleY-11, CO, 5, 10); p(-9, idleY-10, IB, 4, 8); p(-9, idleY-10, MH, 4, 1);
    p(-10, idleY- 2, CO, 5,  7); p(-9, idleY- 1, SK, 4, 6);

    // ── RIGHT ARM (raised with quill)
    p(  6, idleY-12, CO, 5, 10); p( 7, idleY-11, IB, 4, 8); p( 7, idleY-11, MH, 4, 1);
    p(  6, idleY-19, CO, 5,  8); p( 7, idleY-18, SK, 4, 6);

    // ── HEAD (16×14, scholar)
    p(-8, idleY-30, CO, 16, 14); p(-7, idleY-29, SK, 14, 12);
    p(-8, idleY-30, NB, 16,  5); p(-7, idleY-29, IB, 14,  4);
    p(-5, idleY-28, MB,  8,  3);
    // Gold-trimmed silver circlet + central cyan ward gem
    p(-8, idleY-25, CO, 16,  3); p(-7, idleY-24, SV, 14, 2); p(-7, idleY-24, GD, 14, 1);
    p(-3, idleY-27, CO,  6,  5); p(-2, idleY-26, GD,  4, 3); p(-2, idleY-26, GL, 4, 1);
    p(-1, idleY-25, CY,  2,  1);
    ctx.save(); ctx.globalAlpha = 0.60 + ep * 0.30;
    pUnit(ctx,cx,cy,-2, idleY-26, CY2, 4, 3, isLeft, S);
    ctx.restore();
    // Eyes + mouth
    p(-5, idleY-24, CO, 3, 2); p( 2, idleY-24, CO, 3, 2);
    p(-4, idleY-23, isAtk?CY2:LSV, 1, 1); p( 3, idleY-23, isAtk?CY2:LSV, 1, 1);
    p(-2, idleY-21, IB, 5, 1);

    // ── OVERSIZED OPEN WARD CODEX (with glowing cyan glyphs)
    p(-14, idleY+ 3, CO, 24, 14);
    p(-13, idleY+ 4, DPC, 10, 12); p( 2, idleY+ 4, PC,  9, 12);
    p(-13, idleY+ 4, '#F8F4E0', 10, 1); p( 2, idleY+ 4, '#FFFFFF', 9, 1);        // page highlights
    p( -1, idleY+ 3, CO, 3, 14); p( -1, idleY+ 4, NB, 1, 13); p( -1, idleY+ 4, GD, 1, 1);
    // Glowing cyan glyphs on each page
    p(-11, idleY+ 6, CY,  6, 1); p(-11, idleY+ 8, CY, 4, 1); p(-11, idleY+10, CY, 5, 1);
    p(  3, idleY+ 6, CY,  5, 1); p(  3, idleY+ 8, CY, 6, 1); p(  3, idleY+10, CY, 4, 1);
    p(-10, idleY+12, GD, 5, 1); p(  3, idleY+12, GD, 5, 1);                      // gold underline
    ctx.save(); ctx.globalAlpha = 0.40 + ep * 0.35;
    pUnit(ctx,cx,cy,-11, idleY+ 6, CY2, 8, 6, isLeft, S);
    pUnit(ctx,cx,cy,  3, idleY+ 6, CY2, 8, 6, isLeft, S);
    ctx.restore();

    // ── QUILL PEN (larger, with ink glow)
    p(  9, idleY-30, CO, 3, 14); p( 10, idleY-31, QL, 2, 13); p( 10, idleY-31, '#FFFFFF', 2, 1);
    p( 11, idleY-26, LSV, 1,  6);
    p(  9, idleY-19, CO, 3,  3); p( 10, idleY-18, CY, 1, 1);                    // ink tip

    if (isAtk) {
        ctx.save(); ctx.globalAlpha = 0.72; ctx.globalCompositeOperation = 'screen';
        pUnit(ctx,cx,cy, 0, idleY-12, CY2, 48, 44, isLeft, S);
        ctx.restore();
        // Projected rune (above head)
        ctx.save(); ctx.globalAlpha = 0.85;
        pUnit(ctx,cx,cy,-4, idleY-40, CY, 8, 6, isLeft, S);
        pUnit(ctx,cx,cy,-3, idleY-39, CY2, 6, 4, isLeft, S);
        pUnit(ctx,cx,cy,-2, idleY-38, '#FFFFFF', 4, 2, isLeft, S);
        ctx.restore();
    }
}

window.drawPrayerHerald = drawPrayerHerald;
window.drawRelicKeeper  = drawRelicKeeper;
window.drawWardScribe   = drawWardScribe;
