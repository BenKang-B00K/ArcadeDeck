/* collections_ui.js - Collections overlay orchestration + detail-pane rendering */

window.colInfoLockedUntil = 0;
let colInfoResetTimer = null;

/* ─── Init / open-close ─────────────────────────────────────────────────── */
function initCollections() {
    const collectionsBtn = document.getElementById('collections-btn');
    const closeBtn = document.getElementById('close-collections');

    const setupCollectionsModal = () => {
        const tabBtns = document.querySelectorAll('.col-tab-btn');

        tabBtns.forEach(b => b.classList.remove('active'));
        const ghostTabBtn = Array.from(tabBtns).find(b => b.dataset.tab === 'ghosts');
        if (ghostTabBtn) ghostTabBtn.classList.add('active');

        document.querySelectorAll('.collections-section').forEach(s => s.classList.remove('active'));
        const ghostSection = document.getElementById('ghosts-section');
        if (ghostSection) ghostSection.classList.add('active');

        window.colInfoLockedUntil = 0;
        if (typeof resetColInfo === 'function') resetColInfo();
        if (typeof renderGhostGrid === 'function') renderGhostGrid('all');

        const notif = document.getElementById('collections-notif');
        if (notif) notif.style.display = 'none';

        bindCollectionEvents();
    };

    if (collectionsBtn) {
        collectionsBtn.onclick = () => {
            if (window.SceneManager) {
                SceneManager.push(SCENES.MODAL, { id: 'collections-overlay', onOpen: setupCollectionsModal });
            } else {
                const overlay = document.getElementById('collections-overlay');
                if (!overlay) return;
                overlay.style.display = 'flex';
                window.isPaused = true;
                setupCollectionsModal();
            }
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => {
            if (window.SceneManager) {
                SceneManager.pop();
            } else {
                const overlay = document.getElementById('collections-overlay');
                if (overlay) overlay.style.display = 'none';
                window.isPaused = false;
            }
        };
    }

    bindCollectionEvents();
}

function bindCollectionEvents() {
    const tabBtns = document.querySelectorAll('.col-tab-btn');

    tabBtns.forEach(btn => {
        btn.onclick = () => {
            const tab = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelectorAll('.collections-section').forEach(s => s.classList.remove('active'));
            const section = document.getElementById(`${tab}-section`);
            if (section) section.classList.add('active');

            if (tab === 'ghosts' && typeof renderGhostGrid === 'function') renderGhostGrid('all');
            else if (tab === 'shrines' && typeof renderShrineGrid === 'function') renderShrineGrid('all');
            else if (tab === 'exorcists' && typeof renderExorcistGrid === 'function') renderExorcistGrid();

            if (typeof resetColInfo === 'function') resetColInfo();
        };
    });
}

function startColInfoResetTimer() {
    if (colInfoResetTimer) clearTimeout(colInfoResetTimer);
    colInfoResetTimer = setTimeout(() => {
        window.colInfoLockedUntil = 0;
        if (typeof resetColInfo === 'function') resetColInfo();
    }, 15000);
}

/* ─── Detail pane rendering ─────────────────────────────────────────────── */
function resetColInfo() {
    const infoPane = document.getElementById('col-info-pane');
    if (infoPane) {
        infoPane.innerHTML = `
            <div class="info-default-text">GATE OF HELL<br>CHRONICLES</div>
        `;
    }
}

function showShrineDetail(shrine) {
    const infoPane = document.getElementById('col-info-pane');
    if (!infoPane) return;
    const T = window.t || ((k, f) => f);

    const isSacred = shrine.tier === 2;
    const tierColor = isSacred ? '#ffd700' : '#00ff88';
    const tierLabel = isSacred
        ? `${window.SvgIcons ? window.SvgIcons.get('sparkle') : ''} ${T('ui.collections.shrine_sacred_label', '성스러운 성소')}`
        : `${window.SvgIcons ? window.SvgIcons.get('shrine') : ''} ${T('ui.collections.shrine_normal_label', '일반 성소')}`;
    const rangeLabel = shrine.rangeType === 'all'
        ? `${window.SvgIcons ? window.SvgIcons.get('globe') : ''} ${T('ui.collections.shrine_range_global', '전역')}`
        : `${window.SvgIcons ? window.SvgIcons.get('location_pin') : ''} ${T('ui.collections.shrine_range_local', '주변')}`;
    const roleLabel = (window.tShrineRole ? window.tShrineRole(shrine.role) : shrine.role) || '-';
    const sName     = window.tShrine ? window.tShrine(shrine.type, 'name',     shrine.name || shrine.type) : (shrine.name || shrine.type);
    const sDesc     = window.tShrine ? window.tShrine(shrine.type, 'desc',     shrine.desc || '')           : (shrine.desc || '');
    const sDemoDesc = window.tShrine ? window.tShrine(shrine.type, 'demoDesc', shrine.demoDesc || '')       : (shrine.demoDesc || '');
    const sLore     = window.tShrine ? window.tShrine(shrine.type, 'lore',     shrine.lore || '')           : (shrine.lore || '');

    infoPane.innerHTML = `
        <div class="gd-card shrine">
            <div id="col-detail-canvas-container" class="gd-portrait shrine"></div>
            <div class="gd-name-row">
                <span class="gd-name">${sName}</span>
                <span class="gd-tier" style="color:${tierColor};border-color:${tierColor}66;">${tierLabel}</span>
            </div>
            <div class="gd-stats shrine-stats">
                <div class="gd-stat"><div class="gd-stat-lbl">${T('ui.collections.shrine_stat_range', '범위')}</div><div class="gd-stat-val" style="color:#42a5f5;">${rangeLabel}</div></div>
                <div class="gd-stat"><div class="gd-stat-lbl">${T('ui.collections.shrine_stat_role', '역할')}</div><div class="gd-stat-val" style="color:${tierColor};">${roleLabel}</div></div>
            </div>
            <div class="gd-effect-box">
                <div class="gd-effect-lbl">${window.SvgIcons ? window.SvgIcons.get('sparkle') : ''} ${T('ui.collections.shrine_stat_effect', '효과')}</div>
                <div class="gd-effect-txt">${sDesc || '-'}</div>
            </div>
            <div class="gd-effect-box demolish">
                <div class="gd-effect-lbl">${window.SvgIcons ? window.SvgIcons.get('warning') : ''} ${T('ui.collections.shrine_stat_demolish', '철거')}</div>
                <div class="gd-effect-txt">${sDemoDesc || '-'}</div>
            </div>
            <div class="gd-divider"></div>
            <div class="gd-lore">"${sLore}"</div>
        </div>
    `;

    const container = document.getElementById('col-detail-canvas-container');
    if (container && typeof createPixelCanvas === 'function') {
        container.appendChild(createPixelCanvas(shrine.type, 'shrine', 160));
    }
}

function showGhostDetail(enemy) {
    const infoPane = document.getElementById('col-info-pane');
    if (!infoPane) return;

    const T = window.t || ((k, f) => f);
    const killCount = (window.killCounts && window.killCounts[enemy.type]) || 0;
    const dispName = window.tEnemy ? window.tEnemy(enemy.type, 'name', enemy.name || enemy.type) : (enemy.name || enemy.type);
    const eLore    = window.tEnemy ? window.tEnemy(enemy.type, 'lore', enemy.lore || '')         : (enemy.lore || '');
    const eDesc    = window.tEnemy ? window.tEnemy(enemy.type, 'desc', enemy.desc || '')         : (enemy.desc || '');
    const danger = enemy.danger || 0;
    const dc = danger >= 9 ? '#ff2244' : danger >= 7 ? '#ff6622' : danger >= 5 ? '#ffaa00' : danger >= 3 ? '#88cc44' : '#66aaff';
    const dangerLbl = danger >= 9 ? T('ui.detail.danger.extreme', '극위험') : danger >= 7 ? T('ui.detail.danger.high', '위험') : danger >= 5 ? T('ui.detail.danger.caution', '주의') : danger >= 3 ? T('ui.detail.danger.minor', '경미') : T('ui.detail.danger.low', '낮음');

    infoPane.innerHTML = `
        <div class="gd-card">
            <div id="col-detail-canvas-container" class="gd-portrait"></div>
            <div class="gd-name-row">
                <span class="gd-name">${dispName}</span>
                <span class="gd-tier" style="color:${dc};border-color:${dc}66;">D${danger} · ${dangerLbl}</span>
            </div>
            <div class="gd-stats">
                <div class="gd-stat"><div class="gd-stat-lbl">${T('ui.collections.ghost_stat_hp', '체력')}</div><div class="gd-stat-val" style="color:#ff5252;">${Math.floor(enemy.hp)}</div></div>
                <div class="gd-stat"><div class="gd-stat-lbl">${T('ui.collections.ghost_stat_def', '방어')}</div><div class="gd-stat-val" style="color:#42a5f5;">${enemy.defense || 0}</div></div>
                <div class="gd-stat"><div class="gd-stat-lbl">${T('ui.collections.ghost_stat_reward', '보상')}</div><div class="gd-stat-val" style="color:#ffd54a;">${enemy.reward} SE</div></div>
                <div class="gd-stat"><div class="gd-stat-lbl">${T('ui.collections.ghost_stat_kills', '처치')}</div><div class="gd-stat-val" style="color:#fff;">${killCount}</div></div>
            </div>
            <div class="gd-divider"></div>
            <div class="gd-lore">"${eLore || eDesc}"</div>
        </div>
    `;

    const container = document.getElementById('col-detail-canvas-container');
    if (container && typeof createPixelCanvas === 'function') {
        container.appendChild(createPixelCanvas(enemy.type, 'enemy', 160));
    }
}

function showExorcistDetail(unit) {
    const infoPane = document.getElementById('col-info-pane');
    if (!infoPane) return;

    const T = window.t || ((k, f) => f || k);
    const tier = unit.tier || 1;
    const TIER_COLOR = { 1: '#9aa0a6', 2: '#44aaff', 3: '#cc55ff', 4: '#ffd700' };
    const tierColor = TIER_COLOR[tier] || '#9aa0a6';
    const tierLabel = T(`ui.collections.exo.tier_label.${tier}`, `TIER ${tier}`);
    const tierKo    = T(`ui.collections.exo.tier.${tier}`, '');

    const isPassive = !!unit.passive;
    const isInstakill = !!unit.instakill;
    const isGlobal = !!unit.globalRange;

    const subPassive  = T('ui.detail.sub_passive',  '패시브');
    const subInstakill= T('ui.detail.sub_instakill','즉사');
    const subGlobal   = T('ui.detail.sub_global',   '전역');

    const atkDisp = isPassive ? '—' : (isInstakill ? '∞' : unit.damage);
    const atkSub  = isPassive ? subPassive : (isInstakill ? subInstakill : T('ui.detail.sub_damage','데미지'));
    const cdMs    = unit.cooldown || 0;
    const cdSec   = isPassive ? '—' : (cdMs / 1000).toFixed(2);
    const cdSub   = isPassive ? subPassive : T('ui.detail.sub_per_sec','초마다');
    const dps     = (isPassive || isInstakill || cdMs <= 0) ? '—' : Math.round(unit.damage / cdMs * 1000);
    const dpsSub  = isPassive ? subPassive : (isInstakill ? subInstakill : T('ui.detail.sub_dps','초당'));
    const rngDisp = isPassive ? '—' : (isGlobal ? '∞' : unit.range);
    const rngSub  = isPassive ? subPassive : (isGlobal ? subGlobal : T('ui.detail.sub_distance','거리'));

    const tags = [];
    if (isPassive)    tags.push({ t: T('ui.detail.tag_passive','패시브'),   c: '#aaffaa' });
    if (isInstakill)  tags.push({ t: T('ui.detail.tag_instakill','즉사'),    c: '#ff4466' });
    if (isGlobal)     tags.push({ t: T('ui.detail.tag_global','전역'),       c: '#66ddff' });

    const uName = T(`unit.${unit.type}.name`, unit.name || unit.type);
    const uDesc = T(`unit.${unit.type}.desc`, unit.desc || '');
    const uLore = T(`unit.${unit.type}.lore`, unit.lore || '');
    const uRole = window.tUnitRole ? window.tUnitRole(unit.role) : (unit.role || '');

    const svg = (name) => (window.SvgIcons ? window.SvgIcons.get(name) : '');

    infoPane.innerHTML = `
        <div class="ud-card" style="--tier-color:${tierColor};">
            <div class="ud-header">
                <div id="col-detail-canvas-container" class="ud-portrait"></div>
                <div class="ud-titlebox">
                    <div class="ud-tier-pill">${tierLabel}${tierKo ? ` · ${tierKo}` : ''}</div>
                    <div class="ud-name">${uName}</div>
                    <div class="ud-role">${uRole}</div>
                    ${tags.length ? `<div class="ud-tags">${tags.map(x => `<span class="ud-tag" style="color:${x.c};border-color:${x.c}55;background:${x.c}14;">${x.t}</span>`).join('')}</div>` : ''}
                </div>
            </div>

            <div class="ud-statgrid">
                <div class="ud-stat ud-stat-atk">
                    <div class="ud-stat-ico">${svg('sword') || '⚔'}</div>
                    <div class="ud-stat-val">${atkDisp}</div>
                    <div class="ud-stat-lbl">${T('ui.detail.lbl_attack','공격력')}</div>
                    <div class="ud-stat-sub">${atkSub}</div>
                </div>
                <div class="ud-stat ud-stat-dps">
                    <div class="ud-stat-ico">${svg('fire') || '🔥'}</div>
                    <div class="ud-stat-val">${dps}</div>
                    <div class="ud-stat-lbl">${T('ui.detail.lbl_dps','DPS')}</div>
                    <div class="ud-stat-sub">${dpsSub}</div>
                </div>
                <div class="ud-stat ud-stat-rng">
                    <div class="ud-stat-ico">${svg('target') || '◎'}</div>
                    <div class="ud-stat-val">${rngDisp}</div>
                    <div class="ud-stat-lbl">${T('ui.detail.lbl_range','사거리')}</div>
                    <div class="ud-stat-sub">${rngSub}</div>
                </div>
                <div class="ud-stat ud-stat-cd">
                    <div class="ud-stat-ico">${svg('hourglass') || '⧗'}</div>
                    <div class="ud-stat-val">${cdSec}<span class="ud-stat-unit">s</span></div>
                    <div class="ud-stat-lbl">${T('ui.detail.lbl_cooldown','쿨다운')}</div>
                    <div class="ud-stat-sub">${cdSub}</div>
                </div>
            </div>

            <div class="ud-skill-box">
                <div class="ud-skill-head">
                    <span class="ud-skill-ico">${svg('sparkle') || '✦'}</span>
                    <span class="ud-skill-title">${T('ui.detail.lbl_ability','능력')}</span>
                </div>
                <div class="ud-skill-desc">${uDesc || '-'}</div>
            </div>

            ${uLore ? `<div class="ud-lore">"${uLore}"</div>` : ''}
        </div>
    `;

    const container = document.getElementById('col-detail-canvas-container');
    if (container && typeof createPixelCanvas === 'function') {
        container.appendChild(createPixelCanvas(unit.type, 'unit', 120));
    }
}

// Window Exports
window.initCollections        = initCollections;
window.startColInfoResetTimer = startColInfoResetTimer;
window.resetColInfo           = resetColInfo;
window.showShrineDetail       = showShrineDetail;
window.showGhostDetail        = showGhostDetail;
window.showExorcistDetail     = showExorcistDetail;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCollections);
} else {
    initCollections();
}
