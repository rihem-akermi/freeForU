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

/* ── section icons ─────────────────────────────────────────────── */
function IcoUser({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0" />
    </svg>
  );
}
function IcoBriefcase({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  );
}
function IcoIdCard({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4zM8 10h.01M8 14h4M14 10h2M14 14h2" />
      <circle cx="8" cy="12" r="1.5" />
    </svg>
  );
}
function IcoClock({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IcoShield({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v6c0 4.5-3 8.25-7 9-4-.75-7-4.5-7-9V6l7-3z" />
    </svg>
  );
}
function IcoPencil({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
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
function IcoUpload({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

/* ── per-section accent palette ───────────────────────────────── */
const SECTION_ACCENT = {
  base: "#46607D", // soft navy
  pro: "#7D6E8C", // soft violet
  perso: "#9C5F63", // burgundy
  dispo: "#C4956A", // warm terracotta
  verif: "#9D8099", // brand mauve
};

function SectionHeading({
  icon: Icon,
  accent,
  children,
}: {
  icon: (p: { className?: string }) => React.JSX.Element;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${accent}18`, color: accent }}
      >
        <Icon />
      </span>
      <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
        {children}
      </h2>
    </div>
  );
}

/* ── nested inner panel — same depth effect as WorkingHoursEditor's
   own Card sitting inside its parent section Card ──────────────── */
function InnerPanel({
  accent,
  children,
}: {
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl border bg-background/60 p-5 sm:p-6"
      style={{ borderColor: `${accent}30` }}
    >
      {children}
    </div>
  );
}

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
      setToast({ message: "Profil mis à jour avec succès.", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Erreur, réessayez.", type: "error" });
      setError("Erreur lors de l'enregistrement, réessayez.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>;
  }

  if (!profile) {
    return <p className="text-sm text-[var(--color-danger)]">{error || "Profil introuvable."}</p>;
  }

  return (
    <div className="w-full">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <PageHeader
        title="Mes Infos"
        subtitle="Gérez vos informations personnelles et professionnelles."
        badge="Espace agent"
      />

      {error && <p className="mb-4 text-sm text-[var(--color-danger)]">{error}</p>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* ── 1. Infos de base ──────────────────────────────────── */}
        <Card
          className="!p-6 sm:!p-8"
          style={{ borderLeft: `4px solid ${SECTION_ACCENT.base}` }}
        >
          <SectionHeading icon={IcoUser} accent={SECTION_ACCENT.base}>
            Infos de base
          </SectionHeading>

          <InnerPanel accent={SECTION_ACCENT.base}>
            <div className="flex flex-col items-start gap-6 sm:flex-row">
              <div className="flex shrink-0 flex-col items-center gap-2">
                <label htmlFor="photo-upload" className="group relative block cursor-pointer">
                  <div
                    className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed bg-muted transition"
                    style={{ borderColor: `${SECTION_ACCENT.base}55` }}
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Photo de profil" className="h-full w-full object-cover" />
                    ) : (
                      <IcoUser className="h-9 w-9 text-muted-foreground/40" />
                    )}
                  </div>
                  <div
                    className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full text-white transition"
                    style={{ background: SECTION_ACCENT.base }}
                  >
                    <IcoPencil />
                  </div>
                </label>
                <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                <span className="text-xs text-muted-foreground">Photo de profil</span>
              </div>

              <div className="grid w-full flex-1 grid-cols-1 gap-4">
                <Input label="Nom complet" value={profile.name ?? ""} onChange={(e) => handleChange("name", e.target.value)} />
                <Input label="Téléphone" value={profile.phone ?? ""} onChange={(e) => handleChange("phone", e.target.value)} />
                <Input label="Email" value={profile.email ?? ""} disabled />
                <Input label="Ville" value={profile.ville ?? ""} onChange={(e) => handleChange("ville", e.target.value)} />
              </div>
            </div>
          </InnerPanel>
        </Card>

        {/* ── 2. Profil professionnel ───────────────────────────── */}
        <Card
          className="!p-6 sm:!p-8"
          style={{ borderLeft: `4px solid ${SECTION_ACCENT.pro}` }}
        >
          <SectionHeading icon={IcoBriefcase} accent={SECTION_ACCENT.pro}>
            Profil professionnel
          </SectionHeading>

          <InnerPanel accent={SECTION_ACCENT.pro}>
            <div className="grid grid-cols-1 gap-4">
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
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">Mode de service</label>
                <div className="mt-1 flex flex-wrap gap-2">
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
              <Textarea
                label="Description / bio courte"
                value={profile.bio ?? ""}
                onChange={(e) => handleChange("bio", e.target.value)}
                rows={3}
                placeholder="Présentez-vous en quelques mots..."
              />
            </div>
          </InnerPanel>
        </Card>

        {/* ── 3. Infos personnelles ─────────────────────────────── */}
        <Card
          className="!p-6 sm:!p-8"
          style={{ borderLeft: `4px solid ${SECTION_ACCENT.perso}` }}
        >
          <SectionHeading icon={IcoIdCard} accent={SECTION_ACCENT.perso}>
            Infos personnelles
          </SectionHeading>

          <InnerPanel accent={SECTION_ACCENT.perso}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </InnerPanel>
        </Card>

        {/* ── 4. Disponibilités ─────────────────────────────────── */}
        <Card
          className="!p-6 sm:!p-8"
          style={{ borderLeft: `4px solid ${SECTION_ACCENT.dispo}` }}
        >
          <SectionHeading icon={IcoClock} accent={SECTION_ACCENT.dispo}>
            Disponibilités de la semaine
          </SectionHeading>
          <WorkingHoursEditor />
        </Card>

        {/* ── 5. Vérification (full width) ──────────────────────── */}
        <Card
          className="!p-6 sm:!p-8 xl:col-span-2"
          style={{ borderLeft: `4px solid ${SECTION_ACCENT.verif}` }}
        >
          <SectionHeading icon={IcoShield} accent={SECTION_ACCENT.verif}>
            Vérification
          </SectionHeading>

          <InnerPanel accent={SECTION_ACCENT.verif}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FileDropZone label="Carte d'identité" disabled accent={SECTION_ACCENT.verif} />
              <FileDropZone label="Certificat / attestation" disabled accept="image/*,.pdf" accent={SECTION_ACCENT.verif} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <IcoInfo className="h-3.5 w-3.5 shrink-0" />
                L'upload de ces documents sera activé prochainement.
              </p>
              <StatusBadge status={profile.verification_status ?? "non_verifie"} />
            </div>
          </InnerPanel>
        </Card>
      </div>

      <Button variant="primary" size="lg" isLoading={saving} onClick={handleSubmit} className="mt-6">
        Enregistrer les modifications
      </Button>
    </div>
  );
}

function FileDropZone({
  label,
  disabled = false,
  accept = "image/*",
  accent,
}: {
  label: string;
  disabled?: boolean;
  accept?: string;
  accent: string;
}) {
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-foreground">{label}</label>
      <label
        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
          disabled ? "cursor-not-allowed bg-muted/40 opacity-60" : "cursor-pointer"
        }`}
        style={{ borderColor: disabled ? "var(--color-border)" : `${accent}55` }}
      >
        <IcoUpload className="h-6 w-6 text-muted-foreground/50" />
        <span className="text-xs text-muted-foreground">{fileName ?? "Cliquez pour choisir un fichier"}</span>
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
    verifie: { label: "Vérifié", variant: "success" },
    rejete: { label: "Rejeté", variant: "danger" },
  };
  const s = map[status] ?? map.non_verifie;
  return <Badge variant={s.variant}>{s.label}</Badge>;
}