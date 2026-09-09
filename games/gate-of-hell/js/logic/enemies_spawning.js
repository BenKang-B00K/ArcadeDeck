/* enemies_spawning.js - Handles logic for spawning enemies, waves, and bosses */

// Unlock stage per danger level: danger d unlocks at this stage
const DANGER_UNLOCK_STAGE = { 1: 1, 2: 2, 3: 3, 4: 5, 5: 7, 6: 9, 7: 12, 8: 15, 9: 19, 10: 24 };

/**
 * Returns a spawn weight for an enemy based on its danger level and current stage.
 * - Each danger level has a peak stage (danger * 3) where it is most common.
 * - Weight falls off gradually from the peak (minimum 0.05 so they never disappear).
 * - Hard locked until the unlock stage.
 */
function getSpawnWeight(danger, stage) {
    const unlockStage = DANGER_UNLOCK_STAGE[danger] || 1;
    if (stage < unlockStage) return 0;
    const peakStage = danger * 3;
    const distance = Math.abs(stage - peakStage);
    return Math.max(0.05, 1.0 - distance * 0.04);
}

/**
 * Calculates HP and Speed multipliers based on the current stage and relics.
 * @param {boolean} isBoss - Whether to calculate for a boss unit.
 */
function getStageMultipliers(isBoss = false) {
    const pactHPMult = (typeof getPactHPMult === 'function') ? getPactHPMult() : 1.0;
    if (isBoss) {
        // Bosses scale on their own milder curve. Regular enemies scale ~14× by s30,
        // ~42× by s40 — without scaling, bosses become weaker than top regulars.
        // 1.09^(stage-1) keeps boss ~3-8× tougher than top regular at their stage.
        const bossHpMult = Math.pow(1.09, window.stage - 1) * pactHPMult;
        return { hpStageMult: bossHpMult, speedStageMult: 1.0, defenseStageBuff: 0 };
    }
    let hpRate = 1.07; let speedRate = 0.005;
    if (window.stage >= 15) { hpRate = 1.11; speedRate = 0.015; }
    else if (window.stage >= 5) { hpRate = 1.09; speedRate = 0.010; }
    let hpStageMult = Math.pow(hpRate, window.stage - 1) * pactHPMult;
    const relicHPReduction = (typeof getRelicBonus === 'function') ? getRelicBonus('enemy_hp') : 0;
    if (relicHPReduction < 0) hpStageMult *= (1.0 + relicHPReduction);
    let speedStageMult = Math.min(2.0, 1 + (window.stage - 1) * speedRate);
    const relicSpeedReduction = (typeof getRelicBonus === 'function') ? getRelicBonus('enemy_speed') : 0;
    if (relicSpeedReduction < 0) speedStageMult *= (1.0 + relicSpeedReduction);
    // Stage 5+: additional flat defense per stage. Growth slows past stage 25
    // and is capped — uncapped scaling makes tanky enemies (shadow_titan, etc.)
    // chip-only damage past stage 50.
    let defenseStageBuff = 0;
    if (window.stage >= 5) {
        const early = Math.min(window.stage - 4, 21) * 2;        // stages 5–25: +2/stage (max +42)
        const late  = Math.max(0, window.stage - 25) * 1;        // stage 26+: +1/stage
        defenseStageBuff = Math.min(80, early + late);           // hard cap +80
    }
    return { hpStageMult, speedStageMult, defenseStageBuff };
}

/**
 * Handles the spawning of a wave of enemies.
 */
