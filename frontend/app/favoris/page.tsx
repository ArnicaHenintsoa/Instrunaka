"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import InstrumentalCard from "@/components/instrumental/InstrumentalCard";
import { Heart } from "lucide-react";

type Instrumental = {
  id: number;
  title: string;
  cover_path: string | null;
  bpm: number | null;
  non_exclusive_price: number;
  exclusive_price: number;
  producer?: { display_name: string } | null;
  mood?: { label: string } | null;
  rhythm?: { label: string } | null;
};

export default function FavorisPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Instrumental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/connexion?redirect=/favoris");
      return;
    }

    async function loadFavorites() {
      try {
        const res = await api.get("/favorites");
        setFavorites(res?.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    void loadFavorites();
  }, [router]);

  return (
    <PageContainer>
      <PageHeader 
        label="MA COLLECTION" 
        title="Mes favoris" 
        subtitle="Retrouve ici toutes les instrumentales que tu as enregistrées."
      />

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-gray-200 rounded-[28px] animate-pulse" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState 
          icon={Heart}
          title="Tu n'as pas encore de favoris"
          description="Appuie sur le cœur d'un beat pour le retrouver ici et l'écouter plus tard."
          action={
            <Link href="/catalogue" className="px-6 py-3 rounded-full bg-accent text-white font-semibold hover:bg-accent-hover transition-colors">
              Explorer le catalogue
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((inst) => (
            <InstrumentalCard
              key={inst.id}
              id={inst.id}
              title={inst.title}
              producerName={inst.producer?.display_name}
              coverPath={inst.cover_path}
              mood={inst.mood?.label}
              bpm={inst.bpm}
              price={inst.non_exclusive_price}
              exclusivePrice={inst.exclusive_price}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}