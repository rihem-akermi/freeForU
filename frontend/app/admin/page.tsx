"use client";

import React, { useEffect, useState } from "react";
import { getAgents } from "@/lib/api/agents";
import { getCategories } from "@/lib/api/categories";
import { getContacts } from "@/lib/api/contacts";
import { getPendingPublications } from "@/lib/api/publications";
import { getReservations } from "@/lib/api/reservations";
import { getUsers } from "@/lib/api/users";
import { PageHeader, Badge } from "@/components/ui/UIComponents";

/* ── icons ─────────────────────────────────────────────────────── */
function IcoUsers({ className = "w-5 h-5" }: { className?: string }) {
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
        d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-6a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}
function IcoBriefcase({ className = "w-5 h-5" }: { className?: string }) {
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
        d="M20 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
      />
    </svg>
  );
}
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
function IcoMail({ className = "w-5 h-5" }: { className?: string }) {
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
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}
function IcoTag({ className = "w-5 h-5" }: { className?: string }) {
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
        d="M7 7h.01M3 11V6a2 2 0 012-2h5a2 2 0 011.41.59l9 9a2 2 0 010 2.82l-6 6a2 2 0 01-2.82 0l-9-9A2 2 0 013 11z"
      />
    </svg>
  );
}
function IcoClock({ className = "w-5 h-5" }: { className?: string }) {
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
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

/* ── stat metadata (visual only, no logic) ──────────────────────── */
/* Accent hues are decorative per-category tints, deliberately kept out of
   green/blue territory since those are reserved for semantic success/info
   states elsewhere in the app. Drawn from the approved palette additions
   (navy variants, burgundy, soft violet) instead. */
interface StatConfig {
  Icon: (p: { className?: string }) => React.JSX.Element;
  accent: string;
  description: string;
}

const STAT_CONFIG: Record<string, StatConfig> = {
  Réservations: {
    Icon: IcoCalendar,
    accent: "#9D8099", // mauve — reserved for the hero stat
    description: "Réservations totales enregistrées",
  },
  "Publications En Attentes": {
    Icon: IcoClock,
    accent: "#C4956A", // warm terracotta
    description: "En attente de validation",
  },
  Clients: {
    Icon: IcoUsers,
    accent: "#46607D", // soft navy variation
    description: "Clients inscrits",
  },
  Agents: {
    Icon: IcoBriefcase,
    accent: "#7D6E8C", // soft violet
    description: "Prestataires actifs",
  },
  Contacts: {
    Icon: IcoMail,
    accent: "#7A3B47", // burgundy
    description: "Messages reçus",
  },
  Categories: {
    Icon: IcoTag,
    accent: "#9C5F63", // burgundy / dusty rose
    description: "Catégories publiées",
  },
};
const FALLBACK_CONFIG: StatConfig = {
  Icon: IcoTag,
  accent: "#9D8099",
  description: "",
};

/* ── skeleton ───────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="app-stack gap-10 animate-pulse">
      <div className="h-10 w-56 rounded-xl bg-muted" />
      <div className="h-44 w-full rounded-3xl bg-muted" />
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

/* ── main page ──────────────────────────────────────────────────── */
export default function PageAdmin() {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<{ label: string; value: number }[]>([]);
  const [ts, setTs] = useState("");

  useEffect(() => {
    async function loadAll() {
      try {
        const [
          users,
          agents,
          reservations,
          contacts,
          categories,
          pendingPublications,
        ] = await Promise.all([
          getUsers(),
          getAgents(),
          getReservations(),
          getContacts(),
          getCategories(),
          getPendingPublications(),
        ]);
        setCards([
          { label: "Clients", value: users.length },
          { label: "Agents", value: agents.length },
          { label: "Réservations", value: reservations.length },
          { label: "Contacts", value: contacts.length },
          { label: "Categories", value: categories.length },
          {
            label: "Publications En Attentes ",
            value: pendingPublications.length,
          },
        ]);
        setTs(
          new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  if (loading) return <Skeleton />;

  /* pull "Réservations" out as the hero stat */
  const hero = cards.find((c) => c.label.trim() === "Réservations");
  const rest = cards.filter((c) => c.label.trim() !== "Réservations");
  const isPending = (label: string) =>
    label.trim() === "Publications En Attentes";

  return (
    <>
      <style>{`
        @keyframes rise {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .stat-rise { animation: rise .5s cubic-bezier(.22,1,.36,1) backwards; }
      `}</style>

      <div className="app-stack w-full max-w-none gap-10">
        <PageHeader
          title="Vue d'ensemble"
          subtitle="Suivez l'activité de la plateforme en un coup d'œil."
          badge="Tableau de bord"
          actionSlot={
            ts ? (
              <div className="hidden shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground shadow-sm sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
                {ts}
              </div>
            ) : undefined
          }
        />

        {/* ── hero stat ───────────────────────────────────────────── */}
        {hero &&
          (() => {
            const cfg = STAT_CONFIG[hero.label.trim()] ?? FALLBACK_CONFIG;
            return (
              <div
                className="stat-rise relative overflow-hidden rounded-3xl bg-primary px-10 py-8 sm:px-14 sm:py-10"
                style={{ animationDelay: "0ms" }}
              >
                {/* decorative grid lines */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[.06]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                  aria-hidden="true"
                />
                {/* radial glow */}
                <div
                  className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full opacity-20"
                  style={{
                    background:
                      "radial-gradient(circle, var(--color-accent), transparent 70%)",
                  }}
                  aria-hidden="true"
                />

                <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2.5 rounded-full bg-primary-foreground/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-accent ring-1 ring-primary-foreground/10">
                      <cfg.Icon className="h-4 w-4" />
                      {hero.label.trim()}
                    </div>
                    <p className="font-serif text-7xl font-bold leading-none tracking-tight text-primary-foreground sm:text-8xl">
                      {hero.value.toLocaleString("fr-FR")}
                    </p>
                    <p className="mt-3 text-base text-primary-foreground/50">
                      {STAT_CONFIG["Réservations"].description}
                    </p>
                  </div>

                  {/* decorative right side — big translucent number echo */}
                  <p
                    className="select-none font-serif text-[9rem] font-bold leading-none tracking-tight text-primary-foreground/[.04] sm:text-[12rem]"
                    aria-hidden="true"
                  >
                    {hero.value}
                  </p>
                </div>
              </div>
            );
          })()}

        {/* ── secondary grid ──────────────────────────────────────── */}
        <section aria-labelledby="admin-stats" className="app-stack gap-5">
          <h2
            id="admin-stats"
            className="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground"
          >
            Statistiques clés
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {rest.map((card, i) => {
              const cfg = STAT_CONFIG[card.label.trim()] ?? FALLBACK_CONFIG;
              const alert = isPending(card.label) && card.value > 0;

              return (
                <div
                  key={card.label}
                  className="stat-rise group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    animationDelay: `${(i + 1) * 70}ms`,
                    borderLeft: `3px solid ${cfg.accent}`,
                  }}
                >
                  <div className="flex flex-1 flex-col px-6 py-6">
                    {/* icon + alert badge row */}
                    <div className="mb-5 flex items-center justify-between">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                        style={{
                          background: `${cfg.accent}18`,
                          color: cfg.accent,
                        }}
                      >
                        <cfg.Icon className="h-5 w-5" />
                      </div>
                      {alert && <Badge variant="warning">Action</Badge>}
                    </div>

                    {/* number */}
                    <p className="font-serif text-5xl font-bold leading-none tracking-tight text-foreground">
                      {card.value.toLocaleString("fr-FR")}
                    </p>

                    {/* label + description */}
                    <div className="mt-3 space-y-0.5">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {card.label.trim()}
                      </p>
                      {cfg.description && (
                        <p className="text-sm text-muted-foreground/80">
                          {cfg.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* bottom accent line that slides in on hover */}
                  <div
                    className="h-[3px] w-full scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"
                    style={{
                      background: `linear-gradient(90deg, ${cfg.accent}, transparent)`,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
