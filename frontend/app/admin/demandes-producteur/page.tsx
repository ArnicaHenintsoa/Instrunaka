"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";

type ProducerRequest = {
  id: number;
  bio: string;
  motivation: string;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    is_producer: boolean;
  };
};

export default function AdminDemandesProducteurPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ProducerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  // État pour le refus (note admin)
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/connexion?redirect=/admin/demandes-producteur");
      return;
    }

    async function loadRequests() {
      try {
        const res = await api.get("/admin/producer-requests");
        setRequests(res?.data ?? []);
      } catch (e: unknown) {
        setToast({
          message: e instanceof Error ? e.message : "Erreur de chargement (accès admin requis)",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    }
    void loadRequests();
  }, [router]);

  const handleApprove = async (id: number) => {
    try {
      await api.post(`/admin/producer-requests/${id}/approve`);
      setToast({ message: "Demande approuvée !", variant: "success" });
      // Mettre à jour l'état local
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "approved", user: { ...r.user, is_producer: true } } : r
        )
      );
    } catch (e: unknown) {
      setToast({
        message: e instanceof Error ? e.message : "Erreur lors de l'approbation",
        variant: "error",
      });
    }
  };

  const handleReject = async (id: number) => {
    if (!adminNote.trim()) {
      setToast({ message: "Veuillez saisir une note pour le refus.", variant: "error" });
      return;
    }

    try {
      await api.post(`/admin/producer-requests/${id}/reject`, { admin_note: adminNote });
      setToast({ message: "Demande refusée.", variant: "success" });
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "rejected", admin_note: adminNote } : r))
      );
      setRejectingId(null);
      setAdminNote("");
    } catch (e: unknown) {
      setToast({
        message: e instanceof Error ? e.message : "Erreur lors du refus",
        variant: "error",
      });
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Demandes Producteur</h1>
        <p className="text-content-secondary">
          Gérez les demandes des utilisateurs souhaitant devenir producteurs.
        </p>
      </div>

      {requests.length === 0 && (
        <Card padding="lg" className="text-center py-16">
          <span className="text-5xl block mb-4">📭</span>
          <p className="text-content-secondary">Aucune demande pour le moment.</p>
        </Card>
      )}

      <div className="space-y-6">
        {requests.map((request) => (
          <Card key={request.id} padding="lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">{request.user.name}</h2>
                <p className="text-sm text-content-secondary">{request.user.email}</p>
                <p className="text-xs text-content-secondary mt-1">
                  Soumise le {new Date(request.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <Badge variant={request.status === "pending" ? "warning" : request.status === "approved" ? "success" : "danger"}>
                {request.status === "pending" ? "En attente" : request.status === "approved" ? "Approuvée" : "Refusée"}
              </Badge>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <h3 className="text-sm font-medium mb-1">Bio / Parcours</h3>
                <p className="text-sm text-content-secondary bg-background-secondary p-3 rounded-lg">
                  {request.bio}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Motivation</h3>
                <p className="text-sm text-content-secondary bg-background-secondary p-3 rounded-lg">
                  {request.motivation}
                </p>
              </div>
              {request.admin_note && (
                <div>
                  <h3 className="text-sm font-medium mb-1 text-danger">Note Admin</h3>
                  <p className="text-sm text-danger bg-danger/10 p-3 rounded-lg">
                    {request.admin_note}
                  </p>
                </div>
              )}
            </div>

            {request.status === "pending" && (
              <div className="flex gap-3 pt-4 border-t border-border">
                {rejectingId === request.id ? (
                  <div className="w-full space-y-3">
                    <textarea
                      rows={3}
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Raison du refus (obligatoire)..."
                      className="w-full p-3 rounded-xl border border-border bg-background focus:border-accent outline-none text-sm"
                    />
                    <div className="flex gap-2">
                      <Button variant="danger" size="sm" onClick={() => handleReject(request.id)}>
                        Confirmer le refus
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setRejectingId(null); setAdminNote(""); }}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Button variant="primary" onClick={() => handleApprove(request.id)}>
                      ✅ Approuver
                    </Button>
                    <Button variant="secondary" onClick={() => setRejectingId(request.id)}>
                      ❌ Refuser
                    </Button>
                  </>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}