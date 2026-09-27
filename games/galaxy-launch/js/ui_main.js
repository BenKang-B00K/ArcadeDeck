// ==========================================
// UI: MAIN UPDATES (Stats & Bars)
// ==========================================

function updateCostProgress(key, currentRes, cost) {
    const progEl = document.getElementById(`prog-${key}`);
    if (!progEl) return;

    if (currentRes >= cost) {
        progEl.innerHTML = '<span style="color:var(--neon);">READY</span>';
    } else {
        const needed = cost - currentRes;
        const pct = Math.floor((currentRes / cost) * 100);
        if (typeof formatNumber === 'function') {
            progEl.innerHTML = `(<span class="cost-needed">-${formatNumber(needed)}</span> / ${pct}%)`;
        } else {
            progEl.innerHTML = `(<span class="cost-needed">-${needed.toLocaleString()}</span> / ${pct}%)`;
        }
    }
}

function calculateHangarDps() {
    const shipData = ships[currentShipIdx];
    const pineBonus = 1 + (upgrades.pinePower.lv * 0.1);
    const autoShipsCount = (upgrades.auto ? upgrades.auto.lv : 0) || (upgrades.autoPower && upgrades.autoPower.lv > 0 ? 1 : 0);
    
    if (autoShipsCount <= 0) return 0;

    const interval = (typeof getAutoInterval === 'function') ? getAutoInterval() : 1000;
    const autoRatePerSec = (1000 / interval) * autoShipsCount;
    const autoPowerBonus = 1 + (upgrades.autoPower.lv * 0.2);
    
    let autoBonus = (pineBonus * ufoDamageMultiplier * autoPowerBonus * 10);
    autoBonus *= Math.pow(1.15, hasArtifact('art_dmg'));
    autoBonus *= Math.pow(1.15, hasArtifact('art_omni'));
    autoBonus *= Math.pow(1.50, hasArtifact('art_omega_core'));
    
    if (typeof eventDmgMult !== 'undefined') autoBonus *= eventDmgMult;

    // Weighted Critical Factor
    let cChance = 0.10 + (upgrades.critChance ? upgrades.critChance.lv * 0.005 : 0);
    cChance += (hasArtifact('art_crit') * 0.10);
    cChance += (hasArtifact('art_comet_tail') * 0.05);
    if (typeof eventCritFull !== 'undefined' && eventCritFull) cChance += 1.0;

    let cMult = 3 + (upgrades.antimatter ? upgrades.antimatter.lv * 0.5 : 0);
    cMult += (hasArtifact('art_crit_dmg') * 1.0);
    cMult += (hasArtifact('art_supernova') * 2.0);
    if (typeof eventCritFull !== 'undefined' && eventCritFull) cMult *= 2.0;

    let weightedMult;
    if (cChance <= 1.0) {
        weightedMult = (1 - cChance) + (cChance * cMult);
    } else {
        const sCritChance = Math.min(1, cChance - 1.0);
        weightedMult = ((1 - sCritChance) * cMult) + (sCritChance * cMult * 2);
    }
    
    let speedMult = 1.0;
    if (upgrades.hyperDrive && upgrades.hyperDrive.lv > 0) speedMult += (upgrades.hyperDrive.lv * 0.1);
    speedMult *= Math.pow(1.25, hasArtifact('art_nebula_fuel'));
    
    return (shipData.dmg * autoBonus * weightedMult) * autoRatePerSec * speedMult;
}

