// ==========================================
// VISUALS: WORLD & AMBIENT FX
// ==========================================

function createPrestigeStar() {
    if (typeof PIXI === 'undefined' || typeof bgLayer === 'undefined') return;
    const star = new PIXI.Graphics();
    star.beginFill(0xffffff); star.drawCircle(0, 0, 4); star.endFill();
    star.x = Math.random() * pixiApp.screen.width;
    star.y = Math.random() * pixiApp.screen.height;
    bgLayer.addChild(star);
    let offset = Math.random() * Math.PI * 2;
    pixiApp.ticker.add(() => {
        offset += 0.02; star.scale.set(1 + Math.sin(offset) * 0.3);
        star.alpha = 0.4 + (Math.sin(offset) + 1) / 2 * 0.6;
    });
}

function plantPineVisual(isLucky = false) {
    if (typeof PIXI === 'undefined' || typeof effectsLayer === 'undefined') return;
    
    // Juice: Using Graphics instead of Text for smoother scaling/polishing
    const container = new PIXI.Container();
    const body = new PIXI.Graphics();
    const color = isLucky ? 0x2ecc71 : 0x27ae60;
    
    // Draw a stylized "Organic Compound" / Pine
    body.beginFill(color);
    body.drawPolygon([0, -15, 12, 10, -12, 10]);
    body.drawPolygon([0, -25, 10, -5, -10, -5]);
    body.endFill();
    body.beginFill(0x795548); // Trunk
    body.drawRect(-3, 10, 6, 5);
    body.endFill();
    
    container.addChild(body);
    container.x = Math.random() * (pixiApp.screen.width - 100) + 50;
    container.y = Math.random() * (pixiApp.screen.height - 100) + 50;
    container.alpha = 0;
    container.scale.set(0.3);
    
    effectsLayer.addChild(container);

    const startTime = Date.now();
    const duration = 1200;

    const tickerFn = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress >= 1) {
            pixiApp.ticker.remove(tickerFn);
            container.destroy();
            return;
        }

        if (progress < 0.2) {
            container.alpha = progress / 0.2;
            container.scale.set(0.3 + (progress / 0.2) * 0.7);
        } else if (progress > 0.8) {
            container.alpha = (1 - progress) / 0.2;
        }
        
        container.y -= 0.5;
        container.rotation = Math.sin(progress * 10) * 0.1;
    };
    pixiApp.ticker.add(tickerFn);
}

function createStardustPop(x, y, isCrit) {
    if (typeof PIXI === 'undefined' || typeof effectsLayer === 'undefined') return;
    
    const count = isCrit ? 8 : 4;
    for (let i = 0; i < count; i++) {
        const p = new PIXI.Graphics();
        const color = isCrit ? 0x00f2fe : 0xffffff;
        p.beginFill(color, 0.8);
        p.drawCircle(0, 0, Math.random() * 3 + 2);
        p.endFill();
        p.x = x; p.y = y;
        effectsLayer.addChild(p);

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        const startTime = Date.now();
        const tickerFn = () => {
            const pElapsed = (Date.now() - startTime) / 600;
            if (pElapsed >= 1) { pixiApp.ticker.remove(tickerFn); p.destroy(); return; }
            p.x += vx; p.y += vy;
            p.alpha = 1 - pElapsed;
            p.scale.set(1 - pElapsed);
        };
        pixiApp.ticker.add(tickerFn);
    }
}

function createUnlockParticle() {
    if (typeof PIXI === 'undefined' || typeof effectsLayer === 'undefined') return;
    const p = new PIXI.Graphics();
    const colors = [0xff00ff, 0x00f2fe, 0xf1c40f];
    p.beginFill(colors[Math.floor(Math.random() * colors.length)]);
    p.drawCircle(0, 0, Math.random() * 3 + 2);
    p.endFill();
    
    p.x = pixiApp.screen.width / 2;
    p.y = pixiApp.screen.height / 2;
    effectsLayer.addChild(p);

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    let life = 1.0;
    const tickerFn = () => {
        p.x += vx;
        p.y += vy;
        life -= 0.02;
        p.alpha = life;
        if (life <= 0) {
            pixiApp.ticker.remove(tickerFn);
            p.destroy();
        }
    };
    pixiApp.ticker.add(tickerFn);
}

