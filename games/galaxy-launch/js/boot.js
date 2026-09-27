// ==========================================
// GAME BOOTSTRAPPING & INITIALIZATION
// ==========================================

async function bootGame() {
    const statusEl = document.getElementById('loader-status');
    const barEl = document.getElementById('loader-bar');
    const startBtn = document.getElementById('start-btn');
    const barBg = document.querySelector('.loader-bar-bg');

    const setProgress = (p, text) => {
        if (barEl) barEl.style.width = p + '%';
        if (statusEl) statusEl.innerText = text.toUpperCase();
    };

    try {
        setProgress(20, "LOADING FLEET DATA...");
        const shipRes = await fetch(`./data/ships.json?v=${GAME_VERSION}`);
        if (!shipRes.ok) throw new Error(`Ships data failed: ${shipRes.status}`);
        ships = await shipRes.json();

        setProgress(50, "SYNCING BLACK MARKET...");
        const itemRes = await fetch(`./data/items.json?v=${GAME_VERSION}`);
        if (!itemRes.ok) throw new Error(`Items data failed: ${itemRes.status}`);
        itemData = await itemRes.json();

        setProgress(80, "RETRIEVING ARTIFACTS...");
        const artifactRes = await fetch(`./data/artifacts.json?v=${GAME_VERSION}`);
        if (!artifactRes.ok) throw new Error(`Artifacts data failed: ${artifactRes.status}`);
        artifactData = await artifactRes.json();

        setProgress(100, "SYSTEMS READY");
        
        const loadingScreen = document.getElementById('loading-screen');
        
        setTimeout(() => {
            if (barBg) barBg.style.display = 'none';
            if (statusEl) {
                statusEl.innerText = "TOUCH ANYWHERE TO START";
                statusEl.style.color = "var(--neon)";
                statusEl.style.animation = "pulse 1.5s infinite";
            }
            if (startBtn) startBtn.style.display = 'block';
            
            // Add listener to the whole screen
            if (loadingScreen) {
                loadingScreen.style.cursor = 'pointer';
                loadingScreen.addEventListener('click', triggerIntroSequence);
                loadingScreen.addEventListener('touchstart', triggerIntroSequence);
            }
        }, 500);

    } catch (err) {
        console.error("Critical error during bootGame:", err);
        if (statusEl) statusEl.innerText = "CRITICAL FAILURE";
        if (barEl) barEl.style.backgroundColor = "var(--damage)";
        alert("Failed to load game data: " + err.message + "\nPlease check your internet connection and refresh.");
    }
}

let isStarting = false;

function triggerIntroSequence() {
    if (isStarting) return;
    isStarting = true;

    const loadingScreen = document.getElementById('loading-screen');
    const startBtn = document.getElementById('start-btn');
    const content = document.querySelector('.loader-content');
    const shipContainer = document.getElementById('intro-ship-container');
    
    if (typeof playSfx === 'function') {
        playSfx(200, 'sawtooth', 2.0); // Engine start
        setTimeout(() => playSfx(800, 'square', 1.0), 1000); // Warp
    }

    // 1. Hide UI
    if (startBtn) startBtn.style.display = 'none';
    if (content) {
        content.style.transition = 'opacity 0.5s';
        content.style.opacity = '0';
    }

    // 2. Warp Effect (Background Stars)
    const warpInterval = setInterval(() => {
        if (window.pixiStars) {
            window.pixiStars.forEach(star => {
                star.y += star.normY * 50; // Warp speed
                star.scale.y = 5;
                if (star.y > (pixiApp ? pixiApp.screen.height : 1000)) star.y = 0;
            });
        }
    }, 16);

    // 3. Launch Ship
    if (shipContainer) {
        shipContainer.innerHTML = '<div class="intro-ship" style="font-size:50px;">🚀</div>';
        const ship = shipContainer.querySelector('.intro-ship');
        if (ship) ship.style.animation = 'launchCurve 2s ease-in forwards';
    }

    // 4. Transition
    setTimeout(() => {
        clearInterval(warpInterval);
        if (loadingScreen) {
            loadingScreen.style.background = 'white'; // Flash
            loadingScreen.style.transition = 'opacity 1s';
            loadingScreen.style.opacity = '0';
        }
        
        startGameSession();
        
        setTimeout(() => {
            if (loadingScreen) loadingScreen.style.display = 'none';
        }, 1000);
    }, 1800);
}

function startGameSession() {
    if (typeof audioCtx !== 'undefined' && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    // Request Landscape Orientation on Mobile
    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(err => {
            // Silently fail as many devices don't support this without fullscreen
        });
    }

    autoInit();
}

