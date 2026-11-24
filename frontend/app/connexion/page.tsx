"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api, auth } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Toast from "@/components/ui/Toast";
import AuthLayout from "@/components/auth/AuthLayout";
import { PLATFORM } from "@/lib/config";

function ConnexionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      if (!res || !res.token) throw new Error("Erreur serveur : Token manquant.");

      auth.setToken(res.token);
      setShowSuccess(true);

      setTimeout(() => {
        router.push(redirectTo);
        router.refresh();
      }, 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Identifiants incorrects.");
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {showSuccess && (
        <Toast message="Connexion réussie. Bienvenue !" variant="success" onClose={() => setShowSuccess(false)} />
      )}

      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold mb-2 text-content">Bon retour !</h1>
        <p className="text-content-secondary">Connecte-toi pour accéder à ton espace {PLATFORM.name}.</p>
      </div>

      <div className="glass-card rounded-[32px] p-8 border border-border shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl p-3">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            required
            autoComplete="email"
          />

          <PasswordInput
            label="Mot de passe"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          <div className="flex justify-end">
            <Link href="/mot-de-passe-oublie" className="text-sm text-accent hover:underline font-medium">
              Mot de passe oublié ?
            </Link>
          </div>

          <Button type="submit" loading={loading} className="w-full py-3.5 rounded-xl text-base font-semibold" size="lg">
            Se connecter
          </Button>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface px-3 text-content-secondary">ou continuer avec</span>
            </div>
          </div>

          <a
            href="http://localhost:8000/api/auth/google/redirect"
            className="mt-4 flex items-center justify-center gap-3 w-full px-5 py-3 bg-background border border-border rounded-xl font-medium text-sm text-content hover:bg-background-secondary transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </a>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center text-sm">
          <span className="text-content-secondary">Pas encore de compte ? </span>
          <Link href="/inscription" className="text-accent font-semibold hover:underline">
            Créer un compte
          </Link>
        </div>
      </div>

      <p className="text-xs text-center text-content-secondary mt-6">
        La connexion est obligatoire pour tout achat ou téléchargement. La consultation reste libre.
      </p>
    </AuthLayout>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-content-secondary">Chargement...</p></div>}>
      <ConnexionContent />
    </Suspense>
  );
}