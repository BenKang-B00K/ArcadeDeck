/* overlays.js - Orchestrator for start, pause, settings, game-over, ESC closers */

/* ─── Start screen + tutorial ───────────────────────────────────────────── */
function initStartScreen() {
    const startBtn         = document.getElementById('start-game-btn');
    const continueBtn      = document.getElementById('continue-game-btn');
    const startTutorialBtn = document.getElementById('start-tutorial-btn');
    const startScreen      = document.getElementById('start-screen');
    const tutorialOverlay  = document.getElementById('tutorial-overlay');
    const closeTutorialBtn = document.getElementById('close-tutorial-btn');

    if (continueBtn) {
        continueBtn.style.display =
            (typeof hasSavedProgress === 'function' && hasSavedProgress()) ? 'block' : 'none';
    }

    /** Shared launch function for both New Game and Continue.
     *  Guarded against double-clicks during the 800ms shrink animation:
     *  without the guard, a second click re-runs initStage/initAllies and
     *  corrupts global state (duplicate enemies, doubled SE, broken slots).
     */
    let _launching = false;
    const launchGame = async (isContinue = false) => {
        if (_launching || window.gameStarted) return;
        _launching = true;
        if (startBtn)    startBtn.disabled    = true;
        if (continueBtn) continueBtn.disabled = true;

        if (window.gameDataLoaded) await window.gameDataLoaded;
        startScreen.classList.add('shrink-to-info');
        setTimeout(() => {
            if (window.SceneManager) {
                SceneManager.change(SCENES.GAME, { isContinue });
            } else {
                // Legacy fallback path.
                startScreen.style.display = 'none';
                window.gameStarted = true;
                if (typeof initLogicalSlots === 'function') initLogicalSlots();
                if (typeof initHUD === 'function') initHUD();
                if (typeof initControlPanel === 'function') initControlPanel();
                if (isContinue && typeof loadProgress === 'function') loadProgress();
                else if (typeof clearProgress === 'function') clearProgress();
                if (typeof initStage === 'function') initStage();
                if (typeof initAllies === 'function') initAllies();
                if (typeof updateSummonButtonState === 'function') updateSummonButtonState();
            }
        }, 800);
    };

    if (startBtn && startScreen) {
        initTutorialToggles();
        startBtn.addEventListener('click', () => launchGame(false));
    }

    if (continueBtn) {
        continueBtn.addEventListener('click', () => launchGame(true));
    }

    if (startTutorialBtn && tutorialOverlay) {
        startTutorialBtn.onclick = () => { tutorialOverlay.style.display = 'flex'; };
    }

    if (closeTutorialBtn && tutorialOverlay) {
        closeTutorialBtn.onclick = () => { tutorialOverlay.style.display = 'none'; };
    }
}

function initTutorialToggles() {
    const tutorialToggle = document.getElementById('tutorial-toggle');
    const startStatus = document.getElementById('start-tutorial-status');

    const syncToggles = (state) => {
        const _T = window.t || ((k, f) => f);
        if (tutorialToggle) tutorialToggle.checked = state;
        if (startStatus) startStatus.innerText = state ? _T('ui.start.status_on', 'ON') : _T('ui.start.status_off', 'OFF');
        localStorage.setItem('goh_tutorial_enabled', state);
        window.isTutorialEnabled = state;
    };

    const savedTutorial = localStorage.getItem('goh_tutorial_enabled');
    syncToggles(savedTutorial !== 'false');

    if (tutorialToggle) {
        tutorialToggle.addEventListener('change', () => syncToggles(tutorialToggle.checked));
    }
}

