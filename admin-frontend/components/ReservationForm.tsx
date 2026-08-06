"use client";
import { useEffect, useState } from "react";
import { getAgentOffers } from "@/lib/api/offers";
import { createMyReservation } from "@/lib/api/reservations";
import { Offer } from "@/lib/data";

type ReservationFormProps = {
  agentId: number;
  date: string;
  hour: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function ReservationForm({
  agentId,
  date,
  hour,
  onClose,
  onSuccess,
}: ReservationFormProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<string>("");
  const [customRequest, setCustomRequest] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getAgentOffers(agentId).then(setOffers).catch(console.error);
  }, [agentId]);

  const isCustom = selectedOfferId === "autre";

  const handleSubmit = async () => {
    if (!selectedOfferId) return;
    if (isCustom && !customRequest.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      await createMyReservation({
        agentId,
        dateReservation: date,
        heureReservation: hour,
        offerId: isCustom ? undefined : Number(selectedOfferId),
        customRequest: isCustom ? customRequest : undefined,
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ??
          "Erreur lors de la réservation, réessayez.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div
        className="
    bg-[var(--color-card)]
    rounded-2xl
    shadow-2xl
    max-w-lg
    w-full
    p-7
  "
      >
        {" "}
        <h3 className="text-base font-semibold text-[var(--color-text-dark)] mb-1">
          Confirmer la réservation
        </h3>
        <div className="rounded-lg bg-[var(--color-bg-alt)] p-4 mb-5">
          <p className=" uppercase text-[var(--color-text-body)]">
            Rendez-vous
          </p>

          <p className="text-lg font-semibold">📅 {formattedDate}</p>

          <p className="text-[var(--color-primary)] font-medium">🕒 {hour}</p>
        </div>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <div className="flex flex-col gap-2 mb-5">
          <label className=" font-medium text-[var(--color-text-body)]">
            Quel service ?
          </label>
          <select
            value={selectedOfferId}
            onChange={(e) => setSelectedOfferId(e.target.value)}
            className="
    w-full
    h-12
    px-4
    rounded-xl
    bg-white
    border
    border-stone-200
    text-sm
    text-[var(--color-text-dark)]
    shadow-sm
    outline-none
    cursor-pointer
    transition
    focus:border-[var(--color-primary)]
    focus:ring-4
    focus:ring-[var(--color-primary)]/10
  "
          >
            <option value="">-- Choisissez --</option>
            {offers.map((offer) => (
              <option key={offer.id} value={offer.id}>
                {offer.title}{" "}
                {offer.min_price ? `(${Number(offer.min_price)} DT+)` : ""}
              </option>
            ))}
            <option value="autre">Autre — demande personnalisée</option>
          </select>
        </div>
        {isCustom && (
          <div className="flex flex-col gap-1.5 mb-4">
            <label className=" font-medium text-[var(--color-text-body)]">
              Décrivez votre besoin
            </label>
            <textarea
              value={customRequest}
              onChange={(e) => setCustomRequest(e.target.value)}
              rows={3}
              placeholder="Décrivez le service que vous recherchez..."
              className="
    w-full
    p-4
    rounded-xl
    bg-white
    border
    border-stone-200
    text-sm
    text-[var(--color-text-dark)]
    placeholder:text-stone-400
    shadow-sm
    resize-none
    outline-none
    transition
    focus:border-[var(--color-primary)]
    focus:ring-4
    focus:ring-[var(--color-primary)]/10
  "
            />
          </div>
        )}
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            className="
px-5 py-2.5
rounded-lg
bg-[var(--color-primary)]
text-white
hover:scale-[1.02]
active:scale-95
transition
"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedOfferId}
            className="
px-5 py-2.5
rounded-lg
bg-[var(--color-primary)]
text-white
hover:scale-[1.02]
active:scale-95
transition
"
          >
            {submitting ? "Envoi..." : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}
