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

  const styleClasses =
    type === "success"
      ? "bg-emerald-950/90 text-emerald-100 border-emerald-800/50 shadow-emerald-950/20"
      : "bg-rose-950/90 text-rose-100 border-rose-800/50 shadow-rose-950/20";

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-2xl backdrop-blur-md transition-all duration-300 ${styleClasses}`}
    >
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs font-bold">
        {type === "success" ? "✓" : "✕"}
      </span>
      <p className="text-sm font-semibold tracking-wide">{message}</p>
      <button
        onClick={onClose}
        className="ml-3 text-white/60 hover:text-white transition p-1 cursor-pointer"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}