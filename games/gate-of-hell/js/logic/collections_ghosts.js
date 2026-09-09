/* collections_ghosts.js - Rendering logic for the Ghost/Enemies Collection Grid */

function _getGhostCatMeta() {
    const T = window.t || ((k, f) => f);
    return {
        'specter':      { color: '#bb66ff', label: T('ui.collections.section.specter', '망령') },
        'wraith':       { color: '#ff4488', label: T('ui.collections.section.wraith', '악령') },
        'spirit':       { color: '#44aaff', label: T('ui.collections.section.spirit', '원혼') },
        'demon':        { color: '#ff6622', label: T('ui.collections.section.demon', '악마') },
        'abyssal_boss': { color: '#ffd700', label: T('ui.collections.section.abyssal_boss', '보스') },
        'mini_boss':    { color: '#ffa500', label: T('ui.collections.section.mini_boss', '미니 보스') },
        'treasure':     { color: '#ffd700', label: T('ui.collections.section.treasure', '특이점') },
    };
}

function _buildGhostItem({ enemy, cat }) {
    const T = window.t || ((k, f) => f);
    const GHOST_CAT_META = _getGhostCatMeta();
    const item = document.createElement('div');
        const isUnlocked = (window.encounteredEnemies && window.encounteredEnemies.has(enemy.type));
        item.className = `col-item ghost-col-item${isUnlocked ? '' : ' locked'}`;
        item.style.position = 'relative';

        // Art — always rendered regardless of unlock state
        if (typeof createPixelCanvas === 'function') {
            const cvs = createPixelCanvas(enemy.type, 'enemy', 48);
            item.appendChild(cvs);
        } else {
            const ph = document.createElement('div');
            ph.style.cssText = 'font-size:18px;opacity:0.25;';
            ph.innerHTML = window.SvgIcons ? window.SvgIcons.get('enemy_placeholder') : '?';
            item.appendChild(ph);
        }

        // Danger / Boss badge (top-right, same style as shrine T2 badge)
        const isBoss = (cat === 'abyssal_boss' || cat === 'mini_boss');
        const dangerBadge = document.createElement('div');
        if (isBoss) {
            dangerBadge.innerText = 'BOSS';
            dangerBadge.style.cssText = 'position:absolute;top:3px;right:3px;font-size:10px;font-weight:900;color:#ffd700;background:rgba(0,0,0,0.82);padding:2px 5px;border-radius:4px;border:1px solid rgba(255,215,0,0.65);letter-spacing:0.5px;text-shadow:0 0 4px rgba(255,215,0,0.55);';
        } else {
            const d = enemy.danger || 0;
            const dc = d >= 9 ? '#ff2244' : d >= 7 ? '#ff6622' : d >= 5 ? '#ffaa00' : d >= 3 ? '#88cc44' : '#66aaff';
            dangerBadge.innerText = `D:${d}`;
            dangerBadge.style.cssText = `position:absolute;top:3px;right:3px;font-size:10px;font-weight:900;color:${dc};background:rgba(0,0,0,0.82);padding:2px 5px;border-radius:4px;border:1px solid ${dc}77;letter-spacing:0.5px;text-shadow:0 0 3px ${dc}66;`;
        }
        item.appendChild(dangerBadge);

        // Name badge (bottom) — shows actual enemy name, colored by category
        const catMeta = GHOST_CAT_META[cat] || { color: '#888', label: cat };
        const nameBadge = document.createElement('div');
        nameBadge.innerText = isUnlocked ? (window.tEnemy ? window.tEnemy(enemy.type, 'name', enemy.name || enemy.type) : (enemy.name || enemy.type)) : '???';
        nameBadge.style.cssText = `font-size:7px;color:${catMeta.color};font-weight:bold;text-align:center;line-height:1.1;padding:1px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;`;
        item.appendChild(nameBadge);

        // Boss: golden border
        if (isBoss) {
            item.style.border = '1px solid rgba(255,215,0,0.4)';
            item.style.boxShadow = '0 0 6px rgba(255,215,0,0.15)';
        }

        if (isUnlocked) {
            const clearUnseen = () => {
                if (window.unseenItems && window.unseenItems.has(enemy.type)) {
                    window.unseenItems.delete(enemy.type);
                    if (typeof saveGameData === 'function') saveGameData();
                }
            };
            item.onclick = () => {
                if (typeof showGhostDetail === 'function') showGhostDetail(enemy);
                window.colInfoLockedUntil = Date.now() + 15000;
                if (typeof startColInfoResetTimer === 'function') startColInfoResetTimer();
                clearUnseen();
            };
            item.onmouseenter = () => {
                if (Date.now() > (window.colInfoLockedUntil || 0)) {
                    if (typeof showGhostDetail === 'function') showGhostDetail(enemy);
                    clearUnseen();
                }
            };
            item.onmouseleave = () => {
                if (typeof resetColInfo === 'function') resetColInfo();
            };
        } else {
            item.onmouseenter = () => {
                if (Date.now() > (window.colInfoLockedUntil || 0)) {
                    const infoPane = document.getElementById('col-info-pane');
                    if (infoPane) {
                        infoPane.innerHTML = `
                            <div style="color:#555;text-align:center;padding:20px;">
                                <div style="font-size:40px;margin-bottom:8px;opacity:0.4;">?</div>
                                <div style="font-size:16px;color:#666;">${T('ui.collections.ghost_locked', '아직 조우하지 않음')}</div>
                                <div style="font-size:11px;margin-top:8px;opacity:0.4;">"${T('ui.collections.ghost_locked_lore', '심연 깊은 곳에 숨어있는 존재입니다.')}"</div>
                            </div>
                        `;
                    }
                }
            };
            item.onmouseleave = () => {
                if (Date.now() > (window.colInfoLockedUntil || 0)) if (typeof resetColInfo === 'function') resetColInfo();
            };
        }

    return item;
}

function renderGhostGrid(category) {
    const GHOST_CAT_META = _getGhostCatMeta();
    const grid = document.getElementById('ghost-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const sectionsOrder = ['specter','wraith','spirit','demon','treasure','mini_boss','abyssal_boss'];
    const groups = {};
    sectionsOrder.forEach(c => groups[c] = []);
    (Object.entries(enemyCategories || {})).forEach(([c, list]) => {
        if (groups[c]) list.forEach(e => groups[c].push({ enemy: e, cat: c }));
    });
    Object.values(bossData || {}).forEach(b => {
        const c = b.category || 'abyssal_boss';
        if (!groups[c]) groups[c] = [];
        groups[c].push({ enemy: b, cat: c });
    });

    sectionsOrder.forEach(cat => {
        const entries = groups[cat] || [];
        if (entries.length === 0) return;
        entries.sort((a, b) => (a.enemy.danger || 99) - (b.enemy.danger || 99));
        const meta = GHOST_CAT_META[cat] || { color: '#888', label: cat };
        const ownedCount = entries.filter(({ enemy }) => window.encounteredEnemies && window.encounteredEnemies.has(enemy.type)).length;

        const section = document.createElement('div');
        section.className = `col-section cat-${cat}`;
        section.style.setProperty('--sec-color', meta.color);
        section.innerHTML = `<div class="col-section-header"><span class="sec-mark">◆</span><span class="sec-title">${meta.label}</span><span class="sec-count">${ownedCount}/${entries.length}</span></div>`;
        const subgrid = document.createElement('div');
        subgrid.className = 'col-section-grid';
        entries.forEach(e => subgrid.appendChild(_buildGhostItem(e)));
        section.appendChild(subgrid);
        grid.appendChild(section);
    });
}

window.renderGhostGrid = renderGhostGrid;

