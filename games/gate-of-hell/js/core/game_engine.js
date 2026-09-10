/* game_engine.js - Core Loop and Orchestration */

/**
 * Resets the entire game state to the starting conditions.
 */
function resetGameState() {
    if (typeof GameLogger !== 'undefined') GameLogger.warn("Game State Reset.");
    
    // Clear Arrays
    window.enemies.length = 0;
    window.towers.length = 0;
    window.friendlySkeletons.length = 0;
    window.friendlyGhosts.length = 0;
    window.groundEffects.length = 0;
    
    // Global Stats Reset
    window.stage = 1;
    window.money = 150;
    window.portalEnergy = 0;
    window.currentStageSpawned = 0;
    window.isBossStage = false;
    window.bossSpawned = false;
    window.bossInstance = null;
    window.lastSpawnTime = 0;
    window.isStageStarting = false;
    
    window.towerCost = 30;
    window.shrineCost = 100;
    window.damageMultiplier = 1.0;
    window.treasureChance = 0.005; // keep in sync with game_state.js initial value
    window.maxMoney = 1000; 
    
    window.isTimeFrozen = false;
    window.timeFreezeEndTime = 0;

    window.gameElapsedMs = 0;

    // Invalidate caches and bump spawn generation so any pending setTimeout
    // from a previous run cannot leak enemies into the new game.
    window._cachedAllEnemies = null;
    window.spawnGeneration = (window.spawnGeneration || 0) + 1;

    // Per-run relic state resets
    if (window.comboState) { window.comboState.count = 0; window.comboState.lastKillMs = 0; }
    window.deathSaveUsed = 0;
    if (window.surgeState) { window.surgeState.lastTriggerMs = 0; window.surgeState.activeUntilMs = 0; }
    window.totalKillsCounter = 0;
    if (typeof resetDemonPact === 'function') resetDemonPact();

    // Module Resets
    if (typeof resetRelics === 'function') resetRelics();
    // Equipment + Soul Crystals persist across game over (meta-progression).
    if (typeof updateEquipScBadge === 'function') updateEquipScBadge();
    if (typeof clearProgress === 'function') clearProgress();
    
    // UI Sync
    if (window.EventBus) EventBus.emit(GAME_EVENTS.FROZEN_OVERLAY, false);
    if (typeof resetInfoPanel === 'function') resetInfoPanel();
}

/**
 * Per-frame gameplay tick. Pure logic — no rendering.
 * Owned by GameScene; SceneManager drives this through scene.update().
 */
function runGameTick(nowTime) {
    updateGameTimer();
    if (typeof applyShrineBuffs === 'function') applyShrineBuffs();
    if (typeof checkDemolitionCleanup === 'function') checkDemolitionCleanup();

    if (window.isTimeFrozen && nowTime > window.timeFreezeEndTime) {
        window.isTimeFrozen = false;
        window.enemies.forEach(e => {
            if (e.accumulatedDamage) {
                if (typeof applyDamage === 'function') applyDamage(e, e.accumulatedDamage * 2, null, false, true);
                e.accumulatedDamage = 0;
            }
        });
        if (window.EventBus) EventBus.emit(GAME_EVENTS.FROZEN_OVERLAY, false);
    }

    updateStatusEffects(nowTime);
    if (typeof tickAbyssalSurge === 'function') tickAbyssalSurge(nowTime);
    if (typeof tickDemonPact === 'function') tickDemonPact();
    if (typeof updateTowers === 'function') updateTowers(nowTime);
    updateGroundEffects(nowTime);
    if (typeof updateSpawning === 'function') updateSpawning(nowTime);
    if (typeof updateEnemyMovement === 'function') updateEnemyMovement(nowTime);
    if (typeof updateSummons === 'function') updateSummons(nowTime);
}

/**
 * Main game loop. Renders every frame; delegates logic to active Scene.
 */
function gameLoop() {
    // Normalized delta-time: 1.0 at 60fps, capped at 4x to bound post-pause spikes.
    const now = Date.now();
    const last = window._lastFrameNow || now;
    const raw = (now - last) / (1000 / 60);
    window.dt = Math.min(4, raw > 0 ? raw : 1);
    window._lastFrameNow = now;

    if (typeof renderGraphics === 'function') renderGraphics();

    if (window.SceneManager) {
        SceneManager.tick(now);
    } else if (window.gameStarted && !window.isPaused) {
        // Legacy fallback if SceneManager not yet loaded.
        runGameTick(now);
    }

    requestAnimationFrame(gameLoop);
}

/**
 * Updates status effects and stealth for enemies. (Context-aware logic)
 */
function updateStatusEffects(nowTime) {
    const _cachedSeers = window.towers.filter(t => t.data.type === 'seer');
    const seerRangeSq = 14400; // 120 squared
    
    for (let i = 0; i < window.enemies.length; i++) {
        const e = window.enemies[i];
        if (e.isStunned && nowTime > (e.stunEndTime || 0)) e.isStunned = false;
        
        e.isSilenced = false; e.inBlizzard = false; e.inPurgatory = false;
        
        // Stealth Revealing (Seer)
        if (e.type === 'betrayer_blade') {
            const cycle = (nowTime % 3000); 
            let shouldBeStealthed = (cycle < 1000);
            const ex = (e.x / 100) * LOGICAL_WIDTH;
            
            let revealed = false;
            for (let j = 0; j < _cachedSeers.length; j++) {
                const s = _cachedSeers[j];
                const dx = ex - s.lx;
                const dy = e.y - s.ly;
                if ((dx * dx + dy * dy) < seerRangeSq) {
                    revealed = true;
                    break;
                }
            }
            e.isStealthed = shouldBeStealthed && !revealed;
        }
    }
}

/**
 * Updates ground effects (seals, fire, blizzard) and their influence on enemies.
 */
function updateGroundEffects(nowTime) {
    for (let i = window.groundEffects.length - 1; i >= 0; i--) {
        const effect = window.groundEffects[i];
        if (nowTime > effect.endTime) { window.groundEffects.splice(i, 1); continue; }
        
        const radiusSq = effect.lRadius * effect.lRadius;
        for (let j = 0; j < window.enemies.length; j++) {
            const e = window.enemies[j];
            const ex = (e.x / 100) * LOGICAL_WIDTH;
            const dx = ex - effect.lx;
            const dy = e.y - effect.ly;
            
            if ((dx * dx + dy * dy) <= radiusSq) {
                if (effect.type === 'seal') e.isSilenced = true;
                else if (effect.type === 'fire') { if (typeof applyDamage === 'function') applyDamage(e, (20 / 60) * (window.dt || 1), null); }
                else if (effect.type === 'blizzard') e.inBlizzard = true;
            }
        }
    }
}

/**
 * Advances elapsed-time counter. Display removed; gameElapsedMs kept for any
 * logic that still reads it (analytics, save metadata, etc.).
 */
function updateGameTimer() {
    window.gameElapsedMs = (window.gameElapsedMs || 0) + (window.dt || 1) * (1000 / 60);
}

// Window Exports
window.resetGameState = resetGameState;
window.runGameTick = runGameTick;
window.gameLoop = gameLoop;
window.updateGameTimer = updateGameTimer;
