"use client";
import { useState } from "react";
import { createMyReservation } from "@/lib/api/reservations";
import type { Service } from "@/lib/data";
import { Button } from "@/components/ui/UIComponents";

type ReservationFormProps = {
  agentId: number;
  date: string;
  workingStart?: string | null;
  workingEnd?: string | null;
  service?: Service;
  onClose: () => void;
  onSuccess: () => void;
};
export function ReservationForm({
  agentId,
  date,
  workingStart,
  workingEnd,
  service,
  onClose,
  onSuccess,
}: ReservationFormProps) {
  const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");
  const [customRequest, setCustomRequest] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!heureDebut) {
      setError("Merci d'indiquer l'heure de début souhaitée.");
      return;
    }
    if (heureFin && heureFin <= heureDebut) {
      setError("L'heure de fin doit être après l'heure de début.");
      return;
    }
    if (!service && !customRequest.trim()) {
      setError("Décrivez votre besoin.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await createMyReservation({
        agentId,
        dateReservation: date,
        heureReservation: heureDebut,
        heureFinReservation: heureFin || undefined,
        serviceId: service?.id,
        customRequest: service ? undefined : customRequest,
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-7">
        <h3 className="text-base font-semibold text-[#0B162C] mb-1">
          Confirmer la réservation
        </h3>
        <div className="rounded-lg bg-[#EEECF2]/60 p-4 mb-5">
          <p className="uppercase text-xs text-[#393D3A]">Jour choisi</p>
          <p className="text-lg font-semibold text-[#0B162C] capitalize">
            📅 {formattedDate}
          </p>
          {workingStart && workingEnd && (
            <p className="text-sm text-[#393D3A] mt-1">
              🕒 Horaires habituels ce jour-là : {workingStart} — {workingEnd}
            </p>
          )}
        </div>

        {error && <p className="text-sm text-rose-600 mb-3">{error}</p>}

        {service ? (
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-xs font-bold uppercase tracking-wider text-[#0B162C]">
              Service
            </label>
            <div className="rounded-lg border border-[var(--color-border)] p-3">
              <p className="font-semibold text-[#0B162C]">{service.nom}</p>
              <p className="text-sm text-[#393D3A]">
                {service.type_prix === "a_partir_de" ? "À partir de " : ""}
                {service.prix} DT
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-xs font-bold uppercase tracking-wider text-[#0B162C]">
              Décrivez votre besoin
            </label>
            <textarea
              value={customRequest}
              onChange={(e) => setCustomRequest(e.target.value)}
              rows={3}
              placeholder="Décrivez le service que vous recherchez..."
              className="w-full p-3.5 rounded-xl bg-[#EEECF2]/60 focus:bg-white border-1.5 border-[var(--color-border)] text-sm text-black placeholder:text-[#393D3A]/60 resize-none outline-none focus:border-[#291527] focus:ring-4 focus:ring-[#291527]/10"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#0B162C]">
              Heure de début
            </label>
            <input
              type="time"
              value={heureDebut}
              onChange={(e) => setHeureDebut(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#EEECF2]/60 focus:bg-white border-1.5 border-[var(--color-border)] text-sm outline-none focus:border-[#291527] focus:ring-4 focus:ring-[#291527]/10"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#0B162C]">
              Heure de fin{" "}
              <span className="normal-case font-normal text-[#393D3A]">
                (optionnel)
              </span>
            </label>
            <input
              type="time"
              value={heureFin}
              onChange={(e) => setHeureFin(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#EEECF2]/60 focus:bg-white border-1.5 border-[var(--color-border)] text-sm outline-none focus:border-[#291527] focus:ring-4 focus:ring-[#291527]/10"
            />
          </div>
        </div>

        <p className="text-xs text-[#393D3A] mb-5">
          L'agent verra votre demande et décidera de l'accepter, en la comparant
          aux autres demandes reçues pour ce jour-là.
        </p>

        <div className="flex justify-end gap-3">
          <Button variant="neutral" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            isLoading={submitting}
            onClick={handleSubmit}
          >
            Envoyer la demande
          </Button>
        </div>
      </div>
    </div>
  );
}
