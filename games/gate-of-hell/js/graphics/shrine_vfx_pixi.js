/* shrine_vfx_pixi.js — Live (non-baked) Pixi VFX for shrines.
 *
 * Two layers of work each frame:
 *   1. Sprite-level GlowFilter — attached once per shrine; tinted by type/tier.
 *   2. Signature emitters in vfxLayer — type-specific effects:
 *        might      → rising embers + shockwave rings
 *        speed      → orbiting wind streaks
 *        range      → scrying beam + sweeping scanline
 *        wisdom     → floating glyph dust
 *        greed      → coin sparkle burst
 *        purity     → rising holy bubbles
 *        fervor     → fire embers + heat ring
 *        shadow     → smoke wisps
 *        harvest    → gold dust drift
 *        endurance  → teal pulse wave
 *        divine     → radiant god rays + halo
 *        eternity   → time-warp ripple rings
 *        miracle    → prismatic rainbow shards
 *
 * Pools all Graphics. GCs against window.towers each frame.
 */

const _shrineVfxRecords = new Map(); // shrine → { gfx, filterApplied, particles[] }
const _shrineVfxGfxPool = [];

const SHRINE_VFX_COLORS = {
    shrine_might:     { glow: 0xFF2020, p1: 0xFF4400, p2: 0xFFAA00 },
    shrine_speed:     { glow: 0xCFD8DC, p1: 0xECEFF1, p2: 0xFFFFFF },
    shrine_range:     { glow: 0x00E5FF, p1: 0x00E5FF, p2: 0xE0F7FA },
    shrine_wisdom:    { glow: 0xFFF9C4, p1: 0xFFF59D, p2: 0xFFD54F },
    shrine_greed:     { glow: 0xFFD700, p1: 0xFFD700, p2: 0xFFF176 },
    shrine_purity:    { glow: 0xFFFFFF, p1: 0xE0F7FA, p2: 0x00E5FF },
    shrine_fervor:    { glow: 0xFF4400, p1: 0xFF6600, p2: 0xFFD700 },
    shrine_shadow:    { glow: 0x8888FF, p1: 0x4040AA, p2: 0xAAAAFF },
    shrine_harvest:   { glow: 0xFFD700, p1: 0xDAA520, p2: 0xFFEE44 },
    shrine_endurance: { glow: 0x00BFA5, p1: 0x4DB6AC, p2: 0x80CBC4 },
    shrine_valor:     { glow: 0xC62828, p1: 0xE53935, p2: 0xFFCDD2 },
    shrine_tempest:   { glow: 0x4DD0E1, p1: 0x00ACC1, p2: 0xB2EBF2 },
    shrine_horizon:   { glow: 0xFFB74D, p1: 0xFF9800, p2: 0xFFE0B2 },
    shrine_fortune:   { glow: 0x66BB6A, p1: 0x2E7D32, p2: 0xFFF176 },
    shrine_ruin:      { glow: 0xB71C1C, p1: 0xE64A19, p2: 0xFF8A65 },
    shrine_omen:      { glow: 0x5E35B1, p1: 0x311B92, p2: 0xB39DDB },
    shrine_tithe:     { glow: 0xFFC107, p1: 0xC0A060, p2: 0xFFF8E1 },
    shrine_solace:    { glow: 0x81C784, p1: 0xA5D6A7, p2: 0xE8F5E9 },
    shrine_divine:    { glow: 0xFFD700, p1: 0xFFF9C4, p2: 0xFFFFFF },
    shrine_eternity:  { glow: 0x7B1FA2, p1: 0x4A148C, p2: 0x00B8D4 },
    shrine_miracle:   { glow: 0xFFFFFF, p1: 0xFF1744, p2: 0xD500F9 },
};

const SHRINE_DEFAULT_COLOR = { glow: 0xFFD700, p1: 0xFFD700, p2: 0xFFFFFF };

