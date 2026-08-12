'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPublicAgents, PublicAgentCard } from "@/lib/api/agents";
import { getCategories } from "@/lib/api/categories";
import { Category } from "@/lib/data";
import { AgentPreviewModal } from "@/components/AgentPreviewModal";
import { AgentSearchBar } from "@/components/AgentSearchBar";

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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-[var(--color-text-dark)] mb-1">
        Trouvez le bon professionnel
      </h1>
      <p className="text-sm text-[var(--color-text-body)] mb-4">
        Parcourez les profils disponibles près de chez vous.
      </p>

      <AgentSearchBar />

      <div className="flex gap-2 flex-wrap my-6">
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
        <p className="text-sm text-[var(--color-text-body)]">Chargement...</p>
      ) : agents.length === 0 ? (
        <p className="text-sm text-[var(--color-text-body)]">Aucun professionnel pour cette catégorie.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition cursor-pointer ${
        active
          ? "bg-[var(--color-primary)] text-white"
          : "bg-[var(--color-bg-alt)] text-[var(--color-text-body)] hover:bg-[var(--color-primary)]/10"
      }`}
    >
      {label}
    </button>
  );
}

function AgentCard({ agent, onClick }: { agent: PublicAgentCard; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-[var(--color-card)] rounded-xl overflow-hidden border border-[var(--color-bg-alt)] shadow-sm hover:shadow-md transition cursor-pointer p-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-[var(--color-bg-alt)] overflow-hidden shrink-0">
          {agent.photo_url && (
            <img src={agent.photo_url} alt={agent.name} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--color-text-dark)] truncate">{agent.name}</p>
          <p className="text-xs text-[var(--color-text-body)] truncate">
            {agent.categories?.name} · {agent.ville}
          </p>
        </div>
      </div>

      <p className="text-xs text-amber-600 mt-2">
        ★ {agent.rating_average.toFixed(1)} ({agent.rating_count} avis)
      </p>

      {agent.bio && (
        <p className="text-xs text-[var(--color-text-body)] mt-2 line-clamp-2">{agent.bio}</p>
      )}
    </div>
  );
}

