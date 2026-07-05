"use client";

import { useState } from "react";
import { User, deleteUser } from "@/lib/api";

export default function UsersTable({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers);

  async function handleDelete(id: number) {
   
    await deleteUser(id); // 
    setUsers((prev) => prev.filter((user) => user.id !== id));
  }

  return (
    <table className="w-full overflow-hidden rounded-lg border border-stone-200 bg-white text-sm">
      <thead className="bg-stone-50 text-left text-stone-500">
        <tr>
          <th className="px-4 py-3 font-normal">Nom</th>
          <th className="px-4 py-3 font-normal">Email</th>
          <th className="px-4 py-3 font-normal">Ville</th>
          <th className="px-4 py-3 font-normal">Inscrit le</th>
          <th className="px-4 py-3 font-normal">Delete ?</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} className="border-t border-stone-100">
            <td className="px-4 py-3">{user.name}</td>
            <td className="px-4 py-3 text-stone-500">{user.email}</td>
            <td className="px-4 py-3 text-stone-500">{user.ville}</td>
            <td className="px-4 py-3 text-stone-500">{new Date(user.created_at).toLocaleDateString()}</td>
            <td className="px-4 py-3">
              <button
                onClick={() => handleDelete(user.id)}
                className="text-red-600 hover:underline"
              >
                Supprimer
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
