// ==========================================
// EVENTS: UFO SYSTEM
// ==========================================

window.ufoCycleTimer = null;

function startUFOCycle() {
    if (window.ufoCycleTimer) clearTimeout(window.ufoCycleTimer);
    let time = Math.random() * 30000 + 20000;
    time /= getArtifactBonus('ufo_rate').mult;

    window.ufoCycleTimer = setTimeout(() => { 
        spawnUFO(); 
        startUFOCycle(); 
    }, time);
}

function createUFOByType(type) {
    if (typeof PIXI === 'undefined') return new PIXI.Container();
    
    const container = new PIXI.Container();
    const glow = new PIXI.Graphics();
    const body = new PIXI.Graphics();
    const ring = new PIXI.Graphics();
    container.addChild(glow);
    container.addChild(ring);
    container.addChild(body);

    ring.lineStyle(1, 0x00f2fe, 0.3);
    ring.drawEllipse(0, 0, 65, 20);
    container.ring = ring;

    if (type === "GOLDEN") {
        glow.beginFill(0xf1c40f, 0.4); glow.drawCircle(0, 0, 50); glow.endFill();
        body.lineStyle(2, 0xffffff, 0.9); body.beginFill(0xf1c40f);
        body.drawEllipse(0, 0, 45, 12); body.endFill();
        body.beginFill(0xffffff, 0.5); body.drawCircle(0, -5, 15); body.endFill();
        ring.lineStyle(2, 0xf1c40f, 0.6);
    } else if (type === "RELIC_HUNTER") {
        glow.beginFill(0xffffff, 0.5); glow.drawCircle(0, 0, 60); glow.endFill();
        body.lineStyle(2, 0x00f2fe, 0.8); body.beginFill(0xffffff);
        body.drawPolygon([0, -25, 25, 0, 0, 25, -25, 0]); body.endFill();
        const shards = new PIXI.Graphics();
        shards.lineStyle(1, 0xffffff, 0.8);
        for(let i=0; i<4; i++) {
            const a = (i/4) * Math.PI * 2;
            shards.moveTo(Math.cos(a)*35, Math.sin(a)*35);
            shards.lineTo(Math.cos(a)*50, Math.sin(a)*50);
        }
        container.addChild(shards);
        container.shards = shards;
        ring.lineStyle(3, 0xffffff, 0.4);
        ring.drawCircle(0, 0, 55);
    } else if (type === "MOTHERSHIP") {
        glow.beginFill(0xe74c3c, 0.3); glow.drawCircle(0, 0, 90); glow.endFill();
        body.lineStyle(3, 0xff4757); body.beginFill(0x2c3e50);
        body.drawPolygon([-70, 0, -40, -30, 40, -30, 70, 0, 40, 30, -40, 30]); body.endFill();
        body.beginFill(0xff4757, 0.4); body.drawCircle(0, 0, 25); body.endFill();
        container.scale.set(1.4);
        ring.drawEllipse(0, 0, 100, 40);
    } else if (type === "WRAITH") {
        glow.beginFill(0x8e44ad, 0.5); glow.drawCircle(0, 0, 40); glow.endFill();
        body.lineStyle(1, 0x00f2fe, 0.5); body.beginFill(0x000000, 0.6);
        body.drawCircle(0, 0, 20); body.endFill();
        container.alpha = 0.7;
        ring.lineStyle(1, 0x8e44ad, 0.8);
    } else {
        const engine = new PIXI.Graphics();
        engine.beginFill(0x2c3e50); engine.drawEllipse(0, 10, 35, 15); engine.endFill();
        engine.beginFill(0x00f2fe); engine.drawCircle(0, 15, 8); engine.endFill();
        container.addChild(engine);
        body.lineStyle(2, 0x00f2fe, 0.8); body.beginFill(0x1a1a2e);
        body.drawEllipse(0, 0, 50, 15); body.endFill();
        const dome = new PIXI.Graphics();
        dome.lineStyle(2, 0x00f2fe, 0.5); dome.beginFill(0x00f2fe, 0.2);
        dome.arc(0, -5, 20, Math.PI, 0, true); dome.endFill();
        container.addChild(dome);
        glow.beginFill(0x00f2fe, 0.3); glow.drawCircle(0, 0, 45); glow.endFill();
    }
    container.glow = glow;
    return container;
}

