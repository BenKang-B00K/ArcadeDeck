import { useCallback } from 'react';
import { useToast } from '../contexts/useToast';

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
  const { showToast } = useToast();

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    showToast(message, type, durationMs);
  }, [showToast, durationMs]);

  return { notification: null, showNotification };
}
