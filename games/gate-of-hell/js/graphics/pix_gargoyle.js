/* pix_gargoyle.js - Perched Gargoyle Widget: 8-Form Evolutionary Pixel Art */

const GARGOYLE_W = 160;
const GARGOYLE_H = 144;

/** Pixel rect helper – draws a block on any canvas context. */
function pG(gctx, cx, cy, ox, oy, col, w=1, h=1, S=2.0) {
    gctx.fillStyle = col;
    gctx.fillRect(
        Math.round(cx + ox * S), Math.round(cy + oy * S),
        Math.round(w  * S),      Math.round(h  * S)
    );
}

/** Bezier wing pair with optional bone ribs, drawn BEHIND the body. */
function _gWings(gctx, cx, cy, S, span, rise, fill, ribCol) {
    if (span <= 0) return;
    gctx.save();
    gctx.imageSmoothingEnabled = false;
    gctx.fillStyle = fill;
    const membrane = (side) => {
        gctx.beginPath();
        gctx.moveTo(cx + side*3*S, cy - 2*S);
        gctx.bezierCurveTo(
            cx + side*(4 + span*0.35)*S, cy - (2 + rise*0.40)*S,
            cx + side*(3 + span*0.75)*S, cy - (1 + rise*0.90)*S,
            cx + side*(2 + span)*S,       cy - rise*S
        );
        gctx.bezierCurveTo(
            cx + side*(3 + span*0.85)*S, cy + (2 - rise*0.10)*S,
            cx + side*(3 + span*0.40)*S, cy + (3 - rise*0.05)*S,
            cx + side*3*S,               cy + 2*S
        );
        gctx.closePath();
        gctx.fill();
    };
    membrane(-1); membrane(1);
    if (ribCol) {
        gctx.strokeStyle = ribCol;
        gctx.lineWidth = Math.max(1, S * 0.22);
        gctx.lineCap = 'round';
        [-1, 1].forEach(side => {
            [
                [cx+side*3*S, cy-S,   cx+side*(2+span)*S,        cy-rise*S],
                [cx+side*3*S, cy-S,   cx+side*(2+span*0.55)*S,   cy-(rise*0.5+2)*S],
                [cx+side*3*S, cy-S,   cx+side*(2+span*0.80)*S,   cy+(rise>2?-1:1)*S]
            ].forEach(([x1,y1,x2,y2]) => {
                gctx.beginPath();
                gctx.moveTo(Math.round(x1), Math.round(y1));
                gctx.lineTo(Math.round(x2), Math.round(y2));
                gctx.stroke();
            });
        });
    }
    gctx.restore();
}

/** Radial gradient point glow with screen composite. */
function _gGlow(gctx, x, y, r, rgb, alpha) {
    gctx.save();
    gctx.globalCompositeOperation = 'screen';
    gctx.globalAlpha = alpha;
    const g = gctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0,   `rgba(${rgb},0.9)`);
    g.addColorStop(0.4, `rgba(${rgb},0.4)`);
    g.addColorStop(1,   `rgba(${rgb},0)`);
    gctx.fillStyle = g;
    gctx.beginPath(); gctx.arc(x, y, r, 0, Math.PI*2); gctx.fill();
    gctx.restore();
}

/** Ambient aura centered at (cx, cy + offY*S). */
function _gAura(gctx, cx, cy, S, offY, rgb, radius, alpha) {
    _gGlow(gctx, cx, cy + offY*S, radius*S, rgb, alpha);
}

