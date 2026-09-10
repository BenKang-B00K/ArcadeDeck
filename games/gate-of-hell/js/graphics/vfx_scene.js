/* vfx_scene.js — Scene VFX: Glitches and Light Pillars via Pixi.Graphics
 * Shrine auras remain on proxy canvas (complex gradients + bezier threads).
 */

const glitches     = [];
const lightPillars = [];

let _glitchGfx = null;
let _pillarGfx = null;

if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        glitches.length = 0;
        lightPillars.length = 0;
        _glitchGfx = null;
        _pillarGfx = null;
    });
}

function _ensureSceneGfx() {
    if (_glitchGfx || !window.vfxLayer) return;
    // Glitch effect moved off overlayLayer → vfxLayer (with other combat VFX).
    // overlayLayer reserved for top-most UI (HP bars, halo).
    _glitchGfx = new PIXI.Graphics();
    vfxLayer.addChild(_glitchGfx);

    // Light pillars on vfxLayer (was holyLayer, now merged) with ADD blend + GlowFilter.
    _pillarGfx = new PIXI.Graphics();
    _pillarGfx.blendMode = 'add';
    const glow = (typeof createGlowFilter === 'function')
        ? createGlowFilter(0xFFFFFF, 3, 0, 20)
        : null;
    if (glow) _pillarGfx.filters = [glow];
    vfxLayer.addChild(_pillarGfx);
}

function spawnGlitchEffect(_duration) {
    // Disabled — glitch flash effect removed per design.
}

function updateStageFlashes() {
    for (let i = glitches.length - 1; i >= 0; i--) {
        glitches[i].life--;
        if (glitches[i].life <= 0) glitches.splice(i, 1);
    }
}
function drawStageFlashes() {
    _ensureSceneGfx();
    if (!_glitchGfx) return;
    _glitchGfx.clear();
    if (glitches.length === 0) return;

    const roadW  = 342;
    const roadL  = (window.LOGICAL_WIDTH - roadW) / 2;
    const slotYS = window.LOGICAL_HEIGHT * 0.50;

    glitches.forEach(function(g) {
        const intensity = Math.sin((g.life / g.maxLife) * Math.PI);
        const strips    = 5;
        for (let i = 0; i < strips; i++) {
            if (Math.random() > 0.4) {
                const h      = Math.random() * 35 + 8;
                const isLeft = Math.random() < 0.5;
                const flankX = isLeft ? 0 : roadL + roadW;
                const flankW = isLeft ? roadL : window.LOGICAL_WIDTH - (roadL + roadW);
                const xOff   = flankX + Math.random() * flankW;
                const y      = slotYS + Math.random() * (window.LOGICAL_HEIGHT - slotYS - h);
                const offset = (Math.random() - 0.5) * 30 * intensity;

                if (Math.random() < 0.3) {
                    _glitchGfx.rect(xOff + offset, y, flankW, h)
                              .fill({ color: 0xFF00FF, alpha: 0.2 * intensity });
                    _glitchGfx.rect(xOff - offset, y, flankW, h)
                              .fill({ color: 0x00FFFF, alpha: 0.2 * intensity });
                } else {
                    _glitchGfx.rect(xOff + offset, y, flankW, h)
                              .fill({ color: 0xFFFFFF, alpha: 0.1 * intensity });
                }

                if (Math.random() < 0.2) {
                    for (let p = 0; p < 12; p++) {
                        const col = Math.random() < 0.5 ? 0xFFFFFF : 0x000000;
                        _glitchGfx.rect(
                            flankX + Math.random() * flankW,
                            y + Math.random() * h, 3, 3)
                            .fill({ color: col, alpha: 1 });
                    }
                }
            }
        }
    });
}

function spawnLightPillar(lx, ly) {
    lightPillars.push({ x: lx, y: ly, life: 1.0, maxLife: 1.0, decay: 0.02 });
}

function updateLightPillars() {
    for (let i = lightPillars.length - 1; i >= 0; i--) {
        lightPillars[i].life -= lightPillars[i].decay;
        if (lightPillars[i].life <= 0) lightPillars.splice(i, 1);
    }
}

function drawLightPillars() {
    _ensureSceneGfx();
    if (!_pillarGfx) return;
    _pillarGfx.clear();
    lightPillars.forEach(function(lp) {
        const alpha = lp.life;
        const width = 40 * alpha;
        // Golden core (Heavenly Radiance theme)
        _pillarGfx.rect(lp.x - width * 0.25, 0, width * 0.5, lp.y)
                  .fill({ color: 0xFFD700, alpha: alpha * 0.55 });
        // White outer halo (two flanking rects, single fill)
        _pillarGfx.rect(lp.x - width * 0.5, 0, width * 0.25, lp.y);
        _pillarGfx.rect(lp.x + width * 0.25, 0, width * 0.25, lp.y);
        _pillarGfx.fill({ color: 0xFFFFFF, alpha: alpha * 0.22 });
    });
}

window.spawnGlitchEffect  = spawnGlitchEffect;
window.updateStageFlashes = updateStageFlashes;
window.drawStageFlashes   = drawStageFlashes;
window.spawnLightPillar   = spawnLightPillar;
window.updateLightPillars = updateLightPillars;
window.drawLightPillars   = drawLightPillars;
