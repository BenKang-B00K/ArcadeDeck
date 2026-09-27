// ==========================================
// EVENTS: DRONE & ROBOT SYSTEM
// ==========================================

function createRobotByType(type) {
    if (typeof PIXI === 'undefined') return new PIXI.Container();
    
    const container = new PIXI.Container();
    const body = new PIXI.Graphics();
    const eye = new PIXI.Graphics();
    container.addChild(body);
    container.addChild(eye);

    if (type === "GUARDIAN") {
        body.lineStyle(3, 0xf1c40f); body.beginFill(0x2c3e50);
        body.drawRect(-30, -30, 60, 60); body.endFill();
        eye.beginFill(0xf1c40f); eye.drawCircle(0, 0, 8); eye.endFill();
    } else if (type === "LEECH") {
        body.lineStyle(2, 0x2ecc71); body.beginFill(0x1a1a2e);
        body.drawPolygon([-20, -40, 20, -40, 30, 0, 0, 20, -30, 0]); body.endFill();
        eye.beginFill(0x2ecc71); eye.drawCircle(0, -10, 5); eye.endFill();
    } else if (type === "SABOTEUR") {
        body.lineStyle(2, 0xff00ff); body.beginFill(0x000000);
        body.drawCircle(0, 0, 35); body.endFill();
        eye.beginFill(0xff00ff); eye.drawRect(-15, -5, 30, 10); eye.endFill();
    } else if (type === "HACKER") {
        body.lineStyle(2, 0x3498db); body.beginFill(0x1a1a2e);
        body.drawPolygon([-25,-25, 25,-25, 25,25, -25,25]); body.endFill();
        // Matrix-like eye
        eye.beginFill(0x3498db); eye.drawRect(-10, -15, 4, 30); eye.drawRect(5, -15, 4, 30); eye.endFill();
    } else if (type === "COLONIZER") {
        body.lineStyle(2, 0xe67e22); body.beginFill(0x2c3e50);
        body.drawEllipse(0, 0, 40, 25); body.endFill();
        eye.beginFill(0xe67e22); eye.drawCircle(0, 0, 12); eye.endFill();
    } else if (type === "NULLIFIER") {
        body.lineStyle(2, 0x9b59b6); body.beginFill(0x000000);
        body.drawPolygon([0,-40, 35,0, 0,40, -35,0]); body.endFill();
        eye.beginFill(0x9b59b6); eye.drawCircle(0, 0, 6); eye.endFill();
    } else {
        body.lineStyle(2, 0xff4757); body.beginFill(0x1a1a2e);
        body.drawCircle(0, 0, 25); body.endFill();
        eye.beginFill(0xff4757); eye.drawCircle(0, 0, 5); eye.endFill();
    }
    
    container.eye = eye;
    return container;
}

