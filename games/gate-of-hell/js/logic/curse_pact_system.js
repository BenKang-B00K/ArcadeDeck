/* curse_pact_system.js - Curse Pact: on-demand boss summon for relic farming */

window.cursePact = {
    unlockStage: 5,
    cooldownStages: 5,        // stages required between summons
    overflowGraceStages: 2,   // stages past ready before penalty stacks accrue
    stagesSinceSummon: 0,     // counts up each stage; resets on summon
    penaltyStacks: 0,         // accrued when ignored past ready+grace
    penaltyPerStack: { hpMult: 0.10, seMult: 0.10 }, // +10% enemy HP, -10% SE per stack
    lastSummonStage: -Infinity,
    summonsCount: 0
};

function isPactUnlocked() {
    return (window.stage || 1) >= window.cursePact.unlockStage;
}

function isPactReady() {
    if (!isPactUnlocked()) return false;
    return window.cursePact.stagesSinceSummon >= window.cursePact.cooldownStages;
}

function getPactProgress() {
    const cp = window.cursePact;
    if (!isPactUnlocked()) return 0;
    return Math.min(1, cp.stagesSinceSummon / cp.cooldownStages);
}

function getPactHPMult() {
    return 1.0 + (window.cursePact.penaltyStacks * window.cursePact.penaltyPerStack.hpMult);
}

function getPactSEMult() {
    return Math.max(0.1, 1.0 - (window.cursePact.penaltyStacks * window.cursePact.penaltyPerStack.seMult));
}

function onPactStageChanged() {
    const cp = window.cursePact;
    if (!isPactUnlocked()) { updatePactCardUI(); return; }
    cp.stagesSinceSummon++;
    // Overflow: once past ready + grace, accrue penalty per extra stage
    const overflow = cp.stagesSinceSummon - (cp.cooldownStages + cp.overflowGraceStages);
    if (overflow > 0) {
        cp.penaltyStacks++;
        if (typeof GameLogger !== 'undefined') {
            GameLogger.warn(`Curse Pact ignored: enemy HP +${Math.round(getPactHPMult()*100-100)}%, SE −${Math.round((1-getPactSEMult())*100)}%`);
        }
    }
    updatePactCardUI();
}

function summonPactBoss() {
    if (!isPactReady()) {
        if (typeof flashResourceError === 'function') flashResourceError('pact');
        if (typeof GameLogger !== 'undefined') GameLogger.warn(`Pact not ready (${window.cursePact.stagesSinceSummon}/${window.cursePact.cooldownStages})`);
        return false;
    }
    if (typeof window.bossData === 'undefined' || !window.enemies) return false;

    // Pick boss from existing bossData, prefer stages near current
    const keys = Object.keys(window.bossData).map(Number).sort((a,b) => a-b);
    if (keys.length === 0) return false;
    const cur = window.stage || 1;
    // Prefer highest unlocked boss <= current stage; else first available
    const eligible = keys.filter(k => k <= cur);
    const pickFrom = eligible.length > 0 ? eligible : keys.slice(0, 1);
    const key = pickFrom[Math.floor(Math.random() * pickFrom.length)];
    const data = window.bossData[key];
    if (!data) return false;

    _spawnPactBossInstance(data);
    window.cursePact.stagesSinceSummon = 0;
    window.cursePact.penaltyStacks = 0;
    window.cursePact.lastSummonStage = cur;
    window.cursePact.summonsCount++;

    if (typeof GameLogger !== 'undefined') GameLogger.success(`Curse Pact: ${data.name} summoned!`);
    updatePactCardUI();
    if (typeof saveGameData === 'function') saveGameData();
    return true;
}

/**
 * Internal: spawn a boss instance from given data (mirrors spawnBoss in enemies_spawning.js).
 */
function _spawnPactBossInstance(data) {
    if (typeof recordUnlock === 'function') recordUnlock(data.type, true);

    // Road & portal geometry (mirror spawnBoss in enemies_spawning.js)
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

    const { hpStageMult, speedStageMult } = (typeof getStageMultipliers === 'function')
        ? getStageMultipliers(true) : { hpStageMult: 1, speedStageMult: 1 };

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
        barPhaseDone: false,
        materializing: true,
        materializeDuration: 1500,
        spawnTime: Date.now(),
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.02,
        invincible: true,
        bossInvincibleUntilMerge: true,
        baseSpeed: data.speed * speedStageMult, speed: data.speed * speedStageMult,
        maxHp: data.hp * hpStageMult, hp: data.hp * hpStageMult,
        reward: data.reward || 500,
        isBoss: true,
        isPactBoss: true,
        type: data.type, icon: data.icon, data: data,
        lastAbilityTime: Date.now()
    };
    window.enemies.push(boss);
    // Note: do NOT overwrite window.bossInstance — pact bosses are extras alongside stage bosses
}

function updatePactCardUI() {
    const card = document.getElementById('pact-card');
    if (!card) return;
    const gauge = card.querySelector('.pact-gauge');
    const stageLabel = document.getElementById('pact-stage-label');
    const penaltyBadge = document.getElementById('pact-penalty-badge');
    const iconHost = document.getElementById('pact-icon-svg');

    if (iconHost && !iconHost.innerHTML && window.SvgIcons) {
        iconHost.innerHTML = window.SvgIcons.get('skull') || '';
    }

    const cp = window.cursePact;
    const unlocked = isPactUnlocked();
    const ready = isPactReady();
    const overflow = cp.penaltyStacks > 0;

    card.classList.toggle('locked', !unlocked);
    card.classList.toggle('ready', unlocked && ready);
    card.classList.toggle('overflow', unlocked && overflow);

    if (gauge) {
        const p = getPactProgress();
        gauge.style.transform = `scaleY(${p})`;
    }
    if (stageLabel) {
        if (!unlocked) {
            stageLabel.textContent = `S${cp.unlockStage}`;
        } else if (ready) {
            stageLabel.textContent = 'GO';
        } else {
            stageLabel.textContent = `${cp.stagesSinceSummon}/${cp.cooldownStages}`;
        }
    }
    if (penaltyBadge) {
        penaltyBadge.style.display = overflow ? 'block' : 'none';
        penaltyBadge.textContent = overflow ? `×${cp.penaltyStacks}` : '!';
    }
}

function resetCursePact() {
    window.cursePact.stagesSinceSummon = 0;
    window.cursePact.penaltyStacks = 0;
    window.cursePact.lastSummonStage = -Infinity;
    window.cursePact.summonsCount = 0;
    updatePactCardUI();
}

// Hook stage advancement
if (window.EventBus && typeof GAME_EVENTS !== 'undefined') {
    EventBus.on(GAME_EVENTS.STAGE_CHANGED, onPactStageChanged);
}

// Window exports
window.isPactUnlocked   = isPactUnlocked;
window.isPactReady      = isPactReady;
window.getPactProgress  = getPactProgress;
window.getPactHPMult    = getPactHPMult;
window.getPactSEMult    = getPactSEMult;
window.summonPactBoss   = summonPactBoss;
window.updatePactCardUI = updatePactCardUI;
window.resetCursePact   = resetCursePact;
