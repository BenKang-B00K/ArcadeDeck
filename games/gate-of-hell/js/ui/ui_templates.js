/* ui_templates.js - HTML Templates and Injector for all modal overlays */

window.UITemplates = window.UITemplates || {};

/* ── Collections ─────────────────────────────────────────────────────────── */
/* Function form: re-evaluated on each injection so i18n keys resolve at runtime. */
window.UITemplates.collections = () => {
    const T = window.t || ((k, f) => f || k);
    const closeIcon = window.SvgIcons ? window.SvgIcons.get('close_x') : 'X';
    return `
    <div id="collections-overlay" class="overlay-base" style="display: none;">
        <div id="collections-content">
            <div id="collections-header">
                <div id="collections-tabs">
                    <button class="col-tab-btn active" data-tab="ghosts" data-i18n="ui.collections.tab_ghosts">${T('ui.collections.tab_ghosts','악의 존재')}</button>
                    <button class="col-tab-btn" data-tab="exorcists" data-i18n="ui.collections.tab_exorcists">${T('ui.collections.tab_exorcists','퇴마사 계보')}</button>
                    <button class="col-tab-btn" data-tab="shrines" data-i18n="ui.collections.tab_shrines">${T('ui.collections.tab_shrines','성소')}</button>
                </div>
                <button id="close-collections" aria-label="${T('ui.modal.close','닫기')}">${closeIcon}</button>
            </div>
            <div id="collections-subtitle" data-i18n="ui.collections.subtitle">${T('ui.collections.subtitle','심연의 모든 존재가 이 기록판에 새겨진다')}</div>
            <div id="collections-body">
                <div id="collections-left">
                    <div id="ghosts-section" class="collections-section active">
                        <div id="ghost-grid" class="collections-grid"></div>
                    </div>
                    <div id="exorcists-section" class="collections-section">
                        <div id="exorcist-grid" class="collections-grid"></div>
                    </div>
                    <div id="shrines-section" class="collections-section">
                        <div id="shrine-grid" class="collections-grid"></div>
                    </div>
                </div>
                <div id="col-info-pane">
                    <div class="info-default-text" data-hint="${T('ui.info_panel.hint_select', '▾ 슬롯을 터치하여 상세 보기 ▾')}"><span data-i18n="ui.collections.default_title">${T('ui.collections.default_title','GATE OF HELL')}</span><br><span data-i18n="ui.collections.default_subtitle">${T('ui.collections.default_subtitle','CHRONICLES')}</span></div>
                </div>
            </div>
        </div>
    </div>`;
};

/* ── Relics ──────────────────────────────────────────────────────────────── */
window.UITemplates.relics = () => {
    const T = window.t || ((k, f) => f);
    const closeIcon = window.SvgIcons ? window.SvgIcons.get('close_x') : 'X';
    return `
    <div id="relics-overlay" class="overlay-base" style="display: none;">
        <div id="relics-content">
            <div id="relics-header">
                <div id="relic-subtitle">${T('ui.relics.subtitle', '심연 깊은 곳에서 거두어낸 저주받은 유물')}</div>
                <div id="relic-sf-badge" title="${T('ui.relics.sf_tooltip', 'Soul Fragment — 유물 제작 자원')}">0 SF</div>
                <div id="relic-count-badge" title="${T('ui.relics.count_tooltip', '보유 유물 수')}">0</div>
                <button id="close-relics">${closeIcon}</button>
            </div>
            <div id="relic-body">
                <div id="relic-left">
                    <div id="relics-grid"></div>
                    <div id="relic-bonus-pane">
                        <div class="relic-bonus-title">${T('ui.relics.total_bonus', '총 유물 보너스')}</div>
                    </div>
                </div>
                <div id="relic-info-pane">
                    <div class="info-default-text" data-hint="${T('ui.info_panel.hint_select', '▾ 슬롯을 터치하여 상세 보기 ▾')}">${T('ui.relics.default_title', 'GATE OF HELL')}<br>${T('ui.relics.default_subtitle', 'RELIC VAULT')}</div>
                </div>
            </div>
        </div>
    </div>`;
};

