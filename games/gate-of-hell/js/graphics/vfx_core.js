/* vfx_core.js — Core VFX: Particles, Floating Texts, Soul Essences, Item Drops
 * Rendering: PIXI.Graphics (particles), SVG-rasterized PIXI.Sprite pool (floating texts),
 *            PIXI.Text pools (souls/drops).
 */

// ── Particle Graphics (single PIXI.Graphics, redrawn each frame) ─────────────
let _particleGfx = null;

if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        _particleGfx = null;
        // Text pools declared further down — safe by reset time (after init).
        _ftSpritePool.length = 0;
        _ftTextureCache.forEach(t => { try { t.destroy(true); } catch (e) {} });
        _ftTextureCache.clear();
        _sePool.length = 0;
        _idTextPool.length = 0;
        _idImgPool.length = 0;
        _idGlowPool.length = 0;
    });
}
function _ensureParticleGfx() {
    if (_particleGfx || !window.vfxLayer) return;
    _particleGfx = new PIXI.Graphics();
    _particleGfx.blendMode = 'add'; // lighter composite — magic/particle luminosity
    vfxLayer.addChild(_particleGfx);
}

function spawnParticles(x, y, color, count = 12, opts) {
    if (!window.Pools) return;
    const speed   = (opts && opts.speed)    !== undefined ? opts.speed    : 2.2;
    const gravity = (opts && opts.gravity)  !== undefined ? opts.gravity  : 0.05;
    const friction= (opts && opts.friction) !== undefined ? opts.friction : 0.95;
    const sizeMax = (opts && opts.size)     !== undefined ? opts.size     : 3;
    for (let i = 0; i < count; i++) {
        const p   = Pools.particles.get();
        const ang = Math.random() * Math.PI * 2;
        const spd = speed * (0.4 + Math.random() * 0.9);
        p.x = x; p.y = y;
        p.vx = Math.cos(ang) * spd;
        p.vy = Math.sin(ang) * spd - speed * 0.4; // slight upward bias
        p.g  = gravity;
        p.fr = friction;
        p.color = color;
        p.size  = Math.random() * (sizeMax - 1) + 1;
        p.life  = 1.0;
        p.decay = 0.012 + Math.random() * 0.018;
    }
}

function updateParticles() {
    if (!window.Pools) return;
    const d = window.dt || 1;
    const active = Pools.particles.active;
    for (let i = active.length - 1; i >= 0; i--) {
        const p = active[i];
        p.x += p.vx * d; p.y += p.vy * d;
        p.vy += (p.g || 0) * d;
        const fr = Math.pow(p.fr || 1, d);
        p.vx *= fr; p.vy *= fr;
        p.life -= p.decay * d;
        if (p.life <= 0) Pools.particles.releaseAt(i);
    }
}

function drawParticles() {
    _ensureParticleGfx();
    if (!_particleGfx || !window.Pools) return;
    _particleGfx.clear();
    Pools.particles.active.forEach(p => {
        const sz = Math.max(1, Math.ceil(p.size * (0.4 + p.life * 0.6))); // shrink as it dies
        _particleGfx
            .rect(Math.floor(p.x), Math.floor(p.y), sz, sz)
            .fill({ color: cssColorToHex(p.color), alpha: Math.max(0, p.life) });
    });
}

// ── Floating Text Pool (SVG-rasterized sprites) ─────────────────────────────
const _ftSpritePool   = [];
const _ftTextureCache = new Map(); // key: `${text}|${color}|${size}` → PIXI.Texture
const _ftMeasureCtx   = (typeof document !== 'undefined')
    ? document.createElement('canvas').getContext('2d')
    : null;

