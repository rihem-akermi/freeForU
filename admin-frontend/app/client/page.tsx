"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPublicOffers } from "@/lib/api/offers";
import { getCategories } from "@/lib/api/categories";
import { Offer, Category } from "@/lib/data";
import { AgentSearchBar } from "@/components/AgentSearchBar";


export default function HomePage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    getPublicOffers(activeCategory ?? undefined)
      .then(setOffers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-dark)] mb-1">
            Trouvez le bon professionnel
          </h1>

          <p className="text-sm text-[var(--color-text-body)]">
            Parcourez les offres disponibles près de chez vous.
          </p>
        </div>

        <AgentSearchBar />
      </div>

      <div className="flex gap-2 flex-wrap m-6">
        <CategoryPill
          label="Toutes"
          active={activeCategory === null}
          onClick={() => setActiveCategory(null)}
        />
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
      ) : offers.length === 0 ? (
        <p className="text-sm text-[var(--color-text-body)]">
          Aucune offre disponible pour cette catégorie.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onClick={() => setSelectedOffer(offer)}
            />
          ))}
        </div>
      )}

      {selectedOffer && (
        <OfferModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onViewProfile={() =>
            router.push(`client/agent/${selectedOffer.agents?.id}`)
          }
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

function OfferCard({ offer, onClick }: { offer: Offer; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-[var(--color-card)] rounded-xl overflow-hidden border border-[var(--color-bg-alt)] shadow-sm hover:shadow-md transition cursor-pointer"
    >
      <div className="h-32 bg-[var(--color-bg-alt)]">
        {offer.cover_image && (
          <img
            src={offer.cover_image}
            alt={offer.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-3">
        {offer.agents && (
          <div className="flex items-center gap-1.5 mt-1.5 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-[var(--color-bg-alt)] overflow-hidden shrink-0">
              {offer.agents.photo_url && (
                <img
                  src={offer.agents.photo_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <span className="text-xs text-[var(--color-text-body)] truncate">
              {offer.agents.name} · {offer.agents.ville}
            </span>
          </div>
        )}
        <p className="text-sm font-medium text-[var(--color-text-dark)] truncate">
          {offer.title}
        </p>
        {(offer.min_price || offer.max_price) && (
          <p className="text-xs text-[var(--color-primary)] font-medium mt-0.5">
            {offer.min_price ? `${Number(offer.min_price)} DT` : ""}
            {offer.min_price && offer.max_price ? " – " : ""}
            {offer.max_price ? `${Number(offer.max_price)} DT` : ""}
          </p>
        )}
        
      </div>
    </div>
  );
}

function OfferModal({
  offer,
  onClose,
  onViewProfile,
}: {
  offer: Offer;
  onClose: () => void;
  onViewProfile: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-[var(--color-card)] rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        {offer.cover_image && (
          <img
            src={offer.cover_image}
            alt={offer.title}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-[var(--color-text-dark)]">
            {offer.title}
          </h3>
          {(offer.min_price || offer.max_price) && (
            <p className="text-sm text-[var(--color-primary)] font-medium mt-1">
              {offer.min_price ? `${Number(offer.min_price)} DT` : ""}
              {offer.min_price && offer.max_price ? " – " : ""}
              {offer.max_price ? `${Number(offer.max_price)} DT` : ""}
            </p>
          )}
          <p className="text-sm text-[var(--color-text-body)] mt-3">
            {offer.description}
          </p>

          {offer.agents && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--color-bg-alt)]">
              <div className="w-9 h-9 rounded-full bg-[var(--color-bg-alt)] overflow-hidden shrink-0">
                {offer.agents.photo_url && (
                  <img
                    src={offer.agents.photo_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-dark)]">
                  {offer.agents.name}
                </p>
                <p className="text-xs text-[var(--color-text-body)]">
                  {offer.agents.ville}
                </p>
              </div>
            </div>
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
