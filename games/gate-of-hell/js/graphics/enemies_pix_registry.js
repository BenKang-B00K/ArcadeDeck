/* enemies_pix_registry.js — enemy type -> draw function name.
 * Loads AFTER every enemies_pix_*.js art file. */

const enemyDrawRegistry = {
    'normal': 'drawWhisperingSpirit',
    'specter': 'drawWhisperingSpirit',
    'mist': 'drawMist',
    'memory': 'drawMemory',
    'shade': 'drawShade',
    'tank': 'drawIronWraith',
    'runner': 'drawShadowRunner',
    'greedy': 'drawGreedyPoltergeist',
    'lightspeed': 'drawLightspeedHerald',
    'boar': 'drawHellboundBoar',
    'defiled_apprentice': 'drawDefiledApprentice',
    'mimic': 'drawMimicWraith',
    'dimension': 'drawDimensionWraith',
    'deceiver': 'drawDeceiverSiren',
    'cursed_vajra': 'drawCursedVajra',
    'betrayer_blade': 'drawBetrayerBlade',
    'void_piercer': 'drawVoidPiercer',
    'soul_eater': 'drawSoulEater',
    'frost': 'drawFrostWalker',
    'frost_outcast': 'drawFrozenHeart',
    'ember_hatred': 'drawEmberHatred',
    'heavy': 'drawChainEnforcer',
    'lava': 'drawLavaFury',
    'burning': 'drawPainRegenerator',
    'abyssal_acolyte': 'drawAbyssalAcolyte',
    'gold': 'drawGoldPhantom',
    // ── 원혼 (specter) new ──────────────────────────────────────────────
    'echo_soul':       'drawEchoSoul',
    'hungry_ghost':    'drawHungryGhost',
    'aggrieved':       'drawAggrieved',
    'split_soul':      'drawSplitSoul',
    'cursed_ancestor': 'drawCursedAncestor',
    // ── 망령 (wraith) new ───────────────────────────────────────────────
    'shadow_wisp':     'drawShadowWisp',
    'cursed_shade':    'drawCursedShade',
    'soul_hound':      'drawSoulHound',
    'oblivion_wraith': 'drawOblivionWraith',
    'unrepentant':     'drawUnrepentant',
    // ── 악령 (spirit) new ───────────────────────────────────────────────
    'lost_child':      'drawLostChild',
    'grave_walker':    'drawGraveWalker',
    'wailing_mother':  'drawWailingMother',
    'abyss_sentinel':  'drawAbyssSentinel',
    'fear_harvester':  'drawFearHarvester',
    'blood_spirit':    'drawBloodSpirit',
    // ── 악마 (demon) new ────────────────────────────────────────────────
    'imp':               'drawImp',
    'hellspawn':         'drawHellspawn',
    'brimstone_fiend':   'drawBrimstoneFiend',
    'shadow_titan':       'drawShadowTitan',
    'lava_lord':          'drawLavaLord',
    'time_ravager':       'drawTimeRavager',
    'void_master':        'drawVoidMaster',
    'sin_incarnate':      'drawSinIncarnate',
    'corruption_apostle': 'drawCorruptionApostle',
    // ── Bosses ──────────────────────────────────────────────────────────
    'cerberus': 'drawCerberus',
    'charon': 'drawCharon',
    'beelzebub': 'drawBeelzebub',
    'lucifer': 'drawLucifer',
    'abyssal_overlord': 'drawAbyssalOverlord',
    'mini_cerberus': 'drawCerberus',
    'mini_charon': 'drawCharon',
    'mini_beelzebub': 'drawBeelzebub',
    'mini_lucifer': 'drawLucifer',
    'mini_lilith': 'drawLilith',
    'lilith': 'drawLilith',
    'mini_chronos': 'drawChronos',
    'medusa': 'drawMedusa'
};

function getEnemyDrawFunction(type) {
    return enemyDrawRegistry[type] || null;
}

window.getEnemyDrawFunction = getEnemyDrawFunction;
// ── 망령 new ───────────────────────────────────────────────────────────
// ── 악마 new ───────────────────────────────────────────────────────────
