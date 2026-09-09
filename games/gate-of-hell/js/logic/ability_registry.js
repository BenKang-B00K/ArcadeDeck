/* ability_registry.js - Centralized Registry for Unit Behaviors and Rendering */

const UnitAbilityRegistry = {
    // --- SPECIAL TIERS & CLASSES ---
    'alchemist': {
        onHit: (tower, target) => {
            if (Math.random() < 0.15) {
                window.money = Math.min(window.maxMoney, window.money + 2);
            }
        }
    },
    'mirror': {
        onHit: (tower, target) => {
            const others = [];
            for (let i = 0; i < window.enemies.length; i++) {
                const e = window.enemies[i];
                if (e !== target && e.hp > 0) others.push(e);
            }
            if (others.length > 0) {
                const secondary = others[Math.floor(Math.random() * others.length)];
                if (typeof applyDamage === 'function') {
                    applyDamage(secondary, tower.data.damage * 0.3 * (window.damageMultiplier || 1.0), tower, true);
                }
            }
        }
    },
    'guardian': {
        onHit: (tower, target) => {
            if (Math.random() < 0.05 && !target.isBoss) {
                if (typeof applyDamage === 'function') applyDamage(target, target.hp + 1, tower);
            }
        }
    },
    'philosopher': {
        onHit: (tower, target) => {
            target.defense = Math.max(0, (target.defense || 0) - 1);
        }
    },
    'reflection': {
        onHit: (tower, target) => {
            const others = [];
            for (let i = 0; i < window.enemies.length; i++) {
                const e = window.enemies[i];
                if (e !== target && e.hp > 0) others.push(e);
            }
            if (others.length > 0) {
                const secondary = others[Math.floor(Math.random() * others.length)];
                setTimeout(() => {
                    if (secondary.hp > 0 && typeof applyDamage === 'function') {
                        applyDamage(secondary, tower.data.damage * 0.5 * (window.damageMultiplier || 1.0), tower);
                    }
                }, 100);
            }
        }
    },
    'illusion': {
        onHit: (tower, target) => {
            if (Math.random() < 0.2) {
                target.vxSign = (Math.random() < 0.5 ? -1 : 1);
                target.swayPhase = Math.random() * Math.PI * 2;
            }
        }
    },
    'oracle': {
        onHit: (tower, target) => {
            target.speed *= 0.5;
            setTimeout(() => { if (target.hp > 0) target.speed = target.baseSpeed; }, 1000);
        }
    },
    'lightning_mage': {
        onHit: (tower, target) => {
            const ex = (target.x / 100) * (window.LOGICAL_WIDTH || 1080);
            const ey = target.y;
            let nearest = null;
            let bestDistSq = 160 * 160;
            for (let i = 0; i < window.enemies.length; i++) {
                const e = window.enemies[i];
                if (e === target || e.hp <= 0) continue;
                const tx = (e.x / 100) * (window.LOGICAL_WIDTH || 1080);
                const dx = ex - tx;
                const dy = ey - e.y;
                const dSq = dx * dx + dy * dy;
                if (dSq < bestDistSq) {
                    bestDistSq = dSq;
                    nearest = e;
                }
            }
            if (nearest && typeof applyDamage === 'function') {
                applyDamage(nearest, tower.data.damage * 0.5 * (window.damageMultiplier || 1.0), tower, true);
            }
        }
    },
    'storm_caller': {
        onHit: (tower, target) => {
            const W = window.LOGICAL_WIDTH || 1080;
            const tx100 = (tower.x / 100) * W;
            const ty = tower.y;
            const rangeSq = (tower.data.range || 410) * (tower.data.range || 410);
            const candidates = [];
            for (let i = 0; i < window.enemies.length; i++) {
                const e = window.enemies[i];
                if (e === target || e.hp <= 0) continue;
                const ex = (e.x / 100) * W;
                const dx = tx100 - ex;
                const dy = ty - e.y;
                if ((dx * dx + dy * dy) <= rangeSq) candidates.push(e);
            }
            if (candidates.length > 0 && typeof applyDamage === 'function') {
                const pick = candidates[Math.floor(Math.random() * candidates.length)];
                applyDamage(pick, tower.data.damage * 0.6 * (window.damageMultiplier || 1.0), tower, true);
            }
        }
    },
    'thunder_lord': {
        onHit: (tower, target) => {
            const W = window.LOGICAL_WIDTH || 1080;
            const tx100 = (tower.x / 100) * W;
            const ty = tower.y;
            const rangeSq = (tower.data.range || 500) * (tower.data.range || 500);
            const candidates = [];
            for (let i = 0; i < window.enemies.length; i++) {
                const e = window.enemies[i];
                if (e === target || e.hp <= 0) continue;
                const ex = (e.x / 100) * W;
                const dx = tx100 - ex;
                const dy = ty - e.y;
                if ((dx * dx + dy * dy) <= rangeSq) candidates.push(e);
            }
            const strikes = Math.min(3, candidates.length);
            const dmg = tower.data.damage * 0.4 * (window.damageMultiplier || 1.0);
            for (let n = 0; n < strikes; n++) {
                const idx = Math.floor(Math.random() * candidates.length);
                const pick = candidates.splice(idx, 1)[0];
                if (typeof applyDamage === 'function') {
                    applyDamage(pick, dmg, tower, true);
                }
                if (Math.random() < 0.25) {
                    pick.isStunned = true;
                    pick.stunEndTime = Math.max(pick.stunEndTime || 0, Date.now() + 800);
                }
            }
        }
    },
    'thunder_judge': {
        onHit: (tower, target) => {
            const W = window.LOGICAL_WIDTH || 1080;
            const hit = new Set();
            hit.add(target);
            let current = target;
            let dmg = tower.data.damage * 0.5 * (window.damageMultiplier || 1.0);
            const jumpRangeSq = 180 * 180;
            for (let chain = 0; chain < 2; chain++) {
                const cx = (current.x / 100) * W;
                const cy = current.y;
                let next = null;
                let bestDistSq = jumpRangeSq;
                for (let i = 0; i < window.enemies.length; i++) {
                    const e = window.enemies[i];
                    if (hit.has(e) || e.hp <= 0) continue;
                    const ex = (e.x / 100) * W;
                    const dx = cx - ex;
                    const dy = cy - e.y;
                    const dSq = dx * dx + dy * dy;
                    if (dSq < bestDistSq) {
                        bestDistSq = dSq;
                        next = e;
                    }
                }
                if (!next) break;
                if (typeof applyDamage === 'function') {
                    applyDamage(next, dmg, tower, true);
                }
                hit.add(next);
                current = next;
                dmg *= 0.5;
            }
        }
    },
    'paladin': {
        onHit: (tower, target) => {
            tower.hitCount = (tower.hitCount || 0) + 1;
            if (tower.hitCount >= 5) {
                tower.hitCount = 0;
                if (typeof applyDamage === 'function') {
                    applyDamage(target, tower.data.damage * 2, tower, false, false, true); 
                }
                target.isStunned = true;
                target.stunEndTime = Math.max(target.stunEndTime || 0, Date.now() + 1500);
            }
        }
    },
    'saint': {
        onHit: (tower, target) => {
            const rangeSq = 10000; // 100 squared
            const ex = (target.x / 100) * (window.LOGICAL_WIDTH || 1080);
            const ey = target.y;
            for (let i = 0; i < window.enemies.length; i++) {
                const e = window.enemies[i];
                const tx = (e.x / 100) * (window.LOGICAL_WIDTH || 1080);
                const dx = ex - tx;
                const dy = ey - e.y;
                if ((dx * dx + dy * dy) < rangeSq) {
                    e.isStunned = true;
                    e.stunEndTime = Math.max(e.stunEndTime || 0, Date.now() + 1000);
                }
            }
        }
    },
    'cursedshaman': {
        onHit: (tower, target) => {
            target.maxHp *= 0.95;
            if (target.hp > target.maxHp) target.hp = target.maxHp;
        }
    },
    'midas': {
        onKill: (tower, target) => {
            window.money = Math.min(window.maxMoney, window.money + 15);
        }
    },
    'transmuter': {
        onKill: (tower, target) => {
            window.money = Math.min(window.maxMoney, window.money + 25);
        }
    },
    'vajra': {
        customDraw: 'drawVajrapani'
    },
    'absolutezero': {
        customDraw: 'drawAbsoluteZero'
    },
    'hellfire': {
        customDraw: 'drawHellfireAlchemist'
    },
    'phoenix': {
        customDraw: 'drawPhoenixSummoner'
    },
    'spatial': {
        customDraw: 'drawSpatialSlasher'
    },
    'abyssal': {
        customDraw: 'drawAbyssalKiller'
    }
};

/**
 * Maps a unit type to its corresponding pixel art drawing function name.
 */
function getUnitDrawFunction(type) {
    const entry = UnitAbilityRegistry[type];
    if (entry && entry.customDraw) return entry.customDraw;
    
    // Standard transformation: 'apprentice' -> 'drawApprentice'
    return `draw${type.charAt(0).toUpperCase()}${type.slice(1).replace(/_([a-z])/g, (g) => g[1].toUpperCase())}`;
}

window.UnitAbilityRegistry = UnitAbilityRegistry;
window.getUnitDrawFunction = getUnitDrawFunction;
