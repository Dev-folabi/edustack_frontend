"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (title: string, type?: "success" | "error" | "warning" | "info", message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const toastIcons = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

const toastColors = {
  success: "from-emerald-500/20 to-green-500/20 border-emerald-500/30",
  error: "from-red-500/20 to-rose-500/20 border-red-500/30",
  warning: "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
  info: "from-blue-500/20 to-indigo-500/20 border-blue-500/30",
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({
  toast,
  onRemove,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden backdrop-blur-md bg-gradient-to-r ${
        toastColors[toast.type]
      } border rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div
              className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${
                toast.type === "success"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : toast.type === "error"
                  ? "bg-red-500/20 text-red-400"
                  : toast.type === "warning"
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-blue-500/20 text-blue-400"
              }`}
            >
              <span className="text-sm font-medium">{toastIcons[toast.type]}</span>
            </div>
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-white">{toast.title}</p>
            {toast.message && (
              <p className="mt-1 text-sm text-white/70">{toast.message}</p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="inline-flex text-white/60 hover:text-white/80 focus:outline-none focus:text-white/80 transition-colors duration-200"
              onClick={() => onRemove(toast.id)}
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (title: string, type: "success" | "error" | "warning" | "info" = "info", message?: string) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: Toast = {
        id,
        type,
        title,
        message,
        duration: 5000,
      };

      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
