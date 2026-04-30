import { useCallback, useRef, useState } from 'react';

export type NotificationType = 'success' | 'info' | 'error';

export interface Notification {
  message: string;
  type: NotificationType;
}

export interface UseNotificationReturn {
  notification: Notification | null;
  showNotification: (message: string, type?: NotificationType) => void;
}

export function useNotification(durationMs: number = 4000): UseNotificationReturn {
  const [notification, setNotification] = useState<Notification | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    setNotification({ message, type });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setNotification(null), durationMs);
  }, [durationMs]);

  return { notification, showNotification };
}
