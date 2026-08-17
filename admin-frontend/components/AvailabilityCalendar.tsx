"use client";
import { useEffect, useState } from "react";
import {
  getMonthCalendar,
  getClientMonthCalendar,
  ClientCalendarDay,
  getAgentMonthCalendar,
} from "@/lib/api/availability";

const CLIENT_STYLES: Record<string, string> = {
  neutre:
    "bg-transparent border-[var(--color-border)] text-[#0B162C] cursor-pointer hover:bg-[#EEECF2]",
  gris: "bg-stone-200 text-stone-400 border-stone-200 cursor-not-allowed opacity-70",
  jaune: "bg-amber-100 text-amber-700 border-amber-200 cursor-default",
  violet: "bg-violet-100 text-violet-700 border-violet-200 cursor-default",
  bleu: "bg-sky-100 text-sky-700 border-sky-200 cursor-default",
};

const AGENT_STYLES: Record<string, string> = {
  neutre:
    "bg-transparent border-[var(--color-border)] text-[#0B162C] cursor-pointer hover:bg-[#EEECF2]",
  rouge:
    "bg-red-100 text-red-700 border-red-200 cursor-pointer hover:opacity-75", // cliquable !
  jaune:
    "bg-amber-100 text-amber-700 border-amber-200 cursor-pointer hover:opacity-75",
  violet:
    "bg-violet-100 text-violet-700 border-violet-200 cursor-pointer hover:opacity-75",
  bleu: "bg-sky-100 text-sky-700 border-sky-200 cursor-pointer hover:opacity-75",
};

const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
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
    <div className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)]">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1.5 rounded-md hover:bg-[#EEECF2] transition cursor-pointer"
        >
          ←
        </button>
        <h3 className="text-sm font-semibold text-[#0B162C]">
          {MONTH_NAMES[month - 1]} {year}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-1.5 rounded-md hover:bg-[#EEECF2] transition cursor-pointer"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium text-[#393D3A]"
          >
            {d}
          </div>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-[#393D3A] text-center py-8">Chargement...</p>
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
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--color-border)] flex-wrap">
          <Legend color="bg-amber-100 border-amber-200" label="En attente" />
          <Legend color="bg-violet-100 border-violet-200" label="Confirmée" />
          <Legend color="bg-sky-100 border-sky-200" label="Terminée" />
          <Legend color="bg-stone-200 border-stone-200" label="Fermé" />
        </div>
      ) : (
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--color-border)] flex-wrap">
          <Legend
            color="bg-amber-100 border-amber-200"
            label="Demande(s) en attente"
          />
          <Legend color="bg-sky-100 border-sky-200" label="Journée pleine" />
          <Legend color="bg-violet-100 border-violet-200" label="Traité" />
          <Legend color="bg-red-100 border-red-200" label="Repos" />
        </div>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded border ${color}`} />
      <span className="text-xs text-[#393D3A]">{label}</span>
    </div>
  );
}
