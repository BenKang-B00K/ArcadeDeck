/* relics_system.js - Core Logic for Relic Collection, Stats, and Drops */

window.collectedRelics = {}; // ID: count

// Soul Fragment — currency for crafting relics.
window.soulFragments = window.soulFragments || 0;

// SF craft cost by relic rarity bucket. Boss/ancient cannot be crafted.
const SF_CRAFT_COST = {
    normal:  30,   // specter / wraith / spirit / all
    supreme: 120   // demon
};

// SF drop chance / amount per kill bucket. Slightly rarer than Soul Crystals.
function _rollSoulFragmentDrop(enemy) {
    if (!enemy) return 0;
    if (enemy.isBoss || enemy.isPactBoss) return 4 + Math.floor(Math.random() * 3); // 4–6
    const d = enemy.danger || 0;
    if (d >= 9) return Math.random() < 0.08 ? 2 : (Math.random() < 0.18 ? 1 : 0);
    if (d >= 7) return Math.random() < 0.04 ? 1 : 0;
    if (d >= 4) return Math.random() < 0.015 ? 1 : 0;
    return Math.random() < 0.006 ? 1 : 0;
}

function checkSoulFragmentDrop(enemy) {
    const n = _rollSoulFragmentDrop(enemy);
    if (n > 0) addSoulFragments(n);
}

function addSoulFragments(n) {
    if (!n) return;
    window.soulFragments = Math.max(0, (window.soulFragments || 0) + n);
    if (typeof updateRelicSfBadge === 'function') updateRelicSfBadge();
    if (window.EventBus && n > 0) EventBus.emit(GAME_EVENTS.RELIC_NOTIF, { show: true });
    if (typeof saveGameData === 'function') saveGameData();
}

function spendSoulFragments(n) {
    if ((window.soulFragments || 0) < n) return false;
    window.soulFragments -= n;
    if (typeof updateRelicSfBadge === 'function') updateRelicSfBadge();
    if (typeof saveGameData === 'function') saveGameData();
    return true;
}

// Map dropSource → craft tier key. null = uncraftable.
function getRelicCraftTier(dropSource) {
    if (['specter', 'wraith', 'spirit', 'all'].includes(dropSource)) return 'normal';
    if (dropSource === 'demon') return 'supreme';
    return null; // abyssal_boss, supreme_boss = uncraftable
}

function getRelicCraftCost(tierKey) {
    return SF_CRAFT_COST[tierKey] || 0;
}

/**
 * Crafts a random relic from a given tier bucket using SF.
 * Returns { ok, id, cost } or { ok:false, reason }.
 */
function craftRelicByTier(tierKey) {
    const cost = getRelicCraftCost(tierKey);
    if (!cost) return { ok: false, reason: 'invalid-tier' };
    if ((window.soulFragments || 0) < cost) return { ok: false, reason: 'no-sf', cost };

    // Build pool: relics in tier bucket NOT at maxStack.
    const pool = [];
    for (const id in relicsData) {
        const r = relicsData[id];
        if (getRelicCraftTier(r.dropSource) !== tierKey) continue;
        if ((window.collectedRelics[id] || 0) >= r.maxStack) continue;
        pool.push(id);
    }
    if (pool.length === 0) return { ok: false, reason: 'pool-empty', cost };

    if (!spendSoulFragments(cost)) return { ok: false, reason: 'no-sf', cost };

    const chosenId = pool[Math.floor(Math.random() * pool.length)];
    collectRelic(chosenId);
    return { ok: true, id: chosenId, cost };
}
let totalRelicBonuses = {
    damage: 0,
    range: 0,
    cooldown: 0,
    crit_chance: 0,
    crit_damage: 0,
    slow_strength: 0,
    portal_dmg_reduction: 0,
    summon_cost_reduction: 0,
    execute_threshold: 0,
    aura_range: 0,
    sell_refund: 0,
    shrine_mastery: 0,
    crit_chain: 0,
    portal_heal_chance: 0,
    echo_shot_chance: 0,
    combo_damage: 0,
    death_save: 0,
    surge_interval_reduction: 0,
    void_mark_cap: 0,
    adjacency_damage: 0,
    ledger_stacks: 0,
    demon_pact: 0
};

