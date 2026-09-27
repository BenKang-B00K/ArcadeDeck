// ==========================================
// ITEM & POTION SYSTEM
// ==========================================

let itemData = {};
let activePotionsPixi = {}; // Store PIXI effects for active potions

async function loadItemData() {
    try {
        const response = await fetch('data/items.json');
        itemData = await response.json();
        console.log("Item data loaded:", itemData);
    } catch (err) {
        console.error("Failed to load item data:", err);
    }
}

function gainPotion(type) {
    const config = itemData[type];
    if (!config) return false;

    if (potions[type] < config.limit) {
        potions[type]++;
        updateActiveEffectsUI();
        if (typeof showEventToast === 'function') showEventToast(`GOT ${config.name}!`, config.color);
        return true;
    } else {
        if (typeof showEventToast === 'function') showEventToast("INVENTORY FULL", "#ff4757");
        return false;
    }
}

function usePotion(type) {
    const config = itemData[type];
    if (!config || potions[type] <= 0) return;

    // skill_no_cd artifact check
    if (getArtifactBonus('skill_no_cd').flat <= 0) {
        potions[type]--;
    } else {
        showEventToast("INFINITY BATTERY ACTIVE!\nNO CHARGE CONSUMED", "var(--gold)");
    }

    const now = Date.now();
    let duration = config.duration;
    duration *= getArtifactBonus('skill_dur').mult;
    duration += getArtifactBonus('buff_dur').flat * 1000;

    // Additive duration: add to current remaining time if already active
    if (activePotions[type] > now) {
        activePotions[type] += duration;
    } else {
        activePotions[type] = now + duration;
    }
    
    updateActiveEffectsUI();
    if (typeof playDrinkSfx === 'function') playDrinkSfx();
    
    // Terminal Feedback
    if (typeof updateTerminalLog === 'function') {
        updateTerminalLog(`STIMULANT ENGAGED: ${config.name}`, config.color);
    }
    
    // Add Pixi.js Screen Effect
    createPotionEffect(type, config.color);
}

function useAllPotions() {
    let usedAny = false;
    for (const type in itemData) {
        if (potions[type] > 0) {
            usePotion(type);
            usedAny = true;
        }
    }
    if (usedAny) {
        showEventToast("ALL SYSTEMS BOOSTED!", "#f1c40f");
    } else {
        showEventToast("NO POTIONS AVAILABLE", "#ff4757");
    }
}

function showPotionTooltip(type) {
    const slot = document.getElementById(`mini-slot-${type}`);
    if (!slot) return;
    
    // Toggle current
    const isShowing = slot.classList.contains('show-tooltip');
    
    // Hide all first
    document.querySelectorAll('.mini-slot').forEach(s => s.classList.remove('show-tooltip'));
    
    // Show if it was hidden
    if (!isShowing) {
        slot.classList.add('show-tooltip');
        // Auto-hide after 3 seconds on mobile
        setTimeout(() => slot.classList.remove('show-tooltip'), 3000);
    }
}


function createPotionEffect(type, colorStr) {
    if (typeof PIXI === 'undefined' || typeof uiLayer === 'undefined' || activePotionsPixi[type]) return;

    let color;
    try {
        color = resolveColor(colorStr);
    } catch(e) {
        color = "#ffffff";
    }

    const border = new PIXI.Graphics();
    
    // Use a blur filter for a softer glow effect if available
    if (PIXI.BlurFilter) {
        const blurFilter = new PIXI.BlurFilter(15);
        border.filters = [blurFilter];
    }

    const drawEffect = () => {
        border.clear();
        const pulse = (Math.sin(Date.now() * 0.003) + 1) / 2;
        const thickness = 40 + pulse * 40;
        const alpha = 0.15 + pulse * 0.15;
        
        border.lineStyle(thickness, color, alpha);
        border.drawRect(0, 0, pixiApp.screen.width, pixiApp.screen.height);
    };

    uiLayer.addChildAt(border, 0); 
    activePotionsPixi[type] = border;

    const tickerFn = () => {
        if (Date.now() >= activePotions[type]) {
            pixiApp.ticker.remove(tickerFn);
            border.destroy();
            delete activePotionsPixi[type];
            updateActiveEffectsUI();
            return;
        }
        drawEffect();
    };

    pixiApp.ticker.add(tickerFn);
}