// =============================================================================
// Form 0 — Dormant Stone (stage 1-4): grey, folded wings, closed eyes
// =============================================================================
function drawGargoyleForm0(gctx, cx, cy, S, now) {
    const breath = Math.sin(now * 0.0015) * 0.5;
    const p = (ox,oy,c,w=1,h=1) => pG(gctx,cx,cy+breath,ox,oy,c,w,h,S);
    const C0='#111', C1='#333', C2='#555', C3='#777', HL='#bbb';
    // Folded wings (tight pixel blocks)
    p(-10,-4,C1,5,10); p(6,-4,C1,5,10);
    p(-11,-2,C1,3,7);  p(9,-2,C1,3,7);
    // Body
    p(-5,-5,C0,10,1); p(-6,-4,C0,1,14); p(5,-4,C0,1,14); p(-5,10,C0,10,1);
    p(-5,-4,C1,10,14); p(-3,-3,C2,6,12); p(-1,-2,C3,2,8);
    p(-2,-2,HL,1,2);
    // Head (bowed)
    p(-4,-12,C0,8,1); p(-5,-11,C0,1,8); p(4,-11,C0,1,8); p(-4,-3,C0,8,1);
    p(-4,-11,C1,8,8); p(-2,-10,C2,4,6); p(-1,-9,C3,2,2);
    // Eyes closed
    p(-3,-8,C0,2,1); p(1,-8,C0,2,1);
    // Snout
    p(-2,-6,C2,4,2); p(-2,-5,C1,4,1);
    // Legs
    p(-5,10,C0,3,5); p(3,10,C0,3,5); p(-4,11,C1,2,3); p(4,11,C1,2,3);
    // Tail
    p(5,5,C1,4,2); p(7,6,C1,3,2); p(9,7,C0,2,2);
}

// =============================================================================
// Form 1 — Cracking Stone (stage 5-9): amber crack glow, one dim eye opens
// =============================================================================
function drawGargoyleForm1(gctx, cx, cy, S, now) {
    const breath = Math.sin(now * 0.0018) * 0.5;
    const cp = (Math.sin(now * 0.004) + 1) / 2;
    const p = (ox,oy,c,w=1,h=1) => pG(gctx,cx,cy+breath,ox,oy,c,w,h,S);
    const C0='#111', C1='#333', C2='#555', C3='#777';
    const CR = `rgba(255,160,0,${0.5+cp*0.4})`;
    // Folded wings
    p(-10,-4,C1,5,10); p(6,-4,C1,5,10); p(-11,-2,C1,3,7); p(9,-2,C1,3,7);
    // Body
    p(-5,-5,C0,10,1); p(-6,-4,C0,1,14); p(5,-4,C0,1,14); p(-5,10,C0,10,1);
    p(-5,-4,C1,10,14); p(-3,-3,C2,6,12); p(-1,-2,C3,2,8);
    p(-4,0,CR,1,5); p(2,-2,CR,1,4); p(-1,4,CR,1,3);
    // Head
    p(-4,-12,C0,8,1); p(-5,-11,C0,1,8); p(4,-11,C0,1,8); p(-4,-3,C0,8,1);
    p(-4,-11,C1,8,8); p(-2,-10,C2,4,6);
    p(-1,-10,CR,1,4);
    // One eye barely open
    p(-3,-8,`rgba(255,160,0,0.7)`,2,1); p(1,-8,C0,2,1);
    _gGlow(gctx, cx-2*S, cy+(breath-8)*S, 4*S, '255,140,0', 0.18+cp*0.16);
    // Snout, legs, tail
    p(-2,-6,C2,4,2); p(-2,-5,C1,4,1);
    p(-5,10,C0,3,5); p(3,10,C0,3,5); p(-4,11,C1,2,3); p(4,11,C1,2,3);
    p(5,5,C1,4,2); p(7,6,C1,3,2); p(9,7,C0,2,2);
}

