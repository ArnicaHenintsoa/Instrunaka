import type { Metadata } from "next";
import { Suspense } from "react";
import { Manrope } from "next/font/google";
import "./globals.css";
import LogoutToast from "@/components/layout/LogoutToast";
import PWARegister from "@/components/PWARegister";
import { PlayerProvider } from "@/context/PlayerContext";
import { AuthModalProvider } from "@/context/AuthModalContext";
import AuthModal from "@/components/layout/AuthModal";
import { PLATFORM } from "@/lib/config";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import ScrollProgress from "@/components/ui/ScrollProgress"; // ← AJOUT
import CustomCursor from "@/components/ui/CustomCursor"; // ← AJOUT

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${PLATFORM.fullName} — ${PLATFORM.tagline}`,
  description: PLATFORM.description,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: PLATFORM.name },
  icons: { icon: "/icon-192x192.png", apple: "/icon-192x192.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${manrope.variable} min-h-screen bg-background text-content flex flex-col font-sans antialiased`}>
        <ThemeProvider>
          <ScrollProgress />
          <CustomCursor />
          <AuthModalProvider>
            <PlayerProvider>
              <PWARegister />
              <Suspense fallback={null}>
                <LogoutToast />
              </Suspense>
              <ClientLayoutWrapper>
                {children}
              </ClientLayoutWrapper>
              <AuthModal />
            </PlayerProvider>
          </AuthModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}