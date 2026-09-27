// ==========================================
// VISUALS: COMBAT FX (Damage & Explosions)
// ==========================================

let autoDamageBuffer = 0;
let lastAutoDamageTime = 0;
let clickDamageBuffer = 0;
let lastClickDamageTime = 0;

function createShockwave(x, y, isCrit) {
    if (typeof PIXI === 'undefined' || typeof effectsLayer === 'undefined') return;
    const ring = new PIXI.Graphics();
    ring.lineStyle(isCrit ? 4 : 2, isCrit ? 0xff4757 : 0x00f2fe, 0.6);
    ring.drawCircle(0, 0, 20);
    ring.x = x; ring.y = y;
    effectsLayer.addChild(ring);

    const startTime = Date.now();
    const duration = 400;
    const tickerFn = () => {
        const p = (Date.now() - startTime) / duration;
        if (p >= 1) { pixiApp.ticker.remove(tickerFn); ring.destroy(); return; }
        ring.scale.set(1 + p * 3);
        ring.alpha = 1 - p;
    };
    pixiApp.ticker.add(tickerFn);
}

function showDamageNumber(x, y, amount, isCrit, isSuperCrit = false, isAuto = false) {
    const now = Date.now();
    
    if (isAuto) {
        autoDamageBuffer += amount;
        if (now - lastAutoDamageTime < 150) return; // Increased from 100ms
        
        amount = autoDamageBuffer;
        autoDamageBuffer = 0;
        lastAutoDamageTime = now;
    } else {
        // Performance Guard: Buffer rapid manual clicks too
        clickDamageBuffer += amount;
        if (now - lastClickDamageTime < 50) return; 
        
        amount = clickDamageBuffer;
        clickDamageBuffer = 0;
        lastClickDamageTime = now;
    }

    let fontSize = isCrit ? 28 : 18;
    let fill = isCrit ? 0xff4757 : 0xffffff;
    let glowColor = 0xff0000;
    
    if (isSuperCrit) {
        fontSize = 42;
        fill = 0x9b59b6; 
        glowColor = 0xf1c40f; 
    }

    const text = new PIXI.Text(Math.floor(amount).toLocaleString(), {
        fontFamily: 'Consolas, monospace',
        fontSize: fontSize,
        fill: fill,
        fontWeight: 'bold',
        stroke: 0x000000,
        strokeThickness: isSuperCrit ? 5 : 3,
        dropShadow: isCrit || isSuperCrit,
        dropShadowColor: glowColor,
        dropShadowBlur: isSuperCrit ? 15 : 5,
        dropShadowDistance: 0
    });
    text.anchor.set(0.5);
    
    const scatterRadius = isCrit ? 80 : 50;
    const scatterAngle = Math.random() * Math.PI * 2;
    text.x = x + Math.cos(scatterAngle) * (Math.random() * scatterRadius);
    text.y = y + Math.sin(scatterAngle) * (Math.random() * scatterRadius);
    
    if (typeof uiLayer !== 'undefined') uiLayer.addChild(text);
    createShockwave(text.x, text.y, isCrit || isSuperCrit);

    const duration = isSuperCrit ? 1200 : 800;
    const startTime = Date.now();
    const startX = text.x;
    const startY = text.y;
    
    const centerX = pixiApp.screen.width / 2;
    const centerY = pixiApp.screen.height / 2;
    const moveAngle = Math.atan2(startY - centerY, startX - centerX);
    const moveDist = 100 + Math.random() * 50;

    const tickerFn = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress >= 1) {
            pixiApp.ticker.remove(tickerFn);
            text.destroy();
            return;
        }

        text.x = startX + Math.cos(moveAngle) * (progress * moveDist);
        text.y = startY + Math.sin(moveAngle) * (progress * moveDist) - (Math.pow(progress, 2) * 50);
        text.alpha = 1 - progress;
        
        if (isSuperCrit) {
            text.scale.set(1.2 + Math.sin(progress * Math.PI * 2) * 0.4);
            text.rotation = Math.sin(progress * Math.PI * 4) * 0.1;
        } else if (isCrit) {
            text.scale.set(1 + Math.sin(progress * Math.PI) * 0.5);
        } else {
            text.scale.set(1 - (progress * 0.5));
        }
    };
    pixiApp.ticker.add(tickerFn);
}

