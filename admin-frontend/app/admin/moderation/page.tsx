'use client'
import { useEffect, useState } from "react";
import { getPendingOffers, updateOfferStatus } from "@/lib/api/offers";
import { getPendingPublications, updatePublicationStatus } from "@/lib/api/publications";
import { getAllReviews, deleteReview } from "@/lib/api/reviews";
import { Toast } from "@/components/Toast";
import { ConfirmModal } from "@/components/ConfirmModal";
import type { Offer,Review,Publication} from "@/lib/data";

type Tab = "offers" | "publications" | "reviews";

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState<Tab>("offers");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [deleteReviewTarget, setDeleteReviewTarget] = useState<Review | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [offersData, pubsData, reviewsData] = await Promise.all([
        getPendingOffers(),
        getPendingPublications(),
        getAllReviews(),
      ]);
      setOffers(offersData);
      setPublications(pubsData);
      setReviews(reviewsData);
    } catch (err) {
      console.error(err);
      setToast({ message: "Erreur lors du chargement.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleOfferStatus(id: number, status: "approuvee" | "rejetee") {
    try {
      await updateOfferStatus(id, status);
      setOffers((prev) => prev.filter((o) => o.id !== id));
      setToast({ message: status === "approuvee" ? "Offre approuvée." : "Offre rejetée.", type: "success" });
    } catch (err: any) {
      setToast({ message: err?.response?.data?.message ?? "Erreur.", type: "error" });
    }
  }

  async function handlePublicationStatus(id: number, status: "approuvee" | "rejetee") {
    try {
      await updatePublicationStatus(id, status);
      setPublications((prev) => prev.filter((p) => p.id !== id));
      setToast({ message: status === "approuvee" ? "Publication approuvée." : "Publication rejetée.", type: "success" });
    } catch (err: any) {
      setToast({ message: err?.response?.data?.message ?? "Erreur.", type: "error" });
    }
  }

  async function handleDeleteReview() {
    if (!deleteReviewTarget) return;
    try {
      await deleteReview(deleteReviewTarget.id);
      setReviews((prev) => prev.filter((r) => r.id !== deleteReviewTarget.id));
      setToast({ message: "Avis supprimé.", type: "success" });
    } catch (err: any) {
      setToast({ message: err?.response?.data?.message ?? "Erreur.", type: "error" });
    } finally {
      setDeleteReviewTarget(null);
    }
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {deleteReviewTarget && (
        <ConfirmModal
          title="Supprimer cet avis ?"
          message="Cette action est irréversible."
          confirmLabel="Supprimer"
          onConfirm={handleDeleteReview}
          onCancel={() => setDeleteReviewTarget(null)}
        />
      )}

      <h1 className="mb-6 text-2xl font-medium text-stone-900">Modération</h1>

      <div className="flex gap-1 border-b border-stone-200 mb-5">
        <TabButton label={`Offres (${offers.length})`} active={activeTab === "offers"} onClick={() => setActiveTab("offers")} />
        <TabButton label={`Publications (${publications.length})`} active={activeTab === "publications"} onClick={() => setActiveTab("publications")} />
        <TabButton label={`Avis (${reviews.length})`} active={activeTab === "reviews"} onClick={() => setActiveTab("reviews")} />
      </div>

      {loading ? (
        <p className="text-sm text-stone-500">Chargement...</p>
      ) : (
        <>
          {activeTab === "offers" && (
            offers.length === 0 ? (
              <p className="text-sm text-stone-500">Aucune offre en attente.</p>
            ) : (
              <div className="space-y-3">
                {offers.map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between bg-white border border-stone-200 rounded-lg p-4">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{offer.title}</p>
                      <p className="text-xs text-stone-500">{offer.agents?.name} · {offer.agents?.ville}</p>
                      <p className="text-sm text-stone-600 mt-1">{offer.description}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleOfferStatus(offer.id, "approuvee")} className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs text-white hover:scale-105 cursor-pointer">✅ Approuver</button>
                      <button onClick={() => handleOfferStatus(offer.id, "rejetee")} className="rounded-full bg-red-600 px-3 py-1.5 text-xs text-white hover:scale-105 cursor-pointer">❌ Rejeter</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === "publications" && (
            publications.length === 0 ? (
              <p className="text-sm text-stone-500">Aucune publication en attente.</p>
            ) : (
              <div className="space-y-3">
                {publications.map((pub) => (
                  <div key={pub.id} className="flex items-center justify-between bg-white border border-stone-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <img src={pub.photo_url} alt="" className="w-16 h-12 object-cover rounded" />
                      <div>
                        <p className="text-sm font-medium text-stone-900">{pub.titre}</p>
                        <p className="text-sm text-stone-600">{pub.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handlePublicationStatus(pub.id, "approuvee")} className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs text-white hover:scale-105 cursor-pointer">✅ Approuver</button>
                      <button onClick={() => handlePublicationStatus(pub.id, "rejetee")} className="rounded-full bg-red-600 px-3 py-1.5 text-xs text-white hover:scale-105 cursor-pointer">❌ Rejeter</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === "reviews" && (
            reviews.length === 0 ? (
              <p className="text-sm text-stone-500">Aucun avis.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review.id} className="flex items-center justify-between bg-white border border-stone-200 rounded-lg p-4">
                    <div>
                      <p className="text-sm text-amber-600">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
                      <p className="text-sm text-stone-600 mt-1">{review.comment}</p>
                    </div>
                    <button onClick={() => setDeleteReviewTarget(review)} className="text-xs text-red-600 hover:underline cursor-pointer shrink-0">
                      🗑️ Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition cursor-pointer ${
        active ? "border-stone-900 text-stone-900" : "border-transparent text-stone-500 hover:text-stone-700"
      }`}
    >
      {label}
    </button>
  );
}