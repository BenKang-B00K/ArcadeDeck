/* scene_manager.js - Scene lifecycle + transitions for the full app */

/**
 * Scene base. Override enter / exit / update. Names are uppercase constants.
 */
class Scene {
    constructor(name) {
        this.name = name;
        this.transient = false; // transient scenes auto-pop on top change
    }
    enter(_data) {}
    exit() {}
    update(_now) {}
}

const SCENES = {
    BOOT: 'BOOT',
    START: 'START',
    GAME: 'GAME',
    GAME_OVER: 'GAME_OVER',
    MODAL: 'MODAL',
    PAUSE: 'PAUSE'
};

const SCENE_EVENTS = {
    ENTERED: 'sceneEntered',
    EXITED: 'sceneExited',
    CHANGED: 'sceneChanged'
};

const SceneManager = {
    _scenes: new Map(),
    _stack: [],
    _changing: false,
    _history: [], // ring buffer of {t, op, name, stack} — max 20

    register(scene) {
        if (!(scene instanceof Scene)) throw new Error('register expects Scene instance');
        this._scenes.set(scene.name, scene);
    },

    get current() { return this._stack[this._stack.length - 1] || null; },

    is(name) { return this.current && this.current.name === name; },

    has(name) { return this._stack.some(s => s.name === name); },

    stackNames() { return this._stack.map(s => s.name); },

    _record(op, name) {
        const entry = { t: Date.now(), op, name, stack: this.stackNames() };
        this._history.push(entry);
        if (this._history.length > 20) this._history.shift();
        if (window.DEBUG_SCENES) {
            console.log(`[Scene] ${op} ${name} → [${entry.stack.join(' > ')}]`);
        }
    },

    dump() {
        console.group('[SceneManager]');
        console.log('stack:', this.stackNames());
        console.log('current:', this.current ? this.current.name : null);
        console.log('changing:', this._changing);
        console.log('isPaused:', window.isPaused);
        console.log('history:');
        this._history.forEach(h => console.log(' ', new Date(h.t).toISOString().slice(11,23), h.op, h.name, '→', `[${h.stack.join(' > ')}]`));
        console.groupEnd();
        return this.stackNames();
    },

    /** Bypass _changing guard. For dev use only. */
    debugForce(name, data) {
        this._changing = false;
        return this.change(name, data);
    },

    async change(name, data) {
        if (this._changing) return;
        const next = this._scenes.get(name);
        if (!next) { console.error('[SceneManager] unknown scene:', name); return; }
        this._changing = true;
        try {
            while (this._stack.length) {
                const s = this._stack.pop();
                try { await s.exit(); } catch (e) { console.error('[SceneManager] exit error', s.name, e); }
                if (window.EventBus) EventBus.emit(SCENE_EVENTS.EXITED, s.name);
            }
            this._stack.push(next);
            try { await next.enter(data); } catch (e) { console.error('[SceneManager] enter error', next.name, e); }
            this._record('change', next.name);
            if (window.EventBus) {
                EventBus.emit(SCENE_EVENTS.ENTERED, next.name);
                EventBus.emit(SCENE_EVENTS.CHANGED, next.name);
            }
        } finally {
            this._changing = false;
        }
    },

    /**
     * Push a scene on top without exiting underlying scenes. Use for modals/overlays.
     * The pushed scene becomes the only one ticked.
     */
    async push(name, data) {
        if (this._changing) return;
        const next = this._scenes.get(name);
        if (!next) { console.error('[SceneManager] unknown scene:', name); return; }
        this._changing = true;
        try {
            this._stack.push(next);
            try { await next.enter(data); } catch (e) { console.error('[SceneManager] enter error', next.name, e); }
            this._record('push', next.name);
            if (window.EventBus) {
                EventBus.emit(SCENE_EVENTS.ENTERED, next.name);
                EventBus.emit(SCENE_EVENTS.CHANGED, next.name);
            }
        } finally {
            this._changing = false;
        }
    },

    /**
     * Pop the top scene. Underlying scene resumes.
     */
    async pop() {
        if (this._changing) return;
        if (this._stack.length <= 1) return;
        this._changing = true;
        try {
            const s = this._stack.pop();
            try { await s.exit(); } catch (e) { console.error('[SceneManager] exit error', s.name, e); }
            this._record('pop', s.name);
            if (window.EventBus) {
                EventBus.emit(SCENE_EVENTS.EXITED, s.name);
                EventBus.emit(SCENE_EVENTS.CHANGED, this.current ? this.current.name : null);
            }
        } finally {
            this._changing = false;
        }
    },

    tick(now) {
        const top = this.current;
        if (top && top.update) top.update(now);
    }
};

