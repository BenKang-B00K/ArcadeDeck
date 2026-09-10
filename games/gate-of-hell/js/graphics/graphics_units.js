/* graphics_units.js - Core Management for Unit and Summon Rendering */

/**
 * Renders status auras based on unit tier.
 */
function drawUnitAuras(cx, cy, tower) {
    const tier = tower.data.tier;
    const time = globalAnimTimer;
    const pulse = (Math.sin(time * 2) + 1) / 2;
    ctx.save();

    // "Shrine affected" sigil — ctx2d mirror of units_pixi.js. Diamond, not a
    // ring: straight edges survive the board's downscale where an ellipse mushes.
    if (!tower.isShrine && (tower.shrineHaloTier1 || tower.shrineHaloTier2)) {
        // T2 (global/sacred) = pale gold; T1 = pale ice. Matches units_pixi.js.
        const [r, g, b] = tower.shrineHaloTier2 ? [255, 217, 138] : [159, 232, 255];
        const floatY = cy - 80 + Math.sin(time * 1.5 + cx * 0.03) * 2.0;
        const shimmer = 0.78 + Math.sin(time * 1.1 + cx * 0.02) * 0.18;
        const w = 8, h = 11;
        const diamond = (rw, rh) => {
            ctx.beginPath();
            ctx.moveTo(cx, floatY - rh); ctx.lineTo(cx + rw, floatY);
            ctx.lineTo(cx, floatY + rh); ctx.lineTo(cx - rw, floatY);
            ctx.closePath();
        };

        ctx.save();
        // soft bloom behind the mark
        ctx.fillStyle = `rgba(${r},${g},${b},${0.10 + 0.05 * shimmer})`;
        ctx.beginPath(); ctx.arc(cx, floatY, h * 1.05, 0, Math.PI * 2); ctx.fill();
        // diamond outline
        ctx.strokeStyle = `rgba(${r},${g},${b},${shimmer})`;
        ctx.lineWidth = 2.2;
        diamond(w, h); ctx.stroke();
        // white-hot core
        ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.3 * shimmer})`;
        diamond(w * 0.42, h * 0.42); ctx.fill();
        ctx.restore();
    }

    if (tier < 2) { ctx.restore(); return; }
    
    if (tier === 2) {
        ctx.globalAlpha = 0.2 + pulse * 0.1; ctx.fillStyle = '#fff';
        for(let i=0; i<3; i++) {
            const ang = time + (i * Math.PI * 0.6);
            const ox = Math.cos(ang) * 15; const oy = Math.sin(ang * 0.5) * 5;
            ctx.beginPath(); ctx.arc(cx + ox, cy + 5 + oy, 8, 0, Math.PI * 2); ctx.fill();
        }
    } else if (tier === 3) {
        ctx.strokeStyle = `rgba(255, 215, 0, ${0.4 + pulse * 0.3})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx, cy + 8, 25 + pulse * 5, 8 + pulse * 2, 0, 0, Math.PI * 2); ctx.stroke();
    } else if (tier === 4) {
        const glowGrad = ctx.createRadialGradient(cx, cy + 5, 0, cx, cy + 5, 40);
        glowGrad.addColorStop(0, `rgba(74, 20, 140, ${0.3 + pulse * 0.2})`); glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad; ctx.beginPath(); ctx.arc(cx, cy + 5, 40, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}

/**
 * Draws the selection ritual circle and range indicators.
 */
function drawUnitSelection(lx, ly, tower) {
    const isSelected = (typeof getSelectedTower === 'function') && getSelectedTower() === tower;
    const isHovered  = !isSelected && (typeof getHoveredTower === 'function') && getHoveredTower() === tower;
    if (!isSelected && !isHovered) return;

    ctx.save();
    const pulse = (Math.sin(globalAnimTimer * 2) + 1) / 2;
    const aMul = isSelected ? 1 : 0.55;

    // Range/Buff Indicator
    if (!tower.isShrine) {
        const range = tower.range + (tower.rangeBonus || 0);
        ctx.beginPath();
        ctx.arc(lx, ly, range, 0, Math.PI * 2);

        const grad = ctx.createRadialGradient(lx, ly, range * 0.7, lx, ly, range);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.5, `rgba(0, 229, 255, ${(0.05 + pulse * 0.05) * aMul})`);
        grad.addColorStop(1, `rgba(0, 229, 255, ${(0.2 + pulse * 0.1) * aMul})`);

        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = `rgba(0, 229, 255, ${(0.3 + pulse * 0.2) * aMul})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 15]);
        ctx.stroke();
    } else {
        const mastery = (typeof getRelicBonus === 'function') ? getRelicBonus('shrine_mastery') : 0;
        const rangeThreshold = (mastery > 0) ? 120 : 80;

        ctx.beginPath();
        ctx.arc(lx, ly, rangeThreshold, 0, Math.PI * 2);

        const grad = ctx.createRadialGradient(lx, ly, rangeThreshold * 0.5, lx, ly, rangeThreshold);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, `rgba(255, 215, 0, ${(0.1 + pulse * 0.1) * aMul})`);

        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = `rgba(255, 215, 0, ${(0.3 + pulse * 0.2) * aMul})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 10]);
        ctx.stroke();
    }

    // Inner Ritual Rings — selected only (hover preview is range-only)
    if (isSelected) {
        ctx.translate(lx, ly);
        ctx.rotate(globalAnimTimer * 0.5);
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
        ctx.setLineDash([15, 5]);
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI * 2); ctx.stroke();

        ctx.rotate(-globalAnimTimer * 1.2);
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.setLineDash([5, 10]);
        ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
}

