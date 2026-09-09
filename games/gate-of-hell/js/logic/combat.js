/* combat.js - Damage resolution, special abilities, and damage-text VFX */

/* ─── Special abilities (registry dispatch) ─────────────────────────────── */
function handleSpecialAblities(tower, target) {
    const type = tower.data.type;
    const entry = window.UnitAbilityRegistry[type];
    if (entry && typeof entry.onHit === 'function') entry.onHit(tower, target);
}

function handleKillReward(tower, target) {
    const type = tower.data.type;
    const entry = window.UnitAbilityRegistry[type];
    if (entry && typeof entry.onKill === 'function') entry.onKill(tower, target);
}

/* ─── Damage text VFX ───────────────────────────────────────────────────── */
function createDamageText(target, amount, isCrit) {
    if (!target) return;
    const lx = (target.x / 100) * LOGICAL_WIDTH;
    const ly = target.y;
    const color = isCrit ? '#ff4500' : '#fff';
    const size = isCrit ? 24 : 18;

    if (typeof spawnFloatingText === 'function') {
        spawnFloatingText(Math.round(amount), lx, ly, color, size);
        if (isCrit) {
            spawnFloatingText("CRITICAL", lx, ly - 25, "#ff0000", 14);
        }
    }
}

/* ─── Core damage resolution ────────────────────────────────────────────── */
function applyDamage(target, amount, sourceTower, isShared = false, ignoreFreeze = false, isCrit = false) {
    if (!target || target.hp <= 0 || target.invincible) return;

    target.lastHitTime = Date.now();

    if (typeof spawnHitEffect === 'function') {
        const lx = (target.x / 100) * LOGICAL_WIDTH;
        spawnHitEffect(lx, target.y, target.isBoss ? '#f00' : '#fff', 12);
        if (typeof spawnParticles === 'function') {
            spawnParticles(lx, target.y, target.isBoss ? '#f00' : '#fff', 1);
        }
    } else if (typeof spawnParticles === 'function') {
        const lx = (target.x / 100) * LOGICAL_WIDTH;
        const ly = target.y;
        spawnParticles(lx, ly, target.isBoss ? '#f00' : '#fff', 2);
    }

    // Time Freeze Logic: Accumulate damage with bestiary pre-applied so the
    // unfreeze burst does not multiply the bestiary bonus across all stored hits.
    if (window.isTimeFrozen && !ignoreFreeze && !target.isBoss) {
        let accAmount = amount;
        if (target.type && typeof getBestiaryBonus === 'function') {
            accAmount *= getBestiaryBonus(target.type);
        }
        target.accumulatedDamage = (target.accumulatedDamage || 0) + accAmount;
        return;
    }

    // Bestiary/Lore Bonus — skip on freeze-burst flush; already pre-applied.
    if (!ignoreFreeze && target.type && typeof getBestiaryBonus === 'function') {
        amount *= getBestiaryBonus(target.type);
    }

    // Relic: pitch_black_gem (Void Mark) — stacking dmg amp per mark, decays 4s no-hit.
    const voidStacks = (typeof countRelicStacks === 'function') ? countRelicStacks('void_mark_cap') : 0;
    if (voidStacks > 0) {
        const now = Date.now();
        if (!target.voidMarks || (now - (target.voidMarkLastHit || 0)) > 4000) target.voidMarks = 0;
        const maxMarks = 3 + voidStacks;
        if (target.voidMarks > 0) amount *= (1 + 0.20 * target.voidMarks);
        target.voidMarks = Math.min(maxMarks, target.voidMarks + 1);
        target.voidMarkLastHit = now;
    }

    // Defense Mitigation: flat reduction. Real attacks (≥1 dmg) min 1; sub-1 DOT can be fully blocked.
    const defense = target.defense || 0;
    const mitigated = amount >= 1 ? Math.max(1, amount - defense) : Math.max(0, amount - defense);

    target.hp -= mitigated;

    // Execute Threshold (Relics)
    const execThreshold = (typeof getRelicBonus === 'function') ? getRelicBonus('execute_threshold') : 0;
    if (execThreshold > 0 && !target.isBoss) {
        if (target.hp > 0 && (target.hp / target.maxHp) <= execThreshold) target.hp = 0;
    }

    createDamageText(target, mitigated, isCrit);

    // Soul Link / Shared Damage
    if (!isShared && target.linkId && target.linkEndTime > Date.now()) {
        const sharedAmount = amount * 0.5;
        for (let i = 0; i < window.enemies.length; i++) {
            const e = window.enemies[i];
            if (e !== target && e.linkId === target.linkId && e.hp > 0) {
                applyDamage(e, sharedAmount, sourceTower, true);
            }
        }
    }

    // Death Handling
    if (target.hp <= 0) {
        if (sourceTower && !sourceTower.isShrine) {
            sourceTower.kills = (sourceTower.kills || 0) + 1;
        }
        if (sourceTower) handleKillReward(sourceTower, target);
        if (typeof handleEnemyDeath === 'function') handleEnemyDeath(target, sourceTower);
        else {
            const idx = window.enemies.indexOf(target);
            if (idx > -1) window.enemies.splice(idx, 1);
        }
    }
}

