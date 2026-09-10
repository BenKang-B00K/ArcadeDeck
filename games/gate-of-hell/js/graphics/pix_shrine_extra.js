/* pix_shrine_extra.js - Additional Standard Shrines (Tier 1, second wave) */
/* Sprite: 45x63 art-pixels @ S=2.0 nearest-neighbor, same grid as pix_shrine_normal.js */
/* Draws only the superstructure; the common stone base is already painted by
   drawShrineNormal before this is called. Returns true when it handled `type`. */

const SHRINE_EXTRA_TYPES = new Set([
    'shrine_valor', 'shrine_tempest', 'shrine_horizon', 'shrine_fortune',
    'shrine_ruin', 'shrine_omen', 'shrine_tithe', 'shrine_solace'
]);

function drawShrineExtraTop(cx, cy, type, S, pulse, now) {
    if (!SHRINE_EXTRA_TYPES.has(type)) return false;

    const p = (ox, oy, col, w = 1, h = 1) => {
        ctx.fillStyle = col;
        ctx.fillRect(Math.round(cx + ox * S), Math.round(cy + oy * S), Math.round(w * S), Math.round(h * S));
    };
    // Soft radial falloff — a flat-filled arc reads as an opaque disc at this scale.
    const glow = (ox, oy, r, col, alpha, op = 'lighter') => {
        const gx = cx + ox * S, gy = cy + oy * S, gr = r * S;
        const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        grad.addColorStop(0, col);
        grad.addColorStop(0.45, col + '66');
        grad.addColorStop(1, 'transparent');
        ctx.save();
        ctx.globalCompositeOperation = op;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    };

    // -- SHRINE OF VALOR: greatsword planted in a crimson war banner (damage) --
    if (type === 'shrine_valor') {
        // Banner pole + cloth
        p(-10, -20, '#000',    3, 26);
        p( -9, -19, '#5D4037', 1, 24);
        p( -8, -18, '#000',   10, 15);
        p( -7, -17, '#8E1B1B',  8, 13);
        p( -7, -17, '#B32424',  4,  9);   // lit half
        p( -6, -14, '#C62828',  2,  4);
        p( -7,  -5, '#5A0F0F',  8,  1);   // frayed hem shadow
        p( -6,  -4, '#8E1B1B',  2,  2);   // torn tongue
        p( -3,  -4, '#8E1B1B',  2,  1);
        // Greatsword driven into the altar
        p(  1, -26, '#000',     6, 24);
        p(  2, -25, '#9E9E9E',  4, 20);
        p(  3, -25, '#ECEFF1',  1, 20);   // blade highlight
        p(  2, -26, '#CFD8DC',  4,  2);   // point
        p( -1,  -6, '#000',    10,  3);   // crossguard
        p(  0,  -5, '#B8860B',  8,  1);
        p(  0,  -5, '#FFE082',  2,  1);   // guard specular
        p(  2,  -3, '#000',     4,  6);   // grip
        p(  3,  -2, '#4E342E',  2,  4);
        p(  2,   2, '#B8860B',  4,  2);   // pommel
        // Ruby in the crossguard
        p(  3,  -5, `rgba(255,60,60,${0.6 + pulse * 0.4})`, 2, 1);
        glow(3, -5, 5, '#E53935', 0.28 + pulse * 0.22);
        glow(0, 4, 14, '#C62828', 0.14 + pulse * 0.10);
        // Banner ripple sparks
        for (let i = 0; i < 2; i++) {
            const ry = ((now * 0.045 + i * 22) % 26) - 18;
            const rx = -7 + Math.sin(now * 0.004 + i * 2.1) * 3;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = Math.max(0, 1 - (ry + 18) / 26) * 0.8;
            p(rx, ry, '#FFCDD2', 1, 1);
            ctx.restore();
        }
        return true;
    }

    // -- SHRINE OF TEMPEST: storm pillar ringed by spinning wind bands (speed) --
    if (type === 'shrine_tempest') {
        p(-6, -22, '#000',    12, 28);
        p(-5, -21, '#123039', 10, 26);
        p(-4, -21, '#1B4A57',  5, 22);
        p(-2, -20, '#246878',  2, 18);
        // Lightning fracture down the pillar face
        p(-1, -20, '#4DD0E1',  1,  5);
        p(-2, -15, '#4DD0E1',  1,  4);
        p( 0, -11, '#4DD0E1',  1,  5);
        p(-1,  -6, '#B2EBF2',  1,  3);
        // Cyclone crown
        p(-4, -28, '#000',     8,  6);
        p(-3, -27, '#00ACC1',  6,  4);
        p(-2, -26, '#B2EBF2',  4,  2);
        glow(0, -26, 7, '#4DD0E1', 0.3 + pulse * 0.25);
        // Two counter-rotating wind bands
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let b = 0; b < 2; b++) {
            const dir = b ? -1 : 1;
            const ang = now * 0.004 * dir + b * Math.PI * 0.5;
            ctx.globalAlpha = 0.35 + pulse * 0.2;
            ctx.strokeStyle = b ? '#B2EBF2' : '#00ACC1';
            ctx.lineWidth = Math.max(1, S);
            ctx.beginPath();
            ctx.ellipse(cx, cy - (14 - b * 8) * S, 12 * S, 4 * S, ang * 0.25, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
        // Whipping wind streaks
        for (let i = 0; i < 4; i++) {
            const ang = now * 0.006 + i * Math.PI * 0.5;
            const sx = Math.cos(ang) * 12;
            const sy = Math.sin(ang) * 4 - 13;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = 0.5 + 0.4 * Math.sin(now * 0.005 + i);
            p(sx, sy, '#E0F7FA', 2, 1);
            ctx.restore();
        }
        return true;
    }

    // -- SHRINE OF HORIZON: lighthouse with a sweeping amber lens (range) --
    if (type === 'shrine_horizon') {
        // Tapered tower
        p(-6,  -6, '#000',    12, 12);
        p(-5,  -5, '#37474F', 10, 10);
        p(-5,  -5, '#546E7A',  4,  9);
        p(-5,  -14, '#000',    11,  9);
        p(-4,  -13, '#455A64',  9,  8);
        p(-4,  -13, '#607D8B',  4,  7);
        // Painted bands
        p(-5,  -9, '#8D1F1F', 11,  2);
        p(-4, -17, '#8D1F1F',  9,  2);
        // Lamp room
        p(-5, -24, '#000',    10, 10);
        p(-4, -23, '#3E2723',  8,  8);
        p(-3, -22, '#FFB74D',  6,  6);
        p(-2, -21, '#FFE0B2',  4,  4);
        p(-1, -20, '#FFFFFF',  2,  2);   // filament
        // Cap + finial
        p(-6, -27, '#000',    12,  4);
        p(-5, -26, '#263238', 10,  2);
        p(-1, -30, '#B8860B',  2,  3);
        glow(0, -20, 9, '#FFB74D', 0.3 + pulse * 0.25);
        // Sweeping beam (rotating cone)
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.16 + pulse * 0.08;
        ctx.translate(cx, cy - 20 * S);
        ctx.rotate(Math.sin(now * 0.0009) * 0.9);
        const grad = ctx.createLinearGradient(0, 0, 46 * S, 0);
        grad.addColorStop(0, '#FFE0B2');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(46 * S, -9 * S);
        ctx.lineTo(46 * S,  9 * S);
        ctx.closePath(); ctx.fill();
        ctx.restore();
        return true;
    }

    // -- SHRINE OF FORTUNE: hovering die over a clover basin (crit_chance) --
    if (type === 'shrine_fortune') {
        // Basin
        p(-9,  -2, '#000',    18,  9);
        p(-8,  -1, '#1B5E20', 16,  7);
        p(-8,  -1, '#2E7D32',  7,  3);
        p(-4,   1, '#66BB6A',  8,  2);
        // Clover leaves around the rim
        p(-9,  -4, '#2E7D32',  3,  3);
        p( 6,  -4, '#2E7D32',  3,  3);
        p(-8,  -5, '#66BB6A',  1,  1);
        p( 7,  -5, '#66BB6A',  1,  1);
        // Hovering die (bobs)
        const bob = Math.round(Math.sin(now * 0.0022) * 2);
        p(-5, -19 + bob, '#000',    10, 11);
        p(-4, -18 + bob, '#FFF8E1',  8,  9);
        p(-4, -18 + bob, '#FFFFFF',  4,  4);   // lit face
        p( 1, -14 + bob, '#D7CCC8',  3,  5);   // shaded face
        // Pips
        p(-2, -16 + bob, '#1B1B1B', 1, 1);
        p( 0, -14 + bob, '#1B1B1B', 1, 1);
        p(-3, -12 + bob, '#1B1B1B', 1, 1);
        p( 2, -12 + bob, '#C62828', 1, 1);
        glow(0, -13 + bob, 8, '#FFF176', 0.24 + pulse * 0.22);
        glow(0, 0, 13, '#66BB6A', 0.16 + pulse * 0.12);
        // Luck motes spiralling up
        for (let i = 0; i < 4; i++) {
            const t  = ((now * 0.0006) + i * 0.25) % 1;
            const my = 2 - t * 26;
            const mx = Math.cos(now * 0.003 + i * 1.6) * (3 + t * 7);
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = Math.sin(t * Math.PI) * 0.85;
            p(mx, my, i % 2 ? '#FFF176' : '#A5D6A7', 1, 1);
            ctx.restore();
        }
        return true;
    }

    // -- SHRINE OF RUIN: collapsed cathedral arch over an ember pit (crit_damage) --
    if (type === 'shrine_ruin') {
        // Broken arch legs (right leg snapped short)
        p(-11, -22, '#000',     6, 28);
        p(-10, -21, '#2B2B2B',  4, 26);
        p(-10, -21, '#3D3D3D',  2, 24);
        p( -7, -21, '#1A1A1A',  1, 26);   // right-face shading
        p(  6, -12, '#000',     6, 18);
        p(  7, -11, '#2B2B2B',  4, 16);
        p(  7, -11, '#3D3D3D',  2, 14);
        p( 10, -11, '#1A1A1A',  1, 16);
        // Left springer curving up and inward, snapped off short of the keystone
        p(-11, -27, '#000',     7,  5);
        p(-10, -26, '#3D3D3D',  5,  3);
        p( -7, -31, '#000',     6,  5);
        p( -6, -30, '#3D3D3D',  4,  3);
        p( -2, -33, '#000',     4,  4);
        p( -1, -32, '#4A4A4A',  2,  2);   // jagged break face
        // Right springer, snapped lower — the two never meet
        p(  5, -18, '#000',     7,  5);
        p(  6, -17, '#3D3D3D',  5,  3);
        p(  2, -22, '#000',     6,  5);
        p(  3, -21, '#3D3D3D',  4,  3);
        p(  1, -25, '#000',     3,  3);
        p(  1, -24, '#4A4A4A',  2,  1);   // opposing break face
        // Falling rubble chunks tumbling through the gap
        p(  0, -28, '#2B2B2B',  2,  2);
        p(  3, -27, '#1F1F1F',  1,  1);
        p( -4, -13, '#2B2B2B',  2,  2);
        // Ember pit — an uneven heap of coals, not a slab
        p( -5,  -2, '#000',    10,  7);
        p( -4,  -1, '#3D0A00',  8,  5);
        p( -4,   1, '#B71C1C',  3,  2);
        p(  0,   0, '#B71C1C',  4,  3);
        p( -3,   2, '#E64A19',  2,  1);
        p(  1,   1, '#E64A19',  2,  2);
        p(  2,   1, '#FF8A65',  1,  1);
        p( -2,  -1, '#7A1200',  2,  1);   // spent coal
        glow(0, 1, 10, '#B71C1C', 0.3 + pulse * 0.25);
        // Cracks bleeding light up the left leg
        p(-10, -16, `rgba(230,74,25,${0.5 + pulse * 0.4})`, 1, 4);
        p( -9,  -8, `rgba(230,74,25,${0.5 + pulse * 0.4})`, 1, 3);
        // Rising cinders
        for (let i = 0; i < 3; i++) {
            const t  = ((now * 0.0007) + i * 0.33) % 1;
            const ey = 1 - t * 30;
            const ex = Math.sin(now * 0.004 + i * 2.4) * (2 + t * 6);
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = (1 - t) * 0.9;
            p(ex, ey, t < 0.4 ? '#FF8A65' : '#B71C1C', 1, 1);
            ctx.restore();
        }
        return true;
    }

    // -- SHRINE OF OMEN: obelisk with a perched raven (crit_damage) --
    if (type === 'shrine_omen') {
        p(-6, -20, '#000',    12, 26);
        p(-5, -19, '#160E26', 10, 24);
        p(-4, -19, '#241640',  6, 20);
        p(-2, -18, '#31205A',  2, 16);
        // Carved warding runes
        p(-3, -16, '#5E35B1',  1,  3);
        p( 1, -13, '#5E35B1',  1,  3);
        p(-3,  -9, '#5E35B1',  1,  3);
        // Violet all-seeing eye
        p(-3,  -6, '#000',     7,  5);
        p(-2,  -5, '#311B92',  5,  3);
        p(-1,  -5, `rgba(179,157,219,${0.6 + pulse * 0.4})`, 3, 2);
        glow(0, -4, 6, '#5E35B1', 0.25 + pulse * 0.2, 'screen');
        // Raven perched on the crown — backlit so the silhouette reads on dark stone
        const tilt = Math.sin(now * 0.0015) * 1.2;
        glow(0, -26, 11, '#5E35B1', 0.22 + pulse * 0.14);
        p(-4, -26, '#000',     8,  6);           // body
        p(-3, -25, '#161622',  6,  4);
        p(-3, -26, '#4A3F6B',  6,  1);           // moonlit back rim
        p(-5, -25, '#000',     3,  3);           // folded wing
        p(-5, -25, '#2E2748',  1,  3);
        p( 3, -28 + tilt, '#000', 4, 4);         // head
        p( 4, -28 + tilt, '#4A3F6B', 2, 1);      // head rim
        p( 4, -27 + tilt, '#161622', 2, 2);
        p( 6, -26 + tilt, '#B39DDB', 2, 1);      // beak
        p( 4, -27 + tilt, `rgba(255,80,80,${0.5 + pulse * 0.5})`, 1, 1); // eye
        p(-7, -23, '#000',     4,  2);           // tail
        p(-7, -23, '#2E2748',  2,  1);
        // Drifting black feathers
        for (let i = 0; i < 2; i++) {
            const t  = ((now * 0.0004) + i * 0.5) % 1;
            const fy = -24 + t * 26;
            const fx = 2 + Math.sin(now * 0.002 + i * 3) * 6;
            ctx.save();
            ctx.globalAlpha = (1 - t) * 0.7;
            p(fx, fy, '#241640', 2, 1);
            ctx.restore();
        }
        return true;
    }

    // -- SHRINE OF TITHE: offering coffer with candle and coin stacks (se_gain) --
    if (type === 'shrine_tithe') {
        // Coffer
        p(-9,  -8, '#000',    18, 14);
        p(-8,  -7, '#3E2723', 16, 12);
        p(-8,  -7, '#5D4037',  7,  5);
        p(-8,  -2, '#2E1A16', 16,  1);   // lid seam
        p(-9, -10, '#000',    18,  3);   // lid
        p(-8,  -9, '#4E342E', 16,  1);
        // Gold banding + slot
        p(-9,  -8, '#B8860B',  1, 14);
        p( 8,  -8, '#B8860B',  1, 14);
        p(-3,  -9, '#1B1B1B',  6,  1);   // coin slot
        p(-1,  -4, '#FFC107',  2,  2);   // lock plate
        // Coin stacks either side
        p(-13, -3, '#000',     5,  9);
        p(-12, -2, '#C0A060',  3,  7);
        p(-12, -2, '#FFF8E1',  3,  1);
        p( 9,  -1, '#000',     5,  7);
        p(10,   0, '#C0A060',  3,  5);
        p(10,   0, '#FFF8E1',  3,  1);
        // Candle on the lid
        p(-2, -18, '#000',     4,  9);
        p(-1, -17, '#FFF8E1',  2,  7);
        p(-1, -22, '#FF8F00',  2,  3);
        p(-1, -23, '#FFC107',  2,  2);
        p( 0, -24, '#FFF8E1',  1,  1);
        glow(0, -22, 6, '#FFC107', 0.28 + pulse * 0.25);
        glow(0, -3, 13, '#FFC107', 0.14 + pulse * 0.10);
        // Coins tumbling into the slot
        for (let i = 0; i < 3; i++) {
            const t  = ((now * 0.0009) + i * 0.33) % 1;
            const dy = -22 + t * 13;
            const dx = Math.sin(now * 0.003 + i * 2) * 5;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = Math.sin(t * Math.PI) * 0.9;
            p(dx, dy, '#FFF8E1', 2, 1);
            ctx.restore();
        }
        return true;
    }

    // -- SHRINE OF SOLACE: resting stone under a willow lantern (pe_recovery) --
    if (type === 'shrine_solace') {
        // Rounded grave-like resting stone
        p(-7,  -8, '#000',    14, 14);
        p(-6,  -7, '#37474F', 12, 12);
        p(-6,  -7, '#4A6069',  5, 11);
        p(-4, -10, '#000',     8,  3);   // rounded cap
        p(-3,  -9, '#455A64',  6,  1);
        // Engraved sigil
        p(-1,  -5, '#A5D6A7',  2,  5);
        p(-3,  -4, '#A5D6A7',  6,  2);
        // Moss creeping up
        p(-6,  -1, '#2E5D34',  3,  2);
        p( 4,  -2, '#2E5D34',  2,  3);
        // Willow trunk arching over the stone, centred on the plinth
        p(-13, -30, '#000',     4, 24);
        p(-12, -29, '#4E342E',  2, 22);
        p(-12, -30, '#000',    22,  3);   // bough sweeping right
        p(-11, -29, '#5D4037', 20,  1);
        p(  7, -29, '#4E342E',  2,  2);   // bough tip droop
        // Lantern hanging from the bough, over the stone's centre
        p(  0, -28, '#5D4037',  1,  6);   // cord
        p( -3, -22, '#000',     7,  9);   // lantern body
        p( -2, -21, '#1B3A24',  5,  7);
        p( -2, -20, '#81C784',  5,  5);
        p( -1, -19, '#E8F5E9',  3,  3);
        p( -3, -23, '#3E2723',  7,  1);   // lantern cap
        glow(0, -19, 8, '#81C784', 0.3 + pulse * 0.25);
        // Drooping willow fronds along the bough
        for (let i = 0; i < 5; i++) {
            const fx = -11 + i * 4;
            const sway = Math.sin(now * 0.0012 + i) * 1.5;
            p(fx + sway, -27, '#2E5D34', 1, 5 + (i % 2) * 3);
            p(fx + sway, -22 + (i % 2) * 3, '#A5D6A7', 1, 1);
        }
        // Settling motes of rest
        for (let i = 0; i < 3; i++) {
            const t  = ((now * 0.0004) + i * 0.33) % 1;
            const my = -22 + t * 24;
            const mx = Math.sin(now * 0.0018 + i * 2) * 7;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = Math.sin(t * Math.PI) * 0.75;
            p(mx, my, '#E8F5E9', 1, 1);
            ctx.restore();
        }
        return true;
    }

    return false;
}

window.drawShrineExtraTop = drawShrineExtraTop;
