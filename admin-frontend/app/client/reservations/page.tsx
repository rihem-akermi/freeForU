"use client";
import { useState, useEffect } from "react";
import {
  getMyReservations,
  confirmMyReservationCompletion,
  cancelMyReservation,
} from "@/lib/api/reservations";
import type { Reservation } from "@/lib/data";
import { formatDate } from "@/lib/utils/formatDate";
import { Toast } from "@/components/Toast";
import { ConfirmModal } from "@/components/ConfirmModal";
import { ReviewModal } from "@/components/ReviewModal";

const ROW_STYLE: Record<string, string> = {
  en_attente: "bg-amber-50 hover:bg-amber-100/70",
  confirmee: "bg-violet-50 hover:bg-violet-100/70",
  terminee: "bg-sky-50 hover:bg-sky-100/70",
  rejetee: "bg-red-50 hover:bg-red-100/70",
  annulee: "bg-red-50 hover:bg-red-100/70",
  expiree: "bg-stone-100 hover:bg-stone-200/70",
};

const STATUS_TEXT: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  terminee: "Terminée",
  rejetee: "Rejetée",
  annulee: "Annulée",
  expiree: "Expirée",
};

const CARD_STYLE: Record<string, string> = {
  en_attente: "bg-amber-50 border-amber-100",
  confirmee: "bg-violet-50 border-violet-100",
  terminee: "bg-sky-50 border-sky-100",
  rejetee: "bg-red-50 border-red-100",
  annulee: "bg-red-50 border-red-100",
  expiree: "bg-stone-100 border-stone-200",
};

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
            ? "Réservation marquée terminée ✅"
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
    <div className="max-w-3xl">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h1 className="text-2xl font-semibold text-[var(--color-text-dark)] mb-1">
        Mes réservations
      </h1>
      <p className="text-sm text-[var(--color-text-body)] mb-6">
        Suivez l'état de vos demandes.
      </p>

      <label className="flex items-center gap-2 text-xs text-[var(--color-text-body)] mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(e) => setShowArchived(e.target.checked)}
          className="cursor-pointer"
        />
        Afficher les réservations archivées
      </label>

      {loading ? (
        <p className="text-sm text-[var(--color-text-body)]">Chargement...</p>
      ) : reservations.length === 0 ? (
        <p className="text-sm text-[var(--color-text-body)]">
          Vous n'avez pas encore de réservation. Parcourez les offres depuis
          l'accueil pour en faire une.
        </p>
      ) : (
        <div className="space-y-3">
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
            setToast({
              message: "Merci pour votre avis ! ⭐",
              type: "success",
            });
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

  return (
    <div
      className={`bg-white border border-stone-200 rounded-lg p-4 ${reservation.archived ? "opacity-60" : ""}`}
    >
      {" "}
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-[var(--color-bg-alt)] overflow-hidden shrink-0">
          {reservation.agents?.photo_url && (
            <img
              src={reservation.agents.photo_url}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {reservation.service_nom ? (
            <>
              <p className="text-sm font-medium text-[var(--color-text-dark)] truncate">
                {reservation.service_nom}
              </p>
              {reservation.custom_request && (
                <p className="text-xs text-[var(--color-text-body)] mt-0.5 truncate">
                  {reservation.custom_request}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm font-medium text-[var(--color-text-dark)] truncate">
              {reservation.custom_request ?? "Demande personnalisée"}
            </p>
          )}
          <p className="text-xs text-[var(--color-text-body)] mt-0.5">
            avec {reservation.agents?.name ?? "Agent"} ·{" "}
            {reservation.agents?.ville}
          </p>
          <p className="text-xs text-[var(--color-text-body)] mt-1">
            📅 {formattedDate} {hour && `à ${hour}`}
          </p>
        </div>

        <ReservationStatusBadge status={reservation.status} />
      </div>
      {reservation.status === "confirmee" && !reservation.client_confirmed && (
        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
          <p className="text-xs text-[var(--color-text-body)]">
            Le service a-t-il bien été effectué ?
          </p>
          <button
            onClick={() => onConfirmCompletion(reservation.id)}
            className="text-xs font-medium text-[var(--color-primary)] hover:underline cursor-pointer"
          >
            Teminée ?N'oublie pas ton FeedBack🍀
          </button>
        </div>
      )}
      {reservation.status === "confirmee" && reservation.client_confirmed && (
        <div className="mt-3 pt-3 border-t border-stone-100">
          <p className="text-xs text-[var(--color-text-body)]">
            En attente de la confirmation de l'agent...
          </p>
        </div>
      )}
      {reservation.status === "terminee" && !reservation.reviews && (
        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
          <p className="text-xs text-[var(--color-text-body)]">
            Comment s'est passée ?
          </p>
          <button
            onClick={onRequestReview}
            className="text-xs font-medium text-[var(--color-primary)] hover:underline cursor-pointer"
          >
            ⭐ Laisser un avis
          </button>
        </div>
      )}
      {reservation.status === "terminee" && reservation.reviews && (
        <div className="mt-3 pt-3 border-t border-stone-100">
          <p className="text-xs text-[var(--color-text-body)]">
            Votre avis : {"★".repeat(reservation.reviews.rating)}
            {"☆".repeat(5 - reservation.reviews.rating)}
          </p>
        </div>
      )}
      {showCancelZone && (
        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
          <p className="text-xs text-[var(--color-text-body)]">
            {cancellable
              ? "Vous pouvez annuler jusqu'à 24h avant le rendez-vous."
              : "Annulation impossible à moins de 24h du rendez-vous."}
          </p>
          <button
            onClick={onRequestCancel}
            disabled={!cancellable}
            className="text-xs font-medium text-red-600 hover:underline disabled:text-stone-300 disabled:cursor-not-allowed disabled:hover:no-underline cursor-pointer"
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}

function ReservationStatusBadge({ status }: { status: Reservation["status"] }) {
  const map = {
    en_attente: { label: "En attente", color: "bg-amber-100 text-amber-700" },
    confirmee: { label: "Confirmée", color: "bg-blue-100 text-blue-700" },
    terminee: {
      label: "Terminée ✅",
      color: "bg-emerald-100 text-emerald-700",
    },
    rejetee: { label: "Rejetée", color: "bg-red-100 text-red-700" },
    annulee: { label: "Annulée", color: "bg-stone-200 text-stone-600" },
    expiree: { label: "Expirée", color: "bg-stone-200 text-stone-600" },
  };
  const s = map[status];
  return (
    <span
      className={`shrink-0 inline-block rounded-full px-3 py-1 text-xs font-medium ${s.color}`}
    >
      {s.label}
    </span>
  );
}