/**
 * Renders the main body of the unit (Pixel Art or Fallback).
 */
function drawUnitBody(cx, cy, tower) {
    let finalFnName = (typeof getUnitDrawFunction === 'function') ? getUnitDrawFunction(tower.data.type) : null;
    
    // Handle Shrine Pixel Art routing
    if (tower.isShrine) {
        if (tower.data.tier === 2) {
            finalFnName = 'drawShrinePower'; // Uses the AAA sacred shrine design
        } else {
            finalFnName = 'drawShrineNormal'; // Uses the generic stone altar design
        }
    }

    if (finalFnName && typeof window[finalFnName] === 'function') {
        const fn = window[finalFnName];
        // Determine left/right orientation from slot area if available
        const isLeft = !!(tower.currentSlot && typeof tower.currentSlot.area === 'string' && tower.currentSlot.area.indexOf('left') !== -1);
        try {
            if (fn.length >= 4) {
                // Old-style signature: fn(ctx, tower, cx, cy, isLeft)
                fn(window.ctx || ctx, tower, cx, cy, isLeft);
            } else {
                // New-style signature: fn(cx, cy, tower)
                fn(cx, cy, tower);
            }
        } catch (e) {
            // Fallback to stylized name when pixel drawing fails
            console.warn(`Pixel draw failed for ${finalFnName}:`, e);
            _drawStylizedName(ctx, tower.data.name || '?', cx, cy, tower.data.tier);
        }
    } else {
        _drawStylizedName(ctx, tower.data.name || '?', cx, cy, tower.data.tier);
    }
}

/**
 * Helper to draw a unit's name with a mystical, high-quality aesthetic.
 */
function _drawStylizedName(ctx, name, cx, cy, tier = 1) {
    ctx.save();
    const tierColors = { 1: "#ffffff", 2: "#00e5ff", 3: "#bf5af2", 4: "#ff9f0a" };
    const color = tierColors[tier] || "#fff";
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw Name
    ctx.font = 'bold 12px "Cinzel", serif';
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(name, cx, cy);
    ctx.fillStyle = color;
    ctx.fillText(name, cx, cy);
    
    ctx.restore();
}

/**
 * Draws the attack cooldown indicator as a vivid hex outline.
 * Outline intensity tracks remaining cooldown — bright while charging, gone when ready.
 */
function drawUnitCooldown(cx, cy, tower) {
    const sm = 1.0 + (tower.speedBonus || 0);
    const cd = tower.cooldown / sm;
    const elapsed = Date.now() - (tower.lastShot || 0);

    if (elapsed >= cd) return;

    const remaining = 1 - Math.min(1, elapsed / cd);
    const hw = 51, hh = 69;
    const oy = cy - 14; // lift outline above slot center

    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const ang = (i * 60) * Math.PI / 180;
        const px = cx + hw * Math.cos(ang);
        const py = oy + hh * Math.sin(ang);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();

    ctx.shadowColor = 'rgba(0, 229, 255, 0.9)';
    ctx.shadowBlur = 8 * remaining;
    ctx.strokeStyle = `rgba(0, 229, 255, ${0.95 * remaining})`;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 * remaining})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
}

/**
 * Main entry point for drawing all active towers/units.
 */
function drawUnits() {
    if (typeof towers === 'undefined') return;
    if (typeof gcPixiUnitSprites === 'function') gcPixiUnitSprites();

    towers.forEach(tower => {
        const lx = tower.lx;
        const ly = tower.ly;

        const pixiHandled = (typeof isPixiUnitType === 'function')
            && isPixiUnitType(tower)
            && (typeof renderPixiUnit === 'function')
            && renderPixiUnit(tower);

        if (!pixiHandled) {
            // ctx2d fallback path — full pipeline
            drawUnitSelection(lx, ly, tower);
            if (typeof drawShadow === 'function') drawShadow(lx, ly, 24);
            drawUnitBody(lx, ly, tower);
            drawUnitAuras(lx, ly, tower);
            drawUnitCooldown(lx, ly, tower);
        }
    });
}

/**
 * Renders temporary summons (skeletons, ghosts).
 */
function drawSummons() {
    if (typeof renderPixiSummons === 'function') renderPixiSummons();
}

// Window Exports
window.drawUnits = drawUnits;
window.drawSummons = drawSummons;
window.drawUnitAuras = drawUnitAuras;
