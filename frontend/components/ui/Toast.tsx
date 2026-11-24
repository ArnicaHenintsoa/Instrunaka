"use client";

import { useEffect } from "react";

type ToastVariant = "success" | "error" | "info";

type ToastProps = Readonly<{
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: () => void;
}>;

const variantClasses: Record<ToastVariant, string> = {
  success: "bg-success text-white",
  error: "bg-danger text-white",
  info: "bg-accent text-white",
};

const variantIcons: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

export default function Toast({
  message,
  variant = "success",
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-20 right-4 z-50">
      <div
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
          min-w-[280px] max-w-md
          ${variantClasses[variant]}
        `}
      >
        <span className="text-lg">{variantIcons[variant]}</span>
        <span className="text-sm font-medium flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>
    </div>
  );
}