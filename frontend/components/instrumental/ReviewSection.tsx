"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type Review = {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  user: { id: number; name: string };
};

export default function ReviewSection({ instrumentalId }: { instrumentalId: number }) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/instrumentals/${instrumentalId}/reviews`);
        setReviews(res?.data ?? []);

        if (auth.isAuthenticated()) {
          const mine = await api.get(`/instrumentals/${instrumentalId}/my-review`);
          if (mine?.data) {
            setMyReview(mine.data);
            setRating(mine.data.rating);
            setComment(mine.data.comment ?? "");
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [instrumentalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.isAuthenticated()) {
      router.push(`/connexion?redirect=/instrumentales/${instrumentalId}`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/instrumentals/${instrumentalId}/reviews`, { rating, comment });
      setMyReview(res.data);
      // Recharger la liste
      const list = await api.get(`/instrumentals/${instrumentalId}/reviews`);
      setReviews(list?.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer votre avis ?")) return;
    try {
      await api.delete(`/instrumentals/${instrumentalId}/reviews`);
      setMyReview(null);
      setRating(5);
      setComment("");
      const list = await api.get(`/instrumentals/${instrumentalId}/reviews`);
      setReviews(list?.data ?? []);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <p className="text-sm text-content-secondary mt-6">Chargement des avis...</p>;

  const avg = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <Card padding="lg" className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Avis et notes</h2>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-accent">{avg}</span>
          <span className="text-sm text-content-secondary">/ 5 ({reviews.length} avis)</span>
        </div>
      </div>

      {/* Formulaire (utilisateur connecté) */}
      {auth.isAuthenticated() ? (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-background-secondary rounded-xl">
          <p className="text-sm font-medium mb-3">
            {myReview ? "Modifier votre avis" : "Laisser un avis"}
          </p>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-3xl transition-colors ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Votre commentaire (optionnel)..."
            className="w-full p-3 rounded-xl border border-border bg-background focus:border-accent outline-none text-sm mb-3"
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={submitting}>
              {myReview ? "Mettre à jour" : "Publier"}
            </Button>
            {myReview && (
              <Button type="button" variant="ghost" size="sm" onClick={handleDelete}>
                Supprimer
              </Button>
            )}
          </div>
        </form>
      ) : (
        <p className="text-sm text-content-secondary mb-6 p-4 bg-background-secondary rounded-xl">
          <a href={`/connexion?redirect=/instrumentales/${instrumentalId}`} className="text-accent hover:underline">
            Connectez-vous
          </a>{" "}
          pour laisser un avis.
        </p>
      )}

      {/* Liste des avis */}
      {reviews.length === 0 ? (
        <p className="text-sm text-content-secondary">Aucun avis pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-4 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{review.user.name}</span>
                <div className="flex text-yellow-400 text-sm">
                  {Array.from({ length: review.rating }).map((_, i) => <span key={i}>★</span>)}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-content-secondary">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}