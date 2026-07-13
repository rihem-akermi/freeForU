"use client";
import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>© 2026 FreeForU — Tous droits réservés</p>
      <div className={styles.links}>
        <Link href="/login">Connexion</Link>
        <Link href="/signup">Inscription</Link>
      </div>
    </footer>
  );
}