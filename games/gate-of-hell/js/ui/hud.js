/* hud.js - HUD events, tooltips, gauge updates, floating pop-ups */

/* ─── Cached DOM refs for gauges (populated on first update) ────────────── */
let _hud = null;
function _initHud() {
    if (_hud) return;
    _hud = {
        moneyDisplay: document.getElementById('se-display-text'),
        peDisplay:    document.getElementById('portal-energy-label'),
        peFill:       document.getElementById('portal-gauge-fill'),
        seFill:       document.getElementById('se-gauge-fill'),
        peStatus:     document.getElementById('cursed-status'),
        peIcon:       document.getElementById('cursed-status-icon'),
        cursePeFill:  document.getElementById('curse-pe-fill'),
        stageBannerDepth: document.getElementById('sb-depth'),
        stageBannerTitle: document.getElementById('sb-title'),
        enemiesLeft:  document.getElementById('enemies-left'),
        rsFill:       document.getElementById('rs-gauge-fill'),
    };
    _applyStageBannerTitle();
    if (window.EventBus && typeof window.EventBus.on === 'function') {
        window.EventBus.on('i18n:changed', _applyStageBannerTitle);
        window.EventBus.on('i18n:ready',   _applyStageBannerTitle);
    }
}

function _applyStageBannerTitle() {
    if (!_hud || !_hud.stageBannerTitle) return;
    const _T = window.t || ((k, f) => f);
    _hud.stageBannerTitle.textContent = _T('ui.hud.stage_banner_title', '속삭이는 문');
}

/* ─── Gauge updates ─────────────────────────────────────────────────────── */
function updateGauges() {
    _initHud();
    const { moneyDisplay, peDisplay, peFill, seFill, peStatus, peIcon, cursePeFill } = _hud;

    const currentMoney = Math.floor(window.money);
    if (currentMoney !== window.lastMoney) {
        if (typeof spawnGaugePop === 'function') spawnGaugePop('se-label', currentMoney - window.lastMoney);
        window.lastMoney = currentMoney;
    }

    const currentPE = Math.floor(window.portalEnergy);
    if (currentPE !== window.lastPortalEnergy) {
        if (typeof spawnGaugePop === 'function') spawnGaugePop('pe-label', currentPE - window.lastPortalEnergy);
        window.lastPortalEnergy = currentPE;
    }

    if (moneyDisplay) moneyDisplay.innerText = `${currentMoney} / ${window.maxMoney}`;
    if (peDisplay) peDisplay.innerText = `${currentPE} / ${window.maxPortalEnergy}`;

    if (peFill) peFill.style.width = `${Math.min((window.portalEnergy / window.maxPortalEnergy) * 100, 100)}%`;
    if (seFill) seFill.style.width = `${Math.min((window.money / window.maxMoney) * 100, 100)}%`;

    const peRatio = window.portalEnergy / window.maxPortalEnergy;
    const pePct   = Math.floor(peRatio * 100);
    if (cursePeFill) {
        cursePeFill.style.width = `${Math.min(pePct, 100)}%`;
        cursePeFill.style.background = peRatio >= 0.75 ? '#ff2222' : peRatio >= 0.5 ? '#ff4500' : peRatio >= 0.3 ? '#ffa500' : '#44dd88';
    }
    if (peIcon) {
        const level = peRatio >= 0.75 ? '3' : peRatio >= 0.5 ? '2' : peRatio >= 0.3 ? '1' : '0';
        peIcon.setAttribute('data-level', level);
    }
    if (peStatus) {
        const _T = window.t || ((k, f) => f);
        if (peRatio >= 0.75) { peStatus.textContent = `${_T('ui.hud.curse_lv3', '심연의 저주 3단계')} (${pePct}%)`; peStatus.setAttribute('data-level', '3'); }
        else if (peRatio >= 0.5) { peStatus.textContent = `${_T('ui.hud.curse_lv2', '심연의 저주 2단계')} (${pePct}%)`; peStatus.setAttribute('data-level', '2'); }
        else if (peRatio >= 0.3) { peStatus.textContent = `${_T('ui.hud.curse_lv1', '심연의 저주 1단계')} (${pePct}%)`; peStatus.setAttribute('data-level', '1'); }
        else { peStatus.textContent = _T('ui.hud.cursed_status', '잠든 저주'); peStatus.setAttribute('data-level', '0'); }
    }
}

