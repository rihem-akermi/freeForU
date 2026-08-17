'use client'
import { useEffect, useState } from "react";
import { getDayAvailability, DayAvailability } from "@/lib/api/availability";
import { Button } from "@/components/ui/UIComponents";

type DayAvailabilityModalProps = {
  agentId: number;
  date: string;
  onClose: () => void;
  onProceed: (date: string , startTime: string | null, endTime: string | null) => void; 
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#0B162C] capitalize">{formattedDate}</h3>
          <button onClick={onClose} className="text-[#393D3A] hover:text-[#0B162C] cursor-pointer">✕</button>
        </div>

        {loading ? (
          <p className="text-sm text-[#393D3A] py-4 text-center">Chargement...</p>
        ) : data?.status === "sans_info" ? (
          <p className="text-sm text-[#393D3A] py-4 text-center">
            Aucune information de disponibilité pour ce jour.
          </p>
        ) : data?.status === "ferme" ? (
          <p className="text-sm text-[#393D3A] py-4 text-center">
            😔 L'agent ne travaille pas ce jour-là.
          </p>
        ) : (
          <>
            <div className="rounded-xl bg-[#EEECF2]/60 p-4 mb-4 text-center">
              <p className="text-xs uppercase text-[#393D3A]">Horaires ce jour-là</p>
              <p className="text-lg font-semibold text-[#0B162C]">
                {data?.start_time} — {data?.end_time}
              </p>
            </div>
            <p className="text-xs text-[#393D3A] mb-4 text-center">
              Vous pourrez proposer votre propre heure de rendez-vous dans le formulaire suivant.
            </p>
            <Button variant="primary" className="w-full" onClick={() => onProceed(date , data?.start_time ?? null, data?.end_time ?? null)}>
              Faire une demande
            </Button>
          </>
        )}
      </div>
    </div>
  );
}