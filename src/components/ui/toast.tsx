"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, Check, Info, X, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastProps {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  visible?: boolean;
}

export function Toast({
  type = "info",
  title,
  message,
  duration = 5000,
  onClose,
  visible = true,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const typeClasses = {
    success:
      "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    error:
      "bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
    warning:
      "bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
    info: "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
  };

  const Icon = {
    success: Check,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }[type];

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 max-w-md p-4 rounded-md border shadow-md flex items-start gap-3 transition-all",
        typeClasses[type],
        "animate-slide-in-right"
      )}
      role="alert"
    >
      <div className="flex-shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        {title && <h4 className="font-medium text-sm">{title}</h4>}
        <p className="text-sm">{message}</p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
        className="flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Toast Context Provider
interface ToastContextProps {
  showToast: (props: Omit<ToastProps, "visible" | "onClose">) => void;
  hideToast: () => void;
}

const ToastContext = React.createContext<ToastContextProps | undefined>(
  undefined
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = (props: Omit<ToastProps, "visible" | "onClose">) => {
    setToast({ ...props, visible: true, onClose: () => setToast(null) });
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && <Toast {...toast} />}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
