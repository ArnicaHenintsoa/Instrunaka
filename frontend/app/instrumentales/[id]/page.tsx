"use client";

import { use, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { api, auth } from "@/lib/api";
import Button from "@/components/ui/Button";
import OrderModal from "@/components/order/OrderModal";
import Toast from "@/components/ui/Toast";
import ReviewSection from "@/components/instrumental/ReviewSection";
import FollowButton from "@/components/producer/FollowButton";
import AddToPlaylistButton from "@/components/playlist/AddToPlaylistButton";
import CoverImage from "@/components/ui/CoverImage";
import { usePlayer } from "@/context/PlayerContext";
import { useAuthModal } from "@/context/AuthModalContext";
import {
  ArrowLeft,
  Heart,
  ShieldCheck,
  Music,
  Timer,
  Activity,
  Tag,
  Play,
  Pause,
  Download,
} from "lucide-react";
import { formatPrice } from "@/lib/format";

type InstrumentalDetail = {
  id: number;
  title: string;
  description: string | null;
  cover_path: string | null;
  bpm: number | null;
  musical_key: string | null;
  duration_seconds: number | null;
  non_exclusive_price: number;
  exclusive_price: number;
  status: string;
  producer?: { id: number; display_name: string; verified: boolean } | null;
  genre?: { label: string } | null;
  mood?: { label: string } | null;
  rhythm?: { label: string } | null;
  files?: { id: number; type: string }[];
};

type OrderPayment = {
  mobile_number: string;
  holder_name: string;
  reference: string;
  amount: number;
};

type PageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;


const WAVE = [
  30, 55, 40, 70, 50, 85, 60, 45, 75, 35, 65, 90, 50, 40, 70, 55, 80, 45, 60, 35,
  75, 50, 65, 40, 55, 70, 45, 60, 35, 50, 80, 55,
];

function Chip({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background-secondary text-content-secondary text-xs font-medium">
      <Icon className="w-3.5 h-3.5" />
      {children}
    </span>
  );
}

export default function InstrumentalDetailPage({ params }: PageProps) {
  const { id } = use(params);

  const [instrumental, setInstrumental] = useState<InstrumentalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [orderType, setOrderType] = useState<"non_exclusive" | "exclusive" | null>(null);
  const [payment, setPayment] = useState<OrderPayment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const { openAuthModal } = useAuthModal();

  const isCurrent = currentTrack?.id === Number(id);
  const isCurrentlyPlaying = isCurrent && isPlaying;

  useEffect(() => {
    async function loadInstrumental() {
      try {
        const res = await api.get(`/instrumentals/${id}`);
        setInstrumental(res?.data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    void loadInstrumental();
  }, [id]);

  useEffect(() => {
    async function checkFavorite() {
      if (!auth.isAuthenticated() || !instrumental) return;
      try {
        const res = await api.get(`/favorites/${instrumental.id}/check`);
        setIsFavorited(res?.is_favorited ?? false);
      } catch {}
    }
    void checkFavorite();
  }, [instrumental]);

  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOpenOrder = (type: "non_exclusive" | "exclusive") => {
    if (!auth.isAuthenticated()) {
      openAuthModal({
        id: instrumental!.id,
        title: instrumental!.title,
        coverPath: instrumental!.cover_path,
        price: type === "exclusive" ? instrumental!.exclusive_price : instrumental!.non_exclusive_price,
      });
      return;
    }
    setOrderType(type);
    setIsModalOpen(true);
  };

  const handleCreateOrder = async (promoCode?: string) => {
    if (!instrumental || !orderType) return;
    const res = await api.post("/orders", {
      instrumental_id: instrumental.id,
      type: orderType,
      promo_code: promoCode || undefined,
    });
    setPayment(res.payment);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setOrderType(null);
    setPayment(null);
  };

  const handleToggleFavorite = async () => {
    if (!auth.isAuthenticated()) {
      openAuthModal({
        id: instrumental!.id,
        title: instrumental!.title,
        coverPath: instrumental!.cover_path,
        price: instrumental!.non_exclusive_price,
      });
      return;
    }
    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        await api.delete(`/favorites/${instrumental!.id}`);
        setIsFavorited(false);
      } else {
        await api.post(`/favorites/${instrumental!.id}`);
        setIsFavorited(true);
      }
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : "Erreur", variant: "error" });
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handlePlayToggle = () => {
    if (!instrumental) return;
    if (isCurrent) {
      togglePlay();
    } else {
      const previewUrl = `${process.env.NEXT_PUBLIC_API_URL}/instrumentals/${instrumental.id}/preview`;
      const track = {
        id: instrumental.id,
        title: instrumental.title,
        producerName: instrumental.producer?.display_name,
        coverPath: instrumental.cover_path,
        previewUrl,
      };
      playTrack(track, [track]);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-16 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-pulse">
          <div className="lg:col-span-5 aspect-square rounded-[32px] bg-background-secondary" />
          <div className="lg:col-span-7 space-y-4">
            <div className="h-4 w-24 rounded bg-background-secondary" />
            <div className="h-12 w-3/4 rounded bg-background-secondary" />
            <div className="h-4 w-1/2 rounded bg-background-secondary" />
            <div className="h-40 rounded-3xl bg-background-secondary mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !instrumental) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-16 text-center">
        <p className="text-danger mb-4">{error || "Introuvable."}</p>
        <Link href="/catalogue">
          <Button variant="secondary">Retour</Button>
        </Link>
      </div>
    );
  }

  const hasPreview = instrumental.files?.some((f) => f.type === "preview");
  const basePrice = orderType === "exclusive" ? instrumental.exclusive_price : instrumental.non_exclusive_price;
  const producer = instrumental.producer;

  return (
    <div className="container mx-auto px-4 pt-24 md:pt-28 pb-16 max-w-6xl animate-slide-up">
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

      <Link
        href="/catalogue"
        className="inline-flex items-center gap-1.5 text-sm text-content-secondary hover:text-accent mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Retour au catalogue
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start mb-16">
       
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <div className="relative isolate">
            <div className="absolute -inset-6 -z-10 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />

            <div className="group relative w-full aspect-square rounded-[32px] overflow-hidden border border-border shadow-2xl">
              <CoverImage
                src={instrumental.cover_path}
                alt={instrumental.title}
                id={instrumental.id}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {hasPreview && (
                <button
                  type="button"
                  onClick={handlePlayToggle}
                  aria-label={isCurrentlyPlaying ? "Mettre en pause" : "Écouter l'extrait"}
                  className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                >
                  <span className="w-16 h-16 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform">
                    {isCurrentlyPlaying ? (
                      <Pause className="w-7 h-7 text-accent" fill="currentColor" />
                    ) : (
                      <Play className="w-7 h-7 text-accent ml-1" fill="currentColor" />
                    )}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              className={`flex-1 h-12 rounded-full inline-flex items-center justify-center gap-2 text-sm font-semibold border transition-all disabled:opacity-60 ${
                isFavorited
                  ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                  : "bg-surface border-border text-content hover:border-accent/50 hover:text-accent"
              }`}
            >
              <Heart className="w-4 h-4" fill={isFavorited ? "currentColor" : "none"} />
              {isFavorited ? "Dans mes favoris" : "Ajouter aux favoris"}
            </button>
            <AddToPlaylistButton instrumentalId={instrumental.id} size="md" />
          </div>
        </div>

       
        <div className="lg:col-span-7 min-w-0">
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-3">
            {instrumental.genre?.label || "Instrumentale"}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-content leading-[1.1] tracking-tight mb-5">
            {instrumental.title}
          </h1>

         
          {producer && (
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Link href={`/producteurs/${producer.id}`} className="group inline-flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold">
                  {producer.display_name.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-semibold text-content group-hover:text-accent transition-colors">
                  {producer.display_name}
                </span>
                {producer.verified && <ShieldCheck className="w-4 h-4 text-accent" />}
              </Link>
              <FollowButton producerId={producer.id} size="sm" />
            </div>
          )}

       
          <div className="flex flex-wrap gap-2 mb-6">
            {instrumental.bpm && <Chip icon={Activity}>{instrumental.bpm} BPM</Chip>}
            {instrumental.musical_key && <Chip icon={Music}>{instrumental.musical_key}</Chip>}
            {instrumental.mood && <Chip icon={Tag}>{instrumental.mood.label}</Chip>}
            {instrumental.rhythm && <Chip icon={Activity}>{instrumental.rhythm.label}</Chip>}
            {instrumental.duration_seconds && (
              <Chip icon={Timer}>{formatDuration(instrumental.duration_seconds)}</Chip>
            )}
          </div>

          {instrumental.description && (
            <p className="text-sm md:text-base text-content-secondary leading-relaxed mb-8 max-w-2xl">
              {instrumental.description}
            </p>
          )}

      
          {hasPreview && (
            <div className="bg-surface border border-border rounded-3xl p-4 md:p-5 flex items-center gap-4 mb-8 shadow-sm">
              <button
                onClick={handlePlayToggle}
                aria-label={isCurrentlyPlaying ? "Mettre en pause" : "Écouter l'extrait"}
                className="w-14 h-14 rounded-full bg-accent hover:bg-accent-hover flex items-center justify-center text-white shadow-lg shadow-accent/30 transition-colors shrink-0"
              >
                {isCurrentlyPlaying ? (
                  <Pause className="w-6 h-6" fill="currentColor" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-content mb-2">
                  {isCurrentlyPlaying ? "En lecture" : isCurrent ? "En pause" : "Écouter l'extrait"}
                </p>
                <div className="flex items-center gap-[3px] h-8" aria-hidden="true">
                  {WAVE.map((h, i) => (
                    <span
                      key={i}
                      className={`flex-1 rounded-full transition-colors duration-300 ${
                        isCurrent ? "bg-accent" : "bg-content-secondary/25"
                      } ${isCurrentlyPlaying ? "animate-pulse" : ""}`}
                      style={{ height: `${h}%`, animationDelay: `${(i % 8) * 110}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

        
          <h2 className="text-lg font-bold text-content mb-4">Choisir une licence</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Standard */}
            <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col shadow-sm">
              <p className="text-sm font-semibold text-content">Licence Standard</p>
              <p className="text-xs text-content-secondary mt-1">MP3 + WAV · Usage non exclusif</p>
              <p className="text-3xl font-bold text-content mt-5 mb-6">
                {formatPrice(instrumental.non_exclusive_price)}
              </p>
              <Button
                variant="secondary"
                className="w-full rounded-full mt-auto"
                onClick={() => handleOpenOrder("non_exclusive")}
              >
                <Download className="w-4 h-4 mr-2" /> Télécharger
              </Button>
            </div>

            
            <div className="relative bg-accent/5 border-2 border-accent/40 rounded-3xl p-6 flex flex-col shadow-lg shadow-accent/10">
              <span className="absolute -top-3 right-5 px-3 py-1 rounded-full bg-accent text-white text-[10px] font-bold tracking-wider uppercase">
                Exclusive
              </span>
              <p className="text-sm font-semibold text-content">Licence Exclusive</p>
              <p className="text-xs text-content-secondary mt-1">MP3 + WAV · Propriété unique</p>
              <p className="text-3xl font-bold text-accent mt-5 mb-6">
                {formatPrice(instrumental.exclusive_price)}
              </p>
              <Button
                variant="primary"
                className="w-full rounded-full mt-auto bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20"
                onClick={() => handleOpenOrder("exclusive")}
              >
                Acheter
              </Button>
            </div>
          </div>

          <p className="text-xs text-content-secondary mt-4 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Paiement par Mobile Banking, validé manuellement.
          </p>
        </div>
      </div>

      
      <div className="border-t border-border pt-10">
        <ReviewSection instrumentalId={instrumental.id} />
      </div>

      <OrderModal
        isOpen={isModalOpen}
        onClose={closeModal}
        payment={payment}
        orderType={orderType ?? "non_exclusive"}
        instrumentalTitle={instrumental.title}
        coverPath={instrumental.cover_path}
        basePrice={basePrice}
        onCreateOrder={handleCreateOrder}
      />
    </div>
  );
}