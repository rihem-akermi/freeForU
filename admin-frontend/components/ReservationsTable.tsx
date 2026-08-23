"use client";

import { useState, useEffect } from "react";
import {
  addReservation,
  deleteReservation,
  updateReservation,
} from "@/lib/api/reservations";
import { getServicesByAgent } from "@/lib/api/services";
import { searchClients, ClientSearchResult } from "@/lib/api/users";
import { searchAgents, AgentSearchResult } from "@/lib/api/agents";
import { Toast } from "@/components/Toast";
import { Reservation, Service } from "@/lib/data";
import {
  Button,
  Input,
  Select,
  Textarea,
  Badge,
  PageHeader,
  IconAdd,
  IconEdit,
  IconDelete,
  IconCheck,
  IconClose,
} from "@/components/ui/UIComponents";

const STATUS_OPTIONS = [
  "en_attente",
  "confirmee",
  "terminee",
  "rejetee",
  "annulee",
  "expiree",
] as const;

const STATUS_BADGE_MAP: Record<
  string,
  "warning" | "success" | "neutral" | "danger"
> = {
  en_attente: "warning",
  confirmee: "success",
  terminee: "neutral",
  rejetee: "danger",
  annulee: "danger",
  expiree: "neutral",
};

const STATUS_LABEL: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  terminee: "Terminée",
  rejetee: "Rejetée",
  annulee: "Annulée",
  expiree: "Expirée",
};

/* Row tints now pull from the app's actual semantic tokens instead of
   arbitrary Tailwind defaults (amber/violet/sky/stone), so the meaning
   (pending/confirmed/done/rejected/expired) stays functional while the
   colors stay within the established palette. */
const ROW_STYLE: Record<string, string> = {
  en_attente: "bg-[var(--color-warning-soft)] hover:brightness-[.97]",
  confirmee: "bg-accent/[0.08] hover:bg-accent/[0.13]",
  terminee: "bg-[var(--color-info-soft)] hover:brightness-[.97]",
  rejetee: "bg-[var(--color-danger-soft)] hover:brightness-[.97]",
  annulee: "bg-[var(--color-danger-soft)] hover:brightness-[.97]",
  expiree: "bg-muted hover:bg-muted/70",
};

const STATUS_TEXT: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  terminee: "Terminée",
  rejetee: "Rejetée",
  annulee: "Annulée",
  expiree: "Expirée",
};

type NewReservationForm = {
  clientId: number;
  agentId: number;
  serviceId: number;
  dateReservation: string;
  heureReservation: string;
  heureFinReservation: string;
  customRequest: string;
  clientName: string;
  agentName: string;
};

const emptyNewReservation: NewReservationForm = {
  clientId: 0,
  agentId: 0,
  serviceId: 0,
  dateReservation: "",
  heureReservation: "",
  heureFinReservation: "",
  customRequest: "",
  clientName: "",
  agentName: "",
};

type EditableReservation = Partial <
  Pick<Reservation, "status" | "date_reservation">
>;

function toDateInputValue(value: string) {
  if (!value) return "";
  return value.length >= 10 ? value.slice(0, 10) : value;
}