function spawnWave() {
    if (window.currentStageSpawned >= window.totalStageEnemies && !window.isBossStage) return;
    if (window.isBossStage && window.bossSpawned && window.currentStageSpawned >= window.totalStageEnemies) return;
    if (window.isBossStage && !window.bossSpawned) { spawnBoss(); window.bossSpawned = true; }
    
    let min = 1, max = 3;
    if (window.stage >= 40) { min = 3; max = 5; }
    else if (window.stage >= 30) { min = 3; max = 4; }
    else if (window.stage >= 20) { min = 2; max = 4; }
    else if (window.stage >= 10) { min = 2; max = 3; }
    
    if (window.isBossStage) { min = 1; max = 3; } 
    
    let count = Math.floor(Math.random() * (max - min + 1)) + min;
    const remaining = window.totalStageEnemies - window.currentStageSpawned;
    if (!window.isBossStage && count * 2 > remaining) {
        count = Math.max(1, Math.ceil(remaining / 2));
    }
    
    // Spawn count from left + count from right (Y-path)
    const gen = window.spawnGeneration || 0;
    const canSpawn = () => {
        if ((window.spawnGeneration || 0) !== gen) return false;
        if (window.SceneManager) return SceneManager.is(SCENES.GAME);
        return window.gameStarted && !window.isPaused;
    };
    for(let i = 0; i < count; i++) {
        setTimeout(() => { if (canSpawn()) spawnEnemy('left');  }, i * 300);
        setTimeout(() => { if (canSpawn()) spawnEnemy('right'); }, i * 300 + 150);
    }
}

/**
 * Spawns a boss unit based on the current stage.
 */
function spawnBoss() {
    const data = bossData[window.stage] || { name: "Boss", type: "cerberus", hp: 3000, speed: 0.1, size: 60, icon: '' };
    if (typeof recordUnlock === 'function') recordUnlock(data.type, true);

    // ── Road & portal geometry (same as regular enemies) ───────────
    const LW = window.LOGICAL_WIDTH  || 1080;
    const LH = window.LOGICAL_HEIGHT || 1440;
    const rW = (typeof getRoadWidth === 'function') ? getRoadWidth() : 342;
    const rX = (typeof getRoadX    === 'function') ? getRoadX()    : (LW - rW) / 2;
    const MERGE_Y_PX = LH * 0.22;
    const barH       = 220;
    const barCenterY = MERGE_Y_PX * 0.1 + barH * 0.5;
    const gateMargin = 140;
    const gateLeftPct  = gateMargin / LW * 100;
    const gateRightPct = (LW - gateMargin) / LW * 100;
    const PORTAL_R = 110;
    const scatter  = (PORTAL_R * 0.28) / LW * 100;

    const spawnSide = Math.random() < 0.5 ? 'left' : 'right';
    const randomX = spawnSide === 'left'
        ? gateLeftPct  + (Math.random() - 0.5) * 2 * scatter
        : gateRightPct + (Math.random() - 0.5) * 2 * scatter;

    const roadMinPct   = rX / LW * 100;
    const roadSpanPct  = rW / LW * 100;
    const wIdx         = Math.floor(Math.random() * 10);
    const mergeTargetX = roadMinPct + (wIdx + 0.5) / 10 * roadSpanPct;
    const PW_BS        = 54;
    const voidMinPct   = (rX + PW_BS) / LW * 100;
    const voidSpanPct  = Math.max(0, rW - 2 * PW_BS) / LW * 100;
    const portalTargetX = voidMinPct + Math.random() * voidSpanPct;

    // T-shape paths: bar (horizontal traversal) + stem (vertical descent).
    const barMeetX = 50 + (Math.random() - 0.5) * 10;
    const yBand    = barH * 0.6;

    const barPath = [{ x: randomX, y: barCenterY + (Math.random() - 0.5) * yBand * 0.5 }];
    const nMid = 2 + Math.floor(Math.random() * 2);
    for (let k = 1; k <= nMid; k++) {
        const tk = k / (nMid + 1);
        const baseX = randomX + (barMeetX - randomX) * tk;
        const jitterX = (Math.random() - 0.5) * 8;
        barPath.push({ x: baseX + jitterX, y: barCenterY + (Math.random() - 0.5) * yBand });
    }
    barPath.push({ x: barMeetX, y: barCenterY + (Math.random() - 0.5) * yBand * 0.4 });

    const stemStartY = barCenterY;
    const stemEndY   = LH * 0.85;
    const xMin = roadMinPct + 2;
    const xMax = roadMinPct + roadSpanPct - 2;
    const stemPath = [{ x: barMeetX, y: stemStartY }];
    const nStem = 2 + Math.floor(Math.random() * 2);
    for (let k = 1; k <= nStem; k++) {
        const tk = k / (nStem + 1);
        stemPath.push({ x: xMin + Math.random() * (xMax - xMin), y: stemStartY + (stemEndY - stemStartY) * tk });
    }
    stemPath.push({ x: mergeTargetX, y: stemEndY });

    const { hpStageMult, speedStageMult } = getStageMultipliers(true);
    const boss = {
        initialX: randomX, x: barPath[0].x,
        spawnSide,
        mergeTargetX,
        portalTargetX,
        targetX: 50,
        y: barPath[0].y,
        barCenterY,
        barMeetX,
        barPath,
        stemPath,
        barT: 0,
        barPhaseDone: false,            // boss traverses T-bar like regulars
        materializing: true,
        materializeDuration: 1500,
        spawnTime: Date.now(),
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.02,
        invincible: true,               // cleared when y >= MERGE_Y
        bossInvincibleUntilMerge: true,
        baseSpeed: data.speed * speedStageMult, speed: data.speed * speedStageMult,
        maxHp: data.hp * hpStageMult, hp: data.hp * hpStageMult,
        reward: data.reward || 500, isBoss: true, type: data.type, icon: data.icon, data: data,
        lastAbilityTime: Date.now()
    };

    window.enemies.push(boss); window.bossInstance = boss;
    
    if (data.type === 'charon') { for(let i=0; i<5; i++) spawnPassenger(boss); }
    if (data.type === 'lucifer') {
        if (window.EventBus) EventBus.emit(GAME_EVENTS.FROZEN_OVERLAY, true);
        setTimeout(() => {
            if (boss.hp > 0 && typeof window.towers !== 'undefined') {
                const active = window.towers.filter(t => !t.isFrozenTomb);
                if (active.length > 0) { 
                    const target = active[Math.floor(Math.random()*active.length)];
                    target.isFrozenTomb = true; 
                }
            }
        }, 3000);
    }
}

