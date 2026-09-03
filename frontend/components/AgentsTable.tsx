"use client";

import { Agent, addAgent, deleteAgent, updateAgent } from "@/lib/api/agents";
import { Toast } from "@/components/Toast";
import { getCategories } from "@/lib/api/categories";
import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Select,
  Badge,
  PageHeader,
  IconAdd,
  IconEdit,
  IconDelete,
  IconCheck,
  IconClose,
} from "@/components/ui/UIComponents";

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
  name: string;
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
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
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
    setNewAgent((prev) => ({ ...prev, [field]: value }));
  }

  function handleEditedAgentChange(
    field: keyof NewAgentForm,
    value: string | number,
  ) {
    setEditedForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleEditClick(agent: Agent) {
    const category = categories.find((c) => c.id === agent.categories.id);
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
      prev.map((agent) => (agent.id === id ? { ...agent, ...updated } : agent)),
    );
    setEditingId(null);
    setEditedForm({});
  }

  async function handleDelete(id: number) {
    try {
      await deleteAgent(id);
      setAgents((prev) => prev.filter((agent) => agent.id !== id));
      setToast({ message: "Agent supprimé avec succès.", type: "success" });
    } catch (err: any) {
      console.error(err);
      const message =
        err?.response?.data?.message ?? "Erreur lors de la suppression.";
      setToast({ message, type: "error" });
    }
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
    <div className="w-full">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <PageHeader
        title="Gestion des agents"
        subtitle="Consultez, modifiez ou ajoutez des agents à la plateforme."
        badge="Administration"
        actionSlot={
          <Button
            variant={showAddForm ? "neutral" : "primary"}
            onClick={() => setShowAddForm((prev) => !prev)}
          >
            {showAddForm ? <IconClose /> : <IconAdd />}
            {showAddForm ? "Annuler" : "Ajouter un agent"}
          </Button>
        }
      />

      {showAddForm && (
        <div className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:grid-cols-2 md:grid-cols-3">
          <Input
            placeholder="Nom complet"
            value={newAgent.name}
            onChange={(e) => handleNewAgentChange("name", e.target.value)}
          />
          <Input
            placeholder="Email"
            type="email"
            value={newAgent.email}
            onChange={(e) => handleNewAgentChange("email", e.target.value)}
          />
          <Input
            placeholder="Téléphone"
            value={newAgent.phone}
            onChange={(e) => handleNewAgentChange("phone", e.target.value)}
          />
          <Input
            placeholder="Ville"
            value={newAgent.ville}
            onChange={(e) => handleNewAgentChange("ville", e.target.value)}
          />
          <Input
            placeholder="Mot de passe"
            type="password"
            value={newAgent.password}
            onChange={(e) => handleNewAgentChange("password", e.target.value)}
          />
          <Select
            value={newAgent.category_id}
            onChange={(e) =>
              handleNewAgentChange("category_id", Number(e.target.value))
            }
          >
            <option value={0}>Choisir une catégorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <div className="flex justify-end sm:col-span-2 md:col-span-3">
            <Button variant="accent" onClick={handleAddAgent}>
              <IconCheck /> Enregistrer
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b-2 border-accent/25 bg-accent/[0.07] text-xs font-bold uppercase tracking-wider text-primary">
              <tr>
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">Nom</th>
                <th className="px-5 py-4">Catégorie</th>
                <th className="px-5 py-4">Ville</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Téléphone</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {agents.map((agent) => {
                const isEditing = editingId === agent.id;
                const categoryName = agent.categories?.name ?? null;
                return (
                  <tr
                    key={agent.id}
                    className="transition-colors duration-150 hover:bg-accent/[0.05]"
                  >
                    <td className="px-5 py-4 text-xs font-semibold text-accent-dark">
                      #{agent.id}
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      {isEditing ? (
                        <input
                          value={editedForm.name ?? ""}
                          onChange={(e) =>
                            handleEditedAgentChange("name", e.target.value)
                          }
                          className="w-full rounded-lg border border-border bg-muted/60 px-2 py-1 text-xs outline-none focus:bg-card"
                        />
                      ) : (
                        agent.name
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {isEditing ? (
                        <select
                          value={editedForm.category_id ?? 0}
                          onChange={(e) =>
                            handleEditedAgentChange(
                              "category_id",
                              Number(e.target.value),
                            )
                          }
                          className="w-full cursor-pointer rounded-lg border border-border bg-muted/60 px-2 py-1 text-xs outline-none focus:bg-card"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Badge variant={categoryName ? "info" : "neutral"}>
                          {categoryName ?? "Non catégorisé"}
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {isEditing ? (
                        <input
                          value={editedForm.ville ?? ""}
                          onChange={(e) =>
                            handleEditedAgentChange("ville", e.target.value)
                          }
                          className="w-full rounded-lg border border-border bg-muted/60 px-2 py-1 text-xs outline-none focus:bg-card"
                        />
                      ) : (
                        agent.ville
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {isEditing ? (
                        <input
                          value={editedForm.email ?? ""}
                          onChange={(e) =>
                            handleEditedAgentChange("email", e.target.value)
                          }
                          className="w-full rounded-lg border border-border bg-muted/60 px-2 py-1 text-xs outline-none focus:bg-card"
                        />
                      ) : (
                        agent.email
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {isEditing ? (
                        <input
                          value={editedForm.phone ?? ""}
                          onChange={(e) =>
                            handleEditedAgentChange("phone", e.target.value)
                          }
                          className="w-full rounded-lg border border-border bg-muted/60 px-2 py-1 text-xs outline-none focus:bg-card"
                        />
                      ) : (
                        agent.phone
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="accent"
                            onClick={() => handleSaveEdit(agent.id)}
                          >
                            <IconCheck /> Valider
                          </Button>
                          <Button
                            size="sm"
                            variant="neutral"
                            onClick={() => {
                              setEditingId(null);
                              setEditedForm({});
                            }}
                          >
                            <IconClose />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(agent)}
                          >
                            <IconEdit />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(agent.id)}
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
    </div>
  );
}
