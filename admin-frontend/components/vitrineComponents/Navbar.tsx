"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`vitrine-container ${styles.navContainer}`}>
        <Link href="/" className={styles.logoLink}>
          <div className={styles.logoBadge}>F</div>
          <span className={styles.logoText}>
            FreeForU<span className={styles.logoAccent}>.</span>
          </span>
        </Link>

        <nav className={styles.navLinks}>
          <Link href="#about" className={styles.navLink}>
            À propos
          </Link>
          <Link href="#services" className={styles.navLink}>
            Services
          </Link>
          <Link href="#professionals" className={styles.navLink}>
            Nos professionnels
          </Link>
          <Link href="#contact" className={styles.navLink}>
            Contact
          </Link>
        </nav>

        <div className={styles.actions}>
          <Link href="/login" className={styles.loginBtn}>
            Connexion
          </Link>
          <Link href="/signup" className={styles.ctaBtn}>
            Espace Client <span>→</span>
          </Link>
          <button
            className={styles.mobileMenuToggle}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className={styles.mobileNav}>
          <Link
            href="#about"
            className={styles.navLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            À propos
          </Link>
          <Link
            href="#services"
            className={styles.navLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Services
          </Link>
          <Link
            href="#professionals"
            className={styles.navLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Nos professionnels
          </Link>
          <Link
            href="#contact"
            className={styles.navLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact
          </Link>
          <div className={styles.mobileActions}>
            <Link
              href="/login"
              className={styles.loginBtn}
              onClick={() => setMobileMenuOpen(false)}
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className={styles.ctaBtn}
              onClick={() => setMobileMenuOpen(false)}
            >
              Créer un compte
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}