"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string;
  type: "success" | "error";
  onClose: () => void;
};

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === "success";
  const accentVar = isSuccess ? "var(--color-success)" : "var(--color-danger)";

  return (
    <div
      className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border bg-primary px-5 py-3.5 text-primary-foreground shadow-2xl backdrop-blur-md transition-all duration-300"
      style={{ borderColor: `color-mix(in srgb, ${accentVar} 45%, transparent)` }}
    >
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
        style={{ backgroundColor: accentVar, color: "#ffffff" }}
      >
        {isSuccess ? "✓" : "✕"}
      </span>
      <p className="text-sm font-semibold tracking-wide">{message}</p>
      <button
        onClick={onClose}
        className="ml-3 cursor-pointer p-1 text-primary-foreground/60 transition hover:text-primary-foreground"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}