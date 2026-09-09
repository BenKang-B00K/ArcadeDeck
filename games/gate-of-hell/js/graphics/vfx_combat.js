/* vfx_combat.js — Combat VFX: Projectiles, Promotions, Banish, Purge, Summon via Pixi.Graphics
 * Phase 10: GlowFilter on promotion bursts (holy gold) and banish rings (evil purple).
 * Purge & Summon Circles now fully converted to Pixi (ADD blend + GlowFilter).
 */

let _projContainer   = null;
let _projTrailGfx    = null;
let _burstGfx        = null;
let _banishGfx       = null;
let _purgeGfx        = null;
let _summonGfx       = null;
let _chainGfx        = null;

const _projGfxPool   = [];
const _activeProj    = new Map();
const TRAIL_MAX      = 8;

const _chainBolts    = [];
const CHAIN_LIFE_DECAY = 0.08;
const CHAIN_SEG_COUNT  = 7;
const CHAIN_JITTER     = 14;

if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        _projContainer = null;
        _projTrailGfx  = null;
        _burstGfx = null;
        _banishGfx = null;
        _purgeGfx = null;
        _summonGfx = null;
        _projGfxPool.length = 0;
        _activeProj.clear();
        _chainGfx = null;
        _chainBolts.length = 0;
    });
}

function _ensureCombatGfx() {
    if (_projContainer || !window.vfxLayer || !window.holyLayer) return;
    _projContainer = new PIXI.Container();
    // Trail layer goes behind projectile sprites, additive for glow effect
    _projTrailGfx = new PIXI.Graphics();
    _projTrailGfx.blendMode = 'add';
    vfxLayer.addChild(_projTrailGfx);
    vfxLayer.addChild(_projContainer);

    // Promotion bursts on holyLayer with golden GlowFilter
    _burstGfx = new PIXI.Graphics();
    const burstGlow = (typeof createGlowFilter === 'function')
        ? createGlowFilter(0xFFD700, 2.5, 0, 18) : null;
    if (burstGlow) _burstGfx.filters = [burstGlow];
    holyLayer.addChild(_burstGfx);

    // Banish rings on vfxLayer with purple GlowFilter
    _banishGfx = new PIXI.Graphics();
    const banishGlow = (typeof createGlowFilter === 'function')
        ? createGlowFilter(0x6A1B9A, 2, 0, 12) : null;
    if (banishGlow) _banishGfx.filters = [banishGlow];
    vfxLayer.addChild(_banishGfx);

    // Purge effect — ADD blend (lighter) + white glow
    _purgeGfx = new PIXI.Graphics();
    _purgeGfx.blendMode = 'add';
    const purgeGlow = (typeof createGlowFilter === 'function')
        ? createGlowFilter(0xFFFFFF, 1.0, 0, 15) : null; // Reduced intensity/dist
    if (purgeGlow) _purgeGfx.filters = [purgeGlow];
    holyLayer.addChild(_purgeGfx);

    // Summon circles — ADD blend + golden glow
    _summonGfx = new PIXI.Graphics();
    _summonGfx.blendMode = 'add';
    const summonGlow = (typeof createGlowFilter === 'function')
        ? createGlowFilter(0xFFD700, 1.0, 0, 10) : null; // Reduced intensity/dist
    if (summonGlow) _summonGfx.filters = [summonGlow];
    holyLayer.addChild(_summonGfx);

    // Chain lightning bolts (thunder_chain relic) — additive cyan-blue glow
    _chainGfx = new PIXI.Graphics();
    _chainGfx.blendMode = 'add';
    const chainGlow = (typeof createGlowFilter === 'function')
        ? createGlowFilter(0x9EC5FF, 2.0, 0, 14) : null;
    if (chainGlow) _chainGfx.filters = [chainGlow];
    vfxLayer.addChild(_chainGfx);
}

function spawnProjectile(tower, target) {
    if (!window.Pools) return;
    const p    = Pools.projectiles.get();
    p.x        = tower.lx;
    p.y        = tower.ly;
    p.target   = target;
    p.tower    = tower;
    p.speed    = 12;
    p.life     = 1.0;
    p.angle    = 0;
    if (!p.trail) p.trail = [];
    p.trail.length = 0;
}

