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
import {
  Button,
  Input,
  Textarea,
  Card,
  Badge,
  PageHeader,
  IconAdd,
  IconEdit,
  IconDelete,
  IconClose,
} from "@/components/ui/UIComponents";

type PublicationFormState = { titre: string; description: string };
const emptyForm: PublicationFormState = { titre: "", description: "" };

const STATUS_ACCENT: Record<Publication["status"], string> = {
  en_attente: "#C4956A", // warm terracotta
  approuvee: "#2f6f58", // success token color
  rejetee: "#b24b4b", // danger token color
};

function IcoImage({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 16l-5.5-5.5L9 17" />
    </svg>
  );
}
function IcoInfo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 11v5m0-8h.01" />
    </svg>
  );
}

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
    <div className="w-full">
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

      <PageHeader
        title="Mes publications"
        subtitle="Mettez en avant vos réalisations pour attirer de nouveaux clients."
        badge="Espace agent"
        actionSlot={
          <Button variant={showForm ? "neutral" : "primary"} onClick={showForm ? closeForm : openCreateForm}>
            {showForm ? <IconClose /> : <IconAdd />}
            {showForm ? "Annuler" : "Ajouter une publication"}
          </Button>
        }
      />

      {showForm && (
        <Card
          className="mb-8 !p-6 sm:!p-8"
          style={{ borderLeft: "4px solid #7D6E8C" }}
        >
          <h2 className="mb-5 text-sm font-bold uppercase tracking-wide text-foreground">
            {editingId ? "Modifier la publication" : "Nouvelle publication"}
          </h2>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Photo {editingId && "(laisser vide pour garder l'actuelle)"}
                </label>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-accent/40 px-4 py-6 text-center transition hover:border-accent">
                  <IcoImage className="h-6 w-6 text-muted-foreground/50" />
                  <span className="text-xs text-muted-foreground">
                    {photoFile ? photoFile.name : "Cliquez pour choisir une photo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>
              </div>

              {!editingId && (
                <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <IcoInfo className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Votre publication sera visible publiquement après validation
                  par un administrateur.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <Input
                label="Titre"
                value={form.titre}
                onChange={(e) => setForm({ ...form, titre: e.target.value })}
                placeholder="Ex : Rénovation salon"
              />
              <Textarea
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                placeholder="Décrivez le service ou le chantier que vous voulez mettre en avant..."
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button variant="accent" isLoading={saving} onClick={handleSubmit}>
              {editingId ? "Enregistrer les modifications" : "Publier"}
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : publications.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Vous n'avez pas encore publié. Cliquez sur "Ajouter une publication"
          pour commencer.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {publications.map((pub) => {
            const accent = STATUS_ACCENT[pub.status];
            return (
              <Card
                key={pub.id}
                className="group relative flex gap-4 !p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ borderLeft: `4px solid ${accent}` }}
              >
                <div className="absolute right-4 top-4 flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <Button size="sm" variant="outline" onClick={() => openEditForm(pub)}>
                    <IconEdit />
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setDeleteTarget(pub)}>
                    <IconDelete />
                  </Button>
                </div>

                <img
                  src={pub.photo_url}
                  alt=""
                  className="h-24 w-32 shrink-0 rounded-lg object-cover"
                />
                <div className="flex flex-1 flex-col justify-between gap-2 pr-16">
                  <div>
                    <p className="font-semibold text-foreground">{pub.titre}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{pub.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <PublicationStatusBadge status={pub.status} />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(pub.created_at)}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PublicationStatusBadge({ status }: { status: Publication["status"] }) {
  const map: Record<Publication["status"], { label: string; variant: "warning" | "success" | "danger" }> = {
    en_attente: { label: "En attente", variant: "warning" },
    approuvee: { label: "Approuvée", variant: "success" },
    rejetee: { label: "Rejetée", variant: "danger" },
  };
  const s = map[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}