// =============================================================================
// Form 2 — Awakened (stage 10-14): bezier wings spread, amber eye glow
// =============================================================================
function drawGargoyleForm2(gctx, cx, cy, S, now) {
    const pulse = (Math.sin(now * 0.004) + 1) / 2;
    const p = (ox,oy,c,w=1,h=1) => pG(gctx,cx,cy,ox,oy,c,w,h,S);
    const C0='#111', C1='#2A1A00', C2='#3D2800', C3='#553C00', HL='#775500';
    _gWings(gctx, cx, cy, S, 5, 2, 'rgba(20,10,0,0.92)', 'rgba(60,40,0,0.7)');
    // Body
    p(-5,-5,C0,10,1); p(-6,-4,C0,1,14); p(5,-4,C0,1,14); p(-5,10,C0,10,1);
    p(-5,-4,C1,10,14); p(-3,-3,C2,6,12); p(-1,-2,C3,3,8); p(-1,-1,HL,2,3);
    // Head (raised)
    p(-4,-14,C0,8,2); p(-5,-12,C0,1,9); p(4,-12,C0,1,9); p(-4,-3,C0,8,1);
    p(-4,-12,C1,8,9); p(-2,-11,C2,4,7); p(-1,-10,C3,2,3);
    // Eyes (amber glow)
    p(-4,-9,C0,3,3); p(1,-9,C0,3,3);
    p(-3,-8,`rgba(255,200,0,${0.7+pulse*0.3})`,2,2);
    p(2,-8,`rgba(255,200,0,${0.7+pulse*0.3})`,2,2);
    _gGlow(gctx, cx, cy-8.5*S, 7*S, '255,180,0', 0.18+pulse*0.15);
    // Snout
    p(-2,-6,C2,4,2); p(-1,-5,C0,2,1);
    p(-5,10,C0,3,5); p(3,10,C0,3,5); p(-4,11,C1,2,3); p(4,11,C1,2,3);
    p(5,5,C1,4,2); p(7,6,C1,3,2); p(9,7,C0,2,2);
}

// =============================================================================
// Form 3 — Alert Watcher (stage 15-19): half-spread wings, orange eyes, horns
// =============================================================================
function drawGargoyleForm3(gctx, cx, cy, S, now) {
    const pulse = (Math.sin(now * 0.005) + 1) / 2;
    const p = (ox,oy,c,w=1,h=1) => pG(gctx,cx,cy,ox,oy,c,w,h,S);
    const C0='#111', C1='#1C0A00', C2='#3A1800', C3='#552800', HL='#7A3A00';
    _gWings(gctx, cx, cy, S, 8, 4, 'rgba(28,14,0,0.93)', 'rgba(80,40,0,0.6)');
    // Body
    p(-5,-5,C0,10,1); p(-6,-4,C0,1,14); p(5,-4,C0,1,14); p(-5,10,C0,10,1);
    p(-5,-4,C1,10,14); p(-3,-3,C2,6,12); p(-2,-2,C3,4,8); p(-1,-1,HL,2,4);
    // Head
    p(-4,-15,C0,8,2); p(-5,-13,C0,1,10); p(4,-13,C0,1,10); p(-4,-3,C0,8,1);
    p(-4,-13,C1,8,10); p(-3,-12,C2,6,8); p(-2,-11,C3,4,4);
    // Small horns
    p(-4,-16,C0,2,2); p(3,-16,C0,2,2);
    p(-4,-15,C1,2,2); p(3,-15,C1,2,2);
    // Eyes (orange glow)
    p(-4,-10,C0,3,3); p(1,-10,C0,3,3);
    p(-3,-9,`rgba(255,130,0,${0.8+pulse*0.2})`,2,2);
    p(2,-9,`rgba(255,130,0,${0.8+pulse*0.2})`,2,2);
    _gGlow(gctx, cx, cy-9.5*S, 8*S, '255,100,0', 0.22+pulse*0.18);
    // Snout, fangs
    p(-2,-7,C2,4,2); p(-2,-6,C3,1,2); p(1,-6,C3,1,2);
    // Clawed hands
    p(-7,2,C0,3,3); p(-7,5,C0,1,3); p(-6,5,C0,1,3); p(-5,5,C0,1,3);
    p(5,2,C0,3,3);  p(5,5,C0,1,3);  p(6,5,C0,1,3);  p(7,5,C0,1,3);
    p(-5,10,C0,3,5); p(3,10,C0,3,5); p(-4,11,C1,2,3); p(4,11,C1,2,3);
    p(5,6,C1,4,2); p(7,7,C0,3,2); p(9,8,C0,2,2);
}

