"use client";
import { useEffect, useState } from "react";
import {
  getMyReservationsAsAgent,
  updateAgentReservationStatus,
  confirmMyReservationCompletion,
} from "@/lib/api/reservations";
import { Toast } from "@/components/Toast";
import type { Reservation } from "@/lib/data";
import { Button, Badge, PageHeader } from "@/components/ui/UIComponents";

/* Row tints pulled from the app's actual semantic tokens, same mapping
   used on the admin ReservationsTable, instead of arbitrary Tailwind
   defaults (amber/violet/sky/stone). */
const ROW_STYLE: Record<string, string> = {
  en_attente: "bg-[var(--color-warning-soft)] hover:brightness-[.97]",
  confirmee: "bg-accent/[0.08] hover:bg-accent/[0.13]",
  terminee: "bg-[var(--color-info-soft)] hover:brightness-[.97]",
  rejetee: "bg-[var(--color-danger-soft)] hover:brightness-[.97]",
  annulee: "bg-[var(--color-danger-soft)] hover:brightness-[.97]",
  expiree: "bg-muted hover:bg-muted/70",
};

const STATUS_BADGE_MAP: Record <
  string,
  "warning" | "success" | "neutral" | "danger"
> = {
  en_attente: "warning",
  confirmee: "info" as any, // overridden below via explicit mapping
  terminee: "success",
  rejetee: "danger",
  annulee: "danger",
  expiree: "neutral",
};

const STATUS_TEXT: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  terminee: "Terminée",
  rejetee: "Rejetée",
  annulee: "Annulée",
  expiree: "Expirée",
};

function statusBadgeVariant(status: string): "warning" | "success" | "danger" | "info" | "neutral" {
  switch (status) {
    case "en_attente":
      return "warning";
    case "confirmee":
      return "info";
    case "terminee":
      return "success";
    case "rejetee":
    case "annulee":
      return "danger";
    case "expiree":
    default:
      return "neutral";
  }
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const visibleReservations = reservations.filter(
    (r) => showArchived || !r.archived,
  );

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
    status: "confirmee" | "rejetee",
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
            : "Réservation rejetée.",
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
      const updated = await confirmMyReservationCompletion(id);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updated } : r)),
      );
      setToast({
        message:
          updated.status === "terminee"
            ? "Réservation marquée terminée."
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
    <div className="w-full">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <PageHeader
        title="Clients et réservations"
        subtitle="Suivez et répondez aux demandes de réservation de vos clients."
        badge="Espace agent"
        actionSlot={
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-muted-foreground">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="cursor-pointer accent-accent"
            />
            Afficher les archivées
          </label>
        }
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : reservations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Vous n'avez pas encore reçu de demande de réservation.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b-2 border-accent/25 bg-accent/[0.07] text-xs font-bold uppercase tracking-wider text-primary">
                <tr>
                  <th className="px-5 py-4">Client</th>
                  <th className="px-5 py-4">Téléphone</th>
                  <th className="px-5 py-4">Service</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Statut</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {visibleReservations.map((r) => {
                  const hour = r.heure_reservation
                    ? new Date(r.heure_reservation).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";
                  const hourFin = r.heure_fin_reservation
                    ? new Date(r.heure_fin_reservation).toLocaleTimeString(
                        "fr-FR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "";

                  return (
                    <tr
                      key={r.id}
                      className={`transition-colors duration-150 ${ROW_STYLE[r.status] ?? ""} ${r.archived ? "opacity-60" : ""}`}
                    >
                      <td className="px-5 py-4 font-semibold text-foreground">
                        {r.users?.name}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {r.users?.phone}
                      </td>
                      <td className="max-w-[160px] px-5 py-4 text-muted-foreground">
                        {r.service_nom ? (
                          <>
                            <div
                              className="truncate font-medium text-foreground"
                              title={r.service_nom}
                            >
                              {r.service_nom}
                            </div>
                            {r.custom_request && (
                              <div className="truncate text-xs" title={r.custom_request}>
                                {r.custom_request}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="truncate" title={r.custom_request ?? ""}>
                            {r.custom_request ?? "Aucune demande"}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {new Date(r.date_reservation).toLocaleDateString("fr-FR")}{" "}
                        {hour}
                        {hourFin && ` → ${hourFin}`}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Badge variant={statusBadgeVariant(r.status)}>
                            {STATUS_TEXT[r.status] ?? r.status}
                          </Badge>
                          {r.archived && <Badge variant="neutral">Archivée</Badge>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {r.status === "en_attente" && (
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              variant="accent"
                              onClick={() => handleAgentStatus(r.id, "confirmee")}
                            >
                              Confirmer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAgentStatus(r.id, "rejetee")}
                            >
                              Rejeter
                            </Button>
                          </div>
                        )}
                        {r.status === "confirmee" && !r.agent_confirmed && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleConfirmCompletion(r.id)}
                          >
                            Marquer comme terminé
                          </Button>
                        )}
                        {r.status === "confirmee" && r.agent_confirmed && (
                          <span className="text-xs text-muted-foreground">
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
        </div>
      )}
    </div>
  );
}