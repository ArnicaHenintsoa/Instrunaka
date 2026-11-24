"use client";
import { PUBLIC_API_URL } from "@/lib/config";

import Link from "next/link";
import { Search, Play, Pause, ArrowRight } from "lucide-react";
import CoverImage from "@/components/ui/CoverImage";
import { usePlayer } from "@/context/PlayerContext";

type HeroBeat = {
  id: number;
  title: string;
  cover_path: string | null;
  producer?: { display_name: string } | null;
};

export default function HeroContent({ featuredBeat }: { featuredBeat: HeroBeat | null }) {
  const { currentTrack, isPlaying, playTrack } = usePlayer();
  const isFeaturedPlaying = currentTrack?.id === featuredBeat?.id && isPlaying;

  const handlePlayFeatured = () => {
    if (!featuredBeat) return;
    const track = {
      id: featuredBeat.id,
      title: featuredBeat.title,
      producerName: featuredBeat.producer?.display_name,
      coverPath: featuredBeat.cover_path,
      previewUrl: `${PUBLIC_API_URL}/instrumentals/${featuredBeat.id}/preview`,
    };
    playTrack(track, [track]);
  };

  return (
    <>
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center flex-1 flex flex-col justify-center pb-24 pt-32">
        
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 text-white text-xs md:text-sm font-medium mx-auto">
          <span className="flex h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          Écoute gratuite · Licence claire · Téléchargement immédiat
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-[-0.04em] leading-[1.05] mb-4 text-white drop-shadow-2xl">
          Le beat parfait pour <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] to-[#7C5CE8] drop-shadow-[0_0_30px_rgba(124,92,232,0.4)]">ton prochain son.</span>
        </h1>
        
        <p className="text-base md:text-lg text-white/70 max-w-xl mx-auto mb-8">
          Des instrumentales de qualité par des beatmakers malgaches. Écoute, choisis, télécharge en un clic.
        </p>

        {/* Barre de recherche (sans les onglets) */}
        <form action="/catalogue" method="get" className="bg-white/10 backdrop-blur-xl border border-white/20 p-1.5 rounded-2xl flex flex-col md:flex-row items-center gap-2 shadow-2xl w-full max-w-3xl mx-auto mb-6">
          <div className="flex-1 flex items-center gap-3 px-4 w-full min-w-0">
            <Search className="w-4 h-4 text-white/60 shrink-0" />
            <input 
              type="text" 
              name="search" 
              placeholder="Rechercher un beat, un producteur..." 
              className="w-full bg-transparent text-white placeholder:text-white/50 outline-none py-2 text-sm"
            />
          </div>
          <button type="submit" className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors shadow-lg shadow-accent/30 flex items-center justify-center gap-2 shrink-0">
            Rechercher
            <Search className="w-3 h-3" />
          </button>
        </form>

        {/* Chips */}
        <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-2 justify-start md:justify-center w-full px-4">
          <span className="text-xs text-white/50 shrink-0">Populaire :</span>
          {["Afrobeat", "Trap", "Drill", "Lo-fi", "R&B", "Salegy"].map((tag) => (
            <Link key={tag} href={`/catalogue?search=${tag}`} className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] border border-white/10 hover:bg-white/20 transition-colors whitespace-nowrap">
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Beat à la une (Bas Gauche) */}
      {featuredBeat && (
        <div className="absolute bottom-6 left-6 z-20 hidden md:block">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2.5 rounded-xl flex items-center gap-3 max-w-xs">
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative">
              <CoverImage src={featuredBeat.cover_path} alt={featuredBeat.title} id={featuredBeat.id} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold text-accent tracking-widest uppercase mb-0.5">Beat à la une</p>
              <p className="text-xs font-bold text-white truncate">{featuredBeat.title}</p>
              <p className="text-[10px] text-white/60 truncate">{featuredBeat.producer?.display_name}</p>
            </div>
            <button 
              onClick={handlePlayFeatured}
              className="w-8 h-8 rounded-full bg-white text-dark flex items-center justify-center hover:scale-105 transition-transform shrink-0"
            >
              {isFeaturedPlaying ? <Pause className="w-3 h-3" fill="currentColor" /> : <Play className="w-3 h-3 ml-0.5" fill="currentColor" />}
            </button>
          </div>
        </div>
      )}

      <div className="absolute bottom-8 right-10 z-20 hidden md:block">
        <Link href="/licences" className="text-xs font-medium text-white/70 hover:text-white flex items-center gap-2 transition-colors">
          Voir les licences <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </>
  );
}