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
  IconClose,
} from "@/components/ui/UIComponents";
import { generateService } from "@/lib/api/ai";
import { AiSuggestionModal } from "./AiSuggestionModal";

import { Service } from "@/lib/data";
import { AiRawInputModal } from "./AiRawInputModal";

const FORM_ACCENT = "#7D6E8C"; // soft violet, matching "Profil professionnel" on the Infos page
const SERVICE_ACCENT = "#46607D"; // soft navy

type ServiceFormState = {
  nom: string;
  description: string;
  typePrix: "fixe" | "a_partir_de";
  prix: string;
  dureeEstimee: string;
};

const emptyForm: ServiceFormState = {
  nom: "",
  description: "",
  typePrix: "fixe",
  prix: "",
  dureeEstimee: "",
};

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ServiceFormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAiInput, setShowAiInput] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    nom: string;
    description: string;
  } | null>(null);

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

  const handleGenerateFromRaw = async (rawInput: string) => {
    try {
      setGenerating(true);
      const result = await generateService(rawInput);
      setAiSuggestion(result);
      setShowAiInput(false);
    } catch (err: any) {
      setToast({
        message: err?.response?.data?.message || "La génération a échoué.",
        type: "error",
      });
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
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

      closeForm();
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
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteService(id);
      setToast({ message: "Service supprimé", type: "success" });
      setConfirmDeleteId(null);
      // Si on supprime le service en cours d'édition, on ferme le formulaire
      if (editingId === id) closeForm();
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

      {/* Barre d'action : bouton Ajouter / Annuler */}
      <div className="flex justify-end">
        <Button
          variant={showForm ? "neutral" : "primary"}
          onClick={showForm ? closeForm : openCreateForm}
        >
          {showForm ? <IconClose /> : <IconAdd />}
          {showForm ? "Annuler" : "Ajouter un service"}
        </Button>
      </div>

      {showForm && (
        <Card
          className="!p-6 sm:!p-8"
          style={{ borderLeft: `4px solid ${FORM_ACCENT}` }}
        >
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-foreground">
              {editingId ? "Modifier le service" : "Ajouter un service"}
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAiInput(true)}
            >
              ✨ Nom et Description avec l'IA
            </Button>
          </div>

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
            <Button variant="neutral" onClick={closeForm}>
              Annuler
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : services.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Vous n'avez pas encore ajouté de service. Cliquez sur "Ajouter un
          service" pour commencer.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {services.map((s) => (
            <Card
              key={s.id}
              className="group relative flex flex-col gap-3 !p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
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

      {showAiInput && (
        <AiRawInputModal
          title="Générer un service avec l'IA"
          placeholder="Ex : je fais des brushings et colorations à domicile, environ 1h"
          loading={generating}
          onSubmit={handleGenerateFromRaw}
          onCancel={() => setShowAiInput(false)}
        />
      )}

      {aiSuggestion && (
        <AiSuggestionModal
          title="Suggestion IA pour votre service"
          fields={[
            { key: "nom", label: "Nom du service", value: aiSuggestion.nom },
            {
              key: "description",
              label: "Description",
              value: aiSuggestion.description,
              multiline: true,
            },
          ]}
          onCancel={() => setAiSuggestion(null)}
          onAccept={(values) => {
            setForm((f) => ({
              ...f,
              nom: values.nom,
              description: values.description,
            }));
            setAiSuggestion(null);
          }}
        />
      )}
    </div>
  );
}