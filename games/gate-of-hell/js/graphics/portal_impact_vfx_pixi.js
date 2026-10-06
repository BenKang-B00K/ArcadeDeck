/* portal_impact_vfx_pixi.js — VFX when enemies reach the portal.
 *
 * Listens for GAME_EVENTS.ENEMY_REACHED_PORTAL. Each impact spawns:
 *   - Expanding purple shockwave ring at impact point
 *   - Sucked-in soul wisp particles converging toward portal center
 *   - Bright flash sprite at portal mouth
 * Boss impacts get bigger ring + more wisps + red tint.
 *
 * All resources pooled. Updates on vfxLayer with additive blend.
 */

const _PI_RING_POOL_MAX   = 12;
const _PI_WISP_POOL_MAX   = 80;
const _PI_FLASH_POOL_MAX  = 8;
const _PI_GLOW_TEX_SIZE   = 96;

let _piContainer    = null;
let _piRingGfx      = null;     // shared Graphics for rings (cleared/redrawn each frame)
let _piWispCt       = null;     // container for wisp sprites
let _piFlashCt      = null;     // container for flash sprites
let _piGlowTex      = null;
let _piRings        = [];       // {x, y, life, maxLife, radiusMax, color, isBoss}
let _piWisps        = [];       // {sprite, x, y, vx, vy, ax, ay, life, maxLife, color}
let _piFlashes      = [];       // {sprite, life, maxLife, color, baseSize}
let _piWispPool     = [];
let _piFlashPool    = [];
let _piInstalled    = false;
let _piHookedEvent  = false;

function _piEnsureGlowTex() {
    if (_piGlowTex) return _piGlowTex;
    const c = document.createElement('canvas');
    c.width = _PI_GLOW_TEX_SIZE; c.height = _PI_GLOW_TEX_SIZE;
    const g = c.getContext('2d');
    const r = _PI_GLOW_TEX_SIZE / 2;
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0,    'rgba(255,255,255,1)');
    grad.addColorStop(0.4,  'rgba(255,255,255,0.5)');
    grad.addColorStop(1,    'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, _PI_GLOW_TEX_SIZE, _PI_GLOW_TEX_SIZE);
    _piGlowTex = PIXI.Texture.from(c);
    return _piGlowTex;
}

function _piAcquireWisp() {
    let s = _piWispPool.pop();
    if (!s) {
        s = new PIXI.Sprite(_piEnsureGlowTex());
        s.anchor.set(0.5, 0.5);
        s.blendMode = 'add';
    }
    s.visible = true;
    _piWispCt.addChild(s);
    return s;
}

function _piReleaseWisp(s) {
    s.visible = false;
    if (s.parent) s.parent.removeChild(s);
    if (_piWispPool.length < _PI_WISP_POOL_MAX) _piWispPool.push(s);
}

function _piAcquireFlash() {
    let s = _piFlashPool.pop();
    if (!s) {
        s = new PIXI.Sprite(_piEnsureGlowTex());
        s.anchor.set(0.5, 0.5);
        s.blendMode = 'add';
    }
    s.visible = true;
    _piFlashCt.addChild(s);
    return s;
}

function _piReleaseFlash(s) {
    s.visible = false;
    if (s.parent) s.parent.removeChild(s);
    if (_piFlashPool.length < _PI_FLASH_POOL_MAX) _piFlashPool.push(s);
}

function _piInstall() {
    if (_piInstalled || !window.vfxLayer || typeof PIXI === 'undefined') return;
    _piContainer = new PIXI.Container();
    _piContainer.blendMode = 'add';

    _piRingGfx = new PIXI.Graphics();
    _piWispCt  = new PIXI.Container();
    _piFlashCt = new PIXI.Container();
    _piContainer.addChild(_piRingGfx);
    _piContainer.addChild(_piFlashCt);
    _piContainer.addChild(_piWispCt);

    window.vfxLayer.addChild(_piContainer);
    _piInstalled = true;
    console.log('[portal_impact_vfx_pixi] installed on vfxLayer.');
}

function _piHookEvent() {
    if (_piHookedEvent || !window.EventBus || !window.GAME_EVENTS) return;
    EventBus.on(GAME_EVENTS.ENEMY_REACHED_PORTAL, spawnPortalImpact);
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        _piContainer = null;
        _piRingGfx = null;
        _piWispCt = null;
        _piFlashCt = null;
        _piRings = [];
        _piWisps = [];
        _piFlashes = [];
        _piWispPool = [];
        _piFlashPool = [];
        _piInstalled = false;
    });
    _piHookedEvent = true;
}

