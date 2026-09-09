/* collections_shrines.js - Rendering logic for the Shrines Collection Grid */

function _getShrineRoleMeta() {
    const T = window.t || ((k, f) => f);
    const sword   = window.SvgIcons ? window.SvgIcons.get('sword')   : '';
    const target  = window.SvgIcons ? window.SvgIcons.get('target')  : '';
    const wrench  = window.SvgIcons ? window.SvgIcons.get('wrench')  : '';
    const sparkle = window.SvgIcons ? window.SvgIcons.get('sparkle') : '';
    return {
        '버프':          { color: '#ff6b35', label: `${sword} ${T('ui.collections.section.buff', '버프')}` },
        '확률':          { color: '#ffd700', label: `${target} ${T('ui.collections.section.prob', '확률')}` },
        '유틸리티':      { color: '#00e5ff', label: `${wrench} ${T('ui.collections.section.util', '유틸')}` },
        '상위 버프':     { color: '#ff4488', label: `${sparkle} ${T('ui.collections.section.sacred', '성스러운')}` },
        '상위 유틸리티': { color: '#aa44ff', label: `${sparkle} ${T('ui.collections.section.sacred', '성스러운')}` },
        '상위 확률':     { color: '#ff44ff', label: `${sparkle} ${T('ui.collections.section.sacred', '성스러운')}` },
    };
}

function _buildShrineItem(shrine) {
    const SHRINE_ROLE_META = _getShrineRoleMeta();
    const item = document.createElement('div');
    item.className = 'col-item shrine-col-item';
    item.style.position = 'relative';
    item.style.flexDirection = 'column';
    item.style.gap = '2px';

    if (typeof createPixelCanvas === 'function') {
        item.appendChild(createPixelCanvas(shrine.type, 'shrine', 48));
    } else {
        item.innerHTML = window.SvgIcons ? window.SvgIcons.get('shrine') : '';
    }

    if (shrine.tier === 2) {
        const tierBadge = document.createElement('div');
        tierBadge.className = 'shrine-tier-badge';
        tierBadge.innerText = 'T2';
        tierBadge.style.cssText = 'position:absolute;top:2px;right:2px;font-size:7px;font-weight:900;color:#ffd700;background:rgba(0,0,0,0.7);padding:1px 3px;border-radius:3px;border:1px solid rgba(255,215,0,0.5);';
        item.appendChild(tierBadge);
        item.style.border = '1px solid rgba(255,215,0,0.4)';
        item.style.boxShadow = '0 0 6px rgba(255,215,0,0.15)';
    }

    const roleMeta = SHRINE_ROLE_META[shrine.role] || { color: '#888', label: (window.tShrineRole ? window.tShrineRole(shrine.role) : (shrine.role || '')) };
    const nameBadge = document.createElement('div');
    nameBadge.className = 'shrine-name-badge';
    nameBadge.innerText = window.tShrine ? window.tShrine(shrine.type, 'name', shrine.name || shrine.type) : (shrine.name || shrine.type);
    nameBadge.style.cssText = `font-size:7px;color:${roleMeta.color};font-weight:bold;text-align:center;line-height:1.1;padding:1px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;`;
    item.appendChild(nameBadge);

    item.onclick = () => {
        if (typeof showShrineDetail === 'function') showShrineDetail(shrine);
        window.colInfoLockedUntil = Date.now() + 15000;
        if (typeof startColInfoResetTimer === 'function') startColInfoResetTimer();
    };
    item.onmouseenter = () => {
        if (Date.now() > (window.colInfoLockedUntil || 0)) {
            if (typeof showShrineDetail === 'function') showShrineDetail(shrine);
        }
    };
    item.onmouseleave = () => {
        if (Date.now() > (window.colInfoLockedUntil || 0)) if (typeof resetColInfo === 'function') resetColInfo();
    };
    return item;
}

function renderShrineGrid(filter = 'all') {
    const grid = document.getElementById('shrine-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const t1Buff   = shrineTypes.filter(s => s.tier === 1 && s.role && s.role.includes('버프'));
    const t1Prob   = shrineTypes.filter(s => s.tier === 1 && s.role && s.role.includes('확률'));
    const t1Util   = shrineTypes.filter(s => s.tier === 1 && s.role && s.role.includes('유틸리티'));
    const sacred   = shrineTypes.filter(s => s.tier === 2);

    const addSection = (title, list, color) => {
        if (list.length === 0) return;
        const section = document.createElement('div');
        section.className = 'col-section';
        section.style.setProperty('--sec-color', color);
        section.innerHTML = `<div class="col-section-header"><span class="sec-mark">◆</span><span class="sec-title">${title}</span><span class="sec-count">${list.length}</span></div>`;
        const subgrid = document.createElement('div');
        subgrid.className = 'col-section-grid';
        list.forEach(s => subgrid.appendChild(_buildShrineItem(s)));
        section.appendChild(subgrid);
        grid.appendChild(section);
    };

    const T = window.t || ((k, f) => f);
    addSection(`${window.SvgIcons ? window.SvgIcons.get('sword') : ''} ${T('ui.collections.section.buff', '버프 성소')}`,  t1Buff, '#ff6b35');
    addSection(`${window.SvgIcons ? window.SvgIcons.get('target') : ''} ${T('ui.collections.section.prob', '확률 성소')}`,  t1Prob, '#ffd700');
    addSection(`${window.SvgIcons ? window.SvgIcons.get('wrench') : ''} ${T('ui.collections.section.util', '유틸 성소')}`,  t1Util, '#00e5ff');
    addSection(`${window.SvgIcons ? window.SvgIcons.get('sparkle') : ''} ${T('ui.collections.section.sacred', '성스러운 성소')}`, sacred, '#ff44ff');
}

window.renderShrineGrid = renderShrineGrid;

