/* attackeffect.js — Comprehensive Unit Attack Hit Effects
 * Data-driven: all 70+ unit types mapped to [color, particles, ringRadius, extraFx].
 * Impact rings use Pixi.Graphics on vfxLayer. Extra FX use existing VFX spawners.
 */

// ── Effect Definition Table ────────────────────────────────────────────────────
// [color, particleCount, ringRadius(0=none), extraFx(null|'pillar'|'banish'|'soul'|'glitch')]
const ATTACK_FX = {
    // T1
    'apprentice':        ['#4464DC', 6,  0,  null],
    'novice_exorcist':   ['#FFD700', 7,  0,  null],
    // T2 — Attack
    'knight':            ['#FFD700', 10, 15, null],
    'fire':              ['#FF6600', 10, 15, null],
    'archer':            ['#88FF44', 5,  0,  null],
    'verse_warrior':     ['#FFD700', 8,  15, null],
    'hymn_blaster':      ['#FFF4A0', 12, 18, null],
    'exorcism_mage':     ['#00E5FF', 10, 15, null],
    // T2 — Support
    'chainer':           ['#9400D3', 8,  15, null],
    'ice':               ['#00E5FF', 10, 18, null],
    'tracker':           ['#00FF88', 6,  10, null],
    // T2 — Special
    'talisman':          ['#FF8C00', 8,  15, null],
    'monk':              ['#FFD700', 10, 18, null],
    'necromancer':       ['#4A148C', 10, 15, 'soul'],
    'guardian':          ['#FFD700', 8,  15, null],
    'alchemist':         ['#FFD700', 8,  15, null],
    'mirror':            ['#E0E8F4', 6,  14, null],
    'assassin':          ['#651FFF', 8,  15, null],
    'prayer_herald':     ['#FFD700', 8,  15, null],
    'relic_keeper':      ['#FF8C00', 8,  15, null],
    'ward_scribe':       ['#00E5FF', 8,  15, null],
    // T3 — Attack
    'paladin':           ['#FFD700', 14, 28, 'pillar'],
    'crusader':          ['#FF1744', 12, 25, null],
    'hellfire':          ['#FF4500', 14, 26, null],
    'phoenix':           ['#FF6600', 14, 26, null],
    'voidsniper':        ['#651FFF', 8,  22, null],
    'thousandhand':      ['#00E5FF', 16, 24, null],
    'scripture_knight':  ['#FFD700', 12, 22, null],
    'seal_warrior':      ['#FFF4A0', 10, 22, null],
    'tome_cannon':       ['#FFD700', 14, 25, null],
    'holy_burst':        ['#FFFFFF', 16, 28, 'pillar'],
    'rapid_exorcist':    ['#00E5FF', 10, 20, null],
    'chain_exorcist':    ['#9400D3', 12, 22, null],
    // T3 — Support
    'executor':          ['#B71C1C', 10, 20, null],
    'binder':            ['#9400D3', 10, 24, 'banish'],
    'absolutezero':      ['#00E5FF', 14, 26, null],
    'permafrost':        ['#A0D8F0', 12, 22, null],
    'seer':              ['#FFF4A0', 8,  20, null],
    'commander':         ['#00FF88', 10, 22, null],
    'psalm_singer':      ['#FFD700', 10, 20, null],
    'litany_chanter':    ['#FFF4A0', 10, 20, null],
    'relic_guardian':    ['#FF8C00', 10, 22, null],
    'rune_crafter':      ['#00E5FF', 10, 20, null],
    'barrier_master':    ['#00E5FF', 12, 22, null],
    'divine_barrier':    ['#FFFFFF', 12, 22, null],
    // T3 — Special
    'grandsealer':       ['#FFD700', 14, 26, null],
    'flamemaster':       ['#FF4500', 16, 26, null],
    'vajra':             ['#FFFFFF', 16, 26, null],
    'saint':             ['#FFFFFF', 14, 26, 'pillar'],
    'wraithlord':        ['#4A148C', 14, 26, 'soul'],
    'cursedshaman':      ['#9C27B0', 12, 22, null],
    'rampart':           ['#FFD700', 10, 22, null],
    'judgment':          ['#FFFFFF', 14, 26, 'pillar'],
    'abyssal':           ['#651FFF', 12, 24, 'banish'],
    'spatial':           ['#651FFF', 10, 22, 'glitch'],
    'midas':             ['#FFD700', 20, 26, null],
    'philosopher':       ['#9C27B0', 12, 22, null],
    'illusion':          ['#E0E8F4', 10, 20, null],
    'reflection':        ['#00E5FF', 10, 20, null],
    // T4 — Legendary
    'eternal_wall':      ['#FFD700', 20, 42, 'pillar'],
    'purgatory':         ['#FF4500', 24, 40, null],
    'piercing_shadow':   ['#651FFF', 14, 36, null],
    'warden':            ['#4A148C', 16, 38, 'banish'],
    'cocytus':           ['#00E5FF', 20, 42, null],
    'doom_guide':        ['#FF1744', 18, 38, null],
    'cursed_talisman':   ['#9C27B0', 20, 40, 'banish'],
    'asura':             ['#FFD700', 24, 42, 'pillar'],
    'forsaken_king':     ['#4A148C', 20, 42, 'soul'],
    'void_gatekeeper':   ['#651FFF', 16, 38, 'glitch'],
    'transmuter':        ['#FFD700', 16, 36, null],
    'oracle':            ['#FFF4A0', 16, 38, 'pillar'],
    'reaper':            ['#4A148C', 20, 42, 'soul'],
    'word_of_god':       ['#FFFFFF', 24, 42, 'pillar'],
    'genesis_strike':    ['#FFD700', 24, 42, 'pillar'],
    'exorcism_storm':    ['#00E5FF', 20, 38, 'pillar'],
    'divine_choir':      ['#FFFFFF', 20, 42, 'pillar'],
    'sacred_reliquary':  ['#FF8C00', 16, 36, null],
    'grand_ward':        ['#00E5FF', 18, 38, null],
};

