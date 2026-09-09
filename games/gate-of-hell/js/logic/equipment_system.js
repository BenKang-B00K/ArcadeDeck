/* equipment_system.js - Core Logic for Equipment Scaling, Drops, and Stats */

// Soul Crystal — currency for rerolling equipment stat values.
window.soulCrystals = window.soulCrystals || 0;

// SC cost to reroll an equipment slot's stat, indexed by tier (1..4).
const REROLL_SC_COST = [0, 1, 3, 8, 20];

// SC drop chance / amount per kill bucket.
// [chance, count] — checked top-down (boss → mini → high-danger → default).
function _rollSoulCrystalDrop(enemy) {
    if (!enemy) return 0;
    if (enemy.isBoss || enemy.isPactBoss) return 3 + Math.floor(Math.random() * 3); // 3–5
    const d = enemy.danger || 0;
    if (d >= 9) return Math.random() < 0.10 ? 2 : (Math.random() < 0.20 ? 1 : 0);
    if (d >= 7) return Math.random() < 0.05 ? 1 : 0;
    if (d >= 4) return Math.random() < 0.02 ? 1 : 0;
    return Math.random() < 0.008 ? 1 : 0;
}

function checkSoulCrystalDrop(enemy) {
    const n = _rollSoulCrystalDrop(enemy);
    if (n > 0) addSoulCrystals(n);
}

function addSoulCrystals(n) {
    if (!n) return;
    window.soulCrystals = Math.max(0, (window.soulCrystals || 0) + n);
    if (typeof updateEquipScBadge === 'function') updateEquipScBadge();
    if (window.EventBus && n > 0) EventBus.emit(GAME_EVENTS.EQUIP_NOTIF, { show: true });
    if (typeof saveGameData === 'function') saveGameData();
}

function spendSoulCrystals(n) {
    if ((window.soulCrystals || 0) < n) return false;
    window.soulCrystals -= n;
    if (typeof updateEquipScBadge === 'function') updateEquipScBadge();
    if (typeof saveGameData === 'function') saveGameData();
    return true;
}

function getRerollCost(tier) {
    return REROLL_SC_COST[tier] || 0;
}

/**
 * Rerolls a slot's stat using SC. Always applies the new roll (gamble).
 * Returns { ok, prevValue, newValue, cost } or { ok:false, reason }.
 */
function rerollEquipmentStat(slot) {
    const owned = window.ownedEquipment[slot];
    if (!owned || owned.tier <= 0) return { ok: false, reason: 'no-equip' };
    const cost = getRerollCost(owned.tier);
    if ((window.soulCrystals || 0) < cost) return { ok: false, reason: 'no-sc', cost };
    const prevValue = (typeof owned.value === 'number') ? owned.value : getTierStatValue(owned.tier, slot);
    const prevStat2 = owned.stat2 || null;
    const prevValue2 = (typeof owned.value2 === 'number') ? owned.value2 : 0;
    if (!spendSoulCrystals(cost)) return { ok: false, reason: 'no-sc', cost };
    const newValue = rollTierStatValue(owned.tier, slot);
    owned.value = newValue;
    let newStat2 = null, newValue2 = 0;
    if (owned.tier === MAX_EQUIP_TIER) {
        newStat2 = owned.stat2 || _pickSecondaryStat(slot);
        newValue2 = rollStatValueByName(owned.tier, newStat2);
        owned.stat2 = newStat2;
        owned.value2 = newValue2;
    }
    if (typeof saveGameData === 'function') saveGameData();
    return { ok: true, prevValue, newValue, prevStat2, prevValue2, newStat2, newValue2, cost };
}

// State: tier, count (lifetime drops), value (current rolled stat value).
// At max tier (4), gear also rolls a secondary stat: stat2 (string) + value2 (number).
// Default-fill (not overwrite): allies.js loadGameData() runs before this script
// and already populated saved slots from localStorage. Reassigning would wipe
// meta-progression on every page load — only fill in slots that don't exist.
const _EQUIP_SLOT_NAMES = [
    'mainhand', 'offhand', 'scepter', 'bow', 'dagger', 'staff',
    'helmet', 'armor', 'pauldrons', 'greaves', 'gloves', 'boots',
    'necklace', 'ring', 'earring', 'bracelet', 'belt', 'cloak'
];
window.ownedEquipment = window.ownedEquipment || {};
_EQUIP_SLOT_NAMES.forEach(slot => {
    if (!window.ownedEquipment[slot]) {
        window.ownedEquipment[slot] = { tier: 0, count: 0, value: 0, stat2: null, value2: 0 };
    }
});

// Tier at which a secondary stat is rolled.
const MAX_EQUIP_TIER = 4;

