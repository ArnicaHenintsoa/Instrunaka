"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import InstrumentalCard from "@/components/instrumental/InstrumentalCard";
import { Search, SlidersHorizontal, X } from "lucide-react";

type Instrumental = {
  id: number;
  title: string;
  cover_path: string | null;
  bpm: number | null;
  non_exclusive_price: number;
  exclusive_price: number;
  producer?: { display_name: string } | null;
  mood?: { label: string } | null;
  musical_key?: string | null;
  genre?: { label: string } | null;
};

type FilterItem = { id: number; name: string; label: string };
type Meta = { current_page: number; per_page: number; total: number; last_page: number };

function FilterSection({
  title,
  items,
  current,
  filterKey,
  onChange,
}: {
  title: string;
  items: FilterItem[];
  current: string;
  filterKey: string;
  onChange: (updates: Record<string, string | null>) => void;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-content-secondary mb-3 uppercase tracking-wider">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isActive = current === item.id.toString();
          return (
            <button
              key={item.id}
              onClick={() => onChange({ [filterKey]: isActive ? null : item.id.toString() })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? "bg-accent text-white shadow-md shadow-accent/20"
                  : "glass-card text-content-secondary hover:border-accent/50 hover:text-accent"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CatalogueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [instrumentals, setInstrumentals] = useState<Instrumental[]>([]);
  const [moods, setMoods] = useState<FilterItem[]>([]);
  const [rhythms, setRhythms] = useState<FilterItem[]>([]);
  const [genres, setGenres] = useState<FilterItem[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const currentMood = searchParams.get("mood_id") || "";
  const currentRhythm = searchParams.get("rhythm_id") || "";
  const currentGenre = searchParams.get("genre_id") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentPage = Number.parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    async function loadClassifications() {
      try {
        const [moodsRes, rhythmsRes, genresRes] = await Promise.all([
          api.get("/moods"),
          api.get("/rhythms"),
          api.get("/genres"),
        ]);
        setMoods(moodsRes?.data ?? []);
        setRhythms(rhythmsRes?.data ?? []);
        setGenres(genresRes?.data ?? []);
      } catch (e) {
        console.error("Erreur chargement classifications", e);
      }
    }
    loadClassifications();
  }, []);

  const loadInstrumentals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (currentMood) params.append("mood_id", currentMood);
      if (currentRhythm) params.append("rhythm_id", currentRhythm);
      if (currentGenre) params.append("genre_id", currentGenre);
      if (currentSearch) params.append("search", currentSearch);
      params.append("page", currentPage.toString());

      const res = await api.get(`/instrumentals?${params.toString()}`);
      setInstrumentals(res?.data ?? []);
      setMeta(res?.meta ?? null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [currentMood, currentRhythm, currentGenre, currentSearch, currentPage]);

  useEffect(() => {
    loadInstrumentals();
  }, [loadInstrumentals]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    if (!("page" in updates)) params.delete("page");
    router.push(`/catalogue?${params.toString()}`);
  };

  const resetFilters = () => router.push("/catalogue");
  const hasActiveFilters = currentMood || currentRhythm || currentGenre || currentSearch;

  let countMessage = "Chargement...";
  if (meta) {
    const plural = meta.total > 1 ? "s" : "";
    countMessage = `${meta.total} instrumentale${plural} trouvée${plural}`;
  }

  return (
    <PageContainer>
      <PageHeader
        label="EXPLORER"
        title="Catalogue"
        subtitle={countMessage}
        action={
          hasActiveFilters && (
            <button onClick={resetFilters} className="text-sm font-semibold text-accent hover:underline flex items-center gap-1">
              <X className="w-4 h-4" /> Effacer les filtres
            </button>
          )
        }
      />

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-secondary" />
          <input
            type="text"
            placeholder="Rechercher par titre ou producteur..."
            defaultValue={currentSearch}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateFilters({ search: (e.target as HTMLInputElement).value || null });
            }}
            className="w-full pl-12 pr-4 py-3 rounded-2xl glass-card text-content focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none text-sm transition-all"
          />
        </div>
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-2xl glass-card text-content font-medium"
        >
          <SlidersHorizontal className="w-5 h-5" /> Filtres
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <aside
          className={`lg:w-64 shrink-0 glass-card rounded-3xl p-6 border-border sticky top-24 ${
            mobileFiltersOpen ? "block w-full" : "hidden lg:block"
          }`}
        >
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h2 className="font-semibold text-content">Filtres</h2>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="p-2 text-content-secondary hover:bg-background-secondary rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <FilterSection title="Humeur" items={moods} current={currentMood} filterKey="mood_id" onChange={updateFilters} />
          <FilterSection title="Rythme" items={rhythms} current={currentRhythm} filterKey="rhythm_id" onChange={updateFilters} />
          <FilterSection title="Genre" items={genres} current={currentGenre} filterKey="genre_id" onChange={updateFilters} />

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="w-full py-3 mt-4 rounded-xl border border-border text-content-secondary font-medium hover:bg-background-secondary transition-colors text-sm"
            >
              Tout effacer
            </button>
          )}
        </aside>

        <div className="flex-1 w-full">
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card rounded-[24px] p-2.5 border-border animate-pulse">
                  <div className="aspect-square bg-background-secondary rounded-[18px] mb-3" />
                  <div className="h-3 w-3/4 bg-background-secondary rounded mb-2" />
                  <div className="h-2 w-1/2 bg-background-secondary rounded mb-4" />
                  <div className="flex justify-between">
                    <div className="h-3 w-1/3 bg-background-secondary rounded" />
                    <div className="h-6 w-16 bg-background-secondary rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="glass-card rounded-3xl p-8 text-center">
              <p className="text-danger">{error}</p>
            </div>
          )}

          {!loading && !error && instrumentals.length === 0 && (
            <EmptyState
              icon={Search}
              title="Aucun beat trouvé"
              description="Aucune instrumentale ne correspond à ta recherche."
              action={
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 rounded-full bg-accent text-white font-semibold hover:bg-accent-hover transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              }
            />
          )}

          {!loading && !error && instrumentals.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {instrumentals.map((inst, index) => (
                  <div key={inst.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <InstrumentalCard
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
                  </div>
                ))}
              </div>

              {meta && meta.last_page > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <button
                    disabled={meta.current_page === 1}
                    onClick={() => updateFilters({ page: (meta.current_page - 1).toString() })}
                    className="px-6 py-2.5 rounded-full glass-card text-content font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-secondary transition-colors"
                  >
                    ← Précédent
                  </button>
                  <span className="text-sm text-content-secondary font-medium">
                    Page {meta.current_page} sur {meta.last_page}
                  </span>
                  <button
                    disabled={meta.current_page === meta.last_page}
                    onClick={() => updateFilters({ page: (meta.current_page + 1).toString() })}
                    className="px-6 py-2.5 rounded-full glass-card text-content font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-secondary transition-colors"
                  >
                    Suivant →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

export default function CataloguePage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <div className="h-12 w-48 bg-background-secondary rounded-lg animate-pulse mb-8 mt-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] glass-card rounded-3xl animate-pulse" />
            ))}
          </div>
        </PageContainer>
      }
    >
      <CatalogueContent />
    </Suspense>
  );
}