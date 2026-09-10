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
        // Short form only: the full "심연의 저주 N단계 (pct%)" string (~85px) overflowed the
        // 56px widget and covered the shrine slot beside it. Full name lives in the tooltip.
        const lvl = peRatio >= 0.75 ? 3 : peRatio >= 0.5 ? 2 : peRatio >= 0.3 ? 1 : 0;
        peStatus.textContent = lvl ? `Lv.${lvl} ${pePct}%` : _T('ui.hud.cursed_status', '잠든 저주');
        peStatus.setAttribute('data-level', String(lvl));
    }
    const peBar = document.querySelector('.gauge-bar.pe');
    if (peBar) peBar.classList.toggle('danger', peRatio >= 0.75);
}

function updateStageInfo() {
    _initHud();
    const { stageBannerDepth, enemiesLeft: enemiesLeftLabel, rsFill } = _hud;
    if (stageBannerDepth) stageBannerDepth.innerText = window.stage;
    const banner = document.getElementById('stage-banner');
    if (banner) banner.classList.toggle('boss', window.stage % 10 === 0);

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

    const showTooltip = (targetEl, title, text, stats = [], opts = {}) => {
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
        // Set before the measure below, so the wider box is positioned correctly.
        tooltip.classList.toggle('wide', !!opts.wide);

        const rect = targetEl.getBoundingClientRect();
        const gameRect = gameContainer.getBoundingClientRect();
        // Layout size, not the client rect: tooltipPop starts at scale(0.9), so a
        // rect measured here reads 10% small and the edge clamp lets the box hang out.
        const tipW = tooltip.offsetWidth;
        const tipH = tooltip.offsetHeight;

        let x = (rect.left + rect.width / 2) - gameRect.left;
        let y = rect.top - gameRect.top - 8;
        tooltip.classList.remove('bottom-mode');
        let transformStr = 'translate(-50%, -100%)';

        if (y - tipH < 0) {
            y = rect.bottom - gameRect.top + 8;
            tooltip.classList.add('bottom-mode');
            transformStr = 'translate(-50%, 0%)';
        }

        const halfWidth = tipW / 2;
        if (x - halfWidth < 10) x = halfWidth + 10;
        if (x + halfWidth > gameRect.width - 10) x = gameRect.width - halfWidth - 10;

        tooltip.style.left = `${Math.floor(x)}px`;
        tooltip.style.top = `${Math.floor(y)}px`;
        tooltip.style.transform = transformStr;

        tooltip.style.visibility = 'visible';
    };

    // Click-toggle: a second tap on the same trigger closes the tooltip.
    const toggleTooltip = (el, getData) => {
        if (tooltip && tooltip.style.display === 'block' && window._lastTooltipTarget === el) {
            tooltip.style.display = 'none';
            window._lastTooltipTarget = null;
            return;
        }
        const d = getData();
        if (!d) return;
        showTooltip(el, d.title, d.desc, d.stats);
        window._lastTooltipTarget = el;
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

        peStatusContainer.onclick = (e) => { e.stopPropagation(); toggleTooltip(peStatusContainer, getCurseTooltip); };
    }

    const sleepingStatueWidget = document.getElementById('sleeping-statue-widget');
    if (sleepingStatueWidget) {
        const getSleepingStatueTooltip = () => {
            if (typeof getGargoyleForm !== 'function') return null;
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
            return { title: `${window.SvgIcons ? window.SvgIcons.get('statue') : ''} ${form.name}`, desc: form.desc, stats };
        };
        sleepingStatueWidget.onclick = (e) => { e.stopPropagation(); toggleTooltip(sleepingStatueWidget, getSleepingStatueTooltip); };
    }

    const seLabel = document.getElementById('se-label');
    if (seLabel) {
        seLabel.onclick = (e) => {
            e.stopPropagation();
            const _T = window.t || ((k, f) => f);
            toggleTooltip(seLabel, () => ({
                title: `${window.SvgIcons ? window.SvgIcons.get('spark') : ''} ${_T('ui.hud.se_tooltip_title', '소울 에너지 (SE)')}`,
                desc: _T('ui.hud.se_tooltip_desc', "퇴마사를 소환하고 성소를 건립하는 데 필요한 영적인 에너지입니다."),
                stats: [{ label: _T('ui.hud.se_gain_label', "획득 방법"), val: _T('ui.hud.se_gain_method', "악령 처치") }]
            }));
        };
    }

    const peLabel = document.getElementById('pe-label');
    if (peLabel) {
        peLabel.onclick = (e) => {
            e.stopPropagation();
            const _T = window.t || ((k, f) => f);
            toggleTooltip(peLabel, () => ({
                title: `${window.SvgIcons ? window.SvgIcons.get('demon_face') : ''} ${_T('ui.hud.pe_tooltip_title', '포탈 오염도 (PE)')}`,
                desc: _T('ui.hud.pe_tooltip_desc', "악령들이 포탈을 통과할 때 쌓이는 오염 수치입니다. 100% 도달 시 게임 오버."),
                stats: [{ label: _T('ui.hud.pe_purge_label', "정화 방법"), val: _T('ui.hud.pe_purge_method', "정화(Purge) 기능 사용") }]
            }));
        };
    }

    const rsLabel = document.getElementById('rs-label');
    if (rsLabel) {
        rsLabel.onclick = (e) => {
            e.stopPropagation();
            const _T = window.t || ((k, f) => f);
            toggleTooltip(rsLabel, () => ({
                title: `${window.SvgIcons ? window.SvgIcons.get('skull') : ''} ${_T('ui.hud.rs_tooltip_title', '남은 악령 (RS)')}`,
                desc: _T('ui.hud.rs_tooltip_desc', "현재 스테이지를 클리어하기 위해 처치해야 할 악령의 총량입니다."),
                stats: [{ label: _T('ui.hud.rs_progress_label', "진행도"), val: _T('ui.hud.rs_progress_val', "처치 시 감소") }]
            }));
        };
    }

    document.addEventListener('click', (e) => {
        if (tooltip && !tooltip.contains(e.target)) {
            tooltip.style.display = 'none';
        }
    });

    // Relics / Sacred Armory cards: hover shows the running total of every
    // active effect, so the player can check it without opening the panel.
    const bindTotalsTip = (id, titleKey, titleFallback, getLines, emptyKey, emptyFallback) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('mouseenter', () => {
            const _T = window.t || ((k, f) => f);
            const lines = (typeof getLines === 'function') ? getLines() : [];
            showTooltip(
                el,
                _T(titleKey, titleFallback),
                lines.length ? '' : _T(emptyKey, emptyFallback),
                lines,
                { wide: true }
            );
        });
        el.addEventListener('mouseleave', () => { if (window.hideTooltip) window.hideTooltip(); });
    };
    bindTotalsTip('relics-btn', 'ui.relics.total_bonus', '총 유물 보너스',
        () => (typeof window.getRelicBonusLines === 'function' ? window.getRelicBonusLines() : []),
        'ui.relics.tip_no_relics', '획득한 유물이 없습니다.');
    bindTotalsTip('equip-btn', 'ui.equipment.total_bonus', '총 장비 효과',
        () => (typeof window.getEquipBonusLines === 'function' ? window.getEquipBonusLines({ byStat: true }) : []),
        'ui.equipment.no_equip', '장착된 장비가 없습니다.');

    // Exported so other panels (e.g. the Sacred Tablet buttons) reuse this one
    // tooltip instead of growing a second implementation.
    window.showTooltip = showTooltip;
    window.hideTooltip = () => {
        if (!tooltip) return;
        tooltip.style.display = 'none';
        window._lastTooltipTarget = null;
    };

    // Initial sync
    if (typeof updateGauges === 'function') updateGauges();
    if (typeof updateStageInfo === 'function') updateStageInfo();
}

// Window Exports
window.initHUD         = initHUD;
window.updateGauges    = updateGauges;
window.updateStageInfo = updateStageInfo;
window.spawnGaugePop   = spawnGaugePop;
