// ==========================================
// VISUALS: PROJECTILES & HIT EFFECTS
// ==========================================

let lastHitEffectTime = 0;

/**
 * Screen Shake: Shakes the planet and effects layers for impact.
 */
function screenShake(intensity = 3, duration = 200) {
    if (typeof planetLayer === 'undefined' || typeof effectsLayer === 'undefined') return;
    
    const startTime = Date.now();
    const originalPlanetX = planetLayer.x;
    const originalPlanetY = planetLayer.y;
    const originalEffectsX = effectsLayer.x;
    const originalEffectsY = effectsLayer.y;

    const shakeTicker = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed > duration) {
            pixiApp.ticker.remove(shakeTicker);
            planetLayer.x = originalPlanetX;
            planetLayer.y = originalPlanetY;
            effectsLayer.x = originalEffectsX;
            effectsLayer.y = originalEffectsY;
            return;
        }

        const decay = 1 - (elapsed / duration);
        const curIntensity = intensity * decay;
        const offsetX = (Math.random() - 0.5) * curIntensity * 2;
        const offsetY = (Math.random() - 0.5) * curIntensity * 2;

        planetLayer.x = originalPlanetX + offsetX;
        planetLayer.y = originalPlanetY + offsetY;
        effectsLayer.x = originalEffectsX + offsetX;
        effectsLayer.y = originalEffectsY + offsetY;
    };
    pixiApp.ticker.add(shakeTicker);
}

