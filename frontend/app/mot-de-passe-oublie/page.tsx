"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.message || "Si votre adresse email existe, un lien vous a été envoyé.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Mot de passe oublié</h1>
        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-content-secondary mb-4">
              Entrez votre adresse email. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
            
            {error && <p className="text-danger text-sm bg-danger/10 p-3 rounded-lg">{error}</p>}
            {message && <p className="text-success text-sm bg-success/10 p-3 rounded-lg">{message}</p>}

            {!message && (
              <>
                <Input
                  label="Adresse email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  required
                />
                
                <Button type="submit" loading={loading} className="w-full">
                  Envoyer le lien
                </Button>
              </>
            )}
            
            <div className="text-center text-sm mt-4">
              <Link href="/connexion" className="text-accent hover:underline">
                Retour à la connexion
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}