/* ─── Crit derivation (shared with UI display) ──────────────────────────── */
function computeCritChance(tower) {
    const relicC  = (typeof getRelicBonus === 'function') ? getRelicBonus('crit_chance') : 0;
    const equipC  = (typeof getEquipBonus === 'function') ? getEquipBonus('crit_chance') : 0;
    const shrineC = tower.shrineCritChance || 0;
    const vajra   = (tower.data && tower.data.type === 'vajra') ? 0.2 : 0;
    return Math.min(1, 0.05 + relicC + equipC + shrineC + vajra);
}
function computeCritMult(tower) {
    const relicD  = (typeof getRelicBonus === 'function') ? getRelicBonus('crit_damage') : 0;
    const equipD  = (typeof getEquipBonus === 'function') ? getEquipBonus('crit_damage') : 0;
    const shrineD = tower.shrineCritDmg || 0;
    return 2.0 + relicD + equipD + shrineD;
}

/* ─── Hit resolution + crit & vajra knockback ───────────────────────────── */
function handleHit(tower, target) {
    if (typeof createAttackEffect === 'function') createAttackEffect(tower.data.type, target);

    // Specific Enemy Reactive Abilities
    if (target.type === 'cursed_vajra' && Math.random() < 0.15) {
        tower.isStunned = true;
        tower.stunEndTime = Math.max(tower.stunEndTime || 0, Date.now() + 1000);
    }
    if (target.type === 'void_piercer' && tower.range > 150 && Math.random() < 0.5) return;
    if (target.type === 'mimic' && Math.random() < 0.2) { target.y += 40; }
    if (target.type === 'deceiver' && Math.random() < 0.2) { target.y = Math.max(0, target.y - 40); return; }
    if (target.type === 'dimension' && Math.random() < 0.15) return;
    if (target.type === 'soul_eater') {
        target.lastHitTime = Date.now();
        const cap = (target.baseSpeed || target.speed) * 3;
        target.speed = Math.min(cap, target.speed * 1.1);
    }

    handleSpecialAblities(tower, target);

    // Damage Multipliers
    const relicDmgBonus = (typeof getRelicBonus === 'function') ? getRelicBonus('damage') : 0;
    const comboMult = (typeof getComboDamageMultiplier === 'function') ? getComboDamageMultiplier() : 0;
    const demonPactBonus = (typeof getDemonPactDmgBonus === 'function') ? getDemonPactDmgBonus() : 0;
    let finalDamageMultiplier = 1.0 * (1.0 + (tower.damageBonus || 0) + relicDmgBonus + comboMult + demonPactBonus);

    // Critical Hit Logic
    const totalCritChance = computeCritChance(tower);

    let isCritShot = false;
    if (Math.random() < totalCritChance) {
        isCritShot = true;
        finalDamageMultiplier *= computeCritMult(tower);

        // Vajra: knockback nearby enemies on crit
        if (tower.data.type === 'vajra') {
            const rangeSq = 6400; // 80²
            const tx = (target.x / 100) * LOGICAL_WIDTH;
            const ty = target.y;
            for (let i = 0; i < window.enemies.length; i++) {
                const e = window.enemies[i];
                if (e.hp <= 0) continue;
                const ex = (e.x / 100) * LOGICAL_WIDTH;
                const dx = ex - tx;
                const dy = e.y - ty;
                if ((dx * dx + dy * dy) < rangeSq) {
                    e.y = Math.max(0, e.y - 40);
                }
            }
        }
    }

    const finalDmg = tower.data.damage * finalDamageMultiplier;
    applyDamage(target, finalDmg, tower, false, false, isCritShot);

    // Relic: thunder_chain — crit arcs to nearest live enemies.
    if (isCritShot && typeof applyCritChain === 'function') applyCritChain(tower, target, finalDmg);

    // Relic: echo_sigil — chance to fire instant 2nd hit at 50% dmg.
    if (typeof rollEchoShot === 'function') rollEchoShot(tower, target, finalDmg);
}

