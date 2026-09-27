// ==========================================
// UI: NAVIGATION (Panels, Tabs, Responsive)
// ==========================================

function minimizePanel(id, e) {
    if(e) e.stopPropagation();
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('minimized');
        if (typeof playPanelSfx === 'function') playPanelSfx(false);
    }
}

function openPanel(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('minimized');
        el.style.display = 'flex'; 
        el.style.flexDirection = 'column';
        if (typeof playPanelSfx === 'function') playPanelSfx(true);
    }
}

function switchTab(tabId) {
    const shopPanel = document.getElementById('unified-shop');
    if (!shopPanel) return;
    
    const contents = shopPanel.querySelectorAll('.shop-tab-content');
    contents.forEach(content => content.classList.remove('active'));
    
    const btns = shopPanel.querySelectorAll('.shop-tab-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    
    const targetContent = document.getElementById('tab-' + tabId);
    if (targetContent) targetContent.classList.add('active');
    
    const targetBtn = document.getElementById('tab-btn-' + tabId);
    if (targetBtn) targetBtn.classList.add('active');

    const tabNames = {
        'shop': 'Hangar Operations',
        'pine-lab': 'Biological Research',
        'eng-bay': 'Engineering Systems',
        'black-market': 'Void Market Protocols'
    };
    if (typeof updateTerminalLog === 'function') {
        updateTerminalLog(`Accessing: ${tabNames[tabId] || tabId}...`, 'var(--terminal-dim)');
    }
}

function switchCmdTab(tabId) {
    const cmdPanel = document.getElementById('unified-commander');
    if (!cmdPanel) return;

    const contents = cmdPanel.querySelectorAll('.cmd-tab-content');
    contents.forEach(content => content.classList.remove('active'));
    
    const btns = cmdPanel.querySelectorAll('.cmd-tab-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    
    const targetContent = document.getElementById('cmd-tab-' + tabId);
    if (targetContent) targetContent.classList.add('active');
    
    const targetBtn = document.getElementById('tab-btn-' + tabId);
    if (targetBtn) targetBtn.classList.add('active');
}

function applyResponsiveUI() {
    if (window.innerWidth < 1100) {
        ['unified-commander', 'unified-shop', 'unified-colony'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.classList.add('minimized');
        });
    }
}

function closeOfflineModal() {
    const modal = document.getElementById('offline-modal');
    if (modal) modal.style.display = 'none';
    if (typeof playSfx === 'function') playSfx(600, 'sine', 0.2);
}

function toggleHelp() {
    const modal = document.getElementById('help-modal');
    if (!modal) return;
    const isShowing = modal.style.display === 'block';
    modal.style.display = isShowing ? 'none' : 'block';
    
    if (typeof createControlPulseVFX === 'function') createControlPulseVFX('help-btn');
    
    if (!isShowing && typeof playSfx === 'function') playSfx(800, 'sine', 0.2);
}

// Event Listeners
window.addEventListener('resize', applyResponsiveUI);
applyResponsiveUI();
