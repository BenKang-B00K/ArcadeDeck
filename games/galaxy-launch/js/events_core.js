// ==========================================
// EVENTS: CORE SYSTEM & TOASTS
// ==========================================

function triggerRandomEvent() {
    const events = [
        { id: "supernova", name: "SUPERNOVA", desc: "10X TOTAL DAMAGE", color: "#f1c40f", dur: 15000, icon: "💥" },
        { id: "click_frenzy", name: "CLICK FRENZY", desc: "25X CLICK DAMAGE", color: "#ff00ff", dur: 15000, icon: "⚡" },
        { id: "overclock", name: "SYSTEM OVERCLOCK", desc: "4X AUTO-SPEED", color: "#00f2fe", dur: 20000, icon: "⚙️" },
        { id: "void_infusion", name: "VOID INFUSION", desc: "+100% CRIT + 2X CRIT DMG", color: "#8e44ad", dur: 15000, icon: "🔮" },
        { id: "stardust_tsunami", name: "STARDUST TSUNAMI", desc: "GAINED 25% ENERGY", color: "#00f2fe", instant: true },
        { id: "temp_rift", name: "TEMPORAL RIFT", desc: "2X TOTAL DAMAGE", color: "#00ced1", dur: 30000, icon: "⏳" },
        { id: "res_collapse", name: "RESOURCE COLLAPSE", desc: "MASSIVE LOGISTICS GAIN", color: "#2ecc71", instant: true }
    ];
    
    const event = events[Math.floor(Math.random() * events.length)];
    
    if (event.instant) {
        if (event.id === "stardust_tsunami") {
            const gain = Math.floor(maxHp * 0.25);
            stardust += gain; 
            grossStardust += gain;
            if (typeof createTsunamiVFX === 'function') createTsunamiVFX();
        } else if (event.id === "res_collapse") {
            const pGain = 100 + (planetLevel * 5);
            const gGain = 10 + Math.floor(planetLevel * 0.5);
            const dGain = 5 + Math.floor(planetLevel * 0.2);
            totalPines += pGain; gears += gGain; darkMatter += dGain;
            if (typeof createPineStorm === 'function') createPineStorm(); 
            if (typeof createGearDebris === 'function') createGearDebris(pixiApp.screen.width/2, pixiApp.screen.height/2);
        }
        showEventToast(event.name + "!", event.color);
        if (typeof updateUI === 'function') updateUI();
    } else {
        startVisualEvent(event);
    }
}

function startVisualEvent(event) {
    if (typeof activeEvents === 'undefined') window.activeEvents = {};

    const now = Date.now();
    const isAlreadyActive = activeEvents[event.id] && activeEvents[event.id].endTime > now;

    if (!isAlreadyActive) {
        if (event.id === "supernova") {
            eventDmgMult = 10;
            if (typeof createSupernovaVFX === 'function') createSupernovaVFX(event.dur);
        } else if (event.id === "click_frenzy") {
            eventClickMult = 25;
            if (typeof createFrenzyVFX === 'function') createFrenzyVFX(event.dur);
        } else if (event.id === "overclock") {
            eventAutoSpeedMult = 4;
            if (typeof createOverclockVFX === 'function') createOverclockVFX(event.dur);
        } else if (event.id === "void_infusion") {
            eventCritFull = true;
            if (typeof createVoidVFX === 'function') createVoidVFX(event.dur);
        } else if (event.id === "temp_rift") {
            eventDmgMult = 2;
            if (typeof createRiftVFX === 'function') createRiftVFX(event.dur);
        }
    }

    if (isAlreadyActive) {
        activeEvents[event.id].endTime += event.dur;
        activeEvents[event.id].duration += event.dur; 
    } else {
        activeEvents[event.id] = {
            name: event.name,
            desc: event.desc,
            color: event.color,
            icon: event.icon,
            endTime: now + event.dur,
            duration: event.dur
        };
    }

    if (typeof updateActiveEffectsUI === 'function') updateActiveEffectsUI();

    showEventToast(isAlreadyActive ? event.name + " EXTENDED!" : event.name + " ACTIVATED!", event.color);
    if (typeof updateUI === 'function') updateUI();
}

// Global Toast Queue (Pixi version)
window.toastQueue = window.toastQueue || [];
window.isToastShowing = false;

function showEventToast(text, color = "#00f2fe") {
    window.toastQueue.push({ text, color });
    processToastQueue();
}

function processToastQueue() {
    if (window.isToastShowing || window.toastQueue.length === 0) return;
    if (typeof PIXI === 'undefined' || typeof uiLayer === 'undefined') return;
    
    window.isToastShowing = true;
    const { text, color } = window.toastQueue.shift();
    
    const toast = new PIXI.Text(text, {
        fontFamily: "Consolas, monospace",
        fontSize: 30,
        fill: resolveColor(color),
        fontWeight: "bold",
        align: "center",

        dropShadow: true, 
        dropShadowBlur: 10, 
        dropShadowColor: 0x000000, 
        dropShadowDistance: 0
    });
    
    toast.anchor.set(0.5); 
    toast.x = pixiApp.screen.width / 2; 
    toast.y = pixiApp.screen.height * 0.3; 
    uiLayer.addChild(toast);
    
    const startTime = Date.now();
    const duration = 2000;
    const tickerFn = () => {
        const p = (Date.now() - startTime) / duration;
        if (p >= 1) { 
            pixiApp.ticker.remove(tickerFn); 
            toast.destroy(); 
            window.isToastShowing = false; 
            setTimeout(processToastQueue, 100); 
            return; 
        }
        toast.alpha = p < 0.2 ? p/0.2 : (p > 0.8 ? (1-p)/0.2 : 1);
        toast.y = (pixiApp.screen.height * 0.3) - (p * 20);
    };
    pixiApp.ticker.add(tickerFn);
}
