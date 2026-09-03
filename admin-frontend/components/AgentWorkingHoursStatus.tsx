// components/AgentWorkingHoursStatus.tsx
"use client";
import { useEffect, useState } from "react";
import { getAgentWorkingHours, DayHours } from "@/lib/api/working-hours";
import { Card } from "@/components/ui/UIComponents";
import { timeFromDb } from "@/lib/utils/timeFromDb";


const DAY_LABELS_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const ACCENT = "#C4956A"; // warm terracotta



function to12h(hhmm: string): string {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function IcoClock({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function AgentWorkingHoursStatus({ agentId }: { agentId: number }) {
  const [hours, setHours] = useState<DayHours[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAgentWorkingHours(agentId)
      .then(setHours)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [agentId]);

  if (loading) {
    return (
      <Card className="!p-6" style={{ borderLeft: `4px solid ${ACCENT}` }}>
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </Card>
    );
  }

  if (hours.length === 0) return null;

  const todayDow = new Date().getDay();
  const today = hours.find((h) => h.day_of_week === todayDow);
  const isOpenNow = !!(today?.is_working && today.start_time && today.end_time);

  return (
    <Card className="!p-6" style={{ borderLeft: `4px solid ${ACCENT}` }}>
      <div className="mb-4 flex items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${ACCENT}18`, color: ACCENT }}
        >
          <IcoClock />
        </span>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">Horaires</h3>
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: isOpenNow ? "var(--color-success)" : "var(--color-text-muted)" }}
            />
            {isOpenNow
              ? `Ouvert aujourd'hui jusqu'à ${to12h(timeFromDb(today!.end_time))}`
              : "Fermé aujourd'hui"}
          </p>
        </div>
      </div>

      <div className="space-y-1 rounded-xl border bg-background/60 p-4" style={{ borderColor: `${ACCENT}30` }}>
        {DISPLAY_ORDER.map((dow) => {
          const d = hours.find((h) => h.day_of_week === dow);
          const isToday = dow === todayDow;
          const isWorking = d?.is_working && d.start_time && d.end_time;
          return (
            <div
              key={dow}
              className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-xs ${
                isToday ? "bg-accent/10 font-semibold text-foreground" : "text-muted-foreground"
              }`}
            >
              <span>{DAY_LABELS_FR[dow]}</span>
              <span className={isWorking ? "" : "text-muted-foreground/60"}>
                {isWorking
                  ? `${to12h(timeFromDb(d!.start_time))} - ${to12h(timeFromDb(d!.end_time))}`
                  : "Fermé"}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}