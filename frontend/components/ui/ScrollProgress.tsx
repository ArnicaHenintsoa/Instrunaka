"use client";

import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const current = window.scrollY;
      setProgress((current / totalHeight) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 bg-transparent z-[100] pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-accent to-purple-400 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}