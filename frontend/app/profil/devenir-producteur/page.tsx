"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { Clock, XCircle, CheckCircle } from "lucide-react";

type ProducerRequest = {
  id: number;
  bio: string;
  motivation: string;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
};

export default function DevenirProducteurPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);
  
  const [isProducer, setIsProducer] = useState(false);
  const [request, setRequest] = useState<ProducerRequest | null>(null);
  
  const [bio, setBio] = useState("");
  const [motivation, setMotivation] = useState("");

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/connexion?redirect=/profil/devenir-producteur");
      return;
    }

    async function fetchStatus() {
      try {
        const res = await api.get("/producer/request");
        setIsProducer(res?.is_producer ?? false);
        setRequest(res?.request ?? null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    void fetchStatus();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/producer/request", { bio, motivation });
      setToast({ message: "Demande envoyée avec succès !", variant: "success" });
      const res = await api.get("/producer/request");
      setRequest(res?.request ?? null);
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : "Erreur lors de l'envoi", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageContainer><div className="h-64 bg-gray-200 rounded-3xl animate-pulse mt-8" /></PageContainer>;

  // Cas 1 : Déjà producteur
  if (isProducer) {
    return (
      <PageContainer className="max-w-2xl">
        <div className="bg-white rounded-3xl border border-border shadow-sm p-8 text-center mt-8">
          <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-content mb-2">Tu es producteur !</h1>
          <p className="text-content-secondary mb-6">Tu peux désormais soumettre tes instrumentales au catalogue.</p>
          <Link href="/profil/soumettre"><Button className="bg-accent text-white">Soumettre une instrumentale</Button></Link>
        </div>
      </PageContainer>
    );
  }

  // Cas 2 : Demande en attente
  if (request?.status === "pending") {
    return (
      <PageContainer className="max-w-2xl">
        <div className="bg-white rounded-3xl border border-border shadow-sm p-8 text-center mt-8">
          <div className="w-20 h-20 bg-warning/10 text-warning rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-content mb-2">Demande en attente</h1>
          <p className="text-content-secondary mb-4">Ta demande a bien été reçue. Un administrateur va l&apos;examiner prochainement.</p>
          <p className="text-xs text-content-secondary bg-background-secondary inline-block px-3 py-1 rounded-full">
            Soumise le {new Date(request.created_at).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </PageContainer>
    );
  }

  // Cas 3 : Demande refusée ou nouvelle demande
  return (
    <PageContainer className="max-w-2xl">
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}
      
      <PageHeader 
        label="PRODUCTEUR" 
        title="Devenir Producteur" 
        subtitle="Remplis ce formulaire pour proposer tes créations. Un administrateur validera ton profil."
      />

      {request?.status === "rejected" && (
        <div className="bg-danger/5 border border-danger/20 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 text-danger font-semibold mb-1">
            <XCircle className="w-5 h-5" /> Demande précédente refusée
          </div>
          {request.admin_note && <p className="text-sm text-content-secondary">Note de l&apos;admin : {request.admin_note}</p>}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-border shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-content mb-2">Ton parcours / Bio</label>
            <textarea
              required rows={4} value={bio} onChange={(e) => setBio(e.target.value)}
              className="w-full p-4 rounded-xl border border-border bg-background focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all resize-none"
              placeholder="Décris ton style musical, tes influences, ton expérience..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-content mb-2">Pourquoi veux-tu devenir producteur ?</label>
            <textarea
              required rows={4} value={motivation} onChange={(e) => setMotivation(e.target.value)}
              className="w-full p-4 rounded-xl border border-border bg-background focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all resize-none"
              placeholder="Explique ta motivation..."
            />
          </div>

          <Button type="submit" loading={submitting} className="w-full bg-accent text-white py-3.5 rounded-xl font-semibold">
            Envoyer ma demande
          </Button>
        </form>
      </div>
    </PageContainer>
  );
}