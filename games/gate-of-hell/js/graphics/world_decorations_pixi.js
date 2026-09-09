/* world_decorations_pixi.js — Atmospheric Gate-of-Hell decor.
 *
 * Bundles 9 decorative elements onto worldLayer (static) and vfxLayer (glowy):
 *   1. Floating soul wisps (additive, drift sideways)
 *   2. Blood drip stains down bar bottom (static stains + few animated drops)
 *   3. Hanging blood banners with hangul (cloth sway)
 *   4. Hanging cages with skeletons (slow pendulum swing)
 *   5. Tar/blood pools on road shoulder (subtle ripple alpha)
 *   6. Pentagram floor sigil under each shrine slot
 *   7. Crawling shadow tendrils at slot block edges (slow alpha pulse)
 *   8. Spell scroll piles in idle corners
 *   9. Sacrificial dagger stuck in skull pile (on existing bone piles)
 *
 * Perf rules: every static composition is cacheAsBitmap. Animated objects
 * limited in count, only transform writes per frame, no per-frame Graphics
 * rebuilds. Shared baked glow texture for wisps + blood drops.
 */

const _WD_WISP_COUNT = 10;
const _WD_DROP_COUNT = 6;
const _WD_GLOW_SIZE  = 48;

let _wdStaticCt    = null; // baked container on worldLayer
let _wdAnimCt      = null; // animated container on worldLayer
let _wdAtmosCt     = null; // additive container on vfxLayer (wisps, drops)
let _wdInstalled   = false;
let _wdShrinesDone = false;

let _wdGlowTex     = null;
let _wdWisps       = []; // { sprite, x, y, vx, vy, phase, baseAlpha, size, tint }
let _wdDrops       = []; // { sprite, x, baseY, y, vy, life, maxLife, len }
let _wdBanners     = []; // { gfx, phase, baseSkew }
let _wdCages       = []; // { gfx, phase, baseRot }
let _wdPools       = []; // { gfx, phase, baseAlpha }
let _wdTendrils    = []; // { gfx, phase, baseAlpha }

if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        _wdStaticCt = null; _wdAnimCt = null; _wdAtmosCt = null;
        _wdInstalled = false; _wdShrinesDone = false;
        _wdWisps = []; _wdDrops = []; _wdBanners = [];
        _wdCages = []; _wdPools = []; _wdTendrils = [];
    });
}

function _wdEnsureGlowTex() {
    if (_wdGlowTex) return _wdGlowTex;
    const c = document.createElement('canvas');
    c.width = _WD_GLOW_SIZE; c.height = _WD_GLOW_SIZE;
    const g = c.getContext('2d');
    const r = _WD_GLOW_SIZE / 2;
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0,    'rgba(255,255,255,1)');
    grad.addColorStop(0.4,  'rgba(255,255,255,0.45)');
    grad.addColorStop(1,    'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, _WD_GLOW_SIZE, _WD_GLOW_SIZE);
    _wdGlowTex = PIXI.Texture.from(c);
    return _wdGlowTex;
}

// ── 1. Soul wisps ───────────────────────────────────────────────────────
function _wdSpawnWisp(w, W, H) {
    w.x = -20 + Math.random() * (W + 40);
    w.y = 80 + Math.random() * (H - 200);
    w.vx = 0.15 + Math.random() * 0.35;
    if (Math.random() < 0.5) w.vx = -w.vx;
    w.vy = -0.1 - Math.random() * 0.15;
    w.phase = Math.random() * Math.PI * 2;
    w.size = 10 + Math.random() * 16;
    w.baseAlpha = 0.4 + Math.random() * 0.35;
    const t = Math.random();
    w.tint = t < 0.5 ? 0x88AAFF : (t < 0.85 ? 0xBB88FF : 0x66CCFF);
}

// ── 2. Blood drip drops ─────────────────────────────────────────────────
function _wdSpawnDrop(d, dropPoints) {
    const p = dropPoints[(Math.random() * dropPoints.length) | 0];
    d.x = p;
    d.baseY = 0; // assigned by install
    d.y = 0;
    d.vy = 0.35 + Math.random() * 0.4;
    d.maxLife = 80 + Math.random() * 60;
    d.life = Math.random() * d.maxLife;
    d.len = 6 + Math.random() * 6;
}

