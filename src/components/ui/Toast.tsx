"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (
    toast: Omit<Toast, "id" | "duration"> & { duration?: number }
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const toastConfig = {
  success: {
    bgColor: "bg-green-50",
    borderColor: "border-green-500",
    iconColor: "text-green-600",
    icon: CheckCircle,
  },
  error: {
    bgColor: "bg-red-50",
    borderColor: "border-red-500",
    iconColor: "text-red-600",
    icon: XCircle,
  },
  warning: {
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-500",
    iconColor: "text-yellow-600",
    icon: AlertTriangle,
  },
  info: {
    bgColor: "bg-blue-50",
    borderColor: "border-blue-500",
    iconColor: "text-blue-600",
    icon: Info,
  },
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

  const config = toastConfig[toast.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`relative ${config.bgColor} ${config.borderColor} border-l-4 rounded-lg shadow-2xl max-w-md w-full pointer-events-auto overflow-hidden`}
      style={{ boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)" }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${config.iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
            {toast.message && (
              <p className="mt-1 text-sm text-gray-700 leading-relaxed">
                {toast.message}
              </p>
            )}
          </div>
          <button
            className="flex-shrink-0 inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-md transition-colors"
            onClick={() => onRemove(toast.id)}
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
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
    (toast: Omit<Toast, "id" | "duration"> & { duration?: number }) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: Toast = {
        id,
        duration: 5000,
        ...toast,
      };

      setToasts((prev) => [newToast, ...prev]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[99999] space-y-3 pointer-events-none max-w-md w-full px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
