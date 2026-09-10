/* js/ui/info_panel.js - Unified Info Panel Management for Units, Enemies, and Shrines */

let infoResetTimer = null;
let infoSyncTimer = null;
window.infoPanelLockedUntil = 0;
window.lastInspectedTower = null;
window.lastInspectedEnemy = null;

const TIER_COLORS = { 1: "#ffffff", 2: "#00e5ff", 3: "#bf5af2", 4: "#ff9f0a" };
const ENEMY_TIER_COLORS = { 1: "#ff4500", 2: "#ff0000", 3: "#9400d3", 4: "#1a0a1a" };

function tabletCorners() {
    return `<span class="st-corner tl"></span><span class="st-corner tr"></span><span class="st-corner bl"></span><span class="st-corner br"></span>`;
}

const STAT_ICONS = {
    atk: `<svg viewBox="0 0 24 24" class="st-stat-svg atk" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 17.5 4 7V4h3l10.5 10.5"/><path d="m13 19 6-6"/><path d="m16 16 4 4"/><path d="m19 21 2-2"/><path d="M5 14 4 15"/></svg>`,
    spd: `<svg viewBox="0 0 24 24" class="st-stat-svg spd" fill="currentColor" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" fill-opacity="0.28"/></svg>`,
    rng: `<svg viewBox="0 0 24 24" class="st-stat-svg rng" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 1.5v3.5M12 19v3.5M1.5 12h3.5M19 12h3.5"/></svg>`,
    dps: `<svg viewBox="0 0 24 24" class="st-stat-svg dps" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 14a9 9 0 0 1 18 0"/><path d="M12 14 5.5 20.5"/><circle cx="12" cy="14" r="1.6" fill="currentColor" stroke="none"/></svg>`,
    crit: `<svg viewBox="0 0 24 24" class="st-stat-svg crit" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2.1 2.1M16.9 16.9 19 19M5 19l2.1-2.1M16.9 7.1 19 5"/></svg>`,
    kil: `<svg viewBox="0 0 24 24" class="st-stat-svg kil" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a8 8 0 0 0-8 8c0 2.8 1.4 4.8 3 5.9V19a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3.1c1.6-1.1 3-3.1 3-5.9a8 8 0 0 0-8-8z"/><circle cx="9" cy="11" r="1.6" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.6" fill="currentColor" stroke="none"/><path d="M10.5 16.5h3"/></svg>`,
};

function formatShort(n) {
    if (!isFinite(n)) return '∞';
    if (n < 1000)   return String(Math.round(n));
    if (n < 1e6)    return (n / 1e3).toFixed(n < 1e4 ? 1 : 0) + 'K';
    if (n < 1e9)    return (n / 1e6).toFixed(n < 1e7 ? 1 : 0) + 'M';
    if (n < 1e12)   return (n / 1e9).toFixed(n < 1e10 ? 1 : 0) + 'B';
    return (n / 1e12).toFixed(1) + 'T';
}

function getEffectiveDPS(tower) {
    const d = tower.data;
    if (!d || d.passive || d.instakill || !d.cooldown || d.cooldown <= 0) return null;
    const relicDmg = (typeof getRelicBonus === 'function') ? getRelicBonus('damage') : 0;
    const dmgMult  = (window.damageMultiplier || 1) * (1 + (tower.damageBonus || 0) + relicDmg);
    const chance   = (typeof computeCritChance === 'function') ? computeCritChance(tower) : 0.05;
    const mult     = (typeof computeCritMult   === 'function') ? computeCritMult(tower)   : 2.0;
    const effAtk   = d.damage * dmgMult * (1 + chance * (mult - 1));
    const fireRate = (1000 / d.cooldown) * (1 + (tower.speedBonus || 0));
    return effAtk * fireRate;
}

