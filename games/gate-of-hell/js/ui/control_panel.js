/* control_panel.js - Bottom Action Hub: state + event listeners */

const PURGE_COST = window.PURGE_COST || 800;

/* ─── State sync / visual feedback ──────────────────────────────────────── */
function updateSummonButtonState() {
    const tc = document.getElementById('tower-card'), tw = document.getElementById('tower-warning'), tcd = document.getElementById('tower-cost-display');
    const sc = document.getElementById('shrine-card'), ssw = document.getElementById('shrine-warning'), sscd = document.getElementById('shrine-cost-display');
    const pc = document.getElementById('purge-card'), psw = document.getElementById('purge-warning'), pscd = document.getElementById('purge-cost-display');

    const reduction = (window.getRelicBonus ? window.getRelicBonus('summon_cost_reduction') : 0);
    const equipReduction = (window.getEquipBonus ? window.getEquipBonus('summon_cost_reduction') : 0);
    const finalTowerCost = Math.max(5, Math.floor(window.towerCost - equipReduction - reduction));
    const finalShrineCost = Math.max(10, Math.floor((window.shrineCost || 100) - equipReduction - reduction));

    if (tcd) tcd.innerText = `${finalTowerCost} SE`;
    if (sscd) sscd.innerText = `${finalShrineCost} SE`;
    if (pscd) pscd.innerText = `${PURGE_COST} SE`;

    const currentMoney = window.money || 0;

    const _Tw = window.t || ((k, f) => f);
    const seShort = _Tw('ui.controls.se_short', 'SE 부족');
    const check = (btn, warn, cost) => {
        const canAfford = currentMoney >= cost;
        if (btn) btn.classList.toggle('disabled', !canAfford);
        if (warn) {
            warn.style.display = canAfford ? 'none' : 'block';
            warn.textContent = seShort;
        }
    };

    check(tc, tw, finalTowerCost);
    check(sc, ssw, finalShrineCost);
    check(pc, psw, PURGE_COST);

    // Sync NEW badges based on existing notification flags or unseen collections
    const rBadge = document.getElementById('relics-new-badge');
    if (rBadge) {
        const rNotif = document.getElementById('relics-notif');
        if ((rNotif && rNotif.style.display === 'flex')) rBadge.style.display = 'block';
    }
    const eBadge = document.getElementById('equip-new-badge');
    if (eBadge) {
        const eNotif = document.getElementById('equip-notif');
        if ((eNotif && eNotif.style.display === 'flex')) eBadge.style.display = 'block';
    }
    const cBadge = document.getElementById('collections-new-badge');
    if (cBadge) {
        if (window.unseenItems && window.unseenItems.size > 0) cBadge.style.display = 'block';
    }
}

function flashResourceError(type) {
    if (type === 'se') {
        const cards = ['shrine-card', 'purge-card'];
        cards.forEach(id => {
            const card = document.getElementById(id);
            if (card && card.classList.contains('disabled')) {
                card.classList.add('shake');
                const warn = card.querySelector('.card-warning');
                if (warn) {
                    warn.style.background = '#ff0000';
                    warn.style.color = '#fff';
                    warn.style.boxShadow = '0 0 10px #f00';
                }
                setTimeout(() => card.classList.remove('shake'), 500);
            }
        });
    }
}

