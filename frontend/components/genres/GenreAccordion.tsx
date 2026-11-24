"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Disc3 } from "lucide-react";

type Genre = { id: number; label: string };

const AUTO_DELAY = 2600; // durée d'ouverture de chaque panneau (ms)
const RESUME_DELAY = 5000; // reprise après un tap mobile (ms)

const getGradient = (id: number) => {
  const hue = (id * 137) % 360;
  return `linear-gradient(160deg, hsl(${hue}, 60%, 40%), hsl(${(hue + 45) % 360}, 65%, 16%))`;
};

export default function GenreAccordion({ genres }: { genres: Genre[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Respecte la préférence "réduire les animations"
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Défilement automatique : le minuteur repart à chaque changement de panneau
  useEffect(() => {
    if (paused || reducedMotion || genres.length < 2) return;
    const timer = setTimeout(() => {
      setActiveIndex((i) => (i + 1) % genres.length);
    }, AUTO_DELAY);
    return () => clearTimeout(timer);
  }, [activeIndex, paused, reducedMotion, genres.length]);

  // Nettoyage du minuteur de reprise
  useEffect(() => {
    return () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  const showAutoProgress = !paused && !reducedMotion && genres.length > 1;

  return (
    <div
      className="flex flex-col md:flex-row gap-3 h-[560px] md:h-[460px] mb-16 animate-slide-up"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setPaused(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setPaused(false);
      }}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {genres.map((genre, index) => {
        const isActive = activeIndex === index;
        const number = String(index + 1).padStart(2, "0");

        return (
          <Link
            key={genre.id}
            href={`/catalogue?genre_id=${genre.id}`}
            aria-label={`Genre ${genre.label}`}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") setActiveIndex(index);
            }}
            onFocus={() => setActiveIndex(index)}
            onClick={(e) => {
              // Tactile : le 1er tap ouvre le panneau, le 2e navigue
              if (!isActive) {
                e.preventDefault();
                setActiveIndex(index);
                setPaused(true);
                if (resumeTimer.current) clearTimeout(resumeTimer.current);
                resumeTimer.current = setTimeout(() => setPaused(false), RESUME_DELAY);
              }
            }}
            className={`group relative min-w-0 min-h-0 overflow-hidden rounded-3xl transition-[flex,box-shadow,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              isActive
                ? "shadow-2xl shadow-black/40"
                : "shadow-lg hover:brightness-125"
            }`}
            style={{ flex: isActive ? 6 : 1, background: getGradient(genre.id) }}
          >
            {/* Voile pour la lisibilité */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            {/* Soleil qui pulse */}
            <div
              className={`absolute -top-12 -right-12 w-60 h-60 rounded-full bg-white/25 blur-2xl transition-all duration-500 ${
                isActive ? "opacity-100 scale-100 genre-sun" : "opacity-0 scale-50"
              }`}
            />

            {/* Reflet qui balaie à l'ouverture */}
            {isActive && (
              <div
                key={`shine-${activeIndex}`}
                className="genre-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
              />
            )}

            {/* Gros numéro fantôme */}
            <span
              className={`pointer-events-none absolute -bottom-6 right-4 text-[9rem] md:text-[12rem] leading-none font-black text-white/10 select-none tabular-nums transition-all duration-500 ${
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              {number}
            </span>

            {/* Disque qui tourne */}
            <Disc3
              className={`absolute -right-6 -bottom-8 w-44 h-44 text-white transition-all duration-700 ${
                isActive ? "opacity-20 rotate-[360deg]" : "opacity-0 rotate-0"
              }`}
            />

            {/* Panneau fermé : numéro en haut + libellé vertical */}
            <div
              className={`absolute inset-0 transition-opacity duration-200 ${
                isActive ? "opacity-0" : "opacity-100 delay-200"
              }`}
            >
              <span className="absolute top-4 left-5 md:left-1/2 md:-translate-x-1/2 text-[10px] font-bold tracking-widest text-white/50 tabular-nums">
                {number}
              </span>
              <div className="absolute inset-0 flex items-center justify-start md:justify-center px-5 md:px-0">
                <span className="text-sm md:text-base font-bold text-white/85 whitespace-nowrap md:[writing-mode:vertical-rl] md:rotate-180 tracking-wide">
                  {genre.label}
                </span>
              </div>
            </div>

            {/* Panneau ouvert */}
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${
                isActive ? "opacity-100 delay-100" : "opacity-0 pointer-events-none"
              }`}
            >
              {/* Égaliseur animé */}
              <div className="absolute top-6 left-6 md:left-8 flex items-end gap-1 h-6" aria-hidden="true">
                {[0.9, 0.6, 1.1, 0.75, 1].map((d, i) => (
                  <span
                    key={i}
                    className="genre-eq w-1 h-full rounded-full bg-white/80 origin-bottom"
                    style={{ animationDuration: `${d}s`, animationDelay: `${i * 90}ms` }}
                  />
                ))}
              </div>

              {/* Flèche */}
              <span
                className={`absolute top-5 right-5 w-11 h-11 rounded-full bg-white text-dark flex items-center justify-center shadow-lg transition-all duration-500 group-hover:-rotate-45 group-hover:scale-110 ${
                  isActive ? "scale-100 opacity-100 delay-200" : "scale-50 opacity-0"
                }`}
              >
                <ArrowRight className="w-5 h-5" />
              </span>

              <div className="absolute bottom-0 left-0 p-6 md:p-8 min-w-[16rem]">
                <p
                  className={`text-[11px] font-bold tracking-[0.3em] text-white/70 mb-1 tabular-nums transition-all duration-500 ${
                    isActive ? "opacity-100 translate-x-0 delay-100" : "opacity-0 -translate-x-3"
                  }`}
                >
                  {number}
                </p>

                {/* Titre qui monte depuis le bas */}
                <div className="overflow-hidden pb-1">
                  <h2
                    className={`text-3xl md:text-5xl font-bold text-white drop-shadow-md whitespace-nowrap transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isActive ? "translate-y-0 delay-150" : "translate-y-full"
                    }`}
                  >
                    {genre.label}
                  </h2>
                </div>

                <p
                  className={`mt-2 text-sm text-white/80 max-w-xs whitespace-normal hidden md:block transition-all duration-500 ${
                    isActive ? "opacity-100 translate-y-0 delay-[250ms]" : "opacity-0 translate-y-3"
                  }`}
                >
                  Explore les instrumentales {genre.label} et trouve celle qui donnera vie à ton projet.
                </p>

                <span
                  className={`mt-3 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold text-white group-hover:bg-white group-hover:text-dark group-hover:gap-2 transition-all duration-500 ${
                    isActive ? "opacity-100 translate-y-0 delay-[350ms]" : "opacity-0 translate-y-3"
                  }`}
                >
                  Découvrir <ArrowRight className="w-3 h-3" />
                </span>

                {/* Barre de progression de l'auto-défilement */}
                {showAutoProgress && isActive && (
                  <div className="mt-4 h-0.5 w-24 rounded-full bg-white/20 overflow-hidden">
                    <div
                      key={`${activeIndex}-progress`}
                      className="h-full bg-white/80 origin-left"
                      style={{ animation: `genre-progress ${AUTO_DELAY}ms linear forwards` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </Link>
        );
      })}

      <style>{`
        @keyframes genre-progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes genre-eq {
          0%, 100% { transform: scaleY(0.2); }
          50% { transform: scaleY(1); }
        }
        @keyframes genre-sun {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.75; }
        }
        @keyframes genre-shine {
          from { transform: translateX(0) skewX(-12deg); }
          to { transform: translateX(400%) skewX(-12deg); }
        }
        .genre-eq { animation: genre-eq 1s ease-in-out infinite; }
        .genre-sun { animation: genre-sun 2.4s ease-in-out infinite; }
        .genre-shine { animation: genre-shine 0.9s ease-out forwards; }

        @media (prefers-reduced-motion: reduce) {
          .genre-eq, .genre-sun, .genre-shine { animation: none; }
        }
      `}</style>
    </div>
  );
}