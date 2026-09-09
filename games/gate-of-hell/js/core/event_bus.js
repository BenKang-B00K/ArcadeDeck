/* event_bus.js - Centralized Event System for Cross-Module Communication */

const EventBus = {
    listeners: {},

    /**
     * Subscribe to an event.
     * @param {string} event - Event name.
     * @param {function} callback - Function to execute.
     */
    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    },

    /**
     * Unsubscribe from an event.
     */
    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(l => l !== callback);
    },

    /**
     * Dispatch an event with data.
     * @param {string} event - Event name.
     * @param {any} data - Data to pass to listeners.
     */
    emit(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback(data));
    }
};

// Global Project Events Mapping
window.GAME_EVENTS = {
    MONEY_CHANGED: 'moneyChanged',
    PORTAL_ENERGY_CHANGED: 'portalEnergyChanged',
    STAGE_CHANGED: 'stageChanged',
    ENEMIES_COUNT_CHANGED: 'enemiesCountChanged',
    GAME_OVER: 'gameOver',
    TOWER_SUMMONED: 'towerSummoned',
    TOWER_SACRIFICED: 'towerSacrificed',
    FROZEN_OVERLAY: 'frozenOverlay',          // payload: boolean (true=show, false=hide)
    RELIC_NOTIF: 'relicNotif',                // payload: { show: boolean }
    EQUIP_NOTIF: 'equipNotif',
    PIXI_RESET: 'pixiReset',                  // emitted after Pixi layers cleared
    ENEMY_REACHED_PORTAL: 'enemyReachedPortal' // payload: { lx, ly, isBoss, hp, type }
};

window.EventBus = EventBus;
