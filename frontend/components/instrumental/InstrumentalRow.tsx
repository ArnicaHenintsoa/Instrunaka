"use client";

import Link from "next/link";
import { Heart, Download, Play, Pause } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { auth } from "@/lib/api";
import CoverImage from "@/components/ui/CoverImage";

type InstrumentalRowProps = Readonly<{
  id: number;
  title: string;
  producerName?: string;
  coverPath?: string | null;
  mood?: string | null;
  genre?: string | null;
  bpm?: number | null;
  musicalKey?: string | null;
  durationSeconds?: number | null;
  price: number;
}>;

export default function InstrumentalRow({
  id, title, producerName, coverPath, genre, bpm, musicalKey, price,
}: InstrumentalRowProps) {
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

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!auth.isAuthenticated()) {
      openAuthModal({ id, title, coverPath: coverPath || null, price });
    } else {
      window.location.href = `/instrumentales/${id}`;
    }
  };

  return (
    <div className="group flex items-center gap-4 p-3 glass-card border border-border hover:border-accent/30 hover:shadow-sm transition-all duration-300 animate-slide-up">
      
      <button
        onClick={handlePlay}
        className="w-10 h-10 rounded-full bg-accent-light text-accent flex items-center justify-center shrink-0 hover:bg-accent hover:text-white transition-colors"
        aria-label={isCurrentlyPlaying ? "Pause" : "Lecture"}
      >
        {isCurrentlyPlaying ? (
          <Pause className="w-4 h-4" fill="currentColor" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
        )}
      </button>

      <Link href={`/instrumentales/${id}`} className="shrink-0 relative w-14 h-14 rounded-xl overflow-hidden bg-background-secondary">
        <CoverImage src={coverPath} alt={title} id={id} className="w-full h-full object-cover" />
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/instrumentales/${id}`}>
          <h3 className="text-sm font-semibold text-content truncate hover:text-accent transition-colors">
            {title}
          </h3>
        </Link>
        {producerName && (
          <p className="text-xs text-content-secondary truncate mt-0.5">
            {producerName}
          </p>
        )}
      </div>

      <div className="hidden lg:flex items-center gap-6 shrink-0">
        {genre && (
          <span className="px-3 py-1 bg-accent-light text-accent text-[11px] font-semibold rounded-full">
            {genre}
          </span>
        )}
        <div className="w-20 text-xs text-content-secondary">
          {bpm ? `${bpm} BPM` : "—"}
        </div>
        <div className="w-16 text-xs text-content-secondary">
          {musicalKey || "—"}
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 shrink-0">
        <button
          onClick={() => {}}
          className="hidden md:flex w-8 h-8 items-center justify-center text-content-secondary hover:text-red-500 transition-colors"
          aria-label="Ajouter aux favoris"
        >
          <Heart className="w-5 h-5" />
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 w-10 h-10 md:w-auto md:h-auto md:px-5 md:py-2.5 rounded-xl bg-dark text-white text-xs font-semibold hover:bg-accent transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span className="hidden md:inline">Télécharger</span>
        </button>
      </div>
    </div>
  );
}