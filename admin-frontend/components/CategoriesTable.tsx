"use client";

import { useState } from "react";
import { Category } from "@/lib/data";
import {
  deleteCategory,
  updateCategory,
  addCategory,
} from "@/lib/api/categories";



export default function CategoriesTable({
  initialCategories,}: {initialCategories: Category[];}) {
  const [categories, setCategories] = useState(initialCategories);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedName, setEditedName] = useState("");

  const [newCategory, setNewCategory] = useState("");

  async function handleDelete(id: number) {
    try {
      console.log("trying to delete category number : ",id)
      await deleteCategory(id);
      setCategories((prev) => prev.filter((category) => category.id !== id));
    } catch (err) {
      console.error(err);
      alert(`Erreur lors de la suppression.
        ⚠️ un agent a cette category (as foreign key)⚠️`);
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
    <div className="space-y-4">
      <table className="w-full overflow-hidden rounded-lg border-2 border-stone-900 bg-white text-sm">
        <thead className="bg-stone-50 text-left text-stone-500">
          <tr>
            <th className="px-4 py-3 font-normal">Id Category</th>
            <th className="px-4 py-3 font-normal">Name</th>
            <th className="px-4 py-3 font-normal">Action</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((category) => (
            <tr key={category.id} className="border-t border-stone-100">
              <td className="px-4 py-3 text-stone-500">{category.id}</td>

              <td className="px-4 py-3">
                {editingId === category.id ? (
                  <input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="rounded border px-2 py-1"
                  />
                ) : (
                  category.name
                )}
              </td>

              <td className="px-4 py-3 text-xl">
                {editingId === category.id ? (
                  <>
                    <button
                      onClick={() => handleSave(category.id)}
                      className="cursor-pointer hover:scale-125"
                    >
                      💾
                    </button>

                    <span> / </span>

                    <button
                      onClick={() => setEditingId(null)}
                      className="cursor-pointer hover:scale-125"
                    >
                      ❌
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="cursor-pointer hover:scale-125"
                    >
                      🗑️
                    </button>

                    <span> / </span>

                    <button
                      onClick={() => handleEditClick(category)}
                      className="cursor-pointer hover:scale-125"
                    >
                      🖋️
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-2">
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category..."
          className="rounded border px-3 py-2"
        />

        <button
          onClick={handleAdd}
          className="rounded bg-stone-900 px-4 py-2 text-white hover:bg-stone-700"
        >
          Add
        </button>
      </div>
    </div>
  );
}
