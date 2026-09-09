/* graphics_unit_map.js - Maps unit types to their drawing functions */

const unitDrawFunctionMap = {
    // ── Tier 1 ─────────────────────────────────────────────────────────
    'apprentice':      'drawApprentice',
    'novice_exorcist': 'drawNoviceExorcist',
    'acolyte_priest':  'drawAcolytePriest',
    'acolyte_warrior': 'drawAcolyteWarrior',

    // ── Tier 2 ─────────────────────────────────────────────────────────
    'knight':          'drawKnight',
    'fire':            'drawFire',
    'archer':          'drawArcher',
    'chainer':         'drawChainer',
    'ice':             'drawIce',
    'tracker':         'drawTracker',
    'talisman':        'drawTalisman',
    'monk':            'drawMonk',
    'necromancer':     'drawNecromancer',
    'guardian':        'drawGuardian',
    'alchemist':       'drawAlchemist',
    'mirror':          'drawMirror',
    'assassin':        'drawAssassin',
    // Tier 2 — Novice Exorcist exclusive (attack)
    'verse_warrior':   'drawVerseWarrior',
    'hymn_blaster':    'drawHymnBlaster',
    'exorcism_mage':   'drawExorcismMage',
    // Tier 2 — Novice Exorcist exclusive (support)
    'prayer_herald':   'drawPrayerHerald',
    'relic_keeper':    'drawRelicKeeper',
    'ward_scribe':     'drawWardScribe',
    // Tier 2 — Apprentice lightning path
    'lightning_mage':  'drawLightningMage',

    // ── Tier 3 — Attack Path ────────────────────────────────────────────
    'paladin':         'drawPaladin',
    'crusader':        'drawCrusader',
    'hellfire':        'drawHellfireAlchemist',
    'phoenix':         'drawPhoenixSummoner',
    'voidsniper':      'drawVoidSniper',
    'thousandhand':    'drawThousandHand',
    // Tier 3 — Novice Exorcist exclusive (attack)
    'scripture_knight': 'drawScriptureKnight',
    'seal_warrior':    'drawSealWarrior',
    'tome_cannon':     'drawTomeCannon',
    'holy_burst':      'drawHolyBurst',
    'rapid_exorcist':  'drawRapidExorcist',
    'chain_exorcist':  'drawChainExorcist',
    // Tier 3 — Apprentice lightning path
    'storm_caller':    'drawStormCaller',
    'thunder_judge':   'drawThunderJudge',

    // ── Tier 3 — Support Path ───────────────────────────────────────────
    'executor':        'drawExecutor',
    'binder':          'drawBinder',
    'absolutezero':    'drawAbsoluteZero',
    'permafrost':      'drawPermafrost',
    'seer':            'drawSeer',
    'commander':       'drawCommander',
    // Tier 3 — Novice Exorcist exclusive (support)
    'psalm_singer':    'drawPsalmSinger',
    'litany_chanter':  'drawLitanyChanter',
    'relic_guardian':  'drawRelicGuardian',
    'rune_crafter':    'drawRuneCrafter',
    'barrier_master':  'drawBarrierMaster',
    'divine_barrier':  'drawDivineBarrier',

    // ── Tier 3 — Special Path ───────────────────────────────────────────
    'grandsealer':     'drawGrandSealer',
    'flamemaster':     'drawFlameMaster',
    'vajra':           'drawVajrapani',
    'saint':           'drawSaint',
    'wraithlord':      'drawWraithLord',
    'cursedshaman':    'drawCursedShaman',
    'rampart':         'drawRampart',
    'judgment':        'drawJudgment',
    'midas':           'drawMidas',
    'philosopher':     'drawPhilosopher',
    'illusion':        'drawIllusion',
    'reflection':      'drawReflection',
    'abyssal':         'drawAbyssalKiller',
    'spatial':         'drawSpatialSlasher',

    // ── Tier 4 — Legendary ──────────────────────────────────────────────
    'eternal_wall':    'drawEternalWall',
    'purgatory':       'drawPurgatory',
    'piercing_shadow': 'drawPiercingShadow',
    'warden':          'drawWarden',
    'cocytus':         'drawCocytus',
    'doom_guide':      'drawDoomGuide',
    'cursed_talisman': 'drawCursedTalisman',
    'asura':           'drawAsura',
    'forsaken_king':   'drawForsakenKing',
    'reaper':          'drawReaper',
    'void_gatekeeper': 'drawVoidGatekeeper',
    'transmuter':      'drawTransmuter',
    'oracle':          'drawOracle',
    // Tier 4 — Novice Exorcist exclusive
    'word_of_god':     'drawWordOfGod',
    'genesis_strike':  'drawGenesisStrike',
    'exorcism_storm':  'drawExorcismStorm',
    // Tier 4 — Novice Exorcist exclusive (support)
    'divine_choir':    'drawDivineChoir',
    'sacred_reliquary':'drawSacredReliquary',
    'grand_ward':      'drawGrandWard',
    // Tier 4 — Apprentice lightning path
    'thunder_lord':    'drawThunderLord',
};

function getUnitDrawFunction(unitType) {
    return unitDrawFunctionMap[unitType] || null;
}

window.getUnitDrawFunction = getUnitDrawFunction;
