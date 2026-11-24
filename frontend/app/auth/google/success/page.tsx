"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, auth } from "@/lib/api";

function GoogleSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function exchange() {
      const code = searchParams.get("code");

      if (!code) {
        router.push("/connexion?error=no_code");
        return;
      }

      try {
        // On échange le code contre un token Sanctum
        const res = await api.post("/auth/google/exchange", { code });

        if (!res || !res.token) {
          throw new Error("Token manquant dans la réponse.");
        }

        // On stocke le token et on redirige vers le profil
        auth.setToken(res.token);
        window.location.href = "/profil";
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erreur d'authentification");
        setTimeout(() => router.push("/connexion?error=google_failed"), 2000);
      }
    }

    void exchange();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <p className="text-red-500">Erreur : {error}</p>
        ) : (
          <>
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Connexion en cours...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function GoogleSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    }>
      <GoogleSuccessContent />
    </Suspense>
  );
}