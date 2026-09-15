/* game_state.js - Central Global State Repository with Event Emission */

// --- Global Configuration & Constants ---
window.shrineCostIncrement = 50;
window.maxTowers = 28; // cap on placed units across all 40 slots (excludes shrines)
window.maxTier1Shrines = 8;
window.maxTier2Shrines = 6;

/**
 * Returns the SE cost for promotion based on the current tier of the unit.
 */
window.getPromotionCost = (tier) => {
    if (tier === 1) return 200; // 신성한 각성
    if (tier === 2) return 700; // 초월 각성
    if (tier === 3) return 1500; // 심연속으로 (심연 각성)
    return 0;
};
// --- Score Reporting (postMessage to parent frame) ---
let lastSentDepth = 0;
let bestDepthInSession = 0;

function onDepthUpdate(currentDepth, isDead = false) {
    const isBreakingBest = currentDepth > bestDepthInSession;
    if (isBreakingBest) bestDepthInSession = currentDepth;

    const currentSection = Math.floor(currentDepth / 5);
    const lastSection = Math.floor(lastSentDepth / 5);
    const isNewSection = currentSection > lastSection;

    if ((isBreakingBest && isNewSection) || isDead) {
        if (window.parent && window.parent !== window) {
            const message = {
                type: isDead ? 'GAME_OVER' : 'GATE_OF_HELL_SCORE',
                score: currentDepth
            };
            // ArcadeDeck 통합 전송 규격 — '*': host origin unknown at build time, payload is public stats.
            try { window.parent.postMessage(message, '*'); } catch (_) {}
            lastSentDepth = currentDepth;
        }
    }
}

// --- Private Proxied State (to trigger events) ---
let _stage = 1;
let _money = 150;
let _portalEnergy = 0;
let _currentStageSpawned = 0;

// --- Public Accessors with Event Emission ---
Object.defineProperty(window, 'stage', {
    get() { return _stage; },
    set(v) { 
        if (_stage !== v) {
            _stage = v; 
            if (window.EventBus) EventBus.emit(GAME_EVENTS.STAGE_CHANGED, _stage);
            onDepthUpdate(_stage);
        }
    }
});

Object.defineProperty(window, 'money', {
    get() { return _money; },
    set(v) { 
        if (_money !== v) {
            _money = v; 
            if (window.EventBus) EventBus.emit(GAME_EVENTS.MONEY_CHANGED, _money);
        }
    }
});

Object.defineProperty(window, 'portalEnergy', {
    get() { return _portalEnergy; },
    set(v) { 
        if (_portalEnergy !== v) {
            _portalEnergy = v; 
            if (window.EventBus) EventBus.emit(GAME_EVENTS.PORTAL_ENERGY_CHANGED, _portalEnergy);
        }
    }
});

Object.defineProperty(window, 'currentStageSpawned', {
    get() { return _currentStageSpawned; },
    set(v) { 
        if (_currentStageSpawned !== v) {
            _currentStageSpawned = v; 
            if (window.EventBus) EventBus.emit(GAME_EVENTS.ENEMIES_COUNT_CHANGED);
        }
    }
});

// --- Other Global Properties ---
window.maxMoney = 1000; 
window.maxPortalEnergy = 1500;
window.towerCost = 30;
window.shrineCost = 100;

window.isBossStage = false;
window.bossSpawned = false;
window.bossInstance = null;
window.totalStageEnemies = 15;
window.stageKilledCount = 0;
window.isStageStarting = false;
window.lastSpawnTime = 0;
window.spawnGeneration = 0;

window.gameStarted = false;
window.isPaused = false;

window.damageMultiplier = 1.0;
window.treasureChance = 0.005;

window.enemies = [];
window.towers = [];
window.friendlySkeletons = [];
window.friendlyGhosts = [];
window.groundEffects = [];

window.isTimeFrozen = false;
window.timeFreezeEndTime = 0;

window.globalAnimTimer = 0;
window.lavaPhase = 0;

window.lastMoney = 150;
window.lastPortalEnergy = 0;
window.lastEnemiesLeft = 0;
window.infoPanelLockedUntil = 0;
