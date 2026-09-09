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
    });
}
function _ensureParticleGfx() {
    if (_particleGfx || !window.vfxLayer) return;
    _particleGfx = new PIXI.Graphics();
    _particleGfx.blendMode = 'add'; // lighter composite — magic/particle luminosity
    vfxLayer.addChild(_particleGfx);
}

function spawnParticles(x, y, color, count = 12) {
    if (!window.Pools) return;
    for (let i = 0; i < count; i++) {
        const p = Pools.particles.get();
        p.x = x; p.y = y;
        p.vx = (Math.random() - 0.5) * 3;
        p.vy = (Math.random() - 0.5) * 3 - 1;
        p.color = color;
        p.size  = Math.random() * 2 + 1;
        p.life  = 1.0;
        p.decay = 0.008 + Math.random() * 0.012;
    }
}

function updateParticles() {
    if (!window.Pools) return;
    const active = Pools.particles.active;
    for (let i = active.length - 1; i >= 0; i--) {
        const p = active[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) Pools.particles.releaseAt(i);
    }
}

function drawParticles() {
    _ensureParticleGfx();
    if (!_particleGfx || !window.Pools) return;
    _particleGfx.clear();
    Pools.particles.active.forEach(p => {
        _particleGfx
            .rect(Math.floor(p.x), Math.floor(p.y),
                  Math.ceil(p.size), Math.ceil(p.size))
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

function spawnFloatingText(text, lx, ly, color = '#fff', size = 18) {
    if (!window.Pools) return;
    const ft   = Pools.floatingTexts.get();
    ft.text    = text;
    ft.lx      = lx;
    ft.ly      = ly;
    ft.color   = color;
    ft.size    = size;
    ft.life    = 1.0;
    ft.vx      = (Math.random() - 0.5) * 1.5;
    ft.vy      = -1.0 - Math.random() * 1.0;
    ft._pSprite = null;
    if (window.textLayer) {
        const s   = _acquireText(text, color, size);
        s.x       = lx;
        s.y       = ly;
        s.alpha   = 1.0;
        ft._pSprite = s;
        textLayer.addChild(s);
    }
}

function updateFloatingTexts() {
    if (!window.Pools) return;
    const active = Pools.floatingTexts.active;
    for (let i = active.length - 1; i >= 0; i--) {
        const ft = active[i];
        ft.lx += ft.vx;
        ft.ly += ft.vy;
        ft.life -= 0.02;
        if (ft._pSprite) {
            ft._pSprite.x     = ft.lx;
            ft._pSprite.y     = ft.ly;
            ft._pSprite.alpha = Math.max(0, ft.life);
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

// ── Soul Essences (emoji sprites) ─────────────────────────────────────────────
const _sePool = [];

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
        const sp = _sePool.pop() || new PIXI.Text('*', {
            fontFamily: 'Arial', fontSize: 24, fill: 0xFFE066, fontWeight: 'bold',
        });
        sp.anchor.set(0.5, 0.5);
        sp.x   = lx; sp.y = ly;
        s._pSprite = sp;
        vfxLayer.addChild(sp);
    }
}

function updateSoulEssences() {
    if (!window.Pools) return;
    const active = Pools.soulEssences.active;
    for (let i = active.length - 1; i >= 0; i--) {
        const s = active[i];
        s.x += s.vx; s.y += s.vy;
        s.vy += s.gravity;
        s.life -= s.decay;
        s.rotation += s.rotSpeed;
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
    d._pSprite  = null;
    d._isImg    = false;
    if (window.vfxLayer) {
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
    for (let i = active.length - 1; i >= 0; i--) {
        const d = active[i];
        d.x += d.vx; d.y += d.vy;
        d.vy += d.gravity;
        d.life -= d.decay;
        d.rotation += d.rotSpeed;
        if (d._pSprite) {
            d._pSprite.x        = d.x;
            d._pSprite.y        = d.y;
            d._pSprite.rotation = d.rotation;
            d._pSprite.alpha    = Math.min(1.0, d.life * 2);
        }
        if (d.life <= 0) {
            if (d._pSprite) {
                vfxLayer.removeChild(d._pSprite);
                (d._isImg ? _idImgPool : _idTextPool).push(d._pSprite);
                d._pSprite = null;
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
        h.life -= 0.12; // Very fast fade
        h.radius += (h.maxRadius - h.radius) * 0.4;
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

// ── Window Exports ────────────────────────────────────────────────────────────
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