"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Toast from "@/components/ui/Toast";
import InstrumentalCard from "@/components/instrumental/InstrumentalCard";

type Instrumental = {
  id: number;
  title: string;
  cover_path: string | null;
  bpm: number | null;
  non_exclusive_price: number;
  exclusive_price: number;
  producer?: { display_name: string } | null;
  mood?: { label: string } | null;
  genre?: { label: string } | null;
  rhythm?: { label: string } | null;
};

type Playlist = {
  id: number;
  name: string;
  description: string | null;
  is_public: boolean;
  instrumentals: Instrumental[];
};

type PageProps = Readonly<{ params: Promise<{ id: string }> }>;

export default function PlaylistDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/connexion?redirect=/profil/playlists/" + id);
      return;
    }
    async function load() {
      try {
        const res = await api.get(`/playlists/${id}`);
        setPlaylist(res?.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id, router]);

  const handleRemove = async (instrumentalId: number) => {
    if (!confirm("Retirer cette instrumentale de la playlist ?")) return;
    try {
      await api.delete(`/playlists/${id}/remove/${instrumentalId}`);
      setPlaylist((prev) =>
        prev
          ? { ...prev, instrumentals: prev.instrumentals.filter((i) => i.id !== instrumentalId) }
          : prev
      );
      setToast({ message: "Instrumentale retirée.", variant: "success" });
    } catch (e: unknown) {
      setToast({
        message: e instanceof Error ? e.message : "Erreur",
        variant: "error",
      });
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-16 text-center">Chargement...</div>;
  if (!playlist) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <Link href="/profil/playlists" className="text-sm text-content-secondary hover:text-accent mb-4 inline-block">
          ← Retour aux playlists
        </Link>
        <h1 className="text-3xl font-bold mb-2">{playlist.name}</h1>
        {playlist.description && (
          <p className="text-content-secondary">{playlist.description}</p>
        )}
        <p className="text-sm text-content-secondary mt-2">
          {playlist.instrumentals.length} instrumentale{playlist.instrumentals.length > 1 ? "s" : ""}
        </p>
      </div>

      {playlist.instrumentals.length === 0 ? (
        <Card padding="lg" className="text-center py-16">
          <span className="text-5xl block mb-4">🎵</span>
          <p className="text-content-secondary mb-4">Cette playlist est vide.</p>
          <Link href="/catalogue">
            <Button variant="primary">Explorer le catalogue</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {playlist.instrumentals.map((inst) => (
            <div key={inst.id} className="relative">
              <InstrumentalCard
                id={inst.id}
                title={inst.title}
                producerName={inst.producer?.display_name}
                coverPath={inst.cover_path}
                mood={inst.mood?.label}
                genre={inst.genre?.label}
                bpm={inst.bpm}
                price={inst.non_exclusive_price}
                exclusivePrice={inst.exclusive_price}
              />
              <button
                onClick={() => handleRemove(inst.id)}
                className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-danger rounded-full w-7 h-7 flex items-center justify-center shadow-card hover:bg-danger hover:text-white transition-colors"
                title="Retirer de la playlist"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}