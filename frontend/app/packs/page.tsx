"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import Badge from "@/components/ui/Badge";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { formatPrice } from "@/lib/format";
import { Package, ArrowRight } from "lucide-react";

type Pack = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  cover_path: string | null;
  instrumentals: {
    id: number;
    title: string;
    cover_path: string | null;
    non_exclusive_price: number;
    producer?: { display_name: string } | null;
  }[];
};

export default function PacksPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/packs");
        setPacks(res?.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="h-64 bg-surface rounded-3xl animate-pulse mt-8" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        label="PACKS" 
        title="Les packs" 
        subtitle="Économise et achète plusieurs instrumentales groupées."
      />

      {packs.length === 0 ? (
        <div className="glass-card border-border rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-accent-light text-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <p className="text-content-secondary">Aucun pack pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-16">
          {packs.map((pack) => {
            const originalPrice = pack.instrumentals.reduce(
              (acc, i) => acc + i.non_exclusive_price,
              0
            );
            const savings = originalPrice - pack.price;
            return (
              <div key={pack.id} className="glass-card border-border rounded-3xl p-6 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-2xl font-bold text-content">{pack.name}</h2>
                  {savings > 0 && (
                    <Badge variant="success">
                      -{Math.round((savings / originalPrice) * 100)}%
                    </Badge>
                  )}
                </div>
                {pack.description && (
                  <p className="text-content-secondary text-sm mb-4">{pack.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  {pack.instrumentals.map((inst) => (
                    <div key={inst.id} className="flex items-center gap-3 p-2 bg-background-secondary rounded-lg">
                      <div className="w-10 h-10 bg-accent-light rounded-lg flex items-center justify-center text-accent">
                        ♪
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-content">{inst.title}</p>
                        <p className="text-xs text-content-secondary">{inst.producer?.display_name}</p>
                      </div>
                      <span className="text-xs text-content-secondary line-through">
                        {formatPrice(inst.non_exclusive_price)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border mt-auto">
                  {savings > 0 && (
                    <p className="text-xs text-content-secondary mb-1">
                      Prix cumulé : <span className="line-through">{formatPrice(originalPrice)}</span>
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-accent">
                      {formatPrice(pack.price)}
                    </span>
                    <Link href={`/packs/${pack.id}`}>
                      <button className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-hover transition-colors flex items-center gap-2">
                        Voir le pack <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                  {savings > 0 && (
                    <p className="text-xs text-success mt-1">
                      Tu économises {formatPrice(savings)} !
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}