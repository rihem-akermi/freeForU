"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { getMe } from "@/lib/api/auth";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { AgentDayModal } from "@/components/AgentDayModal";
import { getMyBlockedSlots, deleteBlockedSlot, BlockedSlot } from "@/lib/api/blocked-slots";
import { Button, Card, PageHeader } from "@/components/ui/UIComponents";

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

const CALENDAR_ACCENT = "#46607D"; // soft navy
const EXCEPTIONS_ACCENT = "#C4956A"; // warm terracotta

function IcoInfo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 11v5m0-8h.01" />
    </svg>
  );
}
function IcoCalendar({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function IcoList({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function SectionHeading({
  icon: Icon,
  accent,
  children,
}: {
  icon: (p: { className?: string }) => React.JSX.Element;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${accent}18`, color: accent }}
      >
        <Icon />
      </span>
      <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
        {children}
      </h2>
    </div>
  );
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
    return <p className="p-6 text-sm text-muted-foreground">Chargement...</p>;
  }

  return (
    <div className="w-full">
      <PageHeader
        title="Mon Agenda"
        subtitle="Consultez vos disponibilités et gérez vos exceptions ponctuelles."
        badge="Espace agent"
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
        {/* ── Calendrier ────────────────────────────────────────── */}
        <Card className="!p-6 sm:!p-7" style={{ borderLeft: `4px solid ${CALENDAR_ACCENT}` }}>
          <SectionHeading icon={IcoCalendar} accent={CALENDAR_ACCENT}>
            Vue du mois
          </SectionHeading>
          <p className="mb-4 flex items-start gap-1.5 text-xs text-muted-foreground">
            <IcoInfo className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Pour changer vos horaires hebdomadaires fixes, direction "Mes infos".
            Ici, cliquez sur un jour pour voir les demandes ou marquer une exception.
          </p>
          <AvailabilityCalendar
            key={calendarVersion}
            agentId={agentId}
            onSelectDay={(date) => setSelectedDate(date)}
            mode="agent"
          />
        </Card>

        {/* ── Exceptions ponctuelles ───────────────────────────── */}
        <Card className="!p-6 sm:!p-7" style={{ borderLeft: `4px solid ${EXCEPTIONS_ACCENT}` }}>
          <SectionHeading icon={IcoList} accent={EXCEPTIONS_ACCENT}>
            Mes exceptions ponctuelles
          </SectionHeading>
          <p className="mb-4 text-xs text-muted-foreground">
            Pour marquer un jour "repos" ou "journée pleine", cliquez sur ce jour
            dans le calendrier.
          </p>

          <div className="overflow-hidden rounded-xl border border-border">
            {loadingSlots ? (
              <p className="p-5 text-sm text-muted-foreground">Chargement...</p>
            ) : blockedSlots.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">Aucune exception pour le moment.</p>
            ) : (
              <div className="divide-y divide-border">
                {blockedSlots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="text-sm font-semibold capitalize text-foreground">
                        {formatSlotDate(slot.date)}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{
                            background:
                              slot.type === "off"
                                ? "var(--color-danger)"
                                : "var(--color-info)",
                          }}
                        />
                        {slot.type === "off" ? "Jour de repos" : "Journée pleine"}
                        {slot.reason && ` · ${slot.reason}`}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteSlot(slot.id)}
                      disabled={deletingId === slot.id}
                    >
                      {deletingId === slot.id ? "..." : "Supprimer"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

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