/* ─── Pause / settings / restart-quit ───────────────────────────────────── */
function initPauseAndSettings() {
    const pauseBtn = document.getElementById('game-pause-btn');
    const pauseOverlay = document.getElementById('pause-overlay');
    const resumeBtn = document.getElementById('pause-resume-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const restartBtnTop = document.getElementById('restart-btn-top');
    const quitModal = document.getElementById('quit-modal');
    const quitConfirm = document.getElementById('quit-confirm-btn');
    const quitCancel = document.getElementById('quit-cancel-btn');

    const togglePause = () => {
        if (!window.gameStarted) return;

        if (window.SceneManager) {
            if (SceneManager.has(SCENES.PAUSE)) {
                // Pop until PAUSE off stack (could have MODAL on top).
                const popUntilNoPause = async () => {
                    while (SceneManager.has(SCENES.PAUSE)) {
                        const top = SceneManager.current;
                        if (!top) break;
                        await SceneManager.pop();
                    }
                };
                popUntilNoPause();
            } else {
                SceneManager.push(SCENES.PAUSE);
            }
            return;
        }

        // Legacy fallback.
        window.isPaused = !window.isPaused;
        if (settingsModal) settingsModal.style.display = 'none';
        if (pauseOverlay) pauseOverlay.style.display = window.isPaused ? 'flex' : 'none';
        if (pauseBtn) pauseBtn.innerText = window.isPaused ? (window.t ? window.t('ui.controls.btn_resume', '재개') : '재개') : (window.t ? window.t('ui.controls.btn_pause', '일시정지') : '일시정지');
        if (window.isPaused) {
            const ri = document.getElementById('range-indicator'); if (ri) ri.remove();
            const ai = document.getElementById('aura-indicator'); if (ai) ai.remove();
        }
    };

    if (pauseBtn) pauseBtn.addEventListener('click', togglePause);
    if (resumeBtn) resumeBtn.addEventListener('click', togglePause);

    // Legacy: track prior pause state so closing a modal doesn't unpause.
    // With SceneManager stack, pop() restores pause-from-PauseScene naturally;
    // fallback is only used when SceneManager isn't loaded.
    let _pauseBeforeModal = false;

    if (settingsBtn && settingsModal && closeSettingsBtn) {
        settingsBtn.onclick = () => {
            if (window.SceneManager) {
                SceneManager.push(SCENES.MODAL, { id: 'settings-modal' });
            } else {
                _pauseBeforeModal = !!window.isPaused;
                settingsModal.style.display = 'flex';
                window.isPaused = true;
            }
        };
        closeSettingsBtn.onclick = () => {
            if (window.SceneManager) {
                SceneManager.pop();
            } else {
                settingsModal.style.display = 'none';
                window.isPaused = _pauseBeforeModal;
            }
        };
    }

    // Font scale (small/medium/large). One --fs token on <html> drives every
    // font-size in the app; index.html applies the stored value before paint.
    const fsSwitcher = document.getElementById('fontsize-switcher');
    if (fsSwitcher) {
        const paintFs = () => {
            const cur = document.documentElement.dataset.fs;
            fsSwitcher.querySelectorAll('[data-fs-set]').forEach(b => b.classList.toggle('active', b.dataset.fsSet === cur));
        };
        fsSwitcher.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-fs-set]');
            if (!btn) return;
            document.documentElement.dataset.fs = btn.dataset.fsSet;
            localStorage.setItem('goh_font_scale', btn.dataset.fsSet);
            // Chrome doesn't re-resolve `font-size: calc(... * var(--fs))` on form
            // controls when only the custom property changes — buttons keep their
            // old size until something forces a full style recalc.
            document.body.style.display = 'none';
            void document.body.offsetHeight;
            document.body.style.display = '';
            paintFs();
        });
        paintFs();
    }

    if (restartBtnTop && quitModal && quitConfirm && quitCancel) {
        restartBtnTop.onclick = () => {
            if (window.SceneManager) {
                // Close settings modal first if it's the top modal.
                if (typeof ModalScene !== 'undefined' && ModalScene.topId && ModalScene.topId() === 'settings-modal') {
                    SceneManager.pop().then(() => SceneManager.push(SCENES.MODAL, { id: 'quit-modal' }));
                } else {
                    SceneManager.push(SCENES.MODAL, { id: 'quit-modal' });
                }
            } else {
                _pauseBeforeModal = !!window.isPaused;
                if (settingsModal) settingsModal.style.display = 'none';
                quitModal.style.display = 'flex';
                window.isPaused = true;
            }
        };
        quitConfirm.onclick = () => window.location.reload();
        quitCancel.onclick = () => {
            if (window.SceneManager) {
                SceneManager.pop();
            } else {
                quitModal.style.display = 'none';
                window.isPaused = _pauseBeforeModal;
            }
        };
    }
}