function updateStageInfo() {
    _initHud();
    const { stageBannerDepth, enemiesLeft: enemiesLeftLabel, rsFill } = _hud;
    if (stageBannerDepth) stageBannerDepth.innerText = window.stage;

    if (enemiesLeftLabel) {
        const killed = window.stageKilledCount || 0;
        const remaining = Math.max(0, window.totalStageEnemies - killed);
        const total = Math.max(1, window.totalStageEnemies);

        if (remaining !== window.lastEnemiesLeft && window.lastEnemiesLeft !== 0) {
            if (typeof spawnGaugePop === 'function') spawnGaugePop('rs-label', remaining - window.lastEnemiesLeft);
        }
        window.lastEnemiesLeft = remaining;
        enemiesLeftLabel.innerText = `${remaining} / ${total}`;
        const progress = Math.min(100, (remaining / total) * 100);
        if (rsFill) rsFill.style.width = `${progress}%`;
    }
}

/* ─── Floating ± numbers on gauges ──────────────────────────────────────── */
function spawnGaugePop(containerId, amount, customColor = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const bar = container.querySelector('.gauge-bar');
    if (!bar) return;
    const delta = Math.floor(amount);
    if (delta === 0) return;
    const abs = Math.abs(delta);

    const isPE = containerId === 'pe-label';
    const isRS = containerId === 'rs-label';
    // Good = SE gain | PE drop | RS drop
    const isGood = (isPE || isRS) ? delta < 0 : delta > 0;

    const classes = isGood ? 'pop-up green' : 'pop-down red';
    const color = customColor || (isGood ? '#00ff88' : '#ff1744');
    const sign = delta > 0 ? '+' : '-';

    const rect = bar.getBoundingClientRect();
    const div = document.createElement('div');
    div.className = `gauge-floating-num ${classes}`;
    div.innerText = `${sign}${abs}`;
    div.style.color = color;
    div.style.left = `${rect.right - 32}px`;
    div.style.top = `${rect.top + rect.height / 2}px`;
    document.body.appendChild(div);

    setTimeout(() => { if (div.parentNode) div.parentNode.removeChild(div); }, 1000);
}

