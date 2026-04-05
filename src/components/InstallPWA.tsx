import React, { useState, useEffect } from 'react';
import './InstallPWA.css';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const isIOSSafari = (): boolean => {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  const isStandalone = (navigator as any).standalone === true;
  return isIOS && !isStandalone;
};

const InstallPWA: React.FC = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e as BeforeInstallPromptEvent);

      // Show with a slight delay after load
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Hide if already installed
    window.addEventListener('appinstalled', () => {
      setSupportsPWA(false);
      setIsVisible(false);
    });

    // iOS Safari detection — show manual install guide
    if (isIOSSafari()) {
      setIsIOS(true);
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!promptInstall) return;

    promptInstall.prompt();
    promptInstall.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install');
        setIsVisible(false);
      } else {
        console.log('User dismissed the PWA install');
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
        <div className="pwa-icon">🎮</div>
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
          <button className="close-btn" onClick={closeBanner}>✕</button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
