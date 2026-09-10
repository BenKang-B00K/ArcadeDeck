/* shrine_auras_pixi.js — Pure-Pixi shrine → unit link rendering.
 *
 * One Graphics per shrine, on worldLayer (above the slot frames, below the unit
 * bodies) holding a "conduit": a shallow ground-level arc from the shrine base
 * to each buffed unit's base, drawn as a train of beads flowing shrine → unit.
 *
 * Beads, not a hairline: the board renders at ~0.58 CSS scale, so a 1px world
 * stroke lands on half a screen pixel and shimmers. Round beads stay crisp.
 *
 * Global (tier-2 / rangeType 'all') shrines draw NO conduit — one line per unit
 * from an all-board buff is 28 crossing threads and reads as noise. Their scope
 * is shown per-unit by the shrine sigil in units_pixi.js.
 *
 * Per-unit "affected" marker (the floating sigil) lives in units_pixi.js.
 */

const SHRINE_LINK_COLOR = 0x9FE8FF; // pale holy ice — deliberately lighter than
                                    // the cooldown hex's 0x00E5FF so the two
                                    // indicators never read as the same thing
const SHRINE_LINK_Y     = 40;  // below slot centre: runs along the unit's base
const SHRINE_LINK_SAG   = 8;   // arc droop, keeps parallel links from merging
const SHRINE_LINK_BEADS = 9;

const _shrineActive = new Map(); // shrine → { threads }
const _shrineThreadPool  = [];

if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        _shrineActive.clear();
        _shrineThreadPool.length = 0;
    });
}

function _acquireShrineThreads() { let g=_shrineThreadPool.pop()||new PIXI.Graphics(); g.blendMode='add'; g.visible=true; if(window.worldLayer)window.worldLayer.addChild(g); return g; }

function _releaseShrineRecord(record) {
    if (!record || !record.threads) return;
    record.threads.clear();
    record.threads.visible = false;
    if (record.threads.parent) record.threads.parent.removeChild(record.threads);
    _shrineThreadPool.push(record.threads);
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

    const time = window.globalAnimTimer || 0;

    window.towers.forEach(shrine => {
        if (!shrine.isShrine) return;

        let record = _shrineActive.get(shrine);
        if (!record) {
            record = { threads: _acquireShrineThreads() };
            _shrineActive.set(shrine, record);
        }
        const g = record.threads;
        g.clear(); // clear before the early-outs below, or a shrine that stops
                   // linking (demolished, promoted to global) keeps stale geometry

        if (shrine.data.rangeType === 'all' || !shrine.currentSlot) return;

        const mastery = (typeof getRelicBonus === 'function') ? getRelicBonus('shrine_mastery') : 0;
        const area    = shrine.currentSlot.area;
        const row     = Math.floor(shrine.currentSlot.index / 3);
        const rowSpan = (mastery > 0) ? 1 : 0;
        const sx = shrine.lx, sy = shrine.ly + SHRINE_LINK_Y;

        window.towers.forEach(unit => {
            if (unit.isShrine || unit === shrine || !unit.currentSlot) return;
            if (unit.currentSlot.area !== area) return;
            if (Math.abs(Math.floor(unit.currentSlot.index / 3) - row) > rowSpan) return;

            const ux = unit.lx, uy = unit.ly + SHRINE_LINK_Y;
            const cx = (sx + ux) / 2, cy = (sy + uy) / 2 + SHRINE_LINK_SAG;
            // quadratic bezier sample
            const at = t => { const m = 1 - t; return [m*m*sx + 2*m*t*cx + t*t*ux,
                                                       m*m*sy + 2*m*t*cy + t*t*uy]; };

            // faint continuous path so the route still reads between beads
            g.moveTo(sx, sy).quadraticCurveTo(cx, cy, ux, uy)
             .stroke({ color: SHRINE_LINK_COLOR, alpha: 0.12, width: 3 });

            // beads flow shrine → unit; per-unit phase so parallel links desync
            const phase = unit.lx * 0.013 + unit.ly * 0.007;
            for (let i = 0; i < SHRINE_LINK_BEADS; i++) {
                const u = ((i / SHRINE_LINK_BEADS) + time * 0.12 + phase) % 1;
                const [px, py] = at(u);
                const env = Math.sin(Math.PI * u); // fat mid-span, tapers into both ends
                g.circle(px, py, 1.5 + 1.7 * env).fill({ color: SHRINE_LINK_COLOR, alpha: 0.75 * env });
                if (i % 3 === 0) g.circle(px, py, 0.9 + 0.7 * env).fill({ color: 0xFFFFFF, alpha: 0.6 * env });
            }
        });
    });
}

window.renderPixiShrineAuras = renderPixiShrineAuras;
window.gcPixiShrineAuras     = gcPixiShrineAuras;
