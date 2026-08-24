"use client";

import Link from "next/link";
import { useScrollReveal } from "$/hooks/useScrollReveal";
import styles from "./Professionals.module.css";

export interface Professional {
  id: string | number;
  name: string;
  profession: string;
  location: string;
  rating: number;
  description: string;
  photoUrl: string;
  imagePosition?: string;
}

const defaultDemoProfessionals: Professional[] = [
  {
    id: "demo-1",
    name: "Amine Ben Salem",
    profession: "Plombier & Sanitaire",
    location: "Sousse",
    rating: 4.8,
    description:
      "Spécialiste en installation sanitaire, détection de fuites complexes et dépannage rapide d'urgence.",
    photoUrl:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
    imagePosition: "center 25%",
  },
  {
    id: "demo-2",
    name: "Lina Trabelsi",
    profession: "Coiffeuse & Styliste",
    location: "Tunis",
    rating: 4.9,
    description:
      "Coiffure événementielle, colorations végétales et soins capillaires personnalisés à domicile ou au cabinet.",
    photoUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    imagePosition: "top center",
  },
  {
    id: "demo-3",
    name: "Yassine Gharbi",
    profession: "Électricien Qualifié",
    location: "Sfax",
    rating: 4.7,
    description:
      "Mise aux normes électriques, tableaux généraux, domotique et installations solaires pour particuliers.",
    photoUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
    imagePosition: "top center",
  },
  {
    id: "demo-4",
    name: "Mariem Jaziri",
    profession: "Décoratrice d'Intérieur",
    location: "Bizerte",
    rating: 5.0,
    description:
      "Design d'espace, optimisation d'agencement, conseil en mobilier et modélisation 3D sur-mesure.",
    photoUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    imagePosition: "top center",
  },
];

interface ProfessionalsProps {
  professionals?: Professional[];
}

export default function Professionals({
  professionals = defaultDemoProfessionals,
}: ProfessionalsProps) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      id="professionals"
      ref={ref}
      className={`${styles.section} ${isVisible ? styles.visible : ""}`}
    >
      <div className="vitrine-container">
        <div className={styles.headerText}>
          <div className="section-badge">PROFESSIONNELS EN VEDETTE</div>
          <h2 className={styles.heading}>Découvrez nos professionnels</h2>
          <p className={styles.subtitle}>
            Des experts vérifiés et passionnés, prêts à intervenir selon vos disponibilités et exigences.
          </p>
        </div>

        <div className={styles.grid}>
          {professionals.map((pro) => (
            <ProfessionalCard key={pro.id} professional={pro} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProfessionalCard({
  professional,
}: {
  professional: Professional;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={professional.photoUrl}
          alt={professional.name}
          className={styles.image}
          style={{ objectPosition: professional.imagePosition || "center 20%" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";
          }}
        />
        <div className={styles.ratingBadge}>
          <span className={styles.star}>★</span>
          <span>{professional.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.name}>{professional.name}</h3>

        <div className={styles.metaRow}>
          <span className={styles.profession}>{professional.profession}</span>
          <span className={styles.location}>📍 {professional.location}</span>
        </div>

        <p className={styles.description}>{professional.description}</p>

        <div className={styles.cardFooter}>
          <Link href="/login" className={styles.ctaBtn}>
            Voir le profil <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
