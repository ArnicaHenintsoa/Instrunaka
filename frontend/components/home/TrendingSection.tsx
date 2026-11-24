import Link from "next/link";
import { ArrowRight } from "lucide-react";
import InstrumentalCard from "@/components/instrumental/InstrumentalCard";
import { api } from "@/lib/api";

type Instrumental = {
  id: number;
  title: string;
  cover_path: string | null;
  bpm: number | null;
  non_exclusive_price: number;
  exclusive_price: number;
  producer?: { display_name: string } | null;
  mood?: { label: string } | null;
  genre?: { label: string } | null;
  musical_key?: string | null;
};

export default async function TrendingSection() {
  let instrumentals: Instrumental[] = [];
  try {
    const res = await api.get("/instrumentals?sort=recent");
    instrumentals = res?.data?.slice(0, 4) ?? [];
  } catch (e) {
    console.error(e);
  }

  if (instrumentals.length === 0) return null;

  return (
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
        {instrumentals.map((inst) => (
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
  );
}