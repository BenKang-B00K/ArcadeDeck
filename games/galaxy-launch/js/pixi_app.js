// ==========================================
// PIXI.JS APPLICATION SETUP
// ==========================================

// Global PIXI Application
const pixiApp = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundAlpha: 0, // Transparent to show CSS gradient
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    resizeTo: window,
    eventMode: 'passive'
});

// Add the Pixi.js canvas to the DOM
pixiApp.view.style.position = 'fixed';
pixiApp.view.style.top = '0';
pixiApp.view.style.left = '0';
pixiApp.view.style.zIndex = '5'; // Above background, below UI panels
pixiApp.view.id = 'pixi-canvas';
document.body.appendChild(pixiApp.view);

// --- Layers (Containers) ---
pixiApp.stage.eventMode = 'static';
pixiApp.stage.hitArea = pixiApp.screen;

// 1. Background Layer (Starfield)
const bgLayer = new PIXI.Container();
bgLayer.eventMode = 'none'; // Background shouldn't block anything
pixiApp.stage.addChild(bgLayer);

// 2. Projectile Layer
const projectileLayer = new PIXI.Container();
projectileLayer.eventMode = 'none';
pixiApp.stage.addChild(projectileLayer);

// 3. Planet Layer
const planetLayer = new PIXI.Container();
planetLayer.eventMode = 'none'; // Clicks pass through to stage
pixiApp.stage.addChild(planetLayer);

// 4. Ship Layer
const shipLayer = new PIXI.Container();
shipLayer.eventMode = 'none';
pixiApp.stage.addChild(shipLayer);

// 5. Effects Layer (Explosions, Debris, Hit effects)
const effectsLayer = new PIXI.Container();
effectsLayer.eventMode = 'none';
pixiApp.stage.addChild(effectsLayer);

// 6. UI / Text Layer (Toasts, Floating numbers, UFOs)
const uiLayer = new PIXI.Container();
uiLayer.eventMode = 'static'; // Must be static to catch UFO/Drone clicks
pixiApp.stage.addChild(uiLayer);

// Handle window resize for custom logic if needed
window.addEventListener('resize', () => {
    // Force Pixi to resize immediately to get the correct dimensions on mobile orientation changes
    pixiApp.renderer.resize(window.innerWidth, window.innerHeight);
    
    requestAnimationFrame(() => {
        // Center the planet layer
        planetLayer.x = pixiApp.screen.width / 2;
        planetLayer.y = pixiApp.screen.height / 2;

        // Dynamic Scaling: Ensure the planet fits between sidebars
        const uiWidth = window.innerWidth < 800 ? 180 : 240;
        const basePlanetSize = 300; 
        
        // If the screen is too narrow or too short, scale the planet down
        const scaleW = Math.min(1, (window.innerWidth * 0.6) / basePlanetSize);
        const scaleH = Math.min(1, (window.innerHeight * 0.4) / basePlanetSize);
        const targetScale = Math.min(scaleW, scaleH);
        
        planetLayer.scale.set(Math.max(0.4, targetScale));

        // Update global fleet scale based on resolution
        // Smoother scaling: uses 1600px as a mid-point reference
        const resScale = Math.min(1.1, Math.max(0.75, window.innerWidth / 1600));
        fleetScale = resScale;

        // Apply UI Scale to CSS variable
        document.documentElement.style.setProperty('--ui-scale', resScale.toString());
    });
});

// Initial call to set scale correctly on first load
window.dispatchEvent(new Event('resize'));

// Initial positioning
planetLayer.x = pixiApp.screen.width / 2;
planetLayer.y = pixiApp.screen.height / 2;
