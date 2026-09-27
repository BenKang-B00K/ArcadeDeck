// ==========================================
// GAMEPLAY: DAILY MISSIONS
// ==========================================

const MISSION_SAVE_KEY = "galaxyLaunch_daily_missions";
const MISSION_DATE_KEY = "galaxyLaunch_mission_date";
const MISSION_BONUS_KEY = "galaxyLaunch_mission_bonus_claimed";

let dailyMissions = [
    { id: "clicks", text: "Manual Clicks", target: 1000, current: 0, reward: { type: 'stardust', amount: 5000, icon: '✨' }, claimed: false },
    { id: "drones", text: "Drones Destroyed", target: 5, current: 0, reward: { type: 'gears', amount: 10, icon: '⚙️' }, claimed: false },
    { id: "pines", text: "Collect Pines", target: 2000, current: 0, reward: { type: 'pines', amount: 3000, icon: '🌲' }, claimed: false },
    { id: "bosses", text: "Defeat Bosses", target: 2, current: 0, reward: { type: 'dark', amount: 5, icon: '🔮' }, claimed: false }
];

let isBonusClaimed = false;

function initMissions() {
    const lastDate = localStorage.getItem(MISSION_DATE_KEY);
    const today = new Date().toDateString();

    if (lastDate !== today) {
        // Reset for a new day
        isBonusClaimed = false;
        dailyMissions.forEach(m => { m.current = 0; m.claimed = false; });
        saveMissions();
        localStorage.setItem(MISSION_DATE_KEY, today);
    } else {
        loadMissions();
    }
    updateMissionUI();
}

function saveMissions() {
    localStorage.setItem(MISSION_SAVE_KEY, JSON.stringify(dailyMissions));
    localStorage.setItem(MISSION_BONUS_KEY, isBonusClaimed);
}

function loadMissions() {
    const saved = localStorage.getItem(MISSION_SAVE_KEY);
    const savedBonus = localStorage.getItem(MISSION_BONUS_KEY);
    
    if (saved) {
        const data = JSON.parse(saved);
        dailyMissions.forEach(m => {
            const sm = data.find(savedM => savedM.id === m.id);
            if (sm) {
                m.current = sm.current;
                m.claimed = sm.claimed;
            }
        });
    }
    isBonusClaimed = savedBonus === "true";
}

/**
 * Calculates dynamically scaled rewards based on Fleet Rank (Prestige) and Planet Level.
 */
function getScaledRewardAmount(mission) {
    const pLevel = typeof planetLevel !== 'undefined' ? planetLevel : 1;
    const prestige = typeof prestigeLevel !== 'undefined' ? prestigeLevel : 0;
    
    // Scale factor: Base growth from planet level + significant multiplier from prestige
    const scaleFactor = (1 + (pLevel * 0.1)) * (1 + (prestige * 0.5));
    
    let baseAmount = mission.reward.amount;
    
    // Type specific adjustments
    if (mission.reward.type === 'stardust') {
        // Stardust scales more aggressively
        return Math.floor(baseAmount * scaleFactor * (1 + pLevel * 0.05));
    } else if (mission.reward.type === 'dark') {
        // Dark Matter scales slowly but steadily
        return Math.floor(baseAmount + (pLevel / 5) + (prestige * 2));
    } else {
        // Pines and Gears
        return Math.floor(baseAmount * scaleFactor);
    }
}

function updateMissionProgress(type, amount = 1) {
    const mission = dailyMissions.find(m => m.id === type);
    if (mission && !mission.claimed) {
        const oldProgress = Math.floor(mission.current);
        mission.current = Math.min(mission.target, mission.current + amount);
        
        if (oldProgress < mission.target && Math.floor(mission.current) >= mission.target) {
            // Auto-claim reward
            claimMissionReward(mission.id);
        } else {
            saveMissions();
            updateMissionUI();
        }
    }
}

function claimMissionReward(id) {
    const mission = dailyMissions.find(m => m.id === id);
    if (mission && !mission.claimed && mission.current >= mission.target) {
        mission.claimed = true;
        
        const scaledAmount = getScaledRewardAmount(mission);
        
        // Grant Reward
        if (mission.reward.type === 'stardust') {
            stardust += scaledAmount;
            grossStardust += scaledAmount;
        } else if (mission.reward.type === 'pines') {
            totalPines += scaledAmount;
        } else if (mission.reward.type === 'gears') {
            gears += scaledAmount;
        } else if (mission.reward.type === 'dark') {
            darkMatter += scaledAmount;
        }
        
        if (typeof showEventToast === 'function') {
            showEventToast(`REWARD CLAIMED: +${scaledAmount.toLocaleString()}${mission.reward.icon}`, "#2ecc71");
        }
        if (typeof playSfx === 'function') playSfx(1500, 'sine', 0.2);
        
        // Check for bonus
        checkBonusReward();

        saveMissions();
        updateMissionUI();
        if (typeof updateUI === 'function') updateUI();
    }
}

