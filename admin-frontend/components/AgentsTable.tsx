"use client";

import { Agent, addAgent, deleteAgent, updateAgent } from "@/lib/api/agents";

import { getCategories } from "@/lib/api/categories";

import { useEffect, useState } from "react";

type NewAgentForm = {
  name: string;
  email: string;
  phone: string;
  ville: string;
  password: string;
  category_id: number;
};

type Category = {
  id: number;
  nom: string;
};

export default function AgentsTable({
  initialAgents,
}: {
  initialAgents: Agent[];
}) {
  const [agents, setAgents] = useState(initialAgents);

  const [categories, setCategories] = useState<Category[]>([]);

  const [showAddForm, setShowAddForm] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [editedForm, setEditedForm] = useState<Partial<NewAgentForm>>({});

  const [newAgent, setNewAgent] = useState<NewAgentForm>({
    name: "",
    email: "",
    phone: "",
    ville: "",
    password: "",
    category_id: 0,
  });

  useEffect(() => {
    async function loadCategories() {
      const data = await getCategories();

      setCategories(data);
    }

    loadCategories();
  }, []);

  function handleNewAgentChange(
    field: keyof NewAgentForm,
    value: string | number,
  ) {
    setNewAgent((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleEditedAgentChange(
    field: keyof NewAgentForm,
    value: string | number,
  ) {
    setEditedForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleEditClick(agent: Agent) {
    const category = categories.find((c) => c.id === agent.category_id);

    setEditingId(agent.id);

    setEditedForm({
      name: agent.name,

      email: agent.email,

      phone: agent.phone,

      ville: agent.ville,

      category_id: category?.id,
    });
  }

  async function handleSaveEdit(id: number) {
    const updated = await updateAgent(id, editedForm);

    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === id
          ? {
              ...agent,
              ...updated,
            }
          : agent,
      ),
    );

    setEditingId(null);

    setEditedForm({});
  }

  async function handleDelete(id: number) {
    await deleteAgent(id);

    setAgents((prev) => prev.filter((agent) => agent.id !== id));
  }

  async function handleAddAgent() {
    const created = await addAgent(newAgent);

    setAgents((prev) => [...prev, created]);

    setShowAddForm(false);

    setNewAgent({
      name: "",
      email: "",
      phone: "",
      ville: "",
      password: "",
      category_id: 0,
    });
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="cursor-pointer rounded-full bg-stone-900 px-4 py-2 text-white hover:scale-105"
        >
          {showAddForm ? "✖️ Annuler" : "➕ Ajouter un agent"}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg border-2 border-stone-900 bg-stone-50 p-4">
          <input
            placeholder="Nom"
            value={newAgent.name}
            onChange={(e) => handleNewAgentChange("name", e.target.value)}
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

          <select
            value={newAgent.category_id}
            onChange={(e) =>
              handleNewAgentChange("category_id", Number(e.target.value))
            }
            className="rounded border px-2 py-1"
          >
            <option value={0}>Choisir catégorie</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nom}
              </option>
            ))}
          </select>

          <input
            placeholder="Mot de passe"
            type="password"
            value={newAgent.password}
            onChange={(e) => handleNewAgentChange("password", e.target.value)}
            className="rounded border px-2 py-1"
          />

          <button
            onClick={handleAddAgent}
            className="cursor-pointer rounded-full bg-emerald-600 px-4 py-2 text-white hover:scale-105"
          >
            ✅ Enregistrer
          </button>
        </div>
      )}

      <table className="w-full overflow-hidden rounded-lg border border-stone-200 bg-white text-sm">
        <thead className="bg-stone-50 text-left text-stone-500">
          <tr>
            <th className="px-4 py-3 font-normal">ID</th>

            <th className="px-4 py-3 font-normal">Nom</th>

            <th className="px-4 py-3 font-normal">Catégorie</th>

            <th className="px-4 py-3 font-normal">Ville</th>

            <th className="px-4 py-3 font-normal">Email</th>

            <th className="px-4 py-3 font-normal">Téléphone</th>

            <th className="px-4 py-3 font-normal">Action</th>
          </tr>
        </thead>

        <tbody>
          {agents.map((agent) => {
            const isEditing = editingId === agent.id;

            return (
              <tr key={agent.id} className="border-t border-stone-100">
                <td className="px-4 py-3 text-stone-500">{agent.id}</td>

                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      value={editedForm.name ?? ""}
                      onChange={(e) =>
                        handleEditedAgentChange("name", e.target.value)
                      }
                      className="w-full rounded border px-1 py-0.5"
                    />
                  ) : (
                    agent.name
                  )}
                </td>

                <td className="px-4 py-3 text-stone-500">
                  {isEditing ? (
                    <select
                      value={editedForm.category_id ?? 0}
                      onChange={(e) =>
                        handleEditedAgentChange(
                          "category_id",
                          Number(e.target.value),
                        )
                      }
                      className="w-full rounded border px-1 py-0.5"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nom}
                        </option>
                      ))}
                    </select>
                  ) : (
                    categories.find((c) => c.id === agent.category_id)?.nom
                  )}
                </td>

                <td className="px-4 py-3 text-stone-500">
                  {isEditing ? (
                    <input
                      value={editedForm.ville ?? ""}
                      onChange={(e) =>
                        handleEditedAgentChange("ville", e.target.value)
                      }
                      className="w-full rounded border px-1 py-0.5"
                    />
                  ) : (
                    agent.ville
                  )}
                </td>

                <td className="px-4 py-3 text-stone-500">
                  {isEditing ? (
                    <input
                      value={editedForm.email ?? ""}
                      onChange={(e) =>
                        handleEditedAgentChange("email", e.target.value)
                      }
                      className="w-full rounded border px-1 py-0.5"
                    />
                  ) : (
                    agent.email
                  )}
                </td>

                <td className="px-4 py-3 text-stone-500">
                  {isEditing ? (
                    <input
                      value={editedForm.phone ?? ""}
                      onChange={(e) =>
                        handleEditedAgentChange("phone", e.target.value)
                      }
                      className="w-full rounded border px-1 py-0.5"
                    />
                  ) : (
                    agent.phone
                  )}
                </td>

                <td className="px-4 py-3 text-xl">
                  {isEditing ? (
                    <button
                      onClick={() => handleSaveEdit(agent.id)}
                      className="cursor-pointer hover:scale-135"
                    >
                      ✅
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleDelete(agent.id)}
                        className="cursor-pointer hover:scale-135"
                      >
                        🗑️
                      </button>

                      <span> / </span>

                      <button
                        onClick={() => handleEditClick(agent)}
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
