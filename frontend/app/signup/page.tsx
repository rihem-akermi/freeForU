"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { signup } from "@/lib/api/signup";
import { getCategories } from "@/lib/api/categories";
import { Category } from "@/lib/data";
import { Button, Input, Select } from "@/components/ui/UIComponents";

export default function SignupPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    ville: "",
    phone: "",
    role: "CLIENT" as "CLIENT" | "AGENT",
    category_id: 0,
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      const data = await getCategories();
      setCategories(data);
    }
    loadCategories();
  }, []);

  function updateField(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.role === "AGENT" && form.category_id === 0) {
      setError("Veuillez choisir une catégorie pour un agent");
      return;
    }

    setSubmitting(true);
    try {
      await signup(form);
      router.push("/login");
    } catch (err: any) {
      console.error("Erreur signup :", err);
      setError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-lg sm:p-10"
      >
        <div className="section-badge">Rejoindre FreeForU</div>
        <h1 className="mb-1 font-serif text-2xl font-bold text-foreground">
          Créer un compte
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Quelques informations pour démarrer.
        </p>

        {error && (
          <p className="mb-5 rounded-lg border border-[var(--color-danger)]/25 bg-[var(--color-danger-soft)] px-4 py-2.5 text-sm font-medium text-[var(--color-danger)]">
            {error}
          </p>
        )}

        <div className="mb-5 flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground">
            Je suis...
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={form.role === "CLIENT" ? "primary" : "outline"}
              onClick={() => updateField("role", "CLIENT")}
            >
              Client
            </Button>
            <Button
              type="button"
              variant={form.role === "AGENT" ? "primary" : "outline"}
              onClick={() => updateField("role", "AGENT")}
            >
              Agent (artisan)
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Nom complet"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            required
          />
          <Input
            label="Mot de passe"
            type="password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            required
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Téléphone"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              required
            />
            <Input
              label="Ville"
              value={form.ville}
              onChange={(e) => updateField("ville", e.target.value)}
              required
            />
          </div>

          {form.role === "AGENT" && (
            <div className="rounded-xl border border-accent/25 bg-accent/5 p-4">
              <Select
                label="Catégorie de métier"
                value={form.category_id}
                onChange={(e) =>
                  updateField("category_id", Number(e.target.value))
                }
                required
              >
                <option value={0}>Autre</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={submitting}
          className="mt-6 w-full"
        >
          Créer mon compte
        </Button>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-semibold text-accent-dark hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}
