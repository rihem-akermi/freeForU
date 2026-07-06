'use client'

import { Reservation ,deleteReservation } from "@/lib/api";
import { useState } from "react";

export default function ReservationsPage({initialReservations} : {initialReservations : Reservation[]}) {

    const [reservations ,setReservations] = useState(initialReservations)

    async function handleDelete(id:string ){
          await deleteReservation(id)
          setReservations((prev)=>{
              return(
                  prev.filter((res)=>{
                      return (res.id !== id )
                  })
              )
          })
    }

  return (
    <div>
      <table className="w-full overflow-hidden rounded-lg border border-stone-200 bg-white text-sm">
        <thead className="bg-stone-50 text-left text-stone-500">
          <tr>
            <th className="px-4 py-3 font-normal">Client</th>
            <th className="px-4 py-3 font-normal">Agent</th>
            <th className="px-4 py-3 font-normal">Date</th>
            <th className="px-4 py-3 font-normal">Status</th>
            <th className="px-4 py-3 font-normal">Delete?</th>

          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.id} className="border-t border-stone-100">
              <td className="px-4 py-3">{r.client_name}</td>
              <td className="px-4 py-3">{r.agent_name}</td>
              <td className="px-4 py-3 text-stone-500">{new Date(r.date_reservation).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-stone-100 px-2 py-1 text-xs">{r.status}</span>
              </td>
              <td className="px-4 py-3">
                    <button
                        onClick={() => handleDelete(r.id)}
                        className="text-red-600 hover:underline"
                    >Supprimer
                    </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
