'use client'
import { useEffect, useState } from "react";
import { getDayAvailability } from "@/lib/api/availability";
import { getAgentDayReservations, AgentDayReservation } from "@/lib/api/reservations";
import { createBlockedSlot } from "@/lib/api/blocked-slots";
import api from "@/lib/api/interceptor";

type AgentDayModalProps = {
  agentId: number;
  date: string; // "YYYY-MM-DD"
  onClose: () => void;
  onBlockAdded: () => void;
};

type Tab = "reservations" | "bloquer";

// ─────────────────────────────────────────────────────────────────────────────
// FIX 1 — 1970 : Prisma retourne les champs Time comme "1970-01-01T14:00:00.000Z"
// On extrait juste "HH:MM" sans passer par new Date() qui décale en UTC
// ─────────────────────────────────────────────────────────────────────────────
function formatPrismaTime(raw: string | null): string {
  if (!raw) return "—";
  // Cas "HH:MM:SS" (string directe depuis certains drivers)
  if (/^\d{2}:\d{2}/.test(raw)) return raw.slice(0, 5);
  // Cas ISO "1970-01-01T14:00:00.000Z" — on prend la partie heure en UTC
  const match = raw.match(/T(\d{2}:\d{2})/);
  if (match) return match[1];
  return raw;
}

