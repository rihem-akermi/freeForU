"use client";

import React, {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

/* ==========================================
   1. BUTTON PRIMITIVE
   ========================================== */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "neutral"
    | "danger"
    | "outline";
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
    "inline-flex min-h-10 items-center justify-center rounded-xl font-semibold transition-all duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  const variants = {
    primary:
      "bg-primary text-primary-foreground shadow-sm hover:bg-primary-secondary hover:-translate-y-0.5 hover:shadow-md",
    secondary:
      "bg-primary-secondary text-primary-foreground shadow-sm hover:bg-accent-dark hover:-translate-y-0.5",
    accent:
      "bg-accent text-accent-foreground shadow-sm hover:bg-accent-dark hover:-translate-y-0.5",
    neutral: "bg-secondary text-secondary-foreground hover:bg-accent/20",
    danger:
      "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:-translate-y-0.5",
    outline:
      "border border-border-strong bg-card text-foreground hover:border-border-hover hover:bg-muted",
  };

  const sizes = {
    sm: "gap-1.5 px-3 py-2 text-xs",
    md: "gap-2 px-4 py-3 text-sm",
    lg: "gap-2.5 px-6 py-3.5 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
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

export function Input({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId =
    id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-bold uppercase tracking-[0.08em] text-foreground"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-xl border border-input bg-muted/60 px-4 py-3 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-accent-dark focus:bg-card focus:ring-4 focus:ring-accent/15 ${
          error ? "border-danger focus:ring-danger/15" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs font-medium text-[var(--color-danger)]">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({
  label,
  error,
  children,
  className = "",
  id,
  ...props
}: SelectProps) {
  const selectId =
    id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-bold uppercase tracking-[0.08em] text-foreground"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full cursor-pointer rounded-xl border border-input bg-muted/60 px-4 py-3 text-sm text-foreground outline-none transition-all duration-200 focus:border-accent-dark focus:bg-card focus:ring-4 focus:ring-accent/15 ${
          error ? "border-danger focus:ring-danger/15" : ""
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-xs font-medium text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const textareaId =
    id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-bold uppercase tracking-[0.08em] text-foreground"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full rounded-xl border border-input bg-muted/60 px-4 py-3 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-accent-dark focus:bg-card focus:ring-4 focus:ring-accent/15 ${
          error ? "border-danger focus:ring-danger/15" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs font-medium text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}

/* ==========================================
   3. CARD & CONTAINER PRIMITIVES
   ========================================== */
export function Card({
  children,
  className = "",
  style,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      style={style}
      onClick={onClick}
      className={`rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow duration-200 hover:shadow-md ${className}`}
    >
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

export function Badge({
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) {
  const variants = {
    success:
      "border-[var(--color-success)]/20 bg-[var(--color-success-soft)] text-[var(--color-success)]",
    warning:
      "border-[var(--color-warning)]/20 bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
    info: "border-[var(--color-info)]/20 bg-[var(--color-info-soft)] text-[var(--color-info)]",
    danger:
      "border-[var(--color-danger)]/20 bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
    neutral: "border-border bg-muted text-foreground",
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

export function PageHeader({
  title,
  subtitle,
  badge,
  actionSlot,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        {badge && <div className="section-badge mb-2">{badge}</div>}
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
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
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}

export function IconEdit({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  );
}

export function IconDelete({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

export function IconCheck({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

export function IconClose({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
