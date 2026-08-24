"use client";
import { useState, useEffect } from "react";
import {
  getMyReservations,
  confirmMyReservationCompletion,
  cancelMyReservation,
} from "@/lib/api/reservations";
import type { Reservation } from "@/lib/data";
import { Toast } from "@/components/Toast";
import { ConfirmModal } from "@/components/ConfirmModal";
import { ReviewModal } from "@/components/ReviewModal";
import { Badge, Button, PageHeader } from "@/components/ui/UIComponents";

/* Card left-border tints, same semantic mapping used across every
   other reservation view (admin table, agent table) — pending/warning,
   confirmed/accent, done/info, rejected-cancelled/danger, expired/neutral. */
const CARD_ACCENT: Record<string, string> = {
  en_attente: "var(--color-warning)",
  confirmee: "var(--color-accent)",
  terminee: "var(--color-info)",
  rejetee: "var(--color-danger)",
  annulee: "var(--color-danger)",
  expiree: "var(--color-text-muted)",
};

const STATUS_BADGE_VARIANT: Record<string, "warning" | "info" | "success" | "danger" | "neutral"> = {
  en_attente: "warning",
  confirmee: "info",
  terminee: "success",
  rejetee: "danger",
  annulee: "neutral",
  expiree: "neutral",
};

const STATUS_LABEL: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  terminee: "Terminée",
  rejetee: "Rejetée",
  annulee: "Annulée",
  expiree: "Expirée",
};

function IcoCalendar({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function IcoStar({ className = "w-3.5 h-3.5", filled = true }: { className?: string; filled?: boolean }) {
  return (
    <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.5} viewBox="0 0 24 24">
      <path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7-5.4-4.7 7.1-.7z" />
    </svg>
  );
}
function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[var(--color-warning)]">
      {Array.from({ length: 5 }).map((_, i) => (
        <IcoStar key={i} filled={i < rating} />
      ))}
    </span>
  );
}

export default function MesReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);
  const [reviewTargetId, setReviewTargetId] = useState<number | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const visibleReservations = reservations.filter(
    (r) => showArchived || !r.archived,
  );

  useEffect(() => {
    getMyReservations()
      .then(setReservations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
            : "Confirmation enregistrée, en attente de l'agent.",
        type: "success",
      });
    } catch (err: any) {
      setToast({
        message: err?.response?.data?.message ?? "Erreur.",
        type: "error",
      });
    }
  }

  async function handleCancel(id: number) {
    try {
      const updated = await cancelMyReservation(id);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updated } : r)),
      );
      setToast({ message: "Réservation annulée.", type: "success" });
    } catch (err: any) {
      setToast({
        message: err?.response?.data?.message ?? "Erreur lors de l'annulation.",
        type: "error",
      });
    } finally {
      setCancelTargetId(null);
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
        title="Mes réservations"
        subtitle="Suivez l'état de vos demandes."
        badge="Espace client"
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
          Vous n'avez pas encore de réservation. Parcourez les profils depuis
          l'accueil pour en faire une.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {visibleReservations.map((r) => (
            <ReservationCard
              key={r.id}
              reservation={r}
              onConfirmCompletion={handleConfirmCompletion}
              onRequestCancel={() => setCancelTargetId(r.id)}
              onRequestReview={() => setReviewTargetId(r.id)}
            />
          ))}
        </div>
      )}

      {cancelTargetId && (
        <ConfirmModal
          title="Annuler la réservation"
          message="Cette action est définitive. Voulez-vous vraiment annuler cette réservation ?"
          confirmLabel="Annuler la réservation"
          onConfirm={() => handleCancel(cancelTargetId)}
          onCancel={() => setCancelTargetId(null)}
        />
      )}

      {reviewTargetId && (
        <ReviewModal
          reservationId={reviewTargetId}
          onClose={() => setReviewTargetId(null)}
          onSuccess={(review) => {
            setReservations((prev) =>
              prev.map((r) =>
                r.id === reviewTargetId
                  ? { ...r, reviews: { id: review.id, rating: review.rating } }
                  : r,
              ),
            );
            setReviewTargetId(null);
            setToast({ message: "Merci pour votre avis !", type: "success" });
          }}
        />
      )}
    </div>
  );
}

