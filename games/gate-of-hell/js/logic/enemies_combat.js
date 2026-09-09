/* enemies_combat.js - Handles enemy death, rewards, and on-death effects */

/**
 * Handles enemy death, rewards, and related triggers.
 */
function handleEnemyDeath(target, killer = null) {
    if (target.hp > 0) return;
    const idx = window.enemies.indexOf(target);
    if (idx > -1) {
        if (typeof GameLogger !== 'undefined') GameLogger.success(`Defeated: ${target.data?.name || target.type}`);
        if (!window.killCounts) window.killCounts = {};
        window.killCounts[target.type] = (window.killCounts[target.type] || 0) + 1;
        window.stageKilledCount = (window.stageKilledCount || 0) + 1;

        if (target.isCursedMark) spawnDeathExplosion(target, '#2e003e', 30, 0.5); 
        if (target.isHellfireBurn) spawnDeathExplosion(target, '#ff4500', 25, 30, true);
        if (target.type === 'ember_hatred') spawnDeathExplosion(target, 'rgba(255, 69, 0, 0.6)', 35, 0, false, (e) => { e.speed *= 1.5; setTimeout(() => { e.speed = e.baseSpeed; }, 3000); });
        
        if (killer && killer.data && killer.data.type === 'wraithlord') spawnFriendlySkeleton(target);

        if (typeof spawnSoulEssence === 'function') {
            const lx = (target.x / 100) * LOGICAL_WIDTH;
            const ly = target.y;
            spawnSoulEssence(lx, ly);
        }

        window.enemies.splice(idx, 1);
        if (typeof checkRelicDrop === 'function') checkRelicDrop(target);
        if (typeof checkEquipmentDrop === 'function') checkEquipmentDrop(target);
        if (typeof checkSoulCrystalDrop === 'function') checkSoulCrystalDrop(target);
        if (typeof checkSoulFragmentDrop === 'function') checkSoulFragmentDrop(target);

        // Relic: carnage_pulse — combo on consecutive kills.
        if (typeof incrementCombo === 'function') incrementCombo();

        // Relic: infernal_ledger — cumulative kill counter + windfall trigger.
        window.totalKillsCounter = (window.totalKillsCounter || 0) + 1;
        if (typeof checkLedgerWindfall === 'function') checkLedgerWindfall();

        // Relic: soul_refluxor — % chance per kill to refund portal contamination.
        const healChance = (typeof getRelicBonus === 'function') ? getRelicBonus('portal_heal_chance') : 0;
        if (healChance > 0 && window.portalEnergy > 0 && Math.random() < healChance) {
            const stacks = (typeof countRelicStacks === 'function') ? countRelicStacks('portal_heal_chance') : 1;
            window.portalEnergy = Math.max(0, window.portalEnergy - Math.max(1, stacks));
            if (typeof spawnFloatingText === 'function') {
                const lx = (target.x / 100) * LOGICAL_WIDTH;
                spawnFloatingText('-' + Math.max(1, stacks) + ' PE', lx, target.y - 30, '#9ec5ff', 14);
            }
        }

        if (target.isBoss) {
            let rm = "", bd = "", rid = "";
            if (target.data.type === 'cerberus') { rid = 'cerberus_fang'; rm = `Obtained [${target.data.rewardName}]`; bd = "Global ATK +10%"; }
            else if (target.data.type === 'charon') { rid = 'stygian_oar'; rm = `Obtained [${target.data.rewardName}]`; bd = "Enemy Speed -15%"; }
            else if (target.data.type === 'beelzebub') { rid = 'gluttony_crown'; rm = `Obtained [${target.data.rewardName}]`; bd = "Treasure Spawn Rate Up"; }
            else if (target.data.type === 'lucifer') {
                rid = 'fallen_wings'; rm = `Obtained [${target.data.rewardName}]`; bd = "Crit Chance +10%";
                if (window.EventBus) EventBus.emit(GAME_EVENTS.FROZEN_OVERLAY, false);
                if(typeof window.towers !== 'undefined') window.towers.forEach(t => { if (t.isFrozenTomb) { t.isFrozenTomb = false; } });
            }
            else if (target.data.type === 'mini_lilith') { rm = `Echo of [${target.data.rewardName}]`; bd = "+SE Bonus"; }
            else if (target.data.type === 'lilith') { rid = 'night_queen_crown'; rm = `Obtained [${target.data.rewardName}]`; bd = "Crit DMG +40%"; }
            else if (target.data.type === 'mini_chronos') { rm = `Shard of [${target.data.rewardName}]`; bd = "Time Echo: +SE"; }
            else if (target.data.type === 'chronos') { rid = 'chronos_hourglass'; rm = `Obtained [${target.data.rewardName}]`; bd = "Attack Speed +12%"; }
            else if (target.data.type === 'medusa') {
                rid = 'gorgon_gaze';
                rm = `Obtained [${target.data.rewardName}]`; bd = "Slow Strength +6%";
                if (typeof window.towers !== 'undefined') {
                    window.towers.forEach(t => { if (t.isStunned && (t.stunEndTime || 0) > Date.now()) { t.isStunned = false; t.stunEndTime = 0; } });
                }
            }
            if (rid && typeof collectRelic === 'function') collectRelic(rid);
            const _bvName = window.tEnemy ? window.tEnemy(target.data.type, 'name', target.data.name) : target.data.name;
            if (typeof showBossVictory === 'function') showBossVictory(_bvName, rm, bd);
            if (!target.isPactBoss) window.bossInstance = null;
        }

        // Curse Pact: guarantee a relic drop on pact boss death (in addition to any boss-specific relic).
        // Pact bosses are the only reliable source of supreme_boss relics; fall back to abyssal_boss, then any pool.
        if (target.isPactBoss && typeof relicsData !== 'undefined' && typeof collectRelic === 'function') {
            const available = Object.keys(relicsData).filter(id => (window.collectedRelics?.[id] || 0) < relicsData[id].maxStack);
            if (available.length > 0) {
                const supreme = available.filter(id => relicsData[id].dropSource === 'supreme_boss');
                const abyssal = available.filter(id => relicsData[id].dropSource === 'abyssal_boss');
                const pool = supreme.length > 0 ? supreme : (abyssal.length > 0 ? abyssal : available);
                const chosen = pool[Math.floor(Math.random() * pool.length)];
                collectRelic(chosen);
            }
        }

        let reward = target.reward;
        if (killer && killer.data && killer.data.type === 'abyssal') reward = Math.floor(reward * 1.5);
        
        const equipSEFlat = (typeof getEquipBonus === 'function') ? getEquipBonus('se_gain') : 0;
        reward += equipSEFlat;
        
        // SE Rewards (Base + Relics + Shrines)
        const relicFlatBonus = (typeof getRelicBonus === 'function') ? getRelicBonus('se_gain') : 0;
        const shrineSEBonus = killer ? (killer.shrineSEBonus || 0) : 0;
        reward += (relicFlatBonus + shrineSEBonus);

        // Gargoyle Curse: SE gain penalty (stage-based)
        const gargoyleSEPenalty = (typeof getGargoyleSEPenalty === 'function') ? getGargoyleSEPenalty() : 0;
        if (gargoyleSEPenalty < 0) reward = Math.max(0, Math.floor(reward * (1.0 + gargoyleSEPenalty)));

        // Curse Pact: SE gain penalty when pact ignored past grace period
        const pactSEMult = (typeof getPactSEMult === 'function') ? getPactSEMult() : 1.0;
        if (pactSEMult < 1.0) reward = Math.max(0, Math.floor(reward * pactSEMult));

        const limit = (typeof window.maxMoney !== 'undefined') ? window.maxMoney : 1000;
        window.money = Math.min(limit, window.money + reward);

        // PE Recovery (Purity Shrine)
        if (killer && (killer.shrinePERecovery || 0) > 0) {
            if (Math.random() < killer.shrinePERecovery) {
                window.portalEnergy = Math.max(0, window.portalEnergy - (window.maxPortalEnergy * 0.01));
                if (typeof GameLogger !== 'undefined') GameLogger.success("Purity: Portal Cleansed!");
            }
        }

        // PE Demolition Penalty (Purity Shrine)
        if (window.globalPurityDemolishPenalty > 0) {
            if (Math.random() < window.globalPurityDemolishPenalty) {
                window.portalEnergy = Math.min(window.maxPortalEnergy, window.portalEnergy + (window.maxPortalEnergy * 0.01));
                if (typeof GameLogger !== 'undefined') GameLogger.warn("Corrupted Purity: Portal Polluted!");
            }
        }
        
        if (typeof saveGameData === 'function') saveGameData();

        if (typeof createSEGainEffect === 'function') {
            const lx = (target.x / 100) * LOGICAL_WIDTH;
            createSEGainEffect(lx, target.y, reward);
        }
        if (typeof window.updateSummonButtonState === 'function') window.updateSummonButtonState();
    }
}