/** Number of units a shrine is currently buffing (recomputed live). */
function countShrineBuffed(tower) {
    if (!window.towers) return 0;
    const data = tower.data || {};
    const mastery = (typeof getRelicBonus === 'function') ? getRelicBonus('shrine_mastery') : 0;
    const rowSpan = (mastery > 0) ? 1 : 0;
    const isGlobal = data.rangeType === 'all';
    const shrineArea = tower.currentSlot ? tower.currentSlot.area : null;
    const shrineRow  = tower.currentSlot ? Math.floor(tower.currentSlot.index / 3) : -1;
    let n = 0;
    window.towers.forEach(t => {
        if (t.isShrine || t === tower) return;
        if (isGlobal) { n++; return; }
        if (!t.currentSlot || !shrineArea) return;
        if (t.currentSlot.area !== shrineArea) return;
        if (Math.abs(Math.floor(t.currentSlot.index / 3) - shrineRow) <= rowSpan) n++;
    });
    return n;
}

/**
 * Every volatile stat cell for a unit, as ready-to-inject HTML.
 * Shared by the initial render and the live sync so the two cannot drift.
 */
function unitStatDisplays(tower) {
    const data = tower.data || {};
    const _Tu = window.t || ((k, f) => f);
    const isPassive = !!data.passive;

    const baseDmg  = data.damage || 0;
    const bonusDmg = Math.round(baseDmg * ((window.damageMultiplier || 1) * (1 + (tower.damageBonus || 0)) - 1));
    const baseAS   = (data.cooldown > 0) ? (1000 / data.cooldown) : 0;
    const bonusAS  = baseAS * (tower.speedBonus || 0);

    const relicCountFor = (t) => (typeof countRelicStacks === 'function') ? countRelicStacks(t) : 0;

    const dpsRaw    = getEffectiveDPS(tower);
    const dmgRelics = relicCountFor('damage');

    const critChance = (typeof computeCritChance === 'function') ? computeCritChance(tower) : 0.05;
    const critMult   = (typeof computeCritMult   === 'function') ? computeCritMult(tower)   : 2.0;
    const critPct    = Math.round(critChance * 100);
    const critRelics = relicCountFor('crit_chance');
    const cdRelics   = relicCountFor('crit_damage');
    const critRelicChip = (critRelics + cdRelics) > 0 ? ` <span class="st-stat-sub">⚛${critRelics + cdRelics}</span>` : '';

    return {
        atk: isPassive ? '—' : (data.instakill ? _Tu('ui.info_panel.unit_instakill_disp', '즉사') : `${baseDmg}${bonusChip(bonusDmg)}`),
        spd: isPassive ? '—' : `${baseAS.toFixed(1)}${bonusChip(bonusAS, true)}`,
        rng: isPassive ? '—' : (data.globalRange ? _Tu('ui.info_panel.unit_global_range_disp', '전역') : `${data.range}${bonusChip(tower.rangeBonus || 0)}`),
        dps: (dpsRaw == null) ? '—' : `${formatShort(dpsRaw)}${dmgRelics > 0 ? `<span class="st-stat-sub">⚛${dmgRelics}</span>` : ''}`,
        // "/100%" overflowed the 3-col cell; the cap lives in the title instead.
        crit: isPassive ? '—' : `${critPct}%${critRelicChip}`,
        kil: String(tower.kills || 0),
        dpsTitle:  (dpsRaw == null) ? '' : `${dpsRaw.toFixed(1)} dps · ${dmgRelics} damage relic${dmgRelics === 1 ? '' : 's'}`,
        critTitle: isPassive ? '' : `${critPct}% / 100% cap · x${critMult.toFixed(2)} on crit · ${critRelics} chance + ${cdRelics} damage relics`
    };
}

