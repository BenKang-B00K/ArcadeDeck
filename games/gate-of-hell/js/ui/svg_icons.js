/* svg_icons.js — Inline SVG icon registry replacing emoji usage.
   All icons use currentColor + viewBox 0 0 24 24 so they scale and inherit text color.
   Aesthetic: blocky / pixel-friendly silhouettes to match the game's pixel-art theme. */

(function () {
    const ICONS = {
        // ── Resources / gauges ────────────────────────────────────────────
        spark: '<path d="M12 2 L13 9 L20 10 L13 13 L14 22 L12 17 L10 22 L11 13 L4 10 L11 9 Z"/>',
        skull: '<path d="M6 3h12v3h2v9h-3v3h-2v3h-2v-3h-2v3h-2v-3H7v-3H4V6h2zM9 9v3h2V9zm4 0v3h2V9z"/>',
        demon_face: '<path d="M4 4l3 4 5-3 5 3 3-4-1 7 2 5-3 1-1 4-3-3h-4l-3 3-1-4-3-1 2-5zm5 8v2h2v-2zm4 0v2h2v-2z"/>',

        // ── Buttons / categories ──────────────────────────────────────────
        mage: '<path d="M11 2l-3 5h6zM8 8l-2 7h12l-2-7zm-1 8v3h2v3h6v-3h2v-3z"/>',
        shrine: '<path d="M11 2l-1 3h4l-1-3zM7 6h10v2h1v12h-4v-5h-4v5H6V8h1zm3 4v2h4v-2z"/>',
        flame: '<path d="M12 2c0 4-5 5-5 10a5 5 0 0010 0c0-3-2-4-2-7 0 2-3 3-3-3zm0 11a2 2 0 100 4 2 2 0 000-4z"/>',
        urn: '<path d="M9 2h6v2h2v3l-1 1 1 2v8a3 3 0 01-3 3h-4a3 3 0 01-3-3v-8l1-2-1-1V4h2zm1 8v6h4v-6z"/>',
        sword: '<path d="M3 21l3-1 10-10-2-2L4 18zm12-12l5-5-1-1-5 5zm-2 8l4 4 1-1-4-4z"/>',
        book: '<path d="M4 4h7v16H6a2 2 0 01-2-2zm9 0h7v14a2 2 0 01-2 2h-5zM6 8v2h3V8zm9 0v2h3V8z"/>',

        // ── Modal / system ───────────────────────────────────────────────
        warning: '<path d="M12 2L1 21h22zm-1 6h2v7h-2zm0 9h2v2h-2z"/>',
        gear: '<path d="M11 1h2l1 3 2 1 3-1 1 2-2 2 1 2 3 1v2l-3 1-1 2 2 2-1 2-3-1-2 1-1 3h-2l-1-3-2-1-3 1-1-2 2-2-1-2-3-1v-2l3-1 1-2-2-2 1-2 3 1 2-1zm1 6a5 5 0 100 10 5 5 0 000-10z"/>',
        hourglass: '<path d="M5 2h14v2l-5 6 5 6v2H5v-2l5-6-5-6zm3 2v1l4 5 4-5V4zm0 16h8v-1l-4-3-4 3z"/>',
        candle: '<path d="M12 2c0 3-3 3-3 6 0 1 1 2 3 2s3-1 3-2c0-3-3-3-3-6zm-2 10h4v8h-4z"/>',
        scroll: '<path d="M4 4h13a3 3 0 013 3v10a3 3 0 01-3 3H4a2 2 0 002-2V6a2 2 0 00-2-2zm3 4v2h8V8zm0 4v2h6v-2z"/>',
        refresh: '<path d="M12 3a9 9 0 109 9h-2a7 7 0 11-2-5l-3 3h7V3l-3 3a9 9 0 00-6-3z"/>',
        close_x: '<path d="M5 5l2-2 5 5 5-5 2 2-5 5 5 5-2 2-5-5-5 5-2-2 5-5z"/>',
        new_badge: '<path d="M4 6h3l3 6V6h3v12h-3l-3-6v6H4zm12 0h5v3h-3v1h2v3h-2v1h3v3h-5z"/>',
        sparkle: '<path d="M12 3l1 6 6 1-6 1-1 6-1-6-6-1 6-1zM4 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1zm15 13l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>',

        // ── Combat / stats ───────────────────────────────────────────────
        heart: '<path d="M12 21l-9-9a5 5 0 017-7l2 2 2-2a5 5 0 017 7z"/>',
        shield: '<path d="M12 2l8 3v7c0 5-3 8-8 10-5-2-8-5-8-10V5z"/>',
        arrow_right: '<path d="M4 11h12V8l5 4-5 4v-3H4z"/>',
        chain: '<path d="M8 2h4v3H9v6h3v3H8a3 3 0 01-3-3V5a3 3 0 013-3zm5 14h-1v-3h4a3 3 0 003-3V5a3 3 0 00-3-3h-4v3h3v6h-3z M9 11h6v2H9z"/>',
        cross: '<path d="M10 2h4v6h6v4h-6v10h-4V12H4V8h6z"/>',
        target: '<path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 3a7 7 0 110 14 7 7 0 010-14zm0 3a4 4 0 100 8 4 4 0 000-8zm0 3a1 1 0 110 2 1 1 0 010-2z"/>',
        wrench: '<path d="M14 2a6 6 0 016 6 6 6 0 01-8 6L4 22l-2-2 8-8a6 6 0 014-10zm0 3a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3z"/>',
        broadcast: '<path d="M12 9a2 2 0 100 4 2 2 0 000-4zM8 6l-1.5-1.5A8 8 0 004 11a8 8 0 002.5 5.5L8 15a6 6 0 01-2-4 6 6 0 012-4zm8 0a6 6 0 012 4 6 6 0 01-2 4l1.5 1.5A8 8 0 0020 11a8 8 0 00-2.5-6.5z"/>',
        ring: '<path d="M12 4a7 7 0 100 14 7 7 0 000-14zm0 3a4 4 0 110 8 4 4 0 010-8zm0-5l2 3-2 1-2-1z"/>',
        crown: '<path d="M2 8l4 3 3-6 3 6 3-6 3 6 4-3-2 10H4zM4 20h16v2H4z"/>',
        dice: '<path d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm3 4v2h2V7zm6 0v2h2V7zm-3 4v2h2v-2zm-3 4v2h2v-2zm6 0v2h2v-2z"/>',
        location_pin: '<path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7zm0 4a3 3 0 100 6 3 3 0 000-6z"/>',
        globe: '<path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2c1 0 3 3 3 8s-2 8-3 8-3-3-3-8 2-8 3-8zM4 12h16M12 4v16"/>',
        antenna: '<path d="M12 2a4 4 0 00-4 4l4 14 4-14a4 4 0 00-4-4zm0 3a1 1 0 110 2 1 1 0 010-2z"/>',
        statue: '<path d="M8 2h8l-1 4h-6zM9 7h6v3h2v8H7v-8h2zm-2 12h10v3H7z"/>',
        moon_dark: '<path d="M14 2A10 10 0 0010 22a10 10 0 010-20z"/>',
        crescent: '<path d="M16 3a9 9 0 100 18 7 7 0 010-18z"/>',
        ghost: '<path d="M6 9a6 6 0 0112 0v10l-2-2-2 2-2-2-2 2-2-2-2 2zm3 3v2h2v-2zm4 0v2h2v-2z"/>',
        portal: '<path d="M12 2a4 10 0 100 20 4 10 0 000-20zm0 3a2 7 0 110 14 2 7 0 010-14z"/>',

        // ── Generic placeholders for entity icons (data fallback) ────────
        ally_placeholder: '<path d="M12 3a4 4 0 100 8 4 4 0 000-8zm-6 18a6 6 0 0112 0z"/>',
        enemy_placeholder: '<path d="M4 6l4-2 4 2 4-2 4 2v6a8 8 0 01-16 0zm5 4v2h2v-2zm6 0v2h2v-2z"/>',
        relic_placeholder: '<path d="M9 2h6v2h2v3l-1 1 1 2v8a3 3 0 01-3 3h-4a3 3 0 01-3-3v-8l1-2-1-1V4h2z"/>',
        equip_placeholder: '<path d="M3 21l3-1 10-10-2-2L4 18zm12-12l5-5-1-1-5 5z"/>',
        question: '<path d="M12 2a8 8 0 00-8 8h3a5 5 0 1110 0c0 3-4 3-4 7h-2v-2c0-3 4-4 4-5a3 3 0 10-6 0H5a8 8 0 0119 0c0 4-5 4-5 8h-4c0-5 5-4 5-7a5 5 0 00-8-4zm-1 17v2h2v-2z"/>',
    };

    // Emoji → icon key map for migrations
    const EMOJI_MAP = {
        '✨': 'spark', '💀': 'skull', '👿': 'demon_face', '🗿': 'statue',
        '🌑': 'moon_dark', '🌟': 'sparkle', '🌌': 'sparkle',
        '🧙': 'mage', '🕍': 'shrine', '🔥': 'flame', '🏺': 'urn',
        '⚔️': 'sword', '⚔': 'sword', '🗡️': 'sword',
        '📖': 'book', '📜': 'scroll', '📿': 'chain',
        '⚠️': 'warning', '⚠': 'warning', '⚙️': 'gear',
        '⏳': 'hourglass', '🕯️': 'candle', '🔄': 'refresh',
        '🆕': 'new_badge', '🆙': 'sparkle', '❌': 'close_x', '❓': 'question',
        '♥': 'heart', '❤': 'heart', '🛡': 'shield', '🛡️': 'shield',
        '➤': 'arrow_right', '✠': 'cross', '✝️': 'cross', '✦': 'sparkle',
        '⛓': 'chain', '⛓️': 'chain', '🎯': 'target', '🔧': 'wrench',
        '📡': 'broadcast', '💍': 'ring', '👑': 'crown', '🎲': 'dice',
        '📍': 'location_pin', '🌐': 'globe', '🏮': 'candle',
        '🪔': 'candle', '🔗': 'chain', '🦴': 'sword', '🛶': 'arrow_right',
        '🪽': 'sparkle', '🏆': 'crown', '🪙': 'ring', '🧭': 'target',
        '💠': 'sparkle', '💎': 'sparkle', '💜': 'heart', '🪬': 'shield',
        '🧪': 'urn', '🧿': 'target', '👺': 'demon_face', '👻': 'ghost',
        '🚫': 'close_x', '🚀': 'arrow_right', '⚡': 'spark', '💧': 'spark',
        '☣️': 'warning', '🔝': 'arrow_right', '👾': 'enemy_placeholder',
        '🕳️': 'portal', '🌋': 'flame', '🐦‍🔥': 'flame', '🐦': 'flame',
        '⛩': 'shrine', '⛩️': 'shrine', '⚱️': 'urn', '⛈️': 'spark',
        '⚖️': 'cross', '⛰️': 'shrine', '❄️': 'sparkle', '🌪️': 'spark',
        '🙏': 'cross', '🔮': 'sparkle', '👁️': 'target', '🪞': 'sparkle',
        '🎶': 'sparkle', '🚩': 'arrow_right', '💰': 'crown', '🎭': 'demon_face',
        '🪩': 'sparkle', '🛐': 'shrine', '🔱': 'sword', '🔔': 'shrine',
        '🍃': 'sparkle', '🌬️': 'spark', '🔭': 'target', '🧟': 'enemy_placeholder',
        '🏰': 'shrine', '🗝️': 'sword', '🌠': 'sparkle', '🛶': 'arrow_right',
        '🚪': 'portal', '🔒': 'shield', '💣': 'flame', '💥': 'spark',
        '🪦': 'statue', '😭': 'ghost', '🐗': 'enemy_placeholder',
        '🥷': 'enemy_placeholder', '🏹': 'arrow_right', '🧒': 'ally_placeholder',
        '🪰': 'enemy_placeholder', '🐕': 'enemy_placeholder', '🐾': 'enemy_placeholder',
        '🥀': 'flame', '📦': 'urn', '🌀': 'portal', '🏮': 'candle',
        '🤑': 'crown', '😤': 'demon_face', '😡': 'demon_face', '🌓': 'moon_dark',
        '🎎': 'enemy_placeholder', '🔏': 'shield', '🩸': 'heart',
        '😈': 'demon_face', '🟡': 'sparkle', '💢': 'warning', '🚣': 'arrow_right',
        '🕷️': 'enemy_placeholder', '🌫️': 'sparkle', '👣': 'arrow_right',
        '👤': 'ally_placeholder', '🦵': 'shield', '🧤': 'shield', '👢': 'shield',
        '🎗️': 'sparkle', '🧥': 'shield', '🦯': 'sword', '🪖': 'shield',
        '📙': 'book',
    };

    /** Inline SVG markup for an icon key. */
    function getIcon(key, opts) {
        opts = opts || {};
        const size  = opts.size  || '1em';
        const color = opts.color || 'currentColor';
        const cls   = opts.cls   ? ` class="${opts.cls}"` : '';
        const style = opts.style ? ` style="${opts.style}"` : '';
        const body  = ICONS[key] || ICONS.question;
        return `<svg${cls} viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}"${style} aria-hidden="true">${body}</svg>`;
    }

    /** Resolve a raw emoji to its icon key. Returns null if unmapped. */
    function emojiToKey(ch) {
        if (!ch) return null;
        return EMOJI_MAP[ch] || null;
    }

    /** Inline SVG markup for a raw emoji char (uses fallback if unmapped). */
    function iconFromEmoji(ch, opts) {
        const key = emojiToKey(ch) || 'question';
        return getIcon(key, opts);
    }

    window.SvgIcons = { get: getIcon, fromEmoji: iconFromEmoji, keyFor: emojiToKey, ICONS, EMOJI_MAP };
})();
