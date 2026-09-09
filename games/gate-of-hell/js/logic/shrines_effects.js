/* js/shrines_effects.js - Divine Buff Management and Demolition Cleanup */

/**
 * Applies static buffs from all active Shrines to nearby/global allies.
 * Called every frame in the main game loop.
 */
function applyShrineBuffs() {
    // Reset temporary buffs on all units
    towers.forEach(t => { 
        if (!t.isShrine) {
            t.shrineDmgBonus = 0; 
            t.shrineSpeedBonus = 0;
            t.shrineRangeBonus = 0;
            t.shrineCritChance = 0;
            t.shrineSEBonus = 0;
            t.shrinePERecovery = 0;
            t.shrineCritDmg = 0;
            t.shrineHaloTier1 = false;
            t.shrineHaloTier2 = false;
        }
    });

    // Reset global enemy debuffs
    window.globalEnemySlow = 0;
    window.globalPurityDemolishPenalty = 0;

    const mastery = (typeof getRelicBonus === 'function') ? getRelicBonus('shrine_mastery') : 0;
    const shrines = towers.filter(t => t.isShrine);

    shrines.forEach(shrine => {
        const data = shrine.data;
        const isDemolishing = shrine.isDemolishing;
        const isGlobal = data.rangeType === 'all';
        const effectMult = isGlobal ? (1.0 + mastery) : 1.0;

        // Handle Demolition Penalties (Global)
        if (isDemolishing) {
            if (data.type === 'shrine_purity') {
                window.globalPurityDemolishPenalty += 0.02; // Stacks per demolished purity shrine
            }
            
            towers.forEach(t => {
                if (!t.isShrine) {
                    const b = data.bonus;
                    if (b.type === 'damage') t.shrineDmgBonus -= b.value;
                    else if (b.type === 'speed') t.shrineSpeedBonus -= b.value;
                    else if (b.type === 'range') t.shrineRangeBonus -= b.value;
                    else if (b.type === 'crit_chance') t.shrineCritChance -= b.value;
                    else if (b.type === 'se_gain') t.shrineSEBonus -= b.value;
                    else if (b.type === 'pe_recovery') t.shrinePERecovery -= b.value;
                    else if (b.type === 'crit_damage') t.shrineCritDmg -= b.value;
                }
            });
            return; // Skip buff logic if demolishing
        }

        if (isGlobal) {
            if (data.bonus.type === 'time_slow') {
                window.globalEnemySlow = Math.max(window.globalEnemySlow, data.bonus.value * effectMult);
                return;
            }

            towers.forEach(t => {
                if (!t.isShrine) {
                    const b = data.bonus;
                    if (b.type === 'damage') t.shrineDmgBonus += b.value * effectMult;
                    else if (b.type === 'crit_damage') t.shrineCritDmg += b.value * effectMult;
                    t.shrineHaloTier2 = true;
                }
            });
            return;
        }

        // Tier 1: buffs all units in same row, same side.
        // Mastery relic extends to ±1 adjacent row.
        // Tier 2 shrines use rangeType:'all' above and never reach here.
        if (!shrine.currentSlot) return;
        const shrineArea = shrine.currentSlot.area;
        const shrineRow  = Math.floor(shrine.currentSlot.index / 3);
        const rowSpan    = (mastery > 0) ? 1 : 0;
        towers.forEach(t => {
            if (t === shrine || t.isShrine || !t.currentSlot) return;
            if (t.currentSlot.area !== shrineArea) return;
            const unitRow = Math.floor(t.currentSlot.index / 3);
            if (Math.abs(unitRow - shrineRow) > rowSpan) return;
            const b = data.bonus;
            if (b.type === 'damage') t.shrineDmgBonus += b.value * effectMult;
            else if (b.type === 'speed') t.shrineSpeedBonus += b.value * effectMult;
            else if (b.type === 'range') t.shrineRangeBonus += b.value * effectMult;
            else if (b.type === 'crit_chance') t.shrineCritChance += b.value * effectMult;
            else if (b.type === 'se_gain') t.shrineSEBonus += b.value * effectMult;
            else if (b.type === 'pe_recovery') t.shrinePERecovery += b.value * effectMult;
            else if (b.type === 'crit_damage') t.shrineCritDmg += b.value * effectMult;
            t.shrineHaloTier1 = true;
        });
    });
}

/**
 * Cleans up Shrines marked for demolition.
 */
function checkDemolitionCleanup() {
    for (let i = towers.length - 1; i >= 0; i--) {
        const t = towers[i];
        if (t.isShrine && t.isDemolishing) {
            if (typeof GameLogger !== 'undefined') GameLogger.success(`Demolition Complete: ${t.data.name}`);
            const s = t.currentSlot;
            if (s) s.isOccupied = false;
            towers.splice(i, 1);
        }
    }
    if (typeof updateSummonButtonState === 'function') updateSummonButtonState();
}

window.applyShrineBuffs = applyShrineBuffs;
window.checkDemolitionCleanup = checkDemolitionCleanup;
