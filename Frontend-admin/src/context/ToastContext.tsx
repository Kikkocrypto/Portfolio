import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface ToastState {
  visible: boolean;
  message: string;
  type: 'error' | 'success' | 'info';
}

interface ToastContextValue {
  showToast: (message: string, type?: 'error' | 'success' | 'info') => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 6000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'error',
  });

  const showToast = useCallback((message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToast({ visible: true, message, type });
    const t = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, DEFAULT_DURATION);
    return () => clearTimeout(t);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <div
          role="alert"
          aria-live="assertive"
          className="toast"
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: 'min(90vw, 420px)',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            backgroundColor: toast.type === 'error' ? '#8b4513' : toast.type === 'success' ? '#5a4a3a' : '#7d6e5c',
            color: '#fff',
            fontSize: '0.95rem',
            lineHeight: 1.4,
          }}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider');
  return ctx;
}
