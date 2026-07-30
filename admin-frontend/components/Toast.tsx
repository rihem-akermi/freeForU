// components/Toast.tsx
'use client'
import { useEffect } from "react";

type ToastProps = {
  message: string;
  type: "success" | "error";
  onClose: () => void;
};

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = type === "success"
    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
    : "bg-red-50 border-red-200 text-red-700";

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-2 ${styles}`}>
      <span className="text-lg">{type === "success" ? "✓" : "✕"}</span>
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}