function updateUI() {
    const fmt = (n) => typeof formatNumber === 'function' ? formatNumber(n) : n.toLocaleString();

    document.getElementById('stardust').innerText = fmt(stardust);
    document.getElementById('pines').innerText = fmt(totalPines);
    document.getElementById('gears-val').innerText = fmt(gears);
    document.getElementById('dark-matter').innerText = fmt(darkMatter);

    // Update Production Rates in Overview
    if (typeof getBuildingProduction === 'function') {
        const pinesRate = getBuildingProduction('greenhouse', buildings.greenhouse.lv) + getBuildingProduction('biodome', buildings.biodome.lv);
        const gearsRate = getBuildingProduction('factory', buildings.factory.lv);
        const darkRate = getBuildingProduction('darklab', buildings.darklab.lv);

        const pr = document.getElementById('pines-rate');
        const gr = document.getElementById('gears-rate');
        const dr = document.getElementById('dark-matter-rate');

        if (pr) pr.innerText = `+${pinesRate.toLocaleString(undefined, {maximumFractionDigits:1})}/s`;
        if (gr) gr.innerText = `+${gearsRate.toLocaleString(undefined, {maximumFractionDigits:1})}/s`;
        if (dr) dr.innerText = `+${darkRate.toLocaleString(undefined, {maximumFractionDigits:2})}/s`;
    }
    
    // Update Destruction Counts
    const droneEl = document.getElementById('drones-destroyed');
    const ufoEl = document.getElementById('ufos-destroyed');
    if (droneEl) droneEl.innerText = `🤖 ${fmt(totalDronesDestroyed)}`;
    if (ufoEl) ufoEl.innerText = `🛸 ${fmt(totalUfosDestroyed)}`;

    document.getElementById('total-clicks-display').innerText = fmt(totalClicks);
    
    const hpPercent = (hp / maxHp * 100);
    document.getElementById('hp-bar').style.width = hpPercent + "%";
    document.getElementById('hp-text').innerText = `${fmt(hp)} / ${fmt(maxHp)}`;

    const shipData = ships[currentShipIdx];
    const pineBonus = 1 + (upgrades.pinePower.lv * 0.1);
    const titleIdx = Math.min(prestigeLevel, prestigeTitles.length - 1);
    document.getElementById('prestige-display').innerText = `${prestigeTitles[titleIdx]} (Lv.${prestigeLevel})`;

    const canPrestige = upgrades.click.lv >= 30 && upgrades.auto.lv >= 30 && upgrades.autoSpeed.lv >= 30;
    const prestigeBtn = document.getElementById('prestige-btn');
    if (prestigeBtn) {
        if (canPrestige) {
            prestigeBtn.innerText = "🌟 CONQUERED NOW!";
            prestigeBtn.style.opacity = "1";
            prestigeBtn.style.boxShadow = "0 0 15px #9b59b6";
            prestigeBtn.disabled = false;
        } else {
            prestigeBtn.innerText = "🌟 CONQUERED (Req: Lv.30 Hangar Upgrades)";
            prestigeBtn.style.opacity = "0.4";
            prestigeBtn.style.boxShadow = "none";
            prestigeBtn.disabled = true;
        }            
    }

    // Calculate weighted DPS
    let autoDps = calculateHangarDps();
    document.getElementById('auto-rate').innerText = fmt(autoDps) + " DPS";
    
    // Update Critical & Speed Stats
    let currentCritChance = 0.10 + (upgrades.critChance ? upgrades.critChance.lv * 0.005 : 0);
    currentCritChance += (hasArtifact('art_crit') * 0.10);
    currentCritChance += (hasArtifact('art_comet_tail') * 0.05);
    if (typeof eventCritFull !== 'undefined' && eventCritFull) currentCritChance += 1.0;
    
    let currentCritMult = 3 + (upgrades.antimatter ? upgrades.antimatter.lv * 0.5 : 0);
    currentCritMult += (hasArtifact('art_crit_dmg') * 1.0);
    currentCritMult += (hasArtifact('art_supernova') * 2.0);
    if (typeof eventCritFull !== 'undefined' && eventCritFull) currentCritMult *= 2.0;

    let currentSpeedMult = 1.0;
    if (upgrades.hyperDrive && upgrades.hyperDrive.lv > 0) currentSpeedMult += (upgrades.hyperDrive.lv * 0.1);
    currentSpeedMult *= Math.pow(1.25, hasArtifact('art_nebula_fuel'));

    const critEl = document.getElementById('crit-rate-display');
    const critDmgEl = document.getElementById('crit-dmg-display');
    const speedEl = document.getElementById('proj-speed-display');

    if (critEl) critEl.innerText = (currentCritChance * 100).toFixed(1) + "%";
    if (critDmgEl) critDmgEl.innerText = currentCritMult.toFixed(1) + "x";
    if (speedEl) speedEl.innerText = currentSpeedMult.toFixed(1) + "x";

    const discount = 1 - (upgrades.market.lv * 0.05);
    ['click', 'auto', 'autoSpeed', 'autoPower', 'shipReinforce'].forEach(key => {
        const u = upgrades[key];
        const btn = document.getElementById(`upg-${key}`);
        if (!btn) return;
        
        if (u.lv >= (u.maxLv || 999999)) btn.classList.add('mastered');
        else btn.classList.remove('mastered');

        const cost = (typeof getHangarCost === 'function') ? getHangarCost(key) : 0;
        document.getElementById(`lv-${key}`).innerText = fmt(u.lv);
        document.getElementById(`max-${key}`).innerText = u.maxLv ? ` / ${u.maxLv}` : ' / ∞';
        
        if (u.maxLv && u.lv >= u.maxLv) {
            document.getElementById(`cost-${key}`).innerText = "MAX";
            btn.disabled = true;
            const progEl = document.getElementById(`prog-${key}`);
            if (progEl) progEl.innerText = "";
        } else {
            document.getElementById(`cost-${key}`).innerText = fmt(cost);
            btn.disabled = stardust < cost;
            updateCostProgress(key, stardust, cost);
        }

        if (key === 'click') document.getElementById('val-click').innerText = fmt(u.lv);
        if (key === 'auto') document.getElementById('val-auto').innerText = fmt(u.lv);
        if (key === 'autoSpeed') document.getElementById('val-autoSpeed').innerText = fmt(u.lv * 5);
        if (key === 'autoPower') document.getElementById('val-autoPower').innerText = fmt(u.lv * 20);
        if (key === 'shipReinforce') document.getElementById('val-shipReinforce').innerText = fmt(u.lv * 10);
    });

    ['clickMastery', 'pineChance', 'luckyCharm', 'pinePower', 'market'].forEach(key => {
        const u = upgrades[key];
        if (!u) return;
        
        let globalDiscount = 1.0;
        if (upgrades.dimRift && upgrades.dimRift.lv > 0) globalDiscount -= (upgrades.dimRift.lv * 0.02);

        let cost = Math.floor(u.baseCost * Math.pow(u.mult, u.lv) * globalDiscount);
        cost *= Math.pow(0.85, hasArtifact('art_recycler'));
        cost *= Math.pow(0.90, hasArtifact('art_market'));

        document.getElementById(`lv-${key}`).innerText = fmt(u.lv);
        document.getElementById(`max-${key}`).innerText = u.maxLv ? ` / ${u.maxLv}` : ' / ∞';
        
        if (u.maxLv && u.lv >= u.maxLv) {
            document.getElementById(`cost-${key}`).innerText = "MAX";
            document.getElementById(`upg-${key}`).disabled = true;
            const progEl = document.getElementById(`prog-${key}`);
            if (progEl) progEl.innerText = "";
        } else {
            document.getElementById(`cost-${key}`).innerText = fmt(cost);
            document.getElementById(`upg-${key}`).disabled = totalPines < cost;
            updateCostProgress(key, totalPines, cost);
        }

        if(key === 'pinePower') document.getElementById('val-pinePower').innerText = fmt(u.lv * 10);
        if(key === 'market') document.getElementById('val-market').innerText = Math.round((1-discount)*100);
        if(key === 'clickMastery') document.getElementById('val-clickMastery').innerText = fmt(u.lv * 5);
        if(key === 'pineChance') document.getElementById('val-pineChance').innerText = fmt(u.lv);
        if(key === 'luckyCharm') document.getElementById('val-luckyCharm').innerText = (u.lv * 0.5).toFixed(1);
    });

    ['clickSurge', 'rapidCon', 'planetScan', 'droneFreq', 'critChance'].forEach(key => {
        const u = upgrades[key];
        if (!u) return;
        const cost = (typeof getEngCost === 'function') ? getEngCost(key) : 0;
        const lvEl = document.getElementById(`lv-${key}`);
        const maxEl = document.getElementById(`max-${key}`);
        const costEl = document.getElementById(`cost-${key}`);
        const btn = document.getElementById(`upg-${key}`);
        
        if (lvEl) lvEl.innerText = fmt(u.lv);
        if (maxEl) maxEl.innerText = u.maxLv ? ` / ${u.maxLv}` : ' / ∞';
        
        if (u.maxLv && u.lv >= u.maxLv) {
            if (costEl) costEl.innerText = "MAX";
            if (btn) btn.disabled = true;
            const progEl = document.getElementById(`prog-${key}`);
            if (progEl) progEl.innerText = "";
        } else {
            if (costEl) costEl.innerText = fmt(cost);
            if (btn) btn.disabled = gears < cost;
            updateCostProgress(key, gears, cost);
        }
        
        const valEl = document.getElementById(`val-${key}`);
        if (valEl) {
            if (key === 'critChance') valEl.innerText = (u.lv * 0.5).toFixed(1);
            if (key === 'droneFreq') valEl.innerText = (u.lv * 0.5).toFixed(1);
            if (key === 'planetScan') valEl.innerText = (u.lv * 0.1).toFixed(1);
            if (key === 'clickSurge') valEl.innerText = (2 + u.lv * 0.5).toFixed(1);
            if (key === 'rapidCon') valEl.innerText = fmt(u.lv * 10);
        }
    });

    ['darkFlow', 'antimatter', 'hyperDrive', 'starForge', 'dimRift'].forEach(key => {
        const u = upgrades[key];
        if (!u) return;
        let cost = Math.floor(u.baseCost * Math.pow(u.mult, u.lv));
        cost *= Math.pow(0.85, hasArtifact('art_blackbox'));
        
        const lvEl = document.getElementById(`lv-${key}`);
        const maxEl = document.getElementById(`max-${key}`);
        const costEl = document.getElementById(`cost-${key}`);
        const btn = document.getElementById(`upg-${key}`);
        
        if (lvEl) lvEl.innerText = fmt(u.lv);
        if (maxEl) maxEl.innerText = u.maxLv ? ` / ${u.maxLv}` : ' / ∞';
        if (costEl) costEl.innerText = fmt(cost);
        if (btn) btn.disabled = darkMatter < cost;
        updateCostProgress(key, darkMatter, cost);

        const valEl = document.getElementById(`val-${key}`);
        if (valEl) {
            if (key === 'darkFlow') valEl.innerText = fmt(u.lv * 5);
            if (key === 'antimatter') valEl.innerText = (u.lv * 0.5).toFixed(1);
            if (key === 'hyperDrive') valEl.innerText = fmt(u.lv * 10);
            if (key === 'starForge') valEl.innerText = (1 + u.lv * 0.2).toFixed(1);
            if (key === 'dimRift') valEl.innerText = fmt(u.lv * 2);
        }
    });

    if (typeof checkNotifications === 'function') checkNotifications();
    if (typeof renderLobbyArtifacts === 'function') renderLobbyArtifacts();
}
