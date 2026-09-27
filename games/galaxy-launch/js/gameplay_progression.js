// ==========================================
// GAMEPLAY PROGRESSION (Levels, Bosses, Naming)
// ==========================================

const planetNames = [
    "Proxima B", "Alpha Centauri Bb", "Barnard's Star b", "Wolf 1061c", "Gliese 832c", 
    "Kepler-186f", "Kepler-62f", "Kepler-452b", "Kepler-442b", "Kepler-1649c", 
    "TRAPPIST-1e", "Proxima Centauri c", "Ross 128 b", "LHS 1140 b", "Teegarden b", 
    "GJ 357 d", "TOI-700 d", "K2-18b", "55 Cancri e", "Osiris (HD 209458 b)", 
    "WASP-12b", "WASP-17b", "WASP-19b", "HAT-P-7b", "Kepler-10b", "CoRoT-7b"
];

function getPlanetName(level) {
    if (level <= planetNames.length) return planetNames[level - 1];
    return `Kepler-${(level * 12) + 7}b`; 
}

function levelUp() {
    if (isLevelingUp) return;
    isLevelingUp = true;
    machineReward75 = false;
    machineReward50 = false;

    // Reset Boss States
    if (bossTimerInterval) {
        clearInterval(bossTimerInterval);
        bossTimerInterval = null;
    }
    isBossFight = false;
    isMiniBossFight = false;
    bossShieldActive = false;
    bossEmpActive = false;
    bossAbilityUsed80 = false;
    bossAbilityUsed40 = false;
    const bossTimerContainer = document.getElementById('boss-timer-container');
    if (bossTimerContainer) {
        bossTimerContainer.style.display = 'none';
        bossTimerContainer.classList.remove('overload');
    }
    const vignette = document.getElementById('boss-vignette');
    if (vignette) vignette.style.opacity = 0;
    
    planetLayer.x = pixiApp.screen.width / 2;
    planetLayer.y = pixiApp.screen.height / 2;

    // Clear Repair Drone if exists
    if (typeof activeDronePIXI !== 'undefined' && activeDronePIXI) {
        if (typeof destroyRepairDrone === 'function') destroyRepairDrone(activeDronePIXI, false);
    }
    
    // Choose Explosion Type
    if (planetLevel % 10 === 0) {
        if (typeof createPlanetExplosion === 'function') createPlanetExplosion();
    } else if (planetLevel % 5 === 0) {
        if (typeof createMiniBossExplosion === 'function') createMiniBossExplosion();
    } else {
        if (typeof createPlanetExplosion === 'function') createPlanetExplosion();
    }

    const visual = document.getElementById('target-visual');
    if (visual) visual.style.opacity = 0;
    if (typeof pixiPlanetContainer !== 'undefined') pixiPlanetContainer.visible = false;
    if (typeof pixiPlanetGlow !== 'undefined') pixiPlanetGlow.visible = false;

    setTimeout(() => {
        planetLevel++;
        if (typeof reportScore === 'function') reportScore();
        
        const isMainBoss = planetLevel % 10 === 0;
        const isMiniBoss = planetLevel % 5 === 0 && !isMainBoss;

        let hpMult = 2.2; 
        if (isMainBoss) {
            hpMult = 6.5;
            hpMult *= getArtifactBonus('boss_hp').mult;
        } else if (isMiniBoss) {
            hpMult = 3.5; // Tougher than normal, weaker than boss
        }
        hpMult *= getArtifactBonus('planet_hp').mult;

        maxHp = Math.floor(maxHp * hpMult);
        hp = maxHp;

        if (planetLevel === 5) showEventToast("PINE LAB UNLOCKED!", "#2ecc71");
        if (planetLevel === 10) showEventToast("ENGINEERING BAY UNLOCKED!", "#95a5a6");
        if (planetLevel === 15) showEventToast("BLACK MARKET UNLOCKED!", "#8e44ad");

        const dmBase = planetLevel;
        let dmAmount = Math.max(0, dmBase + Math.floor(Math.random() * 5) - 2);
        
        // Reward Logic
        if ((planetLevel - 1) % 10 === 0 && planetLevel > 1) {
            // Main Boss Defeated
            if (typeof updateMissionProgress === 'function') updateMissionProgress('bosses', 1);
            if (typeof gainPotion === 'function') {
                gainPotion('neon'); gainPotion('dark');
            }
            showEventToast("BOSS DEFEATED!\nREWARDS GRANTED", "#ff00ff");
            const bossArtChance = 0.25 + (planetLevel * 0.005);
            if (Math.random() < bossArtChance && typeof gainRandomArtifact === 'function') gainRandomArtifact('boss');
            if (Math.random() < 0.2) dmAmount *= 5;
        } else if ((planetLevel - 1) % 5 === 0 && planetLevel > 1) {
            // Mini Boss Defeated
            if (typeof updateMissionProgress === 'function') updateMissionProgress('bosses', 1);
            if (typeof gainPotion === 'function') gainPotion('green');
            showEventToast("MINI-BOSS DEFEATED!", "#00ced1");
            const miniArtChance = 0.125 + (planetLevel * 0.001); 
            if (Math.random() < miniArtChance && typeof gainRandomArtifact === 'function') gainRandomArtifact('miniboss');
        } else {
            // Normal Planet
            const normalArtChance = 0.05 + (planetLevel * 0.0005);
            if (Math.random() < normalArtChance && typeof gainRandomArtifact === 'function') gainRandomArtifact('normal');
        }

        if (isMainBoss) dmAmount *= 10; 
        else if (isMiniBoss) dmAmount *= 3;

        if (dmAmount > 0) {
            let dmMult = getArtifactBonus('dark_matter').mult;
            let finalDm = Math.floor(dmAmount * dmMult);
            darkMatter += finalDm;
            showEventToast(`DARK MATTER COLLECTED\n+${finalDm} 🔮`, "#8e44ad");
        }

        // --- Planet Core Extraction Bonus ---
        const coreStardust = Math.floor(maxHp * 0.10);
        stardust += coreStardust;
        grossStardust += coreStardust;
        showEventToast(`PLANET CORE RECOVERED\n+${coreStardust.toLocaleString()} ✨`, "#00f2fe");

        if (typeof checkFeatureUnlocks === 'function') checkFeatureUnlocks();

        if (Math.random() < 0.49 || isMainBoss || isMiniBoss) {
            const rand = Math.random();
            let pType = rand < 0.5 ? 'neon' : (rand < 0.8 ? 'green' : 'gray');
            if (typeof gainPotion === 'function') {
                gainPotion(pType);
                if (isMainBoss) gainPotion('neon'); 
            }
        }

        let bonusChance = 0.001 + (upgrades.planetScan ? upgrades.planetScan.lv * 0.001 : 0);
        bonusChance += (getArtifactBonus('scan_chance').mult - 1.0);
        bonusChance += (getArtifactBonus('bonus_chance').mult - 1.0);

        if (Math.random() < bonusChance && !isMainBoss && !isMiniBoss) {
            bonusType = Math.random() < 0.5 ? 1 : 2;
        } else { bonusType = 0; }

        const targetNameEl = document.getElementById('target-name');
        if (isMainBoss) {
            if (targetNameEl) targetNameEl.innerHTML = `<span style="color:#ff4757; font-size:1.2em; text-shadow:0 0 10px red;">⚠️ BOSS: ${getPlanetName(planetLevel).toUpperCase()} ⚠️</span><br><span style="font-size: 0.8em; color: #aaa;">Lv. ${planetLevel}</span>`;
            showEventToast("BOSS APPROACHING!", "#ff4757");
            
            // Safe boss filter application
            const bossFilter = new PIXI.filters.ColorMatrixFilter();
            bossFilter.sepia();
            if (typeof updateStageFilters === 'function') updateStageFilters(bossFilter);
            else pixiApp.stage.filters = [bossFilter];

            if (typeof pixiPlanetContainer !== 'undefined') pixiPlanetContainer.scale.set(1.5); 
            bossTimeLimit = 60;
            startBossFight();
        } else if (isMiniBoss) {
            if (targetNameEl) targetNameEl.innerHTML = `<span style="color:#00ced1; font-size:1.1em; text-shadow:0 0 10px #00ced1;">⚡ MINI-BOSS: ${getPlanetName(planetLevel).toUpperCase()} ⚡</span><br><span style="font-size: 0.8em; color: #aaa;">Lv. ${planetLevel}</span>`;
            showEventToast("MINI-BOSS DETECTED!", "#00ced1");
            isMiniBossFight = true;
            if (typeof pixiPlanetContainer !== 'undefined') pixiPlanetContainer.scale.set(1.25);
            bossTimeLimit = 30;
            startBossFight();
        } else {
            if (typeof updateStageFilters === 'function') {
                updateStageFilters(null, null); // Clear filters
            } else {
                pixiApp.stage.filters = null;
            }
            if (typeof pixiPlanetContainer !== 'undefined') pixiPlanetContainer.scale.set(1.0);
            if (targetNameEl) {
                if (bonusType === 1) {
                    targetNameEl.innerHTML = `🌲 BONUS PLANET 🌲<br><span style="font-size: 0.8em; color: #aaa;">Lv. ${planetLevel}</span>`;
                    showEventToast("BONUS PLANET FOUND!\n3X PINE RATE", "#2ecc71");
                } else if (bonusType === 2) {
                    targetNameEl.innerHTML = `⚙️ MACHINE WORLD ⚙️<br><span style="font-size: 0.8em; color: #aaa;">Lv. ${planetLevel}</span>`;
                    showEventToast("MACHINE PLANET FOUND!\nGEAR REWARDS DETECTED", "#95a5a6");
                } else {
                    targetNameEl.innerHTML = `${getPlanetName(planetLevel)}<br><span style="font-size: 0.8em; color: #aaa;">Lv. ${planetLevel}</span>`;
                }
            }
        }

        if (typeof pixiPlanetContainer !== 'undefined') pixiPlanetContainer.visible = true;
        if (typeof pixiPlanetGlow !== 'undefined') pixiPlanetGlow.visible = true;
        isLevelingUp = false;
        if (typeof updateBackgroundTheme === 'function') updateBackgroundTheme();
        if (typeof updateUI === 'function') updateUI();
        if (typeof decoratePlanet === 'function') decoratePlanet();
    }, 400);
}

