/* relics_ui.js - Relics overlay: init, grid rendering, details, toasts */

// dropSource → { ko label, short tag, color } for collection UI badges.
function _buildRelicSourceMeta() {
    const T = window.t || ((k, f) => f);
    return {
        specter:      { label: T('ui.relics.src_specter', '망령'),         tag: '망', color: '#9ec5ff' },
        wraith:       { label: T('ui.relics.src_wraith', '원혼'),          tag: '원', color: '#b388ff' },
        spirit:       { label: T('ui.relics.src_spirit', '영혼'),          tag: '영', color: '#80e1d9' },
        all:          { label: T('ui.relics.src_all', '모든 적'),          tag: '전', color: '#cccccc' },
        demon:        { label: T('ui.relics.src_demon', '악마'),           tag: '악', color: '#ff7043' },
        abyssal_boss: { label: T('ui.relics.src_abyssal_boss', '심연의 보스'), tag: '심', color: '#ff1744' },
        supreme_boss: { label: T('ui.relics.src_supreme_boss', '계약의 보스'), tag: '계', color: '#ffd700' }
    };
}
function getRelicSourceMeta(src) {
    const meta = _buildRelicSourceMeta();
    return meta[src] || { label: src || (window.t ? window.t('ui.relics.src_unknown', '알 수 없음') : '알 수 없음'), tag: '?', color: '#888' };
}

// Global handler used by the <img onerror=...> attribute. Avoids interpolating
// raw SVG markup (with quotes) into an inline JS string literal.
window.__relicImgFallback = function (img, size, opacity, extraStyle) {
    const svg = (window.SvgIcons ? window.SvgIcons.get('relic_placeholder') : '');
    const span = document.createElement('span');
    span.innerHTML = svg;
    span.style.cssText = `display:inline-flex;align-items:center;justify-content:center;width:${size};height:${size};opacity:${opacity};${extraStyle || ''}`;
    const svgEl = span.querySelector('svg');
    if (svgEl) { svgEl.setAttribute('width', '100%'); svgEl.setAttribute('height', '100%'); }
    img.replaceWith(span);
};

// <img> for a relic. Falls back to SVG placeholder on error.
function relicIconImg(id, opts = {}) {
    const { size = '100%', opacity = 1, extraStyle = '' } = opts;
    const data = (typeof relicsData !== 'undefined') ? relicsData[id] : null;
    return `<img class="relic-icon-img" src="images/relics/${id}.webp" alt="${data?.name || id}" loading="lazy" `
         + `style="width:${size};height:${size};object-fit:contain;opacity:${opacity};${extraStyle}" `
         + `onerror="window.__relicImgFallback(this,'${size}',${opacity},'${extraStyle}')">`;
}

/* ─── SF badge in relics header + control-panel button ─────────────────── */
function updateRelicSfBadge() {
    const sf = window.soulFragments || 0;
    const headerBadge = document.getElementById('relic-sf-badge');
    if (headerBadge) headerBadge.textContent = `${sf} SF`;
    const btnBadge = document.getElementById('relics-sf-badge');
    if (btnBadge) btnBadge.textContent = `${sf} SF`;
    // Refresh craft buttons if grid rendered
    document.querySelectorAll('.relic-craft-btn[data-tier]').forEach(btn => _syncCraftBtn(btn));
}
window.updateRelicSfBadge = updateRelicSfBadge;

function _syncCraftBtn(btn) {
    const tierKey = btn.dataset.tier;
    const cost = (typeof getRelicCraftCost === 'function') ? getRelicCraftCost(tierKey) : 0;
    const sf = window.soulFragments || 0;
    const tierIds = Object.keys(relicsData).filter(id =>
        (typeof getRelicCraftTier === 'function') && getRelicCraftTier(relicsData[id].dropSource) === tierKey
    );
    const poolLeft = tierIds.some(id => (window.collectedRelics[id] || 0) < relicsData[id].maxStack);
    btn.disabled = sf < cost || !poolLeft;
    const _T = window.t || ((k, f) => f);
    btn.title = !poolLeft
        ? _T('ui.relics.craft_btn_title_empty', '제작 가능한 유물 없음 (모두 최대 중첩)')
        : _T('ui.relics.craft_btn_title_fmt', 'Soul Fragment {cost} 소모하여 무작위 유물 제작 (보유 {sf} SF)').replace('{cost}', cost).replace('{sf}', sf);
}