/* ─── Live sync ─────────────────────────────────────────────────── */
// The panel used to render once on click, so kills, DPS, relic-driven crit,
// shrine buff counts, promote affordability and enemy HP all froze on screen.
// Patch just the volatile leaf nodes: a full re-render would restart the fade
// animation and rebuild the buttons out from under a press.
function syncInfoPanel() {
    const d = document.getElementById('unit-info');
    if (!d) return stopInfoSync();
    const mode = d.dataset.infoMode;

    if (mode === 'enemy') {
        const e = window.lastInspectedEnemy;
        if (!e || !window.enemies || window.enemies.indexOf(e) < 0) return resetInfoPanel();
        const cur = Math.floor(e.hp || 0);
        const max = Math.floor(e.maxHp || 1);
        const fill = document.getElementById('st-hp-fill');
        const text = document.getElementById('st-hp-text');
        if (fill) fill.style.width = `${Math.max(0, Math.min(100, (cur / max) * 100))}%`;
        if (text) text.innerHTML = `${window.SvgIcons ? window.SvgIcons.get('heart') : ''} ${cur} / ${max}`;
        return;
    }

    const tower = window.lastInspectedTower;
    if (!tower || !window.towers || window.towers.indexOf(tower) < 0) return resetInfoPanel();

    if (mode === 'shrine') {
        const c = document.getElementById('st-shrine-count');
        if (c) {
            const _Ti = window.t || ((k, f) => f);
            c.innerHTML = `${window.SvgIcons ? window.SvgIcons.get('broadcast') : ''} ${_Ti('ui.info_panel.shrine_buffed_fmt', '{n}명 강화').replace('{n}', countShrineBuffed(tower))}`;
        }
        return;
    }

    if (mode !== 'unit') return;
    const v = unitStatDisplays(tower);
    ['atk', 'spd', 'rng', 'dps', 'crit', 'kil'].forEach(k => {
        const el = document.getElementById(`st-v-${k}`);
        if (!el) return;
        if (el.innerHTML !== v[k]) el.innerHTML = v[k];
    });
    const dpsEl  = document.getElementById('st-v-dps');
    const critEl = document.getElementById('st-v-crit');
    if (dpsEl)  dpsEl.title  = v.dpsTitle;
    if (critEl) critEl.title = v.critTitle;

    const btn = document.getElementById('st-promote-btn');
    if (btn) {
        const canAfford = (window.money || 0) >= Number(btn.dataset.cost || 0);
        btn.classList.toggle('cant-afford', !canAfford);
    }
}

function startInfoSync() {
    if (infoSyncTimer) return;
    infoSyncTimer = setInterval(syncInfoPanel, 250);
}

function stopInfoSync() {
    if (infoSyncTimer) clearInterval(infoSyncTimer);
    infoSyncTimer = null;
}

/**
 * Resets the Info Panel to its default "Sacred Tablet" state.
 */
function resetInfoPanel() {
    const d = document.getElementById('unit-info');
    if (!d) return;

    stopInfoSync();
    clearInfoResetTimer();
    delete d.dataset.infoMode;
    d.classList.remove('inspecting');
    d.style.removeProperty('--inspect-color');
    d.style.removeProperty('--inspect-shadow');

    d.innerHTML = `
        <div class="st-shell st-default-shell">
            ${tabletCorners()}
            <div class="st-default">
                <div class="st-sigil">${window.SvgIcons ? window.SvgIcons.get('cross') : ''}</div>
                <div class="st-default-title">GATE OF HELL</div>
                <div class="st-default-sub">SACRED TABLET</div>
                <div class="st-rule"></div>
                <div class="st-lore">"${(window.t ? window.t('ui.info_panel.lore_default', '심연의 기록판은 영혼의 본질을 분석하여 정화의 길을 밝힙니다.') : '심연의 기록판은 영혼의 본질을 분석하여 정화의 길을 밝힙니다.')}"</div>
                <div class="st-hint">${(window.t ? window.t('ui.info_panel.hint_touch', '▾ 유닛 또는 적을 터치 ▾') : '▾ 유닛 또는 적을 터치 ▾')}</div>
            </div>
        </div>
    `;
    window.lastInspectedTower = null;
    window.lastInspectedEnemy = null;
}

