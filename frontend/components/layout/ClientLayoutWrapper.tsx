"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import PlayerBar from "@/components/player/PlayerBar";
import HeaderWrapper from "@/components/layout/HeaderWrapper";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isAuthPage = pathname === "/connexion" || pathname === "/inscription" || pathname === "/mot-de-passe-oublie";

  useEffect(() => {
    if (isAuthPage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isAuthPage]);

  if (isAdmin) {
    return (
      <main className="flex-1">
        {children}
        <PlayerBar />
      </main>
    );
  }

  if (isAuthPage) {
    return (
      <main className="h-screen overflow-hidden">
        {children}
      </main>
    );
  }

  return (
    <>
      <HeaderWrapper>
        <Header />
      </HeaderWrapper>
      <main className="flex-1 pb-32 lg:pb-24">
        {children}
      </main>
      <Footer />
      <PlayerBar />
      <MobileNav />
    </>
  );
}