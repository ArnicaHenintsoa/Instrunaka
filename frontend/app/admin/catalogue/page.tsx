"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";

type Instrumental = {
  id: number;
  title: string;
  status: string;
  non_exclusive_price: number;
  exclusive_price: number;
  created_at: string;
  producer?: { user?: { name: string } | null } | null;
};

export default function AdminCataloguePage() {
  const router = useRouter();
  const [instrumentals, setInstrumentals] = useState<Instrumental[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  // État d'édition des prix
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPriceNonExclusive, setEditPriceNonExclusive] = useState("");
  const [editPriceExclusive, setEditPriceExclusive] = useState("");

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/connexion?redirect=/admin/catalogue");
      return;
    }

    async function load() {
      try {
        const res = await api.get("/admin/catalogue");
        setInstrumentals(res?.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [router]);

  const handleUpdatePrice = async (id: number) => {
    try {
      await api.put(`/admin/instrumentals/${id}`, {
        non_exclusive_price: parseInt(editPriceNonExclusive),
        exclusive_price: parseInt(editPriceExclusive),
      });
      setToast({ message: "Prix mis à jour.", variant: "success" });
      setInstrumentals((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, non_exclusive_price: parseInt(editPriceNonExclusive), exclusive_price: parseInt(editPriceExclusive) }
            : i
        )
      );
      setEditingId(null);
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : "Erreur", variant: "error" });
    }
  };

  const handleUnpublish = async (id: number) => {
    try {
      await api.post(`/admin/instrumentals/${id}/unpublish`);
      setToast({ message: "Instrumentale dépubliée.", variant: "success" });
      setInstrumentals((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "unpublished" } : i))
      );
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : "Erreur", variant: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer définitivement cette instrumentale ?")) return;
    try {
      await api.delete(`/admin/instrumentals/${id}`);
      setToast({ message: "Instrumentale supprimée.", variant: "success" });
      setInstrumentals((prev) => prev.filter((i) => i.id !== id));
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : "Erreur", variant: "error" });
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-16 text-center">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestion du catalogue</h1>
        <p className="text-content-secondary">Modifiez les prix, dépubliez ou supprimez des instrumentales.</p>
      </div>

      <div className="space-y-4">
        {instrumentals.map((inst) => (
          <div key={inst.id} className="glass-card rounded-2xl p-5 animate-slide-up">
            <div className="flex flex-col md:flex-row items-start md:justify-between gap-4">
              
              <div>
                <h2 className="text-lg font-semibold text-content">{inst.title}</h2>
                <p className="text-sm text-content-secondary">par {inst.producer?.user?.name ?? "Inconnu"}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant={
                    inst.status === "available" ? "success" : 
                    inst.status === "pending" ? "warning" : "danger"
                  }>
                    {inst.status === "available" ? "Publiée" : inst.status === "pending" ? "En attente" : "Dépubliée/Refusée"}
                  </Badge>
                </div>
              </div>

              {editingId === inst.id ? (
                <div className="flex flex-wrap items-end gap-3 w-full md:w-auto mt-4 md:mt-0">
                  <div>
                    <label className="block text-xs text-content-secondary mb-1">Prix non-excl.</label>
                    <input type="number" value={editPriceNonExclusive} onChange={(e) => setEditPriceNonExclusive(e.target.value)} className="w-24 p-2 rounded-xl bg-background border border-border text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-content-secondary mb-1">Prix excl.</label>
                    <input type="number" value={editPriceExclusive} onChange={(e) => setEditPriceExclusive(e.target.value)} className="w-24 p-2 rounded-xl bg-background border border-border text-sm" />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <Button size="sm" onClick={() => handleUpdatePrice(inst.id)} className="flex-1 sm:flex-none">Enregistrer</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="flex-1 sm:flex-none">Annuler</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                  <span className="text-sm font-medium text-content md:mr-4">
                    {inst.non_exclusive_price} Ar / {inst.exclusive_price} Ar
                  </span>
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Button size="sm" variant="secondary" onClick={() => {
                      setEditingId(inst.id);
                      setEditPriceNonExclusive(inst.non_exclusive_price.toString());
                      setEditPriceExclusive(inst.exclusive_price.toString());
                    }} className="flex-1 md:flex-none">Modifier prix</Button>
                    
                    {inst.status === "available" && (
                      <Button size="sm" variant="ghost" onClick={() => handleUnpublish(inst.id)} className="flex-1 md:flex-none">Dépublier</Button>
                    )}
                    
                    <Button size="sm" variant="danger" onClick={() => handleDelete(inst.id)} className="flex-1 md:flex-none">Supprimer</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}