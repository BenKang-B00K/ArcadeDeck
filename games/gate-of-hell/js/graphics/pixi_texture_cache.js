/* pixi_texture_cache.js — Pixel Art Texture Cache for PIXI.Sprites (Phase 3) */

const _pixiTexCache = new Map();

/**
 * Returns a cached PIXI.Texture for the given type/category.
 * On first call, renders via createPixelCanvas (offscreen Canvas 2D) and caches.
 * @param {string} type     - Unit/enemy/shrine type identifier
 * @param {string} category - 'unit' | 'enemy' | 'shrine'
 * @param {string} [key=''] - Extra cache discriminator (e.g. 'left', 'attack')
 * @returns {PIXI.Texture}
 */
function getPixiTexture(type, category, key = '') {
    const cacheKey = `${category}|${type}|${key}`;
    if (_pixiTexCache.has(cacheKey)) return _pixiTexCache.get(cacheKey);

    const size = (category === 'shrine' || String(type).includes('boss')) ? 120 : 80;
    const offscreen = (typeof createPixelCanvas === 'function')
        ? createPixelCanvas(type, category, size)
        : null;

    if (!offscreen) return PIXI.Texture.WHITE;

    const tex = PIXI.Texture.from(offscreen);
    _pixiTexCache.set(cacheKey, tex);
    return tex;
}

/**
 * Invalidates a cached texture so it is re-generated on next request.
 * Call after a unit promotes or changes visual state.
 */
function invalidatePixiTexture(type, category, key = '') {
    const cacheKey = `${category}|${type}|${key}`;
    const tex = _pixiTexCache.get(cacheKey);
    if (tex) { tex.destroy(true); _pixiTexCache.delete(cacheKey); }
}

/** Clears the entire texture cache and frees GPU memory. */
function clearPixiTextureCache() {
    _pixiTexCache.forEach(tex => tex.destroy(true));
    _pixiTexCache.clear();
}

window.getPixiTexture        = getPixiTexture;
window.invalidatePixiTexture = invalidatePixiTexture;
window.clearPixiTextureCache = clearPixiTextureCache;