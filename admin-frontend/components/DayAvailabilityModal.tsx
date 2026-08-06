'use client'
import { useEffect, useState } from "react";
import { getDayAvailability, DayAvailability } from "@/lib/api/availability";

type DayAvailabilityModalProps = {
  agentId: number;
  date: string;
  onClose: () => void;
  onSelectHour: (date: string, hour: string) => void;
};

export function DayAvailabilityModal({ agentId, date, onClose, onSelectHour }: DayAvailabilityModalProps) {
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
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-[var(--color-card)] rounded-xl shadow-xl max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[var(--color-text-dark)] capitalize">{formattedDate}</h3>
          <button onClick={onClose} className="text-[var(--color-text-body)] hover:text-[var(--color-text-dark)] cursor-pointer">
            ✕
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-[var(--color-text-body)] py-4 text-center">Chargement...</p>
        ) : data?.status === "sans_info" ? (
          <p className="text-sm text-[var(--color-text-body)] py-4 text-center">
            Aucune information de disponibilité pour ce jour.
          </p>
        ) : data && data.available_hours.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {data.available_hours.map((hour) => (
              <button
                key={hour}
                onClick={() => onSelectHour(date, hour)}
                className="px-3 py-2 text-sm font-medium rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition cursor-pointer"
              >
                {hour}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-body)] py-4 text-center">
            😔 Journée réservée, aucun créneau disponible.
          </p>
        )}
      </div>
    </div>
  );
}