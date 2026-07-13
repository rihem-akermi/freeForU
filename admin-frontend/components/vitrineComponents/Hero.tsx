// components/landing/Hero.tsx
"use client";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <div className={styles.hero}>
      <div className={styles.textContent}>
        <h1>
          Trouvez le bon professionnel, <span>où que vous soyez</span> 🤝
        </h1>
        <p>
          FreeForU connecte les professions libérales — avocats, artisans,
          consultants, professionnels de santé — avec des clients sérieux.
          Que l'agent se déplace chez vous, que vous alliez à son cabinet, ou
          les deux : la flexibilité est entre vos mains.
        </p>
        <div className={styles.ctaButtons}>
          <a href="/#services" className={styles.primaryBtn}>Découvrir les services</a>
          <button className={styles.secondaryBtn}>Rejoindre la plateforme</button>
        </div>
      </div>

      <img src="/images/image3.jpg" 
           alt="Agent au travail" 
           className={styles.heroImage} />

    </div>
  );
}