function createProjectile(startX, startY, targetX, targetY, angle, dmg, isBig, projClass, isAuto) {
    const container = new PIXI.Container();
    const proj = new PIXI.Graphics();
    const glow = new PIXI.Graphics();
    container.addChild(glow);
    container.addChild(proj);
    
    let projColor = 0xffffff;
    switch(projClass) {
        case 'proj-basic':
            projColor = 0xf1c40f;
            proj.beginFill(projColor); proj.drawRoundedRect(-2, -6, 4, 12, 2); proj.endFill();
            glow.beginFill(projColor, 0.4); glow.drawCircle(0, 0, 6); glow.endFill();
            break;
        case 'proj-missile':
            projColor = 0xe74c3c;
            proj.beginFill(projColor); proj.drawRect(-3, -8, 6, 16); 
            proj.beginFill(0x2c3e50); proj.drawRect(-3, 4, 6, 4); proj.endFill();
            glow.beginFill(0xe67e22, 0.7); glow.drawEllipse(0, 10, 4, 10); glow.endFill();
            break;
        case 'proj-laser':
            projColor = 0x2ecc71;
            proj.beginFill(projColor); proj.drawRect(-1, -15, 2, 30); proj.endFill();
            glow.beginFill(projColor, 0.6); glow.drawRect(-3, -15, 6, 30); glow.endFill();
            break;
        case 'proj-plasma':
            projColor = 0x9b59b6;
            proj.beginFill(0xffffff); proj.drawCircle(0, 0, 3); proj.endFill();
            glow.beginFill(projColor, 0.8); glow.drawCircle(0, 0, 8);
            glow.lineStyle(1, 0xffffff, 0.5); glow.drawCircle(0, 0, 10); glow.endFill();
            break;
        case 'proj-beam':
            projColor = 0x00f2fe;
            proj.beginFill(projColor); proj.drawRect(-2, -20, 4, 40); proj.endFill();
            glow.beginFill(projColor, 0.4); glow.drawRect(-6, -20, 12, 40); glow.endFill();
            break;
        case 'proj-dark':
            projColor = 0x8e44ad;
            proj.beginFill(0x000000); proj.drawCircle(0, 0, 6); proj.endFill();
            glow.lineStyle(2, projColor, 1); glow.drawCircle(0, 0, 7); glow.endFill();
            glow.beginFill(projColor, 0.3); glow.drawCircle(0, 0, 12); glow.endFill();
            break;
        case 'proj-cosmic':
            projColor = 0xffd700;
            const starPoints = [];
            for (let i = 0; i < 8; i++) {
                const r = (i % 2 === 0) ? 10 : 4;
                const a = (Math.PI * 2 / 8) * i;
                starPoints.push(Math.cos(a) * r, Math.sin(a) * r);
            }
            proj.beginFill(0xffffff); 
            proj.drawPolygon(starPoints);
            proj.endFill();
            glow.beginFill(projColor, 0.5); glow.drawCircle(0, 0, 12); glow.endFill();
            break;
        case 'proj-railgun':
            projColor = 0xbdc3c7;
            proj.beginFill(projColor); proj.drawRect(-1, -12, 2, 24); proj.endFill();
            glow.beginFill(0xecf0f1, 0.5); glow.drawRect(-3, -12, 6, 24); glow.endFill();
            break;
        case 'proj-void':
            projColor = 0x00f2fe;
            proj.beginFill(0x000000); proj.drawCircle(0, 0, 5); proj.endFill();
            glow.lineStyle(1, projColor, 0.8); glow.drawCircle(0, 0, 8);
            glow.beginFill(projColor, 0.2); glow.drawCircle(0, 0, 15); glow.endFill();
            break;
        case 'proj-photon':
            projColor = 0xf1c40f;
            proj.beginFill(0xffffff); proj.drawCircle(0, 0, 4); proj.endFill();
            glow.beginFill(projColor, 0.6); glow.drawCircle(0, 0, 10); glow.endFill();
            break;
        case 'proj-lightning':
            projColor = 0x3498db;
            proj.beginFill(0xffffff); proj.drawRect(-1, -12, 2, 24); proj.endFill();
            glow.beginFill(projColor, 0.7); glow.drawRect(-4, -12, 8, 24); glow.endFill();
            break;
        case 'proj-cluster':
            projColor = 0xe67e22;
            proj.beginFill(projColor); proj.drawCircle(0, 0, 3);
            proj.drawCircle(-4, 4, 1.5); proj.drawCircle(4, -4, 1.5); proj.endFill();
            glow.beginFill(projColor, 0.3); glow.drawCircle(0, 0, 8); glow.endFill();
            break;
        default:
            proj.beginFill(0xffffff); proj.drawRect(-2, -6, 4, 12); proj.endFill();
    }

    container.x = startX; container.y = startY;
    container.rotation = angle + Math.PI / 2;
    const baseProjScale = (isBig ? 1.8 : 1.0) * (typeof fleetScale !== 'undefined' ? fleetScale : 1.0);
    container.scale.set(baseProjScale);
    if (typeof projectileLayer !== 'undefined') projectileLayer.addChild(container);

    // --- Trail Setup ---
    const trailCount = 5;
    const trailParts = [];
    for (let i = 0; i < trailCount; i++) {
        const t = new PIXI.Graphics();
        t.beginFill(projColor, 0.5 * (1 - i / trailCount));
        const trailSize = (isBig ? 6 : 3) * (1 - i / trailCount) * (typeof fleetScale !== 'undefined' ? fleetScale : 1.0);
        t.drawCircle(0, 0, trailSize);
        t.endFill();
        t.visible = false;
        if (typeof projectileLayer !== 'undefined') projectileLayer.addChildAt(t, projectileLayer.getChildIndex(container));
        trailParts.push(t);
    }
    const history = [];

    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    let speedMult = 1.0;
    if (upgrades.hyperDrive && upgrades.hyperDrive.lv > 0) speedMult += (upgrades.hyperDrive.lv * 0.1);
    speedMult *= Math.pow(1.25, hasArtifact('art_nebula_fuel'));
    
    const duration = (dist / 1.5) / speedMult;
    const startTime = Date.now();

    const tickerFn = () => {
        const elapsed = Date.now() - startTime;
        let progress = elapsed / duration;
        if (progress >= 1) {
            pixiApp.ticker.remove(tickerFn);
            container.destroy();
            trailParts.forEach(t => t.destroy());
            if (typeof dealDamage === 'function') dealDamage(dmg, isAuto);
            createHitEffect(targetX, targetY, isAuto, projClass, isBig);
            return;
        }
        container.x = startX + dx * progress;
        container.y = startY + dy * progress;

        // Update Trail
        history.unshift({x: container.x, y: container.y});
        if (history.length > trailCount * 2) history.pop();
        
        for (let i = 0; i < trailParts.length; i++) {
            const h = history[i * 2];
            if (h) {
                trailParts[i].x = h.x;
                trailParts[i].y = h.y;
                trailParts[i].visible = true;
            }
        }
        
        if (['proj-plasma', 'proj-cosmic', 'proj-void', 'proj-photon'].includes(projClass)) {
            const pulse = 1 + Math.sin(Date.now() * 0.02) * 0.1;
            container.scale.set((isBig ? 1.8 : 1.0) * pulse);
        }
    };
    pixiApp.ticker.add(tickerFn);
}