/* ── Equipment ───────────────────────────────────────────────────────────── */
window.UITemplates.equipment = () => {
    const T = window.t || ((k, f) => f);
    const closeIcon = window.SvgIcons ? window.SvgIcons.get('close_x') : 'X';
    const chartIcon = window.SvgIcons ? window.SvgIcons.get('chart') : '#';
    return `
    <div id="equip-overlay" class="overlay-base" style="display: none;">
        <div id="equip-content">
            <div id="equip-header">
                <div id="equip-subtitle">${T('ui.equipment.subtitle', '심연에서 거두어들인 성스러운 유물')}</div>
                <button id="equip-droprate-btn" title="${T('ui.equipment.droprate_title', '등급별 드랍률')}" aria-label="${T('ui.equipment.droprate_title', '등급별 드랍률')}">${chartIcon}</button>
                <button id="close-equip">${closeIcon}</button>
            </div>
            <div id="equip-body">
                <div id="equip-left">
                    <div id="equip-grid"></div>
                    <div id="equip-bonus-pane">
                        <div class="equip-bonus-title">${T('ui.equipment.total_bonus', '총 장비 효과')}</div>
                    </div>
                </div>
                <div id="equip-info-pane">
                    <div class="info-default-text" data-hint="${T('ui.info_panel.hint_select', '▾ 슬롯을 터치하여 상세 보기 ▾')}">${T('ui.equipment.default_title', 'GATE OF HELL')}<br>${T('ui.equipment.default_subtitle', 'SACRED ARMORY')}</div>
                </div>
            </div>
        </div>
    </div>`;
};

/* ── Game Over ───────────────────────────────────────────────────────────── */
window.UITemplates.gameOver = () => {
    const T = window.t || ((k, f) => f);
    return `
    <div id="game-over-overlay" class="overlay-base" style="display: none;">
        <div id="game-over-content">
            <h1 id="game-over-title">${T('ui.game_over.title', '영혼이 잠식되었습니다')}</h1>
            <p id="game-over-msg">${T('ui.game_over.msg', '심연이 또 다른 영혼을 거두어갔습니다... 문은 무너졌고, 영원한 어둠이 기다립니다.')}</p>
            <div id="final-stats">${T('ui.game_over.depth_label', '도달한 Depth:')} <span id="final-stage">1</span></div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="retry-btn">${T('ui.game_over.btn_retry', '다시 일어나 정화하기 (재도전)')}</button>
            </div>
        </div>
    </div>`;
};

/* ── Sacrifice ───────────────────────────────────────────────────────────── */
window.UITemplates.sacrifice = () => {
    const T = window.t || ((k, f) => f);
    const warningIcon = window.SvgIcons ? window.SvgIcons.get('warning') : '';
    const rawBody = T('ui.sacrifice.body', '수호자와의 성스러운 계약을 강제로 끊으려 합니까?\n\n영혼을 심연으로 돌려보내는 대가는 결코 가볍지 않으며,\n한번 흩어진 본질은 결코 다시 불러올 수 없습니다.\n\n정말로 이 수호자를 영원한 어둠 속으로 추방하시겠습니까?');
    const bodyParts = rawBody.split('\n\n');
    const lastPara = bodyParts.pop();
    const bodyHtml = bodyParts.join('<br><br>').replace(/\n/g, '<br>') + '<br><br><strong>' + lastPara.replace(/\n/g, '<br>') + '</strong>';
    return `
    <div id="sacrifice-modal" class="overlay-base" style="display: none;">
        <div id="sacrifice-content">
            <div id="sacrifice-header">${warningIcon} ${T('ui.sacrifice.header', '[절대 금기: 영혼의 파기]')}</div>
            <div id="sacrifice-body">${bodyHtml}</div>
            <div id="sacrifice-footer">
                <button id="sacrifice-confirm-btn">${T('ui.sacrifice.btn_confirm', '타락 집행')}</button>
                <button id="sacrifice-cancel-btn">${T('ui.sacrifice.btn_cancel', '계약 유지 (취소)')}</button>
            </div>
        </div>
    </div>`;
};

/* ── Unlock notification ─────────────────────────────────────────────────── */
window.UITemplates.unlock = () => {
    const T = window.t || ((k, f) => f);
    const newBadgeIcon = window.SvgIcons ? window.SvgIcons.get('new_badge') : '';
    return `
    <div id="unlock-modal" class="overlay-base" style="display: none;">
        <div id="unlock-content">
            <div id="unlock-header">${newBadgeIcon} ${T('ui.unlock.header', '새로운 클래스 해금!')}</div>
            <div id="unlock-icon"></div>
            <div id="unlock-name"></div>
            <div id="unlock-desc"></div>
            <div id="unlock-resume-hint">${T('ui.unlock.resume_hint', '(아무 곳이나 클릭하여 재개)')}</div>
        </div>
    </div>`;
};

