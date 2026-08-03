'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

type ToastInput = {
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
};

type Toast = ToastInput & {
  id: string;
  type: ToastType;
};

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
};

type PendingConfirm = ConfirmOptions & {
  resolve: (confirmed: boolean) => void;
};

type FeedbackContextType = {
  toast: (input: ToastInput) => string;
  dismissToast: (id: string) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

const toastStyles: Record<ToastType, { icon: string; className: string }> = {
  success: {
    icon: 'fa-solid fa-circle-check',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  error: {
    icon: 'fa-solid fa-circle-exclamation',
    className: 'border-red-200 bg-red-50 text-red-800',
  },
  warning: {
    icon: 'fa-solid fa-triangle-exclamation',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  info: {
    icon: 'fa-solid fa-circle-info',
    className: 'border-blue-200 bg-blue-50 text-blue-800',
  },
  loading: {
    icon: 'fa-solid fa-spinner fa-spin',
    className: 'border-gray-200 bg-white text-heading',
  },
};

function createToastId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismissToast = useCallback((id: string) => {
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = createToastId();
      const next: Toast = {
        id,
        type: input.type || 'info',
        title: input.title,
        message: input.message,
        duration: input.duration,
      };

      setToasts((current) => [next, ...current].slice(0, 4));

      if (next.type !== 'loading') {
        timers.current[id] = setTimeout(() => dismissToast(id), input.duration ?? 4500);
      }

      return id;
    },
    [dismissToast],
  );

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPendingConfirm({ ...options, resolve });
    });
  }, []);

  const closeConfirm = (confirmed: boolean) => {
    pendingConfirm?.resolve(confirmed);
    setPendingConfirm(null);
  };

  const value = useMemo(
    () => ({ toast, dismissToast, confirm }),
    [confirm, dismissToast, toast],
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="fixed left-1/2 top-4 z-[1000] flex w-[calc(100%-2rem)] max-w-[460px] -translate-x-1/2 flex-col gap-3 pointer-events-none">
        {toasts.map((item) => {
          const style = toastStyles[item.type];
          return (
            <div
              key={item.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-card ${style.className}`}
            >
              <i className={`${style.icon} mt-0.5 text-sm shrink-0`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-5">{item.title}</p>
                {item.message && <p className="mt-0.5 text-xs leading-5 opacity-85">{item.message}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(item.id)}
                className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-md opacity-70 transition hover:bg-black/5 hover:opacity-100"
                aria-label="Close notification"
              >
                <i className="fa-solid fa-xmark text-xs" />
              </button>
            </div>
          );
        })}
      </div>

      {pendingConfirm && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[420px] rounded-[10px] bg-white p-6 shadow-extra">
            <div className="mb-4 flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  pendingConfirm.tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'
                }`}
              >
                <i className={pendingConfirm.tone === 'danger' ? 'fa-solid fa-trash' : 'fa-solid fa-circle-question'} />
              </div>
              <div>
                <h3 className="text-base font-heading font-bold text-heading">{pendingConfirm.title}</h3>
                <p className="mt-1 text-sm leading-6 text-paragraph">{pendingConfirm.message}</p>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => closeConfirm(false)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-semibold text-heading transition-colors hover:bg-gray-50"
              >
                {pendingConfirm.cancelLabel || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => closeConfirm(true)}
                className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold text-white transition-colors ${
                  pendingConfirm.tone === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {pendingConfirm.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback must be used within FeedbackProvider');
  return context;
}

