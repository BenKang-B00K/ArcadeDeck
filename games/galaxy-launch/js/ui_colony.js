// ==========================================
// COLONY UI & PRODUCTION LOGIC
// ==========================================

let isAutoColonyActive = false;

function getBuildingProduction(key, lv) {
    if (lv <= 0) return 0;
    const data = buildingData[key];
    // New Formula: Base * Lv * (Multiplier ^ (Lv-1))
    // This provides a balance between linear (early) and exponential (late) growth
    let prod = data.baseProd * lv * Math.pow(data.prodMult, Math.max(0, lv - 1));
    
    // Global Colony Artifact
    prod *= getArtifactBonus('colony_prod').mult;

    // Specific Multipliers
    if (key === 'miner') {
        prod *= getArtifactBonus('miner_prod').mult;
    } else if (key === 'darklab') {
        prod *= getArtifactBonus('dark_lab_prod').mult;
    } else if (data.type === 'pines') {
        prod *= getArtifactBonus('colony_pine').mult;
    }
    
    return prod;
}

function updateColonyUI() {
    const container = document.getElementById('colony-container');
    if (!container) return;
    
    // 1. Setup Summary Header if missing
    let summary = document.getElementById('colony-summary');
    if (!summary) {
        summary = document.createElement('div');
        summary.id = 'colony-summary';
        summary.style.display = 'grid';
        summary.style.gridTemplateColumns = '1fr 1fr';
        summary.style.gap = '5px';
        summary.style.marginBottom = '10px';
        summary.style.padding = '8px';
        summary.style.background = 'rgba(0,0,0,0.5)';
        summary.style.borderRadius = '4px';
        summary.style.fontSize = '11px';
        summary.style.border = '1px solid rgba(255,255,255,0.05)';
        container.parentElement.insertBefore(summary, container);
    }

    // 2. Setup Buttons if container empty
    if (container.innerHTML === '') {
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '8px';
        
        Object.keys(buildingData).forEach(key => {
            const data = buildingData[key];
            const btn = document.createElement('button');
            btn.id = `btn-${key}`;
            btn.className = 'tech-btn colony-btn';
            btn.style.width = '100%';
            btn.onclick = () => buyBuilding(key);
            btn.innerHTML = `
                <div class="colony-progress-bg"><div class="colony-progress-bar" id="prog-${key}"></div></div>
                <div class="tech-icon">${data.icon}</div>
                <div class="tech-info">
                    <span class="tech-name" id="name-${key}">${data.name} (Lv.0)</span>
                    <div class="tech-stat-row">
                        <span class="tech-stat" id="stat-${key}">0/s</span>
                        <span class="tech-arrow">→</span>
                        <span class="tech-next" id="next-${key}">0/s</span>
                    </div>
                    <div class="tech-cost" id="cost-${key}">Cost: ...</div>
                </div>
            `;
            container.appendChild(btn);
        });
        if (typeof setupUpgradeHold === 'function') setupUpgradeHold();
    }

    const now = Date.now();
    let sumPines = 0;
    let sumGears = 0;
    let sumDark = 0;

    Object.keys(buildingData).forEach(key => {
        const b = buildings[key];
        const data = buildingData[key];
        const btn = document.getElementById(`btn-${key}`);
        const progEl = document.getElementById(`prog-${key}`);
        const nameEl = document.getElementById(`name-${key}`);
        const statEl = document.getElementById(`stat-${key}`);
        const nextEl = document.getElementById(`next-${key}`);
        const costEl = document.getElementById(`cost-${key}`);
        
        // Calculate Cost
        let globalDiscount = 1.0;
        if (upgrades.dimRift && upgrades.dimRift.lv > 0) globalDiscount -= (upgrades.dimRift.lv * 0.02);
        const cost = Math.floor(data.baseCost * Math.pow(data.costMult, b.lv) * globalDiscount);
        
        // Calculate Production
        const currentProd = getBuildingProduction(key, b.lv);
        const nextProd = getBuildingProduction(key, b.lv + 1);
        
        // Add to Totals
        if (data.type === 'pines') sumPines += currentProd;
        if (data.type === 'gears') sumGears += currentProd;
        if (data.type === 'dark') sumDark += currentProd;

        let progress = 0;
        const unit = data.type === 'stardust' ? '✨' : (data.type === 'pines' ? '🌲' : (data.type === 'gears' ? '⚙️' : '🔮'));

        if (b.finishTime > 0) {
            let speedMult = 1.0;
            if (upgrades.rapidCon && upgrades.rapidCon.lv > 0) speedMult += (upgrades.rapidCon.lv * 0.1);
            
            // Build Speed Bonus (e.g. +40%)
            speedMult *= getArtifactBonus('colony_build_speed').mult;
            // Build Time Reduction (e.g. -50% means 2x speed)
            speedMult /= getArtifactBonus('colony_time').mult;
            
            // COLONIZER Drone Effect: Slow down construction
            if (typeof isColonizerActive !== 'undefined' && isColonizerActive) speedMult *= 0.2;

            let totalBuildTime = (data.baseTime * (b.lv + 1)) / speedMult;
            const timeLeft = Math.max(0, b.finishTime - now);
            progress = ((totalBuildTime - timeLeft) / totalBuildTime) * 100;
            
            btn.disabled = true;
            btn.classList.add('constructing');
            if (progEl) {
                progEl.parentElement.style.display = 'block';
                progEl.style.width = Math.min(100, progress) + '%';
            }
            if (statEl) statEl.innerText = `🚧 CONSTRUCTING...`;
            if (nextEl) nextEl.innerText = `${(timeLeft/1000).toFixed(1)}s left`;
        } else {
            btn.classList.remove('constructing');
            if (progEl) progEl.parentElement.style.display = 'none';
            
            let canAfford = (data.type === 'stardust' && stardust >= cost) || 
                            (data.type === 'pines' && totalPines >= cost) || 
                            (data.type === 'gears' && gears >= cost) ||
                            (data.type === 'dark' && darkMatter >= cost);
            btn.disabled = !canAfford;

            if (statEl) statEl.innerText = `${ currentProd.toLocaleString(undefined, {maximumFractionDigits:1}) }${unit}/s`;
            if (nextEl) nextEl.innerText = `${ nextProd.toLocaleString(undefined, {maximumFractionDigits:1}) }${unit}/s`;
        }

        if (nameEl) nameEl.innerText = `${data.name} (Lv.${b.lv})`;
        if (costEl) {
            costEl.innerText = b.finishTime > 0 ? 'PLEASE WAIT...' : 'Upgrade: ' + cost.toLocaleString() + ' ' + unit;
        }
    });

    // Update Summary
    summary.innerHTML = `
        <div style="color:var(--pine)">🌲 +${sumPines.toLocaleString(undefined, {maximumFractionDigits:1})}/s</div>
        <div style="color:var(--gear)">⚙️ +${sumGears.toFixed(1)}/s</div>
        <div style="color:var(--dark)">🔮 +${sumDark.toFixed(2)}/s</div>
    `;
}

