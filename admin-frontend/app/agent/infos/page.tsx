// app/agent/infos/page.tsx
"use client";
import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "@/lib/api/agents";
import { getCategories } from "@/lib/api/categories";
import type { Agent, Category } from "@/lib/data";

import { Toast } from "@/components/Toast";
import WorkingHoursEditor from "@/components/WorkingHoursEditor";
import {
  Button,
  Input,
  Select,
  Textarea,
  Card,
  Badge,
  PageHeader,
} from "@/components/ui/UIComponents";

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
          category_id: profile.categories.id,
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
      setToast({ message: "Profil mis à jour ✅", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "❌ Erreur, réessayez.", type: "error" });
      setError("Erreur lors de l'enregistrement, réessayez.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-[#393D3A]">Chargement...</p>;
  }

  if (!profile) {
    return <p className="text-sm text-rose-600">{error || "Profil introuvable."}</p>;
  }

  return (
    <div className="max-w-3xl">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <PageHeader
        title="Mes Infos"
        subtitle="Gérez vos informations personnelles et professionnelles."
      />

      {error && <p className="text-sm text-rose-600 mb-4">{error}</p>}

      <Card className="mb-5">
        <h2 className="text-sm font-bold text-[#0B162C] mb-4 uppercase tracking-wide">
          Infos de base
        </h2>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <label htmlFor="photo-upload" className="cursor-pointer group relative block">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-[#EEECF2] border-2 border-dashed border-[#9D8099]/40 flex items-center justify-center group-hover:border-[#9D8099] transition">
                {photoPreview ? (
                  <img src={photoPreview} alt="Photo de profil" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-10 h-10 text-[#393D3A]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#0B162C] flex items-center justify-center text-white text-xs group-hover:bg-[#1C2942] transition">
                ✎
              </div>
            </label>
            <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            <span className="text-xs text-[#393D3A]">Photo de profil</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
            <Input label="Nom complet" value={profile.name ?? ""} onChange={(e) => handleChange("name", e.target.value)} />
            <Input label="Téléphone" value={profile.phone ?? ""} onChange={(e) => handleChange("phone", e.target.value)} />
            <Input label="Email" value={profile.email ?? ""} disabled />
            <Input label="Ville" value={profile.ville ?? ""} onChange={(e) => handleChange("ville", e.target.value)} />
          </div>
        </div>
      </Card>

      <Card className="mb-5">
        <h2 className="text-sm font-bold text-[#0B162C] mb-4 uppercase tracking-wide">
          Profil professionnel
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Catégorie"
            value={profile.categories.id ?? ""}
            onChange={(e) => handleChange("category_id", Number(e.target.value))}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Input
            label="Zone géographique d'intervention"
            value={profile.zone ?? ""}
            onChange={(e) => handleChange("zone", e.target.value)}
            placeholder="Ex : Sfax"
          />
          <Input
            label="Années d'expérience"
            type="number"
            min="0"
            value={profile.experience_years ?? ""}
            onChange={(e) => handleChange("experience_years", e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#0B162C]">Mode de service</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {[
                { value: "se_deplace", label: "Je me déplace" },
                { value: "recoit", label: "Je reçois" },
                { value: "les_deux", label: "Les deux" },
              ].map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  size="sm"
                  variant={profile.service_mode === opt.value ? "primary" : "outline"}
                  onClick={() => handleChange("service_mode", opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Textarea
            label="Description / bio courte"
            value={profile.bio ?? ""}
            onChange={(e) => handleChange("bio", e.target.value)}
            rows={3}
            placeholder="Présentez-vous en quelques mots..."
          />
        </div>
      </Card>

      <Card className="mb-5">
        <h2 className="text-sm font-bold text-[#0B162C] mb-4 uppercase tracking-wide">
          Infos personnelles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Âge"
            type="number"
            min="0"
            value={profile.age ?? ""}
            onChange={(e) => handleChange("age", e.target.value)}
          />
          <Select label="Sexe" value={profile.sexe ?? ""} onChange={(e) => handleChange("sexe", e.target.value)}>
            <option value="">Préférer ne pas dire</option>
            <option value="homme">Homme</option>
            <option value="femme">Femme</option>
          </Select>
          <Input
            label="Facebook"
            value={profile.social_links?.facebook ?? ""}
            onChange={(e) => handleSocialChange("facebook", e.target.value)}
            placeholder="https://facebook.com/..."
          />
          <Input
            label="Instagram"
            value={profile.social_links?.instagram ?? ""}
            onChange={(e) => handleSocialChange("instagram", e.target.value)}
            placeholder="https://instagram.com/..."
          />
        </div>
      </Card>

      <Card className="mb-5">
        <h2 className="text-sm font-bold text-[#0B162C] mb-4 uppercase tracking-wide">
          Disponibilités de la semaine
        </h2>
        <WorkingHoursEditor />
      </Card>

      <Card className="mb-5">
        <h2 className="text-sm font-bold text-[#0B162C] mb-4 uppercase tracking-wide">
          Vérification
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FileDropZone label="Carte d'identité" disabled />
          <FileDropZone label="Certificat / attestation" disabled accept="image/*,.pdf" />
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-[#393D3A]">
            ⓘ L'upload de ces documents sera activé prochainement.
          </p>
          <StatusBadge status={profile.verification_status ?? "non_verifie"} />
        </div>
      </Card>

      <Button variant="primary" size="lg" isLoading={saving} onClick={handleSubmit}>
        Enregistrer les modifications
      </Button>
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
      <label className="text-xs font-bold uppercase tracking-wider text-[#0B162C]">{label}</label>
      <label
        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
          disabled
            ? "border-[var(--color-border)] bg-[#EEECF2]/40 cursor-not-allowed opacity-60"
            : "border-[#9D8099]/40 hover:border-[#9D8099] cursor-pointer"
        }`}
      >
        <svg className="w-6 h-6 text-[#393D3A]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <span className="text-xs text-[#393D3A]">{fileName ?? "Cliquez pour choisir un fichier"}</span>
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
  const map: Record<string, { label: string; variant: "neutral" | "warning" | "success" | "danger" }> = {
    non_verifie: { label: "Non vérifié", variant: "neutral" },
    en_attente: { label: "En attente", variant: "warning" },
    verifie: { label: "Vérifié ✅", variant: "success" },
    rejete: { label: "Rejeté", variant: "danger" },
  };
  const s = map[status] ?? map.non_verifie;
  return <Badge variant={s.variant}>{s.label}</Badge>;
}