/**
 * Starts a timer to return the panel to its default state after inactivity.
 */
function clearInfoResetTimer() {
    if (infoResetTimer) clearTimeout(infoResetTimer);
    infoResetTimer = null;
}

function startInfoResetTimer(delay = 8000) {
    if (infoResetTimer) clearTimeout(infoResetTimer);
    infoResetTimer = setTimeout(() => {
        infoResetTimer = null;
        window.infoPanelLockedUntil = 0;
        resetInfoPanel();
    }, delay);
}

function bonusChip(val, isSpeed = false) {
    if (Math.abs(val) < 0.01) return "";
    const pos = val > 0;
    const txt = isSpeed ? val.toFixed(1) : Math.round(val);
    return `<span class="st-stat-bonus ${pos ? 'pos' : 'neg'}">${pos ? '+' : ''}${txt}</span>`;
}

/**
 * Displays detailed information about an Ally Unit or Shrine.
 */
function showUnitInfo(tower) {
    const d = document.getElementById('unit-info');
    if (!d) return;

    window.lastInspectedTower = tower;
    window.lastInspectedEnemy = null;
    const data = tower.data;
    if (!data) return;

    const tier = data.tier || 1;
    const nameColor = tower.isShrine ? "#00ff88" : (TIER_COLORS[tier] || "#fff");

    d.classList.add('inspecting');
    d.style.setProperty('--inspect-color', nameColor);
    d.style.setProperty('--inspect-shadow', nameColor + '44');

    let body = "";

    if (tower.isShrine) {
        const buffedCount = countShrineBuffed(tower);
        const _Ti = window.t || ((k, f) => f);
        const scopeLbl = data.rangeType === 'all' ? _Ti('ui.info_panel.shrine_scope_global', '전역') : _Ti('ui.info_panel.shrine_scope_local', '근접');

        const _sName     = window.tShrine ? window.tShrine(data.type, 'name',     data.name)     : data.name;
        const _sDesc     = window.tShrine ? window.tShrine(data.type, 'desc',     data.desc)     : data.desc;
        const _sDemoDesc = window.tShrine ? window.tShrine(data.type, 'demoDesc', data.demoDesc) : data.demoDesc;
        body = `
            <div class="st-header shrine centered">
                <div class="st-header-text">
                    <div class="st-name-row">
                        <span class="st-name shrine">${_sName}</span>
                        <span class="st-tier-badge shrine">${_Ti('ui.info_panel.shrine_badge', '성소')}</span>
                    </div>
                    <div class="st-meta">
                        <span class="st-tag scope">${scopeLbl}</span>
                        <span class="st-tag count" id="st-shrine-count">${window.SvgIcons ? window.SvgIcons.get('broadcast') : ''} ${_Ti('ui.info_panel.shrine_buffed_fmt', '{n}명 강화').replace('{n}', buffedCount)}</span>
                    </div>
                </div>
            </div>
            <div class="st-lore-box shrine">${_sDesc}</div>
            <div class="st-warn-line">${_Ti('ui.info_panel.shrine_demo_prefix', '철거 시')}: ${_sDemoDesc}</div>
            <div class="st-action-row">
                <button class="st-btn demolish shrine" onclick="window.confirmSacrifice(window.lastInspectedTower)">${_Ti('ui.info_panel.shrine_demolish_btn', '성소 철거')}</button>
            </div>
        `;
    } else {
        const _Tu = window.t || ((k, f) => f);
        const v = unitStatDisplays(tower);

        let actionHtml = "";
        if (data.upgrades && data.upgrades.length > 0) {
            const cost = (typeof getPromotionCost === 'function') ? getPromotionCost(data.tier) : 200;
            const canAfford = (window.money || 0) >= cost;
            const btnClass = `st-btn promote tier${data.tier}${canAfford ? '' : ' cant-afford'}`;
            const label = data.tier === 1 ? _Tu('ui.info_panel.unit_promote_t1', "영혼 각성") : (data.tier === 2 ? _Tu('ui.info_panel.unit_promote_t2', "초월 각성") : _Tu('ui.info_panel.unit_promote_t3', "전설 승급"));
            const targetType = data.tier === 3 ? data.upgrades[0] : 'random';
            actionHtml = `
                <div class="st-action-row">
                    <button id="st-promote-btn" data-cost="${cost}" data-target="${targetType}" class="${btnClass}" onclick="window.performJobChange('${targetType}', true)"
                            onmouseenter="window.showTabletBtnTip(this, 'promote')" onmouseleave="window.hideTooltip && window.hideTooltip()">
                        <span class="st-btn-lbl">${label}</span>
                    </button>
                    <button class="st-btn demolish" onclick="window.confirmSacrifice(window.lastInspectedTower)"
                            onmouseenter="window.showTabletBtnTip(this, 'sacrifice')" onmouseleave="window.hideTooltip && window.hideTooltip()">${_Tu('ui.info_panel.unit_corrupt_btn', '타락')}</button>
                </div>`;
        } else {
            actionHtml = `
                <div class="st-action-row">
                    <button class="st-btn demolish full" onclick="window.confirmSacrifice(window.lastInspectedTower)"
                            onmouseenter="window.showTabletBtnTip(this, 'sacrifice')" onmouseleave="window.hideTooltip && window.hideTooltip()">${_Tu('ui.info_panel.unit_corrupt_full_btn', '타락 (Corrupted)')}</button>
                </div>`;
        }

        const _uName = window.tUnit ? window.tUnit(data.type, 'name', data.name) : data.name;
        const _uRole = window.tUnitRole ? (window.tUnitRole(data.role) || _Tu('ui.info_panel.unit_role_default', '퇴마사')) : (data.role || _Tu('ui.info_panel.unit_role_default', '퇴마사'));
        body = `
            <div class="st-header centered">
                <div class="st-header-text">
                    <div class="st-name-row">
                        <span class="st-role-chip tier${tier}">${_uRole}</span>
                        <span class="st-name" style="color:${nameColor};text-shadow:0 0 8px ${nameColor}66;">${_uName}</span>
                        <span class="st-tier-badge tier${tier}">T${tier}</span>
                    </div>
                </div>
            </div>
            <div class="st-stat-grid">
                <div class="st-stat"><div class="st-stat-ic atk">${STAT_ICONS.atk}</div><div class="st-stat-body"><div class="st-stat-lbl">ATK</div><div class="st-stat-val" id="st-v-atk">${v.atk}</div></div></div>
                <div class="st-stat"><div class="st-stat-ic spd">${STAT_ICONS.spd}</div><div class="st-stat-body"><div class="st-stat-lbl">SPD</div><div class="st-stat-val" id="st-v-spd">${v.spd}</div></div></div>
                <div class="st-stat"><div class="st-stat-ic rng">${STAT_ICONS.rng}</div><div class="st-stat-body"><div class="st-stat-lbl">RNG</div><div class="st-stat-val" id="st-v-rng">${v.rng}</div></div></div>
                <div class="st-stat"><div class="st-stat-ic dps">${STAT_ICONS.dps}</div><div class="st-stat-body"><div class="st-stat-lbl">DPS</div><div class="st-stat-val" id="st-v-dps" title="${v.dpsTitle}">${v.dps}</div></div></div>
                <div class="st-stat"><div class="st-stat-ic crit">${STAT_ICONS.crit}</div><div class="st-stat-body"><div class="st-stat-lbl">CRIT</div><div class="st-stat-val" id="st-v-crit" title="${v.critTitle}">${v.crit}</div></div></div>
                <div class="st-stat"><div class="st-stat-ic kil">${STAT_ICONS.kil}</div><div class="st-stat-body"><div class="st-stat-lbl">KIL</div><div class="st-stat-val" id="st-v-kil">${v.kil}</div></div></div>
            </div>
            ${actionHtml}
        `;
    }

    d.innerHTML = `<div class="st-shell">${tabletCorners()}${body}</div>`;
    d.dataset.infoMode = tower.isShrine ? 'shrine' : 'unit';
    startInfoSync();
    // Selection is sticky: the tablet holds this unit until something else is
    // picked or the board is clicked. A pending timer from a relic/equipment
    // popup would otherwise wipe the selection mid-inspection.
    clearInfoResetTimer();
    window.infoPanelLockedUntil = 0;
}