function buyBuilding(key) {
    const b = buildings[key]; const data = buildingData[key];
    if (b.finishTime > 0) return;
    
    let globalDiscount = 1.0;
    if (upgrades.dimRift && upgrades.dimRift.lv > 0) globalDiscount -= (upgrades.dimRift.lv * 0.02);

    let cost = Math.floor(data.baseCost * Math.pow(data.costMult, b.lv) * globalDiscount);
    let canBuy = false;
    
    // Check Resources
    if (data.type === "stardust" && stardust >= cost) canBuy = true;
    else if (data.type === "pines" && totalPines >= cost) canBuy = true;
    else if (data.type === "gears" && gears >= cost) canBuy = true;
    else if (data.type === "dark" && darkMatter >= cost) canBuy = true;

    if (canBuy) {
        if (data.type === "stardust") stardust -= cost;
        else if (data.type === "pines") totalPines -= cost;
        else if (data.type === "gears") gears -= cost;
        else if (data.type === "dark") darkMatter -= cost;

        let speedMult = 1.0;
        if (upgrades.rapidCon && upgrades.rapidCon.lv > 0) speedMult += (upgrades.rapidCon.lv * 0.1);
        
        speedMult *= getArtifactBonus('colony_build_speed').mult;
        speedMult /= getArtifactBonus('colony_time').mult;
        
        // COLONIZER Drone Effect: Slow down construction
        if (typeof isColonizerActive !== 'undefined' && isColonizerActive) speedMult *= 0.2;

        let buildTime = (data.baseTime * (b.lv + 1)) / speedMult;
        b.finishTime = Date.now() + buildTime;
        updateUI(); updateColonyUI(); playSfx(200, "square", 0.5);

        if (typeof updateTerminalLog === 'function') {
            updateTerminalLog(`CONSTRUCTION STARTED: ${data.name.toUpperCase()} (Lv.${b.lv + 1})`, 'var(--colony)');
        }
    }
}