/* ─── Language switcher (title-screen only) ──────────────────────────────── */
function initLangSwitcher() {
    const switcher = document.getElementById('lang-switcher-title');
    if (!switcher) return;
    const buttons = switcher.querySelectorAll('.lang-tb');
    if (buttons.length === 0) return;

    const syncActive = () => {
        const cur = window.I18n ? window.I18n.getLang() : 'ko';
        buttons.forEach(b => b.classList.toggle('active', b.dataset.lang === cur));
    };
    syncActive();

    buttons.forEach(btn => {
        btn.onclick = async () => {
            const code = btn.dataset.lang;
            if (!code || !window.I18n) return;
            if (code === window.I18n.getLang()) return;
            await window.I18n.setLang(code);
            location.reload();
        };
    });

    if (window.EventBus && typeof window.EventBus.on === 'function') {
        window.EventBus.on('i18n:changed', syncActive);
    }
}

/* Walk DOM, swap text of every [data-i18n="key"] element with t(key).
 * For HTML content use [data-i18n-html]. Re-renders modal grids that have
 * a render function exposed (collections, relics, equipment). */
function refreshI18nDOM(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const val = window.t ? window.t(key, el.textContent) : el.textContent;
        el.textContent = val;
    });
    scope.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        const val = window.t ? window.t(key, el.innerHTML) : el.innerHTML;
        el.innerHTML = val;
    });
    scope.querySelectorAll('[data-i18n-attr]').forEach(el => {
        const spec = el.getAttribute('data-i18n-attr');
        spec.split(';').forEach(pair => {
            const [attr, key] = pair.split(':').map(s => s.trim());
            if (attr && key && window.t) el.setAttribute(attr, window.t(key, el.getAttribute(attr)));
        });
    });
    if (typeof renderGhostGrid === 'function')    try { renderGhostGrid('all'); } catch (e) {}
    if (typeof renderShrineGrid === 'function')   try { renderShrineGrid('all'); } catch (e) {}
    if (typeof renderExorcistGrid === 'function') try { renderExorcistGrid(); } catch (e) {}
    if (typeof resetColInfo === 'function')       try { resetColInfo(); } catch (e) {}
}

/* ─── Game over ─────────────────────────────────────────────────────────── */
function initGameOver() {
    const retryBtn = document.getElementById('retry-btn');
    if (!retryBtn) return;
    retryBtn.onclick = () => {
        // No-reload restart via SceneManager. Override with FORCE_RELOAD_RESTART=true if regression.
        if (!window.FORCE_RELOAD_RESTART && window.SceneManager) {
            SceneManager.change(SCENES.GAME, { restart: true });
        } else {
            window.location.reload();
        }
    };
}

function showGameOver(stageReached) {
    if (typeof playSFX === 'function') playSFX('gameover');
    if (window.SceneManager) {
        SceneManager.change(SCENES.GAME_OVER, { stage: stageReached });
    } else {
        onDepthUpdate(stageReached, true);
        window.isPaused = true;
        if (typeof clearProgress === 'function') clearProgress();
        _showGameOverOverlay(stageReached);
    }
}

function _showGameOverOverlay(stageReached) {
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const finalStageText  = document.getElementById('final-stage');
    if (finalStageText) finalStageText.innerText = stageReached;
    if (gameOverOverlay) gameOverOverlay.style.display = 'flex';
}

