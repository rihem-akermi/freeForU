'use client'
import { useEffect, useState } from "react";
import { getAgentDayReservations, AgentDayReservation, confirmMyReservationCompletion, updateAgentReservationStatus } from "@/lib/api/reservations";
import { setDayException } from "@/lib/api/blocked-slots";
import { Button, Badge, IconClose, IconCheck } from "@/components/ui/UIComponents";

type AgentDayModalProps = {
  agentId: number;
  date: string;
  onClose: () => void;
  onBlockAdded: () => void;
  onReservationChanged?: () => void;
};

type Tab = "reservations" | "exception";

function formatPrismaTime(raw: string | null): string {
  if (!raw) return "—";
  if (/^\d{2}:\d{2}/.test(raw)) return raw.slice(0, 5);
  const match = raw.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : raw;
}

function formatPrismaDate(raw: string): string {
  const datePart = raw.includes("T") ? raw.split("T")[0] : raw;
  const [y, m, d] = datePart.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

const STATUS_BADGE_VARIANT: Record<string, "warning" | "success" | "neutral" | "danger"> = {
  en_attente: "warning",
  confirmee: "success",
  terminee: "neutral",
  rejetee: "danger",
  annulee: "danger",
  expiree: "neutral",
};

const STATUS_LABEL: Record<string, string> = {
  en_attente: "En attente", confirmee: "Confirmée", terminee: "Terminée",
  rejetee: "Rejetée", annulee: "Annulée", expiree: "Expirée",
};

export function AgentDayModal({ agentId, date, onClose, onBlockAdded, onReservationChanged }: AgentDayModalProps) {
  const [tab, setTab] = useState<Tab>("reservations");
  const [reservations, setReservations] = useState<AgentDayReservation[]>([]);
  const [loading, setLoading] = useState(true);

  const [settingException, setSettingException] = useState<"off" | "full" | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [decidingId, setDecidingId] = useState<number | null>(null);

  const loadData = () => {
    setLoading(true);
    getAgentDayReservations(date)
      .then(setReservations)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [agentId, date]);

  const handleSetException = async (type: "off" | "full") => {
    setSettingException(type);
    try {
      await setDayException(date, type);
      onBlockAdded();
    } catch (err: any) {
      console.error("Erreur exception:", err?.response?.data?.message ?? err);
    } finally {
      setSettingException(null);
    }
  };

  const handleAgentConfirm = async (reservationId: number) => {
    setConfirmingId(reservationId);
    try {
      await confirmMyReservationCompletion(reservationId);
      loadData();
      onReservationChanged?.();
    } catch (err: any) {
      console.error("Erreur confirmation:", err?.response?.data?.message ?? err);
    } finally {
      setConfirmingId(null);
    }
  };

  const handleAgentDecision = async (reservationId: number, status: "confirmee" | "rejetee") => {
    setDecidingId(reservationId);
    try {
      await updateAgentReservationStatus(reservationId, status);
      loadData();
      onReservationChanged?.();
    } catch (err: any) {
      console.error("Erreur décision:", err?.response?.data?.message ?? err);
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/60 px-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl border border-border bg-card p-6 shadow-2xl">

        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-base font-semibold capitalize text-foreground">{formatPrismaDate(date)}</h3>
          <button
            onClick={onClose}
            className="cursor-pointer text-muted-foreground transition hover:text-foreground"
            aria-label="Fermer"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex gap-1 border-b border-border">
          {([
            { key: "reservations", label: `Réservations (${reservations.length})` },
            { key: "exception", label: "Marquer une exception" },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`cursor-pointer border-b-2 px-3 py-2 text-xs font-semibold transition ${
                tab === t.key ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Chargement...</p>
          ) : tab === "reservations" ? (
            <div className="space-y-3">
              {reservations.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Aucune réservation ce jour.</p>
              ) : (
                reservations
                  .slice()
                  .sort((a, b) => (a.heure_reservation ?? "").localeCompare(b.heure_reservation ?? ""))
                  .map((r) => (
                    <div key={r.id} className="space-y-1.5 rounded-xl border border-border p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {formatPrismaTime(r.heure_reservation)}
                          {r.heure_fin_reservation && ` — ${formatPrismaTime(r.heure_fin_reservation)}`}
                          {" · "}{r.users.name}
                        </span>
                        <Badge variant={STATUS_BADGE_VARIANT[r.status] ?? "neutral"}>
                          {STATUS_LABEL[r.status] ?? r.status}
                        </Badge>
                      </div>

                      {r.service_nom && (
                        <p className="text-xs text-muted-foreground">
                          {r.service_nom}{r.service_prix ? ` — ${r.service_prix} DT` : ""}
                        </p>
                      )}
                      {r.custom_request && (
                        <p className="text-xs italic text-muted-foreground">"{r.custom_request}"</p>
                      )}
                      <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                        {r.users.phone && <span>{r.users.phone}</span>}
                        <span>{r.users.email}</span>
                      </div>

                      {r.status === "en_attente" && (
                        <div className="mt-1 flex gap-2">
                          <Button
                            size="sm"
                            variant="accent"
                            className="flex-1"
                            onClick={() => handleAgentDecision(r.id, "confirmee")}
                            disabled={decidingId === r.id}
                          >
                            {decidingId === r.id ? "..." : <><IconCheck className="h-3.5 w-3.5" /> Confirmer</>}
                          </Button>
                          <Button
                            size="sm"
                            variant="neutral"
                            className="flex-1"
                            onClick={() => handleAgentDecision(r.id, "rejetee")}
                            disabled={decidingId === r.id}
                          >
                            {decidingId === r.id ? "..." : <><IconClose className="h-3.5 w-3.5" /> Rejeter</>}
                          </Button>
                        </div>
                      )}
                      {r.status === "confirmee" && !r.agent_confirmed && (
                        <Button
                          size="sm"
                          variant="accent"
                          className="mt-1 w-full"
                          onClick={() => handleAgentConfirm(r.id)}
                          disabled={confirmingId === r.id}
                        >
                          {confirmingId === r.id ? "Confirmation..." : <><IconCheck className="h-3.5 w-3.5" /> Confirmer la réalisation</>}
                        </Button>
                      )}
                      {r.status === "confirmee" && r.agent_confirmed && (
                        <p className="flex items-center gap-1.5 text-xs text-[var(--color-success)]">
                          <IconCheck className="h-3.5 w-3.5" /> Vous avez confirmé la réalisation
                        </p>
                      )}
                    </div>
                  ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Marquer ce jour comme :</p>
              <Button
                variant="danger"
                className="w-full"
                isLoading={settingException === "off"}
                onClick={() => handleSetException("off")}
              >
                Jour de repos (exception)
              </Button>
              <Button
                variant="outline"
                className="w-full"
                isLoading={settingException === "full"}
                onClick={() => handleSetException("full")}
              >
                Journée pleine (selon moi)
              </Button>
              <p className="text-xs text-muted-foreground">Recliquer sur le même bouton annule l'exception.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}