/* New T1 shrines reuse an existing emitter shape, tinted by their own palette. */
const SHRINE_VFX_ALIAS = {
    shrine_valor:   'shrine_might',
    shrine_tempest: 'shrine_speed',
    shrine_horizon: 'shrine_range',
    shrine_fortune: 'shrine_greed',
    shrine_ruin:    'shrine_fervor',
    shrine_omen:    'shrine_shadow',
    shrine_tithe:   'shrine_harvest',
    shrine_solace:  'shrine_purity',
};

if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        _shrineVfxRecords.clear();
        _shrineVfxGfxPool.length = 0;
    });
}

function _acquireVfxGfx() {
    let g = _shrineVfxGfxPool.pop() || new PIXI.Graphics();
    g.visible = true;
    g.alpha = 1;
    g.blendMode = 'add';
    if (window.vfxLayer) window.vfxLayer.addChild(g);
    return g;
}

function _releaseVfxGfx(g) {
    if (!g) return;
    g.clear();
    g.visible = false;
    if (g.parent) g.parent.removeChild(g);
    _shrineVfxGfxPool.push(g);
}

function _colorFor(shrine) {
    return SHRINE_VFX_COLORS[shrine.data.type] || SHRINE_DEFAULT_COLOR;
}

function _ensureShrineGlow(shrine) {
    if (typeof createGlowFilter !== 'function') return;
    if (typeof window.getPixiUnitSprite !== 'function') return;
    // Sprite is keyed by actual shrine subtype now (each subtype bakes own art).
    const sprite  = window.getPixiUnitSprite(shrine, shrine.data.type);
    if (!sprite) return;

    const wantType = shrine.data.type;
    if (sprite.__shrineGlowType !== wantType) {
        // Remove stale filter if present (pool reuse across shrine types)
        if (sprite.__shrineGlowFilter && Array.isArray(sprite.filters)) {
            sprite.filters = sprite.filters.filter(f => f !== sprite.__shrineGlowFilter);
            if (sprite.filters.length === 0) sprite.filters = null;
        }
        const col = _colorFor(shrine).glow;
        const f   = createGlowFilter(col, 2.0, 0, 14);
        if (f) {
            sprite.filters = sprite.filters ? sprite.filters.concat([f]) : [f];
            sprite.__shrineGlowFilter = f;
        } else {
            sprite.__shrineGlowFilter = null;
        }
        sprite.__shrineGlowType = wantType;
    }
    if (sprite.__shrineGlowFilter) {
        const t = window.globalAnimTimer || 0;
        const pulse = (Math.sin(t * 1.5 + shrine.lx * 0.02) + 1) / 2;
        sprite.__shrineGlowFilter.outerStrength = 1.6 + pulse * 1.8;
    }
}

function gcShrineVfx() {
    if (typeof window.towers === 'undefined') return;
    const live = new Set(window.towers.filter(t => t.isShrine));
    for (const [shrine, record] of _shrineVfxRecords) {
        if (!live.has(shrine)) {
            _releaseVfxGfx(record.gfx);
            _shrineVfxRecords.delete(shrine);
        }
    }
}

