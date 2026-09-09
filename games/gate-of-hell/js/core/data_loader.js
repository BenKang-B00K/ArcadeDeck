/* js/data_loader.js - Global Data Loader with Integrity Checks */

// Core Data Containers
window.unitTypes = [];
window.shrineTypes = [];
window.relicsData = {};
window.equipmentTiers = [];
window.equipmentSlots = {};

// Fallback Defaults (Will be overwritten by allies.json config)
window.towerCost = 30;
window.towerCostIncrement = 5;
window.shrineCost = 100;
window.shrineCostIncrement = 50;
window.maxTowers = 28;
window.maxTier1Shrines = 8;
window.maxTier2Shrines = 6;

/**
 * Updates the loading screen UI.
 * @param {number} percent - Loading progress (0-100).
 * @param {string} status - Current status message.
 */
function updateLoadingProgress(percent, status) {
    const fill = document.getElementById('loading-bar-fill');
    const text = document.getElementById('loading-percentage');
    const statusEl = document.getElementById('loading-status');
    
    if (fill) fill.style.width = `${percent}%`;
    if (text) text.innerText = `${Math.round(percent)}%`;
    if (statusEl) statusEl.innerText = status;
}

/**
 * Loads all JSON data files with cache-busting and progress reporting.
 */
async function loadGameData() {
    const _t = (k, f) => (window.t ? window.t(k, f) : f);
    const loadingMessages = [
        _t('ui.loading.msg_0', "심연의 문을 여는 중..."),
        _t('ui.loading.msg_1', "영혼의 본질을 추출하는 중..."),
        _t('ui.loading.msg_2', "퇴마의 성서들을 정리하는 중..."),
        _t('ui.loading.msg_3', "악령들의 이름을 기록하는 중..."),
        _t('ui.loading.msg_4', "심연의 기운을 봉인하는 중..."),
        _t('ui.loading.msg_5', "고대의 유물을 감별하는 중..."),
        _t('ui.loading.msg_6', "성소의 등불을 밝히는 중...")
    ];

    try {
        console.log("Loading Game Data...");
        updateLoadingProgress(10, loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
        
        const cacheBuster = `?t=${Date.now()}`;
        
        // Progress tracking for Promise.all is simplified here
        const fetchFile = async (url, step, msg) => {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Failed to load: ${url}`);
            updateLoadingProgress(step, msg);
            return res.json();
        };

        updateLoadingProgress(20, loadingMessages[0]);
        const alliesData = await fetchFile(`data/allies.json${cacheBuster}`, 40, loadingMessages[1]);
        const enemiesData = await fetchFile(`data/enemies.json${cacheBuster}`, 60, loadingMessages[3]);
        const relicsDataRaw = await fetchFile(`data/relics.json${cacheBuster}`, 80, loadingMessages[5]);
        const equipData = await fetchFile(`data/equipment.json${cacheBuster}`, 100, _t('ui.loading.ready', "준비 완료!"));

        // 1. Allies & Global Config
        window.unitTypes = alliesData.unitTypes || [];
        window.shrineTypes = alliesData.shrineTypes || [];
        
        if (alliesData.config) {
            const ALLOWED_CONFIG_KEYS = new Set([
                'towerCost', 'towerCostIncrement',
                'shrineCost', 'shrineCostIncrement',
                'jobChangeCost',
                'maxTowers', 'maxTier1Shrines', 'maxTier2Shrines'
            ]);
            Object.keys(alliesData.config).forEach(key => {
                if (ALLOWED_CONFIG_KEYS.has(key)) {
                    window[key] = alliesData.config[key];
                } else {
                    console.warn(`[DataLoader] Ignored unknown config key: ${key}`);
                }
            });
        }
        
        // 2. Enemies Data
        window.enemyCategories = enemiesData.enemyCategories || {};
        window.bossData = enemiesData.bossData || {};
        window.categoryTitles = enemiesData.categoryTitles || {};
        window.enemyNames = enemiesData.enemyNames || {};
        
        // 3. Relics Data
        window.relicsData = relicsDataRaw.relicsData || {};
        
        // 4. Equipment Data
        window.equipmentTiers = equipData.equipmentTiers || [];
        window.equipmentSlots = equipData.equipmentSlots || {};
        
        console.log("All systems initialized. Portal stable.");
        
        // Hide loading screen with a slight delay for smooth transition
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) loadingScreen.classList.add('fade-out');
        }, 500);

        return true;
    } catch (error) {
        console.error("CRITICAL: Game data integrity compromised!", error);
        updateLoadingProgress(0, _t('ui.loading.error', "심연의 문이 닫혔습니다 (로딩 실패)"));
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) {
            startBtn.innerText = "DATA LOAD ERROR";
            startBtn.style.borderColor = "#ff0000";
            startBtn.style.color = "#ff0000";
            startBtn.disabled = true;
        }
        return false;
    }
}

// Global promise to track loading state across other scripts
window.gameDataLoaded = loadGameData();
