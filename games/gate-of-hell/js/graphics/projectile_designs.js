/* projectile_designs.js — Per-unit projectile shape & trail registry.
 *
 * Each unit type maps to { kind, c1, c2, trail }. drawShape() picks a shape fn
 * by `kind`, paints with primary/secondary colors. drawTrail() fades past
 * positions stored in p.trail (populated by updateProjectiles).
 *
 * Goal: every ranged unit gets a visually distinct projectile.
 */

const PROJ_DESIGN = {
    // T1
    'apprentice':       { kind: 'orb',       c1: 0x4464DC, c2: 0xBBDDFF, trail: 'spark'  },
    'novice_exorcist':  { kind: 'cross',     c1: 0xFFD700, c2: 0xFFFFFF, trail: 'glow'   },
    // T2 — Attack
    'knight':           { kind: 'slash',     c1: 0xFFD700, c2: 0xFFFFFF, trail: 'arc'    },
    'fire':             { kind: 'flame',     c1: 0xFF6600, c2: 0xFFD700, trail: 'smoke'  },
    'archer':           { kind: 'arrow',     c1: 0x88FF44, c2: 0xCFD8DC, trail: 'feather'},
    'verse_warrior':    { kind: 'hex',       c1: 0xFFD700, c2: 0xFFF4A0, trail: 'glow'   },
    'hymn_blaster':     { kind: 'beam',      c1: 0xFFF4A0, c2: 0xFFFFFF, trail: 'glow'   },
    'exorcism_mage':    { kind: 'orb',       c1: 0x00E5FF, c2: 0xFFFFFF, trail: 'spark'  },
    // T2 — Support
    'chainer':          { kind: 'chain',     c1: 0x9400D3, c2: 0xE040FB, trail: 'chain'  },
    'ice':              { kind: 'shard',     c1: 0x00E5FF, c2: 0xFFFFFF, trail: 'frost'  },
    'tracker':          { kind: 'dart',      c1: 0x00FF88, c2: 0xCFD8DC, trail: 'spark'  },
    // T2 — Special
    'talisman':         { kind: 'paper',     c1: 0xFF8C00, c2: 0xFFE082, trail: 'glow'   },
    'monk':             { kind: 'hex',       c1: 0xFFD700, c2: 0xFFFFFF, trail: 'glow'   },
    'necromancer':      { kind: 'skull',     c1: 0x4A148C, c2: 0x9400D3, trail: 'soul'   },
    'guardian':         { kind: 'star',      c1: 0xFFD700, c2: 0xFFFFFF, trail: 'glow'   },
    'alchemist':        { kind: 'bottle',    c1: 0xFFD700, c2: 0xC8E6C9, trail: 'spark'  },
    'mirror':           { kind: 'crystal',   c1: 0xE0E8F4, c2: 0xFFFFFF, trail: 'glow'   },
    'assassin':         { kind: 'dagger',    c1: 0x651FFF, c2: 0xE040FB, trail: 'shadow' },
    'prayer_herald':    { kind: 'cross',     c1: 0xFFD700, c2: 0xFFF4A0, trail: 'glow'   },
    'relic_keeper':     { kind: 'orb',       c1: 0xFF8C00, c2: 0xFFE082, trail: 'glow'   },
    'ward_scribe':      { kind: 'hex',       c1: 0x00E5FF, c2: 0xFFFFFF, trail: 'glow'   },
    // T3 — Attack
    'paladin':          { kind: 'cross',     c1: 0xFFD700, c2: 0xFFFFFF, trail: 'glow'   },
    'crusader':         { kind: 'slash',     c1: 0xFF1744, c2: 0xFFCDD2, trail: 'arc'    },
    'hellfire':         { kind: 'flame',     c1: 0xFF4500, c2: 0xFFD700, trail: 'smoke'  },
    'phoenix':          { kind: 'feather',   c1: 0xFF6600, c2: 0xFFD700, trail: 'smoke'  },
    'voidsniper':       { kind: 'arrow',     c1: 0x651FFF, c2: 0xE040FB, trail: 'shadow' },
    'thousandhand':     { kind: 'arrow',     c1: 0x00E5FF, c2: 0xFFFFFF, trail: 'spark'  },
    'scripture_knight': { kind: 'hex',       c1: 0xFFD700, c2: 0xFFFFFF, trail: 'glow'   },
    'seal_warrior':     { kind: 'star',      c1: 0xFFF4A0, c2: 0xFFFFFF, trail: 'glow'   },
    'tome_cannon':      { kind: 'orb',       c1: 0xFFD700, c2: 0xFFFFFF, trail: 'glow'   },
    'holy_burst':       { kind: 'starburst', c1: 0xFFFFFF, c2: 0xFFD700, trail: 'glow'   },
    'rapid_exorcist':   { kind: 'dart',      c1: 0x00E5FF, c2: 0xFFFFFF, trail: 'spark'  },
    'chain_exorcist':   { kind: 'chain',     c1: 0x9400D3, c2: 0xE040FB, trail: 'chain'  },
    // T3 — Support
    'executor':         { kind: 'skull',     c1: 0xB71C1C, c2: 0xFF8888, trail: 'shadow' },
    'binder':           { kind: 'chain',     c1: 0x9400D3, c2: 0xE040FB, trail: 'chain'  },
    'absolutezero':     { kind: 'shard',     c1: 0x00E5FF, c2: 0xFFFFFF, trail: 'frost'  },
    'permafrost':       { kind: 'shard',     c1: 0xA0D8F0, c2: 0xFFFFFF, trail: 'frost'  },
    'seer':             { kind: 'eye',       c1: 0xFFF4A0, c2: 0xFFFFFF, trail: 'glow'   },
    'commander':        { kind: 'banner',    c1: 0x00FF88, c2: 0xFFFFFF, trail: 'glow'   },
    'psalm_singer':     { kind: 'note',      c1: 0xFFD700, c2: 0xFFFFFF, trail: 'glow'   },
    'litany_chanter':   { kind: 'note',      c1: 0xFFF4A0, c2: 0xFFFFFF, trail: 'glow'   },
    'relic_guardian':   { kind: 'star',      c1: 0xFF8C00, c2: 0xFFE082, trail: 'glow'   },
    'rune_crafter':     { kind: 'hex',       c1: 0x00E5FF, c2: 0xFFFFFF, trail: 'glow'   },
    'barrier_master':   { kind: 'crystal',   c1: 0x00E5FF, c2: 0xFFFFFF, trail: 'glow'   },
    'divine_barrier':   { kind: 'crystal',   c1: 0xFFFFFF, c2: 0x00E5FF, trail: 'glow'   },
    // T3 — Special
    'grandsealer':      { kind: 'hex',       c1: 0xFFD700, c2: 0xFFFFFF, trail: 'glow'   },
    'flamemaster':      { kind: 'flame',     c1: 0xFF4500, c2: 0xFFD700, trail: 'smoke'  },
    'vajra':            { kind: 'bolt',      c1: 0xFFFFFF, c2: 0xFFD700, trail: 'glow'   },
    'saint':            { kind: 'cross',     c1: 0xFFFFFF, c2: 0xFFD700, trail: 'glow'   },
    'wraithlord':       { kind: 'skull',     c1: 0x4A148C, c2: 0x9400D3, trail: 'soul'   },
    'cursedshaman':     { kind: 'orb',       c1: 0x9C27B0, c2: 0xE040FB, trail: 'shadow' },
    'rampart':          { kind: 'star',      c1: 0xFFD700, c2: 0xFFFFFF, trail: 'glow'   },
    'judgment':         { kind: 'cross',     c1: 0xFFFFFF, c2: 0xFFD700, trail: 'glow'   },
    'abyssal':          { kind: 'orb',       c1: 0x651FFF, c2: 0xE040FB, trail: 'shadow' },
    'spatial':          { kind: 'crystal',   c1: 0x651FFF, c2: 0xE040FB, trail: 'shadow' },
    'midas':            { kind: 'coin',      c1: 0xFFD700, c2: 0xFFE082, trail: 'spark'  },
    'philosopher':      { kind: 'bottle',    c1: 0x9C27B0, c2: 0xE040FB, trail: 'spark'  },
    'illusion':         { kind: 'crystal',   c1: 0xE0E8F4, c2: 0xFFFFFF, trail: 'glow'   },
    'reflection':       { kind: 'crystal',   c1: 0x00E5FF, c2: 0xFFFFFF, trail: 'glow'   },
    // T4 — Legendary
    'eternal_wall':     { kind: 'cross',     c1: 0xFFD700, c2: 0xFFFFFF, trail: 'glow'   },
    'purgatory':        { kind: 'flame',     c1: 0xFF4500, c2: 0xFFD700, trail: 'smoke'  },
    'piercing_shadow':  { kind: 'dagger',    c1: 0x651FFF, c2: 0xE040FB, trail: 'shadow' },
    'warden':           { kind: 'chain',     c1: 0x4A148C, c2: 0x9400D3, trail: 'chain'  },
    'cocytus':          { kind: 'shard',     c1: 0x00E5FF, c2: 0xFFFFFF, trail: 'frost'  },
    'doom_guide':       { kind: 'skull',     c1: 0xFF1744, c2: 0xFFCDD2, trail: 'shadow' },
    'cursed_talisman':  { kind: 'paper',     c1: 0x9C27B0, c2: 0xE040FB, trail: 'shadow' },
    'asura':            { kind: 'bolt',      c1: 0xFFD700, c2: 0xFFFFFF, trail: 'glow'   },
    'forsaken_king':    { kind: 'crown',     c1: 0x4A148C, c2: 0xFFD700, trail: 'soul'   },
    'void_gatekeeper':  { kind: 'orb',       c1: 0x651FFF, c2: 0xE040FB, trail: 'shadow' },
    'transmuter':       { kind: 'coin',      c1: 0xFFD700, c2: 0xFFE082, trail: 'spark'  },
    'oracle':           { kind: 'eye',       c1: 0xFFF4A0, c2: 0xFFFFFF, trail: 'glow'   },
    'reaper':           { kind: 'scythe',    c1: 0x4A148C, c2: 0x9400D3, trail: 'soul'   },
    'word_of_god':      { kind: 'starburst', c1: 0xFFFFFF, c2: 0xFFD700, trail: 'glow'   },
    'genesis_strike':   { kind: 'starburst', c1: 0xFFD700, c2: 0xFFFFFF, trail: 'glow'   },
    'exorcism_storm':   { kind: 'bolt',      c1: 0x00E5FF, c2: 0xFFFFFF, trail: 'glow'   },
    'divine_choir':     { kind: 'note',      c1: 0xFFFFFF, c2: 0xFFD700, trail: 'glow'   },
    'sacred_reliquary': { kind: 'star',      c1: 0xFF8C00, c2: 0xFFE082, trail: 'glow'   },
    'grand_ward':       { kind: 'crystal',   c1: 0x00E5FF, c2: 0xFFFFFF, trail: 'glow'   },
};

