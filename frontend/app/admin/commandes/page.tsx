"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";
import { formatPrice } from "@/lib/format";
import { Package } from "lucide-react";

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
  refund_required: boolean;
  user: { id: number; name: string; email: string } | null;
  instrumental: { id: number; title: string } | null;
  pack: { id: number; name: string } | null;
  items?: OrderItem[];
  admin_note: string | null;
  validated_at: string | null;
  created_at: string;
};

type Meta = { current_page: number; per_page: number; total: number; last_page: number; };

const statusBadge: Record<string, { variant: "warning" | "success" | "danger" | "default"; label: string }> = {
  pending: { variant: "warning", label: "En attente" },
  validated: { variant: "success", label: "Validée" },
  rejected: { variant: "danger", label: "Refusée" },
  cancelled: { variant: "default", label: "Annulée" },
  expired: { variant: "default", label: "Expirée" },
};

export default function AdminCommandesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [referenceSearch, setReferenceSearch] = useState("");

  const [actionOrder, setActionOrder] = useState<Order | null>(null);
  const [actionType, setActionType] = useState<"validate" | "reject" | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [senderReference, setSenderReference] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" | "info" } | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (referenceSearch) params.append("reference", referenceSearch);

      const res = await api.get(`/admin/orders?${params.toString()}`);
      setOrders(res?.data ?? []);
      setMeta(res?.meta ?? null);
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Erreur", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, referenceSearch]);

  useEffect(() => { void loadOrders(); }, [loadOrders]);

  const handleAction = async () => {
    if (!actionOrder || !actionType) return;
    setActionLoading(true);

    try {
      if (actionType === "validate") {
        if (!senderReference.trim() || !receivedAmount) {
          setToast({ message: "Référence et montant reçus sont obligatoires.", variant: "error" });
          setActionLoading(false);
          return;
        }
        await api.post(`/admin/orders/${actionOrder.id}/validate`, {
          sender_reference: senderReference,
          received_amount: parseInt(receivedAmount, 10),
          note: actionNote || null,
        });
        setToast({ message: `Commande ${actionOrder.reference} validée.`, variant: "success" });
      } else {
        if (!actionNote.trim()) {
          setToast({ message: "Le motif de refus est obligatoire.", variant: "error" });
          setActionLoading(false);
          return;
        }
        await api.post(`/admin/orders/${actionOrder.id}/reject`, {
          reason: actionNote,
        });
        setToast({ message: `Commande ${actionOrder.reference} refusée.`, variant: "info" });
      }

      setActionOrder(null);
      setActionType(null);
      setActionNote("");
      setSenderReference("");
      setReceivedAmount("");
      void loadOrders();
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Erreur", variant: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const openAction = (order: Order, type: "validate" | "reject") => {
    setActionOrder(order);
    setActionType(type);
    setActionNote("");
    setSenderReference("");
    setReceivedAmount(order.amount.toString());
  };

  return (
    <div>
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Commandes</h2>
        <p className="text-sm text-content-secondary">
          Valide ou refuse les commandes après vérification du paiement Mobile Banking.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="status-filter" className="text-sm font-medium block mb-1.5 text-content">Statut</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-content text-sm"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="validated">Validées</option>
              <option value="rejected">Refusées</option>
              <option value="cancelled">Annulées</option>
              <option value="expired">Expirées</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Rechercher par référence"
              type="text"
              value={referenceSearch}
              onChange={(e) => setReferenceSearch(e.target.value)}
              placeholder="ORD-20261001-XXXXXX"
            />
          </div>
          <div className="pt-6">
            <Button variant="secondary" onClick={() => void loadOrders()}>Actualiser</Button>
          </div>
        </div>
      </div>

      {meta && (
        <p className="text-sm text-content-secondary mb-4">
          {meta.total} commande{meta.total > 1 ? "s" : ""}
        </p>
      )}

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={`skeleton-${i}`} className="h-24 glass-card rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-content-secondary">Aucune commande ne correspond à ces filtres.</p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => {
            const badge = statusBadge[order.status] ?? statusBadge.pending;
            const isPack = order.type === "pack";
            return (
              <div key={order.id} className="glass-card rounded-2xl p-5 animate-slide-up">
                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-mono text-sm font-medium text-content">{order.reference}</span>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                      {order.type === "exclusive" && <Badge variant="accent">Exclusif</Badge>}
                      {isPack && (
                        <Badge variant="accent">
                          <Package className="w-3 h-3 mr-1" /> Pack
                        </Badge>
                      )}
                      {order.refund_required && <Badge variant="danger">Remboursement requis</Badge>}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 text-xs text-content-secondary">
                      <div>
                        <span className="block text-content font-medium">
                          {isPack ? order.pack?.name ?? "—" : order.instrumental?.title ?? "—"}
                        </span>
                        <span>{isPack ? "Pack" : "Instrumentale"}</span>
                      </div>
                      <div>
                        <span className="block text-content font-medium">{order.user?.name ?? "—"}</span>
                        <span>{order.user?.email ?? "—"}</span>
                      </div>
                      <div>
                        <span className="block text-content font-medium">
                          {formatPrice(order.amount)}
                        </span>
                        <span>Montant</span>
                      </div>
                      <div>
                        <span className="block text-content font-medium">
                          {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </span>
                        <span>Créée le</span>
                      </div>
                    </div>

                    {order.discount_amount > 0 && (
                      <div className="mt-2 text-xs text-success">
                        Remise : -{formatPrice(order.discount_amount)} (code promo appliqué)
                      </div>
                    )}

                    {isPack && order.items && order.items.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs font-medium text-content-secondary mb-1">Beats inclus :</p>
                        <ul className="space-y-0.5">
                          {order.items.map((item) => (
                            <li key={item.instrumental_id} className="text-xs text-content-secondary flex justify-between">
                              <span>{item.title}</span>
                              <span className="font-mono">{formatPrice(item.price)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {order.status === "pending" && (
                    <div className="w-full md:w-auto shrink-0 flex flex-row md:flex-col gap-2 mt-4 md:mt-0">
                      <Button size="sm" className="flex-1 md:flex-none" onClick={() => openAction(order, "validate")}>Valider</Button>
                      <Button size="sm" variant="danger" className="flex-1 md:flex-none" onClick={() => openAction(order, "reject")}>Refuser</Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={!!actionOrder && !!actionType}
        onClose={() => { setActionOrder(null); setActionType(null); setActionNote(""); setSenderReference(""); setReceivedAmount(""); }}
        title={actionType === "validate" ? "Valider cette commande ?" : "Refuser cette commande ?"}
        maxWidth="md"
      >
        {actionOrder && (
          <div>
            <div className="bg-background-secondary rounded-xl p-4 mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-content-secondary">Référence</span>
                <span className="font-mono font-medium">{actionOrder.reference}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-content-secondary">Client</span>
                <span>{actionOrder.user?.name}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-content-secondary">Montant attendu</span>
                <span className="font-semibold">{formatPrice(actionOrder.amount)}</span>
              </div>
            </div>

            {actionType === "validate" ? (
              <>
                <div className="space-y-3 mb-4">
                  <Input
                    label="Référence du transfert Mobile Banking"
                    type="text"
                    value={senderReference}
                    onChange={(e) => setSenderReference(e.target.value)}
                    placeholder="Ex: 123456789"
                    required
                  />
                  <Input
                    label="Montant réellement reçu (Ar)"
                    type="number"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                    required
                  />
                </div>
                <label className="block text-sm font-medium mb-1.5">Note (optionnel)</label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-content text-sm resize-none focus:border-accent"
                />
              </>
            ) : (
              <>
                <label className="block text-sm font-medium mb-1.5">Motif du refus (obligatoire)</label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Ex: Aucun paiement reçu"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-content text-sm resize-none focus:border-accent"
                />
              </>
            )}

            <div className="flex gap-3 justify-end mt-4">
              <Button variant="secondary" onClick={() => { setActionOrder(null); setActionType(null); }}>Annuler</Button>
              <Button variant={actionType === "validate" ? "primary" : "danger"} loading={actionLoading} onClick={handleAction}>
                {actionType === "validate" ? "Valider" : "Refuser"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}