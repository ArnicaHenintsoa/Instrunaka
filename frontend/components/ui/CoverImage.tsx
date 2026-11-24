"use client";
import { PUBLIC_API_URL } from "@/lib/config";

import { useState, useEffect } from "react";

type CoverImageProps = {
  src?: string | null;
  alt: string;
  id: number | string;
  className?: string;
};

export default function CoverImage({ src, alt, id, className = "" }: CoverImageProps) {
  const [hasError, setHasError] = useState(false);

  // Résolution de l'URL
  const resolveUrl = (path: string | null | undefined) => {
    if (!path) return null;
    
    // Si c'est déjà une URL complète
    if (path.startsWith("http")) {
      return path;
    }

    // On récupère l'URL de l'API (ex: http://localhost:8000/api)
    const apiUrl = PUBLIC_API_URL;
    
    // On retire le "/api" de la fin pour avoir la racine du backend (ex: http://localhost:8000)
    const backendUrl = apiUrl.replace(/\/api\/?$/, "");

    // Si le chemin commence par /storage, on ajoute juste le backend
    if (path.startsWith("/storage")) {
      return `${backendUrl}${path}`;
    }

    // Si le chemin est un nom de fichier (ex: covers/abc.jpg), on le place dans /storage
    if (path.startsWith("covers") || path.startsWith("previews") || path.startsWith("audio")) {
      return `${backendUrl}/storage/${path}`;
    }

    // Sinon, on préfixe avec l'API
    return `${apiUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const finalSrc = resolveUrl(src);

  // Dégradé de secours
  const hue = (Number(id) * 137) % 360;
  const gradientStyle = {
    background: `linear-gradient(135deg, hsl(${hue}, 70%, 85%), hsl(${(hue + 40) % 360}, 70%, 70%))`,
  };

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!finalSrc || hasError) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={gradientStyle}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}