const DEFAULT_DESIGN = { kind: 'orb', c1: 0xFFFFFF, c2: 0xFFFFFF, trail: 'glow' };

// ── Shape draw functions (assume gfx is at projectile origin, rotated to angle) ─
const SHAPE = {
    orb(g, c1, c2, t) {
        g.circle(0, 0, 8).fill({ color: c1, alpha: 0.35 });
        g.circle(0, 0, 5).fill({ color: c2, alpha: 0.95 });
        g.circle(-1.5, -1.5, 1.6).fill({ color: 0xFFFFFF, alpha: 0.85 });
    },
    cross(g, c1, c2) {
        g.rect(-1.5, -9, 3, 18).fill({ color: c2, alpha: 1 });
        g.rect(-6, -1.5, 12, 3).fill({ color: c2, alpha: 1 });
        g.circle(0, 0, 4).fill({ color: c1, alpha: 0.7 });
    },
    slash(g, c1, c2) {
        g.moveTo(-14, 0).lineTo(14, 0).stroke({ width: 5, color: c1, alpha: 0.85 });
        g.moveTo(-14, 0).lineTo(14, 0).stroke({ width: 2, color: c2, alpha: 1 });
        g.circle(14, 0, 3).fill({ color: c2, alpha: 1 });
    },
    flame(g, c1, c2) {
        g.ellipse(-2, 0, 10, 5).fill({ color: c1, alpha: 0.55 });
        g.ellipse(0, 0, 6, 3.5).fill({ color: c2, alpha: 1 });
        g.moveTo(-12, -2).lineTo(-8, 0).lineTo(-12, 2).closePath().fill({ color: c1, alpha: 0.6 });
        g.circle(4, 0, 2).fill({ color: 0xFFFFFF, alpha: 0.7 });
    },
    arrow(g, c1, c2) {
        g.moveTo(-14, 0).lineTo(8, 0).stroke({ width: 2, color: c1, alpha: 1 });
        g.moveTo(10, 0).lineTo(4, -4).lineTo(4, 4).closePath().fill({ color: c2 });
        g.moveTo(-14, 0).lineTo(-18, -3).lineTo(-18, 3).closePath().fill({ color: c1, alpha: 0.8 });
    },
    hex(g, c1, c2) {
        const r = 7;
        g.moveTo(r, 0);
        for (let i = 1; i <= 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        g.closePath().fill({ color: c1, alpha: 0.55 }).stroke({ width: 1.5, color: c2, alpha: 1 });
        g.circle(0, 0, 2).fill({ color: c2, alpha: 1 });
    },
    beam(g, c1, c2) {
        g.rect(-16, -2, 32, 4).fill({ color: c1, alpha: 0.55 });
        g.rect(-16, -0.8, 32, 1.6).fill({ color: c2, alpha: 1 });
        g.circle(16, 0, 3).fill({ color: c2, alpha: 1 });
    },
    chain(g, c1, c2) {
        for (let i = -2; i <= 2; i++) {
            g.ellipse(i * 5, 0, 3, 2)
             .fill({ color: c1, alpha: 0.85 })
             .stroke({ width: 1, color: c2, alpha: 1 });
        }
    },
    shard(g, c1, c2) {
        g.moveTo(10, 0).lineTo(0, -4).lineTo(-10, 0).lineTo(0, 4).closePath()
         .fill({ color: c1, alpha: 0.85 })
         .stroke({ width: 1, color: c2, alpha: 1 });
        g.moveTo(6, 0).lineTo(0, -2).lineTo(-6, 0).lineTo(0, 2).closePath()
         .fill({ color: c2, alpha: 0.6 });
    },
    dart(g, c1, c2) {
        g.moveTo(8, 0).lineTo(-6, -2.5).lineTo(-6, 2.5).closePath()
         .fill({ color: c1, alpha: 1 });
        g.moveTo(-6, 0).lineTo(-9, -1.5).lineTo(-9, 1.5).closePath()
         .fill({ color: c2, alpha: 0.9 });
    },
    paper(g, c1, c2) {
        g.rect(-7, -5, 14, 10).fill({ color: c2, alpha: 0.95 }).stroke({ width: 1, color: c1, alpha: 1 });
        g.moveTo(-4, -2).lineTo(4, -2).stroke({ width: 0.8, color: c1, alpha: 0.9 });
        g.moveTo(-4, 0).lineTo(4, 0).stroke({ width: 0.8, color: c1, alpha: 0.9 });
        g.moveTo(-4, 2).lineTo(4, 2).stroke({ width: 0.8, color: c1, alpha: 0.9 });
    },
    skull(g, c1, c2) {
        g.circle(0, -1, 6).fill({ color: c2, alpha: 1 });
        g.rect(-3, 4, 6, 3).fill({ color: c2, alpha: 1 });
        g.circle(-2, -1, 1.3).fill({ color: c1, alpha: 1 });
        g.circle( 2, -1, 1.3).fill({ color: c1, alpha: 1 });
        g.circle(0, 2, 0.9).fill({ color: c1, alpha: 1 });
    },
    star(g, c1, c2) {
        const spikes = 5;
        const oR = 8, iR = 3.5;
        g.moveTo(oR, 0);
        for (let i = 1; i < spikes * 2; i++) {
            const r = (i % 2 === 0) ? oR : iR;
            const a = (i / (spikes * 2)) * Math.PI * 2;
            g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        g.closePath().fill({ color: c1, alpha: 0.85 }).stroke({ width: 1, color: c2, alpha: 1 });
    },
    bottle(g, c1, c2) {
        g.rect(-2, -8, 4, 4).fill({ color: 0x6D4C41, alpha: 1 });
        g.ellipse(0, 0, 5, 6).fill({ color: c1, alpha: 0.85 }).stroke({ width: 1, color: c2, alpha: 1 });
        g.circle(-1.5, -1, 1).fill({ color: 0xFFFFFF, alpha: 0.7 });
    },
    crystal(g, c1, c2) {
        g.moveTo(0, -8).lineTo(6, -2).lineTo(4, 7).lineTo(-4, 7).lineTo(-6, -2).closePath()
         .fill({ color: c1, alpha: 0.7 })
         .stroke({ width: 1, color: c2, alpha: 1 });
        g.moveTo(0, -8).lineTo(0, 7).stroke({ width: 0.7, color: 0xFFFFFF, alpha: 0.6 });
    },
    dagger(g, c1, c2) {
        g.moveTo(10, 0).lineTo(-4, -2).lineTo(-4, 2).closePath().fill({ color: c2, alpha: 1 });
        g.rect(-7, -3, 3, 6).fill({ color: c1, alpha: 1 });
        g.rect(-4, -1, 2, 2).fill({ color: 0xFFD700, alpha: 1 });
    },
    feather(g, c1, c2) {
        g.moveTo(10, 0).quadraticCurveTo(0, -6, -10, 0).quadraticCurveTo(0, 6, 10, 0).closePath()
         .fill({ color: c1, alpha: 0.85 })
         .stroke({ width: 1, color: c2, alpha: 1 });
        g.moveTo(10, 0).lineTo(-10, 0).stroke({ width: 0.8, color: c2, alpha: 0.9 });
    },
    eye(g, c1, c2) {
        g.ellipse(0, 0, 8, 5).fill({ color: c2, alpha: 1 });
        g.circle(0, 0, 3).fill({ color: c1, alpha: 1 });
        g.circle(0, 0, 1.3).fill({ color: 0x000000, alpha: 0.9 });
        g.circle(-1, -1, 0.7).fill({ color: 0xFFFFFF, alpha: 0.9 });
    },
    banner(g, c1, c2) {
        g.rect(-1, -8, 2, 16).fill({ color: 0x6D4C41, alpha: 1 });
        g.moveTo(1, -8).lineTo(8, -6).lineTo(5, -3).lineTo(8, 0).lineTo(1, 0).closePath()
         .fill({ color: c1, alpha: 0.95 })
         .stroke({ width: 1, color: c2, alpha: 1 });
    },
    note(g, c1, c2) {
        g.ellipse(-3, 3, 4, 3).fill({ color: c1, alpha: 1 });
        g.rect(0, -6, 1.5, 9).fill({ color: c1, alpha: 1 });
        g.moveTo(1.5, -6).lineTo(6, -7).lineTo(6, -2).lineTo(1.5, -1).closePath().fill({ color: c2, alpha: 0.9 });
    },
    starburst(g, c1, c2) {
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            g.moveTo(0, 0).lineTo(Math.cos(a) * 11, Math.sin(a) * 11)
             .stroke({ width: 1.5, color: c1, alpha: 0.9 });
        }
        g.circle(0, 0, 4).fill({ color: c2, alpha: 1 });
        g.circle(0, 0, 6).stroke({ width: 1, color: c1, alpha: 0.6 });
    },
    bolt(g, c1, c2) {
        g.moveTo(10, -2).lineTo(2, 0).lineTo(6, 1).lineTo(-10, 3).lineTo(-2, 0).lineTo(-6, -1).closePath()
         .fill({ color: c2, alpha: 1 })
         .stroke({ width: 1, color: c1, alpha: 1 });
    },
    coin(g, c1, c2) {
        g.circle(0, 0, 7).fill({ color: c1, alpha: 1 }).stroke({ width: 1, color: c2, alpha: 1 });
        g.circle(0, 0, 4).stroke({ width: 0.8, color: c2, alpha: 0.9 });
    },
    crown(g, c1, c2) {
        g.rect(-7, 0, 14, 4).fill({ color: c2, alpha: 1 });
        g.moveTo(-7, 0).lineTo(-5, -6).lineTo(-2, -2).lineTo(0, -7).lineTo(2, -2).lineTo(5, -6).lineTo(7, 0).closePath()
         .fill({ color: c2, alpha: 1 })
         .stroke({ width: 1, color: c1, alpha: 1 });
        g.circle(0, -3, 1.2).fill({ color: 0xFF1744, alpha: 1 });
    },
    scythe(g, c1, c2) {
        g.rect(-1, -10, 2, 20).fill({ color: 0x6D4C41, alpha: 1 });
        g.moveTo(0, -10).quadraticCurveTo(10, -10, 12, -2)
         .stroke({ width: 2.5, color: c2, alpha: 1 });
        g.moveTo(0, -10).quadraticCurveTo(8, -8, 10, -3)
         .stroke({ width: 1, color: c1, alpha: 0.9 });
    },
};

function _drawProjectile(gfx, type, animT) {
    const d = PROJ_DESIGN[type] || DEFAULT_DESIGN;
    const fn = SHAPE[d.kind] || SHAPE.orb;
    fn(gfx, d.c1, d.c2, animT);
}

// Symmetric shapes spin in flight instead of pointing at the target.
const PROJ_SPIN_KINDS = { hex: 1, star: 1, coin: 1, shard: 1, crystal: 1, cross: 1, paper: 1, starburst: 1, skull: 1, bottle: 1, crown: 1, note: 1 };

// ── Trail rendering on a shared Graphics ────────────────────────────────────────
function _drawTrails(gfx, activeProjs) {
    gfx.clear();
    const animT = window.globalAnimTimer || 0;
    activeProjs.forEach(function(p) {
        const d = (p.tower && p.tower.data) ? (PROJ_DESIGN[p.tower.data.type] || DEFAULT_DESIGN) : DEFAULT_DESIGN;
        // Pulsing additive halo under the projectile (cheap glow, no filter)
        const hx = p.x + (p.ox || 0), hy = p.y + (p.oy || 0);
        const pulse = 1 + Math.sin(animT * 4 + hx * 0.05) * 0.2;
        gfx.circle(hx, hy, 14 * pulse).fill({ color: d.c1, alpha: 0.18 });
        gfx.circle(hx, hy, 8 * pulse).fill({ color: d.c2, alpha: 0.22 });
        const t = p.trail;
        if (!t || t.length < 2) return;
        const style = d.trail || 'glow';
        const len = t.length;
        for (let i = 1; i < len; i++) {
            const a = t[i - 1], b = t[i];
            const fade = i / len;
            let w, color, alpha;
            switch (style) {
                case 'frost':   w = 1 + fade * 2; color = d.c2; alpha = fade * 0.5; break;
                case 'smoke':   w = 1 + fade * 4; color = d.c1; alpha = fade * 0.35; break;
                case 'soul':    w = 1 + fade * 2; color = d.c2; alpha = fade * 0.55; break;
                case 'shadow':  w = 1 + fade * 3; color = d.c1; alpha = fade * 0.45; break;
                case 'chain':   w = 1; color = d.c2; alpha = fade * 0.35; break;
                case 'arc':     w = 0.5 + fade * 2; color = d.c2; alpha = fade * 0.55; break;
                case 'feather': w = 1; color = d.c2; alpha = fade * 0.35; break;
                case 'spark':   w = 0.8 + fade * 1.5; color = d.c2; alpha = fade * 0.6; break;
                case 'glow':
                default:        w = 1 + fade * 2.5; color = d.c1; alpha = fade * 0.5; break;
            }
            gfx.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({ width: w, color, alpha });
        }
    });
}

window.PROJ_DESIGN     = PROJ_DESIGN;
window.PROJ_SPIN_KINDS = PROJ_SPIN_KINDS;
window.drawProjectileFx = _drawProjectile;
window.drawProjectileTrails = _drawTrails;
