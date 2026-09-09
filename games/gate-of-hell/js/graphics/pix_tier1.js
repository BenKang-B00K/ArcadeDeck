/* pix_tier1.js - Tier 1 Exorcists (Basic Units) */
/* Sprite standard: 45×63 art-pixels @ S=2.0 nearest-neighbor, 1-2px outline, 2px margin */
/* Isometric 3/4 front view; mirror handled by pUnit isLeft flag */

function drawApprentice(cx, cy, tower) {
    const area = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now = Date.now();
    const timeSinceShot = now - (tower.lastShot || 0);
    const isAttacking = timeSinceShot < 350;
    const S = 2.0; // 2× nearest-neighbor scale
    const p = (ox, oy, col, w = 1, h = 1) => pUnit(ctx, cx, cy, ox, oy, col, w, h, isLeft, S);

    // ── Palette (hue-shifted for isometric depth, light source: top-left) ──
    const CO  = '#000000';
    // Skin: warm to bright, light from top-left
    const SK0 = '#8C4018', SK1 = '#C07040', SK2 = '#E89868', SK3 = '#F8C090', SK4 = '#FFDCB8';
    // Blue sacred robe (deep indigo-blue)
    const B0  = '#0A1248', B1  = '#122070', B2  = '#1A30A8', B3  = '#2848CC', B4  = '#4464DC';
    // White overrobe (slightly blue-tinted shadows for isometric coolness)
    const W0  = '#A8B4CC', W1  = '#C8D4E8', W2  = '#E0E8F4', W3  = '#F0F4FC', W4  = '#F8FAFE';
    // Gold trim (warm hue shift: green-gold shadow → bright yellow-gold → white specular)
    const G0  = '#3C2400', G1  = '#7A5000', G2  = '#B88000', G3  = '#FFD700', G4  = '#FFF4A0';
    // Hair (near-black, cool blue tint for isometric shadow feel)
    const H0  = '#060810', H1  = '#141C2C', H2  = '#283448', H3  = '#485870';
    // Dark leather boots
    const BT0 = '#0C0604', BT1 = '#221008', BT2 = '#402010', BT3 = '#5E3020';

    // ────────────────────────────────────────────────────────
    // Draw order: back → front (boots→robe→belt→arms→chest→neck→head→hair)
    // Y: -31(top) to +31(bottom)  |  X: -22(left) to +22(right)
    // ────────────────────────────────────────────────────────

    // ── 1. BOOTS (oy +23 to +29) ─────────────────────────────────
    // Left boot
    p(-12, 23, CO,  10,  6);   // outline
    p(-11, 24, BT1,  8,  4);   // body
    p(-10, 24, BT2,  4,  3);   // toe highlight (light top-left)
    p(-11, 24, BT3,  2,  2);   // inner highlight
    p(-12, 28, BT0, 10,  1);   // sole shadow
    // Right boot
    p(  2, 23, CO,  10,  6);
    p(  3, 24, BT1,  8,  4);
    p(  3, 24, BT2,  4,  3);
    p(  3, 24, BT3,  2,  2);
    p(  2, 28, BT0, 10,  1);

    // ── 2. ROBE LOWER (A-line, oy +7 to +23) ────────────────────
    p(-13,  6, CO,  26, 18);   // outline
    p(-12,  7, B2,  24, 16);   // blue lining (sides visible)
    p(-11,  7, W0,  22, 15);   // white overrobe: shadow layer
    p( -9,  7, W1,  18, 14);   // mid layer
    p( -7,  7, W2,  13, 13);   // base layer
    p( -4,  7, W3,   8, 12);   // bright center (light from top-left)
    p(  6,  7, W1,   4, 12);   // right-side depth shadow

    // ── 3. GOLD HEM (oy +22 to +23) ─────────────────────────────
    p(-12, 22, G3,  24,  2);   // gold band
    p(-10, 22, G4,   8,  1);   // specular on top-left edge

    // ── 4. ROBE LEFT/RIGHT TRIM ───────────────────────────────────
    p(-13,  7, G3,   2, 16);   // left gold edge
    p(-13,  7, G1,   1, 16);   // left trim shadow
    p( 11,  7, G3,   2, 15);   // right gold edge

    // ── 5. ROBE UPPER / CHEST (oy -11 to +7) ────────────────────
    p(-11, -12, CO,  22, 20);
    p(-10, -11, B3,  20, 18);  // blue lining
    p( -9, -11, W0,  16, 17);
    p( -7, -11, W1,  12, 16);
    p( -4, -11, W2,   8, 15);
    p( -1, -11, W3,   4, 14);  // bright highlight (top-left light)
    p(  5, -11, W1,   4, 14);  // right-side shadow

    // ── 6. UPPER TRIM (vertical robe-edge gold) ───────────────────
    p(-11, -11, G3,   2, 18);
    p( 10, -11, G3,   2, 18);

    // ── 7. SASH / BELT (oy +1 to +6) ────────────────────────────
    p(-11,  1, CO,  22,  6);
    p(-10,  2, G2,  20,  4);   // gold band base
    p( -8,  3, G3,  12,  2);   // center highlight
    p( -8,  5, G1,  12,  1);   // shadow line at bottom

    // ── 8. SHOULDER PADS (oy -14 to -7) ─────────────────────────
    p(-17, -14, CO,  6,  7);
    p(-16, -13, G2,  4,  5);   // gold plate
    p(-16, -13, G3,  2,  2);   // top highlight
    p(-16, -12, G0,  4,  1);   // bottom shadow
    p( 11, -14, CO,  6,  7);
    p( 12, -13, G2,  4,  5);
    p( 12, -13, G3,  2,  2);
    p( 12, -12, G0,  4,  1);

    // ── 9. SLEEVES (oy -8 to +6, behind shoulder pads) ──────────
    p(-16,  -8, CO,  5, 14);
    p(-15,  -7, B3,  2, 12);   // blue sleeve
    p(-14,  -7, W0,  2, 12);   // white highlight edge
    p( 11,  -8, CO,  5, 14);
    p( 12,  -7, B3,  2, 12);
    p( 13,  -7, W0,  2, 12);

    // ── 10. HANDS (oy +6 to +11) ─────────────────────────────────
    p(-16,  6, CO,  5,  6);  p(-15,  7, SK2, 3,  4);
    p( 11,  6, CO,  5,  6);  p( 12,  7, SK2, 3,  4);

    // ── 11. NECK + COLLAR (oy -14 to -11) ────────────────────────
    p( -4, -14, CO,  8,  4);
    p( -3, -13, B3,  6,  2);
    p( -2, -13, W2,  4,  2);

    // ── 12. HEAD (oy -28 to -13, 18w × 16h — chibi round) ───────
    p( -9, -28, CO,  18, 16);  // outline
    p( -8, -27, SK0, 16, 14);  // shadow fill
    p( -7, -27, SK1, 12, 13);  // skin base
    p( -5, -26, SK2,  7, 11);  // mid-light
    p( -3, -26, SK3,  4,  8);  // highlight
    p( -2, -25, SK4,  2,  4);  // brightest

    // ── 13. HAIR (oy -31 to -26, topknot) ────────────────────────
    p(-10, -31, CO,  20,  7);  // hair mass outline
    p( -9, -30, H0,  18,  5);  // base (darkest)
    p( -7, -30, H1,  13,  4);  // mid
    p( -4, -30, H2,   8,  2);  // highlight band
    p( -2, -29, H3,   4,  1);  // top specular (light reflection)
    p(  3, -31, G3,   1,  6);  // gold hairpin

    // ── 14. EYES (oy -23 to -19, big chibi sparkly) ─────────────
    const eyeC = isAttacking ? '#FFEE00' : H0;
    const eyeH = isAttacking ? '#FFFFFF' : H3;
    p(-8, -23, CO,  6, 5);    // left socket (big round)
    p( 2, -23, CO,  6, 5);    // right socket
    p(-7, -22, eyeC, 4, 3);   // left iris
    p( 3, -22, eyeC, 4, 3);   // right iris
    p(-6, -22, '#FFFFFF', 1, 1); // left sparkle (always)
    p( 4, -22, '#FFFFFF', 1, 1); // right sparkle
    if (isAttacking) {
        p(-5, -20, eyeH, 1, 1);
        p( 4, -20, eyeH, 1, 1);
    }

    // ── 15. NOSE + SMILE + BLUSH ─────────────────────────────────
    p( 0, -17, SK1,  1,  1);   // tiny button nose
    p(-2, -15, SK0,  4,  1);   // smile base
    p(-3, -16, SK0,  1,  1);   // smile corner up (left)
    p( 2, -16, SK0,  1,  1);   // smile corner up (right)
    p(-9, -17, '#FF9CA8', 2, 2); // left blush
    p( 7, -17, '#FF9CA8', 2, 2); // right blush

    // ── 16. STAFF (holy exorcist staff, held in right hand) ──────
    const WD0 = '#1C0A02', WD1 = '#4A2808', WD2 = '#7C4A18', WD3 = '#AC7030', WD4 = '#C89050';

    // Shaft: 4px wide, from orb base (oy=-25) down to hand (oy=+10)
    p(12, -25, CO,   4, 36);   // full outline block
    p(13, -24, WD3,  1, 34);   // left highlight strip (light source top-left)
    p(14, -24, WD1,  1, 34);   // right shadow strip

    // Gold bands (decorative rings)
    p(12,  -9, G3,   4,  3);   p(13,  -9, G4, 2, 1);   // upper accent band
    p(12,   3, G3,   4,  3);   p(13,   3, G4, 2, 1);   // grip band (hand level)

    // Staff bottom ferrule (gold tip at hand)
    p(12,   9, G2,   4,  2);

    // Top orb (holy sphere, 8w × 8h art-pixel)
    p(10, -32, CO,   8,  8);                 // orb outline
    p(11, -31, '#2A6E9E', 6,  6);            // orb body (deep sacred blue)
    p(11, -31, '#52A8D8', 4,  5);            // orb mid
    p(11, -31, '#90D4F4', 2,  3);            // orb highlight
    p(11, -31, '#D8F4FF', 1,  1);            // specular dot (top-left)
    // Cross sigil engraved on orb
    p(13, -30, G3,   1,  4);                 // vertical bar
    p(12, -29, G3,   3,  1);                 // crossbar
    p(13, -30, G4,   1,  1);                 // center bright

    // Attack glow effect on orb
    if (isAttacking) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const pulse = (Math.sin(now * 0.04) + 1) / 2;
        const orbSX = isLeft ? cx + 14 * S : cx - 14 * S;
        const orbSY = cy + (-28) * S * 1.13;
        const glowR  = (14 + pulse * 10) * S;
        const grad = ctx.createRadialGradient(orbSX, orbSY, 0, orbSX, orbSY, glowR);
        grad.addColorStop(0,   'rgba(140,220,255,0.9)');
        grad.addColorStop(0.4, 'rgba(80,180,255,0.5)');
        grad.addColorStop(1,   'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(orbSX, orbSY, glowR, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}

function drawNoviceExorcist(cx, cy, tower) {
    const area = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now = Date.now();
    const timeSinceShot = now - (tower.lastShot || 0);
    const isAttacking = timeSinceShot < 300;
    const idleY = Math.sin(now * 0.0025) * 2;
    const S = 2.0;
    const p = (ox, oy, col, w = 1, h = 1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);

    // ── Palette (hue-shifted: light top-left, shadow bottom-right) ────────
    const CO   = '#000000';
    // Lavender student robes (purple → blue-violet transition for depth)
    const R0   = '#2A1840', R1   = '#4A2878', R2   = '#7448B0', R3   = '#A070D8', R4   = '#C898F0';
    // White overrobe (blue-grey shadows, pure white highlight)
    const W0   = '#9098B8', W1   = '#B8C0D8', W2   = '#D8E0F0', W3   = '#EEF2FC', W4   = '#F8FAFF';
    // Gold sash/trim (warm hue shift: olive shadow → bright gold → cream specular)
    const G0   = '#3C2800', G1   = '#7A5200', G2   = '#C08800', G3   = '#FFD700', G4   = '#FFF8C0';
    // Warm skin tones (top-left lit)
    const SK0  = '#7C3A18', SK1  = '#B06040', SK2  = '#D88860', SK3  = '#F0A878', SK4  = '#FFD0A8';
    // Brown hair (warm chocolate to light caramel highlight)
    const H0   = '#1C0A04', H1   = '#4A2010', H2   = '#8A4820', H3   = '#C07840', H4   = '#E0A060';
    // Soft leather sandals
    const BT0  = '#140804', BT1  = '#2E1608', BT2  = '#5C3018', BT3  = '#8C5030';

    // ── 1. SANDALS (oy +23 to +29) ────────────────────────────────────────
    // Left sandal
    p(-10, 23, CO,  9,  6);
    p( -9, 24, BT1,  7,  4);
    p( -8, 24, BT2,  4,  3);
    p( -8, 24, BT3,  2,  2);
    p(-10, 28, BT0,  9,  1);
    // Right sandal
    p(  1, 23, CO,  9,  6);
    p(  2, 24, BT1,  7,  4);
    p(  2, 24, BT2,  4,  3);
    p(  2, 24, BT3,  2,  2);
    p(  1, 28, BT0,  9,  1);

    // ── 2. ROBE LOWER (A-line flare, oy +7 to +23) ───────────────────────
    p(-12,  6, CO,  24, 18);
    p(-11,  7, R1,  22, 16);   // purple lining (visible sides)
    p(-10,  7, W0,  20, 15);   // white overrobe shadow layer
    p( -8,  7, W1,  16, 14);   // mid
    p( -6,  7, W2,  12, 13);   // base
    p( -3,  7, W3,   7, 12);   // bright center (top-left light)
    p(  5,  7, W1,   4, 12);   // right-side depth shadow

    // ── 3. GOLD HEM (oy +22 to +23) ──────────────────────────────────────
    p(-11, 22, G3,  22,  2);
    p( -9, 22, G4,   7,  1);   // specular top-left

    // ── 4. ROBE TRIM (vertical gold edges) ───────────────────────────────
    p(-12,  7, G2,   2, 16);
    p(-12,  7, G0,   1, 16);
    p( 10,  7, G2,   2, 15);

    // ── 5. ROBE UPPER / CHEST (oy -11 to +7) ─────────────────────────────
    p(-10, -12, CO,  20, 20);
    p( -9, -11, R2,  18, 18);  // purple lining
    p( -8, -11, W0,  14, 17);
    p( -6, -11, W1,  10, 16);
    p( -4, -11, W2,   7, 15);
    p( -1, -11, W3,   4, 14);  // bright highlight top-left
    p(  5, -11, W1,   3, 14);  // right shadow

    // ── 6. UPPER TRIM ─────────────────────────────────────────────────────
    p(-10, -11, G2,   2, 18);
    p(  9, -11, G2,   2, 18);

    // ── 7. GOLD SASH (oy +1 to +6) ────────────────────────────────────────
    p(-10,  1, CO,  20,  6);
    p( -9,  2, G2,  18,  4);
    p( -7,  3, G3,  10,  2);
    p( -7,  5, G1,  10,  1);

    // ── 8. SMALL GOLD SHOULDER EMBLEMS (oy -13 to -8) ────────────────────
    // Left emblem
    p(-15, -13, CO,  5,  6);
    p(-14, -12, G2,  3,  4);
    p(-14, -12, G3,  1,  2);
    // Right emblem
    p( 10, -13, CO,  5,  6);
    p( 11, -12, G2,  3,  4);
    p( 11, -12, G3,  1,  2);

    // ── 9. SLEEVES (oy -8 to +6) ──────────────────────────────────────────
    p(-14,  -8, CO,  4, 14);  p(-13,  -7, R3,  2, 12);  p(-12,  -7, W0,  2, 12);
    p( 10,  -8, CO,  4, 14);  p( 11,  -7, R3,  2, 12);  p( 12,  -7, W0,  2, 12);

    // ── 10. HANDS (oy +6 to +11) ─────────────────────────────────────────
    p(-14,  6, CO,  4,  6);  p(-13,  7, SK2,  2,  4);
    p( 10,  6, CO,  4,  6);  p( 11,  7, SK2,  2,  4);

    // ── 11. COLLAR (oy -14 to -11) ────────────────────────────────────────
    p( -4, -14, CO,  8,  4);
    p( -3, -13, R2,  6,  2);
    p( -2, -13, W2,  4,  2);

    // ── 12. HEAD (oy -28 to -13, 18w × 16h — chibi round) ───────────────
    p( -9, -28, CO,  18, 16);
    p( -8, -27, SK0, 16, 14);  // deep shadow
    p( -7, -27, SK1, 12, 13);  // skin base
    p( -5, -26, SK2,  7, 11);  // mid-light
    p( -3, -26, SK3,  4,  8);  // highlight
    p( -2, -25, SK4,  2,  4);  // brightest

    // ── 13. HAIR (oy -31 to -26, shoulder length with front swept) ────────
    p(-10, -31, CO,  20,  7);  // hair mass outline
    p( -9, -30, H0,  18,  5);  // darkest base
    p( -7, -30, H1,  13,  4);  // mid shadow
    p( -4, -30, H2,   8,  3);  // base color
    p( -2, -29, H3,   5,  2);  // highlight band
    p( -1, -28, H4,   2,  1);  // top specular

    // ── 14. EYES (oy -23 to -19, big chibi sparkly) ───────────────────────
    const eyeC = isAttacking ? '#9900FF' : '#4A1880';
    const eyeH = isAttacking ? '#E8B0FF' : '#8858C0';
    p(-8, -23, CO,  6, 5);     // left socket (big round)
    p( 2, -23, CO,  6, 5);     // right socket
    p(-7, -22, eyeC, 4, 3);    // left iris
    p( 3, -22, eyeC, 4, 3);    // right iris
    p(-6, -22, '#FFFFFF', 1, 1); // left sparkle
    p( 4, -22, '#FFFFFF', 1, 1); // right sparkle
    p(-5, -20, eyeH, 1, 1);    // bottom specular
    p( 4, -20, eyeH, 1, 1);

    // ── 15. NOSE + SMILE + BLUSH ─────────────────────────────────────────
    p( 0, -17, SK1,  1,  1);   // tiny button nose
    p(-2, -15, SK0,  4,  1);   // smile base
    p(-3, -16, SK0,  1,  1);   // smile corner up (left)
    p( 2, -16, SK0,  1,  1);   // smile corner up (right)
    p(-9, -17, '#FFB0C0', 2, 2); // left blush (lavender-pink)
    p( 7, -17, '#FFB0C0', 2, 2); // right blush

    // ── 16. SACRED BOOK OF SEALS ─────────────────────────────────────────
    // Book cover palette
    const BK0 = '#1A004A', BK1 = '#3A0A80', BK2 = '#6820B8';
    let bookOX = isAttacking ? 11 : 9;
    let bookOY = isAttacking ? -13 : -11;
    ctx.save();
    if (isLeft) { ctx.translate(cx - bookOX * S, cy + (bookOY + idleY) * S); }
    else         { ctx.translate(cx + bookOX * S, cy + (bookOY + idleY) * S); ctx.scale(-1, 1); }
    if (isAttacking) ctx.rotate(-0.18);

    const pB = (ox, oy, col, w = 1, h = 1) => {
        ctx.fillStyle = col;
        ctx.fillRect(Math.round(ox * S), Math.round(oy * S), Math.round(w * S), Math.round(h * S));
    };
    // Book outline
    pB(-8, -10, CO,  14, 20);
    // Deep purple cover
    pB(-7,  -9, BK0, 12, 18);
    pB(-6,  -9, BK1,  8, 17);
    // Gold border runes
    pB(-7,  -9, G3,  12,  2);
    pB(-7,   7, G3,  12,  2);
    pB(-7,  -9, G3,   2, 18);
    pB( 3,  -9, G3,   2, 18);
    // Central seal sigil
    pB(-2,  -4, G3,   4,  4);
    pB(-1,  -5, G4,   2,  6);
    pB(-3,  -3, G4,   6,  2);

    if (isAttacking) {
        // Open book with glowing pages
        pB( 5, -8, CO,     9, 17);
        pB( 6, -7, '#FFFDE7', 7, 15);  // parchment pages
        pB( 7, -5, '#6820B8',  4,  2); // ink line top
        pB( 7, -2, '#6820B8',  3,  2); // ink line mid
        pB( 7,  1, '#6820B8',  5,  1); // ink line bot
    }
    ctx.restore();

    // ── 17. ATTACK BOOK GLOW ─────────────────────────────────────────────
    if (isAttacking) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const pulse = (Math.sin(now * 0.025) + 1) / 2;
        const glowRad = (24 + pulse * 14) * S;
        const gx = cx + (isLeft ? -(bookOX - 3) : (bookOX - 3)) * S;
        const gy = cy + (bookOY - 1 + idleY) * S;
        const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, glowRad);
        grad.addColorStop(0,   'rgba(180,80,255,0.9)');
        grad.addColorStop(0.4, 'rgba(120,40,200,0.5)');
        grad.addColorStop(1,   'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(gx, gy, glowRad, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}


function drawAcolytePriest(cx, cy, tower) {
    const area = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now = Date.now();
    const timeSinceShot = now - (tower.lastShot || 0);
    const isAttacking = timeSinceShot < 380;
    const idleY = Math.sin(now * 0.002) * 1.5;
    const S = 2.0;
    const p = (ox, oy, col, w = 1, h = 1) => pUnit(ctx, cx, cy, ox, oy + idleY, col, w, h, isLeft, S);

    // ── Palette: forest-green priest, healer theme ────────────────────────
    const CO  = '#000000';
    // Sage-green sacred robe
    const GR0 = '#0C2614', GR1 = '#1A4824', GR2 = '#2E7440', GR3 = '#48A060', GR4 = '#78D090';
    // Cream overrobe (warm white, gold-tinted shadows)
    const W0  = '#9C9880', W1  = '#C4C0A0', W2  = '#E4E0C0', W3  = '#F4F0DC', W4  = '#FCFAF0';
    // Gold trim
    const G0  = '#3C2400', G1  = '#7A5000', G2  = '#B88000', G3  = '#FFD700', G4  = '#FFF4A0';
    // Skin (warm light)
    const SK0 = '#7C3818', SK1 = '#B05838', SK2 = '#D88058', SK3 = '#F0A878', SK4 = '#FFD0A8';
    // Auburn hair
    const H0  = '#1A0804', H1  = '#3C1808', H2  = '#783818', H3  = '#B86028', H4  = '#E89048';
    // Leather sandals
    const BT0 = '#100804', BT1 = '#281408', BT2 = '#502810', BT3 = '#7C4820';

    // ── 1. SANDALS ──────────────────────────────────────────────────────
    p(-11, 23, CO,  9,  6);   p(-10, 24, BT1, 7,  4);
    p( -9, 24, BT2, 4,  3);   p( -9, 24, BT3, 2,  2);
    p(-11, 28, BT0, 9,  1);
    p(  2, 23, CO,  9,  6);   p(  3, 24, BT1, 7,  4);
    p(  3, 24, BT2, 4,  3);   p(  3, 24, BT3, 2,  2);
    p(  2, 28, BT0, 9,  1);

    // ── 2. ROBE LOWER (A-line) ──────────────────────────────────────────
    p(-13,  6, CO,  26, 18);
    p(-12,  7, GR2, 24, 16);
    p(-11,  7, W0,  22, 15);
    p( -9,  7, W1,  18, 14);
    p( -7,  7, W2,  13, 13);
    p( -4,  7, W3,   8, 12);
    p(  6,  7, W1,   4, 12);

    // ── 3. GOLD HEM ─────────────────────────────────────────────────────
    p(-12, 22, G3,  24,  2);
    p(-10, 22, G4,   8,  1);

    // ── 4. GREEN VERTICAL TRIM ─────────────────────────────────────────
    p(-13,  7, GR3,  2, 16);
    p(-13,  7, GR1,  1, 16);
    p( 11,  7, GR3,  2, 15);

    // ── 5. ROBE UPPER / CHEST ───────────────────────────────────────────
    p(-11, -12, CO,  22, 20);
    p(-10, -11, GR3, 20, 18);
    p( -9, -11, W0,  16, 17);
    p( -7, -11, W1,  12, 16);
    p( -4, -11, W2,   8, 15);
    p( -1, -11, W3,   4, 14);
    p(  5, -11, W1,   4, 14);

    // ── 6. UPPER GREEN TRIM ─────────────────────────────────────────────
    p(-11, -11, GR3,  2, 18);
    p( 10, -11, GR3,  2, 18);

    // ── 7. SASH (green stole with gold edges) ───────────────────────────
    p(-11,  1, CO,  22,  6);
    p(-10,  2, GR2, 20,  4);
    p( -8,  3, GR3, 12,  2);
    p( -8,  2, G3,  20,  1);
    p( -8,  5, G1,  20,  1);

    // ── 8. SHOULDER PADS (cloth, not metal) ─────────────────────────────
    p(-16, -14, CO,  6,  7);
    p(-15, -13, GR2, 4,  5);
    p(-15, -13, GR3, 2,  2);
    p(-15, -12, GR1, 4,  1);
    p( 11, -14, CO,  6,  7);
    p( 12, -13, GR2, 4,  5);
    p( 12, -13, GR3, 2,  2);
    p( 12, -12, GR1, 4,  1);

    // ── 9. SLEEVES ─────────────────────────────────────────────────────
    p(-15,  -8, CO,  4, 14);  p(-14, -7, GR3, 2, 12);  p(-13, -7, W0, 2, 12);
    p( 11,  -8, CO,  4, 14);  p( 12, -7, GR3, 2, 12);  p( 13, -7, W0, 2, 12);

    // ── 10. HANDS ──────────────────────────────────────────────────────
    p(-15,  6, CO,  4,  6);   p(-14,  7, SK2, 2,  4);
    p( 11,  6, CO,  4,  6);   p( 12,  7, SK2, 2,  4);

    // ── 11. COLLAR + DOVE PENDANT ──────────────────────────────────────
    p( -4, -14, CO,  8,  4);
    p( -3, -13, GR2, 6,  2);
    p( -2, -13, W2,  4,  2);
    p( -1,  -9, W4,  2,  2);   // pendant dove body (white)
    p(  0, -10, W4,  1,  1);   // dove head spec

    // ── 12. HEAD (chibi round) ─────────────────────────────────────────
    p( -9, -28, CO,  18, 14);
    p( -8, -27, SK0, 16, 12);
    p( -7, -27, SK1, 12, 11);
    p( -5, -26, SK2,  7,  9);
    p( -3, -26, SK3,  4,  7);
    p( -2, -25, SK4,  2,  4);

    // ── 13. HAIR (short, swept — wider to frame round head) ────────────
    p(-10, -31, CO,  20,  6);
    p( -9, -30, H0,  18,  4);
    p( -7, -30, H1,  13,  3);
    p( -5, -30, H2,   9,  2);
    p( -3, -29, H3,   6,  1);
    p( -2, -29, H4,   3,  1);

    // ── 14. EYES (big sparkly gentle green) ────────────────────────────
    const eyeC = isAttacking ? '#A0FFB0' : GR2;
    const eyeH = isAttacking ? '#FFFFFF' : GR4;
    p(-8, -23, CO,  6, 5);
    p( 2, -23, CO,  6, 5);
    p(-7, -22, eyeC, 4, 3);
    p( 3, -22, eyeC, 4, 3);
    p(-6, -22, '#FFFFFF', 1, 1); // sparkle
    p( 4, -22, '#FFFFFF', 1, 1);
    p(-5, -20, eyeH, 1, 1);
    p( 4, -20, eyeH, 1, 1);

    // ── 15. NOSE + SMILE + BLUSH ───────────────────────────────────────
    p( 0, -17, SK1,  1,  1);   // button nose
    p(-2, -15, SK0,  4,  1);   // smile base
    p(-3, -16, SK0,  1,  1);   // left corner
    p( 2, -16, SK0,  1,  1);   // right corner
    p(-9, -17, '#FFB8A8', 2, 2); // blush
    p( 7, -17, '#FFB8A8', 2, 2);

    // ── 16. CROSS STAFF (right hand) ───────────────────────────────────
    const WD0 = '#1C0A02', WD1 = '#4A2808', WD3 = '#AC7030';
    // Shaft
    p(12, -22, CO,   4, 33);
    p(13, -21, WD3,  1, 31);
    p(14, -21, WD1,  1, 31);
    // Cross at top
    p(10, -29, CO,   8,  3);   // horizontal bar outline
    p(11, -28, G3,   6,  1);
    p(12, -29, CO,   4,  9);   // vertical bar outline (already overlapped with shaft)
    p(13, -28, G3,   2,  7);
    p(13, -28, G4,   1,  1);   // specular
    // Vine wrap (green wrapping)
    p(12, -10, GR3,  4,  2);   p(13, -10, GR4, 2, 1);
    p(12,   2, GR3,  4,  2);   p(13,   2, GR4, 2, 1);

    // ── 17. HEALING AURA (when attacking) ──────────────────────────────
    if (isAttacking) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const pulse = (Math.sin(now * 0.03) + 1) / 2;
        const crossSX = isLeft ? cx + 14 * S : cx - 14 * S;
        const crossSY = cy + (-26 + idleY) * S * 1.13;
        const glowR  = (16 + pulse * 12) * S;
        const grad = ctx.createRadialGradient(crossSX, crossSY, 0, crossSX, crossSY, glowR);
        grad.addColorStop(0,   'rgba(180,255,200,0.9)');
        grad.addColorStop(0.4, 'rgba(120,220,140,0.5)');
        grad.addColorStop(1,   'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(crossSX, crossSY, glowR, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}

function drawAcolyteWarrior(cx, cy, tower) {
    const area = tower.currentSlot ? tower.currentSlot.area : 'left-slots';
    const isLeft = area === 'left-slots';
    const now = Date.now();
    const timeSinceShot = now - (tower.lastShot || 0);
    const isAttacking = timeSinceShot < 300;
    const swingAngle = isAttacking ? 0.9 : 0;
    const S = 2.0;
    const p = (ox, oy, col, w = 1, h = 1) => pUnit(ctx, cx, cy, ox, oy, col, w, h, isLeft, S);

    // ── Palette: crimson tunic, silver mail, melee warrior ────────────────
    const CO  = '#000000';
    // Crimson tunic (deep red → bright)
    const R0  = '#280808', R1  = '#5C1410', R2  = '#982020', R3  = '#D03830', R4  = '#F86060';
    // Steel mail (cool blue-grey)
    const M0  = '#10141C', M1  = '#28303C', M2  = '#505868', M3  = '#7C8898', M4  = '#B8C4D4';
    // Leather (brown)
    const L0  = '#180A04', L1  = '#3C1C08', L2  = '#683818', L3  = '#9C5828';
    // Gold/brass accents
    const G0  = '#3C2400', G2  = '#B88000', G3  = '#FFD700', G4  = '#FFF4A0';
    // Skin (warm)
    const SK0 = '#7C3818', SK1 = '#B05838', SK2 = '#D88058', SK3 = '#F0A878', SK4 = '#FFD0A8';
    // Dark blond hair
    const H0  = '#1A1004', H1  = '#3C2A0C', H2  = '#785818', H3  = '#B88828', H4  = '#E8B850';
    // Iron boots
    const BT0 = '#080A12', BT1 = '#181C28', BT2 = '#303848', BT3 = '#505868';

    // ── 1. BOOTS (iron-plated) ──────────────────────────────────────────
    p(-12, 23, CO, 10,  6);   p(-11, 24, BT1, 8,  4);
    p(-10, 24, BT2, 4,  3);   p(-11, 24, BT3, 2,  2);
    p(-12, 28, BT0, 10, 1);
    p(  2, 23, CO, 10,  6);   p(  3, 24, BT1, 8,  4);
    p(  3, 24, BT2, 4,  3);   p(  3, 24, BT3, 2,  2);
    p(  2, 28, BT0, 10, 1);

    // ── 2. PANTS (no robe — leg armor, oy +9 to +23) ────────────────────
    p(-10,  9, CO,  20, 14);
    p( -9, 10, L1,  18, 12);
    p( -8, 10, L2,  12, 11);
    p( -6, 10, L3,   6, 10);
    // knee plates (steel)
    p(-10, 14, CO,  6,  5);   p(-9, 15, M3,  4, 3);   p(-9, 15, M4, 2, 1);
    p(  4, 14, CO,  6,  5);   p( 5, 15, M3,  4, 3);   p( 5, 15, M4, 2, 1);

    // ── 3. TUNIC LOWER (crimson, oy +1 to +9) ───────────────────────────
    p(-11,  0, CO,  22, 10);
    p(-10,  1, R1,  20,  8);
    p( -9,  1, R2,  16,  7);
    p( -7,  1, R3,  10,  6);
    p( -4,  1, R4,   4,  6);

    // ── 4. BELT (leather + buckle) ──────────────────────────────────────
    p(-11,  6, CO,  22,  4);
    p(-10,  7, L2,  20,  2);
    p(-10,  7, L3,  20,  1);
    p( -2,  7, G3,   4,  2);   // buckle
    p( -1,  7, G4,   2,  1);

    // ── 5. CHEST MAIL (oy -11 to +1) ────────────────────────────────────
    p(-11, -12, CO,  22, 14);
    p(-10, -11, M1,  20, 12);
    p( -9, -11, M2,  16, 11);
    p( -7, -11, M3,  12, 10);
    p( -5, -11, M4,   6,  9);
    // tabard overlay (crimson V down center)
    p( -2, -11, R2,   4, 12);
    p( -1, -11, R3,   2, 12);
    // gold trim across shoulders
    p(-10, -12, G2,  20,  1);
    p(-10, -10, G0,  20,  1);

    // ── 6. SHOULDER PAULDRONS (steel) ──────────────────────────────────
    p(-16, -14, CO,  6,  6);
    p(-15, -13, M2,  4,  4);
    p(-15, -13, M3,  2,  2);
    p(-15, -13, M4,  1,  1);
    p( 11, -14, CO,  6,  6);
    p( 12, -13, M2,  4,  4);
    p( 12, -13, M3,  2,  2);
    p( 12, -13, M4,  1,  1);

    // ── 7. ARMS (mail sleeves) ──────────────────────────────────────────
    p(-16,  -8, CO,  5, 13);   p(-15, -7, M2,  3, 11);  p(-14, -7, M3, 2, 11);
    p( 11,  -8, CO,  5, 13);   p( 12, -7, M2,  3, 11);  p( 13, -7, M3, 2, 11);

    // ── 8. LEFT HAND (holds buckler) ────────────────────────────────────
    p(-15,  5, CO,  4,  5);   p(-14, 6, SK2, 2, 3);

    // ── 9. BUCKLER (small round shield, left arm) ───────────────────────
    p(-21,  -2, CO,  8, 11);
    p(-20,  -1, M2,  6,  9);
    p(-20,  -1, M3,  4,  6);
    p(-20,  -1, M4,  2,  3);
    p(-19,   3, G3,  2,  2);   // central gold boss
    p(-19,   3, G4,  1,  1);

    // ── 10. NECK + GORGET ───────────────────────────────────────────────
    p( -4, -14, CO,  8,  4);
    p( -3, -13, M2,  6,  2);
    p( -2, -13, M4,  4,  1);

    // ── 11. HEAD (chibi round) ─────────────────────────────────────────
    p( -9, -28, CO,  18, 14);
    p( -8, -27, SK0, 16, 12);
    p( -7, -27, SK1, 12, 11);
    p( -5, -26, SK2,  7,  9);
    p( -3, -26, SK3,  4,  7);
    p( -2, -25, SK4,  2,  4);

    // ── 12. HAIR (battle-cropped, wider) ───────────────────────────────
    p(-10, -31, CO,  20,  5);
    p( -9, -30, H0,  18,  3);
    p( -7, -30, H1,  13,  2);
    p( -5, -30, H2,   9,  2);
    p( -3, -29, H3,   6,  1);
    p( -2, -29, H4,   3,  1);
    // forehead band (red cloth) — above eyes
    p(-9, -25, R2,  18,  1);
    p(-8, -25, R3,  16,  1);

    // ── 13. EYES (big determined blue) ─────────────────────────────────
    const eyeC = isAttacking ? '#FFFFFF' : '#1830A0';
    const eyeH = isAttacking ? '#FF6060' : '#5878D0';
    p(-8, -23, CO,  6, 5);
    p( 2, -23, CO,  6, 5);
    p(-7, -22, eyeC, 4, 3);
    p( 3, -22, eyeC, 4, 3);
    p(-6, -22, '#FFFFFF', 1, 1); // sparkle
    p( 4, -22, '#FFFFFF', 1, 1);
    p(-5, -20, eyeH, 1, 1);
    p( 4, -20, eyeH, 1, 1);

    // ── 14. NOSE + SMIRK + BLUSH (cuter battle face) ───────────────────
    p( 0, -17, SK1,  1,  1);   // button nose
    p(-2, -15, SK0,  4,  1);   // smile base
    p(-3, -16, SK0,  1,  1);   // left corner
    p( 2, -16, SK0,  1,  1);   // right corner
    p(-9, -17, '#FFAA9A', 2, 2); // blush
    p( 7, -17, '#FFAA9A', 2, 2);

    // ── 15. SHORT SWORD (right hand, swings on attack) ─────────────────
    ctx.save();
    const handSX = isLeft ? cx + 13 * S : cx - 13 * S;
    const handSY = cy + 6 * S * 1.13;
    ctx.translate(handSX, handSY);
    if (!isLeft) ctx.scale(-1, 1);
    ctx.rotate(-0.4 - swingAngle);

    const pS = (ox, oy, col, w = 1, h = 1) => {
        ctx.fillStyle = col;
        ctx.fillRect(Math.round(ox * S), Math.round(oy * S * 1.13), Math.round(w * S), Math.round(h * S * 1.13));
    };
    // Pommel + grip
    pS(-1,  0, CO,  4,  3);   pS(0, 1, G3, 2, 1);
    pS(-1,  3, CO,  4,  5);   pS(0, 3, L2, 2, 4);   // leather grip
    // Crossguard
    pS(-3,  8, CO,  8,  2);   pS(-2, 8, G2, 6, 1);  pS(-2, 8, G3, 4, 1);
    // Blade (long, tapered upward)
    pS(-1, 10, CO,  4, 20);
    pS( 0, 11, M3,  2, 18);
    pS( 0, 11, M4,  1, 16);
    pS( 0, 28, M2,  2, 2);    // tip shadow
    // Blade glow on swing
    if (isAttacking) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(255,240,200,0.6)';
        ctx.fillRect(Math.round(-1 * S), Math.round(10 * S * 1.13), Math.round(4 * S), Math.round(20 * S * 1.13));
    }
    ctx.restore();

    // ── 16. SWING ARC FX ───────────────────────────────────────────────
    if (isAttacking) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const arcSX = isLeft ? cx + 18 * S : cx - 18 * S;
        const arcSY = cy + (-4) * S * 1.13;
        const grad = ctx.createRadialGradient(arcSX, arcSY, 0, arcSX, arcSY, 28 * S);
        grad.addColorStop(0,   'rgba(255,220,160,0.7)');
        grad.addColorStop(0.5, 'rgba(220,80,60,0.35)');
        grad.addColorStop(1,   'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(arcSX, arcSY, 28 * S, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}


window.drawApprentice = drawApprentice;
window.drawNoviceExorcist = drawNoviceExorcist;
window.drawAcolytePriest = drawAcolytePriest;
window.drawAcolyteWarrior = drawAcolyteWarrior;