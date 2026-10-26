import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { sound } from '../lib/sound';

export interface AppErrorItem {
  id: string;
  title: string;
  message: string;
  details?: string;
  severity?: 'error' | 'warning' | 'info';
  timestamp: number;
  onRetry?: () => void;
}

interface ErrorContextType {
  errors: AppErrorItem[];
  showError: (error: { title?: string; message: string; details?: string; onRetry?: () => void }) => void;
  showWarning: (warning: { title?: string; message: string }) => void;
  showSuccess: (info: { title?: string; message: string }) => void;
  dismissError: (id: string) => void;
  clearAllErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

// Standalone function for non-React contexts or outside component tree
let globalShowErrorFn: ((err: { title?: string; message: string; details?: string }) => void) | null = null;

export const triggerGlobalError = (err: { title?: string; message: string; details?: string }) => {
  if (globalShowErrorFn) {
    globalShowErrorFn(err);
  } else {
    // eslint-disable-next-line no-console
    console.error('Antigravity Global Error:', err);
  }
};

interface ErrorProviderProps {
  children: ReactNode;
  lang?: 'BN' | 'EN';
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children, lang = 'BN' }) => {
  const [errors, setErrors] = useState<AppErrorItem[]>([]);

  const dismissError = useCallback((id: string) => {
    setErrors((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const showError = useCallback(
    ({
      title,
      message,
      details,
      onRetry,
    }: {
      title?: string;
      message: string;
      details?: string;
      onRetry?: () => void;
    }) => {
      try {
        sound.playBeep();
      } catch {
        // audio might be disabled or blocked
      }

      const defaultTitle = lang === 'BN' ? 'একটি ত্রুটি দেখা দিয়েছে' : 'An Error Occurred';
      const newError: AppErrorItem = {
        id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: title || defaultTitle,
        message,
        details,
        severity: 'error',
        timestamp: Date.now(),
        onRetry,
      };

      setErrors((prev) => [newError, ...prev.slice(0, 4)]);
    },
    [lang]
  );

  const showWarning = useCallback(
    ({ title, message }: { title?: string; message: string }) => {
      const defaultTitle = lang === 'BN' ? 'সতর্কবার্তা' : 'Warning';
      const newError: AppErrorItem = {
        id: `warn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: title || defaultTitle,
        message,
        severity: 'warning',
        timestamp: Date.now(),
      };
      setErrors((prev) => [newError, ...prev.slice(0, 4)]);
    },
    [lang]
  );

  const showSuccess = useCallback(
    ({ title, message }: { title?: string; message: string }) => {
      const defaultTitle = lang === 'BN' ? 'সফল হয়েছে' : 'Success';
      const newError: AppErrorItem = {
        id: `info-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: title || defaultTitle,
        message,
        severity: 'info',
        timestamp: Date.now(),
      };
      setErrors((prev) => [newError, ...prev.slice(0, 4)]);
    },
    [lang]
  );

  // Bind global standalone function
  useEffect(() => {
    globalShowErrorFn = showError;
    return () => {
      globalShowErrorFn = null;
    };
  }, [showError]);

  // Global listeners for unhandled errors & promise rejections
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      // Don't show harmless extension errors
      if (
        event.filename &&
        (event.filename.includes('chrome-extension://') ||
          event.filename.includes('moz-extension://'))
      ) {
        return;
      }

      showError({
        title: lang === 'BN' ? 'সিস্টেম ত্রুটি (Runtime Error)' : 'Runtime Error',
        message:
          event.message ||
          (lang === 'BN'
            ? 'অ্যাপ্লিকেশন চলাকালীন একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।'
            : 'An unexpected application error occurred.'),
        details: event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      let message = 'অপ্রত্যাশিত নেটওয়ার্ক বা প্রমিজ সংক্রান্ত সমস্যা।';
      let details = '';

      if (event.reason) {
        if (typeof event.reason === 'string') {
          message = event.reason;
        } else if (event.reason instanceof Error) {
          message = event.reason.message;
          details = event.reason.stack || '';
        } else if (typeof event.reason === 'object') {
          try {
            message = event.reason.message || JSON.stringify(event.reason);
            details = JSON.stringify(event.reason, null, 2);
          } catch {
            message = String(event.reason);
          }
        }
      }

      showError({
        title: lang === 'BN' ? 'নেটওয়ার্ক বা ডেটা সংক্রান্ত ত্রুটি' : 'Network / Data Error',
        message,
        details,
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [lang, showError]);

  return (
    <ErrorContext.Provider
      value={{
        errors,
        showError,
        showWarning,
        showSuccess,
        dismissError,
        clearAllErrors,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};

export const useErrorHandler = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorHandler must be used within an ErrorProvider');
  }
  return context;
};
