/* allies_core_loop.js - The main tick update loop for towers, auras, and summons */

window.isMovingUnit = false;
window.draggedUnit = null;

// Reusable scratch arrays to avoid per-frame allocation in updateTowers.
const _scratchFrostOutcasts = [];
const _scratchAuraTowers = [];

/**
 * Updates towers every frame: applies buffs/penalties, handles cooldowns, and triggers attacks.
 */
function updateTowers(nowTime) {
    if (typeof window.towers === 'undefined' || window.towers.length === 0) return;
    
    // Cache global variables to avoid repeated function calls per tower
    const peRatio = window.portalEnergy / window.maxPortalEnergy;
    let globalSpeedPenalty = 0;
    if (peRatio >= 0.75) globalSpeedPenalty = 0.2; 
    else if (peRatio >= 0.5) globalSpeedPenalty = 0.1; 
    else if (peRatio >= 0.3) globalSpeedPenalty = 0.05; 

    const globalRelicCd = typeof getRelicBonus === 'function' ? getRelicBonus('cooldown') : 0;
    const globalEquipCd = typeof getEquipBonus === 'function' ? getEquipBonus('cooldown') : 0;
    const globalRelicRange = typeof getRelicBonus === 'function' ? getRelicBonus('range') : 0;
    const globalEquipAuraRange = typeof getEquipBonus === 'function' ? getEquipBonus('aura_range') : 0;
    const globalEquipDmg = typeof getEquipBonus === 'function' ? getEquipBonus('damage') : 0;

    // Relic: abyssal_fragment — periodic +100% attack speed surge.
    const surgeActive = (typeof isAbyssalSurgeActive === 'function') && isAbyssalSurgeActive();
    const surgeBonus = surgeActive ? 1.0 : 0;

    // Relic: soul_link — % damage per adjacent occupied slot. Distance-based.
    const adjacencyPerNeighbor = (typeof getRelicBonus === 'function') ? getRelicBonus('adjacency_damage') : 0;
    const ADJACENCY_RADIUS_SQ = 10000; // 100²
    
    const relicAuraBonus = (typeof getRelicBonus === 'function' ? getRelicBonus('aura_range') : 0) + globalEquipAuraRange;
    const baseAuraRadius = 65 + relicAuraBonus;
    const baseAuraRadiusSq = baseAuraRadius * baseAuraRadius;

    // Pre-filter specific enemy types and towers for aura checks (in-place to skip GC).
    _scratchFrostOutcasts.length = 0;
    for (let i = 0; i < window.enemies.length; i++) {
        const e = window.enemies[i];
        if (e.type === 'frost_outcast' && e.hp > 0) _scratchFrostOutcasts.push(e);
    }
    _scratchAuraTowers.length = 0;
    for (let i = 0; i < window.towers.length; i++) {
        const ty = window.towers[i].data.type;
        if (ty === 'tracker' || ty === 'seer' || ty === 'commander') _scratchAuraTowers.push(window.towers[i]);
    }
    const frostOutcasts = _scratchFrostOutcasts;
    const auraTowers = _scratchAuraTowers;
    
    // 0. Pre-calculate enemy screen positions once per frame to save multiplications
    for (let i = 0; i < window.enemies.length; i++) {
        const e = window.enemies[i];
        if (e.hp > 0) {
            e._lx = (e.x / 100) * LOGICAL_WIDTH;
        }
    }

    window.towers.forEach(t => {
        // 1. Calculate Base Bonuses from Relics, Equipment, and Shrines
        t.speedBonus = globalRelicCd + globalEquipCd + (t.shrineSpeedBonus || 0) - globalSpeedPenalty + surgeBonus;
        t.rangeBonus = globalRelicRange + globalEquipAuraRange + (t.shrineRangeBonus || 0);
        t.damageBonus = globalEquipDmg + (t.shrineDmgBonus || 0);

        // Relic: soul_link — count nearby allied towers, scale damage bonus.
        if (adjacencyPerNeighbor > 0) {
            let neighbors = 0;
            for (let i = 0; i < window.towers.length; i++) {
                const o = window.towers[i];
                if (o === t) continue;
                const dx = o.lx - t.lx, dy = o.ly - t.ly;
                if ((dx * dx + dy * dy) <= ADJACENCY_RADIUS_SQ) neighbors++;
            }
            if (neighbors > 0) t.damageBonus += adjacencyPerNeighbor * neighbors;
        }

        // 2b. Gargoyle Curse Penalties (Stage-based, escalating)
        if (typeof applyGargoyleCurse === 'function') applyGargoyleCurse(t);
// 3. Enemy Aura Penalties (Local - e.g., Frost Outcast)
if (frostOutcasts.length > 0) {
    for (let i = 0; i < frostOutcasts.length; i++) {
        const e = frostOutcasts[i];
        const dx = e._lx - t.lx;
        const dy = e.y - t.ly;
        if ((dx * dx + dy * dy) < 14400) { // 120 squared
            t.speedBonus -= 0.2;
        }
    }
}


        // 4. Tower Synergy Aura Buffs (Local - Tracker, Seer, Commander)
        if (auraTowers.length > 0) {
            for (let i = 0; i < auraTowers.length; i++) {
                const other = auraTowers[i];
                if (other === t) continue;
                const dx = other.lx - t.lx;
                const dy = other.ly - t.ly;
                if ((dx * dx + dy * dy) < baseAuraRadiusSq) { 
                    if (other.data.type === 'tracker') t.rangeBonus += 30; 
                    else if (other.data.type === 'seer') t.rangeBonus += 50; 
                    else if (other.data.type === 'commander') { t.speedBonus += 0.2; t.damageBonus += 0.2; }
                }
            }
        }

        // 5. Combat Execution & State Checks
        if (t.isStunned && nowTime > (t.stunEndTime || 0)) t.isStunned = false;
        
        // Disable attacks for towers currently being dragged in the UI
        if (window.isMovingUnit && window.draggedUnit === t) return;
        
        // Prevent action if tower cannot attack
        if (t.isShrine || t.data.type === 'void_gatekeeper' || t.isFeared || t.isFrozenTomb || t.isStunned) return;
        
        let sm = 1.0 + (t.speedBonus || 0);
        let cd = t.cooldown / sm;
        
        // Check if ready to fire
        if (nowTime - (t.lastShot || 0) >= cd) {
            const actualRange = t.range + (t.rangeBonus || 0);
            const rangeSq = actualRange * actualRange;
            let target = null;

            // Target Persistence: Check if current target is still valid
            if (t.currentTarget && t.currentTarget.hp > 0 && !t.currentTarget.isStealthed && !t.currentTarget.invincible) {
                const dx = t.currentTarget._lx - t.lx;
                const dy = t.currentTarget.y - t.ly;
                if ((dx * dx + dy * dy) <= rangeSq) {
                    target = t.currentTarget;
                }
            }

            // Find new target if no valid persistent target
            if (!target) {
                let highestY = -Infinity;
                for (let i = 0; i < window.enemies.length; i++) {
                    const e = window.enemies[i];
                    if (e.hp <= 0 || e.isStealthed || e.invincible) continue;
                    const dx = e._lx - t.lx;
                    const dy = e.y - t.ly;
                    
                    if ((dx * dx + dy * dy) <= rangeSq) {
                        if (e.y > highestY) {
                            highestY = e.y;
                            target = e;
                        }
                    }
                }
                t.currentTarget = target;
            }
            
            if (target) {
                if (typeof shoot === 'function') shoot(t, target);
                t.lastShot = nowTime;
            }
        }
    });
}

