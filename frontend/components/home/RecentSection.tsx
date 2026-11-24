import Link from "next/link";
import { ArrowRight } from "lucide-react";
import InstrumentalRow from "@/components/instrumental/InstrumentalRow";
import { api } from "@/lib/api";

type Instrumental = {
  id: number;
  title: string;
  cover_path: string | null;
  bpm: number | null;
  duration_seconds: number | null;
  non_exclusive_price: number;
  producer?: { display_name: string } | null;
  mood?: { label: string } | null;
  genre?: { label: string } | null;
  musical_key?: string | null;
};

export default async function RecentSection() {
  let instrumentals: Instrumental[] = [];
  try {
    const res = await api.get("/instrumentals?sort=recent");
    instrumentals = res?.data ?? [];
  } catch (e) {
    console.error(e);
  }

  if (instrumentals.length === 0) return null;

  return (
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
        {instrumentals.map((inst) => (
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
  );
}