function updateActiveEffectsUI() {
    const effectsUI = document.getElementById('active-effects-ui');
    if (!effectsUI) return;

    const now = Date.now();
    let hasActive = false;
    const currentActiveIds = new Set();

    // Helper to sync a single effect element
    const syncEffect = (id, icon, name, color, timeLeft, totalDur, desc) => {
        currentActiveIds.add(id);
        let chip = document.getElementById(`effect-chip-${id}`);
        const pct = totalDur ? Math.min(100, (timeLeft / (totalDur / 1000)) * 100) : 0;

        if (!chip) {
            // Create new chip if not exists
            chip = document.createElement('div');
            chip.id = `effect-chip-${id}`;
            chip.className = 'active-effect-chip';
            chip.style.cssText = `
                background: rgba(5, 5, 15, 0.85); 
                border: 1px solid ${color}66; 
                padding: 6px 12px; 
                border-radius: 4px; 
                color: ${color};
                font-size: 11px;
                font-weight: bold;
                display: flex;
                flex-direction: column;
                gap: 2px;
                min-width: 120px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                position: relative;
                overflow: hidden;
                backdrop-filter: blur(5px);
                border-left: 4px solid ${color};
            `;
            chip.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; z-index: 1;">
                    <span class="effect-name">${icon} ${name}</span>
                    <span class="effect-timer" style="color: white; font-family: 'Consolas', monospace; font-size: 10px;">${timeLeft}s</span>
                </div>
                <div class="effect-desc" style="font-size: 9px; color: #fff; opacity: 0.8; z-index: 1;">${desc || ""}</div>
                <div style="width: 100%; height: 2px; background: rgba(255,255,255,0.1); border-radius: 1px; z-index: 1; margin-top: 2px;">
                    <div class="effect-progress" style="width: ${pct}%; height: 100%; background: ${color}; transition: width 0.5s linear; box-shadow: 0 0 5px ${color};"></div>
                </div>
            `;
            effectsUI.appendChild(chip);
        } else {
            // Update existing chip
            const timerEl = chip.querySelector('.effect-timer');
            const progEl = chip.querySelector('.effect-progress');
            if (timerEl) timerEl.innerText = timeLeft + "s";
            if (progEl) progEl.style.width = pct + "%";
        }
    };

    // 1. Process Potions
    for (const type in itemData) {
        const config = itemData[type];
        const countEl = document.getElementById(`count-${type}`);
        const iconEl = document.getElementById(`icon-${type}`);
        const slotEl = document.getElementById(`slot-${type}`);
        const timerEl = document.getElementById(`timer-${type}`);
        
        // Mini Inventory slots
        const miniSlot = document.getElementById(`mini-slot-${type}`);
        if (miniSlot) {
            if (potions[type] > 0) miniSlot.style.display = 'flex';
            else miniSlot.style.display = 'none';
        }
        
        if (countEl) countEl.innerText = potions[type];
        
        if (iconEl) {
            if (potions[type] > 0) iconEl.classList.add('has-item');
            else iconEl.classList.remove('has-item');
        }

        if (now < activePotions[type]) {
            if (slotEl) slotEl.classList.add('active');
            const timeLeft = Math.ceil((activePotions[type] - now) / 1000);
            if (timerEl) timerEl.innerText = timeLeft + "s";
            hasActive = true;
            syncEffect(type, config.icon, config.name.split(' ')[0], config.color, timeLeft, config.duration, config.desc);
        } else {
            if (slotEl) slotEl.classList.remove('active');
            if (timerEl) timerEl.innerText = "";
        }
    }

    // 2. Process Events
    if (typeof activeEvents !== 'undefined') {
        for (const eventId in activeEvents) {
            const ev = activeEvents[eventId];
            if (now < ev.endTime) {
                const timeLeft = Math.ceil((ev.endTime - now) / 1000);
                hasActive = true;
                syncEffect(eventId, ev.icon || "✨", ev.name, ev.color, timeLeft, ev.duration, ev.desc);
            } else {
                delete activeEvents[eventId];
                if (eventId === "supernova") eventDmgMult = 1;
                if (eventId === "click_frenzy") eventClickMult = 1;
                if (eventId === "overclock") eventAutoSpeedMult = 1;
                if (eventId === "void_infusion") eventCritFull = false;
                
                if (eventId === "supernova" || eventId === "click_frenzy") ufoDamageMultiplier = 1; // Legacy support
                if (eventId === "harvest") tempPineBoost = false;
                if (typeof updateUI === 'function') updateUI();
            }
        }
    }

    // 3. Cleanup expired chips
    Array.from(effectsUI.children).forEach(chip => {
        const id = chip.id.replace('effect-chip-', '');
        if (!currentActiveIds.has(id)) {
            chip.remove();
        }
    });

    if (hasActive && !window.potionLoopId) {
        window.potionLoopId = setTimeout(() => {
            window.potionLoopId = null;
            updateActiveEffectsUI();
        }, 500);
    }
}