// =============================================================================
// Form 4 — Wrathful Awakening (stage 20-29): fire aura, red eyes, wing embers
// =============================================================================
function drawGargoyleForm4(gctx, cx, cy, S, now) {
    const pulse = (Math.sin(now * 0.006) + 1) / 2;
    const fp    = (Math.sin(now * 0.010) + 1) / 2;
    const p = (ox,oy,c,w=1,h=1) => pG(gctx,cx,cy,ox,oy,c,w,h,S);
    const C0='#0A0000', C1='#1A0000', C2='#330000', C3='#4A0A00', HL='#660A00';
    _gAura(gctx, cx, cy, S, 0, '140,20,0', 12, 0.15+fp*0.18);
    _gWings(gctx, cx, cy, S, 11, 6,
        `rgba(20,0,0,${0.92+fp*0.05})`,
        `rgba(90,10,0,${0.6+fp*0.2})`);
    _gGlow(gctx, cx-13*S, cy-6*S, 5*S, '255,60,0', 0.28+fp*0.28);
    _gGlow(gctx, cx+13*S, cy-6*S, 5*S, '255,60,0', 0.28+fp*0.28);
    // Body
    p(-5,-6,C0,10,1); p(-6,-5,C0,1,15); p(5,-5,C0,1,15); p(-5,10,C0,10,1);
    p(-5,-5,C1,10,15); p(-4,-4,C2,8,13); p(-2,-3,C3,4,9); p(-1,-2,HL,2,5);
    // Head
    p(-4,-16,C0,8,2); p(-5,-14,C0,1,11); p(4,-14,C0,1,11); p(-4,-3,C0,8,1);
    p(-4,-14,C1,8,11); p(-3,-13,C2,6,9); p(-2,-12,C3,4,5);
    // Curved horns
    p(-5,-17,C0,2,3); p(4,-17,C0,2,3); p(-6,-16,C0,1,3); p(5,-16,C0,1,3);
    p(-5,-16,C1,2,3); p(4,-16,C1,2,3);
    // Eyes (red fire)
    p(-4,-11,C0,3,4); p(1,-11,C0,3,4);
    p(-3,-10,`rgba(255,50,0,${0.8+pulse*0.2})`,2,3);
    p(2,-10,`rgba(255,50,0,${0.8+pulse*0.2})`,2,3);
    _gGlow(gctx, cx, cy-10*S, 10*S, '255,30,0', 0.28+pulse*0.22);
    // Fangs
    p(-2,-8,C3,4,2); p(-2,-7,C0,1,3); p(1,-7,C0,1,3);
    // Claws
    p(-8,0,C0,3,4); p(-9,4,C0,1,3); p(-8,4,C0,1,3); p(-7,4,C0,1,3); p(-6,4,C0,1,3);
    p(6,0,C0,3,4);  p(6,4,C0,1,3);  p(7,4,C0,1,3);  p(8,4,C0,1,3);  p(9,4,C0,1,3);
    p(-5,10,C0,3,5); p(3,10,C0,3,5); p(-4,11,C1,2,4); p(4,11,C1,2,4);
    p(5,7,C1,5,2); p(8,8,C0,4,2); p(10,9,C0,2,3);
}

