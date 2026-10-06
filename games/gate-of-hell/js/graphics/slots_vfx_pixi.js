/* slots_vfx_pixi.js — VFX enhancer for unit + shrine slots.
 *
 * Per-slot additive VFX layered on top of slot tile:
 *   - Soft radial glow (color-coded: gold=unit, cyan=shrine)
 *   - Rotating rune ring (12 dashed segments, perspective-compressed)
 *   - 3 floating pixel motes rising from slot
 *
 * Intensity scales with occupied state. Idle slots get subtle "invitation"
 * glow; occupied slots get strong aura + visible runes + motes.
 */

let _slotVfxGlowTex = null;
const _slotVfx       = []; // per-slot: { glow, ring, motes: [{sp, phase}] }
let _slotVfxBuilt    = false;

if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        _slotVfx.length = 0;
        _slotVfxBuilt = false;
    });
}

function _ensureSlotVfxGlowTex() {
    if (_slotVfxGlowTex) return _slotVfxGlowTex;
    if (typeof PIXI === 'undefined') return null;
    const SZ = 128;
    const c = document.createElement('canvas');
    c.width = SZ; c.height = SZ;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(SZ / 2, SZ / 2, 0, SZ / 2, SZ / 2, SZ / 2);
    grad.addColorStop(0,   'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.45)');
    grad.addColorStop(1,   'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, SZ, SZ);
    _slotVfxGlowTex = PIXI.Texture.from(c);
    return _slotVfxGlowTex;
}

function _buildSlotVfx() {
    if (_slotVfxBuilt || !window.logicalSlots || !window.worldLayer) return;
    const tex = _ensureSlotVfxGlowTex();
    if (!tex) return;
    window.logicalSlots.forEach(() => {
        const glow = new PIXI.Sprite(tex);
        glow.anchor.set(0.5, 0.5);
        glow.blendMode = 'add';
        glow.alpha = 0.2;
        window.worldLayer.addChild(glow);

        const ring = new PIXI.Graphics();
        ring.blendMode = 'add';
        window.worldLayer.addChild(ring);

        const motes = [];
        for (let m = 0; m < 3; m++) {
            const sp = new PIXI.Sprite(tex);
            sp.anchor.set(0.5, 0.5);
            sp.blendMode = 'add';
            sp.width = sp.height = 12;
            sp.alpha = 0;
            window.worldLayer.addChild(sp);
            motes.push({ sp, phase: Math.random() });
        }
        _slotVfx.push({ glow, ring, motes });
    });
    _slotVfxBuilt = true;
}

function updateSlotsVfx() {
    if (!window.logicalSlots || window.logicalSlots.length === 0) return;
    if (!_slotVfxBuilt) {
        _buildSlotVfx();
        if (!_slotVfxBuilt) return;
    }
    const t = window.globalAnimTimer || 0;

    for (let i = 0; i < _slotVfx.length; i++) {
        const slot = window.logicalSlots[i];
        const vfx  = _slotVfx[i];
        if (!slot || !vfx) continue;

        const isShrine = slot.type === 'shrine';
        const occupied = !!slot.isOccupied;
        const color    = isShrine ? 0x66E5FF : 0xFFC838;
        const pulse    = (Math.sin(t * 1.4 + i * 0.31) + 1) / 2;

        // ── Glow (ground halo) ─────────────────────────────────
        const g = vfx.glow;
        g.x = slot.lx;
        g.y = slot.ly + 10;
        g.tint = color;
        const baseA = occupied ? 0.38 : 0.13;
        g.alpha = baseA + pulse * 0.12;
        const baseSize = occupied ? 150 : 120;
        g.width = g.height = baseSize + pulse * 10;

        // ── Rune ring (rotating dashed segments) ───────────────
        const r = vfx.ring;
        r.x = slot.lx;
        r.y = slot.ly + 14;
        r.clear();
        if (occupied || isShrine) {
            const ringR = 40 + pulse * 4;
            const segs  = 12;
            const ringA = occupied ? 0.55 + pulse * 0.30 : 0.18 + pulse * 0.15;
            for (let s = 0; s < segs; s++) {
                const a0 = (s / segs) * Math.PI * 2 + t * (isShrine ? -0.35 : 0.30);
                const a1 = a0 + (Math.PI * 2 / segs) * 0.55;
                const x0 = Math.cos(a0) * ringR;
                const y0 = Math.sin(a0) * ringR * 0.42;
                const x1 = Math.cos(a1) * ringR;
                const y1 = Math.sin(a1) * ringR * 0.42;
                r.moveTo(x0, y0).lineTo(x1, y1).stroke({ color, alpha: ringA, width: 2 });
            }
            // Inner pip dots at cardinal points
            for (let p = 0; p < 4; p++) {
                const pa = (p / 4) * Math.PI * 2 + t * 0.6;
                const px_ = Math.cos(pa) * ringR * 0.55;
                const py_ = Math.sin(pa) * ringR * 0.55 * 0.42;
                r.circle(px_, py_, 1.6).fill({ color, alpha: ringA * 1.2 });
            }
        }

        // ── Floating motes (occupied only) ─────────────────────
        for (let mi = 0; mi < vfx.motes.length; mi++) {
            const m  = vfx.motes[mi];
            const sp = m.sp;
            if (!occupied) {
                sp.alpha = 0;
                continue;
            }
            m.phase += 0.0065 * (window.dt || 1);
            const ph = (m.phase + mi * 0.33) % 1;
            const ox = Math.sin(t * 0.8 + mi * 2.1 + i * 0.4) * 14;
            sp.x = slot.lx + ox;
            sp.y = slot.ly + 26 - ph * 56;
            sp.tint = color;
            sp.alpha = Math.sin(ph * Math.PI) * 0.85;
            sp.width = sp.height = 9 + ph * 5;
        }
    }
}

window.updateSlotsVfx = updateSlotsVfx;