function syncAutoColonyUI() {
    const statusEl = document.getElementById('auto-colony-status');
    const toggleBtn = document.getElementById('auto-colony-toggle');
    
    if (statusEl) {
        statusEl.innerText = isAutoColonyActive ? "ON" : "OFF";
        statusEl.style.color = isAutoColonyActive ? "#00ff64" : "#ff4757";
    }
    
    if (toggleBtn) {
        if (isAutoColonyActive) toggleBtn.classList.add('active');
        else toggleBtn.classList.remove('active');
    }
}

function toggleAutoColony(e) {
    if (e) e.stopPropagation();
    isAutoColonyActive = !isAutoColonyActive;
    
    syncAutoColonyUI();
    
    if (typeof playSfx === 'function') playSfx(isAutoColonyActive ? 1200 : 400, "sine", 0.2);
    if (typeof updateTerminalLog === 'function') {
        updateTerminalLog(`AUTO-CONSTRUCTION PROTOCOL: ${isAutoColonyActive ? 'ENABLED' : 'DISABLED'}`, 'var(--neon)');
    }
}

function autoUpgradeColony() {
    if (!isAutoColonyActive) return;
    
    const colonyPanel = document.getElementById('unified-colony');
    if (!colonyPanel || colonyPanel.classList.contains('minimized')) return;

    // Find all colony buttons that are NOT disabled and NOT currently constructing
    const buttons = Array.from(colonyPanel.querySelectorAll('.colony-btn:not(:disabled):not(.constructing)'));
    
    // Attempt to click a random available one
    if (buttons.length > 0) {
        const randomIndex = Math.floor(Math.random() * buttons.length);
        buttons[randomIndex].click();
    }
}

function startColonyLoop() {
    if (window.colonyInterval) clearInterval(window.colonyInterval);
    const TICK_MS = 100;
    const TICK_FACTOR = TICK_MS / 1000;

    window.colonyInterval = setInterval(() => {
        const now = Date.now(); let updated = false;
        
        // Auto Upgrade check
        autoUpgradeColony();

        // Construction Check
        for (let key in buildings) {
            const b = buildings[key];
            if (b.finishTime > 0 && now >= b.finishTime) {
                b.lv++; b.finishTime = 0;
                showEventToast(buildingData[key].name + " Ready!", "#e67e22");
                playSfx(600, "sine", 0.5); updated = true;
                
                if (typeof updateTerminalLog === 'function') {
                    updateTerminalLog(`CONSTRUCTION COMPLETE: ${buildingData[key].name.toUpperCase()} LV.${b.lv}`, 'var(--gold)');
                }
            }
        }

        const prodPines = (getBuildingProduction('greenhouse', buildings.greenhouse.lv) + getBuildingProduction('biodome', buildings.biodome.lv)) * TICK_FACTOR;
        const prodGears = getBuildingProduction('factory', buildings.factory.lv) * TICK_FACTOR;
        const prodDark = getBuildingProduction('darklab', buildings.darklab.lv) * TICK_FACTOR;

        if (prodPines > 0) { 
            totalPines += prodPines; 
            if (typeof updateMissionProgress === 'function') updateMissionProgress('pines', prodPines);
            updated = true; 
        }
        if (prodGears > 0) { gears += prodGears; updated = true; }
        if (prodDark > 0) { darkMatter += prodDark; updated = true; }

        if (updated) { updateUI(); updateColonyUI(); }
    }, TICK_MS);
}

