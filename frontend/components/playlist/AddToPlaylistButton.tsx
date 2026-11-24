"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";

type Playlist = {
  id: number;
  name: string;
  instrumentals_count?: number;
};

type Props = {
  instrumentalId: number;
  size?: "sm" | "md";
};

export default function AddToPlaylistButton({ instrumentalId, size = "md" }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    async function load() {
      try {
        const res = await api.get("/playlists");
        setPlaylists(res?.data ?? []);
      } catch (e) {
        console.error(e);
      }
    }
    void load();
  }, [isOpen]);

  const handleOpen = () => {
    if (!auth.isAuthenticated()) {
      router.push(`/connexion?redirect=/instrumentales/${instrumentalId}`);
      return;
    }
    setIsOpen(true);
  };

  const handleAdd = async (playlistId: number) => {
    setLoading(true);
    try {
      await api.post(`/playlists/${playlistId}/add`, { instrumental_id: instrumentalId });
      setToast({ message: "Ajoutée à la playlist !", variant: "success" });
      setTimeout(() => {
        setIsOpen(false);
        setToast(null);
      }, 1200);
    } catch (e: unknown) {
      setToast({
        message: e instanceof Error ? e.message : "Erreur",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await api.post("/playlists", { name: newName });
      const newPlaylistId = res?.data?.id;
      if (newPlaylistId) {
        await api.post(`/playlists/${newPlaylistId}/add`, { instrumental_id: instrumentalId });
        setToast({ message: "Playlist créée et instrumentale ajoutée !", variant: "success" });
        setTimeout(() => {
          setIsOpen(false);
          setToast(null);
          setNewName("");
        }, 1200);
      }
    } catch (e: unknown) {
      setToast({
        message: e instanceof Error ? e.message : "Erreur",
        variant: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const padding = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";

  return (
    <>
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

      <button
        onClick={handleOpen}
        className={`shrink-0 rounded-xl font-medium transition-colors bg-background-secondary text-content hover:bg-accent-light ${padding}`}
        title="Ajouter à une playlist"
      >
        ＋ Playlist
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Ajouter à une playlist</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-content-secondary hover:text-content text-xl"
              >
                ✕
              </button>
            </div>

            {playlists.length === 0 ? (
              <p className="text-sm text-content-secondary mb-4">
                Vous n&apos;avez pas encore de playlist. Créez-en une ci-dessous.
              </p>
            ) : (
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {playlists.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleAdd(p.id)}
                    disabled={loading}
                    className="w-full text-left p-3 rounded-xl border border-border hover:border-accent hover:bg-accent-light/20 transition-colors disabled:opacity-50"
                  >
                    <span className="font-medium text-sm">{p.name}</span>
                    {p.instrumentals_count !== undefined && (
                      <span className="text-xs text-content-secondary ml-2">
                        ({p.instrumentals_count} piste{p.instrumentals_count > 1 ? "s" : ""})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleCreateAndAdd} className="pt-4 border-t border-border">
              <label className="block text-sm font-medium mb-2">Créer une nouvelle playlist</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nom de la playlist..."
                  className="flex-1 p-2.5 rounded-xl border border-border bg-background focus:border-accent outline-none text-sm"
                />
                <Button type="submit" size="sm" loading={creating} disabled={!newName.trim()}>
                  Créer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}