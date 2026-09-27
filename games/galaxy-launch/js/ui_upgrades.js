// ==========================================
// UPGRADE PURCHASE LOGIC & NOTIFICATIONS
// ==========================================

function buyUpgrade(key) {
    const u = upgrades[key]; if (u.maxLv && u.lv >= u.maxLv) return;
    const cost = getHangarCost(key);
    if (stardust >= cost) {
        stardust -= cost; u.lv++;
        if (key === "auto" || key === "autoSpeed" || key === "autoPower") startAutoHangar();
        updateUI(); playSfx(800, "square");
        if (typeof updateTerminalLog === 'function') updateTerminalLog(`UPGRADE SUCCESS: ${key.toUpperCase()} LV.${u.lv}`, 'var(--pine)');
    }
}

function buyPineUpgrade(key) {
    const u = upgrades[key]; if (u.maxLv && u.lv >= u.maxLv) return;
    
    // Global Dimension Rift Discount
    let globalDiscount = 1.0;
    if (upgrades.dimRift && upgrades.dimRift.lv > 0) globalDiscount -= (upgrades.dimRift.lv * 0.02);

    let cost = Math.floor(u.baseCost * Math.pow(u.mult, u.lv) * globalDiscount);
    cost *= getArtifactBonus('pine_lab_cost').mult;
    cost *= getArtifactBonus('market_disc').mult;

    if (totalPines >= cost) {
        totalPines -= cost; u.lv++;
        updateUI(); playSfx(1000, "sine", 0.2);
        if (typeof updateTerminalLog === 'function') updateTerminalLog(`BIO-RESEARCH UPDATED: ${key.toUpperCase()} LV.${u.lv}`, 'var(--pine)');
    }
}

function buyEngUpgrade(key) {
    const u = upgrades[key]; if (u.maxLv && u.lv >= u.maxLv) return;
    const cost = getEngCost(key);
    if (gears >= cost) {
        gears -= cost; u.lv++;
        updateUI(); playSfx(600, "sawtooth", 0.1);
        if (typeof updateTerminalLog === 'function') updateTerminalLog(`ENG PROTOCOL ENABLED: ${key.toUpperCase()} LV.${u.lv}`, 'var(--gear)');
    }
}

function buyDarkUpgrade(key) {
    const u = upgrades[key];
    if (u.maxLv && u.lv >= u.maxLv) return;
    let cost = Math.floor(u.baseCost * Math.pow(u.mult, u.lv));
    cost *= getArtifactBonus('black_market_cost').mult;

    if (darkMatter >= cost) {
        darkMatter -= cost; u.lv++;
        if (key === "darkFlow") startAutoHangar();
        updateUI(); playSfx(200, "sawtooth", 0.3);
        if (typeof updateTerminalLog === 'function') updateTerminalLog(`VOID CONTRACT SIGNED: ${key.toUpperCase()} LV.${u.lv}`, 'var(--dark)');
    }
}

function syncAutoUpgradeUI() {
    const statusEl = document.getElementById('auto-upg-status');
    const toggleBtn = document.getElementById('auto-upg-toggle');
    
    if (statusEl) {
        statusEl.innerText = isAutoUpgradeActive ? "ON" : "OFF";
        statusEl.style.color = isAutoUpgradeActive ? "#00ff64" : "#ff4757";
    }
    
    if (toggleBtn) {
        if (isAutoUpgradeActive) toggleBtn.classList.add('active');
        else toggleBtn.classList.remove('active');
    }
}

function toggleAutoUpgrade(e) {
    if (e) e.stopPropagation();
    isAutoUpgradeActive = !isAutoUpgradeActive;
    
    syncAutoUpgradeUI();
    
    if (typeof playSfx === 'function') playSfx(isAutoUpgradeActive ? 1200 : 400, "sine", 0.2);
    if (typeof updateTerminalLog === 'function') {
        updateTerminalLog(`AUTO-UPGRADE PROTOCOL: ${isAutoUpgradeActive ? 'ENABLED' : 'DISABLED'}`, 'var(--neon)');
    }
}