function startBossFight() {
    isBossFight = true;
    bossTimer = bossTimeLimit;
    const container = document.getElementById('boss-timer-container');
    const vignette = document.getElementById('boss-vignette');
    if (container) container.style.display = 'block';
    
    if (bossTimerInterval) clearInterval(bossTimerInterval);
    bossTimerInterval = setInterval(() => {
        bossTimer -= 0.1;
        
        const bar = document.getElementById('boss-timer-bar');
        const pct = (bossTimer / bossTimeLimit) * 100;
        
        // Calculate Intensity (0 to 1)
        const intensity = 1 - (bossTimer / bossTimeLimit);
        
        if (bar) {
            bar.style.width = pct + "%";
            if (bossTimer <= 10) {
                bar.style.backgroundColor = (Math.floor(Date.now() / 100) % 2 === 0) ? "#fff" : "#ff0000";
                if (container) container.classList.add('overload');
            } else {
                bar.style.backgroundColor = "#ff4757";
                if (container) container.classList.remove('overload');
            }
        }

        // Urgency VFX: Vignette Pulse
        if (vignette) {
            const pulse = 0.2 + (Math.sin(Date.now() * (0.005 + intensity * 0.02)) + 1) / 2 * (0.3 + intensity * 0.5);
            vignette.style.opacity = pulse;
        }

        // Urgency VFX: Planet & Screen Shake
        if (bossTimer <= 10) {
            const shakeScale = (10 - bossTimer) * 0.5;
            planetLayer.x = (pixiApp.screen.width / 2) + (Math.random() * shakeScale - shakeScale/2);
            planetLayer.y = (pixiApp.screen.height / 2) + (Math.random() * shakeScale - shakeScale/2);
        }

        if (bossTimer <= 0) {
            failBossFight();
        }
    }, 100);
}

function failBossFight() {
    if (bossTimerInterval) clearInterval(bossTimerInterval);
    bossTimerInterval = null;
    isBossFight = false;
    
    // Reset Ability Flags for retry
    bossShieldActive = false;
    bossEmpActive = false;
    bossAbilityUsed80 = false;
    bossAbilityUsed40 = false;
    
    // Reset Urgency VFX
    const vignette = document.getElementById('boss-vignette');
    if (vignette) vignette.style.opacity = 0;
    const container = document.getElementById('boss-timer-container');
    if (container) container.classList.remove('overload');
    planetLayer.x = pixiApp.screen.width / 2;
    planetLayer.y = pixiApp.screen.height / 2;

    showEventToast("BOSS STABILIZED!\nRETREATING...", "#aaa");
    playSfx(100, "sawtooth", 0.5);
    
    // Reset HP and Boss Fight State
    hp = maxHp;
    const bossTimerContainer = document.getElementById('boss-timer-container');
    if (bossTimerContainer) bossTimerContainer.style.display = 'none';
    
    // Visual Retreat: Shake and reset
    if (typeof triggerCritVisuals === 'function') triggerCritVisuals();
    setTimeout(() => {
        if (typeof updateUI === 'function') updateUI();
    }, 500);
}
