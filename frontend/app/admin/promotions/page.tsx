"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";

type Promotion = {
  id: number;
  discount_percent: number;
  starts_at: string;
  ends_at: string;
  active: boolean;
  instrumental?: { title: string } | null;
};

type Instrumental = { id: number; title: string };

export default function AdminPromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [instrumentals, setInstrumentals] = useState<Instrumental[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [instrumentalId, setInstrumentalId] = useState("");
  const [discount, setDiscount] = useState("20");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/connexion?redirect=/admin/promotions");
      return;
    }
    async function load() {
      try {
        const [promosRes, instRes] = await Promise.all([
          api.get("/admin/promotions"),
          api.get("/instrumentals?sort=recent"),
        ]);
        setPromotions(promosRes?.data ?? []);
        setInstrumentals(instRes?.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post("/admin/promotions", {
        instrumental_id: parseInt(instrumentalId),
        discount_percent: parseInt(discount),
        starts_at: startsAt,
        ends_at: endsAt,
      });
      setPromotions((prev) => [res.data, ...prev]);
      setToast({ message: "Promotion créée !", variant: "success" });
      setInstrumentalId("");
      setDiscount("20");
      setStartsAt("");
      setEndsAt("");
      setShowCreate(false);
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : "Erreur", variant: "error" });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette promotion ?")) return;
    try {
      await api.delete(`/admin/promotions/${id}`);
      setPromotions((prev) => prev.filter((p) => p.id !== id));
      setToast({ message: "Promotion supprimée.", variant: "success" });
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : "Erreur", variant: "error" });
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-16 text-center">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold mb-2">Promotions</h1>
          <p className="text-content-secondary">Créez des réductions temporaires sur vos instrumentales.</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(!showCreate)}>
          + Nouvelle promotion
        </Button>
      </div>

      {showCreate && (
        <Card padding="lg" className="mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Instrumentale *</label>
              <select required value={instrumentalId} onChange={(e) => setInstrumentalId(e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-background focus:border-accent outline-none">
                <option value="">Sélectionner...</option>
                {instrumentals.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Réduction (%) *</label>
                <input required type="number" min="1" max="90" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-background focus:border-accent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Début *</label>
                <input required type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-background focus:border-accent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fin *</label>
                <input required type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-background focus:border-accent outline-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" loading={creating}>Créer</Button>
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Annuler</Button>
            </div>
          </form>
        </Card>
      )}

      {promotions.length === 0 ? (
        <Card padding="lg" className="text-center py-16">
          <span className="text-5xl block mb-4">🎁</span>
          <p className="text-content-secondary">Aucune promotion pour le moment.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {promotions.map((promo) => {
            const now = new Date();
            const isActive = promo.active && new Date(promo.starts_at) <= now && new Date(promo.ends_at) >= now;
            return (
              <Card key={promo.id} padding="lg">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-lg font-bold mb-1">{promo.instrumental?.title ?? "—"}</h3>
                    <p className="text-sm"><strong className="text-accent">-{promo.discount_percent}%</strong></p>
                    <p className="text-xs text-content-secondary mt-1">
                      Du {new Date(promo.starts_at).toLocaleString("fr-FR")} au {new Date(promo.ends_at).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isActive ? "success" : "danger"}>
                      {isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(promo.id)}>Supprimer</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}