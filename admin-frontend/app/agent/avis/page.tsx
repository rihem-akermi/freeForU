// app/agent/avis/page.tsx
'use client'

type Review = {
  id: number;
  client_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

type PublicationWithReviews = {
  publication_id: number;
  publication_description: string;
  reviews: Review[];
};

// Mock — sera remplacé par un fetch GET /agent/reviews
const mockData: PublicationWithReviews[] = [
  {
    publication_id: 1,
    publication_description: "Installation complète de sanitaires pour salle de bain neuve...",
    reviews: [
      {
        id: 1,
        client_name: "Sami Trabelsi",
        rating: 5,
        comment: "Travail impeccable, ponctuel et très professionnel.",
        created_at: "2026-07-05",
      },
      {
        id: 2,
        client_name: "Nour Jendoubi",
        rating: 4,
        comment: "Bon service, juste un peu de retard à l'arrivée.",
        created_at: "2026-07-08",
      },
    ],
  },
  {
    publication_id: 3,
    publication_description: "Rénovation complète de tuyauterie ancienne...",
    reviews: [
      {
        id: 3,
        client_name: "Mehdi Karray",
        rating: 3,
        comment: "Correct, mais le prix final était plus élevé que prévu.",
        created_at: "2026-06-30",
      },
    ],
  },
];

export default function AvisPage() {
  const allReviews = mockData.flatMap((pub) => pub.reviews);
  const noteMoyenne =
    allReviews.length > 0
      ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
      : null;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text-dark)]">
          Les avis
        </h1>
        {noteMoyenne && (
          <div className="flex items-center gap-2 bg-[var(--color-card)] rounded-full px-4 py-1.5">
            <span className="text-lg font-bold text-[var(--color-text-dark)]">{noteMoyenne}</span>
            <StarRating rating={Math.round(Number(noteMoyenne))} />
            <span className="text-xs text-[var(--color-text-body)]">({allReviews.length} avis)</span>
          </div>
        )}
      </div>

      {allReviews.length === 0 ? (
        <p className="text-sm text-[var(--color-text-body)]">
          Vous n'avez pas encore reçu d'avis.
        </p>
      ) : (
        <div className="space-y-6">
          {mockData.map((pub) => (
            <div key={pub.publication_id}>
              <p className="text-xs font-medium text-[var(--color-text-body)] mb-2 uppercase tracking-wide">
                Sur : {pub.publication_description}
              </p>
              <div className="space-y-3">
                {pub.reviews.map((review) => (
                  <div key={review.id} className="bg-white border border-stone-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[var(--color-text-dark)]">
                        {review.client_name}
                      </span>
                      <span className="text-xs text-[var(--color-text-body)]">{review.created_at}</span>
                    </div>
                    <StarRating rating={review.rating} />
                    <p className="text-sm text-[var(--color-text-body)] mt-2">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400 text-sm">
      {"★".repeat(rating)}
      <span className="text-stone-300">{"★".repeat(5 - rating)}</span>
    </span>
  );
}