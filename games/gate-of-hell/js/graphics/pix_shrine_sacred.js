/* pix_shrine_sacred.js - Sacred Shrines (Tier 2) */
/* Sprite: 96×96 base @ S=2.0; legendary designs with animated effects */

function drawShrinePower(cx, cy, tower) {
    const now = Date.now();
    const S = 2.0;
    const pulse = (Math.sin(now * 0.002) + 1) / 2;
    const type = tower.data.type;

    const p = (ox, oy, col, w = 1, h = 1) => {
        ctx.fillStyle = col;
        ctx.fillRect(Math.round(cx + ox * S), Math.round(cy + oy * S), Math.round(w * S), Math.round(h * S));
    };

    // ── HEAVY SACRED PEDESTAL (shared across all T2 shrines) ─────────────
    // AO shadow on ground beneath pedestal
    if (typeof pAmbientOcclusion === 'function') pAmbientOcclusion(cx, cy, 28, 28, 8, S, 0.55);
    // Lower step (widest)
    p(-22, 12, '#000',    44, 16);
    p(-21, 13, '#0D1240', 42, 14);
    p(-20, 13, '#1A2060', 34,  6);
    p(-18, 17, '#0D1240', 36,  6);
    // Dithered shadow on right face
    if (typeof pDither === 'function') pDither(cx, cy, 8, 14, 13, 12, '#050818', 0.5, S);
    // Upper step
    p(-17,  3, '#000',    34, 10);
    p(-16,  4, '#1A2878', 32,  8);
    p(-14,  4, '#243090', 18,  4);  // lit face
    p(-16, 10, '#141E60', 32,  2);  // shadow edge
    // Rim light on upper step top edge
    if (typeof pRimLight === 'function') pRimLight(cx, cy, -16, 4, 32, 1, '#5060C0', S);
    // Gold trim details
    p(-22, 12, '#FFD700',  1, 16);  // left gold pillar
    p( 21, 12, '#FFD700',  1, 16);  // right gold pillar
    p(-17,  3, '#C8A800', 34,  1);  // top step trim
    p(-22, 17, '#C8A800', 44,  1);  // mid step trim
    p(-22, 26, '#C8A800', 44,  1);  // bottom trim
    // Gold pillar specular highlights (top)
    p(-22,  3, '#FFF9C4',  1,  1);
    p( 21,  3, '#FFF9C4',  1,  1);
    p(-22,  6, '#FFE082',  1,  1);
    p( 21,  6, '#FFE082',  1,  1);
    // Side runes (micro-details) — animated pulse
    const runePulse = 0.55 + pulse * 0.45;
    const runeCol = `rgba(96,144,255,${runePulse})`;
    p(-20,  7, runeCol,  2,  2);  p(18,  7, runeCol,  2,  2);
    p(-20, 21, runeCol,  2,  2);  p(18, 21, runeCol,  2,  2);

    // Pedestal aura glow (shared)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.18 + pulse * 0.12;
    const pedGrad = ctx.createRadialGradient(cx, cy + 20 * S, 0, cx, cy + 20 * S, 30 * S);
    pedGrad.addColorStop(0, 'rgba(255,215,0,0.5)');
    pedGrad.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = pedGrad;
    ctx.beginPath(); ctx.ellipse(cx, cy + 22 * S, 30 * S, 10 * S, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // ── TYPE-SPECIFIC LEGENDARY STRUCTURES ───────────────────────────────

    // Floating gold sparks rising from pedestal (all T2 shrines)
    for (let i = 0; i < 4; i++) {
        const sy = ((now * 0.04 + i * 18) % 60) - 30;
        const sx = Math.sin(now * 0.003 + i * 1.7) * 16;
        const sa = Math.max(0, 1 - (sy + 30) / 60) * 0.9;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = sa;
        p(sx, sy, '#FFD700', 1, 1);
        ctx.restore();
    }

    if (type === 'shrine_divine') {
        // SHRINE OF THE ARCHANGEL: Heavenly radiance, angel wings, holy cross

        // Floating angelic wings (large, animated)
        const wingY = Math.sin(now * 0.003) * 8;
        ctx.save();
        ctx.globalAlpha = 0.65 + pulse * 0.30;
        // Left wing — layered feathers
        p(-34, -26 + wingY, '#FFF9C4', 18, 28);
        p(-32, -22 + wingY, '#FFFDE7', 14, 22);
        p(-30, -18 + wingY, '#FFFFFF', 10, 16);
        // Right wing
        p( 16, -26 + wingY, '#FFF9C4', 18, 28);
        p( 18, -22 + wingY, '#FFFDE7', 14, 22);
        p( 20, -18 + wingY, '#FFFFFF', 10, 16);
        // Feather ridges (left)
        p(-32, -22 + wingY, '#FFD700',  1, 18);
        p(-28, -18 + wingY, '#FFD700',  1, 14);
        p(-24, -14 + wingY, '#FFD700',  1, 10);
        // Feather ridges (right)
        p( 31, -22 + wingY, '#FFD700',  1, 18);
        p( 27, -18 + wingY, '#FFD700',  1, 14);
        p( 23, -14 + wingY, '#FFD700',  1, 10);
        ctx.restore();
        // Wing outlines
        p(-34, -26 + wingY, '#000',     2, 28);
        p( 33, -26 + wingY, '#000',     2, 28);

        // Central gold staff
        p(-1, -48, '#000',     2, 52);
        p( 0, -47, '#FFD700',  1, 50);

        // Halo glow
        ctx.save();
        ctx.globalAlpha = 0.35 + pulse * 0.25;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath(); ctx.ellipse(cx, cy - 44 * S, 16 * S, 16 * S, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Holy cross at top
        p(-7, -50, '#000',    14, 14);  // cross outline
        p(-6, -49, '#FFFFFF', 12, 12);  // white cross
        p(-1, -49, '#FFD700',  2, 12);  // gold vertical bar
        p(-6, -44, '#FFD700', 12,  2);  // gold horizontal bar
        p(-5, -49, '#FFF9C4',  2, 12);  // inner shine vertical
        p(-6, -43, '#FFF9C4', 12,  2);  // inner shine horizontal

        // Radiant glow around cross
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const crossGrad = ctx.createRadialGradient(cx, cy - 44 * S, 0, cx, cy - 44 * S, 24 * S);
        crossGrad.addColorStop(0, `rgba(255,250,200,${0.5 + pulse * 0.4})`);
        crossGrad.addColorStop(0.5, `rgba(255,215,0,${0.2 + pulse * 0.2})`);
        crossGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = crossGrad;
        ctx.beginPath(); ctx.arc(cx, cy - 44 * S, 24 * S, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    else if (type === 'shrine_eternity') {
        // SHRINE OF ETERNITY: Hourglass of time with rotating void rings

        // Rotating outer void ring
        const rot = now * 0.001;
        ctx.save();
        ctx.translate(cx, cy - 22 * S);
        ctx.rotate(rot);
        ctx.strokeStyle = `rgba(74,20,140,${0.5 + pulse * 0.3})`;
        ctx.lineWidth = 3 * S;
        ctx.beginPath(); ctx.rect(-18 * S, -18 * S, 36 * S, 36 * S); ctx.stroke();
        ctx.restore();

        // Counter-rotating inner ring
        ctx.save();
        ctx.translate(cx, cy - 22 * S);
        ctx.rotate(-rot * 2.2);
        ctx.strokeStyle = `rgba(0,229,255,${0.4 + pulse * 0.4})`;
        ctx.lineWidth = 1.5 * S;
        ctx.beginPath(); ctx.rect(-12 * S, -12 * S, 24 * S, 24 * S); ctx.stroke();
        ctx.restore();

        // Hourglass frame (gold)
        p(-7, -36, '#000',    14, 28);
        p(-6, -35, '#FFD700', 12, 26);
        p(-6, -35, '#FFF176',  5, 12);  // highlight
        p(-5, -23, '#B8860B',  2, 10);  // center pinch dark
        // Hourglass glass body
        p(-4, -34, '#000',    8, 12);
        p(-3, -33, '#90CAF9', 6, 10);  // top bulb (sky blue)
        p(-2, -32, '#E3F2FD', 3,  7);  // highlight
        p(-4, -23, '#000',    8, 12);
        p(-3, -22, '#7986CB', 6, 10);  // bottom bulb (deeper)
        p(-2, -21, '#9FA8DA', 3,  7);  // highlight
        // Sand flow (alternating color by time) — brighter for visibility
        const sandCol  = (Math.floor(now / 2000) % 2 === 0) ? '#E040FB' : '#18FFFF';
        const sandTrim = (Math.floor(now / 2000) % 2 === 0) ? '#FFFFFF' : '#FFFFFF';
        p(-1, -30, sandCol,   2,  5);  // top sand
        p(-1, -20, sandCol,   2,  5);  // bottom sand
        p( 0, -30, sandTrim,  1,  1);  // highlight
        p( 0, -20, sandTrim,  1,  1);
        // Falling sand stream through hourglass pinch
        const streamCol = `rgba(${sandCol === '#E040FB' ? '224,64,251' : '24,255,255'},${0.6 + pulse * 0.3})`;
        p(-0.5, -25, streamCol, 1, 4);

        // Eternal glow
        ctx.save();
        ctx.globalAlpha = 0.12 + pulse * 0.10;
        ctx.fillStyle = '#4A148C';
        ctx.beginPath(); ctx.ellipse(cx, cy - 22 * S, 20 * S, 20 * S, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    else if (type === 'shrine_miracle') {
        // SHRINE OF MIRACLES: Prismatic aurora with central miracle star

        // 5 orbiting prismatic shards
        const shardColors = ['#FF1744','#00E676','#2979FF','#FFEA00','#D500F9'];
        for (let i = 0; i < 5; i++) {
            const ang = (now * 0.002) + (i * Math.PI * 0.4);
            const dist = 26 + Math.sin(now * 0.005 + i) * 6;
            const ox = Math.cos(ang) * dist;
            const oy = Math.sin(ang) * dist - 26;
            p(ox - 3, oy - 3, '#000',          6, 8);
            p(ox - 2, oy - 2, shardColors[i],  4, 6);
            p(ox - 1, oy - 1, '#FFFFFF',        2, 2);  // shard highlight
        }

        // Central miracle star
        ctx.save();
        ctx.globalAlpha = 0.5 + pulse * 0.4;
        // Star rays
        p(-12, -35, '#FFFFFF', 24,  2);  // horizontal ray
        p( -2, -46, '#FFFFFF',  4, 22);  // vertical ray
        p( -9, -44, '#FFFFFF',  2, 16);  // diagonal 1
        p(  6, -44, '#FFFFFF',  2, 16);  // diagonal 2
        ctx.restore();

        // Star core
        p(-6, -33, '#000',    12, 12);
        p(-5, -32, '#FFFFFF', 10, 10);
        p(-3, -30, '#FFD700',  6,  6);   // gold center
        p(-2, -29, '#FFFDE7',  4,  4);   // bright core
        p(-1, -29, '#FFFFFF',  2,  2);   // specular dot

        // Prismatic glow
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const starGrad = ctx.createRadialGradient(cx, cy - 28 * S, 0, cx, cy - 28 * S, 28 * S);
        starGrad.addColorStop(0, `rgba(255,255,255,${0.35 + pulse * 0.3})`);
        starGrad.addColorStop(0.4, `rgba(180,120,255,${0.15 + pulse * 0.15})`);
        starGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = starGrad;
        ctx.beginPath(); ctx.arc(cx, cy - 28 * S, 28 * S, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    else {
        // Generic sacred fallback
        p(-7, -26, '#000',    14, 14);
        p(-6, -25, '#00E5FF', 12, 12);
        p(-4, -23, '#FFFFFF',  8,  8);
        p(-2, -21, '#FFFDE7',  4,  4);
    }
}

window.drawShrinePower    = drawShrinePower;
window.drawShrineDivine   = drawShrinePower;
window.drawShrineEternity = drawShrinePower;
window.drawShrineMiracle  = drawShrinePower;
