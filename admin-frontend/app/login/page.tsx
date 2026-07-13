"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/auth";
import styles from "./login.module.css";

import Cookies from "js-cookie";


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

      Cookies.set("accessToken", accessToken, { expires: 1/96 }); // 👈 1/96 jour ≈ 15 min
      Cookies.set("refreshToken", refreshToken, { expires: 7 }); // 👈 7 jours

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
  <div className={styles.container}>
    <form onSubmit={handleSubmit} className={styles.form}>
      <h1 className={styles.title}>Connexion</h1>

      {error && <p className={styles.error}>{error}</p>}

      <label className={styles.label}>Email</label>
      <input
        type="email"
        placeholder="example@gmail.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.input}
        required
      />

      <label className={styles.label}>Mot de passe</label>
      <input
        type="password"
        placeholder="********"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.input}
        required
      />

      <button type="submit" className={styles.button}>
        Se connecter
      </button>
    </form>
  </div>
);
}