// Combo state for carnage_pulse. Decays after 2s of no kill.
window.comboState = window.comboState || { count: 0, lastKillMs: 0 };
// Per-run death_save charges used (resets on resetGameState).
window.deathSaveUsed = window.deathSaveUsed || 0;
// Abyssal Surge timer state (abyssal_fragment).
window.surgeState = window.surgeState || { lastTriggerMs: 0, activeUntilMs: 0 };
// Cumulative kill counter for infernal_ledger.
window.totalKillsCounter = window.totalKillsCounter || 0;

const SURGE_BASE_INTERVAL_MS = 30000;
const SURGE_STEP_MS = 3000;
const SURGE_MIN_INTERVAL_MS = 15000;
const SURGE_DURATION_MS = 5000;

function tickAbyssalSurge(now) {
    const stacks = (typeof countRelicStacks === 'function') ? countRelicStacks('surge_interval_reduction') : 0;
    if (stacks <= 0) return;
    const interval = Math.max(SURGE_MIN_INTERVAL_MS, SURGE_BASE_INTERVAL_MS - SURGE_STEP_MS * stacks);
    if (now - (window.surgeState.lastTriggerMs || 0) < interval) return;
    window.surgeState.lastTriggerMs = now;
    window.surgeState.activeUntilMs = now + SURGE_DURATION_MS;
    if (typeof spawnFloatingText === 'function') {
        spawnFloatingText((window.t ? window.t('ui.relics.float_surge', '심연 가속!') : '심연 가속!'), (window.LOGICAL_WIDTH || 1080) / 2, 240, '#b388ff', 28);
    }
    if (typeof spawnParticles === 'function') {
        spawnParticles((window.LOGICAL_WIDTH || 1080) / 2, 240, '#b388ff', 12);
    }
}

function isAbyssalSurgeActive() {
    return Date.now() < (window.surgeState ? window.surgeState.activeUntilMs : 0);
}

const LEDGER_BASE_THRESHOLD = 100;
const LEDGER_STEP = 10;
const LEDGER_MIN_THRESHOLD = 50;
const LEDGER_BASE_REWARD = 500;
const LEDGER_STACK_REWARD = 100;

function checkLedgerWindfall() {
    const stacks = (typeof countRelicStacks === 'function') ? countRelicStacks('ledger_stacks') : 0;
    if (stacks <= 0) return;
    const threshold = Math.max(LEDGER_MIN_THRESHOLD, LEDGER_BASE_THRESHOLD - LEDGER_STEP * stacks);
    if (window.totalKillsCounter <= 0) return;
    if (window.totalKillsCounter % threshold !== 0) return;
    const reward = LEDGER_BASE_REWARD + LEDGER_STACK_REWARD * stacks;
    const limit = (typeof window.maxMoney !== 'undefined') ? window.maxMoney : 1000;
    window.money = Math.min(limit, (window.money || 0) + reward);
    if (typeof spawnFloatingText === 'function') {
        spawnFloatingText('+' + reward + (window.t ? window.t('ui.relics.float_ledger_suffix', ' SE 청구!') : ' SE 청구!'), (window.LOGICAL_WIDTH || 1080) / 2, 280, '#ffd700', 24);
    }
    if (typeof GameLogger !== 'undefined') {
        const _Tl = window.t || ((k, f) => f);
        GameLogger.success(_Tl('ui.relics.log_ledger_windfall', '영혼 청구서: +{n} SE').replace('{n}', reward));
    }
}

const COMBO_WINDOW_MS = 2000;
const COMBO_MAX = 20;

function incrementCombo() {
    const now = Date.now();
    if (now - window.comboState.lastKillMs > COMBO_WINDOW_MS) window.comboState.count = 0;
    window.comboState.count = Math.min(COMBO_MAX, window.comboState.count + 1);
    window.comboState.lastKillMs = now;
}