/* ─── Global overlay manager (ESC closers, dynamic template injection) ──── */
function initOverlayManager() {
    if (window._overlayManagerInitialized) return;
    window._overlayManagerInitialized = true;

    // 0. Inject Dynamic UI Templates
    const overlayContainer = document.getElementById('overlay-container');
    if (typeof injectUITemplates === 'function' && overlayContainer) {
        injectUITemplates(overlayContainer);

        // Re-initialize feature managers that depend on these templates
        if (typeof initRelics === 'function') initRelics();
        if (typeof initEquipment === 'function') initEquipment();
        if (typeof initCollections === 'function') initCollections();
    }

    if (typeof initStartScreen === 'function') initStartScreen();
    if (typeof initPauseAndSettings === 'function') initPauseAndSettings();
    if (typeof initGameOver === 'function') initGameOver();
    if (typeof initLangSwitcher === 'function') initLangSwitcher();

    // Common Closers (ESC Key & Clicks)
    const unlockModal = document.getElementById('unlock-modal');
    if (unlockModal) unlockModal.addEventListener('click', () => {
        if (window.SceneManager && SceneManager.is(SCENES.MODAL) && ModalScene.topId() === 'unlock-modal') {
            SceneManager.pop();
        } else {
            unlockModal.style.display = 'none';
            window.isPaused = false;
        }
    });

    // Backdrop click closes inventory-style overlays.
    const backdropCloseIds = ['equip-overlay', 'relics-overlay', 'collections-overlay'];
    backdropCloseIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('click', (e) => {
            if (e.target !== el) return;
            if (window.SceneManager && SceneManager.is(SCENES.MODAL) && ModalScene.topId() === id) {
                SceneManager.pop();
            } else {
                el.style.display = 'none';
                const pauseOverlay = document.getElementById('pause-overlay');
                const stillPaused = pauseOverlay && pauseOverlay.style.display === 'flex';
                if (!stillPaused) window.isPaused = false;
            }
        });
    });

    window.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;

        if (window.SceneManager && SceneManager.is(SCENES.MODAL)) {
            SceneManager.pop();
            const ri = document.getElementById('range-indicator'); if (ri) ri.remove();
            const ai = document.getElementById('aura-indicator'); if (ai) ai.remove();
            return;
        }

        // Legacy fallback path.
        const mods = ['relics-overlay', 'collections-overlay', 'equip-overlay', 'unlock-modal', 'settings-modal', 'quit-modal'];
        let closed = false;
        mods.forEach(m => {
            const el = document.getElementById(m);
            if (el && el.style.display === 'flex') { el.style.display = 'none'; closed = true; }
        });
        if (closed) {
            const pauseOverlay = document.getElementById('pause-overlay');
            const stillPaused = pauseOverlay && pauseOverlay.style.display === 'flex';
            if (!stillPaused) window.isPaused = false;
        }
        const ri = document.getElementById('range-indicator'); if (ri) ri.remove();
        const ai = document.getElementById('aura-indicator'); if (ai) ai.remove();
    });

    document.addEventListener('mousedown', (e) => {
        if (!e.target.closest('.tower-card') && !e.target.closest('.job-btn') &&
            !e.target.closest('.info-promo-btn') && !e.target.closest('#settings-btn') &&
            !e.target.closest('.overlay-base')) {
            const ri = document.getElementById('range-indicator'); if (ri) ri.remove();
            const ai = document.getElementById('aura-indicator'); if (ai) ai.remove();
        }
    });
}

// Window Exports
window.initStartScreen      = initStartScreen;
window.initPauseAndSettings = initPauseAndSettings;
window.initGameOver         = initGameOver;
window.initLangSwitcher     = initLangSwitcher;
window.refreshI18nDOM       = refreshI18nDOM;
window.showGameOver         = showGameOver;
window._showGameOverOverlay = _showGameOverOverlay;
window.initOverlayManager   = initOverlayManager;
