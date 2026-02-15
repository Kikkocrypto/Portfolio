import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface ToastOptions {
  message: string;
  type?: 'error' | 'success' | 'info';
  duration?: number;
}

interface ToastState {
  visible: boolean;
  message: string;
  type: 'error' | 'success' | 'info';
}

/**
 * Custom hook for displaying toast notifications.
 * Provides accessible, auto-dismissing toasts with travel-tech palette styling.
 * 
 * @param duration - Default duration in ms before auto-dismiss (default: 5000)
 * @returns Object with showToast function and Toast component
 */
export function useToast(duration: number = 5000) {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = useCallback((options: ToastOptions) => {
    setToast({
      visible: true,
      message: options.message,
      type: options.type || 'info',
    });

    // Auto-dismiss after duration
    const timeoutDuration = options.duration ?? duration;
    const timerId = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, timeoutDuration);

    return () => clearTimeout(timerId);
  }, [duration]);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const Toast = () => {
    if (!toast.visible) return null;

    const bgColor = {
      error: 'bg-[#8B4513]',
      success: 'bg-[#6B5D4F]',
      info: 'bg-[#D4A574]',
    }[toast.type];

    const textColor = {
      error: 'text-white',
      success: 'text-white',
      info: 'text-[#2C2416]',
    }[toast.type];

    const toastContent = (
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="fixed bottom-4 right-4 z-[9999] animate-in slide-in-from-bottom-2 duration-300"
        style={{
          maxWidth: '400px',
        }}
      >
        <div
          className={`${bgColor} ${textColor} px-6 py-4 rounded-lg shadow-lg flex items-start justify-between gap-4`}
        >
          <p className="text-sm font-medium leading-relaxed flex-1">
            {toast.message}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              hideToast();
            }}
            aria-label="Close notification"
            className={`${textColor} hover:opacity-70 transition-opacity flex-shrink-0 mt-0.5 cursor-pointer relative z-10 min-w-[2rem] min-h-[2rem] flex items-center justify-center`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    );

    return typeof document !== 'undefined'
      ? createPortal(toastContent, document.body)
      : toastContent;
  };

  return { showToast, Toast };
}
