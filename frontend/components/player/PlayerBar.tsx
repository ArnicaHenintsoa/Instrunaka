"use client";

import { usePlayer } from "@/context/PlayerContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { auth } from "@/lib/api";
import { Play, Pause, SkipBack, SkipForward, Download, X } from "lucide-react";
import Waveform from "./Waveform";
import CoverImage from "@/components/ui/CoverImage";
import { useState } from "react";

export default function PlayerBar() {
  const { currentTrack, isPlaying, togglePlay, playNext, playPrevious, currentTime, duration } = usePlayer();
  const { openAuthModal } = useAuthModal();
  const [isClosed, setIsClosed] = useState(false);

  if (!currentTrack || isClosed) return null;

  const formatTime = (time: number) => {
    if (!time) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleDownloadClick = () => {
    if (!auth.isAuthenticated()) {
      openAuthModal({
        id: currentTrack.id,
        title: currentTrack.title,
        coverPath: currentTrack.coverPath || null,
        price: 7000,
      });
    } else {
      console.log("Téléchargement lancé pour :", currentTrack.title);
    }
  };

  return (
    <>
      {/* VERSION DESKTOP (lg et plus) */}
      <div className="hidden lg:block fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 animate-in slide-in-from-bottom-8 duration-300">
        <div className="bg-[#1C1838] text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-4">
          
          <div className="flex items-center gap-3 w-1/4 shrink-0">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
              <CoverImage src={currentTrack.coverPath} alt={currentTrack.title} id={currentTrack.id} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{currentTrack.title}</p>
              <p className="text-xs text-gray-400 truncate">{currentTrack.producerName}</p>
            </div>
          </div>

          <div className="flex-1 flex items-center gap-4">
            <button onClick={playPrevious} className="p-2 text-gray-400 hover:text-white transition-colors">
              <SkipBack className="w-5 h-5" fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white text-dark flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5 ml-0.5" fill="currentColor" />}
            </button>
            <button onClick={playNext} className="p-2 text-gray-400 hover:text-white transition-colors">
              <SkipForward className="w-5 h-5" fill="currentColor" />
            </button>
            
            <div className="flex-1 flex items-center gap-3">
              <span className="text-[10px] text-gray-400 w-8 text-right">{formatTime(currentTime)}</span>
              <Waveform />
              <span className="text-[10px] text-gray-400 w-8">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button 
              onClick={handleDownloadClick}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Télécharger</span>
            </button>
            <button onClick={() => setIsClosed(true)} className="p-2 text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* VERSION MOBILE (en dessous de lg) */}
      <div className="lg:hidden fixed bottom-16 left-2 right-2 z-40 animate-in slide-in-from-bottom-8 duration-300">
        <div className="bg-[#1C1838] text-white rounded-xl shadow-lg p-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md overflow-hidden shrink-0">
            <CoverImage src={currentTrack.coverPath} alt={currentTrack.title} id={currentTrack.id} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xs truncate">{currentTrack.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] text-gray-400">{formatTime(currentTime)}</span>
              <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
              </div>
              <span className="text-[9px] text-gray-400">{formatTime(duration)}</span>
            </div>
          </div>

          <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-white text-dark flex items-center justify-center shrink-0">
            {isPlaying ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
          </button>
          
          <button onClick={() => setIsClosed(true)} className="p-1 text-gray-400 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}