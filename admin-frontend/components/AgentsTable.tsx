'use client'

import { Agent ,addAgent, deleteAgent, updateAgent } from "@/lib/api/agents";
import { useState } from "react";

type NewAgentForm = Omit<Agent, "id" | "role">;


export default function AgentsTable({initialAgents} : {initialAgents : Agent[]}){
    
    const [agents , setAgents] = useState(initialAgents)
    
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedForm, setEditedForm] = useState<Partial<Agent>>({});

    const [showAddForm, setShowAddForm] = useState(false);
    const [newAgent, setNewAgent] = useState<NewAgentForm>({
        cin: "",
        name: "",
        category: "",
        email: "",
        phone: "",
        password: "",
        ville: "",
        published: false,
      });

    function handleTheInputToEditChange(field : string , value: string) {
    setEditedForm((prev) => ({ ...prev, [field] : value }));
    // with [] : if field : name -> name: "Ali"
    // without [] : ->   field: "Ali"
  }

  async function handleSaveEdit(id: number) {
  try {
    const updated = await updateAgent(id, editedForm);
    setAgents((prev) =>
      prev.map((agent) => (agent.id === id ? { ...agent, ...updated } : agent))
    );
    setEditingId(null);
    setEditedForm({});
  } catch (error) {
    alert("UPDATE IS ⚠️");
  }
}
    
  function handleEditClick(agent: Agent) {
      setEditingId(agent.id);
      setEditedForm({
        name: agent.name,
        category: agent.category,
        email: agent.email,
        phone: agent.phone,
        ville: agent.ville,
      });
    }  

  function handleEditKeyDown(e: React.KeyboardEvent, id: number) {
    if (e.key === "Enter") {
      handleSaveEdit(id);
    }
    
  }

    async function handleDelete(id:number ){
        await deleteAgent(id)
        setAgents((prev)=>{
            return(
                prev.filter((agent)=>{
                    return (agent.id !== id )
                })
            )
        })
    }

    async function handleStatus(id : number , published : boolean){
      await updateAgent(id, {published : !published}) //partial 
      setAgents((prev) => {
        return (
          prev.map((agent)=>{
            if(id === agent.id){
              return {...agent , published : !agent.published}
            }
            else {
              return agent
            }
          }))})
        }

      
      function handleNewAgentChange(field: keyof NewAgentForm, value: string) {
        setNewAgent((prev) => ({ ...prev, [field]: value }));
        //keyof lezem ykoun field existe dans NewAgentForm
      }

      async function handleSaveToAddAgent() {
        const created = await addAgent(newAgent);
        setAgents((prev) => [...prev, created]);
        setShowAddForm(false);
        setNewAgent({
          cin: "",
          name: "",
          category: "",
          phone: "",
          email: "",
          password: "",
          ville: "",
          published: false,
        });
      }

      return (
        <div>

          <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="rounded-full bg-stone-900 px-4 py-2 text-white hover:scale-105 cursor-pointer"
          >
            {showAddForm ? "✖️ Annuler" : "➕ Ajouter un agent"}
          </button>
          </div>

           {showAddForm && (
          <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg border-2 border-stone-900 bg-stone-50 p-4">
            <input
              placeholder="CIN"
              value={newAgent.cin}
              onChange={(e) => handleNewAgentChange("cin", e.target.value)}
              className="rounded border px-2 py-1"
            />
            <input
              placeholder="Nom et Prenom"
              value={newAgent.name}
              onChange={(e) => handleNewAgentChange("name", e.target.value)}
              className="rounded border px-2 py-1"
            />
            <input
              placeholder="Categorie"
              value={newAgent.category}
              onChange={(e) => handleNewAgentChange("category", e.target.value)}
              className="rounded border px-2 py-1"
            />
            <input
              placeholder="Email"
              value={newAgent.email}
              onChange={(e) => handleNewAgentChange("email", e.target.value)}
              className="rounded border px-2 py-1"
            />
            <input
              placeholder="Téléphone"
              value={newAgent.phone}
              onChange={(e) => handleNewAgentChange("phone", e.target.value)}
              className="rounded border px-2 py-1"
            />
            <input
              placeholder="Ville"
              value={newAgent.ville}
              onChange={(e) => handleNewAgentChange("ville", e.target.value)}
              className="rounded border px-2 py-1"
            />
            <input
              placeholder="Mot de passe"
              value={newAgent.password}
              onChange={(e) => handleNewAgentChange("password", e.target.value)}
              className="rounded border px-2 py-1"
            />
            <button
              onClick={handleSaveToAddAgent}
              className="rounded-full bg-emerald-600 px-4 py-2 text-white hover:scale-105 cursor-pointer"
            >
              ✅ Enregistrer
            </button>

          </div>
           )}

          <table className="w-full overflow-hidden rounded-lg border-2 border-stone-900 bg-white text-sm">
            <thead className="bg-stone-50 text-left text-stone-500">
              <tr>
                <th className="px-4 py-3 font-normal">Nom</th>
                <th className="px-4 py-3 font-normal">CIN</th>
                <th className="px-4 py-3 font-normal">Categorie</th>
                <th className="px-4 py-3 font-normal">Email</th>
                <th className="px-4 py-3 font-normal">Téléphone</th>
                <th className="px-4 py-3 font-normal">Ville</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Action</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => {
                const isTheAgentToEdit = (editingId === agent.id)

                return (
                <tr key={agent.id} className="border-t border-stone-100">
                  <td className="px-4 py-3">
                  {isTheAgentToEdit ? (
                    <input
                      autoFocus
                      value={editedForm.name ?? ""}
                      onChange={(e) => handleTheInputToEditChange("name", e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, agent.id)}
                      className="w-full rounded border px-1 py-0.5"
                    />
                  ) : (
                    agent.name
                  )}
                </td>

                <td className="px-4 py-3 text-stone-500">
                  {isTheAgentToEdit ? (
                    <input
                      value={editedForm.cin ?? ""}
                      onChange={(e) => handleTheInputToEditChange("cin", e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, agent.id)}
                      className="w-full rounded border px-1 py-0.5"
                    />
                  ) : (
                    agent.cin
                  )}
                </td>

                <td className="px-4 py-3 text-stone-500">
                  {isTheAgentToEdit ? (
                    <input
                      value={editedForm.category ?? ""}
                      onChange={(e) => handleTheInputToEditChange("category", e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, agent.id)}
                      className="w-full rounded border px-1 py-0.5"
                    />
                  ) : (
                    agent.category
                  )}
                </td>

                <td className="px-4 py-3 text-stone-500">
                  {isTheAgentToEdit ? (
                    <input
                      value={editedForm.email ?? ""}
                      onChange={(e) => handleTheInputToEditChange("email", e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, agent.id)}
                      className="w-full rounded border px-1 py-0.5"
                    />
                  ) : (
                    agent.email
                  )}
                </td>

                <td className="px-4 py-3 text-stone-500">
                  {isTheAgentToEdit ? (
                    <input
                      value={editedForm.phone ?? ""}
                      onChange={(e) => handleTheInputToEditChange("phone", e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, agent.id)}
                      className="w-full rounded border px-1 py-0.5"
                    />
                  ) : (
                    agent.phone
                  )}
                </td>

                <td className="px-4 py-3 text-stone-500">
                  {isTheAgentToEdit ? (
                    <input
                      value={editedForm.ville ?? ""}
                      onChange={(e) => handleTheInputToEditChange("ville", e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, agent.id)}
                      className="w-full rounded border px-1 py-0.5"
                    />
                  ) : (
                    agent.ville
                  )}
                </td>

                <td className="px-4 py-3">
                  <button
                    className={`rounded-full px-2 py-1 text-xs border-2 border-b-emerald-950 hover:scale-110 cursor-pointer ${
                      agent.published ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-600 "
                    }`}
                    onClick={() => handleStatus(agent.id, agent.published)}
                  >
                    {agent.published ? "Publié" : "Non publié"}
                  </button>
                </td>

                <td className="text-xl px-4 py-3">
                  <button onClick={() => handleDelete(agent.id)} className="hover:scale-135 cursor-pointer">
                    🗑️
                  </button>
                  <span> / </span>
                  <button onClick={() => handleEditClick(agent)} className="hover:scale-135 cursor-pointer">
                    🖋️
                  </button>
                </td>
              </tr>
              )})}
            </tbody>
          </table>
        </div>
      )
}