/* ─── Init / open-close handlers ────────────────────────────────────────── */
function initRelics() {
    const relicsBtn = document.getElementById('relics-btn');
    const closeBtn = document.getElementById('close-relics');
    updateRelicSfBadge();

    if (relicsBtn) {
        const setupRelicsModal = () => {
            if (typeof renderRelicsGrid === 'function') renderRelicsGrid();
            const notif = document.getElementById('relics-notif');
            if (notif) notif.style.display = 'none';
            updateRelicSfBadge();
        };
        relicsBtn.onclick = () => {
            if (window.SceneManager) {
                SceneManager.push(SCENES.MODAL, { id: 'relics-overlay', onOpen: setupRelicsModal });
            } else {
                const overlay = document.getElementById('relics-overlay');
                if (!overlay) return;
                overlay.style.display = 'flex';
                window.isPaused = true;
                setupRelicsModal();
            }
        };
        relicsBtn.onmouseenter = () => {
            const d = document.getElementById('unit-info');
            if (!d) return;
            const sf = window.soulFragments || 0;
            const normalCost  = (typeof getRelicCraftCost === 'function') ? getRelicCraftCost('normal')  : 30;
            const supremeCost = (typeof getRelicCraftCost === 'function') ? getRelicCraftCost('supreme') : 120;
            const T = window.t || ((k, f) => f);
            d.innerHTML = `
                <div class="unit-info-title" style="color:#ff4500;">${window.SvgIcons ? window.SvgIcons.get('urn') : ''} ${T('ui.controls.relics_title', '유물')}</div>
                <div class="unit-info-badge" style="background:rgba(255,69,0,0.1); border-color:rgba(255,69,0,0.25); color:#ff4500;">RELIC VAULT</div>
                <div class="unit-info-desc" style="color:#bbb;">${T('ui.controls.relics_desc', '정화 중 획득한 보물로 아군 전체를 영구 강화합니다.')}</div>
                <div style="color:#d6b4ff; font-size:clamp(11px, 2.4vw, 14px); font-weight:900; text-shadow:0 0 6px rgba(186,85,211,0.6);">◆ ${sf} SF</div>
                <div style="color:#888; font-size:clamp(8px, 1.5vw, 10px); line-height:1.25;">${T('ui.controls.relics_cost_fmt', '일반 {n} · 최상위 {s} SF').replace('{n}', normalCost).replace('{s}', supremeCost)}</div>
            `;
            if (typeof startInfoResetTimer === 'function') startInfoResetTimer();
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => {
            if (window.SceneManager) {
                SceneManager.pop();
            } else {
                const overlay = document.getElementById('relics-overlay');
                if (overlay) overlay.style.display = 'none';
                window.isPaused = false;
            }
        };
    }
}

/* ─── Info panel discovery notification ─────────────────────────────────── */
function showRelicInfoInPanel(id, status) {
    if (typeof showRelicToast === 'function') showRelicToast(id, status);
    const d = document.getElementById('unit-info');
    if (!d) return;
    const data = relicsData[id];
    window.infoPanelLockedUntil = Date.now() + 4000;
    const _Tr = window.t || ((k, f) => f);
    const rName   = window.tRelic ? window.tRelic(id, 'name',   data.name)   : data.name;
    const rEffect = window.tRelic ? window.tRelic(id, 'effect', data.effect) : data.effect;
    const rLore   = window.tRelic ? window.tRelic(id, 'lore',   data.lore)   : data.lore;
    d.innerHTML = `
        <div class="unit-info-title" style="color:#ff4500;">${window.SvgIcons ? window.SvgIcons.get('urn') : ''} ${_Tr('ui.relics.found_title', '유물 발견!')}</div>
        <div class="unit-info-badge" style="background:rgba(255,69,0,0.1); border-color:rgba(255,69,0,0.2); color:#ff4500;">New Discovery</div>
        <div style="width:46px;height:46px;margin:3px auto;">${relicIconImg(id, { size: '100%', opacity: 1 })}</div>
        <div style="color:#fff; font-size:11px; font-weight:bold; margin:2px 0;">${rName}</div>
        <div style="font-size:10px; color:#00ff00; line-height:1.2;">${_Tr('ui.relics.effect_label', '효과')}: ${rEffect}</div>
        <div class="info-divider" style="opacity:0.3;"></div>
        <div class="unit-info-desc" style="opacity:0.8;">"${rLore}"</div>
    `;
    setTimeout(() => { if (Date.now() >= (window.infoPanelLockedUntil || 0) - 50) { window.infoPanelLockedUntil = 0; if(typeof window.startInfoResetTimer === 'function') window.startInfoResetTimer(); }}, 4050);
}

/* ─── Side toast on discovery ───────────────────────────────────────────── */
function showRelicToast(id, status) {
    const data = relicsData[id];
    if (!data) return;
    const container = document.getElementById('top-panel') || document.getElementById('game-container') || document.body;
    const existing = document.getElementById('relic-toast');
    if (existing) { clearTimeout(window._relicToastTimer); existing.remove(); }

    if (!status) {
        const cnt = (window.collectedRelics && window.collectedRelics[id]) || 0;
        status = cnt <= 1 ? 'NEW' : 'EXISTING';
    }
    const badgeLabel = status === 'NEW' ? 'NEW' : 'EXISTING';
    const badgeClass = status === 'NEW' ? 'badge-new' : 'badge-existing';

    const toast = document.createElement('div');
    toast.id = 'relic-toast';
    toast.className = 'encounter-toast left-toast relic-toast card-toast';

    const bg = document.createElement('div');
    bg.className = 'card-toast-bg';
    bg.innerHTML = relicIconImg(id, { size: '100%', opacity: 1 });

    const badge = document.createElement('div');
    badge.className = `card-toast-badge ${badgeClass}`;
    badge.textContent = badgeLabel;

    const cornerKind = document.createElement('div');
    cornerKind.className = 'card-toast-kind';
    cornerKind.innerHTML = `${window.SvgIcons ? window.SvgIcons.get('urn') : ''} RELIC`;

    const overlay = document.createElement('div');
    overlay.className = 'card-toast-overlay';
    const _tName   = window.tRelic ? window.tRelic(id, 'name',   data.name)   : data.name;
    const _tEffect = window.tRelic ? window.tRelic(id, 'effect', data.effect || '') : (data.effect || '');
    overlay.innerHTML =
        `<div class="card-toast-sub">${_tEffect}</div>` +
        `<div class="card-toast-name">${_tName}</div>`;

    toast.appendChild(bg);
    toast.appendChild(cornerKind);
    toast.appendChild(badge);
    toast.appendChild(overlay);
    container.appendChild(toast);

    window._relicToastTimer = setTimeout(() => {
        toast.classList.add('encounter-toast-out');
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
    }, 5000);
    toast.addEventListener('click', () => {
        clearTimeout(window._relicToastTimer);
        toast.classList.add('encounter-toast-out');
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
    });
}

/* ─── Grid rendering ────────────────────────────────────────────────────── */
function renderRelicsGrid() {
    const grid = document.getElementById('relics-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // Update count badge in header — total stacks across all collected relics
    const badge = document.getElementById('relic-count-badge');
    if (badge && window.collectedRelics) {
        const total = Object.values(window.collectedRelics).reduce((s, n) => s + (n || 0), 0);
        const unique = Object.keys(window.collectedRelics).filter(k => window.collectedRelics[k] > 0).length;
        badge.textContent = `${unique} / ${total}`;
        const _Tbt = window.t || ((k, f) => f);
        badge.title = _Tbt('ui.relics.badge_title_fmt', '보유 종류 {u} / 총 {t}개').replace('{u}', unique).replace('{t}', total);
    }

    const allRelicIds = Object.keys(relicsData);
    const normalRelics = allRelicIds.filter(id => !['abyssal_boss', 'demon', 'supreme_boss'].includes(relicsData[id].dropSource));
    const supremeRelics = allRelicIds.filter(id => relicsData[id].dropSource === 'demon');
    const bossRelics = allRelicIds.filter(id => relicsData[id].dropSource === 'abyssal_boss');
    const ancientRelics = allRelicIds.filter(id => relicsData[id].dropSource === 'supreme_boss');

    const rarityClass = (id) => {
        const src = relicsData[id].dropSource;
        if (src === 'supreme_boss') return 'rarity-ancient';
        if (src === 'abyssal_boss') return 'rarity-boss';
        if (src === 'demon')        return 'rarity-supreme';
        return 'rarity-normal';
    };

    const createSlot = (id) => {
        const slot = document.createElement('div');
        const count = window.collectedRelics[id] || 0;
        const isCollected = count > 0;
        slot.className = `relic-slot ${rarityClass(id)} ${isCollected ? '' : 'empty'}`;

        const imgOpts = isCollected
            ? { size: '100%', opacity: 1 }
            : { size: '100%', opacity: 0.18, extraStyle: 'filter:grayscale(1) brightness(0.6);' };

        const srcMeta = getRelicSourceMeta(relicsData[id].dropSource);
        let inner = `<div class="relic-slot-art">${relicIconImg(id, imgOpts)}</div>`;
        inner += `<div class="relic-slot-source" style="color:${srcMeta.color}; border-color:${srcMeta.color};" title="${(window.t ? window.t('ui.relics.source_label', '출처') : '출처')}: ${srcMeta.label}">${srcMeta.tag}</div>`;
        if (count > 1) {
            inner += `<div class="relic-count-badge">x${count}</div>`;
        }
        slot.innerHTML = inner;

        slot.addEventListener('mouseenter', () => { showRelicDetail(id); });

        if (isCollected) {
            slot.addEventListener('click', () => {
                document.querySelectorAll('.relic-slot').forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
                showRelicDetail(id);
                if (window.unseenItems && window.unseenItems.has(id)) {
                    window.unseenItems.delete(id);
                    const badge = slot.querySelector('.item-new-badge');
                    if (badge) badge.remove();
                    if (typeof saveGameData === 'function') saveGameData();
                }
            });
        }
        return slot;
    };

    const addSection = (title, ids, rarity, color, craftTierKey) => {
        if (ids.length === 0) return;
        const section = document.createElement('div');
        section.className = `relic-section rarity-${rarity}`;
        section.style.setProperty('--sec-color', color);
        const ownedCount = ids.filter(i => (window.collectedRelics[i] || 0) > 0).length;

        let craftBtnHtml = '';
        if (craftTierKey && typeof getRelicCraftCost === 'function') {
            const cost = getRelicCraftCost(craftTierKey);
            const _Tcr = window.t || ((k, f) => f);
            craftBtnHtml = `<button class="relic-craft-btn" data-tier="${craftTierKey}">` +
                `<span class="craft-label">${_Tcr('ui.relics.craft_btn', '제작')}</span>` +
                `<span class="craft-cost">${cost} SF</span>` +
                `</button>`;
        }

        const header = `<div class="relic-section-header">` +
            `<span class="sec-mark">◆</span>` +
            `<span class="sec-title">${title}</span>` +
            `<span class="sec-count">${ownedCount}/${ids.length}</span>` +
            craftBtnHtml +
            `</div>`;
        const subgrid = document.createElement('div');
        subgrid.className = 'relic-section-grid';
        ids.forEach(id => subgrid.appendChild(createSlot(id)));
        section.innerHTML = header;
        section.appendChild(subgrid);

        const cb = section.querySelector('.relic-craft-btn');
        if (cb) {
            _syncCraftBtn(cb);
            cb.addEventListener('click', (e) => {
                e.stopPropagation();
                const tk = cb.dataset.tier;
                if (typeof craftRelicByTier !== 'function') return;
                const res = craftRelicByTier(tk);
                if (!res.ok) {
                    const _Tcb = window.t || ((k, f) => f);
                    if (res.reason === 'no-sf' && typeof GameLogger !== 'undefined') {
                        GameLogger.warn(_Tcb('ui.relics.craft_no_sf_warn', 'Soul Fragment 부족 (필요 {cost})').replace('{cost}', res.cost));
                    } else if (res.reason === 'pool-empty' && typeof GameLogger !== 'undefined') {
                        GameLogger.warn(_Tcb('ui.relics.craft_pool_empty_warn', '제작 가능한 유물 없음'));
                    }
                    return;
                }
                renderRelicsGrid();
                updateRelicSfBadge();
            });
        }

        grid.appendChild(section);
    };

    const _Ts = window.t || ((k, f) => f);
    addSection(_Ts('ui.relics.section_normal', '일반 유물'),     normalRelics,   'normal',  '#aaaaaa', 'normal');
    addSection(_Ts('ui.relics.section_supreme', '최상위 유물'),  supremeRelics,  'supreme', '#ff4500', 'supreme');
    addSection(_Ts('ui.relics.section_boss', '지배자의 유물'),   bossRelics,     'boss',    '#ff1744', null);
    addSection(_Ts('ui.relics.section_ancient', '고대 유물'),    ancientRelics,  'ancient', '#ffd700', null);

    renderTotalBonuses();
}

/* ─── Detail pane ───────────────────────────────────────────────────────── */
function showRelicDetail(id) {
    const infoPane = document.getElementById('relic-info-pane');
    if (!infoPane) return;
    const data = relicsData[id];
    const count = window.collectedRelics[id] || 0;

    const owned = count > 0;
    const imgOpts = owned ? { size: '92%', opacity: 1 } : { size: '92%', opacity: 0.3, extraStyle: 'filter:grayscale(1);' };

    const T = window.t || ((k, f) => f);
    const srcMeta = getRelicSourceMeta(data.dropSource);
    const ownedDisp = owned ? T('ui.relics.owned_fmt', '보유 ×{n}').replace('{n}', count) : T('ui.relics.not_owned', '미획득');
    const rdName   = window.tRelic ? window.tRelic(id, 'name',   data.name)   : data.name;
    const rdEffect = window.tRelic ? window.tRelic(id, 'effect', data.effect) : data.effect;
    const rdLore   = window.tRelic ? window.tRelic(id, 'lore',   data.lore)   : data.lore;
    infoPane.innerHTML = `
        <div class="relic-detail-art ${owned ? '' : 'empty'}">${relicIconImg(id, imgOpts)}</div>
        <div class="relic-detail-body">
            <div class="relic-detail-title">${rdName} <span style="font-size:9px; opacity:0.7;">(${ownedDisp})</span></div>
            <div class="relic-detail-effect">${rdEffect}</div>
            <div class="relic-detail-source" style="color:${srcMeta.color}; border-color:${srcMeta.color}33; background:${srcMeta.color}14;">${T('ui.relics.source_label', '출처')}: <b>${srcMeta.label}</b></div>
            <div class="col-detail-divider" style="background:linear-gradient(90deg, transparent, rgba(255,69,0,0.3), transparent);"></div>
            <div class="relic-detail-lore">"${rdLore}"</div>
        </div>
    `;
}

/* ─── Total aggregated bonuses ──────────────────────────────────────────── */
function renderTotalBonuses() {
    const pane = document.getElementById('relic-bonus-pane');
    if (!pane) return;
    const _Tb = window.t || ((k, f) => f);
    pane.innerHTML = `<div class="relic-bonus-title">${_Tb('ui.relics.total_bonus', '총 유물 보너스')}</div>`;

    if (typeof updateTotalRelicBonuses === 'function') updateTotalRelicBonuses();

    const labels = {
        damage:                  _Tb('ui.relics.bonus_damage', "공격력 증가"),
        range:                   _Tb('ui.relics.bonus_range', "사거리 증가"),
        cooldown:                _Tb('ui.relics.bonus_cooldown', "공격 속도 증가"),
        crit_chance:             _Tb('ui.relics.bonus_crit_chance', "치명타 확률"),
        crit_damage:             _Tb('ui.relics.bonus_crit_damage', "치명타 피해량"),
        slow_strength:           _Tb('ui.relics.bonus_slow_strength', "둔화 효과 강화"),
        portal_dmg_reduction:    _Tb('ui.relics.bonus_portal_dmg_reduction', "포탈 안정성"),
        summon_cost_reduction:   _Tb('ui.relics.bonus_summon_cost_reduction', "소환 비용 절감"),
        execute_threshold:       _Tb('ui.relics.bonus_execute_threshold', "처형 임계치"),
        aura_range:              _Tb('ui.relics.bonus_aura_range', "범위 확장"),
        sell_refund:             _Tb('ui.relics.bonus_sell_refund', "판매 환급 보너스"),
        shrine_mastery:          _Tb('ui.relics.bonus_shrine_mastery', "성소 통달"),
        se_max_limit:            _Tb('ui.relics.bonus_se_max_limit', "SE 최대치 확장"),
        crit_chain:              _Tb('ui.relics.bonus_crit_chain', "사슬 번개 피해"),
        portal_heal_chance:      _Tb('ui.relics.bonus_portal_heal_chance', "영혼 환류 확률"),
        echo_shot_chance:        _Tb('ui.relics.bonus_echo_shot_chance', "잔향 공격 확률"),
        combo_damage:            _Tb('ui.relics.bonus_combo_damage', "콤보 피해 증가"),
        death_save:              _Tb('ui.relics.bonus_death_save', "영혼 부활 충전"),
        surge_interval_reduction: _Tb('ui.relics.bonus_surge_interval_reduction', "심연 가속 중첩"),
        void_mark_cap:           _Tb('ui.relics.bonus_void_mark_cap', "공허 표식 한도"),
        adjacency_damage:        _Tb('ui.relics.bonus_adjacency_damage', "인접 결속 피해"),
        ledger_stacks:           _Tb('ui.relics.bonus_ledger_stacks', "영혼 청구서 중첩")
    };

    let bonusHtml = '';
    for (let key in labels) {
        const val = (typeof getRelicBonus === 'function') ? getRelicBonus(key) : 0;
        if (val !== 0) {
            let dispVal = "";
            if (['damage', 'cooldown', 'crit_chance', 'crit_damage', 'slow_strength', 'portal_dmg_reduction', 'sell_refund', 'shrine_mastery', 'execute_threshold', 'treasure_chance', 'crit_chain', 'portal_heal_chance', 'echo_shot_chance', 'combo_damage', 'adjacency_damage'].includes(key)) {
                dispVal = `+${(val * 100).toFixed(0)}%`;
            } else {
                dispVal = `+${val.toFixed(0)}`;
            }
            bonusHtml += `
                <div class="relic-bonus-item">
                    <span>${labels[key]}</span>
                    <span class="val">${dispVal}</span>
                </div>
            `;
        }
    }
    pane.innerHTML += bonusHtml;
}

// Window Exports
window.initRelics           = initRelics;
window.showRelicInfoInPanel = showRelicInfoInPanel;
window.showRelicToast       = showRelicToast;
window.renderRelicsGrid     = renderRelicsGrid;
window.showRelicDetail      = showRelicDetail;
window.renderTotalBonuses   = renderTotalBonuses;
window.updateRelicSfBadge   = updateRelicSfBadge;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRelics);
} else {
    initRelics();
}
