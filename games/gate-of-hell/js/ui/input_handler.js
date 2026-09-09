/* js/input_handler.js - Canvas Input Handling */

let selectedTower = null;
let hoveredSlot = null;
let hoveredTower = null;
let dragTower = null;
let isDragging = false;
let lastMouseDownTime = 0;
let _canvasEl = null;

function _inputActive() {
    if (!window.SceneManager) return true; // pre-scene fallback
    return SceneManager.is(SCENES.GAME);
}

function _resetDragState() {
    if (dragTower) resetTowerPosition(dragTower);
    dragTower = null;
    isDragging = false;
    selectedTower = null;
    hoveredTower = null;
    window.isMovingUnit = false;
    window.draggedUnit = null;
    const ri = document.getElementById('range-indicator'); if (ri) ri.remove();
    const ai = document.getElementById('aura-indicator'); if (ai) ai.remove();
}

function _findNearestTower(x, y, maxDistSq) {
    if (!window.towers) return null;
    let best = null;
    let minD = maxDistSq;
    window.towers.forEach(t => {
        const dx = t.lx - x;
        const dy = t.ly - y;
        const d = dx * dx + dy * dy;
        if (d < minD) { minD = d; best = t; }
    });
    return best;
}

function _installUxHygiene(canvas) {
    // Block right-click context menu across the game UI. Keep enabled on
    // <input>/<textarea> so users can still paste into form fields if any.
    document.addEventListener('contextmenu', (e) => {
        const tag = e.target && e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
    });

    // Block native image drag (ghost image) on all <img>.
    document.addEventListener('dragstart', (e) => {
        if (e.target && e.target.tagName === 'IMG') e.preventDefault();
    });

    // Block middle-click auto-scroll on the canvas (mousedown button 1).
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 1 || e.button === 2) e.preventDefault();
    });

    // Block text-selection drag started from canvas (desktop).
    canvas.addEventListener('selectstart', (e) => e.preventDefault());

    // Suppress long-press callout on iOS Safari for canvas/game-container.
    const container = document.getElementById('game-container');
    if (container) container.style.webkitTouchCallout = 'none';
}

function initInputHandlers() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    _canvasEl = canvas;

    _installUxHygiene(canvas);

    // Mouse Listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', () => { hoveredTower = null; });

    // Touch Listeners (Mobile Support)
    canvas.addEventListener('touchstart', (e) => {
        handleMouseDown(e);
        // Note: Don't preventDefault here to allow clicking buttons,
        // but we will prevent it during drag in handleMouseMove.
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (isDragging && e.cancelable) e.preventDefault(); // Prevent scrolling while dragging
        handleMouseMove(e);
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
        handleMouseUp(e);
    }, { passive: false });

    // Drop drag state on any scene transition.
    if (window.EventBus && window.SCENE_EVENTS) {
        EventBus.on(SCENE_EVENTS.CHANGED, _resetDragState);
    }
}

function getLogicalCoords(e) {
    const canvas = _canvasEl || (_canvasEl = document.getElementById('game-canvas'));
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
}

function handleMouseDown(e) {
    if (!_inputActive()) return;
    const { x, y } = getLogicalCoords(e);
    lastMouseDownTime = Date.now();
    const L_W = window.LOGICAL_WIDTH || 1080;

    // 1. Check if unit clicked (Threshold scaled for 128x128 unit area, radius ~64-70)
    let clickedTower = null;
    let minD = 1600; // 40^2
    if (window.towers) {
        window.towers.forEach(t => {
            const dx = t.lx - x;
            const dy = t.ly - y;
            const distSq = dx * dx + dy * dy;
            if (distSq < minD) {
                minD = distSq;
                clickedTower = t;
            }
        });
    }

    let clickedEnemy = null;
    let minED = 900; // 30^2
    if (window.enemies) {
        window.enemies.forEach(en => {
            const ex = (en.x / 100) * L_W;
            const dx = ex - x;
            const dy = en.y - y;
            const distSq = dx * dx + dy * dy;
            if (distSq < minED) {
                minED = distSq;
                clickedEnemy = en;
            }
        });
    }
    
    if (clickedEnemy) {
        if (typeof showEnemyInfo === 'function') showEnemyInfo(clickedEnemy);
        return;
    }

    if (clickedTower) {
        selectedTower = clickedTower;
        dragTower = clickedTower;
        if (typeof showUnitInfo === 'function') showUnitInfo(clickedTower);
        if (typeof showRangeIndicator === 'function') showRangeIndicator(clickedTower);
    } else {
        selectedTower = null;
        if (typeof showRangeIndicator === 'function') showRangeIndicator(null);
        if (typeof resetInfoPanel === 'function') resetInfoPanel();
    }
}

