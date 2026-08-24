'use client'
import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "@/lib/api/users";
import { Toast } from "@/components/Toast";
import { formatDate } from "@/lib/utils/formatDate";
import type { User } from "@/lib/data";
import { Card, Input, Button, PageHeader } from "@/components/ui/UIComponents";

const PERSONAL_ACCENT = "#46607D"; // soft navy
const ACCOUNT_ACCENT = "#7D6E8C"; // soft violet

function IcoUser({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0" />
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
function IcoPencil({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

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
      <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">{children}</h2>
    </div>
  );
}

export default function MesInfosPage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    getMyProfile()
      .then((data) => {
        setProfile(data);
        setPhotoPreview(data.photo_url ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleChange = (field: string, value: string) => {
    setProfile((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await updateMyProfile(
        {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          ville: profile.ville,
        },
        photoFile ?? undefined,
      );
      setProfile(updated);
      setPhotoFile(null);
      setToast({ message: "Profil mis à jour avec succès.", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Erreur lors de l'enregistrement.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Chargement...</p>;
  if (!profile) return <p className="text-sm text-[var(--color-danger)]">Profil introuvable.</p>;

  return (
    <div className="w-full">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <PageHeader
        title="Mes Infos"
        subtitle="Gérez vos informations personnelles."
        badge="Espace client"
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* ── Infos personnelles (éditable) ─────────────────────── */}
        <Card className="!p-6 sm:!p-8" style={{ borderLeft: `4px solid ${PERSONAL_ACCENT}` }}>
          <SectionHeading icon={IcoUser} accent={PERSONAL_ACCENT}>
            Infos personnelles
          </SectionHeading>

          <div className="rounded-xl border bg-background/60 p-5 sm:p-6" style={{ borderColor: `${PERSONAL_ACCENT}30` }}>
            <div className="flex flex-col items-start gap-6 sm:flex-row">
              <div className="flex shrink-0 flex-col items-center gap-2">
                <label htmlFor="photo-upload" className="group relative block cursor-pointer">
                  <div
                    className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed bg-muted transition"
                    style={{ borderColor: `${PERSONAL_ACCENT}55` }}
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Photo de profil" className="h-full w-full object-cover" />
                    ) : (
                      <IcoUser className="h-9 w-9 text-muted-foreground/40" />
                    )}
                  </div>
                  <div
                    className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full text-white transition"
                    style={{ background: PERSONAL_ACCENT }}
                  >
                    <IcoPencil />
                  </div>
                </label>
                <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                <span className="text-xs text-muted-foreground">Photo de profil</span>
              </div>

              <div className="grid w-full flex-1 grid-cols-1 gap-4">
                <Input label="Nom complet" value={profile.name} onChange={(e) => handleChange("name", e.target.value)} />
                <Input label="Téléphone" value={profile.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                <Input label="Ville" value={profile.ville} onChange={(e) => handleChange("ville", e.target.value)} />
              </div>
            </div>
          </div>

          <Button variant="primary" size="lg" isLoading={saving} onClick={handleSubmit} className="mt-6">
            Enregistrer les modifications
          </Button>
        </Card>

        {/* ── Compte (lecture seule) ─────────────────────────────── */}
        <Card className="!p-6 sm:!p-8" style={{ borderLeft: `4px solid ${ACCOUNT_ACCENT}` }}>
          <SectionHeading icon={IcoIdCard} accent={ACCOUNT_ACCENT}>
            Compte
          </SectionHeading>

          <div className="rounded-xl border bg-background/60 p-5 sm:p-6" style={{ borderColor: `${ACCOUNT_ACCENT}30` }}>
            <div className="grid grid-cols-1 gap-4">
              <Input label="Email" value={profile.email} disabled />
              {profile.created_at && (
                <Input label="Membre depuis" value={formatDate(profile.created_at)} disabled />
              )}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              L'adresse email est liée à votre compte et ne peut pas être modifiée ici.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}