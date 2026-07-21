// app/agent/infos/page.tsx
'use client'
import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "@/lib/api/agents";
import { getCategories, Category } from "@/lib/api/categories";
import type { Agent } from "@/lib/data";

export default function MesInfosPage() {
  const [profile, setProfile] = useState<Agent | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [profileData, categoriesData] = await Promise.all([
          getMyProfile(),
          getCategories(),
        ]);
        setProfile(profileData);
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

  const handleChange = (field: string, value: string) => {
    setProfile((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSocialChange = (platform: string, value: string) => {
    setProfile((prev) =>
      prev
        ? { ...prev, social_links: { ...prev.social_links, [platform]: value } }
        : prev
    );
  };

  const handleSubmit = async () => {
    if (!profile) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updateMyProfile({
        name: profile.name,
        phone: profile.phone,
        ville: profile.ville,
        category_id: profile.category_id,
        bio: profile.bio,
        zone: profile.zone,
        service_mode: profile.service_mode,
        tarif_min: profile.tarif_min,
        tarif_max: profile.tarif_max,
        age: profile.age,
        sexe: profile.sexe,
        experience_years: profile.experience_years,
        social_links: profile.social_links,
      });
      setProfile(updated);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'enregistrement, réessayez.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-[var(--color-text-body)]">Chargement...</p>;
  }

  if (!profile) {
    console.log(profile)
    return (<p className="text-sm text-red-600">
      {error || "Profil introuvable."}
      </p>
      )
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-[var(--color-text-dark)] mb-6">
        Mes Infos
      </h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <Section title="Infos de base">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <input value={profile.email ?? ""} disabled className="input opacity-60" />
          </Field>
          <Field label="Ville">
            <input
              value={profile.ville ?? ""}
              onChange={(e) => handleChange("ville", e.target.value)}
              className="input"
            />
          </Field>
        </div>
      </Section>

      <Section title="Profil professionnel">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Catégorie">
            <select
              value={profile.category_id ?? ""}
              onChange={(e) => handleChange("category_id", e.target.value)}
              className="input"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </Field>
          <Field label="Zone géographique d'intervention">
            <input
              value={profile.zone ?? ""}
              onChange={(e) => handleChange("zone", e.target.value)}
              placeholder="Ex : Sfax et environs"
              className="input"
            />
          </Field>
          <Field label="Années d'expérience">
            <input
              type="number"
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
                <label key={opt.value} className="flex items-center gap-1.5 text-sm text-[var(--color-text-body)]">
                  <input
                    type="radio"
                    name="service_mode"
                    checked={profile.service_mode === opt.value}
                    onChange={() => handleChange("service_mode", opt.value)}
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
            className="input resize-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Tarif min (optionnel)">
            <input
              type="number"
              value={profile.tarif_min ?? ""}
              onChange={(e) => handleChange("tarif_min", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Tarif max (optionnel)">
            <input
              type="number"
              value={profile.tarif_max ?? ""}
              onChange={(e) => handleChange("tarif_max", e.target.value)}
              className="input"
            />
          </Field>
        </div>
      </Section>

      <Section title="Infos personnelles">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Âge">
            <input
              type="number"
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
              <option value="">-- Préférer ne pas dire --</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
            </select>
          </Field>
          <Field label="Facebook">
            <input
              value={profile.social_links?.facebook ?? ""}
              onChange={(e) => handleSocialChange("facebook", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Instagram">
            <input
              value={profile.social_links?.instagram ?? ""}
              onChange={(e) => handleSocialChange("instagram", e.target.value)}
              className="input"
            />
          </Field>
        </div>
      </Section>

      <Section title="Photo & vérification">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Photo de profil">
            <input type="file" accept="image/*" className="input" disabled />
          </Field>
          <Field label="Carte d'identité (pour vérification)">
            <input type="file" accept="image/*" className="input" disabled />
          </Field>
          <Field label="Certificat / attestation (optionnel)">
            <input type="file" accept="image/*,.pdf" className="input" disabled />
          </Field>
          <Field label="Statut de vérification">
            <StatusBadge status={profile.verification_status ?? "non_verifie"} />
          </Field>
        </div>
        <p className="text-xs text-[var(--color-text-body)]">
          ⓘ L'upload de fichiers sera activé à une prochaine étape.
        </p>
      </Section>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="mt-4 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-5 py-2.5 text-sm font-medium transition disabled:opacity-50"
      >
        {saving ? "Enregistrement..." : "Enregistrer les modifications"}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-card)] rounded-lg p-5 mb-5">
      <h2 className="text-sm font-semibold text-[var(--color-text-dark)] mb-4 uppercase tracking-wide">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-[var(--color-text-body)]">{label}</label>
      {children}
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