/* enemies_ui.js - Enemy UI, Rendering and Visual Effects Management */

/**
 * Renders all enemies, including shadows, status glows, icons, and HP bars.
 */
function drawEnemies() {
    if (!enemies) return;
    if (typeof gcPixiEnemySprites === 'function') gcPixiEnemySprites();
    if (typeof renderPixiEnemy !== 'function' || typeof isPixiEnemyType !== 'function') return;

    enemies.forEach(e => {
        if (e.hp <= 0) return;
        if (!isPixiEnemyType(e.type)) return; // pure Pixi only — no ctx2d fallback

        const lx     = (e.x / 100) * LOGICAL_WIDTH;
        const ly     = e.y;
        const isBoss = e.isBoss;
        // Stronger float lift sells the airborne look; shadow modulates with lift.
        const floatAmp = isBoss ? 10 : 6;
        const floatY = ly + Math.sin(globalAnimTimer * 1.5 + (lx * 0.1)) * floatAmp - (isBoss ? 4 : 2);

        const spawnMs   = Date.now() - (e.spawnTime || 0);
        const matDur    = e.materializeDuration || 600;
        const spawnFade = Math.min(1.0, spawnMs / matDur);
        const mScaleNow = (spawnMs < matDur) ? (0.12 + 0.88 * spawnFade) : 1;

        renderPixiEnemy(e, lx, floatY, spawnFade, mScaleNow, ly, isBoss);
    });
}

/**
 * Shows a warning modal when a boss is about to appear.
 * @param {string} bossName 
 */
function showBossWarning(bossName) {
    const container = document.getElementById('top-panel') || document.getElementById('game-container') || document.body;
    const existing = document.getElementById('boss-warn-toast');
    if (existing) { clearTimeout(window._bossWarnTimer); existing.remove(); }

    const toast = document.createElement('div');
    toast.id = 'boss-warn-toast';
    toast.className = 'encounter-toast boss-warn-toast';
    const _T = window.t || ((k, f) => f);
    toast.innerHTML = `
        <div class="encounter-toast-header">${_T('ui.enemy.boss_warning_header', '심연의 징조')}</div>
        <div class="encounter-toast-cat">${_T('ui.enemy.boss_warning_cat', '마신 강림')}</div>
        <div class="encounter-toast-body">
            <div class="encounter-toast-info">
                <div class="encounter-toast-lore">${_T('ui.enemy.boss_warning_lore', '강력한 심연의 지배자가 강림합니다. 모든 퇴마사의 힘을 집중하십시오!')}</div>
            </div>
        </div>`;
    container.appendChild(toast);
    window._bossWarnTimer = setTimeout(() => {
        toast.classList.add('encounter-toast-out');
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
    }, 6000);
    toast.addEventListener('click', () => {
        clearTimeout(window._bossWarnTimer);
        toast.classList.add('encounter-toast-out');
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
    });
}

/**
 * Displays the boss defeat notification (non-blocking toast).
 */
function showBossVictory(bossName, rewardMsg, bonusDetail) {
    const container = document.getElementById('top-panel') || document.getElementById('game-container') || document.body;
    const existing = document.getElementById('boss-victory-toast');
    if (existing) { clearTimeout(window._bossVictoryTimer); existing.remove(); }

    const toast = document.createElement('div');
    toast.id = 'boss-victory-toast';
    toast.className = 'encounter-toast left-toast boss-victory-toast';
    const _T2 = window.t || ((k, f) => f);
    toast.innerHTML = `
        <div class="encounter-toast-header">${_T2('ui.enemy.boss_victory_header', '심연의 존재 추방')}</div>
        <div class="encounter-toast-cat">${_T2('ui.enemy.boss_victory_cat', '마왕 소멸')}</div>
        <div class="encounter-toast-body">
            <div class="encounter-toast-info">
                <div class="encounter-toast-stats">
                    <span class="et-stat et-eff">${rewardMsg}</span>
                </div>
                <div class="encounter-toast-lore">${bonusDetail}</div>
            </div>
        </div>`;
    container.appendChild(toast);
    window._bossVictoryTimer = setTimeout(() => {
        toast.classList.add('encounter-toast-out');
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
    }, 7000);
    toast.addEventListener('click', () => {
        clearTimeout(window._bossVictoryTimer);
        toast.classList.add('encounter-toast-out');
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
    });
}

/**
 * Visual effect (light pillars) for stage transition.
 */
