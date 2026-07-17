// app/agent/publications/page.tsx
'use client'
import { useState } from "react";

type Publication = {
  id: number;
  photo_url: string;
  description: string;
  status: "en_attente" | "approuvee" | "rejetee";
  created_at: string;
};

// Mock — sera remplacé par un fetch GET /agent/publications
const mockPublications: Publication[] = [
  {
    id: 1,
    photo_url: "https://placehold.co/300x200",
    description: "Installation complète de sanitaires pour salle de bain neuve, devis gratuit sur place.",
    status: "approuvee",
    created_at: "2026-07-02",
  },
  {
    id: 2,
    photo_url: "https://placehold.co/300x200",
    description: "Réparation urgente de fuite d'eau, disponible 7j/7 dans la région de Sfax.",
    status: "en_attente",
    created_at: "2026-07-10",
  },
  {
    id: 3,
    photo_url: "https://placehold.co/300x200",
    description: "Rénovation complète de tuyauterie ancienne, matériaux inclus.",
    status: "rejetee",
    created_at: "2026-06-28",
  },
];

export default function MesPublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>(mockPublications);
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handlePublish = () => {
    if (!description.trim()) return;

    // Mock — sera remplacé par POST /agent/publications
    const newPub: Publication = {
      id: Date.now(),
      photo_url: photoFile ? URL.createObjectURL(photoFile) : "https://placehold.co/300x200",
      description,
      status: "en_attente",
      created_at: new Date().toISOString().slice(0, 10),
    };

    setPublications((prev) => [newPub, ...prev]);
    setDescription("");
    setPhotoFile(null);
    setShowForm(false);
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text-dark)]">
          Mes publications
        </h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-4 py-2 text-sm font-medium transition"
        >
          {showForm ? "Annuler" : "+ Ajouter une publication"}
        </button>
      </div>

      {/* --- Formulaire d'ajout --- */}
      {showForm && (
        <div className="bg-[var(--color-card)] rounded-lg p-5 mb-6 space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--color-text-body)]">
              Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              className="input"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--color-text-body)]">
              Description / mise à jour de votre travail
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Décrivez le service ou le chantier que vous voulez mettre en avant..."
              className="input resize-none"
            />
          </div>

          <p className="text-xs text-[var(--color-text-body)]">
            ⓘ Votre publication sera visible publiquement après validation par un administrateur.
          </p>

          <button
            onClick={handlePublish}
            className="rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-5 py-2.5 text-sm font-medium transition"
          >
            Publier
          </button>
        </div>
      )}

      {/* --- Historique --- */}
      <div className="space-y-4">
        {publications.length === 0 && (
          <p className="text-sm text-[var(--color-text-body)]">
            Vous n'avez pas encore publié. Cliquez sur "+ Ajouter une publication" pour commencer.
          </p>
        )}

        {publications.map((pub) => (
          <div key={pub.id} className="flex gap-4 bg-white border border-stone-200 rounded-lg p-4">
            <img
              src={pub.photo_url}
              alt=""
              className="w-28 h-20 object-cover rounded-md shrink-0"
            />
            <div className="flex-1 flex flex-col justify-between">
              <p className="text-sm text-[var(--color-text-dark)]">{pub.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-[var(--color-text-body)]">{pub.created_at}</span>
                <PublicationStatusBadge status={pub.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PublicationStatusBadge({ status }: { status: Publication["status"] }) {
  const map = {
    en_attente: { label: "En attente", color: "bg-amber-100 text-amber-700" },
    approuvee: { label: "Approuvée ✅", color: "bg-emerald-100 text-emerald-700" },
    rejetee: { label: "Rejetée", color: "bg-red-100 text-red-700" },
  };
  const s = map[status];
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${s.color}`}>
      {s.label}
    </span>
  );
}