function createTsunamiVFX() {
    if (typeof PIXI === 'undefined' || typeof effectsLayer === 'undefined') return;
    const centerX = pixiApp.screen.width / 2;
    const centerY = pixiApp.screen.height / 2;
    
    for (let i = 0; i < 60; i++) {
        const p = new PIXI.Graphics();
        const colors = [0x00f2fe, 0x2980b9, 0xffffff];
        p.beginFill(colors[Math.floor(Math.random()*colors.length)], 0.7);
        p.drawCircle(0, 0, Math.random() * 5 + 2);
        p.endFill();
        p.x = centerX;
        p.y = centerY;
        effectsLayer.addChild(p);

        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 12;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        const startTime = Date.now();
        const tickerFn = () => {
            const pElapsed = (Date.now() - startTime) / 1000;
            if (pElapsed >= 1) { pixiApp.ticker.remove(tickerFn); p.destroy(); return; }
            p.x += vx; p.y += vy;
            p.alpha = 1 - pElapsed;
            p.scale.set(1 + pElapsed * 2);
        };
        pixiApp.ticker.add(tickerFn);
    }
}

function createGearDebris(x, y) {
    if (typeof PIXI === 'undefined' || typeof effectsLayer === 'undefined') return;
    
    for (let i = 0; i < 8; i++) {
        const container = new PIXI.Container();
        const gear = new PIXI.Graphics();
        
        // Polished Gear Graphics
        gear.lineStyle(2, 0x95a5a6);
        gear.beginFill(0xbdc3c7);
        gear.drawCircle(0, 0, 8);
        for(let j=0; j<8; j++) {
            const a = (j/8) * Math.PI * 2;
            gear.drawRect(Math.cos(a)*8 - 2, Math.sin(a)*8 - 2, 4, 4);
        }
        gear.endFill();
        gear.beginFill(0x000000, 0.3);
        gear.drawCircle(0, 0, 3);
        gear.endFill();
        
        container.addChild(gear);
        container.x = x; 
        container.y = y; 
        effectsLayer.addChild(container);
        
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 3;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const rotSpeed = (Math.random() - 0.5) * 0.2;
        
        const startTime = Date.now();
        const tickerFn = () => {
            const p = (Date.now() - startTime) / 1200;
            if (p >= 1) { 
                pixiApp.ticker.remove(tickerFn); 
                container.destroy(); 
                return; 
            }
            container.x += vx;
            container.y += vy + (p * 5); // Gravity effect
            container.rotation += rotSpeed;
            container.alpha = 1 - p;
            container.scale.set(1.2 - p);
        };
        pixiApp.ticker.add(tickerFn);
    }
}

function createPineStorm() {
    if (typeof PIXI === 'undefined' || typeof uiLayer === 'undefined') return;
    
    for (let i = 0; i < 40; i++) {
        const leaf = new PIXI.Graphics();
        leaf.beginFill(0x2ecc71, 0.6);
        leaf.drawEllipse(0, 0, 10, 5);
        leaf.endFill();
        
        leaf.x = Math.random() * pixiApp.screen.width; 
        leaf.y = -50; 
        uiLayer.addChild(leaf);
        
        const startTime = Date.now();
        const speed = 2 + Math.random() * 3;
        const tickerFn = () => {
            const p = (Date.now() - startTime) / 3000;
            if (p >= 1) { 
                pixiApp.ticker.remove(tickerFn); 
                leaf.destroy(); 
                return; 
            }
            leaf.y += speed;
            leaf.x += Math.sin(p * 10) * 2;
            leaf.rotation += 0.05;
        };
        pixiApp.ticker.add(tickerFn);
    }
}
