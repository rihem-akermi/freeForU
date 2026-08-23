"use client";

import { useState } from "react";
import { Category } from "@/lib/data";
import {
  deleteCategory,
  updateCategory,
  addCategory,
} from "@/lib/api/categories";
import { Toast } from "@/components/Toast";
import {
  Button,
  Input,
  PageHeader,
  IconAdd,
  IconEdit,
  IconDelete,
  IconCheck,
  IconClose,
} from "@/components/ui/UIComponents";

export default function CategoriesTable({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [categories, setCategories] = useState(initialCategories);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedName, setEditedName] = useState("");

  const [newCategory, setNewCategory] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  async function handleDelete(id: number) {
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((category) => category.id !== id));
      setToast({
        message: "Catégorie supprimée avec succès.",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      const message =
        (err as any)?.response?.data?.message ??
        "Erreur lors de la suppression.";
      setToast({ message, type: "error" });
    }
  }

  function handleEditClick(category: Category) {
    setEditingId(category.id);
    setEditedName(category.name);
  }

  async function handleSave(id: number) {
    try {
      await updateCategory(id, { name: editedName });

      setCategories((prev) =>
        prev.map((category) =>
          category.id === id ? { ...category, name: editedName } : category,
        ),
      );

      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la modification.");
    }
  }

  async function handleAdd() {
    if (!newCategory.trim()) return;

    try {
      const category = await addCategory({ name: newCategory });

      setCategories((prev) => [...prev, category]);

      setNewCategory("");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout.");
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
        title="Gestion des catégories"
        subtitle="Consultez, modifiez ou ajoutez des catégories de services."
        badge="Administration"
      />

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            label="Nouvelle catégorie"
            placeholder="Ex : Plomberie"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </div>
        <Button variant="accent" onClick={handleAdd}>
          <IconAdd /> Ajouter
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b-2 border-accent/25 bg-accent/[0.07] text-xs font-bold uppercase tracking-wider text-primary">
              <tr>
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">Nom</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {categories.map((category) => {
                const isEditing = editingId === category.id;

                return (
                  <tr
                    key={category.id}
                    className="transition-colors duration-150 hover:bg-accent/[0.05]"
                  >
                    <td className="px-5 py-4 text-xs font-semibold text-accent-dark">
                      #{category.id}
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      {isEditing ? (
                        <input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="w-full rounded-lg border border-border bg-muted/60 px-2 py-1 text-xs outline-none focus:bg-card"
                        />
                      ) : (
                        category.name
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="accent"
                            onClick={() => handleSave(category.id)}
                          >
                            <IconCheck /> Valider
                          </Button>
                          <Button
                            size="sm"
                            variant="neutral"
                            onClick={() => setEditingId(null)}
                          >
                            <IconClose />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(category)}
                          >
                            <IconEdit />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(category.id)}
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