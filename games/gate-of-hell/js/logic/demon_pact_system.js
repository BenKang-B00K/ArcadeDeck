/* demon_pact_system.js - 악마의 뿔 relic: damage <-> portal corruption trade */

const DEMON_PACT_DMG_PER_STACK = 0.25;          // +25% all-ally damage per stack
const DEMON_PACT_POLLUTION_PER_STACK = 0.004;   // +0.4% maxPE per second per stack
const DEMON_PACT_MADNESS_THRESHOLD = 0.5;       // PE ratio above which dmg bonus doubles
const DEMON_PACT_MADNESS_MULT = 2.0;

window._demonPactMadnessActive = false;

function getDemonPactStacks() {
    return (typeof countRelicStacks === 'function') ? countRelicStacks('demon_pact') : 0;
}

function isDemonPactMadnessActive() {
    if (getDemonPactStacks() <= 0) return false;
    const max = window.maxPortalEnergy || 1500;
    return ((window.portalEnergy || 0) / max) >= DEMON_PACT_MADNESS_THRESHOLD;
}

/**
 * Damage multiplier contribution from 악마의 뿔. Returns 0 when no stacks.
 * Add to existing additive damage bonus pipeline (i.e., multiplier = 1 + ... + getDemonPactDmgBonus()).
 */
function getDemonPactDmgBonus() {
    const stacks = getDemonPactStacks();
    if (stacks <= 0) return 0;
    const base = stacks * DEMON_PACT_DMG_PER_STACK;
    return isDemonPactMadnessActive() ? base * DEMON_PACT_MADNESS_MULT : base;
}

/**
 * Per-frame tick: accumulate portal corruption based on stack count.
 * Called from game_engine main loop. Throttled to real seconds via wall clock.
 */
function tickDemonPact() {
    const stacks = getDemonPactStacks();
    if (stacks <= 0) { window._demonPactMadnessActive = false; return; }
    if (typeof window.portalEnergy === 'undefined' || typeof window.maxPortalEnergy === 'undefined') return;

    // dt = 1.0 @ 60fps, capped at 4 by engine. Convert to seconds.
    const elapsedSec = (window.dt || 1) / 60;
    const add = window.maxPortalEnergy * DEMON_PACT_POLLUTION_PER_STACK * stacks * elapsedSec;
    const next = Math.min(window.maxPortalEnergy, (window.portalEnergy || 0) + add);
    if (next !== window.portalEnergy) window.portalEnergy = next;

    // Madness state-change feedback
    const nowActive = isDemonPactMadnessActive();
    if (nowActive && !window._demonPactMadnessActive) {
        window._demonPactMadnessActive = true;
        const _T = window.t || ((k, f) => f);
        if (typeof spawnFloatingText === 'function') {
            spawnFloatingText(_T('ui.pact.madness_popup', '광기 발현!'), (window.LOGICAL_WIDTH || 1080) / 2, 220, '#ff2a6d', 30);
        }
        if (typeof GameLogger !== 'undefined') GameLogger.warn(_T('ui.pact.madness_log_on', '악마의 뿔: 광기 발현 — 데미지 보너스 ×2'));
    } else if (!nowActive && window._demonPactMadnessActive) {
        window._demonPactMadnessActive = false;
        const _T = window.t || ((k, f) => f);
        if (typeof GameLogger !== 'undefined') GameLogger.info(_T('ui.pact.madness_log_off', '악마의 뿔: 광기 해제'));
    }
}

function resetDemonPact() {
    window._demonPactMadnessActive = false;
}

window.getDemonPactStacks      = getDemonPactStacks;
window.getDemonPactDmgBonus    = getDemonPactDmgBonus;
window.isDemonPactMadnessActive = isDemonPactMadnessActive;
window.tickDemonPact           = tickDemonPact;
window.resetDemonPact          = resetDemonPact;
