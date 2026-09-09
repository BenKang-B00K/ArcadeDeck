/* save_system.js - Game Progress Auto-Save / Continue System */

const PROGRESS_KEY = 'gateOfHell_progress';
const SAVE_SCHEMA_VERSION = 1;

/**
 * Returns true if a saved in-progress game exists.
 */
function hasSavedProgress() {
    return !!localStorage.getItem(PROGRESS_KEY);
}

/**
 * Saves current in-game state to localStorage.
 * Call after meaningful changes: summon, job change, sacrifice, stage advance.
 */
function saveProgress() {
    if (window.SceneManager) {
        // Allow save during GAME, PAUSE, MODAL — any active gameplay session.
        if (!SceneManager.has(SCENES.GAME)) return;
    } else if (!window.gameStarted) {
        return;
    }

    const serializedTowers = (window.towers || []).map(t => ({
        slotArea:      t.currentSlot ? t.currentSlot.area  : null,
        slotIndex:     t.currentSlot ? t.currentSlot.index : null,
        type:          t.data ? t.data.type : null,
        level:         t.level   || 1,
        kills:         t.kills   || 0,
        spentSE:       t.spentSE || 0,
        isShrine:      !!t.isShrine,
        isDemolishing: !!t.isDemolishing
    })).filter(t => t.slotArea !== null && t.type !== null);

    const progress = {
        schemaVersion:    SAVE_SCHEMA_VERSION,
        stage:            window.stage             ?? 1,
        money:            window.money             ?? 150,
        portalEnergy:     window.portalEnergy      ?? 0,
        towerCost:        window.towerCost         ?? 30,
        shrineCost:       window.shrineCost        ?? 100,
        maxMoney:         window.maxMoney          ?? 1000,
        damageMultiplier: window.damageMultiplier  ?? 1.0,
        treasureChance:   window.treasureChance    ?? 0.01,
        totalStageEnemies:window.totalStageEnemies ?? 15,
        collectedRelics:  window.collectedRelics   ?? {},
        towers:           serializedTowers,
        savedAt:          Date.now()
    };

    try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch (e) {
        console.warn('[SaveSystem] saveProgress failed:', e);
    }
}

/**
 * Restores saved game state into the running game.
 * MUST be called AFTER initLogicalSlots() and gameDataLoaded.
 * @returns {boolean} true on success, false if no save or error.
 */
function loadProgress() {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return false;

    try {
        const p = JSON.parse(raw);

        // Reject saves from a different schema; no migration path yet.
        if ((p.schemaVersion ?? 0) !== SAVE_SCHEMA_VERSION) {
            console.warn(`[SaveSystem] Schema mismatch (got ${p.schemaVersion}, expected ${SAVE_SCHEMA_VERSION}). Discarding save.`);
            clearProgress();
            return false;
        }

        // 1. Restore scalar game state
        window.stage            = p.stage            ?? 1;
        window.money            = p.money            ?? 150;
        window.portalEnergy     = p.portalEnergy     ?? 0;
        window.towerCost        = p.towerCost        ?? 30;
        window.shrineCost       = p.shrineCost       ?? 100;
        window.maxMoney         = p.maxMoney         ?? 1000;
        window.damageMultiplier = p.damageMultiplier ?? 1.0;
        window.treasureChance   = p.treasureChance   ?? 0.01;

        // 2. Restore relics and recalculate bonuses
        window.collectedRelics = p.collectedRelics || {};
        if (typeof updateTotalRelicBonuses === 'function') updateTotalRelicBonuses();

        // 3. Restore placed towers (needs logicalSlots + unitTypes/shrineTypes loaded)
        if (window.logicalSlots && p.towers && p.towers.length > 0) {
            window.towers.length = 0;
            p.towers.forEach(t => {
                const slot = window.logicalSlots.find(
                    s => s.area === t.slotArea && s.index === t.slotIndex
                );
                if (!slot) return;

                const data = t.isShrine
                    ? (typeof shrineTypes !== 'undefined' ? shrineTypes.find(s => s.type === t.type) : null)
                    : (typeof unitTypes   !== 'undefined' ? unitTypes.find(u => u.type === t.type)   : null);
                if (!data) return;

                slot.isOccupied = true;
                window.towers.push({
                    data,
                    currentSlot:   slot,
                    lx:            slot.lx,
                    ly:            slot.ly,
                    level:         t.level   || 1,
                    kills:         t.kills   || 0,
                    lastShot:      0,
                    range:         data.range    || 200,
                    cooldown:      data.cooldown || 500,
                    spentSE:       t.spentSE  || 0,
                    isShrine:      !!t.isShrine,
                    isDemolishing: !!t.isDemolishing
                });
            });
        }

        const savedDate = p.savedAt ? new Date(p.savedAt).toLocaleString() : '?';
        console.log(`[SaveSystem] Loaded: Stage ${p.stage}, ${(p.towers||[]).length} units (saved ${savedDate})`);
        return true;
    } catch (e) {
        console.warn('[SaveSystem] loadProgress failed:', e);
        clearProgress();
        return false;
    }
}

/**
 * Wipes saved game progress.
 * Call on game over or when starting a new game.
 */
function clearProgress() {
    localStorage.removeItem(PROGRESS_KEY);
}

window.hasSavedProgress = hasSavedProgress;
window.saveProgress     = saveProgress;
window.loadProgress     = loadProgress;
window.clearProgress    = clearProgress;
