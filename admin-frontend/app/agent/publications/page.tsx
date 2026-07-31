"use client";
import { useEffect, useState } from "react";
import {
  getMyPublications,
  createPublication,
  updatePublication,
  deletePublication,
} from "@/lib/api/publications";
import { Toast } from "@/components/Toast";
import { ConfirmModal } from "@/components/ConfirmModal";
import { formatDate } from "@/lib/utils/formatDate";
import { Publication } from "@/lib/data";

type PublicationFormState = { titre: string; description: string };
const emptyForm: PublicationFormState = { titre: "", description: "" };

export default function MesPublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PublicationFormState>(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Publication | null>(null);

  useEffect(() => {
    loadPublications();
  }, []);

  async function loadPublications() {
    setLoading(true);
    try {
      setPublications(await getMyPublications());
    } catch (err) {
      console.error(err);
      setToast({
        message: "Impossible de charger vos publications.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPhotoFile(null);
    setShowForm(true);
  };

  const openEditForm = (pub: Publication) => {
    setEditingId(pub.id);
    setForm({ titre: pub.titre, description: pub.description });
    setPhotoFile(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.titre.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      const payload = {
        titre: form.titre,
        description: form.description,
        photo: photoFile ?? undefined,
      };

      if (editingId) {
        const updated = await updatePublication(editingId, payload);
        setPublications((prev) =>
          prev.map((p) => (p.id === editingId ? updated : p)),
        );
        setToast({
          message: "Publication modifiée avec succès.",
          type: "success",
        });
      } else {
        const created = await createPublication(payload);
        setPublications((prev) => [created, ...prev]);
        setToast({
          message: "Publication créée avec succès.",
          type: "success",
        });
      }
      closeForm();
    } catch (err) {
      console.error(err);
      setToast({
        message: "Erreur lors de l'enregistrement, réessayez.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePublication(deleteTarget.id);
      setPublications((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setToast({ message: "Publication supprimée.", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Erreur lors de la suppression.", type: "error" });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="max-w-3xl">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmModal
          title="Supprimer cette publication ?"
          message={`"${deleteTarget.titre}" sera définitivement supprimée. Cette action est irréversible.`}
          confirmLabel="Supprimer"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text-dark)]">
          Mes publications
        </h1>
        <button
          onClick={showForm ? closeForm : openCreateForm}
          className="rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-4 py-2 text-sm font-medium transition cursor-pointer"
        >
          {showForm ? "Annuler" : "+ Ajouter une publication"}
        </button>
      </div>

      {showForm && (
        <div className="bg-[var(--color-card)] rounded-xl p-5 mb-6 space-y-4 shadow-sm border border-[var(--color-bg-alt)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-dark)]">
            {editingId ? "Modifier la publication" : "Nouvelle publication"}
          </h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-text-body)]">
              Photo {editingId && "(laisser vide pour garder l'actuelle)"}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              className="input"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-text-body)]">
              Titre
            </label>
            <input
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
              placeholder="Ex : Rénovation salon"
              className="input"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-text-body)]">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              placeholder="Décrivez le service ou le chantier que vous voulez mettre en avant..."
              className="input resize-none"
            />
          </div>

          {!editingId && (
            <p className="text-xs text-[var(--color-text-body)]">
              ⓘ Votre publication sera visible publiquement après validation par
              un administrateur.
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-5 py-2.5 text-sm font-medium transition disabled:opacity-50 cursor-pointer"
          >
            {saving
              ? "Enregistrement..."
              : editingId
                ? "Enregistrer les modifications"
                : "Publier"}
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[var(--color-text-body)]">Chargement...</p>
      ) : (
        <div className="space-y-4">
          {publications.length === 0 && (
            <p className="text-sm text-[var(--color-text-body)]">
              Vous n'avez pas encore publié. Cliquez sur "+ Ajouter une
              publication" pour commencer.
            </p>
          )}

          {publications.map((pub) => (
            <div
              key={pub.id}
              className="relative flex gap-4 bg-white border border-stone-200 rounded-lg p-4"
            >
              <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => openEditForm(pub)}
                    className="text-xs hover:scale-125 transition cursor-pointer"
                  >
                    🖊️
                  </button>

                  <button
                    onClick={() => setDeleteTarget(pub)}
                    className="text-xs hover:scale-125 transition cursor-pointer"
                  >
                    🗑️
                  </button>
                </div>
              <img
                src={pub.photo_url}
                alt=""
                className="w-28 h-20 object-cover rounded-md shrink-0"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-dark)]">
                    {pub.titre}
                  </p>
                  <p className="text-sm text-[var(--color-text-body)] mt-0.5">
                    {pub.description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <PublicationStatusBadge status={pub.status} />
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--color-text-body)]">
                      {formatDate(pub.created_at)}
                    </span>
                    
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PublicationStatusBadge({ status }: { status: Publication["status"] }) {
  const map = {
    en_attente: { label: "En attente", color: "bg-amber-100 text-amber-700" },
    approuvee: {
      label: "Approuvée ✅",
      color: "bg-emerald-100 text-emerald-700",
    },
    rejetee: { label: "Rejetée", color: "bg-red-100 text-red-700" },
  };
  const s = map[status];
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${s.color}`}
    >
      {s.label}
    </span>
  );
}
