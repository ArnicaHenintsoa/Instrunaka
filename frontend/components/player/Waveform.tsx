"use client";

import { usePlayer } from "@/context/PlayerContext";

export default function Waveform() {
  const { progress, seekTo, currentTrack } = usePlayer();

  // Générer une waveform décorative déterministe basée sur l'id du track
  const bars = Array.from({ length: 50 }).map((_, i) => {
    const seed = (currentTrack?.id || 1) * (i + 1);
    return 20 + ((seed * 13) % 60);
  });

  return (
    <div 
      className="flex items-end gap-[2px] h-8 flex-1 cursor-pointer" 
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        seekTo((x / rect.width) * 100);
      }}
    >
      {bars.map((height, i) => {
        const barPercent = (i / bars.length) * 100;
        const isPlayed = barPercent <= progress;
        return (
          <div
            key={i}
            className={`flex-1 rounded-full transition-colors ${isPlayed ? "bg-accent" : "bg-gray-600"}`}
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
}