function isCancellable(reservation: Reservation): boolean {
  if (!["en_attente", "confirmee"].includes(reservation.status)) return false;
  if (!reservation.heure_reservation) return true;

  const reservationDateTime = new Date(reservation.date_reservation);
  const heure = new Date(reservation.heure_reservation);
  reservationDateTime.setHours(
    heure.getHours(),
    heure.getMinutes(),
    heure.getSeconds(),
  );

  const hoursUntil =
    (reservationDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
  return hoursUntil >= 24;
}

function ReservationCard({
  reservation,
  onConfirmCompletion,
  onRequestCancel,
  onRequestReview,
}: {
  reservation: Reservation;
  onConfirmCompletion: (id: number) => void;
  onRequestCancel: () => void;
  onRequestReview: () => void;
}) {
  const formattedDate = new Date(
    reservation.date_reservation,
  ).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const hour = reservation.heure_reservation
    ? new Date(reservation.heure_reservation).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const cancellable = isCancellable(reservation);
  const showCancelZone = ["en_attente", "confirmee"].includes(
    reservation.status,
  );
  const accent = CARD_ACCENT[reservation.status] ?? "var(--color-border)";

  return (
    <div
      className={`rounded-2xl border border-border bg-card p-5 shadow-sm ${reservation.archived ? "opacity-60" : ""}`}
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-muted">
          {reservation.agents?.photo_url && (
            <img
              src={reservation.agents.photo_url}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          {reservation.service_nom ? (
            <>
              <p className="truncate text-sm font-semibold text-foreground">
                {reservation.service_nom}
              </p>
              {reservation.custom_request && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {reservation.custom_request}
                </p>
              )}
            </>
          ) : (
            <p className="truncate text-sm font-semibold text-foreground">
              {reservation.custom_request ?? "Demande personnalisée"}
            </p>
          )}
          <p className="mt-0.5 text-xs text-muted-foreground">
            avec {reservation.agents?.name ?? "Agent"} · {reservation.agents?.ville}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <IcoCalendar />
            {formattedDate} {hour && `à ${hour}`}
          </p>
        </div>

        <Badge variant={STATUS_BADGE_VARIANT[reservation.status] ?? "neutral"}>
          {STATUS_LABEL[reservation.status] ?? reservation.status}
        </Badge>
      </div>

      {reservation.status === "confirmee" && !reservation.client_confirmed && (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            Le service a-t-il bien été effectué ?
          </p>
          <Button size="sm" variant="accent" onClick={() => onConfirmCompletion(reservation.id)}>
            Terminée, laisser un retour
          </Button>
        </div>
      )}
      {reservation.status === "confirmee" && reservation.client_confirmed && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            En attente de la confirmation de l'agent...
          </p>
        </div>
      )}
      {reservation.status === "terminee" && !reservation.reviews && (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">Comment s'est passée ?</p>
          <Button size="sm" variant="outline" onClick={onRequestReview}>
            Laisser un avis
          </Button>
        </div>
      )}
      {reservation.status === "terminee" && reservation.reviews && (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">Votre avis</p>
          <StarRating rating={reservation.reviews.rating} />
        </div>
      )}
      {showCancelZone && (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            {cancellable
              ? "Vous pouvez annuler jusqu'à 24h avant le rendez-vous."
              : "Annulation impossible à moins de 24h du rendez-vous."}
          </p>
          <Button size="sm" variant="danger" disabled={!cancellable} onClick={onRequestCancel}>
            Annuler
          </Button>
        </div>
      )}
    </div>
  );
}