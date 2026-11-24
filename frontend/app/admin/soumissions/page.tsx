"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";
import CoverImage from "@/components/ui/CoverImage";
import { Music, CheckCircle, XCircle, Play, Pause } from "lucide-react";

type InstrumentalFile = {
  id: number;
  type: string;
  path: string;
};

type Instrumental = {
  id: number;
  title: string;
  description: string | null;
  bpm: number | null;
  musical_key: string | null;
  duration_seconds: number | null;
  non_exclusive_price: number;
  exclusive_price: number;
  status: string;
  created_at: string;
  cover_path: string | null;
  producer?: {
    user?: { name: string; email: string } | null;
  } | null;
  genre?: { label: string } | null;
  mood?: { label: string } | null;
  rhythm?: { label: string } | null;
  files?: InstrumentalFile[];
};

export default function AdminSoumissionsPage() {
  const router = useRouter();
  const [instrumentals, setInstrumentals] = useState<Instrumental[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [playingId, setPlayingId] = useState<number | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/connexion?redirect=/admin/soumissions");
      return;
    }

    async function loadSubmissions() {
      try {
        const res = await api.get("/admin/instrumentals");
        setInstrumentals(res?.data ?? []);
      } catch (e: unknown) {
        setToast({
          message: e instanceof Error ? e.message : "Erreur de chargement",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    }
    void loadSubmissions();
  }, [router]);

  const handleValidate = async (id: number) => {
    try {
      await api.post(`/admin/instrumentals/${id}/validate`);
      setToast({ message: "Instrumentale validée et publiée !", variant: "success" });
      setInstrumentals((prev) => prev.filter((i) => i.id !== id));
    } catch (e: unknown) {
      setToast({
        message: e instanceof Error ? e.message : "Erreur lors de la validation",
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
      await api.post(`/admin/instrumentals/${id}/reject`, { admin_note: adminNote });
      setToast({ message: "Instrumentale refusée.", variant: "success" });
      setInstrumentals((prev) => prev.filter((i) => i.id !== id));
      setRejectingId(null);
      setAdminNote("");
    } catch (e: unknown) {
      setToast({
        message: e instanceof Error ? e.message : "Erreur lors du refus",
        variant: "error",
      });
    }
  };

  const togglePlay = (id: number) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-content-secondary animate-pulse">Chargement des soumissions...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-slide-up">
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-content">Soumissions en attente</h1>
        <p className="text-content-secondary text-sm">
          Valide ou refuse les instrumentales proposées par les producteurs avant leur publication.
        </p>
      </div>

      {instrumentals.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-accent-light text-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Music className="w-8 h-8" />
          </div>
          <p className="text-content-secondary">Aucune soumission en attente pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {instrumentals.map((inst) => (
            <div key={inst.id} className="glass-card rounded-3xl p-5">
              <div className="flex flex-col md:flex-row gap-5">
                
                {/* Pochette */}
                <div className="w-full md:w-32 h-32 shrink-0 relative rounded-2xl overflow-hidden bg-background-secondary">
                  <CoverImage src={inst.cover_path} alt={inst.title} id={inst.id} className="w-full h-full object-cover" />
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h2 className="text-lg font-bold text-content">{inst.title}</h2>
                      <p className="text-sm text-content-secondary">
                        par {inst.producer?.user?.name ?? "Producteur inconnu"}
                      </p>
                    </div>
                    <Badge variant="warning">En attente</Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {inst.genre && <Badge variant="accent">{inst.genre.label}</Badge>}
                    {inst.mood && <Badge variant="default">{inst.mood.label}</Badge>}
                    {inst.bpm && <Badge variant="default">{inst.bpm} BPM</Badge>}
                    {inst.musical_key && <Badge variant="default">{inst.musical_key}</Badge>}
                  </div>

                  {/* Lecteur Audio Simple */}
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => togglePlay(inst.id)}
                      className="w-10 h-10 rounded-full bg-accent-light text-accent flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
                    >
                      {playingId === inst.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <div className="flex-1 h-2 bg-background-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-accent w-0" />
                    </div>
                    <span className="text-xs text-content-secondary">{inst.duration_seconds ?? 0}s</span>
                  </div>

                  {/* Actions */}
                  {rejectingId === inst.id ? (
                    <div className="space-y-3">
                      <textarea
                        rows={2}
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Raison du refus..."
                        className="w-full p-3 rounded-xl bg-background border border-border focus:border-accent outline-none text-sm text-content"
                      />
                      <div className="flex gap-2">
                        <Button variant="danger" size="sm" onClick={() => handleReject(inst.id)}>
                          Confirmer le refus
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setRejectingId(null); setAdminNote(""); }}>
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 md:flex-none"
                        onClick={() => handleValidate(inst.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Valider et publier
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 md:flex-none"
                        onClick={() => setRejectingId(inst.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Refuser
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}