function autoUpgradeActiveTab() {
    if (!isAutoUpgradeActive) return;
    
    const shop = document.getElementById('unified-shop');
    if (!shop || shop.classList.contains('minimized')) return;

    const activeTab = document.querySelector('.shop-tab-content[style*="display: block"], .shop-tab-content.active:not([style*="display: none"])');
    if (!activeTab || activeTab.classList.contains('locked-panel')) return;

    // Find all purchase buttons in the active tab that are NOT disabled
    const buttons = Array.from(activeTab.querySelectorAll('.tech-btn:not(:disabled)'));
    
    // Attempt to click a random available one
    if (buttons.length > 0) {
        const randomIndex = Math.floor(Math.random() * buttons.length);
        buttons[randomIndex].click();
    }
}

function checkNotifications() {
    // Shop (Hangar)
    let shopNotify = false;
    ['click', 'auto', 'autoSpeed', 'autoPower', 'shipReinforce'].forEach(key => {
        const u = upgrades[key];
        if (u.maxLv && u.lv >= u.maxLv) return;
        if (stardust >= getHangarCost(key)) shopNotify = true;
    });
    toggleNotify('tab-btn-shop', shopNotify);

    // Pine Lab
    let pineNotify = false;
    ['clickMastery', 'pineChance', 'luckyCharm', 'pinePower', 'market'].forEach(key => {
        const u = upgrades[key];
        if (u.maxLv && u.lv >= u.maxLv) return;
        
        let globalDiscount = 1.0;
        if (upgrades.dimRift && upgrades.dimRift.lv > 0) globalDiscount -= (upgrades.dimRift.lv * 0.02);

        let cost = Math.floor(u.baseCost * Math.pow(u.mult, u.lv) * globalDiscount);
        cost *= getArtifactBonus('pine_lab_cost').mult;
        cost *= getArtifactBonus('market_disc').mult;
        if (totalPines >= cost) pineNotify = true;
    });
    toggleNotify('tab-btn-pine-lab', pineNotify);

    // Eng Bay
    let engNotify = false;
    ['clickSurge', 'rapidCon', 'planetScan', 'droneFreq', 'critChance'].forEach(key => {
        const u = upgrades[key];
        if (u.maxLv && u.lv >= u.maxLv) return;
        const cost = getEngCost(key);
        if (gears >= cost) engNotify = true;
    });
    toggleNotify('tab-btn-eng-bay', engNotify);

    // Black Market
    let darkNotify = false;
    ['darkFlow', 'antimatter', 'hyperDrive', 'starForge', 'dimRift'].forEach(key => {
        const u = upgrades[key];
        if (!u) return;
        if (u.maxLv && u.lv >= u.maxLv) return;
        let cost = Math.floor(u.baseCost * Math.pow(u.mult, u.lv));
        cost *= getArtifactBonus('black_market_cost').mult;
        if (darkMatter >= cost) darkNotify = true;
    });
    toggleNotify('tab-btn-black-market', darkNotify);

    // Colony
    let colonyNotify = false;
    Object.keys(buildingData).forEach(key => {
        const b = buildings[key];
        if (b.finishTime > 0) return;
        const data = buildingData[key];
        
        let globalDiscount = 1.0;
        if (upgrades.dimRift && upgrades.dimRift.lv > 0) globalDiscount -= (upgrades.dimRift.lv * 0.02);
        
        const cost = Math.floor(data.baseCost * Math.pow(data.costMult, b.lv) * globalDiscount);
        if (data.type === 'stardust' && stardust >= cost) colonyNotify = true;
        if (data.type === 'pines' && totalPines >= cost) colonyNotify = true;
        if (data.type === 'gears' && gears >= cost) colonyNotify = true;
        if (data.type === 'dark' && darkMatter >= cost) colonyNotify = true;
    });
    toggleNotify('unified-colony', colonyNotify);
}

function toggleNotify(id, active) {
    const el = document.getElementById(id);
    if (!el) return;
    if (active) el.classList.add('notify');
    else el.classList.remove('notify');
}
