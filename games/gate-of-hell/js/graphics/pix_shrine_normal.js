/* pix_shrine_normal.js - Standard Shrines (Tier 1) */
/* Sprite: 45×63 art-pixels @ S=2.0 nearest-neighbor */
/* Isometric view; shrines are centered at cx,cy */

function drawShrineNormal(cx, cy, tower) {
    const now = Date.now();
    const S = 2.0;
    const pulse = (Math.sin(now * 0.003) + 1) / 2;
    const type = tower.data.type;

    const p = (ox, oy, col, w = 1, h = 1) => {
        ctx.fillStyle = col;
        ctx.fillRect(Math.round(cx + ox * S), Math.round(cy + oy * S), Math.round(w * S), Math.round(h * S));
    };

    // ── COMMON STONE BASE (consistent across all T1 shrines) ─────────────
    // AO under base (multiply darken on ground)
    if (typeof pAmbientOcclusion === 'function') pAmbientOcclusion(cx, cy, 22, 18, 5, S, 0.45);
    // Outer foundation step
    p(-14, 12, '#000',    28,  9);
    p(-13, 13, '#1A1A1A', 26,  7);
    p(-12, 13, '#2D2D2D', 20,  2);
    p(-13, 16, '#242424', 26,  2);
    // Dithered cast shadow on right face (Bayer fade)
    if (typeof pDither === 'function') pDither(cx, cy, 4, 14, 9, 5, '#0A0A0A', 0.55, S);
    // Inner top platform
    p(-10,  6, '#000',    20,  7);
    p( -9,  7, '#37474F', 18,  5);
    p( -9,  7, '#455A64',  8,  2);
    p(  3,  7, '#263238',  6,  4);
    // Rim light on platform top-left edge (sky bounce)
    if (typeof pRimLight === 'function') pRimLight(cx, cy, -9, 7, 18, 1, '#78909C', S);
    // Gold base trim
    p(-13, 12, '#B8860B',  1,  9);
    p( 13, 12, '#B8860B',  1,  9);
    p(-10,  6, '#9E7800', 20,  1);
    // Gold trim specular hot-pixels
    p(-13,  6, '#FFE082',  1,  1);
    p( 12,  6, '#FFE082',  1,  1);

    // Second-wave T1 shrines live in pix_shrine_extra.js (keeps this file small).
    if (typeof drawShrineExtraTop === 'function' && drawShrineExtraTop(cx, cy, type, S, pulse, now)) return;

    // ── TYPE-SPECIFIC STRUCTURES ─────────────────────────────────────────

    if (type === 'shrine_might') {
        // SHRINE OF MIGHT: Jagged obsidian monolith with embedded ruby
        // Obsidian rock mass
        p(-9, -16, '#000',    18, 22);
        p(-8, -15, '#0D0D0D', 16, 20);
        p(-7, -15, '#1A1A1A', 10, 18);
        p(-4, -14, '#242424',  5, 14);   // bright face
        // Faceted edge highlights
        p(-3, -16, '#3A3A3A',  2,  1);
        p(-2, -15, '#4A4A4A',  1, 12);   // sharp facet line
        p( 5, -14, '#2A2A2A',  1, 14);   // right edge
        // Deep cracks
        p(-8, -12, '#0D0D0D',  3,  6);
        p( 4, -10, '#0D0D0D',  2,  8);
        p(-6,  -2, '#000',     2,  4);   // bottom crack
        // Ruby gem socket
        p(-4,  -6, '#000',     8, 10);
        p(-3,  -5, '#3B0000',  6,  8);
        const rubyGlow = `rgba(255,20,20,${0.55 + pulse * 0.45})`;
        p(-2,  -4, rubyGlow,   4,  6);
        p(-1,  -4, '#FF8080',  2,  2);   // gem specular
        // Ruby glow halo
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.4 + pulse * 0.3;
        ctx.fillStyle = '#FF2020';
        ctx.beginPath(); ctx.arc(cx, cy - 1 * S, 6 * S, 0, Math.PI * 2); ctx.fill();
        // Power aura at base of monolith
        ctx.globalAlpha = 0.18 + pulse * 0.15;
        ctx.beginPath(); ctx.ellipse(cx, cy + 5 * S, 22 * S, 7 * S, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // Rising ember sparks
        for (let i = 0; i < 2; i++) {
            const ey = ((now * 0.05 + i * 25) % 30) - 18;
            const ex = Math.sin(now * 0.004 + i * 3) * 5;
            const ea = Math.max(0, 1 - (ey + 18) / 30);
            ctx.save();
            ctx.globalAlpha = ea * 0.9;
            p(ex, ey, '#FF4400', 1, 1);
            ctx.restore();
        }
    }

    else if (type === 'shrine_speed') {
        // SHRINE OF SPEED: Streamlined white spire with wind wings
        // Central silver spire
        p(-3, -22, '#000',     6, 28);
        p(-2, -21, '#B0BEC5',  4, 26);
        p(-2, -21, '#ECEFF1',  2, 20);  // bright face highlight
        p(-1,  -5, '#78909C',  2,  8);  // lower shadow
        // Gold tip
        p(-2, -23, '#000',     4,  3);
        p(-1, -22, '#FFD700',  2,  2);
        // Animated wind wings
        const wingY = Math.sin(now * 0.012) * 4;
        // Left wing
        p(-14,  -8 + wingY, '#000',     11, 12);
        p(-13,  -7 + wingY, '#CFD8DC',   9, 10);
        p(-12,  -7 + wingY, '#ECEFF1',   5,  7);
        p(-11,  -5 + wingY, '#FFFFFF',   2,  4);
        p(-14, -10 + wingY, '#000',      4,  3);  // wing tip
        p(-13,  -9 + wingY, '#E8EDF0',   3,  2);
        // Right wing (mirror)
        p(  3,  -8 + wingY, '#000',     11, 12);
        p(  4,  -7 + wingY, '#CFD8DC',   9, 10);
        p(  5,  -7 + wingY, '#ECEFF1',   5,  7);
        p(  7,  -5 + wingY, '#FFFFFF',   2,  4);
        p( 10, -10 + wingY, '#000',      4,  3);
        p(  9,  -9 + wingY, '#E8EDF0',   3,  2);
        // Motion streaks trailing each wing
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.35 + pulse * 0.25;
        ctx.strokeStyle = '#ECEFF1';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
            const sy = (-6 + i * 3 + wingY) * S;
            ctx.beginPath();
            ctx.moveTo(cx - 16 * S, cy + sy);
            ctx.lineTo(cx - 22 * S - i * 2, cy + sy);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx + 16 * S, cy + sy);
            ctx.lineTo(cx + 22 * S + i * 2, cy + sy);
            ctx.stroke();
        }
        ctx.restore();
        // Speed glow
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.14 + pulse * 0.10;
        ctx.fillStyle = '#ECEFF1';
        ctx.beginPath(); ctx.ellipse(cx, cy - 2 * S, 16 * S, 22 * S, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    else if (type === 'shrine_range') {
        // SHRINE OF RANGE: Tall observation spire with all-seeing eye
        // Multi-tier tower base
        p(-6,  -5, '#000',    12,  12);
        p(-5,  -4, '#37474F', 10,  10);
        p(-5,  -4, '#455A64',  4,   4);
        // Tower mid section
        p(-5, -14, '#000',    10,  10);
        p(-4, -13, '#37474F',  8,   8);
        p(-4, -13, '#546E7A',  4,   5);
        // Tower spire top
        p(-3, -22, '#000',     6,   9);
        p(-2, -21, '#37474F',  4,   7);
        p(-2, -21, '#607D8B',  2,   5);
        p(-1, -23, '#000',     2,   3);  // pointed tip
        p( 0, -22, '#90A4AE',  1,   2);
        // The All-Seeing Eye (animated)
        const eyeGlow = `rgba(0,229,255,${0.5 + pulse * 0.5})`;
        const eyeY = Math.sin(now * 0.004) * 2;
        p(-3, -18 + eyeY, '#000',    6,  5);
        p(-2, -17 + eyeY, '#E0F7FA', 4,  3);  // sclera
        p(-2, -17 + eyeY, eyeGlow,   2,  2);  // glowing iris
        p(-1, -17 + eyeY, '#FFF',    1,  1);  // pupil glint
        // Eye corona + downward scrying beam
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.45 + pulse * 0.35;
        ctx.fillStyle = '#00E5FF';
        ctx.beginPath(); ctx.arc(cx, cy + (-17 + eyeY) * S, 5 * S, 0, Math.PI * 2); ctx.fill();
        // Downward scrying beam
        ctx.globalAlpha = 0.22 + pulse * 0.18;
        const bg = ctx.createLinearGradient(cx, cy + (-15 + eyeY) * S, cx, cy + 8 * S);
        bg.addColorStop(0, 'rgba(0,229,255,0.6)');
        bg.addColorStop(1, 'rgba(0,229,255,0)');
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.moveTo(cx - 2 * S, cy + (-15 + eyeY) * S);
        ctx.lineTo(cx + 2 * S, cy + (-15 + eyeY) * S);
        ctx.lineTo(cx + 6 * S, cy + 8 * S);
        ctx.lineTo(cx - 6 * S, cy + 8 * S);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    else if (type === 'shrine_wisdom') {
        // SHRINE OF WISDOM: Wooden reading stand with floating ancient scroll
        // Wooden lectern base
        p(-7,   0, '#000',    14, 7);
        p(-6,   1, '#3E2723', 12, 5);
        p(-6,   1, '#5D4037',  6, 3);
        // Lectern slope top
        p(-8,  -3, '#000',    16, 5);
        p(-7,  -2, '#3E2723', 14, 3);
        p(-7,  -2, '#795548',  6, 2);
        // Floating scroll (animated bob)
        const floatY = Math.sin(now * 0.004) * 5;
        p(-9, -16 + floatY, '#000',    18,  8);  // scroll outline
        p(-8, -15 + floatY, '#FFF9C4', 16,  6);  // parchment
        p(-7, -14 + floatY, '#4E342E',  9,  1);  // text line 1
        p(-7, -12 + floatY, '#4E342E',  7,  1);  // text line 2
        p(-7, -10 + floatY, '#4E342E', 10,  1);  // text line 3
        // Scroll end caps (rolled)
        p(-10, -16 + floatY, '#000',    4, 8);
        p( -9, -15 + floatY, '#8D6E63', 2, 6);
        p(  7, -16 + floatY, '#000',    4, 8);
        p(  8, -15 + floatY, '#8D6E63', 2, 6);
        // Soft wisdom glow — tracks scroll bob
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.18 + pulse * 0.12;
        ctx.fillStyle = '#FFF9C4';
        ctx.beginPath(); ctx.ellipse(cx, cy + (-12 + floatY) * S, 16 * S, 7 * S, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // Floating dust motes around scroll
        const m = (now * 0.0015) % 1;
        for (let i = 0; i < 3; i++) {
            const mx = Math.cos(now * 0.002 + i * 2) * 10;
            const my = Math.sin(now * 0.003 + i * 1.7) * 4 - 10 + floatY;
            const a = (0.4 + 0.4 * Math.sin(now * 0.004 + i));
            ctx.save();
            ctx.globalAlpha = a;
            p(mx - 0.5, my, '#FFF9C4', 1, 1);
            ctx.restore();
        }
    }

    else if (type === 'shrine_greed') {
        // SHRINE OF GREED: Gilded treasure chest on a pedestal
        // Stone pedestal
        p(-8,   2, '#000',    16,  5);
        p(-7,   3, '#424242', 14,  3);
        // Treasure chest base
        p(-9,  -7, '#000',    18, 10);
        p(-8,  -6, '#4E342E', 16,  8);
        p(-8,  -6, '#6D4C41',  8,  4);  // lighter face
        // Chest lid
        p(-9, -11, '#000',    18,  5);
        p(-8, -10, '#3E2723', 16,  3);
        p(-8, -10, '#5D4037',  6,  2);
        // Gold banding and lock
        p(-9,  -7, '#FFD700', 18,  1);  // horizontal band
        p(-2,  -9, '#000',     4,  5);  // lock outline
        p(-1,  -8, '#FFD700',  2,  3);  // gold lock
        p( 0,  -8, '#FFF176',  1,  1);  // lock glint
        // Corner gems
        p(-8,  -6, '#00E5FF',  2,  2);  p( 6, -6, '#FF1744', 2, 2);
        // Gold overflow sparkle
        if (pulse > 0.65) {
            p(-3, -14, '#FFD700', 2, 2);
            p( 3, -13, '#FFD700', 1, 2);
            p(-6, -13, '#FFF176', 2, 1);
        }
        // Aura glow
        ctx.save();
        ctx.globalAlpha = 0.15 + pulse * 0.15;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath(); ctx.ellipse(cx, cy - 2 * S, 14 * S, 10 * S, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    else if (type === 'shrine_purity') {
        // SHRINE OF PURITY: Crystal font/basin with rising light pillar
        // Basin outer
        p(-10,   2, '#000',    20, 7);
        p( -9,   3, '#B2EBF2', 18, 5);
        p( -9,   3, '#E0F7FA',  9, 3);
        // Basin inner water
        const waterAlpha = 0.4 + pulse * 0.3;
        p( -7,   4, `rgba(0,229,255,${waterAlpha})`, 14, 3);
        p( -5,   5, '#FFFFFF',   8, 1);  // water surface highlight
        // Rising purity pillar
        p( -4, -20, '#000',    8, 24);
        p( -3, -19, `rgba(0,229,255,${0.4 + pulse * 0.35})`, 6, 22);
        p( -2, -18, '#FFFFFF',  4, 20);
        p( -1, -17, `rgba(200,240,255,${0.7 + pulse * 0.3})`, 2, 18);
        // Light corona at top of pillar
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.35 + pulse * 0.25;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.ellipse(cx, cy - 20 * S, 10 * S, 5 * S, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.18 + pulse * 0.12;
        ctx.fillStyle = '#00E5FF';
        ctx.beginPath(); ctx.ellipse(cx, cy + 5 * S, 16 * S, 6 * S, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // Rising water droplets
        for (let i = 0; i < 3; i++) {
            const dy = ((now * 0.04 + i * 30) % 40) - 20;
            const dx = Math.sin(now * 0.005 + i * 2) * 6;
            const a = Math.max(0, 1 - Math.abs(dy) / 20) * 0.8;
            ctx.save();
            ctx.globalAlpha = a;
            p(dx, dy, '#E0F7FA', 1, 1);
            ctx.restore();
        }
    }

    else if (type !== 'shrine_fervor' && type !== 'shrine_shadow' && type !== 'shrine_harvest' && type !== 'shrine_endurance') {
        // Generic fallback altar
        p(-8,  -12, '#000',    16, 20);
        p(-7,  -11, '#37474F', 14, 18);
        p(-6,  -11, '#455A64',  6, 12);
    }

    // ── SHRINE OF FERVOR: Burning altar with ember flame (crit_damage) ──
    if (type === 'shrine_fervor') {
        p(-8, -14, '#000',    16, 20);
        p(-7, -13, '#3D0000', 14, 18);
        p(-6, -13, '#5A0000',  8, 14);
        p(-4, -12, '#7A1010',  4, 10);
        // Side torch sconces
        p(-10, -8, '#000',     4,  5);  p( 7,  -8, '#000',     4,  5);
        p( -9, -7, '#3D0000',  3,  4);  p( 8,  -7, '#3D0000',  3,  4);
        // Flame pillar
        p(-3, -24, '#000',     6, 12);
        p(-2, -22, '#8B1000',  4, 10);
        p(-2, -21, '#CC3300',  4,  8);
        p(-1, -20, '#FF6600',  2,  6);
        p(-1, -19, '#FF9900',  2,  4);
        p(-1, -18, '#FFD700',  2,  2);
        // Ruby crit gems
        p(-3,  -5, '#FF0033',  2,  2);  p( 1,  -5, '#FF0033',  2,  2);
        ctx.save();
        ctx.globalAlpha = 0.3 + pulse * 0.25; ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = '#FF4400';
        ctx.beginPath(); ctx.arc(cx, cy - 18 * S, 8 * S, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    // ── SHRINE OF SHADOW: Dark monolith with crescent moon (crit_chance) ──
    else if (type === 'shrine_shadow') {
        p(-8, -20, '#000',    16, 26);
        p(-7, -19, '#0D0D1A', 14, 24);
        p(-6, -18, '#1A1A2E', 10, 20);
        p(-4, -17, '#252540',  6, 15);
        // Crescent moon inlay
        p(-2, -14, '#AAAAFF',  4,  8);
        p(-1, -13, '#DDDDFF',  2,  7);
        p( 0, -12, '#000',     3,  6);
        // Star dots
        p(-5, -16, '#CCCCFF',  1,  1);
        p( 4, -10, '#CCCCFF',  1,  1);
        p(-6,  -7, '#CCCCFF',  1,  1);
        ctx.save();
        ctx.globalAlpha = 0.15 + pulse * 0.15; ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = '#8888FF';
        ctx.beginPath(); ctx.arc(cx + 2 * S, cy - 12 * S, 10 * S, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    // ── SHRINE OF HARVEST: Golden bowl with wheat sheaf (se_gain) ──
    else if (type === 'shrine_harvest') {
        p(-9,   0, '#000',    18,  8);
        p(-8,   1, '#4A3000', 16,  6);
        p(-8,   1, '#7A5000',  8,  3);
        p(-4,   2, '#B8860B',  8,  2);
        // Overflowing gold essence
        p(-5,  -4, '#000',    10,  5);
        p(-4,  -3, '#8B6914',  8,  4);
        p(-3,  -2, '#FFD700',  6,  3);
        p(-2,  -1, '#FFEE44',  4,  2);
        // Wheat stalks
        p(-4, -18, '#000',     2, 16);  p( 2, -18, '#000',     2, 16);
        p(-3, -17, '#8B7000',  1, 14);  p( 3, -17, '#8B7000',  1, 14);
        p(-4, -20, '#DAA520',  3,  3);  p( 2, -20, '#DAA520',  3,  3);
        p(-3, -19, '#FFD700',  2,  2);  p( 3, -19, '#FFD700',  2,  2);
        // Center stem
        p(-2, -12, '#000',     4,  9);
        p(-1, -11, '#B8860B',  2,  8);
        p(-1, -10, '#FFD700',  2,  4);
        ctx.save();
        ctx.globalAlpha = 0.2 + pulse * 0.2; ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = '#FFD700';
        ctx.beginPath(); ctx.arc(cx, cy - 5 * S, 12 * S, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    // ── SHRINE OF ENDURANCE: Stone column with healing crystal (pe_recovery) ──
    else if (type === 'shrine_endurance') {
        p(-9, -16, '#000',    18, 22);
        p(-8, -15, '#1A1A1A', 16, 20);
        p(-7, -15, '#2D2D2D', 10, 16);
        p(-4, -13, '#3D3D3D',  4, 12);
        // Crystal veins
        p(-5, -12, '#006655',  1,  8);
        p( 2, -10, '#006655',  1,  7);
        p(-3,  -8, '#006655',  1,  5);
        // Healing crystal at top
        p(-3, -24, '#000',     6,  9);
        p(-2, -23, '#004D40',  4,  8);
        p(-2, -22, '#00897B',  4,  6);
        p(-1, -21, '#4DB6AC',  2,  5);
        p(-1, -20, '#80CBC4',  2,  2);
        ctx.save();
        ctx.globalAlpha = 0.25 + pulse * 0.25; ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = '#00BFA5';
        ctx.beginPath(); ctx.arc(cx, cy - 21 * S, 8 * S, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // Orbiting healing motes
        for (let i = 0; i < 3; i++) {
            const ang = now * 0.003 + i * Math.PI * 0.66;
            const mx = Math.cos(ang) * 9;
            const my = Math.sin(ang) * 3 - 21;
            const ma = 0.6 + 0.3 * Math.sin(now * 0.005 + i);
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = ma;
            p(mx, my, '#4DB6AC', 1, 1);
            ctx.restore();
        }
    }
}

window.drawShrineNormal = drawShrineNormal;
