"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";

type Review = {
  id: number;
  rating: number;
  comment: string | null;
  is_visible: boolean;
  created_at: string;
  user?: { id: number; name: string; email: string } | null;
  instrumental?: { id: number; title: string } | null;
};

export default function AdminAvisPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/connexion?redirect=/admin/avis");
      return;
    }

    async function load() {
      try {
        const res = await api.get("/admin/reviews");
        setReviews(res?.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [router]);

  const handleToggle = async (id: number) => {
    try {
      const res = await api.post(`/admin/reviews/${id}/toggle`);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_visible: res.is_visible } : r))
      );
      setToast({ message: res.message, variant: "success" });
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : "Erreur", variant: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer définitivement cet avis ?")) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setToast({ message: "Avis supprimé.", variant: "success" });
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : "Erreur", variant: "error" });
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-16 text-center">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Modération des avis</h1>
        <p className="text-content-secondary">
          Masquez ou supprimez les avis inappropriés.
        </p>
      </div>

      {reviews.length === 0 ? (
        <Card padding="lg" className="text-center py-16">
          <span className="text-5xl block mb-4">💬</span>
          <p className="text-content-secondary">Aucun avis pour le moment.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id} padding="lg">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{review.user?.name ?? "—"}</span>
                    <span className="text-xs text-content-secondary">·</span>
                    <span className="text-xs text-content-secondary">
                      {review.instrumental?.title ?? "—"}
                    </span>
                  </div>
                  <div className="flex text-yellow-400 text-sm mb-2">
                    {Array.from({ length: review.rating }).map((_, i) => <span key={i}>★</span>)}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-content-secondary bg-background-secondary p-3 rounded-lg">
                      {review.comment}
                    </p>
                  )}
                  <p className="text-xs text-content-secondary mt-2">
                    Publié le {new Date(review.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={review.is_visible ? "success" : "danger"}>
                    {review.is_visible ? "Visible" : "Masqué"}
                  </Badge>
                  <Button
                    size="sm"
                    variant={review.is_visible ? "secondary" : "primary"}
                    onClick={() => handleToggle(review.id)}
                  >
                    {review.is_visible ? "Masquer" : "Afficher"}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(review.id)}>
                    Supprimer
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}