function spawnUFO() {
    if (typeof PIXI === 'undefined') return;
    if (planetLevel < 10) return; // Restriction: No UFOs before Level 10
    
    const randType = Math.random();
    let ufoType = "NORMAL";
    let ufoColor = 0x00f2fe;
    
    // Wraith UFO Encounter Rate Bonus
    let wraithThreshold = 0.25;
    const wraithBonus = getArtifactBonus('wraith_rate').mult - 1.0;
    if (wraithBonus > 0) wraithThreshold += (wraithBonus * 0.1);

    if (randType < 0.02) { ufoType = "RELIC_HUNTER"; ufoColor = 0xffffff; }
    else if (randType < 0.08) { ufoType = "GOLDEN"; ufoColor = 0xf1c40f; }
    else if (randType < 0.15) { ufoType = "MOTHERSHIP"; ufoColor = 0xff4757; }
    else if (randType < wraithThreshold) { ufoType = "WRAITH"; ufoColor = 0x8e44ad; }

    const ufoContainer = createUFOByType(ufoType);
    if (ufoType === "RELIC_HUNTER") {
        if (typeof playRelicUfoSfx === 'function') playRelicUfoSfx();
    } else {
        if (typeof playUfoSfx === 'function') playUfoSfx();
    }
    
    const randBehavior = Math.random();
    let behavior = "NORMAL";
    let duration = 6000;
    
    // UFO Speed reduction (stays longer)
    duration /= getArtifactBonus('ufo_speed').mult;

    if (ufoType === "RELIC_HUNTER") {
        behavior = "HYPER_DASH";
        duration = 8000 / getArtifactBonus('ufo_speed').mult;
    } else {
        if (randBehavior < 0.1) { behavior = "SCOUT"; duration = 1500 / getArtifactBonus('ufo_speed').mult; } 
        else if (randBehavior < 0.25) { behavior = "PHANTOM"; duration = 4000 / getArtifactBonus('ufo_speed').mult; }
        else if (randBehavior < 0.40) { behavior = "ZIGZAG"; duration = 5000 / getArtifactBonus('ufo_speed').mult; }
    }

    // --- Trajectory Logic: Random Start/End passing through center area ---
    const w = pixiApp.screen.width;
    const h = pixiApp.screen.height;
    const margin = 100;
    
    // Choose start side (0:Top, 1:Right, 2:Bottom, 3:Left)
    const startSide = Math.floor(Math.random() * 4);
    let startX, startY;
    if (startSide === 0) { startX = Math.random() * w; startY = -margin; }
    else if (startSide === 1) { startX = w + margin; startY = Math.random() * h; }
    else if (startSide === 2) { startX = Math.random() * w; startY = h + margin; }
    else { startX = -margin; startY = Math.random() * h; }

    // Target a point near the center (300x300 zone)
    const targetX = (w / 2) + (Math.random() * 300 - 150);
    const targetY = (h / 2) + (Math.random() * 300 - 150);

    // Calculate exit side (must be different from start side)
    let endSide = Math.floor(Math.random() * 4);
    if (endSide === startSide) endSide = (startSide + 2) % 4; // Prefer opposite side

    let endX, endY;
    if (endSide === 0) { endX = Math.random() * w; endY = -margin; }
    else if (endSide === 1) { endX = w + margin; endY = Math.random() * h; }
    else if (endSide === 2) { endX = Math.random() * w; endY = h + margin; }
    else { endX = -margin; endY = Math.random() * h; }

    // Control point for a slight curve (optional, but let's stick to passing through target)
    // We'll use two-part linear movement or a simple path through center
    
    ufoContainer.x = startX; 
    ufoContainer.y = startY;
    ufoContainer.eventMode = "static";
    ufoContainer.cursor = "pointer";
    ufoContainer.hitArea = new PIXI.Circle(0, 0, 60); 
    
    let teleportInterval = null;
    if (ufoType === "WRAITH") {
        ufoContainer.hitArea = new PIXI.Circle(0, 0, 40);
        teleportInterval = setInterval(() => {
            if (ufoContainer.destroyed) {
                clearInterval(teleportInterval);
                return;
            }
            ufoContainer.x = Math.random() * (pixiApp.screen.width - 200) + 100;
            ufoContainer.y = Math.random() * (pixiApp.screen.height - 200) + 100;
            if (typeof createExplosion === 'function') createExplosion(ufoContainer.x, ufoContainer.y);
        }, 1500);
    }

    if (typeof uiLayer !== 'undefined') uiLayer.addChild(ufoContainer);
    
    const trailParts = [];
    for (let i = 0; i < 8; i++) {
        const t = new PIXI.Graphics();
        t.beginFill(ufoColor, 0.3 * (1 - i / 8));
        t.drawCircle(0, 0, 10 * (1 - i / 8));
        t.endFill();
        t.visible = false;
        if (typeof uiLayer !== 'undefined') uiLayer.addChildAt(t, uiLayer.getChildIndex(ufoContainer));
        trailParts.push(t);
    }
    const history = [];

    const startTime = Date.now();
    let isDestroyed = false;
    let ufoMaxHp = (ufoType === "MOTHERSHIP") ? 12 : 5;
    let ufoHp = ufoMaxHp;

    if (typeof createHpBar === 'function') {
        createHpBar(ufoContainer, 70, 6);
    }

    const cleanupUFO = () => {
        if (teleportInterval) clearInterval(teleportInterval);
        pixiApp.ticker.remove(tickerFn);
        trailParts.forEach(t => t.destroy());
        if (!ufoContainer.destroyed) ufoContainer.destroy();
    };

    const tickerFn = () => {
        if (isDestroyed || ufoContainer.destroyed) {
            cleanupUFO();
            return;
        }
        const elapsed = Date.now() - startTime; 
        let progress = elapsed / duration;
        
        if (progress >= 1 && !["WRAITH", "RELIC_HUNTER"].includes(ufoType)) { 
            cleanupUFO();
            return; 
        }
        
        if (ufoType === "RELIC_HUNTER") {
            const step = Math.floor(elapsed / 1000);
            const stepProgress = (elapsed % 1000) / 1000;
            if (stepProgress < 0.3) {
                // Hyper dash along the path
                const dashStartP = (step / 8);
                const dashEndP = ((step + 1) / 8);
                const p = dashStartP + (dashEndP - dashStartP) * (stepProgress / 0.3);
                
                // Quadratic Bezier or simple path through target? 
                // Let's use simple lerp through targetX/Y for Relic Hunter too
                let currentBaseX, currentBaseY;
                if (p < 0.5) {
                    const localP = p * 2;
                    currentBaseX = startX + (targetX - startX) * localP;
                    currentBaseY = startY + (targetY - startY) * localP;
                } else {
                    const localP = (p - 0.5) * 2;
                    currentBaseX = targetX + (endX - targetX) * localP;
                    currentBaseY = targetY + (endY - targetY) * localP;
                }
                ufoContainer.x = currentBaseX;
                ufoContainer.y = currentBaseY;
                ufoContainer.alpha = 1;
            } else {
                ufoContainer.alpha = 0.6 + Math.sin(elapsed * 0.02) * 0.2;
            }
            if (progress > 1.2) { // Extra margin for relic hunter
                cleanupUFO(); return;
            }
            if (ufoContainer.shards) ufoContainer.shards.rotation += 0.2;
        } else if (ufoType !== "WRAITH") {
            // Standard path through center
            let currentBaseX, currentBaseY;
            if (progress < 0.5) {
                const localP = progress * 2;
                currentBaseX = startX + (targetX - startX) * localP;
                currentBaseY = startY + (targetY - startY) * localP;
            } else {
                const localP = (progress - 0.5) * 2;
                currentBaseX = targetX + (endX - targetX) * localP;
                currentBaseY = targetY + (endY - targetY) * localP;
            }

            if (behavior === "ZIGZAG") {
                const angle = Math.atan2(endY - startY, endX - startX) + Math.PI / 2;
                const offset = Math.sin(progress * Math.PI * 10) * 150;
                ufoContainer.x = currentBaseX + Math.cos(angle) * offset;
                ufoContainer.y = currentBaseY + Math.sin(angle) * offset;
            } else {
                const angle = Math.atan2(endY - startY, endX - startX) + Math.PI / 2;
                const offset = Math.sin(progress * Math.PI * 2) * 100;
                ufoContainer.x = currentBaseX + Math.cos(angle) * offset;
                ufoContainer.y = currentBaseY + Math.sin(angle) * offset;
            }
        }
        
        history.unshift({x: ufoContainer.x, y: ufoContainer.y});
        if (history.length > 16) history.pop();
        for (let i = 0; i < trailParts.length; i++) {
            const h = history[i * 2];
            if (h) {
                trailParts[i].x = h.x; trailParts[i].y = h.y;
                trailParts[i].visible = true;
            }
        }

        if (behavior === "PHANTOM") ufoContainer.alpha = Math.sin(progress * Math.PI) * 1.5;
        if (ufoContainer.glow) ufoContainer.glow.alpha = 0.2 + Math.sin(elapsed * 0.01) * 0.2;
        if (ufoContainer.ring) {
            ufoContainer.ring.rotation += 0.05;
            ufoContainer.ring.skew.x = Math.sin(elapsed * 0.005) * 0.2;
        }
        ufoContainer.rotation = Math.sin(elapsed * 0.002) * 0.1;
    };
    
    pixiApp.ticker.add(tickerFn);
    
    ufoContainer.on("pointerdown", (e) => {
        e.stopPropagation(); 
        ufoHp--;
        
        if (typeof updateHpBar === 'function') {
            updateHpBar(ufoContainer, ufoHp, ufoMaxHp, (ufoHp / ufoMaxHp > 0.3) ? 0xf1c40f : 0xff4757);
        }

        if (ufoHp > 0) {
            if (typeof createStardustPop === 'function') createStardustPop(ufoContainer.x, ufoContainer.y, true);
            ufoContainer.scale.set(ufoContainer.scale.x * 0.9);
            playSfx(400, "square", 0.2);
            return;
        }

        isDestroyed = true; 
        totalUfosDestroyed++;
        if (typeof createExplosion === 'function') createExplosion(ufoContainer.x, ufoContainer.y);
        
        if (ufoType === "RELIC_HUNTER") {
            showEventToast("RELIC HUNTER INTERCEPTED!", "#ffffff");
            if (typeof gainRandomArtifact === 'function') gainRandomArtifact('normal');
        } else if (ufoType === "GOLDEN") {
            let bonus = Math.floor(maxHp * 0.5);
            bonus *= getArtifactBonus('golden_ufo_mult').mult;
            stardust += Math.floor(bonus);
            showEventToast("GOLDEN UFO DESTROYED!\n+++STARDUST", "#f1c40f");
            if (typeof triggerRandomEvent === 'function') {
                triggerRandomEvent(); triggerRandomEvent(); 
            }
        } else if (ufoType === "MOTHERSHIP") {
            showEventToast("MOTHERSHIP DESTROYED!\nTRIPLE EVENT!", "#ff4757");
            if (typeof triggerRandomEvent === 'function') {
                triggerRandomEvent(); triggerRandomEvent(); triggerRandomEvent();
            }
        } else if (ufoType === "WRAITH") {
            const dm = planetLevel * 15;
            darkMatter += dm;
            showEventToast(`WRAITH BANISHED!\n+${dm} DARK MATTER`, "#8e44ad");
        } else {
            if (typeof triggerRandomEvent === 'function') triggerRandomEvent(); 
        }

        cleanupUFO();
    });
}
