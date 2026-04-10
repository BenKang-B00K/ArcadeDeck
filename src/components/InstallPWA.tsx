import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, X } from 'lucide-react';
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

const isIOSSafari = (): boolean => {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isStandalone = navigator.standalone === true;
  return isIOS && !isStandalone;
};

const InstallPWA: React.FC = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e as BeforeInstallPromptEvent);
      timerRef.current = setTimeout(() => setIsVisible(true), 3000);
    };

    const installedHandler = () => {
      setSupportsPWA(false);
      setIsVisible(false);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    // iOS Safari detection — show manual install guide
    if (isIOSSafari()) {
      setIsIOS(true);
      timerRef.current = setTimeout(() => setIsVisible(true), 3000);
    }

    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!promptInstall) return;

    promptInstall.prompt();
    promptInstall.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        setIsVisible(false);
      }
    });
  };

  const closeBanner = () => {
    setIsVisible(false);
    // Remember dismissal for this session
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if ((!supportsPWA && !isIOS) || sessionStorage.getItem('pwa_banner_dismissed')) {
    return null;
  }

  return (
    <div className={`pwa-install-banner ${isVisible ? 'show' : ''}`}>
      <div className="pwa-content">
        <div className="pwa-icon"><Gamepad2 size={24} aria-hidden="true" /></div>
        <div className="pwa-text">
          <h3>Install ArcadeDeck</h3>
          {isIOS ? (
            <p>Tap <strong>Share</strong> ↗ then <strong>Add to Home Screen</strong></p>
          ) : (
            <p>Get the best gaming experience on your home screen!</p>
          )}
        </div>
        <div className="pwa-actions">
          {!isIOS && <button className="install-btn" onClick={onClick}>Install</button>}
          <button className="close-btn" onClick={closeBanner} aria-label="Close install banner"><X size={18} aria-hidden="true" /></button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
