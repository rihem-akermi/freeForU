"use client";

import { useState, useEffect } from "react";
import {
  addReservation,
  deleteReservation,
  updateReservation,
} from "@/lib/api/reservations";
import { searchClients, ClientSearchResult } from "@/lib/api/users";
import { searchAgents, AgentSearchResult } from "@/lib/api/agents";
import { Toast } from "@/components/Toast";
import { Reservation } from "@/lib/data";
import {
  Button,
  Input,
  Select,
  Textarea,
  Badge,
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
  "annulee",
] as const;

const STATUS_BADGE_MAP: Record<
  string,
  "warning" | "success" | "neutral" | "danger"
> = {
  en_attente: "warning",
  confirmee: "success",
  terminee: "neutral",
  annulee: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  terminee: "Terminée",
  annulee: "Annulée",
};

type NewReservationForm = {
  clientId: number;
  agentId: number;
  dateReservation: string;
  heureReservation: string;
  customRequest: string;
  clientName: string;
  agentName: string;
};

const emptyNewReservation: NewReservationForm = {
  clientId: 0,
  agentId: 0,
  dateReservation: "",
  heureReservation: "",
  customRequest: "",
  clientName: "",
  agentName: "",
};

type EditableReservation = Partial<
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
    if (!newReservation.dateReservation || !newReservation.heureReservation) {
      setToast({
        message: "Veuillez renseigner une date et une heure.",
        type: "error",
      });
      return;
    }

    if (newReservation.customRequest.trim().length < 2) {
      setToast({
        message: "Veuillez décrire la demande personnalisée.",
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
        customRequest: newReservation.customRequest,
      });
      setReservations((prev) => [created, ...prev]);
      setShowAddForm(false);
      setNewReservation(emptyNewReservation);
      setSelectedClient(null);
      setSelectedAgent(null);
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

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#0B162C]">
            Gestion des Réservations
          </h2>
          <p className="text-xs text-[#393D3A]">
            Consultez, modifiez ou créez des réservations
          </p>
        </div>
        <Button
          variant={showAddForm ? "neutral" : "primary"}
          onClick={() => setShowAddForm((prev) => !prev)}
        >
          {showAddForm ? <IconClose /> : <IconAdd />}
          {showAddForm ? "Annuler" : "Ajouter une réservation"}
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client search */}
            <div className="relative">
              <Input
                label="Client"
                placeholder="Rechercher un client..."
                value={newReservation.clientName}
                onChange={(e) => handleClientSearch(e.target.value)}
              />
              {clients.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white border border-[var(--color-border)] rounded-xl shadow-lg overflow-hidden">
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
                      className="w-full text-left px-4 py-2.5 hover:bg-[#EEECF2]/60 transition text-sm"
                    >
                      <div className="font-semibold text-[#0B162C]">
                        {client.name}
                      </div>
                      <div className="text-xs text-[#393D3A]">
                        {client.phone} · {client.ville}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Agent search */}
            <div className="relative">
              <Input
                label="Agent"
                placeholder="Rechercher un agent..."
                value={newReservation.agentName}
                onChange={(e) => handleAgentSearch(e.target.value)}
              />
              {agents.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white border border-[var(--color-border)] rounded-xl shadow-lg overflow-hidden">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => {
                        setSelectedAgent(agent);
                        setNewReservation((prev) => ({
                          ...prev,
                          agentId: agent.id,
                          agentName: agent.name,
                        }));
                        setAgents([]);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#EEECF2]/60 transition text-sm"
                    >
                      <div className="font-semibold text-[#0B162C]">
                        {agent.name}
                      </div>
                      <div className="text-xs text-[#393D3A]">
                        {agent.phone} · {agent.ville}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Input
              label="Date"
              type="date"
              value={newReservation.dateReservation}
              onChange={(e) =>
                handleAddChange("dateReservation", e.target.value)
              }
            />
            <Input
              label="Heure"
              type="time"
              value={newReservation.heureReservation}
              onChange={(e) =>
                handleAddChange("heureReservation", e.target.value)
              }
            />
          </div>

          <Textarea
            label="Demande personnalisée"
            placeholder="Décrire la demande personnalisée..."
            value={newReservation.customRequest}
            onChange={(e) => handleAddChange("customRequest", e.target.value)}
            className="rounded border px-2 py-1 col-span-2"
            rows={2}
          />

          <div className="flex justify-end">
            <Button variant="accent" onClick={handleAddReservation}>
              <IconCheck /> Enregistrer
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-[#EEECF2]/70 text-[#0B162C] font-bold text-xs uppercase tracking-wider border-b border-[var(--color-border)]">
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
          <tbody className="divide-y divide-[var(--color-border)] text-[#000000]">
            {reservations.map((r) => {
              const isEditing = editingId === r.id;
              const serviceLabel = r.custom_request ?? "⚠️ No Request";
              const hour = r.heure_reservation
                ? new Date(r.heure_reservation).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—";

              return (
                <tr
                  key={r.id}
                  className="hover:bg-[#EEECF2]/30 transition-colors duration-150"
                >
                  <td className="px-5 py-4">
                    <div className="font-semibold text-[#0B162C]">
                      {r.users?.name}
                    </div>
                    <div className="text-xs text-[#393D3A]">
                      {r.users?.phone}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-[#0B162C]">
                      {r.agents?.name}
                    </div>
                    <div className="text-xs text-[#393D3A]">
                      {r.agents?.phone}
                    </div>
                  </td>
                  <td
                    className="px-5 py-4 text-[#393D3A] max-w-[160px] truncate"
                    title={serviceLabel}
                  >
                    {serviceLabel}
                  </td>
                  <td className="px-5 py-4 text-[#393D3A]">
                    {isEditing ? (
                      <input
                        type="date"
                        value={toDateInputValue(
                          editedForm.date_reservation ?? "",
                        )}
                        onChange={(e) =>
                          handleEditChange("date_reservation", e.target.value)
                        }
                        className="px-2 py-1 text-xs border border-[var(--color-border)] rounded-lg bg-[#EEECF2]/60 focus:bg-white outline-none"
                      />
                    ) : (
                      formatDate(r.date_reservation)
                    )}
                  </td>
                  <td className="px-5 py-4 text-[#393D3A]">{hour}</td>
                  <td className="px-5 py-4">
                    {isEditing ? (
                      <select
                        value={editedForm.status ?? "en_attente"}
                        onChange={(e) =>
                          handleEditChange("status", e.target.value)
                        }
                        className="px-2 py-1 text-xs border border-[var(--color-border)] rounded-lg bg-[#EEECF2]/60 focus:bg-white outline-none cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABEL[status]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Badge variant={STATUS_BADGE_MAP[r.status] ?? "neutral"}>
                        {STATUS_LABEL[r.status] ?? r.status}
                      </Badge>
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
  );
}
