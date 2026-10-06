/* i18n.js - Minimal vanilla i18n for Gate of Hell
 *
 * Usage:
 *   t('ui.collections.tab.exorcists')          -> Korean (default)
 *   t('unit.apprentice.name')                  -> looks up nested key
 *   t('missing.key', 'Fallback')               -> uses fallback if key missing
 *   await I18n.setLang('en')                   -> async load + emit 'i18n:changed'
 *   I18n.getLang()                             -> 'ko' | 'en' | 'ja' | 'sch'
 *
 * Key format: dot-separated. Loader supports BOTH flat keys ("a.b.c": "x")
 * and nested objects ({a: {b: {c: "x"}}}) so translators can pick whichever
 * is easier to maintain.
 *
 * Missing-key policy: if a key is missing in the active language, falls back
 * to Korean (source of truth). If missing in both, returns the fallback arg
 * or the key itself (so UI never breaks).
 */

window.I18n = (function () {
    const SUPPORTED = ['ko', 'en', 'ja', 'sch'];
    const DEFAULT_LANG = 'ko';
    const STORAGE_KEY = 'goh.lang';

    let currentLang = DEFAULT_LANG;
    let currentMap = {};
    let fallbackMap = {};

    function _flatten(obj, prefix = '', out = {}) {
        if (obj === null || typeof obj !== 'object') return out;
        for (const k of Object.keys(obj)) {
            const v = obj[k];
            const key = prefix ? `${prefix}.${k}` : k;
            if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
                _flatten(v, key, out);
            } else {
                out[key] = v;
            }
        }
        return out;
    }

    async function _fetchLang(code) {
        try {
            const res = await fetch(`data/i18n/${code}.json`, { cache: 'no-cache' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            return _flatten(json);
        } catch (e) {
            console.warn(`[i18n] Failed to load ${code}.json:`, e);
            return {};
        }
    }

    let _initPromise = null;
    function init() {
        // Idempotent: data_loader.js and script.js both await this.
        return _initPromise || (_initPromise = _init());
    }

    async function _init() {
        const saved = localStorage.getItem(STORAGE_KEY);
        // First visit: index.html's boot script picked a language from navigator.languages.
        const lang = SUPPORTED.includes(saved) ? saved
            : SUPPORTED.includes(window.__bootLang) ? window.__bootLang : DEFAULT_LANG;
        fallbackMap = await _fetchLang(DEFAULT_LANG);
        if (lang === DEFAULT_LANG) {
            currentMap = fallbackMap;
        } else {
            currentMap = await _fetchLang(lang);
        }
        currentLang = lang;
        document.documentElement.setAttribute('lang', lang === 'sch' ? 'zh-Hans' : lang);
        document.title = t('ui.meta.title', document.title);
        if (window.EventBus && typeof window.EventBus.emit === 'function') {
            window.EventBus.emit('i18n:ready', { lang });
        }
    }

    async function setLang(code) {
        if (!SUPPORTED.includes(code)) return;
        if (code === currentLang) return;
        currentMap = (code === DEFAULT_LANG) ? fallbackMap : await _fetchLang(code);
        currentLang = code;
        localStorage.setItem(STORAGE_KEY, code);
        document.documentElement.setAttribute('lang', code === 'sch' ? 'zh-Hans' : code);
        if (window.EventBus && typeof window.EventBus.emit === 'function') {
            window.EventBus.emit('i18n:changed', { lang: code });
        }
    }

    function getLang() { return currentLang; }
    function listLangs() { return SUPPORTED.slice(); }

    function t(key, fallback) {
        if (currentMap[key] !== undefined) return currentMap[key];
        if (fallbackMap[key] !== undefined) return fallbackMap[key];
        return (fallback !== undefined) ? fallback : key;
    }

    /* Convenience for data-driven strings (units, shrines, enemies, relics, equipment) */
    function tUnit(type, field, fallback)   { return t(`unit.${type}.${field}`, fallback); }
    function tShrine(type, field, fallback) { return t(`shrine.${type}.${field}`, fallback); }
    function tEnemy(type, field, fallback)  { return t(`enemy.${type}.${field}`, fallback); }
    function tRelic(id, field, fallback)    { return t(`relic.${id}.${field}`, fallback); }
    function tEquipSlot(slot, field, fallback) { return t(`equip_slot.${slot}.${field}`, fallback); }
    function tEquipTier(tierId, fallback)   { return t(`equip_tier.${tierId}`, fallback); }

    /* Reverse role lookup: raw Korean role string (canonical in allies.json) → translated label */
    let _roleReverse = null;
    function _buildRoleReverse() {
        _roleReverse = { unit: {}, shrine: {} };
        for (const k of Object.keys(fallbackMap)) {
            if (k.startsWith('unit_role.')) {
                const v = fallbackMap[k];
                if (v && !_roleReverse.unit[v]) _roleReverse.unit[v] = k.slice('unit_role.'.length);
            } else if (k.startsWith('shrine_role.')) {
                const v = fallbackMap[k];
                if (v && !_roleReverse.shrine[v]) _roleReverse.shrine[v] = k.slice('shrine_role.'.length);
            }
        }
    }
    function tUnitRole(role) {
        if (!role) return '';
        if (!_roleReverse) _buildRoleReverse();
        const key = _roleReverse.unit[role];
        return key ? t(`unit_role.${key}`, role) : role;
    }
    function tShrineRole(role) {
        if (!role) return '';
        if (!_roleReverse) _buildRoleReverse();
        const key = _roleReverse.shrine[role];
        return key ? t(`shrine_role.${key}`, role) : role;
    }

    return { init, setLang, getLang, listLangs, t, tUnit, tShrine, tEnemy, tRelic, tEquipSlot, tEquipTier, tUnitRole, tShrineRole };
})();

window.t = (key, fallback) => window.I18n.t(key, fallback);
window.tUnit       = (type, field, fallback) => window.I18n.tUnit(type, field, fallback);
window.tShrine     = (type, field, fallback) => window.I18n.tShrine(type, field, fallback);
window.tEnemy      = (type, field, fallback) => window.I18n.tEnemy(type, field, fallback);
window.tRelic      = (id, field, fallback)   => window.I18n.tRelic(id, field, fallback);
window.tEquipSlot  = (slot, field, fallback) => window.I18n.tEquipSlot(slot, field, fallback);
window.tEquipTier  = (tierId, fallback)      => window.I18n.tEquipTier(tierId, fallback);
window.tUnitRole   = (role) => window.I18n.tUnitRole(role);
window.tShrineRole = (role) => window.I18n.tShrineRole(role);
