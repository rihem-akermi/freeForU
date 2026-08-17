"use client";
import { getMyPendingPublications } from "@/lib/api/publications";
import { getMyPendingReservations } from "@/lib/api/reservations";
import { useEffect, useState } from "react";

const stats = {
  noteMoyenne: 4.5,
  avisCount: 12,
};

export default function AgentDashboard() {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<{ index : number ,label: string; value: number }[]>([]);

  useEffect(() => {
    async function loadStats() {
      try {
        const reservationsEnAttente = await getMyPendingReservations();
        const publicationsEnAttente = await getMyPendingPublications();
        setCards([
          { index: 0, 
            label: "Mes Reservations En Attente",
            value: reservationsEnAttente.length,
          },
          { index: 1,
            label: "Mes publications En Attente",
            value: publicationsEnAttente.length,
          },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <p className="text-sm text-stone-500">Chargement...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--color-text-dark)] mb-6">
        DashBoard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => {
          return (
            <div
              key={card.index}
              className="rounded-lg bg-[var(--color-card)] p-5"
            >
              <p className="text-sm text-[var(--color-text-body)]">
                {card.label}
              </p>
              <p className="text-3xl font-bold text-[var(--color-text-dark)]">
                {card.value}
              </p>
            </div>
          );
        })}

        <div className="rounded-lg bg-[var(--color-card)] p-5">
          <p className="text-sm text-[var(--color-text-body)]">Note moyenne</p>
          <p className="text-3xl font-bold text-[var(--color-text-dark)]">
            {stats.noteMoyenne} ⭐{" "}
            <span className="text-sm font-normal">
              ({stats.avisCount} avis)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
