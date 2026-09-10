/* js/shrines_spawning.js - Handles the logic for building a new Shrine */

/**
 * Summons a random Shrine (Tier 1 or Tier 2) to an appropriate empty slot.
 */
function summonShrine() {
    if (!window.logicalSlots) return;

    // Tier-2 (sacred) shrines: 15% roll, only into bottom-row tier-2 slots, own cap.
    const hasRoom = (tier) => {
        const cap   = (tier === 2) ? (window.maxTier2Shrines || 6) : (window.maxTier1Shrines || 8);
        const built = towers.filter(t => t.isShrine && (t.data.tier || 1) === tier).length;
        const free  = window.logicalSlots.some(s => s.type === 'shrine' && !s.isOccupied && (s.tier || 1) === tier);
        return built < cap && free;
    };
    const tier2Data  = shrineTypes.filter(s => s.tier === 2);
    const targetTier = (tier2Data.length > 0 && Math.random() < 0.15 && hasRoom(2)) ? 2 : 1;
    if (targetTier === 1 && !hasRoom(1)) {
        if (typeof GameLogger !== 'undefined') GameLogger.warn('No empty shrine slots or shrine limit reached');
        return;
    }
    const emptySlots = window.logicalSlots.filter(s => s.type === 'shrine' && !s.isOccupied && (s.tier || 1) === targetTier);

    const relicReduce = (typeof getRelicBonus === 'function') ? getRelicBonus('summon_cost_reduction') : 0;
    const equipReduce = (typeof getEquipBonus === 'function') ? getEquipBonus('summon_cost_reduction') : 0;
    const finalShrineCost = Math.max(10, Math.floor(window.shrineCost - equipReduce - relicReduce));

    if (money < finalShrineCost) {
        if (typeof GameLogger !== 'undefined') GameLogger.warn("Shrine failed: Insufficient SE");
        if (typeof flashResourceError === 'function') flashResourceError('se');
        return;
    }

    const tierData   = (targetTier === 2) ? tier2Data : shrineTypes.filter(s => s.tier === 1);
    const chosenData = tierData[Math.floor(Math.random() * tierData.length)];

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