/**
 * Displays detailed information about an Enemy.
 */
function showEnemyInfo(enemy) {
    window.infoPanelLockedUntil = Date.now() + 5000;
    const d = document.getElementById('unit-info');
    if (!d || !enemy) return;

    const _Te = window.t || ((k, f) => f);
    const data = enemy.data || { name: "Unknown", desc: _Te('ui.info_panel.enemy_desc_unknown', "심연의 정체를 알 수 없는 존재입니다."), icon: "" };
    const tier = data.tier || 1;
    const curHp = Math.floor(enemy.hp || 0);
    const maxHp = Math.floor(enemy.maxHp || 1);
    const hpPct = Math.max(0, Math.min(100, (curHp / maxHp) * 100));

    const nameColor = ENEMY_TIER_COLORS[tier] || "#ff4500";

    window.lastInspectedEnemy = enemy;
    window.lastInspectedTower = null;
    d.classList.add('inspecting');
    d.style.setProperty('--inspect-color', nameColor);
    d.style.setProperty('--inspect-shadow', nameColor + '44');

    const _eName = (window.tEnemy && enemy.type) ? window.tEnemy(enemy.type, 'name', data.name) : data.name;
    const _eDesc = (window.tEnemy && enemy.type) ? window.tEnemy(enemy.type, 'desc', data.desc || '') : (data.desc || '');
    d.innerHTML = `
        <div class="st-shell evil">
            ${tabletCorners()}
            <div class="st-header evil centered">
                <div class="st-header-text">
                    <div class="st-name-row">
                        <span class="st-name evil" style="color:${nameColor};text-shadow:0 0 10px ${nameColor}88;">${_eName}</span>
                        <span class="st-tier-badge evil">T${tier}</span>
                    </div>
                </div>
            </div>
            <div class="st-hp-bar">
                <div class="st-hp-fill" id="st-hp-fill" style="width:${hpPct}%;background:linear-gradient(90deg,${nameColor},#ff1744);"></div>
                <div class="st-hp-text" id="st-hp-text">${window.SvgIcons ? window.SvgIcons.get('heart') : ''} ${curHp} / ${maxHp}</div>
            </div>
            <div class="st-lore-box evil" style="border-left-color:${nameColor};">${_eDesc}</div>
            <div class="st-flavor">"${_Te('ui.info_panel.enemy_flavor', '그의 본질이 기록판에 잠시 머뭅니다...')}"</div>
        </div>
    `;
    d.dataset.infoMode = 'enemy';
    startInfoSync();
    clearInfoResetTimer(); // sticky selection — see showUnitInfo
}

