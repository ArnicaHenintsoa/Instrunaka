"use client";

import { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from "react";

type Track = {
  id: number;
  title: string;
  producerName?: string;
  coverPath?: string | null;
  previewUrl: string;
  duration?: number;
};

type PlayerContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  progress: number;
  seekTo: (percent: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  currentTime: number;
  duration: number;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleNext = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    const nextTrack = queue[nextIndex];
    setCurrentTrack(nextTrack);
    setIsPlaying(true);
    setProgress(0);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.src = nextTrack.previewUrl;
      audioRef.current.load();
    }
  }, [currentTrack, queue]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleNext);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleNext);
    };
  }, [handleNext]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((e) => console.error("Erreur de lecture:", e));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  const playTrack = (track: Track, newQueue?: Track[]) => {
    if (newQueue) setQueue(newQueue);
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
      return;
    }
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.src = track.previewUrl;
      audioRef.current.load();
    }
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    setIsPlaying(!isPlaying);
  };

  const playNext = () => handleNext();

  const playPrevious = () => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    const prevTrack = queue[prevIndex];
    setCurrentTrack(prevTrack);
    setIsPlaying(true);
    setProgress(0);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.src = prevTrack.previewUrl;
      audioRef.current.load();
    }
  };

  const seekTo = (percent: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = (percent / 100) * audio.duration;
    setProgress(percent);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        playTrack,
        togglePlay,
        playNext,
        playPrevious,
        progress,
        seekTo,
        audioRef,
        currentTime,
        duration,
      }}
    >
      {children}
      <audio ref={audioRef} preload="none" />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer doit être utilisé dans un PlayerProvider");
  }
  return context;
}