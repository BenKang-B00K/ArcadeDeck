/* allies.js - Entry Point & Persistence */

// Track unlocked classes for Records - Global for Collections access
window.unlockedUnits = new Set(['apprentice']);
window.encounteredEnemies = new Set();
window.unseenItems = new Set(); 
window.killCounts = {};
window.ownedEquipment = window.ownedEquipment || {};

function saveGameData() {
    const data = {
        unlockedUnits: Array.from(window.unlockedUnits),
        encounteredEnemies: Array.from(window.encounteredEnemies || []),
        killCounts: window.killCounts || {},
        ownedEquipment: window.ownedEquipment || {},
        soulCrystals: window.soulCrystals || 0,
        soulFragments: window.soulFragments || 0,
        unseenItems: Array.from(window.unseenItems)
    };
    localStorage.setItem('gateOfHell_saveData', JSON.stringify(data));
}

function loadGameData() {
    const saved = localStorage.getItem('gateOfHell_saveData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.unlockedUnits) {
                data.unlockedUnits.forEach(u => window.unlockedUnits.add(u));
            }
            // Always ensure apprentice is there
            window.unlockedUnits.add('apprentice');

            if (data.encounteredEnemies) {
                if (!window.encounteredEnemies) window.encounteredEnemies = new Set();
                data.encounteredEnemies.forEach(e => window.encounteredEnemies.add(e));
            }
            if (data.killCounts) {
                window.killCounts = data.killCounts;
            } else {
                window.killCounts = {};
            }
            if (data.ownedEquipment) {
                // Ensure ownedEquipment exists before merging
                if (!window.ownedEquipment) window.ownedEquipment = {};
                // Merge with current to ensure new slots are present
                for (const slot in data.ownedEquipment) {
                    window.ownedEquipment[slot] = data.ownedEquipment[slot];
                }
            }
            if (data.unseenItems) {
                window.unseenItems = new Set(data.unseenItems);
            }
            if (typeof data.soulCrystals === 'number') {
                window.soulCrystals = data.soulCrystals;
            }
            if (typeof data.soulFragments === 'number') {
                window.soulFragments = data.soulFragments;
            }
        } catch (e) {
            console.error("Failed to load save data:", e);
        }
    }
}

// Initial load
loadGameData();

function recordUnlock(type, isEnemy = false) {
    const tutorialToggle = document.getElementById('tutorial-toggle');
    const isTutorialEnabled = tutorialToggle ? tutorialToggle.checked : true;
    
    if (isEnemy) {
        if (!window.encounteredEnemies) window.encounteredEnemies = new Set();
        if (window.encounteredEnemies.has(type)) return;
        window.encounteredEnemies.add(type);
        window.unseenItems.add(type); // Mark as unseen

        // Show main notification badge
        const notif = document.getElementById('collections-notif');
        if (notif) notif.style.display = 'flex';

        saveGameData();

        if (!isTutorialEnabled) return;

        let enemyData = null;
        for (const cat in enemyCategories) {
            const found = enemyCategories[cat].find(e => e.type === type);
            if (found) { enemyData = found; break; }
        }
        if (!enemyData) {
            for (const key in bossData) {
                if (bossData[key].type === type) { enemyData = bossData[key]; break; }
            }
        }

        if (enemyData) {
            // Find category
            let catKey = 'specter';
            if (bossData[stage] && bossData[stage].type === type) {
                catKey = 'abyssal_boss';
            } else {
                for (const ck in enemyCategories) {
                    if (enemyCategories[ck].some(e => e.type === type)) {
                        catKey = ck;
                        break;
                    }
                }
            }
            const dispTitle = categoryTitles[catKey] || 'ABYSSAL WHISPER';
            const _rawName  = enemyData.name || (typeof enemyNames !== 'undefined' && enemyNames[enemyData.type]) || type;
            const dispName  = window.tEnemy ? window.tEnemy(enemyData.type, 'name', _rawName) : _rawName;
            // Show non-blocking toast (no pause)
            if (typeof showEncounterToast === 'function') {
                showEncounterToast(enemyData, dispTitle, dispName);
            }
        }
        return;
    }

    if (!window.unlockedUnits.has(type)) {
        window.unlockedUnits.add(type);
        window.unseenItems.add(type); // Mark as unseen

        // Show main notification badge
        const notif = document.getElementById('collections-notif');
        if (notif) notif.style.display = 'flex';

        saveGameData();

        // Ally encounter modals were retired; the collections NEW badge is the only cue.
    }
}
