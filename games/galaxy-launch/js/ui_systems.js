// ==========================================
// UI: SYSTEMS (Unlocks, Terminal, Hold Logic)
// ==========================================

function checkUnlocks() {
    const unlockedCount = ships.filter(s => totalClicks >= (typeof getShipReq === 'function' ? getShipReq(s.baseReq) : s.baseReq)).length;
    if (unlockedCount > lastUnlockCount) {
        if (typeof createUnlockParticle === 'function') {
            for(let i=0; i<10; i++) createUnlockParticle();
        }
        playSfx(1200, 'triangle', 0.5);

        currentShipIdx = Math.max(0, unlockedCount - 1);

        if (typeof showUnlockToast === 'function') {
            showUnlockToast(ships[currentShipIdx].name);
        }
        lastUnlockCount = unlockedCount;
        if (typeof renderShipList === 'function') renderShipList();
        if (typeof updateUI === 'function') updateUI();
    }
}

function checkFeatureUnlocks() {
    if (typeof updateLockState === 'function') {
        updateLockState('tab-pine-lab', 5);
        updateLockState('unified-colony', 1);
        updateLockState('tab-eng-bay', 10);
        updateLockState('tab-black-market', 15);
    }
}

let terminalInterval = null;

function updateTerminalLog(msg, color = 'var(--terminal-dim)') {
    const logEl = document.getElementById('terminal-last-msg');
    const cursorEl = document.querySelector('.terminal-cursor');
    if (!logEl) return;
    
    if (terminalInterval) clearInterval(terminalInterval);
    
    logEl.innerText = '';
    logEl.style.color = color;
    
    if (cursorEl) cursorEl.classList.add('typing');

    let i = 0;
    terminalInterval = setInterval(() => {
        if (i < msg.length) {
            logEl.innerText += msg.charAt(i);
            i++;
        } else {
            clearInterval(terminalInterval);
            terminalInterval = null;
            if (cursorEl) cursorEl.classList.remove('typing');
        }
    }, 20);
}

let upgradeHoldInterval = null;
function setupUpgradeHold() {
    const buttons = document.querySelectorAll('.tech-btn');
    buttons.forEach(btn => {
        const startHold = (e) => {
            if (btn.disabled) return;
            if (e.cancelable) e.preventDefault();
            
            btn.click();
            
            if (upgradeHoldInterval) clearInterval(upgradeHoldInterval);
            upgradeHoldInterval = setTimeout(() => {
                upgradeHoldInterval = setInterval(() => {
                    if (btn.disabled) {
                        stopHold();
                        return;
                    }
                    btn.click();
                }, 100);
            }, 400);
        };

        const stopHold = () => {
            if (upgradeHoldInterval) {
                clearTimeout(upgradeHoldInterval);
                clearInterval(upgradeHoldInterval);
                upgradeHoldInterval = null;
            }
        };

        btn.addEventListener('mousedown', startHold);
        btn.addEventListener('touchstart', startHold);
        btn.addEventListener('mouseup', stopHold);
        btn.addEventListener('mouseleave', stopHold);
        btn.addEventListener('touchend', stopHold);
        btn.addEventListener('touchcancel', stopHold);
    });
}

function updateLockState(id, reqLevel) {
    const el = document.getElementById(id);
    if (!el) return;
    const isLocked = planetLevel < reqLevel;
    let overlay = el.querySelector('.locked-overlay');
    if (isLocked) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'locked-overlay';
            overlay.innerHTML = `<div class="locked-icon">🔒</div><div class="locked-text">LOCKED<br>Req: Planet Lv.${reqLevel}</div>`;
            el.appendChild(overlay);
        }
        el.style.position = 'relative'; 
        el.style.overflow = 'hidden';
        el.classList.add('locked-panel');
    } else {
        if (overlay) overlay.remove();
        el.style.overflow = '';
        el.classList.remove('locked-panel');
    }
}