function updateProjectiles() {
    if (!window.Pools || !Pools.projectiles) return;
    const active = Pools.projectiles.active;
    const L_W = window.LOGICAL_WIDTH || 1080;

    for (let i = active.length - 1; i >= 0; i--) {
        const p = active[i];
        
        let tx, ty;
        if (p.target && p.target.hp > 0) {
            tx = (p.target.x / 100) * L_W;
            ty = p.target.y;
            p.lastKnownTX = tx;
            p.lastKnownTY = ty;
        } else {
            tx = p.lastKnownTX;
            ty = p.lastKnownTY;
        }

        if (tx === undefined || ty === undefined) {
            Pools.projectiles.releaseAt(i);
            continue;
        }

        const dx = tx - p.x;
        const dy = ty - p.y;
        const distSq = dx * dx + dy * dy;
        const speed = p.speed || 12;

        if (distSq <= speed * speed) {
            if (p.target && p.target.hp > 0 && typeof handleHit === 'function') {
                handleHit(p.tower, p.target);
            }
            Pools.projectiles.releaseAt(i);
        } else {
            const dist = Math.sqrt(distSq);
            p.x += (dx / dist) * speed;
            p.y += (dy / dist) * speed;
            p.angle = Math.atan2(dy, dx);
            if (!p.trail) p.trail = [];
            p.trail.push({ x: p.x, y: p.y });
            if (p.trail.length > TRAIL_MAX) p.trail.shift();
        }
    }
}

function drawProjectiles() {
    _ensureCombatGfx();
    if (!_projContainer || !window.Pools) return;
    const active    = Pools.projectiles.active;
    const activeSet = new Set(active);
    const animT     = window.globalAnimTimer || 0;

    for (const [p, gfx] of _activeProj) {
        if (!activeSet.has(p)) {
            _projContainer.removeChild(gfx);
            gfx.clear();
            _projGfxPool.push(gfx);
            _activeProj.delete(p);
        }
    }

    // Trails first (additive layer)
    if (_projTrailGfx && typeof window.drawProjectileTrails === 'function') {
        window.drawProjectileTrails(_projTrailGfx, active);
    }

    active.forEach(function(p) {
        let gfx = _activeProj.get(p);
        if (!gfx) {
            gfx = _projGfxPool.pop() || new PIXI.Graphics();
            _projContainer.addChild(gfx);
            _activeProj.set(p, gfx);
        }
        gfx.clear();
        gfx.x        = p.x;
        gfx.y        = p.y;
        gfx.rotation = p.angle || 0;
        const type = (p.tower && p.tower.data) ? p.tower.data.type : 'default';
        if (typeof window.drawProjectileFx === 'function') {
            window.drawProjectileFx(gfx, type, animT);
        }
    });
}

function spawnPromotionBurst(lx, ly, tier) {
    if (!window.Pools) return;
    const pb = Pools.promotionBursts.get();
    pb.x = lx; pb.y = ly; pb.life = 1.0; pb.tier = tier;

    if (typeof spawnHitEffect === 'function') {
        spawnHitEffect(lx, ly, (tier === 4) ? '#9400d3' : '#ffd700', 40);
        if (typeof spawnParticles === 'function') {
            spawnParticles(lx, ly, (tier === 4) ? '#9400d3' : '#ffd700', 4);
        }
    } else if (typeof spawnParticles === 'function') {
        spawnParticles(lx, ly, (tier === 4) ? '#9400d3' : '#ffd700', 20);
    }
}

function updatePromotionBursts() {
    if (!window.Pools || !Pools.promotionBursts) return;
    const active = Pools.promotionBursts.active;
    for (let i = active.length - 1; i >= 0; i--) {
        active[i].life -= 0.025;
        if (active[i].life <= 0) Pools.promotionBursts.releaseAt(i);
    }
}

