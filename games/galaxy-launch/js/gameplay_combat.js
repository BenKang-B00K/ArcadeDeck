// ==========================================
// GAMEPLAY COMBAT (Ships & Damage)
// ==========================================

function launchShips(e, isAuto) {
    if (isLevelingUp) return;
    
    // --- EMP Check ---
    if (isAuto && bossEmpActive) {
        if (Date.now() < bossEmpEnd) return;
        else bossEmpActive = false;
    }

    let count = isAuto ? upgrades.auto.lv : upgrades.click.lv;
    
    if (isAuto && count === 0 && upgrades.autoPower && upgrades.autoPower.lv > 0) {
        count = 1;
    }
    
    if (count === 0) return;

    const shipData = ships[currentShipIdx];
    let bonus = 1 + (upgrades.pinePower.lv * 0.1);
    
    if (isAuto) {
        const autoPowerBonus = 1 + (upgrades.autoPower.lv * 0.2); 
        bonus *= (autoPowerBonus * 10);
    } else {
        bonus *= 200;
        if (feverModeActive) bonus *= 2; // Fever mode bonus
    }
    if (upgrades.shipReinforce) bonus *= (1 + upgrades.shipReinforce.lv * 0.10);
    
    // UFO Event Multipliers
    bonus *= eventDmgMult;
    if (!isAuto) bonus *= eventClickMult;

    bonus *= ufoDamageMultiplier;
    
    // Artifact Multipliers
    bonus *= getArtifactBonus('dmg').mult;

    if (!isAuto) {
        let clickBonus = getArtifactBonus('click_dmg').mult;
        // Neural Link: Click Damage per Hangar Lv
        const neuralBonus = getArtifactBonus('click_dmg_hangar').mult;
        if (neuralBonus > 1.0) {
            const hangarLv = upgrades.click ? upgrades.click.lv : 1;
            clickBonus += (neuralBonus - 1.0) * hangarLv;
        }
        bonus *= clickBonus;
    }

    const finalDmgPerShip = shipData.dmg * bonus;
    
    // Proj Speed Multiplier (Kinetic Energy)
    let speedMult = 1.0;
    if (upgrades.hyperDrive && upgrades.hyperDrive.lv > 0) speedMult += (upgrades.hyperDrive.lv * 0.1);
    speedMult *= getArtifactBonus('proj_speed').mult;
    
    const finalDmgWithSpeed = finalDmgPerShip * speedMult;
    const totalDmgForThisTick = count * finalDmgWithSpeed;

    let normalShipCount = count % 10;
    let bigShipCount = Math.floor(count / 10);

    if (isAuto) {
        normalShipCount = Math.min(normalShipCount, 1); // Reduced from 2
        bigShipCount = Math.min(bigShipCount, 1);    // Reduced from 2
    } else {
        normalShipCount = Math.min(normalShipCount, 2); // Reduced from 4
        bigShipCount = Math.min(bigShipCount, 2);    // Reduced from 3
    }

    if (normalShipCount === 0 && bigShipCount === 0 && count > 0) normalShipCount = 1;

    // Track Mission Progress: Manual Clicks
    if (!isAuto && typeof updateMissionProgress === 'function') {
        updateMissionProgress('clicks', 1);
    }

    const totalVisualWeight = (normalShipCount * 1) + (bigShipCount * 10);
    const compressedDmgPerWeight = totalDmgForThisTick / totalVisualWeight;

    for(let i = 0; i < normalShipCount; i++) {
        setTimeout(() => {
            if (typeof createShip === 'function') createShip(e, compressedDmgPerWeight * 1, shipData.icon, isAuto, false, shipData.proj);
        }, i * 50);
    }
    for(let i = 0; i < bigShipCount; i++) {
        setTimeout(() => {
            if (typeof createShip === 'function') createShip(e, compressedDmgPerWeight * 10, shipData.icon, isAuto, true, shipData.proj);
        }, (normalShipCount * 50) + (i * 80));
    }
}