function _buildFloatingTextTexture(text, color, size) {
    const key = `${text}|${color}|${size}`;
    const cached = _ftTextureCache.get(key);
    if (cached) return cached;

    const fontFamily = 'Arial';
    const fontWeight = 'bold';
    const pad        = Math.ceil(size * 0.4);   // room for stroke + descenders
    const stroke     = Math.max(2, Math.floor(size / 8));

    // Measure via 2d ctx so the SVG viewport matches the glyph extents.
    let textW = size * String(text).length * 0.6;
    if (_ftMeasureCtx) {
        _ftMeasureCtx.font = `${fontWeight} ${size}px ${fontFamily}`;
        textW = _ftMeasureCtx.measureText(String(text)).width;
    }
    const w = Math.ceil(textW) + pad * 2;
    const h = Math.ceil(size * 1.4) + pad * 2;
    const cx = w / 2;
    const cy = h / 2 + size * 0.35; // baseline nudge

    const safeText = String(text)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
            `<text x="${cx}" y="${cy}" text-anchor="middle" ` +
                  `font-family="${fontFamily}" font-weight="${fontWeight}" font-size="${size}" ` +
                  `fill="${color}" stroke="#000" stroke-width="${stroke}" ` +
                  `paint-order="stroke fill">${safeText}</text>` +
        `</svg>`;

    const canvas = document.createElement('canvas');
    canvas.width  = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    const texture = PIXI.Texture.from(canvas);

    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0);
        if (texture.source && typeof texture.source.update === 'function') {
            texture.source.update();
        } else if (typeof texture.update === 'function') {
            texture.update();
        }
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

    _ftTextureCache.set(key, texture);
    return texture;
}

function _acquireText(text, color, size) {
    const tex = _buildFloatingTextTexture(text, color, size);
    const s = _ftSpritePool.pop() || new PIXI.Sprite(tex);
    s.texture = tex;
    s.anchor.set(0.5, 0.5);
    return s;
}

function spawnFloatingText(text, lx, ly, color = '#fff', size = 18, opts) {
    if (!window.Pools) return;
    const punch = (opts && opts.punch) || 1.0;   // >1 = harder pop-in (crits)
    const ft   = Pools.floatingTexts.get();
    ft.text    = text;
    ft.lx      = lx;
    ft.ly      = ly;
    ft.color   = color;
    ft.size    = size;
    ft.life    = 1.0;
    ft.age     = 0;
    ft.punch   = punch;
    ft.vx      = (Math.random() - 0.5) * 2.0;
    ft.vy      = -2.4 - Math.random() * 1.2;     // launch up, gravity pulls into an arc
    ft.rot     = (Math.random() - 0.5) * 0.25 * (punch - 0.5);
    ft._pSprite = null;
    if (window.textLayer) {
        const s   = _acquireText(text, color, size);
        s.x       = lx;
        s.y       = ly;
        s.alpha   = 1.0;
        s.rotation = 0;
        s.scale.set(0.2);
        ft._pSprite = s;
        textLayer.addChild(s);
    }
}

function updateFloatingTexts() {
    if (!window.Pools) return;
    const d = window.dt || 1;
    const active = Pools.floatingTexts.active;
    for (let i = active.length - 1; i >= 0; i--) {
        const ft = active[i];
        ft.age  += d;
        ft.lx   += ft.vx * d;
        ft.ly   += ft.vy * d;
        ft.vy   += 0.08 * d;                       // gravity → arc
        ft.vx   *= Math.pow(0.97, d);
        ft.life -= 0.018 * d;
        if (ft._pSprite) {
            const sp = ft._pSprite;
            sp.x = ft.lx;
            sp.y = ft.ly;
            // pop-in: overshoot to punch*1.5 over ~6 frames, settle to 1
            const t  = Math.min(1, ft.age / 6);
            const ov = ft.punch * 1.5;
            const sc = t < 0.6 ? 0.2 + (ov - 0.2) * (t / 0.6) : ov + (1 - ov) * ((t - 0.6) / 0.4);
            sp.scale.set(sc);
            sp.rotation = ft.rot * (1 - t);
            // hold full alpha, fade over last 40%
            sp.alpha = ft.life > 0.4 ? 1 : Math.max(0, ft.life / 0.4);
        }
        if (ft.life <= 0) {
            if (ft._pSprite) {
                textLayer.removeChild(ft._pSprite);
                _ftSpritePool.push(ft._pSprite);
                ft._pSprite = null;
            }
            Pools.floatingTexts.releaseAt(i);
        }
    }
}