// =============================================================================
// Form 5 — Corrupted Guardian (stage 30-39): dark purple, corruption veins
// =============================================================================
function drawGargoyleForm5(gctx, cx, cy, S, now) {
    const pulse = (Math.sin(now * 0.005) + 1) / 2;
    const cp    = (Math.sin(now * 0.008) + 1) / 2;
    const p = (ox,oy,c,w=1,h=1) => pG(gctx,cx,cy,ox,oy,c,w,h,S);
    const C0='#050008', C1='#110020', C2='#1E0038', C3='#2D0050', HL='#420070';
    const VEIN = `rgba(160,0,220,${0.45+cp*0.45})`;
    _gAura(gctx, cx, cy, S, 2, '60,0,140', 14, 0.14+pulse*0.14);
    _gWings(gctx, cx, cy, S, 13, 7,
        'rgba(10,0,20,0.94)',
        `rgba(80,0,160,${0.5+cp*0.3})`);
    _gGlow(gctx, cx-15*S, cy-7*S, 4*S, '120,0,220', 0.20+cp*0.22);
    _gGlow(gctx, cx+15*S, cy-7*S, 4*S, '120,0,220', 0.20+cp*0.22);
    // Body
    p(-5,-7,C0,10,1); p(-6,-6,C0,1,16); p(5,-6,C0,1,16); p(-5,10,C0,10,1);
    p(-5,-6,C1,10,16); p(-4,-5,C2,8,14); p(-3,-4,C3,6,10); p(-2,-3,HL,4,7);
    // Corruption veins on body
    gctx.save(); gctx.globalAlpha = 0.40+cp*0.40;
    pG(gctx,cx,cy,-3,-4,VEIN,1,8,S); pG(gctx,cx,cy,2,-3,VEIN,1,6,S); pG(gctx,cx,cy,-1,1,VEIN,1,4,S);
    gctx.restore();
    // Head
    p(-4,-17,C0,8,2); p(-5,-15,C0,1,12); p(4,-15,C0,1,12); p(-4,-3,C0,8,1);
    p(-4,-15,C1,8,12); p(-3,-14,C2,6,10); p(-2,-13,C3,4,6);
    // Swept-back horns
    p(-5,-19,C0,2,4); p(-6,-18,C0,1,3); p(4,-19,C0,2,4); p(5,-18,C0,1,3);
    p(-5,-18,C2,2,4); p(4,-18,C2,2,4);
    // Eyes (purple glow)
    p(-4,-12,C0,3,4); p(1,-12,C0,3,4);
    p(-3,-11,`rgba(200,0,255,${0.8+pulse*0.2})`,2,3);
    p(2,-11,`rgba(200,0,255,${0.8+pulse*0.2})`,2,3);
    _gGlow(gctx, cx, cy-11*S, 10*S, '160,0,220', 0.28+pulse*0.20);
    // Fangs
    p(-3,-9,C3,5,2); p(-2,-8,C0,2,3); p(1,-8,C0,2,3);
    // Claws
    p(-9,0,C0,4,5); p(-10,5,C0,1,3); p(-9,5,C0,1,3); p(-8,5,C0,1,3); p(-7,5,C0,1,4);
    p(6,0,C0,4,5);  p(6,5,C0,1,3);   p(7,5,C0,1,3);  p(8,5,C0,1,3);  p(9,5,C0,1,4);
    p(-5,10,C0,3,5); p(3,10,C0,3,5); p(-4,11,C1,2,4); p(4,11,C1,2,4);
    p(5,8,C1,6,2); p(9,9,C0,5,2); p(12,10,C0,3,3); p(13,12,C0,2,3);
}

