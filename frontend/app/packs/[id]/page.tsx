"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";
import OrderModal from "@/components/order/OrderModal";

type PackInstrumental = {
  id: number;
  title: string;
  cover_path: string | null;
  non_exclusive_price: number;
  producer?: { display_name: string } | null;
};

type Pack = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  cover_path: string | null;
  instrumentals: PackInstrumental[];
};

type PageProps = Readonly<{ params: Promise<{ id: string }> }>;

type Payment = {
  mobile_number: string;
  holder_name: string;
  reference: string;
  amount: number;
};

export default function PackDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [pack, setPack] = useState<Pack | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/packs/${id}`);
        setPack(res?.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  // Ouvre la modale : la commande est créée depuis la modale (avec code promo éventuel)
  const handleBuy = () => {
    if (!auth.isAuthenticated()) {
      router.push(`/connexion?redirect=/packs/${id}`);
      return;
    }
    setModalOpen(true);
  };

  // Appelée par OrderModal quand l'utilisateur confirme (promoCode optionnel)
  const handleCreateOrder = async (promoCode?: string): Promise<void> => {
    try {
      const res = await api.post("/orders", {
        pack_id: pack?.id,
        type: "pack",
        ...(promoCode ? { promo_code: promoCode } : {}),
      });
      setPayment(res.payment);
    } catch (e: unknown) {
      setToast({
        message: e instanceof Error ? e.message : "Erreur lors de la commande",
        variant: "error",
      });
      throw e;
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setPayment(null);
  };

  if (loading) return <div className="container mx-auto px-4 py-16 text-center">Chargement...</div>;
  if (!pack) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Card padding="lg" className="max-w-md mx-auto">
          <p className="text-danger mb-4">Pack introuvable.</p>
          <Link href="/packs"><Button variant="secondary">← Retour aux packs</Button></Link>
        </Card>
      </div>
    );
  }

  const originalPrice = pack.instrumentals.reduce(
    (acc, i) => acc + i.non_exclusive_price,
    0
  );
  const savings = originalPrice - pack.price;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

      <Link href="/packs" className="text-sm text-content-secondary hover:text-accent mb-6 inline-block">
        ← Retour aux packs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne gauche : Visuel */}
        <div className="lg:col-span-1">
          <div className="aspect-square bg-gradient-to-br from-accent-light to-background-secondary rounded-2xl overflow-hidden border border-border flex items-center justify-center">
            {pack.cover_path ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pack.cover_path} alt={pack.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-8xl">📦</span>
            )}
          </div>

          {savings > 0 && (
            <Card padding="md" className="mt-4 bg-success/5 border-success/20">
              <p className="text-sm text-success font-medium text-center">
                Vous économisez {savings.toLocaleString("fr-FR")} Ar
              </p>
            </Card>
          )}
        </div>

        {/* Colonne droite : Infos */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-3xl font-bold">{pack.name}</h1>
              {savings > 0 && originalPrice > 0 && (
                <Badge variant="success">
                  -{Math.round((savings / originalPrice) * 100)}%
                </Badge>
              )}
            </div>
            {pack.description && (
              <p className="text-content-secondary mt-2">{pack.description}</p>
            )}
          </div>

          {/* Liste des instrumentales */}
          <Card padding="lg" className="mb-6">
            <h2 className="font-semibold mb-4">
              Contenu du pack ({pack.instrumentals.length} instrumentale{pack.instrumentals.length > 1 ? "s" : ""})
            </h2>
            <div className="space-y-3">
              {pack.instrumentals.map((inst) => (
                <Link
                  key={inst.id}
                  href={`/instrumentales/${inst.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent-light/30 transition-colors"
                >
                  <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center text-accent text-xl">
                    ♪
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{inst.title}</p>
                    <p className="text-xs text-content-secondary">
                      par {inst.producer?.display_name}
                    </p>
                  </div>
                  <span className="text-sm text-content-secondary line-through">
                    {inst.non_exclusive_price.toLocaleString("fr-FR")} Ar
                  </span>
                </Link>
              ))}
            </div>
          </Card>

          {/* Achat */}
          <Card padding="lg">
            <h2 className="font-semibold mb-4">Acheter ce pack</h2>

            <div className="space-y-4">
              {savings > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-content-secondary">Prix cumulé</span>
                  <span className="text-content-secondary line-through">
                    {originalPrice.toLocaleString("fr-FR")} Ar
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between p-4 border-2 border-accent rounded-xl bg-accent-light/30">
                <div>
                  <p className="font-medium">Pack complet</p>
                  <p className="text-xs text-content-secondary mt-0.5">
                    {pack.instrumentals.length} instrumentales · MP3 + WAV
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-accent">
                    {pack.price.toLocaleString("fr-FR")} Ar
                  </span>
                  <Button size="sm" onClick={handleBuy}>
                    Acheter
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-xs text-content-secondary mt-4">
              💡 Le paiement se fait par Mobile Banking, suivi d&apos;une
              validation manuelle par notre équipe.
            </p>
          </Card>
        </div>
      </div>

      <OrderModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        payment={payment}
        orderType="non_exclusive"
        instrumentalTitle={pack.name}
        coverPath={pack.cover_path ?? undefined}
        basePrice={pack.price}
        onCreateOrder={handleCreateOrder}
      />
    </div>
  );
}
