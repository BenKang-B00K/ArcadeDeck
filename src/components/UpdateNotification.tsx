import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useUiText } from '../i18n';
import './UpdateNotification.css';

const UpdateNotification: React.FC = () => {
  const t = useUiText();
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
    onRegisteredSW(swUrl, r) {
      if (!r) return;
      const checkForUpdate = async () => {
        if (r.installing || !navigator) return;
        if ('connection' in navigator && !navigator.onLine) return;
        try {
          const resp = await fetch(swUrl, {
            cache: 'no-store',
            headers: { 'cache-control': 'no-cache' },
          });
          if (resp?.status === 200) await r.update();
        } catch {
          // network error — ignore, retry next tick
        }
      };
      // Check every 30 minutes
      setInterval(checkForUpdate, 30 * 60 * 1000);
      // Check when tab regains focus
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdate();
      });
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  const handleUpdate = async () => {
    try {
      await updateServiceWorker(true);
    } catch (err) {
      console.error('SW update failed', err);
    }
    // Fallback: force reload if controllerchange didn't fire (no waiting SW,
    // browser quirk, etc). Safe — if reload already happened from the
    // `controlling` event, this never runs.
    setTimeout(() => window.location.reload(), 1500);
  };

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div className="update-notification-container">
      <div className="update-notification-toast">
        <div className="update-notification-content">
          <div className="update-icon">🚀</div>
          <div className="update-text">
            {offlineReady ? (
              <p>{t('updateOfflineReady', 'App ready to work offline!')}</p>
            ) : (
              <>
                <h3>{t('updateAvailable', 'New Version Available!')}</h3>
                <p>{t('updateDescription', 'Update now to get the latest features and games.')}</p>
              </>
            )}
          </div>
        </div>
        <div className="update-actions">
          {needRefresh && (
            <button className="update-btn" onClick={handleUpdate}>
              {t('updateRefresh', 'Update Now')}
            </button>
          )}
          <button className="close-update-btn" onClick={close}>
            {t('updateDismiss', 'Dismiss')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
