'use client';

import React, { ReactNode, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeOnBackdrop?: boolean;
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
}: ModalProps) {
  const root = typeof window !== 'undefined' ? document.body : null;
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastActiveRef.current = document.activeElement as HTMLElement | null;
    // focus first focusable inside modal (or modal container)
    setTimeout(() => dialogRef.current?.focus(), 50);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden'; // prevent background scroll

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
      lastActiveRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!root) return null;

  const sizeClass = size === 'sm' ? 'max-w-lg' : size === 'lg' ? 'max-w-4xl' : 'max-w-2xl';

  return ReactDOM.createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <motion.div
            onClick={() => closeOnBackdrop && onClose()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
          />

          {/* Modal panel */}
          <motion.div
            initial={{ y: 8, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 8, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`relative z-10 w-full ${sizeClass} mx-4`}
            role="document"
          >
            <div
              ref={dialogRef}
              tabIndex={-1}
              className="bg-white rounded-lg shadow-lg overflow-hidden focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* header */}
              {(title || true) && (
                <div className="px-5 py-3 border-b flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">{title ?? 'Details'}</h3>
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none">
                      <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}

              {/* body */}
              <div className="p-5">
                {children}
              </div>

              {/* footer */}
              {footer && <div className="px-5 py-3 border-t">{footer}</div>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    root
  );
}
