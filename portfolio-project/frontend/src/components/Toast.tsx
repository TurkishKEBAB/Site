"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  hideToast: (id: string) => void;
}

interface ToastProviderProps {
  readonly children: ReactNode;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const createToastId = (): string => globalThis.crypto.randomUUID();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, number>());

  const clearTimer = useCallback((id: string) => {
    const handle = timers.current.get(id);
    if (handle !== undefined) {
      window.clearTimeout(handle);
      timers.current.delete(id);
    }
  }, []);

  const hideToast = useCallback(
    (id: string) => {
      clearTimer(id);
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    },
    [clearTimer],
  );

  const showToast = useCallback(
    (type: ToastType, message: string, duration = 5000) => {
      const id = createToastId();
      const nextToast: Toast = { id, type, message, duration };

      setToasts((prev) => [...prev, nextToast]);

      if (duration > 0) {
        const handle = window.setTimeout(() => {
          hideToast(id);
        }, duration);
        timers.current.set(id, handle);
      }
    },
    [hideToast],
  );

  useEffect(() => {
    const active = timers.current;
    return () => {
      active.forEach((handle) => window.clearTimeout(handle));
      active.clear();
    };
  }, []);

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white";
      case "error":
        return "bg-red-500 text-white";
      case "warning":
        return "bg-yellow-500 text-black";
      case "info":
      default:
        return "bg-blue-500 text-white";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`${getToastStyles(
                toast.type,
              )} min-w-[300px] max-w-md pointer-events-auto flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg`}
              role="alert"
              aria-live={toast.type === "error" ? "assertive" : "polite"}
            >
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                type="button"
                onClick={() => hideToast(toast.id)}
                className="flex-shrink-0 opacity-70 transition-opacity hover:opacity-100"
                aria-label="Close notification"
              >
                x
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
