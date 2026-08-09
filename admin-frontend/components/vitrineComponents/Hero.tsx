"use client";

import Link from "next/link";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.heroSection}>
      <div className={`vitrine-container ${styles.heroGrid}`}>
        <div className={styles.textContent}>
          <div className="section-badge">
            ✨ La référence des professionnels libéraux
          </div>

          <h1 className={styles.heading}>
            Trouvez le bon professionnel,{" "}
            <span className={styles.headingHighlight}>où que vous soyez</span> 🤝
          </h1>

          <p className={styles.paragraph}>
            FreeForU connecte les professions libérales — avocats, artisans,
            consultants, professionnels de santé — avec des clients exigeants.
            Intervention à votre domicile, rendez-vous en cabinet, ou à distance :
            la flexibilité totale est entre vos mains.
          </p>

          <div className={styles.ctaGroup}>
            <a href="#services" className={styles.primaryBtn}>
              Découvrir les services <span>↓</span>
            </a>
            <Link href="/signup" className={styles.secondaryBtn}>
              Rejoindre la plateforme
            </Link>
          </div>

          <div className={styles.trustMetricsRow}>
            <div className={styles.metricItem}>
              <span className={styles.metricValue}>500+</span>
              <span className={styles.metricLabel}>Artisans & Experts</span>
            </div>
            <div className={styles.metricItem}>
              <span className={styles.metricValue}>4.9/5</span>
              <span className={styles.metricLabel}>Avis clients réels</span>
            </div>
            <div className={styles.metricItem}>
              <span className={styles.metricValue}>24/7</span>
              <span className={styles.metricLabel}>Réservation directe</span>
            </div>
          </div>
        </div>

        <div className={styles.visualComposition}>
          <div className={styles.floatingBadge1}>
            <div className={styles.badgeIcon}>⚖️</div>
            <div>
              <p className={styles.badgeTitle}>Me. Claire Moreau</p>
              <p className={styles.badgeSubtitle}>Avocate • Disponible aujourd'hui</p>
            </div>
          </div>

          <div className={styles.mainImageWrapper}>
            <img
              src="/images/image3.jpg"
              alt="Professionnel libéral au travail"
              className={styles.heroImage}
              onError={(e) => {
                // Fallback image if local file isn't present
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80";
              }}
            />
          </div>

          <div className={styles.floatingBadge2}>
            <div className={styles.badgeIcon}>⭐</div>
            <div>
              <p className={styles.badgeTitle}>Avis vérifié 100%</p>
              <p className={styles.badgeSubtitle}>"Intervention rapide et soignée"</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}