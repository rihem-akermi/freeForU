// app/components/ServicesManager.tsx
"use client";

import { useEffect, useState } from "react";
import {
  getMyServices,
  createService,
  updateService,
  deleteService,
} from "@/lib/api/services";
import { Toast } from "./Toast";
import { ConfirmModal } from "./ConfirmModal";
import {
  Button,
  Input,
  Select,
  Textarea,
  Card,
  Badge,
  IconAdd,
  IconEdit,
  IconDelete,
} from "@/components/ui/UIComponents";

import { Service } from "@/lib/data";

const FORM_ACCENT = "#7D6E8C"; // soft violet, matching "Profil professionnel" on the Infos page
const SERVICE_ACCENT = "#46607D"; // soft navy

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    nom: "",
    description: "",
    typePrix: "fixe" as "fixe" | "a_partir_de",
    prix: "",
    dureeEstimee: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await getMyServices();
      setServices(data);
    } catch (err: any) {
      setToast({
        message: err?.response?.data?.message || "Erreur de chargement",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const resetForm = () => {
    setForm({
      nom: "",
      description: "",
      typePrix: "fixe",
      prix: "",
      dureeEstimee: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const payload = {
        nom: form.nom,
        description: form.description || undefined,
        typePrix: form.typePrix,
        prix: Number(form.prix),
        dureeEstimee: form.dureeEstimee ? Number(form.dureeEstimee) : undefined,
      };

      if (editingId) {
        await updateService(editingId, payload);
        setToast({ message: "Service mis à jour", type: "success" });
      } else {
        await createService(payload);
        setToast({ message: "Service créé", type: "success" });
      }

      resetForm();
      loadServices();
    } catch (err: any) {
      setToast({
        message:
          err?.response?.data?.message || "Erreur lors de l'enregistrement",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setForm({
      nom: service.nom,
      description: service.description || "",
      typePrix: service.type_prix,
      prix: String(service.prix),
      dureeEstimee: service.duree_estimee ? String(service.duree_estimee) : "",
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteService(id);
      setToast({ message: "Service supprimé", type: "success" });
      setConfirmDeleteId(null);
      loadServices();
    } catch (err: any) {
      setToast({
        message:
          err?.response?.data?.message || "Erreur lors de la suppression",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Card
        className="!p-6 sm:!p-8"
        style={{ borderLeft: `4px solid ${FORM_ACCENT}` }}
      >
        <h3 className="mb-5 font-serif text-lg font-bold text-foreground">
          {editingId ? "Modifier le service" : "Ajouter un service"}
        </h3>

        <div
          className="rounded-xl border bg-background/60 p-5 sm:p-6"
          style={{ borderColor: `${FORM_ACCENT}30` }}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Nom du service"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
            />
            <Select
              label="Type de prix"
              value={form.typePrix}
              onChange={(e) =>
                setForm({
                  ...form,
                  typePrix: e.target.value as "fixe" | "a_partir_de",
                })
              }
            >
              <option value="fixe">Prix fixe</option>
              <option value="a_partir_de">À partir de</option>
            </Select>
            <Input
              label="Prix (DT)"
              type="number"
              value={form.prix}
              onChange={(e) => setForm({ ...form, prix: e.target.value })}
            />
            <Input
              label="Durée estimée (minutes)"
              helperText="Optionnel — surtout pour les services de plus d'1h"
              type="number"
              value={form.dureeEstimee}
              onChange={(e) =>
                setForm({ ...form, dureeEstimee: e.target.value })
              }
            />
          </div>

          <div className="mt-4">
            <Textarea
              label="Description courte"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button
            variant="primary"
            isLoading={submitting}
            onClick={handleSubmit}
          >
            <IconAdd className="h-4 w-4" />
            {editingId ? "Mettre à jour" : "Ajouter"}
          </Button>
          {editingId && (
            <Button variant="neutral" onClick={resetForm}>
              Annuler
            </Button>
          )}
        </div>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : services.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Vous n'avez pas encore ajouté de service.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {services.map((s) => (
            <Card
              key={s.id}
              className="group flex flex-col gap-3 !p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              style={{ borderLeft: `4px solid ${SERVICE_ACCENT}` }}
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-serif font-bold text-foreground">
                  {s.nom}
                </h4>
                <Badge variant="info">
                  {s.type_prix === "a_partir_de"
                    ? `À partir de ${s.prix} DT`
                    : `${s.prix} DT`}
                </Badge>
              </div>
              {s.description && (
                <p className="text-sm text-muted-foreground">{s.description}</p>
              )}
              {s.duree_estimee && (
                <p className="text-xs text-muted-foreground/70">
                  ≈ {s.duree_estimee} min
                </p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(s)}
                >
                  <IconEdit className="h-3.5 w-3.5" />
                  Éditer
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirmDeleteId(s.id)}
                >
                  <IconDelete className="h-3.5 w-3.5" />
                  Supprimer
                </Button>
              </div>

              <div
                className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                style={{
                  background: `linear-gradient(90deg, ${SERVICE_ACCENT}, transparent)`,
                }}
              />
            </Card>
          ))}
        </div>
      )}

      {confirmDeleteId && (
        <ConfirmModal
          title="Supprimer ce service"
          message="Cette action est définitive. Voulez-vous continuer ?"
          confirmLabel="Supprimer"
          onConfirm={() => handleDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