function checkBonusReward() {
    if (isBonusClaimed) return;
    
    const allClaimed = dailyMissions.every(m => m.claimed);
    if (allClaimed) {
        isBonusClaimed = true;
        
        const pLevel = typeof planetLevel !== 'undefined' ? planetLevel : 1;
        const prestige = typeof prestigeLevel !== 'undefined' ? prestigeLevel : 0;
        
        // Scaled Super Bonus
        const bonusDM = Math.floor(25 + (pLevel * 0.5) + (prestige * 10));
        const bonusSD = Math.floor(50000 * (1 + (pLevel * 0.2)) * (1 + prestige));
        
        darkMatter += bonusDM;
        stardust += bonusSD;
        grossStardust += bonusSD;

        setTimeout(() => {
            if (typeof showEventToast === 'function') {
                showEventToast(`DAILY PERFECT CLEAR: +${bonusDM.toLocaleString()}🔮 +${bonusSD.toLocaleString()}✨`, "#f1c40f");
            }
            if (typeof playSfx === 'function') {
                playSfx(880, 'sine', 0.3);
                setTimeout(() => playSfx(1100, 'sine', 0.3), 150);
                setTimeout(() => playSfx(1320, 'sine', 0.3), 300);
            }
        }, 1000);
    }
}

function toggleMissionPanel() {
    const list = document.getElementById('mission-list');
    if (!list) return;
    
    const isHidden = list.classList.contains('mission-list-hidden');
    if (isHidden) {
        list.classList.remove('mission-list-hidden');
        if (typeof playPanelSfx === 'function') playPanelSfx(true);
    } else {
        list.classList.add('mission-list-hidden');
        if (typeof playPanelSfx === 'function') playPanelSfx(false);
    }
}

function updateMissionUI() {
    const list = document.getElementById('mission-list');
    const badge = document.getElementById('mission-count-badge');
    if (!list) return;
    
    const fmt = (n) => typeof formatNumber === 'function' ? formatNumber(n) : n.toLocaleString();

    let html = dailyMissions.map(m => {
        const isComplete = Math.floor(m.current) >= m.target;
        const pct = (m.current / m.target) * 100;
        const scaledAmount = getScaledRewardAmount(m);
        
        return `
            <div class="mission-item ${m.claimed ? 'completed' : ''}">
                <div class="mission-info">
                    <span class="mission-text">${m.text}</span>
                    <span class="mission-progress-text">${Math.floor(m.current)} / ${m.target}</span>
                </div>
                <div class="mission-progress-bg">
                    <div class="mission-progress-bar" style="width: ${pct}%; background: ${m.claimed ? 'var(--pine)' : 'var(--neon)'}"></div>
                </div>
                <div class="mission-reward">
                    <span>Reward: ${fmt(scaledAmount)} ${m.reward.icon}</span>
                    <span style="font-size: 9px; font-weight: bold; color: ${m.claimed ? 'var(--pine)' : '#555'};">
                        ${m.claimed ? '[COMPLETED]' : '[IN PROGRESS]'}
                    </span>
                </div>
            </div>
        `;
    }).join('');

    // Add Bonus Reward UI
    const allDone = dailyMissions.every(m => m.claimed);
    const pLevel = typeof planetLevel !== 'undefined' ? planetLevel : 1;
    const prestige = typeof prestigeLevel !== 'undefined' ? prestigeLevel : 0;
    const bonusDM = Math.floor(25 + (pLevel * 0.5) + (prestige * 10));
    const bonusSD = Math.floor(50000 * (1 + (pLevel * 0.2)) * (1 + prestige));

    html += `
        <div class="mission-item bonus-mission ${isBonusClaimed ? 'completed' : ''}" style="border: 1px dashed ${isBonusClaimed ? 'var(--pine)' : '#f1c40f'}; background: rgba(241, 196, 15, 0.05); margin-top: 15px;">
            <div class="mission-info">
                <span class="mission-text" style="color: #f1c40f;">DAILY PERFECT BONUS</span>
                <span class="mission-progress-text">${dailyMissions.filter(m=>m.claimed).length} / ${dailyMissions.length}</span>
            </div>
            <div class="mission-reward">
                <span>Reward: ${fmt(bonusDM)} 🔮 + ${fmt(bonusSD)} ✨</span>
                <span style="font-size: 9px; font-weight: bold; color: ${isBonusClaimed ? 'var(--pine)' : '#f1c40f'};">
                    ${isBonusClaimed ? '[REWARDED]' : (allDone ? '[CLAIMING...]' : '[LOCKED]')}
                </span>
            </div>
        </div>
    `;
    
    list.innerHTML = html;
    if (badge) badge.style.display = 'none';
}

// Global hook
window.updateMissionProgress = updateMissionProgress;

// Start initialization after a short delay to ensure core data is loaded
setTimeout(initMissions, 500);
