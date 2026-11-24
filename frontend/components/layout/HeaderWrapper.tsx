"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function HeaderWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <>
      {children}
      {/* Ajoute un espaceur uniquement si on n'est PAS sur l'accueil, car sur l'accueil le Hero prend la place */}
      {!isHomePage && <div className="h-20" />}
    </>
  );
}