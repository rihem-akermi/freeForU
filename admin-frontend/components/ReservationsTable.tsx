'use client'

import { useState } from "react";
import { Reservation, addReservation, deleteReservation, updateReservation } from "@/lib/api/reservations";

import { searchClients, ClientSearchResult } from "@/lib/api/users";
import { searchAgents, AgentSearchResult } from "@/lib/api/agents";

const STATUS_OPTIONS = ["EN_ATTENTE", "CONFIRMEE", "ANNULEE"] as const;

type NewReservationForm = {
  clientId: string;
  agentId: string;
  dateReservation: string;

  clientName: string;
  agentName: string;
};

type EditableReservation = Partial<Pick<Reservation, "status" | "date_reservation">>;

function toDateInputValue(value: string) {
  if (!value) {
    return "";
  }

  return value.length >= 10 ? value.slice(0, 10) : value;
}

function formatDate(dateValue: string) {
  const date = new Date(dateValue);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export default function ReservationsPage({ initialReservations }: { initialReservations: Reservation[] }) {
  const [clients, setClients] = useState<ClientSearchResult[]>([]);
  const [agents, setAgents] = useState<AgentSearchResult[]>([]);

  const [selectedClient, setSelectedClient] = useState<ClientSearchResult | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentSearchResult | null>(null);
  
  
  const [reservations, setReservations] = useState(initialReservations);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedForm, setEditedForm] = useState<EditableReservation>({});
  const [newReservation, setNewReservation] = useState<NewReservationForm>({
    clientId: "",
    agentId: "",
    dateReservation: "",

    clientName: "",
    agentName: ""
  });

  async function handleClientSearch(value:string){

  handleAddChange("clientName", value);

  const result = await searchClients(value);

  setClients(result);
}


  async function handleAgentSearch(value:string){

  handleAddChange("agentName", value);

  const result = await searchAgents(value);

  setAgents(result);
}

  async function handleDelete(id: string) {
    await deleteReservation(id);
    setReservations((prev) => prev.filter((res) => res.id !== id));
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

  async function handleSaveEdit(id: string) {
    const updated = await updateReservation(id, editedForm);
    setReservations((prev) => prev.map((res) => (res.id === id ? { ...res, ...updated } : res)));
    setEditingId(null);
    setEditedForm({});
  }

  async function handleAddReservation() {
    try {
      if(!selectedClient || !selectedAgent){
        alert("Veuillez choisir un client et un agent dans la liste");
        return;
     }
      const created = await addReservation({
        clientId:selectedClient.id,
        agentId:selectedAgent.id,
        dateReservation:newReservation.dateReservation
        });
      setReservations((prev) => [created, ...prev]);
      setShowAddForm(false);
      setNewReservation({ clientId: "", agentId: "", dateReservation: "" , clientName: "",  agentName: ""});
    } catch (error: any) {
      alert(error?.response?.data?.message ?? "Cette personne n'existe pas ou la réservation est invalide.");
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="cursor-pointer rounded-full bg-stone-900 px-4 py-2 text-white hover:scale-105"
        >
          {showAddForm ? "✖️ Annuler" : "➕ Ajouter une réservation"}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg border-2 border-stone-900 bg-stone-50 p-4">
          <div className="relative">
          <input
              placeholder="Nom du client"
              value={newReservation.clientName}
              onChange={(e)=>handleClientSearch(e.target.value)}
              className="rounded border px-2 py-1"
          />
              {clients.length > 0 && (    
                  <div className="absolute z-10 w-full bg-white border">
                      {clients.map(client=>(
                          <div
                              key={client.id}
                              onClick={()=>{
                                  setSelectedClient(client);
                                  setNewReservation(prev=>({
                                      ...prev,
                                      clientId:client.id,
                                      clientName:client.name
                                  }));
                                  setClients([]);
                              }}
                              className="cursor-pointer p-2 hover:bg-stone-100"
                          >
                              <div>
                                  {client.name}
                              </div>
                              <div className="text-sm text-stone-500">
                                  📞 {client.phone} - 📍 {client.ville}
                              </div>
                          </div>
                          )
                      )}
                  </div>
              )
              }
          </div>

          
          <div className="relative">

            <input
            placeholder="Nom de l'agent"
            value={newReservation.agentName}
            onChange={(e)=>handleAgentSearch(e.target.value)}
            className="rounded border px-2 py-1"
            />
            {agents.length > 0 && (

              <div className="absolute z-10 w-full bg-white border">
                {agents.map(agent=>(
                  <div
                    key={agent.id}
                    onClick={()=>{
                      setSelectedAgent(agent);
                      setNewReservation(prev=>({
                      ...prev,
                      agentId:agent.id,
                      agentName:agent.name
                      }));
                      setAgents([]);
                    }}

                    className="cursor-pointer p-2 hover:bg-stone-100"
                  >

                  <div>{agent.name}</div>

                  <div className="text-sm text-stone-500">
                  📞 {agent.phone} - 📍 {agent.ville}
                  </div>

                  </div>
                ))}
                  </div>
                )}
          </div>

                              
          <input
            type="date"
            value={newReservation.dateReservation}
            onChange={(e) => handleAddChange("dateReservation", e.target.value)}
            className="rounded border px-2 py-1"
          />
          <button
            onClick={handleAddReservation}
            className="cursor-pointer rounded-full bg-emerald-600 px-4 py-2 text-white hover:scale-105"
          >
            ✅ Enregistrer
          </button>
        </div>
      )}

      <table className="w-full overflow-hidden rounded-lg border border-stone-200 bg-white text-sm">
        <thead className="bg-stone-50 text-left text-stone-500">
          <tr>
            <th className="px-4 py-3 font-normal">ID client</th>
            <th className="px-4 py-3 font-normal">Client</th>
            <th className="px-4 py-3 font-normal">ID agent</th>
            <th className="px-4 py-3 font-normal">Agent</th>
            <th className="px-4 py-3 font-normal">Date</th>
            <th className="px-4 py-3 font-normal">Status</th>
            <th className="px-4 py-3 font-normal">Action</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => {
            const isEditing = editingId === r.id;

            return (
              <tr key={r.id} className="border-t border-stone-100">
                <td className="px-4 py-3 text-stone-500">{r.client_id}</td>
                <td className="px-4 py-3">{r.client_name}</td>
                <td className="px-4 py-3 text-stone-500">{r.agent_id}</td>
                <td className="px-4 py-3">{r.agent_name}</td>
                <td className="px-4 py-3 text-stone-500">
                  {isEditing ? (
                    <input
                      type="date"
                      value={toDateInputValue(editedForm.date_reservation ?? "")}
                      onChange={(e) => handleEditChange("date_reservation", e.target.value)}
                      className="rounded border px-1 py-0.5"
                    />
                  ) : (
                    formatDate(r.date_reservation)
                  )}
                </td>
                <td className="px-4 py-3">
                  {isEditing ? (
                    <select
                      value={editedForm.status ?? "EN_ATTENTE"}
                      onChange={(e) => handleEditChange("status", e.target.value)}
                      className="rounded border px-1 py-0.5"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  ) : (
                    r.status
                  )}
                </td>
                <td className="px-4 py-3 text-xl">
                  {isEditing ? (
                    <button onClick={() => handleSaveEdit(r.id)} className="cursor-pointer hover:scale-135">
                      ✅
                    </button>
                  ) : (
                    <>
                      <button onClick={() => handleDelete(r.id)} className="cursor-pointer hover:scale-135">
                        🗑️
                      </button>
                      <span> / </span>
                      <button onClick={() => handleEditClick(r)} className="cursor-pointer hover:scale-135">
                        🖋️
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
