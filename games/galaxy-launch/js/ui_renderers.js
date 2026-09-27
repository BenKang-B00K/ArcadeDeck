// ==========================================
// UI: RENDERERS (List, Toasts)
// ==========================================

function renderShipList() {
    const container = document.getElementById('ships-container');
    if (!container) return;
    container.innerHTML = '';
    
    let maxUnlockedIdx = -1;
    for(let i=0; i<ships.length; i++) {
        if (totalClicks >= (typeof getShipReq === 'function' ? getShipReq(ships[i].baseReq) : ships[i].baseReq)) {
            maxUnlockedIdx = i;
        }
    }

    const showLimit = Math.min(ships.length, maxUnlockedIdx + 2);

    for(let i=0; i<showLimit; i++) {
        const ship = ships[i];
        const currentReq = typeof getShipReq === 'function' ? getShipReq(ship.baseReq) : ship.baseReq;
        const isUnlocked = i <= maxUnlockedIdx;
        const slot = document.createElement('div');
        
        let cssClass = 'ship-slot';
        if (!isUnlocked) cssClass += ' locked';
        if (currentShipIdx === i) cssClass += ' selected';
        if (i === maxUnlockedIdx) cssClass += ' latest';

        slot.className = cssClass;
        const dmgText = isUnlocked ? `Dmg: ${ship.dmg.toLocaleString()}` : `Req: ${currentReq.toLocaleString()} Clicks`;
        slot.innerHTML = `
            <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:20px;">${isUnlocked ? ship.icon : '🔒'}</span>
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-weight:bold; font-size:12px;">${ship.name} ${i===maxUnlockedIdx ? '<span style="color:var(--gold); font-size:9px;">(BEST)</span>' : ''}</span>
                        <span style="font-size:10px; color:#aaa;">${dmgText}</span>
                    </div>
                </div>
                ${isUnlocked ? `<span style="font-size:9px; color:${currentShipIdx===i ? 'var(--neon)' : '#555'};">${currentShipIdx===i ? '[ACTIVE]' : '[SELECT]'}</span>` : ''}
            </div>
        `;
        
        if (isUnlocked) slot.onclick = () => { 
            currentShipIdx = i; 
            renderShipList(); 
            if (typeof updateUI === 'function') updateUI(); 
            if (typeof saveGame === 'function') saveGame();
        };
        container.appendChild(slot);
    }
}

function renderLobbyArtifacts() {
    const container = document.getElementById('lobby-artifact-display');
    if (!container) return;
    
    // Only re-render if count changed to avoid flickering
    const currentCount = container.children.length;
    if (currentCount === acquiredArtifacts.length) return;
    
    container.innerHTML = '';
    
    const count = acquiredArtifacts.length;
    if (count === 0) return;
    
    acquiredArtifacts.forEach((artId, index) => {
        const data = artifactData[artId];
        if (!data) return;
        
        const icon = document.createElement('div');
        icon.className = 'lobby-artifact-icon';
        icon.innerText = data.icon;
        icon.title = data.name;
        
        // Calculate Angle: Start at 12 o'clock (-90 degrees) and rotate clockwise
        const angleStep = 360 / count;
        const angleDeg = -90 + (index * angleStep);
        const angleRad = angleDeg * (Math.PI / 180);
        
        icon.style.setProperty('--angle', `${angleRad}rad`);
        container.appendChild(icon);
    });
}

function showUnlockToast(shipName) {
    if (typeof PIXI === 'undefined' || typeof uiLayer === 'undefined') return;
    const toast = new PIXI.Text(`NEW SHIP UNLOCKED: ${shipName}`, {
        fontFamily: 'Consolas, monospace',
        fontSize: 20,
        fill: 0xffffff,
        fontWeight: 'bold',
        align: 'center',
        dropShadow: true,
        dropShadowColor: 0xff00ff,
        dropShadowBlur: 10,
        dropShadowDistance: 0
    });
    toast.anchor.set(0.5);
    toast.x = pixiApp.screen.width / 2;
    toast.y = pixiApp.screen.height * 0.15; 

    uiLayer.addChild(toast);

    const duration = 3000;
    const startTime = Date.now();
    const startY = toast.y;

    const tickerFn = () => {
        const elapsed = Date.now() - startTime;
        let progress = elapsed / duration;
        
        if (progress >= 1) {
            pixiApp.ticker.remove(tickerFn);
            toast.destroy();
            return;
        }

        if (progress < 0.2) {
            toast.alpha = progress / 0.2;
            toast.y = startY - 20 + (progress / 0.2) * 20;
        } else if (progress < 0.8) {
            toast.alpha = 1;
            toast.y = startY;
        } else {
            const p = (progress - 0.8) / 0.2;
            toast.alpha = 1 - p;
            toast.y = startY - p * 20;
        }
    };
    pixiApp.ticker.add(tickerFn);
}
