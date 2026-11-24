"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Toast from "@/components/ui/Toast";

type Playlist = {
  id: number;
  name: string;
  description: string | null;
  is_public: boolean;
  instrumentals_count?: number;
  created_at: string;
};

export default function PlaylistsPage() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  // Création
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/connexion?redirect=/profil/playlists");
      return;
    }
    async function load() {
      try {
        const res = await api.get("/playlists");
        setPlaylists(res?.data ?? []);
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
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await api.post("/playlists", { name: newName, description: newDesc });
      setPlaylists((prev) => [{ ...res.data, instrumentals_count: 0 }, ...prev]);
      setToast({ message: "Playlist créée !", variant: "success" });
      setNewName("");
      setNewDesc("");
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
    if (!confirm("Supprimer cette playlist ?")) return;
    try {
      await api.delete(`/playlists/${id}`);
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
      setToast({ message: "Playlist supprimée.", variant: "success" });
    } catch (e: unknown) {
      setToast({
        message: e instanceof Error ? e.message : "Erreur",
        variant: "error",
      });
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-16 text-center">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <Link href="/profil" className="text-sm text-content-secondary hover:text-accent mb-4 inline-block">
          ← Retour au profil
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mes playlists</h1>
            <p className="text-content-secondary">Organisez vos instrumentales préférées.</p>
          </div>
          <Button variant="primary" onClick={() => setShowCreate(!showCreate)}>
            + Nouvelle playlist
          </Button>
        </div>
      </div>

      {showCreate && (
        <Card padding="lg" className="mb-6">
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nom *</label>
              <input
                required
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-background focus:border-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description (optionnelle)</label>
              <textarea
                rows={2}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-background focus:border-accent outline-none"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" loading={creating}>Créer</Button>
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Annuler</Button>
            </div>
          </form>
        </Card>
      )}

      {playlists.length === 0 ? (
        <Card padding="lg" className="text-center py-16">
          <span className="text-5xl block mb-4">🎵</span>
          <p className="text-content-secondary mb-4">Vous n&apos;avez pas encore de playlist.</p>
          <Button variant="primary" onClick={() => setShowCreate(true)}>Créer ma première playlist</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {playlists.map((p) => (
            <Card key={p.id} padding="lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Link href={`/profil/playlists/${p.id}`}>
                    <h2 className="text-lg font-semibold hover:text-accent transition-colors">{p.name}</h2>
                  </Link>
                  {p.description && (
                    <p className="text-sm text-content-secondary mt-1">{p.description}</p>
                  )}
                  <p className="text-xs text-content-secondary mt-2">
                    {p.instrumentals_count ?? 0} instrumentale{(p.instrumentals_count ?? 0) > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/profil/playlists/${p.id}`}>
                    <Button size="sm" variant="secondary">Voir</Button>
                  </Link>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(p.id)}>Supprimer</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}