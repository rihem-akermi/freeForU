// components/landing/Navbar.tsx
"use client";
import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <h1 className={styles.logo}>FreeForU 🏃‍♀️</h1>

      <div className={styles.links}>
        <Link href="#about">À propos</Link>
        <Link href="#services">Services</Link>
        <Link href="#contact">Contact</Link>
        <Link href="/login" className={styles.ctaLink}>
          Connexion
        </Link>
        <Link href="/signup">Inscription</Link>
      </div>
    </nav>
  );
}