function getComboDamageMultiplier() {
    if (!window.comboState) return 0;
    if (Date.now() - window.comboState.lastKillMs > COMBO_WINDOW_MS) {
        window.comboState.count = 0;
        return 0;
    }
    const perStack = (typeof getRelicBonus === 'function') ? getRelicBonus('combo_damage') : 0;
    return window.comboState.count * perStack;
}

function tryConsumeDeathSave() {
    const charges = (typeof countRelicStacks === 'function') ? countRelicStacks('death_save') : 0;
    const used = window.deathSaveUsed || 0;
    if (charges - used <= 0) return false;
    window.deathSaveUsed = used + 1;
    window.portalEnergy = (window.maxPortalEnergy || 1500) * 0.5;
    for (let i = window.enemies.length - 1; i >= 0; i--) {
        const e = window.enemies[i];
        if (!e || e.isBoss) continue;
        e.hp = 0;
        if (typeof spawnParticles === 'function') {
            const lx = (e.x / 100) * (window.LOGICAL_WIDTH || 1080);
            spawnParticles(lx, e.y, '#ffd700', 6);
        }
        window.enemies.splice(i, 1);
    }
    if (typeof GameLogger !== 'undefined') GameLogger.success((window.t ? window.t('ui.relics.log_revival', '영혼 부활! 포탈 복원.') : '영혼 부활! 포탈 복원.'));
    if (typeof spawnFloatingText === 'function') {
        spawnFloatingText((window.t ? window.t('ui.relics.float_revival', '영혼 부활!') : '영혼 부활!'), (window.LOGICAL_WIDTH || 1080) / 2, 200, '#ffd700', 32);
    }
    return true;
}

/**
 * Global hook to retrieve the current total bonus for a specific stat.
 */
function getRelicBonus(type) {
    return totalRelicBonuses[type] || 0;
}

/**
 * Count total relic stacks (duplicates included) contributing to a bonus type.
 */
function countRelicStacks(type) {
    let n = 0;
    for (const id in window.collectedRelics) {
        const r = (typeof relicsData !== 'undefined') ? relicsData[id] : null;
        if (r && r.bonus && r.bonus.type === type) n += (window.collectedRelics[id] || 0);
    }
    return n;
}

/**
 * Handles the acquisition of a relic.
 * @param {string} id - The unique ID of the relic.
 */
function collectRelic(id) {
    if (!relicsData[id]) return false;
    const data = relicsData[id];
    const currentCount = window.collectedRelics[id] || 0;

    if (currentCount < data.maxStack) {
        window.collectedRelics[id] = currentCount + 1;
        if (typeof GameLogger !== 'undefined') GameLogger.success(`Acquired: ${data.name}`);

        // UI notification (status: NEW first acquire, EXISTING duplicate)
        const status = currentCount === 0 ? 'NEW' : 'EXISTING';
        if (typeof showRelicInfoInPanel === 'function') showRelicInfoInPanel(id, status);
        if (window.EventBus) EventBus.emit(GAME_EVENTS.RELIC_NOTIF, { show: true });
        
        // Recalculate bonuses immediately to sync systems
        updateTotalRelicBonuses();
        
        if (typeof saveGameData === 'function') saveGameData();
        return true;
    }
    return false;
}

/**
 * Recalculates all active bonuses from collected relics.
 */
function updateTotalRelicBonuses() {
    // Zero existing keys in place so any in-flight getRelicBonus() reader keeps
    // its reference. Reassigning the object would race with same-frame callers.
    for (const k in totalRelicBonuses) totalRelicBonuses[k] = 0;
    for (let id in window.collectedRelics) {
        const count = window.collectedRelics[id];
        const relic = relicsData[id];
        if (relic && relic.bonus) {
            totalRelicBonuses[relic.bonus.type] = (totalRelicBonuses[relic.bonus.type] || 0) + (relic.bonus.value * count);
        }
    }

    // Sync specific bonuses to global state (e.g., max SE limit)
    if (typeof maxMoney !== 'undefined') {
        const bonusSE = totalRelicBonuses['se_max_limit'] || 0;
        window.maxMoney = 1000 + Math.floor(bonusSE);
        
    }
}