/* ─── Init + EventBus subscriptions + tooltips ──────────────────────────── */
function initHUD() {
    if (window._hudInitialized) return;
    window._hudInitialized = true;
    const tooltip = document.getElementById('global-tooltip');
    const gameContainer = document.getElementById('game-container');

    // 1. Subscribe to State Changes via EventBus
    if (window.EventBus) {
        EventBus.on(GAME_EVENTS.MONEY_CHANGED, () => { if (typeof updateGauges === 'function') updateGauges(); });
        EventBus.on(GAME_EVENTS.PORTAL_ENERGY_CHANGED, () => { if (typeof updateGauges === 'function') updateGauges(); });
        EventBus.on(GAME_EVENTS.STAGE_CHANGED, () => { if (typeof updateStageInfo === 'function') updateStageInfo(); });
        EventBus.on(GAME_EVENTS.ENEMIES_COUNT_CHANGED, () => { if (typeof updateStageInfo === 'function') updateStageInfo(); });
        EventBus.on(GAME_EVENTS.FROZEN_OVERLAY, (show) => {
            const fo = document.getElementById('frozen-overlay');
            if (fo) fo.style.opacity = show ? 1 : 0;
        });
        EventBus.on(GAME_EVENTS.RELIC_NOTIF, ({ show } = {}) => {
            const n = document.getElementById('relics-notif');
            if (n) n.style.display = show ? 'flex' : 'none';
        });
        EventBus.on(GAME_EVENTS.EQUIP_NOTIF, ({ show } = {}) => {
            const n = document.getElementById('equip-notif');
            if (n) n.style.display = show ? 'flex' : 'none';
        });
    }

    const showTooltip = (targetEl, title, text, stats = []) => {
        if (!tooltip || !gameContainer) return;

        tooltip.style.visibility = 'hidden';
        tooltip.style.display = 'block';
        tooltip.style.left = '0px';
        tooltip.style.top = '0px';
        tooltip.style.transform = 'none';

        let statHtml = stats.map(s => `<div class="tooltip-stat"><span>${s.label}</span><span>${s.val}</span></div>`).join('');
        tooltip.innerHTML = `
            <div class="tooltip-title">${title}</div>
            <div class="tooltip-content">${text}</div>
            ${statHtml}
        `;

        // Lock width for curse/gargoyle widgets so both render identical size
        const fixedWidthTargets = ['cursed-status-container', 'sleeping-statue-widget', 'rs-label'];
        tooltip.classList.toggle('fixed-width', fixedWidthTargets.includes(targetEl.id));

        const rect = targetEl.getBoundingClientRect();
        const gameRect = gameContainer.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let x = (rect.left + rect.width / 2) - gameRect.left;
        let y = rect.top - gameRect.top - 8;
        tooltip.classList.remove('bottom-mode');
        let transformStr = 'translate(-50%, -100%)';

        if (y - tooltipRect.height < 0) {
            y = rect.bottom - gameRect.top + 8;
            tooltip.classList.add('bottom-mode');
            transformStr = 'translate(-50%, 0%)';
        }

        const halfWidth = tooltipRect.width / 2;
        if (x - halfWidth < 10) x = halfWidth + 10;
        if (x + halfWidth > gameRect.width - 10) x = gameRect.width - halfWidth - 10;

        tooltip.style.left = `${Math.floor(x)}px`;
        tooltip.style.top = `${Math.floor(y)}px`;
        tooltip.style.transform = transformStr;

        tooltip.style.visibility = 'visible';
    };

    // Listeners for HUD Elements
    const peStatusContainer = document.getElementById('cursed-status-container');
    if (peStatusContainer) {
        const getCurseTooltip = () => {
            const T = window.t || ((k, f) => f);
            const peRatio = (window.portalEnergy || 0) / (window.maxPortalEnergy || 1500);
            let title = peRatio >= 0.3
                ? `${window.SvgIcons ? window.SvgIcons.get('demon_face') : ''} ${T('ui.hud.curse_tooltip_title_active', '심연의 저주')}`
                : `${window.SvgIcons ? window.SvgIcons.get('moon_dark') : ''} ${T('ui.hud.curse_tooltip_title_dormant', '잠든 저주')}`;
            let desc = peRatio >= 0.3
                ? T('ui.hud.curse_tooltip_desc_active', "포탈 오염도가 높아져 고대의 저주가 발현되었습니다. 정화하여 오염도를 낮추십시오.")
                : T('ui.hud.curse_tooltip_desc_dormant', "저주가 아직 깨어나지 않았습니다. 오염도가 30%를 넘으면 활성화됩니다.");
            return {
                title,
                desc,
                stats: [
                    { label: T('ui.hud.curse_stat_lv1', "1단계 (30%↑)"), val: T('ui.hud.curse_stat_lv1_val', "전체 아군 공속 -5%") },
                    { label: T('ui.hud.curse_stat_lv2', "2단계 (50%↑)"), val: T('ui.hud.curse_stat_lv2_val', "전체 아군 공속 -10%") },
                    { label: T('ui.hud.curse_stat_lv3', "3단계 (75%↑)"), val: T('ui.hud.curse_stat_lv3_val', "전체 아군 공속 -20%") }
                ]
            };
        };

        peStatusContainer.onclick = (e) => {
            e.stopPropagation();
            const tooltip = document.getElementById('global-tooltip');
            if (tooltip.style.display === 'block' && window._lastTooltipTarget === peStatusContainer) {
                tooltip.style.display = 'none';
                window._lastTooltipTarget = null;
            } else {
                const data = getCurseTooltip();
                showTooltip(peStatusContainer, data.title, data.desc, data.stats);
                window._lastTooltipTarget = peStatusContainer;
            }
        };
    }

    const sleepingStatueWidget = document.getElementById('sleeping-statue-widget');
    if (sleepingStatueWidget) {
        const showSleepingStatueTooltip = () => {
            if (typeof getGargoyleForm !== 'function') return;
            const form = getGargoyleForm();
            const d = form.debuffs;
            const _Tg = window.t || ((k, f) => f);
            const _noDebuff = _Tg('ui.hud.gargoyle_no_debuff', '없음');
            const stats = [
                { label: _Tg('ui.hud.gargoyle_atk_speed', "공격 속도"), val: d.speed   < 0 ? `${Math.round(d.speed   * 100)}%` : _noDebuff },
                { label: _Tg('ui.hud.gargoyle_atk_range', "공격 사거리"), val: d.range  < 0 ? `${d.range}px`                   : _noDebuff },
                { label: _Tg('ui.hud.gargoyle_atk_damage', "공격 피해"), val: d.damage  < 0 ? `${Math.round(d.damage  * 100)}%` : _noDebuff },
                { label: _Tg('ui.hud.gargoyle_se_gain', "SE 획득"),  val: d.seGain  < 0 ? `${Math.round(d.seGain  * 100)}%` : _noDebuff }
            ];
            showTooltip(sleepingStatueWidget, `${window.SvgIcons ? window.SvgIcons.get('statue') : ''} ${form.name}`, form.desc, stats);
        };
        sleepingStatueWidget.onclick = (e) => {
            e.stopPropagation();
            const tooltip = document.getElementById('global-tooltip');
            if (tooltip.style.display === 'block' && window._lastTooltipTarget === sleepingStatueWidget) {
                tooltip.style.display = 'none';
                window._lastTooltipTarget = null;
            } else {
                showSleepingStatueTooltip();
                window._lastTooltipTarget = sleepingStatueWidget;
            }
        };
    }

    const seLabel = document.getElementById('se-label');
    if (seLabel) {
        seLabel.onclick = (e) => {
            e.stopPropagation();
            const _Ts = window.t || ((k, f) => f);
            showTooltip(seLabel, `${window.SvgIcons ? window.SvgIcons.get('spark') : ''} ${_Ts('ui.hud.se_tooltip_title', '소울 에너지 (SE)')}`, _Ts('ui.hud.se_tooltip_desc', "퇴마사를 소환하고 성소를 건립하는 데 필요한 영적인 에너지입니다."), [
                { label: _Ts('ui.hud.se_gain_label', "획득 방법"), val: _Ts('ui.hud.se_gain_method', "악령 처치") }
            ]);
        };
    }

    const peLabel = document.getElementById('pe-label');
    if (peLabel) {
        peLabel.onclick = (e) => {
            e.stopPropagation();
            const _Tp = window.t || ((k, f) => f);
            showTooltip(peLabel, `${window.SvgIcons ? window.SvgIcons.get('demon_face') : ''} ${_Tp('ui.hud.pe_tooltip_title', '포탈 오염도 (PE)')}`, _Tp('ui.hud.pe_tooltip_desc', "악령들이 포탈을 통과할 때 쌓이는 오염 수치입니다. 100% 도달 시 게임 오버."), [
                { label: _Tp('ui.hud.pe_purge_label', "정화 방법"), val: _Tp('ui.hud.pe_purge_method', "정화(Purge) 기능 사용") }
            ]);
        };
    }

    const rsLabel = document.getElementById('rs-label');
    if (rsLabel) {
        rsLabel.onclick = (e) => {
            e.stopPropagation();
            const _Tr = window.t || ((k, f) => f);
            showTooltip(rsLabel, `${window.SvgIcons ? window.SvgIcons.get('skull') : ''} ${_Tr('ui.hud.rs_tooltip_title', '남은 악령 (RS)')}`, _Tr('ui.hud.rs_tooltip_desc', "현재 스테이지를 클리어하기 위해 처치해야 할 악령의 총량입니다."), [
                { label: _Tr('ui.hud.rs_progress_label', "진행도"), val: _Tr('ui.hud.rs_progress_val', "처치 시 감소") }
            ]);
        };
    }

    document.addEventListener('click', (e) => {
        if (tooltip && !tooltip.contains(e.target)) {
            tooltip.style.display = 'none';
        }
    });

    // Initial sync
    if (typeof updateGauges === 'function') updateGauges();
    if (typeof updateStageInfo === 'function') updateStageInfo();
}

// Window Exports
window.initHUD         = initHUD;
window.updateGauges    = updateGauges;
window.updateStageInfo = updateStageInfo;
window.spawnGaugePop   = spawnGaugePop;
