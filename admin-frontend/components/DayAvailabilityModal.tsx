'use client'
import { useEffect, useState } from "react";
import { getDayAvailability, DayAvailability } from "@/lib/api/availability";
import { Button, IconClose } from "@/components/ui/UIComponents";

type DayAvailabilityModalProps = {
  agentId: number;
  date: string;
  onClose: () => void;
  onProceed: (date: string, startTime: string | null, endTime: string | null) => void;
};

export function DayAvailabilityModal({ agentId, date, onClose, onProceed }: DayAvailabilityModalProps) {
  const [data, setData] = useState<DayAvailability | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDayAvailability(agentId, date)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [agentId, date]);

  const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold capitalize text-foreground">{formattedDate}</h3>
          <button onClick={onClose} className="cursor-pointer text-muted-foreground hover:text-foreground" aria-label="Fermer">
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Chargement...</p>
        ) : data?.status === "sans_info" ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Aucune information de disponibilité pour ce jour.
          </p>
        ) : data?.status === "ferme" ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            L'agent ne travaille pas ce jour-là.
          </p>
        ) : (
          <>
            <div className="mb-4 rounded-xl bg-muted/60 p-4 text-center">
              <p className="text-xs uppercase text-muted-foreground">Horaires ce jour-là</p>
              <p className="text-lg font-semibold text-foreground">
                {data?.start_time} — {data?.end_time}
              </p>
            </div>
            <p className="mb-4 text-center text-xs text-muted-foreground">
              Vous pourrez proposer votre propre heure de rendez-vous dans le formulaire suivant.
            </p>
            <Button variant="primary" className="w-full" onClick={() => onProceed(date, data?.start_time ?? null, data?.end_time ?? null)}>
              Faire une demande
            </Button>
          </>
        )}
      </div>
    </div>
  );
}