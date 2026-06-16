"use client";

import { useUIStore } from "@/lib/store";
import { useEffect } from "react";

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({
  message,
  type,
  onDismiss,
}: {
  message: string;
  type: "success" | "error" | "info";
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const colors = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-brand-primary/5 border-brand-primary/20 text-brand-primary",
  };

  return (
    <div
      className={`
        animate-slide-up px-4 py-3 rounded-soft border shadow-medium
        text-body-sm font-medium flex items-center gap-2
        ${colors[type]}
      `}
    >
      {type === "success" && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M13.333 4L6 11.333 2.667 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {type === "error" && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 5v3.333M8 11.333h.007" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )}
      {type === "info" && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 7.333v4M8 4.667h.007" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )}
      {message}
      <button onClick={onDismiss} className="ml-2 opacity-50 hover:opacity-100">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
