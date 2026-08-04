'use client'
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAgentById } from "@/lib/api/agents";
import { getAgentPortfolio } from "@/lib/api/publications";
import { getAgentReviews, getAgentRatingSummary, RatingSummary } from "@/lib/api/reviews";
import { formatDate } from "@/lib/utils/formatDate";
import type { Agent ,Review ,Publication} from "@/lib/data";

type Tab = "infos" | "portfolio" | "avis";

export default function AgentProfilePage() {
  const params = useParams();
  const agentId = Number(params.id);

  const [agent, setAgent] = useState<Agent | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("infos");

  useEffect(() => {
    async function loadAll() {
      try {
        const [agentData, portfolioData, reviewsData, summaryData] = await Promise.all([
          getAgentById(agentId),
          getAgentPortfolio(agentId),
          getAgentReviews(agentId),
          getAgentRatingSummary(agentId),
        ]);
        setAgent(agentData);
        setPublications(portfolioData);
        setReviews(reviewsData);
        setSummary(summaryData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [agentId]);

  if (loading) {
    return <p className="text-sm text-[var(--color-text-body)] p-6">Chargement...</p>;
  }

  if (!agent) {
    return <p className="text-sm text-red-600 p-6">Profil introuvable.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-5 mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-[var(--color-bg-alt)] shrink-0">
          {agent.photo_url ? (
            <img src={agent.photo_url} alt={agent.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-semibold text-[var(--color-text-body)]/40">
              {agent.name?.[0]}
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-[var(--color-text-dark)]">{agent.name}</h1>
            {agent.verification_status === "verifie" && (
              <span className="text-emerald-600 text-sm" title="Agent vérifié">✅</span>
            )}
          </div>
          <p className="text-sm text-[var(--color-text-body)]">
            {agent.categories.nom} · {agent.ville}
          </p>
          {summary && (
            <p className="text-sm text-amber-600 mt-1">
              ⭐ {summary.average.toFixed(1)} ({summary.count} avis)
            </p>
          )}
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b border-[var(--color-bg-alt)] mb-6">
        {([
          { key: "infos", label: "Infos" },
          { key: "portfolio", label: `Portfolio (${publications.length})` },
          { key: "avis", label: `Avis (${reviews.length})` },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition cursor-pointer ${
              activeTab === tab.key
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-text-body)] hover:text-[var(--color-text-dark)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "infos" && <InfosTab agent={agent} />}
      {activeTab === "portfolio" && <PortfolioTab publications={publications} />}
      {activeTab === "avis" && <AvisTab reviews={reviews} />}
    </div>
  );
}

function InfosTab({ agent }: { agent: Agent }) {
  return (
    <div className="bg-[var(--color-card)] rounded-xl p-5 shadow-sm border border-[var(--color-bg-alt)] space-y-4">
      {agent.bio && (
        <div>
          <h3 className="text-xs font-semibold text-[var(--color-text-body)] uppercase tracking-wide mb-1">À propos</h3>
          <p className="text-sm text-[var(--color-text-dark)]">{agent.bio}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <InfoItem label="Zone d'intervention" value={agent.zone} />
        <InfoItem label="Expérience" value={agent.experience_years ? `${agent.experience_years} ans` : undefined} />
        <InfoItem
          label="Mode de service"
          value={
            { se_deplace: "Se déplace", recoit: "Reçoit", les_deux: "Les deux" }[agent.service_mode ?? ""]
          }
        />
        <InfoItem label="Téléphone" value={agent.phone} />
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-[var(--color-text-body)]">{label}</p>
      <p className="text-[var(--color-text-dark)] font-medium">{value}</p>
    </div>
  );
}

function PortfolioTab({ publications }: { publications: Publication[] }) {
  if (publications.length === 0) {
    return <p className="text-sm text-[var(--color-text-body)]">Aucune publication pour le moment.</p>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {publications.map((pub) => (
        <div key={pub.id} className="rounded-lg overflow-hidden bg-white border border-stone-200">
          <img src={pub.photo_url} alt={pub.titre} className="w-full h-28 object-cover" />
          <div className="p-2">
            <p className="text-xs font-medium text-[var(--color-text-dark)] truncate">{pub.titre}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AvisTab({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-[var(--color-text-body)]">Aucun avis pour le moment.</p>;
  }
  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-amber-600 text-sm">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
            <span className="text-xs text-[var(--color-text-body)]">{formatDate(review.created_at)}</span>
          </div>
          {review.comment && <p className="text-sm text-[var(--color-text-dark)]">{review.comment}</p>}
        </div>
      ))}
    </div>
  );
}