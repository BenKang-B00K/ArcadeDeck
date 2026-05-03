import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import './ToastContext.css';

export type ToastType = 'success' | 'info' | 'error';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, durationMs?: number) => void;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', durationMs = 4000) => {
    counterRef.current += 1;
    const id = counterRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    const timer = setTimeout(() => dismissToast(id), durationMs);
    timersRef.current.set(id, timer);
  }, [dismissToast]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const Toaster: React.FC = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;
  const { toasts, dismissToast } = ctx;
  if (toasts.length === 0) return null;
  return (
    <div className="toast-stack" role="region" aria-live="polite" aria-atomic="false">
      {toasts.map(t => (
        <div key={t.id} className={`notification-toast ${t.type} animate-in toast-stack-item`}>
          <span className="notification-message">{t.message}</span>
          <button
            type="button"
            className="toast-dismiss"
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss notification"
          >×</button>
        </div>
      ))}
    </div>
  );
};
