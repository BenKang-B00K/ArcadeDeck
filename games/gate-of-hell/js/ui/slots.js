/* slots.js - Logical slot init, canvas rendering, and slot-to-slot moves */

window.logicalSlots = [];

// Slot Dimension Constants
const SLOT_WIDTH = 114;
const SLOT_HEIGHT = 150;
const START_Y = 300;     // shifted down towards the portal
const SPACING_Y = 165;

// ─ Slot tile images (lazy-loaded; procedural fallback until ready) ─
const _slotImgs = { unit: new Image(), shrine: new Image() };
_slotImgs.unit.src   = 'images/world/tower_slot.webp';
_slotImgs.shrine.src = 'images/world/shrine_slot.webp';
const _slotReady = { unit: false, shrine: false };
_slotImgs.unit.onload   = () => { _slotReady.unit = true; };
_slotImgs.shrine.onload = () => { _slotReady.shrine = true; };

/**
 * Initializes the grid of logical slots.
 * 7×3 grid per side (left & right), minus 1 reserved slot per side for HUD widgets:
 * left c=0 row=6 (gargoyle), right c=2 row=6 (cursed-status). Total 40 slots.
 * Unit placement is separately capped at window.maxTowers (28).
 */
function initLogicalSlots() {
    window.logicalSlots = [];

    const roadW = 342;
    const roadL = (window.LOGICAL_WIDTH - roadW) / 2;

    // Left side col0=Shrine, col1-2=Unit
    for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 3; c++) {
            const isBottomRow = (r === 6);
            if (isBottomRow && c === 0) continue; // gargoyle widget reserve
            const isLeftShrineCol = (c === 0);
            const slotType = isBottomRow ? 'shrine' : (isLeftShrineCol ? 'shrine' : 'unit');
            const slotTier = isBottomRow ? 2 : 1;
            window.logicalSlots.push({
                area: 'left-slots',
                index: r * 3 + c,
                lx: (roadL - (3 * SLOT_WIDTH)) / 2 + c * SLOT_WIDTH + (SLOT_WIDTH / 2),
                ly: START_Y + r * SPACING_Y + (SLOT_HEIGHT / 2),
                type: slotType,
                tier: slotTier,
                isOccupied: false
            });
        }
    }
    // Right side col0-1=Unit, col2=Shrine
    for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 3; c++) {
            const isBottomRow = (r === 6);
            if (isBottomRow && c === 2) continue; // cursed-status widget reserve
            const isRightShrineCol = (c === 2);
            const slotType = isBottomRow ? 'shrine' : (isRightShrineCol ? 'shrine' : 'unit');
            const slotTier = isBottomRow ? 2 : 1;
            window.logicalSlots.push({
                area: 'right-slots',
                index: r * 3 + c,
                lx: (roadL + roadW) + (roadL - (3 * SLOT_WIDTH)) / 2 + c * SLOT_WIDTH + (SLOT_WIDTH / 2),
                ly: START_Y + r * SPACING_Y + (SLOT_HEIGHT / 2),
                type: slotType,
                tier: slotTier,
                isOccupied: false
            });
        }
    }
}

/**
 * Executes a unit move or swap between two logical slots.
 * Sibling of input_handler.executeCanvasMove — keep these two paths in sync.
 */
function executeMove(tower, targetSlot) {
    const oldSlot = tower.currentSlot;
    if (oldSlot === targetSlot) return;

    if (tower.isShrine && targetSlot.type !== 'shrine') return;
    if (!tower.isShrine && targetSlot.type === 'shrine') return;

    const occupant = window.towers.find(t => t.currentSlot === targetSlot);
    if (occupant) {
        occupant.currentSlot = oldSlot;
        occupant.lx = oldSlot.lx;
        occupant.ly = oldSlot.ly;
    } else {
        if (oldSlot) oldSlot.isOccupied = false;
    }

    tower.currentSlot = targetSlot;
    tower.lx = targetSlot.lx;
    tower.ly = targetSlot.ly;
    targetSlot.isOccupied = true;

    if (typeof GameLogger !== 'undefined') GameLogger.info(`Relocated: ${tower.data.name}`);

    if (typeof getSelectedTower === 'function' && getSelectedTower() === tower) {
        if (typeof showRangeIndicator === 'function') showRangeIndicator(tower);
    }
}

