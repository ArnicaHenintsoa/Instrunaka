import HeroCarousel from "./HeroCarousel";
import HeroContent from "./HeroContent";
import { api } from "@/lib/api";

type HeroBeat = {
  id: number;
  title: string;
  cover_path: string | null;
  producer?: { display_name: string } | null;
};

export default async function HeroSection() {
  let featuredBeat: HeroBeat | null = null;
  try {
    const res = await api.get("/instrumentals?sort=recent");
    featuredBeat = res?.data?.[0] ?? null;
  } catch (e) {
    console.error(e);
  }

  return (
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
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}