// drawFloatingTexts is now a no-op — handled in updateFloatingTexts
function drawFloatingTexts() {}

// ── Soul Essences (additive pixel sparkles) ──────────────────────────────────
const _sePool = [];
// One shared 4-point pixel star (was an Arial '*' PIXI.Text per kill).
// Survives pixiReset: resetPixiScene keeps textures.
let _seTex = null;
function _soulTex() {
    if (_seTex) return _seTex;
    const g = new PIXI.Graphics()
        .rect(-2, -9, 4, 18).rect(-9, -2, 18, 4).fill(0xFFE066)
        .rect(-4, -4, 8, 8).fill(0xFFF4C2)
        .rect(-2, -2, 4, 4).fill(0xFFFFFF);
    _seTex = pixiApp.renderer.generateTexture(g);
    _seTex.source.scaleMode = 'nearest';
    g.destroy();
    return _seTex;
}

function spawnSoulEssence(lx, ly) {
    if (!window.Pools) return;
    const s      = Pools.soulEssences.get();
    const side   = Math.random() < 0.5 ? -1 : 1;
    s.x          = lx;
    s.y          = ly;
    s.vx         = side * (Math.random() * 1.5 + 0.5);
    s.vy         = -4.5 - Math.random() * 2;
    s.gravity    = 0.25;
    s.life       = 1.0;
    s.decay      = 0.005 + Math.random() * 0.007;
    s.rotation   = Math.random() * Math.PI * 2;
    s.rotSpeed   = (Math.random() - 0.5) * 0.2;
    s._pSprite   = null;
    if (window.vfxLayer) {
        let sp = _sePool.pop();
        if (!sp) {
            sp = new PIXI.Sprite(_soulTex());
            sp.blendMode = 'add'; // holy light: lighter composite
        }
        sp.anchor.set(0.5, 0.5);
        sp.x   = lx; sp.y = ly;
        s._pSprite = sp;
        vfxLayer.addChild(sp);
    }
}

function updateSoulEssences() {
    if (!window.Pools) return;
    const active = Pools.soulEssences.active;
    const d = window.dt || 1;
    for (let i = active.length - 1; i >= 0; i--) {
        const s = active[i];
        s.x += s.vx * d; s.y += s.vy * d;
        s.vy += s.gravity * d;
        s.life -= s.decay * d;
        s.rotation += s.rotSpeed * d;
        if (s._pSprite) {
            s._pSprite.x        = s.x;
            s._pSprite.y        = s.y;
            s._pSprite.rotation = s.rotation;
            s._pSprite.alpha    = Math.max(0, s.life);
            s._pSprite.scale.set(0.6 + s.life * 0.6);
        }
        if (s.life <= 0) {
            if (s._pSprite) {
                vfxLayer.removeChild(s._pSprite);
                _sePool.push(s._pSprite);
                s._pSprite = null;
            }
            Pools.soulEssences.releaseAt(i);
        }
    }
}

// drawSoulEssences is now a no-op — handled in updateSoulEssences
function drawSoulEssences() {}

// ── Item Drops (emoji text OR image sprite) ──────────────────────────────────
const _idTextPool = [];
const _idImgPool  = [];
const _idGlowPool = [];

// Rarity halo behind each drop: one shared soft radial texture, tinted per drop
// (cyan = equipment, orange = relic). Survives pixiReset like the soul sparkle.
let _idGlowTex = null;
function _dropGlowTex() {
    if (_idGlowTex) return _idGlowTex;
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    _idGlowTex = PIXI.Texture.from(c);
    return _idGlowTex;
}

