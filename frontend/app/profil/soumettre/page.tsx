"use client";
import { PUBLIC_API_URL } from "@/lib/config";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Toast from "@/components/ui/Toast";
import Link from "next/link";

type Option = { id: number; label: string };

export default function SoumettreInstrumentalePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  const [genres, setGenres] = useState<Option[]>([]);
  const [moods, setMoods] = useState<Option[]>([]);
  const [rhythms, setRhythms] = useState<Option[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genreId, setGenreId] = useState("");
  const [moodId, setMoodId] = useState("");
  const [rhythmId, setRhythmId] = useState("");
  const [bpm, setBpm] = useState("");
  const [musicalKey, setMusicalKey] = useState("");
  const [duration, setDuration] = useState("");

  const [cover, setCover] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null); // Fichier vendu (privé)
  const [preview, setPreview] = useState<File | null>(null); // Extrait public (mp3)

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/connexion?redirect=/profil/soumettre");
      return;
    }

    async function loadData() {
      try {
        const [gRes, mRes, rRes] = await Promise.all([
          api.get("/genres"),
          api.get("/moods"),
          api.get("/rhythms"),
        ]);
        setGenres(gRes?.data ?? []);
        setMoods(mRes?.data ?? []);
        setRhythms(rRes?.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setToast({ message: "Le titre est obligatoire.", variant: "error" });
      return;
    }
    if (!audio) {
      setToast({ message: "Le fichier audio est obligatoire.", variant: "error" });
      return;
    }
    if (!preview) {
      setToast({ message: "L'extrait (preview) est obligatoire.", variant: "error" });
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("genre_id", genreId);
    formData.append("mood_id", moodId);
    formData.append("rhythm_id", rhythmId);
    formData.append("bpm", bpm);
    formData.append("musical_key", musicalKey);
    formData.append("duration_seconds", duration);

    if (cover) formData.append("cover", cover);
    formData.append("audio", audio);
    formData.append("preview", preview);

    try {
      const token = auth.getToken();
      const apiUrl = PUBLIC_API_URL;

      const response = await fetch(`${apiUrl}/producer/instrumentals`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la soumission");
      }

      setToast({ message: "Instrumentale soumise avec succès ! En attente de validation.", variant: "success" });
      setTimeout(() => router.push("/profil"), 3000);
    } catch (e: unknown) {
      setToast({
        message: e instanceof Error ? e.message : "Erreur lors de la soumission",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-16 text-center">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <Link href="/profil" className="text-sm text-content-secondary hover:text-accent mb-4 inline-block">
          ← Retour au profil
        </Link>
        <h1 className="text-3xl font-bold mb-2">Soumettre une instrumentale</h1>
        <p className="text-content-secondary">
          Remplis les informations ci-dessous. Ta création sera examinée par un administrateur avant publication.
        </p>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titre *</label>
              <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-background focus:border-accent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tonalité</label>
              <input type="text" value={musicalKey} onChange={(e) => setMusicalKey(e.target.value)} placeholder="Ex: C min" className="w-full p-2.5 rounded-xl border border-border bg-background focus:border-accent outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-background focus:border-accent outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Genre</label>
              <select value={genreId} onChange={(e) => setGenreId(e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-background focus:border-accent outline-none">
                <option value="">Sélectionner...</option>
                {genres.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Humeur</label>
              <select value={moodId} onChange={(e) => setMoodId(e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-background focus:border-accent outline-none">
                <option value="">Sélectionner...</option>
                {moods.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rythme</label>
              <select value={rhythmId} onChange={(e) => setRhythmId(e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-background focus:border-accent outline-none">
                <option value="">Sélectionner...</option>
                {rhythms.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">BPM</label>
              <input type="number" value={bpm} onChange={(e) => setBpm(e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-background focus:border-accent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Durée (secondes)</label>
              <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-background focus:border-accent outline-none" />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="font-semibold">Fichiers</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">Cover (Image, optionnel)</label>
              <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] ?? null)} className="w-full text-sm text-content-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-light file:text-accent hover:file:bg-accent/20" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fichier Audio (MP3 ou WAV, max 50 Mo) *</label>
              <input type="file" accept=".mp3,.wav" onChange={(e) => setAudio(e.target.files?.[0] ?? null)} className="w-full text-sm text-content-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-light file:text-accent hover:file:bg-accent/20" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Extrait à écouter (MP3, 30 s conseillé, max 10 Mo) *</label>
              <input type="file" accept=".mp3" onChange={(e) => setPreview(e.target.files?.[0] ?? null)} className="w-full text-sm text-content-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-light file:text-accent hover:file:bg-accent/20" />
              <p className="text-xs text-content-secondary mt-1">C&apos;est le seul extrait que les visiteurs pourront écouter gratuitement. Le fichier complet reste privé.</p>
            </div>
          </div>

          <Button type="submit" loading={submitting} className="w-full">
            Soumettre l&apos;instrumentale
          </Button>
        </form>
      </Card>
    </div>
  );
}