/**
 * Helper to spawn an explosion effect on enemy death.
 */
function spawnDeathExplosion(target, color, lRadius, dmgVal, isBurn = false, extraEff = null) {
    if (typeof spawnParticles === 'function') spawnParticles((target.x/100)*LOGICAL_WIDTH, target.y, color, 8);
    
    const lRadiusSq = lRadius * lRadius;
    const tX = (target.x / 100) * LOGICAL_WIDTH;
    
    for (let i = 0; i < window.enemies.length; i++) {
        const e = window.enemies[i];
        if (e === target || e.hp <= 0) continue;
        const eX = (e.x / 100) * LOGICAL_WIDTH;
        const dx = eX - tX;
        const dy = e.y - target.y;
        
        if ((dx * dx + dy * dy) < lRadiusSq) { 
            if (dmgVal > 0 && typeof window.applyDamage === 'function') window.applyDamage(e, dmgVal, null);
            if (isBurn) { e.isBurning = true; e.burnEndTime = Date.now() + 3000; e.isHellfireBurn = true; }
            if (extraEff) extraEff(e);
        }
    }
}

/**
 * Spawns a friendly skeleton from a defeated enemy.
 */
function spawnFriendlySkeleton(target) {
    if (typeof window.friendlySkeletons !== 'undefined') {
        window.friendlySkeletons.push({ x: target.x, y: target.y, speed: 0.7 });
    }
}

/**
 * Spawns friendly ghosts (for specific unit abilities).
 */
function spawnFriendlyGhost() {
    if (typeof window.friendlyGhosts !== 'undefined') {
        const randomX = Math.random() * 20 + 40;
        const startY = LOGICAL_HEIGHT - 20;
        window.friendlyGhosts.push({ x: randomX, y: startY, speed: 0.5, maxHp: 500 });
    }
}

// Global Exports
window.handleEnemyDeath = handleEnemyDeath;
window.spawnDeathExplosion = spawnDeathExplosion;
window.spawnFriendlySkeleton = spawnFriendlySkeleton;
window.spawnFriendlyGhost = spawnFriendlyGhost;
