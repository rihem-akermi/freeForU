"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { getMe } from "@/lib/api/auth";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { AgentDayModal } from "@/components/AgentDayModal";
import { getMyBlockedSlots, deleteBlockedSlot, BlockedSlot } from "@/lib/api/blocked-slots";

function parsePrismaDate(raw: string): Date {
  const datePart = raw.includes("T") ? raw.split("T")[0] : raw;
  const [y, m, d] = datePart.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatSlotDate(raw: string): string {
  return parsePrismaDate(raw).toLocaleDateString("fr-FR", {
    weekday: "short", day: "numeric", month: "long",
  });
}

export default function AgentDisponibilitesPage() {
  const [agentId, setAgentId] = useState<number | null>(null);

  useEffect(() => {
    getMe().then((me) => setAgentId(me.id)).catch(console.error);
  }, []);

  const [calendarVersion, setCalendarVersion] = useState(0);
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const refreshCalendar = useCallback(() => {
    if (mountedRef.current) setCalendarVersion((v) => v + 1);
  }, []);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadBlockedSlots = useCallback(() => {
    setLoadingSlots(true);
    getMyBlockedSlots().then(setBlockedSlots).catch(console.error).finally(() => setLoadingSlots(false));
  }, []);

  useEffect(() => { loadBlockedSlots(); }, [loadBlockedSlots]);

  const handleDeleteSlot = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteBlockedSlot(id);
      setBlockedSlots((prev) => prev.filter((s) => s.id !== id));
      setTimeout(() => refreshCalendar(), 100);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (!agentId) {
    return <p className="text-sm text-[#393D3A] p-6">Chargement...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-xl font-semibold text-[#0B162C]">Mon Agenda</h1>

      <section>
        <h2 className="text-sm font-semibold text-[#393D3A] uppercase tracking-wide mb-3">
          Vue du mois
        </h2>
        <p className="text-xs text-[#393D3A] mb-3">
          💡 Pour changer vos horaires hebdomadaires fixes, direction "Mes infos". Ici, cliquez sur un jour pour voir les demandes ou marquer une exception.
        </p>
        <AvailabilityCalendar
          key={calendarVersion}
          agentId={agentId}
          onSelectDay={(date) => setSelectedDate(date)}
          mode="agent"
        />
      </section>

      <section className="pb-10">
        <h2 className="text-sm font-semibold text-[#393D3A] uppercase tracking-wide mb-3">
          Mes exceptions ponctuelles
        </h2>
        <p className="text-xs text-[#393D3A] mb-3">
          Pour marquer un jour "repos" ou "journée pleine", cliquez sur ce jour dans le calendrier ci-dessus.
        </p>
        <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
          {loadingSlots ? (
            <p className="text-sm text-[#393D3A] p-5">Chargement...</p>
          ) : blockedSlots.length === 0 ? (
            <p className="text-sm text-[#393D3A] p-5">Aucune exception pour le moment.</p>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {blockedSlots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-[#0B162C] capitalize">
                      {formatSlotDate(slot.date)}
                    </p>
                    <p className="text-xs text-[#393D3A] mt-0.5">
                      {slot.type === "off" ? "🔴 Jour de repos" : "🔵 Journée pleine"}
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

      {selectedDate && (
        <AgentDayModal
          agentId={agentId}
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
          onBlockAdded={() => {
            setSelectedDate(null);
            setTimeout(() => refreshCalendar(), 100);
            loadBlockedSlots();
          }}
          onReservationChanged={() => {
            setTimeout(() => refreshCalendar(), 100);
          }}
        />
      )}
    </div>
  );
}