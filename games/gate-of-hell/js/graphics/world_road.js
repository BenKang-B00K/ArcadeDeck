/* world_road.js - Road geometry constants + shared shadow helper.
 * Road/background rendering lives in road_pixi.js / world_pixi.js (Pixi). */

const getRoadWidth = () => 342;
const getRoadX = () => (window.LOGICAL_WIDTH - getRoadWidth()) / 2;

/**
 * Global Shadow drawing function for units and enemies.
 */
function drawShadow(lx, ly, size = 10) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(lx, ly + 25, size, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

window.getRoadWidth = getRoadWidth;
window.getRoadX = getRoadX;
window.drawShadow = drawShadow;
