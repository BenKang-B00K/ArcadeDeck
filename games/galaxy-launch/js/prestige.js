// ==========================================
// PRESTIGE SYSTEM (Conquered)
// ==========================================

const prestigeTitles = [
    "Novice", "Starfarer", "Galaxy Conqueror", "Cosmic Entity", 
    "Dimension Weaver", "Astral Sovereign", "Universal Architect", 
    "Celestial Overlord", "Quantum Ascendant", "Infinite Prime"
];

function doPrestige() {
    console.log("Prestige attempt. Upgrades:", upgrades.click.lv, upgrades.auto.lv, upgrades.autoSpeed.lv);
    if (!upgrades || upgrades.click.lv < 30 || upgrades.auto.lv < 30 || upgrades.autoSpeed.lv < 30) {
        console.warn("Prestige requirements not met.");
        return;
    }

    if (confirm("✨ Are you sure you want to Conquer?\n\nData excluding ARTIFACTS and COLONY buildings will be reset.\nYou will have a 50% chance to gain a random ARTIFACT and Ship Unlock Costs will be halved!")) {
        console.log("Prestige confirmed.");
        const overlay = document.createElement('div');
        overlay.id = "prestige-overlay";
        overlay.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:black; z-index:9999; opacity:0; transition: opacity 2s ease-in-out; display:flex; justify-content:center; align-items:center; color:#00f2fe; font-size:30px; font-weight:bold; letter-spacing:5px; pointer-events:none;";
        overlay.innerHTML = "<div>WARPING TO NEW GALAXY...</div>";
        document.body.appendChild(overlay);

        if (typeof playSfx === 'function') playSfx(100, 'sawtooth', 4.0);

        requestAnimationFrame(() => {
            overlay.style.opacity = 1;
        });

        setTimeout(() => {
            prestigeLevel++;
            reportScore();
            console.log("New prestige level:", prestigeLevel);

            // Conquer Rewards: Guaranteed Rare + Chance for Legendary
            showEventToast("UNIVERSE CONQUERED!\nARTIFACT DISCOVERED", "#f1c40f");
            if (typeof gainRandomArtifact === 'function') {
                gainRandomArtifact('prestige'); // This now handles Rare/Legendary split
            }

            if (typeof createPrestigeStar === 'function') createPrestigeStar();

            generateUniverseName();

            // Reset core stats
            stardust = 0;
            totalPines = 0;
            grossStardust = 0;
            grossClickDamage = 0;
            stardustHistory = [];
            clickDpsHistory = [];
            darkMatter = 0;
            totalClicks = 0;
            gears = 0;
            hp = 5000;
            maxHp = 5000;
            planetLevel = 1;
            currentShipIdx = 0;
            bonusType = 0;
            machineReward75 = false;
            machineReward50 = false;
            lastUnlockCount = 0;

            // Reset upgrades except Colony Base
            upgrades.click.lv = 1;
            
            const toReset = [
                'auto', 'autoSpeed', 'autoPower', 'shipReinforce', // Hangar
                'pinePower', 'market', 'clickMastery', 'pineChance', 'luckyCharm', // Pine Lab
                'critChance', 'droneFreq', 'planetScan', 'clickSurge', 'rapidCon', // Eng Bay
                'darkFlow', 'antimatter', 'hyperDrive', 'starForge', 'dimRift' // Black Market
            ];
            toReset.forEach(k => {
                if (upgrades[k]) upgrades[k].lv = 0;
            });

            potions = { neon: 0, green: 0, gray: 0, dark: 0 };

            // Clear active cycles
            if (window.repairDroneInterval) clearInterval(window.repairDroneInterval);
            if (typeof activeDronePIXI !== 'undefined' && activeDronePIXI) {
                if (typeof destroyRepairDrone === 'function') {
                    destroyRepairDrone(activeDronePIXI, false);
                } else {
                    activeDronePIXI.destroy();
                    activeDronePIXI = null;
                }
            }

            if (autoHangarTimer) {
                clearInterval(autoHangarTimer);
                autoHangarTimer = null;
            }

            // Update Visuals
            const visual = document.getElementById('target-visual');
            if (visual) visual.className = 'planet-0';

            const targetNameEl = document.getElementById('target-name');
            if (targetNameEl) {
                const pName = typeof getPlanetName === 'function' ? getPlanetName(1) : "Proxima B";
                targetNameEl.innerHTML = `${pName}<br><span style="font-size: 0.8em; color: #aaa;">Lv. 1</span>`;
            }

            // Refresh All Systems
            if (typeof saveGame === 'function') saveGame();
            if (typeof updateUI === 'function') updateUI();
            if (typeof decoratePlanet === 'function') decoratePlanet();
            if (typeof renderShipList === 'function') renderShipList();
            if (typeof checkUnlocks === 'function') checkUnlocks();
            if (typeof checkFeatureUnlocks === 'function') checkFeatureUnlocks();
            if (typeof updateColonyUI === 'function') updateColonyUI();

            setTimeout(() => {
                overlay.style.opacity = 0;
                setTimeout(() => overlay.remove(), 2000);
            }, 1000);

        }, 2000);
    } else {
        console.log("Prestige cancelled.");
    }
}
function generateUniverseName() {
    const digits = Math.max(1, prestigeLevel);
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    universeName = `UNIVERSE-${num}`;
    const el = document.getElementById('universe-name');
    if (el) el.innerText = universeName;
}
