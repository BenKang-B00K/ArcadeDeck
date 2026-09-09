/* shrine_auras_pixi.js — Pure-Pixi shrine aura rendering.
 *
 * Per shrine:
 *   - thread Graphics (bezier curves to affected units, additive blend)
 *   - unit-ground-glow Graphics (faint ellipse under affected units)
 *
 * Sparkle particles dropped (cosmetic). Color: gold (T2) or cyan (T1).
 * Range circle removed — buff scope is row+side, not radial.
 */

const _shrineActive = new Map(); // shrine → { threads, unitGlows }
const _shrineThreadPool  = [];
const _shrineUnitGlowPool= [];

if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        _shrineActive.clear();
        _shrineThreadPool.length = 0;
        _shrineUnitGlowPool.length = 0;
    });
}

function _acquireShrineThreads()  { let g=_shrineThreadPool.pop()||new PIXI.Graphics(); g.blendMode='add'; g.visible=true; if(window.worldLayer)window.worldLayer.addChild(g); return g; }
function _acquireShrineUnitGlow() { let g=_shrineUnitGlowPool.pop()||new PIXI.Graphics(); g.visible=true; if(window.worldLayer)window.worldLayer.addChild(g); return g; }

function _releaseShrineRecord(record) {
    if (!record) return;
    if (record.threads)  { record.threads.clear();  record.threads.visible=false;  if(record.threads.parent)record.threads.parent.removeChild(record.threads); _shrineThreadPool.push(record.threads); }
    if (record.unitGlows){ record.unitGlows.clear();record.unitGlows.visible=false;if(record.unitGlows.parent)record.unitGlows.parent.removeChild(record.unitGlows); _shrineUnitGlowPool.push(record.unitGlows); }
}

function gcPixiShrineAuras() {
    if (typeof window.towers === 'undefined') return;
    const live = new Set(window.towers.filter(t => t.isShrine));
    for (const [shrine, record] of _shrineActive) {
        if (!live.has(shrine)) {
            _releaseShrineRecord(record);
            _shrineActive.delete(shrine);
        }
    }
}

function renderPixiShrineAuras() {
    if (typeof window.towers === 'undefined') return;
    gcPixiShrineAuras();

    const time  = window.globalAnimTimer || 0;
    const pulse = (Math.sin(time * 0.5) + 1) / 2;

    window.towers.forEach(shrine => {
        if (!shrine.isShrine) return;
        const isSuperior = shrine.data.tier === 2;
        const color = isSuperior ? 0xFFD700 : 0x00E5FF;
        const mastery = (typeof getRelicBonus === 'function') ? getRelicBonus('shrine_mastery') : 0;
        const isGlobal = shrine.data.rangeType === 'all';
        const shrineArea = shrine.currentSlot ? shrine.currentSlot.area : null;
        const shrineRow  = shrine.currentSlot ? Math.floor(shrine.currentSlot.index / 3) : -1;
        const rowSpan    = (mastery > 0) ? 1 : 0;

        let record = _shrineActive.get(shrine);
        if (!record) {
            record = { threads: _acquireShrineThreads(), unitGlows: _acquireShrineUnitGlow() };
            _shrineActive.set(shrine, record);
        }

        // Threads + per-unit ground glow
        record.threads.clear();
        record.unitGlows.clear();
        window.towers.forEach(unit => {
            if (unit.isShrine || unit === shrine) return;
            let affected = false;
            if (isGlobal) affected = true;
            else if (unit.currentSlot && shrineArea) {
                if (unit.currentSlot.area === shrineArea) {
                    const unitRow = Math.floor(unit.currentSlot.index / 3);
                    affected = Math.abs(unitRow - shrineRow) <= rowSpan;
                }
            }
            if (!affected) return;

            // Bezier thread (additive). Use solid color stroke — approximates the original 0.6-alpha-fading gradient.
            record.threads.moveTo(shrine.lx, shrine.ly)
                .quadraticCurveTo(
                    (shrine.lx + unit.lx) / 2,
                    (shrine.ly + unit.ly) / 2 - 40,
                    unit.lx, unit.ly
                );
            record.threads.stroke({ color, alpha: 0.5, width: 1 + pulse });

            // Halo ring above head (was: ground glow below feet)
            record.unitGlows.ellipse(unit.lx, unit.ly - 22, 25, 10)
                .fill({ color, alpha: 0.05 + 0.1 * pulse });
        });
    });
}

window.renderPixiShrineAuras = renderPixiShrineAuras;
window.gcPixiShrineAuras     = gcPixiShrineAuras;