// ── 3. Hanging banner ──────────────────────────────────────────────────
function _wdDrawBanner(parent, cx, topY, glyph, store) {
    const g = new PIXI.Container();
    g.x = cx;
    g.y = topY;
    g.pivot.set(0, 0);

    // Rope from y=0 down 6px
    const rope = new PIXI.Graphics();
    rope.rect(-1, 0, 2, 6).fill(0x3A2A1E);
    g.addChild(rope);

    // Cloth panel
    const cloth = new PIXI.Graphics();
    cloth.moveTo(-14, 6).lineTo(14, 6).lineTo(14, 60).lineTo(0, 70).lineTo(-14, 60).closePath()
        .fill(0x6A0A0A);
    cloth.moveTo(-14, 6).lineTo(14, 6).lineTo(14, 60).lineTo(0, 70).lineTo(-14, 60).closePath()
        .stroke({ width: 1, color: 0x2A0000, alpha: 0.9 });
    // Gold trim
    cloth.moveTo(-14, 8).lineTo(14, 8).stroke({ width: 1, color: 0xD4A23A, alpha: 0.9 });
    cloth.moveTo(-13, 58).lineTo(13, 58).stroke({ width: 1, color: 0xD4A23A, alpha: 0.9 });
    g.addChild(cloth);

    // Hangul glyph
    if (glyph) {
        try {
            const t = new PIXI.Text({
                text: glyph,
                style: {
                    fontFamily: 'serif',
                    fontSize: 18,
                    fontWeight: 'bold',
                    fill: 0xF4D88E,
                    stroke: { color: 0x1A0000, width: 2 },
                    align: 'center',
                },
            });
            t.anchor.set(0.5, 0);
            t.x = 0;
            t.y = 18;
            g.addChild(t);
        } catch (_) {}
    }

    parent.addChild(g);
    g.cacheAsBitmap = true;
    store.push({
        gfx: g,
        phase: Math.random() * Math.PI * 2,
        baseSkew: 0,
    });
}

// ── 4. Hanging cage with skeleton ───────────────────────────────────────
function _wdDrawCage(parent, cx, topY, store) {
    const c = new PIXI.Container();
    c.x = cx;
    c.y = topY;
    c.pivot.set(0, 0);

    // Chain from y=0 down 24px
    const chain = new PIXI.Graphics();
    for (let i = 0; i < 5; i++) {
        chain.rect(-1, i * 5, 2, 3).fill(0x3A2A1E);
        chain.rect(-2, i * 5 + 1, 4, 1).fill(0x5A4636);
    }
    c.addChild(chain);

    // Cage frame
    const cage = new PIXI.Graphics();
    const cy = 26;
    const cw = 18, ch = 24;
    // Top + bottom rings
    cage.ellipse(0, cy, cw / 2, 3).stroke({ width: 1.4, color: 0x4A3828 });
    cage.ellipse(0, cy + ch, cw / 2, 3).stroke({ width: 1.4, color: 0x4A3828 });
    // Vertical bars
    for (let i = -3; i <= 3; i++) {
        const x = i * (cw / 7);
        cage.rect(x - 0.5, cy, 1, ch).fill(0x4A3828);
    }
    // Mid ring
    cage.ellipse(0, cy + ch / 2, cw / 2, 2.5).stroke({ width: 0.8, color: 0x5A4636 });
    c.addChild(cage);

    // Skeleton inside
    const sk = new PIXI.Graphics();
    const sx = 0, sy = cy + 10;
    sk.ellipse(sx, sy, 4, 3).fill(0xE0D6C0);
    sk.rect(sx - 1.5, sy - 0.5, 1.2, 1.2).fill(0x10080A);
    sk.rect(sx + 0.3, sy - 0.5, 1.2, 1.2).fill(0x10080A);
    sk.rect(sx - 3, sy + 3, 6, 6).fill({ color: 0xD0C6B0, alpha: 0.9 }); // ribs blob
    sk.moveTo(sx - 3, sy + 3).lineTo(sx - 6, sy + 9)
      .stroke({ width: 1, color: 0xE0D6C0 });
    sk.moveTo(sx + 3, sy + 3).lineTo(sx + 6, sy + 9)
      .stroke({ width: 1, color: 0xE0D6C0 });
    c.addChild(sk);

    parent.addChild(c);
    c.cacheAsBitmap = true;
    store.push({
        gfx: c,
        phase: Math.random() * Math.PI * 2,
        baseRot: 0,
    });
}

