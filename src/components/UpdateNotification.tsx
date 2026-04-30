import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import './UpdateNotification.css';

const UpdateNotification: React.FC = () => {
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
              <p>App ready to work offline!</p>
            ) : (
              <>
                <h3>New Version Available!</h3>
                <p>Update now to get the latest features and games.</p>
              </>
            )}
          </div>
        </div>
        <div className="update-actions">
          {needRefresh && (
            <button className="update-btn" onClick={() => updateServiceWorker(true)}>
              Update Now
            </button>
          )}
          <button className="close-update-btn" onClick={close}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