// FIX 1 — dates : "2026-08-04T00:00:00.000Z" → "dim. 4 août" sans décalage UTC
function formatPrismaDate(raw: string): string {
  // On prend la partie YYYY-MM-DD avant le T pour éviter le décalage de fuseau
  const datePart = raw.includes("T") ? raw.split("T")[0] : raw;
  const [y, m, d] = datePart.split("-").map(Number);
  // Construire avec les composantes locales pour ne pas décaler
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export function AgentDayModal({ agentId, date, onClose, onBlockAdded }: AgentDayModalProps) {
  const [tab, setTab] = useState<Tab>("reservations");
  const [reservations, setReservations] = useState<AgentDayReservation[]>([]);
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulaire blocage
  const [blockType, setBlockType] = useState<"full" | "partial">("full");
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [blockError, setBlockError] = useState("");
  const [blockSuccess, setBlockSuccess] = useState(false);

  // FIX 4 — confirmation agent
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      getAgentDayReservations(date),
      getDayAvailability(agentId, date),
    ])
      .then(([res, avail]) => {
        setReservations(res);
        setAvailableHours(avail.available_hours);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [agentId, date]);

   const handleBlock = async () => {
    setBlockError("");
    if (blockType === "partial") {
      if (!blockStart || !blockEnd) {
        setBlockError("Veuillez renseigner l'heure de début et de fin.");
        return;
      }
      if (blockStart >= blockEnd) {
        setBlockError("L'heure de fin doit être après l'heure de début.");
        return;
      }
    }
    setSubmitting(true);
    try {
      await createBlockedSlot({
        date,
        start_time: blockType === "partial" ? blockStart : undefined,
        end_time: blockType === "partial" ? blockEnd : undefined,
        reason: blockReason || undefined,
      });
      setBlockSuccess(true);
      onBlockAdded(); // ← appelé après await : le calendrier re-fetch des données fraîches
    } catch (err: any) {
      setBlockError(err?.response?.data?.message ?? "Erreur lors du blocage.");
    } finally {
      setSubmitting(false);
    }
  };

  // FIX 4 — confirmer la réservation côté agent (pose agent_confirmed = true)
  const handleAgentConfirm = async (reservationId: number) => {
    setConfirmingId(reservationId);
    try {
      await api.patch(`/reservations/${reservationId}/confirm-completion`);
      // Recharge la liste pour refléter le nouveau status
      loadData();
    } catch (err: any) {
      console.error("Erreur confirmation:", err?.response?.data?.message ?? err);
    } finally {
      setConfirmingId(null);
    }
  };

  const statusLabel: Record<string, string> = {
    en_attente: "En attente",
    confirmee: "Confirmée",
    terminee: "Terminée",
    annulee: "Annulée",
  };

  const statusColor: Record<string, string> = {
    en_attente: "text-amber-600 bg-amber-50",
    confirmee: "text-emerald-600 bg-emerald-50",
    terminee: "text-stone-500 bg-stone-100",
    annulee: "text-red-600 bg-red-50",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-[var(--color-card)] rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] flex flex-col">

        {/* Header — FIX 1 : formatPrismaDate au lieu de new Date(date) */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-[var(--color-text-dark)] capitalize">
              {formatPrismaDate(date)}
            </h3>
            {!loading && (
              <p className="text-xs text-[var(--color-text-body)] mt-0.5">
                {reservations.length} réservation{reservations.length !== 1 ? "s" : ""} ·{" "}
                {availableHours.length} créneau{availableHours.length !== 1 ? "x" : ""} libre{availableHours.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-[var(--color-text-body)] hover:text-[var(--color-text-dark)] transition text-lg leading-none cursor-pointer">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[var(--color-bg-alt)] mb-4">
          {([
            { key: "reservations", label: `Réservations (${reservations.length})` },
            { key: "bloquer", label: "Bloquer un créneau" },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition cursor-pointer ${
                tab === t.key
                  ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "border-transparent text-[var(--color-text-body)] hover:text-[var(--color-text-dark)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenu scrollable */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <p className="text-sm text-[var(--color-text-body)] text-center py-8">Chargement...</p>
          ) : tab === "reservations" ? (

            // ── Tab Réservations ────────────────────────────────────────────
            <div className="space-y-3">
              {reservations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-[var(--color-text-body)]">Aucune réservation ce jour.</p>
                  {availableHours.length > 0 && (
                    <p className="text-xs text-emerald-600 mt-1">
                      {availableHours.length} créneau{availableHours.length !== 1 ? "x" : ""} disponible{availableHours.length !== 1 ? "s" : ""} : {availableHours.join(", ")}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {reservations.map((r) => (
                    <div key={r.id} className="rounded-lg border border-[var(--color-bg-alt)] p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        {/* FIX 1 — heure : formatPrismaTime retire le 1970 */}
                        <span className="text-sm font-medium text-[var(--color-text-dark)]">
                          {formatPrismaTime(r.heure_reservation)} — {r.users.name}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[r.status] ?? "text-stone-500 bg-stone-100"}`}>
                          {statusLabel[r.status] ?? r.status}
                        </span>
                      </div>

                      {r.offers && (
                        <p className="text-xs text-[var(--color-text-body)]">🎯 {r.offers.title}</p>
                      )}
                      {r.custom_request && (
                        <p className="text-xs text-[var(--color-text-body)] italic">💬 "{r.custom_request}"</p>
                      )}
                      <div className="flex gap-3 text-xs text-[var(--color-text-body)]">
                        {r.users.phone && <span>📞 {r.users.phone}</span>}
                        <span>✉️ {r.users.email}</span>
                      </div>

                      {/* FIX 4 — bouton confirmation agent */}
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
                  ))}

                  {/* Créneaux libres restants */}
                  {availableHours.length > 0 && (
                    <div className="mt-2 pt-3 border-t border-[var(--color-bg-alt)]">
                      <p className="text-xs font-medium text-[var(--color-text-body)] mb-1.5">Créneaux encore libres</p>
                      <div className="flex flex-wrap gap-1.5">
                        {availableHours.map((h) => (
                          <span key={h} className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

          ) : (

            // ── Tab Bloquer ─────────────────────────────────────────────────
            <div className="space-y-4">
              {blockSuccess ? (
                <div className="text-center py-8">
                  <p className="text-emerald-600 font-medium text-sm">✓ Créneau bloqué avec succès</p>
                  <p className="text-xs text-[var(--color-text-body)] mt-1">Le calendrier a été mis à jour.</p>
                  <button onClick={onClose} className="mt-4 px-4 py-2 text-sm font-medium rounded-md bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition cursor-pointer">
                    Fermer
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[var(--color-text-body)]">Type de blocage</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setBlockType("full")}
                        className={`flex-1 py-2 text-xs font-medium rounded-md border transition cursor-pointer ${
                          blockType === "full"
                            ? "bg-red-50 border-red-300 text-red-700"
                            : "border-[var(--color-bg-alt)] text-[var(--color-text-body)] hover:bg-[var(--color-bg-alt)]"
                        }`}
                      >
                        🚫 Journée entière
                      </button>
                      <button
                        onClick={() => setBlockType("partial")}
                        className={`flex-1 py-2 text-xs font-medium rounded-md border transition cursor-pointer ${
                          blockType === "partial"
                            ? "bg-amber-50 border-amber-300 text-amber-700"
                            : "border-[var(--color-bg-alt)] text-[var(--color-text-body)] hover:bg-[var(--color-bg-alt)]"
                        }`}
                      >
                        ⏱ Créneau précis
                      </button>
                    </div>
                  </div>

                  {blockType === "partial" && (
                    <div className="flex gap-3">
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-xs font-medium text-[var(--color-text-body)]">De</label>
                        <input type="time" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} className="input" />
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-xs font-medium text-[var(--color-text-body)]">À</label>
                        <input type="time" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} className="input" />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[var(--color-text-body)]">
                      Raison <span className="text-[var(--color-text-body)]/60">(optionnel)</span>
                    </label>
                    <input
                      type="text"
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="Congé, RDV médical…"
                      className="input"
                    />
                  </div>

                  {blockError && <p className="text-sm text-red-600">{blockError}</p>}

                  <div className="flex justify-end gap-3 pt-1">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md text-[var(--color-text-body)] hover:bg-[var(--color-bg-alt)] transition cursor-pointer">
                      Annuler
                    </button>
                    <button
                      onClick={handleBlock}
                      disabled={submitting}
                      className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? "Blocage..." : "Confirmer le blocage"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
