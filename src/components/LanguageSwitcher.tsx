import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Globe } from 'lucide-react';
import { SUPPORTED_LOCALES, getLocaleLabel, useLocale } from '../i18n';
import { loadOverlay } from '../i18n/registry';
import './LanguageSwitcher.css';

interface OverlayLabels {
  [lang: string]: string;
}

const LanguageSwitcher: React.FC = () => {
  const { lang, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const [labels, setLabels] = useState<OverlayLabels>({});
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Resolve labels for non-built-in overlays once when the menu first opens.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const next: OverlayLabels = {};
      for (const code of SUPPORTED_LOCALES) {
        if (labels[code] !== undefined) continue;
        const overlay = await loadOverlay(code);
        next[code] = getLocaleLabel(code, overlay);
      }
      if (!cancelled && Object.keys(next).length > 0) {
        setLabels(prev => ({ ...prev, ...next }));
      }
    })();
    return () => { cancelled = true; };
  }, [open, labels]);

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
    void setLocale(code);
  }, [setLocale]);

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
        title="Change language"
      >
        <Globe size={16} aria-hidden="true" />
        <span className="lang-toggle-label">{currentLabel}</span>
      </button>
      {open && (
        <ul className="lang-menu" role="listbox" aria-label="Language">
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
