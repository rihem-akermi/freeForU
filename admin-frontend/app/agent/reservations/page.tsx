// app/agent/reservations/page.tsx
'use client'
import { useState } from "react";

type Reservation = {
  id: number;
  client_name: string;
  client_phone: string;
  date_reservation: string;
  status: "en_attente" | "confirmee" | "annulee";
  created_at: string;
};

// Mock — sera remplacé par un fetch GET /agent/reservations
const mockReservations: Reservation[] = [
  {
    id: 1,
    client_name: "Sami Trabelsi",
    client_phone: "+216 22 345 678",
    date_reservation: "2026-07-20",
    status: "en_attente",
    created_at: "2026-07-14",
  },
  {
    id: 2,
    client_name: "Nour Jendoubi",
    client_phone: "+216 55 987 654",
    date_reservation: "2026-07-18",
    status: "confirmee",
    created_at: "2026-07-10",
  },
  {
    id: 3,
    client_name: "Mehdi Karray",
    client_phone: "+216 98 112 233",
    date_reservation: "2026-07-05",
    status: "annulee",
    created_at: "2026-07-01",
  },
];

const statusOptions = [
  { value: "en_attente", label: "En attente" },
  { value: "confirmee", label: "Confirmée" },
  { value: "annulee", label: "Annulée" },
] as const;

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);

  const handleStatusChange = (id: number, newStatus: Reservation["status"]) => {
    // Mock — sera remplacé par PATCH /agent/reservations/:id/status
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold text-[var(--color-text-dark)] mb-6">
        Clients et réservations
      </h1>

      {reservations.length === 0 ? (
        <p className="text-sm text-[var(--color-text-body)]">
          Vous n'avez pas encore reçu de demande de réservation.
        </p>
      ) : (
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-bg-alt)] text-left text-xs uppercase text-[var(--color-text-body)]">
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Téléphone</th>
                <th className="px-4 py-3 font-medium">Date souhaitée</th>
                <th className="px-4 py-3 font-medium">Demandée le</th>
                <th className="px-4 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className="border-t border-stone-100">
                  <td className="px-4 py-3 text-[var(--color-text-dark)]">{r.client_name}</td>
                  <td className="px-4 py-3 text-[var(--color-text-body)]">{r.client_phone}</td>
                  <td className="px-4 py-3 text-[var(--color-text-body)]">{r.date_reservation}</td>
                  <td className="px-4 py-3 text-[var(--color-text-body)]">{r.created_at}</td>
                  <td className="px-4 py-3">
                    <select
                      value={r.status}
                      onChange={(e) =>
                        handleStatusChange(r.id, e.target.value as Reservation["status"])
                      }
                      className={`rounded-full px-3 py-1 text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${statusColor(r.status)}`}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function statusColor(status: Reservation["status"]) {
  switch (status) {
    case "en_attente":
      return "bg-amber-100 text-amber-700";
    case "confirmee":
      return "bg-emerald-100 text-emerald-700";
    case "annulee":
      return "bg-red-100 text-red-700";
  }
}