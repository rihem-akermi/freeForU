'use client'
import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "@/lib/api/users";
import { Toast } from "@/components/Toast";
import { formatDate } from "@/lib/utils/formatDate";
import type { User } from "@/lib/data";

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
        photoFile ?? undefined
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

  if (loading) return <p className="text-sm text-[var(--color-text-body)]">Chargement...</p>;
  if (!profile) return <p className="text-sm text-red-600">Profil introuvable.</p>;

  return (
    <div className="max-w-3xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h1 className="text-2xl font-semibold text-[var(--color-text-dark)] mb-1">Mes Infos</h1>
      <p className="text-sm text-[var(--color-text-body)] mb-6">Gérez vos informations personnelles.</p>

      <Section title="Infos de base">
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <label htmlFor="photo-upload" className="cursor-pointer group relative block">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-[var(--color-bg-alt)] border-2 border-dashed border-[var(--color-primary)]/40 flex items-center justify-center group-hover:border-[var(--color-primary)] transition">
                {photoPreview ? (
                  <img src={photoPreview} alt="Photo de profil" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-10 h-10 text-[var(--color-text-body)]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs group-hover:bg-[var(--color-primary-dark)] transition">
                ✎
              </div>
            </label>
            <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
            <Field label="Nom complet">
              <input value={profile.name} onChange={(e) => handleChange("name", e.target.value)} className="input" />
            </Field>
            <Field label="Téléphone">
              <input value={profile.phone} onChange={(e) => handleChange("phone", e.target.value)} className="input" />
            </Field>
            <Field label="Email">
              <input value={profile.email} disabled className="input opacity-60 cursor-not-allowed" />
            </Field>
            <Field label="Ville">
              <input value={profile.ville} onChange={(e) => handleChange("ville", e.target.value)} className="input" />
            </Field>
          </div>
        </div>
      </Section>

      <button onClick={handleSubmit} disabled={saving} className="mt-2 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-6 py-2.5 text-sm font-medium transition disabled:opacity-50 cursor-pointer">
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-card)] rounded-xl p-5 mb-5 shadow-sm border border-[var(--color-bg-alt)]">
      <h2 className="text-sm font-semibold text-[var(--color-text-dark)] mb-4 uppercase tracking-wide">{title}</h2>
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