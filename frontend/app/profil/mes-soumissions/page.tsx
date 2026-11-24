"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { FileText, ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/format";

type Instrumental = {
  id: number;
  title: string;
  status: "pending" | "available" | "rejected";
  created_at: string;
  non_exclusive_price: number;
  exclusive_price: number;
  genre?: { label: string } | null;
};

export default function MesSoumissionsPage() {
  const router = useRouter();
  const [instrumentals, setInstrumentals] = useState<Instrumental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/connexion?redirect=/profil/mes-soumissions");
      return;
    }

    async function load() {
      try {
        const res = await api.get("/producer/instrumentals");
        setInstrumentals(res?.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [router]);

  return (
    <PageContainer className="max-w-4xl">
      <Link href="/profil" className="inline-flex items-center text-sm text-content-secondary hover:text-accent mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour au profil
      </Link>
      
      <PageHeader 
        label="PRODUCTEUR" 
        title="Mes soumissions" 
        subtitle="Suis l'état de tes instrumentales proposées au catalogue."
        action={
          <Link href="/profil/soumettre">
            <Button className="bg-accent text-white">Nouvelle soumission</Button>
          </Link>
        }
      />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : instrumentals.length === 0 ? (
        <EmptyState 
          icon={FileText}
          title="Aucune soumission"
          description="Tu n'as pas encore soumis d'instrumentale. Partage ton premier beat avec la communauté !"
          action={
            <Link href="/profil/soumettre">
              <Button className="bg-accent text-white">Soumettre ma première instrumentale</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {instrumentals.map((inst) => (
            <div key={inst.id} className="bg-white rounded-3xl border border-border shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-content">{inst.title}</h2>
                  <p className="text-xs text-content-secondary mt-1">
                    Soumise le {new Date(inst.created_at).toLocaleDateString("fr-FR")}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-content-secondary">
                    <span>{formatPrice(inst.non_exclusive_price)} / {formatPrice(inst.exclusive_price)}</span>
                    {inst.genre && <span>Genre : {inst.genre.label}</span>}
                  </div>
                </div>
                <Badge variant={
                  inst.status === "available" ? "success" : 
                  inst.status === "pending" ? "warning" : "danger"
                }>
                  {inst.status === "available" ? "Publiée" : inst.status === "pending" ? "En attente" : "Refusée"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}