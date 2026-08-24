'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPublicAgents, PublicAgentCard } from "@/lib/api/agents";
import { getCategories } from "@/lib/api/categories";
import { Category } from "@/lib/data";
import { AgentPreviewModal } from "@/components/AgentPreviewModal";
import { AgentSearchBar } from "@/components/AgentSearchBar";
import { Card, PageHeader } from "@/components/ui/UIComponents";

function IcoStar({ className = "w-3.5 h-3.5", filled = true }: { className?: string; filled?: boolean }) {
  return (
    <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.5} viewBox="0 0 24 24">
      <path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7-5.4-4.7 7.1-.7z" />
    </svg>
  );
}

export default function ClientHomePage() {
  const router = useRouter();
  const [agents, setAgents] = useState<PublicAgentCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<PublicAgentCard | null>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    getPublicAgents(activeCategory ?? undefined)
      .then(setAgents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div className="w-full">
      <PageHeader
        title="Trouvez le bon professionnel"
        subtitle="Parcourez les profils disponibles près de chez vous."
        badge="Espace client"
      />

      <div className="mb-5 mt-2"><AgentSearchBar /></div>

      <div className="mb-6 flex flex-wrap gap-2">
        <CategoryPill label="Toutes" active={activeCategory === null} onClick={() => setActiveCategory(null)} />
        {categories.map((c) => (
          <CategoryPill
            key={c.id}
            label={c.name}
            active={activeCategory === c.id}
            onClick={() => setActiveCategory(c.id)}
          />
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : agents.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun professionnel pour cette catégorie.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onClick={() => setSelectedAgent(agent)} />
          ))}
        </div>
      )}

      {selectedAgent && (
        <AgentPreviewModal
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onViewProfile={() => router.push(`/client/agent/${selectedAgent.id}`)}
        />
      )}
    </div>
  );
}

function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-accent/15"
      }`}
    >
      {label}
    </button>
  );
}

function AgentCard({ agent, onClick }: { agent: PublicAgentCard; onClick: () => void }) {
  return (
    <Card
      onClick={onClick}
className="cursor-pointer !p-4 border-2 border-border/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"    >
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
          {agent.photo_url && (
            <img src={agent.photo_url} alt={agent.name} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{agent.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {agent.categories?.name} · {agent.ville}
          </p>
        </div>
      </div>

      <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[var(--color-warning)]">
        <IcoStar className="h-3 w-3" />
        {agent.rating_average.toFixed(1)}
        <span className="font-normal text-muted-foreground">({agent.rating_count} avis)</span>
      </p>

      {agent.bio && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{agent.bio}</p>
      )}
    </Card>
  );
}