function checkOfflineProgress() {
    if (!lastSaveTime) return;
    const now = Date.now();
    let diffSeconds = (now - lastSaveTime) / 1000;
    
    if (diffSeconds > 60) { // Only if more than 1 minute
        // Cap at 30 minutes (1800 seconds)
        const isCapped = diffSeconds > 1800;
        const calcSeconds = Math.min(1800, diffSeconds);

        let multiplier = getArtifactBonus('offline_gain').mult;

        // 1. Colony Gains
        let gainedPines = (getBuildingProduction('greenhouse', buildings.greenhouse.lv) + getBuildingProduction('biodome', buildings.biodome.lv)) * calcSeconds * multiplier;
        let gainedGears = getBuildingProduction('factory', buildings.factory.lv) * calcSeconds * multiplier;
        let gainedDark = getBuildingProduction('darklab', buildings.darklab.lv) * calcSeconds * multiplier;

        // 2. Auto-Hangar Stardust Gains
        let gainedStardust = 0;
        if (typeof calculateHangarDps === 'function') {
            const dps = calculateHangarDps();
            // Offline stardust gain is typically a fraction of active DPS for balance, 
            // but let's use 50% of active DPS as base offline rate
            gainedStardust = dps * calcSeconds * 0.5 * multiplier;
        }

        if (gainedPines > 0) totalPines += gainedPines;
        if (gainedGears > 0) gears += gainedGears;
        if (gainedDark > 0) darkMatter += gainedDark;
        if (gainedStardust > 0) {
            stardust += gainedStardust;
            grossStardust += gainedStardust;
        }

        // Show Custom Modal
        const modal = document.getElementById('offline-modal');
        const timeText = document.getElementById('offline-time-text');
        const list = document.getElementById('offline-gains-list');

        if (modal && timeText && list) {
            timeText.innerText = `YOU WERE AWAY FOR ${Math.floor(diffSeconds / 60)}m ${Math.floor(diffSeconds % 60)}s`;
            
            let html = "";
            const fmt = (n) => typeof formatNumber === 'function' ? formatNumber(n) : Math.floor(n).toLocaleString();

            if (gainedStardust > 0) html += `<div class="stat-item"><span class="stat-label">✨ Stardust</span><span class="stat-val-mid">${fmt(gainedStardust)}</span></div>`;
            if (gainedPines > 0) html += `<div class="stat-item"><span class="stat-label">🌲 Pines</span><span class="stat-val-mid">${fmt(gainedPines)}</span></div>`;
            if (gainedGears > 0) html += `<div class="stat-item"><span class="stat-label">⚙️ Gears</span><span class="stat-val-mid">${fmt(gainedGears)}</span></div>`;
            if (gainedDark > 0) html += `<div class="stat-item"><span class="stat-label">🔮 Dark Matter</span><span class="stat-val-mid">${fmt(gainedDark)}</span></div>`;

            list.innerHTML = html;
            modal.style.display = 'flex';
            
            // Add click-anywhere to close functionality
            const overlay = modal.querySelector('.codex-overlay');
            if (overlay && !overlay.hasAttribute('data-listener')) {
                overlay.addEventListener('click', closeOfflineModal);
                overlay.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    closeOfflineModal();
                }, { passive: false });
                overlay.setAttribute('data-listener', 'true');
            }

            if (typeof updateUI === 'function') updateUI();
            if (typeof updateColonyUI === 'function') updateColonyUI();
            if (typeof playSfx === 'function') playSfx(800, 'sine', 0.5);
        }
    }
}
