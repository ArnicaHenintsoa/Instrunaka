"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";

type User = {
  id: number;
  name: string;
  email: string;
  status: string;
  is_producer: boolean;
  role: { name: string; label: string };
  created_at: string;
};

export default function AdminUtilisateursPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/connexion?redirect=/admin/utilisateurs");
      return;
    }

    async function load() {
      try {
        const res = await api.get("/admin/users");
        setUsers(res?.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [router]);

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await api.post(`/admin/users/${id}/toggle-status`);
      setToast({ message: res.message, variant: "success" });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: res.status } : u
        )
      );
    } catch (e: unknown) {
      setToast({
        message: e instanceof Error ? e.message : "Erreur",
        variant: "error",
      });
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-16 text-center">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestion des utilisateurs</h1>
        <p className="text-content-secondary">Consultez et gérez les comptes de la plateforme.</p>
      </div>

      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id} padding="lg">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-lg font-semibold">{user.name}</h2>
                  <Badge variant={user.role.name === "admin" ? "accent" : "default"}>
                    {user.role.label}
                  </Badge>
                  {user.is_producer && <Badge variant="accent">Producteur</Badge>}
                </div>
                <p className="text-sm text-content-secondary">{user.email}</p>
                <p className="text-xs text-content-secondary mt-1">
                  Inscrit le {new Date(user.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={user.status === "active" ? "success" : "danger"}>
                  {user.status === "active" ? "Actif" : "Suspendu"}
                </Badge>
                {user.role.name !== "admin" && (
                  <Button
                    variant={user.status === "active" ? "danger" : "primary"}
                    size="sm"
                    onClick={() => handleToggleStatus(user.id)}
                  >
                    {user.status === "active" ? "Suspendre" : "Réactiver"}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}