"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ArrowRight, MapPin, Check } from "lucide-react";
import HeroCarousel from "@/components/home/HeroCarousel";
import HeroContent from "@/components/home/HeroContent";
import InstrumentalCard from "@/components/instrumental/InstrumentalCard";
import InstrumentalRow from "@/components/instrumental/InstrumentalRow";

type Instrumental = {
  id: number;
  title: string;
  cover_path: string | null;
  bpm: number | null;
  duration_seconds: number | null;
  non_exclusive_price: number;
  exclusive_price: number;
  producer?: { display_name: string } | null;
  mood?: { label: string } | null;
  genre?: { label: string } | null;
  musical_key?: string | null;
};

type Stats = { instrumentals: number; producers: number; downloads: number; };

const MIN_BEATS_FOR_STATS = 50;

export default function HomePage() {
  const [instrumentals, setInstrumentals] = useState<Instrumental[]>([]);
  const [stats, setStats] = useState<Stats>({ instrumentals: 0, producers: 0, downloads: 0 });
  const [loading, setLoading] = useState(true);
  const [featuredBeat, setFeaturedBeat] = useState<Instrumental | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [instrumentsRes, statsRes] = await Promise.all([
          api.get("/instrumentals?sort=recent"),
          api.get("/stats"),
        ]);
        
        const apiBeats = instrumentsRes?.data ?? [];
        
        setInstrumentals(apiBeats);
        if (statsRes) setStats(statsRes);
        
        if (apiBeats.length > 0) {
          setFeaturedBeat(apiBeats[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  const trending = instrumentals.slice(0, 4);
  const recent = instrumentals;

  // Skeleton de chargement (pour éviter le "Chargement du hero...")
  if (loading) {
    return (
      <div className="bg-background min-h-screen pb-20">
        <section className="w-full px-2 md:px-4 pt-2 mb-16 max-w-[1600px] mx-auto">
          <div className="relative rounded-[32px] overflow-hidden h-[calc(100vh-16px)] min-h-[680px] bg-dark animate-pulse">
             <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                <div className="w-40 h-10 bg-white/10 rounded-full" />
                <div className="w-3/4 max-w-3xl h-32 bg-white/10 rounded-3xl" />
                <div className="w-1/2 max-w-md h-8 bg-white/10 rounded-xl" />
                <div className="w-full max-w-2xl h-20 bg-white/10 rounded-3xl mt-8" />
             </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      
      {/* ================= HERO ================= */}
      <section className="w-full px-2 md:px-4 pt-2 mb-16 max-w-[1600px] mx-auto animate-slide-up">
        <div className="relative rounded-[32px] overflow-hidden h-[calc(100vh-16px)] min-h-[680px] flex flex-col justify-center bg-dark">
          
          <HeroCarousel />
          <HeroContent featuredBeat={featuredBeat} />

          <div className="absolute bottom-0 left-0 w-full h-24 flex items-end justify-center gap-1 opacity-20 pointer-events-none z-0">
            {[...Array(60)].map((_, i) => (
              <div 
                key={i} 
                className="w-1.5 bg-white rounded-t-sm eq-bar" 
                style={{ 
                  height: `${20 + Math.sin(i * 0.5) * 30 + (i * 7) % 40}%`,
                  animationDelay: `${i * 0.05}s` 
                }} 
              />
            ))}
          </div>

        </div>
      </section>

      {/* ================= BANDE D'ARGUMENTS (3 CARTES) ================= */}
      <section className="container mx-auto px-4 max-w-7xl mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="group glass-card rounded-2xl p-5 flex items-center gap-4 animate-slide-up hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1 transition-all duration-300" style={{ animationDelay: "0ms" }}>
            <div className="w-12 h-12 rounded-xl bg-accent-light text-accent flex items-center justify-center font-bold text-xl shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 animate-float">
              Ar
            </div>
            <div>
              <p className="font-bold text-content text-sm">Dès 7 000 Ar</p>
              <p className="text-xs text-content-secondary">Des prix accessibles</p>
            </div>
          </div>

          <div className="group glass-card rounded-2xl p-5 flex items-center gap-4 animate-slide-up hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1 transition-all duration-300" style={{ animationDelay: "100ms" }}>
            <div className="w-12 h-12 rounded-xl bg-accent-light text-accent flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 animate-float" style={{ animationDelay: "0.5s" }}>
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-content text-sm">Fait à Madagascar</p>
              <p className="text-xs text-content-secondary">Le talent local en avant</p>
            </div>
          </div>

          <div className="group glass-card rounded-2xl p-5 flex items-center gap-4 animate-slide-up hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1 transition-all duration-300" style={{ animationDelay: "200ms" }}>
            <div className="w-12 h-12 rounded-xl bg-accent-light text-accent flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 animate-float" style={{ animationDelay: "1s" }}>
              <Check className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-content text-sm">Licence claire</p>
              <p className="text-xs text-content-secondary">Tu sais ce que tu achètes</p>
            </div>
          </div>

        </div>
      </section>

      {/* AFFICHAGE DES STATS */}
      {stats.instrumentals > MIN_BEATS_FOR_STATS && (
        <section className="container mx-auto px-4 max-w-3xl mb-12 text-center animate-slide-up">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-3xl font-bold text-content">{stats.instrumentals}</p>
              <p className="text-xs text-content-secondary">Instrumentales</p>
            </div>
            <div className="border-x border-border">
              <p className="text-3xl font-bold text-content">{stats.producers}</p>
              <p className="text-xs text-content-secondary">Producteurs</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-content">{stats.downloads}</p>
              <p className="text-xs text-content-secondary">Téléchargements</p>
            </div>
          </div>
        </section>
      )}

      {/* ================= TENDANCES ================= */}
      {trending.length > 0 && (
        <section className="container mx-auto px-4 py-12 max-w-7xl animate-slide-up">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-accent font-semibold text-xs tracking-wider uppercase mb-2 block">La sélection Instrunaka</span>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-2 text-content">Tendances de la semaine</h2>
              <p className="text-content-secondary text-sm">Les beats qui font vibrer la communauté en ce moment.</p>
            </div>
            <Link href="/catalogue" className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
              Tout explorer <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {trending.map((inst) => (
              <InstrumentalCard
                key={inst.id}
                id={inst.id}
                title={inst.title}
                producerName={inst.producer?.display_name}
                coverPath={inst.cover_path}
                mood={inst.mood?.label}
                genre={inst.genre?.label}
                bpm={inst.bpm}
                musicalKey={inst.musical_key}
                price={inst.non_exclusive_price}
                exclusivePrice={inst.exclusive_price}
              />
            ))}
          </div>
        </section>
      )}

      {/* ================= DERNIERS AJOUTS ================= */}
      {recent.length > 0 && (
        <section className="container mx-auto px-4 py-12 max-w-7xl animate-slide-up">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-accent font-semibold text-xs tracking-wider uppercase mb-2 block">Tout juste sortis du studio</span>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-2 text-content">Derniers ajouts</h2>
              <p className="text-content-secondary text-sm">Découvre les dernières pépites déposées par nos producteurs.</p>
            </div>
            <Link href="/catalogue" className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {recent.map((inst) => (
              <InstrumentalRow
                key={inst.id}
                id={inst.id}
                title={inst.title}
                producerName={inst.producer?.display_name}
                coverPath={inst.cover_path}
                mood={inst.mood?.label}
                genre={inst.genre?.label}
                bpm={inst.bpm}
                musicalKey={inst.musical_key}
                durationSeconds={inst.duration_seconds}
                price={inst.non_exclusive_price}
              />
            ))}
          </div>
        </section>
      )}

      {/* ================= BLOC PRODUCTEUR ================= */}
      <section className="container mx-auto px-4 py-16 max-w-7xl animate-slide-up">
        <div className="bg-gradient-to-br from-accent-light to-[#E0D8FD] dark:from-accent/10 dark:to-background-secondary rounded-[40px] p-6 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative">
          
          <div className="flex-1 text-center md:text-left relative z-10">
            <span className="text-accent font-semibold text-xs tracking-wider uppercase mb-3 block">
              Ta musique mérite d&apos;être entendue
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-content mb-4 leading-tight">
              Tu produis des beats ?
            </h2>
            <p className="text-content-secondary mb-6 max-w-md mx-auto md:mx-0 text-sm">
              Rejoins les producteurs malgaches qui partagent leur son, développent leur audience et vivent de leur passion.
            </p>
            <Link 
              href="/inscription"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent text-white font-semibold hover:bg-accent-hover transition-all shadow-lg shadow-accent/30 hover:-translate-y-1 text-sm"
            >
              Devenir producteur <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex-1 relative w-full flex justify-center items-center h-[250px] md:h-[350px]">
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-30 px-10">
              {[...Array(25)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-2 bg-accent rounded-full eq-bar" 
                  style={{ animationDelay: `${i * 0.1}s`, height: `${20 + (i * 13) % 60}%` }} 
                />
              ))}
            </div>

            <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-full bg-dark border-8 border-[#1A153A] shadow-2xl flex items-center justify-center animate-spin-slow">
              <div className="absolute inset-2 rounded-full border border-white/10" />
              <div className="absolute inset-6 rounded-full border border-white/10" />
              <div className="absolute inset-10 rounded-full border border-white/10" />
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-accent flex flex-col items-center justify-center">
                <span className="text-[8px] font-bold text-white tracking-widest uppercase">Instru</span>
                <span className="text-[8px] font-bold text-white tracking-widest uppercase">naka</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}