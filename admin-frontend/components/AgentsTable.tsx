'use client'

import { Agent , deleteAgent } from "@/lib/api";
import { useState } from "react";

export default function AgentsTable({initialAgents} : {initialAgents : Agent[]}){
    
    const [agents , setAgents] = useState(initialAgents)
    

    async function handleDelete(id:string){
        await deleteAgent(id)
        setAgents((prev)=>{
            return(
                prev.filter((agent)=>{
                    return (agent.id !== id )
                })
            )
        })
    }

      return (
        <div>
          <table className="w-full overflow-hidden rounded-lg border border-stone-200 bg-white text-sm">
            <thead className="bg-stone-50 text-left text-stone-500">
              <tr>
                <th className="px-4 py-3 font-normal">Nom</th>
                <th className="px-4 py-3 font-normal">Catégorie</th>
                <th className="px-4 py-3 font-normal">Téléphone</th>
                <th className="px-4 py-3 font-normal">Ville</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Delete ?</th>

              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} className="border-t border-stone-100">
                  <td className="px-4 py-3">{agent.name}</td>
                  <td className="px-4 py-3 text-stone-500">{agent.category}</td>
                  <td className="px-4 py-3 text-stone-500">{agent.phone}</td>
                  <td className="px-4 py-3 text-stone-500">{agent.ville}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        agent.published ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {agent.published ? "Publié" : "Non publié"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                        onClick={() => handleDelete(agent.id)}
                        className="text-red-600 hover:underline"
                    >
                        Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
}