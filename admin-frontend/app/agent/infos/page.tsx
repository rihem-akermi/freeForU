// app/agent/infos/page.tsx
"use client";
import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "@/lib/api/agents";
import { getCategories } from "@/lib/api/categories";
import type { Agent, Category } from "@/lib/data";

import { Toast } from "@/components/Toast";

export default function MesInfosPage() {
  const [profile, setProfile] = useState<Agent | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileData, categoriesData] = await Promise.all([
          getMyProfile(),
          getCategories(),
        ]);
        setProfile(profileData);
        setPhotoPreview(profileData.photo_url ?? null);
        setCategories(categoriesData);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger votre profil.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleChange = (field: string, value: string | number) => {
    setProfile((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSocialChange = (platform: string, value: string) => {
    setProfile((prev) =>
      prev
        ? { ...prev, social_links: { ...prev.social_links, [platform]: value } }
        : prev,
    );
  };

  const handleSubmit = async () => {
    if (!profile) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updateMyProfile(
        {
          name: profile.name,
          phone: profile.phone,
          ville: profile.ville,
          category_id: profile.category_id,
          bio: profile.bio,
          zone: profile.zone,
          service_mode: profile.service_mode,
          age: profile.age ? Number(profile.age) : undefined,
          sexe: profile.sexe,
          experience_years: profile.experience_years
            ? Number(profile.experience_years)
            : undefined,
          social_links: profile.social_links,
        },
        photoFile ?? undefined,
      );
      setProfile(updated);
      setPhotoFile(null);
      setToast({ message: "Profil updated ✅", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({
        message: "❌ Erreur, réessayez.",
        type: "error",
      });

      setError("Erreur lors de l'enregistrement, réessayez.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-[var(--color-text-body)]">Chargement...</p>
    );
  }

  if (!profile) {
    return (
      <p className="text-sm text-red-600">{error || "Profil introuvable."}</p>
    );
  }

  return (
    <div className="max-w-3xl">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h1 className="text-2xl font-semibold text-[var(--color-text-dark)] mb-1">
        Mes Infos
      </h1>
      <p className="text-sm text-[var(--color-text-body)] mb-6">
        Gérez vos informations personnelles et professionnelles.
      </p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <Section title="Infos de base">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <label
              htmlFor="photo-upload"
              className="cursor-pointer group relative block"
            >
              <div className="w-28 h-28 rounded-full overflow-hidden bg-[var(--color-bg-alt)] border-2 border-dashed border-[var(--color-primary)]/40 flex items-center justify-center group-hover:border-[var(--color-primary)] transition">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Photo de profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-10 h-10 text-[var(--color-text-body)]/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs group-hover:bg-[var(--color-primary-dark)] transition">
                ✎
              </div>
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <span className="text-xs text-[var(--color-text-body)]">
              Photo de profil
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
            <Field label="Nom complet">
              <input
                value={profile.name ?? ""}
                onChange={(e) => handleChange("name", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Téléphone">
              <input
                value={profile.phone ?? ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Email">
              <input
                value={profile.email ?? ""}
                disabled
                className="input opacity-60 cursor-not-allowed"
              />
            </Field>
            <Field label="Ville">
              <input
                value={profile.ville ?? ""}
                onChange={(e) => handleChange("ville", e.target.value)}
                className="input"
              />
            </Field>
          </div>
        </div>
      </Section>

      <Section title="Profil professionnel">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Catégorie">
            <select
              value={profile.category_id ?? ""}
              onChange={(e) =>
                handleChange("category_id", Number(e.target.value))
              }
              className="input"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Zone géographique d'intervention">
            <input
              value={profile.zone ?? ""}
              onChange={(e) => handleChange("zone", e.target.value)}
              placeholder="Ex : Sfax"
              className="input"
            />
          </Field>
          <Field label="Années d'expérience">
            <input
              type="number"
              min="0"
              value={profile.experience_years ?? ""}
              onChange={(e) => handleChange("experience_years", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Mode de service">
            <div className="flex gap-3 mt-1">
              {[
                { value: "se_deplace", label: "Je me déplace" },
                { value: "recoit", label: "Je reçois" },
                { value: "les_deux", label: "Les deux" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border cursor-pointer transition ${
                    profile.service_mode === opt.value
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      : "border-[var(--color-bg-alt)] text-[var(--color-text-body)] hover:border-[var(--color-primary)]/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="service_mode"
                    checked={profile.service_mode === opt.value}
                    onChange={() => handleChange("service_mode", opt.value)}
                    className="hidden"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </Field>
        </div>

        <Field label="Description / bio courte">
          <textarea
            value={profile.bio ?? ""}
            onChange={(e) => handleChange("bio", e.target.value)}
            rows={3}
            placeholder="Présentez-vous en quelques mots..."
            className="input resize-none"
          />
        </Field>
      </Section>

      <Section title="Infos personnelles">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Âge">
            <input
              type="number"
              min="0"
              value={profile.age ?? ""}
              onChange={(e) => handleChange("age", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Sexe">
            <select
              value={profile.sexe ?? ""}
              onChange={(e) => handleChange("sexe", e.target.value)}
              className="input"
            >
              <option value="">Préférer ne pas dire</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
            </select>
          </Field>
          <Field label="Facebook">
            <input
              value={profile.social_links?.facebook ?? ""}
              onChange={(e) => handleSocialChange("facebook", e.target.value)}
              placeholder="https://facebook.com/..."
              className="input"
            />
          </Field>
          <Field label="Instagram">
            <input
              value={profile.social_links?.instagram ?? ""}
              onChange={(e) => handleSocialChange("instagram", e.target.value)}
              placeholder="https://instagram.com/..."
              className="input"
            />
          </Field>
        </div>
      </Section>

      <Section title="Vérification">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FileDropZone label="Carte d'identité" disabled />
          <FileDropZone label="Certificat / attestation" disabled accept="image/*,.pdf" />
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-[var(--color-text-body)]">
            ⓘ L'upload de ces documents sera activé prochainement.
          </p>
          <StatusBadge status={profile.verification_status ?? "non_verifie"} />
        </div>
      </Section>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="mt-2 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-6 py-2.5 text-sm font-medium transition disabled:opacity-50"
      >
        {saving ? "Enregistrement..." : "Enregistrer les modifications"}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-card)] rounded-xl p-5 mb-5 shadow-sm border border-[var(--color-bg-alt)]">
      <h2 className="text-sm font-semibold text-[var(--color-text-dark)] mb-4 uppercase tracking-wide">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[var(--color-text-body)]">{label}</label>
      {children}
    </div>
  );

}


function FileDropZone({
  label,
  disabled = false,
  accept = "image/*",
}: {
  label: string;
  disabled?: boolean;
  accept?: string;
}) {
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[var(--color-text-body)]">{label}</label>
      <label
        className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-6 text-center transition ${
          disabled
            ? "border-[var(--color-bg-alt)] bg-[var(--color-bg-alt)]/40 cursor-not-allowed opacity-60"
            : "border-[var(--color-primary)]/40 hover:border-[var(--color-primary)] cursor-pointer"
        }`}
      >
        <svg className="w-6 h-6 text-[var(--color-text-body)]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <span className="text-xs text-[var(--color-text-body)]">
          {fileName ?? "Cliquez pour choisir un fichier"}
        </span>
        <input
          type="file"
          accept={accept}
          disabled={disabled}
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          className="hidden"
        />
      </label>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    non_verifie: { label: "Non vérifié", color: "bg-stone-200 text-stone-600" },
    en_attente: { label: "En attente", color: "bg-amber-100 text-amber-700" },
    verifie: { label: "Vérifié ✅", color: "bg-emerald-100 text-emerald-700" },
    rejete: { label: "Rejeté", color: "bg-red-100 text-red-700" },
  };
  const s = map[status] ?? map.non_verifie;
  return (
    <span className={`inline-block w-fit rounded-full px-3 py-1 text-xs font-medium ${s.color}`}>
      {s.label}
    </span>
  );
}
