"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setMessage("✅ " + res.message);
      setTimeout(() => router.push("/connexion"), 2500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage("❌ " + err.message);
      } else {
        setMessage("❌ Erreur lors de la réinitialisation.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return <p className="text-center text-danger p-4 bg-danger/10 rounded-xl">Lien invalide ou incomplet.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && <p className="text-center font-medium p-4 bg-background-secondary rounded-xl">{message}</p>}
      <Input
        label="Nouveau mot de passe"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Input
        label="Confirmer le mot de passe"
        type="password"
        value={passwordConfirmation}
        onChange={(e) => setPasswordConfirmation(e.target.value)}
        required
      />
      <Button type="submit" loading={loading} className="w-full">
        Réinitialiser le mot de passe
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Nouveau mot de passe</h1>
        <Card padding="lg">
          <Suspense fallback={<p className="text-center">Chargement...</p>}>
            <ResetForm />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}