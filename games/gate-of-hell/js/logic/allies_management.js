/* allies_management.js - Handles Job Changes, Promotions, and Sacrificing */

/**
 * Clean up visual indicators when a unit is modified or removed.
 */
function showRangeIndicator(tower) {
    // Range rendering is now handled natively in js/graphics_units.js
    const ri = document.getElementById('range-indicator');
    if (ri) ri.remove();
    const ai = document.getElementById('aura-indicator');
    if (ai) ai.remove();
}

/**
 * Performs a standard job change (T1 -> T2, T2 -> T3).
 */
function performJobChange(ntStr, fromInfo = false) {
    const tower = window.lastInspectedTower;
    if (!tower || tower.isShrine) return;

    let targetType = ntStr;
    if (ntStr === 'random' && (tower.data.tier === 1 || tower.data.tier === 2)) {
        const possibleUpgrades = tower.data.upgrades || [];
        if (possibleUpgrades.length === 0) return;

        // Weighted random for T1→T2 (common=10, uncommon=8, rare=5)
        // Special T2 (rare, exclusive per T1 type):
        //   novice_exorcist only: necromancer, alchemist, mirror, verse_warrior, hymn_blaster, exorcism_mage
        //   apprentice only: archer, assassin, guardian
        const T2_WEIGHTS = {
            chainer: 10, talisman: 10, monk: 10, ice: 10, tracker: 10, // common (shared)
            fire: 8, knight: 8,                                          // uncommon (shared)
            necromancer: 5, alchemist: 5, mirror: 5,                    // rare (novice exclusive — special)
            verse_warrior: 5, hymn_blaster: 5, exorcism_mage: 5,       // rare (novice exclusive — attack)
            prayer_herald: 5, relic_keeper: 5, ward_scribe: 5,         // rare (novice exclusive — support)
            archer: 5, assassin: 5, guardian: 5                         // rare (apprentice exclusive)
        };
        const totalW = possibleUpgrades.reduce((s, t) => s + (T2_WEIGHTS[t] || 8), 0);
        let rand = Math.random() * totalW;
        targetType = possibleUpgrades[possibleUpgrades.length - 1]; // fallback
        for (const t of possibleUpgrades) {
            rand -= (T2_WEIGHTS[t] || 8);
            if (rand <= 0) { targetType = t; break; }
        }
    }

    const nt = unitTypes.find(u => u.type === targetType);
    if (!nt) return;

    const cost = (typeof getPromotionCost === 'function') ? getPromotionCost(tower.data.tier) : 200;

    if (tower.data.tier === 1 || tower.data.tier === 2 || tower.data.tier === 3) {
        if (money < cost) { if (typeof flashResourceError === 'function') flashResourceError('se'); return; }
        money -= cost;
    }

    if (typeof spawnPromotionBurst === 'function') {
        spawnPromotionBurst(tower.lx, tower.ly, nt.tier);
    }

    if (typeof GameLogger !== 'undefined') GameLogger.info(`Job Change: ${tower.data.name} -> ${nt.name}`);
    tower.data = nt; tower.range = nt.range; tower.cooldown = nt.cooldown; tower.spentSE += cost;
    
    if (typeof recordUnlock === 'function') recordUnlock(nt.type);
    if (typeof updateSummonButtonState === 'function') updateSummonButtonState();
    if (fromInfo && typeof showUnitInfo === 'function') showUnitInfo(tower);
    if (typeof startInfoResetTimer === 'function') startInfoResetTimer();
    showRangeIndicator(tower);
    if (typeof saveProgress === 'function') saveProgress();
}

/**
 * Opens confirmation dialog for sacrificing a unit.
 */
function confirmSacrifice(t) {
    const modal = document.getElementById('sacrifice-modal');
    const confirmBtn = document.getElementById('sacrifice-confirm-btn');
    const cancelBtn = document.getElementById('sacrifice-cancel-btn');
    if (!modal || !confirmBtn || !cancelBtn) return;

    const closeModal = () => {
        if (window.SceneManager) {
            SceneManager.pop();
        } else {
            modal.style.display = 'none';
            window.isPaused = false;
        }
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
    };

    // Clear prior handlers — each call captured a different tower in closure.
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;

    confirmBtn.onclick = () => { executeSacrifice(t); closeModal(); };
    cancelBtn.onclick  = () => { closeModal(); };

    if (window.SceneManager) {
        SceneManager.push(SCENES.MODAL, { id: 'sacrifice-modal' });
    } else {
        modal.style.display = 'flex';
        window.isPaused = true;
    }
}

/**
 * Executes the sacrifice, freeing the slot and refunding SE.
 */
function executeSacrifice(t) {
    if (typeof GameLogger !== 'undefined') GameLogger.warn(`Sacrificed: ${t.data.name}`);
    const s = t.currentSlot;
    if (s) s.isOccupied = false;

    if (typeof spawnBanishEffect === 'function') {
        spawnBanishEffect(t.lx, t.ly);
    }

    const idx = towers.indexOf(t);
    if (idx > -1) {
        const refundBase = (t.data.tier === 1) ? 15 : (t.data.tier === 2) ? 100 : 300;
        const refundRelicBonus = (typeof getRelicBonus === 'function') ? getRelicBonus('sell_refund') : 0;
        const limit = (typeof maxMoney !== 'undefined') ? maxMoney : 1000;
        money = Math.min(limit, money + Math.floor(refundBase * (1.0 + refundRelicBonus)));
        
        towers.splice(idx, 1);
    }
    
    const ri = document.getElementById('range-indicator'); if (ri) ri.remove();
    if (typeof updateSummonButtonState === 'function') updateSummonButtonState();
    if (typeof saveProgress === 'function') saveProgress();
}

// Global Exports
window.showRangeIndicator = showRangeIndicator;
window.performJobChange = performJobChange;
window.confirmSacrifice = confirmSacrifice;