// =============================================================================
// Form 6 — Demonic Gargoyle (stage 40-49): near-black, glowing horns, dark energy
// =============================================================================
function drawGargoyleForm6(gctx, cx, cy, S, now) {
    const pulse = (Math.sin(now * 0.005) + 1) / 2;
    const ep    = (Math.sin(now * 0.009) + 1) / 2;
    const p = (ox,oy,c,w=1,h=1) => pG(gctx,cx,cy,ox,oy,c,w,h,S);
    const C0='#030004', C1='#090010', C2='#100020', C3='#1A0035';
    const HORN = `rgba(180,50,255,${0.65+ep*0.30})`;
    _gAura(gctx, cx, cy, S, 1, '60,0,160', 16, 0.12+pulse*0.13);
    _gWings(gctx, cx, cy, S, 15, 8,
        'rgba(5,0,10,0.95)',
        `rgba(100,0,200,${0.5+ep*0.3})`);
    _gGlow(gctx, cx-17*S, cy-8*S, 5*S, '100,0,200', 0.25+ep*0.28);
    _gGlow(gctx, cx+17*S, cy-8*S, 5*S, '100,0,200', 0.25+ep*0.28);
    // Body
    p(-5,-8,C0,10,1); p(-6,-7,C0,1,17); p(5,-7,C0,1,17); p(-5,10,C0,10,1);
    p(-5,-7,C1,10,17); p(-4,-6,C2,8,15); p(-3,-5,C3,6,11);
    // Head
    p(-4,-18,C0,8,2); p(-5,-16,C0,1,13); p(4,-16,C0,1,13); p(-4,-3,C0,8,1);
    p(-4,-16,C1,8,13); p(-3,-15,C2,6,11); p(-2,-14,C3,4,7);
    // Large curved horns (glowing purple)
    p(-5,-21,C0,3,5); p(-7,-20,C0,2,4); p(-8,-18,C0,1,3);
    p(3,-21,C0,3,5);  p(6,-20,C0,2,4);  p(8,-18,C0,1,3);
    gctx.save(); gctx.globalAlpha = 0.55+ep*0.35;
    pG(gctx,cx,cy,-5,-20,HORN,3,5,S); pG(gctx,cx,cy,-7,-19,HORN,2,4,S);
    pG(gctx,cx,cy,3,-20,HORN,3,5,S);  pG(gctx,cx,cy,6,-19,HORN,2,4,S);
    gctx.restore();
    _gGlow(gctx, cx-4*S, cy-20*S, 5*S, '180,50,255', 0.35+ep*0.28);
    _gGlow(gctx, cx+4*S, cy-20*S, 5*S, '180,50,255', 0.35+ep*0.28);
    // Eyes (violet)
    p(-4,-13,C0,3,4); p(1,-13,C0,3,4);
    p(-3,-12,`rgba(220,80,255,${0.85+pulse*0.15})`,2,3);
    p(2,-12,`rgba(220,80,255,${0.85+pulse*0.15})`,2,3);
    _gGlow(gctx, cx, cy-12*S, 11*S, '180,50,255', 0.32+pulse*0.22);
    // Fangs
    p(-3,-10,C2,5,2); p(-2,-9,C0,2,4); p(1,-9,C0,2,4);
    // Spiked claws
    p(-10,-1,C0,4,6); p(-11,5,C0,1,4); p(-10,5,C0,1,4); p(-9,5,C0,1,4); p(-8,5,C0,1,5); p(-7,5,C0,1,6);
    p(7,-1,C0,4,6);   p(7,5,C0,1,4);   p(8,5,C0,1,4);   p(9,5,C0,1,4);  p(10,5,C0,1,5); p(11,5,C0,1,6);
    p(-5,10,C0,3,5); p(3,10,C0,3,5); p(-4,11,C1,2,4); p(4,11,C1,2,4);
    p(5,9,C1,7,2); p(10,10,C0,6,2); p(13,11,C0,4,2); p(15,12,C0,2,3);
    p(11,8,C0,2,3); p(13,10,C0,2,3);
}

