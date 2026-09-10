/* equipment_system.js - Core Logic for Equipment Scaling, Drops, and Stats */

// Soul Crystal — currency for rerolling equipment stat values.
window.soulCrystals = window.soulCrystals || 0;

// SC cost to reroll an equipment slot's stat, indexed by tier (1..6).
const REROLL_SC_COST = [0, 1, 3, 8, 20, 50, 120];

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
    const prevBonuses = getOwnedBonuses(slot).map(b => ({ stat: b.stat, value: b.value }));
    const prevStat2 = prevBonuses.length ? prevBonuses[0].stat : null;
    const prevValue2 = prevBonuses.length ? prevBonuses[0].value : 0;
    if (!spendSoulCrystals(cost)) return { ok: false, reason: 'no-sc', cost };
    const newValue = rollTierStatValue(owned.tier, slot);
    owned.value = newValue;
    _syncBonuses(slot, owned.tier);
    const newBonuses = getOwnedBonuses(slot).map(b => ({ stat: b.stat, value: b.value }));
    const newStat2 = newBonuses.length ? newBonuses[0].stat : null;
    const newValue2 = newBonuses.length ? newBonuses[0].value : 0;
    if (typeof saveGameData === 'function') saveGameData();
    return { ok: true, prevValue, newValue, prevBonuses, newBonuses, prevStat2, prevValue2, newStat2, newValue2, cost };
}

// State: tier, count (lifetime drops), value (current rolled stat value).
// From tier 4 up, gear also rolls bonus stats into `bonuses` ([{stat,value}],
// 1 at Ancient / 2 at Mythic / 3 at Transcendent). The legacy stat2 + value2
// fields mirror the first bonus for backward compatibility.
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
        window.ownedEquipment[slot] = { tier: 0, count: 0, value: 0, bonuses: [], stat2: null, value2: 0 };
    }
});

const MAX_EQUIP_TIER = 6;
// Lowest tier that rolls a secondary stat. Kept at 4 rather than tracking
// MAX_EQUIP_TIER: raising it with the new tiers would strip the bonus stat off
// every Ancient item already sitting in a player's save.
const SECONDARY_STAT_MIN_TIER = 4;
// How many bonus stats a tier rolls: Ancient 1, Mythic 2, Transcendent 3.
const SECONDARY_SLOTS_BY_TIER = { 4: 1, 5: 2, 6: 3 };
const secondarySlotCount = (tier) => SECONDARY_SLOTS_BY_TIER[tier] || 0;
const hasSecondarySlot = (tier) => secondarySlotCount(tier) > 0;

/**
 * Bonus stats on an owned slot as [{ stat, value }].
 * Migrates legacy single-bonus saves (stat2/value2) on read, so gear saved
 * before multi-bonus keeps its roll instead of silently losing it.
 */
function getOwnedBonuses(slot) {
    const owned = window.ownedEquipment[slot];
    if (!owned || !hasSecondarySlot(owned.tier)) return [];
    if (!Array.isArray(owned.bonuses)) {
        owned.bonuses = (owned.stat2 && typeof owned.value2 === 'number' && owned.value2 > 0)
            ? [{ stat: owned.stat2, value: owned.value2 }]
            : [];
    }
    return owned.bonuses;
}

// Keeps existing bonus stats, rerolls their values at `tier`, and fills any
// slots the tier newly unlocked. Never shrinks a roll the player already has.
function _syncBonuses(slot, tier) {
    const owned = window.ownedEquipment[slot];
    if (!owned) return;
    if (!hasSecondarySlot(tier)) { owned.bonuses = []; owned.stat2 = null; owned.value2 = 0; return; }

    const want = secondarySlotCount(tier);
    const kept = getOwnedBonuses(slot).slice(0, want);
    const used = new Set(kept.map(b => b.stat));
    while (kept.length < want) {
        const pick = _pickSecondaryStat(slot, used);
        if (!pick) break;
        used.add(pick);
        kept.push({ stat: pick, value: 0 });
    }
    kept.forEach(b => { b.value = rollStatValueByName(tier, b.stat); });
    owned.bonuses = kept;
    // Mirrored onto the legacy fields so an older build reading the save still
    // sees the first bonus rather than nothing.
    owned.stat2  = kept.length ? kept[0].stat  : null;
    owned.value2 = kept.length ? kept[0].value : 0;
}

