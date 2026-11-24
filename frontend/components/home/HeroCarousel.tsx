"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  { image: "/hero/hero-1.webp" },
  { image: "/hero/hero-2.jpg" },
  { image: "/hero/hero-3.webp" },
  { image: "/hero/hero-4.webp" },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <div 
      className="absolute inset-0 w-full h-full overflow-hidden rounded-[32px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {SLIDES.map((slide, index) => (
        <div
          key={slide.image}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center animate-kenburns"
            style={{ backgroundImage: `url('${slide.image}')` }}
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-dark/80 via-dark/50 to-dark/90" />

      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white items-center justify-center hover:bg-white/20 transition-all z-20 hidden md:flex"
        aria-label="Image précédente"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white items-center justify-center hover:bg-white/20 transition-all z-20 hidden md:flex"
        aria-label="Image suivante"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className="h-1.5 rounded-full bg-white/30 overflow-hidden w-10"
            aria-label={`Aller à l'image ${index + 1}`}
          >
            <div
              className={`h-full bg-white transition-all duration-[6000ms] ease-linear ${
                index === currentSlide ? "w-full" : "w-0"
              }`}
              style={{
                animation: index === currentSlide && !isPaused ? "progress-fill 6s linear forwards" : "none",
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}