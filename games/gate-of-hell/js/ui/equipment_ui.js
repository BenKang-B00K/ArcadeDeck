/* equipment_ui.js - Equipment overlay: init, grid, details, toasts */

const EQUIP_TIER_COLORS = ['', '#aaaaaa', '#00ff88', '#ff44ff', '#ffd700', '#00e5ff', '#ff3d00'];

// Global handler used by the <img onerror=...> attribute. Avoids interpolating
// raw SVG markup (with quotes) into an inline JS string literal.
window.__equipImgFallback = function (img, size, opacity, extraStyle) {
    const svg = (window.SvgIcons ? window.SvgIcons.get('equip_placeholder') : '');
    const span = document.createElement('span');
    span.innerHTML = svg;
    span.style.cssText = `display:inline-flex;align-items:center;justify-content:center;width:${size};height:${size};opacity:${opacity};${extraStyle || ''}`;
    const svgEl = span.querySelector('svg');
    if (svgEl) { svgEl.setAttribute('width', '100%'); svgEl.setAttribute('height', '100%'); }
    img.replaceWith(span);
};

// Returns <img> HTML for a slot's icon. Falls back to SVG placeholder if image missing.
function equipIconImg(slotKey, opts = {}) {
    const { size = '100%', opacity = 1, extraStyle = '' } = opts;
    const slotData = (typeof equipmentSlots !== 'undefined') ? equipmentSlots[slotKey] : null;
    return `<img class="equip-icon-img" src="images/equipment/${slotKey}.webp" alt="${slotData?.name || slotKey}" loading="lazy" `
         + `style="width:${size};height:${size};object-fit:contain;opacity:${opacity};${extraStyle}" `
         + `onerror="window.__equipImgFallback(this,'${size}',${opacity},'${extraStyle}')">`;
}

/* ─── SC badge on equipment button ─────────────────────────────────────── */
function updateEquipScBadge() {
    const badge = document.getElementById('equip-sc-badge');
    if (!badge) return;
    const n = window.soulCrystals || 0;
    badge.textContent = `${n} SC`;
    // Also refresh detail-pane reroll button if visible
    const rerollBtn = document.getElementById('equip-reroll-btn');
    if (rerollBtn && rerollBtn.dataset.slot) _syncRerollBtn(rerollBtn);
}
window.updateEquipScBadge = updateEquipScBadge;

function _syncRerollBtn(btn) {
    const slot = btn.dataset.slot;
    const owned = window.ownedEquipment[slot];
    if (!owned || owned.tier <= 0) { btn.disabled = true; return; }
    const cost = (typeof getRerollCost === 'function') ? getRerollCost(owned.tier) : 0;
    const sc = window.soulCrystals || 0;
    btn.disabled = sc < cost;
    btn.querySelector('.reroll-cost').textContent = `${cost} SC`;
    btn.querySelector('.reroll-stock').textContent = (window.t ? window.t('ui.equipment.reroll_stock_fmt', '보유 {n}') : '보유 {n}').replace('{n}', sc);
}

