// ==========================================
// VISUALS: SHIPS
// ==========================================

/**
 * Generates custom Pixi.js vector graphics for all fleet ships.
 */
function getShipGraphic(icon, isBig) {
    const container = new PIXI.Container();
    const ship = new PIXI.Graphics();
    const glow = new PIXI.Graphics();
    
    let engineColor = 0xe67e22;

    const drawFighter = (p, s) => {
        ship.beginFill(p); ship.lineStyle(1, s, 1);
        ship.moveTo(0, -12); ship.lineTo(8, 8); ship.lineTo(-8, 8); ship.closePath(); ship.endFill();
        ship.beginFill(s, 0.8); ship.drawCircle(0, -1, 3); ship.endFill();
        glow.beginFill(engineColor, 0.5); glow.drawEllipse(0, 10, 3, 6); glow.endFill();
    };

    const drawCruiser = (p, s) => {
        ship.beginFill(p); ship.lineStyle(1, s, 1);
        ship.drawRect(-5, -15, 10, 30); ship.drawRect(-10, 5, 20, 5); ship.endFill();
        ship.beginFill(s, 0.7); ship.drawRect(-3, -12, 6, 8); ship.endFill();
        glow.beginFill(engineColor, 0.6); glow.drawRect(-4, 15, 3, 5); glow.drawRect(1, 15, 3, 5); glow.endFill();
    };

    const drawHeavy = (p, s) => {
        ship.beginFill(p); ship.lineStyle(2, s, 1);
        ship.drawPolygon([-8, -20, 8, -20, 12, 10, 8, 20, -8, 20, -12, 10]); ship.endFill();
        ship.beginFill(s, 0.5); ship.drawRect(-6, -15, 12, 4); ship.endFill();
        glow.beginFill(0x00f2fe, 0.8); glow.drawRect(-8, 20, 16, 4); glow.endFill();
    };

    const drawAlien = (p, s) => {
        ship.beginFill(p, 0.6); ship.lineStyle(2, s, 1);
        ship.drawCircle(0, 0, 12); 
        const points = [];
        for (let i = 0; i < 10; i++) {
            const r = (i % 2 === 0) ? 15 : 8;
            const a = (Math.PI * 2 / 10) * i;
            points.push(Math.cos(a) * r, Math.sin(a) * r);
        }
        ship.drawPolygon(points);
        ship.endFill();
        glow.beginFill(s, 0.4); glow.drawCircle(0, 0, 18); glow.endFill();
    };

    const drawCosmic = (p, s) => {
        ship.beginFill(p); ship.lineStyle(2, 0xffffff, 1);
        const points = [];
        for (let i = 0; i < 6; i++) {
            const a = (Math.PI * 2 / 6) * i;
            points.push(Math.cos(a) * 15, Math.sin(a) * 15);
        }
        ship.drawPolygon(points);
        ship.endFill();
        const ring = new PIXI.Graphics();
        ring.lineStyle(1, s, 0.8); ring.drawCircle(0, 0, 20); container.addChild(ring);
        glow.beginFill(0xffffff, 0.8); glow.drawCircle(0, 0, 5); glow.endFill();
    };

    switch(icon) {
        case '🛩️': drawFighter(0x3498db, 0x00f2fe); break;
        case '✈️': drawFighter(0x2980b9, 0xecf0f1); break;
        case '🚤': drawFighter(0x1abc9c, 0x16a085); break;
        case '️🚀': drawFighter(0xe67e22, 0xf39c12); break;
        case '🛥️': drawCruiser(0x95a5a6, 0xbdc3c7); break;
        case '🚢': drawCruiser(0x7f8c8d, 0x34495e); break;
        case '🚁': drawCruiser(0x27ae60, 0x2ecc71); break;
        case '🛳️': drawCruiser(0xe74c3c, 0xc0392b); break;
        case '⛴️': drawCruiser(0x8e44ad, 0x9b59b6); break;
        case '⛵': drawHeavy(0xf1c40f, 0xffffff); break;
        case '🚄': drawHeavy(0xecf0f1, 0x3498db); break;
        case '💠': drawAlien(0x00f2fe, 0xffffff); break;
        case '🛰️': drawHeavy(0x34495e, 0xe74c3c); break;
        case '🌑': drawAlien(0x2c3e50, 0x000000); break;
        case '🏯': drawHeavy(0xd35400, 0xffffff); break;
        case '🌋': drawCosmic(0xff4500, 0xffd700); break;
        case '👾': drawAlien(0xa020f0, 0x00ff00); break;
        case '🗿': drawHeavy(0x808080, 0x404040); break;
        case '🌌': drawCosmic(0x483d8b, 0xdda0dd); break;
        case '☀️': drawCosmic(0xffd700, 0xff4500); break;
        case '🌟': drawCosmic(0xffffff, 0xffd700); break;
        case '💫': drawCosmic(0x00ced1, 0xffffff); break;
        case '🌫️': drawAlien(0x708090, 0xffffff); break;
        case '🕳️': drawCosmic(0x000000, 0x8e44ad); break;
        case '🧱': drawHeavy(0xcd853f, 0x8b4513); break;
        case '🌀': drawCosmic(0x1e90ff, 0x00f2fe); break;
        case '⚖️': drawHeavy(0xffd700, 0xdaa520); break;
        case '🏗️': drawHeavy(0x4682b4, 0xb0c4de); break;
        case '👑': drawCosmic(0xffd700, 0xffffff); break;
        case '✨': drawCosmic(0xffffff, 0xffff00); break;
        case '🧶': drawAlien(0xff00ff, 0x00ffff); break;
        case '💎': drawCosmic(0x00ffff, 0xffffff); break;
        case '⏳': drawHeavy(0xdaa520, 0xffd700); break;
        case '💨': drawAlien(0xadd8e6, 0xffffff); break;
        case '💥': drawCosmic(0xff4500, 0xffa500); break;
        case '🛡️': drawHeavy(0x4169e1, 0x00f2fe); break;
        case '👻': drawAlien(0xffffff, 0x8e44ad); break;
        case '⚒️': drawHeavy(0x708090, 0xffd700); break;
        case '⚙️': drawHeavy(0x808080, 0xc0c0c0); break;
        case '🎺': drawCosmic(0xffd700, 0xffffff); break;
        case '🐍': drawAlien(0x00ff00, 0x006400); break;
        case '🏴‍☠️': drawHeavy(0x000000, 0xff0000); break;
        case '🎖️': drawCosmic(0xffd700, 0xff0000); break;
        case '🌅': drawCosmic(0xff8c00, 0xff4500); break;
        case '🛸': drawAlien(0x00ff00, 0xffffff); break;
        case '🍽️': drawHeavy(0x2f4f4f, 0x808080); break;
        case '🔮': drawCosmic(0x8e44ad, 0xff00ff); break;
        case '🧘': drawCosmic(0xffffff, 0x00ff00); break;
        case '🦉': drawAlien(0x8b4513, 0xffd700); break;
        case '🔱': drawHeavy(0x0000ff, 0x00ffff); break;
        case '🕊️': drawCosmic(0xffffff, 0xadd8e6); break;
        case '👹': drawAlien(0xff0000, 0x000000); break;
        case '👁️': drawCosmic(0xffffff, 0xff0000); break;
        case '🔄': drawAlien(0x0000ff, 0xffffff); break;
        case '⚔️': drawHeavy(0xc0c0c0, 0xff0000); break;
        default: drawFighter(0xffffff, 0xcccccc);
    }

    container.addChild(glow);
    container.addChild(ship);
    ship.filters = [new PIXI.BlurFilter(0.5)];
    if (isBig) container.scale.set(2.5);
    return container;
}

