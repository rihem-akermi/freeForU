'use client'
import { useEffect, useState } from "react";
import { getMyReservations } from "@/lib/api/reservations";
import type { Reservation } from "@/lib/data";
import { formatDate } from "@/lib/utils/formatDate";

export default function MesReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyReservations()
      .then(setReservations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-[var(--color-text-dark)] mb-1">Mes réservations</h1>
      <p className="text-sm text-[var(--color-text-body)] mb-6">Suivez l'état de vos demandes.</p>

      {loading ? (
        <p className="text-sm text-[var(--color-text-body)]">Chargement...</p>
      ) : reservations.length === 0 ? (
        <p className="text-sm text-[var(--color-text-body)]">
          Vous n'avez pas encore de réservation. Parcourez les offres depuis l'accueil pour en faire une.
        </p>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => (
            <ReservationCard key={r.id} reservation={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReservationCard({ reservation }: { reservation: Reservation }) {
  const serviceLabel = reservation.offers?.title ?? reservation.custom_request ?? "Demande personnalisée";
  const formattedDate = new Date(reservation.date_reservation).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
  const hour = reservation.heure_reservation
    ? new Date(reservation.heure_reservation).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-4 flex items-center gap-4">
      <div className="w-11 h-11 rounded-full bg-[var(--color-bg-alt)] overflow-hidden shrink-0">
        {reservation.agents?.photo_url && (
          <img src={reservation.agents.photo_url} alt="" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-dark)] truncate">{serviceLabel}</p>
        <p className="text-xs text-[var(--color-text-body)] mt-0.5">
          avec {reservation.agents?.name ?? "Agent"} · {reservation.agents?.ville}
        </p>
        <p className="text-xs text-[var(--color-text-body)] mt-1">
          📅 {formattedDate} {hour && `à ${hour}`}
        </p>
      </div>

      <ReservationStatusBadge status={reservation.status} />
    </div>
  );
}

function ReservationStatusBadge({ status }: { status: Reservation["status"] }) {
  const map = {
    en_attente: { label: "En attente", color: "bg-amber-100 text-amber-700" },
    confirmee: { label: "Confirmée", color: "bg-blue-100 text-blue-700" },
    terminee: { label: "Terminée ✅", color: "bg-emerald-100 text-emerald-700" },
    annulee: { label: "Annulée", color: "bg-red-100 text-red-700" },
  };
  const s = map[status];
  return (
    <span className={`shrink-0 inline-block rounded-full px-3 py-1 text-xs font-medium ${s.color}`}>
      {s.label}
    </span>
  );
}