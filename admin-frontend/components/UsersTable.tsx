"use client";

import { useState } from "react";
import { User, addUser, deleteUser, updateUser } from "@/lib/api/users";
import { Toast } from "@/components/Toast";
import {
  Button,
  Input,
  Badge,
  IconAdd,
  IconEdit,
  IconDelete,
  IconCheck,
  IconClose,
} from "@/components/ui/UIComponents";

type NewUserForm = Omit<User, "id" | "created_at" | "role">;
type UserEditableForm = Pick<User, "name" | "email" | "phone" | "ville">;

function formatDate(dateValue: string) {
  const date = new Date(dateValue);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export default function UsersTable({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [newUser, setNewUser] = useState<NewUserForm>({
    name: "",
    email: "",
    phone: "",
    password: "",
    ville: "",
  });

  const [editedForm, setEditedForm] = useState<Partial<UserEditableForm>>({});

  async function handleDelete(id: number) {
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setToast({
        message: "Utilisateur supprimé avec succès.",
        type: "success",
      });
    } catch (err: any) {
      console.error(err);
      const message =
        err?.response?.data?.message ?? "Erreur lors de la suppression.";
      setToast({ message, type: "error" });
    }
  }

  function handleNewUserChange(field: keyof NewUserForm, value: string) {
    setNewUser((prev) => ({ ...prev, [field]: value }));
  }

  function handleEditedUserChange(
    field: keyof UserEditableForm,
    value: string,
  ) {
    setEditedForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleEditClick(user: User) {
    setEditingId(user.id);
    setEditedForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      ville: user.ville,
    });
  }

  async function handleSaveEdit(id: number) {
    const updated = await updateUser(id, editedForm);
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, ...updated } : user)),
    );
    setEditingId(null);
    setEditedForm({});
  }

  async function handleAddUser() {
    const created = await addUser({ ...newUser, role: "CLIENT" });
    setUsers((prev) => [...prev, created]);
    setShowAddForm(false);
    setNewUser({
      name: "",
      email: "",
      phone: "",
      password: "",
      ville: "",
    });
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
          <h2 className="font-serif text-xl font-bold text-[#0B162C]">Gestion des Clients</h2>
          <p className="text-xs text-[#393D3A]">Consultez, modifiez ou ajoutez des utilisateurs</p>
        </div>
        <Button
          variant={showAddForm ? "neutral" : "primary"}
          onClick={() => setShowAddForm((prev) => !prev)}
        >
          {showAddForm ? <IconClose /> : <IconAdd />}
          {showAddForm ? "Annuler" : "Ajouter un utilisateur"}
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
          <Input
            placeholder="Nom complet"
            value={newUser.name}
            onChange={(e) => handleNewUserChange("name", e.target.value)}
          />
          <Input
            placeholder="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => handleNewUserChange("email", e.target.value)}
          />
          <Input
            placeholder="Téléphone"
            value={newUser.phone}
            onChange={(e) => handleNewUserChange("phone", e.target.value)}
          />
          <Input
            placeholder="Mot de passe"
            type="password"
            value={newUser.password}
            onChange={(e) => handleNewUserChange("password", e.target.value)}
          />
          <Input
            placeholder="Ville"
            value={newUser.ville}
            onChange={(e) => handleNewUserChange("ville", e.target.value)}
          />
          <div className="sm:col-span-2 md:col-span-1 flex items-end">
            <Button variant="accent" onClick={handleAddUser} className="w-full">
              <IconCheck /> Enregistrer
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-[#EEECF2]/70 text-[#0B162C] font-bold text-xs uppercase tracking-wider border-b border-[var(--color-border)]">
            <tr>
              <th className="px-5 py-4">ID</th>
              <th className="px-5 py-4">Nom</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Téléphone</th>
              <th className="px-5 py-4">Ville</th>
              <th className="px-5 py-4">Rôle</th>
              <th className="px-5 py-4">Inscrit le</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] text-[#000000]">
            {users.map((user) => {
              const isEditing = editingId === user.id;

              return (
                <tr
                  key={user.id}
                  className="hover:bg-[#EEECF2]/30 transition-colors duration-150"
                >
                  <td className="px-5 py-4 text-xs font-semibold text-[#393D3A]">
                    #{user.id}
                  </td>
                  <td className="px-5 py-4 font-semibold">
                    {isEditing ? (
                      <input
                        value={editedForm.name ?? ""}
                        onChange={(e) =>
                          handleEditedUserChange("name", e.target.value)
                        }
                        className="w-full px-2 py-1 text-xs border border-[var(--color-border)] rounded-lg bg-[#EEECF2]/60 focus:bg-white"
                      />
                    ) : (
                      user.name
                    )}
                  </td>
                  <td className="px-5 py-4 text-[#393D3A]">
                    {isEditing ? (
                      <input
                        value={editedForm.email ?? ""}
                        onChange={(e) =>
                          handleEditedUserChange("email", e.target.value)
                        }
                        className="w-full px-2 py-1 text-xs border border-[var(--color-border)] rounded-lg bg-[#EEECF2]/60 focus:bg-white"
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td className="px-5 py-4 text-[#393D3A]">
                    {isEditing ? (
                      <input
                        value={editedForm.phone ?? ""}
                        onChange={(e) =>
                          handleEditedUserChange("phone", e.target.value)
                        }
                        className="w-full px-2 py-1 text-xs border border-[var(--color-border)] rounded-lg bg-[#EEECF2]/60 focus:bg-white"
                      />
                    ) : (
                      user.phone
                    )}
                  </td>
                  <td className="px-5 py-4 text-[#393D3A]">
                    {isEditing ? (
                      <input
                        value={editedForm.ville ?? ""}
                        onChange={(e) =>
                          handleEditedUserChange("ville", e.target.value)
                        }
                        className="w-full px-2 py-1 text-xs border border-[var(--color-border)] rounded-lg bg-[#EEECF2]/60 focus:bg-white"
                      />
                    ) : (
                      user.ville
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      variant={
                        user.role === "ADMIN"
                          ? "info"
                          : user.role === "AGENT"
                          ? "warning"
                          : "neutral"
                      }
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-xs text-[#393D3A]">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {isEditing ? (
                      <Button
                        size="sm"
                        variant="accent"
                        onClick={() => handleSaveEdit(user.id)}
                      >
                        <IconCheck /> Valider
                      </Button>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(user)}
                        >
                          <IconEdit />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(user.id)}
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
