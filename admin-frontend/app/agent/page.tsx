// app/agent/page.tsx
const stats = {
  reservationsEnAttente: 3,
  publicationsEnAttente: 2,
  noteMoyenne: 4.5,
  avisCount: 12,
};

export default function AgentDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--color-text-dark)] mb-6">
        Bonjour 👋
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg bg-[var(--color-card)] p-5">
          <p className="text-sm text-[var(--color-text-body)]">Réservations en attente</p>
          <p className="text-3xl font-bold text-[var(--color-text-dark)]">{stats.reservationsEnAttente}</p>
        </div>
        <div className="rounded-lg bg-[var(--color-card)] p-5">
          <p className="text-sm text-[var(--color-text-body)]">Publications en attente</p>
          <p className="text-3xl font-bold text-[var(--color-text-dark)]">{stats.publicationsEnAttente}</p>
        </div>
        <div className="rounded-lg bg-[var(--color-card)] p-5">
          <p className="text-sm text-[var(--color-text-body)]">Note moyenne</p>
          <p className="text-3xl font-bold text-[var(--color-text-dark)]">
            {stats.noteMoyenne} ⭐ <span className="text-sm font-normal">({stats.avisCount} avis)</span>
          </p>
        </div>
      </div>
    </div>
  );
}