function handleMouseMove(e) {
    if (!_inputActive()) return;
    const { x, y } = getLogicalCoords(e);

    if (dragTower && Date.now() - lastMouseDownTime > 200) {
        if (!isDragging) {
            isDragging = true;
            // Expose drag state to global logic so towers can disable attacks while being moved
            window.isMovingUnit = true;
            window.draggedUnit = dragTower;
        }
        dragTower.lx = x;
        dragTower.ly = y;
    }

    // Hover Slot Logic
    hoveredSlot = findNearestSlot(x, y);

    // Hover Tower Logic — show range preview on hover (skip while dragging)
    if (!isDragging) {
        hoveredTower = _findNearestTower(x, y, 4900); // 70^2, generous hover radius
    } else {
        hoveredTower = null;
    }
}

function handleMouseUp(e) {
    if (!_inputActive()) {
        // Still clear drag state if it leaked across a scene transition.
        if (isDragging || dragTower) _resetDragState();
        return;
    }
    const { x, y } = getLogicalCoords(e);

    if (isDragging && dragTower) {
        const targetSlot = findNearestSlot(x, y);
        if (targetSlot) {
            const isShrine = dragTower.isShrine;
            const slotType = targetSlot.type; // 'shrine' or 'unit'
            
            if (isShrine && slotType === 'shrine') {
                // If slot is reserved for sacred (tier 2) shrines, only allow tier 2 shrines here
                const slotTier = targetSlot.tier || 1;
                const shrineTier = (dragTower && dragTower.data && dragTower.data.tier) ? dragTower.data.tier : (dragTower.tier || 1);
                if (slotTier === 2 && shrineTier !== 2) {
                    if (typeof GameLogger !== 'undefined') GameLogger.warn((window.t ? window.t('ui.info_panel.sacred_slot_only_log', 'Only 성스러운 성소 (Tier 2) can be placed here.') : 'Only 성스러운 성소 (Tier 2) can be placed here.'));
                    if (typeof window.showSlotWarning === 'function') window.showSlotWarning((window.t ? window.t('ui.info_panel.slot_sacred_only', "성스러운 성소 전용 슬롯입니다.") : "성스러운 성소 전용 슬롯입니다."));
                    resetTowerPosition(dragTower);
                } else {
                    executeCanvasMove(dragTower, targetSlot);
                }
            } else if (!isShrine && slotType === 'unit') {
                executeCanvasMove(dragTower, targetSlot);
            } else {
                if (typeof GameLogger !== 'undefined') GameLogger.warn(`Invalid slot for this unit!`);
                if (typeof window.showSlotWarning === 'function') {
                    const _T = window.t || ((k, f) => f);
                    if (slotType === 'shrine') {
                        window.showSlotWarning(_T('ui.info_panel.slot_shrine_only', "성소 전용 슬롯입니다."));
                    } else if (slotType === 'unit') {
                        window.showSlotWarning(_T('ui.info_panel.slot_unit_only', "퇴마사 전용 슬롯입니다."));
                    }
                }
                resetTowerPosition(dragTower);
            }
        } else {
            resetTowerPosition(dragTower);
        }
    }

    window.isMovingUnit = false;
    window.draggedUnit = null;
    dragTower = null;
    isDragging = false;
}

function findNearestSlot(lx, ly) {
    if (!window.logicalSlots) return null;
    
    // Snap to closest slot if within range
    let closestSlot = null;
    let minDistSq = 6400; // 80 squared
    
    window.logicalSlots.forEach(slot => {
        const dx = slot.lx - lx;
        const dy = slot.ly - ly;
        const distSq = dx * dx + dy * dy;
        if (distSq < minDistSq) {
            minDistSq = distSq;
            closestSlot = slot;
        }
    });
    
    return closestSlot;
}

function executeCanvasMove(tower, targetSlot) {
    const oldSlot = tower.currentSlot;
    if (oldSlot === targetSlot) { resetTowerPosition(tower); return; }

    // Swap logic
    const occupant = window.towers ? window.towers.find(t => t.currentSlot === targetSlot) : null;
    if (occupant) {
        occupant.currentSlot = oldSlot;
        occupant.lx = oldSlot.lx;
        occupant.ly = oldSlot.ly;
        if (oldSlot) oldSlot.isOccupied = true;
    } else {
        if (oldSlot) oldSlot.isOccupied = false;
    }

    tower.currentSlot = targetSlot;
    tower.lx = targetSlot.lx;
    tower.ly = targetSlot.ly;
    targetSlot.isOccupied = true;
    
    if (selectedTower === tower && !tower.isShrine) {
        if (typeof showRangeIndicator === 'function') showRangeIndicator(tower);
    }
}

function resetTowerPosition(tower) {
    if (tower.currentSlot) {
        tower.lx = tower.currentSlot.lx;
        tower.ly = tower.currentSlot.ly;
    }
}

document.addEventListener('DOMContentLoaded', initInputHandlers);
window.getSelectedTower = () => selectedTower;
window.getHoveredTower = () => hoveredTower;
