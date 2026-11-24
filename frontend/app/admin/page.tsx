"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, auth } from "@/lib/api";
import PageHeader from "@/components/layout/PageHeader";
import { 
  Users, Music, ShoppingCart, Wallet, AlertTriangle, 
  ChevronRight, ShoppingBag
} from "lucide-react";
import { formatPrice } from "@/lib/format";

type Stats = {
  users: { total: number; active: number; suspended: number; producers: number };
  instrumentals: { total: number; published: number; pending: number; unpublished: number };
  orders: { total: number; pending: number; validated: number; cancelled: number };
  revenue: { total: number };
  producer_requests: { pending: number };
  recent: {
    orders: { id: number; reference: string; amount: number; status: string; user?: { name: string }; instrumental?: { title: string } }[];
    instrumentals: { id: number; title: string; status: string; producer?: { user?: { name: string } } }[];
  };
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/connexion?redirect=/admin");
      return;
    }
    async function load() {
      try {
        const res = await api.get("/admin/stats");
        setStats(res);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    void load();
  }, [router]);

  if (loading) return <div className="h-64 bg-surface rounded-3xl animate-pulse" />;
  if (!stats) return null;

  const statCards = [
    { label: "Utilisateurs", value: stats.users.total, sub: `${stats.users.producers} producteurs`, icon: Users, href: "/admin/utilisateurs" },
    { label: "Catalogue", value: stats.instrumentals.total, sub: `${stats.instrumentals.published} publiée${stats.instrumentals.published > 1 ? "s" : ""}`, icon: Music, href: "/admin/catalogue" },
    { label: "Commandes", value: stats.orders.total, sub: `${stats.orders.pending} en attente`, icon: ShoppingCart, href: "/admin/commandes" },
    { label: "Revenus", value: formatPrice(stats.revenue.total), sub: "Commandes validées", icon: Wallet, href: undefined },
  ];

  return (
    <div className="pb-10">
      <PageHeader 
        label="ADMINISTRATION" 
        title="Vue d'ensemble" 
        subtitle="Suis l'activité d'Instrunaka en temps réel."
      />

      {/* Bloc "À traiter" */}
      {(stats.producer_requests.pending > 0 || stats.instrumentals.pending > 0 || stats.orders.pending > 0) && (
        <div className="glass-card border border-warning/20 rounded-3xl p-5 mb-8 flex items-start gap-4 shadow-sm relative overflow-hidden animate-slide-up">
          <div className="absolute top-0 right-0 w-32 h-32 bg-warning/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <AlertTriangle className="w-6 h-6 text-warning shrink-0 mt-0.5" />
          <div className="flex-1 relative z-10">
            <h3 className="text-sm font-bold text-warning mb-2">Actions requises</h3>
            <div className="space-y-2 text-sm text-content-secondary">
              {stats.orders.pending > 0 && (
                <p><Link href="/admin/commandes" className="font-medium text-accent hover:underline">{stats.orders.pending} commande{stats.orders.pending > 1 ? "s" : ""} en attente</Link> de validation.</p>
              )}
              {stats.instrumentals.pending > 0 && (
                <p><Link href="/admin/soumissions" className="font-medium text-accent hover:underline">{stats.instrumentals.pending} instrumentale{stats.instrumentals.pending > 1 ? "s" : ""}</Link> à valider.</p>
              )}
              {stats.producer_requests.pending > 0 && (
                <p><Link href="/admin/demandes-producteur" className="font-medium text-accent hover:underline">{stats.producer_requests.pending} demande{stats.producer_requests.pending > 1 ? "s" : ""} producteur</Link> en attente.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cartes de stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href ?? "#"} className={card.href ? "cursor-pointer" : "cursor-default"}>
              <div className="glass-card rounded-[24px] p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-accent-light text-accent shadow-sm group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-content-secondary mb-1">{card.label}</p>
                <p className="text-3xl font-extrabold text-content mb-1 tracking-tight">{card.value}</p>
                <p className="text-xs text-content-secondary">{card.sub}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Listes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-[24px] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-content text-lg">Dernières commandes</h3>
            <Link href="/admin/commandes" className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 bg-accent-light/50 px-3 py-1.5 rounded-full">
              Voir tout <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {stats.recent.orders.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-8 h-8 text-content-secondary" />
              </div>
              <p className="text-sm text-content-secondary">Aucune commande pour l&apos;instant.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {stats.recent.orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 px-2 -mx-2 rounded-xl hover:bg-background-secondary transition-colors border-b border-border last:border-0">
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-semibold text-content truncate">{order.instrumental?.title ?? "—"}</p>
                    <p className="text-xs text-content-secondary truncate">par {order.user?.name ?? "—"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-content whitespace-nowrap mb-1">{formatPrice(order.amount)}</p>
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide ${
                      order.status === "validated" ? "bg-success/10 text-success" : 
                      order.status === "pending" ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"
                    }`}>
                      {order.status === "validated" ? "Validée" : order.status === "pending" ? "En attente" : "Refusée"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card rounded-[24px] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-content text-lg">Dernières instrumentales</h3>
            <Link href="/admin/catalogue" className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 bg-accent-light/50 px-3 py-1.5 rounded-full">
              Voir tout <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {stats.recent.instrumentals.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                <Music className="w-8 h-8 text-content-secondary" />
              </div>
              <p className="text-sm text-content-secondary">Aucune instrumentale pour l&apos;instant.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {stats.recent.instrumentals.slice(0, 5).map((inst) => (
                <div key={inst.id} className="flex items-center justify-between py-3 px-2 -mx-2 rounded-xl hover:bg-background-secondary transition-colors border-b border-border last:border-0">
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-semibold text-content truncate">{inst.title}</p>
                    <p className="text-xs text-content-secondary truncate">par {inst.producer?.user?.name ?? "—"}</p>
                  </div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide shrink-0 ${
                    inst.status === "available" ? "bg-success/10 text-success" : 
                    inst.status === "pending" ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"
                  }`}>
                    {inst.status === "available" ? "Disponible" : inst.status === "pending" ? "En attente" : "Refusée"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}