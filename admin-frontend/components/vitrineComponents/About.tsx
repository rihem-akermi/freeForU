// components/landing/About.tsx
"use client";
import { useScrollReveal } from "$/hooks/useScrollReveal";
import styles from "./About.module.css";

export default function About() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      id="about"
      ref={ref}
      className={`${styles.about} ${isVisible ? styles.visible : ""}`}
    >
    <img src="/images/plombier.jpg" 
           alt="Agent au travail" 
           className={styles.aboutImage} />
      
    <div className={styles.textContent}>
        <h2>Pourquoi FreeForU ?</h2>
        <p>
          Trouver un professionnel libéral fiable prend souvent du temps :
          recommandations au hasard, avis introuvables, disponibilités floues.
          FreeForU résout ce problème en centralisant des profils vérifiés,
          des disponibilités claires, et un système de réservation simple.
        </p>
        <ul className={styles.pointsList}>
          <li>✅ Profils vérifiés et avis clients réels</li>
          <li>✅ Réservation flexible : chez vous, chez l'agent, ou les deux</li>
          <li>✅ Communication directe et sécurisée sur la plateforme</li>
        </ul>
      </div>
    </section>
  );
}