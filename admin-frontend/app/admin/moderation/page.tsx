"use client";
import { useEffect, useState } from "react";
import {
  getPendingPublications,
  updatePublicationStatus,
} from "@/lib/api/publications";
import { getAllReviews, deleteReview } from "@/lib/api/reviews";
import { Toast } from "@/components/Toast";
import { ConfirmModal } from "@/components/ConfirmModal";
import type { Review, Publication } from "@/lib/data";
import {
  Button,
  Badge,
  PageHeader,
  IconCheck,
  IconClose,
  IconDelete,
} from "@/components/ui/UIComponents";

type Tab = "publications" | "reviews";

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState<Tab>("publications");
  const [publications, setPublications] = useState<Publication[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [deleteReviewTarget, setDeleteReviewTarget] = useState<Review | null>(
    null,
  );

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [pubsData, reviewsData] = await Promise.all([
        getPendingPublications(),
        getAllReviews(),
      ]);
      setPublications(pubsData);
      setReviews(reviewsData);
    } catch (err) {
      console.error(err);
      setToast({ message: "Erreur lors du chargement.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handlePublicationStatus(
    id: number,
    status: "approuvee" | "rejetee",
  ) {
    try {
      await updatePublicationStatus(id, status);
      setPublications((prev) => prev.filter((p) => p.id !== id));
      setToast({
        message:
          status === "approuvee"
            ? "Publication approuvée."
            : "Publication rejetée.",
        type: "success",
      });
    } catch (err: any) {
      setToast({
        message: err?.response?.data?.message ?? "Erreur.",
        type: "error",
      });
    }
  }

  async function handleDeleteReview() {
    if (!deleteReviewTarget) return;
    try {
      await deleteReview(deleteReviewTarget.id);
      setReviews((prev) => prev.filter((r) => r.id !== deleteReviewTarget.id));
      setToast({ message: "Avis supprimé.", type: "success" });
    } catch (err: any) {
      setToast({
        message: err?.response?.data?.message ?? "Erreur.",
        type: "error",
      });
    } finally {
      setDeleteReviewTarget(null);
    }
  }

  return (
    <div className="w-full">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {deleteReviewTarget && (
        <ConfirmModal
          title="Supprimer cet avis ?"
          message="Cette action est irréversible."
          confirmLabel="Supprimer"
          onConfirm={handleDeleteReview}
          onCancel={() => setDeleteReviewTarget(null)}
        />
      )}

      <PageHeader
        title="Modération"
        subtitle="Validez les publications en attente et gérez les avis clients."
        badge="Administration"
      />

      <div className="mb-6 flex gap-1 border-b border-border">
        <TabButton
          label="Publications"
          count={publications.length}
          active={activeTab === "publications"}
          onClick={() => setActiveTab("publications")}
        />
        <TabButton
          label="Avis"
          count={reviews.length}
          active={activeTab === "reviews"}
          onClick={() => setActiveTab("reviews")}
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : (
        <>
          {activeTab === "publications" &&
            (publications.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune publication en attente.
              </p>
            ) : (
              <div className="space-y-3">
                {publications.map((pub) => (
                  <div
                    key={pub.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={pub.photo_url}
                        alt=""
                        className="h-14 w-20 shrink-0 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">
                          {pub.titre}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {pub.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        variant="accent"
                        onClick={() =>
                          handlePublicationStatus(pub.id, "approuvee")
                        }
                      >
                        <IconCheck /> Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          handlePublicationStatus(pub.id, "rejetee")
                        }
                      >
                        <IconClose /> Rejeter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ))}

          {activeTab === "reviews" &&
            (reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun avis.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      {/* Qui → Qui */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-semibold text-foreground">
                          {review.users?.name ?? "Client inconnu"}
                        </span>
                        <span className="text-xs text-muted-foreground">→</span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {review.agents?.name ?? "Agent inconnu"}
                        </span>
                      </div>

                      {/* Étoiles */}
                      <p className="text-sm tracking-wide text-[var(--color-warning)]">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </p>

                      {/* Commentaire */}
                      {review.comment && (
                        <p className="mt-1.5 text-sm text-muted-foreground truncate">
                          {review.comment}
                        </p>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteReviewTarget(review)}
                      className="shrink-0"
                    >
                      <IconDelete /> Supprimer
                    </Button>
                  </div>
                ))}
              </div>
            ))}
        </>
      )}
    </div>
  );
}

function TabButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "border-accent text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      <Badge variant={active ? "info" : "neutral"}>{count}</Badge>
    </button>
  );
}
