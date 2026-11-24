"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";

type PromoCode = {
  id: number;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

export default function AdminPromoCodesPage() {
  const router = useRouter();
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  // Formulaire de création
  const [showCreate, setShowCreate] = useState(false);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("10");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/connexion?redirect=/admin/codes-promo");
      return;
    }
    async function load() {
      try {
        const res = await api.get("/admin/promo-codes");
        setCodes(res?.data ?? []);
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
      const payload: Record<string, unknown> = {
        code: code.toUpperCase(),
        discount_percent: parseInt(discount),
      };
      if (maxUses) payload.max_uses = parseInt(maxUses);
      if (expiresAt) payload.expires_at = expiresAt;

      const res = await api.post("/admin/promo-codes", payload);
      setCodes((prev) => [res.data, ...prev]);
      setToast({ message: "Code promo créé !", variant: "success" });
      setCode("");
      setDiscount("10");
      setMaxUses("");
      setExpiresAt("");
      setShowCreate(false);
    } catch (e: unknown) {
      setToast({
        message: e instanceof Error ? e.message : "Erreur",
        variant: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce code promo ?")) return;
    try {
      await api.delete(`/admin/promo-codes/${id}`);
      setCodes((prev) => prev.filter((c) => c.id !== id));
      setToast({ message: "Code supprimé.", variant: "success" });
    } catch (e: unknown) {
      setToast({
        message: e instanceof Error ? e.message : "Erreur",
        variant: "error",
      });
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-16 text-center">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold mb-2">Codes promo</h1>
          <p className="text-content-secondary">Créez et gérez les codes de réduction.</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(!showCreate)}>
          + Nouveau code
        </Button>
      </div>

      {showCreate && (
        <Card padding="lg" className="mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Code *</label>
                <input
                  required
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ex: WELCOME10"
                  className="w-full p-2.5 rounded-xl border border-border bg-background focus:border-accent outline-none uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Réduction (%) *</label>
                <input
                  required
                  type="number"
                  min="1"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background focus:border-accent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Utilisations max (optionnel)</label>
                <input
                  type="number"
                  min="1"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="Illimité si vide"
                  className="w-full p-2.5 rounded-xl border border-border bg-background focus:border-accent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expire le (optionnel)</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background focus:border-accent outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" loading={creating}>Créer le code</Button>
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Annuler</Button>
            </div>
          </form>
        </Card>
      )}

      {codes.length === 0 ? (
        <Card padding="lg" className="text-center py-16">
          <span className="text-5xl block mb-4">🎟️</span>
          <p className="text-content-secondary">Aucun code promo pour le moment.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {codes.map((c) => (
            <Card key={c.id} padding="lg">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold font-mono">{c.code}</h3>
                    <Badge variant={c.is_active ? "success" : "danger"}>
                      {c.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  <p className="text-sm text-content-secondary">
                    Réduction de <strong className="text-accent">-{c.discount_percent}%</strong>
                  </p>
                  <p className="text-xs text-content-secondary mt-1">
                    Utilisé {c.used_count} fois
                    {c.max_uses !== null && ` / ${c.max_uses}`}
                    {c.expires_at && ` · Expire le ${new Date(c.expires_at).toLocaleDateString("fr-FR")}`}
                  </p>
                </div>
                <Button size="sm" variant="danger" onClick={() => handleDelete(c.id)}>
                  Supprimer
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}