/**
 * Hover tooltip for the tablet's action buttons. Numbers are read at hover time
 * so they track SE, relic refund bonuses and promotions without a re-render.
 * Reuses the HUD's single global tooltip rather than adding another one.
 */
function showTabletBtnTip(el, kind) {
    if (typeof window.showTooltip !== 'function') return;
    const _T = window.t || ((k, f) => f);
    const tower = window.lastInspectedTower;
    if (!tower || !tower.data) return;

    if (kind === 'sacrifice') {
        // Mirrors executeSacrifice(): flat refund by tier, scaled by sell_refund relics.
        const tier = tower.data.tier || 1;
        const refundBase = (tier === 1) ? 15 : (tier === 2) ? 100 : 300;
        const bonus = (typeof getRelicBonus === 'function') ? getRelicBonus('sell_refund') : 0;
        const refund = Math.floor(refundBase * (1.0 + bonus));
        return window.showTooltip(
            el,
            _T('ui.info_panel.tip_sacrifice_title', '타락'),
            _T('ui.info_panel.tip_sacrifice_desc', '이 수호자를 심연으로 되돌려 자리를 비우고 소울 에너지를 일부 회수합니다. 되돌릴 수 없습니다.'),
            [{ label: _T('ui.info_panel.tip_refund_label', '회수'), val: `+${refund} SE` }],
            { wide: true }
        );
    }

    const cost = Number(el.dataset.cost || 0);
    const target = el.dataset.target || 'random';
    const stats = [{ label: _T('ui.info_panel.tip_cost_label', '비용'), val: `${cost} SE` }];

    let desc;
    if (target === 'random') {
        const n = (tower.data.upgrades || []).length;
        desc = _T('ui.info_panel.tip_promote_desc_random', '소울 에너지를 소모해 더 높은 등급의 퇴마사로 무작위 각성합니다.');
        stats.push({
            label: _T('ui.info_panel.tip_result_label', '결과'),
            val: _T('ui.info_panel.tip_result_random', '{n}종 중 무작위').replace('{n}', n)
        });
    } else {
        const nt = (window.unitTypes || []).find(u => u.type === target);
        const name = window.tUnit ? window.tUnit(target, 'name', (nt && nt.name) || target) : ((nt && nt.name) || target);
        desc = _T('ui.info_panel.tip_promote_desc_fixed', '소울 에너지를 소모해 지정된 상위 퇴마사로 승급합니다.');
        stats.push({ label: _T('ui.info_panel.tip_result_label', '결과'), val: name });
    }

    if ((window.money || 0) < cost) {
        desc += ' ' + _T('ui.info_panel.tip_cost_short', 'SE가 부족합니다.');
    }

    window.showTooltip(el, el.textContent.trim(), desc, stats);
}

