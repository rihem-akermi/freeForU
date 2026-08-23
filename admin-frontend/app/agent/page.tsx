"use client";
import { useEffect, useState } from "react";
import { getMyPendingPublications } from "@/lib/api/publications";
import { getMyPendingReservations } from "@/lib/api/reservations";
import { Card, PageHeader, Badge } from "@/components/ui/UIComponents";
import { getAgentRatingSummary } from "@/lib/api/reviews";
import { getMe } from "@/lib/api/auth";

/* ── small local icons (kept file-local since they're specific to this
   dashboard's two stat categories, same pattern as app/admin/page.tsx) ── */
function IcoCalendar({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}
function IcoClipboard({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-5 9l2 2 4-4"
      />
    </svg>
  );
}
function IcoStar({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7-5.4-4.7 7.1-.7z" />
    </svg>
  );
}

/* Accent per card — reused for icon tint, left border, and the
   hover accent line, matching the admin dashboard's stat-tile pattern. */
const CARD_META = [
  { Icon: IcoCalendar, accent: "#46607D" }, // soft navy — réservations
  { Icon: IcoClipboard, accent: "#7D6E8C" }, // soft violet — publications
];
const RATING_ACCENT = "var(--color-warning)";

export default function AgentDashboard() {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<
    { index: number; label: string; value: number }[]
  >([]);
  const [ratingSummary, setRatingSummary] = useState<{
    average: number;
    count: number;
  } | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const me = await getMe(); // ← pour avoir l'agentId
        const [reservations, publications, summary] = await Promise.all([
          getMyPendingReservations(),
          getMyPendingPublications(),
          getAgentRatingSummary(me.id), // ← ajouté
        ]);
        setCards([
          {
            index: 0,
            label: "Réservations à traiter",
            value: reservations.length,
          },
          {
            index: 1,
            label: "Publications en attente",
            value: publications.length,
          },
        ]);
        setRatingSummary(summary); // ← ajouté
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading)
    return (
      <div className="app-stack">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      </div>
    );

  return (
    <div className="app-stack w-full max-w-none gap-10">
      <style>{`
        @keyframes rise {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .stat-rise { animation: rise .5s cubic-bezier(.22,1,.36,1) backwards; }
      `}</style>

      <PageHeader
        title="Votre activité"
        subtitle="Gardez une vue claire sur les demandes et la qualité de vos services."
        badge="Espace agent"
      />

      <section aria-labelledby="activity-overview" className="app-stack gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2
            id="activity-overview"
            className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground"
          >
            Vue d&apos;ensemble
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card, i) => {
            const meta = CARD_META[card.index] ?? CARD_META[0];
            return (
              <Card
                key={card.index}
                className="stat-rise group relative flex min-h-40 flex-col gap-7 overflow-hidden !p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:!p-8"
                style={{
                  animationDelay: `${i * 80}ms`,
                  borderLeft: `4px solid ${meta.accent}`,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: `${meta.accent}18`,
                        color: meta.accent,
                      }}
                    >
                      <meta.Icon />
                    </span>
                    <p className="max-w-[10rem] pt-2 text-sm font-semibold leading-5 text-muted-foreground">
                      {card.label}
                    </p>
                  </div>
                  <Badge variant={card.value > 0 ? "warning" : "neutral"}>
                    {card.value > 0 ? "À traiter" : "À jour"}
                  </Badge>
                </div>
                <p className="font-serif text-4xl font-bold leading-none text-foreground">
                  {card.value}
                </p>

                {/* animated bottom accent line, slides in on hover */}
                <div
                  className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                  style={{
                    background: `linear-gradient(90deg, ${meta.accent}, transparent)`,
                  }}
                />
              </Card>
            );
          })}

          <Card
            className="stat-rise group relative min-h-40 overflow-hidden !p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{
              animationDelay: `${cards.length * 80}ms`,
              borderLeft: `4px solid ${RATING_ACCENT}`,
            }}
          >
            <div
              className="flex h-full min-h-40 flex-col gap-7 bg-[var(--color-warning-soft)]/40"
              style={{ padding: "1.5rem", boxSizing: "border-box" }}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: "var(--color-warning-soft)",
                      color: RATING_ACCENT,
                    }}
                  >
                    <IcoStar className="h-5 w-5" />
                  </span>
                  <div className="pt-2">
                    <p className="text-sm font-semibold leading-5 text-foreground">
                      Note moyenne
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Avis de vos clients
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-baseline gap-3">
                <p className="font-serif text-4xl font-bold leading-none text-foreground">
                  {ratingSummary ? ratingSummary.average.toFixed(1) : "—"}/5
                </p>
                <span className="ml-auto text-s font-semibold text-muted-foreground">
                  ({ratingSummary ? ratingSummary.count : "—"} avis)
                </span>
              </div>
            </div>

            <div
              className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
              style={{
                background: `linear-gradient(90deg, ${RATING_ACCENT}, transparent)`,
              }}
            />
          </Card>
        </div>
      </section>
    </div>
  );
}