// Per-stat [min,max] range per tier. Index 0 unused, tiers 1-4.
// Stored in raw units (percentages as decimals, flat as integers).
const TIER_STAT_RANGES = {
    aura_range:            [null, [3, 10],    [8, 22],     [16, 42],    [30, 75]],
    se_gain:               [null, [1, 2],     [2, 4],      [3, 6],      [5, 10]],
    summon_cost_reduction: [null, [2, 7],     [5, 13],     [9, 22],     [16, 38]],
    treasure_chance:       [null, [0.004, 0.013], [0.009, 0.026], [0.017, 0.052], [0.033, 0.10]],
    crit_chance:           [null, [0.01, 0.05], [0.04, 0.09], [0.07, 0.13], [0.10, 0.20]],
    crit_damage:           [null, [0.08, 0.26], [0.18, 0.40], [0.27, 0.65], [0.45, 1.00]],
    portal_dmg_reduction:  [null, [0.02, 0.07], [0.05, 0.13], [0.09, 0.20], [0.13, 0.33]],
    slow_strength:         [null, [0.03, 0.10], [0.07, 0.20], [0.13, 0.32], [0.22, 0.52]],
    cooldown:              [null, [0.03, 0.10], [0.07, 0.20], [0.13, 0.28], [0.20, 0.40]],
    damage:                [null, [0.04, 0.13], [0.09, 0.26], [0.17, 0.45], [0.30, 0.65]],
};
const INT_STATS = new Set(['aura_range', 'se_gain', 'summon_cost_reduction']);
const STAT_POOL = Object.keys(TIER_STAT_RANGES);
const SECONDARY_STAT_SCALE = 0.5;

function _slotStat(slot) {
    const sd = (typeof equipmentSlots !== 'undefined') ? equipmentSlots[slot] : null;
    return sd ? sd.stat : '';
}

// Picks a random secondary stat distinct from the slot's primary stat.
function _pickSecondaryStat(slot) {
    const primary = _slotStat(slot);
    const pool = STAT_POOL.filter(s => s !== primary);
    return pool[Math.floor(Math.random() * pool.length)];
}

// Rolls a value for an arbitrary stat name within a given tier.
function rollStatValueByName(tier, statName) {
    const table = TIER_STAT_RANGES[statName];
    if (!table || !table[tier]) return 0;
    const [min, max] = table[tier];
    const v = (min + Math.random() * (max - min)) * SECONDARY_STAT_SCALE;
    if (INT_STATS.has(statName)) return Math.max(1, Math.round(v));
    return Math.round(v * 1000) / 1000;
}

// Returns [min,max] for an arbitrary stat name at a given tier.
function getStatRangeByName(tier, statName) {
    const table = TIER_STAT_RANGES[statName];
    if (!table || !table[tier]) return [0, 0];
    const [min, max] = table[tier];
    return [min * SECONDARY_STAT_SCALE, max * SECONDARY_STAT_SCALE];
}

/**
 * Returns [min, max] range for a stat at a given tier.
 */
function getTierStatRange(tier, slot) {
    if (tier <= 0 || tier > 4) return [0, 0];
    const stat = _slotStat(slot);
    const table = TIER_STAT_RANGES[stat];
    if (table && table[tier]) return table[tier].slice();
    const fallback = [null, [0.02, 0.07], [0.05, 0.16], [0.10, 0.33], [0.22, 0.65]];
    return fallback[tier].slice();
}

/**
 * Maximum possible stat value at a given tier (used for display references).
 */
function getTierStatValue(tier, slot) {
    if (tier <= 0) return 0;
    return getTierStatRange(tier, slot)[1];
}

/**
 * Rolls a random stat value within the tier's range.
 */
function rollTierStatValue(tier, slot) {
    if (tier <= 0) return 0;
    const [min, max] = getTierStatRange(tier, slot);
    const stat = _slotStat(slot);
    const v = min + Math.random() * (max - min);
    if (INT_STATS.has(stat)) return Math.max(1, Math.round(v));
    return Math.round(v * 1000) / 1000;
}

/**
 * Returns the effective (rolled) stat value for an owned slot. Falls back to
 * tier-max for legacy saves that lack the `value` field.
 */
function getOwnedStatValue(slot) {
    const owned = window.ownedEquipment[slot];
    if (!owned || owned.tier <= 0) return 0;
    if (typeof owned.value === 'number' && owned.value > 0) return owned.value;
    return getTierStatValue(owned.tier, slot);
}

/**
 * Checks if an enemy drops equipment upon death.
 */