/* ───── Scene definitions ───────────────────────────────────────────────── */

const BootScene = new Scene(SCENES.BOOT);
BootScene.enter = async () => {
    // Loading screen is in DOM by default. Wait for data load.
    if (window.gameDataLoaded) {
        try { await window.gameDataLoaded; } catch (e) { console.error('[Boot] data load failed', e); }
    }
};
BootScene.exit = () => {
    const ls = document.getElementById('loading-screen');
    if (ls && !ls.classList.contains('fade-out')) ls.classList.add('fade-out');
};

const StartScene = new Scene(SCENES.START);
StartScene.enter = () => {
    const s = document.getElementById('start-screen');
    if (s) {
        s.classList.remove('shrink-to-info');
        s.style.display = '';
    }
    // Localize static start-screen text now that window.t is ready.
    const T = window.t || ((k, f) => f);
    const subtitle = document.querySelector('.start-subtitle');
    if (subtitle) subtitle.textContent = T('ui.start.subtitle', '악령들의 귀환');
    const continueBtn = document.getElementById('continue-game-btn');
    if (continueBtn) continueBtn.textContent = T('ui.start.btn_continue', '이어하기');
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) startBtn.textContent = T('ui.start.btn_new', '새 게임');
    const tutorialBtn = document.getElementById('start-tutorial-btn');
    if (tutorialBtn) tutorialBtn.textContent = T('ui.start.btn_tutorial', '지침서 (Guide)');
    const configLabel = document.querySelector('#start-tutorial-config .config-label');
    if (configLabel) configLabel.textContent = T('ui.start.tutorial_label', '초보자 가이드');
    const tutorialStatus = document.getElementById('start-tutorial-status');
    if (tutorialStatus) {
        const isOn = tutorialStatus.textContent.trim() !== 'OFF';
        tutorialStatus.textContent = isOn ? T('ui.start.status_on', 'ON') : T('ui.start.status_off', 'OFF');
    }
};
StartScene.exit = () => {
    const s = document.getElementById('start-screen');
    if (s) s.style.display = 'none';
};

const GameScene = new Scene(SCENES.GAME);
GameScene.enter = (data) => {
    // Restart path: caller passed { restart: true } — wipe prior state + Pixi.
    if (data && data.restart) {
        if (typeof resetGameState === 'function') resetGameState();
        if (typeof resetPixiScene === 'function') resetPixiScene();
    }

    window.gameStarted = true;
    window.isPaused = false;

    const isContinue = !!(data && data.isContinue);

    // Slots/HUD must exist before loadProgress — tower restore is gated on window.logicalSlots.
    if (typeof initLogicalSlots === 'function') initLogicalSlots();
    if (typeof initHUD === 'function') initHUD();
    if (typeof initControlPanel === 'function') initControlPanel();

    if (isContinue && typeof loadProgress === 'function') {
        loadProgress();
    } else if (typeof clearProgress === 'function') {
        clearProgress();
    }

    if (typeof initStage === 'function') initStage();
    if (typeof initAllies === 'function') initAllies();
    if (typeof updateSummonButtonState === 'function') updateSummonButtonState();
};
GameScene.exit = () => {
    // Logic state preserved for GameOverScene render.
};
GameScene.update = (now) => {
    if (window.isPaused) return; // modal/pause gate (overlays toggle window.isPaused)
    if (typeof runGameTick === 'function') runGameTick(now);
};