/**
 * Draws high-quality pixel-art styled slots onto the Canvas.
 * Units: Sacred altar with golden pixel border, holy seal, animated scan.
 * Shrines: Sanctuary frame with color-coded pixel border and rotating rune dots.
 */
function drawSlots() {
    if (!window.logicalSlots || window.logicalSlots.length === 0) return;

    const time = window.lavaPhase * 1.2;
    const pulse = (Math.sin(time) + 1) / 2;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    window.logicalSlots.forEach(slot => {
        const isSuperior = slot.tier === 2;
        const isOcc      = slot.isOccupied;
        // Image render overshoots grid stride to compensate for transparent padding inside the asset
        const TILE_OVERSCAN = 1.4;
        const sw = SLOT_WIDTH * TILE_OVERSCAN;
        const sh = SPACING_Y  * TILE_OVERSCAN;
        const lx = slot.lx;
        const ly = slot.ly;
        const P  = 2;  // 2px per art pixel for crisp pixel-art look
        const HW = sw / 2;
        const HH = sh / 2;

        ctx.save();
        ctx.translate(Math.round(lx), Math.round(ly));

        if (slot.type === 'unit') {
            if (_slotReady.unit) {
                // Image-based slot art + runtime pulse overlay
                const baseAlpha = isOcc ? 1.0 : 0.78;
                ctx.globalAlpha = baseAlpha;
                ctx.drawImage(_slotImgs.unit, -HW, -HH, sw, sh);
                ctx.globalAlpha = 1;
                if (isOcc) {
                    const pa = 0.10 + pulse * 0.12;
                    ctx.fillStyle = `rgba(255,215,0,${pa})`;
                    ctx.globalCompositeOperation = 'lighter';
                    ctx.fillRect(-HW, -HH, sw, sh);
                    ctx.globalCompositeOperation = 'source-over';
                }
            } else {
            // Color theme: gold/ivory sacred altar
            const brightA = isOcc ? (0.55 + pulse * 0.3) : (0.25 + pulse * 0.15);
            const dimA    = isOcc ? (0.06 + pulse * 0.04) : (0.025 + pulse * 0.015);
            const bCol = `rgba(255,215,0,${brightA})`;

            // 1. Dark stone inner fill
            ctx.fillStyle = `rgba(10,8,5,${0.7 + dimA})`;
            ctx.fillRect(-HW + P*3, -HH + P*3, sw - P*6, sh - P*6);

            // 2. Stone texture: subtle horizontal ruled lines (pixel grid)
            ctx.fillStyle = `rgba(255,210,80,0.028)`;
            for (let gy = -HH + P*4; gy < HH - P*4; gy += 8) {
                ctx.fillRect(-HW + P*4, Math.round(gy), sw - P*8, 1);
            }
            for (let gx = -HW + P*4; gx < HW - P*4; gx += 8) {
                ctx.fillRect(Math.round(gx), -HH + P*4, 1, sh - P*8);
            }

            // 3. Outer pixel border (solid 2px frame)
            ctx.fillStyle = bCol;
            ctx.fillRect(-HW, -HH, sw, P);
            ctx.fillRect(-HW, HH - P, sw, P);
            ctx.fillRect(-HW, -HH, P, sh);
            ctx.fillRect(HW - P, -HH, P, sh);

            // 4. Inner secondary border (inset by P*3)
            ctx.fillStyle = `rgba(255,215,0,${brightA * 0.35})`;
            ctx.fillRect(-HW + P*3, -HH + P*3, sw - P*6, P);
            ctx.fillRect(-HW + P*3, HH - P*4,  sw - P*6, P);
            ctx.fillRect(-HW + P*3, -HH + P*3, P, sh - P*6);
            ctx.fillRect(HW - P*4,  -HH + P*3, P, sh - P*6);

            // 5. Corner ornaments — pixel L-shapes with jewels
            const cs = P * 5;
            const drawCornerPx = (cx, cy, dx, dy) => {
                ctx.fillStyle = bCol;
                ctx.fillRect(cx, cy, Math.round(dx * cs), P);
                ctx.fillRect(cx, cy, P, Math.round(dy * cs));
                ctx.fillStyle = `rgba(255,255,220,${0.7 + pulse * 0.3})`;
                ctx.fillRect(cx, cy, P * 2, P * 2);
            };
            drawCornerPx(-HW,      -HH,       1,  1);
            drawCornerPx( HW - P,  -HH,      -1,  1);
            drawCornerPx(-HW,       HH - P,   1, -1);
            drawCornerPx( HW - P,   HH - P,  -1, -1);

            // 6. Mid-edge accent dots (pixel art decoration)
            ctx.fillStyle = `rgba(255,215,0,${brightA * 0.6})`;
            ctx.fillRect(-1, -HH,      P * 2, P * 2);
            ctx.fillRect(-1,  HH - P,  P * 2, P * 2);
            ctx.fillRect(-HW, -1,      P * 2, P * 2);
            ctx.fillRect( HW - P, -1, P * 2, P * 2);

            // 7. Central holy seal — pixel art cross + ring
            const sR = sw * 0.11;
            const sealA = 0.18 + pulse * 0.18;
            ctx.fillStyle = `rgba(255,240,160,${sealA})`;
            ctx.fillRect(-P, Math.round(-sR * 1.8), P * 2, Math.round(sR * 3.6));
            ctx.fillRect(Math.round(-sR * 1.8), -P, Math.round(sR * 3.6), P * 2);
            for (let i = 0; i < 8; i++) {
                const ang = i * Math.PI / 4 + time * 0.05;
                const px = Math.round(Math.cos(ang) * sR);
                const py = Math.round(Math.sin(ang) * sR);
                ctx.fillRect(px - 1, py - 1, P, P);
            }
            ctx.fillStyle = `rgba(255,255,200,${0.4 + pulse * 0.4})`;
            ctx.fillRect(-P, -P, P * 2, P * 2);

            // 8. Animated pixel scan line
            const scanY = Math.round(((time * 0.28) % 1.0) * sh - HH);
            ctx.fillStyle = `rgba(255,215,0,${0.07 + pulse * 0.05})`;
            ctx.fillRect(-HW + P*3, scanY, sw - P*6, P);
            ctx.fillStyle = `rgba(255,215,0,${0.025 + pulse * 0.02})`;
            ctx.fillRect(-HW + P*3, scanY + P, sw - P*6, P * 2);
            }

        } else {
            if (_slotReady.shrine) {
                const baseAlpha = isOcc ? 1.0 : 0.78;
                ctx.globalAlpha = baseAlpha;
                ctx.drawImage(_slotImgs.shrine, -HW, -HH, sw, sh);
                ctx.globalAlpha = 1;
                if (isOcc) {
                    const [pr, pg, pb] = isSuperior ? [255, 215, 0] : [0, 229, 255];
                    const pa = 0.10 + pulse * 0.12;
                    ctx.fillStyle = `rgba(${pr},${pg},${pb},${pa})`;
                    ctx.globalCompositeOperation = 'lighter';
                    ctx.fillRect(-HW, -HH, sw, sh);
                    ctx.globalCompositeOperation = 'source-over';
                }
            } else {
            // Shrine slot — color-coded pixel art sanctuary
            const [r, g, b] = isSuperior ? [255, 215, 0] : [0, 229, 255];
            const brightA = isOcc ? (0.5 + pulse * 0.3) : (0.28 + pulse * 0.18);

            // 1. Inner fill
            ctx.fillStyle = `rgba(${r},${g},${b},${0.04 + pulse * 0.025})`;
            ctx.fillRect(-HW + P*2, -HH + P*2, sw - P*4, sh - P*4);

            // 2. Outer pixel border
            ctx.fillStyle = `rgba(${r},${g},${b},${brightA})`;
            ctx.fillRect(-HW, -HH, sw, P);
            ctx.fillRect(-HW, HH - P, sw, P);
            ctx.fillRect(-HW, -HH, P, sh);
            ctx.fillRect(HW - P, -HH, P, sh);

            // 3. Corner jewels (2×2 pixel)
            ctx.fillStyle = `rgba(${r},${g},${b},${0.85 + pulse * 0.15})`;
            [[-HW, -HH], [HW - P*2, -HH], [-HW, HH - P*2], [HW - P*2, HH - P*2]].forEach(([cx, cy]) => {
                ctx.fillRect(cx, cy, P * 2, P * 2);
            });

            // 4. Rotating outer rune dots
            const outerR = Math.min(HW, HH) * 0.5;
            const sides  = isSuperior ? 4 : 3;
            ctx.fillStyle = `rgba(${r},${g},${b},${0.35 + pulse * 0.25})`;
            for (let i = 0; i < sides; i++) {
                const ang = i * (Math.PI * 2 / sides) + time * (isSuperior ? 0.4 : 0.25);
                ctx.fillRect(Math.round(Math.cos(ang) * outerR) - P, Math.round(Math.sin(ang) * outerR) - P, P * 2, P * 2);
            }

            // 5. Counter-rotating inner dot ring
            const innerR = Math.min(HW, HH) * 0.28;
            ctx.fillStyle = `rgba(${r},${g},${b},${0.22 + pulse * 0.15})`;
            for (let i = 0; i < sides * 2; i++) {
                const ang = i * (Math.PI / sides) - time * 0.2;
                ctx.fillRect(Math.round(Math.cos(ang) * innerR) - 1, Math.round(Math.sin(ang) * innerR) - 1, 2, 2);
            }

            // 6. Center pixel motif
            ctx.fillStyle = `rgba(${r},${g},${b},${0.28 + pulse * 0.22})`;
            if (isSuperior) {
                ctx.fillRect(0, -P*3, P, P);
                ctx.fillRect(-P, -P*2, P*3, P);
                ctx.fillRect(-P*2, -P, P*5, P);
                ctx.fillRect(-P*3, 0, P*7, P);
                ctx.fillRect(-P*2, P, P*5, P);
                ctx.fillRect(-P, P*2, P*3, P);
                ctx.fillRect(0, P*3, P, P);
            } else {
                ctx.fillRect(-P*2, P*2, P*5, P);
                ctx.fillRect(-P, 0, P*3, P);
                ctx.fillRect(0, -P*2, P, P);
            }
            }
        }

        // Drag overlay: highlight valid/invalid drop targets
        if (window.isMovingUnit && window.draggedUnit) {
            try {
                const dragged = window.draggedUnit;
                let canPlace = false;
                if (dragged && dragged.isShrine) {
                    const shrineTier = (dragged.data && dragged.data.tier) ? dragged.data.tier : (dragged.tier || 1);
                    if (slot.type === 'shrine') {
                        canPlace = (slot.tier === 2) ? (shrineTier === 2) : true;
                    } else {
                        canPlace = false;
                    }
                } else {
                    canPlace = (slot.type === 'unit');
                }

                if (canPlace) {
                    ctx.save();
                    ctx.globalCompositeOperation = 'lighter';
                    const glowAlpha = Math.max(0.25, 0.55 + pulse * 0.25);
                    ctx.strokeStyle = `rgba(255,255,255,${glowAlpha})`;
                    ctx.lineWidth = Math.max(2, P * 2);
                    const o = Math.max(2, P * 2);
                    ctx.strokeRect(Math.round(-HW - o), Math.round(-HH - o), Math.round(sw + o * 2), Math.round(sh + o * 2));
                    ctx.fillStyle = `rgba(255,255,255,${0.85 + pulse * 0.15})`;
                    const sp = P * 2;
                    ctx.fillRect(Math.round(-HW - o - sp), Math.round(-HH - o - sp), sp, sp);
                    ctx.fillRect(Math.round(HW + o), Math.round(-HH - o - sp), sp, sp);
                    ctx.fillRect(Math.round(-HW - o - sp), Math.round(HH + o), sp, sp);
                    ctx.fillRect(Math.round(HW + o), Math.round(HH + o), sp, sp);
                    ctx.restore();
                } else {
                    ctx.save();
                    ctx.strokeStyle = `rgba(255,23,68,${0.9 - pulse * 0.25})`;
                    ctx.lineWidth = Math.max(2, P * 2);
                    ctx.strokeRect(Math.round(-HW), Math.round(-HH), Math.round(sw), Math.round(sh));
                    ctx.restore();
                }
            } catch (e) {
                // fail silently
            }
        }

        ctx.restore();
    });
    ctx.restore();
}

// Window Exports
window.initLogicalSlots = initLogicalSlots;
window.executeMove      = executeMove;
window.drawSlots        = drawSlots;