function renderPixiShrineVfx() {
    if (typeof window.towers === 'undefined') return;
    gcShrineVfx();

    const time  = window.globalAnimTimer || 0;
    const now   = Date.now();
    const pulse = (Math.sin(time * 1.2) + 1) / 2;

    window.towers.forEach(shrine => {
        if (!shrine.isShrine) return;

        _ensureShrineGlow(shrine);

        let record = _shrineVfxRecords.get(shrine);
        if (!record) {
            record = { gfx: _acquireVfxGfx() };
            _shrineVfxRecords.set(shrine, record);
        }
        const g = record.gfx;
        g.clear();

        const cx   = shrine.lx;
        const cy   = shrine.ly;
        const cols = _colorFor(shrine);
        const type = SHRINE_VFX_ALIAS[shrine.data.type] || shrine.data.type;
        const isT2 = shrine.data.tier === 2;

        // ── Universal ground halo ────────────────────────────────────────
        const haloR = 22 + pulse * 4;
        g.ellipse(cx, cy + 30, haloR, haloR * 0.35)
         .fill({ color: cols.glow, alpha: 0.12 + pulse * 0.08 });
        g.ellipse(cx, cy + 30, haloR * 0.6, haloR * 0.2)
         .fill({ color: 0xFFFFFF, alpha: 0.10 + pulse * 0.08 });

        // ── Type-specific signature VFX ──────────────────────────────────
        switch (type) {
            case 'shrine_might': {
                // Rising embers (8 particles, looped)
                for (let i = 0; i < 8; i++) {
                    const t = ((now * 0.0006) + i * 0.125) % 1;
                    const py = cy + 18 - t * 50;
                    const px = cx + Math.sin((now * 0.002 + i * 1.7)) * 8;
                    const a  = (1 - t) * 0.85;
                    g.circle(px, py, 1.8 + (1 - t) * 1.2)
                     .fill({ color: i % 2 ? cols.p1 : cols.p2, alpha: a });
                }
                // Shockwave ring (slow expand)
                const rgT = (now * 0.0008) % 1;
                g.circle(cx, cy + 12, 8 + rgT * 28)
                 .stroke({ color: cols.glow, alpha: (1 - rgT) * 0.45, width: 2 });
                break;
            }
            case 'shrine_speed': {
                // Orbiting wind streaks
                for (let i = 0; i < 5; i++) {
                    const ang = (now * 0.004) + i * (Math.PI * 0.4);
                    const r   = 20 + Math.sin(now * 0.003 + i) * 4;
                    const px  = cx + Math.cos(ang) * r;
                    const py  = cy + Math.sin(ang) * r * 0.45 - 5;
                    g.circle(px, py, 1.4).fill({ color: cols.p2, alpha: 0.7 });
                    // Trail
                    const tang = ang - 0.35;
                    g.moveTo(px, py)
                     .lineTo(cx + Math.cos(tang) * r, cy + Math.sin(tang) * r * 0.45 - 5)
                     .stroke({ color: cols.p1, alpha: 0.35, width: 1 });
                }
                break;
            }
            case 'shrine_range': {
                // Vertical scrying beam from eye
                const beamTop = cy - 36;
                const beamBot = cy + 6;
                g.rect(cx - 1.5, beamTop, 3, beamBot - beamTop)
                 .fill({ color: cols.glow, alpha: 0.5 + pulse * 0.3 });
                g.rect(cx - 4, beamTop, 8, beamBot - beamTop)
                 .fill({ color: cols.glow, alpha: 0.12 + pulse * 0.08 });
                // Sweeping scan ring (ground level)
                const scanT = (now * 0.0009) % 1;
                g.circle(cx, cy + 20, 6 + scanT * 36)
                 .stroke({ color: cols.glow, alpha: (1 - scanT) * 0.55, width: 2 });
                break;
            }
            case 'shrine_wisdom': {
                // Floating glyph dust (small squares, drift up + sway)
                for (let i = 0; i < 7; i++) {
                    const t  = ((now * 0.0005) + i * 0.142) % 1;
                    const py = cy - t * 44;
                    const px = cx + Math.sin(now * 0.0015 + i * 2.2) * 14;
                    const a  = Math.sin(t * Math.PI) * 0.8;
                    g.rect(px - 1, py - 1, 2, 2)
                     .fill({ color: i % 2 ? cols.p1 : cols.p2, alpha: a });
                }
                break;
            }
            case 'shrine_greed': {
                // Coin sparkle burst (radial flashes)
                for (let i = 0; i < 10; i++) {
                    const phase = (now * 0.001 + i * 0.314) % 1;
                    const ang   = i * (Math.PI * 0.2) + now * 0.0005;
                    const r     = phase * 24;
                    const px    = cx + Math.cos(ang) * r;
                    const py    = cy - 5 + Math.sin(ang) * r * 0.55;
                    const a     = (1 - phase) * 0.9;
                    g.circle(px, py, 1.5).fill({ color: cols.p2, alpha: a });
                }
                // Center gold gleam
                g.circle(cx, cy - 6, 4 + pulse * 2)
                 .fill({ color: cols.glow, alpha: 0.35 + pulse * 0.3 });
                break;
            }
            case 'shrine_purity': {
                // Rising holy bubbles
                for (let i = 0; i < 6; i++) {
                    const t  = ((now * 0.0005) + i * 0.166) % 1;
                    const py = cy + 8 - t * 50;
                    const px = cx + Math.sin(now * 0.002 + i) * 7;
                    const r  = 1.5 + t * 2;
                    const a  = Math.sin(t * Math.PI) * 0.85;
                    g.circle(px, py, r).stroke({ color: cols.p2, alpha: a, width: 1 });
                    g.circle(px - r * 0.3, py - r * 0.3, r * 0.3)
                     .fill({ color: 0xFFFFFF, alpha: a * 0.8 });
                }
                break;
            }
            case 'shrine_fervor': {
                // Fire embers + heat ring
                for (let i = 0; i < 10; i++) {
                    const t  = ((now * 0.0009) + i * 0.1) % 1;
                    const py = cy - t * 48;
                    const px = cx + Math.sin(now * 0.003 + i * 1.5) * (4 + t * 8);
                    const a  = (1 - t) * 0.9;
                    const c  = t < 0.4 ? cols.p2 : cols.p1;
                    g.circle(px, py, 1.8 - t * 1).fill({ color: c, alpha: a });
                }
                // Pulsing heat ring
                g.circle(cx, cy + 22, 18 + pulse * 6)
                 .stroke({ color: cols.glow, alpha: 0.3 + pulse * 0.2, width: 2 });
                break;
            }
            case 'shrine_shadow': {
                // Smoke wisps drift upward
                for (let i = 0; i < 6; i++) {
                    const t  = ((now * 0.0004) + i * 0.166) % 1;
                    const py = cy - t * 50;
                    const px = cx + Math.sin(now * 0.001 + i * 1.3) * (4 + t * 12);
                    const r  = 3 + t * 4;
                    const a  = Math.sin(t * Math.PI) * 0.5;
                    g.circle(px, py, r).fill({ color: cols.p1, alpha: a });
                }
                // Crescent moon ghost halo
                const ghostR = 14 + pulse * 4;
                g.circle(cx + 4, cy - 24, ghostR)
                 .stroke({ color: cols.p2, alpha: 0.25 + pulse * 0.2, width: 2 });
                break;
            }
            case 'shrine_harvest': {
                // Gold dust storm (swirling)
                for (let i = 0; i < 12; i++) {
                    const ang = (now * 0.0015) + i * (Math.PI * 0.166);
                    const r   = 10 + ((now * 0.02 + i * 7) % 22);
                    const px  = cx + Math.cos(ang) * r;
                    const py  = cy + Math.sin(ang) * r * 0.45 + 4;
                    g.circle(px, py, 1.2).fill({ color: cols.p2, alpha: 0.7 });
                }
                break;
            }
            case 'shrine_endurance': {
                // Teal expanding pulse waves (2 staggered)
                for (let i = 0; i < 2; i++) {
                    const t = ((now * 0.0006) + i * 0.5) % 1;
                    g.circle(cx, cy + 18, 4 + t * 36)
                     .stroke({ color: cols.glow, alpha: (1 - t) * 0.55, width: 2 });
                }
                // Crystal motes orbit
                for (let i = 0; i < 4; i++) {
                    const ang = now * 0.0018 + i * (Math.PI * 0.5);
                    const px = cx + Math.cos(ang) * 14;
                    const py = cy - 22 + Math.sin(ang) * 4;
                    g.circle(px, py, 1.6).fill({ color: cols.p2, alpha: 0.85 });
                }
                break;
            }
            case 'shrine_divine': {
                // Radiant god rays — 8 angled beams from cross center
                const rayCx = cx;
                const rayCy = cy - 38;
                for (let i = 0; i < 8; i++) {
                    const ang = i * (Math.PI / 4) + now * 0.0004;
                    const len = 36 + Math.sin(now * 0.002 + i) * 6;
                    g.moveTo(rayCx, rayCy)
                     .lineTo(rayCx + Math.cos(ang) * len, rayCy + Math.sin(ang) * len)
                     .stroke({ color: cols.p2, alpha: 0.25 + pulse * 0.2, width: 2 });
                }
                // Bright halo ring around cross
                g.circle(rayCx, rayCy, 14 + pulse * 3)
                 .stroke({ color: cols.glow, alpha: 0.6 + pulse * 0.35, width: 2 });
                // Descending light particles
                for (let i = 0; i < 5; i++) {
                    const t  = ((now * 0.0008) + i * 0.2) % 1;
                    const py = rayCy + t * 60;
                    const px = rayCx + Math.sin(now * 0.0015 + i) * 14;
                    g.circle(px, py, 1.6).fill({ color: cols.p2, alpha: (1 - t) * 0.85 });
                }
                break;
            }
            case 'shrine_eternity': {
                // Time-warp ripple rings (3 staggered, expand+rotate)
                for (let i = 0; i < 3; i++) {
                    const t = ((now * 0.0005) + i * 0.333) % 1;
                    const r = 8 + t * 36;
                    const a = (1 - t) * 0.6;
                    g.circle(cx, cy - 20, r)
                     .stroke({ color: i % 2 ? cols.p1 : cols.p2, alpha: a, width: 1.5 });
                }
                // Counter-rotating purple/cyan sparks
                for (let i = 0; i < 6; i++) {
                    const ang = (i % 2 ? -1 : 1) * now * 0.002 + i * (Math.PI * 0.33);
                    const r   = 22;
                    const px  = cx + Math.cos(ang) * r;
                    const py  = cy - 20 + Math.sin(ang) * r;
                    g.circle(px, py, 1.4).fill({ color: i % 2 ? cols.p1 : cols.p2, alpha: 0.8 });
                }
                break;
            }
            case 'shrine_miracle': {
                // Prismatic rainbow shards orbit star
                const prismCols = [0xFF1744, 0xFFEA00, 0x00E676, 0x2979FF, 0xD500F9];
                for (let i = 0; i < prismCols.length; i++) {
                    const ang = (now * 0.0018) + i * (Math.PI * 0.4);
                    const r   = 30 + Math.sin(now * 0.003 + i) * 6;
                    const px  = cx + Math.cos(ang) * r;
                    const py  = cy - 28 + Math.sin(ang) * r * 0.55;
                    g.circle(px, py, 2.2).fill({ color: prismCols[i], alpha: 0.85 });
                    // Trail
                    const tang = ang - 0.3;
                    g.moveTo(px, py)
                     .lineTo(cx + Math.cos(tang) * r, cy - 28 + Math.sin(tang) * r * 0.55)
                     .stroke({ color: prismCols[i], alpha: 0.4, width: 1.5 });
                }
                // Central star burst rays (rotating)
                for (let i = 0; i < 6; i++) {
                    const ang = i * (Math.PI / 3) + now * 0.0006;
                    const len = 18 + pulse * 6;
                    g.moveTo(cx, cy - 28)
                     .lineTo(cx + Math.cos(ang) * len, cy - 28 + Math.sin(ang) * len)
                     .stroke({ color: 0xFFFFFF, alpha: 0.4 + pulse * 0.3, width: 1.5 });
                }
                break;
            }
            default: {
                // Generic pulse for unmapped types
                g.circle(cx, cy - 8, 10 + pulse * 4)
                 .stroke({ color: cols.glow, alpha: 0.4 + pulse * 0.3, width: 2 });
            }
        }
    });
}

window.renderPixiShrineVfx = renderPixiShrineVfx;
window.gcShrineVfx         = gcShrineVfx;
