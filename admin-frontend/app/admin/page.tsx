"use client";

import { useEffect, useState } from "react";
import { getAgents } from "@/lib/api/agents";
import { getCategories } from "@/lib/api/categories";
import { getContacts } from "@/lib/api/contacts";
import { getPendingPublications } from "@/lib/api/publications";
import { getReservations } from "@/lib/api/reservations";
import { getUsers } from "@/lib/api/users";

export default function PageAdmin() {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    async function loadAll() {
      try {
        const [users, agents, reservations, contacts, categories, pendingPublications] =
          await Promise.all([
            getUsers(),
            getAgents(),
            getReservations(),
            getContacts(),
            getCategories(),
            getPendingPublications(),
          ]);

        setCards([
          { label: "Clients", value: users.length },
          { label: "Agents", value: agents.length },
          { label: "Réservations", value: reservations.length },
          { label: "Contacts", value: contacts.length },
          { label: "Categories", value: categories.length },
          { label: "Publications En Attentes ", value: pendingPublications.length },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  if (loading) {
    return <p className="text-sm text-stone-500">Chargement...</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-medium text-stone-900">
        Vue d'ensemble
      </h1>
      <div className="grid grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-stone-200 bg-white p-6"
          >
            <p className="text-sm text-stone-500">{card.label}</p>
            <p className="mt-2 text-3xl font-medium text-stone-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}