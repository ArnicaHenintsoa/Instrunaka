"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { formatPrice } from "@/lib/format";

type Pack = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  active: boolean;
  instrumentals_count?: number;
  created_at: string;
};

type Instrumental = {
  id: number;
  title: string;
  non_exclusive_price: number;
  producer?: { display_name: string } | null;
};

export default function AdminPacksPage() {
  const router = useRouter();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  // Création
  const [showCreate, setShowCreate] = useState(false);
  const [instrumentals, setInstrumentals] = useState<Instrumental[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/connexion?redirect=/admin/packs");
      return;
    }
    async function load() {
      try {
        const [packsRes, instRes] = await Promise.all([
          api.get("/admin/packs"),
          api.get("/instrumentals?sort=recent"),
        ]);
        setPacks(packsRes?.data ?? []);
        setInstrumentals(instRes?.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [router]);

  const toggleInstrumental = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const totalOriginalPrice = instrumentals
    .filter((i) => selectedIds.includes(i.id))
    .reduce((acc, i) => acc + i.non_exclusive_price, 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length < 2) {
      setToast({ message: "Sélectionnez au moins 2 instrumentales.", variant: "error" });
      return;
    }
    setCreating(true);
    try {
      const res = await api.post("/admin/packs", {
        name,
        description,
        price: parseInt(price),
        instrumental_ids: selectedIds,
      });
      setPacks((prev) => [res.data, ...prev]);
      setToast({ message: "Pack créé !", variant: "success" });
      setName("");
      setDescription("");
      setPrice("");
      setSelectedIds([]);
      setShowCreate(false);
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : "Erreur", variant: "error" });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce pack ?")) return;
    try {
      await api.delete(`/admin/packs/${id}`);
      setPacks((prev) => prev.filter((p) => p.id !== id));
      setToast({ message: "Pack supprimé.", variant: "success" });
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
          <h1 className="text-3xl font-bold mb-2">Packs</h1>
          <p className="text-content-secondary">Créez des offres groupées d&apos;instrumentales.</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(!showCreate)}>
          + Nouveau pack
        </Button>
      </div>

      {showCreate && (
        <div className="glass-card rounded-2xl p-6 mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom du pack *</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Pack Trap 2026"
                  className="w-full p-2.5 rounded-xl bg-background border border-border focus:border-accent outline-none text-content"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prix du pack (Ar) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background border border-border focus:border-accent outline-none text-content"
                />
                {totalOriginalPrice > 0 && (
                  <p className="text-xs text-content-secondary mt-1">
                    Prix cumulé : <strong>{formatPrice(totalOriginalPrice)}</strong>
                    {parseInt(price) > 0 && totalOriginalPrice > parseInt(price) && (
                      <span className="text-success"> · Économie de {formatPrice(totalOriginalPrice - parseInt(price))}</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-background border border-border focus:border-accent outline-none text-content"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Instrumentales incluses ({selectedIds.length} sélectionnée{selectedIds.length > 1 ? "s" : ""})
              </label>
              <div className="max-h-64 overflow-y-auto border border-border rounded-xl p-2 space-y-1">
                {instrumentals.map((inst) => (
                  <label
                    key={inst.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-secondary cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(inst.id)}
                      onChange={() => toggleInstrumental(inst.id)}
                      className="w-4 h-4 accent-[var(--accent)]"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-sm text-content">{inst.title}</span>
                      <span className="text-xs text-content-secondary ml-2">
                        {inst.producer?.display_name}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-content">{formatPrice(inst.non_exclusive_price)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" loading={creating}>Créer le pack</Button>
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Annuler</Button>
            </div>
          </form>
        </div>
      )}

      {packs.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-content-secondary">Aucun pack pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {packs.map((pack) => (
            <div key={pack.id} className="glass-card rounded-2xl p-5 animate-slide-up">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-bold mb-1 text-content">{pack.name}</h3>
                  {pack.description && (
                    <p className="text-sm text-content-secondary mb-1">{pack.description}</p>
                  )}
                  <p className="text-sm">
                    <strong className="text-accent">{formatPrice(pack.price)}</strong>
                    <span className="text-content-secondary ml-2">
                      · {pack.instrumentals_count ?? 0} instrumentale{(pack.instrumentals_count ?? 0) > 1 ? "s" : ""}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/packs/${pack.id}`}>
                    <Button size="sm" variant="secondary">Voir</Button>
                  </Link>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(pack.id)}>
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}