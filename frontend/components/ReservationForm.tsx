"use client";
import { useState } from "react";
import { createMyReservation } from "@/lib/api/reservations";
import type { Service } from "@/lib/data";
import { Button, Input, Textarea } from "@/components/ui/UIComponents";

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
        err?.response?.data?.message ?? "Erreur lors de la réservation, réessayez.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-7 shadow-2xl">
        <h3 className="mb-1 text-base font-semibold text-foreground">
          Confirmer la réservation
        </h3>
        <div className="mb-5 rounded-lg bg-muted/60 p-4">
          <p className="text-xs uppercase text-muted-foreground">Jour choisi</p>
          <p className="text-lg font-semibold capitalize text-foreground">{formattedDate}</p>
          {workingStart && workingEnd && (
            <p className="mt-1 text-sm text-muted-foreground">
              Horaires habituels ce jour-là : {workingStart} — {workingEnd}
            </p>
          )}
        </div>

        {error && <p className="mb-3 text-sm text-[var(--color-danger)]">{error}</p>}

        {service ? (
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">Service</label>
            <div className="rounded-lg border border-border p-3">
              <p className="font-semibold text-foreground">{service.nom}</p>
              <p className="text-sm text-muted-foreground">
                {service.type_prix === "a_partir_de" ? "À partir de " : ""}
                {service.prix} DT
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <Textarea
              label="Décrivez votre besoin"
              value={customRequest}
              onChange={(e) => setCustomRequest(e.target.value)}
              rows={3}
              placeholder="Décrivez le service que vous recherchez..."
            />
          </div>
        )}

        <div className="mb-4 grid grid-cols-2 gap-3">
          <Input
            label="Heure de début"
            type="time"
            value={heureDebut}
            onChange={(e) => setHeureDebut(e.target.value)}
          />
          <Input
            label="Heure de fin (optionnel)"
            type="time"
            value={heureFin}
            onChange={(e) => setHeureFin(e.target.value)}
          />
        </div>

        <p className="mb-5 text-xs text-muted-foreground">
          L'agent verra votre demande et décidera de l'accepter, en la comparant
          aux autres demandes reçues pour ce jour-là.
        </p>

        <div className="flex justify-end gap-3">
          <Button variant="neutral" onClick={onClose}>Annuler</Button>
          <Button variant="primary" isLoading={submitting} onClick={handleSubmit}>
            Envoyer la demande
          </Button>
        </div>
      </div>
    </div>
  );
}