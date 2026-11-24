import Link from "next/link";
import { api } from "@/lib/api";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Mic2, ArrowRight } from "lucide-react";

type Producer = {
  id: number;
  display_name: string;
  bio: string | null;
  verified?: boolean;
  instrumentals_count?: number;
};

const getGradient = (id: number) => {
  const hue = (id * 137) % 360;
  return `linear-gradient(135deg, hsl(${hue}, 65%, 55%), hsl(${(hue + 40) % 360}, 70%, 40%))`;
};

export default async function ProducteursPage() {
  let producers: Producer[] = [];

  try {
    const res = await api.get("/producers");
    producers = res?.data ?? [];
  } catch (e) {
    console.error(e);
  }

  return (
    <PageContainer>
      <PageHeader
        label="COMMUNAUTÉ"
        title="Les producteurs"
        subtitle="Découvre les beatmakers qui font vibrer la scène malgache."
      />

      {producers.length === 0 ? (
        <div className="bg-surface border border-border rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-accent-light dark:bg-accent/15 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Mic2 className="w-8 h-8" />
          </div>
          <p className="text-content-secondary">Aucun producteur disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
          {producers.map((producer, index) => {
            const count = producer.instrumentals_count ?? 0;

            return (
              <Link
                key={producer.id}
                href={`/producteurs/${producer.id}`}
                className="group relative overflow-hidden glass-card rounded-3xl p-6 hover:border-accent/30 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-2 transition-all duration-500 flex flex-col animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Avatar */}
                <div className="relative mb-4 w-20">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl"
                    style={{ background: getGradient(producer.id) }}
                  >
                    {producer.display_name.charAt(0).toUpperCase()}
                  </div>
                  {producer.verified && (
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center border-2 border-surface animate-pulse-glow">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Infos */}
                <h2 className="text-lg font-bold text-content mb-1 group-hover:text-accent transition-colors duration-300">
                  {producer.display_name}
                </h2>
                <p className="text-xs text-content-secondary mb-3">
                  {count} instrumentale{count > 1 ? "s" : ""}
                </p>

                {producer.bio && (
                  <p className="text-sm text-content-secondary line-clamp-2 mb-4 flex-1">
                    {producer.bio}
                  </p>
                )}

                {/* Lien */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                  <span className="text-xs font-semibold text-accent flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                    Voir le profil
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>

                {/* Halo au survol */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-accent/5 to-transparent" />
              </Link>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}