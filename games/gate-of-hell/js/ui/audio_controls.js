/* audio_controls.js — Volume UI: SVG icons instead of text/percent readouts.
 *
 * - Quick mute button (top-right of title screen + battlefield).
 * - Settings rows: icon button toggles Music / SFX, slider sets level; the
 *   icon's wave bars show the level.
 * - Frame-rate cap buttons (30 / 60).
 * State lives in soundeffect.js (GameAudio); this file only renders it.
 */

(function () {
    const T = (k, f) => (window.t ? window.t(k, f) : f);
    const icon = (key) => (window.SvgIcons ? SvgIcons.get(key, { size: '100%' }) : '');

    function levelIcon(on, vol) {
        if (!on || vol <= 0) return 'vol_mute';
        return vol < 0.34 ? 'vol_1' : vol < 0.67 ? 'vol_2' : 'vol_3';
    }

    // innerHTML only when the icon actually changes (sliders fire per step).
    function setIcon(el, key) {
        if (el && el._icon !== key) { el._icon = key; el.innerHTML = icon(key); }
    }

    function sync() {
        if (!window.GameAudio) return;
        const p = GameAudio.prefs();
        const anyLevel = Math.max(p.sfxOn ? p.sfxVol : 0, p.musicOn ? p.musicVol : 0);
        document.querySelectorAll('.audio-quick-btn').forEach(b => {
            setIcon(b, p.muted ? 'vol_mute' : levelIcon(true, anyLevel));
            b.setAttribute('aria-pressed', String(p.muted));
        });

        const sfxBtn = document.getElementById('sfx-mute-btn');
        setIcon(sfxBtn, levelIcon(p.sfxOn, p.sfxVol));
        if (sfxBtn) sfxBtn.setAttribute('aria-pressed', String(!p.sfxOn));
        const musicBtn = document.getElementById('music-mute-btn');
        setIcon(musicBtn, p.musicOn && p.musicVol > 0 ? 'music' : 'music_off');
        if (musicBtn) musicBtn.setAttribute('aria-pressed', String(!p.musicOn));

        const sfxRange = document.getElementById('sfx-volume');
        if (sfxRange && document.activeElement !== sfxRange) sfxRange.value = Math.round(p.sfxVol * 100);
        const musicRange = document.getElementById('music-volume');
        if (musicRange && document.activeElement !== musicRange) musicRange.value = Math.round(p.musicVol * 100);

        const fps = window.getFpsCap ? getFpsCap() : 60;
        document.querySelectorAll('[data-fps-set]').forEach(b => b.classList.toggle('active', Number(b.dataset.fpsSet) === fps));
    }

    function mountQuickButtons() {
        const label = T('ui.settings.audio_quick_aria', 'Sound on/off');
        ['start-screen', 'top-panel'].forEach(id => {
            const host = document.getElementById(id);
            if (!host || host.querySelector('.audio-quick-btn')) return;
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'audio-quick-btn';
            b.setAttribute('aria-label', label);
            b.title = label;
            host.appendChild(b);
        });
        sync();
    }

    document.addEventListener('click', (e) => {
        if (!window.GameAudio) return;
        const p = GameAudio.prefs();
        const t = e.target.closest ? e.target : null;
        if (!t) return;
        if (t.closest('.audio-quick-btn')) return GameAudio.setAudioMuted(!p.muted);
        if (t.closest('#sfx-mute-btn')) return GameAudio.setSfxEnabled(!p.sfxOn);
        if (t.closest('#music-mute-btn')) return GameAudio.setMusicEnabled(!p.musicOn);
        const fpsBtn = t.closest('[data-fps-set]');
        if (fpsBtn && window.setFpsCap) { setFpsCap(Number(fpsBtn.dataset.fpsSet)); sync(); }
    });

    document.addEventListener('input', (e) => {
        if (!window.GameAudio || !e.target) return;
        const v = e.target.value / 100;
        if (e.target.id === 'sfx-volume') {
            if (!GameAudio.prefs().sfxOn && v > 0) GameAudio.setSfxEnabled(true);
            GameAudio.setSfxVolume(v);
        } else if (e.target.id === 'music-volume') {
            if (!GameAudio.prefs().musicOn && v > 0) GameAudio.setMusicEnabled(true);
            GameAudio.setMusicVolume(v);
        }
    });
    // Audible preview of the new SFX level on release.
    document.addEventListener('change', (e) => {
        if (e.target && e.target.id === 'sfx-volume' && window.playSFX) playSFX('ui_click');
    });

    if (window.EventBus) {
        EventBus.on('audio:changed', sync);
        EventBus.on('sceneChanged', sync);
        EventBus.on('sceneEntered', mountQuickButtons); // first fires after i18n loads
    }
})();
