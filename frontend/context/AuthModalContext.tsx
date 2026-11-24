"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type AuthModalContextType = {
  isOpen: boolean;
  beatToDownload: { id: number; title: string; coverPath: string | null; price: number } | null;
  openAuthModal: (beat?: { id: number; title: string; coverPath: string | null; price: number }) => void;
  closeAuthModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [beatToDownload, setBeatToDownload] = useState<{ id: number; title: string; coverPath: string | null; price: number } | null>(null);

  const openAuthModal = (beat?: { id: number; title: string; coverPath: string | null; price: number }) => {
    if (beat) setBeatToDownload(beat);
    setIsOpen(true);
  };

  const closeAuthModal = () => {
    setIsOpen(false);
    setTimeout(() => setBeatToDownload(null), 300); // Attendre la fin de l'animation
  };

  return (
    <AuthModalContext.Provider value={{ isOpen, beatToDownload, openAuthModal, closeAuthModal }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal doit être utilisé dans un AuthModalProvider");
  }
  return context;
}