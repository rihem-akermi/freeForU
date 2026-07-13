// components/landing/Services.tsx
"use client";
import { useScrollReveal } from "$/hooks/useScrollReveal";
import styles from "./Services.module.css";

const categories = [
  {
    icon: "⚖️",
    title: "Avocats & Juristes",
    desc: "Conseils juridiques, contrats, litiges",
  },
  {
    icon: "🩺",
    title: "Professionnels de santé",
    desc: "Consultations, soins à domicile",
  },
  {
    icon: "🔧",
    title: "Artisans & Techniciens",
    desc: "Réparation, installation, dépannage",
  },
  {
    icon: "💼",
    title: "Consultants",
    desc: "Stratégie, comptabilité, coaching",
  },
];

export default function Services() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      id="services"
      ref={ref}
      className={`${styles.services} ${isVisible ? styles.visible : ""}`}
    >
      <h2>Nos catégories de services</h2>
      <p className={styles.subtitle}>
        Des professionnels vérifiés, classés par domaine, prêts à répondre à
        vos besoins.
      </p>

      <div className={styles.grid}>
        {categories.map((cat) => (
          <div key={cat.title} className={styles.card}>
            <span className={styles.icon}>{cat.icon}</span>
            <h3>{cat.title}</h3>
            <p>{cat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}