// =============================================================================
// Form 7 — Fallen God (stage 50+): black, gold veins, broken crown, dual aura
// =============================================================================
function drawGargoyleForm7(gctx, cx, cy, S, now) {
    const pulse = (Math.sin(now * 0.004) + 1) / 2;
    const gp    = (Math.sin(now * 0.007) + 1) / 2;
    const rp    = (Math.sin(now * 0.011) + 1) / 2;
    const p = (ox,oy,c,w=1,h=1) => pG(gctx,cx,cy,ox,oy,c,w,h,S);
    const C0='#000000', C1='#050003', C2='#080006', C3='#0D000A';
    const GOLD = `rgba(255,160,0,${0.55+gp*0.40})`;
    const GVN  = `rgba(255,150,0,${0.45+gp*0.45})`;
    // Dual aura (gold + corruption)
    _gAura(gctx, cx, cy, S, 0, '180,80,0',  18, 0.16+gp*0.18);
    _gAura(gctx, cx, cy, S, 0, '180,0,200', 20, 0.10+rp*0.12);
    // Maximum wings with gold vein ribs
    _gWings(gctx, cx, cy, S, 17, 9,
        'rgba(2,0,2,0.97)',
        `rgba(200,120,0,${0.4+gp*0.4})`);
    _gGlow(gctx, cx-19*S, cy-9*S, 6*S, '255,140,0', 0.38+gp*0.32);
    _gGlow(gctx, cx+19*S, cy-9*S, 6*S, '255,140,0', 0.38+gp*0.32);
    // Body
    p(-5,-9,C0,10,1); p(-6,-8,C0,1,18); p(5,-8,C0,1,18); p(-5,10,C0,10,1);
    p(-5,-8,C1,10,18); p(-4,-7,C2,8,16); p(-3,-6,C3,6,12);
    // Gold veins on body
    gctx.save(); gctx.globalAlpha = 0.50+gp*0.40;
    pG(gctx,cx,cy,-4,-5,GVN,1,10,S); pG(gctx,cx,cy,3,-4,GVN,1,8,S);
    pG(gctx,cx,cy,-1,-2,GVN,1,5,S);  pG(gctx,cx,cy,-2,3,GVN,3,1,S);
    gctx.restore();
    // Head
    p(-4,-19,C0,8,2); p(-5,-17,C0,1,14); p(4,-17,C0,1,14); p(-4,-3,C0,8,1);
    p(-4,-17,C1,8,14); p(-3,-16,C2,6,12); p(-2,-15,C3,4,8);
    // Gold veins on face
    gctx.save(); gctx.globalAlpha = 0.45+gp*0.40;
    pG(gctx,cx,cy,-2,-15,GVN,1,5,S); pG(gctx,cx,cy,1,-13,GVN,1,4,S);
    gctx.restore();
    // Broken crown
    p(-5,-21,GOLD,2,2); p(-4,-22,GOLD,2,3); p(-2,-23,GOLD,4,4);
    p(3,-21,GOLD,2,2);  p(2,-22,GOLD,2,2);
    p(-3,-24,`rgba(255,80,0,0.85)`,2,2);
    _gGlow(gctx, cx, cy-22*S, 7*S, '255,140,0', 0.45+gp*0.35);
    // Large gold-tipped horns
    p(-6,-22,C0,3,6); p(-8,-21,C0,2,5); p(-9,-19,C0,1,4);
    p(4,-22,C0,3,6);  p(7,-21,C0,2,5);  p(9,-19,C0,1,4);
    gctx.save(); gctx.globalAlpha = 0.65+gp*0.30;
    pG(gctx,cx,cy,-6,-22,GVN,3,3,S); pG(gctx,cx,cy,4,-22,GVN,3,3,S);
    gctx.restore();
    _gGlow(gctx, cx-4*S, cy-22*S, 5*S, '255,140,0', 0.40+gp*0.30);
    _gGlow(gctx, cx+5*S, cy-22*S, 5*S, '255,140,0', 0.40+gp*0.30);
    // Eyes (gold)
    p(-4,-14,C0,3,4); p(1,-14,C0,3,4);
    p(-3,-13,`rgba(255,180,0,${0.9+pulse*0.1})`,2,3);
    p(2,-13,`rgba(255,180,0,${0.9+pulse*0.1})`,2,3);
    _gGlow(gctx, cx, cy-13*S, 12*S, '255,150,0', 0.38+pulse*0.25);
    // Gold-tipped fangs
    p(-3,-11,C3,5,2); p(-2,-10,C0,2,4); p(1,-10,C0,2,4);
    gctx.save(); gctx.globalAlpha = 0.55;
    pG(gctx,cx,cy,-2,-13,GVN,1,2,S); pG(gctx,cx,cy,1,-13,GVN,1,2,S);
    gctx.restore();
    // Massive spiked claws
    p(-11,-2,C0,4,7); for (let i=0;i<5;i++) pG(gctx,cx,cy,-12+i,5,C0,1,5+i,S);
    p(8,-2,C0,4,7);   for (let i=0;i<5;i++) pG(gctx,cx,cy,8+i,5,C0,1,5+i,S);
    // Legs, maximum barbed tail
    p(-5,10,C0,3,6); p(3,10,C0,3,6); p(-4,11,C1,2,5); p(4,11,C1,2,5);
    p(5,10,C1,8,2); p(11,11,C0,7,2); p(15,12,C0,5,2); p(17,13,C0,3,3);
    p(9,8,C0,2,3); p(12,10,C0,2,3); p(14,11,C0,2,3);
    // Gold tail tip
    gctx.save(); gctx.globalAlpha = 0.60+gp*0.35;
    pG(gctx,cx,cy,16,11,GVN,3,4,S);
    gctx.restore();
}

