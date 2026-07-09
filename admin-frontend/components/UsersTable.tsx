"use client";

import { useState } from "react";
import { User, addUser, deleteUser, updateUser } from "@/lib/api";

type NewUserForm = Omit<User, "id" | "created_at">;

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
  const [newUser, setNewUser] = useState<NewUserForm>({
    cin: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "CLIENT",
    ville: "",
  });
  const [editedForm, setEditedForm] = useState<Partial<User>>({});

  async function handleDelete(id: number) {
    await deleteUser(id); // 
    setUsers((prev) => prev.filter((user) => user.id !== id));
  }

  function handleNewUserChange(field: keyof NewUserForm, value: string) {
    setNewUser((prev) => ({ ...prev, [field]: value }));
  }

  function handleEditedUserChange(field: keyof User, value: string) {
    setEditedForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleEditClick(user: User) {
    setEditingId(user.id);
    setEditedForm({
      cin: user.cin,
      name: user.name,
      email: user.email,
      phone: user.phone,
      ville: user.ville,
      role: user.role,
    });
  }

  async function handleSaveEdit(id: number) {
    const updated = await updateUser(id, editedForm);
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, ...updated } : user))
    );
    setEditingId(null);
    setEditedForm({});
  }

  async function handleAddUser() {
    const created = await addUser(newUser);
    setUsers((prev) => [...prev, created]);
    setShowAddForm(false);
    setNewUser({
      cin: "",
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "CLIENT",
      ville: "",
    });
      }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="cursor-pointer rounded-full bg-stone-900 px-4 py-2 text-white hover:scale-105"
        >
          {showAddForm ? "✖️ Annuler" : "➕ Ajouter un utilisateur"}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg border-2 border-stone-900 bg-stone-50 p-4">
          <input
            placeholder="CIN"
            value={newUser.cin}
            onChange={(e) => handleNewUserChange("cin", e.target.value)}
            className="rounded border px-2 py-1"
          />
          <input
            placeholder="Nom"
            value={newUser.name}
            onChange={(e) => handleNewUserChange("name", e.target.value)}
            className="rounded border px-2 py-1"
          />
          <input
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => handleNewUserChange("email", e.target.value)}
            className="rounded border px-2 py-1"
          />
          <input
            placeholder="Téléphone"
            value={newUser.phone}
            onChange={(e) => handleNewUserChange("phone", e.target.value)}
            className="rounded border px-2 py-1"
          />
          <input
            placeholder="Mot de passe"
            type="password"
            value={newUser.password}
            onChange={(e) => handleNewUserChange("password", e.target.value)}
            className="rounded border px-2 py-1"
          />
          <input
            placeholder="Ville"
            value={newUser.ville}
            onChange={(e) => handleNewUserChange("ville", e.target.value)}
            className="rounded border px-2 py-1"
          />
          <select
            value={newUser.role}
            onChange={(e) => handleNewUserChange("role", e.target.value)}
            className="rounded border px-2 py-1"
          >
            <option value="CLIENT">CLIENT</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <button
            onClick={handleAddUser}
            className="cursor-pointer rounded-full bg-emerald-600 px-4 py-2 text-white hover:scale-105"
          >
            ✅ Enregistrer
          </button>
        </div>
      )}

      <table className="w-full overflow-hidden rounded-lg border border-stone-200 bg-white text-sm">
        <thead className="bg-stone-50 text-left text-stone-500">
          <tr>
            <th className="px-4 py-3 font-normal">CIN</th>
            <th className="px-4 py-3 font-normal">Nom</th>
            <th className="px-4 py-3 font-normal">Email</th>
            <th className="px-4 py-3 font-normal">Téléphone</th>
            <th className="px-4 py-3 font-normal">Ville</th>
            <th className="px-4 py-3 font-normal">Rôle</th>
            <th className="px-4 py-3 font-normal">Inscrit le</th>
            <th className="px-4 py-3 font-normal">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isEditing = editingId === user.id;

            return (
              <tr key={user.id} className="border-t border-stone-100">
                <td className="px-4 py-3 text-stone-500">
                  {isEditing ? (
                    <input
                      autoFocus
                      placeholder={user.cin}
                      value={editedForm.cin ?? ""}
                      onChange={(e) => handleEditedUserChange("cin", e.target.value)}
                      className="w-full rounded border px-1 py-0.5"
                    />
                  ) : (
                    user.cin
                  )}
                </td>
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
          
                      value={editedForm.name ?? ""}
                      onChange={(e) => handleEditedUserChange("name", e.target.value)}
                      className="w-full rounded border px-1 py-0.5"
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td className="px-4 py-3 text-stone-500">
                  {isEditing ? (
                    <input
                      value={editedForm.email ?? ""}
                      onChange={(e) => handleEditedUserChange("email", e.target.value)}
                      className="w-full rounded border px-1 py-0.5"
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td className="px-4 py-3 text-stone-500">
                  {isEditing ? (
                    <input
                      value={editedForm.phone ?? ""}
                      onChange={(e) => handleEditedUserChange("phone", e.target.value)}
                      className="w-full rounded border px-1 py-0.5"
                    />
                  ) : (
                    user.phone
                  )}
                </td>
                <td className="px-4 py-3 text-stone-500">
                  {isEditing ? (
                    <input
                      value={editedForm.ville ?? ""}
                      onChange={(e) => handleEditedUserChange("ville", e.target.value)}
                      className="w-full rounded border px-1 py-0.5"
                    />
                  ) : (
                    user.ville
                  )}
                </td>
                <td className="px-4 py-3 text-stone-500">
                  {isEditing ? (
                    <select
                      value={editedForm.role ?? "CLIENT"}
                      onChange={(e) => handleEditedUserChange("role", e.target.value)}
                      className="w-full rounded border px-1 py-0.5"
                    >
                      <option value="CLIENT">CLIENT</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td className="px-4 py-3 text-stone-500">{formatDate(user.created_at)}</td>
                <td className="px-4 py-3 text-xl">
                  {isEditing ? (
                    <button
                      onClick={() => handleSaveEdit(user.id)}
                      className="cursor-pointer hover:scale-135"
                    >
                      ✅
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="cursor-pointer hover:scale-135"
                      >
                        🗑️
                      </button>
                      <span> / </span>
                      <button
                        onClick={() => handleEditClick(user)}
                        className="cursor-pointer hover:scale-135"
                      >
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