function dealDamage(amount, isAuto) {
    if (isLevelingUp) return;
    
    let finalDmg = amount;
    
    // --- Boss Ability Triggers ---
    if (isBossFight) {
        const hpPct = hp / maxHp;
        
        // EMP: Disables Auto-DPS (80% HP)
        if (hpPct <= 0.80 && !bossAbilityUsed80) {
            bossAbilityUsed80 = true;
            bossEmpActive = true;
            bossEmpEnd = Date.now() + 4000;
            showEventToast("⚠️ BOSS EMP DETECTED!\nAUTO-DPS DISABLED", "#00f2fe");
            if (typeof createBossEMP === 'function') createBossEMP();
            playSfx(150, "sawtooth", 0.6);
        }
        
        // Shield: Damage Reduction (40% HP)
        if (hpPct <= 0.40 && !bossAbilityUsed40) {
            bossAbilityUsed40 = true;
            bossShieldActive = true;
            bossShieldEnd = Date.now() + 6000;
            showEventToast("🛡️ SHIELD ACTIVATED!\n80% DMG REDUCTION", "#00f2fe");
            if (typeof createBossShield === 'function') createBossShield(6000);
            playSfx(800, "sine", 0.4);
        }
        
        // Handle active Shield
        if (bossShieldActive) {
            if (Date.now() < bossShieldEnd) {
                finalDmg *= 0.2; // 80% reduction
            } else {
                bossShieldActive = false;
            }
        }
    }

    let critChance = 0.10 + (upgrades.critChance ? upgrades.critChance.lv * 0.005 : 0);
    critChance += (getArtifactBonus('crit_chance').mult - 1.0);

    let isCrit = false;
    let isSuperCrit = false;

    // --- Saboteur Check ---
    if (isSaboteurActive) critChance = 0;
    if (eventCritFull) critChance += 1.0;

    if (Math.random() < critChance) {
        isCrit = true;
        let critMult = 3 + (upgrades.antimatter ? upgrades.antimatter.lv * 0.5 : 0);
        critMult += (getArtifactBonus('crit_dmg').mult - 1.0);
        critMult += getArtifactBonus('crit_mult').flat;
        
        if (eventCritFull) critMult *= 2.0; // Extra power during Void Infusion
        
        // NULLIFIER Drone Effect: Reset Crit Damage
        if (typeof isNullifierActive !== 'undefined' && isNullifierActive) critMult = 1.0;

        // Super Critical Check (if chance > 100%)
        if (critChance > 1.0 && Math.random() < (critChance - 1.0)) {
            isSuperCrit = true;
            finalDmg = finalDmg * critMult * 2; // Double the crit damage
        } else {
            finalDmg = finalDmg * critMult;
        }
    }

    if (!isAuto) grossClickDamage += finalDmg;

    const centerX = pixiApp.screen.width / 2;
    const centerY = pixiApp.screen.height / 2;
    
    if (typeof showDamageNumber === 'function') {
        showDamageNumber(centerX, centerY, finalDmg, isCrit, isSuperCrit, isAuto);
    }

    if (typeof playImpactSfx === 'function') {
        playImpactSfx(isCrit || isSuperCrit, isAuto);
    }

    hp -= finalDmg;
    
    // Revised Stardust Gain: 5% base + Critical Harvest bonus
    let gain = Math.max(1, Math.floor(finalDmg * 0.05));
    if (isCrit || isSuperCrit) gain *= 5; // Critical Harvest bonus
    
    if (upgrades.voidSiphon && upgrades.voidSiphon.lv > 0) gain = Math.floor(gain * (1 + upgrades.voidSiphon.lv * 0.1));
    if (upgrades.starForge && upgrades.starForge.lv > 0) gain = Math.floor(gain * (1 + upgrades.starForge.lv * 0.25));
    
    // Artifact Multipliers
    gain = Math.floor(gain * getArtifactBonus('stardust').mult);
    
    if (Date.now() < activePotions.neon) gain = Math.floor(gain * 1.1);

    stardust += gain;
    grossStardust += gain;

    if (typeof createStardustPop === 'function') {
        createStardustPop(centerX, centerY, isCrit || isSuperCrit);
    }

    if (bonusType === 2) {
        const pct = hp / maxHp;
        const visual = document.getElementById('target-visual');
        const rect = visual.getBoundingClientRect();
        const cx = rect.left + rect.width/2;
        const cy = rect.top + rect.height/2;

        if (pct <= 0.75 && !machineReward75) {
            machineReward75 = true;
            let amt = 1 + getArtifactBonus('gear_flat').flat;
            amt *= getArtifactBonus('gear_mult').mult;
            if (Date.now() < activePotions.gray) amt *= 2;
            gears += Math.floor(amt);
            showEventToast(`HP 75% BREACHED!\n+${Math.floor(amt)} ⚙️`, "#95a5a6");
            if (typeof createGearDebris === 'function') createGearDebris(cx, cy);
        }
        if (pct <= 0.50 && !machineReward50) {
            machineReward50 = true;
            let amt = 3 + getArtifactBonus('gear_flat').flat;
            amt *= getArtifactBonus('gear_mult').mult;
            if (Date.now() < activePotions.gray) amt *= 2;
            gears += Math.floor(amt);
            showEventToast(`HP 50% BREACHED!\n+${Math.floor(amt)} ⚙️`, "#95a5a6");
            if (typeof createGearDebris === 'function') createGearDebris(cx, cy);
        }
    }

    if (isCrit && typeof triggerCritVisuals === 'function') triggerCritVisuals();

    if (hp <= 0) {
        hp = 0;
        if (bonusType === 2) {
            let amt = 6 + getArtifactBonus('gear_flat').flat;
            amt *= getArtifactBonus('gear_mult').mult;
            if (Date.now() < activePotions.gray) amt *= 2; 
            gears += Math.floor(amt);
            showEventToast(`MACHINE PLANET DESTROYED!\n+${Math.floor(amt)} ⚙️`, "#95a5a6");
            const visual = document.getElementById('target-visual');
            if (visual) {
                const rect = visual.getBoundingClientRect();
                if (typeof createGearDebris === 'function') createGearDebris(rect.left + rect.width/2, rect.top + rect.height/2);
            }
        }
        if (typeof levelUp === 'function') levelUp();
    }
    if (typeof updateUI === 'function') updateUI();
}
