// components/AgentWorkingHoursStatus.tsx
"use client";
import { useEffect, useState } from "react";
import { getAgentWorkingHours, DayHours } from "@/lib/api/working-hours";

const DAY_LABELS_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Lundi → Dimanche à l'affichage

function timeFromDb(raw: string | null): string {
  if (!raw) return "";
  if (/^\d{2}:\d{2}/.test(raw)) return raw.slice(0, 5);
  const match = raw.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : "";
}

function to12h(hhmm: string): string {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export default function AgentWorkingHoursStatus({ agentId }: { agentId: number }) {
  const [hours, setHours] = useState<DayHours[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAgentWorkingHours(agentId)
      .then(setHours)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [agentId]);

  if (loading || hours.length === 0) return null;

  const todayDow = new Date().getDay();
  const today = hours.find((h) => h.day_of_week === todayDow);
  const isOpenNow = !!(today?.is_working && today.start_time && today.end_time);

  return (
    <div className="mb-4">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-2 text-sm font-medium text-[#0B162C] cursor-pointer"
      >
        <span className={`w-2 h-2 rounded-full ${isOpenNow ? "bg-emerald-500" : "bg-stone-400"}`} />
        {isOpenNow
          ? `Dispo jusqu'à ${to12h(timeFromDb(today!.end_time))}`
          : "Fermé aujourd'hui"}
        <span className="text-xs text-[#393D3A]">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="mt-2 rounded-xl border border-[var(--color-border)] bg-white p-3 space-y-1.5">
          {DISPLAY_ORDER.map((dow) => {
            const d = hours.find((h) => h.day_of_week === dow);
            const isToday = dow === todayDow;
            return (
              <div
                key={dow}
                className={`flex items-center justify-between text-xs ${isToday ? "font-semibold text-[#0B162C]" : "text-[#393D3A]"}`}
              >
                <span>{DAY_LABELS_FR[dow]}</span>
                <span>
                  {d?.is_working && d.start_time && d.end_time
                    ? `${to12h(timeFromDb(d.start_time))} - ${to12h(timeFromDb(d.end_time))}`
                    : "Closed"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}