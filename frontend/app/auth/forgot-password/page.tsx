"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/lib/api/auth";
import { Button, Input } from "@/components/ui/UIComponents";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await forgotPassword(email);
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      console.error("Erreur forgot-password :", err);
      setError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-background px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg sm:p-10"
      >
        <h1 className="mb-1 font-serif text-2xl font-bold text-foreground">
          Mot de passe oublié
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Entrez votre email, nous vous enverrons un code de réinitialisation.
        </p>

        {error && (
          <p className="mb-5 rounded-lg border border-[var(--color-danger)]/25 bg-[var(--color-danger-soft)] px-4 py-2.5 text-sm font-medium text-[var(--color-danger)]">
            {error}
          </p>
        )}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" variant="primary" size="lg" isLoading={submitting} className="mt-6 w-full">
          Envoyer le code
        </Button>
      </form>
    </div>
  );
}