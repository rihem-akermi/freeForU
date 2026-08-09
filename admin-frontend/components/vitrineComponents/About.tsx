"use client";

import { useScrollReveal } from "$/hooks/useScrollReveal";
import styles from "./About.module.css";

export default function About() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      id="about"
      ref={ref}
      className={`${styles.aboutSection} ${isVisible ? styles.visible : ""}`}
    >
      <div className={`vitrine-container ${styles.aboutGrid}`}>
        <div className={styles.imageWrapper}>
          <img
            src="/images/plombier.jpg"
            alt="Professionnel en intervention"
            className={styles.aboutImage}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1000&q=80";
            }}
          />
          <div className={styles.imageBadge}>
            <p className={styles.imageBadgeTitle}>Transparence & Qualité</p>
            <p className={styles.imageBadgeDesc}>
              Intervention à domicile, au cabinet ou à distance selon vos besoins.
            </p>
          </div>
        </div>

        <div className={styles.textContent}>
          <div className="section-badge">Pourquoi FreeForU ?</div>

          <h2 className={styles.heading}>
            La simplicité de réservation, la garantie du professionnalisme.
          </h2>

          <p className={styles.description}>
            Trouver un professionnel libéral fiable prend souvent du temps :
            recommandations au hasard, avis introuvables, disponibilités floues.
            FreeForU résout ce problème en centralisant des profils vérifiés,
            des disponibilités claires, et un système de réservation simple.
          </p>

          <div className={styles.featureList}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🛡️</div>
              <div>
                <h3 className={styles.featureTitle}>Profils vérifiés et avis réels</h3>
                <p className={styles.featureText}>
                  Chaque agent est identifié et évalué de façon transparente par ses clients.
                </p>
              </div>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📅</div>
              <div>
                <h3 className={styles.featureTitle}>Réservation sur-mesure</h3>
                <p className={styles.featureText}>
                  Choisissez où se déroule votre rendez-vous : chez vous, au cabinet ou les deux.
                </p>
              </div>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>💬</div>
              <div>
                <h3 className={styles.featureTitle}>Communication direct & sécurisée</h3>
                <p className={styles.featureText}>
                  Échangez vos informations et suivez vos demandes directement en ligne.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}