/* ─── Relic: crit_chain (thunder_chain) ─────────────────────────────────── */
function applyCritChain(tower, primary, hitDamage) {
    const chainPct = (typeof getRelicBonus === 'function') ? getRelicBonus('crit_chain') : 0;
    if (chainPct <= 0 || !primary) return;
    const arcCount = Math.min(5, (typeof countRelicStacks === 'function') ? countRelicStacks('crit_chain') : 0);
    if (arcCount <= 0) return;

    const arcDmg = hitDamage * chainPct;
    const px = (primary.x / 100) * LOGICAL_WIDTH;
    const py = primary.y;

    const cands = [];
    for (let i = 0; i < window.enemies.length; i++) {
        const e = window.enemies[i];
        if (e === primary || e.hp <= 0 || e.invincible) continue;
        const ex = (e.x / 100) * LOGICAL_WIDTH;
        const dx = ex - px, dy = e.y - py;
        cands.push({ e, d2: dx * dx + dy * dy });
    }
    cands.sort((a, b) => a.d2 - b.d2);

    const arcs = Math.min(arcCount, cands.length);
    let prevX = px, prevY = py;
    for (let i = 0; i < arcs; i++) {
        const tgt = cands[i].e;
        const ex = (tgt.x / 100) * LOGICAL_WIDTH;
        const ey = tgt.y;
        applyDamage(tgt, arcDmg, tower, true, false, false);
        if (typeof spawnChainBolt === 'function') spawnChainBolt(prevX, prevY, ex, ey);
        if (typeof spawnParticles === 'function') spawnParticles(ex, ey, '#9ec5ff', 3);
        prevX = ex; prevY = ey;
    }
}

/* ─── Relic: echo_shot_chance (echo_sigil) ──────────────────────────────── */
function rollEchoShot(tower, target, baseDmg) {
    if (!target || target.hp <= 0) return;
    const chance = (typeof getRelicBonus === 'function') ? getRelicBonus('echo_shot_chance') : 0;
    if (chance <= 0) return;
    if (Math.random() >= chance) return;
    applyDamage(target, baseDmg * 0.5, tower, true, false, false);
    if (typeof spawnParticles === 'function') {
        const lx = (target.x / 100) * LOGICAL_WIDTH;
        spawnParticles(lx, target.y, '#ffffff', 3);
    }
}

function shoot(tower, target) {
    tower.lastShot = Date.now();
    if (typeof spawnProjectile === 'function') spawnProjectile(tower, target);
    else setTimeout(() => { if (target && target.hp > 0) handleHit(tower, target); }, 200);
}

// Window Exports
window.handleSpecialAblities = handleSpecialAblities;
window.handleKillReward      = handleKillReward;
window.createDamageText      = createDamageText;
window.applyDamage           = applyDamage;
window.handleHit             = handleHit;
window.shoot                 = shoot;
window.computeCritChance     = computeCritChance;
window.computeCritMult       = computeCritMult;
window.applyCritChain        = applyCritChain;
window.rollEchoShot          = rollEchoShot;