// Per-stat [min,max] range per tier. Index 0 unused, tiers 1-6.
// Stored in raw units (percentages as decimals, flat as integers).
//
// summon_cost_reduction is deliberately far flatter than the rest: it is a flat
// SE subtraction (allies_spawning.js), belt AND earring both roll it, and the
// totals stack, so the old curve (38 max each at tier 4) drove every summon to
// the 5 SE floor. It now tops out at 11 per slot even at the new max tier.
const TIER_STAT_RANGES = {
    aura_range:            [null, [3, 10],    [8, 22],     [16, 42],    [30, 75],    [50, 120],   [80, 190]],
    se_gain:               [null, [1, 2],     [2, 4],      [3, 6],      [5, 10],     [8, 16],     [12, 25]],
    summon_cost_reduction: [null, [1, 2],     [2, 3],      [3, 4],      [4, 6],      [6, 8],      [8, 11]],
    treasure_chance:       [null, [0.004, 0.013], [0.009, 0.026], [0.017, 0.052], [0.033, 0.10], [0.055, 0.16], [0.09, 0.25]],
    crit_chance:           [null, [0.01, 0.05], [0.04, 0.09], [0.07, 0.13], [0.10, 0.20], [0.15, 0.28], [0.20, 0.38]],
    crit_damage:           [null, [0.08, 0.26], [0.18, 0.40], [0.27, 0.65], [0.45, 1.00], [0.70, 1.55], [1.05, 2.30]],
    portal_dmg_reduction:  [null, [0.02, 0.07], [0.05, 0.13], [0.09, 0.20], [0.13, 0.33], [0.20, 0.48], [0.28, 0.65]],
    slow_strength:         [null, [0.03, 0.10], [0.07, 0.20], [0.13, 0.32], [0.22, 0.52], [0.34, 0.75], [0.48, 1.00]],
    cooldown:              [null, [0.03, 0.10], [0.07, 0.20], [0.13, 0.28], [0.20, 0.40], [0.30, 0.58], [0.42, 0.80]],
    damage:                [null, [0.04, 0.13], [0.09, 0.26], [0.17, 0.45], [0.30, 0.65], [0.46, 0.95], [0.65, 1.35]],
};
const INT_STATS = new Set(['aura_range', 'se_gain', 'summon_cost_reduction']);
const STAT_POOL = Object.keys(TIER_STAT_RANGES);
const SECONDARY_STAT_SCALE = 0.5;
// Per-stat override of the secondary-roll scale. summon_cost_reduction is
// cut further here: as a bonus stat any slot can roll it, so the half-scale
// default would let it stack back up across all 18 slots.
const SECONDARY_STAT_SCALE_BY_STAT = { summon_cost_reduction: 0.2 };
const secondaryScale = (statName) =>
    (statName in SECONDARY_STAT_SCALE_BY_STAT) ? SECONDARY_STAT_SCALE_BY_STAT[statName] : SECONDARY_STAT_SCALE;

function _slotStat(slot) {
    const sd = (typeof equipmentSlots !== 'undefined') ? equipmentSlots[slot] : null;
    return sd ? sd.stat : '';
}

// Picks a random secondary stat distinct from the slot's primary stat and from
// any already-assigned bonus stats, so one item never doubles up on a stat.
function _pickSecondaryStat(slot, exclude) {
    const primary = _slotStat(slot);
    const taken = exclude || new Set();
    const pool = STAT_POOL.filter(s => s !== primary && !taken.has(s));
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
}

// Rolls a value for an arbitrary stat name within a given tier.
function rollStatValueByName(tier, statName) {
    const table = TIER_STAT_RANGES[statName];
    if (!table || !table[tier]) return 0;
    const [min, max] = table[tier];
    const v = (min + Math.random() * (max - min)) * secondaryScale(statName);
    if (INT_STATS.has(statName)) return Math.max(1, Math.round(v));
    return Math.round(v * 1000) / 1000;
}

// Returns [min,max] for an arbitrary stat name at a given tier.
function getStatRangeByName(tier, statName) {
    const table = TIER_STAT_RANGES[statName];
    if (!table || !table[tier]) return [0, 0];
    const [min, max] = table[tier];
    const sc = secondaryScale(statName);
    // Integer stats round on roll, so round the advertised range the same way -
    // otherwise a legitimate roll displays as beating its own stated maximum.
    if (INT_STATS.has(statName)) {
        return [Math.max(1, Math.round(min * sc)), Math.max(1, Math.round(max * sc))];
    }
    return [min * sc, max * sc];
}

/**
 * Returns [min, max] range for a stat at a given tier.
 */
function getTierStatRange(tier, slot) {
    if (tier <= 0 || tier > MAX_EQUIP_TIER) return [0, 0];
    const stat = _slotStat(slot);
    const table = TIER_STAT_RANGES[stat];
    if (table && table[tier]) return table[tier].slice();
    const fallback = [null, [0.02, 0.07], [0.05, 0.16], [0.10, 0.33], [0.22, 0.65], [0.34, 0.95], [0.50, 1.35]];
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
    _syncBonuses(slot, tier);

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
        getOwnedBonuses(slot).forEach(b => { if (b.stat === statName) total += b.value; });
    });
    return total;
}

// First bonus roll on a slot, or null. Kept for callers that only need one;
// getOwnedBonuses() returns the full list.
function getOwnedSecondary(slot) {
    return getOwnedBonuses(slot)[0] || null;
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
window.SECONDARY_STAT_MIN_TIER = SECONDARY_STAT_MIN_TIER;
window.hasSecondarySlot    = hasSecondarySlot;
window.secondarySlotCount  = secondarySlotCount;
window.getOwnedBonuses     = getOwnedBonuses;
window.checkEquipmentDrop  = checkEquipmentDrop;
window.addEquipment        = addEquipment;
window.getEquipBonus       = getEquipBonus;
window.checkSoulCrystalDrop = checkSoulCrystalDrop;
window.addSoulCrystals     = addSoulCrystals;
window.spendSoulCrystals   = spendSoulCrystals;
window.getRerollCost       = getRerollCost;
window.rerollEquipmentStat = rerollEquipmentStat;
