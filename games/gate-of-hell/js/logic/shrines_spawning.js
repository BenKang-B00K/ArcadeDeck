/* js/shrines_spawning.js - Handles the logic for building a new Shrine */

/**
 * Summons a random Shrine (Tier 1 or Tier 2) to an appropriate empty slot.
 */
function summonShrine() {
    if (!window.logicalSlots) return;

    const currentShrines = towers.filter(t => t.isShrine).length;
    const maxShrines = window.maxTier1Shrines || 14;
    if (currentShrines >= maxShrines) {
        if (typeof GameLogger !== 'undefined') GameLogger.warn(`Limit Reached: Max Shrines (${maxShrines})`);
        return;
    }

    const emptySlots = window.logicalSlots.filter(s => s.type === 'shrine' && !s.isOccupied && s.tier !== 2);
    if (emptySlots.length === 0) {
        if (typeof GameLogger !== 'undefined') GameLogger.warn('No empty shrine slots!');
        return;
    }

    const relicReduce = (typeof getRelicBonus === 'function') ? getRelicBonus('summon_cost_reduction') : 0;
    const equipReduce = (typeof getEquipBonus === 'function') ? getEquipBonus('summon_cost_reduction') : 0;
    const finalShrineCost = Math.max(10, Math.floor(window.shrineCost - equipReduce - relicReduce));

    if (money < finalShrineCost) {
        if (typeof GameLogger !== 'undefined') GameLogger.warn("Shrine failed: Insufficient SE");
        if (typeof flashResourceError === 'function') flashResourceError('se');
        return;
    }

    // Only tier 1 shrines
    const tier1Data = shrineTypes.filter(s => s.tier === 1);
    const chosenData = tier1Data[Math.floor(Math.random() * tier1Data.length)];

    money -= finalShrineCost;
    window.shrineCost += window.shrineCostIncrement;

    const randomSlot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
    if (typeof GameLogger !== 'undefined') GameLogger.success(`Shrine Created: ${chosenData.name}`);
    if (typeof spawnLightPillar === 'function') spawnLightPillar(randomSlot.lx, randomSlot.ly);

    randomSlot.isOccupied = true;

    const tower = {
        data: chosenData,
        currentSlot: randomSlot,
        lx: randomSlot.lx,
        ly: randomSlot.ly,
        level: 1,
        lastShot: 0,
        range: 0,
        cooldown: 0,
        spentSE: finalShrineCost,
        isShrine: true,
        isDemolishing: false
    };

    towers.push(tower);
    if (typeof updateSummonButtonState === 'function') updateSummonButtonState();
    if (typeof saveProgress === 'function') saveProgress();
}

window.summonShrine = summonShrine;