/* ─── Init / open-close handlers ────────────────────────────────────────── */
function initEquipment() {
    const equipBtn = document.getElementById('equip-btn');
    const closeBtn = document.getElementById('close-equip');
    updateEquipScBadge();

    if (equipBtn) {
        const setupEquipModal = () => {
            if (typeof renderEquipGrid === 'function') renderEquipGrid('all');
            const notif = document.getElementById('equip-notif');
            if (notif) notif.style.display = 'none';
            updateEquipScBadge();
        };
        equipBtn.onclick = () => {
            if (window.SceneManager) {
                SceneManager.push(SCENES.MODAL, { id: 'equip-overlay', onOpen: setupEquipModal });
            } else {
                const overlay = document.getElementById('equip-overlay');
                if (!overlay) return;
                overlay.style.display = 'flex';
                window.isPaused = true;
                setupEquipModal();
            }
        };
        equipBtn.onmouseenter = () => {
            const d = document.getElementById('unit-info');
            if (d) {
                const T = window.t || ((k, f) => f);
                const sc = window.soulCrystals || 0;
                d.innerHTML = `
                    <div class="unit-info-title" style="color:#00e5ff;">${T('ui.controls.equip_manage_title', '신성한 장비고')}</div>
                    <div class="unit-info-badge" style="background:#006064; border-color:#00838f; color:#fff;">${T('ui.equipment.default_subtitle', 'SACRED ARMORY')}</div>
                    <div class="unit-info-desc" style="color:#bbb;">${T('ui.controls.equip_manage_desc', '심연에서 획득한 성스러운 무구들을 관리하고 강화합니다.')}</div>
                    <div class="info-divider" style="opacity:0.3;"></div>
                    <div style="color:#4dd0e1; font-size: calc(clamp(12px, 2.8vw, 16px) * var(--fs)); font-weight:900; text-shadow:0 0 8px rgba(77,208,225,0.7);">◆ ${T('ui.equipment.sc_label', 'Soul Crystal')}: ${sc} SC</div>
                    <div style="color:#aaa; font-size: calc(clamp(9px, 1.8vw, 12px) * var(--fs)); margin-top:3px; line-height:1.3;">${T('ui.equipment.sc_row_title', '적 처치 시 드물게 획득. 장비 재계시에 사용.')}</div>
                    <div class="info-divider" style="opacity:0.3;"></div>
                    <div style="color:#555; font-style:italic; font-size: calc(clamp(7px, 1.4vw, 10px) * var(--fs));">"${T('ui.controls.equip_lore', '부러진 칼날도 퇴마사의 손에 들리면 악령을 베는 신검이 될 것입니다.')}"</div>
                `;
                if (typeof startInfoResetTimer === 'function') startInfoResetTimer();
            }
        };
    }

    const dropRateBtn = document.getElementById('equip-droprate-btn');
    if (dropRateBtn) {
        dropRateBtn.onclick = () => {
            dropRateBtn.classList.add('active');
            renderDropRateChart();
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => {
            if (window.SceneManager) {
                SceneManager.pop();
            } else {
                const overlay = document.getElementById('equip-overlay');
                if (overlay) overlay.style.display = 'none';
                window.isPaused = false;
            }
        };
    }
}

/**
 * Drop-rate chart for every equipment grade, rendered into the detail pane.
 * Rates are read from equipmentTiers, so the chart cannot drift from the table
 * checkEquipmentDrop() actually rolls against.
 */
function renderDropRateChart() {
    const pane = document.getElementById('equip-info-pane');
    if (!pane) return;
    const T = window.t || ((k, f) => f);
    const tiers = window.equipmentTiers || [];
    if (!tiers.length) return;

    // Log scale: tier 1 is ~375x more common than tier 6, so a linear bar would
    // render every high grade as an invisible sliver.
    const rates = tiers.map(t => t.dropRate);
    const lmax = Math.log(Math.max(...rates));
    const lmin = Math.log(Math.min(...rates));
    const span = (lmax - lmin) || 1;

    const rows = tiers.map(td => {
        const tc = EQUIP_TIER_COLORS[td.id] || '#aaa';
        const pct = Math.max(7, ((Math.log(td.dropRate) - lmin) / span) * 100);
        const oneIn = Math.round(1 / td.dropRate).toLocaleString();
        const prefix = window.tEquipTier ? window.tEquipTier(td.id, td.prefix) : td.prefix;
        const nBonus = (typeof secondarySlotCount === 'function') ? secondarySlotCount(td.id) : 0;
        const stars = nBonus ? `<span class="droprate-bonus" style="color:${tc};">${'★'.repeat(nBonus)}</span>` : '';
        return `
            <div class="droprate-row">
                <span class="droprate-name" style="color:${tc};">[${prefix}]${stars}</span>
                <span class="droprate-track"><span class="droprate-fill" style="width:${pct.toFixed(0)}%;background:${tc};box-shadow:0 0 6px ${tc}88;"></span></span>
                <span class="droprate-val" style="color:${tc};">${T('ui.equipment.droprate_one_in', '1 / {n}').replace('{n}', oneIn)}</span>
            </div>
        `;
    }).join('');

    pane.innerHTML = `
        <div class="droprate-panel">
            <div class="droprate-title">${T('ui.equipment.droprate_title', '등급별 드랍률')}</div>
            <div class="droprate-rows">${rows}</div>
            <div class="droprate-note">${T('ui.equipment.droprate_note', '적 처치당 확률. 보스는 10배. ★ = 보너스 스킯 수.')}</div>
        </div>
    `;
}

/* ─── Info panel discovery notification ─────────────────────────────────── */
function showEquipInfoInPanel(slot, tier, isUpgrade = false, status) {
    if (typeof showEquipToast === 'function') showEquipToast(slot, tier, isUpgrade, status);
    const slotData = equipmentSlots[slot];
    const tierData = equipmentTiers[tier - 1];

    const _sName   = window.tEquipSlot ? window.tEquipSlot(slot, 'name', slotData.name) : slotData.name;
    const _tPrefix = window.tEquipTier ? window.tEquipTier(tierData.id, tierData.prefix) : tierData.prefix;
    if (typeof GameLogger !== 'undefined') {
        if (isUpgrade) GameLogger.success(`Equipment Upgraded: ${_sName} -> [${_tPrefix}]`);
        else GameLogger.success(`Equipment Found: ${_sName} [${_tPrefix}]`);
    }

    const d = document.getElementById('unit-info');
    if (!d) return;

    const T = window.t || ((k, f) => f);
    const bonusVal = (typeof getOwnedStatValue === 'function') ? getOwnedStatValue(slot) : 0;
    const dispBonus = _equipDispBonus(slotData.stat, bonusVal);
    const headerLabel = status === 'UPGRADE' ? T('ui.equipment.found_title_upgrade', '강화!') : status === 'REROLL' ? T('ui.equipment.found_title_reroll', '재계시!') : status === 'EXISTING' ? T('ui.equipment.found_title_existing', '재발견') : T('ui.equipment.found_title_new', '획득!');

    window.infoPanelLockedUntil = Date.now() + 4000;

    const _sLabel = window.tEquipSlot ? window.tEquipSlot(slot, 'label', slotData.label) : slotData.label;
    d.innerHTML = `
        <div class="unit-info-title" style="color:#00e5ff;">${window.SvgIcons ? window.SvgIcons.get('sword') : ''} ${T('ui.equipment.found_prefix', '장비')} ${headerLabel}</div>
        <div class="unit-info-badge" style="background:rgba(0,229,255,0.1); border-color:rgba(0,229,255,0.2); color:#00e5ff;">[${_tPrefix}] ${T('ui.equipment.grade_suffix', '등급')}</div>
        <div style="width:42px;height:42px;margin:3px auto;">${equipIconImg(slot, { size: '100%', opacity: 1 })}</div>
        <div style="color:#fff; font-size: calc(11px * var(--fs)); font-weight:bold; margin:2px 0;">${_sName}</div>
        <div style="font-size: calc(10px * var(--fs)); color:#00ff00; line-height:1.2;">${T('ui.equipment.found_effect_label', '효과')}: ${_sLabel} ${dispBonus}</div>
        <div class="info-divider" style="opacity:0.3;"></div>
        <div class="unit-info-desc" style="opacity:0.8;">"${T('ui.equipment.found_lore', '심연의 악령들조차 이 무구의 빛 앞에서는 눈을 멀게 될 것입니다.')}"</div>
    `;

    setTimeout(() => {
        if (typeof window.startInfoResetTimer === 'function') {
            window.infoPanelLockedUntil = 0;
            window.startInfoResetTimer();
        }
    }, 4050);
}

/* ─── Side toast on discovery / upgrade ─────────────────────────────────── */
function showEquipToast(slot, tier, isUpgrade, status) {
    const slotData = (typeof equipmentSlots !== 'undefined') ? equipmentSlots[slot] : null;
    const tierData = (typeof equipmentTiers !== 'undefined') ? equipmentTiers[tier - 1] : null;
    if (!slotData) return;
    const container = document.getElementById('top-panel') || document.getElementById('game-container') || document.body;
    const existing = document.getElementById('equip-toast');
    if (existing) { clearTimeout(window._equipToastTimer); existing.remove(); }

    // Fallback status inference
    if (!status) status = isUpgrade ? 'UPGRADE' : 'NEW';
    const _Tb = window.t || ((k, f) => f);
    const badgeLabel = _Tb('ui.controls.badge_' + String(status).toLowerCase(), status); // NEW | UPGRADE | REROLL | EXISTING
    const badgeClass = status === 'NEW' ? 'badge-new'
                     : status === 'UPGRADE' ? 'badge-upgrade'
                     : status === 'REROLL' ? 'badge-upgrade'
                     : 'badge-existing';

    const bonusVal = (typeof getOwnedStatValue === 'function') ? getOwnedStatValue(slot) : 0;
    const dispBonus = _equipDispBonus(slotData.stat, bonusVal);

    const tc = EQUIP_TIER_COLORS[tier] || '#aaa';
    const _tsName   = window.tEquipSlot ? window.tEquipSlot(slot, 'name',  slotData.name)  : slotData.name;
    const _tsLabel  = window.tEquipSlot ? window.tEquipSlot(slot, 'label', slotData.label) : slotData.label;
    const _ttPrefix = (tierData && window.tEquipTier) ? window.tEquipTier(tierData.id, tierData.prefix) : (tierData ? tierData.prefix : '');
    const tierLabel = tierData ? `[${_ttPrefix}] ${_tsLabel} ${dispBonus}` : `${_tsLabel} ${dispBonus}`;

    const toast = document.createElement('div');
    toast.id = 'equip-toast';
    toast.className = `encounter-toast left-toast equip-toast card-toast tier-${tier}`;
    toast.style.setProperty('--tier-color', tc);

    const bg = document.createElement('div');
    bg.className = 'card-toast-bg';
    bg.innerHTML = equipIconImg(slot, { size: '100%', opacity: 1 });

    const badge = document.createElement('div');
    badge.className = `card-toast-badge ${badgeClass}`;
    badge.textContent = badgeLabel;

    const cornerKind = document.createElement('div');
    cornerKind.className = 'card-toast-kind';
    cornerKind.innerHTML = `${window.SvgIcons ? window.SvgIcons.get('sword') : ''} EQUIPMENT`;

    const overlay = document.createElement('div');
    overlay.className = 'card-toast-overlay';
    overlay.innerHTML =
        `<div class="card-toast-sub" style="color:${tc};">${tierLabel}</div>` +
        `<div class="card-toast-name">${_tsName}</div>`;

    toast.appendChild(bg);
    toast.appendChild(cornerKind);
    toast.appendChild(badge);
    toast.appendChild(overlay);
    container.appendChild(toast);

    window._equipToastTimer = setTimeout(() => {
        toast.classList.add('encounter-toast-out');
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
    }, 5000);
    toast.addEventListener('click', () => {
        clearTimeout(window._equipToastTimer);
        toast.classList.add('encounter-toast-out');
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
    });
}

/* ─── Grid rendering ────────────────────────────────────────────────────── */
function renderEquipGrid(filter) {
    filter = filter || 'all';
    const grid = document.getElementById('equip-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const slotsToRender = Object.keys(
        (typeof equipmentSlots !== 'undefined') ? equipmentSlots : window.ownedEquipment
    ).filter(key => {
        if (filter === 'all') return true;
        const s = equipmentSlots[key];
        return s && s.category === filter;
    });

    const createSlot = (slotKey) => {
        const slotData = (typeof equipmentSlots !== 'undefined') ? equipmentSlots[slotKey] : { name: slotKey, icon: '' };
        const owned = window.ownedEquipment[slotKey] || { tier: 0, count: 0 };
        const slotDiv = document.createElement('div');
        slotDiv.className = `equip-slot ${slotKey}`;

        if (owned.tier > 0) {
            slotDiv.classList.add(`tier-${owned.tier}`);
            const tc = EQUIP_TIER_COLORS[owned.tier] || '#aaa';
            const ownedVal = (typeof getOwnedStatValue === 'function') ? getOwnedStatValue(slotKey) : 0;
            const range = (typeof getTierStatRange === 'function') ? getTierStatRange(owned.tier, slotKey) : [0, 0];
            const pctOfMax = range[1] > 0 ? Math.min(1, ownedVal / range[1]) : 0;
            const rolledDisp = _equipDispBonus(slotData.stat, ownedVal);

            const bonuses = (typeof getOwnedBonuses === 'function') ? getOwnedBonuses(slotKey) : [];
            let secondaryBar = '';
            let secondaryStar = '';
            if (bonuses.length) {
                const titles = bonuses.map(b => `★ ${_statLabel(b.stat)} ${_equipDispBonus(b.stat, b.value)}`);
                secondaryBar = bonuses.map(b => {
                    const secRange = (typeof getStatRangeByName === 'function') ? getStatRangeByName(owned.tier, b.stat) : [0, 0];
                    const secPct = secRange[1] > 0 ? Math.min(1, b.value / secRange[1]) : 0;
                    return `<div class="equip-roll-bar secondary" title="★ ${_statLabel(b.stat)} ${_equipDispBonus(b.stat, b.value)}" style="margin-top:1px;"><div class="equip-roll-fill" style="width:${(secPct * 100).toFixed(0)}%;background:#ffd700;box-shadow:0 0 4px #ffd700aa;"></div></div>`;
                }).join('');
                // One star per bonus slot, so grade reads at a glance from the grid.
                const stars = '★'.repeat(bonuses.length);
                secondaryStar = `<div class="equip-secondary-star" title="${titles.join(' · ')}" style="position:absolute;top:2px;left:2px;color:#ffd700;font-size: calc(11px * var(--fs));line-height:1;letter-spacing:-1px;text-shadow:0 0 4px #ffd700,0 0 2px #000;pointer-events:none;z-index:2;">${stars}</div>`;
            }

            slotDiv.innerHTML = `
                ${secondaryStar}
                <div class="equip-slot-art">${equipIconImg(slotKey, { size: '100%', opacity: 1 })}</div>
                <div class="equip-roll-bar" title="${rolledDisp}"><div class="equip-roll-fill" style="width:${(pctOfMax * 100).toFixed(0)}%;background:${tc};box-shadow:0 0 4px ${tc}aa;"></div></div>
                ${secondaryBar}
            `;

            if (window.unseenItems && window.unseenItems.has(slotKey)) {
                const badge = document.createElement('div');
                badge.className = 'item-new-badge';
                badge.innerText = '!';
                slotDiv.appendChild(badge);
            }

            slotDiv.onclick = () => {
                document.querySelectorAll('.equip-slot').forEach(s => s.classList.remove('selected'));
                slotDiv.classList.add('selected');
                showEquipDetail(slotKey);
                if (window.unseenItems && window.unseenItems.has(slotKey)) {
                    window.unseenItems.delete(slotKey);
                    const badge = slotDiv.querySelector('.item-new-badge');
                    if (badge) badge.remove();
                    if (typeof saveGameData === 'function') saveGameData();
                }
            };
        } else {
            slotDiv.innerHTML = `
                <div class="equip-slot-art empty">${equipIconImg(slotKey, { size: '100%', opacity: 0.18, extraStyle: 'filter:grayscale(1) brightness(0.6);' })}</div>
            `;
            slotDiv.classList.add('empty');
        }
        slotDiv.addEventListener('mouseenter', () => { showEquipDetail(slotKey); });
        return slotDiv;
    };

    const addSection = (title, keys, category, color) => {
        if (keys.length === 0) return;
        const section = document.createElement('div');
        section.className = `equip-section category-${category}`;
        section.style.setProperty('--sec-color', color);
        const ownedCount = keys.filter(k => (window.ownedEquipment[k] || { tier: 0 }).tier > 0).length;
        section.innerHTML = `<div class="equip-section-header"><span class="sec-mark">◆</span><span class="sec-title">${title}</span><span class="sec-count">${ownedCount}/${keys.length}</span></div>`;
        const subgrid = document.createElement('div');
        subgrid.className = 'equip-section-grid';
        keys.forEach(k => subgrid.appendChild(createSlot(k)));
        section.appendChild(subgrid);
        grid.appendChild(section);
    };

    const _T = window.t || ((k, f) => f);
    const byCat = (cat) => slotsToRender.filter(k => equipmentSlots[k] && equipmentSlots[k].category === cat);
    addSection(`${window.SvgIcons ? window.SvgIcons.get('sword') : ''} ${_T('ui.equipment.section_weapon', '무기')}`,    byCat('weapon'),    'weapon',    '#ff5252');
    addSection(`${window.SvgIcons ? window.SvgIcons.get('shield') : ''} ${_T('ui.equipment.section_armor', '방어구')}`, byCat('armor'),     'armor',     '#42a5f5');
    addSection(`${window.SvgIcons ? window.SvgIcons.get('ring') : ''} ${_T('ui.equipment.section_accessory', '장신구')}`, byCat('accessory'), 'accessory', '#bf5af2');

    renderEquipBonuses();
}

const _PCT_STATS = ['cooldown','crit_chance','damage','crit_damage','portal_dmg_reduction','treasure_chance','slow_strength'];

// Build a stat → label map from equipmentSlots (first slot with that stat wins).
function _statLabel(stat) {
    if (typeof equipmentSlots === 'undefined') return stat;
    for (const k of Object.keys(equipmentSlots)) {
        if (equipmentSlots[k].stat === stat) {
            return window.tEquipSlot ? window.tEquipSlot(k, 'label', equipmentSlots[k].label) : equipmentSlots[k].label;
        }
    }
    return stat;
}

function _equipDispBonus(stat, val) {
    if (_PCT_STATS.includes(stat)) {
        const pct = val * 100;
        const fixed = pct < 10 ? pct.toFixed(1) : pct.toFixed(0);
        return `+${fixed}%`;
    }
    if (stat === 'summon_cost_reduction') return `-${val} SE`;
    if (stat === 'se_gain') return `+${val} SE`;
    return `+${val}`;
}

function _equipDispRange(stat, min, max) {
    if (_PCT_STATS.includes(stat)) {
        const pmin = min * 100, pmax = max * 100;
        const fmin = pmin < 10 ? pmin.toFixed(1) : pmin.toFixed(0);
        const fmax = pmax < 10 ? pmax.toFixed(1) : pmax.toFixed(0);
        return `+${fmin}% ~ +${fmax}%`;
    }
    if (stat === 'summon_cost_reduction') return `-${min} ~ -${max} SE`;
    if (stat === 'se_gain') return `+${min} ~ +${max} SE`;
    return `+${min} ~ +${max}`;
}

function _buildTierEffectsTable(slotKey, ownedTier, ownedValue) {
    const slotData = equipmentSlots[slotKey];
    const _tbSlotLabel = window.tEquipSlot ? window.tEquipSlot(slotKey, 'label', slotData.label) : slotData.label;
    const rows = (equipmentTiers || []).map(td => {
        const t = td.id;
        const range = (typeof getTierStatRange === 'function') ? getTierStatRange(t, slotKey) : [0, 0];
        const tc = EQUIP_TIER_COLORS[t] || '#aaa';
        const isOwned = (t === ownedTier);
        const isLocked = (ownedTier > 0 && t < ownedTier);
        const cls = `tier-effect-row tier-${t}${isOwned ? ' current' : ''}${isLocked ? ' surpassed' : ''}`;
        const marker = isOwned ? '<span class="tier-effect-marker">▶</span>' : '<span class="tier-effect-marker-spacer"></span>';

        let valDisp;
        if (isOwned && typeof ownedValue === 'number' && ownedValue > 0) {
            const rolled = _equipDispBonus(slotData.stat, ownedValue);
            const maxDisp = _equipDispBonus(slotData.stat, range[1]);
            valDisp = `<b>${rolled}</b> <span class="tier-effect-max">/ ${maxDisp}</span>`;
        } else {
            valDisp = _equipDispRange(slotData.stat, range[0], range[1]);
        }

        const _tbPrefix = window.tEquipTier ? window.tEquipTier(td.id, td.prefix) : td.prefix;
        return `
            <div class="${cls}" style="--tc:${tc};">
                ${marker}
                <span class="tier-effect-prefix" style="color:${tc};">[${_tbPrefix}]</span>
                <span class="tier-effect-stat">${_tbSlotLabel}</span>
                <span class="tier-effect-val" style="color:${tc};">${valDisp}</span>
            </div>
        `;
    }).join('');

    // Bonus stat rows: Ancient rolls 1, Mythic 2, Transcendent 3. Owned gear
    // lists its actual rolls; otherwise one placeholder row advertises the slot.
    const secMinT = (window.SECONDARY_STAT_MIN_TIER || 4);
    const _T2 = window.t || ((k, f) => f);
    const ownedBonuses = (ownedTier >= secMinT && typeof getOwnedBonuses === 'function')
        ? getOwnedBonuses(slotKey) : [];
    const tcMax = EQUIP_TIER_COLORS[ownedBonuses.length ? ownedTier : secMinT] || '#ffd700';

    const bonusRow = (label, valDisp, isFirst, owned) => `
        <div class="tier-effect-row tier-${owned ? ownedTier : secMinT} secondary${owned ? ' current' : ' locked'}"
             style="--tc:${tcMax}; ${isFirst ? `border-top:1px dashed ${tcMax}55; margin-top:3px; padding-top:4px;` : ''} ${owned ? '' : 'opacity:0.55;'}">
            <span class="tier-effect-marker" style="color:${tcMax};">★</span>
            <span class="tier-effect-prefix" style="color:${tcMax};">[${_T2('ui.equipment.bonus_label', '[보너스]').replace(/^\[|\]$/g, '')}]</span>
            <span class="tier-effect-stat">${label}</span>
            <span class="tier-effect-val" style="color:${tcMax};">${valDisp}</span>
        </div>
    `;

    let secondaryRow;
    if (ownedBonuses.length) {
        secondaryRow = ownedBonuses.map((b, i) => {
            const range = (typeof getStatRangeByName === 'function') ? getStatRangeByName(ownedTier, b.stat) : [0, 0];
            const disp = `<b>${_equipDispBonus(b.stat, b.value)}</b> <span class="tier-effect-max">/ ${_equipDispBonus(b.stat, range[1])}</span>`;
            return bonusRow(_statLabel(b.stat), disp, i === 0, true);
        }).join('');
    } else {
        const locked = `<span style="opacity:0.7;">${_T2('ui.equipment.secondary_stat_locked', '??? (고대 등급 이상)')}</span>`;
        secondaryRow = bonusRow(_T2('ui.equipment.secondary_stat_label', '랜덤 보조 스킯'), locked, true, false);
    }
    return `<div class="equip-tier-effects">${rows}${secondaryRow}</div>`;
}

function showEquipDetail(slotKey) {
    const infoPane = document.getElementById('equip-info-pane');
    if (!infoPane) return;
    const drBtn = document.getElementById('equip-droprate-btn');
    if (drBtn) drBtn.classList.remove('active');
    const slotData = equipmentSlots[slotKey];
    const owned = window.ownedEquipment[slotKey] || { tier: 0, count: 0 };

    const T = window.t || ((k, f) => f);
    if (owned.tier > 0) {
        const tierData = equipmentTiers[owned.tier - 1];
        const tc = EQUIP_TIER_COLORS[owned.tier] || '#aaa';
        const ownedVal = (typeof getOwnedStatValue === 'function') ? getOwnedStatValue(slotKey) : 0;

        const tierBars = Array.from({length: (window.MAX_EQUIP_TIER || 6)}, (_, i) => {
            const t = i + 1; const c = EQUIP_TIER_COLORS[t];
            const active = t <= owned.tier;
            return `<div class="tier-prog-bar${active ? ' active' : ''}" style="${active ? `background:${c};box-shadow:0 0 5px ${c}66;` : ''}"></div>`;
        }).join('');

        const rerollCost = (typeof getRerollCost === 'function') ? getRerollCost(owned.tier) : 0;
        const sc = window.soulCrystals || 0;
        const canReroll = sc >= rerollCost;

        const _edName   = window.tEquipSlot ? window.tEquipSlot(slotKey, 'name', slotData.name) : slotData.name;
        const _edLore   = window.tEquipSlot ? window.tEquipSlot(slotKey, 'lore', slotData.lore || '') : (slotData.lore || '');
        const _edPrefix = window.tEquipTier ? window.tEquipTier(tierData.id, tierData.prefix) : tierData.prefix;
        infoPane.innerHTML = `
            <div class="equip-detail-art tier-${owned.tier}">${equipIconImg(slotKey, { size: '88%', opacity: 1 })}</div>
            <div class="equip-detail-body">
                <div class="equip-detail-tier" style="color:${tc};">[${_edPrefix}]</div>
                <div class="equip-detail-name">${_edName}</div>
                ${_buildTierEffectsTable(slotKey, owned.tier, ownedVal)}
                <div class="equip-tier-prog">${tierBars}</div>
                <button id="equip-reroll-btn" class="equip-reroll-btn" data-slot="${slotKey}" ${canReroll ? '' : 'disabled'}>
                    <span class="reroll-label">${T('ui.equipment.reroll_label', '재계시 (Reroll)')}</span>
                    <span class="reroll-cost">${rerollCost} SC</span>
                    <span class="reroll-stock">${T('ui.equipment.reroll_stock_fmt', '보유 {n}').replace('{n}', sc)}</span>
                </button>
                <div class="equip-found-count">${T('ui.equipment.found_count_fmt', '획득 ×{n}').replace('{n}', owned.count || 1)}</div>
                <div class="equip-detail-lore">${_edLore}</div>
            </div>
        `;
        const rb = document.getElementById('equip-reroll-btn');
        if (rb) rb.onclick = () => _handleRerollClick(slotKey);
    } else {
        const rerollCost = (typeof getRerollCost === 'function') ? getRerollCost(1) : 0;
        const sc = window.soulCrystals || 0;
        const _enName = window.tEquipSlot ? window.tEquipSlot(slotKey, 'name', slotData.name) : slotData.name;
        const _enLore = window.tEquipSlot ? window.tEquipSlot(slotKey, 'lore', slotData.lore || '') : (slotData.lore || '');
        infoPane.innerHTML = `
            <div class="equip-detail-art empty">${equipIconImg(slotKey, { size: '88%', opacity: 0.25, extraStyle: 'filter:grayscale(1);' })}</div>
            <div class="equip-detail-body">
                <div class="equip-detail-tier muted">[${T('ui.equipment.not_owned_tier', '미획득')}]</div>
                <div class="equip-detail-name muted">${_enName}</div>
                ${_buildTierEffectsTable(slotKey, 0, 0)}
                <button id="equip-reroll-btn" class="equip-reroll-btn" data-slot="${slotKey}" disabled>
                    <span class="reroll-label">${T('ui.equipment.reroll_label', '재계시 (Reroll)')}</span>
                    <span class="reroll-cost">${rerollCost} SC</span>
                    <span class="reroll-stock">${T('ui.equipment.reroll_stock_fmt', '보유 {n}').replace('{n}', sc)}</span>
                </button>
                <div class="equip-detail-lore muted">${_enLore}</div>
            </div>
        `;
    }
}

function _handleRerollClick(slotKey) {
    if (typeof rerollEquipmentStat !== 'function') return;
    const result = rerollEquipmentStat(slotKey);
    if (!result.ok) {
        if (result.reason === 'no-sc' && typeof GameLogger !== 'undefined') {
            const _T = window.t || ((k, f) => f);
            GameLogger.warn(_T('ui.equipment.no_sc_warn', 'Soul Crystal 부족 (필요 {cost})').replace('{cost}', result.cost));
        }
        return;
    }
    showEquipDetail(slotKey);
    renderEquipBonuses();
    updateEquipScBadge();

    // Floating delta tag inside the current row(s)
    const primaryRow = document.querySelector(`.equip-tier-effects .tier-effect-row.current:not(.secondary)`);
    if (primaryRow) {
        const slotData = equipmentSlots[slotKey];
        const delta = result.newValue - result.prevValue;
        const tag = document.createElement('span');
        const sign = delta > 0 ? '+' : (delta < 0 ? '' : '±');
        const color = delta > 0 ? '#00ff88' : (delta < 0 ? '#ff5252' : '#bbb');
        tag.className = 'reroll-delta-tag';
        tag.textContent = `${sign}${_equipDispBonus(slotData.stat, delta)}`;
        tag.style.color = color;
        primaryRow.appendChild(tag);
        setTimeout(() => tag.remove(), 2200);
    }

    // Secondary stat: identity rerolled, so show "NEW: <label> <val>" tag.
    if (result.newStat2) {
        const secRow = document.querySelector(`.equip-tier-effects .tier-effect-row.current.secondary`);
        if (secRow) {
            const tag = document.createElement('span');
            tag.className = 'reroll-delta-tag';
            tag.textContent = `NEW ★`;
            tag.style.color = '#ffd700';
            secRow.appendChild(tag);
            setTimeout(() => tag.remove(), 2200);
        }
    }
}

/**
 * Owned equipment effects as [{ label, val }] (primary + T4 secondary rolls).
 * Shared by the armory's total pane and the Sacred Armory button tooltip.
 *
 * opts.byStat merges every source of the same stat into a single summed line -
 * several slots roll the same stat (mainhand/dagger are both cooldown, offhand/
 * staff both crit_damage), and a T4 secondary can land on a stat a slot already
 * grants. The pane wants the per-slot breakdown; the totals tooltip does not.
 */
function getEquipBonusLines(opts = {}) {
    const lines = [];
    if (typeof equipmentSlots === 'undefined') return lines;

    const totals = new Map();   // stat -> summed value, insertion-ordered
    const addTotal = (stat, val) => totals.set(stat, (totals.get(stat) || 0) + val);

    Object.keys(equipmentSlots).forEach(slotKey => {
        const owned = window.ownedEquipment[slotKey];
        if (!owned || owned.tier <= 0) return;
        const slotData = equipmentSlots[slotKey];
        const bonusVal = (typeof getOwnedStatValue === 'function') ? getOwnedStatValue(slotKey) : 0;
        const bonuses = (typeof getOwnedBonuses === 'function') ? getOwnedBonuses(slotKey) : [];

        if (opts.byStat) {
            addTotal(slotData.stat, bonusVal);
            bonuses.forEach(b => addTotal(b.stat, b.value));
            return;
        }

        lines.push({
            label: window.tEquipSlot ? window.tEquipSlot(slotKey, 'label', slotData.label) : slotData.label,
            val: _equipDispBonus(slotData.stat, bonusVal)
        });
        bonuses.forEach(b => lines.push({ label: `★ ${_statLabel(b.stat)}`, val: _equipDispBonus(b.stat, b.value) }));
    });

    if (opts.byStat) {
        totals.forEach((val, stat) => lines.push({ label: _statLabel(stat), val: _equipDispBonus(stat, val) }));
    }
    return lines;
}

function renderEquipBonuses() {
    const bonusPane = document.getElementById('equip-bonus-pane');
    if (!bonusPane) return;

    const _T3 = window.t || ((k, f) => f);
    const sc = window.soulCrystals || 0;
    let html = `<div class="equip-bonus-title">${_T3('ui.equipment.total_bonus', '총 장비 효과')}</div>`;
    html += `<div class="equip-sc-row" title="${_T3('ui.equipment.sc_row_title', '적 처치 시 드물게 획득. 장비 재계시에 사용.')}"><span class="sc-label">Soul Crystal</span><span class="sc-val">${sc}</span></div>`;
    html += '<div class="bonus-items-container">';
    let hasAny = false;
    if (typeof equipmentSlots !== 'undefined') {
        Object.keys(equipmentSlots).forEach(slotKey => {
            const owned = window.ownedEquipment[slotKey];
            if (owned && owned.tier > 0) {
                hasAny = true;
                const slotData = equipmentSlots[slotKey];
                const bonusVal = (typeof getOwnedStatValue === 'function') ? getOwnedStatValue(slotKey) : 0;
                const dispBonus = _equipDispBonus(slotData.stat, bonusVal);
                const tc = EQUIP_TIER_COLORS[owned.tier] || '#aaa';
                const _tbLabel = window.tEquipSlot ? window.tEquipSlot(slotKey, 'label', slotData.label) : slotData.label;
                html += `
                    <div class="total-bonus-item tier-${owned.tier}">
                        <span>${_tbLabel}</span>
                        <span class="val" style="color:${tc};">${dispBonus}</span>
                    </div>
                `;
                const bonuses = (typeof getOwnedBonuses === 'function') ? getOwnedBonuses(slotKey) : [];
                bonuses.forEach(b => {
                    html += `
                        <div class="total-bonus-item tier-${owned.tier} secondary" style="opacity:0.95; padding-left:14px; border-left:2px solid ${tc}88;">
                            <span style="color:${tc};">★ ${_statLabel(b.stat)}</span>
                            <span class="val" style="color:${tc};">${_equipDispBonus(b.stat, b.value)}</span>
                        </div>
                    `;
                });
            }
        });
    }
    html += '</div>';

    if (!hasAny) {
        html = `<div class="equip-bonus-title">${_T3('ui.equipment.total_bonus', '총 장비 효과')}</div>`;
        html += `<div style="color:#444;font-style:italic;text-align:center;margin-top:15px;font-size: calc(10px * var(--fs));">${_T3('ui.equipment.no_equip', '장착된 장비가 없습니다.')}</div>`;
    }
    bonusPane.innerHTML = html;
}

// Window Exports
window.initEquipment        = initEquipment;
window.showEquipInfoInPanel = showEquipInfoInPanel;
window.showEquipToast       = showEquipToast;
window.renderEquipGrid      = renderEquipGrid;
window.showEquipDetail      = showEquipDetail;
window.renderEquipBonuses   = renderEquipBonuses;
window.renderDropRateChart  = renderDropRateChart;
window.getEquipBonusLines   = getEquipBonusLines;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEquipment);
} else {
    initEquipment();
}
