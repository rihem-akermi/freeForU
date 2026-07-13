"use client";
import { useScrollReveal } from "$/hooks/useScrollReveal";
import styles from "./Contact.module.css";

export default function Contact() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      id = "contact"
      ref={ref}
      className={`${styles.contact} ${isVisible ? styles.visible : ""}`}
    >
      <h2>Contactez-nous</h2>
      <p>Une question ? Écrivez-nous, on vous répond rapidement 📩</p>

      <form className={styles.form}>
        <input type="text" placeholder="Votre nom" required />
        <input type="email" placeholder="Votre email" required />
        <textarea placeholder="Votre message" rows={4} required />
        <button type="submit">Envoyer</button>
      </form>
    </section>
  );
}