function createMiniBossExplosion() {
    const centerX = pixiApp.screen.width / 2;
    const centerY = pixiApp.screen.height / 2;
    
    const core = new PIXI.Graphics();
    core.beginFill(0x00ced1, 0.8); core.drawCircle(0, 0, 40); core.endFill();
    core.x = centerX; core.y = centerY;
    if (typeof effectsLayer !== 'undefined') effectsLayer.addChild(core);
    
    const cStartTime = Date.now();
    const cTicker = () => {
        const p = (Date.now() - cStartTime) / 600;
        if (p >= 1) { pixiApp.ticker.remove(cTicker); core.destroy(); return; }
        core.scale.set(1 + p * 4);
        core.alpha = 1 - p;
    };
    pixiApp.ticker.add(cTicker);

    for (let i = 0; i < 20; i++) {
        const p = new PIXI.Graphics();
        p.beginFill(0xffffff); p.drawRect(-1, -10, 2, 20); p.endFill();
        p.x = centerX; p.y = centerY;
        p.rotation = Math.random() * Math.PI * 2;
        if (typeof effectsLayer !== 'undefined') effectsLayer.addChild(p);
        
        const speed = 10 + Math.random() * 15;
        const vx = Math.cos(p.rotation) * speed;
        const vy = Math.sin(p.rotation) * speed;
        
        const pStartTime = Date.now();
        const pTicker = () => {
            const pp = (Date.now() - pStartTime) / 500;
            if (pp >= 1) { pixiApp.ticker.remove(pTicker); p.destroy(); return; }
            p.x += vx; p.y += vy;
            p.alpha = 1 - pp;
            p.scale.set(1 - pp);
        };
        pixiApp.ticker.add(pTicker);
    }

    if (typeof playMiniBossExplosionSfx === 'function') playMiniBossExplosionSfx();
}

function createPlanetExplosion() {
    const centerX = pixiApp.screen.width / 2;
    const centerY = pixiApp.screen.height / 2;
    
    const flash = new PIXI.Graphics();
    flash.beginFill(0xffffff);
    flash.drawCircle(0, 0, 150);
    flash.endFill();
    flash.x = centerX; flash.y = centerY;
    if (typeof effectsLayer !== 'undefined') effectsLayer.addChild(flash);

    const startTime = Date.now();
    const tickerFn = () => {
        const p = (Date.now() - startTime) / 500;
        if (p >= 1) { pixiApp.ticker.remove(tickerFn); flash.destroy(); return; }
        flash.scale.set(1 + p * 2);
        flash.alpha = 1 - p;
    };
    pixiApp.ticker.add(tickerFn);

    for(let i=0; i<40; i++) {
        const p = new PIXI.Graphics();
        const colors = [0xf1c40f, 0xe67e22, 0xff4757, 0xffffff];
        p.beginFill(colors[Math.floor(Math.random()*colors.length)]);
        p.drawCircle(0, 0, Math.random()*5+2);
        p.endFill();
        p.x = centerX; p.y = centerY;
        if (typeof effectsLayer !== 'undefined') effectsLayer.addChild(p);

        const angle = Math.random() * Math.PI * 2;
        const dist = 100 + Math.random() * 300;
        const tx = centerX + Math.cos(angle) * dist;
        const ty = centerY + Math.sin(angle) * dist;

        const pStartTime = Date.now();
        const pDuration = 600 + Math.random()*600;
        const pTickerFn = () => {
            const pp = (Date.now() - pStartTime) / pDuration;
            if (pp >= 1) { pixiApp.ticker.remove(pTickerFn); p.destroy(); return; }
            p.x = centerX + (tx - centerX) * pp;
            p.y = centerY + (ty - centerY) * pp;
            p.alpha = 1 - pp;
            p.scale.set(1 - pp);
        };
        pixiApp.ticker.add(pTickerFn);
    }

    if (typeof playPlanetExplosionSfx === 'function') playPlanetExplosionSfx();
}

function createExplosion(x, y) {
    if (typeof PIXI === 'undefined' || typeof effectsLayer === 'undefined') return;
    
    const ex = new PIXI.Graphics();
    ex.beginFill(0xffffff); ex.drawCircle(0, 0, 20); ex.endFill();
    ex.x = x; ex.y = y; 
    effectsLayer.addChild(ex);
    
    const startTime = Date.now();
    const tickerFn = () => {
        const p = (Date.now() - startTime) / 400;
        if (p >= 1) { pixiApp.ticker.remove(tickerFn); ex.destroy(); return; }
        ex.scale.set(0.5 + p * 1.5); 
        ex.alpha = 1 - p;
    };
    pixiApp.ticker.add(tickerFn);
}
