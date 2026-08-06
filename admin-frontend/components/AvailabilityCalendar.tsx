"use client";
import { useEffect, useState } from "react";
import {
  getMonthCalendar,
  CalendarDay,
  DayStatus,
} from "@/lib/api/availability";

const CLIENT_STYLES: Record<DayStatus, string> = {
  rouge: "bg-red-100 text-red-700 border-red-200 cursor-not-allowed opacity-70",
  orange:
    "bg-amber-100 text-amber-700 border-amber-200 cursor-pointer hover:opacity-75",
  vert: "bg-emerald-100 text-emerald-700 border-emerald-200 cursor-pointer hover:opacity-75",
  sans_info:
    "bg-transparent border-transparent text-[var(--color-text-body)]/30 cursor-default",
};

const AGENT_STYLES: Record<DayStatus, string> = {
  rouge:
    "bg-stone-300 text-stone-500 border-stone-300 cursor-not-allowed opacity-60",
  orange:
    "bg-amber-100 text-amber-700 border-amber-200 cursor-pointer hover:opacity-75",
  vert: "bg-emerald-100 text-emerald-700 border-emerald-200 cursor-pointer hover:opacity-75",
  sans_info:
    "bg-transparent border-transparent text-[var(--color-text-body)]/30 cursor-default",
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
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);

  const styles = mode === "agent" ? AGENT_STYLES : CLIENT_STYLES;

  useEffect(() => {
    setLoading(true);
    getMonthCalendar(agentId, year, month)
      .then(setDays)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [agentId, year, month]);

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

  // décalage pour aligner le 1er du mois sur le bon jour de la semaine (dimanche = 0)
  const firstDayOffset = days.length > 0 ? new Date(days[0].date).getDay() : 0;

  return (
    <div className="bg-(--color-card) rounded-xl p-5 shadow-sm border border-(--color-bg-alt)">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1.5 rounded-md hover:bg-(--color-bg-alt) transition cursor-pointer"
        >
          ←
        </button>
        <h3 className="text-sm font-semibold text-(--color-text-dark)">
          {MONTH_NAMES[month - 1]} {year}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-1.5 rounded-md hover:bg-(--color-bg-alt) transition cursor-pointer"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium text-(--color-text-body)"
          >
            {d}
          </div>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-(--color-text-body) text-center py-8">
          Chargement...
        </p>
      ) : (
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const dayNumber = new Date(day.date).getDate();
            const isDisabled =
              day.status === "rouge" || day.status === "sans_info";
            return (
              <button
                key={day.date}
                onClick={() => {
                  if (day.status === "rouge" || day.status === "sans_info")
                    return;
                  onSelectDay(day.date);
                }}
                disabled={isDisabled}
                title={
                  mode === "client" && day.status === "rouge"
                    ? "Journée complète"
                    : undefined
                }
                className={`aspect-square rounded-lg border text-sm font-medium transition ${styles[day.status]}`}
              >
                {dayNumber}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-(--color-bg-alt) flex-wrap">
        <Legend color="bg-emerald-100 border-emerald-200" label="Disponible" />
        <Legend color="bg-amber-100 border-amber-200" label="Partiel" />
        <Legend
          color={
            mode === "agent"
              ? "bg-stone-300 border-stone-300"
              : "bg-red-100 border-red-200"
          }
          label={mode === "agent" ? "Indisponible" : "Complet"}
        />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded border ${color}`} />
      <span className="text-xs text-(--color-text-body)">{label}</span>
    </div>
  );
}
