"use client";

import React, { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

/* ==========================================
   1. BUTTON PRIMITIVE
   ========================================== */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "neutral" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-[#0B162C] hover:bg-[#1C2942] text-white focus:ring-[#0B162C] shadow-md hover:shadow-lg hover:-translate-y-0.5",
    secondary: "bg-[#1C2942] hover:bg-[#291527] text-white focus:ring-[#1C2942] shadow-sm hover:-translate-y-0.5",
    accent: "bg-[#9D8099] hover:bg-[#291527] text-white focus:ring-[#9D8099] shadow-sm hover:-translate-y-0.5",
    neutral: "bg-[#EEECF2] hover:bg-[#9D8099]/20 text-[#0B162C] focus:ring-[#9D8099]",
    danger: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-600 shadow-sm hover:-translate-y-0.5",
    outline: "border-1.5 border-[var(--color-border)] hover:border-[#9D8099] bg-white text-[#0B162C] hover:bg-[#EEECF2]/50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}

/* ==========================================
   2. FORM INPUT PRIMITIVES
   ========================================== */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = "", id, ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-wider text-[#0B162C]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 text-sm bg-[#EEECF2]/60 focus:bg-white text-[#000000] border-1.5 border-[var(--color-border)] rounded-xl transition-all duration-200 outline-none focus:border-[#291527] focus:ring-4 focus:ring-[#291527]/10 placeholder:text-[#393D3A]/60 ${
          error ? "border-rose-500 focus:ring-rose-500/10" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      {helperText && !error && <p className="text-xs text-[#393D3A]">{helperText}</p>}
    </div>
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, children, className = "", id, ...props }: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-xs font-bold uppercase tracking-wider text-[#0B162C]">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3.5 py-2.5 text-sm bg-[#EEECF2]/60 focus:bg-white text-[#000000] border-1.5 border-[var(--color-border)] rounded-xl transition-all duration-200 outline-none focus:border-[#291527] focus:ring-4 focus:ring-[#291527]/10 cursor-pointer ${
          error ? "border-rose-500 focus:ring-rose-500/10" : ""
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = "", id, ...props }: TextareaProps) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={textareaId} className="text-xs font-bold uppercase tracking-wider text-[#0B162C]">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full px-3.5 py-2.5 text-sm bg-[#EEECF2]/60 focus:bg-white text-[#000000] border-1.5 border-[var(--color-border)] rounded-xl transition-all duration-200 outline-none focus:border-[#291527] focus:ring-4 focus:ring-[#291527]/10 placeholder:text-[#393D3A]/60 ${
          error ? "border-rose-500 focus:ring-rose-500/10" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

/* ==========================================
   3. CARD & CONTAINER PRIMITIVES
   ========================================== */
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300 p-6 ${className}`}>
      {children}
    </div>
  );
}

/* ==========================================
   4. BADGE PRIMITIVE
   ========================================== */
export interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "info" | "danger" | "neutral";
  className?: string;
}

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  const variants = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    info: "bg-sky-50 text-sky-700 border-sky-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    neutral: "bg-[#EEECF2] text-[#0B162C] border-[var(--color-border)]",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ==========================================
   5. PAGE HEADER PRIMITIVE
   ========================================== */
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actionSlot?: React.ReactNode;
}

export function PageHeader({ title, subtitle, badge, actionSlot }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        {badge && <div className="section-badge mb-2">{badge}</div>}
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B162C] tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-[#393D3A] mt-1">{subtitle}</p>}
      </div>
      {actionSlot && <div className="shrink-0">{actionSlot}</div>}
    </div>
  );
}

/* ==========================================
   6. CLEAN SVG ICONS (Replaces Raw Emojis)
   ========================================== */
export function IconAdd({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
    </svg>
  );
}

export function IconEdit({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

export function IconDelete({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

export function IconCheck({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function IconClose({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
