'use client'
import { Button } from "@/components/ui/UIComponents";

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

function IcoStar({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7-5.4-4.7 7.1-.7z" />
    </svg>
  );
}

export function AgentPreviewModal({ agent, onClose, onViewProfile }: AgentPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
              {agent.photo_url && (
                <img src={agent.photo_url} alt={agent.name} className="h-full w-full object-cover" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{agent.name}</h3>
              <p className="text-sm text-muted-foreground">
                {agent.categories?.name} · {agent.ville}
              </p>
              <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-[var(--color-warning)]">
                <IcoStar />
                {agent.rating_average.toFixed(1)}
                <span className="font-normal text-muted-foreground">({agent.rating_count} avis)</span>
              </p>
            </div>
          </div>

          {agent.bio && (
            <p className="mt-4 text-sm text-muted-foreground">{agent.bio}</p>
          )}

          <div className="mt-5 flex gap-3">
            <Button variant="neutral" className="flex-1" onClick={onClose}>
              Fermer
            </Button>
            <Button variant="primary" className="flex-1" onClick={onViewProfile}>
              Voir le profil complet
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}