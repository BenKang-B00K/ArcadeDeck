/* road_decorations_pixi.js — Static decor along the inverted-T road edges.
 *
 * Pure Pixi v8 Graphics, no external assets:
 *   - Top corner braziers (where bar meets stem) with flickering flame.
 *   - Hanging chained skulls along both vertical stem edges.
 *   - Bone piles near portal at bottom corners of stem.
 *
 * Layer: worldLayer (above road tile, below entities). Sits just inside the
 * stem so it does not collide with slot tiles in the slot_bg area.
 */

let _rdContainer   = null;
let _rdFlames      = [];   // { gfx, phase, baseAlpha }
let _rdSigils      = [];   // { gfx, phase }
let _rdInstalled        = false;
let _rdSigilsInstalled  = false;

if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        _rdContainer        = null;
        _rdFlames           = [];
        _rdSigils           = [];
        _rdInstalled        = false;
        _rdSigilsInstalled  = false;
    });
}

function _rdDrawChainedSkull(parent, x, y, dir) {
    // dir: +1 = skull hangs on right side of x, -1 = left side.
    // Chain (4 small rings) from y-22 down to y-6.
    const chain = new PIXI.Graphics();
    for (let i = 0; i < 4; i++) {
        const cy = y - 22 + i * 5;
        chain.rect(x - 1, cy, 2, 3).fill({ color: 0x3A2A1E, alpha: 0.95 });
        chain.rect(x - 2, cy + 1, 4, 1).fill({ color: 0x5A4636, alpha: 0.9 });
    }
    parent.addChild(chain);

    // Skull body — slight outward lean.
    const sk = new PIXI.Graphics();
    const sx = x + dir * 5;
    const sy = y + 2;
    // Cranium
    sk.ellipse(sx, sy, 6, 5).fill(0xE8DFC8);
    sk.ellipse(sx, sy, 6, 5).stroke({ width: 1, color: 0x2A1F18, alpha: 0.7 });
    // Jaw
    sk.rect(sx - 3, sy + 3, 6, 3).fill(0xD8CDB4);
    sk.rect(sx - 3, sy + 3, 6, 3).stroke({ width: 1, color: 0x2A1F18, alpha: 0.6 });
    // Eye sockets
    sk.rect(sx - 3, sy - 1, 2, 2).fill(0x10080A);
    sk.rect(sx + 1, sy - 1, 2, 2).fill(0x10080A);
    // Nasal cavity
    sk.rect(sx - 0.5, sy + 1, 1, 2).fill(0x10080A);
    // Teeth gaps
    sk.rect(sx - 2, sy + 4, 1, 2).fill(0x10080A);
    sk.rect(sx,     sy + 4, 1, 2).fill(0x10080A);
    sk.rect(sx + 2, sy + 4, 1, 2).fill(0x10080A);
    parent.addChild(sk);
}

function _rdDrawBonePile(parent, cx, cy) {
    const g = new PIXI.Graphics();
    // Crossed femurs
    const drawBone = (x1, y1, x2, y2) => {
        // Shaft
        g.moveTo(x1, y1).lineTo(x2, y2)
            .stroke({ width: 3, color: 0xE2D8BE, cap: 'round' });
        // Knobs
        g.circle(x1, y1, 2.2).fill(0xE8DFC8);
        g.circle(x2, y2, 2.2).fill(0xE8DFC8);
    };
    drawBone(cx - 9, cy - 4, cx + 9, cy + 4);
    drawBone(cx - 9, cy + 4, cx + 9, cy - 4);
    // Small skull on top
    g.ellipse(cx, cy - 7, 4, 3.5).fill(0xE8DFC8);
    g.ellipse(cx, cy - 7, 4, 3.5).stroke({ width: 0.8, color: 0x2A1F18, alpha: 0.7 });
    g.rect(cx - 2, cy - 7.5, 1.2, 1.2).fill(0x10080A);
    g.rect(cx + 0.8, cy - 7.5, 1.2, 1.2).fill(0x10080A);
    parent.addChild(g);
}

function _rdDrawBrazier(parent, cx, cy, flameStore) {
    // Stand
    const stand = new PIXI.Graphics();
    stand.rect(cx - 1.5, cy, 3, 12).fill(0x2A2018);
    stand.rect(cx - 5,   cy + 11, 10, 2).fill(0x1A1410);
    // Bowl
    stand.ellipse(cx, cy + 1, 9, 4).fill(0x1A120C);
    stand.ellipse(cx, cy + 1, 9, 4).stroke({ width: 1.2, color: 0x4A382A, alpha: 0.9 });
    // Coals
    stand.circle(cx - 4, cy + 1, 1.5).fill(0xFF5522);
    stand.circle(cx,     cy + 0.5, 1.8).fill(0xFFAA33);
    stand.circle(cx + 4, cy + 1, 1.5).fill(0xFF6633);
    parent.addChild(stand);

    // Flame layer (animated) — drawn in local space so scaling pivots cleanly.
    const flame = new PIXI.Graphics();
    flame.x = cx;
    flame.y = cy;
    // Outer flame
    flame.moveTo(-6, -1)
         .quadraticCurveTo(-4, -10, 0, -16)
         .quadraticCurveTo( 4, -10, 6, -1)
         .quadraticCurveTo(0,  -4, -6, -1)
         .fill({ color: 0xFF6622, alpha: 0.85 });
    // Inner flame
    flame.moveTo(-3, -2)
         .quadraticCurveTo(-2, -8, 0, -13)
         .quadraticCurveTo( 2, -8, 3, -2)
         .quadraticCurveTo(0,  -4, -3, -2)
         .fill({ color: 0xFFD466, alpha: 0.95 });
    flame.blendMode = 'add';
    if (typeof createGlowFilter === 'function') {
        const glow = createGlowFilter(0xFF6622, 1.8, 0, 8);
        if (glow) flame.filters = [glow];
    }
    parent.addChild(flame);
    // Bake glow + geometry to bitmap once; per-frame alpha/scale stays live.
    flame.cacheAsBitmap = true;

    flameStore.push({
        gfx: flame,
        phase: Math.random() * Math.PI * 2,
        baseAlpha: 1.0,
    });
}