// ── 5. Tar/blood pool ──────────────────────────────────────────────────
function _wdDrawPool(parent, cx, cy, store) {
    const g = new PIXI.Graphics();
    g.x = cx; g.y = cy;
    // Outer dark
    g.ellipse(0, 0, 22, 8).fill({ color: 0x0A0000, alpha: 0.85 });
    g.ellipse(0, 0, 22, 8).stroke({ width: 0.8, color: 0x300404, alpha: 0.8 });
    // Inner blood pool
    g.ellipse(0, 0, 16, 5.5).fill({ color: 0x5A0808, alpha: 0.9 });
    // Glossy highlight
    g.ellipse(-4, -2, 6, 1.6).fill({ color: 0xCC2222, alpha: 0.55 });
    g.ellipse( 5, -1, 4, 1.2).fill({ color: 0xEE3333, alpha: 0.4 });
    parent.addChild(g);
    g.cacheAsBitmap = true;
    store.push({
        gfx: g,
        phase: Math.random() * Math.PI * 2,
        baseAlpha: 1.0,
    });
}

// ── 6. Pentagram under shrine slot ─────────────────────────────────────
function _wdDrawPentagram(parent, cx, cy) {
    const g = new PIXI.Graphics();
    g.x = cx; g.y = cy;
    const r = 42;
    // Outer rings
    g.circle(0, 0, r).stroke({ width: 1.4, color: 0x8800FF, alpha: 0.65 });
    g.circle(0, 0, r - 4).stroke({ width: 0.6, color: 0xFF2255, alpha: 0.5 });
    // Pentagram star
    const pts = [];
    for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + i * (Math.PI * 2 / 5) * 2;
        pts.push(Math.cos(a) * (r - 6), Math.sin(a) * (r - 6));
    }
    g.poly(pts).stroke({ width: 1.2, color: 0xFF3366, alpha: 0.75 });
    // 5 small candles around
    for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
        const x = Math.cos(a) * (r - 1);
        const y = Math.sin(a) * (r - 1);
        g.circle(x, y, 1.5).fill(0xFFCC55);
    }
    g.blendMode = 'add';
    if (typeof createGlowFilter === 'function') {
        const glow = createGlowFilter(0x8800FF, 1.2, 0, 8);
        if (glow) g.filters = [glow];
    }
    parent.addChild(g);
    g.cacheAsBitmap = true;
}

// ── 7. Shadow tendril ──────────────────────────────────────────────────
function _wdDrawTendril(parent, cx, cy, dir, store) {
    const g = new PIXI.Graphics();
    g.x = cx; g.y = cy;
    // Coiling tendril made of overlapping ellipses
    for (let i = 0; i < 6; i++) {
        const t = i / 5;
        const x = dir * (i * 6);
        const y = Math.sin(t * Math.PI * 1.5) * 8;
        const sz = 6 - i * 0.6;
        g.ellipse(x, y, sz, sz * 0.6).fill({ color: 0x0A0014, alpha: 0.55 - t * 0.25 });
    }
    g.ellipse(0, 0, 8, 4).fill({ color: 0x10001A, alpha: 0.8 });
    parent.addChild(g);
    g.cacheAsBitmap = true;
    store.push({
        gfx: g,
        phase: Math.random() * Math.PI * 2,
        baseAlpha: 0.85,
    });
}

// ── 8. Spell scroll pile ───────────────────────────────────────────────
function _wdDrawScrollPile(parent, cx, cy) {
    const g = new PIXI.Graphics();
    g.x = cx; g.y = cy;
    // 3 stacked rolled scrolls
    const drawScroll = (x, y, len, tint) => {
        g.rect(x - len / 2, y - 2, len, 4).fill(tint);
        g.rect(x - len / 2, y - 2, len, 4).stroke({ width: 0.6, color: 0x4A3828, alpha: 0.8 });
        g.circle(x - len / 2, y, 2).fill(0xD4C094);
        g.circle(x + len / 2, y, 2).fill(0xD4C094);
        // Red wax seal
        g.circle(x, y, 1.4).fill(0xB81818);
    };
    drawScroll(0, 2, 22, 0xE2D2A8);
    drawScroll(2, -2, 18, 0xD4C094);
    drawScroll(-3, -5, 16, 0xC8B888);
    // Tiny glyph hint on top scroll
    g.rect(-2, -6, 4, 0.6).fill({ color: 0x2A0000, alpha: 0.7 });
    parent.addChild(g);
    // No per-item cache — parent static container handles bake.
}

