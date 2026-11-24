"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
      aria-label="Basculer le thème"
    >
      <span className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
        theme === "dark" ? "bg-purple-500/20 opacity-100" : "opacity-0"
      }`} />
      
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-400 relative z-10" />
      ) : (
        <Moon className="w-5 h-5 text-content relative z-10" />
      )}
    </button>
  );
}