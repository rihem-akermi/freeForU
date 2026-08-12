'use client'

type PublicAgentCard = {
  id: number;
  name: string;
  ville: string | null;
  photo_url: string | null;
  bio: string | null;
  categories: { name: string } | null;
  rating_average: number;
  rating_count: number;
};

type AgentPreviewModalProps = {
  agent: PublicAgentCard;
  onClose: () => void;
  onViewProfile: () => void;
};

export function AgentPreviewModal({ agent, onClose, onViewProfile }: AgentPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-[var(--color-card)] rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[var(--color-bg-alt)] overflow-hidden shrink-0">
              {agent.photo_url && (
                <img src={agent.photo_url} alt={agent.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text-dark)]">{agent.name}</h3>
              <p className="text-sm text-[var(--color-text-body)]">
                {agent.categories?.name} · {agent.ville}
              </p>
              <p className="text-sm text-amber-600 mt-0.5">
                ★ {agent.rating_average.toFixed(1)} ({agent.rating_count} avis)
              </p>
            </div>
          </div>

          {agent.bio && (
            <p className="text-sm text-[var(--color-text-body)] mt-4">{agent.bio}</p>
          )}

          <div className="flex gap-3 mt-5">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-md text-[var(--color-text-body)] hover:bg-[var(--color-bg-alt)] transition cursor-pointer"
            >
              Fermer
            </button>
            <button
              onClick={onViewProfile}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white transition cursor-pointer"
            >
              Voir le profil complet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}