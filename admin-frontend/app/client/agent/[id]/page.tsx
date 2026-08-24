"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAgentById } from "@/lib/api/agents";
import { getAgentPortfolio } from "@/lib/api/publications";
import {
  getAgentReviews,
  getAgentRatingSummary,
  RatingSummary,
} from "@/lib/api/reviews";
import type { Agent, Review, Publication } from "@/lib/data";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { DayAvailabilityModal } from "@/components/DayAvailabilityModal";
import { ReservationForm } from "@/components/ReservationForm";
import { Toast } from "@/components/Toast";
import AgentServicesTab from "@/components/AgentServicesTab";
import AgentWorkingHoursStatus from "@/components/AgentWorkingHoursStatus ";
import { Card, Badge } from "@/components/ui/UIComponents";
import { Service } from "@/lib/data";

type Tab = "infos" | "services" | "portfolio" | "avis" | "disponibilites";
const ABOUT_ACCENT = "#46607D";
const PORTFOLIO_ACCENT = "#7D6E8C";
const AVIS_ACCENT = "#9C5F63";

function IcoCheck({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
function IcoStar({
  className = "w-4 h-4",
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
function IcoInfo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 11v5m0-8h.01" />
    </svg>
  );
}

function StarRating({
  rating,
  className = "h-3.5 w-3.5",
}: {
  rating: number;
  className?: string;
}) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[var(--color-warning)]">
      {Array.from({ length: 5 }).map((_, i) => (
        <IcoStar key={i} className={className} filled={i < rating} />
      ))}
    </span>
  );
}

export default function AgentProfilePage() {
  const params = useParams();
  const agentId = Number(params.id);

  const [agent, setAgent] = useState<Agent | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("infos");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [calendarVersion, setCalendarVersion] = useState(0);
  const [reservationSlot, setReservationSlot] = useState<{
    date: string;
    startTime: string | null;
    endTime: string | null;
  } | null>(null);
  const [servicesCount, setServicesCount] = useState(0);

  useEffect(() => {
    async function loadAll() {
      try {
        const [agentData, portfolioData, reviewsData, summaryData] =
          await Promise.all([
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

  if (loading)
    return <p className="p-6 text-sm text-muted-foreground">Chargement...</p>;
  if (!agent)
    return (
      <p className="p-6 text-sm text-[var(--color-danger)]">
        Profil introuvable.
      </p>
    );

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center gap-5">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted">
          {agent.photo_url ? (
            <img
              src={agent.photo_url}
              alt={agent.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground/40">
              {agent.name?.[0]}
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">
              {agent.name}
            </h1>
            {agent.verification_status === "verifie" && (
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-success)] text-white"
                title="Agent vérifié"
              >
                <IcoCheck className="h-3 w-3" />
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {agent.categories.name} · {agent.ville}
          </p>
          {summary && (
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-warning)]">
              <StarRating rating={Math.round(summary.average)} />
              {summary.average.toFixed(1)}
              <span className="font-normal text-muted-foreground">
                ({summary.count} avis)
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="mb-6 flex gap-1 border-b border-border overflow-x-auto scrollbar-hide">
        {(
          [
            { key: "infos", label: "Infos" },
            { key: "services", label: `Services (${servicesCount})` },
            { key: "portfolio", label: `Portfolio (${publications.length})` },
            { key: "avis", label: `Avis (${reviews.length})` },
            { key: "disponibilites", label: "Disponibilités" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`cursor-pointer shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "infos" && <InfosTab agent={agent} agentId={agentId} />}
      {activeTab === "portfolio" && (
        <PortfolioTab publications={publications} />
      )}
      {activeTab === "avis" && <AvisTab reviews={reviews} />}
      {activeTab === "services" && (
        <AgentServicesTab
          agentId={agentId}
          onCountChange={setServicesCount}
          onReserve={(service) => {
            setSelectedService(service);
            setActiveTab("disponibilites");
          }}
        />
      )}
      {activeTab === "disponibilites" && (
        <>
          {selectedService && (
            <div className="mb-3 rounded-lg bg-accent/10 px-4 py-2 text-sm text-foreground">
              Réservation pour : <strong>{selectedService.nom}</strong>
            </div>
          )}
          <div>
            <AvailabilityCalendar
              agentId={agentId}
              onSelectDay={(date) => setSelectedDate(date)}
              mode="client"
            />
          </div>
        </>
      )}

      {selectedDate && (
        <DayAvailabilityModal
          agentId={agentId}
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
          onProceed={(date, startTime, endTime) => {
            setSelectedDate(null);
            setReservationSlot({ date, startTime, endTime });
          }}
        />
      )}
      {reservationSlot && (
        <ReservationForm
          agentId={agentId}
          date={reservationSlot.date}
          workingStart={reservationSlot.startTime}
          workingEnd={reservationSlot.endTime}
          service={selectedService ?? undefined}
          onClose={() => {
            setReservationSlot(null);
            setSelectedService(null);
          }}
          onSuccess={() => {
            setReservationSlot(null);
            setSelectedService(null);
            setCalendarVersion((v) => v + 1);
            setToast({
              message: "Réservation envoyée ! En attente de confirmation.",
              type: "success",
            });
          }}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

function InfosTab({ agent, agentId }: { agent: Agent; agentId: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card
        className="!p-6"
        style={{ borderLeft: `4px solid ${ABOUT_ACCENT}` }}
      >
        <div className="mb-4 flex items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ background: `${ABOUT_ACCENT}18`, color: ABOUT_ACCENT }}
          >
            <IcoInfo />
          </span>
          <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
            À propos
          </h3>
        </div>

        {agent.bio && (
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            {agent.bio}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <InfoItem label="Zone d'intervention" value={agent.zone} />
          <InfoItem
            label="Expérience"
            value={
              agent.experience_years
                ? `${agent.experience_years} ans`
                : undefined
            }
          />
          <InfoItem
            label="Mode de service"
            value={
              {
                se_deplace: "Se déplace",
                recoit: "Reçoit",
                les_deux: "Les deux",
              }[agent.service_mode ?? ""]
            }
          />
          <InfoItem label="Téléphone" value={agent.phone} />
        </div>
      </Card>

      <AgentWorkingHoursStatus agentId={agentId} />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}

function PortfolioTab({ publications }: { publications: Publication[] }) {
  if (publications.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune publication pour le moment.
      </p>
    );
  }
  return (
    <div>
      <p className="mb-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {publications.length} publication{publications.length > 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {publications.map((pub) => (
          <div
            key={pub.id}
            className="group overflow-hidden rounded-xl border-2 border-border/70 bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ borderLeftColor: PORTFOLIO_ACCENT, borderLeftWidth: 4 }}
          >
            <img
              src={pub.photo_url}
              alt={pub.titre}
              className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="p-3">
              <p className="truncate text-xs font-semibold text-foreground">
                {pub.titre}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AvisTab({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun avis pour le moment.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
      {reviews.map((review) => (
        <Card
          key={review.id}
          className="!p-4"
          style={{ borderLeft: `3px solid ${AVIS_ACCENT}` }}
        >
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-foreground">
              {review.users?.name ?? "Client"}
            </span>
            <StarRating rating={review.rating} className="h-3 w-3" />
          </div>
          {review.comment && (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {review.comment}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}