function _rdDrawImpaledSkull(parent, cx, baseY) {
    // Stake driven into bar; skull mounted atop.
    const g = new PIXI.Graphics();
    // Stake
    g.rect(cx - 1.5, baseY - 30, 3, 30).fill(0x3A2A1E);
    g.rect(cx - 2,   baseY - 30, 4, 2).fill(0x5A4636);
    // Blood drip down stake
    g.rect(cx - 0.5, baseY - 26, 1, 6).fill({ color: 0x6A0A0A, alpha: 0.85 });
    g.rect(cx + 1.5, baseY - 18, 1, 4).fill({ color: 0x6A0A0A, alpha: 0.7 });
    parent.addChild(g);

    // Skull on top
    const sk = new PIXI.Graphics();
    const sy = baseY - 36;
    sk.ellipse(cx, sy, 7, 6).fill(0xE8DFC8);
    sk.ellipse(cx, sy, 7, 6).stroke({ width: 1, color: 0x2A1F18, alpha: 0.75 });
    sk.rect(cx - 4, sy + 4, 8, 3).fill(0xD8CDB4);
    sk.rect(cx - 4, sy + 4, 8, 3).stroke({ width: 1, color: 0x2A1F18, alpha: 0.6 });
    // Eye sockets
    sk.rect(cx - 4, sy - 1, 3, 3).fill(0x10080A);
    sk.rect(cx + 1, sy - 1, 3, 3).fill(0x10080A);
    // Nasal
    sk.rect(cx - 0.5, sy + 2, 1, 2).fill(0x10080A);
    // Teeth
    sk.rect(cx - 2, sy + 5, 1, 2).fill(0x10080A);
    sk.rect(cx,     sy + 5, 1, 2).fill(0x10080A);
    sk.rect(cx + 2, sy + 5, 1, 2).fill(0x10080A);
    // Crack
    sk.moveTo(cx - 1, sy - 5).lineTo(cx + 1, sy - 2).lineTo(cx, sy + 1)
      .stroke({ width: 0.6, color: 0x2A1F18, alpha: 0.8 });
    parent.addChild(sk);
}

function _rdDrawSigil(parent, cx, cy, sigilStore) {
    // Pulsing occult ward — hexagram + ring.
    const g = new PIXI.Graphics();
    g.x = cx;
    g.y = cy;
    const r = 14;
    // Outer ring
    g.circle(0, 0, r).stroke({ width: 1.4, color: 0x8800FF, alpha: 0.9 });
    g.circle(0, 0, r - 4).stroke({ width: 0.6, color: 0xFF2255, alpha: 0.7 });
    // Hexagram (two overlapping triangles)
    const pts1 = [];
    const pts2 = [];
    for (let i = 0; i < 3; i++) {
        const a1 = -Math.PI / 2 + i * (Math.PI * 2 / 3);
        const a2 =  Math.PI / 2 + i * (Math.PI * 2 / 3);
        pts1.push(Math.cos(a1) * (r - 2), Math.sin(a1) * (r - 2));
        pts2.push(Math.cos(a2) * (r - 2), Math.sin(a2) * (r - 2));
    }
    g.poly(pts1).stroke({ width: 1.2, color: 0xFF3366, alpha: 0.95 });
    g.poly(pts2).stroke({ width: 1.2, color: 0xFF3366, alpha: 0.95 });
    // Center dot
    g.circle(0, 0, 2).fill(0xFFCC55);
    g.blendMode = 'add';

    if (typeof createGlowFilter === 'function') {
        const glow = createGlowFilter(0x8800FF, 1.6, 0, 10);
        if (glow) g.filters = [glow];
    }
    parent.addChild(g);
    // Bake glow + hexagram once; per-frame alpha/scale stays live.
    g.cacheAsBitmap = true;
    sigilStore.push({ gfx: g, phase: Math.random() * Math.PI * 2 });
}

