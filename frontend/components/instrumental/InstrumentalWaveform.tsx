"use client";

import { usePlayer } from "@/context/PlayerContext";

type Props = Readonly<{
  id: number;
}>;

export default function InstrumentalWaveform({ id }: Props) {
  const { currentTrack, isPlaying, progress } = usePlayer();
  const isCurrent = currentTrack?.id === id;

  // Génération déterministe basée sur l'ID pour que la forme reste stable
  const bars = Array.from({ length: 35 }).map((_, i) => {
    const seed = id * (i + 1);
    return 20 + ((seed * 13) % 60);
  });

  return (
    <div className="flex items-end gap-[1.5px] h-6 mb-4">
      {bars.map((height, i) => {
        const barPercent = (i / bars.length) * 100;
        // Si c'est le son en cours et qu'il joue, on remplit la barre selon la progression
        const isPlayed = isCurrent && isPlaying && barPercent <= progress;
        
        return (
          <div
            key={i}
            className={`flex-1 rounded-full transition-colors duration-300 ${
              isPlayed ? "bg-accent" : "bg-accent/20"
            }`}
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
}