function drawPromotionBursts() {
    _ensureCombatGfx();
    if (!_burstGfx || !window.Pools) return;
    _burstGfx.clear();
    Pools.promotionBursts.active.forEach(function(pb) {
        const isAbyss = pb.tier === 4;
        const col     = isAbyss ? 0x9400D3 : 0xFFD700;
        const col2    = isAbyss ? 0xC62828 : 0xFFFFFF;
        const alpha   = pb.life;
        const r1      = (1.0 - alpha) * 150;
        const r2      = (1.0 - alpha) * 80;
        // Expanding rings
        _burstGfx.circle(pb.x, pb.y, r1)
                 .stroke({ width: 3, color: col, alpha });
        _burstGfx.circle(pb.x, pb.y, r2)
                 .stroke({ width: 1.5, color: col2, alpha: alpha * 0.6 });
        // 8 star rays radiating outward (rotate as burst expands)
        const rays = 8;
        for (let i = 0; i < rays; i++) {
            const ang = (i / rays) * Math.PI * 2 + (1.0 - pb.life) * Math.PI;
            const ix = pb.x + Math.cos(ang) * r2 * 0.55;
            const iy = pb.y + Math.sin(ang) * r2 * 0.55;
            const ox = pb.x + Math.cos(ang) * (r2 * 0.55 + r1 * 0.38);
            const oy = pb.y + Math.sin(ang) * (r2 * 0.55 + r1 * 0.38);
            _burstGfx.moveTo(ix, iy).lineTo(ox, oy);
        }
        _burstGfx.stroke({ width: 1.5, color: col, alpha: alpha * 0.75 });
    });
}

function spawnPurgeEffect(lx, ly) {
    if (!window.Pools) return;
    const px = lx !== undefined ? lx : (window.LOGICAL_WIDTH / 2);
    const py = ly !== undefined ? ly : (window.LOGICAL_HEIGHT || 1440);
    
    const pe = Pools.purgeEffects.get();
    pe.x = px; pe.y = py; pe.life = 1.0;
    
    if (typeof spawnHitEffect === 'function') {
        spawnHitEffect(px, py, '#fff', 120);
        if (typeof spawnParticles === 'function') {
            spawnParticles(px, py, '#fff', 8);
            spawnParticles(px, py, '#ffd700', 8);
            spawnParticles(px, py, '#00e5ff', 4);
        }
    } else if (typeof spawnParticles === 'function') {
        spawnParticles(px, py, '#fff', 60);
        spawnParticles(px, py, '#ffd700', 40);
        spawnParticles(px, py, '#00e5ff', 20);
    }
    if (typeof spawnGlitchEffect === 'function') spawnGlitchEffect(30);
}

function updatePurgeEffects() {
    if (!window.Pools || !Pools.purgeEffects) return;
    const active = Pools.purgeEffects.active;
    for (let i = active.length - 1; i >= 0; i--) {
        active[i].life -= 0.012;
        if (active[i].life <= 0) Pools.purgeEffects.releaseAt(i);
    }
}

function drawPurgeEffects() {
    _ensureCombatGfx();
    if (!_purgeGfx || !window.Pools) return;
    _purgeGfx.clear();
    Pools.purgeEffects.active.forEach(function(pe) {
        const alpha  = pe.life;
        const radius = (1.0 - alpha) * 1200;
        if (radius < 1) return;

        // 3 expanding rings (white / gold / cyan)
        _purgeGfx.circle(pe.x, pe.y, radius)
                 .stroke({ width: 30 * alpha, color: 0xFFFFFF, alpha: alpha * 0.9 });
        _purgeGfx.circle(pe.x, pe.y, radius * 0.85)
                 .stroke({ width: 10 * alpha, color: 0xFFD700, alpha: alpha * 0.6 });
        _purgeGfx.circle(pe.x, pe.y, radius * 0.7)
                 .stroke({ width: 5 * alpha, color: 0x00E5FF, alpha: alpha * 0.4 });

        // Radial fill (approximate with 5 concentric filled circles)
        for (let s = 0; s < 5; s++) {
            const sr = radius * (0.6 + s * 0.1);
            const sa = alpha * 0.07 * (5 - s) * 0.12;
            if (sa > 0.005) {
                _purgeGfx.circle(pe.x, pe.y, sr)
                         .fill({ color: 0xFFFFFF, alpha: sa });
            }
        }

        // 8 light rays — thin trapezoid polygons radiating outward
        const rays = 8;
        const rLen = radius * 1.5;
        for (let r = 0; r < rays; r++) {
            const ang  = (Math.PI * 2 / rays) * r + (1.0 - alpha);
            const cos  = Math.cos(ang), sin = Math.sin(ang);
            const pCos = -sin, pSin = cos; // perpendicular
            const bw   = 20 * alpha, tw = 5 * alpha;
            _purgeGfx.poly([
                pe.x + pCos * bw,              pe.y + pSin * bw,
                pe.x - pCos * bw,              pe.y - pSin * bw,
                pe.x + cos * rLen - pCos * tw, pe.y + sin * rLen - pSin * tw,
                pe.x + cos * rLen + pCos * tw, pe.y + sin * rLen + pSin * tw,
            ]).fill({ color: 0xFFFFFF, alpha: alpha * 0.35 });
        }
    });
}