/**
 * Consolidated Hit Effect: Handles multiple particles and projectile classes.
 */
function createHitEffect(x, y, isAuto, projClass = 'proj-basic', isBig = false) {
    if (typeof PIXI === 'undefined' || typeof effectsLayer === 'undefined') return;
    
    // Performance Guard: Limit hit effect frequency
    const now = Date.now();
    if (isAuto && now - lastHitEffectTime < 30) return; 
    lastHitEffectTime = now;

    // Trigger Screen Shake for high-tier projectiles or big ships
    if (['proj-cosmic', 'proj-void', 'proj-dark', 'proj-beam'].includes(projClass) || isBig) {
        screenShake(isBig ? 6 : 3, 200);
    }

    const container = new PIXI.Container();
    container.x = x; container.y = y;
    effectsLayer.addChild(container);

    const colors = {
        'proj-basic': 0xf1c40f, 'proj-missile': 0xe67e22, 'proj-laser': 0x2ecc71,
        'proj-plasma': 0x9b59b6, 'proj-beam': 0x00f2fe, 'proj-dark': 0x8e44ad,
        'proj-cosmic': 0xffd700, 'proj-railgun': 0xbdc3c7, 'proj-void': 0x00f2fe,
        'proj-photon': 0xffffff, 'proj-lightning': 0x3498db, 'proj-cluster': 0xe67e22
    };
    const pColor = colors[projClass] || 0xffffff;

    // Optimized particle count - More for high-tier or big hits
    let count = isAuto ? 3 : 8; 
    if (['proj-cosmic', 'proj-void', 'proj-dark'].includes(projClass)) count *= 2;
    if (isBig) count *= 1.5;

    const particles = [];

    for (let i = 0; i < count; i++) {
        const p = new PIXI.Graphics();
        p.beginFill(pColor); 
        const s = typeof fleetScale !== 'undefined' ? fleetScale : 1.0;
        if (['proj-laser', 'proj-beam', 'proj-railgun', 'proj-lightning'].includes(projClass)) {
            p.drawRect(-1 * s, -4 * s, 2 * s, 8 * s);
        } else {
            p.drawCircle(0, 0, (Math.random() * 2 + 1) * s * (isBig ? 1.5 : 1.0));
        }
        p.endFill();
        
        p.vx = (Math.random() - 0.5) * (isBig ? 10 : 6); 
        p.vy = (Math.random() - 0.5) * (isBig ? 10 : 6);
        p.rotation = Math.random() * Math.PI;
        p.alpha = 1.0;
        container.addChild(p);
        particles.push(p);
    }

    // Consolidated Ticker for all particles in this container
    const tickerFn = (delta) => {
        let allDead = true;
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (p.alpha > 0) {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.05;
                p.scale.set(Math.max(0, p.alpha));
                allDead = false;
            }
        }
        if (allDead) {
            pixiApp.ticker.remove(tickerFn);
            container.destroy();
        }
    };
    pixiApp.ticker.add(tickerFn);
}