function spawnItemDrop(lx, ly, icon, shadowColor = '#ffd700') {
    if (!window.Pools) return;
    const d     = Pools.itemDrops.get();
    const side  = Math.random() < 0.5 ? -1 : 1;
    d.x         = lx; d.y       = ly;
    d.vx        = side * (Math.random() * 1.0 + 0.5);
    d.vy        = -6.0 - Math.random() * 2;
    d.gravity   = 0.2;
    d.life      = 1.0;
    d.decay     = 0.008 + Math.random() * 0.005;
    d.rotation  = 0;
    d.rotSpeed  = (Math.random() - 0.5) * 0.15;
    d.icon      = icon;
    d.shadowColor = shadowColor;
    d._pSprite  = null;
    d._glow     = null;
    d._isImg    = false;
    if (window.vfxLayer) {
        let glow = _idGlowPool.pop();
        if (!glow) {
            glow = new PIXI.Sprite(_dropGlowTex());
            glow.anchor.set(0.5, 0.5);
            glow.blendMode = 'add'; // magic loot: lighter composite
        }
        glow.tint = (typeof cssColorToHex === 'function') ? cssColorToHex(shadowColor) : 0xFFD700;
        glow.width = glow.height = 72;
        glow.x = lx; glow.y = ly;
        d._glow = glow;
        vfxLayer.addChild(glow); // added before the item sprite → sits behind it

        const isImg = typeof icon === 'string' && (icon.includes('/') || icon.endsWith('.webp') || icon.endsWith('.png'));
        let sp;
        if (isImg) {
            sp = _idImgPool.pop();
            if (!sp) {
                sp = PIXI.Sprite.from(icon);
                sp.anchor.set(0.5, 0.5);
                sp.width = 32; sp.height = 32;
            } else {
                sp.texture = PIXI.Texture.from(icon);
            }
            d._isImg = true;
        } else {
            sp = _idTextPool.pop() || new PIXI.Text('', { fontFamily: 'Arial', fontSize: 28 });
            sp.text = icon;
            sp.anchor.set(0.5, 0.5);
        }
        sp.x = lx; sp.y = ly;
        d._pSprite = sp;
        vfxLayer.addChild(sp);
    }
}

function updateItemDrops() {
    if (!window.Pools) return;
    const active = Pools.itemDrops.active;
    const k = window.dt || 1;
    for (let i = active.length - 1; i >= 0; i--) {
        const d = active[i];
        d.x += d.vx * k; d.y += d.vy * k;
        d.vy += d.gravity * k;
        d.life -= d.decay * k;
        d.rotation += d.rotSpeed * k;
        if (d._pSprite) {
            d._pSprite.x        = d.x;
            d._pSprite.y        = d.y;
            d._pSprite.rotation = d.rotation;
            d._pSprite.alpha    = Math.min(1.0, d.life * 2);
        }
        if (d._glow) {
            d._glow.x = d.x;
            d._glow.y = d.y;
            // Shimmer ~1.5 Hz (life drains ~0.65/s), fading out with the drop.
            d._glow.alpha = Math.min(1.0, d.life * 2) * (0.55 + 0.2 * Math.sin(d.life * 14));
        }
        if (d.life <= 0) {
            if (d._pSprite) {
                vfxLayer.removeChild(d._pSprite);
                (d._isImg ? _idImgPool : _idTextPool).push(d._pSprite);
                d._pSprite = null;
            }
            if (d._glow) {
                vfxLayer.removeChild(d._glow);
                _idGlowPool.push(d._glow);
                d._glow = null;
            }
            Pools.itemDrops.releaseAt(i);
        }
    }
}

// drawItemDrops is now a no-op — handled in updateItemDrops
function drawItemDrops() {}

