"use client";

import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="vitrine-container">
        <div className={styles.footerGrid}>
          <div className={styles.brandCol}>
            <Link href="/" className={styles.brandLogo}>
              <div className={styles.logoBadge}>F</div>
              <span className={styles.logoText}>
                FreeForU<span className={styles.logoAccent}>.</span>
              </span>
            </Link>
            <p className={styles.brandTagline}>
              La plateforme de référence pour réserver des professionnels libéraux qualifiés et vérifiés.
            </p>
          </div>

          <div>
            <h4 className={styles.colHeading}>Navigation</h4>
            <ul className={styles.linksList}>
              <li>
                <Link href="#about" className={styles.linkItem}>
                  À propos
                </Link>
              </li>
              <li>
                <Link href="#services" className={styles.linkItem}>
                  Nos Services
                </Link>
              </li>
              <li>
                <Link href="#contact" className={styles.linkItem}>
                  Nous contacter
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={styles.colHeading}>Espaces Utilisateurs</h4>
            <ul className={styles.linksList}>
              <li>
                <Link href="/login" className={styles.linkItem}>
                  Se connecter
                </Link>
              </li>
              <li>
                <Link href="/signup" className={styles.linkItem}>
                  Espace Client
                </Link>
              </li>
              <li>
                <Link href="/signup" className={styles.linkItem}>
                  Devenir un Agent
                </Link>
              </li>
              <li>
                <Link href="/login" className={styles.linkItem}>
                  Administration
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={styles.colHeading}>Contact</h4>
            <p className={styles.contactText}>
              📍 Tunis, Tunisie<br />
              ✉️ contact@freeforu.tn<br />
              📞 +216 71 000 000
            </p>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © 2026 FreeForU — Tous droits réservés.
          </p>
          <div className={styles.bottomLinks}>
            <Link href="#" className={styles.bottomLink}>
              Mentions Légales
            </Link>
            <Link href="#" className={styles.bottomLink}>
              Politique de Confidentialité
            </Link>
            <Link href="#" className={styles.bottomLink}>
              CGU
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}