// ── 9. Dagger in skull pile ────────────────────────────────────────────
function _wdDrawDagger(parent, cx, cy) {
    const g = new PIXI.Graphics();
    g.x = cx; g.y = cy;
    // Blade — vertical, point down into pile
    g.moveTo(-2, -16).lineTo(2, -16).lineTo(1, 6).lineTo(0, 9).lineTo(-1, 6).closePath()
        .fill(0xD4D8E0);
    g.moveTo(-2, -16).lineTo(2, -16).lineTo(1, 6).lineTo(0, 9).lineTo(-1, 6).closePath()
        .stroke({ width: 0.6, color: 0x3A4048, alpha: 0.9 });
    // Crossguard
    g.rect(-6, -16, 12, 2).fill(0x6A4828);
    g.rect(-6, -16, 12, 2).stroke({ width: 0.5, color: 0x2A1A10 });
    // Grip
    g.rect(-1.5, -22, 3, 6).fill(0x2A1410);
    // Pommel
    g.circle(0, -24, 2).fill(0xB81818);
    // Blood drip on blade
    g.rect(-0.5, -8, 1, 12).fill({ color: 0x6A0A0A, alpha: 0.9 });
    parent.addChild(g);
    // No per-item cache — parent static container handles bake.
}

// ── Install ────────────────────────────────────────────────────────────
function _wdInstall() {
    if (_wdInstalled || !window.worldLayer || !window.vfxLayer || typeof PIXI === 'undefined') return;

    const W = window.LOGICAL_WIDTH  || 1080;
    const H = window.LOGICAL_HEIGHT || 1440;
    const roadW = (typeof getRoadWidth === 'function') ? getRoadWidth() : 342;
    const roadX = (typeof getRoadX     === 'function') ? getRoadX()     : (W - roadW) / 2;
    const MERGE_Y   = H * 0.22;
    const barBottom = MERGE_Y * 0.1 + 220;

    _wdStaticCt = new PIXI.Container();
    _wdStaticCt.zIndex = 1;
    _wdAnimCt   = new PIXI.Container();
    _wdAnimCt.zIndex = 2;
    _wdAtmosCt  = new PIXI.Container();
    _wdAtmosCt.blendMode = 'add';

    // 2. Blood stains static along bar bottom edge
    const stainsG = new PIXI.Graphics();
    const stainXs = [80, 170, 260, 820, 910, 1000];
    stainXs.forEach(x => {
        // Drip column (static)
        stainsG.rect(x - 1, barBottom - 18, 2, 18).fill({ color: 0x5A0606, alpha: 0.85 });
        stainsG.rect(x - 0.5, barBottom - 3, 1.5, 6).fill({ color: 0x6A0A0A, alpha: 0.95 });
        // Smear puddle on seam
        stainsG.ellipse(x, barBottom + 1, 4, 1.5).fill({ color: 0x4A0404, alpha: 0.7 });
    });
    _wdStaticCt.addChild(stainsG);

    // 3. Banners — 2 hanging from bar (avoiding skull positions, stem zone)
    const glyphs = ['죽', '귀'];
    _wdDrawBanner(_wdAnimCt, 350, 60, glyphs[0], _wdBanners);
    _wdDrawBanner(_wdAnimCt, 730, 60, glyphs[1], _wdBanners);

    // 4. Hanging cages — 2 per side, anchored OUTSIDE the road on slot bg
    //    Position so they sit in the slot bg area between unit columns, not over slots.
    //    Place near outer screen edges, mid-vertical.
    _wdDrawCage(_wdAnimCt, 30,    barBottom + 80,  _wdCages);
    _wdDrawCage(_wdAnimCt, W - 30, barBottom + 80, _wdCages);

    // 5. Tar/blood pools — scattered across stem, bar, and slot bg areas.
    const stemL = roadX + 14;
    const stemR = roadX + roadW - 14;
    // Stem edges (inside road)
    _wdDrawPool(_wdAnimCt, stemL,  barBottom + 220, _wdPools);
    _wdDrawPool(_wdAnimCt, stemR,  barBottom + 320, _wdPools);
    _wdDrawPool(_wdAnimCt, stemL,  barBottom + 480, _wdPools);
    _wdDrawPool(_wdAnimCt, stemR,  barBottom + 620, _wdPools);
    // Stem center splatters
    _wdDrawPool(_wdAnimCt, roadX + roadW * 0.5, barBottom + 380, _wdPools);
    _wdDrawPool(_wdAnimCt, roadX + roadW * 0.35, barBottom + 560, _wdPools);
    _wdDrawPool(_wdAnimCt, roadX + roadW * 0.65, barBottom + 720, _wdPools);
    // Bar area (horizontal road, skip stem zone)
    _wdDrawPool(_wdAnimCt, 140, barBottom - 60,  _wdPools);
    _wdDrawPool(_wdAnimCt, 240, barBottom - 130, _wdPools);
    _wdDrawPool(_wdAnimCt, W - 140, barBottom - 60,  _wdPools);
    _wdDrawPool(_wdAnimCt, W - 240, barBottom - 130, _wdPools);
    _wdDrawPool(_wdAnimCt, 90,  barBottom - 200, _wdPools);
    _wdDrawPool(_wdAnimCt, W - 90, barBottom - 200, _wdPools);
    // Slot bg areas (between slot rows, off to outer edges so don't overlap units)
    _wdDrawPool(_wdAnimCt, 20,    barBottom + 200, _wdPools);
    _wdDrawPool(_wdAnimCt, W - 20, barBottom + 320, _wdPools);
    _wdDrawPool(_wdAnimCt, 25,    barBottom + 500, _wdPools);
    _wdDrawPool(_wdAnimCt, W - 25, barBottom + 680, _wdPools);
    _wdDrawPool(_wdAnimCt, 15,    barBottom + 760, _wdPools);
    _wdDrawPool(_wdAnimCt, W - 18, barBottom + 880, _wdPools);

    // 7. Shadow tendrils — at slot block outer corners, crawling inward
    //    Installed in _wdInstallShrines (needs slot bounds). Skip here.

    // 8. Spell scroll piles — corners of slot bg area
    _wdDrawScrollPile(_wdStaticCt, 40,     H - 200);
    _wdDrawScrollPile(_wdStaticCt, W - 40, H - 200);
    _wdDrawScrollPile(_wdStaticCt, 50,     barBottom + 30);
    _wdDrawScrollPile(_wdStaticCt, W - 50, barBottom + 30);

    // 9. Sacrificial daggers — on the two bone piles near portal
    _wdDrawDagger(_wdStaticCt, roadX + 12,         H - 56);
    _wdDrawDagger(_wdStaticCt, roadX + roadW - 12, H - 56);

    // 1. Soul wisp pool on vfxLayer (additive)
    const glow = _wdEnsureGlowTex();
    for (let i = 0; i < _WD_WISP_COUNT; i++) {
        const sp = new PIXI.Sprite(glow);
        sp.anchor.set(0.5, 0.5);
        sp.blendMode = 'add';
        _wdAtmosCt.addChild(sp);
        const w = { sprite: sp };
        _wdSpawnWisp(w, W, H);
        _wdWisps.push(w);
    }

    // 2b. Animated drip drops along bar bottom (few extra, low count)
    const dropPoints = stainXs;
    for (let i = 0; i < _WD_DROP_COUNT; i++) {
        const sp = new PIXI.Sprite(glow);
        sp.anchor.set(0.5, 0);
        sp.tint = 0x6A0A0A;
        sp.blendMode = 'normal';
        sp.alpha = 0;
        _wdAtmosCt.addChild(sp);
        const d = { sprite: sp, baseY: barBottom };
        _wdSpawnDrop(d, dropPoints);
        d.baseY = barBottom;
        _wdDrops.push(d);
    }

    window.worldLayer.addChild(_wdStaticCt);
    window.worldLayer.addChild(_wdAnimCt);
    window.vfxLayer.addChild(_wdAtmosCt);

    // Bake static container — covers stains, scrolls, daggers.
    _wdStaticCt.cacheAsBitmap = true;

    _wdInstalled = true;
    console.log('[world_decorations_pixi] installed.');
}

