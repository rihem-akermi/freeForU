"use client";

import { useState } from "react";
import { Contact } from "@/lib/data";
import { deleteContact } from "@/lib/api/contacts";
import { Toast } from "@/components/Toast";
import { Button, PageHeader, IconDelete } from "@/components/ui/UIComponents";

export default function AgentsContacts({
  initialContacts,
}: {
  initialContacts: Contact[];
}) {
  const [contacts, setContacts] = useState(initialContacts);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  async function handleDelete(id: number) {
    try {
      await deleteContact(id);
      setContacts((prev) => prev.filter((contact) => contact.idcontact !== id));
      setToast({ message: "Message supprimé avec succès.", type: "success" });
    } catch (error) {
      console.error(error);
      setToast({ message: "Erreur lors de la suppression.", type: "error" });
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
        title="Messages de contact"
        subtitle="Consultez les messages envoyés via le formulaire de contact."
        badge="Administration"
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b-2 border-accent/25 bg-accent/[0.07] text-xs font-bold uppercase tracking-wider text-primary">
              <tr>
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">Nom</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Message</th>
                <th className="px-5 py-4">Créé le</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {contacts.map((contact) => (
                <tr
                  key={contact.idcontact}
                  className="transition-colors duration-150 hover:bg-accent/[0.05]"
                >
                  <td className="px-5 py-4 text-xs font-semibold text-accent-dark">
                    #{contact.idcontact}
                  </td>
                  <td className="px-5 py-4 font-semibold">{contact.name}</td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {contact.email}
                  </td>
                  <td className="max-w-md px-5 py-4 text-muted-foreground">
                    {contact.message}
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">
                    {new Date(contact.created_at).toLocaleString("en-GB")}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(contact.idcontact)}
                    >
                      <IconDelete />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}