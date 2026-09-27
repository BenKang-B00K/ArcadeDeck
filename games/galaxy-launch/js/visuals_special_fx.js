// ==========================================
// VISUALS: SPECIAL FX (Boss & Events)
// ==========================================

function createBossEMP() {
    if (typeof PIXI === 'undefined' || typeof effectsLayer === 'undefined') return;
    const ring = new PIXI.Graphics();
    const centerX = pixiApp.screen.width / 2;
    const centerY = pixiApp.screen.height / 2;
    
    ring.lineStyle(10, 0x00f2fe, 0.8);
    ring.drawCircle(0, 0, 50);
    ring.x = centerX;
    ring.y = centerY;
    effectsLayer.addChild(ring);

    const startTime = Date.now();
    const duration = 1000;
    const tickerFn = () => {
        const p = (Date.now() - startTime) / duration;
        if (p >= 1) { pixiApp.ticker.remove(tickerFn); ring.destroy(); return; }
        ring.scale.set(1 + p * 15);
        ring.alpha = 1 - p;
        ring.lineStyle(10 * (1-p), 0x00f2fe, 0.8 * (1-p));
    };
    pixiApp.ticker.add(tickerFn);
}

let activeBossShieldGraphic = null;
function createBossShield(duration) {
    if (typeof PIXI === 'undefined' || typeof effectsLayer === 'undefined') return;
    if (activeBossShieldGraphic) activeBossShieldGraphic.destroy();
    
    const shield = new PIXI.Graphics();
    const centerX = pixiApp.screen.width / 2;
    const centerY = pixiApp.screen.height / 2;
    
    shield.lineStyle(4, 0x00f2fe, 0.6);
    shield.beginFill(0x00f2fe, 0.1);
    
    const points = [];
    for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 / 6) * i;
        points.push(Math.cos(a) * 160, Math.sin(a) * 160);
    }
    shield.drawPolygon(points);
    shield.endFill();
    
    shield.x = centerX;
    shield.y = centerY;
    effectsLayer.addChild(shield);
    activeBossShieldGraphic = shield;

    const startTime = Date.now();
    const tickerFn = () => {
        const p = (Date.now() - startTime) / duration;
        if (p >= 1 || (typeof bossShieldActive !== 'undefined' && !bossShieldActive)) { 
            pixiApp.ticker.remove(tickerFn); 
            shield.destroy(); 
            activeBossShieldGraphic = null;
            return; 
        }
        shield.alpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
        shield.scale.set(1 + Math.sin(Date.now() * 0.005) * 0.02);
    };
    pixiApp.ticker.add(tickerFn);
}

function createSupernovaVFX(duration) {
    if (typeof PIXI === 'undefined' || typeof uiLayer === 'undefined') return;
    const flash = new PIXI.Graphics();
    flash.beginFill(0xffffff);
    flash.drawRect(0, 0, pixiApp.screen.width, pixiApp.screen.height);
    flash.endFill();
    flash.alpha = 0.8;
    uiLayer.addChild(flash);

    const startTime = Date.now();
    const tickerFn = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed > 500) {
            flash.alpha -= 0.05;
            if (flash.alpha <= 0) {
                pixiApp.ticker.remove(tickerFn);
                flash.destroy();
            }
        }
    };
    pixiApp.ticker.add(tickerFn);
}

function createFrenzyVFX(duration) {
    if (typeof PIXI === 'undefined' || typeof uiLayer === 'undefined') return;
    const tint = new PIXI.Graphics();
    tint.beginFill(0xff00ff, 0.1);
    tint.drawRect(0, 0, pixiApp.screen.width, pixiApp.screen.height);
    tint.endFill();
    uiLayer.addChildAt(tint, 0);

    const tickerFn = () => {
        if (typeof activeEvents === 'undefined' || !activeEvents.click_frenzy || Date.now() > activeEvents.click_frenzy.endTime) {
            pixiApp.ticker.remove(tickerFn);
            tint.destroy();
            return;
        }
        tint.alpha = 0.05 + Math.sin(Date.now() * 0.01) * 0.05;
    };
    pixiApp.ticker.add(tickerFn);
}

