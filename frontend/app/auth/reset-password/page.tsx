"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword, resendOtp } from "@/lib/api/auth";
import { Button, Input } from "@/components/ui/UIComponents";
import { Suspense } from "react";

const OTP_DURATION = 120;
const OTP_LENGTH = 6;

function ResetPasswordComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(OTP_DURATION);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(
      () => setSecondsLeft((prev) => prev - 1),
      1000,
    );
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isExpired = secondsLeft <= 0;
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => code[i] || "");

  function updateDigit(index: number, value: string) {
    const char = value.replace(/[^0-9]/g, "").slice(-1);
    const next = digits.slice();
    next[index] = char;
    const joined = next.join("").slice(0, OTP_LENGTH);
    setCode(joined);
    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    setCode(pasted);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(email, code, newPassword);
      router.push("/auth/login");
    } catch (err: any) {
      console.error("Erreur reset-password :", err);
      setError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError("");
    setResending(true);
    try {
      await resendOtp(email, "PASSWORD_RESET");
      setCode("");
      setSecondsLeft(OTP_DURATION);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-background px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-primary p-8 shadow-2xl sm:p-10"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)",
            backgroundSize: "36px 36px",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(circle, var(--color-accent), transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent ring-1 ring-primary-foreground/10">
            Sécurité du compte
          </div>
          <h1 className="mb-1 font-serif text-2xl font-bold text-primary-foreground">
            Réinitialiser le mot de passe
          </h1>
          <p className="mb-7 text-sm text-primary-foreground/60">
            Entrez le code envoyé à{" "}
            <strong className="text-primary-foreground/85">{email}</strong> et
            votre nouveau mot de passe.
          </p>

          {error && (
            <p className="mb-5 rounded-lg border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/15 px-4 py-2.5 text-sm font-medium text-rose-200">
              {error}
            </p>
          )}

          <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-primary-foreground/70">
            Code de vérification
          </label>
          <div className="mb-6 flex justify-between gap-2 sm:gap-3">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => updateDigit(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                disabled={isExpired}
                className="h-14 w-full max-w-14 rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 text-center font-serif text-2xl font-bold text-primary-foreground outline-none transition focus:border-accent focus:bg-primary-foreground/15 focus:ring-4 focus:ring-accent/25 disabled:opacity-40"
              />
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-primary-foreground/70">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-3 text-sm text-primary-foreground outline-none transition placeholder:text-primary-foreground/40 focus:border-accent focus:bg-primary-foreground/15 focus:ring-4 focus:ring-accent/25"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-primary-foreground/70">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-3 text-sm text-primary-foreground outline-none transition placeholder:text-primary-foreground/40 focus:border-accent focus:bg-primary-foreground/15 focus:ring-4 focus:ring-accent/25"
              />
            </div>
          </div>

          <p className="mt-4 text-sm text-primary-foreground/60">
            {isExpired ? (
              <span className="font-medium text-rose-300">
                Code expiré, veuillez en redemander un.
              </span>
            ) : (
              <>
                Ce code expire dans {minutes}:
                {seconds.toString().padStart(2, "0")}
              </>
            )}
          </p>

          <Button
            type="submit"
            variant="accent"
            size="lg"
            isLoading={submitting}
            disabled={isExpired || code.length < OTP_LENGTH}
            className="mt-6 w-full"
          >
            Réinitialiser
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            isLoading={resending}
            disabled={!isExpired}
            onClick={handleResend}
            className="!mt-3 w-full !border-primary-foreground/25 !bg-primary-foreground/5 !text-primary-foreground hover:!bg-primary-foreground/15"
          >
            Renvoyer le code
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordComponent />
    </Suspense>
  );
}