function spawnBanishEffect(lx, ly) {
    if (!window.Pools) return;
    const be = Pools.banishEffects.get();
    be.x = lx; be.y = ly; be.life = 1.0;

    if (typeof spawnHitEffect === 'function') {
        spawnHitEffect(lx, ly, '#4A148C', 25);
        if (typeof spawnParticles === 'function') {
            spawnParticles(lx, ly, '#4A148C', 4);
            spawnParticles(lx, ly, '#880000', 2);
        }
    } else if (typeof spawnParticles === 'function') {
        spawnParticles(lx, ly, '#4A148C', 16);
        spawnParticles(lx, ly, '#880000', 8); // blood-red evil taint
    }
}

function updateBanishEffects() {
    if (!window.Pools || !Pools.banishEffects) return;
    const active = Pools.banishEffects.active;
    for (let i = active.length - 1; i >= 0; i--) {
        active[i].life -= 0.02;
        if (active[i].life <= 0) Pools.banishEffects.releaseAt(i);
    }
}

function drawBanishEffects() {
    _ensureCombatGfx();
    if (!_banishGfx || !window.Pools) return;
    _banishGfx.clear();
    Pools.banishEffects.active.forEach(function(be) {
        const expandR = (1.0 - be.life) * 100;
        // Outer purple ring
        _banishGfx.circle(be.x, be.y, expandR)
                  .stroke({ width: 4, color: 0x6A1B9A, alpha: be.life });
        // Mid blood-red ring
        _banishGfx.circle(be.x, be.y, expandR * 0.68)
                  .stroke({ width: 2, color: 0xC62828, alpha: be.life * 0.75 });
        // Inner dark-crimson fill core
        _banishGfx.circle(be.x, be.y, expandR * 0.38)
                  .fill({ color: 0x4A0000, alpha: be.life * 0.18 });
    });
}

function spawnSummonCircle(lx, ly) {
    if (!window.Pools) return;
    const sc = Pools.summonCircles.get();
    sc.x = lx; sc.y = ly; sc.life = 1.0; sc.rot = 0;

    if (typeof spawnHitEffect === 'function') {
        spawnHitEffect(lx, ly, '#ffd700', 35);
        if (typeof spawnParticles === 'function') {
            spawnParticles(lx, ly, '#ffd700', 4);
            spawnParticles(lx, ly, '#fff', 4);
        }
    } else if (typeof spawnParticles    === 'function') { 
        spawnParticles(lx, ly, '#ffd700', 24); 
        spawnParticles(lx, ly, '#fff', 12); 
    }
    if (typeof spawnFloatingText === 'function') spawnFloatingText('\u53ec', lx, ly - 60, '#ffd700', 28);
}

function updateSummonCircles() {
    if (!window.Pools || !Pools.summonCircles) return;
    const active = Pools.summonCircles.active;
    for (let i = active.length - 1; i >= 0; i--) {
        active[i].life -= 0.025; // Faster duration
        active[i].rot  += 0.05;
        if (active[i].life <= 0) Pools.summonCircles.releaseAt(i);
    }
}

