/* enemies.js - Global State & Phase Management */

// enemyCategories and bossData are now populated by data_loader.js from data/enemies.json

/**
 * Initializes the current stage, setting enemy counts and starting the countdown.
 */
function initStage() {
    if (typeof GameLogger !== 'undefined') GameLogger.info(`Starting DEPTH ${stage}`);
    const isMiniBossStage = (stage % 5 === 0 && stage % 10 !== 0);
    isBossStage = (stage % 10 === 0) || isMiniBossStage; bossSpawned = false; bossInstance = null;
    if (typeof spawnGlitchEffect === 'function') spawnGlitchEffect();
    
    if (isBossStage) {
        totalStageEnemies = 30; 
        const _T = window.t || ((k, f) => f);
        const _bossRaw = bossData[stage] ? bossData[stage].name : _T('ui.enemy.unknown_boss_name', "알 수 없는 존재");
        const _bossType = bossData[stage] ? bossData[stage].type : null;
        const bossName = (_bossType && window.tEnemy) ? window.tEnemy(_bossType, 'name', _bossRaw) : _bossRaw;
        const tutorialToggle = document.getElementById('tutorial-toggle');
        if (tutorialToggle && tutorialToggle.checked) {
            if (typeof showBossWarning === 'function') showBossWarning(bossName);
        }
    }
    else if (stage <= 2) { totalStageEnemies = Math.floor(Math.random() * 12) + 24; } 
    else { totalStageEnemies = Math.floor(Math.random() * 12) + Math.floor(Math.min(80, 30 + (stage - 2) * 3)); }
    currentStageSpawned = 0;
    window.stageKilledCount = 0;
    
    isStageStarting = true;
    let countdown = (stage === 1) ? 5 : 3;
    const timerElement = document.getElementById('start-timer');
    if (timerElement) {
        timerElement.style.display = 'block'; 
        timerElement.innerText = countdown;
    }
    const timerInterval = setInterval(() => {
        countdown--;
        if (timerElement) {
            if (countdown > 0) timerElement.innerText = countdown;
            else {
                clearInterval(timerInterval); timerElement.innerText = (window.t ? window.t('ui.enemy.stage_enemies_incoming', "악령들이 몰려옵니다!") : "악령들이 몰려옵니다!");
                if (typeof towers !== 'undefined') {
                    const kings = towers.filter(t => t.data.type === 'forsaken_king');
                    if (kings.length > 0) { 
                        for(let i=0; i<3; i++) {
                            if (typeof spawnFriendlyGhost === 'function') spawnFriendlyGhost();
                        }
                    }
                }
                setTimeout(() => { timerElement.style.display = 'none'; isStageStarting = false; }, 1000);
            }
        } else {
            clearInterval(timerInterval);
            isStageStarting = false;
        }
    }, 1000);
}

// Window Exports
window.initStage = initStage;
