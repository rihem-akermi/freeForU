"use client";
import { useEffect, useState } from "react";
import {
  getMyOffers,
  createOffer,
  updateOffer,
  deleteOffer,
} from "@/lib/api/offers";
import { Toast } from "@/components/Toast";
import { Offer } from "@/lib/data";
import { formatDate } from "@/lib/utils/formatDate";
import { ConfirmModal } from "@/components/ConfirmModal";

type OfferFormState = {
  title: string;
  description: string;
  min_price: string;
  max_price: string;
};

const emptyForm: OfferFormState = {
  title: "",
  description: "",
  min_price: "",
  max_price: "",
};

export default function MesOffresPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<OfferFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Offer | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    loadOffers();
  }, []);

  async function loadOffers() {
    setLoading(true);
    try {
      const data = await getMyOffers();
      setOffers(data);
    } catch (err) {
      console.error(err);
      setToast({ message: "Impossible de charger vos offres.", type: "error" });
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

  const openEditForm = (offer: Offer) => {
    setEditingId(offer.id);
    setForm({
      title: offer.title,
      description: offer.description,
      min_price: offer.min_price ? String(Number(offer.min_price)) : "",
      max_price: offer.max_price ? String(Number(offer.max_price)) : "",
    });
    setPhotoFile(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        min_price: form.min_price ? Number(form.min_price) : undefined,
        max_price: form.max_price ? Number(form.max_price) : undefined,
        photo: photoFile ?? undefined,
      };

      if (editingId) {
        const updated = await updateOffer(editingId, payload);
        setOffers((prev) =>
          prev.map((o) => (o.id === editingId ? updated : o)),
        );
        setToast({ message: "Offre modifiée avec succès.", type: "success" });
      } else {
        const created = await createOffer(payload);
        setOffers((prev) => [created, ...prev]);
        setToast({ message: "Offre créée avec succès.", type: "success" });
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

  const handlePublish = async () => {
    if (!title.trim() || !description.trim()) return;
    setPublishing(true);
    try {
      const newOffer = await createOffer({
        title,
        description,
        min_price: minPrice ? Number(minPrice) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
        photo: photoFile ?? undefined,
      });
      setOffers((prev) => [newOffer, ...prev]);
      setTitle("");
      setDescription("");
      setMinPrice("");
      setMaxPrice("");
      setPhotoFile(null);
      setShowForm(false);
      setToast({ message: "Offre créée avec succès.", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({
        message: "Erreur lors de la création, réessayez.",
        type: "error",
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleToggleActive = async (offer: Offer) => {
    try {
      const updated = await updateOffer(offer.id, { active: !offer.active });
      setOffers((prev) => prev.map((o) => (o.id === offer.id ? updated : o)));
    } catch (err) {
      console.error(err);
      setToast({ message: "Erreur lors de la mise à jour.", type: "error" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteOffer(deleteTarget.id);
      setOffers((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      setToast({ message: "Offre supprimée.", type: "success" });
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
          title="Supprimer cette offre ?"
          message={`"${deleteTarget.title}" sera définitivement supprimée. Cette action est irréversible.`}
          confirmLabel="Supprimer"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text-dark)]">
          Mes offres
        </h1>
        <button
          onClick={showForm ? closeForm : openCreateForm}
          className="rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-4 py-2 text-sm font-medium transition cursor-pointer"
        >
          {showForm ? "Annuler" : "+ Ajouter une offre"}
        </button>
      </div>

      {showForm && (
        <div className="bg-[var(--color-card)] rounded-xl p-5 mb-6 space-y-4 shadow-sm border border-[var(--color-bg-alt)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-dark)]">
            {editingId ? "Modifier l'offre" : "Nouvelle offre"}
          </h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-text-body)]">
              Photo de couverture{" "}
              {editingId && "(laisser vide pour garder l'actuelle)"}
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
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex : Peinture intérieure"
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
              placeholder="Décrivez ce service..."
              className="input resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-text-body)]">
                Prix min (optionnel)
              </label>
              <input
                type="number"
                min="0"
                value={form.min_price}
                onChange={(e) =>
                  setForm({ ...form, min_price: e.target.value })
                }
                className="input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-text-body)]">
                Prix max (optionnel)
              </label>
              <input
                type="number"
                min="0"
                value={form.max_price}
                onChange={(e) =>
                  setForm({ ...form, max_price: e.target.value })
                }
                className="input"
              />
            </div>
          </div>

          {!editingId && (
            <p className="text-xs text-[var(--color-text-body)]">
              ⓘ Votre offre sera visible publiquement après validation par un
              administrateur.
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
                : "Créer l'offre"}
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[var(--color-text-body)]">Chargement...</p>
      ) : (
        <div className="space-y-4">
          {offers.length === 0 && (
            <p className="text-sm text-[var(--color-text-body)]">
              Vous n'avez pas encore d'offre. Cliquez sur "+ Ajouter une offre"
              pour commencer.
            </p>
          )}

          {offers.map((offer) => (
            <div
              key={offer.id}
              className="relative flex gap-4 bg-white border border-stone-200 rounded-lg p-4"
            >
              <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => openEditForm(offer)}
                    className="text-xs hover:scale-125 transition cursor-pointer"
                  >
                    🖊️
                  </button>

                  <button
                    onClick={() => setDeleteTarget(offer)}
                    className="text-xs hover:scale-125 transition cursor-pointer"
                  >
                    🗑️
                  </button>
                </div>
              {offer.cover_image && (
                <img
                  src={offer.cover_image}
                  alt=""
                  className="w-28 h-20 object-cover rounded-md shrink-0"
                />
              )}
              <div className="flex-1 flex flex-col justify-between">
                
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-dark)]">
                    {offer.title}
                  </p>
                  
                  <p className="text-sm text-[var(--color-text-body)] mt-0.5">
                    {offer.description}
                  </p>
                  {(offer.min_price || offer.max_price) && (
                    <p className="text-xs text-[var(--color-primary)] font-medium mt-1">
                      {offer.min_price ? `${Number(offer.min_price)} DT` : ""}
                      {offer.min_price && offer.max_price ? " – " : ""}
                      {offer.max_price ? `${Number(offer.max_price)} DT` : ""}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <OfferStatusBadge status={offer.status} />
                    <button
                      onClick={() => handleToggleActive(offer)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition cursor-pointer ${
                        offer.active
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                      }`}
                    >
                      {offer.active ? "Active" : "En pause"}
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--color-text-body)]">
                      {formatDate(offer.created_at)}
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

function OfferStatusBadge({ status }: { status: Offer["status"] }) {
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