function createShip(e, dmg, icon, isAuto, isBig = false, projClass = 'proj-basic') {
    const ship = getShipGraphic(icon, isBig);
    let startX, startY;
    const currentScale = typeof fleetScale !== 'undefined' ? fleetScale : 1.0;
    if (isAuto || !e) {
        const padding = 80 * currentScale;
        startX = Math.random() * (window.innerWidth - 2 * padding) + padding;
        startY = window.innerHeight - padding;
    } else {
        startX = e.clientX + (Math.random() * 40 - 20);
        startY = e.clientY + (Math.random() * 40 - 20);
    }
    ship.x = startX; ship.y = startY;
    if (typeof shipLayer !== 'undefined') shipLayer.addChild(ship);

    const centerX = pixiApp.screen.width / 2;
    const centerY = pixiApp.screen.height / 2;
    const targetX = centerX + (Math.random() * 180 - 90);
    const targetY = centerY + (Math.random() * 180 - 90);

    const angle = Math.atan2(targetY - startY, targetX - startX);
    ship.rotation = angle + Math.PI / 2;

    // --- Muzzle Flash ---
    const flash = new PIXI.Graphics();
    flash.beginFill(0xffffff, 0.9);
    for(let i=0; i<8; i++) {
        const a = (i/8) * Math.PI * 2;
        const r = i%2===0 ? (isBig?20:10) : (isBig?8:4);
        if(i===0) flash.moveTo(Math.cos(a)*r, Math.sin(a)*r);
        else flash.lineTo(Math.cos(a)*r, Math.sin(a)*r);
    }
    flash.endFill();
    flash.x = startX + Math.cos(angle) * 25;
    flash.y = startY + Math.sin(angle) * 25;
    flash.scale.set(fleetScale); // Apply fleet scale to flash
    if (typeof effectsLayer !== 'undefined') effectsLayer.addChild(flash);
    
    let flashLife = 1.0;
    const flashTicker = () => {
        flashLife -= 0.2;
        flash.alpha = flashLife;
        flash.scale.set((1 + (1 - flashLife)) * fleetScale); // Keep fleet scale during animation
        if (flashLife <= 0) {
            pixiApp.ticker.remove(flashTicker);
            flash.destroy();
        }
    };
    pixiApp.ticker.add(flashTicker);

    const duration = 800;
    const startTime = Date.now();

    const tickerFn = () => {
        const elapsed = Date.now() - startTime;
        let progress = elapsed / duration;
        if (progress >= 1) {
            pixiApp.ticker.remove(tickerFn);
            ship.destroy();
            return;
        }
        
        const recoil = progress < 0.1 ? (progress/0.1) * -15 : (progress < 0.3 ? -15 + ((progress-0.1)/0.2) * 15 : 0);
        ship.x = startX + Math.cos(angle) * recoil;
        ship.y = startY + Math.sin(angle) * recoil;

        const baseScale = (isBig ? 2.5 : 1.0) * (typeof fleetScale !== 'undefined' ? fleetScale : 1.0);
        let s = 1;
        if (progress < 0.2) s = progress * 6;
        else if (progress < 0.6) s = 1.2 - (progress - 0.2) * 0.5;
        else s = 1 - (progress - 0.6) * 0.5;
        ship.scale.set(s * baseScale);
        if (progress < 0.2) ship.alpha = progress * 5;
        else if (progress < 0.6) ship.alpha = 1;
        else ship.alpha = 1 - (progress - 0.6) * 2.5;
    };
    pixiApp.ticker.add(tickerFn);

    setTimeout(() => {
        if (typeof createProjectile === 'function') {
            createProjectile(startX, startY, targetX, targetY, angle, dmg, isBig, projClass, isAuto);
        }
    }, 250);
}
