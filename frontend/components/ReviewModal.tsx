"use client";
import { useState } from "react";
import { createReview } from "@/lib/api/reviews";
import type { Review } from "@/lib/data";
import { Button, Textarea } from "@/components/ui/UIComponents";

type ReviewModalProps = {
  reservationId: number;
  onClose: () => void;
  onSuccess: (review: Review) => void;
};

function IcoStar({ className = "w-8 h-8", filled = true }: { className?: string; filled?: boolean }) {
  return (
    <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.5} viewBox="0 0 24 24">
      <path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7-5.4-4.7 7.1-.7z" />
    </svg>
  );
}

export function ReviewModal({ reservationId, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Veuillez choisir une note.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const review = await createReview({
        reservation_id: reservationId,
        rating,
        comment: comment.trim() || undefined,
      });
      onSuccess(review);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Erreur lors de l'envoi de l'avis.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <h3 className="mb-4 text-base font-semibold text-foreground">
          Votre avis nous intéresse
        </h3>

        <div className="mb-4 flex items-center justify-center gap-1.5 text-[var(--color-warning)]">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="cursor-pointer transition hover:scale-110"
              aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
            >
              <IcoStar className="h-8 w-8" filled={(hoverRating || rating) >= star} />
            </button>
          ))}
        </div>

        {error && <p className="mb-3 text-center text-sm text-[var(--color-danger)]">{error}</p>}

        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Un commentaire à ajouter ? (optionnel)"
          className="mb-4"
        />

        <div className="flex justify-end gap-3">
          <Button variant="neutral" onClick={onClose}>
            Plus tard
          </Button>
          <Button variant="primary" isLoading={submitting} onClick={handleSubmit}>
            Envoyer l'avis
          </Button>
        </div>
      </div>
    </div>
  );
}