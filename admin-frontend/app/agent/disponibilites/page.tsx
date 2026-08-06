"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { getMe } from "@/lib/api/auth";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { AgentDayModal } from "@/components/AgentDayModal";
import {
  getMyWorkingHours,
  setWorkingHour,
  toTimeInput,
  WorkingHour,
} from "@/lib/api/working-hours";
import {
  getMyBlockedSlots,
  deleteBlockedSlot,
  BlockedSlot,
} from "@/lib/api/blocked-slots";

const DAY_NAMES = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

// ─────────────────────────────────────────────────────────────────────────────
// FIX 1 — dates Prisma sans 1970
// "2026-08-04T00:00:00.000Z" ou "2026-08-04" → Date locale sans décalage UTC
// ─────────────────────────────────────────────────────────────────────────────
function parsePrismaDate(raw: string): Date {
  const datePart = raw.includes("T") ? raw.split("T")[0] : raw;
  const [y, m, d] = datePart.split("-").map(Number);
  return new Date(y, m - 1, d); // constructeur local, pas UTC
}

function formatSlotDate(raw: string): string {
  return parsePrismaDate(raw).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
}

function formatSlotTime(t: string | null): string | null {
  if (!t) return null;
  // "HH:MM:SS" → "HH:MM"
  if (/^\d{2}:\d{2}/.test(t)) return t.slice(0, 5);
  // ISO "1970-01-01T14:00:00.000Z" → "14:00"
  const match = t.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : t;
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX 2 — Horaires par semaine
// On récupère le dimanche de la semaine d'une date donnée (même logique que
// le calendrier qui commence la semaine le dimanche)
// ─────────────────────────────────────────────────────────────────────────────
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // recule au dimanche
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatWeekRange(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  return `${weekStart.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} — ${end.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;
}

// ─────────────────────────────────────────────────────────────────────────────

type DayRow = {
  day_of_week: number;
  is_working: boolean;
  start_time: string;
  end_time: string;
};

function buildRows(workingHours: WorkingHour[]): DayRow[] {
  return [0, 1, 2, 3, 4, 5, 6].map((dow) => {
    const wh = workingHours.find((w) => w.day_of_week === dow);
    return {
      day_of_week: dow,
      is_working: wh?.is_working ?? false,
      start_time: toTimeInput(wh?.start_time ?? null),
      end_time: toTimeInput(wh?.end_time ?? null),
    };
  });
}

export default function AgentDisponibilitesPage() {
  const [agentId, setAgentId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    getMe()
      .then((me) => setAgentId(me.id))
      .catch(console.error);
  }, []);

  // ── FIX 3 — Calendrier : refresh via compteur de version ─────────────────
  // On expose aussi year/month depuis AvailabilityCalendar pour savoir quelle
  // semaine afficher dans le formulaire horaires
  const [calendarVersion, setCalendarVersion] = useState(0);

  // FIX 3 : ref pour savoir si on est encore monté avant de refresh
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refreshCalendar = useCallback(() => {
    if (mountedRef.current) setCalendarVersion((v) => v + 1);
  }, []);

  // ── FIX 2 — Semaine sélectionnée (liée au clic sur un jour) ──────────────
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(() =>
    getWeekStart(new Date()),
  );

  const handleSelectDay = useCallback((date: string) => {
    // Met à jour la semaine affichée dans le formulaire horaires
    const clicked = parsePrismaDate(date);
    setSelectedWeekStart(getWeekStart(clicked));
    setSelectedDate(date);
  }, []);

  // ── Modale jour ───────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ── FIX 2 — Horaires par semaine ─────────────────────────────────────────
  const [rows, setRows] = useState<DayRow[]>(buildRows([]));
  const [loadingHours, setLoadingHours] = useState(true);

  // Recharge les horaires quand la semaine change
  useEffect(() => {
    setLoadingHours(true);
    // On passe week_start en query param — voir backend ci-dessous
    getMyWorkingHours(toDateString(selectedWeekStart))
      .then((wh) => setRows(buildRows(wh)))
      .catch(console.error)
      .finally(() => setLoadingHours(false));
  }, [selectedWeekStart]);

  const updateRow = (dow: number, patch: Partial<DayRow>) =>
    setRows((prev) =>
      prev.map((r) => (r.day_of_week === dow ? { ...r, ...patch } : r)),
    );

  const saveAllRows = async () => {
    // Validation
    for (const row of rows) {
      if (row.is_working && (!row.start_time || !row.end_time)) {
        setSaveError(
          `${DAY_NAMES[row.day_of_week]} : renseignez l'heure de début et de fin.`,
        );
        return;
      }
      if (row.is_working && row.start_time >= row.end_time) {
        setSaveError(
          `${DAY_NAMES[row.day_of_week]} : l'heure de fin doit être après l'heure de début.`,
        );
        return;
      }
    }
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      await Promise.all(
        rows.map((row) =>
          setWorkingHour({
            week_start: toDateString(selectedWeekStart),
            day_of_week: row.day_of_week,
            is_working: row.is_working,
            start_time: row.is_working ? row.start_time : undefined,
            end_time: row.is_working ? row.end_time : undefined,
          }),
        ),
      );
      setSaveSuccess(true);
      refreshCalendar();
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      setSaveError(
        err?.response?.data?.message ?? "Erreur lors de la sauvegarde.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Blocages ponctuels ────────────────────────────────────────────────────
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadBlockedSlots = useCallback(() => {
    setLoadingSlots(true);
    getMyBlockedSlots()
      .then(setBlockedSlots)
      .catch(console.error)
      .finally(() => setLoadingSlots(false));
  }, []);

  useEffect(() => {
    loadBlockedSlots();
  }, [loadBlockedSlots]);

  const handleDeleteSlot = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteBlockedSlot(id);
      setBlockedSlots((prev) => prev.filter((s) => s.id !== id));
      setTimeout(() => refreshCalendar(), 100); // laisse React appliquer l'UI avant re-fetch
      loadBlockedSlots();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (!agentId) {
    return (
      <p className="text-sm text-(--color-text-body) p-6">Chargement...</p>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-xl font-semibold text-(--color-text-dark)">
        Mon Agenda
      </h1>

      {/* ── Bloc 1 : Calendrier ─────────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-(--color-text-body) uppercase tracking-wide mb-3">
          Vue du mois
        </h2>
        {/* FIX 3 : key={calendarVersion} force un vrai remount après chaque modif */}
        <AvailabilityCalendar
          key={calendarVersion}
          agentId={agentId}
          onSelectDay={handleSelectDay}
          mode="agent"
        />
      </section>

      {/* ── Bloc 2 : Horaires par semaine ───────────────────────────────────── */}
      <section>
        {/* FIX 2 : en-tête avec la semaine courante + navigation */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-(--color-text-body) uppercase tracking-wide">
            Horaires de la semaine
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const prev = new Date(selectedWeekStart);
                prev.setDate(prev.getDate() - 7);
                setSelectedWeekStart(prev);
              }}
              className="p-1 rounded hover:bg-(--color-bg-alt) transition cursor-pointer text-sm"
            >
              ←
            </button>
            <span className="text-xs text-(--color-text-body) min-w-40 text-center">
              {formatWeekRange(selectedWeekStart)}
            </span>
            <button
              onClick={() => {
                const next = new Date(selectedWeekStart);
                next.setDate(next.getDate() + 7);
                setSelectedWeekStart(next);
              }}
              className="p-1 rounded hover:bg-(--color-bg-alt) transition cursor-pointer text-sm"
            >
              →
            </button>
          </div>
        </div>
        <p className="text-xs text-(--color-text-body) mb-3">
          💡 Cliquer sur un jour du calendrier met automatiquement à jour la
          semaine ici.
        </p>

        <div className="bg-(--color-card) rounded-xl border border-(--color-bg-alt) shadow-sm overflow-hidden">
          {loadingHours ? (
            <p className="text-sm text-(--color-text-body) p-5">
              Chargement...
            </p>
          ) : (
            <div className="divide-y divide-(--color-bg-alt)">
              {rows.map((row) => {
                // Date réelle du jour de cette semaine (pour afficher "lun. 4 août")
                const dayDate = new Date(selectedWeekStart);
                dayDate.setDate(dayDate.getDate() + row.day_of_week);
                const dayLabel = dayDate.toLocaleDateString("fr-FR", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                });

                return (
                  <div
                    key={row.day_of_week}
                    className="p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateRow(row.day_of_week, {
                              is_working: !row.is_working,
                            })
                          }
                          className={`relative w-10 h-5 rounded-full transition cursor-pointer ${row.is_working ? "bg-emerald-500" : "bg-stone-300"}`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${row.is_working ? "translate-x-5" : "translate-x-0"}`}
                          />
                        </button>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-(--color-text-dark)">
                            {DAY_NAMES[row.day_of_week]}
                          </span>
                          {/* FIX 1 : date réelle affichée sans 1970 */}
                          <span className="text-xs text-(--color-text-body)/60 capitalize">
                            {dayLabel}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {row.is_working && (
                          <>
                            <input
                              type="time"
                              value={row.start_time}
                              onChange={(e) =>
                                updateRow(row.day_of_week, {
                                  start_time: e.target.value,
                                })
                              }
                              className="input py-1 px-2 text-xs w-28"
                            />
                            <span className="text-xs text-(--color-text-body)">
                              →
                            </span>
                            <input
                              type="time"
                              value={row.end_time}
                              onChange={(e) =>
                                updateRow(row.day_of_week, {
                                  end_time: e.target.value,
                                })
                              }
                              className="input py-1 px-2 text-xs w-28"
                            />
                          </>
                        )}
                      </div>
                    </div>
                    {!row.is_working && (
                      <p className="text-xs text-(--color-text-body)/60">
                        Journée non travaillée — apparaîtra en rouge sur le
                        calendrier
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Erreur / succès global */}
        {saveError && (
          <p className="text-xs text-red-600 px-4 pb-2">{saveError}</p>
        )}

        <div className="p-4 border-t border-(--color-bg-alt) flex justify-end">
          <button
            onClick={saveAllRows}
            disabled={saving}
            className={`text-sm px-4 py-2 rounded-md font-medium transition cursor-pointer disabled:opacity-50 ${
              saveSuccess
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-(--color-primary) text-white hover:bg-(--color-primary-dark)"
            }`}
          >
            {saving
              ? "Sauvegarde..."
              : saveSuccess
                ? "✓ Sauvegardé"
                : "Sauvegarder la semaine"}
          </button>
        </div>
      </section>

      {/* ── Bloc 3 : Blocages ponctuels ─────────────────────────────────────── */}
      <section className="pb-10">
        <h2 className="text-sm font-semibold text-(--color-text-body) uppercase tracking-wide mb-3">
          Mes blocages ponctuels
        </h2>
        <p className="text-xs text-(--color-text-body) mb-3">
          Pour bloquer un jour ou un créneau précis, cliquez sur un jour du
          calendrier ci-dessus.
        </p>
        <div className="bg-(--color-card) rounded-xl border border-(--color-bg-alt) shadow-sm overflow-hidden">
          {loadingSlots ? (
            <p className="text-sm text-(--color-text-body) p-5">
              Chargement...
            </p>
          ) : blockedSlots.length === 0 ? (
            <p className="text-sm text-(--color-text-body) p-5">
              Aucun blocage ponctuel pour le moment.
            </p>
          ) : (
            <div className="divide-y divide-(--color-bg-alt)">
              {blockedSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    {/* FIX 1 : formatSlotDate utilise parsePrismaDate */}
                    <p className="text-sm font-medium text-(--color-text-dark) capitalize">
                      {formatSlotDate(slot.date)}
                    </p>
                    <p className="text-xs text-(--color-text-body) mt-0.5">
                      {slot.start_time
                        ? `${formatSlotTime(slot.start_time)} → ${formatSlotTime(slot.end_time)}`
                        : "Journée entière"}
                      {slot.reason && ` · ${slot.reason}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    disabled={deletingId === slot.id}
                    className="text-xs px-3 py-1.5 rounded-md text-red-600 hover:bg-red-50 border border-red-200 transition cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === slot.id ? "..." : "Supprimer"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Modale détail jour ─────────────────────────────────────────────
──── */}
      {selectedDate && (
        <AgentDayModal
          agentId={agentId}
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
          onBlockAdded={() => {
            setSelectedDate(null);
            setTimeout(() => refreshCalendar(), 100); // laisse React fermer la modale d'abord
            loadBlockedSlots();
          }}
        />
      )}
    </div>
  );
}
