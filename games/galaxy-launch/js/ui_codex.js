// ==========================================
// UI: CODEX SYSTEM (UFO & DRONES) - ENHANCED
// ==========================================

const UFO_DATA = {
    "NORMAL": { name: "NORMAL UFO", desc: "Standard interstellar traveler. Intercept for a random space event.", color: "#00f2fe" },
    "GOLDEN": { name: "GOLDEN UFO", desc: "A rare merchant vessel carrying immense wealth. Intercept for massive Stardust.", color: "#f1c40f" },
    "RELIC_HUNTER": { name: "RELIC HUNTER", desc: "Ancient technology seekers. Intercept to secure a rare Artifact.", color: "#ffffff" },
    "MOTHERSHIP": { name: "MOTHERSHIP", desc: "A heavy command vessel. Intercept to trigger multiple space events.", color: "#ff4757" },
    "WRAITH": { name: "WRAITH", desc: "A ghostly entity from the void. Intercept for Dark Matter.", color: "#8e44ad" }
};

const DRONE_DATA = {
    "REPAIR": { name: "REPAIR DRONE", desc: "Standard machine unit. Periodically repairs the planet's health.", color: "#ff4757" },
    "GUARDIAN": { name: "GUARDIAN DRONE", desc: "Defense specialist. Projects a nearly impenetrable shield over the planet.", color: "#f1c40f" },
    "LEECH": { name: "LEECH DRONE", desc: "Resource scavenger. Drains Stardust, Pines, and Gears every second.", color: "#2ecc71" },
    "SABOTEUR": { name: "SABOTEUR DRONE", desc: "System infiltrator. Disables critical fleet weapons and abilities.", color: "#ff00ff" },
    "HACKER": { name: "HACKER DRONE", desc: "Cyber-terrorist. Remotely downgrades your fleet's active upgrades.", color: "#3498db" },
    "COLONIZER": { name: "COLONIZER DRONE", desc: "Expansion unit. Significantly slows down all construction and research.", color: "#e67e22" },
    "NULLIFIER": { name: "NULLIFIER DRONE", desc: "Energy damper. Resets Critical Strike progress and multipliers.", color: "#9b59b6" }
};

const codexIconCache = {};

function toggleUfoCodex() {
    const modal = document.getElementById('ufo-codex');
    if (modal && modal.style.display === 'none') {
        renderUfoDroneCodex('ufo-codex-grid', UFO_DATA, 'ufo');
        modal.style.display = 'flex';
    } else if (modal) {
        modal.style.display = 'none';
    }
}

function toggleDroneCodex() {
    const modal = document.getElementById('drone-codex');
    if (modal && modal.style.display === 'none') {
        renderUfoDroneCodex('drone-codex-grid', DRONE_DATA, 'drone');
        modal.style.display = 'flex';
    } else if (modal) {
        modal.style.display = 'none';
    }
}

async function renderUfoDroneCodex(gridId, data, type) {
    const grid = document.getElementById(gridId);
    if (!grid) {
        console.warn(`Codex grid element not found: ${gridId}`);
        return;
    }
    grid.innerHTML = '';
    
    for (const key of Object.keys(data)) {
        const item = data[key];
        const itemEl = document.createElement('div');
        itemEl.className = 'codex-item compact';
        
        // Generate or get cached icon
        const iconSrc = await getCodexIcon(key, type);
        
        itemEl.innerHTML = `
            <div class="codex-item-icon-container">
                <img src="${iconSrc}" class="codex-mini-icon">
            </div>
            <div class="codex-item-info">
                <div class="codex-item-name" style="color: ${item.color}">${item.name}</div>
                <div class="codex-item-desc">${item.desc}</div>
            </div>
        `;
        grid.appendChild(itemEl);
    }
}

async function getCodexIcon(key, category) {
    const cacheKey = `${category}_${key}`;
    if (codexIconCache[cacheKey]) return codexIconCache[cacheKey];

    if (typeof PIXI === 'undefined' || !pixiApp) return "";

    let container;
    if (category === 'ufo') {
        container = createUFOByType(key);
    } else {
        container = createRobotByType(key);
    }

    // Set preview state
    container.position.set(50, 50);
    container.scale.set(0.6); // Mini version scale
    
    // Some effects might need alpha adjustment for static preview
    if (container.glow) container.glow.alpha = 0.5;
    
    // Create a temporary stage to render the graphic
    const renderTexture = PIXI.RenderTexture.create({ width: 100, height: 100 });
    pixiApp.renderer.render(container, { renderTexture });
    
    // Extract as base64
    const base64 = await pixiApp.renderer.extract.base64(renderTexture);
    
    // Cleanup
    renderTexture.destroy(true);
    container.destroy({ children: true });
    
    codexIconCache[cacheKey] = base64;
    return base64;
}
