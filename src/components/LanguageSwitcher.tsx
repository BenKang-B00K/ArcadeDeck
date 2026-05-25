import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Globe } from 'lucide-react';
import { SUPPORTED_LOCALES, getLocaleLabel, useLocale, useUiText } from '../i18n';
import { loadOverlay } from '../i18n/registry';
import './LanguageSwitcher.css';

interface OverlayLabels {
  [lang: string]: string;
}

// Module-scope cache so labels survive component remounts (route nav).
const labelCache: OverlayLabels = {};

const LanguageSwitcher: React.FC = () => {
  const { lang, overlay, navigateToLocale } = useLocale();
  const t = useUiText();
  const [open, setOpen] = useState(false);
  const [labels, setLabels] = useState<OverlayLabels>(() => ({ ...labelCache }));
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Seed cache for the active locale from the already-loaded overlay so the
  // toggle button shows the native label even on first mount of this component.
  useEffect(() => {
    const resolved = getLocaleLabel(lang, overlay);
    if (labelCache[lang] !== resolved) {
      labelCache[lang] = resolved;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLabels(prev => ({ ...prev, [lang]: resolved }));
    }
  }, [lang, overlay]);

  // Resolve labels for non-built-in overlays once when the menu first opens.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const next: OverlayLabels = {};
      for (const code of SUPPORTED_LOCALES) {
        if (labelCache[code] !== undefined) continue;
        const ov = await loadOverlay(code);
        const resolved = getLocaleLabel(code, ov);
        labelCache[code] = resolved;
        next[code] = resolved;
      }
      if (!cancelled && Object.keys(next).length > 0) {
        setLabels(prev => ({ ...prev, ...next }));
      }
    })();
    return () => { cancelled = true; };
  }, [open]);

  // Click-away close
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onPick = useCallback((code: string) => {
    setOpen(false);
    navigateToLocale(code);
  }, [navigateToLocale]);

  if (SUPPORTED_LOCALES.length <= 1) return null;

  const currentLabel = labels[lang] ?? getLocaleLabel(lang, null);

  return (
    <div className="lang-switcher" ref={wrapperRef}>
      <button
        type="button"
        className="lang-toggle"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        title={t('langSwitcherTitle', 'Change language')}
      >
        <Globe size={16} aria-hidden="true" />
        <span className="lang-toggle-label">{currentLabel}</span>
      </button>
      {open && (
        <ul className="lang-menu" role="listbox" aria-label={t('langSwitcherAriaLabel', 'Language')}>
          {SUPPORTED_LOCALES.map(code => {
            const label = labels[code] ?? getLocaleLabel(code, null);
            return (
              <li key={code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={code === lang}
                  className={`lang-option${code === lang ? ' active' : ''}`}
                  onClick={() => onPick(code)}
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
