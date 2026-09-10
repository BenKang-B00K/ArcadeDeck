/* enemies_core_loop.js - The main tick update loop for enemy movement and stage progression */

// Catmull-Rom spline sampler: smooth curve through control points (>=2).
// t in [0,1] across the whole path; endpoints duplicated for clean ends.
function sampleCatmullRom(pts, t) {
    const n = pts.length;
    if (n === 0) return { x: 0, y: 0 };
    if (n === 1) return { x: pts[0].x, y: pts[0].y };
    if (t <= 0) return { x: pts[0].x, y: pts[0].y };
    if (t >= 1) return { x: pts[n-1].x, y: pts[n-1].y };
    const segs = n - 1;
    const f = t * segs;
    const seg = Math.min(segs - 1, Math.floor(f));
    const u = f - seg;
    const p0 = pts[Math.max(0, seg - 1)];
    const p1 = pts[seg];
    const p2 = pts[seg + 1];
    const p3 = pts[Math.min(n - 1, seg + 2)];
    const u2 = u * u, u3 = u2 * u;
    return {
        x: 0.5 * ((2*p1.x) + (-p0.x+p2.x)*u + (2*p0.x-5*p1.x+4*p2.x-p3.x)*u2 + (-p0.x+3*p1.x-3*p2.x+p3.x)*u3),
        y: 0.5 * ((2*p1.y) + (-p0.y+p2.y)*u + (2*p0.y-5*p1.y+4*p2.y-p3.y)*u2 + (-p0.y+3*p1.y-3*p2.y+p3.y)*u3)
    };
}
window.sampleCatmullRom = sampleCatmullRom;

/**
 * Handles stage transitions and wave spawning timing.
 */
function updateSpawning(nowTime) {
    if (window.isStageStarting) return;

    const canSpawnMore = window.currentStageSpawned < window.totalStageEnemies;
    const noEnemiesLeft = window.enemies.length === 0;
    const spawnInterval = 4800; 

    if (canSpawnMore && (nowTime - window.lastSpawnTime > spawnInterval || noEnemiesLeft)) {
        if (!window.isBossStage || !window.bossSpawned || (window.bossInstance && window.bossInstance.hp > 0)) {
            if (typeof spawnWave === 'function') spawnWave(); 
            window.lastSpawnTime = nowTime;
        }
    }

    const allSpawned = window.isBossStage ? (window.currentStageSpawned >= window.totalStageEnemies || (window.bossSpawned && !window.bossInstance)) : (window.currentStageSpawned >= window.totalStageEnemies);
    if (allSpawned && window.enemies.length === 0) {
        if (typeof triggerStageTransition === 'function') triggerStageTransition();
        window.stage++;
        if (typeof saveProgress === 'function') saveProgress();
        if (typeof initStage === 'function') initStage();
    }
}

/**
 * Handles individual enemy movement, swaying, and portal collision.
 */
