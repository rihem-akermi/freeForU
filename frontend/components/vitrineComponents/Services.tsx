"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScrollReveal } from "$/hooks/useScrollReveal";
import styles from "./Services.module.css";

const categories = [
  {
    icon: "⚖️",
    tag: "Droit & Justice",
    title: "Avocats & Juristes",
    desc: "Conseils juridiques personnalisés, rédaction de contrats, gestion de litiges et affaires familiales.",
    hint: "Cabinet & Visio",
  },
  {
    icon: "🩺",
    tag: "Santé & Bien-être",
    title: "Professionnels de Santé",
    desc: "Consultations médicales, soins infirmiers à domicile, kinésithérapie et suivi personnalisé.",
    hint: "Domicile & Cabinet",
  },
  {
    icon: "🔧",
    tag: "Artisanat & Technique",
    title: "Artisans & Techniciens",
    desc: "Plomberie, électricité, dépannage d'urgence, rénovation intérieure et entretien spécialisé.",
    hint: "Intervention Rapide",
  },
  {
    icon: "💼",
    tag: "Conseil & Stratégie",
    title: "Consultants & Experts",
    desc: "Stratégie d'entreprise, comptabilité, coaching exécutif et optimisation fiscale.",
    hint: "Sur Rendez-vous",
  },
  {
    icon: "🎨",
    tag: "Design & Media",
    title: "Créatifs & Freelances",
    desc: "Design graphique, développement web, photographie professionnelle et création de marque.",
    hint: "Projets & Mission",
  },
  {
    icon: "🎓",
    tag: "Éducation & Formation",
    title: "Formateurs & Tuteurs",
    desc: "Cours particuliers, soutien scolaire, apprentissage des langues et coaching professionnel.",
    hint: "En ligne & Présentiel",
  },
];

export default function Services() {
  const { ref, isVisible } = useScrollReveal();
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -360, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 360, behavior: "smooth" });
    }
  };

  return (
    <section
      id="services"
      ref={ref}
      className={`${styles.servicesSection} ${isVisible ? styles.visible : ""}`}
    >
      <div className="vitrine-container">
        <div className={styles.headerRow}>
          <div className={styles.headerText}>
            <div className="section-badge">NOS DOMAINES D'EXPERTISE</div>
            <h2 className={styles.heading}>
              Des catégories pensées pour tous vos besoins.
            </h2>
            <p className={styles.subtitle}>
              Parcourez les professionnels qualifiés et vérifiés disponibles sur notre plateforme.
            </p>
          </div>

          <div className={styles.carouselControls}>
            <button
              onClick={scrollLeft}
              className={styles.scrollBtn}
              aria-label="Scroll left"
            >
              ←
            </button>
            <button
              onClick={scrollRight}
              className={styles.scrollBtn}
              aria-label="Scroll right"
            >
              →
            </button>
          </div>
        </div>

        <div className={styles.carouselTrack} ref={carouselRef}>
          {categories.map((cat) => (
            <div key={cat.title} className={styles.serviceCard}>
              <div>
                <div className={styles.cardHeader}>
                  <div className={styles.iconCircle}>{cat.icon}</div>
                  <span className={styles.categoryTag}>{cat.tag}</span>
                </div>
                <h3 className={styles.cardTitle}>{cat.title}</h3>
                <p className={styles.cardDescription}>{cat.desc}</p>
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.detailHint}>📍 {cat.hint}</span>
                <Link href="/login" className={styles.cardActionLink}>
                  Explorer <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}