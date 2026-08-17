"use client";
import { useEffect, useState } from "react";
import { getMyWorkingHours, updateMyWorkingHours, UpdateDayHours } from "@/lib/api/working-hours";
import { Button, Card } from "@/components/ui/UIComponents";
import { Toast } from "./Toast";

const DAY_LABELS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

function timeFromDb(raw: string | null): string {
  if (!raw) return "";
  if (/^\d{2}:\d{2}/.test(raw)) return raw.slice(0, 5);
  const match = raw.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : "";
}

export default function WorkingHoursEditor() {
  const [days, setDays] = useState<UpdateDayHours[]>(
    Array.from({ length: 7 }, (_, i) => ({ dayOfWeek: i, isWorking: i !== 0, startTime: "09:00", endTime: "18:00" }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    getMyWorkingHours()
      .then((data) => {
        if (data.length === 0) return; // garde les valeurs par défaut si rien n'est encore configuré
        setDays(
          data.map((d) => ({
            dayOfWeek: d.day_of_week,
            isWorking: d.is_working,
            startTime: timeFromDb(d.start_time) || "09:00",
            endTime: timeFromDb(d.end_time) || "18:00",
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateDay = (dayOfWeek: number, patch: Partial<UpdateDayHours>) => {
    setDays((prev) => prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMyWorkingHours(days);
      setToast({ message: "Horaires mis à jour", type: "success" });
    } catch (err: any) {
      setToast({ message: err?.response?.data?.message ?? "Erreur", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-[#393D3A]">Chargement...</p>;

  return (
    <Card>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h3 className="font-serif text-lg font-bold text-[#0B162C] mb-4">Horaires de travail</h3>

      <div className="space-y-3">
        {days
          .slice()
          .sort((a, b) => (a.dayOfWeek === 0 ? 7 : a.dayOfWeek) - (b.dayOfWeek === 0 ? 7 : b.dayOfWeek)) // Lundi → Dimanche à l'affichage
          .map((d) => (
            <div key={d.dayOfWeek} className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium text-[#0B162C] shrink-0">{DAY_LABELS[d.dayOfWeek]}</span>

              <button
                onClick={() => updateDay(d.dayOfWeek, { isWorking: !d.isWorking })}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  d.isWorking ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-[#EEECF2] text-[#393D3A] border border-[var(--color-border)]"
                }`}
              >
                {d.isWorking ? "Ouvert" : "Fermé"}
              </button>

              {d.isWorking && (
                <>
                  <input
                    type="time"
                    value={d.startTime}
                    onChange={(e) => updateDay(d.dayOfWeek, { startTime: e.target.value })}
                    className="px-2.5 py-1.5 text-sm border border-[var(--color-border)] rounded-lg bg-[#EEECF2]/60 focus:bg-white outline-none"
                  />
                  <span className="text-[#393D3A] text-sm">à</span>
                  <input
                    type="time"
                    value={d.endTime}
                    onChange={(e) => updateDay(d.dayOfWeek, { endTime: e.target.value })}
                    className="px-2.5 py-1.5 text-sm border border-[var(--color-border)] rounded-lg bg-[#EEECF2]/60 focus:bg-white outline-none"
                  />
                </>
              )}
            </div>
          ))}
      </div>

      <div className="mt-5">
        <Button variant="primary" isLoading={saving} onClick={handleSave}>
          Enregistrer les horaires
        </Button>
      </div>
    </Card>
  );
}