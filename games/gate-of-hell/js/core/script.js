/* script.js - Entry Point and Manager Initialization */

/**
 * Global application setup and game loop initiation.
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 0. Load language pack before any UI renders so first paint is localized.
    if (window.I18n && typeof window.I18n.init === 'function') {
        await window.I18n.init();
    }

    // 1. Initialize Core UI Managers
    if (typeof initOverlayManager === 'function') {
        initOverlayManager();
    }

    // 2. Register scenes + walk Boot → Start. Game/GameOver triggered by UI later.
    if (typeof initSceneManager === 'function') {
        initSceneManager();
        (async () => {
            await SceneManager.change(SCENES.BOOT);
            await SceneManager.change(SCENES.START);
        })();
    }

    // 3. Start the main game loop defined in game_engine.js
    if (typeof gameLoop === 'function') {
        gameLoop();
    } else {
        console.error("CRITICAL: gameLoop not found. Check game_engine.js.");
    }
});
