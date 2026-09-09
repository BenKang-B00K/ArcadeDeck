/* collections_exorcists.js - Rendering logic for Exorcist Promotion-Path Codex */

const EXO_ROOT_COLOR = {
    'novice_exorcist': '#cc55ff',
    'apprentice':      '#ff6644',
    'acolyte_priest':  '#ffd700',
    'acolyte_warrior': '#44aaff',
};

const EXO_TIER_COLOR = { 1: '#888888', 2: '#44aaff', 3: '#cc55ff', 4: '#ffd700' };

function _exoRootLabel(type) {
    const T = window.t || ((k, f) => f || k);
    const fallback = {
        'novice_exorcist': '지원형 계열',
        'apprentice':      '공격형 계열',
        'acolyte_priest':  '신성형 계열',
        'acolyte_warrior': '근접형 계열',
    }[type] || '';
    return T(`ui.collections.exo.family_subtitle.${type}`, fallback);
}

function _exoTierLabel(tier) {
    const T = window.t || ((k, f) => f || k);
    return T(`ui.collections.exo.tier_label.${tier}`, `T${tier}`);
}

function _exoFamilySuffix() {
    const T = window.t || ((k, f) => f || k);
    return T('ui.collections.exo.family_suffix', '계보');
}

function _unitName(unit) {
    const T = window.t || ((k, f) => f || k);
    return T(`unit.${unit.type}.name`, unit.name || unit.type);
}

function _findUnit(type) {
    return (window.unitTypes || []).find(u => u.type === type) || null;
}

function _buildExoCell(unit, tier) {
    const cell = document.createElement('div');
    cell.className = `exo-cell exo-t${tier}`;
    const tierColor = EXO_TIER_COLOR[tier] || '#888';
    cell.style.setProperty('--tier-color', tierColor);

    if (!unit) {
        cell.classList.add('exo-cell-empty');
        return cell;
    }

    const icon = document.createElement('div');
    icon.className = 'exo-cell-icon';
    if (typeof createPixelCanvas === 'function') {
        icon.appendChild(createPixelCanvas(unit.type, 'unit', tier === 1 ? 56 : 44));
    }
    cell.appendChild(icon);

    const name = document.createElement('div');
    name.className = 'exo-cell-name';
    name.innerText = _unitName(unit);
    cell.appendChild(name);

    const tierBadge = document.createElement('div');
    tierBadge.className = 'exo-cell-tier';
    tierBadge.innerText = `T${tier}`;
    cell.appendChild(tierBadge);

    const openDetail = () => {
        if (typeof showExorcistDetail === 'function') showExorcistDetail(unit);
        window.colInfoLockedUntil = Date.now() + 15000;
        if (typeof startColInfoResetTimer === 'function') startColInfoResetTimer();
    };
    cell.onclick = openDetail;
    cell.onmouseenter = () => {
        if (Date.now() > (window.colInfoLockedUntil || 0)) {
            if (typeof showExorcistDetail === 'function') showExorcistDetail(unit);
        }
    };
    cell.onmouseleave = () => {
        if (Date.now() > (window.colInfoLockedUntil || 0)) if (typeof resetColInfo === 'function') resetColInfo();
    };
    return cell;
}

function _buildExoGroup(t2Unit) {
    const group = document.createElement('div');
    group.className = 'exo-group';

    group.appendChild(_buildExoCell(t2Unit, 2));

    const connL = document.createElement('div');
    connL.className = 'exo-conn exo-conn-l';
    group.appendChild(connL);

    const t3Pair = document.createElement('div');
    t3Pair.className = 'exo-t3-pair';
    const t3Types = (t2Unit && t2Unit.upgrades) || [];
    const t3a = _findUnit(t3Types[0]);
    const t3b = _findUnit(t3Types[1]);
    t3Pair.appendChild(_buildExoCell(t3a, 3));
    t3Pair.appendChild(_buildExoCell(t3b, 3));
    group.appendChild(t3Pair);

    const connR = document.createElement('div');
    connR.className = 'exo-conn exo-conn-r';
    group.appendChild(connR);

    const t4Type = (t3a && t3a.upgrades && t3a.upgrades[0]) || (t3b && t3b.upgrades && t3b.upgrades[0]);
    const t4Unit = _findUnit(t4Type);
    group.appendChild(_buildExoCell(t4Unit, 4));

    return group;
}

function _buildExoFamily(t1Unit) {
    const color = EXO_ROOT_COLOR[t1Unit.type] || '#888';
    const subtitle = _exoRootLabel(t1Unit.type);
    const family = document.createElement('div');
    family.className = 'exo-family';
    family.style.setProperty('--sec-color', color);

    const t2List = (t1Unit.upgrades || []).map(_findUnit).filter(Boolean);
    const total = 1 + t2List.length + t2List.reduce((n, u) => n + ((u.upgrades || []).length), 0)
                  + new Set(t2List.flatMap(u => (u.upgrades || []).map(t3 => {
                        const t3u = _findUnit(t3);
                        return t3u && t3u.upgrades && t3u.upgrades[0];
                    }).filter(Boolean))).size;

    const T = window.t || ((k, f) => f || k);
    const countTpl = T('ui.collections.exo.units_count_format', '{n} units · 5→10→5');
    const countStr = countTpl.replace('{n}', total);

    const header = document.createElement('div');
    header.className = 'col-section-header exo-family-header';
    header.innerHTML = `<span class="sec-mark">◆</span><span class="sec-title">${_unitName(t1Unit)} ${_exoFamilySuffix()} (${subtitle})</span><span class="sec-count">${countStr}</span>`;
    family.appendChild(header);

    const body = document.createElement('div');
    body.className = 'exo-family-body';

    const t1Col = document.createElement('div');
    t1Col.className = 'exo-t1-col';
    t1Col.appendChild(_buildExoCell(t1Unit, 1));
    body.appendChild(t1Col);

    const spineL = document.createElement('div');
    spineL.className = 'exo-spine-l';
    body.appendChild(spineL);

    const groups = document.createElement('div');
    groups.className = 'exo-groups';
    t2List.forEach(t2 => groups.appendChild(_buildExoGroup(t2)));
    body.appendChild(groups);

    family.appendChild(body);
    return family;
}

function renderExorcistGrid() {
    const grid = document.getElementById('exorcist-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const rootTypes = ['novice_exorcist', 'apprentice', 'acolyte_priest', 'acolyte_warrior'];
    rootTypes.forEach(rt => {
        const t1 = _findUnit(rt);
        if (!t1) return;
        grid.appendChild(_buildExoFamily(t1));
    });
}

window.renderExorcistGrid = renderExorcistGrid;
