'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'framer-motion';

type Toast = {
  id: string;
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'info';
  duration?: number; // ms
};

type ToastContextValue = {
  showToast: (t: Omit<Toast, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = uuidv4();
    const toast: Toast = { id, duration: t.duration ?? 3500, ...t };
    setToasts((s) => [toast, ...s]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((s) => s.filter((x) => x.id !== id));
  }, []);

  // auto remove by duration
  useEffect(() => {
    const timers = toasts.map((t) => {
      if (!t.duration) return null;
      const timer = setTimeout(() => remove(t.id), t.duration);
      return timer;
    });
    return () => timers.forEach((t) => t && clearTimeout(t));
  }, [toasts, remove]);

  const ctx = { showToast };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

/* Toast container and toast item */
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  // only render portal after client mount to avoid SSR hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [rootEl, setRootEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);

    // create a dedicated container so we don't rely on document.body structure
    let el = document.getElementById('toast-root') as HTMLElement | null;
    let created = false;
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast-root';
      document.body.appendChild(el);
      created = true;
    }
    setRootEl(el);

    return () => {
      // cleanup created element on unmount if we created it
      if (created && el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
      setRootEl(null);
    };
  }, []);

  if (!mounted || !rootEl) return null;

  return ReactDOM.createPortal(
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            layout
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-80"
          >
            <div
              className={`w-full rounded shadow px-4 py-3 flex items-start gap-3
                ${t.type === 'success' ? 'bg-emerald-50 ring-1 ring-emerald-200' :
                  t.type === 'error' ? 'bg-red-50 ring-1 ring-red-200' :
                  'bg-white ring-1 ring-gray-200'}`}
            >
              <div className="flex-0 mt-0.5">
                {t.type === 'success' ? (
                  <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : t.type === 'error' ? (
                  <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </div>

              <div className="flex-1">
                {t.title && <div className="text-sm font-semibold text-gray-900">{t.title}</div>}
                {t.description && <div className="text-sm text-gray-700 mt-0.5">{t.description}</div>}
              </div>

              <div className="flex-0">
                <button onClick={() => onRemove(t.id)} className="text-sm text-gray-500 px-2 py-1 hover:text-gray-700">✕</button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    rootEl
  );
}