/**
 * Updates friendly summons (skeletons, ghosts) movement and melee attacks.
 */
function updateSummons(nowTime) {
    if (typeof window.friendlySkeletons === 'undefined') return;
    
    [...window.friendlySkeletons, ...window.friendlyGhosts].forEach((summon) => {
        // Move towards the top of the screen (enemy spawn)
        summon.y -= summon.speed || 1.0;
        
        // Despawn if they reach the top
        if (summon.y < -50) {
            if (window.friendlySkeletons.includes(summon)) window.friendlySkeletons.splice(window.friendlySkeletons.indexOf(summon), 1);
            else window.friendlyGhosts.splice(window.friendlyGhosts.indexOf(summon), 1);
            return;
        }
        
        // Melee attack logic
        if (nowTime - (summon.lastAttack || 0) > 1000) {
            let target = null;
            const sx = (summon.x / 100) * LOGICAL_WIDTH;
            const rangeSq = 1600; // 40 squared
            
            for (let i = 0; i < window.enemies.length; i++) {
                const e = window.enemies[i];
                if (e.hp <= 0) continue;
                const dx = e._lx - sx;
                const dy = e.y - summon.y;
                if ((dx * dx + dy * dy) < rangeSq) {
                    target = e;
                    break;
                }
            }
            
            if (target) {
                const baseDmg = window.friendlySkeletons.includes(summon) ? 20 : 40;
                const summonBonus = (typeof getRelicBonus === 'function') ? getRelicBonus('summon_damage') : 0;
                const demonPactBonus = (typeof getDemonPactDmgBonus === 'function') ? getDemonPactDmgBonus() : 0;
                if (typeof applyDamage === 'function') applyDamage(target, baseDmg * (1.0 + summonBonus + demonPactBonus), null);
                summon.lastAttack = nowTime;
            }
        }
    });
}

// Global Exports
window.updateTowers = updateTowers;
window.updateSummons = updateSummons;
