"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, Download } from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";
import CoverImage from "@/components/ui/CoverImage";
import { formatPrice } from "@/lib/format";

export default function AuthModal() {
  const { isOpen, beatToDownload, closeAuthModal } = useAuthModal();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthModal();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeAuthModal]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-dark/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={closeAuthModal}
      />

      <div className="relative glass-card rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border-border">
        <button 
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-content-secondary hover:bg-background-secondary rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-content mb-2 pr-8">Connecte-toi pour télécharger cette instrumentale</h2>
        <p className="text-content-secondary text-sm mb-6">C&apos;est gratuit, rapide et sécurisé.</p>

        {beatToDownload && (
          <div className="flex items-center gap-4 bg-background-secondary p-3 rounded-2xl mb-8">
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
              <CoverImage src={beatToDownload.coverPath} alt={beatToDownload.title} id={beatToDownload.id} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-content truncate">{beatToDownload.title}</p>
              <p className="text-sm font-bold text-accent">{formatPrice(beatToDownload.price)}</p>
            </div>
            <Download className="w-5 h-5 text-content-secondary" />
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link 
            href="/connexion" 
            className="w-full py-3.5 rounded-xl bg-accent text-white font-semibold text-center hover:bg-accent-hover transition-colors"
          >
            Se connecter
          </Link>
          <Link 
            href="/inscription" 
            className="w-full py-3.5 rounded-xl border-2 border-border text-content font-semibold text-center hover:border-accent hover:text-accent transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}