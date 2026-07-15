"use client";

import { useState } from "react";
import { Contact } from "@/lib/data";
import { deleteContact } from "@/lib/api/contacts";

export default function AgentsContacts({
  initialContacts,}: {initialContacts: Contact[];})
{
  console.log("in the client component : " , initialContacts)
  const [contacts, setContacts] = useState(initialContacts);

  async function handleDelete(id: number) {
    try {
      await deleteContact(id);

      setContacts((prev) => prev.filter((contact) => contact.idcontact !== id));
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la suppression.");
    }
  }

  return (
    <table className="w-full overflow-hidden rounded-lg border-2 border-stone-900 bg-white text-sm">
      <thead className="bg-stone-50 text-left text-stone-500">
        <tr>
          <th className="px-4 py-3 font-normal">IdContact</th>
          <th className="px-4 py-3 font-normal">Nom</th>
          <th className="px-4 py-3 font-normal">Email</th>
          <th className="px-4 py-3 font-normal">Message</th>
          <th className="px-4 py-3 font-normal">Créé le</th>
          <th className="px-4 py-3 font-normal">Action</th>
        </tr>
      </thead>

      <tbody>
        {contacts.map((contact) => (
          <tr key={contact.idcontact} className="border-t border-stone-100">
            <td className="px-4 py-3 text-stone-500">
              {contact.idcontact}
            </td>

            <td className="px-4 py-3">
              {contact.name}
            </td>

            <td className="px-4 py-3 text-stone-500">
              {contact.email}
            </td>

            <td className="px-4 py-3 text-stone-500 max-w-md ">
              {contact.message}
            </td>

            <td className="px-4 py-3 text-stone-500">
              {new Date(contact.created_at).toLocaleString("en-GB")}
            </td>

            <td className="px-4 py-3 text-xl">
              <button
                onClick={() => handleDelete(contact.idcontact)}
                className="cursor-pointer hover:scale-125"
              >
                🗑️
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}