function formatDate(dateValue: string) {
  const date = new Date(dateValue);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function ReservationsPage({
  initialReservations,
}: {
  initialReservations: Reservation[];
}) {
  const [clients, setClients] = useState<ClientSearchResult[]>([]);
  const [agents, setAgents] = useState<AgentSearchResult[]>([]);
  const [selectedClient, setSelectedClient] =
    useState<ClientSearchResult | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentSearchResult | null>(
    null,
  );
  const [agentServices, setAgentServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [reservations, setReservations] = useState(initialReservations);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedForm, setEditedForm] = useState<EditableReservation>({});
  const [newReservation, setNewReservation] =
    useState<NewReservationForm>(emptyNewReservation);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [requestMode, setRequestMode] = useState<"service" | "custom">(
    "service",
  );

  const [showArchived, setShowArchived] = useState(false);
  const visibleReservations = reservations.filter((r) =>
    showArchived ? true : !r.archived,
  );

  // Dès qu'un agent est choisi, on charge ses services disponibles
  useEffect(() => {
    if (!selectedAgent) {
      setAgentServices([]);
      return;
    }
    setLoadingServices(true);
    getServicesByAgent(selectedAgent.id)
      .then(setAgentServices)
      .catch(console.error)
      .finally(() => setLoadingServices(false));
  }, [selectedAgent]);

  async function handleClientSearch(value: string) {
    handleAddChange("clientName", value);
    const result = await searchClients(value);
    setClients(result);
  }

  async function handleAgentSearch(value: string) {
    handleAddChange("agentName", value);
    const result = await searchAgents(value);
    setAgents(result);
  }

  async function handleDelete(id: number) {
    try {
      await deleteReservation(id);
      setReservations((prev) => prev.filter((res) => res.id !== id));
      setToast({ message: "Réservation supprimée.", type: "success" });
    } catch (error: any) {
      setToast({
        message:
          error?.response?.data?.message ?? "Erreur lors de la suppression.",
        type: "error",
      });
    }
  }

  function handleAddChange(field: keyof NewReservationForm, value: string) {
    if (field === "serviceId") {
      setNewReservation((prev) => ({ ...prev, serviceId: Number(value) }));
      return;
    }
    setNewReservation((prev) => ({ ...prev, [field]: value }));
  }

  function handleEditChange(field: keyof EditableReservation, value: string) {
    setEditedForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleEditClick(reservation: Reservation) {
    setEditingId(reservation.id);
    setEditedForm({
      status: reservation.status,
      date_reservation: toDateInputValue(reservation.date_reservation),
    });
  }

  async function handleSaveEdit(id: number) {
    try {
      const updated = await updateReservation(id, editedForm);
      setReservations((prev) =>
        prev.map((res) => (res.id === id ? { ...res, ...updated } : res)),
      );
      setEditingId(null);
      setEditedForm({});
      setToast({ message: "Réservation modifiée.", type: "success" });
    } catch (error: any) {
      setToast({
        message:
          error?.response?.data?.message ?? "Erreur lors de la modification.",
        type: "error",
      });
    }
  }

  async function handleAddReservation() {
    if (!selectedClient || !selectedAgent) {
      setToast({
        message: "Veuillez choisir un client et un agent dans la liste.",
        type: "error",
      });
      return;
    }
    if (requestMode === "service" && !newReservation.serviceId) {
      setToast({
        message: "Veuillez choisir un service pour cet agent.",
        type: "error",
      });
      return;
    }
    if (
      requestMode === "custom" &&
      newReservation.customRequest.trim().length < 5
    ) {
      setToast({
        message: "Décrivez la demande personnalisée (5 caractères minimum).",
        type: "error",
      });
      return;
    }
    if (!newReservation.dateReservation || !newReservation.heureReservation) {
      setToast({
        message: "Veuillez renseigner une date et une heure de début.",
        type: "error",
      });
      return;
    }
    if (
      newReservation.heureFinReservation &&
      newReservation.heureFinReservation <= newReservation.heureReservation
    ) {
      setToast({
        message: "L'heure de fin doit être après l'heure de début.",
        type: "error",
      });
      return;
    }

    try {
      const created = await addReservation({
        clientId: selectedClient.id,
        agentId: selectedAgent.id,
        dateReservation: newReservation.dateReservation,
        heureReservation: newReservation.heureReservation,
        heureFinReservation: newReservation.heureFinReservation || undefined,
        serviceId:
          requestMode === "service" ? newReservation.serviceId : undefined,
        customRequest:
          requestMode === "custom" ? newReservation.customRequest : undefined,
      });
      setReservations((prev) => [created, ...prev]);
      setShowAddForm(false);
      setNewReservation(emptyNewReservation);
      setSelectedClient(null);
      setSelectedAgent(null);
      setAgentServices([]);
      setRequestMode("service");
      setToast({ message: "Réservation créée avec succès.", type: "success" });
    } catch (error: any) {
      setToast({
        message:
          error?.response?.data?.message ?? "Cette réservation est invalide.",
        type: "error",
      });
    }
  }

  return (
    <div className="w-full">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <PageHeader
        title="Gestion des réservations"
        subtitle="Consultez, modifiez ou créez des réservations."
        badge="Administration"
        actionSlot={
          <div className="flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-muted-foreground">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="cursor-pointer accent-accent"
              />
              Afficher les archivées
            </label>
            <Button
              variant={showAddForm ? "neutral" : "primary"}
              onClick={() => setShowAddForm((prev) => !prev)}
            >
              {showAddForm ? <IconClose /> : <IconAdd />}
              {showAddForm ? "Annuler" : "Ajouter une réservation"}
            </Button>
          </div>
        }
      />

      {showAddForm && (
        <div className="mb-6 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="relative">
              <Input
                label="Client"
                placeholder="Rechercher un client..."
                value={newReservation.clientName}
                onChange={(e) => handleClientSearch(e.target.value)}
              />
              {clients.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                  {clients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => {
                        setSelectedClient(client);
                        setNewReservation((prev) => ({
                          ...prev,
                          clientId: client.id,
                          clientName: client.name,
                        }));
                        setClients([]);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm transition hover:bg-accent/[0.08]"
                    >
                      <div className="font-semibold text-foreground">
                        {client.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {client.phone} · {client.ville}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <Input
                label="Agent"
                placeholder="Rechercher un agent..."
                value={newReservation.agentName}
                onChange={(e) => handleAgentSearch(e.target.value)}
              />
              {agents.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => {
                        setSelectedAgent(agent);
                        setNewReservation((prev) => ({
                          ...prev,
                          agentId: agent.id,
                          agentName: agent.name,
                          serviceId: 0, // reset le service quand on change d'agent
                        }));
                        setAgents([]);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm transition hover:bg-accent/[0.08]"
                    >
                      <div className="font-semibold text-foreground">
                        {agent.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {agent.phone} · {agent.ville}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sélection du service — visible seulement une fois l'agent choisi */}

            <Input
              label="Heure de début"
              type="time"
              value={newReservation.heureReservation}
              onChange={(e) =>
                handleAddChange("heureReservation", e.target.value)
              }
            />
            <Input
              label="Heure de fin"
              type="time"
              value={newReservation.heureFinReservation}
              onChange={(e) =>
                handleAddChange("heureFinReservation", e.target.value)
              }
            />
          </div>

          <Input
            label="Date"
            type="date"
            value={newReservation.dateReservation}
            onChange={(e) => handleAddChange("dateReservation", e.target.value)}
          />

          <div className="col-span-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={requestMode === "service" ? "primary" : "outline"}
              onClick={() => setRequestMode("service")}
            >
              Service précis
            </Button>
            <Button
              type="button"
              size="sm"
              variant={requestMode === "custom" ? "primary" : "outline"}
              onClick={() => setRequestMode("custom")}
            >
              Demande personnalisée
            </Button>
          </div>

          {requestMode === "service" && selectedAgent && (
            <Select
              label="Service"
              value={String(newReservation.serviceId)}
              onChange={(e) => handleAddChange("serviceId", e.target.value)}
            >
              <option value="0">
                {loadingServices ? "Chargement..." : "-- Choisir un service --"}
              </option>
              {agentServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nom} ({s.type_prix === "a_partir_de" ? "à partir de " : ""}
                  {s.prix} DT)
                </option>
              ))}
            </Select>
          )}

          {requestMode === "custom" && (
            <Textarea
              label="Demande personnalisée"
              placeholder="Décrire la demande du client..."
              value={newReservation.customRequest}
              onChange={(e) => handleAddChange("customRequest", e.target.value)}
              className="col-span-2"
              rows={2}
            />
          )}

          <div className="flex justify-end">
            <Button variant="accent" onClick={handleAddReservation}>
              <IconCheck /> Enregistrer
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b-2 border-accent/25 bg-accent/[0.07] text-xs font-bold uppercase tracking-wider text-primary">
              <tr>
                <th className="px-5 py-4">Client</th>
                <th className="px-5 py-4">Agent</th>
                <th className="px-5 py-4">Service</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Heure</th>
                <th className="px-5 py-4">Statut</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {visibleReservations.map((r) => {
                const isEditing = editingId === r.id;
                const hour = r.heure_reservation
                  ? new Date(r.heure_reservation).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—";
                const hourFin = r.heure_fin_reservation
                  ? new Date(r.heure_fin_reservation).toLocaleTimeString(
                      "fr-FR",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )
                  : null;

                return (
                  <tr
                    key={r.id}
                    className={`transition-colors duration-150 ${ROW_STYLE[r.status] ?? ""} ${r.archived ? "opacity-60" : ""}`}
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground">
                        {r.users?.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {r.users?.phone}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground">
                        {r.agents?.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {r.agents?.phone}
                      </div>
                    </td>
                    <td className="max-w-[180px] px-5 py-4 text-muted-foreground">
                      {r.service_nom ? (
                        <>
                          <div
                            className="truncate font-medium text-foreground"
                            title={r.service_nom}
                          >
                            {r.service_nom}
                          </div>
                          {r.custom_request && (
                            <div
                              className="truncate text-xs"
                              title={r.custom_request}
                            >
                              {r.custom_request}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="truncate" title={r.custom_request ?? ""}>
                          {r.custom_request ?? "Aucune demande"}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {isEditing ? (
                        <input
                          type="date"
                          value={toDateInputValue(
                            editedForm.date_reservation ?? "",
                          )}
                          onChange={(e) =>
                            handleEditChange("date_reservation", e.target.value)
                          }
                          className="rounded-lg border border-border bg-muted/60 px-2 py-1 text-xs outline-none focus:bg-card"
                        />
                      ) : (
                        formatDate(r.date_reservation)
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {hour}
                      {hourFin && ` → ${hourFin}`}
                    </td>
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <select
                          value={editedForm.status ?? "en_attente"}
                          onChange={(e) =>
                            handleEditChange("status", e.target.value)
                          }
                          className="cursor-pointer rounded-lg border border-border bg-muted/60 px-2 py-1 text-xs outline-none focus:bg-card"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABEL[status]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Badge variant={STATUS_BADGE_MAP[r.status] ?? "neutral"}>
                            {STATUS_TEXT[r.status] ?? r.status}
                          </Badge>
                          {r.archived && (
                            <Badge variant="neutral">Archivée</Badge>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="accent"
                            onClick={() => handleSaveEdit(r.id)}
                          >
                            <IconCheck /> Valider
                          </Button>
                          <Button
                            size="sm"
                            variant="neutral"
                            onClick={() => {
                              setEditingId(null);
                              setEditedForm({});
                            }}
                          >
                            <IconClose />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(r)}
                          >
                            <IconEdit />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(r.id)}
                          >
                            <IconDelete />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}