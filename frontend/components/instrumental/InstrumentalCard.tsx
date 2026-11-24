"use client";

import Link from "next/link";
import { Heart, Play, Pause, Download } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { auth } from "@/lib/api";
import InstrumentalWaveform from "./InstrumentalWaveform";
import CoverImage from "@/components/ui/CoverImage";

type InstrumentalCardProps = Readonly<{
  id: number;
  title: string;
  producerName?: string;
  coverPath?: string | null;
  mood?: string | null;
  genre?: string | null;
  bpm?: number | null;
  musicalKey?: string | null;
  price: number;
  exclusivePrice?: number;
}>;

export default function InstrumentalCard({
  id, title, producerName, coverPath, mood, genre, bpm, musicalKey, price,
}: InstrumentalCardProps) {
  const { currentTrack, isPlaying, playTrack } = usePlayer();
  const { openAuthModal } = useAuthModal();
  
  const previewUrl = `${process.env.NEXT_PUBLIC_API_URL}/instrumentals/${id}/preview`;
  const track = { id, title, producerName, coverPath, previewUrl };

  const isCurrent = currentTrack?.id === id;
  const isCurrentlyPlaying = isCurrent && isPlaying;

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playTrack(track, [track]);
  };

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!auth.isAuthenticated()) {
      openAuthModal({ id, title, coverPath: coverPath || null, price });
    } else {
      window.location.href = `/instrumentales/${id}`;
    }
  };

  return (
    <div className="group relative glass-card rounded-[24px] p-2.5 border border-border hover:border-accent/30 hover:shadow-xl hover:shadow-accent/10 transition-all duration-300 flex flex-col animate-slide-up hover:rotate-1 hover:scale-[1.02]">
      
      <Link href={`/instrumentales/${id}`} className="block relative aspect-square overflow-hidden rounded-[18px] bg-background-secondary">
        <CoverImage src={coverPath} alt={title} id={id} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        
        <div className="absolute top-2.5 left-2.5 bg-dark/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-medium text-white tracking-wide">
          {genre || mood || "Instrumental"}
        </div>

        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-content hover:text-red-500 hover:bg-white transition-all shadow-sm">
          <Heart className="w-3.5 h-3.5" />
        </button>

        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button onClick={handlePlay} className="w-12 h-12 rounded-full bg-white text-accent flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
            {isCurrentlyPlaying ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5 ml-1" fill="currentColor" />}
          </button>
        </div>
      </Link>

      <div className="pt-3 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link href={`/instrumentales/${id}`}>
            <h3 className="font-semibold text-sm text-content truncate hover:text-accent transition-colors">{title}</h3>
          </Link>
        </div>

        {producerName && <p className="text-[11px] text-content-secondary mb-2 truncate">par {producerName}</p>}

        <InstrumentalWaveform id={id} />

        <div className="mt-auto pt-2 border-t border-border flex items-center justify-between gap-2">
          <div className="text-[10px] font-medium text-content-secondary">
            {bpm ? `${bpm} BPM` : "—"} {musicalKey ? `· ${musicalKey}` : ""}
          </div>
          <button
            onClick={handleBuy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-dark text-white text-[10px] font-semibold hover:bg-accent transition-colors"
          >
            <Download className="w-2.5 h-2.5" />
            Acheter
          </button>
        </div>
      </div>
    </div>
  );
}