// =============================================================================
// Master dispatcher
// =============================================================================
const _GARGOYLE_DRAW_FNS = [
    drawGargoyleForm0, drawGargoyleForm1, drawGargoyleForm2, drawGargoyleForm3,
    drawGargoyleForm4, drawGargoyleForm5, drawGargoyleForm6, drawGargoyleForm7
];

/**
 * Called each animation frame. Clears and re-draws the gargoyle widget canvas,
 * and updates form name + debuff/enemy-buff stat rows.
 */
function updateGargoyleWidget() {
    const icon = document.getElementById('sleeping-statue-icon');
    if (icon) {
        const formIdx = (typeof getGargoyleForm === 'function') ? getGargoyleForm().form : 0;
        icon.setAttribute('data-form', String(formIdx));
    }

    const form = (typeof getGargoyleForm === 'function')
        ? getGargoyleForm()
        : { form: 0, name: (window.t ? window.t('ui.hud.sleeping_statue', '잠든 석상') : '잠든 석상'), color: '#999', debuffs: { speed: 0, range: 0, damage: 0, seGain: 0 } };

    const label = document.getElementById('sleeping-statue-name');
    if (label) { label.textContent = form.name; label.style.color = form.color; }

    const rows = document.getElementById('sleeping-statue-stat-rows');
    if (!rows) return;
    const d = form.debuffs;
    let html = '';

    const _T = window.t || ((k, f) => f);
    const parts = [];
    if (d.speed < 0)  parts.push(`${_T('ui.curse.stat_speed', '속도')}${(d.speed * 100).toFixed(0)}%`);
    if (d.range < 0)  parts.push(`${_T('ui.curse.stat_range', '사거리')}${d.range}`);
    if (d.damage < 0) parts.push(`${_T('ui.curse.stat_damage', '피해')}${(d.damage * 100).toFixed(0)}%`);
    if (d.seGain < 0) parts.push(`SE${(d.seGain * 100).toFixed(0)}%`);
    if (parts.length) html += `<div class="gstat-row gstat-ally">${_T('ui.curse.stat_ally_prefix', '아군')} ${parts.join(' · ')}</div>`;

    const stage = window.stage || 1;
    if (stage >= 5 && typeof getStageMultipliers === 'function') {
        const { hpStageMult, speedStageMult, defenseStageBuff } = getStageMultipliers();
        const eParts = [
            `HP×${hpStageMult.toFixed(2)}`,
            `${_T('ui.curse.enemy_speed_label', '속도×')}${speedStageMult.toFixed(2)}`,
            defenseStageBuff > 0 ? `${_T('ui.curse.enemy_defense_label', '방어+')}${defenseStageBuff}` : null
        ].filter(Boolean);
        html += `<div class="gstat-row gstat-enemy">${window.SvgIcons ? window.SvgIcons.get('warning') : ''} ${_T('ui.curse.stat_enemy_prefix', '적')} ${eParts.join(' · ')}</div>`;
    }
    rows.innerHTML = html;
}

window.updateGargoyleWidget = updateGargoyleWidget;

/** Draws the current gargoyle form onto any canvas context at (cx, cy) with scale S. */
function drawCurrentGargoyleForm(targetCtx, cx, cy, S, t) {
    const formIdx = (typeof getGargoyleForm === 'function') ? getGargoyleForm().form : 0;
    const fn = _GARGOYLE_DRAW_FNS[formIdx] || _GARGOYLE_DRAW_FNS[0];
    targetCtx.save();
    targetCtx.imageSmoothingEnabled = false;
    fn(targetCtx, cx, cy, S, t);
    targetCtx.restore();
}
window.drawCurrentGargoyleForm = drawCurrentGargoyleForm;
