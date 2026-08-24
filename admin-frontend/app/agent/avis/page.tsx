// app/agent/avis/page.tsx
'use client'
import { useEffect, useState } from "react";
import { getMe } from "@/lib/api/auth";
import { getAgentReviews, getAgentRatingSummary, RatingSummary } from "@/lib/api/reviews";
import { Card, PageHeader } from "@/components/ui/UIComponents";
import type { Review } from "@/lib/data";

const PUB_ACCENT = "#7D6E8C";

function IcoStar({ className = "w-4 h-4", filled = true }: { className?: string; filled?: boolean }) {
  return (
    <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.5} viewBox="0 0 24 24">
      <path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7-5.4-4.7 7.1-.7z" />
    </svg>
  );
}
function StarRating({ rating, className = "h-3.5 w-3.5" }: { rating: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[var(--color-warning)]">
      {Array.from({ length: 5 }).map((_, i) => (
        <IcoStar key={i} className={className} filled={i < rating} />
      ))}
    </span>
  );
}

export default function AvisPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const me = await getMe();
        const [reviewsData, summaryData] = await Promise.all([
          getAgentReviews(me.id),
          getAgentRatingSummary(me.id),
        ]);
        setReviews(reviewsData);
        setSummary(summaryData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="text-sm text-muted-foreground">Chargement...</p>;

  return (
    <div className="w-full">
      <PageHeader
        title="Les avis"
        subtitle="Retrouvez les retours de vos clients sur vos services."
        badge="Espace agent"
        actionSlot={
          summary && summary.count > 0 ? (
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-warning)]/25 bg-[var(--color-warning-soft)] px-5 py-3">
              <span className="font-serif text-2xl font-bold text-foreground">
                {summary.average.toFixed(1)}
              </span>
              <StarRating rating={Math.round(summary.average)} />
              <span className="text-xs font-semibold text-muted-foreground">
                {summary.count} avis
              </span>
            </div>
          ) : undefined
        }
      />

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">Vous n'avez pas encore reçu d'avis.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="!p-4"
              style={{ borderLeft: `3px solid ${PUB_ACCENT}` }}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {review.users?.name ?? "Client"}
                </span>
                <StarRating rating={review.rating} className="h-3 w-3" />
              </div>
              <span className="text-[11px] text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </span>
              {review.comment && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{review.comment}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}