/**
 * Displays a warning message in the Info Panel.
 */
function showSlotWarning(msg) {
    const d = document.getElementById('unit-info');
    if (!d) return;

    window.infoPanelLockedUntil = Date.now() + 3000;

    stopInfoSync();
    delete d.dataset.infoMode;
    d.classList.add('inspecting');
    d.style.setProperty('--inspect-color', '#ff1744');
    d.style.setProperty('--inspect-shadow', 'rgba(255,23,68,0.4)');

    d.innerHTML = `
        <div class="st-shell warn">
            ${tabletCorners()}
            <div class="st-warn-block">
                <div class="st-warn-icon">${window.SvgIcons ? window.SvgIcons.get('warning') : ''}</div>
                <div class="st-warn-title">${(window.t ? window.t('ui.info_panel.slot_warning_title', '배치 불가') : '배치 불가')}</div>
                <div class="st-warn-msg">${msg}</div>
                <div class="st-flavor">"${(window.t ? window.t('ui.info_panel.slot_warning_flavor', '이곳은 영혼의 조화가 허락되지 않은 자리입니다.') : '이곳은 영혼의 조화가 허락되지 않은 자리입니다.')}"</div>
            </div>
        </div>
    `;
    startInfoResetTimer(3000);
}

// Global Exports
window.resetInfoPanel = resetInfoPanel;
window.startInfoResetTimer = startInfoResetTimer;
window.clearInfoResetTimer = clearInfoResetTimer;
window.showUnitInfo = showUnitInfo;
window.showEnemyInfo = showEnemyInfo;
window.showSlotWarning = showSlotWarning;
window.syncInfoPanel   = syncInfoPanel;
window.showTabletBtnTip = showTabletBtnTip;