function _wdInstallShrines() {
    if (_wdShrinesDone || !_wdStaticCt) return;
    if (!window.logicalSlots || window.logicalSlots.length === 0) return;

    // Need to invalidate the static cache to add new children, so add to anim container instead.
    // Both pentagrams and tendrils are baked individually anyway.
    const lateCt = new PIXI.Container();
    lateCt.zIndex = 0;

    // 6. Pentagram under each shrine slot
    for (let i = 0; i < window.logicalSlots.length; i++) {
        const s = window.logicalSlots[i];
        if (s.type !== 'shrine') continue;
        _wdDrawPentagram(lateCt, s.lx, s.ly + 6);
    }

    // 7. Shadow tendrils — at slot block outer corners (dir points inward)
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
    const pad = 56;
    Object.entries(bounds).forEach(([area, b]) => {
        if (!b) return;
        // dir = +1 means tendril extends to the right
        _wdDrawTendril(lateCt, b.minX - pad, b.minY - pad, +1, _wdTendrils);
        _wdDrawTendril(lateCt, b.maxX + pad, b.minY - pad, -1, _wdTendrils);
        _wdDrawTendril(lateCt, b.minX - pad, b.maxY + pad, +1, _wdTendrils);
        _wdDrawTendril(lateCt, b.maxX + pad, b.maxY + pad, -1, _wdTendrils);
    });

    if (window.worldLayer) window.worldLayer.addChild(lateCt);
    _wdShrinesDone = true;
    console.log('[world_decorations_pixi] shrine pentagrams + tendrils installed.');
}

