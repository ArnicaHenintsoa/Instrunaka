"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

type Producer = {
  id: number;
  display_name: string;
  bio: string | null;
  verified: boolean;
  user?: { id: number; name: string; email: string } | null;
  instrumentals_count?: number;
};

export default function ProducteursSuivisPage() {
  const router = useRouter();
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/connexion?redirect=/profil/producteurs-suivis");
      return;
    }
    async function load() {
      try {
        const res = await api.get("/following");
        setProducers(res?.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [router]);

  if (loading) return <div className="container mx-auto px-4 py-16 text-center">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/profil" className="text-sm text-content-secondary hover:text-accent mb-4 inline-block">
          ← Retour au profil
        </Link>
        <h1 className="text-3xl font-bold mb-2">Producteurs suivis</h1>
        <p className="text-content-secondary">Retrouvez les producteurs dont vous suivez les créations.</p>
      </div>

      {producers.length === 0 ? (
        <Card padding="lg" className="text-center py-16">
          <span className="text-5xl block mb-4">🎵</span>
          <p className="text-content-secondary mb-4">
            Vous ne suivez encore aucun producteur.
          </p>
          <Link href="/catalogue">
            <Button variant="primary">Explorer le catalogue</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {producers.map((prod) => (
            <Card key={prod.id} padding="lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center font-bold">
                    {prod.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">{prod.display_name}</h2>
                      {prod.verified && <Badge variant="accent">✓ Vérifié</Badge>}
                    </div>
                    {prod.bio && (
                      <p className="text-sm text-content-secondary mt-0.5">{prod.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}