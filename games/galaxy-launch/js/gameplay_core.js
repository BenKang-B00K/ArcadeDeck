// ==========================================
// GAMEPLAY CORE (Interactions, Combo, Fever)
// ==========================================

// Global interaction listener via Pixi.js
pixiApp.stage.eventMode = 'static';

pixiApp.stage.on('pointerdown', (e) => {
    if (e.nativeEvent && (
        e.nativeEvent.target.closest('.ui-box') || 
        e.nativeEvent.target.closest('button') || 
        e.nativeEvent.target.closest('input') || 
        e.nativeEvent.target.closest('.mini-slot') ||
        e.nativeEvent.target.closest('.author-signature') ||
        e.nativeEvent.target.closest('#item-slots')
    )) {
        return;
    }
    if (e.target !== pixiApp.stage) {
        return; 
    }
    handleInteraction(e.nativeEvent);
});

function updateComboUI() {
    const container = document.getElementById('combo-container');
    const countEl = document.getElementById('combo-count');
    const barEl = document.getElementById('combo-bar');
    if (!container || !countEl || !barEl) return;

    if (comboCount > 1) {
        container.style.display = 'block';
        countEl.innerText = comboCount;
        
        // Restart pulse animation
        container.classList.remove('pulse');
        void container.offsetWidth; // Trigger reflow
        container.classList.add('pulse');
        
        // Color shift based on combo
        let color = '#00f2fe'; // Neon Blue
        if (comboCount >= 10) color = '#f1c40f'; // Gold
        if (comboCount >= 25) color = '#ff4500'; // Orange/Red
        countEl.style.color = color;
        barEl.style.backgroundColor = color;
    } else {
        container.style.display = 'none';
    }
}

// Combo Depletion Ticker
pixiApp.ticker.add(() => {
    if (comboCount <= 1) return;
    
    const now = Date.now();
    const elapsed = now - lastClickTime;
    const barEl = document.getElementById('combo-bar');
    const container = document.getElementById('combo-container');
    
    if (elapsed >= 1500) {
        comboCount = 0;
        if (container) container.style.display = 'none';
    } else {
        if (barEl) {
            const pct = Math.max(0, (1500 - elapsed) / 1500 * 100);
            barEl.style.width = pct + '%';
        }
    }
});

function handleInteraction(e) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    // --- Combo Logic ---
    const now = Date.now();
    if (now - lastClickTime < 1500) {
        comboCount++;
    } else {
        comboCount = 1;
    }
    lastClickTime = now;
    updateComboUI();

    // --- Colony Construction Acceleration ---
    let accelerated = false;
    for (const key in buildings) {
        if (buildings[key].finishTime > now) {
            buildings[key].finishTime -= 1000;
            accelerated = true;
        }
    }
    if (accelerated && typeof updateColonyUI === 'function') updateColonyUI();

    if (comboCount >= 25 && !feverModeActive) {
        startFeverMode();
    }
    
    let clickAmt = (1 + (upgrades.clickMastery ? upgrades.clickMastery.lv * 5 : 0));
    const surgeChance = 0.02 + (upgrades.clickSurge ? upgrades.clickSurge.lv * 0.005 : 0) + (getArtifactBonus('surge_chance').mult - 1.0); // Correctly sum bonuses

    if (Math.random() < surgeChance) {
        clickAmt *= 4;
        showEventToast("CLICK SURGE! 4X", "#ff00ff");
        playSfx(600, 'square', 0.1);
    }
    totalClicks += clickAmt;
    playSfx(400 + Math.random()*200);
    
    const baseChance = 0.20;
    const upgradeChance = upgrades.pineChance ? (upgrades.pineChance.lv * 0.02) : 0;
    let dropChance = tempPineBoost ? 1.0 : (baseChance + upgradeChance + (getArtifactBonus('pine_chance').mult - 1.0)); // Correctly sum bonuses

    if (Date.now() < activePotions.green) dropChance += 0.20;
    if (bonusType === 1) dropChance *= 3;
    
    if (Math.random() < dropChance) {
        const luckyChance = 0.01 + (upgrades.luckyCharm ? upgrades.luckyCharm.lv * 0.005 : 0);
        if (Math.random() < luckyChance) {
            totalPines += 5;
            if (typeof updateMissionProgress === 'function') updateMissionProgress('pines', 5);
            for(let i=0; i<5; i++) setTimeout(() => plantPineVisual(true), i*100);
            showEventToast("LUCKY FIND!\n+5 🌲", "#2ecc71");
        } else {
            totalPines++;
            if (typeof updateMissionProgress === 'function') updateMissionProgress('pines', 1);
            plantPineVisual();
        }
    }
    
    if (typeof launchShips === 'function') launchShips(e, false);
    if (typeof checkUnlocks === 'function') checkUnlocks();
}

function startFeverMode() {
    feverModeActive = true;
    
    let duration = 5000;
    duration += getArtifactBonus('fever_dur').flat * 1000;
    feverEndTime = Date.now() + duration;
    
    showEventToast("🔥 FEVER MODE ACTIVE! 🔥\n2X DAMAGE", "#ff4500");
    playSfx(800, 'sawtooth', 0.2);
    
    // Add a temporary screen effect
    const overlay = document.getElementById('supernova-overlay');
    if (overlay) {
        overlay.style.background = 'radial-gradient(circle, rgba(255, 69, 0, 0.2) 0%, transparent 70%)';
        overlay.style.opacity = 1;
    }

    const checkFever = setInterval(() => {
        if (Date.now() >= feverEndTime) {
            feverModeActive = false;
            clearInterval(checkFever);
            if (overlay) overlay.style.opacity = 0;
            comboCount = 0; // Reset combo after fever ends
            showEventToast("FEVER MODE ENDED", "#aaa");
        }
    }, 100);
}