// ── Hit Effects (Expanding ring - Low Lag) ───────────────────────────────────
function spawnHitEffect(lx, ly, color = '#fff', maxRadius = 15) {
    if (!window.Pools) return;
    const h     = Pools.hitEffects.get();
    h.x         = lx;
    h.y         = ly;
    h.color     = color;
    h.life      = 1.0;
    h.radius    = 2;
    h.maxRadius = maxRadius;
}

function updateHitEffects() {
    if (!window.Pools) return;
    const active = Pools.hitEffects.active;
    for (let i = active.length - 1; i >= 0; i--) {
        const h = active[i];
        const d = window.dt || 1;
        h.life -= 0.12 * d; // Very fast fade
        h.radius += (h.maxRadius - h.radius) * Math.min(1, 0.4 * d);
        if (h.life <= 0) Pools.hitEffects.releaseAt(i);
    }
}

function drawHitEffects() {
    _ensureParticleGfx(); // Reuse the same PIXI.Graphics for efficiency
    if (!_particleGfx || !window.Pools) return;
    // Note: Clear is called in drawParticles, so hit effects draw atop them
    Pools.hitEffects.active.forEach(h => {
        _particleGfx
            .circle(Math.floor(h.x), Math.floor(h.y), h.radius)
            .stroke({ width: 1.5, color: cssColorToHex(h.color), alpha: Math.max(0, h.life) });
    });
}

// ── Death Burst (enemy kill) ─────────────────────────────────────────────────
function spawnDeathBurst(lx, ly, isBoss) {
    const k = isBoss ? 3 : 1;
    spawnHitEffect(lx, ly, '#fff', isBoss ? 90 : 28);
    spawnHitEffect(lx, ly, isBoss ? '#ff1744' : '#9400d3', isBoss ? 60 : 18);
    // Evil theme: purple/crimson debris + white sparks
    spawnParticles(lx, ly, '#9400d3', 8 * k, { speed: 3.2, size: 4 });
    spawnParticles(lx, ly, '#c62828', 5 * k, { speed: 2.4, size: 3 });
    spawnParticles(lx, ly, '#ffffff', 4 * k, { speed: 4.5, size: 2, gravity: 0.02 });
    if (isBoss) addScreenShake(14);
}

// ── Screen Shake (offsets pixi stage; DOM HUD unaffected) ────────────────────
let _shake = 0;
function addScreenShake(amount) { _shake = Math.min(24, Math.max(_shake, amount)); }
function applyScreenShake() {
    if (!window.pixiApp || !pixiApp.stage) return;
    if (_shake < 0.3) { _shake = 0; pixiApp.stage.position.set(0, 0); return; }
    // Whole-pixel offsets only — a fractional stage position pushes every
    // sprite off the texel grid and undoes their roundPixels snapping.
    pixiApp.stage.position.set(Math.round((Math.random() - 0.5) * 2 * _shake),
                               Math.round((Math.random() - 0.5) * 2 * _shake));
    _shake *= Math.pow(0.82, window.dt || 1);
}

// ── Window Exports ────────────────────────────────────────────────────────────
window.spawnDeathBurst    = spawnDeathBurst;
window.addScreenShake     = addScreenShake;
window.applyScreenShake   = applyScreenShake;
window.spawnParticles     = spawnParticles;
window.updateParticles    = updateParticles;
window.drawParticles      = drawParticles;
window.spawnHitEffect     = spawnHitEffect;
window.updateHitEffects   = updateHitEffects;
window.drawHitEffects     = drawHitEffects;
window.spawnFloatingText  = spawnFloatingText;
window.updateFloatingTexts = updateFloatingTexts;
window.drawFloatingTexts  = drawFloatingTexts;
window.spawnSoulEssence   = spawnSoulEssence;
window.updateSoulEssences = updateSoulEssences;
window.drawSoulEssences   = drawSoulEssences;
window.spawnItemDrop      = spawnItemDrop;
window.updateItemDrops    = updateItemDrops;
window.drawItemDrops      = drawItemDrops;