function spawnRepairDrone() {
    if (typeof PIXI === 'undefined') return;
    if (planetLevel < 10) return; // Restriction: No Drones before Level 10
    
    if (typeof playRobotSfx === 'function') playRobotSfx();

    const rand = Math.random();
    let robotType = "REPAIR";
    let droneHp = 3; // Default HP

    if (rand < 0.10) { robotType = "GUARDIAN"; droneHp = 8; }
    else if (rand < 0.20) { robotType = "LEECH"; droneHp = 5; }
    else if (rand < 0.30) { robotType = "SABOTEUR"; droneHp = 6; }
    else if (rand < 0.45) { robotType = "HACKER"; droneHp = 5; }
    else if (rand < 0.60) { robotType = "COLONIZER"; droneHp = 4; }
    else if (rand < 0.75) { robotType = "NULLIFIER"; droneHp = 6; }

    const drone = createRobotByType(robotType);
    drone.robotType = robotType;
    
    // Apply Artifact: Drone HP (e.g., Plasma Shield -50% HP)
    droneHp *= getArtifactBonus('drone_hp').mult;
    drone.hp = Math.max(1, Math.floor(droneHp));
    drone.maxHp = Math.max(1, Math.floor(droneHp));

    // Random offset to spawn multiple drones separately
    drone.x = (pixiApp.screen.width / 2) + (Math.random() * 600 - 300);
    drone.y = -150 - (Math.random() * 200);
    drone.eventMode = 'static';
    drone.cursor = 'pointer';
    drone.hitArea = new PIXI.Circle(0, 0, 60);
    
    if (typeof uiLayer !== 'undefined') uiLayer.addChild(drone);

    // HP Bar initialization
    if (typeof createHpBar === 'function') {
        createHpBar(drone, 60, 6);
    }

    if (robotType === "REPAIR") {
        startHealing(drone);
    } else if (robotType === "GUARDIAN") {
        isShieldDroneActive = true;
        showEventToast("SHIELD DRONE ACTIVE!\nPLANET PROTECTED", "#f1c40f");
        if (typeof createBossShield === 'function') createBossShield(999999); 
    } else if (robotType === "LEECH") {
        leechRate = Math.floor(stardust * 0.05 + 10);
        pinesLeechRate = Math.floor(totalPines * 0.05 + 5);
        gearsLeechRate = Math.max(1, Math.floor(gears * 0.02));
        dmLeechRate = Math.max(0.1, darkMatter * 0.01);
        showEventToast("LEECH DRONE DETECTED!\nDRAINING ALL RESOURCES", "#2ecc71");
    } else if (robotType === "SABOTEUR") {
        isSaboteurActive = true;
        showEventToast("SABOTEUR ACTIVE!\nCRITICAL SYSTEMS OFFLINE", "#ff00ff");
    } else if (robotType === "HACKER") {
        isHackerActive = true;
        showEventToast("HACKER DETECTED!\nDOWNGRADING UPGRADES", "#3498db");
    } else if (robotType === "COLONIZER") {
        isColonizerActive = true;
        showEventToast("COLONIZER DETECTED!\nCONSTRUCTION SLOWDOWN", "#e67e22");
    } else if (robotType === "NULLIFIER") {
        isNullifierActive = true;
        showEventToast("NULLIFIER ACTIVE!\nCRIT DAMAGE RESET", "#9b59b6");
    }

    drone.on('pointerdown', (e) => {
        e.stopPropagation();
        
        drone.hp--;
        
        // Update HP Bar visual
        if (typeof updateHpBar === 'function') {
            updateHpBar(drone, drone.hp, drone.maxHp, (drone.hp / drone.maxHp > 0.3) ? 0x00f2fe : 0xff4757);
        }

        // Hit Visual Effect
        if (typeof createStardustPop === 'function') {
            createStardustPop(drone.x, drone.y, true);
        }
        
        // Shake/Scale Juice
        drone.scale.set(0.8);
        setTimeout(() => { if(!drone.destroyed) drone.scale.set(1.0); }, 50);

        if (drone.hp > 0) {
            if (typeof playSfx === 'function') playSfx(400, "square", 0.1);
            return;
        }

        destroyRepairDrone(drone, true);
    });
    
    const startTime = Date.now();
    const phaseOffset = Math.random() * 10000;
    let lastHackerTick = 0;
    
    const tickerFn = () => {
        if (drone.destroyed) { pixiApp.ticker.remove(tickerFn); return; }
        const elapsed = (Date.now() - startTime) + phaseOffset;
        
        if (robotType === "GUARDIAN") {
            // Speed matched to normal drone speed (0.001x, 0.002x)
            drone.x = (pixiApp.screen.width / 2) + Math.cos(elapsed * 0.001) * (pixiApp.screen.width * 0.4);
            drone.y = (pixiApp.screen.height / 2) + Math.sin(elapsed * 0.002) * (pixiApp.screen.height * 0.4);
            drone.rotation += 0.1;
        } else if (robotType === "COLONIZER") {
            // Smooth circular orbit around planet
            const radius = 220;
            const speed = 0.001;
            drone.x = (pixiApp.screen.width / 2) + Math.cos(elapsed * speed) * radius;
            drone.y = (pixiApp.screen.height / 2) + Math.sin(elapsed * speed) * radius;
            drone.rotation = (elapsed * speed) + Math.PI/2;
        } else if (robotType === "NULLIFIER") {
            // Elliptical orbit
            const radiusX = 280;
            const radiusY = 180;
            const speed = 0.0008;
            drone.x = (pixiApp.screen.width / 2) + Math.sin(elapsed * speed) * radiusX;
            drone.y = (pixiApp.screen.height / 2) + Math.cos(elapsed * speed) * radiusY;
            drone.rotation -= 0.02;
        } else {
            drone.y = 150 + Math.sin(elapsed * 0.002) * 50;
            drone.x = (pixiApp.screen.width / 2) + Math.cos(elapsed * 0.001) * 250 + Math.sin(elapsed * 0.0005) * 100;
        }
        
        if (robotType === "LEECH") {
            if (elapsed % 1000 < 20) {
                stardust = Math.max(0, stardust - (leechRate || 0));
                totalPines = Math.max(0, totalPines - (pinesLeechRate || 0));
                gears = Math.max(0, gears - (gearsLeechRate || 0));
                darkMatter = Math.max(0, darkMatter - (dmLeechRate || 0));
                if (typeof updateUI === 'function') updateUI();
            }
        }
        
        if (robotType === "HACKER" && isHackerActive) {
            if (elapsed - lastHackerTick > 500) {
                lastHackerTick = elapsed;
                downgradeRandomUpgrade();
            }
        }
        
        drone.eye.alpha = 0.5 + Math.sin(elapsed * 0.01) * 0.5;
    };
    pixiApp.ticker.add(tickerFn);
}

