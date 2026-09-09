/* allies_spawning.js - Handles logic for summoning new towers/units */

/**
 * Summons a tier-1 unit (uniform random from the T1 pool) to the specified slot.
 */
const T1_SUMMON_POOL = ['novice_exorcist', 'apprentice', 'acolyte_priest', 'acolyte_warrior'];

function summonTower(targetSlot) {
    if (!targetSlot || targetSlot.isOccupied) return;

    const reduction = (typeof getRelicBonus === 'function') ? getRelicBonus('summon_cost_reduction') : 0;
    const equipReduction = (typeof getEquipBonus === 'function') ? getEquipBonus('summon_cost_reduction') : 0;
    const finalTowerCost = Math.max(5, Math.floor(window.towerCost - equipReduction - reduction));

    if (money < finalTowerCost || towers.filter(t => !t.isShrine).length >= maxTowers) {
        if (money < finalTowerCost) {
            if (typeof GameLogger !== 'undefined') GameLogger.warn("Summon failed: Insufficient SE");
            if (typeof flashResourceError === 'function') flashResourceError('se');
        } else {
            if (typeof GameLogger !== 'undefined') GameLogger.warn(`Summon failed: Max Unit Limit (${maxTowers})`);
        }
        if (typeof updateSummonButtonState === 'function') updateSummonButtonState();
        return;
    }

    money -= finalTowerCost;

    // Uniform random draw from T1 pool
    const unitKey = T1_SUMMON_POOL[Math.floor(Math.random() * T1_SUMMON_POOL.length)];
    const unitData = unitTypes.find(u => u.type === unitKey);
    if (!unitData) {
        console.error(`CRITICAL: ${unitKey} unit data not found!`);
        return;
    }

    if (typeof GameLogger !== 'undefined') GameLogger.success(`Summoned: ${unitData.name}`);

    targetSlot.isOccupied = true;

    const tower = {
        data: unitData,
        currentSlot: targetSlot,
        lx: targetSlot.lx,
        ly: targetSlot.ly,
        level: 1,
        kills: 0,
        lastShot: 0,
        range: unitData.range,
        cooldown: unitData.cooldown,
        spentSE: finalTowerCost,
        isShrine: false
    };

    towers.push(tower);
    if (typeof spawnSummonCircle === 'function') spawnSummonCircle(targetSlot.lx, targetSlot.ly);
    if (typeof recordUnlock === 'function') recordUnlock(unitKey);
    window.towerCost += (window.towerCostIncrement || 5);
    if (typeof updateSummonButtonState === 'function') updateSummonButtonState();
    if (typeof saveProgress === 'function') saveProgress();
}

/**
 * Automatically summons a unit to a random empty valid slot.
 */
function summonUnitAuto() {
    if (!window.logicalSlots) return;
    const emptySlots = window.logicalSlots.filter(s => s.type === 'unit' && !s.isOccupied);
    if (emptySlots.length > 0) {
        summonTower(emptySlots[Math.floor(Math.random() * emptySlots.length)]);
    }
}

// Global Exports
window.summonTower = summonTower;
window.summonUnit = summonUnitAuto;