function spawnPortalImpact(data) {
    if (!data) return;
    _piInstall();
    _piHookEvent();
    if (!_piInstalled) return;

    const W = window.LOGICAL_WIDTH  || 1080;
    const H = window.LOGICAL_HEIGHT || 1440;
    const px = data.lx;
    const py = data.ly !== undefined ? data.ly : H;
    const isBoss = !!data.isBoss;

    // Portal mouth: bottom-center
    const portalX = W / 2;
    const portalY = H - 8;

    const color = isBoss ? 0xFF3344 : 0xB066FF;
    const ringRadius = isBoss ? 180 : 110;

    // Shockwave ring at impact point
    _piRings.push({
        x: px,
        y: py,
        life: 40,
        maxLife: 40,
        radiusMax: ringRadius,
        color,
        isBoss,
    });

    // Flash at portal mouth
    if (_piFlashes.length < _PI_FLASH_POOL_MAX) {
        const fs = _piAcquireFlash();
        fs.tint = color;
        const baseSize = isBoss ? 260 : 160;
        fs.width = fs.height = baseSize;
        fs.x = portalX;
        fs.y = portalY;
        fs.alpha = 0;
        _piFlashes.push({ sprite: fs, life: 28, maxLife: 28, color, baseSize });
    }

    // Sucked-in wisps converging toward portal
    const wispCount = isBoss ? 16 : 8;
    for (let i = 0; i < wispCount; i++) {
        if (_piWisps.length >= _PI_WISP_POOL_MAX) break;
        const angle = Math.random() * Math.PI * 2;
        const spread = 30 + Math.random() * 40;
        const sx = px + Math.cos(angle) * spread;
        const sy = py + Math.sin(angle) * spread * 0.5 - 10;
        const ws = _piAcquireWisp();
        ws.tint = color;
        const sz = 14 + Math.random() * 10;
        ws.width = ws.height = sz;
        ws.x = sx;
        ws.y = sy;
        ws.alpha = 0.9;
        _piWisps.push({
            sprite: ws,
            x: sx, y: sy,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            tx: portalX,
            ty: portalY - 20,
            life: 35 + Math.random() * 15,
            maxLife: 50,
            baseSize: sz,
        });
    }
}

function updatePortalImpactVfx() {
    _piHookEvent();
    if (!_piInstalled) return;
    const dt = window.dt || 1;

    // Rings
    _piRingGfx.clear();
    for (let i = _piRings.length - 1; i >= 0; i--) {
        const r = _piRings[i];
        r.life -= dt;
        if (r.life <= 0) { _piRings.splice(i, 1); continue; }
        const k = 1 - r.life / r.maxLife;          // 0 → 1 over lifetime
        const radius = r.radiusMax * k;
        const alpha = (1 - k) * 0.85;
        _piRingGfx.circle(r.x, r.y, radius)
                  .stroke({ color: r.color, alpha, width: r.isBoss ? 5 : 3 });
        // Inner halo
        _piRingGfx.circle(r.x, r.y, radius * 0.6)
                  .stroke({ color: 0xFFFFFF, alpha: alpha * 0.35, width: 2 });
    }

    // Flashes
    for (let i = _piFlashes.length - 1; i >= 0; i--) {
        const f = _piFlashes[i];
        f.life -= dt;
        if (f.life <= 0) { _piReleaseFlash(f.sprite); _piFlashes.splice(i, 1); continue; }
        const k = f.life / f.maxLife;              // 1 → 0
        const fade = Math.sin(k * Math.PI);        // peak mid-life
        f.sprite.alpha = fade * 0.9;
        f.sprite.width = f.sprite.height = f.baseSize * (0.8 + (1 - k) * 0.5);
    }

    // Wisps — accelerate toward portal then fade.
    for (let i = _piWisps.length - 1; i >= 0; i--) {
        const w = _piWisps[i];
        w.life -= dt;
        if (w.life <= 0) {
            _piReleaseWisp(w.sprite);
            _piWisps.splice(i, 1);
            continue;
        }
        // Acceleration toward target (portal mouth)
        const dx = w.tx - w.x;
        const dy = w.ty - w.y;
        const dist = Math.hypot(dx, dy) || 1;
        const pull = 0.35;
        w.vx += (dx / dist) * pull * dt;
        w.vy += (dy / dist) * pull * dt;
        // Drag
        const drag = Math.pow(0.96, dt);
        w.vx *= drag;
        w.vy *= drag;
        w.x += w.vx * dt;
        w.y += w.vy * dt;

        const k = w.life / w.maxLife;
        const sp = w.sprite;
        sp.x = w.x;
        sp.y = w.y;
        sp.alpha = Math.min(1, k * 1.4) * 0.9;
        // Shrink as they get absorbed
        const shrink = Math.max(0.3, dist / 120);
        sp.width = sp.height = w.baseSize * shrink;
    }
}

window.spawnPortalImpact     = spawnPortalImpact;
window.updatePortalImpactVfx = updatePortalImpactVfx;