const GameOverScene = new Scene(SCENES.GAME_OVER);
GameOverScene.enter = (data) => {
    const stage = (data && typeof data.stage !== 'undefined') ? data.stage : window.stage;
    window.isPaused = true;
    if (typeof onDepthUpdate === 'function') onDepthUpdate(stage, true);
    if (typeof clearProgress === 'function') clearProgress();
    if (typeof _showGameOverOverlay === 'function') {
        _showGameOverOverlay(stage);
    } else {
        const finalStageText = document.getElementById('final-stage');
        if (finalStageText) finalStageText.innerText = stage;
        const o = document.getElementById('game-over-overlay');
        if (o) o.style.display = 'flex';
    }
};
GameOverScene.exit = () => {
    const o = document.getElementById('game-over-overlay');
    if (o) o.style.display = 'none';
};
GameOverScene.update = () => { /* logic frozen */ };

/**
 * PauseScene — explicit pause overlay. Pushed on pause-btn click.
 */
const PauseScene = new Scene(SCENES.PAUSE);
PauseScene.enter = () => {
    window.isPaused = true;
    const o = document.getElementById('pause-overlay');
    if (o) o.style.display = 'flex';
    const btn = document.getElementById('game-pause-btn');
    if (btn) btn.innerText = (window.t ? window.t('ui.controls.btn_resume', '재개') : '재개');
    const ri = document.getElementById('range-indicator'); if (ri) ri.remove();
    const ai = document.getElementById('aura-indicator'); if (ai) ai.remove();
};
PauseScene.exit = () => {
    const o = document.getElementById('pause-overlay');
    if (o) o.style.display = 'none';
    const btn = document.getElementById('game-pause-btn');
    if (btn) btn.innerText = (window.t ? window.t('ui.controls.btn_pause', '일시정지') : '일시정지');
    // Only clear isPaused if no other pause source remains on stack.
    if (!SceneManager.has(SCENES.MODAL) && !SceneManager.has(SCENES.PAUSE)) {
        window.isPaused = false;
    }
};
PauseScene.update = () => {};

/**
 * ModalScene — transient overlay. Multiple may stack. Each instance holds its DOM id.
 * On pop, hides its own overlay; underlying scene resumes ticking.
 */
const ModalScene = new Scene(SCENES.MODAL);
ModalScene.transient = true;
ModalScene._stack = []; // ids in push order
ModalScene.enter = (data) => {
    const id = data && data.id;
    if (!id) { console.warn('[ModalScene] no id provided'); return; }
    ModalScene._stack.push(id);
    window.isPaused = true;
    const el = document.getElementById(id);
    if (el) el.style.display = 'flex';
    if (typeof data?.onOpen === 'function') {
        try { data.onOpen(el); } catch (e) { console.error('[ModalScene] onOpen error', e); }
    }
};
ModalScene.exit = () => {
    const id = ModalScene._stack.pop();
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
    // Clear range/aura indicators that might persist beneath modal.
    const ri = document.getElementById('range-indicator'); if (ri) ri.remove();
    const ai = document.getElementById('aura-indicator'); if (ai) ai.remove();
    // Restore isPaused based on remaining stack sources.
    if (!SceneManager.has(SCENES.MODAL) && !SceneManager.has(SCENES.PAUSE)) {
        window.isPaused = false;
    }
};
ModalScene.update = () => { /* logic frozen */ };
ModalScene.topId = () => ModalScene._stack[ModalScene._stack.length - 1] || null;

/* ───── Bootstrap ───────────────────────────────────────────────────────── */

function initSceneManager() {
    SceneManager.register(BootScene);
    SceneManager.register(StartScene);
    SceneManager.register(GameScene);
    SceneManager.register(GameOverScene);
    SceneManager.register(ModalScene);
    SceneManager.register(PauseScene);
}

window.Scene = Scene;
window.SceneManager = SceneManager;
window.SCENES = SCENES;
window.SCENE_EVENTS = SCENE_EVENTS;
window.initSceneManager = initSceneManager;
window.__scenes = SceneManager; // dev console shortcut: __scenes.dump(), __scenes.debugForce(...)