/* ─── Click & hover listeners ───────────────────────────────────────────── */
function initControlPanel() {
    // GameScene.enter re-runs this on every restart: listeners bind once, state still re-syncs.
    if (window._controlPanelInitialized) {
        if (typeof updateSummonButtonState === 'function') updateSummonButtonState();
        if (typeof updatePactCardUI === 'function') updatePactCardUI();
        return;
    }
    window._controlPanelInitialized = true;
    const T = window.t || ((k, f) => f);

    // 1. Summon Unit Card
    const towerCard = document.getElementById('tower-card');
    if (towerCard) {
        towerCard.addEventListener('mouseenter', () => {
            const reduction = (typeof getRelicBonus === 'function') ? getRelicBonus('summon_cost_reduction') : 0;
            const equipReduction = (typeof getEquipBonus === 'function') ? getEquipBonus('summon_cost_reduction') : 0;
            const cost = Math.max(5, Math.floor((typeof towerCost !== 'undefined' ? towerCost : 40) * (1.0 - equipReduction) - reduction));
            if (typeof updateInfo === 'function') {
                updateInfo(`
                    <div class="unit-info-title" style="color:#ffd700;">${window.SvgIcons ? window.SvgIcons.get('dice') : ''} ${T('ui.controls.summon_title', '소환')}</div>
                    <div class="unit-info-badge" style="background:rgba(255,215,0,0.1); border-color:rgba(255,215,0,0.2); color:#ffd700;">${T('ui.controls.summon_cost_label', '소환 비용')}: ${cost} SE</div>
                    <div class="unit-info-desc">${T('ui.controls.summon_desc', '수련생 퇴마사 또는 견습 퇴마사 중 하나를 무작위로 소환합니다.')}</div>
                `);
            }
        });
        towerCard.onclick = () => { if (typeof summonUnit === 'function') summonUnit(); };
    }

    // 2. Build Shrine Card
    const shrineCard = document.getElementById('shrine-card');
    if (shrineCard) {
        shrineCard.addEventListener('mouseenter', () => {
            const cost = (typeof shrineCost !== 'undefined') ? shrineCost : 100;
            if (typeof updateInfo === 'function') {
                updateInfo(`
                    <div class="unit-info-title" style="color:#00e5ff;">${window.SvgIcons ? window.SvgIcons.get('shrine') : ''} ${T('ui.controls.shrine_title', '성스러운 성소')}</div>
                    <div class="unit-info-badge" style="background:rgba(0,229,255,0.1); border-color:rgba(0,229,255,0.2); color:#00e5ff;">${T('ui.controls.shrine_cost_label', '건설 비용')}: ${cost} SE</div>
                    <div class="unit-info-desc">${T('ui.controls.shrine_desc', '전용 슬롯에 배치하여 주변 아군에게 강력한 공격력 버프를 제공합니다.')}</div>
                `);
            }
        });
        shrineCard.onclick = () => { if (typeof summonShrine === 'function') summonShrine(); };
    }

    // 3. Purge Portal Card
    const purgeCard = document.getElementById('purge-card');
    if (purgeCard) {
        purgeCard.addEventListener('mouseenter', () => {
            if (typeof updateInfo === 'function') {
                updateInfo(`
                    <div class="unit-info-title" style="color:#9400d3;">${window.SvgIcons ? window.SvgIcons.get('flame') : ''} ${T('ui.controls.purge_title', '공간 정화')}</div>
                    <div class="unit-info-badge" style="background:rgba(148,0,211,0.1); border-color:rgba(148,0,211,0.2); color:#9400d3;">${T('ui.controls.purge_cost_label', '정화 비용')}: ${PURGE_COST} SE</div>
                    <div class="unit-info-desc">${T('ui.controls.purge_desc', '즉시 포탈 오염도를 50% 제거합니다. 위기 상황에서 사용하십시오.')}</div>
                `);
            }
        });
        purgeCard.onclick = () => { if (typeof purgePortal === 'function') purgePortal(); };
    }

    // 4. Utility Systems (Relics, Equipment, Collections)
    const systems = {
        'relics-btn': { t: `${window.SvgIcons ? window.SvgIcons.get('urn') : ''} ${T('ui.controls.relics_title', '유물')}`, c: '#ff4500', d: T('ui.controls.relics_desc', '정화 중 획득한 보물로 아군 전체를 영구 강화합니다.'), open: 'relics-overlay' },
        'equip-btn': { t: `${window.SvgIcons ? window.SvgIcons.get('sword') : ''} ${T('ui.controls.equip_title', '장비')}`, c: '#00e5ff', d: T('ui.controls.equip_desc', '장착 시 특정 능력치를 대폭 상승시키는 고대의 무구입니다.'), open: 'equip-overlay' },
        'collections-btn': { t: `${window.SvgIcons ? window.SvgIcons.get('book') : ''} ${T('ui.controls.collections_title', '도감')}`, c: '#ffd700', d: T('ui.controls.collections_desc', '지금까지 조우한 악령들과 아군들의 상세 기록을 확인합니다.'), open: 'collections-overlay' }
    };

    Object.entries(systems).forEach(([id, info]) => {
        const el = document.getElementById(id);
        if (el) {
            // equip-btn hover owned by equipment_ui.js (renders Soul Crystal info).
            // relics-btn hover owned by relics_ui.js (renders Soul Fragment info).
            if (id !== 'equip-btn' && id !== 'relics-btn') {
                el.addEventListener('mouseenter', () => {
                    if (typeof updateInfo === 'function') {
                        updateInfo(`
                            <div class="unit-info-title" style="color:${info.c};">${info.t}</div>

                            <div class="unit-info-desc">${info.d}</div>
                        `);
                    }
                });
            }

            // NEW: Badge Clear logic when clicking system buttons
            el.addEventListener('click', () => {
                if (id === 'relics-btn') {
                    const b = document.getElementById('relics-new-badge');
                    if (b) b.style.display = 'none';
                    const notif = document.getElementById('relics-notif');
                    if (notif) notif.style.display = 'none';
                } else if (id === 'equip-btn') {
                    const b = document.getElementById('equip-new-badge');
                    if (b) b.style.display = 'none';
                    const notif = document.getElementById('equip-notif');
                    if (notif) notif.style.display = 'none';
                } else if (id === 'collections-btn') {
                    const b = document.getElementById('collections-new-badge');
                    if (b) b.style.display = 'none';
                }
            });
        }
    });

    // 5. Curse Pact Card
    const pactCard = document.getElementById('pact-card');
    if (pactCard) {
        pactCard.addEventListener('mouseenter', () => {
            const cp = window.cursePact || {};
            const unlocked = (typeof isPactUnlocked === 'function') ? isPactUnlocked() : false;
            const ready = (typeof isPactReady === 'function') ? isPactReady() : false;
            const stacks = cp.penaltyStacks || 0;
            const cd = cp.cooldownStages || 5;
            const cur = cp.stagesSinceSummon || 0;
            const statusLine = !unlocked
                ? T('ui.controls.pact_unlock_fmt', '스테이지 {stage}에 해금됩니다.').replace('{stage}', cp.unlockStage || 5)
                : ready
                    ? `<b style="color:#ffcce0;">${T('ui.controls.pact_ready', '소환 준비 완료')}</b>`
                    : T('ui.controls.pact_cooldown_fmt', '재사용까지 {cur}/{cd} 스테이지').replace('{cur}', cur).replace('{cd}', cd);
            const penaltyLine = stacks > 0
                ? `<div style="color:#ff5577;">⚠ ${T('ui.controls.pact_penalty_fmt', '무시 패널티: 적 체력 +{hp}%, SE −{se}%').replace('{hp}', stacks*10).replace('{se}', stacks*10)}</div>`
                : '';
            if (typeof updateInfo === 'function') {
                updateInfo(`
                    <div class="unit-info-title" style="color:#ff0066;">${window.SvgIcons ? window.SvgIcons.get('skull') : ''} ${T('ui.controls.pact_title', '저주의 계약')}</div>
                    <div class="unit-info-badge" style="background:rgba(255,0,102,0.1); border-color:rgba(255,0,102,0.3); color:#ff0066;">${statusLine}</div>
                    <div class="unit-info-desc">${T('ui.controls.pact_desc_fmt', '즉시 보스급 영혼을 소환합니다. 사냥 시 유물을 보장합니다. 재사용 {cd}스테이지마다 1회. {grace}스테이지 이상 소환하지 않으면 패널티가 누적됩니다.').replace('{cd}', cd).replace('{grace}', cp.overflowGraceStages || 2)}</div>
                    ${penaltyLine}
                `);
            }
        });
        pactCard.onclick = () => {
            if (typeof summonPactBoss === 'function') summonPactBoss();
        };
    }

    // 6. Settings card (click handler lives in overlays.js initPauseAndSettings)
    const settingsCard = document.getElementById('settings-btn');
    if (settingsCard) {
        settingsCard.addEventListener('mouseenter', () => {
            if (typeof updateInfo === 'function') {
                updateInfo(`
                    <div class="unit-info-title" style="color:#d8dde6;">${window.SvgIcons ? window.SvgIcons.get('gear') : ''} ${T('ui.settings.header', '[정화 설정]')}</div>
                    <div class="unit-info-desc">${T('ui.controls.settings_desc', '일시정지 · 튜토리얼 · 재시작')}</div>
                `);
            }
        });
    }

    if (window.EventBus) {
        EventBus.on(GAME_EVENTS.MONEY_CHANGED, () => {
            if (typeof updateSummonButtonState === 'function') updateSummonButtonState();
        });
        EventBus.on(GAME_EVENTS.STAGE_CHANGED, () => {
            if (typeof updatePactCardUI === 'function') updatePactCardUI();
        });
    }

    // Initial sync
    if (typeof updateSummonButtonState === 'function') updateSummonButtonState();
    if (typeof updatePactCardUI === 'function') updatePactCardUI();
}

// Window Exports
window.updateSummonButtonState = updateSummonButtonState;
window.flashResourceError      = flashResourceError;
window.initControlPanel        = initControlPanel;
