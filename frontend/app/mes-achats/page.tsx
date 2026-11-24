"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Toast from "@/components/ui/Toast";
import { formatPrice } from "@/lib/format";
import { Download, XCircle, Package } from "lucide-react";

type OrderItem = {
  instrumental_id: number;
  title: string;
  price: number;
};

type Order = {
  id: number;
  reference: string;
  type: "non_exclusive" | "exclusive" | "pack";
  amount: number;
  original_amount: number | null;
  discount_amount: number;
  status: "pending" | "validated" | "rejected" | "cancelled" | "expired";
  instrumental: { id: number; title: string } | null;
  pack: { id: number; name: string } | null;
  items?: OrderItem[];
  validated_at: string | null;
  created_at: string;
};

type Meta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

const statusBadge: Record<
  string,
  { variant: "warning" | "success" | "danger" | "default"; label: string }
> = {
  pending: { variant: "warning", label: "En attente" },
  validated: { variant: "success", label: "Validée" },
  rejected: { variant: "danger", label: "Refusée" },
  cancelled: { variant: "default", label: "Annulée" },
  expired: { variant: "default", label: "Expirée" },
};

export default function MesAchatsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" | "info" } | null>(null);

  // Annulation
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/connexion?redirect=/mes-achats");
      return;
    }

    async function loadOrders() {
      try {
        const res = await api.get("/orders");
        setOrders(res?.data ?? []);
        setMeta(res?.meta ?? null);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    void loadOrders();
  }, [router]);

  const handleDownload = async (
    orderId: number,
    fileType: "mp3" | "wav",
    title: string,
    instrumentalId?: number
  ) => {
    try {
      const token = auth.getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      let url = `${apiUrl}/downloads/${orderId}/${fileType}`;
      if (instrumentalId) {
        url += `?instrumental_id=${instrumentalId}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Erreur de téléchargement");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${title}.${fileType}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (e) {
      setToast({
        message: e instanceof Error ? e.message : "Erreur lors du téléchargement",
        variant: "error",
      });
    }
  };

  const handleCancel = async () => {
    if (!cancelOrderId) return;
    setCancelling(true);
    try {
      await api.post(`/orders/${cancelOrderId}/cancel`);
      setToast({ message: "Commande annulée.", variant: "success" });
      
      const res = await api.get("/orders");
      setOrders(res?.data ?? []);
      setCancelOrderId(null);
    } catch (e) {
      setToast({
        message: e instanceof Error ? e.message : "Erreur lors de l'annulation",
        variant: "error",
      });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-content-secondary">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

      <h1 className="text-3xl font-bold mb-2">Mes achats</h1>
      <p className="text-content-secondary mb-8">
        Historique de tes commandes et accès aux téléchargements.
      </p>

      {error && (
        <Card padding="lg" className="mb-6">
          <p className="text-danger">{error}</p>
        </Card>
      )}

      {orders.length === 0 && !error && (
        <Card padding="lg" className="text-center py-12">
          <p className="text-content-secondary mb-4">
            Tu n&apos;as pas encore d&apos;achat.
          </p>
          <Link href="/catalogue">
            <Button>Explorer le catalogue</Button>
          </Link>
        </Card>
      )}

      {orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => {
            const badge = statusBadge[order.status] ?? statusBadge.pending;
            const isDownloadable = order.status === "validated";
            const isPack = order.type === "pack";

            return (
              <Card key={order.id} padding="md">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold">
                        {isPack
                          ? order.pack?.name ?? "Pack"
                          : order.instrumental?.title ?? "Instrumentale supprimée"}
                      </h3>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                      {order.type === "exclusive" && (
                        <Badge variant="accent">Exclusif</Badge>
                      )}
                      {isPack && (
                        <Badge variant="accent">
                          <Package className="w-3 h-3 mr-1" /> Pack
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-content-secondary">
                      <div>
                        <span className="font-mono">{order.reference}</span>
                      </div>
                      <div className="capitalize">
                        {isPack
                          ? `Pack de ${order.items?.length ?? 0} instrumentales`
                          : order.type === "exclusive"
                            ? "Licence exclusive"
                            : "Licence non exclusive"}
                      </div>
                      <div>
                        {new Date(order.created_at).toLocaleDateString(
                          "fr-FR",
                          { day: "2-digit", month: "long", year: "numeric" }
                        )}
                      </div>
                      <div>
                        {order.discount_amount > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-content-secondary line-through">
                              {formatPrice(order.original_amount ?? order.amount)}
                            </span>
                            <span className="font-semibold text-accent">
                              {formatPrice(order.amount)}
                            </span>
                            <span className="text-success text-[10px] font-bold">
                              -{formatPrice(order.discount_amount)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-content">
                            {formatPrice(order.amount)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isDownloadable && !isPack && order.instrumental && (
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            handleDownload(order.id, "mp3", order.instrumental!.title)
                          }
                        >
                          <Download className="w-3 h-3 mr-1" /> MP3
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            handleDownload(order.id, "wav", order.instrumental!.title)
                          }
                        >
                          <Download className="w-3 h-3 mr-1" /> WAV
                        </Button>
                      </div>
                    )}
                    {order.status === "pending" && (
                      <div className="flex flex-col gap-2 items-end">
                        <p className="text-xs text-content-secondary text-right max-w-[120px]">
                          En attente de validation
                        </p>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setCancelOrderId(order.id)}
                        >
                          <XCircle className="w-3 h-3 mr-1" /> Annuler
                        </Button>
                      </div>
                    )}
                    {order.status === "rejected" && (
                      <p className="text-xs text-danger text-right max-w-[120px]">
                        Paiement refusé
                      </p>
                    )}
                  </div>
                </div>

                {/* Liste des beats pour un pack */}
                {isPack && order.items && order.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs font-medium text-content-secondary mb-2">
                      Beats inclus :
                    </p>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.instrumental_id}
                          className="flex items-center justify-between gap-2 p-2 bg-background-secondary rounded-lg"
                        >
                          <span className="text-sm text-content truncate">
                            {item.title}
                          </span>
                          {isDownloadable && (
                            <div className="flex gap-1 shrink-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleDownload(order.id, "mp3", item.title, item.instrumental_id)
                                }
                              >
                                MP3
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleDownload(order.id, "wav", item.title, item.instrumental_id)
                                }
                              >
                                WAV
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {meta && meta.last_page > 1 && (
        <p className="text-center text-sm text-content-secondary mt-8">
          Page {meta.current_page} sur {meta.last_page}
        </p>
      )}

  
      <ConfirmModal
        isOpen={!!cancelOrderId}
        onClose={() => setCancelOrderId(null)}
        onConfirm={handleCancel}
        title="Annuler cette commande ?"
        message="La commande sera annulée. Si tu as utilisé un code promo, il sera restitué."
        confirmLabel={cancelling ? "Annulation..." : "Annuler la commande"}
        cancelLabel="Retour"
        variant="danger"
      />
    </div>
  );
}