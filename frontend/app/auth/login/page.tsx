"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/api/auth";
import { Button, Input } from "@/components/ui/UIComponents";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { user } = await login(email, password);


      if (user.role === "ADMIN") {
        router.push("/admin");
      } else if (user.role === "AGENT") {
        router.push("/agent");
      } else {
        router.push("/client");
      }
    } catch (err) {
      console.error("Erreur de login :", err);
      setError("Email ou mot de passe incorrect");
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
        <div className="section-badge">Bon retour</div>
        <h1 className="mb-1 font-serif text-2xl font-bold text-foreground">
          Connexion
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Accédez à votre espace FreeForU.
        </p>

        {error && (
          <p className="mb-5 rounded-lg border border-[var(--color-danger)]/25 bg-[var(--color-danger-soft)] px-4 py-2.5 text-sm font-medium text-[var(--color-danger)]">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Mot de passe"
            type="password"
            placeholder="***********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="text-right">
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-accent-dark hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={submitting}
          className="mt-6 w-full"
        >
          Se connecter
        </Button>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link
            href="/auth/signup"
            className="font-semibold text-accent-dark hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      </form>
    </div>
  );
}