function downgradeRandomUpgrade() {
    const categories = ['click', 'auto', 'autoSpeed', 'autoPower', 'shipReinforce', 'critChance'];
    const valid = categories.filter(key => upgrades[key] && upgrades[key].lv > 1);
    if (valid.length > 0) {
        const key = valid[Math.floor(Math.random() * valid.length)];
        upgrades[key].lv--;
        if (typeof updateUI === 'function') updateUI();
        if (typeof updateTerminalLog === 'function') updateTerminalLog(`SYSTEM BREACH: ${key.toUpperCase()} DOWNGRADED`, "#e74c3c");
    }
}

function startRepairCycle() {
    if (window.repairCycleTimer) clearTimeout(window.repairCycleTimer);
    
    let time = Math.random() * 30000 + 40000;
    
    // Eng Bay Upgrade: Drone Beacon (Decreases time, MORE drones = more gears)
    if (upgrades.droneFreq && upgrades.droneFreq.lv > 0) {
        time -= (upgrades.droneFreq.lv * 500); // 0.5s per level
    }

    // Artifact: Nano Bots (Decreases frequency, LESS drones = less annoyance)
    time /= getArtifactBonus('drone_freq').mult;
    
    time = Math.max(8000, time); // Floor for safety

    window.repairCycleTimer = setTimeout(() => {
        // Spawn 1 to 3 drones
        const count = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < count; i++) {
            setTimeout(() => spawnRepairDrone(), i * 1000);
        }
        startRepairCycle();
    }, time);
}

function startHealing(drone) {
    const healInterval = setInterval(() => {
        if (drone.destroyed) { 
            clearInterval(healInterval); 
            return; 
        }
        if (hp < maxHp && !isLevelingUp) {
            hp = Math.min(maxHp, hp + Math.floor(maxHp * 0.1));
            if (typeof updateUI === 'function') updateUI(); 
            if (typeof playSfx === 'function') playSfx(600, "sine", 0.5);
        }
    }, 2000);
}

function destroyRepairDrone(drone, giveReward) {
    const robotType = drone.robotType;
    
    if (drone.impact) drone.impact.destroy();
    if (typeof createExplosion === 'function') {
        createExplosion(drone.x, drone.y);
    }
    
    drone.destroy();

    // Check if other drones of the same type still exist before resetting global flags
    const otherDrones = uiLayer.children.filter(c => c !== drone && c.robotType === robotType);
    if (otherDrones.length === 0) {
        if (robotType === "GUARDIAN") {
            isShieldDroneActive = false;
            bossShieldActive = false; 
        } else if (robotType === "LEECH") {
            leechRate = 0; pinesLeechRate = 0; gearsLeechRate = 0; dmLeechRate = 0;
        } else if (robotType === "SABOTEUR") {
            isSaboteurActive = false;
        } else if (robotType === "HACKER") {
            isHackerActive = false;
        } else if (robotType === "COLONIZER") {
            isColonizerActive = false;
        } else if (robotType === "NULLIFIER") {
            isNullifierActive = false;
        }
    }
    
    if (giveReward) {
        let gearReward = 3;
        if (robotType === "GUARDIAN") gearReward = 10;
        else if (["SABOTEUR", "NULLIFIER"].includes(robotType)) gearReward = 6;
        else if (["LEECH", "HACKER", "COLONIZER"].includes(robotType)) gearReward = 5;

        gears += gearReward;
        
        let dmBonus = 0;
        if (Math.random() < 0.10) {
            dmBonus = Math.floor(planetLevel * 0.5) + 1;
            darkMatter += dmBonus;
        }

        totalDronesDestroyed++;
        if (typeof updateMissionProgress === 'function') updateMissionProgress('drones', 1);
        if (typeof updateUI === 'function') updateUI();
        
        const bonusMsg = dmBonus > 0 ? `\n+${dmBonus} 🔮 BONUS!` : "";
        showEventToast(`DRONE DESTROYED!\n+${gearReward} ⚙️${bonusMsg}`, "#95a5a6");
    }
}
