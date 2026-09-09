/* allies_ui.js - HUD & Core Gauge Management System */

/**
 * Initializes HUD specific components.
 */
function initAllies() {
    // Basic HUD setup logic if needed
}

/**
 * Updates the visual information within the unit-info panel.
 * @param {string} html - The HTML content to display.
 */
function updateInfo(html) {
    const d = document.getElementById('unit-info');
    if (d) {
        d.innerHTML = html;
        if (typeof startInfoResetTimer === 'function') startInfoResetTimer();
    }
}

// Window Exports
window.initAllies = initAllies;
window.updateInfo = updateInfo;
