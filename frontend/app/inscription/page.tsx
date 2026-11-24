"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Toast from "@/components/ui/Toast";
import AuthLayout from "@/components/auth/AuthLayout";

export default function InscriptionPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      auth.setToken(res.token);
      setShowSuccess(true);

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de l'inscription.");
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {showSuccess && (
        <Toast message="Compte créé avec succès. Bienvenue !" variant="success" onClose={() => setShowSuccess(false)} />
      )}

      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold mb-2 text-content">Rejoins Instrunaka</h1>
        <p className="text-content-secondary">Crée ton compte en quelques secondes et découvre les pépites malgaches.</p>
      </div>

      <div className="glass-card rounded-[32px] p-8 border border-border shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl p-3">
              {error}
            </div>
          )}

          <Input
            label="Nom"
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ton nom"
            required
            autoComplete="name"
          />

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
            placeholder="Au moins 8 caractères"
            required
            autoComplete="new-password"
          />

          <PasswordInput
            label="Confirmer le mot de passe"
            name="password_confirmation"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />

          <Button type="submit" loading={loading} className="w-full py-3.5 rounded-xl text-base font-semibold" size="lg">
            Créer mon compte
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center text-sm">
          <span className="text-content-secondary">Tu as déjà un compte ? </span>
          <Link href="/connexion" className="text-accent font-semibold hover:underline">
            Se connecter
          </Link>
        </div>
      </div>

      <p className="text-xs text-center text-content-secondary mt-6">
        En créant un compte, tu acceptes nos conditions d&apos;utilisation.
      </p>
    </AuthLayout>
  );
}