function drawSummonCircles() {
    _ensureCombatGfx();
    if (!_summonGfx || !window.Pools) return;
    _summonGfx.clear();
    Pools.summonCircles.active.forEach(function(sc) {
        const x = sc.x, y = sc.y, life = sc.life;
        if (life < 0.01) return;

        // Simplified "Heavenly Pillar" pulse
        const alpha = life;
        const radius = (1.0 - life) * 80;
        const col = 0xFFD700;

        // Expanding ring
        _summonGfx.circle(x, y, radius)
                  .stroke({ width: 2, color: col, alpha });

        // Inner core glow
        _summonGfx.circle(x, y, radius * 0.6)
                  .fill({ color: col, alpha: alpha * 0.3 });

        // Small vertical beam
        const beamH = life * 120;
        const beamW = 10 * life;
        _summonGfx.rect(x - beamW/2, y - beamH, beamW, beamH)
                  .fill({ color: 0xFFFFFF, alpha: alpha * 0.5 });
    });
}

/* ─── Chain lightning bolt VFX (thunder_chain relic) ────────────────────── */
function spawnChainBolt(x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) return;
    const nx = -dy / len, ny = dx / len; // perpendicular unit

    const pts = new Array(CHAIN_SEG_COUNT + 1);
    pts[0] = { x: x1, y: y1 };
    pts[CHAIN_SEG_COUNT] = { x: x2, y: y2 };
    for (let i = 1; i < CHAIN_SEG_COUNT; i++) {
        const t = i / CHAIN_SEG_COUNT;
        const bx = x1 + dx * t;
        const by = y1 + dy * t;
        const j = (Math.random() - 0.5) * 2 * CHAIN_JITTER;
        pts[i] = { x: bx + nx * j, y: by + ny * j };
    }
    _chainBolts.push({ pts, life: 1.0 });
}

function updateChainBolts() {
    for (let i = _chainBolts.length - 1; i >= 0; i--) {
        _chainBolts[i].life -= CHAIN_LIFE_DECAY * (window.dt || 1);
        if (_chainBolts[i].life <= 0) _chainBolts.splice(i, 1);
    }
}

function drawChainBolts() {
    _ensureCombatGfx();
    if (!_chainGfx) return;
    _chainGfx.clear();
    if (_chainBolts.length === 0) return;
    for (let b = 0; b < _chainBolts.length; b++) {
        const bolt = _chainBolts[b];
        const a = Math.max(0, Math.min(1, bolt.life));
        const pts = bolt.pts;
        // Outer wider bolt for glow halo
        _chainGfx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) _chainGfx.lineTo(pts[i].x, pts[i].y);
        _chainGfx.stroke({ width: 5, color: 0x9EC5FF, alpha: a * 0.5 });
        // Inner hot-white core
        _chainGfx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) _chainGfx.lineTo(pts[i].x, pts[i].y);
        _chainGfx.stroke({ width: 2, color: 0xFFFFFF, alpha: a });
        // Endpoint sparks
        _chainGfx.circle(pts[0].x, pts[0].y, 4).fill({ color: 0xFFFFFF, alpha: a });
        const tail = pts[pts.length - 1];
        _chainGfx.circle(tail.x, tail.y, 5).fill({ color: 0x9EC5FF, alpha: a });
    }
}

window.spawnChainBolt        = spawnChainBolt;
window.updateChainBolts      = updateChainBolts;
window.drawChainBolts        = drawChainBolts;

window.spawnProjectile       = spawnProjectile;
window.updateProjectiles     = updateProjectiles;
window.drawProjectiles       = drawProjectiles;
window.spawnPromotionBurst   = spawnPromotionBurst;
window.updatePromotionBursts = updatePromotionBursts;
window.drawPromotionBursts   = drawPromotionBursts;
window.spawnPurgeEffect      = spawnPurgeEffect;
window.updatePurgeEffects    = updatePurgeEffects;
window.drawPurgeEffects      = drawPurgeEffects;
window.spawnBanishEffect     = spawnBanishEffect;
window.updateBanishEffects   = updateBanishEffects;
window.drawBanishEffects     = drawBanishEffects;
window.spawnSummonCircle     = spawnSummonCircle;
window.updateSummonCircles   = updateSummonCircles;
window.drawSummonCircles     = drawSummonCircles;