/**
 * Checks if an enemy drops a relic upon death.
 * Implements weighted drop rates for normal enemies and exclusive drops for bosses.
 */
function checkRelicDrop(enemy) {
    if (Math.random() > 0.02 && !enemy.isBoss) return;

    let availableRelics = [];
    for (let id in relicsData) {
        if ((window.collectedRelics[id] || 0) < relicsData[id].maxStack) {
            availableRelics.push({ id: id, data: relicsData[id] });
        }
    }

    if (availableRelics.length === 0) return;

    let possibleIds = [];

    if (enemy.isBoss) {
        // Pact boss → supreme_boss pool, regular boss → abyssal_boss pool
        const bossSource = enemy.isPactBoss ? 'supreme_boss' : 'abyssal_boss';
        possibleIds = availableRelics.filter(r => r.data.dropSource === bossSource).map(r => r.id);
    } else {
        // Normal enemies drop via weighted pool.
        // common (specter/wraith/spirit/all)=60, demon=20, supreme_boss=3
        const commonSources = ['specter', 'wraith', 'spirit', 'all'];
        const pool = availableRelics.filter(r => [...commonSources, 'demon', 'supreme_boss'].includes(r.data.dropSource));
        if (pool.length === 0) return;

        let totalWeight = 0;
        const weightedPool = pool.map(r => {
            let weight = 0;
            if (commonSources.includes(r.data.dropSource)) weight = 60;
            else if (r.data.dropSource === 'demon') weight = 20;
            else if (r.data.dropSource === 'supreme_boss') weight = 3;

            totalWeight += weight;
            return { id: r.id, weight: weight };
        });

        let randomVal = Math.random() * totalWeight;
        let selectedId = null;

        for (let item of weightedPool) {
            randomVal -= item.weight;
            if (randomVal <= 0) {
                selectedId = item.id;
                break;
            }
        }
        if (selectedId) possibleIds.push(selectedId);
    }

    if (possibleIds.length > 0) {
        const chosenId = possibleIds[Math.floor(Math.random() * possibleIds.length)];
        if (collectRelic(chosenId)) {
            if (typeof spawnItemDrop === 'function' && enemy) {
                const lx = (enemy.x / 100) * window.LOGICAL_WIDTH;
                spawnItemDrop(lx, enemy.y, `images/relics/${chosenId}.webp`, '#ff4500');
            }
        }
    }
}

/**
 * Resets all relic progress.
 */
function resetRelics() {
    for (let key in window.collectedRelics) delete window.collectedRelics[key];
    updateTotalRelicBonuses();
    if (typeof renderTotalBonuses === 'function') renderTotalBonuses();
}

// Window Exports
window.getRelicBonus = getRelicBonus;
window.countRelicStacks = countRelicStacks;
window.checkRelicDrop = checkRelicDrop;
window.collectRelic = collectRelic;
window.resetRelics = resetRelics;
window.updateTotalRelicBonuses = updateTotalRelicBonuses;
window.checkSoulFragmentDrop = checkSoulFragmentDrop;
window.addSoulFragments = addSoulFragments;
window.spendSoulFragments = spendSoulFragments;
window.getRelicCraftTier = getRelicCraftTier;
window.getRelicCraftCost = getRelicCraftCost;
window.craftRelicByTier = craftRelicByTier;
window.incrementCombo = incrementCombo;
window.getComboDamageMultiplier = getComboDamageMultiplier;
window.tryConsumeDeathSave = tryConsumeDeathSave;
window.tickAbyssalSurge = tickAbyssalSurge;
window.isAbyssalSurgeActive = isAbyssalSurgeActive;
window.checkLedgerWindfall = checkLedgerWindfall;