function initGame() {
    loadGame(); 
    
    const verEl = document.getElementById('game-version');
    if (verEl) verEl.innerText = `VERSION: ${GAME_VERSION}`;

    for(let i=0; i<prestigeLevel; i++) {
        if (typeof createPrestigeStar === 'function') createPrestigeStar();
    }

    const visual = document.getElementById('target-visual');
    if (visual) {
        if (bonusType === 1) {
            visual.className = 'planet-bonus';
            document.getElementById('target-name').innerHTML = `🌲 BONUS PLANET 🌲<br><span style="font-size: 0.8em; color: #aaa;">Lv. ${planetLevel}</span>`;
        } else if (bonusType === 2) {
            visual.className = 'planet-machine';
            document.getElementById('target-name').innerHTML = `⚙️ MACHINE WORLD ⚙️<br><span style="font-size: 0.8em; color: #aaa;">Lv. ${planetLevel}</span>`;
        } else {
            visual.className = `planet-${(planetLevel-1) % 6}`;
            if (typeof getPlanetName === 'function') {
                document.getElementById('target-name').innerHTML = `${getPlanetName(planetLevel)}<br><span style="font-size: 0.8em; color: #aaa;">Lv. ${planetLevel}</span>`;
            }
        }
    }
    if (typeof updateUI === 'function') updateUI(); 
    if (typeof decoratePlanet === 'function') decoratePlanet();
    if (typeof renderShipList === 'function') renderShipList();
    if (typeof checkUnlocks === 'function') checkUnlocks(); 
    if (typeof checkFeatureUnlocks === 'function') checkFeatureUnlocks();
    if (typeof updateActiveEffectsUI === 'function') updateActiveEffectsUI();
    if (typeof updateColonyUI === 'function') updateColonyUI();
    if (typeof startColonyLoop === 'function') startColonyLoop();
    if (typeof checkOfflineProgress === 'function') checkOfflineProgress();
    if (typeof startUFOCycle === 'function') startUFOCycle();
    if (typeof startRepairCycle === 'function') startRepairCycle();
    if (typeof reportScore === 'function') reportScore();
    if (typeof setupUpgradeHold === 'function') setupUpgradeHold();

    // Responsive optimization: Minimize Commander on narrow screens
    if (window.innerWidth < 1100) {
        if (typeof minimizePanel === 'function') {
            minimizePanel('unified-commander');
        }
    }
}

function autoInit() {
    // No ID generation needed, just start the game
    initGame();
}

window.pixiStars = window.pixiStars || [];
window.nebulaClouds = window.nebulaClouds || [];

function updateBackgroundTheme() {
    const themes = [
        { name: "Deep Blue", colors: ["#0a0a20", "#02020a"], star: 0xffffff, nebula: 0x00f2fe },
        { name: "Nebula Purple", colors: ["#1a0a20", "#05020a"], star: 0xdda0dd, nebula: 0x8e44ad },
        { name: "Crimson Sector", colors: ["#200a0a", "#0a0202"], star: 0xff6b81, nebula: 0xff4757 },
        { name: "Golden Core", colors: ["#201a0a", "#0a0802"], star: 0xffd700, nebula: 0xf1c40f },
        { name: "Void Edge", colors: ["#050505", "#000000"], star: 0x00ced1, nebula: 0x2c3e50 }
    ];

    const themeIdx = Math.floor((planetLevel - 1) / 10) % themes.length;
    const theme = themes[themeIdx];

    // Update CSS Background
    const starfieldEl = document.getElementById('starfield');
    if (starfieldEl) {
        starfieldEl.style.background = `radial-gradient(circle at center, ${theme.colors[0]} 0%, ${theme.colors[1]} 100%)`;
    }

    // Update PIXI Stars
    window.pixiStars.forEach(star => {
        star.clear();
        const size = Math.random() * 2 + 1;
        star.beginFill(theme.star);
        star.drawCircle(0, 0, size / 2);
        star.endFill();
    });

    // Update or Create Nebula Clouds
    if (window.nebulaClouds.length === 0) {
        for (let i = 0; i < 3; i++) {
            const cloud = new PIXI.Graphics();
            cloud.normX = Math.random(); cloud.normY = Math.random();
            bgLayer.addChildAt(cloud, 0);
            window.nebulaClouds.push(cloud);
        }
    }

    window.nebulaClouds.forEach((cloud, i) => {
        cloud.clear();
        cloud.beginFill(theme.nebula, 0.1);
        cloud.drawCircle(0, 0, 300 + Math.random() * 200);
        cloud.endFill();
        cloud.filters = [new PIXI.BlurFilter(100)];
        cloud.x = cloud.normX * pixiApp.screen.width;
        cloud.y = cloud.normY * pixiApp.screen.height;
    });
}

function initStarfield() {
    if (typeof PIXI === 'undefined') return;
    for(let i=0; i<150; i++) {
        const star = new PIXI.Graphics();
        star.normX = Math.random(); star.normY = Math.random();
        star.x = star.normX * pixiApp.screen.width;
        star.y = star.normY * pixiApp.screen.height;
        star.alpha = 0.5;
        star.twinkleSpeed = (Math.random() * 0.05) + 0.01;
        star.twinkleOffset = Math.random() * Math.PI * 2;
        bgLayer.addChild(star); window.pixiStars.push(star);
    }
    
    updateBackgroundTheme();

    pixiApp.ticker.add(() => {
        const time = Date.now() * 0.001;
        window.pixiStars.forEach(star => {
            star.alpha = 0.3 + (Math.sin(time * star.twinkleSpeed * 100 + star.twinkleOffset) + 1) / 2 * 0.7;
        });
        window.nebulaClouds.forEach((cloud, i) => {
            cloud.x += Math.sin(time * 0.2 + i) * 0.5;
            cloud.y += Math.cos(time * 0.15 + i) * 0.5;
        });
    });
    
    window.addEventListener('resize', () => {
        requestAnimationFrame(() => {
            window.pixiStars.forEach(star => {
                star.x = star.normX * pixiApp.screen.width;
                star.y = star.normY * pixiApp.screen.height;
            });
            window.nebulaClouds.forEach(cloud => {
                cloud.x = cloud.normX * pixiApp.screen.width;
                cloud.y = cloud.normY * pixiApp.screen.height;
            });
        });
    });
}

initStarfield();
bootGame();
