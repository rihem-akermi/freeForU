"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getPublicAgents,
  PaginationMeta,
  PublicAgentCard,
} from "@/lib/api/agents";
import { getCategories } from "@/lib/api/categories";
import { Category } from "@/lib/data";
import { AgentPreviewModal } from "@/components/AgentPreviewModal";
import { AgentSearchBar } from "@/components/AgentSearchBar";
import { Card, PageHeader } from "@/components/ui/UIComponents";

function IcoStar({
  className = "w-3.5 h-3.5",
  filled = true,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      viewBox="0 0 24 24"
    >
      <path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7-5.4-4.7 7.1-.7z" />
    </svg>
  );
}

function IcoChevronLeft({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function IcoChevronRight({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function ClientHomePage() {
  const router = useRouter();
  const [agents, setAgents] = useState<PublicAgentCard[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<PublicAgentCard | null>(
    null,
  );

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    getPublicAgents({ categoryId: activeCategory ?? undefined, page })
      .then((res) => {
        setAgents(res.data);
        setMeta(res.meta);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCategory, page]);

  function handleCategoryChange(categoryId: number | null) {
    setActiveCategory(categoryId);
    setPage(1);
  }

  return (
    <div className="w-full">
      {/* Header + barre de recherche alignés, recherche à droite */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
  <PageHeader
    title="Trouvez le bon professionnel"
    subtitle="Parcourez les profils disponibles près de chez vous."
    badge="Espace client"
  />
  <AgentSearchBar
    label="Rechercher"
    className="sm:max-w-sm md:max-w-md sm:mt-1"
  />
</div>

      <div className="my-6 flex flex-wrap gap-2">
        <CategoryPill
          label="Toutes"
          active={activeCategory === null}
          onClick={() => handleCategoryChange(null)}
        /> 
        {categories.map((c) => (
          <CategoryPill
            key={c.id}
            label={c.name}
            active={activeCategory === c.id}
            onClick={() => handleCategoryChange(c.id)}
          />
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : agents.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucun professionnel pour cette catégorie.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onClick={() => setSelectedAgent(agent)}
              />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                disabled={!meta.hasPreviousPage}
                onClick={() => setPage((p) => p - 1)}
                className="flex cursor-pointer items-center gap-1 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/10 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-background disabled:hover:shadow-sm"
              >
                <IcoChevronLeft />
                Précédent
              </button>

              <span className="rounded-full bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground">
                Page {meta.page} / {meta.totalPages}
              </span>

              <button
                disabled={!meta.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="flex cursor-pointer items-center gap-1 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/10 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-background disabled:hover:shadow-sm"
              >
                Suivant
                <IcoChevronRight />
              </button>
            </div>
          )}
        </>
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

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
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

function AgentCard({
  agent,
  onClick,
}: {
  agent: PublicAgentCard;
  onClick: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer !p-4 border-2 border-border/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
          {agent.photo_url && (
            <img
              src={agent.photo_url}
              alt={agent.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {agent.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {agent.categories?.name} · {agent.ville}
          </p>
        </div>
      </div>

      <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[var(--color-warning)]">
        <IcoStar className="h-3 w-3" />
        {agent.rating_average.toFixed(1)}
        <span className="font-normal text-muted-foreground">
          ({agent.rating_count} avis)
        </span>
      </p>

      {agent.bio && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
          {agent.bio}
        </p>
      )}
    </Card>
  );
}
