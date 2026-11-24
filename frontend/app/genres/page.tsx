import { api } from "@/lib/api";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import GenreAccordion from "@/components/genres/GenreAccordion";
import { Music } from "lucide-react";

export default async function GenresPage() {
  let genres: { id: number; label: string }[] = [];

  try {
    const res = await api.get("/genres");
    genres = res?.data ?? [];
  } catch (e) {
    console.error(e);
  }

  return (
    <PageContainer>
      <PageHeader
        label="EXPLORER"
        title="Les genres"
        subtitle="Trouve le style qui correspond à ton projet."
      />

      {genres.length === 0 ? (
        <div className="bg-surface border border-border rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-accent-light text-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Music className="w-8 h-8" />
          </div>
          <p className="text-content-secondary">Aucun genre disponible pour le moment.</p>
        </div>
      ) : (
        <GenreAccordion genres={genres} />
      )}
    </PageContainer>
  );
}