function _rdInstall() {
    if (_rdInstalled || !window.worldLayer || typeof PIXI === 'undefined') return;

    const W = window.LOGICAL_WIDTH  || 1080;
    const H = window.LOGICAL_HEIGHT || 1440;
    const roadW = (typeof getRoadWidth === 'function') ? getRoadWidth() : 342;
    const roadX = (typeof getRoadX     === 'function') ? getRoadX()     : (W - roadW) / 2;
    const MERGE_Y   = H * 0.22;
    const barBottom = MERGE_Y * 0.1 + 220;

    _rdContainer = new PIXI.Container();
    _rdContainer.zIndex = 1; // above road tile (added at idx 0), below entities

    const leftX  = roadX + 6;
    const rightX = roadX + roadW - 6;

    // Top corner braziers (just below seam, inside road).
    _rdFlames = [];
    _rdDrawBrazier(_rdContainer, leftX  + 4, barBottom + 14, _rdFlames);
    _rdDrawBrazier(_rdContainer, rightX - 4, barBottom + 14, _rdFlames);

    // Hanging skulls along the stem — every ~140px down each side.
    const startY = barBottom + 50;
    const endY   = H - 110;
    const spacing = 140;
    for (let y = startY; y <= endY; y += spacing) {
        _rdDrawChainedSkull(_rdContainer, leftX,  y, +1);
        _rdDrawChainedSkull(_rdContainer, rightX, y, -1);
    }

    // Bone piles near portal (bottom of stem).
    _rdDrawBonePile(_rdContainer, leftX  + 6, H - 50);
    _rdDrawBonePile(_rdContainer, rightX - 6, H - 50);

    // ── Bar top decor: impaled skull row across horizontal bar ──
    const barSkullY = 50; // mounted near top of bar
    const stemPad   = 50;
    const skullSpacing = 110;
    for (let x = 70; x <= W - 70; x += skullSpacing) {
        // Skip stem zone — gates spawn there.
        if (x > roadX - stemPad && x < roadX + roadW + stemPad) continue;
        _rdDrawImpaledSkull(_rdContainer, x, barSkullY);
    }
    // Extra braziers along bar at quarter and three-quarter points.
    _rdDrawBrazier(_rdContainer, W * 0.18, 90, _rdFlames);
    _rdDrawBrazier(_rdContainer, W * 0.82, 90, _rdFlames);

    window.worldLayer.addChild(_rdContainer);
    _rdInstalled = true;
    console.log('[road_decorations_pixi] installed on worldLayer.');
}

function _rdInstallSigils() {
    if (_rdSigilsInstalled || !_rdContainer) return;
    if (!window.logicalSlots || window.logicalSlots.length === 0) return;

    const bounds = { 'left-slots': null, 'right-slots': null };
    for (let i = 0; i < window.logicalSlots.length; i++) {
        const s = window.logicalSlots[i];
        if (!bounds[s.area]) {
            bounds[s.area] = { minX: s.lx, maxX: s.lx, minY: s.ly, maxY: s.ly };
        } else {
            const b = bounds[s.area];
            if (s.lx < b.minX) b.minX = s.lx;
            if (s.lx > b.maxX) b.maxX = s.lx;
            if (s.ly < b.minY) b.minY = s.ly;
            if (s.ly > b.maxY) b.maxY = s.ly;
        }
    }
    const pad = 64; // outside slot tile half-extent so sigils don't overlap tiles
    Object.values(bounds).forEach(b => {
        if (!b) return;
        _rdDrawSigil(_rdContainer, b.minX - pad, b.minY - pad, _rdSigils);
        _rdDrawSigil(_rdContainer, b.maxX + pad, b.minY - pad, _rdSigils);
        _rdDrawSigil(_rdContainer, b.minX - pad, b.maxY + pad, _rdSigils);
        _rdDrawSigil(_rdContainer, b.maxX + pad, b.maxY + pad, _rdSigils);
    });
    _rdSigilsInstalled = true;
    console.log('[road_decorations_pixi] slot sigils installed.');
}

function updateRoadDecorations() {
    if (!_rdInstalled) {
        _rdInstall();
        if (!_rdInstalled) return;
    }
    if (!_rdSigilsInstalled) _rdInstallSigils();
    const dt = window.dt || 1;
    for (let i = 0; i < _rdFlames.length; i++) {
        const f = _rdFlames[i];
        f.phase += dt * 0.18;
        const flicker = 0.78 + Math.sin(f.phase) * 0.12 + Math.sin(f.phase * 2.7) * 0.06;
        f.gfx.alpha = f.baseAlpha * flicker;
        const sx = 0.92 + Math.sin(f.phase * 1.6) * 0.08;
        const sy = 0.94 + Math.sin(f.phase * 1.1) * 0.06;
        f.gfx.scale.set(sx, sy);
    }
    for (let i = 0; i < _rdSigils.length; i++) {
        const s = _rdSigils[i];
        s.phase += dt * 0.05;
        const pulse = 0.55 + (Math.sin(s.phase) * 0.5 + 0.5) * 0.45;
        s.gfx.alpha = pulse;
        const sc = 0.95 + Math.sin(s.phase * 1.3) * 0.06;
        s.gfx.scale.set(sc, sc);
    }
}

window.updateRoadDecorations = updateRoadDecorations;