function checkEquipmentDrop(enemy) {
    const isBoss = enemy.isBoss || false;
    const baseMult = isBoss ? 10 : 1;

    if (typeof equipmentTiers === 'undefined') return;

    for (let i = equipmentTiers.length - 1; i >= 0; i--) {
        const tier = equipmentTiers[i];
        const finalRate = tier.dropRate * baseMult;

        if (Math.random() < finalRate) {
            const slots = Object.keys(equipmentSlots);
            const randomSlot = slots[Math.floor(Math.random() * slots.length)];
            const rolled = rollTierStatValue(tier.id, randomSlot);
            addEquipment(randomSlot, tier.id, rolled);

            if (typeof spawnItemDrop === 'function' && enemy) {
                const lx = (enemy.x / 100) * (window.LOGICAL_WIDTH || 1080);
                spawnItemDrop(lx, enemy.y, `images/equipment/${randomSlot}.webp`, '#00e5ff');
            }
            return;
        }
    }
}

/**
 * Acquires equipment. Replaces only when the new drop's effective stat value
 * beats the currently owned one (higher tier, or same tier with higher roll).
 *   - tier > owned.tier         → REPLACE (UPGRADE)
 *   - tier === owned.tier && val > owned.value → REPLACE (REROLL UP)
 *   - else                       → discard, partial SE refund
 */
function addEquipment(slot, tier, value) {
    const owned = window.ownedEquipment[slot];
    if (!owned) return;
    if (typeof value !== 'number') value = rollTierStatValue(tier, slot);

    const prevTier  = owned.tier;
    const prevValue = (typeof owned.value === 'number') ? owned.value : getTierStatValue(prevTier, slot);

    const isUpgrade  = tier > prevTier;
    const isReroll   = tier === prevTier && value > prevValue;
    const accept     = (prevTier === 0) || isUpgrade || isReroll;

    owned.count = (owned.count || 0) + 1;

    if (!accept) {
        if (typeof money !== 'undefined') {
            money = Math.min(window.maxMoney || 1000, money + (tier * 10));
        }
        return;
    }

    owned.tier  = tier;
    owned.value = value;
    if (tier === MAX_EQUIP_TIER) {
        if (!owned.stat2) owned.stat2 = _pickSecondaryStat(slot);
        owned.value2 = rollStatValueByName(tier, owned.stat2);
    } else {
        owned.stat2 = null;
        owned.value2 = 0;
    }

    if (window.EventBus) EventBus.emit(GAME_EVENTS.EQUIP_NOTIF, { show: true });
    if (!window.unseenItems) window.unseenItems = new Set();
    window.unseenItems.add(slot);

    let status;
    if (prevTier === 0)       status = 'NEW';
    else if (isUpgrade)       status = 'UPGRADE';
    else                      status = 'REROLL';

    if (typeof showEquipInfoInPanel === 'function') showEquipInfoInPanel(slot, tier, isUpgrade || isReroll, status);
    if (typeof saveGameData === 'function') saveGameData();
}

/**
 * Total bonus for a stat across all owned slots. Uses rolled value when present.
 */
function getEquipBonus(statName) {
    let total = 0;
    if (typeof equipmentSlots === 'undefined') return 0;

    Object.keys(equipmentSlots).forEach(slot => {
        const owned = window.ownedEquipment[slot];
        if (!owned || owned.tier <= 0) return;
        if (equipmentSlots[slot].stat === statName) total += getOwnedStatValue(slot);
        if (owned.tier === MAX_EQUIP_TIER && owned.stat2 === statName && typeof owned.value2 === 'number') {
            total += owned.value2;
        }
    });
    return total;
}

// Returns { stat, value } for the secondary roll on a T4 slot, or null.
function getOwnedSecondary(slot) {
    const owned = window.ownedEquipment[slot];
    if (!owned || owned.tier !== MAX_EQUIP_TIER) return null;
    if (!owned.stat2 || typeof owned.value2 !== 'number' || owned.value2 <= 0) return null;
    return { stat: owned.stat2, value: owned.value2 };
}

// Window Exports
window.getTierStatRange    = getTierStatRange;
window.getTierStatValue    = getTierStatValue;
window.rollTierStatValue   = rollTierStatValue;
window.rollStatValueByName = rollStatValueByName;
window.getStatRangeByName  = getStatRangeByName;
window.getOwnedStatValue   = getOwnedStatValue;
window.getOwnedSecondary   = getOwnedSecondary;
window.MAX_EQUIP_TIER      = MAX_EQUIP_TIER;
window.checkEquipmentDrop  = checkEquipmentDrop;
window.addEquipment        = addEquipment;
window.getEquipBonus       = getEquipBonus;
window.checkSoulCrystalDrop = checkSoulCrystalDrop;
window.addSoulCrystals     = addSoulCrystals;
window.spendSoulCrystals   = spendSoulCrystals;
window.getRerollCost       = getRerollCost;
window.rerollEquipmentStat = rerollEquipmentStat;