function createOverclockVFX(duration) {
    if (typeof PIXI === 'undefined' || typeof uiLayer === 'undefined') return;
    const lines = new PIXI.Container();
    uiLayer.addChildAt(lines, 0);

    for (let i = 0; i < 15; i++) {
        const line = new PIXI.Graphics();
        line.beginFill(0x00f2fe, 0.2);
        line.drawRect(0, 0, 2, 300);
        line.endFill();
        line.x = Math.random() * pixiApp.screen.width;
        line.y = Math.random() * pixiApp.screen.height;
        lines.addChild(line);
    }

    const tickerFn = () => {
        if (typeof activeEvents === 'undefined' || !activeEvents.overclock || Date.now() > activeEvents.overclock.endTime) {
            pixiApp.ticker.remove(tickerFn);
            lines.destroy();
            return;
        }
        lines.children.forEach(l => {
            l.y += 20;
            if (l.y > pixiApp.screen.height) l.y = -300;
        });
    };
    pixiApp.ticker.add(tickerFn);
}

function createVoidVFX(duration) {
    if (typeof PIXI === 'undefined' || typeof PIXI.filters === 'undefined') return;
    const filter = new PIXI.filters.ColorMatrixFilter();
    if (typeof updateStageFilters === 'function') updateStageFilters(filter);
    
    const tickerFn = () => {
        if (typeof activeEvents === 'undefined' || !activeEvents.void_infusion || Date.now() > activeEvents.void_infusion.endTime) {
            pixiApp.ticker.remove(tickerFn);
            if (typeof updateStageFilters === 'function') updateStageFilters(null, filter);
            return;
        }
        filter.night(0.1 + Math.abs(Math.sin(Date.now() * 0.002)) * 0.2);
    };
    pixiApp.ticker.add(tickerFn);
}

function createDimensionalSkipVFX() {
    if (typeof PIXI === 'undefined' || typeof uiLayer === 'undefined') return;
    const line = new PIXI.Graphics();
    line.beginFill(0xffffff);
    line.drawRect(0, 0, 2, pixiApp.screen.height);
    line.endFill();
    line.x = pixiApp.screen.width / 2;
    uiLayer.addChild(line);

    const startTime = Date.now();
    const tickerFn = () => {
        const p = (Date.now() - startTime) / 600;
        if (p >= 1) {
            pixiApp.ticker.remove(tickerFn);
            line.destroy();
            return;
        }
        line.scale.x = p * 500;
        line.alpha = 1 - p;
        line.x = (pixiApp.screen.width / 2) - (line.width / 2);
    };
    pixiApp.ticker.add(tickerFn);
}

function triggerCritVisuals() {
    if (typeof PIXI === 'undefined' || typeof planetLayer === 'undefined') return;
    const duration = 300;
    const startTime = Date.now();
    const originalX = pixiApp.screen.width / 2;
    const originalY = pixiApp.screen.height / 2;

    const tickerFn = () => {
        const elapsed = Date.now() - startTime;
        let progress = elapsed / duration;
        if (progress >= 1) {
            planetLayer.x = originalX; planetLayer.y = originalY; planetLayer.rotation = 0;
            pixiApp.ticker.remove(tickerFn);
            return;
        }
        planetLayer.x = originalX + (Math.random() * 20 - 10) * (1 - progress);
        planetLayer.y = originalY + (Math.random() * 20 - 10) * (1 - progress);
        planetLayer.rotation = (Math.random() * 0.1 - 0.05) * (1 - progress);
    };
    pixiApp.ticker.add(tickerFn);
}

function createControlPulseVFX(id) {
    if (typeof PIXI === 'undefined' || typeof uiLayer === 'undefined') return;
    const btn = document.getElementById(id);
    if (!btn) return;
    
    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const ring = new PIXI.Graphics();
    const color = btn.classList.contains('active') ? 0xff4757 : 0x00f2fe;
    
    ring.lineStyle(2, color, 0.8);
    ring.drawCircle(0, 0, 20);
    ring.x = centerX;
    ring.y = centerY;
    uiLayer.addChild(ring);

    const startTime = Date.now();
    const tickerFn = () => {
        const p = (Date.now() - startTime) / 600;
        if (p >= 1) {
            pixiApp.ticker.remove(tickerFn);
            ring.destroy();
            return;
        }
        ring.scale.set(1 + p * 3);
        ring.alpha = 1 - p;
    };
    pixiApp.ticker.add(tickerFn);
}

// Helper to safely add/remove stage filters
function updateStageFilters(addFilter = null, removeFilter = null) {
    if (!pixiApp || !pixiApp.stage) return;
    
    let currentFilters = pixiApp.stage.filters || [];
    currentFilters = currentFilters.filter(f => f);

    if (removeFilter) {
        currentFilters = currentFilters.filter(f => f !== removeFilter);
    }
    
    if (addFilter && !currentFilters.includes(addFilter)) {
        currentFilters.push(addFilter);
    }
    
    pixiApp.stage.filters = currentFilters.length > 0 ? currentFilters : null;
}
