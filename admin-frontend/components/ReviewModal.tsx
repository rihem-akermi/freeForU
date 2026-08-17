"use client";
import { useState } from "react";
import { createReview } from "@/lib/api/reviews";
import type { Review } from "@/lib/data";

type ReviewModalProps = {
  reservationId: number;
  onClose: () => void;
  onSuccess: (review: Review) => void;
};

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-[var(--color-card)] rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <h3 className="text-base font-semibold text-[var(--color-text-dark)] mb-4">
          Your FeedBack 🍀 ?
        </h3>

        <div className="flex items-center justify-center gap-1.5 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-3xl transition cursor-pointer"
            >
              {(hoverRating || rating) >= star ? "★" : "☆"}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 mb-3 text-center">{error}</p>}

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Un commentaire à ajouter ? (optionnel)"
          className="w-full p-3 rounded-xl bg-white border border-stone-200 text-sm text-[var(--color-text-dark)] placeholder:text-stone-400 resize-none outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 mb-4"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg text-[var(--color-text-body)] hover:bg-[var(--color-bg-alt)] transition cursor-pointer"
          >
            Plus tard
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--color-primary)] text-white hover:scale-[1.02] active:scale-95 transition disabled:opacity-50"
          >
            {submitting ? "Envoi..." : "Envoyer l'avis"}
          </button>
        </div>
      </div>
    </div>
  );
}