/**
 * Creates and pushes an enemy object from the selected enemy data.
 */
function _createEnemyObject(selected, spawnSide = 'center') {
    const { hpStageMult, speedStageMult, defenseStageBuff } = getStageMultipliers();
    // ── Road & portal geometry ─────────────────────────────────────
    const LW        = window.LOGICAL_WIDTH  || 1080;
    const LH        = window.LOGICAL_HEIGHT || 1440;
    const rW        = (typeof getRoadWidth === 'function') ? getRoadWidth() : 342;
    const rX        = (typeof getRoadX    === 'function') ? getRoadX()    : (LW - rW) / 2;
    const ARM_TOP_W = rW / 2;                          // = 171
    const PORTAL_R  = 110;                             // matches world_gate.js
    const MERGE_Y_PX = LH * 0.22;
    // T-shape: enemies spawn at gate (left/right end of horizontal bar).
    const barH        = 220;
    const barCenterY  = MERGE_Y_PX * 0.1 + barH * 0.5;
    const gateMargin  = 140;
    const gateLeftPct  = gateMargin / LW * 100;
    const gateRightPct = (LW - gateMargin) / LW * 100;
    const scatter   = (PORTAL_R * 0.28) / LW * 100;   // ±scatter in % coords

    let randomX;
    if (spawnSide === 'left')       randomX = gateLeftPct  + (Math.random()-0.5)*2*scatter;
    else if (spawnSide === 'right') randomX = gateRightPct + (Math.random()-0.5)*2*scatter;
    else                            randomX = Math.random() * 14 + 43;  // 43~57% (center fallback)
    const roadMinPct  = rX / LW * 100;
    const roadSpanPct = rW / LW * 100;

    // 10 evenly-spaced waypoints across road width at Y-junction
    const wIdx        = Math.floor(Math.random() * 10);
    const mergeTargetX = roadMinPct + (wIdx + 0.5) / 10 * roadSpanPct;

    // Portal void target: random within inner pillar gap (~39–61%)
    const PW_BS       = 54; // portal pillar width in logical px (PW=9 × BS=6)
    const voidMinPct  = (rX + PW_BS) / LW * 100;
    const voidSpanPct = Math.max(0, rW - 2 * PW_BS) / LW * 100;
    const portalTargetX = voidMinPct + Math.random() * voidSpanPct;
    // ──────────────────────────────────────────────────────────────

    // Treasure (gold) does not use exponential HP scaling — it's a speed/DPS
    // check, not an HP wall. Combined with high base defense, scaled HP made it
    // effectively unkillable past mid-stage.
    const isTreasure = selected.type === 'gold';
    const hpMult       = isTreasure ? 1 : hpStageMult;
    const defenseFinal = isTreasure
        ? Math.min(300, 50 + window.stage * 3)
        : ((selected.defense || 0) + defenseStageBuff);

    // Per-enemy meet point near bar center, then multi-waypoint splined
    // paths along bar and stem so enemies take non-linear divergent routes.
    const isSide   = spawnSide === 'left' || spawnSide === 'right';
    const barMeetX = 50 + (Math.random() - 0.5) * 10;
    const yBand    = barH * 0.6;

    const barPath = [];
    if (isSide) {
        barPath.push({ x: randomX, y: barCenterY + (Math.random() - 0.5) * yBand * 0.5 });
        const nMid = 2 + Math.floor(Math.random() * 2); // 2-3 mids
        for (let k = 1; k <= nMid; k++) {
            const tk = k / (nMid + 1);
            const baseX = randomX + (barMeetX - randomX) * tk;
            const jitterX = (Math.random() - 0.5) * 8;
            barPath.push({
                x: baseX + jitterX,
                y: barCenterY + (Math.random() - 0.5) * yBand
            });
        }
        barPath.push({ x: barMeetX, y: barCenterY + (Math.random() - 0.5) * yBand * 0.4 });
    }

    const stemPath = [];
    if (isSide) {
        const stemStartY = barCenterY;
        const stemEndY   = LH * 0.85;
        const xMin = roadMinPct + 2;
        const xMax = roadMinPct + roadSpanPct - 2;
        stemPath.push({ x: barMeetX, y: stemStartY });
        const nStem = 2 + Math.floor(Math.random() * 2); // 2-3 mids
        for (let k = 1; k <= nStem; k++) {
            const tk = k / (nStem + 1);
            stemPath.push({
                x: xMin + Math.random() * (xMax - xMin),
                y: stemStartY + (stemEndY - stemStartY) * tk
            });
        }
        stemPath.push({ x: mergeTargetX, y: stemEndY });
    }

    const startX = isSide ? barPath[0].x : randomX;
    const startY = isSide ? barPath[0].y : -20;

    const enemy = {
        initialX: randomX,
        x: startX,
        targetX: 50,        // legacy (center/boss path)
        mergeTargetX,       // chosen waypoint at Y-junction
        portalTargetX,      // final target inside portal void
        y: startY,
        barCenterY,
        barMeetX,
        barPath,
        stemPath,
        barT: 0,
        barPhaseDone: !isSide,  // center spawns skip horizontal phase
        materializing: isSide,
        materializeDuration: 1500,
        spawnTime: Date.now(),   // for materialize fade-in effect
        spawnSide,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.03,
        baseSpeed: selected.speed * speedStageMult,
        speed: selected.speed * speedStageMult,
        maxHp: selected.hp * hpMult,
        defense: defenseFinal,
        hp: selected.hp * hpMult,
        reward: selected.reward || 10,
        type: selected.type,
        icon: selected.icon,
        desc: selected.desc,
        data: {
            name: selected.name || selected.type,
            lore: selected.lore || (window.t ? window.t('ui.info_panel.enemy_lore_unknown', '이 영혼에 대한 기록이 없습니다.') : '이 영혼에 대한 기록이 없습니다.')
        }
    };
    if (selected.type === 'boar') enemy.vxSign = Math.random() < 0.5 ? -1 : 1;
    window.enemies.push(enemy);
}

