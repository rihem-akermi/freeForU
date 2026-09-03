"use client";
import { useEffect, useState } from "react";
import {
  getMonthCalendar,
  getClientMonthCalendar,
  ClientCalendarDay,
  getAgentMonthCalendar,
} from "@/lib/api/availability";

/* Same status keys and meaning as before — only the underlying colors
   are remapped to the app's actual palette tokens instead of raw
   Tailwind hues (amber/violet/sky/stone/red). */
const CLIENT_STYLES: Record<string, string> = {
  neutre: "bg-transparent border-border text-foreground cursor-pointer hover:bg-muted",
  gris: "bg-muted text-muted-foreground/50 border-border cursor-not-allowed opacity-70",
  jaune: "bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[var(--color-warning)]/25 cursor-default",
  violet: "bg-accent/15 text-accent-dark border-accent/25 cursor-default",
  bleu: "bg-[var(--color-info-soft)] text-[var(--color-info)] border-[var(--color-info)]/25 cursor-default",
};

const AGENT_STYLES: Record<string, string> = {
  neutre: "bg-transparent border-border text-foreground cursor-pointer hover:bg-muted",
  rouge: "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[var(--color-danger)]/25 cursor-pointer hover:opacity-75",
  jaune: "bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[var(--color-warning)]/25 cursor-pointer hover:opacity-75",
  violet: "bg-accent/15 text-accent-dark border-accent/25 cursor-pointer hover:opacity-75",
  bleu: "bg-[var(--color-info-soft)] text-[var(--color-info)] border-[var(--color-info)]/25 cursor-pointer hover:opacity-75",
};

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

type AvailabilityCalendarProps = {
  agentId: number;
  onSelectDay: (date: string) => void;
  mode?: "agent" | "client";
};

export function AvailabilityCalendar({
  agentId,
  onSelectDay,
  mode = "client",
}: AvailabilityCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [days, setDays] = useState<{ date: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const styles = mode === "agent" ? AGENT_STYLES : CLIENT_STYLES;

  useEffect(() => {
    setLoading(true);
    const fetcher =
      mode === "client"
        ? getClientMonthCalendar(agentId, year, month)
        : getAgentMonthCalendar(agentId, year, month);

    fetcher
      .then(setDays)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [agentId, year, month, mode]);

  const goToPreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };
  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const firstDayOffset = days.length > 0 ? new Date(days[0].date).getDay() : 0;

  const isDisabled = (status: string) =>
    mode === "client" ? status === "gris" : false;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={goToPreviousMonth}
          className="cursor-pointer rounded-md p-1.5 text-foreground transition hover:bg-muted"
          aria-label="Mois précédent"
        >
          ←
        </button>
        <h3 className="text-sm font-semibold text-foreground">
          {MONTH_NAMES[month - 1]} {year}
        </h3>
        <button
          onClick={goToNextMonth}
          className="cursor-pointer rounded-md p-1.5 text-foreground transition hover:bg-muted"
          aria-label="Mois suivant"
        >
          →
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1.5">
        {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => (
          <div key={i} className="text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Chargement...</p>
      ) : (
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const dayNumber = new Date(day.date).getDate();
            const disabled = isDisabled(day.status);
            return (
              <button
                key={day.date}
                onClick={() => {
                  if (!disabled) onSelectDay(day.date);
                }}
                disabled={disabled}
                className={`aspect-square rounded-lg border text-sm font-medium transition ${styles[day.status] ?? ""}`}
              >
                {dayNumber}
              </button>
            );
          })}
        </div>
      )}

      {mode === "client" ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <Legend color="bg-[var(--color-warning-soft)] border-[var(--color-warning)]/25" label="En attente" />
          <Legend color="bg-accent/15 border-accent/25" label="Confirmée" />
          <Legend color="bg-[var(--color-info-soft)] border-[var(--color-info)]/25" label="Terminée" />
          <Legend color="bg-muted border-border" label="Fermé" />
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <Legend color="bg-[var(--color-warning-soft)] border-[var(--color-warning)]/25" label="Demande(s) en attente" />
          <Legend color="bg-[var(--color-info-soft)] border-[var(--color-info)]/25" label="Journée pleine" />
          <Legend color="bg-accent/15 border-accent/25" label="Traité" />
          <Legend color="bg-[var(--color-danger-soft)] border-[var(--color-danger)]/25" label="Repos" />
        </div>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded border ${color}`} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}