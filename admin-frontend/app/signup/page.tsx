"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "@/lib/api/signup";

import styles from "./signup.module.css";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    ville: "",
    phone: "",
    role: "CLIENT" as "CLIENT" | "AGENT",
    category: "",
  });

  const [error, setError] = useState("");
  const router = useRouter();

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await signup(form);
      router.push("/login");
    } catch (err: any) {
      console.log("❌ Erreur signup :", err);
      setError(err.response?.data?.message || "Une erreur est survenue");
    }
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.card}>
        <h1 className={styles.title}>Créer un compte</h1>

        {error && <p className={styles.error}>{error}</p>}

        <label className={styles.label}>Je suis...</label>
        <select
          value={form.role}
          onChange={(e) => updateField("role", e.target.value)}
          className={styles.select}
        >
          <option value="CLIENT">Client</option>
          <option value="AGENT">Agent (artisan)</option>
        </select>

        <label className={styles.label}>Nom complet</label>
        <input
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          className={styles.input}
          required
        />

        <label className={styles.label}>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          className={styles.input}
          required
        />

        <label className={styles.label}>Mot de passe</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          className={styles.input}
          required
        />

        <label className={styles.label}>Téléphone</label>
        <input
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          className={styles.input}
          required
        />

        <label className={styles.label}>Ville</label>
        <input
          value={form.ville}
          onChange={(e) => updateField("ville", e.target.value)}
          className={styles.input}
          required
        />

        {form.role === "AGENT" && (
          <div className={styles.categoryField}>
            <label className={styles.label}>Catégorie de métier</label>
            <input
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              placeholder="ex: plombier, électricien..."
              className={styles.input}
              required
            />
          </div>
        )}

        <button type="submit" className={styles.submitButton}>
          Créer mon compte
        </button>
      </form>
    </div>
  );
}