function updateEnemyMovement(nowTime) {
    const targetY = window.LOGICAL_HEIGHT || 1440;
    const L_WIDTH = window.LOGICAL_WIDTH || 1080;
    const dt      = window.dt || 1;

    // Hoist per-frame bonus lookups out of the per-enemy hot path.
    const relicSlowFrame = (typeof getRelicBonus === 'function') ? getRelicBonus('slow_strength') : 0;
    const equipSlowFrame = (typeof getEquipBonus === 'function') ? getEquipBonus('slow_strength') : 0;
    const blizzardSlowMult = 0.5 * (1.0 + relicSlowFrame + equipSlowFrame);
    const blizzardSlowFactor = 1.0 - Math.min(0.8, blizzardSlowMult);

    for (let i = window.enemies.length - 1; i >= 0; i--) {
        const enemy = window.enemies[i];

        // Drop the spawn shield once the materialize fade-in has played out.
        if (enemy.spawnInvulnUntil && nowTime >= enemy.spawnInvulnUntil) {
            enemy.spawnInvulnUntil = 0;
            enemy.invincible = false;
            // Small "fully formed" pop so the moment the enemy becomes killable reads.
            const slx = (enemy.x / 100) * L_WIDTH;
            if (typeof spawnHitEffect === 'function') {
                spawnHitEffect(slx, enemy.y, '#c77dff', 26);
                spawnHitEffect(slx, enemy.y, '#ffffff', 14);
            }
            if (typeof spawnParticles === 'function') {
                spawnParticles(slx, enemy.y, '#9400d3', 5, { speed: 1.6, gravity: 0.02, size: 2 });
            }
        }

        if (window.isTimeFrozen && !enemy.isBoss) continue;
        if (enemy.isStunned && !enemy.isBoss) continue;

        // ── BOSS ABILITY TICKS (only active after merge / once vulnerable)
        if (enemy.isBoss && !enemy.invincible) {
            if (enemy.type === 'mini_chronos') {
                enemy.lastHealTime = enemy.lastHealTime || nowTime;
                if (nowTime - enemy.lastHealTime >= 8000) {
                    enemy.lastHealTime = nowTime;
                    const healAmt = enemy.maxHp * 0.05;
                    enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmt);
                    if (typeof spawnFloatingText === 'function') {
                        const lx = (enemy.x / 100) * (window.LOGICAL_WIDTH || 1080);
                        spawnFloatingText(`+${Math.floor(healAmt)} ${(window.t ? window.t('ui.enemy.float_time_reversal', '시간역행') : '시간역행')}`, lx, enemy.y - 30, '#FFE0A0', 22);
                    }
                }
            } else if (enemy.type === 'medusa') {
                enemy.lastPetrifyTime = enemy.lastPetrifyTime || nowTime;
                if (nowTime - enemy.lastPetrifyTime >= 7000) {
                    enemy.lastPetrifyTime = nowTime;
                    if (typeof window.towers !== 'undefined') {
                        const candidates = window.towers.filter(t => !t.isShrine && !t.isStunned && !t.isFrozenTomb && !t.isFeared);
                        if (candidates.length > 0) {
                            const tgt = candidates[Math.floor(Math.random() * candidates.length)];
                            tgt.isStunned = true;
                            tgt.stunEndTime = nowTime + 4000;
                            if (typeof spawnFloatingText === 'function') {
                                spawnFloatingText((window.t ? window.t('ui.enemy.float_petrify', '석화!') : '석화!'), tgt.lx || 0, (tgt.ly || 0) - 20, '#A0F0C0', 22);
                            }
                        }
                    }
                }
            }
        }

        // ── Materialization freeze: enemy stays at portal while coalescing ──
        // Accumulator-based so pause does not skip materialization (wall-clock
        // diff would jump duration ahead when tick resumes after pause).
        if (enemy.materializing) {
            const lastMat = enemy.lastMatTickTime || nowTime;
            enemy.materializeAccumMs = (enemy.materializeAccumMs || 0) + Math.min(100, nowTime - lastMat);
            enemy.lastMatTickTime = nowTime;
            if (enemy.materializeAccumMs < (enemy.materializeDuration || 1500)) continue;
            // Transition: adjust initialX so path formula is continuous from current position
            enemy.materializing = false;
            const MERGE_Y_mat = targetY * 0.22;
            const mp = (MERGE_Y_mat > 0) ? Math.min(0.99, enemy.y / MERGE_Y_mat) : 0;
            if (mp > 0) enemy.initialX = (enemy.x - (enemy.mergeTargetX ?? 50) * mp) / (1 - mp);
        }

        // DOT (Burn)
        if (enemy.isBurning) {
            if (nowTime > enemy.burnEndTime) enemy.isBurning = false;
            else {
                if (typeof applyDamage === 'function') applyDamage(enemy, ((enemy.maxHp * 0.01) / 60) * dt, null);
                if (enemy.hp <= 0) continue;
            }
        }
        
        // Speed Calculation
        if (enemy.isBoarded && enemy.parentBoss && enemy.parentBoss.hp > 0) {
            enemy.y = enemy.parentBoss.y + enemy.offsetY;
            enemy.x = enemy.parentBoss.x + (enemy.offsetX / 3.6);
        } else {
            if (enemy.isBoarded) { enemy.isBoarded = false; enemy.invincible = false; }

            let finalSpeed = enemy.speed * (1.0 - (window.globalEnemySlow || 0));
            // Boar '포탈 근처에서 빨라집니다': accelerates in final 22% stretch
            if (enemy.type === 'boar') {
                const bp = enemy.y / targetY;
                if (bp > 0.78) finalSpeed *= 1 + (bp - 0.78) / 0.22 * 3.5;
            }
            if (enemy.inBlizzard) finalSpeed *= blizzardSlowFactor;
            // Boss slow floor: stacked CC must not stall stage progression.
            if (enemy.isBoss) finalSpeed = Math.max(enemy.baseSpeed * 0.4, finalSpeed);

            // T-shape bar phase: traverse multi-waypoint spline from gate to
            // meet point near bar center. Path is non-linear per enemy.
            if (!enemy.barPhaseDone && enemy.barPath && enemy.barPath.length >= 2) {
                const LW = window.LOGICAL_WIDTH || 1080;
                const meetX = enemy.barMeetX ?? 50;
                const gateX = enemy.barPath[0].x;
                const barLenPct = Math.max(0.5, Math.abs(meetX - gateX));
                const advance = (((finalSpeed / LW) * 100) / barLenPct) * dt;
                enemy.barT = (enemy.barT || 0) + advance;
                if (enemy.barT >= 1) {
                    enemy.barT = 1;
                    enemy.barPhaseDone = true;
                    const last = enemy.barPath[enemy.barPath.length - 1];
                    enemy.x = last.x;
                    enemy.y = last.y;
                    enemy.initialX = last.x;
                } else {
                    const p = sampleCatmullRom(enemy.barPath, enemy.barT);
                    enemy.x = p.x;
                    enemy.y = p.y;
                }
            } else {
                enemy.y += finalSpeed * dt;
            }
        }

        // Stem-phase positioning (T-shape): runs only after bar phase complete.
        const progress = Math.min(enemy.y / targetY, 1);
        const suctionPower = progress > 0.85 ? (progress - 0.85) / 0.15 : 0;

        if (!enemy.barPhaseDone && (enemy.spawnSide === 'left' || enemy.spawnSide === 'right')) {
            // Still walking horizontally — x handled above. Skip stem positioning.
        } else if (enemy.type === 'boar') {
            const portalTarget = enemy.portalTargetX ?? 50;
            if (enemy.y < targetY * 0.78) {
                enemy.x += (enemy.vxSign || 1) * enemy.speed * 1.4 * dt;
                if (enemy.x <= 35) { enemy.x = 35; enemy.vxSign = 1; }
                else if (enemy.x >= 65) { enemy.x = 65; enemy.vxSign = -1; }
            } else {
                enemy.x = enemy.x * (1 - suctionPower) + portalTarget * suctionPower;
            }
        } else if (enemy.spawnSide === 'left' || enemy.spawnSide === 'right') {
            // Stem descent: sample multi-waypoint spline by y-progress. Sway
            // adds micro-jitter; suction overrides toward portal void near end.
            const portalTarget = enemy.portalTargetX ?? 50;
            const stemStartY   = enemy.barCenterY || 0;
            const stemEndY     = targetY * 0.85;
            const stemT        = Math.min(1, Math.max(0, (enemy.y - stemStartY) / Math.max(1, stemEndY - stemStartY)));
            let baseX;
            if (enemy.stemPath && enemy.stemPath.length >= 2) {
                baseX = sampleCatmullRom(enemy.stemPath, stemT).x;
            } else {
                baseX = enemy.mergeTargetX ?? 50;
            }
            enemy.swayPhase = (enemy.swayPhase || 0) + (enemy.swaySpeed || 0.025);
            const sway = Math.sin(enemy.swayPhase) * 1.2 * (1 - suctionPower);
            enemy.x = (baseX + sway) * (1 - suctionPower) + portalTarget * suctionPower;
        } else {
            // Center spawn fallback (bosses, passengers, stage-1 enemies)
            let targetX = enemy.targetX || 50;
            let baseX = enemy.initialX + (targetX - enemy.initialX) * progress;
            if (enemy.type === 'runner' || enemy.type === 'dimension') {
                baseX += Math.sin(enemy.y * 0.04) * 5 * (1 - suctionPower);
            } else if (['normal', 'mist', 'memory', 'shade', 'tank'].includes(enemy.type)) {
                enemy.swayPhase = (enemy.swayPhase || 0) + (enemy.swaySpeed || 0.03);
                baseX += Math.sin(enemy.swayPhase) * 3 * (1 - suctionPower);
            }
            enemy.x = baseX * (1 - suctionPower) + 50 * suctionPower;
        }

        // Clear boss invincibility when reaching gargoyle waypoint (MERGE_Y)
        const MERGE_Y = (window.LOGICAL_HEIGHT || 1440) * 0.22;
        if (enemy.bossInvincibleUntilMerge && enemy.y >= MERGE_Y) {
            enemy.invincible = false;
            enemy.bossInvincibleUntilMerge = false;
            if (typeof spawnFloatingText === 'function') {
                const lx = (enemy.x / 100) * (window.LOGICAL_WIDTH || 1080);
                spawnFloatingText((window.t ? window.t('ui.enemy.float_invincible_off', '무적 해제!') : '무적 해제!'), lx, enemy.y, '#FF4444', 22);
            }
        }

        // Portal Collision
        if (enemy.y >= targetY) {
            const relicReduc = (typeof getRelicBonus === 'function') ? getRelicBonus('portal_dmg_reduction') : 0;
            const equipReduc = (typeof getEquipBonus === 'function') ? getEquipBonus('portal_dmg_reduction') : 0;
            const finalDmgMult = Math.max(0.1, 1.0 - relicReduc - equipReduc);

            if (window.EventBus && window.GAME_EVENTS) {
                const lxImpact = (enemy.x / 100) * (window.LOGICAL_WIDTH || 1080);
                EventBus.emit(GAME_EVENTS.ENEMY_REACHED_PORTAL, {
                    lx: lxImpact,
                    ly: targetY,
                    isBoss: !!enemy.isBoss,
                    hp: enemy.hp,
                    type: enemy.type,
                });
            }

            window.portalEnergy = Math.max(0, window.portalEnergy + (enemy.hp + (enemy.isBoss ? 200 : 0)) * finalDmgMult);
            if (enemy.isBoss) window.bossInstance = null;
            
            if (window.portalEnergy >= window.maxPortalEnergy) {
                window.portalEnergy = window.maxPortalEnergy;
                // Relic: soul_resurrection — intercept loss state once per charge.
                if (typeof tryConsumeDeathSave === 'function' && tryConsumeDeathSave()) {
                    window.enemies.splice(i, 1);
                    continue;
                }
                if (typeof showGameOver === 'function') showGameOver(window.stage);
                return;
            }
            
            window.enemies.splice(i, 1); 
            continue;
        }
    }
}

// Global Exports
window.updateSpawning = updateSpawning;
window.updateEnemyMovement = updateEnemyMovement;