// ── Impact Ring Pool (Pixi.Graphics expanding circle on vfxLayer) ─────────────
const _rings = [];
let _ringGfx  = null;

if (window.EventBus && window.GAME_EVENTS) {
    EventBus.on(GAME_EVENTS.PIXI_RESET, () => {
        _rings.length = 0;
        _ringGfx = null;
    });
}

function _ensureRingGfx() {
    if (_ringGfx || !window.vfxLayer) return;
    _ringGfx = new PIXI.Graphics();
    vfxLayer.addChild(_ringGfx);
}

function updateImpactRings() {
    for (let i = _rings.length - 1; i >= 0; i--) {
        _rings[i].life -= 0.10;
        if (_rings[i].life <= 0) _rings.splice(i, 1);
    }
}

function drawImpactRings() {
    _ensureRingGfx();
    if (!_ringGfx) return;
    _ringGfx.clear();
    _rings.forEach(function(r) {
        const progress = 1.0 - r.life;
        const radius   = r.maxR * progress;
        const alpha    = r.life * 0.85;
        const hex = (typeof cssColorToHex === 'function') ? cssColorToHex(r.color) : 0xFFFFFF;
        _ringGfx
            .circle(r.x, r.y, Math.max(1, radius))
            .stroke({ width: 2, color: hex, alpha: Math.max(0, alpha) });
    });
}

// ── Main Effect Dispatcher ─────────────────────────────────────────────────────
function createAttackEffect(unitType, target) {
    if (!target) return;
    const lx = (target.x / 100) * (window.LOGICAL_WIDTH || 1080);
    const ly = target.y;

    const fx = ATTACK_FX[unitType] || ['#ffffff', 5, 0, null];
    const [color, count, maxR, extra] = fx;

    // Particles (banish already spawns particles internally, so reduce count)
    const pCount = Math.ceil((extra === 'banish' ? count * 0.3 : count * 0.5));
    if (typeof spawnHitEffect === 'function') {
        spawnHitEffect(lx, ly, color, maxR > 0 ? maxR : 20);
    }
    if (typeof spawnParticles === 'function') spawnParticles(lx, ly, color, pCount);

    // Impact ring (Pixi)
    if (maxR > 0) _rings.push({ x: lx, y: ly, color, maxR, life: 1.0 });

    // Extra thematic effect
    if (extra === 'pillar' && typeof spawnLightPillar === 'function') {
        spawnLightPillar(lx, ly);
    } else if (extra === 'soul' && typeof spawnSoulEssence === 'function') {
        spawnSoulEssence(lx, ly);
    } else if (extra === 'banish' && typeof spawnBanishEffect === 'function') {
        spawnBanishEffect(lx, ly);
    } else if (extra === 'glitch' && Math.random() < 0.25) {
        if (typeof spawnGlitchEffect === 'function') spawnGlitchEffect(15);
    }
}

window.createAttackEffect = createAttackEffect;
window.updateImpactRings  = updateImpactRings;
window.drawImpactRings    = drawImpactRings;