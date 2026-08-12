"use client";
import { useEffect, useState } from "react";
import {
  getMyReservationsAsAgent,
  updateAgentReservationStatus,
  confirmMyReservationCompletion,
} from "@/lib/api/reservations";
import { Toast } from "@/components/Toast";
import type { Reservation } from "@/lib/data";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    loadReservations();
  }, []);

  async function loadReservations() {
    setLoading(true);
    try {
      setReservations(await getMyReservationsAsAgent());
    } catch (err) {
      console.error(err);
      setToast({ message: "Erreur lors du chargement.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleAgentStatus(
    id: number,
    status: "confirmee" | "annulee",
  ) {
    try {
      const updated = await updateAgentReservationStatus(id, status);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updated } : r)),
      );
      setToast({
        message:
          status === "confirmee"
            ? "Réservation confirmée."
            : "Réservation annulée.",
        type: "success",
      });
    } catch (err: any) {
      setToast({
        message: err?.response?.data?.message ?? "Erreur.",
        type: "error",
      });
    }
  }

  async function handleConfirmCompletion(id: number) {
    try {
      const updated = await confirmMyReservationCompletion(id); // ← nom correct
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updated } : r)),
      );
      setToast({
        message:
          updated.status === "terminee"
            ? "Réservation marquée terminée ✅"
            : "Confirmation enregistrée, en attente du client.",
        type: "success",
      });
    } catch (err: any) {
      setToast({
        message: err?.response?.data?.message ?? "Erreur.",
        type: "error",
      });
    }
  }

  return (
    <div className="max-w-4xl">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h1 className="text-2xl font-semibold text-[var(--color-text-dark)] mb-6">
        Clients et réservations
      </h1>

      {loading ? (
        <p className="text-sm text-[var(--color-text-body)]">Chargement...</p>
      ) : reservations.length === 0 ? (
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
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => {
                const serviceLabel = r.custom_request ?? "⚠️ No Request";
                const hour = r.heure_reservation
                  ? new Date(r.heure_reservation).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";

                return (
                  <tr key={r.id} className="border-t border-stone-100">
                    <td className="px-4 py-3 text-[var(--color-text-dark)]">
                      {r.users?.name}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-body)]">
                      {r.users?.phone}
                    </td>
                    <td
                      className="px-4 py-3 text-[var(--color-text-body)] max-w-[140px] truncate"
                      title={serviceLabel}
                    >
                      {serviceLabel}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-body)]">
                      {new Date(r.date_reservation).toLocaleDateString("fr-FR")}{" "}
                      {hour}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColor(r.status)}`}
                      >
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.status === "en_attente" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAgentStatus(r.id, "confirmee")}
                            className="text-xs text-emerald-700 hover:underline cursor-pointer"
                          >
                            Confirmer
                          </button>
                          <button
                            onClick={() => handleAgentStatus(r.id, "annulee")}
                            className="text-xs text-red-600 hover:underline cursor-pointer"
                          >
                            Annuler
                          </button>
                        </div>
                      )}
                      {r.status === "confirmee" && !r.agent_confirmed && (
                        <button
                          onClick={() => handleConfirmCompletion(r.id)}
                          className="text-xs text-[var(--color-primary)] hover:underline cursor-pointer"
                        >
                          Marquer comme terminé
                        </button>
                      )}
                      {r.status === "confirmee" && r.agent_confirmed && (
                        <span className="text-xs text-[var(--color-text-body)]">
                          En attente du client...
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
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
      return "bg-blue-100 text-blue-700";
    case "terminee":
      return "bg-emerald-100 text-emerald-700";
    case "annulee":
      return "bg-red-100 text-red-700";
  }
}

function statusLabel(status: Reservation["status"]) {
  switch (status) {
    case "en_attente":
      return "En attente";
    case "confirmee":
      return "Confirmée";
    case "terminee":
      return "Terminée ✅";
    case "annulee":
      return "Annulée";
  }
}
