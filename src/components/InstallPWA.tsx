import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, X } from 'lucide-react';
import { useUiText } from '../i18n';
import './InstallPWA.css';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

const DISMISS_KEY = 'pwa_banner_dismissed_at';
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: window-controls-overlay)').matches ||
    window.matchMedia?.('(display-mode: minimal-ui)').matches ||
    navigator.standalone === true
  );
};

const isIOSSafari = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  if (!isIOS) return false;
  // Exclude in-app browsers and non-Safari iOS browsers (can't A2HS):
  // Chrome iOS = CriOS, Firefox iOS = FxiOS, Edge iOS = EdgiOS, etc.
  const isNonSafari = /CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser|FBAN|FBAV|Instagram|Line|KAKAOTALK/i.test(ua);
  if (isNonSafari) return false;
  return !isStandalone();
};

const isDismissedRecently = (): boolean => {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < DISMISS_TTL_MS;
  } catch {
    return false;
  }
};

const InstallPWA: React.FC = () => {
  const t = useUiText();
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS] = useState<boolean>(() => isIOSSafari());
  const [installed, setInstalled] = useState<boolean>(() => isStandalone());
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (installed) return;
    if (isDismissedRecently()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e as BeforeInstallPromptEvent);
      timerRef.current = setTimeout(() => setIsVisible(true), 3000);
    };

    const installedHandler = () => {
      setSupportsPWA(false);
      setIsVisible(false);
      setInstalled(true);
      try {
        localStorage.removeItem(DISMISS_KEY);
      } catch {
        // ignore
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    if (isIOS) {
      timerRef.current = setTimeout(() => setIsVisible(true), 3000);
    }

    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, [isIOS, installed]);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!promptInstall) return;

    promptInstall.prompt();
    promptInstall.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        setIsVisible(false);
      } else {
        // User dismissed via native prompt — respect for TTL window
        try {
          localStorage.setItem(DISMISS_KEY, String(Date.now()));
        } catch {
          // ignore
        }
      }
    });
  };

  const closeBanner = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  };

  if (installed) return null;
  if (!supportsPWA && !isIOS) return null;
  if (isDismissedRecently()) return null;

  return (
    <div className={`pwa-install-banner ${isVisible ? 'show' : ''}`}>
      <div className="pwa-content">
        <div className="pwa-icon"><Gamepad2 size={24} aria-hidden="true" /></div>
        <div className="pwa-text">
          <h3>{t('installTitle', 'Install ArcadeDeck')}</h3>
          {isIOS ? (
            <p>{t('installIosHint', 'Tap Share ↗ then Add to Home Screen')}</p>
          ) : (
            <p>{t('installSubtitle', 'Get the best gaming experience on your home screen!')}</p>
          )}
        </div>
        <div className="pwa-actions">
          {!isIOS && <button className="install-btn" onClick={onClick}>{t('installCta', 'Install')}</button>}
          <button className="close-btn" onClick={closeBanner} aria-label={t('installCloseBanner', 'Close install banner')}><X size={18} aria-hidden="true" /></button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