/* ── Pause / Settings / Quit / Tutorial ─────────────────────────────────── */
window.UITemplates.pause = () => {
    const T = window.t || ((k, f) => f);
    const hourglassIcon = window.SvgIcons ? window.SvgIcons.get('hourglass') : '';
    const pauseBody = T('ui.pause.body', '심연의 흐름이 잠시 멈추었습니다.\n준비가 되면 다시 퇴마를 시작하십시오.').replace(/\n/g, '<br>');
    return `
    <div id="pause-overlay" class="overlay-base" style="display: none;">
        <div id="pause-content">
            <div id="pause-header">${hourglassIcon} ${T('ui.pause.header', 'TIME FROZEN')}</div>
            <div id="pause-body">${pauseBody}</div>
            <div id="pause-footer">
                <button id="pause-resume-btn">${T('ui.pause.btn_resume', '퇴마 재개 (Resume)')}</button>
            </div>
        </div>
    </div>`;
};

window.UITemplates.settings = () => {
    const T = window.t || ((k, f) => f);
    const gearIcon = window.SvgIcons ? window.SvgIcons.get('gear') : '';
    const refreshIcon = window.SvgIcons ? window.SvgIcons.get('refresh') : '';
    return `
    <div id="settings-modal" class="overlay-base" style="display: none;">
        <div id="settings-content">
            <div id="settings-header">${gearIcon} ${T('ui.settings.header', '[정화 설정]')}</div>
            <div id="settings-body">
                <div class="settings-item">
                    <div class="settings-info">
                        <span class="settings-label">${T('ui.settings.tutorial_label', '튜토리얼 가이드')}</span>
                        <span class="settings-desc">${T('ui.settings.tutorial_desc', '새로운 유닛/시스템 발견 시 도움말을 표시합니다.')}</span>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="tutorial-toggle" checked>
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="settings-item">
                    <div class="settings-info">
                        <span class="settings-label">${T('ui.settings.music_label', '배경음악')}</span>
                        <span class="settings-desc">${T('ui.settings.music_desc', '도리안 선법으로 연주되는 배경음악입니다.')}</span>
                    </div>
                    <div class="vol-ctrl">
                        <button type="button" class="vol-icon-btn" id="music-mute-btn" aria-label="${T('ui.settings.music_label', '배경음악')}"></button>
                        <input type="range" id="music-volume" class="sfx-range" min="0" max="100" step="5" aria-label="${T('ui.settings.music_label', '배경음악')}">
                    </div>
                </div>
                <div class="settings-item">
                    <div class="settings-info">
                        <span class="settings-label">${T('ui.settings.sfx_label', '효과음')}</span>
                        <span class="settings-desc">${T('ui.settings.sfx_desc', '전투 및 인터페이스 효과음을 재생합니다.')}</span>
                    </div>
                    <div class="vol-ctrl">
                        <button type="button" class="vol-icon-btn" id="sfx-mute-btn" aria-label="${T('ui.settings.sfx_label', '효과음')}"></button>
                        <input type="range" id="sfx-volume" class="sfx-range" min="0" max="100" step="5" aria-label="${T('ui.settings.sfx_label', '효과음')}">
                    </div>
                </div>
                <div class="settings-item">
                    <div class="settings-info">
                        <span class="settings-label">${T('ui.settings.fps_label', '프레임 제한')}</span>
                        <span class="settings-desc">${T('ui.settings.fps_desc', '30 FPS는 배터리 소모와 발열을 줄입니다.')}</span>
                    </div>
                    <div class="lang-switcher" id="fps-switcher">
                        ${[30, 60].map(f => `<button class="lang-btn" data-fps-set="${f}">${f}</button>`).join('')}
                    </div>
                </div>
                <div class="settings-item">
                    <div class="settings-info">
                        <span class="settings-label">${T('ui.settings.fontsize_label', '글씨 크기')}</span>
                        <span class="settings-desc">${T('ui.settings.fontsize_desc', '인터페이스 글씨 크기를 조절합니다.')}</span>
                    </div>
                    <div class="lang-switcher" id="fontsize-switcher">
                        ${['small', 'medium', 'large'].map(sz => `<button class="lang-btn" data-fs-set="${sz}">${T('ui.settings.fontsize_' + sz, sz.toUpperCase())}</button>`).join('')}
                    </div>
                </div>
                <div class="info-divider" style="margin: 15px 0;"></div>
                <div class="settings-action-row">
                    <button id="restart-btn-top" class="settings-action-btn danger">
                        <span>${refreshIcon}</span>
                        <span>${T('ui.settings.btn_restart', '현재 정화 중단 (재시작)')}</span>
                    </button>
                </div>
            </div>
            <div id="settings-footer">
                <button id="close-settings-btn" class="modal-close-btn">${T('ui.settings.btn_close', '설정 닫기')}</button>
            </div>
        </div>
    </div>`;
};