function triggerStageTransition() {
    if (typeof spawnLightPillar !== 'function') return;
    const count = 2 + Math.floor(Math.random() * 2); // 2-3 pillars near spawning pools
    const MERGE_Y = (LOGICAL_HEIGHT || 1440) * 0.22;
    const ARM_TOP_W = ((typeof getRoadWidth === 'function') ? getRoadWidth() : 342) / 2;
    const LW = LOGICAL_WIDTH || 1080;
    // Pool positions: top-left and top-right corners
    const poolPositions = [
        { x: ARM_TOP_W * 0.5,       y: MERGE_Y * 0.35 },
        { x: LW - ARM_TOP_W * 0.5,  y: MERGE_Y * 0.35 }
    ];
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const pool = poolPositions[i % 2];
            const rx = pool.x + (Math.random() - 0.5) * ARM_TOP_W * 0.6;
            const ry = pool.y + (Math.random() - 0.5) * MERGE_Y * 0.3;
            spawnLightPillar(rx, ry);
        }, i * 300);
    }
}

/**
 * Floating text for soul essence gain.
 */
function createSEGainEffect(lx, ly, amount) {
    if (typeof spawnFloatingText === 'function') {
        spawnFloatingText(`+${amount} SE`, lx, ly, '#ffd700', 18);
    }
}

/**
 * Shows a compact non-blocking encounter toast when a new enemy is first met.
 * Slides in from the right edge of #top-panel; auto-dismisses after 5 s.
 */
function showEncounterToast(enemyData, catTitle, dispName) {
    const container = document.getElementById('top-panel') || document.getElementById('game-container') || document.body;

    const existing = document.getElementById('encounter-toast');
    if (existing) { clearTimeout(window._encounterToastTimer); existing.remove(); }

    const toast = document.createElement('div');
    toast.id = 'encounter-toast';
    toast.className = 'encounter-toast enc-toast-v2';

    const hp  = Math.floor(enemyData.hp || 0);
    const def = enemyData.defense || 0;
    const spd = Math.round(enemyData.speed || 0);
    const name = dispName || enemyData.name || enemyData.type || '???';

    // Header strip
    const header = document.createElement('div');
    header.className = 'encounter-toast-header';
    header.innerHTML = `${window.SvgIcons ? window.SvgIcons.get('chain') : ''} ${(window.t ? window.t('ui.enemy.encounter_header', '새 조우 기록') : '새 조우 기록')}`;
    toast.appendChild(header);

    // Category subtitle
    const cat = document.createElement('div');
    cat.className = 'encounter-toast-cat';
    cat.textContent = catTitle;
    toast.appendChild(cat);

    // Render stage (centered, with halo + animated ring)
    const stage = document.createElement('div');
    stage.className = 'enc-render-stage';
    stage.innerHTML = `
        <div class="enc-halo"></div>
        <div class="enc-ring"></div>
        <div class="enc-sparkles"><span></span><span></span><span></span><span></span></div>
    `;
    const artDiv = document.createElement('div');
    artDiv.className = 'enc-render-art';
    if (typeof createPixelCanvas === 'function') {
        try { artDiv.appendChild(createPixelCanvas(enemyData.type, 'enemy', 128)); }
        catch(e) { artDiv.innerHTML = enemyData.icon || (window.SvgIcons ? window.SvgIcons.get('enemy_placeholder') : ''); }
    } else {
        artDiv.innerHTML = enemyData.icon || (window.SvgIcons ? window.SvgIcons.get('enemy_placeholder') : '');
    }
    stage.appendChild(artDiv);
    toast.appendChild(stage);

    // Name plate
    const namePlate = document.createElement('div');
    namePlate.className = 'enc-name-plate';
    namePlate.textContent = name;
    toast.appendChild(namePlate);

    // Stats row
    const stats = document.createElement('div');
    stats.className = 'enc-stats-row';
    stats.innerHTML =
        `<span class="et-stat et-hp"  title="HP"><i>${window.SvgIcons ? window.SvgIcons.get('heart') : ''}</i>${hp}</span>` +
        `<span class="et-stat et-def" title="Defense"><i>${window.SvgIcons ? window.SvgIcons.get('shield') : ''}</i>${def}</span>` +
        `<span class="et-stat et-spd" title="Speed"><i>${window.SvgIcons ? window.SvgIcons.get('arrow_right') : ''}</i>${spd}</span>`;
    toast.appendChild(stats);

    container.appendChild(toast);

    window._encounterToastTimer = setTimeout(() => {
        toast.classList.add('encounter-toast-out');
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
    }, 5000);

    toast.addEventListener('click', () => {
        clearTimeout(window._encounterToastTimer);
        toast.classList.add('encounter-toast-out');
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
    });
}

// Window Exports
window.drawEnemies = drawEnemies;
window.showBossWarning = showBossWarning;
window.showBossVictory = showBossVictory;
window.triggerStageTransition = triggerStageTransition;
window.createSEGainEffect = createSEGainEffect;
window.showEncounterToast = showEncounterToast;
