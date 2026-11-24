"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { QRCodeSVG } from "qrcode.react";
import { api } from "@/lib/api";

type OrderPaymentInfo = {
  mobile_number: string;
  holder_name: string;
  reference: string;
  amount: number;
};

type OrderModalProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  payment: OrderPaymentInfo | null;
  orderType: "non_exclusive" | "exclusive";
  instrumentalTitle: string;
  coverPath?: string | null;
  basePrice: number; // Prix de base (sans promo)
  onCreateOrder: (promoCode?: string) => Promise<void>; // Fonction fournie par la page
}>;

export default function OrderModal({
  isOpen,
  onClose,
  payment,
  orderType,
  instrumentalTitle,
  coverPath,
  basePrice,
  onCreateOrder,
}: OrderModalProps) {
  const [step, setStep] = useState<"summary" | "payment">("summary");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount_percent: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [copied, setCopied] = useState(false);

  // Calculs
  const discountAmount = appliedPromo
    ? Math.round((basePrice * appliedPromo.discount_percent) / 100)
    : 0;
  const finalPrice = basePrice - discountAmount;

  const handleApplyPromo = async () => {
    setPromoError(null);
    setValidatingPromo(true);
    try {
      const res = await api.post("/promo-codes/validate", { code: promoCode });
      setAppliedPromo({
        code: res.code,
        discount_percent: res.discount_percent,
      });
    } catch (e: unknown) {
      setPromoError(e instanceof Error ? e.message : "Code invalide");
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleContinue = async () => {
    setCreatingOrder(true);
    try {
      await onCreateOrder(appliedPromo?.code);
      setStep("payment");
    } catch (e: unknown) {
      setPromoError(e instanceof Error ? e.message : "Erreur lors de la commande");
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleCopyReference = async () => {
    if (!payment) return;
    try {
      await navigator.clipboard.writeText(payment.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (!isOpen) return null;

  // ÉTAPE 1 : Récapitulatif + Code Promo
  if (step === "summary") {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Récapitulatif de ta commande" maxWidth="md">
        <div className="space-y-6">
          
          {/* Beat */}
          <div className="flex items-center gap-4 bg-background-secondary p-4 rounded-xl">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 shrink-0">
              {coverPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverPath} alt={instrumentalTitle} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">♪</div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-content">{instrumentalTitle}</p>
              <p className="text-sm text-content-secondary capitalize">
                Licence {orderType === "exclusive" ? "exclusive" : "non exclusive"}
              </p>
            </div>
          </div>

          {/* Prix */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-content-secondary">Prix de base</span>
              <span className="font-medium text-content">{basePrice.toLocaleString("fr-FR")} Ar</span>
            </div>
            {appliedPromo && (
              <div className="flex justify-between text-sm text-success">
                <span>Remise ({appliedPromo.discount_percent}%)</span>
                <span>-{discountAmount.toLocaleString("fr-FR")} Ar</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-accent">{finalPrice.toLocaleString("fr-FR")} Ar</span>
            </div>
          </div>

          {/* Code promo */}
          <div>
            <label className="block text-sm font-medium mb-2">Code promo</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Ex: WELCOME10"
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background focus:border-accent outline-none text-sm"
                disabled={!!appliedPromo}
              />
              {appliedPromo ? (
                <Button variant="secondary" onClick={() => { setAppliedPromo(null); setPromoCode(""); }}>
                  Retirer
                </Button>
              ) : (
                <Button onClick={handleApplyPromo} loading={validatingPromo}>
                  Appliquer
                </Button>
              )}
            </div>
            {promoError && <p className="text-sm text-danger mt-2">{promoError}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleContinue} loading={creatingOrder} className="flex-1">
              Continuer vers le paiement
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // ÉTAPE 2 : Paiement Mobile Banking
  if (!payment) return null;
  const cleanNumber = payment.mobile_number.replace(/\s/g, "");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Finaliser ton achat" maxWidth="lg">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* GAUCHE : Paiement & QR */}
        <div className="flex-1 space-y-4">
          <div className="bg-background-secondary rounded-xl p-4">
            <p className="text-sm text-content-secondary mb-1">Tu achètes</p>
            <p className="font-semibold text-lg">{instrumentalTitle}</p>
            <p className="text-xs text-content-secondary capitalize mt-1">
              Licence {orderType === "exclusive" ? "exclusive" : "non exclusive"}
            </p>
          </div>

          <div className="border border-border rounded-xl p-4 flex flex-col items-center bg-white">
            <QRCodeSVG
              value={`tel:${cleanNumber}`}
              size={140}
              bgColor={"#ffffff"}
              fgColor={"#7c3aed"}
              level={"L"}
            />
            <p className="text-xs text-content-secondary mt-4 mb-1">Ou envoie au numéro :</p>
            <p className="text-lg font-bold tracking-wide">{payment.mobile_number}</p>
            <p className="text-xs text-content-secondary">{payment.holder_name}</p>
          </div>
        </div>

        {/* DROITE : Montant & Référence */}
        <div className="flex-1 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">

            <div className="border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Montant à envoyer</span>
                <span className="text-xl font-bold text-accent">
                  {payment.amount.toLocaleString("fr-FR")} Ar
                </span>
              </div>
            </div>

            <div className="border-2 border-accent rounded-xl p-4 bg-accent-light/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase text-accent">Référence</span>
                <button onClick={handleCopyReference} className="text-xs text-accent hover:underline font-medium">
                  {copied ? "✓ Copié" : "Copier"}
                </button>
              </div>
              <p className="font-mono text-base font-bold tracking-wider text-content whitespace-nowrap overflow-x-auto">
                {payment.reference}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Fermer
            </Button>
            <Button onClick={() => { onClose(); window.location.href = "/mes-achats"; }} className="flex-1">
              Mes achats
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}