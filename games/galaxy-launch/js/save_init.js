// ==========================================
// DATA PERSISTENCE (Global Auto-Save)
// ==========================================

const SAVE_KEY = "galaxyLaunch_global_save";
let lastSaveTime = Date.now();

function saveGame() { 
    lastSaveTime = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify({ 
        prestigeLevel, stardust, totalClicks, totalPines, gears, darkMatter, 
        totalDronesDestroyed, totalUfosDestroyed,
        currentShipIdx, hp, maxHp, planetLevel, upgrades, bonusType, 
        machineReward75, machineReward50, buildings, universeName, 
        potions, acquiredArtifacts, lastSaveTime,
        isAutoUpgradeActive, isAutoColonyActive
    })); 
}        

function loadGame() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
        const d = JSON.parse(saved);
        prestigeLevel = d.prestigeLevel || 0; 
        stardust = d.stardust || 0; 
        totalClicks = d.totalClicks || 0; 
        totalPines = d.totalPines || 0;
        gears = d.gears || 0;
        darkMatter = d.darkMatter || 0;
        totalDronesDestroyed = d.totalDronesDestroyed || 0;
        totalUfosDestroyed = d.totalUfosDestroyed || 0;
        currentShipIdx = d.currentShipIdx || 0; 
        hp = d.hp || 100; 
        maxHp = d.maxHp || 100; 
        planetLevel = d.planetLevel || 1;
        acquiredArtifacts = d.acquiredArtifacts || [];
        lastSaveTime = d.lastSaveTime || Date.now();
        
        isAutoUpgradeActive = d.isAutoUpgradeActive || false;
        isAutoColonyActive = d.isAutoColonyActive || false;

        if (d.universeName) {
            universeName = d.universeName;
            const el = document.getElementById('universe-name');
            if (el) el.innerText = universeName;
        } else {
            if (typeof generateUniverseName === 'function') generateUniverseName();
        }

        if (d.buildings) {
            buildings = { ...buildings, ...d.buildings };
        }
        
        if (d.potions) potions = { ...potions, ...d.potions };
        else potions = { neon: 0, green: 0, gray: 0, dark: 0 };

        if (d.isBonusPlanet !== undefined) bonusType = d.isBonusPlanet ? 1 : 0;
        else bonusType = d.bonusType || 0;

        machineReward75 = d.machineReward75 || false;
        machineReward50 = d.machineReward50 || false;

        if (d.upgrades) {
            for (const key in d.upgrades) {
                if (upgrades[key]) upgrades[key].lv = d.upgrades[key].lv;
            }
        }
        lastUnlockCount = ships.filter(s => totalClicks >= getShipReq(s.baseReq)).length;
        if (upgrades.auto.lv > 0) { if (typeof startAutoHangar === 'function') startAutoHangar(); }

        // Sync UI for Auto modes
        if (typeof syncAutoUpgradeUI === 'function') syncAutoUpgradeUI();
        if (typeof syncAutoColonyUI === 'function') syncAutoColonyUI();
    }
}

// Auto Save
setInterval(() => saveGame(), 30000);
window.addEventListener('beforeunload', () => saveGame());
