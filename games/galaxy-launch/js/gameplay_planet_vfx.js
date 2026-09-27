// ==========================================
// PLANET VFX (Decorations & Pixi Layers)
// ==========================================

// Pixi.js Planet Layers
const pixiPlanetContainer = new PIXI.Container();
const pixiPlanetGlow = new PIXI.Container();
const pixiPlanetBase = new PIXI.Graphics();
const pixiPlanetSurface = new PIXI.Container();
const pixiPlanetClouds = new PIXI.Container();
const pixiPlanetShadow = new PIXI.Container(); // Explicit Shadow Layer
const pixiPlanetDeco = new PIXI.Container();
const pixiPlanetMask = new PIXI.Graphics();

planetLayer.addChild(pixiPlanetGlow);
planetLayer.addChild(pixiPlanetContainer);
pixiPlanetContainer.addChild(pixiPlanetBase);
pixiPlanetContainer.addChild(pixiPlanetSurface);
pixiPlanetContainer.addChild(pixiPlanetClouds);
pixiPlanetContainer.addChild(pixiPlanetShadow); // Shadow sits above clouds
pixiPlanetContainer.addChild(pixiPlanetDeco);
pixiPlanetContainer.addChild(pixiPlanetMask);

pixiPlanetSurface.mask = pixiPlanetMask;
pixiPlanetClouds.mask = pixiPlanetMask;
pixiPlanetShadow.mask = pixiPlanetMask; // Shadow is also masked to the planet

const cssPlanet = document.getElementById('target-visual');
if (cssPlanet) cssPlanet.style.opacity = '0';