window.UITemplates.quit = () => {
    const T = window.t || ((k, f) => f);
    const skullIcon = window.SvgIcons ? window.SvgIcons.get('skull') : '';
    const rawBody = T('ui.quit.body', '이미 수많은 영혼이 이 길 위에서 길을 잃었습니다.\n\n당신마저 퇴마를 포기한다면, 이 세상에 남은 빛은 완전히 사라질 것입니다.\n지금까지의 모든 정화 기록이 소멸되며, 다시는 되돌릴 수 없습니다.\n\n정말로 이 성스러운 임무를 포기하시겠습니까?');
    const quitParts = rawBody.split('\n\n');
    // Bold the second paragraph (warning sentence), keep rest normal
    const quitBodyHtml = quitParts.map((p, i) => {
        const html = p.replace(/\n/g, '<br>');
        return (i === 1) ? '<strong>' + html + '</strong>' : html;
    }).join('<br><br>');
    return `
    <div id="quit-modal" class="overlay-base" style="display: none;">
        <div id="quit-content">
            <div id="quit-header">${skullIcon} ${T('ui.quit.header', '[운명의 거부]')}</div>
            <div id="quit-body">${quitBodyHtml}</div>
            <div id="quit-footer">
                <button id="quit-confirm-btn">${T('ui.quit.btn_confirm', '심연으로 도망 (중단)')}</button>
                <button id="quit-cancel-btn">${T('ui.quit.btn_cancel', '운명에 저항 (계속)')}</button>
            </div>
        </div>
    </div>`;
};

window.UITemplates.maxUnits = () => {
    const T = window.t || ((k, f) => f);
    return `
    <div id="max-units-warning" style="display: none;">
        <div class="warning-main">${T('ui.max_units.warning_main', '???: 더 이상 퇴마사를 부를 수 없다!')}</div>
        <div class="warning-sub">${T('ui.max_units.warning_sub', '(최대 퇴마사 인원: 16)')}</div>
    </div>`;
};

window.UITemplates.tutorial = () => {
    const T = window.t || ((k, f) => f);
    const bookIcon = window.SvgIcons ? window.SvgIcons.get('book') : '';
    const candleIcon = window.SvgIcons ? window.SvgIcons.get('candle') : '';
    const swordIcon = window.SvgIcons ? window.SvgIcons.get('sword') : '';
    const demonIcon = window.SvgIcons ? window.SvgIcons.get('demon_face') : '';
    return `
    <div id="tutorial-overlay" class="overlay-base" style="display: none;">
        <div id="tutorial-content">
            <div id="tutorial-header">${bookIcon} ${T('ui.tutorial.header', '[퇴마 지침서]')}</div>
            <div id="tutorial-body">
                <div class="tutorial-section">
                    <h3>${candleIcon} ${T('ui.tutorial.section.basic_title', '기본 조작')}</h3>
                    <p>• ${T('ui.tutorial.section.basic_1', '드래그 & 드롭으로 퇴마사의 위치를 변경할 수 있습니다.')}</p>
                    <p>• ${T('ui.tutorial.section.basic_2', '하단 카드를 클릭하여 새로운 퇴마사를 소환하거나 성소를 건설합니다.')}</p>
                </div>
                <div class="tutorial-section">
                    <h3>${swordIcon} ${T('ui.tutorial.section.units_title', '유닛 & 성소')}</h3>
                    <p>• ${T('ui.tutorial.section.units_1', '퇴마사는 자동으로 악령을 공격하며, SE를 소모해 전직할 수 있습니다.')}</p>
                    <p>• ${T('ui.tutorial.section.units_2', '성소는 주변 아군에게 강력한 버프를 제공하지만, 철거 시 디버프가 발생합니다.')}</p>
                </div>
                <div class="tutorial-section">
                    <h3>${demonIcon} ${T('ui.tutorial.section.pe_title', '포탈 오염도 (PE)')}</h3>
                    <p>• ${T('ui.tutorial.section.pe_1', '악령이 포탈을 통과하면 오염도가 상승합니다.')}</p>
                    <p>• ${T('ui.tutorial.section.pe_2', "오염도가 100%가 되면 세상이 멸망합니다. '정화' 기능을 사용해 오염을 막으세요.")}</p>
                </div>
            </div>
            <div id="tutorial-footer">
                <button id="close-tutorial-btn" class="modal-close-btn">${T('ui.tutorial.btn_close', '지침서 닫기')}</button>
            </div>
        </div>
    </div>`;
};

/* ── Injector ────────────────────────────────────────────────────────────── */
function injectUITemplates(container) {
    if (!container) return;
    let combinedHTML = "";
    Object.values(window.UITemplates).forEach(v => {
        combinedHTML += (typeof v === 'function') ? v() : v;
    });
    container.innerHTML = combinedHTML;
}

window.injectUITemplates = injectUITemplates;