// ── Update tick ────────────────────────────────────────────────────────
function updateWorldDecorations() {
    if (!_wdInstalled) {
        _wdInstall();
        if (!_wdInstalled) return;
    }
    if (!_wdShrinesDone) _wdInstallShrines();

    const dt = window.dt || 1;
    const W = window.LOGICAL_WIDTH  || 1080;

    // Wisps
    for (let i = 0; i < _wdWisps.length; i++) {
        const w = _wdWisps[i];
        w.x += w.vx * dt;
        w.y += w.vy * dt;
        w.phase += dt * 0.05;
        if (w.x < -40 || w.x > W + 40) {
            // Respawn on opposite side
            _wdSpawnWisp(w, W, window.LOGICAL_HEIGHT || 1440);
            w.x = w.vx > 0 ? -20 : W + 20;
        }
        const flick = 0.85 + Math.sin(w.phase) * 0.15;
        const sp = w.sprite;
        sp.x = w.x;
        sp.y = w.y;
        sp.alpha = w.baseAlpha * flick;
        sp.tint = w.tint;
        sp.width = sp.height = w.size;
    }

    // Drops
    for (let i = 0; i < _wdDrops.length; i++) {
        const d = _wdDrops[i];
        d.life -= dt;
        d.y    += d.vy * dt;
        if (d.life <= 0 || d.y > 80) {
            _wdSpawnDrop(d, [80, 170, 260, 820, 910, 1000]);
            d.y = 0;
        }
        const k = Math.max(0, Math.min(1, 1 - d.life / d.maxLife));
        const sp = d.sprite;
        sp.x = d.x;
        sp.y = d.baseY + d.y;
        sp.alpha = Math.sin(k * Math.PI) * 0.85;
        sp.width = 2.2;
        sp.height = d.len;
    }

    // Banners — gentle sway via rotation around top pivot
    for (let i = 0; i < _wdBanners.length; i++) {
        const b = _wdBanners[i];
        b.phase += dt * 0.025;
        b.gfx.rotation = Math.sin(b.phase) * 0.06;
    }

    // Cages — slow pendulum
    for (let i = 0; i < _wdCages.length; i++) {
        const c = _wdCages[i];
        c.phase += dt * 0.018;
        c.gfx.rotation = Math.sin(c.phase) * 0.08;
    }

    // Pools — alpha ripple
    for (let i = 0; i < _wdPools.length; i++) {
        const p = _wdPools[i];
        p.phase += dt * 0.03;
        p.gfx.alpha = p.baseAlpha * (0.85 + Math.sin(p.phase) * 0.15);
    }

    // Tendrils — alpha pulse
    for (let i = 0; i < _wdTendrils.length; i++) {
        const t = _wdTendrils[i];
        t.phase += dt * 0.04;
        t.gfx.alpha = t.baseAlpha * (0.7 + Math.sin(t.phase) * 0.3);
    }
}

window.updateWorldDecorations = updateWorldDecorations;