function decoratePlanet() {
    const radius = 100;
    pixiPlanetGlow.removeChildren();
    pixiPlanetBase.clear();
    pixiPlanetSurface.removeChildren();
    pixiPlanetClouds.removeChildren();
    pixiPlanetShadow.removeChildren();
    pixiPlanetDeco.removeChildren();
    pixiPlanetMask.clear();

    pixiPlanetMask.beginFill(0xffffff);
    pixiPlanetMask.drawCircle(0, 0, radius);
    pixiPlanetMask.endFill();

    // 1. Atmospheric Atmosphere (Enhanced Glow)
    let themeColor = 0x00f2fe;
    let secondaryColor = 0x2980b9;
    
    if (planetLevel % 10 === 0) { themeColor = 0xff4757; secondaryColor = 0x922b21; }
    else if (bonusType === 1) { themeColor = 0x2ecc71; secondaryColor = 0xf1c40f; }
    else if (bonusType === 2) { themeColor = 0x95a5a6; secondaryColor = 0x34495e; }

    for(let i=4; i>0; i--) {
        const glow = new PIXI.Graphics();
        const alpha = 0.15 / i;
        glow.beginFill(themeColor, alpha);
        glow.drawCircle(0, 0, radius + (i * 15));
        glow.endFill();
        pixiPlanetGlow.addChild(glow);
    }

    // 2. Base Sphere
    pixiPlanetBase.beginFill(secondaryColor);
    pixiPlanetBase.drawCircle(0, 0, radius);
    pixiPlanetBase.endFill();

    // 3. Dynamic Terrain & Features
    if (planetLevel % 10 === 0) {
        pixiPlanetBase.beginFill(0x1a1a1a);
        pixiPlanetBase.drawCircle(0, 0, radius);
        pixiPlanetBase.endFill();

        for(let i=0; i<20; i++) {
            const lava = new PIXI.Graphics();
            lava.beginFill(0xff4757, 0.7);
            lava.drawRoundedRect(0, 0, Math.random()*80+40, 6, 3);
            lava.endFill();
            lava.x = (Math.random()-0.5) * radius * 2.5;
            lava.y = (Math.random()-0.5) * radius * 2;
            lava.rotation = Math.random() * 0.2;
            lava.blendMode = PIXI.BLEND_MODES.ADD;
            pixiPlanetSurface.addChild(lava);
        }
    } else if (bonusType === 1) {
        pixiPlanetBase.beginFill(0x2ecc71);
        pixiPlanetBase.drawCircle(0, 0, radius);
        pixiPlanetBase.endFill();

        for(let i=0; i<15; i++) {
            const patch = new PIXI.Graphics();
            patch.beginFill(0x27ae60);
            patch.drawEllipse(0, 0, Math.random()*40+20, Math.random()*25+10);
            patch.endFill();
            patch.x = (Math.random()-0.5) * radius * 2.5;
            patch.y = (Math.random()-0.5) * radius * 2;
            pixiPlanetSurface.addChild(patch);
        }
        
        for(let i=0; i<10; i++) {
            const leaf = new PIXI.Text('🍃', { fontSize: 12 + Math.random()*8 });
            leaf.anchor.set(0.5);
            leaf.x = (Math.random()-0.5) * radius * 1.8;
            leaf.y = (Math.random()-0.5) * radius * 1.8;
            leaf.rotation = Math.random() * Math.PI;
            pixiPlanetDeco.addChild(leaf);
        }
    } else if (bonusType === 2) {
        pixiPlanetBase.beginFill(0x2c3e50);
        pixiPlanetBase.drawCircle(0, 0, radius);
        pixiPlanetBase.endFill();

        const grid = new PIXI.Graphics();
        grid.lineStyle(1, themeColor, 0.2);
        for(let i=-radius*1.5; i<=radius*1.5; i+=25) {
            grid.moveTo(i, -radius); grid.lineTo(i, radius);
            grid.moveTo(-radius, i); grid.lineTo(radius, i);
        }
        pixiPlanetSurface.addChild(grid);

        for(let i=0; i<6; i++) {
            const light = new PIXI.Graphics();
            light.beginFill(themeColor, 0.8);
            light.drawCircle(0, 0, 3);
            light.endFill();
            light.x = (Math.random()-0.5) * radius * 1.5;
            light.y = (Math.random()-0.5) * radius * 1.5;
            pixiPlanetDeco.addChild(light);
            pixiApp.ticker.add(() => { if(!light.destroyed) light.alpha = 0.3 + Math.random()*0.7; });
        }
    } else {
        const colors = [0x3498db, 0xe74c3c, 0x9b59b6, 0x1abc9c, 0xf39c12, 0xd35400];
        const color = colors[(planetLevel - 1) % colors.length];
        pixiPlanetBase.beginFill(color);
        pixiPlanetBase.drawCircle(0, 0, radius);
        pixiPlanetBase.endFill();

        for(let i=0; i<12; i++) {
            const detail = new PIXI.Graphics();
            detail.beginFill(0x000000, 0.15);
            detail.drawCircle(0, 0, Math.random()*30+10);
            detail.endFill();
            detail.x = (Math.random()-0.5) * radius * 2.5;
            detail.y = (Math.random()-0.5) * radius * 2;
            pixiPlanetSurface.addChild(detail);
        }
    }

    // 4. Cloud Layer
    for(let i=0; i<8; i++) {
        const cloud = new PIXI.Graphics();
        cloud.beginFill(0xffffff, 0.3);
        cloud.drawEllipse(0, 0, Math.random()*50+30, Math.random()*15+5);
        cloud.endFill();
        cloud.x = (Math.random()-0.5) * radius * 3;
        cloud.y = (Math.random()-0.5) * radius * 1.5;
        pixiPlanetClouds.addChild(cloud);
    }

    // 5. Fixed Resolution-Safe Shadow Overlay
    for(let i=1; i<=8; i++) {
        const shadow = new PIXI.Graphics();
        shadow.beginFill(0x000000, 0.08);
        const offset = (radius * 0.1) * i;
        shadow.drawCircle(offset, offset, radius);
        shadow.endFill();
        pixiPlanetShadow.addChild(shadow);
    }
}

// Multi-speed Rotation Ticker
pixiApp.ticker.add((delta) => {
    pixiPlanetSurface.children.forEach(child => {
        child.x -= 0.3 * delta;
        if (child.x < -200) child.x = 200;
    });
    pixiPlanetClouds.children.forEach(child => {
        child.x -= 0.6 * delta;
        if (child.x < -250) child.x = 250;
    });
    pixiPlanetDeco.children.forEach(child => {
        if (child instanceof PIXI.Text) {
            child.rotation += 0.01 * delta;
        }
    });
});
