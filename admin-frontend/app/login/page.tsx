"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const { user, accessToken, refreshToken } = await login(email, password);

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      console.log("👤 Connecté en tant que :", user.role);

      if (user.role === "ADMIN") {
        router.push("/admin");
      } 
      else if (user.role === "AGENT") {
        router.push("/agent");
      } 
      else {
        router.push("/client");
      }
    } catch (err) {
      console.log("❌ Erreur de login :", err);
      setError("Email ou mot de passe incorrect");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cyan-50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-xl font-medium text-stone-900">Connexion</h1>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <label className="mb-1 block text-sm text-stone-600">Email</label>
        <input
          type="email"
          placeholder="example@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded border border-stone-300 px-3 py-2"
          required
        />

        <label className="mb-1 block text-sm text-stone-600">Mot de passe</label>
        <input
          type="password"
          placeholder="**********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded border border-stone-300 px-3 py-2"
          required
        />

        <button type="submit" className="w-full rounded bg-stone-900 py-2 text-white hover:bg-stone-700">
          Se connecter
        </button>
      </form>
    </div>
  );
}