/**
 * Spawns a regular enemy unit.
 * - Stage 1: Only basic specters (normal/shade).
 * - Stage 2+: Danger-weighted selection across all categories.
 *   Treasure spawns independently via its own probability check.
 */
function spawnEnemy(spawnSide = 'center') {
    window.currentStageSpawned++;

    const relicTreasure = (typeof getRelicBonus === 'function') ? getRelicBonus('treasure_chance') : 0;
    const equipTreasure = (typeof getEquipBonus === 'function') ? getEquipBonus('treasure_chance') : 0;
    const finalTC = window.treasureChance + relicTreasure + equipTreasure;

    // Stage 1-2: Specter-only onboarding. S1 = d1-d2 basics, S2 = all specters
    // currently unlocked by DANGER_UNLOCK_STAGE. Prevents jarring all-category
    // dump at stage 2 (15+ types appearing simultaneously).
    if (window.stage <= 2) {
        const dangerCap = window.stage === 1 ? 2 : 3;
        const types = enemyCategories.specter.filter(e => (e.danger || 1) <= dangerCap);
        const totalW = types.reduce((s, e) => s + (e.weight || 0.1), 0);
        let rand = Math.random() * totalW;
        let selected = types[0];
        for (const et of types) { rand -= (et.weight || 0.1); if (rand <= 0) { selected = et; break; } }
        if (typeof recordUnlock === 'function') recordUnlock(selected.type, true);
        if (typeof GameLogger !== 'undefined') GameLogger.debug(`Spawned: ${selected.name}`);
        _createEnemyObject(selected, spawnSide);
        return;
    }

    // Stage 2+: Treasure check (independent probability)
    if (Math.random() < finalTC) {
        const treasure = enemyCategories.treasure[0];
        if (typeof recordUnlock === 'function') recordUnlock(treasure.type, true);
        if (typeof GameLogger !== 'undefined') GameLogger.debug(`Treasure Spawned!`);
        _createEnemyObject(treasure, spawnSide);
        return;
    }

    // Stage 2+: Use cached non-treasure enemy pool
    if (!window._cachedAllEnemies) {
        window._cachedAllEnemies = [
            ...enemyCategories.specter,
            ...enemyCategories.wraith,
            ...enemyCategories.spirit,
            ...enemyCategories.demon
        ].filter(e => e.danger !== undefined);
    }

    let totalW = 0;
    const weighted = [];
    for (let i = 0; i < window._cachedAllEnemies.length; i++) {
        const e = window._cachedAllEnemies[i];
        // Combine danger-based curve with per-enemy rarity. Rare specials
        // (greedy/lightspeed at w=0.025) were spawning at common rate, flooding SE.
        const baseRarity = (typeof e.weight === 'number' && e.weight > 0) ? e.weight : 0.1;
        const w = getSpawnWeight(e.danger, window.stage) * baseRarity;
        if (w > 0) {
            weighted.push({ e, w });
            totalW += w;
        }
    }

    let rand = Math.random() * totalW;
    let selected = weighted[0].e;
    for (const item of weighted) { rand -= item.w; if (rand <= 0) { selected = item.e; break; } }

    if (typeof recordUnlock === 'function') recordUnlock(selected.type, true);
    if (typeof GameLogger !== 'undefined') GameLogger.debug(`[위험도 ${selected.danger}] ${selected.name} (Stage ${window.stage})`);
    _createEnemyObject(selected, spawnSide);
}

/**
 * Spawns passengers for boss (e.g. Charon).
 */
function spawnPassenger(boss) {
    const { hpStageMult, speedStageMult } = getStageMultipliers();
    const enemy = { 
        initialX: boss.x, x: boss.x, targetX: 50, y: boss.y, 
        baseSpeed: 0.5 * speedStageMult, speed: 0.5 * speedStageMult, 
        maxHp: 100 * hpStageMult, hp: 100 * hpStageMult, 
        type: 'normal', icon: '', isBoarded: true, parentBoss: boss,
        offsetX: (Math.random() - 0.5) * 30, offsetY: (Math.random() - 0.5) * 40, 
        reward: 5, invincible: true 
    };
    window.enemies.push(enemy);
}

// Global Exports
window.getSpawnWeight = getSpawnWeight;
window.getStageMultipliers = getStageMultipliers;
window.spawnWave = spawnWave;
window.spawnBoss = spawnBoss;
window.spawnEnemy = spawnEnemy;
window.spawnPassenger = spawnPassenger;
