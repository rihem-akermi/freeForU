'use client'
import { useEffect, useState } from "react";
import { getAgentDayReservations, AgentDayReservation, confirmMyReservationCompletion, updateAgentReservationStatus } from "@/lib/api/reservations";
import { setDayException } from "@/lib/api/blocked-slots";
import { Button } from "@/components/ui/UIComponents";

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

  const statusLabel: Record<string, string> = {
    en_attente: "En attente", confirmee: "Confirmée", terminee: "Terminée",
    rejetee: "Rejetée", annulee: "Annulée", expiree: "Expirée",
  };
  const statusColor: Record<string, string> = {
    en_attente: "text-amber-600 bg-amber-50",
    confirmee: "text-emerald-600 bg-emerald-50",
    terminee: "text-stone-500 bg-stone-100",
    rejetee: "text-red-600 bg-red-50",
    annulee: "text-red-600 bg-red-50",
    expiree: "text-stone-400 bg-stone-100",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] flex flex-col">

        <div className="flex items-start justify-between mb-4">
          <h3 className="text-base font-semibold text-[#0B162C] capitalize">{formatPrismaDate(date)}</h3>
          <button onClick={onClose} className="text-[#393D3A] hover:text-[#0B162C] transition text-lg leading-none cursor-pointer">✕</button>
        </div>

        <div className="flex gap-1 border-b border-[var(--color-border)] mb-4">
          {([
            { key: "reservations", label: `Réservations (${reservations.length})` },
            { key: "exception", label: "Marquer une exception" },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition cursor-pointer ${
                tab === t.key ? "border-[#0B162C] text-[#0B162C]" : "border-transparent text-[#393D3A] hover:text-[#0B162C]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <p className="text-sm text-[#393D3A] text-center py-8">Chargement...</p>
          ) : tab === "reservations" ? (
            <div className="space-y-3">
              {reservations.length === 0 ? (
                <p className="text-sm text-[#393D3A] text-center py-8">Aucune réservation ce jour.</p>
              ) : (
                reservations
                  .slice()
                  .sort((a, b) => (a.heure_reservation ?? "").localeCompare(b.heure_reservation ?? ""))
                  .map((r) => (
                    <div key={r.id} className="rounded-lg border border-[var(--color-border)] p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#0B162C]">
                          {formatPrismaTime(r.heure_reservation)}
                          {r.heure_fin_reservation && ` — ${formatPrismaTime(r.heure_fin_reservation)}`}
                          {" · "}{r.users.name}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[r.status] ?? "text-stone-500 bg-stone-100"}`}>
                          {statusLabel[r.status] ?? r.status}
                        </span>
                      </div>

                      {r.service_nom && (
                        <p className="text-xs text-[#393D3A]">
                          🧾 {r.service_nom}{r.service_prix ? ` — ${r.service_prix} DT` : ""}
                        </p>
                      )}
                      {r.custom_request && (
                        <p className="text-xs text-[#393D3A] italic">💬 "{r.custom_request}"</p>
                      )}
                      <div className="flex gap-3 text-xs text-[#393D3A]">
                        {r.users.phone && <span>📞 {r.users.phone}</span>}
                        <span>✉️ {r.users.email}</span>
                      </div>

                      {r.status === "en_attente" && (
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => handleAgentDecision(r.id, "confirmee")}
                            disabled={decidingId === r.id}
                            className="flex-1 text-xs px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition cursor-pointer disabled:opacity-50"
                          >
                            {decidingId === r.id ? "..." : "✓ Confirmer"}
                          </button>
                          <button
                            onClick={() => handleAgentDecision(r.id, "rejetee")}
                            disabled={decidingId === r.id}
                            className="flex-1 text-xs px-3 py-1.5 rounded-md bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium transition cursor-pointer disabled:opacity-50"
                          >
                            {decidingId === r.id ? "..." : "✕ Rejeter"}
                          </button>
                        </div>
                      )}
                      {r.status === "confirmee" && !r.agent_confirmed && (
                        <button
                          onClick={() => handleAgentConfirm(r.id)}
                          disabled={confirmingId === r.id}
                          className="mt-1 w-full text-xs px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition cursor-pointer disabled:opacity-50"
                        >
                          {confirmingId === r.id ? "Confirmation..." : "✓ Confirmer la réalisation"}
                        </button>
                      )}
                      {r.status === "confirmee" && r.agent_confirmed && (
                        <p className="text-xs text-emerald-600">✓ Vous avez confirmé la réalisation</p>
                      )}
                    </div>
                  ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[#393D3A]">Marquer ce jour comme :</p>
              <Button
                variant="danger"
                className="w-full"
                isLoading={settingException === "off"}
                onClick={() => handleSetException("off")}
              >
                🔴 Jour de repos (exception)
              </Button>
              <Button
                variant="outline"
                className="w-full"
                isLoading={settingException === "full"}
                onClick={() => handleSetException("full")}
              >
                🔵 Journée pleine (selon moi)
              </Button>
              <p className="text-xs text-[#393D3A]">Recliquer sur le même bouton annule l'exception.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}